/**
 * Tekeningen bij een vraag.
 *
 * Getekend met code in plaats van als plaatje: daardoor blijft het scherp op
 * elk scherm, schaalt het netjes mee op tablet en telefoon, en hoeven er geen
 * duizenden afbeeldingen te worden opgeslagen.
 *
 * Elke tekening kan een INVULVAK hebben: de plek waar het antwoord hoort. Het
 * kind typt daar rechtstreeks in, in de tekening zelf. Daarvoor geeft elke
 * tekening door waar dat vak ligt (`beschrijfFiguur`), zodat er een echt
 * invoerveld precies overheen gelegd kan worden. Bij het voorbeeld in het
 * beheer wordt datzelfde vak gewoon getekend, met een vraagteken erin.
 */

import type { Figuur } from "@/lib/generatoren/soort";

/** Plek van een vak, in de maten van de tekening zelf. */
export type Vakpositie = { x: number; y: number; breedte: number; hoogte: number };

export type FiguurBeschrijving = {
  breedte: number;
  hoogte: number;
  /** Waar het antwoord hoort, of null als de tekening niets in te vullen heeft. */
  invulvak: Vakpositie | null;
};

// --- Splitsboom ------------------------------------------------------------

const BOOM = {
  breedte: 200,
  hoogte: 130,
  links: { x: 8, y: 84, breedte: 56, hoogte: 34 },
  rechts: { x: 136, y: 84, breedte: 56, hoogte: 34 },
};

/**
 * Splitsboom: het hele getal bovenin, twee vakjes eronder met pijlen.
 * Het lege vakje is het antwoord.
 */
