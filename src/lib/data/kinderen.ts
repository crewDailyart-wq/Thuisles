import "server-only";

/**
 * Kindprofielen onder een ouderaccount.
 *
 * Twee regels die overal in dit bestand terugkomen:
 *
 *   1. Een kind hoort ALTIJD bij precies één ouder. Elke functie hier vraagt
 *      daarom om een `ouderId` en filtert daarop. Zo kan een ouder nooit bij
 *      het profiel van een ander gezin, ook niet door met een id te knoeien.
 *   2. Dataminimalisatie. Een kind heeft een roepnaam, een groep en een
 *      avatar. Geen achternaam, geen e-mailadres, geen geboortedatum.
 */

import { randomUUID } from "node:crypto";
import { isAvatar, STANDAARD_AVATAR } from "@/lib/avatars";
import { klopt, maakHash } from "@/lib/auth/geheimen";
import { verbinding } from "@/lib/db/sqlite";
import type { Groep, Kind, PictogramNaam } from "@/lib/types";

type Rij = Record<string, string | number | null>;

function alsKind(r: Rij): Kind {
  const avatar = String(r.avatar);
  return {
    id: String(r.id),
    ouderId: String(r.ouder_id),
    roepnaam: String(r.roepnaam),
    groep: Number(r.groep) as Groep,
    avatar: (isAvatar(avatar) ? avatar : STANDAARD_AVATAR) as PictogramNaam,
    heeftKindcode: Boolean(r.kindcode_hash),
  };
}

// ---------------------------------------------------------------------------
// Lezen
// ---------------------------------------------------------------------------

export function haalKinderen(ouderId: string): Kind[] {
  const rijen = verbinding()
    .prepare(
      "select * from kinderen where ouder_id = ? order by aangemaakt_op, roepnaam",
    )
    .all(ouderId) as Rij[];
  return rijen.map(alsKind);
}

/** Eén kind, maar alleen als het écht van deze ouder is. */
export function haalKindVanOuder(ouderId: string, kindId: string): Kind | null {
  const rij = verbinding()
    .prepare("select * from kinderen where id = ? and ouder_id = ?")
    .get(kindId, ouderId) as Rij | undefined;
  return rij ? alsKind(rij) : null;
}

// ---------------------------------------------------------------------------
// Controleren
// ---------------------------------------------------------------------------

export type Kindgegevens = {
  roepnaam: string;
  groep: number;
  avatar: string;
  /** Leeg betekent: geen kindcode. Anders precies vier cijfers. */
  kindcode?: string;
};

/** Geeft een foutmelding in gewone taal terug, of null als alles klopt. */
export function controleerKind(g: Kindgegevens): string | null {
  const roepnaam = g.roepnaam.trim();
  if (roepnaam.length === 0) return "Vul een roepnaam in.";
  if (roepnaam.length > 40) return "Die roepnaam is te lang (maximaal 40 tekens).";
  if (!Number.isInteger(g.groep) || g.groep < 3 || g.groep > 8) {
    return "Kies een groep tussen 3 en 8.";
  }
  if (!isAvatar(g.avatar)) return "Kies een avatar uit de lijst.";
  if (g.kindcode && !/^\d{4}$/.test(g.kindcode)) {
    return "Een kindcode bestaat uit precies vier cijfers, of je laat hem leeg.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Schrijven
// ---------------------------------------------------------------------------

export function maakKind(ouderId: string, g: Kindgegevens): Kind {
  const id = randomUUID();
  verbinding()
    .prepare(
      `insert into kinderen
         (id, ouder_id, roepnaam, groep, avatar, kindcode_hash, aangemaakt_op)
       values (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      ouderId,
      g.roepnaam.trim(),
      g.groep,
      g.avatar,
      g.kindcode ? maakHash(g.kindcode) : null,
      new Date().toISOString(),
    );
  return haalKindVanOuder(ouderId, id)!;
}

/**
 * Wijzigt een profiel. De groep mag altijd veranderen — bijvoorbeeld bij de
 * overgang naar de volgende groep. De voortgang blijft daarbij gewoon staan:
 * die hangt aan het leerdoel, niet aan de groep.
 *
 * `kindcode` heeft drie betekenissen:
 *   undefined -> laat staan zoals hij is
 *   ""        -> haal de kindcode weg
 *   "1234"    -> zet deze nieuwe code
 */
export function wijzigKind(
  ouderId: string,
  kindId: string,
  g: Kindgegevens,
): boolean {
  const bestaat = haalKindVanOuder(ouderId, kindId);
  if (!bestaat) return false;

  const db = verbinding();
  db.prepare(
    `update kinderen set roepnaam = ?, groep = ?, avatar = ?
     where id = ? and ouder_id = ?`,
  ).run(g.roepnaam.trim(), g.groep, g.avatar, kindId, ouderId);

  if (g.kindcode !== undefined) {
    db.prepare("update kinderen set kindcode_hash = ? where id = ? and ouder_id = ?").run(
      g.kindcode ? maakHash(g.kindcode) : null,
      kindId,
      ouderId,
    );
  }
  return true;
}

/**
 * Verwijdert een kindprofiel en alles wat eraan hangt.
 *
 * De antwoorden en de voortgang worden hier met de hand meegenomen. In het
 * Postgres-ontwerp (db/schema.sql) doet een foreign key met `on delete
 * cascade` dat automatisch; SQLite kan die verwijzing niet meer toevoegen aan
 * tabellen die er al waren. Het effect moet hetzelfde zijn: alles weg.
 */
export function verwijderKind(ouderId: string, kindId: string): boolean {
  const kind = haalKindVanOuder(ouderId, kindId);
  if (!kind) return false;

  const db = verbinding();
  db.exec("begin");
  try {
    db.prepare("delete from antwoorden where kind_id = ?").run(kindId);
    db.prepare("delete from leerdoel_voortgang where kind_id = ?").run(kindId);
    db.prepare("delete from kinderen where id = ? and ouder_id = ?").run(kindId, ouderId);
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
  return true;
}

/**
 * Controleert de kindcode bij het kiezen van een profiel.
 *
 * Heeft een kind geen code, dan mag het profiel gewoon open. Dit is een
 * drempel tussen broers en zussen, geen beveiliging: de echte grens ligt bij
 * het ouderaccount.
 */
export function kindcodeKlopt(ouderId: string, kindId: string, code: string): boolean {
  const rij = verbinding()
    .prepare("select kindcode_hash from kinderen where id = ? and ouder_id = ?")
    .get(kindId, ouderId) as { kindcode_hash: string | null } | undefined;
  if (!rij) return false;
  if (!rij.kindcode_hash) return true;
  return klopt(code, rij.kindcode_hash);
}
