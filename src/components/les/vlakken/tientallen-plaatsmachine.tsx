"use client";

/**
 * De plaatsmachine van Tientallen (oktober 2026), naar Synthesis "Power of
 * Place · The Power of Place".
 *
 * Een smal, hoog vak met dunne wanden, bovenin klein "1" en onderin groot het
 * cijfer dat zegt hoeveel stippen erin zitten. Tik in het vak en er valt een
 * blauwe stip met een 1 erop in. Bij de tiende stip kleurt het vak rood en
 * staat er een verbodsteken in plaats van een cijfer: voor tien is er geen
 * cijfer. Dan komt er links een tweede vak bij ("10"). Sleep je een blauwe
 * stip daarheen, dan vliegen alle tien mee en worden ze samen één groene stip;
 * sleep je die terug, dan valt hij weer uit elkaar in tien blauwe.
 *
 * Het draaiboek zet de aantallen; het vlak meldt `{ soort: "tik" }`,
 * `{ soort: "uit" }` (een stip uit het vak gesleept), `{ soort: "naarTien" }`
 * en `{ soort: "naarEen" }`, alleen als dat aan staat.
 *
 * Voor "The Power of Place: Part 2" (tot 99): met `kleineTienen` liggen de
 * groene stippen (tot 9) als knikkers in het vak van de tientallen, net als de
 * blauwe; met `tikTien` meldt een tik in dat vak `{ soort: "tikTien" }`, en
 * `slotTien` zet er een slotje op.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import s from "./optellen100.module.css";

export type PlaatsProps = {
  kolommen: 1 | 2;
  /** Blauwe stippen in het vak van de enen (10 = vol). */
  enen: number;
  /** Groene stippen in het vak van de tientallen (0 of 1). */
  tienen: number;
  /** "TOTAAL: 10" bovenaan. */
  totaal?: boolean;
  tik?: boolean;
  sleepUit?: boolean;
  sleepNaarTien?: boolean;
  sleepNaarEen?: boolean;
  /** Een slotje op het vak van de enen: daar kan niets in. */
  slotEen?: boolean;
  /** De cijfers 0 tot en met 9 onderaan; deze lichten op. */
  cijferrij?: number[] | null;
  /** Groene stippen (tot 9) als knikkers in het tientallenvak, zo groot als de blauwe. */
  kleineTienen?: boolean;
  /** Een tik in het tientallenvak meldt `tikTien`. */
  tikTien?: boolean;
  /** Een slotje op het vak van de tientallen. */
  slotTien?: boolean;
};

export type PlaatsMelding = { soort: "tik" } | { soort: "uit" } | { soort: "naarTien" } | { soort: "naarEen" } | { soort: "tikTien" };

const EEN = { x: 490, y: 220, b: 170, h: 330 };
const TIEN = { x: 320, y: 220, b: 170, h: 330 };
const BLAUW = "#3d8ff0";
const GROEN = "#3fb34f";
const WAND = "rgba(170,190,230,0.65)";
const GROEN_PLEK = { x: TIEN.x + TIEN.b / 2, y: EEN.y + EEN.h - 60 };

/** Tien plekken voor de stippen, gestapeld als knikkers: 3, 2, 3, 2 van onder naar boven. */
const STIPPLEK = (() => {
  const uit: { x: number; y: number }[] = [];
  const rijen = [3, 2, 3, 2];
  rijen.forEach((aantal, r) => {
    for (let i = 0; i < aantal; i++) {
      const x = aantal === 3 ? EEN.x + 30 + i * 55 : EEN.x + 57 + i * 55;
      uit.push({ x, y: EEN.y + EEN.h - 34 - r * 46 });
    }
  });
  return uit;
})();

function Stip({ x, y, groen = false, klein = false, klasse, stijl }: { x: number; y: number; groen?: boolean; klein?: boolean; klasse?: string; stijl?: CSSProperties }) {
  const groot = groen && !klein;
  const r = groot ? 34 : 24;
  return (
    <g className={klasse} style={stijl}>
      <circle cx={x} cy={y} r={r} fill={groen ? GROEN : BLAUW} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="rgba(255,255,255,0.22)" />
      <text x={x} y={y + (groot ? 8 : 5)} textAnchor="middle" fontSize={groot ? 22 : 14} fontWeight={800} fill="#ffffff">
        {groen ? "10" : "1"}
      </text>
    </g>
  );
}

