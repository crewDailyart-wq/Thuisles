/**
 * Maakt de gegevens voor de scholenkaart op de homepagina (/scholen).
 *
 *   node scripts/maak-scholenkaart.mjs
 *
 * Alles komt uit open overheidsdata; er wordt niets verzonnen en niets in de
 * database gezet:
 *
 *   - DUO, "Alle vestigingen basisonderwijs": naam, adres, website,
 *     denominatie (licentie CC-BY 4.0, bron: DUO);
 *   - DUO, "Referentieniveau per toets en vestiging": welke doorstroomtoets de
 *     school afneemt en welk referentieniveau de leerlingen halen
 *     (CC-BY 4.0, bron: DUO);
 *   - PDOK Locatieserver (BAG): de plek van het adres (publiek domein);
 *   - PDOK, CBS Gebiedsindelingen: de provinciegrenzen (CC-BY 4.0, bron: CBS).
 *
 * Uitkomst (in Git, want de site heeft ze nodig en ze bevatten alleen open
 * gegevens over scholen, niets over kinderen):
 *
 *   public/scholenkaart/scholen.json    alle vestigingen, compact
 *   public/scholenkaart/nederland.json  de provincies, vereenvoudigd
 *
 * Coördinaten in Rijksdriehoeksmeting (RD, meters), zodat de kaart van
 * Nederland niet scheef getrokken wordt. Het opzoeken van de adressen wordt
 * bewaard in node_modules/.cache/scholenkaart, zodat een tweede keer snel gaat.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const WORTEL = path.resolve(import.meta.dirname, "..");
const UIT = path.join(WORTEL, "public", "scholenkaart");
const CACHE = path.join(WORTEL, "node_modules", ".cache", "scholenkaart");
mkdirSync(UIT, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const BRONNEN = {
  vestigingen: "https://duo.nl/open_onderwijsdata/images/02.-alle-schoolvestigingen-basisonderwijs.csv",
  referentieniveau:
    "https://onderwijsdata.duo.nl/dataset/c62ea867-72d4-41ae-81af-8b4db27c5e52/resource/89920163-8b28-4e1a-b322-c3bb90f74f41/download/brin6_referentieniveau.csv",
  provincies:
    "https://service.pdok.nl/cbs/gebiedsindelingen/2024/wfs/v1_0?request=GetFeature&service=WFS&version=2.0.0&typeName=gebiedsindelingen:provincie_gegeneraliseerd&outputFormat=json&srsName=EPSG:28992",
};

/** De codes in het DUO-bestand, nagegaan door ze naast de eindscores te leggen. */
const TOETSEN = {
  "0011": "Centrale Eindtoets",
  "0012": "ROUTE 8",
  "0013": "IEP",
  "0014": "DIA",
  "0015": "Cesan",
  "0016": "AMN",
  "0017": "DOE",
  "0018": "Leerling in Beeld",
};

async function haal(adres, soort = "text", codering = "utf-8") {
  for (let poging = 1; ; poging++) {
    try {
      const antwoord = await fetch(adres);
      if (!antwoord.ok) throw new Error(`${antwoord.status}`);
      if (soort === "json") return await antwoord.json();
      return new TextDecoder(codering).decode(await antwoord.arrayBuffer());
    } catch (fout) {
      if (poging >= 4) throw new Error(`${adres}: ${fout.message}`);
      await new Promise((r) => setTimeout(r, 1500 * poging));
    }
  }
}

/** Eenvoudige CSV-lezer: aanhalingstekens, scheidingsteken naar keuze. */
function leesCsv(tekst, scheiding) {
  const regels = [];
  let rij = [];
  let veld = "";
  let binnen = false;
  for (let i = 0; i < tekst.length; i++) {
    const t = tekst[i];
    if (binnen) {
      if (t === '"' && tekst[i + 1] === '"') {
        veld += '"';
        i++;
      } else if (t === '"') binnen = false;
      else veld += t;
    } else if (t === '"') binnen = true;
    else if (t === scheiding) {
      rij.push(veld);
      veld = "";
    } else if (t === "\n" || t === "\r") {
      if (t === "\r" && tekst[i + 1] === "\n") i++;
      rij.push(veld);
      if (rij.length > 1 || rij[0] !== "") regels.push(rij);
      rij = [];
      veld = "";
    } else veld += t;
  }
  if (veld !== "" || rij.length) {
    rij.push(veld);
    regels.push(rij);
  }
  const [kop, ...rest] = regels;
  return rest.map((r) => Object.fromEntries(kop.map((k, i) => [k.trim().replace(/^﻿/, ""), (r[i] ?? "").trim()])));
}

const netjes = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-zà-ÿ])/g, (_, voor, letter) => voor + letter.toUpperCase())
    .replace(/\bGem\b/g, "gem.");

// 1. Vestigingen.
console.log("▸ Vestigingen basisonderwijs (DUO)…");
const vestigingen = leesCsv(await haal(BRONNEN.vestigingen, "text", "windows-1252"), ";");
console.log(`  ${vestigingen.length} vestigingen`);

