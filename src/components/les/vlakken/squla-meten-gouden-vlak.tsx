"use client";

/**
 * Het speelvlak van de GOUDEN LES METEN (squla-meten-oppervlakte-1-gouden, 10 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone meten-vlak (SqulaMetenVlak, squla-meten-vlak.tsx: de muur met schilderijen, de tafels, de muurtjes,
 * de kaartjes papier, het ruitjespapier, de speelmatten en de tafel vol blaadjes, in Phaser) met een paar dingen erbovenop.
 * Het oude vlak en de oude les blijven precies zoals ze zijn; dit vlak geeft alles door, maar
 *   - de eigen tikknoppen van het oude vlak bij de kaartjes staan uit (`kaartenActief` blijft false) en er gaat geen
 *     `goed`, `fout` of `gekozen` naar het oude vlak: daar zou een gloed om de keuze komen (BOUWREGELS 6.5, 7.6, 7.8a; de
 *     oude les houdt zijn gele gloed, besluit Sara 8 nov "Meten laten liggen");
 *   - `kies2`: kies er 2. Een tik zet een VINKJE op het kaartje (nog een tik haalt het weg); de les kijkt na met het
 *     vinkje van het lesscherm. Meldt `{ soort: "kaartKies", id }`. Een kaartje wordt voorgelezen als de muis erop blijft
 *     staan (3.5);
 *   - `punten`: getallen op de tekening (de tegels die Bliepo telt, het spoor van 7.8d), in de kleur van wat ze tellen
 *     (2.2); `tik`: de plekken die het kind kan aantikken om te tellen (draaiboek Meten §0 en §3 G: "goud met een nummer";
 *     bij ons het nummer in de kleur van de blaadjes). Meldt `{ soort: "puntTik", i }`;
 *   - `typ`: een ECHT invulvak onder de tafel (HARDE REGEL 5: inputMode numeric én pattern, schuift mee met het
 *     toetsenbord via useInBeeld). Meldt `{ soort: "typVol", vol }` en bij Enter `{ soort: "typKlaar" }`;
 *   - `label`: na goed het getal naast de tafel ("10 blaadjes", draaiboek §3 C.4), in de kleur van de blaadjes;
 *   - `vakTerug`: een plaatje dat al in een vak ligt, kan het kind met een tik terugleggen (op volgorde). Meldt
 *     `{ soort: "vakTerug", i }`;
 *   - `velTik`: bij het samen voordoen het gedraaide kaartje aantikken. Meldt `{ soort: "velTik" }`;
 *   - `rondje`: het rode rondje om wat Bliepo noemt (7.8; `public/rondje/rondje-rood-2.png`, zelfde maat als holo/rondje.ts);
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 * Het hele vlak staat iets kleiner, vanaf de linkerkant (keuring Meer-minder, 15.30): het oude vlak loopt tot x = 927 van de
 * 980, het vaste tekstvak begint bij ± 880. Alles in HTML met CSS: geen Phaser-werk elk beeld (HARDE REGEL 7). Maten in
 * punten van het vlak (980 × 720).
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { SqulaMetenVlak, indeling, type MetenProps, type Rect } from "./squla-meten-vlak";
import { MUREN, tekeningMaat, tekeningPunten } from "./squla-meten-tekeningen";
import { zegKeuze } from "@/lib/stem";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import s from "./squla-meten-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; naar?: Punt | null; sleutel: string };
/** Een getal op de tekening: plek (punten van het vlak), tekst en kleurnaam (KLEURNAAM in Lesscherm.tsx). */
export type Merk = { x: number; y: number; t: string; kleur: string };

export type GoudenMetenProps = MetenProps & {
  kies2?: { gekozen: string[]; tikbaar: string[] } | null;
  merken?: Merk[];
  tik?: { i: number; x: number; y: number; d: number }[] | null;
  typ?: { sleutel: string; x: number; y: number } | null;
  zetWaarde?: (w: string) => void;
  label?: Merk | null;
  vakTerug?: number[] | null;
  velTik?: Rect | null;
  rondje?: Rect | null;
  hulphand?: Hand | null;
};

/** De getalkleuren van het lesscherm (Lesscherm.tsx KLEURNAAM; hier overgenomen om geen kringverwijzing te maken). */
const KLEURNAAM: Record<string, string> = { rood: "#ff7b7b", oranje: "#ffad5c", geel: "#ffe066", groen: "#7ee0a0", blauw: "#8fc4ff", paars: "#c9a2ff", roze: "#ff9fd2", wit: "#ffffff", bruin: "#d9a066" };

/** Hoeveel kleiner het hele vlak staat, vanaf de linkerkant (zie boven). */
export const KLEINER = 0.86;

/* ---------- waar staat wat (punten van het vlak) ---------- */

