"use client";

/**
 * Welke mand? — een getal herkennen in een hoeveelheid.
 *
 * Boven staat een getal, eronder staan drie of vier manden met spulletjes. Het
 * kind tikt de mand aan waar er precies zoveel in zitten.
 *
 * ---------------------------------------------------------------------------
 * Wat hier geoefend wordt
 * ---------------------------------------------------------------------------
 * Niet tellen, maar koppelen: dit cijfer hoort bij zóveel dingen. Een kind dat
 * los kan tellen en los de cijfers kent, heeft die brug nog niet automatisch
 * gelegd. Daarom staat het getal groot en los bovenaan, en moet het kind zelf
 * de hoeveelheid erbij zoeken.
 *
 * De manden verschillen met opzet maar één of twee dingetjes van elkaar. Zou
 * de ene mand drie en de andere twaalf hebben, dan is het geen tellen meer maar
 * kijken welke stapel groter is.
 */

import { useRef } from "react";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";
import { Blokje } from "@/components/oefenen/Mabblokken";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

export type Mandsoort = "telplaatjes" | "kralen" | "blokken";

const RAND = "#4a3524";
const RANDDIKTE = 4;

/** Vrolijke kraalkleuren, in vaste volgorde. */
const KRAALKLEUREN = ["#ef6f6c", "#f2b134", "#5bc0a5", "#6aa9de", "#c58ee0"];

/** Eén ding in de mand: een getekend plaatje, een kraal of een blokje. */
function Ding({ soort, plaatje, nummer }: { soort: Mandsoort; plaatje: string; nummer: number }) {
  if (soort === "blokken") return <Blokje />;
  if (soort === "telplaatjes") return <Telplaatje naam={plaatje} />;

  const kleur = KRAALKLEUREN[nummer % KRAALKLEUREN.length];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <circle cx="50" cy="52" r="40" fill={kleur} stroke={RAND} strokeWidth={RANDDIKTE} />
      <ellipse cx="38" cy="38" rx="13" ry="9" fill="#ffffff" opacity="0.5" />
      <circle cx="50" cy="52" r="9" fill={RAND} opacity="0.25" />
    </svg>
  );
}

/**
 * Eén mand, met de spulletjes erin.
 *
 * De mand is bewust breed en laag: zo liggen de dingen erin naast elkaar en
 * kan een kind ze tellen zonder dat er iets achter de rand verdwijnt.
 */
function Mand({
  aantal,
  soort,
  plaatje,
  gekozen,
  fout,
  goed,
}: {
  aantal: number;
  soort: Mandsoort;
  plaatje: string;
  gekozen: boolean;
  fout: boolean;
  goed: boolean;
}) {
  /* Hooguit vijf op een rij: dan blijft de vijfstructuur zichtbaar. */
  const perRij = aantal <= 5 ? aantal : 5;
  const rijen = Math.ceil(aantal / perRij);

  return (
    <div
      className={`rounded-2xl border-4 bg-[#fff6e6] p-2 transition ${
        goed
          ? "border-groen bg-groen-zacht"
          : fout
            ? "border-roze bg-roze-zacht"
            : gekozen
              ? "border-huisstijl"
              : "border-transparent"
      }`}
    >
      {/* De spulletjes, netjes op rijen zodat ze te tellen zijn. */}
      <div className="flex flex-col items-center justify-end gap-1" style={{ minHeight: "3.6rem" }}>
        {Array.from({ length: rijen }, (_, r) => (
          <div key={r} className="flex items-end justify-center gap-1">
            {Array.from(
              { length: r === rijen - 1 ? aantal - (rijen - 1) * perRij : perRij },
              (_, i) => (
                <span key={i} className="block size-5 sm:size-6">
                  <Ding soort={soort} plaatje={plaatje} nummer={r * perRij + i} />
                </span>
              ),
            )}
          </div>
        ))}
      </div>

      {/* De mand zelf: gevlochten, met een hengsel. */}
      <svg viewBox="0 0 120 70" className="mt-1 h-auto w-full" aria-hidden="true">
        <path
          d="M30 14 q30 -22 60 0"
          fill="none"
          stroke={RAND}
          strokeWidth={RANDDIKTE + 1}
          strokeLinecap="round"
        />
        <path
          d="M6 20 h108 l-12 44 a6 6 0 0 1 -6 4 h-72 a6 6 0 0 1 -6 -4 z"
          fill="#e0a75e"
          stroke={RAND}
          strokeWidth={RANDDIKTE}
          strokeLinejoin="round"
        />
        {/* Vlechtwerk */}
        <path d="M12 34 h96" stroke={RAND} strokeWidth="2.5" opacity="0.5" />
        <path d="M16 48 h88" stroke={RAND} strokeWidth="2.5" opacity="0.5" />
        <path d="M40 22 l-4 44 M70 22 l2 44 M96 22 l-6 44" stroke={RAND} strokeWidth="2.5" opacity="0.35" />
        {/* Glans over de rand */}
        <path d="M10 24 h100 v5 h-100 z" fill="#ffffff" opacity="0.3" />
      </svg>
    </div>
  );
}

