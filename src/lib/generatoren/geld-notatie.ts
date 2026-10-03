/**
 * Geldnotatie: een bedrag goed opschrijven (WERKPLAN.md, Geld, onderwerp 2).
 *
 *   schrijfwijze  "52 euro" — kies "€ 52,-" uit drie; met centen uit vier
 *   tellen        getekend geld — typ het bedrag met een komma
 *   woorden       "zeven euro en vijftig cent" — typ het bedrag in cijfers
 *
 * Getypt wordt in één gewoon invoerveld, met het toetsenbord van het apparaat
 * (HARDE REGEL 5). Een punt in plaats van een komma is niet fout: het kind
 * krijgt de hint "Gebruik een komma" en probeert het opnieuw. 7,5 en 7,50 zijn
 * allebei goed. Zie `leesGeldnotatie` in `geldfiguren.ts`.
 *
 * Bij "heel" gaat het alleen om hele euro's: achter het vakje staat al ",-"
 * en het kind typt alleen het getal.
 */

import {
  husselen,
  kansGenerator,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
} from "@/lib/generatoren/soort";
import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { antwoordVan, bedrag, bedragInWoorden, groterEerst, inGeldstukken } from "@/lib/geld";
import { inWoorden } from "@/lib/getalwoorden";
import { GELDBASIS, geldVraag, geldzinVelden, tussen } from "@/lib/generatoren/geld-gedeeld";

const VAST = " ";

/** Twee cijfers achter de komma: 5 wordt "05". */
function twee(n: number): string {
  return String(n).padStart(2, "0");
}

/** Een schrijfwijze zoals een kind hem zou kunnen opschrijven, met € ervoor. */
function metEuro(tekst: string): string {
  return `€${VAST}${tekst}`;
}

/** Wat een opgeschreven bedrag waard is, in centen; null als het geen bedrag is. */
function waardeVan(tekst: string): number | null {
  const m = tekst.match(/^(\d+)(?:,(-|\d{1,2}))?$/);
  if (!m) return null;
  const na = m[2];
  if (na === undefined || na === "-") return Number(m[1]) * 100;
  return Number(m[1]) * 100 + (na.length === 1 ? Number(na) * 10 : Number(na));
}

/**
 * De foute schrijfwijzen bij een bedrag: de denkfouten die kinderen echt maken.
 *
 * De nul vergeten (7,5 bij 7 euro en 5 cent), de komma op de verkeerde plek
 * (75,0 en 0,75), en alles achter elkaar (705,-). Een schrijfwijze die toch
 * hetzelfde bedrag is — 7,5 bij 7 euro en 50 cent — valt af: die is niet fout.
 */
function fouteSchrijfwijzen(cent: number): string[] {
  const e = Math.floor(cent / 100);
  const c = cent % 100;
  const kandidaten =
    c === 0
      ? [`0,${twee(e % 100)}`, `${Math.floor(e / 10)},${e % 10}0`, `${e}0,-`]
      : [
          `${e},${c}`,
          `${e}${twee(c)[0]},${twee(c)[1]}`,
          `0,${e}${c < 10 ? c : c % 10 === 0 ? c / 10 : c}`,
          c % 10 === 0 ? `${e},0${c / 10}` : `${e},0${c % 10}`,
          `${e}${twee(c)},-`,
        ];
  const uit: string[] = [];
  for (const k of kandidaten) {
    const w = waardeVan(k);
    if (w === null || w === cent || w === 0) continue;
    if (uit.some((u) => waardeVan(u) === w || u === k)) continue;
    uit.push(k);
  }
  return uit;
}

/** "één euro" voor 1, anders het getal in woorden: "zeven euro", "achtenveertig euro". */
function euroInWoorden(e: number): string {
  return `${e === 1 ? "één" : inWoorden(e)} euro`;
}

/** Een bedrag helemaal in woorden: "zeven euro en vijftig cent". */
function bedragVoluit(cent: number): string {
  const e = Math.floor(cent / 100);
  const c = cent % 100;
  if (c === 0) return euroInWoorden(e);
  if (e === 0) return `${inWoorden(c)} cent`;
  return `${euroInWoorden(e)} en ${inWoorden(c)} cent`;
}

