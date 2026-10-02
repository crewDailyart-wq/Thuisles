/**
 * Foutpatronen bij de keersommen en de deelsommen.
 *
 * De keersommen gebruiken de patronen die er al waren (`tafelsPatronen`): de
 * denkfouten bij 3 × 5 zijn dezelfde, of de som nu kaal is, bij een raster
 * staat of uit een kraampje komt. Ze staan hier alleen opnieuw onder een naam
 * die bij dit domein past, zodat een nieuw type niet hoeft te weten dat ze
 * "tafels" heten.
 *
 * De deelsommen krijgen hun eigen set. Delen gaat de andere kant op, en de
 * fouten zijn dus ook andere: keer doen in plaats van delen, het getal waardoor
 * je deelt als antwoord opschrijven, of één tafelstap mis zitten.
 *
 * De somgegevens zijn bij allebei gelijk opgebouwd: `extra.tafel` is het getal
 * van de tafel, `extra.mee` hoe vaak, en `extra.product` wat er samen uitkomt.
 * Bij een keersom is `goed` het product, bij een deelsom is `goed` de `mee`.
 * `getallen` bevat dezelfde twee getallen in de volgorde waarin ze op het
 * scherm staan, zodat een patroon ook zonder `extra` iets kan zeggen.
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";
import { tafelsPatronen } from "@/lib/generatoren/patronen/tafels";

export const keerPatronen: Foutpatroon[] = tafelsPatronen;

/** De drie getallen van een deelsom, ongeacht hoe de vraag eruitzag. */
function stukken(som: { getallen: number[]; goed: number; extra?: Record<string, number> }) {
  const deler = som.extra?.tafel ?? som.getallen[1] ?? 1;
  const product = som.extra?.product ?? som.getallen[0] ?? 0;
  const mee = som.extra?.mee ?? som.goed;
  return { deler, product, mee };
}

/** De tafel doortellen, ingekort als hij lang wordt: 7, 14, 21 … 63 */
function rij(stap: number, aantal: number): string {
  const getallen = Array.from(
    { length: Math.min(Math.max(aantal, 1), 15) },
    (_, i) => stap * (i + 1),
  );
  return getallen.length > 4
    ? `${getallen.slice(0, 3).join(", ")} … ${getallen[getallen.length - 1]}`
    : getallen.join(", ");
}

