/** Gedeelde hulpjes voor "verwerk de inbox" (zie WISSELEN.md). */
import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const WORTEL = path.resolve(import.meta.dirname, "../..");
export const INBOX = path.join(WORTEL, "plaatjes-inbox");
export const VERWERKT = path.join(WORTEL, "plaatjes-verwerkt");
export const BACKUP = path.join(WORTEL, "plaatjes-backup");
export const VOORBEELD = path.join(INBOX, ".voorbeeld");
export const KOPPELING = path.join(INBOX, "koppeling.json");

/** Hoe groot een plaatje in de site wordt (langste kant) en hoe zwaar hij mag zijn. */
export const MAAT = 512;
export const MAX_KB = 150;

export const inboxBestanden = () => readdirSync(INBOX).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();

/**
 * Effen achtergrond weg (wit of een andere effen kleur): de kleur van de rand
 * wordt gemeten, en vanaf de rand wordt alles wat op die kleur lijkt en eraan
 * vastzit doorzichtig. Dezelfde kleur BINNEN de omlijning (een witte bal, een
 * glimmertje) blijft dus staan. De overgang wordt zacht gemaakt.
 */
export async function knipUit(bron) {
  const { data, info } = await sharp(bron).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  /* achtergrondkleur: de middelste waarde van alle randpixels, per kleurkanaal */
  const rand = [];
  for (let x = 0; x < W; x++) rand.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) rand.push(y * W, y * W + W - 1);
  const mid = (k) => rand.map((i) => data[i * 4 + k]).sort((p, q) => p - q)[rand.length >> 1];
  const [ar, ag, ab] = [mid(0), mid(1), mid(2)];
  const afstand = (i) => Math.max(Math.abs(data[i * 4] - ar), Math.abs(data[i * 4 + 1] - ag), Math.abs(data[i * 4 + 2] - ab));
  const DREMPEL = 26;
  const weg = new Uint8Array(W * H);
  const rij = [];
  const duw = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (weg[i]) return;
    /* al doorzichtig, of lijkt op de achtergrondkleur: weg */
    if (data[i * 4 + 3] > 0 && afstand(i) > DREMPEL) return;
    weg[i] = 1;
    rij.push(i);
  };
  for (let x = 0; x < W; x++) duw(x, 0), duw(x, H - 1);
  for (let y = 0; y < H; y++) duw(0, y), duw(W - 1, y);
  while (rij.length) {
    const i = rij.pop();
    const x = i % W, y = (i / W) | 0;
    duw(x + 1, y), duw(x - 1, y), duw(x, y + 1), duw(x, y - 1);
  }
  for (let i = 0; i < W * H; i++) {
    if (weg[i]) data[i * 4 + 3] = 0;
    else {
      /* zachte rand: een pixel naast de weggehaalde achtergrond die er nog op lijkt, wordt half doorzichtig */
      const x = i % W, y = (i / W) | 0;
      const buur = (x > 0 && weg[i - 1]) || (x < W - 1 && weg[i + 1]) || (y > 0 && weg[i - W]) || (y < H - 1 && weg[i + W]);
      if (buur) {
        const d = afstand(i);
        if (d < 90) data[i * 4 + 3] = Math.min(data[i * 4 + 3], Math.round(((d - DREMPEL) / (90 - DREMPEL)) * 255));
      }
    }
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

/** Witte randjes weg en de rand 1-2 pixels inkorten (1 november 2026, zie randen.mjs). */
export async function schoneRand(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const A = (i) => data[i * 4 + 3];
  const buurDoorzichtig = (x, y, drempel) => {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) return true;
        if (A(ny * W + nx) < drempel) return true;
      }
    return false;
  };
  /* 1. lichte randpixels weg (wit/lichtgrijs halo), twee rondes */
  for (let ronde = 0; ronde < 2; ronde++) {
    const weg = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (A(i) === 0 || !buurDoorzichtig(x, y, 40)) continue;
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        const licht = Math.min(r, g, b);
        const grijs = Math.max(r, g, b) - licht < 40;
        if (licht > 185 && grijs) weg.push(i);
      }
    for (const i of weg) data[i * 4 + 3] = 0;
  }
  /* 2. rand 1 pixel inkorten (ronde 1 helemaal weg, ronde 2 half) */
  const kort = (factor) => {
    const nieuw = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (A(i) > 0 && buurDoorzichtig(x, y, 20)) nieuw.push(i);
      }
    for (const i of nieuw) data[i * 4 + 3] = Math.round(data[i * 4 + 3] * factor);
  };
  kort(0);
  kort(0.5);
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png({ palette: true, quality: 92, compressionLevel: 9, effort: 10 }).toBuffer();
}

/** Uitknippen, bijsnijden, verkleinen tot MAAT en zuinig opslaan (regel 7: snel openen). */
export async function maakVoorwerp(bron) {
  const uit = await knipUit(bron);
  const bijgesneden = await sharp(await schoneRand(uit)).trim({ threshold: 1 }).toBuffer();
  const rand = Math.round(MAAT * 0.04);
  const binnen = MAAT - rand * 2;
  let buf = await sharp(bijgesneden)
    .resize(binnen, binnen, { fit: "inside", withoutEnlargement: false })
    .extend({ top: rand, bottom: rand, left: rand, right: rand, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
    .toBuffer();
  if (buf.length > MAX_KB * 1024) buf = await sharp(buf).png({ palette: true, quality: 70, compressionLevel: 9, effort: 10 }).toBuffer();
  return buf;
}
