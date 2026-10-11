import "server-only";

/**
 * Het maatje in de database: de teksten per vraag, of het maatje aan staat,
 * en de antwoorden die het niet herkende.
 *
 * Aan of uit kan op twee plekken in beheer: per leerdoel (`leerdoelen.maatje`)
 * en in één keer voor alles (`app_instellingen`, sleutel "maatje"). Staat het
 * algemeen uit, dan is het overal uit; staat het algemeen aan, dan beslist het
 * leerdoel.
 */

import { verbinding } from "@/lib/db/sqlite";
import type { MaatjeTeksten } from "@/lib/maatje/types";

/** Staat het maatje algemeen aan? Standaard wel; de leerdoelen beslissen dan. */
export function maatjeAlgemeenAan(): boolean {
  const rij = verbinding()
    .prepare("select waarde from app_instellingen where sleutel = 'maatje'")
    .get() as { waarde: string } | undefined;
  return rij?.waarde !== "uit";
}

export function zetMaatjeAlgemeen(aan: boolean): void {
  verbinding()
    .prepare(
      `insert into app_instellingen (sleutel, waarde, bijgewerkt_op) values ('maatje', ?, ?)
       on conflict (sleutel) do update set waarde = excluded.waarde, bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(aan ? "aan" : "uit", new Date().toISOString());
}

/** De leerdoelen (uit deze lijst) waarbij het maatje aan staat. */
export function leerdoelenMetMaatje(leerdoelIds: string[]): Set<string> {
  if (leerdoelIds.length === 0 || !maatjeAlgemeenAan()) return new Set();
  const rijen = verbinding()
    .prepare(`select id from leerdoelen where maatje = 1 and id in (${leerdoelIds.map(() => "?").join(",")})`)
    .all(...leerdoelIds) as { id: string }[];
  return new Set(rijen.map((r) => r.id));
}

export function zetMaatjeLeerdoel(leerdoelId: string, aan: boolean): void {
  verbinding().prepare("update leerdoelen set maatje = ? where id = ?").run(aan ? 1 : 0, leerdoelId);
}

/** De nieuwste gecontroleerde teksten per vraag. Vragen zonder teksten ontbreken. */
export function haalMaatjeTeksten(vraagIds: string[]): Record<string, MaatjeTeksten> {
  if (vraagIds.length === 0) return {};
  const rijen = verbinding()
    .prepare(
      `select t.vraag_id, t.teksten from maatje_teksten t
       where t.gecontroleerd = 1 and t.vraag_id in (${vraagIds.map(() => "?").join(",")})
         and t.versie = (select max(versie) from maatje_teksten x
                         where x.vraag_id = t.vraag_id and x.gecontroleerd = 1)`,
    )
    .all(...vraagIds) as { vraag_id: string; teksten: string }[];
  const uit: Record<string, MaatjeTeksten> = {};
  for (const r of rijen) {
    try {
      uit[r.vraag_id] = JSON.parse(r.teksten) as MaatjeTeksten;
    } catch {
      // Een kapotte regel slaan we over; het maatje zwijgt dan bij die vraag.
    }
  }
  return uit;
}

/** Een antwoord dat het maatje niet herkende. Zonder kind: alleen de vraag en wat er stond. */
export function bewaarOnbekendAntwoord(vraagId: string, leerdoelId: string, antwoord: string): void {
  verbinding()
    .prepare("insert into maatje_onbekend (vraag_id, leerdoel_id, antwoord, aangemaakt_op) values (?, ?, ?, ?)")
    .run(vraagId, leerdoelId, antwoord.slice(0, 80), new Date().toISOString());
}

export type MaatjeStand = { leerdoelId: string; opgaven: number; metTekst: number };

/** Per leerdoel: hoeveel gepubliceerde opgaven, en hoeveel daarvan gecontroleerde teksten hebben. */
export function haalMaatjeStand(): Map<string, MaatjeStand> {
  const rijen = verbinding()
    .prepare(
      `select q.leerdoel_id as leerdoelId, count(*) as opgaven,
              sum(case when exists (select 1 from maatje_teksten t where t.vraag_id = q.id and t.gecontroleerd = 1) then 1 else 0 end) as metTekst
       from vragen q where q.status = 'gepubliceerd' group by q.leerdoel_id`,
    )
    .all() as MaatjeStand[];
  /* Gewone objecten: rijen uit SQLite mogen niet zo naar een scherm in de browser. */
  return new Map(rijen.map((r) => [r.leerdoelId, { leerdoelId: r.leerdoelId, opgaven: Number(r.opgaven), metTekst: Number(r.metTekst) }]));
}

/** De laatste onbekende antwoorden, voor in beheer. */
export type OnbekendAntwoord = { vraagId: string; leerdoelId: string; antwoord: string; aangemaaktOp: string; vraagtekst: string | null; leerdoel: string | null };

export function haalOnbekendeAntwoorden(max = 200): OnbekendAntwoord[] {
  const rijen = verbinding()
    .prepare(
      `select o.vraag_id as vraagId, o.leerdoel_id as leerdoelId, o.antwoord, o.aangemaakt_op as aangemaaktOp,
              q.vraagtekst, l.titel as leerdoel
       from maatje_onbekend o
       left join vragen q on q.id = o.vraag_id
       left join leerdoelen l on l.id = o.leerdoel_id
       order by o.id desc limit ?`,
    )
    .all(max) as OnbekendAntwoord[];
  return rijen.map((r) => ({ ...r }));
}
