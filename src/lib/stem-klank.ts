/**
 * De klank van de stem van Bliepo (22 oktober 2026, opdracht eigenaar: de "s"
 * sist te scherp).
 *
 * Fish Audio levert de zin als onbewerkt geluid (wav). Hier gaat het door drie
 * stappen voordat het als mp3 wordt bewaard:
 *
 *   1. een zachte de-esser: alleen op de momenten dat een s, z, sch of t te
 *      fel is, wordt het gebied rond 5 tot 9 kHz zachter gezet. De rest van de
 *      stem blijft zoals hij is, zodat hij helder klinkt en niet dof;
 *   2. alle zinnen even hard (loudness -16 LUFS, toppen hooguit -1 dBFS);
 *   3. mp3 van 192 kbps (Fish Audio gaf 128 kbps; bij een lagere bitrate
 *      krijgen scherpe klanken sneller een ruisrandje).
 *
 * Alles in gewoon JavaScript, zonder extra programma's op de server.
 */

import { Mp3Encoder } from "@breezystack/lamejs";

export type Klank = { samples: Float32Array; sr: number };

// ---------------------------------------------------------------------------
// Wav lezen (Fish Audio: 16-bit mono PCM)
// ---------------------------------------------------------------------------

export function leesWav(buf: Buffer): Klank {
  let pos = 12;
  let sr = 44100;
  let kanalen = 1;
  let bits = 16;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    let grootte = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") {
      kanalen = buf.readUInt16LE(pos + 10);
      sr = buf.readUInt32LE(pos + 12);
      bits = buf.readUInt16LE(pos + 22);
    } else if (id === "data") {
      /* Bij streaming staat de lengte soms op 0 of te groot: neem dan de rest van het bestand. */
      if (grootte === 0 || pos + 8 + grootte > buf.length) grootte = buf.length - pos - 8;
      if (bits !== 16) throw new Error(`wav met ${bits} bits wordt niet ondersteund`);
      const n = Math.floor(grootte / 2 / kanalen);
      const samples = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        let som = 0;
        for (let k = 0; k < kanalen; k++) som += buf.readInt16LE(pos + 8 + (i * kanalen + k) * 2);
        samples[i] = som / kanalen / 32768;
      }
      return { samples, sr };
    }
    pos += 8 + grootte + (grootte % 2);
  }
  throw new Error("geen geluid gevonden in wav");
}

// ---------------------------------------------------------------------------
// Filters (biquad, RBJ-kookboek)
// ---------------------------------------------------------------------------

type Biquad = { b0: number; b1: number; b2: number; a1: number; a2: number };

function hoogdoorlaat(sr: number, f: number, q: number): Biquad {
  const w = (2 * Math.PI * f) / sr;
  const alpha = Math.sin(w) / (2 * q);
  const c = Math.cos(w);
  const a0 = 1 + alpha;
  return { b0: (1 + c) / 2 / a0, b1: -(1 + c) / a0, b2: (1 + c) / 2 / a0, a1: (-2 * c) / a0, a2: (1 - alpha) / a0 };
}

function hoogplank(sr: number, f: number, gainDb: number): Biquad {
  const A = 10 ** (gainDb / 40);
  const w = (2 * Math.PI * f) / sr;
  const c = Math.cos(w);
  const alpha = (Math.sin(w) / 2) * Math.SQRT2;
  const a0 = A + 1 - (A - 1) * c + 2 * Math.sqrt(A) * alpha;
  return {
    b0: (A * (A + 1 + (A - 1) * c + 2 * Math.sqrt(A) * alpha)) / a0,
    b1: (-2 * A * (A - 1 + (A + 1) * c)) / a0,
    b2: (A * (A + 1 + (A - 1) * c - 2 * Math.sqrt(A) * alpha)) / a0,
    a1: (2 * (A - 1 - (A + 1) * c)) / a0,
    a2: (A + 1 - (A - 1) * c - 2 * Math.sqrt(A) * alpha) / a0,
  };
}

