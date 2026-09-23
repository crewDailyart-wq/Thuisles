/**
 * Getallenlijn, in twee standen.
 *
 * Een rechte horizontale lijn met een streepje voor elk getal in het bereik en
 * een pijlpunt aan het eind. Onder sommige streepjes staat het getal, onder de
 * rest niet.
 *
 * **Schuiven.** Vos staat boven de lijn met een vlaggetje in zijn poot waarop
 * het gezochte getal staat; het kind schuift hem naar het streepje waar dat
 * getal hoort. Het kind herkent een getal en zoekt de plek.
 *
 * **Invullen.** Boven de lijn staan lege vakjes met een pijltje naar het
 * streepje waar ze bij horen; het kind typt er zelf het getal in. Precies
 * andersom, en moeilijker: het kind moet het getal zelf bedenken in plaats van
 * het te herkennen. Zo staat het ook op werkbladen — een lijn met de tientallen
 * eronder en lege hokjes met een pijltje erboven.
 *
 * **Schatten.** Een lege lijn met alleen het begin en het eind eronder, en Vos
 * met zijn vlaggetje erboven. Het kind schuift hem naar de plek waar het getal
 * volgens hem ligt — vrij, want er zijn geen streepjes om op vast te klikken.
 * Dat oefent iets anders dan precies plaatsen: schatten met ankerpunten en de
 * helft-strategie, bijvoorbeeld dat 74 net voorbij driekwart ligt.
 *
 * **Tussen.** Een wijzertje boven de lijn draagt een getal, bijvoorbeeld 21, en
 * op de twee streepjes links en rechts ervan staat een leeg vakje in plaats van
 * een getal. Het kind typt daar de twee tientallen in waar het getal tussen
 * ligt. Een vaste schoolopdracht bij het positioneren op de getallenlijn, en de
 * vakjes staan op de lijn zelf — dezelfde manier van invullen als op de stenen
 * bij "Telrij stapstenen".
 *
 * ---------------------------------------------------------------------------
 * Waarom een gewone lijn
 * ---------------------------------------------------------------------------
 * Op school, op het digibord en in het rekenboek ziet een kind altijd dezelfde
 * rechte lijn met streepjes. Dat beeld moet het hier herkennen: het is het
 * model waarmee het later leert rekenen met sprongen. Het speelse zit ernaast
 * — Vos loopt met zijn vlaggetje over de lijn — maar de lijn zelf blijft
 * rustig en kaal.
 *
 * Een getallenlijn oefent iets anders dan een telrij: niet "wat komt er na",
 * maar "waar zit dit getal tussen". Daarvoor moet er ruimte omheen te zien
 * zijn, en moet het kind zelf naar een plek toe kunnen.
 *
 * Waarom Vos het wijzertje is: op school laat de juf kinderen letterlijk over
 * een getallenlijn lopen. Dat is de handeling die ze kennen, en hij komt terug
 * bij "Telrij stapstenen", waar Vos ook over een rij beweegt.
 *
 * ---------------------------------------------------------------------------
 * Hoeveel er te zien is bepaalt de moeilijkheid
 * ---------------------------------------------------------------------------
 * Staan alle getallen eronder, dan hoeft een kind alleen te lezen. Staan alleen
 * de vijftallen er, dan moet het vanaf een vijftal verder tellen. Bij alleen de
 * tientallen wordt de stap groter, en met alleen het begin en het eind moet het
 * de lijn zelf indelen. Scholen gebruiken die opbouw ook: eerst alles, eind
 * groep 3 de vijftallen, halverwege groep 4 de tientallen.
 *
 * ---------------------------------------------------------------------------
 * Het antwoord
 * ---------------------------------------------------------------------------
 * Eén getal per gevraagde plek, met komma's ertussen en van links naar rechts:
 * bij het schuiven is dat het streepje waar Vos komt te staan, bij het invullen
 * het getal in elk vakje. Staan er meerdere vakjes, dan moet alles kloppen voor
 * een goed antwoord; het scherm kleurt daarna per vakje groen of rood.
 *
 * De vraagvorm blijft `sleepgetallen`, net als bij "Tellen en slepen" en de
 * trein, zodat nakijken, opslaan en hervatten langs dezelfde weg lopen als
 * altijd.
 *
 * ---------------------------------------------------------------------------
 * Een lang bereik past ook op een telefoon
 * ---------------------------------------------------------------------------
 * Twee knoppen om het klein te houden. De eerste is de stapgrootte: met een
 * streepje per vijf of per tien past 0 tot 100 gewoon op één lijn. De tweede is
 * het venster: passen er dan nog te veel streepjes, dan staat er niet de hele
 * lijn maar een stuk eruit — hoogstens `MAX_STREEPJES` streepjes waar alle
 * gevraagde getallen in vallen. Dat stuk begint op een rond getal, zodat het
 * begin herkenbaar blijft, en het staat in de vraag zelf opgeslagen — zo
 * tekenen de vraag en de uitleg gegarandeerd dezelfde lijn.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { getallenlijnPatronen } from "@/lib/generatoren/patronen/getallenlijn";
import { getallenlijnAanpak } from "@/lib/generatoren/aanpak/getallenlijn";
import { getallenlijnUitleg } from "@/lib/generatoren/scripts/getallenlijn";

/**
 * De standaardzin van dit type, voor alle groepen dezelfde.
 *
 * Met het gezochte getal erin, via de gewone `{som}`-plek. Het getal staat
 * daarmee twee keer in beeld: in de zin en op het vlaggetje van Vos. Dat is de
 * bedoeling — een kind dat nog niet vlot leest, laat de zin voorlezen en hoort
 * het getal dan.
 */
