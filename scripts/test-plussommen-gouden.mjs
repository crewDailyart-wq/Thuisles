/**
 * Test van de gouden les Plussommen (squla-plus-bakkerij-1-gouden), 9 november 2026. Zelfde opzet als
 * scripts/test-splitsen-gouden.mjs.
 *
 *   node scripts/test-plussommen-gouden.mjs            alle situaties
 *   SCENARIO=fouten node scripts/test-plussommen-gouden.mjs
 *   FOTO=<map> node scripts/test-plussommen-gouden.mjs   ook schermfoto's
 *
 * Speelt de les in Chrome ZONDER VENSTER, met een LEEG profiel en `?naam=Testkind`, ZONDER koekje van een kind: de les
 * kan dan niets in de voortgang van een kind zetten (bewaarUitkomst doet niets zonder gekozen kind). Na afloop kijkt het
 * script of er in de tabel les_uitkomsten nieuwe regels voor deze les bij kwamen die NIET van Testkind zijn; dan stopt het
 * met een foutmelding (de database wordt alleen gelezen).
 *
 * Situaties: alles goed in één keer, goed na een fout, 1e en 2e fout (samen voordoen) bij elke soort vraag, dezelfde
 * denkfout en hetzelfde foute antwoord 2 keer, lang wachten (hulphandje bij een opdracht; niets bij een keuzevraag),
 * heel snel, en bij het verbinden een lijn veranderen vlak na de laatste (nakijken pas na rust).
 * Raakt de lessen en de database niet aan.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LES = process.env.LES ?? "squla-plus-bakkerij-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

/* ---------- bewaking: geen regels bij echte kinderen ---------- */
const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const testkind = sql("select id from kinderen where roepnaam = 'Testkind' limit 1;");
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

/* ---------- Chrome ---------- */
const map = mkdtempSync(join(tmpdir(), "test-plussommen-"));
const poort = 9620 + (process.pid % 30);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
const ruim = () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(map, { recursive: true, force: true });
  } catch {}
};
process.on("exit", ruim);
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

