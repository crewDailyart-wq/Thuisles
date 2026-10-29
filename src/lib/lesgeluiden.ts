/**
 * Eigen geluidjes voor de nagebouwde lessen (28 oktober 2026, opdracht eigenaar).
 *
 * Synthesis laat op vaste momenten een geluidje horen (nieuwe beurt, een keuze
 * aanklikken, goed, niet goed, plaatjes die in beeld schuiven, een getal dat naar
 * de som gaat, een vogel die wegvliegt, enz.). Wij doen dat op dezelfde momenten,
 * met eigen geluidjes die hier met code worden gemaakt (geen bestanden, niets
 * van Synthesis). Zacht en kort. LEGAL REVIEW REQUIRED voor de lancering: de
 * momenten zijn van Synthesis overgenomen, de klanken zijn eigen werk.
 */

import { abonneerPraten, praatVos } from "@/lib/stem";

export type Lesgeluid =
  | "beurt" // nieuwe beurt van Bliepo na de pijl of na bevestigen
  | "keuze" // een keuze aanklikken (nog niet bevestigd)
  | "mis" // een woord of zin aangetikt dat niet het goede is
  | "terug" // een verkeerd gekozen woord wordt weer wit
  | "goed" // goed aangetikt (getal, zin, signaalwoord)
  | "schuif" // plaatjes schuiven in beeld (som-stap)
  | "naarSom" // een gekozen getal gaat naar de som
  | "antwoord" // een antwoord gekozen
  | "vlieg" // een vogeltje vliegt weg
  | "groei" // er groeit een bloem
  | "knal" // een ballon knapt
  | "lamp" // een lamp gaat uit of aan
  | "munt" // een munt uitgeven
  | "kaart" // de kaart aan het eind
  | "markeer" // Bliepo maakt zelf een hulpzin groen (Synthesis Mixed Problems, 1,15 s)
  /* Kloklessen (28 oktober 2026; momenten van Synthesis, klanken eigen werk; LEGAL REVIEW REQUIRED): */
  | "wijzerTik" // een wijzer springt naar een getikt getal (±0,5 s)
  | "wijzerKlik" // een wijzer komt aan op zijn plek of klikt vast na slepen (±0,5 s)
  | "plop" // iets verschijnt op de klok: wijzers, een vlaggetje, Sam (±0,12 s)
  | "klokDraai" // de klok verandert van vorm of springt naar een bijzondere tijd (±1,5 s)
  /* Erbij op 29 oktober 2026 (geluidsbestanden, zie GELUIDEN-BRONNEN.md; LEGAL REVIEW REQUIRED voor de momenten): */
  | "tik" // een heel kort tikje (iets aantikken)
  | "knop" // een knop indrukken in de kindomgeving (plopje, iets duidelijker dan tik)
  | "verschijn" // plaatjes of iets anders verschijnt
  /* Sfeergeluidjes aan het begin van een verhaal (Synthesis: vogeltjes bij het vogelverhaal, 2,0 s, zacht). */
  | "sfeerVogels"
  | "sfeerBloemen"
  | "sfeerBallonnen"
  | "sfeerLampen"
  | "sfeerMunten"
  | "sfeerVuurvliegjes"
  | "sfeerLantaarns"
  | "sfeerPaddenstoelen";

let ctx: AudioContext | null = null;
let uit = false;
/* Alleen in de nagebouwde lessen (het lesscherm zet dit aan). */
let aan = false;
export function zetLesgeluiden(waarde: boolean): void {
  aan = waarde;
  /* Vooraf en klein laden, zodra een nagebouwde les opent (regel 7: geen hapering bij het eerste geluidje). */
  if (waarde) laadBestanden();
}

/** Geluidjes uit (bijvoorbeeld in een test). */
export function lesgeluidenUit(waarde: boolean): void {
  uit = waarde;
}

function motor(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Maker = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Maker) return null;
    ctx = new Maker();
  }
  return ctx;
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  const wek = () => motor()?.resume().catch(() => {});
  window.addEventListener("pointerdown", wek, { capture: true });
  window.addEventListener("keydown", wek, { capture: true });
}

