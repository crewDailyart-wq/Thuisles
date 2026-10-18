/**
 * Het geluid van Bliepo, zodat het lijntje op zijn scherm kan meebewegen
 * (18 oktober 2026, opdracht eigenaar).
 *
 * Elk geluid dat Bliepo afspeelt, gaat via `koppelBliepoGeluid` (of
 * `speelBliepoGeluid`) door één geluidsmeter (Web Audio, AnalyserNode). Het
 * lijntje (components/avontuur/BliepoLijn.tsx) leest die meter elk beeldje uit:
 * klinkt er iets, dan springt het lijntje mee op het geluid; is het stil, dan
 * wordt het weer een rustig hartslaglijntje.
 *
 * De stem van de server (lib/stem.ts, `speelVanServer`) loopt hier al
 * doorheen. Komt de stem er straks bij, dan beweegt het lijntje vanzelf mee.
 * De browserstem (speechSynthesis) kan de browser niet laten meten; dan
 * beweegt het lijntje op een nagebootst praatritme zolang hij praat.
 *
 * Het geluid zelf verandert niet: de meter luistert alleen mee en geeft alles
 * ongewijzigd door aan de luidsprekers.
 */

let context: AudioContext | null = null;
let meter: AnalyserNode | null = null;
const gekoppeld = new WeakSet<HTMLMediaElement>();
const klinkt = new Set<HTMLMediaElement>();

function haalMeter(): AnalyserNode | null {
  if (meter) return meter;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  context = new Ctx();
  meter = context.createAnalyser();
  meter.fftSize = 1024;
  meter.smoothingTimeConstant = 0.6;
  meter.connect(context.destination);
  return meter;
}

/** Laat het lijntje meebewegen met dit geluid. Geeft hetzelfde element terug. */
export function koppelBliepoGeluid<E extends HTMLMediaElement>(geluid: E): E {
  if (typeof window === "undefined" || gekoppeld.has(geluid)) return geluid;
  gekoppeld.add(geluid);
  try {
    const m = haalMeter();
    if (m && context) {
      context.createMediaElementSource(geluid).connect(m);
      /* Na een tik mag de browser geluid maken; de meter moet dan ook aan staan. */
      const wakker = () => {
        if (context?.state === "suspended") void context.resume();
      };
      geluid.addEventListener("play", wakker);
      wakker();
    }
  } catch {
    /* Geen Web Audio: het geluid speelt gewoon, het lijntje praat dan op ritme mee. */
  }
  const aan = () => klinkt.add(geluid);
  const uit = () => klinkt.delete(geluid);
  geluid.addEventListener("playing", aan);
  geluid.addEventListener("pause", uit);
  geluid.addEventListener("ended", uit);
  geluid.addEventListener("emptied", uit);
  geluid.addEventListener("error", uit);
  return geluid;
}

/** Speel een geluid af als Bliepo (het lijntje beweegt mee). */
export function speelBliepoGeluid(bron: string): HTMLAudioElement {
  const geluid = koppelBliepoGeluid(new Audio(bron));
  void geluid.play().catch(() => {});
  return geluid;
}

/** Speelt er nu een geluid van Bliepo? */
export function bliepoGeluidKlinkt(): boolean {
  return klinkt.size > 0;
}

/**
 * Vult `golf` met de geluidsgolf van dit moment (128 = stil, 0 en 255 = hard).
 * Geeft false als er niets te meten valt.
 */
export function leesBliepoGolf(golf: Uint8Array<ArrayBuffer>): boolean {
  if (!meter || klinkt.size === 0) return false;
  meter.getByteTimeDomainData(golf);
  return true;
}
