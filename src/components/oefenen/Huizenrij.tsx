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
/** Ruimte onder de huizen voor de stoep. */
const STOEP = 11;
/** Breedte van de straat tussen de twee rijen bij even en oneven. */
const STRAAT = 13;
/** Lucht boven de daken, voor de wolkjes en de vogel. */
const LUCHT = 13;
/**
 * Ruimte links en rechts van de rij, voor de boom en de lantaarnpaal.
 *
 * Die staan dus naast de huizen en nooit ervoor: over een deur mag niets
 * heen vallen, want daar staat het nummer waar het kind naar kijkt.
 */
const ZIJKANT = 9;

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
  const bruikbaar = 100 - 2 * MARGE - 2 * ZIJKANT;
  const breedte = (bruikbaar - (perRij - 1) * GAT) / Math.max(1, perRij);
  const huishoogte = breedte * VERHOUDING;

  const hoogte = tweeRijen
    ? LUCHT + huishoogte * 2 + STOEP * 2 + STRAAT
    : LUCHT + huishoogte + STOEP + MARGE;

  const rijY = tweeRijen
    ? [LUCHT, LUCHT + huishoogte + STOEP + STRAAT]
    : [LUCHT];

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
    ? { y: LUCHT + huishoogte + STOEP, hoogte: STRAAT }
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
  gevraagd = false,
  raamAan = false,
}: {
  nummer: number | null;
  kleur: number;
  /** De deur zwaait open; na een goed antwoord. */
  open?: boolean;
  /** Een bloemetje naast de stoep. Niet bij elk huis: dan wordt het druk. */
  bloem?: boolean;
  /** Dit huis is aan de beurt in de uitleg. */
  licht?: boolean;
  /**
   * Dit is het huis waar de vraag over gaat.
   *
   * De deur krijgt een oranje rand en een vraagteken. Zonder dat ziet een kind
   * niet wélk huis er bedoeld wordt — het zou dan vijf huizen zien en moeten
   * raden waar de vraag over gaat.
   */
  gevraagd?: boolean;
  /** Bij één huis brandt het licht. Een detail dat de straat bewoond maakt. */
  raamAan?: boolean;
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

      {/* Raampje; bij één huis brandt het licht. */}
      <rect
        x="17"
        y="56"
        width="20"
        height="18"
        rx="3"
        fill={raamAan ? "#ffdf85" : "#eaf6ff"}
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
      {/*
        Zodra de deur openzwaait, verhuist het nummer naar een bordje boven de
        deurpost. Anders zou het net gevonden getal met de deur mee wegdraaien
        — en juist dát getal moet het kind zien staan.
      */}
      {open && nummer !== null && (
        <g>
          <rect x="42" y="49" width="42" height="24" rx="6" fill="#fdf6e8" stroke={RAND} strokeWidth={RANDDIKTE * 0.9} />
          <text x="63" y="68" textAnchor="middle" fontSize="21" fontWeight="800" fill={RAND}>
            {nummer}
          </text>
        </g>
      )}

      {/*
        Wat er achter de deur zit, en pas te zien is als hij openzwaait: een
        warme gloed en een slinger. Staat vóór de deur getekend, zodat de deur
        er overheen valt zolang hij dicht is.
      */}
      {open && (
        <g>
          <rect x="44" y="74" width="38" height="50" rx="4" fill="#ffd98a" />
          <circle cx="63" cy="94" r="13" fill="#fff3cf" />
          <path d="M48 82 q7 6 14 0 q7 -6 14 0" fill="none" stroke="#e2622f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="52" cy="86" r="3" fill="#ef6f6c" />
          <circle cx="63" cy="82" r="3" fill="#2f9e6b" />
          <circle cx="74" cy="86" r="3" fill="#6aa9de" />
        </g>
      )}

      <g className={`deur ${open ? "deur-open" : ""}`}>
        <rect
          x="44"
          y="74"
          width="38"
          height="50"
          rx="4"
          fill={nummer === null ? "#fdf6e8" : k.deur}
          stroke={gevraagd ? "var(--color-huisstijl)" : RAND}
          strokeWidth={gevraagd ? RANDDIKTE * 1.7 : RANDDIKTE}
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
        {/*
          Het vraagteken op de lege deur. Eén teken, geen woord: dit is het
          enige leesteken dat ook een kind van zes al kent uit prentenboeken.
        */}
        {nummer === null && gevraagd && (
          <text
            x="63"
            y="107"
            textAnchor="middle"
            fontSize="34"
            fontWeight="800"
            fill="var(--color-huisstijl-diep)"
          >
            ?
          </text>
        )}
        {nummer === null && !gevraagd && (
          <circle cx="76" cy="100" r="3.5" fill={RAND} opacity="0.5" />
        )}
      </g>
    </svg>
  );
}