function filter(x: Float32Array, f: Biquad): Float32Array {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = f.b0 * x[i] + f.b1 * x1 + f.b2 * x2 - f.a1 * y1 - f.a2 * y2;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = v;
    y[i] = v;
  }
  return y;
}

// ---------------------------------------------------------------------------
// De-esser
// ---------------------------------------------------------------------------

export type DeEsser = {
  /** Vanaf hoeveel dB het s-gebied boven de hele stem uitkomt, gaat hij zachter. */
  drempelDb: number;
  /** Hoeveel van wat erboven zit, wordt weggehaald (4 = driekwart). */
  verhouding: number;
  /** Nooit meer dan zoveel dB zachter. */
  hoogstensDb: number;
};

/**
 * Dynamische demping rond 5 tot 9 kHz, per stukje van 23 ms (STFT met
 * overlap). Per stukje wordt gemeten hoe fel het s-gebied is ten opzichte van
 * het hele stukje. Is dat boven de drempel, dan worden alleen de frequenties
 * van 4,5 tot 10 kHz (met een zachte overgang) zachter gezet; de fase blijft
 * gelijk, dus er ontstaat geen vervorming. Erop gaat meteen, eraf rustig
 * (±50 ms), zodat het niet hoorbaar pompt. Klinkers en de heldere klank
 * tussen 2 en 5 kHz blijven onaangeroerd.
 */
export function deEss(k: Klank, d: DeEsser): Klank {
  const { samples: x, sr } = k;
  const N = 1024;
  const H = 256;
  const venster = new Float64Array(N).map((_, j) => 0.5 - 0.5 * Math.cos((2 * Math.PI * j) / N));
  const hz = (b: number) => (b * sr) / N;
  /* Hoeveel elke frequentie meedoet: 0 onder 4 kHz, 1 tussen 5 en 9 kHz, zacht aflopend tot 11 kHz. */
  const weging = new Float64Array(N / 2 + 1).map((_, b) => {
    const f = hz(b);
    if (f < 4000 || f > 11000) return 0;
    if (f < 5000) return (f - 4000) / 1000;
    if (f > 9000) return (11000 - f) / 2000;
    return 1;
  });
  const uit = new Float64Array(x.length + N);
  const norm = new Float64Array(x.length + N);
  const loslaten = Math.exp(-H / (0.05 * sr));
  let red = 0;
  for (let i = -N + H; i < x.length; i += H) {
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let j = 0; j < N; j++) {
      const t = i + j;
      re[j] = t >= 0 && t < x.length ? x[t] * venster[j] : 0;
    }
    fft(re, im, false);
    let tot = 0;
    let band = 0;
    for (let b = 1; b <= N / 2; b++) {
      const e = re[b] * re[b] + im[b] * im[b];
      if (hz(b) >= 80) tot += e;
      if (hz(b) >= 5000 && hz(b) <= 9000) band += e;
    }
    const boven = tot > 1e-9 ? 10 * Math.log10((band + 1e-15) / tot) - d.drempelDb : 0;
    const doel = boven > 0 ? Math.min(d.hoogstensDb, boven * (1 - 1 / d.verhouding)) : 0;
    red = doel > red ? doel : loslaten * red + (1 - loslaten) * doel;
    if (red > 0.01) {
      for (let b = 0; b <= N / 2; b++) {
        if (!weging[b]) continue;
        const g = 10 ** ((-red * weging[b]) / 20);
        re[b] *= g;
        im[b] *= g;
        if (b > 0 && b < N / 2) {
          re[N - b] *= g;
          im[N - b] *= g;
        }
      }
    }
    fft(re, im, true);
    for (let j = 0; j < N; j++) {
      const t = i + j;
      if (t < 0 || t >= x.length) continue;
      uit[t] += re[j] * venster[j];
      norm[t] += venster[j] * venster[j];
    }
  }
  const y = new Float32Array(x.length);
  for (let t = 0; t < x.length; t++) y[t] = norm[t] > 1e-9 ? uit[t] / norm[t] : x[t];
  return { samples: y, sr };
}