/**
 * De rij manden, met het gevraagde getal erboven.
 *
 * De manden zijn zelf de knoppen: het kind tikt de mand aan die het bedoelt.
 * Bij een goed antwoord tilt Vos hem blij omhoog.
 */
export function Manden({
  manden,
  soort,
  plaatje,
  gevraagd,
  gekozen,
  fase = "bezig",
  markeer = true,
  vos = { vangend: null, wachtend: null, blij: null },
  onKies,
}: {
  /** Hoeveel er in elke mand zit. */
  manden: number[];
  soort: Mandsoort;
  /** Welk getekend plaatje, als het om telplaatjes gaat. */
  plaatje: string;
  /** Het getal dat groot boven de manden staat. */
  gevraagd: number;
  gekozen: string;
  fase?: "bezig" | "goed" | "fout";
  markeer?: boolean;
  vos?: Voshoudingen;
  onKies?: (waarde: string) => void;
}) {
  const uit = fase !== "bezig";

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  return (
    <div ref={buitenRef} className="mx-auto flex w-full max-w-xl flex-col items-center gap-3">
      {/*
        Het getal, groot en alleen.

        Het staat op een eigen kaartje en niet tussen de manden: het is geen
        antwoord maar de opdracht, en dat onderscheid moet meteen duidelijk zijn.
      */}
      <div className="rounded-groot border-2 border-rand bg-huisstijl-zacht px-8 py-2 shadow-op">
        <span className="text-5xl font-extrabold tabular-nums text-huisstijl-donker">
          {gevraagd}
        </span>
      </div>

      <div ref={vakRef} className="w-full">
        <div ref={vlakRef} className="flex items-end justify-center gap-2 sm:gap-3">
          {manden.map((aantal, i) => {
            const dezeGekozen = gekozen === String(i);
            return (
              <button
                key={i}
                type="button"
                disabled={uit}
                onClick={() => onKies?.(String(i))}
                aria-label={`Mand ${i + 1}`}
                className={`w-full max-w-28 transition disabled:cursor-not-allowed ${
                  fase === "goed" && dezeGekozen
                    ? "-translate-y-2 scale-105"
                    : !uit
                      ? "hover:-translate-y-1"
                      : ""
                } focus:outline-none focus-visible:ring-4 focus-visible:ring-huisstijl`}
              >
                <Mand
                  aantal={aantal}
                  soort={soort}
                  plaatje={plaatje}
                  gekozen={dezeGekozen && fase === "bezig"}
                  fout={fase === "fout" && dezeGekozen && markeer}
                  goed={fase === "goed" && dezeGekozen}
                />
              </button>
            );
          })}

          {/* Vos staat ernaast, buiten de manden: hij telt niet mee. */}
          {vos.vangend && (
            <span ref={vosRef} aria-hidden="true" className="block w-[16%] min-w-12 shrink-0">
              <Vosbeeld houdingen={vos} stand={fase === "goed" ? "blij" : "wachtend"} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dezelfde mand in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De goede mand alleen, met de inhoud die één voor één wordt meegeteld.
 *
 * `geteld` zegt hoeveel er al geteld zijn; die staan vol in beeld, de rest
 * wacht gedimd. Zo telt het kind in de uitleg mee met dezelfde spulletjes als
 * in de vraag.
 */
export function Uitlegmand({
  aantal,
  soort,
  plaatje,
  geteld,
  bijschrift,
}: {
  aantal: number;
  soort: Mandsoort;
  plaatje: string;
  geteld: number;
  bijschrift?: string;
}) {
  const perRij = aantal <= 5 ? aantal : 5;
  const rijen = Math.ceil(aantal / perRij);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-40 rounded-2xl border-2 border-rand bg-[#fff6e6] p-2 shadow-op">
        <div className="flex flex-col items-center justify-end gap-1">
          {Array.from({ length: rijen }, (_, r) => (
            <div key={r} className="flex items-end justify-center gap-1">
              {Array.from(
                { length: r === rijen - 1 ? aantal - (rijen - 1) * perRij : perRij },
                (_, i) => {
                  const nummer = r * perRij + i;
                  return (
                    <span
                      key={i}
                      className={`block size-6 transition ${nummer < geteld ? "" : "opacity-25"}`}
                    >
                      <Ding soort={soort} plaatje={plaatje} nummer={nummer} />
                    </span>
                  );
                },
              )}
            </div>
          ))}
        </div>
        <svg viewBox="0 0 120 70" className="mt-1 h-auto w-full" aria-hidden="true">
          <path d="M30 14 q30 -22 60 0" fill="none" stroke={RAND} strokeWidth={RANDDIKTE + 1} strokeLinecap="round" />
          <path
            d="M6 20 h108 l-12 44 a6 6 0 0 1 -6 4 h-72 a6 6 0 0 1 -6 -4 z"
            fill="#e0a75e"
            stroke={RAND}
            strokeWidth={RANDDIKTE}
            strokeLinejoin="round"
          />
          <path d="M12 34 h96" stroke={RAND} strokeWidth="2.5" opacity="0.5" />
        </svg>
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
