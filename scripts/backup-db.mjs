/**
 * Een back-up van de database naar iCloud Drive.
 *
 *   npm run backup
 *
 * De database (`data/thuisles.db`) staat NIET in Git: er staan gegevens van een
 * kind in. Dit script is daarom de back-up. Het maakt een veilige kopie met de
 * backupfunctie van SQLite zelf — die klopt ook als de app op hetzelfde moment
 * iets wegschrijft, wat een gewone bestandskopie niet garandeert — en zet die in
 *
 *   ~/Library/Mobile Documents/com~apple~CloudDocs/Thuisles-backups/
 *
 * met de datum en tijd in de naam. iCloud neemt hem van daaruit mee. De
 * laatste 14 kopieën blijven bewaard; oudere worden opgeruimd, maar alleen
 * bestanden die dit script zelf heeft gemaakt (herkenbaar aan de naam).
 *
 * Elke dag om 22:00 draait dit vanzelf via een LaunchAgent; zie
 * `scripts/nl.thuisles.backup.plist` en NACHTRAPPORT.md voor aan- en uitzetten.
 */

import { backup, DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const BRON = path.join(WORTEL, "data", "thuisles.db");
const DOEL = path.join(
  homedir(),
  "Library",
  "Mobile Documents",
  "com~apple~CloudDocs",
  "Thuisles-backups",
);
const BEWAREN = 14;
const NAAM = /^thuisles-\d{4}-\d{2}-\d{2}-\d{4}(-\d+)?\.db$/;

function tweeCijfers(n) {
  return String(n).padStart(2, "0");
}

function stempel(d = new Date()) {
  return `${d.getFullYear()}-${tweeCijfers(d.getMonth() + 1)}-${tweeCijfers(d.getDate())}-${tweeCijfers(d.getHours())}${tweeCijfers(d.getMinutes())}`;
}

if (!existsSync(BRON)) {
  console.error(`Geen database gevonden op ${BRON}.`);
  process.exit(1);
}
mkdirSync(DOEL, { recursive: true });

/* Een vrije naam: twee keer binnen dezelfde minuut krijgt een volgnummer. */
let naam = `thuisles-${stempel()}.db`;
for (let n = 2; existsSync(path.join(DOEL, naam)); n++) naam = `thuisles-${stempel()}-${n}.db`;
const pad = path.join(DOEL, naam);

/*
  Eerst naar een tijdelijke naam en pas daarna hernoemen: dan staat er in de
  map nooit een halve kopie die eruitziet als een echte, ook niet als iCloud
  hem halverwege al oppikt.
*/
const tijdelijk = `${pad}.bezig`;
const db = new DatabaseSync(BRON, { readOnly: true });
try {
  await backup(db, tijdelijk);
} finally {
  db.close();
}

/* Even nakijken of de kopie te openen is en tabellen heeft. */
const controle = new DatabaseSync(tijdelijk, { readOnly: true });
const tabellen = controle.prepare("select count(*) as n from sqlite_master where type = 'table'").get().n;
controle.close();
if (!tabellen) {
  rmSync(tijdelijk, { force: true });
  console.error("De kopie bleek leeg; er is niets bewaard.");
  process.exit(1);
}
renameSync(tijdelijk, pad);

/* Opruimen: alleen eigen kopieën, de nieuwste 14 blijven. */
const kopieen = readdirSync(DOEL)
  .filter((f) => NAAM.test(f))
  .map((f) => ({ f, t: statSync(path.join(DOEL, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);
for (const { f } of kopieen.slice(BEWAREN)) rmSync(path.join(DOEL, f), { force: true });

const mb = (statSync(pad).size / 1024 / 1024).toFixed(1);
console.log(
  `Back-up gemaakt: ${pad} (${mb} MB, ${tabellen} tabellen). ` +
    `Er staan nu ${Math.min(kopieen.length, BEWAREN)} kopieën.`,
);
