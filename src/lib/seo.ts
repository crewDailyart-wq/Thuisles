/**
 * De SEO-basis: webadressen, paginatitels en talen.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit bestand bestaat
 * ---------------------------------------------------------------------------
 * Zoekmachines moeten Thuisles kunnen vinden, maar alleen op de plekken die
 * daarvoor bedoeld zijn. Dat valt uiteen in zes afspraken (zie WERKPLAN.md,
 * "SEO-basis"), en vijf daarvan komen hier samen:
 *
 *   1. Webadressen in gewone woorden, gemaakt uit de namen in de database.
 *   2. Een eigen paginatitel en korte beschrijving per pagina, uit de
 *      database, met een nette standaard als het veld leeg is.
 *   5. De admin, de oefenpagina's en alles achter de login worden niet
 *      geïndexeerd.
 *   6. Ruimte voor meerdere talen bij de ouderpagina's.
 *
 * Alleen rekenwerk en tekst; geen database. Daardoor kan dit bestand ook in de
 * browser gebruikt worden en kan het beheerscherm meteen laten zien welke
 * titel er straks uitkomt.
 */

// ---------------------------------------------------------------------------
// Talen
// ---------------------------------------------------------------------------

/**
 * De talen van de openbare ouderpagina's.
 *
 * Dezelfde vier als in de ouderomgeving: Nederlands, Turks, Arabisch en Pools.
 * Nederlands is de standaard en staat zonder voorvoegsel in het adres; de
 * andere drie krijgen er een: `/tr/...`, `/ar/...`, `/pl/...`.
 */
export const TALEN = ["nl", "tr", "ar", "pl"] as const;

export type Taal = (typeof TALEN)[number];

export const STANDAARDTAAL: Taal = "nl";

/** Hoe een taal heet, in die taal zelf. Zo kiest een ouder zijn eigen taal. */
export const TAALNAAM: Record<Taal, string> = {
  nl: "Nederlands",
  tr: "Türkçe",
  ar: "العربية",
  pl: "Polski",
};

/**
 * Welke talen van rechts naar links lezen.
 *
 * Arabisch is de enige van de vier. Het staat als lijst en niet als `=== "ar"`,
 * zodat er een taal bij kan zonder dat er ergens anders iets moet veranderen.
 */
const RECHTS_NAAR_LINKS: Taal[] = ["ar"];

export function leestRechtsNaarLinks(taal: Taal): boolean {
  return RECHTS_NAAR_LINKS.includes(taal);
}

/** De leesrichting voor het `dir`-kenmerk op de pagina. */
export function leesrichting(taal: Taal): "ltr" | "rtl" {
  return leestRechtsNaarLinks(taal) ? "rtl" : "ltr";
}

/** Is dit een taal die we kennen? Zo niet, dan is het geen taalvoorvoegsel. */
export function isTaal(waarde: string | undefined): waarde is Taal {
  return !!waarde && (TALEN as readonly string[]).includes(waarde);
}

/**
 * Het voorvoegsel van een taal in het webadres.
 *
 * Nederlands krijgt er geen: `/groep-4/tafels` blijft dus gewoon zoals het is,
 * en de andere talen hangen eronder. Zo is het Nederlandse adres het kortste,
 * en dat is het adres dat de meeste ouders te zien krijgen.
 */
export function taalvoorvoegsel(taal: Taal): string {
  return taal === STANDAARDTAAL ? "" : `/${taal}`;
}

// ---------------------------------------------------------------------------
// Webadressen in gewone woorden
// ---------------------------------------------------------------------------

/**
 * "Tafel van 3" -> "tafel-van-3".
 *
 * Kleine letters, streepjes tussen de woorden, geen id-nummers. Dezelfde regel
 * als `maakSlug` in `structuur.ts`; die staat daar omdat de database hem
 * gebruikt bij het opslaan, en hier zodat de openbare kant hem kan gebruiken
 * zonder de database binnen te halen. De regel is woord voor woord dezelfde —
 * wijkt er ooit één af, dan lopen de adressen uit elkaar.
 */
export function naarAdresdeel(naam: string): string {
  return (
    naam
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "naamloos"
  );
}

/** "groep-4" -> 4, en alles wat er niet op lijkt -> null. */
export function leesGroepdeel(deel: string): number | null {
  const gevonden = /^groep-([3-8])$/.exec(deel);
  return gevonden ? Number(gevonden[1]) : null;
}