/*
  Van specifiek naar algemeen; het eerste passende patroon wordt getoond. Wie op
  20 : 5 antwoordt met 100 heeft keer gedaan, en dat is iets heel anders dan er
  een stapje naast zitten — dus dat patroon staat vooraan.
*/
export const deelPatronen: Foutpatroon[] = [
  {
    id: "keer-in-plaats-van-delen",
    naam: "Keer gedaan in plaats van delen",
    herkent: (som, gegeven) => {
      const { deler, product } = stukken(som);
      return gegeven === deler * product && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Je hebt keer gedaan. Hier moet je delen.",
      "56": "Het lijkt erop dat je hebt vermenigvuldigd. Bij een deelsom wordt het antwoord juist kleiner.",
      "78": "Je hebt de twee getallen met elkaar vermenigvuldigd. Bij delen zoek je hoe vaak het ene getal in het andere past, dus het antwoord is kleiner dan het getal waar je mee begint.",
    },
    hint: "Bij delen wordt het antwoord kleiner, niet groter.",
    uitleg: (som) => {
      const { deler, product, mee } = stukken(som);
      return [
        { tekst: "Dit is de som.", som: `${product} : ${deler}` },
        { tekst: `Hoe vaak past ${deler} in ${product}?`, som: rij(deler, mee) },
        { tekst: "Zoveel keer:", som: String(mee) },
      ];
    },
    ouder: {
      uitleg:
        "De getallen zijn met elkaar vermenigvuldigd in plaats van gedeeld. Het deelteken is waarschijnlijk niet gezien.",
      zinnen: [
        "Vraag eerst: wordt het antwoord meer of minder dan waar we mee begonnen?",
        "Leg het getal met blokjes neer en verdeel ze samen in groepjes.",
      ],
      schoolwoord: "delen",
    },
  },
  {
    id: "deler-als-antwoord",
    naam: "Het getal waardoor je deelt opgeschreven",
    herkent: (som, gegeven) => {
      const { deler } = stukken(som);
      return gegeven === deler && deler !== som.goed;
    },
    kindtekst: {
      "34": "Dat getal stond al in de som.",
      "56": "Je hebt het getal opgeschreven waardoor je deelt. Gevraagd is hoe váák dat getal erin past.",
      "78": "Het getal waardoor je deelt is als antwoord ingevuld. De vraag is hoe vaak dat getal in het eerste getal past.",
    },
    hint: "Hoe vaak past het tweede getal in het eerste?",
    uitleg: (som) => {
      const { deler, product, mee } = stukken(som);
      return [
        { tekst: `Je zoekt hoe vaak ${deler} in ${product} past.`, som: `${product} : ${deler}` },
        { tekst: "Tel de tafel door:", som: rij(deler, mee) },
        { tekst: "Dat zijn zoveel stappen:", som: String(mee) },
      ];
    },
    ouder: {
      uitleg:
        "Het getal waardoor gedeeld wordt is als antwoord opgeschreven, in plaats van hoe vaak dat getal erin past.",
      zinnen: [
        "Leg samen groepjes van dat getal en tel hoeveel groepjes het zijn.",
        "Zeg erbij: hoe vaak past dit erin?",
      ],
      schoolwoord: "delen",
    },
  },
  {
    id: "afgetrokken",
    naam: "Afgetrokken in plaats van gedeeld",
    herkent: (som, gegeven) => {
      const { deler, product } = stukken(som);
      return gegeven === product - deler && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Je hebt eraf gehaald. Hier moet je delen.",
      "56": "Het lijkt erop dat je het tweede getal eraf hebt gehaald in plaats van gedeeld.",
      "78": "Je hebt afgetrokken in plaats van gedeeld. Bij delen haal je het getal er niet één keer af, maar zoek je hoe vaak het erin past.",
    },
    hint: "Niet één keer eraf: hoe vaak past het erin?",
    uitleg: (som) => {
      const { deler, product, mee } = stukken(som);
      return [
        { tekst: `${deler} past er zo vaak in:`, som: rij(deler, mee) },
        { tekst: "Dat zijn zoveel keer:", som: `${product} : ${deler} = ${mee}` },
      ];
    },
    ouder: {
      uitleg: "Er is afgetrokken in plaats van gedeeld.",
      zinnen: [
        "Hoe vaak kunnen we dit getal eraf halen tot er niets meer over is?",
        "Leg het samen in groepjes neer en tel de groepjes.",
      ],
      schoolwoord: "delen",
    },
  },
  {
    id: "stap-ernaast",
    naam: "Eén stap ernaast",
    herkent: (som, gegeven) =>
      Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens.",
      "56": "Je zit er één stap naast. Tel de tafel nog eens rustig door en houd de stappen bij.",
      "78": "Je antwoord ligt één stap naast het goede antwoord. Waarschijnlijk is er bij het doortellen één stap te veel of te weinig meegeteld.",
    },
    hint: "Zeg de tafel hardop op en tel de stappen mee.",
    uitleg: (som) => {
      const { deler, product, mee } = stukken(som);
      return [
        { tekst: `Zo loopt de tafel van ${deler}:`, som: rij(deler, mee) },
        { tekst: "Tel de stappen.", som: String(mee) },
        { tekst: "Dus:", som: `${product} : ${deler} = ${mee}` },
      ];
    },
    ouder: {
      uitleg: "Het antwoord zit er één stap naast — meestal door bij het doortellen één stap te missen.",
      zinnen: [
        "Zullen we de tafel samen hardop opzeggen?",
        "Bij welke stap zijn we nu? Tel maar mee op je vingers.",
      ],
      schoolwoord: "tafel",
    },
  },
];

/**
 * Foutpatronen bij het tellen van een raster of een groep plaatjes.
 *
 * Hier gaat het nog niet om de tafel kennen maar om zien dat rijen van
 * hetzelfde aantal bij elkaar opgeteld een keersom zijn. De fouten zijn dus
 * teelfouten: alleen de rijen geteld, alleen de kolommen, of er eentje naast.
 */
