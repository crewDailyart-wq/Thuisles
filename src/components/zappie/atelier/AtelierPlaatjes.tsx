'use client';

/**
 * Het atelier als vooraf gemaakte plaatjes (19 oktober 2026, lichte weergave
 * voor telefoon, tablet en trage apparaten; zie lib/lichte-weergave.ts).
 *
 * De plaatjes zijn schermfoto's van het echte 3D-atelier (met podium, gloed en
 * weerspiegeling versie C), per knop (Het geheel, Het podium, De vitrine,
 * De koepel, Lintjes) met de gloed aan en uit, in twee vormen: breed (tablet,
 * computer) en smal (telefoon). Er wordt geen 3D-motor geladen.
 *
 * Bliepo op het podium blijft een los laagje erboven (zoals bij de 3D-versie),
 * zodat wat je in de paskamer kiest op hem past. Waar hij staat, is bij het
 * maken van de plaatjes uit de 3D-scène overgenomen (plaatjes-data.ts).
 *
 * Opnieuw maken: zie scripts/maak-atelier-plaatjes.mjs.
 */

import { useEffect, useRef, useState } from 'react';
import type { StudyView } from './study-scene';
import { LINTJES, PLAATJES, type Vorm } from './plaatjes-data';

const MAP = '/atelier/licht';
const VIEWS: StudyView[] = ['samen', 'podium', 'vitrine', 'koepel', 'lintjes'];
const bron = (vorm: Vorm, view: StudyView, gloed: boolean) => `${MAP}/${vorm}-${view}-${gloed ? 'aan' : 'uit'}.webp`;

const lintjeBron = (vorm: Vorm, j: number, gekozen: boolean, open: boolean, gloed: boolean) =>
  `${MAP}/${vorm}-lintje${j}-${gekozen ? 'gekozen' : 'niet'}-${open ? 'open' : 'dicht'}-${gloed ? 'aan' : 'uit'}.webp`;

/*
  De lintjeskast (19 oktober 2026): per lintje een klein plaatje van zijn stand
  (gekozen of niet, open of op slot), precies over het plaatje van de kast, zodat
  kiezen en ontgrendelen hier net zo zichtbaar zijn als in 3D
  (scripts/maak-atelier-lintjes.mjs).
*/
export function AtelierPlaatjes({ view, glow, onKlaar, badge = 0, unlocked = [] }: { view: StudyView; glow: boolean; onKlaar: () => void; badge?: number; unlocked?: boolean[] }) {
  const [maat, zetMaat] = useState<{ w: number; h: number } | null>(null);
  const plek = useRef<HTMLDivElement>(null);
  const [vorm, zetVorm] = useState<Vorm | null>(null);
  const klaarGemeld = useRef(false);

  /* Welke vorm past bij het vak (smal = telefoon), en waar Bliepo dan staat. */
  useEffect(() => {
    const host = plek.current;
    if (!host) return;
    const zet = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      zetMaat((oud) => (oud && oud.w === w && oud.h === h ? oud : { w, h }));
      const v: Vorm = w / h < 0.8 ? 'smal' : 'breed';
      zetVorm(v);
      /* Het laagje met Bliepo (.as-mascot) hoort bij hetzelfde atelier. */
      const a = host.closest('.as')?.querySelector<HTMLElement>('.as-mascot');
      if (!a) return;
      const d = PLAATJES[v][view], m = d.mascot;
      if (!m) {
        a.style.visibility = 'hidden';
        return;
      }
      /* Het plaatje vult het vak (zoals object-fit: cover); reken de plek van Bliepo mee om. */
      const s = Math.max(w / d.breedte, h / d.hoogte);
      const ox = (w - d.breedte * s) / 2, oy = (h - d.hoogte * s) / 2;
      a.style.left = `${ox + (m.x / 100) * d.breedte * s + (host.parentElement?.offsetLeft ?? 0)}px`;
      a.style.top = `${oy + (m.y / 100) * d.hoogte * s + (host.parentElement?.offsetTop ?? 0)}px`;
      a.style.height = `${(m.h / 100) * d.hoogte * s}px`;
      a.style.visibility = 'visible';
    };
    zet();
    const kijker = new ResizeObserver(zet);
    kijker.observe(host);
    return () => kijker.disconnect();
  }, [view]);

  /* De andere plaatjes alvast ophalen als de browser niets te doen heeft. */
  useEffect(() => {
    if (!vorm) return;
    const ophalen = () => VIEWS.forEach((v) => [true, false].forEach((g) => { new Image().src = bron(vorm, v, g); }));
    const id = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(ophalen, { timeout: 5000 }) : window.setTimeout(ophalen, 2000);
    return () => { if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(id); window.clearTimeout(id); };
  }, [vorm]);

  const geladen = () => {
    if (klaarGemeld.current) return;
    klaarGemeld.current = true;
    onKlaar();
  };

  return (
    <div ref={plek} className="as-plaatjes">
      {vorm && [true, false].map((g) => (
        // eslint-disable-next-line @next/next/no-img-element -- vooraf gemaakte schermfoto's; next/image voegt hier niets toe
        <img
          key={`${vorm}-${view}-${g}`}
          src={bron(vorm, view, g)}
          alt=""
          draggable={false}
          decoding="async"
          className="as-plaatje"
          style={{ opacity: g === glow ? 1 : 0 }}
          onLoad={g === glow ? geladen : undefined}
        />
      ))}
      {vorm && maat && view === 'lintjes' && (() => {
        const d = PLAATJES[vorm].lintjes;
        const sc = Math.max(maat.w / d.breedte, maat.h / d.hoogte);
        const ox = (maat.w - d.breedte * sc) / 2, oy = (maat.h - d.hoogte * sc) / 2;
        return LINTJES[vorm].map(([x, y, b, h], j) => (
          // eslint-disable-next-line @next/next/no-img-element -- vooraf gemaakte stukjes van de schermfoto's
          <img
            key={j}
            src={lintjeBron(vorm, j, badge === j, unlocked[j] ?? true, glow)}
            alt=""
            draggable={false}
            className="as-lintje"
            style={{ left: ox + (x / 100) * d.breedte * sc, top: oy + (y / 100) * d.hoogte * sc, width: (b / 100) * d.breedte * sc, height: (h / 100) * d.hoogte * sc }}
          />
        ));
      })()}
    </div>
  );
}