/* Bliepo praat versneld (elke zin ± 0,1 s), zodat de test niet uren duurt. */
const SNEL = `
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); t.dispatchEvent(new Event("ended")); }, 80); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 80); }, 20);
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: SNEL }, s);
  /* Geen koekje: leeg profiel. Voor de zekerheid alle koekjes van localhost weg. */
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const muis = (type, p) => stuur("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1, buttons: type === "mouseReleased" ? 0 : 1 }, s);
  /** `traag`: zoals een kind van 6: ± 1 s slepen en daarna 1 s stil (de proef mag dan niet tussendoor nakijken). */
  const sleep = async (van, naar, traag = false) => {
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x, y: van.y }, s);
    await muis("mousePressed", van);
    const n = traag ? 30 : 10;
    for (let i = 1; i <= n; i++) {
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + ((naar.x - van.x) * i) / n, y: van.y + ((naar.y - van.y) * i) / n, button: "left", buttons: 1 }, s);
      await wacht(traag ? 30 : 15);
    }
    await muis("mouseReleased", naar);
    await wacht(traag ? 1000 : 120);
  };
  /** Tik op een punt van het vlak (een pion in een vak gaat dan terug naar boven). */
  const tikVlak = async (x, y) => {
    const q = await punt(x, y);
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: q.x, y: q.y }, s);
    await muis("mousePressed", q);
    await muis("mouseReleased", q);
    await wacht(300);
  };
  /* Een punt van het vlak (980 × 720) op de pagina. */
  const punt = (x, y) => ev(`(() => { const c = [...document.querySelectorAll("canvas")].filter((c) => { const r = c.getBoundingClientRect(); return r.width > 300 && Math.abs(r.width / r.height - 980 / 720) < 0.05; })[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + ${x} * r.width / 980, y: r.top + ${y} * r.height / 720 }; })()`);
  const log = () => ev(`JSON.stringify(window.__gouden ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  const foto = async (naam) => {
    if (!FOTO) return;
    mkdirSync(FOTO, { recursive: true });
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(join(FOTO, `${naam}.png`), Buffer.from(data, "base64"));
  };
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${LES}?naam=Testkind` }, s);
  let gezien = 0;
  const terug = () => {
    gezien = Math.max(0, gezien - 1);
  };
  /** Wacht tot er een nieuwe logregel `wat` is (na de vorige die we gezien hebben). */
  const wachtOp = async (wat, max = 30000, filter = () => true) => {
    const t0 = Date.now();
    for (;;) {
      const l = await log();
      const i = l.findIndex((x, k) => k >= gezien && (Array.isArray(wat) ? wat.includes(x.wat) : x.wat === wat) && filter(x));
      if (i >= 0) {
        gezien = i + 1;
        return l[i];
      }
      if (Date.now() - t0 > max) throw new Error(`wachtte vergeefs op "${wat}" (laatste: ${JSON.stringify(l.slice(-3))})`);
      await wacht(150);
    }
  };
  const klikTekst = async (t) => {
    for (let k = 0; k < 60; k++) {
      const ok = await ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === ${JSON.stringify(t)} && b.getBoundingClientRect().width > 3 && !b.disabled); if (!b) return false; b.click(); return true; })()`);
      if (ok) return;
      await wacht(150);
    }
    throw new Error(`knop "${t}" niet gevonden`);
  };
  const klikKnop = async (k) => {
    for (let i = 0; i < 80; i++) {
      const ok = await ev(`(() => { const b = document.querySelector('[data-knop="${k}"]'); if (!b || b.disabled || b.getBoundingClientRect().width < 3) return false; b.click(); return true; })()`);
      if (ok) return;
      await wacht(150);
    }
    throw new Error(`knop ${k} niet gevonden`);
  };
  const pijl = () => klikKnop("verder");
  /** `aantal` dingen uit het hoopje naar het vak op (x, y) van het vlak. */
  const leg = async (aantal, x, y, traag = false) => {
    for (let i = 0; i < aantal; i++) {
      const van = await ev(`window.__phaser?.s1Punt?.() ?? null`);
      const naar = await punt(x, y);
      await sleep(van, naar, traag);
    }
  };
  /** Van punt naar punt (beide in punten van het vlak), bijvoorbeeld van het paarse naar het oranje vak. */
  const verschuif = async (x0, y0, x1, y1, traag = false) => sleep(await punt(x0, y0), await punt(x1, y1), traag);
  const goedSleep = async () => {
    /* Eerst wachten tot het kind mag slepen (bij samen voordoen legt Bliepo eerst zelf). */
    for (let k = 0; k < 80 && !(await ev(`window.__phaser?.s1Stap?.("goed") ?? null`)); k++) await wacht(150);
    for (let k = 0; k < 30; k++) {
      const st = await ev(`window.__phaser?.s1Stap?.("goed") ?? null`);
      if (!st) return;
      await sleep(st.van, st.naar);
    }
  };
  /** De kleur van de getallen in Bliepo's tekst (gemeten op het scherm). */
  const getalKleuren = () => ev(`[...document.querySelectorAll('[class*="getal"]')].filter((e) => e.closest('[class*="tekst"], .bliepo-tekst')).map((e) => e.textContent.trim() + "=" + getComputedStyle(e).color).join(" ")`);
  const hand = () => ev(`!!document.querySelector("[data-hulphand]")`);
  const tekst = () => ev(`[...document.querySelectorAll(".bliepo-tekst, [class*='tekst'] p")].map((e) => e.textContent).join(" ").replace(/\\s+/g, " ").trim()`);
  const sluit = () => stuur("Target.closeTarget", { targetId }).catch(() => {});
  /** 3 s een pion rondslepen en de beelden tellen (HARDE REGEL 7). `traag` = 4× tragere processor (telefoon). */
  const meetSlepen = async (traag) => {
    if (traag) await stuur("Emulation.setCPUThrottlingRate", { rate: 4 }, s);
    const van = await ev(`window.__phaser?.s1Punt?.() ?? null`);
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x, y: van.y }, s);
    await muis("mousePressed", van);
    const telling = ev(`new Promise((r) => { const t = []; let t0 = performance.now(); const stap = (n) => { t.push(n); if (n - t0 < 3000) requestAnimationFrame(stap); else { const d = t.slice(1).map((x, i) => x - t[i]); r({ fps: Math.round((t.length - 1) / ((t[t.length - 1] - t[0]) / 1000)), max: Math.round(Math.max(...d)) }); } }; requestAnimationFrame(stap); })`);
    const t0 = Date.now();
    let i = 0;
    while (Date.now() - t0 < 3000) {
      i++;
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + Math.sin(i / 9) * 120, y: van.y + 80 + Math.sin(i / 13) * 60, button: "left", buttons: 1 }, s);
      await wacht(16);
    }
    const r = await telling;
    await muis("mouseReleased", { x: van.x, y: van.y });
    if (traag) await stuur("Emulation.setCPUThrottlingRate", { rate: 1 }, s);
    return r;
  };
  /** Tik op iets in het vlak met data-ding (kaartje, som, antwoord, of een tel-plek). */
  const klikDing = async (id) => {
    for (let k = 0; k < 80; k++) {
      const ok = await ev(`(() => { const b = document.querySelector('[data-ding="${id}"]'); if (!b || b.disabled || b.getBoundingClientRect().width < 3) return false; b.click(); return true; })()`);
      if (ok) return;
      await wacht(150);
    }
    throw new Error(`ding ${id} niet gevonden`);
  };
  /** De ids van de antwoordkaartjes rechts bij het verbinden: getal -> id. */
  const antwoordIds = () => ev(`Object.fromEntries([...document.querySelectorAll('[data-ding^="a"]')].map((b) => [b.textContent.trim(), b.getAttribute("data-ding")]))`);
  return { terug, tikVlak, verschuif, meetSlepen, ev, wachtOp, klikTekst, klikKnop, klikDing, antwoordIds, pijl, leg, goedSleep, punt, log, foto, getalKleuren, hand, tekst, sluit };
}


