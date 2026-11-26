/**
 * Speelcontrole (28 oktober 2026, opdracht eigenaar): kan een kind elke les
 * van begin tot eind spelen, zonder ergens vast te zitten?
 *
 *   npm run speel                       alle groep 3-lessen, lokaal
 *   LESSEN=tellen-120-doortellen npm run speel
 *   ALLEFOUT=1 LESSEN=... npm run speel   elk antwoord fout (de tweede fout: uitleg en door, de les stopt niet)
 *   ALLEEN=klok-,verhaal- npm run speel
 *   BASIS=https://… WW=… npm run speel  de echte site
 *
 * Elke les wordt in Chrome zonder venster vanzelf gespeeld (Bliepo praat
 * versneld). De speler tikt wat een kind kan tikken: de pijl, het vinkje, een
 * keuze (afwisselend goed, fout en "weet ik niet"), een getal typen, de kaart.
 *
 * Een les FAALT als:
 *   - er na Bliepo's zin langer dan 5 seconden niets te tikken is (geen knop,
 *     geen keuze, geen invoerveld, en ook geen tekening om in te tikken);
 *   - de zin naar knoppen verwijst die er niet zijn ("tik op ja of nee" zonder
 *     Ja en Nee, "het vraagteken" zonder Weet ik niet, "de pijl" zonder pijl);
 *   - de les niet binnen de tijd tot het eind komt (kaart of "Nog een keer").
 * Een stap waar alleen in de tekening getikt of gesleept kan worden en die de
 * speler niet zelf kan doen, staat erbij als "kan niet automatisch" (geen
 * fout, wel even zelf nakijken).
 *
 * Stopt met een foutmelding als er iets faalt (zit in npm run bewaak en in
 * npm run online).
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kiesLessen } from "./lessenkeuze.mjs";
import { korteDubbel, opnameDubbel } from "./dubbel-controle.mjs";
import { DUBBELE_TEKST_METER, dubbeleTekstFouten } from "./dubbele-tekst-controle.mjs";
import { onthoudGoed, zonderAlGoed } from "./controlegeheugen.mjs";
import { ZWEEF_METER } from "./zweef-controle.mjs";
import { VRAAG_METER, telFouten, vraagFouten } from "./vraag-aanwezig-controle.mjs";

/* F7-meter (10 nov 2026): de tekst van Bliepo en de pijl elke 100 ms, en elke tik. */
const F7_METER = `
  window.__f7 = []; window.__f7tik = []; window.__f8 = []; window.__stemSpeel = []; let vorige = "";
  /* F8 (Sara, 10 nov 2026): elke gestarte uiting van de browserstem, om dubbel uitspreken te vinden. */
  if (window.speechSynthesis) { const sp = window.speechSynthesis.speak.bind(window.speechSynthesis); window.speechSynthesis.speak = (u) => { window.__f8.push({ t: Math.round(performance.now()), z: u.text }); return sp(u); }; }
  document.addEventListener("click", () => window.__f7tik.push(Math.round(performance.now())), true);
  document.addEventListener("pointerdown", () => window.__f7tik.push(Math.round(performance.now())), true);
  setInterval(() => {
    const b = document.querySelector('[data-knop="verder"]');
    const pijl = !!b && b.getBoundingClientRect().width > 3;
    const tekst = [...document.querySelectorAll(".bliepo-tekst")].map((e) => e.textContent.replace(/\\s+/g, " ").trim()).filter(Boolean);
    const k = JSON.stringify([pijl, tekst]);
    if (k !== vorige) { vorige = k; window.__f7.push({ t: Math.round(performance.now()), pijl, tekst }); }
  }, 100);
`;
const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const kop = process.env.WW ? { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } : {};
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_MS = Number(process.env.MAXMIN ?? 7) * 60_000;
const TEGELIJK = Number(process.env.TEGELIJK ?? 4);
/* SCHERMFOTO=map: van elk scherm waar het kind iets moet doen een schermfoto (voor de schermencontrole). */
const FOTOMAP = process.env.SCHERMFOTO ?? null;
const APPARAAT = process.env.APPARAAT === "telefoon" ? { b: 390, h: 844, mobiel: true } : process.env.APPARAAT === "tablet" ? { b: 820, h: 1180, mobiel: true } : { b: 1440, h: 900, mobiel: false };

const lessen = kiesLessen;

const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));

