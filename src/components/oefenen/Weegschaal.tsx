"use client";

/**
 * Bouwsteen 2: de weegschaal (optellen tot en met 20, oktober 2026).
 *
 * Een balk met links en rechts een schaal met blokjes. Hij hangt scheef naar
 * de zwaarste kant en hangt pas recht als beide kanten evenveel blokjes
 * hebben; hij beweegt soepel mee.
 *
 * Bij "Maak beide kanten gelijk I" liggen op de volle kant de blokjes van de
 * twee getallen (3 + 3), op de andere kant het bekende getal (1). Naast de
 * weegschaal ligt een stapel losse blokjes: het kind sleept of tikt er een naar
 * de schaal met het lege vakje. Een blokje dat erbij is gelegd, tikt het kind
 * aan om het terug te leggen. Er staat geen teller: het kind telt zelf.
 *
 * Na een fout antwoord laat `WeegschaalUitleg` rustig zien welk getal ervoor
 * zorgt dat hij recht hangt.
 */

import { useEffect, useRef, useState } from "react";
import { Blokje, Sleepding } from "@/components/oefenen/Tienstrook";

/** Wat er op één schaal ligt: de vaste groepjes, en wat het kind erbij legde. */
type Schaal = { vast: number[]; erbij: number };

const HALF = 150;
const MAX_HOEK = 12;

function hoekVan(links: number, rechts: number): number {
  /* Positief: rechts is zwaarder en zakt. */
  return Math.max(-MAX_HOEK, Math.min(MAX_HOEK, (rechts - links) * 4));
}

function Schaalinhoud({
  schaal,
  klein,
  uit,
  onTerug,
}: {
  schaal: Schaal;
  klein: boolean;
  uit: boolean;
  onTerug?: () => void;
}) {
  return (
    <div className={`flex max-w-[16rem] flex-wrap items-end justify-center ${klein ? "gap-0.5" : "gap-1"}`}>
      {/* De vaste groepjes, met een beetje ruimte tussen het ene en het andere getal. */}
      {schaal.vast.map((n, g) => (
        <span key={g} className={`flex flex-wrap justify-center ${klein ? "gap-0.5" : "gap-1"} ${g > 0 ? "ml-2" : ""}`}>
          {Array.from({ length: n }, (_, i) => (
            <Blokje key={i} kleur={0} klein={klein} />
          ))}
        </span>
      ))}
      {schaal.erbij > 0 && (
        <span className={`ml-2 flex flex-wrap justify-center ${klein ? "gap-0.5" : "gap-1"}`}>
          {Array.from({ length: schaal.erbij }, (_, i) =>
            onTerug && !klein ? (
              <button
                key={i}
                type="button"
                aria-label="Leg dit blokje terug"
                disabled={uit}
                onClick={onTerug}
                className="motion-safe:animate-teller-pop grid size-12 place-items-center rounded-xl enabled:hover:scale-105 disabled:cursor-default"
              >
                <Blokje kleur={1} />
              </button>
            ) : (
              <span key={i} className={klein ? "" : "motion-safe:animate-teller-pop"}>
                <Blokje kleur={1} klein={klein} />
              </span>
            ),
          )}
        </span>
      )}
    </div>
  );
}

