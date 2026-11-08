"use client";

/**
 * De weektrein (30 oktober 2026, les "Dagen van de week", naar een oefening
 * van Squla maar met eigen inhoud en eigen tekeningen). Een locomotief met
 * zeven wagons: elke dag zijn eigen kleur en een klein plaatje. Alles is SVG
 * in code, vlakke vormen in de stijl van bliepo-voorwerpen.ts (geen gloed,
 * geen plaatjes van buiten, geen emoji).
 *
 * Groep 3 leest nog niet: de naam staat klein op de wagon, maar het kind
 * herkent een dag aan de kleur en het plaatje, en Bliepo leest de naam voor
 * als de muis erop blijft staan of als het kind lang drukt (`keuzeStem`).
 *
 * Meldingen:
 *   - `wagon` (dag): het kind tikt op een wagon (als `wagonsActief`);
 *   - `kaart` (dag): het kind tikt op een dagkaart onder de trein;
 *   - `leg` (dag): het kind sleept een dagkaart naar de lege plek in de
 *     trein (of tikt erop: tikken werkt ook, ONTWERPREGELS "Bediening").
 */

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { Vlakbasis } from "../soort";
import { keuzeStem, useKeuzesAlvast } from "../keuzestem";
import { PALET } from "./bliepo-voorwerpen";
import s from "./squla-dagen.module.css";

/* ---------- de dagen ---------- */

export type Dagkleur = "rood" | "oranje" | "geel" | "groen" | "blauw" | "paars" | "roze";

export const DAGEN: { naam: string; kleur: Dagkleur; bijvoeglijk: string; hex: string }[] = [
  { naam: "maandag", kleur: "rood", bijvoeglijk: "rode", hex: "#ef5b4f" },
  { naam: "dinsdag", kleur: "oranje", bijvoeglijk: "oranje", hex: "#f7953b" },
  { naam: "woensdag", kleur: "geel", bijvoeglijk: "gele", hex: "#ffd23f" },
  { naam: "donderdag", kleur: "groen", bijvoeglijk: "groene", hex: "#55c26f" },
  { naam: "vrijdag", kleur: "blauw", bijvoeglijk: "blauwe", hex: "#5aaaf7" },
  { naam: "zaterdag", kleur: "paars", bijvoeglijk: "paarse", hex: "#a986ec" },
  { naam: "zondag", kleur: "roze", bijvoeglijk: "roze", hex: "#f594c6" },
];

/* ---------- maten (punten van het vlak, 980 × 720) ---------- */

const B = 980;
const W = 108; /* een wagon of kaart */
const H = 140;
const TUSSEN = 8;
const LOC = 128;
const BOVEN = 200; /* bovenkant van de trein */
const KAART_Y = 440;
const KAART_TUSSEN = 44;

function treinMaten(n: number) {
  const breed = LOC + n * (W + TUSSEN);
  const x0 = Math.round((B - breed) / 2);
  return { x0, plek: (i: number) => x0 + LOC + TUSSEN + i * (W + TUSSEN) };
}

function kaartX(i: number, n: number) {
  const breed = n * W + (n - 1) * KAART_TUSSEN;
  return Math.round((B - breed) / 2) + i * (W + KAART_TUSSEN);
}

/**
 * De maten van de trein. Liggend precies zoals hierboven. Staand scherm (telefoon rechtop; BOUWREGELS 1.24, 7 november
 * 2026): de trein in 2 rijen (locomotief met de eerste dagen boven, de rest eronder), zodat de wagons bijna 2 keer zo
 * breed worden en de dagnamen zonder inzoomen te lezen zijn; de dagkaarten even groot.
 */
type TreinIndeling = {
  W: number;
  H: number;
  TUSSEN: number;
  LOC: number;
  KAART_Y: number;
  KAART_TUSSEN: number;
  x0: number;
  locTop: number;
  plek: (i: number) => number;
  /** de bovenkant van de knop van wagon i (de rij waarin hij staat) */
  rijTop: (i: number) => number;
  /** de bovenkant van elke rij */
  rijen: number[];
  kaartX: (i: number, n: number) => number;
};

