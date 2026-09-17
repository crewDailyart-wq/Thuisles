"use client";

/**
 * Vos' straat: buurgetallen in een rij huisjes.
 *
 * Vos staat voor een huis waarvan het nummer op de deur staat. De buren hebben
 * een leeg bordje; het kind zegt welk nummer daar hoort. Bij een goed antwoord
 * loopt Vos ernaartoe en zwaait de deur open.
 *
 * ---------------------------------------------------------------------------
 * Waarom een straat en geen getallenlijn
 * ---------------------------------------------------------------------------
 * Een getallenlijn is een abstractie die een kind van zeven nog moet leren
 * lezen. Een huisnummer is dat niet: kinderen weten dat het huis naast nummer
 * 12 nummer 13 is, of 14 als de overkant oneven is. De rij huizen ís de
 * getallenlijn, maar dan eentje waar je in kunt wonen.
 *
 * ---------------------------------------------------------------------------
 * Even en oneven
 * ---------------------------------------------------------------------------
 * In Nederland staan de even nummers aan de ene kant van de straat en de
 * oneven aan de andere. In die stand staan de huisjes daarom in twee rijen met
 * de straat ertussen, en is het buurhuis aan dezelfde kant er twee verder: 12,
 * dan 14. Dat is precies de sprong die deze stand oefent.
 *
 * ---------------------------------------------------------------------------
 * Alles in dezelfde eenheid
 * ---------------------------------------------------------------------------
 * Elke maat hieronder staat in procenten van de BREEDTE van het vlak, ook de
 * hoogtes. In CSS is `left` een percentage van de breedte en `top` van de
 * hoogte; zijn die niet even groot, dan schuift alles in elkaar. Door alles in
 * breedte te rekenen en pas bij het tekenen om te rekenen, klopt het altijd.
 */

