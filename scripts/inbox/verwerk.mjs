/**
 * Stap 3 van "verwerk de inbox": vervangen, ALLEEN na akkoord van Sara
 * (koppeling.json heeft dan "akkoord": true; Claude zet dat pas als Sara
 * akkoord heeft gegeven op het controle-overzicht).
 *
 * Per plaatje: het huidige plaatje gaat naar plaatjes-backup/, het nieuwe
 * wordt uitgeknipt, verkleind en zuinig opgeslagen als
 * public/voorwerpen/<naam>.png, status.json krijgt een nieuwe versie (zodat de
 * browser het oude niet uit zijn geheugen haalt), en het origineel gaat naar
 * plaatjes-verwerkt/. Daarna worden MAGNIFIC-PROMPTS.md en PLAATJES-STAND.md
 * bijgewerkt. Plaatjes met twijfel (naam null) blijven in de inbox staan.
 */
import { readFileSync, writeFileSync, mkdirSync, renameSync, copyFileSync, existsSync, appendFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { INBOX, VERWERKT, BACKUP, KOPPELING, WORTEL, VOORBEELD, maakVoorwerp } from "./gedeeld.mjs";

const k = JSON.parse(readFileSync(KOPPELING, "utf8"));
if (k.akkoord !== true) {
  console.error('Nog geen akkoord van Sara: eerst het controle-overzicht laten zien (zet daarna "akkoord": true).');
  process.exit(1);
}
const STATUS = path.join(WORTEL, "src/lib/voorwerpen/status.json");
const status = JSON.parse(readFileSync(STATUS, "utf8"));
const stempel = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
mkdirSync(VERWERKT, { recursive: true });
mkdirSync(BACKUP, { recursive: true });

const gedaan = [];
const blijft = [];
for (const p of k.plaatjes) {
  if (!p.naam) {
    blijft.push(p);
    continue;
  }
  const doel = path.join(WORTEL, "public/voorwerpen", `${p.naam}.png`);
  if (existsSync(doel)) copyFileSync(doel, path.join(BACKUP, `${p.naam}-${stempel}.png`));
  const buf = await maakVoorwerp(path.join(INBOX, p.bestand));
  writeFileSync(doel, buf);
  status[p.naam] = { bron: "eigen", v: (status[p.naam]?.v ?? 0) + 1 };
  renameSync(path.join(INBOX, p.bestand), path.join(VERWERKT, `${stempel}-${p.naam}${path.extname(p.bestand)}`));
  rmSync(path.join(VOORBEELD, `${p.bestand}.uitgeknipt.png`), { force: true });
  rmSync(path.join(VOORBEELD, `${p.bestand}.klein.png`), { force: true });
  appendFileSync(path.join(VERWERKT, "LOGBOEK.md"), `- ${stempel}: ${p.bestand} → ${p.naam}.png (${Math.round(buf.length / 1024)} kB), oude in plaatjes-backup/${p.naam}-${stempel}.png\n`);
  gedaan.push(`${p.naam} (${Math.round(buf.length / 1024)} kB)`);
}
writeFileSync(STATUS, JSON.stringify(Object.fromEntries(Object.entries(status).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
writeFileSync(KOPPELING, JSON.stringify({ akkoord: false, plaatjes: blijft }, null, 2) + "\n");
if (!blijft.length) for (const f of ["koppeling.json", "overzicht.html", "overzicht.png"]) rmSync(path.join(INBOX, f), { force: true });
console.log(`Vervangen: ${gedaan.join(", ") || "niets"}`);
if (blijft.length) console.log(`Nog in de inbox (twijfel): ${blijft.map((p) => p.bestand).join(", ")}`);
execSync("node scripts/voorwerpen.mjs", { cwd: WORTEL, stdio: "inherit" });