/* De 16 vragen van squla-plus-bakkerij-1 (zelfde als squla-plussommen-gouden-zinnen.ts). */
const V = [
  { s: "verhaal", goed: 5 }, { s: "verhaal", goed: 7 }, { s: "verhaal", goed: 9 }, { s: "verhaal", goed: 8 },
  { s: "som", goed: "3 + 7 = 10" }, { s: "disco", goed: 8 }, { s: "disco", goed: 10 },
  { s: "verbind", sommen: [[3, 4], [5, 3], [2, 7]] },
  { s: "verhaal", goed: 8 }, { s: "verhaal", goed: 7 }, { s: "verhaal", goed: 9 }, { s: "som", goed: "4 + 5 = 9" },
  { s: "disco", goed: 8 }, { s: "verbind", sommen: [[1, 6], [4, 2], [5, 4]] }, { s: "verhaal", goed: 9 }, { s: "verhaal", goed: 10 },
];
const uitslag = [];
const fout = (t) => {
  uitslag.push(`  FOUT: ${t}`);
  console.log(`  FOUT: ${t}`);
};
const zie = (t) => {
  uitslag.push(`  ${t}`);
  console.log(`  ${t}`);
};
async function reactie(P, fotoNaFout = null) {
  const r = await P.wachtOp("reactie", 40000);
  zie(`${r.vraag} · ${r.soort}${r.x !== undefined ? ` [${r.x}]` : ""}${r.denkfout ? ` (${r.denkfout})` : ""}: "${r.zin.replace(/\{(\d+):[a-z]+\}/g, "$1")}"`);
  /* 15.27: de hint na de 1e fout wacht op de blauwe pijl; daarna komt dezelfde vraag terug. */
  if (r.soort === "fout1") {
    await P.wachtOp("pijl", 40000);
    await wacht(500);
    if (fotoNaFout) await P.foto(fotoNaFout);
    await P.pijl();
  }
  return r;
}
/** Kies antwoord x bij vraag nr (1-based). Bij verbinden: x = lijst [somIndex, antwoordGetal]. */
async function kies(P, nr, x) {
  const v = V[nr - 1];
  await P.wachtOp("vraag", 40000);
  if (v.s === "verhaal" || v.s === "som") await P.klikTekst(String(x));
  else if (v.s === "disco") await P.klikDing(`c${x}`);
  else {
    const ids = await P.antwoordIds();
    for (const [i, z] of x) {
      await P.klikDing(`s${i}`);
      await P.klikDing(ids[String(z)]);
    }
  }
}
const goedVan = (nr) => {
  const v = V[nr - 1];
  return v.s === "verbind" ? v.sommen.map(([a, b], i) => [i, a + b]) : v.goed;
};
/** Samen tellen: tik alle plekken (zo veel als er zijn). */
async function samen(P, wachten = true) {
  if (wachten) await P.wachtOp("samen-tellen", 40000);
  for (let k = 0; k < 12; k++) {
    const vrij = await P.ev(`[...document.querySelectorAll('[data-ding^="tel-"]')].map((b) => b.getAttribute("data-ding"))`);
    if (!vrij || !vrij.length) break;
    await P.klikDing(vrij[0]);
    await wacht(250);
  }
}
async function allesGoedVanaf(P, van) {
  for (let nr = van; nr <= 16; nr++) {
    await kies(P, nr, goedVan(nr));
    const r = await reactie(P);
    if (r.soort !== "goed") fout(`vraag ${nr}: ${r.soort}`);
  }
}

