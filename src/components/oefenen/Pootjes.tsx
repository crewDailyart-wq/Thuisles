"use client";

/**
 * Splitsen via 10 in de schoolvorm, met "pootjes" (oktober 2026).
 *
 *        6 + 5 = ▢
 *           / \
 *          ▢   ▢
 *
 * Bovenaan de som met een leeg vakje voor de uitkomst. Onder het tweede getal
 * twee schuine lijntjes, met onder elk lijntje een leeg vakje: links hoeveel
 * er nodig is om de 10 vol te maken, rechts wat er daarna nog bij moet.
 *
 * Zichtbaar en kinderlijk (ronde 2):
 *   stap 1  klopt het linker pootje (6 en 4), dan tekent zich een lusje om de
 *           6 en de 4, alsof het met een krijtje gebeurt (0,6 seconde), met
 *           daarop een hartje met "10" en een wolkje "Samen 10!". Klopt het
 *           niet, dan schudt het vakje zachtjes en zegt het wolkje "Nog geen
 *           10. Hoeveel moet er bij 6 om 10 te maken?"
 *   stap 2  een stippellijntje springt van het hartje naar het rechter
 *           pootje: "En nog …?"
 *   stap 3  klopt de rest, dan springt die naar het antwoordvakje: "10 en nog
 *           1 is …"
 *   goed    het hartje klopt even zacht.
 *
 * Staat het geluid aan, dan worden de wolkjes voorgelezen. Het lusje en de
 * lijntjes worden gemeten aan waar de vakjes echt staan, dus ze passen zich
 * aan op een laptop, een tablet en een telefoon.
 *
 * De vakjes zelf komen van de opdracht die dit gebruikt, zodat typen, nakijken
 * en doorspringen hetzelfde blijven. De volgorde van het antwoord is links
 * pootje, rechts pootje, uitkomst.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { zeg } from "@/lib/stem";
import { geluidStaatAan } from "@/lib/geluid";

/** Twee kleine vakjes van 48 pixels met ruimte ertussen. */
const BREED = 136;
const VAK = 48;
const HOOG = 34;
/** De warme kleur van het lusje en het hartje. */
const KRIJT = "var(--color-huisstijl)";

type Rect = { x: number; y: number; b: number; h: number };