// 2. Referentieniveaus: het laatste jaar per school.
console.log("▸ Referentieniveaus per toets en vestiging (DUO)…");
const niveaus = leesCsv(await haal(BRONNEN.referentieniveau), ",");
const peiljaar = niveaus.reduce((hoogste, r) => Math.max(hoogste, Number(r.PEILJAAR) || 0), 0);
const perSchool = new Map();
for (const r of niveaus) {
  if (Number(r.PEILJAAR) !== peiljaar) continue;
  const id = r.INSTELLINGSCODE + r.VESTIGINGSCODE;
  const s = perSchool.get(id) ?? { toetsen: new Map(), aantal: {} };
  const n = Number(r.AANTAL_LEERLINGEN);
  s.toetsen.set(r.DOORSTROOMTOETS_PO, (s.toetsen.get(r.DOORSTROOMTOETS_PO) ?? 0) + Math.max(n, 0));
  // -1 betekent: afgeschermd (te weinig leerlingen). Dan rekenen we dat vak niet.
  s.aantal[r.REFERENTIENIVEAU] = n < 0 || s.aantal[r.REFERENTIENIVEAU] === -1 ? -1 : (s.aantal[r.REFERENTIENIVEAU] ?? 0) + n;
  perSchool.set(id, s);
}
console.log(`  peiljaar ${peiljaar}, ${perSchool.size} vestigingen met uitslagen`);

/**
 * Percentage op of boven 1F, en op het hoogste niveau (2F of 1S).
 *
 * DUO schermt aantallen van 1 tot en met 4 af als -1; een niveau dat er niet
 * staat, heeft 0 leerlingen. Een afgeschermd aantal rekenen we als 2,5 (het
 * midden) en dan staat er een derde getal 1 bij: "ongeveer". Zo valt een school
 * niet weg omdat er weinig kinderen onder 1F zaten, en wordt er niets
 * verzwegen. Onder de 5 leerlingen in totaal tonen we niets.
 */
function vak(aantal, lager, f1, hoog) {
  let ongeveer = 0;
  const waarde = (k) => {
    const n = aantal[k];
    if (n === undefined) return 0;
    if (n < 0) {
      ongeveer = 1;
      return 2.5;
    }
    return n;
  };
  const [a, b, c] = [waarde(lager), waarde(f1), waarde(hoog)];
  const totaal = a + b + c;
  if (totaal < 5) return null;
  return [Math.round(((b + c) / totaal) * 100), Math.round((c / totaal) * 100), totaal, ongeveer];
}

