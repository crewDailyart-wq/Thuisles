/**
 * Schrijft de teksten van het maatje voor de gepubliceerde opgaven van groep 4.
 *
 *   npm run maatje                         alleen kijken: hoeveel, en wat faalt
 *   npm run maatje -- --opslaan            ook opslaan in de database
 *   npm run maatje -- --domein Optellen    alleen dit domein
 *
 * Per opgave: de zes teksten uit hoofdstuk 4 van MAATJE-HANDLEIDING.md, langs
 * de controles van hoofdstuk 11. Alleen wat door de controles komt, wordt als
 * "gecontroleerd" opgeslagen. Een bestaande versie blijft staan; staat dezelfde
 * versie er al, dan wordt alleen die regel vernieuwd.
 *
 * Met --opslaan gaat het maatje aan bij elk leerdoel waarvan ALLE gepubliceerde
 * opgaven van groep 4 gecontroleerde teksten hebben. Het zet het maatje nooit
 * uit: dat doet de eigenaar in beheer.
 *
 * Maakt geen vragen, leerdoelen of sjablonen aan en verandert er niets aan.
 */

import { verbinding } from "@/lib/db/sqlite";
import { haalGepubliceerdeVragen } from "@/lib/data/vragen";
import { schrijfMaatje } from "@/lib/maatje/schrijf";

const args = process.argv.slice(2);
const opslaan = args.includes("--opslaan");
const domeinFilter = args.includes("--domein") ? args[args.indexOf("--domein") + 1] : null;
const toon = args.includes("--toon") ? Number(args[args.indexOf("--toon") + 1]) : 0;

const db = verbinding();
const leerdoelIds = db
  .prepare(
    `select distinct q.leerdoel_id as id from vragen q
     where q.status = 'gepubliceerd' and q.groep = 4`,
  )
  .all()
  .map((r) => r.id);

const vragen = haalGepubliceerdeVragen(leerdoelIds).filter(
  (v) => v.groep === 4 && (!domeinFilter || v.domeinNaam === domeinFilter),
);

const perDomein = new Map();
const perSoort = new Map();
const perLeerdoel = new Map();
const fouten = [];
const nu = new Date().toISOString();

const schrijf = db.prepare(
  `insert into maatje_teksten (vraag_id, versie, teksten, gecontroleerd, aangemaakt_op)
   values (?, ?, ?, ?, ?)
   on conflict (vraag_id, versie) do update set teksten = excluded.teksten,
     gecontroleerd = excluded.gecontroleerd, aangemaakt_op = excluded.aangemaakt_op`,
);

let getoond = 0;
db.exec("begin");
try {
  for (const v of vragen) {
    const d = perDomein.get(v.domeinNaam) ?? { opgaven: 0, geschreven: 0, goed: 0 };
    d.opgaven++;
    const soort = `${v.domeinNaam} · ${v.figuur?.soort ?? "geen figuur"}${v.somgegevens?.variant ? ` · ${v.somgegevens.variant}` : ""}`;
    const s = perSoort.get(soort) ?? { opgaven: 0, geschreven: 0, goed: 0 };
    s.opgaven++;
    const l = perLeerdoel.get(v.leerdoelId) ?? { titel: v.leerdoelTitel, domein: v.domeinNaam, opgaven: 0, goed: 0 };
    l.opgaven++;

    const uit = schrijfMaatje(v);
    if (uit) {
      d.geschreven++;
      s.geschreven++;
      const ok = uit.meldingen.length === 0;
      if (ok) {
        d.goed++;
        s.goed++;
        l.goed++;
      } else {
        fouten.push({ soort, vraag: v.vraagtekst, antwoord: v.antwoord, meldingen: uit.meldingen });
      }
      if (toon && getoond < toon && (!args.includes("--alleenfout") || !ok)) {
        getoond++;
        console.log(`\n=== ${soort} — ${v.vraagtekst} [${v.antwoord}]`);
        console.log(JSON.stringify(uit.geschreven.teksten, null, 1));
        for (const m of uit.meldingen) console.log(`  ! ${m.controle}: ${m.tekst}`);
      }
      if (opslaan) {
        schrijf.run(v.id, uit.geschreven.teksten.versie, JSON.stringify(uit.geschreven.teksten), ok ? 1 : 0, nu);
      }
    }
    perDomein.set(v.domeinNaam, d);
    perSoort.set(soort, s);
    perLeerdoel.set(v.leerdoelId, l);
  }

  if (opslaan) {
    const zetAan = db.prepare("update leerdoelen set maatje = 1 where id = ? and maatje = 0");
    for (const [id, l] of perLeerdoel) if (l.opgaven > 0 && l.goed === l.opgaven) zetAan.run(id);
  }
  db.exec("commit");
} catch (e) {
  db.exec("rollback");
  throw e;
}

console.log("\nPer domein (opgaven / teksten geschreven / door de controle):");
for (const [naam, d] of [...perDomein].sort()) console.log(`  ${naam.padEnd(20)} ${String(d.opgaven).padStart(5)} ${String(d.geschreven).padStart(5)} ${String(d.goed).padStart(5)}`);

console.log("\nPer soort:");
for (const [naam, s] of [...perSoort].sort()) {
  const teken = s.goed === s.opgaven ? "✓" : s.geschreven === 0 ? "·" : "!";
  console.log(`  ${teken} ${naam.padEnd(60)} ${String(s.opgaven).padStart(4)} ${String(s.geschreven).padStart(4)} ${String(s.goed).padStart(4)}`);
}

const leerdoelenKlaar = [...perLeerdoel.values()].filter((l) => l.goed === l.opgaven).length;
console.log(`\nLeerdoelen met alle teksten klaar: ${leerdoelenKlaar} van ${perLeerdoel.size}`);

if (fouten.length > 0) {
  const telling = new Map();
  for (const f of fouten) for (const m of f.meldingen) {
    const sleutel = `${f.soort} — controle ${m.controle}`;
    if (!telling.has(sleutel)) telling.set(sleutel, { n: 0, voorbeeld: m.tekst });
    telling.get(sleutel).n++;
  }
  console.log("\nMeldingen (aantal, met een voorbeeld):");
  for (const [k, t] of [...telling].sort()) console.log(`  ${String(t.n).padStart(5)}  ${k}\n         ${t.voorbeeld}`);
}
console.log(opslaan ? "\nOpgeslagen." : "\nAlleen gekeken; niets opgeslagen (gebruik --opslaan).");
