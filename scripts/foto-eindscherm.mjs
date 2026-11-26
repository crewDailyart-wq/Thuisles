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

const VERSIES = (process.env.VERSIES ?? "1,2").split(",");
for (const v of VERSIES) {
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/les/${LES}?naam=Testkind&snel=p72&blijf=1&eind=${v}` }, s);
  await wacht(1500);
  await langsStartknop(ev, tik);
  /* wacht tot het eindscherm begint */
  let begin = null;
  const w0 = Date.now();
  while (Date.now() - w0 < 40000 && !begin) {
    begin = await ev(`!!document.querySelector("[data-eindscherm]")`);
    if (!begin) await wacht(100);
  }
  const t0 = Date.now();
  const frames = [];
  const stills = [[500, "1-ster-draait"], [1100, "2-licht-flits"], [2000, "3-ster-landt"], [3400, "4-sleutel-erbij"], [5600, "5-ster-en-sleutel-klein-of-weg"], [7600, "6-leerzin"], [9200, "7-kaart-licht-op"]];
  let st = 0;
  let kaart = null;
  while (Date.now() - t0 < 16000) {
    const nu = Date.now() - t0;
    const data = (await stuur("Page.captureScreenshot", { format: "jpeg", quality: 60 }, s)).data;
    frames.push(Buffer.from(data, "base64"));
    if (st < stills.length && nu >= stills[st][0]) { await foto(`versie${v}-${stills[st][1]}.jpg`); st++; }
    if (!kaart) kaart = await ev(`(() => { const k = document.querySelector("[data-eind-kaart]"); if (!k) return null; const r = k.getBoundingClientRect(); return r.width > 10 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; })()`);
    if (kaart && st >= stills.length) break;
  }
  if (kaart) {
    await tik(kaart);
    for (let i = 0; i < 12; i++) { frames.push(Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 60 }, s)).data, "base64")); await wacht(100); }
    await foto(`versie${v}-8-na-de-tik.jpg`);
  }
  const B = 640, H = 360;
  const raws = await Promise.all(frames.map((f) => sharp(f).resize(B, H).removeAlpha().raw().toBuffer()));
  if (raws.length) await sharp(Buffer.concat(raws), { raw: { width: B, height: H * raws.length, channels: 3, pageHeight: H } }).gif({ delay: raws.map(() => 120), loop: 0 }).toFile(join(UIT, `versie${v}-filmpje.gif`));
  console.log("versie", v, raws.length, "beelden", kaart ? "kaart ok" : "geen kaart");
}
process.exit(0);
