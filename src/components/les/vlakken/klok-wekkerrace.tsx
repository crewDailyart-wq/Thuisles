"use client";

/**
 * Versla de wekker (tweede bouwronde, 10 oktober 2026), naar Synthesis
 * "Telling Time · Beat the Alarm" — alleen het groep 3-deel: hele uren en half.
 *
 * Een tempospel: in één minuut zoveel mogelijk klokken goed. Twee soorten
 * vragen door elkaar: "Hoe laat is het?" (een klok, drie tijden) en "Welke
 * klok is …?" (een tijd, drie klokjes). Goed kleurt groen, fout rood en de
 * goede groen; na een tel komt de volgende klok. Geen uitleg, geen straf:
 * een fout kost alleen tijd. In de laatste 10 seconden wordt de wekker rood.
 *
 * Eigen record ("Jouw beste") wel, in de browser van dit apparaat
 * (localStorage, per naam); geen ranglijst met andere kinderen.
 *
 * Meldt `start` (het kind tikt op Start), `klaar` ({ goed, beste, nieuw })
 * als de tijd om is, en daarna `opnieuw` of `stop`.
 * Schrijft niets naar de database.
 */

import { useEffect, useRef, useState } from "react";
import type { Vlakbasis } from "../soort";
import { Klokje } from "./klok-wijzerklok";
import s from "./klok-wekkerrace.module.css";

const DUUR = 60;

export type WekkerraceProps = {
  /** De naam van het kind: het record hoort bij die naam. */
  naam?: string;
  /** Start, Nog een keer en Klaar werken alleen als dit aanstaat. */
  actief?: boolean;
};

type Vraag =
  | { soort: "lees"; tijd: number; opties: number[] }
  | { soort: "kies"; tijd: number; opties: number[] };

type Fase = "start" | "aftellen" | "spel" | "klaar";

const mod = (n: number, m: number) => ((n % m) + m) % m;
const uurVan = (t: number) => Math.floor(mod(t, 720) / 60) || 12;
const volgend = (uur: number) => (uur % 12) + 1;

/** De Nederlandse naam: "4 uur", "half 5". */
export function tijdnaam(t: number): string {
  const uur = uurVan(t);
  return mod(t, 60) === 30 ? `half ${volgend(uur)}` : `${uur} uur`;
}

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

const heel = (uur: number) => (uur % 12) * 60;
const half = (uur: number) => (uur % 12) * 60 + 30;

/** Een nieuwe vraag. De eerste paar zijn hele uren; daarna ook half. */
function maakVraag(nummer: number, vorige: number | null): Vraag {
  let tijd: number;
  do {
    const uur = 1 + Math.floor(Math.random() * 12);
    tijd = nummer < 3 || Math.random() < 0.45 ? heel(uur) : half(uur);
  } while (tijd === vorige);
  const uur = uurVan(tijd);
  /* De bekende vergissingen: een ander uur, de minutenwijzer als uur, en bij half het verkeerde uur (het Engelse denken). */
  const fout =
    mod(tijd, 60) === 0
      ? [heel(volgend(uur)), heel(uur + 10), half(uur), half(uur + 11), heel(12)]
      : [half(uur + 11), heel(uur), heel(volgend(uur)), half(volgend(uur)), heel(6)];
  const afleiders = schud([...new Set(fout.map((f) => mod(f, 720)))].filter((f) => f !== tijd)).slice(0, 2);
  const opties = schud([tijd, ...afleiders]);
  return Math.random() < 0.5 ? { soort: "lees", tijd, opties } : { soort: "kies", tijd, opties };
}

function leesBeste(naam: string): number[] {
  try {
    const ruw = window.localStorage.getItem(`thuisles:klok-wekkerrace:${naam || "kind"}`);
    const lijst = ruw ? (JSON.parse(ruw) as unknown) : [];
    return Array.isArray(lijst) ? lijst.filter((n): n is number => typeof n === "number").slice(0, 3) : [];
  } catch {
    return [];
  }
}

function bewaarBeste(naam: string, lijst: number[]) {
  try {
    window.localStorage.setItem(`thuisles:klok-wekkerrace:${naam || "kind"}`, JSON.stringify(lijst.slice(0, 3)));
  } catch {
    /* geen opslag: dan alleen voor nu */
  }
}

