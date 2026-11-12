"use client";

/**
 * Het speelvlak van de GOUDEN LES MINSOMMEN (squla-min-machine-1-gouden, 10 november 2026; BOUWREGELS hoofdstuk 15).
 *
 * Dit is het gewone minvlak (SqulaMinVlak, squla-minsommen-vlak.tsx: de min-machine en het schoolbord) met een paar
 * dingen erbij. Het minvlak zelf en de oude les blijven precies zoals ze zijn; dit vlak geeft alles gewoon door.
 *   - `kaleSom`: de som op het bord, in het midden of bovenaan, door dit vlak zelf getekend. In een kale som verwijst
 *     geen getal naar een voorwerp, dus WIT (BOUWREGELS 2.1, 14.27); het oude vlak kleurde ze. Bij het samen voordoen
 *     met de stippen krijgen de getallen de kleur van de stippen. Het getal dat eraf gaat kan het rode rondje krijgen
 *     (alleen als Bliepo het noemt, 7.8).
 *   - `machineRondje`: het rode rondje om het getal op de machine ("− 3") terwijl Bliepo de hint zegt.
 *   - `weg` + `teller`: samen voordoen na de 2e fout (draaiboek Minsommen §3 E: het kind haalt zelf weg, de teller
 *     telt mee). Het kind tikt op stippen; een tik meldt `{ soort: "wegTik", index }`. Een weggehaalde stip wordt een
 *     leeg rondje in de kleur van wat eraf gaat (14.22). De TELLER staat alleen in beeld tijdens het samen voordoen
 *     (BOUWREGELS 15.20: nooit het antwoord zolang de vraag nog open is).
 *   - `hand`: het HULPHANDJE (15.19): komt vanzelf (de les zet het na ± 6 s stilte), is nooit een knop en wijst naar
 *     een stip die nog weg moet; nooit naar een antwoord (15.17).
 * Alles in HTML met een CSS-beweging: geen Phaser-werk elk beeld, dus licht (HARDE REGEL 7). Maten in punten van het
 * vlak (980 × 720).
 */

import type { Vlakbasis } from "../soort";
import { SqulaMinVlak, type MinVlakProps } from "./squla-minsommen-vlak";
import s from "./squla-minsommen-gouden.module.css";

export type Punt = { x: number; y: number };
export type KaleSom = {
  plek: "bord" | "midden" | "boven";
  a: number;
  b: number;
  /** Het antwoord achter het is-teken, of null voor het vraagteken. */
  uitkomst: number | null;
  /** Kleuren (hex) van het eerste getal (en de uitkomst) en van het getal dat eraf gaat. */
  kleuren: [string, string];
  /** Het rode rondje om het getal dat eraf gaat (Bliepo noemt het). */
  rondjeB?: boolean;
};
/** Samen voordoen: n stippen, welke al weg zijn, en of het kind er nog op mag tikken. */
export type Weg = { n: number; weg: boolean[]; kleurA: string; kleurB: string; tikbaar: boolean };
export type Teller = { n: number; kleur: string };
export type Hand = { plek: Punt; sleutel: string };
/**
 * De stippenmachine van de uitleg aan het begin (ronde 34, 12 november 2026; draaiboek Minsommen stap 1 t/m 7): `n` stippen
 * in `kleur`, en de plusknop (`plus`: "aan" = tikbaar, "dof" = er mag nu niet op getikt worden). De teller is `teller`.
 */
export type Erbij = { n: number; kleur: string; plus: "aan" | "dof" };
/** Het rode rondje (alleen als Bliepo het noemt): om de teller of om de plusknop. */
export type Ring = "teller" | "plus" | null;

export type GoudenMinProps = MinVlakProps & {
  kaleSom?: KaleSom | null;
  machineRondje?: boolean;
  weg?: Weg | null;
  teller?: Teller | null;
  hand?: Hand | null;
  erbij?: Erbij | null;
  ring?: Ring;
};

/* ---------- waar staat wat ---------- */

/** De stippen bij het samen voordoen: rijtjes van 5, groot (minstens 48 punten om op te tikken, BOUWREGELS 6.6). */
const STIP_CEL = 100;
export function wegPlek(i: number, n: number): Punt {
  const rijen = Math.ceil(n / 5);
  const kol = Math.min(5, n);
  const x0 = 490 - ((kol - 1) * STIP_CEL) / 2;
  const y0 = 405 - ((rijen - 1) * STIP_CEL) / 2;
  return { x: x0 + (i % 5) * STIP_CEL, y: y0 + Math.floor(i / 5) * STIP_CEL };
}
/** De plusknop en de stippen van de uitleg (stippen los door elkaar, niet in een rij; hooguit 5). */
export const PLUS_PLEK: Punt = { x: 490, y: 510 };
export const ERBIJ_PLEK: Punt[] = [
  { x: 400, y: 300 },
  { x: 575, y: 285 },
  { x: 490, y: 385 },
  { x: 365, y: 410 },
  { x: 625, y: 405 },
];
/** Het getal op de machine ("− 3"): zelfde plek als in het minvlak (MACH.machine, het label 7 punten hoger). */
const MACHINE_GETAL: Punt = { x: 490, y: 293 };

