/**
 * Verhaaltjessommen (WERKPLAN.md, groep 4): het generator-type.
 *
 * De verhaaltjes zelf staan in `src/lib/verhaaltjes.ts`. Hier wordt gekozen
 * welke soort verhaaltjes bij een oefening horen, in welk getallengebied, en of
 * het kind kiest uit vier knoppen of zelf typt.
 *
 * Elke oefening heeft vijftien vaste opgaven: de sjabloon maakt er vijftien,
 * die worden gepubliceerd, en "vragen per oefensessie" staat op 15. Zo krijgt
 * het kind elke ronde dezelfde vijftien verhaaltjes.
 */

import type { Aanpak, Foutpatroon, Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron } from "@/lib/generatoren/uitlegscript";
import { husselen, kansGenerator, tekst, type Generator, type Gegenereerd } from "@/lib/generatoren/soort";
import {
  AFTREKKEN_METEN,
  AFTREKKEN_TWEEKEER,
  AFTREKKEN_VERSCHIL,
  AFTREKKEN_WEG,
  DELEN_GELD,
  DELEN_GROEPJES,
  DELEN_TEAMS,
  DELEN_VERDELEN,
  KEER_VERDELEN,
  NAMEN,
  OPTELLEN_DRIE,
  OPTELLEN_ERBIJ,
  OPTELLEN_METEN,
  OPTELLEN_SAMEN,
  PLUSMIN_AANVULLEN,
  PLUSMIN_ERBIJERAF,
  PLUSMIN_METEN,
  PLUSMIN_TWEESTAPPEN,
  TAFELS_ELKEDAG,
  TAFELS_GELD,
  TAFELS_GROEPJES,
  TAFELS_RIJEN,
  controleerVerhaal,
  maakKeuzes,
  metEenheid,
  type Bereik,
  type Sjabloon,
  type Thema,
} from "@/lib/verhaaltjes";

// ---------------------------------------------------------------------------
// Welke verhaaltjes bij welke oefening
// ---------------------------------------------------------------------------

const PLUS_MIN = [
  ...OPTELLEN_ERBIJ, ...OPTELLEN_SAMEN, ...OPTELLEN_METEN, ...OPTELLEN_DRIE,
  ...AFTREKKEN_WEG, ...AFTREKKEN_VERSCHIL, ...AFTREKKEN_METEN, ...AFTREKKEN_TWEEKEER,
  ...PLUSMIN_ERBIJERAF, ...PLUSMIN_AANVULLEN, ...PLUSMIN_TWEESTAPPEN,
];
const TAFELS = [...TAFELS_GROEPJES, ...TAFELS_RIJEN, ...TAFELS_ELKEDAG, ...TAFELS_GELD];
const DELEN = [...DELEN_VERDELEN, ...DELEN_GROEPJES, ...DELEN_GELD, ...DELEN_TEAMS];

