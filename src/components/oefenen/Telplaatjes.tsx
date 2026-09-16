/**
 * De telplaatjes: vrolijke stickers om te tellen.
 *
 * ---------------------------------------------------------------------------
 * Waarom getekend en niet geüpload
 * ---------------------------------------------------------------------------
 * Als vorm in plaats van als plaatjesbestand, zodat ze op elk scherm scherp
 * blijven — van een telefoon tot een groot scherm — en er niets geüpload hoeft
 * te worden. Een eendje van veertig pixels breed wordt hier gewoon een eendje
 * van veertig pixels breed, zonder korrel.
 *
 * ---------------------------------------------------------------------------
 * De stijl
 * ---------------------------------------------------------------------------
 * Als de stickers die kinderen op school krijgen: heldere kleuren, ronde
 * vormen, een dikke donkere rand eromheen, een lichte glans linksboven en een
 * zachte schaduw eronder.
 *
 * En vooral: simpel. Een kind moet ze kúnnen tellen, niet gaan bestuderen. Elk
 * plaatje is daarom in één oogopslag te herkennen aan zijn silhouet, met zo
 * min mogelijk lijnen erin. Hoe meer detail, hoe langer de blik blijft hangen
 * — en dan raakt het tellen de draad kwijt.
 *
 * ---------------------------------------------------------------------------
 * Eentje erbij
 * ---------------------------------------------------------------------------
 * Twee plekken, allebei op dezelfde naam: de tekening hieronder in
 * `TELPLAATJES`, en de naam in `lib/telplaatjes.ts` voor de keuzelijst in het
 * beheer. Die lijst staat daar en niet hier, omdat de generator op de server
 * draait en een export uit een clientbestand daar niet als echte lijst
 * aankomt.
 */

import { useId, type ReactNode } from "react";

/** De donkere omtrek. Eén kleur voor alle plaatjes, dat maakt ze familie. */
const RAND = "#3d3226";
const RANDDIKTE = 4.5;

/** De zachte schaduw onder elk plaatje. */
function Schaduw({ cy = 90, rx = 26, ry = 6 }: { cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={50} cy={cy} rx={rx} ry={ry} fill="#3d3226" opacity={0.16} />;
}

/**
 * De glans linksboven.
 *
 * Een schuin wit ovaaltje, zoals het licht op iets bols valt. Laag in dekking,
 * anders lijkt het een gat in plaats van een hoogsel.
 */
function Glans({
  cx,
  cy,
  rx,
  ry,
  hoek = -25,
  dekking = 0.5,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  hoek?: number;
  dekking?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#ffffff"
      opacity={dekking}
      transform={`rotate(${hoek} ${cx} ${cy})`}
    />
  );
}

// ---------------------------------------------------------------------------
// De plaatjes
// ---------------------------------------------------------------------------

/**
 * Eendje.
 *
 * Eén bol lijf, één bol kopje, een snavel en een oog. Meer niet: pootjes en
 * veren maken het silhouet onrustig en dan valt er minder goed te tellen.
 */
function Eend() {
  return (
    <g>
      <Schaduw />
      {/* lijf */}
      <path
        d="M20 62 C20 44 34 34 50 34 C68 34 82 44 82 60 C82 74 68 82 50 82 C32 82 20 74 20 62 Z"
        fill="#f9c22b"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* staartje */}
      <path
        d="M20 58 C12 52 10 46 12 42 C18 44 22 50 24 56 Z"
        fill="#f9c22b"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* kopje */}
      <circle cx={66} cy={34} r={19} fill="#fbd04b" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* snavel */}
      <path
        d="M82 34 C92 32 96 36 95 40 C93 44 86 44 82 41 Z"
        fill="#f4863a"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* oog */}
      <circle cx={68} cy={30} r={3.6} fill={RAND} />
      <circle cx={69.2} cy={28.8} r={1.2} fill="#ffffff" />
      {/* glans */}
      <Glans cx={38} cy={50} rx={11} ry={6} />
      <Glans cx={59} cy={26} rx={6} ry={3.5} dekking={0.55} />
    </g>
  );
}

/**
 * Bal.
 *
 * Een stuiterbal met één brede band eroverheen. Die band geeft hem meteen zijn
 * vorm en laat zien dát hij rond is, zonder dat er allerlei vlakken bij hoeven.
 */