/* ---------- het vlak ---------- */

/**
 * Het hele vlak staat iets kleiner, vanaf de linkerkant (vaste zones, BOUWREGELS 15.30; zoals de gouden lessen Meer-minder,
 * Meten en Splitsen; 11 november 2026, KEUZES-VOOR-SARA.md Ronde 30). De keuring van Meer-minder mat dat het vak met het
 * vraagteken ± 25 px onder het vaste tekstvak liep. Altijd dezelfde maat (niet per vraag), zodat er niets verspringt.
 * Het minvlak zelf en de oude les blijven ongewijzigd.
 */
export const KLEINER = 0.9;

export function GoudenMinVlak({ kaleSom = null, machineRondje = false, weg = null, teller = null, hand = null, erbij = null, ring = null, ...rest }: GoudenMinProps & Vlakbasis) {
  return (
    <div className={s.wortel} style={{ transform: `scale(${KLEINER})`, transformOrigin: "0 50%" }} data-minsommen-gouden="">
      <SqulaMinVlak {...rest} som={null} />
      {kaleSom && (
        <div className={`${s.som} ${s[kaleSom.plek]}`} aria-hidden data-kalesom={`${kaleSom.a}-${kaleSom.b}`}>
          <span style={{ color: kaleSom.kleuren[0] }}>{kaleSom.a}</span>
          <span>−</span>
          <span className={kaleSom.rondjeB ? s.rondjeOm : undefined} style={{ color: kaleSom.kleuren[1] }} data-rondje={kaleSom.rondjeB ? "" : undefined}>
            {kaleSom.b}
          </span>
          <span>=</span>
          {kaleSom.uitkomst === null ? <span className={s.vak}>?</span> : <span style={{ color: kaleSom.kleuren[0] }}>{kaleSom.uitkomst}</span>}
        </div>
      )}
      {machineRondje && <div className={s.rondje} style={{ left: MACHINE_GETAL.x, top: MACHINE_GETAL.y }} aria-hidden data-rondje="" />}
      {erbij && (
        <>
          {ERBIJ_PLEK.slice(0, erbij.n).map((p, i) => (
            <div key={i} className={`${s.stip} ${s.nieuw}`} style={{ left: p.x, top: p.y, ["--stip" as string]: erbij.kleur }} aria-hidden data-erbijstip="" />
          ))}
          <button type="button" className={s.plus} style={{ left: PLUS_PLEK.x, top: PLUS_PLEK.y }} disabled={erbij.plus === "dof"} aria-label="doe er een stip bij" data-ding="plus" onClick={() => rest.meld({ soort: "plusTik" })}>
            +
          </button>
        </>
      )}
      {ring && <div className={s.rondje} style={ring === "teller" ? { left: 490, top: 196, width: 150, height: 130 } : { left: PLUS_PLEK.x, top: PLUS_PLEK.y, width: 150, height: 130 }} aria-hidden data-rondje={ring} />}
      {teller && (
        <div className={s.teller} style={{ color: teller.kleur }} aria-hidden data-teller={teller.n}>
          {teller.n}
        </div>
      )}
      {weg &&
        Array.from({ length: weg.n }, (_, i) => {
          const p = wegPlek(i, weg.n);
          const isWeg = weg.weg[i];
          const stijl = { left: p.x, top: p.y, ["--stip" as string]: isWeg ? weg.kleurB : weg.kleurA };
          return weg.tikbaar && !isWeg ? (
            <button key={i} type="button" className={s.stip} style={stijl} aria-label="haal deze stip weg" data-ding={`weg-${i}`} onClick={() => rest.meld({ soort: "wegTik", index: i })} />
          ) : (
            <div key={i} className={`${s.stip} ${isWeg ? s.stipWeg : ""}`} style={stijl} aria-hidden data-stipweg={isWeg ? "" : undefined} />
          );
        })}
      {hand && (
        <div key={hand.sleutel} className={`${s.hand} ${s.pak}`} style={{ left: hand.plek.x, top: hand.plek.y }} aria-hidden data-hulphand="">
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
