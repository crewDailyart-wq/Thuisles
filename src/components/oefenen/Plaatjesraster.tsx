"use client";

/**
 * Een aantal dezelfde plaatjes om te tellen.
 *
 * ---------------------------------------------------------------------------
 * Waarom de opstelling instelbaar is
 * ---------------------------------------------------------------------------
 * Hoe de plaatjes staan, bepaalt wát er geoefend wordt. Rijen van vijf laten
 * een kind in vijven meetellen, rijen van tien geven de tienstructuur, en
 * verspreid is het moeilijkst: dan moet het kind zélf structuur aanbrengen —
 * groepjes maken, of één voor één afgaan zonder de draad kwijt te raken.
 *
 * Daarom staat de opstelling per sjabloon in te stellen en niet vast in code.
 *
 * ---------------------------------------------------------------------------
 * Meetellen door aantikken
 * ---------------------------------------------------------------------------
 * Het kind mag elk plaatje aantikken terwijl het telt. Zo'n plaatje gaat
 * lichter staan en krijgt een vinkje; nog een keer tikken maakt het ongedaan.
 *
 * Dat is een hulpmiddel en geen antwoord. Het aantal aangetikte plaatjes wordt
 * NIET meegeteld en er staat met opzet geen teller bij: het kind moet zelf
 * tellen. Zou er een getal meelopen, dan werd het aftikken het antwoord en was
 * er niets meer te tellen.
 *
 * ---------------------------------------------------------------------------
 * Waarom de verspreide stand toch berekend is
 * ---------------------------------------------------------------------------
 * "Verspreid" mag er rommelig uitzien, maar mag niet elke keer anders zijn: de
 * server tekent de pagina eerst en de browser doet het daarna nog eens over.
 * Komt er dan iets anders uit, dan klaagt React en springt het beeld. Daarom
 * staat elk plaatje op een plek die uit zijn nummer wordt uitgerekend — met
 * hele getallen, want kommagetallen kunnen per apparaat een haartje verschillen.
 *
 * De plekken komen uit een rooster met een vaste afwijking per vakje. Zo staan
 * ze scheef door elkaar, maar liggen ze nooit over elkaar heen.
 */

import { useEffect, useRef, useState } from "react";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";

export type Plaatjesopstelling = {
  aantal: number;
  /** Hoeveel plaatjes op een rij. 0 betekent: verspreid, zonder rijen. */
  perRij: number;
  /** Kleine extra ruimte na elk groepje van vijf binnen een rij. */
  groepsruimte: boolean;
};

export type Plek = { x: number; y: number };

/** Hoeveel plaatjes er hooguit in beeld komen; daarboven valt niets te tellen. */
export const MAX_PLAATJES = 40;

/*
  Een vaste "willekeur" per nummer.

  Hele getallen in, hele getallen uit. Precies daarom geen `Math.random` en ook
  geen `Math.sin`: het eerste geeft elke keer iets anders, het tweede mag per
  apparaat een haartje afwijken. Dit levert overal exact hetzelfde op.
*/
function ruis(n: number): number {
  const x = (n * 1103515245 + 12345) & 0x7fffffff;
  return (x >> 8) % 1000;
}

/*
  Hoeveel ruimte er tussen de plaatjes zit, als factor van hun eigen maat.

  Ruimer onder elkaar dan naast elkaar: een rij plaatjes leest als één geheel,
  maar twee rijen die elkaar bijna raken lopen visueel in elkaar over en dan is
  niet meer te zien waar de ene rij ophoudt.
*/
const NAAST = 1.3;
const ONDER = 1.5;

/** Het grootste dat een plaatje mag worden, in procenten van de breedte. */
const MAX_MAAT = 18;

export type Rasterplan = {
  plekken: Plek[];
  /** De maat van één plaatje, in procenten van de breedte. */
  maat: number;
  kolommen: number;
  rijen: number;
  /** De hoogte van het hele raster, ook in procenten van de BREEDTE. */
  hoogte: number;
};

