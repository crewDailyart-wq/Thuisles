/*
  Meter voor het gedrag van Bliepo in de gouden lessen (BOUWREGELS 15.51, 20 november 2026; FOUTEN-VOORBEELDEN F21).
  Wordt door `METER=1 node scripts/speelcontrole.mjs` in de pagina gezet (alleen lezen; verandert niets aan de les,
  behalve dat de browserstem op volume 0 gaat). Meet:
    1. staat de pijl in beeld terwijl Bliepo een gewoon stuk tekst zegt ("pijl-door" in window.__gouden)?
    2. een tik op de pijl tijdens het praten (de meter tikt zelf, bij een paar stukken die geen reactie op goed zijn):
       hoe snel stopt de stem en hoe snel komt het volgende stuk?
    3. na een goed antwoord (groen scherm, window.__scherm): gaat de les vanzelf door, en na hoeveel seconden?
    4. bij stil goed (alleen groen): staat er dan een pijl boven een leeg tekstvak?
  Uitkomst in window.__bm (de speelcontrole schrijft hem naar METERUIT/<les>.json).
*/
(() => {
  const nu = () => Math.round(performance.now());
  const bm = (window.__bm = { ev: [], snap: [], tikken: [] });
  const log = (x) => bm.ev.push({ t: nu(), ...x });
  let spreektBrowser = 0;
  let audioSpeelt = 0;
  /* De browserstem: stil (volume 0), maar met de echte tijd en het echte afbreken. */
  if (window.speechSynthesis) {
    const ss = window.speechSynthesis;
    const speak = ss.speak.bind(ss);
    const cancel = ss.cancel.bind(ss);
    ss.speak = (u) => {
      try {
        u.volume = 0;
      } catch {}
      u.addEventListener("start", () => {
        spreektBrowser++;
        log({ s: "stem-start", bron: "browser", z: String(u.text || "").slice(0, 60) });
      });
      const eind = (e) => {
        spreektBrowser = Math.max(0, spreektBrowser - 1);
        log({ s: "stem-eind", bron: "browser", hoe: e.type });
      };
      u.addEventListener("end", eind);
      u.addEventListener("error", eind);
      return speak(u);
    };
    ss.cancel = () => {
      log({ s: "cancel" });
      return cancel();
    };
  }
  const isStem = (el) => /\/api\/stem/.test(el.currentSrc || el.src || "");
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const el = this;
    if (isStem(el) && !el.__bmGehaakt) {
      el.__bmGehaakt = true;
      el.addEventListener("playing", () => {
        audioSpeelt++;
        log({ s: "stem-start", bron: "ruth" });
      });
      const eind = (e) => {
        if (el.__bmSpeelt === false) return;
        el.__bmSpeelt = false;
        audioSpeelt = Math.max(0, audioSpeelt - 1);
        log({ s: "stem-eind", bron: "ruth", hoe: e.type });
      };
      el.addEventListener("ended", eind);
      el.addEventListener("pause", eind);
      el.addEventListener("playing", () => (el.__bmSpeelt = true));
    }
    return play.apply(this, arguments);
  };
  const spreekt = () => spreektBrowser > 0 || audioSpeelt > 0 || !!(window.speechSynthesis && window.speechSynthesis.speaking);

  const zichtbaar = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.15;
  };
  const pijlEl = () => [...document.querySelectorAll('[data-knop="verder"]')].find(zichtbaar) || null;
  const tekst = () =>
    [...document.querySelectorAll(".les-tekst .bliepo-tekst, .les-tekst p")]
      .map((e) => e.textContent)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

  /* Snapshots: alleen bij een verandering. */
  let vorige = "";
  let gGezien = 0;
  let sGezien = 0;
  let tikNr = 0;
  let pijlDoorNr = 0;
  let laatsteGoed = -1e9;
  const tikPlan = new Set([2, 4, 7]);
  const meet = () => {
    const p = !!pijlEl();
    const s = spreekt();
    const tk = tekst();
    const sleutel = `${p}|${s}|${tk}`;
    if (sleutel !== vorige) {
      vorige = sleutel;
      bm.snap.push({ t: nu(), p, s, tk: tk.slice(0, 120) });
    }
    const sch = window.__scherm || [];
    for (; sGezien < sch.length; sGezien++) {
      log({ s: "scherm", kleur: sch[sGezien].soort, t0: sch[sGezien].t });
      if (sch[sGezien].soort === "goed") laatsteGoed = sch[sGezien].t;
    }
    /* De meter tikt zelf op de pijl tijdens het praten: bij het 2e, 4e en 7e "pijl-door"-stuk dat niet direct na een goed antwoord komt. */
    const g = window.__gouden || [];
    for (; gGezien < g.length; gGezien++) {
      const e = g[gGezien];
      if (e.wat !== "pijl-door") continue;
      if (e.t - laatsteGoed < 3000) continue;
      pijlDoorNr++;
      if (!tikPlan.has(pijlDoorNr)) continue;
      const zin = String(e.zin || "");
      const start = nu();
      const probeer = () => {
        const el = pijlEl();
        /* Pas tikken als de stem al ±0,6 s bezig is, zodat er echt iets af te breken valt. */
        const sindsStart = (() => {
          for (let i = bm.ev.length - 1; i >= 0 && bm.ev[i].t >= e.t - 50; i--) if (bm.ev[i].s === "stem-start") return nu() - bm.ev[i].t;
          return -1;
        })();
        if (el && spreekt() && sindsStart >= 600) {
          const voor = tekst();
          bm.tikken.push({ nr: ++tikNr, t: nu(), zin: zin.slice(0, 80), tekstVoor: voor.slice(0, 120) });
          el.click();
          return;
        }
        if (nu() - start < 6000) setTimeout(probeer, 50);
        else bm.tikken.push({ nr: ++tikNr, t: nu(), zin: zin.slice(0, 80), mislukt: el ? "stem al klaar" : "geen pijl" });
      };
      setTimeout(probeer, 50);
    }
  };
  setInterval(meet, 40);
  document.addEventListener(
    "click",
    (e) => {
      const k = e.target && e.target.closest ? e.target.closest("[data-knop]") : null;
      log({ s: "klik", knop: k ? k.getAttribute("data-knop") : "", echt: e.isTrusted });
    },
    true,
  );
})();