const VASTE_ZIN = "Breng Vos naar {som}.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VASTE_ZIN,
  "56": VASTE_ZIN,
  "78": VASTE_ZIN,
};

/**
 * De zinnen van de invulstand.
 *
 * Die hangen af van het aantal vakjes, en dat weet je pas bij het maken van de
 * vraag. Daarom staan ze hier apart; `maak` geeft de juiste set mee aan
 * `bepaalVraagtekst`. Een eigen zin bij het sjabloon gaat daar nog steeds
 * vóór — die wordt in dezelfde functie als eerste gelezen.
 */
function invulzinnen(vakjes: number): Record<Leeftijdsgroep, string> {
  const zin = vakjes === 1 ? "Welk getal hoort hier?" : "Welke getallen horen hier?";
  return { "34": zin, "56": zin, "78": zin };
}

/** De zin van de schatstand, voor alle groepen dezelfde. */
const SCHATZIN = "Waar ligt dit getal ongeveer?";

const SCHATZINNEN: Record<Leeftijdsgroep, string> = {
  "34": SCHATZIN,
  "56": SCHATZIN,
  "78": SCHATZIN,
};

/**
 * De zinnen van de tussenstand.
 *
 * Die hangen af van de sprong: tientallen en honderdtallen noem je bij naam,
 * maar bij vijftallen zegt niemand "tussen welke vijftallen", dus daar staat
 * "tussen welke getallen".
 */
function tussenzinnen(sprong: number): Record<Leeftijdsgroep, string> {
  const zin =
    sprong === 100
      ? "Tussen welke honderdtallen ligt dit getal?"
      : sprong === 5
        ? "Tussen welke getallen ligt dit getal?"
        : "Tussen welke tientallen ligt dit getal?";
  return { "34": zin, "56": zin, "78": zin };
}

/**
 * Dezelfde zin, maar met een getal op de plek van de plaatshouder.
 *
 * Alleen om in beheer in het grijs te laten zien. Anders staat daar "Breng Vos
 * naar {som}." en zie je niet wat het kind straks krijgt.
 */
const VOORBEELDZIN = "Breng Vos naar 12.";

const VOORBEELDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VOORBEELDZIN,
  "56": VOORBEELDZIN,
  "78": VOORBEELDZIN,
};

const MIN_GETAL = 0;
const MAX_GETAL = 1000;

/**
 * Vanaf hoeveel streepjes het te druk wordt.
 *
 * Geen grens meer, maar een grens vóór het meldingetje: de lijn toont altijd
 * het hele bereik. Eenentwintig streepjes passen op een telefoon — de lijn
 * krijgt daar ongeveer 340 pixels, dus zo'n zestien pixels per streepje — en
 * daarboven komen de getallen zo dicht op elkaar dat ze niet meer te lezen
 * zijn. Dan staat er in het beheervoorbeeld het advies om een grotere
 * stapgrootte te kiezen.
 */
export const MAX_STREEPJES = 21;

/**
 * En vanaf hoeveel het te druk wordt bij de tussenstand.
 *
 * Daar staan twee invulvakjes naast elkaar óp de lijn, en die vragen meer
 * breedte dan een getal. Tot een streepje of twaalf houden ze elkaar nog vrij;
 * daarboven wordt het krap en zegt het voorbeeld dat er beter een grotere
 * sprong gekozen kan worden.
 */
export const MAX_TUSSEN_STREEPJES = 12;

/** Welke getallen er onder de streepjes staan. */
export type Zichtbaar = "alle" | "vijftallen" | "tientallen" | "uiteinden";

/** Wat het kind doet. */
export type Stand = "schuiven" | "invullen" | "tussen" | "schatten";

function standVan(ruw: string): Stand {
  if (ruw === "invullen") return "invullen";
  if (ruw === "tussen") return "tussen";
  if (ruw === "schatten") return "schatten";
  return "schuiven";
}


/**
 * Wat een sjabloon van vóór dit veld bedoelde.
 *
 * Hier stond eerst een keuzelijst met geen, het midden of alle tientallen. Die
 * is vervangen door een vrij in te vullen afstand. Een sjabloon dat nog de
 * oude waarde heeft opgeslagen houdt daarmee zijn streepjes, zodat er niets
 * stilletjes verandert aan wat er al was ingesteld.
 */
function oudeHulpstap(inst: Instellingen): number {
  const oud = tekst(inst, "hulpstreepjes", "");
  if (oud === "tientallen") return 10;
  if (oud === "midden") {
    const van = getal(inst, "van", 0);
    const tot = getal(inst, "tot", 100);
    return Math.max(1, Math.round((tot - van) / 2));
  }
  return 0;
}