/** Per onderwerp de situaties, in de volgorde van WERKPLAN.md. */
export const SITUATIES: Record<string, { waarde: string; label: string; sjablonen: Sjabloon[] }[]> = {
  optellen: [
    { waarde: "erbij", label: "Erbij krijgen", sjablonen: OPTELLEN_ERBIJ },
    { waarde: "samen", label: "Samen", sjablonen: OPTELLEN_SAMEN },
    { waarde: "meten", label: "Langer, hoger, later", sjablonen: OPTELLEN_METEN },
    { waarde: "drie", label: "Drie getallen", sjablonen: OPTELLEN_DRIE },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: [...OPTELLEN_ERBIJ, ...OPTELLEN_SAMEN, ...OPTELLEN_METEN, ...OPTELLEN_DRIE] },
  ],
  aftrekken: [
    { waarde: "weg", label: "Weggeven en opmaken", sjablonen: AFTREKKEN_WEG },
    { waarde: "verschil", label: "Verschil", sjablonen: AFTREKKEN_VERSCHIL },
    { waarde: "meten", label: "Korter, lager, eerder", sjablonen: AFTREKKEN_METEN },
    { waarde: "tweekeer", label: "Twee keer eraf", sjablonen: AFTREKKEN_TWEEKEER },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: [...AFTREKKEN_WEG, ...AFTREKKEN_VERSCHIL, ...AFTREKKEN_METEN, ...AFTREKKEN_TWEEKEER] },
  ],
  plusmin: [
    { waarde: "erbijeraf", label: "Erbij of eraf?", sjablonen: PLUSMIN_ERBIJERAF },
    { waarde: "aanvullen", label: "Hoeveel meer nodig?", sjablonen: PLUSMIN_AANVULLEN },
    { waarde: "tweestappen", label: "Twee stappen", sjablonen: PLUSMIN_TWEESTAPPEN },
    { waarde: "meten", label: "Meten en datums", sjablonen: PLUSMIN_METEN },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: [...PLUSMIN_ERBIJERAF, ...PLUSMIN_AANVULLEN, ...PLUSMIN_TWEESTAPPEN, ...PLUSMIN_METEN] },
  ],
  tafels: [
    { waarde: "groepjes", label: "Groepjes", sjablonen: TAFELS_GROEPJES },
    { waarde: "rijen", label: "Rijen", sjablonen: TAFELS_RIJEN },
    { waarde: "elkedag", label: "Elke dag", sjablonen: TAFELS_ELKEDAG },
    { waarde: "geld", label: "Geld", sjablonen: TAFELS_GELD },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: TAFELS },
  ],
  delen: [
    { waarde: "verdelen", label: "Eerlijk verdelen", sjablonen: DELEN_VERDELEN },
    { waarde: "groepjes", label: "Groepjes maken", sjablonen: DELEN_GROEPJES },
    { waarde: "geld", label: "Geld verdelen", sjablonen: DELEN_GELD },
    { waarde: "teams", label: "Teams en rijen", sjablonen: DELEN_TEAMS },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: DELEN },
  ],
  keerdeel: [
    { waarde: "keerofdeel", label: "Keer of delen?", sjablonen: [...TAFELS, ...DELEN] },
    { waarde: "groepjes", label: "Groepjes", sjablonen: [...TAFELS_GROEPJES, ...DELEN_GROEPJES] },
    { waarde: "verdelen", label: "Verdelen", sjablonen: [...DELEN_VERDELEN, ...KEER_VERDELEN] },
    { waarde: "geld", label: "Geld", sjablonen: [...TAFELS_GELD, ...DELEN_GELD] },
    { waarde: "mix", label: "Alles door elkaar", sjablonen: [...TAFELS, ...DELEN, ...KEER_VERDELEN] },
  ],
  alles: (["school", "winkel", "spel", "thuis"] as Thema[])
    .map((thema): { waarde: string; label: string; sjablonen: Sjabloon[] } => ({
      waarde: thema,
      label: { school: "Op school", winkel: "In de winkel", spel: "Sport en spel", thuis: "Thuis" }[thema],
      sjablonen: [...PLUS_MIN, ...TAFELS, ...DELEN, ...KEER_VERDELEN].filter((s) => s.thema === thema),
    }))
    .concat([{ waarde: "mix", label: "Alles door elkaar", sjablonen: [...PLUS_MIN, ...TAFELS, ...DELEN, ...KEER_VERDELEN] }]),
};

const ONDERWERPEN = [
  { waarde: "optellen", label: "Optellen" },
  { waarde: "aftrekken", label: "Aftrekken" },
  { waarde: "plusmin", label: "Optellen en aftrekken" },
  { waarde: "tafels", label: "Tafels" },
  { waarde: "delen", label: "Delen" },
  { waarde: "keerdeel", label: "Tafels en delen" },
  { waarde: "alles", label: "Alles door elkaar" },
];

/** Het getallengebied: het kopje, en bij typen tot 100 ook over het tiental. */
function bereikVan(onderwerp: string, tot: number, typen: boolean, kans: () => number): Bereik {
  if (onderwerp === "alles") return { tot: 100, min: 10, brug: null };
  if (tot <= 20) return { tot: 20, min: 4, brug: null };
  if (tot <= 50) return { tot: 50, min: 21, brug: null };
  /* Tot en met 100: kiezen zonder over het tiental, typen ook over het tiental. */
  return { tot: 100, min: 51, brug: typen ? (kans() < 0.6 ? true : null) : false };
}

// ---------------------------------------------------------------------------
// De som achter het verhaal, voor de uitleg
// ---------------------------------------------------------------------------

/** De som als tekst: "12 + 7 = 19". Uit de getallen in het verhaal en het antwoord. */
export function somVan(getallen: number[], goed: number): string {
  const [a, b, c] = getallen;
  if (getallen.length === 2) {
    if (a + b === goed) return `${a} + ${b} = ${goed}`;
    if (a - b === goed) return `${a} − ${b} = ${goed}`;
    if (a * b === goed) return `${a} × ${b} = ${goed}`;
    if (b !== 0 && a / b === goed) return `${a} : ${b} = ${goed}`;
  }
  if (getallen.length === 3) {
    if (a + b + c === goed) return `${a} + ${b} + ${c} = ${goed}`;
    if (a - b - c === goed) return `${a} − ${b} − ${c} = ${goed}`;
    if (a + b - c === goed) return `${a} + ${b} − ${c} = ${goed}`;
    if (a - b + c === goed) return `${a} − ${b} + ${c} = ${goed}`;
  }
  return String(goed);
}