function Bal({ id }: { id: string }) {
  /*
    De band wordt binnen de bal afgeknipt, zodat hij netjes tegen de rand aan
    stopt en er niet overheen loopt. Het knipmasker krijgt een eigen naam per
    plaatje: staan er twintig ballen op het scherm, dan zouden twintig maskers
    met dezelfde naam elkaar in de weg zitten.
  */
  const knip = `${id}-bal-knip`;
  return (
    <g>
      <Schaduw cy={91} rx={25} />
      <circle cx={50} cy={52} r={33} fill="#e8493f" stroke={RAND} strokeWidth={RANDDIKTE} />
      <clipPath id={knip}>
        <circle cx={50} cy={52} r={33} />
      </clipPath>
      <g clipPath={`url(#${knip})`}>
        <path
          d="M17 44 C33 36 67 36 83 44 L83 60 C67 52 33 52 17 60 Z"
          fill="#fdf4e6"
          stroke={RAND}
          strokeWidth={3.4}
          strokeLinejoin="round"
        />
      </g>
      <Glans cx={37} cy={38} rx={10} ry={6} />
    </g>
  );
}

/**
 * Appel.
 *
 * Twee bollen die elkaar overlappen geven de appelvorm met het kuiltje bovenin,
 * zonder dat daar een aparte lijn voor nodig is. Steeltje en één blad erop.
 */
function Appel() {
  return (
    <g>
      <Schaduw cy={91} rx={24} />
      <path
        d="M50 34 C44 26 32 26 25 34 C17 43 17 60 24 71 C29 79 36 84 42 82 C46 81 48 79 50 79 C52 79 54 81 58 82 C64 84 71 79 76 71 C83 60 83 43 75 34 C68 26 56 26 50 34 Z"
        fill="#e4483c"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* steeltje */}
      <path
        d="M50 33 C50 25 50 20 49 15"
        fill="none"
        stroke="#7a5230"
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      {/* blad */}
      <path
        d="M51 21 C58 13 70 13 74 18 C70 27 58 29 51 21 Z"
        fill="#4cba7d"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <Glans cx={36} cy={46} rx={9} ry={5.5} />
    </g>
  );
}

/**
 * Schildpad.
 *
 * Eén bol schild met drie vlakjes erop, een kopje en twee pootjes. De vlakjes
 * zijn groot en rond: een echt schildpatroon zou te fijn worden om nog rustig
 * naar te kijken.
 */
function Schildpad({ id }: { id: string }) {
  const knip = `${id}-schild-knip`;
  return (
    <g>
      <Schaduw cy={88} rx={28} />
      {/* pootjes */}
      <ellipse cx={26} cy={72} rx={9} ry={7} fill="#7fd18f" stroke={RAND} strokeWidth={RANDDIKTE} />
      <ellipse cx={72} cy={72} rx={9} ry={7} fill="#7fd18f" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* kopje */}
      <circle cx={84} cy={50} r={12} fill="#7fd18f" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx={88} cy={47} r={2.6} fill={RAND} />
      {/* schild */}
      <path
        d="M14 58 C14 38 30 26 50 26 C70 26 84 38 84 58 C84 68 70 74 50 74 C30 74 14 68 14 58 Z"
        fill="#3fa85f"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <clipPath id={knip}>
        <path d="M14 58 C14 38 30 26 50 26 C70 26 84 38 84 58 C84 68 70 74 50 74 C30 74 14 68 14 58 Z" />
      </clipPath>
      <g clipPath={`url(#${knip})`}>
        <circle cx={50} cy={44} r={13} fill="#8fd9a3" stroke={RAND} strokeWidth={3.2} />
        <circle cx={27} cy={58} r={10} fill="#8fd9a3" stroke={RAND} strokeWidth={3.2} />
        <circle cx={73} cy={58} r={10} fill="#8fd9a3" stroke={RAND} strokeWidth={3.2} />
      </g>
      <Glans cx={34} cy={38} rx={9} ry={5} dekking={0.4} />
    </g>
  );
}

/**
 * Autootje.
 *
 * Eén blokje met een dakje, twee wielen en één raam. Geen deuren, geen lampen:
 * het silhouet van een auto is al genoeg om hem te herkennen.
 */
