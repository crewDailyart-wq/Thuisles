"use client";

/**
 * Blokjes, zoals kinderen ze op school gebruiken.
 *
 * In rijen van tien getekend, wat het gevoel van een twintigveld geeft. Het
 * kind kan erop tikken om mee te tellen.
 *
 * De toestand van een blokje is niet alleen aan de kleur te zien, maar ook aan
 * de vorm: een deel krijgt een stip, een weggehaald blokje wordt een gestippeld
 * leeg vlak, een geteld blokje krijgt een dikke rand. Zo blijft het te volgen
 * voor kinderen die kleuren moeilijk uit elkaar houden.
 *
 * Moet het kind tellen, dan pulseren de blokjes zachtjes en wijst er een handje
 * naar het eerste blokje. Dat handje herhaalt zichzelf zolang er nog niet is
 * getikt, en verdwijnt zodra het kind begint.
 */

import type { Bloktoestand } from "@/lib/generatoren/uitlegscript";

const KLEUR: Record<Bloktoestand, { vul: string; rand: string; dik: number }> = {
  normaal: { vul: "#eee9ff", rand: "#5b3fd6", dik: 2 },
  deel: { vul: "#c9bcf5", rand: "#46299f", dik: 2.5 },
  weg: { vul: "#ffffff", rand: "#b9b2c9", dik: 2 },
  rest: { vul: "#dcf4e8", rand: "#1f9d63", dik: 2.5 },
  geteld: { vul: "#1f9d63", rand: "#17784c", dik: 3 },
};

const MAAT = 22;
const RUIMTE = 5;

export function Blokjes({
  blokjes,
  perRij,
  bijschrift,
  telbaar = false,
  wijsAan = false,
  wijsSleutel = 0,
  onTik,
}: {
  blokjes: Bloktoestand[];
  perRij: number;
  bijschrift?: string;
  /** Mag het kind tikken om mee te tellen? */
  telbaar?: boolean;
  /** Toon het wijzende handje bij het eerste blokje. */
  wijsAan?: boolean;
  /** Verandert bij elke herhaling, zodat het handje opnieuw beweegt. */
  wijsSleutel?: number;
  onTik?: (index: number) => void;
}) {
  // Het eerste blokje dat aangetikt mag worden; daar wijst het handje naar.
  const eersteTelbaar = telbaar ? blokjes.findIndex((t) => t === "rest") : -1;
  const kolommen = Math.min(perRij, blokjes.length || 1);
  const rijen = Math.ceil(blokjes.length / perRij);
  const breedte = kolommen * MAAT + (kolommen - 1) * RUIMTE;
  const hoogte = rijen * MAAT + (rijen - 1) * RUIMTE + (bijschrift ? 34 : 0);

  return (
    <svg
      viewBox={`0 0 ${Math.max(breedte, 40)} ${Math.max(hoogte, 40)}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${blokjes.length} blokjes`}
    >
      {bijschrift && (
        <text
          x={breedte / 2}
          y={24}
          textAnchor="middle"
          className="fill-[#2c2545] text-[26px] font-extrabold"
        >
          {bijschrift}
        </text>
      )}

      {blokjes.map((toestand, i) => {
        const kolom = i % perRij;
        const rij = Math.floor(i / perRij);
        const x = kolom * (MAAT + RUIMTE);
        const y = rij * (MAAT + RUIMTE) + (bijschrift ? 34 : 0);
        const stijl = KLEUR[toestand];
        const magTikken = telbaar && toestand === "rest";

        return (
          <g
            key={i}
            onClick={magTikken ? () => onTik?.(i) : undefined}
            className={magTikken ? "cursor-pointer" : undefined}
            style={{ transition: "opacity 200ms" }}
            opacity={toestand === "weg" ? 0.45 : 1}
          >
            <rect
              x={x}
              y={y}
              width={MAAT}
              height={MAAT}
              rx={5}
              fill={stijl.vul}
              stroke={stijl.rand}
              strokeWidth={stijl.dik}
              strokeDasharray={toestand === "weg" ? "4 3" : undefined}
              className={magTikken ? "animate-blok-klaar" : undefined}
              style={
                magTikken
                  ? { transformBox: "fill-box", transformOrigin: "center" }
                  : undefined
              }
            />

            {/* Vormverschil, zodat kleur niet het enige onderscheid is. */}
            {toestand === "deel" && (
              <circle cx={x + MAAT / 2} cy={y + MAAT / 2} r={4} fill="#46299f" />
            )}
            {toestand === "geteld" && (
              <path
                d={`M${x + 6} ${y + 11.5} l3.5 3.5 L${x + 16.5} ${y + 7.5}`}
                stroke="#ffffff"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}

            {/* Groot tikvlak, ook op een tablet met dikke vingers. */}
            {magTikken && (
              <rect
                x={x - RUIMTE / 2}
                y={y - RUIMTE / 2}
                width={MAAT + RUIMTE}
                height={MAAT + RUIMTE}
                fill="transparent"
              />
            )}
          </g>
        );
      })}

      {/* Het wijzende handje bij het eerste blokje dat geteld mag worden. */}
      {wijsAan && eersteTelbaar >= 0 && (
        <Wijshandje
          key={wijsSleutel}
          x={(eersteTelbaar % perRij) * (MAAT + RUIMTE) + MAAT / 2}
          y={
            Math.floor(eersteTelbaar / perRij) * (MAAT + RUIMTE) +
            (bijschrift ? 34 : 0) +
            MAAT
          }
        />
      )}
    </svg>
  );
}

/**
 * Een handje met een uitgestoken vinger dat naar boven wijst.
 *
 * Let op de twee lagen: de plaatsing staat op de buitenste groep, de beweging
 * op de binnenste. In SVG overschrijft een animatie met CSS namelijk de
 * plaatsing, en dan springt het handje naar de linkerbovenhoek.
 */
function Wijshandje({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 7} ${y + 3})`} aria-hidden="true">
      <g className="animate-hand-wijs pointer-events-none">
      <path
        d="M7 2 C8.6 2 9.6 3.2 9.6 4.8 L9.6 10 L11.4 10 C13.2 10 14.2 11.2 14.2 12.8
           L14.2 17 C14.2 20.4 11.8 22.6 8.6 22.6 L6.4 22.6 C3.4 22.6 1.2 20.6 1.2 17.6
           L1.2 12.4 C1.2 11 2 10.2 3.2 10.2 C3.9 10.2 4.4 10.5 4.4 10.5 L4.4 4.8
           C4.4 3.2 5.4 2 7 2 Z"
        fill="#f7d774"
        stroke="#2c2545"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      </g>
    </g>
  );
}
