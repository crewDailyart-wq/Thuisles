"use client";

/**
 * Stippen in groepen van tien (oktober 2026), naar Synthesis "Add up to 100 ·
 * Bridging to 10s" en "Crossing 10s".
 *
 * Onderaan staan de stippen in kolommen van 2 × 5: volle groepen van tien en
 * één groep die nog niet vol is. Bovenaan een palet met gekleurde
 * stippengroepjes 1 tot en met 9 (vaste getalkleuren). Kiest het kind een
 * groepje, dan vallen die stippen in de lege plekjes van de groep die nog niet
 * vol is; wat niet past, komt ernaast in een nieuwe groep. Zo zie je zonder
 * woorden of het te weinig (er blijft een gaatje), precies goed of te veel is
 * (er gaan stippen over de groep heen).
 *
 * In het midden staat de som, met een doorzichtige, doorgestreepte 0 als
 * plekje dat nog leeg is. Met `kaders` krijgt elke groep een dunne gouden rand
 * ("is een rand vol, dan heb je een groep van tien").
 *
 * `modus: "som"` laat alleen de som groot in het midden zien (het deel zonder
 * stippen).
 *
 * Het vlak meldt `{ soort: "kies", n }` (een groepje uit het palet),
 * `{ soort: "klaar" }` (het blauwe vinkje) en `{ soort: "hulp" }` (het
 * handje: weet ik niet), alleen als `actief` aan staat.
 */

import type { Vlakbasis } from "../soort";
import { TEGELKLEUR, getalkleur, vorm } from "../tegels";
import s from "./optellen100.module.css";

export type SomStuk = { t: "getal"; n: number; kleur?: string } | { t: "teken"; s: string } | { t: "leeg" };

export type KadersProps = {
  modus?: "stippen" | "som";
  /** Volle groepen van tien. */
  tienen: number;
  /** Witte stippen in de groep die nog niet vol is (0 tot 9). */
  los: number;
  /** Gekleurde groepjes die erbij zijn gedaan, in volgorde (bv. [3, 2]). */
  bij?: number[];
  kaders?: boolean;
  /** Een rand in getalkleur om de groep die nog niet vol is ("hoeveel zitten erin?"). */
  omlijnLos?: boolean;
  /** Een pijl naar de groep die nog niet vol is. */
  wijsKader?: boolean;
  /** Een pijl naar de stippen die in een nieuwe groep zijn gekomen. */
  pijlLos?: boolean;
  palet?: boolean;
  paletSlot?: number[];
  actief?: boolean;
  som?: SomStuk[] | null;
  /** Het blauwe vinkje: het kind is tevreden met zijn keuze. */
  vinkje?: boolean;
  /** Het handje: weet ik niet. */
  hulp?: boolean;
};

export type KadersMelding = { soort: "kies"; n: number } | { soort: "klaar" } | { soort: "hulp" };

const GRIJS = "#b9bdc8";
const GOUD = "#c9b27a";
const ROOM = "#f3e6c4";
const R = 19;
const STAP = 42;
const ONDER = 600;

/* ---------- de som ---------- */

function breedte(d: SomStuk, maat: number) {
  if (d.t === "getal") return String(d.n).length * maat * 0.6;
  if (d.t === "teken") return maat * 0.9;
  return maat * 0.6;
}

export function Somregel({ delen, y, maat }: { delen: SomStuk[]; y: number; maat: number }) {
  const tussen = maat * 0.12;
  const totaal = delen.reduce((a, d) => a + breedte(d, maat), 0) + tussen * Math.max(0, delen.length - 1);
  const midden: number[] = [];
  let x = 490 - totaal / 2;
  for (const d of delen) {
    const b = breedte(d, maat);
    midden.push(x + b / 2);
    x += b + tussen;
  }
  return (
    <g>
      {delen.map((d, i) => {
        const m = midden[i];
        if (d.t === "leeg") {
          return (
            <g key={`l${i}`}>
              <text x={m} y={y} textAnchor="middle" fontSize={maat} fontWeight={500} fill="rgba(255,255,255,0.3)">
                0
              </text>
              <line x1={m - maat * 0.2} y1={y + maat * 0.04} x2={m + maat * 0.2} y2={y - maat * 0.74} stroke="rgba(255,255,255,0.3)" strokeWidth={maat * 0.05} />
            </g>
          );
        }
        if (d.t === "teken") {
          return (
            <text key={`t${i}`} x={m} y={y} textAnchor="middle" fontSize={maat} fontWeight={500} fill="#c3c7d0">
              {d.s}
            </text>
          );
        }
        return (
          <text key={`g${i}-${d.n}`} className={s.plop} x={m} y={y} textAnchor="middle" fontSize={maat} fontWeight={500} fill={d.kleur ?? "#ffffff"}>
            {d.n}
          </text>
        );
      })}
    </g>
  );
}