/* ---------------------------------------------------------------------------
 * Geluidsbestanden (29 oktober 2026, opdracht eigenaar). LATER VERVANGEN.
 *
 * Rechtenvrije geluiden (CC0, zie GELUIDEN-BRONNEN.md), kort, mono en klein in
 * public/geluiden/les/. Ze worden één keer vooraf geladen (fetch +
 * decodeAudioData). Is een bestand er (nog) niet, dan klinkt de klank die
 * hieronder met code wordt gemaakt: die blijft als reserve.
 *
 * `vol` is afgestemd op wat in Synthesis gemeten is (28 okt 2026): hun geluidjes
 * staan op 0,05–0,25 van het volle volume (vogeltjes 0,45 × een zachte opname,
 * samen ±0,11 piek). Onze bestanden hebben een piek van 0,5; `vol` brengt ze op
 * ongeveer dezelfde zachtheid. LEGAL REVIEW REQUIRED: de momenten, lengtes en
 * zachtheid zijn van Synthesis overgenomen; de klanken niet.
 * ------------------------------------------------------------------------- */

const BESTANDEN: Partial<Record<Lesgeluid, { bestand: string; vol: number }>> = {
  beurt: { bestand: "beurt", vol: 0.12 },
  keuze: { bestand: "keuze", vol: 0.12 },
  mis: { bestand: "mis", vol: 0.12 },
  terug: { bestand: "terug", vol: 0.2 },
  goed: { bestand: "goed", vol: 0.34 },
  schuif: { bestand: "schuif", vol: 0.17 },
  naarSom: { bestand: "naar-som", vol: 0.12 },
  antwoord: { bestand: "antwoord", vol: 0.12 },
  vlieg: { bestand: "vlieg", vol: 0.25 },
  groei: { bestand: "groei", vol: 0.3 },
  knal: { bestand: "knal", vol: 0.18 },
  lamp: { bestand: "lamp", vol: 0.12 },
  munt: { bestand: "munt", vol: 0.1 },
  kaart: { bestand: "kaart", vol: 0.3 },
  markeer: { bestand: "markeer", vol: 0.2 },
  wijzerTik: { bestand: "wijzer-tik", vol: 0.16 },
  wijzerKlik: { bestand: "wijzer-klik", vol: 0.1 },
  plop: { bestand: "plop", vol: 0.15 },
  klokDraai: { bestand: "klok-draai", vol: 0.15 },
  tik: { bestand: "tik", vol: 0.1 },
  knop: { bestand: "plop", vol: 0.3 },
  verschijn: { bestand: "verschijn", vol: 0.12 },
  sfeerVogels: { bestand: "sfeer-vogels", vol: 0.3 },
  sfeerBloemen: { bestand: "sfeer-bloemen", vol: 0.3 },
  sfeerBallonnen: { bestand: "sfeer-ballonnen", vol: 0.15 },
  sfeerLampen: { bestand: "sfeer-lampen", vol: 0.3 },
  sfeerMunten: { bestand: "sfeer-munten", vol: 0.3 },
  sfeerVuurvliegjes: { bestand: "sfeer-vuurvliegjes", vol: 0.08 },
  sfeerLantaarns: { bestand: "sfeer-lantaarns", vol: 0.3 },
  sfeerPaddenstoelen: { bestand: "sfeer-paddenstoelen", vol: 0.27 },
};

const MAP = "/geluiden/les/";
const buffers = new Map<Lesgeluid, AudioBuffer>();
let geladen = false;

