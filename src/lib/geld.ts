/**
 * Geld: de munten en briefjes, en hoe je een bedrag opschrijft en leest.
 *
 * Een gewoon bestand zonder React, net als `tijd.ts`: de generatoren draaien
 * ook op de server en in `npm run opgaven`, en hebben dit allemaal nodig.
 *
 * Alles rekent in centen, als heel getal. Met euro's als kommagetal gaat het
 * vroeg of laat mis — 0,1 + 0,2 is in de computer niet precies 0,3 — en dan
 * wordt een goed antwoord fout gerekend.
 */

/** Alle munten en briefjes, in centen, van klein naar groot. */
export const MUNTEN = [1, 2, 5, 10, 20, 50, 100, 200] as const;
export const BRIEFJES = [500, 1000, 2000, 5000, 10000, 20000, 50000] as const;
export const GELDSTUKKEN = [...MUNTEN, ...BRIEFJES];

/** Is dit een briefje? Alles vanaf 5 euro. */
export function isBriefje(cent: number): boolean {
  return cent >= 500;
}

/**
 * Hoe een munt of briefje heet, voor in een zin en voor wie het scherm laat
 * voorlezen: "50 cent", "2 euro", "een briefje van 20 euro".
 */
export function naamVan(cent: number): string {
  if (isBriefje(cent)) return `briefje van ${cent / 100} euro`;
  if (cent >= 100) return `${cent / 100} euro`;
  return `${cent} cent`;
}

/** Hetzelfde met een lidwoord ervoor: "een munt van 50 cent", "een briefje van 5 euro". */
export function eenVan(cent: number): string {
  return isBriefje(cent) ? `een ${naamVan(cent)}` : `een munt van ${naamVan(cent)}`;
}

/**
 * Een vaste spatie tussen € en het bedrag: dan breekt een zin nooit af
 * tussen het teken en het getal ("van €" aan het eind van een regel en "3,70"
 * op de volgende).
 */
const VAST = "\u00a0";

