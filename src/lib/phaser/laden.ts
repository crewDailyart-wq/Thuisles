/**
 * Phaser één keer laden, voor de hele site (27 oktober 2026, HARDE REGEL 7).
 *
 * Alle lessen, opdrachten en games van Bliepo gebruiken Phaser. Het bestand is
 * groot (±0,6 MB), dus het wordt maar één keer opgehaald: de startpagina laadt
 * het alvast onzichtbaar (`laadPhaserVooraf`), zodat de eerste les ook op een
 * trage telefoon meteen opent. Elke les vraagt het daarna op met `laadPhaser`
 * en krijgt dezelfde, al geladen motor.
 */

/** Meetpunten voor de vloeiendheidscontrole (scripts/vloeiendcontrole.mjs), één vorm voor alle Phaser-schermen. */
declare global {
  interface Window {
    __phaser?: {
      /** Wanneer het eerste Phaser-beeld er stond (performance.now()). */
      klaarOp?: number;
      /** Waar je kunt slepen (pixels van de pagina). */
      sleepPunt?: () => { x: number; y: number };
      /** Laat het scherm `ms` lang zijn animaties spelen (voor schermen zonder slepen). */
      beweeg?: (ms: number) => void;
      [sleutel: string]: unknown;
    };
  }
}

let belofte: Promise<typeof import("phaser")> | null = null;

/** De Phaser-module (één keer geladen, daarna uit het geheugen). */
export function laadPhaser(): Promise<typeof import("phaser")> {
  if (!belofte) {
    belofte = import("phaser").then((m) => (m as unknown as { default?: typeof import("phaser") }).default ?? m);
    /* Lukt het niet (geen verbinding), dan de volgende keer opnieuw proberen. */
    belofte.catch(() => {
      belofte = null;
    });
  }
  return belofte;
}

/**
 * Phaser alvast laden als de browser niets te doen heeft (startpagina). Er
 * verandert niets op het scherm; op een trage of zuinige verbinding
 * (databesparing) slaan we het over.
 */
export function laadPhaserVooraf(): void {
  if (typeof window === "undefined") return;
  const verbinding = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (verbinding?.saveData) return;
  const doe = () => void laadPhaser().catch(() => {});
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(doe, { timeout: 4000 });
  else window.setTimeout(doe, 1500);
}
