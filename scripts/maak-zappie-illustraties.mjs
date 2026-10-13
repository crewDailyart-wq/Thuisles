// Maakt de webbestanden van de vier goedgekeurde illustraties van Zappie.
//   node scripts/maak-zappie-illustraties.mjs
//
// Bron: ontwerp/zappie/illustraties/ (de originelen van de eigenaar, 13 oktober
// 2026; die worden nooit bewerkt). Uit: public/assets/zappie/illustraties/.
//
// Per beeld twee breedtes (720 en 1440) in AVIF en WebP: zestien bestanden. De
// browser kiest er per plek één (`Illustratie.tsx`). Alleen verkleinen, nooit
// vergroten, en geen kleurfilter: de beelden blijven zoals ze zijn goedgekeurd.
//
// Daarnaast `manifest.json` met afmetingen, bestandsgrootte en SHA-256. Daarmee
// controleert scripts/check-zappie-illustraties.mjs vóór elke build dat alles
// er is en heel is.
import sharp from "sharp";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const BRON = "ontwerp/zappie/illustraties";
const UIT = "public/assets/zappie/illustraties";
const NAMEN = ["eigen-wereld", "werkplaats", "atelier", "kust"];
const BREEDTES = [720, 1440];
const FORMATEN = {
  avif: { quality: 62, effort: 6 },
  webp: { quality: 84, effort: 6 },
};

fs.mkdirSync(UIT, { recursive: true });
const assets = [];

for (const naam of NAMEN) {
  const bron = path.join(BRON, `${naam}.webp`);
  const { width, height } = await sharp(bron).metadata();
  const bestanden = [];
  for (const breedte of BREEDTES) {
    if (breedte > width) throw new Error(`${naam}: het origineel is ${width} breed, kleiner dan ${breedte}. Niet vergroten.`);
    for (const [formaat, opties] of Object.entries(FORMATEN)) {
      const file = `${naam}-${breedte}.${formaat}`;
      const pad = path.join(UIT, file);
      const info = await sharp(bron).resize({ width: breedte })[formaat](opties).toFile(pad);
      const data = fs.readFileSync(pad);
      bestanden.push({
        file,
        width: info.width,
        height: info.height,
        bytes: data.length,
        sha256: createHash("sha256").update(data).digest("hex"),
      });
      console.log(file, `${info.width}×${info.height}`, Math.round(data.length / 1024), "KB");
    }
  }
  assets.push({ naam, bron: `${BRON}/${naam}.webp`, origineel: { width, height }, bestanden });
}

fs.writeFileSync(
  path.join(UIT, "manifest.json"),
  `${JSON.stringify({ gemaakt: "scripts/maak-zappie-illustraties.mjs", assets }, null, 2)}\n`,
);
console.log("manifest.json");
