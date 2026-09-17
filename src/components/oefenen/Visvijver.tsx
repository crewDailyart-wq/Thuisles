"use client";

/**
 * Vos gaat vissen: welk getal is het grootste of het kleinste?
 *
 * Vos staat op een steiger bóven het water, met zijn hengel in zijn poten.
 * Daaronder zwemmen drie of vier vissen met een groot getal op hun buik. Het
 * kind tikt de vis aan die het zoekt; de lijn zwaait ernaartoe en haakt vast.
 * Goed: hij trekt de vis omhoog. Fout: de vis glipt los met een plons.
 *
 * ---------------------------------------------------------------------------
 * Vos hoort niet in het water
 * ---------------------------------------------------------------------------
 * Hij stond eerst tússen de vissen. Dat klopt niet — een vos zwemt niet — en
 * erger: alles in het watervak lijkt mee te tellen. Nu ligt de steiger bóven
 * het blauwe vak en staat hij daar helemaal buiten.
 *
 * ---------------------------------------------------------------------------
 * Het touw is de terugkoppeling
 * ---------------------------------------------------------------------------
 * Zonder zichtbaar touw weet een kind niet wélke vis het heeft aangetikt, zeker
 * niet als het antwoord fout was. Het strekt zich in een halve tel naar de vis
 * toe en blijft eraan vastzitten: dat is het antwoord, in beeld.
 *
 * Het is een SVG-boog met een lichte doorbuiging, geen kaarsrechte streep: een
 * touw hangt door, en dat kleine verschil maakt het verschil tussen een lijn en
 * een hengel. Het uiteinde loopt met de hand mee in kleine stapjes, want een
 * browser kan een pad niet vanzelf van de ene vorm naar de andere laten lopen.
 *
 * ---------------------------------------------------------------------------
 * Waar het touw begint
 * ---------------------------------------------------------------------------
 * Aan het puntje van de hengel — en die hengel zit op de afbeelding van Vos, niet
 * in de code. Waar dat puntje op dat plaatje zit, staat als percentage bij het
 * sjabloon (zie `HENGELVOS` in de generator): zoveel procent van de breedte,
 * zoveel procent van de hoogte. Het plaatje wordt hier opgemeten, dus het touw
 * blijft eraan vastzitten op elk schermformaat.
 *
 * Is er geen hengelvos ingesteld, dan blijft alles zoals het was: de gewone vos
 * uit het afbeeldingenbeheer met een hengeltje dat hier getekend wordt.
 *
 * ---------------------------------------------------------------------------
 * Alles in dezelfde eenheid
 * ---------------------------------------------------------------------------
 * Elke maat hieronder staat in procenten van de BREEDTE van het geheel, ook de
 * hoogtes. In CSS is `left` een percentage van de breedte en `top` van de
 * hoogte; zijn die niet even groot, dan klopt geen enkele afstand meer — en de
 * lijn moet nu juist precies bij een vis uitkomen.
 */

import { useEffect, useRef, useState } from "react";
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
 * De kleuren van goed en fout, precies zoals de rest van de oefenomgeving.
 *
 * Groen is `--color-groen` en `--color-groen-diep`, dezelfde als onder de
 * keuzeknoppen en in de invulvakken. Voor fout is dat `--color-roze`: in een
 * vraag zelf gebruikt deze app met opzet geen alarmrood — zie de toelichting
 * bij `--color-fout` in globals.css, dat is alleen voor de bolletjes in de
 * balk. Het is wel dieper en veel verzadigder dan het lichte roze van een
 * gewone vis, dus ook die vis verandert zichtbaar.
 *
 * De cijferplaat op de buik blijft licht, dus het getal blijft donker op licht
 * staan en even goed leesbaar als daarvoor.
 */
const MERKKLEUREN = {
  goed: { lijf: "#1f9d63", vin: "#17784c" },
  fout: { lijf: "#e4607f", vin: "#c2456a" },
};

// ---------------------------------------------------------------------------
// De maatvoering
// ---------------------------------------------------------------------------

/** Hoogte van de steiger met Vos erop, in breedteprocenten. */
const STEIGER = 26;
/** Marge binnen het watervak. */
const KANT = 5;
/** Ruimte tussen twee vissen, als factor van de vismaat. */
const TUSSEN = 1.18;
/** De verhouding van het visplaatje: 160 breed, 100 hoog. */
const VISVORM = 1.6;
/** De hengel: waar hij begint, hoe lang hij is en hoe schuin hij staat. */
const HENGEL = { x: 24, y: STEIGER - 13, lengte: 13, hoek: -18 };

/**
 * Hoe hoog het stuk boven het water wordt als er een hengelvos staat.
 *
 * Die vos staat rechtop met zijn hengel schuin omhoog, en dat puntje hoort in
 * beeld te blijven — anders begint het touw buiten de tekening. Hij heeft dus
 * meer lucht boven de steiger nodig dan de gewone vos.
 */
const STEIGER_HENGEL = 40;

