/**
 * De stembestanden van Ruth (data/stem) naar de online schijf (28 oktober 2026).
 *
 *   node scripts/online-stem.mjs
 *
 * De stem staat niet in Git (te groot) en niet in de database. Online leest de
 * site hem van /data/stem op de Railway-schijf. Dit script zet alleen de
 * bestanden erbij die online nog ontbreken, in één ingepakt bestand, en pakt
 * dat op de server uit. Er wordt online niets overschreven of verwijderd, en
 * de database wordt niet aangeraakt (HARDE REGEL 6).
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { WORTEL, opServer, zetOpSchijf } from "./railway-hulp.mjs";

const MAP = path.join(WORTEL, "data", "stem");
const lokaal = readdirSync(MAP).filter((f) => !f.startsWith("."));

const online = new Set(
  opServer(`
    import fs from "node:fs";
    fs.mkdirSync("/data/stem", { recursive: true });
    console.log(fs.readdirSync("/data/stem").join("\\n"));
  `)
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean),
);
const ontbreekt = lokaal.filter((f) => !online.has(f));
console.log(`Stem: ${lokaal.length} bestanden op de laptop, ${online.size} online, ${ontbreekt.length} ontbreken online.`);
if (!ontbreekt.length) process.exit(0);

const tmp = mkdtempSync(path.join(tmpdir(), "online-stem-"));
const lijst = path.join(tmp, "lijst.txt");
const pak = path.join(tmp, "stem.tgz");
writeFileSync(lijst, ontbreekt.join("\n"));
execFileSync("tar", ["-czf", pak, "-C", MAP, "-T", lijst]);
zetOpSchijf(pak, "/stem-erbij.tgz");
const uit = opServer(`
  import { execFileSync } from "node:child_process";
  import fs from "node:fs";
  /* -k: nooit een bestaand bestand overschrijven. */
  execFileSync("tar", ["-xzkf", "/data/stem-erbij.tgz", "-C", "/data/stem"]);
  fs.rmSync("/data/stem-erbij.tgz");
  console.log("klaar " + fs.readdirSync("/data/stem").length);
`);
rmSync(tmp, { recursive: true, force: true });
console.log(`  ${uit}`);
if (!/^klaar/.test(uit.split("\n").pop())) process.exit(1);
