/**
 * Speelcontrole (28 oktober 2026, opdracht eigenaar): kan een kind elke les
 * van begin tot eind spelen, zonder ergens vast te zitten?
 *
 *   npm run speel                       alle groep 3-lessen, lokaal
 *   LESSEN=tellen-120-doortellen npm run speel
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
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kiesLessen } from "./lessenkeuze.mjs";
import { onthoudGoed, zonderAlGoed } from "./controlegeheugen.mjs";

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
  const proces = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
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
    klaar: !!document.querySelector('[data-knop="opnieuw"]'),
    kaart: !!document.querySelector('button[aria-label$="af te vinken"], [data-kaart] button, button[aria-label*="kaart"]'),
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

async function speel(c, id) {
  const { targetId } = await c.stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await c.stuur("Target.attachToTarget", { targetId, flatten: true });
  const ev = async (e) => {
    const r = await c.stuur("Runtime.evaluate", { expression: e, returnByValue: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  const klik = (filter) => ev(`(() => { const b = [...document.querySelectorAll("button, a[href], button[data-plek], [data-zin], [data-getal], [data-signaal], [data-ding]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled && b.getAttribute("aria-disabled") !== "true" && !/^(Pauze|Nog eens horen|Stem van Bliepo|Praten met Bliepo|Geluidjes aan|Lees de keuzes voor)/i.test(b.getAttribute("aria-label") || b.textContent.trim()); }).find(${filter}); if (!b) return false; if (b.click) b.click(); else b.dispatchEvent(new MouseEvent("click", { bubbles: true })); return ${process.env.DEBUG ? "b.outerHTML.slice(0, 200)" : "true"}; })()`).then((r) => { if (r && process.env.DEBUG) console.log("  tik:", r); return r; });
  const fouten = new Set();
  const handmatig = new Set();
  let stappen = 0;
  let einde = false;
  let stemAf = null;
  const stemTel = { gevraagd: 0, ruth: 0 };
  try {
    await c.stuur("Page.enable", {}, s);
    await c.stuur("Network.enable", {}, s);
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
    } else await c.stuur("Page.addScriptToEvaluateOnNewDocument", { source: SNEL }, s);
    await c.stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${id}?naam=Testkind` }, s);
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
      if (z.kaart && (await klik(`(b) => /af te vinken|kaart/i.test(b.getAttribute("aria-label") || "")`))) continue;
      const knoppen = z.knoppen.filter((b) => !["opnieuw", "terug"].includes(b.k) && !b.wolk);
      if (FOTOMAP && (knoppen.length || z.kaart) && !z.praat) {
        const sleutel = z.tekst + "|" + knoppen.map((b) => b.t).join(",");
        if (!gefotografeerd.has(sleutel)) {
          /* Alleen een scherm dat even stilstaat (geen tussenstand van een halve seconde). */
          await wacht(900);
          const nog = await ev(STAAT);
          const nogKnoppen = (nog?.knoppen ?? []).filter((b) => !["opnieuw", "terug"].includes(b.k) && !b.wolk);
          if (!nog || nog.praat || nog.tekst + "|" + nogKnoppen.map((b) => b.t).join(",") !== sleutel) continue;
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
      const soort = process.env.GOED ? "goed" : (stappen + Number(process.env.VARIANT ?? 0)) % 7 === 3 ? "weetniet" : (stappen + Number(process.env.VARIANT ?? 0)) % 7 === 5 ? "fout" : "goed";
      if (await canvasStap(z, soort)) continue;
      /* Afwisselend: meestal goed, soms "weet ik niet", soms fout. */
      if (await klik(`(b) => b.getAttribute("data-knop") === "verder"`)) continue;
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
      if (soort === "fout" && goed && (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"]') && (b.textContent || "").trim() !== ${JSON.stringify(goed)} && b.getAttribute("data-knop") !== "weetniet"`))) continue;
      /* Anders: de eerste keuze, of een tikbaar ding in het vlak. */
      if (await klik(`(b) => b.tagName === "BUTTON" && b.hasAttribute("data-plek")`)) continue;
      if (await klik(`(b) => b.closest('[data-knop="keuzes"], [class*="bediening"], [class*="raster3"]') && !b.querySelector(".bliepo-tekst") && b.getAttribute("data-knop") !== "weetniet" && b.getAttribute("aria-pressed") !== "true"`)) continue;
      /* Getallen, zinnen of woorden in het verhaal: steeds een ander (een kind tikt "het andere" als Bliepo dat vraagt). */
      if (await ev(`(() => { const lijst = [...document.querySelectorAll("[data-zin], [data-getal], [data-signaal]")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 3 && r.height > 3 && !b.disabled; }); if (!lijst.length) return false; lijst[${stappen} % lijst.length].click(); return true; })()`)) continue;
      if (await klik(`(b) => b.getAttribute("data-knop") === "weetniet"`)) continue;
      await klik(`(b) => !["opnieuw","terug"].includes(b.getAttribute("data-knop") || "") && b.tagName === "BUTTON"`);
    }
    if (process.env.DEBUG) console.log("  eindstand:", JSON.stringify(await ev(STAAT)).slice(0, 900));
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
      const pad = `${BASIS}/voorbeeld/les/${id}?naam=Testkind`;
      if (u.fouten.length) console.log(`✗ ${id} (${u.stappen} stappen) ${pad}\n   - ${u.fouten.join("\n   - ")}`);
      else if (u.handmatig.length) console.log(`? ${id} (${u.stappen} stappen): ${u.handmatig.join("; ")}`);
      else console.log(`✓ ${id} (${u.stappen} stappen, tot het eind)`);
    }
    c.sluit();
    chrome.stop();
  }),
);
onthoudGoed("speel", afdruk, uitslagen.filter((u) => !u.fouten.length).map((u) => u.id));
const fout = uitslagen.filter((u) => u.fouten.length).length;
const hand = uitslagen.filter((u) => !u.fouten.length && u.handmatig.length).length;
console.log(`\nSpeelcontrole: ${uitslagen.length} lessen, ${uitslagen.length - fout - hand} tot het eind, ${fout} met fouten, ${hand} met een stap die alleen in de tekening kan.`);
process.exit(fout ? 1 : 0);
