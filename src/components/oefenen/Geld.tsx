"use client";

/**
 * Munten, briefjes en prijskaartjes.
 *
 * Geen foto's van echt geld maar simpele eigen tekeningen met de waarde erop
 * (WERKPLAN.md). De kleuren lijken op echt geld: koper voor 1, 2 en 5 cent,
 * goud voor 10, 20 en 50 cent, zilver met goud voor 1 en 2 euro, en elk briefje
 * zijn eigen kleur.
 *
 * Alles is een SVG met een vaste verhouding en een vaste maat per soort, zodat
 * een munt nooit uitrekt en een rijtje geld altijd even hoog is. Het getal
 * staat gecentreerd op zijn eigen punt (`text-anchor` en `dominant-baseline`),
 * net als de cijfers op de klok.
 */

import { Telplaatje } from "@/components/oefenen/Telplaatjes";
import { bedrag, groterEerst, isBriefje, naamVan } from "@/lib/geld";

const KOPER = { vulling: "#d08a55", rand: "#8f5631" };
const GOUD = { vulling: "#e6c35a", rand: "#a8842c" };
const ZILVER = { vulling: "#d5dade", rand: "#8c949b" };
const INKT = "#2b2118";

/** De kleur van elk briefje. */
const BRIEFKLEUR: Record<number, string> = {
  500: "#b3bbb0",
  1000: "#e9897a",
  2000: "#82a5e2",
  5000: "#f0ad5e",
  10000: "#7fc28a",
  20000: "#e8d370",
  50000: "#b296d8",
};

/** Hoe groot een munt is, in pixels bij de gewone maat. Iets verschillend, zoals echt. */
const MUNTMAAT: Record<number, number> = {
  1: 36,
  2: 39,
  5: 42,
  10: 40,
  20: 44,
  50: 47,
  100: 46,
  200: 50,
};

export function Geldstuk({ cent, maat = "gewoon" }: { cent: number; maat?: "klein" | "gewoon" }) {
  const schaal = maat === "klein" ? 0.8 : 1;

  if (isBriefje(cent)) {
    const breed = Math.round(78 * schaal);
    const hoog = Math.round(44 * schaal);
    return (
      <svg
        viewBox="0 0 78 44"
        width={breed}
        height={hoog}
        role="img"
        aria-label={naamVan(cent)}
        className="shrink-0"
      >
        <rect x={1.5} y={1.5} width={75} height={41} rx={5} fill={BRIEFKLEUR[cent] ?? "#ccc"} stroke={INKT} strokeOpacity={0.35} strokeWidth={2} />
        <rect x={6} y={6} width={66} height={32} rx={3} fill="none" stroke={INKT} strokeOpacity={0.15} strokeWidth={1.5} />
        <text x={39} y={21} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={INKT}>
          {cent / 100}
        </text>
        <text x={39} y={35} textAnchor="middle" dominantBaseline="central" fontSize={7.5} fontWeight={800} fill={INKT} letterSpacing={1}>
          EURO
        </text>
      </svg>
    );
  }

  const px = Math.round((MUNTMAAT[cent] ?? 44) * schaal);
  const euro = cent >= 100;
  const buiten = cent === 100 ? GOUD : cent === 200 ? ZILVER : cent >= 10 ? GOUD : KOPER;
  const binnen = cent === 100 ? ZILVER : cent === 200 ? GOUD : buiten;

  return (
    <svg viewBox="0 0 50 50" width={px} height={px} role="img" aria-label={naamVan(cent)} className="shrink-0">
      <circle cx={25} cy={25} r={23.5} fill={buiten.vulling} stroke={buiten.rand} strokeWidth={2} />
      {/* De euromunten hebben een binnenste in een andere kleur, zoals echt. */}
      <circle cx={25} cy={25} r={euro ? 16.5 : 19.5} fill={binnen.vulling} stroke={binnen.rand} strokeOpacity={0.5} strokeWidth={1.2} />
      <text x={25} y={22} textAnchor="middle" dominantBaseline="central" fontSize={euro ? 17 : 15} fontWeight={800} fill={INKT}>
        {euro ? cent / 100 : cent}
      </text>
      <text x={25} y={34} textAnchor="middle" dominantBaseline="central" fontSize={6.5} fontWeight={800} fill={INKT}>
        {euro ? "EURO" : "CENT"}
      </text>
    </svg>
  );
}

/**
 * Een groepje geld: grootste eerst, zoals je het neerlegt om te tellen.
 *
 * Het groepje mag over meer regels lopen; de volgorde blijft van groot naar
 * klein, en de plek van een munt doet er bij tellen niet toe.
 */
export function Geldgroep({
  stukken,
  maat = "gewoon",
  gesorteerd = true,
}: {
  stukken: number[];
  maat?: "klein" | "gewoon";
  /** Uit = in de volgorde waarin ze binnenkomen, bijvoorbeeld bij tellen. */
  gesorteerd?: boolean;
}) {
  const rij = gesorteerd ? groterEerst(stukken) : stukken;
  return (
    <div
      role="group"
      aria-label={rij.map(naamVan).join(", ")}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {rij.map((s, i) => (
        <Geldstuk key={i} cent={s} maat={maat} />
      ))}
    </div>
  );
}

/** Een voorwerp met een prijskaartje ernaast. */
export function Prijskaartje({ voorwerp, prijs }: { voorwerp: string | null; prijs: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {voorwerp && (
        <span aria-hidden="true" className="block size-16 shrink-0 sm:size-20">
          <Telplaatje naam={voorwerp} />
        </span>
      )}
      <span className="relative inline-flex items-center rounded-xl border-2 border-inkt/30 bg-geel-zacht py-1.5 pl-6 pr-3 text-2xl font-extrabold tabular-nums text-inkt">
        {/* Het gaatje van het kaartje. */}
        <span aria-hidden="true" className="absolute left-2 top-1/2 size-2 -translate-y-1/2 rounded-full border-2 border-inkt/30 bg-kaart" />
        {bedrag(prijs)}
      </span>
    </div>
  );
}