// 3. Adressen opzoeken (PDOK), met cache.
console.log("▸ Plek van elk adres opzoeken (PDOK Locatieserver)…");
const cacheBestand = path.join(CACHE, "adressen.json");
const cache = existsSync(cacheBestand) ? JSON.parse(readFileSync(cacheBestand, "utf8")) : {};
const huisnummerVan = (s) => (s.match(/\d+/) ?? [""])[0];
async function plek(v) {
  const postcode = v.POSTCODE.replace(/\s/g, "");
  const nummer = huisnummerVan(v["HUISNUMMER-TOEVOEGING"]);
  const sleutel = `${postcode}|${nummer}`;
  if (cache[sleutel] !== undefined) return cache[sleutel];
  const vraag = async (q, type) => {
    const adres = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(q)}&fq=type:${type}&rows=1&fl=centroide_rd`;
    const d = await haal(adres, "json");
    const p = d.response.docs[0]?.centroide_rd;
    if (!p) return null;
    const [x, y] = p.replace(/POINT\(|\)/g, "").split(" ").map(Number);
    return [Math.round(x), Math.round(y)];
  };
  let gevonden = nummer ? await vraag(`postcode:${postcode} AND huisnummer:${nummer}`, "adres") : null;
  if (!gevonden) gevonden = await vraag(`postcode:${postcode}`, "postcode");
  cache[sleutel] = gevonden;
  return gevonden;
}
let klaar = 0;
const plekken = new Array(vestigingen.length);
const rij = vestigingen.map((v, i) => i);
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (rij.length) {
      const i = rij.shift();
      plekken[i] = await plek(vestigingen[i]);
      if (++klaar % 500 === 0) {
        console.log(`  ${klaar}/${vestigingen.length}`);
        writeFileSync(cacheBestand, JSON.stringify(cache));
      }
    }
  }),
);
writeFileSync(cacheBestand, JSON.stringify(cache));
const zonderPlek = plekken.filter((p) => !p).length;
console.log(`  klaar; ${zonderPlek} zonder plek`);

// 4. Samenvoegen.
const VELDEN = [
  "id", "naam", "adres", "postcode", "plaats", "gemeente", "provincie", "denominatie", "website",
  "x", "y", "toets", "rekenen", "lezen", "taalverzorging",
];
const landelijk = { rekenen: [0, 0, 0], lezen: [0, 0, 0], taalverzorging: [0, 0, 0] };
const scholen = [];
vestigingen.forEach((v, i) => {
  const id = v.INSTELLINGSCODE + v.VESTIGINGSCODE.slice(-2);
  const p = plekken[i];
  if (!p) return;
  const u = perSchool.get(id);
  let toets = null;
  let rekenen = null;
  let lezen = null;
  let taalverzorging = null;
  if (u) {
    toets = [...u.toetsen.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    rekenen = vak(u.aantal, "REKENEN_LAGER_1F", "REKENEN_1F", "REKENEN_1S");
    lezen = vak(u.aantal, "TAAL_LV_LAGER_1F", "TAAL_LV_1F", "TAAL_LV_2F");
    taalverzorging = vak(u.aantal, "TAAL_TV_LAGER_1F", "TAAL_TV_1F", "TAAL_TV_2F");
    for (const [naam, w] of [["rekenen", rekenen], ["lezen", lezen], ["taalverzorging", taalverzorging]]) {
      if (!w) continue;
      landelijk[naam][0] += (w[0] / 100) * w[2];
      landelijk[naam][1] += (w[1] / 100) * w[2];
      landelijk[naam][2] += w[2];
    }
  }
  const website = v.INTERNETADRES && v.INTERNETADRES !== " " ? v.INTERNETADRES.replace(/^https?:\/\//, "") : "";
  scholen.push([
    id,
    v.VESTIGINGSNAAM,
    `${netjes(v.STRAATNAAM)} ${v["HUISNUMMER-TOEVOEGING"]}`.trim(),
    v.POSTCODE,
    netjes(v.PLAATSNAAM),
    netjes(v.GEMEENTENAAM),
    v.PROVINCIE,
    v.DENOMINATIE,
    website,
    p[0],
    p[1],
    toets,
    rekenen && [rekenen[0], rekenen[1], rekenen[3]],
    lezen && [lezen[0], lezen[1], lezen[3]],
    taalverzorging && [taalverzorging[0], taalverzorging[1], taalverzorging[3]],
  ]);
});
const gemiddeld = Object.fromEntries(
  Object.entries(landelijk).map(([k, [a, b, n]]) => [k, [Math.round((a / n) * 100), Math.round((b / n) * 100)]]),
);
scholen.sort((a, b) => a[1].localeCompare(b[1], "nl"));
writeFileSync(
  path.join(UIT, "scholen.json"),
  JSON.stringify({
    bron:
      "DUO Open Onderwijsdata (CC-BY 4.0): alle vestigingen basisonderwijs en referentieniveau per toets en vestiging. Locatie: PDOK Locatieserver (BAG).",
    gemaakt: new Date().toISOString().slice(0, 10),
    peiljaar,
    toetsen: TOETSEN,
    landelijk: gemiddeld,
    velden: VELDEN,
    scholen,
  }),
);
console.log(`▸ ${scholen.length} scholen in public/scholenkaart/scholen.json; landelijk:`, gemiddeld);

/* Een klein overzicht voor de homepagina, meegebouwd in de code (geen schijf nodig). */
writeFileSync(
  path.join(WORTEL, "src", "lib", "site", "scholenoverzicht.json"),
  `${JSON.stringify({ aantal: scholen.length, peiljaar, landelijk: gemiddeld }, null, 2)}\n`,
);

// 5. Provinciegrenzen, vereenvoudigd.
console.log("▸ Provinciegrenzen (CBS, via PDOK)…");
const geo = await haal(BRONNEN.provincies, "json");
function vereenvoudig(punten, marge) {
  if (punten.length < 3) return punten;
  const [ax, ay] = punten[0];
  const [bx, by] = punten[punten.length - 1];
  let verst = 0;
  let index = 0;
  const lengte = Math.hypot(bx - ax, by - ay);
  for (let i = 1; i < punten.length - 1; i++) {
    const [px, py] = punten[i];
    /* Een gesloten ring begint en eindigt op hetzelfde punt: dan de afstand tot dat punt. */
    const afstand = lengte
      ? Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax) / lengte
      : Math.hypot(px - ax, py - ay);
    if (afstand > verst) {
      verst = afstand;
      index = i;
    }
  }
  if (verst <= marge) return [punten[0], punten[punten.length - 1]];
  return [...vereenvoudig(punten.slice(0, index + 1), marge).slice(0, -1), ...vereenvoudig(punten.slice(index), marge)];
}
const provincies = geo.features.map((f) => {
  const veelhoeken = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const ringen = veelhoeken
    .map((v) => vereenvoudig(v[0], 220).map(([x, y]) => [Math.round(x), Math.round(y)]))
    .filter((r) => r.length >= 4);
  return { naam: f.properties.statnaam, ringen: ringen.map((r) => r.flat()) };
});
writeFileSync(path.join(UIT, "nederland.json"), JSON.stringify({ bron: "CBS Gebiedsindelingen 2024 (CC-BY 4.0), via PDOK", provincies }));
console.log(`  ${provincies.length} provincies in public/scholenkaart/nederland.json`);
