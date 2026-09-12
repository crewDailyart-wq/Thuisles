"use server";

/**
 * Wat een ouder instelt over school en methode.
 *
 * Twee dingen worden hier streng uit elkaar gehouden:
 *
 *   1. Wat de ouder over de SCHOOL beweert. Dat is een opgave, gaat naar de
 *      verificatiewachtrij, en heet tot die tijd "nog niet geverifieerd".
 *   2. Wat de ouder voor het EIGEN KIND instelt. Dat werkt meteen op de
 *      kinderkant en is uitdrukkelijk geen bewering over de school.
 *
 * Elke actie stelt opnieuw vast wie er is ingelogd en of het kind van deze
 * ouder is.
 */

import { revalidatePath } from "next/cache";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { haalKindVanOuder } from "@/lib/data/kinderen";
import {
  bevestigSchooljaar,
  haalKindschool,
  zetHuidigBlok,
  zetMethode,
  zetSchool,
  zetVolgMethode,
} from "@/lib/data/kindschool";
import { haalMethode } from "@/lib/data/methodes";
import {
  bewaarOpgave,
  controleerOpgave,
  haalSchool,
  methodestatus,
} from "@/lib/data/scholen";
import type { GezienWaar } from "@/lib/types";

type Uitkomst = { fout: string } | { gelukt: string } | null;

function tekst(gegevens: FormData, naam: string): string {
  const waarde = gegevens.get(naam);
  return typeof waarde === "string" ? waarde.trim() : "";
}

function ververs() {
  revalidatePath("/ouder", "layout");
  revalidatePath("/start");
  revalidatePath("/admin", "layout");
}

/** Het kind waar de ouderomgeving nu over gaat, of null als er iets niet klopt. */
async function huidigKindVanOuder(gegevens: FormData) {
  const ouder = await vereisOuder();
  const kindId = tekst(gegevens, "kindId");

  const kind = kindId
    ? haalKindVanOuder(ouder.id, kindId)
    : await bekekenKind(ouder.id);

  return { ouder, kind };
}

// ---------------------------------------------------------------------------
// School kiezen
// ---------------------------------------------------------------------------

export async function kiesSchool(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return { fout: "Kies eerst een kind." };

  const schoolId = tekst(gegevens, "schoolId");
  const school = haalSchool(schoolId);
  if (!school) return { fout: "Die school staat niet in de lijst." };

  zetSchool(kind.id, school.id);

  /*
    Bij een geverifieerde school stellen we de methode voor, maar we zetten hem
    NIET zelf aan: de ouder bevestigt hem in de volgende stap. Nooit iets
    stilzwijgend invullen.
  */
  ververs();
  const stand = methodestatus(school.id);
  return {
    gelukt:
      stand.herkomst === "geverifieerd" && stand.methode
        ? `${school.naam} is ingesteld. Wij weten van deze school dat er met ${stand.methode.naam} wordt gewerkt — bevestig hieronder of dat voor ${kind.roepnaam} klopt.`
        : `${school.naam} is ingesteld.`,
  };
}

export async function haalSchoolWeg(gegevens: FormData): Promise<void> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return;
  zetSchool(kind.id, null);
  ververs();
}

// ---------------------------------------------------------------------------
// De methode van het kind
// ---------------------------------------------------------------------------

/**
 * De ouder stelt de methode voor het eigen kind in.
 *
 * `herkomst` zegt wat er gebeurde: de methode van de school overnemen, of zelf
 * een methode kiezen voor alleen dit kind ("mijn kind werkt uit dit
 * werkboek"). Dat laatste is geen uitspraak over de school en komt dus niet in
 * de wachtrij.
 */
export async function kiesMethodeVoorKind(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return { fout: "Kies eerst een kind." };

  const methodeId = tekst(gegevens, "methodeId");
  if (!methodeId) {
    zetMethode(kind.id, null, "eigen");
    ververs();
    return { gelukt: `De methode is weggehaald bij ${kind.roepnaam}.` };
  }

  const methode = haalMethode(methodeId);
  if (!methode) return { fout: "Kies een methode uit de lijst." };

  const herkomst = tekst(gegevens, "herkomst") === "school" ? "school" : "eigen";
  zetMethode(kind.id, methode.id, herkomst);

  ververs();
  return {
    gelukt: `${kind.roepnaam} oefent nu in de volgorde van ${methode.naam}.`,
  };
}

export async function zetMethodeAanUit(gegevens: FormData): Promise<void> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return;
  zetVolgMethode(kind.id, gegevens.get("aan") === "ja");
  ververs();
}

/** B8: waar de klas nu zit. Dit vult Thuisles nooit zelf in. */
export async function kiesHuidigBlok(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return { fout: "Kies eerst een kind." };

  const blokId = tekst(gegevens, "blokId");
  zetHuidigBlok(kind.id, blokId || null);

  ververs();
  return {
    gelukt: blokId
      ? "Genoteerd. Het oefenen begint nu bij dat blok."
      : "Genoteerd. Het oefenen begint weer bij het eerste blok.",
  };
}

/** De jaarlijkse vraag: klopt de groep en de methode nog? */
export async function bevestigJaarcontrole(gegevens: FormData): Promise<void> {
  const { kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return;
  bevestigSchooljaar(kind.id);
  ververs();
}

// ---------------------------------------------------------------------------
// De methode van de school opgeven
// ---------------------------------------------------------------------------

/**
 * De ouder geeft door welke methode de klas gebruikt.
 *
 * Dit gaat naar de verificatiewachtrij. Tot Thuisles het bevestigt, ziet
 * iedereen "Opgegeven door een ouder, nog niet geverifieerd".
 *
 * Bewust GEEN foto-upload: op een kaft staat vaak de naam van het kind, en het
 * omslag zelf is beschermd materiaal.
 */
export async function geefMethodeOp(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const { ouder, kind } = await huidigKindVanOuder(gegevens);
  if (!kind) return { fout: "Kies eerst een kind." };

  const ks = haalKindschool(kind.id);
  if (!ks.school) return { fout: "Kies eerst de school van je kind." };

  const invoer = {
    schoolId: ks.school.id,
    ouderId: ouder.id,
    methodeId: tekst(gegevens, "methodeId") || null,
    andersTekst: tekst(gegevens, "andersTekst"),
    gezienWaar: tekst(gegevens, "gezienWaar") as GezienWaar,
    gezienLink: tekst(gegevens, "gezienLink"),
  };

  const fout = controleerOpgave(invoer);
  if (fout) return { fout };

  bewaarOpgave(invoer);

  /*
    Wat de ouder opgeeft, zetten we ook meteen bij het eigen kind: die weet het
    van zijn eigen kind, dus daar mag het oefenen op aansluiten. Voor de SCHOOL
    blijft het "nog niet geverifieerd" tot Thuisles het bevestigt.
  */
  if (invoer.methodeId) zetMethode(kind.id, invoer.methodeId, "school");

  ververs();
  return {
    gelukt:
      "Bedankt. We hebben het genoteerd. Tot we het hebben gecontroleerd, staat er bij deze school 'opgegeven door een ouder, nog niet geverifieerd'.",
  };
}
