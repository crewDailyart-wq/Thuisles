"use client";

/**
 * De bundelmachine van Tientallen (oktober 2026), naar Synthesis "Grouping
 * 10s · 10s All the Way Up" (INSPIRATIE.md, blok B).
 *
 * Onderaan een machine met knoppen (eerst alleen 1, later ook 10). Elke tik
 * zet een witte stip los op het scherm, zonder rooster, een beetje rommelig.
 * Bij de tiende stip kruipen de tien stippen vanzelf samen tot één groene
 * klodder van 10; bij tien klodders van 10 worden die samen één grote oranje
 * klodder van 100.
 *
 * Het draaiboek zet alleen het `aantal`; het vlak rekent zelf uit hoeveel
 * honderden, tientallen en losse stippen dat zijn, en speelt het samenkruipen
 * af als het aantal net een tiental (of honderdtal) vol maakt.
 *
 * Meldingen: `{ soort: "plus", waarde }`, `{ soort: "wis" }`, `{ soort: "hand" }`
 * en `{ soort: "klaar" }`, alleen als `actief` aan staat.
 */

import { useEffect, useState } from "react";
import type { Vlakbasis } from "../soort";
import { Klodder, Plusknop } from "./optellen100-machine";
import s from "./optellen100.module.css";

export type BundelProps = {
  aantal: number;
  knoppen: (1 | 10 | 100)[];
  actief?: boolean;
  /** De knop Wissen. */
  wissen?: boolean;
  /** Het handje: "laat me een makkelijkere manier zien". */
  hand?: boolean;
  /** Het blauwe vinkje: klaar met bouwen. */
  klaar?: boolean;
  /** Een gouden ring om deze knop. */
  wijs?: 1 | 10 | 100 | null;
};

export type BundelMelding = { soort: "plus"; waarde: 1 | 10 | 100 } | { soort: "wis" } | { soort: "hand" } | { soort: "klaar" };

type Punt = { x: number; y: number };

/** Losse, vaste plekken in een gebied, met een minimale afstand (altijd dezelfde, zodat niets verspringt). */
function plekken(aantal: number, gebied: { x: number; y: number; b: number; h: number }, afstand: number, zaadBegin: number): Punt[] {
  let zaad = zaadBegin;
  const kans = () => {
    zaad = (zaad * 16807) % 2147483647;
    return zaad / 2147483647;
  };
  const uit: Punt[] = [];
  for (let poging = 0; uit.length < aantal && poging < 30000; poging++) {
    const p = { x: gebied.x + kans() * gebied.b, y: gebied.y + kans() * gebied.h };
    const min = poging < 15000 ? afstand : afstand * 0.8;
    if (uit.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= min)) uit.push(p);
  }
  while (uit.length < aantal) uit.push({ x: gebied.x + (uit.length % 4) * afstand, y: gebied.y + Math.floor(uit.length / 4) * afstand });
  return uit;
}

const ENEN = plekken(10, { x: 640, y: 190, b: 170, h: 270 }, 46, 11);
const TIENEN = plekken(10, { x: 330, y: 170, b: 250, h: 300 }, 84, 29);
const HONDERDEN: Punt[] = [
  { x: 190, y: 250 },
  { x: 190, y: 400 },
  { x: 330, y: 470 },
];

type Anim = { soort: "tien" | "honderd"; doel: number; id: number };