export function Splitsboom({
  figuur,
  interactief = false,
}: {
  figuur: Extract<Figuur, { soort: "splitsboom" }>;
  /** Laat het lege vakje weg; daar komt dan een echt invoerveld overheen. */
  interactief?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${BOOM.breedte} ${BOOM.hoogte}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Splitsboom: ${figuur.geheel} splitsen in ${
        figuur.links ?? "een onbekend getal"
      } en ${figuur.rechts ?? "een onbekend getal"}`}
    >
      {/* hoofdgetal */}
      <rect x={72} y={4} width={56} height={34} rx={8} fill="#fdecdd" stroke="#e8690f" strokeWidth={2.5} />
      <text x={100} y={27} textAnchor="middle" className="fill-[#2c2545] text-[20px] font-extrabold">
        {figuur.geheel}
      </text>

      {/* pijlen naar beneden */}
      <g stroke="#e8690f" strokeWidth={2.5} strokeLinecap="round" fill="none">
        <path d="M88 40 L46 74" />
        <path d="M112 40 L154 74" />
      </g>
      <g fill="#e8690f">
        <path d="M40 78 L52 72 L47 82 Z" />
        <path d="M160 78 L148 72 L153 82 Z" />
      </g>

      {/* twee vakjes */}
      {[
        { vak: BOOM.links, waarde: figuur.links },
        { vak: BOOM.rechts, waarde: figuur.rechts },
      ].map(({ vak, waarde }) => {
        // Het lege vakje overslaan als er een invoerveld overheen komt.
        if (waarde === null && interactief) return null;

        return (
          <g key={vak.x}>
            <rect
              x={vak.x}
              y={vak.y}
              width={vak.breedte}
              height={vak.hoogte}
              rx={8}
              fill={waarde === null ? "#ffffff" : "#dcf4e8"}
              stroke={waarde === null ? "#e4832a" : "#1f9d63"}
              strokeWidth={2.5}
              strokeDasharray={waarde === null ? "5 4" : undefined}
            />
            <text
              x={vak.x + vak.breedte / 2}
              y={vak.y + 23}
              textAnchor="middle"
              className={
                waarde === null
                  ? "fill-[#e4832a] text-[20px] font-extrabold"
                  : "fill-[#2c2545] text-[20px] font-extrabold"
              }
            >
              {waarde === null ? "?" : waarde}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


// --- Kralenrij -------------------------------------------------------------

/**
 * Kleurenparen voor de kralen.
 *
 * Twee kleuren die om de vijf kralen wisselen, zodat een kind in groepjes van
 * vijf kan meetellen in plaats van kraal voor kraal. Alleen de naam staat in
 * de opgeslagen vraag; de kleuren zelf staan hier, zodat de huisstijl op één
 * plek kan veranderen zonder dat bestaande vragen aangepast hoeven te worden.
 */
export const KRALENPALETTEN: Record<string, [string, string]> = {
  "viool-oranje": ["#5b3fd6", "#e4832a"],
  "groen-lucht": ["#1f9d63", "#3577cc"],
  "roze-geel": ["#e4607f", "#f2bb2e"],
};

export const KRALENPALET_LABELS: { waarde: string; label: string }[] = [
  { waarde: "viool-oranje", label: "Paars en oranje" },
  { waarde: "groen-lucht", label: "Groen en blauw" },
  { waarde: "roze-geel", label: "Roze en geel" },
];

/** Maatvoering van het rekenrek. Op één plek, zodat alles meeschaalt. */
const KRAAL = {
  straal: 13,
  afstand: 32,
  /** Dikte van de staanders links en rechts. */
  post: 9,
  /** Dikte van de boven- en onderbalk. */
  balk: 9,
  /** Ruimte tussen de staander en de eerste kraal. */
  binnen: 10,
  rijhoogte: 52,
  /** Ruimte boven het rek voor de pijl. */
  pijlruimte: 26,
  /** Hoogstens zoveel kralen naast elkaar; wordt afgerond op hele groepjes. */
  streefPerRij: 10,
};

/** Hoeveel HELE groepjes er op één staafje passen. Nooit een half groepje. */
export function groepjesPerRij(perGroep: number): number {
  return Math.max(1, Math.floor(KRAAL.streefPerRij / Math.max(1, perGroep)));
}

function donkerder(kleur: string, factor: number): string {
  const n = parseInt(kleur.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Een rekenrek: kralen aan staafjes in een houten frame.
 *
 * De kleur wisselt per groepje, zodat een kind met sprongen kan meetellen in
 * plaats van kraal voor kraal. Elk groepje is ALTIJD compleet — een half
 * groepje zou de vijfstructuur juist onderuithalen. Daarom wordt het aantal
 * kralen hier nog een keer naar beneden afgerond op hele groepjes; ook als er
 * ooit een vraag is opgeslagen met een tussenaantal, komt er nooit een
 * afgekapt groepje in beeld.
 *
 * Elk staafje draagt hetzelfde aantal hele groepjes, dus een rij is 5, 10, 15
 * of 20 kralen breed en nooit een tussenaantal.
 *
 * Bewust geen platte cirkels: elke kraal krijgt een lichtplekje linksboven,
 * een donkerder rand rechtsonder en een schaduwtje op het staafje. Daardoor
 * lijkt het op een echt rekenrek in plaats van op stippen.
 *
 * De maten staan in `KRAAL` en de kleuren in `KRALENPALETTEN`; net als bij de
 * splitsboom is de tekening daarmee op één plek bij te stellen.
 */
export function Kralenrij({
  figuur,
  /** Tot en met welke kraal al geteld is. Gebruikt door de uitleg-animatie. */
  opgelicht = 0,
  /** Laat de pijl weg, bijvoorbeeld tijdens het uitleggen. */
  toonPijl = true,
  /** Mag het kind kralen aantikken om mee te tellen? */
  telbaar = false,
  /** Hoeveel kralen er ná `opgelicht` aangetikt mogen worden. */
  telbaarAantal = 0,
  /** Welke kralen het kind zelf al heeft aangetikt. */
  getikt = [],
  /**
   * Laat de pijl zachtjes op en neer wippen. Aan waar één rek in beeld staat;
   * uit in het beheervoorbeeld, waar tien rekken onder elkaar staan — tien
   * wippende pijlen tegelijk is onrustig in plaats van uitnodigend.
   */
  pijlBeweegt = true,
  /** Toon het wijzende handje bij de eerste kraal die aan de beurt is. */
  wijsAan = false,
  /** Verandert bij elke herhaling, zodat het handje opnieuw beweegt. */
  wijsSleutel = 0,
  onTik,
}: {
  figuur: Extract<Figuur, { soort: "kralenrij" }>;
  opgelicht?: number;
  toonPijl?: boolean;
  telbaar?: boolean;
  telbaarAantal?: number;
  pijlBeweegt?: boolean;
  getikt?: number[];
  wijsAan?: boolean;
  wijsSleutel?: number;
  onTik?: (index: number) => void;
}) {
  const [kleurA, kleurB] = KRALENPALETTEN[figuur.palet] ?? KRALENPALETTEN["viool-oranje"];
  const perGroep = Math.max(1, figuur.perGroep);

  // Nooit een half groepje tonen, wat er ook in de vraag staat opgeslagen.
  const totaal = Math.max(perGroep, Math.floor(figuur.totaal / perGroep) * perGroep);
  const perRij = groepjesPerRij(perGroep) * perGroep;
  const rijen = Math.ceil(totaal / perRij);

  const binnenBreedte = KRAAL.binnen * 2 + (perRij - 1) * KRAAL.afstand + KRAAL.straal * 2;
  const breedte = KRAAL.post * 2 + binnenBreedte;
  const rekTop = KRAAL.pijlruimte;
  const rekHoogte = KRAAL.balk * 2 + rijen * KRAAL.rijhoogte;
  const hoogte = rekTop + rekHoogte;

  const plek = (index: number) => {
    const rij = Math.floor(index / perRij);
    const kolom = index % perRij;
    return {
      x: KRAAL.post + KRAAL.binnen + KRAAL.straal + kolom * KRAAL.afstand,
      y: rekTop + KRAAL.balk + rij * KRAAL.rijhoogte + KRAAL.rijhoogte / 2,
    };
  };

  const kralen = Array.from({ length: totaal }, (_, i) => i);
  const groepjes = totaal / perGroep;

  return (
    <svg
      viewBox={`0 0 ${breedte} ${hoogte}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Een rekenrek met ${totaal} kralen: ${groepjes} groepjes van ${perGroep}, om en om van kleur. De pijl wijst naar kraal nummer ${figuur.pijlOp}, geteld vanaf het begin.`}
    >
      <defs>
        {[kleurA, kleurB].map((kleur, i) => (
          <radialGradient key={kleur} id={`kraal-${i}-${figuur.palet}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor={kleur} />
            <stop offset="100%" stopColor={donkerder(kleur, 0.72)} />
          </radialGradient>
        ))}
      </defs>

      {/*
        Het frame van het rek: een lichte binnenkant met daaromheen een
        bovenbalk, een onderbalk en twee staanders. Daardoor lijkt het op een
        echt schoolrekenrek en zweven de kralen niet los in de ruimte.
      */}
      <g>
        <rect
          x={2}
          y={rekTop + 2}
          width={breedte - 4}
          height={rekHoogte - 4}
          rx={9}
          fill="#fdf6ea"
        />

        {/* bovenbalk */}
        <rect x={0} y={rekTop} width={breedte} height={KRAAL.balk + 3} rx={5} fill="#d29a55" />
        <rect x={0} y={rekTop} width={breedte} height={4} rx={2} fill="#e5b57c" />

        {/* onderbalk */}
        <rect
          x={0}
          y={rekTop + rekHoogte - KRAAL.balk - 3}
          width={breedte}
          height={KRAAL.balk + 3}
          rx={5}
          fill="#c08a4a"
        />

        {/* staanders links en rechts */}
        <rect x={0} y={rekTop} width={KRAAL.post} height={rekHoogte} rx={4} fill="#d29a55" />
        <rect
          x={breedte - KRAAL.post}
          y={rekTop}
          width={KRAAL.post}
          height={rekHoogte}
          rx={4}
          fill="#c08a4a"
        />

        <rect
          x={2}
          y={rekTop + 2}
          width={breedte - 4}
          height={rekHoogte - 4}
          rx={9}
          fill="none"
          stroke="#a8763b"
          strokeWidth={1.6}
        />
      </g>

      {/* Staafjes: één per rij, van staander tot staander. */}
      {Array.from({ length: rijen }, (_, rij) => {
        const y = rekTop + KRAAL.balk + rij * KRAAL.rijhoogte + KRAAL.rijhoogte / 2;
        return (
          <line
            key={rij}
            x1={KRAAL.post}
            y1={y}
            x2={breedte - KRAAL.post}
            y2={y}
            stroke="#b3aa9c"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        );
      })}

      {kralen.map((i) => {
        const { x, y } = plek(i);
        const groep = Math.floor(i / perGroep);
        const kleurIndex = groep % 2;
        const kleur = kleurIndex === 0 ? kleurA : kleurB;
        const zelfGetikt = getikt.includes(i);
        const geteld = i < opgelicht || zelfGetikt;
        const magTikken = telbaar && i >= opgelicht && i < opgelicht + telbaarAantal && !zelfGetikt;

        /*
          Drie soorten beweging, en nooit twee tegelijk op dezelfde kraal:
            - net zelf aangetikt  -> één keer opveren;
            - hoort bij het groepje dat zojuist is opgelicht -> even pulseren;
            - staat klaar om aangetikt te worden -> het rustige klaar-ritme.
        */
        const netOpgelicht =
          opgelicht > 0 && i >= opgelicht - perGroep && i < opgelicht;
        const beweging = zelfGetikt
          ? "animate-kraal-stuiter"
          : netOpgelicht
            ? "animate-kraal-pulse"
            : magTikken
              ? "animate-blok-klaar"
              : undefined;

        return (
          <g
            key={i}
            onClick={magTikken ? () => onTik?.(i) : undefined}
            className={[beweging, magTikken ? "cursor-pointer" : ""]
              .filter(Boolean)
              .join(" ")}
            style={
              beweging
                ? { transformBox: "fill-box", transformOrigin: "center" }
                : undefined
            }
          >
            {/* Schaduwtje, zodat de kraal op het staafje lijkt te rusten. */}
            <ellipse
              cx={x}
              cy={y + KRAAL.straal + 3}
              rx={KRAAL.straal * 0.72}
              ry={2.6}
              fill="#2c2545"
              opacity={0.15}
            />

            <circle
              cx={x}
              cy={y}
              r={KRAAL.straal}
              fill={`url(#kraal-${kleurIndex}-${figuur.palet})`}
              stroke={donkerder(kleur, 0.62)}
              strokeWidth={1.4}
            />

            {/* Glansplekje linksboven, zoals bij een echte glimmende kraal. */}
            <ellipse
              cx={x - KRAAL.straal * 0.34}
              cy={y - KRAAL.straal * 0.4}
              rx={KRAAL.straal * 0.3}
              ry={KRAAL.straal * 0.21}
              fill="#ffffff"
              opacity={0.75}
              transform={`rotate(-28 ${x - KRAAL.straal * 0.34} ${y - KRAAL.straal * 0.4})`}
            />

            {/* Al meegeteld: een ring eromheen, ook zonder kleur te zien. */}
            {geteld && (
              <circle
                cx={x}
                cy={y}
                r={KRAAL.straal + 3.5}
                fill="none"
                stroke="#1f9d63"
                strokeWidth={2.6}
              />
            )}

            {/* Ruim tikvlak, ook op een tablet met dikke vingers. */}
            {magTikken && (
              <circle cx={x} cy={y} r={KRAAL.straal + 6} fill="transparent" />
            )}
          </g>
        );
      })}

      {/* Het wijzende handje bij de eerste kraal die aan de beurt is. */}
      {wijsAan && telbaar && telbaarAantal > 0 && opgelicht < totaal && (() => {
        const { x, y } = plek(opgelicht);
        return (
          <g key={wijsSleutel} transform={`translate(${x - 7} ${y + KRAAL.straal + 2})`} aria-hidden="true">
            <g className="animate-hand-wijs pointer-events-none">
              <path
                d="M7 2 C8.6 2 9.6 3.2 9.6 4.8 L9.6 10 L11.4 10 C13.2 10 14.2 11.2 14.2 12.8
                   L14.2 17 C14.2 20.4 11.8 22.6 8.6 22.6 L6.4 22.6 C3.4 22.6 1.2 20.6 1.2 17.6
                   L1.2 12.4 C1.2 11 2 10.2 3.2 10.2 C3.9 10.2 4.4 10.5 4.4 10.5 L4.4 4.8
                   C4.4 3.2 5.4 2 7 2 Z"
                fill="#f7d774"
                stroke="#2c2545"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })()}

      {/* De pijl: wijst van boven naar de kraal die de vraag bedoelt. */}
      {toonPijl && figuur.pijlOp >= 1 && figuur.pijlOp <= totaal && (() => {
        const { x, y } = plek(figuur.pijlOp - 1);
        /*
          De pijl moet ook tússen twee staafjes passen, niet alleen boven het
          rek. Hij is daarom kort gehouden: kop plus steel blijven binnen de
          ruimte die er tussen twee rijen kralen zit.
        */
        const punt = y - KRAAL.straal - 3;
        return (
          <g
            className={pijlBeweegt ? "animate-pijl-wip" : undefined}
            style={
              pijlBeweegt
                ? { transformBox: "fill-box", transformOrigin: "center" }
                : undefined
            }
          >
            <line
              x1={x}
              y1={punt - 15}
              x2={x}
              y2={punt - 7}
              stroke="#e4607f"
              strokeWidth={3.4}
              strokeLinecap="round"
            />
            <path
              d={`M${x} ${punt} L${x - 6} ${punt - 8} L${x + 6} ${punt - 8} Z`}
              fill="#e4607f"
            />
          </g>
        );
      })()}
    </svg>
  );
}

