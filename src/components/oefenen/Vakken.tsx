"use client";

/**
 * Welk vak? — een getal herkennen in een hoeveelheid.
 *
 * Onder de zin "Zoek het vak met:" staat een klein kaartje met het gezochte
 * getal. Daaronder staan drie of vier vakken met spulletjes; het kind tikt het
 * vak aan waar er precies zoveel in zitten.
 *
 * Het kaartje is met opzet klein: het hoort bij de zin en is een bijschrift,
 * geen keuze. De vakken zijn groot, want die zijn de keuze.
 *
 * Verder staat er niets: geen vos naast het getal, geen versiering tussen de
 * vakken. Een kind van zes leest de vraagzin niet — het kaartje en de vakken
 * moeten de vraag zelf zijn. Vos komt pas in beeld als er geantwoord is.
 *
 * ---------------------------------------------------------------------------
 * Waarom vakken en geen mandjes
 * ---------------------------------------------------------------------------
 * Hier stond eerst een rij mandjes. Die voegden niets toe aan het rekenen: ze
 * kostten ruimte, de spullen pasten er slecht in, en een mand is zelf ook een
 * ding — een kind kan hem gaan meetellen. Wat het kind doet is simpelweg de
 * groep zoeken met het gevraagde aantal, en daar hoort een leeg vak bij, net
 * als het telvak bij "Plaatjes tellen meerkeuze".
 *
 * ---------------------------------------------------------------------------
 * Rijen van vijf
 * ---------------------------------------------------------------------------
 * De spullen liggen standaard in rijen van vijf. Dat is geen opmaak maar de
 * les: zo kan een kind in groepjes tellen — vijf, en nog vier, dat is negen —
 * in plaats van stuk voor stuk. Verspreid kan ook, en dat is duidelijk
 * moeilijker: dan moet het kind zelf structuur aanbrengen.
 *
 * De plekken komen uit dezelfde berekening als bij het telvak van "Plaatjes
 * tellen meerkeuze". Die rekent alles in breedteprocenten uit, zodat de
 * spullen elkaar nooit raken en nooit buiten hun vak vallen — ook niet op een
 * telefoon, waar alles gewoon evenredig kleiner wordt.
 */

import { useRef } from "react";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";
import { Blokje } from "@/components/oefenen/Mabblokken";
import { plaatjesPlekken } from "@/components/oefenen/Plaatjesraster";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

export type Vakinhoud = "telplaatjes" | "kralen" | "blokken";

const RAND = "#4a3524";
const RANDDIKTE = 4;

/** Vrolijke kraalkleuren, in vaste volgorde. */
const KRAALKLEUREN = ["#ef6f6c", "#f2b134", "#5bc0a5", "#6aa9de", "#c58ee0"];

