/**
 * De laptop-database naar de online site op Railway.
 *
 *   npm run online
 *
 * De database op de laptop is de baas (afspraak van de eigenaar, 12 oktober
 * 2026). Dit script zet hem online en start de site opnieuw. Draai het na
 * elke klus waarbij de database verandert.
 *
 * Wat het doet, op volgorde:
 *
 *   1. een reservekopie van de ONLINE database naar backups/ (niet in Git),
 *      vóór er iets wordt overschreven. Is er online iets veranderd sinds de
 *      vorige keer (bijvoorbeeld voortgang), dan meldt het script dat: het
 *      staat dan alleen nog in die reservekopie;
 *   2. een veilige kopie van de laptop-database maken en controleren;
 *   3. afbeeldingen uit public/vragen die online nog ontbreken erbij zetten
 *      (online uploads blijven staan);
 *   4. de kopie op de schijf zetten onder een tijdelijke naam, controleren,
 *      en dan in één keer op de plek van thuisles.db zetten;
 *   5. de site opnieuw starten, zodat hij de nieuwe database opent.
 */

import { backup, DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ADRES,
  WORTEL,
  controleer,
  inhoudsafdruk,
  kopieerOnlineDatabase,
  opServer,
  railway,
  stempel,
  zetOpSchijf,
} from "./railway-hulp.mjs";

const BRON = path.join(WORTEL, "data", "thuisles.db");
const BACKUPS = path.join(WORTEL, "backups");
const LAATST = path.join(BACKUPS, "online-laatst-verstuurd.txt");
const BEWAREN = 14;
const NAAM = /^online-voor-overschrijven-\d{4}-\d{2}-\d{2}-\d{4}\.db$/;

function stap(tekst) {
  console.log(`\n▸ ${tekst}`);
}

mkdirSync(BACKUPS, { recursive: true });

// 1. Reservekopie van online.
stap("Reservekopie van de online database maken…");
const reserve = path.join(BACKUPS, `online-voor-overschrijven-${stempel()}.db`);
kopieerOnlineDatabase(reserve);
console.log(`  bewaard: backups/${path.basename(reserve)} (${(statSync(reserve).size / 1048576).toFixed(1)} MB)`);

const vorige = existsSync(LAATST) ? readFileSync(LAATST, "utf8").trim() : null;
if (vorige && inhoudsafdruk(reserve) !== vorige) {
  console.log(
    "  LET OP: online is er iets veranderd sinds de vorige keer (bijvoorbeeld voortgang).\n" +
      "  Dat wordt nu overschreven door de laptop; het staat nog in de reservekopie hierboven.",
  );
}

// Oude reservekopieën opruimen: alleen eigen bestanden, de nieuwste 14 blijven.
const kopieen = readdirSync(BACKUPS)
  .filter((f) => NAAM.test(f))
  .sort()
  .reverse();
for (const f of kopieen.slice(BEWAREN)) rmSync(path.join(BACKUPS, f), { force: true });

// 2. Veilige kopie van de laptop.
stap("Kopie van de laptop-database maken…");
const kopie = path.join(tmpdir(), `thuisles-naar-online-${process.pid}.db`);
rmSync(kopie, { force: true });
const db = new DatabaseSync(BRON, { readOnly: true });
try {
  await backup(db, kopie);
} finally {
  db.close();
}
const tabellen = controleer(kopie);
const afdruk = inhoudsafdruk(kopie);
console.log(`  in orde: ${tabellen} tabellen, ${(statSync(kopie).size / 1048576).toFixed(1)} MB`);

// 3. Ontbrekende afbeeldingen.
stap("Afbeeldingen bijwerken…");
const online = new Set(
  opServer(`
    import fs from "node:fs";
    fs.mkdirSync("/data/vragen", { recursive: true });
    console.log(fs.readdirSync("/data/vragen").join("\\n"));
  `)
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean),
);
const lokaal = readdirSync(path.join(WORTEL, "public", "vragen")).filter((f) => !f.startsWith("."));
const ontbreekt = lokaal.filter((f) => !online.has(f));
for (const f of ontbreekt) zetOpSchijf(path.join(WORTEL, "public", "vragen", f), `/vragen/${f}`);
console.log(ontbreekt.length ? `  ${ontbreekt.length} erbij gezet` : "  alles stond er al");

// 4. Database op de schijf.
stap("Database online zetten…");
zetOpSchijf(kopie, "/thuisles-nieuw.db");
const uit = opServer(`
  import fs from "node:fs";
  import { DatabaseSync } from "node:sqlite";
  const d = new DatabaseSync("/data/thuisles-nieuw.db", { readOnly: true });
  const ok = d.prepare("pragma integrity_check").get().integrity_check;
  d.close();
  if (ok !== "ok") { console.log("kapot: " + ok); process.exit(0); }
  fs.renameSync("/data/thuisles-nieuw.db", "/data/thuisles.db");
  console.log("klaar");
`);
if (!uit.endsWith("klaar")) {
  console.error(`  De kopie kwam niet goed aan (${uit}). Online is niets veranderd.`);
  process.exit(1);
}
rmSync(kopie, { force: true });
writeFileSync(LAATST, `${afdruk}\n`);
console.log("  staat erop");

// 5. Opnieuw starten en wachten tot de site er weer is.
stap("Site opnieuw starten…");
railway("restart", "--service", "thuisles", "--yes");
let op = false;
for (let i = 0; i < 40 && !op; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const antwoord = await fetch(`${ADRES}/kies`);
    // 401 = het slot vraagt om het wachtwoord: de site draait.
    op = antwoord.status === 401 || antwoord.ok;
  } catch {
    op = false;
  }
}
console.log(op ? `\nKlaar. ${ADRES} draait met de laptop-database.` : "\nDe database staat erop, maar de site reageert nog niet. Kijk over een minuut nog eens.");
