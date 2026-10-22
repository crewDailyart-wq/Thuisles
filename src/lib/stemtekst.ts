/**
 * Tekst voor de stem van Bliepo (22 oktober 2026, opdracht eigenaar).
 *
 * Wat er op het scherm staat, blijft precies zoals het is. Alleen wat de stem
 * uitspreekt, gaat hier eerst doorheen:
 *
 *   - getallen voluit: "7 + 8" wordt "zeven plus acht", "23" "drieëntwintig";
 *   - breuken voluit: "3/4" wordt "drie kwart", "2/5" "twee vijfde";
 *   - tekens als woorden: "=" wordt "is", "☐" wordt "hoeveel", "×" "keer";
 *   - geld, tijd en maten: "€ 2,50" wordt "twee euro vijftig", "8:30" "half negen".
 *
 * Fish Audio kan zelf ook getallen omzetten, maar niet in het Nederlands
 * (docs.fish.audio: Nederlands staat niet in de lijst met talen). Daarom
 * doen we het hier, en zetten we die omzetting bij Fish Audio uit.
 *
 * `knipInZinnen` knipt een lange tekst in korte zinnen: elke zin wordt apart
 * gemaakt en gecontroleerd, zodat er nergens een woord wegvalt.
 *
 * Dit bestand mag zowel in de browser als op de server gebruikt worden.
 */

const EENHEDEN = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen"];
const TIENERS = ["tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien"];
const TIENTALLEN = ["", "", "twintig", "dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig"];

function onderHonderd(n: number): string {
  if (n < 10) return EENHEDEN[n];
  if (n < 20) return TIENERS[n - 10];
  const tiental = TIENTALLEN[Math.floor(n / 10)];
  const eenheid = n % 10;
  if (eenheid === 0) return tiental;
  /* "tweeëntwintig", "drieëntwintig": een trema als er anders "ee" + "en" botst. */
  const voor = EENHEDEN[eenheid];
  return `${voor}${voor.endsWith("e") ? "ën" : "en"}${tiental}`;
}

function onderDuizend(n: number): string {
  if (n < 100) return onderHonderd(n);
  const honderdtal = Math.floor(n / 100);
  const rest = n % 100;
  const voor = honderdtal === 1 ? "honderd" : `${EENHEDEN[honderdtal]}honderd`;
  return rest === 0 ? voor : `${voor}${onderHonderd(rest)}`;
}

/** Een geheel getal voluit, zoals je het zegt: 1 = "één", 21 = "eenentwintig". */
export function getalVoluit(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n < 0) return `min ${getalVoluit(-n)}`;
  if (n === 1) return "één";
  return grootGetal(Math.floor(n));
}

function grootGetal(n: number): string {
  if (n < 1000) return onderDuizend(n);
  if (n < 1_000_000) {
    const duizendtal = Math.floor(n / 1000);
    const rest = n % 1000;
    const voor = duizendtal === 1 ? "duizend" : `${onderDuizend(duizendtal)}duizend`;
    return rest === 0 ? voor : `${voor} ${onderDuizend(rest)}`;
  }
  if (n < 1_000_000_000) {
    const miljoenen = Math.floor(n / 1_000_000);
    const rest = n % 1_000_000;
    const voor = `${miljoenen === 1 ? "een" : grootGetal(miljoenen)} miljoen`;
    return rest === 0 ? voor : `${voor} ${grootGetal(rest)}`;
  }
  return String(n);
}

/** Rangtelwoord voor de noemer van een breuk: 5 = "vijfde", 8 = "achtste", 20 = "twintigste". */
function noemer(n: number): string {
  if (n === 2) return "half";
  if (n === 4) return "kwart";
  return rangtelwoord(n);
}

/** Een breuk voluit: 1/2 = "een half", 3/4 = "drie kwart", 3/2 = "drie halve". */
export function breukVoluit(teller: number, deler: number): string {
  if (deler === 2) return teller === 1 ? "een half" : `${grootGetal(teller)} halve`;
  if (deler === 4) return teller === 1 ? "een kwart" : `${grootGetal(teller)} kwart`;
  return `${teller === 1 ? "een" : grootGetal(teller)} ${noemer(deler)}`;
}

