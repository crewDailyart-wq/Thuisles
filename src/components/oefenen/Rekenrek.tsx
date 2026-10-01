"use client";

/**
 * Het rekenrek: twee staafjes met tien kralen, vijf rode en vijf witte.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit onderdeel er is
 * ---------------------------------------------------------------------------
 * Het rekenrek is op school het model voor erbij en eraf. Een kind zet er
 * dertien kralen op, schuift er vijf weg en ziet dat er acht overblijven. Dat
 * zien gaat vooraf aan het kale rekenen, en daarom staat het rek bij de eerste
 * sommen van een oefening naast de som.
 *
 * Het staat los van het domein Erafsommen, zodat elk volgend domein — erbij,
 * verdubbelen, splitsen — hetzelfde rek kan gebruiken.
 *
 * ---------------------------------------------------------------------------
 * Hoe het werkt
 * ---------------------------------------------------------------------------
 * Elke kraal staat links (doet mee) of rechts (weggeschoven), net als bij een
 * echt rek. De kralen die bij de som horen staan links; de rest staat al aan
 * de rechterkant en is lichter, want die doen niet mee. Tikt het kind op een
 * kraal links, dan schuift hij naar rechts; tikken op een weggeschoven kraal
 * haalt hem terug. Een misklik is dus zo hersteld.
 *
 * De kralen zelf — het verloop, het schaduwtje, het glansplekje — komen uit
 * `Figuurtekening`, dezelfde als bij Kralen tellen. Daar is niets aan
 * veranderd; dit rek gebruikt ze alleen ook.
 */

import {
  Kraaltje,
  Kraalverloop,
  REKENREK_KLEUREN,
} from "@/components/oefenen/Figuurtekening";

/** Maatvoering, op één plek zodat alles meeschaalt. */
const MAAT = {
  straal: 13,
  afstand: 32,
  post: 9,
  balk: 9,
  binnen: 10,
  rijhoogte: 52,
};

const PER_RIJ = 10;
const PER_KLEUR = 5;
const RIJEN = 2;

/** Hoeveel kralen er op het hele rek zitten: altijd twintig. */
export const REKENREK_KRALEN = PER_RIJ * RIJEN;

export function Rekenrek({
  /** Hoeveel kralen er meedoen; de rest staat lichter aan de rechterkant. */
  aantal,
  /** Welke kralen het kind heeft weggeschoven. De ouder houdt dit bij. */
  weg,
  tikbaar = false,
  onTik,
}: {
  aantal: number;
  weg: number[];
  tikbaar?: boolean;
  onTik?: (nummer: number) => void;
}) {
  const [rood, wit] = REKENREK_KLEUREN;

  const binnenBreedte = MAAT.binnen * 2 + (PER_RIJ - 1) * MAAT.afstand + MAAT.straal * 2;
  const breedte = MAAT.post * 2 + binnenBreedte;
  const hoogte = MAAT.balk * 2 + RIJEN * MAAT.rijhoogte;

  /** De x van plek `k` op een staafje, geteld vanaf links. */
  const xVan = (k: number) => MAAT.post + MAAT.binnen + MAAT.straal + k * MAAT.afstand;

  /**
   * Waar elke kraal nu staat.
   *
   * Per staafje schuiven de kralen die meedoen naar links aan elkaar, en de
   * kralen die eraf zijn naar rechts. Ze houden hun eigen kleur en hun eigen
   * volgorde, dus de vijf rode en vijf witte blijven herkenbaar.
   */
  const plekken: { x: number; y: number; links: boolean; meedoen: boolean }[] = [];
  for (let rij = 0; rij < RIJEN; rij++) {
    const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
    let linksGeteld = 0;
    let rechtsGeteld = 0;
    for (let kolom = 0; kolom < PER_RIJ; kolom++) {
      const nummer = rij * PER_RIJ + kolom;
      const meedoen = nummer < aantal;
      const links = meedoen && !weg.includes(nummer);
      const x = links
        ? xVan(linksGeteld++)
        : xVan(PER_RIJ - 1 - rechtsGeteld++);
      plekken.push({ x, y, links, meedoen });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${breedte} ${hoogte}`}
      className="h-auto w-full"
      role={tikbaar ? "group" : "img"}
      aria-label={`Een rekenrek met ${aantal} kralen aan de linkerkant.`}
    >
      <defs>
        <Kraalverloop id="rekenrek-rood" kleur={rood} />
        <Kraalverloop id="rekenrek-wit" kleur={wit} />
      </defs>

      {/* Het houten frame, net als bij Kralen tellen. */}
      <g>
        <rect x={2} y={2} width={breedte - 4} height={hoogte - 4} rx={9} fill="#fdf6ea" />
        <rect x={0} y={0} width={breedte} height={MAAT.balk + 3} rx={5} fill="#d29a55" />
        <rect x={0} y={0} width={breedte} height={4} rx={2} fill="#e5b57c" />
        <rect
          x={0}
          y={hoogte - MAAT.balk - 3}
          width={breedte}
          height={MAAT.balk + 3}
          rx={5}
          fill="#c08a4a"
        />
        <rect x={0} y={0} width={MAAT.post} height={hoogte} rx={4} fill="#d29a55" />
        <rect
          x={breedte - MAAT.post}
          y={0}
          width={MAAT.post}
          height={hoogte}
          rx={4}
          fill="#c08a4a"
        />
        <rect
          x={2}
          y={2}
          width={breedte - 4}
          height={hoogte - 4}
          rx={9}
          fill="none"
          stroke="#a8763b"
          strokeWidth={1.6}
        />
      </g>

      {/* De twee staafjes. */}
      {Array.from({ length: RIJEN }, (_, rij) => {
        const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
        return (
          <line
            key={rij}
            x1={MAAT.post}
            y1={y}
            x2={breedte - MAAT.post}
            y2={y}
            stroke="#b3aa9c"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        );
      })}

      {plekken.map((plek, nummer) => {
        const kleur = nummer % PER_RIJ < PER_KLEUR ? rood : wit;
        const verloopId = kleur === rood ? "rekenrek-rood" : "rekenrek-wit";
        const magTikken = tikbaar && plek.meedoen;
        return (
          <g
            key={nummer}
            transform={`translate(${plek.x} ${plek.y})`}
            className={`[transition:transform_350ms_ease-in-out] ${
              magTikken ? "cursor-pointer" : ""
            }`}
            role={magTikken ? "button" : undefined}
            tabIndex={magTikken ? 0 : undefined}
            aria-label={magTikken ? `Kraal ${nummer + 1}` : undefined}
            aria-pressed={magTikken ? !plek.links : undefined}
            onClick={magTikken ? () => onTik?.(nummer) : undefined}
            onKeyDown={
              magTikken
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTik?.(nummer);
                    }
                  }
                : undefined
            }
          >
            <Kraaltje
              straal={MAAT.straal}
              kleur={kleur}
              verloopId={verloopId}
              dof={!plek.meedoen}
            />
            {/* Ruim tikvlak, ook op een tablet met dikke vingers. */}
            {magTikken && <circle cx={0} cy={0} r={MAAT.straal + 6} fill="transparent" />}
          </g>
        );
      })}
    </svg>
  );
}