/**
 * Waar elk plaatje komt te staan.
 *
 * ---------------------------------------------------------------------------
 * Alles in dezelfde eenheid
 * ---------------------------------------------------------------------------
 * Zowel x als y staan hier in procenten van de BREEDTE, en `hoogte` ook. Dat
 * klinkt omslachtig, maar het is precies waar het eerder op misging: in CSS is
 * `left` een percentage van de breedte en `top` een percentage van de hoogte.
 * Zijn die twee niet even groot — en dat zijn ze bijna nooit — dan komen de
 * rijen veel dichter op elkaar dan bedoeld en gaan de plaatjes over elkaar
 * heen. Onmogelijk om te tellen.
 *
 * Door alles in breedteprocenten uit te rekenen en pas bij het tekenen naar
 * hoogteprocenten om te rekenen, klopt de afstand altijd.
 *
 * ---------------------------------------------------------------------------
 * Nooit overlappen
 * ---------------------------------------------------------------------------
 * De maat volgt uit de ruimte, niet andersom. Passen er te veel plaatjes naast
 * elkaar, dan worden ze kleiner; meer rijen maakt ze ook kleiner. Zo raken ze
 * elkaar nooit, ook niet op een smalle telefoon — daar wordt alles gewoon
 * evenredig kleiner, want er wordt in procenten gerekend en niet in pixels.
 */
export function plaatjesPlekken(opstelling: Plaatjesopstelling): Rasterplan {
  const aantal = Math.max(1, Math.min(MAX_PLAATJES, Math.round(opstelling.aantal)));

  if (opstelling.perRij > 0) {
    const kolommen = Math.max(1, Math.min(aantal, Math.round(opstelling.perRij)));
    const rijen = Math.ceil(aantal / kolommen);
    /* Het extra gat na elk vijfde plaatje telt mee in de breedte. */
    const gaten = opstelling.groepsruimte ? Math.floor((kolommen - 1) / 5) : 0;

    /*
      De breedte van het raster is (kolommen − 1) stappen plus één heel plaatje,
      plus de extra gaten. Daar past `maat` uit: nooit breder dan het vlak.
    */
    const maat = Math.min(
      100 / ((kolommen - 1) * NAAST + 1 + gaten * 0.6),
      MAX_MAAT,
    );
    const stapX = maat * NAAST;
    const stapY = maat * ONDER;

    const plekken: Plek[] = [];
    for (let i = 0; i < aantal; i++) {
      const kolom = i % kolommen;
      const rij = Math.floor(i / kolommen);
      const extra = opstelling.groepsruimte ? Math.floor(kolom / 5) * maat * 0.6 : 0;
      plekken.push({ x: kolom * stapX + extra, y: rij * stapY });
    }

    return { plekken, maat, kolommen, rijen, hoogte: (rijen - 1) * stapY + maat };
  }

  /*
    Verspreid: een rooster met ruimere vakjes, en elk plaatje binnen zijn eigen
    vakje een vaste kant op geschoven. De speling is hooguit de helft van wat er
    in het vakje overblijft, zodat twee buren elkaar nooit kunnen raken.
  */
  const kolommen = Math.max(2, Math.ceil(Math.sqrt(aantal * 1.3)));
  const rijen = Math.ceil(aantal / kolommen);
  const vakBreed = 1.55;
  const vakHoog = 1.7;

  const maat = Math.min(100 / ((kolommen - 1) * vakBreed + 1), MAX_MAAT);
  const stapX = maat * vakBreed;
  const stapY = maat * vakHoog;
  /* Wat er per vakje aan lucht overblijft, half naar links en half naar rechts. */
  const spelingX = (stapX - maat) / 2;
  const spelingY = (stapY - maat) / 2;

  const plekken: Plek[] = [];
  for (let i = 0; i < aantal; i++) {
    const kolom = i % kolommen;
    const rij = Math.floor(i / kolommen);
    /* Een vaste afwijking tussen −1 en 1, uit het nummer van het plaatje. */
    const schuifX = ((ruis(i * 2 + 1) % 200) - 100) / 100;
    const schuifY = ((ruis(i * 2 + 2) % 200) - 100) / 100;
    plekken.push({
      x: kolom * stapX + spelingX + schuifX * spelingX,
      y: rij * stapY + spelingY + schuifY * spelingY,
    });
  }

  return {
    plekken,
    maat,
    kolommen,
    rijen,
    hoogte: (rijen - 1) * stapY + maat + spelingY * 2,
  };
}

/**
 * Waar Vos' mand hangt, in hetzelfde stelsel als de plekken: breedteprocenten
 * vanaf de linkerbovenhoek van het telvak.
 *
 * Links búiten het vak, iets boven de onderkant — dat is precies waar Vos met
 * zijn mand staat zolang hij uitdeelt. Dat hij buiten het vak blijft is de hele
 * bedoeling: een kind van zes telt alles mee wat ernaast staat. Bij twee
 * sterren met Vos ernaast antwoordt het drie.
 *
 * De baan van een plaatje wordt daarmee: vanuit de mand linksonder schuin
 * omhoog naar rechts, het vak in, naar zijn eigen plek. Precies wat er gebeurt
 * als Vos ze er één voor één uit haalt.
 */
