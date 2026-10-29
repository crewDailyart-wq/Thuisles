"use client";

/**
 * Het verhaalbord van de verhaaltjessommen (oktober 2026), naar Synthesis
 * "Word Problems".
 *
 * Bovenaan staat het verhaal in krijtletters, zin voor zin. Daaronder de
 * plaatjes van wat er gebeurt (één soort per som, hoogstens 5 op een rij) en
 * onderaan de som in grote krijtcijfers.
 *
 * Schrijfwijze van een zin:
 * - een getal ("7") is een getal in het verhaal; het kan omcirkeld en
 *   doorgestreept worden;
 * - een woord tussen blokhaken ("[weg]") hoort bij de woorden die zeggen of
 *   het erbij of eraf is; die worden samen groen;
 * - een woord tussen lage streepjes ("_wat_") is het onbekende getal; dat
 *   krijgt de kleur van het vraagteken in de som.
 *
 * Wat het kind aantikt, meldt het bord met `meld`:
 * `getal` (n, sleutel), `zin` (i), `woord` (signaal), `plaatje` (i),
 * `weetniet` en `klaar`. Het bord tekent alleen; wat er gebeurt, bepaalt het
 * draaiboek.
 */

import { Patrick_Hand } from "next/font/google";
import type { ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import s from "./verhaal-bord.module.css";

const krijt = Patrick_Hand({ subsets: ["latin"], weight: "400" });

/** De krijtletter, ook voor tekst in een SVG (zoals op de kaart). */
export const KRIJT_LETTER = krijt.style.fontFamily;

export type Verhaalsoort = "vogel" | "bloem" | "ballon" | "lampje" | "knikker" | "koekje";
/** "leeg" = een lege plek vanaf het begin (stippelrondje), anders dan iets dat uit is gegaan (28 okt 2026, verhaaltjessommen). */
export type Plekstaat = "aan" | "uit" | "leeg";

export type Somstuk =
  | { t: "getal"; n: number }
  | { t: "teken"; s: string }
  | { t: "vraag"; kleur?: string }
  | { t: "leeg"; smal?: boolean };

/** Mintgroen vraagteken (de verandering) en blauw vraagteken (het begin), zoals Synthesis. */
export const MINT = "#8fdcb5";
export const BLAUW = "#7fa9ee";

export type VerhaalProps = {
  zinnen: string[];
  /** Hoeveel zinnen er al staan. */
  zichtbaar?: number;
  /** Een stippellijn vóór deze zin (tussen wat je weet en de vraag). */
  stippelVoor?: number | null;
  /** Alleen de tekst, groot in het midden (bij het uitpluizen). */
  midden?: boolean;
  /** Sleutels van omcirkelde getallen ("zin-woord"). */
  omcirkeld?: string[];
  doorgestreept?: string[];
  /** De vraagzin, roze. */
  vraagZin?: number | null;
  /** Even roze: een zin die geen vraag stelt. */
  flitsZin?: number | null;
  signaalGroen?: boolean;
  /** Een hele zin groen, als hint. */
  groeneZin?: number | null;
  onbekendKleur?: string | null;
  /** Wat er nu aan te tikken is. */
  tik?: null | "getal" | "zin" | "woord" | "plaatje";
  plaatjes?: null | { soort: Verhaalsoort; plekken: Plekstaat[] };
  /** "weg": een plaatje dat er is weghalen; "erbij": een lege plek vullen. */
  tikPlaatje?: "weg" | "erbij";
  /** Plekken die het kind net heeft aangetikt, op volgorde (krijgen een nummer). */
  geteld?: number[];
  /** Samen tellen: nummers op de plaatjes in deze staat, tot en met `tot`. */
  tel?: null | { op: Plekstaat; tot: number };
  som?: Somstuk[] | null;
  somActief?: number | null;
  weetNiet?: boolean;
  klaarKnop?: boolean;
};

/* ---------- tekst ---------- */

type Stuk = { soort: "woord" | "getal" | "signaal" | "onbekend"; tekst: string; na: string; n?: number };

function knip(zin: string): Stuk[] {
  return zin
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      let m = /^(\d+)([.,?!]?)$/.exec(w);
      if (m) return { soort: "getal", tekst: m[1], na: m[2], n: Number(m[1]) };
      m = /^\[([^\]]+)\]([.,?!]?)$/.exec(w);
      if (m) return { soort: "signaal", tekst: m[1], na: m[2] };
      m = /^_([^_]+)_([.,?!]?)$/.exec(w);
      if (m) return { soort: "onbekend", tekst: m[1], na: m[2] };
      return { soort: "woord", tekst: w, na: "" };
    });
}