const SITUATIES = {
  /** Alles goed in één keer: na goed vanzelf door (geen pijl), getalkleur gemeten, einde met kaart. */
  async allesgoed(P) {
    let pijlen = 0;
    for (let nr = 1; nr <= 16; nr++) {
      if (process.env.ALLEFOTO) {
        await P.wachtOp("vraag", 40000);
        await wacht(900);
        await P.foto(`vraag-${String(nr).padStart(2, "0")}`);
        P.terug();
      }
      await kies(P, nr, goedVan(nr));
      const r = await reactie(P);
      if (r.soort !== "goed") fout(`vraag ${nr}: ${r.soort}`);
      if (nr === 1) {
        await wacht(300);
        zie(`getalkleur in Bliepo's tekst: ${await P.getalKleuren()}`);
        await P.foto("01-goed-vraag1");
      }
      if (nr === 6) await P.foto("06-disco-goed");
    }
    const l = await P.log();
    pijlen = l.filter((x) => x.wat === "pijl").length;
    if (pijlen) fout(`${pijlen} keer gewacht op de pijl terwijl alles goed was (15.27: lof gaat vanzelf door)`);
    else zie(`na elk goed antwoord vanzelf door (pijl alleen tijdens het praten: ${l.filter((x) => x.wat === "pijl-weg").length} keer gekomen en weer weg)`);
    const tijden = l.filter((x) => x.wat === "tik").map((t) => {
      const r = l.find((y) => y.t >= t.t && (y.wat === "door" || y.wat === "pijl"));
      return r ? r.t - t.t : null;
    }).filter((x) => x !== null);
    zie(`tijd van tik tot reactie (ms, zonder stem): ${tijden.join(", ")}`);
    await P.wachtOp("kaart", 40000);
    zie(`einde: "${await P.tekst()}"`);
    await P.foto("99-einde");
  },

  /** Fouten bij elke soort vraag. */
  async fouten(P) {
    /* vraag 1: deel (4), dan 1 te veel (6): uitleg + samen tellen. */
    await kies(P, 1, 4);
    await reactie(P, "10-fout1-hint");
    await kies(P, 1, 6);
    const r12 = await reactie(P);
    if (r12.soort !== "fout2") fout("vraag 1: geen 2e fout");
    await P.wachtOp("samen-tellen", 40000);
    await P.foto("11-samen-tellen");
    await samen(P, false);
    await P.wachtOp("pijl", 40000);
    zie(`na samen tellen: "${await P.tekst()}"`);
    await P.foto("12-samen-klaar");
    await P.pijl();
    /* vraag 2: 8, dan goed: korte bevestiging. */
    await kies(P, 2, 8);
    await reactie(P);
    await kies(P, 2, 7);
    const r2 = await reactie(P);
    if (r2.soort !== "goed-na-fout") fout("vraag 2: geen goed-na-fout");
    /* vraag 3: 2 keer hetzelfde foute antwoord (10): "Je koos weer 10." */
    await kies(P, 3, 10);
    await reactie(P);
    await kies(P, 3, 10);
    const r3 = await reactie(P);
    if (!/weer/.test(r3.zin)) fout(`vraag 3: geen "weer" bij 2 keer 10: ${r3.zin}`);
    await samen(P);
    await P.wachtOp("pijl", 40000);
    await P.pijl();
    /* vraag 4: min (4), dan 7 (te weinig). */
    await kies(P, 4, 4);
    await reactie(P);
    await kies(P, 4, 7);
    await reactie(P);
    await samen(P);
    await P.wachtOp("pijl", 40000);
    await P.pijl();
    /* vraag 5 (welke som): minsom, dan 2 keer de 3: samen, het kind tikt de enige som. */
    await kies(P, 5, "7 − 3 = 4");
    await reactie(P, "20-som-fout1");
    await kies(P, 5, "3 + 3 = 6");
    await reactie(P);
    await P.wachtOp("vraag", 40000);
    await P.foto("21-som-samen");
    zie(`welke som, samen: knoppen = ${await P.ev(`[...document.querySelectorAll('[data-knop="keuzes"] button, [class*="bediening"] button')].map((b) => b.textContent.trim()).join(" | ")`)}`);
    await P.klikTekst("3 + 7 = 10");
    await P.wachtOp("pijl", 40000);
    await P.pijl();
    /* vraag 6 (disco): 9, dan 7: samen met de stippen. */
    await kies(P, 6, 9);
    await reactie(P, "30-disco-fout1");
    await kies(P, 6, 7);
    await reactie(P);
    await P.wachtOp("samen-tellen", 40000);
    await P.foto("31-disco-stippen");
    await samen(P, false);
    await P.wachtOp("pijl", 40000);
    await P.foto("32-disco-klaar");
    await P.pijl();
    /* vraag 7 (disco): 9 (richting niet genoemd), dan goed. */
    await kies(P, 7, 9);
    const r7 = await reactie(P);
    if (/meer|minder/.test(r7.zin)) fout(`vraag 7: richting genoemd bij 9 (verklapt 10): ${r7.zin}`);
    await kies(P, 7, 10);
    await reactie(P);
    /* vraag 8 (verbinden): 2 keer fout: samen. */
    await kies(P, 8, [[0, 9], [1, 7], [2, 8]]);
    await reactie(P, "40-verbind-fout1");
    await kies(P, 8, [[0, 8], [1, 7], [2, 9]]);
    await reactie(P);
    await samen(P);
    await P.wachtOp("pijl", 40000);
    await P.foto("41-verbind-samen");
    await P.pijl();
    /* vraag 9: 7 (richting niet genoemd), dan 0 (min). */
    await kies(P, 9, 7);
    const r9 = await reactie(P);
    if (/meer|minder/.test(r9.zin)) fout(`vraag 9: richting genoemd bij 7: ${r9.zin}`);
    await kies(P, 9, 0);
    await reactie(P);
    await samen(P);
    await P.wachtOp("pijl", 40000);
    await P.pijl();
    await allesGoedVanaf(P, 10);
    await P.wachtOp("kaart", 40000);
    zie(`einde: "${await P.tekst()}"`);
    const d = await P.ev(`JSON.stringify({ d: window.__denkfouten ?? [], u: window.__uitkomsten ?? [] })`).then((x) => JSON.parse(x));
    zie(`bewaard (op het apparaat): ${d.d.length} denkfouten, ${d.u.length} uitkomsten: ${d.u.map((u) => u.uitkomst).join(", ")}`);
  },

  /** Lang wachten: bij een keuzevraag niets; bij samen tellen en verbinden het hulphandje na ± 6 s met 1 zin. */
  async wachten(P) {
    await P.wachtOp("vraag", 40000);
    const t0 = Date.now();
    await wacht(9000);
    const l = await P.log();
    if (await P.hand()) fout("hulphandje bij een keuzevraag");
    if (l.some((x) => x.wat === "aanwijzing")) fout("aanwijzing bij een keuzevraag");
    else zie(`keuzevraag ${Math.round((Date.now() - t0) / 1000)} s gewacht: geen handje, geen zin`);
    if (await P.ev(`!!document.querySelector('[data-knop="verder"]')`)) fout("pijl bij een keuzevraag");
    else zie("keuzevraag: geen pijl");
    await P.klikTekst("4");
    await reactie(P);
    await kies(P, 1, 6);
    await reactie(P);
    await P.wachtOp("samen-tellen", 40000);
    const a = await P.wachtOp("aanwijzing", 12000);
    await wacht(400);
    zie(`samen tellen: hulphandje na ${a ? "± 6 s" : "?"}: handje=${await P.hand()}, zin="${await P.tekst()}"`);
    await P.foto("50-hand-samen");
    /* Het handje wijst naar een plek die echt nog geteld moet worden. */
    const plek = await P.ev(`(() => { const h = document.querySelector("[data-hulphand]"); const b = [...document.querySelectorAll('[data-ding^="tel-"]')][0]; if (!h || !b) return null; const r1 = h.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return Math.round(Math.hypot(r1.left - (r2.left + r2.width / 2), r1.top - (r2.top + r2.height / 2))); })()`);
    zie(`afstand handje tot de eerste plek zonder getal: ${plek} px`);
    await P.klikDing("tel-2");
    await wacht(300);
    if (await P.hand()) fout("handje bleef na een tik");
    await samen(P, false);
    await P.wachtOp("pijl", 40000);
    await P.pijl();
    for (let nr = 2; nr <= 7; nr++) {
      await kies(P, nr, goedVan(nr));
      await reactie(P);
    }
    await P.wachtOp("vraag", 40000);
    const b = await P.wachtOp("aanwijzing", 12000);
    await wacht(400);
    zie(`verbinden: hulphandje (${b.som}) handje=${await P.hand()}, zin="${await P.tekst()}"`);
    await P.foto("51-hand-verbind");
    await P.klikDing("s0");
    const c = await P.wachtOp("aanwijzing", 12000);
    await wacht(400);
    zie(`verbinden met een gekozen som: handje bij ${c.som}, zin="${await P.tekst()}", vinkje=${await P.ev(`!!document.querySelector('[class*="vinkje"]')`)}`);
    await P.foto("52-hand-verbind-gekozen");
  },

  /** Heel snel: een tik midden in de vraag; Bliepo zegt niets over snelheid (draaiboek §3 D.6). */
  async snel(P) {
    await P.wachtOp("vraag", 40000);
    await P.klikTekst("5");
    const r = await reactie(P);
    if (/snel/i.test(r.zin)) fout(`iets over snel: ${r.zin}`);
    else zie("heel snel: niets over snelheid");
  },

  /** Verbinden: een lijn veranderen vlak na de laatste lijn: pas na rust nakijken. */
  async verbindrust(P) {
    for (let nr = 1; nr <= 7; nr++) {
      await kies(P, nr, goedVan(nr));
      await reactie(P);
    }
    await P.wachtOp("vraag", 40000);
    const ids = await P.antwoordIds();
    await P.klikDing("s0");
    await P.klikDing(ids["9"]);
    await P.klikDing("s1");
    await P.klikDing(ids["8"]);
    await P.klikDing("s2");
    await P.klikDing(ids["7"]);
    /* Binnen de rust: som 0 opnieuw aan 7, som 2 aan 9 (= goed). */
    await P.klikDing("s0");
    await P.klikDing(ids["7"]);
    await P.klikDing("s2");
    await P.klikDing(ids["9"]);
    const r = await reactie(P);
    if (r.soort !== "goed") fout(`verbinden na veranderen: ${r.soort} (te vroeg nagekeken?)`);
    else zie("verbinden: lijn veranderd vlak na de laatste: pas daarna nagekeken, goed");
  },
};

