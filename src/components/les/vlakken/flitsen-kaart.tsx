"use client";

/**
 * Het flitskaartvenster (oktober 2026), naar Synthesis "Flashcards 1".
 *
 * Een donkerpaars venster met drie standen:
 * - start: een stapeltje kaarten, de titel, de beste tijd en de knoppen Race
 *   en Oefenen;
 * - oefenen: tien kaarten, onderaan tien bolletjes (groen = goed, rood = fout);
 * - race: zo snel mogelijk tien goede antwoorden; elk goed antwoord zet de
 *   schildpad een stap verder. De haas loopt vanzelf naar de finish.
 * Daarna een paneel met de uitslag en de knoppen.
 *
 * Anders dan Synthesis typt het kind het antwoord in een echt invulvak
 * (HARDE REGEL 5), in plaats van uit vier knoppen te kiezen. Bij een fout
 * schudt de kaart en mag het nog een keer; na twee keer (of "Weet ik niet")
 * staat het antwoord even op de kaart en komt de volgende.
 *
 * Meldingen: `keuze` (keuze: race | oefenen | verder | opnieuw | klaar),
 * `oefenKlaar` (goed, van) en `raceKlaar` (gewonnen, tijd in seconden).
 *
 * Aangevuld in de tweede bouwronde (naar de aantekeningen en screenshots):
 * het plus- of minteken in de hoeken van de kaart, een groene rand met groene
 * hoekjes bij een goed antwoord, een Start-knop voor de race (Synthesis:
 * Play) en de trofee op het startscherm van de eindtoets.
 * Schrijft niets weg; de beste tijd houdt het draaiboek bij.
 */

import { useEffect, useId, useRef, useState } from "react";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import type { Vlakbasis } from "../soort";
import s from "./flitsen-kaart.module.css";

export type Flitskaart =
  | { soort: "stippen"; n: number }
  | { soort: "som"; a: number; op: "+" | "−"; b: number }
  | { soort: "gat"; a: number; doel: number };

export type Flitsknop = "race" | "oefenen" | "verder" | "opnieuw" | "klaar";

export type FlitsProps = {
  titel: string;
  /** De kaarten van één ronde (oefenen: de eerste 10; race: steeds opnieuw rond). */
  stapel: Flitskaart[];
  /** De tekening op het startscherm. */
  voorbeeld: Flitskaart;
  fase: "start" | "oefenen" | "race" | "uitslag";
  /** Nieuwe ronde = alles opnieuw. */
  ronde: number;
  /** Knoppen werken pas als de mascotte uitgepraat is. */
  actief: boolean;
  /** Beste tijd in seconden, of `null`. */
  best: number | null;
  /** Hoeveel seconden de haas over de baan doet. */
  haasTijd: number;
  uitslag?: { kop: string; tekst: string; dier?: "schildpad" | "haas" };
  knoppen: Flitsknop[];
  /** Een gele trofee rechtsboven op het startscherm (eindtoets). */
  trofee?: boolean;
};

export const RACE_STAPPEN = 10;

export function antwoordVan(k: Flitskaart): number {
  if (k.soort === "stippen") return k.n;
  if (k.soort === "gat") return k.doel - k.a;
  return k.op === "+" ? k.a + k.b : k.a - k.b;
}

/** Een tijd als "8,6". */
export function tijdTekst(sec: number): string {
  return sec.toFixed(1).replace(".", ",");
}

/* ---------- tekeningen ---------- */

/** Stippatronen zoals een dobbelsteen (1 t/m 6) of een tienveld (7 t/m 10), in een vak van 300 × 170. */
function stipPlekken(n: number): { x: number; y: number; vol: boolean }[] {
  const dob: Record<number, [number, number][]> = {
    1: [[150, 85]],
    2: [[105, 128], [195, 42]],
    3: [[95, 132], [150, 85], [205, 38]],
    4: [[110, 45], [190, 45], [110, 125], [190, 125]],
    5: [[105, 42], [195, 42], [150, 85], [105, 128], [195, 128]],
    6: [[110, 38], [190, 38], [110, 85], [190, 85], [110, 132], [190, 132]],
  };
  if (n <= 6) return (dob[n] ?? []).map(([x, y]) => ({ x, y, vol: true }));
  return Array.from({ length: 10 }, (_, i) => ({ x: 50 + (i % 5) * 50, y: i < 5 ? 55 : 115, vol: i < n }));
}

