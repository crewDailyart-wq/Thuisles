/**
 * Getallen in woorden, tot en met honderd.
 *
 * Nodig omdat Vos in de uitleg hardop meetelt. "21" laten voorlezen levert bij
 * de ene stem "eenentwintig" op en bij de andere "twee één"; dat is precies het
 * moment waarop een kind afhaakt. Door het woord zelf mee te geven, klinkt het
 * altijd zoals de juf het zegt.
 *
 * Alleen tot honderd: hoger komt in dit onderdeel niet voor, en een half
 * afgemaakte reeks is erger dan een duidelijke grens.
 */

const EENHEDEN = [
  "nul",
  "een",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
];

const TIEN_TOT_TWINTIG = [
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
];

const TIENTALLEN = [
  "",
  "tien",
  "twintig",
  "dertig",
  "veertig",
  "vijftig",
  "zestig",
  "zeventig",
  "tachtig",
  "negentig",
];

/**
 * Het getal in woorden.
 *
 * De Nederlandse volgorde is omgekeerd: eerst de eenheid, dan "en", dan het
 * tiental — "vierentwintig". Staat de eenheid op een klinker (twee, drie), dan
 * komt er een tussen-s: "drieëntwintig" wordt met een trema geschreven. Voor
 * het voorlezen maakt dat niets uit, voor het bijschrift wel.
 */
export function inWoorden(n: number): string {
  const getal = Math.round(n);
  if (!Number.isFinite(getal) || getal < 0 || getal > 100) return String(n);
  if (getal === 100) return "honderd";
  if (getal < 10) return EENHEDEN[getal];
  if (getal < 20) return TIEN_TOT_TWINTIG[getal - 10];

  const tien = Math.floor(getal / 10);
  const een = getal % 10;
  if (een === 0) return TIENTALLEN[tien];

  /* Trema op de e van "en" na een klinker: twee-, drie-. */
  const koppel = EENHEDEN[een].endsWith("e") ? "ën" : "en";
  return `${EENHEDEN[een]}${koppel}${TIENTALLEN[tien]}`;
}
