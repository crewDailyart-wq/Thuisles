"use client";

/**
 * Wegtikken: een groep plaatjes waar er een paar vanaf gaan.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit onderdeel er is
 * ---------------------------------------------------------------------------
 * Een erafsom begint bij zien. Een kind dat dertien appels voor zich heeft en
 * er zelf vijf wegstreept, ziet waaróm er acht overblijven; daarna pas heeft
 * kaal rekenen zin. Dit onderdeel is die eerste stap, en is met opzet los van
 * het domein Erafsommen gebouwd: elk volgend domein kan hem gebruiken.
 *
 * ---------------------------------------------------------------------------
 * Twee manieren
 * ---------------------------------------------------------------------------
 *   tikbaar    het kind tikt zelf plaatjes aan; die krijgen een rood kruis.
 *              Nog een keer tikken haalt het kruis er weer af, zodat een
 *              misklik geen ramp is.
 *   vanzelf    de computer schuift er een paar weg en het kind kijkt. Dat is
 *              het voordoen: eerst zie je wat er gebeurt, daarna doe je het na.
 *
 * De plaatjes staan in rijtjes van vijf, links uitgelijnd, met de volgende rij
 * eronder — de vijfstructuur van school, zodat een kind met sprongen van vijf
 * kan meetellen in plaats van stuk voor stuk.
 */

import { useEffect, useState } from "react";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";

/** Nooit meer dan vijf naast elkaar; zie de vijfstructuur hierboven. */
export const PER_RIJ = 5;

/** Drie maten, zodat twee groepjes naast elkaar ook nog passen. */
const MATEN = {
  groot: "size-[44px] sm:size-[54px]",
  gewoon: "size-[36px] sm:size-[44px]",
  klein: "size-[30px] sm:size-[36px]",
} as const;

export type Wegtikmaat = keyof typeof MATEN;

/** Het rode kruis over een weggestreept plaatje. */
function Kruis() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M20 20 L80 80 M80 20 L20 80"
        fill="none"
        stroke="#d92d20"
        strokeWidth={11}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wegtikken({
  aantal,
  voorwerp,
  weg,
  tikbaar = false,
  vanzelf = 0,
  maat = "gewoon",
  onTik,
}: {
  aantal: number;
  /** De naam van het telplaatje; dezelfde als bij Plaatjes tellen. */
  voorwerp: string;
  /** Welke plaatjes een kruis hebben. De ouder houdt dit bij. */
  weg: number[];
  /** Mag het kind zelf aantikken? */
  tikbaar?: boolean;
  /** Hoeveel plaatjes er vanzelf wegschuiven; 0 = geen. */
  vanzelf?: number;
  maat?: Wegtikmaat;
  onTik?: (nummer: number) => void;
}) {
  /*
    Bij het voordoen schuiven de laatste plaatjes één voor één weg. Ze gaan
    niet allemaal tegelijk: dan is het één beweging en telt een kind niet mee.
    Nu verdwijnt er elke 500 ms eentje, en dat is precies het tempo waarin je
    hardop "één, twee, drie" zegt.
  */
  const [vertrokken, setVertrokken] = useState<number[]>([]);

  useEffect(() => {
    if (vanzelf <= 0) return;

    /*
      De klokjes worden bij het opruimen gestopt en bij het opnieuw draaien
      weer gezet. Dat is met opzet zonder "al gedaan"-vlag: in ontwikkeling
      draait React elk effect twee keer, en met zo'n vlag zou de tweede keer
      niets meer plannen — dan schoof er nooit iets weg.
    */
    const klokjes: number[] = [];
    for (let i = 0; i < vanzelf; i++) {
      klokjes.push(
        window.setTimeout(
          () => setVertrokken((eerder) => [...eerder, aantal - 1 - i]),
          700 + i * 500,
        ),
      );
    }
    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [aantal, vanzelf]);

  const rijen: number[][] = [];
  for (let i = 0; i < aantal; i += PER_RIJ) {
    rijen.push(Array.from({ length: Math.min(PER_RIJ, aantal - i) }, (_, k) => i + k));
  }

  return (
    <span className="flex flex-col items-start gap-1.5">
      {rijen.map((rij, r) => (
        <span key={r} className="flex items-center gap-1.5">
          {rij.map((i) => {
            const gekruist = weg.includes(i);
            const weggeschoven = vertrokken.includes(i);
            const inhoud = (
              <span
                className={`relative block ${MATEN[maat]} transition-all duration-500 ${
                  weggeschoven ? "-translate-y-6 scale-50 opacity-0" : ""
                }`}
              >
                <Telplaatje naam={voorwerp} />
                {gekruist && <Kruis />}
              </span>
            );

            if (!tikbaar) {
              return (
                <span key={i} aria-hidden="true">
                  {inhoud}
                </span>
              );
            }

            return (
              <button
                key={i}
                type="button"
                aria-label={`Plaatje ${i + 1}`}
                aria-pressed={gekruist}
                onClick={() => onTik?.(i)}
                className="cursor-pointer rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-huisstijl"
              >
                {inhoud}
              </button>
            );
          })}
        </span>
      ))}
    </span>
  );
}
