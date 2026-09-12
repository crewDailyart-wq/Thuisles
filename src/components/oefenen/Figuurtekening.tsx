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
      <rect x={72} y={4} width={56} height={34} rx={8} fill="#eee9ff" stroke="#5b3fd6" strokeWidth={2.5} />
      <text x={100} y={27} textAnchor="middle" className="fill-[#2c2545] text-[20px] font-extrabold">
        {figuur.geheel}
      </text>

      {/* pijlen naar beneden */}
      <g stroke="#5b3fd6" strokeWidth={2.5} strokeLinecap="round" fill="none">
        <path d="M88 40 L46 74" />
        <path d="M112 40 L154 74" />
      </g>
      <g fill="#5b3fd6">
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
export function beschrijfFiguur(figuur: Figuur): FiguurBeschrijving {
  if (figuur.soort === "splitsboom") {
    return {
      breedte: BOOM.breedte,
      hoogte: BOOM.hoogte,
      invulvak: figuur.links === null ? BOOM.links : figuur.rechts === null ? BOOM.rechts : null,
    };
  }
  /*
    De kralenrij heeft geen invulvak: het antwoord ("de hoeveelste plek") past
    niet in de tekening zelf en wordt onder de vraag ingetypt.
  */
  return { breedte: 100, hoogte: 100, invulvak: null };
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
  return null;
}
