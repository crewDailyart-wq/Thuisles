import "server-only";

/**
 * De gekozen stijl bewaren en ophalen (stijlkiezer, /admin/stijl; 24 oktober
 * 2026). Een instelling in app_instellingen (sleutel "stijl"), geen content.
 */

import { verbinding } from "@/lib/db/sqlite";
import { maakStijl, type Stijl } from "@/lib/stijl";

const SLEUTEL = "stijl";

export function haalStijl(): Stijl {
  try {
    const rij = verbinding().prepare("select waarde from app_instellingen where sleutel = ?").get(SLEUTEL) as { waarde: string } | undefined;
    return maakStijl(rij ? JSON.parse(rij.waarde) : null);
  } catch {
    return maakStijl(null);
  }
}

export function zetStijl(stijl: Stijl): void {
  verbinding()
    .prepare(
      `insert into app_instellingen (sleutel, waarde, bijgewerkt_op)
       values (?, ?, ?)
       on conflict (sleutel) do update set waarde = excluded.waarde,
                                           bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(SLEUTEL, JSON.stringify(maakStijl(stijl)), new Date().toISOString());
}
