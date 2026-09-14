"use client";

/**
 * De telfiguren: vrolijke plaatjes met een telbaar aantal onderdelen.
 *
 * Gebruikt door het generator-type "Tellen en slepen". Elk figuur tekent
 * hetzelfde gegeven op een andere manier: zes blaadjes aan een bloem, zes
 * appels in een boom, zes ballonnen aan een touwtje. Zo blijft de vraag
 * dezelfde terwijl het plaatje afwisselt.
 *
 * ---------------------------------------------------------------------------
 * Waarom de plaatsing wordt uitgerekend
 * ---------------------------------------------------------------------------
 * Een kind moet de onderdelen los van elkaar kunnen tellen. Dat stelt twee
 * eisen die niet met vaste coördinaten te halen zijn, omdat het aantal per
 * vraag verschilt:
 *
 *   1. Elk onderdeel valt binnen het figuur — een appel hoort in de kruin, een
 *      stip op het schild, een ster aan de slinger.
 *   2. Er blijft altijd ruimte tussen de onderdelen, ook bij het hoogste
 *      aantal. Nooit tegen elkaar aan en nooit overlappend.
 *
 * Daarom zegt elk figuur alleen wat zijn vórm is (`inSchijf`, `inEllips`), en
 * rekent `roosterIn` daar de plekken bij uit: een driehoeksrooster waarvan de
 * maaswijdte net zo lang wordt opgerekt tot er precies genoeg plekken binnen de
 * vorm overblijven. De onderdelen worden dus vanzelf kleiner naarmate het er
 * meer zijn, en de tussenruimte is een vast deel van de maaswijdte.
 *
 * De bloem en de slinger hebben een eigen berekening, omdat hun onderdelen niet
 * in een vlak liggen maar op een ring en op een koord.
 *
 * ---------------------------------------------------------------------------
 * Een soort erbij
 * ---------------------------------------------------------------------------
 * Twee plekken, allebei op dezelfde naam:
 *   1. de woorden in `lib/telsoorten.ts` — wat je telt en hoe het geheel heet;
 *   2. de tekening hieronder in `TEKENINGEN`.
 *
 * Daarna komt de soort vanzelf in de afwisseling en in de keuzelijst in het
 * beheer; de generator hoeft er niets voor te weten.
 *
 * Elke tekenfunctie krijgt het aantal en levert de onderdelen als SVG. Het
 * omhulsel eromheen (vierkant, achtergrond) is voor alle soorten gelijk en
 * staat in `Telfiguur`.
 */

import { useId } from "react";
import { telsoortWoorden } from "@/lib/telsoorten";
import type { Figuur } from "@/lib/generatoren/soort";

/** Het vierkant waarin elk figuur getekend wordt. */
const VLAK = 100;

/** Kleuren uit de huisstijl, zodat de figuren bij de rest passen. */
const KLEUR = {
  groen: "#37a86b",
  groenDonker: "#1c7a4a",
  groenBlad: "#4cba7d",
  roze: "#ef6f8d",
  rozeDonker: "#c14664",
  geel: "#f7c53f",
  oranje: "#e4832a",
  viool: "#6b4ae0",
  violetLicht: "#8f73ff",
  lucht: "#3f8ad8",
  luchtLicht: "#5fa8ec",
  bruin: "#c78f4f",
  bruinDonker: "#8f6431",
  rood: "#e4483c",
  roodDonker: "#b32f28",
  inkt: "#2c2545",
  room: "#fdf6ea",
};

// ---------------------------------------------------------------------------
// Plaatsing: uit de vorm gerekend
// ---------------------------------------------------------------------------

type Punt = { x: number; y: number };

/**
 * Afronden op vier decimalen.
 *
 * `Math.sin` en `Math.cos` mogen per JavaScript-motor een laatste cijfer
 * verschillen. Node rekent de bloem dus net iets anders uit dan de browser, en
 * dan klaagt React bij het overnemen van de serverpagina dat de tekening niet
 * klopt. Op vier decimalen is dat verschil weg en blijft de tekening op het oog
 * precies hetzelfde. Gewoon optellen en vermenigvuldigen is wél overal gelijk,
 * dus afronden bij de bron is genoeg.
 */
