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


/**
 * Muisje.
 *
 * Twee grote ronde oren, een bol lijfje en een krulstaartje: aan dat silhouet
 * is hij meteen te herkennen, ook als hij klein staat.
 */
function Muis() {
  return (
    <g>
      <Schaduw cy={88} rx={26} />
      {/* staart */}
      <path
        d="M76 74 C90 74 92 60 84 56"
        fill="none"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinecap="round"
      />
      {/* oren */}
      <circle cx={30} cy={34} r={14} fill="#c9c2d8" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx={30} cy={34} r={6.5} fill="#f4b8c8" />
      <circle cx={62} cy={30} r={12} fill="#c9c2d8" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx={62} cy={30} r={5.5} fill="#f4b8c8" />
      {/* lijf */}
      <path
        d="M22 60 C22 42 38 34 54 36 C74 38 84 52 84 64 C84 74 72 80 54 80 C34 80 22 72 22 60 Z"
        fill="#b8b0cc"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <circle cx={68} cy={56} r={4} fill={RAND} />
      <circle cx={69.2} cy={54.8} r={1.3} fill="#ffffff" />
      <circle cx={82} cy={62} r={4} fill="#f4b8c8" stroke={RAND} strokeWidth={3} />
      <Glans cx={42} cy={50} rx={10} ry={5} dekking={0.4} />
    </g>
  );
}

/**
 * Vogeltje.
 *
 * Een bol lijfje met een vleugel, een puntige snavel en een staartje. Geen
 * pootjes: die worden op klein formaat toch een vlekje.
 */
function Vogel() {
  return (
    <g>
      <Schaduw cy={88} rx={25} />
      {/* staart */}
      <path
        d="M24 48 L2 32 L6 60 Z"
        fill="#3f92d2"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* lijf */}
      <ellipse cx={54} cy={52} rx={31} ry={27} fill="#5aa9e6" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* buik */}
      <path
        d="M40 62 C48 74 68 74 78 62 C74 74 62 80 54 79 C46 78 42 70 40 62 Z"
        fill="#bfe0f7"
      />
      {/* vleugel */}
      <path
        d="M44 54 C52 48 64 50 68 57 C62 65 50 65 44 60 Z"
        fill="#3f92d2"
        stroke={RAND}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      {/* snavel */}
      <path
        d="M82 40 L99 47 L82 54 Z"
        fill="#f7a93b"
        stroke={RAND}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <circle cx={70} cy={36} r={5.5} fill={RAND} />
      <circle cx={71.8} cy={34.2} r={1.9} fill="#ffffff" />
      <Glans cx={44} cy={34} rx={10} ry={5} dekking={0.4} />
    </g>
  );
}

/** Bijtje: een geel lijfje met twee zwarte strepen en twee witte vleugeltjes. */
function Bij({ id }: { id: string }) {
  const knip = `${id}-bij-knip`;
  return (
    <g>
      <Schaduw cy={88} rx={24} />
      {/* vleugels */}
      <ellipse cx={40} cy={34} rx={14} ry={9} transform="rotate(-24 40 34)" fill="#ffffff" opacity={0.92} stroke={RAND} strokeWidth={3.4} />
      <ellipse cx={62} cy={32} rx={13} ry={8.5} transform="rotate(16 62 32)" fill="#ffffff" opacity={0.92} stroke={RAND} strokeWidth={3.4} />
      <clipPath id={knip}>
        <ellipse cx={52} cy={60} rx={30} ry={20} />
      </clipPath>
      {/* lijf */}
      <ellipse cx={52} cy={60} rx={30} ry={20} fill="#f7c948" stroke={RAND} strokeWidth={RANDDIKTE} />
      <g clipPath={`url(#${knip})`}>
        <rect x={44} y={38} width={9} height={46} fill={RAND} />
        <rect x={62} y={38} width={9} height={46} fill={RAND} />
      </g>
      <ellipse cx={52} cy={60} rx={30} ry={20} fill="none" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx={30} cy={55} r={3.8} fill={RAND} />
      <circle cx={31.2} cy={53.8} r={1.3} fill="#ffffff" />
      <Glans cx={46} cy={50} rx={9} ry={4.5} dekking={0.35} />
    </g>
  );
}