/** De grote tekening (muur, tafel, matten, ruitjes, kaartjes papier). */
export function grootVan(p: MetenProps) {
  return indeling(p).groot;
}
/** De punten van de tekening (tegels, hokjes, stukken, blaadjes) in punten van het vlak, met de maat van 1 vakje. */
export function puntenVan(p: MetenProps): { x: number; y: number; d: number }[] {
  const gr = grootVan(p);
  if (!gr || !p.groot) return [];
  const sl = p.groot;
  const cel = sl.startsWith("tafel|") ? 44 : sl.startsWith("matten|") ? 48 : sl.startsWith("ruitjes|") ? 32 : 36;
  return tekeningPunten(sl).map((q) => ({ x: gr.x - gr.b / 2 + q.x * gr.k, y: gr.y - gr.h / 2 + q.y * gr.k, d: cel * gr.k }));
}
/** Een rechthoek om een paar punten (voor het rondje om een rij of een mat). */
export function omPunten(pts: { x: number; y: number; d: number }[]): Rect | null {
  if (!pts.length) return null;
  const d = pts[0].d;
  const l = Math.min(...pts.map((q) => q.x)) - d / 2;
  const r = Math.max(...pts.map((q) => q.x)) + d / 2;
  const t = Math.min(...pts.map((q) => q.y)) - d / 2;
  const o = Math.max(...pts.map((q) => q.y)) + d / 2;
  return { x: (l + r) / 2, y: (t + o) / 2, b: r - l, h: o - t };
}
/** Een schilderij op de muur (tegels van 36 in een tekening met een rand van 8). */
export function schilderijVan(p: MetenProps, wat: string): Rect | null {
  const gr = grootVan(p);
  const v = /muur\|v=(\d)/.exec(p.groot ?? "")?.[1] ?? "1";
  const sch = MUREN[v]?.find((x) => x.wat === wat);
  if (!gr || !sch) return null;
  const x0 = gr.x - gr.b / 2;
  const y0 = gr.y - gr.h / 2;
  return { x: x0 + (8 + (sch.k + sch.b / 2) * 36) * gr.k, y: y0 + (8 + (sch.r + sch.h / 2) * 36) * gr.k, b: sch.b * 36 * gr.k, h: sch.h * 36 * gr.k };
}
/** Het tweede kaartje papier (op zijn kant: 210 × 140 in een tekening van 470 × 260). */
export function velVan(p: MetenProps): Rect | null {
  const gr = grootVan(p);
  if (!gr) return null;
  const m = tekeningMaat(p.groot ?? "vellen");
  const k = gr.b / m.b;
  return { x: gr.x - gr.b / 2 + 345 * k, y: gr.y - gr.h / 2 + 135 * k, b: 210 * k, h: 140 * k };
}
export const kaartenVan = (p: MetenProps) => indeling(p).kaarten;
export const vakkenVan = (p: MetenProps) => indeling(p).vakken;
export const losseVan = (p: MetenProps) => indeling(p).losse;

/* ---------- het vlak ---------- */