function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 0)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  const ruweStap = getal(inst, "stap", 1);
  return {
    van,
    tot,
    /* Eén streepje per getal, per vijf of per tien; iets anders bestaat niet. */
    stap: ruweStap === 5 || ruweStap === 10 ? ruweStap : 1,
    zichtbaar: (tekst(inst, "zichtbaar", "alle") || "alle") as Zichtbaar,
    stand: standVan(tekst(inst, "stand", "schuiven")),
    /* Alleen voor de tussenstand: hoe groot de sprong tussen twee streepjes is. */
    sprong: [5, 10, 100].includes(getal(inst, "sprong", 10)) ? getal(inst, "sprong", 10) : 10,
    /* En of de getallen onder de andere streepjes te zien zijn. */
    buurgetallen: vinkje(inst, "buurgetallen", true),
    /* Alleen bij het schatten: hoe nauwkeurig het moet, in procenten van de lijn. */
    marge: Math.max(1, Math.min(25, getal(inst, "marge", 5))),
    /* En om de hoeveel er een hulpstreepje komt; 0 of leeg is een kale lijn. */
    hulpstap: Math.max(0, Math.min(1000, Math.floor(getal(inst, "hulpstap", oudeHulpstap(inst))))),
    hulpgetallen: vinkje(inst, "hulpgetallen", false),
    /* Eén tot vier vakjes; meer past niet leesbaar boven de lijn. */
    vakjes: Math.max(1, Math.min(4, getal(inst, "vakjes", 2))),
    vosWachtend: tekst(inst, "vosWachtend", ""),
    vosBlij: tekst(inst, "vosBlij", ""),
  };
}

/**
 * Waar de lijn eindigt.
 *
 * Bij het laatste streepje dat nog binnen het bereik valt. Meestal is dat het
 * grootste getal zelf; alleen als dat niet op een streepje valt — 0 tot 25 met
 * stappen van tien — houdt de lijn eerder op. Het voorbeeld in beheer meldt
 * dat, zodat het geen stille verrassing is.
 */
export function lijnEind(van: number, tot: number, stap: number): number {
  const veilig = stap > 0 ? stap : 1;
  return van + Math.floor(Math.max(0, tot - van) / veilig) * veilig;
}

/** Hoeveel streepjes er op de lijn komen. */
export function aantalStreepjes(van: number, tot: number, stap: number): number {
  const veilig = stap > 0 ? stap : 1;
  return Math.floor(Math.max(0, tot - van) / veilig) + 1;
}

/** Alle getallen waar een streepje voor komt. */
export function streepjes(start: number, eind: number, stap: number): number[] {
  const uit: number[] = [];
  for (let n = start; n <= eind; n += stap) uit.push(n);
  return uit;
}

/** De sprong van de getallen die blijven staan: vijf, tien of elk streepje. */
function labelstap(zichtbaar: Zichtbaar): number {
  if (zichtbaar === "vijftallen") return 5;
  if (zichtbaar === "tientallen") return 10;
  return 1;
}

/**
 * Welke getallen er onder de streepjes komen te staan.
 *
 * De uiteinden van het getoonde stuk staan er altijd bij, ook bij de vijf- en
 * tientallen: zonder een getal aan het begin is er geen houvast om vanaf te
 * tellen, en dan valt er niets uit te rekenen.
 */
export function zichtbareGetallen(
  start: number,
  eind: number,
  stap: number,
  zichtbaar: Zichtbaar,
): number[] {
  return streepjes(start, eind, stap).filter(
    (n) =>
      zichtbaar === "alle" ||
      n === start ||
      n === eind ||
      (zichtbaar !== "uiteinden" && n % labelstap(zichtbaar) === 0),
  );
}

/**
 * Welke streepjes er gevraagd kunnen worden.
 *
 * Altijd de streepjes tussen de twee uiteinden; die blijven staan als houvast.
 * In de invulstand vallen daar de streepjes af waar al een getal onder staat:
 * een vakje boven een streepje met het getal eronder valt niets uit te zoeken,
 * het kind schrijft dan over. In de schuifstand mag dat wel — daar is het
 * alleen een makkelijkere vraag.
 */
function vraagbaar(
  start: number,
  eind: number,
  stap: number,
  zichtbaar: Zichtbaar,
  stand: Stand,
): number[] {
  const binnen = streepjes(start, eind, stap).slice(1, -1);
  if (stand !== "invullen") return binnen;
  const labels = zichtbareGetallen(start, eind, stap, zichtbaar);
  return binnen.filter((n) => !labels.includes(n));
}

/**
 * Welke getallen er bij het schatten een hulpstreepje krijgen.
 *
 * Om de `stap` een streepje, op ronde getallen: bij 20 komen ze op 20, 40, 60
 * en 80, bij 25 op 25, 50 en 75. Past de afstand niet netjes in het bereik —
 * 30 bij 0 tot 100 — dan staan ze gewoon op 30, 60 en 90 en blijft de rest
 * leeg; daar is niets mis mee.
 *
 * De uiteinden staan er niet bij: die hebben altijd al hun eigen streepje met
 * het getal eronder. Is de stap 0 (of het veld leeg), dan is de lijn kaal.
 */
export function hulplijnenVoor(start: number, eind: number, stap: number): number[] {
  if (stap <= 0) return [];
  const uit: number[] = [];
  /* Op veelvouden van de stap zelf, zodat het ronde getallen blijven. */
  for (let n = Math.ceil((start + 1) / stap) * stap; n < eind; n += stap) {
    if (n > start) uit.push(n);
  }
  return uit;
}

