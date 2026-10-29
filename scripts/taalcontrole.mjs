/**
 * Taalcontrole (28 oktober 2026, opdracht eigenaar) voor de nagebouwde lessen:
 * de verhaaltjessommen en de klokles.
 *
 *   npm run taal                 zinnen eruit halen + spelling (Hunspell nl) + LanguageTool (nl)
 *   BESTANDEN=a.tsx,b.tsx npm run taal
 *
 * Haalt elke tekst die het kind ziet of hoort uit de broncode (gewone tekst,
 * en tekst met ${…}: daar komt een voorbeeldgetal of -naam in). De opmaak
 * ({getal}, [signaalwoord], _nadruk_) gaat eraf. Alle zinnen komen in
 * TAAL-CONTROLE/zinnen.txt (niet in Git), de meldingen in
 * TAAL-CONTROLE/meldingen.txt.
 *
 * De gereedschappen staan buiten het project, in ~/.thuisles-taal (Java,
 * LanguageTool 6.6, nspell met het Nederlandse woordenboek van OpenTaal).
 * Ontbreken ze, dan wordt die stap overgeslagen met een melding.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const WORTEL = new URL("../", import.meta.url).pathname;
const TOOLS = process.env.TAALTOOLS ?? join(homedir(), ".thuisles-taal");
const UIT = join(WORTEL, "TAAL-CONTROLE");
const BESTANDEN = (process.env.BESTANDEN ?? "src/components/les/lessen/verhaaltjessommen.tsx,src/components/les/lessen/klokkijken.tsx,src/components/les/vlakken/verhaal-bliepo-tuin.tsx,src/components/les/vlakken/klok-bliepo-klok.tsx,src/components/les/lessen/antwoordknoppen.ts").split(",");

/* Woorden die wel goed zijn maar niet in het woordenboek staan. */
const EIGEN = ["Bliepo", "Testkind", "Sam", "lantaarntjes", "lantaarntje", "vuurvliegjes", "vuurvliegje", "urenwijzer", "minutenwijzer", "wijzerklok", "erbij", "eraf", "Erbij", "Eraf", "vogeltjes", "vogeltje", "lichtjes", "lichtje", "kiemplantje", "is-gelijkteken", "plussom", "minsom", "kwartrondje", "getallenlijn", "paddenstoelen", "Urenwijzer", "verhaaltjessom", "verhaaltjessommen", "Instaptoets", "Eindtoets", "Eén"];
/* Woorden uit lessen die NIET nagebouwd zijn (de digitale klok); die vallen buiten deze controle. */
const BUITEN = ["urenkant", "minutenkant"];
/* Zinnen uit lessen die niet nagebouwd zijn (Tellen in vijven); gemeld in OCHTENDRAPPORT.md, niet aangepast. */
/* Plus: losse tijdnamen uit de tabel van tijdnaam() in de klokles ("5 voor ${n}"); het voorbeeldgetal maakt daar soms "5 voor 12" van, wat LanguageTool een cliché vindt (29 oktober 2026). */
const BUITEN_ZINNEN = [/^Tel door in vijven: 50, 55/, /^\d+ voor \d+\.?$/];

/* Een string in de broncode lijkt op een zin als hij letters en een spatie heeft, of met een hoofdletter begint en op een leesteken eindigt. */
function lijktZin(t) {
  if (!/[a-zà-ÿ]/i.test(t)) return false;
  if (/^[MmLlHhVvCcQqAaSsTtZz0-9 .,-]+$/.test(t)) return false; // SVG-paden
  if (/monospace|sans-serif|system-ui|Word Problems|Telling Time|How Long|Minutes Later|^use client$/.test(t)) return false; // lettertypes, namen van Synthesis
  if (/^[a-z0-9-]+$/.test(t)) return false; // ids, sleutels
  if (/^(M |C |L |\d)/.test(t) && /\d \d/.test(t)) return false; // SVG-paden
  if (/[{}();=<>]/.test(t.replace(/\{[^{}]*\}/g, "")) && !/[.?!]$/.test(t)) return false;
  if (/^[a-z][A-Za-z]+$/.test(t)) return false; // namen in code
  if (/\b(var|rgba?|px|rem|translate|data-|aria-|className|import|export)\b/.test(t)) return false;
  return / /.test(t) || /^[A-Z].*[.?!]$/.test(t) || /^(Ja|Nee|Erbij|Eraf|Weghalen|Stoppen|Nog één)$/.test(t);
}

