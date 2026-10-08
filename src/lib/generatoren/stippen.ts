/**
 * De stippen (oktober 2026), een Godot-spel van het algemene soort (zie
 * `components/oefenen/GodotSpel.tsx`). Naar het idee van Synthesis "Dot
 * Destruction", "Difference Dimension" en "Compare the Pair".
 *
 *   stipweg        a stippen; het kind tikt er b weg en typt wat er overblijft
 *   stipverschil   twee rijen; het kind typt hoeveel de bovenste rij meer heeft
 *   stipvergelijk  twee rijen; het kind tikt de rij met de meeste (of minste)
 *   stipteken      twee rijen met hun getal; het kind kiest <, = of >
 *
 * Bij weg en verschil horen de denkfouten en de uitleg van de minsom. Bij
 * vergelijken staan ze hieronder zelf: die van de vissen noemen vissen, en die
 * staan hier niet in beeld (ONTWERPREGELS.md: de tekst noemt wat er te zien is).
 *
 * Alle 15 opgaven met de stippen (ONTWERPREGELS.md: oefeningen met een bouwsteen).
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  bepaalVraagtekst,
  vraagtekstVelden,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Aanpak, Foutpatroon, Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import { erafPatronen } from "@/lib/generatoren/patronen/erafsommen";
import { minsomAanpak } from "@/lib/generatoren/aanpak/erafsommen";
import { minsomUitleg } from "@/lib/generatoren/scripts/erafsommen";
import { stuks } from "@/lib/maatje/taal";

const stippen = (n: number) => stuks(n, "stip", "stippen");

function grenzen(inst: Instellingen) {
  const van = Math.max(2, Math.min(20, getal(inst, "van", 3)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 10)));
  return { van, tot };
}

const BEREIKVELDEN = [
  { soort: "getal" as const, sleutel: "van", label: "Kleinste getal", min: 2, max: 20 },
  { soort: "getal" as const, sleutel: "tot", label: "Grootste getal", min: 2, max: 20 },
];

/** Van makkelijk naar moeilijk: de volgorde waarin de opgaven komen. */
function nummer(uit: Gegenereerd[], sleutel: (v: Gegenereerd) => number) {
  uit.sort((x, y) => sleutel(x) - sleutel(y));
  uit.forEach((v, i) => ((v.figuur as { volgnummer: number }).volgnummer = i + 1));
  return uit;
}

// ---------------------------------------------------------------------------
// Wegtikken
// ---------------------------------------------------------------------------

const WEGZIN = "Tik er {som} weg. Hoeveel blijven er over?";
const WEGZINNEN: Record<Leeftijdsgroep, string> = { "34": WEGZIN, "56": WEGZIN, "78": WEGZIN };

function wegVoorraad(inst: Instellingen): [number, number][] {
  const { van, tot } = grenzen(inst);
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) for (let b = 1; b <= Math.min(9, a - 1); b++) uit.push([a, b]);
  return uit;
}

export const stipwegGenerator: Generator = {
  id: "stipweg",
  naam: "De stippen: tik ze weg (aftrekken)",
  uitleg:
    "Een tienveld (of twee) met stippen. Het kind tikt er zelf zoveel weg als de som zegt; ze springen kapot. Daarna typt het hoeveel er overblijven. Bij alle 15 opgaven.",
  suggestie: "Groep 3: 3 tot en met 10 stippen · groep 4: 11 tot en met 20",
  velden: [...BEREIKVELDEN, ...vraagtekstVelden(WEGZINNEN)],
  vraagteksten: { standaard: WEGZINNEN, som: (s) => String(s.getallen[1]) },
  standaard: { van: 3, tot: 10 },
  foutpatronen: erafPatronen,
  aanpak: minsomAanpak,
  uitleganimatie: minsomUitleg,
  maximum: (inst) => wegVoorraad(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = wegVoorraad(inst);
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      const handtekening = `stipweg:${a}-${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const c = a - b;
      const gegevens = { soort: "minsom", variant: "stippen", getallen: [a, b], goed: c };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(stipwegGenerator, inst, groep, gegevens),
        antwoord: String(c),
        figuur: {
          soort: "godotspel",
          spel: "stippen",
          stand: "weg",
          invoer: "typen",
          kop: `${a} − ${b} = ?`,
          label: "Hoeveel stippen blijven er over?",
          wacht: true,
          opgave: { a, b },
          goedZin: `${a} min ${b} is ${c}.`,
          foutZin: `Er blijven ${stippen(c)} over: ${a} min ${b} is ${c}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    return nummer(uit, (v) => v.somgegevens.getallen[0] * 10 + v.somgegevens.getallen[1]);
  },
};

