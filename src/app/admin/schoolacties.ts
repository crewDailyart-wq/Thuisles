"use server";

/**
 * Beheeracties voor scholen, methodes en de verificatiewachtrij.
 *
 * LEGAL REVIEW REQUIRED — alles in dit bestand raakt aan methodes en
 * uitgevers. Wat hier mag: een naam en een uitgever als gewone tekst, en de
 * volgorde van blokken gekoppeld aan eigen Thuisles-leerdoelen. Wat hier niet
 * mag: inhoud, opgaven, teksten, uitleg, logo's, omslagen of huisstijl uit een
 * methode. Komt daar iets van bij, dan eerst juridisch laten toetsen.
 */

import { revalidatePath } from "next/cache";
import {
  koppelLeerdoelen,
  maakBlok,
  maakMethode,
  verplaatsBlok,
  verwijderBlok,
  verwijderMethode,
  wijzigBlok,
  wijzigMethode,
} from "@/lib/data/methodes";
import {
  bevestigMethode,
  importeerScholen,
  trekVerificatieIn,
  vernieuwUitDuo,
  wijsOpgavenAf,
} from "@/lib/data/scholen";
import {
  haalVoorstel,
  pauzeerZoeker,
  sluitOverigeVoorstellen,
  startZoeker,
  zetVoorstelStatus,
  zoekOpnieuw,
} from "@/lib/data/zoeker";

type Uitkomst = { fout: string } | { gelukt: string } | null;

function tekst(gegevens: FormData, naam: string): string {
  const waarde = gegevens.get(naam);
  return typeof waarde === "string" ? waarde.trim() : "";
}

/** Ververst de beheerkant én de ouderomgeving: die leest dezelfde gegevens. */
function ververs() {
  revalidatePath("/admin", "layout");
  revalidatePath("/ouder", "layout");
  revalidatePath("/start");
}

// ---------------------------------------------------------------------------
// Scholen importeren
// ---------------------------------------------------------------------------

/** Zegt in gewone taal wat een vernieuwing heeft opgeleverd. */
function samenvatting(u: {
  gelezen: number;
  nieuw: number;
  gewijzigd: number;
  gesloten: number;
  ongewijzigd: number;
}): string {
  const delen = [`${u.gelezen} scholen gelezen`];
  if (u.nieuw) delen.push(`${u.nieuw} nieuw`);
  if (u.gewijzigd) delen.push(`${u.gewijzigd} gewijzigd`);
  if (u.gesloten) delen.push(`${u.gesloten} niet meer in de lijst (gemarkeerd als gesloten)`);
  if (!u.nieuw && !u.gewijzigd && !u.gesloten) delen.push("niets veranderd");
  return `${delen.join(", ")}.`;
}

/**
 * Vernieuwt de schoollijst bij DUO.
 *
 * Bestaande scholen worden bijgewerkt, niet vervangen: koppelingen van ouders
 * en verificaties blijven staan. Scholen die niet meer in de lijst voorkomen
 * worden gemarkeerd als gesloten en niet verwijderd.
 */
export async function vernieuwScholen(): Promise<Uitkomst> {
  const uitkomst = await vernieuwUitDuo();
  if (uitkomst.fout) return { fout: uitkomst.fout };

  ververs();
  return { gelukt: samenvatting(uitkomst) };
}

/** Hetzelfde bestand, maar dan met de hand gekozen. */
export async function importeerScholenbestand(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const bestand = gegevens.get("bestand");
  if (!(bestand instanceof File) || bestand.size === 0) {
    return { fout: "Kies een CSV-bestand." };
  }

  const uitkomst = importeerScholen(await bestand.text());
  if (uitkomst.fout) return { fout: uitkomst.fout };

  ververs();
  return { gelukt: samenvatting(uitkomst) };
}

// ---------------------------------------------------------------------------
// Methodes
// ---------------------------------------------------------------------------

export async function nieuweMethode(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const naam = tekst(gegevens, "naam");
  if (!naam) return { fout: "Vul een naam in." };

  const methode = maakMethode(naam, tekst(gegevens, "uitgever"));
  if (!methode) return { fout: "Er bestaat al een methode met deze naam." };

  ververs();
  return { gelukt: `${methode.naam} is toegevoegd.` };
}

export async function bewerkMethode(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const gelukt = wijzigMethode(
    tekst(gegevens, "methodeId"),
    tekst(gegevens, "naam"),
    tekst(gegevens, "uitgever"),
    gegevens.get("actief") === "ja",
  );
  if (!gelukt) return { fout: "Vul een naam in." };

  ververs();
  return { gelukt: "Opgeslagen." };
}

export async function wegMetMethode(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  if (!verwijderMethode(tekst(gegevens, "methodeId"))) {
    return { fout: "Deze methode is nog in gebruik en kan niet weg." };
  }
  ververs();
  return { gelukt: "De methode is verwijderd." };
}

// ---------------------------------------------------------------------------
// Blokken
// ---------------------------------------------------------------------------