/** Alle getallen in het verhaal, met hun sleutel ("zin-woord"). */
export function getallenIn(zinnen: string[]): { sleutel: string; n: number }[] {
  const uit: { sleutel: string; n: number }[] = [];
  zinnen.forEach((z, i) =>
    knip(z).forEach((st, j) => {
      if (st.soort === "getal") uit.push({ sleutel: `${i}-${j}`, n: st.n! });
    }),
  );
  return uit;
}

/** De zin zoals de mascotte hem zegt: zonder tekens, getallen in hun kleur. */
export function voorleeszin(zin: string): string {
  return zin.replace(/[[\]_]/g, "").replace(/\b(\d+)\b/g, "{$1}");
}

/* ---------- de plaatjes ---------- */

const KLEUREN = ["#e8556d", "#f39a4a", "#f5d547", "#8fd16a", "#4cc3d9", "#6f8df0", "#b07be0", "#ef7fb3"];

/** Eén figuurtje in een vak van 60 × 60, als SVG-groep (ook voor op de kaart). */
export function Figuur({ soort, staat = "aan", nr = 0 }: { soort: Verhaalsoort; staat?: Plekstaat; nr?: number }) {
  const c = KLEUREN[nr % KLEUREN.length];
  const aan = staat === "aan";
  switch (soort) {
    case "vogel":
      return (
        <g style={{ opacity: aan ? 1 : 0, transform: aan ? "none" : "translate(14px, -22px)" }}>
          <path d="M17 33 L5 27 L8 38 Z" fill={c} />
          <ellipse cx="29" cy="35" rx="15" ry="11" fill={c} />
          <circle cx="41" cy="25" r="8" fill={c} />
          <path d="M22 33 q8 -10 15 0 q-8 5 -15 0z" fill="rgba(255,255,255,0.35)" />
          <path d="M48 23 l8 2.5 -8 3z" fill="#f2a33a" />
          <circle cx="43" cy="23" r="1.9" fill="#1b2233" />
          <path d="M26 45 v8 M33 45 v8" stroke="#f2a33a" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case "bloem":
      return (
        <g>
          <path
            d="M18 42 h24 l-3 16 h-18 z"
            fill={aan ? "#b8693a" : "none"}
            stroke="#c98552"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity={aan ? 1 : 0.55}
          />
          <g style={{ opacity: aan ? 1 : 0, transform: aan ? "none" : "translateY(14px) scale(0.6)", transformOrigin: "30px 42px" }}>
            <path d="M30 42 V20" stroke="#5fb85a" strokeWidth="3" strokeLinecap="round" />
            <path d="M30 34 q8 -6 12 -1 q-6 5 -12 1z" fill="#5fb85a" />
            {[0, 72, 144, 216, 288].map((h) => (
              <circle key={h} cx={30 + 7 * Math.sin((h * Math.PI) / 180)} cy={16 - 7 * Math.cos((h * Math.PI) / 180)} r="6" fill={c} />
            ))}
            <circle cx="30" cy="16" r="4.2" fill="#fde01a" />
          </g>
        </g>
      );
    case "ballon":
      return aan ? (
        <g>
          <path d="M30 40 q-4 5 0 9 q4 5 0 10" fill="none" stroke="#dcdfe8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M27 41 h6 l-3 -4z" fill={c} />
          <ellipse cx="30" cy="21" rx="14" ry="17" fill={c} />
          <ellipse cx="24" cy="14" rx="3.5" ry="6" fill="rgba(255,255,255,0.4)" transform="rotate(-20 24 14)" />
        </g>
      ) : (
        <g>
          <path d="M22 48 l5 -6 4 3 5 -4 3 6 -4 5 -6 -1 -5 2z" fill={c} opacity="0.9" />
        </g>
      );
    case "lampje":
      return (
        <g>
          {aan &&
            [-60, -30, 0, 30, 60].map((h) => (
              <line
                key={h}
                x1={30 + 17 * Math.sin((h * Math.PI) / 180)}
                y1={22 - 17 * Math.cos((h * Math.PI) / 180)}
                x2={30 + 23 * Math.sin((h * Math.PI) / 180)}
                y2={22 - 23 * Math.cos((h * Math.PI) / 180)}
                stroke="#fde68a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            ))}
          <circle cx="30" cy="24" r="13" fill={aan ? "#fde68a" : "rgba(255,255,255,0.05)"} stroke={aan ? "#f5c542" : "rgba(200,210,230,0.5)"} strokeWidth="2" />
          <path d="M24 30 l2 -8 4 6 4 -6 2 8" fill="none" stroke={aan ? "#c9861a" : "rgba(200,210,230,0.45)"} strokeWidth="1.8" strokeLinejoin="round" />
          <rect x="24" y="37" width="12" height="10" rx="2" fill={aan ? "#9aa3b5" : "rgba(154,163,181,0.35)"} />
          <path d="M24 41 h12 M24 44 h12" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        </g>
      );
    case "koekje":
      /* Een koekje met chocoladestukjes; opgegeten blijven er kruimels over (zoals Synthesis). */
      return aan ? (
        <g>
          <circle cx="30" cy="30" r="17" fill="#d9a35b" stroke="#b97f3a" strokeWidth="2" />
          {[
            [23, 23],
            [35, 21],
            [28, 33],
            [38, 34],
            [21, 36],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="#5a3418" />
          ))}
        </g>
      ) : (
        <g fill="#d9a35b" opacity="0.8">
          <circle cx="22" cy="40" r="2.4" />
          <circle cx="30" cy="43" r="1.8" />
          <circle cx="37" cy="39" r="2.2" />
          <circle cx="27" cy="36" r="1.5" />
          <circle cx="34" cy="45" r="1.4" />
        </g>
      );
    case "knikker":
      return aan ? (
        <g>
          <circle cx="30" cy="30" r="15" fill={c} />
          <path d="M19 33 q8 -12 22 -6" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="23" r="3.2" fill="rgba(255,255,255,0.6)" />
        </g>
      ) : (
        <g>
          <circle cx="30" cy="30" r="15" fill="none" stroke="rgba(200,210,230,0.5)" strokeWidth="2" strokeDasharray="3 4" />
        </g>
      );
  }
}

/* ---------- het bord ---------- */

export function VerhaalBord(p: VerhaalProps & Vlakbasis) {
  const {
    zinnen,
    zichtbaar = zinnen.length,
    stippelVoor = null,
    midden = false,
    omcirkeld = [],
    doorgestreept = [],
    vraagZin = null,
    flitsZin = null,
    signaalGroen = false,
    groeneZin = null,
    onbekendKleur = null,
    tik = null,
    plaatjes = null,
    tikPlaatje = "weg",
    geteld = [],
    tel = null,
    som = null,
    somActief = null,
    weetNiet = false,
    klaarKnop = false,
    meld,
  } = p;

  const regels: ReactNode[] = [];
  zinnen.slice(0, zichtbaar).forEach((zin, i) => {
    if (stippelVoor === i) regels.push(<div key={`stip-${i}`} className={s.stippel} />);
    const kleur =
      flitsZin === i || vraagZin === i ? s.roze : groeneZin === i ? s.groen : "";
    const delen = knip(zin);
    const stukken = delen.map((st, j) => {
      const sleutel = `${i}-${j}`;
      const spatie = j < delen.length - 1 ? " " : "";
      if (st.soort === "getal") {
        const rond = omcirkeld.includes(sleutel);
        const streep = doorgestreept.includes(sleutel);
        const inhoud = (
          <>
            {st.tekst}
            {(rond || streep) && (
              <svg className={s.cirkel} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {rond && (
                  <ellipse cx="50" cy="52" rx="47" ry="44" fill="none" stroke="#e8d27a" strokeWidth="3.5" vectorEffect="non-scaling-stroke" transform="rotate(-4 50 50)" />
                )}
                {streep && <line x1="12" y1="18" x2="88" y2="86" stroke="#e8d27a" strokeWidth="3.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
              </svg>
            )}
          </>
        );
        return (
          <span key={j}>
            {tik === "getal" ? (
              <button type="button" className={`${s.getal} ${s.getalTik}`} onClick={() => meld({ soort: "getal", n: st.n, sleutel })}>
                {inhoud}
              </button>
            ) : (
              <span className={s.getal}>{inhoud}</span>
            )}
            {st.na}
            {spatie}
          </span>
        );
      }
      const woordKleur =
        st.soort === "signaal" && signaalGroen ? { color: "#8fdcb5" } : st.soort === "onbekend" && onbekendKleur ? { color: onbekendKleur } : undefined;
      if (tik === "woord") {
        return (
          <span key={j}>
            <span
              role="button"
              tabIndex={0}
              className={s.woordTik}
              style={woordKleur}
              onClick={() => meld({ soort: "woord", signaal: st.soort === "signaal" })}
              onKeyDown={(e) => {
                if (e.key === "Enter") meld({ soort: "woord", signaal: st.soort === "signaal" });
              }}
            >
              {st.tekst}
            </span>
            {st.na}
            {spatie}
          </span>
        );
      }
      return (
        <span key={j} style={woordKleur}>
          {st.tekst}
          {st.na}
          {spatie}
        </span>
      );
    });
    regels.push(
      tik === "zin" ? (
        <button key={i} type="button" className={`${s.zin} ${s.zinTik} ${kleur}`} onClick={() => meld({ soort: "zin", i })}>
          {stukken}
        </button>
      ) : (
        <div key={i} className={`${s.zin} ${kleur}`}>
          {stukken}
        </div>
      ),
    );
  });

  /* De plaatjes, hoogstens 5 op een rij; na elke 10 wat extra ruimte. */
  const rijen: number[][] = [];
  if (plaatjes) {
    for (let i = 0; i < plaatjes.plekken.length; i += 5) {
      rijen.push(Array.from({ length: Math.min(5, plaatjes.plekken.length - i) }, (_, k) => i + k));
    }
  }
  const telNummer = new Map<number, number>();
  if (tel && plaatjes) {
    let n = 0;
    plaatjes.plekken.forEach((st, i) => {
      if (st === tel.op && n < tel.tot) telNummer.set(i, ++n);
    });
  }

  return (
    <div className={`${s.bord} ${krijt.className}`}>
      <div className={`${s.verhaal} ${midden ? s.midden : ""}`}>{regels}</div>

      {plaatjes && !midden && (
        <div className={s.plaatjes}>
          {rijen.map((rij, r) => (
            <div key={r} className={`${s.rij} ${r > 0 && r % 2 === 0 ? s.tiental : ""} ${plaatjes.soort === "vogel" ? s.draad : ""}`}>
              {rij.map((i) => {
                const st = plaatjes.plekken[i];
                const tikbaar = tik === "plaatje" && ((tikPlaatje === "weg" && st === "aan") || (tikPlaatje === "erbij" && st === "uit"));
                const nr = geteld.includes(i) ? geteld.indexOf(i) + 1 : telNummer.get(i);
                const svg = (
                  <svg viewBox="0 0 60 60" aria-hidden>
                    <Figuur soort={plaatjes.soort} staat={st} nr={i} />
                  </svg>
                );
                return tikbaar ? (
                  <button
                    key={i}
                    type="button"
                    className={`${s.plek} ${s.plekTik}`}
                    aria-label={tikPlaatje === "weg" ? "Weghalen" : "Erbij doen"}
                    onClick={() => meld({ soort: "plaatje", i })}
                  >
                    {svg}
                    {nr !== undefined && <span className={s.nummer}>{nr}</span>}
                  </button>
                ) : (
                  <div key={i} className={s.plek}>
                    {svg}
                    {nr !== undefined && <span className={s.nummer}>{nr}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {som && !midden && (
        <div className={s.som} aria-label="De som">
          {som.map((d, i) => {
            const actief = somActief === i;
            if (d.t === "leeg") return <span key={`l${i}`} className={`${s.leeg} ${d.smal ? s.smal : ""} ${actief ? s.actief : ""}`} />;
            if (d.t === "vraag")
              return (
                <span key={`v${i}`} className={s.somdeel} style={{ color: actief ? "#4b8af5" : (d.kleur ?? "#f3f1ea") }}>
                  ?
                </span>
              );
            return (
              <span key={`${d.t}${i}-${d.t === "getal" ? d.n : d.s}`} className={s.somdeel}>
                {d.t === "getal" ? d.n : d.s}
              </span>
            );
          })}
        </div>
      )}

      {(weetNiet || klaarKnop) && (
        <div className={s.links}>
          {klaarKnop && (
            <button type="button" className={s.rond} aria-label="Klaar" onClick={() => meld({ soort: "klaar" })}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {weetNiet && (
            <button type="button" className={s.knop} onClick={() => meld({ soort: "weetniet" })}>
              Weet ik niet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
