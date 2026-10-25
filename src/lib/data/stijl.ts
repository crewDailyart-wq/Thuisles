import "server-only";

/**
 * De gekozen stijl bewaren en ophalen (stijlkiezer, /admin/stijl; 24 oktober
 * 2026). Instellingen in app_instellingen, geen content:
 * - "stijl": de stijl die de kinderen nu zien;
 * - "stijl-vorige": de eerdere versies (nieuwste eerst, hooguit 20), voor de
 *   knop "Terug naar vorige versie";
 * - "stijl-themas": de stijlen die de eigenaar als thema heeft opgeslagen.
 */

import { verbinding } from "@/lib/db/sqlite";
import { maakStijl, zelfdeStijl, type Stijl } from "@/lib/stijl";

const SLEUTEL = "stijl";
const VORIGE = "stijl-vorige";
const THEMAS = "stijl-themas";
const MAX_VORIGE = 20;

export type Thema = { naam: string; stijl: Stijl };

function lees(sleutel: string): unknown {
  try {
    const rij = verbinding().prepare("select waarde from app_instellingen where sleutel = ?").get(sleutel) as { waarde: string } | undefined;
    return rij ? JSON.parse(rij.waarde) : null;
  } catch {
    return null;
  }
}

function schrijf(sleutel: string, waarde: unknown): void {
  verbinding()
    .prepare(
      `insert into app_instellingen (sleutel, waarde, bijgewerkt_op)
       values (?, ?, ?)
       on conflict (sleutel) do update set waarde = excluded.waarde,
                                           bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(sleutel, JSON.stringify(waarde), new Date().toISOString());
}

export function haalStijl(): Stijl {
  return maakStijl(lees(SLEUTEL));
}

export function haalVorige(): Stijl[] {
  const r = lees(VORIGE);
  return Array.isArray(r) ? r.map(maakStijl) : [];
}

export function haalThemas(): Thema[] {
  const r = lees(THEMAS);
  if (!Array.isArray(r)) return [];
  return r
    .filter((t): t is { naam: string; stijl: unknown } => !!t && typeof t === "object" && typeof (t as { naam?: unknown }).naam === "string")
    .map((t) => ({ naam: t.naam, stijl: maakStijl(t.stijl) }));
}

/** Bewaar een nieuwe stijl; de stijl van daarvoor gaat naar de vorige versies. */
export function zetStijl(stijl: Stijl): void {
  const nieuw = maakStijl(stijl);
  const nu = haalStijl();
  if (!zelfdeStijl(nu, nieuw)) schrijf(VORIGE, [nu, ...haalVorige()].slice(0, MAX_VORIGE));
  schrijf(SLEUTEL, nieuw);
}

/** Terug naar de vorige versie: die wordt weer de stijl, en gaat van de lijst af. */
export function zetVorigeTerug(): Stijl | null {
  const [vorige, ...rest] = haalVorige();
  if (!vorige) return null;
  schrijf(SLEUTEL, vorige);
  schrijf(VORIGE, rest);
  return vorige;
}

/** Bewaar als thema (een thema met dezelfde naam wordt bijgewerkt). */
export function bewaarThema(naam: string, stijl: Stijl): Thema[] {
  const schoon = naam.trim().slice(0, 40);
  if (!schoon) return haalThemas();
  const themas = haalThemas().filter((t) => t.naam !== schoon);
  const lijst = [...themas, { naam: schoon, stijl: maakStijl(stijl) }];
  schrijf(THEMAS, lijst);
  return lijst;
}
