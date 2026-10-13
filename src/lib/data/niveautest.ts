/**
 * De gratis niveautest op de openbare site.
 *
 * Per groep stelt de beheerder in Beheer → Niveautest de toets samen: een
 * rijtje onderdelen, elk een bestaand leerdoel met een aantal vragen en
 * eventueel het referentieniveau (1F, 2F, 1S) waar het bij hoort. De vragen
 * zelf zijn de gepubliceerde vragen van dat leerdoel; hier wordt niets
 * aangemaakt of aangevuld. Een groep zonder onderdelen heeft geen toets, en
 * zolang geen enkele groep er een heeft, staat de niveautest nergens op de site.
 *
 * Er wordt niets bewaard van wie de toets maakt: geen antwoorden, geen
 * uitslag. Het nakijken gebeurt in de browser (Toetsspeler).
 */

import { randomUUID } from "node:crypto";
import { cache } from "react";
import { verbinding } from "@/lib/db/sqlite";
import { bestaatAfbeelding } from "@/lib/data/afbeeldingen";
import { haalGepubliceerdeVragen, haalLeerdoelen, type LeerdoelRegel } from "@/lib/data/vragen";
import { isGodotfiguur } from "@/lib/godot/figuren";
import type { OefenVraag, VraagInContext } from "@/lib/vraagtypes";

export const TOETSGROEPEN = [3, 4, 5, 6, 7, 8] as const;
export const TOETSNIVEAUS = ["1F", "2F", "1S"] as const;
export type Toetsniveau = (typeof TOETSNIVEAUS)[number] | "";

/** Grenzen van het aantal vragen per onderdeel; ook in de tabel vastgelegd. */
export const MIN_AANTAL = 1;
export const MAX_AANTAL = 10;

export type Toetsonderdeel = {
  id: string;
  groep: number;
  leerdoelId: string;
  aantal: number;
  niveau: Toetsniveau;
  volgorde: number;
  leerdoelCode: string;
  leerdoelTitel: string;
  domeinNaam: string;
  subdomeinNaam: string;
  vakNaam: string;
  /** Hoeveel gepubliceerde vragen van dit leerdoel in de toets kunnen. */
  bruikbaar: number;
};

/** Een vraag in de toets, met het onderdeel waar hij bij hoort. */
export type Toetsvraag = OefenVraag & { onderdeelId: string };

export type Toets = {
  groep: number;
  onderdelen: { id: string; titel: string; niveau: Toetsniveau; aantal: number }[];
  vragen: Toetsvraag[];
};

/*
  Welke vragen in de toets passen.

  De toets gebruikt dezelfde antwoordvelden als de oefeningen, maar niet de
  hele oefenspeler eromheen. Vragen waarvan het beeld door die speler zelf
  wordt bestuurd — Vos die meebeweegt, een bus die eerst instapt, een
  Godot-spel, een uitleg-les — doen daarom niet mee. Ze blijven gewoon in de
  oefeningen staan; alleen in de toets worden ze overgeslagen.
*/
const VORMEN_IN_TOETS = new Set(["open", "meerkeuze", "waar_niet_waar", "sleepgetallen", "stapstenen"]);
const NIET_IN_TOETS = new Set(["lesscherm", "bus", "kralenrij", "plaatjesraster", "mabblokken", "huizenrij", "bosspel"]);

export function pastInToets(v: Pick<VraagInContext, "vorm" | "figuur">): boolean {
  if (!VORMEN_IN_TOETS.has(v.vorm)) return false;
  if (!v.figuur) return true;
  if (isGodotfiguur(v.figuur)) return false;
  return !NIET_IN_TOETS.has(v.figuur.soort);
}

type Rij = Record<string, unknown>;

function alsNiveau(w: unknown): Toetsniveau {
  return (TOETSNIVEAUS as readonly string[]).includes(String(w)) ? (String(w) as Toetsniveau) : "";
}

