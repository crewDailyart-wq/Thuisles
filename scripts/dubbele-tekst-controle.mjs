/**
 * F11 "dezelfde tekst 2 keer tegelijk op het scherm" (Sara, 17 november 2026; BOUWREGELS 15.31, FOUTEN-VOORBEELDEN F11).
 * Gedeeld door speelcontrole.mjs en extra-test-hulp.mjs (en elk ander testscript dat het wil).
 *
 * De meter draait in de pagina (elke 150 ms): hij zoekt de zichtbare tekstblokken (de kleinste elementen waarin een
 * zin zit), maakt van elke tekst een sleutel (kleine letters, zonder spaties en leestekens) en kijkt of dezelfde sleutel
 * in 2 verschillende blokken tegelijk zichtbaar is. Houdt het langer dan 400 ms aan, dan komt het in
 * window.__dubbeleTekst (met waar de 2 blokken staan). Alleen DOM-tekst telt (Bliepo's tekstvak, de opdracht, de kop
 * in het vlak, labels); knoppen en invoervelden tellen niet mee (daar staat vaak hetzelfde cijfer in).
 */
export const DUBBELE_TEKST_METER = `
  window.__dubbeleTekst = [];
  (() => {
    const sleutel = (t) => t.toLowerCase().replace(/[^a-z0-9\\u00c0-\\u024f]+/g, "");
    const zichtbaar = (e) => {
      for (let x = e; x && x !== document.body; x = x.parentElement) {
        const cs = getComputedStyle(x);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.15) return false;
      }
      const r = e.getBoundingClientRect();
      return r.width > 3 && r.height > 3 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    };
    const plek = (e) => {
      const d = e.closest("[data-opdracht],[data-kop],[data-vraag-boven],.les-tekst,.bliepo-tekst");
      const naam = d ? (d.getAttribute("data-opdracht") !== null ? "opdracht" : d.getAttribute("data-kop") !== null ? "kop-in-vlak" : d.classList.contains("les-tekst") || d.classList.contains("bliepo-tekst") ? "tekstvak-Bliepo" : "boven-vlak") : "elders";
      return naam;
    };
    const actief = new Map();
    setInterval(() => {
      const nu = Math.round(performance.now());
      const blokken = [];
      for (const e of document.body.querySelectorAll("*")) {
        if (["SCRIPT", "STYLE", "BUTTON", "INPUT", "TEXTAREA", "SVG", "CANVAS", "NOSCRIPT"].includes(e.tagName.toUpperCase()) || e.closest("button,svg,[aria-hidden='true'],.bliepo-tekst-later")) continue;
        const t = (e.textContent || "").replace(/\\s+/g, " ").trim();
        if (t.length < 10 || t.split(" ").length < 3) continue;
        /* de kleinste: geen kind dat dezelfde tekst al heeft */
        if ([...e.children].some((k) => sleutel(k.textContent || "") === sleutel(t))) continue;
        if (!zichtbaar(e)) continue;
        blokken.push({ k: sleutel(t), t, p: plek(e), e });
      }
      /* Een blok dat in een ander blok zit (ouder met meer tekst) is geen tweede exemplaar: alleen blokken met precies deze tekst tellen. */
      const per = new Map();
      for (const b of blokken) (per.get(b.k) ?? per.set(b.k, []).get(b.k)).push(b);
      const nuSleutels = new Set();
      for (const [k, lijst] of per) {
        if (lijst.length < 2) continue;
        nuSleutels.add(k);
        let a = actief.get(k);
        if (!a) { a = { sinds: nu, gemeld: false }; actief.set(k, a); }
        if (!a.gemeld && nu - a.sinds >= 400) {
          a.gemeld = true;
          window.__dubbeleTekst.push({ t: a.sinds, tekst: lijst[0].t.slice(0, 120), plekken: lijst.map((b) => b.p) });
        }
      }
      for (const k of [...actief.keys()]) if (!nuSleutels.has(k)) actief.delete(k);
    }, 150);
  })();
`;

/** lijst: window.__dubbeleTekst; geeft foutmeldingen (max 3 verschillende teksten). */
export function dubbeleTekstFouten(lijst) {
  const gezien = new Set();
  const fouten = [];
  for (const x of lijst ?? []) {
    if (gezien.has(x.tekst)) continue;
    gezien.add(x.tekst);
    fouten.push(`F11: dezelfde tekst staat 2 keer tegelijk op het scherm (${x.plekken.join(" + ")}): "${x.tekst.slice(0, 80)}"`);
  }
  return fouten.slice(0, 3);
}
