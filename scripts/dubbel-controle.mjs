/**
 * F8 "dubbel gezegd", gedeeld door speelcontrole.mjs, test-tellen-gouden.mjs en extra-test-hulp.mjs (17 november 2026,
 * BOUWREGELS 15.29). Twee aanvullingen op de oude controle (die alleen de browserstem telde en elke tik als "het kind deed
 * iets" zag):
 *  1. een KORTE uiting (1 of 2 woorden, zoals "1." of "Tel mee.") die binnen 3 s 2 keer start is altijd fout, ook na een tik;
 *  2. een opname van Ruth waarin een kort woord al 2 keer klinkt ("1 ... 1") is fout (window.__stemSpeel, gevuld door
 *     lib/stem.ts), tenzij de les hem al knipt (geknipt = true; dat telt als goed, alleen genoteerd).
 */
export const STEMSPEEL_INIT = `window.__stemSpeel = [];`;

const woorden = (z) => String(z ?? "").replace(/[{}]/g, "").trim().split(/\s+/).filter(Boolean).length;

/** starts: [{ t, z }] van de browserstem en van Ruth; geeft een lijst foutmeldingen. */
export function korteDubbel(starts, venster = 3000) {
  const fouten = [];
  const s = starts.filter((x) => x.z && woorden(x.z) <= 2).sort((a, b) => a.t - b.t);
  for (let i = 1; i < s.length; i++)
    for (let j = i - 1; j >= 0 && s[i].t - s[j].t < venster; j--)
      if (s[j].z === s[i].z) {
        fouten.push(`F8: korte uiting "${s[i].z}" binnen ${s[i].t - s[j].t} ms 2 keer gestart (ook na een tik is dat fout)`);
        break;
      }
  return fouten.slice(0, 3);
}

/** speel: [{ t, z, blokken, geknipt }] uit window.__stemSpeel. */
export function opnameDubbel(speel) {
  const fouten = [];
  const kort = (speel ?? []).filter((x) => woorden(x.z) <= 2 && x.blokken > 1);
  for (const x of kort) if (!x.geknipt) fouten.push(`F8: de opname van "${x.z}" bevat het woord 2 keer en is niet geknipt`);
  return { fouten: [...new Set(fouten)].slice(0, 3), geknipt: kort.filter((x) => x.geknipt).length };
}