/** Kleine hulp voor de draaiboeken: een getal in zijn tegelkleur (boven de 10 wit). */
export function kleurGetal(n: number): SomStuk {
  return { t: "getal", n, kleur: getalkleur(n) };
}

/* ---------- het palet ---------- */

/** Een groepje in het palet: rijtjes van twee van boven naar beneden, een losse stip links onder. */
function Paletgroep({ n, x, y, kleur }: { n: number; x: number; y: number; kleur: string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + (i % 2 === 0 ? -11.5 : 11.5)} cy={y + Math.floor(i / 2) * 23} r={8} fill={kleur} />
      ))}
    </g>
  );
}

/* ---------- de stippen ---------- */

type Stip = { x: number; y: number; kleur: string; sleutel: string };

/** Plek van hokje p (0 tot 9) in een kolom: rijtjes van twee, van onder naar boven. */
function plek(cx: number, k: number, r: number) {
  return { x: cx + (k === 0 ? -STAP / 2 : STAP / 2), y: ONDER - r * STAP };
}

function leg(tienen: number, los: number, bij: number[]) {
  const totaalBij = bij.reduce((a, b) => a + b, 0);
  const halve = los > 0 || totaalBij > 0;
  const overloop = los + totaalBij > 10;
  const kolommen = tienen + (halve ? 1 : 0) + (overloop ? 1 : 0);
  const afstand = kolommen > 1 ? Math.min(190, 860 / (kolommen - 1)) : 0;
  const kolomX = (i: number) => 490 + (i - (kolommen - 1) / 2) * afstand;

  const stippen: Stip[] = [];
  for (let t = 0; t < tienen; t++) {
    for (let p = 0; p < 10; p++) {
      const q = plek(kolomX(t), p % 2, Math.floor(p / 2));
      stippen.push({ ...q, kleur: GRIJS, sleutel: `t${t}-${p}` });
    }
  }

  /* De groep die nog niet vol is: eerst de witte stippen (zoals een tegel), dan de lege plekjes van onder naar boven. */
  const halfX = kolomX(tienen);
  const wit = vorm(los);
  for (const [i, h] of wit.entries()) stippen.push({ ...plek(halfX, h.k, h.r), kleur: GRIJS, sleutel: `h${i}` });
  const vrij: { k: number; r: number }[] = [];
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 2; k++) if (!wit.some((h) => h.k === k && h.r === r)) vrij.push({ k, r });
  }
  const nieuwX = kolomX(tienen + 1);
  let teller = 0;
  for (const [g, n] of bij.entries()) {
    const kleur = TEGELKLEUR[n] ?? "#ffffff";
    for (let j = 0; j < n; j++, teller++) {
      if (teller < vrij.length) {
        const v = vrij[teller];
        stippen.push({ ...plek(halfX, v.k, v.r), kleur, sleutel: `b${g}-${j}-${n}` });
      } else {
        const o = teller - vrij.length;
        stippen.push({ ...plek(nieuwX, o % 2, Math.floor(o / 2)), kleur, sleutel: `o${g}-${j}-${n}` });
      }
    }
  }
  return { stippen, kolomX, halve, overloop, aantalOver: Math.max(0, los + totaalBij - 10) };
}

