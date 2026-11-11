/**
 * Test van de gouden les Splitsen (squla-splits-splitsen1-1-gouden). Eerst 9 november 2026; herschreven op 10 november
 * 2026 naar de nieuwste gouden stijl (KEUZES-VOOR-SARA.md Ronde 29), naar scripts/test-getallenlijn-gouden.mjs: Bliepo
 * praat door (vanzelf verder ±0,7 s, pijl rechts als snelkoppeling, geen pijl bij vragen en opdrachten; het script tikt
 * NOOIT op de pijl), F7, F8, overlap, sprongen, woorden, eindkaart en de vaste zone (het splitsvlak links van het tekstvak).
 *
 *   node scripts/test-splitsen-gouden.mjs                     alle situaties en routes
 *   SCENARIO=ja-proef node scripts/test-splitsen-gouden.mjs   1 situatie
 *   SCENARIO=goed,allefout node scripts/test-splitsen-gouden.mjs
 *   ONTWERP=1 VENSTER=1280x720 SCENARIO=allefout node scripts/test-splitsen-gouden.mjs   overlap en sprongen (faalt erop)
 *   ZICHTBAAR=1 ECHTESTEM=1 VIAOVERZICHT=1 SCENARIO=woorden node scripts/test-splitsen-gouden.mjs   echte stem
 *   SCENARIO=sleepmeting node scripts/test-splitsen-gouden.mjs   vloeiend tijdens echt slepen
 *   FOTO=<map> …   schermfoto's;  SNELSTEM=1 …   nepstem van 80 ms per zin (sneller)
 *
 * Situaties: goed in één keer (Nee-route met de uitleg), de proef na Ja (goed, en 2 fouten = uitleg), goed na een fout,
 * 1e en 2e fout (samen voordoen), dezelfde denkfout 2 keer, lang wachten (hulphandje; niets bij een keuzevraag), heel snel,
 * de uitleg vastlopen (vangnet), vangnet bij het samen voordoen.
 *
 * Speelt de les in Chrome met een LEEG profiel en `?naam=Testkind`, ZONDER koekje van een kind: de les kan dan niets in de
 * voortgang van een kind zetten. Na afloop kijkt het script of er in les_uitkomsten nieuwe regels bijkwamen die NIET van
 * Testkind zijn (de database wordt alleen gelezen); dan stopt het met een foutmelding. Raakt de lessen en de database niet aan.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LES = process.env.LES ?? "squla-splits-splitsen1-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const testkind = sql("select id from kinderen where roepnaam = 'Testkind' limit 1;");
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-splitsen-"));
const poort = 9620 + (process.pid % 30);
const chrome = spawn(CHROME, [...(process.env.ZICHTBAAR ? ["--new-window", "--window-size=1440,960", "--no-default-browser-check"] : ["--headless=new", "--mute-audio"]), `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", ...(process.env.ECHTESTEM ? ["--autoplay-policy=document-user-activation-required"] : []), "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
process.on("exit", () => {
  try {
    chrome.kill("SIGKILL");
  } catch {}
  try {
    rmSync(map, { recursive: true, force: true });
  } catch {}
});
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

/* Nepstem + meetscript in de pagina. */
const IN_PAGINA = `
  const duur = (t) => ${process.env.SNELSTEM ? "80" : '400 + String(t || "").length * 25'};
  if (!${JSON.stringify(!!process.env.ECHTESTEM)}) HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1200); }, 20); return Promise.resolve(); };
  if (window.speechSynthesis && !${JSON.stringify(!!process.env.ECHTESTEM)}) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, duur(u.text)); }, 20);
  window.__stem = [];
  /* Stem-logboek (altijd): elke speak/start/end/error/cancel, en elk geluid dat start (bestand van Ruth via Web Audio of <audio>). */
  try {
    const n0 = () => Math.round(performance.now());
    const AB = window.AudioBufferSourceNode && AudioBufferSourceNode.prototype;
    if (AB) { const st = AB.start; AB.start = function (...a) { window.__stem.push({ t: n0(), wat: "geluid", z: window.__laatsteStemZin || "" }); return st.apply(this, a); }; }
    const HP = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) { window.__stem.push({ t: n0(), wat: "geluid", z: window.__laatsteStemZin || "" }); return HP.apply(this, a); };
    const F = window.fetch;
    window.fetch = function (u, ...r) { try { const url = String(u && u.url ? u.url : u); if (url.includes("/api/stem?zin=")) window.__laatsteStemZin = decodeURIComponent(new URL(url, location.href).searchParams.get("zin") || ""); } catch {} return F.call(this, u, ...r); };
  } catch {}
  if (window.speechSynthesis) {
    const ss = window.speechSynthesis; const spreek = ss.speak.bind(ss); const stop = ss.cancel.bind(ss);
    const n = () => Math.round(performance.now());
    ss.speak = (u) => { window.__stem.push({ t: n(), wat: "speak", z: u.text }); for (const e of ["start", "end", "error"]) u.addEventListener(e, (ev) => window.__stem.push({ t: n(), wat: e, z: u.text, fout: ev.error })); spreek(u); };
    ss.cancel = () => { window.__stem.push({ t: n(), wat: "cancel", door: (new Error().stack || "").split(String.fromCharCode(10)).slice(2, 4).join(" ").slice(0, 160) }); stop(); };
  }
  window.__meet = []; const t0 = performance.now(); let vorige = "";
  setInterval(() => {
    const b = document.querySelector('[data-knop="verder"]');
    const pijl = !!b && b.getBoundingClientRect().width > 3;
    const tekst = [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
    const taak = (window.__phaser?.splitsTaak ?? null);
    const kaart = !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]');
    /* Gedimd of wit (meelezen): hoeveel woorden nog gedimd zijn, en of Bliepo meeleest. */
    const nog = document.querySelectorAll(".bliepo-tekst-nog, .bliepo-tekst-later").length;
    const leest = !!document.querySelector(".bliepo-tekst-leest");
    /* Plek van het tekstvak, de eerste regel, de pijl en Bliepo (ontwerp Sara 10 nov: niets mag verspringen). */
    const rect = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width < 2 ? null : [Math.round(r.left), Math.round(r.top), Math.round(r.height)]; };
    const vak = document.querySelector(".bliepo-vloer-ballon");
    /* De tekst zelf: van de bovenkant van de eerste tot de onderkant van de laatste zin of knop in het vak. */
    const delen = [...document.querySelectorAll(".bliepo-vloer .bliepo-tekst, .bliepo-vloer .les-tekst button")].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 2);
    const inhoud = delen.length ? [Math.round(Math.min(...delen.map((r) => r.left))), Math.round(Math.min(...delen.map((r) => r.top))), Math.round(Math.max(...delen.map((r) => r.bottom)) - Math.min(...delen.map((r) => r.top))), Math.round(Math.max(...delen.map((r) => r.right)) - Math.min(...delen.map((r) => r.left)))] : null;
    const robotEl = document.querySelector(".bliepo-vloer-robot");
    const plek = { vak: rect(vak), regel: rect(document.querySelector(".bliepo-tekst")), pijl: pijl ? rect(b) : null, robot: rect(robotEl), robotB: robotEl ? Math.round(robotEl.getBoundingClientRect().width) : 0, inhoud, over: vak ? vak.scrollHeight - vak.clientHeight : 0 };
    const teller = false;
    const hand = !!document.querySelector("[data-hulphand]");
    const s = JSON.stringify({ pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart, dim: nog > 0, leest, plek, teller, hand });
    if (s !== vorige) { vorige = s; window.__meet.push({ t: Math.round(performance.now()), pijl, tekst, taak: taak ? taak.soort + ":" + (taak.opties ? taak.opties.length : "") : null, kaart, dim: nog > 0, leest, plek, teller, hand }); }
  }, 50);
  /* Oplichten van de woorden (eis Sara 10 nov): elke wissel van het woord van nu, en elke woordmelding van de stem. */
  window.__woord = [];
  let vorigWoord = "";
  const kijkWoord = () => {
    const el = document.querySelector(".bliepo-tekst-nu");
    let w = "";
    if (el) { const p = el.closest(".bliepo-tekst"); const alle = p ? [...p.querySelectorAll(".bliepo-tekst-woord")] : []; w = alle.indexOf(el) + ":" + el.textContent.trim() + "|" + (p ? p.textContent.replace(/\s+/g, " ").trim() : ""); }
    if (w !== vorigWoord) { vorigWoord = w; window.__woord.push({ t: Math.round(performance.now()), w }); }
    requestAnimationFrame(kijkWoord);
  };
  requestAnimationFrame(kijkWoord);
  if (window.speechSynthesis) {
    const sp = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (u) => { u.addEventListener("boundary", (e) => window.__stem.push({ t: Math.round(performance.now()), wat: "grens", z: u.text, i: e.charIndex, naam: e.name })); sp(u); };
  }
`;

