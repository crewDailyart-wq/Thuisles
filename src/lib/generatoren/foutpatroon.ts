/**
 * Het vaste stramien voor foutpatronen.
 *
 * Een foutpatroon is een herkenbare denkfout: "het tiental vergeten", "één
 * tafelstap ernaast". Omdat de generator weet hoe de som in elkaar zit, kan
 * het foute antwoord van een kind met die patronen worden vergeleken.
 *
 * VASTE REGEL: elk generator-type levert zijn eigen foutpatronen mee. Ze zijn
 * net zo verplicht als de instellingen en het antwoord. `controleerGenerator`
 * hieronder kijkt of alles ingevuld is; de beheeromgeving waarschuwt als er
 * iets ontbreekt, zodat een half type nooit stilzwijgend in gebruik raakt.
 *
 * Wat een patroon altijd moet hebben:
 *   - een herkenregel;
 *   - een kindtekst per leeftijdsgroep (3-4, 5-6, 7-8);
 *   - een hint;
 *   - een "laat het me zien"-uitleg in stappen;
 *   - een oudertekst met zinnen voor thuis.
 *
 * De teksten zijn voorzichtig geformuleerd: "Misschien heb je…", "Het lijkt
 * erop dat…". Nooit stellig, want we weten niet zeker wat een kind dacht.
 */

import type { Figuur } from "@/lib/generatoren/soort";

/** Wat de generator over de som doorgeeft, zodat patronen kunnen rekenen. */
export type Somgegevens = {
  soort: string;
  /** Welke vorm binnen dat soort: "keer", "delen", "boom", ... */
  variant?: string;
  /** De getallen die in de som staan, in volgorde. */
  getallen: number[];
  /** Het goede antwoord als getal. */
  goed: number;
  extra?: Record<string, number>;
};

export type Leeftijdsgroep = "34" | "56" | "78";

export function leeftijdsgroepVan(groep: number): Leeftijdsgroep {
  if (groep <= 4) return "34";
  if (groep <= 6) return "56";
  return "78";
}

/** Eén stap in de "laat het me zien"-uitleg. */
export type Uitlegstap = {
  /** Korte zin bij deze stap. */
  tekst: string;
  /** De som in grote cijfers, bijvoorbeeld "48 + 2 = 50". */
  som?: string;
  /** Een tekening bij deze stap. */
  figuur?: Figuur;
};

/** Wat een ouder te zien krijgt. Nu in het Nederlands; talen volgen later. */
export type Oudertekst = {
  /** Wat er waarschijnlijk misging, in gewone taal. */
  uitleg: string;
  /** Twee of drie concrete zinnen om thuis te gebruiken. */
  zinnen: string[];
  /** Het Nederlandse schoolwoord, zodat ouder en school hetzelfde zeggen. */
  schoolwoord: string;
};

/**
 * De "zo los je het op"-uitleg. VERPLICHT bij elk generator-type.
 *
 * Dit is wat een kind te zien krijgt als er géén denkfout wordt herkend. Het
 * neemt niets aan over wat er misging; het laat gewoon zien hoe je zo'n som
 * aanpakt. Daarmee is er bij elke fout een "waarom", bij elk vraagtype.
 */
export type Aanpak = {
  /** Korte zin, per leeftijdsgroep. Groep 3-4 kort, groep 7-8 met het waarom. */
  zin: (som: Somgegevens) => Record<Leeftijdsgroep, string>;
  /** Dezelfde som stap voor stap, voor de knop "Laat het me zien". */
  stappen: (som: Somgegevens) => Uitlegstap[];
  /**
   * Het goede antwoord met de controle erbij, in één zin.
   * Bijvoorbeeld: "Het goede antwoord is 16, want 3 + 16 = 19."
   */
  controle: (som: Somgegevens) => string;
};

export type Foutpatroon = {
  id: string;
  naam: string;
  /** Herkent dit patroon het gegeven antwoord? */
  herkent: (som: Somgegevens, gegeven: number) => boolean;
  kindtekst: Record<Leeftijdsgroep, string>;
  hint: string;
  uitleg: (som: Somgegevens) => Uitlegstap[];
  ouder: Oudertekst;
};

// ---------------------------------------------------------------------------
// Herkennen
// ---------------------------------------------------------------------------

/**
 * Zoekt het eerst passende patroon. Geen patroon = null, nooit een gok.
 *
 * De volgorde in de lijst telt: zet specifieke patronen vóór algemene, zodat
 * een kind de meest behulpzame uitleg krijgt.
 */
export function herkenFout(
  patronen: Foutpatroon[],
  som: Somgegevens,
  gegevenTekst: string,
): Foutpatroon | null {
  const gegeven = Number(String(gegevenTekst).replace(",", "."));
  if (!Number.isFinite(gegeven)) return null;
  if (gegeven === som.goed) return null;

  return patronen.find((p) => p.herkent(som, gegeven)) ?? null;
}

/**
 * Openingszin bij een fout antwoord. Hierna volgt altijd óf de herkende
 * denkfout, óf de "zo los je het op"-uitleg van het type.
 */