export function GoudenMetenVlak({ kies2 = null, merken = [], tik = null, typ = null, zetWaarde, label = null, vakTerug = null, velTik = null, rondje = null, hulphand = null, ...rest }: GoudenMetenProps & Vlakbasis) {
  const { meld } = rest;
  const kaarten = rest.kaarten ?? [];
  const rects = kaarten.length ? kaartenVan(rest) : [];
  const vakken = rest.orden ? vakkenVan(rest) : [];
  const klok = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(klok.current), []);
  return (
    <div className={s.wortel} style={{ transform: `scale(${KLEINER})`, transformOrigin: "0 50%" }} data-meten-gouden="">
      <SqulaMetenVlak {...rest} kaartenActief={false} goed={[]} fout={[]} gekozen={[]} />
      {kies2 &&
        kaarten.map((k, i) => {
          const r = rects[i];
          if (!r) return null;
          const aan = kies2.gekozen.includes(k.id);
          const mag = kies2.tikbaar.includes(k.id);
          return (
            <button
              key={`k-${rest.nr}-${k.id}`}
              type="button"
              className={s.kaart}
              style={{ left: r.x - r.b / 2, top: r.y - r.h / 2, width: r.b, height: r.h }}
              data-ding={k.id}
              /* Een gekozen kaartje heeft geen data-plek: dan tikt de speelcontrole het volgende aan (geleerd bij Getallenlijn). */
              data-plek={mag && !aan ? "kaart" : undefined}
              data-gekozen={aan ? "" : undefined}
              disabled={!mag}
              aria-label={k.zeg || k.label || "kaartje"}
              aria-pressed={aan}
              onMouseEnter={() => {
                clearTimeout(klok.current);
                /* Niet terwijl Bliepo de kaartjes zelf voorleest (dan licht er een op): anders hoor je de zin 2 keer (F8). */
                if (k.zeg && mag && !rest.licht?.length) klok.current = setTimeout(() => zegKeuze(k.zeg!), 300);
              }}
              onMouseLeave={() => clearTimeout(klok.current)}
              onClick={() => mag && meld({ soort: "kaartKies", id: k.id })}
            >
              {aan && <Vinkje />}
            </button>
          );
        })}
      {merken.map((m, i) => (
        <div key={`m-${i}-${m.x}-${m.y}`} className={s.merk} style={{ left: m.x, top: m.y, color: KLEURNAAM[m.kleur] ?? m.kleur }} aria-hidden data-merk={m.t}>
          {m.t}
        </div>
      ))}
      {tik?.map((q) => (
        <button
          key={`t-${rest.nr}-${q.i}`}
          type="button"
          className={s.punt}
          style={{ left: q.x - Math.max(48, q.d) / 2, top: q.y - Math.max(48, q.d) / 2, width: Math.max(48, q.d), height: Math.max(48, q.d) }}
          data-ding={`punt-${q.i}`}
          data-plek="punt"
          aria-label={`tel dit vakje (${q.i + 1})`}
          onClick={() => meld({ soort: "puntTik", i: q.i })}
        />
      ))}
      {/* De plek van elk vak (voor de test en het handje). */}
      {vakken.map((r, i) => (
        <div key={`p-${i}`} className={s.plekje} style={{ left: r.x, top: r.y }} data-vakplek={i} aria-hidden />
      ))}
      {vakTerug?.map((i) =>
        vakken[i] ? (
          <button
            key={`v-${rest.nr}-${i}`}
            type="button"
            className={s.vak}
            style={{ left: vakken[i].x - vakken[i].b / 2, top: vakken[i].y - vakken[i].h / 2, width: vakken[i].b, height: vakken[i].h }}
            data-ding={`vak-${i}`}
            aria-label="haal dit plaatje terug"
            onClick={() => meld({ soort: "vakTerug", i })}
          />
        ) : null,
      )}
      {velTik && (
        <button
          type="button"
          className={s.vak}
          style={{ left: velTik.x - velTik.b / 2, top: velTik.y - velTik.h / 2, width: velTik.b, height: velTik.h }}
          data-ding="kaartje-2"
          data-plek="vel"
          aria-label="draai het papiertje terug"
          onClick={() => meld({ soort: "velTik" })}
        />
      )}
      {typ && <Invulvak key={typ.sleutel} plek={typ} zetWaarde={zetWaarde} meld={meld} />}
      {label && (
        <div className={s.label} style={{ left: label.x, top: label.y, color: KLEURNAAM[label.kleur] ?? label.kleur }} aria-hidden data-label="">
          {label.t}
        </div>
      )}
      {rondje && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`r-${Math.round(rondje.x)}-${Math.round(rondje.y)}`}
          src="/rondje/rondje-rood-2.png"
          alt=""
          className={s.rondje}
          style={{ left: rondje.x - (rondje.b * 1.15 + 44) / 2, top: rondje.y - (rondje.h * 1.4 + 50) / 2, width: rondje.b * 1.15 + 44, height: rondje.h * 1.4 + 50 }}
          aria-hidden
          data-rondje=""
        />
      )}
      {hulphand && (
        <div
          key={hulphand.sleutel}
          className={`${s.hand} ${hulphand.naar ? s.sleepGebaar : s.tikGebaar}`}
          style={{ left: hulphand.plek.x, top: hulphand.plek.y, ...(hulphand.naar ? ({ "--dx": `${hulphand.naar.x - hulphand.plek.x}px`, "--dy": `${hulphand.naar.y - hulphand.plek.y}px` } as CSSProperties) : {}) }}
          aria-hidden
          data-hulphand=""
        >
          <svg viewBox="0 0 90 120" className={s.handTekening}>
            <g>
              <rect x="34" y="6" width="20" height="62" rx="10" />
              <rect x="16" y="52" width="60" height="56" rx="18" />
              <rect x="52" y="50" width="17" height="30" rx="8" />
              <rect x="64" y="58" width="15" height="28" rx="7" />
              <rect x="8" y="66" width="18" height="30" rx="9" />
            </g>
            <path d="M54 66v12M66 70v14" className={s.lijn} />
          </svg>
        </div>
      )}
    </div>
  );
}

function Vinkje() {
  return (
    <span className={s.vinkje} aria-hidden data-vinkje="">
      <svg viewBox="0 0 24 24">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/** Het echte invulvak onder de tafel (HARDE REGEL 5): alleen cijfers, schuift mee met het toetsenbord. */
function Invulvak({ plek, zetWaarde, meld }: { plek: Punt; zetWaarde?: (waarde: string) => void; meld: Vlakbasis["meld"] }) {
  const [waarde, setWaarde] = useState("");
  const { bijAandacht, bijWeggaan } = useInBeeld();
  return (
    <input
      className={s.invul}
      style={{ left: plek.x - 60, top: plek.y - 34 }}
      autoFocus
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      placeholder="?"
      aria-label="Typ hoeveel blaadjes"
      data-invul=""
      value={waarde}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 2);
        zetWaarde?.(v);
        /* Alleen melden als het vak leeg of niet leeg wordt: dan komt of gaat het vinkje (niet bij elke toets). */
        if (!!v !== !!waarde) meld({ soort: "typVol", vol: !!v });
        setWaarde(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (waarde) meld({ soort: "typKlaar" });
        }
      }}
      onFocus={(e) => bijAandacht(e.currentTarget)}
      onBlur={bijWeggaan}
    />
  );
}