function laadBestanden(): void {
  if (geladen || typeof window === "undefined" || typeof fetch !== "function") return;
  const c = motor();
  if (!c) return;
  geladen = true;
  const laad = () => {
    for (const [naam, b] of Object.entries(BESTANDEN) as [Lesgeluid, { bestand: string }][]) {
      fetch(`${MAP}${b.bestand}.m4a`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((data) => c.decodeAudioData(data))
        .then((buf) => {
          buffers.set(naam, buf);
        })
        /* Geen bestand: dan klinkt gewoon de gemaakte klank. */
        .catch(() => {});
    }
  };
  /* Pas als de les rustig is, zodat het openen er niet trager door wordt. */
  const w = window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(laad, { timeout: 1500 });
  else setTimeout(laad, 300);
}

/* Eén hoofdknop voor alle geluidjes: zachter als Bliepo praat, op 0 als ze uit staan. */
let hoofd: GainNode | null = null;
function uitgang(c: AudioContext): AudioNode {
  if (!hoofd) {
    hoofd = c.createGain();
    hoofd.gain.value = doelVolume();
    hoofd.connect(c.destination);
  }
  return hoofd;
}

/* Hoe zacht de geluidjes worden zolang Bliepo praat (nooit door de stem heen). */
const ONDER_DE_STEM = 0.2;
let praat = false;
function doelVolume(): number {
  if (!magKlinken()) return 0;
  return praat ? ONDER_DE_STEM : 1;
}
function stelVolumeBij(snel: boolean) {
  if (!hoofd || !ctx) return;
  hoofd.gain.cancelScheduledValues(ctx.currentTime);
  hoofd.gain.setTargetAtTime(doelVolume(), ctx.currentTime, snel ? 0.03 : 0.2);
}

/* Een sfeergeluidje dat wacht tot Bliepo klaar is met praten (hooguit 4 seconden). */
let wachtend: { naam: Lesgeluid; tot: number } | null = null;

if (typeof window !== "undefined") {
  abonneerPraten(() => {
    const nu = praatVos();
    if (nu === praat) return;
    praat = nu;
    stelVolumeBij(nu);
    if (!nu && wachtend) {
      const w = wachtend;
      wachtend = null;
      if (performance.now() < w.tot) setTimeout(() => speelLesgeluid(w.naam), 250);
    }
  });
}

/* ---------------------------------------------------------------------------
 * Geluidjes aan of uit, los van de stem van Bliepo (29 oktober 2026).
 *   - Het kind: de knop in de lesbalk; bewaard in localStorage.
 *   - De ouder: "Geluidjes in de lessen" bij het profiel van het kind. Staat die
 *     uit, dan zijn de geluidjes uit en is de knop in de lesbalk weg.
 * ------------------------------------------------------------------------- */

const SLEUTEL = "bliepo-lesgeluidjes";
let kindUit: boolean | null = null;
let ouderUit = false;
const kijkers = new Set<() => void>();

function leesKind(): boolean {
  if (kindUit !== null) return kindUit;
  kindUit = false;
  try {
    kindUit = window.localStorage.getItem(SLEUTEL) === "uit";
  } catch {
    /* Geen opslag (privévenster): dan staan ze gewoon aan. */
  }
  return kindUit;
}

function magKlinken(): boolean {
  if (typeof window === "undefined") return false;
  return !ouderUit && !leesKind();
}

function meldKijkers() {
  stelVolumeBij(true);
  for (const f of kijkers) f();
}

/** Staan de geluidjes aan voor het kind (knop in de lesbalk)? */
export function geluidjesAan(): boolean {
  if (typeof window === "undefined") return true;
  return !leesKind();
}

/** De knop in de lesbalk: geluidjes aan of uit. Blijft bewaard op dit apparaat. */
export function zetGeluidjes(aanzetten: boolean): void {
  kindUit = !aanzetten;
  try {
    window.localStorage.setItem(SLEUTEL, aanzetten ? "aan" : "uit");
  } catch {
    /* Niet bewaard, maar wel meteen uit of aan. */
  }
  meldKijkers();
}

/** Mag het van de ouder? (instelling "Geluidjes in de lessen" bij het profiel) */
export function geluidjesVanOuder(): boolean {
  return !ouderUit;
}

/** De lespagina geeft hiermee de instelling van de ouder door. */
export function zetGeluidjesVanOuder(toegestaan: boolean): void {
  ouderUit = !toegestaan;
  meldKijkers();
}

/** Voor de knop: opnieuw tekenen als de stand verandert. */
export function abonneerGeluidjes(f: () => void): () => void {
  kijkers.add(f);
  return () => {
    kijkers.delete(f);
  };
}

/** Het sfeergeluidje dat past bij de voorwerpen van een verhaal (of niets). */
export function sfeerVoor(soort: string | null | undefined): Lesgeluid | null {
  switch (soort) {
    case "vogel":
      return "sfeerVogels";
    case "bloem":
    case "pot":
      return "sfeerBloemen";
    case "ballon":
      return "sfeerBallonnen";
    case "lamp":
    case "lampje":
      return "sfeerLampen";
    case "munt":
      return "sfeerMunten";
    case "vuurvlieg":
    case "lichtje":
      return "sfeerVuurvliegjes";
    case "lantaarn":
      return "sfeerLantaarns";
    case "paddenstoel":
      return "sfeerPaddenstoelen";
    default:
      return null;
  }
}

function speelBestand(c: AudioContext, naam: Lesgeluid): boolean {
  const buf = buffers.get(naam);
  const b = BESTANDEN[naam];
  if (!buf || !b) return false;
  const bron = c.createBufferSource();
  bron.buffer = buf;
  const g = c.createGain();
  g.gain.value = b.vol;
  bron.connect(g).connect(uitgang(c));
  bron.start(c.currentTime + 0.005);
  return true;
}

type Toon ={ f: number; f2?: number; duur: number; vol: number; type?: OscillatorType; na?: number };

function toon(c: AudioContext, t: Toon, start: number) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = t.type ?? "sine";
  osc.frequency.setValueAtTime(t.f, start);
  if (t.f2) osc.frequency.exponentialRampToValueAtTime(t.f2, start + t.duur);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(t.vol, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + t.duur);
  osc.connect(gain).connect(uitgang(c));
  osc.start(start);
  osc.stop(start + t.duur + 0.03);
}

