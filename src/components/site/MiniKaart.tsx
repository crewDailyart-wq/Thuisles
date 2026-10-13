"use client";

/**
 * De kleine scholenkaart op de homepagina: heel Nederland, met een stip voor
 * elke basisschool in de kleur van de doorstroomtoets die de school afneemt.
 * Laadt pas als hij in beeld komt, en tekent één keer (plus bij een andere
 * schermbreedte). Klikken gaat naar de grote kaart.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { kleurVan, laadKaart, NL, TOETSGROEPEN, TOETSKLEUR, type Kaartdata } from "@/components/site/kaartdata";

export function tekenNederland(
  ctx: CanvasRenderingContext2D,
  data: Kaartdata,
  breed: number,
  hoog: number,
  opties: { stip?: number } = {},
) {
  const schaal = Math.min(breed / (NL.maxX - NL.minX), hoog / (NL.maxY - NL.minY));
  const dx = (breed - (NL.maxX - NL.minX) * schaal) / 2;
  const dy = (hoog - (NL.maxY - NL.minY) * schaal) / 2;
  const px = (x: number) => dx + (x - NL.minX) * schaal;
  const py = (y: number) => dy + (NL.maxY - y) * schaal;

  ctx.clearRect(0, 0, breed, hoog);
  ctx.lineJoin = "round";
  for (const p of data.provincies) {
    ctx.beginPath();
    for (const ring of p.ringen) {
      for (let i = 0; i < ring.length; i += 2) {
        if (i === 0) ctx.moveTo(px(ring[i]), py(ring[i + 1]));
        else ctx.lineTo(px(ring[i]), py(ring[i + 1]));
      }
      ctx.closePath();
    }
    ctx.fillStyle = "rgba(82, 160, 255, 0.07)";
    ctx.fill("evenodd");
    ctx.strokeStyle = "rgba(140, 214, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const r = opties.stip ?? Math.max(1.1, schaal * 900);
  for (const s of data.scholen) {
    ctx.fillStyle = kleurVan(s.toets);
    ctx.globalAlpha = s.toets && TOETSKLEUR[s.toets] ? 0.9 : 0.55;
    ctx.beginPath();
    ctx.arc(px(s.x), py(s.y), r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function MiniKaart({ aantal }: { aantal: string }) {
  const vak = useRef<HTMLDivElement>(null);
  const doek = useRef<HTMLCanvasElement>(null);
  const [data, zetData] = useState<Kaartdata | null>(null);

  /* Pas laden als de kaart bijna in beeld is. */
  useEffect(() => {
    const el = vak.current;
    if (!el) return;
    const kijker = new IntersectionObserver(
      (items) => {
        if (items.some((i) => i.isIntersecting)) {
          kijker.disconnect();
          laadKaart().then(zetData).catch(() => {});
        }
      },
      { rootMargin: "400px" },
    );
    kijker.observe(el);
    return () => kijker.disconnect();
  }, []);

  useEffect(() => {
    const c = doek.current;
    if (!c || !data) return;
    const teken = () => {
      const { width, height } = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(width * dpr);
      c.height = Math.round(height * dpr);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tekenNederland(ctx, data, width, height);
    };
    teken();
    const r = new ResizeObserver(teken);
    r.observe(c);
    return () => r.disconnect();
  }, [data]);

  return (
    <div ref={vak} className="st-kaartblok-kaart">
      <Link href="/scholen" aria-label={`Open de scholenkaart met ${aantal} basisscholen`}>
        <canvas ref={doek} className="st-minikaart" aria-hidden="true" />
      </Link>
      <div className="st-minikaart-voorbeeld st-glas">
        <b>Doorstroomtoets per school</b>
        <ul className="st-legenda">
          {TOETSGROEPEN.map((g) => (
            <li key={g.sleutel}>
              <i style={{ background: kleurVan(g.codes[0]) }} />
              {g.naam}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
