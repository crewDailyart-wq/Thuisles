/* Telt zinnen in de Squla-lessen die vaker dan 2 keer in alle lessen samen voorkomen (BOUWREGELS 5.11).
   Getallen worden als # geteld, zodat "Tel 3 verder" en "Tel 4 verder" dezelfde zin zijn. */
const fs = require("node:fs");
const path = require("node:path");
const map = path.resolve(__dirname, "../src/components/les/lessen");
const MAX = Number(process.env.MAX ?? 2);
const telling = new Map();
for (const f of fs.readdirSync(map).filter((x) => /^squla-.*\.tsx?$/.test(x))) {
  const bron = fs.readFileSync(path.join(map, f), "utf8");
  for (const m of bron.matchAll(/(["`])((?:(?!\1)[^\\\n]|\\.){12,}?)\1/g)) {
    let z = m[2].replace(/\$\{[^}]*\}/g, "#").replace(/\{[^}]*\}/g, "#").replace(/\d+/g, "#").trim();
    if (!/[a-zA-Z]{3,} [a-zA-Z]{2,}/.test(z) || /^(\.\.?\/|@|use |import |http|[a-z]+-[a-z0-9-]+$)/.test(z) || /[=<>;{}]/.test(z.slice(0, 3))) continue;
    if (!/[A-Z].*[.?!]$|^[A-Z]/.test(z)) continue;
    /* Alleen hulp- en reactiezinnen tellen: vraagzinnen horen per soort vraag overal gelijk te zijn (CLAUDE.md). */
    const voor = bron.slice(Math.max(0, m.index - 260), m.index);
    const lastVraag = Math.max(voor.lastIndexOf("vraag:"), voor.lastIndexOf("opdracht:"), voor.lastIndexOf("welkom"));
    const lastHulp = Math.max(voor.lastIndexOf("reactie"), voor.lastIndexOf("tip:"), voor.lastIndexOf("laatZien"), voor.lastIndexOf("toonAntwoord"), voor.lastIndexOf("goedZin"), voor.lastIndexOf("goed:"), voor.lastIndexOf("samen"));
    if (lastHulp < 0 || lastVraag > lastHulp) continue;
    const e = telling.get(z) ?? { n: 0, bestanden: new Set() };
    e.n++; e.bestanden.add(f.replace(/^squla-|\.tsx?$/g, ""));
    telling.set(z, e);
  }
}
const veel = [...telling].filter(([, e]) => e.n > MAX).sort((a, b) => b[1].n - a[1].n);
for (const [z, e] of veel) console.log(`${e.n}×  [${[...e.bestanden].join(",")}]  ${z}`);
console.log(`\n${veel.length} zinnen komen vaker dan ${MAX} keer voor.`);
process.exit(veel.length ? 1 : 0);
