/**
 * Eenmalig: de Godot-spelletjes van de online site halen, in public/godot.
 *
 *   node scripts/haal-godot.mjs
 *
 * Waarom: sinds 13 oktober 2026 bouwt Railway de site uit GitHub, en de
 * Godot-export staat niet in Git (te groot). Bij de eerste bouw uit GitHub
 * stonden de spelletjes nog niet op de vaste schijf. Dit script haalde ze
 * tijdens die bouw van de site die toen nog online stond (die ze wél had);
 * scripts/start.mjs zette ze daarna op de schijf. Daarna levert
 * app/godot/[...pad]/route.ts ze van de schijf, en zet `npm run online` er
 * nieuwe versies op.
 *
 * Elk bestand wordt gecontroleerd op de grootte die de server opgeeft. Lukt
 * één bestand niet, dan stopt het script met een fout, zodat de bouw mislukt
 * en de site die online staat gewoon blijft draaien.
 */

import { mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const BRON = process.env.GODOT_BRON ?? "https://thuisles-production.up.railway.app";
const MAP = "spellen";
const BESTANDEN = [
  "index.html",
  "index.js",
  "index.wasm",
  "index.pck",
  "index.png",
  "index.audio.worklet.js",
  "index.audio.position.worklet.js",
];

const doel = path.join(WORTEL, "public", "godot", MAP);
mkdirSync(doel, { recursive: true });

for (const naam of BESTANDEN) {
  const adres = `${BRON}/godot/${MAP}/${naam}`;
  const antwoord = await fetch(adres);
  if (!antwoord.ok) {
    console.error(`[haal-godot] ${adres}: ${antwoord.status}`);
    process.exit(1);
  }
  const bytes = Buffer.from(await antwoord.arrayBuffer());
  const verwacht = Number(antwoord.headers.get("content-length") ?? bytes.length);
  if (bytes.length !== verwacht) {
    console.error(`[haal-godot] ${naam}: ${bytes.length} van de ${verwacht} bytes`);
    process.exit(1);
  }
  const bestand = path.join(doel, naam);
  rmSync(bestand, { force: true });
  writeFileSync(bestand, bytes);
  console.log(`[haal-godot] ${naam}: ${(statSync(bestand).size / 1024).toFixed(0)} kB`);
}
console.log(`[haal-godot] klaar: ${BESTANDEN.length} bestanden in public/godot/${MAP}`);
