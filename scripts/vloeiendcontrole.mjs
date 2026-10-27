/**
 * Vloeiendheidscontrole (27 oktober 2026, HARDE REGEL 7 in CLAUDE.md): elke
 * les, opdracht en game in Phaser moet vloeiend lopen. Deze controle faalt
 * als een Phaser-scherm dat niet haalt.
 *
 * Waarom: het eerste Phaser-proefje haalde op de laptop van de eigenaar maar
 * 13 beelden per seconde (de gloed werd elk beeld opnieuw uitgerekend); het
 * slepen liep achter de muis aan. Een gewone Chrome zonder venster rekent
 * zonder grafische kaart en ziet dat niet goed. Deze controle start Chrome
 * zonder venster MÉT de grafische kaart (Metal), zodat de meting klopt met
 * wat een kind ziet.
 *
 * Per scherm, op twee apparaten:
 *   - laptop (1440 × 900);
 *   - trage telefoon (390 × 844, scherp scherm 2×, processor 4× trager,
 *     trage 4G-verbinding).
 * En per keer:
 *   - openen: van het begin van de pagina tot het eerste Phaser-beeld, met
 *     wat al eens geladen is (zoals een kind dat de site al open heeft):
 *     minder dan 1 seconde;
 *   - 3 seconden slepen (muis of vinger) op het punt dat het scherm opgeeft:
 *     minstens 55 beelden per seconde, en geen beeld langer dan 50 ms;
 *   - het gesleepte voorwerp staat aan het eind precies onder de muis.
 *
 * Een Phaser-scherm doet mee als het hieronder in SCHERMEN staat. Het scherm
 * zet bij zijn eerste beeld `window.__phaser = { klaarOp: performance.now(),
 * sleepPunt: () => ({ x, y }) }` (x en y in pixels van de pagina), of zonder
 * slepen `beweeg: (ms) => …` (speelt zijn animaties). Elke nieuwe Phaser-les
 * of -opdracht komt hier meteen bij.
 *
 *   npm run vloeiend                       tegen http://localhost:3000
 *   BASIS=https://… WW=… npm run vloeiend  tegen een andere site (met slot)
 *
 * Draait er geen site, dan stopt hij met een melding (in de bewaking vóór een
 * commit wordt hij dan overgeslagen, met een duidelijke waarschuwing).
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const IN_BEWAKING = process.env.BEWAAK === "1";

/* Alle Phaser-schermen. Elke nieuwe Phaser-les, -opdracht of -game hoort hier bij. */
const SCHERMEN = [
  { naam: "Phaser-proefje (parels)", pad: "/voorbeeld-phaser" },
  /* De voorbeeldles (27 oktober 2026): Stippen tot 10 met Oceaan-hologrammen; geen slepen, dus de hologrammen spelen 3 s hun animaties (verschijnen + lichtgolf). */
  { naam: "Les Stippen tot 10 (hologrammen)", pad: "/voorbeeld/les/flitsen-tellen-tot-10?naam=Testkind" },
];

const APPARATEN = [
  { naam: "laptop", b: 1440, h: 900, dpr: 1, mobiel: false },
  { naam: "trage telefoon", b: 390, h: 844, dpr: 2, mobiel: true, cpu: 4, net: { latency: 150, down: 1.6e6 / 8, up: 750e3 / 8 } },
];

const EIS = { fps: 55, langsteMs: 50, openenMs: 1000 };

const CHROME = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && existsSync(p));

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const kop = process.env.WW ? { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } : {};