export function Bundelmachine({ aantal, knoppen, actief = false, wissen = false, hand = false, klaar = false, wijs = null, meld }: BundelProps & Vlakbasis) {
  /* Het samenkruipen: afgeleid van de vorige stand, tijdens het tekenen. */
  const [vorig, setVorig] = useState(aantal);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [beweegt, setBeweegt] = useState(0);
  const [klaarId, setKlaarId] = useState(0);
  if (aantal !== vorig) {
    setVorig(aantal);
    const id = (anim?.id ?? 0) + 1;
    if (aantal === vorig + 1 && aantal % 10 === 0 && aantal % 100 !== 0) setAnim({ soort: "tien", doel: aantal, id });
    else if ((aantal === vorig + 10 || aantal === vorig + 1) && aantal % 100 === 0 && aantal > 0) setAnim({ soort: "honderd", doel: aantal, id });
    else setAnim(null);
  }

  useEffect(() => {
    if (!anim) return;
    const id = anim.id;
    let f2 = 0;
    const f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => setBeweegt(id));
    });
    const klok = setTimeout(() => setKlaarId(id), 750);
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
      clearTimeout(klok);
    };
  }, [anim]);

  const bezig = anim !== null && klaarId !== anim.id;
  const beweeg = bezig && beweegt === anim.id;

  /* Wat er nu ligt (tijdens het samenkruipen: de stand van vlak ervoor). */
  const n = bezig ? (anim.soort === "tien" ? anim.doel - 10 : anim.doel - 100) : aantal;
  const honderden = Math.floor(n / 100);
  const tienen = bezig && anim.soort === "tien" ? Math.floor((anim.doel % 100) / 10) - 1 : bezig ? 0 : Math.floor((n % 100) / 10);
  const enen = bezig ? 0 : n % 10;
  const doelHonderd = HONDERDEN[Math.min(HONDERDEN.length - 1, Math.floor((bezig ? anim.doel : aantal) / 100) - 1)] ?? HONDERDEN[0];

  const knopB = 96;
  const knopH = 84;
  const rij = knoppen.length * (knopB + 16) - 16;
  const knopX = (i: number) => 490 - rij / 2 + i * (knopB + 16);

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: honderden }, (_, i) => (
          <Klodder key={`h${i}`} x={HONDERDEN[i % HONDERDEN.length].x} y={HONDERDEN[i % HONDERDEN.length].y} soort={100} zaad={i * 2.1 + 1.3} klasse={s.plop} />
        ))}
        {Array.from({ length: tienen }, (_, i) => (
          <Klodder key={`t${i}`} x={TIENEN[i].x} y={TIENEN[i].y} zaad={i * 1.7 + 0.4} klasse={s.plop} />
        ))}
        {Array.from({ length: enen }, (_, i) => (
          <circle key={`e${i}`} className={s.plop} cx={ENEN[i].x} cy={ENEN[i].y} r={8} fill="#ffffff" />
        ))}

        {/* tien losse stippen kruipen samen tot een klodder */}
        {bezig && anim.soort === "tien" &&
          ENEN.map((p, i) => {
            const doel = TIENEN[Math.floor((anim.doel % 100) / 10) - 1] ?? TIENEN[0];
            return (
              <circle
                key={`v${anim.id}-${i}`}
                className={s.beweeg}
                cx={p.x}
                cy={p.y}
                r={8}
                fill="#ffffff"
                style={{ transform: beweeg ? `translate(${doel.x - p.x}px, ${doel.y - p.y}px)` : undefined, opacity: beweeg ? 0.2 : 1 }}
              />
            );
          })}
        {/* tien klodders van 10 kruipen samen tot een klodder van 100 */}
        {bezig && anim.soort === "honderd" &&
          TIENEN.map((p, i) => (
            <g
              key={`w${anim.id}-${i}`}
              className={s.beweeg}
              style={{ transform: beweeg ? `translate(${doelHonderd.x - p.x}px, ${doelHonderd.y - p.y}px)` : undefined, opacity: beweeg ? 0.2 : 1 }}
            >
              <Klodder x={p.x} y={p.y} zaad={i * 1.7 + 0.4} />
            </g>
          ))}

        {/* de machine */}
        <rect x={140} y={588} width={700} height={1.5} fill="rgba(190,200,225,0.25)" />
        {knoppen.map((w, i) => (
          <Plusknop key={w} x={knopX(i)} y={606} b={knopB} h={knopH} waarde={w} aan={actief} wijs={wijs === w} onTik={() => meld({ soort: "plus", waarde: w })} />
        ))}
        {wissen && (
          <g
            className={actief ? s.knop : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Wissen" : undefined}
            onPointerDown={(e) => {
              if (!actief) return;
              e.preventDefault();
              meld({ soort: "wis" });
            }}
          >
            <rect className={s.knopvlak} x={knopX(knoppen.length) + 6} y={622} width={110} height={52} rx={8} fill="#232838" />
            <text x={knopX(knoppen.length) + 61} y={656} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontWeight={700} fontSize={22} fill="#e6e8ee">
              Wissen
            </text>
          </g>
        )}
        {hand && (
          <g
            className={actief ? s.knop : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Hand opsteken" : undefined}
            onPointerDown={(e) => {
              if (!actief) return;
              e.preventDefault();
              meld({ soort: "hand" });
            }}
          >
            <circle className={s.ring} cx={880} cy={460} r={36} fill="none" stroke="#f5c84b" strokeWidth={3} />
            <circle className={s.knopvlak} cx={880} cy={460} r={30} fill="#2b2f3b" />
            <path
              transform="translate(862 441) scale(0.75)"
              d="M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z"
              fill="#d6d8e1"
            />
          </g>
        )}
        {klaar && (
          <g
            className={actief ? s.vinkje : s.uit}
            role={actief ? "button" : undefined}
            aria-label={actief ? "Klaar" : undefined}
            onPointerDown={(e) => {
              if (!actief) return;
              e.preventDefault();
              meld({ soort: "klaar" });
            }}
          >
            <circle cx={880} cy={648} r={28} fill="#4b8af5" />
            <path d="M867 649 l9 9 l16 -18" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
