"use client";

/**
 * De reis door de drie werelden (16 oktober 2026, keuze eigenaar).
 *
 * De achtergrond van de startpagina is één doorlopende tocht, van boven naar
 * beneden, door de drie werelden van Zappie:
 *
 *   Universum  bovenaan, bij de werelden: een diepblauwe nacht met een
 *              papieren maan, een planeet met een ring en uitgeknipte sterren;
 *   Aarde      in het midden: je zakt door papieren wolken naar een lucht met
 *              vogeltjes van gevouwen papier, en heuvels, bomen en een molen;
 *   Oceaan     onderaan: een strand, golven met een papieren bootje, en dan
 *              onder water: lichtstralen, vissen, zeewier en de zeebodem, waar
 *              Zappie staat.
 *
 * Twee technieken door elkaar: waterverf voor de luchten en het water (vlekken
 * met een rafelige rand, Waterverf.tsx), en geknipt papier voor alles wat
 * ervoor staat, met een korte papierschaduw. Geen glans en geen gloed.
 *
 * Wat er beweegt is rustig en klein: vogeltjes en vissen bewegen heel langzaam,
 * het zeewier wiegt, en bij het scrollen schuiven de lagen een beetje over
 * elkaar (diepte). Kom je met de muis of een vinger bij een vis, de boot, een
 * vogel of een ster, dan reageert die even. Bij "Beweging uit" en "minder
 * beweging" staat alles stil.
 *
 * Alles hangt aan de echte plek van de stukken van de pagina, dus het klopt op
 * elke schermgrootte. De laag ligt áchter de inhoud; klikken gaat er altijd
 * doorheen.
 */

import { useEffect, useRef, useState } from "react";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { Vlek, WaterverfFilters } from "@/components/zappie/wereldreis/Waterverf";
import {
  Bel,
  Boot,
  Golven,
  Heuvels,
  Lichtstralen,
  Maan,
  Molen,
  Planeet,
  Schelp,
  Ster,
  Vis,
  Vogel,
  Wolk,
  Zandbodem,
  Zeewier,
  Zeester,
} from "@/components/zappie/wereldreis/Papier";
import { useVoortgang } from "@/lib/zappie/opslag";

type Vak = { x: number; y: number; b: number; h: number };

/** Een los stuk papier (of verf) op de pagina. */
type Stuk = {
  sleutel: string;
  vak: Vak;
  /** Diepte bij scrollen: positief = verder weg (blijft achter), negatief = dichterbij. */
  diepte: number;
  inhoud: React.ReactNode;
  /** Extra klasse, bijvoorbeeld voor een langzame beweging. */
  klasse?: string;
  draai?: number;
};

/** Waar de werelden in elkaar overgaan, voor de kleur van de lucht en het water. */
type Grenzen = { lucht: number; zee: number; einde: number };

const BEREIK = 70;
const DUUR = 1600;

