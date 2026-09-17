"use client";

/**
 * Vos gaat vissen: welk getal is het grootste of het kleinste?
 *
 * Drie of vier vissen zwemmen rustig in het water, elk met een groot getal op
 * zijn buik. Het kind tikt de vis aan die het zoekt. Goed: Vos haalt hem op.
 * Fout: de vis glipt met een plons weg.
 *
 * ---------------------------------------------------------------------------
 * Waarom vissen en geen rijtje getallen
 * ---------------------------------------------------------------------------
 * Twee getallen vergelijken is voor een kind van zeven geen som maar een
 * keuze, en een keuze maak je liever tussen dingen dan tussen cijfers. Door de
 * getallen op vissen te zetten wordt "welke is het grootst" een vraag die het
 * kind snapt voordat het de cijfers leest. De vissen zwemmen bovendien door
 * elkaar, dus de volgorde op het scherm helpt niet mee — het moet echt kijken.
 *
 * ---------------------------------------------------------------------------
 * De vis is de knop
 * ---------------------------------------------------------------------------
 * Er staan geen antwoordknoppen onder de vraag: de vissen zíjn de knoppen. Dat
 * scheelt een stap (kijken, dan zoeken welk getal eronder staat) en het is hoe
 * een spelletje werkt: je tikt op wat je bedoelt.
 */

import { useRef } from "react";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

export type Vis = { getal: number };

const RAND = "#25384a";
const RANDDIKTE = 4;

/** Vrolijke viskleuren, in vaste volgorde zodat een vis zijn kleur houdt. */
const KLEUREN = [
  { lijf: "#ff9f43", vin: "#ef7d18" },
  { lijf: "#ffd45e", vin: "#eeb52a" },
  { lijf: "#ff8fb1", vin: "#ef6d96" },
  { lijf: "#7fd6c1", vin: "#43b9a0" },
];

/**
 * Eén vis, met zijn getal op zijn buik.
 *
 * Dik omrand als in een tekenfilm, met een glansje op zijn rug en een
 * luchtbelletje bij zijn bek. Het getal staat groot en donker op een licht
 * vlak: dat moet leesbaar blijven terwijl hij beweegt.
 */
function Visje({ getal, kleur }: { getal: number; kleur: number }) {
  const k = KLEUREN[kleur % KLEUREN.length];

  return (
    <svg viewBox="0 0 160 100" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Staart */}
      <path
        d="M18 50 L2 24 Q10 50 2 76 Z"
        fill={k.vin}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* Rugvin */}
      <path
        d="M70 16 Q84 -2 100 16 Z"
        fill={k.vin}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* Lijf */}
      <ellipse
        cx="82"
        cy="50"
        rx="64"
        ry="34"
        fill={k.lijf}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
      />
      {/* Glans op de rug */}
      <path d="M52 26 Q86 14 118 28 Q86 22 56 34 Z" fill="#ffffff" opacity="0.45" />

      {/* Het getal, op een licht vlak zodat het altijd leesbaar blijft. */}
      <rect x="44" y="30" width="72" height="40" rx="14" fill="#fff8ec" opacity="0.92" />
      <text
        x="80"
        y="62"
        textAnchor="middle"
        fontSize="34"
        fontWeight="800"
        fill={RAND}
      >
        {getal}
      </text>

      {/* Oog en bek */}
      <circle cx="134" cy="40" r="7" fill="#fff8ec" stroke={RAND} strokeWidth={RANDDIKTE * 0.7} />
      <circle cx="136" cy="40" r="3" fill={RAND} />
      <path d="M150 52 q-6 6 0 12" fill="none" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} strokeLinecap="round" />

      {/* Luchtbelletje */}
      <circle cx="156" cy="30" r="5" fill="#ffffff" opacity="0.65" stroke={RAND} strokeWidth="2" />
    </svg>
  );
}

/** Waar de vissen zwemmen: verdeeld over het water, nooit op elkaar. */
function visPlekken(aantal: number): { x: number; y: number }[] {
  const n = Math.max(1, aantal);
  const breedte = n <= 3 ? 30 : 26;
  const gat = (100 - 12 - n * breedte) / Math.max(1, n - 1);
  return Array.from({ length: n }, (_, i) => ({
    x: 6 + i * (breedte + gat),
    /* Om en om hoger en lager: dat zwemt, en de rij helpt niet mee met kiezen. */
    y: i % 2 === 0 ? 14 : 40,
  }));
}