/** FFT (radix 2, ter plaatse). `terug` = de omgekeerde, inclusief delen door N. */
function fft(re: Float64Array, im: Float64Array, terug: boolean) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const hoek = ((terug ? 2 : -2) * Math.PI) / len;
    const half = len / 2;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const wr = Math.cos(hoek * k);
        const wi = Math.sin(hoek * k);
        const a = i + k;
        const b = a + half;
        const vr = re[b] * wr - im[b] * wi;
        const vi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - vr;
        im[b] = im[a] - vi;
        re[a] += vr;
        im[a] += vi;
      }
    }
  }
  if (terug) for (let i = 0; i < n; i++) {
    re[i] /= n;
    im[i] /= n;
  }
}

// ---------------------------------------------------------------------------
// Even hard: loudness (EBU R128 / ITU-R BS.1770)
// ---------------------------------------------------------------------------

export function loudness(k: Klank): number {
  const { samples, sr } = k;
  const kw = filter(filter(samples, hoogplank(sr, 1681.97, 4)), hoogdoorlaat(sr, 38.13, 0.5));
  const blok = Math.round(0.4 * sr);
  const stap = Math.round(0.1 * sr);
  const blokken: number[] = [];
  for (let i = 0; i + blok <= kw.length; i += stap) {
    let e = 0;
    for (let j = i; j < i + blok; j++) e += kw[j] * kw[j];
    blokken.push(e / blok);
  }
  if (!blokken.length) return -70;
  const lufs = (e: number) => -0.691 + 10 * Math.log10(e + 1e-15);
  const absoluut = blokken.filter((e) => lufs(e) > -70);
  if (!absoluut.length) return -70;
  const gem = absoluut.reduce((a, b) => a + b, 0) / absoluut.length;
  const relatief = absoluut.filter((e) => lufs(e) > lufs(gem) - 10);
  return lufs(relatief.reduce((a, b) => a + b, 0) / relatief.length);
}

/** Alles op -16 LUFS; als de toppen dan boven -1 dBFS komen, iets minder hard (nooit vervormen). */
export function evenHard(k: Klank, doelLufs = -16): Klank {
  const nu = loudness(k);
  let piek = 0;
  for (const v of k.samples) piek = Math.max(piek, Math.abs(v));
  const ruimte = piek > 0 ? -1 - 20 * Math.log10(piek) : 0;
  const winst = Math.min(doelLufs - nu, ruimte);
  const g = 10 ** (winst / 20);
  return { samples: k.samples.map((v) => v * g), sr: k.sr };
}

// ---------------------------------------------------------------------------
// Mp3 maken
// ---------------------------------------------------------------------------

export function naarMp3(k: Klank, kbps = 192): Buffer {
  /* Onder 32 kHz (MPEG-2) kan een mp3 hooguit 160 kbps zijn. */
  const enc = new Mp3Encoder(1, k.sr, k.sr < 32000 ? Math.min(kbps, 160) : kbps);
  const pcm = new Int16Array(k.samples.length);
  for (let i = 0; i < pcm.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(k.samples[i] * 32767)));
  const delen: Uint8Array[] = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const d = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (d.length) delen.push(new Uint8Array(d));
  }
  const slot = enc.flush();
  if (slot.length) delen.push(new Uint8Array(slot));
  return Buffer.concat(delen);
}

/**
 * De gekozen bewerking (22 oktober 2026). Gemeten op vijf zinnen vol s-klanken,
 * na even hard maken; "scherpste s" = de 5% felste s-momenten (5-9 kHz) ten
 * opzichte van het niveau van de stem:
 *   A  zoals het was (mp3 128 kbps, volume +5):  -9 dB
 *   B  volume 0, wav, mp3 192 kbps:               -8 dB
 *   C  B + zachte de-esser (-12 dB, 1:4, max 6):  -16 dB
 *   D  B + sterkere de-esser (-15 dB, 1:6, max 10): -23 dB  <- gekozen
 * De klank tussen 2 en 5 kHz (helderheid) bleef bij alle vier gelijk
 * (-25 tot -26 dB), alle woorden werden verstaan, en ook bij D overheerst de s
 * in de s-momenten nog ruim (12 dB boven de lage tonen): niet slissend.
 * Volume +5 en de bitrate waren niet de oorzaak (A en B even scherp); de
 * scherpe s zit in de stem zelf.
 */
