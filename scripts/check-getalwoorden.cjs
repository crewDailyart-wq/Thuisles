/* Zoekt getalwoorden (één, twee, drie ...) als hoeveelheid in zichtbare zinnen van de Squla-lessen (BOUWREGELS 3.20). */
const fs = require("node:fs"), path = require("node:path");
const map = path.resolve(__dirname, "../src/components/les/lessen");
const woorden = /\b(één|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|twintig)\b/gi;
const uitzonderingen = /(één voor één|op één lijn|twee-euro|tweede|derde|vierde|vijfde|zesde|zevende)/i;
let n = 0;
for (const f of fs.readdirSync(map).filter((x) => /^squla-.*\.tsx?$/.test(x))) {
  const regels = fs.readFileSync(path.join(map, f), "utf8").split("\n");
  regels.forEach((r, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(r)) return;
    for (const m of r.matchAll(/(["`])((?:(?!\1)[^\\\n]|\\.){8,}?)\1/g)) {
      const z = m[2];
      if (!/[A-Za-z]{3,} [A-Za-z]{2,}/.test(z) || /^(\.|@|import|http)/.test(z)) continue;
      const zonder = z.replace(uitzonderingen, "");
      if (woorden.test(zonder)) { n++; console.log(`${f}:${i + 1}  ${z.slice(0, 140)}`); }
      woorden.lastIndex = 0;
    }
  });
}
console.log(`\n${n} zinnen met een getalwoord.`);