/**
 * Waar de hengelvos op de steiger staat, in breedteprocenten.
 *
 * `onder` is hoe ver de onderkant van zijn plaatje boven de waterlijn eindigt;
 * zo komen zijn voeten op de plank terecht in plaats van erboven te zweven.
 */
const HENGELVOSPLEK = { links: 1, breedte: 34, onder: 1 };

/** Hoe ver het touw in rust onder het hengelpuntje hangt. Kort en slap. */
const RUSTTOUW = 14;

/**
 * Hoe smal een vis mag worden voordat er een rij bij komt, in echte pixels.
 *
 * Alles hier rekent in procenten, en dat gaat mis op een telefoon: drie vissen
 * naast elkaar zijn daar samen net zo breed als op een laptop, maar in
 * pixels een stuk kleiner — en het getal krimpt mee. Bij honderdacht pixels is
 * een getal op de vis nog ongeveer drieëntwintig pixels hoog; daaronder wordt
 * het te klein voor een kind dat de cijfers zelf nog aan het leren is.
 *
 * Zakt het eronder, dan gaan er kolommen af en komt er een rij bij. Drie
 * vissen staan op een laptop dus naast elkaar en op een telefoon als twee en
 * één — even groot als op die laptop, alleen anders verdeeld.
 */
const MINSTE_VIS = 108;

/** De emmer op de steiger: waar hij staat en hoe groot hij is. */
const EMMER = { links: 35, breedte: 11, hoogte: 12 };

/** Hoeveel vissen er hoogstens in de emmer te zien zijn. */
const EMMER_VOL = 8;

/** Hoe lang een foute vis boven water hangt voordat hij van de haak glijdt. */
const OPHAALTIJD = 900;

/** Hoe lang hij daarna valt voordat het water opspat. */
const VALTIJD = 320;

/** Hoe hoog Vos wipt als hij beet heeft, in breedteprocenten. */
const WIP = 2.2;

/**
 * Hoe lang het binnenhalen van een goede vangst duurt.
 *
 * Een halve tel omhoog, dan het wipje van Vos erachteraan. Pas daarna mag het
 * feestscherm komen; kwam het eerder, dan ziet het kind zijn vis helemaal niet
 * bovenkomen.
 */
const VANGSTTIJD = 1400;

export type Visplan = {
  /** De breedte van één vis, in procenten van de hele breedte. */
  maat: number;
  /** Waar elke vis ligt: de linkerbovenhoek. */
  plekken: { x: number; y: number }[];
  /** De hoogte van het watervak. */
  waterhoogte: number;
  /** De hoogte van het geheel: steiger plus water. */
  hoogte: number;
};

/**
 * Waar de vissen zwemmen.
 *
 * Netjes verdeeld over het hele watervak: drie naast elkaar, vier in twee
 * rijen van twee. Een rooster en geen strooiwerk — zo klitten ze nooit samen
 * in een hoek en raken ze elkaar nooit, ook niet op een telefoon, waar alles
 * gewoon evenredig kleiner wordt.
 */
/** Hoe breed één vis wordt bij dit aantal kolommen, in breedteprocenten. */
function maatBij(kolommen: number): number {
  return (100 - 2 * KANT - (kolommen - 1) * (TUSSEN - 1) * 30) / kolommen;
}

/**
 * Hoeveel vissen er naast elkaar passen zonder dat het getal te klein wordt.
 *
 * Zolang er nog niets gemeten is, geldt de brede verdeling: dat is wat er op
 * een laptop hoort te staan, en op een telefoon wordt hij meteen daarna
 * bijgesteld — de meting valt in dezelfde beeldopbouw, dus er springt niets.
 */
export function kolommenVoor(aantal: number, breedtePx: number | null): number {
  const n = Math.max(1, aantal);
  let kolommen = n <= 3 ? n : 2;
  if (breedtePx === null || breedtePx <= 0) return kolommen;
  while (kolommen > 1 && (maatBij(kolommen) / 100) * breedtePx < MINSTE_VIS) kolommen--;
  return kolommen;
}

export function visPlan(
  aantal: number,
  steiger: number = STEIGER,
  kolommenOverschrijf: number | null = null,
): Visplan {
  const n = Math.max(1, aantal);
  const kolommen = Math.max(1, Math.min(n, kolommenOverschrijf ?? (n <= 3 ? n : 2)));
  const rijen = Math.ceil(n / kolommen);

  const maat = maatBij(kolommen);
  const hoog = maat / VISVORM;
  const waterhoogte = rijen * hoog + (rijen + 1) * (hoog * 0.42);

  const stapX = (100 - 2 * KANT) / kolommen;
  const stapY = waterhoogte / rijen;

  const plekken = Array.from({ length: n }, (_, i) => {
    const rij = Math.floor(i / kolommen);
    const kolom = i % kolommen;
    /* In de laatste rij kan er eentje overblijven; die komt in het midden. */
    const inRij = Math.min(kolommen, n - rij * kolommen);
    const breedRij = inRij * stapX;
    const startX = KANT + (100 - 2 * KANT - breedRij) / 2;
    return {
      x: startX + kolom * stapX + (stapX - maat) / 2,
      y: steiger + rij * stapY + (stapY - hoog) / 2,
    };
  });

  return { maat, plekken, waterhoogte, hoogte: steiger + waterhoogte };
}

