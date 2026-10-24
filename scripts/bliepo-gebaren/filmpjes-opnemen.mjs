// Nieuwe filmpjes van Bliepo met de echte bewegingen (24 oktober 2026). Recht naar de camera.
import { cdp, wacht } from "./cdp.mjs";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
const FPS = 24, B = 500, H = 600;
const { st, ws } = await cdp();
const { targetId } = await st("Target.createTarget", { url: "about:blank" });
const { sessionId: s } = await st("Target.attachToTarget", { targetId, flatten: true });
await st("Page.enable", {}, s);
const qs = new URLSearchParams({ opname: "1", b: String(B), h: String(H), hoek: "-0.16", afstand: "7.0", hoogte: "2.14", lens: "35.6" });
await st("Page.navigate", { url: "http://localhost:3000/voorbeeld-bliepo?" + qs }, s);
for (let i = 0; i < 80; i++) { await wacht(500); const r = await st("Runtime.evaluate", { returnByValue: true, expression: "document.body.dataset.opname" }, s); if (r.result?.value === "klaar") break; }
const ev = async (e) => (await st("Runtime.evaluate", { returnByValue: true, awaitPromise: true, expression: e }, s)).result?.value;
await ev("window.__opname.besturing.levendig.volgendGebaar=1e9");
const kijkOp = (t, plan) => { for (const [van, tot, k] of plan) if (t >= van && t < tot) return k; return null; };
const spraakOp = (t) => Math.max(0, Math.min(1, .2 + .6 * Math.abs(Math.sin(t * 8.7) * Math.sin(t * 2.3 + .7)) + .15 * Math.sin(t * 13.1)));
const GEBAAR = { vraag: "vraag1", wijzen: "wijzen1", latenzien: "wijzen2", tellen: "tellen", nadenken: "nadenken", duim: "duim", klappen: "klappen", knikken: "knikken", troost: "geruststellen", aanmoedigen: "knikken2", zwaaien: "zwaaien2" };
const alleen = process.argv.slice(2);
const sporen = {}, pieken = {};
async function neem(naam, duur, stapOpties, bijT) {
  const map = `robot/film2/${naam}`; rmSync(map, { recursive: true, force: true }); mkdirSync(map, { recursive: true });
  const spoor = [];
  for (let i = 0; i < Math.round(duur * FPS); i++) {
    const t = i / FPS;
    await bijT?.(t);
    const r = await ev(`JSON.stringify(window.__opname.stap(${1 / FPS}, ${JSON.stringify(stapOpties(t))}))`);
    const { beeld, scherm } = JSON.parse(r);
    writeFileSync(`${map}/${String(i).padStart(4, "0")}.png`, Buffer.from(beeld.split(",")[1], "base64"));
    spoor.push(scherm.flat());
  }
  sporen[naam] = spoor;
  console.log(naam, spoor.length, "beeldjes");
}
async function rustig(sec, opties) { for (let i = 0; i < FPS * sec; i++) await ev(`void window.__opname.stap(${1 / FPS}, ${JSON.stringify(opties(i / FPS))})`); }

/* Rust: niet aan het praten, kijkt af en toe rond (de lus wordt later naadloos gemaakt). */
if (!alleen.length || alleen.includes("rust")) {
  await ev(`window.__opname.stopEcht(); window.__opname.praat(false); window.__opname.speel('idle')`);
  await rustig(3, () => ({ kijk: { x: 0, y: 0 }, spraak: null }));
  const plan = [[1.2, 3.4, { x: -.7, y: .3 }], [4.6, 6.6, { x: .55, y: .35 }]];
  await neem("rust", 8.5, (t) => ({ kijk: kijkOp(t, plan) ?? { x: 0, y: 0 }, spraak: null }));
}
/* Praten: recht naar de camera, de praat-bewegingen lopen door op een nagebootste stem. */
if (!alleen.length || alleen.includes("praten")) {
  await ev(`window.__opname.speel('idle'); window.__opname.praat(true, true)`);
  await rustig(3, (t) => ({ kijk: null, spraak: spraakOp(t - 3) }));
  await neem("praten", 8.5, (t) => ({ kijk: null, spraak: spraakOp(t) }));
}
/* De gebaren: recht naar de camera, het gebaar één keer, en aan het eind zacht terug naar rust. */
for (const [naam, clip] of Object.entries(GEBAAR)) {
  if (alleen.length && !alleen.includes(naam)) continue;
  await ev(`window.__opname.stopEcht(); window.__opname.speel('idle'); window.__opname.praat(true, false)`);
  await rustig(2.5, () => ({ kijk: null, spraak: null }));
  const piek = await ev(`window.__opname.piek('${clip}')`);
  const duur = Math.min(await ev(`window.__opname.duur('${clip}')`), piek + 1.6);
  pieken[naam] = +piek.toFixed(3);
  await ev(`window.__opname.speelEcht('${clip}')`);
  let gestopt = false;
  await neem(naam, duur + 0.45, () => ({ kijk: null, spraak: null }), async (t) => {
    if (!gestopt && t >= duur - 0.1) { gestopt = true; await ev(`window.__opname.stopEcht(); window.__opname.speel('idle')`); }
  });
}
/* Juichen: de eigen beweging uit zappie.js (sprongetje, armen omhoog, rondje op zijn wielen), in dezelfde houding. */
if (alleen.includes("juichen")) {
  await ev(`window.__opname.stopEcht(); window.__opname.speel('idle'); window.__opname.praat(true, false)`);
  await rustig(2.5, () => ({ kijk: null, spraak: null }));
  await ev(`window.__opname.speel('correct')`);
  await neem("juichen", 3.2, () => ({ kijk: null, spraak: null }));
}
writeFileSync(`robot/film2/schermen-ruw${alleen.length ? "-" + alleen.join("-") : ""}.json`, JSON.stringify({ fps: FPS, b: B, h: H, clips: sporen, piek: pieken }));
await st("Target.closeTarget", { targetId }); ws.close();