// --- Gemeenschappelijk -----------------------------------------------------

/**
 * Waar ligt het invulvak van deze tekening? Nieuwe soorten tekeningen
 * (invulschema, getallenlijn) melden zich hier ook aan.
 */
// --- Bus ------------------------------------------------------------------

/**
 * Maatvoering van de bus. Op één plek, zodat alles meeschaalt.
 *
 * Net als bij het rekenrek: verander je hier de stoelafstand, dan schuiven de
 * ramen, de carrosserie en de wielen vanzelf mee. De tekening hoeft dus nooit
 * met de hand nagerekend te worden.
 */
const BUS = {
  /** Straal van het hoofd van een poppetje. */
  hoofd: 7,
  /**
   * Hart-op-hart tussen twee zitplaatsen.
   *
   * De schouders zijn 18 breed, dus hiermee blijft er een paar pixels lucht
   * tussen twee poppetjes. Zonder die lucht lopen ze in elkaar over en is een
   * groepje niet meer te tellen.
   */
  stoel: 22,
  /** Ruimte tussen de raamrand en de buitenste zitplaats. */
  raamPad: 9,
  /** Ruimte tussen twee ramen — de stijl van de bus. */
  raamGat: 13,
  raamHoogte: 54,
  /** Dak boven de ramen. */
  dak: 19,
  /**
   * Carrosserie onder de ramen, waar de wielen aan hangen.
   *
   * Ruim genomen: met een smalle strook eronder lijkt het een tram of een
   * container. Een bus heeft een zichtbare onderkant waar de wielen in zitten.
   */
  onder: 44,
  /** De neus: voorruit en koplamp. */
  neus: 82,
  /** Stukje carrosserie achter het laatste raam. */
  achter: 18,
  wiel: 20,
  marge: 8,
  /** Ruimte bovenin voor het meegetelde getal. */
  bijschrift: 30,
};

