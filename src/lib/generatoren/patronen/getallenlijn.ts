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

export const getallenlijnPatronen: Foutpatroon[] = [
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
