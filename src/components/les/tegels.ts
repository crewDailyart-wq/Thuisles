/**
 * De getaltegels van de uitleglessen (oktober 2026), zoals bij Synthesis.
 *
 * Elke tegel is twee hokjes breed. Een even getal is een rechthoek; een oneven
 * getal heeft er één hokje bovenop, rechts. Legt het kind een oneven tegel op
 * een oneven tegel, dan draait de bovenste om en valt dat losse hokje precies
 * in de inham: 3 en 7 worden samen een rechte staaf van 10.
 *
 * Kleuren gemeten op de screenshots van Synthesis (ronde 2).
 */

export const TEGELKLEUR: Record<number, string> = {
  1: "#d92347",
  2: "#ec7b36",
  3: "#fde01a",
  4: "#b9e83f",
  5: "#3fb34f",
  6: "#3bbfe6",
  7: "#4561dc",
  8: "#8a2fb0",
  9: "#c43bc6",
  10: "#ef5d8a",
};

/** Kleur van een getal in de tekst en in de som; boven de 10 gewoon wit. */
export function getalkleur(n: number): string {
  return TEGELKLEUR[n] ?? "#ffffff";
}

/** Een hokje: kolom 0 (links) of 1 (rechts), rij 0 is de onderste. */
export type Hokje = { k: 0 | 1; r: number };

/** De vorm van één losse tegel; `om` = 180 graden gedraaid (los hokje linksonder). */
export function vorm(n: number, om = false): Hokje[] {
  const uit: Hokje[] = [];
  const vol = Math.floor(n / 2);
  const los = n % 2 === 1;
  if (!om) {
    for (let r = 0; r < vol; r++) uit.push({ k: 0, r }, { k: 1, r });
    if (los) uit.push({ k: 1, r: vol });
  } else {
    if (los) uit.push({ k: 0, r: 0 });
    const start = los ? 1 : 0;
    for (let r = 0; r < vol; r++) uit.push({ k: 0, r: r + start }, { k: 1, r: r + start });
  }
  return uit;
}

export function hoogte(n: number): number {
  return Math.ceil(n / 2);
}

/**
 * Tegels op elkaar, van onder naar boven. Per tegel de hokjes binnen de toren.
 *
 * Staat er bovenaan een half rijtje (een oneven tegel), dan vult een oneven
 * tegel erboven de lege plek links. Een even tegel past daar niet in; die komt
 * erboven en het gat blijft.
 */
export function stapel(stukken: number[]): Hokje[][] {
  const uit: Hokje[][] = [];
  let rij = 0; // de eerste rij die nog helemaal leeg is
  let half = false; // bovenste rij heeft alleen rechts een hokje
  for (const n of stukken) {
    const h: Hokje[] = [];
    let over = n;
    if (half && n % 2 === 1) {
      h.push({ k: 0, r: rij - 1 });
      over -= 1;
      half = false;
    } else if (half) {
      half = false;
    }
    while (over >= 2) {
      h.push({ k: 0, r: rij }, { k: 1, r: rij });
      rij++;
      over -= 2;
    }
    if (over === 1) {
      h.push({ k: 1, r: rij });
      rij++;
      half = true;
    }
    uit.push(h);
  }
  return uit;
}

/** Past tegel `n` precies op een toren met deze stukken (geen gat)? */
export function pastOp(stukken: number[], n: number): boolean {
  const som = stukken.reduce((a, b) => a + b, 0);
  return som % 2 === 0 || n % 2 === 1;
}

export function torenhoogte(stukken: number[]): number {
  return Math.max(0, ...stapel(stukken).flat().map((h) => h.r + 1));
}