// ---------------------------------------------------------------------------
// Verschil
// ---------------------------------------------------------------------------

const VERSCHILZIN = "Hoeveel stippen heeft de bovenste rij meer?";
const VERSCHILZINNEN: Record<Leeftijdsgroep, string> = { "34": VERSCHILZIN, "56": VERSCHILZIN, "78": VERSCHILZIN };

function verschilVoorraad(inst: Instellingen): [number, number][] {
  const { van, tot } = grenzen(inst);
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) for (let b = 1; b < a; b++) if (a - b <= 9) uit.push([a, b]);
  return uit;
}

export const stipverschilGenerator: Generator = {
  id: "stipverschil",
  naam: "De stippen: hoeveel meer? (verschil)",
  uitleg:
    "Twee rijen stippen onder elkaar, netjes naast elkaar gezet. Het kind typt hoeveel stippen de bovenste rij meer heeft. Na Controleer lichten de stippen op die geen partner hebben. Bij alle 15 opgaven.",
  suggestie: "Groep 3: tot en met 10 · groep 4: tot en met 20",
  velden: [...BEREIKVELDEN, ...vraagtekstVelden(VERSCHILZINNEN)],
  vraagteksten: { standaard: VERSCHILZINNEN },
  standaard: { van: 3, tot: 10 },
  foutpatronen: erafPatronen,
  aanpak: minsomAanpak,
  uitleganimatie: minsomUitleg,
  maximum: (inst) => verschilVoorraad(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = verschilVoorraad(inst);
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      const handtekening = `stipverschil:${a}-${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const c = a - b;
      const gegevens = { soort: "minsom", variant: "verschil", getallen: [a, b], goed: c };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(stipverschilGenerator, inst, groep, gegevens),
        antwoord: String(c),
        figuur: {
          soort: "godotspel",
          spel: "stippen",
          stand: "verschil",
          invoer: "typen",
          kop: `${a} − ${b} = ?`,
          label: "Hoeveel stippen meer?",
          wacht: true,
          opgave: { a, b },
          goedZin: `De bovenste rij heeft er ${c} meer: ${a} min ${b} is ${c}.`,
          foutZin: `Kijk naar de stippen zonder buurman: dat zijn er ${c}. ${a} min ${b} is ${c}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    return nummer(uit, (v) => v.somgegevens.goed * 100 + v.somgegevens.getallen[0]);
  },
};

// ---------------------------------------------------------------------------
// Vergelijken: de rij met de meeste (of minste), en de tekens <, =, >
// ---------------------------------------------------------------------------

const groter = (som: Somgegevens) => Math.max(som.getallen[0], som.getallen[1] ?? 0);
const kleiner = (som: Somgegevens) => Math.min(som.getallen[0], som.getallen[1] ?? 0);

/** Het teken tussen de twee getallen, als woorden. */
function tekenWoorden(a: number, b: number): string {
  return a > b ? `${a} is meer dan ${b}` : a < b ? `${a} is minder dan ${b}` : `${a} is evenveel als ${b}`;
}

export const vergelijkPatronen: Foutpatroon[] = [
  {
    id: "andersom",
    naam: "Meer en minder omgedraaid",
    /* Het antwoord is een rij of een teken, geen getal; herkend wordt het via de teksten van het maatje. */
    herkent: () => false,
    kindtekst: {
      "34": "Kijk nog eens: welke rij is langer?",
      "56": "Je hebt meer en minder omgedraaid. De langste rij heeft de meeste stippen.",
      "78": "Je hebt meer en minder verwisseld. Zet de rijen naast elkaar: de rij die verder doorloopt, heeft er meer.",
    },
    hint: "Leg de rijen naast elkaar: welke loopt verder door?",
    uitleg: (som) => [
      { tekst: "Zet de stippen naast elkaar.", som: "" },
      { tekst: "De langste rij heeft er meer.", som: `${groter(som)}` },
    ],
    ouder: {
      uitleg: "Het kind draait meer en minder om, of kijkt naar het verkeerde getal. Naast elkaar zetten maakt het verschil zichtbaar zonder te tellen.",
      zinnen: ["Leg twee rijtjes knopen of blokjes naast elkaar: welk rijtje steekt uit?", "Zeg erbij: deze heeft er meer, deze minder."],
      schoolwoord: "vergelijken",
    },
  },
];

