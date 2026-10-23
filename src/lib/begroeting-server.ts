import "server-only";

/**
 * De begroeting van Bliepo, op de server (23 oktober 2026): welke zin past
 * bij dit kind vandaag, en is het vandaag al begroet? Zie lib/begroeting.ts.
 *
 * Bewaard in `kind_instellingen` (sleutel `bliepogroet`, de datum van de
 * laatste begroeting), zodat Bliepo hooguit één keer per dag begroet, ook op
 * een ander apparaat.
 */

import { verbinding } from "@/lib/db/sqlite";
import { kiesBegroeting, naamZin, type Situatie } from "@/lib/begroeting";
import { maakZin, profielVoor } from "@/lib/stem-server";
import { vandaag } from "@/lib/tutor/gebruik";
import type { Kind } from "@/lib/types";

const SLEUTEL = "bliepogroet";

/** De datum (JJJJ-MM-DD, Nederlandse tijd) van een moment. */
function datumVan(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(d);
}

function uurNu(): number {
  return Number(new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

function laatsteGroet(kindId: string): string | null {
  const rij = verbinding().prepare("select waarde from kind_instellingen where kind_id = ? and sleutel = ?").get(kindId, SLEUTEL) as
    | { waarde: string }
    | undefined;
  return rij?.waarde ?? null;
}

/** Het naamstukje alvast laten maken (op de achtergrond; een fout is niet erg, dan komt het later). */
export function maakNaamStukje(kind: Pick<Kind, "roepnaam" | "groep">): void {
  const zin = naamZin(kind.roepnaam);
  if (zin) void maakZin(zin, profielVoor(kind.groep)).catch(() => {});
}

export type Begroeting = { al: true } | { al: false; situatie: Situatie; zinnen: string[] };

/** `opnieuw`: ook als het kind vandaag al begroet is (testknop ?begroeting=opnieuw). */
export function begroetingVoor(kind: Kind, opnieuw = false): Begroeting {
  const nu = new Date();
  const dag = vandaag();
  const groet = laatsteGroet(kind.id);
  if (groet === dag && !opnieuw) return { al: true };

  const gisteren = datumVan(new Date(nu.getTime() - 86_400_000));
  /* Antwoorden zijn in UTC bewaard; ruim ophalen en daarna per Nederlandse datum tellen. */
  const sinds = new Date(nu.getTime() - 3 * 86_400_000).toISOString();
  const rijen = verbinding()
    .prepare("select gemaakt_op, goed from antwoorden where kind_id = ? and gemaakt_op >= ?")
    .all(kind.id, sinds) as { gemaakt_op: string; goed: number }[];
  const vanGisteren = rijen.filter((r) => datumVan(new Date(r.gemaakt_op)) === gisteren);
  const actief = rijen.some((r) => [gisteren, dag].includes(datumVan(new Date(r.gemaakt_op)))) || groet === gisteren;
  const ooitGeoefend = Boolean(verbinding().prepare("select 1 from antwoorden where kind_id = ? limit 1").get(kind.id));
  const goed = vanGisteren.filter((r) => r.goed).length;

  const { situatie, zin } = kiesBegroeting({
    uur: uurNu(),
    dagnummer: Math.floor(nu.getTime() / 86_400_000),
    eerderGezien: groet !== null || ooitGeoefend,
    gisterenOfVandaagActief: actief,
    gisterenGoed: vanGisteren.length >= 5 && goed / vanGisteren.length >= 0.7,
  });
  const naam = naamZin(kind.roepnaam);
  return { al: false, situatie, zinnen: naam ? [naam, zin] : [zin] };
}

/** Na het afspelen: vandaag niet nog eens begroeten. */
export function markeerBegroet(kindId: string): void {
  verbinding()
    .prepare(
      `insert into kind_instellingen (kind_id, sleutel, waarde, bijgewerkt_op) values (?, ?, ?, ?)
       on conflict (kind_id, sleutel) do update set waarde = excluded.waarde, bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(kindId, SLEUTEL, vandaag(), new Date().toISOString());
}
