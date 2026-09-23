/**
 * De denkfouten bij de getallenlijn.
 *
 * ---------------------------------------------------------------------------
 * Waar het antwoord vandaan komt
 * ---------------------------------------------------------------------------
 * Het antwoord is het streepje waar Vos is blijven staan. Dat komt binnen als
 * `gegeven0` in `som.extra`, dezelfde afspraak als bij de trein en de
 * stapstenen; `herkenFout` slaat de controle op één los getal daardoor over en
 * de patronen hieronder lezen `extra` zelf. De oudere vorm met meerdere
 * getallen tegelijk blijft werken: dan zijn het `gegeven0`, `gegeven1` ...
 *
 * De volgorde telt: specifieke patronen eerst. Een antwoord dat precies zo ver
 * mis staat als de afstand tussen twee getallen die er wél staan, komt uit
 * tellen vanaf het verkeerde getal — dat is een andere fout dan een streepje
 * ernaast, ook al ziet het er op de lijn hetzelfde uit.
 *
 * ---------------------------------------------------------------------------
 * Eén streepje verder is niet altijd één getal verder
 * ---------------------------------------------------------------------------
 * Staat er een streepje per vijf, dan is de buurplek vijf verder. Daarom rekent
 * "eentje ernaast" met de stapgrootte uit `som.extra.stap` en niet met 1.
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { vasteGetallen } from "@/lib/generatoren/aanpak/getallenlijn";

/** Waar Vos hoort te staan: het gevraagde getal. */
function juist(som: Somgegevens): number[] {
  return som.getallen;
}

/** Bij welk streepje het kind ze heeft neergelegd. */
function gegeven(som: Somgegevens): number[] {
  return juist(som).map((_, k) => som.extra?.[`gegeven${k}`] ?? NaN);
}

/** De cijfers omgedraaid: 13 wordt 31. Alleen zinnig bij twee cijfers. */
function omgedraaid(n: number): number {
  if (n < 10 || n > 99) return -1;
  return (n % 10) * 10 + Math.floor(n / 10);
}

/** Hoeveel één streepje verder is: 1, 5 of 10. */
function stapVan(som: Somgegevens): number {
  const stap = som.extra?.stap;
  return stap && stap > 0 ? stap : 1;
}

/** Alleen kijken naar wat het kind daadwerkelijk heeft aangewezen. */
function paren(som: Somgegevens): { g: number; j: number }[] {
  const g = gegeven(som);
  return juist(som)
    .map((j, i) => ({ g: g[i], j }))
    .filter((p) => Number.isFinite(p.g));
}

/**
 * Het paar waar de uitleg over gaat, met een vangnet.
 *
 * De beheeromgeving laat de uitleg ook los draaien op een proefsom zonder dat
 * er een antwoord bij zit, om te controleren of elk patroon een uitleg heeft.
 * Dan is er niets gegeven; daar hoort de uitleg niet op te struikelen.
 */
function voorbeeld(som: Somgegevens, kies?: (p: { g: number; j: number }) => boolean) {
  const alle = paren(som);
  const gekozen = kies ? alle.find(kies) : undefined;
  const eerste = gekozen ?? alle[0];
  if (eerste) return eerste;
  const j = juist(som)[0] ?? 0;
  return { g: j, j };
}

/** Gaat het om schatten op een lege lijn? */
function isSchatten(som: Somgegevens): boolean {
  return som.extra?.schatten === 1;
}

/** Begin, eind en breedte van de lijn. */
function lijn(som: Somgegevens): { start: number; eind: number; breed: number } {
  const start = som.extra?.start ?? 0;
  const eind = som.extra?.eind ?? 100;
  return { start, eind, breed: Math.max(1, eind - start) };
}

/** Waar het kind Vos heeft neergezet, en waar hij hoorde. */
function schatting(som: Somgegevens): { gezet: number; juist: number } | null {
  const gezet = som.extra?.gegeven0;
  if (!Number.isFinite(gezet)) return null;
  return { gezet: gezet as number, juist: som.getallen[0] };
}

