"use client";

/**
 * De telfiguren: vrolijke plaatjes met een telbaar aantal onderdelen.
 *
 * Gebruikt door het generator-type "Tellen en slepen". Elk figuur tekent
 * hetzelfde gegeven op een andere manier: zes blaadjes aan een bloem, zes
 * appels in een boom, zes ballonnen aan een touwtje. Zo blijft de vraag
 * dezelfde terwijl het plaatje afwisselt.
 *
 * ---------------------------------------------------------------------------
 * Een soort erbij
 * ---------------------------------------------------------------------------
 * Twee plekken, allebei op dezelfde naam:
 *   1. de woorden in `lib/telsoorten.ts` — wat je telt en hoe het geheel heet;
 *   2. de tekening hieronder in `TEKENINGEN`.
 *
 * Daarna komt de soort vanzelf in de afwisseling en in de keuzelijst in het
 * beheer; de generator hoeft er niets voor te weten.
 *
 * Elke tekenfunctie krijgt het aantal en levert de onderdelen als SVG. Het
 * omhulsel eromheen (vierkant, schaduw, achtergrond) is voor alle soorten
 * gelijk en staat in `Telfiguur`.
 */

import { telsoortWoorden } from "@/lib/telsoorten";
import type { Figuur } from "@/lib/generatoren/soort";

/** Het vierkant waarin elk figuur getekend wordt. */
const VLAK = 100;

/** Kleuren uit de huisstijl, zodat de figuren bij de rest passen. */
const KLEUR = {
  groen: "#1f9d63",
  groenDonker: "#17784c",
  roze: "#e4607f",
  rozeDonker: "#c14664",
  geel: "#f2bb2e",
  oranje: "#e4832a",
  viool: "#5b3fd6",
  violetLicht: "#7c5cff",
  lucht: "#3577cc",
  bruin: "#c08a4a",
  bruinDonker: "#8f6431",
  rood: "#e0483c",
  inkt: "#2c2545",
  room: "#fdf6ea",
};

/**
 * Onderdelen rond een middelpunt verdelen.
 *
 * Gebruikt door de bloem en het lieveheersbeestje. Begint bovenaan en gaat met
 * de klok mee, zodat tellen vanaf de bovenkant vanzelf gaat.
 */
function rondom(aantal: number, straal: number, midX: number, midY: number) {
  return Array.from({ length: aantal }, (_, i) => {
    const hoek = (i / aantal) * Math.PI * 2 - Math.PI / 2;
    return { x: midX + Math.cos(hoek) * straal, y: midY + Math.sin(hoek) * straal, i };
  });
}

/** Onderdelen netjes over een rooster verdelen, hoogstens vier op een rij. */
function rooster(aantal: number, breedte: number, top: number, hoogte: number) {
  const perRij = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(aantal))));
  const rijen = Math.ceil(aantal / perRij);
  return Array.from({ length: aantal }, (_, i) => {
    const rij = Math.floor(i / perRij);
    const kolom = i % perRij;
    const inRij = Math.min(perRij, aantal - rij * perRij);
    return {
      x: (breedte / (inRij + 1)) * (kolom + 1),
      y: top + (hoogte / (rijen + 1)) * (rij + 1),
      i,
    };
  });
}

/** Tekent de onderdelen. `opgelicht` is er tot en met dit onderdeel geteld. */
export type Tekening = (aantal: number, opgelicht: number) => React.ReactNode;

/** Een onderdeel dat al geteld is, krijgt een gouden ring. */
function ring(x: number, y: number, r: number) {
  return <circle cx={x} cy={y} r={r} fill="none" stroke={KLEUR.geel} strokeWidth={3} />;
}

