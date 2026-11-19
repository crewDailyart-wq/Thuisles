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
 * KAARTJES RECHTS (besluit Sara, 19 november 2026; BOUWREGELS 15.32): de kaartjes van "kies er 2" staan niet meer in het
 * vlak maar RECHTS, ONDER Bliepo's zin, op een vaste plek onderin zijn tekstvak. Ze worden hier in HTML getekend (de tekening
 * 1 keer op een klein canvas, met het woord eronder); het oude vlak krijgt geen kaartjes meer (`kaarten: []`), zodat de
 * tekening erboven de ruimte krijgt. Alle plekfuncties hieronder (grootVan, puntenVan, schilderijVan …) rekenen daarom
 * ook zonder kaartjes. Bliepo leest een kaartje voor: dan licht het op (schilderij: gloed langs het plaatje zelf, 7.9;
 * anders het rode rondje, 7.8), nooit als het kind het al koos (alleen een vinkje, 7.8a).
 * Het hele vlak staat iets kleiner, vanaf de linkerkant (keuring Meer-minder, 15.30): het oude vlak loopt tot x = 927 van de
 * 980, het vaste tekstvak begint bij ± 880. Alles in HTML met CSS: geen Phaser-werk elk beeld (HARDE REGEL 7). Maten in
 * punten van het vlak (980 × 720).
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { SqulaMetenVlak, indeling, type MetenProps, type Rect } from "./squla-meten-vlak";
import { MUREN, tekenTekening, tekeningMaat, tekeningPunten } from "./squla-meten-tekeningen";
import { zegKeuze } from "@/lib/stem";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import s from "./squla-meten-gouden.module.css";
import { HulphandDom } from "../holo/hulphand-dom";

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

/** Het oude vlak tekent geen kaartjes meer (ze staan rechts onder Bliepo); de indeling dus ook zonder kaartjes. */
const zonderKaarten = (p: MetenProps): MetenProps => ({ ...p, kaarten: [] });

/** De grote tekening (muur, tafel, matten, ruitjes, kaartjes papier). */
export function grootVan(p: MetenProps) {
  return indeling(zonderKaarten(p)).groot;
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
/**
 * Waar de kaartjes staan: RECHTS, ONDER Bliepo's zin, onderin zijn tekstvak (lesvlak 1280 × 720: tekstvak x 880–1272,
 * y 112–468; opdracht-nieuw.css). Omgerekend naar punten van dit vlak (KLEINER, oorsprong 0, 360).
 */
export function kaartenVan(p: MetenProps): Rect[] {
  const n = p.kaarten?.length ?? 0;
  const B = n <= 3 ? 120 : 92;
  const H = 112;
  const tussen = 10;
  return Array.from({ length: n }, (_, i) => {
    const sx = 1076 + (i - (n - 1) / 2) * (B + tussen);
    /* Onderkant 418: net boven het knopje "Nog eens horen" en de verder-pijl onderin het tekstvak (gemeten 19 nov 2026). */
    const sy = 418 - H / 2;
    return { x: sx / KLEINER, y: 360 + (sy - 360) / KLEINER, b: B / KLEINER, h: H / KLEINER };
  });
}
export const vakkenVan = (p: MetenProps) => indeling(zonderKaarten(p)).vakken;
export const losseVan = (p: MetenProps) => indeling(zonderKaarten(p)).losse;

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
      <SqulaMetenVlak {...rest} kaarten={[]} kaartenActief={false} goed={[]} fout={[]} gekozen={[]} />
      {kaarten.map((k, i) => {
          const r = rects[i];
          if (!r) return null;
          const aan = !!kies2?.gekozen.includes(k.id);
          const mag = !!kies2?.tikbaar.includes(k.id);
          /* Bliepo leest dit kaartje voor (en het kind koos het nog niet): oplichten (schilderij) of het rondje. */
          const wijst = !aan && !!rest.licht?.includes(k.id);
          const sch = !!k.tekening?.startsWith("onderwerp|");
          return (
            <button
              key={`k-${rest.nr}-${k.id}`}
              type="button"
              className={`${s.kaart} ${s.kaartRechts} ${wijst && sch ? s.oplicht : ""}`}
              style={{ left: r.x - r.b / 2, top: r.y - r.h / 2, width: r.b, height: r.h }}
              data-keuze-rechts=""
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
              {k.tekening && <KaartTekening sleutel={k.tekening} b={r.b - 16} h={r.h * (k.label ? 0.62 : 0.86)} />}
              {k.label && <span className={s.kaartWoord}>{k.label}</span>}
              {rest.golf?.id === k.id && <span key={`g-${rest.golf.n}`} className={s.kaartGolf} aria-hidden />}
              {aan && <Vinkje />}
              {wijst && !sch && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/rondje/rondje-rood-2.png" alt="" className={s.kaartRondje} aria-hidden data-rondje="" />
              )}
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
        <HulphandDom
          key={hulphand.sleutel}
          left={hulphand.plek.x}
          top={hulphand.plek.y}
          animatie={hulphand.naar ? s.sleepGebaar : s.tikGebaar}
          handKlasse={s.hand}
          schaal={1}
          stijl={{ ...(hulphand.naar ? ({ "--dx": `${hulphand.naar.x - hulphand.plek.x}px`, "--dy": `${hulphand.naar.y - hulphand.plek.y}px` } as CSSProperties) : {}) }}
          reserve={
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
          }
        />
      )}
    </div>
  );
}

/** De tekening van een kaartje, 1 keer op een klein canvas (geen Phaser-werk per beeld, HARDE REGEL 7). */
function KaartTekening({ sleutel, b, h }: { sleutel: string; b: number; h: number }) {
  const doek = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = doek.current;
    const c = el?.getContext("2d");
    if (!el || !c) return;
    const m = tekeningMaat(sleutel);
    const k = Math.min(b / m.b, h / m.h);
    const f = 2;
    el.width = Math.round(b * f);
    el.height = Math.round(h * f);
    c.setTransform(f, 0, 0, f, 0, 0);
    c.clearRect(0, 0, b, h);
    c.translate((b - m.b * k) / 2, (h - m.h * k) / 2);
    c.scale(k, k);
    tekenTekening(c, sleutel);
  }, [sleutel, b, h]);
  return <canvas ref={doek} className={s.kaartTekening} style={{ width: b, height: h }} aria-hidden />;
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