/** Kleuren van de bus zelf. De poppetjes volgen het gekozen palet. */
const BUSKLEUR = {
  romp: "#e4832a",
  rompDonker: "#c26b18",
  rompLicht: "#f0a25c",
  dak: "#fdeada",
  raam: "#e2edfb",
  raamRand: "#bcd4f0",
  /** Een raam waarin al geteld is. */
  raamGeteld: "#fdf3d4",
  raamGeteldRand: "#f2bb2e",
  band: "#2c2545",
  velg: "#ece4d8",
  koplamp: "#f2bb2e",
};

/**
 * Een schoolbus van opzij, met kinderen in de ramen.
 *
 * Waarom een bus: het is dezelfde vijfstructuur als bij het rekenrek, maar in
 * een plaatje waar een kind iets bij kan voelen. Per raam zit een vast groepje
 * — standaard vijf — en de kleur wisselt per raam. Daardoor tel je met
 * sprongen mee (5, 10, 15) in plaats van poppetje voor poppetje.
 *
 * Het laatste raam is het restje: daar zitten er 1 tot en met 4, en de
 * overgebleven plekken blijven zichtbaar leeg als een lichte stippelcirkel. Zo
 * is te zien dát het een onvolledig groepje is, in plaats van dat het raam
 * gewoon kleiner is.
 *
 * `opgelicht` is hoeveel kinderen er al geteld zijn; die krijgen een gouden
 * ring en hun raam kleurt mee. Daarmee kan de uitleg-animatie de groepjes één
 * voor één laten oplichten.
 */