export const TEKENINGEN: Record<string, Tekening> = {
  bloem: (aantal, opgelicht) => (
      <>
        <rect x={48} y={58} width={4} height={36} rx={2} fill={KLEUR.groenDonker} />
        {rondom(aantal, 22, 50, 46).map(({ x, y, i }) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={11} ry={13} fill={KLEUR.roze} stroke={KLEUR.rozeDonker} strokeWidth={2} />
            {i < opgelicht && ring(x, y, 15)}
          </g>
        ))}
        <circle cx={50} cy={46} r={10} fill={KLEUR.geel} stroke={KLEUR.oranje} strokeWidth={2} />
      </>
    ),

  boom: (aantal, opgelicht) => (
      <>
        <rect x={45} y={62} width={10} height={32} rx={4} fill={KLEUR.bruin} />
        <circle cx={50} cy={44} r={34} fill={KLEUR.groen} stroke={KLEUR.groenDonker} strokeWidth={2} />
        {rooster(aantal, VLAK, 18, 50).map(({ x, y, i }) => (
          <g key={i}>
            <circle cx={x} cy={y} r={7} fill={KLEUR.rood} stroke={KLEUR.rozeDonker} strokeWidth={1.5} />
            {i < opgelicht && ring(x, y, 10.5)}
          </g>
        ))}
      </>
    ),

  ballon: (aantal, opgelicht) => (
      <>
        {rooster(aantal, VLAK, 8, 52).map(({ x, y, i }) => (
          <g key={i}>
            <path d={`M${x} ${y + 11}C${x} ${y + 11} ${x} ${y + 40} 50 ${y + 52}`} stroke={KLEUR.inkt} strokeWidth={1.2} fill="none" opacity={0.45} />
            <ellipse cx={x} cy={y} rx={9} ry={11} fill={i % 2 ? KLEUR.lucht : KLEUR.violetLicht} stroke={KLEUR.viool} strokeWidth={1.5} />
            {i < opgelicht && ring(x, y, 13)}
          </g>
        ))}
      </>
    ),

  slinger: (aantal, opgelicht) => {
      const punt = (cx: number, cy: number) =>
        Array.from({ length: 5 }, (_, k) => {
          const h = (k / 5) * Math.PI * 2 - Math.PI / 2;
          const h2 = h + Math.PI / 5;
          return `${cx + Math.cos(h) * 9},${cy + Math.sin(h) * 9} ${cx + Math.cos(h2) * 4},${cy + Math.sin(h2) * 4}`;
        }).join(" ");
      return (
        <>
          <path d="M4 26C30 46 70 46 96 26" stroke={KLEUR.bruinDonker} strokeWidth={2} fill="none" />
          {Array.from({ length: aantal }, (_, i) => {
            const t = (i + 1) / (aantal + 1);
            const x = 4 + t * 92;
            const y = 26 + Math.sin(t * Math.PI) * 18 + 14;
            return (
              <g key={i}>
                <line x1={x} y1={y - 12} x2={x} y2={26 + Math.sin(t * Math.PI) * 18} stroke={KLEUR.bruinDonker} strokeWidth={1.2} />
                <polygon points={punt(x, y)} fill={KLEUR.geel} stroke={KLEUR.oranje} strokeWidth={1.5} />
                {i < opgelicht && ring(x, y, 12)}
              </g>
            );
          })}
        </>
      );
  },

  lieveheersbeestje: (aantal, opgelicht) => (
      <>
        <ellipse cx={50} cy={54} rx={34} ry={30} fill={KLEUR.rood} stroke={KLEUR.rozeDonker} strokeWidth={2} />
        <circle cx={50} cy={24} r={13} fill={KLEUR.inkt} />
        <line x1={50} y1={26} x2={50} y2={84} stroke={KLEUR.inkt} strokeWidth={2.5} />
        {rondom(aantal, 18, 50, 56).map(({ x, y, i }) => (
          <g key={i}>
            <circle cx={x} cy={y} r={6} fill={KLEUR.inkt} />
            {i < opgelicht && ring(x, y, 9.5)}
          </g>
        ))}
      </>
    ),
};

/** De tekening, met terugval zodat een onbekende naam nooit een leeg vak geeft. */
function tekening(naam: string): Tekening {
  return TEKENINGEN[naam] ?? TEKENINGEN.bloem;
}

/**
 * Eén telfiguur in een vierkant vlak.
 *
 * `opgelicht` is hoeveel onderdelen er al geteld zijn; die krijgen een gouden
 * ring. Daarmee kan de uitleg-animatie er één voor één doorheen lopen.
 */
export function Telfiguur({
  soort,
  aantal,
  opgelicht = 0,
  className = "",
}: {
  soort: string;
  aantal: number;
  opgelicht?: number;
  className?: string;
}) {
  const woorden = telsoortWoorden(soort);
  const teken = tekening(soort);
  return (
    <svg
      viewBox={`0 0 ${VLAK} ${VLAK}`}
      className={className}
      role="img"
      aria-label={`Een ${woorden.geheel} met ${aantal} ${aantal === 1 ? woorden.enkel : woorden.meervoud}`}
    >
      <rect x={1} y={1} width={VLAK - 2} height={VLAK - 2} rx={14} fill={KLEUR.room} />
      {teken(Math.max(0, aantal), opgelicht)}
    </svg>
  );
}

/** De hele rij figuren van één vraag. */
export function Telrij({
  figuur,
  opgelichtPerFiguur = [],
  className = "",
}: {
  figuur: Extract<Figuur, { soort: "telrij" }>;
  /** Per figuur hoeveel onderdelen er al geteld zijn. */
  opgelichtPerFiguur?: number[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-start justify-center gap-3 ${className}`}>
      {figuur.items.map((item, i) => (
        <Telfiguur
          key={i}
          soort={item.soort}
          aantal={item.aantal}
          opgelicht={opgelichtPerFiguur[i] ?? 0}
          className="h-24 w-24 drop-shadow-sm sm:h-28 sm:w-28"
        />
      ))}
    </div>
  );
}
