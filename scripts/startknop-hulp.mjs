/**
 * Gedeelde hulp voor de testscripts van de gouden lessen (19 november 2026): de afspeelknop-laag bij het begin
 * (BOUWREGELS 15.38; `startLaag` in src/components/les/Lesscherm.tsx, `data-startknop-laag`, knop `data-startknop`).
 *
 * De laag ligt over de hele les zolang de browser nog niet weet of er geluid mag: met de ronde afspeelknop als de
 * eerste zin op een tik wacht, of zonder knop tot het geluid beslist is (vangnet 4 s). Zolang hij er ligt, is hij
 * BEDOELD: dan is hij geen storende laag boven de pijl. Een kind tikt dan op de knop (of wacht), en pas daarna begint
 * de les. Deze hulp doet hetzelfde: is de knop er, dan een echte muisklik op de ronde van de knop (naast het
 * driehoekje, zoals scripts/speelcontrole.mjs); is er alleen de laag, dan wachten tot hij weg is.
 *
 * Gebruik in een testscript (ev = Runtime.evaluate met returnByValue, tik = echte muisklik op { x, y }):
 *   import { langsStartknop, PIJL_PUNT_JS } from "./startknop-hulp.mjs";
 *   await langsStartknop(ev, tik);
 */

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

/** Een stukje JS voor in de pagina: ligt element `e` in de afspeelknop-laag? */
export const IN_STARTLAAG = (e) => `!!(${e} && ${e}.closest && ${e}.closest("[data-startknop-laag]"))`;

/** JS voor in de pagina: waar ligt de pijl, en wat ligt er bovenop (ook of dat de afspeelknop-laag is). */
export const PIJL_PUNT_JS = `(() => { const b = document.querySelector('[data-knop="verder"]'); if (!b) return null; const r = b.getBoundingClientRect(); if (r.width < 3) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); return { x, y, raak: !!e && (e === b || b.contains(e)), laag: ${IN_STARTLAAG("e")}, wat: e ? (e.getAttribute("aria-label") || e.className || e.tagName) : null }; })()`;

const STAND_JS = `(() => {
  const l = document.querySelector("[data-startknop-laag]");
  const k = document.querySelector("[data-startknop]");
  const r = k ? k.getBoundingClientRect() : null;
  return {
    laag: !!l && l.getBoundingClientRect().width > 3,
    knop: r && r.width > 3 ? { x: Math.round(r.left + r.width * 0.25), y: Math.round(r.top + r.height * 0.7) } : null,
    les: !!document.querySelector(".bliepo-tekst, [data-knop], .bliepo-vloer"),
  };
})()`;

/**
 * Wacht tot de afspeelknop-laag weg is, en tikt (1 keer, echte muisklik) op de afspeelknop als die in beeld komt.
 * Geeft { weg, knopGetikt, ms } terug. `weg` is false als de laag na `maxMs` nog steeds ligt (dan is er echt iets mis).
 * Ligt er geen laag (andere les, of al begonnen), dan is hij meteen klaar zodra de les in beeld staat.
 */
export async function langsStartknop(ev, tik, { maxMs = 9000 } = {}) {
  const t0 = Date.now();
  let knopGetikt = false;
  let laatsteTik = 0;
  while (Date.now() - t0 < maxMs) {
    const s = await ev(STAND_JS);
    if (s) {
      /* De knop: 1 tik; staat hij er 2 s later nog, dan nog eens (zoals een kind dat nog eens tikt). */
      if (s.knop && Date.now() - laatsteTik > 2000) {
        await tik(s.knop);
        knopGetikt = true;
        laatsteTik = Date.now();
        await wacht(150);
        continue;
      }
      if (!s.laag && s.les) return { weg: true, knopGetikt, ms: Date.now() - t0 };
    }
    await wacht(100);
  }
  return { weg: false, knopGetikt, ms: Date.now() - t0 };
}
