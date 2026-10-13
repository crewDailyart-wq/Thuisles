/**
 * De voortgang van het kind bij Zappie: punten en voltooide missies per wereld.
 *
 * Alleen rekenregels, geen opslag. Waar de voortgang bewaard wordt, staat in
 * `opslag.ts`; zo kan die later naar de database zonder dat hier iets
 * verandert.
 */

import { WERELDEN, type Wereld, type WereldId } from "@/lib/zappie/werelden";

/**
 * Wat er net verdiend is, zodat de startpagina het kan laten zien: tokens die
 * bijtellen, een lichtje dat naar de wereld vliegt, een plek die vrijkomt.
 * Wordt gewist zodra de startpagina het heeft laten zien.
 */
export type Gebeurtenis = {
  tokens: number;
  wereld: WereldId;
  /** Telde de missie mee voor de wereld? Een vrije missie niet. */
  vrij: boolean;
  /** Hoeveel plekken in Jouw wereld er door deze missie vrijkwamen. */
  nieuwePlekken: number;
  tijd: number;
};

export type Voortgang = {
  /** Alle verdiende tokens samen (heette eerst Zappie-punten). */
  punten: number;
  /** Hoeveel tokens de teller het laatst heeft laten zien; daarvandaan telt hij op. */
  getoond: number;
  /** Voltooide missies per wereld. */
  missies: Record<WereldId, number>;
  gebeurtenis: Gebeurtenis | null;
};

export const LEGE_VOORTGANG: Voortgang = {
  punten: 0,
  getoond: 0,
  missies: { oceaan: 0, aarde: 0, heelal: 0 },
  gebeurtenis: null,
};

/** Om de zoveel tokens komt er een nieuwe plek vrij in Jouw wereld. */
export const TOKENS_PER_PLEK = 250;

/** Hoeveel plekken er vrij zijn en hoe ver het kind is op weg naar de volgende. */
export function beloningStand(tokens: number) {
  const t = Math.max(0, Math.floor(tokens));
  return {
    vrijePlekken: Math.floor(t / TOKENS_PER_PLEK),
    opWeg: t % TOKENS_PER_PLEK,
    stap: TOKENS_PER_PLEK,
  };
}

/** Punten voor een som die meteen goed is. */
export const PUNTEN_DIRECT = 10;
/** Punten voor een som die bij de tweede poging goed is. */
export const PUNTEN_TWEEDE_KEER = 5;
/** Extra punten voor het afmaken van een missie. */
export const PUNTEN_MISSIE = 50;

export type WereldStand = {
  wereld: Wereld;
  open: boolean;
  klaar: number;
  /** Is dit de wereld waar het kind nu missies doet? */
  huidig: boolean;
  /** Hoeveel missies er in de wereld ervoor nog nodig zijn om deze te openen. */
  nogNodig: number;
};

/**
 * De stand van elke wereld. Een wereld is open als alle missies van de wereld
 * ervoor klaar zijn. De huidige wereld is de eerste open wereld die nog niet af
 * is; zijn alle werelden af, dan blijft het de laatste.
 */
export function wereldStanden(v: Voortgang): WereldStand[] {
  const standen: WereldStand[] = [];
  let vorigeAf = true;
  let vorigeOver = 0;
  for (const wereld of WERELDEN) {
    const klaar = Math.min(wereld.missies, Math.max(0, v.missies[wereld.id] ?? 0));
    standen.push({ wereld, open: vorigeAf, klaar, huidig: false, nogNodig: vorigeAf ? 0 : vorigeOver });
    vorigeAf = vorigeAf && klaar >= wereld.missies;
    vorigeOver = wereld.missies - klaar;
  }
  const huidig =
    standen.find((s) => s.open && s.klaar < s.wereld.missies) ?? standen.filter((s) => s.open).at(-1);
  if (huidig) huidig.huidig = true;
  return standen;
}

export function huidigeWereld(v: Voortgang): WereldStand {
  return wereldStanden(v).find((s) => s.huidig)!;
}

/** Het nummer van de volgende missie in de huidige wereld (1 = de eerste). */
export function volgendeMissie(v: Voortgang): { wereld: WereldId; nummer: number } {
  const s = huidigeWereld(v);
  return { wereld: s.wereld.id, nummer: Math.min(s.klaar + 1, s.wereld.missies) };
}

/**
 * Een missie afmaken: tokens erbij, en de missie telt mee in die wereld.
 * Een vrije missie geeft alleen tokens.
 */
export function metVoltooideMissie(
  v: Voortgang,
  wereld: WereldId,
  verdiend: number,
  vrij = false,
  tijd = Date.now(),
): Voortgang {
  const w = WERELDEN.find((x) => x.id === wereld);
  const nu = v.missies[wereld] ?? 0;
  const erbij = Math.max(0, Math.round(verdiend));
  const punten = v.punten + erbij;
  return {
    ...v,
    punten,
    missies: vrij ? v.missies : { ...v.missies, [wereld]: Math.min(w?.missies ?? nu + 1, nu + 1) },
    gebeurtenis: {
      tokens: erbij,
      wereld,
      vrij,
      nieuwePlekken: beloningStand(punten).vrijePlekken - beloningStand(v.punten).vrijePlekken,
      tijd,
    },
  };
}

/** "1.250": punten zoals een Nederlands kind ze leest. */
export function puntenTekst(n: number): string {
  return Math.round(n).toLocaleString("nl-NL");
}