function Vak({ x, y, b, h, label, vol }: { x: number; y: number; b: number; h: number; label: string; vol: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={b} height={h} fill={vol ? "rgba(217,35,71,0.16)" : "transparent"} style={{ transition: "fill 0.3s" }} />
      <line x1={x} y1={y - 20} x2={x} y2={y + h + 70} stroke={WAND} strokeWidth={2} />
      <line x1={x + b} y1={y - 20} x2={x + b} y2={y + h + 70} stroke={WAND} strokeWidth={2} />
      <text x={x + b / 2} y={y + 6} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize={20} fill="#6f86b8">
        {label}
      </text>
    </g>
  );
}

type Anim = { soort: "naarTien" | "naarEen"; id: number };

export function Plaatsmachine({
  kolommen,
  enen,
  tienen,
  totaal = false,
  tik = false,
  sleepUit = false,
  sleepNaarTien = false,
  sleepNaarEen = false,
  slotEen = false,
  cijferrij = null,
  kleineTienen = false,
  tikTien = false,
  slotTien = false,
  meld,
  schaal,
}: PlaatsProps & Vlakbasis) {
  const wortel = useRef<HTMLDivElement>(null);
  const [sleep, setSleep] = useState<null | { groen: boolean; x: number; y: number; vanX: number; vanY: number }>(null);

  /* Samen vliegen of uit elkaar vallen: afgeleid van de vorige stand. */
  const [vorig, setVorig] = useState({ enen, tienen });
  const [anim, setAnim] = useState<Anim | null>(null);
  const [beweegt, setBeweegt] = useState(0);
  const [klaarId, setKlaarId] = useState(0);
  if (vorig.enen !== enen || vorig.tienen !== tienen) {
    setVorig({ enen, tienen });
    const id = (anim?.id ?? 0) + 1;
    if (tienen === vorig.tienen + 1 && vorig.enen >= 10 && enen === 0) setAnim({ soort: "naarTien", id });
    else if (tienen === vorig.tienen - 1 && enen === 10 && vorig.enen === 0) setAnim({ soort: "naarEen", id });
    else setAnim(null);
  }
  useEffect(() => {
    if (!anim) return;
    const id = anim.id;
    let f2 = 0;
    const f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => setBeweegt(id));
    });
    const klok = setTimeout(() => setKlaarId(id), 700);
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
      clearTimeout(klok);
    };
  }, [anim]);
  const bezig = anim !== null && klaarId !== anim.id;
  const beweeg = bezig && beweegt === anim.id;

  const inVlak = useCallback(
    (cx: number, cy: number) => {
      const r = wortel.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      return { x: (cx - r.left) / (schaal || 1), y: (cy - r.top) / (schaal || 1) };
    },
    [schaal],
  );
  const binnen = (p: { x: number; y: number }, v: { x: number; y: number; b: number; h: number }) =>
    p.x >= v.x && p.x <= v.x + v.b && p.y >= v.y - 30 && p.y <= v.y + v.h + 70;

  useEffect(() => {
    if (!sleep) return;
    const beweegVinger = (e: PointerEvent) => {
      const p = inVlak(e.clientX, e.clientY);
      setSleep((v) => (v ? { ...v, x: p.x, y: p.y } : v));
    };
    const los = (e: PointerEvent) => {
      const p = inVlak(e.clientX, e.clientY);
      const bewogen = Math.hypot(p.x - sleep.vanX, p.y - sleep.vanY) > 10;
      if (!bewogen) {
        if (!sleep.groen && tik) meld({ soort: "tik" });
      } else if (sleep.groen) {
        if (sleepNaarEen && binnen(p, EEN)) meld({ soort: "naarEen" });
      } else if (kolommen === 2 && binnen(p, TIEN)) {
        if (sleepNaarTien) meld({ soort: "naarTien" });
      } else if (!binnen(p, EEN) && !(kolommen === 2 && binnen(p, TIEN))) {
        if (sleepUit) meld({ soort: "uit" });
      }
      setSleep(null);
    };
    window.addEventListener("pointermove", beweegVinger);
    window.addEventListener("pointerup", los);
    return () => {
      window.removeEventListener("pointermove", beweegVinger);
      window.removeEventListener("pointerup", los);
    };
  }, [sleep, inVlak, meld, tik, sleepUit, sleepNaarTien, sleepNaarEen, kolommen]);

  const vol = enen >= 10 && !bezig;
  const toonEnen = bezig ? (anim.soort === "naarTien" ? 0 : 0) : Math.min(10, enen);
  const toonTienen = bezig ? (anim.soort === "naarTien" ? tienen - 1 : tienen) : tienen;
  const blauwSleepbaar = sleepUit || sleepNaarTien || tik;
  const totaalGetal = tienen * 10 + enen;

  return (
    <div ref={wortel} className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {totaal && (
          <text x={kolommen === 2 ? EEN.x : EEN.x + EEN.b / 2} y={150} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize={30} fill="#d6d8e1">
            TOTAAL: {totaalGetal}
          </text>
        )}

        {kolommen === 2 && <Vak {...TIEN} label="10" vol={false} />}
        <Vak {...EEN} label="1" vol={vol} />

        {/* tikvlak voor het enenvak */}
        <rect
          x={EEN.x}
          y={EEN.y}
          width={EEN.b}
          height={EEN.h}
          fill="transparent"
          className={tik && !slotEen ? s.knop : undefined}
          role={tik && !slotEen ? "button" : undefined}
          aria-label={tik && !slotEen ? "Doe een stip in het vak" : undefined}
          onPointerDown={(e) => {
            if (!tik || slotEen) return;
            e.preventDefault();
            meld({ soort: "tik" });
          }}
        />

        {/* tikvlak voor het tientallenvak */}
        {kolommen === 2 && (
          <rect
            x={TIEN.x}
            y={TIEN.y}
            width={TIEN.b}
            height={TIEN.h}
            fill="transparent"
            className={tikTien && !slotTien ? s.knop : undefined}
            role={tikTien && !slotTien ? "button" : undefined}
            aria-label={tikTien && !slotTien ? "Doe een stip in het vak van de tientallen" : undefined}
            onPointerDown={(e) => {
              if (!tikTien || slotTien) return;
              e.preventDefault();
              meld({ soort: "tikTien" });
            }}
          />
        )}

        {/* de cijfers onder de vakken */}
        {kolommen === 2 && (
          <text key={`t${toonTienen}`} className={s.plop} x={TIEN.x + TIEN.b / 2} y={EEN.y + EEN.h + 56} textAnchor="middle" fontSize={60} fontWeight={500} fill="#ffffff">
            {toonTienen}
          </text>
        )}
        {vol ? (
          <g className={s.plop} transform={`translate(${EEN.x + EEN.b / 2} ${EEN.y + EEN.h + 36})`}>
            <circle r={22} fill="none" stroke="#d92347" strokeWidth={5} />
            <line x1={-15} y1={-15} x2={15} y2={15} stroke="#d92347" strokeWidth={5} />
          </g>
        ) : (
          <text key={`e${toonEnen}`} className={s.plop} x={EEN.x + EEN.b / 2} y={EEN.y + EEN.h + 56} textAnchor="middle" fontSize={60} fontWeight={500} fill="#ffffff">
            {toonEnen}
          </text>
        )}

        {/* de stippen */}
        {Array.from({ length: toonEnen }, (_, i) => {
          const p = STIPPLEK[i];
          const wegGesleept = sleep && !sleep.groen && i === toonEnen - 1 && Math.hypot(sleep.x - sleep.vanX, sleep.y - sleep.vanY) > 10;
          return (
            <g
              key={`b${i}`}
              style={{ cursor: blauwSleepbaar ? "grab" : undefined, opacity: wegGesleept ? 0.25 : 1 }}
              onPointerDown={(e) => {
                if (!blauwSleepbaar) return;
                e.preventDefault();
                e.stopPropagation();
                const q = inVlak(e.clientX, e.clientY);
                setSleep({ groen: false, x: q.x, y: q.y, vanX: q.x, vanY: q.y });
              }}
            >
              <Stip x={p.x} y={p.y} klasse={s.plop} />
            </g>
          );
        })}
        {Array.from({ length: toonTienen }, (_, i) => {
          const wegGesleept = sleep && sleep.groen && Math.hypot(sleep.x - sleep.vanX, sleep.y - sleep.vanY) > 10;
          return (
            <g
              key={`g${i}`}
              style={{ cursor: sleepNaarEen ? "grab" : tikTien && !slotTien ? "pointer" : undefined, opacity: wegGesleept ? 0.25 : 1 }}
              onPointerDown={(e) => {
                if (!sleepNaarEen) {
                  if (tikTien && !slotTien) {
                    e.preventDefault();
                    meld({ soort: "tikTien" });
                  }
                  return;
                }
                e.preventDefault();
                const q = inVlak(e.clientX, e.clientY);
                setSleep({ groen: true, x: q.x, y: q.y, vanX: q.x, vanY: q.y });
              }}
            >
              {kleineTienen ? (
                <Stip x={STIPPLEK[i % 10].x - (EEN.x - TIEN.x)} y={STIPPLEK[i % 10].y} groen klein klasse={s.plop} />
              ) : (
                <Stip x={GROEN_PLEK.x} y={GROEN_PLEK.y - i * 76} groen klasse={s.plop} />
              )}
            </g>
          );
        })}

        {/* tien blauwe stippen vliegen samen, of vallen uit elkaar */}
        {bezig &&
          STIPPLEK.map((p, i) => {
            const naarTien = anim.soort === "naarTien";
            const dx = GROEN_PLEK.x - p.x;
            const dy = GROEN_PLEK.y - p.y;
            const opDoel = naarTien ? beweeg : !beweeg;
            return (
              <g
                key={`v${anim.id}-${i}`}
                className={s.beweeg}
                style={{ transform: opDoel ? `translate(${dx}px, ${dy}px)` : undefined, opacity: opDoel ? 0.2 : 1 }}
              >
                <Stip x={p.x} y={p.y} />
              </g>
            );
          })}

        {slotTien && kolommen === 2 && (
          <g transform={`translate(${TIEN.x + TIEN.b - 34} ${TIEN.y + 10})`}>
            <rect x={0} y={10} width={22} height={16} rx={3} fill="#c9cfdb" />
            <path d="M4 11 V7 a7 7 0 0 1 14 0 V11" fill="none" stroke="#c9cfdb" strokeWidth={3} />
          </g>
        )}
        {slotEen && (
          <g transform={`translate(${EEN.x + EEN.b - 34} ${EEN.y + 10})`}>
            <rect x={0} y={10} width={22} height={16} rx={3} fill="#c9cfdb" />
            <path d="M4 11 V7 a7 7 0 0 1 14 0 V11" fill="none" stroke="#c9cfdb" strokeWidth={3} />
          </g>
        )}

        {/* de cijfers 0 tot en met 9 */}
        {cijferrij && (
          <g>
            {Array.from({ length: 10 }, (_, d) => {
              const licht = cijferrij.includes(d);
              return (
                <text key={d} x={490 + (d - 4.5) * 54} y={700} textAnchor="middle" fontSize={34} fontWeight={800} fill={licht ? "#fde01a" : "rgba(214,216,225,0.35)"} className={s.vaag}>
                  {d}
                </text>
              );
            })}
          </g>
        )}

        {/* de stip onder de vinger */}
        {sleep && Math.hypot(sleep.x - sleep.vanX, sleep.y - sleep.vanY) > 10 && (
          <g style={{ pointerEvents: "none" }}>
            <Stip x={sleep.x} y={sleep.y} groen={sleep.groen} />
          </g>
        )}
      </svg>
    </div>
  );
}
