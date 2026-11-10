/**
 * Test van de gouden les Meten (squla-meten-oppervlakte-1-gouden, "Hoe groot is het?"), 10 november 2026.
 * Gemaakt naar scripts/test-getallenlijn-gouden.mjs (pijl, vanzelf door ±0,7 s, F7, F8, overlap, sprongen, woorden,
 * eindkaart), plus: kiezen bij Bliepo, kies er 2 (tikken + vinkje), op volgorde (slepen of tikken + vinkje), typen in het
 * echte invulvak (met blaadjes aantikken), het samen voordoen (samen tellen, de 2 kaartjes, kaartje 2, de laatste kaart),
 * het hulphandje alleen bij opdrachten (nooit bij kiezen of typen), de 3 vragen die terugkomen, en de vaste zone: het
 * speelvlak blijft links van het tekstvak.
 *
 *   node scripts/test-meten-gouden.mjs                 alle routes
 *   ROUTE=goed,fouten node scripts/test-meten-gouden.mjs
 *   ONTWERP=1 VENSTER=1280x720 ROUTE=allefout node scripts/test-meten-gouden.mjs   overlap en sprongen (faalt erop)
 *   FOTO=map ROUTE=allefout node scripts/test-meten-gouden.mjs                        schermfoto's van elk soort beeld
 *   ZICHTBAAR=1 ECHTESTEM=1 ROUTE=woorden node scripts/test-meten-gouden.mjs   echte stem
 *
 * Speelt de les in Chrome met een LEEG profiel en `?naam=Testkind`, ZONDER koekje van een kind: de les kan dan niets in
 * de voortgang van een kind zetten. Na afloop kijkt het script of er in les_uitkomsten nieuwe regels bijkwamen (de
 * database wordt alleen gelezen); dan stopt het met een foutmelding.
 */

import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LES = process.env.LES ?? "squla-meten-oppervlakte-1-gouden";
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const FOTO = process.env.FOTO ?? null;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));

