import "server-only";

/**
 * Rekenmethodes en hun blokken.
 *
 * Dit is de AFSTEMMINGSLAAG en niets meer: een naam, een uitgever, en per
 * groep de volgorde van de blokken met de Thuisles-leerdoelen die daarbij
 * horen. Er staat geen inhoud uit een methode in — geen opgaven, geen teksten,
 * geen uitleg, geen beeld.
 *
 * LEGAL REVIEW REQUIRED zodra hier iets bijkomt dat verder gaat dan een naam
 * in tekst: logo's, omslagen, huisstijl of materiaal van een uitgever mogen
 * hier niet in, en ook niet op het scherm.
 */

import { randomUUID } from "node:crypto";
import { verbinding } from "@/lib/db/sqlite";
import type { Groep, MethodeBlok, Rekenmethode } from "@/lib/types";

type Rij = Record<string, string | number | null>;

function alsMethode(r: Rij): Rekenmethode {
  return {
    id: String(r.id),
    naam: String(r.naam),
    uitgever: String(r.uitgever ?? ""),
    actief: Number(r.actief) === 1,
  };
}

/**
 * De vaste zin die onder ELKE methodevermelding hoort, ook in de admin.
 *
 * Staat hier zodat hij op één plek wordt onderhouden en overal gelijk is.
 */
export function nietVerbondenZin(methode: Rekenmethode | null): string {
  const wie = methode
    ? [methode.uitgever, methode.naam].filter(Boolean).join(" / ")
    : "de uitgever of de methode";
  return `Thuisles is niet verbonden aan ${wie}. De oefeningen zijn van Thuisles zelf; de methode wordt alleen gebruikt om de volgorde af te stemmen.`;
}

// ---------------------------------------------------------------------------
// Methodes
// ---------------------------------------------------------------------------

export function haalMethodes(alleenActief = false): Rekenmethode[] {
  const rijen = verbinding()
    .prepare(
      `select * from rekenmethodes ${alleenActief ? "where actief = 1" : ""}
       order by naam`,
    )
    .all() as Rij[];
  return rijen.map(alsMethode);
}

export function haalMethode(id: string): Rekenmethode | null {
  const r = verbinding()
    .prepare("select * from rekenmethodes where id = ?")
    .get(id) as Rij | undefined;
  return r ? alsMethode(r) : null;
}

export function maakMethode(naam: string, uitgever: string): Rekenmethode | null {
  const schoon = naam.trim();
  if (!schoon) return null;

  const bestaat = verbinding()
    .prepare("select id from rekenmethodes where lower(naam) = lower(?)")
    .get(schoon) as { id: string } | undefined;
  if (bestaat) return null;

  const id = randomUUID();
  verbinding()
    .prepare(
      `insert into rekenmethodes (id, naam, uitgever, actief, aangemaakt_op)
       values (?, ?, ?, 1, ?)`,
    )
    .run(id, schoon, uitgever.trim(), new Date().toISOString());
  return haalMethode(id);
}

export function wijzigMethode(
  id: string,
  naam: string,
  uitgever: string,
  actief: boolean,
): boolean {
  const schoon = naam.trim();
  if (!schoon) return false;

  verbinding()
    .prepare("update rekenmethodes set naam = ?, uitgever = ?, actief = ? where id = ?")
    .run(schoon, uitgever.trim(), actief ? 1 : 0, id);
  return true;
}

/**
 * Een methode verwijderen kan alleen als er niets meer aan hangt.
 *
 * Anders zou een kind ineens zonder methode zitten, of zou een verificatie
 * naar het niets wijzen.
 */
export function magMethodeWeg(id: string): string | null {
  const db = verbinding();
  const kinderen = db
    .prepare("select count(*) as n from kind_school where methode_id = ?")
    .get(id) as { n: number };
  if (Number(kinderen.n) > 0) {
    return `Er ${Number(kinderen.n) === 1 ? "is 1 kind" : `zijn ${kinderen.n} kinderen`} aan deze methode gekoppeld.`;
  }

  const scholen = db
    .prepare("select count(*) as n from school_verificatie where methode_id = ?")
    .get(id) as { n: number };
  if (Number(scholen.n) > 0) {
    return `Deze methode is bij ${scholen.n} school of scholen geverifieerd.`;
  }
  return null;
}

export function verwijderMethode(id: string): boolean {
  if (magMethodeWeg(id)) return false;
  verbinding().prepare("delete from rekenmethodes where id = ?").run(id);
  return true;
}

// ---------------------------------------------------------------------------
// Blokken
// ---------------------------------------------------------------------------

export type Blok = {
  id: string;
  methodeId: string;
  groep: Groep;
  nummer: number;
  titel: string;
  /** De Thuisles-leerdoelen die bij dit blok horen. */
  leerdoelIds: string[];
};