/** Munten en briefjes voor "tellen tot 10 euro": centen in vijftallen. */
const TOT_10 = [5, 10, 20, 50, 100, 200, 500];
/** En voor "tot 100 euro": alleen hele euro's. */
const TOT_100 = [100, 200, 500, 1000, 2000, 5000];

export const geldnotatieGenerator: Generator = {
  id: "geldnotatie",
  naam: "Geldnotatie",
  uitleg:
    "Een bedrag goed opschrijven: de goede schrijfwijze kiezen (€ 52,-), getekend geld tellen en het bedrag met een komma typen (6,45), of een bedrag in woorden in cijfers typen. Een punt in plaats van een komma geeft de hint \"Gebruik een komma\"; 7,5 en 7,50 zijn allebei goed.",
  suggestie: "Groep 4: eerst kiezen, dan tellen en opschrijven, dan van woorden naar cijfers",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat het kind doet",
      opties: [
        { waarde: "schrijfwijze", label: "De goede schrijfwijze kiezen — € 52,-" },
        { waarde: "tellen", label: "Geld tellen en het bedrag typen — 6,45" },
        { waarde: "woorden", label: "Van woorden naar cijfers — zeven euro en vijftig cent" },
      ],
    },
    {
      soort: "vinkje",
      sleutel: "heel",
      label: "Alleen hele euro's",
      hulp: "Aan = hele euro's tot 100 euro; bij typen staat \",-\" er al achter. Uit = met centen, tot 10 euro.",
    },
    ...geldzinVelden("Hoe schrijf je 52 euro?"),
  ],
  standaard: { stand: "schrijfwijze", heel: true },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "schrijfwijze") as "schrijfwijze" | "tellen" | "woorden";
    const heel = vinkje(inst, "heel", true);
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 200; poging++) {
      /* Hele euro's tot 100, of met centen in vijftallen tot 10 euro. */
      const cent = heel ? tussen(kans, 2, 99) * 100 : tussen(kans, 1, 9) * 100 + tussen(kans, 1, 19) * 5;

      let stukken: number[] | null = null;
      let woorden: string | null = null;
      let keuzes: string[] | null = null;
      let goed = 0;
      let zin = "";

      if (stand === "schrijfwijze") {
        const fout = fouteSchrijfwijzen(cent);
        const hoeveel = heel ? 2 : 3;
        if (fout.length < hoeveel) continue;
        keuzes = husselen(kans, [bedrag(cent), ...husselen(kans, fout).slice(0, hoeveel).map(metEuro)]);
        goed = keuzes.indexOf(bedrag(cent));
        woorden = bedragInWoorden(cent);
        zin = `Hoe schrijf je ${woorden}?`;
      } else if (stand === "tellen") {
        stukken = groterEerst(inGeldstukken(cent, heel ? TOT_100 : TOT_10));
        if (stukken.length === 0 || stukken.length > 7) continue;
        zin = heel ? "Hoeveel euro is dit samen?" : "Hoeveel geld is dit? Schrijf het bedrag met een komma.";
      } else {
        woorden = bedragVoluit(cent);
        zin = "Schrijf dit bedrag in cijfers.";
      }

      const handtekening = `geldnotatie:${stand}:${heel ? "heel" : "cent"}:${cent}:${keuzes?.join("|") ?? stukken?.join("+") ?? ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const som: Somgegevens = {
        soort: "geldnotatie",
        variant: stand,
        getallen: [cent],
        goed: cent,
        extra: { ...(keuzes ? { keuze: 1 } : {}), heel: heel ? 1 : 0 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldnotatieGenerator, inst, groep, som, zin),
        antwoord: keuzes ? String(goed) : antwoordVan(cent),
        figuur: { soort: "geldnotatie", stand, bedrag: cent, stukken, woorden, keuzes, goed, heel },
        somgegevens: som,
      });
    }
    return uit;
  },
};