function treinIndeling(n: number, staand: boolean): TreinIndeling {
  if (!staand) {
    const { x0, plek } = treinMaten(n);
    return { W, H, TUSSEN, LOC, KAART_Y, KAART_TUSSEN, x0, locTop: BOVEN, plek, rijTop: () => BOVEN, rijen: [BOVEN], kaartX };
  }
  /* een korte trein (tot 4 wagons) blijft 1 rij, ook zo groot als past */
  const tussen = 12;
  const een = n <= 4;
  const w = een ? Math.min(210, Math.floor((940 - n * tussen) / (LOC / W + n))) : 210;
  const h = Math.round(w * WAGON_VERHOUDING) + 64;
  const loc = Math.round((LOC * w) / W);
  const r0 = een ? n : Math.floor(n / 2);
  const boven0 = een ? 110 : 30;
  const boven1 = een ? boven0 : boven0 + h + 16;
  const x0 = Math.round((B - (loc + r0 * (w + tussen))) / 2);
  const x1 = Math.round((B - ((n - r0) * (w + tussen) - tussen)) / 2);
  const kt = 30;
  return {
    W: w,
    H: h,
    TUSSEN: tussen,
    LOC: loc,
    KAART_Y: boven1 + h + (een ? 110 : 64),
    KAART_TUSSEN: kt,
    x0,
    locTop: boven0,
    plek: (i) => (i < r0 ? x0 + loc + tussen + i * (w + tussen) : x1 + (i - r0) * (w + tussen)),
    rijTop: (i) => (i < r0 ? boven0 : boven1),
    rijen: een ? [boven0] : [boven0, boven1],
    kaartX: (i, k) => Math.round((B - (k * w + (k - 1) * kt)) / 2) + i * (w + kt),
  };
}

/* ---------- tekeningen ---------- */

const N = PALET.navy;