/**
 * Welke streepjes er een leeg vakje krijgen.
 *
 * Ze mogen niet naast elkaar liggen: een vakje is een stuk breder dan een
 * streepje, dus twee vakjes vlak bij elkaar zouden over elkaar heen vallen en
 * dan wijzen de pijltjes nergens meer naar. Daarom houdt elke keuze een marge
 * vrij, zo ruim als er bij dit aantal vakjes in past. Lukt het na een aantal
 * pogingen niet, dan `null` en probeert `maak` een ander stuk lijn.
 */
function kiesVakjes(
  kans: () => number,
  kandidaten: number[],
  hoeveel: number,
  stap: number,
): number[] | null {
  /*
    Eerst ruim proberen, en pas krapper als dat niet lukt.

    Ruim is wat een vakje naast een vakje nodig heeft: bij vier vakjes op
    twintig streepjes zijn dat er zo'n vijf ertussen. Past dat niet — een kort
    bereik met vier vakjes — dan mag het krapper; het scherm maakt de vakjes
    dan smaller, zodat ze elkaar alsnog niet raken.
  */
  const ruim = Math.max(1, Math.floor((kandidaten.length - 1) / hoeveel));

  for (let ruimte = ruim; ruimte >= 1; ruimte--) {
    const marge = ruimte * stap;
    for (let poging = 0; poging < 40; poging++) {
      const gekozen: number[] = [];
      let rest = [...kandidaten];
      while (gekozen.length < hoeveel && rest.length > 0) {
        const n = rest[Math.floor(kans() * rest.length)];
        gekozen.push(n);
        rest = rest.filter((k) => Math.abs(k - n) > marge);
      }
      if (gekozen.length === hoeveel) return gekozen.sort((a, b) => a - b);
    }
  }
  return null;
}