let poortTeller = 0;
/* Alle gestarte Chromes: bij stoppen (ook Ctrl-C of kill) altijd opruimen, anders blijven ze de laptop belasten. */
const ALLE_CHROMES = new Set();
const ruimOp = () => ALLE_CHROMES.forEach((p) => p.kill("SIGKILL"));
process.on("exit", ruimOp);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => process.exit(130));
async function startChrome() {
  const map = mkdtempSync(join(tmpdir(), "speelcontrole-"));
  const poort = 9450 + (process.pid % 40) * 8 + (poortTeller++ % 8);
  /* ZICHTBAAR=1: Chrome met een venster (om mee te kijken); anders zonder venster. */
  const proces = spawn(CHROME, [...(process.env.ZICHTBAAR ? ["--new-window", "--window-size=1440,1000", "--no-default-browser-check"] : ["--headless=new"]), `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
  ALLE_CHROMES.add(proces);
  for (let i = 0; i < 50; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json());
      return { url: v.webSocketDebuggerUrl, stop: () => (proces.kill(), setTimeout(() => { try { rmSync(map, { recursive: true, force: true, maxRetries: 5 }); } catch {} }, 1500)) };
    } catch {
      await wacht(200);
    }
  }
  proces.kill();
  throw new Error("Chrome start niet.");
}

function verbind(url) {
  const ws = new WebSocket(url);
  let n = 0;
  const wachtend = new Map();
  const luisteraars = new Set();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.method) for (const f of luisteraars) f(m);
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
  return new Promise((res) => ws.addEventListener("open", () => res({ stuur, sluit: () => ws.close(), op: (f) => (luisteraars.add(f), () => luisteraars.delete(f)) })));
}

/* Bliepo praat versneld: elke zin duurt een fractie van een seconde. */
const SNEL = `
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); t.dispatchEvent(new Event("ended")); }, 80); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 80); }, 20);
`;

/* TRAAGSTEM=1: Bliepo praat in gewoon tempo (nepstem zonder geluid: 0,4 s plus 25 ms per letter), om de les te zien zoals een kind hem ziet. */
const TRAAG = `
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1500); }, 80); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 400 + String(u.text || "").length * 25); }, 20);
`;

/* Wat er nu in beeld staat en wat een kind kan tikken. */
const STAAT = `(() => {
  const zichtbaar = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; const cs = getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.15; };
  const tekst = [...document.querySelectorAll(".bliepo-tekst, .les-tekst p")].map((e) => e.textContent).join(" ").replace(/\\s+/g, " ").trim();
  const knoppen = [...document.querySelectorAll("button, a[href], input, button[data-plek], [data-zin], [data-getal], [data-signaal], [data-ding]")]
    .filter((b) => zichtbaar(b) && !b.disabled)
    .filter((b) => !b.closest("nextjs-portal"))
    .map((b) => ({ wolk: !!b.querySelector(".bliepo-tekst"), k: b.getAttribute("data-knop") || "", t: (b.getAttribute("aria-label") || b.textContent || b.tagName).trim().replace(/\\s+/g, " ").slice(0, 40), tag: b.tagName }))
    .filter((b) => !/^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Houd ingedrukt|Open Next|Geluidjes aan|Lees de keuzes voor)/i.test(b.t) && !/mic|praat/i.test(b.k));
  return {
    tekst,
    knoppen,
    praat: !!document.querySelector('[data-praat="true"]') || [...document.querySelectorAll(".bliepo-tekst-nog")].length > 0,
    /* Eindscherm (25 nov 2026): geen knoppen meer; het einde is de leerzin op het eindscherm (de les gaat daarna vanzelf terug, behalve met ?blijf=1). */
    klaar: !!document.querySelector('[data-eindscherm] [data-eind-leerzin]'),
    eind: !!document.querySelector("[data-eindscherm]"),
    /* Proef eindscherm: de sleutelteller en een vliegend sleuteltje raken niets (knop, tekst van Bliepo, fruit, de balk). */
    teller: (() => {
      const eigen = [...document.querySelectorAll("[data-sleutelteller], [data-vliegende-sleutel]")].filter(zichtbaar);
      if (!eigen.length) return null;
      const vakken = [];
      for (const el of document.querySelectorAll("button, a[href], [data-ding], [data-knop], [data-cel], [data-lijst], [data-voortgangsbalk], img, svg")) {
        if (eigen.some((e) => e === el || e.contains(el) || el.contains(e)) || !zichtbaar(el)) continue;
        const q = el.getBoundingClientRect();
        if (q.width > innerWidth * 0.6 && q.height > 200) continue;
        vakken.push({ q, n: (el.getAttribute("aria-label") || el.getAttribute("data-knop") || el.className?.baseVal || el.className || el.tagName).toString().slice(0, 40) });
      }
      /* Tekst: alleen waar echt letters staan (een tekstblok is breder dan zijn zin). */
      for (const el of document.querySelectorAll(".bliepo-tekst")) {
        if (!zichtbaar(el)) continue;
        const r = document.createRange();
        r.selectNodeContents(el);
        for (const q of r.getClientRects()) if (q.width > 2) vakken.push({ q, n: "tekst: " + el.textContent.trim().slice(0, 30) });
      }
      for (const e of eigen) {
        const r = e.getBoundingClientRect();
        /* Een kleine marge binnenin: de zachte rand van het plaatje telt niet. */
        const a = { l: r.left + 6, r: r.right - 6, t: r.top + 6, b: r.bottom - 6 };
        for (const { q, n } of vakken) if (q.left < a.r && q.right > a.l && q.top < a.b && q.bottom > a.t) return (e.hasAttribute("data-sleutelteller") ? "teller raakt " : "sleuteltje raakt ") + n;
      }
      return "";
    })(),
    kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'),
    /* Voortgangsbalk (BOUWREGELS 15.54): de stand en of hij iets raakt (knop, tekst, plaatje). */
    balk: (() => {
      const b = document.querySelector("[data-voortgangsbalk]");
      if (!b) return null;
      const r = b.getBoundingClientRect();
      let raakt = null;
      for (const el of document.querySelectorAll("button, [data-ding], [data-knop], .bliepo-tekst, .les-tekst p, img, [class*=sombalk] > *")) {
        if (b.contains(el) || !zichtbaar(el)) continue;
        const q = el.getBoundingClientRect();
        if (q.width > r.width * 0.9 && q.height > 200) continue;
        if (q.left < r.right + 2 && q.right > r.left - 2 && q.top < r.bottom + 2 && q.bottom > r.top - 2) { raakt = (el.getAttribute("aria-label") || el.className || el.tagName).toString().slice(0, 40); break; }
      }
      return { v: Number(b.getAttribute("data-voortgang")), raakt };
    })(),
    canvas: [...document.querySelectorAll("canvas")].some((c) => zichtbaar(c) && c.width > 200),
    /* De klokles zet het goede antwoord van een keuze in klokTaak.goed. */
    antwoord: window.__phaser?.antwoord ?? (window.__phaser?.klokTaak?.soort === "kies" ? window.__phaser.klokTaak.goed : null) ?? null,
  };
})()`;

/* Verwijst de zin naar knoppen die er niet zijn? */
function ontbreekt(z) {
  const t = z.tekst.toLowerCase();
  const heeft = (f) => z.knoppen.some(f);
  const fouten = [];
  if (/\bja of nee\b/.test(t) && !(heeft((b) => /^ja\b/i.test(b.t)) && heeft((b) => /^nee\b/i.test(b.t)))) fouten.push("de zin zegt 'ja of nee', maar Ja en Nee staan er niet");
  if (/vraagteken/.test(t) && !/vraagteken (staat|is|in de som)|(zin|zinnen) met (het|een) vraagteken|eindigt met (het|een) vraagteken|staat het vraagteken|het vraagteken aan het eind/.test(t) && !heeft((b) => b.k === "weetniet" || /weet ik (het )?niet|hulp/i.test(b.t) || b.t === "?")) fouten.push("de zin noemt het vraagteken, maar 'Weet ik niet' staat er niet");
  if (/tik (dan )?op de pijl|op de blauwe pijl/.test(t) && !heeft((b) => b.k === "verder")) fouten.push("de zin noemt de pijl, maar de pijl staat er niet");
  return fouten;
}

let naTeller = 0;
async function speel(c, id) {
  const { targetId } = await c.stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await c.stuur("Target.attachToTarget", { targetId, flatten: true });
  const ev = async (e) => {
    const r = await c.stuur("Runtime.evaluate", { expression: e, returnByValue: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const klik = (filter) => ev(`(() => { const b = [...document.querySelectorAll("button, a[href], button[data-plek], [data-zin], [data-getal], [data-signaal], [data-ding]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled && b.getAttribute("aria-disabled") !== "true" && !/^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Geluidjes aan|Lees de keuzes voor)/i.test(b.getAttribute("aria-label") || b.textContent.trim()); }).find(${filter}); if (!b) return false; if (b.click) b.click(); else b.dispatchEvent(new MouseEvent("click", { bubbles: true })); return ${process.env.DEBUG ? "b.outerHTML.slice(0, 200)" : "true"}; })()`).then(async (r) => {
    if (r && process.env.DEBUG) console.log("  tik:", r);
    /* NAKLIK=ms: kort na elke tik een schermfoto (om de gloed van goed/fout te zien); alleen met SCHERMFOTO. */
    if (r && FOTOMAP && process.env.NAKLIK) {
      await wacht(Number(process.env.NAKLIK));
      const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 80 }, s);
      mkdirSync(join(FOTOMAP, id), { recursive: true });
      const nr = String(++naTeller).padStart(3, "0");
      writeFileSync(join(FOTOMAP, id, `na-${nr}.jpg`), Buffer.from(data, "base64"));
    }
    return r;
  });
  const fouten = new Set();
  let balkStaat = null;
  const handmatig = new Set();
  let stappen = 0;
  let einde = false;
  let stemAf = null;
  const stemTel = { gevraagd: 0, ruth: 0 };
  try {
    await c.stuur("Page.enable", {}, s);
    await c.stuur("Network.enable", {}, s);
    /* CONSOLE=1: fouten van de pagina meteen tonen (voor het zoeken naar de oorzaak van een vastgelopen les). */
    if (process.env.CONSOLE) {
      await c.stuur("Runtime.enable", {}, s);
      c.op((m) => {
        if (m.sessionId !== s) return;
        if (m.method === "Runtime.exceptionThrown") console.log("  FOUT:", (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").split("\n").slice(0, 3).join(" | "));
        if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") console.log("  console.error:", m.params.args.map((x) => x.value ?? x.description ?? "").join(" ").slice(0, 300));
      });
    }
    /* KIND_ID=<id van Testkind>: speel als dat kind (koekje van het apparaat), zodat de les de uitkomsten per vraag in de database bewaart. Zonder KIND_ID wordt er niets bewaard. */
    if (process.env.KIND_ID) await c.stuur("Network.setCookie", { name: "thuisles_kind", value: process.env.KIND_ID, url: BASIS }, s);
    if (process.env.WW) await c.stuur("Network.setExtraHTTPHeaders", { headers: kop }, s);
    await c.stuur("Emulation.setDeviceMetricsOverride", { width: APPARAAT.b, height: APPARAAT.h, deviceScaleFactor: 1, mobile: APPARAAT.mobiel }, s);
    /*
      STEM=1: met de echte stem (niet versneld). Dan wordt elke vraag om een zin
      (/api/stem) gevolgd: een zin zonder bewaarde audio van Ruth (404) is een fout,
      want in de nagebouwde lessen is er geen browserstem meer.
    */
    if (process.env.STEM) {
      const vragen = new Map();
      stemAf = c.op((m) => {
        if (m.sessionId !== s) return;
        if (m.method === "Network.requestWillBeSent" && m.params.request.url.includes("/api/stem?zin=")) vragen.set(m.params.requestId, decodeURIComponent(new URL(m.params.request.url).searchParams.get("zin") ?? ""));
        if (m.method === "Network.responseReceived" && vragen.has(m.params.requestId)) {
          const zin = vragen.get(m.params.requestId);
          stemTel.gevraagd++;
          if (m.params.response.status === 404) fouten.add(`geen stem van Ruth voor: "${zin.slice(0, 70)}"`);
          else if (m.params.response.status < 400) stemTel.ruth++;
        }
      });
    } else await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: process.env.TRAAGSTEM ? TRAAG : SNEL }, s);
    /*
      F7=1 (Sara, 10 november 2026; FOUTEN-VOORBEELDEN.md F7): meet elke 100 ms de tekst van Bliepo en of de pijl er staat,
      en noteer elke tik. Komt dezelfde tekst terug nadat hij weg was, zonder dat er ertussen getikt is, dan is dat fout F7.
    */
    if (process.env.F7) await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: F7_METER }, s);
    /* F11 (17 nov 2026, 15.31): bij elke gouden les: staat dezelfde tekst ooit 2 keer tegelijk op het scherm? */
    const f11 = id.includes("gouden") || !!process.env.F11;
    if (f11) await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: DUBBELE_TEKST_METER }, s);
    /* F16 (18 nov 2026, 15.37): bij elke gouden les: wacht de les op het kind, dan staat er een vraag of opdracht in beeld (scripts/vraag-aanwezig-controle.mjs). */
    const f16 = id.includes("gouden") || !!process.env.F16;
    if (f16) await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: VRAAG_METER }, s);
    let f16Fotos = 0;
    /* F14 (18 nov 2026, 15.34): in de gouden les Rekentaal zweeft niets: elk voorwerp staat OP zijn ondergrond (scripts/zweef-controle.mjs). */
    const zweefMeter = id === "squla-rekentaal-gouden" || !!process.env.ZWEEF;
    if (zweefMeter) await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: ZWEEF_METER }, s);
    /* METER=1 (20 nov 2026, BOUWREGELS 15.51): meet de pijl, het afbreken van de stem en het vanzelf doorgaan na goed (scripts/bliepo-gedrag-meter.js). */
    if (process.env.METER) await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: readFileSync(new URL("./bliepo-gedrag-meter.js", import.meta.url), "utf8") }, s);
    if (process.env.VIAOVERZICHT) {
      /* VIAOVERZICHT=1: zoals een kind, via een echte klik in het lesoverzicht (public/alle-lessen.html; 15.38 punt 1). */
      await c.stuur("Page.navigate", { url: `${BASIS}/alle-lessen.html` }, s);
      let p = null;
      for (let i = 0; i < 50 && !p; i++) {
        await wacht(200);
        p = await ev(`(() => { const a = document.querySelector('a[href^="/voorbeeld/les/${id}?"]'); if (!a) return null; a.scrollIntoView({ block: "center" }); const r = a.getBoundingClientRect(); return { x: Math.round(r.left + Math.min(20, r.width / 2)), y: Math.round(r.top + r.height / 2) }; })()`);
      }
      if (!p) throw new Error(`les ${id} staat niet in het lesoverzicht`);
      await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1 }, s);
      await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1 }, s);
    } else await c.stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${id}?naam=Testkind&blijf=1` }, s);
    const begin = Date.now();
    let stilSinds = null;
    let vorigeTekst = "";
    let tekstSinds = Date.now();
    let laatsteTik = 0;
    const zinnen = new Set();
    const gefotografeerd = new Set();
    /* Getekende stappen: tikken op de klok, wijzers slepen, een getal in een rooster. */
    const pogingen = new Map();
    const tikPunt = async (p) => {
      await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1 }, s);
      await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1 }, s);
    };
    const sleep = async (van, naar) => {
      await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: van.x, y: van.y, button: "left", clickCount: 1 }, s);
      for (let i = 1; i <= 14; i++) {
        await c.stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: van.x + ((naar.x - van.x) * i) / 14, y: van.y + ((naar.y - van.y) * i) / 14, button: "left", buttons: 1 }, s);
        await wacht(25);
      }
      await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: naar.x, y: naar.y, button: "left", clickCount: 1 }, s);
    };
    /*
      De extra gouden lessen (Plussommen extra, Splitsen extra, Tellen extra; 19 nov 2026, opdracht Sara): de les zegt in
      window.__phaser.telTaak wat het kind moet doen (soort tel/maak/pak/auto) en in window.__phaser.antwoord de goede
      volgende tik ("tegel-3", "plus-1", "cel-4"). De speler doet dat met een ECHTE muisklik op de plek in het beeld
      (mousemove, indrukken, loslaten), zoals een kind, ook in het Phaser-beeld (tegels: window.__phaser.tegelPunt(n) en
      roosterPunt()). Ligt er iets anders boven de plek, dan is dat een fout. Met ALLEFOUT: zoals scripts/extra-test-hulp.mjs
      (bij een opdracht met vinkje meteen het vinkje zonder iets te maken; bij het aanvullen van een som een foute tegel);
      de overige stappen goed, want daar is geen fout antwoord mogelijk. Geeft null als het geen extra-les-stap is.
    */
    const tikMuis = async (p) => {
      await c.stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }, s);
      await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 1 }, s);
      await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x, y: p.y, button: "left", clickCount: 1, buttons: 0 }, s);
    };
    /* Een echte klik midden op het eerste zichtbare element dat bij de kiezer past; meldt als er iets anders boven ligt. */
    const tikOpElement = async (kiezer) => {
      const p = await ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(kiezer)})].find((b) => !b.disabled && b.getBoundingClientRect().width > 3); if (!b) return null; const r = b.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === b || b.contains(e)), wat: e ? (e.getAttribute("aria-label") || String(e.className || "") || e.tagName).slice(0, 60) : null }; })()`);
      if (!p) return false;
      if (!p.raak) fouten.add(`iets anders ligt boven ${kiezer}: ${p.wat}`);
      await tikMuis(p);
      return true;
    };
    /* Een tegel pakken en op het veld zetten. Een tegel heeft een vorm (een L heeft een leeg hoekje): eerst het midden, dan punten ernaast, tot de les de tegel meldt. */
    const tikTegel = async (n) => {
      const nr = () => ev(`window.__phaser?.telTaak?.n ?? -1`);
      const voor = await nr();
      for (const [dx, dy] of [[0, 0], [24, 24], [-24, 24], [24, -24], [-24, -24], [0, 24], [24, 0], [0, -24], [-24, 0]]) {
        const a = await ev(`window.__phaser?.tegelPunt?.(${n}) ?? null`);
        const r = await ev(`window.__phaser?.roosterPunt?.() ?? null`);
        if (!a || !r) return false;
        await tikMuis({ x: a.x + dx, y: a.y + dy });
        await wacht(200);
        await tikMuis(r);
        await wacht(300);
        if ((await nr()) !== voor) return true;
      }
      return false;
    };
    const extraGedaan = new Set();
    const extraStap = async () => {
      /* Verbinden in de gouden les Plussommen (window.__phaser.plusTaak, soort "verbind"): een echte klik op de som en dan
         op het antwoord (het vlak luistert naar de muis, een b.click() doet daar niets). ALLEFOUT: bij elke som het eerste
         foute antwoord (plusTaak.fout). Alles verbonden: wachten, de les kijkt na na een korte rust. */
      const v = await ev(`(() => { const t = window.__phaser?.plusTaak; if (!t || t.soort !== "verbind") return null; return { goed: t.goed ?? {}, fout: t.fout ?? {}, klaar: t.klaar ?? 0, antwoord: window.__phaser?.antwoord ?? null }; })()`);
      if (v) {
        const a = v.antwoord != null ? String(v.antwoord) : null;
        if (!a) return true;
        let doel = a;
        if (process.env.ALLEFOUT && !a.startsWith("s")) {
          /* Elke som het goede antwoord van de volgende som: allemaal fout én allemaal verschillend (met plusTaak.fout kreeg
             soms 2 sommen hetzelfde antwoord; dan haalt de les de oude lijn weg en bleef de speler rondgaan). */
          const sommen = Object.keys(v.goed);
          const i = sommen.findIndex((k) => v.goed[k] === a);
          if (i >= 0 && sommen.length > 1) doel = v.goed[sommen[(i + 1) % sommen.length]];
          else if (i >= 0 && v.fout[sommen[i]]) doel = v.fout[sommen[i]];
        }
        return (await tikOpElement(`[data-ding="${doel}"]`)) || true;
      }
      const t = await ev(`(() => { const t = window.__phaser?.telTaak; if (!t || !["tel", "maak", "pak", "auto"].includes(t.soort)) return null; const c = document.querySelector('[data-knop="controleer"]'); return { soort: t.soort, goed: t.goed ?? null, vraag: String(t.vraag ?? ""), poging: t.poging ?? 1, n: t.n, antwoord: window.__phaser?.antwoord ?? null, controleer: !!c && !c.disabled && c.getBoundingClientRect().width > 3 }; })()`);
      if (!t) return null;
      if (process.env.DEBUG) console.log("  extra:", JSON.stringify(t));
      const alleFout = !!process.env.ALLEFOUT;
      /* Opdracht met vinkje, fout: meteen het vinkje zonder iets te maken (1 keer per poging). */
      if (alleFout && t.soort === "maak") {
        const sleutel = `maak-${t.n}`;
        if (!extraGedaan.has(sleutel) && t.controleer) {
          extraGedaan.add(sleutel);
          return tikOpElement('[data-knop="controleer"]');
        }
        if (extraGedaan.has(sleutel)) return true;
      }
      /* Een som aanvullen met tegels, fout: een andere tegel dan de goede. */
      if (alleFout && t.soort === "pak" && t.goed && /^(samen7|samen10|manier10)-/.test(t.vraag)) {
        const sleutel = `pak-${t.n}`;
        if (!extraGedaan.has(sleutel)) {
          extraGedaan.add(sleutel);
          if (await tikTegel(Number(t.goed) === 1 ? 2 : 1)) return true;
        }
      }
      const a = t.antwoord != null ? String(t.antwoord) : null;
      if (a?.startsWith("tegel-")) return tikTegel(Number(a.slice(6)));
      if (a && (await tikOpElement(`[data-ding="${a}"]`))) return true;
      if (!a && t.soort === "pak") return tikTegel(1);
      if (!a && t.controleer) return tikOpElement('[data-knop="controleer"]');
      /* Niets te doen (de som is af en de les gaat zo vanzelf door, of het vinkje komt nog): wachten. Niet op een andere
         knop in de tekening tikken: dat maakt de stap weer ongedaan (Splitsen extra: + en dan weer −). */
      return true;
    };
    /* Een plek op de klok tussen twee getallen (uur 8.5 = tussen de 8 en de 9). */
    const klokPunt = async (uur) => {
      const a = await ev(`window.__phaser?.klokGetal?.(${((Math.floor(uur) + 11) % 12) + 1}) ?? null`);
      const b = await ev(`window.__phaser?.klokGetal?.(${(Math.floor(uur) % 12) + 1}) ?? null`);
      if (!a || !b) return null;
      const f = uur - Math.floor(uur);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    };
    /* Nederlandse tijd uit de zin: "5 uur", "half 9", "kwart over 3", "10 over 4", "5 voor half 3". */
    const tijdUit = (t) => {
      let m;
      if ((m = /kwart over (\d{1,2})/i.exec(t))) return { u: +m[1], min: 15 };
      if ((m = /kwart voor (\d{1,2})/i.exec(t))) return { u: +m[1] - 1, min: 45 };
      if ((m = /(\d{1,2}) voor half (\d{1,2})/i.exec(t))) return { u: +m[2] - 1, min: 30 - +m[1] };
      if ((m = /(\d{1,2}) over half (\d{1,2})/i.exec(t))) return { u: +m[2] - 1, min: 30 + +m[1] };
      if ((m = /half (\d{1,2})/i.exec(t))) return { u: +m[1] - 1, min: 30 };
      if ((m = /\b(\d{1,2}) over (\d{1,2})/i.exec(t))) return { u: +m[2], min: +m[1] };
      if ((m = /\b(\d{1,2}) voor (\d{1,2})/i.exec(t))) return { u: +m[2] - 1, min: 60 - +m[1] };
      if ((m = /\b(\d{1,2}):(\d{2})\b/.exec(t))) return { u: +m[1], min: +m[2] };
      if ((m = /\b(\d{1,2}) uur\b/i.exec(t))) return { u: +m[1], min: 0 };
      return null;
    };
    const canvasStap = async (z, soort) => {
      /* De extra gouden lessen (19 nov 2026, opdracht Sara): tikken in de tekening met een echte muisklik, zoals een kind. */
      {
        const r = await extraStap();
        if (r !== null) return r;
      }
      /* Splitsen 1 (s1): dingen of tegels naar vakken slepen; het vlak zegt zelf wat de volgende sleep is. */
      {
        let gedaan = false;
        for (let k = 0; k < 40; k++) {
          const stap = await ev(`window.__phaser?.s1Stap?.(${JSON.stringify(soort === "fout" ? "fout" : "goed")}) ?? null`);
          if (!stap) break;
          await sleep(stap.van, stap.naar);
          await wacht(150);
          gedaan = true;
        }
        if (gedaan) return true;
      }
      /* Knikkers over bakjes slepen (squla-splits-delen-1): goed = om en om over de bakjes, fout = alles in het eerste bakje. */
      /* Tegels, sommen of een ster slepen naar een vak (Splitsen 2 en Delen, s2): het scherm zegt zelf wat de eerstvolgende sleep is. */
      const s2 = await ev(`window.__phaser?.s2Stap?.(${JSON.stringify(soort)}) ?? null`);
      if (s2) {
        await sleep(s2.van, s2.naar);
        await wacht(150);
        return true;
      }
      const verdeel = await ev(`window.__phaser?.sleepKlaar?.() ?? null`);
      if (verdeel?.los?.length) {
        const k = verdeel.bakken.length;
        for (let i = 0; i < verdeel.los.length; i++) {
          const nu = await ev(`window.__phaser?.sleepKlaar?.() ?? null`);
          if (!nu?.los?.length) break;
          await sleep(nu.los[0], nu.bakken[soort === "fout" ? 0 : i % k]);
          await wacht(120);
        }
        return true;
      }
      if (soort === "weetniet") return false;
      const taakNr = await ev(`window.__phaser?.klokTaak?.n ?? ""`);
      const sleutel = z.tekst + "|" + taakNr;
      const n = (pogingen.get(sleutel) ?? 0) + 1;
      pogingen.set(sleutel, n);
      if (n > 3) return false;
      const controleer = async () => {
        await wacht(300);
        await klik(`(b) => b.hasAttribute("data-controleer") || b.getAttribute("data-knop") === "controleer"`);
      };
      /* "Tik op (de) N": een getal-knop, of een getal op de klok. */
      const getal = /tik (?:dan )?op (?:de )?\{?(\d{1,3})\}?\b/i.exec(z.tekst)?.[1];
      if (getal) {
        if (await klik(`(b) => b.getAttribute("data-getal") === ${JSON.stringify(getal)}`)) return true;
        const punt = await ev(`window.__phaser?.klokGetal?.(${getal}) ?? null`);
        if (punt) {
          await tikPunt(punt);
          await controleer();
          return true;
        }
      }
      /* "Begin bij X (en) tel N verder/terug". */
      const tel = /begin bij \{?(\d{1,3})\}?\.? (?:en )?tel \{?(\d{1,3})\}? (verder|terug)/i.exec(z.tekst);
      if (tel) {
        const doel = Number(tel[1]) + (tel[3].toLowerCase() === "verder" ? 1 : -1) * Number(tel[2]) + (soort === "fout" ? 1 : 0);
        if (await klik(`(b) => b.getAttribute("data-getal") === "${doel}" || (b.textContent || "").trim() === "${doel}"`)) {
          await controleer();
          return true;
        }
      }
      /* Klok zetten: "Laat half 9 zien", "Zet de klok op …", "urenwijzer naar de 8". */
      const heeftKlok = await ev(`!!window.__phaser?.klokWijzer`);
      if (!heeftKlok) return false;
      /* De klokles zegt zelf wat er moet (window.__phaser.klokTaak): dat eerst. */
      const taak = await ev(`window.__phaser?.klokTaak ?? null`);
      if (taak?.soort === "getal") {
        const p = await ev(`window.__phaser?.klokGetal?.(3) ?? null`);
        if (p) {
          await tikPunt(p);
          return true;
        }
      }
      if (taak && taak.soort !== "kies" && taak.soort !== "getal") {
        const fout = soort === "fout" && taak.poging === 1 && !taak.alleen;
        /* Een wijzer in een boog met de klok mee slepen, van waarde a naar b (in "uren" op de wijzerplaat, 0–12). */
        const boog = async (wijzer, a, b, terug = false) => {
          const van = await ev(`window.__phaser?.klokWijzer?.("${wijzer}") ?? null`);
          if (!van) return;
          if (!terug) while (b < a) b += 12;
          const stappenBoog = Math.max(2, Math.ceil(Math.abs(b - a) * 2));
          await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: van.x, y: van.y, button: "left", clickCount: 1 }, s);
          for (let i = 1; i <= stappenBoog; i++) {
            const p = await klokPunt((((a + ((b - a) * i) / stappenBoog) % 12) + 12) % 12 || 12);
            if (p) await c.stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y, button: "left", buttons: 1 }, s);
            await wacht(20);
          }
          const eind = await klokPunt(((b % 12) + 12) % 12 || 12);
          await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", x: eind?.x ?? van.x, y: eind?.y ?? van.y, button: "left", clickCount: 1 }, s);
        };
        const nu = Number(await ev(`window.__phaser?.klokTijd?.() ?? 0`));
        /* Kan de klok direct gezet worden (testhaakje), dan dat: slepen met de muis is te wisselvallig voor een script. */
        const zetDirect = !taak.alleen && (await ev(`!!window.__phaser?.klokZet`));
        if (zetDirect) {
          const plus = fout ? (taak.soort === "minuut" ? 5 : 60) : 0;
          const doel = taak.soort === "uur" ? (((Number(taak.doel) + 11) % 12) + 1) * 60 + plus : Number(taak.doel) + plus;
          await ev(`window.__phaser.klokZet(${doel}, "${taak.soort === "uur" ? "uur" : "minuut"}")`);
          await wacht(500);
          /* Een drukke laptop tekent traag: wachten tot de wijzers er echt staan (hooguit 4 s), anders kijkt het vinkje de oude stand na. */
          for (let i = 0; i < 20 && ((Number(await ev(`window.__phaser?.klokTijd?.() ?? 0`)) - doel) % 720 + 720) % 720 !== 0; i++) await wacht(200);
          if (taak.controle) await controleer();
          return true;
        }
        if (taak.soort === "uur") {
          const doel = ((Number(taak.doel) + (fout ? 1 : 0) + 11) % 12) + 1;
          if (taak.alleen) {
            const p = await ev(`window.__phaser?.klokGetal?.(${doel}) ?? null`);
            if (p) await tikPunt(p);
          } else {
            /* Vrij zetten: de urenwijzer slepen (de kortste kant op). */
            const uNu = ((nu / 60) % 12 + 12) % 12;
            let d = ((doel - uNu) % 12 + 12) % 12;
            if (d > 6) d -= 12;
            await boog("uur", uNu, uNu + d, d < 0);
          }
        } else if (taak.soort === "minuut") {
          const doel = Number(taak.doel) + (fout ? 5 : 0);
          await boog("minuut", (((nu % 60) + 60) % 60) / 5, (((nu % 60) + 60) % 60) / 5 + (doel - nu) / 5);
        } else if (taak.soort === "tijd") {
          const doel = Number(taak.doel) + (fout ? 60 : 0);
          const mNu = (((nu % 60) + 60) % 60) / 5, mDoel = (((doel % 60) + 60) % 60) / 5;
          if (mNu !== mDoel) await boog("minuut", mNu, mDoel);
          const nu2 = Number(await ev(`window.__phaser?.klokTijd?.() ?? 0`));
          const uNu = ((nu2 / 60) % 12 + 12) % 12, uDoel = ((doel / 60) % 12 + 12) % 12;
          if (Math.abs(uNu - uDoel) > 0.05) await boog("uur", uNu, uDoel);
        }
        if (taak.controle) await controleer();
        return true;
      }
      const wijzer = /(uren|minuten)wijzer naar (?:de )?\{?(\d{1,2})\}?/i.exec(z.tekst);
      if (wijzer) {
        const w = wijzer[1].toLowerCase() === "uren" ? "uur" : "minuut";
        const van = await ev(`window.__phaser?.klokWijzer?.("${w}") ?? null`);
        const naar = await ev(`window.__phaser?.klokGetal?.(${Number(wijzer[2])}) ?? null`);
        if (van && naar) {
          await sleep(van, naar);
          await controleer();
          return true;
        }
      }
      const doelTekst = (await ev(`document.querySelector("[data-sterrenklok] [aria-live]")?.textContent ?? ""`)) || "";
      const tijd = /laat|zet|zien/i.test(z.tekst) ? tijdUit(z.tekst) ?? tijdUit(doelTekst) : tijdUit(doelTekst);
      if (tijd) {
        const u = ((tijd.u + 11) % 12) + 1 + (soort === "fout" ? 1 : 0);
        const minuut = await ev(`window.__phaser?.klokWijzer?.("minuut") ?? null`);
        const mDoel = await klokPunt(tijd.min === 0 ? 12 : tijd.min / 5);
        if (minuut && mDoel && tijd.min !== 0) await sleep(minuut, mDoel);
        const uur = await ev(`window.__phaser?.klokWijzer?.("uur") ?? null`);
        const uDoel = await klokPunt(u + tijd.min / 60);
        if (uur && uDoel) {
          await sleep(uur, uDoel);
          await controleer();
          return true;
        }
      }
      return false;
    };
    while (Date.now() - begin < MAX_MS) {
      await wacht(400);
      const z = await ev(STAAT);
      /* Voortgangsbalk (15.54): in gouden lessen aanwezig, nooit terug, raakt niets, vol aan het eind. */
      if (id.includes("gouden") && z) {
        const bs = (balkStaat ??= { max: 0, gezien: false });
        if (z.balk) {
          bs.gezien = true;
          if (z.balk.v < bs.max - 0.0005) fouten.add(`voortgangsbalk ging terug (${bs.max} naar ${z.balk.v})`);
          bs.max = Math.max(bs.max, z.balk.v);
          if (z.balk.raakt) fouten.add(`voortgangsbalk raakt: ${z.balk.raakt}`);
        }
        if (z.teller) fouten.add(`sleutel: ${z.teller}`);
        if (z.kaart || z.eind) {
          if (!bs.gezien) fouten.add("geen voortgangsbalk in deze gouden les");
          else if (bs.max < 0.999) fouten.add(`voortgangsbalk niet vol aan het eind (${bs.max})`);
        }
      }
      if (!z) continue;
      if (z.klaar) {
        einde = true;
        break;
      }
      if (z.tekst !== vorigeTekst) {
        vorigeTekst = z.tekst;
        zinnen.add(z.tekst);
        tekstSinds = Date.now();
      }
      /* Knoppen die de zin noemt, moeten er na 3 seconden zijn (als de speler intussen niets getikt heeft). */
      if (Date.now() - tekstSinds > 3000 && laatsteTik < tekstSinds && !z.praat)
        for (const f of ontbreekt(z)) {
          const regel = `${f} ("${z.tekst.slice(0, 70)}")`;
          if (fouten.has(regel)) continue;
          fouten.add(regel);
          /* Een foto van het scherm met de fout, om na te kijken. */
          if (FOTOMAP) {
            const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
            mkdirSync(join(FOTOMAP, id), { recursive: true });
            writeFileSync(join(FOTOMAP, id, `fout-${fouten.size}.jpg`), Buffer.from(data, "base64"));
            appendFileSync(join(FOTOMAP, id, "schermen.txt"), `fout-${fouten.size}.jpg\t${regel}\tknoppen: ${z.knoppen.map((b) => b.t).join(" | ")}\n`);
          }
        }
      /* Komt de les met tikken niet meer verder (zelfde zin, een minuut lang), dan kan de speler deze stap niet zelf. */
      if (Date.now() - tekstSinds > 60000 && laatsteTik > tekstSinds) {
        handmatig.add(`de speler komt hier niet verder ("${z.tekst.slice(0, 70)}")`);
        break;
      }
      if (z.kaart && FOTOMAP && process.env.FOTOKAART && !gefotografeerd.has("eindkaart")) {
        /* FOTOKAART=1 (voortgangsbalk, 24 nov 2026): de eindkaart zelf, voor het tikken. */
        gefotografeerd.add("eindkaart");
        await wacht(1500);
        const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
        mkdirSync(join(FOTOMAP, id), { recursive: true });
        writeFileSync(join(FOTOMAP, id, "eindkaart.jpg"), Buffer.from(data, "base64"));
      }
      if (z.kaart && (await klik(`(b) => /af te vinken|kaart/i.test(b.getAttribute("aria-label") || "")`))) continue;
      /* Staat de ronde afspeelknop er (BOUWREGELS 15.38: de browser houdt het geluid nog tegen), dan tikt de speler 1 keer echt op de knop, zoals een kind (iets naast het midden: de hele ronde moet reageren, niet alleen het driehoekje). */
      const startKnop = await ev(`(() => { const e = document.querySelector("[data-startknop]"); if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 3 ? { x: Math.round(r.left + r.width * 0.25), y: Math.round(r.top + r.height * 0.7) } : null; })()`);
      if (startKnop) {
        await tikPunt(startKnop);
        continue;
      }
      if (f16) {
        /* Een foto van elk moment waarop de les wachtte zonder vraag of opdracht. */
        const n16 = FOTOMAP ? Number(await ev(`(window.__f16 ?? []).length`)) || 0 : 0;
        if (n16 > f16Fotos) {
          f16Fotos = n16;
          const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
          mkdirSync(join(FOTOMAP, id), { recursive: true });
          writeFileSync(join(FOTOMAP, id, `f16-${String(n16).padStart(2, "0")}.jpg`), Buffer.from(data, "base64"));
          appendFileSync(join(FOTOMAP, id, "schermen.txt"), `f16-${String(n16).padStart(2, "0")}.jpg\tF16: ${JSON.stringify((await ev(`window.__f16[${n16 - 1}]`)) ?? {})}\n`);
        }
        /* De speler wacht met antwoorden tot de meter dit moment beoordeeld heeft (alleen als er geen opdracht staat; met RUSTIG=1 altijd). */
        if (!z.knoppen.some((b) => b.k === "verder") && (await ev(`window.__f16Klaar ? window.__f16Klaar(${process.env.RUSTIG ? "true" : "false"}) : true`)) === false) continue;
      }
      /* PIJLTIK=nooit (20 nov 2026, meting 15.51): de speler tikt nooit op de pijl; de les moet vanzelf doorgaan. */
      const knoppen = z.knoppen.filter((b) => !["opnieuw", "terug"].includes(b.k) && !b.wolk && !(process.env.PIJLTIK === "nooit" && b.k === "verder"));
      const kaartFoto = !!(process.env.FOTOKAART && z.kaart); /* FOTOKAART=1: ook de eindkaart fotograferen terwijl Bliepo nog praat (voortgangsbalk, 24 nov 2026) */
      if (FOTOMAP && (knoppen.length || z.kaart) && (!z.praat || kaartFoto)) {
        const sleutel = z.tekst + "|" + knoppen.map((b) => b.t).join(",");
        if (!gefotografeerd.has(sleutel)) {
          /* Alleen een scherm dat even stilstaat (geen tussenstand van een halve seconde). */
          await wacht(900);
          const nog = await ev(STAAT);
          const nogKnoppen = (nog?.knoppen ?? []).filter((b) => !["opnieuw", "terug"].includes(b.k) && !b.wolk);
          if (!nog || (nog.praat && !kaartFoto) || nog.tekst + "|" + nogKnoppen.map((b) => b.t).join(",") !== sleutel) continue;
          gefotografeerd.add(sleutel);
          const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
          const nr = String(gefotografeerd.size).padStart(3, "0");
          mkdirSync(join(FOTOMAP, id), { recursive: true });
          writeFileSync(join(FOTOMAP, id, `${nr}.jpg`), Buffer.from(data, "base64"));
          appendFileSync(join(FOTOMAP, id, "schermen.txt"), `${nr}.jpg\tBliepo: ${z.tekst}\tknoppen: ${knoppen.map((b) => b.t).join(" | ")}\n`);
        }
      }
      if (!knoppen.length) {
        if (z.praat) {
          stilSinds = null;
          continue;
        }
        /* SCHERMFOTO: ook een stap waar alleen in de tekening getikt kan worden (bijvoorbeeld "tik op de 5" met een ring, zonder knoppen). */
        if (FOTOMAP && z.canvas && !z.praat && z.tekst && !gefotografeerd.has(z.tekst + "|tekening")) {
          gefotografeerd.add(z.tekst + "|tekening");
          const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
          const nr = String(gefotografeerd.size).padStart(3, "0");
          mkdirSync(join(FOTOMAP, id), { recursive: true });
          writeFileSync(join(FOTOMAP, id, `${nr}.jpg`), Buffer.from(data, "base64"));
          appendFileSync(join(FOTOMAP, id, "schermen.txt"), `${nr}.jpg\tBliepo: ${z.tekst}\tknoppen: (alleen in de tekening)\n`);
        }
        if (z.canvas && !z.praat && (await canvasStap(z, "goed"))) {
          laatsteTik = Date.now();
          stilSinds = null;
          continue;
        }
        /* Eerst laden: zolang Bliepo nog niets zei en er niets staat, nog niet meetellen (tot een minuut, de ontwikkelversie compileert soms lang). */
        if (!z.tekst && !zinnen.size && Date.now() - begin < Number(process.env.STARTWACHT ?? 60000)) continue; /* STARTWACHT=ms: langer wachten als de laptop druk is. */
        stilSinds ??= Date.now();
        const stil = Date.now() - stilSinds;
        if (stil > 5000 && !z.canvas) {
          fouten.add(`langer dan 5 seconden niets te tikken ("${z.tekst.slice(0, 70)}")`);
          break;
        }
        if (stil > 25000) {
          handmatig.add(`alleen in de tekening te doen ("${z.tekst.slice(0, 70)}")`);
          break;
        }
        continue;
      }
      stilSinds = null;
      stappen++;
      laatsteTik = Date.now();
      const soort = process.env.ALLEFOUT ? "fout" : process.env.GOED ? "goed" : (stappen + Number(process.env.VARIANT ?? 0)) % 7 === 3 ? "weetniet" : (stappen + Number(process.env.VARIANT ?? 0)) % 7 === 5 ? "fout" : "goed";
      if (await canvasStap(z, soort)) continue;
      /* NEE=1: bij "Kun je dit al?" op Nee tikken, om de uitleg te zien (alleen dan; anders gaat het kind door met Ja). */
      if (process.env.NEE && (await klik(`(b) => (b.textContent || "").trim() === "Nee"`))) continue;
      /* Afwisselend: meestal goed, soms "weet ik niet", soms fout. */
      if (process.env.PIJLTIK !== "nooit" && (await klik(`(b) => b.getAttribute("data-knop") === "verder"`))) continue;
      /* HULP=1: bij "weet ik niet" op het handje tikken (als dat er staat), om de hulpstappen te zien. */
      if (process.env.HULP && soort === "weetniet" && (await klik(`(b) => b.getAttribute("data-knop") === "hulp"`))) continue;
      if (await klik(`(b) => b.hasAttribute("data-controleer") || b.getAttribute("data-knop") === "controleer"`)) continue;
      const invoer = await ev(`(() => { const i = [...document.querySelectorAll("input")].find((i) => i.getBoundingClientRect().width > 3 && !i.disabled); return !!i; })()`);
      if (invoer) {
        const waarde = soort === "goed" && z.antwoord != null ? String(z.antwoord) : String(stappen % 9);
        await ev(`(() => { const i = [...document.querySelectorAll("input")].find((i) => i.getBoundingClientRect().width > 3 && !i.disabled); const zet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; zet.call(i, ${JSON.stringify(waarde)}); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); return true; })()`);
        await wacht(200);
        await klik(`(b) => b.hasAttribute("data-controleer") || b.getAttribute("data-knop") === "controleer"`);
        continue;
      }
      if (soort === "weetniet" && (await klik(`(b) => b.getAttribute("data-knop") === "weetniet"`))) continue;
      /* Het goede antwoord van dit moment (de zin kan intussen al verder zijn dan de stand van hierboven). */
      const nuGoed = (await ev(`window.__phaser?.antwoord ?? null`)) ?? z.antwoord;
      const goed = nuGoed != null ? String(nuGoed) : null;
      if (soort === "goed" && goed && (await klik(`(b) => (b.textContent || "").trim() === ${JSON.stringify(goed)} || b.getAttribute("data-ding") === ${JSON.stringify(goed)}`))) continue;
      /* FOUTANTWOORD="10 uur": bij een fout dit antwoord kiezen als het er staat (om één denkfout, zoals spiegelbeeld, te testen). */
      if (soort === "fout" && process.env.FOUTANTWOORD && process.env.FOUTANTWOORD !== goed && (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"]') && (b.textContent || "").trim() === ${JSON.stringify(process.env.FOUTANTWOORD)}`))) continue;
      if (soort === "fout" && goed && (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"]') && (b.textContent || "").trim() !== ${JSON.stringify(goed)} && b.getAttribute("data-knop") !== "weetniet"`))) continue;
      /* Anders: de eerste keuze, of een tikbaar ding in het vlak. */
      if (await klik(`(b) => b.tagName === "BUTTON" && b.hasAttribute("data-plek")`)) continue;
      if (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"], [class*="raster3"]') && !b.querySelector(".bliepo-tekst") && b.getAttribute("data-knop") !== "weetniet" && b.getAttribute("aria-pressed") !== "true"`)) continue;
      /* Getallen, zinnen of woorden in het verhaal: steeds een ander (een kind tikt "het andere" als Bliepo dat vraagt). */
      if (await ev(`(() => { const lijst = [...document.querySelectorAll("[data-zin], [data-getal], [data-signaal]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled; }); if (!lijst.length) return false; lijst[${stappen} % lijst.length].click(); return true; })()`)) continue;
      if (await klik(`(b) => b.getAttribute("data-knop") === "weetniet"`)) continue;
      await klik(`(b) => !["opnieuw","terug"].includes(b.getAttribute("data-knop") || "") && b.tagName === "BUTTON"`);
    }
    if (zweefMeter) {
      const zw = JSON.parse((await ev(`JSON.stringify({ f: window.__zweef ?? [], n: window.__zweefMetingen ?? 0 })`)) ?? "{}");
      for (const f of zw.f ?? []) fouten.add(`zweeft: ${f}`);
      console.log(`  ZWEEF ${id}: ${(zw.f ?? []).length} keer iets dat zweeft of ernaast staat (${zw.n ?? 0} metingen)`);
    }
    if (f16) {
      const r16 = JSON.parse((await ev(`JSON.stringify({ f: window.__f16 ?? [], n: window.__f16Beoordeeld ?? 0, g: window.__f16Gezien ?? 0 })`)) ?? "{}");
      const vf = vraagFouten(r16.f);
      for (const f of vf) fouten.add(f);
      console.log(`  F16 ${id}: ${vf.length} keer wachten zonder vraag of opdracht in beeld (${r16.n ?? 0} wachtmomenten van 3 s beoordeeld${process.env.RUSTIG ? ", rustig" : `, ${r16.g ?? 0} keer stond de vraag er al toen de speler antwoordde`})`);
      /* 15.47 (19 nov 2026): telt Bliepo hardop mee, dan blijft de opdracht in beeld. */
      const r47 = JSON.parse((await ev(`JSON.stringify({ f: window.__f47 ?? [], g: window.__f47Geteld ?? 0 })`)) ?? "{}");
      const tf = telFouten(r47.f);
      for (const f of tf) fouten.add(f);
      console.log(`  15.47 ${id}: ${tf.length} keer alleen een telwoord zonder opdracht (${r47.g ?? 0} keer telwoord met opdracht erboven)`);
    }
    /* 15.39/15.40 (19 nov 2026): stilte bij goed en de reactiegeluiden in de gouden lessen (Lesscherm.tsx). */
    if (id.includes("gouden")) {
      const rs = JSON.parse((await ev(`JSON.stringify({ s: window.__stilte ?? [], g: window.__geluiden ?? [] })`)) ?? "{}");
      const s = rs.s ?? [];
      let opRij = 0;
      for (let i = 0; i < s.length; i++) {
        const stil = s[i].soort === "stil" || s[i].soort === "geen-zin";
        if (s[i].soort === "stil" && i === 0) fouten.add("15.39: het eerste goede antwoord was stil");
        if (s[i].soort === "stil" && s[i].naHulp) fouten.add("15.39: stil na hulp");
        if (s[i].soort === "stil" && opRij) fouten.add("15.39: 2 keer achter elkaar zonder zin");
        opRij = stil ? opRij + 1 : 0;
      }
      const tel = (w) => s.filter((x) => x.soort === w).length;
      const plekken = {};
      for (const g of rs.g ?? []) plekken[`${g.plek}${g.gespeeld ? "" : ` (stil: ${g.reden})`}`] = (plekken[`${g.plek}${g.gespeeld ? "" : ` (stil: ${g.reden})`}`] ?? 0) + 1;
      console.log(`  GOED-REACTIE ${id}: ${tel("zin")} met zin, ${tel("stil")} stil, ${tel("geen-zin")} zonder zin van de les; geluiden: ${JSON.stringify(plekken)}`);
    }
    if (f11) {
      const dt = dubbeleTekstFouten(JSON.parse((await ev(`JSON.stringify(window.__dubbeleTekst ?? [])`)) ?? "[]"));
      for (const f of dt) fouten.add(f);
      console.log(`  F11 ${id}: ${dt.length} keer dezelfde tekst 2 keer tegelijk op het scherm`);
    }
    if (process.env.F7) {
      const r = JSON.parse((await ev(`JSON.stringify({ m: window.__f7 ?? [], t: window.__f7tik ?? [], s: window.__f8 ?? [], r: window.__stemSpeel ?? [] })`)) ?? "{}");
      let dubbel = 0;
      for (let i = 0; i < (r.s ?? []).length; i++)
        for (let j = i - 1; j >= 0 && r.s[i].t - r.s[j].t < 20000; j--)
          if (r.s[j].z === r.s[i].z) {
            if (!r.t.some((t) => t > r.s[j].t && t <= r.s[i].t)) {
              dubbel++;
              if (dubbel <= 3) fouten.add(`F8: dezelfde uiting 2 keer gestart zonder tik: "${r.s[i].z.slice(0, 70)}"`);
            }
            break;
          }
      /* Korte uitingen ook na een tik, en de Ruth-opnames zelf (17 nov 2026, 15.29). */
      for (const f of korteDubbel([...(r.s ?? []), ...(r.r ?? [])])) { dubbel++; fouten.add(f); }
      const op = opnameDubbel(r.r);
      for (const f of op.fouten) { dubbel++; fouten.add(f); }
      console.log(`  F8 ${id}: ${dubbel} keer dezelfde uiting 2 keer gestart (${(r.s ?? []).length} uitingen browser, ${(r.r ?? []).length} van Ruth; ${op.geknipt} dubbele opnames geknipt)`);
      const k = (x) => x.tekst.join(" | ");
      let n = 0;
      for (let i = 1; i < (r.m ?? []).length; i++) {
        const z = k(r.m[i]);
        if (!z || z === k(r.m[i - 1])) continue;
        for (let j = i - 2; j >= 0 && r.m[i].t - r.m[j].t < 15000; j--) {
          if (k(r.m[j]) !== z) continue;
          if (!r.t.some((t) => t > r.m[j].t && t <= r.m[i].t)) {
            n++;
            if (n <= 3) fouten.add(`F7: dezelfde tekst kwam terug zonder tik (pijl ${r.m[j].pijl ? "ja" : "nee"} → ${r.m[i].pijl ? "ja" : "nee"}): "${z.slice(0, 80)}"`);
          }
          break;
        }
      }
      console.log(`  F7 ${id}: ${n} keer dezelfde tekst terug zonder tik (${(r.m ?? []).length} metingen)`);
    }
    /* METER=1 en METERUIT=map: de meting van 15.51 per les in een bestand (scripts/bliepo-gedrag-meting.mjs vat ze samen). */
    if (process.env.METER && process.env.METERUIT) {
      mkdirSync(process.env.METERUIT, { recursive: true });
      writeFileSync(join(process.env.METERUIT, `${id}.json`), (await ev(`JSON.stringify({ bm: window.__bm ?? null, gouden: window.__gouden ?? [], stilte: window.__stilte ?? [], scherm: window.__scherm ?? [] })`)) ?? "{}");
    }
    /* DUMP=1: wat de gouden klokles over de les heeft vastgelegd (denkfouten, uitkomsten, zinnen van Bliepo). */
    if (process.env.DUMP) {
      const d = await ev(`JSON.stringify({ d: window.__denkfouten ?? [], u: window.__uitkomsten ?? [], g: (window.__gouden ?? []).filter((x) => x.wat === "reactie" || x.wat === "aanwijzing" || x.wat === "aanmoedigen") })`);
      writeFileSync(process.env.DUMP, d ?? "{}");
    }
    if (process.env.DEBUG) console.log("  eindstand:", JSON.stringify(await ev(STAAT)).slice(0, 900));
    if (process.env.DEBUG) console.log("  phaser:", JSON.stringify(await ev(`JSON.stringify(window.__phaser ?? null)`)).slice(0, 600));
    /* Nog steeds nieuwe zinnen, maar niet op tijd klaar: de speler is te dom of de les te lang (geen fout, wel zelf nakijken). */
    if (!einde && !handmatig.size && !fouten.size && zinnen.size > 40) handmatig.add(`niet binnen ${MAX_MS / 60000} minuten uitgespeeld, maar de les liep wel door (${zinnen.size} verschillende zinnen; laatste: "${vorigeTekst.slice(0, 60)}")`);
    else if (!einde && !handmatig.size && ![...fouten].some((f) => f.startsWith("langer dan"))) fouten.add(`niet tot het eind gekomen binnen ${MAX_MS / 60000} minuten (laatste zin: "${vorigeTekst.slice(0, 70)}")`);
  } finally {
    await c.stuur("Target.closeTarget", { targetId }).catch(() => {});
  }
  stemAf?.();
  if (process.env.STEM) console.log(`  stem ${id}: ${stemTel.ruth} van ${stemTel.gevraagd} zinnen met Ruth`);
  return { id, fouten: [...fouten], handmatig: [...handmatig], stappen, einde };
}

/* In de bewaking: lessen die al goed getest zijn en niet veranderd, overslaan (controlegeheugen.mjs). */
const { testen: ids, overgeslagen, afdruk } = zonderAlGoed("speel", "speelcontrole.mjs", lessen());
if (overgeslagen.length) console.log(`Speelcontrole: ${overgeslagen.length} lessen overgeslagen (al goed getest, niets aan veranderd).`);
if (!ids.length) {
  console.log("Speelcontrole: geen lessen om te controleren.");
  process.exit(0);
}
/* Draait de site niet, dan in de bewaking overslaan (zoals de vloeiendheidscontrole). */
try {
  await fetch(BASIS, { headers: kop });
} catch {
  console.log(`⚠️  Speelcontrole overgeslagen: de site draait niet op ${BASIS} (start eerst npm run dev).`);
  process.exit(process.env.BEWAAK === "1" ? 0 : 1);
}
const rij = [...ids];
const uitslagen = [];
/* Elke speler een eigen Chrome: meerdere lessen in één Chrome delen de grafische kaart, en dan valt Bliepo (WebGL) soms weg op de schermfoto's. */
await Promise.all(
  Array.from({ length: Math.min(TEGELIJK, rij.length) }, async () => {
    const chrome = await startChrome();
    const c = await verbind(chrome.url);
    while (rij.length) {
      const id = rij.shift();
      const u = await speel(c, id);
      uitslagen.push(u);
      const pad = `${BASIS}/voorbeeld/les/${id}?naam=Testkind&blijf=1`;
      if (u.fouten.length) console.log(`✗ ${id} (${u.stappen} stappen) ${pad}\n   - ${u.fouten.join("\n   - ")}`);
      else if (u.handmatig.length) console.log(`? ${id} (${u.stappen} stappen): ${u.handmatig.join("; ")}`);
      else console.log(`✓ ${id} (${u.stappen} stappen, tot het eind)`);
    }
    c.sluit();
    chrome.stop();
  }),
);
if (!process.env.METER) onthoudGoed("speel", afdruk, uitslagen.filter((u) => !u.fouten.length).map((u) => u.id));
const fout = uitslagen.filter((u) => u.fouten.length).length;
const hand = uitslagen.filter((u) => !u.fouten.length && u.handmatig.length).length;
console.log(`\nSpeelcontrole: ${uitslagen.length} lessen, ${uitslagen.length - fout - hand} tot het eind, ${fout} met fouten, ${hand} met een stap die alleen in de tekening kan.`);
process.exit(fout ? 1 : 0);