/** Wat voor som het is, in een woord voor de uitleg. */
function soortSom(getallen: number[], goed: number): string {
  const s = somVan(getallen, goed);
  if (s.includes("×")) return "keer";
  if (s.includes(":")) return "delen";
  if (s.includes("+") && s.includes("−")) return "erbij en eraf";
  if (s.includes("−")) return "eraf";
  return "erbij";
}

const verhaalAanpak: Aanpak = {
  zin: (som): Record<Leeftijdsgroep, string> => {
    const welke = soortSom(som.getallen, som.goed);
    return {
      "34": "Lees het verhaal. Komt er iets bij of gaat er iets af?",
      "56": `Lees het verhaal goed en zoek de getallen. Hier is het ${welke}: ${somVan(som.getallen, som.goed)}.`,
      "78": `Zoek eerst wat er gebeurt: komt er iets bij, gaat er iets af, zijn het groepjes of wordt er verdeeld? Hier is het ${welke}: ${somVan(som.getallen, som.goed)}.`,
    };
  },
  stappen: (som) => [
    { tekst: "Lees het verhaal en zoek de getallen.", som: som.getallen.join(" en ") },
    { tekst: `Wat gebeurt er? Het is ${soortSom(som.getallen, som.goed)}.`, som: somVan(som.getallen, som.goed) },
    { tekst: "Dat is het antwoord.", som: String(som.goed) },
  ],
  controle: (som) => `Het goede antwoord is ${som.goed}, want ${somVan(som.getallen, som.goed)}.`,
};

const verhaalPatronen: Foutpatroon[] = [
  {
    id: "verkeerde-bewerking",
    naam: "De verkeerde som gemaakt",
    herkent: (som, gegeven) =>
      som.extra?.keuze !== 1 && som.extra?.verkeerd !== undefined && gegeven === som.extra.verkeerd && gegeven !== som.goed,
    kindtekst: {
      "34": "Kijk nog eens: komt er iets bij of gaat er iets af?",
      "56": "Je hebt een andere som gemaakt dan het verhaal vraagt. Lees nog eens wat er gebeurt.",
      "78": "Het rekenen klopt, maar de som past niet bij het verhaal. Zoek de woorden die zeggen wat er gebeurt, zoals erbij, weg, elk of eerlijk verdelen.",
    },
    hint: "Lees het verhaal nog eens. Wordt het meer of minder?",
    uitleg: (som) => [
      { tekst: "Wat gebeurt er in het verhaal?", som: soortSom(som.getallen, som.goed) },
      { tekst: "Dan hoort deze som erbij.", som: somVan(som.getallen, som.goed) },
    ],
    ouder: {
      uitleg: "De som is goed uitgerekend, maar het was de verkeerde som bij het verhaal.",
      zinnen: [
        "Vraag: wat gebeurt er in het verhaal? Komt er iets bij of gaat er iets af?",
        "Speel het verhaal na met blokjes of knikkers.",
      ],
      schoolwoord: "redactiesom",
    },
  },
];

const STRATEGIE = {
  waarde: "lees-zoek-reken",
  label: "Lees, zoek de som, reken",
  uitleg: "Lees het verhaal, zoek welke som erbij hoort, en reken die uit.",
};

const verhaalUitleg: Uitlegbron = {
  modellen: ["som"],
  strategieen: [STRATEGIE],
  standaardStrategie: () => STRATEGIE.waarde,
  script(som, vorm: Groepsvorm) {
    const kort = MANIER_VAN_VORM[vorm] === "34";
    const stappen = [
      { som: som.getallen.join(" en "), zin: kort ? "Zoek de getallen." : "Lees het verhaal en zoek de getallen." },
      {
        som: somVan(som.getallen, som.goed),
        zin: kort ? "Maak de som." : `Wat gebeurt er? Het is ${soortSom(som.getallen, som.goed)}.`,
      },
      { som: String(som.goed), zin: kort ? "Dat is het antwoord!" : `Het antwoord is ${som.goed}.` },
    ];
    return {
      vorm,
      strategie: STRATEGIE.waarde,
      strategieNaam: STRATEGIE.label,
      stappen: stappen.map((s, i) => {
        const laatste = i === stappen.length - 1;
        return {
          model: { soort: "som" as const, tekst: s.som },
          zin: s.zin,
          houding: laatste ? ("juichend" as const) : ("wijzend" as const),
          ...(laatste ? { feest: true, beweging: "juichen" as const } : {}),
        };
      }),
    };
  },
  vergelijkbaar: () => null,
};

// ---------------------------------------------------------------------------
// De generator
// ---------------------------------------------------------------------------

const ZIN = "{zin}";
const ZINNEN: Record<Leeftijdsgroep, string> = { "34": ZIN, "56": ZIN, "78": ZIN };

