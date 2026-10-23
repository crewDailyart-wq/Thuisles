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

/*
  Hoe hard klinkt Bliepo nu, voor het lijntje (23 oktober 2026, opdracht
  eigenaar: "het lijntje beweegt niet goed mee"). Gemeten met een echte zin
  van Ruth:
    - het lijntje keek naar maar 512 samples (een honderdste seconde); daardoor
      sprong het niveau elk beeldje willekeurig op en neer, niet per lettergreep;
    - daarna werd het zo afgevlakt en recht doorgerekend dat luid en zacht
      bijna even groot werden (meestal tussen 30 en 55 procent);
    - op telefoon tekende het lijntje losse samples van de golf: ruis, niet hoe
      hard het klinkt.
  Nu: de hele meter (1024 samples, precieze getallen), omgerekend in decibel
  zoals een oor hoort, met een snelle aanzet (12 ms) en een korte uitloop
  (70 ms). Zo springt het lijntje met elke lettergreep, groot bij luide en
  klein bij zachte klanken, en zakt het in een pauze meteen terug. Een
  langzaam meelopende bovengrens zorgt dat een zachtere of hardere opname
  net zo goed beweegt.
*/
let vlak: Float32Array<ArrayBuffer> | null = null;
let omhulsel = 0;
let piek = -14;
let vorigeMeting = 0;

/** Hoe hard klinkt Bliepo nu (0 = stil, 1 = hard), of null als er geen geluid van hem speelt. */
export function bliepoStemNiveau(): number | null {
  if (!meter || klinkt.size === 0) {
    omhulsel = 0;
    return null;
  }
  const nu = performance.now();
  const dt = Math.min(0.1, (nu - vorigeMeting) / 1000);
  /* Twee keer in hetzelfde beeldje (3D-Bliepo én lijntje): dezelfde waarde. */
  if (dt < 0.004) return omhulsel;
  vorigeMeting = nu;
  if (!vlak || vlak.length !== meter.fftSize) vlak = new Float32Array(new ArrayBuffer(meter.fftSize * 4));
  let som = 0;
  if (typeof meter.getFloatTimeDomainData === "function") {
    meter.getFloatTimeDomainData(vlak);
    for (let i = 0; i < vlak.length; i++) som += vlak[i] * vlak[i];
  } else {
    const b = new Uint8Array(new ArrayBuffer(meter.fftSize));
    (meter as AnalyserNode).getByteTimeDomainData(b);
    for (let i = 0; i < b.length; i++) som += ((b[i] - 128) / 128) ** 2;
  }
  const db = 20 * Math.log10(Math.sqrt(som / vlak.length) + 1e-6);
  piek = Math.max(db, piek - 3 * dt, -24);
  const boven = Math.min(-6, piek + 1);
  const doel = Math.min(1, Math.max(0, (db - (boven - 30)) / 30));
  const tijd = doel > omhulsel ? 0.012 : 0.07;
  omhulsel += (doel - omhulsel) * (1 - Math.exp(-Math.max(dt, 0.001) / tijd));
  return omhulsel;
}
