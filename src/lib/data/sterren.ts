import "server-only";

/**
 * Sterren in de gouden lessen (besluit Sara, 21 november 2026). De ster is voor het AFMAKEN van een les; sterren worden
 * later gebruikt in de shop (die is er nog niet). Per kind en les bestaat de ster maar 1 keer: een les opnieuw spelen
 * geeft geen dubbele ster (primaire sleutel in `les_sterren`). Later kan er 1 extra ster bij ('herhaling') als het kind
 * het onderwerp in een herhaling goed doet; die herhaling is er nog niet, de ruimte in de tabel wel.
 */

import { verbinding } from "@/lib/db/sqlite";

export type SterSoort = "afgemaakt" | "herhaling";

/** Geeft true als er nu echt een nieuwe ster bij kwam (niet bij opnieuw spelen). */
export function beloonSter(kindId: string, lesId: string, soort: SterSoort = "afgemaakt"): boolean {
  const r = verbinding()
    .prepare("insert or ignore into les_sterren (kind_id, les_id, soort, gemaakt_op) values (?, ?, ?, ?)")
    .run(kindId, lesId, soort, new Date().toISOString());
  return r.changes > 0;
}

/** Het aantal sterren van het kind, en of de ster van deze les al verdiend is. */
export function haalSterren(kindId: string, lesId?: string): { aantal: number; dezeLesVerdiend: boolean } {
  const d = verbinding();
  const { n } = d.prepare("select count(*) as n from les_sterren where kind_id = ?").get(kindId) as { n: number };
  const dezeLesVerdiend = lesId ? !!d.prepare("select 1 from les_sterren where kind_id = ? and les_id = ? and soort = 'afgemaakt'").get(kindId, lesId) : false;
  return { aantal: Number(n), dezeLesVerdiend };
}
