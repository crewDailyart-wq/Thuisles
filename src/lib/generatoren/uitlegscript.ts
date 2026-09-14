/**
 * De vaste bouwvorm van een uitleg-animatie.
 *
 * Een uitlegscript is een lijstje stappen. Elke stap zegt: wat staat er in
 * beeld, wat licht er op, welke zin zegt Vos, en of het kind zelf iets moet
 * doen. De uitlegspeler kan elk script afspelen — met voorlezen, geluid en
 * tempo — zonder iets te weten over het soort som.
 *
 * Een generator-type levert dus alleen het script. Daardoor zien alle
 * uitleggen er hetzelfde uit en werkt een nieuw type meteen mee.
 *
 * De scripts zijn bewust gewone gegevens (geen code die tekent). Zo kunnen ze
 * later ook in het ouderdashboard worden getoond: een animatie werkt in elke
 * taal.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";

/** Welke vorm van uitleg: de vorm volgt de groep van het kind. */
export type Groepsvorm = "34" | "56" | "78";

export const GROEPSVORMEN: Groepsvorm[] = ["34", "56", "78"];

export const VORM_OMSCHRIJVING: Record<Groepsvorm, string> = {
  "34": "Groep 3-4 — animatie met blokjes",
  "56": "Groep 5-6 — animatie met getallen en schema's",
  "78": "Groep 7-8 — compacte stappenlijst",
};

export function vormBijGroep(groep: number): Groepsvorm {
  if (groep <= 4) return "34";
  if (groep <= 6) return "56";
  return "78";
}

// ---------------------------------------------------------------------------
// De visuele modellen die scholen gebruiken
// ---------------------------------------------------------------------------

/**
 * Toestand van één blokje. Bewust ook verschillend van vorm en rand, niet
 * alleen van kleur: zo blijft het te volgen voor kinderen die kleuren
 * moeilijk uit elkaar houden.
 */
export type Bloktoestand = "normaal" | "deel" | "weg" | "rest" | "geteld";

export type Model =
  | {
      soort: "blokjes";
      /** Toestand per blokje, in volgorde. */
      blokjes: Bloktoestand[];
      /** Hoeveel blokjes op een rij. 10 geeft een twintigveld-gevoel. */
      perRij: number;
      /** Groot getal boven de blokjes, bijvoorbeeld het antwoord. */
      bijschrift?: string;
    }
  | {
      soort: "splitsboom";
      geheel: number;
      links: number | null;
      rechts: number | null;
      /** Welk vakje oplicht bij deze stap. */
      nadruk?: "geheel" | "links" | "rechts" | null;
    }
  | {
      soort: "kralen";
      totaal: number;
      /** Om de hoeveel kralen de kleur wisselt. */
      perGroep: number;
      /** Tot en met de hoeveelste kraal er al geteld is. */
      opgelicht: number;
      /** De kraal waar de pijl naar wijst; 0 laat de pijl weg. */
      pijlOp: number;
      palet: string;
      bijschrift?: string;
    }
  | {
      soort: "bus";
      totaal: number;
      /** Hoeveel kinderen er per raam zitten. */
      perGroep: number;
      /** Hoeveel kinderen er al geteld zijn; die lichten op. */
      opgelicht: number;
      palet: string;
      bijschrift?: string;
    }
  | {
      soort: "som";
      /** Grote som in cijfers, bijvoorbeeld "19 − 3 = 16". */
      tekst: string;
      /** Deel dat oplicht, als losse tekst. */
      nadruk?: string;
    };

// ---------------------------------------------------------------------------
// Het script
// ---------------------------------------------------------------------------

/** Houdingen van Vos. De plaatjes heten hetzelfde. */
export type Voshouding = "blij" | "wijzend" | "denkend" | "juichend" | "verrast";

/** Hoe Vos beweegt bij deze stap. */
export type Vosbeweging = "stil" | "praten" | "wijzen" | "juichen";

