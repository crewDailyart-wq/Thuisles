/**
 * Schermfoto's en een GIF van de kaart die vol loopt (voorbeeld, 27 nov 2026). UIT=map PERC=100,85,55,15 node scripts/foto-kaartvol.mjs
 * Per percentage: foto van het eindscherm, GIF van het vullen, foto van het onderwerpenscherm. Niets wordt bewaard.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const UIT = process.env.UIT;
if (!UIT) throw new Error("zet UIT=<map>");
mkdirSync(UIT, { recursive: true });
const PERC = (process.env.PERC ?? "100,85,55,15").split(",").map(Number);
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const map = mkdtempSync(join(tmpdir(), "foto-kv-"));
const poort = 9800 + (process.pid % 50);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--mute-audio", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--window-size=1280,720", "--no-first-run", "about:blank"], { stdio: "ignore" });
process.on("exit", () => { try { chrome.kill("SIGKILL"); } catch {} try { rmSync(map, { recursive: true, force: true }); } catch {} });
let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); } }
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let n = 0; const w = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); } });
const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; w.set(id, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params, sessionId })); });
await wacht(1500);
const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
await stuur("Page.enable", {}, s);
await stuur("Target.activateTarget", { targetId });
await stuur("Page.bringToFront", {}, s);
await stuur("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }, s);
const vang = async (q = 60) => { for (let i = 0; i < 20; i++) { try { return Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: q }, s)).data, "base64"); } catch { await wacht(150); await stuur("Page.bringToFront", {}, s).catch(() => {}); } } throw new Error("geen schermfoto"); };
const naam = (p) => String(p).padStart(3, "0");
for (const p of PERC) {
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/kaart-vol?pct=${p}` }, s);
  const frames = [];
  for (let i = 0; i < 46; i++) { frames.push(await vang()); await wacht(70); }
  await wacht(500);
  writeFileSync(join(UIT, `${naam(p)}-1-eindscherm.jpg`), await vang(88));
  const B = 640, H = 360;
  const raws = await Promise.all(frames.map((f) => sharp(f).resize(B, H).removeAlpha().raw().toBuffer()));
  await sharp(Buffer.concat(raws), { raw: { width: B, height: H * raws.length, channels: 3, pageHeight: H } }).gif({ delay: raws.map(() => 110), loop: 0 }).toFile(join(UIT, `${naam(p)}-2-filmpje.gif`));
  await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/kaart-vol?pct=${p}&scherm=onderwerpen` }, s);
  await wacht(1500);
  writeFileSync(join(UIT, `${naam(p)}-3-onderwerpen.jpg`), await vang(88));
}
process.exit(0);
