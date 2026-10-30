/**
 * Welke groep 3-lessen moeten de speel- en overlapcontrole doorlopen?
 *
 *   LESSEN=a,b           precies deze lessen
 *   ALLEEN=klok-,tellen  alle lessen waarvan het id dit bevat
 *   BEWAAK=1             alleen de lessen die bij de klaargezette wijziging horen
 *                        (vóór een commit): een gewijzigd draaiboek → zijn lessen;
 *                        een gewijzigd vlak → de lessen van de draaiboeken die het
 *                        gebruiken; het lesscherm zelf → één les per onderdeel.
 *   (niets)              alle 60
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

const WORTEL = new URL("../", import.meta.url);
const LESSEN_MAP = new URL("src/components/les/lessen/", WORTEL);

/*
  Alleen de GEPUBLICEERDE lessen (30 oktober 2026, HARDE REGEL 8 in CLAUDE.md):
  lessen op concept worden niet gecontroleerd of getest. Nu zijn dat de 10 nieuwe
  lessen in Synthesis-stijl. Welke gepubliceerd zijn, staat in de database van de
  laptop (alleen gelezen).
*/
export function gepubliceerdeLessen() {
  try {
    return execSync(`sqlite3 -readonly data/thuisles.db "select distinct json_extract(figuur,'$.les') from vragen where figuur like '%\"lesscherm\"%' and status='gepubliceerd'"`, { cwd: WORTEL, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return null;
  }
}

/* Alle groep 3-lessen die gecontroleerd worden: de ids uit de SEO-lijst, alleen de gepubliceerde. */
export function alleLessen() {
  const bron = readFileSync(new URL("src/lib/seo/lessen-groep3.ts", WORTEL), "utf8");
  const alle = [...new Set([...bron.matchAll(/^\s+id: "([a-z0-9-]+)"/gm)].map((m) => m[1]))];
  const gepubliceerd = gepubliceerdeLessen();
  return gepubliceerd ? alle.filter((id) => gepubliceerd.includes(id)) : alle;
}

/* Per draaiboekbestand: de les-ids die erin staan, en welke vlakken het gebruikt. */
function draaiboeken(alle) {
  return readdirSync(LESSEN_MAP)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => {
      const bron = readFileSync(new URL(f, LESSEN_MAP), "utf8");
      const ids = [...new Set([...bron.matchAll(/\bid: "([a-z0-9-]+)"/g)].map((m) => m[1]))].filter((id) => alle.includes(id));
      const vlakken = [...bron.matchAll(/from "\.\.\/vlakken\/([^"]+)"/g)].map((m) => m[1].replace(/\.tsx?$/, ""));
      return { bestand: f, ids, vlakken };
    })
    .filter((d) => d.ids.length);
}

function gewijzigd() {
  try {
    return execSync("git diff --cached --name-only", { cwd: WORTEL, encoding: "utf8" }).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function kiesLessen() {
  const alle = alleLessen();
  if (process.env.LESSEN) return process.env.LESSEN.split(",");
  if (process.env.ALLEEN) {
    const alleen = process.env.ALLEEN.split(",");
    return alle.filter((id) => alleen.some((a) => id.includes(a)));
  }
  if (process.env.BEWAAK !== "1") return alle;

  const boeken = draaiboeken(alle);
  const gekozen = new Set();
  for (const pad of gewijzigd()) {
    const naam = pad.split("/").pop().replace(/\.(tsx?|css)$/, "").replace(/\.module$/, "");
    if (/src\/components\/les\/(Lesscherm|soort|motor|Bliepo)|src\/components\/oefenen\/opdracht-nieuw\.css/.test(pad)) {
      /* Het lesscherm zelf: alle gepubliceerde lessen (sinds 30 oktober 2026 zijn dat er maar 10). */
      for (const d of boeken) d.ids.forEach((id) => gekozen.add(id));
    } else if (pad.startsWith("src/components/les/lessen/")) {
      for (const d of boeken) if (d.bestand.replace(/\.tsx$/, "") === naam) d.ids.forEach((id) => gekozen.add(id));
    } else if (pad.startsWith("src/components/les/vlakken/")) {
      for (const d of boeken) if (d.vlakken.includes(naam)) d.ids.forEach((id) => gekozen.add(id));
    }
  }
  return [...gekozen];
}