const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-mt-gouden-"));
const poort = 9860 + (process.pid % 30);
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
  const duur = (t) => 400 + String(t || "").length * 25;
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
    const taak = (window.__phaser?.mtTaak ?? null);
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
  const nu = () => ev(`(() => { const b = document.querySelector('[data-knop="verder"]'); const taak = (window.__phaser?.mtTaak ?? null); return { pijl: !!b && b.getBoundingClientRect().width > 3, tekst: [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean), taak, kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'), t: Math.round(performance.now()) }; })()`);
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
  /* Slepen met een echte muis, langzaam zoals een kind: van het midden van het ding naar een plek in het vlak (punten van 980 × 720). */
  const sleep = async (sel, naar) => {
    const p = await ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => !b.disabled && b.getBoundingClientRect().width > 3); if (!b) return null; const r = b.getBoundingClientRect(); const w = document.querySelector("[data-meten-gouden]").getBoundingClientRect(); const k = w.width / 980; return { x: r.left + r.width / 2, y: r.top + r.height / 2, doel: { x: w.left + ${naar.x} * k, y: w.top + ${naar.y} * k } }; })()`);
    if (!p || !p.doel) return false;
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 1 }, s);
    const stappen = 18;
    for (let i = 1; i <= stappen; i++) {
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x + ((p.doel.x - p.x) * i) / stappen, y: p.y + ((p.doel.y - p.y) * i) / stappen, button: "left", buttons: 1 }, s);
      await wacht(30);
    }
    await wacht(200);
    await stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.doel.x, y: p.doel.y, button: "left", clickCount: 1, buttons: 0 }, s);
    return true;
  };
  /* Een plaatje op volgorde: een echte tik op het plaatje in het Phaser-vlak (de onzichtbare knop van het oude vlak geeft de plek). */
  const tikPlaatje = async (id) => {
    const p = await ev(`(() => { const b = [...document.querySelectorAll('[data-squla-meten] [data-knop="keuzes"] button[data-ding="${id}"]')][0]; if (!b) return null; const r = b.getBoundingClientRect(); return r.width < 3 ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    if (!p) return false;
    await tik(p);
    return true;
  };
  /* Slepen met de muis van het plaatje naar vak i (null = het laatste lege vak). */
  const sleepNaarVak = async (id, i) => {
    const p = await ev(`(() => { const b = [...document.querySelectorAll('[data-squla-meten] [data-knop="keuzes"] button[data-ding="${id}"]')][0]; if (!b) return null; const r = b.getBoundingClientRect(); return r.width < 3 ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    const d = await ev(`(() => { const t = [...document.querySelectorAll("[data-vakplek]")]; const e = t[${i === null ? "t.length - 1" : i}]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; })()`);
    if (!p || !d) return false;
    await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }, s);
    await stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 1 }, s);
    for (let k = 1; k <= 18; k++) {
      await stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x + ((d.x - p.x) * k) / 18, y: p.y + ((d.y - p.y) * k) / 18, button: "left", buttons: 1 }, s);
      await wacht(30);
    }
    await wacht(200);
    await stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: d.x, y: d.y, button: "left", clickCount: 1, buttons: 0 }, s);
    return true;
  };
  return { ev, tik, foto, log, nu, klikTekst, klikPijl, klikKaart, tikDing, eindkaart, meet, typ, toets, sleep, tikPlaatje, sleepNaarVak, sluit: () => stuur("Target.closeTarget", { targetId }).catch(() => {}) };
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
 * `keuze(taak)` geeft het antwoord (standaard het goede). Echte muisklikken (tikDing), slepen met de muis, typen met toetsen.
 */
async function speel(P, o = {}) {
  const keuze = o.keuze ?? ((taak) => taak.goed);
  const tot = Date.now() + (o.maxMs ?? 25 * 60_000);
  let laatsteTaak = null;
  let langste = 0;
  const gefotografeerd = new Set();
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
    const lengte = z.tekst.join(" ").length;
    if (lengte > langste + 20) {
      langste = lengte;
      await P.foto?.(`${o.naam}-langste-stuk`);
    }
    if (z.kaart) {
      let ergst = null;
      for (let i = 0; i < 24; i++) {
        const e = await P.eindkaart();
        if (e && (!ergst || e.onder > ergst.onder)) ergst = e;
        await wacht(250);
      }
      zie(`${o.naam}: eindkaart: ${ergst?.onder ?? "?"} woorden van Bliepo onder de kaart (van ${ergst?.woorden ?? "?"}), regels die de kaart raken: ${ergst?.regels ?? "?"}`);
      if (process.env.ONTWERP && ergst?.onder) fout(`${o.naam}: de eindkaart staat over ${ergst.onder} woorden van Bliepo`);
      if ((await P.nu()).pijl) fout("pijl op de eindkaart");
      await P.foto?.(`${o.naam}-eindkaart`);
      await P.klikKaart();
      zie(`${o.naam}: tot de eindkaart gekomen zonder ooit op de pijl te tikken`);
      return true;
    }
    const taak = z.taak;
    const zonderHand = async () => {
      if (o.vraagWacht && (await P.ev(`!!document.querySelector("[data-hulphand]")`))) fout(`hulphandje bij een vraag (${taak.vraag})`);
    };
    /* Vaste zone (15.30, keuring Meer-minder): het speelvlak (tot x = 927 van 980, kleiner gezet) blijft links van het tekstvak. */
    const zone = async () => {
      const r = await P.ev(`(() => { const v = document.querySelector(".bliepo-vloer-ballon"); const w = document.querySelector("[data-meten-gouden]"); if (!v || !w) return null; const k = w.getBoundingClientRect(); const rechts = k.left + 927 * k.width / 980; const dingen = [...document.querySelectorAll("[data-meten-gouden] [data-ding], [data-meten-gouden] [data-merk], [data-meten-gouden] input, [data-meten-gouden] [data-label]")].map((b) => b.getBoundingClientRect()).filter((b) => b.width > 2).map((b) => b.right); return { vlak: Math.round(rechts - v.getBoundingClientRect().left), ding: dingen.length ? Math.round(Math.max(...dingen) - v.getBoundingClientRect().left) : null }; })()`);
      if (r && (r.vlak > 0 || (r.ding ?? -1) > 0)) fout(`het speelvlak loopt onder het tekstvak (${JSON.stringify(r)}, ${taak.vraag})`);
      globalThis.__zone = r;
    };
    const fotoSoort = async (wat) => {
      if (!FOTO || gefotografeerd.has(wat)) return;
      gefotografeerd.add(wat);
      await wacht(400);
      await P.foto(`${o.naam}-${wat}`);
    };
    const controleerKnop = async () => {
      /* Tik tot het vinkje weg is (het vinkje kan nog even verschuiven als Bliepo het de 1e keer uitlegt). */
      let getikt = false;
      for (let i = 0; i < 60; i++) {
        const er = await P.ev(`!!document.querySelector('[data-knop="controleer"]')`);
        if (!er && getikt) return true;
        if (er) {
          getikt = (await P.tikDing(`[data-knop="controleer"]`)) || getikt;
          if (i > 0 && getikt) globalThis.__vinkjeOpnieuw = (globalThis.__vinkjeOpnieuw ?? 0) + 1;
        }
        await wacht(150);
      }
      if (getikt) return true;
      fout(`geen vinkje (${taak?.vraag})`);
      return false;
    };
    const sleutel = taak ? `${taak.soort}:${taak.vraag}:${taak.poging}:${taak.n}` : null;
    if (taak && ["kies", "twee", "orden", "typ"].includes(taak.soort) && sleutel !== laatsteTaak) {
      laatsteTaak = sleutel;
      const opdracht = taak.soort === "orden";
      await wacht(opdracht ? (o.opdrachtWacht ?? 1200) : (o.vraagWacht ?? 1200));
      const z2 = await P.nu();
      if (z2.pijl && z2.taak?.soort === taak.soort) fout(`pijl bij een vraag of opdracht (${taak.vraag})`);
      if (!opdracht) await zonderHand();
      if (opdracht && o.opdrachtWacht && o.opdrachtWacht > 6500) await handTijd(P, o, "op volgorde");
      await zone();
      await fotoSoort(`${taak.vraag.replace(/-terug$/, "")}-${taak.poging}-vraag`);
      const x = keuze(taak);
      if (taak.soort === "kies") {
        if (!(await P.klikTekst(x))) laatsteTaak = null;
        await wacht(200);
      } else if (taak.soort === "twee") {
        const ids = x.split(",");
        /* Zoals een kind: eerst een ander kaartje, dan van gedachten veranderen (het vinkje gaat weg). */
        if (o.twijfel) {
          const ander = taak.opties.find((y) => !ids.includes(y));
          await P.tikDing(`[data-meten-gouden] button[data-ding="${ander}"]`);
          await wacht(300);
          if (!(await P.ev(`!!document.querySelector('[data-meten-gouden] button[data-ding="${ander}"] [data-vinkje]')`))) fout("geen vinkje op het gekozen kaartje");
          await P.tikDing(`[data-meten-gouden] button[data-ding="${ander}"]`);
          await wacht(300);
          if (await P.ev(`!!document.querySelector('[data-meten-gouden] button[data-ding="${ander}"] [data-vinkje]')`)) fout("het vinkje ging niet weg bij een 2e tik");
        }
        for (const id of ids) {
          if (!(await P.tikDing(`[data-meten-gouden] button[data-ding="${id}"]`))) fout(`kaartje ${id} niet te tikken (${taak.vraag})`);
          await wacht(250);
        }
        await fotoSoort(`${taak.vraag.replace(/-terug$/, "")}-gekozen`);
        await controleerKnop();
        await wacht(200);
      } else if (taak.soort === "orden") {
        const ids = x.split(",");
        let k = 0;
        for (const id of ids) {
          /* De eerste kaart echt slepen naar vak 0 (in punten van het vlak), de rest tikken. */
          const ok = o.sleepKaart && k === 0 ? await P.sleepNaarVak(id, 0) : await P.tikPlaatje(id);
          if (!ok) fout(`plaatje ${id} niet te pakken (${taak.vraag})`);
          k++;
          await wacht(400);
        }
        await fotoSoort(`${taak.vraag.replace(/-terug$/, "")}-gelegd`);
        await controleerKnop();
        await wacht(200);
      } else {
        /* Typen: eerst 2 blaadjes aantikken (zoals een kind dat telt), dan in het vak tikken en typen. */
        if (o.markeer && taak.poging === 1) {
          await P.tikDing(`[data-ding="punt-0"]`);
          await wacht(200);
          await P.tikDing(`[data-ding="punt-1"]`);
          await wacht(200);
          const m = await P.ev(`document.querySelectorAll("[data-merk]").length`);
          if (m < 2) fout(`aantikken bij tellen gaf geen nummers (${m})`);
          await fotoSoort("typ-met-nummers");
        }
        await P.tikDing(`[data-invul]`);
        await P.typ(String(x));
        await wacht(200);
        await controleerKnop();
        await wacht(200);
      }
      if (FOTO && x !== taak.goed) { await wacht(2400); await fotoSoort(`${taak.vraag.replace(/-terug$/, "")}-${taak.poging}-hint`); }
      continue;
    }
    if (taak && ["telSamen", "tweeSamen", "velSamen", "ordenSamen"].includes(taak.soort)) {
      const sl2 = `${taak.soort}:${taak.vraag}:${taak.n}`;
      if (laatsteTaak !== sl2) {
        const nieuw = !String(laatsteTaak).startsWith(`${taak.soort}:${taak.vraag}:`);
        laatsteTaak = sl2;
        await wacht(o.opdrachtWacht && nieuw ? o.opdrachtWacht : 300);
        if ((await P.nu()).pijl) fout(`pijl bij de opdracht ${taak.soort} (${taak.vraag})`);
        if (nieuw && o.opdrachtWacht && o.opdrachtWacht > 6500) await handTijd(P, o, taak.soort);
        if (nieuw) await fotoSoort(`${taak.vraag.replace(/-terug$/, "")}-samen-${taak.soort}`);
        if (nieuw && o.vangnet) {
          zie(`${o.naam}: niets doen bij ${taak.soort} (vangnet na 20 s)`);
          await wacht(21500);
          continue;
        }
        const ok = taak.soort === "ordenSamen" ? await P.sleepNaarVak(taak.goed, null) : await P.tikDing(`[data-meten-gouden] [data-ding="${taak.goed}"]`);
        if (ok) await wacht(o.tikWacht ?? 450);
        else laatsteTaak = null;
        continue;
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
    const acties = l.filter((x) => ["tik", "pijl-getikt", "plaatje", "kies", "markeer"].includes(x.wat)).map((x) => x.t);
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
  const actie = l.filter((x) => ["tik", "pijl-getikt", "plaatje", "kies", "markeer"].includes(x.wat)).map((x) => x.t);
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

const ROUTES = {
  /** De kleur van de getallen in Bliepo's tekst (op de lijn: wit). */
  async kleur(P) {
    const uit = new Set();
    let k = 0;
    const ok = await speel(P, {
      naam: "kleur",
      keuze: (t) => {
        if (t.poging === 1) k++;
        return k === 1 ? fout1(t) : t.goed;
      },
      maxMs: 12 * 60_000,
      bijElkeStap: async () => {
        const kl = await P.ev(`JSON.stringify([...document.querySelectorAll(".bliepo-tekst .getal, .bliepo-tekst [data-eigen]")].map((e) => e.textContent.trim() + "=" + getComputedStyle(e).color))`);
        for (const x of JSON.parse(kl ?? "[]")) uit.add(x.replace(/^\d+=/, "getal="));
      },
    });
    zie(`kleur: ${[...uit].join(", ")}`);
    return ok;
  },
  /** Alles goed, nooit op de pijl tikken; kies er 2: eerst een ander kaartje en weer weg (vinkje); op volgorde: het eerste plaatje slepen; typen: eerst blaadjes aantikken. */
  async goed(P) {
    const ok = await speel(P, { naam: "goed", twijfel: true, sleepKaart: true, markeer: true });
    await controleer(P, "goed");
    const l = await P.log();
    zie(`goed: ${l.filter((x) => x.wat === "vraag" || x.wat === "opdrachtzin").length} vragen en opdrachten; vragen die terugkwamen: ${[...new Set(l.filter((x) => x.wat === "reactie" && /-terug$/.test(x.vraag)).map((x) => x.vraag))].join(", ")}`);
    zie(`goed: zone speelvlak/tekstvak (laatste meting, px voorbij de linkerrand van het tekstvak; negatief = ruimte): ${JSON.stringify(globalThis.__zone)}`);
    return ok;
  },
  /** Afwisselend: 1e fout dan goed; elke 3e vraag 2 keer fout (samen voordoen); 1 keer hetzelfde antwoord 2 keer; in de uitleg een sprong overslaan. */
  async fouten(P) {
    let k = 0;
    const ok = await speel(P, {
      naam: "fouten",
      overslaan: true,
      keuze: (t) => {
        if (t.poging === 1) k++;
        if (k % 3 === 0) return t.poging === 1 ? fout1(t) : k % 2 === 0 ? fout1(t) : fout2(t);
        return t.poging === 1 && k % 3 === 1 ? fout1(t) : t.goed;
      },
      markeer: true,
      maxMs: 30 * 60_000,
    });
    await controleer(P, "fouten");
    const l = await reacties(P);
    zie(`fouten: ${l.filter((x) => x.wat === "reactie" && x.soort === "fout1").length} hints na een 1e fout, ${l.filter((x) => x.wat === "reactie" && x.soort === "fout2").length} keer samen voordoen`);
    return ok;
  },
  /** Alles fout (2 keer per vraag): elke vraag samen voordoen; de les stopt nooit. */
  async allefout(P) {
    const ok = await speel(P, { naam: "allefout", keuze: (t) => (t.poging === 1 ? fout1(t) : fout2(t)), maxMs: 40 * 60_000 });
    await controleer(P, "allefout");
    await reacties(P);
    return ok;
  },
  /** Elk ander fout antwoord (fout2 bij de 1e poging), zodat elke rij van de fouttabel een keer voorkomt (samen met allefout). */
  async anderefout(P) {
    const ok = await speel(P, { naam: "anderefout", keuze: (t) => (t.poging === 1 ? fout2(t) : t.goed), maxMs: 25 * 60_000 });
    await reacties(P);
    return ok;
  },
  /** Vangnet: 2 keer fout, en bij de kleine stap niets doen; na 20 s doet Bliepo het zelf (zonder "Ja"). */
  async vangnet(P) {
    let k = 0;
    const ok = await speel(P, { naam: "vangnet", vangnet: true, keuze: (t) => (k++ < 4 ? fout1(t) : t.goed), maxMs: 20 * 60_000 });
    const l = await P.log();
    zie(`vangnet: ${l.filter((x) => x.wat === "vangnet").length} keer deed Bliepo de stap zelf; zinnen erna: ${l.filter((x) => x.wat === "pijl-door" && /Kijk, /.test(x.zin)).map((x) => x.zin).join(" | ")}`);
    if (l.some((x, i) => x.wat === "vangnet" && /^Ja/.test(l.slice(i).find((y) => y.wat === "pijl-door")?.zin ?? ""))) fout("na het vangnet zegt Bliepo 'Ja'");
    return ok;
  },
  /** Lang wachten: bij kiezen 9 s (geen handje, geen zin), bij opdrachten 7,2 s (wel het handje). */
  async wachten(P) {
    let k = 0;
    const ok = await speel(P, { naam: "wachten", vraagWacht: 9000, opdrachtWacht: 7200, keuze: (t) => (k++ < 3 ? fout1(t) : t.goed), maxMs: 35 * 60_000 });
    const l = await P.log();
    const zinnenTijdensVraag = [];
    for (let i = 0; i < l.length; i++) if (l[i].wat === "vraag-klaar" && l.slice(0, i).reverse().find((x) => x.wat === "vraag" || x.wat === "opdrachtzin")?.wat === "vraag") { const tik = l.slice(i + 1).find((x) => x.wat === "tik" || x.wat === "kies"); const tussen = l.slice(i + 1, l.indexOf(tik)).filter((x) => /pijl-door|aanwijzing/.test(x.wat)); if (tussen.length) zinnenTijdensVraag.push(tussen.map((x) => x.wat).join(",")); }
    zie(`wachten: bij keuzevragen kwam er ${zinnenTijdensVraag.length} keer iets tijdens het wachten (moet 0); aanwijzingen bij opdrachten: ${l.filter((x) => x.wat === "aanwijzing").length}`);
    if (zinnenTijdensVraag.length) fout("Bliepo zei iets tijdens het wachten bij een vraag");
    await controleer(P, "wachten");
    return ok;
  },
  /** Tik op de pijl tijdens het praten: de stem stopt en het volgende stuk komt meteen; met een echte muisklik. */
  async "tik-door"(P) {
    const metingen = [];
    for (let n = 0; n < 5; n++) {
      for (let i = 0; i < 400 && !((await P.nu())?.pijl && (await P.ev(`!!document.querySelector(".bliepo-tekst-nog")`))); i++) {
        const z = await P.nu();
        if (z?.taak?.soort === "kies") await P.klikTekst(z.taak.goed);
        if (z?.taak?.soort === "twee") { for (const id of z.taak.goed.split(",")) await P.tikDing(`[data-meten-gouden] button[data-ding="${id}"]`); await P.tikDing(`[data-knop="controleer"]`); }
        if (z?.taak?.soort === "orden") { for (const id of z.taak.goed.split(",")) { await P.tikPlaatje(id); await wacht(300); } await P.tikDing(`[data-knop="controleer"]`); }
        if (z?.taak?.soort === "typ") { await P.tikDing(`[data-invul]`); await P.typ(z.taak.goed); await P.tikDing(`[data-knop="controleer"]`); }
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
    const ok = await speel(P, { naam: "woorden", keuze: (t) => (k++ % 4 === 1 && t.poging === 1 ? fout1(t) : t.goed), maxMs: Number(process.env.WOORDEN_MS ?? 25 * 60_000) });
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

const kies = process.env.ROUTE ? process.env.ROUTE.split(",") : Object.keys(ROUTES);
for (const r of kies) {
  console.log(`\n${r}`);
  uitslag.push(`\n${r}`);
  const P = await pagina();
  try {
    await ROUTES[r](P);
  } catch (e) {
    fout(`${r}: ${e.message}`);
  }
  await P.sluit();
}

const nieuw = sql(`select count(*) from les_uitkomsten where id > ${startId};`);
console.log(`\nNieuwe regels in les_uitkomsten: ${nieuw} (hoogste id was ${startId})`);
if (Number(nieuw) > 0) fout("er kwamen regels bij in les_uitkomsten");
console.log(fouten ? `\n${fouten} FOUT(EN)` : "\nAlles in orde.");
process.exit(fouten ? 1 : 0);
