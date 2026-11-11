/**
 * Meet het oplichten van de woorden in de gouden lessen (11 november 2026, eis Sara: "het licht nog niet op per woord
 * maar per zin"; BOUWREGELS 3.7, FOUTEN-VOORBEELDEN F10).
 *
 *   node scripts/test-woord-oplichten.mjs                       alle 9 gouden lessen
 *   LESSEN=squla-tellen-fruit-1-gouden node scripts/test-woord-oplichten.mjs
 *   ZINNEN=4 TIJD=45 FOTO=/pad/naar/map node scripts/test-woord-oplichten.mjs
 *   IJK=1 node scripts/test-woord-oplichten.mjs                 plus ijking per woord (zie hieronder)
 *   IJK=1 IJKBESTAND=/pad/ijking.json node scripts/…           ijkingen bewaren en hergebruiken (scheelt tijd)
 *
 * Werkt in een ZICHTBARE Chrome met de echte stem, zoals Sara: het lesoverzicht /voorbeeld/les openen en op de les
 * klikken (link met ?naam=Testkind). Een LEEG profiel, zonder koekje van een kind: de les kan niets in de voortgang van
 * een kind zetten. Na afloop wordt gekeken of er in les_uitkomsten iets bijkwam (de database wordt alleen gelezen).
 *
 * Per zin die Bliepo zegt wordt bij elk beeldje (requestAnimationFrame, plus elke 50 ms) vastgelegd welke woorden
 * gedimd, gezegd (wit) en "nu" (oranje) zijn. Rapport per les:
 *   - woorden per zin, hoeveel woorden afzonderlijk aan de beurt kwamen (moet: allemaal), de grootste sprong (moet 1);
 *   - F10: werd de zin in 1 keer helemaal wit voordat Bliepo begon (moet: nooit);
 *   - tijd tussen woordovergangen;
 *   - het einde van de schatting tegenover het echte einde van de stem (start/end van de uiting);
 *   - met IJK=1 ook per woord: na de les zegt dezelfde stem (zelfde tempo en toon) elk begin van de zin ("Kijk",
 *     "Kijk eens", "Kijk eens naar", …) en meet hoe lang dat duurt. Zo is bekend wanneer elk woord in de hele zin
 *     ongeveer begint; het verschil met het moment waarop het woord oplicht is de afwijking per woord.
 * Kleuren: van elke soort (gedimd, gezegd, nu) de echte kleur op het scherm, en het contrast met de achtergrond.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = process.env.BASIS ?? "http://localhost:3000";
const ALLE = [
  "squla-tellen-fruit-1-gouden",
  "squla-splits-splitsen1-1-gouden",
  "squla-plus-bakkerij-1-gouden",
  "squla-klok-hoelaat-1-gouden",
  "squla-min-machine-1-gouden",
  "squla-meer-minder-evenveel2-1-gouden",
  "squla-huisnummers-gouden",
  "squla-getallenlijn-kat-1-gouden",
  "squla-meten-oppervlakte-1-gouden",
];
const LESSEN = process.env.LESSEN ? process.env.LESSEN.split(",") : ALLE;
const MAX_ZINNEN = Number(process.env.ZINNEN ?? 4);
const TIJD = Number(process.env.TIJD ?? 45) * 1000;
const FOTO = process.env.FOTO ?? null;
const UIT = process.env.UIT ?? null;
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-woord-"));
const poort = 9740 + (process.pid % 20);
const chrome = spawn(
  CHROME,
  ["--new-window", "--window-size=1440,960", "--no-default-browser-check", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--autoplay-policy=document-user-activation-required", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"],
  { stdio: "ignore" },
);
const opruimen = () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(map, { recursive: true, force: true });
  } catch {}
};
process.on("exit", opruimen);
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => process.exit(1));

let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl;
  } catch {
    await wacht(200);
  }
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let n = 0;
const wachtend = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && wachtend.has(m.id)) {
    wachtend.get(m.id)(m);
    wachtend.delete(m.id);
  }
});
const stuur = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = ++n;
    wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

/* Meetscript in de pagina: stem-logboek en de stand van elk woord. */
const IN_PAGINA = `
  window.__stem = [];
  const nu0 = () => Math.round(performance.now() * 10) / 10;
  try {
    const AB = window.AudioBufferSourceNode && AudioBufferSourceNode.prototype;
    if (AB) { const st = AB.start; AB.start = function (...a) { window.__stem.push({ t: nu0(), wat: "geluid", wanneer: a[0], ctx: this.context.currentTime, z: window.__laatsteStemZin || "" }); return st.apply(this, a); }; }
    const F = window.fetch;
    window.fetch = function (u, ...r) { try { const url = String(u && u.url ? u.url : u); if (url.includes("/api/stem?zin=")) window.__laatsteStemZin = decodeURIComponent(new URL(url, location.href).searchParams.get("zin") || ""); } catch {} return F.call(this, u, ...r); };
  } catch {}
  if (window.speechSynthesis) {
    const ss = window.speechSynthesis; const spreek = ss.speak.bind(ss); const stop = ss.cancel.bind(ss);
    ss.speak = (u) => {
      window.__stem.push({ t: nu0(), wat: "speak", z: u.text, stem: u.voice ? u.voice.name : null, rate: u.rate, pitch: u.pitch });
      for (const e of ["start", "end", "error", "boundary", "mark", "pause", "resume"]) u.addEventListener(e, (ev) => window.__stem.push({ t: nu0(), wat: e, z: u.text, i: ev.charIndex, naam: ev.name, fout: ev.error, et: ev.elapsedTime }));
      spreek(u);
    };
    ss.cancel = () => { window.__stem.push({ t: nu0(), wat: "cancel" }); stop(); };
  }
  window.__w = [];
  window.__kleur = {};
  let vorige = "";
  const kijk = () => {
    const ps = [...document.querySelectorAll(".bliepo-vloer .bliepo-tekst, [data-vraag-boven] .bliepo-tekst")];
    const delen = [];
    for (const p of ps) {
      const ws = [...p.querySelectorAll(".bliepo-tekst-woord")];
      if (!ws.length) continue;
      const st = ws.map((w) => w.classList.contains("bliepo-tekst-nu") ? "N" : w.classList.contains("bliepo-tekst-gezegd") ? "w" : (w.classList.contains("bliepo-tekst-nog") || p.classList.contains("bliepo-tekst-later")) ? "-" : ".").join("");
      delen.push({ z: p.textContent.replace(/\\s+/g, " ").trim(), st, leest: p.classList.contains("bliepo-tekst-leest") });
      /* De kleur van elke soort, gemeten als het woord al minstens 300 ms zo staat (dus na de overgang). */
      const tn = performance.now();
      for (let k = 0; k < ws.length; k++) {
        const s = st[k];
        if (ws[k].__st !== s) { ws[k].__st = s; ws[k].__sinds = tn; continue; }
        if (tn - ws[k].__sinds > 300 && !(window.__kleur[s] && window.__kleur[s].vast)) { const cs = getComputedStyle(ws[k]); window.__kleur[s] = { kleur: cs.color, schaduw: cs.textShadow, dikte: cs.fontWeight, vast: true }; }
      }
    }
    const s = JSON.stringify(delen);
    if (s !== vorige) { vorige = s; window.__w.push({ t: nu0(), delen }); }
  };
  const lus = () => { kijk(); requestAnimationFrame(lus); };
  requestAnimationFrame(lus);
  setInterval(kijk, 50);
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: IN_PAGINA }, s);
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  await stuur("Target.activateTarget", { targetId }).catch(() => {});
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const muis = async (p) => {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1, buttons: type === "mousePressed" ? 1 : 0 }, s);
  };
  const foto = async (pad) => {
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(pad, Buffer.from(data, "base64"));
  };
  return { s, ev, muis, foto, sluit: () => stuur("Target.closeTarget", { targetId }).catch(() => {}) };
}

/** Open de les zoals Sara: het lesoverzicht, en een echte klik op de link. */
async function openLes(P, les) {
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les` }, P.s);
  let ok = null;
  for (let i = 0; i < 100 && !ok; i++) {
    await wacht(200);
    ok = await P.ev(`(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${les}?"]'); if (!a) return null; a.scrollIntoView({ block: "center" }); return a.getAttribute("href"); })()`);
  }
  if (!ok) throw new Error(`geen link naar ${les} in het lesoverzicht`);
  if (!/naam=Testkind/.test(ok)) throw new Error(`de link naar ${les} is niet voor Testkind: ${ok}`);
  await wacht(600);
  const p = await P.ev(`(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${les}?"]'); a.scrollIntoView({ block: "center" }); const r = a.getBoundingClientRect(); for (const [x, y] of [[r.left + r.width / 2, r.top + r.height / 2], [r.left + Math.min(20, r.width / 2), r.top + r.height / 2]]) { const e = document.elementFromPoint(x, y); if (e && (e === a || a.contains(e))) return { x, y, raak: true }; } const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { raak: false, wat: e ? e.tagName + "." + e.className : null, r: [r.left, r.top, r.width, r.height], h: innerHeight }; })()`);
  if (!p?.raak) throw new Error(`de link ligt niet onder de muis ${JSON.stringify(p)}`);
  await P.muis(p);
}

