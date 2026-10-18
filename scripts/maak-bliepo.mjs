// Maakt van ontwerp/mascotte/bliepo.png (Bliepo, de robot) de lichte bestanden in public/mascotte/.
//   node scripts/maak-bliepo.mjs
//
// Wat er gebeurt:
//   1. de lichtgrijze achtergrond (en de schaduw eronder) wordt doorzichtig,
//      met een zachte rand zonder witte waas;
//   2. de vaste lach op het schermpje wordt zwart gemaakt: de ogen en de mond
//      tekent de website er zelf overheen, zodat ze kunnen knipperen en praten
//      (zie src/components/avontuur/Bliepo.tsx);
//   3. bijgesneden en verkleind tot 300, 480 en 720 pixels hoog, als WebP.
import sharp from "sharp";
import fs from "node:fs";

const BRON = "ontwerp/mascotte/bliepo.png";
const UIT = "public/mascotte";
fs.mkdirSync(UIT, { recursive: true });

const { data, info } = await sharp(BRON).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: B, height: H } = info;
const rgba = Buffer.alloc(B * H * 4);
for (let i = 0; i < B * H; i++) {
  rgba[i * 4] = data[i * 3];
  rgba[i * 4 + 1] = data[i * 3 + 1];
  rgba[i * 4 + 2] = data[i * 3 + 2];
  rgba[i * 4 + 3] = 255;
}

// 1. achtergrond: overstromen vanaf de randen, zolang het licht en grijs is
const isAchtergrond = (i) => {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  return Math.min(r, g, b) > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 32;
};
const weg = new Uint8Array(B * H);
const rij = [];
for (let x = 0; x < B; x++) rij.push(x, (H - 1) * B + x);
for (let y = 0; y < H; y++) rij.push(y * B, y * B + B - 1);
while (rij.length) {
  const i = rij.pop();
  if (weg[i] || !isAchtergrond(i)) continue;
  weg[i] = 1;
  const x = i % B, y = (i / B) | 0;
  if (x > 0) rij.push(i - 1);
  if (x < B - 1) rij.push(i + 1);
  if (y > 0) rij.push(i - B);
  if (y < H - 1) rij.push(i + B);
}
// de vloer onder en tussen de wielen (schaduw en weerspiegeling): ook weg,
// ook als die niet aan de rand vastzit
for (let y = 1050; y < H; y++)
  for (let x = 0; x < B; x++) {
    const i = y * B + x;
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    if (Math.min(r, g, b) > 150 && Math.max(r, g, b) - Math.min(r, g, b) < 50) weg[i] = 1;
  }
// afstand tot de achtergrond (tot 3 pixels) voor een zachte rand
const afstand = new Uint8Array(B * H).fill(9);
for (let i = 0; i < B * H; i++) if (weg[i]) afstand[i] = 0;
for (let ronde = 1; ronde <= 3; ronde++)
  for (let i = 0; i < B * H; i++) {
    if (afstand[i] !== 9) continue;
    const x = i % B;
    if ((x > 0 && afstand[i - 1] === ronde - 1) || (x < B - 1 && afstand[i + 1] === ronde - 1) || afstand[i - B] === ronde - 1 || afstand[i + B] === ronde - 1) afstand[i] = ronde;
  }
const ACHTER = [244, 242, 247];
for (let i = 0; i < B * H; i++) {
  if (weg[i]) { rgba[i * 4 + 3] = 0; continue; }
  if (afstand[i] > 2) continue;
  // hoeveel lijkt deze randpixel op de achtergrond? zoveel doorzichtiger, en de kleur ontmengen
  const c = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const d = Math.hypot(c[0] - ACHTER[0], c[1] - ACHTER[1], c[2] - ACHTER[2]);
  const a = Math.max(0.15, Math.min(1, d / 140));
  for (let k = 0; k < 3; k++) rgba[i * 4 + k] = Math.max(0, Math.min(255, Math.round((c[k] - (1 - a) * ACHTER[k]) / a)));
  rgba[i * 4 + 3] = Math.round(a * 255);
}

// 2. de vaste lach weghalen: alles wat in deze ovaal blauwgroen gloeit, wordt schermzwart
const MOND = { x: 637, y: 468, rx: 165, ry: 112 };
const ZWART = [17, 21, 29];
for (let y = MOND.y - MOND.ry; y <= MOND.y + MOND.ry; y++)
  for (let x = MOND.x - MOND.rx; x <= MOND.x + MOND.rx; x++) {
    const e = ((x - MOND.x) / MOND.rx) ** 2 + ((y - MOND.y) / MOND.ry) ** 2;
    if (e > 1) continue;
    const i = y * B + x;
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const gloed = Math.max(0, Math.min(1, (Math.min(g, b) - r - 4) / 30));
    const rand = e > 0.8 ? (1 - e) / 0.2 : 1; // zacht naar de rand van de ovaal
    const t = gloed * rand;
    for (let k = 0; k < 3; k++) rgba[i * 4 + k] = Math.round(rgba[i * 4 + k] * (1 - t) + ZWART[k] * t);
  }

const basis = sharp(rgba, { raw: { width: B, height: H, channels: 4 } });
const { info: bij } = await basis.clone().trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
console.log("bijgesneden:", JSON.stringify({ links: -bij.trimOffsetLeft, boven: -bij.trimOffsetTop, breed: bij.width, hoog: bij.height }));
await basis.clone().trim({ threshold: 1 }).png().toFile("ontwerp/mascotte/bliepo-vrij.png");
for (const h of [300, 480, 720]) {
  const pad = `${UIT}/bliepo-${h}.webp`;
  await sharp("ontwerp/mascotte/bliepo-vrij.png").resize({ height: h }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(pad);
  console.log(pad, Math.round(fs.statSync(pad).size / 1024), "KB");
}