function Pijl({ x, y }: { x: number; y: number }) {
  return (
    <g className={s.plop}>
      <line x1={x} y1={y - 70} x2={x} y2={y - 26} stroke={ROOM} strokeWidth={12} strokeLinecap="round" />
      <polygon points={`${x - 20},${y - 30} ${x + 20},${y - 30} ${x},${y}`} fill={ROOM} />
    </g>
  );
}

/* ---------- het vlak ---------- */

export function Stippenkaders({
  modus = "stippen",
  tienen,
  los,
  bij = [],
  kaders = false,
  omlijnLos = false,
  wijsKader = false,
  pijlLos = false,
  palet = false,
  paletSlot = [],
  actief = false,
  som = null,
  vinkje = false,
  hulp = false,
  meld,
}: KadersProps & Vlakbasis) {
  const { stippen, kolomX, halve, overloop, aantalOver } = leg(tienen, los, bij);
  const kolomBoven = ONDER - 4 * STAP - R - 10;
  const rand = (x: number, kleur: string, sleutel: string, dik = 2) => (
    <rect key={sleutel} className={s.plop} x={x - STAP / 2 - R - 10} y={kolomBoven} width={STAP + 2 * R + 20} height={4 * STAP + 2 * R + 20} rx={6} fill="none" stroke={kleur} strokeWidth={dik} />
  );

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {modus === "som" && som && <Somregel delen={som} y={400} maat={120} />}

        {modus === "stippen" && (
          <g>
            {palet &&
              Array.from({ length: 9 }, (_, i) => {
                const n = i + 1;
                const x = 490 + (i - 4) * 70;
                const uit = paletSlot.includes(n);
                const aan = actief && !uit;
                return (
                  <g
                    key={n}
                    className={aan ? s.knop : undefined}
                    style={{ opacity: uit ? 0.25 : actief ? 1 : 0.55 }}
                    role={aan ? "button" : undefined}
                    aria-label={aan ? `${n} ${n === 1 ? "stip" : "stippen"}` : undefined}
                    onPointerDown={(e) => {
                      if (!aan) return;
                      e.preventDefault();
                      meld({ soort: "kies", n });
                    }}
                  >
                    <rect x={x - 32} y={28} width={64} height={132} fill="transparent" />
                    <Paletgroep n={n} x={x} y={46} kleur={TEGELKLEUR[n]} />
                  </g>
                );
              })}

            {som && <Somregel delen={som} y={300} maat={80} />}

            {/* gouden randen om de groepen; de stippen die over de groep heen gingen, krijgen er geen */}
            {kaders && Array.from({ length: tienen }, (_, i) => rand(kolomX(i), GOUD, `k${i}`))}
            {kaders && halve && rand(kolomX(tienen), GOUD, "kh")}
            {omlijnLos && los > 0 && rand(kolomX(tienen), getalkleur(los), "omlijn", 3)}

            {stippen.map((p) => (
              <circle key={p.sleutel} className={s.plop} cx={p.x} cy={p.y} r={R} fill={p.kleur} />
            ))}

            {wijsKader && halve && <Pijl x={kolomX(tienen)} y={kolomBoven - 8} />}
            {pijlLos && overloop && <Pijl x={kolomX(tienen + 1)} y={ONDER - Math.ceil(aantalOver / 2) * STAP - 4} />}
          </g>
        )}

        {/* het handje (weet ik niet) en het blauwe vinkje */}
        {actief && hulp && (
          <g
            className={s.vinkje}
            role="button"
            aria-label="Weet ik niet"
            onPointerDown={(e) => {
              e.preventDefault();
              meld({ soort: "hulp" });
            }}
          >
            <circle cx={820} cy={668} r={26} fill="#2b2f3b" />
            <text x={820} y={679} textAnchor="middle" fontSize={28}>
              ✋
            </text>
          </g>
        )}
        {actief && vinkje && (
          <g
            className={s.vinkje}
            role="button"
            aria-label="Klaar"
            onPointerDown={(e) => {
              e.preventDefault();
              meld({ soort: "klaar" });
            }}
          >
            <circle cx={890} cy={668} r={26} fill="#4b8af5" />
            <path d="M878 669 l8 8 l15 -17" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