function Stippen({ n }: { n: number }) {
  const id = useId();
  return (
    <svg width="300" height="170" viewBox="0 0 300 170" aria-label={n === 1 ? "1 stip" : `${n} stippen`}>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#8af0e2" />
          <stop offset="1" stopColor="#2bbfae" />
        </radialGradient>
      </defs>
      {stipPlekken(n).map((p, i) =>
        p.vol ? (
          <circle key={i} cx={p.x} cy={p.y} r="19" fill={`url(#${id})`} />
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r="17" fill="none" stroke="rgba(160,180,220,0.35)" strokeWidth="2" strokeDasharray="3 4" />
        ),
      )}
    </svg>
  );
}

/** Het teken in de hoeken van een kaart: + of −, of niets bij stippen. */
function hoekteken(k: Flitskaart): string {
  if (k.soort === "som") return k.op;
  if (k.soort === "gat") return "+";
  return "";
}

function KaartInhoud({ kaart, ingevuld }: { kaart: Flitskaart; ingevuld: number | null }) {
  if (kaart.soort === "stippen") return <Stippen n={kaart.n} />;
  if (kaart.soort === "som")
    return (
      <span>
        {kaart.a} {kaart.op} {kaart.b}
      </span>
    );
  return (
    <span style={{ fontSize: 60 }}>
      {kaart.a} +<span className={s.gat}>{ingevuld ?? " "}</span>= {kaart.doel}
    </span>
  );
}

/** Een stapeltje kaarten als lijntekening (voor het startscherm en de kaart aan het eind, 244 × 190). */
export function FlitsStapel({ kaart }: { kaart: Flitskaart }) {
  const inhoud =
    kaart.soort === "stippen" ? (
      <g transform="translate(62 62) scale(0.4)">
        {stipPlekken(kaart.n).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="17" fill={p.vol ? "#5fe0d0" : "none"} stroke="#5fe0d0" strokeWidth="5" />
        ))}
      </g>
    ) : (
      <text x="122" y="112" textAnchor="middle" fill="#ffffff" fontSize="40" fontWeight="800" style={{ fontFamily: "var(--font-les), system-ui, sans-serif" }}>
        {kaart.soort === "som" ? `${kaart.a} ${kaart.op} ${kaart.b}` : `${kaart.a} + _ = ${kaart.doel}`}
      </text>
    );
  return (
    <g>
      {[3, 2, 1].map((k) => (
        <rect key={k} x={34 + k * 5} y={46 + k * 7} width="170" height="104" rx="12" fill="#2b3a52" stroke="#7fa9ee" strokeWidth="3" transform={`rotate(${-4 + k} 122 98)`} />
      ))}
      <rect x="34" y="46" width="170" height="104" rx="12" fill="#3b4a62" stroke="#7fa9ee" strokeWidth="3" transform="rotate(-4 122 98)" />
      <g transform="rotate(-4 122 98)">{inhoud}</g>
    </g>
  );
}

