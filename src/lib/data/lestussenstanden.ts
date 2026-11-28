import "server-only";

/**
 * Hoe ver een kind in een les is gekomen (besluit Sara, 28 november 2026): `af` = hoeveel van de les gemaakt is (%) en
 * `percentage` = goed in 1 keer van wat tot dan gemaakt is (rondje op het onderwerpenscherm); `stand` = de gemaakte vragen,
 * zodat het kind bij het terugkomen verdergaat waar het was. Na het afmaken (resultaat bewaard) is `stand` leeg: opnieuw doen
 * begint bij het begin. Een les met een eindresultaat houdt een vol rondje (les_resultaten gaat voor).
 */

import { verbinding } from "@/lib/db/sqlite";
import { goedTotNu, netteStand, type Hervatstand } from "@/lib/hervatstand";

export type Tussenstand = { lesId: string; af: number; percentage: number };

const klem = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function bewaarStand(kindId: string, lesId: string, af: number, stand: Hervatstand, nu: Date = new Date()): void {
  verbinding()
    .prepare(
      `insert into les_tussenstanden (kind_id, les_id, af, percentage, datum, stand) values (?, ?, ?, ?, ?, ?)
       on conflict (kind_id, les_id) do update set af = excluded.af, percentage = excluded.percentage, datum = excluded.datum, stand = excluded.stand`,
    )
    .run(kindId, lesId, klem(af), goedTotNu(stand), nu.toISOString(), JSON.stringify(stand));
}

export function haalStand(kindId: string, lesId: string): Hervatstand | null {
  const r = verbinding().prepare("select stand from les_tussenstanden where kind_id = ? and les_id = ?").get(kindId, lesId) as { stand: string | null } | undefined;
  if (!r?.stand) return null;
  try {
    return netteStand(JSON.parse(r.stand));
  } catch {
    return null;
  }
}

/** Na het afmaken: de volgende keer begint de les bij het begin. De rest van de rij blijft staan. */
export function sluitStand(kindId: string, lesId: string): void {
  verbinding().prepare("update les_tussenstanden set stand = null where kind_id = ? and les_id = ?").run(kindId, lesId);
}

export function haalTussenstanden(kindId: string): Tussenstand[] {
  const rijen = verbinding().prepare("select les_id, af, percentage from les_tussenstanden where kind_id = ?").all(kindId) as { les_id: string; af: number; percentage: number }[];
  return rijen.map((r) => ({ lesId: r.les_id, af: r.af, percentage: r.percentage }));
}
