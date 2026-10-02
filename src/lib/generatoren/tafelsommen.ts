/**
 * De opdrachten van het domein Tafels.
 *
 * Tien types, en samen dekken ze de zestien titels uit WERKPLAN.md:
 *
 *   Keersommen begrijpen
 *     keerraster          blokjes in rijen; hoeveel zijn het samen?
 *     keerplaatjes        plaatjes in rijen; het kind vult ▢ × ▢ = ▢ in
 *     handigkeer          een som die je kent, en daarmee een nieuwe maken
 *     keernullen          2 × ▢ = 6, 2 × ▢ = 60, 2 × ▢ = 600
 *
 *   Tafels oefenen
 *     keersom             de kale keersom. Eén type voor "Tafels van 1 tot en
 *                         met 5", "6 tot en met 10", "door elkaar", "11 tot en
 *                         met 15" en "16 tot en met 20": alleen de vinkjes
 *                         verschillen.
 *     keerkoppelen        vijf keersommen met de uitkomsten ernaartoe slepen
 *     welkekeersom        een uitkomst staat er; typ zelf een keersom
 *
 *   Keersom en deelsom
 *     keerdeelkoppelen    bij elke deelsom de keersom slepen die erbij hoort
 *     keerdeelsamen       20 : 2 = ▢ en ▢ × 2 = 20
 *
 *   Keersommen in het echt
 *     marktkraam          een kraampje met prijzen; wat kost het samen, en
 *                         hoeveel krijg je terug?
 *
 * De notatie is overal met een maalteken: 3 × 5. Nooit een sterretje en nooit
 * een punt.
 *
 * De basisversie is kaal rekenen; beeld komt later (WERKPLAN.md). Daarom staat
 * er bij deze types nog geen instelling voor hoeveel sommen visueel beginnen.
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
  type Veld,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { heelGetalBovenaan } from "@/lib/generatoren/bovenaan";
import { TELPLAATJE_OPTIES } from "@/lib/telplaatjes";
import { keerPatronen, rasterPatronen } from "@/lib/generatoren/patronen/keerdelen";
import {
  handigkeerAanpak,
  keerdeelkoppelenAanpak,
  keerdeelsamenAanpak,
  keerkoppelenAanpak,
  keernullenAanpak,
  keerplaatjesAanpak,
  keerrasterAanpak,
  keersomAanpak,
  marktkraamAanpak,
  welkekeersomAanpak,
} from "@/lib/generatoren/aanpak/keerdelen";
import {
  handigkeerUitleg,
  keerdeelkoppelenUitleg,
  keerdeelsamenUitleg,
  keerkoppelenUitleg,
  keernullenUitleg,
  keerplaatjesUitleg,
  keerrasterUitleg,
  keersomUitleg,
  marktkraamUitleg,
  welkekeersomUitleg,
} from "@/lib/generatoren/scripts/keerdelen";

/**
 * De tafels die je kunt aanvinken: 1 tot en met 20.
 *
 * Tot en met 10 is groep 4 en 5; 11 tot en met 20 staat in WERKPLAN.md als
 * uitdaging op niveau groep 5. Daarom staan ze er allemaal, en bepaalt de
 * oefening zelf welke meedoen.
 */
const TAFELS = Array.from({ length: 20 }, (_, i) => i + 1);

const TAFELVELD: Veld = {
  soort: "vinkjes",
  sleutel: "tafels",
  label: "Welke tafels",
  opties: TAFELS.map((n) => ({ waarde: String(n), label: `Tafel van ${n}` })),
  hulp: "Eén aanvinken geeft één tafel; meer aanvinken geeft ze door elkaar.",
};

const MEEVELD: Veld = {
  soort: "getal",
  sleutel: "max",
  label: "Hoogste tweede getal",
  min: 1,
  max: 10,
  hulp: "De tafel loopt van 1 tot en met dit getal: met 10 krijg je 3 × 1 tot en met 3 × 10.",
};

function gekozenTafels(inst: Instellingen, terugval: string[] = ["1", "2", "5", "10"]): number[] {
  const gekozen = lijst(inst, "tafels", terugval)
    .map(Number)
    .filter((n) => TAFELS.includes(n));
  return gekozen.length ? gekozen : terugval.map(Number);
}

function maxMee(inst: Instellingen): number {
  return Math.max(1, Math.min(10, getal(inst, "max", 10)));
}

/** De somgegevens zoals alle types van dit domein ze opbouwen. */
function gegevensVan(
  soort: string,
  variant: string,
  getallen: number[],
  goed: number,
  tafel: number,
  mee: number,
  extra: Record<string, number> = {},
) {
  return {
    soort,
    variant,
    getallen,
    goed,
    extra: { tafel, mee, product: tafel * mee, ...extra },
  };
}

// ---------------------------------------------------------------------------
// De kale keersom
// ---------------------------------------------------------------------------

const KEERZIN = "Hoeveel is {som}?";
const KEERZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KEERZIN,
  "56": KEERZIN,
  "78": "Reken uit: {som}",
};