import { useEffect, useRef, useState } from "react";
import { Vosbeeld, useVosplek, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

export type Huis = {
  nummer: number;
  /** Bij even en oneven: aan welke kant van de straat dit huis staat. */
  kant: "boven" | "onder";
};

export type Huizenplan = {
  breedte: number;
  hoogte: number;
  plekken: { x: number; y: number }[];
  /** De hoogte van één huisje, inclusief dak. */
  huishoogte: number;
  /** Waar de straat ligt bij even en oneven; `null` bij één rij. */
  straat: { y: number; hoogte: number } | null;
};

const MARGE = 3;
const GAT = 2.2;
/** Hoe hoog een huisje is ten opzichte van zijn breedte. */
const VERHOUDING = 1.32;
/** Ruimte onder de huizen voor de stoep waar Vos loopt. */
const STOEP = 11;
/** Breedte van de straat tussen de twee rijen bij even en oneven. */
const STRAAT = 13;

/**
 * Waar de huisjes komen te staan.
 *
 * Bij één rij staan ze naast elkaar op de stoep. Bij twee rijen staat de ene
 * helft boven en de andere onder, met de straat ertussen — de even kant en de
 * oneven kant, net als in het echt.
 */
export function huizenPlan(huizen: Huis[]): Huizenplan {
  const boven = huizen.filter((h) => h.kant === "boven");
  const onder = huizen.filter((h) => h.kant === "onder");
  const tweeRijen = boven.length > 0 && onder.length > 0;

  const perRij = tweeRijen ? Math.max(boven.length, onder.length) : huizen.length;
  const breedte = (100 - 2 * MARGE - (perRij - 1) * GAT) / Math.max(1, perRij);
  const huishoogte = breedte * VERHOUDING;

  const hoogte = tweeRijen
    ? huishoogte * 2 + STOEP * 2 + STRAAT
    : huishoogte + STOEP + MARGE;

  const rijY = tweeRijen ? [MARGE, MARGE + huishoogte + STOEP + STRAAT] : [MARGE];

  /* Een halve rij hoort gecentreerd te staan, niet links te plakken. */
  const startX = (aantal: number) =>
    (100 - (aantal * breedte + (aantal - 1) * GAT)) / 2;

  const plekken = huizen.map((huis) => {
    const rij = tweeRijen && huis.kant === "onder" ? onder : boven.length > 0 ? boven : huizen;
    const index = rij.indexOf(huis);
    const y = tweeRijen && huis.kant === "onder" ? rijY[1] : rijY[0];
    return { x: startX(rij.length) + index * (breedte + GAT), y };
  });

  const straat = tweeRijen
    ? { y: MARGE + huishoogte + STOEP, hoogte: STRAAT }
    : null;

  return { breedte, hoogte, plekken, huishoogte, straat };
}

// ---------------------------------------------------------------------------
// De tekening
// ---------------------------------------------------------------------------

const RAND = "#3d3226";
const RANDDIKTE = 4;

/** Vijf vrolijke huiskleuren, in vaste volgorde zodat een huis zijn kleur houdt. */
const KLEUREN = [
  { muur: "#f7b955", dak: "#e2622f", deur: "#8c4a2f" },
  { muur: "#8fd3a8", dak: "#2f9e6b", deur: "#2a6b4d" },
  { muur: "#f79d94", dak: "#d94f4f", deur: "#8c3535" },
  { muur: "#9ecbf5", dak: "#3f7fc4", deur: "#2f5b8c" },
  { muur: "#d9b3f0", dak: "#8a5cc0", deur: "#5c3d85" },
];

/**
 * Eén huisje.
 *
 * Dik omrand als in een tekenfilm, met een glans op de muur en een zachte
 * schaduw eronder. Het nummer staat groot op de deur: dat is waar het kind naar
 * kijkt, dus daar mag niets omheen dat afleidt.
 *
 * Staat er geen nummer, dan hangt er een leeg bordje. Bewust geen vraagteken:
 * dat is een leesteken, en deze kinderen lezen nog nauwelijks.
 */
function Huisje({
  nummer,
  kleur,
  open = false,
  bloem = false,
  licht = false,
}: {
  nummer: number | null;
  kleur: number;
  /** De deur zwaait open; na een goed antwoord. */
  open?: boolean;
  /** Een bloemetje naast de stoep. Niet bij elk huis: dan wordt het druk. */
  bloem?: boolean;
  /** Dit huis is aan de beurt in de uitleg. */
  licht?: boolean;
}) {
  const k = KLEUREN[kleur % KLEUREN.length];

  return (
    <svg viewBox="0 0 100 132" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Zachte schaduw op de stoep. */}
      <ellipse cx="50" cy="127" rx="42" ry="6" fill={RAND} opacity="0.16" />

      {licht && (
        <rect
          x="1"
          y="1"
          width="98"
          height="128"
          rx="10"
          fill="none"
          stroke="var(--color-huisstijl)"
          strokeWidth="7"
        />
      )}

      {/* Muur */}
      <rect
        x="9"
        y="46"
        width="82"
        height="78"
        rx="5"
        fill={k.muur}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* Glans: een licht vlak langs de linkerkant. */}
      <path d="M14 52 h16 v66 h-16 z" fill="#ffffff" opacity="0.3" />

      {/* Dak, iets breder dan de muur zodat het overstekt. */}
      <path
        d="M3 48 L50 8 L97 48 Z"
        fill={k.dak}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path d="M12 44 L50 12 L57 18 L22 44 Z" fill="#ffffff" opacity="0.22" />

      {/* Raampje */}
      <rect
        x="17"
        y="56"
        width="20"
        height="18"
        rx="3"
        fill="#eaf6ff"
        stroke={RAND}
        strokeWidth={RANDDIKTE * 0.75}
      />
      <line x1="27" y1="56" x2="27" y2="74" stroke={RAND} strokeWidth={RANDDIKTE * 0.55} />

      {/* Het bloemetje naast de deur. */}
      {bloem && (
        <g>
          <line x1="16" y1="124" x2="16" y2="108" stroke="#2f9e6b" strokeWidth="3.5" />
          <circle cx="16" cy="104" r="6" fill="#ff9ec7" stroke={RAND} strokeWidth="3" />
          <circle cx="16" cy="104" r="2" fill="#ffe27a" />
        </g>
      )}

      {/*
        De deur, met het nummer erop.

        Hij draait om zijn scharnier open — dat is het kleine feestje bij een
        goed antwoord. `transform-box: fill-box` laat de draaiing om de deur
        zelf gaan en niet om de hoek van de tekening.
      */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "left center",
          transform: open ? "rotateY(-72deg)" : "rotateY(0deg)",
          transition: "transform 0.5s ease-out",
        }}
      >
        <rect
          x="44"
          y="74"
          width="38"
          height="50"
          rx="4"
          fill={nummer === null ? "#fdf6e8" : k.deur}
          stroke={RAND}
          strokeWidth={RANDDIKTE}
          strokeLinejoin="round"
        />
        {nummer !== null && (
          <text
            x="63"
            y="105"
            textAnchor="middle"
            fontSize="30"
            fontWeight="800"
            fill="#fdf6e8"
            stroke={RAND}
            strokeWidth="1.2"
            paintOrder="stroke"
          >
            {nummer}
          </text>
        )}
        {nummer === null && <circle cx="76" cy="100" r="3.5" fill={RAND} opacity="0.5" />}
      </g>

      {/* Het gat waar de deur was, zodat je ziet dat hij écht openstaat. */}
      {open && <rect x="44" y="74" width="38" height="50" rx="4" fill="#2a2119" opacity="0.55" />}
    </svg>
  );
}

