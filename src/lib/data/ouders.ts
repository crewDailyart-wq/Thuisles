import "server-only";

/**
 * Het ouderaccount.
 *
 * De ouder is de beheerder: die voegt kinderen toe en kan alles weer weghalen.
 * Er wordt niet meer gevraagd dan hoognodig; zelfs een e-mailadres is nu
 * optioneel.
 *
 * TIJDELIJK GEEN INLOG — zie `src/lib/auth/sessie.ts`. Zolang de site niet
 * online staat is er één ouderaccount, dat vanzelf wordt aangemaakt. De
 * structuur eronder is er al op gebouwd dat er straks meer ouders komen.
 *
 * PRIVACY REVIEW REQUIRED — zie de lijst in de ouderomgeving onder
 * Instellingen. De punten die hier spelen: welke velden echt nodig zijn,
 * hoe lang gegevens blijven staan na verwijderen, en welke verwerkers er
 * straks bij komen (hosting, database, stemdienst).
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import { haalKinderen } from "@/lib/data/kinderen";
import { haalVoortgang } from "@/lib/data/voortgang";
import type { Ouder, Taal } from "@/lib/types";

type Rij = Record<string, string | number | null>;

const TAALCODES: Taal[] = ["nl", "tr", "ar", "pl"];

function alsOuder(r: Rij): Ouder {
  const taal = String(r.taal) as Taal;
  return {
    id: String(r.id),
    email: r.email ? String(r.email) : null,
    weergavenaam: r.weergavenaam ? String(r.weergavenaam) : null,
    taal: TAALCODES.includes(taal) ? taal : "nl",
    aangemaaktOp: String(r.aangemaakt_op),
  };
}

/** E-mailadressen vergelijken we altijd in kleine letters, zonder spaties. */
export function normaliseerEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailDeugt(email: string): boolean {
  // Bewust ruim: één apenstaartje, iets ervoor, en een punt erna.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Lezen
// ---------------------------------------------------------------------------

export function haalOuder(id: string): Ouder | null {
  const rij = verbinding().prepare("select * from ouders where id = ?").get(id) as
    | Rij
    | undefined;
  return rij ? alsOuder(rij) : null;
}

export function haalOuderOpEmail(email: string): Ouder | null {
  const rij = verbinding()
    .prepare("select * from ouders where email = ?")
    .get(normaliseerEmail(email)) as Rij | undefined;
  return rij ? alsOuder(rij) : null;
}

// ---------------------------------------------------------------------------
// Aanmaken
// ---------------------------------------------------------------------------

export function maakOuder(email?: string, weergavenaam?: string): Ouder {
  const id = randomUUID();
  verbinding()
    .prepare(
      `insert into ouders (id, email, weergavenaam, taal, aangemaakt_op)
       values (?, ?, ?, 'nl', ?)`,
    )
    .run(
      id,
      email ? normaliseerEmail(email) : null,
      weergavenaam?.trim() || null,
      new Date().toISOString(),
    );
  return haalOuder(id)!;
}

/**
 * De ouder van deze installatie, of maak hem aan.
 *
 * Zolang er geen inlog is, is er precies één ouderaccount. Is er al een rij,
 * dan is dat hem; zo niet, dan wordt hij hier stilletjes aangemaakt. Er wordt
 * niets verzonnen: het account heeft geen naam en geen e-mailadres tot de
 * gebruiker die zelf invult.
 */
export function haalOfMaakOuder(): Ouder {
  const r = verbinding()
    .prepare("select * from ouders order by aangemaakt_op limit 1")
    .get() as Rij | undefined;
  return r ? alsOuder(r) : maakOuder();
}

/** Het e-mailadres van het account. Nu optioneel; straks de inlognaam. */
export function wijzigEmail(ouderId: string, email: string): void {
  verbinding()
    .prepare("update ouders set email = ? where id = ?")
    .run(email.trim() ? normaliseerEmail(email) : null, ouderId);
}

// ---------------------------------------------------------------------------
// Wijzigen
// ---------------------------------------------------------------------------

export function wijzigTaal(ouderId: string, taal: Taal): void {
  if (!TAALCODES.includes(taal)) return;
  verbinding().prepare("update ouders set taal = ? where id = ?").run(taal, ouderId);
}

export function wijzigWeergavenaam(ouderId: string, naam: string): void {
  verbinding()
    .prepare("update ouders set weergavenaam = ? where id = ?")
    .run(naam.trim() || null, ouderId);
}

// ---------------------------------------------------------------------------
// Verwijderen en meenemen
// ---------------------------------------------------------------------------

/** Het hele account weg: de ouder, alle kinderen, alle antwoorden. Alles. */
export function verwijderOuder(ouderId: string): void {
  const db = verbinding();
  const kinderen = haalKinderen(ouderId);

  db.exec("begin");
  try {
    for (const kind of kinderen) {
      db.prepare("delete from antwoorden where kind_id = ?").run(kind.id);
      db.prepare("delete from leerdoel_voortgang where kind_id = ?").run(kind.id);
    }
    db.prepare("delete from kinderen where ouder_id = ?").run(ouderId);
    db.prepare("delete from ouders where id = ?").run(ouderId);
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
}

/**
 * Alles wat we van dit gezin bewaren, in één bestand.
 *
 * Bewust volledig: als een ouder vraagt wat er over zijn kinderen is
 * vastgelegd, hoort daar geen selectie op te zitten. De kindcode staat er niet
 * in: die bewaren we niet leesbaar, alleen onherleidbaar versleuteld, en dat
 * heeft voor een ouder geen betekenis.
 */
export function exporteerGegevens(ouderId: string) {
  const ouder = haalOuder(ouderId);
  if (!ouder) return null;

  const db = verbinding();
  const kinderen = haalKinderen(ouderId).map((kind) => ({
    roepnaam: kind.roepnaam,
    groep: kind.groep,
    avatar: kind.avatar,
    heeftKindcode: kind.heeftKindcode,
    voortgang: haalVoortgang(kind.id),
    antwoorden: db
      .prepare(
        `select leerdoel_id, goed, uitkomst, foutpatroon, hint_gebruikt,
                uitleg_gebruikt, seconden, gemaakt_op
         from antwoorden where kind_id = ? order by gemaakt_op`,
      )
      .all(kind.id),
  }));

  return {
    gemaaktOp: new Date().toISOString(),
    toelichting:
      "Dit is alles wat Thuisles over jou en je kinderen bewaart. Een kindcode staat er niet in: die wordt niet leesbaar opgeslagen.",
    account: {
      email: ouder.email ?? "niet ingevuld",
      weergavenaam: ouder.weergavenaam,
      taalvoorkeur: ouder.taal,
      aangemaaktOp: ouder.aangemaaktOp,
    },
    kinderen,
  };
}