export const keersomGenerator: Generator = {
  id: "keersom",
  naam: "Keersom (kale som)",
  uitleg:
    "De keersom staat er kaal: 3 × 5 = ▢, met grote cijfers en een maalteken. Vink één tafel aan voor één tafel, of meer voor tafels door elkaar.",
  suggestie: "Groep 4: tafels 1 tot en met 5, daarna 6 tot en met 10 · groep 5: 11 tot en met 20",
  velden: [
    TAFELVELD,
    MEEVELD,
    ...vraagtekstVelden(KEERZINNEN, {
      voorbeeldzinnen: {
        "34": "Hoeveel is 3 × 5?",
        "56": "Hoeveel is 3 × 5?",
        "78": "Reken uit: 3 × 5",
      },
      extraHulp: "Op de plek van {som} komt de keersom zelf te staan.",
    }),
  ],
  vraagteksten: {
    standaard: KEERZINNEN,
    som: (s) => `${s.getallen[0]} × ${s.getallen[1]}`,
  },
  standaard: { tafels: ["1", "2", "3", "4", "5"], max: 10 },
  foutpatronen: keerPatronen,
  aanpak: keersomAanpak,
  uitleganimatie: keersomUitleg,

  maximum: (inst) => gekozenTafels(inst).length * maxMee(inst),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst, ["1", "2", "3", "4", "5"]);
    const max = maxMee(inst);

    const maak = (tafel: number, mee: number): Gegenereerd | null => {
      const handtekening = `keersom:${tafel}x${mee}`;
      if (alGebruikt.has(handtekening)) return null;
      alGebruikt.add(handtekening);

      const gegevens = gegevensVan("keersom", "kaal", [tafel, mee], tafel * mee, tafel, mee);
      return {
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keersomGenerator, inst, groep, gegevens),
        antwoord: String(tafel * mee),
        figuur: { soort: "keersom", eerste: tafel, tweede: mee },
        somgegevens: gegevens,
      };
    };

    const uit: Gegenereerd[] = [];
    /* Eerst met de nadruk op de hogere sommen, daarna de hele voorraad. */
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const som = maak(kiesUit(kans, tafels), heelGetalBovenaan(kans, 1, max));
      if (som) uit.push(som);
    }
    const alles = tafels.flatMap((t) => Array.from({ length: max }, (_, i) => [t, i + 1]));
    for (const [tafel, mee] of husselen(kans, alles)) {
      if (uit.length >= aantal) break;
      const som = maak(tafel, mee);
      if (som) uit.push(som);
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Rijen en kolommen tellen
// ---------------------------------------------------------------------------

const RASTERZIN = "Hoeveel zijn het samen?";
const RASTERZINNEN: Record<Leeftijdsgroep, string> = {
  "34": RASTERZIN,
  "56": RASTERZIN,
  "78": RASTERZIN,
};

/** De vier grenzen van een raster, binnen wat op het scherm past. */
function rastergrenzen(inst: Instellingen, maxKolommen: number) {
  const rijenVan = Math.max(1, Math.min(10, getal(inst, "rijenVan", 2)));
  const rijenTot = Math.max(rijenVan, Math.min(10, getal(inst, "rijenTot", 6)));
  const kolommenVan = Math.max(2, Math.min(maxKolommen, getal(inst, "kolommenVan", 2)));
  const kolommenTot = Math.max(kolommenVan, Math.min(maxKolommen, getal(inst, "kolommenTot", maxKolommen)));
  return { rijenVan, rijenTot, kolommenVan, kolommenTot };
}

function rastervelden(maxKolommen: number, kolomhulp: string): Veld[] {
  return [
    { soort: "getal", sleutel: "rijenVan", label: "Minste rijen", min: 1, max: 10 },
    { soort: "getal", sleutel: "rijenTot", label: "Meeste rijen", min: 1, max: 10 },
    { soort: "getal", sleutel: "kolommenVan", label: "Minste per rij", min: 2, max: maxKolommen },
    {
      soort: "getal",
      sleutel: "kolommenTot",
      label: "Meeste per rij",
      min: 2,
      max: maxKolommen,
      hulp: kolomhulp,
    },
  ];
}

/** Alle rasters die binnen de grenzen passen. */
function rasters(g: ReturnType<typeof rastergrenzen>): [number, number][] {
  const uit: [number, number][] = [];
  for (let r = g.rijenVan; r <= g.rijenTot; r++) {
    for (let k = g.kolommenVan; k <= g.kolommenTot; k++) uit.push([r, k]);
  }
  return uit;
}

export const keerrasterGenerator: Generator = {
  id: "keerraster",
  naam: "Rijen en kolommen tellen",
  uitleg:
    "Blokjes in rijen, bijvoorbeeld 5 rijen van 3, en het kind typt hoeveel het er samen zijn. De eerste stap naar een keersom: je ziet dat even grote rijen bij elkaar een keersom zijn.",
  suggestie: "Groep 4: 2 tot 6 rijen van 2 tot 6",
  velden: [
    ...rastervelden(10, "Een raster is hoogstens tien breed; dan blijft het op een telefoon te volgen."),
    ...vraagtekstVelden(RASTERZINNEN),
  ],
  vraagteksten: { standaard: RASTERZINNEN },
  standaard: { rijenVan: 2, rijenTot: 6, kolommenVan: 2, kolommenTot: 6 },
  foutpatronen: rasterPatronen,
  aanpak: keerrasterAanpak,
  uitleganimatie: keerrasterUitleg,

  maximum: (inst) => rasters(rastergrenzen(inst, 10)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const mogelijk = rasters(rastergrenzen(inst, 10));
    if (mogelijk.length === 0) return [];

    const uit: Gegenereerd[] = [];
    for (const [rijen, kolommen] of husselen(kans, mogelijk)) {
      if (uit.length >= aantal) break;

      const handtekening = `keerraster:${rijen}x${kolommen}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = gegevensVan(
        "keerraster",
        "tellen",
        [rijen, kolommen],
        rijen * kolommen,
        rijen,
        kolommen,
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keerrasterGenerator, inst, groep, gegevens),
        antwoord: String(rijen * kolommen),
        figuur: { soort: "keerraster", rijen, kolommen },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Een keersom bij een plaatje
// ---------------------------------------------------------------------------

const PLAATJESZIN = "Maak de keersom.";
const PLAATJESZINNEN: Record<Leeftijdsgroep, string> = {
  "34": PLAATJESZIN,
  "56": PLAATJESZIN,
  "78": PLAATJESZIN,
};

const GEMENGD = TELPLAATJE_OPTIES.map((o) => o.waarde);

export const keerplaatjesGenerator: Generator = {
  id: "keerplaatjes",
  naam: "Een keersom bij een plaatje",
  uitleg:
    "Plaatjes in even grote rijen; het kind vult de hele som in: ▢ × ▢ = ▢. Hoogstens vijf op een rij, zodat het te overzien blijft.",
  suggestie: "Groep 4: 2 tot 6 rijen van 2 tot 5",
  velden: [
    ...rastervelden(5, "Hoogstens vijf op een rij; dat is de afspraak uit de ontwerpregels."),
    {
      soort: "keuze",
      sleutel: "voorwerp",
      label: "Welke voorwerpjes",
      opties: [
        { waarde: "gemengd", label: "Door elkaar" },
        ...TELPLAATJE_OPTIES.map((o) => ({ waarde: o.waarde, label: o.meervoud })),
      ],
      hulp: "Per vraag staat er altijd één soort; „door elkaar” loopt alle soorten langs, elke vraag een andere.",
    },
    ...vraagtekstVelden(PLAATJESZINNEN),
  ],
  vraagteksten: { standaard: PLAATJESZINNEN },
  standaard: { rijenVan: 2, rijenTot: 6, kolommenVan: 2, kolommenTot: 5, voorwerp: "gemengd" },
  foutpatronen: rasterPatronen,
  aanpak: keerplaatjesAanpak,
  uitleganimatie: keerplaatjesUitleg,

  maximum: (inst) => rasters(rastergrenzen(inst, 5)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const mogelijk = rasters(rastergrenzen(inst, 5));
    if (mogelijk.length === 0) return [];
    const voorwerp = tekst(inst, "voorwerp", "gemengd");
    const reeks = husselen(kans, GEMENGD);

    const uit: Gegenereerd[] = [];
    for (const [rijen, kolommen] of husselen(kans, mogelijk)) {
      if (uit.length >= aantal) break;

      const handtekening = `keerplaatjes:${rijen}x${kolommen}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const soort = voorwerp === "gemengd" ? reeks[uit.length % reeks.length] : voorwerp;
      const gegevens = gegevensVan(
        "keerplaatjes",
        "som",
        [rijen, kolommen],
        rijen * kolommen,
        rijen,
        kolommen,
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keerplaatjesGenerator, inst, groep, gegevens),
        /* De hele som: eerst de rijen, dan het aantal per rij, dan het totaal. */
        antwoord: `${rijen},${kolommen},${rijen * kolommen}`,
        figuur: { soort: "keerplaatjes", rijen, kolommen, voorwerp: soort },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Handig rekenen met keersommen
// ---------------------------------------------------------------------------

const HANDIGZIN = "Gebruik de som die je al kent.";
const HANDIGZINNEN: Record<Leeftijdsgroep, string> = {
  "34": HANDIGZIN,
  "56": HANDIGZIN,
  "78": HANDIGZIN,
};

type Handigstap = "dubbel" | "tienkeer";

function handigstappen(inst: Instellingen): Handigstap[] {
  const keuze = tekst(inst, "stap", "dubbel");
  if (keuze === "tienkeer") return ["tienkeer"];
  if (keuze === "beide") return ["dubbel", "tienkeer"];
  return ["dubbel"];
}

/** Welke tweede getallen bij een stap passen; het nieuwe getal blijft netjes. */
function handigMee(stap: Handigstap): number[] {
  /* Verdubbelen: het nieuwe getal mag niet boven tien uitkomen. */
  if (stap === "dubbel") return [1, 2, 3, 4, 5];
  /* Tien keer zoveel: één tot en met tien, dus tien tot en met honderd. */
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

export const handigkeerGenerator: Generator = {
  id: "handigkeer",
  naam: "Handig rekenen met keersommen",
  uitleg:
    "Boven staat een som die het kind al kent, helemaal uitgerekend: 1 × 5 = 5. Eronder staat de nieuwe som met een leeg vakje: 1 × 10 = ▢. Zo leert het dat je een moeilijke som uit een makkelijke kunt maken.",
  suggestie: "Groep 4: tafels 1, 2, 5 en 10, verdubbelen · groep 5: ook tien keer zoveel",
  velden: [
    TAFELVELD,
    {
      soort: "keuze",
      sleutel: "stap",
      label: "Hoe de nieuwe som uit de oude volgt",
      opties: [
        { waarde: "dubbel", label: "Twee keer zoveel — 1 × 5 wordt 1 × 10" },
        { waarde: "tienkeer", label: "Tien keer zoveel — 2 × 3 wordt 2 × 30" },
        { waarde: "beide", label: "Allebei, door elkaar" },
      ],
    },
    ...vraagtekstVelden(HANDIGZINNEN),
  ],
  vraagteksten: { standaard: HANDIGZINNEN },
  standaard: { tafels: ["1", "2", "5", "10"], stap: "dubbel" },
  foutpatronen: keerPatronen,
  aanpak: handigkeerAanpak,
  uitleganimatie: handigkeerUitleg,

  letOp: (inst) => {
    const tafels = gekozenTafels(inst);
    const grootste = Math.max(...tafels) * 100;
    if (handigstappen(inst).includes("tienkeer") && grootste > 200) {
      return `Met tien keer zoveel kan de uitkomst tot ${grootste} oplopen. Dat is meer dan groep 4 gewend is; vink eventueel alleen de lagere tafels aan.`;
    }
    return null;
  },

  maximum: (inst) =>
    gekozenTafels(inst).reduce(
      (totaal, tafel) =>
        totaal +
        handigstappen(inst).reduce(
          (n, stap) =>
            n +
            handigMee(stap).filter(
              (mee) => tafel * (stap === "dubbel" ? mee * 2 : mee * 10) <= 999,
            ).length,
          0,
        ),
      0,
    ),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst);
    const stappen = handigstappen(inst);

    /*
      Een invulvakje neemt hoogstens drie cijfers, dus een antwoord boven de 999
      zou niet te typen zijn. Zulke combinaties vallen weg; dat kan alleen bij
      "tien keer zoveel" met een hoge tafel.
    */
    const alles = stappen
      .flatMap((stap) =>
        tafels.flatMap((tafel) => handigMee(stap).map((mee) => ({ stap, tafel, mee }))),
      )
      .filter(({ stap, tafel, mee }) => tafel * (stap === "dubbel" ? mee * 2 : mee * 10) <= 999);

    const uit: Gegenereerd[] = [];
    for (const { stap, tafel, mee } of husselen(kans, alles)) {
      if (uit.length >= aantal) break;

      const handtekening = `handigkeer:${stap}:${tafel}x${mee}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const nieuweMee = stap === "dubbel" ? mee * 2 : mee * 10;
      const gegevens = gegevensVan(
        "handigkeer",
        stap,
        [tafel, mee],
        tafel * nieuweMee,
        tafel,
        mee,
        { nieuweMee },
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(handigkeerGenerator, inst, groep, gegevens),
        antwoord: String(tafel * nieuweMee),
        figuur: { soort: "handigkeer", tafel, mee, stap },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Rekenen met nullen
// ---------------------------------------------------------------------------

const NULLENZIN = "Vul in.";
const NULLENZINNEN: Record<Leeftijdsgroep, string> = {
  "34": NULLENZIN,
  "56": NULLENZIN,
  "78": NULLENZIN,
};

/**
 * Welke paren bij "Rekenen met nullen" mogen.
 *
 * Twee grenzen, en ze zijn er allebei met een reden:
 *
 *   - het antwoord op de derde regel is het tweede getal met twee nullen
 *     erachter, en een invulvakje neemt hoogstens drie cijfers. Met een tweede
 *     getal tot en met 9 blijft het antwoord dus altijd typbaar;
 *   - de uitkomst op de derde regel is honderd keer de eerste som. Blijft die
 *     eerste som onder de twintig, dan staat er hoogstens 2000 op het scherm —
 *     groot genoeg om de nullen te laten zien, klein genoeg om te lezen.
 */
function nullenparen(tafels: number[], max: number): [number, number][] {
  const uit: [number, number][] = [];
  for (const tafel of tafels) {
    for (let mee = 1; mee <= Math.min(max, 9); mee++) {
      if (tafel * mee <= 20) uit.push([tafel, mee]);
    }
  }
  return uit;
}

export const keernullenGenerator: Generator = {
  id: "keernullen",
  naam: "Rekenen met nullen",
  uitleg:
    "Een rijtje van drie sommen onder elkaar: 2 × ▢ = 6, 2 × ▢ = 60, 2 × ▢ = 600. Dezelfde tafel, en bij de uitkomst komt er elke regel een nul bij — dus bij het antwoord ook.",
  suggestie: "Groep 5 als uitdaging: tafels 2 tot en met 5",
  velden: [
    TAFELVELD,
    MEEVELD,
    ...vraagtekstVelden(NULLENZINNEN),
  ],
  vraagteksten: { standaard: NULLENZINNEN },
  standaard: { tafels: ["2", "3", "4", "5"], max: 9 },
  foutpatronen: keerPatronen,
  aanpak: keernullenAanpak,
  uitleganimatie: keernullenUitleg,

  waarschuwing: (inst) => {
    const paren = nullenparen(gekozenTafels(inst, ["2", "3", "4", "5"]), maxMee(inst));
    if (paren.length === 0) {
      return "Met deze tafels past er geen enkel rijtje: de eerste som moet onder de twintig blijven, anders wordt de derde regel onleesbaar lang. Vink een lagere tafel aan.";
    }
    return null;
  },

  maximum: (inst) => nullenparen(gekozenTafels(inst, ["2", "3", "4", "5"]), maxMee(inst)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst, ["2", "3", "4", "5"]);
    const max = maxMee(inst);

    const alles = nullenparen(tafels, max);

    const uit: Gegenereerd[] = [];
    for (const [tafel, mee] of husselen(kans, alles)) {
      if (uit.length >= aantal) break;

      const handtekening = `keernullen:${tafel}x${mee}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = gegevensVan("keernullen", "nullen", [tafel, mee], mee, tafel, mee);
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keernullenGenerator, inst, groep, gegevens),
        /* Drie vakjes, van boven naar beneden: het getal met nul, tien en honderd. */
        antwoord: `${mee},${mee * 10},${mee * 100}`,
        figuur: { soort: "keernullen", tafel, mee },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Keersommen koppelen
// ---------------------------------------------------------------------------

const KOPPELZIN = "Sleep de uitkomst naar de som.";
const KOPPELZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KOPPELZIN,
  "56": KOPPELZIN,
  "78": KOPPELZIN,
};

const RIJENVELD: Veld = {
  soort: "getal",
  sleutel: "rijen",
  label: "Hoeveel sommen",
  min: 3,
  max: 6,
  hulp: "Alle uitkomsten zijn verschillend, zodat er precies één goede indeling is.",
};

function hoeveelRijen(inst: Instellingen): number {
  return Math.max(3, Math.min(6, getal(inst, "rijen", 5)));
}

export const keerkoppelenGenerator: Generator = {
  id: "keerkoppelen",
  naam: "Koppel de keersom aan de uitkomst",
  uitleg:
    "Links een rijtje keersommen, rechts de uitkomsten door elkaar. Het kind sleept elke uitkomst naar de goede som; tikken werkt ook. Hergebruikt het koppel-onderdeel van Optellen.",
  suggestie: "Groep 4: tafels 1, 2, 5 en 10 · groep 5: alle tien, vijf sommen",
  velden: [TAFELVELD, MEEVELD, RIJENVELD, ...vraagtekstVelden(KOPPELZINNEN)],
  vraagteksten: { standaard: KOPPELZINNEN },
  standaard: { tafels: ["1", "2", "5", "10"], max: 10, rijen: 5 },
  foutpatronen: keerPatronen,
  aanpak: keerkoppelenAanpak,
  uitleganimatie: keerkoppelenUitleg,

  waarschuwing: (inst) => {
    const mogelijk = new Set(
      gekozenTafels(inst).flatMap((t) =>
        Array.from({ length: maxMee(inst) }, (_, i) => t * (i + 1)),
      ),
    );
    if (mogelijk.size < hoeveelRijen(inst)) {
      return `Er zijn ${hoeveelRijen(inst)} sommen gevraagd, maar met deze tafels bestaan er maar ${mogelijk.size} verschillende uitkomsten. Vink meer tafels aan of vraag minder sommen.`;
    }
    return null;
  },

  maximum: (inst) => {
    const paren = gekozenTafels(inst).length * maxMee(inst);
    return paren < hoeveelRijen(inst) ? 0 : paren * 20;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst);
    const max = maxMee(inst);
    const rijen = hoeveelRijen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Verschillende uitkomsten, zodat er precies één goede indeling is. */
      const sommen: { eerste: number; tweede: number }[] = [];
      const uitkomsten: number[] = [];
      for (let ronde = 0; ronde < 120 && sommen.length < rijen; ronde++) {
        const tafel = kiesUit(kans, tafels);
        const mee = heelGetalBovenaan(kans, 1, max);
        if (uitkomsten.includes(tafel * mee)) continue;
        sommen.push({ eerste: tafel, tweede: mee });
        uitkomsten.push(tafel * mee);
      }
      if (sommen.length < rijen) break;

      const handtekening = `keerkoppelen:${sommen.map((s) => `${s.eerste}x${s.tweede}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const eerste = sommen[0];
      const gegevens = gegevensVan(
        "keerkoppelen",
        "slepen",
        [eerste.eerste, eerste.tweede],
        uitkomsten[0],
        eerste.eerste,
        eerste.tweede,
        { rijen },
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keerkoppelenGenerator, inst, groep, gegevens),
        antwoord: uitkomsten.join(","),
        figuur: { soort: "keerkoppelen", sommen, keuzes: husselen(kans, uitkomsten) },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke keersom past erbij?
// ---------------------------------------------------------------------------

const WELKEZIN = "Maak een keersom die uitkomt op {som}.";
const WELKEZINNEN: Record<Leeftijdsgroep, string> = {
  "34": WELKEZIN,
  "56": WELKEZIN,
  "78": "Schrijf een keersom op die uitkomt op {som}.",
};

/** Alle keersommen met twee getallen tot en met `max` die op `uitkomst` komen. */
export function passendeKeersommen(uitkomst: number, max: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = 1; a <= max; a++) {
    if (uitkomst % a !== 0) continue;
    const b = uitkomst / a;
    if (b >= 1 && b <= max) uit.push([a, b]);
  }
  return uit;
}

/** De uitkomsten waarvoor er minstens één keersom bestaat, van klein naar groot. */
export function bruikbareUitkomsten(van: number, max: number): number[] {
  const alle = new Set<number>();
  for (let a = 1; a <= max; a++) {
    for (let b = 1; b <= max; b++) if (a * b >= van) alle.add(a * b);
  }
  return [...alle].sort((x, y) => x - y);
}

export const welkekeersomGenerator: Generator = {
  id: "welkekeersom",
  naam: "Welke keersom past erbij?",
  uitleg:
    "De uitkomst staat er; het kind typt zelf een keersom die klopt: ▢ × ▢ = 24. Elke goede keersom telt, dus 3 × 8 en 4 × 6 zijn allebei goed. Er komen alleen uitkomsten voor waarvoor een keersom bestaat.",
  suggestie: "Groep 4: uitkomsten vanaf 4, getallen tot en met 10",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste uitkomst",
      min: 1,
      max: 100,
      hulp: "Onder de vier zijn er maar een paar keersommen mogelijk; vanaf vier is er meer te kiezen.",
    },
    {
      soort: "getal",
      sleutel: "max",
      label: "Grootste getal in de som",
      min: 2,
      max: 10,
      hulp: "Elke keersom met twee getallen tot en met dit getal is goed gerekend.",
    },
    ...vraagtekstVelden(WELKEZINNEN, {
      voorbeeldzinnen: {
        "34": "Maak een keersom die uitkomt op 24.",
        "56": "Maak een keersom die uitkomt op 24.",
        "78": "Schrijf een keersom op die uitkomt op 24.",
      },
      extraHulp: "Op de plek van {som} komt de uitkomst te staan.",
    }),
  ],
  vraagteksten: { standaard: WELKEZINNEN, som: (s) => String(s.goed) },
  standaard: { van: 4, max: 10 },
  foutpatronen: keerPatronen,
  aanpak: welkekeersomAanpak,
  uitleganimatie: welkekeersomUitleg,

  maximum: (inst) =>
    bruikbareUitkomsten(
      Math.max(1, getal(inst, "van", 4)),
      Math.max(2, Math.min(10, getal(inst, "max", 10))),
    ).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const max = Math.max(2, Math.min(10, getal(inst, "max", 10)));
    const van = Math.max(1, getal(inst, "van", 4));

    const uit: Gegenereerd[] = [];
    for (const uitkomst of husselen(kans, bruikbareUitkomsten(van, max))) {
      if (uit.length >= aantal) break;

      const handtekening = `welkekeersom:${uitkomst}-${max}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const passend = passendeKeersommen(uitkomst, max);
      /* Een voorbeeld voor de uitleg: niet de som met een 1 erin als het anders kan. */
      const voorbeeld = passend.find(([a]) => a > 1) ?? passend[0];

      const gegevens = gegevensVan(
        "welkekeersom",
        "zelf",
        [voorbeeld[0], voorbeeld[1]],
        uitkomst,
        voorbeeld[0],
        voorbeeld[1],
        { max },
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(welkekeersomGenerator, inst, groep, gegevens),
        /* Elke keersom die klopt is goed; ze staan er allemaal in als "a,b". */
        antwoord: passend.map(([a, b]) => `${a},${b}`).join("|"),
        figuur: { soort: "welkekeersom", uitkomst, max },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Keersom en deelsom koppelen
// ---------------------------------------------------------------------------

const KEERDEELZIN = "Sleep de keersom naar de deelsom.";
const KEERDEELZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KEERDEELZIN,
  "56": KEERDEELZIN,
  "78": KEERDEELZIN,
};

export const keerdeelkoppelenGenerator: Generator = {
  id: "keerdeelkoppelen",
  naam: "Keersom en deelsom koppelen",
  uitleg:
    "Links de deelsommen (20 : 5), rechts de keersommen door elkaar (5 × 4). Het kind sleept bij elke deelsom de keersom die erbij hoort; tikken werkt ook.",
  suggestie: "Groep 5: tafels 1 tot en met 10, vijf sommen",
  velden: [TAFELVELD, MEEVELD, RIJENVELD, ...vraagtekstVelden(KEERDEELZINNEN)],
  vraagteksten: { standaard: KEERDEELZINNEN },
  standaard: { tafels: ["2", "3", "4", "5", "10"], max: 10, rijen: 5 },
  foutpatronen: keerPatronen,
  aanpak: keerdeelkoppelenAanpak,
  uitleganimatie: keerdeelkoppelenUitleg,

  maximum: (inst) => {
    const paren = gekozenTafels(inst).length * maxMee(inst);
    return paren < hoeveelRijen(inst) ? 0 : paren * 20;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst, ["2", "3", "4", "5", "10"]);
    const max = maxMee(inst);
    const rijen = hoeveelRijen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /*
        Verschillende producten, zodat geen enkele keersom bij twee deelsommen
        zou kunnen passen: dan is er precies één goede indeling.
      */
      const paren: { tafel: number; mee: number }[] = [];
      const producten: number[] = [];
      for (let ronde = 0; ronde < 120 && paren.length < rijen; ronde++) {
        const tafel = kiesUit(kans, tafels);
        const mee = heelGetalBovenaan(kans, 1, max);
        if (producten.includes(tafel * mee)) continue;
        paren.push({ tafel, mee });
        producten.push(tafel * mee);
      }
      if (paren.length < rijen) break;

      const handtekening = `keerdeelkoppelen:${paren.map((p) => `${p.tafel}x${p.mee}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const sommen = paren.map((p) => ({ geheel: p.tafel * p.mee, deler: p.tafel }));
      const keuzes = husselen(
        kans,
        paren.map((p) => ({ eerste: p.tafel, tweede: p.mee })),
      );
      /* Per rij het nummer van de keersom die erbij hoort. */
      const antwoord = paren
        .map((p) => keuzes.findIndex((k) => k.eerste === p.tafel && k.tweede === p.mee))
        .join(",");

      const eerste = paren[0];
      const gegevens = gegevensVan(
        "keerdeelkoppelen",
        "slepen",
        [eerste.tafel * eerste.mee, eerste.tafel],
        eerste.mee,
        eerste.tafel,
        eerste.mee,
        { rijen },
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keerdeelkoppelenGenerator, inst, groep, gegevens),
        antwoord,
        figuur: { soort: "keerdeelkoppelen", sommen, keuzes },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Keersom en deelsom samen
// ---------------------------------------------------------------------------

const SAMENZIN = "Vul in.";
const SAMENZINNEN: Record<Leeftijdsgroep, string> = {
  "34": SAMENZIN,
  "56": SAMENZIN,
  "78": SAMENZIN,
};

export const keerdeelsamenGenerator: Generator = {
  id: "keerdeelsamen",
  naam: "Keersom en deelsom samen",
  uitleg:
    "Twee sommen onder elkaar die over hetzelfde gaan: 20 : 2 = ▢ en ▢ × 2 = 20. In beide vakjes komt hetzelfde getal, zodat een kind ziet dat delen en keer twee kanten van dezelfde som zijn.",
  suggestie: "Groep 5: tafels 2 tot en met 10",
  velden: [TAFELVELD, MEEVELD, ...vraagtekstVelden(SAMENZINNEN)],
  vraagteksten: { standaard: SAMENZINNEN },
  standaard: { tafels: ["2", "3", "4", "5", "10"], max: 10 },
  foutpatronen: keerPatronen,
  aanpak: keerdeelsamenAanpak,
  uitleganimatie: keerdeelsamenUitleg,

  maximum: (inst) => gekozenTafels(inst, ["2", "3", "4", "5", "10"]).length * maxMee(inst),

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst, ["2", "3", "4", "5", "10"]);
    const max = maxMee(inst);
    const alles = tafels.flatMap((t) => Array.from({ length: max }, (_, i) => [t, i + 1]));

    const uit: Gegenereerd[] = [];
    for (const [tafel, mee] of husselen(kans, alles)) {
      if (uit.length >= aantal) break;

      const handtekening = `keerdeelsamen:${tafel}x${mee}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = gegevensVan(
        "keerdeelsamen",
        "samen",
        [tafel * mee, tafel],
        mee,
        tafel,
        mee,
      );
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(keerdeelsamenGenerator, inst, groep, gegevens),
        /* Twee vakjes, allebei hetzelfde getal: eerst de deelsom, dan de keersom. */
        antwoord: `${mee},${mee}`,
        figuur: { soort: "keerdeelsamen", geheel: tafel * mee, deler: tafel },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Keersommen in het echt: het kraampje
// ---------------------------------------------------------------------------

const KRAAMZIN = "Wat kost het samen?";
const TERUGZIN = "Hoeveel krijg je terug?";

function kraamzinnen(terug: boolean): Record<Leeftijdsgroep, string> {
  const zin = terug ? TERUGZIN : KRAAMZIN;
  return { "34": zin, "56": zin, "78": zin };
}

/**
 * Wat er op het kraampje ligt, met de prijs in hele euro's.
 *
 * Dit is een instelling en geen vaste lijst in de code: de eigenaar bepaalt wat
 * er te koop is, en de waarde staat per sjabloon in de database. De tekst
 * hieronder is alleen de stand waarmee een nieuw sjabloon begint, zodat het
 * voorbeeld in het beheer meteen iets laat zien.
 */
/*
  De namen staan in het meervoud, want het aantal is nooit 1: er staat dus
  altijd "4 zakken appels" en nooit "1 zakken appels".
*/
const STANDAARD_WAREN =
  "zakken appels 3, broden 2, stukken kaas 4, bossen bloemen 5, doosjes eieren 2";

export type Waar = { naam: string; prijs: number };

/** "zak appels 3, brood 2" -> twee waren met hun prijs. */
export function leesWaren(ruw: string): Waar[] {
  return ruw
    .split(/[,\n;]+/)
    .map((regel) => regel.trim())
    .filter(Boolean)
    .map((regel) => {
      const gevonden = /^(.*?)[\s:]+(\d+)$/.exec(regel);
      if (!gevonden) return null;
      const naam = gevonden[1].trim();
      const prijs = Number(gevonden[2]);
      return naam && prijs > 0 ? { naam, prijs } : null;
    })
    .filter((w): w is Waar => w !== null);
}

export const marktkraamGenerator: Generator = {
  id: "marktkraam",
  naam: "Boodschappen op de markt",
  uitleg:
    "Een kraampje met twee of drie producten en een prijs in hele euro's. Het kind rekent uit wat een aantal daarvan samen kost — per soort een keersom — en in de stand „wisselgeld” ook hoeveel het terugkrijgt.",
  suggestie: "Groep 4: twee soorten, hoogstens 5 stuks · groep 5: drie soorten met wisselgeld",
  velden: [
    {
      soort: "tekst",
      sleutel: "waren",
      label: "Wat er op het kraampje ligt",
      plaatshouder: STANDAARD_WAREN,
      hulp:
        "Per product de naam en de prijs in hele euro's, gescheiden door komma's: \"zakken appels 3, broden 2\". Zet de naam in het meervoud; er staan er altijd meer dan één. Er moeten er minstens twee staan.",
    },
    {
      soort: "getal",
      sleutel: "soorten",
      label: "Hoeveel soorten per vraag",
      min: 2,
      max: 3,
    },
    {
      soort: "getal",
      sleutel: "maxAantal",
      label: "Hoogste aantal per soort",
      min: 2,
      max: 6,
      hulp: "Het aantal is nooit 1: dan is het geen keersom meer.",
    },
    {
      soort: "vinkje",
      sleutel: "wisselgeld",
      label: "Vraag naar het wisselgeld",
      hulp: "Dan staat er „Je betaalt met € 20. Hoeveel krijg je terug?” onder het kraampje.",
    },
    {
      soort: "getal",
      sleutel: "betaaldMet",
      label: "Waarmee er betaald wordt",
      min: 10,
      max: 100,
      hulp: "Alleen bij wisselgeld. Er komen geen vragen uit waarbij het totaal hierboven uitkomt.",
    },
    ...vraagtekstVelden(kraamzinnen(false), {
      voorbeeldzinnen: kraamzinnen(false),
      extraHulp: `Leeg laten geeft „${KRAAMZIN}”, en bij wisselgeld „${TERUGZIN}”.`,
    }),
  ],
  vraagteksten: { standaard: kraamzinnen(false) },
  standaard: {
    waren: STANDAARD_WAREN,
    soorten: 2,
    maxAantal: 5,
    wisselgeld: false,
    betaaldMet: 20,
  },
  foutpatronen: keerPatronen,
  aanpak: marktkraamAanpak,
  uitleganimatie: marktkraamUitleg,

  waarschuwing: (inst) => {
    const waren = leesWaren(tekst(inst, "waren", STANDAARD_WAREN));
    if (waren.length < 2) {
      return "Er staan minder dan twee producten op het kraampje. Schrijf per product de naam en de prijs, bijvoorbeeld \"zakken appels 3, broden 2\".";
    }
    const soorten = Math.max(2, Math.min(3, getal(inst, "soorten", 2)));
    if (waren.length < soorten) {
      return `Er zijn ${soorten} soorten per vraag gevraagd, maar er staan maar ${waren.length} producten op het kraampje.`;
    }
    return null;
  },

  maximum: (inst) => {
    const waren = leesWaren(tekst(inst, "waren", STANDAARD_WAREN));
    const soorten = Math.max(2, Math.min(3, getal(inst, "soorten", 2)));
    const maxAantal = Math.max(2, Math.min(6, getal(inst, "maxAantal", 5)));
    if (waren.length < soorten) return 0;
    /* Elke keuze aan producten, met elk aantal per product erbij. */
    return Math.round(
      (waren.length ** soorten) * (maxAantal - 1) ** soorten,
    );
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const waren = leesWaren(tekst(inst, "waren", STANDAARD_WAREN));
    const soorten = Math.max(2, Math.min(3, getal(inst, "soorten", 2)));
    const maxAantal = Math.max(2, Math.min(6, getal(inst, "maxAantal", 5)));
    const metWisselgeld = vinkje(inst, "wisselgeld");
    const betaaldMet = Math.max(10, Math.min(100, getal(inst, "betaaldMet", 20)));
    if (waren.length < soorten) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const gekozen = husselen(kans, waren).slice(0, soorten);
      const gevuld = gekozen.map((w) => ({
        ...w,
        /* Nooit één stuk: dan is het geen keersom meer. */
        aantal: 2 + Math.floor(kans() * (maxAantal - 1)),
      }));

      const totaal = gevuld.reduce((n, w) => n + w.prijs * w.aantal, 0);
      /* Alles binnen 100 euro, en bij wisselgeld moet het eronder blijven. */
      if (totaal > 100) continue;
      if (metWisselgeld && totaal >= betaaldMet) continue;

      const handtekening = `marktkraam:${metWisselgeld ? betaaldMet : "totaal"}:${gevuld
        .map((w) => `${w.aantal}x${w.naam}@${w.prijs}`)
        .join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const goed = metWisselgeld ? betaaldMet - totaal : totaal;
      const gegevens = {
        soort: "marktkraam",
        variant: metWisselgeld ? "wisselgeld" : "totaal",
        /* De prijzen en aantallen om en om, zodat de patronen erbij kunnen. */
        getallen: gevuld.flatMap((w) => [w.aantal, w.prijs]),
        goed,
        extra: {
          tafel: gevuld[0].aantal,
          mee: gevuld[0].prijs,
          product: gevuld[0].aantal * gevuld[0].prijs,
          totaal,
          betaald: metWisselgeld ? betaaldMet : 0,
        },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(
          { vraagteksten: { standaard: kraamzinnen(metWisselgeld) } },
          inst,
          groep,
          gegevens,
        ),
        antwoord: String(goed),
        figuur: {
          soort: "marktkraam",
          waren: gevuld,
          betaald: metWisselgeld ? betaaldMet : null,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};