/** Uit het woordenlogboek: per zin (tekst) de momenten waarop het woord van nu wisselt. */
function overgangen(log) {
  const perZin = new Map();
  for (const r of log) {
    for (const d of r.delen) {
      const i = d.st.indexOf("N");
      if (!perZin.has(d.z)) perZin.set(d.z, { z: d.z, woorden: d.st.length, wissels: [], standen: new Set() });
      const z = perZin.get(d.z);
      z.standen.add(d.st);
      const vorig = z.wissels.at(-1);
      if (i >= 0 && (!vorig || vorig.i !== i)) z.wissels.push({ t: r.t, i, st: d.st });
      if (i < 0 && vorig && vorig.i !== -1 && /^w+$/.test(d.st)) z.wissels.push({ t: r.t, i: -1, st: d.st });
    }
  }
  return [...perZin.values()];
}

const woordenVan = (z) => z.trim().split(/\s+/).filter(Boolean);
const vergelijkbaar = (z) => z.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

/** Ijking: hoe lang zegt de stem elk begin van de zin? (dezelfde stem, tempo en toon als de les) */
async function ijk(P, zin, stem) {
  const w = woordenVan(zin);
  const res = await P.ev(`(async () => {
    const ss = window.speechSynthesis;
    const v = ss.getVoices().find((x) => x.name === ${JSON.stringify(stem.naam)});
    const zeg = (t) => new Promise((klaar) => {
      const u = new SpeechSynthesisUtterance(t); u.voice = v; u.lang = v ? v.lang : "nl-NL"; u.rate = ${stem.rate}; u.pitch = ${stem.pitch};
      let a = 0; u.onstart = () => { a = performance.now(); }; u.onend = () => klaar(performance.now() - a); u.onerror = (e) => klaar("fout " + e.error);
      ss.speak(u);
    });
    const w = ${JSON.stringify(w)};
    const uit = [];
    for (let k = 1; k <= w.length; k++) uit.push(await zeg(w.slice(0, k).join(" ")));
    /* Het 2e woord los: zo is de stilte voor en na een uiting te schatten (los + los − samen). */
    const tweede = w.length > 1 ? await zeg(w[1]) : null;
    return { uit, tweede };
  })()`);
  return res;
}