export const vergelijkAanpak: Aanpak = {
  zin: () => ({
    "34": "Kijk welke rij langer is.",
    "56": "Zet de rijen naast elkaar: de langste heeft de meeste.",
    "78": "Vergelijk de twee hoeveelheden: welke heeft er meer, en hoeveel meer?",
  }),
  stappen: (som) => [
    { tekst: "Zet de rijen naast elkaar.", som: "" },
    { tekst: "Welke rij loopt verder door?", som: "" },
    groter(som) === kleiner(som)
      ? { tekst: `${groter(som)} is evenveel als ${kleiner(som)}.`, som: `${groter(som)} = ${kleiner(som)}` }
      : { tekst: `${groter(som)} is meer dan ${kleiner(som)}.`, som: `${groter(som)} > ${kleiner(som)}` },
  ],
  controle: (som) => (groter(som) === kleiner(som) ? `${groter(som)} is evenveel als ${kleiner(som)}.` : `${groter(som)} is meer dan ${kleiner(som)}.`),
};

function vergelijkScript(som: Somgegevens, vorm: Groepsvorm): Uitlegscript {
  const g = groter(som);
  const k = kleiner(som);
  const kort = MANIER_VAN_VORM[vorm] === "34";
  if (g === k) {
    return {
      vorm,
      strategie: "naast-elkaar",
      strategieNaam: "naast elkaar zetten",
      stappen: [
        { model: { soort: "som", tekst: `${g} en ${k}` }, zin: kort ? "Kijk naar de twee rijen." : "Zet de twee rijen naast elkaar." },
        { model: { soort: "som", tekst: `${g} = ${k}`, nadruk: "=" }, zin: kort ? "Ze zijn even lang." : `Ze lopen even ver door: ${g} is evenveel als ${k}.`, feest: true },
      ],
    };
  }
  return {
    vorm,
    strategie: "naast-elkaar",
    strategieNaam: "naast elkaar zetten",
    stappen: [
      { model: { soort: "som", tekst: `${som.getallen[0]} en ${som.getallen[1]}` }, zin: kort ? "Kijk naar de twee rijen." : "Zet de twee rijen naast elkaar." },
      { model: { soort: "som", tekst: `${g} > ${k}`, nadruk: `${g}` }, zin: kort ? `${g} is meer dan ${k}.` : `De rij van ${g} loopt verder door dan de rij van ${k}.`, feest: true },
    ],
  };
}

export const vergelijkUitleg: Uitlegbron = {
  modellen: ["som"],
  strategieen: [{ waarde: "naast-elkaar", label: "Naast elkaar zetten", uitleg: "Zet de twee hoeveelheden naast elkaar; de rij die verder doorloopt, heeft er meer." }],
  standaardStrategie: () => "naast-elkaar",
  script: (som, vorm) => (som.getallen.length >= 2 ? vergelijkScript(som, vorm) : null),
  vergelijkbaar: (som) => ({ ...som, getallen: [som.getallen[0] + 1, som.getallen[1]] }),
};

const MEESTEZIN = "Tik op de rij met de meeste stippen.";
const MINSTEZIN = "Tik op de rij met de minste stippen.";
const MEESTEZINNEN: Record<Leeftijdsgroep, string> = { "34": MEESTEZIN, "56": MEESTEZIN, "78": MEESTEZIN };

function paarVoorraad(inst: Instellingen, gelijkMag: boolean): [number, number][] {
  const { van, tot } = grenzen(inst);
  const uit: [number, number][] = [];
  for (let a = van; a <= tot; a++) for (let b = van; b <= tot; b++) if (gelijkMag || a !== b) uit.push([a, b]);
  return uit;
}

