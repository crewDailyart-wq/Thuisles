"use client";

/**
 * Vos in de bioscoop: een plek vinden in het twintigveld.
 *
 * Twee rijen van tien stoelen. Alleen bij een paar stoelen staat het nummer;
 * de rest is leeg. Vos heeft een kaartje met een getal erop, en het kind tikt
 * de stoel aan die daarbij hoort.
 *
 * ---------------------------------------------------------------------------
 * Wat hier geoefend wordt
 * ---------------------------------------------------------------------------
 * Niet tellen vanaf één, maar springen vanaf een houvast. Wie 17 zoekt en bij
 * 15 begint, is er met twee stapjes. Wie vanaf 1 gaat tellen, raakt halverwege
 * de tel kwijt — en dat is precies de fout die dit type zichtbaar maakt.
 *
 * Welke nummers er staan, is daarom instelbaar: alle vijftallen is een steiger
 * om op te leunen, alleen 1, 10 en 20 laat weinig over en dwingt tot grotere
 * sprongen.
 *
 * ---------------------------------------------------------------------------
 * Waarom twee rijen van tien
 * ---------------------------------------------------------------------------
 * Dat is het twintigveld zoals het op school aan de muur hangt: tien boven,
 * tien onder. De tweede rij begint bij elf, dus "zeventien" zit in de tweede
 * rij op dezelfde plek als "zeven" in de eerste. Dat verband is de hele les.
 */

import { useRef } from "react";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

const RAND = "#3a1416";
const RANDDIKTE = 4;

/** Eén bioscoopstoel, met eventueel zijn nummer erop. */
function Stoel({
  nummer,
  toon,
  gekozen,
  fout,
  goed,
  licht,
}: {
  nummer: number;
  /** Staat het nummer op deze stoel? */
  toon: boolean;
  gekozen: boolean;
  fout: boolean;
  goed: boolean;
  /** Deze stoel licht op in de uitleg. */
  licht?: boolean;
}) {
  const rug = goed ? "#2f9e6b" : fout ? "#b9354a" : gekozen ? "#f2a03d" : "#c0392f";
  const zit = goed ? "#248257" : fout ? "#95293a" : gekozen ? "#d9852a" : "#a42f26";

  return (
    <svg viewBox="0 0 70 80" className="h-full w-full overflow-visible" aria-hidden="true">
      {licht && (
        <rect
          x="1"
          y="1"
          width="68"
          height="78"
          rx="10"
          fill="none"
          stroke="var(--color-huisstijl)"
          strokeWidth="6"
        />
      )}
      {/* Rugleuning */}
      <rect x="8" y="6" width="54" height="46" rx="14" fill={rug} stroke={RAND} strokeWidth={RANDDIKTE} />
      <path d="M16 12 h12 v32 h-12 z" fill="#ffffff" opacity="0.18" />
      {/* Zitting */}
      <rect x="6" y="48" width="58" height="18" rx="8" fill={zit} stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* Pootje */}
      <rect x="30" y="64" width="10" height="12" rx="3" fill={RAND} />

      {toon && (
        <text
          x="35"
          y="38"
          textAnchor="middle"
          fontSize="26"
          fontWeight="800"
          fill="#fff4e2"
        >
          {nummer}
        </text>
      )}
    </svg>
  );
}

/** Het kaartje van Vos, met het gezochte getal erop. */
function Kaartje({ getal }: { getal: number }) {
  return (
    <svg viewBox="0 0 120 70" className="h-full w-full" aria-hidden="true">
      <rect x="4" y="8" width="112" height="54" rx="10" fill="#ffe9b8" stroke={RAND} strokeWidth={RANDDIKTE} />
      <path d="M10 14 h100 v8 h-100 z" fill="#ffffff" opacity="0.5" />
      <circle cx="4" cy="35" r="7" fill="#fdf6e8" stroke={RAND} strokeWidth="3" />
      <circle cx="116" cy="35" r="7" fill="#fdf6e8" stroke={RAND} strokeWidth="3" />
      <text x="60" y="50" textAnchor="middle" fontSize="34" fontWeight="800" fill={RAND}>
        {getal}
      </text>
    </svg>
  );
}

/**
 * De hele zaal.
 *
 * De stoelen zijn zelf de knoppen. Bij een goed antwoord gaat het licht uit —
 * de film begint — en bij een fout blijkt de stoel bezet.
 */
