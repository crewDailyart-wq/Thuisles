/**
 * Schermfoto's en een filmpje (GIF) van het eindscherm in Tellen extra, per uitslag (25 november 2026).
 *   UIT=map node scripts/foto-eindscherm.mjs            (alles, gewoon, moeite)
 * Speelt `?snel=<uitslag>&blijf=1` op de voorbeeldpagina met Testkind, zonder koekje van een kind: er wordt niets bewaard.
 * Stem en geluid zijn nagebootst. Venster 1280 x 720.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { langsStartknop } from "./startknop-hulp.mjs";

const UIT = process.env.UIT;
if (!UIT) throw new Error("zet UIT=<map>");
mkdirSync(UIT, { recursive: true });
const LES = "squla-tellen-fruit-1-gouden-extra";
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const map = mkdtempSync(join(tmpdir(), "foto-eind-"));
const poort = 9700 + (process.pid % 50);
const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--window-size=1280,720", "--no-first-run", "about:blank"], { stdio: "ignore" });
process.on("exit", () => { try { chrome.kill("SIGKILL"); } catch {} try { rmSync(map, { recursive: true, force: true }); } catch {} });
let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); } }
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let n = 0; const w = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); } });
const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; w.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params, sessionId })); });
const { targetInfos } = await stuur("Target.getTargets");
const { sessionId: s } = await stuur("Target.attachToTarget", { targetId: targetInfos.find((t) => t.type === "page").targetId, flatten: true });
await stuur("Page.enable", {}, s);
await stuur("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }, s);
const ev = async (expression) => (await stuur("Runtime.evaluate", { expression, returnByValue: true }, s)).result.value;
const tik = async ({ x, y }) => { for (const type of ["mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }, s); };
await stuur("Page.addScriptToEvaluateOnNewDocument", { source: `
  HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 900); }, 50); return Promise.resolve(); };
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 400 + String(u.text || "").length * 25); }, 30);
` }, s);

const foto = async (naam) => writeFileSync(join(UIT, naam), Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 85 }, s)).data, "base64"));

for (const uitslag of ["alles", "gewoon", "moeite"]) {
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/les/${LES}?naam=Testkind&snel=${uitslag}&blijf=1` }, s);
  await wacht(1500);
  await langsStartknop(ev, tik);
  const frames = [];
  const t0 = Date.now();
  let klaar = false;
  let teller = false;
  while (Date.now() - t0 < 40000 && !klaar) {
    const data = (await stuur("Page.captureScreenshot", { format: "jpeg", quality: 60 }, s)).data;
    frames.push({ t: Date.now() - t0, b: Buffer.from(data, "base64") });
    const st = await ev(`({ teller: document.querySelector("[data-sleutelteller]")?.getAttribute("data-sleutels") ?? null, eind: !!document.querySelector("[data-eindscherm]"), leer: !!document.querySelector("[data-eind-leerzin]") })`);
    if (st.teller !== null && Number(st.teller) >= 2 && !teller) { teller = true; await foto(`${uitslag}-1-teller-in-de-les.jpg`); }
    if (st.leer) { await wacht(1500); await foto(`${uitslag}-2-eindscherm.jpg`); klaar = true; }
  }
  /* filmpje: laatste ±9 s, op de helft verkleind */
  const uitFrames = frames.slice(-60);
  const B = 640, H = 360;
  const raws = await Promise.all(uitFrames.map((f) => sharp(f.b).resize(B, H).removeAlpha().raw().toBuffer()));
  if (raws.length) {
    await sharp(Buffer.concat(raws), { raw: { width: B, height: H * raws.length, channels: 3, pageHeight: H } }).gif({ delay: raws.map(() => 150), loop: 0 }).toFile(join(UIT, `${uitslag}-3-filmpje.gif`));
  }
  console.log(uitslag, klaar ? "ok" : "geen eindscherm gezien", raws.length, "beelden");
}
process.exit(0);