/**
 * Het decor: lucht, wolkjes, een boom, een lantaarnpaal, een kat en een vogel.
 *
 * Alles staat náást of bóven de huizen, nooit ervoor. Over een deur mag niets
 * heen vallen: daar staat het nummer, en dat is het enige waar het kind naar
 * moet kijken. De wolkjes drijven langzaam; verder beweegt er niets, want dat
 * zou de aandacht juist wegtrekken.
 */
function Boom() {
  return (
    <svg viewBox="0 0 60 120" className="h-full w-full" aria-hidden="true">
      <rect x="24" y="66" width="12" height="46" rx="4" fill="#8c5a33" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <circle cx="30" cy="44" r="26" fill="#4fb07a" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="16" cy="58" r="15" fill="#5cc189" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="44" cy="58" r="14" fill="#3f9d69" stroke={RAND} strokeWidth={RANDDIKTE} />
      <path d="M18 34 q10 -8 20 -2" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.4" strokeLinecap="round" />
      <circle cx="40" cy="36" r="4" fill="#ef6f6c" stroke={RAND} strokeWidth="2.5" />
      <circle cx="20" cy="50" r="4" fill="#ef6f6c" stroke={RAND} strokeWidth="2.5" />
    </svg>
  );
}

function Lantaarnpaal() {
  return (
    <svg viewBox="0 0 40 120" className="h-full w-full" aria-hidden="true">
      <rect x="16" y="26" width="8" height="86" rx="3" fill="#5b6672" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <rect x="6" y="108" width="28" height="8" rx="4" fill="#5b6672" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <path d="M8 26 h24 l-5 -12 h-14 z" fill="#ffd98a" stroke={RAND} strokeWidth={RANDDIKTE} strokeLinejoin="round" />
      <circle cx="20" cy="20" r="5" fill="#fff3cf" />
    </svg>
  );
}