export const rasterPatronen: Foutpatroon[] = [
  {
    id: "alleen-de-rijen",
    naam: "Alleen de rijen of de kolommen geteld",
    herkent: (som, gegeven) => {
      const [rijen, kolommen] = som.getallen;
      return (gegeven === rijen || gegeven === kolommen) && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Je hebt de rijen geteld, niet alles.",
      "56": "Je hebt het aantal rijen of kolommen opgeschreven. Gevraagd is hoeveel het er samen zijn.",
      "78": "Je hebt één richting geteld: het aantal rijen of het aantal in een rij. Het antwoord is die twee met elkaar vermenigvuldigd.",
    },
    hint: "Hoeveel staan er in één rij? En hoeveel rijen zijn er?",
    uitleg: (som) => {
      const [rijen, kolommen] = som.getallen;
      return [
        { tekst: `Er zijn ${rijen} rijen van ${kolommen}.`, som: `${rijen} × ${kolommen}` },
        { tekst: "Samen is dat:", som: String(rijen * kolommen) },
      ];
    },
    ouder: {
      uitleg: "Alleen het aantal rijen of het aantal per rij is geteld, niet alles bij elkaar.",
      zinnen: [
        "Hoeveel staan er in één rij? En hoeveel rijen zijn het?",
        "Wijs samen elke rij aan en tel met sprongen mee.",
      ],
      schoolwoord: "keersom",
    },
  },
  {
    id: "rijen-opgeteld",
    naam: "De rijen en de kolommen opgeteld",
    herkent: (som, gegeven) => {
      const [rijen, kolommen] = som.getallen;
      return gegeven === rijen + kolommen && gegeven !== som.goed;
    },
    kindtekst: {
      "34": "Je hebt opgeteld. Hier moet je keer doen.",
      "56": "Het lijkt erop dat je de rijen en de kolommen hebt opgeteld in plaats van vermenigvuldigd.",
      "78": "Je hebt het aantal rijen en het aantal per rij opgeteld. Bij een raster hoort een keersom: elke rij telt helemaal mee.",
    },
    hint: "Elke rij telt helemaal mee, niet één keer.",
    uitleg: (som) => {
      const [rijen, kolommen] = som.getallen;
      const reeks = Array.from({ length: Math.min(rijen, 8) }, () => kolommen).join(" + ");
      return [
        { tekst: `${rijen} rijen van ${kolommen}:`, som: reeks + (rijen > 8 ? " + …" : "") },
        { tekst: "Samen is dat:", som: String(rijen * kolommen) },
      ];
    },
    ouder: {
      uitleg: "De rijen en het aantal per rij zijn opgeteld in plaats van vermenigvuldigd.",
      zinnen: [
        "Tel samen met sprongen mee: drie, zes, negen …",
        "Hoeveel liggen er in één rij? En zoveel rijen zijn er.",
      ],
      schoolwoord: "vermenigvuldigen",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén te veel of te weinig geteld",
    herkent: (som, gegeven) =>
      Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens.",
      "56": "Je zit er één naast. Dat gebeurt makkelijk bij los tellen; tel liever rij voor rij.",
      "78": "Je antwoord zit er één naast. Dat komt meestal van los tellen; met sprongen per rij gaat het sneller en zekerder.",
    },
    hint: "Tel per rij, met sprongen.",
    uitleg: (som) => {
      const [rijen, kolommen] = som.getallen;
      const sprongen = Array.from({ length: Math.min(rijen, 6) }, (_, i) => kolommen * (i + 1));
      return [
        { tekst: "Tel per rij met sprongen:", som: sprongen.join(", ") + (rijen > 6 ? ", …" : "") },
        { tekst: "Je komt uit op:", som: String(rijen * kolommen) },
      ];
    },
    ouder: {
      uitleg: "Er is één te veel of te weinig geteld, meestal door elk plaatje los te tellen.",
      zinnen: [
        "Tel samen met sprongen mee, rij voor rij.",
        "Leg je vinger op de rij waar je bent.",
      ],
      schoolwoord: "tellen met sprongen",
    },
  },
];
