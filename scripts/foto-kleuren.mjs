/**
 * Schermfoto's en een filmpje (GIF) van de kaart na de tik, voor elke kleur (26 november 2026), in Tellen extra.
 *   UIT=map node scripts/foto-kleuren.mjs            (alle 11 kleuren; PERC=72,40 voor een paar)
 * Speelt `?snel=p<percentage>&blijf=1` op de voorbeeldpagina met Testkind, zonder koekje van een kind: er wordt niets bewaard.
 * Per kleur: foto 1 = de kaart licht zacht op (vóór de tik), foto 2 = na de tik (vinkje en kleur), foto 3 = het
 * onderwerpenscherm met die kleur (`/voorbeeld/onderwerpen?demo=<p>`), plus een GIF van vlak voor tot vlak na de tik.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { langsStartknop } from "./startknop-hulp.mjs";

const UIT = process.env.UIT;
if (!UIT) throw new Error("zet UIT=<map>");
mkdirSync(UIT, { recursive: true });
const LES = "squla-tellen-fruit-1-gouden-extra";
const PERC = (process.env.PERC ?? "100,92,87,82,77,72,65,55,45,35,20").split(",").map(Number);
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const map = mkdtempSync(join(tmpdir(), "foto-kleur-"));
const poort = 9750 + (process.pid % 50);
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
const rap = [];

for (const p of PERC) {
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/les/${LES}?naam=Testkind&snel=p${p}&blijf=1` }, s);
  await wacht(1500);
  await langsStartknop(ev, tik);
  const frames = [];
  const t0 = Date.now();
  let kaart = null;
  while (Date.now() - t0 < 45000 && !kaart) {
    kaart = await ev(`(() => { const k = document.querySelector("[data-eind-kaart]"); if (!k) return null; const r = k.getBoundingClientRect(); return r.width > 10 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; })()`);
    if (!kaart) await wacht(150);
  }
  if (!kaart) { rap.push(`${p}%: geen kaart gezien`); continue; }
  const pre = [];
  for (let i = 0; i < 12; i++) { pre.push(Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 60 }, s)).data, "base64")); await wacht(90); }
  await foto(`${String(p).padStart(3, "0")}-1-kaart-licht-op.jpg`);
  await tik(kaart);
  const post = [];
  for (let i = 0; i < 22; i++) { post.push(Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 60 }, s)).data, "base64")); await wacht(90); }
  await wacht(800);
  await foto(`${String(p).padStart(3, "0")}-2-na-de-tik.jpg`);
  const stand = await ev(`document.querySelector("[data-eind-kaart]")?.getAttribute("data-afgevinkt")`);
  rap.push(`${p}%: kaart na de tik = ${stand}`);
  const B = 640, H = 360;
  const raws = await Promise.all([...pre, ...post].map((f) => sharp(f).resize(B, H).removeAlpha().raw().toBuffer()));
  await sharp(Buffer.concat(raws), { raw: { width: B, height: H * raws.length, channels: 3, pageHeight: H } }).gif({ delay: raws.map(() => 110), loop: 0 }).toFile(join(UIT, `${String(p).padStart(3, "0")}-3-filmpje.gif`));
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/onderwerpen?demo=${p}` }, s);
  await wacht(1500);
  await foto(`${String(p).padStart(3, "0")}-4-onderwerpen.jpg`);
}
await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/onderwerpen?demo=55&dagen=3` }, s);
await wacht(1500);
await foto("herhaal-teken-onderwerpen.jpg");
console.log(rap.join("\n"));
process.exit(0);
