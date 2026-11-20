/*
  Vat de meting van Bliepo's gedrag samen (BOUWREGELS 15.51, 20 november 2026; FOUTEN-VOORBEELDEN F21).
  Eerst meten (zichtbare Chrome, via het lesoverzicht, echte stem op volume 0, de speler tikt nooit zelf op de pijl):
    ZICHTBAAR=1 VIAOVERZICHT=1 STEM=1 GOED=1 PIJLTIK=nooit METER=1 METERUIT=<map> TEGELIJK=1 MAXMIN=5 LESSEN=... node scripts/speelcontrole.mjs
  Dan:  node scripts/bliepo-gedrag-meting.mjs <map>
  Per les:
    1 pijl tijdens het praten: bij hoeveel gewone stukken ("pijl-door") stond de pijl in beeld terwijl de stem liep;
    2 tik tijdens het praten: hoe snel stopte de stem (ms) en hoe snel kwam het volgende stuk (ms);
    3 goed met zin: vanzelf door (zonder tik)? tijd van groen tot het volgende stuk (s);
    4 goed in stilte: vanzelf door? tijd (s); en hoe lang stond er een pijl boven een leeg tekstvak (ms).
  Fout (code 1) als: de pijl ontbrak tijdens het praten, de stem niet binnen 300 ms stopte of het volgende stuk niet
  binnen 1000 ms kwam na een tik, de les na goed niet vanzelf doorging, of er bij stil goed een pijl stond.
*/
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const map = process.argv[2];
if (!map) {
  console.error("Gebruik: node scripts/bliepo-gedrag-meting.mjs <map met <les>.json>");
  process.exit(2);
}
const s1 = (ms) => (ms / 1000).toFixed(1);
const med = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
let fout = 0;
const rijen = [];
for (const f of readdirSync(map).filter((f) => f.endsWith(".json")).sort()) {
  const id = f.replace(/\.json$/, "");
  const d = JSON.parse(readFileSync(join(map, f), "utf8"));
  const bm = d.bm;
  if (!bm) {
    rijen.push({ id, fout: ["geen meting"] });
    fout++;
    continue;
  }
  const ev = bm.ev;
  const snap = bm.snap;
  const fouten = [];
  const snapOp = (t) => {
    let x = null;
    for (const s of snap) if (s.t <= t) x = s;
    return x;
  };
  /* 1. pijl tijdens het praten */
  let p1 = 0;
  let p1ok = 0;
  const p1mis = [];
  for (const g of d.gouden.filter((g) => g.wat === "pijl-door")) {
    /* Stil goed (15.39): Bliepo zegt dan niets; dat stuk telt hier niet mee (zie punt 4). */
    if (d.stilte.some((x) => x.soort === "stil" && Math.abs(x.t - g.t) < 30)) continue;
    /* De stem van dit stuk: start na "pijl-door" en vóór de volgende stap van de les. */
    const volg = d.gouden.find((x) => x.t > g.t && x.wat !== "pijl-door" && x.wat !== "reactie");
    const st = ev.find((e) => e.s === "stem-start" && e.t >= g.t - 50 && e.t <= g.t + 4000 && (!volg || e.t < volg.t) && (!e.z || String(g.zin || "").replace(/\{(\d+):[^}]*\}/g, "$1").startsWith(e.z.slice(0, 12))));
    if (!st) continue;
    const eind = ev.find((e) => (e.s === "stem-eind" || e.s === "cancel") && e.t > st.t);
    const te = Math.min(eind ? eind.t : st.t + 1500, st.t + 1500);
    const venster = [snapOp(st.t), ...snap.filter((s) => s.t > st.t && s.t <= te)].filter(Boolean);
    p1++;
    if (venster.some((s) => s.p)) p1ok++;
    else p1mis.push(String(g.zin || "").slice(0, 50));
  }
  if (p1mis.length) fouten.push(`pijl ontbrak tijdens praten (${p1mis.length}x, bv. "${p1mis[0]}")`);
  /* 2. tik tijdens het praten */
  const stop = [];
  const volgende = [];
  const tekstNa = [];
  for (const k of bm.tikken.filter((k) => !k.mislukt)) {
    const e = ev.find((e) => (e.s === "cancel" || e.s === "stem-eind") && e.t >= k.t);
    if (e) stop.push(e.t - k.t);
    /* "Door" = de les gaat verder (zegDoor klaar: "pijl-getikt" in het logboek). Wacht de les daarna nog op een animatie
       (bijvoorbeeld de klok die uitrolt), dan is dat de inhoud van de les, niet de pijl; de tekst-tijd staat erbij. */
    const g = d.gouden.find((x) => x.wat === "pijl-getikt" && x.t >= k.t - 5);
    if (g) volgende.push(g.t - k.t);
    const n = snap.find((s) => s.t > k.t && s.tk !== k.tekstVoor);
    if (n) tekstNa.push(n.t - k.t);
  }
  if (stop.some((x) => x > 300)) fouten.push(`stem stopte niet meteen na de tik (${Math.max(...stop)} ms)`);
  if (volgende.length < stop.length || volgende.some((x) => x > 300)) fouten.push(`les ging niet meteen door na de tik (${volgende.join(", ")} ms)`);
  /* 3 en 4. na goed */
  const goed = d.scherm.filter((x) => x.soort === "goed");
  const metZin = [];
  const stil = [];
  const naStem = [];
  let stemBijLeeg = 0;
  let pijlOudMs = 0;
  const pijlOudKeer = new Set();
  let pijlLeegMs = 0;
  let nietDoor = 0;
  let getikt = 0;
  for (let i = 0; i < goed.length; i++) {
    const tG = goed[i].t;
    const tEind = i + 1 < goed.length ? goed[i + 1].t : tG + 30000;
    const soortS = d.stilte.find((x) => x.t >= tG - 20 && x.t <= tG + 3000 && ["zin", "stil", "geen-zin"].includes(x.soort));
    const isStil = soortS && soortS.soort === "stil";
    const T0 = snapOp(tG)?.tk ?? "";
    const na = snap.filter((s) => s.t > tG && s.t < tEind);
    /* De pijl hoort tegelijk met Bliepo's reactie te komen, niet al onder de oude vraag (PIJL-KLOK.md punt 3). */
    for (let j = 0; j < snap.length - 1; j++) {
      const x = snap[j];
      if (x.t < tG - 50 || x.t >= tEind) continue;
      if (x.tk !== T0 || !T0) break;
      if (x.p) {
        const d = Math.min(snap[j + 1].t, tEind) - Math.max(x.t, tG);
        if (d > 0) {
          pijlOudMs += d;
          pijlOudKeer.add(tG);
        }
      }
    }
    let R = null;
    let tN = null;
    for (const s of na) {
      if (R === null) {
        if (s.tk !== T0) R = s.tk;
        continue;
      }
      if (s.tk && s.tk !== R) {
        tN = s.t;
        break;
      }
    }
    /* Bij stil goed kan het tekstvak al leeg zijn en meteen de volgende vraag komen. */
    if (isStil && R && tN === null) tN = na.find((s) => s.tk === R)?.t ?? null;
    if (tN === null) {
      nietDoor++;
      continue;
    }
    /* Werd er in deze tijd toch op de pijl getikt (de meter zelf bij een volgend stuk, of de speler bij een tegel naast de
       pijl), dan telt dit goede antwoord niet mee: dan ging de les niet "vanzelf" door. */
    if (ev.some((e) => e.s === "klik" && e.knop === "verder" && e.t > tG && e.t < tN)) {
      getikt++;
      continue;
    }
    if (isStil) {
      stil.push(tN - tG);
      /* Las Bliepo bij stil goed nog de oude vraag voor (stem liep door bij een leeg tekstvak)? */
      if (snap.some((x, j) => x.s && !x.tk && x.t < tN && (snap[j + 1]?.t ?? tN) > tG + 300)) stemBijLeeg++;
      for (let j = 0; j < snap.length - 1; j++) {
        const s = snap[j];
        if (s.t < tG || s.t >= tN) continue;
        if (s.p && !s.tk) pijlLeegMs += Math.min(snap[j + 1].t, tN) - s.t;
      }
    } else {
      metZin.push(tN - tG);
      /* Hoe lang na het einde van Bliepo's zin het volgende stuk kwam (Synthesis: ±0,6-0,8 s). */
      const se = ev.filter((e) => e.s === "stem-eind" && (e.hoe === "end" || e.hoe === "ended") && e.t > tG && e.t < tN).pop();
      if (se) naStem.push(tN - se.t);
    }
  }
  if (getikt && !metZin.length && !stil.length) fouten.push(`na goed steeds op de pijl getikt (meting ongeldig)`);
  if (nietDoor > 1) fouten.push(`na goed ${nietDoor}x niet vanzelf door binnen 30 s`);
  if (pijlOudMs > 150) fouten.push(`pijl stond al onder de oude vraag vóór de reactie (${pijlOudKeer.size}x, gemiddeld ${Math.round(pijlOudMs / pijlOudKeer.size)} ms)`);
  if (stemBijLeeg) fouten.push(`stem praatte door bij stil goed (${stemBijLeeg}x)`);
  if (pijlLeegMs > 0) fouten.push(`pijl boven leeg tekstvak bij stil goed (${pijlLeegMs} ms)`);
  if (fouten.length) fout++;
  rijen.push({
    id,
    p1: `${p1ok}/${p1}`,
    tik: bm.tikken.filter((k) => !k.mislukt).length ? `stem stopt ${Math.max(...stop)} ms, door ${Math.max(...volgende)} ms, nieuwe tekst ${tekstNa.join("/")} ms (${stop.length}x)` : "geen tik gelukt",
    zin: metZin.length ? `ja, ${s1(Math.min(...metZin))}-${s1(Math.max(...metZin))} s na groen; ${naStem.length ? `${s1(med(naStem))} s na de stem` : "?"} (${metZin.length}x)` : "-",
    stil: stil.length ? `ja, ${s1(Math.min(...stil))}-${s1(Math.max(...stil))} s (${stil.length}x), pijl ${pijlLeegMs ? `${pijlLeegMs} ms` : "nee"}` : "niet voorgekomen",
    nietDoor,
    fout: fouten,
  });
}
console.log("| les | 1 pijl tijdens praten | 2 tik tijdens praten | 3 goed met zin: vanzelf door | 4 stil goed: vanzelf door, pijl | fouten |");
console.log("|---|---|---|---|---|---|");
for (const r of rijen) console.log(`| ${r.id} | ${r.p1 ?? "-"} | ${r.tik ?? "-"} | ${r.zin ?? "-"} | ${r.stil ?? "-"} | ${r.fout.join("; ") || "geen"} |`);
process.exit(fout ? 1 : 0);
