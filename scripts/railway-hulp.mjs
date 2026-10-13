/**
 * Gedeelde stukjes voor de online versie op Railway (oktober 2026).
 *
 * Gebruikt door `npm run online` (scripts/online.mjs) en de dagelijkse
 * back-up (scripts/backup-db.mjs). Alles gaat via de Railway-opdrachtregel,
 * die met `npm i -g --prefix ~/.npm-global @railway/cli` is geïnstalleerd en
 * waarop de eigenaar is ingelogd.
 *
 * Online staat de database op de vaste schijf als /data/thuisles.db, staan
 * de afbeeldingen in /data/vragen en de Godot-spelletjes in /data/godot. Op de
 * schijf heten paden zonder /data ervoor (de schijf zelf is "/").
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const WORTEL = path.resolve(import.meta.dirname, "..");
export const DIENST = "thuisles";
export const SCHIJF = "thuisles-volume";
export const ADRES = "https://thuisles-production.up.railway.app";

const RAILWAY = [path.join(homedir(), ".npm-global", "bin", "railway"), "/usr/local/bin/railway"].find(
  (p) => existsSync(p),
);

/** Een Railway-opdracht; geeft wat hij op het scherm zet terug. */
export function railway(...args) {
  if (!RAILWAY) throw new Error("De Railway-opdrachtregel is niet gevonden (~/.npm-global/bin/railway).");
  try {
    return execFileSync(RAILWAY, args, {
      cwd: WORTEL,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
      // De 22:00-taak (launchd) kent bijna geen PATH; railway is een
      // Node-programma en moet Node kunnen vinden.
      env: { ...process.env, PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin:${process.env.PATH ?? ""}` },
    });
  } catch (fout) {
    // Laat zien wat Railway zelf zegt, niet de hele opdracht.
    const melding = `${fout.stderr ?? ""}${fout.stdout ?? ""}`.trim().split("\n").slice(-3).join(" / ");
    throw new Error(`railway ${args[0]}: ${melding || fout.message}`);
  }
}

/**
 * Een stukje JavaScript uitvoeren op de server van Railway, met Node daar.
 * Base64, zodat aanhalingstekens in de code geen probleem zijn.
 */
export function opServer(js) {
  const b64 = Buffer.from(js).toString("base64");
  return railway(
    "ssh",
    "--service",
    DIENST,
    "--",
    `echo ${b64} | base64 -d > /tmp/thuisles-hulp.mjs && node --disable-warning=ExperimentalWarning /tmp/thuisles-hulp.mjs`,
  ).trim();
}

/** Een bestand van de schijf naar de laptop. */
export function haalVanSchijf(schijfPad, lokaal) {
  railway("volume", "files", "--volume", SCHIJF, "download", schijfPad, lokaal, "--overwrite");
}

/** Een bestand van de laptop naar de schijf (overschrijft). */
export function zetOpSchijf(lokaal, schijfPad) {
  railway("volume", "files", "--volume", SCHIJF, "upload", lokaal, schijfPad, "--overwrite");
}

/**
 * Een veilige kopie van de online database, op de laptop.
 *
 * Eerst maakt de server zelf een kopie met de backupfunctie van SQLite (die
 * klopt ook als de site op dat moment iets wegschrijft), daarna komt die
 * kopie naar de laptop. Op de schijf blijft alleen /data/reservekopie.db
 * staan; die wordt elke keer overschreven.
 */
export function kopieerOnlineDatabase(lokaal) {
  const uit = opServer(`
    import { backup, DatabaseSync } from "node:sqlite";
    const db = new DatabaseSync("/data/thuisles.db", { readOnly: true });
    await backup(db, "/data/reservekopie.db");
    db.close();
    console.log("klaar");
  `);
  if (!uit.endsWith("klaar")) throw new Error(`De server kon geen kopie maken: ${uit}`);
  haalVanSchijf("/reservekopie.db", lokaal);
  return controleer(lokaal);
}

/** Opent de kopie en telt de tabellen; gooit een fout als het niet klopt. */
export function controleer(bestand) {
  const db = new DatabaseSync(bestand, { readOnly: true });
  try {
    const ok = db.prepare("pragma integrity_check").get().integrity_check;
    const tabellen = db.prepare("select count(*) as n from sqlite_master where type = 'table'").get().n;
    if (ok !== "ok" || !tabellen) throw new Error(`De kopie ${bestand} klopt niet (${ok}, ${tabellen} tabellen).`);
    return tabellen;
  } finally {
    db.close();
  }
}

/**
 * Een vingerafdruk van wat er ín de database staat (niet van het bestand:
 * twee kopieën met dezelfde inhoud kunnen net andere bytes hebben).
 */
export function inhoudsafdruk(bestand) {
  const db = new DatabaseSync(bestand, { readOnly: true });
  const hash = createHash("sha256");
  try {
    const tabellen = db
      .prepare("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name")
      .all()
      .map((r) => r.name);
    for (const t of tabellen) {
      hash.update(`\n#${t}\n`);
      for (const rij of db.prepare(`select * from "${t}"`).iterate()) {
        hash.update(JSON.stringify(rij, (_k, v) => (typeof v === "bigint" ? String(v) : v instanceof Uint8Array ? Buffer.from(v).toString("base64") : v)));
      }
    }
  } finally {
    db.close();
  }
  return hash.digest("hex");
}

function tweeCijfers(n) {
  return String(n).padStart(2, "0");
}

export function stempel(d = new Date()) {
  return `${d.getFullYear()}-${tweeCijfers(d.getMonth() + 1)}-${tweeCijfers(d.getDate())}-${tweeCijfers(d.getHours())}${tweeCijfers(d.getMinutes())}`;
}
