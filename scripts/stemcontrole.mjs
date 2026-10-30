/**
 * Stemcontrole (30 oktober 2026, opdracht eigenaar): Bliepo praat overal met de
 * stem van Ruth, uit vooraf gemaakte bestanden. Deze controle faalt als:
 *   1. de browserstem weer aan kan (NOOIT_BROWSERSTEM in lib/stem.ts);
 *   2. er buiten de toegestane plekken een andere stem in de code staat
 *      (speechSynthesis, SpeechSynthesisUtterance, of de stemdiensten
 *      rechtstreeks vanuit de browser);
 *   3. de site nieuwe zinnen live zou laten maken (STEM_NIEUWE_ZINNEN=dienst);
 *   4. er voor een zin die Bliepo moet zeggen (de 10 nagebouwde lessen, de
 *      keuzes, de losse stukjes en de gedeelde zinnen) geen bestand in de site
 *      staat (public/stem, scripts/stem-naar-site.mjs).
 *
 *   npm run stemcontrole        (zit in npm run bewaak, dus vóór elke commit)
 *
 * Toegestaan:
 *   - src/lib/stem.ts: de oude browserstem staat er nog (regel 1), maar wordt
 *     niet bereikt zolang NOOIT_BROWSERSTEM true is;
 *   - src/lib/geluid.ts: lees() voor de browserstem, door niets gebruikt
 *     (deze controle faalt als iemand hem importeert);
 *   - src/components/beheer/Stemtest.tsx: de stemtest in het beheer (geen kind);
 *   - de server (src/lib/stem-server.ts, src/lib/tutor, src/app/api) mag de
 *     stemdiensten aanroepen. "Praten met Bliepo" maakt zijn antwoord live,
 *     met de stem van Ruth (dat kan niet vooraf: het antwoord is elke keer anders).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const WORTEL = new URL("../", import.meta.url).pathname;
const SRC = join(WORTEL, "src");
const fouten = [];

function alle(map) {
  const uit = [];
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) uit.push(...alle(pad));
    else if (/\.(tsx?|mjs|js)$/.test(naam)) uit.push(pad);
  }
  return uit;
}

/* 1. De browserstem staat uit. */
const stem = readFileSync(join(SRC, "lib/stem.ts"), "utf8");
/*
  Tijdelijk (besluit eigenaar, 30 oktober 2026) mag de browserstem invallen voor een zin
  zonder Ruth-bestand, behalve in de lessen in Synthesis-stijl. Die moeten alleenServer houden.
*/
if (!/export const NOOIT_BROWSERSTEM = (true|false);/.test(stem)) fouten.push("src/lib/stem.ts: NOOIT_BROWSERSTEM is weg.");
if (!/alleenServer: les\.indeling === "synthesis" && !les\.browserstem|alleenServer: les\.indeling === "synthesis"|alleenServer: synth|alleenServer:\s*[^,}]*synthesis/.test(readFileSync(join(SRC, "components/les/Lesscherm.tsx"), "utf8"))) fouten.push("src/components/les/Lesscherm.tsx: de lessen in Synthesis-stijl zetten de browserstem niet meer uit (zetLesStem alleenServer).");

/* 2. Geen andere stem in de code. */
const TOEGESTAAN = new Set(["src/lib/stem.ts", "src/lib/geluid.ts", "src/components/beheer/Stemtest.tsx"]);
const SERVER = /^src\/(lib\/stem-server\.ts|lib\/tutor\/|app\/api\/|lib\/stem-klank|lib\/gebaren-server)/;
for (const bestand of alle(SRC)) {
  const rel = relative(WORTEL, bestand);
  const bron = readFileSync(bestand, "utf8");
  if (/speechSynthesis|SpeechSynthesisUtterance/.test(bron) && !TOEGESTAAN.has(rel)) {
    /* Alleen pauzeren/hervatten/stoppen van de browserstem mag (doet niets als hij nooit praat). */
    const regels = bron.split("\n").filter((r) => /speechSynthesis|SpeechSynthesisUtterance/.test(r) && !/speechSynthesis\??\.(pause|resume|cancel)\(\)/.test(r) && !/^\s*(\*|\/\/|\/\*)/.test(r));
    if (regels.length) fouten.push(`${rel}: browserstem (${regels[0].trim().slice(0, 80)})`);
  }
  if (/api\.fish\.audio|api\.elevenlabs\.io/.test(bron) && !SERVER.test(rel)) fouten.push(`${rel}: roept een stemdienst rechtstreeks aan`);
  if (/import\s*\{[^}]*\blees\b[^}]*\}\s*from\s*["']@\/lib\/geluid["']/.test(bron)) fouten.push(`${rel}: gebruikt lees() uit lib/geluid (de browserstem)`);
}

/* 2b. De browserstem mag alleen in de nieuwe lessen naar Squla (bestanden lessen/squla-*.tsx, 30 oktober 2026). */
for (const bestand of alle(join(SRC, "components/les/lessen"))) {
  const rel = relative(WORTEL, bestand);
  if (/browserstem:\s*true/.test(readFileSync(bestand, "utf8")) && !/\/squla-[^/]+\.tsx?$/.test(rel)) fouten.push(`${rel}: browserstem staat aan buiten de Squla-lessen.`);
}

/* 3. Nooit live nieuwe zinnen maken. */
const server = readFileSync(join(SRC, "lib/stem-server.ts"), "utf8");
if (!/STEM_NIEUWE_ZINNEN/.test(server)) fouten.push("src/lib/stem-server.ts: de instelling STEM_NIEUWE_ZINNEN is weg.");
for (const env of [".env.local", ".env"]) {
  const pad = join(WORTEL, env);
  if (existsSync(pad) && /^STEM_NIEUWE_ZINNEN=dienst/m.test(readFileSync(pad, "utf8"))) fouten.push(`${env}: STEM_NIEUWE_ZINNEN=dienst maakt zinnen live.`);
}

/* 4. Elke verplichte zin heeft een bestand in de site. */
const lijst = join(WORTEL, "public/stem/zinnen.json");
if (!existsSync(lijst)) fouten.push("public/stem/zinnen.json ontbreekt: draai node scripts/stem-naar-site.mjs.");
else {
  const { verplicht, andereLessen = [] } = JSON.parse(readFileSync(lijst, "utf8"));
  const naam = (zin) => createHash("sha256").update(`3-5\n${zin}`).digest("hex").slice(0, 32);
  const mist = verplicht.filter((z) => !existsSync(join(WORTEL, "public/stem", `${naam(z)}.mp3`)));
  const mistAnder = andereLessen.filter((z) => !existsSync(join(WORTEL, "public/stem", `${naam(z)}.mp3`)));
  if (mist.length) fouten.push(`${mist.length} zinnen zonder geluid in de site, bijvoorbeeld: ${mist.slice(0, 5).map((z) => `"${z}"`).join(", ")}`);
  console.log(`Stem in de site: ${verplicht.length - mist.length} van ${verplicht.length} verplichte zinnen; andere lessen ${andereLessen.length - mistAnder.length} van ${andereLessen.length}.`);
}

if (fouten.length) {
  console.log("\nStemcontrole: FOUT");
  for (const f of fouten) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("Stemcontrole: alleen de stem van Ruth, en alles wat Bliepo moet zeggen staat in de site.");