/**
 * De stoep waar de huizen op staan.
 *
 * Een warme zandkleurige band onder elke rij. Zonder die band zweven de huizen
 * in het wit en staat er niets: mét de band is het een straat waar je doorheen
 * kunt lopen, en heeft Vos ook echt ergens om te staan.
 */
function Stoep({ y, hoogte }: { y: number; hoogte: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute left-0 w-full rounded-full border-2 border-rand/40 bg-[#f2e2c0]"
      style={{
        top: `${(y / hoogte) * 100}%`,
        height: `${(STOEP * 0.5 / hoogte) * 100}%`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// De straat in de vraag
// ---------------------------------------------------------------------------

/**
 * De hele straat zoals het kind hem ziet.
 *
 * Bij een goed antwoord loopt Vos naar het gevraagde huis en gaat de deur open.
 * Bij een fout blijft alles staan: de uitleg laat dan zelf zien hoe je van het
 * ene huis naar het andere komt.
 */
export function Huizenrij({
  huizen,
  vosBij,
  gevraagd,
  vos = { vangend: null, wachtend: null, blij: null },
  fase = "bezig",
  beweegt = true,
}: {
  huizen: Huis[];
  /** Bij welk huis Vos staat; dat nummer is zichtbaar. */
  vosBij: number;
  /** Welk huis gevraagd wordt; dat nummer komt pas bij een goed antwoord. */
  gevraagd: number;
  vos?: Voshoudingen;
  fase?: "bezig" | "goed" | "fout";
  /** Uit in het beheer: daar loopt Vos niet. */
  beweegt?: boolean;
}) {
  const plan = huizenPlan(huizen);
  const goed = fase === "goed";

  /*
    Vos loopt pas ná een tel. Zonder die pauze staat hij er al voordat het kind
    doorheeft dat zijn antwoord goed was, en mist het precies het stukje waar
    het om gaat: dat het buurhuis het gezochte nummer heeft.
  */
  const [aangekomen, setAangekomen] = useState(false);
  useEffect(() => {
    if (!goed || !beweegt) return;
    const klok = setTimeout(() => setAangekomen(true), 260);
    return () => {
      clearTimeout(klok);
      setAangekomen(false);
    };
  }, [goed, beweegt]);

  const bijHuis = aangekomen ? gevraagd : vosBij;
  const doel = plan.plekken[bijHuis] ?? plan.plekken[0];

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  return (
    <div ref={buitenRef} className="mx-auto w-full max-w-xl">
      <div
        ref={vakRef}
        className="relative w-full rounded-groot border-2 border-rand bg-lucht-zacht/40 p-3 shadow-op sm:p-4"
      >
        <div
          ref={vlakRef}
          className="relative w-full"
          style={{ aspectRatio: `100 / ${plan.hoogte}` }}
        >
          {/* De stoep waar de huizen op staan, onder elke rij. */}
          <Stoep y={MARGE + plan.huishoogte - STOEP * 0.1} hoogte={plan.hoogte} />
          {plan.straat && (
            <Stoep
              y={plan.straat.y + plan.straat.hoogte + plan.huishoogte - STOEP * 0.1}
              hoogte={plan.hoogte}
            />
          )}

          {/* De straat tussen de twee kanten, met een streep in het midden. */}
          {plan.straat && (
            <span
              aria-hidden="true"
              className="absolute left-0 w-full rounded-sm bg-[#cfd4d9]"
              style={{
                top: `${(plan.straat.y / plan.hoogte) * 100}%`,
                height: `${(plan.straat.hoogte / plan.hoogte) * 100}%`,
              }}
            >
              <span className="absolute left-0 top-1/2 h-[10%] w-full -translate-y-1/2 bg-[repeating-linear-gradient(to_right,#fdf6e8_0_6%,transparent_6%_12%)]" />
            </span>
          )}

          {huizen.map((huis, i) => {
            const plek = plan.plekken[i];
            const zichtbaar = i === vosBij || (goed && i === gevraagd);
            return (
              <span
                key={i}
                className="absolute"
                style={{
                  left: `${plek.x}%`,
                  top: `${(plek.y / plan.hoogte) * 100}%`,
                  width: `${plan.breedte}%`,
                  height: `${(plan.huishoogte / plan.hoogte) * 100}%`,
                }}
              >
                <Huisje
                  nummer={zichtbaar ? huis.nummer : null}
                  kleur={i}
                  open={goed && i === gevraagd && aangekomen}
                  bloem={i === huizen.length - 1}
                />
              </span>
            );
          })}

          {/*
            Vos op de stoep, vóór het huis waar hij hoort.

            Hij staat binnen het straatje omdat hij hier deel van het verhaal
            is: hij wóónt er. Tellen valt er niets — het kind kiest een getal —
            dus hij kan ook niet worden meegeteld. Hij staat wel onder de
            nummers, zodat hij er nooit eentje bedekt.
          */}
          {vos.vangend && (
            <div
              ref={vosRef}
              aria-hidden="true"
              /*
                Op de stoep, met zijn voeten op de grond en nét links van het
                huis. Daardoor staat hij nooit voor de deur, en dus nooit voor
                het nummer — en dat nummer is het enige waar het kind naar moet
                kijken. Met `bottom` en niet met `top`, zodat zijn eigen hoogte
                er niet toe doet.
              */
              className="pointer-events-none absolute z-10 transition-[left,bottom] duration-700 ease-in-out motion-reduce:transition-none"
              style={{
                left: `${doel.x - plan.breedte * 0.34}%`,
                bottom: `${
                  ((plan.hoogte - (plek0(plan, bijHuis) + plan.huishoogte + STOEP * 0.45)) /
                    plan.hoogte) *
                  100
                }%`,
                width: `${plan.breedte * 0.72}%`,
              }}
            >
              <Vosbeeld houdingen={vos} stand={goed ? "blij" : "wachtend"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** De y van het huis waar Vos bij staat; buiten bereik valt terug op de eerste. */
function plek0(plan: Huizenplan, index: number): number {
  return (plan.plekken[index] ?? plan.plekken[0]).y;
}

// ---------------------------------------------------------------------------
// Dezelfde straat in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De straat in de uitleg, met Vos die stap voor stap opschuift.
 *
 * `tot` zegt hoeveel huizen hun nummer al laten zien, geteld vanaf het huis
 * waar hij begon. Zo loopt hij in de uitleg langs de huizen terwijl de nummers
 * één voor één verschijnen — precies wat een kind zelf zou doen.
 */
export function Uitlegstraat({
  huizen,
  vosBij,
  nadruk = null,
  zichtbaar = [],
  bijschrift,
}: {
  huizen: Huis[];
  vosBij: number;
  /** Welk huis nu oplicht. */
  nadruk?: number | null;
  /** Welke huizen hun nummer laten zien. */
  zichtbaar?: number[];
  bijschrift?: string;
}) {
  const plan = huizenPlan(huizen);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative w-full max-w-sm rounded-groot border-2 border-rand bg-lucht-zacht/40 p-3 shadow-op">
        <div className="relative w-full" style={{ aspectRatio: `100 / ${plan.hoogte}` }}>
          {plan.straat && (
            <span
              aria-hidden="true"
              className="absolute left-0 w-full rounded-sm bg-[#cfd4d9]"
              style={{
                top: `${(plan.straat.y / plan.hoogte) * 100}%`,
                height: `${(plan.straat.hoogte / plan.hoogte) * 100}%`,
              }}
            />
          )}
          {huizen.map((huis, i) => {
            const plek = plan.plekken[i];
            return (
              <span
                key={i}
                className="absolute"
                style={{
                  left: `${plek.x}%`,
                  top: `${(plek.y / plan.hoogte) * 100}%`,
                  width: `${plan.breedte}%`,
                  height: `${(plan.huishoogte / plan.hoogte) * 100}%`,
                }}
              >
                <Huisje
                  nummer={i === vosBij || zichtbaar.includes(i) ? huis.nummer : null}
                  kleur={i}
                  licht={nadruk === i}
                  bloem={i === huizen.length - 1}
                />
              </span>
            );
          })}
        </div>
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
