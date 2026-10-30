/**
 * Overlapcontrole (28 oktober 2026, opdracht eigenaar): vindt knoppen die over
 * elkaar heen liggen of buiten beeld vallen, in de lessen, op laptop, tablet
 * en telefoon (staand en liggend). Bijvoorbeeld het microfoonknopje over "Weet
 * ik niet" of de antwoordtegels, of een rij tegels die onder de microfoon
 * doorloopt.
 *
 *   npm run overlap                   alle lessen met de indeling van Synthesis
 *   ALLEEN=klok-,verhaal- npm run overlap
 *   LESSEN=klok-halve-uren npm run overlap
 *   BASIS=https://… WW=… npm run overlap   de echte site
 *
 * Hoe: Chrome zonder venster opent elke les en speelt hem een halve minuut
 * vanzelf door (de pijl, of de eerste keuze). Ondertussen worden telkens alle
 * knoppen en tikbare dingen gemeten. Twee knoppen die elkaar raken (en niet in
 * elkaar zitten) zijn een fout; een knop die buiten het scherm valt ook.
 * Stopt met een foutmelding als er iets gevonden is.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kiesLessen } from "./lessenkeuze.mjs";
import { onthoudGoed, zonderAlGoed } from "./controlegeheugen.mjs";

const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const kop = process.env.WW ? { Authorization: "Basic " + Buffer.from("thuisles:" + process.env.WW).toString("base64") } : {};
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

const lessen = kiesLessen;

const APPARATEN = [
  { naam: "laptop", b: 1440, h: 900, mobiel: false },
  { naam: "kleine laptop", b: 1280, h: 720, mobiel: false },
  { naam: "tablet staand", b: 820, h: 1180, mobiel: true },
  { naam: "tablet liggend", b: 1180, h: 820, mobiel: true },
  { naam: "telefoon staand", b: 390, h: 844, mobiel: true },
  { naam: "telefoon liggend", b: 844, h: 390, mobiel: true },
];

const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));

/* Alle gestarte Chromes: bij stoppen (ook Ctrl-C of kill) altijd opruimen, anders blijven ze de laptop belasten. */
const ALLE_CHROMES = new Set();
const ruimOp = () => ALLE_CHROMES.forEach((p) => p.kill("SIGKILL"));
process.on("exit", ruimOp);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => process.exit(130));
async function startChrome() {
  const map = mkdtempSync(join(tmpdir(), "overlapcontrole-"));
  const poort = 9600 + Math.floor(Math.random() * 150);
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

/* In de pagina: alle zichtbare knoppen meten en botsingen zoeken. */
const MEET = `(() => {
  const sel = 'button, a[href], [role="button"], [data-knop], input, [data-plek]';
  const els = [...document.querySelectorAll(sel)].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.15 || cs.pointerEvents === "none") return false;
    /*
      Ook niet als het scherm eromheen nog onzichtbaar is (30 okt 2026). Het lesvlak staat
      met opacity 0 en zonder schaal klaar tot het op maat is gezet; op een drukke laptop
      duurt dat seconden, en dan stonden Pauze en "Praten met Bliepo" van dat onzichtbare,
      nog niet geschaalde scherm als "buiten beeld" in de controle. Een kind ziet dat nooit.
    */
    let zicht = 1;
    for (let o = el.parentElement; o && o !== document.body; o = o.parentElement) zicht *= Number(getComputedStyle(o).opacity);
    if (zicht < 0.15) return false;
    /* Next.js-ontwikkelknop niet meetellen. */
    if (el.closest("nextjs-portal, [data-nextjs-toast], #__next-build-watcher")) return false;
    return true;
  });
  const naam = (el) => (el.getAttribute("data-knop") || el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\\s+/g, " ").slice(0, 30);
  const fouten = [];
  const W = innerWidth, H = innerHeight;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1) fouten.push("buiten beeld: " + naam(el));
  }
  /* Vaste plek (besluit eigenaar 28 okt): antwoordknoppen (vraagteken, vinkje, Ja/Nee, keuzes bij Bliepo's vraag) staan bij Bliepo. */
  for (const el of els) {
    const k = el.getAttribute("data-knop") || "";
    const t = (el.textContent || "").trim();
    const antwoordknop = ["weetniet", "controleer"].includes(k) || /^(Ja|Nee)$/.test(t);
    if (antwoordknop && !el.closest(".bliepo-vloer")) fouten.push("antwoordknop niet op de vaste plek bij Bliepo: " + naam(el));
  }
  /* Tekst van Bliepo niet afgesneden. */
  for (const z of document.querySelectorAll(".bliepo-tekst")) {
    const r = z.getBoundingClientRect();
    if (r.width < 4) continue;
    if (r.right > W + 1 || r.left < -1 || r.bottom > H + 1) fouten.push("tekst van Bliepo valt buiten beeld");
    /* Tekst van Bliepo over een knop buiten zijn eigen wolk (zoals de naam- en pauzebalk). */
    for (const el of els) {
      if (z.closest(".bliepo-vloer") && el.closest(".bliepo-vloer")) continue;
      const q = el.getBoundingClientRect();
      const x = Math.min(r.right, q.right) - Math.max(r.left, q.left);
      const y = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (x > 2 && y > 2) fouten.push("tekst van Bliepo over een knop: " + naam(el));
    }
    const ouder = z.closest(".bliepo-vloer-ballon, .les-staand");
    if (ouder && z.scrollWidth > z.clientWidth + 2) fouten.push("tekst van Bliepo afgesneden");
  }
  for (let i = 0; i < els.length; i++)
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i], b = els[j];
      if (a.contains(b) || b.contains(a)) continue;
      const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
      const x = Math.min(p.right, q.right) - Math.max(p.left, q.left);
      const y = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (x > 2 && y > 2) fouten.push("overlap: " + naam(a) + " × " + naam(b));
    }
  return fouten;
})()`;

/* Een stap verder spelen: de pijl, anders de eerste keuze, anders niets. */
const SPEEL = `(() => {
  const k = document.querySelector('[data-knop="verder"]') || document.querySelector('[data-controleer]');
  if (k) { k.click(); return "verder"; }
  const keuze = document.querySelector('[class*="bediening"] button[aria-pressed]');
  if (keuze) { keuze.click(); return "keuze"; }
  return null;
})()`;

async function controleer(c, id, apparaat) {
  const { targetId } = await c.stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await c.stuur("Target.attachToTarget", { targetId, flatten: true });
  const ev = async (e) => {
    const r = await c.stuur("Runtime.evaluate", { expression: e, returnByValue: true }, s);
    return r.exceptionDetails ? null : r.result?.value;
  };
  const gevonden = new Set();
  try {
    await c.stuur("Page.enable", {}, s);
    await c.stuur("Network.enable", {}, s);
    if (process.env.WW) await c.stuur("Network.setExtraHTTPHeaders", { headers: kop }, s);
    await c.stuur("Emulation.setDeviceMetricsOverride", { width: apparaat.b, height: apparaat.h, deviceScaleFactor: 1, mobile: apparaat.mobiel }, s);
    if (apparaat.mobiel) await c.stuur("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, s);
    await c.stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${id}?naam=Testkind` }, s);
    await wacht(8000);
    const tot = Date.now() + Number(process.env.DUUR ?? 30000);
    /* Alleen wat in twee metingen achter elkaar staat telt (niet een tussenstand van een animatie). */
    let vorige = new Set();
    while (Date.now() < tot) {
      const nu = new Set((await ev(MEET)) ?? []);
      for (const f of nu) if (vorige.has(f) && !gevonden.has(f)) {
        gevonden.add(f);
        /* FOTO=map: een foto van het scherm met de fout. */
        if (process.env.FOTO) {
          const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
          const { mkdirSync, writeFileSync } = await import("node:fs");
          mkdirSync(process.env.FOTO, { recursive: true });
          writeFileSync(join(process.env.FOTO, `${id}-${apparaat.naam.replace(/ /g, "-")}-${gevonden.size}.jpg`), Buffer.from(data, "base64"));
        }
      }
      vorige = nu;
      await wacht(700);
      const nog = new Set((await ev(MEET)) ?? []);
      for (const f of nog) if (vorige.has(f) && !gevonden.has(f)) {
        gevonden.add(f);
        if (process.env.FOTO) {
          const { data } = await c.stuur("Page.captureScreenshot", { format: "jpeg", quality: 70 }, s);
          const { mkdirSync, writeFileSync } = await import("node:fs");
          mkdirSync(process.env.FOTO, { recursive: true });
          writeFileSync(join(process.env.FOTO, `${id}-${apparaat.naam.replace(/ /g, "-")}-b${gevonden.size}.jpg`), Buffer.from(data, "base64"));
        }
      }
      vorige = nog;
      await ev(SPEEL);
      await wacht(1200);
    }
  } finally {
    await c.stuur("Target.closeTarget", { targetId }).catch(() => {});
  }
  return [...gevonden];
}

/* In de bewaking: lessen die al goed getest zijn en niet veranderd, overslaan (controlegeheugen.mjs). */
const { testen: ids, overgeslagen, afdruk } = zonderAlGoed("overlap", "overlapcontrole.mjs", lessen());
if (overgeslagen.length) console.log(`Overlapcontrole: ${overgeslagen.length} lessen overgeslagen (al goed getest, niets aan veranderd).`);
if (!ids.length) {
  console.log("Overlapcontrole: geen lessen om te controleren.");
  process.exit(0);
}
/* Draait de site niet, dan in de bewaking overslaan (zoals de vloeiendheidscontrole). */
try {
  await fetch(BASIS, { headers: kop });
} catch {
  console.log(`⚠️  Overlapcontrole overgeslagen: de site draait niet op ${BASIS} (start eerst npm run dev).`);
  process.exit(process.env.BEWAAK === "1" ? 0 : 1);
}
const chrome = await startChrome();
const c = await verbind(chrome.url);
let fout = 0;
const goed = [];
for (const id of ids) {
  let lesFout = 0;
  for (const a of APPARATEN) {
    const lijst = await controleer(c, id, a);
    if (lijst.length) {
      fout += lijst.length;
      lesFout += lijst.length;
      console.log(`✗ ${id}, ${a.naam}:\n   - ${lijst.join("\n   - ")}`);
    } else console.log(`✓ ${id}, ${a.naam}`);
  }
  if (!lesFout) goed.push(id);
}
onthoudGoed("overlap", afdruk, goed);
c.sluit();
chrome.stop();
console.log(fout ? `\nOverlapcontrole: ${fout} keer iets dat overlapt of buiten beeld valt.` : "\nOverlapcontrole: niets overlapt.");
process.exit(fout ? 1 : 0);
