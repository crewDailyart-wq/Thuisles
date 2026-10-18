"use client";

/**
 * Proef: Tesla's bouwtekening van Zappie (16 oktober 2026, keuze eigenaar).
 *
 * Alleen te zien met /zappie?achtergrond=bouwtekening. De pagina is een
 * blauwdruk: het blauwe tekenpapier van Tesla, de uitvinder van Zappie. Op de
 * vrije plekken tussen de blokken liggen zijn bladen (Tekeningen.tsx):
 *
 *   A  Zappie van voren, met maten          (links van de werelden)
 *   B  zo zit hij in elkaar                 (rechts van de werelden)
 *   C  de aandrijving met tandwielen        (naast Mijn leerpad)
 *   D  de oplaadpaal, een teslaspoel        (aan de andere kant)
 *   E  Tesla's werkbank: raket en wiel      (onder Vandaag op ontdekking)
 *   F  de lamp van het idee                 (bij de vakken)
 *   G  het petje                            (bij het atelier)
 *   en onderaan het échte prototype in 3D op een getekend plateau, met het
 *   titelblokje van de tekening. Daarin turft Tesla Zappies testritten: één
 *   streepje per gespeelde missie, dus de tekening groeit met het kind mee.
 *
 * Wat er gebeurt:
 *   - komt een blad in beeld, dan tekent het zichzelf, lijn voor lijn;
 *   - de lijnen trillen heel licht, zoals in een handgetekende tekenfilm;
 *   - de tandwielen en het wiel draaien mee als je scrolt (in de juiste
 *     verhouding, dus ze grijpen in elkaar);
 *   - muis of vinger in de buurt: de lamp gaat aan, de spoel vonkt, de raket
 *     krijgt een vlam, de delen van blad B klikken in elkaar, het golfje op
 *     Zappies scherm springt op, hij zwaait, het petje tikt aan;
 *   - het 3D-prototype zwaait, praat bij een tik en juicht daarna.
 *
 * Bij "Beweging uit" en "minder beweging" staat alles meteen getekend en
 * stil. De bladen liggen áchter de inhoud; de muis wordt op het venster
 * gevolgd, zodat niets van de pagina geblokkeerd raakt.
 */

import { useEffect, useRef, useState } from "react";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import {
  Ideelamp,
  Opengewerkt,
  Oplaadpaal,
  Petje,
  Plateau,
  Tandwielen,
  Titelblok,
  Vooraanzicht,
  Werkbank,
} from "@/components/zappie/bouwtekening/Tekeningen";
import { Gum, Inktvlek, Koffiekring, Liniaal, Paperclip, Potlood } from "@/components/zappie/bouwtekening/Werktafel";
import { useVoortgang } from "@/lib/zappie/opslag";

type Vak = { x: number; y: number; b: number; h: number };
type Plekken = Partial<Record<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "prototype" | "titel", Vak>>;
/** Een los voorwerp op de werktafel: plek, breedte, draaiing en hoe "los" het ligt. */
type Los = { naam: string; soort: "koffie" | "potlood" | "gum" | "clip" | "liniaal" | "inkt"; x: number; y: number; b: number; draai: number; diepte: number };
/** Waar de stukken van de pagina beginnen, voor de kleurzones. */
type Zones = { vakken: number; atelier: number; kust: number; einde: number };

/*
  De rustige bouwtekening (16 oktober 2026, keuze eigenaar: "combineer 1 en
  2"): zachtere lijnen die niet trillen en zich niet meer zelf tekenen, en
  minder bladen en spullen, zodat de werelden, Mijn leerpad en de vakken
  eruit springen. Op muis of vinger reageren de tekeningen nog wel.

  Niets is weggegooid. Zet RUSTIG op false en alles is terug zoals het was,
  of zet een blad of voorwerp weer in TOON_BLADEN of TOON_SPULLEN.
*/
const RUSTIG = true;
/*
  Blad "a" (de getekende robot van voren) staat sinds 18 oktober 2026 niet
  meer in beeld, op verzoek van de eigenaar: Bliepo staat daar nu zelf, naast
  "Kies jouw vak". Zet "a" terug in deze lijst en de tekening is er weer.
*/
const TOON_BLADEN = new Set(["f", "titel", "prototype"]);
const TOON_SPULLEN = new Set(["potlood-boven", "koffie-vakken"]);