/** De weegschaal zelf: balk, paal en twee hangende schalen. */
export function Weegschaal({
  links,
  rechts,
  klein = false,
  uit = false,
  onTerug,
  schaalRef,
}: {
  links: Schaal;
  rechts: Schaal;
  /** Kleine blokjes, voor de uitleg na een fout antwoord (tot 20 per kant). */
  klein?: boolean;
  uit?: boolean;
  /** Een erbij gelegd blokje terug, per kant. */
  onTerug?: (kant: "links" | "rechts") => void;
  schaalRef?: (kant: "links" | "rechts", el: HTMLDivElement | null) => void;
}) {
  const som = (s: Schaal) => s.vast.reduce((n, x) => n + x, 0) + s.erbij;
  const hoek = hoekVan(som(links), som(rechts));
  const rad = (hoek * Math.PI) / 180;
  const dy = HALF * Math.sin(rad);
  const beweging = "transform 450ms cubic-bezier(0.3, 0.8, 0.4, 1)";
  const hoogte = klein ? 250 : 300;

  const schaal = (kant: "links" | "rechts") => {
    const x = kant === "links" ? -HALF : HALF;
    const y = kant === "links" ? -dy : dy;
    return (
      <div
        className="absolute left-1/2 top-[56px] flex w-[16.5rem] flex-col items-center"
        style={{ transform: `translate(calc(-50% + ${x * Math.cos(rad)}px), ${y}px)`, transition: beweging }}
      >
        {/* Het touwtje waaraan de schaal hangt. */}
        <span aria-hidden="true" className="h-6 w-0.5 bg-inkt-zacht" />
        <div
          ref={(el) => schaalRef?.(kant, el)}
          className="flex min-h-14 w-full flex-col items-center justify-end rounded-b-[2rem] border-b-4 border-x-4 border-inkt-zacht/60 bg-room/70 px-2 pb-2 pt-1"
        >
          <Schaalinhoud
            schaal={kant === "links" ? links : rechts}
            klein={klein}
            uit={uit}
            onTerug={onTerug ? () => onTerug(kant) : undefined}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <div
        role="img"
        aria-label={hoek === 0 ? "De weegschaal hangt recht" : "De weegschaal hangt scheef"}
        className="relative mx-auto w-[38rem]"
        style={{ height: hoogte }}
      >
        {/* De paal en de voet. */}
        <span aria-hidden="true" className="absolute bottom-2 left-1/2 top-[44px] w-2 -translate-x-1/2 rounded-full bg-inkt-zacht" />
        <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-3 w-28 -translate-x-1/2 rounded-full bg-inkt-zacht" />
        {/* De balk draait om het midden. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[50px] h-2.5 rounded-full bg-huisstijl-diep"
          style={{ width: 2 * HALF + 20, transform: `translateX(-50%) rotate(${hoek}deg)`, transition: beweging }}
        />
        <span aria-hidden="true" className="absolute left-1/2 top-[44px] size-5 -translate-x-1/2 rounded-full bg-huisstijl-diep" />
        {schaal("links")}
        {schaal("rechts")}
      </div>
    </div>
  );
}

/**
 * De weegschaal om zelf te bouwen. `kant` is de schaal met het lege vakje; daar
 * legt het kind blokjes bij tot hij recht hangt.
 */
export function WeegschaalBouwer({
  links,
  rechts,
  kant,
  uit,
  onKlaar,
}: {
  links: number[];
  rechts: number[];
  kant: "links" | "rechts";
  uit: boolean;
  onKlaar: (klaar: boolean) => void;
}) {
  const [erbij, setErbij] = useState(0);
  const [boven, setBoven] = useState(false);
  const doel = useRef<HTMLDivElement | null>(null);
  const totaal = (xs: number[]) => xs.reduce((n, x) => n + x, 0);
  const leeg = kant === "links" ? totaal(links) : totaal(rechts);
  const vol = kant === "links" ? totaal(rechts) : totaal(links);
  const klaar = leeg + erbij === vol;
  useEffect(() => onKlaar(klaar), [klaar, onKlaar]);

  /* Een stapel van tien: genoeg voor elke som tot en met 10, met wat over. */
  const stapel = Math.max(0, 10 - erbij);
  const isBoven = (x: number, y: number) => {
    const r = doel.current?.getBoundingClientRect();
    return !!r && x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 40 && y <= r.bottom + 24;
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className={boven ? "rounded-3xl ring-4 ring-huisstijl/30" : ""}>
        <Weegschaal
          links={{ vast: links, erbij: kant === "links" ? erbij : 0 }}
          rechts={{ vast: rechts, erbij: kant === "rechts" ? erbij : 0 }}
          uit={uit}
          onTerug={() => setErbij((n) => Math.max(0, n - 1))}
          schaalRef={(k, el) => {
            if (k === kant) doel.current = el;
          }}
        />
      </div>
      {/* De stapel losse blokjes, in rijtjes van vijf. */}
      {stapel > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {Array.from({ length: Math.ceil(stapel / 5) }, (_, r) => (
            <div key={r} className="flex gap-1">
              {Array.from({ length: Math.min(5, stapel - r * 5) }, (_, k) => (
                <Sleepding
                  key={k}
                  label={`Blokje op de ${kant === "links" ? "linker" : "rechter"} schaal`}
                  uit={uit}
                  boven={isBoven}
                  onBoven={setBoven}
                  onNaarStrook={() => setErbij((n) => n + 1)}
                >
                  <Blokje kleur={1} />
                </Sleepding>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Na een fout antwoord: de weegschaal recht, met het goede aantal blokjes erbij. */
export function WeegschaalUitleg({
  links,
  rechts,
  kant,
  erbij,
}: {
  links: number[];
  rechts: number[];
  kant: "links" | "rechts";
  erbij: number;
}) {
  /* Eerst scheef zonder de blokjes, dan komen ze erbij en hangt hij recht. */
  const [getoond, setGetoond] = useState(0);
  useEffect(() => {
    const klok = window.setTimeout(() => setGetoond(erbij), 500);
    return () => window.clearTimeout(klok);
  }, [erbij]);
  return (
    <Weegschaal
      links={{ vast: links, erbij: kant === "links" ? getoond : 0 }}
      rechts={{ vast: rechts, erbij: kant === "rechts" ? getoond : 0 }}
      klein
    />
  );
}