const rapport = [];
let fouten = 0;
const zie = (t) => {
  rapport.push(t);
  console.log(t);
};
const fout = (t) => {
  fouten++;
  zie(`  FOUT: ${t}`);
};
const alleData = {};
const P = await pagina();
const gem = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

for (const les of LESSEN) {
  zie(`\n== ${les}`);
  try {
    await openLes(P, les);
  } catch (e) {
    fout(String(e.message ?? e));
    continue;
  }
  const tot = Date.now() + TIJD;
  let fotoGedaan = false;
  let laatsteActief = Date.now();
  while (Date.now() < tot) {
    await wacht(250);
    const stem = (await P.ev(`JSON.stringify(window.__stem ?? [])`)) ?? "[]";
    const sl = JSON.parse(stem);
    /* Uitgesproken zinnen van de browserstem (die worden gemeten; geluid van Ruth en geluidjes tellen niet mee). */
    const klaarZinnen = sl.filter((x) => x.wat === "end").length;
    const open = sl.filter((x) => x.wat === "start").length > sl.filter((x) => x.wat === "end" || x.wat === "error").length;
    const leest = await P.ev(`!!document.querySelector(".bliepo-tekst-leest")`);
    if (open || leest || (sl.length && sl.at(-1).t > (await P.ev("performance.now()")) - 1500)) laatsteActief = Date.now();
    /* Beeldreeks van 1 zin: zodra er een zin van minstens 5 woorden begint, 8 foto's om de 250 ms. */
    if (FOTO && !fotoGedaan) {
      const lang = await P.ev(`(() => { const p = document.querySelector(".bliepo-tekst-leest"); return p ? p.querySelectorAll(".bliepo-tekst-woord").length : 0; })()`);
      if (lang >= 5) {
        fotoGedaan = true;
        mkdirSync(FOTO, { recursive: true });
        for (let k = 0; k < 8; k++) {
          await P.foto(join(FOTO, `${les}-${k}.png`));
          await wacht(220);
        }
      }
    }
    if (klaarZinnen >= MAX_ZINNEN) break;
    /* Startvraag (Ja/Nee): Nee, dan legt Bliepo uit. */
    const nee = await P.ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => /^nee\\b/i.test((b.textContent || "").trim()) && b.getBoundingClientRect().width > 3); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const nogGedimd = await P.ev(`!!document.querySelector(".bliepo-tekst-nog, .bliepo-tekst-later")`);
    if (nee && !nogGedimd && Date.now() - laatsteActief > 2500) {
      await P.muis(nee);
      laatsteActief = Date.now();
    }
    /* Klaar als Bliepo 9 tel niets meer zegt (de les wacht op een antwoord); voor de eerste zin hooguit 30 tel wachten. */
    if (Date.now() - laatsteActief > (sl.some((x) => x.wat === "start" || x.wat === "geluid") ? 9000 : 30000)) break;
  }
  await wacht(400);
  /* Niets gezegd? Een schermfoto en de stand, om te zien waar de les op wacht. */
  if (!(await P.ev(`(window.__stem || []).some((x) => x.wat === "start" || x.wat === "geluid")`))) {
    zie(`  LET OP: Bliepo zei niets. In beeld: ${await P.ev(`location.pathname + " | " + document.body.innerText.replace(/\\s+/g, " ").slice(0, 160)`)}`);
    if (FOTO) {
      mkdirSync(FOTO, { recursive: true });
      await P.foto(join(FOTO, `${les}-stil.png`));
    }
  }
  const sl = JSON.parse((await P.ev(`JSON.stringify(window.__stem ?? [])`)) ?? "[]");
  const log = JSON.parse((await P.ev(`JSON.stringify(window.__w ?? [])`)) ?? "[]");
  const kleur = JSON.parse((await P.ev(`JSON.stringify(window.__kleur ?? {})`)) ?? "{}");
  const oplichtenAan = await P.ev(`(() => { try { const v = JSON.parse(localStorage.getItem("thuisles-les-voorkeuren") || "null"); return v ? v.oplichten : "standaard (aan)"; } catch { return "?"; } })()`);
  const zinnen = overgangen(log);
  const sprekers = sl.filter((x) => x.wat === "speak");
  const browserStem = sprekers[0] ? { naam: sprekers[0].stem, rate: sprekers[0].rate, pitch: sprekers[0].pitch } : null;
  zie(`  stem: ${browserStem ? `browser (${browserStem.naam})` : "geen browserstem"}; Ruth-bestanden: ${sl.filter((x) => x.wat === "geluid").length}; woordmeldingen (boundary): ${sl.filter((x) => x.wat === "boundary").length}; instelling Woorden oplichten: ${oplichtenAan}`);
  zie(`  kleuren: ${Object.entries(kleur).map(([k, v]) => `${{ N: "nu", w: "gezegd", "-": "gedimd", ".": "gewoon" }[k]}=${v.kleur}${v.dikte ? ` (dikte ${v.dikte})` : ""}`).join(", ")}`);
  const lesData = { stem: sl, zinnen: [], kleur, beeld: log };
  /* Per uitgesproken zin. */
  for (const sp of sl.filter((x) => x.wat === "start")) {
    const eind = sl.find((y) => y.t >= sp.t && y.z === sp.z && (y.wat === "end" || y.wat === "error"));
    /* Alleen zinnen die helemaal zijn uitgesproken (niet afgebroken, niet aan het eind van de meting). */
    const afgebroken = !eind || eind.wat === "error";
    if (afgebroken) {
      zie(`  (niet meegeteld, ${eind ? "afgebroken" : "nog bezig"}: "${sp.z.slice(0, 50)}")`);
      continue;
    }
    const z = zinnen.find((q) => vergelijkbaar(q.z) === vergelijkbaar(sp.z));
    const w = woordenVan(sp.z);
    if (!z) {
      zie(`  zin zonder oplichten in beeld: "${sp.z.slice(0, 60)}"`);
      continue;
    }
    /* F10: werd de hele zin al wit (zonder gedimde woorden) voordat de stem begon? Dan licht hij per zin op. */
    const ervoor = log.filter((r) => r.t < sp.t && r.t > sp.t - 15000).map((r) => r.delen.find((d) => vergelijkbaar(d.z) === vergelijkbaar(sp.z))).filter(Boolean);
    const witVooraf = ervoor.some((d, k) => !/[-N]/.test(d.st) && ervoor.slice(0, k).some((e) => /-/.test(e.st)));
    if (witVooraf) fout(`de hele zin werd al wit voordat Bliepo begon (per zin in plaats van per woord): "${sp.z.slice(0, 50)}"`);
    const ws = z.wissels.filter((x) => x.t >= sp.t - 50 && (!eind || x.t <= eind.t + 400));
    const indexen = ws.filter((x) => x.i >= 0).map((x) => x.i);
    const uniek = new Set(indexen);
    let sprong = 0;
    for (let k = 1; k < indexen.length; k++) sprong = Math.max(sprong, indexen[k] - indexen[k - 1]);
    const tussen = [];
    for (let k = 1; k < ws.length; k++) if (ws[k].i >= 0) tussen.push(ws[k].t - ws[k - 1].t);
    const laatsteWissel = ws.filter((x) => x.i === w.length - 1)[0];
    const eersteWissel = ws.find((x) => x.i === 0);
    const duur = eind ? eind.t - sp.t : null;
    const rij = {
      zin: sp.z,
      woorden: w.length,
      opgelicht: uniek.size,
      sprong,
      eerste: eersteWissel ? Math.round(eersteWissel.t - sp.t) : null,
      laatste: laatsteWissel ? Math.round(laatsteWissel.t - sp.t) : null,
      duur: duur ? Math.round(duur) : null,
      tussen: tussen.map(Math.round),
      wissels: ws.map((x) => ({ t: Math.round(x.t - sp.t), i: x.i })),
    };
    lesData.zinnen.push(rij);
    zie(`  zin (${w.length} woorden, stem ${rij.duur} ms): "${sp.z.slice(0, 70)}"`);
    zie(`    afzonderlijk opgelicht: ${uniek.size} van ${w.length}; grootste sprong: ${sprong} woord(en); tussen overgangen: gem ${Math.round(gem(tussen))} ms (${Math.min(...tussen)}–${Math.max(...tussen)}); eerste woord ${rij.eerste} ms na start; laatste woord ${rij.laatste} ms na start`);
    if (uniek.size < w.length) fout(`niet elk woord licht apart op (${uniek.size} van ${w.length}) in "${sp.z.slice(0, 50)}"`);
    if (sprong > 1) fout(`sprong van ${sprong} woorden in "${sp.z.slice(0, 50)}"`);
  }
  alleData[les] = lesData;
}

