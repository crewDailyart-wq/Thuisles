/**
 * Controlegeheugen (29 oktober 2026, opdracht eigenaar): de overlap- en
 * speelcontrole in de bewaking slaan een les over die al goed getest is en
 * sindsdien niet is veranderd. Na een klein foutje hoeft dan niet alles
 * opnieuw, alleen wat er sinds de laatste goede test is veranderd.
 *
 * Per les een vingerafdruk van:
 *   - het draaiboek waar de les in staat;
 *   - de speelvlakken die dat draaiboek gebruikt (en wat die weer gebruiken);
 *   - ALLES in src/ buiten de mappen lessen/ en vlakken/ (het lesscherm, Bliepo,
 *     de stijlen, de stem …). Verandert daar iets, dan wordt elke les opnieuw getest;
 *   - het controlescript zelf.
 * Alleen lessen die zonder fouten door de controle kwamen, komen in het geheugen.
 * Het geheugen staat in data/controle-goed.json (niet in Git).
 *
 *   ALLES=1 npm run bewaak    het geheugen negeren en alles testen
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORTEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BESTAND = path.join(WORTEL, "data", "controle-goed.json");
const LESSEN = path.join(WORTEL, "src/components/les/lessen");
const VLAKKEN = path.join(WORTEL, "src/components/les/vlakken");

function alleBestanden(map, uitzonderen = []) {
  const uit = [];
  for (const naam of readdirSync(map).sort()) {
    const pad = path.join(map, naam);
    if (uitzonderen.includes(pad)) continue;
    if (statSync(pad).isDirectory()) uit.push(...alleBestanden(pad, uitzonderen));
    else uit.push(pad);
  }
  return uit;
}

function hashVan(paden) {
  const h = createHash("sha256");
  for (const p of paden) {
    h.update(path.relative(WORTEL, p));
    h.update(existsSync(p) ? readFileSync(p) : "weg");
  }
  return h.digest("hex");
}

/* Een vlak en alles wat het uit de map vlakken/ gebruikt. */
function vlakBestanden(naam, gezien = new Set()) {
  for (const ext of [".tsx", ".ts", ".module.css", ".css"]) {
    const pad = path.join(VLAKKEN, naam.replace(/\.(tsx?|css)$/, "") + ext);
    if (!existsSync(pad) || gezien.has(pad)) continue;
    gezien.add(pad);
    const bron = readFileSync(pad, "utf8");
    for (const m of bron.matchAll(/from "\.\/([^"]+)"/g)) vlakBestanden(m[1], gezien);
  }
  return gezien;
}

/** Maakt een functie die per les-id de vingerafdruk geeft. */
export function maakVingerafdruk(script) {
  const gedeeld = hashVan([
    ...alleBestanden(path.join(WORTEL, "src"), [LESSEN, VLAKKEN]),
    path.join(WORTEL, "scripts", script),
    path.join(WORTEL, "scripts", "lessenkeuze.mjs"),
  ]);
  const boeken = readdirSync(LESSEN)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => {
      const pad = path.join(LESSEN, f);
      const bron = readFileSync(pad, "utf8");
      const vlakken = new Set();
      for (const m of bron.matchAll(/from "\.\.\/vlakken\/([^"]+)"/g)) vlakBestanden(m[1], vlakken);
      return { ids: new Set([...bron.matchAll(/\bid: "([a-z0-9-]+)"/g)].map((m) => m[1])), pad, vlakken: [...vlakken].sort() };
    });
  return (id) => {
    const eigen = boeken.filter((b) => b.ids.has(id)).flatMap((b) => [b.pad, ...b.vlakken]);
    /* Les niet gevonden: nooit overslaan. */
    if (!eigen.length) return null;
    return createHash("sha256").update(gedeeld).update(hashVan(eigen)).digest("hex");
  };
}

function lees() {
  try {
    return JSON.parse(readFileSync(BESTAND, "utf8"));
  } catch {
    return {};
  }
}

/**
 * Splitst de lessen in: nog te testen, en al goed getest met dezelfde
 * vingerafdruk. Werkt alleen in de bewaking (BEWAAK=1) en niet met ALLES=1.
 */
export function zonderAlGoed(soort, script, ids) {
  if (process.env.BEWAAK !== "1" || process.env.ALLES === "1") return { testen: ids, overgeslagen: [], afdruk: maakVingerafdruk(script) };
  const afdruk = maakVingerafdruk(script);
  const goed = lees()[soort] ?? {};
  const testen = [];
  const overgeslagen = [];
  for (const id of ids) {
    const a = afdruk(id);
    if (a && goed[id] === a) overgeslagen.push(id);
    else testen.push(id);
  }
  return { testen, overgeslagen, afdruk };
}

/** Onthoudt de lessen die zonder fouten door de controle kwamen. */
export function onthoudGoed(soort, afdruk, ids) {
  if (!ids.length) return;
  const alles = lees();
  alles[soort] ??= {};
  for (const id of ids) {
    const a = afdruk(id);
    if (a) alles[soort][id] = a;
  }
  writeFileSync(BESTAND, JSON.stringify(alles, null, 2) + "\n");
}
