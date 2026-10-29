import "server-only";

/**
 * "Geluidjes in de lessen": wat de ouder per kind instelt (29 oktober 2026).
 *
 * Aan of uit, los van de stem van Bliepo. Standaard AAN: zonder opgeslagen
 * waarde verandert er dus niets. Bewaard in `kind_instellingen` (sleutel
 * `lesgeluidjes`, waarde "aan" of "uit"); er komt alleen een regel bij als de
 * ouder het formulier opslaat. Net als Praten met Bliepo bewust niet in
 * `KIND_INSTELLINGEN`: dit is een keuze van de ouder.
 */

import { verbinding } from "@/lib/db/sqlite";

export function haalLesgeluidjes(kindId: string): boolean {
  const rij = verbinding()
    .prepare("select waarde from kind_instellingen where kind_id = ? and sleutel = 'lesgeluidjes'")
    .get(kindId) as { waarde: string } | undefined;
  return rij ? rij.waarde !== "uit" : true;
}

export function zetLesgeluidjes(kindId: string, aan: boolean): void {
  verbinding()
    .prepare(
      `insert into kind_instellingen (kind_id, sleutel, waarde, bijgewerkt_op)
       values (?, 'lesgeluidjes', ?, ?)
       on conflict (kind_id, sleutel) do update set waarde = excluded.waarde, bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(kindId, aan ? "aan" : "uit", new Date().toISOString());
}
