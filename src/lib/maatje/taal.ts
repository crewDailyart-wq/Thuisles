/**
 * Kleine taalhulpjes voor het maatje: getallen in woorden, enkelvoud en
 * meervoud, geld, en het omzetten van een tekst naar wat de stem uitspreekt.
 *
 * Rekenen doet het maatje niet; dat doet de generator. Dit is alleen taal.
 */

const EENHEDEN = [
  "nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen",
  "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien",
  "zeventien", "achttien", "negentien",
];
const TIENTALLEN = ["", "", "twintig", "dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig"];

/** Een getal tot en met 100 in woorden, zoals een kind het zegt: "zevenenveertig". */
export function getalWoord(n: number): string {
  if (n < 20) return EENHEDEN[n] ?? String(n);
  if (n === 100) return "honderd";
  const t = Math.floor(n / 10);
  const e = n % 10;
  if (e === 0) return TIENTALLEN[t];
  const een = e === 1 ? "een" : EENHEDEN[e];
  const verbinding = /[ae]$/.test(een) ? "ën" : "en";
  return `${een}${verbinding}${TIENTALLEN[t]}`;
}

/** Hoofdletter vooraan. */
export function hoofd(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

/** "1 kraal", "5 kralen". */
export function stuks(n: number, enkel: string, meer: string): string {
  return `${n} ${n === 1 ? enkel : meer}`;
}

/** Geld in centen als € 2,50 of € 3. */
export function euro(centen: number): string {
  const e = Math.floor(centen / 100);
  const c = centen % 100;
  /* Hele euro's zoals overal in Thuisles: € 14,- */
  return c === 0 ? `€ ${e},-` : `€ ${e},${String(c).padStart(2, "0")}`;
}

/** Geld zoals je het zegt: "2 euro 50", "50 cent", "3 euro". */
export function euroGezegd(centen: number): string {
  const e = Math.floor(centen / 100);
  const c = centen % 100;
  if (e === 0) return `${c} cent`;
  if (c === 0) return `${e} euro`;
  return `${e} euro ${c}`;
}

/**
 * Wat de stem zegt bij een tekst op het scherm.
 *
 * Op het scherm staat "8 + 5", "6 × 5", "20 : 4" en "€ 2,50"; uitgesproken is
 * dat "8 plus 5", "6 keer 5", "20 gedeeld door 4" en "2 euro 50".
 */
export function spreekbaar(tekst: string): string {
  return tekst
    .replace(/€\s?(\d+),-/g, "$1 euro")
    .replace(/€\s?(\d+),(\d{2})/g, (_, e: string, c: string) =>
      Number(e) === 0 ? `${Number(c)} cent` : `${e} euro ${Number(c) === 0 ? "" : Number(c)}`.trim(),
    )
    .replace(/€\s?(\d+)/g, "$1 euro")
    .replace(/(\d)\s*×\s*(\d)/g, "$1 keer $2")
    .replace(/(\d)\s+:\s+(\d)/g, "$1 gedeeld door $2")
    .replace(/(\d)\s*\+\s*(\d|☐|\.\.\.|…)/g, "$1 plus $2")
    .replace(/(\d)\s*[−-]\s*(\d|☐|\.\.\.|…)/g, "$1 min $2")
    .replace(/☐/g, "hoeveel")
    .replace(/\s=\s/g, " is ")
    .replace(/\s+/g, " ")
    .trim();
}

const ENKEL: Record<string, string> = { gaan: "gaat", blijven: "blijft", komen: "komt", staan: "staat", stonden: "stond", zijn: "is", liggen: "ligt" };

/**
 * Enkelvoud bij 1 en "niets" bij 0, achteraf over een zin heen.
 *
 * De schrijvers zetten getallen in vaste zinnen; "er blijven 1 over" moet dan
 * "er blijft 1 over" worden. Dat gebeurt hier, op één plek.
 */
export function verbeterTaal(tekst: string): string {
  return tekst
    .replace(/\b([Ee]r) blijven (er )?0 over\b/g, "$1 blijft niets over")
    .replace(/\b(gaan|blijven|komen|staan|stonden|liggen)( er)?( nog)? 1\b/g, (_, w: string, er = "", nog = "") => `${ENKEL[w]}${er}${nog} 1`)
    .replace(/\b1 ((?:kraal|losse|staaf) )?(gaan|komen|staan|blijven|liggen)\b/g, (_, ding = "", w: string) => `1 ${ding}${ENKEL[w]}`)
    .replace(/\bde 1 staaf\b/g, "de staaf")
    .replace(/\bDe 1 losse\b/g, "De losse")
    .replace(/\bHet zijn er 1\b/g, "Het is er 1");
}
