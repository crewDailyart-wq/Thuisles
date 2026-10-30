/**
 * De stem van Ruth voor de nagebouwde lessen (28 oktober 2026, opdracht eigenaar).
 *
 *   npm run stemlessen              tellen + controleren wat ontbreekt (kost niets)
 *   MAAK=test npm run stemlessen    3 testzinnen maken en controleren
 *   MAAK=alles npm run stemlessen   alles wat ontbreekt maken
 *   CONTROLE=1 npm run stemlessen   faalt als er voor een vaste zin geen audio is
 *                                   (zit in npm run bewaak; ook vóór online zetten)
 *
 * De zinnen komen uit de rekencontrole, die elke route door de lessen speelt
 * (goed, 1× en 2× fout, weet ik niet) en alles verzamelt wat Bliepo zegt. Elke
 * zin wordt één keer gemaakt en bewaard (bestandsnaam = hash van de zin, in
 * data/stem); een ongewijzigde zin wordt nooit opnieuw gemaakt. Maken gaat via
 * de draaiende site (POST /api/stem, actie "vast"), met dezelfde instellingen,
 * klankbewerking en controle (terugluisteren) als de rest van de site.
 *
 * Voor het maken wordt het tegoed bij ElevenLabs gecontroleerd: er blijft altijd
 * 10 procent van de maandruimte over. Is er te weinig, dan wordt er niets gemaakt.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORTEL = new URL("../", import.meta.url).pathname;
const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const kop = process.env.WW ? { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } : {};
const GROEP = 4; // groep 3 t/m 5 hebben dezelfde stem (toon "3-5")
const RESERVE = 0.1;

/* Zoals het lesscherm de zin naar de stem stuurt (Lesscherm.tsx, kaal). */
const kaal = (z) => z.replace(/\{(\d+):[a-z]+\}/g, "{$1}").replace(/\[\[[bgrum]:([^\]]+)\]\]/g, "$1").replace(/[{}*]/g, "").replace(/−/g, " min ");

function verzamel() {
  const tmp = mkdtempSync(join(tmpdir(), "stemlessen-"));
  const bestand = join(tmp, "zinnen.json");
  execFileSync("node", ["scripts/rekencontrole.mjs"], { cwd: WORTEL, env: { ...process.env, ZINNEN_UIT: bestand }, stdio: ["ignore", "ignore", "inherit"] });
  const perLes = JSON.parse(readFileSync(bestand, "utf8"));
  rmSync(tmp, { recursive: true, force: true });
  const alle = new Set();
  for (const zinnen of Object.values(perLes)) for (const z of zinnen) {
    const k = kaal(z).trim();
    if (k && /\p{L}/u.test(k)) alle.add(k);
  }
  /* Wat Bliepo zegt als hij een knop de eerste keer benoemt (BENOEM in Lesscherm.tsx; houd gelijk). */
  for (const z of ["Tik op het goede getal.", "Weet je het niet? Tik dan op het vraagteken.", "Tik daarna op het vinkje.", "Tik op de pijl om verder te gaan.", "Typ het getal. Tik dan op het vinkje.", "Klaar? Tik dan op het vinkje.", "Hulp nodig? Tik dan op het handje.", "Wil je liever de les? Tik op het handje."]) alle.add(z);
  /* Het naamfragment van het testprofiel (geen echt kind). */
  alle.add("Testkind!");
  /*
    Losse stukjes voor de antwoordkeuzes (30 oktober 2026): de getallen 0 t/m 100
    en de rekenwoorden. Een keuze als "7 plus 2 is 9" klinkt dan als heel bestand
    (als hij in een les voorkomt) of anders uit deze stukjes (api/stem, keuze=1).
  */
  for (const f of FRAGMENTEN) alle.add(f);
  return { perLes, zinnen: [...alle] };
}

/* "0" haalde de terugluistercontrole niet (30 okt 2026) en staat als "nul" bewaard (ALS_WOORD in lib/stem-server.ts). */
const NIET_GELUKT = new Set(["0"]);
const FRAGMENTEN = [...Array.from({ length: 101 }, (_, i) => String(i)).filter((f) => !NIET_GELUKT.has(f)), "nul", "plus", "min", "is", "hoeveel", "en", "uur", "half", "kwart", "over", "voor", "minuten", "Ja", "Nee", "Waar", "Niet waar"];