// ---------------------------------------------------------------------------
// Het touw
// ---------------------------------------------------------------------------

export type Punt = { x: number; y: number };

/**
 * Het pad van het touw, van het hengelpuntje naar de haak.
 *
 * Met een doorbuiging, want een touw hangt door. Hoe die doorbuiging valt,
 * hangt af van hoe het touw ligt: hangt het recht naar beneden, dan bolt het
 * opzij; ligt het schuin naar een vis, dan zakt het door in het midden. Zo
 * blijft het in elke stand op een touw lijken en niet op een strak gespannen
 * draad.
 *
 * `gespannen` maakt de bocht kleiner: zit er een vis aan, dan staat het touw
 * strak.
 */
export function touwPad(van: Punt, naar: Punt, gespannen: boolean): string {
  const dx = naar.x - van.x;
  const dy = naar.y - van.y;
  const lengte = Math.hypot(dx, dy) || 1;

  const slap = lengte * (gespannen ? 0.06 : 0.16);
  const bocht = (slap * Math.abs(dy)) / lengte;
  const zak = (slap * Math.abs(dx)) / lengte;

  const mx = van.x + dx / 2 + bocht;
  const my = van.y + dy / 2 + zak;
  return `M ${van.x.toFixed(2)} ${van.y.toFixed(2)} Q ${mx.toFixed(2)} ${my.toFixed(2)} ${naar.x.toFixed(2)} ${naar.y.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// De tekening
// ---------------------------------------------------------------------------

/**
 * Eén vis, met zijn getal op zijn buik.
 *
 * Dik omrand als in een tekenfilm, met een glansje op zijn rug en een
 * luchtbelletje bij zijn bek. Het getal staat groot en donker op een licht
 * vlak: dat moet leesbaar blijven terwijl hij deint.
 *
 * `spiegel` draait hem om, zodat niet alle vissen dezelfde kant op kijken. Het
 * getal draait niet mee: dat wordt ná de spiegeling getekend, want een getal
 * dat achterstevoren staat is geen getal meer.
 */
function Visje({
  getal,
  kleur,
  spiegel = false,
  merk = null,
}: {
  getal: number;
  kleur: number;
  spiegel?: boolean;
  /**
   * Dit is de vis die gekozen is, en zo is het afgelopen.
   *
   * Zijn lijf en vinnen kleuren dan groen of roze terwijl hij omhoogkomt. De
   * overgang loopt in een halve tel, zodat het kind de kleur ziet veranderen
   * en niet alleen een andere vis ziet staan.
   */
  merk?: "goed" | "fout" | null;
}) {
  const k = merk ? MERKKLEUREN[merk] : KLEUREN[kleur % KLEUREN.length];

  return (
    <svg
      viewBox="0 0 160 100"
      className="h-full w-full overflow-visible [&_ellipse]:transition-[fill] [&_path]:transition-[fill] [&_ellipse]:duration-500 [&_path]:duration-500"
      aria-hidden="true"
    >
      <g transform={spiegel ? "translate(160,0) scale(-1,1)" : undefined}>
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
        <ellipse cx="82" cy="50" rx="64" ry="34" fill={k.lijf} stroke={RAND} strokeWidth={RANDDIKTE} />
        {/* Glans op de rug */}
        <path d="M52 26 Q86 14 118 28 Q86 22 56 34 Z" fill="#ffffff" opacity="0.45" />
        {/* Oog en bek */}
        <circle cx="134" cy="40" r="7" fill="#fff8ec" stroke={RAND} strokeWidth={RANDDIKTE * 0.7} />
        <circle cx="136" cy="40" r="3" fill={RAND} />
        <path
          d="M150 52 q-6 6 0 12"
          fill="none"
          stroke={RAND}
          strokeWidth={RANDDIKTE * 0.8}
          strokeLinecap="round"
        />
        {/* Luchtbelletje */}
        <circle cx="156" cy="30" r="5" fill="#ffffff" opacity="0.65" stroke={RAND} strokeWidth="2" />
      </g>

      {/* Het getal, altijd rechtop en op een licht vlak zodat het leesbaar blijft. */}
      <rect x="44" y="30" width="72" height="40" rx="14" fill="#fff8ec" opacity="0.92" />
      <text x="80" y="62" textAnchor="middle" fontSize="34" fontWeight="800" fill={RAND}>
        {getal}
      </text>
    </svg>
  );
}

/**
 * De emmer op de steiger, met de vangst van deze oefensessie erin.
 *
 * Waarom hij er staat: een kind van zes houdt een balkje bovenin niet bij, maar
 * een emmer die voller wordt wel. Elke vis die het goed heeft, ligt er zichtbaar
 * in — dat is hetzelfde verhaal als de voortgang, maar dan in iets wat het kind
 * zelf heeft gevangen.
 *
 * Boven de acht houdt het op met groeien. Een emmer die eindeloos voller wordt
 * zou de rest van het plaatje opeten, en na acht vissen is het punt allang
 * gemaakt.
 */
function Emmer({ aantal }: { aantal: number }) {
  const erin = Math.max(0, Math.min(EMMER_VOL, aantal));

  return (
    <svg viewBox="0 0 100 118" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Het hengsel, achter de vissen langs. */}
      <path
        d="M20 44 q30 -30 60 0"
        fill="none"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinecap="round"
      />

      {/*
        De vangst steekt over de rand. Twee rijen, de bovenste ingesprongen,
        zodat acht vissen er nog steeds uitzien als een emmer vol en niet als
        een rij streepjes.
      */}
      {Array.from({ length: erin }, (_, i) => {
        const rij = i < 4 ? 0 : 1;
        const plek = i < 4 ? i : i - 4;
        /*
          De onderste rij ligt met zijn buik net over de rand, de bovenste er
          los bovenop. Zo is aan het silhouet te zien dat de emmer voller wordt
          en niet alleen dat er een vis bij komt.
        */
        const x = (rij === 0 ? 16 : 26) + plek * 18;
        const y = rij === 0 ? 27 : 13;
        const k = KLEUREN[i % KLEUREN.length];
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i % 2 === 0 ? -14 : 12})`}>
            <path
              d="M0 7 L-7 -1 Q-3 7 -7 15 Z"
              fill={k.vin}
              stroke={RAND}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <ellipse cx="9" cy="7" rx="10" ry="6.5" fill={k.lijf} stroke={RAND} strokeWidth="2.6" />
            <circle cx="14" cy="5" r="1.8" fill={RAND} />
          </g>
        );
      })}

      {/* De emmer zelf, over de onderkant van de vissen heen. */}
      <path
        d="M10 44 L20 110 H80 L90 44 Z"
        fill="#ff6b5e"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path d="M20 52 h10 l-6 50 h-10 z" fill="#ffffff" opacity="0.28" />
      <ellipse cx="50" cy="44" rx="40" ry="9" fill="#ff8a7e" stroke={RAND} strokeWidth={RANDDIKTE} />
      <ellipse cx="50" cy="44" rx="31" ry="5" fill="#d94b40" opacity="0.5" />
    </svg>
  );
}

