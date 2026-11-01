/**
 * Stap 1 van "verwerk de inbox": van elk plaatje in plaatjes-inbox/ een klein
 * voorbeeld maken (plaatjes-inbox/.voorbeeld/), zodat Claude kan bekijken wat
 * erop staat. Er wordt niets vervangen.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { INBOX, VOORBEELD, inboxBestanden } from "./gedeeld.mjs";

mkdirSync(VOORBEELD, { recursive: true });
const bestanden = inboxBestanden();
if (!bestanden.length) console.log("De inbox is leeg.");
for (const f of bestanden) {
  const doel = path.join(VOORBEELD, `${f}.klein.png`);
  await sharp(path.join(INBOX, f)).rotate().resize(384, 384, { fit: "inside" }).png().toFile(doel);
  console.log(doel);
}
