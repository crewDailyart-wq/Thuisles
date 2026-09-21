/**
 * Getallenlijn: breng Vos naar het goede getal.
 *
 * Een rechte horizontale lijn met een streepje voor elk getal in het bereik en
 * een pijlpunt aan het eind. Onder sommige streepjes staat het getal, onder de
 * rest niet. Boven de lijn staat één getal groot in beeld, en Vos staat aan het
 * begin van de lijn. Het kind schuift hem naar het streepje waar dat getal
 * hoort.
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
 * Eén getal: het streepje waar Vos komt te staan. Bij een goed antwoord is dat
 * precies het getal dat boven de lijn staat. De vraagvorm blijft
 * `sleepgetallen`, net als bij "Tellen en slepen" en de trein, zodat nakijken,
 * opslaan en hervatten langs dezelfde weg lopen als altijd.
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
 * Hoeveel streepjes er hoogstens tegelijk op de lijn staan.
 *
 * Eenentwintig past op een telefoon: de lijn krijgt daar ongeveer 340 pixels,
 * dus zo'n zestien pixels per streepje. De getallen eronder worden niet
 * meegeschaald — die staan in echte letters over de tekening heen en gaan bij
 * krapte om en om hoog en laag staan, zie `Getallenlijn.tsx`. Meer streepjes
 * maakt het mikken te lastig, ook al blijft het leesbaar.
 */
export const MAX_STREEPJES = 21;

/** Welke getallen er onder de streepjes staan. */
export type Zichtbaar = "alle" | "vijftallen" | "tientallen" | "uiteinden";

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
    vosWachtend: tekst(inst, "vosWachtend", ""),
    vosBlij: tekst(inst, "vosBlij", ""),
  };
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
 * Welk stuk van de getallenlijn er te zien is.
 *
 * Passen alle streepjes, dan staat de hele lijn er. Anders een venster dat op
 * een rond getal begint — een vijftal of een tiental, afhankelijk van wat er
 * zichtbaar blijft — zodat het begin herkenbaar is.
 */
function kiesVenster(
  kans: () => number,
  van: number,
  tot: number,
  stap: number,
  zichtbaar: Zichtbaar,
): { start: number; eind: number } {
  const alle = Math.floor((tot - van) / stap) + 1;
  const breedte = Math.min(alle, MAX_STREEPJES);
  if (breedte >= alle) return { start: van, eind: van + (alle - 1) * stap };

  const rond = zichtbaar === "tientallen" ? 10 : 5;
  let index = heelGetal(kans, 0, alle - breedte);
  /* Een stukje terug tot het beginpunt rond is; niet verder dan één ronde stap. */
  for (let p = 0; p < rond && index > 0; p++) {
    if ((van + index * stap) % rond === 0) break;
    index--;
  }
  const start = van + index * stap;
  return { start, eind: start + (breedte - 1) * stap };
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
      hulp: `Het hele bereik waarbinnen de getallen vallen. Passen er meer dan ${MAX_STREEPJES} streepjes op, dan staat er een stuk van de lijn waar het gevraagde getal in valt, beginnend op een rond getal. Wil je toch het hele bereik in beeld, kies dan een grotere stapgrootte.`,
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
      sleutel: "zichtbaar",
      label: "Welke getallen staan onder de lijn",
      opties: [
        { waarde: "alle", label: "Alle getallen" },
        { waarde: "vijftallen", label: "Alleen de vijftallen" },
        { waarde: "tientallen", label: "Alleen de tientallen" },
        { waarde: "uiteinden", label: "Alleen het begin en het eind" },
      ],
      hulp: "Dit bepaalt de moeilijkheid. Bij alle getallen hoeft het kind alleen te lezen. Bij de vijftallen moet het vanaf een vijftal doortellen, bij de tientallen wordt die stap groter, en met alleen het begin en het eind moet het de lijn zelf indelen. Scholen bouwen het zo op: eerst alle getallen, eind groep 3 alleen de vijftallen, halverwege groep 4 alleen de tientallen. Wat je hier kiest staat er altijd, ook als het gevraagde getal er toevallig bij zit: bij de vijftallen en bereik 0 tot 20 staan er dus altijd 0, 5, 10, 15 en 20 onder de lijn. Die getallen zijn de ankerpunten waaraan het kind zich oriënteert. Wordt er net naar een vijftal gevraagd, dan is die vraag makkelijker; de lijn blijft wel kloppen.",
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
    ...vraagtekstVelden(STANDAARDZINNEN, { voorbeeldzinnen: VOORBEELDZINNEN }),
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
  maximum: (inst) => {
    const { van, tot, stap } = grenzen(inst);
    const breedte = Math.min(Math.floor((tot - van) / stap) + 1, MAX_STREEPJES);
    return Math.max(0, breedte - 2);
  },

  waarschuwing: (inst) => {
    const { van, tot, stap } = grenzen(inst);
    const breedte = Math.min(Math.floor((tot - van) / stap) + 1, MAX_STREEPJES);
    /* De twee uiteinden houden hun getal; alle streepjes ertussen kunnen gevraagd worden. */
    if (breedte - 2 >= 1) return null;
    return `Er blijft geen streepje over om naar te zoeken: er staan maar ${breedte} streepjes, en het eerste en het laatste houden hun getal. Maak het bereik ruimer of kies een kleinere stapgrootte.`;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, stap, zichtbaar, vosWachtend, vosBlij } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const { start, eind } = kiesVenster(kans, van, tot, stap, zichtbaar);
      const labels = zichtbareGetallen(start, eind, stap, zichtbaar);

      /*
        Welk streepje er gevraagd kan worden: alle behalve de twee uiteinden.

        Die blijven staan als beginpunt — daar staat Vos — en als eindpunt van
        de lijn. Alle andere streepjes komen in aanmerking, ook die waar een
        vijftal of tiental onder staat.
      */
      const kandidaten = streepjes(start, eind, stap).slice(1, -1);
      if (kandidaten.length === 0) break;

      const doel = kandidaten[Math.floor(kans() * kandidaten.length)];

      /*
        De getallen onder de lijn blijven staan zoals de instelling ze bepaalt,
        ook als het gevraagde getal er toevallig bij zit.

        Ze zijn de ankerpunten waaraan een kind zich oriënteert; haal je er
        eentje weg omdat dat net het gevraagde getal is, dan valt midden op de
        lijn een gat en klopt het beeld niet meer met wat het kind op school
        ziet. Is het gevraagde getal een vijftal of tiental, dan is de vraag
        inderdaad makkelijker — dat mag.
      */
      const vast = labels;

      const handtekening = `getallenlijn:${start}-${eind}/${stap}:${zichtbaar}:${doel}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "getallenlijn",
        variant: zichtbaar,
        getallen: [doel],
        goed: doel,
        extra: {
          start,
          eind,
          stap,
          /* De zichtbare getallen, zodat de uitleg weet waar hij mag beginnen. */
          ...Object.fromEntries(vast.map((n, i) => [`vast${i}`, n])),
          aantalVast: vast.length,
        },
      };

      uit.push({
        handtekening,
        vorm: "sleepgetallen",
        vraagtekst: bepaalVraagtekst(getallenlijnGenerator, inst, groep, gegevens),
        /* Eén "keuze": het getal dat gezocht wordt. Er is niets om uit te kiezen. */
        opties: [{ tekst: String(doel), afbeelding: null }],
        antwoord: String(doel),
        figuur: {
          soort: "getallenlijn",
          start,
          eind,
          stap,
          zichtbaar: vast,
          doel,
          vos: { wachtend: vosWachtend || null, blij: vosBlij || null },
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
