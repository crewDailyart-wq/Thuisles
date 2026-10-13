/**
 * Werkbladen en posters: gratis te downloaden op de openbare site.
 *
 * Er komt hier alleen iets in wat de beheerder zelf uploadt (Beheer →
 * Werkbladen). Een nieuw werkblad staat uit tot het daar wordt aangezet; de
 * openbare pagina en het menu verschijnen pas als er minstens één aan staat.
 *
 * Het bestand staat op schijf, net als de afbeeldingen bij vragen:
 *   - op de laptop in public/werkbladen (en dus in Git, als back-up);
 *   - online op de vaste schijf (/data/werkbladen), zodat een upload een
 *     nieuwe versie van de site overleeft. scripts/start.mjs zet de bestanden
 *     uit de code daar bij, zonder iets te overschrijven.
 * Geleverd door app/(site)/werkbladen/bestand/[naam]/route.ts.
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { verbinding } from "@/lib/db/sqlite";

export const WERKBLADEN_MAP =
  process.env.THUISLES_WERKBLADEN ??
  (process.env.THUISLES_AFBEELDINGEN
    ? path.join(path.dirname(process.env.THUISLES_AFBEELDINGEN), "werkbladen")
    : path.join(process.cwd(), "public", "werkbladen"));

export const WERKBLAD_SOORTEN = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
} as const;

/** Serveracties nemen tot 8 MB aan (next.config.ts); 7 MB laat ruimte voor de rest van het formulier. */
export const MAX_WERKBLAD_MB = 7;

export type Werkblad = {
  id: string;
  titel: string;
  omschrijving: string;
  soort: "werkblad" | "poster";
  vak: string;
  groepen: string;
  bestand: string;
  zichtbaar: boolean;
  aangemaaktOp: string;
};

type Rij = Record<string, unknown>;

function alsWerkblad(r: Rij): Werkblad {
  return {
    id: String(r.id),
    titel: String(r.titel),
    omschrijving: String(r.omschrijving ?? ""),
    soort: r.soort === "poster" ? "poster" : "werkblad",
    vak: String(r.vak ?? ""),
    groepen: String(r.groepen ?? ""),
    bestand: String(r.bestand),
    zichtbaar: Number(r.zichtbaar) === 1,
    aangemaaktOp: String(r.aangemaakt_op),
  };
}

/** Alles, voor beheer. Nieuwste eerst. */
export function alleWerkbladen(): Werkblad[] {
  return (verbinding().prepare("select * from werkbladen order by aangemaakt_op desc").all() as Rij[]).map(
    alsWerkblad,
  );
}

/** Wat aan staat, voor de openbare pagina. Op vak, dan op titel. */
export function zichtbareWerkbladen(): Werkblad[] {
  return (
    verbinding()
      .prepare("select * from werkbladen where zichtbaar = 1 order by vak, titel")
      .all() as Rij[]
  ).map(alsWerkblad);
}

/**
 * Hoeveel er aan staan. Zonder database (zoals op het Vercel-voorbeeld) is
 * dat gewoon 0: dan verschijnt er niets.
 */
export function aantalZichtbareWerkbladen(): number {
  try {
    const r = verbinding().prepare("select count(*) as n from werkbladen where zichtbaar = 1").get() as Rij;
    return Number(r.n) || 0;
  } catch {
    return 0;
  }
}

export function extensieVanWerkblad(naam: string): keyof typeof WERKBLAD_SOORTEN | null {
  const e = path.extname(naam).slice(1).toLowerCase();
  return e in WERKBLAD_SOORTEN ? (e as keyof typeof WERKBLAD_SOORTEN) : null;
}

/** Een veilige bestandsnaam: alleen letters, cijfers, punt, streep, laag streepje. */
function veiligeNaam(titel: string, extensie: string): string {
  const stam =
    titel
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "werkblad";
  return `${stam}-${randomUUID().slice(0, 8)}.${extensie}`;
}

export type WerkbladInvoer = {
  titel: string;
  omschrijving: string;
  soort: string;
  vak: string;
  groepen: string;
};

export function controleerWerkblad(invoer: WerkbladInvoer, bestand: File | null): string | null {
  if (!invoer.titel.trim()) return "Geef het werkblad een titel.";
  if (invoer.soort !== "werkblad" && invoer.soort !== "poster") return "Kies of het een werkblad of een poster is.";
  if (!bestand || bestand.size === 0) return "Kies een bestand.";
  if (!extensieVanWerkblad(bestand.name)) return "Alleen PDF, PNG, JPG of WEBP.";
  if (bestand.size > MAX_WERKBLAD_MB * 1024 * 1024) return `Het bestand is groter dan ${MAX_WERKBLAD_MB} MB.`;
  return null;
}

/** Bewaart het bestand en de gegevens. Staat daarna uit. */
export async function bewaarWerkblad(invoer: WerkbladInvoer, bestand: File): Promise<Werkblad> {
  const extensie = extensieVanWerkblad(bestand.name)!;
  const naam = veiligeNaam(invoer.titel, extensie);
  fs.mkdirSync(WERKBLADEN_MAP, { recursive: true });
  fs.writeFileSync(path.join(WERKBLADEN_MAP, naam), Buffer.from(await bestand.arrayBuffer()));
  const id = randomUUID();
  verbinding()
    .prepare(
      `insert into werkbladen (id, titel, omschrijving, soort, vak, groepen, bestand, zichtbaar, aangemaakt_op)
       values (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .run(
      id,
      invoer.titel.trim(),
      invoer.omschrijving.trim(),
      invoer.soort,
      invoer.vak.trim(),
      invoer.groepen.trim(),
      naam,
      new Date().toISOString(),
    );
  return alleWerkbladen().find((w) => w.id === id)!;
}

export function zetWerkbladZichtbaar(id: string, zichtbaar: boolean): void {
  verbinding().prepare("update werkbladen set zichtbaar = ? where id = ?").run(zichtbaar ? 1 : 0, id);
}

/** Haalt een werkblad weg, met het bestand. Alleen vanuit beheer, na bevestigen. */
export function verwijderWerkblad(id: string): void {
  const r = verbinding().prepare("select bestand from werkbladen where id = ?").get(id) as Rij | undefined;
  if (!r) return;
  verbinding().prepare("delete from werkbladen where id = ?").run(id);
  const naam = String(r.bestand);
  if (/^[a-z0-9.-]+$/.test(naam)) fs.rmSync(path.join(WERKBLADEN_MAP, naam), { force: true });
}