export function Wereldreis() {
  const laag = useRef<HTMLDivElement>(null);
  const [stukken, zetStukken] = useState<Stuk[]>([]);
  const [grenzen, zetGrenzen] = useState<Grenzen | null>(null);
  const [zappie, zetZappie] = useState<Vak | null>(null);
  const rustig = useBewegingsstand() !== "aan";
  const v = useVoortgang();
  const missies = Object.values(v.missies).reduce((som, n) => som + n, 0);

  /* Meten: waar zijn de werelden, de vakken, het atelier en het slot? */
  useEffect(() => {
    const el = laag.current;
    const pagina = el?.parentElement;
    if (!el || !pagina) return;
    const meet = () => {
      const basis = pagina.getBoundingClientRect();
      const B = basis.width;
      const smal = B < 700;
      const rect = (e: Element | null) => {
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return { l: r.left - basis.left, t: r.top - basis.top, r: r.right - basis.left, o: r.bottom - basis.top };
      };
      /* Alleen de letters van een kop, niet het hele blok. */
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
        return {
          l: Math.min(...vakken.map((q) => q.left)) - basis.left,
          r: Math.max(...vakken.map((q) => q.right)) - basis.left,
          t: Math.min(...vakken.map((q) => q.top)) - basis.top,
          o: Math.max(...vakken.map((q) => q.bottom)) - basis.top,
        };
      };

      const wereldkaarten = [...document.querySelectorAll(".zp-werelden a, .zp-werelden button")]
        .filter((k) => k.getBoundingClientRect().width > 0)
        .map((k) => rect(k)!);
      const paneel = document.querySelector(".zp-vk-kaart");
      const kaarten = wereldkaarten.length ? wereldkaarten : paneel ? [rect(paneel)!] : [];
      const vakkop = tekst("#vrij-oefenen .zs-kop");
      const vakkenLijst = [...document.querySelectorAll(".zs-vakken > *")].map((k) => rect(k)!);
      const vrij = tekst("#vrij-oefenen .zs-vrijemissie") ?? null;
      const atelierkop = tekst("#zappies-atelier .zs-kop");
      const kust = rect(document.querySelector(".zs-kust"));
      const kusttekst = tekst(".zs-kust-tekst");
      const einde = pagina.scrollHeight;
      if (!kaarten.length || !vakkop || !atelierkop || !kust || !kusttekst) return;

      /* De grenzen: tot de vakken is het nacht, tot het atelier lucht en land, daarna zee. */
      const lucht = vakkop.t - 60;
      const vakkenOnder = Math.max(...vakkenLijst.map((k) => k.o), vakkop.o, vrij?.o ?? 0);
      const zee = Math.max(vakkenOnder + 120, atelierkop.t - 70);
      zetGrenzen({ lucht, zee, einde });

      const nieuw: Stuk[] = [];
      const zet = (s: Stuk) => {
        if (s.vak.b > 6 && s.vak.x + s.vak.b > 0 && s.vak.x < B) nieuw.push(s);
      };

      /* ---- Universum ---- */
      const links = Math.min(...kaarten.map((k) => k.l));
      const rechts = Math.max(...kaarten.map((k) => k.r));
      const boven = Math.min(...kaarten.map((k) => k.t));
      const onder = Math.max(...kaarten.map((k) => k.o));
      const ruimteL = links - 16;
      const ruimteR = B - rechts - 16;

      zet({ sleutel: "nevel-1", vak: { x: -B * 0.1, y: boven - 140, b: B * 0.55, h: 460 }, diepte: 0.12, inhoud: <Vlek kleur="#6b4fc8" zaad={1} dekking={0.32} /> });
      zet({ sleutel: "nevel-2", vak: { x: B * 0.55, y: boven + 120, b: B * 0.6, h: 520 }, diepte: 0.1, inhoud: <Vlek kleur="#2f6fd6" zaad={2} dekking={0.3} /> });
      zet({ sleutel: "nevel-3", vak: { x: B * 0.15, y: onder + 60, b: B * 0.7, h: 420 }, diepte: 0.08, inhoud: <Vlek kleur="#c0569a" zaad={3} dekking={0.14} /> });

      if (ruimteR > 110) {
        const m = Math.min(150, ruimteR - 20);
        zet({ sleutel: "maan", vak: { x: rechts + (ruimteR - m) / 2 + 8, y: boven + 10, b: m, h: m }, diepte: 0.06, inhoud: <Maan />, klasse: "wr-reageer" });
      } else if (smal) {
        zet({ sleutel: "maan", vak: { x: 56, y: 92, b: 64, h: 64 }, diepte: 0.04, inhoud: <Maan /> });
      }
      if (ruimteL > 110) {
        const p = Math.min(170, ruimteL - 10);
        zet({ sleutel: "planeet", vak: { x: (ruimteL - p) / 2 + 4, y: onder - p - 20, b: p, h: p * 0.7 }, diepte: 0.05, inhoud: <Planeet /> });
      }
      const sterren: [number, number, number][] = smal
        ? [[B * 0.05, 110, 18], [B * 0.86, onder + 40, 16], [B * 0.12, onder + 70, 14]]
        : [
            [ruimteL * 0.3, boven + 30, 24],
            [ruimteL * 0.75, boven + 140, 16],
            [rechts + ruimteR * 0.25, onder - 60, 20],
            [rechts + ruimteR * 0.7, onder - 140, 14],
            [B * 0.3, onder + 50, 18],
            [B * 0.66, onder + 70, 22],
            [B * 0.9, onder + 120, 16],
          ];
      sterren.forEach(([x, y, s], i) =>
        zet({ sleutel: `ster-${i}`, vak: { x: x - s / 2, y, b: s, h: s }, diepte: 0.04, inhoud: <Ster zaad={i} />, klasse: "wr-reageer wr-ster" }),
      );

      /* ---- De wolken: de overgang van nacht naar lucht ---- */
      /* De wolken hangen tussen de panelen en de kop van de vakken, nooit over tekst. */
      const wolkOnder = vakkop.t - 24;
      const wolken: [number, number, number][] = smal
        ? [[-30, 0, 160], [B - 140, 30, 170]]
        : [
            [-60, 10, 300],
            [B * 0.36, 40, 220],
            [B * 0.6, 0, 260],
            [B - 240, 30, 300],
          ];
      wolken.forEach(([x, dy, b], i) =>
        zet({ sleutel: `wolk-${i}`, vak: { x, y: wolkOnder - b * 0.42 - dy, b, h: b * 0.42 }, diepte: 0, inhoud: <Wolk zaad={i} /> }),
      );

      /* ---- Aarde ---- */
      zet({ sleutel: "lucht-vlek", vak: { x: -B * 0.1, y: lucht + 40, b: B * 1.2, h: zee - lucht }, diepte: 0.05, inhoud: <Vlek kleur="#7ec3f0" zaad={4} dekking={0.22} /> });
      const vogels: [number, number, number][] = smal
        ? []
        : [[B * 0.24, wolkOnder - 210, 34], [B * 0.78, wolkOnder - 230, 28], [B * 0.55, vakkenOnder + 40, 30]];
      vogels.forEach(([x, y, s], i) =>
        zet({ sleutel: `vogel-${i}`, vak: { x, y, b: s * 1.6, h: s }, diepte: -0.02, inhoud: <Vogel />, klasse: `wr-reageer wr-vogel wr-zweef-${i % 3}` }),
      );
      const heuvelH = Math.max(80, Math.min(240, zee - vakkenOnder - 30));
      zet({ sleutel: "heuvels", vak: { x: 0, y: zee - heuvelH + 20, b: B, h: heuvelH }, diepte: 0, inhoud: <Heuvels breedte={B} /> });
      /* De molen staat op de middelste heuvel. */
      const heuvelTop = zee - heuvelH + 20;
      if (!smal) zet({ sleutel: "molen", vak: { x: B * 0.82, y: heuvelTop + heuvelH * (150 / 240) - 96, b: 74, h: 110 }, diepte: 0, inhoud: <Molen />, klasse: "wr-reageer wr-molen" });

      /* ---- Oceaan ---- */
      zet({ sleutel: "golven", vak: { x: 0, y: zee - 8, b: B, h: 120 }, diepte: 0, inhoud: <Golven breedte={B} /> });
      zet({ sleutel: "boot", vak: { x: smal ? B * 0.62 : B * 0.68, y: zee - 52, b: 86, h: 64 }, diepte: 0, inhoud: <Boot />, klasse: "wr-reageer wr-boot" });
      zet({ sleutel: "water-1", vak: { x: -B * 0.15, y: zee + 120, b: B * 0.8, h: (einde - zee) * 0.5 }, diepte: 0.06, inhoud: <Vlek kleur="#1aa0b8" zaad={5} dekking={0.16} /> });
      zet({ sleutel: "water-2", vak: { x: B * 0.4, y: zee + (einde - zee) * 0.4, b: B * 0.8, h: (einde - zee) * 0.5 }, diepte: 0.06, inhoud: <Vlek kleur="#3b5bd0" zaad={6} dekking={0.18} /> });
      zet({ sleutel: "stralen", vak: { x: B * 0.05, y: zee + 30, b: B * 0.9, h: Math.min(900, einde - zee) }, diepte: 0.04, inhoud: <Lichtstralen /> });

      const vissen: [number, number, number, boolean][] = smal
        ? [[B * 0.1, atelierkop.o + 30, 46, false], [B * 0.65, kust.t + 60, 40, true]]
        : [
            [B * 0.04, atelierkop.t + 120, 54, false],
            [B * 0.9, atelierkop.t + 360, 46, true],
            [B * 0.08, kust.t + 140, 40, false],
            [B * 0.62, kust.t + 80, 60, true],
            [B * 0.86, kust.t + 260, 38, true],
          ];
      vissen.forEach(([x, y, b, links], i) =>
        zet({ sleutel: `vis-${i}`, vak: { x, y, b, h: b * 0.6 }, diepte: -0.03, inhoud: <Vis zaad={i} kleur={i} naarLinks={links} />, klasse: `wr-reageer wr-vis wr-zwem-${i % 3}` }),
      );
      [[B * 0.3, kust.t + 200], [B * 0.32, kust.t + 160], [B * 0.74, kust.t + 330], [B * 0.95, atelierkop.t + 300]].forEach(([x, y], i) =>
        zet({ sleutel: `bel-${i}`, vak: { x, y, b: 10 + (i % 2) * 6, h: 10 + (i % 2) * 6 }, diepte: -0.02, inhoud: <Bel />, klasse: "wr-bel" }),
      );

      /* De zeebodem, met zeewier, schelpen en Zappie. */
      const bodemH = smal ? 70 : 110;
      zet({ sleutel: "bodem", vak: { x: 0, y: einde - bodemH, b: B, h: bodemH }, diepte: 0, inhoud: <Zandbodem breedte={B} /> });
      const wier: [number, number][] = smal ? [[B * 0.06, 90], [B * 0.88, 110]] : [[B * 0.03, 170], [B * 0.25, 120], [B * 0.56, 100], [B * 0.93, 180], [B * 0.8, 120]];
      wier.forEach(([x, h], i) =>
        zet({ sleutel: `wier-${i}`, vak: { x, y: einde - bodemH * 0.55 - h, b: h * 0.4, h }, diepte: 0, inhoud: <Zeewier zaad={i} />, klasse: `wr-wier wr-wieg-${i % 3}` }),
      );
      if (!smal) {
        zet({ sleutel: "schelp", vak: { x: B * 0.44, y: einde - bodemH * 0.55, b: 34, h: 26 }, diepte: 0, inhoud: <Schelp /> });
        zet({ sleutel: "zeester", vak: { x: B * 0.7, y: einde - bodemH * 0.5, b: 40, h: 40 }, diepte: 0, inhoud: <Zeester />, klasse: "wr-reageer wr-zeester" });
      }

      /* Zappie staat op de bodem, links van de slottekst (op telefoon erboven). */
      const ruimteZappie = kusttekst.l - 24;
      if (ruimteZappie >= 230) {
        const b = Math.min(300, ruimteZappie - 24);
        const h = Math.min(kust.o - kust.t - 24, b * 1.3);
        zetZappie({ x: Math.max(24, (ruimteZappie - b) / 2), y: einde - bodemH * 0.32 - h, b, h });
      } else {
        const b = Math.min(240, B - 32);
        const h = Math.min(b * 1.25, kusttekst.t - kust.t - 12);
        zetZappie(h > 180 ? { x: (B - b) / 2, y: kust.t + 8, b, h } : null);
      }

      zetStukken(nieuw);
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

  /* Diepte bij het scrollen. */
  useEffect(() => {
    const el = laag.current;
    if (!el) return;
    if (rustig) {
      el.style.setProperty("--scroll", "0");
      el.style.setProperty("--midden", "0");
      return;
    }
    let frame = 0;
    const teken = () => {
      frame = 0;
      el.style.setProperty("--scroll", window.scrollY.toFixed(0));
      el.style.setProperty("--midden", (window.innerHeight / 2).toFixed(0));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(teken);
    };
    teken();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(frame);
    };
  }, [rustig]);

  /* Kleine verrassingen in de buurt van de muis of een vinger. */
  useEffect(() => {
    const el = laag.current;
    if (!el || rustig) return;
    let frame = 0;
    let laatste: PointerEvent | null = null;
    const bezig = new WeakMap<Element, number>();
    const verwerk = () => {
      frame = 0;
      const e = laatste;
      if (!e) return;
      const nu = performance.now();
      for (const stuk of el.querySelectorAll(".wr-reageer")) {
        const r = stuk.getBoundingClientRect();
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        if (dx * dx + dy * dy > BEREIK * BEREIK) continue;
        if ((bezig.get(stuk) ?? 0) > nu) continue;
        bezig.set(stuk, nu + DUUR);
        stuk.classList.add("wr-actief");
        window.setTimeout(() => stuk.classList.remove("wr-actief"), DUUR - 150);
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
  }, [rustig, stukken]);

  return (
    <div
      ref={laag}
      className="wr"
      aria-hidden="true"
      data-rustig={rustig ? "ja" : "nee"}
      style={
        grenzen
          ? ({ "--wr-lucht": `${grenzen.lucht}px`, "--wr-zee": `${grenzen.zee}px`, "--wr-einde": `${grenzen.einde}px` } as React.CSSProperties)
          : undefined
      }
    >
      <WaterverfFilters />
      <div className="wr-kleur" />
      {stukken.map((s) => (
        <div
          key={s.sleutel}
          className={`wr-stuk${s.klasse ? ` ${s.klasse}` : ""}`}
          style={
            {
              left: s.vak.x,
              top: s.vak.y,
              width: s.vak.b,
              height: s.vak.h,
              "--d": s.diepte,
              "--top": s.vak.y + s.vak.h / 2,
              "--draai": `${s.draai ?? 0}deg`,
            } as React.CSSProperties
          }
        >
          {s.inhoud}
        </div>
      ))}
      <div className="wr-korrel" />
      {zappie && (
        <div className="wr-zappie" style={{ left: zappie.x, top: zappie.y, width: zappie.b, height: zappie.h }}>
          <Bliepo3DGedeeld rustig={rustig} />
          <p className="wr-tikhint">← tik maar eens op mij!</p>
          <p className="wr-bordje">
            {missies === 0 ? "Nog geen missies. Doe je mee?" : missies === 1 ? "Al 1 missie gedaan!" : `Al ${missies} missies gedaan!`}
          </p>
        </div>
      )}
    </div>
  );
}