function Auto() {
  return (
    <g>
      <Schaduw cy={88} rx={30} />
      {/* dak met raam */}
      <path
        d="M30 46 L38 28 C39 25 41 24 44 24 L66 24 C69 24 71 26 72 29 L78 46 Z"
        fill="#5aa9e6"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path d="M44 42 L49 30 L62 30 L66 42 Z" fill="#dff0fb" stroke={RAND} strokeWidth={3} />
      {/* lijf */}
      <path
        d="M12 62 C12 52 16 46 24 46 L80 46 C88 46 92 52 92 60 L92 68 C92 72 89 74 85 74 L19 74 C15 74 12 71 12 66 Z"
        fill="#3f8ad8"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* wielen */}
      <circle cx={31} cy={74} r={11} fill="#3d3226" />
      <circle cx={31} cy={74} r={4.5} fill="#cfd6dd" />
      <circle cx={71} cy={74} r={11} fill="#3d3226" />
      <circle cx={71} cy={74} r={4.5} fill="#cfd6dd" />
      <Glans cx={30} cy={56} rx={10} ry={4} dekking={0.45} />
    </g>
  );
}

/** Ster. Vijf punten, dikke rand, glans. Zo eenvoudig als het maar kan. */
function Ster() {
  return (
    <g>
      <Schaduw cy={90} rx={24} />
      <path
        d="M50 14 L62 40 L90 44 L70 64 L75 92 L50 78 L25 92 L30 64 L10 44 L38 40 Z"
        fill="#f7c53f"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <Glans cx={40} cy={40} rx={8} ry={5} dekking={0.55} />
    </g>
  );
}

/** Bloem. Vijf ronde blaadjes om een hart; het steeltje blijft kort. */
function Bloem() {
  return (
    <g>
      <Schaduw cy={92} rx={20} />
      <path d="M50 58 L50 84" stroke="#3fa85f" strokeWidth={6} strokeLinecap="round" />
      <path
        d="M50 74 C40 68 32 70 30 76 C36 82 46 82 50 76 Z"
        fill="#4cba7d"
        stroke={RAND}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      {[0, 72, 144, 216, 288].map((hoek) => (
        <ellipse
          key={hoek}
          cx={50}
          cy={26}
          rx={13}
          ry={17}
          fill="#ef6f8d"
          stroke={RAND}
          strokeWidth={RANDDIKTE}
          transform={`rotate(${hoek} 50 45)`}
        />
      ))}
      <circle cx={50} cy={45} r={10} fill="#f7c53f" stroke={RAND} strokeWidth={RANDDIKTE} />
      <Glans cx={45} cy={41} rx={3.5} ry={2.5} dekking={0.6} />
    </g>
  );
}

/** Visje. Eén druppelvorm met een staart, een oog en één vin. */
function Vis() {
  return (
    <g>
      <Schaduw cy={88} rx={26} />
      {/* staart */}
      <path
        d="M18 50 L4 34 C2 32 2 30 5 30 C14 32 20 40 24 46 Z M18 50 L4 66 C2 68 2 70 5 70 C14 68 20 60 24 54 Z"
        fill="#f4863a"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* lijf */}
      <path
        d="M20 50 C20 34 38 24 58 24 C78 24 92 36 92 50 C92 64 78 76 58 76 C38 76 20 66 20 50 Z"
        fill="#f79a4e"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* vin */}
      <path
        d="M52 30 C58 18 68 16 72 20 C68 26 60 30 52 32 Z"
        fill="#f4863a"
        stroke={RAND}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <circle cx={76} cy={44} r={4.2} fill={RAND} />
      <circle cx={77.4} cy={42.6} r={1.4} fill="#ffffff" />
      <Glans cx={45} cy={40} rx={11} ry={5} dekking={0.4} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Het register
// ---------------------------------------------------------------------------

export const TELPLAATJES: Record<string, (id: string) => ReactNode> = {
  eend: () => <Eend />,
  bal: (id) => <Bal id={id} />,
  appel: () => <Appel />,
  schildpad: (id) => <Schildpad id={id} />,
  auto: () => <Auto />,
  ster: () => <Ster />,
  bloem: () => <Bloem />,
  vis: () => <Vis />,
};

/**
 * Eén getekend telplaatje.
 *
 * Vult het vierkant waar het in staat; de maat wordt bepaald door het raster
 * eromheen, zodat de plaatjes meeschalen met hoeveel er staan.
 */
export function Telplaatje({ naam, className = "" }: { naam: string; className?: string }) {
  /* Een eigen naam per plaatje, voor het knipmasker van de bal. */
  const id = useId().replace(/:/g, "");
  const teken = TELPLAATJES[naam];
  if (!teken) return null;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-full w-full ${className}`}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {teken(id)}
    </svg>
  );
}
