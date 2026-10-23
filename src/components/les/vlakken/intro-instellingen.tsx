"use client";

/**
 * Het instelvlak (oktober 2026), naar Synthesis "Getting Started ·
 * Customizing the Tutor". Eén vlak met vijf schermen:
 * - menu: drie grote gekleurde knoppen onder elkaar (roze Oplichten, groen
 *   Naam, oranje Letters); wat al gedaan is krijgt een vinkje;
 * - oplichten: Aan of Uit, met een voorbeeldzin waarin de woorden oplichten;
 * - naam: een rood naamstickertje "HALLO, ik heet …"; als de naam niet goed
 *   klinkt een paar schrijfwijzen om te beluisteren en te kiezen, en een
 *   tekstvak voor een grote mens;
 * - letters: Gewoon of Groot, met een voorbeeldzin in die maat;
 * - gevoel: vijf gezichtjes ("hoe vind je dat?").
 * Elk paneel heeft een brede groene knop Bewaar (bij gevoel: Klaar).
 *
 * Meldingen: `menu` (keuze), `bewaar` (waarde: boolean | "gewoon" | "groot" |
 * string | null) en `gevoel` (n: 0 tot en met 4). Het vlak bewaart zelf
 * niets; dat doet het draaiboek met `bewaarVoorkeuren`.
 */

import { useEffect, useState, type ComponentType } from "react";
import { Patrick_Hand } from "next/font/google";
import { zeg } from "@/lib/stem";
import type { Vlakbasis } from "../soort";
import s from "./intro.module.css";

const hand = Patrick_Hand({ subsets: ["latin"], weight: "400" });

export type Instelonderdeel = "oplichten" | "naam" | "letters";
export type Instelscherm = "menu" | Instelonderdeel | "gevoel";

export type InstelProps = {
  scherm: Instelscherm;
  /** Knoppen werken pas als de mascotte uitgepraat is. */
  actief: boolean;
  /** Menu: wat al bewaard is. */
  gedaan: Instelonderdeel[];
  oplichten: boolean;
  letters: "gewoon" | "groot";
  naam: string;
  /** Hoe de stem de naam nu uitspreekt. */
  uitspraak: string;
  /** Naam: schrijfwijzen om uit te kiezen. Leeg = alleen het stickertje. */
  varianten: string[];
};

const VOORBEELD = "Er was eens een kleine vos. Hij woonde in een hol onder een oude boom.";

const Vink = ({ maat = 26 }: { maat?: number }) => (
  <svg className={s.vink} width={maat} height={maat} viewBox="0 0 20 20" aria-hidden>
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Luidspreker = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
    <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ---------- pictogrammen in het menu ---------- */

const PictoOplichten = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
    <rect x="4" y="13" width="14" height="14" rx="3" fill="#ffffff" opacity="0.95" />
    <rect x="21" y="17" width="15" height="6" rx="3" fill="#ffffff" opacity="0.55" />
  </svg>
);
const PictoNaam = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
    <rect x="4" y="8" width="32" height="24" rx="5" fill="none" stroke="#ffffff" strokeWidth="3" />
    <path d="M9 22q4-8 7 0t7 0 7-4" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);
const PictoLetters = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
    <text x="3" y="31" fill="#ffffff" fontSize="18" fontWeight="800" fontFamily="system-ui, sans-serif">
      a
    </text>
    <text x="15" y="33" fill="#ffffff" fontSize="28" fontWeight="800" fontFamily="system-ui, sans-serif">
      A
    </text>
  </svg>
);

const MENU: { id: Instelonderdeel; tekst: string; kleur: string; picto: ComponentType }[] = [
  { id: "oplichten", tekst: "Oplichten", kleur: s.roze, picto: PictoOplichten },
  { id: "naam", tekst: "Naam", kleur: s.groen, picto: PictoNaam },
  { id: "letters", tekst: "Letters", kleur: s.oranje, picto: PictoLetters },
];

/* ---------- gezichtjes, eigen tekeningen ---------- */

