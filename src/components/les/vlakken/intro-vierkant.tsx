"use client";

/**
 * Het vierkant om kapot te slaan (oktober 2026), naar Synthesis "Getting
 * Started · Inputs" (de schermpjes). Een groot paars vierkant met een lichte
 * rand. Linksboven een handknop ("ik zit vast"), rechtsboven verschijnt de
 * hamer met een 2, en naast de hand het blauwe vinkje ("ik ben klaar").
 *
 * Zonder hamer gebeurt er niets als je op het vierkant tikt (het wiebelt even):
 * dat is expres, zo leert het kind om hulp te vragen. Met de hamer valt het in
 * twee helften.
 *
 * Meldingen: `vierkant` (kapot: boolean), `hand` en `klaar`.
 */

import { useState } from "react";
import type { Vlakbasis } from "../soort";
import s from "./intro.module.css";

export type VierkantProps = {
  actief: boolean;
  /** De hamer staat rechtsboven; nu valt het vierkant in twee. */
  hamer: boolean;
  /** De handknop knippert zacht. */
  wijsHand: boolean;
  /** Het vinkje naast de hand is te zien. */
  vinkje: boolean;
};

const Hand = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
    <path
      d="M10 17V8a2 2 0 0 1 4 0v7M14 15V5.5a2 2 0 0 1 4 0V15M18 15V7a2 2 0 0 1 4 0v9M22 14v-3a2 2 0 0 1 4 0v8c0 5-3.5 9-9 9h-1c-3.5 0-5.5-1.8-7.5-4.5L5 20.5a2 2 0 0 1 3-2.6L10 20"
      fill="#f6c86b"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const Hamer = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
    <rect x="13" y="11" width="4" height="17" rx="1.5" fill="#c8894a" stroke="#ffffff" strokeWidth="1.4" transform="rotate(-35 15 15)" />
    <rect x="5" y="3" width="17" height="9" rx="2" fill="#b9bfcc" stroke="#ffffff" strokeWidth="1.4" transform="rotate(-35 15 15)" />
  </svg>
);

const Vink = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" aria-hidden>
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function IntroVierkant({ actief, hamer, wijsHand, vinkje, meld }: VierkantProps & Vlakbasis) {
  const [kapot, setKapot] = useState(false);
  const [wiebel, setWiebel] = useState(0);

  return (
    <>
      <div className={s.opdracht}>Sla het vierkant kapot.</div>

      <button type="button" className={s.handknop} aria-label="Ik zit vast" data-wijs={wijsHand} disabled={!actief} onClick={() => meld({ soort: "hand" })}>
        <Hand />
      </button>
      {vinkje && (
        <button type="button" className={`${s.rond} ${s.klaarknop}`} aria-label="Klaar" disabled={!actief} onClick={() => meld({ soort: "klaar" })}>
          <Vink />
        </button>
      )}
      {hamer && (
        <div className={s.hamerknop} aria-label="Hamer, twee stukken">
          <Hamer /> 2
        </div>
      )}

      <button
        type="button"
        className={s.vierkant}
        aria-label="Het vierkant"
        disabled={!actief || kapot}
        onClick={() => {
          if (hamer) {
            setKapot(true);
            meld({ soort: "vierkant", kapot: true });
          } else {
            setWiebel((w) => w + 1);
            meld({ soort: "vierkant", kapot: false });
          }
        }}
      >
        <svg key={wiebel} className={wiebel > 0 && !kapot ? s.wiebel : undefined} width="360" height="360" viewBox="0 0 360 360" aria-hidden>
          <path d="M10 10H350V350H10Z" fill="#6a3fc4" stroke="#b9a2f0" strokeWidth="4" strokeLinejoin="round" />
          {kapot && <line x1="180" y1="8" x2="180" y2="352" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />}
        </svg>
      </button>
    </>
  );
}
