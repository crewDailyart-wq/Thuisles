/**
 * Zweefcontrole (Sara, 18 november 2026; BOUWREGELS 15.33/15.34, F13/F14): NIETS in een les mag zweven. Elk voorwerp staat
 * ECHT OP zijn ondergrond (op het hout, op het kleed, in de schaal van de weegschaal), met zijn onderkant in het
 * contactvlak, ook als de weegschaal kantelt (het voorwerp beweegt mee met zijn schaal).
 *
 * Het speelvlak van de gouden les Rekentaal (squla-rekentaal-gouden-vlak.tsx) geeft via `window.__rtMeet()` voor elke
 * vraag: waar elk voorwerp staat (`voet` = onderkant), de ondergronden (het oppervlak waar je op staat: `top` tot `bottom`)
 * en bij de weegschaal de bovenkant van elke schaal op dat moment. Deze controle vergelijkt die. Fout als:
 *   - een voorwerp meer dan 4 punten boven zijn ondergrond zweeft;
 *   - een voorwerp er (te ver) onder of helemaal naast staat;
 *   - een voorwerp op de weegschaal meer dan 4 punten boven zijn schaal zweeft, of ernaast staat, op elk moment
 *     van het kantelen.
 *
 * Gebruik in een testscript (zie scripts/test-rekentaal-gouden.mjs en scripts/speelcontrole.mjs):
 *   import { controleerZweven, controleerWeegschaal } from "./zweef-controle.mjs";
 *   const fouten = await controleerZweven(ev, "vraag5");            // ev = (expressie) => waarde in de pagina
 *   const fouten2 = await controleerWeegschaal(ev, "vraag5");       // volgt het kantelen (hooguit ~2 s)
 *
 * Los draaien: `node scripts/zweef-controle.mjs` speelt de les (alle vragen, goede route) via test-rekentaal-gouden.mjs,
 * dat deze controle meedraait.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const TOLERANTIE = 4;
/** Hoever een voorwerp in een schaal staat (ZINK in het vlak) en hoeveel afwijking daar nog bij mag. */
const ZINK_MAX = 14;

export const METING = `(() => { try { return window.__rtMeet ? window.__rtMeet() : null; } catch (e) { return null; } })()`;

/** Beoordeelt 1 meting; geeft een lijst met fouten (leeg = goed). */
export function beoordeel(m, label = "") {
  if (!m) return [];
  const f = [];
  const wat = (d) => `${label} ${m.beeld ?? ""} ${d.soort || d.id}`.trim();
  if (m.indeling === "weegschaal") {
    for (const d of m.dingen) {
      const s = m.schalen.find((x) => x.doos === d.id);
      if (!s) {
        f.push(`${wat(d)}: staat op geen enkele schaal`);
        continue;
      }
      const dx = Math.abs(d.x - s.x);
      const hoogte = d.voet - s.bovenkant; // > 0 = onder de bovenkant van de schaal (in de schaal), < 0 = erboven
      if (dx > 10) f.push(`${wat(d)}: staat ${dx.toFixed(0)} punten naast zijn schaal`);
      if (hoogte < -TOLERANTIE) f.push(`${wat(d)}: zweeft ${(-hoogte).toFixed(1)} punten boven zijn schaal (weegschaal-stand ${m.weegP.toFixed(2)})`);
      if (hoogte > ZINK_MAX) f.push(`${wat(d)}: zakt ${hoogte.toFixed(1)} punten door zijn schaal`);
    }
    return f;
  }
  for (const d of m.dingen) {
    const grond = m.gronden.filter((g) => d.x >= g.x0 + 8 && d.x <= g.x1 - 8);
    if (!grond.length) {
      f.push(`${wat(d)}: staat naast alle ondergronden (x ${d.x.toFixed(0)})`);
      continue;
    }
    /* Keuring 19 nov 2026: ook de UITEINDEN moeten op de ondergrond liggen (het lange broodje stak rechts buiten het
       kleed). Een kleed in perspectief (`schuin`) is boven smaller dan onder; gemeten op de middellijn van het voorwerp. */
    if (d.b && d.h && grond[0].h) {
      const g = grond[0];
      const ym = d.voet - d.h / 2;
      const fr = Math.max(0, Math.min(1, (ym - g.y) / g.h));
      const inspring = g.schuin ? Math.max(0, g.schuin[0] - g.schuin[1] * fr) * (g.x1 - g.x0) : 0;
      const links = g.x0 + inspring;
      const rechts = g.x1 - inspring;
      if (d.x - d.b / 2 < links - TOLERANTIE) f.push(`${wat(d)}: steekt links ${(links - (d.x - d.b / 2)).toFixed(0)} punten buiten de ondergrond`);
      if (d.x + d.b / 2 > rechts + TOLERANTIE) f.push(`${wat(d)}: steekt rechts ${(d.x + d.b / 2 - rechts).toFixed(0)} punten buiten de ondergrond`);
    }
    const goed = grond.some((g) => d.voet >= g.top - TOLERANTIE && d.voet <= g.bottom + TOLERANTIE);
    if (goed) continue;
    const dichtst = grond.map((g) => (d.voet < g.top ? g.top - d.voet : d.voet - g.bottom)).sort((a, b) => a - b)[0];
    const boven = grond.every((g) => d.voet < g.top);
    f.push(`${wat(d)}: ${boven ? "zweeft" : "staat buiten het oppervlak"} (${dichtst.toFixed(1)} punten van de ondergrond, voet y ${d.voet.toFixed(0)})`);
  }
  /* De startstreep (bij "onder") ligt met boven- en onderkant op de ondergrond (keuring 19 nov 2026). */
  if (m.streep && m.gronden && m.gronden.length) {
    const g = m.gronden[0];
    for (const [y, waar] of [[m.streep.top, "bovenkant"], [m.streep.bottom, "onderkant"]]) {
      const fr = g.h ? Math.max(0, Math.min(1, (y - g.y) / g.h)) : 0;
      const inspring = g.schuin ? Math.max(0, g.schuin[0] - g.schuin[1] * fr) * (g.x1 - g.x0) : 0;
      /* De streep mag ook op de houten rand van de tafel liggen: getoetst aan het plaatje zelf (3% van boven en onder eraf). */
      const buiten = y < g.y + 0.03 * g.h || y > g.y + 0.97 * g.h || m.streep.x < g.x0 + inspring || m.streep.x > g.x1 - inspring;
      if (buiten) f.push(`${label} ${m.beeld ?? ""} startstreep: ${waar} ligt niet op de ondergrond`.trim());
    }
  }
  return f;
}

