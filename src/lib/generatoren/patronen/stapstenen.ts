/**
 * De denkfouten bij een telrij op stapstenen.
 *
 * ---------------------------------------------------------------------------
 * Meerdere antwoorden tegelijk
 * ---------------------------------------------------------------------------
 * Er kunnen meerdere stenen leeg zijn, dus is er niet één gegeven getal maar
 * een rijtje. Die staan in `som.extra` als `gegeven0`, `gegeven1` ... — net als
 * bij "Tellen en slepen". `herkenFout` slaat de controle op één getal daardoor
 * over, en de patronen hieronder lezen `extra` zelf.
 *
 * De volgorde telt: specifieke patronen eerst. "Alles goed maar verwisseld" is
 * bijvoorbeeld specifieker dan "ergens over het tiental gestruikeld".
 */

import type { Foutpatroon, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** De hele rij zoals hij op de stenen ligt. */
function rij(som: Somgegevens): number[] {
  return som.getallen;
}

/** Welke stenen leeg waren, op volgorde. */
function legePlekken(som: Somgegevens): number[] {
  const hoeveel = som.extra?.aantalLeeg ?? 0;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`leeg${k}`] ?? -1).filter(
    (p) => p >= 0,
  );
}

/** Wat het kind heeft ingevuld, op volgorde. */
function gegeven(som: Somgegevens): number[] {
  const hoeveel = legePlekken(som).length;
  return Array.from({ length: hoeveel }, (_, k) => som.extra?.[`gegeven${k}`] ?? NaN);
}

/** De goede antwoorden, op volgorde. */
function juist(som: Somgegevens): number[] {
  const r = rij(som);
  return legePlekken(som).map((p) => r[p]);
}

const sprongVan = (som: Somgegevens) => som.extra?.sprong ?? 1;

