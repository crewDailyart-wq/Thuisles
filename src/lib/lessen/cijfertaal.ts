/** De schrijfwijze van hoeveelheden. Laat lidwoorden, rangtelwoorden en breukwoorden staan. */
const los = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien", "vijftien", "zestien", "zeventien", "achttien", "negentien"];
const tientallen = ["", "", "twintig", "dertig", "veertig", "vijftig", "zestig", "zeventig", "tachtig", "negentig"];
const eenvoudig = (woord: string) => woord.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("nl");

function schrijfGetal(n: number): string {
  if (n < 20) return los[n];
  if (n < 100) return (n % 10 ? `${los[n % 10]}en` : "") + tientallen[Math.floor(n / 10)];
  if (n < 1000) return (n >= 200 ? los[Math.floor(n / 100)] : "") + "honderd" + (n % 100 ? schrijfGetal(n % 100) : "");
  return "duizend";
}
const getallen = new Map(Array.from({ length: 1001 }, (_, n) => [schrijfGetal(n), String(n)]));

export function cijfersInTekst(tekst: string): string {
  // Deze ongeaccentueerde gevallen zijn in de lessen op betekenis gecontroleerd.
  // Geen algemene regel 'een + zelfstandig naamwoord': dat zou lidwoorden veranderen.
  const hoeveelheden = tekst.normalize("NFC")
    .replace(/\been (?=(?:euro|cent|uur|minuut|seconde)\b)/giu, "1 ")
    .replace(/\been voor een\b/giu, "1 voor 1")
    .replace(/\b((?:Er komt(?: er)?|Er gaat(?: er)?|Tel(?: er)?) )een (?=(?:bij|af|terug|verder)\b)/giu, (_zin, begin: string) => `${begin}1 `)
    .replace(/\been (?=(?:meer|minder|groter|kleiner)(?:[.!?,;:]|$))/giu, "1 ")
    .replace(/\b((?:Elke wagon(?: in de trein)?|Elk vakje|Elk getal) is )een dag\b/giu, (_zin, begin: string) => `${begin}1 dag`)
    .replace(/\bnog een nachtje\b/giu, "nog 1 nachtje")
    .replace(/\been dag verder\b/giu, "1 dag verder")
    .replace(/\been week kamperen\b/giu, "1 week kamperen")
    .replace(/\b((?:Bij|Voor) elk(?:e)? [^.!?]{1,100} zet ik )een (?=(?:streepje|stip)\b)/giu, (_zin, begin: string) => `${begin}1 `)
    .replace(/\b(Bij elke euro die je betaalt, wordt )een stip\b/giu, (_zin, begin: string) => `${begin}1 stip`)
    .replace(/\b(Dan komt er )een bolletje ijs op\b/giu, (_zin, begin: string) => `${begin}1 bolletje ijs op`)
    .replace(/\b(En dan nog )een bolletje erbij\b/giu, (_zin, begin: string) => `${begin}1 bolletje erbij`);
  return hoeveelheden.replace(/\p{L}+/gu, (woord, plek: number) => {
    const klein = eenvoudig(woord);
    // Het gewone lidwoord is geen hoeveelheid: 'een munt', 'een vraag', 'een stukje'.
    if (klein === "een" && !/[éÉ]/u.test(woord)) return woord;
    // 'Ik vier mijn verjaardag' en 'Vier feest' zijn geen telwoorden.
    if (klein === "vier" && (/\bik\s+$/iu.test(hoeveelheden.slice(0, plek)) || /^\s+(?:je|jij|feest|het|mijn|jouw)\b/iu.test(hoeveelheden.slice(plek + woord.length)))) return woord;
    return getallen.get(klein) ?? woord;
  });
}
