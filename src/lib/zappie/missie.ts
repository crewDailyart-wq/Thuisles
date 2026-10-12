/**
 * De sommen van een Zappie-missie voor groep 3.
 *
 * Eerste fase: in de Oceaan wisselen de missies af tussen plussommen en
 * minsommen tot en met 10. De sommen worden bij het openen gemaakt en staan
 * alleen in het geheugen: er komt niets in de database (HARDE REGEL 2).
 *
 * Volgens ONTWERPREGELS.md: 15 sommen per missie, geen dubbele, elke som
 * precies één goed antwoord, en de getallen vooral in het bovenste deel van
 * het bereik.
 */

export type Teken = "+" | "−";

export type Som = {
  a: number;
  b: number;
  teken: Teken;
  antwoord: number;
};

export type MissieSoort = "plus" | "min";

export const SOMMEN_PER_MISSIE = 15;
/** Zoveel sommen aan het begin laten de bolletjes meteen zien (standaard 3). */
export const VISUELE_SOMMEN = 3;

export function soortVanMissie(nummer: number): MissieSoort {
  return nummer % 2 === 1 ? "plus" : "min";
}

export const MISSIENAAM: Record<MissieSoort, string> = {
  plus: "Plussommen tot en met 10",
  min: "Minsommen tot en met 10",
};

/** Alle sommen van een soort, de bovenste helft van het bereik eerst. */
function kandidaten(soort: MissieSoort): { boven: Som[]; onder: Som[] } {
  const boven: Som[] = [];
  const onder: Som[] = [];
  if (soort === "plus") {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; a + b <= 10; b++) {
        (a + b >= 6 ? boven : onder).push({ a, b, teken: "+", antwoord: a + b });
      }
    }
  } else {
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b < a; b++) {
        (a >= 6 ? boven : onder).push({ a, b, teken: "−", antwoord: a - b });
      }
    }
  }
  return { boven, onder };
}

function schud<T>(lijst: T[], kans: () => number): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(kans() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** 15 verschillende sommen; eerst uit de bovenste helft, pas als die op is lager. */
export function maakSommen(soort: MissieSoort, kans: () => number = Math.random): Som[] {
  const { boven, onder } = kandidaten(soort);
  return [...schud(boven, kans), ...schud(onder, kans)].slice(0, SOMMEN_PER_MISSIE);
}