export const stipvergelijkGenerator: Generator = {
  id: "stipvergelijk",
  naam: "De stippen: welke rij heeft de meeste?",
  uitleg:
    "Twee rijen stippen onder elkaar, zonder getallen. Het kind tikt de rij met de meeste (of de minste) stippen. Na Controleer lichten de stippen op die meer zijn. Bij alle 15 opgaven.",
  suggestie: "Groep 3: tot en met 10 · groep 4: tot en met 20",
  velden: [
    ...BEREIKVELDEN,
    {
      soort: "keuze",
      sleutel: "zoek",
      label: "Wat zoekt het kind?",
      opties: [
        { waarde: "meeste", label: "De meeste" },
        { waarde: "beide", label: "De meeste en de minste door elkaar" },
      ],
    },
    ...vraagtekstVelden(MEESTEZINNEN),
  ],
  vraagteksten: { standaard: MEESTEZINNEN },
  standaard: { van: 2, tot: 10, zoek: "meeste" },
  foutpatronen: vergelijkPatronen,
  aanpak: vergelijkAanpak,
  uitleganimatie: vergelijkUitleg,
  maximum: (inst) => paarVoorraad(inst, false).length * (tekst(inst, "zoek", "meeste") === "beide" ? 2 : 1),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = paarVoorraad(inst, false);
    const beide = tekst(inst, "zoek", "meeste") === "beide";
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      const meeste = !beide || kans() < 0.5;
      const handtekening = `stipvergelijk:${meeste ? "meeste" : "minste"}:${a}-${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const boven = meeste ? a > b : a < b;
      const gegevens = { soort: "vergelijken", variant: meeste ? "meeste" : "minste", getallen: [a, b], goed: meeste ? Math.max(a, b) : Math.min(a, b) };
      const zin = meeste ? MEESTEZIN : MINSTEZIN;
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst({ vraagteksten: { standaard: { "34": zin, "56": zin, "78": zin } } }, inst, groep, gegevens),
        antwoord: boven ? "boven" : "onder",
        figuur: {
          soort: "godotspel",
          spel: "stippen",
          stand: "vergelijk",
          invoer: "kiezen",
          kop: "",
          label: zin,
          opgave: { a, b, zoek: meeste ? "meeste" : "minste" },
          goedZin: `Ja: ${tekenWoorden(a, b)}.`,
          foutZin: `De ${boven ? "bovenste" : "onderste"} rij heeft de ${meeste ? "meeste" : "minste"}: ${tekenWoorden(a, b)}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    /* Een groot verschil is makkelijker dan een klein verschil. */
    return nummer(uit, (v) => -Math.abs(v.somgegevens.getallen[0] - v.somgegevens.getallen[1]) * 100 + v.somgegevens.getallen[0]);
  },
};

const TEKENZIN = "Kies het goede teken.";
const TEKENZINNEN: Record<Leeftijdsgroep, string> = { "34": TEKENZIN, "56": TEKENZIN, "78": TEKENZIN };

export const stiptekenGenerator: Generator = {
  id: "stipteken",
  naam: "De stippen: <, = of >",
  uitleg:
    "Twee rijen stippen met hun getal ervoor. Het kind kiest in het spel het teken: < (minder dan), = (evenveel) of > (meer dan). Het teken komt tussen de getallen boven het spel te staan. Bij alle 15 opgaven.",
  suggestie: "Groep 4: tot en met 20, met af en toe evenveel",
  velden: [...BEREIKVELDEN, ...vraagtekstVelden(TEKENZINNEN)],
  vraagteksten: { standaard: TEKENZINNEN },
  standaard: { van: 2, tot: 20 },
  foutpatronen: vergelijkPatronen,
  aanpak: vergelijkAanpak,
  uitleganimatie: vergelijkUitleg,
  maximum: (inst) => paarVoorraad(inst, true).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = paarVoorraad(inst, true);
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      /* Evenveel komt af en toe voor, niet in een derde van de opgaven. */
      if (a === b && kans() < 0.7) continue;
      if (a === b && uit.filter((v) => v.antwoord === "=").length >= 2) continue;
      const handtekening = `stipteken:${a}-${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);
      const teken = a > b ? ">" : a < b ? "<" : "=";
      const gegevens = { soort: "vergelijken", variant: "teken", getallen: [a, b], goed: Math.max(a, b) };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(stiptekenGenerator, inst, groep, gegevens),
        antwoord: teken,
        figuur: {
          soort: "godotspel",
          spel: "stippen",
          stand: "teken",
          invoer: "kiezen",
          kop: `${a} ? ${b}`,
          label: `Kies het teken tussen ${a} en ${b}.`,
          opgave: { a, b },
          goedZin: `${a} ${teken} ${b}: ${tekenWoorden(a, b)}.`,
          foutZin: `${a} ${teken} ${b}: ${tekenWoorden(a, b)}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    return nummer(uit, (v) => -Math.abs(v.somgegevens.getallen[0] - v.somgegevens.getallen[1]) * 100 + v.somgegevens.getallen[0]);
  },
};