/** Het plaatje van een dag, in een vak van 80 × 58. */
function Plaatje({ dag }: { dag: number }) {
  const lijn = { stroke: N, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (dag) {
    case 0: /* maandag: de schooltas */
      return (
        <g>
          <path d="M32 15 v-5 a8 8 0 0 1 16 0 v5" fill="none" {...lijn} />
          <rect x="23" y="15" width="34" height="36" rx="7" fill={PALET.petrol} {...lijn} />
          <path d="M23 27 h34" fill="none" {...lijn} />
          <rect x="36" y="24" width="8" height="9" rx="2" fill={PALET.geel} {...lijn} strokeWidth={2} />
        </g>
      );
    case 1: /* dinsdag: een potlood */
      return (
        <g transform="rotate(-25 40 29)">
          <rect x="10" y="22" width="9" height="14" fill={PALET.koraal} {...lijn} />
          <rect x="19" y="22" width="36" height="14" fill={PALET.geel} {...lijn} />
          <path d="M55 22 L70 29 L55 36 Z" fill={PALET.koraalLicht} {...lijn} />
          <path d="M66 27 L70 29 L66 31 Z" fill={N} />
        </g>
      );
    case 2: /* woensdag: een halve zon (een halve dag school) */
      return (
        <g>
          <path d="M40 17 V10 M53.5 20.6 L57 14.6 M26.5 20.6 L23 14.6 M63.4 30.5 L69.4 27 M16.6 30.5 L10.6 27" fill="none" {...lijn} />
          <path d="M18 45 a22 22 0 0 1 44 0 Z" fill={PALET.geel} {...lijn} />
          <path d="M8 45 h64" fill="none" {...lijn} />
        </g>
      );
    case 3: /* donderdag: een open boek */
      return (
        <g>
          <path d="M40 16 C32 11 20 11 12 14 V46 C20 43 32 43 40 48 Z" fill={PALET.petrolLicht} {...lijn} />
          <path d="M40 16 C48 11 60 11 68 14 V46 C60 43 48 43 40 48 Z" fill={PALET.petrolLicht} {...lijn} />
          <path d="M18 22 h14 M18 29 h14 M48 22 h14 M48 29 h14" fill="none" {...lijn} strokeWidth={2} />
        </g>
      );
    case 4: /* vrijdag: een kwast met verf */
      return (
        <g>
          <ellipse cx="55" cy="42" rx="15" ry="9" fill={PALET.koraal} {...lijn} />
          <path d="M14 44 L36 22" fill="none" stroke={N} strokeWidth={9} strokeLinecap="round" />
          <path d="M14 44 L36 22" fill="none" stroke="#c98b55" strokeWidth={4} strokeLinecap="round" />
          <path d="M36 22 L42 16" fill="none" stroke={N} strokeWidth={11} strokeLinecap="round" />
          <path d="M36 22 L42 16" fill="none" stroke="#cfd4de" strokeWidth={6} strokeLinecap="round" />
          <path d="M42 16 L49 9" fill="none" stroke={N} strokeWidth={11} strokeLinecap="round" />
          <path d="M42 16 L49 9" fill="none" stroke={PALET.koraal} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    default: /* zaterdag en zondag: thuis (een huisje), met een bal of een zon erbij */
      return (
        <g>
          <rect x="16" y="29" width="30" height="21" fill={PALET.petrolLicht} {...lijn} />
          <path d="M11 31 L31 13 L51 31 Z" fill={PALET.koraal} {...lijn} />
          <rect x="27" y="37" width="8" height="13" fill={N} />
          {dag === 5 ? <circle cx="63" cy="42" r="8" fill={PALET.geel} {...lijn} /> : <circle cx="64" cy="17" r="8" fill={PALET.geel} {...lijn} />}
        </g>
      );
  }
}

/*
 * De wagons en de locomotief zijn plaatjes uit de Train Kit van Kenney (CC0), op
 * verzoek van de eigenaar (30 oktober 2026): zie public/squla/trein/BRON.md.
 * Elke wagon heeft de kleur van zijn dag, met de naam op een bordje op de zijkant.
 * Het oude SVG-plaatje per dag (`Plaatje`) blijft in de code staan.
 */
const WAGON_VERHOUDING = 163 / 324; /* hoogte / breedte van de wagonplaatjes */
const LOC_VERHOUDING = 207 / 324;
/*
 * "Glow in the dark" (keuze eigenaar, 30 oktober 2026): de gloed in de kleur van
 * de dag zit al in het plaatje (public/squla/trein-glow, één keer gebakken, dus
 * vloeiend). Dat plaatje heeft rondom 80 van de 324 punten extra ruimte voor de gloed.
 * De gewone plaatjes zonder gloed staan nog in public/squla/trein.
 */
const GLOED_RAND = 80 / 324;
const GLOED_B = 484 / 324;

/** Eén wagon (ook de dagkaart): de gekleurde wagon van Kenney, met de naam op een bordje. */
export function WagonTekening({ dag, breed = W, hoog = H }: { dag: number; breed?: number; hoog?: number }) {
  const d = DAGEN[dag];
  const beeldH = Math.round(breed * WAGON_VERHOUDING);
  const top = hoog - beeldH - 2;
  const schaal = breed / W;
  return (
    <div aria-hidden="true" style={{ position: "relative", width: breed, height: hoog }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/squla/trein-glow/${d.naam}.png`}
        alt=""
        width={Math.round(breed * GLOED_B)}
        height={Math.round(beeldH + 2 * breed * GLOED_RAND)}
        draggable={false}
        style={{ position: "absolute", left: -breed * GLOED_RAND, top: top - breed * GLOED_RAND, display: "block", maxWidth: "none" }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: top + beeldH * 0.36,
          transform: "translate(-50%, -50%)",
          background: PALET.warmwit,
          border: `${Math.max(2, Math.round(2 * schaal))}px solid ${d.hex}`,
          boxShadow: `0 0 ${14 * schaal}px ${4 * schaal}px ${d.hex}`,
          borderRadius: 7 * schaal,
          padding: `${1 * schaal}px ${5 * schaal}px`,
          /* groter, zodat een kind de dag zonder inzoomen kan lezen (BOUWREGELS 1.24, 7 november 2026; was 13,5) */
          fontSize: (dag === 3 ? 17.5 : 19) * schaal,
          fontWeight: 800,
          lineHeight: 1.2,
          color: N,
          whiteSpace: "nowrap",
        }}
      >
        {d.naam}
      </div>
    </div>
  );
}

function Locomotief({ LOC = 128, H = 140 }: { LOC?: number; H?: number }) {
  const beeldH = Math.round(LOC * LOC_VERHOUDING);
  return (
    <div aria-hidden="true" style={{ position: "relative", width: LOC, height: H }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/squla/trein-glow/locomotief.png"
        alt=""
        width={Math.round(LOC * GLOED_B)}
        height={Math.round(beeldH + 2 * LOC * GLOED_RAND)}
        draggable={false}
        style={{ position: "absolute", left: -LOC * GLOED_RAND, top: H - beeldH - 2 - LOC * GLOED_RAND, display: "block", maxWidth: "none" }}
      />
    </div>
  );
}

/** Het oude SVG-plaatje van een dag (vóór de Kenney-wagons); nu niet in beeld. */
export { Plaatje };

function Pijl() {
  return (
    <svg viewBox="0 0 44 48" width={44} height={48} aria-hidden="true">
      <path d="M14 4 H30 V24 H40 L22 44 L4 24 H14 Z" fill={PALET.geel} stroke={N} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  );
}

function Handje() {
  return (
    <svg viewBox="0 0 48 56" width={48} height={56} aria-hidden="true">
      <path
        d="M16 30 V8 a5 5 0 0 1 10 0 V26 V20 a5 5 0 0 1 10 0 V28 a5 5 0 0 1 9 2 V40 c0 9 -7 14 -15 14 h-4 c-6 0 -10 -3 -13 -8 L4 34 a5 5 0 0 1 8 -5 Z"
        fill={PALET.warmwit}
        stroke={N}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- het vlak ---------- */

export type DagenTreinProps = {
  /** Per plek in de trein een dag (0 = maandag … 6 = zondag), of `null` voor een lege plek. */
  wagons: (number | null)[];
  /** Verandert dit getal, dan rijdt de trein opnieuw van rechts het beeld in. */
  rit?: number;
  /** Dagen met een witte rand (Bliepo wijst ze aan). */
  licht?: number[];
  /** Welke van `licht` al genoemd zijn en bij dezelfde vraag horen: zacht rondje (de rest is fel; Sara 8 november 2026, besluit 4). */
  lichtZacht?: number[];
  /** Dagen die het kind al goed gekozen heeft (witte rand, niet meer te tikken). */
  gekozen?: number[];
  /** Wagons die vaag worden (een fout gekozen wagon). */
  wagonsUit?: number[];
  /** De gele pijl boven deze dag: vandaag. */
  vandaag?: number | null;
  /** Een gele haak onder zaterdag en zondag: het weekend. */
  weekend?: boolean;
  wagonsActief?: boolean;
  /** Dagkaarten onder de trein. */
  kaarten?: number[];
  /** Kaarten die vaag worden (fout gekozen). */
  kaartenUit?: number[];
  kaartenActief?: boolean;
  /** De kaarten zijn te slepen naar de lege plek (melding `leg`). */
  slepen?: boolean;
  /** Een handje doet één keer voor hoe je sleept. */
  handje?: boolean;
};

type Sleep = { dag: number; id: number; x0: number; y0: number; dx: number; dy: number; bewogen: boolean };

export function SqulaDagenTrein({
  wagons,
  rit = 0,
  licht = [],
  lichtZacht = [],
  gekozen = [],
  wagonsUit = [],
  vandaag = null,
  weekend = false,
  wagonsActief = false,
  kaarten = [],
  kaartenUit = [],
  kaartenActief = false,
  slepen = false,
  handje = false,
  meld,
}: DagenTreinProps & Vlakbasis) {
  /* Het rondje-plaatje één keer vooraf laden, zodat het er direct is bij het eerste rondje. */
  useEffect(() => {
    const img = new Image();
    img.src = "/rondje/rondje-rood-2.png";
  }, []);
  const vlakRef = useRef<HTMLDivElement>(null);
  const [sleep, setSleep] = useState<Sleep | null>(null);
  const netGesleept = useRef(false);

  useKeuzesAlvast(DAGEN.map((d) => d.naam));

  /* Staand scherm: de trein in 2 rijen (zie `treinIndeling`); eens bepaald bij het begin. */
  const [staand] = useState(() => typeof window !== "undefined" && window.innerHeight > window.innerWidth);
  const { x0, plek, rijTop, rijen, W, H, TUSSEN, LOC, KAART_Y, kaartX, locTop } = treinIndeling(wagons.length, staand);
  const kk = W / 108;
  const beeldH = Math.round(W * WAGON_VERHOUDING);
  const legeIndex = wagons.indexOf(null);
  const plekVan = (dag: number) => wagons.indexOf(dag);

  /* Van schermpixels naar punten van het vlak. */
  const punt = (cx: number, cy: number) => {
    const r = vlakRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return { x: 0, y: 0 };
    return { x: ((cx - r.left) * B) / r.width, y: ((cy - r.top) * 720) / r.height };
  };
  const opLegePlek = (x: number, y: number) => {
    if (legeIndex < 0) return false;
    const lx = plek(legeIndex);
    const marge = 34;
    const ly = rijTop(legeIndex);
    return x > lx - marge && x < lx + W + marge && y > ly - marge && y < ly + H + marge;
  };

  const sleepAan = slepen && kaartenActief;
  const boven = sleep?.bewogen ? (() => {
    const kx = kaartX(kaarten.indexOf(sleep.dag), kaarten.length) + W / 2 + sleep.dx;
    const ky = KAART_Y + H / 2 + sleep.dy;
    return opLegePlek(kx, ky);
  })() : false;

  /* Wagons die Bliepo aanwijst: naast elkaar = één rondje samen, anders elk apart. */
  const rondjeRuns: [number, number, boolean][] = [];
  {
    /* Fel en zacht apart: een zacht rondje (al genoemd) krijgt nooit hetzelfde rondje als een felle ernaast. */
    const zachtAan = lichtZacht.length < licht.length;
    const groepen: [number[], boolean][] = zachtAan ? [[licht.filter((d) => !lichtZacht.includes(d)), false], [licht.filter((d) => lichtZacht.includes(d)), true]] : [[licht, false]];
    for (const [dagen, zacht] of groepen) {
      const idx = dagen.map(plekVan).filter((i) => i >= 0).sort((p, q) => p - q);
      let start = 0;
      for (let k = 0; k < idx.length; k++) {
        if (k + 1 < idx.length && idx[k + 1] === idx[k] + 1 && rijTop(idx[k + 1]) === rijTop(idx[k])) continue;
        rondjeRuns.push([idx[start], idx[k], zacht]);
        start = k + 1;
      }
    }
  }

  const zat = new Set([5, 6].map(plekVan));
  const weekendHaak = weekend && !zat.has(-1);

  return (
    <div ref={vlakRef} className={s.vlak}>
      {/* De rails over de hele breedte (staand: onder elke rij). */}
      {rijen.map((rt) => (
        <svg key={`rails-${rt}`} className={s.rails} style={{ left: 0, top: rt + H - 6 }} width={B} height={20} viewBox={`0 0 ${B} 20`} aria-hidden="true">
          <rect x="0" y="4" width={B} height="6" rx="3" fill="#8fa3c9" />
          {Array.from({ length: 33 }, (_, i) => (
            <rect key={i} x={i * 30 + 6} y="10" width="14" height="7" rx="2" fill="#5d6f9a" />
          ))}
        </svg>
      ))}

      <div key={rit} className={`${s.trein} ${rit ? s.rijdt : ""}`}>
        <div className={s.loc} style={{ left: x0, top: locTop }}>
          <Locomotief LOC={LOC} H={H} />
        </div>
        {/* Koppelingen tussen de wagons. */}
        {rijen.map((rt) => (
          <svg key={`kop-${rt}`} className={s.rails} style={{ left: 0, top: rt + H - 22 * kk }} width={B} height={12 * kk} viewBox={`0 0 ${B} ${12 * kk}`} aria-hidden="true">
            {wagons.map((_, i) =>
              rijTop(i) !== rt || (i > 0 && rijTop(i - 1) !== rt) ? null : (
                <rect key={i} x={plek(i) - TUSSEN - 6} y={2 * kk} width={TUSSEN + 12} height={8 * kk} rx="3" fill={N} />
              ),
            )}
          </svg>
        ))}
        {wagons.map((dag, i) =>
          dag === null ? (
            <div
              key={`leeg-${i}`}
              className={`${s.leeg} ${boven ? s.leegDoel : ""}`}
              style={{ left: plek(i), top: rijTop(i) + H - 62 * kk, width: W, height: 58 * kk }}
            />
          ) : (
            <WagonKnop
              key={`w-${dag}`}
              dag={dag}
              x={plek(i)}
              top={rijTop(i)}
              w={W}
              h={H}
              licht={licht.includes(dag)}
              gekozen={gekozen.includes(dag)}
              uit={wagonsUit.includes(dag)}
              actief={wagonsActief && !gekozen.includes(dag) && !wagonsUit.includes(dag)}
              onKies={() => meld({ soort: "wagon", dag })}
            />
          ),
        )}
        {rondjeRuns.map(([a, b, zacht]) => {
          const bb = (b - a) * (W + TUSSEN) + W;
          const rb = bb * 1.15 + 44;
          /* De wagon zelf is maar ongeveer 56 punten hoog en staat onderin de knop (H = 140); staand naar verhouding. */
          const wh = 56 * kk;
          const rh = wh * 1.4 + 50;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`r${a}-${b}`}
              src="/rondje/rondje-rood-2.png"
              alt=""
              aria-hidden="true"
              className={s.rondje}
              style={{ maxWidth: "none", opacity: zacht ? 0.45 : undefined, left: plek(a) + bb / 2 - rb / 2, top: rijTop(a) + H - 29 * kk - rh / 2, width: rb, height: rh, transform: `rotate(${((a * 7 + b * 3) % 5) - 2}deg)` }}
            />
          );
        })}
        {vandaag !== null && plekVan(vandaag) >= 0 && (
          <div className={s.pijl} style={{ left: plek(plekVan(vandaag)) + W / 2 - 22, top: rijTop(plekVan(vandaag)) + H - beeldH - 64 }}>
            <Pijl />
          </div>
        )}
        {weekendHaak && (
          <svg
            className={s.haak}
            style={{ left: plek(Math.min(...zat)) - 4, top: rijTop(Math.min(...zat)) + H + 18 }}
            width={2 * W + TUSSEN + 8}
            height={26}
            viewBox={`0 0 ${2 * W + TUSSEN + 8} 26`}
            aria-hidden="true"
          >
            <path d={`M4 4 V20 H${2 * W + TUSSEN + 4} V4`} fill="none" stroke={PALET.geel} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* De dagkaarten onder de trein. */}
      {kaarten.map((dag, i) => {
        const uit = kaartenUit.includes(dag);
        const ks = keuzeStem(DAGEN[dag].naam);
        const bezig = sleep?.dag === dag;
        const kanSlepen = sleepAan && !uit;
        const tikbaar = kaartenActief && !uit;
        return (
          <button
            key={`k-${dag}`}
            type="button"
            aria-label={DAGEN[dag].naam}
            aria-disabled={!tikbaar}
            className={`${s.kaart} ${uit ? s.uit : ""} ${kanSlepen ? s.sleepbaar : ""} ${bezig && sleep?.bewogen ? s.sleept : ""}`}
            style={{
              ...ks.style,
              left: kaartX(i, kaarten.length),
              top: KAART_Y,
              width: W,
              height: H,
              transform: bezig ? `translate(${sleep.dx}px, ${sleep.dy}px)` : undefined,
            }}
            onPointerEnter={ks.onPointerEnter}
            onPointerLeave={ks.onPointerLeave}
            onPointerCancel={(e: RPointerEvent<HTMLButtonElement>) => {
              ks.onPointerCancel();
              if (sleep?.id === e.pointerId) setSleep(null);
            }}
            onContextMenu={ks.onContextMenu}
            onFocus={ks.onFocus}
            onClickCapture={ks.onClickCapture}
            onPointerDown={(e: RPointerEvent<HTMLButtonElement>) => {
              ks.onPointerDown(e);
              if (!kanSlepen) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = punt(e.clientX, e.clientY);
              setSleep({ dag, id: e.pointerId, x0: p.x, y0: p.y, dx: 0, dy: 0, bewogen: false });
            }}
            onPointerMove={(e: RPointerEvent<HTMLButtonElement>) => {
              if (!sleep || sleep.id !== e.pointerId) return;
              const p = punt(e.clientX, e.clientY);
              const dx = p.x - sleep.x0;
              const dy = p.y - sleep.y0;
              const bewogen = sleep.bewogen || Math.hypot(dx, dy) > 10;
              if (bewogen && !sleep.bewogen) ks.onPointerCancel();
              setSleep({ ...sleep, dx, dy, bewogen });
            }}
            onPointerUp={(e: RPointerEvent<HTMLButtonElement>) => {
              ks.onPointerUp();
              if (!sleep || sleep.id !== e.pointerId) return;
              const klaar = sleep;
              setSleep(null);
              if (!klaar.bewogen) return; /* een gewone tik: dat regelt onClick */
              netGesleept.current = true;
              const kx = kaartX(i, kaarten.length) + W / 2 + klaar.dx;
              const ky = KAART_Y + H / 2 + klaar.dy;
              if (opLegePlek(kx, ky) && sleepAan) meld({ soort: "leg", dag });
            }}
            onClick={() => {
              if (netGesleept.current) {
                netGesleept.current = false;
                return;
              }
              if (!tikbaar) return;
              meld({ soort: slepen ? "leg" : "kaart", dag });
            }}
          >
            <WagonTekening dag={dag} breed={W} hoog={H} />
          </button>
        );
      })}

      {handje && legeIndex >= 0 && kaarten.length > 0 && (
        <div
          className={s.handje}
          style={
            {
              left: B / 2 - 10,
              top: KAART_Y + H + 10,
              "--dx": `${plek(legeIndex) + W / 2 - (B / 2 - 10)}px`,
              "--dy": `${(legeIndex >= 0 ? rijTop(legeIndex) : BOVEN) + 60 * kk - (KAART_Y + H + 10)}px`,
            } as CSSProperties
          }
        >
          <Handje />
        </div>
      )}
    </div>
  );
}

function WagonKnop({
  dag,
  x,
  top = BOVEN,
  w = W,
  h = H,
  licht,
  gekozen,
  uit,
  actief,
  onKies,
}: {
  dag: number;
  x: number;
  top?: number;
  w?: number;
  h?: number;
  licht: boolean;
  gekozen: boolean;
  uit: boolean;
  actief: boolean;
  onKies: () => void;
}) {
  const ks = keuzeStem(DAGEN[dag].naam);
  return (
    <button
      type="button"
      aria-label={DAGEN[dag].naam}
      aria-disabled={!actief}
      {...ks}
      className={`${s.wagon} ${actief ? s.aan : ""} ${licht ? s.licht : ""} ${gekozen ? s.gekozen : ""} ${uit ? s.uit : ""}`}
      style={{ ...ks.style, left: x, top, width: w, height: h }}
      onClick={() => {
        if (actief) onKies();
      }}
    >
      <WagonTekening dag={dag} breed={w} hoog={h} />
    </button>
  );
}

/**
 * De tekening op de kaart aan het eind (244 × 190): de locomotief met drie wagons. Eerst stonden hier HTML-blokjes in de
 * SVG; die tekent een browser niet, zodat er alleen een streepje (de rails) te zien was (Sara, 7 november 2026). Nu zijn
 * het SVG-plaatjes: dezelfde wagons met gloed, met de dagnaam op een bordje.
 */
export function KaartWeektrein() {
  const wb = 54; /* breedte van een wagon op de kaart */
  const wh = Math.round(wb * WAGON_VERHOUDING);
  const g = (b: number) => ({ b: b * GLOED_B, rand: b * GLOED_RAND });
  const lb = 62;
  const lh = Math.round(lb * LOC_VERHOUDING);
  const onder = 120;
  return (
    <svg viewBox="0 0 244 190" width={244} height={190} aria-hidden="true">
      <image href="/squla/trein-glow/locomotief.png" x={4 - g(lb).rand} y={onder - lh - g(lb).rand} width={g(lb).b} height={lh + 2 * g(lb).rand} />
      {[0, 2, 6].map((dag, i) => {
        const x = 70 + i * (wb + 4);
        const d = DAGEN[dag];
        return (
          <g key={dag}>
            <image href={`/squla/trein-glow/${d.naam}.png`} x={x - g(wb).rand} y={onder - wh - g(wb).rand} width={g(wb).b} height={wh + 2 * g(wb).rand} />
            <rect x={x + 3} y={onder - wh * 0.78} width={wb - 6} height={12} rx={3} fill={PALET.warmwit} stroke={d.hex} strokeWidth={1.5} />
            <text x={x + wb / 2} y={onder - wh * 0.78 + 9} textAnchor="middle" fontSize={8.5} fontWeight={800} fill={N}>
              {d.naam}
            </text>
          </g>
        );
      })}
      <rect x="2" y={onder + 2} width="240" height="4" rx="2" fill="#8fa3c9" />
    </svg>
  );
}