/** Twee cijfers achter de komma: 5 wordt "05", 50 wordt "50". */
function tweeCijfers(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Een bedrag zoals het op een prijskaartje staat: "€ 60,-" of "€ 4,90".
 *
 * Hele euro's met een streepje erachter, zoals in de winkel; anders altijd twee
 * cijfers na de komma, zodat 4,9 nooit als "€ 4,9" op het scherm komt.
 */
export function bedrag(cent: number): string {
  const euro = Math.floor(cent / 100);
  const rest = cent % 100;
  return rest === 0 ? `€${VAST}${euro},-` : `€${VAST}${euro},${tweeCijfers(rest)}`;
}

/**
 * Een bedrag zoals op een kassabon: altijd twee cijfers centen, "€ 8,00".
 *
 * In een kolom bedragen onder elkaar staan de komma's dan recht onder elkaar;
 * met "€ 8,-" onder "€ 2,90" schuift de komma een plek op.
 */
export function bedragKassa(cent: number): string {
  return `€${VAST}${Math.floor(cent / 100)},${tweeCijfers(cent % 100)}`;
}

/** Een bedrag in woorden voor in een zin: "2 euro", "50 cent", "4 euro en 90 cent". */
export function bedragInWoorden(cent: number): string {
  const euro = Math.floor(cent / 100);
  const rest = cent % 100;
  if (euro === 0) return `${rest} cent`;
  if (rest === 0) return `${euro} euro`;
  return `${euro} euro en ${rest} cent`;
}

/**
 * Het antwoord zoals het scherm het doorgeeft en de generator het opslaat:
 * euro's, een komma, en altijd twee cijfers centen. "26,00", "4,90", "0,05".
 *
 * Eén vaste schrijfwijze, zodat nakijken een gewone vergelijking is: wat het
 * kind ook typt — 26, 26,00 of 26,- — het scherm maakt er eerst dit van. En
 * omdat er een komma in staat, krijgen de foutpatronen de euro's en de centen
 * los binnen (`gegeven0` en `gegeven1`), en kunnen ze zien of er een euro of
 * tien cent naast zit.
 */
export function antwoordVan(cent: number): string {
  return `${Math.floor(cent / 100)},${tweeCijfers(cent % 100)}`;
}

/**
 * Wat er in de twee vakjes staat — € ▢ , ▢ — als bedrag in centen.
 *
 * Het tweede vakje is het stuk na de komma, dus "5" betekent vijftig cent en
 * "05" vijf: zo lees je een kommagetal, en zo telt 25,5 net zo goed als 25,50.
 * Leeg of een streepje is nul centen: 26 en 26,- zijn hetzelfde bedrag.
 * `null` als er niets bruikbaars staat.
 */
export function leesBedragvakjes(euro: string, naKomma: string): number | null {
  const e = euro.trim();
  const k = naKomma.trim();
  if (e === "" && (k === "" || k === "-")) return null;
  if (e !== "" && !/^\d+$/.test(e)) return null;
  let centen = 0;
  if (k !== "" && k !== "-") {
    if (!/^\d{1,2}$/.test(k)) return null;
    centen = k.length === 1 ? Number(k) * 10 : Number(k);
  }
  return (e === "" ? 0 : Number(e)) * 100 + centen;
}

/**
 * Wat er in "▢ euro ▢ cent" staat, als bedrag in centen.
 *
 * Hier staat er "cent" achter het tweede vakje, dus is 5 gewoon vijf cent.
 * Een leeg centvakje telt als 0, net als het minutenvakje bij Tijd.
 */
export function leesEuroCent(euro: string, cent: string): number | null {
  const e = euro.trim();
  const c = cent.trim();
  if (e === "" && c === "") return null;
  if ((e !== "" && !/^\d+$/.test(e)) || (c !== "" && !/^\d+$/.test(c))) return null;
  return (e === "" ? 0 : Number(e)) * 100 + (c === "" ? 0 : Number(c));
}

/**
 * Afronden op hele en halve euro's, zoals WERKPLAN.md het voorschrijft:
 * 25,20 wordt 25,-, 25,40 wordt 25,50 en 25,80 wordt 26,-.
 *
 * Bedragen op ,25 of ,75 komen in de opgaven niet voor; daar zou je twee kanten
 * op kunnen, en dat hoort niet in een oefening met één goed antwoord.
 */
export function afgerond(cent: number): number {
  return Math.round(cent / 50) * 50;
}

/**
 * Een bedrag met zo weinig mogelijk munten en briefjes, grootste eerst.
 *
 * Voor de uitleg ("tel eerst het briefje van 20, dan de 5") en om een groepje
 * geld te maken dat precies een bedrag is.
 */
export function inGeldstukken(cent: number, toegestaan: readonly number[] = GELDSTUKKEN): number[] {
  const uit: number[] = [];
  let rest = cent;
  for (const stuk of [...toegestaan].sort((a, b) => b - a)) {
    while (rest >= stuk) {
      uit.push(stuk);
      rest -= stuk;
    }
  }
  return rest === 0 ? uit : [];
}

/** Het totaal van een groepje geld, in centen. */
export function totaal(stukken: readonly number[]): number {
  return stukken.reduce((s, x) => s + x, 0);
}

/** Groepje geld van groot naar klein, zoals je het neerlegt om te tellen. */
export function groterEerst(stukken: readonly number[]): number[] {
  return [...stukken].sort((a, b) => b - a);
}

/**
 * De voorwerpen met een prijskaartje: speelgoed en fruit.
 *
 * Elk voorwerp is een bestaande tekening uit de telplaatjes, zodat er geen
 * nieuwe plaatjes bij hoeven. Het woord erbij is voor in de zin.
 */
export const VOORWERPEN: { plaatje: string; naam: string }[] = [
  { plaatje: "bal", naam: "de bal" },
  { plaatje: "auto", naam: "het autootje" },
  { plaatje: "eend", naam: "het badeendje" },
  { plaatje: "appel", naam: "de appels" },
  { plaatje: "peer", naam: "de peren" },
  { plaatje: "bloem", naam: "de bloemen" },
  { plaatje: "vis", naam: "het visje" },
  { plaatje: "ster", naam: "de sterrenlamp" },
];

/** Het woord bij een voorwerp, of een algemeen woord als het niet bestaat. */
export function voorwerpNaam(plaatje: string): string {
  return VOORWERPEN.find((v) => v.plaatje === plaatje)?.naam ?? "het";
}