/** Alle onderdelen van alle groepen, voor beheer. Op groep en volgorde. */
export function alleOnderdelen(): Toetsonderdeel[] {
  const rijen = verbinding()
    .prepare("select * from niveautest_onderdelen order by groep, volgorde, aangemaakt_op")
    .all() as Rij[];
  if (rijen.length === 0) return [];

  const leerdoelen = new Map(haalLeerdoelen().map((l) => [l.id, l]));
  const ids = [...new Set(rijen.map((r) => String(r.leerdoel_id)))];
  const bruikbaar = new Map<string, number>();
  for (const v of haalGepubliceerdeVragen(ids)) {
    if (pastInToets(v)) bruikbaar.set(v.leerdoelId, (bruikbaar.get(v.leerdoelId) ?? 0) + 1);
  }

  return rijen.flatMap((r) => {
    const l = leerdoelen.get(String(r.leerdoel_id));
    if (!l) return [];
    return [
      {
        id: String(r.id),
        groep: Number(r.groep),
        leerdoelId: l.id,
        aantal: Number(r.aantal),
        niveau: alsNiveau(r.niveau),
        volgorde: Number(r.volgorde),
        leerdoelCode: l.code,
        leerdoelTitel: l.titel,
        domeinNaam: l.domeinNaam,
        subdomeinNaam: l.subdomeinNaam,
        vakNaam: l.vakNaam,
        bruikbaar: bruikbaar.get(l.id) ?? 0,
      },
    ];
  });
}

export function onderdelenVanGroep(groep: number): Toetsonderdeel[] {
  return alleOnderdelen().filter((o) => o.groep === groep);
}

/**
 * De groepen die een toets hebben: minstens één onderdeel met minstens één
 * vraag die erin past. Zonder database (zoals op het Vercel-voorbeeld) is dat
 * gewoon geen enkele: dan verschijnt de niveautest nergens. Eén keer per
 * verzoek (`cache`): de layout en de homepagina vragen het allebei.
 */
export const groepenMetToets = cache((): number[] => {
  try {
    const groepen = new Set(alleOnderdelen().filter((o) => o.bruikbaar > 0).map((o) => o.groep));
    return TOETSGROEPEN.filter((g) => groepen.has(g));
  } catch {
    return [];
  }
});

/** De leerdoelen om uit te kiezen in beheer. */
export function leerdoelenVoorToets(): LeerdoelRegel[] {
  return haalLeerdoelen();
}

function schudden<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Stelt een toets samen voor één groep: per onderdeel het ingestelde aantal
 * vragen, willekeurig gekozen uit wat er past. Vragen die voor deze groep
 * gemaakt zijn, gaan voor; zijn dat er te weinig, dan vult de rest van het
 * leerdoel aan. Heeft een leerdoel minder vragen dan gevraagd, dan krijgt dat
 * onderdeel er minder. De onderdelen blijven in de volgorde van beheer.
 */
export function stelToetsSamen(groep: number): Toets | null {
  const onderdelen = onderdelenVanGroep(groep).filter((o) => o.bruikbaar > 0);
  if (onderdelen.length === 0) return null;

  const alle = haalGepubliceerdeVragen(onderdelen.map((o) => o.leerdoelId)).filter(pastInToets);
  const vragen: Toetsvraag[] = [];
  const gebruikt: Toets["onderdelen"] = [];

  for (const o of onderdelen) {
    const vanLeerdoel = alle.filter((v) => v.leerdoelId === o.leerdoelId);
    const eigenGroep = schudden(vanLeerdoel.filter((v) => v.groep === groep));
    const rest = schudden(vanLeerdoel.filter((v) => v.groep !== groep));
    const gekozen = [...eigenGroep, ...rest].slice(0, o.aantal);
    if (gekozen.length === 0) continue;
    gebruikt.push({ id: o.id, titel: o.leerdoelTitel, niveau: o.niveau, aantal: gekozen.length });
    for (const v of gekozen) vragen.push({ ...alsOefenVraag(v), onderdeelId: o.id });
  }

  return vragen.length > 0 ? { groep, onderdelen: gebruikt, vragen } : null;
}

