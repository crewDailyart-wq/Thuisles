/**
 * HET GELUIDSSYSTEEM VAN DE GOUDEN LESSEN (Sara, 19 november 2026; BOUWREGELS 15.40).
 * Ook bereikbaar als `speelGeluid` uit lib/geluid.ts (daar staat een doorverwijzing; de oude geluidjes daar blijven).
 *
 * Vaste geluidsplekken. Elke plek is precies 1 bestand in public/geluiden/. Vervangen = dat ene bestand overschrijven
 * met een nieuw bestand met dezelfde naam (zie public/geluiden/LEES-MIJ.md). Er hoeft dan niets in de code te veranderen.
 *
 *   goed-in-een-keer  public/geluiden/goed.wav           goed antwoord in 1 keer
 *   goed-na-hulp      public/geluiden/goed-na-hulp.wav   goed na een hint, een tweede poging of samen doen
 *   nog-niet-goed     public/geluiden/nog-niet-goed.wav  nog niet goed (heel zacht en neutraal, nooit een zoemer)
 *   beloning          public/geluiden/beloning.wav       VOOR LATER (DESIGN-LATER.md: een beloning, zoals een sleutel).
 *                                                         Er is nu alleen de plek; niets speelt hem af.
 *
 * De tijdelijke geluiden zijn met code gemaakt (scripts/maak-geluiden.mjs), vrij te gebruiken.
 *
 * Regels:
 *   - Alleen in de nieuwe gouden lessen (het lesscherm zet het aan met `zetGeluidenAan`).
 *   - Pas na de eerste tik van het kind (de browser laat eerder geen geluid toe; dezelfde controle als de stem,
 *     lib/stem.ts `magGeluid`). Vóór de eerste tik: geen geluid, en de les gaat gewoon door.
 *   - Volgt de geluidsknop bovenin (de knop "Geluidjes aan/uit", lib/lesgeluiden.ts) en de instelling van de ouder
 *     ("Geluidjes in de lessen"). Staat die uit, dan klinkt er niets. De stem van Bliepo staat daar los van.
 *   - `speelGeluid` geeft een belofte: klaar als het geluid op is, of uiterlijk na `MAX_WACHT_MS` (zo wacht Bliepo's zin
 *     nooit lang). Lukt afspelen niet, dan is hij meteen klaar.
 */

import { magGeluid } from "@/lib/stem";
import { geluidjesAan, geluidjesVanOuder } from "@/lib/lesgeluiden";

export type Geluidsplek = "goed-in-een-keer" | "goed-na-hulp" | "nog-niet-goed" | "beloning";

/** Plek -> bestand. Eén vaste naam en extensie per plek. */
export const GELUIDSBESTAND: Record<Geluidsplek, string> = {
  "goed-in-een-keer": "/geluiden/goed.wav",
  "goed-na-hulp": "/geluiden/goed-na-hulp.wav",
  "nog-niet-goed": "/geluiden/nog-niet-goed.wav",
  beloning: "/geluiden/beloning.wav",
};

/** Hoe lang Bliepo's zin hooguit op het geluid wacht (Sara: de totale vertraging onder ongeveer 0,6 s). */
export const MAX_WACHT_MS = 550;

/** Iets zachter dan het bestand zelf, zodat ook een vervangen geluid niet hard binnenkomt. */
const VOLUME = 0.7;

let aan = false;
let uitVoorTest = false;
const spelers = new Map<Geluidsplek, HTMLAudioElement>();
/** Voor de controlescripts: wat er gespeeld (of overgeslagen) is. */
type Logregel = { t: number; plek: Geluidsplek; gespeeld: boolean; reden?: string };

function logboek(r: Logregel) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __geluiden?: Logregel[] };
  (w.__geluiden ??= []).push(r);
}

/** Het lesscherm zet de geluiden aan in een gouden les (en weer uit als de les sluit). Laadt ze alvast klein vooraf. */
export function zetGeluidenAan(waarde: boolean): void {
  aan = waarde;
  if (!waarde || typeof window === "undefined" || typeof Audio === "undefined") return;
  for (const plek of ["goed-in-een-keer", "goed-na-hulp", "nog-niet-goed"] as const) {
    if (spelers.has(plek)) continue;
    try {
      const a = new Audio(GELUIDSBESTAND[plek]);
      a.preload = "auto";
      a.volume = VOLUME;
      spelers.set(plek, a);
    } catch {
      /* Geen geluid op dit apparaat: dan gewoon stil. */
    }
  }
}

/** Staan de geluiden van de gouden les aan? (Alleen het lesscherm zet dit.) */
export const geluidenStaanAan = (): boolean => aan;

/** Geluiden uit (bijvoorbeeld in een test). */
export function geluidenUit(waarde: boolean): void {
  uitVoorTest = waarde;
}

/** Mag er nu een geluid klinken? (gouden les, na de eerste tik, geluidsknop en ouder aan) */
export function magGeluidSpelen(): boolean {
  if (typeof window === "undefined" || !aan || uitVoorTest) return false;
  return magGeluid() && geluidjesAan() && geluidjesVanOuder();
}

/** Speelt het geluid van een plek. Klaar als het op is, of uiterlijk na MAX_WACHT_MS; meteen klaar als er niets klinkt. */
export function speelGeluid(plek: Geluidsplek): Promise<void> {
  const t = typeof performance !== "undefined" ? Math.round(performance.now()) : 0;
  if (!magGeluidSpelen()) {
    logboek({ t, plek, gespeeld: false, reden: !aan ? "geen gouden les" : !magGeluid() ? "nog geen tik" : "geluid uit" });
    return Promise.resolve();
  }
  let a = spelers.get(plek);
  if (!a) {
    try {
      a = new Audio(GELUIDSBESTAND[plek]);
      a.volume = VOLUME;
      spelers.set(plek, a);
    } catch {
      return Promise.resolve();
    }
  }
  const speler = a;
  return new Promise<void>((klaar) => {
    let gedaan = false;
    const einde = () => {
      if (gedaan) return;
      gedaan = true;
      clearTimeout(vangnet);
      speler.removeEventListener("ended", einde);
      speler.removeEventListener("error", einde);
      klaar();
    };
    const vangnet = setTimeout(einde, MAX_WACHT_MS);
    speler.addEventListener("ended", einde);
    speler.addEventListener("error", einde);
    try {
      speler.pause();
      speler.currentTime = 0;
      const p = speler.play();
      logboek({ t, plek, gespeeld: true });
      if (p && typeof p.catch === "function") p.catch(einde);
    } catch {
      einde();
    }
  });
}