export function haalBlokken(methodeId: string, groep?: number): Blok[] {
  const db = verbinding();
  const rijen = db
    .prepare(
      `select * from methode_blokken
       where methode_id = ? ${groep ? "and groep = ?" : ""}
       order by groep, nummer`,
    )
    .all(...(groep ? [methodeId, groep] : [methodeId])) as Rij[];

  const koppelingen = db
    .prepare(
      `select bl.blok_id, bl.leerdoel_id from blok_leerdoelen bl
       join methode_blokken b on b.id = bl.blok_id
       where b.methode_id = ?
       order by bl.volgorde`,
    )
    .all(methodeId) as { blok_id: string; leerdoel_id: string }[];

  return rijen.map((r) => ({
    id: String(r.id),
    methodeId: String(r.methode_id),
    groep: Number(r.groep) as Groep,
    nummer: Number(r.nummer),
    titel: String(r.titel),
    leerdoelIds: koppelingen
      .filter((k) => k.blok_id === String(r.id))
      .map((k) => k.leerdoel_id),
  }));
}

export function maakBlok(
  methodeId: string,
  groep: number,
  titel: string,
): string | null {
  const schoon = titel.trim();
  if (!schoon || groep < 3 || groep > 8) return null;

  const db = verbinding();
  // Het volgende nummer binnen deze groep, zodat de volgorde vanzelf klopt.
  const laatste = db
    .prepare(
      "select max(nummer) as n from methode_blokken where methode_id = ? and groep = ?",
    )
    .get(methodeId, groep) as { n: number | null };

  const id = randomUUID();
  db.prepare(
    "insert into methode_blokken (id, methode_id, groep, nummer, titel) values (?, ?, ?, ?, ?)",
  ).run(id, methodeId, groep, Number(laatste.n ?? 0) + 1, schoon);
  return id;
}

export function wijzigBlok(blokId: string, titel: string): boolean {
  const schoon = titel.trim();
  if (!schoon) return false;
  verbinding()
    .prepare("update methode_blokken set titel = ? where id = ?")
    .run(schoon, blokId);
  return true;
}

/**
 * Verwijdert een blok en schuift de nummers erna een plek op, zodat er nooit
 * een gat in de volgorde valt.
 */
export function verwijderBlok(blokId: string): boolean {
  const db = verbinding();
  const blok = db
    .prepare("select methode_id, groep, nummer from methode_blokken where id = ?")
    .get(blokId) as { methode_id: string; groep: number; nummer: number } | undefined;
  if (!blok) return false;

  db.exec("begin");
  try {
    db.prepare("delete from methode_blokken where id = ?").run(blokId);
    db.prepare(
      `update methode_blokken set nummer = nummer - 1
       where methode_id = ? and groep = ? and nummer > ?`,
    ).run(blok.methode_id, blok.groep, blok.nummer);
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
  return true;
}

/** Verwisselt een blok met zijn buurman, zodat de volgorde te ordenen is. */
export function verplaatsBlok(blokId: string, richting: "op" | "neer"): boolean {
  const db = verbinding();
  const blok = db
    .prepare("select methode_id, groep, nummer from methode_blokken where id = ?")
    .get(blokId) as { methode_id: string; groep: number; nummer: number } | undefined;
  if (!blok) return false;

  const doel = blok.nummer + (richting === "op" ? -1 : 1);
  const buur = db
    .prepare(
      "select id from methode_blokken where methode_id = ? and groep = ? and nummer = ?",
    )
    .get(blok.methode_id, blok.groep, doel) as { id: string } | undefined;
  if (!buur) return false;

  db.exec("begin");
  try {
    // Even naar 0 parkeren: anders botst het op de unieke combinatie.
    db.prepare("update methode_blokken set nummer = 0 where id = ?").run(blokId);
    db.prepare("update methode_blokken set nummer = ? where id = ?").run(
      blok.nummer,
      buur.id,
    );
    db.prepare("update methode_blokken set nummer = ? where id = ?").run(doel, blokId);
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
  return true;
}

/** Zet in één keer vast welke leerdoelen bij dit blok horen. */
export function koppelLeerdoelen(blokId: string, leerdoelIds: string[]): void {
  const db = verbinding();
  db.exec("begin");
  try {
    db.prepare("delete from blok_leerdoelen where blok_id = ?").run(blokId);
    const invoegen = db.prepare(
      "insert or ignore into blok_leerdoelen (blok_id, leerdoel_id, volgorde) values (?, ?, ?)",
    );
    leerdoelIds.forEach((id, i) => invoegen.run(blokId, id, i));
    db.exec("commit");
  } catch (fout) {
    db.exec("rollback");
    throw fout;
  }
}

/**
 * De blokken van een kind, met per blok waar het kind is.
 *
 * De status komt UITSLUITEND uit wat de ouder of het kind heeft aangegeven bij
 * "waar is de klas nu?". Thuisles schat dat nooit zelf in: blokken vóór het
 * huidige zijn voltooid, het huidige is bezig, de rest is nog dicht. Is er
 * niets aangegeven, dan staat het eerste blok open en de rest niet.
 */
export function blokkenVoorKind(
  methodeId: string,
  groep: number,
  huidigBlokId: string | null,
): MethodeBlok[] {
  const blokken = haalBlokken(methodeId, groep);
  if (blokken.length === 0) return [];

  const huidigIndex = huidigBlokId
    ? blokken.findIndex((b) => b.id === huidigBlokId)
    : 0;
  const grens = huidigIndex >= 0 ? huidigIndex : 0;

  return blokken.map((b, i) => ({
    id: b.id,
    methodeId: b.methodeId,
    groep: b.groep,
    nummer: b.nummer,
    titel: b.titel,
    status: i < grens ? "voltooid" : i === grens ? "bezig" : "gesloten",
  }));
}