export const ALGEMENE_OPENING: Record<Leeftijdsgroep, string> = {
  "34": "Nog niet helemaal. Kijk maar mee.",
  "56": "Nog niet helemaal. Zo pak je zo'n som aan:",
  "78": "Nog niet helemaal. Zo werkt zo'n som:",
};

/**
 * Laatste vangnet als een vraag helemaal geen gegevens meedraagt, zoals bij
 * een handgemaakte vraag zonder eigen uitleg.
 */
export const ZONDER_GEGEVENS: Record<Leeftijdsgroep, string> = {
  "34": "Nog niet helemaal. Kijk nog eens goed naar de vraag.",
  "56": "Nog niet helemaal. Lees de vraag nog een keer rustig door.",
  "78": "Nog niet helemaal. Loop de vraag nog eens stap voor stap na.",
};

// ---------------------------------------------------------------------------
// Hulpjes voor herkenregels
// ---------------------------------------------------------------------------

/** 16 wordt 61. Alleen zinvol bij getallen van twee of drie cijfers. */
export function cijfersOmgedraaid(getal: number): number | null {
  if (getal < 10 || getal > 999) return null;
  const omgekeerd = Number(String(getal).split("").reverse().join(""));
  return omgekeerd === getal ? null : omgekeerd;
}

// ---------------------------------------------------------------------------
// Volledigheid bewaken
// ---------------------------------------------------------------------------

export type Gebrek = { patroon: string; wat: string };

/**
 * Controleert of een generator-type compleet is: zowel de foutpatronen als de
 * verplichte "zo los je het op"-uitleg. De beheeromgeving waarschuwt hiermee,
 * zodat een half type nooit stilzwijgend in gebruik raakt.
 */
export function controleerAanpak(aanpak: Aanpak | undefined): Gebrek[] {
  const gebreken: Gebrek[] = [];
  const proef: Somgegevens = { soort: "proef", getallen: [19, 3], goed: 16 };

  if (!aanpak) {
    return [{ patroon: "Zo los je het op", wat: "Dit type heeft nog geen aanpak-uitleg." }];
  }

  try {
    const zinnen = aanpak.zin(proef);
    for (const groep of ["34", "56", "78"] as Leeftijdsgroep[]) {
      if (!zinnen[groep]?.trim()) {
        gebreken.push({
          patroon: "Zo los je het op",
          wat: `Uitleg voor groep ${groep[0]}-${groep[1]} ontbreekt.`,
        });
      }
    }
  } catch {
    gebreken.push({ patroon: "Zo los je het op", wat: "De uitleg kon niet worden opgebouwd." });
  }

  try {
    if (aanpak.stappen(proef).length === 0) {
      gebreken.push({ patroon: "Zo los je het op", wat: "Stappen voor 'Laat het me zien' ontbreken." });
    }
  } catch {
    gebreken.push({ patroon: "Zo los je het op", wat: "De stappen konden niet worden opgebouwd." });
  }

  try {
    if (!aanpak.controle(proef)?.trim()) {
      gebreken.push({ patroon: "Zo los je het op", wat: "Het antwoord met controle ontbreekt." });
    }
  } catch {
    gebreken.push({ patroon: "Zo los je het op", wat: "De controlezin kon niet worden opgebouwd." });
  }

  return gebreken;
}

/**
 * Controleert of een set foutpatronen compleet is. De beheeromgeving toont
 * hiermee een waarschuwing bij een type dat nog niet af is.
 */
export function controleerPatronen(patronen: Foutpatroon[]): Gebrek[] {
  const gebreken: Gebrek[] = [];

  if (patronen.length === 0) {
    return [{ patroon: "—", wat: "Dit type heeft nog geen foutpatronen." }];
  }

  for (const p of patronen) {
    const naam = p.naam || p.id;
    for (const groep of ["34", "56", "78"] as Leeftijdsgroep[]) {
      if (!p.kindtekst[groep]?.trim()) {
        gebreken.push({ patroon: naam, wat: `Kindtekst voor groep ${groep[0]}-${groep[1]} ontbreekt.` });
      }
    }
    if (!p.hint?.trim()) gebreken.push({ patroon: naam, wat: "Hint ontbreekt." });
    if (!p.ouder?.uitleg?.trim()) gebreken.push({ patroon: naam, wat: "Oudertekst ontbreekt." });
    if (!p.ouder?.zinnen?.length) gebreken.push({ patroon: naam, wat: "Zinnen voor thuis ontbreken." });
    if (!p.ouder?.schoolwoord?.trim()) gebreken.push({ patroon: naam, wat: "Schoolwoord ontbreekt." });

    try {
      const proef = p.uitleg({ soort: "proef", getallen: [12, 7], goed: 19 });
      if (proef.length === 0) gebreken.push({ patroon: naam, wat: "Uitleg in stappen ontbreekt." });
    } catch {
      gebreken.push({ patroon: naam, wat: "Uitleg kon niet worden opgebouwd." });
    }
  }

  return gebreken;
}