/** De wekker met de ring die leegloopt. */
function Rondewekker({ over, maat, groot }: { over: number; maat: number; groot?: boolean }) {
  const r = 70;
  const omtrek = 2 * Math.PI * r;
  const rood = over <= 10 && !groot;
  const kleur = rood ? "#ef4b4b" : "#b98cf5";
  const tekst = groot ? "1:00" : `0:${String(Math.ceil(over)).padStart(2, "0")}`;
  return (
    <svg width={maat} height={maat} viewBox="-120 -125 240 240" aria-hidden>
      <path d="M-78 -96 a34 34 0 0 1 52 -10 Z" fill="#f4bb3a" />
      <path d="M78 -96 a34 34 0 0 0 -52 -10 Z" fill="#f4bb3a" />
      <line x1={-62} y1={84} x2={-78} y2={104} stroke="#3a4157" strokeWidth={12} strokeLinecap="round" />
      <line x1={62} y1={84} x2={78} y2={104} stroke="#3a4157" strokeWidth={12} strokeLinecap="round" />
      <circle r={96} fill="#2e3448" />
      <circle r={r + 12} fill="#121a2c" />
      <circle r={r} fill="none" stroke="rgba(185,140,245,0.18)" strokeWidth={9} />
      <circle
        r={r}
        fill="none"
        stroke={kleur}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={omtrek}
        strokeDashoffset={groot ? 0 : omtrek * (1 - Math.max(0, over) / DUUR)}
        transform="rotate(-90)"
      />
      <text y={4} textAnchor="middle" dominantBaseline="central" className={s.wekkercijfers} fill={rood ? "#ff8a8a" : "#cfe2ff"}>
        {tekst}
      </text>
    </svg>
  );
}

