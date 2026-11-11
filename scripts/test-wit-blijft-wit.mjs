/**
 * Test voor F7 "wit en daarna weer grijs" (KEUZES-VOOR-SARA.md Ronde 28b punt 9; opgelost 11 november 2026, Ronde 30).
 *
 * Bij elke zin vraagt Bliepo eerst aan de site of Ruth die zin al heeft (/api/stem). Duurt dat langer dan 2,5 s, dan werd
 * de wachtende zin wit; begon Bliepo hem daarna toch, dan werd hij weer grijs. Sinds 11 november blijft een zin die al wit
 * is, wit, in lessen met de optie stemHeelUitpraten (BliepoTekst.tsx, lib/stem.ts praatHeelUit). Oude lessen: ongewijzigd.
 *
 * Dit script maakt die vraag aan de site expres traag (TRAGESERVER ms, standaard 3500) en speelt een les een tijdje met
 * de nepstem. Een eenvoudige speler tikt steeds het goede antwoord dat de les zelf klaarzet (window.__phaser.antwoord, zoals
 * de speelcontrole). Het telt hoe vaak dezelfde tekst na wit weer gedimd werd (moet 0) en hoe vaak een zin wit werd voordat
 * Bliepo hem zei (dan heeft de test het probleem echt nagebootst).
 *
 *   node scripts/test-wit-blijft-wit.mjs                                        Plussommen en Minsommen, elk 150 s
 *   LESSEN=squla-klok-hoelaat-1-gouden DUUR=120 node scripts/test-wit-blijft-wit.mjs
 *
 * Chrome zonder venster, leeg profiel, `?naam=Testkind`, zonder koekje: er komt niets in de voortgang van een kind. Na
 * afloop: geen nieuwe regels in les_uitkomsten (de database wordt alleen gelezen). Ruimt Chrome op, ook bij stoppen.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASIS = "http://localhost:3000";
const LESSEN = (process.env.LESSEN ?? "squla-plus-bakkerij-1-gouden,squla-min-machine-1-gouden").split(",");
const TRAAG = Number(process.env.TRAGESERVER ?? 3500);
const DUUR = Number(process.env.DUUR ?? 150) * 1000;
const DB = new URL("../data/thuisles.db", import.meta.url).pathname;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find((p) => existsSync(p));
const sql = (q) => execFileSync("sqlite3", ["-readonly", DB, q], { encoding: "utf8" }).trim();
const startId = Number(sql("select coalesce(max(id), 0) from les_uitkomsten;"));

const map = mkdtempSync(join(tmpdir(), "test-wit-blijft-wit-"));
const poort = 9760 + (process.pid % 30);
const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--no-first-run", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
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

const IN_PAGINA = `
  /* De vraag aan de site of Ruth de zin heeft, expres traag. */
  { const F0 = window.fetch; window.fetch = function (u, ...r) { const url = String(u && u.url ? u.url : u); if (url.includes("/api/stem")) return new Promise((ok) => setTimeout(ok, ${TRAAG})).then(() => F0.call(this, u, ...r)); return F0.call(this, u, ...r); }; }
  /* Nepstem: elke zin duurt even (zoals scripts/test-tellen-gouden.mjs). */
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 1200); }, 20); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 400 + String(u.text || "").length * 25); }, 20);
  /* Meter: per zin of hij gedimd is, elke 50 ms. */
  window.__meet = []; let vorige = "";
  setInterval(() => {
    const zinnen = [...document.querySelectorAll(".bliepo-tekst")].map((e) => ({ t: e.textContent.replace(/\\s+/g, " ").trim(), dim: e.querySelectorAll(".bliepo-tekst-nog, .bliepo-tekst-later").length > 0 || e.classList.contains("bliepo-tekst-later"), leest: e.classList.contains("bliepo-tekst-leest") })).filter((z) => z.t);
    const k = JSON.stringify(zinnen);
    if (k !== vorige) { vorige = k; window.__meet.push({ t: Math.round(performance.now()), zinnen }); }
  }, 50);
