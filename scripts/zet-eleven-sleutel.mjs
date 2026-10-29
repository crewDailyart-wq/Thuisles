/**
 * Zet de ElevenLabs-sleutel van het klembord in .env.local (28 oktober 2026).
 *
 *   1. kopieer de nieuwe sleutel in ElevenLabs (Developers → API Keys);
 *   2. typ:  node scripts/zet-eleven-sleutel.mjs
 *
 * De sleutel wordt niet getoond: alleen de eerste en laatste paar tekens, ter
 * controle. Het bestand .env.local staat niet in Git.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";

const BESTAND = new URL("../.env.local", import.meta.url).pathname;
const sleutel = execFileSync("pbpaste", { encoding: "utf8" }).trim();

if (!/^sk_[A-Za-z0-9]{20,}$/.test(sleutel)) {
  console.log("Op het klembord staat geen ElevenLabs-sleutel (die begint met sk_). Kopieer de sleutel en probeer het opnieuw.");
  process.exit(1);
}
if (!existsSync(BESTAND)) {
  console.log(".env.local niet gevonden.");
  process.exit(1);
}
copyFileSync(BESTAND, `${BESTAND}.voor-nieuwe-sleutel`);
const regels = readFileSync(BESTAND, "utf8").split("\n");
let gevonden = false;
const nieuw = regels.map((r) => {
  if (/^ELEVEN_API_KEY=/.test(r)) {
    gevonden = true;
    return `ELEVEN_API_KEY=${sleutel}`;
  }
  return r;
});
if (!gevonden) nieuw.push(`ELEVEN_API_KEY=${sleutel}`);
writeFileSync(BESTAND, nieuw.join("\n"), { mode: 0o600 });
console.log(`Klaar: de nieuwe sleutel staat in .env.local (${sleutel.slice(0, 5)}…${sleutel.slice(-3)}). De oude staat in .env.local.voor-nieuwe-sleutel.`);
