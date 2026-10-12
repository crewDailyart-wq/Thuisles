/**
 * `npm start`: de site starten zoals hij gebouwd is (online op Railway).
 *
 * Staat THUISLES_AFBEELDINGEN (online: /data/vragen, op de vaste schijf), dan
 * worden eerst de afbeeldingen uit public/vragen daar bijgezet. Wat er al
 * staat, zoals een online upload, wordt nooit overschreven. Op de laptop staat
 * die variabele niet en verandert er niets.
 */

import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
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

const next = spawn(process.execPath, [path.join(WORTEL, "node_modules", "next", "dist", "bin", "next"), "start", ...process.argv.slice(2)], {
  stdio: "inherit",
});
for (const sein of ["SIGTERM", "SIGINT"]) process.on(sein, () => next.kill(sein));
next.on("exit", (code, sein) => process.exit(code ?? (sein ? 1 : 0)));