/*
  De rest van wat Bliepo zegt (30 oktober 2026): de gedeelde zinnen van de site
  (goed, fout, aanmoediging, begroeting, hulp) en de vaste zinnen van de andere
  gepubliceerde lessen (uit STEMZINNEN.md, npm run stemzinnen). Die worden gemaakt
  zolang het tegoed het toelaat (EXTRA=1), daarna de lessen.
*/
async function verzamelExtra(metLessen) {
  const { zinnen: gedeeld } = await post({ actie: "gedeeld" });
  if (!metLessen) return { gedeeld: gedeeld.filter((z) => /\p{L}/u.test(z)), lessen: [] };
  execFileSync("node", ["scripts/stemzinnen.mjs"], { cwd: WORTEL, stdio: ["ignore", "ignore", "inherit"] });
  const gepubliceerd = new Set(
    execFileSync("sqlite3", [join(WORTEL, "data/thuisles.db"), `select distinct json_extract(figuur,'$.les') from vragen where figuur like '%"lesscherm"%' and status='gepubliceerd'`], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean),
  );
  const lessen = [];
  let sectie = null;
  for (const regel of readFileSync(join(WORTEL, "STEMZINNEN.md"), "utf8").split("\n")) {
    const kop = /^## (\S+)( \(gedeeld\))?/.exec(regel);
    if (kop) {
      sectie = gepubliceerd.has(kop[1]) || kop[2] ? kop[1] : null;
      continue;
    }
    if (sectie && regel.startsWith("- ")) {
      const z = kaal(regel.slice(2)).trim();
      if (z && !z.includes("…") && /\p{L}/u.test(z)) lessen.push(z);
    }
  }
  return { gedeeld: gedeeld.filter((z) => /\p{L}/u.test(z)), lessen: [...new Set(lessen)] };
}