function mandPlek(hoogte: number) {
  return { x: MAND_X, y: hoogte * 0.75 };
}

/*
  Waar de mand hangt, in procenten van de breedte van het telvak.

  Negatief, dus links búiten het vak: dat is de strook waar Vos staat, en dus de
  kant waar de plaatjes vandaan komen. De baan hoeft niet tot op de pixel op
  zijn mand te eindigen — wat telt is dat een kind ziet dat ze van hém komen.

  Zijn plek zelf loopt niet over deze waarden maar over gemeten pixels; zie het
  stukje bij de tekening van Vos verderop.
*/
const MAND_X = -18;
/** Hoe lang Vos over zijn wandeling doet. */
const LOOP_MS = 650;

/**
 * Waar de mand in zijn plaatje zit, als deel van dat plaatje.
 *
 * Rechtsonder: dat is waar hij hem draagt in alle drie de houdingen. `y` telt
 * vanaf zijn voeten omhoog. Hiermee begint een plaatje precies op de mand in
 * plaats van ergens in de buurt — en juist dát maakt zichtbaar dat ze eruit
 * komen.
 */
const MAND_IN_PLAATJE = { x: 0.78, y: 0.18 };

/** Wat er van Vos gemeten is: zijn hoge plek, en waar zijn mand dan hangt. */
type Vosmeting = { hoog: number; links: number; mand: Plek | null };

/** Hoeveel later Vos het volgende plaatje uit zijn mand haalt. */
const DRUPPEL_MS = 110;
/** Hoe lang één plaatje onderweg is; gelijk aan de animatie in globals.css. */
const VAL_MS = 700;


/** De drie houdingen van Vos, elk een eigen afbeelding uit het beheer. */
export type Voshoudingen = {
  vangend: string | null;
  wachtend: string | null;
  blij: string | null;
};

/**
 * Vos naast de plaatjes, met zijn mand.
 *
 * Zonder tekstballon: deze kinderen lezen nog nauwelijks. Wat hij bedoelt,
 * zegt hij met beweging — hij vangt de plaatjes op, zit te wachten, leunt naar
 * de plaatjes toe als het lang stil blijft, en wipt op als het goed is.
 *
 * Ontbreekt een houding, dan wordt de vangende genomen: liever dezelfde vos in
 * elke stand dan geen vos. Is er helemaal geen afbeelding ingesteld, dan staat
 * er ook niets — en schuift het raster gewoon door naar links.
 */