/** Hoe ver een reactie reikt, in pixels rond het stukje tekening. */
const BEREIK = 60;
/** Hoe lang een reactie duurt voor hij opnieuw kan. */
const DUUR = 1800;

/** Kleinste maten waaronder een blad niet meer leesbaar is; dan valt het weg. */
function past(v: Vak, minB: number, minH: number) {
  return v.b >= minB && v.h >= minH ? v : undefined;
}

export function Bouwtekening() {
  const laag = useRef<HTMLDivElement>(null);
  const [plek, zetPlek] = useState<Plekken | null>(null);
  const [los, zetLos] = useState<Los[]>([]);
  const [zones, zetZones] = useState<Zones | null>(null);
  const rustig = useBewegingsstand() !== "aan";
  const v = useVoortgang();
  const testritten = Object.values(v.missies).reduce((som, n) => som + n, 0);

  /* Meten waar de vrije plekken zijn. */
  useEffect(() => {
    const el = laag.current;
    const pagina = el?.parentElement;
    if (!el || !pagina) return;
    const meet = () => {
      const basis = pagina.getBoundingClientRect();
      const B = basis.width;
      const rect = (sel: string) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return { l: r.left - basis.left, t: r.top - basis.top, r: r.right - basis.left, o: r.bottom - basis.top, b: r.width, h: r.height };
      };
      /*
        Koppen beslaan de hele breedte, de tekst zelf maar een deel. Dit meet
        alleen de letters (en knoppen), zodat de bladen ernaast passen.
      */
      const tekst = (sel: string) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const vakken: DOMRect[] = [];
        const loper = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        for (let n = loper.nextNode(); n; n = loper.nextNode()) {
          if (!n.textContent?.trim()) continue;
          const bereik = document.createRange();
          bereik.selectNodeContents(n);
          vakken.push(bereik.getBoundingClientRect());
        }
        e.querySelectorAll("button, a").forEach((k) => vakken.push(k.getBoundingClientRect()));
        if (!vakken.length) return null;
        const l = Math.min(...vakken.map((v) => v.left)) - basis.left;
        const r = Math.max(...vakken.map((v) => v.right)) - basis.left;
        const t = Math.min(...vakken.map((v) => v.top)) - basis.top;
        const o = Math.max(...vakken.map((v) => v.bottom)) - basis.top;
        return { l, t, r, o, b: r - l, h: o - t };
      };
      const nieuw: Plekken = {};
      /*
        De wereldkaarten; zijn die verborgen (TOON_WERELDEN in Startscherm.tsx),
        dan liggen de bladen naast het vakkenpaneel.
      */
      const wereldkaarten = [...document.querySelectorAll(".zp-werelden a, .zp-werelden button")]
        .map((k) => k.getBoundingClientRect())
        .filter((r) => r.width > 0);
      const paneel = document.querySelector(".zp-vk-kaart")?.getBoundingClientRect();
      const kaarten = wereldkaarten.length ? wereldkaarten : paneel && paneel.width > 0 ? [paneel] : [];
      const missie = rect(".zp-missieplek");
      const panelen = rect(".zs-ontdekking");
      const beweging = rect(".zs-bewegingsknop");
      if (kaarten.length) {
        const links = Math.min(...kaarten.map((k) => k.left)) - basis.left;
        const rechts = Math.max(...kaarten.map((k) => k.right)) - basis.left;
        const boven = Math.min(...kaarten.map((k) => k.top)) - basis.top;
        const onder = Math.max(...kaarten.map((k) => k.bottom)) - basis.top;
        /* Naast het vakkenpaneel iets lager, zodat het opschrift niet achter het logo valt. */
        const zak = wereldkaarten.length ? 0 : 40;
        nieuw.a = past({ x: 16, y: boven - 8 + zak, b: links - 32, h: onder - boven + 16 - zak }, 150, 260);
        nieuw.b = past({ x: rechts + 16, y: boven - 8, b: B - rechts - 32, h: onder - boven + 16 }, 150, 260);
        if (missie && panelen) {
          if (missie.l > 240) {
            const y = onder + 10;
            const h = panelen.t - y - 10;
            nieuw.c = past({ x: 24, y, b: missie.l - 48, h }, 220, 110);
            const eind = beweging && beweging.t < panelen.t ? beweging.l - 16 : B - 24;
            nieuw.d = past({ x: missie.r + 24, y, b: eind - missie.r - 24, h }, 200, 110);
          } else {
            const y = missie.o + 6;
            nieuw.c = past({ x: 8, y, b: (beweging ? beweging.l : B) - 16, h: panelen.t - y - 6 }, 150, 64);
          }
        }
      }
      const tokens = rect(".zp-tokens");
      const jouw = rect(".zp-jouwpaneel");
      const vakken = rect("#vrij-oefenen");
      if (tokens && jouw && vakken && jouw.l > tokens.r - 4) {
        const y = tokens.o + 12;
        nieuw.e = past({ x: 24, y, b: jouw.l - 48, h: vakken.t - y - 6 }, 280, 120);
      }
      const vakkop = tekst("#vrij-oefenen .zs-kop");
      if (vakkop) {
        const x = Math.max(vakkop.r + 24, B * 0.56);
        nieuw.f = past({ x, y: vakkop.t - 70, b: Math.min(230, B - 24 - x), h: 170 }, 100, 100);
      }
      const atelierkop = tekst("#zappies-atelier .zs-kop");
      if (atelierkop) {
        const x = Math.max(atelierkop.r + 24, B * 0.56);
        nieuw.g = past({ x, y: atelierkop.t - 50, b: Math.min(300, B - 24 - x), h: 150 }, 160, 100);
      }
      const kust = rect(".zs-kust");
      const kusttekst = tekst(".zs-kust-tekst");
      if (kust && kusttekst) {
        const ruimteLinks = kusttekst.l - 24;
        if (ruimteLinks >= 230) {
          const b = Math.min(300, ruimteLinks - 24);
          const h = Math.min(kust.h - 24, b * 1.35);
          nieuw.prototype = { x: Math.max(24, (ruimteLinks - b) / 2), y: kust.o - h - 12, b, h };
          const tb = Math.min(320, B - kusttekst.r - 88);
          if (tb >= 200) nieuw.titel = { x: B - 64 - tb, y: kust.o - tb * 0.5 - 70, b: tb, h: tb * 0.5 };
        } else {
          const b = Math.min(240, B - 32);
          const h = Math.min(b * 1.3, kusttekst.t - kust.t - 12);
          if (h > 180) nieuw.prototype = { x: (B - b) / 2, y: kust.t + 8, b, h };
        }
      }
      zetPlek(nieuw);

      /* De kleurzones: waar de vakken, het atelier en het slot beginnen. */
      const atelier = rect("#zappies-atelier");
      const einde = document.documentElement.scrollHeight;
      if (vakken && atelier && kust) zetZones({ vakken: vakken.t, atelier: atelier.t, kust: kust.t, einde });

      /*
        De losse spullen op de werktafel, in de marges waar niets anders ligt.
        Op een smal scherm alleen de kleine, en minder.
      */
      const smal = B < 700;
      const spul: Los[] = [];
      const zet = (naam: string, soort: Los["soort"], x: number, y: number, b: number, draai: number, diepte: number) => {
        if (RUSTIG && !TOON_SPULLEN.has(naam)) return;
        if (x >= 4 && x + b <= B - 4) spul.push({ naam, soort, x, y, b, draai, diepte });
      };
      if (kaarten.length && missie) {
        const onder = Math.max(...kaarten.map((k) => k.bottom)) - basis.top;
        /* Een tweede potlood helemaal bovenaan, in de strook boven Aarde en Universum. */
        if (!smal && kaarten.length >= 3) {
          const boven = Math.min(...kaarten.map((k) => k.top)) - basis.top;
          const hoogste = Math.max(...kaarten.map((k) => k.top)) - basis.top;
          const tweede = kaarten.map((k) => k.left - basis.left).sort((a, b) => a - b)[1];
          if (hoogste - boven > 34) zet("potlood-boven", "potlood", tweede + 60, boven + 4, 220, -4, 0.03);
        }
        zet("clip", "clip", smal ? B - 34 : (nieuw.b?.x ?? B - 120) + 6, (nieuw.b?.y ?? onder - 300) - 16, smal ? 20 : 26, 12, 0);
      }
      if (vakken && !smal) {
        if (vakkop) zet("koffie-vakken", "koffie", B * 0.8, vakkop.t - 30, 110, 0, 0.05);
        zet("inkt", "inkt", B * 0.46, vakken.t - 120, 46, 0, 0.02);
      }
      if (atelier && !smal) zet("liniaal", "liniaal", B * 0.05, atelier.t - 150, Math.min(320, B * 0.24), -5, 0.04);
      if (atelier) {
        if (!smal) zet("potlood-atelier", "potlood", B * 0.68, atelier.t - 80, 240, -14, 0.08);
        if (!smal) zet("gum", "gum", B * 0.86, atelier.t - 40, 80, 9, 0.06);
      }
      if (kusttekst && !smal) zet("koffie-slot", "koffie", B * 0.6, kusttekst.t - 190, 100, 0, 0.05);
      zetLos(spul);
    };
    meet();
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(document.body);
    window.addEventListener("resize", meet);
    return () => {
      waarnemer.disconnect();
      window.removeEventListener("resize", meet);
    };
  }, []);

  /* Een blad tekent zichzelf zodra het in beeld komt (één keer). */
  useEffect(() => {
    const el = laag.current;
    if (!el || !plek) return;
    const bladen = [...el.querySelectorAll<HTMLElement>(".bt-blad:not([data-open])")];
    const open = (blad: HTMLElement) => {
      [...blad.querySelectorAll<SVGElement>(".bt-l")].forEach((lijn, i) => {
        lijn.style.setProperty("--wacht", `${Math.min(i * 22, 1600)}ms`);
      });
      blad.dataset.open = "ja";
    };
    if (rustig) {
      bladen.forEach(open);
      return;
    }
    const kijker = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (!item.isIntersecting) continue;
          open(item.target as HTMLElement);
          kijker.unobserve(item.target);
        }
      },
      { threshold: 0.25 },
    );
    bladen.forEach((b) => kijker.observe(b));
    return () => kijker.disconnect();
  }, [plek, rustig]);

  /* Tandwielen en wiel draaien mee met het scrollen. */
  useEffect(() => {
    const el = laag.current;
    if (!el) return;
    if (rustig) {
      el.style.setProperty("--scroll", "0");
      el.style.setProperty("--midden", "0");
      return;
    }
    let frame = 0;
    const draai = () => {
      frame = 0;
      el.style.setProperty("--rol", `${(window.scrollY * 0.3).toFixed(1)}deg`);
      el.style.setProperty("--scroll", window.scrollY.toFixed(0));
      el.style.setProperty("--midden", (window.innerHeight / 2).toFixed(0));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(draai);
    };
    draai();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [rustig]);

  /* Kleine verrassingen in de buurt van de muis of een vinger. */
  useEffect(() => {
    const el = laag.current;
    if (!el || !plek || rustig) return;
    let frame = 0;
    let laatste: PointerEvent | null = null;
    const bezig = new WeakMap<Element, number>();
    const verwerk = () => {
      frame = 0;
      const e = laatste;
      if (!e) return;
      const nu = performance.now();
      for (const stuk of el.querySelectorAll(".bt-blad[data-open] [data-reageer]")) {
        const r = stuk.getBoundingClientRect();
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        if (dx * dx + dy * dy > BEREIK * BEREIK) continue;
        if ((bezig.get(stuk) ?? 0) > nu) continue;
        bezig.set(stuk, nu + DUUR);
        stuk.classList.add("bt-actief");
        window.setTimeout(() => stuk.classList.remove("bt-actief"), DUUR - 150);
      }
    };
    const beweeg = (e: PointerEvent) => {
      laatste = e;
      if (!frame) frame = requestAnimationFrame(verwerk);
    };
    window.addEventListener("pointermove", beweeg, { passive: true });
    window.addEventListener("pointerdown", beweeg, { passive: true });
    return () => {
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerdown", beweeg);
      cancelAnimationFrame(frame);
    };
  }, [plek, rustig]);

  const blad = (naam: keyof Plekken, inhoud: React.ReactNode, extra = "") => {
    if (RUSTIG && !TOON_BLADEN.has(naam)) return null;
    const vak = plek?.[naam];
    if (!vak) return null;
    return (
      <div className={`bt-blad bt-blad-${naam} ${extra}`} style={{ left: vak.x, top: vak.y, width: vak.b, height: vak.h }}>
        {inhoud}
      </div>
    );
  };

  return (
    <div ref={laag} className="bt" aria-hidden="true" data-rustig={rustig ? "ja" : "nee"} data-sfeer={RUSTIG ? "rustig" : "vol"}>
      {/* Het raster ligt verder weg: het schuift langzamer dan de pagina. */}
      <div className="bt-raster" />
      {zones && (
        <div
          className="bt-zones"
          style={
            {
              "--z-vakken": `${zones.vakken}px`,
              "--z-atelier": `${zones.atelier}px`,
              "--z-kust": `${zones.kust}px`,
              height: `${zones.einde}px`,
            } as React.CSSProperties
          }
        />
      )}
      {los.map((l, i) => (
        <div
          key={i}
          className={`bt-los bt-los-${l.soort}`}
          style={{ left: l.x, top: l.y, width: l.b, "--draai": `${l.draai}deg`, "--d": l.diepte, "--top": l.y } as React.CSSProperties}
        >
          {l.soort === "koffie" && <Koffiekring zaad={i + 3} />}
          {l.soort === "potlood" && <Potlood />}
          {l.soort === "gum" && <Gum />}
          {l.soort === "clip" && <Paperclip />}
          {l.soort === "liniaal" && <Liniaal />}
          {l.soort === "inkt" && <Inktvlek zaad={i + 7} />}
        </div>
      ))}
      <div className="bt-ezelsoor" />
      <svg className="bt-filters" width="0" height="0" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <filter key={n} id={`bt-kriebel-${n}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={n * 11} />
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
        ))}
      </svg>
      {blad("a", <Vooraanzicht />)}
      {blad("b", <Opengewerkt />)}
      {blad("c", <Tandwielen />)}
      {blad("d", <Oplaadpaal />)}
      {blad("e", <Werkbank />)}
      {blad("f", <Ideelamp />)}
      {blad("g", <Petje />)}
      {blad(
        "prototype",
        <>
          <Plateau />
          <Bliepo3DGedeeld rustig={rustig} />
          <p className="bt-tikhint">← tik maar eens op mij!</p>
        </>,
      )}
      {blad("titel", <Titelblok testritten={testritten} />)}
    </div>
  );
}