export function Bus({
  figuur,
  /** Hoeveel kinderen er al geteld zijn. Gebruikt door de uitleg-animatie. */
  opgelicht = 0,
  /** Mag het kind poppetjes aantikken om mee te tellen? */
  telbaar = false,
  /** Hoeveel poppetjes er ná `opgelicht` aangetikt mogen worden. */
  telbaarAantal = 0,
  /** Welke poppetjes het kind zelf al heeft aangetikt. */
  getikt = [],
  /** Groot getal boven de bus: de tussenstand tijdens het tellen. */
  bijschrift,
  /** Toon het wijzende handje bij het poppetje dat aan de beurt is. */
  wijsAan = false,
  /** Verandert bij elke herhaling, zodat het handje opnieuw beweegt. */
  wijsSleutel = 0,
  onTik,
}: {
  figuur: Extract<Figuur, { soort: "bus" }>;
  opgelicht?: number;
  telbaar?: boolean;
  telbaarAantal?: number;
  getikt?: number[];
  bijschrift?: string;
  wijsAan?: boolean;
  wijsSleutel?: number;
  onTik?: (index: number) => void;
}) {
  const [kleurA, kleurB] = KRALENPALETTEN[figuur.palet] ?? KRALENPALETTEN["viool-oranje"];
  const perGroep = Math.max(1, figuur.perGroep);
  const totaal = Math.max(1, Math.floor(figuur.totaal));

  /*
    Hoeveel ramen er nodig zijn. Het laatste raam is het restje; de plekken die
    daar overblijven blijven leeg in beeld staan.
  */
  const ramen = Math.ceil(totaal / perGroep);

  const raamBreedte = BUS.raamPad * 2 + perGroep * BUS.stoel;
  const rompBreedte =
    BUS.achter + ramen * raamBreedte + (ramen - 1) * BUS.raamGat + BUS.neus;
  const rompHoogte = BUS.dak + BUS.raamHoogte + BUS.onder;

  const rompX = BUS.marge;
  const rompY = BUS.marge + BUS.bijschrift;
  const breedte = rompBreedte + BUS.marge * 2;
  const hoogte = rompY + rompHoogte + BUS.wiel * 0.7 + BUS.marge;

  /** Waar zitplaats `index` (doorlopend genummerd vanaf 0) terechtkomt. */
  const plek = (index: number) => {
    const raam = Math.floor(index / perGroep);
    const stoel = index % perGroep;
    return {
      x:
        rompX +
        BUS.achter +
        raam * (raamBreedte + BUS.raamGat) +
        BUS.raamPad +
        BUS.stoel / 2 +
        stoel * BUS.stoel,
      y: rompY + BUS.dak + BUS.raamHoogte * 0.56,
      raam,
    };
  };

  const isGeteld = (index: number) => index < opgelicht || getikt.includes(index);

  /* Het eerste poppetje dat nog geteld moet worden; daar wijst het handje. */
  const eerstvolgende = opgelicht + getikt.length;

  /*
    De wielen zitten net ín de carrosserie, zodat ze er halverwege onderuit
    steken. Achter onder het eerste raam, voor onder de neus — zoals bij een
    echte bus.
  */
  const wielY = rompY + rompHoogte - 4;
  const wiel1 = rompX + BUS.achter + raamBreedte * 0.42;
  const wiel2 = rompX + rompBreedte - BUS.neus * 0.5;

  const heleRamen = Math.floor(totaal / perGroep);
  const rest = totaal % perGroep;

  return (
    <svg
      viewBox={`0 0 ${breedte} ${hoogte}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        `Een bus met ${totaal} kinderen. Er zitten ${perGroep} kinderen per raam, ` +
        `om en om van kleur: ${heleRamen} volle ramen` +
        (rest > 0 ? ` en nog een raam met ${rest}.` : ".")
      }
    >
      <defs>
        {/* Bolling van de carrosserie: licht bovenaan, donkerder onderaan. */}
        <linearGradient id={`bus-romp-${figuur.palet}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BUSKLEUR.rompLicht} />
          <stop offset="55%" stopColor={BUSKLEUR.romp} />
          <stop offset="100%" stopColor={BUSKLEUR.rompDonker} />
        </linearGradient>

        {/* Dezelfde glans op de poppetjes als op de kralen. */}
        {[kleurA, kleurB].map((kleur, i) => (
          <radialGradient key={kleur} id={`bus-kind-${i}-${figuur.palet}`} cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor={kleur} />
            <stop offset="100%" stopColor={donkerder(kleur, 0.72)} />
          </radialGradient>
        ))}
      </defs>

      {/* Schaduw onder de bus, zodat hij op de grond staat en niet zweeft. */}
      <ellipse
        cx={rompX + rompBreedte / 2}
        cy={wielY + BUS.wiel * 0.72}
        rx={rompBreedte * 0.46}
        ry={5}
        fill="#2c2545"
        opacity={0.13}
      />

      {/* De carrosserie. */}
      <rect
        x={rompX}
        y={rompY}
        width={rompBreedte}
        height={rompHoogte}
        rx={18}
        fill={`url(#bus-romp-${figuur.palet})`}
        stroke={BUSKLEUR.rompDonker}
        strokeWidth={2}
      />

      {/* Lichte streep over het dak: geeft de bus een ronde bovenkant. */}
      <rect
        x={rompX + 10}
        y={rompY + 5}
        width={rompBreedte - 20}
        height={5}
        rx={2.5}
        fill={BUSKLEUR.dak}
        opacity={0.65}
      />

      {/* Sierstreep onder de ramen. */}
      <rect
        x={rompX + 6}
        y={rompY + BUS.dak + BUS.raamHoogte + 9}
        width={rompBreedte - 12}
        height={5}
        rx={2.5}
        fill={BUSKLEUR.dak}
        opacity={0.5}
      />

      {/* Voorruit met de chauffeur, helemaal rechts. */}
      <rect
        x={rompX + rompBreedte - BUS.neus + 8}
        y={rompY + BUS.dak}
        width={BUS.neus - 20}
        height={BUS.raamHoogte}
        rx={9}
        fill={BUSKLEUR.raam}
        stroke={BUSKLEUR.raamRand}
        strokeWidth={2}
      />
      {/*
        In de voorruit zit BEWUST niets.

        Hier stond eerst een chauffeur en daarna een stuur. Allebei weg: een
        menselijke figuur telde ten onrechte mee bij een telvraag, en het stuur
        las als een teken in een leeg raam. Wat leeg is, is leeg — dat is wat je
        moet kunnen zien.
      */}

      {/* Koplamp. */}
      <circle
        cx={rompX + rompBreedte - 11}
        cy={rompY + rompHoogte - 16}
        r={6}
        fill={BUSKLEUR.koplamp}
        stroke={BUSKLEUR.rompDonker}
        strokeWidth={1.5}
      />

      {/* De ramen met de kinderen. */}
      {Array.from({ length: ramen }, (_, raam) => {
        const x = rompX + BUS.achter + raam * (raamBreedte + BUS.raamGat);
        const y = rompY + BUS.dak;
        /* Dit raam is helemaal geteld als de laatste stoel erin geteld is. */
        const laatsteInRaam = Math.min((raam + 1) * perGroep, totaal) - 1;
        const raamGeteld = opgelicht > 0 && isGeteld(laatsteInRaam);

        return (
          <g key={raam}>
            <rect
              x={x}
              y={y}
              width={raamBreedte}
              height={BUS.raamHoogte}
              rx={9}
              fill={raamGeteld ? BUSKLEUR.raamGeteld : BUSKLEUR.raam}
              stroke={raamGeteld ? BUSKLEUR.raamGeteldRand : BUSKLEUR.raamRand}
              strokeWidth={raamGeteld ? 3 : 2}
            />
          </g>
        );
      })}

      {/*
        De zitplaatsen. Er worden er net zoveel getekend als er ramen zijn maal
        de groepsgrootte: de plekken voorbij het totaal zijn de lege plekken in
        het laatste raam, en die blijven bewust zichtbaar.
      */}
      {Array.from({ length: ramen * perGroep }, (_, i) => {
        const { x, y, raam } = plek(i);

        /*
          Een lege plek blijft écht leeg: geen stippelcirkel, geen omtrek, geen
          enkel teken — alleen de lichte achtergrond van het raam. Elk teken op
          een lege plek is iets wat een kind kan gaan meetellen, en dat is
          precies wat hier fout zou gaan.
        */
        if (i >= totaal) return null;

        const geteld = isGeteld(i);
        const kleurIndex = raam % 2;
        const basis = kleurIndex === 0 ? kleurA : kleurB;

        return (
          <g
            key={`kind-${i}`}
            className={geteld ? "motion-safe:animate-kraal-stuiter" : undefined}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            {/* Schouders, zodat het een poppetje is en geen losse bal. */}
            <path
              d={`M ${x - BUS.hoofd - 2} ${y + 13} a ${BUS.hoofd + 2} ${BUS.hoofd + 2} 0 0 1 ${
                (BUS.hoofd + 2) * 2
              } 0 z`}
              fill={donkerder(basis, 0.82)}
            />
            {/* Hoofd. */}
            <circle
              cx={x}
              cy={y - 3}
              r={BUS.hoofd}
              fill={`url(#bus-kind-${kleurIndex}-${figuur.palet})`}
            />
            {/* Gouden ring zodra dit kind geteld is. */}
            {geteld && (
              <circle
                cx={x}
                cy={y - 3}
                r={BUS.hoofd + 3}
                fill="none"
                stroke={BUSKLEUR.raamGeteldRand}
                strokeWidth={2.5}
              />
            )}
          </g>
        );
      })}

      {/* Wielen. */}
      {[wiel1, wiel2].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={wielY} r={BUS.wiel} fill={BUSKLEUR.band} />
          <circle cx={cx} cy={wielY} r={BUS.wiel * 0.55} fill={BUSKLEUR.velg} />
          <circle cx={cx} cy={wielY} r={BUS.wiel * 0.2} fill={BUSKLEUR.band} opacity={0.35} />
        </g>
      ))}

      {/* Tikvlakken: alleen op de poppetjes die nu aan de beurt zijn. */}
      {telbaar &&
        Array.from({ length: Math.min(telbaarAantal, totaal - opgelicht) }, (_, k) => {
          const i = opgelicht + k;
          const { x, y } = plek(i);
          return (
            <circle
              key={`tik-${i}`}
              cx={x}
              cy={y - 3}
              r={BUS.hoofd + 6}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onTik?.(i)}
            />
          );
        })}

      {/* Het wijzende handje bij het poppetje dat nu aan de beurt is. */}
      {wijsAan && telbaar && eerstvolgende < totaal && (
        <g
          key={`wijs-${wijsSleutel}`}
          className="motion-safe:animate-hand-wijs"
          style={{
            transformOrigin: `${plek(eerstvolgende).x}px ${plek(eerstvolgende).y}px`,
          }}
        >
          <text
            x={plek(eerstvolgende).x}
            y={plek(eerstvolgende).y + 34}
            textAnchor="middle"
            fontSize={20}
          >
            👆
          </text>
        </g>
      )}

      {/* De tussenstand tijdens het tellen, groot boven de bus. */}
      {bijschrift && (
        <text
          x={rompX + rompBreedte / 2}
          y={BUS.marge + 22}
          textAnchor="middle"
          fontSize={26}
          fontWeight={800}
          fill="#e8690f"
        >
          {bijschrift}
        </text>
      )}
    </svg>
  );
}