export function Wekkerrace({ naam = "", actief = false, meld }: WekkerraceProps & Vlakbasis) {
  const [fase, setFase] = useState<Fase>("start");
  const [tel, setTel] = useState(3);
  const [over, setOver] = useState(DUUR);
  const [goed, setGoed] = useState(0);
  const [vraag, setVraag] = useState<Vraag | null>(null);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [beste, setBeste] = useState<number[]>([]);
  const [nieuw, setNieuw] = useState(false);
  const nummer = useRef(0);
  const goedRef = useRef(0);
  const meldRef = useRef(meld);
  const naamRef = useRef(naam);
  const volgende = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    meldRef.current = meld;
    naamRef.current = naam;
  });

  /* Het record ophalen (na het eerste tekenen: localStorage bestaat alleen in de browser). */
  useEffect(() => {
    const t = setTimeout(() => setBeste(leesBeste(naamRef.current)), 0);
    return () => clearTimeout(t);
  }, []);

  /* Aftellen 3-2-1. */
  useEffect(() => {
    if (fase !== "aftellen") return;
    const t = setTimeout(() => {
      if (tel > 1) setTel(tel - 1);
      else {
        nummer.current = 0;
        goedRef.current = 0;
        setGoed(0);
        setOver(DUUR);
        setVraag(maakVraag(0, null));
        setGekozen(null);
        setFase("spel");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [fase, tel]);

  /* De wekker loopt. */
  useEffect(() => {
    if (fase !== "spel") return;
    const begin = performance.now();
    const id = setInterval(() => {
      const rest = DUUR - (performance.now() - begin) / 1000;
      if (rest > 0) {
        setOver(rest);
        return;
      }
      clearInterval(id);
      if (volgende.current) clearTimeout(volgende.current);
      setOver(0);
      const score = goedRef.current;
      const oud = leesBeste(naamRef.current);
      const lijst = [...oud, score].sort((a, b) => b - a).slice(0, 3);
      const record = score > 0 && (oud.length === 0 || score > oud[0]);
      bewaarBeste(naamRef.current, lijst);
      setBeste(lijst);
      setNieuw(record);
      setFase("klaar");
      meldRef.current({ soort: "klaar", goed: score, beste: lijst[0] ?? score, nieuw: record });
    }, 100);
    return () => clearInterval(id);
  }, [fase]);

  useEffect(
    () => () => {
      if (volgende.current) clearTimeout(volgende.current);
    },
    [],
  );

  const antwoord = (t: number) => {
    if (!vraag || gekozen !== null || fase !== "spel") return;
    setGekozen(t);
    if (t === vraag.tijd) {
      goedRef.current += 1;
      setGoed(goedRef.current);
    }
    volgende.current = setTimeout(
      () => {
        nummer.current += 1;
        setVraag((v) => maakVraag(nummer.current, v?.tijd ?? null));
        setGekozen(null);
      },
      t === vraag.tijd ? 450 : 1000,
    );
  };

  const kleurVan = (t: number) => {
    if (gekozen === null || !vraag) return "";
    if (t === vraag.tijd) return s.goed;
    if (t === gekozen) return s.fout;
    return s.flets;
  };

  const begin = () => {
    if (!actief) return;
    setTel(3);
    setNieuw(false);
    setFase("aftellen");
    meld({ soort: "start" });
  };

  if (fase === "start") {
    return (
      <div className={s.midden}>
        <Rondewekker over={DUUR} maat={230} groot />
        <h2 className={s.titel}>Versla de wekker</h2>
        <p className={s.onder}>Hoeveel klokken kun je lezen voordat hij afgaat?</p>
        {beste.length > 0 && <p className={s.beste}>Jouw beste: {beste[0]}</p>}
        <button type="button" className={s.start} onClick={begin} disabled={!actief}>
          Start
        </button>
      </div>
    );
  }

  if (fase === "aftellen") {
    return (
      <div className={s.midden}>
        <div key={tel} className={s.tel} aria-live="assertive">
          {tel}
        </div>
      </div>
    );
  }

  if (fase === "klaar") {
    return (
      <div className={s.midden}>
        <p className={s.klein}>De tijd is om</p>
        <div className={s.score}>{goed}</div>
        <p className={s.onder}>{goed === 1 ? "klok goed" : "klokken goed"}</p>
        {nieuw && <p className={s.record}>Nieuw record!</p>}
        <div className={s.lijst}>
          <h3>Jouw beste</h3>
          {beste.map((n, i) => (
            <div key={i} className={i === 0 ? s.eerste : undefined}>
              <span>{i + 1}</span>
              <b>{n}</b>
            </div>
          ))}
        </div>
        <div className={s.rij}>
          <button
            type="button"
            className={s.start}
            disabled={!actief}
            onClick={() => {
              if (!actief) return;
              meld({ soort: "opnieuw" });
              setTel(3);
              setNieuw(false);
              setFase("aftellen");
            }}
          >
            Nog een keer
          </button>
          <button type="button" className={s.klaarknop} disabled={!actief} onClick={() => actief && meld({ soort: "stop" })}>
            Klaar
          </button>
        </div>
      </div>
    );
  }

  /* Het spel. */
  return (
    <div className={s.spel}>
      <div className={s.teller}>
        <span>Goed</span>
        <b>{goed}</b>
      </div>
      <div className={s.kleinewekker}>
        <Rondewekker over={over} maat={120} />
      </div>
      {vraag?.soort === "lees" && (
        <>
          <p className={s.vraag}>Hoe laat is het?</p>
          <div className={s.grooteklok}>
            <Klokje tijd={vraag.tijd} maat={330} />
          </div>
          <div className={s.tijdknoppen}>
            {vraag.opties.map((t) => (
              <button key={t} type="button" className={`${s.tijdknop} ${kleurVan(t)}`} onClick={() => antwoord(t)}>
                {tijdnaam(t)}
              </button>
            ))}
          </div>
        </>
      )}
      {vraag?.soort === "kies" && (
        <>
          <p className={s.vraag}>Welke klok past bij deze tijd?</p>
          <div className={s.grotetijd}>{tijdnaam(vraag.tijd)}</div>
          <div className={s.klokknoppen}>
            {vraag.opties.map((t) => (
              <button key={t} type="button" className={`${s.klokknop} ${kleurVan(t)}`} aria-label={`Klok: ${tijdnaam(t)}`} onClick={() => antwoord(t)}>
                <Klokje tijd={t} maat={210} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
