/**
 * Bewaakt dat élk oefeningstype zijn antwoord ook echt vastlegt.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit bestaat
 * ---------------------------------------------------------------------------
 * Er zijn nu vijf vraagvormen, en ze lopen allemaal door dezelfde route: het
 * antwoord komt via `setAntwoord` binnen, `controleer()` kijkt het na, en
 * `leg()` stuurt het naar de server. Daar hangt alles aan vast wat een kind
 * ziet gebeuren: het bolletje dat groen of rood kleurt, de sleutel die wordt
 * bijgeschreven, en de vraag waar het de volgende keer weer instapt.
 *
 * Het gevaar zit in een nieuw type. Wie een eigen nakijkknop bouwt en daarbij
 * `leg()` vergeet, krijgt iets wat er perfect uitziet: de vraag verschijnt, het
 * antwoord kan ingevuld worden, er gebeurt alleen niets. Geen kleur, geen
 * sleutel, en bij terugkomen weer vraag 1. Dat valt bij het testen nauwelijks
 * op, want je moet de oefening ervoor verlaten en terugkomen.
 *
 * Deze drie controles vangen precies dat geval af, zonder dat er vragen voor
 * aangemaakt hoeven te worden.
 *
 * ---------------------------------------------------------------------------
 * Waarom in de bronbestanden en niet in de browser
 * ---------------------------------------------------------------------------
 * Om een type in een echte browser te kunnen proberen, moeten er gepubliceerde
 * vragen van dat type bestaan. Die maakt Claude niet aan (zie HARDE REGEL 2),
 * en van de helft van de types staan er ook geen. Een controle die alleen werkt
 * als er toevallig vragen zijn, is precies op het verkeerde moment stil.
 */

import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const lees = (p) => readFileSync(path.join(WORTEL, p), "utf8");

const fouten = [];
const gedaan = [];

function zouMoeten(wat, klopt, uitleg) {
  if (klopt) gedaan.push(wat);
  else fouten.push(`${wat}\n      ${uitleg}`);
}

/** De vormen zoals de code ze kent; één bron, net als bij de database. */
const vormen = [
  /*
    Let op de `= [` in het zoekpatroon. Zonder dat stopte de match al bij de
    blokhaken van het type `Vraagvorm[]`, en kwam er een lege lijst uit — een
    controle die dan overal "in orde" op zegt.
  */
  ...lees("src/lib/vraagtypes.ts")
    .match(/export const ALLE_VRAAGVORMEN[^=]*= \[(.*?)\]/s)[1]
    .matchAll(/"([a-z_]+)"/g),
].map((m) => m[1]);

if (vormen.length === 0) {
  console.error("Kon de lijst met vraagvormen niet lezen uit src/lib/vraagtypes.ts.");
  process.exit(1);
}

const speler = lees("src/components/oefenen/OefenSpeler.tsx");

// ---------------------------------------------------------------------------
// 1. Elke vraagvorm is te beantwoorden
// ---------------------------------------------------------------------------

/*
  Staat een vorm nergens in het antwoordscherm genoemd, dan is er geen invoer
  voor. Een kind ziet dan een vraag zonder iets om in te vullen, en er kan dus
  ook nooit een antwoord komen.
*/
const ontbreekt = vormen.filter((v) => !speler.includes(`"${v}"`));
zouMoeten(
  "Elke vraagvorm heeft een invoer in het antwoordscherm",
  ontbreekt.length === 0,
  `Deze vormen staan in ALLE_VRAAGVORMEN maar nergens in OefenSpeler.tsx: ${ontbreekt.join(
    ", ",
  )}. Zonder invoer kan een kind er niets mee.`,
);

// ---------------------------------------------------------------------------
// 2. Elk nakijkmoment legt het antwoord ook vast
// ---------------------------------------------------------------------------

/*
  Dit is de kern. Op het moment dat een vraag goed of fout wordt verklaard,
  hóórt daar het wegschrijven bij. Staat er ergens een `setFase("goed")` of
  `setFase("fout")` zonder `leg()` in de buurt, dan is er een tweede
  nakijkroute ontstaan die niets opslaat.

  Er wordt gekeken naar de dertig regels ná het zetten van de fase; `leg()`
  staat daar in de praktijk een paar regels onder, met de uitkomst erbij.
*/
const regels = speler.split("\n");
const zonderVastleggen = [];
regels.forEach((regel, i) => {
  if (!/setFase\("(goed|fout)"\)/.test(regel)) return;
  const venster = regels.slice(i, i + 30).join("\n");
  if (!venster.includes("leg({")) zonderVastleggen.push(i + 1);
});

zouMoeten(
  "Elk moment waarop een vraag goed of fout wordt, legt het antwoord vast",
  zonderVastleggen.length === 0,
  `Op regel ${zonderVastleggen.join(
    " en ",
  )} van OefenSpeler.tsx wordt de fase op goed of fout gezet zonder dat leg() volgt. Dan kleurt het bolletje wel, maar komt er niets in de database: geen sleutel, en bij terugkomen weer vraag 1.`,
);

/*
  En andersom: er hoort precies één plek te zijn die vastlegt, per uitkomst.
  Komen er meer bij, dan is er een tweede route ontstaan die zijn eigen regels
  gaat volgen — en dat is precies hoe de twee elkaar ooit weer kwijtraken.
*/
const aantalLeg = (speler.match(/\bleg\(\{/g) ?? []).length;
zouMoeten(
  "Er is precies één route die een antwoord vastlegt",
  aantalLeg === 2,
  `leg() wordt ${aantalLeg}x aangeroepen in plaats van 2x (één keer voor goed, één keer voor fout). Bij meer routes gaan de types uit elkaar lopen.`,
);

// ---------------------------------------------------------------------------
// 3. Elke generator levert een vorm die bestaat
// ---------------------------------------------------------------------------

/*
  Een generator die een onbekende vorm teruggeeft, levert vragen op die het
  antwoordscherm niet kan tonen — en die de database weigert, want daar staat
  dezelfde lijst als controle op de kolom.
*/
const map = "src/lib/generatoren";
const onbekend = [];
for (const bestand of readdirSync(path.join(WORTEL, map)).filter((b) => b.endsWith(".ts"))) {
  for (const m of lees(path.join(map, bestand)).matchAll(/\bvorm:\s*"([a-z_]+)"/g)) {
    if (!vormen.includes(m[1])) onbekend.push(`${bestand} → "${m[1]}"`);
  }
}

zouMoeten(
  "Elke generator levert een vraagvorm die de code kent",
  onbekend.length === 0,
  `Onbekende vormen: ${onbekend.join(
    ", ",
  )}. Zet de vorm in ALLE_VRAAGVORMEN in src/lib/vraagtypes.ts, anders weigert de database de vraag.`,
);

// ---------------------------------------------------------------------------

console.log(
  `Oefeningstypes: ${gedaan.length + fouten.length} controles op ${vormen.length} vraagvormen (${vormen.join(", ")}).`,
);
for (const g of gedaan) console.log("  ✓ " + g);

if (fouten.length > 0) {
  console.error(`\nEEN OEFENINGSTYPE SLAAT NIETS OP (${fouten.length}):`);
  for (const f of fouten) console.error("  ✗ " + f);
  process.exit(1);
}