export function Bioscoop({
  aantal,
  perRij = 10,
  zichtbaar,
  gezocht,
  gekozen,
  fase = "bezig",
  markeer = true,
  vos = { vangend: null, wachtend: null, blij: null },
  onKies,
}: {
  /** Hoeveel stoelen er in de zaal staan. */
  aantal: number;
  perRij?: number;
  /** Bij welke stoelnummers het nummer zichtbaar is. */
  zichtbaar: number[];
  /** Het getal op het kaartje van Vos. */
  gezocht: number;
  gekozen: string;
  fase?: "bezig" | "goed" | "fout";
  markeer?: boolean;
  vos?: Voshoudingen;
  onKies?: (waarde: string) => void;
}) {
  const uit = fase !== "bezig";
  const rijen = Math.ceil(aantal / perRij);
  const goed = fase === "goed";

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  return (
    <div ref={buitenRef} className="mx-auto w-full max-w-xl">
      <div
        ref={vakRef}
        /*
          Bij een goed antwoord gaat het licht uit: de zaal wordt donker en de
          gekozen stoel blijft in het licht staan. Dat is het feestje van dit
          type — geen confetti, maar de film die begint.
        */
        className={`relative w-full rounded-groot border-2 border-rand p-3 shadow-op transition-colors duration-700 sm:p-4 ${
          goed ? "bg-[#2a1b2e]" : "bg-[#f7e2d4]"
        }`}
      >
        {/* Het doek vooraan in de zaal. */}
        <div
          className={`mb-2 h-6 w-full rounded-md border-2 border-rand transition-colors duration-700 ${
            goed ? "bg-[#fdf6e8]" : "bg-[#e7d3c4]"
          }`}
        />

        <div ref={vlakRef} className="flex flex-col gap-1.5">
          {Array.from({ length: rijen }, (_, r) => (
            <div key={r} className="flex justify-center gap-1">
              {Array.from(
                { length: Math.min(perRij, aantal - r * perRij) },
                (_, k) => {
                  const nummer = r * perRij + k + 1;
                  /*
                    Het antwoord is de plék in de rij keuzes, niet het
                    stoelnummer zelf — dat is de afspraak bij elke meerkeuze in
                    deze app. Stoel 1 is dus keuze 0.
                  */
                  const dezeGekozen = gekozen === String(nummer - 1);
                  return (
                    <button
                      key={nummer}
                      type="button"
                      disabled={uit}
                      onClick={() => onKies?.(String(nummer - 1))}
                      aria-label={`Stoel ${nummer}`}
                      className={`w-full max-w-10 transition disabled:cursor-not-allowed ${
                        !uit ? "hover:-translate-y-0.5" : ""
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-huisstijl`}
                    >
                      <Stoel
                        nummer={nummer}
                        toon={zichtbaar.includes(nummer) || (goed && dezeGekozen)}
                        gekozen={dezeGekozen && fase === "bezig"}
                        fout={fase === "fout" && dezeGekozen && markeer}
                        goed={goed && dezeGekozen}
                      />
                    </button>
                  );
                },
              )}
            </div>
          ))}
        </div>

        {/*
          Vos met zijn kaartje, onder het veld.

          Ze staan samen in één vakje met wat lucht eromheen, zodat meteen
          duidelijk is dat het kaartje van hém is: dit is Vos, dit is zijn
          kaartje, waar hoort hij te zitten? Vos is met opzet kleiner dan het
          kaartje — het getal is waar het om gaat, hij is het verhaal eromheen.

          Hij staat stil zolang het kind nadenkt. Een wippende vos naast de
          vraag trekt de aandacht weg van het veld, en juist daar moet het kind
          kijken.
        */}
        <div className="mt-5 flex justify-center">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-rand/30 bg-white/70 px-4 py-2">
            {vos.vangend && (
              <span ref={vosRef} aria-hidden="true" className="block w-12 shrink-0 sm:w-14">
                <Vosbeeld houdingen={vos} stand={goed ? "blij" : "wachtend"} stil={!goed} />
              </span>
            )}
            <span className="block w-24 shrink-0 sm:w-28">
              <Kaartje getal={gezocht} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dezelfde zaal in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De zaal in de uitleg: vanaf het dichtstbijzijnde bekende nummer springen.
 *
 * `vanaf` is de stoel waar de uitleg begint — een nummer dat gewoon zichtbaar
 * is — en `tot` hoe ver er al doorgeteld is. De stoelen ertussen laten hun
 * nummer zien terwijl ze oplichten, zodat het kind de sprong meemaakt.
 */
export function Uitlegzaal({
  aantal,
  perRij = 10,
  zichtbaar,
  vanaf,
  tot,
  bijschrift,
}: {
  aantal: number;
  perRij?: number;
  zichtbaar: number[];
  vanaf: number;
  tot: number;
  bijschrift?: string;
}) {
  const rijen = Math.ceil(aantal / perRij);
  const heen = tot >= vanaf;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-sm rounded-groot border-2 border-rand bg-[#f7e2d4] p-3 shadow-op">
        <div className="mb-2 h-4 w-full rounded-md border-2 border-rand bg-[#e7d3c4]" />
        <div className="flex flex-col gap-1">
          {Array.from({ length: rijen }, (_, r) => (
            <div key={r} className="flex justify-center gap-0.5">
              {Array.from({ length: Math.min(perRij, aantal - r * perRij) }, (_, k) => {
                const nummer = r * perRij + k + 1;
                const meegeteld = heen
                  ? nummer > vanaf && nummer <= tot
                  : nummer < vanaf && nummer >= tot;
                return (
                  <span key={nummer} className="block w-full">
                    <Stoel
                      nummer={nummer}
                      toon={zichtbaar.includes(nummer) || meegeteld || nummer === vanaf}
                      gekozen={false}
                      fout={false}
                      goed={nummer === tot && tot !== vanaf}
                      licht={nummer === vanaf || meegeteld}
                    />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