function Schildpad({ blij = false }: { blij?: boolean }) {
  return (
    <svg width="92" height="58" viewBox="0 0 92 58" aria-label="Schildpad">
      <path d="M18 46 l-4 9 h9 l2 -7 M52 46 l3 9 h9 l-3 -9" fill="#6cc46a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 46 q2 -36 34 -38 q30 2 32 38 z" fill="#b97a3d" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 44 l8 -16 h16 l8 16 M30 28 l-6 -10 M46 28 l6 -10" fill="none" stroke="#7d4f22" strokeWidth="2" />
      <path d="M6 46 h70" stroke="#e8d3a0" strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="30" r="10" fill="#6cc46a" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="83" cy="27" r="2" fill="#1b2233" />
      {blij && <path d="M77 34 q4 3 8 0" fill="none" stroke="#1b2233" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

function Haas() {
  return (
    <svg width="86" height="70" viewBox="0 0 86 70" aria-label="Haas">
      <ellipse cx="38" cy="50" rx="24" ry="15" fill="#8fb8f0" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="13" cy="46" r="6" fill="#ffffff" />
      <circle cx="64" cy="36" r="12" fill="#8fb8f0" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M60 26 q-6 -22 2 -24 q6 2 4 24 M68 26 q2 -20 10 -20 q4 4 -4 22" fill="#8fb8f0" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="69" cy="34" r="2" fill="#1b2233" />
      <circle cx="76" cy="39" r="2" fill="#f08a9b" />
      <path d="M30 63 h12 M50 63 h10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const Vink = ({ maat = 22 }: { maat?: number }) => (
  <svg width={maat} height={maat} viewBox="0 0 20 20" aria-hidden>
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Kruis = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden>
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

/* ---------- het spel zelf (oefenen of race) ---------- */

const BAAN_X = 70;
const BAAN_B = 690;

function Spel({ race, stapel, haasTijd, meld }: { race: boolean; stapel: Flitskaart[]; haasTijd: number; meld: Vlakbasis["meld"] }) {
  /* Bij de race eerst de Start-knop (aftel 4), dan 3, 2, 1. */
  const [aftel, setAftel] = useState(race ? 4 : 0);
  const [nu, setNu] = useState(0);
  const [i, setI] = useState(0);
  const [uitslagen, setUitslagen] = useState<("goed" | "fout" | null)[]>(() => Array(10).fill(null));
  const [stappen, setStappen] = useState(0);
  const [waarde, setWaarde] = useState("");
  const [toon, setToon] = useState(false);
  const [opgelost, setOpgelost] = useState(false);
  const [weg, setWeg] = useState(false);
  const [schud, setSchud] = useState(0);
  const [klaar, setKlaar] = useState(false);

  const invoer = useRef<HTMLInputElement>(null);
  const begin = useRef<number | null>(null);
  const bezig = useRef(false);
  const fouten = useRef(0);
  const stappenRef = useRef(0);
  const goedRef = useRef(0);
  const afgelopen = useRef(false);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  const kaart = stapel[i % stapel.length];
  const speelt = !race || aftel === 0;

  /* Aftellen voor de race: 3, 2, 1. */
  useEffect(() => {
    if (!race || aftel === 0 || aftel === 4) return;
    const t = setTimeout(() => {
      if (aftel === 1) begin.current = performance.now();
      setAftel(aftel - 1);
    }, 850);
    return () => clearTimeout(t);
  }, [race, aftel]);

  /* De klok, en de haas die vanzelf loopt. */
  useEffect(() => {
    if (!race || aftel > 0 || klaar) return;
    const t = setInterval(() => {
      if (begin.current === null || afgelopen.current) return;
      const sec = (performance.now() - begin.current) / 1000;
      setNu(sec);
      if (sec >= haasTijd) {
        afgelopen.current = true;
        setKlaar(true);
        meld({ soort: "raceKlaar", gewonnen: false, tijd: haasTijd });
      }
    }, 100);
    return () => clearInterval(t);
  }, [race, aftel, klaar, haasTijd, meld]);

  /* Het invulvak houdt de aandacht, kaart na kaart. */
  useEffect(() => {
    if (speelt && !klaar) invoer.current?.focus();
  }, [speelt, klaar, i]);

  function markeer(st: "goed" | "fout") {
    if (race) return;
    setUitslagen((u) => u.map((x, j) => (j === i ? (x === "fout" ? "fout" : st) : x)));
  }

  function volgende(goed: boolean) {
    bezig.current = true;
    if (goed && race) {
      stappenRef.current += 1;
      setStappen(stappenRef.current);
    }
    setWeg(true);
    setTimeout(() => {
      if (afgelopen.current) return;
      const klaarNu = race ? stappenRef.current >= RACE_STAPPEN : i + 1 >= 10;
      if (klaarNu) {
        afgelopen.current = true;
        setKlaar(true);
        if (race) {
          const tijd = begin.current === null ? 0 : (performance.now() - begin.current) / 1000;
          setNu(tijd);
          meld({ soort: "raceKlaar", gewonnen: tijd < haasTijd, tijd });
        } else {
          meld({ soort: "oefenKlaar", goed: goedRef.current, van: 10 });
        }
        return;
      }
      fouten.current = 0;
      setWeg(false);
      setToon(false);
      setOpgelost(false);
      setWaarde("");
      setI((x) => x + 1);
      bezig.current = false;
    }, 320);
  }

  function controleer(x: number | null) {
    if (bezig.current || !speelt || klaar) return;
    if (x === antwoordVan(kaart)) {
      if (fouten.current === 0) goedRef.current += 1;
      markeer("goed");
      setOpgelost(true);
      volgende(true);
      return;
    }
    markeer("fout");
    fouten.current += 1;
    setWaarde("");
    if (x === null || fouten.current >= 2) {
      bezig.current = true;
      setToon(true);
      setTimeout(() => volgende(false), 1600);
    } else {
      setSchud((n) => n + 1);
      invoer.current?.focus();
    }
  }

  const haasX = BAAN_X + Math.min(1, nu / haasTijd) * (BAAN_B - BAAN_X);
  const padX = BAAN_X + (stappen / RACE_STAPPEN) * (BAAN_B - BAAN_X);

  return (
    <>
      {race && <div className={s.klok}>{tijdTekst(nu)} s</div>}

      <div className={s.stapel}>
        {[3, 2, 1].map((k) => (
          <div key={k} className={s.achterkaart} style={{ transform: `translate(${k * 5}px, ${-k * 5}px) rotate(${k * 0.6}deg)`, opacity: 0.55 }} />
        ))}
        {speelt && (
          <div
            key={`${i}-${schud}`}
            className={`${s.kaart} ${opgelost ? s.kaartGoed : ""} ${weg ? s.weg : ""} ${schud > 0 && !weg ? s.schud : ""}`}
          >
            <span className={`${s.hoek} ${s.hoekLinks}`} />
            <span className={`${s.hoek} ${s.hoekRechts}`} />
            {hoekteken(kaart) && (
              <>
                <span className={`${s.hoekteken} ${s.tekenLinks}`} aria-hidden>
                  {hoekteken(kaart)}
                </span>
                <span className={`${s.hoekteken} ${s.tekenRechts}`} aria-hidden>
                  {hoekteken(kaart)}
                </span>
              </>
            )}
            <KaartInhoud kaart={kaart} ingevuld={opgelost || toon ? antwoordVan(kaart) : null} />
            {toon && kaart.soort !== "gat" && <div className={s.antwoord}>Het is {antwoordVan(kaart)}.</div>}
          </div>
        )}
      </div>

      {race && aftel === 4 && (
        <div className={s.startrace}>
          <button type="button" className={`${s.knop} ${s.groen}`} autoFocus onClick={() => setAftel(3)}>
            Start
          </button>
        </div>
      )}

      {race && aftel > 0 && aftel < 4 && (
        <div key={aftel} className={s.aftellen}>
          {aftel}
        </div>
      )}

      {speelt && !klaar && (
        <form
          className={s.invoer}
          onSubmit={(e) => {
            e.preventDefault();
            if (waarde) controleer(Number(waarde));
          }}
        >
          <input
            ref={invoer}
            className={s.vak}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="Jouw antwoord"
            value={waarde}
            onChange={(e) => setWaarde(e.target.value.replace(/\D/g, "").slice(0, 2))}
            onFocus={(e) => bijAandacht(e.currentTarget)}
            onBlur={bijWeggaan}
          />
          <button type="submit" className={s.rond} aria-label="Controleer" data-controleer disabled={!waarde}>
            <Vink />
          </button>
          {!race && (
            <button type="button" className={s.weetniet} onClick={() => controleer(null)}>
              Weet ik niet
            </button>
          )}
        </form>
      )}

      {race ? (
        <div className={s.baan}>
          <svg width="880" height="150" viewBox="0 0 880 150" style={{ position: "absolute", inset: 0 }} aria-hidden>
            <path d="M0 132 q60 -8 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 V150 H0z" fill="#5cc46e" />
            <path d="M0 132 q60 -8 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke="#ffffff" strokeWidth="4" />
            <rect x="34" y="42" width="20" height="92" rx="8" fill="#b9814a" stroke="#ffffff" strokeWidth="3" />
            <rect x="38" y="70" width="12" height="6" fill="#7d4f22" />
            <line x1={BAAN_B + 96} y1="40" x2={BAAN_B + 96} y2="134" stroke="#ffffff" strokeWidth="4" />
            {Array.from({ length: 12 }, (_, k) => (
              <rect key={k} x={BAAN_B + 98 + (k % 4) * 14} y={40 + Math.floor(k / 4) * 14} width="14" height="14" fill={(k + Math.floor(k / 4)) % 2 ? "#ffffff" : "#1b2233"} />
            ))}
          </svg>
          <div className={s.renner} style={{ left: haasX }}>
            <Haas />
          </div>
          <div className={s.renner} style={{ left: padX }}>
            <Schildpad />
          </div>
        </div>
      ) : (
        <div className={s.bolletjes} aria-label="Hoe het gaat">
          {uitslagen.map((u, k) => (
            <span key={k} className={`${s.bolletje} ${u === "goed" ? s.bolGoed : u === "fout" ? s.bolFout : ""}`}>
              {u === "goed" ? <Vink maat={18} /> : u === "fout" ? <Kruis /> : null}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- het venster ---------- */

const KNOP: Record<Flitsknop, { tekst: string; kleur: string }> = {
  race: { tekst: "Race", kleur: s.groen },
  oefenen: { tekst: "Oefenen", kleur: s.oranje },
  verder: { tekst: "Nog een keer oefenen", kleur: s.oranje },
  opnieuw: { tekst: "Nog een keer racen", kleur: s.groen },
  klaar: { tekst: "Klaar", kleur: s.roze },
};

export function FlitsKaart(p: FlitsProps & Vlakbasis) {
  const { titel, stapel, voorbeeld, fase, ronde, actief, best, haasTijd, uitslag, knoppen, trofee, meld } = p;

  const knop = (k: Flitsknop) => (
    <button key={k} type="button" className={`${s.knop} ${KNOP[k].kleur}`} disabled={!actief} onClick={() => meld({ soort: "keuze", keuze: k })}>
      {KNOP[k].tekst}
    </button>
  );

  return (
    <div className={s.venster}>
      {fase === "start" && (
        <div className={s.start}>
          {trofee && (
            <svg className={s.trofee} width="70" height="70" viewBox="0 0 70 70" aria-label="Trofee">
              <path d="M20 10h30v14a15 15 0 0 1-30 0z" fill="#fdc62f" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M20 14h-8a8 8 0 0 0 9 12M50 14h8a8 8 0 0 1-9 12" fill="none" stroke="#fdc62f" strokeWidth="4" strokeLinecap="round" />
              <path d="M31 38h8v10h-8z M23 48h24v8H23z" fill="#fdc62f" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M28 16l3 7" stroke="#fff6c8" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          <svg width="244" height="190" viewBox="0 0 244 190" aria-hidden>
            <FlitsStapel kaart={voorbeeld} />
          </svg>
          <h2 className={s.titel}>{titel}</h2>
          <p className={s.best}>{best === null ? "Nog geen beste tijd" : `Beste tijd: ${tijdTekst(best)} s`}</p>
          <div className={s.knoppen}>{knoppen.map(knop)}</div>
        </div>
      )}

      {(fase === "oefenen" || fase === "race") && (
        <Spel key={`${fase}-${ronde}`} race={fase === "race"} stapel={stapel} haasTijd={haasTijd} meld={meld} />
      )}

      {fase === "uitslag" && uitslag && (
        <div className={s.paneel}>
          {uitslag.dier && <div style={{ marginBottom: 8 }}>{uitslag.dier === "schildpad" ? <Schildpad blij /> : <Haas />}</div>}
          <h2>{uitslag.kop}</h2>
          <p>{uitslag.tekst}</p>
          <div className={s.kolom}>{knoppen.map(knop)}</div>
        </div>
      )}
    </div>
  );
}
