/**
 * Welke voorwerpen moeten nog gegenereerd worden? Alleen voorwerpen die een
 * les echt gebruikt en nog een tijdelijk plaatje hebben, de meest gebruikte
 * eerst (efficiënt: niets maken wat geen les nodig heeft). Uitvoer: JSON met
 * naam, aantal lessen, en de exacte instellingen + prompt voor Magnific.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { voorwerpenLijst, squlaLessen } from "./lessen.mjs";
import { MODEL, prompt } from "./stijl.mjs";

const { VOORWERPEN } = await voorwerpenLijst();
const lessen = await squlaLessen();
const status = JSON.parse(readFileSync(path.join(import.meta.dirname, "../../src/lib/voorwerpen/status.json"), "utf8"));
const tel = new Map();
for (const l of lessen) for (const n of new Set(l.voorwerpen)) tel.set(n, (tel.get(n) ?? 0) + 1);
const open = VOORWERPEN.filter((v) => tel.has(v.naam) && status[v.naam]?.bron !== "eigen")
  .map((v) => ({ naam: v.naam, lessen: tel.get(v.naam), ...MODEL, prompt: prompt(v) }))
  .sort((a, b) => b.lessen - a.lessen || a.naam.localeCompare(b.naam));
console.log(JSON.stringify({ open: open.length, nietInLes: VOORWERPEN.filter((v) => !tel.has(v.naam)).map((v) => v.naam), lijst: open }, null, 2));
process.exit(0);
