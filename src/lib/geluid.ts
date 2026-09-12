/**
 * Kleine geluidjes voor de uitleg: een teltikje en een belletje.
 *
 * Met code gemaakt in plaats van geluidsbestanden: dat scheelt downloaden en
 * werkt overal. Zacht en kort; het kan altijd uit.
 */

let context: AudioContext | null = null;

function krijgContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Maker = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Maker) return null;
    context = new Maker();
  }
  return context;
}

function toon(frequentie: number, duur: number, volume: number) {
  const ctx = krijgContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequentie;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duur + 0.02);
}

/** Zacht tikje bij elk geteld blokje. */
export function tel(): void {
  toon(660, 0.08, 0.06);
}

/** Klein belletje bij het antwoord. */
export function belletje(): void {
  toon(880, 0.18, 0.07);
  setTimeout(() => toon(1320, 0.22, 0.05), 110);
}

/**
 * Kort vrolijk deuntje bij het feestscherm na een goed antwoord.
 *
 * Een stijgend drieklankje (do-mi-sol) met een octaaf eroverheen als afsluiter.
 * Klimmende tonen klinken als "gelukt"; dalende zouden het tegenovergestelde
 * zeggen. Kort gehouden — een halve seconde — want het komt bij elk goed
 * antwoord terug en moet ook bij de twintigste keer niet gaan irriteren.
 */
export function feestje(): void {
  const noten = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  noten.forEach((hz, i) => {
    setTimeout(() => toon(hz, i === noten.length - 1 ? 0.3 : 0.16, 0.07), i * 85);
  });
}

/** Vos leest de zin voor, in het Nederlands. */
export function lees(zin: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const stem = new SpeechSynthesisUtterance(zin);
  stem.lang = "nl-NL";
  stem.rate = 0.95;
  stem.pitch = 1.1;
  window.speechSynthesis.speak(stem);
}

export function stopLezen(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ---------------------------------------------------------------------------
// Voorkeur voor geluid
// ---------------------------------------------------------------------------

/**
 * De aan/uit-stand van het geluid, bewaard op dit apparaat.
 *
 * Bewust een kleine losse opslag buiten React: zo kan een scherm de stand
 * gewoon uitlezen zonder tijdens het opbouwen iets bij te werken.
 */
const SLEUTEL = "thuisles-uitleg-geluid";
const luisteraars = new Set<() => void>();
let stand: boolean | null = null;

export function geluidStaatAan(): boolean {
  if (stand === null) {
    try {
      stand = window.localStorage.getItem(SLEUTEL) !== "uit";
    } catch {
      // Privéstand of geblokkeerde opslag: dan gewoon geluid aan.
      stand = true;
    }
  }
  return stand;
}

/** Op de server is er geen opslag; daar staat het geluid gewoon aan. */
export function geluidOpServer(): boolean {
  return true;
}

export function abonneerGeluid(herteken: () => void): () => void {
  luisteraars.add(herteken);
  return () => {
    luisteraars.delete(herteken);
  };
}

export function zetGeluid(aan: boolean): void {
  stand = aan;
  if (!aan) stopLezen();
  try {
    window.localStorage.setItem(SLEUTEL, aan ? "aan" : "uit");
  } catch {
    // De voorkeur geldt dan alleen deze keer.
  }
  for (const f of luisteraars) f();
}