/*
  Ijking per woord. IJK=1: elke gemeten zin opnieuw, steeds 1 woord langer (op het lesoverzicht, daar praat niemand).
  IJKBESTAND=<pad>: eerder gemeten ijkingen gebruiken (en nieuwe erbij bewaren), in de vorm { res: [{ z, pre, los }] }.
*/
if (process.env.IJK || process.env.IJKBESTAND) {
  zie(`\n== per woord: oplichten tegenover het gesproken moment (ijking met dezelfde stem, tempo en toon)`);
  const bestand = process.env.IJKBESTAND && existsSync(process.env.IJKBESTAND) ? JSON.parse(readFileSync(process.env.IJKBESTAND, "utf8")) : { res: [] };
  const bekend = new Map(bestand.res.filter((x) => x.pre.every((y) => typeof y === "number")).map((x) => [vergelijkbaar(x.z), x]));
  let klaarVoorGeluid = false;
  const metingen = [];
  for (const [les, d] of Object.entries(alleData)) {
    const sp = d.stem.find((x) => x.wat === "speak");
    if (!sp) continue;
    const stem = { naam: sp.stem, rate: sp.rate, pitch: sp.pitch };
    for (const r of d.zinnen.filter((q) => q.duur && q.woorden >= 3)) {
      let m = bekend.get(vergelijkbaar(r.zin));
      if (!m && process.env.IJK) {
        if (!klaarVoorGeluid) {
          klaarVoorGeluid = true;
          await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les` }, P.s);
          await wacht(2500);
          /* Een tik op een lege plek: dan mag de pagina geluid maken. */
          const p = await P.ev(`(() => { for (let y = 40; y < innerHeight; y += 37) for (let x = 20; x < innerWidth; x += 53) { const e = document.elementFromPoint(x, y); if (e && !e.closest("a, button, input, select, textarea, label, [role=button], [onclick]")) return { x, y }; } return null; })()`);
          if (p) await P.muis(p);
        }
        const g = await ijk(P, r.zin, stem);
        if (!g || g.uit.some((x) => typeof x !== "number")) {
          zie(`  ijking lukte niet voor "${r.zin.slice(0, 40)}": ${JSON.stringify(g)}`);
          continue;
        }
        m = { z: r.zin, pre: g.uit.map(Math.round), los: [g.uit[0], g.tweede].map((x) => (x == null ? null : Math.round(x))) };
        bestand.res.push(m);
        bekend.set(vergelijkbaar(r.zin), m);
      }
      if (m) metingen.push({ les, r, m });
    }
  }
  if (process.env.IJKBESTAND) writeFileSync(process.env.IJKBESTAND, JSON.stringify(bestand, null, 1));
  /* Stilte voor + na een uiting: los + los − samen (de mediaan over alle zinnen in de ijking). */
  const randen = bestand.res.filter((x) => x.los?.[1] && x.pre[1]).map((x) => x.pre[0] + x.los[1] - x.pre[1]).sort((p, q) => p - q);
  const rand = randen.length ? randen[randen.length >> 1] : 520;
  const VOOR = 50;
  zie(`  stilte voor + na een uiting: ${Math.round(rand)} ms (mediaan van ${randen.length} zinnen); aangenomen: ${VOOR} ms ervoor, de rest erna`);
  const allen = [];
  const perLes = {};
  for (const { les, r, m } of metingen) {
    /* Woord k begint ongeveer op: de duur van de eerste k woorden min de stilte erna (woord 0: na de stilte ervoor). */
    const echt = [VOOR, ...m.pre.slice(0, -1).map((x) => x - (rand - VOOR))];
    const afw = [];
    for (let k = 0; k < r.woorden; k++) {
      const licht = r.wissels.find((x) => x.i === k);
      if (licht) afw.push(Math.round(licht.t - echt[k]));
    }
    r.afwijking = afw;
    allen.push(...afw.slice(1));
    (perLes[les] ??= []).push(...afw.slice(1));
    zie(`  ${les.replace("squla-", "").replace("-gouden", "")}: "${r.zin.slice(0, 50)}": per woord (ms, + = licht te laat op): ${afw.join(" ")}`);
  }
  for (const [les, a] of Object.entries(perLes)) {
    const abs = a.map(Math.abs);
    zie(`  ${les}: ${a.length} woorden: gemiddeld ${Math.round(gem(abs))} ms naast (teken ${Math.round(gem(a))}), grootste ${Math.max(...abs)} ms, binnen ±150 ms: ${abs.filter((x) => x <= 150).length} van ${a.length}`);
  }
  if (allen.length) {
    const abs = allen.map(Math.abs);
    zie(`  TOTAAL ${allen.length} woorden (zonder het 1e woord): gemiddeld ${Math.round(gem(abs))} ms naast (gemiddeld ${Math.round(gem(allen))} ms te laat), grootste ${Math.max(...abs)} ms, binnen ±150 ms: ${abs.filter((x) => x <= 150).length} (${Math.round((100 * abs.filter((x) => x <= 150).length) / abs.length)} %)`);
  }
}

if (UIT) writeFileSync(UIT, JSON.stringify(alleData, null, 1));
const eindId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));
if (eindId !== startId) fout(`les_uitkomsten veranderde: ${startId} → ${eindId}`);
else zie(`\nles_uitkomsten onveranderd (hoogste id ${eindId})`);
await P.sluit();
zie(fouten ? `\n${fouten} fout(en)` : "\nGOED");
ws.close();
opruimen();
process.exit(fouten ? 1 : 0);
