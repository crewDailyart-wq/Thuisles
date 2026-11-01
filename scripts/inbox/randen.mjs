/**
 * Witte randjes weg (1 november 2026, vraag Sara): bij elk plaatje in
 * public/voorwerpen/ (of alleen de genoemde namen) wordt de rand schoongemaakt:
 *  1. randpixels (naast doorzichtig) die licht/wit zijn worden doorzichtig;
 *  2. de rand wordt 1-2 pixels ingekort (vanaf álle doorzichtige plekken, ook
 *     gaten binnenin, zoals een donutgat of een hengsel);
 *     De buitenste nieuwe pixelrij wordt half doorzichtig: een zachte rand zonder pixeltrapjes.
 * Het oude plaatje gaat eerst naar plaatjes-backup/<naam>-<tijd>.png, en
 * status.json krijgt een nieuwe versie (zodat de browser het nieuwe laadt).
 *
 *   node scripts/inbox/randen.mjs [naam1,naam2]
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { BACKUP, WORTEL, schoneRand } from "./gedeeld.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  const MAP = path.join(WORTEL, "public/voorwerpen");
  const STATUS = path.join(WORTEL, "src/lib/voorwerpen/status.json");
  const status = JSON.parse(readFileSync(STATUS, "utf8"));
  const namen = process.argv[2] ? process.argv[2].split(",") : readdirSync(MAP).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)).filter((n) => status[n]?.bron === "eigen");
  const stempel = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  mkdirSync(BACKUP, { recursive: true });
  for (const n of namen) {
    const f = path.join(MAP, `${n}.png`);
    copyFileSync(f, path.join(BACKUP, `${n}-${stempel}.png`));
    writeFileSync(f, await schoneRand(readFileSync(f)));
    status[n] = { ...status[n], v: (status[n]?.v ?? 0) + 1, verbeterd: [...new Set([...(status[n]?.verbeterd ?? []), "randen"])] };
  }
  writeFileSync(STATUS, JSON.stringify(Object.fromEntries(Object.entries(status).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
  console.log(`Randen schoongemaakt: ${namen.length} plaatjes (backup in plaatjes-backup/*-${stempel}.png).`);
}
