/**
 * Is er in dit bezoek al een profiel gekozen op "Wie gaat er oefenen?"
 * (23 oktober 2026)? Alleen in het geheugen van deze pagina: na openen of
 * verversen staat het weer op nee, zodat het scherm dan eerst verschijnt. Bij
 * gewoon doorklikken binnen de site blijft het ja.
 */

let gekozen = false;
let viaProfiel = false;
const luisteraars = new Set<() => void>();

export const profielGekozen = () => gekozen;
export const binnenViaProfiel = () => viaProfiel;

export function zetProfielGekozen() {
  gekozen = true;
  viaProfiel = true;
  for (const f of luisteraars) f();
}

export function abonneerProfielkeuze(f: () => void) {
  luisteraars.add(f);
  return () => {
    luisteraars.delete(f);
  };
}

/** Een heel kort stil geluidje: speelt het binnen de tik, dan mag de pagina daarna geluid maken (ook op iPhone). */
const STIL =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

/**
 * Het geluid vrijgeven, binnen de tik van het kind: de geluidsmeter van Bliepo
 * (AudioContext) aanzetten en een stil geluidje afspelen. Moet direct in de
 * klik gebeuren, vóór er op iets gewacht wordt.
 */
export function ontgrendelGeluid(aanzetten: () => unknown) {
  try {
    void aanzetten();
  } catch {
    /* Geen Web Audio: dan alleen het audio-element. */
  }
  try {
    const a = new Audio(STIL);
    a.volume = 0;
    void a.play().catch(() => {});
  } catch {
    /* Geen audio-element: niets aan te doen. */
  }
}