/** Vlinder: vier vleugels, een dun lijfje en twee voelsprieten. */
function Vlinder() {
  return (
    <g>
      <Schaduw cy={90} rx={22} />
      {/* voelsprieten */}
      <path d="M48 32 C44 20 38 16 34 15" fill="none" stroke={RAND} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M54 32 C58 20 64 16 68 15" fill="none" stroke={RAND} strokeWidth={3.4} strokeLinecap="round" />
      {/* vleugels */}
      <path
        d="M48 44 C36 26 14 26 12 42 C10 56 28 60 48 54 Z"
        fill="#e86fa6"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path
        d="M54 44 C66 26 88 26 90 42 C92 56 74 60 54 54 Z"
        fill="#e86fa6"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path
        d="M48 56 C38 60 22 64 24 76 C26 86 42 82 49 70 Z"
        fill="#b86ad9"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path
        d="M54 56 C64 60 80 64 78 76 C76 86 60 82 53 70 Z"
        fill="#b86ad9"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* lijfje */}
      <rect x={47} y={32} width={8} height={46} rx={4} fill={RAND} />
      <Glans cx={30} cy={40} rx={8} ry={4} dekking={0.35} />
    </g>
  );
}

/** Lieveheersbeestje: een rood bolletje met stippen en een zwart kopje. */
function Lieveheersbeestje({ id }: { id: string }) {
  const knip = `${id}-lhb-knip`;
  return (
    <g>
      <Schaduw cy={88} rx={26} />
      {/* kopje */}
      <circle cx={50} cy={30} r={13} fill={RAND} />
      <circle cx={44} cy={27} r={2.6} fill="#ffffff" />
      <circle cx={56} cy={27} r={2.6} fill="#ffffff" />
      <clipPath id={knip}>
        <ellipse cx={50} cy={58} rx={31} ry={26} />
      </clipPath>
      {/* schild */}
      <ellipse cx={50} cy={58} rx={31} ry={26} fill="#e4483c" stroke={RAND} strokeWidth={RANDDIKTE} />
      <g clipPath={`url(#${knip})`}>
        <rect x={47} y={30} width={6} height={58} fill={RAND} />
        <circle cx={32} cy={50} r={5.5} fill={RAND} />
        <circle cx={68} cy={50} r={5.5} fill={RAND} />
        <circle cx={36} cy={70} r={5} fill={RAND} />
        <circle cx={64} cy={70} r={5} fill={RAND} />
      </g>
      <ellipse cx={50} cy={58} rx={31} ry={26} fill="none" stroke={RAND} strokeWidth={RANDDIKTE} />
      <Glans cx={36} cy={44} rx={9} ry={5} />
    </g>
  );
}

/** Peer: een smalle bovenkant en een bolle onderkant, met steeltje en blad. */
function Peer() {
  return (
    <g>
      <Schaduw cy={91} rx={23} />
      <path
        d="M50 26 C44 26 40 32 41 40 C42 48 34 52 30 62 C25 74 33 84 50 84 C67 84 75 74 70 62 C66 52 58 48 59 40 C60 32 56 26 50 26 Z"
        fill="#c3d84a"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path d="M50 26 C50 19 50 15 49 11" fill="none" stroke="#7a5230" strokeWidth={5.5} strokeLinecap="round" />
      <path
        d="M51 17 C58 9 70 9 74 14 C70 23 58 25 51 17 Z"
        fill="#4cba7d"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <Glans cx={40} cy={62} rx={8} ry={6} />
    </g>
  );
}

/** Eikel: een nootje met een gestreept hoedje en een klein steeltje. */
function Eikel() {
  return (
    <g>
      <Schaduw cy={90} rx={22} />
      {/* nootje */}
      <path
        d="M26 46 C26 68 36 84 50 84 C64 84 74 68 74 46 Z"
        fill="#e0a45e"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      {/* hoedje */}
      <path
        d="M22 46 C22 34 34 26 50 26 C66 26 78 34 78 46 Z"
        fill="#9a6433"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <path d="M34 30 L30 44 M50 27 L50 44 M66 30 L70 44" stroke={RAND} strokeWidth={3} strokeLinecap="round" />
      <path d="M50 26 C50 19 50 15 49 12" fill="none" stroke="#7a5230" strokeWidth={5.5} strokeLinecap="round" />
      <Glans cx={38} cy={58} rx={7} ry={6} dekking={0.35} />
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
  muis: () => <Muis />,
  vogel: () => <Vogel />,
  bij: (id) => <Bij id={id} />,
  vlinder: () => <Vlinder />,
  lieveheersbeestje: (id) => <Lieveheersbeestje id={id} />,
  peer: () => <Peer />,
  eikel: () => <Eikel />,
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
