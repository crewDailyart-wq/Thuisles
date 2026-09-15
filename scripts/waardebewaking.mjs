/**
 * Bewaakt dat een opgeslagen instelling niet stilletjes wordt overschreven.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit los staat van de schermcontrole
 * ---------------------------------------------------------------------------
 * `npm run schermen` kijkt of een veld nog op het scherm staat. Dat vangt de
 * ene helft. De andere helft is erger en onzichtbaar: het veld staat er nog,
 * maar de waarde erachter wordt bij een volgende opslag op `null` gezet.
 *
 * Zo verdween "Vragen per oefensessie" de tweede keer. Het veld was verhuisd
 * naar het sjabloonscherm, maar `bewerkLeerdoel` stuurde `vragenPerSessie` nog
 * steeds mee. Dat veld stond niet meer in dát formulier, dus kwam het leeg
 * binnen en werd het als `null` over de opgeslagen 15 geschreven. Wie daarna
 * een leerdoeltitel aanpaste, raakte de instelling kwijt zonder dat er iets
 * misging op het scherm.
 *
 * Dit script speelt dat scenario echt na: het slaat een titel op en kijkt of
 * het aantal er daarna nog staat.
 *
 * ---------------------------------------------------------------------------
 * Nooit op de echte database
 * ---------------------------------------------------------------------------
 * Er wordt een kopie van `data/thuisles.db` in een tijdelijke map gezet, en
 * `THUISLES_DB` wijst daarheen. Alles wat dit script aanmaakt of wijzigt, komt
 * in die kopie terecht en gaat aan het eind mee de prullenbak in. Jouw eigen
 * database wordt alleen gelezen, nooit geopend om in te schrijven.
 */

import { copyFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const ECHT = path.join(WORTEL, "data", "thuisles.db");

const fouten = [];
const gedaan = [];

function zouMoeten(wat, klopt, uitleg) {
  if (klopt) gedaan.push(wat);
  else fouten.push(`${wat}\n      ${uitleg}`);
}

const werkmap = mkdtempSync(path.join(tmpdir(), "thuisles-bewaking-"));
const kopie = path.join(werkmap, "thuisles.db");

try {
  if (existsSync(ECHT)) {
    copyFileSync(ECHT, kopie);
  }
  /* Bestaat de echte database nog niet, dan maakt de app hier een lege aan. */
  process.env.THUISLES_DB = kopie;

  const { maakVak, maakDomein, maakSubdomein, maakLeerdoel, wijzigLeerdoel, zoekLeerdoel } =
    await import("@/lib/data/structuur");

  /*
    Een eigen vak in de kopie, zodat de proef niets aanraakt wat er al stond en
    de uitkomst niet afhangt van wat er toevallig in de database zit.
  */
  const merk = `bewaking-${Date.now()}`;
  const vak = maakVak({
    naam: `Bewaking ${merk}`,
    omschrijving: "",
    icoon: "rekenen",
    actief: false,
  });
  if (!vak.ok) throw new Error(`Kon geen proefvak maken: ${vak.fout}`);

  const domein = maakDomein({
    vakId: vak.waarde.id,
    naam: `Domein ${merk}`,
    omschrijving: "",
    icoon: "rekenen",
    actief: false,
  });
  if (!domein.ok) throw new Error(`Kon geen proefdomein maken: ${domein.fout}`);

  const sub = maakSubdomein({
    domeinId: domein.waarde.id,
    naam: `Onderwerp ${merk}`,
    omschrijving: "",
    icoon: "rekenen",
  });
  if (!sub.ok) throw new Error(`Kon geen proefonderwerp maken: ${sub.fout}`);

  const leerdoel = maakLeerdoel({
    subdomeinId: sub.waarde.id,
    titel: `Leerdoel ${merk}`,
    groepVan: 4,
    groepTot: 4,
  });
  if (!leerdoel.ok) throw new Error(`Kon geen proefleerdoel maken: ${leerdoel.fout}`);
  const id = leerdoel.waarde.id;

  /*
    `wijzigLeerdoel` verlangt altijd titel en groep — precies zoals het
    leerdoelformulier ze meestuurt. Het gaat hier om wat er NIET bij staat.
  */
  const basis = { titel: `Leerdoel ${merk}`, groepVan: 4, groepTot: 4 };
  const aantal = () => zoekLeerdoel(id)?.vragenPerSessie;

  // 1. Een eigen aantal instellen.
  wijzigLeerdoel(id, { ...basis, vragenPerSessie: 15 });
  zouMoeten(
    "Een eigen aantal vragen per oefensessie wordt bewaard",
    aantal() === 15,
    `Verwacht 15, kreeg ${aantal()}.`,
  );

  // 2. Het scenario van incident 2: opslaan zónder dat het veld meekomt.
  wijzigLeerdoel(id, { ...basis, titel: `Leerdoel ${merk} anders` });
  zouMoeten(
    "Een titel opslaan zonder het veld laat het aantal met rust",
    aantal() === 15,
    `Na het opslaan van alleen de titel staat het aantal op ${aantal()} in plaats van 15. ` +
      `Kijk of een formulier vragenPerSessie meestuurt terwijl dat veld er niet in zit.`,
  );

  // 3. De groep aanpassen mag het net zo min raken.
  wijzigLeerdoel(id, { ...basis, titel: `Leerdoel ${merk} anders`, groepVan: 5, groepTot: 5 });
  zouMoeten(
    "De groep aanpassen laat het aantal met rust",
    aantal() === 15,
    `Na het aanpassen van de groep staat het aantal op ${aantal()}.`,
  );

  // 4. Expliciet leegmaken moet wél werken: dat betekent "volg de standaard".
  wijzigLeerdoel(id, {
    ...basis,
    titel: `Leerdoel ${merk} anders`,
    groepVan: 5,
    groepTot: 5,
    vragenPerSessie: null,
  });
  zouMoeten(
    "Bewust leegmaken zet het terug op de algemene standaard",
    aantal() === null,
    `Verwacht null, kreeg ${aantal()}.`,
  );

  /*
    De database mag geen vraagvorm weigeren die de code kent.

    Hier ging het mis bij "Tellen en slepen": de generator maakte netjes
    sommen, maar de tabel `vragen` had een controle met alleen de drie oude
    vormen. Elke poging om op te slaan viel stuk en er kwam geen enkele som
    binnen — zonder dat er iets op het scherm misging. Deze controle slaat
    daarop aan zodra er een vorm bij komt die de database niet kent.
  */
  const { ALLE_VRAAGVORMEN } = await import("@/lib/vraagtypes");
  const { verbinding } = await import("@/lib/db/sqlite");
  const tabel =
    verbinding().prepare("select sql from sqlite_master where name='vragen'").get()?.sql ?? "";
  const toegestaan = (tabel.match(/check \(vorm in \(([^)]*)\)\)/)?.[1] ?? "")
    .split(",")
    .map((v) => v.trim().replace(/'/g, ""));
  const ontbreekt = ALLE_VRAAGVORMEN.filter((v) => !toegestaan.includes(v));
  zouMoeten(
    "De database accepteert elke vraagvorm die de code kent",
    ontbreekt.length === 0,
    `De tabel 'vragen' weigert ${ontbreekt.join(", ")}. Sommen van die vorm worden ` +
      `gemaakt maar niet opgeslagen. De lijst staat in ALLE_VRAAGVORMEN; sqlite.ts ` +
      `hoort hem daaruit over te nemen.`,
  );

  // 6. Een sjabloon aanmaken onder een leerdoel dat al een aantal heeft, mag
  //    dat aantal niet wissen — de derde manier waarop het kon verdwijnen.
  wijzigLeerdoel(id, {
    ...basis,
    titel: `Leerdoel ${merk} anders`,
    groepVan: 5,
    groepTot: 5,
    vragenPerSessie: 15,
  });
  const { bewaarSjabloon } = await import("@/lib/data/sjablonen");
  const sjabloon = bewaarSjabloon({
    leerdoelId: id,
    naam: `Sjabloon ${merk}`,
    soort: "kralen",
    instellingen: {},
    hint: "",
    groep: 5,
  });
  zouMoeten(
    "Een sjabloon aanmaken zonder aantal laat het bestaande aantal staan",
    sjabloon.ok && aantal() === 15,
    sjabloon.ok
      ? `Na het aanmaken staat het aantal op ${aantal()} in plaats van 15.`
      : `Kon geen proefsjabloon maken: ${sjabloon.fout}`,
  );

  /*
    7. Elke oefening houdt zijn eigen halve sessie.

    Twee dingen moeten tegelijk waar zijn, en ze zijn allebei een keer misgegaan:

      a. Hetzelfde leerdoel via een andere knop = dezelfde sessie. Anders begint
         een kind dat via "Oefen wat nog lastig was" terugkomt weer bij vraag 1,
         met lege bolletjes, terwijl zijn halve serie er nog gewoon staat.

      b. Een ander leerdoel = een eigen sessie. Onder een onderwerp hangen
         meerdere leerdoelen op hetzelfde pad. Telde het leerdoel niet mee, dan
         kwamen ze in hetzelfde potje: wie op "Bus tellen" klikte, kreeg de
         halve serie van "Telrij stapstenen" te zien.

    Hier staan ze allebei vast, want een oplossing voor de een brak de ander.
  */
  const { sessieSleutel } = await import("@/lib/oefensessie");
  const pad = "/oefenen/rekenen/getallen/tellen/oefening";
  const tegel = `${pad}?leerdoel=doel-a`;
  const herhaal = `${pad}?leerdoel=doel-a&herhaal=1`;

  zouMoeten(
    "Hetzelfde leerdoel hervat dezelfde sessie, via welke knop dan ook",
    sessieSleutel("kind-1", tegel) === sessieSleutel("kind-1", herhaal),
    `De tegel en "Oefen wat nog lastig was" leveren verschillende sleutels op:\n      ${sessieSleutel(
      "kind-1",
      tegel,
    )}\n      ${sessieSleutel("kind-1", herhaal)}`,
  );

  zouMoeten(
    "Twee leerdoelen onder hetzelfde onderwerp houden elk hun eigen sessie",
    sessieSleutel("kind-1", tegel) !== sessieSleutel("kind-1", `${pad}?leerdoel=doel-b`),
    "Beide leerdoelen krijgen dezelfde sleutel; het kind zou bij het ene leerdoel de vragen van het andere zien.",
  );

  /* Twee kinderen op één apparaat blijven wel uit elkaars sessie. */
  zouMoeten(
    "Twee kinderen op hetzelfde apparaat houden hun eigen sessie",
    sessieSleutel("kind-1", tegel) !== sessieSleutel("kind-2", tegel),
    "Beide kinderen krijgen dezelfde sleutel en zouden elkaars serie overnemen.",
  );

  /* Een ander onderwerp is een andere oefening en hoort los te staan. */
  zouMoeten(
    "Een ander onderwerp krijgt een eigen sessie",
    sessieSleutel("kind-1", tegel) !==
      sessieSleutel("kind-1", "/oefenen/rekenen/getallen/optellen/oefening?leerdoel=doel-a"),
    "Twee onderwerpen delen dezelfde sleutel en lopen door elkaar heen.",
  );
} finally {
  /* De kopie en alles wat erin is gezet, gaat weg. */
  rmSync(werkmap, { recursive: true, force: true });
}

console.log(`Waardebewaking: ${gedaan.length + fouten.length} controles op een wegwerpkopie.`);
for (const g of gedaan) console.log("  ✓ " + g);

if (fouten.length > 0) {
  console.error(`\nEEN INSTELLING WORDT OVERSCHREVEN (${fouten.length}):`);
  for (const f of fouten) console.error("  ✗ " + f);
  process.exit(1);
}