function Vos({
  houdingen,
  stand,
  wijst,
}: {
  houdingen: Voshoudingen;
  stand: "vangend" | "wachtend" | "blij";
  wijst: boolean;
}) {
  const bestand =
    (stand === "blij" ? houdingen.blij : stand === "wachtend" ? houdingen.wachtend : null) ??
    houdingen.vangend;

  if (!bestand) return null;

  const beweging =
    stand === "blij"
      ? "motion-safe:animate-vos-springt"
      : wijst
        ? "motion-safe:animate-vos-wijst"
        : "motion-safe:animate-vos-trappel";

  /*
    Alleen de tekening; waar Vos staat, bepaalt degene die hem plaatst. Stond
    hier eerder een eigen `absolute bottom-0 left-0`, en die vocht met de plek
    die hem van buitenaf werd gegeven — dan stond hij ergens anders dan bedoeld.
  */
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/vragen/${bestand}`}
      alt=""
      draggable={false}
      className={`h-auto w-full select-none ${beweging}`}
    />
  );
}

/** Het vinkje op een aangetikt plaatje. */
function Vinkje({ maat }: { maat: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 grid place-items-center rounded-full bg-groen text-white shadow-op"
      style={{ width: `${maat * 0.42}%`, aspectRatio: "1", minWidth: "0.9rem" }}
    >
      <svg viewBox="0 0 24 24" className="size-[70%]" fill="none" stroke="currentColor">
        <path d="M5 13l4 4L19 7" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * Eén plaatje.
 *
 * Staat er geen afbeelding ingesteld, dan komt er een leeg vlak met een
 * streepjesrand. Dat is met opzet geen getekend plaatje: in het sjabloonscherm
 * moet te zien zijn dát de opstelling klopt, zonder dat er een tekening wordt
 * voorgesteld die er straks niet is.
 */
function Plaatje({
  plaatje,
  afbeelding,
  aangetikt,
  maat,
  plek,
  hoogte,
  mand,
  nummer,
  aanklikbaar,
  gedimd,
  beweging,
  onTik,
}: {
  plaatje: string | null;
  afbeelding: string | null;
  aangetikt: boolean;
  maat: number;
  plek: Plek;
  /** De hoogte van het raster in breedteprocenten; zie `stijl` hieronder. */
  hoogte: number;
  /** Waar Vos' mand hangt, in hetzelfde stelsel als `plek`. */
  mand: Plek;
  nummer: number;
  aanklikbaar: boolean;
  gedimd: boolean;
  /** Komt het uit de mand, gaat het terug de mand in, of staat het stil? */
  beweging: "geen" | "binnen" | "terug";
  onTik?: () => void;
}) {
  /*
    Drie bronnen, in deze volgorde: de getekende sticker, anders een geüploade
    afbeelding, anders een leeg vak. Dat lege vak is met opzet geen tekening:
    in het sjabloonscherm moet te zien zijn dát de opstelling klopt, zonder dat
    er een plaatje wordt voorgesteld dat er straks niet is.
  */
  const inhoud = plaatje ? (
    <Telplaatje naam={plaatje} />
  ) : afbeelding ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/vragen/${afbeelding}`}
      alt=""
      draggable={false}
      className="h-full w-full select-none object-contain"
    />
  ) : (
    <span className="block h-full w-full rounded-lg border-2 border-dashed border-rand bg-room/70" />
  );

  /*
    `left` en `width` zijn percentages van de breedte, `top` van de hoogte. De
    plekken zijn allemaal in breedteprocenten uitgerekend, dus alleen `top`
    moet worden omgerekend — met de hoogte van het raster als maatstaf.
  */
  /*
    De afstand van deze plek tot Vos' mand, uitgedrukt in de breedte van het
    plaatje zelf. `translate` met procenten rekent namelijk met het element,
    niet met het vlak eromheen — zo klopt de baan voor elk plaatje apart.

    Heen is uit de mand omhoog, terug is precies dezelfde weg naar beneden.
  */
  const beweegstijl =
    beweging === "geen"
      ? undefined
      : ({
          "--dx": `${((mand.x - plek.x) / maat) * 100}%`,
          "--dy": `${((mand.y - plek.y) / maat) * 100}%`,
          animationDelay: `${nummer * DRUPPEL_MS}ms`,
        } as React.CSSProperties);

  const beweegklasse =
    beweging === "binnen"
      ? "animate-plaatje-uit-mand"
      : beweging === "terug"
        ? "animate-plaatje-terug"
        : "";

  const stijl = {
    left: `${plek.x}%`,
    top: `${(plek.y / hoogte) * 100}%`,
    width: `${maat}%`,
    aspectRatio: "1",
    ...beweegstijl,
  } as React.CSSProperties;

  const uiterlijk = `absolute transition duration-150 ${beweegklasse} ${
    aangetikt ? "opacity-45" : gedimd ? "opacity-30" : "opacity-100"
  }`;

  if (!aanklikbaar) {
    return (
      <span className={uiterlijk} style={stijl}>
        {inhoud}
        {aangetikt && <Vinkje maat={maat} />}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onTik}
      aria-pressed={aangetikt}
      aria-label={`Plaatje ${nummer}${aangetikt ? ", geteld" : ""}`}
      className={`${uiterlijk} cursor-pointer rounded-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-huisstijl`}
      style={stijl}
    >
      {inhoud}
      {aangetikt && <Vinkje maat={maat} />}
    </button>
  );
}

/**
 * Het raster zoals het in een vraag staat: aantikbaar, zonder teller.
 *
 * Het aantikken leeft hier en nergens anders. Het is hulp bij het tellen, geen
 * antwoord — het antwoord geeft het kind met de keuzeknoppen eronder.
 */
