/**
 * `npm start`: de site starten zoals hij gebouwd is (online op Railway).
 *
 * Staat THUISLES_AFBEELDINGEN (online: /data/vragen, op de vaste schijf), dan
 * worden eerst de afbeeldingen uit public/vragen daar bijgezet. Wat er al
 * staat, zoals een online upload, wordt nooit overschreven. Op de laptop staat
 * die variabele niet en verandert er niets.
 *
 * Staat THUISLES_GODOT (online: /data/godot) én zit er een Godot-export in
 * deze bouw (public/godot), dan gaat die ook naar de schijf: wat ontbreekt of
 * een andere grootte heeft. Een bouw uit GitHub heeft geen public/godot; dan
 * gebeurt er niets en levert app/godot/[...pad]/route.ts de spelletjes van de
 * schijf.
 */

import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const doel = process.env.THUISLES_AFBEELDINGEN;

if (doel) {
  const bron = path.join(WORTEL, "public", "vragen");
  mkdirSync(doel, { recursive: true });
  let erbij = 0;
  for (const f of readdirSync(bron)) {
    if (f.startsWith(".") || existsSync(path.join(doel, f))) continue;
    copyFileSync(path.join(bron, f), path.join(doel, f));
    erbij++;
  }
  console.log(`[thuisles] afbeeldingen: ${erbij} bijgezet in ${doel}`);
}

/*
  Werkbladen en posters die op de laptop zijn geüpload, komen via Git mee in
  public/werkbladen. Online staan ze op de schijf naast de afbeeldingen
  (src/lib/data/werkbladen.ts); hier worden ze bijgezet, zonder iets te
  overschrijven, net als de afbeeldingen.
*/
const werkbladDoel =
  process.env.THUISLES_WERKBLADEN ?? (doel ? path.join(path.dirname(doel), "werkbladen") : null);
const werkbladBron = path.join(WORTEL, "public", "werkbladen");
if (werkbladDoel && existsSync(werkbladBron)) {
  mkdirSync(werkbladDoel, { recursive: true });
  let erbij = 0;
  for (const f of readdirSync(werkbladBron)) {
    if (f.startsWith(".") || existsSync(path.join(werkbladDoel, f))) continue;
    copyFileSync(path.join(werkbladBron, f), path.join(werkbladDoel, f));
    erbij++;
  }
  console.log(`[thuisles] werkbladen: ${erbij} bijgezet in ${werkbladDoel}`);
}

const godotDoel = process.env.THUISLES_GODOT;
const godotBron = path.join(WORTEL, "public", "godot");
if (godotDoel && existsSync(godotBron)) {
  let bijgewerkt = 0;
  const kopieer = (bron, doelMap) => {
    mkdirSync(doelMap, { recursive: true });
    for (const d of readdirSync(bron, { withFileTypes: true })) {
      if (d.name.startsWith(".")) continue;
      const van = path.join(bron, d.name);
      const naar = path.join(doelMap, d.name);
      if (d.isDirectory()) {
        kopieer(van, naar);
      } else if (!existsSync(naar) || statSync(naar).size !== statSync(van).size) {
        copyFileSync(van, naar);
        bijgewerkt++;
      }
    }
  };
  kopieer(godotBron, godotDoel);
  console.log(`[thuisles] godot: ${bijgewerkt} bestanden bijgewerkt in ${godotDoel}`);
}

const next = spawn(process.execPath, [path.join(WORTEL, "node_modules", "next", "dist", "bin", "next"), "start", ...process.argv.slice(2)], {
  stdio: "inherit",
});
for (const sein of ["SIGTERM", "SIGINT"]) process.on(sein, () => next.kill(sein));
next.on("exit", (code, sein) => process.exit(code ?? (sein ? 1 : 0)));
