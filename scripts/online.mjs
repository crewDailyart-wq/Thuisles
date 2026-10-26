/**
 * De laptop-database naar de online site op Railway.
 *
 *   npm run online
 *
 * ⛔ SINDS 26 OKTOBER 2026 (besluit eigenaar): de HELE laptop-database gaat
 * NIET meer online. Online staan de profielen en de voortgang van echte
 * kinderen; die zou je overschrijven. Dit script maakt nu alleen een
 * reservekopie van online en zet ontbrekende afbeeldingen en Godot-spelletjes
 * erbij, en stopt dan. Wijzigingen aan de online database gaan alleen nog met
 * een gericht script (scripts/online-wijzig.mjs), met eerst een reservekopie.
 * Alleen als de eigenaar het zelf uitdrukkelijk wil, met
 * THUISLES_HELE_DATABASE_OVERSCHRIJVEN=ja ervoor, gaat de hele database er
 * nog overheen (zie CLAUDE.md, HARDE REGEL 6).
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
 *      (online uploads blijven staan), en de Godot-spelletjes uit public/godot
 *      die online ontbreken of anders zijn;
 *   4. de kopie op de schijf zetten onder een tijdelijke naam, controleren,
 *      en dan in één keer op de plek van thuisles.db zetten;
 *   5. de site opnieuw starten, zodat hij de nieuwe database opent.
 *
 * De code gaat sinds 13 oktober 2026 via GitHub online: Railway bouwt de site
 * opnieuw zodra er iets op main komt. Wat niet in Git staat, gaat via dit
 * script: de database, de afbeeldingen en de Godot-spelletjes (te groot voor
 * Git; online levert app/godot/[...pad]/route.ts ze van de schijf).
 */

import { backup, DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
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

// 3b. De Godot-spelletjes: wat online ontbreekt of anders is, gaat erop.
// Online wordt niets weggehaald.
stap("Godot-spelletjes bijwerken…");
const GODOT = path.join(WORTEL, "public", "godot");
if (!existsSync(GODOT)) {
  console.log("  geen public/godot op deze laptop; overgeslagen");
} else {
  const afdrukVan = (bestand) => createHash("sha1").update(readFileSync(bestand)).digest("hex");
  const alleBestanden = (map, voor = "") =>
    readdirSync(map, { withFileTypes: true })
      .filter((d) => !d.name.startsWith("."))
      .flatMap((d) =>
        d.isDirectory() ? alleBestanden(path.join(map, d.name), `${voor}${d.name}/`) : [`${voor}${d.name}`],
      );
  const godotOnline = new Map(
    JSON.parse(
      opServer(`
        import fs from "node:fs";
        import path from "node:path";
        import { createHash } from "node:crypto";
        const wortel = "/data/godot";
        fs.mkdirSync(wortel, { recursive: true });
        const uit = [];
        const loop = (map) => {
          for (const d of fs.readdirSync(map, { withFileTypes: true })) {
            const p = path.join(map, d.name);
            if (d.isDirectory()) loop(p);
            else uit.push([path.relative(wortel, p), createHash("sha1").update(fs.readFileSync(p)).digest("hex")]);
          }
        };
        loop(wortel);
        console.log(JSON.stringify(uit));
      `)
        .split("\n")
        .pop(),
    ),
  );
  const anders = alleBestanden(GODOT).filter((rel) => godotOnline.get(rel) !== afdrukVan(path.join(GODOT, rel)));
  const mappen = [...new Set(anders.map((rel) => path.posix.dirname(rel)).filter((m) => m !== "."))];
  if (mappen.length) {
    opServer(`
      import fs from "node:fs";
      for (const m of ${JSON.stringify(mappen)}) fs.mkdirSync("/data/godot/" + m, { recursive: true });
      console.log("klaar");
    `);
  }
  for (const rel of anders) zetOpSchijf(path.join(GODOT, rel), `/godot/${rel}`);
  console.log(anders.length ? `  ${anders.length} bestanden bijgewerkt` : "  alles stond er al");
}

// 4. Database op de schijf: NIET meer, tenzij de eigenaar het zelf uitdrukkelijk wil (HARDE REGEL 6).
if (process.env.THUISLES_HELE_DATABASE_OVERSCHRIJVEN !== "ja") {
  rmSync(kopie, { force: true });
  console.log(
    "\n⛔ De database is NIET online gezet (HARDE REGEL 6: online staat de voortgang van echte kinderen).\n" +
      "   Afbeeldingen en spelletjes zijn bijgewerkt; de reservekopie van online staat in backups/.\n" +
      "   Iets aan de online database veranderen: node scripts/online-wijzig.mjs <bestand.sql> (maakt eerst een reservekopie).",
  );
  process.exit(0);
}
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
// Met --json: zonder bleef de opdracht wachten nadat de herstart al liep.
railway("restart", "--service", "thuisles", "--yes", "--json");
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
