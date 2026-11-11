"use client";

/**
 * Het speelvlak van de GOUDEN LES GELD (squla-geld-geldmachine-1-gouden, 11 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone geld-vlak (SqulaGeldVlak, squla-geld-vlak.tsx: de officiële munten uit public/geld/los/ en de
 * briefjes, in zachte vakken naast elkaar, in Phaser) met een paar dingen erbovenop. Het oude vlak en de oude les
 * blijven precies zoals ze zijn; dit vlak geeft alles door, maar
 *   - de eigen tikknoppen van het oude vlak staan uit (`kaartenActief` blijft false) en er gaat geen `goed`, `fout` of
 *     `gekozen` naar het oude vlak: daar zou een gloed om de keuze komen (BOUWREGELS 6.5, 7.6, 7.8a). Bij goed alleen
 *     de lichtgolf (`golf`, 7.6). Het rode rondje om wat Bliepo noemt komt van het oude vlak zelf (`licht` + `rondje`);
 *   - `kies`: de kaartjes om aan te tikken. Een tik zet een VINKJE op het kaartje (nog een tik haalt het weg; een ander
 *     kaartje neemt het over); `vinkjes` = kaartjes die al goed gevonden zijn (de zwevende munten). Meldt
 *     `{ soort: "geldKies", id }`;
 *   - `grootTik`: bij het samen voordoen het geld in het midden aantikken. Meldt `{ soort: "grootTik" }`;
 *   - `hulphand`: het HULPHANDJE (15.19): komt vanzelf, is nooit een knop, alleen bij opdrachten.
 * Het hele vlak staat iets kleiner, vanaf de linkerkant (vaste zones, 15.30; keuring Meer-minder): zo blijft het geld
 * links van het vaste tekstvak. Alles in HTML met CSS: geen Phaser-werk elk beeld (HARDE REGEL 7). Maten in punten van
 * het vlak (980 × 720).
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { VLAK_B } from "../holo/basis";
import { SqulaGeldVlak, indeling, type GeldProps, type Rect } from "./squla-geld-vlak";
import { zegKeuze } from "@/lib/stem";
import s from "./squla-geld-gouden.module.css";

export type Punt = { x: number; y: number };
export type Hand = { plek: Punt; sleutel: string };

export type GoudenGeldProps = GeldProps & {
  kies?: { gekozen: string | null; tikbaar: string[]; vinkjes: string[] } | null;
  grootTik?: boolean;
  hulphand?: Hand | null;
};

/** Hoeveel kleiner het hele vlak staat, vanaf de linkerkant (zie boven). */
export const KLEINER = 0.84;

/** Het midden van het paneel, zoals het oude vlak het rekent (laptop 640; staand scherm 490). */
export function middenNu(): number {
  if (typeof window === "undefined") return 640;
  return window.innerHeight > window.innerWidth ? VLAK_B / 2 : 640;
}
/** Waar elk kaartje staat (punten van het vlak). */
export function kaartRects(p: GeldProps): Rect[] {
  return indeling({ ...p, midden: p.paneel ? middenNu() : undefined }).kaarten;
}
/** Waar het geld in het midden staat ("Wat is dit?"). */
export function grootRect(p: GeldProps): Rect | null {
  return indeling({ ...p, midden: p.paneel ? middenNu() : undefined }).groot[0]?.r ?? null;
}

function useMidden() {
  const [midden, setMidden] = useState(640);
  useEffect(() => {
    const meet = () => setMidden(middenNu());
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, []);
  return midden;
}

export function GoudenGeldVlak({ kies = null, grootTik = false, hulphand = null, ...rest }: GoudenGeldProps & Vlakbasis) {
  const { meld } = rest;
  const midden = useMidden();
  const ind = indeling({ ...rest, midden: rest.paneel ? midden : undefined });
  const kaarten = rest.kaarten ?? [];
  const groot = ind.groot[0]?.r ?? null;
  const klok = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(klok.current), []);
  return (
    <div className={s.wortel} style={{ transform: `scale(${KLEINER})`, transformOrigin: "0 50%" }} data-geld-gouden="">
      <SqulaGeldVlak {...rest} kaartenActief={false} goed={[]} fout={[]} gekozen={[]} uit={[]} />
      {kies &&
        kaarten.map((k, i) => {
          const r = ind.kaarten[i];
          if (!r) return null;
          const aan = kies.gekozen === k.id || kies.vinkjes.includes(k.id);
          const mag = kies.tikbaar.includes(k.id);
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
              /* Geen naam met het geld erin: voorlezen zou het antwoord verklappen (het kind telt zelf; oude les). */
              aria-label={k.tekening ? (k.zeg ?? "plaatje") : `geld ${i + 1}`}
              aria-pressed={aan}
              onMouseEnter={() => {
                clearTimeout(klok.current);
                /* Alleen een ding zonder geld (de knoop) wordt voorgelezen, zoals in het oude vlak. */
                if (k.tekening && k.zeg && mag) klok.current = setTimeout(() => zegKeuze(k.zeg!), 300);
              }}
              onMouseLeave={() => clearTimeout(klok.current)}
              onClick={() => mag && meld({ soort: "geldKies", id: k.id })}
            >
              {aan && <Vinkje />}
            </button>
          );
        })}
      {grootTik && groot && (
        <button
          type="button"
          className={s.kaart}
          style={{ left: groot.x - groot.b / 2 - 20, top: groot.y - groot.h / 2 - 20, width: groot.b + 40, height: groot.h + 40 }}
          data-ding="groot"
          data-plek="groot"
          aria-label="het geld"
          onClick={() => meld({ soort: "grootTik" })}
        />
      )}
      {hulphand && (
        <div key={hulphand.sleutel} className={`${s.hand} ${s.tikGebaar}`} style={{ left: hulphand.plek.x, top: hulphand.plek.y }} aria-hidden data-hulphand="">
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