`;

let fouten = 0;
for (const les of LESSEN) {
  const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
  const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
  await stuur("Page.enable", {}, s);
  await stuur("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  await stuur("Page.addScriptToEvaluateOnNewDocument", { source: IN_PAGINA }, s);
  await stuur("Network.enable", {}, s);
  await stuur("Network.clearBrowserCookies", {}, s);
  const ev = async (e) => {
    const r = await stuur("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }, s).catch(() => null);
    return r && !r.exceptionDetails ? r.result?.value : null;
  };
  await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${les}?naam=Testkind` }, s);
  for (let i = 0; i < 100 && !(await ev(`document.querySelectorAll(".bliepo-tekst").length`)); i++) await wacht(200);
  await wacht(400);
  /* 1 tik naast het speelvlak (Chrome laat pas geluid toe na een tik). */
  for (const type of ["mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x: 430, y: 90, button: "left", clickCount: 1, buttons: type === "mousePressed" ? 1 : 0 }, s);
  const t0 = Date.now();
  let tikken = 0;
  while (Date.now() - t0 < DUUR) {
    /* De speler: het goede antwoord dat de les klaarzet (knop met die tekst, of een ding in het vlak); daarna Ja/Nee. */
    const ok = await ev(`(() => { const a = window.__phaser?.antwoord ?? (window.__phaser?.klokTaak?.soort === "kies" ? window.__phaser.klokTaak.goed : null); if (a == null) return false; const z = (b) => b && !b.disabled && b.getBoundingClientRect().width > 3; const b = [...document.querySelectorAll("button")].find((b) => z(b) && (b.textContent || "").trim() === String(a)) || [...document.querySelectorAll('[data-ding="' + a + '"]')].find(z); if (!b) return false; b.click(); return true; })()`);
    if (ok) tikken++;
    else await ev(`(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Nee" && b.getBoundingClientRect().width > 3); if (b) b.click(); })()`);
    await wacht(ok ? 1500 : 400);
  }
  const m = JSON.parse((await ev(`JSON.stringify(window.__meet)`)) ?? "[]");
  /* Per zin: de rij momenten (gedimd / wit). Wit na gedimd en daarna weer gedimd (zelfde zin, zonder dat hij verdween) = F7. */
  let weerGrijs = 0;
  let witVoorStem = 0;
  const vb = [];
  const status = new Map();
  for (const r of m) {
    const nu = new Map(r.zinnen.map((z) => [z.t, z]));
    for (const [t, oud] of status) if (!nu.has(t)) status.delete(t);
    for (const [t, z] of nu) {
      const o = status.get(t) ?? { wasWit: false, dimNaWit: false, gelezen: false };
      if (z.leest) o.gelezen = true;
      if (!z.dim && !o.wasWit) {
        o.wasWit = true;
        if (!o.gelezen) witVoorStem++;
      }
      if (z.dim && o.wasWit && !o.dimNaWit) {
        o.dimNaWit = true;
        weerGrijs++;
        if (vb.length < 4) vb.push(t.slice(0, 70));
      }
      status.set(t, o);
    }
  }
  console.log(`${les}: ${DUUR / 1000} s gespeeld met de vraag aan de site ${TRAAG} ms traag; ${tikken} antwoorden getikt; ${witVoorStem} keer werd een zin wit vóór Bliepo hem zei; ${weerGrijs} keer werd een witte zin daarna weer grijs (moet 0).`);
  for (const v of vb) console.log(`   weer grijs: "${v}"`);
  if (weerGrijs) fouten++;
  await stuur("Target.closeTarget", { targetId }).catch(() => {});
}
const nieuw = Number(sql(`select count(*) from les_uitkomsten where id > ${startId};`));
console.log(`Nieuwe regels in les_uitkomsten: ${nieuw} (hoogste id was ${startId})`);
if (nieuw) fouten++;
console.log(fouten ? "FOUT" : "Alles in orde.");
process.exit(fouten ? 1 : 0);