async function siteDraait() {
  try {
    const r = await fetch(BASIS + SCHERMEN[0].pad, { headers: kop, signal: AbortSignal.timeout(60000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function startChrome() {
  const map = mkdtempSync(join(tmpdir(), "vloeiendcontrole-"));
  const poort = 9800 + Math.floor(Math.random() * 150);
  /* Zonder venster, maar mét de grafische kaart: anders rekent Chrome alles op de processor en klopt de meting niet. */
  const proces = spawn(
    CHROME,
    ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"],
    { stdio: "ignore" },
  );
  for (let i = 0; i < 50; i++) {
    try {
      const v = await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json());
      return {
        url: v.webSocketDebuggerUrl,
        stop: () => {
          proces.kill();
          setTimeout(() => {
            try {
              rmSync(map, { recursive: true, force: true });
            } catch {}
          }, 500);
        },
      };
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
  return new Promise((res) => ws.addEventListener("open", () => res({ stuur, sluit: () => ws.close() })));
}

/* Beelden tellen in de pagina (requestAnimationFrame), vanaf nu tot `ms` later. */
const TEL = (ms) => `new Promise((klaar) => {
  let n = 0, langste = 0, vorige = performance.now();
  const begin = vorige;
  (function f() {
    const nu = performance.now();
    if (n > 0) langste = Math.max(langste, nu - vorige);
    vorige = nu; n++;
    if (nu - begin < ${ms}) requestAnimationFrame(f);
    else klaar({ fps: Math.round((n - 1) / ((nu - begin) / 1000)), langste: Math.round(langste) });
  })();
})`;

async function meet(c, scherm, apparaat) {
  const { targetId } = await c.stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await c.stuur("Target.attachToTarget", { targetId, flatten: true });
  const ev = async (e) => {
    const r = await c.stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s);
    return r.exceptionDetails ? null : r.result?.value;
  };
  try {
    await c.stuur("Page.enable", {}, s);
    await c.stuur("Runtime.enable", {}, s);
    await c.stuur("Network.enable", {}, s);
    if (process.env.WW) await c.stuur("Network.setExtraHTTPHeaders", { headers: kop }, s);
    await c.stuur("Emulation.setDeviceMetricsOverride", { width: apparaat.b, height: apparaat.h, deviceScaleFactor: apparaat.dpr, mobile: apparaat.mobiel }, s);
    if (apparaat.mobiel) await c.stuur("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, s);
    const laad = async () => {
      await c.stuur("Page.navigate", { url: BASIS + scherm.pad }, s);
      for (let i = 0; i < 300; i++) {
        const k = await ev(`window.__phaser?.klaarOp ?? null`);
        if (k) return Math.round(k);
        await wacht(100);
      }
      return null;
    };
    /* Eerst één keer laden (zoals een kind dat de site al open heeft), dan pas meten. */
    if ((await laad()) === null) return [`het eerste Phaser-beeld kwam er niet (geen window.__phaser.klaarOp)`];
    if (apparaat.cpu) await c.stuur("Emulation.setCPUThrottlingRate", { rate: apparaat.cpu }, s);
    if (apparaat.net) await c.stuur("Network.emulateNetworkConditions", { offline: false, latency: apparaat.net.latency, downloadThroughput: apparaat.net.down, uploadThroughput: apparaat.net.up }, s);
    const openen = await laad();
    if (openen === null) return [`het eerste Phaser-beeld kwam er niet bij de tweede keer laden`];
    await wacht(800);

    /* 3 seconden slepen en ondertussen beelden tellen. */
    const punt = await ev(`window.__phaser?.sleepPunt?.() ?? null`);
    /* Schermen zonder slepen laten zelf 3 seconden hun animaties zien (window.__phaser.beweeg). */
    if (!punt) await ev(`window.__phaser?.beweeg?.(3000) ?? null`);
    const telling = c.stuur("Runtime.evaluate", { expression: TEL(3000), returnByValue: true, awaitPromise: true }, s);
    let eind = null;
    if (punt) {
      const stap = (i) => ({ x: punt.x + Math.sin(i / 9) * 120, y: punt.y + Math.sin(i / 13) * 60 });
      if (apparaat.mobiel) await c.stuur("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: punt.x, y: punt.y }] }, s);
      else {
        await c.stuur("Input.dispatchMouseEvent", { type: "mouseMoved", x: punt.x, y: punt.y }, s);
        await c.stuur("Input.dispatchMouseEvent", { type: "mousePressed", x: punt.x, y: punt.y, button: "left", clickCount: 1 }, s);
      }
      const t0 = Date.now();
      let i = 0;
      while (Date.now() - t0 < 2900) {
        eind = stap(++i);
        if (apparaat.mobiel) await c.stuur("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [eind] }, s);
        else await c.stuur("Input.dispatchMouseEvent", { type: "mouseMoved", ...eind, button: "left", buttons: 1 }, s);
        await wacht(16);
      }
    }
    const uitslag = (await telling).result?.value ?? { fps: 0, langste: 9999 };
    let naast = null;
    if (punt && eind) {
      const nu = await ev(`window.__phaser?.sleepPunt?.() ?? null`);
      if (nu) naast = Math.round(Math.hypot(nu.x - eind.x, nu.y - eind.y));
      if (apparaat.mobiel) await c.stuur("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }, s);
      else await c.stuur("Input.dispatchMouseEvent", { type: "mouseReleased", ...eind, button: "left", clickCount: 1 }, s);
    }
    const fout = [];
    /*
      De opentijd is een harde eis op de echte site (gebouwd, zoals online). De
      ontwikkelversie op de laptop (npm run dev) is veel trager; daar alleen een
      waarschuwing. Meet na het online zetten dus altijd: BASIS=https://… npm run vloeiend.
    */
    const ontwikkel = /localhost|127\.0\.0\.1/.test(BASIS) && !process.env.GEBOUWD;
    if (openen >= EIS.openenMs) {
      if (ontwikkel) console.log(`⚠️  ${scherm.naam}, ${apparaat.naam}: openen ${openen} ms in de ontwikkelversie; meet de echte site (moet onder ${EIS.openenMs} ms).`);
      else fout.push(`openen duurt ${openen} ms (moet onder ${EIS.openenMs} ms)`);
    }
    if (uitslag.fps < EIS.fps) fout.push(`maar ${uitslag.fps} beelden per seconde (moet minstens ${EIS.fps})`);
    if (uitslag.langste > EIS.langsteMs) fout.push(`een hapering van ${uitslag.langste} ms (mag hooguit ${EIS.langsteMs} ms)`);
    if (naast !== null && naast > 12) fout.push(`het gesleepte voorwerp staat ${naast} px naast de muis/vinger`);
    const regel = `${scherm.naam}, ${apparaat.naam}: openen ${openen} ms, ${uitslag.fps} beelden/s, langste beeld ${uitslag.langste} ms${naast !== null ? `, ${naast} px van de muis` : ""}`;
    return fout.length ? fout.map((f) => `${regel} — ${f}`) : regel;
  } finally {
    await c.stuur("Target.closeTarget", { targetId }).catch(() => {});
  }
}

if (!CHROME) {
  console.log("⚠️  Vloeiendheidscontrole overgeslagen: geen Chrome gevonden.");
  process.exit(0);
}
if (!(await siteDraait())) {
  const melding = `⚠️  Vloeiendheidscontrole overgeslagen: de site draait niet op ${BASIS} (start eerst npm run dev).`;
  console.log(melding);
  process.exit(IN_BEWAKING ? 0 : 1);
}

const chrome = await startChrome();
const c = await verbind(chrome.url);
const alleFouten = [];
try {
  for (const scherm of SCHERMEN) {
    for (const apparaat of APPARATEN) {
      let uit = await meet(c, scherm, apparaat);
      /*
        Eén keer opnieuw meten bij een afwijking: één toevallige hapering (de
        laptop doet tijdens de bewaking ook andere dingen) is nog geen fout.
        Twee keer na elkaar te traag wel.
      */
      if (typeof uit !== "string") {
        console.log(`… opnieuw meten: ${scherm.naam}, ${apparaat.naam}`);
        uit = await meet(c, scherm, apparaat);
      }
      if (typeof uit === "string") console.log(`✓ ${uit}`);
      else for (const f of uit) {
        console.log(`✗ ${f}`);
        alleFouten.push(f);
      }
    }
  }
} finally {
  c.sluit();
  chrome.stop();
}

if (alleFouten.length) {
  console.log(`\nVloeiendheidscontrole: ${alleFouten.length} keer niet vloeiend genoeg (HARDE REGEL 7). Los het eerst op, en zet het pas dan online.`);
  process.exit(1);
}
console.log(`\nVloeiendheidscontrole: alle ${SCHERMEN.length} Phaser-schermen vloeiend op laptop en trage telefoon.`);