/** Rangtelwoord: 1 = "eerste", 2 = "tweede", 3 = "derde", 8 = "achtste", 20 = "twintigste". */
function rangtelwoord(n: number): string {
  if (n === 1) return "eerste";
  if (n === 3) return "derde";
  const woord = grootGetal(n);
  if (/(acht|tig|honderd|duizend|miljoen)$/.test(woord)) return `${woord}ste`;
  if (woord.endsWith("drie")) return `${woord.slice(0, -4)}derde`;
  if (woord.endsWith("een")) return `${woord.slice(0, -3)}eerste`;
  return `${woord}de`;
}

/** "8:30" = "half negen", "8:15" = "kwart over acht", "14:05" = "veertien uur vijf". */
function tijdVoluit(uur: number, minuut: number): string {
  const volgend = uur === 12 ? 1 : uur === 23 ? 0 : uur + 1;
  const u = (x: number) => (x === 1 ? "één" : grootGetal(x));
  if (minuut === 0) return `${u(uur)} uur`;
  if (uur <= 12) {
    if (minuut === 15) return `kwart over ${u(uur)}`;
    if (minuut === 30) return `half ${u(volgend)}`;
    if (minuut === 45) return `kwart voor ${u(volgend)}`;
  }
  return `${u(uur)} uur ${grootGetal(minuut)}`;
}

/** Een getal zoals het in een tekst staat ("1.000", "3,5") voluit. */
function getalTekstVoluit(tekst: string): string {
  const zonderPunten = /^\d{1,3}(\.\d{3})+$/.test(tekst) ? tekst.replace(/\./g, "") : tekst;
  const [geheel, decimaal] = zonderPunten.split(/[,.]/);
  const voor = getalVoluit(Number(geheel));
  if (decimaal === undefined) return voor;
  /* "3,5" = "drie komma vijf"; "2,25" = "twee komma vijfentwintig". */
  const na = decimaal.startsWith("0") ? [...decimaal].map((c) => EENHEDEN[Number(c)]).join(" ") : grootGetal(Number(decimaal));
  return `${voor} komma ${na}`;
}

const GETAL = String.raw`\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?`;
const VAKJE = String.raw`[☐□▢⬜]+|_{2,}|_`;

const MATEN: Record<string, string> = {
  mm: "millimeter",
  cm: "centimeter",
  dm: "decimeter",
  m: "meter",
  km: "kilometer",
  g: "gram",
  kg: "kilo",
  ml: "milliliter",
  cl: "centiliter",
  dl: "deciliter",
  l: "liter",
};

/**
 * Maakt van een zin wat de stem moet zeggen. Wat al in woorden staat, blijft
 * staan; alleen cijfers en tekens worden woorden.
 */
