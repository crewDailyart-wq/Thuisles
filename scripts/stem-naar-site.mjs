/**
 * De stem van Ruth in de site zelf zetten (30 oktober 2026, opdracht eigenaar):
 * public/stem, zodat de audio met de site meegaat en niet op de online
 * opslagschijf hoeft (die was bijna vol).
 *
 *   node scripts/stem-naar-site.mjs     (de site moet lokaal draaien: npm run dev)
 *
 * Voor elke zin uit scripts/stemlessen.mjs (de lessen, de keuzes, de losse
 * stukjes, de gedeelde zinnen en de andere gepubliceerde lessen) wordt het
 * bewaarde geluid van de lokale site gehaald en bewaard als
 * public/stem/<hash van "3-5" + zin>.mp3 (groep 3 t/m 5). lib/stem-server.ts
 * (bewaardeZin) kijkt eerst daar. Een bestand dat er al staat, blijft staan.
 * Er wordt niets nieuws gemaakt en er gaat geen tegoed af.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const WORTEL = new URL("../", import.meta.url).pathname;
const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const MAP = join(WORTEL, "public", "stem");
const PROFIEL = "3-5";
export const siteNaam = (zin) => createHash("sha256").update(`${PROFIEL}\n${zin}`).digest("hex").slice(0, 32);

mkdirSync(MAP, { recursive: true });

/* Welke zinnen: dezelfde lijst als de stemcontrole (stemlessen schrijft die weg). */
/* EXTRA: ook de andere gepubliceerde lessen (stemlessen kijkt alleen naar lessen op gepubliceerd, HARDE REGEL 8). */
execFileSync("node", ["scripts/stemlessen.mjs"], { cwd: WORTEL, env: { ...process.env, EXTRA: "1", LIJST_UIT: join(MAP, "zinnen.json") }, stdio: ["ignore", "ignore", "inherit"] });
const { verplicht, andereLessen } = JSON.parse(readFileSync(join(MAP, "zinnen.json"), "utf8"));
/*
  Ook wat al met Ruth gemaakt is voor de andere lessen: die zinnen staan niet meer in
  STEMZINNEN.md (dat noemt alleen wat nog ontbreekt). Daarom: de lijst van de vorige
  keer, plus alles wat sinds 30 oktober 2026 in data/stem bij is gekomen.
*/
const vorige = existsSync(join(MAP, "zinnen-andere-lessen.json")) ? JSON.parse(readFileSync(join(MAP, "zinnen-andere-lessen.json"), "utf8")) : [];
const STEM = join(WORTEL, "data", "stem");
const sinds = new Date("2026-10-30T00:00:00Z").getTime();
const gemaakt = readdirSync(STEM)
  .filter((f) => f.startsWith("z-") && f.endsWith(".txt") && statSync(join(STEM, f)).mtimeMs > sinds)
  .map((f) => readFileSync(join(STEM, f), "utf8").trim())
  .filter(Boolean);
const andere = [...new Set([...vorige, ...andereLessen, ...gemaakt])].filter((z) => !z.includes("$"));
writeFileSync(join(MAP, "zinnen-andere-lessen.json"), JSON.stringify(andere));
writeFileSync(join(MAP, "zinnen.json"), JSON.stringify({ verplicht, andereLessen: andere }));
const alle = [...new Set([...verplicht, ...andere])];

let nieuw = 0;
let al = 0;
const ontbreekt = [];
const TEGELIJK = 8;
for (let i = 0; i < alle.length; i += TEGELIJK) {
  await Promise.all(
    alle.slice(i, i + TEGELIJK).map(async (zin) => {
      const bestand = join(MAP, `${siteNaam(zin)}.mp3`);
      if (existsSync(bestand)) return void al++;
      const r = await fetch(`${BASIS}/api/stem?zin=${encodeURIComponent(zin)}&groep=4`).catch(() => null);
      if (!r?.ok || !(r.headers.get("content-type") ?? "").includes("audio")) return void ontbreekt.push(zin);
      writeFileSync(bestand, Buffer.from(await r.arrayBuffer()));
      nieuw++;
    }),
  );
}

const bestanden = readdirSync(MAP).filter((f) => f.endsWith(".mp3"));
const mb = bestanden.reduce((n, f) => n + readFileSync(join(MAP, f)).length, 0) / 1048576;
console.log(`Stem in de site (public/stem): ${nieuw} nieuw, ${al} stonden er al, ${ontbreekt.length} zonder geluid. Totaal ${bestanden.length} bestanden, ${mb.toFixed(1)} MB.`);
for (const z of ontbreekt.slice(0, 10)) console.log(`  - zonder geluid: ${z}`);
