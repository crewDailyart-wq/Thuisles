/**
 * Stap 2 van "verwerk de inbox": het controle-overzicht.
 *
 * Claude bekijkt eerst zelf elk plaatje en schrijft in plaatjes-inbox/koppeling.json:
 *   { "akkoord": false, "plaatjes": [
 *       { "bestand": "IMG_12.png", "zie": "een rode appel met blaadje", "naam": "appel" },
 *       { "bestand": "x.png", "zie": "rond, oranje", "naam": null, "twijfel": ["bal-oranje", "sinaasappel"] } ] }
 *
 * Dit script maakt daar plaatjes-inbox/overzicht.html en overzicht.png van:
 * per bestand wat Claude ziet, aan welk plaatje het gekoppeld wordt, het
 * origineel, het uitgeknipte resultaat op de donkere achtergrond van de les,
 * en het plaatje dat er nu staat. Er wordt nog NIETS vervangen: dat gebeurt
 * pas na akkoord van Sara (verwerk.mjs).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { INBOX, VOORBEELD, KOPPELING, WORTEL, maakVoorwerp } from "./gedeeld.mjs";
import { voorwerpenLijst } from "../voorwerpen/lessen.mjs";

const { VOORWERPEN } = await voorwerpenLijst();
const k = JSON.parse(readFileSync(KOPPELING, "utf8"));
mkdirSync(VOORBEELD, { recursive: true });
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const rijen = [];
const tegels = [];
const T = 150;
let y = 0;
for (const p of k.plaatjes) {
  const v = VOORWERPEN.find((x) => x.naam === p.naam);
  if (p.naam && !v) throw new Error(`${p.bestand}: "${p.naam}" staat niet in de lijst`);
  const bron = path.join(INBOX, p.bestand);
  const uit = path.join(VOORBEELD, `${p.bestand}.uitgeknipt.png`);
  if (p.naam) writeFileSync(uit, await maakVoorwerp(bron));
  const nu = p.naam ? path.join(WORTEL, "public/voorwerpen", `${p.naam}.png`) : null;
  const status = p.naam ? `→ ${v.titel} (${p.naam}.png)` : `TWIJFEL: ${(p.twijfel ?? []).join(" of ") || "onbekend"} — Sara kiest`;
  rijen.push(`<tr class="${p.naam ? "" : "twijfel"}"><td><b>${esc(p.bestand)}</b><br>Ik zie: ${esc(p.zie)}<br><span class="k">${esc(status)}</span></td>
<td><img src="${esc(p.bestand)}"></td><td class="donker">${p.naam ? `<img src=".voorbeeld/${esc(p.bestand)}.uitgeknipt.png">` : ""}</td><td class="donker">${nu && existsSync(nu) ? `<img src="../public/voorwerpen/${esc(p.naam)}.png">` : ""}</td></tr>`);
  /* dezelfde rij als plaatje */
  const vak = async (f, donker) => {
    const achter = donker ? { r: 11, g: 16, b: 40, alpha: 1 } : { r: 255, g: 255, b: 255, alpha: 1 };
    return f && existsSync(f) ? sharp(f).resize(T - 10, T - 10, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).flatten({ background: achter }).extend({ top: 5, bottom: 5, left: 5, right: 5, background: achter }).png().toBuffer() : null;
  };
  const tekst = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="${T}"><style>text{font:15px sans-serif;fill:#111}</style>
<text x="8" y="26" font-weight="bold">${esc(p.bestand)}</text><text x="8" y="56">Ik zie: ${esc(p.zie).slice(0, 48)}</text>
<text x="8" y="90" style="fill:${p.naam ? "#0a6b2a" : "#b00020"};font-weight:bold">${esc(status).slice(0, 52)}</text></svg>`;
  tegels.push({ input: Buffer.from(tekst), left: 0, top: y });
  for (const [i, f, d] of [[0, bron, false], [1, p.naam ? uit : null, true], [2, nu, true]]) {
    const b = await vak(f, d);
    if (b) tegels.push({ input: b, left: 420 + i * T, top: y });
  }
  y += T;
}
const kop = `<svg xmlns="http://www.w3.org/2000/svg" width="${420 + 3 * T}" height="30"><style>text{font:bold 14px sans-serif}</style><text x="8" y="20">Bestand en koppeling</text><text x="${428}" y="20">Origineel</text><text x="${428 + T}" y="20">Uitgeknipt</text><text x="${428 + 2 * T}" y="20">Staat er nu</text></svg>`;
await sharp({ create: { width: 420 + 3 * T, height: y + 30, channels: 4, background: "#ffffff" } })
  .composite([{ input: Buffer.from(kop), left: 0, top: 0 }, ...tegels.map((t) => ({ ...t, top: t.top + 30 }))])
  .png()
  .toFile(path.join(INBOX, "overzicht.png"));

writeFileSync(
  path.join(INBOX, "overzicht.html"),
  `<!doctype html><meta charset="utf-8"><title>Controle plaatjes-inbox</title>
<style>body{font:16px system-ui;margin:16px}table{border-collapse:collapse}td{border-bottom:1px solid #ddd;padding:8px;vertical-align:middle}
img{width:150px;height:150px;object-fit:contain}.donker{background:#0b1028}.twijfel{background:#fff1f1}.k{font-weight:bold;color:#0a6b2a}.twijfel .k{color:#b00020}</style>
<h1>Controle: ${k.plaatjes.length} plaatjes in de inbox</h1><p>Er is nog niets vervangen. Klopt alles? Zeg dan "akkoord" tegen Claude.</p>
<table><tr><th>Bestand en koppeling</th><th>Origineel</th><th>Uitgeknipt (op de achtergrond van de les)</th><th>Staat er nu</th></tr>${rijen.join("\n")}</table>`,
);
console.log(`Overzicht: ${path.join(INBOX, "overzicht.html")} en overzicht.png (${k.plaatjes.filter((p) => !p.naam).length} met twijfel)`);
process.exit(0);
