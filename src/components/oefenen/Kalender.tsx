"use client";

/**
 * Een maandkalender als rooster.
 *
 * ---------------------------------------------------------------------------
 * Een echte tabel
 * ---------------------------------------------------------------------------
 * `<table>` met `border-collapse`, net als de andere tabellen in Thuisles (zie
 * ONTWERPREGELS.md). Dat is hier niet alleen een kwestie van smaak: een
 * kalender is pas een kalender als 1 maart écht onder "zaterdag" staat. Met
 * losse vakjes in een raster verschuift dat zodra er een getal van twee cijfers
 * in staat, en dan klopt het antwoord niet meer met wat je ziet.
 *
 * Alle vakjes zijn even groot en even breed, de maandnaam staat erboven, de
 * week begint op maandag, en de dagen staan als kolomkoppen: ma di wo do vr za
 * zo. Lege vakjes vóór de eerste en ná de laatste dag blijven leeg.
 *
 * De kalender mag binnen zijn eigen vakje schuiven als het scherm smal is; de
 * kaart eronder schuift niet mee.
 */

import { DAGEN, DAGEN_KORT, MAANDEN, kalenderrijen } from "@/lib/tijd";

export function Kalender({
  jaar,
  maand,
  /** Welke dag gemarkeerd is als "vandaag". */
  vandaag = null,
  /** Welke dag het kind heeft aangetikt. */
  gekozen = null,
  /** Welke dag na het nakijken groen hoort te zijn. */
  juist = null,
  uit = false,
  onTik,
}: {
  jaar: number;
  maand: number;
  vandaag?: number | null;
  gekozen?: number | null;
  juist?: number | null;
  uit?: boolean;
  onTik?: (dag: number) => void;
}) {
  const rijen = kalenderrijen(jaar, maand);

  /* Even grote vakjes; het hele rooster staat gecentreerd in zijn vakje. */
  const HOKJE = "size-10 border-2 border-tabellijn p-0 text-center sm:size-11";

  return (
    <div className="w-full overflow-x-auto">
      <div className="mx-auto w-fit">
        <p className="mb-1.5 text-center text-base font-extrabold text-inkt">
          {MAANDEN[maand - 1]}
        </p>
        <table className="border-collapse">
          <thead>
            <tr>
              {DAGEN_KORT.map((kort, i) => (
                <th
                  key={kort}
                  scope="col"
                  abbr={DAGEN[i]}
                  className={`${HOKJE} bg-room text-xs font-semibold text-inkt-zacht`}
                >
                  {kort}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rijen.map((rij, r) => (
              <tr key={r}>
                {rij.map((dag, k) => {
                  if (dag === null) {
                    return <td key={k} className={`${HOKJE} bg-room/40`} aria-hidden="true" />;
                  }

                  const isVandaag = dag === vandaag;
                  const isGekozen = dag === gekozen;
                  const isJuist = uit && dag === juist;
                  const isFout = uit && isGekozen && dag !== juist;

                  const vulling = isJuist
                    ? "bg-groen-zacht text-groen-diep"
                    : isFout
                      ? "bg-roze-zacht text-roze"
                      : isGekozen
                        ? "bg-huisstijl-zacht text-huisstijl-donker"
                        : isVandaag
                          ? "bg-geel-zacht text-inkt"
                          : "bg-kaart text-inkt";

                  const inhoud = (
                    <span className="grid size-full place-items-center text-sm font-extrabold tabular-nums">
                      {dag}
                    </span>
                  );

                  return (
                    <td key={k} className={`${HOKJE} ${vulling}`}>
                      {onTik ? (
                        <button
                          type="button"
                          disabled={uit}
                          aria-label={`${dag} ${MAANDEN[maand - 1]}`}
                          aria-pressed={isGekozen}
                          onClick={() => onTik(dag)}
                          className="size-full disabled:cursor-not-allowed"
                        >
                          {inhoud}
                        </button>
                      ) : (
                        inhoud
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * De jaarcirkel: twaalf genummerde vakjes op een cirkel, januari bovenaan.
 *
 * Hulp bij "Maanden aanvullen" (WERKPLAN.md). Elk vakje staat op zijn eigen
 * punt op de cirkel, gecentreerd met `text-anchor` en `dominant-baseline`, dus
 * januari staat precies boven het midden en juli precies eronder. De namen
 * staan buiten de nummers, op een ruimere straal, zodat ze elkaar niet raken.
 */
/*
  De gewone Nederlandse afkortingen. Niet de eerste drie letters: dan wordt
  maart "maa", en dat leest een kind niet als een maand.
*/
const MAANDKORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export function Jaarcirkel({ nadruk = null }: { nadruk?: number | null }) {
  const MIDDEN = 100;

  return (
    <svg
      viewBox="0 0 200 200"
      className="size-56 shrink-0 sm:size-64"
      role="img"
      aria-label="De twaalf maanden op een cirkel, januari bovenaan"
    >
      <circle
        cx={MIDDEN}
        cy={MIDDEN}
        r={62}
        fill="none"
        stroke="var(--color-tabellijn)"
        strokeWidth={2}
      />
      {MAANDEN.map((naam, i) => {
        const hoek = ((i * 30 - 90) * Math.PI) / 180;
        /* Afgerond, zodat server en browser precies hetzelfde tekenen. */
        const rond = (n: number) => Math.round(n * 100) / 100;
        const x = rond(MIDDEN + Math.cos(hoek) * 62);
        const y = rond(MIDDEN + Math.sin(hoek) * 62);
        const buitenX = rond(MIDDEN + Math.cos(hoek) * 89);
        const buitenY = rond(MIDDEN + Math.sin(hoek) * 89);
        const op = nadruk === i + 1;
        return (
          <g key={naam}>
            <circle
              cx={x}
              cy={y}
              r={12}
              fill={op ? "var(--color-huisstijl-zacht)" : "var(--color-geel-zacht)"}
              stroke={op ? "var(--color-huisstijl)" : "var(--color-geel)"}
              strokeWidth={2}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={800}
              fill="var(--color-inkt)"
            >
              {i + 1}
            </text>
            <text
              x={buitenX}
              y={buitenY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill="var(--color-inkt-zacht)"
            >
              {MAANDKORT[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
