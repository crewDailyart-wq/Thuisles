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
const klinkt = new Set<object>();

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

/**
 * Zet de geluidsmeter aan en wacht tot hij echt geluid doorgeeft.
 *
 * Een AudioContext begint vaak "suspended". Zolang hij nog aan het opstarten
 * is, komt er niets uit de luidsprekers; begon een zin in die tijd, dan viel
 * het eerste woordje weg (21 oktober 2026). Geeft false als de browser het
 * niet toestaat (nog niet op het scherm getikt).
 */
export async function bliepoGeluidKlaar(): Promise<boolean> {
  if (typeof window === "undefined" || !haalMeter() || !context) return false;
  if (context.state === "running") return true;
  await Promise.race([context.resume().catch(() => {}), new Promise((r) => setTimeout(r, 400))]);
  /* Na het wachten opnieuw kijken (TypeScript denkt dat de stand niet veranderd kan zijn). */
  return (context.state as AudioContextState) === "running";
}

/**
 * Speelt een helemaal geladen geluid (bijvoorbeeld een mp3) als Bliepo, met
 * eerst `stilte` seconden niets, zodat er nooit een begin wegvalt. Het lijntje
 * beweegt mee. Geeft een functie om te stoppen terug, of null als het zo niet
 * kan (geen Web Audio, of het geluid is niet te lezen): speel het dan op de
 * gewone manier af.
 */
export async function speelBliepoData(
  data: ArrayBuffer,
  {
    stilte = 0.2,
    gestart,
    klaar,
    metGeluid,
  }: { stilte?: number; gestart?: () => void; klaar?: () => void; metGeluid?: (buffer: AudioBuffer) => void } = {},
): Promise<(() => void) | null> {
  if (!(await bliepoGeluidKlaar()) || !context || !meter) return null;
  const buffer = await context.decodeAudioData(data).catch(() => null);
  if (!buffer) return null;
  /* Het uitgepakte geluid, voor wie wil weten waar de spraak zit (woorden oplichten). */
  metGeluid?.(buffer);
  const bron = context.createBufferSource();
  bron.buffer = buffer;
  bron.connect(meter);
  const sleutel = {};
  let gestopt = false;
  const begin = window.setTimeout(() => {
    if (gestopt) return;
    klinkt.add(sleutel);
    gestart?.();
  }, stilte * 1000);
  bron.onended = () => {
    window.clearTimeout(begin);
    klinkt.delete(sleutel);
    bron.disconnect();
    if (!gestopt) klaar?.();
  };
  bron.start(context.currentTime + stilte);
  return () => {
    if (gestopt) return;
    gestopt = true;
    window.clearTimeout(begin);
    klinkt.delete(sleutel);
    try {
      bron.stop();
    } catch {
      /* Was al afgelopen. */
    }
  };
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