export function Plaatjesraster({
  aantal,
  plaatje,
  afbeelding,
  perRij,
  groepsruimte,
  vos = { vangend: null, wachtend: null, blij: null },
  fase = "bezig",
  antwoordGekozen = false,
  aantikbaar = true,
  beweegt = true,
  onKlaar,
}: {
  aantal: number;
  /** Welk getekend plaatje; `null` = de geüploade afbeelding gebruiken. */
  plaatje: string | null;
  afbeelding: string | null;
  perRij: number;
  groepsruimte: boolean;
  vos?: Voshoudingen;
  fase?: "bezig" | "goed" | "fout";
  /**
   * Heeft het kind al een van de vier getallen aangetikt?
   *
   * Alleen om het voordoen te stoppen: wie al een antwoord kiest, heeft geen
   * handje meer nodig dat laat zien hoe het aantikken werkt.
   */
  antwoordGekozen?: boolean;
  /** Uit in het voorbeeld in het beheer: daar valt niets te tellen. */
  aantikbaar?: boolean;
  /** Uit in het beheer: daar hoeft Vos niets uit zijn mand te halen. */
  beweegt?: boolean;
  /** Gaat af als de plaatjes na een goed antwoord terug in de mand zitten. */
  onKlaar?: () => void;
}) {
  const [aangetikt, setAangetikt] = useState<number[]>([]);
  /*
    Haalt Vos de plaatjes nog uit zijn mand? Begint aan zodra het mag bewegen,
    en gaat uit als het laatste plaatje op zijn plek staat — of eerder, als het
    kind tikt. Zolang dit aan staat, is de mand vol.
  */
  /*
    Waar we in het verhaaltje zitten.

      uitdelen     Vos staat bij het vak en haalt de plaatjes uit zijn mand
      kijken       de mand is leeg, hij zit in de hoek en het kind telt
      terugkomen   het antwoord was goed; hij loopt terug naar het vak
      ophalen      de plaatjes vliegen één voor één terug in zijn mand
  */
  const [stand, setStand] = useState<"uitdelen" | "kijken" | "terugkomen" | "ophalen">(
    beweegt ? "uitdelen" : "kijken",
  );
  const uitMand = stand === "uitdelen";
  /*
    Het voordoen: een handje dat één plaatje aantikt.

    Hoogstens twee keer, en alleen als het kind stilzit. Zodra het zelf een
    plaatje aantikt of een antwoord kiest, is het duidelijk en houdt het op —
    een handje dat blijft wijzen terwijl je al bezig bent, leidt alleen maar af.
  */
  const [voordoen, setVoordoen] = useState<"uit" | "wijst" | "vinkje">("uit");
  const voorgedaan = useRef(0);
  const gemeld = useRef(false);
  const { plekken, maat, hoogte } = plaatjesPlekken({ aantal, perRij, groepsruimte });

  /*
    Waar Vos mag staan, in pixels gemeten.

    Zijn hoge plek hangt aan de ónderkant van het telvak, en hoe hoog dat vak
    is hangt weer af van het aantal plaatjes, de opstelling en de breedte van
    het scherm. Dat valt niet in een vast getal te vangen, dus wordt het
    gemeten: `hoog` is de afstand van de onderkant van het vak tot de onderkant
    van het witte kaartje, `links` is de linkerrand van de strook die naast het
    vak voor hem is vrijgehouden.

    Hij staat `absolute` binnen dat witte kaartje — dat is het dichtstbijzijnde
    vlak met een eigen plaatsing — dus hij kan er nooit buiten vallen.
  */
  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const rasterRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const [vosplek, setVosplek] = useState<Vosmeting | null>(null);

  useEffect(() => {
    const vak = vakRef.current;
    const buiten = buitenRef.current;
    if (!vak || !buiten || !vos.vangend) return;

    function meet() {
      if (!vak || !buiten) return;
      const kaart = buiten.offsetParent as HTMLElement | null;
      if (!kaart) return;
      const hoog = Math.max(0, kaart.clientHeight - (vak.offsetTop + vak.offsetHeight));
      const links = buiten.offsetLeft;

      /*
        En waar zijn mand dan precies hangt.

        Niet geschat maar uitgerekend uit wat er staat: de mand zit rechtsonder
        in zijn plaatje, en op zijn hoge plek staan zijn voeten op de onderkant
        van het telvak. Daarmee ligt het punt vast. Dat wordt daarna omgerekend
        naar hetzelfde stelsel als de plekken van de plaatjes — procenten van de
        BREEDTE van het raster — zodat een plaatje precies op die mand begint en
        er ook weer in eindigt.
      */
      const raster = rasterRef.current;
      const vosvak = vosRef.current;
      let mand: Plek | null = null;
      if (raster && vosvak) {
        const r = raster.getBoundingClientRect();
        const v = vosvak.getBoundingClientRect();
        const k = vak.getBoundingClientRect();
        if (r.width > 0 && v.height > 0) {
          const mandX = buiten.getBoundingClientRect().left + v.width * MAND_IN_PLAATJE.x;
          const mandY = k.bottom - v.height * MAND_IN_PLAATJE.y;
          mand = {
            x: ((mandX - r.left) / r.width) * 100,
            y: ((mandY - r.top) / r.width) * 100,
          };
        }
      }

      /*
        Alleen bijwerken als het écht anders is. Zonder die vergelijking geeft
        elke meting een nieuw object, tekent React opnieuw, merkt de
        `ResizeObserver` dat als een wijziging en meet hij weer — een molen die
        niet meer stopt en de pagina laat vastlopen.
      */
      setVosplek((vorig) =>
        vorig &&
        vorig.hoog === hoog &&
        vorig.links === links &&
        vorig.mand?.x === mand?.x &&
        vorig.mand?.y === mand?.y
          ? vorig
          : { hoog, links, mand },
      );
    }

    meet();

    /*
      En nog een keer zodra zijn plaatje binnen is.

      Zolang dat laadt is zijn hoogte nul, en dan valt niet uit te rekenen waar
      zijn mand hangt — de plaatjes vertrokken dan vanaf de reserveplek in
      plaats van vanaf de mand. Eén meting extra na het laden lost dat op.
    */
    const beeld = vosRef.current?.querySelector("img") ?? null;
    if (beeld && !beeld.complete) beeld.addEventListener("load", meet);

    const kijker = new ResizeObserver(meet);
    kijker.observe(vak);
    const kaart = buiten.offsetParent;
    if (kaart instanceof HTMLElement) kijker.observe(kaart);
    if (vosRef.current) kijker.observe(vosRef.current);
    window.addEventListener("resize", meet);
    return () => {
      kijker.disconnect();
      if (beeld) beeld.removeEventListener("load", meet);
      window.removeEventListener("resize", meet);
    };
  }, [vos.vangend, aantal, perRij, groepsruimte]);

  /*
    Waar de plaatjes vandaan komen en weer naartoe gaan.

    Is Vos opgemeten, dan is dat zijn mand tot op de pixel. Zolang dat nog niet
    kan — geen vos ingesteld, of het eerste beeldje — blijft het de vaste plek
    linksonder buiten het vak.
  */
  const mand = vosplek?.mand
    ? /*
        Een halve plaatjesmaat eraf, in allebei de richtingen.

        De baan rekent met de linkerbovenhoek van een plaatje, en de mand is een
        punt. Zonder deze verschuiving begint een plaatje met zijn hoek op de
        mand en ligt het zelf dus een stuk rechtsonder ernaast; nu ligt het er
        met zijn midden bovenop.
      */
      { x: vosplek.mand.x - maat / 2, y: vosplek.mand.y - maat / 2 }
    : mandPlek(hoogte);

  /*
    Het uithalen stopt vanzelf: het laatste plaatje vertrekt na zijn eigen
    vertraging en is daarna nog even onderweg.
  */
  useEffect(() => {
    if (!uitMand) return;
    const klok = setTimeout(() => setStand("kijken"), aantal * DRUPPEL_MS + VAL_MS);
    return () => clearTimeout(klok);
  }, [uitMand, aantal]);

  /*
    Het handje dat voordoet dat je kunt aantikken.

    Zonder tekst, want deze kinderen lezen nog nauwelijks, en zonder het woord
    "klikken", want de meesten zitten op een tablet. Het gebaar zelf is de
    uitleg: tik, vinkje, weer weg.
  */
  const zelfBezig = aangetikt.length > 0 || antwoordGekozen;
  /* Het handje is weer weg: dan mag de volgende keer worden ingepland. */
  const handjeWeg = voordoen === "uit";
  useEffect(() => {
    if (!beweegt || uitMand || fase !== "bezig" || zelfBezig) return;
    if (voorgedaan.current >= 2) return;

    const klokken: ReturnType<typeof setTimeout>[] = [];
    klokken.push(
      setTimeout(() => {
        voorgedaan.current += 1;
        setVoordoen("wijst");
        klokken.push(setTimeout(() => setVoordoen("vinkje"), 700));
        klokken.push(setTimeout(() => setVoordoen("uit"), 1500));
      }, voorgedaan.current === 0 ? 3500 : 7000),
    );

    return () => {
      for (const k of klokken) clearTimeout(k);
      setVoordoen("uit");
    };
  }, [beweegt, uitMand, fase, zelfBezig, handjeWeg]);

  /*
    Na een goed antwoord vliegen de plaatjes één voor één terug in de mand.
    Daarna pas mag het feestscherm komen.

    Zonder stem. Hier werd eerder hardop meegeteld terwijl ze terugvlogen; dat
    is er op verzoek van de eigenaar uit. Bij een goed antwoord blijft het stil,
    op de geluiden van het feestscherm na — het sleutelgeluid en de confetti.
    In het uitlegfilmpje na een fout antwoord wordt nog wél geteld: daar is het
    uitleg, en dat blijft zoals het was.
  */
  useEffect(() => {
    if (fase !== "goed" || !beweegt || gemeld.current) return;
    gemeld.current = true;

    const klokken: ReturnType<typeof setTimeout>[] = [];
    /* Eerst loopt Vos terug naar het vak; pas daarna haalt hij ze op. */
    setStand("terugkomen");
    klokken.push(setTimeout(() => setStand("ophalen"), LOOP_MS));

    /* Als de mand weer vol is, mag het feestscherm komen. */
    klokken.push(setTimeout(() => onKlaar?.(), LOOP_MS + aantal * DRUPPEL_MS + 700));

    return () => {
      for (const k of klokken) clearTimeout(k);
    };
  }, [fase, beweegt, aantal, onKlaar]);

  function tik(i: number) {
    /*
      Tikken terwijl Vos nog bezig is: alle plaatjes staan meteen op hun plek en
      Vos gaat meteen naar zijn hoek. Een kind dat wil beginnen, hoeft nooit te
      wachten tot een animatie is uitgespeeld.
    */
    if (uitMand) {
      setStand("kijken");
      return;
    }
    setAangetikt((lijst) =>
      lijst.includes(i) ? lijst.filter((n) => n !== i) : [...lijst, i],
    );
  }

  /*
    Terug de mand in gebeurt alléén bij een goed antwoord. Bij een fout blijven
    de plaatjes gewoon staan: het kind moet ze er nog bij kunnen zien als de
    uitleg langskomt.
  */
  const beweging = stand === "ophalen" ? "terug" : stand === "uitdelen" ? "binnen" : "geen";
  const vosstand =
    stand === "terugkomen" || stand === "ophalen"
      ? "blij"
      : stand === "uitdelen"
        ? "vangend"
        : "wachtend";
  /*
    Twee plekken, en de stand bepaalt welke:

      hoog   links naast het telvak, met zijn voeten op de onderkant daarvan —
             daar deelt hij uit en daar haalt hij ze weer op;
      laag   in de hoek linksonder, waar hij rustig blijft kijken terwijl het
             kind telt.

    Allebei in de strook links van het vak of onder de knoppen, dus nooit ín
    het telvak en nooit over de vraag of de knoppen heen.
  */
  const vosLaag = stand === "kijken";

  /* Welk plaatje het handje voordoet: het eerste, dat ziet een kind het eerst. */
  const voorbeeldplek = plekken[0];

  /*
    Links van het vak blijft een strook vrij zodra er een vos bij hoort.

    Die strook is van hem alleen. Zo staat hij naast het telvak zonder erin te
    komen, ook op een telefoon — daar is het vak namelijk zo breed als het
    scherm, en zonder strook zou hij er wel middenin moeten staan. Het vak wordt
    er iets smaller van; de plaatjes schalen mee, want er wordt in procenten
    gerekend. Hoort er geen vos bij, dan blijft alles zoals het was.
  */
  const strook = vos.vangend ? "max-w-xl pl-20 sm:pl-24 lg:pl-28" : "max-w-lg";

  return (
    <div ref={buitenRef} className={`mx-auto w-full ${strook}`}>
      {/*
        Het telvak.

        Een duidelijke eigen rand en een eigen achtergrond, zodat een kind ziet
        wat er bij elkaar hoort: alles hierbinnen telt mee, daarbuiten niet. Vos
        staat er met opzet helemaal buiten — anders telt een kind hem gewoon mee.
      */}
      <div
        ref={vakRef}
        /*
          `z-10`: het telvak ligt boven Vos.

          Zonder dat verdwijnt een plaatje dat net uit de mand komt achter hem —
          hij staat verderop in het document en werd daardoor er overheen
          getekend. Precies het stukje van de baan waar te zien moet zijn dát ze
          uit zijn mand komen, was dan onzichtbaar. Ze raken elkaar verder niet:
          Vos staat buiten het vak.
        */
        className="relative z-10 w-full rounded-groot border-2 border-rand bg-white p-3 shadow-op sm:p-4"
      >
        <div
          ref={rasterRef}
          className="relative w-full"
          style={{ aspectRatio: `100 / ${hoogte}` }}
        >
          {plekken.map((plek, i) => (
            <Plaatje
              key={i}
              plaatje={plaatje}
              afbeelding={afbeelding}
              aangetikt={aangetikt.includes(i) || (i === 0 && voordoen === "vinkje")}
              maat={maat}
              plek={plek}
              hoogte={hoogte}
              mand={mand}
              nummer={i + 1}
              aanklikbaar={aantikbaar}
              gedimd={false}
              beweging={beweging}
              onTik={() => tik(i)}
            />
          ))}

          {/* Het handje dat voordoet dat je een plaatje kunt aantikken. */}
          {voordoen !== "uit" && voorbeeldplek && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute motion-safe:animate-hand-wijs"
              style={{
                left: `${voorbeeldplek.x + maat * 0.45}%`,
                top: `${((voorbeeldplek.y + maat * 0.75) / hoogte) * 100}%`,
                fontSize: `${Math.max(14, maat * 1.1)}px`,
              }}
            >
              👆
            </span>
          )}
        </div>
      </div>

      {/*
        Vos, binnen het witte kaartje van de oefening.

        Hij staat `absolute` ten opzichte van dat kaartje — dat is het dichtst
        bijzijnde vlak met een eigen plaatsing — dus hij kan er niet buiten
        vallen. Stond hij eerder vast aan het browservenster, en dan verdween
        hij onderaan achter de balk van het besturingssysteem.

        Zijn twee plekken:

          hoog   in de strook links naast het vak, met zijn voeten op de
                 onderkant daarvan. Daar staat hij bij het openen met zijn volle
                 mand, en daar komt hij na een goed antwoord weer terug.
          laag   in de hoek linksonder van het kaartje, onder de knoppen door,
                 waar hij blijft kijken terwijl het kind telt.

        Hij zakt en klimt tussen die twee in één rustige beweging. Zolang de
        hoge plek nog niet gemeten is, staat hij er nog niet: één beeldje later
        klopt hij, en dat is beter dan hem eerst ergens anders te zien staan.

        Hij vangt geen tikken op en ligt ónder de knoppen in de stapeling, dus
        ook op een smal scherm blijven die zichtbaar en bruikbaar.
      */}
      {vos.vangend && (
        <div
          ref={vosRef}
          aria-hidden="true"
          className={`pointer-events-none absolute z-0 w-16 origin-bottom transition-[left,bottom] duration-700 ease-in-out motion-reduce:transition-none sm:w-20 lg:w-24 ${
            vosplek ? "" : "opacity-0"
          }`}
          style={{
            left: vosLaag || !vosplek ? "0.5rem" : `${vosplek.links}px`,
            bottom: vosLaag || !vosplek ? "0.75rem" : `${vosplek.hoog}px`,
          }}
        >
          <Vos houdingen={vos} stand={vosstand} wijst={false} />
        </div>
      )}
    </div>
  );
}