function minderBeweging(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Een lusje dat er met de hand getekend uitziet: een ovaal om twee punten,
 * met een klein beetje beweging in de lijn en een eind dat net over het begin
 * heen loopt, zoals bij een stift.
 */
function lusPad(a: { x: number; y: number }, c: { x: number; y: number }, ry: number): string {
  const mx = (a.x + c.x) / 2;
  const my = (a.y + c.y) / 2;
  const hoek = Math.atan2(c.y - a.y, c.x - a.x);
  const rx = Math.hypot(c.x - a.x, c.y - a.y) / 2 + 30;
  const punten: string[] = [];
  const stappen = 40;
  for (let i = 0; i <= stappen + 4; i++) {
    const t = (i / stappen) * Math.PI * 2 - Math.PI * 0.6;
    /* Een vaste, kleine wiebel: elke keer hetzelfde, nooit rommelig. */
    const wiebel = 1 + 0.035 * Math.sin(t * 3) + (i > stappen ? 0.05 : 0);
    const lx = Math.cos(t) * rx * wiebel;
    const ly = Math.sin(t) * ry * wiebel;
    const x = mx + lx * Math.cos(hoek) - ly * Math.sin(hoek);
    const y = my + lx * Math.sin(hoek) + ly * Math.cos(hoek);
    punten.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return punten.join(" ");
}

/**
 * Het eind van het lusje aan de kant van het linker pootje: daar komt het
 * hartje, vlak bij het rechter pootje waar het sprongetje heen gaat.
 */
function eindpunt(a: { x: number; y: number }, c: { x: number; y: number }) {
  const mx = (a.x + c.x) / 2;
  const my = (a.y + c.y) / 2;
  const hoek = Math.atan2(c.y - a.y, c.x - a.x);
  const rx = Math.hypot(c.x - a.x, c.y - a.y) / 2 + 30;
  return { x: mx + rx * Math.cos(hoek), y: my + rx * Math.sin(hoek) };
}

export function Pootjes({
  eerste,
  tweede,
  links,
  rechts,
  uitkomst,
  waarden = [],
  fase = "bezig",
}: {
  eerste: number;
  tweede: number;
  /** Het linker pootje: wat er bij het eerste getal moet tot 10. */
  links: ReactNode;
  /** Het rechter pootje: wat er daarna nog bij moet. */
  rechts: ReactNode;
  /** Het vakje voor de uitkomst, bovenaan in de som. */
  uitkomst: ReactNode;
  /** Wat er in de drie vakjes getypt staat: links, rechts, uitkomst. */
  waarden?: string[];
  fase?: "bezig" | "goed" | "fout";
}) {
  const totTien = 10 - eerste;
  const rest = tweede - totTien;
  const linksGoed = waarden[0] !== undefined && waarden[0] !== "" && Number(waarden[0]) === totTien;
  const linksFout = waarden[0] !== undefined && waarden[0] !== "" && !linksGoed;
  const rechtsGoed = linksGoed && waarden[1] !== undefined && waarden[1] !== "" && Number(waarden[1]) === rest;

  const vlak = useRef<HTMLDivElement | null>(null);
  const eersteRef = useRef<HTMLSpanElement | null>(null);
  const linksRef = useRef<HTMLSpanElement | null>(null);
  const rechtsRef = useRef<HTMLSpanElement | null>(null);
  const uitkomstRef = useRef<HTMLSpanElement | null>(null);
  const [maten, setMaten] = useState<Record<string, Rect> | null>(null);

  /* Waar de vakjes echt staan, ook als het scherm verandert. */
  useLayoutEffect(() => {
    const el = vlak.current;
    if (!el) return;
    const meet = () => {
      const basis = el.getBoundingClientRect();
      const van = (r: HTMLElement | null): Rect | null => {
        const m = r?.getBoundingClientRect();
        return m ? { x: m.left - basis.left, y: m.top - basis.top, b: m.width, h: m.height } : null;
      };
      const e = van(eersteRef.current);
      const l = van(linksRef.current);
      const r = van(rechtsRef.current);
      const u = van(uitkomstRef.current);
      if (e && l && r && u) setMaten({ e, l, r, u });
    };
    meet();
    const kijker = new ResizeObserver(meet);
    kijker.observe(el);
    return () => kijker.disconnect();
  }, []);

  /*
    De stappen na elkaar: eerst het lusje, dan het hartje, dan het sprongetje.
    Alleen via klokjes, en bij een ander getal terug naar het begin.
  */
  const [stap, setStap] = useState(0);
  useEffect(() => {
    if (!linksGoed) return;
    const snel = minderBeweging();
    const klokjes = [
      window.setTimeout(() => setStap(1), 30),
      window.setTimeout(() => setStap(2), snel ? 40 : 650),
      window.setTimeout(() => setStap(3), snel ? 50 : 1700),
    ];
    return () => {
      klokjes.forEach((k) => window.clearTimeout(k));
      setStap(0);
    };
  }, [linksGoed]);

  /*
    Klopt het linker pootje niet, dan schudt het vakje zachtjes. Met een
    losse animatie op het vakje zelf, zodat het invoerveld de cursor houdt en
    het kind het getal meteen kan verbeteren.
  */
  useEffect(() => {
    if (!linksFout || fase !== "bezig" || minderBeweging()) return;
    linksRef.current?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 350, easing: "ease-out" },
    );
  }, [linksFout, waarden[0], fase]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Het wolkje: wat er nu te zeggen valt. */
  const wolkje =
    fase !== "bezig"
      ? null
      : linksFout
        ? `Nog geen 10. Hoeveel moet er bij ${eerste} om 10 te maken?`
        : rechtsGoed
          ? `10 en nog ${rest} is …`
          : linksGoed && stap >= 3
            ? "En nog …?"
            : linksGoed && stap >= 2
              ? "Samen 10!"
              : null;

  /* Voorlezen als het geluid aanstaat; elke zin één keer. */
  const gezegd = useRef<string | null>(null);
  useEffect(() => {
    if (!wolkje || gezegd.current === wolkje) return;
    gezegd.current = wolkje;
    if (geluidStaatAan()) zeg(wolkje);
  }, [wolkje]);

  const teken = (t: string) => <span className="text-2xl font-extrabold text-inkt-zacht">{t}</span>;

  /* De vorm van het lusje, het hartje en het sprongetje, uit de gemeten maten. */
  const midden = (r: Rect) => ({ x: r.x + r.b / 2, y: r.y + r.h / 2 });
  let lus: string | null = null;
  let hart: { x: number; y: number } | null = null;
  let sprong: string | null = null;
  if (maten) {
    const a = midden(maten.e);
    const c = midden(maten.l);
    const ry = Math.max(maten.e.h, maten.l.h) / 2 + 8;
    lus = lusPad(a, c, ry);
    hart = eindpunt(a, c);
    /* Het sprongetje: een boogje omhoog van het hartje naar het rechter pootje. */
    const doel = { x: maten.r.x + 4, y: maten.r.y + maten.r.h / 2 };
    const top = Math.min(hart.y, doel.y) - 28;
    sprong = `M${hart.x + 10} ${hart.y - 6} Q ${(hart.x + doel.x) / 2} ${top} ${doel.x} ${doel.y}`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={vlak} className="relative pb-5">
        <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-center justify-center gap-x-3">
          <span ref={eersteRef} className="grid">
            <Gegeven waarde={eerste} />
          </span>
          {teken("+")}
          <Gegeven waarde={tweede} />
          {teken("=")}
          <span ref={uitkomstRef} className="grid">
            {uitkomst}
          </span>

          {/* De pootjes onder het tweede getal. */}
          <div className="col-start-3 flex w-0 justify-center justify-self-center overflow-visible">
            <div className="flex flex-none flex-col items-stretch" style={{ width: BREED }}>
              <svg width={BREED} height={HOOG} viewBox={`0 0 ${BREED} ${HOOG}`} aria-hidden="true" className="block">
                <line x1={BREED / 2} y1={2} x2={VAK / 2} y2={HOOG} stroke="var(--color-inkt)" strokeWidth={3} strokeLinecap="round" />
                <line x1={BREED / 2} y1={2} x2={BREED - VAK / 2} y2={HOOG} stroke="var(--color-inkt)" strokeWidth={3} strokeLinecap="round" />
              </svg>
              <div className="flex justify-between">
                <span ref={linksRef} className="grid">
                  {links}
                </span>
                <span ref={rechtsRef} className="grid">
                  {rechts}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Het lusje, het hartje en de sprongetjes, over de som heen getekend. */}
        {maten && (
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
            {linksGoed && lus && (
              <path
                d={lus}
                pathLength={1}
                fill="none"
                stroke={KRIJT}
                strokeOpacity={0.75}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={1}
                strokeDashoffset={stap >= 1 ? 0 : 1}
                style={{ transition: minderBeweging() ? "none" : "stroke-dashoffset 600ms ease-out" }}
                className="pootjes-lus"
              />
            )}
            {linksGoed && stap >= 3 && sprong && fase === "bezig" && !rechtsGoed && (
              <path d={sprong} fill="none" stroke={KRIJT} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
            )}
          </svg>
        )}

        {/* Het hartje met 10. */}
        {linksGoed && stap >= 2 && hart && (
          <span
            className={`pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center ${
              fase === "goed" ? "motion-safe:animate-hartklop" : "motion-safe:animate-bolletje-klik"
            }`}
            style={{ left: hart.x, top: hart.y }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 32 30" className="absolute inset-0 size-full">
              <path d="M16 28C6 20 1 14 1 8.5 1 4.4 4.3 1 8.4 1c3 0 5.6 1.8 7.6 4.6C18 2.8 20.6 1 23.6 1 27.7 1 31 4.4 31 8.5 31 14 26 20 16 28z" fill={KRIJT} />
            </svg>
            <span className="relative -mt-1 text-[0.8rem] font-extrabold text-white">10</span>
          </span>
        )}

        {/* De rest springt naar het antwoordvakje. */}
        {rechtsGoed && maten && fase === "bezig" && (
          <span
            className="pointer-events-none absolute grid size-8 place-items-center rounded-full bg-huisstijl text-base font-extrabold text-white shadow"
            style={{
              left: maten.u.x + maten.u.b / 2 - 16,
              top: maten.u.y - 18,
              animation: minderBeweging() ? undefined : "pootjes-sprong 500ms ease-out both",
              ["--van-x" as string]: `${maten.r.x + maten.r.b / 2 - (maten.u.x + maten.u.b / 2)}px`,
              ["--van-y" as string]: `${maten.r.y - maten.u.y + 18}px`,
            }}
            aria-hidden="true"
          >
            {rest}
          </span>
        )}
      </div>

      {/* Het tekstwolkje: rond, kort, in kindertaal. */}
      <div className="flex min-h-12 items-start justify-center" aria-live="polite">
        {wolkje && (
          <p
            key={wolkje}
            className="motion-safe:animate-bolletje-klik relative rounded-3xl border-2 border-huisstijl/30 bg-huisstijl-zacht px-4 py-2 text-center text-lg font-extrabold text-huisstijl-diep"
          >
            <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-huisstijl/30 bg-huisstijl-zacht" />
            <span className="relative">{wolkje}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/** De zin bij goed en fout: "6 en 4 is samen 10. En nog 1 erbij: 11." */
export function pootjesZin(eerste: number, tweede: number): string {
  const totTien = 10 - eerste;
  const rest = tweede - totTien;
  return `${eerste} en ${totTien} is samen 10. En nog ${rest} erbij: ${eerste + tweede}.`;
}