export function beschrijfFiguur(figuur: Figuur): FiguurBeschrijving {
  if (figuur.soort === "splitsboom") {
    return {
      breedte: BOOM.breedte,
      hoogte: BOOM.hoogte,
      invulvak: figuur.links === null ? BOOM.links : figuur.rechts === null ? BOOM.rechts : null,
    };
  }
  /*
    De kralenrij en de bus hebben geen invulvak: het antwoord ("de hoeveelste
    plek", "hoeveel kinderen") past niet in de tekening zelf en wordt onder de
    vraag ingetypt.
  */
  return { breedte: 100, hoogte: 100, invulvak: null };
}

/**
 * Kan `Figuurtekening` dit figuur tekenen?
 *
 * Nodig omdat het oefenscherm een omlijst vak om de tekening zet. Kent
 * `Figuurtekening` de soort niet, dan levert die `null` en bleef er een leeg
 * afgerond balkje boven de vraag staan. Dat gebeurde bij "Tellen en slepen":
 * die figuren worden namelijk niet hier getekend maar door `SleepGetallen`,
 * omdat elk figuur zijn eigen antwoordvakje eronder heeft.
 */
export function figuurIsTekenbaar(figuur: Figuur): boolean {
  return figuur.soort === "splitsboom" || figuur.soort === "kralenrij" || figuur.soort === "bus";
}

/** Kiest de juiste tekening bij een figuur. Nieuwe soorten komen hier bij. */
export function Figuurtekening({
  figuur,
  interactief = false,
}: {
  figuur: Figuur;
  interactief?: boolean;
}) {
  if (figuur.soort === "splitsboom") {
    return <Splitsboom figuur={figuur} interactief={interactief} />;
  }
  if (figuur.soort === "kralenrij") {
    return <Kralenrij figuur={figuur} />;
  }
  if (figuur.soort === "bus") {
    return <Bus figuur={figuur} />;
  }
  return null;
}