export const verhaaltjeGenerator: Generator = {
  id: "verhaaltje",
  naam: "Verhaaltjessom",
  uitleg:
    "Een kort verhaaltje met een som erin, in de tegenwoordige tijd, met de vraag als laatste zin. Het kind kiest uit vier knoppen met de eenheid erbij (\"12 stickers\"), of typt het getal in een gewoon invoerveld met de eenheid erachter. Elk verhaaltje is nagekeken op zinslengte, vraagvorm en getallengebied.",
  suggestie: "Groep 4: optellen en aftrekken tot en met 20, 50 en 100; tafels en delen",
  velden: [
    { soort: "keuze", sleutel: "onderwerp", label: "Onderwerp", opties: ONDERWERPEN },
    {
      soort: "tekst",
      sleutel: "situatie",
      label: "Situatie",
      plaatshouder: "erbij",
      hulp: "Optellen: erbij, samen, meten, drie, mix · Aftrekken: weg, verschil, meten, tweekeer, mix · Optellen en aftrekken: erbijeraf, aanvullen, tweestappen, meten, mix · Tafels: groepjes, rijen, elkedag, geld, mix · Delen: verdelen, groepjes, geld, teams, mix · Tafels en delen: keerofdeel, groepjes, verdelen, geld, mix · Alles door elkaar: school, winkel, spel, thuis, mix",
    },
    {
      soort: "keuze",
      sleutel: "tot",
      label: "Getallengebied",
      opties: [
        { waarde: "20", label: "Tot en met 20" },
        { waarde: "50", label: "Tot en met 50" },
        { waarde: "100", label: "Tot en met 100" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen uit vier knoppen met de eenheid erbij" },
        { waarde: "typen", label: "Typen in een invoerveld met de eenheid erachter" },
      ],
    },
    { soort: "getal", sleutel: "niveau", label: "Bolletjes (1 tot en met 5)", min: 1, max: 5 },
  ],
  vraagteksten: { standaard: ZINNEN },
  standaard: { onderwerp: "optellen", situatie: "erbij", tot: "20", antwoord: "kiezen", niveau: 1 },
  foutpatronen: verhaalPatronen,
  aanpak: verhaalAanpak,
  uitleganimatie: verhaalUitleg,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad) {
    const kans = kansGenerator(zaad);
    const onderwerp = SITUATIES[tekst(inst, "onderwerp", "optellen")] ? tekst(inst, "onderwerp", "optellen") : "optellen";
    const situaties = SITUATIES[onderwerp];
    const situatie = situaties.find((s) => s.waarde === tekst(inst, "situatie", situaties[0].waarde)) ?? situaties[0];
    const tot = Number(tekst(inst, "tot", "20")) || 20;
    const typen = tekst(inst, "antwoord", "kiezen") === "typen";
    const uit: Gegenereerd[] = [];
    /* Elk verhaal zo veel mogelijk een ander sjabloon: eerst ieder één keer, dan opnieuw. */
    let volgorde: Sjabloon[] = [];

    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      if (volgorde.length === 0) volgorde = husselen(kans, situatie.sjablonen);
      const sjabloon = volgorde.shift()!;
      const bereik = bereikVan(onderwerp, tot, typen, kans);
      const namen = husselen(kans, NAMEN).slice(0, 3);
      const v = sjabloon.maak(kans, bereik, namen);
      if (!v) continue;
      if (controleerVerhaal(v, bereik)) continue;
      const verhaal = v.zinnen.join(" ");
      const handtekening = `verhaaltje:${verhaal}`;
      if (alGebruikt.has(handtekening)) continue;

      const getallen = v.uitVerhaal;
      let keuzes: string[] | null = null;
      let goed = 0;
      if (!typen) {
        const knoppen = maakKeuzes(v, kans);
        if (!knoppen) continue;
        keuzes = knoppen.map((n) => metEenheid(n, v.eenheid));
        goed = knoppen.indexOf(v.antwoord);
      }
      alGebruikt.add(handtekening);

      const som: Somgegevens = {
        soort: "verhaaltje",
        variant: sjabloon.id,
        getallen,
        goed: v.antwoord,
        extra: {
          ...(keuzes ? { keuze: 1 } : {}),
          ...(v.verkeerd !== null && v.verkeerd > 0 ? { verkeerd: v.verkeerd } : {}),
        },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: verhaal,
        antwoord: keuzes ? String(goed) : String(v.antwoord),
        figuur: {
          soort: "verhaaltje",
          keuzes,
          goed,
          eenheid: v.eenheid.mv,
          sjabloon: sjabloon.id,
        },
        somgegevens: som,
      });
    }
    return uit;
  },
};