function Kat() {
  return (
    <svg viewBox="0 0 60 44" className="h-full w-full" aria-hidden="true">
      <ellipse cx="30" cy="30" rx="20" ry="12" fill="#f2a03d" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <circle cx="44" cy="20" r="10" fill="#f2a03d" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      <path d="M38 12 l2 -8 l6 5 z M50 12 l2 -7 l4 7 z" fill="#f2a03d" stroke={RAND} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="41" cy="20" r="1.8" fill={RAND} />
      <circle cx="48" cy="20" r="1.8" fill={RAND} />
      <path d="M12 28 q-8 -6 -2 -14" fill="none" stroke={RAND} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function Vogel() {
  return (
    <svg viewBox="0 0 44 32" className="h-full w-full" aria-hidden="true">
      <ellipse cx="20" cy="20" rx="13" ry="9" fill="#6aa9de" stroke={RAND} strokeWidth="3" />
      <circle cx="31" cy="14" r="7" fill="#6aa9de" stroke={RAND} strokeWidth="3" />
      <path d="M36 14 l7 3 l-7 3 z" fill="#f2b134" stroke={RAND} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="12" r="1.6" fill={RAND} />
      <path d="M12 16 q8 -7 14 2 q-8 4 -14 -2 z" fill="#8fc4ea" stroke={RAND} strokeWidth="2.5" />
    </svg>
  );
}

/** Een wolkje dat langzaam voorbij drijft. */
function Wolk() {
  return (
    <svg viewBox="0 0 90 40" className="h-full w-full" aria-hidden="true">
      <g fill="#ffffff" stroke={RAND} strokeWidth="3" strokeLinejoin="round" opacity="0.95">
        <path d="M14 32 a12 12 0 0 1 4 -22 a14 14 0 0 1 26 -2 a12 12 0 0 1 20 8 a10 10 0 0 1 -2 16 z" />
      </g>
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
  gevraagd,
  vos = { vangend: null, wachtend: null, blij: null },
  fase = "bezig",
  beweegt = true,
}: {
  huizen: Huis[];
  /** Welk huis de vraag is: dat is de lege deur met het vraagteken. */
  gevraagd: number;
  vos?: Voshoudingen;
  fase?: "bezig" | "goed" | "fout";
  /** Uit in het beheer: daar hoeft er niets te bewegen. */
  beweegt?: boolean;
}) {
  const plan = huizenPlan(huizen);
  const goed = fase === "goed";

  /*
    De deur zwaait pas ná een tel open. Zonder die pauze staat hij al open
    voordat het kind doorheeft dat zijn antwoord goed was, en mist het precies
    het moment waar het om gaat: het nummer dat op de deur verschijnt.
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

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  /* De stoep loopt onder elke rij door; hier de y van de bovenste rij. */
  const stoepY = LUCHT + plan.huishoogte - STOEP * 0.1;

  return (
    <div ref={buitenRef} className="mx-auto w-full max-w-xl">
      <div
        ref={vakRef}
        className="relative w-full overflow-hidden rounded-groot border-2 border-rand bg-gradient-to-b from-[#bfe4fb] to-[#eaf7ff] p-3 shadow-op sm:p-4"
      >
        <div
          ref={vlakRef}
          className="relative w-full"
          style={{ aspectRatio: `100 / ${plan.hoogte}` }}
        >
          {/* Wolkjes in de lucht, langzaam drijvend. */}
          <span
            aria-hidden="true"
            className="absolute w-[18%] motion-safe:animate-wolk"
            style={{ left: "8%", top: "1%" }}
          >
            <Wolk />
          </span>
          <span
            aria-hidden="true"
            className="absolute w-[14%] motion-safe:animate-wolk"
            style={{ left: "62%", top: "3%", animationDelay: "-9s" }}
          >
            <Wolk />
          </span>

          {/* De stoep waar de huizen op staan, onder elke rij. */}
          <Stoep y={stoepY} hoogte={plan.hoogte} />
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

          {/* De boom links en de lantaarnpaal rechts, naast de rij huizen. */}
          <span
            aria-hidden="true"
            className="absolute w-[8%]"
            style={{
              left: "1%",
              top: `${((LUCHT + plan.huishoogte * 0.12) / plan.hoogte) * 100}%`,
              height: `${((plan.huishoogte * 0.95) / plan.hoogte) * 100}%`,
            }}
          >
            <Boom />
          </span>
          <span
            aria-hidden="true"
            className="absolute w-[5%]"
            style={{
              right: "1.5%",
              top: `${((LUCHT + plan.huishoogte * 0.2) / plan.hoogte) * 100}%`,
              height: `${((plan.huishoogte * 0.88) / plan.hoogte) * 100}%`,
            }}
          >
            <Lantaarnpaal />
          </span>

          {huizen.map((huis, i) => {
            const plek = plan.plekken[i];
            /*
              Alle nummers staan er, behalve dat ene: dát is de vraag. De
              zichtbare nummers zijn de aanwijzing waarmee het kind het
              ontbrekende getal kan vinden — net als bij de stapstenen.
            */
            const zichtbaar = i !== gevraagd || goed;
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
                  gevraagd={i === gevraagd}
                  bloem={i === huizen.length - 1}
                  raamAan={i === 0}
                />
              </span>
            );
          })}

          {/* Een vogeltje op het dak van het tweede huis. */}
          {plan.plekken[1] && (
            <span
              aria-hidden="true"
              className="absolute w-[6%]"
              style={{
                left: `${plan.plekken[1].x + plan.breedte * 0.62}%`,
                top: `${((plan.plekken[1].y - plan.huishoogte * 0.07) / plan.hoogte) * 100}%`,
              }}
            >
              <Vogel />
            </span>
          )}

          {/* En een kat op de stoep, voor het eerste huis. */}
          {plan.plekken[0] && (
            <span
              aria-hidden="true"
              className="absolute w-[7%]"
              style={{
                left: `${plan.plekken[0].x - plan.breedte * 0.12}%`,
                top: `${((stoepY - STOEP * 0.28) / plan.hoogte) * 100}%`,
              }}
            >
              <Kat />
            </span>
          )}
        </div>
      </div>

      {/*
        Vos staat buiten de straat, en pas ná een goed antwoord.

        Tijdens de vraag is hij er niet: hij hoorde tussen de huizen te staan en
        maakte het daar alleen maar druk — een kind moet naar de deuren kijken,
        niet naar hem. Zodra het antwoord goed is, duikt hij onder het straatje
        op om blij te zijn. Dat is het rustigst: alle drukte valt in het moment
        waarop er niets meer te denken valt.
      */}
      {vos.vangend && goed && (
        <div ref={vosRef} aria-hidden="true" className="mt-2 flex justify-center">
          <span className="block w-20 sm:w-24">
            <Vosbeeld houdingen={vos} stand="blij" />
          </span>
        </div>
      )}
    </div>
  );
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