/** 4 -> "groep-4". Het eerste deel van elk openbaar adres. */
export function groepdeel(groep: number): string {
  return `groep-${groep}`;
}

/**
 * Het openbare adres van een pagina, uit de delen die eraan meedoen.
 *
 * Altijd beginnend met de groep, dan het domein, dan eventueel het onderwerp
 * of de oefening: `/groep-4/tafels/tafel-van-3`. Geen enkel id-nummer, alleen
 * woorden — dat is het hele punt van afspraak 1.
 */
export function openbaarAdres(
  taal: Taal,
  groep: number,
  ...delen: (string | null | undefined)[]
): string {
  const schoon = delen.filter((d): d is string => !!d);
  return `${taalvoorvoegsel(taal)}/${groepdeel(groep)}${schoon.map((d) => `/${d}`).join("")}`;
}

// ---------------------------------------------------------------------------
// Paginatitel en beschrijving
// ---------------------------------------------------------------------------

/** Wat er achter elke paginatitel komt. Eén plek, zodat het nooit afwijkt. */
export const MERKNAAM = "Thuisles";

/**
 * De paginatitel, met de merknaam erachter.
 *
 * `eigen` is wat er in de admin is ingevuld. Is dat leeg — en dat is het
 * meestal — dan maakt het systeem er zelf een nette van: "Tafel van 3 oefenen
 * – groep 4 | Thuisles". Zo heeft elke pagina een eigen titel, ook voordat er
 * iemand aan de teksten is begonnen.
 *
 * Staat de merknaam al in de eigen titel, dan komt hij er niet nog een keer
 * achter: een beheerder die de hele titel zelf typt, houdt precies wat hij
 * heeft getypt.
 */
export function paginatitel(
  eigen: string | null | undefined,
  onderdeel: string,
  groep: number | null,
): string {
  const schoon = (eigen ?? "").trim();
  if (schoon) return schoon.includes(MERKNAAM) ? schoon : `${schoon} | ${MERKNAAM}`;

  const metGroep = groep === null ? onderdeel : `${onderdeel} oefenen – groep ${groep}`;
  return `${metGroep} | ${MERKNAAM}`;
}

/**
 * De korte beschrijving onder de titel in de zoekresultaten.
 *
 * Dezelfde afspraak als bij de titel: wat de beheerder invult gaat voor, en
 * anders maakt het systeem er een nette van. Eén zin, want langer dan dat
 * wordt in een zoekresultaat toch afgekapt.
 */
export function paginabeschrijving(
  eigen: string | null | undefined,
  onderdeel: string,
  groep: number | null,
): string {
  const schoon = (eigen ?? "").trim();
  if (schoon) return schoon;

  const bij = groep === null ? "op de basisschool" : `in groep ${groep}`;
  return `Oefenen met ${onderdeel.toLowerCase()} ${bij}. Uitleg, oefeningen en voortgang voor ouder en kind.`;
}

// ---------------------------------------------------------------------------
// Niet indexeren
// ---------------------------------------------------------------------------

/**
 * Wat er in de kop van een pagina hoort die niet in Google mag komen.
 *
 * Geldt voor de admin, de oefenpagina's en alles achter de login (afspraak 5).
 * Die pagina's gaan over één kind; ze horen niet in een zoekresultaat, en de
 * regel in `robots.txt` alleen is te zwak — die vraagt een zoekmachine het
 * adres niet te bezoeken, maar een adres dat elders gelinkt staat kan er
 * alsnog in belanden. `noindex` zegt het bij de pagina zelf.
 *
 * `follow` blijft aan: de links op zo'n pagina mogen gewoon gevolgd worden.
 */
export const NIET_INDEXEREN = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
} as const;

/**
 * De paden die ook in `robots.txt` dicht gaan.
 *
 * Dubbelop met `NIET_INDEXEREN` hierboven, en dat is de bedoeling: de ene zegt
 * "neem me niet op", de andere "kom hier niet". Samen dekken ze zowel een
 * zoekmachine die netjes `robots.txt` leest als een adres dat ergens anders
 * gelinkt blijkt te staan.
 */
export const GESLOTEN_PADEN = [
  "/admin",
  "/oefenen",
  "/ouder",
  "/kies",
  "/start",
  "/profiel",
  "/voortgang",
  "/wereld",
  "/maatje",
  "/voorbeeld",
];
