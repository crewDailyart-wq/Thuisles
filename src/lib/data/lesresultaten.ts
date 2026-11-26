import "server-only";

/**
 * Het resultaat van een les per kind: kleur, percentage, denkfouten, datum (besluit Sara, 26 november 2026).
 * Een herhaling kan de kleur alleen verbeteren (zelfde of hoger percentage overschrijft; lager laat het resultaat staan).
 * Krijgt een kaart in een herhaling de beste kleur, dan komt de tweede ster ('herhaling') erbij; zie `bewaarResultaat`.
 */

import { verbinding } from "@/lib/db/sqlite";
import { BESTE_VANAF, herhaalTekenNodig, kleurVoorPercentage } from "@/lib/les-kleuren";
import { beloonSter } from "@/lib/data/sterren";

export type LesResultaat = { lesId: string; kleur: string; percentage: number; denkfouten: string[]; datum: string };

type Rij = { les_id: string; kleur: string; percentage: number; denkfouten: string; datum: string };

function naarResultaat(r: Rij): LesResultaat {
  let denk: string[] = [];
  try {
    const d = JSON.parse(r.denkfouten);
    if (Array.isArray(d)) denk = d.map(String);
  } catch {
    /* kapotte tekst: lege lijst */
  }
  return { lesId: r.les_id, kleur: r.kleur, percentage: r.percentage, denkfouten: denk, datum: r.datum };
}

export function bewaarResultaat(kindId: string, lesId: string, percentage: number, denkfouten: string[], nu: Date = new Date()): { kleur: string; herhaling: boolean; nieuweHerhalingsster: boolean } {
  const d = verbinding();
  const p = Math.max(0, Math.min(100, Math.round(percentage)));
  const kleur = kleurVoorPercentage(p).naam;
  const oud = d.prepare("select les_id, kleur, percentage, denkfouten, datum from les_resultaten where kind_id = ? and les_id = ?").get(kindId, lesId) as Rij | undefined;
  const lijst = JSON.stringify(denkfouten.slice(0, 200).map((x) => String(x).slice(0, 80)));
  if (!oud) {
    d.prepare("insert into les_resultaten (kind_id, les_id, kleur, percentage, denkfouten, datum) values (?, ?, ?, ?, ?, ?)").run(kindId, lesId, kleur, p, lijst, nu.toISOString());
    return { kleur, herhaling: false, nieuweHerhalingsster: false };
  }
  /* Een herhaling: de beste kleur voor het eerst gehaald = de tweede ster. */
  const nieuweHerhalingsster = oud.percentage < BESTE_VANAF && p >= BESTE_VANAF ? beloonSter(kindId, lesId, "herhaling") : false;
  if (p >= oud.percentage) {
    d.prepare("update les_resultaten set kleur = ?, percentage = ?, denkfouten = ?, datum = ? where kind_id = ? and les_id = ?").run(kleur, p, lijst, nu.toISOString(), kindId, lesId);
    return { kleur, herhaling: true, nieuweHerhalingsster };
  }
  /* Lager: het resultaat blijft staan, alleen de datum schuift door (de herhaling is gedaan). */
  d.prepare("update les_resultaten set datum = ? where kind_id = ? and les_id = ?").run(nu.toISOString(), kindId, lesId);
  return { kleur: oud.kleur, herhaling: true, nieuweHerhalingsster };
}

/** Alle resultaten van het kind, met of de kaart nu een herhaal-teken krijgt. */
export function haalResultaten(kindId: string, nu: Date = new Date()): (LesResultaat & { herhalen: boolean })[] {
  const rijen = verbinding().prepare("select les_id, kleur, percentage, denkfouten, datum from les_resultaten where kind_id = ?").all(kindId) as Rij[];
  return rijen.map((r) => ({ ...naarResultaat(r), herhalen: herhaalTekenNodig(r.kleur, r.datum, nu) }));
}
