/**
 * Een gerichte wijziging aan de ONLINE database (26 oktober 2026, HARDE REGEL 6
 * in CLAUDE.md): nooit meer de hele laptop-database erover, want online staat
 * de voortgang van echte kinderen.
 *
 *   node scripts/online-wijzig.mjs <bestand.sql>
 *
 * Wat het doet:
 *   1. eerst een reservekopie van de online database naar backups/
 *      (online-voor-wijziging-<datum>.db, niet in Git);
 *   2. dan de SQL uit het bestand online uitvoeren, in één transactie: lukt er
 *      iets niet, dan verandert er niets;
 *   3. laten zien hoeveel rijen er veranderd zijn.
 *
 * Schrijf de SQL zo precies mogelijk (met een where op id of sleutel), en
 * nooit iets dat content aanmaakt (HARDE REGEL 2).
 */

import { readFileSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { WORTEL, kopieerOnlineDatabase, opServer, stempel } from "./railway-hulp.mjs";

const [bestand] = process.argv.slice(2);
if (!bestand) {
  console.error("Gebruik: node scripts/online-wijzig.mjs <bestand.sql>");
  process.exit(1);
}
const sql = readFileSync(bestand, "utf8").trim();
if (!sql) {
  console.error("Het SQL-bestand is leeg.");
  process.exit(1);
}

const BACKUPS = path.join(WORTEL, "backups");
mkdirSync(BACKUPS, { recursive: true });
const reserve = path.join(BACKUPS, `online-voor-wijziging-${stempel()}.db`);
console.log("▸ Reservekopie van de online database maken…");
kopieerOnlineDatabase(reserve);
console.log(`  bewaard: backups/${path.basename(reserve)} (${(statSync(reserve).size / 1048576).toFixed(1)} MB)`);

console.log("▸ Wijziging online uitvoeren (in één transactie)…");
const uit = opServer(`
  import { DatabaseSync } from "node:sqlite";
  const d = new DatabaseSync(process.env.THUISLES_DB ?? "/data/thuisles.db");
  const voor = d.prepare("select total_changes() as n").get().n;
  try {
    d.exec("begin");
    d.exec(${JSON.stringify(sql)});
    d.exec("commit");
  } catch (e) {
    try { d.exec("rollback"); } catch {}
    console.log("mislukt: " + e.message);
    process.exit(0);
  }
  const na = d.prepare("select total_changes() as n").get().n;
  d.close();
  console.log("klaar " + (na - voor));
`);
if (!uit.includes("klaar")) {
  console.error(`  Niet gelukt (${uit}). Online is niets veranderd; de reservekopie staat in backups/.`);
  process.exit(1);
}
console.log(`  gelukt: ${uit.split("klaar ")[1]} rijen veranderd.`);
