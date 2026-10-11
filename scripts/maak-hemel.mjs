// Zet ontwerp/achtergrond-breed.png om naar lichte achtergrondbestanden in public/hemel/.
//   node scripts/maak-hemel.mjs
// Breed: 1672, 1280 en 828 pixels, als AVIF en WebP.
// Staand (telefoon en staande tablet): het rechterdeel van het plaatje, met de
// planeet en de wolken rechts; 706 x 941 (verhouding 3:4) en 530 breed.
import sharp from "sharp";
import fs from "node:fs";

const BRON = "ontwerp/achtergrond-breed.png";
const UIT = "public/hemel";
fs.mkdirSync(UIT, { recursive: true });

const { width, height } = await sharp(BRON).metadata();
const STAAND = { left: width - 706, top: 0, width: 706, height }; // x 966..1672

const taken = [
  ...[1672, 1280, 828].map((b) => ({ naam: `breed-${b}`, maak: () => sharp(BRON).resize({ width: b }) })),
  { naam: "staand-706", maak: () => sharp(BRON).extract(STAAND) },
  { naam: "staand-530", maak: () => sharp(BRON).extract(STAAND).resize({ width: 530 }) },
];
for (const t of taken) {
  for (const [ext, opt] of [["avif", { quality: 80, effort: 6 }], ["webp", { quality: 92, effort: 6 }]]) {
    const pad = `${UIT}/${t.naam}.${ext}`;
    await t.maak()[ext](opt).toFile(pad);
    console.log(pad, Math.round(fs.statSync(pad).size / 1024), "KB");
  }
}
console.log("staand uitsnede:", JSON.stringify(STAAND));