/** Eén ding in het vak: een getekend plaatje, een kraal of een blokje. */
function Ding({ soort, plaatje, nummer }: { soort: Vakinhoud; plaatje: string; nummer: number }) {
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
 * Het kaartje met het gezochte getal.
 *
 * Klein en compact: het hoort bij de zin "Zoek het vak met:" en is dus een
 * bijschrift, geen keuze. De antwoordvakken eronder zijn veel groter en dat
 * moet zo blijven — die zijn waar het kind uit kiest.
 *
 * Bewust zonder schaduw en zonder de dikke rand die de vakken wél hebben: een
 * kind moet er niet op willen tikken. Het vangt ook geen tikken op; zie
 * `pointer-events-none` bij de aanroep.
 */
function Getalkaart({ getal }: { getal: number }) {
  return (
    <svg viewBox="0 0 96 80" className="h-full w-full" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="88"
        height="68"
        rx="14"
        fill="#ffe9b8"
        stroke={RAND}
        strokeWidth="3.5"
      />
      <path d="M11 13 h74 v9 h-74 z" fill="#ffffff" opacity="0.5" />
      <text x="48" y="59" textAnchor="middle" fontSize="42" fontWeight="800" fill={RAND}>
        {getal}
      </text>
    </svg>
  );
}

/**
 * Eén vak met spullen erin.
 *
 * Een eigen rand en een warme achtergrond, zodat een kind ziet wat er bij
 * elkaar hoort: alles hierbinnen telt mee, daarbuiten niet.
 */
function Vak({
  aantal,
  soort,
  plaatje,
  perRij,
  vakhoogte,
  gekozen,
  fout,
  goed,
}: {
  aantal: number;
  soort: Vakinhoud;
  plaatje: string;
  /** 5 = rijen van vijf, 0 = verspreid. */
  perRij: number;
  /** De gedeelde hoogte van alle vakken, in breedteprocenten van één vak. */
  vakhoogte: number;
  gekozen: boolean;
  fout: boolean;
  goed: boolean;
}) {
  const plan = plaatjesPlekken({ aantal, perRij, groepsruimte: false });
  /* De inhoud staat midden in het vak, ook als er in een ander vak meer past. */
  const verschuif = (vakhoogte - plan.hoogte) / 2;

  return (
    <div
      className={`w-full rounded-groot border-2 p-2 shadow-op transition sm:p-3 ${
        goed
          ? "border-groen bg-groen-zacht"
          : fout
            ? "border-roze bg-roze-zacht"
            : gekozen
              ? "border-huisstijl bg-huisstijl-zacht"
              : "border-rand bg-[#fff6e6]"
      }`}
    >
      <div className="relative w-full" style={{ aspectRatio: `100 / ${vakhoogte}` }}>
        {plan.plekken.map((plek, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${plek.x}%`,
              top: `${((plek.y + verschuif) / vakhoogte) * 100}%`,
              width: `${plan.maat}%`,
              aspectRatio: "1",
            }}
          >
            <Ding soort={soort} plaatje={plaatje} nummer={i} />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * De hoogte die alle vakken delen: die van het volste vak.
 *
 * Met een bodem eronder, zodat een vak met één rijtje erin nog steeds een vák
 * is en geen streepje. Alle vakken even hoog: anders lijkt het volste vak
 * groter en kiest een kind dat zonder te tellen.
 */
const MINSTE_HOOGTE = 34;

function gedeeldeHoogte(vakken: number[], perRij: number): number {
  return Math.max(
    MINSTE_HOOGTE,
    ...vakken.map((aantal) => plaatjesPlekken({ aantal, perRij, groepsruimte: false }).hoogte),
  );
}

/**
 * De rij vakken, met Vos en zijn kaartje erboven.
 *
 * De vakken zijn zelf de knoppen: het kind tikt het vak aan dat het bedoelt.
 * Bij een goed antwoord licht dat vak groen op en springt Vos op van blijdschap.
 */
export function Vakken({
  vakken,
  soort,
  plaatje,
  perRij = 5,
  gevraagd,
  gekozen,
  fase = "bezig",
  markeer = true,
  vos = { vangend: null, wachtend: null, blij: null },
  onKies,
}: {
  /** Hoeveel er in elk vak zit. */
  vakken: number[];
  soort: Vakinhoud;
  /** Welk getekend plaatje, als het om telplaatjes gaat. */
  plaatje: string;
  /** 5 = rijen van vijf, 0 = verspreid door elkaar. */
  perRij?: number;
  /** Het getal op het kaartje van Vos. */
  gevraagd: number;
  gekozen: string;
  fase?: "bezig" | "goed" | "fout";
  markeer?: boolean;
  vos?: Voshoudingen;
  onKies?: (waarde: string) => void;
}) {
  const uit = fase !== "bezig";
  const goed = fase === "goed";
  const hoogte = gedeeldeHoogte(vakken, perRij);

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  return (
    <div ref={buitenRef} className="mx-auto flex w-full max-w-xl flex-col items-center gap-3">
      {/*
        Het gevraagde getal, klein en vlak onder de zin.

        Het hoort bij "Zoek het vak met:" — daarom staat het er pal onder en
        blijft het klein. De vakken eronder zijn de keuze en moeten het beeld
        blijven bepalen; dit kaartje wijst alleen aan wát je zoekt.

        Het vangt geen tikken op: een kind dat erop tikt, moet niets voelen
        gebeuren, anders lijkt het een antwoord.
      */}
      <span
        className="pointer-events-none -mt-1 block w-16 select-none sm:w-20"
        role="img"
        aria-label={`Zoek het vak met ${gevraagd}`}
      >
        <Getalkaart getal={gevraagd} />
      </span>

      <div ref={vakRef} className="mt-1 w-full">
        <div ref={vlakRef} className="flex items-start justify-center gap-2 sm:gap-3">
          {vakken.map((aantal, i) => {
            const dezeGekozen = gekozen === String(i);
            return (
              <button
                key={i}
                type="button"
                disabled={uit}
                onClick={() => onKies?.(String(i))}
                aria-label={`Vak ${i + 1}`}
                className={`w-full transition disabled:cursor-not-allowed ${
                  goed && dezeGekozen
                    ? "-translate-y-1 scale-105"
                    : !uit
                      ? "hover:-translate-y-1"
                      : ""
                } focus:outline-none focus-visible:ring-4 focus-visible:ring-huisstijl`}
              >
                <Vak
                  aantal={aantal}
                  soort={soort}
                  plaatje={plaatje}
                  perRij={perRij}
                  vakhoogte={hoogte}
                  gekozen={dezeGekozen && fase === "bezig"}
                  fout={fase === "fout" && dezeGekozen && markeer}
                  goed={goed && dezeGekozen}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/*
        Vos hoort bij het antwoord, niet bij de vraag.

        Tijdens het kiezen is hij er niet: dan zijn er alleen het getal en de
        vakken, en valt er niets anders te bekijken. Zodra er geantwoord is,
        komt hij erbij — blij als het goed was, meelevend als het fout was.
      */}
      {vos.vangend && uit && (
        <div ref={vosRef} aria-hidden="true" className="flex justify-center">
          <span className="block w-16 sm:w-20">
            <Vosbeeld houdingen={vos} stand={goed ? "blij" : "wachtend"} stil={!goed} />
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hetzelfde vak in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * Het goede vak alleen, met de inhoud die één voor één wordt meegeteld.
 *
 * `geteld` zegt hoeveel er al geteld zijn; die staan vol in beeld, de rest
 * wacht gedimd. Zo telt het kind in de uitleg mee met dezelfde spullen in
 * dezelfde opstelling als in de vraag.
 */
export function Uitlegvak({
  aantal,
  soort,
  plaatje,
  perRij = 5,
  geteld,
  bijschrift,
}: {
  aantal: number;
  soort: Vakinhoud;
  plaatje: string;
  perRij?: number;
  geteld: number;
  bijschrift?: string;
}) {
  const plan = plaatjesPlekken({ aantal, perRij, groepsruimte: false });

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-xs rounded-groot border-2 border-rand bg-[#fff6e6] p-3 shadow-op">
        <div className="relative w-full" style={{ aspectRatio: `100 / ${plan.hoogte}` }}>
          {plan.plekken.map((plek, i) => (
            <span
              key={i}
              className={`absolute transition ${i < geteld ? "" : "opacity-25"}`}
              style={{
                left: `${plek.x}%`,
                top: `${(plek.y / plan.hoogte) * 100}%`,
                width: `${plan.maat}%`,
                aspectRatio: "1",
              }}
            >
              <Ding soort={soort} plaatje={plaatje} nummer={i} />
            </span>
          ))}
        </div>
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