export type Uitlegstap = {
  /** Wat er in beeld staat. Eén ding tegelijk. */
  model: Model;
  /** Eén korte zin van Vos. Groep 3-4: hoogstens zes woorden. */
  zin: string;
  /**
   * Het kind tikt zelf om mee te tellen. `aantal` is hoe vaak er getikt moet
   * worden voordat de stap af is. `aansporing` is wat Vos herhaalt als het
   * kind nog niets doet.
   */
  meetellen?: { aantal: number; aansporing?: string };
  /** Klein feestje bij deze stap: hier komt het antwoord. */
  feest?: boolean;
  /** Welke houding Vos aanneemt. Elk type geeft dit zelf mee. */
  houding?: Voshouding;
  /** Hoe Vos beweegt. Standaard: praten terwijl de zin klinkt. */
  beweging?: Vosbeweging;
  /** Waar Vos staat. Zo kan hij af en toe naar de andere kant lopen. */
  kant?: "links" | "rechts";
};

export type Uitlegscript = {
  vorm: Groepsvorm;
  /** Welke aanpak wordt getoond. Nooit twee door elkaar. */
  strategie: string;
  strategieNaam: string;
  stappen: Uitlegstap[];
};

/**
 * Wat een generator-type moet leveren.
 *
 * VASTE REGEL: elk type levert een uitlegscript voor alle drie de
 * groepsvormen. Zolang een vorm nog ontbreekt geeft de functie `null` terug;
 * er wordt dan teruggevallen op de stappenlijst en de beheeromgeving
 * waarschuwt dat het type nog niet af is.
 *
 * Let op het verschil per vorm:
 *   - groep 3-4 en 5-6 worden afgespeeld als animatie, met Vos en met tikken;
 *   - groep 7-8 wordt getoond als leeslijst: alles tegelijk, één regel per
 *     stap. Daar horen geen tik-stappen in, en elke stap gebruikt het model
 *     "som". `controleerUitleg` bewaakt dat.
 */
export type Uitlegbron = {
  /** Welke modellen dit type gebruikt, ter informatie in het beheer. */
  modellen: string[];
  /** De strategieën waaruit je per leerdoel kunt kiezen. */
  strategieen: { waarde: string; label: string; uitleg: string }[];
  standaardStrategie: (vorm: Groepsvorm) => string;
  /** Het script voor één som, in één vorm. Null als die vorm er nog niet is. */
  script: (som: Somgegevens, vorm: Groepsvorm, strategie: string) => Uitlegscript | null;
  /** Een nieuwe, vergelijkbare som om daarna te proberen. */
  vergelijkbaar: (som: Somgegevens) => Somgegevens | null;
};

// ---------------------------------------------------------------------------
// Volledigheid bewaken
// ---------------------------------------------------------------------------

export type Scriptgebrek = { vorm: Groepsvorm; wat: string };

export function controleerUitleg(
  bron: Uitlegbron | undefined,
  proef: Somgegevens,
): Scriptgebrek[] {
  if (!bron) {
    return GROEPSVORMEN.map((vorm) => ({ vorm, wat: "Er is nog geen uitleg-animatie." }));
  }

  const gebreken: Scriptgebrek[] = [];
  for (const vorm of GROEPSVORMEN) {
    try {
      const script = bron.script(proef, vorm, bron.standaardStrategie(vorm));
      if (!script) {
        gebreken.push({ vorm, wat: "Deze vorm is nog niet gemaakt." });
      } else if (script.stappen.length === 0) {
        gebreken.push({ vorm, wat: "Het script heeft geen stappen." });
      } else if (vorm === "34" && script.stappen.some((s) => s.zin.split(/\s+/).length > 6)) {
        gebreken.push({ vorm, wat: "Een zin is langer dan zes woorden." });
      } else if (vorm === "78" && script.stappen.some((s) => s.meetellen)) {
        /*
          Groep 7-8 krijgt een lijst die je in één keer leest, geen animatie
          waarin je tikt. Een tik-stap hoort daar dus niet in. Deze controle
          houdt dat vast wanneer er nieuwe types bij komen.
        */
        gebreken.push({ vorm, wat: "Groep 7-8 is een leeslijst; hier hoort geen tik-stap in." });
      } else if (vorm === "78" && script.stappen.some((s) => s.model.soort !== "som")) {
        gebreken.push({
          vorm,
          wat: "Groep 7-8 toont sommen op één regel; gebruik hier het model 'som'.",
        });
      }
    } catch {
      gebreken.push({ vorm, wat: "Het script kon niet worden opgebouwd." });
    }
  }
  return gebreken;
}