async function post(body) {
  const r = await fetch(`${BASIS}/api/stem`, { method: "POST", headers: { "Content-Type": "application/json", ...kop }, body: JSON.stringify({ groep: GROEP, ...body }) });
  if (!r.ok) throw new Error(`De site gaf ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

function leesSleutel() {
  const env = readFileSync(join(WORTEL, ".env.local"), "utf8");
  return /^ELEVEN_API_KEY=(.*)$/m.exec(env)?.[1]?.trim();
}

async function tegoed() {
  const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": leesSleutel() } });
  const j = await r.json();
  return { gebruikt: j.character_count, limiet: j.character_limit };
}

/* Ruwe schatting van de kosten: tekst + toonaanwijzing, model eleven_v4_turbo telt half. */
const schat = (zinnen) => Math.ceil(zinnen.reduce((n, z) => n + z.replace(/\d+/g, (m) => "x".repeat(m.length * 5)).length + 20 * Math.max(1, (z.match(/[.!?]+(\s|$)/g) || []).length), 0) * 0.5);

/* Een bewaarde zin ophalen en controleren: lengte past bij de zin, er klinkt iets (geen stilte). */
async function controleerGeluid(zin) {
  const r = await fetch(`${BASIS}/api/stem?zin=${encodeURIComponent(zin)}&groep=${GROEP}`, { headers: kop });
  if (!r.ok) return { goed: false, reden: `niet te halen (${r.status})` };
  const tmp = mkdtempSync(join(tmpdir(), "stemtest-"));
  const mp3 = join(tmp, "z.mp3");
  writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  try {
    const info = execFileSync("afinfo", [mp3], { encoding: "utf8" });
    const duur = Number(/estimated duration: ([\d.]+)/.exec(info)?.[1] ?? 0);
    const wav = join(tmp, "z.wav");
    execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@16000", "-c", "1", mp3, wav]);
    const pcm = readFileSync(wav);
    let som = 0;
    let n = 0;
    for (let i = 44; i + 1 < pcm.length; i += 2) {
      const v = pcm.readInt16LE(i) / 32768;
      som += v * v;
      n++;
    }
    const rms = Math.sqrt(som / Math.max(1, n));
    const woorden = zin.split(/\s+/).length;
    const tekort = duur < 0.25 + woorden * 0.15;
    const telang = duur > 2 + woorden * 1.2;
    const stil = rms < 0.01;
    return { goed: !tekort && !telang && !stil, duur: duur.toFixed(2), rms: rms.toFixed(3), reden: tekort ? "te kort" : telang ? "te lang" : stil ? "stil" : "" };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/* Draait de site niet, dan in de bewaking overslaan (zoals de andere controles). */
try {
  await fetch(BASIS, { headers: kop });
} catch {
  console.log(`⚠️  Stemcontrole overgeslagen: de site draait niet op ${BASIS} (start eerst npm run dev).`);
  process.exit(process.env.BEWAAK === "1" ? 0 : 1);
}

const { perLes, zinnen: lesZinnen } = verzamel();
const extra = await verzamelExtra(!!process.env.EXTRA);
/* Verplicht (de controle faalt als hier iets ontbreekt): de 10 lessen, keuzes, stukjes en de gedeelde zinnen. */
const zinnen = [...new Set([...lesZinnen, ...extra.gedeeld])];
const { ontbreekt } = await post({ actie: "ontbreekt", zinnen });
const { ontbreekt: ontbreektExtra } = extra.lessen.length ? await post({ actie: "ontbreekt", zinnen: extra.lessen.filter((z) => !zinnen.includes(z)) }) : { ontbreekt: [] };
if (extra.lessen.length) console.log(`Andere gepubliceerde lessen: ${extra.lessen.length} vaste zinnen, nog zonder Ruth: ${ontbreektExtra.length} (schatting ${schat(ontbreektExtra)} credits).`);
writeFileSync(join(WORTEL, "data/stem-ontbreekt.json"), JSON.stringify({ verplicht: ontbreekt, andereLessen: ontbreektExtra }, null, 1));
/* Alle zinnen (niet alleen wat ontbreekt), voor scripts/stem-naar-site.mjs en scripts/stemcontrole.mjs. */
if (process.env.LIJST_UIT) writeFileSync(process.env.LIJST_UIT, JSON.stringify({ verplicht: zinnen, andereLessen: extra.lessen }));
const tekens = zinnen.reduce((n, z) => n + z.length, 0);
console.log(`Stem voor de nagebouwde lessen: ${zinnen.length} verschillende zinnen (${tekens} tekens tekst) in ${Object.keys(perLes).length} lessen.`);
for (const [les, lijst] of Object.entries(perLes)) console.log(`  ${les}: ${new Set(lijst.map(kaal)).size} zinnen`);
console.log(`Al bewaard: ${zinnen.length - ontbreekt.length}. Ontbreekt: ${ontbreekt.length} (schatting ${schat(ontbreekt)} credits).`);

if (process.env.CONTROLE) {
  if (ontbreekt.length) {
    console.log(`\nStemcontrole: voor ${ontbreekt.length} vaste zinnen ontbreekt de audio. Eerst maken (MAAK=alles npm run stemlessen), dan pas online.`);
    for (const z of ontbreekt.slice(0, 15)) console.log(`  - ${z}`);
    process.exit(1);
  }
  console.log("\nStemcontrole: alle vaste zinnen hebben audio.");
  process.exit(0);
}

const maak = process.env.MAAK;
if (!maak || !(ontbreekt.length + ontbreektExtra.length)) process.exit(0);

const voor = await tegoed();
const ruimte = Math.floor(voor.limiet * (1 - RESERVE)) - voor.gebruikt;
const lijst = maak === "test" ? ontbreekt.filter((z) => z.split(" ").length >= 4).slice(0, 3) : [...ontbreekt];
/* Daarna de andere lessen, zolang het tegoed (met 10% reserve) het toelaat. */
let overgeslagen = 0;
if (maak !== "test") {
  for (const z of ontbreektExtra) {
    if (schat([...lijst, z]) <= ruimte) lijst.push(z);
    else overgeslagen++;
  }
  if (overgeslagen) console.log(`Te weinig tegoed voor ${overgeslagen} zinnen van de andere lessen; die blijven voor later (data/stem-ontbreekt.json).`);
}
const nodig = schat(lijst);
console.log(`\nTegoed: ${voor.gebruikt} van ${voor.limiet} gebruikt; te besteden met 10% reserve: ${ruimte}. Nodig (schatting): ${nodig}.`);
if (nodig > ruimte) {
  console.log(`Niet genoeg tegoed: ${nodig - ruimte} credits tekort. Er is niets gemaakt.`);
  process.exit(1);
}

const mislukt = [];
const PER = 5;
let klaar = 0;
for (let i = 0; i < lijst.length; i += PER) {
  const deel = lijst.slice(i, i + PER);
  /* Twee groepjes tegelijk (ElevenLabs Creator mag een paar verzoeken tegelijk). */
  const deel2 = lijst.slice(i + PER, i + 2 * PER);
  const uitslagen = await Promise.all([deel, deel2].filter((d) => d.length).map((d) => post({ actie: "vast", zinnen: d })));
  i += deel2.length ? PER : 0;
  for (const u of uitslagen.flatMap((x) => x.uitkomst)) {
    klaar++;
    if (!u.goed) mislukt.push(`${u.zin} (code ${u.code ?? "controle"})`);
  }
  if (klaar % 50 < 2 * PER) process.stdout.write(`  ${klaar}/${lijst.length}\n`);
}

if (maak === "test") {
  console.log("\nTest: controle van de gemaakte bestanden");
  for (const z of lijst) {
    const c = await controleerGeluid(z);
    console.log(`  ${c.goed ? "✓" : "✗"} "${z}" — ${c.duur ?? "?"} s, volume ${c.rms ?? "?"}${c.reden ? ` (${c.reden})` : ""}`);
  }
}

const na = await tegoed();
console.log(`\nGemaakt: ${lijst.length - mislukt.length} van ${lijst.length}. Gebruikt: ${na.gebruikt - voor.gebruikt} credits. Over: ${na.limiet - na.gebruikt} (van ${na.limiet}).`);
if (mislukt.length) {
  console.log(`Niet gelukt (${mislukt.length}):`);
  for (const m of mislukt.slice(0, 30)) console.log(`  - ${m}`);
}
writeFileSync(join(WORTEL, "data", "stem-lessen-verslag.json"), JSON.stringify({ tijd: new Date().toISOString(), zinnen: zinnen.length, gemaakt: lijst.length - mislukt.length, mislukt, gebruikt: na.gebruikt - voor.gebruikt, over: na.limiet - na.gebruikt }, null, 1));
process.exit(mislukt.length ? 1 : 0);
