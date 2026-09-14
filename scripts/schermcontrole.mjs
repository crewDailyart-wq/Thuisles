/**
 * Controleert of alles wat in het schermcontract staat, er nog is.
 *
 * Draaien met `npm run schermen`, terwijl `npm run dev` aan staat. Ontbreekt er
 * iets, dan stopt dit script met code 1 en noemt het scherm, het veld en het
 * pad. Zo merk jij het niet pas als je het zelf toevallig opzoekt.
 *
 * Het script LEEST alleen: het haalt pagina's op en kijkt in de database welke
 * id's het in de paden moet invullen. Het maakt niets aan en wijzigt niets —
 * zie HARDE REGEL 2 in CLAUDE.md.
 */

import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const BASIS = process.env.THUISLES_URL ?? "http://localhost:3000";

import { SCHERMCONTRACT } from "./schermcontract.mjs";

/** De id's en slugs waarmee de plaatshouders in de paden gevuld worden. */
function haalPlaatshouders() {
  const bestand = path.join(WORTEL, "data/thuisles.db");
  if (!existsSync(bestand)) return {};
  const db = new DatabaseSync(bestand, { readOnly: true });
  const een = (sql) => db.prepare(sql).get() ?? {};

  const vak = een("select slug from vakken order by rowid limit 1");
  const sjabloon = een("select id from sjablonen order by rowid limit 1");
  const leerdoel = een(
    `select l.id lid, s.slug subslug, d.slug domslug
       from leerdoelen l
       join subdomeinen s on s.id = l.subdomein_id
       join domeinen d on d.id = s.domein_id
      order by l.rowid limit 1`,
  );

  return {
    vak: vak.slug,
    sjabloon: sjabloon.id,
    leerdoel: leerdoel.lid,
    subdomein: leerdoel.subslug,
    domein: leerdoel.domslug,
  };
}

/** Tekst uit de opgehaalde HTML, zodat `&amp;` en tags niet in de weg zitten. */
function alsTekst(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

/** Een bronbestand lezen; bestaat het niet, dan is het gewoon leeg. */
function lees(bestand) {
  return existsSync(bestand) ? readFileSync(bestand, "utf8") : "";
}

const contract = SCHERMCONTRACT;
const plaats = haalPlaatshouders();

/** Is er ergens op de bron teruggevallen? Dat hoort de gebruiker te weten. */
let uitBron = false;

const fouten = [];
const overgeslagen = [];
let gecontroleerd = 0;

for (const scherm of contract) {
  const ontbrekend = [...scherm.pad.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .filter((sleutel) => !plaats[sleutel]);

  if (ontbrekend.length > 0) {
    overgeslagen.push(`${scherm.naam} — geen ${ontbrekend.join(", ")} in de database`);
    continue;
  }

  const pad = scherm.pad.replace(/\{(\w+)\}/g, (_, s) => plaats[s]);

  /*
    Eerst het echte scherm ophalen. Draait de dev-server niet — en bij een
    commit is dat de normale situatie — dan wordt er in de bronbestanden
    gekeken. Dat is zwakker (een veld kan in de code staan en toch onbereikbaar
    zijn), maar het vangt wél het geval waar het drie keer op misging: een veld
    dat bij een herschrijving uit de code valt.
  */
  let tekst = null;
  try {
    const antwoord = await fetch(BASIS + pad);
    if (antwoord.ok) tekst = alsTekst(await antwoord.text());
    else fouten.push(`${scherm.naam} (${pad}) gaf status ${antwoord.status}`);
  } catch {
    tekst = null;
  }

  if (tekst === null) {
    if (!(scherm.bron ?? []).length) {
      fouten.push(
        `${scherm.naam} (${pad}) is niet op te halen en heeft geen bron in het contract.`,
      );
      continue;
    }
    if (!uitBron) uitBron = true;
    const bronnen = scherm.bron.map((b) => [b, lees(path.join(WORTEL, b))]);
    for (const nodig of scherm.zichtbaar) {
      gecontroleerd++;
      if (!bronnen.some(([, inhoud]) => inhoud.includes(nodig))) {
        fouten.push(
          `"${nodig}" ontbreekt in ${scherm.bron.join(" en ")} — hoort op ${scherm.naam} te staan`,
        );
      }
    }
  } else {
    for (const nodig of scherm.zichtbaar) {
      gecontroleerd++;
      if (!tekst.includes(nodig)) {
        fouten.push(`"${nodig}" ontbreekt op ${scherm.naam} (${pad})`);
      }
    }
  }

  for (const regel of scherm.naKlik ?? []) {
    gecontroleerd++;
    const bron = path.join(WORTEL, regel.bron);
    if (!existsSync(bron)) {
      fouten.push(`${regel.bron} bestaat niet meer (hoort "${regel.tekst}" te bevatten)`);
      continue;
    }
    if (!readFileSync(bron, "utf8").includes(regel.tekst)) {
      fouten.push(
        `"${regel.tekst}" ontbreekt in ${regel.bron} — op ${scherm.naam} te zien na ${regel.na}`,
      );
    }
  }
}

console.log(`Schermcontrole: ${gecontroleerd} controles op ${contract.length} schermen.`);

if (uitBron) {
  console.log(
    "De dev-server draait niet, dus is er in de bronbestanden gekeken in plaats van\n" +
      "op het echte scherm. Draai `npm run dev` erbij voor de sterkere controle.",
  );
}

if (overgeslagen.length > 0) {
  console.log("\nOvergeslagen (het script maakt zelf geen gegevens aan):");
  for (const r of overgeslagen) console.log("  - " + r);
}

if (fouten.length > 0) {
  console.error(`\nER ONTBREEKT IETS (${fouten.length}):`);
  for (const f of fouten) console.error("  ✗ " + f);
  console.error("\nZie scripts/schermcontract.mjs. Zet nooit een regel uit het contract");
  console.error("om deze melding weg te krijgen — herstel het scherm, of vraag het eerst.");
  process.exit(1);
}

console.log("\nAlles wat in het contract staat, staat er nog.");
