/**
 * Stap 4 van "verwerk de inbox": schermfoto's van de lessen die de vervangen
 * plaatjes gebruiken, op laptop (1280 × 800) en tablet (820 × 1180).
 *
 *   node scripts/inbox/schermfotos.mjs voor appel,peer   (vóór het vervangen)
 *   node scripts/inbox/schermfotos.mjs na appel,peer     (erna; maakt ook voor/na naast elkaar)
 *
 * Foto's in plaatjes-inbox/.schermfotos/. Claude bekijkt ze en kijkt of niets
 * verschoven of afgesneden is. Speelt als Testkind (nooit als echt kind).
 * De dev-server moet draaien (npm run dev).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { INBOX } from "./gedeeld.mjs";
import { squlaLessen } from "../voorwerpen/lessen.mjs";

const [, , fase, lijst = ""] = process.argv;
if (!["voor", "na"].includes(fase) || !lijst) {
  console.error("Gebruik: node scripts/inbox/schermfotos.mjs voor|na naam1,naam2");
  process.exit(1);
}
const namen = lijst.split(",");
const BASIS = (process.env.BASIS ?? "http://localhost:3000").replace(/\/$/, "");
const MAP = path.join(INBOX, ".schermfotos");
mkdirSync(path.join(MAP, fase), { recursive: true });
const APPARATEN = [{ naam: "laptop", b: 1280, h: 800, mobiel: false }, { naam: "tablet", b: 820, h: 1180, mobiel: true }];
const WACHT = Number(process.env.WACHT ?? 8000);
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

const lessen = (await squlaLessen()).filter((l) => l.voorwerpen.some((n) => namen.includes(n)));
if (!lessen.length) {
  console.log("Geen les gebruikt deze plaatjes (nog).");
  process.exit(0);
}
try {
  await fetch(BASIS);
} catch {
  console.error(`De site draait niet op ${BASIS}: start eerst npm run dev.`);
  process.exit(1);
}

const CHROME = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && existsSync(p));
const dir = mkdtempSync(path.join(tmpdir(), "schermfotos-"));
const poort = 9700 + (process.pid % 200);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${poort}`, `--user-data-dir=${dir}`, "--no-first-run", "--mute-audio", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
process.on("exit", () => chrome.kill("SIGKILL"));
let ws;
for (let i = 0; i < 50 && !ws; i++) {
  try {
    ws = (await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json())).webSocketDebuggerUrl;
  } catch {
    await wacht(200);
  }
}
const sok = new WebSocket(ws);
await new Promise((r) => sok.addEventListener("open", r));
let n = 0;
const wachtend = new Map();
sok.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && wachtend.has(m.id)) wachtend.get(m.id)(m), wachtend.delete(m.id);
});
const stuur = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++n; wachtend.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); sok.send(JSON.stringify({ id, method, params, sessionId })); });
/* Bliepo praat versneld, zodat de voorwerpen snel in beeld staan. */
const SNEL = `HTMLMediaElement.prototype.play = function () { const t = this; setTimeout(() => { t.dispatchEvent(new Event("playing")); t.dispatchEvent(new Event("ended")); }, 80); return Promise.resolve(); };
if (window.speechSynthesis) window.speechSynthesis.speak = (u) => setTimeout(() => { u.onstart && u.onstart(new Event("start")); setTimeout(() => { u.onend && u.onend(new Event("end")); }, 80); }, 20);`;

const gemaakt = [];
for (const les of lessen) {
  for (const a of APPARATEN) {
    const { targetId } = await stuur("Target.createTarget", { url: "about:blank" });
    const { sessionId: s } = await stuur("Target.attachToTarget", { targetId, flatten: true });
    await stuur("Page.enable", {}, s);
    await stuur("Emulation.setDeviceMetricsOverride", { width: a.b, height: a.h, deviceScaleFactor: 1, mobile: a.mobiel }, s);
    await stuur("Page.addScriptToEvaluateOnNewDocument", { source: SNEL }, s);
    await stuur("Page.navigate", { url: `${BASIS}/voorbeeld/les/${les.id}?naam=Testkind` }, s);
    await wacht(WACHT);
    const { data } = await stuur("Page.captureScreenshot", { format: "png" }, s);
    const f = path.join(MAP, fase, `${les.id}-${a.naam}.png`);
    writeFileSync(f, Buffer.from(data, "base64"));
    gemaakt.push(f);
    await stuur("Target.closeTarget", { targetId });
  }
}
sok.close();
chrome.kill();
setTimeout(() => rmSync(dir, { recursive: true, force: true }), 1000);

/* Na: voor en na naast elkaar, om verschuiven of afsnijden te zien. */
if (fase === "na") {
  mkdirSync(path.join(MAP, "vergelijk"), { recursive: true });
  for (const f of gemaakt) {
    const voor = path.join(MAP, "voor", path.basename(f));
    if (!existsSync(voor)) continue;
    const [a, b] = await Promise.all([sharp(voor).metadata(), sharp(f).metadata()]);
    const doel = path.join(MAP, "vergelijk", path.basename(f));
    await sharp({ create: { width: a.width + b.width + 20, height: Math.max(a.height, b.height), channels: 3, background: "#ff00aa" } })
      .composite([{ input: voor, left: 0, top: 0 }, { input: f, left: a.width + 20, top: 0 }])
      .png()
      .toBuffer()
      .then((buf) => sharp(buf).resize({ width: 1600, withoutEnlargement: true }).toFile(doel));
    console.log(doel);
  }
} else gemaakt.forEach((f) => console.log(f));
process.exit(0);
