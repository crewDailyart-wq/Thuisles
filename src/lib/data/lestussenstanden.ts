import "server-only";

/**
 * Hoe ver een kind in een les is gekomen (besluit Sara, 28 november 2026): `af` = hoeveel van de les gemaakt is (%),
 * `percentage` = goed in 1 keer van wat tot dan gemaakt is (bepaalt de kleur van het rondje). De verste stand blijft staan:
 * begint een kind opnieuw en stopt het eerder, dan wordt het rondje niet leger. Een les met een eindresultaat
 * (les_resultaten) heeft altijd een vol rondje; deze tussenstand telt dan niet meer.
 */

import { verbinding } from "@/lib/db/sqlite";

export type Tussenstand = { lesId: string; af: number; percentage: number };

const klem = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Goed in 1 keer (%) van de vragen die sinds `sinds` in deze les beantwoord zijn; per vraag telt het eerste antwoord. null = nog geen antwoord. */
export function goedSinds(kindId: string, lesId: string, sinds: string): number | null {
  const rijen = verbinding().prepare("select vraag_id, uitkomst from les_uitkomsten where kind_id = ? and les_id = ? and gemaakt_op >= ? order by id").all(kindId, lesId, sinds) as { vraag_id: string; uitkomst: string }[];
  const eerste = new Map<string, string>();
  for (const r of rijen) if (!eerste.has(r.vraag_id)) eerste.set(r.vraag_id, r.uitkomst);
  if (!eerste.size) return null;
  return klem(([...eerste.values()].filter((u) => u === "goed in één keer").length / eerste.size) * 100);
}

export function bewaarTussenstand(kindId: string, lesId: string, af: number, percentage: number, nu: Date = new Date()): void {
  verbinding()
    .prepare(
      `insert into les_tussenstanden (kind_id, les_id, af, percentage, datum) values (?, ?, ?, ?, ?)
       on conflict (kind_id, les_id) do update set af = excluded.af, percentage = excluded.percentage, datum = excluded.datum
       where excluded.af >= les_tussenstanden.af`,
    )
    .run(kindId, lesId, klem(af), klem(percentage), nu.toISOString());
}

export function haalTussenstanden(kindId: string): Tussenstand[] {
  const rijen = verbinding().prepare("select les_id, af, percentage from les_tussenstanden where kind_id = ?").all(kindId) as { les_id: string; af: number; percentage: number }[];
  return rijen.map((r) => ({ lesId: r.les_id, af: r.af, percentage: r.percentage }));
}
