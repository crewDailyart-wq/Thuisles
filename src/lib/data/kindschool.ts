import "server-only";

/**
 * School en methode van één kind.
 *
 * De methode hangt aan het KIND, niet alleen aan de school. Dat heeft twee
 * redenen:
 *
 *   1. Bij een geverifieerde school stellen we de methode voor, maar de ouder
 *      bevestigt hem — wij zetten hem nooit stilzwijgend aan.
 *   2. Is de school onbekend, dan mag een ouder alsnog zeggen "mijn kind werkt
 *      uit dit werkboek". Dat werkt meteen op de kinderkant en is uitdrukkelijk
 *      GEEN bewering over de school. Het komt dus ook niet in de wachtrij.
 */

import { verbinding } from "@/lib/db/sqlite";
import { blokkenVoorKind, haalMethode } from "@/lib/data/methodes";
import { haalSchool, methodestatus } from "@/lib/data/scholen";
import { huidigSchooljaar, vraagJaarcontrole } from "@/lib/schooljaar";
import type { MethodeBlok, MethodeKoppeling, Rekenmethode, School } from "@/lib/types";

type Rij = Record<string, string | number | null>;

export type Kindschool = {
  kindId: string;
  school: School | null;
  methode: Rekenmethode | null;
  /** Waar de methode van dit kind vandaan komt. */
  methodeHerkomst: "school" | "eigen" | null;
  volgMethode: boolean;
  huidigBlokId: string | null;
  /** Schooljaar waarin de ouder dit voor het laatst heeft bevestigd. */
  schooljaar: string | null;
};

const LEEG = (kindId: string): Kindschool => ({
  kindId,
  school: null,
  methode: null,
  methodeHerkomst: null,
  volgMethode: true,
  huidigBlokId: null,
  schooljaar: null,
});

export function haalKindschool(kindId: string): Kindschool {
  const r = verbinding()
    .prepare("select * from kind_school where kind_id = ?")
    .get(kindId) as Rij | undefined;
  if (!r) return LEEG(kindId);

  return {
    kindId,
    school: r.school_id ? haalSchool(String(r.school_id)) : null,
    methode: r.methode_id ? haalMethode(String(r.methode_id)) : null,
    methodeHerkomst: r.methode_herkomst
      ? (String(r.methode_herkomst) as "school" | "eigen")
      : null,
    volgMethode: Number(r.volg_methode) === 1,
    huidigBlokId: r.huidig_blok_id ? String(r.huidig_blok_id) : null,
    schooljaar: r.schooljaar ? String(r.schooljaar) : null,
  };
}

/** Zorgt dat er een rij is, zodat de losse wijzigingen hieronder kunnen werken. */
function zorgVoorRij(kindId: string): void {
  verbinding()
    .prepare(
      `insert or ignore into kind_school (kind_id, volg_methode, bijgewerkt_op)
       values (?, 1, ?)`,
    )
    .run(kindId, new Date().toISOString());
}

function werkBij(kindId: string, kolom: string, waarde: string | number | null): void {
  zorgVoorRij(kindId);
  verbinding()
    .prepare(`update kind_school set ${kolom} = ?, bijgewerkt_op = ? where kind_id = ?`)
    .run(waarde, new Date().toISOString(), kindId);
}

/**
 * De school van het kind instellen.
 *
 * Er wordt hier GEEN methode meegezet, ook niet als de school geverifieerd is.
 * De ouder krijgt hem voorgesteld en bevestigt zelf.
 */
export function zetSchool(kindId: string, schoolId: string | null): void {
  werkBij(kindId, "school_id", schoolId);
  // Bij een andere school klopt het oude blok niet meer.
  werkBij(kindId, "huidig_blok_id", null);
}

/**
 * De methode van het kind instellen.
 *
 * `herkomst` legt vast wat de ouder heeft gedaan: de methode van de school
 * overnemen, of er zelf een kiezen voor alleen dit kind.
 */
export function zetMethode(
  kindId: string,
  methodeId: string | null,
  herkomst: "school" | "eigen",
): void {
  werkBij(kindId, "methode_id", methodeId);
  werkBij(kindId, "methode_herkomst", methodeId ? herkomst : null);
  werkBij(kindId, "huidig_blok_id", null);
  werkBij(kindId, "schooljaar", huidigSchooljaar());
}

export function zetVolgMethode(kindId: string, aan: boolean): void {
  werkBij(kindId, "volg_methode", aan ? 1 : 0);
}

/** B8: waar de klas nu zit. Dit vult Thuisles nooit zelf in. */
export function zetHuidigBlok(kindId: string, blokId: string | null): void {
  werkBij(kindId, "huidig_blok_id", blokId);
}

/** De jaarlijkse bevestiging: groep en methode kloppen nog. */
export function bevestigSchooljaar(kindId: string): void {
  werkBij(kindId, "schooljaar", huidigSchooljaar());
}

/** Moet de ouder dit schooljaar nog bevestigd worden dat alles nog klopt? */
export function moetJaarcontrole(ks: Kindschool): boolean {
  // Zonder school of methode valt er niets te bevestigen.
  if (!ks.school && !ks.methode) return false;
  return vraagJaarcontrole(ks.schooljaar);
}

// ---------------------------------------------------------------------------
// Wat de kinderkant hiervan ziet
// ---------------------------------------------------------------------------

/**
 * De methodekoppeling zoals het startscherm van het kind hem nodig heeft.
 *
 * `herkomst` volgt STRIKT wat er over de school bekend is. Heeft de ouder
 * zelf een methode voor dit kind ingesteld zonder bekende school, dan is dat
 * "opgegeven_door_ouder" — want dat is precies wat het is: niet gecontroleerd.
 */
export function koppelingVoorKind(kindId: string): MethodeKoppeling {
  const ks = haalKindschool(kindId);

  let herkomst: MethodeKoppeling["herkomst"] = "onbekend";
  if (ks.methode) {
    const schoolStand = ks.school ? methodestatus(ks.school.id) : null;
    // Alleen "geverifieerd" als het ook echt de geverifieerde methode is.
    herkomst =
      schoolStand?.herkomst === "geverifieerd" &&
      schoolStand.methode?.id === ks.methode.id
        ? "geverifieerd"
        : "opgegeven_door_ouder";
  }

  return {
    kindId,
    school: ks.school,
    methode: ks.methode,
    herkomst,
    volgMethode: ks.volgMethode,
  };
}

/**
 * De blokken die het kind te zien krijgt.
 *
 * Leeg zolang er geen methode is, of zolang "oefenen volgens methode" uitstaat.
 * De kinderkant toont dan "Rekenmethode nog niet bekend" en vrij oefenen blijft
 * gewoon werken — er is niets kapot.
 */
export function blokkenVoorStartscherm(
  kindId: string,
  groep: number,
): MethodeBlok[] {
  const ks = haalKindschool(kindId);
  if (!ks.methode || !ks.volgMethode) return [];
  return blokkenVoorKind(ks.methode.id, groep, ks.huidigBlokId);
}
