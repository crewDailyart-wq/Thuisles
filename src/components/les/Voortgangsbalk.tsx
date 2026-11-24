"use client";

/**
 * De voortgangsbalk bovenin elke gouden les (ontwerp Sara, 24 november 2026; BOUWREGELS 15.54).
 * Een lange afgeronde balk zonder vakjes: het gevulde deel lichtblauw en zacht gloeiend, het lege deel donkerder blauw en
 * een beetje doorzichtig, een dunne witte rand, aan het eind van het gevulde deel een wit gloeiend rondje met een paar
 * kleine fonkelingen. Bij elke vraag loopt de balk vloeiend verder met een klein fonkelmoment. De balk gaat nooit terug
 * (dat bewaakt het lesscherm) en raakt niets: hij staat bovenaan het speelvlak, links van de naam- en pauzeknop.
 * Alles in code (geen plaatjes): de beweging is een CSS-overgang, de fonkelingen zijn kleine sterretjes in SVG.
 */
import { useEffect, useRef, useState } from "react";
import s from "./Voortgangsbalk.module.css";

const STER = "M0-10 C1.2-3.2 3.2-1.2 10 0 C3.2 1.2 1.2 3.2 0 10 C-1.2 3.2 -3.2 1.2 -10 0 C-3.2-1.2 -1.2-3.2 0-10Z";

export function Voortgangsbalk({ fractie }: { fractie: number }) {
  const f = Math.max(0, Math.min(1, fractie));
  const vorige = useRef(f);
  const [fonkel, setFonkel] = useState(0);
  useEffect(() => {
    if (f > vorige.current) {
      setFonkel((n) => n + 1);
      const t = setTimeout(() => setFonkel(0), 1100);
      vorige.current = f;
      return () => clearTimeout(t);
    }
    vorige.current = f;
  }, [f]);
  const plek = `calc(${f} * (100% - 22px) + 11px)`;
  return (
    <div className={s.balk} data-voortgangsbalk="" data-voortgang={f.toFixed(3)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(f * 100)} aria-label="Hoever je bent in de les">
      <div className={s.vulling} style={{ width: plek }} />
      <div className={s.rondje} style={{ left: plek }} />
      <div className={s.fonkels} style={{ left: plek }} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg key={i} className={`${s.ster} ${s[`ster${i}`]}`} viewBox="-12 -12 24 24">
            <path d={STER} fill="#ffffff" />
          </svg>
        ))}
        {fonkel > 0 &&
          [0, 1, 2, 3, 4].map((i) => (
            <svg key={`${fonkel}-${i}`} className={`${s.knal} ${s[`knal${i}`]}`} viewBox="-12 -12 24 24">
              <path d={STER} fill="#ffffff" />
            </svg>
          ))}
      </div>
    </div>
  );
}
