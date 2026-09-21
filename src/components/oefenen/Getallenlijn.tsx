"use client";

/**
 * De getallenlijn: zet de getallen op de goede plek.
 *
 * ---------------------------------------------------------------------------
 * Waarom een gewone rechte lijn
 * ---------------------------------------------------------------------------
 * Een kind ziet op school, op het digibord en in het rekenboek altijd dezelfde
 * rechte lijn met streepjes en een pijlpunt. Dat beeld hoort het hier te
 * herkennen: het is het model waarmee het later leert rekenen met sprongen.
 * Daarom staat er niets op of aan de lijn — geen versiering, geen plaatjes.
 * De streepjes bij de tientallen zijn langer en dikker, die bij de vijftallen
 * iets langer dan de rest; precies zoals op schoolmateriaal, en het helpt om te
 * zien waar je bent.
 *
 * Het speelse zit ernaast: Vos loopt boven de lijn mee, en de getallen die het
 * kind neerlegt zijn vrolijke kaartjes met een dikke rand, een lichte glans en
 * een zachte schaduw.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit geen tekening is maar echte opmaak
 * ---------------------------------------------------------------------------
 * Bij een tekening (SVG) schaalt álles mee met de breedte van het scherm, dus
 * ook de getallen: eenentwintig streepjes op een telefoon zouden cijfers van
 * acht pixels geven. Hier staan de lijn en de streepjes wel op maat van het
 * scherm, maar de getallen eronder in echte letters die niet meekrimpen. Staan
 * er zoveel streepjes dat de getallen elkaar zouden raken, dan gaan ze om en om
 * hoog en laag staan — dezelfde truc als op een liniaal.
 *
 * ---------------------------------------------------------------------------
 * Hoe het neerleggen werkt
 * ---------------------------------------------------------------------------
 * Slepen met de vinger of de muis, of tikken: tik een kaartje aan en tik daarna
 * de plek op de lijn. Precies de bediening van "Tellen en slepen" en de trein,
 * met dezelfde pointer-gebeurtenissen — de ingebouwde `draggable` van HTML doet
 * op een touchscreen niets.
 *
 * Losgelaten boven de lijn klikt het kaartje vast op het dichtstbijzijnde
 * streepje. Mikken op het streepje zelf hoeft dus niet: bij eenentwintig
 * streepjes op een telefoon is er maar zestien pixels per streepje, en een
 * kindervinger is breder dan dat.
 */

