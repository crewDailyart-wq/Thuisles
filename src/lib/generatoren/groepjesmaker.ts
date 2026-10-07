/**
 * De groepjesmaker (Tafels, oktober 2026): de eerste Godot-bouwsteen.
 *
 * Het kind bouwt de keersom zelf in een kast met doosjes eikels: met − en +
 * kiest het hoeveel eikels er in één doosje gaan, en per tik komt er een
 * doosje bij. De plussom groeit mee (3 + 3 + 3) en krimpt tot de keersom
 * (3 × 3). Pas als de bouw klopt, werkt het antwoordvakje. Afspraak: 4 × 3 =
 * 4 doosjes van 3; andersom gebouwd (3 doosjes van 4) mag ook, dat is evenveel.
 *
 * Bij alle 15 opgaven met de groepjesmaker (ONTWERPREGELS.md: oefeningen met
 * een bouwsteen). Na een fout antwoord bouwt de kast zelf de goede manier en
 * telt mee in sprongen. Godot tekent en bouwt; Thuisles kijkt na.
 *
 * Standen:
 *   groepjes   gewoon bouwen, 2 tot en met 5 doosjes van 2 tot en met 5
 *   nul-een    × 0 en × 1 ontdekken: 0 × 4, 1 × 6, 6 × 1
 *   wissel     eerst voorspellen of het na draaien evenveel is, dan draaien
 *   knip       een moeilijke tafel knippen in twee makkelijke: 7 × 8 = 5 × 8 + 2 × 8
 *   gemengd    van alles wat, in die volgorde (de oefening "Groepjes maken")
 */

import {
  husselen,
  kansGenerator,
  tekst,
  bepaalVraagtekst,
  vraagtekstVelden,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { keerPatronen } from "@/lib/generatoren/patronen/keerdelen";
import { keersomAanpak } from "@/lib/generatoren/aanpak/keerdelen";
import { keersomUitleg } from "@/lib/generatoren/scripts/keerdelen";

export type GroepjesStand = "groepjes" | "nul-een" | "wissel" | "knip";
type Keuze = GroepjesStand | "gemengd";
const KEUZES: Keuze[] = ["gemengd", "groepjes", "nul-een", "wissel", "knip"];

/** Doosjes en eikels per doosje: nooit meer dan 10, zo groot is de kast. */
export const MAX_DOOSJES = 10;

const ZIN = "Reken uit.";
const ZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

function keuzeVan(inst: Instellingen): Keuze {
  const s = tekst(inst, "stand", "gemengd") as Keuze;
  return KEUZES.includes(s) ? s : "gemengd";
}

type Som = { a: number; b: number; stand: GroepjesStand };

/** Alle sommen die bij een stand horen: a doosjes van b eikels. */
function sommenVan(stand: GroepjesStand): Som[] {
  const uit: Som[] = [];
  const voeg = (a: number, b: number) => uit.push({ a, b, stand });
  if (stand === "groepjes") {
    for (let a = 2; a <= 5; a++) for (let b = 2; b <= 5; b++) voeg(a, b);
  } else if (stand === "nul-een") {
    for (let b = 2; b <= 9; b++) voeg(0, b);
    for (let b = 2; b <= 9; b++) voeg(1, b);
    for (let a = 2; a <= 9; a++) voeg(a, 1);
  } else if (stand === "wissel") {
    for (let a = 2; a <= 6; a++) for (let b = 2; b <= 5; b++) if (a !== b) voeg(a, b);
  } else {
    for (let a = 6; a <= 9; a++) for (let b = 2; b <= 5; b++) voeg(a, b);
  }
  return uit;
}

/** Hoeveel van elke stand er in "gemengd" komen, in deze volgorde. */
const GEMENGD: [GroepjesStand, number][] = [
  ["groepjes", 6],
  ["nul-een", 3],
  ["wissel", 3],
  ["knip", 3],
];

const opMoeite = (x: Som, y: Som) => x.a * x.b - y.a * y.b || x.a - y.a;

export const groepjesmakerGenerator: Generator = {
  id: "groepjesmaker",
  naam: "Groepjes maken (groepjesmaker)",
  uitleg:
    "Het kind bouwt de keersom met doosjes eikels: kies hoeveel er in één doosje gaan en tik voor elk doosje op de kast. De plussom groeit mee en krimpt tot de keersom. Daarna typt het kind het antwoord. Bij alle 15 opgaven; na een fout antwoord bouwt de kast zelf de goede manier.",
  suggestie: "Groep 4: gemengd (groepjes, × 0 en × 1, wisselen, knippen)",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Soort som",
      opties: [
        { waarde: "gemengd", label: "Gemengd: groepjes, × 0 en × 1, wisselen, knippen" },
        { waarde: "groepjes", label: "Groepjes maken (4 × 3)" },
        { waarde: "nul-een", label: "Keer 0 en keer 1 (0 × 4, 1 × 6, 6 × 1)" },
        { waarde: "wissel", label: "Wisselen: draaien en evenveel (3 × 4 en 4 × 3)" },
        { waarde: "knip", label: "Knippen in twee makkelijke (7 × 8 = 5 × 8 + 2 × 8)" },
      ],
    },
    ...vraagtekstVelden(ZINNEN),
  ],
  vraagteksten: { standaard: ZINNEN, som: (s) => `${s.getallen[0]} × ${s.getallen[1]}` },
  standaard: { stand: "gemengd" },
  foutpatronen: keerPatronen,
  aanpak: keersomAanpak,
  uitleganimatie: keersomUitleg,

  maximum: (inst) => {
    const k = keuzeVan(inst);
    return k === "gemengd" ? GEMENGD.reduce((n, [, m]) => n + m, 0) : sommenVan(k).length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const k = keuzeVan(inst);
    const reeks: Som[] =
      k === "gemengd"
        ? GEMENGD.flatMap(([stand, m]) => husselen(kans, sommenVan(stand)).slice(0, m).sort(opMoeite))
        : husselen(kans, sommenVan(k)).slice(0, 15).sort(opMoeite);

    const uit: Gegenereerd[] = [];
    for (const { a, b, stand } of reeks) {
      if (uit.length >= aantal) break;
      const handtekening = `groepjesmaker:${stand}:${a}x${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const gegevens = {
        soort: "keersom",
        variant: "groepjesmaker",
        getallen: [a, b],
        goed: a * b,
        extra: { tafel: a, mee: b, product: a * b },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(groepjesmakerGenerator, inst, groep, gegevens),
        antwoord: String(a * b),
        figuur: { soort: "groepjesmaker", stand, a, b, volgnummer: uit.length + 1 },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};