export function voorStem(zin: string): string {
  let t = ` ${zin.normalize("NFC")} `;

  /* Vakjes om in te vullen: de stem vraagt "hoeveel". */
  t = t.replace(new RegExp(`(^|[\\s(=+×x*:÷−–-])(?:${VAKJE})(?=[\\s)=+×x*:÷−–?.!,-]|$)`, "g"), "$1 hoeveel ");
  /* "7 + ? = 10" en "7 + 8 = ?": ook dan "hoeveel". */
  t = t.replace(/([+×*:÷−–-]\s*)\?(?=\s*=)/g, "$1 hoeveel ");
  t = t.replace(/=\s*\?/g, "= hoeveel?");

  /* Geld: "€ 2,50" = "twee euro vijftig", "€0,75" = "vijfenzeventig cent", "€ 3" = "drie euro". */
  t = t.replace(/€\s?(\d+)(?:,(\d{2}|-))?/g, (_, e: string, c?: string) => {
    const euro = Number(e);
    const cent = c && c !== "-" ? Number(c) : 0;
    if (euro === 0 && cent > 0) return `${grootGetal(cent)} cent`;
    return cent > 0 ? `${getalVoluit(euro)} euro ${grootGetal(cent)}` : `${getalVoluit(euro)} euro`;
  });

  /* Tijd: "8:30", "14:05". Alleen zonder spaties; "8 : 2" is delen. */
  t = t.replace(/(^|[^\d:])([01]?\d|2[0-3]):([0-5]\d)(?![\d:])/g, (_, voor: string, u: string, m: string) => `${voor}${tijdVoluit(Number(u), Number(m))}`);

  /* Gemengd getal: "1 1/2" = "één en een half". */
  t = t.replace(/(\d+)\s+(\d+)\/(\d+)(?!\d)/g, (_, g: string, a: string, b: string) => `${getalVoluit(Number(g))} en ${breukVoluit(Number(a), Number(b))}`);
  /* Breuk: "3/4" = "drie kwart". */
  t = t.replace(/(\d+)\s?\/\s?(\d+)(?!\d)/g, (_, a: string, b: string) => breukVoluit(Number(a), Number(b)));

  /* Rangtelwoorden: "1e", "2de", "3e" = "eerste", "tweede", "derde". */
  t = t.replace(/\b(\d+)(?:e|de|ste)\b/g, (_, n: string) => rangtelwoord(Number(n)));

  /* Procent en maten direct na een getal. */
  t = t.replace(new RegExp(`(${GETAL})\\s?%`, "g"), "$1 procent");
  t = t.replace(new RegExp(`(${GETAL})\\s?(mm|cm|dm|km|kg|ml|cl|dl|m|g|l)\\b`, "g"), (_, n: string, eenheid: string) => `${n} ${MATEN[eenheid]}`);

  /* Rekentekens tussen getallen of woorden. */
  t = t.replace(/\s*\+\s*/g, " plus ");
  t = t.replace(/\s*[×✕✖*]\s*/g, " keer ");
  t = t.replace(/(\d)\s*[xX]\s*(?=\d)/g, "$1 keer ");
  t = t.replace(/\s*÷\s*/g, " gedeeld door ");
  t = t.replace(/(\d|hoeveel)\s+:\s+(?=\d|hoeveel)/g, "$1 gedeeld door ");
  t = t.replace(/(\d)\s*[−–]\s*(?=\d|hoeveel)/g, "$1 min ");
  t = t.replace(/(\d|hoeveel)\s+-\s+(?=\d|hoeveel)/g, "$1 min ");
  t = t.replace(/(\d)-(?=\d)/g, "$1 min ");
  t = t.replace(/\s*≠\s*/g, " is niet ");
  t = t.replace(/\s*≈\s*/g, " is ongeveer ");
  t = t.replace(/\s*≤\s*/g, " is kleiner dan of gelijk aan ");
  t = t.replace(/\s*≥\s*/g, " is groter dan of gelijk aan ");
  t = t.replace(/\s+<\s+/g, " is kleiner dan ");
  t = t.replace(/\s+>\s+/g, " is groter dan ");
  t = t.replace(/\s*=\s*/g, " is ");

  /* Wat er nog aan getallen over is. */
  t = t.replace(new RegExp(GETAL, "g"), (n) => getalTekstVoluit(n));

  /* Tekens die de stem niet hoeft te zeggen. */
  t = t.replace(/[#*_~^|\\[\]{}<>]/g, " ");
  t = t.replace(/\s+([,.!?;:])/g, "$1");
  t = t.replace(/\s{2,}/g, " ").trim();

  /* Een zin zonder slotteken krijgt een punt, zodat de stem netjes afsluit. */
  if (t && !/[.!?…]$/.test(t)) t += ".";
  return t;
}

/** Langer dan dit wordt een zin nog eens geknipt bij een komma. */
const LANGE_ZIN = 120;

/**
 * Knipt een tekst in korte zinnen, op punt, uitroepteken en vraagteken. Een
 * heel lange zin wordt daarna nog geknipt bij een komma. Elk stuk wordt los
 * gemaakt en gecontroleerd.
 */
export function knipInZinnen(tekst: string): string[] {
  const zinnen = tekst.match(/[^.!?…]+(?:[.!?…]+|$)/g)?.map((z) => z.trim()).filter(Boolean) ?? [];
  const uit: string[] = [];
  for (const zin of zinnen) {
    if (zin.length <= LANGE_ZIN) {
      uit.push(zin);
      continue;
    }
    let stuk = "";
    for (const deel of zin.split(/(?<=,)\s+/)) {
      if (stuk && stuk.length + deel.length + 1 > LANGE_ZIN) {
        uit.push(stuk);
        stuk = deel;
      } else stuk = stuk ? `${stuk} ${deel}` : deel;
    }
    if (stuk) uit.push(stuk);
  }
  /* Losse woordjes als "Ja." of "Oké." bij de volgende zin houden, behalve als het het enige is. */
  const samen: string[] = [];
  for (const z of uit) {
    const vorige = samen[samen.length - 1];
    if (vorige && vorige.split(" ").length <= 1 && vorige.length + z.length < LANGE_ZIN) samen[samen.length - 1] = `${vorige} ${z}`;
    else samen.push(z);
  }
  return samen;
}

/**
 * Woorden die precies hetzelfde klinken maar die de luisteraar (spraak naar
 * tekst) anders opschrijft: "Wauw" schrijft hij als "Wow", "Oké" als "Okay".
 */
/*
  "hi" en "yeah" (23 oktober 2026): de spraak-naar-tekst schrijft een los
  "Hoi Sam!" of "Ja." van Ruth vaak in het Engels op, ook met de Nederlandse
  dragerzin ervoor; "Hoi Testkind!" werd wel als "hoi" verstaan. In onze
  Nederlandse teksten komen "hi" en "yeah" nooit voor, dus dit verbergt geen
  echt ontbrekend woord.
*/
const KLINKT_GELIJK: Record<string, string> = { wow: "wauw", okay: "oke", okee: "oke", ok: "oke", jaa: "ja", hooij: "hoi", hi: "hoi", yeah: "ja" };

/** De woorden van een zin, voor de controle: kleine letters, zonder leestekens en accenten. */
export function woordenVan(tekst: string): string[] {
  return voorStem(tekst.replace(/\[[^\]]*\]/g, " "))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/[-']/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => KLINKT_GELIJK[w] ?? w);
}

function lijktOp(a: string, b: string): boolean {
  if (a === b) return true;
  const lang = Math.max(a.length, b.length);
  if (lang <= 3) return false;
  /* Levenshtein: een paar letters verschil is een spellingsverschil van de luisteraar, geen ontbrekend woord. */
  const vorige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let links = i;
    let schuin = i - 1;
    for (let j = 1; j <= b.length; j++) {
      const boven = vorige[j];
      const nieuw = Math.min(boven + 1, links + 1, schuin + (a[i - 1] === b[j - 1] ? 0 : 1));
      schuin = boven;
      vorige[j] = nieuw;
      links = nieuw;
    }
  }
  return vorige[b.length] <= (lang >= 8 ? 2 : 1);
}

export type Controle = { goed: boolean; mist: string[]; extra: string[] };

/**
 * Vergelijkt wat er gezegd moest worden met wat de luisteraar (spraak naar
 * tekst) hoorde. Ontbreekt er een woord, of zijn er meer dan twee woorden bij
 * gekomen, dan is de zin niet goed.
 *
 * Samengestelde woorden mogen anders gespeld zijn ("tweeëntwintig" of
 * "twee en twintig"): we vergelijken daarom ook de woorden aan elkaar.
 */
export function vergelijkZin(bedoeld: string, gehoord: string): Controle {
  const a = woordenVan(bedoeld);
  const b = woordenVan(gehoord);
  /* Langste gemeenschappelijke rij, met "lijkt op" in plaats van "is gelijk". */
  const tabel = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      tabel[i][j] = lijktOp(a[i], b[j]) ? tabel[i + 1][j + 1] + 1 : Math.max(tabel[i + 1][j], tabel[i][j + 1]);
    }
  }
  const mist: string[] = [];
  const extra: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (lijktOp(a[i], b[j])) {
      i++;
      j++;
    } else if (tabel[i + 1][j] >= tabel[i][j + 1]) mist.push(a[i++]);
    else extra.push(b[j++]);
  }
  while (i < a.length) mist.push(a[i++]);
  while (j < b.length) extra.push(b[j++]);

  /* Aan elkaar geschreven of los: "twee en twintig" tegen "tweeentwintig". */
  const plak = (w: string[]) => w.join("");
  if (mist.length && extra.length && lijktOp(plak(mist), plak(extra))) return { goed: true, mist: [], extra: [] };
  const zonderSpaties = (w: string[]) => w.join("");
  if (mist.length && zonderSpaties(b).includes(zonderSpaties(mist))) return { goed: extra.length <= 2, mist: [], extra };

  return { goed: mist.length === 0 && extra.length <= 2, mist, extra };
}