export const GEKOZEN_DE_ESSER: DeEsser = { drempelDb: -15, verhouding: 6, hoogstensDb: 10 };

/** Verander je iets aan de bewerking, verhoog dit: dan worden de zinnen opnieuw gemaakt. */
export const KLANK_VERSIE = 1;

/** Van wav van Fish Audio naar de mp3 die Bliepo afspeelt. */
export function bewerkStem(wav: Buffer, d: DeEsser | null = GEKOZEN_DE_ESSER): Buffer {
  return bewerkKlank(leesWav(wav), d);
}

/** Ruw geluid (16-bit mono PCM zonder kop, zoals ElevenLabs het geeft) naar een klank. */
export function leesPcm(buf: Buffer, sr: number): Klank {
  const n = Math.floor(buf.length / 2);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = buf.readInt16LE(i * 2) / 32768;
  return { samples, sr };
}

/*
  Kleine bestanden (23 oktober 2026, opdracht eigenaar): mono mp3 van 64 kbps
  bij 24 kHz (ElevenLabs) en 96 kbps bij 44,1 kHz (Fish Audio), in plaats van
  160/192 kbps. Voor gesproken tekst klinkt dat nog helder en het bestand is
  2,5 keer zo klein. Bewust geen nieuwe KLANK_VERSIE: dan zouden alle zinnen
  opnieuw betaald moeten worden; de bestaande zijn los kleiner gemaakt.
*/
export const KBPS_STEM = (sr: number) => (sr < 32000 ? 64 : 96);

/*
  Stilte aan het begin en eind inkorten (23 oktober 2026): een zin achter een
  andere ("Hoi Sam!" en dan de begroeting) had anders een rare pauze, want
  ElevenLabs zet er tot 0,6 s stilte achter. Hooguit 0,05 s ervoor (de speler
  zet er zelf al 0,2 s stilte voor, zodat er nooit een begin wegvalt) en 0,2 s
  erachter, met een korte uitloop zodat er niets afgeknipt klinkt.
*/
export function knipStilte(k: Klank, voor = 0.05, na = 0.2): Klank {
  const drempel = 0.01;
  let a = 0;
  let b = k.samples.length - 1;
  while (a < b && Math.abs(k.samples[a]) < drempel) a++;
  while (b > a && Math.abs(k.samples[b]) < drempel) b--;
  if (b <= a) return k;
  const begin = Math.max(0, a - Math.round(voor * k.sr));
  const eind = Math.min(k.samples.length, b + 1 + Math.round(na * k.sr));
  return { samples: k.samples.slice(begin, eind), sr: k.sr };
}

/**
 * Zoals bewerkKlank, maar geeft ook terug hoeveel seconden er aan het begin
 * is weggeknipt (voor de tijden per woord: oplichten tijdens het voorlezen).
 */
export function bewerkKlankMetBegin(k: Klank, d: DeEsser | null = GEKOZEN_DE_ESSER): { mp3: Buffer; begin: number } {
  const hard = evenHard(d ? deEss(k, d) : k);
  const kort = knipStilte(hard);
  /* knipStilte knipt alleen aan het begin en eind: het verschil in lengte vooraan is wat er weg is. */
  let a = 0;
  while (a < hard.samples.length && Math.abs(hard.samples[a]) < 0.01) a++;
  const begin = Math.max(0, a - Math.round(0.05 * hard.sr)) / hard.sr;
  return { mp3: naarMp3(kort, KBPS_STEM(kort.sr)), begin };
}

/** De-esser, even hard, stilte inkorten, mp3. */
export function bewerkKlank(k: Klank, d: DeEsser | null = GEKOZEN_DE_ESSER): Buffer {
  return naarMp3(knipStilte(evenHard(d ? deEss(k, d) : k)), KBPS_STEM(k.sr));
}