/*
  Precies zoals de oefenpagina een vraag klaarzet (zie oefening/page.tsx): een
  afbeelding die niet bestaat valt weg, zodat er nooit een gebroken plaatje
  staat.
*/
function alsOefenVraag(v: VraagInContext): OefenVraag {
  return {
    id: v.id,
    vorm: v.vorm,
    vraagtekst: v.vraagtekst,
    opties:
      v.opties?.map((o) => ({
        tekst: o.tekst,
        afbeelding: bestaatAfbeelding(o.afbeelding) ? o.afbeelding : null,
      })) ?? null,
    antwoord: v.antwoord,
    hint: v.hint,
    afbeelding: bestaatAfbeelding(v.afbeelding) ? v.afbeelding : null,
    figuur: v.figuur,
    somgegevens: v.somgegevens,
    uitleg: v.uitleg,
    uitlegAfbeelding: bestaatAfbeelding(v.uitlegAfbeelding) ? v.uitlegAfbeelding : null,
    uitlegvorm: v.uitlegvorm,
    leerdoelId: v.leerdoelId,
    leerdoelTitel: v.leerdoelTitel,
  };
}

// ---------------------------------------------------------------------------
// Samenstellen in beheer
// ---------------------------------------------------------------------------

export function geldigAantal(aantal: number): boolean {
  return Number.isInteger(aantal) && aantal >= MIN_AANTAL && aantal <= MAX_AANTAL;
}

export function geldigNiveau(niveau: string): niveau is Toetsniveau {
  return niveau === "" || (TOETSNIVEAUS as readonly string[]).includes(niveau);
}

export function controleerOnderdeel(groep: number, leerdoelId: string, aantal: number, niveau: string): string | null {
  if (!(TOETSGROEPEN as readonly number[]).includes(groep)) return "Kies een groep van 3 tot en met 8.";
  if (!leerdoelId) return "Kies een leerdoel.";
  if (!geldigAantal(aantal)) return `Kies ${MIN_AANTAL} tot en met ${MAX_AANTAL} vragen.`;
  if (!geldigNiveau(niveau)) return "Kies 1F, 2F, 1S of geen niveau.";
  return null;
}

/** Zet een leerdoel achteraan in de toets van een groep. */
export function voegOnderdeelToe(groep: number, leerdoelId: string, aantal: number, niveau: Toetsniveau): string | null {
  const d = verbinding();
  const bestaat = d.prepare("select 1 from leerdoelen where id = ?").get(leerdoelId);
  if (!bestaat) return "Dat leerdoel bestaat niet meer.";
  const dubbel = d
    .prepare("select 1 from niveautest_onderdelen where groep = ? and leerdoel_id = ?")
    .get(groep, leerdoelId);
  if (dubbel) return `Dit leerdoel staat al in de toets van groep ${groep}.`;
  const laatste = d
    .prepare("select coalesce(max(volgorde), 0) as v from niveautest_onderdelen where groep = ?")
    .get(groep) as Rij;
  d.prepare(
    `insert into niveautest_onderdelen (id, groep, leerdoel_id, aantal, niveau, volgorde, aangemaakt_op)
     values (?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), groep, leerdoelId, aantal, niveau, Number(laatste.v) + 1, new Date().toISOString());
  return null;
}

/** Past alleen het aantal en het niveau aan; het leerdoel en de plek blijven. */
export function wijzigOnderdeel(id: string, aantal: number, niveau: Toetsniveau): void {
  verbinding().prepare("update niveautest_onderdelen set aantal = ?, niveau = ? where id = ?").run(aantal, niveau, id);
}

/** Eén plek omhoog of omlaag binnen de eigen groep. */
export function verschuifOnderdeel(id: string, richting: "op" | "neer"): void {
  const d = verbinding();
  const dit = d.prepare("select groep, volgorde from niveautest_onderdelen where id = ?").get(id) as Rij | undefined;
  if (!dit) return;
  const rij = (
    d.prepare("select id from niveautest_onderdelen where groep = ? order by volgorde, aangemaakt_op").all(dit.groep as number) as Rij[]
  ).map((r) => String(r.id));
  const i = rij.indexOf(id);
  const j = richting === "op" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rij.length) return;
  [rij[i], rij[j]] = [rij[j], rij[i]];
  const zet = d.prepare("update niveautest_onderdelen set volgorde = ? where id = ?");
  d.exec("begin");
  try {
    rij.forEach((r, n) => zet.run(n + 1, r));
    d.exec("commit");
  } catch (e) {
    d.exec("rollback");
    throw e;
  }
}

/** Haalt een onderdeel uit de toets. Het leerdoel en zijn vragen blijven staan. */
export function verwijderOnderdeel(id: string): void {
  verbinding().prepare("delete from niveautest_onderdelen where id = ?").run(id);
}