function rond(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

/** Sinus en cosinus, afgerond; zie `rond` hierboven. */
const sinus = (hoek: number) => rond(Math.sin(hoek));
const cosinus = (hoek: number) => rond(Math.cos(hoek));

/**
 * De lengte van een schuine zijde.
 *
 * Met `Math.sqrt` in plaats van `Math.hypot`: de wortel is in de norm tot op het
 * laatste bit vastgelegd en dus overal gelijk, `Math.hypot` niet.
 */
function lengte(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Past een onderdeel met straal `marge` op deze plek nog helemaal binnen?
 *
 * Elke vorm beantwoordt die vraag zelf. Door de straal mee te geven wordt niet
 * alleen het middelpunt getoetst maar het hele onderdeel, en steekt er dus
 * nooit een appel buiten de kruin.
 */
type Vorm = {
  bevat: (x: number, y: number, marge: number) => boolean;
  /** Waar de vorm ongeveer zit; daarbinnen wordt het rooster gelegd. */
  mid: Punt;
  kader: { x0: number; y0: number; x1: number; y1: number };
};

function inSchijf(cx: number, cy: number, straal: number): Vorm {
  return {
    bevat: (x, y, m) => lengte(x - cx, y - cy) <= straal - m,
    mid: { x: cx, y: cy },
    kader: { x0: cx - straal, y0: cy - straal, x1: cx + straal, y1: cy + straal },
  };
}

function inEllips(cx: number, cy: number, a: number, b: number): Vorm {
  return {
    bevat: (x, y, m) => {
      const ra = a - m;
      const rb = b - m;
      if (ra <= 0 || rb <= 0) return false;
      return ((x - cx) / ra) ** 2 + ((y - cy) / rb) ** 2 <= 1;
    },
    mid: { x: cx, y: cy },
    kader: { x0: cx - a, y0: cy - b, x1: cx + a, y1: cy + b },
  };
}

/** Een vorm met een stuk eruit: het schild zonder de naad en zonder de kop. */
function zonder(vorm: Vorm, uitzondering: (x: number, y: number, m: number) => boolean): Vorm {
  return { ...vorm, bevat: (x, y, m) => vorm.bevat(x, y, m) && !uitzondering(x, y, m) };
}

/** Alle roosterpunten die bij deze maaswijdte binnen de vorm vallen. */
function roosterPunten(vorm: Vorm, maas: number, straal: number): Punt[] {
  const rijhoogte = (maas * Math.sqrt(3)) / 2;
  const { kader, mid } = vorm;
  const rijen = Math.ceil((kader.y1 - kader.y0) / rijhoogte / 2) + 1;
  const kolommen = Math.ceil((kader.x1 - kader.x0) / maas / 2) + 1;

  const punten: Punt[] = [];
  for (let j = -rijen; j <= rijen; j++) {
    const y = mid.y + j * rijhoogte;
    /* Om en om een halve maas opgeschoven: dat maakt het driehoeksrooster. */
    const schuif = j % 2 === 0 ? 0 : maas / 2;
    for (let i = -kolommen; i <= kolommen; i++) {
      const x = mid.x + i * maas + schuif;
      if (vorm.bevat(x, y, straal)) punten.push({ x, y });
    }
  }
  return punten;
}

/**
 * De grootst mogelijke maaswijdte waarbij er nog `aantal` plekken overblijven.
 *
 * Groter mazen betekent minder plekken, dus de grens wordt met halveren gezocht.
 * Bij de gevonden maas horen vanzelf de grootste onderdelen die er nog netjes
 * in passen; `maxStraal` houdt ze bij kleine aantallen op een gewone maat, zodat
 * twee appels geen twee meloenen worden.
 */
function roosterIn(vorm: Vorm, aantal: number, maxStraal: number) {
  let laag = 2;
  /*
    Ruimer dan dit hoeft niet: bij deze maas zijn de onderdelen al zo groot als
    ze mogen worden. Zonder die grens zoekt de berekening bij twee appels de
    wijdste maas die nog past, en dat zijn precies de twee plekken het verst uit
    elkaar — tegen de rand van de kruin aan, met een gat in het midden.
  */
  let hoog = (maxStraal / 0.36) * 2.2;
  let beste: { punten: Punt[]; straal: number } | null = null;

  for (let stap = 0; stap < 24; stap++) {
    const maas = (laag + hoog) / 2;
    const straal = Math.min(maxStraal, maas * 0.36);
    const punten = roosterPunten(vorm, maas, straal);
    if (punten.length >= aantal) {
      beste = { punten, straal };
      laag = maas;
    } else {
      hoog = maas;
    }
  }

  /* Past het echt niet, dan liever heel kleine onderdelen dan een leeg vak. */
  if (!beste) {
    const straal = Math.min(maxStraal, 1.2);
    beste = { punten: roosterPunten(vorm, 3, straal), straal };
  }

  /*
    De plekken die het dichtst bij het midden liggen, zodat de onderdelen een
    compacte groep vormen en niet langs de rand van de vorm blijven hangen.
  */
  const gekozen = [...beste.punten]
    .sort((a, b) => afstand(a, vorm.mid) - afstand(b, vorm.mid))
    .slice(0, aantal);

  /* Daarna op leesvolgorde: van boven naar beneden, links naar rechts. */
  gekozen.sort((a, b) => (Math.abs(a.y - b.y) < 0.5 ? a.x - b.x : a.y - b.y));

  return {
    punten: gekozen.map((p) => ({ x: rond(p.x), y: rond(p.y) })),
    straal: rond(beste.straal),
  };
}

function afstand(a: Punt, b: Punt) {
  return lengte(a.x - b.x, a.y - b.y);
}

/**
 * De uitkomst hangt alleen van de soort en het aantal af, dus die hoeft maar
 * één keer uitgerekend te worden. In het beheervoorbeeld staan dertig sommen
 * tegelijk op het scherm; zonder dit geheugen wordt dat rekenwerk negentig keer
 * opnieuw gedaan.
 */
const PLEKKEN = new Map<string, { punten: Punt[]; straal: number }>();

function plekken(sleutel: string, maakVorm: () => Vorm, aantal: number, maxStraal: number) {
  const volledig = `${sleutel}:${aantal}`;
  const bekend = PLEKKEN.get(volledig);
  if (bekend) return bekend;
  const uitkomst = roosterIn(maakVorm(), aantal, maxStraal);
  PLEKKEN.set(volledig, uitkomst);
  return uitkomst;
}

// ---------------------------------------------------------------------------
// Glans: dezelfde opbouw als de kralen en de bus
// ---------------------------------------------------------------------------

/** Een kleur donkerder maken, voor de rand aan de schaduwkant. */
function donkerder(kleur: string, factor: number): string {
  const n = parseInt(kleur.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Een bolletje met glans.
 *
 * Drie lagen: een zacht schaduwtje eronder, de bol zelf met een verloop van
 * lichtplek naar donkere onderkant, en een wit hoogtepunt linksboven. Dat is
 * precies de opbouw van de kralen op het rekenrek, zodat de figuren bij de rest
 * van de leeromgeving passen.
 */
function bolverloop(id: string, kleur: string) {
  return (
    <radialGradient id={id} cx="34%" cy="28%" r="80%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
      <stop offset="45%" stopColor={kleur} />
      <stop offset="100%" stopColor={donkerder(kleur, 0.7)} />
    </radialGradient>
  );
}

function Bolletje({
  x,
  y,
  r,
  verloop,
  rand,
  opgelicht,
}: {
  x: number;
  y: number;
  r: number;
  verloop: string;
  rand: string;
  opgelicht: boolean;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y + r * 0.95} rx={r * 0.82} ry={r * 0.28} fill={KLEUR.inkt} opacity={0.14} />
      <circle cx={x} cy={y} r={r} fill={`url(#${verloop})`} stroke={rand} strokeWidth={Math.max(0.6, r * 0.11)} />
      <ellipse
        cx={x - r * 0.3}
        cy={y - r * 0.36}
        rx={r * 0.3}
        ry={r * 0.2}
        fill="#ffffff"
        opacity={0.75}
        transform={`rotate(-28 ${x - r * 0.3} ${y - r * 0.36})`}
      />
      {opgelicht && <Telring x={x} y={y} r={r * 1.45} />}
    </g>
  );
}

/** Een onderdeel dat al geteld is, krijgt een gouden ring. */
function Telring({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#ffffff" strokeWidth={3.2} opacity={0.8} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={KLEUR.geel} strokeWidth={2.2} />
    </g>
  );
}

/** De zachte schaduw waar het figuur op staat. */
function Grondschaduw({ cy = 93, rx = 30 }: { cy?: number; rx?: number }) {
  return <ellipse cx={50} cy={cy} rx={rx} ry={4.5} fill={KLEUR.inkt} opacity={0.13} />;
}

/** Tekent de onderdelen. `opgelicht` is er tot en met dit onderdeel geteld. */
export type Tekening = (aantal: number, opgelicht: number, id: string) => React.ReactNode;

// ---------------------------------------------------------------------------
// De figuren
// ---------------------------------------------------------------------------

/**
 * De bloem: blaadjes op een ring om het hart.
 *
 * Hier past geen rooster — blaadjes horen rondom. De ring wordt zo ruim
 * genomen als in het vak past, en het blaadje zo groot als er tussen twee buren
 * overblijft: de afstand tussen twee naburige middelpunten is `2·R·sin(π/n)`, en
 * daar gaat een vaste tussenruimte af. Bij veel blaadjes worden ze dus vanzelf
 * smaller, maar ze raken elkaar nooit.
 */
function bloem(aantal: number, opgelicht: number, id: string) {
  const n = Math.max(1, aantal);
  const sin = n === 1 ? 1 : sinus(Math.PI / n);
  const TUSSEN = 2.6;
  const VERHOUDING = 1.3;

  /* Grootst mogelijke ring die met blaadje en al binnen het vak blijft. */
  const ringMax = 42 / (1 + VERHOUDING * sin);
  let rx = Math.min(13, ringMax * sin - TUSSEN / 2);
  rx = rond(Math.max(2.6, rx));
  const ry = rond(rx * VERHOUDING);
  /* Bij die blaadjesmaat hoort deze ring: krap genoeg om compact te blijven. */
  const ring = rond(Math.min(ringMax, n === 1 ? 0 : (rx + TUSSEN / 2) / sin));
  /*
    Het hart groeit mee met de ring. Blijft het hart klein terwijl de ring wijd
    wordt, dan lijkt de bloem bij veel blaadjes op een krans met een gat erin.
    Eén ring blijven het wél: rondom tellen gaat in één rondje, en dat is voor
    groep 3 een stuk makkelijker dan twee rijen blaadjes uit elkaar houden.
  */
  const hart = rond(Math.max(6, Math.min(15, ring * 0.42 + 2.5)));

  const blaadjes = Array.from({ length: n }, (_, i) => {
    const hoek = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      i,
      x: rond(50 + cosinus(hoek) * ring),
      y: rond(46 + sinus(hoek) * ring),
      graden: rond((hoek * 180) / Math.PI + 90),
    };
  });

  return (
    <g>
      <defs>
        {bolverloop(`${id}-blad`, KLEUR.roze)}
        {bolverloop(`${id}-hart`, KLEUR.geel)}
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={KLEUR.groenDonker} />
          <stop offset="45%" stopColor={KLEUR.groenBlad} />
          <stop offset="100%" stopColor={KLEUR.groenDonker} />
        </linearGradient>
      </defs>

      <Grondschaduw cy={95} rx={16} />

      {/* Steel met een blad, zodat de bloem ergens op staat. */}
      <path d="M50 58C50 70 47 80 49 94" stroke={`url(#${id}-steel)`} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path
        d="M49 78C40 76 34 70 33 64C41 62 48 68 49 78Z"
        fill={KLEUR.groenBlad}
        stroke={KLEUR.groenDonker}
        strokeWidth={1.4}
      />

      {blaadjes.map(({ i, x, y, graden }) => (
        <g key={i} transform={`rotate(${graden} ${x} ${y})`}>
          <ellipse cx={x} cy={y + ry * 0.12} rx={rx} ry={ry} fill={KLEUR.inkt} opacity={0.12} />
          <ellipse
            cx={x}
            cy={y}
            rx={rx}
            ry={ry}
            fill={`url(#${id}-blad)`}
            stroke={KLEUR.rozeDonker}
            strokeWidth={Math.max(0.7, rx * 0.13)}
          />
          <ellipse cx={x - rx * 0.25} cy={y - ry * 0.35} rx={rx * 0.3} ry={ry * 0.22} fill="#ffffff" opacity={0.7} />
        </g>
      ))}

      {/* De ring pas ná de blaadjes, anders valt hij onder de buurman. */}
      {blaadjes.map(({ i, x, y }) => (i < opgelicht ? <Telring key={i} x={x} y={y} r={Math.max(rx, ry) * 1.25} /> : null))}

      <circle cx={50} cy={46} r={hart} fill={`url(#${id}-hart)`} stroke={KLEUR.oranje} strokeWidth={1.8} />
      <ellipse cx={50 - hart * 0.3} cy={46 - hart * 0.32} rx={hart * 0.28} ry={hart * 0.2} fill="#ffffff" opacity={0.6} />
    </g>
  );
}

/** De kruin waarbinnen de appels moeten vallen. */
const BOOMKRUIN = () => inSchijf(50, 40, 30);

function boom(aantal: number, opgelicht: number, id: string) {
  const { punten, straal } = plekken("boom", BOOMKRUIN, Math.max(1, aantal), 8);

  return (
    <g>
      <defs>
        {bolverloop(`${id}-appel`, KLEUR.rood)}
        <radialGradient id={`${id}-kruin`} cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#7fd3a3" />
          <stop offset="50%" stopColor={KLEUR.groen} />
          <stop offset="100%" stopColor={KLEUR.groenDonker} />
        </radialGradient>
        <linearGradient id={`${id}-stam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={KLEUR.bruinDonker} />
          <stop offset="40%" stopColor={KLEUR.bruin} />
          <stop offset="100%" stopColor={KLEUR.bruinDonker} />
        </linearGradient>
      </defs>

      <Grondschaduw cy={94} rx={22} />

      {/* Stam met een vertakking, iets breder naar onderen. */}
      <path d="M45.5 54L44 92H56L54.5 54Z" fill={`url(#${id}-stam)`} />
      <path d="M50 66L58 58" stroke={KLEUR.bruinDonker} strokeWidth={3} strokeLinecap="round" fill="none" />

      {/* De kruin: drie bollen die samen één volle vorm maken. */}
      <g>
        <circle cx={32} cy={50} r={20} fill={`url(#${id}-kruin)`} />
        <circle cx={68} cy={50} r={20} fill={`url(#${id}-kruin)`} />
        <circle cx={50} cy={39} r={32} fill={`url(#${id}-kruin)`} />
        <path
          d="M30 22C36 16 46 14 54 17"
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          opacity={0.28}
        />
      </g>

      {punten.map((p, i) => (
        <Bolletje
          key={i}
          x={p.x}
          y={p.y}
          r={straal}
          verloop={`${id}-appel`}
          rand={KLEUR.roodDonker}
          opgelicht={i < opgelicht}
        />
      ))}
    </g>
  );
}

/** De tros waarbinnen de ballonnen zweven; het touwtje komt samen onderaan. */
const BALLONTROS = () => inEllips(50, 36, 40, 28);
const KNOOP = { x: 50, y: 90 };

function ballon(aantal: number, opgelicht: number, id: string) {
  const n = Math.max(1, aantal);
  const { punten, straal } = plekken("ballon", BALLONTROS, n, 10);
  const kleuren = [KLEUR.lucht, KLEUR.viool, KLEUR.roze, KLEUR.geel];

  return (
    <g>
      <defs>
        {kleuren.map((k, i) => (
          <g key={k}>{bolverloop(`${id}-ballon-${i}`, k)}</g>
        ))}
      </defs>

      <Grondschaduw cy={96} rx={12} />

      {/* Eerst alle touwtjes, dan pas de ballonnen: touw hoort erachter. */}
      {punten.map((p, i) => (
        <path
          key={`touw-${i}`}
          d={`M${p.x} ${p.y + straal * 1.15}Q${(p.x + KNOOP.x) / 2 + (p.x < KNOOP.x ? -4 : 4)} ${
            (p.y + KNOOP.y) / 2
          } ${KNOOP.x} ${KNOOP.y}`}
          stroke={KLEUR.inkt}
          strokeWidth={0.9}
          fill="none"
          opacity={0.4}
        />
      ))}

      {punten.map((p, i) => {
        const kleur = kleuren[i % kleuren.length];
        return (
          <g key={i}>
            <ellipse
              cx={p.x}
              cy={p.y}
              rx={straal * 0.88}
              ry={straal}
              fill={`url(#${id}-ballon-${i % kleuren.length})`}
              stroke={donkerder(kleur, 0.7)}
              strokeWidth={Math.max(0.6, straal * 0.1)}
            />
            {/* Het knoopje onderaan de ballon. */}
            <path
              d={`M${p.x - straal * 0.2} ${p.y + straal}L${p.x + straal * 0.2} ${p.y + straal}L${p.x} ${
                p.y + straal * 1.24
              }Z`}
              fill={donkerder(kleur, 0.75)}
            />
            <ellipse
              cx={p.x - straal * 0.28}
              cy={p.y - straal * 0.36}
              rx={straal * 0.24}
              ry={straal * 0.18}
              fill="#ffffff"
              opacity={0.75}
              transform={`rotate(-25 ${p.x - straal * 0.28} ${p.y - straal * 0.36})`}
            />
            {i < opgelicht && <Telring x={p.x} y={p.y} r={straal * 1.42} />}
          </g>
        );
      })}

      <circle cx={KNOOP.x} cy={KNOOP.y} r={3.2} fill={KLEUR.bruinDonker} />
    </g>
  );
}

/**
 * De slinger: sterren aan een koord.
 *
 * Eén koord wordt bij veel sterren te vol, dus komen er koorden bij zodra de
 * sterren anders te dicht op elkaar zouden hangen. Per koord staan de sterren op
 * gelijke afstand; die afstand bepaalt meteen hoe groot ze mogen zijn.
 */
function slinger(aantal: number, opgelicht: number, id: string) {
  const n = Math.max(1, aantal);
  const koorden = n <= 6 ? 1 : n <= 12 ? 2 : 3;
  const perKoord = Math.ceil(n / koorden);

  const breedte = 88;
  const tussen = breedte / (perKoord + 1);
  const straal = rond(Math.max(2.4, Math.min(9, tussen * 0.42)));

  /*
    De koorden samen midden in het vak, niet vanaf de bovenkant opgestapeld.
    Eén koord hoort op ooghoogte te hangen en niet met een leeg onderveld.
  */
  const vak = 30;
  const eersteTop = rond((VLAK - (koorden - 1) * vak) / 2 - 12);
  const sterren: { x: number; y: number; top: number; i: number }[] = [];

  for (let k = 0, geteld = 0; k < koorden; k++) {
    const opDitKoord = Math.min(perKoord, n - geteld);
    const koordTop = eersteTop + k * vak;
    for (let m = 0; m < opDitKoord; m++) {
      const deel = (m + 1) / (opDitKoord + 1);
      const x = rond(6 + deel * breedte);
      /* Het koord hangt door; onder elk punt hangt de ster aan een draadje. */
      const koordY = rond(koordTop + sinus(deel * Math.PI) * 9);
      sterren.push({ x, y: koordY + straal + 6, top: koordY, i: geteld + m });
    }
    geteld += opDitKoord;
  }

  const punt = (cx: number, cy: number, r: number) =>
    Array.from({ length: 5 }, (_, k) => {
      const h = (k / 5) * Math.PI * 2 - Math.PI / 2;
      const h2 = h + Math.PI / 5;
      return `${rond(cx + cosinus(h) * r)},${rond(cy + sinus(h) * r)} ${rond(
        cx + cosinus(h2) * r * 0.45,
      )},${rond(cy + sinus(h2) * r * 0.45)}`;
    }).join(" ");

  return (
    <g>
      <defs>
        {bolverloop(`${id}-ster`, KLEUR.geel)}
        <linearGradient id={`${id}-koord`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={KLEUR.bruinDonker} />
          <stop offset="50%" stopColor={KLEUR.bruin} />
          <stop offset="100%" stopColor={KLEUR.bruinDonker} />
        </linearGradient>
      </defs>

      {Array.from({ length: koorden }, (_, k) => {
        const top = eersteTop + k * vak;
        return (
          <path
            key={k}
            d={`M2 ${top}Q50 ${top + 18} 98 ${top}`}
            stroke={`url(#${id}-koord)`}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}

      {sterren.map(({ x, y, top, i }) => (
        <g key={i}>
          <line x1={x} y1={top} x2={x} y2={y - straal * 0.8} stroke={KLEUR.bruinDonker} strokeWidth={1} opacity={0.7} />
          <polygon points={punt(x, y + straal * 0.12, straal)} fill={KLEUR.inkt} opacity={0.13} />
          <polygon
            points={punt(x, y, straal)}
            fill={`url(#${id}-ster)`}
            stroke={KLEUR.oranje}
            strokeWidth={Math.max(0.6, straal * 0.14)}
            strokeLinejoin="round"
          />
          <ellipse
            cx={x - straal * 0.22}
            cy={y - straal * 0.3}
            rx={straal * 0.2}
            ry={straal * 0.14}
            fill="#ffffff"
            opacity={0.7}
          />
          {i < opgelicht && <Telring x={x} y={y} r={straal * 1.35} />}
        </g>
      ))}
    </g>
  );
}

/**
 * Het lieveheersbeestje: stippen op het schild.
 *
 * Het schild is een ellips, maar niet helemaal: de naad in het midden en de kop
 * horen er niet bij. Die twee worden er met `zonder` uitgehaald, zodat een stip
 * nooit half op de naad of op de kop belandt.
 */
const SCHILD = () =>
  zonder(
    inEllips(50, 58, 32, 27),
    (x, y, m) => Math.abs(x - 50) < 3 + m || lengte(x - 50, y - 26) < 15 + m,
  );

function lieveheersbeestje(aantal: number, opgelicht: number, id: string) {
  const { punten, straal } = plekken("lieveheersbeestje", SCHILD, Math.max(1, aantal), 6.5);

  return (
    <g>
      <defs>
        {bolverloop(`${id}-stip`, "#3a3350")}
        <radialGradient id={`${id}-schild`} cx="34%" cy="24%" r="82%">
          <stop offset="0%" stopColor="#ff8a7e" />
          <stop offset="48%" stopColor={KLEUR.rood} />
          <stop offset="100%" stopColor={KLEUR.roodDonker} />
        </radialGradient>
        <radialGradient id={`${id}-kop`} cx="36%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#6b6280" />
          <stop offset="55%" stopColor={KLEUR.inkt} />
          <stop offset="100%" stopColor="#1a1530" />
        </radialGradient>
      </defs>

      <Grondschaduw cy={90} rx={28} />

      {/* Voelsprieten achter de kop. */}
      <path d="M43 16C40 10 36 8 33 8" stroke={KLEUR.inkt} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <path d="M57 16C60 10 64 8 67 8" stroke={KLEUR.inkt} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <circle cx={33} cy={8} r={2.4} fill={KLEUR.inkt} />
      <circle cx={67} cy={8} r={2.4} fill={KLEUR.inkt} />

      <ellipse cx={50} cy={58} rx={32} ry={27} fill={`url(#${id}-schild)`} stroke={KLEUR.roodDonker} strokeWidth={1.6} />
      <circle cx={50} cy={26} r={15} fill={`url(#${id}-kop)`} />
      <ellipse cx={45} cy={21} rx={4} ry={3} fill="#ffffff" opacity={0.35} />

      {/* De naad; de stippen blijven er dankzij `SCHILD` vanzelf vanaf. */}
      <line x1={50} y1={33} x2={50} y2={85} stroke={KLEUR.roodDonker} strokeWidth={2.4} strokeLinecap="round" />

      {/* Een glanzende veeg over het schild. */}
      <path
        d="M30 42C36 33 48 30 58 33"
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
      />

      {punten.map((p, i) => (
        <Bolletje
          key={i}
          x={p.x}
          y={p.y}
          r={straal}
          verloop={`${id}-stip`}
          rand="#15112a"
          opgelicht={i < opgelicht}
        />
      ))}
    </g>
  );
}

export const TEKENINGEN: Record<string, Tekening> = {
  bloem,
  boom,
  ballon,
  slinger,
  lieveheersbeestje,
};

/** De tekening, met terugval zodat een onbekende naam nooit een leeg vak geeft. */
function tekening(naam: string): Tekening {
  return TEKENINGEN[naam] ?? TEKENINGEN.bloem;
}

/**
 * Eén telfiguur in een vierkant vlak.
 *
 * `opgelicht` is hoeveel onderdelen er al geteld zijn; die krijgen een gouden
 * ring. Daarmee kan de uitleg-animatie er één voor één doorheen lopen.
 */
export function Telfiguur({
  soort,
  aantal,
  opgelicht = 0,
  className = "",
}: {
  soort: string;
  aantal: number;
  opgelicht?: number;
  className?: string;
}) {
  const woorden = telsoortWoorden(soort);
  const teken = tekening(soort);
  /*
    Verloop-namen gelden voor de hele pagina. In het beheervoorbeeld staan
    dertig sommen onder elkaar, dus krijgt elk figuur zijn eigen naam; anders
    zou het ene figuur het verloop van het andere gebruiken.
  */
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox={`0 0 ${VLAK} ${VLAK}`}
      className={className}
      role="img"
      aria-label={`Een ${woorden.geheel} met ${aantal} ${aantal === 1 ? woorden.enkel : woorden.meervoud}`}
    >
      <defs>
        <linearGradient id={`${id}-vlak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffaf1" />
          <stop offset="100%" stopColor="#f6e9d4" />
        </linearGradient>
      </defs>
      <rect x={1} y={1} width={VLAK - 2} height={VLAK - 2} rx={16} fill={`url(#${id}-vlak)`} />
      {teken(Math.max(0, aantal), opgelicht, id)}
    </svg>
  );
}

/** De hele rij figuren van één vraag. */
export function Telrij({
  figuur,
  opgelichtPerFiguur = [],
  className = "",
}: {
  figuur: Extract<Figuur, { soort: "telrij" }>;
  /** Per figuur hoeveel onderdelen er al geteld zijn. */
  opgelichtPerFiguur?: number[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-start justify-center gap-3 ${className}`}>
      {figuur.items.map((item, i) => (
        <Telfiguur
          key={i}
          soort={item.soort}
          aantal={item.aantal}
          opgelicht={opgelichtPerFiguur[i] ?? 0}
          className="h-24 w-24 drop-shadow-sm sm:h-28 sm:w-28"
        />
      ))}
    </div>
  );
}