function Gezicht({ n }: { n: number }) {
  const kleur = ["#e8574a", "#f0a04b", "#f2d04b", "#9ad35a", "#56d38a"][n];
  const mond = [
    "M30 66q20-14 40 0", // boos
    "M32 66q18-10 36 0", // verdrietig
    "M33 62h34", // gewoon
    "M31 58q19 14 38 0", // blij
    "M28 56q22 22 44 0z", // heel blij
  ][n];
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="44" fill={kleur} stroke="#ffffff" strokeWidth="3" />
      {n === 4 ? (
        <>
          <path d="M35 28l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#ffffff" />
          <path d="M65 28l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#ffffff" />
        </>
      ) : (
        <>
          <circle cx="36" cy="40" r="5" fill="#1b2233" />
          <circle cx="64" cy="40" r="5" fill="#1b2233" />
        </>
      )}
      {n === 0 && <path d="M27 28l14 6M73 28l-14 6" stroke="#1b2233" strokeWidth="4" strokeLinecap="round" />}
      <path d={mond} fill={n === 4 ? "#1b2233" : "none"} stroke="#1b2233" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const GEVOEL = ["Boos", "Verdrietig", "Gewoon", "Blij", "Heel blij"];

/* ---------- de schermen ---------- */

function Oplichten({ begin, actief, meld }: { begin: boolean; actief: boolean; meld: Vlakbasis["meld"] }) {
  const [aan, setAan] = useState(begin);
  const [woord, setWoord] = useState(0);
  const woorden = VOORBEELD.split(" ");
  useEffect(() => {
    if (!aan) return;
    const t = setInterval(() => setWoord((w) => (w + 1) % (woorden.length + 3)), 420);
    return () => clearInterval(t);
  }, [aan, woorden.length]);
  return (
    <div className={s.paneel}>
      <h2 className={s.kop}>Oplichten</h2>
      <p className={s.voorbeeld} style={{ fontSize: 22 }}>
        {woorden.map((w, i) => (
          <span key={i}>
            <span className={`${s.licht} ${aan && i === woord ? s.lichtAan : ""}`}>{w}</span>{" "}
          </span>
        ))}
      </p>
      <div className={s.rij}>
        <button type="button" className={s.knop} aria-pressed={aan} onClick={() => setAan(true)}>
          Aan
        </button>
        <button type="button" className={s.knop} aria-pressed={!aan} onClick={() => setAan(false)}>
          Uit
        </button>
      </div>
      <button type="button" className={s.bewaar} disabled={!actief} onClick={() => meld({ soort: "bewaar", waarde: aan })}>
        Bewaar
      </button>
    </div>
  );
}

function Letters({ begin, actief, meld }: { begin: "gewoon" | "groot"; actief: boolean; meld: Vlakbasis["meld"] }) {
  const [maat, setMaat] = useState(begin);
  return (
    <div className={s.paneel}>
      <h2 className={s.kop}>Letters</h2>
      <p className={s.voorbeeld} style={{ fontSize: maat === "groot" ? 24 : 18 }}>
        {VOORBEELD}
      </p>
      <div className={s.rij}>
        <button type="button" className={s.knop} aria-pressed={maat === "gewoon"} onClick={() => setMaat("gewoon")}>
          Gewoon
        </button>
        <button type="button" className={s.knop} style={{ fontSize: 23 }} aria-pressed={maat === "groot"} onClick={() => setMaat("groot")}>
          Groot
        </button>
      </div>
      <button type="button" className={s.bewaar} disabled={!actief} onClick={() => meld({ soort: "bewaar", waarde: maat })}>
        Bewaar
      </button>
    </div>
  );
}

function Naam({ naam, uitspraak, varianten, actief, meld }: Pick<InstelProps, "naam" | "uitspraak" | "varianten" | "actief"> & { meld: Vlakbasis["meld"] }) {
  const [gekozen, setGekozen] = useState<string | null>(null);
  const [eigen, setEigen] = useState("");
  const kiezen = varianten.length > 0;

  function luister(tekst: string) {
    if (tekst.trim()) zeg(tekst.trim());
  }

  return (
    <div className={s.paneel} style={{ top: kiezen ? 120 : 200 }}>
      <div className={s.sticker}>
        <div className={s.stickerHallo}>HALLO</div>
        <div className={s.stickerIk}>ik heet</div>
        <div className={`${s.stickerVeld} ${hand.className}`}>{naam}</div>
        <div className={s.stickerVoet} />
      </div>

      {!kiezen && (
        <div className={s.luister}>
          <button type="button" className={s.knop} disabled={!actief} onClick={() => luister(uitspraak)}>
            <span className={s.luister}>
              <Luidspreker /> Luister
            </span>
          </button>
        </div>
      )}

      {kiezen && (
        <>
          <div className={s.rij} style={{ gridAutoFlow: "row", gridTemplateColumns: `repeat(${Math.min(3, varianten.length)}, 1fr)` }}>
            {varianten.map((v) => (
              <button
                key={v}
                type="button"
                className={s.knop}
                disabled={!actief}
                aria-pressed={gekozen === v}
                onClick={() => {
                  setGekozen(v);
                  setEigen("");
                  luister(v);
                }}
              >
                <span className={s.luister}>
                  <Luidspreker /> {v}
                </span>
              </button>
            ))}
          </div>
          <p className={s.klein}>Voor een grote mens: typ hoe de naam klinkt.</p>
          <div className={s.typen}>
            <input
              className={s.tekstvak}
              type="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={40}
              aria-label="Hoe de naam klinkt"
              value={eigen}
              disabled={!actief}
              onChange={(e) => {
                setEigen(e.target.value);
                setGekozen(e.target.value.trim() ? null : gekozen);
              }}
            />
            <button type="button" className={s.knop} disabled={!actief || !eigen.trim()} onClick={() => luister(eigen)}>
              <span className={s.luister}>
                <Luidspreker /> Luister
              </span>
            </button>
          </div>
          <div className={s.rij}>
            <button
              type="button"
              className={s.bewaar}
              disabled={!actief || (!gekozen && !eigen.trim())}
              onClick={() => meld({ soort: "bewaar", waarde: eigen.trim() || gekozen })}
            >
              Bewaar
            </button>
            <button type="button" className={s.knop} disabled={!actief} onClick={() => meld({ soort: "bewaar", waarde: null })}>
              Laat maar zo
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Gevoel({ actief, meld }: { actief: boolean; meld: Vlakbasis["meld"] }) {
  const [n, setN] = useState<number | null>(null);
  return (
    <div className={s.paneel}>
      <div className={s.gezichten} style={{ marginBottom: 30 }}>
        {GEVOEL.map((g, i) => (
          <button key={g} type="button" className={s.gezicht} aria-label={g} aria-pressed={n === i} disabled={!actief} onClick={() => setN(i)}>
            <Gezicht n={i} />
          </button>
        ))}
      </div>
      <button type="button" className={s.bewaar} disabled={!actief || n === null} onClick={() => meld({ soort: "gevoel", n })}>
        Klaar
      </button>
    </div>
  );
}

export function IntroInstellingen(p: InstelProps & Vlakbasis) {
  const { scherm, actief, gedaan, meld } = p;
  if (scherm === "menu")
    return (
      <div className={s.paneel} style={{ top: 170 }}>
        <div className={s.menu}>
          {/*
            Oplichten staat sinds 23 oktober 2026 niet meer in het menu (opdracht
            eigenaar): het staat standaard aan, en het kind of de ouder zet het
            om bij Profiel. Het scherm Oplichten zelf bestaat nog.
          */}
          {MENU.filter((m) => m.id !== "oplichten").map((m) => {
            const klaar = gedaan.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className={`${s.menuknop} ${m.kleur} ${klaar ? s.gedaan : ""}`}
                disabled={!actief || klaar}
                onClick={() => meld({ soort: "menu", keuze: m.id })}
              >
                <m.picto />
                {m.tekst}
                {klaar && <Vink />}
              </button>
            );
          })}
        </div>
      </div>
    );
  if (scherm === "oplichten") return <Oplichten key="o" begin={p.oplichten} actief={actief} meld={meld} />;
  if (scherm === "letters") return <Letters key="l" begin={p.letters} actief={actief} meld={meld} />;
  if (scherm === "naam")
    return <Naam key={`n-${p.varianten.length}`} naam={p.naam} uitspraak={p.uitspraak} varianten={p.varianten} actief={actief} meld={meld} />;
  return <Gevoel key="g" actief={actief} meld={meld} />;
}
