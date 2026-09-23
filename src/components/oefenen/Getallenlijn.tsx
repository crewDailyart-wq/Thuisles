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

import { Fragment, useEffect, useRef, useState } from "react";
import { Vosbeeld, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
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
  /**
   * Lengte van een streepje: gewoon, vijftal, tiental. Allemaal even dun.
   *
   * Twee keer zo lang als eerst, in alle standen en dus ook in het voorbeeld
   * in beheer en in de uitleganimatie: op een dunne lijn waren ze te klein om
   * te zien waar een getal precies hoort.
   */
  streep: { gewoon: 14, vijf: 20, tien: 30 },
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

/**
 * Waar een getal op de lijn ligt, in procenten van de breedte.
 *
 * Anders dan `plekPct` hoeft dit getal niet op een streepje te liggen: het
 * wijzertje van de tussenstand staat juist ertússen.
 */
export function plekVoorWaarde(waarde: number, start: number, eind: number): number {
  if (eind <= start) return LINKS;
  const deel = (waarde - start) / (eind - start);
  return LINKS + Math.min(1, Math.max(0, deel)) * (100 - LINKS - RECHTS);
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

/** Halve kier tussen de twee vakjes in de tussenstand, en de lucht tot de rand. */
const HALVE_KIER = 3;
const KANTLIJN = 2;


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

/**
 * Het wijzertje van de tussenstand.
 *
 * Een klein vlak met het gezochte getal erin en een puntje naar beneden, op de
 * plek waar dat getal op de lijn ligt. In de huisstijlkleur, want het is het
 * enige waar de vraag over gaat.
 */
function Wijzertje({ getal, licht = false }: { getal: number; licht?: boolean }) {
  /* Oplichten in de uitleg mag opvallen; in de vraag blijft het rustig. */
  const kleur = licht ? "var(--color-huisstijl-diep)" : "var(--color-inkt)";
  return (
    <span className="flex flex-col items-center">
      <span
        className="block text-2xl font-extrabold leading-none tabular-nums sm:text-3xl"
        style={{ color: kleur }}
      >
        {getal}
      </span>
      {/* Een dun pijltje dat naar de plek op de lijn wijst. */}
      <span aria-hidden="true" style={{ width: 1.5, height: 9, background: kleur, marginTop: 3 }} />
      <span
        aria-hidden="true"
        style={{
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `6px solid ${kleur}`,
        }}
      />
    </span>
  );
}

/** Hoe een getal onder de lijn getoond wordt. */
type Onderschrift = { tekst: string; kleur: string; nadruk?: boolean };

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
  vakjes = [],
  getypt = [],
  vakuitslagen = [],
  opDeLijn = false,
  wijzer = null,
  onTyp,
  onBevestig,
  juist = null,
  nadruk = null,
  aangeraakt = false,
  foutBij = null,
  goedBij = null,
  vrij = false,
  hulplijnen = [],
  wijstAan = true,
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
  /** De streepjes waar een leeg vakje boven staat, van links naar rechts. */
  vakjes?: number[];
  /** Wat er in die vakjes staat. Even lang als `vakjes`. */
  getypt?: string[];
  /** Per vakje of het klopt; pas na Controleer. */
  vakuitslagen?: ("goed" | "fout" | null)[];
  /**
   * Staan de vakjes óp de lijn, op de plek van het getal zelf?
   *
   * Zo werkt de tussenstand: het vakje staat op de hoogte van de getallen
   * onder de andere streepjes, zodat de rij netjes doorloopt. Anders staan ze
   * erboven met een pijltje ernaartoe.
   */
  opDeLijn?: boolean;
  /** Het getal op het wijzertje boven de lijn, en of het oplicht. */
  wijzer?: { getal: number; licht?: boolean } | null;
  /** Typen in vakje nummer zoveel. Ontbreekt = de vakjes zijn alleen om te laten zien. */
  onTyp?: (nummer: number, tekst: string) => void;
  /** Enter in een vakje: hetzelfde als op Controleer drukken. */
  onBevestig?: () => void;
  /** Na een fout antwoord: waar het getal wél hoorde. */
  juist?: number | null;
  /** Een getal dat oplicht in de uitleg. */
  nadruk?: number | null;
  /** Het kind heeft Vos vast: dan licht het streepje onder hem op. */
  aangeraakt?: boolean;
  /**
   * Het streepje waar het fout ging.
   *
   * Na een fout antwoord blijft de streep staan waar Vos stond, maar dan in
   * het rood, met het getal eronder. Zo ziet het kind waar het naartoe is
   * geschoven en welk getal daar hoort.
   */
  foutBij?: number | null;
  /** Het streepje waar het getal écht ligt; groen, bij het nakijken. */
  goedBij?: number | null;
  /**
   * Een vrije lijn: geen raster van streepjes maar alles op zijn eigen plek.
   *
   * Voor de schatstand. Alleen het begin, het eind en de `hulplijnen` krijgen
   * een streepje; Vos en de markeringen staan op de plek die bij hun getal
   * hoort, ook als dat tussen twee hele getallen in valt.
   */
  vrij?: boolean;
  /** Welke getallen een hulpstreepje krijgen op een vrije lijn. */
  hulplijnen?: number[];
  /**
   * Mogen de lijntjes van de streepjes naar de vakjes al te zien zijn?
   *
   * In de tussenstand verklappen die het antwoord: ze wijzen precies de twee
   * tientallen aan waar het getal tussen ligt. Zolang het kind nog bezig is
   * staat het paar vakjes daarom zonder lijntjes midden onder de lijn; pas na
   * Controleer schuift het naar zijn plek en komen de lijntjes erbij.
   */
  wijstAan?: boolean;
  stripRef?: React.RefObject<HTMLDivElement | null>;
  /** Vos vastpakken om te schuiven; alleen in de vraag. */
  onVosPak?: (e: React.PointerEvent) => void;
  /** Vos met de pijltjestoetsen verplaatsen. */
  onVosToets?: (e: React.KeyboardEvent) => void;
  /** Tikken op een streepje; alleen in de vraag. */
  onTik?: (getal: number) => void;
}) {
  /*
    Waar er streepjes staan.

    Normaal het hele raster van de stapgrootte. Op een vrije lijn alleen het
    begin, het eind en de hulpstreepjes; alles daartussen staat op zijn eigen
    plek in plaats van op een streepje.
  */
  const waarden = vrij
    ? [...new Set([start, ...hulplijnen, eind])].sort((a, b) => a - b)
    : streepwaarden(start, eind, stap);
  const aantal = waarden.length;

  /** Waar een getal staat, in procenten: op zijn streepje of op zijn eigen plek. */
  const plek = (waarde: number, index: number) =>
    vrij ? plekVoorWaarde(waarde, start, eind) : plekPct(index, aantal);

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
  /* De hele breedte van de strook; nodig om in pixels te kunnen plaatsen. */
  const [strookBreed, setStrookBreed] = useState<number | null>(null);
  useEffect(() => {
    const el = strook.current;
    if (!el) return;
    function meet() {
      const breed = el?.getBoundingClientRect().width ?? 0;
      if (breed <= 0) return;
      const nuttig = (breed * (100 - LINKS - RECHTS)) / 100;
      const per = aantal > 1 ? nuttig / (aantal - 1) : nuttig;
      setPerStreepje((vorig) => (vorig !== null && Math.abs(vorig - per) < 0.5 ? vorig : per));
      setStrookBreed((vorig) => (vorig !== null && Math.abs(vorig - breed) < 0.5 ? vorig : breed));
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
    Hoe groot een invulvakje mag zijn.

    Twee vakjes naast elkaar mogen elkaar nooit raken, dus de breedte volgt de
    ruimte tussen de twee dichtstbijzijnde vakjes. Op een breed scherm is dat
    de gewone maat, op een telefoon met vier vakjes wordt hij smaller. Onder de
    38 pixels gaat hij niet: dan past een getal van twee cijfers er niet meer
    leesbaar in.
  */
  const kleinsteGat = vakjes.reduce(
    (kleinst, n, i) =>
      i === 0 ? kleinst : Math.min(kleinst, Math.abs(n - vakjes[i - 1]) / Math.max(1, stap)),
    Number.POSITIVE_INFINITY,
  );
  /*
    Hoe groot een invulvakje wordt.

    Op de lijn is het altijd een vierkant van 116 pixels — zo'n drie bij drie
    centimeter, net als het invulvak bij de andere oefeningen. Ook op een
    drukke lijn blijft die maat staan: de twee vakjes gaan dan niet op hun
    streepje staan maar naast elkaar rond het midden ertussen, met een schuin
    lijntje naar hun eigen streepje. Naast de lijn — in de invulstand — volgt
    de breedte wel de ruimte tussen de vakjes.
  */
  const VAK_MAX = 116;
  const zijde = VAK_MAX;
  /* Zolang de strook nog niet gemeten is, valt er niets in pixels te plaatsen. */
  const paarLayout = opDeLijn && strookBreed !== null && vakjes.length === 2;

  const vakBreedte = opDeLijn
    ? zijde
    : perStreepje === null || !Number.isFinite(kleinsteGat)
      ? 60
      : Math.max(38, Math.min(64, kleinsteGat * perStreepje - 8));
  const vakHoogte = opDeLijn ? zijde : Math.max(32, Math.min(46, vakBreedte * 0.76));
  const vakLetter = opDeLijn
    ? Math.max(16, Math.min(44, zijde * 0.42))
    : Math.max(14, Math.min(22, vakBreedte * 0.36));

  /*
    Hoeveel ruimte er boven de lijn nodig is.

    Met invulvakjes zoveel als het vakje en zijn pijltje vragen; staat Vos er
    met zijn vlaggetje, dan het meeste; staat alleen het vaantje er — in de
    uitleg is dat zo — dan genoeg voor het stokje; en staat er niets, dan
    alleen wat lucht.
  */
  const lijnY = wijzer
    ? (vos ? MAAT.vos + 30 : 54)
    : vakjes.length > 0 && !opDeLijn
      ? vakHoogte + 36
      : vos
        ? MAAT.vos
        : vlag !== null
          ? 58
          : 14;
  const getalY = lijnY + MAAT.streep.tien + MAAT.onderLijn;
  /*
    Waar een vakje óp de lijn begint, en hoe hoog de strook dan moet zijn.

    Onder de rij getallen, met acht pixels lucht ertussen: zo raakt een breed
    vakje nooit een getal dat onder de lijn staat.
  */
  const vakTop = getalY + MAAT.regel + 8;
  const hoogte =
    vakjes.length > 0 && opDeLijn
      ? Math.max(getalY + MAAT.regel, vakTop + vakHoogte + 4)
      : getalY + MAAT.regel;

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
  /*
    En waar Vos stond staat zijn getal in het rood, groter dan de rest. Ook als
    daar al een getal stond: dan krijgt dat de rode kleur, zodat de rode streep
    en het getal bij elkaar horen.
  */
  if (foutBij !== null) {
    onderschrift.set(foutBij, { tekst: String(foutBij), kleur: "text-roze", nadruk: true });
  }
  /* En waar het getal écht ligt, in het groen. */
  if (goedBij !== null) {
    onderschrift.set(goedBij, { tekst: String(goedBij), kleur: "text-groen-diep", nadruk: true });
  }

  /*
    Welke getallen er een plek onder de lijn krijgen.

    Op een vrije lijn hoeft een getal niet op een streepje te staan — de rode
    en groene markering van het nakijken staan juist tussen de streepjes in.
  */
  const labelwaarden = vrij
    ? [...new Set([...waarden, ...onderschrift.keys()])].sort((a, b) => a - b)
    : waarden;

  /*
    Het toetsenbord van de tablet schuift over de pagina heen. `useInBeeld`
    zorgt dat het vakje waar het kind in typt én de knop Controleer zichtbaar
    blijven; dat werkt overal in de app hetzelfde.
  */
  const { bijAandacht, bijWeggaan } = useInBeeld();
  const vakvelden = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Toetsen in een invulvakje.
   *
   * Enter is hetzelfde als op Controleer drukken, met het toetsenbord eerst
   * dicht zodat de uitslag niet achter het toetsenbord verdwijnt. De
   * pijltjestoetsen springen naar het vakje ernaast, maar alleen als de cursor
   * al aan het begin of het eind van het getal staat — anders loopt het kind
   * binnen zijn eigen getal, zoals het hoort.
   */
  function toetsInVak(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      onBevestig?.();
      return;
    }
    const veld = e.currentTarget;
    const aanBegin = (veld.selectionStart ?? 0) === 0 && (veld.selectionEnd ?? 0) === 0;
    const aanEind =
      (veld.selectionStart ?? 0) === veld.value.length &&
      (veld.selectionEnd ?? 0) === veld.value.length;
    const richting =
      e.key === "ArrowLeft" && aanBegin ? -1 : e.key === "ArrowRight" && aanEind ? 1 : 0;
    if (richting === 0) return;
    const volgende = vakvelden.current[i + richting];
    if (!volgende) return;
    e.preventDefault();
    volgende.focus();
    volgende.select();
  }

  const vosIndex = vosBij === null ? 0 : Math.max(0, waarden.indexOf(vosBij));
  const vosWaarde = vrij ? (vosBij ?? start) : (waarden[vosIndex] ?? start);
  const vosPct = plek(vosWaarde, vosIndex);

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
      {labelwaarden.map((n, i) => {
        const lengte = streeplengte(n);
        /*
          Het streepje waar Vos op staat licht op zolang het kind hem
          vasthoudt, en blijft daarna staan als het antwoord fout was — dan in
          het rood, zodat meteen te zien is waar het misging. Bij het nakijken
          komt daar het groene streepje bij van de plek waar het getal écht
          ligt.
        */
        const licht = aangeraakt && n === vosWaarde;
        const fout = foutBij === n;
        const goed = goedBij === n;
        const uitgelicht = licht || fout || goed;
        /* Op een vrije lijn staat er alleen een streepje waar er ook een hoort. */
        if (vrij && !uitgelicht && !waarden.includes(n)) return null;
        return (
          <div
            key={`streep-${n}`}
            className="absolute -translate-x-1/2"
            style={{
              left: `${plek(n, vrij ? i : waarden.indexOf(n))}%`,
              top: lijnY,
              width: uitgelicht ? 2.5 : STREEPDIKTE,
              height: uitgelicht ? Math.max(lengte, MAAT.streep.tien) + 3 : lengte,
              background: fout
                ? "var(--color-roze)"
                : goed
                  ? "var(--color-groen)"
                  : licht
                    ? "var(--color-huisstijl)"
                    : LIJNKLEUR,
            }}
          />
        );
      })}

      {/* De getallen eronder: gewone letter, op één rij, netjes onder hun streepje. */}
      {labelwaarden.map((n, i) => {
        const tekst = onderschrift.get(n);
        if (!tekst) return null;
        return (
          <span
            key={`getal-${n}`}
            className={`absolute -translate-x-1/2 text-center tabular-nums leading-none ${tekst.kleur}`}
            style={{
              left: `${plek(n, vrij ? i : waarden.indexOf(n))}%`,
              top: getalY,
              /* Het foute getal iets groter en vet, zodat het opvalt. */
              fontSize: `${(tekst.nadruk ? Math.min(22, letter + 4) : letter).toFixed(1)}px`,
              fontWeight: tekst.nadruk ? 800 : undefined,
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
          style={{ left: `${vosPct}%`, bottom: hoogte - lijnY, width: 0, height: 0 }}
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

      {/* Het wijzertje met het gezochte getal, op zijn plek op de lijn. */}
      {wijzer && (
        <span
          className="absolute z-10 -translate-x-1/2"
          style={{
            left: `${plekVoorWaarde(wijzer.getal, start, eind)}%`,
            /* Loopt Vos eronder mee, dan gaat het wijzertje boven hem uit. */
            bottom: hoogte - lijnY + (vos ? MAAT.vos + 2 : 2),
          }}
        >
          <Wijzertje getal={wijzer.getal} licht={wijzer.licht} />
        </span>
      )}

      {/*
        De lege vakjes met hun pijltje.

        Elk vakje staat boven het streepje waar het bij hoort, met een stokje en
        een pijlpunt ernaartoe — net als op een werkblad. Het is een echt
        invoerveld: het kind typt er met het toetsenbord van het apparaat zelf
        in, en er komt geen nagebouwd cijfertoetsenbord op het scherm. Zie
        HARDE REGEL 5 in CLAUDE.md.
      */}
      {vakjes.map((n, i) => {
        const vakplek = waarden.indexOf(n);
        if (vakplek < 0) return null;
        const uitslag = vakuitslagen[i] ?? null;
        const kleur =
          uitslag === "goed"
            ? "border-groen bg-groen-zacht text-groen-diep"
            : uitslag === "fout"
              ? "border-roze bg-roze-zacht text-roze"
              : "border-rand bg-kaart text-inkt focus:border-huisstijl";
        /*
          Waar het vakje komt te staan.

          De twee vakjes blijven even groot en staan naast elkaar, samen
          gecentreerd onder het midden tussen de twee juiste streepjes. Valt het
          paar zo buiten de kaart — bij een tiental helemaal aan het begin of
          het eind van de lijn — dan schuift het paar als geheel naar binnen.
          Het lijntje loopt daarna gewoon mee naar zijn eigen vakje.
        */
        const tickPct = plekPct(vakplek, aantal);
        let plaatsing: React.CSSProperties = {
          left: `${tickPct}%`,
          transform: "translateX(-50%)",
          top: vakTop,
        };
        let haakje: { tickX: number; tickY: number; vakX: number } | null = null;

        if (paarLayout && strookBreed !== null) {
          const anderePlek = waarden.indexOf(vakjes[i === 0 ? 1 : 0]);
          const anderPct = plekPct(anderePlek, aantal);
          /*
            Waar het paar onder komt te hangen.

            Wijzen de lijntjes al aan, dan onder het midden tussen de twee
            juiste streepjes. Zo niet, dan precies midden onder de lijn: dan
            zegt de plek van de vakjes nog niets over het antwoord.
          */
          const middenPct = wijstAan
            ? (tickPct + anderPct) / 2
            : (LINKS + (100 - RECHTS)) / 2;
          /* Het midden van het paar, zo nodig naar binnen geschoven. */
          const halveBreedte = zijde + HALVE_KIER;
          const middenX = Math.min(
            Math.max((middenPct / 100) * strookBreed, halveBreedte + KANTLIJN),
            strookBreed - halveBreedte - KANTLIJN,
          );
          /* Links of rechts in het paar: het kleinste getal staat links. */
          const naarLinks = tickPct < anderPct;
          const midX = middenX + (naarLinks ? -1 : 1) * (zijde / 2 + HALVE_KIER);
          plaatsing = { left: midX, transform: "translateX(-50%)", top: vakTop };
          if (wijstAan) {
            haakje = {
              tickX: (tickPct / 100) * strookBreed,
              tickY: lijnY + streeplengte(n),
              vakX: midX,
            };
          }
        }

        if (!opDeLijn) plaatsing = { left: `${tickPct}%`, transform: "translateX(-50%)", bottom: hoogte - lijnY + 2 };

        return (
          <Fragment key={`vak-${n}`}>
            {/*
              Het lijntje van het streepje naar het vakje.

              Schuin: vanaf de punt van het streepje naar het midden van de
              bovenkant van zijn eigen vakje. Zo is bij elk vakje te zien bij
              welk streepje het hoort, ook als het paar naar binnen is
              geschoven. Dun en in de kleur van de lijn, zodat het aanwijst
              zonder de aandacht te trekken.
            */}
            {haakje && (
              <span
                aria-hidden="true"
                className="absolute"
                style={{
                  left: haakje.tickX,
                  top: haakje.tickY,
                  width: Math.hypot(haakje.vakX - haakje.tickX, vakTop - haakje.tickY),
                  height: 1.5,
                  background: LIJNKLEUR,
                  transformOrigin: "0 50%",
                  transform: `rotate(${
                    (Math.atan2(vakTop - haakje.tickY, haakje.vakX - haakje.tickX) * 180) / Math.PI
                  }deg)`,
                }}
              />
            )}

          <span
            className="absolute z-10 flex flex-col items-center"
            style={plaatsing}
          >
            <input
              ref={(el) => {
                vakvelden.current[i] = el;
              }}
              type="text"
              aria-label={
                vakjes.length === 1
                  ? "Welk getal hoort hier?"
                  : `Welk getal hoort bij vakje ${i + 1} van de ${vakjes.length}?`
              }
              value={getypt[i] ?? ""}
              placeholder={opDeLijn ? "?" : undefined}
              readOnly={!onTyp}
              disabled={!onTyp}
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              maxLength={3}
              onFocus={(e) => bijAandacht(e.currentTarget)}
              onBlur={bijWeggaan}
              onChange={(e) => onTyp?.(i, e.target.value.replace(/\D/g, "").slice(0, 3))}
              onKeyDown={(e) => toetsInVak(e, i)}
              style={{ width: vakBreedte, height: vakHoogte, fontSize: vakLetter }}
              className={`rounded-xl border-[3px] text-center font-extrabold tabular-nums outline-none transition disabled:cursor-default ${kleur}`}
            />
            {/* Het pijltje naar het streepje; op de lijn is dat niet nodig. */}
            {!opDeLijn && (
              <>
                <span aria-hidden="true" style={{ width: 2, height: 9, background: LIJNKLEUR }} />
                <span
                  aria-hidden="true"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `7px solid ${LIJNKLEUR}`,
                  }}
                />
              </>
            )}
          </span>
          </Fragment>
        );
      })}

      {/*
        Onzichtbare knoppen op elk streepje.

        Voor het toetsenbord en voor een voorleesprogramma, en om Vos met een
        tik ergens naartoe te sturen. Met de vinger wordt er op de hele strook
        gemikt en schuift hij naar het dichtstbijzijnde streepje.
      */}
      {onTik &&
        !vrij &&
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

/** Wat het kind in de vakjes heeft staan, uit het opgeslagen antwoord. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord === "" ? [] : antwoord.split(",");
  return Array.from({ length: hoeveel }, (_, i) => (delen[i] ?? "").trim());
}

/**
 * De hele vraag, in allebei de standen.
 *
 * `antwoord` is wat er is vastgelegd: bij het schuiven het streepje waar Vos
 * staat, bij het invullen de getallen uit de vakjes met komma's ertussen. Leeg
 * betekent dat het kind nog niets heeft gedaan; dan staat de knop Controleer
 * ook nog uit.
 */
export function Getallenlijn({
  figuur,
  antwoord,
  fase,
  onWijzig,
  onBevestig,
  onKlaar,
}: {
  figuur: Getallenlijnfiguur;
  antwoord: string;
  fase: "bezig" | "goed" | "fout";
  onWijzig: (nieuw: string) => void;
  /** Enter in een vakje: hetzelfde als op Controleer drukken. */
  onBevestig?: () => void;
  /** Vos heeft zijn vlag geplant; het feestscherm mag eroverheen. */
  onKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const stand = figuur.stand ?? "schuiven";
  const gevraagd = figuur.gevraagd ?? [figuur.doel];
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

  /*
    Wat er in de vakjes staat.

    Hier en niet buiten dit scherm, want een half getal is nog geen antwoord:
    zolang niet elk vakje gevuld is, gaat er een leeg antwoord naar buiten en
    blijft Controleer uit. Komt er een nieuwe vraag, of wordt het antwoord van
    buitenaf gewist, dan staan de vakjes weer leeg.
  */
  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, gevraagd.length));
  const vraagsleutel = `${figuur.start}-${figuur.eind}:${gevraagd.join(",")}`;
  const vorigeVraag = useRef(vraagsleutel);
  const vorigeFase = useRef(fase);
  useEffect(() => {
    /* Een nieuwe vraag: de vakjes weer leeg, of gevuld met wat er al lag. */
    if (vorigeVraag.current !== vraagsleutel) {
      vorigeVraag.current = vraagsleutel;
      vorigeFase.current = fase;
      setGetypt(uitAntwoord(antwoord, gevraagd.length));
      return;
    }
    /*
      Dezelfde vraag, maar het antwoord is van buitenaf gewist en we mogen
      weer: dan is er opnieuw begonnen en horen de vakjes ook leeg te zijn.
      Tijdens het typen gebeurt dit niet — dan staat de fase al op "bezig" en
      verandert er niets aan die fase.
    */
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig" && antwoord === "") {
      setGetypt(uitAntwoord("", gevraagd.length));
    }
  }, [vraagsleutel, antwoord, fase, gevraagd.length]);

  const vosBij = sleepBij ?? (antwoord === "" ? figuur.start : Number(antwoord.split(",")[0]));

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

  /**
   * Welk getal er bij deze x hoort, zonder vast te klikken.
   *
   * Voor de schatstand: het kind bepaalt zelf de plek, dus er wordt alleen
   * afgerond op een heel getal. Buiten de lijn houdt het op bij het begin of
   * het eind.
   */
  function waardeBij(x: number): number {
    const el = strip.current;
    if (!el) return figuur.start;
    const r = el.getBoundingClientRect();
    const pct = ((x - r.left) / r.width) * 100;
    const deel = (pct - LINKS) / (100 - LINKS - RECHTS);
    const ruw = figuur.start + deel * (figuur.eind - figuur.start);
    return Math.round(Math.min(figuur.eind, Math.max(figuur.start, ruw)));
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
    /* Schatten gaat vrij over de lijn; de andere standen klikken vast. */
    const nu = stand === "schatten" ? waardeBij(e.clientX) : streepjeBij(e.clientX);
    if (nu !== nuBij.current) {
      nuBij.current = nu;
      setSleepBij(nu);
      /*
        Elk streepje geeft een tikje: zo hoor je dat hij echt vastklikt. Bij
        het schatten niet — daar zou het bij elke pixel ratelen.
      */
      if (stand !== "schatten" && opgavegeluidStaatAan()) plop();
    }
  }

  function losLaten() {
    if (!sleept.current) return;
    const plek = nuBij.current ?? vosBij;
    sleept.current = false;
    nuBij.current = null;
    setSleepBij(null);
    onWijzig(String(plek));
    /* Bij het schatten het tikje pas hier: hij staat nu ergens. */
    if (stand === "schatten" && opgavegeluidStaatAan()) plop();
  }

  /** Tikken op een streepje: Vos loopt er in één keer naartoe. */
  function tikStreepje(n: number) {
    if (uit) return;
    onWijzig(String(n));
    if (opgavegeluidStaatAan()) plop();
  }

  /** Met de pijltjestoetsen: één streepje tegelijk, of bij het schatten één getal. */
  function toets(e: React.KeyboardEvent) {
    if (uit) return;
    const richting = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if (richting === 0) return;
    e.preventDefault();
    if (stand === "schatten") {
      const volgende = Math.min(figuur.eind, Math.max(figuur.start, vosBij + richting));
      onWijzig(String(volgende));
      return;
    }
    const nu = waarden.indexOf(vosBij);
    const volgende = waarden[Math.min(waarden.length - 1, Math.max(0, nu + richting))];
    if (volgende !== undefined) onWijzig(String(volgende));
  }

  /** Typen in een vakje. Pas als alle vakjes gevuld zijn, is er een antwoord. */
  function typ(nummer: number, tekst: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[nummer] = tekst;
    setGetypt(nieuw);
    onWijzig(nieuw.every((w) => w !== "") ? nieuw.join(",") : "");
  }

  const houdingen: Voshoudingen | null =
    figuur.vos.wachtend || figuur.vos.blij
      ? {
          vangend: figuur.vos.wachtend ?? figuur.vos.blij,
          wachtend: figuur.vos.wachtend,
          blij: figuur.vos.blij,
        }
      : null;

  /* ------------------------------------------------------------------ */
  /* De invulstand en de tussenstand: typen, zonder Vos.                 */
  /* ------------------------------------------------------------------ */
  if (stand === "invullen" || stand === "tussen") {
    const opLijn = stand === "tussen";
    const uitslagen: ("goed" | "fout" | null)[] = uit
      ? gevraagd.map((juist, i) => (Number(getypt[i]) === juist ? "goed" : "fout"))
      : [];

    /*
      Klopt het bij de tussenstand, dan verdwijnen de vakjes en staan de twee
      getallen gewoon onder de lijn — de rij is dan compleet, precies zoals hij
      hoort te zijn.
    */
    const compleet = opLijn && fase === "goed";
    const onderDeLijn = compleet
      ? [...figuur.zichtbaar, ...gevraagd].sort((a, b) => a - b)
      : figuur.zichtbaar;

    return (
      <div className="flex w-full flex-col items-center gap-4">
        {/*
          Geen Vos hier.

          In deze twee standen typt het kind; Vos heeft er geen rol in. Hij
          stond er alleen maar bij te kijken, en dat haalde de aandacht weg van
          de lijn en de vakjes. In de schuif- en de schatstand is hij juist wél
          het ding dat het kind vastpakt, en in de uitleg van de tussenstand
          loopt hij de twee streepjes voor; daar staat hij dus gewoon.
        */}
        <div className="w-full px-1">
          <Getallenlijnbeeld
            start={figuur.start}
            eind={figuur.eind}
            stap={figuur.stap}
            zichtbaar={onderDeLijn}
            vakjes={compleet ? [] : gevraagd}
            getypt={getypt}
            vakuitslagen={uitslagen}
            opDeLijn={opLijn}
            wijzer={opLijn ? { getal: figuur.wijzer ?? figuur.doel } : null}
            onTyp={uit ? undefined : typ}
            onBevestig={onBevestig}
            /* De lijntjes wijzen het antwoord aan; die komen pas bij het nakijken. */
            wijstAan={uit}
            stripRef={strip}
          />
        </div>

        {/*
          Geen regel onder de lijn.

          In geen van de vier standen staat er nog een hulpzin onder de lijn.
          Die zei hetzelfde als de vraagzin erboven, en deze kinderen lezen nog
          nauwelijks: het was een tweede regel tekst om doorheen te komen voor
          iets wat ze al aan het doen waren. Wat er staat, staat boven de lijn.
        */}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* De schatstand: een kale lijn, Vos schuift er vrij overheen.         */
  /* ------------------------------------------------------------------ */
  if (stand === "schatten") {
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
            vrij
            hulplijnen={figuur.hulplijnen ?? []}
            vosBij={vosBij}
            vos={houdingen}
            vosStand={fase === "goed" ? "blij" : fase === "fout" ? "verbaasd" : "wachtend"}
            vlag={figuur.doel}
            geplant={fase === "goed"}
            mislukt={fase === "fout"}
            /* Bij het nakijken: rood waar Vos stond, groen waar het getal ligt. */
            foutBij={fase === "fout" ? vosBij : null}
            goedBij={uit ? figuur.doel : null}
            aangeraakt={sleepBij !== null}
            stripRef={strip}
            onVosPak={uit ? undefined : pak}
            onVosToets={uit ? undefined : toets}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* De schuifstand: Vos met zijn vlaggetje over de lijn.                */
  /* ------------------------------------------------------------------ */
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
          /* Bij een fout antwoord blijft de streep staan waar Vos stond. */
          foutBij={fase === "fout" ? vosBij : null}
          aangeraakt={sleepBij !== null}
          stripRef={strip}
          onVosPak={uit ? undefined : pak}
          onVosToets={uit ? undefined : toets}
          onTik={uit ? undefined : tikStreepje}
        />
      </div>
    </div>
  );
}