/**
 * Hetzelfde raster in het uitlegfilmpje.
 *
 * Bewust dezelfde plaatjes in dezelfde opstelling als in de vraag. Zou de
 * uitleg blokjes laten zien, dan moet een kind zelf bedenken dat die blokjes
 * de plaatjes voorstellen — en juist dat verband is wat hier geoefend wordt.
 *
 * `opgelicht` telt van voren af aan mee: die plaatjes hebben een vinkje. Met
 * `rijNadruk` licht één hele rij op en staan de andere zwakker, voor het
 * groepsgewijs tellen: "dit zijn er vijf".
 */
export function Uitlegraster({
  aantal,
  plaatje,
  afbeelding,
  perRij,
  groepsruimte,
  opgelicht,
  rijNadruk = null,
  telbaar = false,
  getikt = [],
  onTik,
}: {
  aantal: number;
  plaatje: string | null;
  afbeelding: string | null;
  perRij: number;
  groepsruimte: boolean;
  opgelicht: number;
  rijNadruk?: number | null;
  /** Mag het kind zelf meetikken bij deze stap? */
  telbaar?: boolean;
  getikt?: number[];
  onTik?: (index: number) => void;
}) {
  const { plekken, maat, kolommen, hoogte } = plaatjesPlekken({ aantal, perRij, groepsruimte });
  /* In het filmpje beweegt er niets, maar het plaatje vraagt wel om een mand. */
  const mand = mandPlek(hoogte);

  return (
    <div
      className="relative mx-auto w-full max-w-sm"
      style={{ aspectRatio: `100 / ${hoogte}` }}
    >
      {plekken.map((plek, i) => {
        const inNadrukrij = rijNadruk !== null && perRij > 0 && Math.floor(i / kolommen) === rijNadruk;
        return (
          <Plaatje
            key={i}
            plaatje={plaatje}
            afbeelding={afbeelding}
            aangetikt={telbaar ? getikt.includes(i) : inNadrukrij || i < opgelicht}
            maat={maat}
            plek={plek}
            hoogte={hoogte}
            mand={mand}
            nummer={i + 1}
            aanklikbaar={telbaar}
            beweging="geen"
            /* Buiten de rij die aan de beurt is, staat de rest op de achtergrond. */
            gedimd={rijNadruk !== null && !inNadrukrij}
            onTik={onTik ? () => onTik(i) : undefined}
          />
        );
      })}
    </div>
  );
}
