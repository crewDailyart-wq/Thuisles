"use client";

/**
 * Tiental plus eenheden (oktober 2026), naar Synthesis "Add up to 100 · 10s
 * Plus Ones". Drie beelden in één vlak:
 *
 * - `staven`: grijze staven van tien stippen (2 × 5), bovenaan een palet met
 *   gekleurde stippengroepjes 1 tot en met 9 en in het midden de som. De nul
 *   van het tiental is doorzichtig getekend, als een plekje dat nog leeg is;
 *   kiest het kind een getal, dan komt dat groepje naast de staven en valt
 *   het getal straks op de plek van de nul.
 * - `pijlen`: alleen de som groot, met twee dikke pijlen op het cijfer van de
 *   tientallen vóór en ná: dat blijft hetzelfde.
 * - `kaart`: een tabel met de tientallen (blauwe staven) en de eenheden
 *   (groene blokjes), met het cijfer groot erboven in dezelfde kleur. Tik in
 *   het vak van de eenheden en er komt een blokje bij.
 *
 * Het vlak meldt `{ soort: "kies", n }` (een groepje uit het palet) en
 * `{ soort: "eenheid" }` (een tik in het vak van de eenheden), alleen als
 * `actief` aan staat.
 */

import type { ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import { TEGELKLEUR, getalkleur, vorm } from "../tegels";
import s from "./optellen100.module.css";

export type TientallenProps = {
  modus: "staven" | "pijlen" | "kaart" | "leeg";
  /* staven */
  staven?: number;
  /** Een halve staaf van 5 erbij (25 is geen rond getal). */
  half?: boolean;
  /** Een gekleurd groepje naast de staven. */
  extra?: number | null;
  palet?: boolean;
  paletSlot?: number[];
  /** De som in het midden; `b` of `c` leeg = een vraagteken. */
  som?: { a: number; b: number | null; c: number | null } | null;
  /* pijlen */
  pijlen?: { a: number; b: number; c: number } | null;
  /* kaart */
  tienen?: number;
  enen?: number;
  actief?: boolean;
};

export type TientallenMelding = { soort: "kies"; n: number } | { soort: "eenheid" };

const TIENTAL = "#4b8af5";
const EENHEID = "#3fb34f";
const GRIJS = "#b9bdc8";

/* ---------- staven ---------- */

/** Stippen van een getal als op een tegel: rijtjes van twee, van onder naar boven. */
function Groep({ n, x, onder, kleur, r, afstand }: { n: number; x: number; onder: number; kleur: string; r: number; afstand: number }) {
  return (
    <g className={s.plop}>
      {vorm(n).map((hk, i) => (
        <circle key={i} cx={x + (hk.k === 0 ? -afstand / 2 : afstand / 2)} cy={onder - hk.r * afstand} r={r} fill={kleur} />
      ))}
    </g>
  );
}

/** Een klein groepje in het palet: rijtjes van twee van boven naar beneden, de losse stip links onder. */
function Paletgroep({ n, x, y, kleur }: { n: number; x: number; y: number; kleur: string }) {
  const stippen = Array.from({ length: n }, (_, i) => ({ k: i % 2, r: Math.floor(i / 2) }));
  return (
    <g>
      {stippen.map((p, i) => (
        <circle key={i} cx={x + (p.k === 0 ? -11.5 : 11.5)} cy={y + p.r * 23} r={8} fill={kleur} />
      ))}
    </g>
  );
}

/** Eén cijfer of teken, gecentreerd op x. */
function Teken({ x, y, maat, kleur, children, klasse }: { x: number; y: number; maat: number; kleur: string; children: ReactNode; klasse?: string }) {
  return (
    <text className={klasse} x={x} y={y} textAnchor="middle" fontSize={maat} fontWeight={500} fill={kleur}>
      {children}
    </text>
  );
}

/**
 * Een som als losse tekens op vaste plekken, zodat een pijl precies op een
 * cijfer kan wijzen. Geeft ook terug waar het cijfer van de tientallen van
 * het eerste getal en van de uitkomst staan.
 */
function legSom(midden: number, maat: number, cijfersA: number, cijfersC: number) {
  const cijfer = maat * 0.6;
  const teken = maat * 0.95;
  const delen = [cijfersA * cijfer, teken, cijfer, teken, cijfersC * cijfer];
  const breed = delen.reduce((a, b) => a + b, 0);
  let x = midden - breed / 2;
  const start: number[] = [];
  for (const d of delen) {
    start.push(x);
    x += d;
  }
  return { cijfer, start, delen };
}

function Som({ a, b, c, y, maat, nulVaag, pijlen = false }: { a: number; b: number | null; c: number | null; y: number; maat: number; nulVaag: boolean; pijlen?: boolean }) {
  const aCijfers = String(a).split("");
  const cTekst = c === null ? "?" : String(c);
  const cCijfers = cTekst.split("");
  const { cijfer, start, delen } = legSom(490, maat, aCijfers.length, cCijfers.length);
  const midden = (i: number) => start[i] + delen[i] / 2;
  const cijferX = (i: number, j: number) => start[i] + cijfer * (j + 0.5);
  const pijl = (x: number) => (
    <g key={x}>
      <line x1={x} y1={y - maat * 2.05} x2={x} y2={y - maat * 1.2} stroke="#f3e6c4" strokeWidth={14} strokeLinecap="round" />
      <polygon points={`${x - 24},${y - maat * 1.25} ${x + 24},${y - maat * 1.25} ${x},${y - maat * 0.86}`} fill="#f3e6c4" />
    </g>
  );
  return (
    <g>
      {aCijfers.map((d, j) => {
        const vaag = nulVaag && j === aCijfers.length - 1 && d === "0";
        return (
          <g key={`a${j}`}>
            <Teken x={cijferX(0, j)} y={y} maat={maat} kleur={vaag ? "rgba(255,255,255,0.3)" : "#ffffff"}>
              {d}
            </Teken>
            {vaag && (
              <line
                x1={cijferX(0, j) - cijfer * 0.32}
                y1={y + maat * 0.04}
                x2={cijferX(0, j) + cijfer * 0.32}
                y2={y - maat * 0.74}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={maat * 0.05}
              />
            )}
          </g>
        );
      })}
      <Teken x={midden(1)} y={y} maat={maat} kleur="#c3c7d0">
        +
      </Teken>
      <Teken x={midden(2)} y={y} maat={maat} kleur={b === null ? "#c3c7d0" : getalkleur(b)}>
        {b === null ? "?" : b}
      </Teken>
      <Teken x={midden(3)} y={y} maat={maat} kleur="#c3c7d0">
        =
      </Teken>
      {cCijfers.map((d, j) => (
        <Teken
          key={`c${j}-${d}`}
          klasse={c === null ? undefined : s.plop}
          x={cijferX(4, j)}
          y={y}
          maat={maat}
          kleur={c !== null && b !== null && j === cCijfers.length - 1 && cCijfers.length > 1 ? getalkleur(b) : c === null ? "#c3c7d0" : "#ffffff"}
        >
          {d}
        </Teken>
      ))}
      {pijlen && aCijfers.length > 1 && cCijfers.length > 1 && [pijl(cijferX(0, 0)), pijl(cijferX(4, 0))]}
    </g>
  );
}

/* ---------- de plaatswaardekaart ---------- */

const KAART_T = { x: 190, y: 200, b: 290, h: 340 };
const KAART_E = { x: 500, y: 200, b: 290, h: 340 };

function Kaart({ tienen, enen, actief, onTik }: { tienen: number; enen: number; actief: boolean; onTik: () => void }) {
  const blokjes = Array.from({ length: enen }, (_, i) => ({
    x: KAART_E.x + 70 + (i % 3) * 62 + (Math.floor(i / 3) % 2 ? 31 : 0),
    y: KAART_E.y + KAART_E.h - 70 - Math.floor(i / 3) * 62,
  }));
  return (
    <g>
      {/* de cijfers erboven, in de kleur van hun vak */}
      <text x={KAART_T.x + KAART_T.b / 2} y={KAART_T.y - 26} textAnchor="middle" fontSize={84} fontWeight={800} fill={TIENTAL} key={`t${tienen}`} className={s.plop}>
        {tienen}
      </text>
      <text x={KAART_E.x + KAART_E.b / 2} y={KAART_E.y - 26} textAnchor="middle" fontSize={84} fontWeight={800} fill={EENHEID} key={`e${enen}`} className={s.plop}>
        {enen}
      </text>

      {/* de tabel */}
      <rect x={KAART_T.x} y={KAART_T.y} width={KAART_T.b + KAART_E.b + 10} height={KAART_T.h} fill="rgba(10,16,32,0.4)" stroke="rgba(200,210,230,0.55)" strokeWidth={2} />
      <line x1={KAART_E.x - 5} y1={KAART_T.y} x2={KAART_E.x - 5} y2={KAART_T.y + KAART_T.h} stroke="rgba(200,210,230,0.55)" strokeWidth={2} />

      {/* watermerk in een leeg vak */}
      {tienen === 0 && (
        <text x={KAART_T.x + KAART_T.b / 2} y={KAART_T.y + KAART_T.h / 2 + 30} textAnchor="middle" fontSize={90} fontWeight={800} fill="rgba(75,138,245,0.12)">
          10
        </text>
      )}
      {enen === 0 && (
        <text x={KAART_E.x + KAART_E.b / 2} y={KAART_E.y + KAART_E.h / 2 + 30} textAnchor="middle" fontSize={90} fontWeight={800} fill="rgba(63,179,79,0.12)">
          1
        </text>
      )}

      {/* staven van tien */}
      {Array.from({ length: tienen }, (_, i) => {
        const x = KAART_T.x + KAART_T.b / 2 - (tienen * 44) / 2 + i * 44 + 6;
        const y = KAART_T.y + 50;
        return (
          <g key={`s${i}`} className={s.plop}>
            <rect x={x} y={y} width={30} height={240} rx={4} fill={TIENTAL} />
            {Array.from({ length: 9 }, (_, j) => (
              <line key={j} x1={x} y1={y + (j + 1) * 24} x2={x + 30} y2={y + (j + 1) * 24} stroke="rgba(10,16,32,0.45)" strokeWidth={2} />
            ))}
          </g>
        );
      })}

      {/* blokjes van één */}
      {blokjes.map((p, i) => (
        <rect key={`b${i}`} className={s.plop} x={p.x - 22} y={p.y - 22} width={44} height={44} rx={5} fill={EENHEID} />
      ))}

      {/* tikvlak voor de eenheden */}
      <rect
        x={KAART_E.x}
        y={KAART_E.y}
        width={KAART_E.b}
        height={KAART_E.h}
        fill="transparent"
        className={actief ? s.knop : undefined}
        role={actief ? "button" : undefined}
        aria-label={actief ? "Zet een eenheid in het vak" : undefined}
        onPointerDown={(e) => {
          if (!actief) return;
          e.preventDefault();
          onTik();
        }}
      />
      {actief && <rect className={s.ring} x={KAART_E.x + 3} y={KAART_E.y + 3} width={KAART_E.b - 6} height={KAART_E.h - 6} fill="none" stroke="#f5c84b" strokeWidth={3} />}

      {/* de namen eronder */}
      <text x={KAART_T.x + KAART_T.b / 2} y={KAART_T.y + KAART_T.h + 46} textAnchor="middle" fontSize={26} fontWeight={800} fill={TIENTAL}>
        tientallen
      </text>
      <text x={KAART_E.x + KAART_E.b / 2} y={KAART_E.y + KAART_E.h + 46} textAnchor="middle" fontSize={26} fontWeight={800} fill={EENHEID}>
        eenheden
      </text>
    </g>
  );
}

/* ---------- het vlak ---------- */

export function Tientallenbord({
  modus,
  staven = 0,
  half = false,
  extra = null,
  palet = false,
  paletSlot = [],
  som = null,
  pijlen = null,
  tienen = 0,
  enen = 0,
  actief = false,
  meld,
}: TientallenProps & Vlakbasis) {
  const groepen = staven + (half ? 1 : 0) + (extra ? 1 : 0);
  const afstand = 170;
  const eerste = 490 - ((groepen - 1) * afstand) / 2;

  return (
    <div className={s.wortel}>
      <svg width={980} height={720} viewBox="0 0 980 720" style={{ position: "absolute", inset: 0 }}>
        {modus === "staven" && (
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
                    style={{ opacity: uit ? 0.25 : actief ? 1 : 0.7 }}
                    role={aan ? "button" : undefined}
                    aria-label={aan ? `Getal ${n}` : undefined}
                    onPointerDown={(e) => {
                      if (!aan) return;
                      e.preventDefault();
                      meld({ soort: "kies", n });
                    }}
                  >
                    <rect x={x - 32} y={30} width={64} height={130} fill="transparent" />
                    <Paletgroep n={n} x={x} y={46} kleur={TEGELKLEUR[n]} />
                  </g>
                );
              })}

            {som && <Som a={som.a} b={som.b} c={som.c} y={300} maat={72} nulVaag={som.c === null} />}

            {Array.from({ length: staven }, (_, i) => (
              <Groep key={`s${i}`} n={10} x={eerste + i * afstand} onder={600} kleur={GRIJS} r={19} afstand={46} />
            ))}
            {half && <Groep n={5} x={eerste + staven * afstand} onder={600} kleur={GRIJS} r={19} afstand={46} />}
            {extra !== null && extra > 0 && (
              <Groep key={`x${extra}`} n={extra} x={eerste + (staven + (half ? 1 : 0)) * afstand} onder={600} kleur={TEGELKLEUR[extra] ?? "#ffffff"} r={19} afstand={46} />
            )}
          </g>
        )}

        {modus === "pijlen" && pijlen && <Som a={pijlen.a} b={pijlen.b} c={pijlen.c} y={470} maat={120} nulVaag={false} pijlen />}

        {modus === "kaart" && <Kaart tienen={tienen} enen={enen} actief={actief} onTik={() => meld({ soort: "eenheid" })} />}
      </svg>
    </div>
  );
}