/** 1 meting in de pagina nemen en beoordelen. */
export async function controleerZweven(ev, label = "") {
  const m = await ev(METING);
  if (!m) return [];
  if (!m.heel) return [`${label}: de plaatjes-versie is niet actief (reserve getekend): niet gecontroleerd`];
  return beoordeel(m, label);
}

/** De weegschaal volgen tijdens het kantelen: elke 50 ms een meting, tot de stand 1 is (hooguit ~2,5 s). Meldt ook hoeveel metingen. */
export async function controleerWeegschaal(ev, label = "", wacht = (ms) => new Promise((r) => setTimeout(r, ms))) {
  const fouten = [];
  let n = 0;
  for (let i = 0; i < 50; i++) {
    const m = await ev(METING);
    if (!m || m.indeling !== "weegschaal") break;
    n++;
    fouten.push(...beoordeel(m, label));
    if (m.weegP >= 1 && i > 3) break;
    await wacht(50);
  }
  return { fouten: [...new Set(fouten)], metingen: n };
}

/**
 * Voor scripts/speelcontrole.mjs: een meter die in de pagina meet (elke 120 ms) terwijl de les gespeeld wordt. Elke meting
 * van een voorwerp dat stilstaat (de weegschaal altijd, ook tijdens het kantelen) wordt beoordeeld; fouten komen in
 * `window.__zweef`. Voorwerpen die op dat moment bewegen (naar de plank of terug) tellen niet mee.
 */
export const ZWEEF_METER = `(() => {
  const TOLERANTIE = ${TOLERANTIE};
  const ZINK_MAX = ${ZINK_MAX};
  ${beoordeel.toString()}
  window.__zweef = [];
  window.__zweefMetingen = 0;
  let vorig = "";
  let stil = 0;
  setInterval(() => {
    let m = null;
    try { m = window.__rtMeet ? window.__rtMeet() : null; } catch (e) {}
    if (!m || !m.heel) return;
    const sleutel = JSON.stringify([m.beeld, m.dingen.map((d) => [d.id, Math.round(d.x), Math.round(d.voet)])]);
    stil = sleutel === vorig ? stil + 1 : 0;
    vorig = sleutel;
    if (m.indeling !== "weegschaal" && stil < 3) return;
    window.__zweefMetingen++;
    for (const f of beoordeel(m, "")) if (!window.__zweef.includes(f) && window.__zweef.length < 30) window.__zweef.push(f);
  }, 120);
})();`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = spawnSync("node", [fileURLToPath(new URL("./test-rekentaal-gouden.mjs", import.meta.url))], { stdio: "inherit", env: { ...process.env, ROUTE: process.env.ROUTE ?? "goed" } });
  process.exit(r.status ?? 1);
}
