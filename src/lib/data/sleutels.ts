import "server-only";

/**
 * Sleutels: de beloning die het kind bovenaan het scherm ziet.
 *
 * De regel is met opzet zo simpel dat een kind van acht hem in één zin kan
 * navertellen: elk goed antwoord is één sleutel. Geen bonussen voor snelheid,
 * geen strafkorting voor een hint, geen verschil tussen vraagtypen. Wie het
 * goed heeft, krijgt een sleutel — ook als daar eerst uitleg voor nodig was.
 *
 * ---------------------------------------------------------------------------
 * Waarom een grootboek en niet één teller
 * ---------------------------------------------------------------------------
 * Straks komt er een eilandenkaart waar sleutels worden ingewisseld voor
 * schatkisten. Dan moet je twee dingen kunnen: het saldo tonen, en het saldo
 * verlagen. Met alleen een teller lukt dat wel, maar dan is achteraf niet meer
 * te zien waar sleutels vandaan kwamen of waaraan ze opgingen — en juist dat
 * wil je kunnen uitleggen aan een kind dat vraagt waar zijn sleutels gebleven
 * zijn.
 *
 * Daarom staat elke verandering als losse regel in `sleutel_mutaties`, met een
 * reden erbij. Het saldo is de som. Een kist openen wordt straks één regel met
 * een negatief aantal; daar is `besteedSleutels` hieronder alvast de ingang
 * voor. Verder hoeft er voor de kaart niets aan deze laag te veranderen.
 *
 * Dubbel uitbetalen kan niet: het paar (reden, bron_id) is uniek in de
 * database. Wordt dezelfde oefenronde twee keer verstuurd, dan levert dat geen
 * tweede sleutel op voor hetzelfde antwoord.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import type { Sleutelstand } from "@/lib/types";

/** Waarom er sleutels bij of af gingen. Groeit mee met de eilandenkaart. */
export type SleutelReden = "antwoord_goed" | "kist_geopend";

const LEEG: Sleutelstand = { verdiend: 0, uitgegeven: 0, saldo: 0 };

export function haalSleutels(kindId: string): Sleutelstand {
  const rij = verbinding()
    .prepare(
      `select
         coalesce(sum(case when aantal > 0 then aantal else 0 end), 0) as verdiend,
         coalesce(sum(case when aantal < 0 then -aantal else 0 end), 0) as uitgegeven
       from sleutel_mutaties
       where kind_id = ?`,
    )
    .get(kindId) as { verdiend: number; uitgegeven: number } | undefined;

  if (!rij) return LEEG;

  const verdiend = Number(rij.verdiend);
  const uitgegeven = Number(rij.uitgegeven);
  return { verdiend, uitgegeven, saldo: verdiend - uitgegeven };
}

/**
 * Eén sleutel per goed antwoord bijschrijven.
 *
 * `antwoordIds` zijn de antwoorden die goed waren. Ze dienen als bron, zodat
 * hetzelfde antwoord nooit twee keer kan uitbetalen.
 */
export function beloonGoedeAntwoorden(kindId: string, antwoordIds: string[]): void {
  if (antwoordIds.length === 0) return;

  const db = verbinding();
  const invoegen = db.prepare(
    `insert or ignore into sleutel_mutaties
       (id, kind_id, aantal, reden, bron_id, gemaakt_op)
     values (?, ?, 1, 'antwoord_goed', ?, ?)`,
  );

  const nu = new Date().toISOString();
  for (const antwoordId of antwoordIds) {
    invoegen.run(randomUUID(), kindId, antwoordId, nu);
  }
}

/**
 * Sleutels afschrijven. De ingang voor de schatkisten op de eilandenkaart.
 *
 * Geeft `false` terug als er te weinig saldo is; er wordt dan niets
 * weggeschreven. De aanroeper hoort dat te vertalen naar een nette melding —
 * nooit naar een negatief saldo.
 *
 * Nog niet in gebruik: de kaart en de kisten komen later. Het staat hier zodat
 * die later niets aan de opslag hoeven te veranderen, en zodat op één plek
 * staat dat het saldo niet onder nul mag komen.
 */
export function besteedSleutels(
  kindId: string,
  aantal: number,
  reden: SleutelReden,
  bronId: string | null,
): boolean {
  if (aantal <= 0) return false;
  if (haalSleutels(kindId).saldo < aantal) return false;

  verbinding()
    .prepare(
      `insert or ignore into sleutel_mutaties
         (id, kind_id, aantal, reden, bron_id, gemaakt_op)
       values (?, ?, ?, ?, ?, ?)`,
    )
    .run(randomUUID(), kindId, -aantal, reden, bronId, new Date().toISOString());

  return true;
}