/**
 * Het hele vijvertje, met de vissen als knoppen.
 *
 * Bij een goed antwoord gaat de gekozen vis omhoog, het water uit. Bij een fout
 * glipt hij juist weg — dat is geen straf maar een aanwijzing: deze was het
 * niet, kijk nog eens.
 */
export function Visvijver({
  vissen,
  gekozen,
  fase = "bezig",
  markeer = true,
  vos = { vangend: null, wachtend: null, blij: null },
  onKies,
}: {
  vissen: Vis[];
  /** De plek van de aangetikte vis, als tekst; leeg als er nog niets is gekozen. */
  gekozen: string;
  fase?: "bezig" | "goed" | "fout";
  /** Groep 3-4: een foute keuze kleurt rood. */
  markeer?: boolean;
  vos?: Voshoudingen;
  onKies?: (waarde: string) => void;
}) {
  const plekken = visPlekken(vissen.length);
  const uit = fase !== "bezig";
  const breedte = vissen.length <= 3 ? 30 : 26;

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  return (
    <div ref={buitenRef} className="mx-auto w-full max-w-xl">
      <div
        ref={vakRef}
        className="relative w-full overflow-hidden rounded-groot border-2 border-rand bg-[#bfe8f7] shadow-op"
      >
        {/* De waterlijn: alles eronder is water, erboven is lucht. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[22%] bg-[#eaf7fd]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[22%] h-[3%] bg-[#8fd4ee]"
        />

        <div ref={vlakRef} className="relative w-full" style={{ aspectRatio: "100 / 62" }}>
          {vissen.map((vis, i) => {
            const plek = plekken[i];
            const dezeGekozen = gekozen === String(i);
            const goedGekozen = fase === "goed" && dezeGekozen;
            const foutGekozen = fase === "fout" && dezeGekozen && markeer;

            return (
              <button
                key={i}
                type="button"
                disabled={uit}
                onClick={() => onKies?.(String(i))}
                aria-label={`Vis met ${vis.getal}`}
                className={`absolute transition-transform duration-500 ease-out disabled:cursor-not-allowed ${
                  goedGekozen
                    ? "-translate-y-[45%] scale-110"
                    : foutGekozen
                      ? "translate-x-[30%] opacity-0"
                      : dezeGekozen
                        ? "scale-105"
                        : ""
                } ${
                  !uit ? "motion-safe:animate-vis-deint hover:scale-105" : ""
                } focus:outline-none focus-visible:ring-4 focus-visible:ring-huisstijl`}
                style={{
                  left: `${plek.x}%`,
                  top: `${(plek.y / 62) * 100}%`,
                  width: `${breedte}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <Visje getal={vis.getal} kleur={i} />
              </button>
            );
          })}

          {/*
            Vos op de kant, met zijn hengel.

            Rechtsonder, buiten het water: hij hoort niet bij de vissen die het
            kind moet vergelijken, en hij mag er dus ook nooit eentje bedekken.
          */}
          {vos.vangend && (
            <div
              ref={vosRef}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 right-[2%] w-[20%]"
            >
              <Vosbeeld houdingen={vos} stand={fase === "goed" ? "blij" : "wachtend"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dezelfde vissen in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De vissen op een rij, van klein naar groot.
 *
 * In de uitleg zwemmen ze niet meer door elkaar maar liggen ze op volgorde.
 * Dan is met één blik te zien welke de grootste is — en dat is precies wat het
 * kind zelf moet leren doen: niet raden, maar ordenen.
 */
export function Uitlegvissen({
  vissen,
  nadruk = null,
  bijschrift,
}: {
  vissen: Vis[];
  /** Welke vis oplicht; de index in deze gesorteerde rij. */
  nadruk?: number | null;
  bijschrift?: string;
}) {
  const opVolgorde = [...vissen].sort((a, b) => a.getal - b.getal);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full max-w-sm items-end justify-center gap-1 rounded-groot border-2 border-rand bg-[#bfe8f7] p-3 shadow-op">
        {opVolgorde.map((vis, i) => (
          <span
            key={i}
            className={`block w-full transition ${nadruk === i ? "scale-110" : nadruk === null ? "" : "opacity-40"}`}
          >
            <Visje getal={vis.getal} kleur={vissen.findIndex((v) => v.getal === vis.getal)} />
          </span>
        ))}
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
