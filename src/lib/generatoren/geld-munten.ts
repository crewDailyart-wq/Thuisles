/**
 * Het domein Geld: munten en briefjes kennen, geld tellen, en betalen.
 *
 * Negen types:
 *
 *   geldwaarde       drie geldstukken; tik op het meest of minst waard
 *   geldvolgorde     sleep vier geldstukken van weinig naar veel
 *   geldtellen       tel het geld en typ het bedrag
 *   geldleggen       leg zelf een bedrag door op munten te tikken
 *   muntenofeuros    hoeveel munten, en hoeveel euro?
 *   geldgroepen      drie of vier vakjes geld; tik op het goede vakje
 *   welkegroepjes    vier groepjes; precies twee kloppen met de prijs
 *   evenveel         3 × 20 cent = ▢ × 10 cent
 *   geldontbreekt    een prijs en wat er ligt; wat ontbreekt er?
 *
 * Alle bedragen in centen; zie `lib/geld.ts`. Bedragen tot 100 euro.
 */

import {
  getal,
  husselen,
  kansGenerator,
  kiesUit,
  lijst,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import {
  GELDSTUKKEN,
  MUNTEN,
  VOORWERPEN,
  antwoordVan,
  bedrag,
  groterEerst,
  inGeldstukken,
  isBriefje,
  naamVan,
  totaal,
  voorwerpNaam,
} from "@/lib/geld";
import { GELDBASIS, bedragkeuzes, geldVraag, geldzinVelden, tussen } from "@/lib/generatoren/geld-gedeeld";

/** Alles tot en met het briefje van 50: bedragen blijven onder de 100 euro. */
const TOT_50 = GELDSTUKKEN.filter((s) => s <= 5000);

/** Een groepje geld als tekst voor de handtekening: grootste eerst. */
function sleutel(stukken: number[]): string {
  return groterEerst(stukken).join("+");
}

// ---------------------------------------------------------------------------
// Welke munt is het meest waard?
// ---------------------------------------------------------------------------

/** Alle drietallen uit een lijst, zonder herhaling. */
function drietallen(lijst: number[]): number[][] {
  const uit: number[][] = [];
  for (let a = 0; a < lijst.length; a++)
    for (let b = a + 1; b < lijst.length; b++)
      for (let c = b + 1; c < lijst.length; c++) uit.push([lijst[a], lijst[b], lijst[c]]);
  return uit;
}

type Waardevraag = { stukken: number[]; vraag: "meest" | "minst" };

/**
 * Alle vragen bij deze instellingen.
 *
 * Bij "munten" eerst de euromunten en daarna de centmunten, zoals WERKPLAN.md
 * het zegt. Er bestaan maar twee euromunten, dus daar liggen er drie met één
 * dubbele: bij "meest" twee van 1 euro en één van 2, bij "minst" andersom.
 * Zo is er altijd precies één goed antwoord.
 *
 * Bij "gemengd" munten en briefjes door elkaar, met de valkuil om en om: een
 * grote munt naast een klein briefje, zoals 50 cent tegenover 5 euro.
 */
function waardevragen(inst: Instellingen): { euro: Waardevraag[]; rest: Waardevraag[] } {
  const keuze = tekst(inst, "vraag", "beide");
  const vragen: ("meest" | "minst")[] =
    keuze === "meest" ? ["meest"] : keuze === "minst" ? ["minst"] : ["meest", "minst"];

  if (tekst(inst, "geld", "munten") === "munten") {
    const euro: Waardevraag[] = [];
    for (const vraag of vragen) {
      const enkel = vraag === "meest" ? 200 : 100;
      const dubbel = vraag === "meest" ? 100 : 200;
      for (let plek = 0; plek < 3; plek++) {
        const stukken = [dubbel, dubbel, dubbel];
        stukken[plek] = enkel;
        euro.push({ stukken, vraag });
      }
    }
    const rest = drietallen([1, 2, 5, 10, 20, 50]).flatMap((d) =>
      vragen.map((vraag) => ({ stukken: d, vraag })),
    );
    return { euro, rest };
  }

  const alles = drietallen(TOT_50.filter((s) => s >= 5)).filter(
    (d) => d.some(isBriefje) && d.some((s) => !isBriefje(s)),
  );
  return { euro: [], rest: alles.flatMap((d) => vragen.map((vraag) => ({ stukken: d, vraag }))) };
}

/** Zit de valkuil erin: een munt van 50 cent of meer naast het briefje van 5? */
function heeftValkuil(stukken: number[]): boolean {
  return stukken.includes(500) && stukken.some((s) => s >= 50 && s <= 200);
}

export const geldwaardeGenerator: Generator = {
  id: "geldwaarde",
  naam: "Welk geld is het meest waard?",
  uitleg:
    "Drie munten of briefjes naast elkaar; het kind tikt op wat het meest — of het minst — waard is. Bij \"alleen munten\" eerst de euromunten, daarna de centmunten.",
  suggestie: "Groep 4: alleen munten · daarna munten en briefjes door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "geld",
      label: "Welk geld",
      opties: [
        { waarde: "munten", label: "Alleen munten — eerst euro's, dan centen" },
        { waarde: "gemengd", label: "Munten en briefjes door elkaar, met een valkuil" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "vraag",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "beide", label: "Het meest en het minst door elkaar" },
        { waarde: "meest", label: "Alleen het meest" },
        { waarde: "minst", label: "Alleen het minst" },
      ],
    },
    ...geldzinVelden("Tik op de munt die het meest waard is."),
  ],
  standaard: { geld: "munten", vraag: "beide" },
  ...GELDBASIS,

  maximum: (inst) => {
    const { euro, rest } = waardevragen(inst);
    return euro.length + rest.length;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { euro, rest } = waardevragen(inst);
    const gemengd = tekst(inst, "geld", "munten") === "gemengd";

    /* Bij gemengd om en om een opgave met en zonder de valkuil. */
    let volgorde: Waardevraag[];
    if (gemengd) {
      const met = husselen(kans, rest.filter((v) => heeftValkuil(v.stukken)));
      const zonder = husselen(kans, rest.filter((v) => !heeftValkuil(v.stukken)));
      volgorde = [];
      for (let i = 0; i < Math.max(met.length, zonder.length); i++) {
        if (met[i]) volgorde.push(met[i]);
        if (zonder[i]) volgorde.push(zonder[i]);
      }
    } else {
      volgorde = [...husselen(kans, euro), ...husselen(kans, rest)];
    }

    const uit: Gegenereerd[] = [];
    for (const v of volgorde) {
      if (uit.length >= aantal) break;
      const stukken = euro.includes(v) ? v.stukken : husselen(kans, v.stukken);
      const handtekening = `geldwaarde:${v.vraag}:${stukken.join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const doel = v.vraag === "meest" ? Math.max(...stukken) : Math.min(...stukken);
      const goed = stukken.indexOf(doel);
      const wat = gemengd ? "op wat" : "op de munt die";
      const zin = `Tik ${wat} het ${v.vraag} waard is.`;
      const som: Somgegevens = {
        soort: "geldwaarde",
        variant: v.vraag,
        getallen: stukken,
        goed: doel,
        extra: { keuze: 1, meest: v.vraag === "meest" ? 1 : 0 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldwaardeGenerator, inst, groep, som, zin),
        antwoord: String(goed),
        figuur: { soort: "geldkiezen", stukken, vraag: v.vraag, goed },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Op volgorde van waarde
// ---------------------------------------------------------------------------

/** Alle viertallen uit een lijst, zonder herhaling. */
function viertallen(lijst: number[]): number[][] {
  const uit: number[][] = [];
  for (let a = 0; a < lijst.length; a++)
    for (let b = a + 1; b < lijst.length; b++)
      for (let c = b + 1; c < lijst.length; c++)
        for (let d = c + 1; d < lijst.length; d++) uit.push([lijst[a], lijst[b], lijst[c], lijst[d]]);
  return uit;
}

function volgordeVoorraad(inst: Instellingen): number[] {
  return tekst(inst, "geld", "gemengd") === "munten"
    ? [...MUNTEN]
    : TOT_50.filter((s) => s >= 5).concat([10000]);
}

export const geldvolgordeGenerator: Generator = {
  id: "geldvolgorde",
  naam: "Geld op volgorde van waarde",
  uitleg:
    "Vier munten of briefjes; het kind sleept ze op volgorde van weinig naar veel waard en drukt op Controleer.",
  suggestie: "Groep 4: munten en briefjes door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "geld",
      label: "Welk geld",
      opties: [
        { waarde: "gemengd", label: "Munten en briefjes door elkaar" },
        { waarde: "munten", label: "Alleen munten" },
      ],
    },
    ...geldzinVelden("Sleep het geld van weinig naar veel waard."),
  ],
  standaard: { geld: "gemengd" },
  ...GELDBASIS,

  maximum: (inst) => viertallen(volgordeVoorraad(inst)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];
    for (const vier of husselen(kans, viertallen(volgordeVoorraad(inst)))) {
      if (uit.length >= aantal) break;
      const handtekening = `geldvolgorde:${sleutel(vier)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /* Nooit al op volgorde klaarleggen: dan valt er niets te slepen. */
      let stukken = husselen(kans, vier);
      if (stukken.every((s, i) => i === 0 || stukken[i - 1] < s)) stukken = [...stukken].reverse();

      const som: Somgegevens = { soort: "geldvolgorde", getallen: stukken, goed: 0, extra: { keuze: 1 } };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldvolgordeGenerator, inst, groep, som, "Sleep het geld van weinig naar veel waard."),
        antwoord: stukken
          .map((_, i) => i)
          .sort((a, b) => stukken[a] - stukken[b])
          .join(","),
        figuur: { soort: "geldvolgorde", stukken },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Geld tellen
// ---------------------------------------------------------------------------

/** Waar een groepje geld bij "door elkaar" uit gekozen wordt. */
const TELGELD = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

export const geldtellenGenerator: Generator = {
  id: "geldtellen",
  naam: "Geld tellen",
  uitleg:
    "Een groepje geld; het kind telt en typt het bedrag. Alleen munten van 1 euro (typen met € ervoor), of munten en briefjes door elkaar (typen als ▢ euro ▢ cent).",
  suggestie: "Groep 4: munten van 1 euro tot 20 · daarna 4 stuks door elkaar",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Welk geld",
      opties: [
        { waarde: "euros", label: "Alleen munten van 1 euro" },
        { waarde: "stuks", label: "Munten en briefjes door elkaar" },
      ],
    },
    { soort: "getal", sleutel: "min", label: "Minste aantal stuks", min: 1, max: 20 },
    { soort: "getal", sleutel: "max", label: "Meeste aantal stuks", min: 1, max: 20 },
    ...geldzinVelden("Hoeveel geld is dit?"),
  ],
  standaard: { stand: "euros", min: 2, max: 20 },
  ...GELDBASIS,

  maximum: (inst) => {
    const min = getal(inst, "min", 2);
    const max = Math.max(min, getal(inst, "max", 20));
    return tekst(inst, "stand", "euros") === "euros" ? max - min + 1 : null;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "euros");
    const min = Math.max(1, getal(inst, "min", 2));
    const max = Math.max(min, Math.min(20, getal(inst, "max", 20)));
    const uit: Gegenereerd[] = [];

    const kandidaten: number[][] =
      stand === "euros"
        ? husselen(
            kans,
            Array.from({ length: max - min + 1 }, (_, i) => Array.from({ length: min + i }, () => 100)),
          )
        : [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 300; poging++) {
      let stukken: number[];
      if (stand === "euros") {
        if (poging >= kandidaten.length) break;
        stukken = kandidaten[poging];
      } else {
        const hoeveel = tussen(kans, min, max);
        stukken = Array.from({ length: hoeveel }, () => kiesUit(kans, TELGELD));
        /* Door elkaar betekent: allebei. En nooit meer dan 100 euro. */
        if (!stukken.some(isBriefje) || stukken.every(isBriefje)) continue;
        if (totaal(stukken) > 10000) continue;
      }
      const handtekening = `geldtellen:${stand}:${sleutel(stukken)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const geschud = stand === "euros" ? stukken : husselen(kans, stukken);
      const som: Somgegevens = {
        soort: "geldtellen",
        variant: stand,
        getallen: geschud,
        goed: totaal(stukken),
        extra: { bedrag: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldtellenGenerator, inst, groep, som, "Hoeveel geld is dit?"),
        antwoord: antwoordVan(totaal(stukken)),
        figuur: {
          soort: "geldtellen",
          stukken: geschud,
          invoer: stand === "euros" ? "bedrag" : "eurocent",
        },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Zelf een bedrag leggen
// ---------------------------------------------------------------------------

const VOORRAADOPTIES = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

/** De munten en briefjes waaruit het kind mag kiezen, in centen. */
function voorraadVan(inst: Instellingen): number[] {
  const gekozen = lijst(inst, "voorraad", ["100"])
    .map(Number)
    .filter((n) => VOORRAADOPTIES.includes(n));
  return (gekozen.length ? gekozen : [100]).sort((a, b) => a - b);
}

/** Welke bedragen er te leggen zijn: in stappen van de kleinste munt, en echt te leggen. */
function legbedragen(inst: Instellingen): number[] {
  const voorraad = voorraadVan(inst);
  const stap = voorraad[0];
  const van = Math.round(getal(inst, "van", 2) * 100);
  const tot = Math.min(10000, Math.round(getal(inst, "tot", 20) * 100));
  const uit: number[] = [];
  for (let b = Math.ceil(van / stap) * stap; b <= tot; b += stap) {
    const stukken = inGeldstukken(b, voorraad);
    /* Nooit meer dan twintig stuks: dat past nog netjes in het vak. */
    if (b > 0 && stukken.length > 0 && stukken.length <= 20) uit.push(b);
  }
  return uit;
}

export const geldleggenGenerator: Generator = {
  id: "geldleggen",
  naam: "Leg het bedrag",
  uitleg:
    "Het kind legt zelf een bedrag door op munten en briefjes te tikken; nog een keer tikken haalt er een weg. Elke goede manier telt. Met een voorwerp en prijskaartje erbij wordt het \"zelf precies betalen\".",
  suggestie: "Groep 4: munten van 1 euro tot 20 euro · daarna 1 en 2 euro · daarna centen",
  velden: [
    {
      soort: "vinkjes",
      sleutel: "voorraad",
      label: "Waaruit het kind mag kiezen",
      opties: VOORRAADOPTIES.map((c) => ({ waarde: String(c), label: naamVan(c) })),
    },
    { soort: "getal", sleutel: "van", label: "Kleinste bedrag (euro)", min: 0.1, max: 100, stap: 0.1 },
    { soort: "getal", sleutel: "tot", label: "Grootste bedrag (euro)", min: 0.1, max: 100, stap: 0.1 },
    {
      soort: "vinkje",
      sleutel: "metPrijs",
      label: "Met een voorwerp en prijskaartje",
      hulp: "Dan staat er een voorwerp met een prijs, en betaalt het kind precies.",
    },
    ...geldzinVelden("Leg 6 euro."),
  ],
  standaard: { voorraad: ["100"], van: 2, tot: 20, metPrijs: false },
  ...GELDBASIS,

  maximum: (inst) => legbedragen(inst).length,

  waarschuwing: (inst) =>
    legbedragen(inst).length === 0
      ? "Met deze munten valt er tussen deze bedragen niets te leggen. Kies een groter bereik of andere munten."
      : null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = voorraadVan(inst);
    const metPrijs = vinkje(inst, "metPrijs");
    const uit: Gegenereerd[] = [];

    for (const doel of husselen(kans, legbedragen(inst))) {
      if (uit.length >= aantal) break;
      const handtekening = `geldleggen:${voorraad.join("+")}:${doel}:${metPrijs ? "prijs" : ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const voorwerp = metPrijs ? kiesUit(kans, VOORWERPEN).plaatje : null;
      const zin = voorwerp
        ? `Betaal ${voorwerpNaam(voorwerp)} precies. Tik op het geld.`
        : doel % 100 === 0
          ? `Leg ${doel / 100} euro.`
          : `Leg ${bedrag(doel)}.`;
      const som: Somgegevens = {
        soort: "geldleggen",
        variant: metPrijs ? "prijs" : "leggen",
        getallen: [doel],
        goed: doel,
        extra: { bedrag: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldleggenGenerator, inst, groep, som, zin),
        antwoord: antwoordVan(doel),
        figuur: { soort: "geldleggen", doel, voorraad, voorwerp },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Munten of euro's?
// ---------------------------------------------------------------------------

function muntvragen(inst: Instellingen): { munt: number; aantal: number }[] {
  const munten = lijst(inst, "munten", ["100", "200"])
    .map(Number)
    .filter((m) => m === 100 || m === 200);
  const max = Math.max(2, Math.min(10, getal(inst, "max", 10)));
  return (munten.length ? munten : [200]).flatMap((munt) =>
    Array.from({ length: max - 1 }, (_, i) => ({ munt, aantal: i + 2 })),
  );
}

export const muntenofeurosGenerator: Generator = {
  id: "muntenofeuros",
  naam: "Munten of euro's?",
  uitleg:
    "Een rijtje munten van 1 of 2 euro. Het kind typt hoeveel munten het zijn en hoeveel euro: ▢ munten en ▢ euro. Bij munten van 2 euro is dat niet hetzelfde getal — daar gaat het om.",
  suggestie: "Groep 4",
  velden: [
    {
      soort: "vinkjes",
      sleutel: "munten",
      label: "Welke munten",
      opties: [
        { waarde: "100", label: "1 euro" },
        { waarde: "200", label: "2 euro" },
      ],
    },
    { soort: "getal", sleutel: "max", label: "Meeste aantal munten", min: 2, max: 10 },
    ...geldzinVelden("Hoeveel munten zijn het? En hoeveel euro?"),
  ],
  standaard: { munten: ["100", "200"], max: 10 },
  ...GELDBASIS,

  maximum: (inst) => muntvragen(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const uit: Gegenereerd[] = [];
    for (const v of husselen(kans, muntvragen(inst))) {
      if (uit.length >= aantal) break;
      const handtekening = `muntenofeuros:${v.munt}x${v.aantal}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const euro = (v.munt * v.aantal) / 100;
      const som: Somgegevens = {
        soort: "muntenofeuros",
        getallen: [v.munt, v.aantal],
        goed: euro,
        extra: { antwoordAantal: v.aantal },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(muntenofeurosGenerator, inst, groep, som, "Hoeveel munten zijn het? En hoeveel euro?"),
        antwoord: `${v.aantal},${euro}`,
        figuur: { soort: "muntenofeuros", munt: v.munt, aantal: v.aantal },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Vakjes met geld: het grootste bedrag, precies betalen, het juiste wisselgeld
// ---------------------------------------------------------------------------

/** Waaruit de groepjes bestaan bij precies betalen. */
const GELDSOORT: Record<string, number[]> = {
  briefjes: [500, 1000, 2000, 5000],
  munten: [10, 20, 50, 100, 200],
  gemengd: [10, 20, 50, 100, 200, 500, 1000, 2000],
};

/** Een prijs die bij deze soort geld past. */
function prijsVoor(kans: () => number, geld: string): number {
  if (geld === "briefjes") return tussen(kans, 2, 19) * 500;
  if (geld === "munten") return tussen(kans, 5, 99) * 10;
  return tussen(kans, 6, 60) * 100 + (kans() < 0.4 ? tussen(kans, 1, 9) * 10 : 0);
}

/** De bedragen waarmee je ernaast zit: zo dichtbij dat je echt moet tellen. */
function bijnaBedragen(prijs: number, geld: string): number[] {
  const stap = geld === "briefjes" ? [500, 1000] : geld === "munten" ? [10, 50, 100] : [100, 500, 50];
  return stap.flatMap((s) => [prijs + s, prijs - s]);
}

export const geldgroepenGenerator: Generator = {
  id: "geldgroepen",
  naam: "Vakjes met geld",
  uitleg:
    "Drie of vier vakjes met munten en briefjes; het kind tikt op het goede vakje. Het vakje met het grootste bedrag, het vakje dat precies de prijs is, of het vakje met precies het goede wisselgeld.",
  suggestie: "Groep 4: precies betalen met briefjes of munten · het grootste bedrag · wisselgeld",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Welk vakje is goed",
      opties: [
        { waarde: "grootste", label: "Het grootste bedrag — drie vakjes" },
        { waarde: "precies", label: "Precies de prijs — drie vakjes A, B en C" },
        { waarde: "wisselgeld", label: "Precies het wisselgeld — vier vakjes" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "geld",
      label: "Welk geld (bij precies de prijs)",
      opties: [
        { waarde: "briefjes", label: "Alleen briefjes — € 60,-" },
        { waarde: "munten", label: "Alleen munten — € 4,90" },
        { waarde: "gemengd", label: "Briefjes en munten door elkaar — € 21,-" },
      ],
    },
    ...geldzinVelden("Welk groepje is precies € 60,-?"),
  ],
  standaard: { stand: "grootste", geld: "briefjes" },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "grootste") as "grootste" | "precies" | "wisselgeld";
    const geld = tekst(inst, "geld", "briefjes");
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      let groepen: number[][] = [];
      let goed = 0;
      let prijs: number | null = null;
      let betaald: number | null = null;
      let voorwerp: string | null = null;
      let zin = "";

      if (stand === "grootste") {
        /* Drie groepjes van twee tot vier stuks, met drie verschillende totalen. */
        groepen = Array.from({ length: 3 }, () =>
          Array.from({ length: tussen(kans, 2, 4) }, () => kiesUit(kans, TELGELD)),
        );
        const totalen = groepen.map(totaal);
        if (new Set(totalen).size < 3 || totalen.some((t) => t > 10000)) continue;
        /* De valkuil: het vakje met de meeste stuks is niet het meeste geld. */
        const meesteStuks = groepen.reduce((m, g, i) => (g.length > groepen[m].length ? i : m), 0);
        goed = totalen.indexOf(Math.max(...totalen));
        if (poging % 2 === 0 && meesteStuks === goed) continue;
        zin = "Tik op het vakje met het meeste geld.";
      } else if (stand === "precies") {
        const toegestaan = GELDSOORT[geld] ?? GELDSOORT.briefjes;
        prijs = prijsVoor(kans, geld);
        const juist = inGeldstukken(prijs, toegestaan);
        if (juist.length === 0 || juist.length > 6) continue;
        /* Door elkaar betekent: in het goede groepje zitten briefjes én munten. */
        if (geld === "gemengd" && (!juist.some(isBriefje) || juist.every(isBriefje))) continue;
        const fout = husselen(kans, bijnaBedragen(prijs, geld))
          .filter((b) => b > 0)
          .map((b) => inGeldstukken(b, toegestaan))
          .filter((g) => g.length > 0 && g.length <= 6);
        const anders = fout.filter((g, i) => fout.findIndex((h) => totaal(h) === totaal(g)) === i);
        if (anders.length < 2) continue;
        groepen = husselen(kans, [juist, anders[0], anders[1]]);
        goed = groepen.indexOf(juist);
        voorwerp = kiesUit(kans, VOORWERPEN).plaatje;
        zin = `Welk groepje is precies ${bedrag(prijs)}?`;
      } else {
        /* Wisselgeld in hele euro's: de prijs onder het briefje dat je geeft. */
        betaald = kiesUit(kans, [500, 1000, 2000]);
        prijs = tussen(kans, 1, betaald / 100 - 1) * 100;
        const terug = betaald - prijs;
        const juist = inGeldstukken(terug, [100, 200, 500, 1000]);
        const fout = [terug + 100, terug - 100, terug + 200, terug - 200, terug + 500]
          .filter((b) => b > 0)
          .map((b) => inGeldstukken(b, [100, 200, 500, 1000]));
        const anders = husselen(kans, fout).filter(
          (g, i, rij) => rij.findIndex((h) => totaal(h) === totaal(g)) === i,
        );
        if (anders.length < 3) continue;
        groepen = husselen(kans, [juist, anders[0], anders[1], anders[2]]);
        goed = groepen.indexOf(juist);
        voorwerp = kiesUit(kans, VOORWERPEN).plaatje;
        const naam = voorwerpNaam(voorwerp);
        zin = `Je betaalt ${bedrag(betaald)}. ${naam.charAt(0).toUpperCase()}${naam.slice(1)} kost ${bedrag(prijs)}. Welk geld krijg je terug?`;
      }

      const handtekening = `geldgroepen:${stand}:${prijs ?? ""}:${betaald ?? ""}:${groepen.map(sleutel).join("/")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gesorteerd = groepen.map(groterEerst);
      const som: Somgegevens = {
        soort: "geldgroepen",
        variant: stand,
        getallen: gesorteerd.map(totaal),
        goed: totaal(gesorteerd[goed]),
        extra: {
          keuze: 1,
          stand: stand === "grootste" ? 0 : stand === "precies" ? 1 : 2,
          ...(prijs !== null ? { prijs } : {}),
          ...(betaald !== null ? { betaald } : {}),
        },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldgroepenGenerator, inst, groep, som, zin),
        antwoord: String(goed),
        figuur: { soort: "geldgroepen", stand, groepen: gesorteerd, goed, prijs, betaald, voorwerp, zin },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke groepjes kloppen?
// ---------------------------------------------------------------------------

/** Dezelfde waarde in kleinere munten, voor een tweede manier om te betalen. */
const SPLITSEN: Record<number, number[]> = {
  200: [100, 100],
  100: [50, 50],
  50: [20, 20, 10],
  20: [10, 10],
};

/** Een andere manier om hetzelfde bedrag te leggen: één munt in kleinere. */
function andereManier(kans: () => number, groep: number[]): number[] | null {
  const te = husselen(
    kans,
    groep.map((_, i) => i).filter((i) => SPLITSEN[groep[i]]),
  );
  if (te.length === 0) return null;
  const i = te[0];
  return [...groep.slice(0, i), ...SPLITSEN[groep[i]], ...groep.slice(i + 1)];
}

export const welkegroepjesGenerator: Generator = {
  id: "welkegroepjes",
  naam: "Welke groepjes kloppen?",
  uitleg:
    "Een voorwerp met een prijs en vier groepjes munten. Precies twee groepjes zijn goed, op een andere manier gelegd; het kind tikt ze allebei aan en drukt op Controleer.",
  suggestie: "Groep 4",
  velden: [...geldzinVelden("Welke twee groepjes zijn precies € 3,50?")],
  standaard: {},
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const munten = [10, 20, 50, 100, 200];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const prijs = tussen(kans, 6, 60) * 10;
      const eerste = inGeldstukken(prijs, munten);
      const tweede = andereManier(kans, eerste);
      if (!tweede || tweede.length > 7) continue;
      const fout = husselen(kans, [prijs + 10, prijs - 10, prijs + 50, prijs - 50, prijs + 100])
        .filter((b) => b > 0)
        .map((b) => inGeldstukken(b, munten));
      if (fout.length < 2) continue;

      const groepen = husselen(kans, [eerste, tweede, fout[0], fout[1]]).map(groterEerst);
      const handtekening = `welkegroepjes:${prijs}:${groepen.map(sleutel).join("/")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const voorwerp = kiesUit(kans, VOORWERPEN).plaatje;
      const zin = `Welke twee groepjes zijn precies ${bedrag(prijs)}?`;
      const som: Somgegevens = {
        soort: "welkegroepjes",
        getallen: groepen.map(totaal),
        goed: prijs,
        extra: { keuze: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(welkegroepjesGenerator, inst, groep, som, zin),
        antwoord: groepen
          .map((g, i) => (totaal(g) === prijs ? i : -1))
          .filter((i) => i >= 0)
          .join(","),
        figuur: { soort: "welkegroepjes", groepen, prijs, voorwerp },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Evenveel waard
// ---------------------------------------------------------------------------

/** Welke munt in welke andere: altijd een heel aantal. */
const WISSELPAREN: [number, number][] = [
  [20, 10],
  [50, 10],
  [10, 5],
  [100, 50],
  [100, 20],
  [200, 100],
  [200, 50],
  [1000, 500],
  [2000, 1000],
  [500, 100],
];

export const evenveelGenerator: Generator = {
  id: "evenveel",
  naam: "Evenveel waard",
  uitleg: "Bijvoorbeeld 3 × 20 cent = ▢ × 10 cent. Het kind typt het getal.",
  suggestie: "Groep 4",
  velden: [
    { soort: "getal", sleutel: "max", label: "Hoogste aantal links", min: 2, max: 9 },
    ...geldzinVelden("Hoeveel munten van 10 cent zijn evenveel waard?"),
  ],
  standaard: { max: 5 },
  ...GELDBASIS,

  maximum: (inst) => WISSELPAREN.length * (Math.max(2, getal(inst, "max", 5)) - 1),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const max = Math.max(2, Math.min(9, getal(inst, "max", 5)));
    const vragen = WISSELPAREN.flatMap(([van, naar]) =>
      Array.from({ length: max - 1 }, (_, i) => ({ van, naar, aantal: i + 2 })),
    );
    const uit: Gegenereerd[] = [];
    for (const v of husselen(kans, vragen)) {
      if (uit.length >= aantal) break;
      const handtekening = `evenveel:${v.aantal}x${v.van}:${v.naar}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const goed = (v.aantal * v.van) / v.naar;
      const zin = `Hoeveel keer ${naamVan(v.naar)} is evenveel waard?`;
      const som: Somgegevens = { soort: "evenveel", getallen: [v.aantal, v.van, v.naar], goed };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(evenveelGenerator, inst, groep, som, zin),
        antwoord: String(goed),
        figuur: { soort: "evenveel", aantal: v.aantal, van: v.van, naar: v.naar },
        somgegevens: som,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Wat ontbreekt er?
// ---------------------------------------------------------------------------

export const geldontbreektGenerator: Generator = {
  id: "geldontbreekt",
  naam: "Wat ontbreekt er?",
  uitleg:
    "Een voorwerp met een prijskaartje en het geld dat er al ligt. Het kind kiest de munt of het briefje dat er nog bij moet (uit drie), of typt het bedrag dat nog ontbreekt.",
  suggestie: "Groep 4: kiezen · daarna typen",
  velden: [
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen welke munt ontbreekt — uit drie" },
        { waarde: "typen", label: "Typen hoeveel er ontbreekt" },
      ],
    },
    ...geldzinVelden("Welke munt moet er nog bij?"),
  ],
  standaard: { antwoord: "kiezen" },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const kiezen = tekst(inst, "antwoord", "kiezen") === "kiezen";
    const toegestaan = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const prijs = kiezen
        ? tussen(kans, 3, 60) * 100
        : tussen(kans, 2, 60) * 100 + (kans() < 0.5 ? tussen(kans, 1, 9) * 10 : 0);
      const alles = inGeldstukken(prijs, toegestaan);
      if (alles.length < 2) continue;

      let liggend: number[];
      let keuzes: number[] | null = null;
      let goed: number;
      if (kiezen) {
        /* Eén stuk weg; de keuzes zijn dat stuk en de twee buren in waarde. */
        const weg = alles[tussen(kans, 0, alles.length - 1)];
        liggend = [...alles];
        liggend.splice(liggend.indexOf(weg), 1);
        const plek = toegestaan.indexOf(weg);
        const buren = [toegestaan[plek - 1], toegestaan[plek + 1], toegestaan[plek + 2], toegestaan[plek - 2]]
          .filter((b): b is number => b !== undefined);
        const k = bedragkeuzes(kans, weg, buren, 3);
        keuzes = k.keuzes;
        goed = k.goed;
      } else {
        const hoeveel = tussen(kans, 1, alles.length - 1);
        liggend = alles.slice(0, hoeveel);
        goed = prijs - totaal(liggend);
      }

      const handtekening = `geldontbreekt:${kiezen ? "k" : "t"}:${prijs}:${sleutel(liggend)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const voorwerp = kiesUit(kans, VOORWERPEN).plaatje;
      const zin = kiezen ? "Welke munt of welk briefje moet er nog bij?" : "Hoeveel geld moet er nog bij?";
      const ontbreekt = prijs - totaal(liggend);
      const som: Somgegevens = {
        soort: "geldontbreekt",
        variant: kiezen ? "kiezen" : "typen",
        getallen: [prijs, totaal(liggend)],
        goed: ontbreekt,
        extra: kiezen ? { keuze: 1 } : { bedrag: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldontbreektGenerator, inst, groep, som, zin),
        antwoord: kiezen ? String(goed) : antwoordVan(ontbreekt),
        figuur: { soort: "geldontbreekt", prijs, liggend: groterEerst(liggend), voorwerp, keuzes, goed },
        somgegevens: som,
      });
    }
    return uit;
  },
};