/** Een plons: drie druppels die opspatten waar de vis lag. */
function Plons() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full" aria-hidden="true">
      <path d="M10 46 q14 -22 30 -4" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M58 44 q14 -26 32 -2" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <circle cx="34" cy="16" r="5" fill="#ffffff" opacity="0.9" />
      <circle cx="66" cy="12" r="4" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// De vijver in de vraag
// ---------------------------------------------------------------------------

/**
 * Het hele vijvertje, met de vissen als knoppen.
 *
 * De vissen zijn zelf de antwoordknoppen: het kind tikt aan wat het bedoelt.
 * De hengellijn laat daarna zien wélke vis dat was — ook, en juist, als het
 * antwoord fout was.
 */
export function Visvijver({
  vissen,
  gekozen,
  fase = "bezig",
  markeer = true,
  vos = { vangend: null, wachtend: null, blij: null },
  hengel = null,
  goedeVis = null,
  gevangen = 0,
  onKlaar,
  onKies,
}: {
  vissen: Vis[];
  /** De plek van de aangetikte vis, als tekst; leeg als er nog niets is gekozen. */
  gekozen: string;
  fase?: "bezig" | "goed" | "fout";
  /** Groep 3-4: een foute keuze kleurt rood. */
  markeer?: boolean;
  vos?: Voshoudingen;
  /**
   * De vissende vos: één afbeelding met de hengel er al op, plus de plek van
   * het hengelpuntje in procenten van die afbeelding. Zie `HENGELVOS` in de
   * generator. Leeg of `null` = de gewone vos met een getekend hengeltje.
   */
  hengel?: { afbeelding: string | null; x: number; y: number } | null;
  /**
   * Welke vis het wél was; de plek in de rij.
   *
   * Alleen ingevuld als er bij een fout antwoord getoond mag worden wat goed
   * was — bij groep 3-4 dus, net als bij de kleuren onder de keuzeknoppen. Die
   * vis wipt dan even op nadat de verkeerde van de haak is geglipt.
   */
  goedeVis?: number | null;
  /** Hoeveel vissen er al gevangen zijn in deze oefensessie; die zitten in de emmer. */
  gevangen?: number;
  /**
   * De vangst is binnen: de vis hangt boven water en Vos is uitgesprongen.
   *
   * Hiermee weet het scherm eromheen dat het feest mag beginnen. Zonder dit
   * valt de confetti over de vis heen op het moment dat hij omhoogkomt, en
   * krijgt het kind het enige te zien waar het op dat moment om ging niet mee.
   */
  onKlaar?: () => void;
  onKies?: (waarde: string) => void;
}) {
  const metHengel = Boolean(hengel?.afbeelding);
  /*
    Hoe breed de vijver echt is, in pixels. Daarmee wordt bepaald hoeveel
    vissen er naast elkaar kunnen zonder dat hun getal te klein wordt.
  */
  const [breedtePx, setBreedtePx] = useState<number | null>(null);
  const kolommen = kolommenVoor(vissen.length, breedtePx);
  const hoog = maatBij(kolommen) / VISVORM;

  const doel = gekozen === "" ? null : Number(gekozen);

  /*
    De tijdlijn van een fout antwoord.

    Elk antwoord begint hetzelfde: het touw haakt vast en de vis komt omhoog,
    groen of roze. Pas daarna scheiden de wegen. Dat is met opzet — zag een
    kind bij een fout meteen zijn vis wegschieten, dan wist het nog steeds niet
    wélke vis het had aangetikt, en dat was precies de klacht.

    `losgeschoten` is het moment waarop hij van de haak glijdt en terugvalt;
    `geplonsd` is het moment waarop hij het water raakt en het spat. Die twee
    staan los van elkaar omdat de val zelf ook tijd kost: plonst het meteen,
    dan spat het water terwijl de vis nog in de lucht hangt.

    Boven water blijven duurt `OPHAALTIJD`: een halve tel om omhoog te komen en
    daarna nog even om de kleur te laten landen.
  */
  const [losgeschoten, setLosgeschoten] = useState(false);
  const [geplonsd, setGeplonsd] = useState(false);
  useEffect(() => {
    if (fase !== "fout") return;
    const klok = setTimeout(() => setLosgeschoten(true), OPHAALTIJD);
    return () => {
      clearTimeout(klok);
      setLosgeschoten(false);
    };
  }, [fase]);
  useEffect(() => {
    if (!losgeschoten) return;
    const klok = setTimeout(() => setGeplonsd(true), VALTIJD);
    return () => {
      clearTimeout(klok);
      setGeplonsd(false);
    };
  }, [losgeschoten]);

  /*
    Melden dat de vangst binnen is.

    Via een ref, want degene die deze component gebruikt geeft hier meestal een
    versgemaakte functie door. Stond die in de afhankelijkheden, dan werd het
    klokje bij elk beeld opnieuw gezet en liep het nooit af.
  */
  const klaarRef = useRef(onKlaar);
  klaarRef.current = onKlaar;
  useEffect(() => {
    if (fase !== "goed") return;
    const klok = setTimeout(() => klaarRef.current?.(), VANGSTTIJD);
    return () => clearTimeout(klok);
  }, [fase]);

  const vakRef = useRef<HTMLDivElement>(null);
  const buitenRef = useRef<HTMLDivElement>(null);
  const vosRef = useRef<HTMLDivElement>(null);
  const vlakRef = useRef<HTMLDivElement>(null);
  useVosplek(vakRef, buitenRef, vosRef, vlakRef, false);

  /*
    Hoe hoog het plaatje van de hengelvos uitvalt, in breedteprocenten.

    Opgemeten en niet ingetikt: de verhouding van een afbeelding staat pas vast
    als hij binnen is, en elke vos die hierna geüpload wordt kan anders van
    vorm zijn. Zolang er nog niets gemeten is, wordt hij vierkant gerekend —
    dat is wat de meegeleverde vos is, dus in de praktijk staat hij meteen goed.
  */
  const vosbeeldRef = useRef<HTMLDivElement>(null);
  const [vosHoogte, setVosHoogte] = useState<number | null>(null);
  useEffect(() => {
    const beeld = vosbeeldRef.current;
    const vlak = vlakRef.current;
    if (!vlak) return;

    function meet() {
      if (!vlak) return;
      const v = vlak.getBoundingClientRect();
      if (v.width <= 0) return;

      /* Alleen bijwerken bij een echt verschil, anders meet-teken-meet-molen. */
      setBreedtePx((vorig) =>
        vorig !== null && Math.abs(vorig - v.width) < 0.5 ? vorig : v.width,
      );

      if (!beeld) return;
      const b = beeld.getBoundingClientRect();
      if (b.height <= 0) return;
      const hoogte = (b.height / v.width) * 100;
      setVosHoogte((vorig) =>
        vorig !== null && Math.abs(vorig - hoogte) < 0.01 ? vorig : hoogte,
      );
    }

    meet();
    const plaatje = beeld?.querySelector("img") ?? null;
    if (plaatje && !plaatje.complete) plaatje.addEventListener("load", meet);
    const kijker = new ResizeObserver(meet);
    if (beeld) kijker.observe(beeld);
    kijker.observe(vlak);
    return () => {
      kijker.disconnect();
      if (plaatje) plaatje.removeEventListener("load", meet);
    };
  }, [metHengel]);

  /*
    Hoe hoog er gewipt wordt als er een vis boven water hangt.

    Vos, zijn touw en de vis eraan moeten precies even hoog wippen, anders laat
    het touw zichtbaar los. Het touw staat in de tekening en rekent in eigen
    eenheden; Vos en de vis zijn gewone elementen en rekenen in schermpixels.
    `WIP` staat in de eenheid van de tekening en wordt hier omgerekend, zodat
    het op elk scherm dezelfde hoogte is.
  */
  const wipHoogte = ((breedtePx ?? 0) * WIP) / 100;

  /*
    Hoe hoog de plank boven het water hangt.

    Niet zomaar een getal: een opgehaalde vis hangt straks tussen het water en
    die plank in, en moet er dus onderdoor kunnen. Blijft er te weinig lucht,
    dan komt hij half over de steiger en over Vos heen te staan, en dat is
    precies waar het kind naar moet kijken. De ruimte volgt daarom uit de
    hoogte van een vis, en die hangt weer af van hoeveel er naast elkaar staan.

    Zonder hengelvos blijft het zoals het was: die vos is klein en staat laag.
  */
  const plankOnder = metHengel ? hoog * 0.65 + 2.5 : HENGELVOSPLEK.onder;

  /* Waar zijn plaatje staat: onderkant net in de plank, dus voeten op de steiger. */
  const vosHoog = vosHoogte ?? HENGELVOSPLEK.breedte;

  /*
    En hoeveel er dan in totaal boven het water nodig is: de lucht onder de
    plank, plus Vos die erop staat. Hij mag er nooit bovenuit steken, want dan
    valt het puntje van zijn hengel buiten de tekening en begint het touw in het
    niets.
  */
  const steiger = metHengel
    ? Math.max(STEIGER_HENGEL, plankOnder + vosHoog)
    : STEIGER;

  const plan = visPlan(vissen.length, steiger, kolommen);
  const uit = fase !== "bezig";
  const goed = fase === "goed";

  const vosTop = Math.max(0, steiger - plankOnder - vosHoog);

  /**
   * Waar het touw begint: het puntje van de hengel.
   *
   * Met een hengelvos komt dat uit de afbeelding: het percentage uit de
   * instelling, omgerekend naar de gemeten maat van dat plaatje. Zonder
   * hengelvos wordt de stok hier getekend, en volgt de top uit zijn lengte en
   * zijn hoek — tikte je dat los van elkaar in, dan bleef er een gaatje tussen
   * de stok en het touw staan.
   */
  const tip =
    metHengel && hengel
      ? {
          x: HENGELVOSPLEK.links + HENGELVOSPLEK.breedte * (hengel.x / 100),
          y: vosTop + vosHoog * (hengel.y / 100),
        }
      : {
          x: HENGEL.x + HENGEL.lengte * Math.cos((HENGEL.hoek * Math.PI) / 180),
          y: HENGEL.y + HENGEL.lengte * Math.sin((HENGEL.hoek * Math.PI) / 180),
        };

  /* De ruststand: kort en slap recht onder het puntje. */
  const rust = metHengel
    ? { x: tip.x + 0.8, y: tip.y + RUSTTOUW }
    : { x: tip.x + 4, y: steiger + hoog * 0.7 };

  /**
   * Waar de haak naartoe moet.
   *
   * Zonder keuze hangt hij in rust. Met een keuze gaat hij naar de bek van die
   * vis; is het antwoord goed, dan volgt hij de vis omhoog. Is het fout en is
   * de vis van de haak geglipt, dan veert het touw terug naar de ruststand.
   */
  /*
    En wel bij zijn bek, niet ergens op zijn rug. Welke kant dat is hangt ervan
    af of die vis gespiegeld zwemt — om en om, zodat ze niet allemaal dezelfde
    kant op kijken. Een vis die aan zijn bek omhoogkomt ziet eruit als gevangen;
    eentje die aan zijn rug hangt ziet eruit als een fout.
  */
  const bek = (i: number) => (i % 2 === 1 ? 0.08 : 0.92);

  /* Boven water hangt hij hier; zolang er nog nagekeken wordt blijft hij liggen. */
  const opgehaald = fase !== "bezig" && !losgeschoten;
  const haak =
    doel === null || !plan.plekken[doel] || losgeschoten
      ? rust
      : {
          x: plan.plekken[doel].x + plan.maat * bek(doel),
          y: (opgehaald ? steiger - hoog * 0.65 : plan.plekken[doel].y) + hoog * 0.55,
        };

  /*
    Het uiteinde loopt met de hand naar zijn doel toe.

    Een browser kan een `d` van een pad niet vanzelf van de ene vorm naar de
    andere laten lopen zoals hij dat met een kleur of een verschuiving doet.
    Daarom wordt het punt hier in kleine stapjes verplaatst, uitlopend, zodat
    het touw zich vloeiend strekt en net zo vloeiend terugveert.
  */
  const puntNu = useRef(haak);
  const [punt, setPunt] = useState(haak);
  useEffect(() => {
    const van = puntNu.current;
    const stil =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (stil) {
      puntNu.current = haak;
      setPunt(haak);
      return;
    }

    const begin = performance.now();
    const duur = 480;
    let vraag = 0;
    function stap(nu: number) {
      const deel = Math.min(1, (nu - begin) / duur);
      const soepel = 1 - Math.pow(1 - deel, 3);
      const volgend = {
        x: van.x + (haak.x - van.x) * soepel,
        y: van.y + (haak.y - van.y) * soepel,
      };
      puntNu.current = volgend;
      setPunt(volgend);
      if (deel < 1) vraag = requestAnimationFrame(stap);
    }
    vraag = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(vraag);
  }, [haak.x, haak.y]);

  return (
    <div ref={buitenRef} className="mx-auto w-full max-w-xl">
      <div ref={vakRef} className="relative w-full">
        <div
          ref={vlakRef}
          className="relative w-full"
          style={{ aspectRatio: `100 / ${plan.hoogte}` }}
        >
          {/* Het water: een eigen vak, met de steiger erboven. */}
          <div
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-groot border-2 border-rand bg-[#bfe8f7] shadow-op"
            style={{ height: `${(plan.waterhoogte / plan.hoogte) * 100}%` }}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[7%] bg-[#8fd4ee]" />
          </div>

          {/* De steiger waar Vos op staat. */}
          <div
            aria-hidden="true"
            className="absolute rounded-md border-2 border-rand bg-[#c98f52]"
            style={{
              left: "2%",
              width: "46%",
              top: `${((steiger - plankOnder - 6) / plan.hoogte) * 100}%`,
              height: `${(6 / plan.hoogte) * 100}%`,
            }}
          >
            <span className="absolute inset-x-0 top-0 h-1/3 bg-white/25" />
          </div>
          {/* Twee paaltjes die in het water staan. */}
          {[10, 34].map((x) => (
            <span
              key={x}
              aria-hidden="true"
              className="absolute rounded-b-md border-2 border-rand bg-[#a97238]"
              style={{
                left: `${x}%`,
                width: "3.5%",
                top: `${((steiger - plankOnder - 1) / plan.hoogte) * 100}%`,
                height: `${((plankOnder + 11) / plan.hoogte) * 100}%`,
              }}
            />
          ))}

          {/*
            Vos op de steiger, helemaal buiten het water.

            Met een hengelvos staat hij groter en links op de plank: zijn hengel
            steekt schuin omhoog naar rechtsboven, en dat puntje moet in beeld
            blijven, want daar begint het touw.

            Hij staat daarbij altijd stil, ook na een goed antwoord. Zou hij
            wippen, dan wipt het hengelpuntje mee terwijl het touw blijft staan
            waar het staat — en dan laat het touw zichtbaar los. De blijdschap
            zit in de vis die omhoogkomt.
          */}
          {metHengel && hengel?.afbeelding ? (
            <div
              ref={vosbeeldRef}
              aria-hidden="true"
              className={`absolute ${goed ? "vangst-wipt" : ""}`}
              style={
                {
                  left: `${HENGELVOSPLEK.links}%`,
                  width: `${HENGELVOSPLEK.breedte}%`,
                  top: `${(vosTop / plan.hoogte) * 100}%`,
                  "--wip": `${wipHoogte}px`,
                } as React.CSSProperties
              }
            >
              <Vosbeeld
                houdingen={{ vangend: hengel.afbeelding, wachtend: null, blij: null }}
                stand="vangend"
                stil
              />
            </div>
          ) : (
            vos.vangend && (
              <div
                ref={vosRef}
                aria-hidden="true"
                className="absolute"
                style={{
                  left: "6%",
                  width: "24%",
                  top: `${((steiger - 7 - 24 / VISVORM - 8) / plan.hoogte) * 100}%`,
                }}
              >
                <Vosbeeld houdingen={vos} stand={goed ? "blij" : "wachtend"} stil={!goed} />
              </div>
            )
          )}

          {/*
            De emmer met de vangst, naast Vos op de plank.

            Vóór het touw getekend, zodat de lijn er langs kan lopen zonder dat
            hij achter de emmer verdwijnt.
          */}
          <span
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${EMMER.links}%`,
              width: `${EMMER.breedte}%`,
              top: `${((steiger - plankOnder - 1 - EMMER.hoogte) / plan.hoogte) * 100}%`,
            }}
          >
            <Emmer aantal={gevangen} />
          </span>

          {/*
            De hengel, alleen als hij niet al op het plaatje staat.

            Een stok die vanaf Vos schuin omhoog steekt. Staat er wél een
            hengelvos, dan heeft die zijn eigen hengel en zou deze er dubbel
            bijstaan.
          */}
          {!metHengel && (
            <span
              aria-hidden="true"
              className="absolute origin-left rounded-full bg-[#7a4a1e]"
              style={{
                left: `${HENGEL.x}%`,
                top: `${(HENGEL.y / plan.hoogte) * 100}%`,
                width: `${HENGEL.lengte}%`,
                height: "0.8%",
                transform: `rotate(${HENGEL.hoek}deg)`,
              }}
            />
          )}

          {/*
            Het touw.

            Eén tekenvlak over de hele vijver, in dezelfde eenheid als al het
            andere hier: honderd breed, `plan.hoogte` hoog, allebei procenten
            van de breedte. Het vak heeft precies die verhouding, dus een punt
            in dit stelsel valt samen met hetzelfde punt in de tekening.

            Het wordt twee keer getekend: eerst een donkere schaduw eronder,
            dan de lichte draad. Alleen licht verdwijnt tegen het witte kaartje,
            alleen donker ziet er niet uit als een visdraad — samen blijft hij
            zichtbaar boven het water én boven de kaart.
          */}
          <svg
            aria-hidden="true"
            viewBox={`0 0 100 ${plan.hoogte}`}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            {/*
              Zolang er nog niets is aangetikt, wiegt het touw zachtjes heen en
              weer. Het draait om het hengelpuntje, dus dat blijft precies op
              zijn plek zitten en het touw laat nooit los. Zodra er een vis is
              gekozen staat het stil: dan hoort de aandacht bij het antwoord.
            */}
            <g
              className={
                doel === null && fase === "bezig"
                  ? "touw-wiegt"
                  : goed && metHengel
                    ? "vangst-wipt"
                    : undefined
              }
              style={
                {
                  "--touw-x": `${tip.x}px`,
                  "--touw-y": `${tip.y}px`,
                  /* In de eenheid van de tekening; Vos en de vis rekenen het om. */
                  "--wip": `${WIP}px`,
                } as React.CSSProperties
              }
            >
            <path
              d={touwPad(tip, punt, doel !== null && !losgeschoten)}
              fill="none"
              stroke="#25384a"
              strokeOpacity="0.28"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <path
              d={touwPad(tip, punt, doel !== null && !losgeschoten)}
              fill="none"
              stroke="#f4fbff"
              strokeWidth="0.35"
              strokeLinecap="round"
            />
            {/* Het haakje aan het eind: een klein krulletje met een oogje. */}
            <path
              d={`M ${punt.x.toFixed(2)} ${punt.y.toFixed(2)} v 0.9 a 0.8 0.8 0 1 0 -1.4 0.3`}
              fill="none"
              stroke="#25384a"
              strokeOpacity="0.75"
              strokeWidth="0.42"
              strokeLinecap="round"
            />
            </g>
          </svg>

          {/* De vissen. */}
          {vissen.map((vis, i) => {
            const plek = plan.plekken[i];
            const dezeGekozen = doel === i;
            /* Elk antwoord komt omhoog: goed én fout. Een foute valt daarna terug. */
            const omhoog = dezeGekozen && opgehaald;
            /*
              De kleur van de uitslag. Groen bij een goed antwoord, voor elke
              groep — net als bij de keuzeknoppen. Roze alleen waar de app fouten
              mag kleuren, dus bij groep 3-4; daarboven blijft de vis zichzelf en
              zegt de tekst eronder wat er mis ging.

              Hij blijft gekleurd nadat hij is teruggevallen: de uitleg staat er
              dan naast, en dan hoort in het water nog te zien te zijn welke vis
              het was.
            */
            const merk: "goed" | "fout" | null = !dezeGekozen
              ? null
              : goed
                ? "goed"
                : fase === "fout" && markeer
                  ? "fout"
                  : null;
            /*
              De goede vis wipt één keer op zodra de verkeerde is teruggevallen.
              Dat beantwoordt de vraag die een kind op dat moment stelt — welke
              was het dan wél — nog voordat de uitleg begint.
            */
            const wipt = losgeschoten && goedeVis === i && !dezeGekozen;
            /*
              De gevangen vis wipt mee met Vos en zijn touw. Allemaal dezelfde
              beweging, anders laat het touw los van de vis die eraan hangt.
            */
            const viert = omhoog && goed && metHengel;

            return (
              <button
                key={i}
                type="button"
                disabled={uit}
                onClick={() => onKies?.(String(i))}
                aria-label={`Vis met ${vis.getal}`}
                className={`absolute transition-[left,top,transform,opacity] duration-500 ease-out disabled:cursor-not-allowed ${
                  !uit ? "motion-safe:animate-vis-deint hover:scale-105" : ""
                } ${wipt ? "motion-safe:animate-vis-wipt" : ""} ${
                  viert ? "vangst-wipt" : ""
                } ${
                  dezeGekozen && !omhoog ? "scale-105" : ""
                } focus:outline-none focus-visible:ring-4 focus-visible:ring-huisstijl`}
                style={
                  {
                    left: `${plek.x}%`,
                    top: `${((omhoog ? steiger - hoog * 0.65 : plek.y) / plan.hoogte) * 100}%`,
                    width: `${plan.maat}%`,
                    animationDelay: viert ? undefined : `${i * 0.5}s`,
                    "--wip": `${wipHoogte}px`,
                  } as React.CSSProperties
                }
              >
                {/* Om en om de andere kant op: dat leeft. */}
                <Visje getal={vis.getal} kleur={i} spiegel={i % 2 === 1} merk={merk} />
              </button>
            );
          })}

          {/* De plons, op de waterlijn waar de vis erin valt. */}
          {geplonsd && doel !== null && plan.plekken[doel] && (
            <span
              aria-hidden="true"
              className="absolute"
              style={{
                left: `${plan.plekken[doel].x + plan.maat * 0.2}%`,
                top: `${((steiger - hoog * 0.42) / plan.hoogte) * 100}%`,
                width: `${plan.maat * 0.6}%`,
              }}
            >
              <Plons />
            </span>
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