export const getallenlijnGenerator: Generator = {
  id: "getallenlijn",
  naam: "Getallenlijn",
  uitleg:
    "Een rechte getallenlijn met streepjes, zoals op school. Vos staat erboven met een vlaggetje in zijn poot waar het gezochte getal op staat; het kind schuift hem naar het streepje waar dat getal hoort en hij plant zijn vlag. Hoeveel getallen er onder de lijn staan, bepaalt hoe moeilijk het is.",
  suggestie:
    "Groep 3: 0 tot 20, streepje per getal, alle getallen · eind groep 3: alleen de vijftallen · halverwege groep 4: 0 tot 50, alleen de tientallen · groep 5: 0 tot 100 met een streepje per vijf",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste getal",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: `De lijn loopt van het kleinste tot het grootste getal, bij elke vraag hetzelfde. Er wordt nooit een stuk van de lijn getoond. Komen er veel streepjes op — vanaf ongeveer ${MAX_STREEPJES} staan ze zo dicht op elkaar dat de getallen niet meer te lezen zijn — dan zegt het voorbeeld hieronder dat, en kies je zelf een grotere stapgrootte. Valt het grootste getal niet op een streepje, dan houdt de lijn op bij het laatste streepje dat er wél op valt.`,
    },
    {
      soort: "keuze",
      sleutel: "stap",
      label: "Stapgrootte tussen de streepjes",
      opties: [
        { waarde: "1", label: "Een streepje per getal" },
        { waarde: "5", label: "Een streepje per vijf" },
        { waarde: "10", label: "Een streepje per tien" },
      ],
      hulp: "Hiermee houd je een groot bereik overzichtelijk: met een streepje per tien past 0 tot 100 op één lijn in plaats van honderd streepjes. Het gevraagde getal valt altijd op een streepje.",
    },
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat het kind doet",
      opties: [
        { waarde: "schuiven", label: "Vos naar het getal schuiven" },
        { waarde: "invullen", label: "Zelf het getal invullen" },
        { waarde: "tussen", label: "Tussen welke tientallen ligt het getal" },
        { waarde: "schatten", label: "Schatten op een lege lijn" },
      ],
      hulp: "Bij schuiven draagt Vos een vlaggetje met het gezochte getal en zoekt het kind de plek op de lijn. Bij invullen staan er lege vakjes met een pijltje naar een streepje en typt het kind zelf het getal; dat is moeilijker, want het kind moet het getal zelf bedenken in plaats van het te herkennen. Bij de derde stand staat er een wijzertje met een getal boven de lijn — bijvoorbeeld 21 — en typt het kind in twee vakjes óp de lijn tussen welke tientallen dat getal ligt: 20 en 30. Dat oefent het positioneren op de lijn en is de vaste opdracht uit het rekenboek. De vierde stand is schatten: een lege lijn met alleen het begin en het eind, waarop het kind Vos vrij naar de geschatte plek schuift. Daar gaat het niet om precies plaatsen maar om schatten met ankerpunten — 74 ligt net voorbij driekwart — en het antwoord is goed als het dicht genoeg in de buurt is.",
    },
    {
      soort: "keuze",
      sleutel: "zichtbaar",
      label: "Welke getallen staan onder de lijn",
      opties: [
        { waarde: "alle", label: "Alle getallen" },
        { waarde: "vijftallen", label: "Alleen de vijftallen" },
        { waarde: "tientallen", label: "Alleen de tientallen" },
        { waarde: "uiteinden", label: "Alleen het begin en het eind" },
      ],
      hulp: "Geldt bij het schuiven en bij het invullen. De tussenstand heeft daarvoor zijn eigen vinkje en de schatstand zijn eigen hulpstreepjes, allebei hieronder. Dit bepaalt de moeilijkheid. Bij alle getallen hoeft het kind alleen te lezen. Bij de vijftallen moet het vanaf een vijftal doortellen, bij de tientallen wordt die stap groter, en met alleen het begin en het eind moet het de lijn zelf indelen. Scholen bouwen het zo op: eerst alle getallen, eind groep 3 alleen de vijftallen, halverwege groep 4 alleen de tientallen. Wat je hier kiest staat er altijd, ook als het gevraagde getal er toevallig bij zit: bij de vijftallen en bereik 0 tot 20 staan er dus altijd 0, 5, 10, 15 en 20 onder de lijn. Die getallen zijn de ankerpunten waaraan het kind zich oriënteert. Wordt er net naar een vijftal gevraagd, dan is die vraag makkelijker; de lijn blijft wel kloppen.",
    },
    {
      soort: "getal",
      sleutel: "vakjes",
      label: "Invulstand: hoeveel vakjes",
      min: 1,
      max: 4,
      hulp: "Alleen van belang bij de invulstand. Eén vakje is het rustigst; bij vier moet het kind vier keer vanaf een zichtbaar getal tellen. De vakjes staan altijd een eind uit elkaar, zodat ze elkaar niet raken en de pijltjes duidelijk blijven. Ze komen alleen boven streepjes waar géén getal onder staat, anders valt er niets uit te zoeken.",
    },
    {
      soort: "keuze",
      sleutel: "sprong",
      label: "Tussenstand: sprong tussen de streepjes",
      opties: [
        { waarde: "10", label: "Tientallen" },
        { waarde: "5", label: "Vijftallen" },
        { waarde: "100", label: "Honderdtallen" },
      ],
      hulp: "Alleen van belang bij de tussenstand: hoe groot de sprong is van het ene streepje naar het volgende. Tientallen is de gewone schoolopdracht, vijftallen maakt de sprong kleiner en de stap voor het kind makkelijker, honderdtallen is voor grote getallen en groep 5 en hoger. De vraagzin past zich aan: bij vijftallen staat er \"Tussen welke getallen ligt dit getal?\"",
    },
    {
      soort: "vinkje",
      sleutel: "buurgetallen",
      label: "Tussenstand: de andere getallen onder de lijn tonen",
      hulp: "Aan: onder alle andere streepjes staat het getal. Het kind kan dan aflezen welke twee er ontbreken, en dat maakt het makkelijk. Uit: alleen het kleinste en het grootste getal van het bereik blijven staan, alle streepjes blijven wel zichtbaar maar zonder getal. Het kind ziet dan alleen het wijzertje — bijvoorbeeld 32 — en moet vanaf het begin zelf tellen met sprongen van tien. Dat is een stuk lastiger, en het is precies de opbouw die scholen in groep 4 gebruiken: de getallen gaan geleidelijk van de lijn af zodat kinderen zelf hulpgetallen leren plaatsen.",
    },
    {
      soort: "getal",
      sleutel: "marge",
      label: "Schatstand: hoe nauwkeurig, in procenten",
      min: 1,
      max: 25,
      hulp: "Alleen van belang bij de schatstand: hoeveel het kind ernaast mag zitten, gerekend over de hele lijn. Vijf procent op een lijn van 0 tot 100 betekent dat het er vijf naast mag zitten. Kleiner is strenger; onder de drie procent wordt het op een telefoon lastig om met een vinger nog nauwkeurig genoeg te schuiven. Tien procent is mild en geschikt om mee te beginnen.",
    },
    {
      soort: "getal",
      sleutel: "hulpstap",
      label: "Schatstand: om de hoeveel een hulpstreepje",
      min: 0,
      max: 1000,
      hulp: "Alleen van belang bij de schatstand. Vul in om de hoeveel er een streepje op de lijn komt: 20 geeft bij een bereik van 0 tot 100 streepjes op 20, 40, 60 en 80; 25 geeft ze op 25, 50 en 75. Ze komen altijd op ronde getallen en blijven binnen het bereik — past de afstand niet netjes, zoals 30 in 0 tot 100, dan staan ze op 30, 60 en 90 en blijft de rest leeg. Leeg laten of 0 invullen geeft een kale lijn. Hoe groter de afstand, hoe minder houvast en hoe moeilijker het schatten: een kale lijn is het moeilijkst, streepjes bij elke tien het makkelijkst.",
    },
    {
      soort: "vinkje",
      sleutel: "hulpgetallen",
      label: "Schatstand: de getallen bij de hulpstreepjes tonen",
      hulp: "Uit: de streepjes zijn alleen een visueel houvast en het kind moet zelf bedenken welk getal daar hoort. Aan: het getal staat eronder, en dan wordt het schatten een stuk makkelijker — het kind hoeft dan alleen nog tussen twee bekende getallen in te schatten.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosWachtend",
      label: "Vos — wachtend",
      hulp: "Dit is de vos die het kind over de lijn schuift. Leeg = de standaardvos van dit soort oefening; die staat bij Afbeeldingen.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosBlij",
      label: "Vos — blij",
      hulp: "Te zien als hij op het goede streepje staat; dan plant hij een vlaggetje en springt hij op. Leeg = de standaardvos van dit soort oefening.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: VOORBEELDZINNEN,
      extraHulp:
        "Het grijze voorbeeld hoort bij de schuifstand. Staat het sjabloon op invullen, dan is de standaardzin \"Welk getal hoort hier?\" bij één vakje en \"Welke getallen horen hier?\" bij meer vakjes. Vul je hier zelf een zin in, dan geldt die in allebei de standen.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    /* Wat er op de plek van {som} komt: het getal dat gezocht wordt. */
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: {
    van: 0,
    tot: 20,
    stap: "1",
    stand: "schuiven",
    vakjes: 2,
    sprong: "10",
    buurgetallen: true,
    marge: 5,
    hulpstap: 0,
    hulpgetallen: false,
    zichtbaar: "alle",
    vosWachtend: "",
    vosBlij: "",
  },
  foutpatronen: getallenlijnPatronen,
  aanpak: getallenlijnAanpak,
  uitleganimatie: getallenlijnUitleg,

  /*
    Hoeveel verschillende vragen er bestaan: welke streepjes er leeg te maken
    vallen. De uiteinden houden hun getal, de rest komt in aanmerking. Het
    aantal combinaties loopt snel op, dus hier de veilige ondergrens.
  */
  /*
    Hoeveel verschillende vragen er bestaan: het aantal streepjes dat gevraagd
    kan worden in één venster. Bij het invullen worden er meerdere tegelijk
    gevraagd, dus daar zijn het er navenant minder.
  */
  maximum: (inst) => {
    const { van, tot, stap, zichtbaar, stand, vakjes, sprong } = grenzen(inst);
    /* Schatten: elk getal tussen het begin en het eind kan gevraagd worden. */
    if (stand === "schatten") return Math.max(0, tot - van - 1);
    if (stand === "tussen") {
      const breedte = aantalStreepjes(van, tot, sprong);
      /*
        Per paar streepjes alle getallen die er tussenin liggen, min het eerste
        stuk van de lijn: daar zou het antwoord met het kleinste getal beginnen
        en dat is geen tiental.
      */
      return Math.max(0, (breedte - 2) * (sprong - 1));
    }
    const vrij = vraagbaar(van, lijnEind(van, tot, stap), stap, zichtbaar, stand).length;
    if (stand === "invullen") return Math.max(0, vrij - vakjes + 1);
    return Math.max(0, vrij);
  },

  waarschuwing: (inst) => {
    const { van, tot, stap, zichtbaar, stand, vakjes, sprong } = grenzen(inst);
    if (stand === "schatten") {
      if (tot - van >= 2) return null;
      return `Er ligt geen getal tussen ${van} en ${tot} om naar te schatten. Maak het bereik ruimer.`;
    }
    if (stand === "tussen") {
      const breedte = aantalStreepjes(van, tot, sprong);
      if (breedte >= 3) return null;
      return `Er passen te weinig streepjes op de lijn: van ${van} tot ${tot} met sprongen van ${sprong} zijn er ${breedte}, en er zijn er minstens drie nodig. Het eerste stuk van de lijn doet niet mee — daar zou het antwoord bij ${van} beginnen, en dat is geen tiental. Maak het bereik ruimer of kies een kleinere sprong.`;
    }
    const breedte = aantalStreepjes(van, tot, stap);
    const vrij = vraagbaar(van, lijnEind(van, tot, stap), stap, zichtbaar, stand).length;
    const nodig = stand === "invullen" ? vakjes : 1;
    if (vrij >= nodig) return null;

    if (stand !== "invullen") {
      return `Er blijft geen streepje over om naar te zoeken: er staan maar ${breedte} streepjes, en het eerste en het laatste houden hun getal. Maak het bereik ruimer of kies een kleinere stapgrootte.`;
    }
    if (vrij === 0) {
      return "Bij de invulstand moet er onder een streepje juist géén getal staan — dat is wat het kind invult. Met deze instellingen staat er overal al een getal onder de lijn. Zet \"Welke getallen staan onder de lijn\" op de vijftallen, de tientallen of alleen het begin en het eind, of kies een kleinere stapgrootte.";
    }
    return `Er blijven te weinig lege streepjes over voor ${vakjes} vakjes: er ${
      vrij === 1 ? "is er 1" : `zijn er ${vrij}`
    } zonder getal eronder. Maak het bereik ruimer, kies een kleinere stapgrootte, of vraag minder vakjes.`;
  },

  /*
    Waar een beheerder op moet letten terwijl er wél sommen uitkomen.

    Twee dingen: het kan te druk worden op de lijn, en het grootste getal kan
    net buiten de laatste sprong vallen. Allebei houden ze niets tegen — de
    lijn toont wat er is ingesteld — maar ze horen niet stilletjes te gebeuren.
  */
  letOp: (inst) => {
    const { van, tot, stap, stand, sprong, marge } = grenzen(inst);
    /*
      Bij het schatten staan er geen streepjes, dus wordt het nooit te druk.
      Wel kan de marge zo klein zijn dat een vinger hem niet haalt: op een
      telefoon is de lijn zo'n 300 pixels breed, en een vinger zet je met een
      pixel of vier nauwkeurig neer. Onder de drie procent wordt dat wrijven.
    */
    if (stand === "schatten") {
      const speling = Math.round(((tot - van) * marge) / 100);
      if (marge < 3) {
        return `Een marge van ${marge}% is erg streng: op een telefoon is de lijn ongeveer 300 pixels breed, dus dat is nog geen tien pixels speling. Vanaf 3% is het met een vinger goed te doen.`;
      }
      if (speling < 1) {
        return `Met ${marge}% over een bereik van ${van} tot ${tot} moet het kind het getal precies raken. Maak de marge groter of het bereik ruimer.`;
      }
      return null;
    }
    const sprongNu = stand === "tussen" ? sprong : stap;
    const drempel = stand === "tussen" ? MAX_TUSSEN_STREEPJES : MAX_STREEPJES;
    const breedte = aantalStreepjes(van, tot, sprongNu);
    const eind = lijnEind(van, tot, sprongNu);

    const meldingen: string[] = [];
    if (breedte > drempel) {
      meldingen.push(
        `Er komen ${breedte} streepjes op de lijn. Vanaf ongeveer ${drempel} staan ze zo dicht op elkaar dat de getallen eronder niet meer te lezen zijn${
          stand === "tussen" ? " en de invulvakjes elkaar raken" : ""
        }. Kies een grotere ${stand === "tussen" ? "sprong" : "stapgrootte"} als je dit hele bereik wilt tonen.`,
      );
    }
    if (eind !== tot) {
      meldingen.push(
        `Het grootste getal ${tot} valt niet op een streepje: met sprongen van ${sprongNu} vanaf ${van} loopt de lijn tot ${eind}. Kies een grootste getal dat wel op een sprong uitkomt, of een andere ${stand === "tussen" ? "sprong" : "stapgrootte"}.`,
      );
    }
    return meldingen.length > 0 ? meldingen.join(" ") : null;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const {
      van,
      tot,
      stap,
      zichtbaar,
      stand,
      vakjes,
      sprong,
      buurgetallen,
      marge,
      hulpstap,
      hulpgetallen,
      vosWachtend,
      vosBlij,
    } = grenzen(inst);

    const uit: Gegenereerd[] = [];

    /*
      De schatstand loopt apart: een kale lijn zonder streepjes.

      Er valt niets af te tellen, dus de stapgrootte doet hier niets. Het
      gevraagde getal ligt ergens tussen het begin en het eind, en hoe dicht
      het kind erbij moet komen staat als echte getallen in de vraag — zo kan
      het nakijken het daar aflezen.
    */
    if (stand === "schatten") {
      if (tot - van < 2) return uit;
      const hulplijnen = hulplijnenVoor(van, tot, hulpstap);
      const speling = Math.max(1, Math.round(((tot - van) * marge) / 100));

      for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
        const doel = heelGetal(kans, van + 1, tot - 1);

        const handtekening = `getallenlijn:${van}-${tot}:schatten:${doel}`;
        if (alGebruikt.has(handtekening)) continue;
        alGebruikt.add(handtekening);

        /* De uiteinden, en de hulpstreepjes als hun getal erbij mag staan. */
        const vast = hulpgetallen ? [van, ...hulplijnen, tot] : [van, tot];
        const gegevens = {
          soort: "getallenlijn",
          variant: "schatten",
          getallen: [doel],
          goed: doel,
          extra: {
            start: van,
            eind: tot,
            stap: 1,
            /* Waaraan de foutpatronen en de uitleg zien dat dit schatten is. */
            schatten: 1,
            marge: speling,
            ...Object.fromEntries(vast.map((n, i) => [`vast${i}`, n])),
            aantalVast: vast.length,
          },
        };

        uit.push({
          handtekening,
          vorm: "sleepgetallen",
          vraagtekst: bepaalVraagtekst(
            { vraagteksten: { standaard: SCHATZINNEN } },
            inst,
            groep,
            gegevens,
          ),
          opties: [{ tekst: String(doel), afbeelding: null }],
          antwoord: String(doel),
          figuur: {
            soort: "getallenlijn",
            start: van,
            eind: tot,
            stap: 1,
            zichtbaar: vast,
            stand: "schatten",
            doel,
            gevraagd: [doel],
            hulplijnen,
            marge: speling,
            vos: { wachtend: vosWachtend || null, blij: vosBlij || null },
          },
          somgegevens: gegevens,
        });
      }

      return uit;
    }

    /*
      De tussenstand loopt apart: die tekent zijn eigen lijn.

      De streepjes staan er een sprong uit elkaar — tientallen, vijftallen of
      honderdtallen — en het gevraagde getal ligt er juist tússen, dus niet op
      een streepje. Een rond tiental heeft geen "tussen", dus die komt hier niet
      als vraag voorbij.
    */
    if (stand === "tussen") {
      /*
        Er zijn minstens drie streepjes nodig.

        Het eerste stuk van de lijn doet namelijk niet mee: bij een bereik dat
        op 0 begint zou het antwoord daar "0 en 10" zijn, en 0 is geen tiental
        — dat klopt niet met de vraag. Hetzelfde geldt als de lijn op 50 begint:
        het stuk van 50 tot 60 blijft ongebruikt. De vraag begint dus pas bij
        het tweede streepje.
      */
      const breedte = aantalStreepjes(van, tot, sprong);
      if (breedte < 3) return uit;

      /* Ook hier: de hele lijn, van het kleinste tot het grootste getal. */
      const start = van;
      const eind = lijnEind(van, tot, sprong);

      for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {

        /* Het paar streepjes waar het getal tussen ligt, en het getal zelf. */
        const onder = start + heelGetal(kans, 1, breedte - 2) * sprong;
        const boven = onder + sprong;
        const wijzer = onder + heelGetal(kans, 1, sprong - 1);

        const handtekening = `getallenlijn:${start}-${eind}/${sprong}:tussen:${wijzer}`;
        if (alGebruikt.has(handtekening)) continue;
        alGebruikt.add(handtekening);

        /*
          Wat er onder de lijn komt te staan.

          Met het vinkje aan: alle andere streepjes hun getal, zodat het kind
          kan zien welke twee er ontbreken. Met het vinkje uit: alleen het
          kleinste en het grootste getal van het bereik, zodat het kind zelf
          moet tellen met sprongen. De streepjes blijven in allebei de gevallen
          staan — alleen de getallen eronder verdwijnen.

          De twee gevraagde plekken vallen er altijd af: daar staat een vakje.
        */
        const vast = (buurgetallen ? streepjes(start, eind, sprong) : [start, eind]).filter(
          (n) => n !== onder && n !== boven,
        );

        const gegevens = {
          soort: "getallenlijn",
          variant: "tussen",
          getallen: [onder, boven],
          goed: onder,
          extra: {
            start,
            eind,
            stap: sprong,
            /* Het getal op het wijzertje; daar gaat de vraag over. */
            wijzer,
            ...Object.fromEntries(vast.map((n, i) => [`vast${i}`, n])),
            aantalVast: vast.length,
          },
        };

        uit.push({
          handtekening,
          vorm: "sleepgetallen",
          vraagtekst: bepaalVraagtekst(
            { vraagteksten: { standaard: tussenzinnen(sprong) } },
            inst,
            groep,
            gegevens,
          ),
          opties: [onder, boven].map((n) => ({ tekst: String(n), afbeelding: null })),
          antwoord: `${onder},${boven}`,
          figuur: {
            soort: "getallenlijn",
            start,
            eind,
            stap: sprong,
            zichtbaar: vast,
            stand: "tussen",
            doel: onder,
            gevraagd: [onder, boven],
            wijzer,
            vos: { wachtend: vosWachtend || null, blij: vosBlij || null },
          },
          somgegevens: gegevens,
        });
      }

      return uit;
    }

    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /* De lijn is altijd het hele bereik; er wordt geen stuk uitgekozen. */
      const start = van;
      const eind = lijnEind(van, tot, stap);

      /*
        De getallen onder de lijn blijven staan zoals de instelling ze bepaalt,
        ook als het gevraagde getal er toevallig bij zit.

        Ze zijn de ankerpunten waaraan een kind zich oriënteert; haal je er
        eentje weg omdat dat net het gevraagde getal is, dan valt midden op de
        lijn een gat en klopt het beeld niet meer met wat het kind op school
        ziet. Is het gevraagde getal een vijftal of tiental, dan is de vraag
        inderdaad makkelijker — dat mag.
      */
      const vast = zichtbareGetallen(start, eind, stap, zichtbaar);

      const kandidaten = vraagbaar(start, eind, stap, zichtbaar, stand);
      if (kandidaten.length === 0) break;

      /* Bij het invullen meerdere plekken tegelijk, netjes uit elkaar. */
      const gevraagd =
        stand === "invullen"
          ? kiesVakjes(kans, kandidaten, Math.min(vakjes, kandidaten.length), stap)
          : [kandidaten[Math.floor(kans() * kandidaten.length)]];
      if (!gevraagd || gevraagd.length === 0) continue;

      const handtekening = `getallenlijn:${start}-${eind}/${stap}:${zichtbaar}:${stand}:${gevraagd.join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "getallenlijn",
        variant: zichtbaar,
        getallen: gevraagd,
        goed: gevraagd[0],
        extra: {
          start,
          eind,
          stap,
          vakjes: gevraagd.length,
          /* De zichtbare getallen, zodat de uitleg weet waar hij mag beginnen. */
          ...Object.fromEntries(vast.map((n, i) => [`vast${i}`, n])),
          aantalVast: vast.length,
        },
      };

      /* De invulstand heeft zijn eigen zin, en die hangt af van het aantal vakjes. */
      const zinnen =
        stand === "invullen"
          ? { standaard: invulzinnen(gevraagd.length) }
          : getallenlijnGenerator.vraagteksten;

      uit.push({
        handtekening,
        vorm: "sleepgetallen",
        vraagtekst: bepaalVraagtekst({ vraagteksten: zinnen }, inst, groep, gegevens),
        /* Wat er gevraagd wordt; er valt niets te kiezen, maar de vorm wil een lijst. */
        opties: gevraagd.map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: gevraagd.join(","),
        figuur: {
          soort: "getallenlijn",
          start,
          eind,
          stap,
          zichtbaar: vast,
          stand,
          /* Het eerste gevraagde getal; bij het schuiven is dat het enige. */
          doel: gevraagd[0],
          gevraagd,
          vos: { wachtend: vosWachtend || null, blij: vosBlij || null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
