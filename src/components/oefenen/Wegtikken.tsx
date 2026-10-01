"use client";

/**
 * Een groep plaatjes waar er een paar vanaf gaan.
 *
 * ---------------------------------------------------------------------------
 * De beeldtaal van de erafsommen
 * ---------------------------------------------------------------------------
 * Overal in het domein ziet "eraf" er hetzelfde uit, zodat een kind het beeld
 * maar één keer hoeft te leren (zie ONTWERPREGELS.md):
 *
 *   - plaatjes staan altijd in rijtjes van vijf;
 *   - wat eraf gaat is grijs en half doorzichtig, wat overblijft is fel;
 *   - een plaatje dat het kind zelf wegstreept krijgt daar een rood kruis bij;
 *   - één soort plaatje per som, en verder niets eromheen.
 *
 * ---------------------------------------------------------------------------
 * Drie manieren
 * ---------------------------------------------------------------------------
 *   grijs      de plaatjes die eraf gaan staan er al grijs bij; het kind kijkt
 *              en rekent. Met `verschoven` schuiven ze een stukje opzij, met
 *              een pijl ertussen, zodat je ziet dát ze weggaan.
 *   tikbaar    het kind streept zelf weg. Elk plaatje is dan een knop: licht
 *              kader, zachte schaduw, en hij veert in bij het indrukken.
 *   vanzelf    de computer schuift er een paar weg en het kind kijkt.
 *
 * Het onderdeel staat los van één domein, zodat elk volgend domein dezelfde
 * beeldtaal kan gebruiken.
 */

import { useEffect, useState, type ReactNode } from "react";
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

/** Hoe een plaatje eruitziet dat niet meer meetelt: grijs en half doorzichtig. */
export const ERAFSTIJL = "opacity-40 grayscale";

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

/** Het handje dat één keer voordoet dat je op een plaatje kunt tikken. */
function Handje() {
  return (
    <svg viewBox="0 0 30 32" className="h-8 w-8 drop-shadow-sm" aria-hidden="true">
      <path
        d="M8 13V3a2.5 2.5 0 0 1 5 0v8-1a2.3 2.3 0 0 1 4.6 0v1a2.2 2.2 0 0 1 4.4 0v2a2.2 2.2 0 0 1 4.4 0v7c0 6-3.5 10-9 10h-2c-3.5 0-5.5-2-7.5-5l-5-7a2.5 2.5 0 0 1 3.8-3.2L8 17Z"
        fill="#ffffff"
        stroke="#24364b"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wegtikken({
  aantal,
  voorwerp,
  weg,
  grijs = [],
  verschoven = false,
  beweegGrijs = false,
  achteraan,
  tikbaar = false,
  vanzelf = 0,
  wijsAan = false,
  maat = "gewoon",
  onTik,
}: {
  aantal: number;
  /** De naam van het telplaatje; dezelfde als bij Plaatjes tellen. */
  voorwerp: string;
  /** Welke plaatjes het kind heeft weggestreept: grijs mét een rood kruis. */
  weg: number[];
  /** Welke plaatjes er al grijs bij staan, zonder kruis: die gaan eraf. */
  grijs?: number[];
  /** Schuiven de grijze plaatjes een stukje opzij, met een pijl ertussen? */
  verschoven?: boolean;
  /**
   * Zakken de grijze plaatjes bij het begin even weg en komen ze terug?
   *
   * Eén keer en kort: zo zie je wélke eraf gaan, en daarna staat het beeld
   * stil om te tellen. Staat "minder beweging" aan, dan gebeurt er niets.
   */
  beweegGrijs?: boolean;
  /** Komt er nog iets achter het laatste plaatje, zoals een label "− 4"? */
  achteraan?: ReactNode;
  /** Mag het kind zelf aantikken? Dan ziet elk plaatje eruit als een knop. */
  tikbaar?: boolean;
  /** Hoeveel plaatjes er vanzelf wegschuiven; 0 = geen. */
  vanzelf?: number;
  /** Doet een handje één keer voor dat je kunt tikken? */
  wijsAan?: boolean;
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

  /* Het eerste plaatje dat nog niet weg is; daar wijst het handje naar. */
  const eersteVrij = Array.from({ length: aantal }, (_, i) => i).find((i) => !weg.includes(i)) ?? 0;

  return (
    <span className="flex flex-col items-start gap-1.5">
      {rijen.map((rij, r) => (
        <span key={r} className="flex items-center gap-1.5">
          {rij.map((i) => {
            const gekruist = weg.includes(i);
            const gedimd = gekruist || grijs.includes(i);
            const weggeschoven = vertrokken.includes(i);
            /* Een pijltje op de plek waar het felle deel ophoudt. */
            const pijlHier = verschoven && grijs.includes(i) && !grijs.includes(i - 1);

            const plaatje = (
              <span
                className={`relative block ${MATEN[maat]} transition-all duration-500 ${
                  gedimd ? ERAFSTIJL : ""
                } ${
                  beweegGrijs && grijs.includes(i) ? "motion-safe:animate-eraf-zakt" : ""
                } ${weggeschoven ? "-translate-y-6 scale-50 opacity-0" : ""}`}
              >
                <Telplaatje naam={voorwerp} />
                {gekruist && <Kruis />}
              </span>
            );

            const pijl = pijlHier ? (
              <span aria-hidden="true" className="px-0.5 text-lg font-extrabold text-eraf">
                →
              </span>
            ) : null;

            if (!tikbaar) {
              return (
                <span key={i} className="flex items-center" aria-hidden="true">
                  {pijl}
                  <span className={verschoven && gedimd ? "ml-1.5" : ""}>{plaatje}</span>
                </span>
              );
            }

            return (
              <span key={i} className="relative flex items-center">
                {pijl}
                <button
                  type="button"
                  aria-label={`Plaatje ${i + 1}`}
                  aria-pressed={gekruist}
                  onClick={() => onTik?.(i)}
                  className="cursor-pointer rounded-xl border border-rand bg-kaart p-1 shadow-zacht transition active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-huisstijl"
                >
                  {plaatje}
                </button>
                {/* Het handje doet één keer voor dat je kunt tikken. */}
                {wijsAan && i === eersteVrij && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 motion-safe:animate-hand-wijs"
                  >
                    <Handje />
                  </span>
                )}
              </span>
            );
          })}
          {/* Het label hoort bij de laatste plaatjes, dus achter de laatste rij. */}
          {achteraan && r === rijen.length - 1 && <span className="ml-2">{achteraan}</span>}
        </span>
      ))}
    </span>
  );
}