/** Hoeveel procent van de lijn het ernaast zit. */
function afwijking(som: Somgegevens): number | null {
  const p = schatting(som);
  if (!p) return null;
  return (Math.abs(p.gezet - p.juist) / lijn(som).breed) * 100;
}

/** Het getal op het wijzertje; alleen de tussenstand heeft er een. */
function wijzerVan(som: Somgegevens): number | null {
  const w = som.extra?.wijzer;
  return typeof w === "number" ? w : null;
}

/** De twee streepjes waar het getal tussen ligt, zoals ze horen. */
function tussenpaar(som: Somgegevens): { onder: number; boven: number } {
  return { onder: som.getallen[0], boven: som.getallen[1] };
}

/** Wat het kind in de twee vakjes heeft gezet. */
function gegevenPaar(som: Somgegevens): { links: number; rechts: number } | null {
  const links = som.extra?.gegeven0;
  const rechts = som.extra?.gegeven1;
  if (!Number.isFinite(links) || !Number.isFinite(rechts)) return null;
  return { links: links as number, rechts: rechts as number };
}

export const getallenlijnPatronen: Foutpatroon[] = [
  /*
    Eerst de vier van de schatstand.

    Die kijken naar afstanden op de lijn in plaats van naar getallen, en horen
    daarom vóór de rest: een schatting die er tien naast zit is geen telfout.
  */
  {
    id: "schat-omgekeerd",
    naam: "Precies aan de andere kant",
    herkent: (som) => {
      if (!isSchatten(som)) return false;
      const p = schatting(som);
      if (!p) return false;
      const { start, eind, breed } = lijn(som);
      const gespiegeld = start + eind - p.juist;
      /* Bij de spiegelplek, en niet gewoon toevallig goed. */
      return (
        Math.abs(p.gezet - gespiegeld) <= breed * 0.08 &&
        Math.abs(p.gezet - p.juist) > breed * 0.15
      );
    },
    kindtekst: {
      "34": "Je zat aan de verkeerde kant.",
      "56": "Je zette Vos precies aan de andere kant van het midden.",
      "78": "Je schatting ligt gespiegeld om het midden: even ver van het midden, maar de andere kant op. Kijk eerst of het getal vóór of ná de helft komt.",
    },
    hint: "Komt dit getal vóór of na de helft van de lijn?",
    uitleg: (som) => {
      const { start, eind } = lijn(som);
      const midden = Math.round((start + eind) / 2);
      const doel = som.getallen[0];
      return [
        { tekst: "In het midden ligt dit getal.", som: `${midden}` },
        {
          tekst: doel > midden ? "Jouw getal is groter." : "Jouw getal is kleiner.",
          som: `${doel}`,
        },
        {
          tekst: doel > midden ? "Dus rechts van het midden." : "Dus links van het midden.",
          som: `${midden} → ${doel}`,
        },
      ];
    },
    ouder: {
      uitleg:
        "De schatting ligt gespiegeld om het midden: bij 80 wordt het 20. Het kind voelt de afstand tot een uiteinde wel goed aan, maar telt vanaf de verkeerde kant. Vaak gebeurt dat als het van rechts naar links leest.",
      zinnen: [
        "Vraag eerst: is dit getal meer of minder dan de helft?",
        "Laat je kind met een vinger vanaf het begin van de lijn meelopen.",
      ],
      schoolwoord: "getalbegrip",
    },
  },
  {
    id: "schat-midden",
    naam: "Altijd rond het midden",
    herkent: (som) => {
      if (!isSchatten(som)) return false;
      const p = schatting(som);
      if (!p) return false;
      const { start, eind, breed } = lijn(som);
      const midden = (start + eind) / 2;
      /* Vlak bij het midden gezet, terwijl het getal daar juist ver vandaan ligt. */
      return (
        Math.abs(p.gezet - midden) <= breed * 0.08 &&
        Math.abs(p.juist - midden) > breed * 0.2 &&
        Math.abs(p.gezet - p.juist) > breed * 0.1
      );
    },
    kindtekst: {
      "34": "Niet elk getal ligt in het midden.",
      "56": "Je zette Vos in het midden. Kijk eerst of je getal veel kleiner of veel groter is dan de helft.",
      "78": "Je zet Vos rond het midden terwijl dit getal daar ver vandaan ligt. Gebruik het midden als ankerpunt, niet als antwoord: is je getal de helft, een kwart, of bijna het eind?",
    },
    hint: "Het midden is een hulpje, geen antwoord. Waar ligt jouw getal ten opzichte daarvan?",
    uitleg: (som) => {
      const { start, eind } = lijn(som);
      const midden = Math.round((start + eind) / 2);
      const doel = som.getallen[0];
      const deel = (doel - start) / Math.max(1, eind - start);
      return [
        { tekst: "Het midden van de lijn.", som: `${midden}` },
        {
          tekst:
            deel < 0.4 ? "Jouw getal ligt in het eerste deel." : deel > 0.6 ? "Jouw getal ligt in het laatste deel." : "Jouw getal ligt rond de helft.",
          som: `${doel}`,
        },
        { tekst: "Daar hoort Vos te staan.", som: `${start} … ${doel} … ${eind}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind zet de schatting steeds in het midden, ongeacht het getal. Dat is de veiligste gok als je nog geen gevoel hebt voor de verdeling van de lijn: je zit nooit héél ver mis. Het midden is wel het goede ankerpunt om vanaf te redeneren.",
      zinnen: [
        "Vraag eerst: is dit getal groter of kleiner dan de helft?",
        "Verdeel de lijn samen hardop: hier de helft, hier een kwart.",
      ],
      schoolwoord: "schatten met ankerpunten",
    },
  },
  {
    id: "schat-tiental",
    naam: "Net in het verkeerde tiental",
    herkent: (som) => {
      if (!isSchatten(som)) return false;
      const p = schatting(som);
      const mis = afwijking(som);
      if (!p || mis === null) return false;
      const marge = ((som.extra?.marge ?? 0) / lijn(som).breed) * 100;
      /* Ernaast, maar niet ver: het zit in een buurtiental. */
      return (
        mis > marge &&
        mis <= 15 &&
        Math.abs(Math.floor(p.gezet / 10) - Math.floor(p.juist / 10)) >= 1
      );
    },
    kindtekst: {
      "34": "Bijna! Net het verkeerde tiental.",
      "56": "Je zit dichtbij, maar net in het verkeerde tiental.",
      "78": "Je schatting zit er maar een klein stukje naast, maar valt net in een ander tiental. Deel de lijn in tienen en kijk in welk vak je getal hoort.",
    },
    hint: "Verdeel de lijn in tien stukjes. In het hoeveelste stukje hoort je getal?",
    uitleg: (som) => {
      const doel = som.getallen[0];
      const tien = Math.floor(doel / 10) * 10;
      return [
        { tekst: "Zoek eerst het tiental.", som: `${tien}` },
        { tekst: "Jouw getal ligt net daarna.", som: `${tien} → ${doel}` },
        { tekst: "Daar hoort Vos te staan.", som: `${doel}` },
      ];
    },
    ouder: {
      uitleg:
        "De schatting is bijna goed en valt net over de grens van een tiental. Het gevoel voor de lijn zit er dus al in; wat nog scheelt is het fijner verdelen — eerst in tienen, dan binnen dat stukje.",
      zinnen: [
        "Wijs samen aan waar het tiental ligt en tel van daaraf verder.",
        "Vraag: ligt 74 vóór of na de 70?",
      ],
      schoolwoord: "verfijnen",
    },
  },
  {
    id: "schat-te-links",
    naam: "Te ver naar links",
    herkent: (som) => {
      if (!isSchatten(som)) return false;
      const p = schatting(som);
      const mis = afwijking(som);
      if (!p || mis === null) return false;
      const marge = ((som.extra?.marge ?? 0) / lijn(som).breed) * 100;
      return mis > marge && p.gezet < p.juist;
    },
    kindtekst: {
      "34": "Nog een stukje naar rechts.",
      "56": "Je zette Vos te ver naar links: het getal ligt verder op de lijn.",
      "78": "Je schatting ligt links van de goede plek. Neem het midden als ankerpunt en kijk hoeveel verder je getal daarna nog komt.",
    },
    hint: "Kijk waar de helft ligt; jouw getal ligt verder naar rechts dan je dacht.",
    uitleg: (som) => {
      const { start, eind } = lijn(som);
      const midden = Math.round((start + eind) / 2);
      const doel = som.getallen[0];
      return [
        { tekst: "Het midden van de lijn.", som: `${midden}` },
        { tekst: "Jouw getal.", som: `${doel}` },
        { tekst: "Dat ligt verder naar rechts.", som: `${doel}` },
      ];
    },
    ouder: {
      uitleg:
        "De schattingen blijven links van de goede plek hangen. Dat komt vaak doordat een kind vanaf het begin van de lijn stapjes telt en te vroeg stopt; het schat de afstand tot het begin wel, maar onderschat hoe lang de lijn is.",
      zinnen: [
        "Laat je kind eerst het midden aanwijzen, en dan pas het getal.",
        "Vraag: is je getal meer of minder dan de helft? Hoeveel meer?",
      ],
      schoolwoord: "schatten met ankerpunten",
    },
  },
  {
    id: "schat-te-rechts",
    naam: "Te ver naar rechts",
    herkent: (som) => {
      if (!isSchatten(som)) return false;
      const p = schatting(som);
      const mis = afwijking(som);
      if (!p || mis === null) return false;
      const marge = ((som.extra?.marge ?? 0) / lijn(som).breed) * 100;
      return mis > marge && p.gezet > p.juist;
    },
    kindtekst: {
      "34": "Nog een stukje naar links.",
      "56": "Je zette Vos te ver naar rechts: het getal ligt dichter bij het begin.",
      "78": "Je schatting ligt rechts van de goede plek. Neem het midden als ankerpunt en kijk hoe ver je getal daarvóór al komt.",
    },
    hint: "Kijk waar de helft ligt; jouw getal ligt dichter bij het begin dan je dacht.",
    uitleg: (som) => {
      const { start, eind } = lijn(som);
      const midden = Math.round((start + eind) / 2);
      const doel = som.getallen[0];
      return [
        { tekst: "Het midden van de lijn.", som: `${midden}` },
        { tekst: "Jouw getal.", som: `${doel}` },
        { tekst: "Dat ligt meer naar links.", som: `${doel}` },
      ];
    },
    ouder: {
      uitleg:
        "De schattingen komen steeds rechts van de goede plek uit. Meestal wordt de lijn dan te kort ingeschat: het kind verdeelt de eerste helft te ruim, waardoor alles opschuift.",
      zinnen: [
        "Laat je kind eerst het midden aanwijzen, en dan pas het getal.",
        "Vraag: past jouw getal echt voorbij de helft?",
      ],
      schoolwoord: "schatten met ankerpunten",
    },
  },
  /*
    Eerst de vier van de tussenstand.

    Ze staan vooraan omdat de patronen daaronder over het tellen op de lijn
    gaan: "vanaf het verkeerde getal geteld" zou bij een paar tientallen dat
    allebei even ver mis staat ook aanslaan, maar dat is hier een ander soort
    fout en hoort een andere uitleg te krijgen.
  */
  {
    id: "getal-zelf-teruggegeven",
    naam: "Het getal zelf ingevuld",
    herkent: (som) => {
      const w = wijzerVan(som);
      const p = gegevenPaar(som);
      if (w === null || !p) return false;
      const { onder, boven } = tussenpaar(som);
      if (p.links === onder && p.rechts === boven) return false;
      return p.links === w || p.rechts === w;
    },
    kindtekst: {
      "34": "Dat getal zoeken we juist.",
      "56": "Je hebt het getal zelf ingevuld. In de vakjes horen de twee getallen waar het tussen ligt.",
      "78": "Je vult het gevraagde getal zelf in. De vakjes staan op de streepjes ernaast: daar horen de twee getallen waar dit getal tussenin valt.",
    },
    hint: "In de vakjes horen de getallen van de streepjes links en rechts.",
    uitleg: (som) => {
      const { onder, boven } = tussenpaar(som);
      const w = wijzerVan(som) ?? onder;
      return [
        { tekst: "Dit getal staat op het wijzertje.", som: `${w}` },
        { tekst: "Links ervan staat dit streepje.", som: `${onder}` },
        { tekst: "En rechts ervan dit.", som: `${boven}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind schrijft het gevraagde getal over in plaats van de twee getallen eromheen. De vraag is nog niet binnengekomen: het gaat niet om dít getal, maar om de twee ronde getallen waar het tussenin ligt.",
      zinnen: [
        "Wijs het wijzertje aan en zeg: dit getal weten we al.",
        "Wijs daarna de twee streepjes links en rechts aan: welke getallen horen daar?",
      ],
      schoolwoord: "positioneren",
    },
  },
  {
    id: "paar-omgedraaid",
    naam: "De twee getallen omgedraaid",
    herkent: (som) => {
      const p = gegevenPaar(som);
      if (!p || wijzerVan(som) === null) return false;
      const { onder, boven } = tussenpaar(som);
      return p.links === boven && p.rechts === onder;
    },
    kindtekst: {
      "34": "Ze staan omgewisseld.",
      "56": "De twee getallen staan omgewisseld: het kleinste hoort links.",
      "78": "Je hebt het paar omgedraaid. Op een getallenlijn loopt het van klein naar groot, dus links staat altijd het kleinste getal.",
    },
    hint: "Links staat het kleinste getal, rechts het grootste.",
    uitleg: (som) => {
      const { onder, boven } = tussenpaar(som);
      return [
        { tekst: "Een getallenlijn loopt van klein naar groot.", som: `${onder} → ${boven}` },
        { tekst: "Links hoort het kleinste.", som: `${onder}` },
        { tekst: "Rechts het grootste.", som: `${boven}` },
      ];
    },
    ouder: {
      uitleg:
        "De twee getallen kloppen, maar staan omgewisseld. Het rekenwerk is dus goed; wat nog niet vastzit is dat een getallenlijn altijd van links naar rechts oploopt.",
      zinnen: [
        "Laat je kind de lijn hardop aflezen van links naar rechts.",
        "Vraag: welk getal kom je het eerst tegen, de 20 of de 30?",
      ],
      schoolwoord: "ordenen",
    },
  },
  {
    id: "eerst-afgerond",
    naam: "Eerst afgerond en toen gekeken",
    herkent: (som) => {
      const w = wijzerVan(som);
      const p = gegevenPaar(som);
      if (w === null || !p) return false;
      const { onder, boven } = tussenpaar(som);
      const sprong = boven - onder;
      /* Het getal ligt in de bovenste helft, en het kind is bij het afgeronde getal begonnen. */
      return w - onder > sprong / 2 && p.links === boven && p.rechts === boven + sprong;
    },
    kindtekst: {
      "34": "Niet afronden. Kijk waar het staat.",
      "56": "Je hebt het getal eerst afgerond en toen gekeken. Kijk op de lijn zelf waar het ligt.",
      "78": "Je rondt het getal eerst af naar boven en neemt dat als het getal links. Maar het ligt nog vóór dat ronde getal, dus het hoort aan de andere kant ervan.",
    },
    hint: "Ligt het getal vóór of ná dat ronde getal? Kijk op de lijn.",
    uitleg: (som) => {
      const { onder, boven } = tussenpaar(som);
      const w = wijzerVan(som) ?? onder;
      return [
        { tekst: "Zoek het wijzertje op de lijn.", som: `${w}` },
        { tekst: `Het staat nog vóór ${boven}.`, som: `${onder} → ${w} → ${boven}` },
        { tekst: "Dus daar ligt het tussenin.", som: `${onder} en ${boven}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind rondt het getal eerst af en gaat daarna pas kijken. Bij 28 wordt dat 30, en dan lijkt 30 tot 40 het goede vak. Afronden is een andere vaardigheid dan positioneren; die twee lopen hier door elkaar.",
      zinnen: [
        "Laat het getal eerst aanwijzen op de lijn, vóórdat er iets wordt opgeschreven.",
        "Vraag: staat het streepje van 28 vóór of na de 30?",
      ],
      schoolwoord: "positioneren",
    },
  },
  {
    id: "tiental-ernaast",
    naam: "Het paar ernaast",
    herkent: (som) => {
      const p = gegevenPaar(som);
      if (!p || wijzerVan(som) === null) return false;
      const { onder, boven } = tussenpaar(som);
      const sprong = boven - onder;
      const verschuiving = p.links - onder;
      if (verschuiving === 0) return false;
      return Math.abs(verschuiving) === sprong && p.rechts - boven === verschuiving;
    },
    kindtekst: {
      "34": "Eentje opschuiven.",
      "56": "Je zit één vak ernaast. Kijk nog eens waar het wijzertje staat.",
      "78": "Het paar klopt van vorm, maar ligt één sprong ernaast. Zoek eerst het streepje links van het wijzertje.",
    },
    hint: "Kijk welk streepje er vlak links van het wijzertje staat.",
    uitleg: (som) => {
      const { onder, boven } = tussenpaar(som);
      const w = wijzerVan(som) ?? onder;
      return [
        { tekst: "Zet je vinger op het wijzertje.", som: `${w}` },
        { tekst: "Het eerste streepje links.", som: `${onder}` },
        { tekst: "Het eerste streepje rechts.", som: `${boven}` },
      ];
    },
    ouder: {
      uitleg:
        "De twee getallen liggen precies één sprong naast het goede paar. Het idee klopt — het kind zoekt twee ronde getallen om het getal heen — maar het telt één vak te ver of te weinig.",
      zinnen: [
        "Laat je kind het getal eerst aanwijzen en dan pas de twee streepjes ernaast.",
        "Vraag bij het antwoord: ligt 21 echt tussen die twee?",
      ],
      schoolwoord: "positioneren",
    },
  },
  {
    id: "cijfers-omgedraaid",
    naam: "De cijfers omgedraaid",
    herkent: (som) => {
      const p = paren(som);
      return p.length > 0 && p.some((x) => x.g !== x.j && x.g === omgedraaid(x.j));
    },
    kindtekst: {
      "34": "Kijk goed: 13 is niet 31.",
      "56": "Je hebt de cijfers omgedraaid. 13 en 31 lijken op elkaar, maar hangen ver uit elkaar.",
      "78": "De cijfers staan omgekeerd: je leest 31 waar 13 staat. Lees het getal hardop voordat je het ophangt — dertien begint met een tien.",
    },
    hint: "Lees het getal hardop. Hoeveel tientallen zijn het?",
    uitleg: (som) => {
      const fout = voorbeeld(som, (x) => x.g === omgedraaid(x.j));
      const tien = Math.floor(fout.j / 10) * 10;
      return [
        { tekst: "Lees het getal hardop.", som: `${fout.j}` },
        { tekst: "Hoeveel tientallen zitten erin?", som: `${tien}` },
        { tekst: "Zoek dat tiental en tel van daar verder.", som: `${tien} → ${fout.j}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind leest 31 waar 13 staat. Bij tweecijferige getallen botst de uitspraak met de schrijfwijze: in „dertien” hoor je de drie eerst, terwijl de 1 vooraan staat. Dat is de bekendste struikelsteen tot twintig.",
      zinnen: [
        "Lees het getal samen hardop en vraag: hoeveel tientallen zijn dat?",
        "Leg 13 en 31 naast elkaar op de getallenlijn; het verschil is meteen te zien.",
      ],
      schoolwoord: "omkering",
    },
  },
  {
    id: "verkeerd-ankerpunt",
    naam: "Vanaf het verkeerde getal geteld",
    herkent: (som) => {
      const p = paren(som);
      if (p.length === 0) return false;

      if (p.length >= 2) {
        /* Meerdere getallen: staan ze állemaal even ver mis, dan is dit het. */
        const verschuiving = p[0].g - p[0].j;
        if (verschuiving === 0) return false;
        return p.every((x) => x.g - x.j === verschuiving);
      }

      /*
        Eén getal, zoals bij "Breng Vos naar het goede getal".

        Dan kun je niet zien of alles even ver mis staat. Wél of de afstand
        precies de sprong is tussen twee getallen die onder de lijn staan: wie
        de 13 zoekt en bij de 15 begint te tellen in plaats van bij de 10, komt
        vijf te ver uit. Een streepje ernaast telt niet mee; dat is het patroon
        hieronder.
      */
      const verschil = Math.abs(p[0].g - p[0].j);
      if (verschil === 0 || verschil === stapVan(som)) return false;
      const vast = vasteGetallen(som);
      return vast.some((a) => vast.some((b) => a !== b && Math.abs(a - b) === verschil));
    },
    kindtekst: {
      "34": "Je begon bij het verkeerde getal.",
      "56": "Je bent vanaf het verkeerde getal gaan tellen; daardoor sta je er precies één sprong naast.",
      "78": "Je telling zelf klopt, maar je startte bij het verkeerde streepje: je zit er precies de afstand tussen twee getallen naast. Zoek eerst het dichtstbijzijnde getal dat er wél staat.",
    },
    hint: "Zoek eerst een streepje waar een getal onder staat. Tel van daaraf.",
    uitleg: (som) => {
      const eerste = voorbeeld(som);
      const verschuiving = eerste.g - eerste.j;
      return [
        { tekst: "Zoek een streepje met een getal eronder.", som: "" },
        {
          tekst: "Tel van daaraf verder, streepje voor streepje.",
          som: `${eerste.j}`,
        },
        {
          tekst: `Je begon ${Math.abs(verschuiving)} te ${verschuiving > 0 ? "ver" : "vroeg"}.`,
          som: `${eerste.g} → ${eerste.j}`,
        },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord staat precies de afstand tussen twee zichtbare getallen naast de juiste plek. Het tellen gaat goed; het beginpunt niet. Vaak wordt het streepje waar het getal onder staat zelf al als eerste stap meegeteld, of wordt er vanaf het verkeerde vijftal geteld.",
      zinnen: [
        "Wijs samen het getal aan dat er staat en zeg: dit is de nul-stap.",
        "Tel daarna hardop verder: dat streepje is al geteld, het volgende is één erbij.",
      ],
      schoolwoord: "ankerpunt",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén streepje ernaast",
    herkent: (som) => {
      const p = paren(som);
      const stap = stapVan(som);
      return p.length > 0 && p.some((x) => Math.abs(x.g - x.j) === stap);
    },
    kindtekst: {
      "34": "Bijna! Eentje opschuiven.",
      "56": "Je zit er één streepje naast. Tel nog eens rustig na vanaf het getal dat er staat.",
      "78": "Eén streepje ernaast: bij het doortellen is er één stap te veel of te weinig gemaakt. Tik elk streepje aan terwijl je telt.",
    },
    hint: "Tik elk streepje aan terwijl je telt, dan sla je er geen over.",
    uitleg: (som) => {
      const fout = voorbeeld(som, (x) => Math.abs(x.g - x.j) === stapVan(som));
      return [
        { tekst: "Begin bij het getal dat er staat.", som: "" },
        { tekst: "Tik elk streepje aan terwijl je telt.", som: `${fout.j}` },
        { tekst: "Het getal hoort één streepje verder.", som: `${fout.g} → ${fout.j}` },
      ];
    },
    ouder: {
      uitleg:
        "Eén plek ernaast. Het aanwijzen loopt uit de pas met het hardop tellen — dezelfde misser als bij het tellen van plaatjes, maar dan op de getallenlijn.",
      zinnen: [
        "Laat je kind elk streepje aanraken op het moment dat het het getal zegt.",
        "Vraag na afloop: welk getal zei je het laatst? Daar hoort Vos te staan.",
      ],
      schoolwoord: "één-op-één-koppeling",
    },
  },
  {
    id: "ankerpunt-overgenomen",
    naam: "Het getal van het ankerpunt overgenomen",
    herkent: (som) => {
      const p = paren(som);
      if (p.length === 0) return false;
      const vast = vasteGetallen(som);
      /* Het gegeven getal staat zelf onder de lijn, maar is niet het gevraagde. */
      return p.some((x) => x.g !== x.j && vast.includes(x.g));
    },
    kindtekst: {
      "34": "Dat getal staat er al. Tel verder.",
      "56": "Je hebt het getal overgenomen dat er al stond. Van daaraf moet je nog verder tellen.",
      "78": "Je noemt het dichtstbijzijnde getal dat onder de lijn staat, maar het gevraagde streepje ligt verderop. Tel vanaf dat getal door tot je bij het streepje bent.",
    },
    hint: "Dat getal staat er al onder. Tel van daaraf verder tot je bij het streepje bent.",
    uitleg: (som) => {
      const fout = voorbeeld(som, (x) => x.g !== x.j && vasteGetallen(som).includes(x.g));
      const stappen = Math.abs(fout.j - fout.g) / stapVan(som);
      return [
        { tekst: "Dit getal staat er al onder.", som: `${fout.g}` },
        {
          tekst: `Tel van daaraf ${stappen} ${stappen === 1 ? "streepje" : "streepjes"} verder.`,
          som: `${fout.g} → ${fout.j}`,
        },
        { tekst: "Dat hoort in het vakje.", som: `${fout.j}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind leest het dichtstbijzijnde getal dat onder de lijn staat en schrijft dat op. De oriëntatie klopt dus — het zoekt het goede houvast — maar de laatste stap, doortellen tot het gevraagde streepje, wordt overgeslagen.",
      zinnen: [
        "Wijs samen het getal aan dat er staat en vraag: staat het vakje daar, of verderop?",
        "Tel daarna hardop de streepjes tot het vakje: elf, twaalf, dertien.",
      ],
      schoolwoord: "doortellen vanaf een ankerpunt",
    },
  },
  {
    id: "goed-tiental",
    naam: "Goede tiental, verkeerde plek",
    herkent: (som) => {
      const p = paren(som);
      return (
        p.length > 0 &&
        p.some(
          (x) => x.g !== x.j && Math.floor(x.g / 10) === Math.floor(x.j / 10),
        )
      );
    },
    kindtekst: {
      "34": "Goed tiental, verkeerde plek.",
      "56": "Je zit in het goede tiental, maar op de verkeerde plek daarbinnen.",
      "78": "Het tiental klopt; de eenheden niet. Tel binnen dat tiental na hoeveel stappen je verder moet.",
    },
    hint: "Je bent in het goede tiental. Tel daarbinnen verder.",
    uitleg: (som) => {
      const fout = voorbeeld(
        som,
        (x) => x.g !== x.j && Math.floor(x.g / 10) === Math.floor(x.j / 10),
      );
      const tien = Math.floor(fout.j / 10) * 10;
      return [
        { tekst: "Het tiental klopt al.", som: `${tien}` },
        { tekst: "Tel vanaf daar de eenheden.", som: `${tien} → ${fout.j}` },
        { tekst: "Daar hoort Vos te staan.", som: `${fout.j}` },
      ];
    },
    ouder: {
      uitleg:
        "Het kind zit in het juiste tiental maar op het verkeerde streepje. Het grove plaatsen lukt al — dat is precies wat een getallenlijn moet opleveren — en de fijne stap erbinnen nog niet.",
      zinnen: [
        "Prijs eerst dat het tiental klopt; dat is het moeilijkste deel.",
        "Tel samen vanaf het tiental: eenentwintig, tweeëntwintig, drieëntwintig.",
      ],
      schoolwoord: "positiebepaling",
    },
  },
];
