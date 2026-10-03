/**
 * Rekenen en praten over tijd.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit op één plek staat
 * ---------------------------------------------------------------------------
 * "05:30" heet in het Nederlands "half zes" — niet "half vijf", en niet "vijf
 * uur dertig". Dat soort regels moet precies één keer opgeschreven worden. Zou
 * de generator het antwoord anders uitspreken dan het scherm, dan ziet een kind
 * een goed antwoord rood worden; zou de uitleg het anders zeggen dan de vraag,
 * dan klopt de uitleg niet bij de opgave.
 *
 * Daarom staat alles hier: hoe een tijd heet, in welk dagdeel hij valt, waar de
 * wijzers staan, hoeveel dagen een maand heeft en op welke weekdag een datum
 * valt. Geen React en geen database, alleen rekenwerk — dus te gebruiken door
 * de generator, het scherm, de uitleg én de controlescripts.
 */

// ---------------------------------------------------------------------------
// Dagen, maanden en rangtelwoorden
// ---------------------------------------------------------------------------

/** De week begint op maandag (WERKPLAN.md, Maanden en dagen). */
export const DAGEN = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
] as const;

/** Kort, voor de kolomkoppen van een kalender. */
export const DAGEN_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

export const MAANDEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
] as const;

/** Eerste tot en met twaalfde; verder gaan de opdrachten niet (WERKPLAN.md). */
export const RANGTELWOORDEN = [
  "eerste",
  "tweede",
  "derde",
  "vierde",
  "vijfde",
  "zesde",
  "zevende",
  "achtste",
  "negende",
  "tiende",
  "elfde",
  "twaalfde",
] as const;

/** De getallen in woorden, voor "dertien minuten over half zes". */
const GETALWOORDEN = [
  "nul",
  "één",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
  "tien",
  "elf",
  "twaalf",
  "dertien",
  "veertien",
  "vijftien",
  "zestien",
  "zeventien",
  "achttien",
  "negentien",
  "twintig",
  "eenentwintig",
  "tweeëntwintig",
  "drieëntwintig",
  "vierentwintig",
  "vijfentwintig",
  "zesentwintig",
  "zevenentwintig",
  "achtentwintig",
  "negenentwintig",
  "dertig",
] as const;

export function getalInWoorden(n: number): string {
  return GETALWOORDEN[n] ?? String(n);
}

/**
 * Het uur zoals je het zegt: 13 uur is "één", 0 uur is "twaalf".
 *
 * Een kind leest een wijzerklok, en daar staat geen 13 op. Ook bij een digitale
 * tijd van 18:00 zeg je "zes uur" en niet "achttien uur".
 */
export function uurInWoorden(uur: number): string {
  const op12 = ((uur % 12) + 12) % 12;
  return GETALWOORDEN[op12 === 0 ? 12 : op12];
}

// ---------------------------------------------------------------------------
// Een tijdstip
// ---------------------------------------------------------------------------

/** Een tijdstip op de dag. `uur` loopt van 0 tot en met 23. */
export type Tijd = { uur: number; minuut: number };

/** Hoeveel minuten na middernacht. Handig om mee te rekenen. */
export function inMinuten(t: Tijd): number {
  return t.uur * 60 + t.minuut;
}

/** Terug van minuten naar een tijdstip; het rolt netjes om bij middernacht. */
export function uitMinuten(totaal: number): Tijd {
  const op24 = ((totaal % 1440) + 1440) % 1440;
  return { uur: Math.floor(op24 / 60), minuut: op24 % 60 };
}

export function plusMinuten(t: Tijd, minuten: number): Tijd {
  return uitMinuten(inMinuten(t) + minuten);
}

/**
 * Hoeveel tijd er tussen twee tijdstippen zit, als uren en minuten.
 *
 * Altijd vooruit gerekend: is de tweede tijd eerder op de klok, dan is het de
 * volgende dag geworden. Zo komt er nooit een negatieve tijd uit, en werkt het
 * ook voor "van 11 uur 's ochtends tot 2 uur 's middags".
 */
export function verschil(van: Tijd, tot: Tijd): { uren: number; minuten: number } {
  const stap = ((inMinuten(tot) - inMinuten(van)) % 1440 + 1440) % 1440;
  return { uren: Math.floor(stap / 60), minuten: stap % 60 };
}

