/**
 * De vraagvormen die Thuisles ondersteunt.
 *
 * Per vorm ligt vast wat er wordt opgeslagen en hoe het antwoord eruitziet.
 * Alles staat op één plek, zodat het formulier, de CSV-import en de database
 * niet uit elkaar kunnen lopen.
 */

export type Vraagvorm = "meerkeuze" | "open" | "waar_niet_waar" | "sleepgetallen";

/**
 * Alle vormen die opgeslagen mogen worden.
 *
 * De database bouwt zijn controle hierop; zie `sqlite.ts`. Dat moet wel, want
 * daar stond de lijst eerder overgeschreven in SQL, en toen "sleepgetallen"
 * erbij kwam liep die uit de pas: de generator maakte netjes sommen, maar
 * elke poging ze op te slaan viel stuk op de controle in de tabel. Er kwam
 * geen enkele som binnen.
 *
 * Komt er een vorm bij, zet hem dan hier; de database volgt vanzelf.
 */
export const ALLE_VRAAGVORMEN: Vraagvorm[] = [
  "meerkeuze",
  "open",
  "waar_niet_waar",
  "sleepgetallen",
];

export const VRAAGVORMEN: Vraagvorm[] = ["meerkeuze", "open", "waar_niet_waar"];

/**
 * Vormen die je met de hand kunt invoeren, staan in `VRAAGVORMEN` hierboven.
 *
 * "sleepgetallen" staat daar bewust NIET bij: zo'n vraag bestaat uit meerdere
 * getekende figuren met elk een eigen antwoord, en die maak je met een
 * generator, niet in een formulier. Hij hoort wel gewoon bij `Vraagvorm`, want
 * opslaan, nakijken en tonen gaan verder precies hetzelfde.
 */
export const VORM_LABEL: Record<Vraagvorm, string> = {
  meerkeuze: "Meerkeuze",
  open: "Open vraag",
  waar_niet_waar: "Waar / niet waar",
  sleepgetallen: "Getallen slepen",
};

export const VORM_UITLEG: Record<Vraagvorm, string> = {
  meerkeuze: "Het kind kiest uit twee tot zes antwoorden. Eén is goed.",
  open: "Het kind typt het antwoord. Meerdere schrijfwijzen mogen goed zijn.",
  waar_niet_waar: "Een stelling die waar of niet waar is.",
  sleepgetallen:
    "Het kind sleept bij elke afbeelding het getal dat erbij hoort. Alleen via een sjabloon.",
};

export type Vraagstatus = "concept" | "gepubliceerd";

export const STATUS_LABEL: Record<Vraagstatus, string> = {
  concept: "Concept",
  gepubliceerd: "Gepubliceerd",
};

/**
 * Eén antwoordmogelijkheid bij een meerkeuzevraag.
 *
 * Tekst en afbeelding mogen allebei, of één van de twee. Zo kan één vraag
 * alleen tekst gebruiken, alleen plaatjes, of een combinatie.
 */
export type AntwoordOptie = {
  tekst: string;
  /** Bestandsnaam in `public/vragen`, of leeg. */
  afbeelding: string | null;
};

/**
 * Leest de opgeslagen opties.
 *
 * Vangt ook de oude vorm op: vóór de uitbreiding met afbeeldingen werd er een
 * eenvoudige lijst met teksten bewaard. Bestaande vragen blijven zo werken.
 */
export function leesOpties(ruw: string | null): AntwoordOptie[] | null {
  if (!ruw) return null;
  try {
    const gelezen: unknown = JSON.parse(ruw);
    if (!Array.isArray(gelezen)) return null;

    return gelezen.map((o) =>
      typeof o === "string"
        ? { tekst: o, afbeelding: null }
        : {
            tekst: String((o as AntwoordOptie).tekst ?? ""),
            afbeelding: (o as AntwoordOptie).afbeelding || null,
          },
    );
  } catch {
    return null;
  }
}

/**
 * Tekening bij een vraag (splitsboom, later ook klok, breukfiguur, ...).
 * Wordt als gegevens opgeslagen en met code getekend.
 */
import type { Figuur, Somgegevens } from "@/lib/generatoren/soort";
export type { Figuur, Somgegevens };

/** Eén vraag zoals de beheeromgeving hem kent. */
export type Vraag = {
  id: string;
  leerdoelId: string;
  groep: number;
  vorm: Vraagvorm;
  vraagtekst: string;
  /** Alleen bij meerkeuze: de keuzemogelijkheden, in volgorde. */
  opties: AntwoordOptie[] | null;
  /**
   * meerkeuze       -> de index van het goede antwoord, als tekst ("1")
   * open            -> goede antwoorden, gescheiden door een liggend streepje
   * waar_niet_waar  -> "waar" of "niet_waar"
   */
  antwoord: string;
  hint: string | null;
  afbeelding: string | null;
  figuur: Figuur | null;
  somgegevens: Somgegevens | null;
  uitleg: string | null;
  uitlegAfbeelding: string | null;
  /** Uit welk sjabloon deze vraag komt, of null bij een handgemaakte vraag. */
  sjabloonId: string | null;
  status: Vraagstatus;
  aangemaaktOp: string;
};

/** Vraag plus de plek in de leerdoelstructuur, voor de overzichtstabel. */
export type VraagInContext = Vraag & {
  /** Overschreven uitlegvorm van het leerdoel, of null. */
  uitlegvorm: string | null;
  leerdoelCode: string;
  leerdoelTitel: string;
  subdomeinNaam: string;
  domeinNaam: string;
  domeinSlug: string;
  vakNaam: string;
  vakSlug: string;
};

/**
 * Wat het oefenscherm van een vraag nodig heeft.
 *
 * Bewust een kleinere vorm dan `VraagInContext`: alleen wat het kind te zien
 * krijgt plus het antwoord om na te kijken. Deze vorm mag ook in de browser
 * gebruikt worden.
 */
export type OefenVraag = {
  id: string;
  vorm: Vraagvorm;
  vraagtekst: string;
  opties: AntwoordOptie[] | null;
  antwoord: string;
  hint: string | null;
  /** Bestandsnaam van een eigen illustratie, of null. */
  afbeelding: string | null;
  /** Getekende figuur bij de vraag, of null. */
  figuur: Figuur | null;
  /** De getallen achter de som, voor het herkennen van denkfouten. */
  somgegevens: Somgegevens | null;
  /** Optionele uitleg bij een handgemaakte vraag. */
  uitleg: string | null;
  uitlegAfbeelding: string | null;
  /**
   * Welke vorm van uitleg-animatie. Normaal volgt die de groep van het kind;
   * per leerdoel kan er in het beheer een andere vorm worden gekozen — voor
   * een kind in groep 5 dat toch blokjes nodig heeft.
   */
  uitlegvorm: string | null;
  leerdoelId: string;
  leerdoelTitel: string;
};

/** Leest het antwoord terug in gewone taal, voor de tabel en de controle. */
export function antwoordInTekst(vraag: Vraag): string {
  if (vraag.vorm === "meerkeuze") {
    const optie = vraag.opties?.[Number(vraag.antwoord)];
    if (!optie) return "?";
    return optie.tekst || optie.afbeelding || "?";
  }
  if (vraag.vorm === "waar_niet_waar") {
    return vraag.antwoord === "waar" ? "Waar" : "Niet waar";
  }
  return vraag.antwoord.split("|").join(" of ");
}