const VOORBEELD = [3, 8, 12, 6, 15, 4, 9];
let n = 0;
function opschonen(t) {
  return t
    .replace(/\[\[[bgrum]:([^\]]+)\]\]/g, "$1")
    .replace(/\$\{[^}]*(naam|wie|Wie)[^}]*\}/g, "Sam")
    .replace(/\$\{[^}]*\}/g, () => String(VOORBEELD[n++ % VOORBEELD.length]))
    .replace(/\{([^{}]*)\}/g, "$1")
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function zinnenUit(bron) {
  const lijst = [];
  /* "…", '…' en `…` (zonder geneste backticks). Commentaar eerst weghalen. */
  const zonder = bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const re = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(zonder))) {
    const t = m[1] ?? m[2] ?? m[3];
    if (t && lijktZin(t)) {
      const z = opschonen(t);
      if (!/^[MmLlHhVvCcQqAaSsTtZz0-9 .,-]+$/.test(z)) lijst.push(z);
    }
  }
  /* JSX-tekst tussen tags. */
  for (const j of zonder.matchAll(/>\s*([A-Z][^<>{}\n]{3,}[.?!])\s*</g)) lijst.push(opschonen(j[1]));
  return lijst;
}

mkdirSync(UIT, { recursive: true });
const alle = new Map();
for (const b of BESTANDEN) {
  const pad = join(WORTEL, b);
  if (!existsSync(pad)) continue;
  for (const z of zinnenUit(readFileSync(pad, "utf8"))) if (!alle.has(z)) alle.set(z, b.split("/").pop());
}
const zinnen = [...alle.keys()].filter((z) => !BUITEN_ZINNEN.some((r) => r.test(z)));
writeFileSync(join(UIT, "zinnen.txt"), zinnen.map((z) => `${alle.get(z)}\t${z}`).join("\n") + "\n");
console.log(`Taalcontrole: ${zinnen.length} verschillende zinnen uit ${BESTANDEN.length} bestanden (TAAL-CONTROLE/zinnen.txt).`);

const meldingen = [];

/* 1. Spelling met Hunspell-woordenboek (nspell + OpenTaal nl). */
const spel = join(TOOLS, "spel.mjs");
if (existsSync(spel)) {
  const r = spawnSync("node", [spel], { input: zinnen.join("\n"), cwd: TOOLS, env: { ...process.env, EXTRA: EIGEN.join(",") }, encoding: "utf8" });
  for (const regel of (r.stdout ?? "").split("\n").filter(Boolean)) {
    const [woord, n, voorstel] = regel.split("\t");
    if (BUITEN.includes(woord) || EIGEN.includes(woord) || EIGEN.includes(woord.toLowerCase()) || /[a-z]Sam$/.test(woord)) continue;
    const voorbeeld = zinnen.find((z) => new RegExp(`\\b${woord}\\b`).test(z)) ?? "";
    meldingen.push(`SPELLING\t${woord} (${n}×; voorstel: ${voorstel || "geen"})\t${voorbeeld}`);
  }
} else console.log(`⚠️  Spellingcontrole overgeslagen: ${spel} ontbreekt.`);

