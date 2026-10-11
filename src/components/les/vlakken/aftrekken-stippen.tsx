"use client";

/**
 * De stippenmachine (Aftrekken tot 10), naar Synthesis "Dot Destruction".
 *
 * Rechts een plusknop met het totaal ernaast; eronder de "zapper" met een
 * bliksem. De plusknop zet er één stip bij, de zapper haalt er één weg. De
 * stippen zweven los door elkaar in het midden, zonder rooster.
 *
 * Het vlak houdt zelf bij hoeveel stippen er zijn: elke tik meldt
 * `{ soort: "plus" | "zap", aantal }` met het nieuwe aantal. Het draaiboek
 * zet een nieuw aantal neer met `aantal` én een nieuwe `zet` (een teller), zodat
 * ook hetzelfde getal opnieuw kan worden neergezet.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import s from "./aftrekken.module.css";

export type Knopstand = "weg" | "dof" | "aan";

export type StippenProps = {
  aantal: number;
  /** Verhoog dit om `aantal` opnieuw neer te zetten. */
  zet: number;
  plus?: Knopstand;
  zapper?: Knopstand;
  /** Het totaal naast de plusknop. */
  teller?: boolean;
  /** Een rode krabbelcirkel om iets heen. */
  cirkel?: "plus" | "zapper" | "teller" | null;
  /** Verder dan dit gaat de plusknop niet (standaard 20). */
  plusTot?: number;
  /** Lager dan dit gaat de zapper niet (standaard 0). */
  zapTot?: number;
};

const MAX = 20;
const PLUS = { x: 900, y: 300 };
const ZAP = { x: 900, y: 392 };

/** Vaste, losse plekken voor 20 stippen; de eerste dicht bij het midden. */
const PLEKKEN: { x: number; y: number }[] = (() => {
  let zaad = 7;
  const kans = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  const midden = { x: 440, y: 400 };
  const uit: { x: number; y: number }[] = [];
  for (let poging = 0; uit.length < MAX && poging < 20000; poging++) {
    const p = { x: 130 + kans() * 620, y: 170 + kans() * 470 };
    const afstand = poging < 6000 ? 96 : 84;
    if (uit.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= afstand)) uit.push(p);
  }
  for (let i = uit.length; i < MAX; i++) uit.push({ x: 160 + (i % 6) * 110, y: 200 + Math.floor(i / 6) * 110 });
  return uit.sort((a, b) => Math.hypot(a.x - midden.x, a.y - midden.y) - Math.hypot(b.x - midden.x, b.y - midden.y));
})();

function Krabbel({ x, y, b, h }: { x: number; y: number; b: number; h: number }) {
  const rx = b / 2;
  const ry = h / 2;
  // twee rondjes die net niet over elkaar vallen, zoals met de hand getekend
  const d =
    `M ${-rx * 0.2} ${-ry * 1.02} ` +
    `C ${rx * 0.7} ${-ry * 1.1}, ${rx * 1.08} ${-ry * 0.45}, ${rx * 1.02} ${ry * 0.1} ` +
    `C ${rx * 0.98} ${ry * 0.75}, ${rx * 0.35} ${ry * 1.08}, ${-rx * 0.15} ${ry * 1.02} ` +
    `C ${-rx * 0.8} ${ry * 0.98}, ${-rx * 1.08} ${ry * 0.35}, ${-rx * 1.0} ${-ry * 0.15} ` +
    `C ${-rx * 0.95} ${-ry * 0.8}, ${-rx * 0.35} ${-ry * 1.12}, ${rx * 0.3} ${-ry * 1.08}`;
  return (
    <svg className={s.krabbel} style={{ left: x, top: y }} width="1" height="1" aria-hidden>
      <path d={d} fill="none" stroke="#e5484d" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function AftrekkenStippen({ aantal, zet, plus = "aan", zapper = "weg", teller = true, cirkel = null, plusTot = MAX, zapTot = 0, meld, metSom }: StippenProps & Vlakbasis) {
  const [n, setN] = useState(aantal);
  const [weg, setWeg] = useState<number[]>([]);
  const [vorigeZet, setVorigeZet] = useState(zet);
  const vorige = useRef(aantal);

  // Een nieuw aantal van het draaiboek: overnemen.
  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setN(aantal);
  }

  // Stippen die verdwijnen, laten we nog even vervagen.
  useEffect(() => {
    const was = vorige.current;
    vorige.current = n;
    if (n >= was) {
      setWeg((w) => w.filter((i) => i >= was));
      return;
    }
    const nieuw = Array.from({ length: was - n }, (_, k) => n + k);
    setWeg((w) => [...w.filter((i) => i < n || i >= was), ...nieuw]);
    const t = setTimeout(() => setWeg((w) => w.filter((i) => !nieuw.includes(i))), 480);
    return () => clearTimeout(t);
  }, [n]);

  const tik = (soort: "plus" | "zap") => {
    const nieuw = soort === "plus" ? Math.min(plusTot, MAX, n + 1) : Math.max(zapTot, 0, n - 1);
    if (nieuw === n) return;
    setN(nieuw);
    meld({ soort, aantal: nieuw });
  };

  const boven = metSom ? 118 : 0;
  const getoond = Array.from({ length: MAX }, (_, i) => i).filter((i) => i < n || weg.includes(i));

  return (
    <div className={s.vlak}>
      {getoond.map((i) => {
        const p = PLEKKEN[i];
        return (
          <div
            key={i}
            className={`${s.stip} ${i >= n ? s.stipweg : ""}`}
            style={{ left: p.x, top: Math.max(boven + 50, p.y) }}
            aria-hidden
          />
        );
      })}
      <span className="sr-only" aria-live="polite">
        {n} stippen
      </span>

      {teller && plus !== "weg" && (
        <div className={s.teller} style={{ left: PLUS.x - 44, top: PLUS.y }} aria-hidden>
          {n}
        </div>
      )}
      {plus !== "weg" && (
        <button
          type="button"
          className={s.machineknop}
          style={{ left: PLUS.x, top: PLUS.y, color: "#6c6ce0" }}
          disabled={plus !== "aan"}
          aria-label="Stip erbij"
          onClick={() => tik("plus")}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
            <path d="M15 4v22M4 15h22" stroke="#9a9cf2" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {zapper !== "weg" && (
        <button
          type="button"
          className={`${s.machineknop} ${s.knopin}`}
          style={{ left: ZAP.x, top: ZAP.y, color: "#b8953a" }}
          disabled={zapper !== "aan"}
          aria-label="Stip weghalen"
          onClick={() => tik("zap")}
        >
          <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden>
            <path d="M17 2 5 18h8l-3 12 13-17h-8z" fill="#d9b44a" stroke="#8a6d22" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {cirkel === "plus" && <Krabbel key="plus" x={PLUS.x} y={PLUS.y} b={92} h={88} />}
      {cirkel === "zapper" && <Krabbel key="zap" x={ZAP.x} y={ZAP.y} b={92} h={88} />}
      {cirkel === "teller" && <Krabbel key="teller" x={PLUS.x - 74} y={PLUS.y} b={78} h={70} />}
    </div>
  );
}
