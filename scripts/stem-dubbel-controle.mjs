/**
 * Dubbel opgenomen woord (17 november 2026, BOUWREGELS 15.29, FOUTEN-VOORBEELDEN F8): zoekt in de bewaarde Ruth-opnames
 * (via /api/stem) naar korte opnames waarin het woord 2 keer klinkt ("1 ... 1"). Daar ving de F8-controle niets van, omdat
 * die alleen de browserstem telde. Alleen lezen; maakt niets aan. Gebruikt afconvert (macOS).
 *
 *   node scripts/stem-dubbel-controle.mjs                             getallen 1 t/m 20 en alle zinnen van 1-2 woorden (dev-server nodig)
 *   TEKSTEN="1.,11.,Tel mee." node scripts/stem-dubbel-controle.mjs   alleen deze zinnen
 * Exitcode 1 als er een korte opname is waarin het woord 2 keer klinkt. De les knipt dat nu (lib/bliepo-geluid.ts, opt-in
 * gouden lessen); deze controle meldt wat er in de opnames zit.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MAP = new URL("../public/stem/", import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), "stem-dubbel-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));

/** Blokken spraak (stilte van minstens 0,35 s ertussen) in een mp3; sr = 16000. */
function blokken(mp3) {
  const src = join(tmp, "a.mp3");
  const wav = join(tmp, "a.wav");
  execFileSync("cp", [mp3, src]);
  execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@16000", src, wav], { stdio: "ignore" });
  const b = readFileSync(wav);
  const n = (b.length - 44) >> 1;
  const stap = 400;
  let aantal = 0, laatste = -1;
  for (let i = 0; i < n; i += stap) {
    let m = 0;
    for (let j = i; j < Math.min(n, i + stap); j++) m = Math.max(m, Math.abs(b.readInt16LE(44 + j * 2)));
    if (m >= 1000) {
      if (laatste < 0 || (i - laatste) / 16000 >= 0.35) aantal++;
      laatste = i + stap;
    }
  }
  return { aantal, duur: n / 16000 };
}

/* De te controleren zinnen: de getallen "1." t/m "20." en alle zinnen van 1 of 2 woorden uit ZINNEN-VOOR-CONTROLE.md
   (of TEKSTEN="a,b"). Alleen bewaarde opnames (200); de dev-server maakt niets nieuws (STEM_NIEUWE_ZINNEN=browser). */
let teksten = [];
if (process.env.TEKSTEN) teksten = process.env.TEKSTEN.split(",").map((t) => t.trim());
else {
  for (let n = 1; n <= 20; n++) teksten.push(`${n}.`);
  for (const r of readFileSync(new URL("../ZINNEN-VOOR-CONTROLE.md", import.meta.url), "utf8").split("\n")) {
    const k = r.split("|").map((x) => x.trim());
    const zin = k.length > 4 ? k[3] : "";
    if (zin && !/[\[\]{}$]/.test(zin) && zin.split(/\s+/).length <= 2) teksten.push(zin);
  }
  teksten = [...new Set(teksten)];
}
const bestanden = [];
for (const t of teksten) {
  const r = await fetch(`http://localhost:3000/api/stem?zin=${encodeURIComponent(t)}`).catch(() => null);
  if (!r || r.status !== 200) continue;
  const f = join(tmp, `t${bestanden.length}.mp3`);
  writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  bestanden.push([t, f]);
}
console.log(`stem-dubbel-controle: ${bestanden.length} van ${teksten.length} korte zinnen hebben een bewaarde opname`);

let verdacht = 0;
for (const [naam, pad] of bestanden) {
  const { aantal, duur } = blokken(pad);
  if (aantal > 1) {
    verdacht++;
    console.log(`  DUBBEL? ${naam}: ${aantal} blokken spraak in ${duur.toFixed(1)} s`);
  }
}
console.log(`stem-dubbel-controle: ${verdacht} korte opnames met het woord 2 keer`);
process.exit(verdacht ? 1 : 0);