const kiesLijst = process.env.SCENARIO ? process.env.SCENARIO.split(",") : Object.keys(SITUATIES);
for (const naam of kiesLijst) {
  console.log(`\n== ${naam}`);
  uitslag.push(`== ${naam}`);
  const P = await pagina();
  try {
    await SITUATIES[naam](P);
  } catch (e) {
    fout(`${naam}: ${e.message}`);
    await P.foto(`fout-${naam}`);
  } finally {
    await P.sluit();
  }
}

/* ---------- bewaking na afloop ---------- */
const nieuw = sql(`select count(*) from les_uitkomsten where id > ${startId} and les_id = '${LES}' and kind_id <> '${testkind}';`);
const hoogste = sql("select coalesce(max(id), 0) from les_uitkomsten;");
if (Number(nieuw) > 0) {
  console.error(`\nSTOP: ${nieuw} nieuwe regels in les_uitkomsten voor deze les die NIET van Testkind zijn!`);
  process.exit(2);
}
console.log(`\nBewaking: geen nieuwe regels bij een echt kind (hoogste id in les_uitkomsten voor: ${startId}, na: ${hoogste}).`);
if (process.env.UITSLAG) writeFileSync(process.env.UITSLAG, uitslag.join("\n"));
ws.close();
ruim();
process.exit(uitslag.some((x) => x.includes("FOUT:")) ? 1 : 0);