export async function nieuwBlok(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const id = maakBlok(
    tekst(gegevens, "methodeId"),
    Number(gegevens.get("groep")),
    tekst(gegevens, "titel"),
  );
  if (!id) return { fout: "Vul een titel in en kies een groep." };

  ververs();
  return { gelukt: "Blok toegevoegd." };
}

export async function bewerkBlok(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const blokId = tekst(gegevens, "blokId");

  if (!wijzigBlok(blokId, tekst(gegevens, "titel"))) {
    return { fout: "Vul een titel in." };
  }

  // De leerdoelen die bij dit blok horen, in één keer vastzetten.
  koppelLeerdoelen(blokId, gegevens.getAll("leerdoelen").map(String));

  ververs();
  return { gelukt: "Blok opgeslagen." };
}

export async function schuifBlok(gegevens: FormData): Promise<void> {
  verplaatsBlok(
    tekst(gegevens, "blokId"),
    gegevens.get("richting") === "op" ? "op" : "neer",
  );
  ververs();
}

export async function wegMetBlok(gegevens: FormData): Promise<void> {
  verwijderBlok(tekst(gegevens, "blokId"));
  ververs();
}

// ---------------------------------------------------------------------------
// Verificatiewachtrij
// ---------------------------------------------------------------------------

/**
 * Bevestigen dat een school met deze methode werkt.
 *
 * Bron is verplicht. Zonder controleerbare herkomst hoort er geen
 * "Geverifieerd door Thuisles" op het scherm van een ouder te staan.
 */
export async function bevestigOpgave(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const fout = bevestigMethode(
    tekst(gegevens, "schoolId"),
    tekst(gegevens, "methodeId"),
    tekst(gegevens, "bron"),
    tekst(gegevens, "bronLink"),
  );
  if (fout) return { fout };

  ververs();
  return { gelukt: "Bevestigd. Ouders zien nu 'Geverifieerd door Thuisles'." };
}

/** Afwijzen: de opgaven gaan uit de wachtrij, de school blijft "nog niet bekend". */
export async function wijsAf(gegevens: FormData): Promise<void> {
  wijsOpgavenAf(tekst(gegevens, "schoolId"));
  ververs();
}

/** Een eerdere bevestiging intrekken. */
export async function trekIn(gegevens: FormData): Promise<void> {
  trekVerificatieIn(tekst(gegevens, "schoolId"));
  ververs();
}

// ---------------------------------------------------------------------------
// De methodezoeker
//
// LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.
// Zie src/lib/zoeker/NOTITIE.md voor wat er wordt opgehaald en bewaard.
// ---------------------------------------------------------------------------

export async function startDeZoeker(): Promise<void> {
  startZoeker();
  ververs();
}

export async function pauzeerDeZoeker(): Promise<void> {
  pauzeerZoeker();
  ververs();
}

/** Eén school opnieuw laten onderzoeken. */
export async function zoekSchoolOpnieuw(gegevens: FormData): Promise<void> {
  zoekOpnieuw(tekst(gegevens, "schoolId"));
  ververs();
}

/**
 * Eén klik: het voorstel van de zoeker wordt een verificatie.
 *
 * Bron en datum worden automatisch overgenomen van wat de zoeker vond — de
 * link naar de pagina of schoolgids, en het jaartal als dat er stond. Dit is
 * het enige moment waarop een vondst van de zoeker "geverifieerd" wordt, en
 * het gebeurt altijd met de hand.
 */
export async function bevestigVoorstel(
  _vorige: Uitkomst,
  gegevens: FormData,
): Promise<Uitkomst> {
  const voorstel = haalVoorstel(tekst(gegevens, "voorstelId"));
  if (!voorstel || !voorstel.methode) return { fout: "Dat voorstel bestaat niet meer." };

  const soort = voorstel.bronSoort === "schoolgids" ? "schoolgids" : "website van de school";
  const bron = voorstel.jaartal
    ? `Gevonden door de zoeker in de ${soort} (${voorstel.jaartal})`
    : `Gevonden door de zoeker in de ${soort}`;

  const fout = bevestigMethode(
    voorstel.schoolId,
    voorstel.methode.id,
    bron,
    voorstel.bronLink,
  );
  if (fout) return { fout };

  zetVoorstelStatus(voorstel.id, "bevestigd");
  sluitOverigeVoorstellen(voorstel.schoolId, voorstel.id);

  ververs();
  return { gelukt: "Bevestigd. Ouders zien nu 'Geverifieerd door Thuisles'." };
}

export async function wijsVoorstelAf(gegevens: FormData): Promise<void> {
  zetVoorstelStatus(tekst(gegevens, "voorstelId"), "afgewezen");
  ververs();
}

/** "Later": het voorstel blijft staan, maar zakt naar onderen in de lijst. */
export async function laterVoorstel(gegevens: FormData): Promise<void> {
  zetVoorstelStatus(tekst(gegevens, "voorstelId"), "later");
  ververs();
}
