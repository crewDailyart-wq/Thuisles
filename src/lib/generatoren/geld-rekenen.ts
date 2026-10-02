/**
 * Het domein Geld: rekenen met geld.
 *
 * Zeven types:
 *
 *   geldsom        twee groepjes geld met + of − ertussen
 *   geldverhaal    wisselgeld, wat blijft er over, de prijs terugrekenen
 *   kunjebetalen   een budget en vijf zinnen; Ja of Nee
 *   bonnetje       het totaal, of de prijs die kwijt is
 *   geldafronden   een prijs afronden op hele en halve euro's
 *   geldschatten   samen ongeveer, of wat houd je ongeveer over
 *   geldkorting    hoeveel korting, of de prijs na korting
 *
 * Alle bedragen in centen; zie `lib/geld.ts`. Bedragen tot 100 euro, centen in
 * tientallen of vijftallen (WERKPLAN.md). De verhaaltjes — wat er gekocht
 * wordt, waar — zijn instellingen: de eigenaar bepaalt welke situaties erin
 * komen. De tekst hieronder is alleen de stand waarmee een sjabloon begint.
 */

import {
  getal,
  husselen,
  kansGenerator,
  kiesUit,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { afgerond, antwoordVan, bedrag, groterEerst, totaal } from "@/lib/geld";
import {
  GELDBASIS,
  bedragkeuzes,
  geldVraag,
  geldzinVelden,
  tussen,
  woordenlijst,
} from "@/lib/generatoren/geld-gedeeld";

/** Hoofdletter aan het begin van een zin. */
function zinsbegin(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

/** Een groepje geld als tekst voor de handtekening. */
function sleutel(stukken: number[]): string {
  return groterEerst(stukken).join("+");
}

/** Centen in tientallen: 0, 10, ... 90. */
function tientallen(kans: () => number): number {
  return tussen(kans, 0, 9) * 10;
}

// ---------------------------------------------------------------------------
// Rekenen met munten en briefjes
// ---------------------------------------------------------------------------

const KLEINE_MUNTEN = [5, 10, 20, 50, 100, 200];
const BRIEFJES_TOT_50 = [500, 1000, 2000, 5000];

type Somvoorstel = { links: number[]; rechts: number[]; teken: "+" | "-" };

/** Alle sommen die bij een stand bestaan, of null als er te veel zijn om op te noemen. */
function vasteSommen(inst: Instellingen): Somvoorstel[] | null {
  const stand = tekst(inst, "stand", "tweemunten");
  if (stand === "tweemunten") {
    const uit: Somvoorstel[] = [];
    KLEINE_MUNTEN.forEach((a, i) =>
      KLEINE_MUNTEN.slice(i).forEach((b) => uit.push({ links: [a], rechts: [b], teken: "+" })),
    );
    return uit;
  }
  if (stand === "briefjemunt") {
    return BRIEFJES_TOT_50.flatMap((b) =>
      KLEINE_MUNTEN.map((m): Somvoorstel => ({ links: [b], rechts: [m], teken: "+" })),
    );
  }
  if (stand === "tweebriefjes") {
    return BRIEFJES_TOT_50.flatMap((a) =>
      BRIEFJES_TOT_50.filter((b) => a + b <= 10000).map(
        (b): Somvoorstel => ({ links: [a], rechts: [b], teken: "+" }),
      ),
    );
  }
  if (stand === "eraf") {
    const munt = getal(inst, "munt", 100) === 200 ? 200 : 100;
    const uit: Somvoorstel[] = [];
    for (let n = 3; n <= 10; n++)
      for (let k = 1; k < n; k++)
        uit.push({
          links: Array.from({ length: n }, () => munt),
          rechts: Array.from({ length: k }, () => munt),
          teken: "-",
        });
    return uit;
  }
  return null;
}

/** Hoe het kind bij deze stand het antwoord typt (WERKPLAN.md). */
function invoerVan(stand: string): "bedrag" | "eurocent" | "euro" {
  if (stand === "tweemunten" || stand === "briefjemunt") return "eurocent";
  if (stand === "tweebriefjes" || stand === "eraf") return "euro";
  return "bedrag";
}

export const geldsomGenerator: Generator = {
  id: "geldsom",
  naam: "Rekenen met munten en briefjes",
  uitleg:
    "Twee groepjes geld met een plus of een min ertussen. Het kind typt het antwoord: ▢ euro ▢ cent, ▢ euro, of met komma.",
  suggestie: "Groep 4: twee munten, briefje plus munt, munten eraf · daarna groepjes en bedragen met komma",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Welke som",
      opties: [
        { waarde: "tweemunten", label: "Twee munten optellen — ▢ euro ▢ cent" },
        { waarde: "briefjemunt", label: "Briefje plus munt — ▢ euro ▢ cent" },
        { waarde: "tweebriefjes", label: "Twee briefjes optellen — ▢ euro" },
        { waarde: "eraf", label: "Munten eraf — ▢ euro" },
        { waarde: "tweegroepjes", label: "Twee groepjes munten bij elkaar — met komma" },
        { waarde: "komma", label: "Bedragen met komma optellen — briefjes en munten" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "munt",
      label: "Welke munt (bij munten eraf)",
      opties: [
        { waarde: "100", label: "1 euro" },
        { waarde: "200", label: "2 euro" },
      ],
    },
    ...geldzinVelden("Hoeveel is het samen?"),
  ],
  standaard: { stand: "tweemunten", munt: 100 },
  ...GELDBASIS,

  maximum: (inst) => vasteSommen(inst)?.length ?? null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "tweemunten");
    const invoer = invoerVan(stand);
    const vast = vasteSommen(inst);
    const reeks = vast ? husselen(kans, vast) : [];
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      let som: Somvoorstel;
      if (vast) {
        if (poging >= reeks.length) break;
        som = reeks[poging];
      } else if (stand === "tweegroepjes") {
        const groepje = () => Array.from({ length: tussen(kans, 2, 3) }, () => kiesUit(kans, [10, 20, 50, 100, 200]));
        som = { links: groepje(), rechts: groepje(), teken: "+" };
        if (totaal(som.links) + totaal(som.rechts) > 1000) continue;
      } else {
        /* Met komma: elk groepje een briefje of twee en wat munten. */
        const groepje = () => [
          ...Array.from({ length: tussen(kans, 1, 2) }, () => kiesUit(kans, [500, 1000, 2000])),
          ...Array.from({ length: tussen(kans, 1, 3) }, () => kiesUit(kans, [10, 20, 50, 100, 200])),
        ];
        som = { links: groepje(), rechts: groepje(), teken: "+" };
        const samen = totaal(som.links) + totaal(som.rechts);
        if (samen > 10000 || samen % 100 === 0) continue;
      }

      const handtekening = `geldsom:${stand}:${sleutel(som.links)}${som.teken}${sleutel(som.rechts)}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const links = totaal(som.links);
      const rechts = totaal(som.rechts);
      const uitkomst = som.teken === "+" ? links + rechts : links - rechts;
      const zin =
        som.teken === "-"
          ? `Er gaan ${som.rechts.length} munten af. Hoeveel euro blijft er over?`
          : "Hoeveel is het samen?";
      const gegevens: Somgegevens = {
        soort: "geldsom",
        variant: stand,
        getallen: [links, rechts],
        goed: uitkomst,
        extra: { bedrag: 1, teken: som.teken === "+" ? 1 : -1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldsomGenerator, inst, groep, gegevens, zin),
        antwoord: antwoordVan(uitkomst),
        figuur: {
          soort: "geldsom",
          links: groterEerst(som.links),
          rechts: groterEerst(som.rechts),
          teken: som.teken,
          invoer,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// In de winkel: wisselgeld, wat blijft er over, de prijs terugrekenen
// ---------------------------------------------------------------------------

const STANDAARD_DINGEN =
  "een ijsje, een knuffel, een bal, een boek, een puzzel, een zak snoep, een speelgoedauto, een kaartje voor de kermis";

/** De valkuilen bij een bedrag: een euro ernaast, of tien cent ernaast. */
function bedragvalkuilen(goed: number, metCenten: boolean): number[] {
  return metCenten
    ? [goed + 100, goed - 100, goed + 10, goed - 10, goed + 50]
    : [goed + 100, goed - 100, goed + 1000, goed - 1000, goed + 200];
}

export const geldverhaalGenerator: Generator = {
  id: "geldverhaal",
  naam: "In de winkel",
  uitleg:
    "Een kort verhaaltje over betalen. Hoeveel krijg je terug, hoeveel blijft er over, of wat kostte het? Het kind kiest uit vier bedragen of typt het bedrag met € ervoor.",
  suggestie: "Groep 4: wisselgeld in hele euro's · daarna met centen en de prijs terugrekenen",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "wisselgeld", label: "Wisselgeld — betaald met een briefje" },
        { waarde: "over", label: "Wat blijft er over?" },
        { waarde: "prijs", label: "De prijs terugrekenen" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen uit vier bedragen" },
        { waarde: "typen", label: "Typen" },
      ],
    },
    {
      soort: "vinkje",
      sleutel: "centen",
      label: "Met centen",
      hulp: "Uit = alleen hele euro's. Aan = prijzen als € 6,40.",
    },
    {
      soort: "tekst",
      sleutel: "dingen",
      label: "Wat er gekocht wordt",
      plaatshouder: STANDAARD_DINGEN,
      hulp: "Gescheiden door komma's, met een lidwoord ervoor: \"een ijsje\".",
    },
    ...geldzinVelden("Je koopt een ijsje van € 1,50. Je betaalt met € 5,-. Hoeveel krijg je terug?"),
  ],
  standaard: { stand: "wisselgeld", antwoord: "kiezen", centen: true, dingen: STANDAARD_DINGEN },
  ...GELDBASIS,

  maximum: () => null,

  waarschuwing: (inst) =>
    woordenlijst(tekst(inst, "dingen", STANDAARD_DINGEN)).length === 0
      ? "Er staat niets bij \"Wat er gekocht wordt\". Schrijf er een paar dingen neer, gescheiden door komma's."
      : null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "wisselgeld") as "wisselgeld" | "over" | "prijs";
    const kiezen = tekst(inst, "antwoord", "kiezen") === "kiezen";
    const metCenten = inst.centen === undefined ? true : inst.centen === true;
    const dingen = woordenlijst(tekst(inst, "dingen", STANDAARD_DINGEN));
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const betaald = kiesUit(kans, stand === "over" ? [1000, 2000, 5000, 10000] : [500, 1000, 2000, 5000, 10000]);
      const prijs = tussen(kans, 1, betaald / 100 - 1) * 100 + (metCenten ? tientallen(kans) : 0);
      if (prijs >= betaald || (metCenten && prijs % 100 === 0)) continue;
      const terug = betaald - prijs;
      const ding = kiesUit(kans, dingen.length ? dingen : ["iets"]);

      const handtekening = `geldverhaal:${stand}:${prijs}:${betaald}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const uitkomst = stand === "prijs" ? prijs : terug;
      const zin =
        stand === "wisselgeld"
          ? `Je koopt ${ding} van ${bedrag(prijs)}. Je betaalt met ${bedrag(betaald)}. Hoeveel krijg je terug?`
          : stand === "over"
            ? `Je hebt ${bedrag(betaald)}. ${zinsbegin(ding)} kost ${bedrag(prijs)}. Hoeveel blijft er over?`
            : `Je betaalde ${bedrag(betaald)} voor ${ding} en kreeg ${bedrag(terug)} terug. Wat kostte het?`;

      const k = kiezen ? bedragkeuzes(kans, uitkomst, bedragvalkuilen(uitkomst, metCenten), 4) : null;
      if (k && k.keuzes.length < 4) continue;

      const gegevens: Somgegevens = {
        soort: "geldverhaal",
        variant: stand,
        getallen: [betaald, stand === "prijs" ? terug : prijs],
        goed: uitkomst,
        extra: {
          stand: stand === "wisselgeld" ? 0 : stand === "over" ? 1 : 2,
          ...(k ? { keuze: 1 } : { bedrag: 1 }),
        },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldverhaalGenerator, inst, groep, gegevens, zin),
        antwoord: k ? String(k.goed) : antwoordVan(uitkomst),
        figuur: {
          soort: "geldverhaal",
          stand,
          zin,
          uitkomst,
          keuzes: k ? k.keuzes : null,
          goed: k ? k.goed : 0,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Kun je het betalen?
// ---------------------------------------------------------------------------

const STANDAARD_NAMEN = "Sam, Noor, Daan, Lina, Finn, Mila";
const DINGEN_MEERVOUD: [string, string][] = [
  ["ijsje", "ijsjes"],
  ["kaartje", "kaartjes"],
  ["zakje chips", "zakjes chips"],
  ["ballon", "ballonnen"],
  ["sticker", "stickers"],
  ["broodje", "broodjes"],
  ["pakje drinken", "pakjes drinken"],
  ["ansichtkaart", "ansichtkaarten"],
];

export const kunjebetalenGenerator: Generator = {
  id: "kunjebetalen",
  naam: "Kun je het betalen?",
  uitleg:
    "Een kind heeft een bedrag voor het schoolreisje. Daaronder vijf korte zinnen, zoals \"3 ijsjes van € 4,-\". Bij elke zin tikt het kind Ja of Nee, en drukt dan op Controleer.",
  suggestie: "Groep 4, als uitdaging",
  velden: [
    {
      soort: "tekst",
      sleutel: "namen",
      label: "Namen",
      plaatshouder: STANDAARD_NAMEN,
      hulp: "Wie het geld heeft. Gescheiden door komma's.",
    },
    ...geldzinVelden("Sam heeft € 20,- voor het schoolreisje. Kan Sam dit betalen?"),
  ],
  standaard: { namen: STANDAARD_NAMEN },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const namen = woordenlijst(tekst(inst, "namen", STANDAARD_NAMEN));
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const budget = kiesUit(kans, [1000, 1500, 2000, 2500, 3000]);
      const dingen = husselen(kans, DINGEN_MEERVOUD).slice(0, 5);
      const regels = dingen.map(([, meervoud]) => ({
        aantal: tussen(kans, 2, 5),
        prijs: tussen(kans, 1, 9) * 100,
        ding: meervoud,
      }));
      /* Minstens twee keer Ja en twee keer Nee, anders valt er weinig te kiezen. */
      const ja = regels.filter((r) => r.aantal * r.prijs <= budget).length;
      if (ja < 2 || ja > 3) continue;

      const handtekening = `kunjebetalen:${budget}:${regels.map((r) => `${r.aantal}x${r.prijs}${r.ding}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const naam = kiesUit(kans, namen.length ? namen : ["Sam"]);
      const zin = `${naam} heeft ${bedrag(budget)} voor het schoolreisje. Kan ${naam} dit betalen?`;
      const gegevens: Somgegevens = {
        soort: "kunjebetalen",
        getallen: [budget, ...regels.map((r) => r.aantal * r.prijs)],
        goed: ja,
        extra: { keuze: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(kunjebetalenGenerator, inst, groep, gegevens, zin),
        antwoord: regels.map((r) => (r.aantal * r.prijs <= budget ? "0" : "1")).join(","),
        figuur: { soort: "kunjebetalen", budget, naam, regels },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Het bonnetje
// ---------------------------------------------------------------------------

/** Wat er op een bonnetje kan staan, per plek: naam en een prijs tussen van en tot (euro). */
const BONNETJES: Record<string, [string, number, number][]> = {
  "de markt": [
    ["appels", 1, 4],
    ["kaas", 3, 9],
    ["bloemen", 4, 12],
    ["aardbeien", 2, 5],
    ["vis", 5, 14],
    ["brood", 2, 4],
  ],
  "de kermis": [
    ["suikerspin", 2, 4],
    ["botsauto's", 3, 6],
    ["draaimolen", 2, 5],
    ["oliebollen", 3, 7],
    ["lootjes", 1, 5],
    ["reuzenrad", 4, 8],
  ],
  "de bakker": [
    ["brood", 2, 4],
    ["taart", 8, 18],
    ["krentenbollen", 2, 4],
    ["koekjes", 2, 5],
    ["appelflap", 1, 3],
  ],
  "de speelgoedwinkel": [
    ["knikkers", 2, 6],
    ["puzzel", 8, 20],
    ["stickers", 1, 4],
    ["bal", 5, 12],
    ["kleurpotloden", 3, 9],
  ],
};

export const bonnetjeGenerator: Generator = {
  id: "bonnetje",
  naam: "Het bonnetje",
  uitleg:
    "Een simpel bonnetje met drie regels, bijvoorbeeld van de markt of de kermis. Het kind rekent het totaal uit, of de prijs die onleesbaar is, en typt het bedrag met komma.",
  suggestie: "Groep 4",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "totaal", label: "Het totaal" },
        { waarde: "kwijt", label: "Eén prijs is kwijt; het totaal staat erop" },
      ],
    },
    ...geldzinVelden("Hoeveel moet je samen betalen?"),
  ],
  standaard: { stand: "totaal" },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const kwijtStand = tekst(inst, "stand", "totaal") === "kwijt";
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const plek = kiesUit(kans, Object.keys(BONNETJES));
      const regels = husselen(kans, BONNETJES[plek])
        .slice(0, 3)
        .map(([ding, van, tot]) => ({ ding, prijs: tussen(kans, van, tot) * 100 + tientallen(kans) }));
      const som = totaal(regels.map((r) => r.prijs));
      if (som > 10000) continue;
      const kwijt = kwijtStand ? tussen(kans, 0, 2) : null;

      const handtekening = `bonnetje:${kwijt ?? "t"}:${regels.map((r) => `${r.ding}=${r.prijs}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const goed = kwijt === null ? som : regels[kwijt].prijs;
      const zin = kwijt === null ? "Hoeveel moet je samen betalen?" : "Welke prijs is onleesbaar geworden?";
      const gegevens: Somgegevens = {
        soort: "bonnetje",
        variant: kwijt === null ? "totaal" : "kwijt",
        getallen: regels.map((r) => r.prijs),
        goed,
        extra: { bedrag: 1, kwijt: kwijt === null ? 0 : kwijt + 1, totaal: som },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(bonnetjeGenerator, inst, groep, gegevens, zin),
        antwoord: antwoordVan(goed),
        figuur: { soort: "bonnetje", plek, regels, kwijt },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Afronden en schatten
// ---------------------------------------------------------------------------

/** Een prijs die netjes af te ronden is: nooit op ,25 of ,75, en niet al rond. */
function afrondprijs(kans: () => number, van: number, tot: number): number {
  const centen = kiesUit(kans, [10, 20, 30, 40, 60, 70, 80, 90]);
  return tussen(kans, van, tot) * 100 + centen;
}

/** De twee andere kanten op afronden: de valkuilen bij een afgeronde prijs. */
function afrondvalkuilen(prijs: number): number[] {
  const goed = afgerond(prijs);
  const omlaag = Math.floor(prijs / 50) * 50;
  const omhoog = Math.ceil(prijs / 50) * 50;
  return [omlaag, omhoog, goed - 50, goed + 50, Math.floor(prijs / 100) * 100, Math.ceil(prijs / 100) * 100];
}

export const geldafrondenGenerator: Generator = {
  id: "geldafronden",
  naam: "Afronden op hele en halve euro's",
  uitleg:
    "Eén prijs, af te ronden op de dichtstbijzijnde hele of halve euro: 25,20 wordt 25,-, 25,40 wordt 25,50 en 25,80 wordt 26,-. Kiezen uit drie knoppen of typen.",
  suggestie: "Groep 4: kiezen · daarna typen",
  velden: [
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen uit drie knoppen" },
        { waarde: "typen", label: "Typen" },
      ],
    },
    ...geldzinVelden("Rond € 25,40 af op hele en halve euro's."),
  ],
  standaard: { antwoord: "kiezen" },
  ...GELDBASIS,

  maximum: () => 99 * 8,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const kiezen = tekst(inst, "antwoord", "kiezen") === "kiezen";
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const prijs = afrondprijs(kans, 1, 98);
      const handtekening = `geldafronden:${kiezen ? "k" : "t"}:${prijs}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const goed = afgerond(prijs);
      const k = kiezen ? bedragkeuzes(kans, goed, afrondvalkuilen(prijs), 3) : null;
      const zin = `Rond ${bedrag(prijs)} af op hele en halve euro's.`;
      const gegevens: Somgegevens = {
        soort: "geldafronden",
        getallen: [prijs],
        goed,
        extra: k ? { keuze: 1 } : { bedrag: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldafrondenGenerator, inst, groep, gegevens, zin),
        antwoord: k ? String(k.goed) : antwoordVan(goed),
        figuur: { soort: "geldafronden", prijs, keuzes: k ? k.keuzes : null, goed: k ? k.goed : 0 },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

const SCHATPLEKKEN: [string, [string, number, number][]][] = [
  ["Bij de bakker", [["een brood", 2, 4], ["een taart", 6, 14], ["koekjes", 2, 5], ["een appeltaart", 7, 12]]],
  ["Op de markt", [["een bos bloemen", 3, 9], ["een stuk kaas", 4, 12], ["aardbeien", 2, 5], ["een zak appels", 2, 5]]],
  ["In de speelgoedwinkel", [["een puzzel", 7, 18], ["een bal", 4, 12], ["een knuffel", 6, 15], ["stickers", 1, 4]]],
  ["Bij de boekwinkel", [["een boek", 8, 19], ["een schrift", 1, 4], ["een pen", 1, 5], ["een strip", 4, 9]]],
];

export const geldschattenGenerator: Generator = {
  id: "geldschatten",
  naam: "Schatten met geld",
  uitleg:
    "Een verhaaltje met prijzen. Samen ongeveer: rond twee prijzen af en tel ze op — stap voor stap in drie vakjes, of meteen. Wat houd je over: rond de prijs af en haal hem van het geld in de portemonnee af.",
  suggestie: "Groep 4, na het afronden",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "samenstap", label: "Samen ongeveer, stap voor stap — eerst afronden, dan optellen" },
        { waarde: "samen", label: "Samen ongeveer — meteen het totaal" },
        { waarde: "over", label: "Wat houd je ongeveer over?" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt (bij wat houd je over)",
      opties: [
        { waarde: "typen", label: "Typen" },
        { waarde: "kiezen", label: "Kiezen uit vier knoppen" },
      ],
    },
    ...geldzinVelden("Bij de bakker koop je een brood en een taart. Hoeveel kost het samen ongeveer?"),
  ],
  standaard: { stand: "samenstap", antwoord: "typen" },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "samenstap") as "samenstap" | "samen" | "over";
    const kiezen = stand === "over" && tekst(inst, "antwoord", "typen") === "kiezen";
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const [plek, dingen] = kiesUit(kans, SCHATPLEKKEN);
      const twee = husselen(kans, dingen).slice(0, 2);
      const prijzen = twee.map(([, van, tot]) => afrondprijs(kans, van, tot));
      let portemonnee: number | null = null;
      let zin: string;
      let goed: number;

      if (stand === "over") {
        portemonnee = kiesUit(kans, [1000, 2000, 5000]);
        if (afgerond(prijzen[0]) >= portemonnee) continue;
        goed = portemonnee - afgerond(prijzen[0]);
        zin = `${plek}. Je hebt ${bedrag(portemonnee)} in je portemonnee. Je koopt ${twee[0][0]} van ${bedrag(prijzen[0])}. Hoeveel houd je ongeveer over?`;
      } else {
        goed = afgerond(prijzen[0]) + afgerond(prijzen[1]);
        zin = `${plek} koop je ${twee[0][0]} van ${bedrag(prijzen[0])} en ${twee[1][0]} van ${bedrag(prijzen[1])}. Hoeveel kost het samen ongeveer?`;
      }

      const handtekening = `geldschatten:${stand}:${kiezen ? "k" : "t"}:${prijzen.join("+")}:${portemonnee ?? ""}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const k = kiezen ? bedragkeuzes(kans, goed, [goed + 50, goed - 50, goed + 100, goed - 100], 4) : null;
      const gegevens: Somgegevens = {
        soort: "geldschatten",
        variant: stand,
        getallen: [prijzen[0], prijzen[1], portemonnee ?? 0],
        goed,
        extra: k ? { keuze: 1 } : stand === "samenstap" ? {} : { bedrag: 1 },
      };
      const opgeslagen =
        stand === "samenstap"
          ? [afgerond(prijzen[0]), afgerond(prijzen[1]), goed].map(antwoordVan).join(",")
          : antwoordVan(goed);
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldschattenGenerator, inst, groep, gegevens, zin),
        antwoord: k ? String(k.goed) : opgeslagen,
        figuur: {
          soort: "geldschatten",
          stand,
          zin,
          prijzen: stand === "over" ? [prijzen[0]] : prijzen,
          portemonnee,
          keuzes: k ? k.keuzes : null,
          goed: k ? k.goed : 0,
        },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};

// ---------------------------------------------------------------------------
// Aanbiedingen
// ---------------------------------------------------------------------------

export const geldkortingGenerator: Generator = {
  id: "geldkorting",
  naam: "Aanbiedingen",
  uitleg:
    "Een aanbieding in hele euro's. Hoeveel korting: \"Was € 46,- / Nu € 36,-\". Prijs na korting: een prijs met een sticker \"€ 25,- korting\". Kiezen uit vier knoppen of typen.",
  suggestie: "Groep 4",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "korting", label: "Hoeveel korting? — was en nu" },
        { waarde: "prijsna", label: "Prijs na korting — met een sticker" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "antwoord",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "kiezen", label: "Kiezen uit vier knoppen" },
        { waarde: "typen", label: "Typen" },
      ],
    },
    ...geldzinVelden("Hoeveel korting krijg je?"),
  ],
  standaard: { stand: "korting", antwoord: "kiezen" },
  ...GELDBASIS,

  maximum: () => null,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = tekst(inst, "stand", "korting") as "korting" | "prijsna";
    const kiezen = tekst(inst, "antwoord", "kiezen") === "kiezen";
    const uit: Gegenereerd[] = [];

    for (let poging = 0; uit.length < aantal && poging < aantal * 400; poging++) {
      const was = tussen(kans, 10, 100) * 100;
      const korting = (stand === "korting" ? tussen(kans, 2, 40) : kiesUit(kans, [2, 3, 4, 5, 10, 15, 20, 25])) * 100;
      /* Een echte aanbieding: hoogstens de helft eraf, zoals "was € 46, nu € 36". */
      if (korting * 2 > was) continue;

      const handtekening = `geldkorting:${stand}:${kiezen ? "k" : "t"}:${was}-${korting}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const goed = stand === "korting" ? korting : was - korting;
      const valkuilen =
        stand === "korting"
          ? [goed + 100, goed - 100, goed + 1000, was - korting]
          : [was + korting, goed + 100, goed - 100, goed + 1000];
      const k = kiezen ? bedragkeuzes(kans, goed, valkuilen, 4) : null;
      if (k && k.keuzes.length < 4) continue;
      const zin = stand === "korting" ? "Hoeveel korting krijg je?" : "Hoeveel betaal je na de korting?";
      const gegevens: Somgegevens = {
        soort: "geldkorting",
        variant: stand,
        getallen: [was, korting],
        goed,
        extra: k ? { keuze: 1 } : { bedrag: 1 },
      };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: geldVraag(geldkortingGenerator, inst, groep, gegevens, zin),
        antwoord: k ? String(k.goed) : antwoordVan(goed),
        figuur: { soort: "geldkorting", stand, was, korting, keuzes: k ? k.keuzes : null, goed: k ? k.goed : 0 },
        somgegevens: gegevens,
      });
    }
    return uit;
  },
};