/** Een zacht ruisje (adem, wind), gefilterd van laag naar hoog of andersom. */
function ruis(c: AudioContext, duur: number, vol: number, van: number, tot: number, start: number) {
  const n = Math.floor(c.sampleRate * duur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const bron = c.createBufferSource();
  bron.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(van, start);
  filter.frequency.exponentialRampToValueAtTime(tot, start + duur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + duur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duur);
  bron.connect(filter).connect(gain).connect(uitgang(c));
  bron.start(start);
  bron.stop(start + duur + 0.02);
}

function maak(c: AudioContext, naam: Lesgeluid) {
  const t = c.currentTime + 0.01;
  switch (naam) {
    case "beurt":
      ruis(c, 0.5, 0.05, 500, 1800, t);
      toon(c, { f: 880, duur: 0.25, vol: 0.03 }, t + 0.12);
      break;
    case "keuze":
      toon(c, { f: 1050, duur: 0.07, vol: 0.06, type: "triangle" }, t);
      break;
    case "mis":
      toon(c, { f: 330, f2: 250, duur: 0.22, vol: 0.07, type: "triangle" }, t);
      toon(c, { f: 260, f2: 200, duur: 0.26, vol: 0.06, type: "triangle" }, t + 0.13);
      break;
    case "terug":
      ruis(c, 0.3, 0.035, 1600, 500, t);
      break;
    case "goed":
      [523, 659, 784, 1047].forEach((f, i) => toon(c, { f, duur: 0.5, vol: 0.05 }, t + i * 0.08));
      break;
    case "schuif":
      ruis(c, 0.7, 0.05, 300, 1400, t);
      break;
    case "naarSom":
      [1320, 1568, 1976].forEach((f, i) => toon(c, { f, duur: 0.22, vol: 0.035 }, t + i * 0.06));
      ruis(c, 0.45, 0.03, 800, 2600, t);
      break;
    case "antwoord":
      toon(c, { f: 600, f2: 900, duur: 0.16, vol: 0.06 }, t);
      break;
    case "vlieg":
      ruis(c, 0.35, 0.05, 900, 3200, t);
      toon(c, { f: 1500, f2: 2300, duur: 0.15, vol: 0.025 }, t + 0.05);
      break;
    case "groei":
      toon(c, { f: 380, f2: 760, duur: 0.28, vol: 0.06 }, t);
      toon(c, { f: 1140, duur: 0.25, vol: 0.025 }, t + 0.18);
      break;
    case "knal":
      ruis(c, 0.12, 0.12, 2500, 600, t);
      toon(c, { f: 180, f2: 90, duur: 0.12, vol: 0.06 }, t);
      break;
    case "lamp":
      toon(c, { f: 740, f2: 520, duur: 0.12, vol: 0.05, type: "triangle" }, t);
      break;
    case "munt":
      toon(c, { f: 1568, duur: 0.18, vol: 0.04 }, t);
      toon(c, { f: 2093, duur: 0.3, vol: 0.035 }, t + 0.07);
      break;
    case "markeer":
      ruis(c, 0.4, 0.03, 1200, 3000, t);
      [880, 1175].forEach((f, i) => toon(c, { f, duur: 0.35, vol: 0.03 }, t + 0.05 + i * 0.1));
      break;
    case "wijzerTik":
      toon(c, { f: 660, f2: 990, duur: 0.12, vol: 0.05, type: "triangle" }, t);
      ruis(c, 0.35, 0.025, 2200, 900, t + 0.04);
      break;
    case "wijzerKlik":
      toon(c, { f: 1320, duur: 0.08, vol: 0.05, type: "triangle" }, t);
      toon(c, { f: 990, duur: 0.35, vol: 0.03 }, t + 0.06);
      break;
    case "plop":
      toon(c, { f: 520, f2: 880, duur: 0.1, vol: 0.06 }, t);
      break;
    case "klokDraai":
      ruis(c, 1.4, 0.035, 400, 2400, t);
      [587, 740, 880].forEach((f, i) => toon(c, { f, duur: 0.6, vol: 0.025 }, t + 0.3 + i * 0.25));
      break;
    case "kaart":
      [523, 659, 784].forEach((f) => toon(c, { f, duur: 0.9, vol: 0.035 }, t));
      toon(c, { f: 1047, duur: 0.7, vol: 0.03 }, t + 0.15);
      break;
    /* Reserveklanken voor de namen van 29 oktober 2026 (als een bestand er niet is). */
    case "tik":
      toon(c, { f: 1400, duur: 0.04, vol: 0.04, type: "triangle" }, t);
      break;
    case "knop":
      toon(c, { f: 300, f2: 180, duur: 0.1, vol: 0.08 }, t);
      break;
    case "verschijn":
      toon(c, { f: 480, f2: 820, duur: 0.12, vol: 0.05 }, t);
      break;
    case "sfeerVogels":
      [0, 0.35, 0.5, 1.1].forEach((na, i) => toon(c, { f: 2600 + i * 150, f2: 3400 + i * 100, duur: 0.08, vol: 0.015 }, t + na));
      break;
    case "sfeerBloemen":
      ruis(c, 1.4, 0.015, 400, 900, t);
      toon(c, { f: 784, duur: 0.5, vol: 0.02 }, t + 0.1);
      toon(c, { f: 988, duur: 0.5, vol: 0.018 }, t + 0.45);
      break;
    case "sfeerBallonnen":
      toon(c, { f: 300, f2: 520, duur: 0.6, vol: 0.02, type: "triangle" }, t);
      break;
    case "sfeerLampen":
      toon(c, { f: 900, duur: 0.04, vol: 0.03, type: "triangle" }, t);
      toon(c, { f: 760, duur: 0.04, vol: 0.03, type: "triangle" }, t + 0.35);
      break;
    case "sfeerMunten":
      [1900, 2300, 2100].forEach((f, i) => toon(c, { f, duur: 0.12, vol: 0.015 }, t + i * 0.12));
      break;
    case "sfeerVuurvliegjes":
      [0, 0.35, 0.7].forEach((na) => toon(c, { f: 4200, duur: 0.1, vol: 0.008, type: "triangle" }, t + na));
      toon(c, { f: 2093, duur: 0.6, vol: 0.012 }, t + 0.2);
      break;
    case "sfeerLantaarns":
      toon(c, { f: 1319, duur: 0.5, vol: 0.02 }, t);
      toon(c, { f: 1568, duur: 0.4, vol: 0.016 }, t + 0.3);
      break;
    case "sfeerPaddenstoelen":
      toon(c, { f: 420, f2: 300, duur: 0.12, vol: 0.03 }, t);
      toon(c, { f: 380, f2: 260, duur: 0.12, vol: 0.03 }, t + 0.25);
      break;
  }
}

function klink(c: AudioContext, naam: Lesgeluid) {
  try {
    if (!speelBestand(c, naam)) maak(c, naam);
  } catch {
    /* Een geluidje dat niet lukt, is geen fout in de les. */
  }
}

/** Speelt een lesgeluidje. Doet niets op de server, zonder geluid of vóór de eerste aanraking. */
export function speelLesgeluid(naam: Lesgeluid): void {
  if (uit || !aan || !magKlinken()) return;
  /* Een sfeergeluidje gaat nooit door de stem heen: het wacht tot Bliepo klaar is. */
  if (naam.startsWith("sfeer") && praat) {
    wachtend = { naam, tot: performance.now() + 4000 };
    return;
  }
  const c = motor();
  if (!c) return;
  uitgang(c);
  if (c.state !== "running") {
    c.resume().then(() => klink(c, naam)).catch(() => {});
    return;
  }
  klink(c, naam);
}

/**
 * Een zacht tikje bij elke knop in de kindomgeving (29 oktober 2026, opdracht
 * eigenaar: "als je op knoppen drukt bij andere opdrachten, een plopgeluidje",
 * zoals Synthesis bij elke tik een klikje laat horen). Ook buiten de nagebouwde
 * lessen, dus los van `aan`. Volgt wel de knop van het kind en de instelling van
 * de ouder ("Geluidjes in de lessen"). LEGAL REVIEW REQUIRED: moment van Synthesis.
 */
export function speelTik(ouderToegestaan = true): void {
  if (uit || !ouderToegestaan || !magKlinken()) return;
  const c = motor();
  if (!c) return;
  laadBestanden();
  uitgang(c);
  if (c.state !== "running") {
    c.resume().then(() => klink(c, "knop")).catch(() => {});
    return;
  }
  klink(c, "knop");
}