async function pagina() {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  if (!process.env.ZICHTBAAR) await stuur("Emulation.setDeviceMetricsOverride", { width: Number(process.env.VENSTER?.split("x")[0] ?? 1440), height: Number(process.env.VENSTER?.split("x")[1] ?? 900), deviceScaleFactor: 1, mobile: false }, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: IN_PAGINA }, s);
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const tik = async (p) => {
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 1 }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 0 }, s);
  };
  const foto = async (naam) => {
    if (!FOTO) return;
    mkdirSync(FOTO, { recursive: true });
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    writeFileSync(join(FOTO, `${naam}.png`), Buffer.from(data, "base64"));
  };
  if (process.env.ZICHTBAAR) await stuur("Target.activateTarget", { targetId }).catch(() => {});
  if (process.env.VIAOVERZICHT) {
    /* Zoals Sara: het lesoverzicht openen en echt op de les klikken (de app wisselt van pagina zonder te herladen). */
    await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les` }, s);
    let p = null;
    for (let i = 0; i < 100 && !p; i++) {
      await wacht(200);
      const r = await stuur("Runtime.evaluate", { expression: `(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${LES}?"]'); if (!a) return null; a.scrollIntoView({ block: "center" }); return true; })()`, returnByValue: true }, s).catch(() => null);
      p = r?.result?.value ?? null;
    }
    await wacht(800);
    /* Na het scrollen opnieuw de plek bepalen en nagaan dat precies deze link onder de muis ligt. */
    const q = await stuur("Runtime.evaluate", { expression: `(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${LES}?"]'); const r = a.getBoundingClientRect(); const x = r.left + Math.min(20, r.width / 2), y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === a || a.contains(e)), wat: e ? e.tagName + "." + e.className : null, b: innerWidth + "x" + innerHeight }; })()`, returnByValue: true }, s);
    p = q.result.value;
    /* Keurder 10 nov: in een zichtbaar venster lag de link soms nog onder de rand (de pagina schuift na het laden nog
       door). Dan nog eens in beeld schuiven en opnieuw meten, hooguit 10 keer. */
    for (let i = 0; i < 10 && !p.raak; i++) {
      await stuur("Runtime.evaluate", { expression: `document.querySelector('a[href^="/voorbeeld/les/${LES}?"]').scrollIntoView({ block: "center", behavior: "instant" })` }, s);
      await wacht(600);
      p = (await stuur("Runtime.evaluate", { expression: `(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${LES}?"]'); const r = a.getBoundingClientRect(); const x = r.left + Math.min(20, r.width / 2), y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === a || a.contains(e)), wat: e ? e.tagName + "." + e.className : null, b: innerWidth + "x" + innerHeight }; })()`, returnByValue: true }, s)).result.value;
    }
    if (!p.raak) throw new Error(`de link naar de les ligt niet onder de muis (${JSON.stringify(p)})`);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x: p.x, y: p.y, button: "left", clickCount: 1, buttons: type === "mousePressed" ? 1 : 0 }, s);
  } else
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${LES}?naam=Testkind` }, s);
  if (!process.env.VIAOVERZICHT) {
    /* Rechtstreekse link: Chrome laat pas geluid toe na een tik. Zoals een kind: 1 tik naast de machine (daar ligt niets). */
    for (let i = 0; i < 100 && !(await ev(`document.querySelectorAll(".bliepo-tekst").length`)); i++) await wacht(200);
    await wacht(400);
    const p = await ev(`(() => { const r = document.body.getBoundingClientRect(); return { x: r.width * 0.3, y: r.height * 0.1 }; })()`);
    if (p) await tik(p);
  }
  const log = () => ev(`JSON.stringify(window.__gouden ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  const nu = () => ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); const taak = (window.__phaser?.splitsTaak ?? null); return { pijl: !!b && b.getBoundingClientRect().width > 3, tekst: [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean), taak, kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'), t: Math.round(performance.now()) }; })()`);
  const klikTekst = (t) => ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === ${JSON.stringify(t)} && b.getBoundingClientRect().width > 3); if (!b) return false; b.click(); return true; })()`);
  /* Zoals een kind: een echte muisklik op de plek waar de pijl staat (geen b.click()). Meldt als er iets anders boven de pijl ligt. */
  const klikPijl = async () => {
    const p = await ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); if (!b) return null; const r = b.getBoundingClientRect(); if (r.width < 3) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === b || b.contains(e)), wat: e ? (e.getAttribute("aria-label") || e.className || e.tagName) : null }; })()`);
    if (!p) return false;
    if (!p.raak) fout(`iets anders ligt boven de pijl: ${p.wat}`);
    await tik(p);
    return true;
  };
  const klikKaart = () => ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => /af te vinken/i.test(b.getAttribute("aria-label") || "")); if (!b) return false; b.click(); return true; })()`);
  /* Zoals een kind: een echte muisklik midden op een ding in het vlak (kaart-1, kraal-12) of op een knop van het lesscherm. */
  const tikDing = async (sel) => {
    const p = await ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => !b.disabled && b.getBoundingClientRect().width > 3); if (!b) return null; const r = b.getBoundingClientRect(); if (r.width < 3) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === b || b.contains(e)) }; })()`);
    if (!p) return false;
    await tik(p);
    return true;
  };
  /* De eindkaart: hoeveel woorden van Bliepo's tekst onder de kaart vallen (keuring Minsommen: 1 tot 4). */
  const eindkaart = () => ev(`(() => { const k = document.querySelector('button[aria-label$="af te vinken"]'); if (!k) return null; const r = k.getBoundingClientRect(); const ws = [...document.querySelectorAll(".bliepo-tekst-woord")].map((w) => w.getBoundingClientRect()).filter((w) => w.width > 1); const onder = ws.filter((w) => w.left < r.right - 1 && r.left < w.right - 1 && w.top < r.bottom - 1 && r.top < w.bottom - 1).length; const tekst = [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.getBoundingClientRect()).filter((e) => e.width > 1); const regels = tekst.filter((w) => w.left < r.right - 1 && r.left < w.right - 1 && w.top < r.bottom - 1 && r.top < w.bottom - 1).length; return { onder, woorden: ws.length, regels, kaart: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], tekst: tekst.map((e) => [Math.round(e.left), Math.round(e.top), Math.round(e.right), Math.round(e.bottom)]) }; })()`);
  const meet = () => ev(`JSON.stringify(window.__meet)`).then((x) => JSON.parse(x ?? "[]"));
  /* Typen zoals op een toetsenbord (echte toetsaanslagen naar het veld met de aandacht). */
  const typ = async (tekst) => {
    for (const c of tekst) {
      await stuur("Input.dispatchKeyEvent", { type: "keyDown", key: c, text: c, unmodifiedText: c }, s);
      await stuur("Input.dispatchKeyEvent", { type: "keyUp", key: c }, s);
      await wacht(60);
    }
  };
  const toets = async (k) => {
    await stuur("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: k, windowsVirtualKeyCode: k === "Enter" ? 13 : 0, text: k === "Enter" ? "\r" : undefined }, s);
    await stuur("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: k, windowsVirtualKeyCode: k === "Enter" ? 13 : 0 }, s);
  };
  /* ---------- slepen in het splitsvlak (uit de vorige versie van dit script) ---------- */
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
  /* Een punt van het vlak (980 × 720) op de pagina (het vlak staat iets kleiner: dat rekent de canvasmaat mee). */
  const punt = (x, y) => ev(`(() => { const c = [...document.querySelectorAll("canvas")].filter((c) => { const r = c.getBoundingClientRect(); return r.width > 300 && Math.abs(r.width / r.height - 980 / 720) < 0.05; })[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + ${x} * r.width / 980, y: r.top + ${y} * r.height / 720 }; })()`);
  /** Tik op een punt van het vlak (een pion in een vak gaat dan terug naar boven). */
  const tikVlak = async (x, y) => {
    const q = await punt(x, y);
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: q.x, y: q.y }, s);
    await muis("mousePressed", q);
    await muis("mouseReleased", q);
    await wacht(300);
  };
  let gezien = 0;
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
  const klikTekstW = async (t) => {
    for (let k = 0; k < 60; k++) {
      if (await klikTekst(t)) return;
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
  /** `aantal` dingen uit het hoopje naar het vak op (x, y) van het vlak. */
  const leg = async (aantal, x, y, traag = false) => {
    for (let i = 0; i < aantal; i++) {
      const van = await ev(`window.__phaser?.s1Punt?.() ?? null`);
      const naar = await punt(x, y);
      await sleep(van, naar, traag);
    }
  };
  const verschuif = async (x0, y0, x1, y1, traag = false) => sleep(await punt(x0, y0), await punt(x1, y1), traag);
  /** Slepen zoals de route van het vlak zegt: "goed" (de oplossing) of "fout" (de foute verdeling van de spec). */
  const sleepStappen = async (soort = "goed") => {
    for (let k = 0; k < 80 && !(await ev(`window.__phaser?.s1Stap?.(${JSON.stringify(soort)}) ?? null`)); k++) await wacht(150);
    for (let k = 0; k < 30; k++) {
      const st = await ev(`window.__phaser?.s1Stap?.(${JSON.stringify(soort)}) ?? null`);
      if (!st) return;
      await sleep(st.van, st.naar);
    }
  };
  const goedSleep = () => sleepStappen("goed");
  const getalKleuren = () => ev(`[...document.querySelectorAll('[class*="getal"]')].filter((e) => e.closest('[class*="tekst"], .bliepo-tekst')).map((e) => e.textContent.trim() + "=" + getComputedStyle(e).color).join(" ")`);
  const hand = () => ev(`!!document.querySelector("[data-hulphand]")`);
  const tekst = () => ev(`[...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent).join(" ").replace(/\\s+/g, " ").trim()`);
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
  return { ev, tik, foto, log, nu, klikTekst: klikTekstW, klikTekst1: klikTekst, klikPijl, klikKaart, tikDing, eindkaart, meet, typ, toets, sleep, punt, tikVlak, wachtOp, klikKnop, leg, verschuif, sleepStappen, goedSleep, getalKleuren, hand, tekst, meetSlepen, sluit: () => stuur("Target.closeTarget", { targetId }).catch(() => {}) };
}

const uitslag = [];
let fouten = 0;
const zie = (t) => {
  uitslag.push(`  ${t}`);
  console.log(`  ${t}`);
};
const fout = (t) => {
  fouten++;
  uitslag.push(`  FOUT: ${t}`);
  console.log(`  FOUT: ${t}`);
};

/**
 * Het hulphandje bij een opdracht (15.19): het komt ± 6 s nadat Bliepo de opdrachtzin heeft uitgesproken (stilte). Meet
 * hoe lang na het begin van de opdracht het handje er staat (= de opdrachtzin + ± 6 s).
 */
async function handTijd(P, o, wat) {
  const t0 = Date.now();
  let h = false;
  while (!h && Date.now() - t0 < 16000) {
    h = await P.ev(`!!document.querySelector("[data-hulphand]")`);
    if (!h) await wacht(100);
  }
  const l = await P.log();
  const zin = [...l].reverse().find((x) => x.wat === "opdrachtzin");
  zie(`${o.naam}: hulphandje bij ${wat}: ${h ? `ja, ${Date.now() - t0 + (o.opdrachtWacht ?? 0)} ms na het begin van de opdracht` : "nee"}${zin ? ` (zin: "${zin.zin.slice(0, 40)}")` : ""}`);
  if (!h) fout(`geen hulphandje bij ${wat} na lange stilte`);
}

/**
 * Een speler (regel 15.27, 10 nov 2026): doet wat de les vraagt en tikt NOOIT op de pijl (de les moet vanzelf doorgaan).
 * `keuze(taak)` geeft het antwoord (standaard het goede).
 */
async function speel(P, o = {}) {
  const keuze = o.keuze ?? ((taak) => taak.goed);
  const tot = Date.now() + (o.maxMs ?? 25 * 60_000);
  let laatsteTaak = null;
  let langste = 0;
  let fotoNr = 0;
  while (Date.now() < tot) {
    const z = await P.nu();
    if (!z) {
      await wacht(150);
      continue;
    }
    if (o.bijElkeStap) await o.bijElkeStap();
    if (process.env.VOLG) {
      const sl = JSON.stringify([z.taak?.soort, z.taak?.vraag, z.taak?.poging, z.tekst.at(-1)?.slice(0, 50)]);
      if (sl !== globalThis.__vorigVolg) { globalThis.__vorigVolg = sl; globalThis.__volgT = Date.now(); console.log("   …", sl); }
      else if (Date.now() - globalThis.__volgT > 12000) { globalThis.__volgT = Date.now(); console.log("   STIL:", JSON.stringify((await P.log()).slice(-6)), await P.ev(`JSON.stringify(window.__stem?.slice(-4))`)); }
    }
    /* Schermfoto's: het langste stuk tekst tot nu toe, en een paar gewone momenten. */
    const lengte = z.tekst.join(" ").length;
    if (lengte > langste + 20) {
      langste = lengte;
      await P.foto?.(`${o.naam}-langste-stuk`);
    }
    if (z.taak?.soort === "kies" && fotoNr < 2 && Math.random() < 0.05) await P.foto?.(`${o.naam}-moment-${++fotoNr}`);
    if (z.kaart) {
      /* De eindkaart meten terwijl Bliepo zijn laatste zin zegt, en nog eens als die helemaal in beeld staat. */
      let ergst = null;
      for (let i = 0; i < 24; i++) {
        const e = await P.eindkaart();
        if (e && (!ergst || e.onder > ergst.onder)) ergst = e;
        await wacht(250);
      }
      zie(`${o.naam}: eindkaart: ${ergst?.onder ?? "?"} woorden van Bliepo onder de kaart (van ${ergst?.woorden ?? "?"}), regels die de kaart raken: ${ergst?.regels ?? "?"}; kaart ${JSON.stringify(ergst?.kaart)}, tekst ${JSON.stringify(ergst?.tekst)}`);
      if (process.env.ONTWERP && ergst?.onder) fout(`${o.naam}: de eindkaart staat over ${ergst.onder} woorden van Bliepo`);
      globalThis.__eindkaart = ergst;
      if ((await P.nu()).pijl) fout("pijl op de eindkaart");
      await P.foto?.(`${o.naam}-eindkaart`);
      await P.klikKaart();
      zie(`${o.naam}: tot de eindkaart gekomen zonder ooit op de pijl te tikken`);
      return true;
    }
    /* Alleen voor een oude versie (voor-meting): daar wachtten sommige stukken op de pijl; dan na 1,5 s tikken. */
    if (process.env.TIKWACHT && z.pijl && !z.taak) {
      const l = await P.log();
      const laatste = [...l].reverse().find((x) => /^pijl/.test(x.wat));
      if (laatste?.wat === "pijl") {
        await wacht(1500);
        await P.klikPijl();
        await wacht(300);
        continue;
      }
    }
    const taak = z.taak;
    const zonderHand = async () => {
      /* Geen hulphandje bij een keuze (15.19). */
      if (o.vraagWacht && (await P.ev(`!!document.querySelector("[data-hulphand]")`))) fout(`hulphandje bij een vraag (${taak.vraag})`);
    };
    /* Vaste zone (15.30, keuring Meer-minder): het splitsvlak blijft links van het tekstvak. De breedste tekening zijn de
       3 huisjes van vraag 10 (tot x = 940 van 980); het vlak staat daarom iets kleiner (KLEINER). Gemeten op de canvas. */
    const zone = async (opnieuw = true) => {
      const r = await P.ev(`(() => { const v = document.querySelector(".bliepo-vloer-ballon"); const c = [...document.querySelectorAll("[data-splitsen-gouden] canvas")][0]; if (!v || !c) return null; const k = c.getBoundingClientRect(); return { vlak: Math.round(k.left + 940 * k.width / 980 - v.getBoundingClientRect().left) }; })()`);
      /* Net na het laden heeft het Phaser-doek heel even zijn beginmaat: dan na 1,5 s nog eens meten. */
      if (r && r.vlak > 0 && opnieuw) {
        await wacht(1500);
        return zone(false);
      }
      if (r && r.vlak > 0) fout(`het splitsvlak loopt onder het tekstvak (${JSON.stringify(r)}, ${taak?.vraag})`);
      globalThis.__zone = r;
    };
    const controleerKnop = async () => {
      for (let i = 0; i < 40; i++) {
        if (await P.tikDing(`[data-knop="controleer"]`)) return true;
        await wacht(100);
      }
      fout(`geen vinkje (${taak?.vraag})`);
      return false;
    };
    const sleutel = taak ? `${taak.soort}:${taak.vraag}:${taak.poging}:${taak.n}` : null;
    if (taak && taak.soort === "kies") {
      if (sleutel !== laatsteTaak) {
        await wacht(o.vraagWacht ?? 1200);
        const z2 = await P.nu();
        if (z2.pijl && z2.taak?.soort === "kies") fout(`pijl bij een vraag (${taak.vraag})`);
        await zonderHand();
        await zone();
        laatsteTaak = sleutel;
        const x = taak.vraag === "start" ? (o.start ?? "Nee") : keuze(taak);
        if (o.fotos) await P.foto(`${o.naam}-${taak.vraag}-${taak.poging}-vraag`);
        if (await P.klikTekst(x)) await wacht(200);
        else laatsteTaak = null;
        if (o.fotos && x !== taak.goed && taak.vraag !== "start") { await wacht(2600); await P.foto(`${o.naam}-${taak.vraag}-${taak.poging}-na-${x}`); }
      }
    } else if (taak && taak.soort.startsWith("sleep")) {
      /* Slepen (een opdracht, geen pijl). Elke nieuwe opdracht (n) 1 keer. "samen" = de kleine stap na de 2e fout. */
      /* Vastgelopen (de foute verdeling ligt er al, bijvoorbeeld in de proef na een fout): na 25 s alsnog goed slepen. */
      if (sleutel === laatsteTaak && Date.now() - (globalThis.__sindsTaak ?? Date.now()) > 25000) {
        globalThis.__sindsTaak = Date.now();
        await P.sleepStappen("goed");
        if (taak.soort === "sleepVinkje") await controleerKnop();
      }
      if (sleutel !== laatsteTaak) {
        laatsteTaak = sleutel;
        globalThis.__sindsTaak = Date.now();
        await wacht(o.opdrachtWacht ?? 500);
        if ((await P.nu()).pijl) fout(`pijl bij de opdracht (${taak.wat} ${taak.vraag})`);
        await zone();
        if (o.opdrachtWacht && o.opdrachtWacht > 6500) await handTijd(P, o, taak.wat);
        if (o.vangnet && taak.wat === "samen") {
          zie(`${o.naam}: niets doen bij het samen voordoen (vangnet na 20 s)`);
          await wacht(21500);
          continue;
        }
        const soort = taak.wat === "samen" ? "goed" : keuze(taak);
        if (o.fotos && !globalThis.__fotoWat?.[`${taak.wat}-${taak.vraag}-${soort}`]) { (globalThis.__fotoWat ??= {})[`${taak.wat}-${taak.vraag}-${soort}`] = 1; await P.foto(`${o.naam}-${taak.vraag}-${taak.wat}-${soort}`); }
        await P.sleepStappen(soort);
        if (taak.soort === "sleepVinkje") {
          await wacht(300);
          await controleerKnop();
        }
        await wacht(300);
      }
    }
    await wacht(120);
  }
  fout(`${o.naam}: niet binnen de tijd bij de kaart`);
  return false;
}

/** Controles op het hele meetlogboek van een route. */
async function controleer(P, naam) {
  const m = await P.meet();
  const l = await P.log();
  const tel = (w) => l.filter((x) => x.wat === w).length;
  zie(`${naam}: ${tel("pijl-door")} stukken met pijl (allemaal vanzelf door), ${tel("opdrachtzin")} opdrachtzinnen zonder pijl, ${tel("pijl-getikt")} keer op de pijl getikt, ${l.filter((x) => x.wat === "pijl").length} stukken die op een tik wachten (moet 0)`);
  if (l.some((x) => x.wat === "pijl")) fout(`${naam}: er wacht nog een stuk op een tik`);
  /* Tijd van het einde van de zin tot het volgende stuk. "zin-klaar" komt 0,3 s na het einde van de stem (Lesscherm). */
  const tijden = [];
  for (let k = 0; k < l.length; k++) {
    if (l[k].wat !== "zin-klaar") continue;
    const stuk = [...l.slice(0, k)].reverse().find((x) => x.wat === "pijl-door");
    const volgende = l.slice(k + 1).find((x) => ["pijl-door", "vraag", "opdrachtzin", "kaart", "pijl-getikt"].includes(x.wat));
    if (!volgende || volgende.wat === "pijl-getikt") continue;
    tijden.push({ stuk: stuk?.zin ?? "", ms: volgende.t - l[k].t + 300, naar: volgende.wat });
  }
  const afwijkend = tijden.filter((x) => x.ms < 550 || x.ms > 950);
  const gem = tijden.length ? Math.round(tijden.reduce((a, x) => a + x.ms, 0) / tijden.length) : 0;
  zie(`${naam}: einde zin → volgend stuk: ${tijden.length} keer gemeten, gemiddeld ${gem} ms (doel ±700), kleinste ${Math.min(...tijden.map((x) => x.ms))} ms, grootste ${Math.max(...tijden.map((x) => x.ms))} ms; buiten 550–950 ms: ${afwijkend.length}`);
  for (const a of afwijkend.slice(0, 8)) zie(`   afwijkend: ${a.ms} ms na "${a.stuk.slice(0, 70)}" → ${a.naar}`);
  /* Echte stem: elke zin helemaal uitgesproken? (stem-logboek, alleen met ECHTESTEM=1) */
  const stemlog = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
  if (stemlog.length) {
    const c = (w) => stemlog.filter((x) => x.wat === w).length;
    const fouten = {};
    for (const x of stemlog.filter((x) => x.wat === "error")) fouten[x.fout] = (fouten[x.fout] ?? 0) + 1;
    const kort = [];
    for (const x of stemlog.filter((x) => x.wat === "start")) {
      const e = stemlog.find((y) => y.t >= x.t && y.z === x.z && (y.wat === "end" || y.wat === "error"));
      if (e && e.wat === "error") kort.push(`${e.t - x.t} ms: ${x.z.slice(0, 50)} (${e.fout})`);
    }
    zie(`${naam}: stem: ${c("speak")} zinnen gestart, ${c("start")} begonnen, ${c("end")} helemaal uitgesproken, fouten ${JSON.stringify(fouten)}, ${c("cancel")} keer cancel`);
    for (const k of kort.slice(0, 5)) zie(`   afgebroken na ${k}`);
  }
  /* Dubbel uitgesproken (Sara 10 nov, F8): dezelfde uiting 2 keer gestart binnen 20 s zonder actie van het kind ertussen. */
  {
    const acties = l.filter((x) => ["tik", "pijl-getikt", "gesleept"].includes(x.wat)).map((x) => x.t);
    const starts = stemlog.filter((x) => x.wat === "speak" && x.z);
    let dubbel = 0;
    for (let i = 0; i < starts.length; i++)
      for (let j = i - 1; j >= 0 && starts[i].t - starts[j].t < 20000; j--)
        if (starts[j].z === starts[i].z) {
          if (!acties.some((t) => t > starts[j].t && t <= starts[i].t)) {
            dubbel++;
            if (dubbel <= 3) fout(`${naam}: F8 dezelfde uiting 2 keer gestart zonder actie (${starts[i].t - starts[j].t} ms): ${starts[i].z.slice(0, 70)}`);
          }
          break;
        }
    zie(`${naam}: F8-controle: ${dubbel} keer dezelfde uiting 2 keer gestart; ${stemlog.filter((x) => x.wat === "geluid").length} keer een geluidsbestand gestart`);
  }
  /* Gedimd/wit: komt een tekst die al wit was, weer gedimd terug zonder actie (F7 in gedimd/wit)? */
  let dimTerug = 0;
  for (let i = 1; i < m.length; i++) if (m[i].dim && !m[i - 1].dim && JSON.stringify(m[i].tekst) === JSON.stringify(m[i - 1].tekst)) { dimTerug++; zie(`   weer gedimd na ${m[i].t - m[i - 1].t} ms: ${JSON.stringify(m[i].tekst).slice(0, 120)} (taak ${m[i].taak})`); if (process.env.VOLG) for (const r of m.slice(Math.max(0, i - 4), i + 2)) zie(`      ${r.t} dim=${r.dim} leest=${r.leest} pijl=${r.pijl} ${JSON.stringify(r.tekst).slice(0, 90)}`); }
  zie(`${naam}: ${dimTerug} keer werd dezelfde tekst weer gedimd (moet 0)`);
  if (dimTerug) fout(`${naam}: F7 gedimd/wit: dezelfde tekst werd ${dimTerug} keer weer gedimd`);
  /* Ontwerp (Sara 10 nov): verspringen > 2 px van tekstvak, eerste regel, pijl en Bliepo; pijl aan/uit tussen stukken. */
  const sprong = (sleutel) => {
    let vorig = null;
    let n = 0;
    const voorbeelden = [];
    /* Pas meten vanaf de eerste tekst (daarvoor laadt de pagina nog). */
    const begin = m.findIndex((r) => r.tekst.length > 0);
    for (const r of m.slice(Math.max(0, begin))) {
      const p = r.plek?.[sleutel];
      if (!p) continue;
      if (vorig && (Math.abs(p[0] - vorig[0]) > 2 || Math.abs(p[1] - vorig[1]) > 2 || (sleutel !== "regel" && Math.abs(p[2] - vorig[2]) > 2))) {
        n++;
        if (voorbeelden.length < 3) voorbeelden.push(`${JSON.stringify(vorig)}→${JSON.stringify(p)} bij "${(r.tekst[0] ?? "").slice(0, 40)}"`);
      }
      vorig = p;
    }
    return { n, voorbeelden };
  };
  const sprongen = {};
  for (const k of ["vak", "regel", "pijl", "robot"]) sprongen[k] = sprong(k);
  let knipper = 0;
  for (let i = 1; i < m.length; i++) {
    if (!m[i].pijl || m[i - 1].pijl) continue;
    /* De pijl kwam (terug). Was hij er kort daarvoor ook, zonder vraag/opdracht ertussen? Dan knippert hij. */
    let j = i - 1;
    while (j >= 0 && !m[j].pijl && !m[j].taak && !m[j].kaart) j--;
    if (j >= 0 && m[j].pijl) knipper++;
  }
  const over = Math.max(0, ...m.map((r) => r.plek?.over ?? 0));
  if (over > 2) for (const r of m.filter((r) => (r.plek?.over ?? 0) > 2).slice(0, 4)) zie(`   te lang (${r.plek.over} px): ${JSON.stringify(r.tekst).slice(0, 200)}`);
  /* Overlap (Sara 10 nov): Bliepo mag nooit over de tekst, de knoppen of de pijl vallen; tekst nooit buiten het vak. */
  const doos = (r, b) => (r ? { l: r[0], t: r[1], r: r[0] + (b ?? 0), o: r[1] + r[2] } : null);
  const raakt = (a, c) => a && c && a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.o - 1 && c.t < a.o - 1;
  let overlap = 0;
  let buiten = 0;
  const overVb = [];
  for (const r of m) {
    const p = r.plek;
    if (!p?.robot) continue;
    const robot = doos(p.robot, p.robotB);
    const tekst = p.inhoud ? { l: p.inhoud[0], t: p.inhoud[1], r: p.inhoud[0] + p.inhoud[3], o: p.inhoud[1] + p.inhoud[2] } : null;
    const pijlD = p.pijl ? doos(p.pijl, p.pijl[2]) : null;
    if (raakt(robot, tekst) || raakt(robot, pijlD)) {
      overlap++;
      if (overVb.length < 3) overVb.push(`Bliepo ${JSON.stringify(robot)} raakt tekst ${JSON.stringify(tekst)} bij "${(r.tekst.at(-1) ?? "").slice(0, 40)}"`);
    }
    if (p.vak && tekst && tekst.o > p.vak[1] + p.vak[2] + 1) buiten++;
  }
  zie(`${naam}: overlap Bliepo met tekst/knoppen/pijl: ${overlap}; tekst onder het vak uit: ${buiten}`);
  for (const v of overVb) zie(`   ${v}`);
  if (process.env.ONTWERP && (overlap || buiten)) fout(`${naam}: Bliepo overlapt de tekst (${overlap}) of tekst loopt uit het vak (${buiten})`);
  zie(`${naam}: sprongen > 2 px: tekstvak ${sprongen.vak.n}, eerste regel ${sprongen.regel.n}, pijl ${sprongen.pijl.n}, Bliepo ${sprongen.robot.n}; pijl weg en terug tussen stukken: ${knipper}; tekst te lang voor het vak: ${over > 2 ? over + " px" : "nee"}`);
  for (const k of ["vak", "regel", "pijl", "robot"]) for (const v of sprongen[k].voorbeelden) zie(`   sprong ${k}: ${v}`);
  if (process.env.ONTWERP) {
    if (sprongen.vak.n || sprongen.regel.n || sprongen.pijl.n || sprongen.robot.n) fout(`${naam}: er verspringt iets (> 2 px)`);
    if (knipper) fout(`${naam}: de pijl ging ${knipper} keer weg en kwam terug tussen stukken`);
    if (over > 2) fout(`${naam}: tekst past niet in het vak (${over} px te lang)`);
  }
  /* Nooit pijl en keuzevraag tegelijk. */
  /* Langer dan 1 meting (een enkele meting van 50 ms is het moment dat de knoppen net verschijnen). */
  const pk = (r) => r && r.pijl && r.taak && (r.taak.startsWith("kies:") || r.taak.startsWith("kaart:")) && !r.taak.endsWith(":1");
  const samen = m.filter((r, i) => pk(r) && pk(m[i + 1]));
  if (samen.length) fout(`${naam}: ${samen.length} keer pijl en keuzevraag tegelijk`);
  /* F7 (Sara, 10 nov 2026): dezelfde tekst verdwijnt en komt terug zonder dat het kind iets deed. */
  const actie = l.filter((x) => ["tik", "pijl-getikt", "gesleept"].includes(x.wat)).map((x) => x.t);
  const sleutel = (r) => r.tekst.join(" | ");
  let f7 = 0;
  for (let i = 1; i < m.length; i++) {
    const k = sleutel(m[i]);
    /* Een vraag die na de hint opnieuw komt, is een nieuwe poging (geen F7). */
    if (!k || k === sleutel(m[i - 1]) || (m[i].taak && (m[i].taak.startsWith("kies:") || m[i].taak.startsWith("kaart:")))) continue;
    for (let j = i - 2; j >= 0 && m[i].t - m[j].t < 15000; j--) {
      if (sleutel(m[j]) !== k) continue;
      if (!actie.some((t) => t > m[j].t && t <= m[i].t)) {
        f7++;
        if (f7 <= 5) fout(`${naam}: F7 dezelfde tekst kwam terug zonder actie: ${k.slice(0, 100)}`);
      }
      break;
    }
  }
  zie(`${naam}: F7-controle: ${f7} keer dezelfde tekst terug zonder actie`);
  if (process.env.TABEL) {
    mkdirSync(process.env.TABEL, { recursive: true });
    const stem = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    writeFileSync(join(process.env.TABEL, `${naam}.json`), JSON.stringify({ log: l, meet: m, tijden, stem }, null, 1));
  }
  return { m, l, tijden };
}

/** Het eerste foute antwoord bij een vraag: het eerste in de lijst dat niet goed is (vast, zodat routes herhaalbaar zijn). */
const fout1 = (t) => (t.fout ? t.fout[0] : t.opties.find((x) => x !== t.goed));
/** Een ander fout antwoord (voor de 2e poging), als dat er is. */
const fout2 = (t) => (t.fout ? t.fout.at(-1) : [...t.opties].reverse().find((x) => x !== t.goed));
const reacties = async (P) => {
  const l = await P.log();
  for (const r of l.filter((x) => x.wat === "reactie" && x.soort !== "goed")) zie(`   ${r.soort} ${r.vraag} ${r.x ?? ""} ${r.denkfout ?? ""}: ${r.zin ?? ""}`);
  return l;
};

/* Plekken van de vakken (punten van het vlak), zoals in squla-splitsen-gouden.tsx. */
const PAARS = (links = true) => (links ? { x: 330, y: 424 } : { x: 650, y: 424 });
const ORANJE = (links = true) => (links ? { x: 650, y: 424 } : { x: 330, y: 424 });
const VRAGEN = [
  [5, 2, true], [9, 6, true], [7, 3, true], [6, 4, true], [10, 8, true], [7, 4, true], [6, 5, true], [9, 6, false], [8, 3, false],
];

/** Een huisje met `p` in het paarse vak (de rest in het andere). */
async function huis(P, nr, p) {
  const [tot, , links] = VRAGEN[nr - 1];
  await P.leg(p, PAARS(links).x, PAARS(links).y);
  await P.leg(tot - p, ORANJE(links).x, ORANJE(links).y);
}
async function reactie(P) {
  const r = await P.wachtOp("reactie");
  zie(`${r.vraag} · ${r.soort}${r.denkfout ? ` (${r.denkfout})` : ""}: "${r.zin}"`);
  return r;
}
/** De volgende opdracht (de les gaat na goed en na een fout vanzelf door; 15.27). */
async function opdracht(P) {
  return P.wachtOp("opdrachtzin");
}

/* ---------- de situaties ---------- */

const SITUATIES = {
  /* ---------- vaste situaties (uit de vorige versie van dit script; nu zonder tikken op de pijl) ---------- */
  /** Vloeiend tijdens echt slepen (de vloeiendcontrole meet op het beginscherm, waar nog niet gesleept kan worden). */
  async sleepmeting(P) {
    /* LES=<andere les> meet ter vergelijking een andere les (bijvoorbeeld de oude squla-splits-splitsen1-1). */
    if (process.env.LES) await P.klikTekst("Ja");
    else {
      await P.wachtOp("vraag");
      await P.klikTekst("Ja");
      await P.wachtOp("opdrachtzin");
    }
    for (let k = 0; k < 100 && !(await P.ev(`window.__phaser?.s1Stap?.("goed") ?? null`)); k++) await new Promise((r) => setTimeout(r, 200));
    await new Promise((r) => setTimeout(r, 1500));
    for (const traag of [false, true, false, true]) {
      const r = await P.meetSlepen(traag);
      zie(`slepen ${traag ? "trage telefoon (4× trager)" : "laptop"}: ${r.fps} beelden/s, langste beeld ${r.max} ms`);
      await new Promise((r2) => setTimeout(r2, 1000));
    }
  },

  /** Nee → de uitleg (stap 7–10) → alle 15 vragen in één keer goed; kleuren en tempo meten. */
  async "nee-alles-goed"(P) {
    await P.wachtOp("vraag");
    await P.foto("01-start");
    await P.klikTekst("Nee");
    await P.wachtOp("pijl-door");
    await opdracht(P);
    await P.foto("02-uitleg");
    await P.leg(1, 330, 424);
    await opdracht(P);
    await P.leg(4, 650, 424);
    await P.wachtOp("pijl-door");
    await P.wachtOp("vraag");
    /* Lang wachten bij de keuzevraag: geen hulphandje en geen aanwijzing (draaiboek §4, 15.19). */
    await new Promise((r) => setTimeout(r, 8000));
    const l = await P.log();
    if (l.slice(-3).some((x) => x.wat === "aanwijzing")) fout("bij de keuzevraag kwam een aanwijzing");
    else zie("keuzevraag 8 s gewacht: geen aanwijzing, geen handje (goed)");
    await P.foto("03-totaalvraag");
    await P.klikTekst("5");
    await reactie(P).catch(() => {});
    await opdracht(P);
    await P.foto("04-anders");
    await P.leg(2, 330, 424);
    await P.leg(3, 650, 424);
    await reactie(P);
    for (let nr = 1; nr <= 9; nr++) {
      await opdracht(P);
      const t0 = await P.ev("performance.now()");
      await P.goedSleep();
      const t1 = await P.ev("performance.now()");
      const r = await reactie(P);
      zie(`   reactie ${Math.round(r.t - t1)} ms na de laatste neerleg (incl. 400 ms rust); sleep ${Math.round(t1 - t0)} ms`);
      if (nr === 1) {
        await new Promise((r2) => setTimeout(r2, 250));
        zie(`   getalkleur na goed: ${await P.getalKleuren()}`);
        await P.foto("05-goed-vraag1");
      }
    }
    await opdracht(P);
    await P.foto("06-paren");
    await P.goedSleep();
    await reactie(P);
    for (let nr = 11; nr <= 15; nr++) {
      await opdracht(P);
      if (nr === 11) {
        await P.foto("07-tienvak");
        /* 1 bal in het vak: het vinkje komt en wordt 1 keer uitgelegd (door het lesscherm; keuring punt 2). */
        await P.leg(1, 490, 412);
        await new Promise((r) => setTimeout(r, 1500));
        const t = await P.tekst();
        zie(`doos, 1 bal: Bliepo "${t}"`);
        if (/deze knop/.test(t)) fout("vinkje 2 keer uitgelegd");
        await P.foto("07b-vinkje");
      }
      await P.goedSleep();
      await P.klikKnop("controleer");
      await reactie(P);
    }
    await P.wachtOp("kaart");
    await P.foto("08-kaart");
    zie(`einde: "${await P.tekst()}"`);
  },

  /** Ja → proef goed → daarna fouten: goed na een fout, 2 fouten (samen), dezelfde denkfout 2 keer, lang wachten. */
  async "ja-proef"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    zie(`opdracht 1: "${await P.tekst()}"`);
    await huis(P, 1, 2);
    await reactie(P);
    await opdracht(P);
    await huis(P, 2, 6);
    await reactie(P);
    await P.wachtOp("pijl-door", 30000, (x) => /verder oefenen/.test(x.zin));
    /* Vraag 3 (7, 3): 1 te veel (4 = ook omgedraaid!) → kies 5 (te veel), dan goed. */
    await opdracht(P);
    await huis(P, 3, 5);
    await reactie(P);
    await P.foto("10-fout1");
    zie(`   getalkleur bij fout: ${await P.getalKleuren()}`);
    await opdracht(P);
    await huis(P, 3, 3);
    await reactie(P);
    /* Vraag 4 (6, 4): omgedraaid (2) twee keer → samen voordoen. */
    await opdracht(P);
    await huis(P, 4, 2);
    await reactie(P);
    await opdracht(P);
    await huis(P, 4, 2);
    await reactie(P);
    await P.wachtOp("samen");
    await P.wachtOp("opdrachtzin", 30000).catch(() => {});
    await P.foto("11-samen");
    /* Lang wachten tijdens samen voordoen: het hulphandje komt vanzelf. */
    await new Promise((r) => setTimeout(r, 7500));
    zie(`samen voordoen, 7,5 s stil: hulphandje ${(await P.hand()) ? "ja" : "NEE"}`);
    await P.foto("12-hand");
    await P.goedSleep();
    await P.wachtOp("pijl-door", 30000, (x) => /^(Samen|Kijk)/.test(x.zin ?? ""));
    /* Vraag 5 (10, 8): 2 keer te weinig (5) → "weer" + andere uitleg, dan samen. */
    await opdracht(P);
    await huis(P, 5, 5);
    await reactie(P);
    await opdracht(P);
    await huis(P, 5, 5);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl-door", 30000, (x) => /^(Samen|Kijk)/.test(x.zin ?? ""));
    /* Vraag 6 (7, 4, zak): alles in het paarse vak, dan 1 te weinig (3). */
    await opdracht(P);
    await huis(P, 6, 7);
    await reactie(P);
    await opdracht(P);
    await huis(P, 6, 3);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl-door", 30000, (x) => /^(Samen|Kijk)/.test(x.zin ?? ""));
    /* Vraag 7 (6, 5, zak): lang wachten bij de opdracht → hulphandje met 1 zin; dan heel snel goed. */
    await opdracht(P);
    await new Promise((r) => setTimeout(r, 7000));
    const l = await P.log();
    const a = l.filter((x) => x.wat === "aanwijzing").pop();
    zie(`opdracht 7 s stil: hulphandje ${(await P.hand()) ? "ja" : "NEE"}, aanwijzing ${a ? JSON.stringify(a) : "geen"}; Bliepo: "${await P.tekst()}"`);
    await P.foto("13-hand-opdracht");
    await huis(P, 7, 5);
    await reactie(P);
    /* Vraag 8 en 9: heel snel (tijdens de zin) en goed: Bliepo zegt niets over snel. */
    await opdracht(P);
    await huis(P, 8, 6);
    const r8 = await reactie(P);
    if (/snel/i.test(r8.zin)) fout("Bliepo zei iets over snel");
    await opdracht(P);
    await huis(P, 9, 0);
    await reactie(P);
    await opdracht(P);
    await huis(P, 9, 8);
    await reactie(P);
    await P.wachtOp("samen");
    await P.goedSleep();
    await P.wachtOp("pijl-door", 30000, (x) => /^(Samen|Kijk)/.test(x.zin ?? ""));
    /* Vraag 10: de huisjes: 3-3-3, dan goed. */
    await opdracht(P);
    for (const [x, k] of [[555, 3], [875, 3], [235, 3]]) await P.leg(k, x, 350);
    await reactie(P);
    await P.foto("14-paren-fout");
    await opdracht(P);
    await P.goedSleep();
    await reactie(P);
    /* Vraag 11 (7 zichtbaar, 3 onder de doek): 10 (totaal), dan 7 (zichtbaar) → samen. */
    await opdracht(P);
    await P.leg(10, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await opdracht(P);
    await P.leg(7, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await P.wachtOp("samen");
    await new Promise((r) => setTimeout(r, 2500));
    await P.foto("15-tien-samen");
    await P.goedSleep();
    await P.wachtOp("pijl-door", 30000, (x) => /^(Samen|Kijk)/.test(x.zin ?? ""));
    /* Vraag 12 (9 zichtbaar, 1 onder): 2 (1 te veel → dichtbij), dan goed. */
    await opdracht(P);
    await P.leg(2, 490, 412);
    await P.klikKnop("controleer");
    await reactie(P);
    await opdracht(P);
    await P.goedSleep();
    await P.klikKnop("controleer");
    await reactie(P);
    /* Vraag 13–15 goed. */
    for (let k = 0; k < 3; k++) {
      await opdracht(P);
      await P.goedSleep();
      await P.klikKnop("controleer");
      await reactie(P);
    }
    await P.wachtOp("kaart");
    zie(`einde: "${await P.tekst()}"`);
    const d = await P.ev(`JSON.stringify(window.__uitkomsten ?? [])`);
    for (const u of JSON.parse(d)) zie(`   uitkomst ${u.vraag}: ${u.uitkomst} ${u.denkfouten.join(",")}`);
  },

  /** Uitleg na Nee: vastlopen kan niet (kind-test punt 2). Stap a: eerst in het oranje vak, 3 keer verkeerd = voordoen. Stap b: 2 en 3, herstellen door te tikken. */
  async "uitleg-vast"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Nee");
    await opdracht(P);
    await P.leg(1, 650, 424);
    const m1 = await P.wachtOp("uitleg-mis");
    zie(`stap a, pion in het oranje vak: "${m1.zin}"`);
    await new Promise((r) => setTimeout(r, 7000));
    zie(`   7 s stil: handje ${(await P.hand()) ? "ja" : "NEE"} (wijst naar het oranje vak); Bliepo: "${await P.tekst()}"`);
    await P.foto("20-uitleg-mis");
    await P.tikVlak(650, 424);
    await P.leg(2, 330, 424);
    await P.tikVlak(293, 424);
    await P.leg(1, 650, 424);
    const v = await P.wachtOp("uitleg-voordoen", 20000).catch(() => null);
    zie(v ? `stap a: na 3 keer verkeerd doet Bliepo het voor (${JSON.stringify(v.tel)} → 1 en 0)` : "FOUT: geen vangnet in stap a");
    if (!v) fout("geen vangnet in stap a");
    await opdracht(P);
    /* Stap b: 2 in paars, 3 in oranje (alles ligt, maar het klopt niet). */
    await P.leg(1, 330, 424);
    await P.leg(3, 650, 424);
    const m2 = await P.wachtOp("uitleg-mis");
    zie(`stap b, 2 en 3: "${m2.zin}"`);
    await new Promise((r) => setTimeout(r, 7000));
    zie(`   7 s stil: handje ${(await P.hand()) ? "ja" : "NEE"}`);
    await P.tikVlak(293, 424);
    await P.leg(1, 650, 424);
    await P.wachtOp("pijl-door", 20000);
    zie("stap b hersteld door te tikken: uitleg gaat door");
  },

  /** Uitleg stap b: 0 en 5 en dan niets meer doen → na 30 s doet Bliepo het voor. */
  async "uitleg-vast-2"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Nee");
    await opdracht(P);
    await P.leg(1, 330, 424);
    await opdracht(P);
    await P.tikVlak(330, 424);
    await P.leg(5, 650, 424);
    const m = await P.wachtOp("uitleg-mis");
    zie(`stap b, 0 en 5: "${m.zin}"`);
    const v = await P.wachtOp("uitleg-voordoen", 40000).catch(() => null);
    zie(v ? "na 20 s stil in een verkeerde stand doet Bliepo het voor" : "FOUT: geen vangnet na 20 s");
    if (!v) fout("geen vangnet na 20 s");
    await P.wachtOp("pijl-door", 20000);
  },

  /** Proef na Ja, 1e fout, 9 s stil: het handje leest de echte stand (keuring punt 1). */
  async "proef-hand"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await P.leg(4, 330, 424);
    await P.leg(1, 650, 424);
    await reactie(P);
    await opdracht(P);
    await new Promise((r) => setTimeout(r, 9000));
    const l = await P.log();
    const a = l.filter((x) => x.wat === "aanwijzing").pop();
    const t = await P.tekst();
    zie(`proef, 4 en 1, 9 s stil: handje ${(await P.hand()) ? "ja" : "NEE"} (${a ? a.hand : "geen"}); Bliepo: "${t}"`);
    if (!/Schuif een pion uit het paarse vak/.test(t) || /goed bezig|Jij kunt|Geen haast/.test(t)) fout("proef: handje-zin past niet bij de stand");
    if (a?.hand !== "sleep") fout("proef: handje wijst niet van vak naar vak");
    await P.foto("21-proef-hand");
  },

  /** Proef met een langzame, kinderlijke verbetering: 2 pionnen schuiven met 1 s ertussen (kind-test punt 3). */
  async "proef-traag"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await P.leg(4, 330, 424, true);
    await P.leg(1, 650, 424, true);
    await reactie(P);
    await opdracht(P);
    /* 4 pionnen op 1 rij in het paarse vak: x = 330 + (k − 1,5) × 73,4. Schuif de rechtse 2 naar het oranje vak. */
    await P.verschuif(440, 424, 650, 424, true);
    await P.verschuif(367, 424, 650, 424, true);
    const r = await reactie(P);
    if (r.soort !== "goed-na-fout") fout(`langzaam verbeteren in de proef gaf ${r.soort}`);
    else zie("langzaam 2 pionnen geschoven: pas daarna nagekeken, goed na een fout");
  },

  /** Ja → 2 fouten in de proef → alsnog de uitleg (draaiboek §3 A.4). */
  async "ja-proef-mislukt"(P) {
    await P.wachtOp("vraag");
    await P.klikTekst("Ja");
    await opdracht(P);
    await huis(P, 1, 4);
    await reactie(P);
    await opdracht(P);
    zie(`na de 1e fout in de proef: "${await P.tekst()}"`);
    /* De pionnen blijven liggen (draaiboek §3 A.2); het kind schuift er 1 heen en weer: weer fout. */
    const van = await P.punt(330, 424);
    const naar = await P.punt(650, 424);
    void van;
    void naar;
    await P.goedSleep();
    const r = await reactie(P);
    if (r.soort === "goed-na-fout") zie("proef: goed na een fout");
    await opdracht(P);
    await huis(P, 2, 9);
    const r2 = await reactie(P);
    if (r2.soort !== "proef-stop") fout(`2e fout in de proef gaf geen uitleg maar ${r2.soort}`);
    await P.wachtOp("opdrachtzin");
    zie(`na de mislukte proef: "${await P.tekst()}"`);
  },

  /* ---------- routes met de vaste speler en de controles van de nieuwste gouden lessen (15.27–15.30, F7, F8) ---------- */
  /** Nee-route: de uitleg en alles goed, nooit op de pijl tikken. */
  async goed(P) {
    const ok = await speel(P, { naam: "goed", keuze: (t) => (t.soort === "kies" ? t.goed : "goed") });
    await controleer(P, "goed");
    zie(`goed: zone splitsvlak/tekstvak (px voorbij de linkerrand van het tekstvak; negatief = ruimte): ${JSON.stringify(globalThis.__zone)}`);
    if (!ok) fout("goed: niet tot de eindkaart");
  },
  /** Alles fout (2 keer per vraag): elke vraag samen voordoen; de les stopt nooit. Met de langste zinnen (overlap). */
  async allefout(P) {
    const ok = await speel(P, { naam: "allefout", fotos: !!process.env.FOTO, keuze: (t) => (t.soort === "kies" ? (t.vraag === "start" ? "Nee" : t.opties.find((x) => x !== t.goed)) : "fout"), maxMs: 40 * 60_000 });
    const c = await controleer(P, "allefout");
    const opdr = c.l.filter((x) => x.wat === "reactie" && x.soort === "fout2" && /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Leg|Sleep|Schuif|Pak) /.test(x.zin ?? ""));
    zie(`allefout: zinnen bij de 2e fout met een opdracht erin: ${opdr.length}`);
    if (opdr.length) fout(`opdracht in de zin bij de 2e fout: ${opdr[0].zin}`);
    for (const r of c.l.filter((x) => x.wat === "reactie" && x.soort !== "goed").slice(0, 60)) zie(`   ${r.soort} ${r.vraag} ${JSON.stringify(r.x ?? "")} ${r.denkfout ?? ""}: ${r.zin ?? ""}`);
    if (!ok) fout("allefout: niet tot de eindkaart");
  },
  /** Vangnet: 2 keer fout, en bij het samen voordoen niets doen; na 20 s legt Bliepo het zelf (zonder "Ja"). */
  async vangnet(P) {
    let k = 0;
    const ok = await speel(P, { naam: "vangnet", vangnet: true, keuze: (t) => (t.soort === "kies" ? t.goed : t.wat === "vraag" && k++ < 2 ? "fout" : "goed"), maxMs: 20 * 60_000 });
    const l = await P.log();
    zie(`vangnet: ${l.filter((x) => x.wat === "vangnet").length} keer deed Bliepo het zelf; zinnen erna: ${l.filter((x) => x.wat === "pijl-door" && /^Kijk, /.test(x.zin)).map((x) => x.zin).join(" | ")}`);
    if (!l.some((x) => x.wat === "vangnet")) fout("vangnet: Bliepo deed het niet zelf");
    if (l.some((x, i) => x.wat === "vangnet" && /^Ja/.test(l.slice(i).find((y) => y.wat === "pijl-door")?.zin ?? ""))) fout("na het vangnet zegt Bliepo 'Ja'");
    if (!ok) fout("vangnet: niet tot de eindkaart");
  },
  /** Tik op de pijl tijdens het praten: de stem stopt en het volgende stuk komt meteen; met een echte muisklik. */
  async "tik-door"(P) {
    const metingen = [];
    for (let n = 0; n < 5; n++) {
      for (let i = 0; i < 400 && !((await P.nu())?.pijl && (await P.ev(`!!document.querySelector(".bliepo-tekst-nog")`))); i++) {
        const z = await P.nu();
        if (z?.taak?.soort === "kies") await P.klikTekst1(z.taak.vraag === "start" ? "Nee" : z.taak.goed);
        if (z?.taak?.soort?.startsWith("sleep")) { await P.goedSleep(); if (z.taak.soort === "sleepVinkje") await P.klikKnop("controleer").catch(() => {}); }
        await wacht(80);
      }
      const voor = await P.nu();
      const t0 = Date.now();
      await P.klikPijl();
      let na = voor;
      for (let i = 0; i < 100 && JSON.stringify(na.tekst) === JSON.stringify(voor.tekst) && JSON.stringify(na.taak) === JSON.stringify(voor.taak); i++) {
        await wacht(20);
        na = await P.nu();
      }
      metingen.push(Date.now() - t0);
      zie(`tik op de pijl tijdens "${(voor.tekst.at(-1) ?? "").slice(0, 50)}" → na ${Date.now() - t0} ms iets nieuws`);
      await wacht(300);
    }
    if (metingen.filter((x) => x > 1500).length) fout("na een tik op de pijl duurde het te lang");
    return true;
  },
  /** De echte stem (ZICHTBAAR=1 ECHTESTEM=1): elke zin helemaal uitgesproken, en elk woord licht op bij het gesproken moment. */
  async woorden(P) {
    let k = 0;
    const ok = await speel(P, { naam: "woorden", keuze: (t) => (t.soort === "kies" ? (t.vraag === "start" ? "Nee" : t.goed) : k++ % 4 === 1 && t.poging === 1 ? "fout" : "goed"), maxMs: Number(process.env.WOORDEN_MS ?? 25 * 60_000) });
    await controleer(P, "woorden");
    const stem = await P.ev(`JSON.stringify(window.__stem ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    const woord = await P.ev(`JSON.stringify(window.__woord ?? [])`).then((x) => JSON.parse(x ?? "[]"));
    const grenzen = stem.filter((x) => x.wat === "grens" && x.naam === "word");
    zie(`woorden: ${grenzen.length} woordmeldingen van de browserstem (onboundary)`);
    /* Per uitgesproken zin: wanneer licht het eerste woord op na de start, en wanneer het laatste woord vóór het einde. */
    const rijen = [];
    for (const s of stem.filter((x) => x.wat === "start")) {
      const e = stem.find((y) => y.t >= s.t && y.z === s.z && (y.wat === "end" || y.wat === "error"));
      if (!e || e.wat !== "end") continue;
      const woorden = s.z.trim().split(/\s+/);
      if (woorden.length < 3) continue;
      const wissels = woord.filter((w) => w.t >= s.t - 50 && w.t <= e.t + 300 && w.w && w.w.split("|")[1] && w.w.split("|")[1].replace(/\s/g, "").startsWith(s.z.replace(/[{}]|:[a-z]+/g, "").replace(/\s/g, "")));
      if (!wissels.length) { rijen.push({ z: s.z, geen: true }); continue; }
      const eerste = wissels.find((w) => w.w.startsWith("0:"));
      const laatste = wissels.find((w) => w.w.startsWith(`${woorden.length - 1}:`));
      const duur = e.t - s.t;
      /* Verwacht: het laatste woord begint ongeveer zijn eigen deel van de zin vóór het einde. */
      const deel = (woorden.at(-1).length + 1.5) / woorden.reduce((a, w) => a + w.length + 1.5, 0);
      const verwachtLaatste = e.t - duur * deel;
      /* Met woordmeldingen: per woord het verschil tussen melding en oplichten. */
      const per = [];
      for (const gr of grenzen.filter((x) => x.z === s.z && x.t >= s.t && x.t <= e.t)) {
        let pos = 0, idx = 0;
        for (let i = 0; i < woorden.length; i++) { const b = s.z.indexOf(woorden[i], pos); if (b + woorden[i].length > gr.i) { idx = i; break; } pos = b + woorden[i].length; idx = i + 1; }
        const w = wissels.find((x) => x.w.startsWith(`${idx}:`));
        if (w) per.push(w.t - gr.t);
      }
      rijen.push({ z: s.z, start: eerste ? eerste.t - s.t : null, laatsteVoorEinde: laatste ? e.t - laatste.t : null, fout: laatste ? Math.round(laatste.t - verwachtLaatste) : null, per, duur });
    }
    const metMeting = rijen.filter((r) => !r.geen && r.start !== null && r.fout !== null);
    const binnen = metMeting.filter((r) => Math.abs(r.start) <= 150 && Math.abs(r.fout) <= 150).length;
    const perAlle = rijen.flatMap((r) => r.per ?? []);
    zie(`woorden: ${rijen.length} zinnen gemeten (${rijen.filter((r) => r.geen).length} zonder oplichten); eerste woord licht op gemiddeld ${Math.round(metMeting.reduce((a, r) => a + r.start, 0) / Math.max(1, metMeting.length))} ms na de start van de stem; laatste woord: gemiddeld ${Math.round(metMeting.reduce((a, r) => a + Math.abs(r.fout), 0) / Math.max(1, metMeting.length))} ms naast het verwachte moment (grootste ${Math.max(0, ...metMeting.map((r) => Math.abs(r.fout)))} ms); binnen ±150 ms (begin én eind): ${binnen} van ${metMeting.length}`);
    if (perAlle.length) zie(`woorden: met woordmeldingen: ${perAlle.length} woorden, gemiddeld ${Math.round(perAlle.reduce((a, x) => a + Math.abs(x), 0) / perAlle.length)} ms verschil, binnen ±150 ms: ${perAlle.filter((x) => Math.abs(x) <= 150).length}`);
    for (const r of metMeting.filter((r) => Math.abs(r.start) > 150 || Math.abs(r.fout) > 150).slice(0, 6)) zie(`   buiten ±150 ms: start ${r.start} ms, eind ${r.fout} ms (zin ${r.duur} ms): "${r.z.slice(0, 60)}"`);
    if (process.env.TABEL) writeFileSync(join(process.env.TABEL, "woorden.json"), JSON.stringify({ rijen, woord, stem }, null, 1));
    return ok;
  },
};

const kies = process.env.SCENARIO ? process.env.SCENARIO.split(",") : Object.keys(SITUATIES).filter((x) => !["sleepmeting", "woorden", "tik-door"].includes(x));
for (const naam of kies) {
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
const nieuwVreemd = sql(`select count(*) from les_uitkomsten where id > ${startId} and (kind_id is null or kind_id <> '${testkind}');`);
const nieuw = sql(`select count(*) from les_uitkomsten where id > ${startId};`);
console.log(`\nNieuwe regels in les_uitkomsten: ${nieuw} (hoogste id was ${startId}); niet van Testkind: ${nieuwVreemd}`);
if (Number(nieuw) > 0) fout("er kwamen regels bij in les_uitkomsten");
if (process.env.UITSLAG) writeFileSync(process.env.UITSLAG, uitslag.join("\n"));
console.log(fouten ? `\n${fouten} FOUT(EN)` : "\nAlles in orde.");
process.exit(fouten ? 1 : 0);
