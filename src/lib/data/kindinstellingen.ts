import "server-only";

/**
 * Voorkeuren van het kind zelf.
 *
 * Nu twee: staat het geluid in het uitlegfilmpje aan, en staat het geluid in de
 * opgave aan. Die stonden in `localStorage` en dus per browser — zette een kind
 * het geluid uit op de tablet, dan stond het op de laptop gewoon weer aan.
 *
 * Bewust sleutel-waarde en geen kolommen op `kinderen`: een voorkeur erbij is
 * dan één regel hier en geen migratie op een tabel waar echte gegevens in
 * staan.
 *
 * Wat hier NIET in hoort: iets over het apparaat, de browser, waar het kind is
 * of wanneer het oefent. Dit zijn voorkeuren, geen profiel.
 */

import { verbinding } from "@/lib/db/sqlite";

/**
 * De voorkeuren die bestaan.
 *
 * Een vaste lijst, en niet "alles wat de browser opstuurt". Een serveractie is
 * een openbaar eindpunt; zonder deze lijst kon iemand er willekeurige sleutels
 * en waarden in schrijven en zo de tabel als vrije opslag gebruiken.
 */
export const KIND_INSTELLINGEN = ["uitleggeluid", "opgavegeluid"] as const;

export type KindInstelling = (typeof KIND_INSTELLINGEN)[number];

export function isKindInstelling(naam: string): naam is KindInstelling {
  return (KIND_INSTELLINGEN as readonly string[]).includes(naam);
}

/** De standaard als het kind nog niets heeft gekozen: geluid aan. */
export type Geluidsvoorkeuren = { uitleg: boolean; opgave: boolean };

const STANDAARD: Geluidsvoorkeuren = { uitleg: true, opgave: true };

/**
 * De geluidsvoorkeuren van dit kind.
 *
 * Staat er niets, dan geldt de standaard. Dat is precies hoe het zich vroeger
 * in de browser gedroeg: alleen een uitdrukkelijke "uit" zet het geluid uit.
 */
export function haalGeluidsvoorkeuren(kindId: string): Geluidsvoorkeuren {
  const rijen = verbinding()
    .prepare("select sleutel, waarde from kind_instellingen where kind_id = ?")
    .all(kindId) as { sleutel: string; waarde: string }[];

  const uit = { ...STANDAARD };
  for (const r of rijen) {
    if (r.sleutel === "uitleggeluid") uit.uitleg = r.waarde !== "uit";
    if (r.sleutel === "opgavegeluid") uit.opgave = r.waarde !== "uit";
  }
  return uit;
}

export function zetKindInstelling(
  kindId: string,
  sleutel: KindInstelling,
  waarde: string,
): void {
  verbinding()
    .prepare(
      `insert into kind_instellingen (kind_id, sleutel, waarde, bijgewerkt_op)
       values (?, ?, ?, ?)
       on conflict (kind_id, sleutel) do update set
         waarde        = excluded.waarde,
         bijgewerkt_op = excluded.bijgewerkt_op`,
    )
    .run(kindId, sleutel, waarde, new Date().toISOString());
}