/* 2. LanguageTool (Nederlands), zin voor zin. */
const java = readdirSync(TOOLS).find((d) => d.startsWith("jdk"));
const lt = readdirSync(TOOLS).find((d) => d.startsWith("LanguageTool"));
if (java && lt) {
  const tekst = join(UIT, "lt-invoer.txt");
  writeFileSync(tekst, zinnen.map((z) => (/[.?!]$/.test(z) ? z : z + ".")).join("\n\n") + "\n");
  const uit = execFileSync(join(TOOLS, java, "Contents/Home/bin/java"), ["-jar", join(TOOLS, lt, "languagetool-commandline.jar"), "-l", "nl", "--json", tekst], { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] });
  const json = JSON.parse(uit.slice(uit.indexOf("{")));
  const bron = readFileSync(tekst, "utf8");
  for (const m of json.matches ?? []) {
    const begin = bron.lastIndexOf("\n", m.offset) + 1;
    const eind = bron.indexOf("\n", m.offset);
    const zin = bron.slice(begin, eind);
    const stuk = bron.slice(m.offset, m.offset + m.length);
    /* Spelling doet Hunspell al; namen en hoofdletters aan het begin van knoppen negeren. */
    if (m.rule?.issueType === "misspelling" && (EIGEN.includes(stuk) || BUITEN.includes(stuk))) continue;
    /* Knoppen en zinsdelen ("half 5", "een klok") beginnen met een kleine letter; dat is goed. */
    if (m.rule?.id === "UPPERCASE_SENTENCE_START" && zin.split(" ").length <= 4) continue;
    if (m.rule?.id === "UPPERCASE_SENTENCE_START" && /^[a-z]/.test(zin) && !/[.?!]\s*$/.test(zin.slice(0, -1))) continue;
    /* Haakjes en aanhalingstekens die van het uitlezen van de code komen, en sommen ("5 + ? = 9"). */
    if (m.rule?.id === "UNPAIRED_BRACKETS" || (m.rule?.id === "SPATIE_LEESTEKEN" && /[+=−-] \?/.test(stuk))) continue;
    if (/[A-Za-z]Sam\b/.test(stuk)) continue; // ${…} midden in een woord
    meldingen.push(`LANGUAGETOOL\t${m.rule?.id}: ${m.message} [«${stuk}» → ${(m.replacements ?? []).slice(0, 3).map((r) => r.value).join(" / ")}]\t${zin}`);
  }
} else console.log("⚠️  LanguageTool overgeslagen: Java of LanguageTool ontbreekt in " + TOOLS);

/* 3. Eigen regels: dingen die al eens fout gingen. */
const REGELS = [
  [/\b(zijn|is|waren)\b[^.?!]*\b(lamp|lampen|lampjes|lampje)\b[^.?!]*\baan\b/i, "lampen 'branden', niet 'zijn aan'"],
  [/\b(lamp|lampen|lampjes|lampje)\b[^.?!]*\b(zijn|is|waren)\b[^.?!]*\baan\b/i, "lampen 'branden', niet 'zijn aan'"],
  [/\b1 (lampjes|lampen|bloemen|vogeltjes|ballonnen|munten|potten|lantaarntjes|lichtjes)\b/, "1 + meervoud"],
  [/\bEr (gaan|zijn|vliegen|knappen|komen|staan|zitten|branden) 1\b/, "werkwoord meervoud bij 1"],
  [/\bhalf past\b|\bo'clock\b|\bquarter\b/i, "Engels"],
  [/\bbel\b/i, "'bel' (bedoeld: rondje?)"],
  [/\bzweven?\b[^.?!]*\bweg\b/i, "'zweven weg' (vliegen weg?)"],
  [/ ,|,,|\.\.(?!\.)| \./, "leesteken"],
  [/\b(\w+) \1\b/i, "dubbel woord"],
];
for (const z of zinnen) for (const [re, uitleg] of REGELS) if (re.test(z)) meldingen.push(`EIGEN REGEL\t${uitleg}\t${z}`);

writeFileSync(join(UIT, "meldingen.txt"), meldingen.join("\n") + "\n");
const per = {};
for (const m of meldingen) per[m.split("\t")[0]] = (per[m.split("\t")[0]] ?? 0) + 1;
console.log(`Meldingen: ${meldingen.length} (${Object.entries(per).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ") || "geen"}) → TAAL-CONTROLE/meldingen.txt`);
process.exit(meldingen.length && process.env.STRENG ? 1 : 0);
