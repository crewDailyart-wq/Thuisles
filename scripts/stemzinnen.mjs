/**
 * STEMZINNEN.md maken (27 oktober 2026, opdracht eigenaar): alle zinnen die
 * Bliepo in de lessen zegt en die nog NIET met de gekozen stem (Ruth) bewaard
 * zijn, per les. Voor nu leest de browser die voor (STEM_NIEUWE_ZINNEN=browser,
 * lib/stem-server.ts); later kunnen ze in één keer met de stem van de keuze
 * van de eigenaar gemaakt worden.
 *
 *   npm run stemzinnen            bewaarde zinnen van de laptop (data/stem)
 *   ONLINE=1 npm run stemzinnen   ook de bewaarde zinnen van de online site
 *
 * Hoe: de zinnen in `l.zeg(…)` en `l.wijsAan(…)` van elke les
 * (src/components/les/lessen) worden uit de broncode gehaald; een zin met
 * `${…}` (een getal of naam die per keer anders is) staat erbij als
 * patroon. Wat de site zelf als nieuw noteerde (stem/nieuwe-zinnen.txt)
 * komt er onderaan bij.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const LESSEN = path.join(WORTEL, "src/components/les/lessen");
const STEM = path.join(WORTEL, "data/stem");

/** Zoals het lesscherm de zin uitspreekt: zonder opmaak ({getal}, *nadruk*). */
const kaal = (z) => z.replace(/\{(\d+):[a-z]+\}/g, "{$1}").replace(/[{}*]/g, "").replace(/\s+/g, " ").trim();

/* 1. Bewaarde zinnen (de .txt naast elk geluid). */
const bewaard = new Set();
function leesMap(map) {
  if (!existsSync(map)) return;
  for (const f of readdirSync(map)) {
    /* Alleen de zinnen van Ruth (z-…); de oude Fish Audio-zinnen tellen niet als bewaard. */
    if (!f.startsWith("z-") || !f.endsWith(".txt")) continue;
    try {
      bewaard.add(kaal(readFileSync(path.join(map, f), "utf8")));
    } catch {}
  }
}
leesMap(STEM);
if (process.env.ONLINE === "1") {
  const { opServer } = await import("./railway-hulp.mjs");
  const uit = opServer(`
    import fs from "node:fs"; import path from "node:path";
    const map = path.join(path.dirname(process.env.THUISLES_DB ?? "/data/thuisles.db"), "stem");
    const z = [];
    for (const f of fs.readdirSync(map)) if (f.startsWith("z-") && f.endsWith(".txt")) { try { z.push(fs.readFileSync(path.join(map, f), "utf8").trim()); } catch {} }
    console.log(JSON.stringify(z));
  `);
  for (const z of JSON.parse(uit.trim().split("\n").pop())) bewaard.add(kaal(z));
}

/* 2. De zinnen per les uit de broncode. */
function stringsIn(arg) {
  const uit = [];
  const re = /"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(arg))) uit.push({ tekst: (m[1] ?? m[2]).replace(/\\"/g, '"'), patroon: m[2] !== undefined && m[2].includes("${") });
  return uit;
}
const perLes = new Map();
for (const f of readdirSync(LESSEN).filter((f) => /\.(tsx?|ts)$/.test(f))) {
  const bron = readFileSync(path.join(LESSEN, f), "utf8");
  const ids = [...bron.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map((m) => ({ id: m[1], plek: m.index }));
  const re = /l\.(zeg|wijsAan)\(/g;
  let m;
  while ((m = re.exec(bron))) {
    /* tot de bijpassende sluithaak */
    let diep = 1;
    let i = m.index + m[0].length;
    for (; i < bron.length && diep > 0; i++) {
      if (bron[i] === "(") diep++;
      else if (bron[i] === ")") diep--;
    }
    let args = stringsIn(bron.slice(m.index + m[0].length, i - 1));
    if (m[1] === "wijsAan") args = args.slice(1);
    /* De les: de laatste id vóór deze zin (het draaiboek); staat de zin in een hulpfunctie bovenaan het bestand, dan "<bestand> (gedeeld)". */
    const les = ids.filter((x) => x.plek < m.index).pop()?.id ?? `${f.replace(/\.tsx?$/, "")} (gedeeld)`;
    const lijst = perLes.get(les) ?? new Map();
    for (const a of args) {
      const z = kaal(a.tekst);
      if (!z || z.length < 2) continue;
      lijst.set(z, a.patroon);
    }
    perLes.set(les, lijst);
  }
}

/* 3. Wat de site zelf noteerde. */
const genoteerd = existsSync(path.join(STEM, "nieuwe-zinnen.txt"))
  ? readFileSync(path.join(STEM, "nieuwe-zinnen.txt"), "utf8").split("\n").map(kaal).filter(Boolean)
  : [];

let aantal = 0;
let tekens = 0;
const regels = [
  "# Stemzinnen: nog te maken met de gekozen stem",
  "",
  "Automatisch gemaakt met `npm run stemzinnen` (" + new Date().toISOString().slice(0, 10) + "). Niet met de hand bewerken.",
  "",
  "Voor nu leest de browser deze zinnen voor (geen tegoed; `STEM_NIEUWE_ZINNEN=browser`).",
  "Wisselen naar de stem van de eigenaar: in Railway `STEM_NIEUWE_ZINNEN=dienst` zetten;",
  "dan maakt de site elke zin hieronder de eerste keer met de gekozen stem (STEM_DIENST) en bewaart hem.",
  "Zinnen met `…` hebben een stukje dat per keer anders is (een getal of naam).",
  "",
];
const blok = [];
for (const [les, lijst] of [...perLes.entries()].sort()) {
  const nieuw = [...lijst.entries()].filter(([z]) => !bewaard.has(z));
  if (!nieuw.length) continue;
  blok.push(`## ${les} (${nieuw.length})`, "");
  for (const [z, patroon] of nieuw) {
    const toon = patroon ? z.replace(/\$\{[^}]*\}/g, "…") : z;
    blok.push(`- ${toon}`);
    aantal++;
    tekens += toon.length;
  }
  blok.push("");
}
const los = genoteerd.filter((z) => ![...perLes.values()].some((l) => l.has(z)) && !bewaard.has(z));
if (los.length) {
  blok.push(`## Door de site genoteerd, buiten de lessen (${los.length})`, "");
  for (const z of los) {
    blok.push(`- ${z}`);
    aantal++;
    tekens += z.length;
  }
  blok.push("");
}
regels.push(`**Totaal: ${aantal} zinnen, ${tekens} tekens.** (Al met Ruth bewaard en dus niet in deze lijst: ${bewaard.size} zinnen.)`, "", ...blok);
writeFileSync(path.join(WORTEL, "STEMZINNEN.md"), regels.join("\n"));
console.log(`STEMZINNEN.md: ${aantal} zinnen, ${tekens} tekens (bewaard bekend: ${bewaard.size}).`);