import { useEffect, useRef, useState } from "react";
import { Vosbeeld, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";
import { opgavegeluidStaatAan, plop } from "@/lib/geluid";
import type { Figuur } from "@/lib/generatoren/soort";

type Getallenlijnfiguur = Extract<Figuur, { soort: "getallenlijn" }>;

/** Wat er links en rechts vrij blijft, in %. De lijn vult de breedte niet helemaal. */
const LINKS = 6;
const RECHTS = 11;

/** De kleur van de lijn en de streepjes: licht, zodat het rustig blijft. */
const LIJNKLEUR = "rgba(44, 37, 69, 0.42)";

/** De maten van de strook, in echte pixels. */
const MAAT = {
  /** Hoe hoog Vos met zijn vlaggetje boven de lijn staat. */
  vos: 78,
  /** Dikte van de lijn zelf: één haarlijn, zoals op een werkblad. */
  lijn: 1.5,
  /** Lengte van een streepje: gewoon, vijftal, tiental. Allemaal even dun. */
  streep: { gewoon: 7, vijf: 10, tien: 15 },
  /** Ruimte tussen het langste streepje en de bovenkant van de getallen. */
  onderLijn: 5,
  /** Hoogte van de ene regel met getallen. */
  regel: 20,
};

/** Waar streepje nummer `i` staat, in procenten van de breedte. */
export function plekPct(i: number, aantal: number): number {
  if (aantal <= 1) return LINKS;
  return LINKS + (i * (100 - LINKS - RECHTS)) / (aantal - 1);
}

/** Alle getallen waar een streepje voor staat. */
export function streepwaarden(start: number, eind: number, stap: number): number[] {
  const veilig = stap > 0 ? stap : 1;
  const uit: number[] = [];
  for (let n = start; n <= eind; n += veilig) uit.push(n);
  return uit;
}

/**
 * Hoe lang een streepje is.
 *
 * Alleen de lengte verschilt, niet de dikte: dat geeft structuur zonder dat de
 * lijn zwaar wordt. Zo staat het ook op een liniaal en op een werkblad.
 */
function streeplengte(n: number): number {
  if (n % 10 === 0) return MAAT.streep.tien;
  if (n % 5 === 0) return MAAT.streep.vijf;
  return MAAT.streep.gewoon;
}

/** Elk streepje even dun; het wijzertje is het enige dat dikker mag zijn. */
const STREEPDIKTE = 1.5;


/**
 * Het vlaggetje met het gezochte getal.
 *
 * Een driehoekig vaantje aan een stokje. Vos houdt het in zijn poot terwijl
 * het kind hem over de lijn schuift; staat hij goed, dan plant hij het in de
 * grond op zijn streepje en blijft het daar staan.
 *
 * Het vaantje heeft een vaste maat in echte pixels en krimpt dus niet mee met
 * de breedte van het scherm: het getal blijft op een telefoon even leesbaar.
 * Het hangt bóven de lijn, zodat het de streepjes en de getallen eronder nooit
 * afdekt.
 */
const VLAG = {
  breedte: 46,
  hoogte: 30,
  /* In zijn poot: het stokje begint laag bij zijn hand en steekt boven hem uit. */
  stok: 48,
  pootHoogte: 14,
  /* In de grond: korter, want het staat op het streepje zelf. */
  geplantStok: 34,
};

function Vlaggetje({ getal, geplant = false }: { getal: number; geplant?: boolean }) {
  const kleur = geplant ? "var(--color-groen)" : "var(--color-huisstijl)";
  /* Bij drie cijfers past er minder in het vaantje; dan iets kleiner. */
  const cijfers = String(getal).length;
  const letter = cijfers >= 3 ? 13 : 16;
  return (
    <svg
      viewBox={`0 0 ${VLAG.breedte} ${VLAG.hoogte}`}
      width={VLAG.breedte}
      height={VLAG.hoogte}
      className="block"
      aria-hidden="true"
    >
      {/* Het vaantje: een wimpel die naar rechts uitloopt. */}
      <path
        d={`M1 1 L${VLAG.breedte - 2} ${VLAG.hoogte / 2} L1 ${VLAG.hoogte - 1} Z`}
        fill={kleur}
        stroke="#ffffff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <text
        x={15}
        y={VLAG.hoogte / 2 + 0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={letter}
        fontWeight="800"
        fill="#ffffff"
      >
        {getal}
      </text>
    </svg>
  );
}

/** Hoe een getal onder de lijn getoond wordt. */
type Onderschrift = { tekst: string; kleur: string };

/**
 * De lijn zelf: streepjes, getallen eronder en Vos die erboven staat.
 *
 * Alles wat de vraag, de uitleg en het voorbeeld in beheer allebei nodig
 * hebben staat hier. De vraag legt er alleen zijn eigen bediening overheen.
 */
export function Getallenlijnbeeld({
  start,
  eind,
  stap,
  zichtbaar,
  vosBij = null,
  vos = null,
  vosStand = "wachtend",
  vlag = null,
  geplant = false,
  mislukt = false,
  juist = null,
  nadruk = null,
  aangeraakt = false,
  stripRef,
  onVosPak,
  onVosToets,
  onTik,
}: {
  start: number;
  eind: number;
  stap: number;
  /** De getallen die vast onder de lijn staan. */
  zichtbaar: number[];
  /** Bij welk streepje Vos staat; `null` = helemaal links. */
  vosBij?: number | null;
  vos?: Voshoudingen | null;
  vosStand?: "wachtend" | "blij" | "verbaasd";
  /** Het getal op het vlaggetje dat Vos vasthoudt. */
  vlag?: number | null;
  /** Staat het vlaggetje in de grond? Dan houdt Vos het niet meer vast. */
  geplant?: boolean;
  /** Het planten lukte niet: het vaantje stuitert even terug. */
  mislukt?: boolean;
  /** Na een fout antwoord: waar het getal wél hoorde. */
  juist?: number | null;
  /** Een getal dat oplicht in de uitleg. */
  nadruk?: number | null;
  /** Het kind heeft Vos vast: dan licht het streepje onder hem op. */
  aangeraakt?: boolean;
  stripRef?: React.RefObject<HTMLDivElement | null>;
  /** Vos vastpakken om te schuiven; alleen in de vraag. */
  onVosPak?: (e: React.PointerEvent) => void;
  /** Vos met de pijltjestoetsen verplaatsen. */
  onVosToets?: (e: React.KeyboardEvent) => void;
  /** Tikken op een streepje; alleen in de vraag. */
  onTik?: (getal: number) => void;
}) {
  const waarden = streepwaarden(start, eind, stap);
  const aantal = waarden.length;

  /*
    Hoeveel ruimte er per streepje is, in echte pixels.

    Daarmee wordt de letter van de getallen bepaald: ze staan op één rij, dus
    hoe dichter de streepjes op elkaar staan, hoe kleiner de cijfers moeten
    zijn om elkaar niet te raken. Zonder meten kan dat niet — het hangt af van
    de breedte van het scherm, en die verandert als je de telefoon draait.
  */
  const eigenRef = useRef<HTMLDivElement | null>(null);
  const strook = stripRef ?? eigenRef;
  const [perStreepje, setPerStreepje] = useState<number | null>(null);
  useEffect(() => {
    const el = strook.current;
    if (!el) return;
    function meet() {
      const breed = el?.getBoundingClientRect().width ?? 0;
      if (breed <= 0) return;
      const nuttig = (breed * (100 - LINKS - RECHTS)) / 100;
      const per = aantal > 1 ? nuttig / (aantal - 1) : nuttig;
      setPerStreepje((vorig) => (vorig !== null && Math.abs(vorig - per) < 0.5 ? vorig : per));
    }
    meet();
    const kijker = new ResizeObserver(meet);
    kijker.observe(el);
    return () => kijker.disconnect();
  }, [aantal, strook]);

  /*
    De letterhoogte van de getallen.

    Een cijfer is ongeveer 0,62 keer de letterhoogte breed; met vier pixels
    lucht ertussen mag een getal dus zo groot zijn als de ruimte per streepje
    toelaat. Op een breed scherm komt daar de gewone 15 uit, op een telefoon
    met alle getallen van 0 tot 20 zakt hij naar 11.
  */
  const cijfers = Math.max(String(start).length, String(eind).length);
  const letter =
    perStreepje === null
      ? 15
      : Math.max(11, Math.min(15, (perStreepje - 4) / (0.62 * cijfers)));

  /*
    Hoeveel ruimte er boven de lijn nodig is.

    Staat Vos er met zijn vlaggetje, dan het meeste; staat alleen het vaantje
    er — in de uitleg is dat zo — dan genoeg voor het stokje; en staat er
    niets, dan alleen wat lucht.
  */
  const lijnY = vos ? MAAT.vos : vlag !== null ? 58 : 14;
  const getalY = lijnY + MAAT.streep.tien + MAAT.onderLijn;
  const hoogte = getalY + MAAT.regel;

  /* Wat er onder elk streepje komt te staan, en in welke kleur. */
  const onderschrift = new Map<number, Onderschrift>();
  for (const n of zichtbaar) {
    onderschrift.set(n, {
      tekst: String(n),
      kleur: nadruk === n ? "text-huisstijl-diep" : "text-inkt",
    });
  }
  /* Na een fout antwoord staat het gezochte getal in het groen op zijn eigen plek. */
  if (juist !== null) onderschrift.set(juist, { tekst: String(juist), kleur: "text-groen-diep" });

  const vosIndex = vosBij === null ? 0 : Math.max(0, waarden.indexOf(vosBij));
  const vosWaarde = waarden[vosIndex] ?? start;

  return (
    <div
      ref={strook}
      className="relative w-full"
      style={{ height: hoogte }}
      role="group"
      aria-label={`Een getallenlijn van ${start} tot en met ${eind}`}
    >
      {/* De lijn: één dunne haarlijn met een klein pijlpuntje aan het eind. */}
      <div
        className="absolute"
        style={{ left: 0, right: "3%", top: lijnY, height: MAAT.lijn, background: LIJNKLEUR }}
      />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          right: "1.5%",
          top: lijnY + MAAT.lijn / 2 - 4.5,
          width: 0,
          height: 0,
          borderTop: "4.5px solid transparent",
          borderBottom: "4.5px solid transparent",
          borderLeft: `9px solid ${LIJNKLEUR}`,
        }}
      />

      {/* De streepjes: allemaal even dun, alleen de lengte verschilt. */}
      {waarden.map((n, i) => {
        const lengte = streeplengte(n);
        /* Het streepje waar Vos op staat licht op zolang het kind hem vasthoudt. */
        const licht = aangeraakt && n === vosWaarde;
        return (
          <div
            key={`streep-${n}`}
            className="absolute -translate-x-1/2"
            style={{
              left: `${plekPct(i, aantal)}%`,
              top: lijnY,
              width: licht ? 2.5 : STREEPDIKTE,
              height: licht ? Math.max(lengte, MAAT.streep.tien) + 3 : lengte,
              background: licht ? "var(--color-huisstijl)" : LIJNKLEUR,
            }}
          />
        );
      })}

      {/* De getallen eronder: gewone letter, op één rij, netjes onder hun streepje. */}
      {waarden.map((n, i) => {
        const tekst = onderschrift.get(n);
        if (!tekst) return null;
        return (
          <span
            key={`getal-${n}`}
            className={`absolute -translate-x-1/2 text-center tabular-nums leading-none ${tekst.kleur}`}
            style={{
              left: `${plekPct(i, aantal)}%`,
              top: getalY,
              fontSize: `${letter.toFixed(1)}px`,
            }}
          >
            {tekst.tekst}
          </span>
        );
      })}

      {/*
        Vos met zijn vlaggetje.

        Hij staat bóven de lijn en schuift alleen naar links en rechts; het
        vlaggetje gaat met hem mee. Klopt het, dan staat het stokje in de grond
        op zijn streepje en gaat Vos er een stukje naast staan. Alles hierboven
        de lijn, zodat de streepjes en de getallen vrij blijven.
      */}
      {(vos || vlag !== null) && (
        <span
          className="absolute z-10 transition-[left] duration-150 ease-out"
          style={{ left: `${plekPct(vosIndex, aantal)}%`, bottom: hoogte - lijnY, width: 0, height: 0 }}
        >
          {/* Het stokje: in zijn poot, of in de grond op het streepje. */}
          {vlag !== null && (
            <span
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: geplant ? -1 : 9,
                bottom: geplant ? 0 : VLAG.pootHoogte,
                width: 2,
                height: geplant ? VLAG.geplantStok : VLAG.stok,
                background: geplant ? "var(--color-groen)" : "var(--color-huisstijl)",
              }}
            />
          )}

          {/* Het vaantje aan de top van het stokje. */}
          {vlag !== null && (
            <span
              className={`absolute ${mislukt ? "motion-safe:animate-vlag-mislukt" : ""}`}
              style={{
                left: geplant ? 1 : 11,
                bottom: geplant
                  ? VLAG.geplantStok - VLAG.hoogte
                  : VLAG.pootHoogte + VLAG.stok - VLAG.hoogte,
              }}
            >
              <Vlaggetje getal={vlag} geplant={geplant} />
            </span>
          )}

          {vos && (
            <span
              className={`absolute bottom-0 block w-10 sm:w-12 ${
                vosStand === "verbaasd" ? "motion-safe:animate-vos-verbaasd" : ""
              }`}
              style={{ left: 0, transform: `translateX(${geplant ? "-92%" : "-50%"})` }}
            >
              {onVosPak ? (
                <button
                  type="button"
                  onPointerDown={onVosPak}
                  onKeyDown={onVosToets}
                  aria-label={
                    vlag === null
                      ? `Vos staat bij ${vosWaarde}. Schuif hem naar het goede getal.`
                      : `Vos staat bij ${vosWaarde} met het vlaggetje ${vlag}. Schuif hem naar het goede getal.`
                  }
                  className={`block w-full cursor-grab touch-none rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-huisstijl ${
                    aangeraakt ? "cursor-grabbing scale-105" : ""
                  }`}
                >
                  <Vosbeeld
                    houdingen={vos}
                    stand={vosStand === "blij" ? "blij" : "wachtend"}
                    stil={vosStand !== "blij"}
                  />
                </button>
              ) : (
                <span aria-hidden="true" className="block">
                  <Vosbeeld
                    houdingen={vos}
                    stand={vosStand === "blij" ? "blij" : "wachtend"}
                    stil={vosStand !== "blij"}
                  />
                </span>
              )}
            </span>
          )}
        </span>
      )}

      {/*
        Onzichtbare knoppen op elk streepje.

        Voor het toetsenbord en voor een voorleesprogramma, en om Vos met een
        tik ergens naartoe te sturen. Met de vinger wordt er op de hele strook
        gemikt en schuift hij naar het dichtstbijzijnde streepje.
      */}
      {onTik &&
        waarden.map((n, i) => (
          <div
            key={`knop-${n}`}
            role="button"
            tabIndex={0}
            aria-label={`Streepje${onderschrift.has(n) ? ` bij ${n}` : ` tussen ${start} en ${eind}`}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTik(n);
              }
            }}
            className="absolute -translate-x-1/2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-huisstijl"
            style={{
              left: `${plekPct(i, aantal)}%`,
              top: lijnY - 14,
              width: `${Math.max(6, (100 - LINKS - RECHTS) / Math.max(1, aantal - 1))}%`,
              height: hoogte - lijnY + 10,
            }}
          />
        ))}
    </div>
  );
}

/**
 * De hele vraag: het gezochte getal groot in beeld en Vos op de lijn.
 *
 * `ingevuld` is één getal: het streepje waar Vos staat, of `null` zolang het
 * kind hem nog niet verschoven heeft. Dat is precies wat het antwoordscherm
 * doorgeeft en teruglevert.
 */
export function Getallenlijn({
  figuur,
  ingevuld,
  fase,
  onWijzig,
  onKlaar,
}: {
  figuur: Getallenlijnfiguur;
  ingevuld: (number | null)[];
  fase: "bezig" | "goed" | "fout";
  onWijzig: (nieuw: (number | null)[]) => void;
  /** Vos heeft zijn vlag geplant; het feestscherm mag eroverheen. */
  onKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const waarden = streepwaarden(figuur.start, figuur.eind, figuur.stap);
  const strip = useRef<HTMLDivElement | null>(null);

  /*
    Waar Vos staat terwijl het kind hem vasthoudt.

    Tijdens het schuiven blijft dat hier: pas bij loslaten gaat het antwoord
    naar buiten. Zo klikt hij wel bij elke beweging vast op het dichtstbijzijnde
    streepje — dat ziet het kind meteen — zonder dat er bij elke vingerbeweging
    een antwoord wordt vastgelegd.
  */
  const [sleepBij, setSleepBij] = useState<number | null>(null);

  /*
    Hetzelfde, maar dan meteen bijgewerkt.

    Een vinger kan al bewegen voordat React opnieuw getekend heeft. Leest het
    schuiven de gewone state, dan mist het die eerste beweging en blijft Vos
    achter. Daarom houden twee refs de stand van nú bij.
  */
  const sleept = useRef(false);
  const nuBij = useRef<number | null>(null);

  const vosBij = sleepBij ?? ingevuld[0] ?? figuur.start;

  /* Bij een goed antwoord plant Vos zijn vlag; daarna pas het feest. */
  const klaar = useRef(onKlaar);
  useEffect(() => {
    klaar.current = onKlaar;
  }, [onKlaar]);
  useEffect(() => {
    if (fase !== "goed") return;
    const minder = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const klok = setTimeout(() => klaar.current?.(), minder ? 200 : 1200);
    return () => clearTimeout(klok);
  }, [fase]);

  /** Het streepje dat het dichtst bij deze x ligt. Hoogte telt niet mee. */
  function streepjeBij(x: number): number {
    const el = strip.current;
    if (!el) return vosBij;
    const r = el.getBoundingClientRect();
    const pct = ((x - r.left) / r.width) * 100;
    let beste = waarden[0];
    let afstand = Infinity;
    waarden.forEach((n, i) => {
      const d = Math.abs(plekPct(i, waarden.length) - pct);
      if (d < afstand) {
        afstand = d;
        beste = n;
      }
    });
    return beste;
  }

  function pak(e: React.PointerEvent) {
    if (uit) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Geen bezwaar: het schuiven werkt dan alleen minder vergevingsgezind. */
    }
    sleept.current = true;
    nuBij.current = vosBij;
    setSleepBij(vosBij);
  }

  function beweeg(e: React.PointerEvent) {
    if (!sleept.current || uit) return;
    const nu = streepjeBij(e.clientX);
    if (nu !== nuBij.current) {
      nuBij.current = nu;
      setSleepBij(nu);
      /* Elk streepje geeft een tikje: zo hoor je dat hij echt vastklikt. */
      if (opgavegeluidStaatAan()) plop();
    }
  }

  function losLaten() {
    if (!sleept.current) return;
    const plek = nuBij.current ?? vosBij;
    sleept.current = false;
    nuBij.current = null;
    setSleepBij(null);
    onWijzig([plek]);
  }

  /** Tikken op een streepje: Vos loopt er in één keer naartoe. */
  function tikStreepje(n: number) {
    if (uit) return;
    onWijzig([n]);
    if (opgavegeluidStaatAan()) plop();
  }

  /** Met de pijltjestoetsen: één streepje tegelijk. */
  function toets(e: React.KeyboardEvent) {
    if (uit) return;
    const richting = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (richting === 0) return;
    e.preventDefault();
    const nu = waarden.indexOf(vosBij);
    const volgende = waarden[Math.min(waarden.length - 1, Math.max(0, nu + richting))];
    if (volgende !== undefined) onWijzig([volgende]);
  }

  const houdingen: Voshoudingen | null =
    figuur.vos.wachtend || figuur.vos.blij
      ? {
          vangend: figuur.vos.wachtend ?? figuur.vos.blij,
          wachtend: figuur.vos.wachtend,
          blij: figuur.vos.blij,
        }
      : null;

  return (
    <div
      className="flex w-full flex-col items-center gap-4"
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      <div className="w-full px-1">
        <Getallenlijnbeeld
          start={figuur.start}
          eind={figuur.eind}
          stap={figuur.stap}
          zichtbaar={figuur.zichtbaar}
          vosBij={vosBij}
          vos={houdingen}
          vosStand={fase === "goed" ? "blij" : fase === "fout" ? "verbaasd" : "wachtend"}
          vlag={figuur.doel}
          geplant={fase === "goed"}
          mislukt={fase === "fout"}
          juist={fase === "fout" ? figuur.doel : null}
          aangeraakt={sleepBij !== null}
          stripRef={strip}
          onVosPak={uit ? undefined : pak}
          onVosToets={uit ? undefined : toets}
          onTik={uit ? undefined : tikStreepje}
        />
      </div>

      {fase === "bezig" && (
        <p className="text-center text-sm font-bold text-inkt-zacht">
          {ingevuld[0] === null && sleepBij === null
            ? "Pak Vos vast en schuif hem naar het goede getal."
            : "Klopt het niet? Schuif Vos gerust nog een streepje op."}
        </p>
      )}
    </div>
  );
}
