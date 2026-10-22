import "server-only";

/**
 * Praten met Bliepo: wat de ouder per kind instelt (22 oktober 2026).
 *
 *   - "Praten met Bliepo" aan of uit. Standaard UIT: de ouder zet het zelf aan,
 *     want dan gaat de stem van het kind naar OpenAI om te verstaan wat het
 *     vraagt.
 *   - Hoeveel live vragen per dag: 10, 20, 30 (standaard) of 50. Vooraf
 *     gemaakte hints tellen niet mee.
 *
 * Bewaard in `kind_instellingen`, maar bewust NIET in `KIND_INSTELLINGEN`
 * (lib/data/kindinstellingen.ts): die lijst mag het kind zelf zetten, en dit is
 * een keuze van de ouder.
 */

import { verbinding } from "@/lib/db/sqlite";

export const VRAGEN_PER_DAG = [10, 20, 30, 50] as const;
export const STANDAARD_VRAGEN_PER_DAG = 30;

export type BliepoInstellingen = { praten: boolean; vragenPerDag: number };

export function haalBliepoInstellingen(kindId: string): BliepoInstellingen {
  const rijen = verbinding()
    .prepare("select sleutel, waarde from kind_instellingen where kind_id = ? and sleutel in ('bliepopraten', 'bliepovragen')")
    .all(kindId) as { sleutel: string; waarde: string }[];
  const uit: BliepoInstellingen = { praten: false, vragenPerDag: STANDAARD_VRAGEN_PER_DAG };
  for (const r of rijen) {
    if (r.sleutel === "bliepopraten") uit.praten = r.waarde === "aan";
    if (r.sleutel === "bliepovragen") {
      const n = Number(r.waarde);
      if ((VRAGEN_PER_DAG as readonly number[]).includes(n)) uit.vragenPerDag = n;
    }
  }
  return uit;
}

export function zetBliepoInstellingen(kindId: string, w: BliepoInstellingen): void {
  const zet = verbinding().prepare(
    `insert into kind_instellingen (kind_id, sleutel, waarde, bijgewerkt_op)
     values (?, ?, ?, ?)
     on conflict (kind_id, sleutel) do update set waarde = excluded.waarde, bijgewerkt_op = excluded.bijgewerkt_op`,
  );
  const nu = new Date().toISOString();
  zet.run(kindId, "bliepopraten", w.praten ? "aan" : "uit", nu);
  const n = (VRAGEN_PER_DAG as readonly number[]).includes(w.vragenPerDag) ? w.vragenPerDag : STANDAARD_VRAGEN_PER_DAG;
  zet.run(kindId, "bliepovragen", String(n), nu);
}
