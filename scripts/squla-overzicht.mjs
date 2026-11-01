/**
 * Maakt het overzicht van de Squla-lessen voor /admin/overzicht-squla
 * (1 november 2026): een lijst van alle lessen en per les een schermfoto van
 * het beginscherm (laptop, 1280 × 800), in public/squla-overzicht/ (niet in Git).
 *
 * Alleen lessen zonder foto, of waarvan het bestand nieuwer is dan de foto,
 * worden opnieuw gefotografeerd (ALLES=1: alles opnieuw). De dev-server moet
 * draaien. Speelt als Testkind. De status (gekeurd/afgekeurd) leest de pagina
 * zelf uit CONTROLE-SQULA.md.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { squlaLessen } from "./voorwerpen/lessen.mjs";

const WORTEL = path.resolve(import.meta.dirname, "..");
const MAP = path.join(WORTEL, "public/squla-overzicht");
const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const WACHT = Number(process.env.WACHT ?? 12000);
const TEGELIJK = Number(process.env.TEGELIJK ?? 3);
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(MAP, { recursive: true });

const ONDERWERP = {
  "squla-tellen": "Tellen", "squla-getallenlijn": "Getallenlijn", "squla-tijd": "Tijd", "squla-meer-minder": "Meer, minder, evenveel",
  "squla-minsommen": "Minsommen", "squla-plussommen": "Plussommen", "squla-geld": "Geld", "squla-meten": "Meten en maten",
  "squla-vormen": "Vormen en figuren", "squla-klok": "Klokkijken", "squla-splitsen": "Splitsen", "squla-piraat": "Piratenschat",
  "squla-rekenmix": "Rekenmix",
};
const lessen = (await squlaLessen()).map((l) => ({ ...l, onderwerp: ONDERWERP[l.bestand.replace(/\.tsx$/, "")] ?? "Eerste voorbeelden" }));
const bronTijd = (l) => statSync(path.join(WORTEL, "src/components/les/lessen", l.bestand)).mtimeMs;
const foto = (l) => path.join(MAP, `${l.id}.jpg`);
const teDoen = lessen.filter((l) => process.env.ALLES || !existsSync(foto(l)) || statSync(foto(l)).mtimeMs < bronTijd(l));

const schrijf = () =>
  writeFileSync(
    path.join(MAP, "overzicht.json"),
    JSON.stringify({ gemaakt: new Date().toISOString(), lessen: lessen.map((l) => ({ id: l.id, titel: l.titel, onderwerp: l.onderwerp, foto: existsSync(foto(l)) ? `${l.id}.jpg?t=${Math.round(statSync(foto(l)).mtimeMs)}` : null })) }, null, 1),
  );
schrijf();
console.log(`${lessen.length} lessen; ${teDoen.length} schermfoto's te maken.`);
if (!teDoen.length) process.exit(0);

const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && existsSync(p));
const dir = mkdtempSync(path.join(tmpdir(), "overzicht-"));
const poort = 9800 + (process.pid % 150);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${dir}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
process.on("exit", () => { chrome.kill("SIGKILL"); try { rmSync(dir, { recursive: true, force: true }); } catch {} });
let ws;
for (let i = 0; i < 50 && !ws; i++) {
  try { ws = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); }
}
const sok = new WebSocket(ws);
await new Promise((r) => sok.addEventListener("open", r));
let n = 0;
const wachtend = new Map();
sok.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && wachtend.has(m.id)) wachtend.get(m.id)(m), wachtend.delete(m.id); });
const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); sok.send(JSON.stringify({ id, method, params, sessionId })); });
const SNEL = `HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); t.dispatchEvent(new Event("ended")); }, 80); return Promise.resolve(); };
if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 80); }, 20);`;

const rij = [...teDoen];
let klaar = 0;
await Promise.all(
  Array.from({ length: TEGELIJK }, async () => {
    while (rij.length) {
      const l = rij.shift();
      try {
        const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
        const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
        await stuur("Page.enable", {}, s);
        await stuur("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, s);
        await stuur("Page.addScriptToEvaluateOnNewDocument", { source: SNEL }, s);
        await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${l.id}?naam=Testkind` }, s);
        await wacht(WACHT);
        const { data } = await stuur("Page.captureScreenshot", { format: "jpeg", quality: 72 }, s);
        writeFileSync(foto(l), Buffer.from(data, "base64"));
        await stuur("Target.closeTarget", { targetId });
        klaar++;
        if (klaar % 10 === 0) schrijf();
      } catch (e) {
        console.warn(`${l.id}: ${e.message}`);
      }
    }
  }),
);
schrijf();
console.log(`Klaar: ${klaar} schermfoto's.`);
process.exit(0);
