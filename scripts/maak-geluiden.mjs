/**
 * Maakt de tijdelijke geluiden van de gouden lessen met code (Sara, 19 november 2026; BOUWREGELS 15.40).
 *
 *   node scripts/maak-geluiden.mjs
 *
 * Schrijft 4 WAV-bestanden in public/geluiden/ (mono, 22050 Hz, 16 bit), elk korter dan 1 seconde, zacht en neutraal:
 *   goed.wav           2 zachte toontjes omhoog (goed in 1 keer)
 *   goed-na-hulp.wav   1 zacht, warm toontje (goed na hulp of na een tweede poging)
 *   nog-niet-goed.wav  1 heel zacht, laag toontje; geen zoemer, niet naar beneden glijdend
 *   beloning.wav       3 zachte belletjes (plek voor later; nu speelt niets hem af)
 *
 * Eigen werk: door code gemaakt, vrij te gebruiken. Geen geluid van Synthesis of een ander platform, geen betaalde
 * dienst. Bestaat een bestand al, dan wordt het NIET overschreven (Sara kan het dan zelf vervangen hebben);
 * met OVERSCHRIJF=1 wel.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAP = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "geluiden");
const RATE = 22050;

/** Een zachte toon: sinus met een beetje boventoon, zacht in en uit (geen klik). */
function toon(buf, { f, start, duur, vol }) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(duur * RATE);
  const aanzet = Math.floor(0.012 * RATE);
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const inz = Math.min(1, i / aanzet);
    const uit = Math.exp((-4.2 * i) / n);
    const staart = i > n - 200 ? (n - i) / 200 : 1;
    const golf = Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(2 * Math.PI * 2 * f * t);
    buf[s0 + i] += vol * inz * uit * staart * golf;
  }
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), i * 2));
  const kop = Buffer.alloc(44);
  kop.write("RIFF", 0);
  kop.writeUInt32LE(36 + data.length, 4);
  kop.write("WAVE", 8);
  kop.write("fmt ", 12);
  kop.writeUInt32LE(16, 16);
  kop.writeUInt16LE(1, 20);
  kop.writeUInt16LE(1, 22);
  kop.writeUInt32LE(RATE, 24);
  kop.writeUInt32LE(RATE * 2, 28);
  kop.writeUInt16LE(2, 32);
  kop.writeUInt16LE(16, 34);
  kop.write("data", 36);
  kop.writeUInt32LE(data.length, 40);
  return Buffer.concat([kop, data]);
}

function maak(duur, tonen) {
  const buf = new Float64Array(Math.floor(duur * RATE));
  for (const t of tonen) toon(buf, t);
  return wav(buf);
}

const GELUIDEN = {
  /* C6-E6 zou schel zijn; hier G5 en C6, zacht. */
  "goed.wav": maak(0.42, [
    { f: 784, start: 0, duur: 0.22, vol: 0.18 },
    { f: 1047, start: 0.1, duur: 0.32, vol: 0.18 },
  ]),
  "goed-na-hulp.wav": maak(0.36, [{ f: 880, start: 0, duur: 0.36, vol: 0.16 }]),
  /* Heel zacht en neutraal: 1 lage, ronde toon, niet dalend (geen "fout"-klank, geen zoemer). */
  "nog-niet-goed.wav": maak(0.3, [{ f: 392, start: 0, duur: 0.3, vol: 0.09 }]),
  "beloning.wav": maak(0.7, [
    { f: 1047, start: 0, duur: 0.3, vol: 0.14 },
    { f: 1319, start: 0.12, duur: 0.32, vol: 0.14 },
    { f: 1568, start: 0.24, duur: 0.46, vol: 0.14 },
  ]),
};

mkdirSync(MAP, { recursive: true });
for (const [naam, data] of Object.entries(GELUIDEN)) {
  const pad = join(MAP, naam);
  if (existsSync(pad) && !process.env.OVERSCHRIJF) {
    console.log(`overgeslagen (bestaat al): public/geluiden/${naam}`);
    continue;
  }
  writeFileSync(pad, data);
  console.log(`gemaakt: public/geluiden/${naam} (${((data.length - 44) / 2 / RATE).toFixed(2)} s, ${data.length} bytes)`);
}
