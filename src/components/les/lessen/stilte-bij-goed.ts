/**
 * STILTE BIJ GOED (Sara, 19 november 2026; BOUWREGELS 15.39). Alleen voor de nieuwe gouden lessen.
 *
 * Bliepo hoeft niet bij elk goed antwoord iets te zeggen. Bij een goed antwoord in 1 keer (zonder hulp en zonder
 * tweede poging) is er in ongeveer 1 op de 3 keer ALLEEN het groene scherm (1 seconde), zonder zin. Willekeurig, maar:
 *   - nooit 2 keer achter elkaar zonder zin, ook niet over vragen heen (de kiezer leeft de hele les);
 *   - nooit bij het eerste goede antwoord van de les;
 *   - een goed antwoord na hulp of na een tweede poging krijgt ALTIJD een zin.
 *
 * Zuiver: geen koppeling met het lesscherm, de stem of de database, zodat scripts/stilteregel-controle.ts dit kan
 * naspelen. Het lesscherm (Lesscherm.tsx) gebruikt het bij de gedeelde goed-reactie (bliepoScherm("goed") + de zin erna).
 * nooit-dubbel.ts blijft ongewijzigd.
 */

import { LOF, MOMENT, NAAM_LOF, SNEL, EXTRAVRAGEN, KLOKVRAGEN, UITLEGVRAGEN } from "./squla-klok-gouden-zinnen";
import { ZIN as GETALLENLIJN } from "./squla-getallenlijn-gouden-zinnen";
import { INTRO_VRAGEN as MIN_INTRO } from "./squla-minsommen-gouden-zinnen";

/**
 * Kans op stilte bij een goed antwoord in 1 keer dat stil MAG zijn (dus niet direct na een stilte). Met de regel "nooit
 * 2 keer achter elkaar" komt een kans van 1/2 uit op ongeveer 1 op de 3 van alle goede antwoorden in 1 keer
 * (p / (1 + p) = 1/3). Het controlescript meet dit na.
 */
export const STILTE_KANS = 0.5;

/** Wat de kiezer onthoudt, de hele les lang. */
export type StilteStand = {
  /** Hoeveel goede antwoorden er in deze les al waren (alle soorten). */
  aantalGoed: number;
  /** Was het vorige goede antwoord zonder zin? */
  vorigeStil: boolean;
};

export const BEGIN_STAND: StilteStand = { aantalGoed: 0, vorigeStil: false };

/**
 * DE REGEL, als kleine zuivere functie. `naHulp` = goed na een hint, na een tweede poging of na samen doen.
 * `magStil` = de reactie is een gewone lofreactie die weg mag (zie `isLofReactie`); anders altijd een zin.
 * `toeval` = een getal van 0 tot 1. Geeft terug of Bliepo stil is, en de nieuwe stand.
 */
export function besluitStilte(stand: StilteStand, o: { naHulp: boolean; magStil?: boolean }, toeval: number): { stil: boolean; stand: StilteStand } {
  const eerste = stand.aantalGoed === 0;
  const stil = !eerste && !o.naHulp && o.magStil !== false && !stand.vorigeStil && toeval < STILTE_KANS;
  return { stil, stand: { aantalGoed: stand.aantalGoed + 1, vorigeStil: stil } };
}

export type StilteKiezer = {
  /** Een goed antwoord: true = alleen het groene scherm, geen zin. */
  goed: (o: { naHulp: boolean; magStil?: boolean }) => boolean;
  /**
   * Een goed antwoord waar de les zelf geen zin bij zei (bijvoorbeeld een tussenstap). Telt mee als "zonder zin", zodat
   * het volgende goede antwoord zeker een zin krijgt (nooit 2 keer achter elkaar zonder zin).
   */
  goedZonderZin: () => void;
  stand: () => StilteStand;
};

export function maakStilteKiezer(o: { toeval?: () => number } = {}): StilteKiezer {
  const toeval = o.toeval ?? Math.random;
  let stand = BEGIN_STAND;
  return {
    goed(x) {
      const r = besluitStilte(stand, x, toeval());
      stand = r.stand;
      return r.stil;
    },
    goedZonderZin() {
      stand = { aantalGoed: stand.aantalGoed + 1, vorigeStil: true };
    },
    stand: () => stand,
  };
}

/* ---------- Is de zin na goed een gewone lofreactie? ---------- */

/** Zonder kleurcode en sterretjes, kleine letters, enkele spaties. */
const kaal = (z: string) =>
  z
    .replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1")
    .replace(/\*/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const escape = (z: string) => z.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Lofzinnen uit het gedeelde rijtje (BLIEPO-KARAKTER.md): LOF, de lof voor speciale momenten, lof met naam, "snel". */
const LOFZINNEN: RegExp[] = [...LOF.zinnen, ...Object.values(MOMENT).flatMap((r) => r.zinnen), ...NAAM_LOF.zinnen, ...SNEL.zinnen].map(
  (z) => new RegExp(`^${escape(kaal(z)).replace(/\\\{naam\\\}|\{naam\}/g, ".{0,40}?")}`),
);

/**
 * Zinnen die nooit weg mogen, ook niet als ze na een lofzin komen: de uitleg waarom iets klopt in de uitlegdelen
 * (CLAUDE.md, Nee-route stap 5: "bevestigen én kort uitleggen waarom het klopt") en de weetjes van de klok.
 */
const BESCHERMD = new Set(
  [
    ...[...UITLEGVRAGEN, ...KLOKVRAGEN, ...EXTRAVRAGEN].flatMap((v) => v.naGoed ?? []),
    ...GETALLENLIJN.uitlegWaarom,
    ...MIN_INTRO.flatMap((v) => v.goedReactie),
  ].flatMap((z) => losseZinnen(z)),
);

function losseZinnen(z: string): string[] {
  return kaal(z)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Een zin die het kind iets laat doen, iets vraagt of iets uitlegt: die mag nooit weg. */
const DOEN = /^(tik|kies|sleep|typ|zet|leg|kijk|kom|tel|zoek|maak|luister|laten we|nu jij|wat|welk|welke|hoeveel|waar|wie|hoe)\b/;
const UITLEG = /\b(samen|daarom|want|omdat|dus)\b/;

/**
 * Is dit de gewone reactie na een goed antwoord in 1 keer, die weg mag? Ja als de eerste zin met een lofzin uit het
 * gedeelde rijtje begint, en er na de lof hoogstens 1 korte zin komt zonder vraag, opdracht of uitleg. Een bevestiging
 * na een fout ("Ja, nu is het goed.") of een samen-zin is geen lofreactie: die blijft altijd.
 */
export function isLofReactie(zinnen: readonly string[]): boolean {
  const alle = zinnen.flatMap((z) => losseZinnen(z));
  if (!alle.length) return false;
  const tekst = alle.join(" ");
  const lof = LOFZINNEN.map((re) => tekst.match(re)?.[0]).find(Boolean);
  if (!lof) return false;
  const rest = losseZinnen(tekst.slice(lof.length));
  if (rest.length > 1) return false;
  return rest.every((z) => !z.includes("?") && !DOEN.test(z) && !UITLEG.test(z) && !BESCHERMD.has(z) && z.length <= 90);
}