/** Twee rijtjes vergelijken, zonder gedoe met NaN. */
function zelfde(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

/** De rij zoals hij eruit zou zien met deze sprong en richting. */
function rijMet(som: Somgegevens, sprong: number, omgekeerd: boolean): number[] {
  const r = rij(som);
  const terug = som.variant === "terug";
  const heenTerug = omgekeerd ? !terug : terug;
  /* Vanaf het eerste getal opnieuw opbouwen; dat getal stond er altijd. */
  return r.map((_, i) => r[0] + (heenTerug ? -1 : 1) * sprong * i);
}

export const stapstenenPatronen: Foutpatroon[] = [
  {
    id: "sprong-een",
    naam: "Met sprongen van 1 geteld",
    herkent: (som) => {
      const sprong = sprongVan(som);
      if (sprong === 1) return false;
      const alsEen = rijMet(som, 1, false);
      return zelfde(
        gegeven(som),
        legePlekken(som).map((p) => alsEen[p]),
      );
    },
    /*
      Zonder het getal erin: een kindtekst is een vaste zin per patroon, er
      wordt niets in vervangen. "{sprong}" zou er letterlijk komen te staan.
    */
    kindtekst: {
      "34": "Je telde met 1. De sprong is groter.",
      "56": "Je hebt er steeds 1 bij gedaan, maar de sprong is groter.",
      "78": "Je telde met sprongen van 1 door, terwijl de sprong groter is. Lees hem af uit twee stenen die al ingevuld zijn.",
    },
    hint: "Kijk hoe ver de stenen uit elkaar liggen: dat is de sprong.",
    uitleg: (som) => {
      const sprong = sprongVan(som);
      const r = rij(som);
      return [
        { tekst: "Kijk naar twee stenen die wél ingevuld zijn.", som: `${r[0]} en ${r[1]}` },
        { tekst: "Het verschil is de sprong.", som: `${sprong}` },
        { tekst: "Doe die sprong er elke keer bij.", som: `${r[0]} → ${r[1]} → ${r[2]}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord loopt op met 1 in plaats van met de gevraagde sprong. Doortellen met 1 zit er al in; met sprongen van 2, 5 of 10 tellen is een nieuwe stap, en onder druk valt een kind terug op wat het al kan.",
      zinnen: [
        "Leg samen de sprong vast vóór het tellen: hoeveel gaat er elke keer bij?",
        "Wijs de afstand tussen de stenen aan — die is groter bij een grotere sprong.",
      ],
      schoolwoord: "sprongsgewijs tellen",
    },
  },
  {
    id: "verkeerde-richting",
    naam: "De verkeerde kant op geteld",
    herkent: (som) => {
      const omgekeerd = rijMet(som, sprongVan(som), true);
      return zelfde(
        gegeven(som),
        legePlekken(som).map((p) => omgekeerd[p]),
      );
    },
    kindtekst: {
      "34": "Je telde de verkeerde kant op.",
      "56": "Je telde vooruit, maar deze rij gaat terug.",
      "78": "De richting klopt niet: kijk of de getallen op de stenen oplopen of juist aflopen.",
    },
    hint: "Kijk naar de getallen die er al staan: worden ze groter of kleiner?",
    uitleg: (som) => {
      const r = rij(som);
      const terug = som.variant === "terug";
      return [
        { tekst: "Kijk eerst naar de stenen die al ingevuld zijn.", som: `${r[0]} → ${r[1]}` },
        {
          tekst: terug ? "De getallen worden kleiner." : "De getallen worden groter.",
          som: terug ? `${r[0]} > ${r[1]}` : `${r[0]} < ${r[1]}`,
        },
        {
          tekst: terug ? "Haal de sprong er dus elke keer af." : "Doe de sprong er dus elke keer bij.",
          som: `${sprongVan(som)}`,
        },
      ];
    },
    ouder: {
      uitleg:
        "Het kind telt vooruit waar het terug moet, of andersom. Terugtellen gaat niet vanzelf: vooruittellen is veel vaker geoefend en komt er zo uit.",
      zinnen: [
        "Lees samen de getallen die al op de stenen staan hardop voor.",
        "Vraag: worden ze groter of kleiner? Pas daarna gaan tellen.",
      ],
      schoolwoord: "terugtellen",
    },
  },
  {
    id: "verwisseld",
    naam: "Goede getallen, verkeerde volgorde",
    herkent: (som) => {
      const g = gegeven(som);
      const j = juist(som);
      if (j.length < 2 || g.some((n) => !Number.isFinite(n))) return false;
      if (zelfde(g, j)) return false;
      const op = (a: number[]) => [...a].sort((x, y) => x - y).join(",");
      return op(g) === op(j);
    },
    kindtekst: {
      "34": "De getallen kloppen. De plek nog niet.",
      "56": "Je hebt de goede getallen, maar ze staan op de verkeerde steen.",
      "78": "De getallen kloppen allebei; ze staan alleen niet op de juiste plek in de rij.",
    },
    hint: "Loop de rij van links naar rechts na, steen voor steen.",
    uitleg: (som) => {
      const r = rij(som);
      return [
        { tekst: "Begin links en ga steen voor steen verder.", som: `${r[0]}` },
        { tekst: "Elke steen krijgt het getal dat op die plek hoort.", som: `${r[0]} → ${r[1]}` },
        { tekst: "Zo komt elk getal op zijn eigen steen.", som: r.join(" → ") },
      ];
    },
    ouder: {
      uitleg:
        "De ingevulde getallen zijn goed, maar staan in de verkeerde volgorde. Het kind rekent ze uit zonder de rij van links naar rechts te volgen, en vult ze daarna in de verkeerde stenen.",
      zinnen: [
        "Laat je kind met een vinger langs de rij gaan terwijl het hardop telt.",
        "Vul de stenen één voor één in, van links naar rechts.",
      ],
      schoolwoord: "getallenrij",
    },
  },
  {
    id: "tiental-over",
    naam: "Fout over het tiental heen",
    herkent: (som) => {
      const g = gegeven(som);
      const j = juist(som);
      if (g.some((n) => !Number.isFinite(n))) return false;
      /* Er is minstens één antwoord dat net naast zit, precies bij een tiental. */
      return g.some((n, i) => {
        if (n === j[i]) return false;
        const overTiental = Math.floor(j[i] / 10) !== Math.floor((j[i] - sprongVan(som)) / 10);
        return overTiental && Math.abs(n - j[i]) <= 2;
      });
    },
    kindtekst: {
      "34": "Bijna! Kijk goed bij het tiental.",
      "56": "Het gaat mis waar je over een tiental heen springt.",
      "78": "De sprong over het tiental klopt niet: tel eerst naar het tiental toe en dan verder.",
    },
    hint: "Spring eerst naar het ronde tiental en doe de rest daarna.",
    uitleg: (som) => {
      const r = rij(som);
      const sprong = sprongVan(som);
      /* Het eerste getal van de rij waar een tiental wordt gepasseerd. */
      const plek = r.findIndex(
        (n, i) => i > 0 && Math.floor(n / 10) !== Math.floor(r[i - 1] / 10),
      );
      const van = plek > 0 ? r[plek - 1] : r[0];
      const tiental = Math.round(van / 10) * 10;
      return [
        { tekst: "Je komt hier over een tiental heen.", som: `${van} + ${sprong}` },
        { tekst: "Spring eerst naar het ronde tiental.", som: `${van} → ${tiental}` },
        { tekst: "Doe daarna de rest van de sprong.", som: `${tiental} → ${plek > 0 ? r[plek] : van + sprong}` },
      ];
    },
    ouder: {
      uitleg:
        "Het antwoord zit er één of twee naast, precies waar de rij over een tiental gaat. Over het tiental springen vraagt meer dan doortellen: je moet het getal even opsplitsen. Dat is de plek waar het bij bijna elk kind een tijd lang misgaat.",
      zinnen: [
        "Doe de sprong in twee stukken: eerst naar het ronde tiental, dan de rest.",
        "Oefen los: van 18 naar 20, en dan verder.",
      ],
      schoolwoord: "tientalpassage",
    },
  },
];
