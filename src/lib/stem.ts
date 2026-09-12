/**
 * De stem van Vos.
 *
 * Eén plek voor alles wat met praten te maken heeft. De rest van de app roept
 * alleen `zeg()` aan en weet niet wáár het geluid vandaan komt.
 *
 * Nu: de stem die in de browser zit (gratis, werkt overal, geen verbinding
 * nodig). Van de beschikbare Nederlandse stemmen wordt automatisch de beste
 * vrouwelijke gekozen — mannelijke en vlakke stemmen worden vermeden.
 *
 * Later: een echte stemdienst met een vrolijke kinderstem. Die schakelaar
 * staat hieronder al klaar (`BRON`). De opzet is dan: elke unieke zin wordt
 * één keer op de server gemaakt en bewaard, en het apparaat van het kind haalt
 * alleen dat bewaarde geluid op. Zo praat het kind nooit rechtstreeks met die
 * dienst en betalen we per zin maar één keer.
 */

// ---------------------------------------------------------------------------
// Welke bron gebruiken we?
// ---------------------------------------------------------------------------

type Bron = "browser" | "server";

/** Omzetten naar "server" zodra de stemdienst er is. Verder verandert niets. */
const BRON: Bron = "browser";

/** Waar de vooraf gemaakte zinnen straks vandaan komen. */
const SERVER_PAD = "/api/stem";

// ---------------------------------------------------------------------------
// De beste Nederlandse vrouwenstem kiezen
// ---------------------------------------------------------------------------

/** Stemmen die we herkennen als vrouwelijk en prettig voor kinderen. */
const VROUWELIJK = [
  "claire", "ellen", "fenna", "colette", "saskia", "lotte", "femke", "hanna",
  "laura", "anna", "marieke", "nicky", "google nederlands",
];

/** Stemmen die we liever niet gebruiken. */
const MANNELIJK = ["xander", "maarten", "frank", "ruben", "daan", "bart"];

/** Woorden die op een betere, natuurlijker klinkende variant wijzen. */
const BETER = ["enhanced", "premium", "natural", "neural", "wavenet", "network"];

export type Stemkeuze = {
  stem: SpeechSynthesisVoice | null;
  score: number;
  reden: string;
};

function beoordeel(stem: SpeechSynthesisVoice): { score: number; reden: string[] } {
  const naam = stem.name.toLowerCase();
  const uri = (stem.voiceURI ?? "").toLowerCase();
  const redenen: string[] = [];
  let score = 0;

  if (VROUWELIJK.some((n) => naam.includes(n))) {
    score += 100;
    redenen.push("vrouwelijke stem");
  }
  if (MANNELIJK.some((n) => naam.includes(n))) {
    score -= 120;
    redenen.push("mannelijke stem");
  }
  if (BETER.some((w) => naam.includes(w) || uri.includes(w))) {
    score += 45;
    redenen.push("betere variant");
  }
  if (stem.lang.toLowerCase() === "nl-nl") {
    score += 25;
    redenen.push("Nederlands (NL)");
  } else if (stem.lang.toLowerCase().startsWith("nl")) {
    score += 12;
    redenen.push("Nederlands (BE)");
  }
  if (!stem.localService) {
    score += 8;
    redenen.push("netwerkstem");
  }

  return { score, reden: redenen };
}

/** Alle Nederlandse stemmen op dit apparaat, met hun beoordeling. */
export function beoordeelStemmen(): { stem: SpeechSynthesisVoice; score: number; reden: string }[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];

  return window.speechSynthesis
    .getVoices()
    .filter((s) => s.lang.toLowerCase().startsWith("nl"))
    .map((stem) => {
      const { score, reden } = beoordeel(stem);
      return { stem, score, reden: reden.join(", ") || "geen kenmerken herkend" };
    })
    .sort((a, b) => b.score - a.score);
}

let gekozen: SpeechSynthesisVoice | null = null;

export function kiesStem(): Stemkeuze {
  const lijst = beoordeelStemmen();
  if (lijst.length === 0) return { stem: null, score: 0, reden: "geen Nederlandse stem gevonden" };
  gekozen = lijst[0].stem;
  return { stem: lijst[0].stem, score: lijst[0].score, reden: lijst[0].reden };
}

// ---------------------------------------------------------------------------
// Praten
// ---------------------------------------------------------------------------

/**
 * Iets langzamer en warmer dan standaard, met een licht hogere toon. Dat
 * klinkt vriendelijker en geduldiger voor jonge kinderen.
 */
const TEMPO = 0.88;
const TOONHOOGTE = 1.2;

const luisteraars = new Set<() => void>();
let praatNu = false;

function meld(bezig: boolean) {
  praatNu = bezig;
  for (const f of luisteraars) f();
}

/** Praat Vos op dit moment? Hiermee beweegt de mond mee. */
export function praatVos(): boolean {
  return praatNu;
}

export function praatOpServer(): boolean {
  return false;
}

export function abonneerPraten(herteken: () => void): () => void {
  luisteraars.add(herteken);
  return () => {
    luisteraars.delete(herteken);
  };
}

/**
 * Laat Vos een zin zeggen.
 *
 * Bij de browserstem regelt `speechSynthesis` het geluid. Bij een stemdienst
 * wordt straks een vooraf gemaakt geluidsbestand afgespeeld; de rest van de
 * app merkt daar niets van.
 */
export function zeg(zin: string): void {
  if (typeof window === "undefined") return;

  if (BRON === "server") {
    speelVanServer(zin);
    return;
  }

  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  if (!gekozen) kiesStem();

  const uiting = new SpeechSynthesisUtterance(zin);
  uiting.lang = "nl-NL";
  uiting.rate = TEMPO;
  uiting.pitch = TOONHOOGTE;
  if (gekozen) uiting.voice = gekozen;

  uiting.onstart = () => meld(true);
  uiting.onend = () => meld(false);
  uiting.onerror = () => meld(false);

  window.speechSynthesis.speak(uiting);
}

export function stopPraten(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  huidigGeluid?.pause();
  meld(false);
}

// ---------------------------------------------------------------------------
// Voorbereid: geluid van de server
// ---------------------------------------------------------------------------

let huidigGeluid: HTMLAudioElement | null = null;
/** Zinnen die al eens zijn opgehaald, zodat er nooit dubbel wordt gevraagd. */
const opgehaald = new Map<string, string>();

function speelVanServer(zin: string): void {
  huidigGeluid?.pause();

  const bekend = opgehaald.get(zin);
  const bron = bekend ?? `${SERVER_PAD}?zin=${encodeURIComponent(zin)}`;
  if (!bekend) opgehaald.set(zin, bron);

  const geluid = new Audio(bron);
  huidigGeluid = geluid;
  geluid.onplay = () => meld(true);
  geluid.onended = () => meld(false);
  geluid.onerror = () => meld(false);
  void geluid.play().catch(() => meld(false));
}
