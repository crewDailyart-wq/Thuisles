/**
 * De hele reeks in Fruit tellen extra als GIF (26 november 2026): de les met de bovenbalk (voortgang, sleutel en ster met aantal,
 * sleuteltjes die vliegen met pling), het eindscherm (ster draait en licht op, sleutel, leerzin, kaart), de tik op de kaart
 * (vinkje en kleur) en terug naar de onderwerpen met de gekleurde kaart.
 *   UIT=map PERC=72 node scripts/foto-reeks.mjs
 * Speelt de snelle test (`?snel=p<percentage>`) zonder `blijf`: na de tik gaat de pagina echt terug naar de onderwerpen. Er wordt niets bewaard.
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
const PERC = process.env.PERC ?? "72";
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
const map = mkdtempSync(join(tmpdir(), "reeks-"));
const poort = 9850 + (process.pid % 50);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--mute-audio", `--remote-debugging-port=${poort}`, `--user-data-dir=${map}`, "--window-size=1280,720", "--no-first-run", "about:blank"], { stdio: "ignore" });
process.on("exit", () => { try { chrome.kill("SIGKILL"); } catch {} try { rmSync(map, { recursive: true, force: true }); } catch {} });
let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl; } catch { await wacht(200); } }
const ws = new WebSocket(wsUrl); await new Promise((r) => ws.addEventListener("open", r));
let n = 0; const w = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); } });
const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; w.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id, method, params, sessionId })); });
const { targetInfos } = await stuur("Target.getTargets");
const { sessionId: s } = await stuur("Target.attachToTarget", { targetId: targetInfos.find((t) => t.type === "page").targetId, flatten: true });
await stuur("Page.enable", {}, s);
await stuur("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }, s);
const ev = async (e) => (await stuur("Runtime.evaluate", { expression: e, returnByValue: true }, s)).result.value;
const tik = async ({ x, y }) => { for (const type of ["mousePressed", "mouseReleased"]) await stuur("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }, s); };
await stuur("Page.addScriptToEvaluateOnNewDocument", { source: `HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); setTimeout(() => t.dispatchEvent(new Event("ended")), 900); }, 50); return Promise.resolve(); }; if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 400 + String(u.text || "").length * 25); }, 30);` }, s);
await stuur("Page.navigate", { url: `http://localhost:3000/voorbeeld/les/squla-tellen-fruit-1-gouden-extra?naam=Testkind&snel=p${PERC}` }, s);
await wacht(1500); await langsStartknop(ev, tik);
const frames = [];
const foto = async (naam) => writeFileSync(join(UIT, naam), Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 85 }, s)).data, "base64"));
const t0 = Date.now();
let kaart = null, getikt = false, terug = 0, fotoTeller = false;
while (Date.now() - t0 < 90000) {
  const stand = await ev(`({ pad: location.pathname, kaart: (() => { const k = document.querySelector("[data-eind-kaart]"); if (!k) return null; const r = k.getBoundingClientRect(); return r.width > 10 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; })(), sleutels: document.querySelector("[data-sleutelteller]")?.getAttribute("data-sleutels") ?? null })`).catch(() => null);
  if (!stand) { await wacht(150); continue; }
  frames.push(Buffer.from((await stuur("Page.captureScreenshot", { format: "jpeg", quality: 55 }, s)).data, "base64"));
  if (!fotoTeller && stand.sleutels && Number(stand.sleutels) >= 2) { fotoTeller = true; await foto("1-bovenbalk-sleutel-en-ster.jpg"); }
  if (stand.pad.includes("onderwerpen")) { terug++; if (terug === 8) await foto("4-terug-bij-de-onderwerpen.jpg"); if (terug > 14) break; }
  if (stand.kaart && !getikt) { await wacht(2500); await foto("2-kaart-licht-op.jpg"); await tik(stand.kaart); getikt = true; await wacht(700); await foto("3-na-de-tik.jpg"); }
}
const B = 560, H = 315;
const raws = await Promise.all(frames.map((f) => sharp(f).resize(B, H).removeAlpha().raw().toBuffer()));
await sharp(Buffer.concat(raws), { raw: { width: B, height: H * raws.length, channels: 3, pageHeight: H } }).gif({ delay: raws.map(() => 140), loop: 0, effort: 3 }).toFile(join(UIT, "HELE-REEKS.gif"));
console.log(raws.length, "beelden; getikt:", getikt, "terug bij onderwerpen:", terug > 0);
process.exit(0);
