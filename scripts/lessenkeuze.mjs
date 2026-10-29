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

/* Alle groep 3-lessen: de ids uit de SEO-lijst (die heeft ze alle 60). */
export function alleLessen() {
  const bron = readFileSync(new URL("src/lib/seo/lessen-groep3.ts", WORTEL), "utf8");
  return [...new Set([...bron.matchAll(/^\s+id: "([a-z0-9-]+)"/gm)].map((m) => m[1]))];
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
      for (const d of boeken) gekozen.add(d.ids[0]);
    } else if (pad.startsWith("src/components/les/lessen/")) {
      for (const d of boeken) if (d.bestand.replace(/\.tsx$/, "") === naam) d.ids.forEach((id) => gekozen.add(id));
    } else if (pad.startsWith("src/components/les/vlakken/")) {
      for (const d of boeken) if (d.vlakken.includes(naam)) d.ids.forEach((id) => gekozen.add(id));
    }
  }
  return [...gekozen];
}