/** "07:00" — altijd twee cijfers, zoals een digitale klok het laat zien. */
export function digitaal(t: Tijd): string {
  return `${String(t.uur).padStart(2, "0")}:${String(t.minuut).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// De tijd in woorden
// ---------------------------------------------------------------------------

/**
 * Hoe je een tijd zegt: "half zes", "kwart over één", "tien voor half acht".
 *
 * De Nederlandse klok draait om het hele en het halve uur:
 *
 *   :00            "zes uur"
 *   :15            "kwart over zes"
 *   :30            "half zeven"          — let op: het uur dat kómt
 *   :45            "kwart voor zeven"
 *   :01 tot :14    "… over zes"
 *   :16 tot :29    "… voor half zeven"
 *   :31 tot :44    "… over half zeven"
 *   :46 tot :59    "… voor zeven"
 *
 * Bij vijf, tien, twintig en vijfentwintig minuten laat je het woord "minuten"
 * weg: "tien over zes", niet "tien minuten over zes". Bij alle andere getallen
 * zeg je het er wél bij: "dertien minuten over half zes".
 */
export function inWoorden(t: Tijd): string {
  const m = ((t.minuut % 60) + 60) % 60;
  const ditUur = uurInWoorden(t.uur);
  const volgendUur = uurInWoorden(t.uur + 1);

  if (m === 0) return `${ditUur} uur`;
  if (m === 15) return `kwart over ${ditUur}`;
  if (m === 30) return `half ${volgendUur}`;
  if (m === 45) return `kwart voor ${volgendUur}`;

  /* Vijf, tien, twintig en vijfentwintig zeg je zonder het woord "minuten". */
  const kort = (n: number) => [5, 10, 20, 25].includes(n);
  const aantal = (n: number) => (kort(n) ? getalInWoorden(n) : `${getalInWoorden(n)} minuten`);

  if (m < 15) return `${aantal(m)} over ${ditUur}`;
  if (m < 30) return `${aantal(30 - m)} voor half ${volgendUur}`;
  if (m < 45) return `${aantal(m - 30)} over half ${volgendUur}`;
  return `${aantal(60 - m)} voor ${volgendUur}`;
}

// ---------------------------------------------------------------------------
// Dagdelen
// ---------------------------------------------------------------------------

export type Dagdeel = "nacht" | "ochtend" | "middag" | "avond";

export const DAGDEEL_LABEL: Record<Dagdeel, string> = {
  nacht: "nacht",
  ochtend: "ochtend",
  middag: "middag",
  avond: "avond",
};

/** Hoe je het erachter zegt: "zeven uur 's ochtends". */
export const DAGDEEL_ACHTER: Record<Dagdeel, string> = {
  nacht: "'s nachts",
  ochtend: "'s ochtends",
  middag: "'s middags",
  avond: "'s avonds",
};

/**
 * In welk dagdeel een tijd valt.
 *
 * Nacht tot zes uur, dan ochtend tot twaalf, middag tot zes, daarna avond. Dat
 * is de verdeling die kinderen op school leren; de grenzen liggen op hele uren
 * zodat er nooit twijfel is.
 */
export function dagdeelVan(t: Tijd): Dagdeel {
  if (t.uur < 6) return "nacht";
  if (t.uur < 12) return "ochtend";
  if (t.uur < 18) return "middag";
  return "avond";
}

/**
 * Ligt deze tijd precies op de grens van twee dagdelen: 00:00, 06:00, 12:00 of
 * 18:00? Zulke tijden komen niet in een vraag over het dagdeel. Is 18:00 nog
 * middag of al avond? Dat weet een kind niet zeker, en dan is er geen eerlijk
 * goed antwoord.
 */
export function opDagdeelgrens(t: Tijd): boolean {
  return t.minuut === 0 && t.uur % 6 === 0;
}

/** "zeven uur 's ochtends" — de tijd in woorden met het dagdeel erachter. */
export function metDagdeel(t: Tijd): string {
  return `${inWoorden(t)} ${DAGDEEL_ACHTER[dagdeelVan(t)]}`;
}

// ---------------------------------------------------------------------------
// De wijzers
// ---------------------------------------------------------------------------

/**
 * Waar de wijzers staan, in graden met de klok mee vanaf twaalf uur.
 *
 * De kleine wijzer schuift mee met de minuten, en dat moet ook: om half drie
 * staat hij tussen de 2 en de 3, niet óp de 2. Juist daaraan leest een kind af
 * of het half drie of half vier is.
 */
export function wijzerhoeken(t: Tijd): { uur: number; minuut: number } {
  const m = ((t.minuut % 60) + 60) % 60;
  const u = ((t.uur % 12) + 12) % 12;
  return { uur: u * 30 + m * 0.5, minuut: m * 6 };
}

/** Van een hoek terug naar de tijd waar de grote wijzer op staat. */
export function minuutBijHoek(hoek: number, stap: number): number {
  const op360 = ((hoek % 360) + 360) % 360;
  const minuut = Math.round(op360 / 6 / stap) * stap;
  return minuut % 60;
}

/** Van een hoek terug naar het uur waar de kleine wijzer het dichtst bij staat. */
export function uurBijHoek(hoek: number): number {
  const op360 = ((hoek % 360) + 360) % 360;
  return Math.round(op360 / 30) % 12;
}

// ---------------------------------------------------------------------------
// De kalender
// ---------------------------------------------------------------------------

export function isSchrikkeljaar(jaar: number): boolean {
  return (jaar % 4 === 0 && jaar % 100 !== 0) || jaar % 400 === 0;
}

/** Hoeveel dagen een maand heeft. `maand` loopt van 1 tot en met 12. */
export function dagenInMaand(jaar: number, maand: number): number {
  if (maand === 2) return isSchrikkeljaar(jaar) ? 29 : 28;
  return [4, 6, 9, 11].includes(maand) ? 30 : 31;
}

/**
 * Op welke weekdag een datum valt: 0 is maandag, 6 is zondag.
 *
 * Met `Date` en niet met een eigen formule: dan kloppen de kalenders echt, ook
 * in een schrikkeljaar. `Date.UTC` zodat de zomertijd er niet tussen komt — bij
 * een gewone `new Date(jaar, maand, dag)` kan een datum op sommige machines een
 * uur verschuiven en dan net op de vorige dag uitkomen.
 */
export function weekdagVan(jaar: number, maand: number, dag: number): number {
  const zondagEerst = new Date(Date.UTC(jaar, maand - 1, dag)).getUTCDay();
  /* JavaScript begint op zondag; wij op maandag. */
  return (zondagEerst + 6) % 7;
}

/** De naam van de weekdag waarop een datum valt. */
export function dagnaamVan(jaar: number, maand: number, dag: number): string {
  return DAGEN[weekdagVan(jaar, maand, dag)];
}

/**
 * De rijen van een maandkalender: zeven vakjes per rij, maandag vooraan.
 *
 * Lege vakjes voor en na de maand zijn `null`. Zo kan het scherm er een echte
 * tabel van maken waarin elke datum onder de juiste weekdag staat — dat is de
 * hele reden dat een kalender een kalender is.
 */
export function kalenderrijen(jaar: number, maand: number): (number | null)[][] {
  const eerste = weekdagVan(jaar, maand, 1);
  const dagen = dagenInMaand(jaar, maand);

  const vakjes: (number | null)[] = Array.from({ length: eerste }, () => null);
  for (let dag = 1; dag <= dagen; dag++) vakjes.push(dag);
  while (vakjes.length % 7 !== 0) vakjes.push(null);

  const rijen: (number | null)[][] = [];
  for (let i = 0; i < vakjes.length; i += 7) rijen.push(vakjes.slice(i, i + 7));
  return rijen;
}

/** Hoeveel keer een weekdag in een maand voorkomt. */
export function hoeveelKeerWeekdag(jaar: number, maand: number, weekdag: number): number {
  let aantal = 0;
  for (let dag = 1; dag <= dagenInMaand(jaar, maand); dag++) {
    if (weekdagVan(jaar, maand, dag) === weekdag) aantal++;
  }
  return aantal;
}

/** De hoeveelste keer dat een weekdag in de maand valt, als datum. */
export function zoveelsteWeekdag(
  jaar: number,
  maand: number,
  weekdag: number,
  hoeveelste: number,
): number | null {
  let gezien = 0;
  for (let dag = 1; dag <= dagenInMaand(jaar, maand); dag++) {
    if (weekdagVan(jaar, maand, dag) !== weekdag) continue;
    gezien++;
    if (gezien === hoeveelste) return dag;
  }
  return null;
}

/** De laatste keer dat een weekdag in de maand valt, als datum. */
export function laatsteWeekdag(jaar: number, maand: number, weekdag: number): number | null {
  for (let dag = dagenInMaand(jaar, maand); dag >= 1; dag--) {
    if (weekdagVan(jaar, maand, dag) === weekdag) return dag;
  }
  return null;
}

/** Een datum, als los setje getallen. */
export type Datum = { jaar: number; maand: number; dag: number };

/** Zoveel dagen verder of terug, over de maand- en jaargrens heen. */
export function plusDagen(d: Datum, dagen: number): Datum {
  const nieuw = new Date(Date.UTC(d.jaar, d.maand - 1, d.dag + dagen));
  return {
    jaar: nieuw.getUTCFullYear(),
    maand: nieuw.getUTCMonth() + 1,
    dag: nieuw.getUTCDate(),
  };
}

/** "18 november" — zoals het in een vraag staat, zonder jaartal. */
export function datumInWoorden(d: Datum): string {
  return `${d.dag} ${MAANDEN[d.maand - 1]}`;
}
