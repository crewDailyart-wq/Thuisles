"use client";

/**
 * Stapstenen over een beekje, met een getal op elke steen.
 *
 * Gebruikt door het generator-type "Telrij stapstenen". De rij loopt van links
 * naar rechts; op elke steen staat het volgende getal van de telrij. Eén of
 * meer stenen zijn leeg, en die vult het kind zelf in.
 *
 * ---------------------------------------------------------------------------
 * De steen ís het invoerveld
 * ---------------------------------------------------------------------------
 * Er staat geen los invoervak onder of naast de rij. Het kind tikt op een lege
 * steen, die licht op, en het getal verschijnt meteen in de steen zelf. Zo
 * blijft het antwoord staan waar het hoort — in de telrij — en hoeft een kind
 * niet heen en weer te kijken tussen een vakje en de rij.
 *
 * Tikken op een andere lege steen wisselt; wat er al ingevuld was blijft staan.
 *
 * ---------------------------------------------------------------------------
 * De steen is een echt invoerveld
 * ---------------------------------------------------------------------------
 * Over elke lege steen ligt een gewoon `<input>`, zonder eigen rand of
 * achtergrond: wat het kind ziet is de steen. Er staat geen nagebouwd
 * cijfertoetsenbord meer in de pagina; zie HARDE REGEL 5 in CLAUDE.md. Op een
 * tablet komt daardoor het systeemtoetsenbord op met alleen cijfers, en schuift
 * de oefening mee omhoog zodat de steen en de knop Controleer zichtbaar
 * blijven. Op een laptop typ je gewoon, loopt Tab langs de lege stenen en doet
 * Enter hetzelfde als Controleer.
 *
 * ---------------------------------------------------------------------------
 * De afstand zegt iets
 * ---------------------------------------------------------------------------
 * Bij een grotere sprong staan de stenen verder uit elkaar. Een sprong van tien
 * is een grotere stap dan een sprong van één, en dat hoort ook te zien te zijn
 * voordat een kind het getal leest.
 */

import { useEffect, useId, useRef, useState } from "react";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { opgavegeluidStaatAan, plop } from "@/lib/geluid";
import { nuInMs } from "@/lib/klok";
import type { Figuur } from "@/lib/generatoren/soort";

export type Steenfase = "bezig" | "goed" | "fout";

type Stapfiguur = Extract<Figuur, { soort: "stapstenen" }>;

/** Maten van één steen en van de rij, in de eenheden van de tekening. */
const STEEN = {
  breedte: 66,
  hoogte: 46,
  /** Basisafstand tussen twee stenen; groeit mee met de sprong. */
  gat: 16,
  /* Ruim, want de mascotte is breder dan een steen en staat op de eerste. */
  marge: 26,
  /** Hoe ver de stenen om en om op en neer liggen: een beekje is niet vlak. */
  golf: 7,
  /** Hoe dik een steen lijkt: de donkere onderrand die eronder uitkomt. */
  dikte: 5,
  /*
    Waar het hart van een steen ligt.

    Ruim onder de bovenkant, want daarboven moet nog van alles passen: de
    mascotte staat óp een steen en het boogje van de sprong loopt eroverheen.
    De vos is bijna twee keer zo hoog als een steen breed is, dus die vraagt de
    meeste ruimte; zit dit te hoog, dan valt zijn kop buiten de tekening.
  */
  midden: 138,
  /** Hoe hoog de mascotte is: ruim anderhalf keer de breedte van een steen. */
  vos: 112,
  /** De oever rechts, met de sleutel erop. */
  oever: 86,
};

/**
 * De afstand tussen twee stenen bij deze sprong.
 *
 * Niet recht evenredig: bij sprong 10 zou de rij anders zo breed worden dat de
 * stenen op een telefoon onleesbaar klein worden. De wortel geeft een duidelijk
 * verschil tussen 1, 2, 5 en 10 zonder dat het uit de hand loopt.
 *
 * Op een smal scherm gaat alles wat lucht is krapper zitten: de gaten, de oever
 * en de marge links. De stenen zelf blijven even groot, want daar staat het
 * getal op. Zo past de hele rij op een telefoon zonder dat je hoeft te vegen,
 * en blijft een grotere sprong nog steeds een grotere stap.
 */
export function gatBijSprong(sprong: number, compact = false): number {
  const grond = compact ? 8 : STEEN.gat;
  const groei = compact ? 5 : 11;
  return grond + Math.round(Math.sqrt(Math.max(1, sprong)) * groei);
}

/** De marge links; op een smal scherm net genoeg voor de mascotte. */
function margeVan(compact: boolean) {
  return compact ? 16 : STEEN.marge;
}

/** De breedte van de oever. Op een smal scherm smaller, maar nog herkenbaar. */
function oeverVan(compact: boolean) {
  return compact ? 58 : STEEN.oever;
}

/** Waar elke steen ligt. Gedeeld door de tekening en het boogje. */
export function steenPlekken(aantal: number, sprong: number, compact = false) {
  const gat = gatBijSprong(sprong, compact);
  const stap = STEEN.breedte + gat;
  return Array.from({ length: aantal }, (_, i) => ({
    x: margeVan(compact) + i * stap,
    /* Om en om iets hoger en lager, zodat het op echte stapstenen lijkt. */
    y: STEEN.midden + (i % 2 === 0 ? 0 : STEEN.golf),
  }));
}

/** Waar de oever begint: net na de laatste steen. */
export function oeverX(aantal: number, sprong: number, compact = false): number {
  const plekken = steenPlekken(aantal, sprong, compact);
  return (plekken[aantal - 1]?.x ?? 0) + STEEN.breedte + gatBijSprong(sprong, compact) * 0.6;
}

export function breedteVoor(aantal: number, sprong: number, compact = false) {
  return oeverX(aantal, sprong, compact) + oeverVan(compact);
}

/*
  De huisstijlkleur, voor wat in SVG getekend wordt.

  Een Tailwind-klasse kan hier niet: `stroke` en `fill` krijgen een echte
  kleurwaarde. Staat de huisstijl in globals.css op iets anders, pas hem dan
  hier ook aan — dit is de enige plek in de tekening waar hij nog los staat.
*/
const HUISSTIJL = "#e8690f";

const HOOGTE = 238;


// ---------------------------------------------------------------------------
// Hoe een steen eruitziet
// ---------------------------------------------------------------------------

/**
 * Een vast toevalsgetal bij een geheel getal.
 *
 * Bewust géén `Math.random`: de server en de browser moeten dezelfde stenen
 * tekenen, anders klaagt React dat de pagina niet klopt. Alleen hele getallen,
 * want die rekenen overal precies hetzelfde uit — bij `Math.sin` of `Math.hypot`
 * is dat niet gegarandeerd.
 */
function ruis(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/**
 * Vijf steenvormen, als hoekpunten in een vak van 0 tot 1.
 *
 * Geen van alle links-rechts symmetrisch en geen van alle een rechthoek: een
 * kei die jarenlang in een beek heeft gelegen is nergens recht. De randen
 * worden hieronder licht bol getrokken, zodat er ook geen scherpe hoeken in
 * zitten.
 */
const STEENVORMEN: [number, number][][] = [
  /* Breed en laag, met een schouder rechtsboven. */
  [[0.02, 0.52], [0.14, 0.2], [0.44, 0.08], [0.72, 0.14], [0.93, 0.3], [0.99, 0.62], [0.74, 0.94], [0.3, 0.98], [0.08, 0.8]],
  /* Blokkig, bijna vlak van boven. */
  [[0.08, 0.62], [0.1, 0.24], [0.34, 0.1], [0.76, 0.09], [0.94, 0.26], [0.97, 0.66], [0.8, 0.92], [0.34, 0.95], [0.12, 0.84]],
  /* Met een uitstekende punt linksonder. */
  [[0.05, 0.3], [0.3, 0.06], [0.66, 0.07], [0.95, 0.32], [0.9, 0.64], [0.66, 0.88], [0.3, 0.92], [0.14, 0.99], [0.02, 0.66]],
  /* Scheef, hoger aan de rechterkant. */
  [[0.12, 0.34], [0.38, 0.12], [0.74, 0.03], [0.97, 0.3], [0.94, 0.72], [0.6, 0.96], [0.22, 0.88], [0.04, 0.6]],
  /* Rond met een afgeplatte linkerkant. */
  [[0.03, 0.4], [0.06, 0.2], [0.36, 0.05], [0.7, 0.1], [0.96, 0.4], [0.88, 0.76], [0.52, 0.97], [0.18, 0.86]],
];

/**
 * Een steenvorm als pad, geschaald naar een vak van `breedte` bij `hoogte`.
 *
 * Elke rand krijgt een klein bolletje naar buiten toe, zodat het geen
 * veelhoek met rechte zijden blijft maar een ronde kei wordt.
 */
function steenPad(vorm: [number, number][], breedte: number, hoogte: number): string {
  const punten = vorm.map(([x, y]) => [x * breedte, y * hoogte] as [number, number]);
  const midX = breedte / 2;
  const midY = hoogte / 2;

  let pad = `M${punten[0][0].toFixed(2)} ${punten[0][1].toFixed(2)}`;
  for (let i = 0; i < punten.length; i++) {
    const a = punten[i];
    const b = punten[(i + 1) % punten.length];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    /*
      Het midden van de rand een klein stukje van het hart af.

      Bewust weinig: bij een grotere waarde worden alle stenen ovaal en valt
      juist het onregelmatige weg waar het hier om gaat. Zo blijven de hoeken
      herkenbaar terwijl de randen toch licht gebogen zijn.
    */
    const cx = mx + (mx - midX) * 0.05;
    const cy = my + (my - midY) * 0.05;
    pad += `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return `${pad}Z`;
}

/** Natuurlijke grijsbruine steenkleuren. Per steen een andere. */
const STEENKLEUREN = [
  { boven: "#b3a795", onder: "#7d7264", rand: "#6d6355" },
  { boven: "#a89a8a", onder: "#74695c", rand: "#655c50" },
  { boven: "#bdb2a1", onder: "#877c6d", rand: "#746a5c" },
  { boven: "#9e9384", onder: "#6e6558", rand: "#5f574b" },
  { boven: "#b8ab9b", onder: "#827768", rand: "#6f665a" },
];

/**
 * Welke vorm, kleur en draaiing deze steen krijgt.
 *
 * Twee stenen naast elkaar krijgen nooit dezelfde vorm: de keuze schuift een
 * plek op zodra dat toch zou gebeuren. Het blijft per plek hetzelfde, dus de
 * rij ziet er bij elke tekening precies zo uit.
 */
function steenUiterlijk(index: number) {
  let vorm = Math.floor(ruis(index * 7 + 3) * STEENVORMEN.length) % STEENVORMEN.length;
  if (index > 0) {
    const vorige = Math.floor(ruis((index - 1) * 7 + 3) * STEENVORMEN.length) % STEENVORMEN.length;
    if (vorm === vorige) vorm = (vorm + 1) % STEENVORMEN.length;
  }
  const kleur = STEENKLEUREN[Math.floor(ruis(index * 17 + 11) * STEENKLEUREN.length) % STEENKLEUREN.length];
  return {
    vorm: STEENVORMEN[vorm],
    kleur,
    /* Een paar graden scheef, en soms gespiegeld: nooit twee dezelfde keien. */
    draai: Math.round((ruis(index * 13 + 5) - 0.5) * 14),
    spiegel: ruis(index * 29 + 1) > 0.5,
  };
}

/** Spikkels en een haarscheurtje. Rustig gehouden; het getal moet leesbaar zijn. */
function steenTextuur(index: number, breedte: number, hoogte: number) {
  const spikkels = Array.from({ length: 5 }, (_, k) => ({
    x: (0.16 + ruis(index * 31 + k * 3) * 0.68) * breedte,
    y: (0.18 + ruis(index * 37 + k * 5) * 0.64) * hoogte,
    r: 0.9 + ruis(index * 41 + k * 7) * 1.5,
  }));
  /* Niet elke steen een barst; anders wordt het onrustig. */
  const barst =
    ruis(index * 53 + 9) > 0.55
      ? `M${(0.24 * breedte).toFixed(1)} ${(0.7 * hoogte).toFixed(1)}q${(0.14 * breedte).toFixed(
          1,
        )} ${(-0.16 * hoogte).toFixed(1)} ${(0.3 * breedte).toFixed(1)} ${(-0.06 * hoogte).toFixed(1)}`
      : null;
  return { spikkels, barst };
}

// ---------------------------------------------------------------------------

/**
 * De rij stenen als tekening.
 *
 * Alles wat zowel de vraag als de uitleg nodig heeft, zit hier: het beekje, de
 * stenen, de getallen, de mascotte en het boogje van de sprong. Wat alleen bij
 * de vraag hoort — aantikken en het toetsenbord — staat in `Stapstenen`
 * hieronder. Zo tekent de uitleg gegarandeerd dezelfde stenen als de vraag.
 */
export function Steenrij({
  figuur,
  /** Wat er in de lege stenen staat, op volgorde van links naar rechts. */
  ingevuld = [],
  /** Welke lege steen nu actief is; -1 = geen. */
  actief = -1,
  /** Na een fout antwoord: wat er had moeten staan. */
  goedeWaarden = null,
  fase = "bezig",
  /**
   * Waar de mascotte staat, als plek in de rij.
   *
   * Een gebroken getal mag: 2.5 is halverwege de sprong van steen 2 naar 3.
   * Is het gelijk aan het aantal stenen, dan staat hij op de oever.
   *
   * Niets meegegeven betekent: op de eerste steen die een getal heeft. Dat is
   * bijna altijd steen 0, maar niet als de eerste steen leeg mag zijn — en op
   * een lege steen hoort hij niet te staan.
   */
  vosOp,
  /** Hoe hoog de vos van de stenen af is tijdens een sprong, van 0 tot 1. */
  vosLift = 0,
  /** Welke houding: staand, springend of juichend. */
  vosHouding = "staand",
  /** Ligt de sleutel nog op de oever? */
  sleutelOpOever = true,
  /** Staat de vos te wachten? Dan wipt hij zachtjes op zijn plek. */
  vosTrappelt = false,
  invoerErboven = false,
  /** Smal scherm: alles wat lucht is gaat krapper zitten. Zie `gatBijSprong`. */
  compact = false,
  /** Boogje van deze steen naar de volgende; null = geen boog. */
  boogVan = null,
  onKiesSteen,
  className = "",
  stijl,
}: {
  figuur: Stapfiguur;
  ingevuld?: string[];
  actief?: number;
  goedeWaarden?: number[] | null;
  fase?: Steenfase;
  vosOp?: number;
  vosLift?: number;
  vosHouding?: "staand" | "springend" | "juichend";
  sleutelOpOever?: boolean;
  vosTrappelt?: boolean;
  compact?: boolean;
  boogVan?: number | null;
  onKiesSteen?: (legeIndex: number) => void;
  className?: string;
  /** Extra stijl op de tekening zelf; gebruikt voor een minimumbreedte. */
  stijl?: React.CSSProperties;
  /**
   * Ligt er een echt invulveld over de lege stenen heen?
   *
   * Zo ja, dan tekent de steen zelf niet meer wat er getypt is: dat getal komt
   * dan uit het veld, en anders zou het er dubbel staan. Alleen de vraag doet
   * dat; de uitleg en het voorbeeld tekenen hun getallen gewoon.
   */
  invoerErboven?: boolean;
}) {
  /*
    Eigen namen voor de knipvlakken. Die gelden voor de hele pagina, en in het
    beheervoorbeeld staan tien rijen onder elkaar — zonder eigen naam knipt de
    ene rij zijn stenen op de vorm van de andere.
  */
  const id = useId().replace(/:/g, "");
  /* Zie hierboven: zonder opgegeven plek staat Vos op de eerste steen mét getal. */
  const vosPlek = vosOp ?? Math.max(0, figuur.stenen.findIndex((w) => w !== null));
  const plekken = steenPlekken(figuur.stenen.length, figuur.sprong, compact);
  const breedte = breedteVoor(figuur.stenen.length, figuur.sprong, compact);
  const oeverBreed = oeverVan(compact);

  /* Van steennummer naar "de hoeveelste lege steen", want zo komt het antwoord. */
  const legeVolgorde: number[] = [];
  figuur.stenen.forEach((waarde, i) => {
    if (waarde === null) legeVolgorde.push(i);
  });

  const teken = figuur.richting === "terug" ? "−" : "+";

  return (
    <svg
      viewBox={`0 0 ${breedte} ${HOOGTE}`}
      className={className || "h-auto w-full"}
      style={stijl}
      role={onKiesSteen ? "group" : "img"}
      aria-label={`Een rij van ${figuur.stenen.length} stapstenen met sprongen van ${figuur.sprong}`}
    >
      <defs>
        <linearGradient id="beek" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fd0ef" />
          <stop offset="100%" stopColor="#4a9ed6" />
        </linearGradient>
      </defs>

      {/* Het beekje waar de stenen in liggen. */}
      <rect x={0} y={152} width={breedte} height={HOOGTE - 152} fill="url(#beek)" />
      {[0, 1, 2].map((r) => (
        <path
          key={r}
          d={`M0 ${172 + r * 18}Q${breedte / 6} ${164 + r * 18} ${breedte / 3} ${172 + r * 18}T${
            (breedte * 2) / 3
          } ${172 + r * 18}T${breedte} ${172 + r * 18}`}
          stroke="#ffffff"
          strokeWidth={2}
          fill="none"
          opacity={0.35}
        />
      ))}

      {figuur.stenen.map((waarde, i) => {
        const p = plekken[i];
        const leeg = waarde === null;
        const legeIndex = legeVolgorde.indexOf(i);
        const isActief = leeg && legeIndex === actief && fase === "bezig";
        const getypt = leeg ? (ingevuld[legeIndex] ?? "") : "";
        const juist = goedeWaarden?.[legeIndex];
        const klopt = juist !== undefined && Number(getypt) === juist;

        const { vorm, kleur, draai, spiegel } = steenUiterlijk(i);
        const pad = steenPad(vorm, STEEN.breedte, STEEN.hoogte);
        const { spikkels, barst } = steenTextuur(i, STEEN.breedte, STEEN.hoogte);
        const knipId = `${id}-knip-${i}`;

        /*
          De kleuren. Een lege steen blijft een lege steen — zelfde vorm en
          zelfde textuur, maar lichter, zodat je meteen ziet dat daar iets in
          moet. Na het nakijken kleurt hij groen of roze.
        */
        let bovenkleur = kleur.boven;
        let randkleur = kleur.rand;
        if (leeg) {
          bovenkleur = "#e9e3d7";
          randkleur = "#8c8373";
          if (fase !== "bezig") {
            bovenkleur = klopt ? "#d9f0e4" : "#fbdfe8";
            randkleur = klopt ? "#1f9d63" : "#e4607f";
          } else if (isActief) {
            /* De huisstijlkleur; zie --color-huisstijl in globals.css. */
            randkleur = HUISSTIJL;
          }
        }

        const kop = p.y - STEEN.hoogte / 2;
        /* De steen kantelt en spiegelt om zijn eigen hart. */
        const draaiing = `translate(${p.x} ${kop}) rotate(${draai} ${STEEN.breedte / 2} ${
          STEEN.hoogte / 2
        })${spiegel ? ` translate(${STEEN.breedte} 0) scale(-1 1)` : ""}`;
        const aanklikbaar = leeg && fase === "bezig" && Boolean(onKiesSteen);

        return (
          <g key={i}>
            <defs>
              <clipPath id={knipId}>
                <path d={pad} transform={draaiing} />
              </clipPath>
            </defs>

            {/*
              Schaduw op het water, in de vorm van de steen zelf.

              Alle sierlagen staan op `pointer-events: none`. Ze liggen deels
              óver het bovenvlak heen, en zonder dat zouden ze de tik opvangen
              die voor de steen bedoeld is — dan kan een kind de lege steen niet
              meer aanwijzen.
            */}
            <path
              pointerEvents="none"
              d={pad}
              transform={`translate(0 ${STEEN.hoogte * 0.26}) ${draaiing}`}
              fill="#12405e"
              opacity={0.22}
            />

            {/*
              De weerspiegeling: dezelfde steen, ondersteboven en platgedrukt.
              Daardoor ligt hij echt ín de beek in plaats van erboven te zweven.
            */}
            <g
              pointerEvents="none"
              transform={`translate(${p.x} ${kop + STEEN.hoogte * 1.9}) scale(1 -0.5)`}
              opacity={0.16}
            >
              <path d={pad} fill="#0f3f5c" />
            </g>

            {/* De dikte: dezelfde vorm iets lager, in een donkerder tint. */}
            <path
              pointerEvents="none"
              d={pad}
              transform={`translate(0 ${STEEN.dikte}) ${draaiing}`}
              fill={leeg ? "#b9b0a1" : kleur.onder}
            />

            {/* Het platte bovenvlak; hier staat het getal op. */}
            <path
              data-sleep-steen={leeg ? legeIndex : undefined}
              role={aanklikbaar ? "button" : undefined}
              tabIndex={aanklikbaar ? 0 : undefined}
              aria-label={aanklikbaar ? `Steen ${legeIndex + 1}: ${getypt || "leeg"}` : undefined}
              onKeyDown={aanklikbaar ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onKiesSteen?.(legeIndex); } } : undefined}
              d={pad}
              transform={draaiing}
              fill={bovenkleur}
              stroke={randkleur}
              strokeWidth={isActief ? 3.5 : 2}
              strokeDasharray={leeg && fase === "bezig" && !isActief ? "7 5" : undefined}
              className={aanklikbaar ? "cursor-pointer" : undefined}
              onClick={aanklikbaar ? () => onKiesSteen?.(legeIndex) : undefined}
            />

            {/* Spikkels en een haarscheurtje, netjes binnen de steen. */}
            <g pointerEvents="none" clipPath={`url(#${knipId})`} opacity={leeg ? 0.3 : 0.5}>
              {spikkels.map((sp, k) => (
                <circle
                  key={k}
                  cx={sp.x}
                  cy={sp.y}
                  r={sp.r}
                  transform={draaiing}
                  fill={kleur.rand}
                  opacity={0.45}
                />
              ))}
              {barst && (
                <path
                  d={barst}
                  transform={draaiing}
                  stroke={kleur.rand}
                  strokeWidth={1.1}
                  fill="none"
                  opacity={0.4}
                />
              )}
              {/* Een lichte veeg bovenop: daglicht op een natte steen. */}
              <path
                d={pad}
                transform={`translate(0 ${-STEEN.hoogte * 0.3}) ${draaiing}`}
                fill="#ffffff"
                opacity={0.22}
              />
            </g>

            {isActief && (
              <path
                pointerEvents="none"
                d={pad}
                transform={`translate(0 -1) ${draaiing}`}
                fill="none"
                stroke={HUISSTIJL}
                strokeWidth={1.6}
                opacity={0.4}
              />
            )}

            <text
              x={p.x + STEEN.breedte / 2}
              y={p.y + 9}
              textAnchor="middle"
              fontSize={26}
              fontWeight="800"
              fill={leeg && fase !== "bezig" && !klopt ? "#c14664" : "#2c2545"}
              stroke="#ffffff"
              strokeWidth={3.2}
              paintOrder="stroke"
              className={aanklikbaar ? "cursor-pointer" : undefined}
              onClick={aanklikbaar ? () => onKiesSteen?.(legeIndex) : undefined}
            >
              {leeg ? (invoerErboven ? "" : getypt) : waarde}
            </text>

            {/* Na een fout: wat er had moeten staan, onder de steen. */}
            {leeg && fase === "fout" && !klopt && juist !== undefined && (
              <text
                x={p.x + STEEN.breedte / 2}
                y={p.y + STEEN.hoogte / 2 + 20}
                textAnchor="middle"
                fontSize={17}
                fontWeight="800"
                fill="#17784c"
              >
                {juist}
              </text>
            )}
          </g>
        );
      })}

      {/*
        De oever aan de overkant, met de sleutel erop.

        Daar eindigt de telrij: de vos springt er na een goed antwoord naartoe
        en pakt de sleutel op. Het is dezelfde sleutel als in de teller
        rechtsboven, zodat een kind ziet waar zijn sleutels vandaan komen.
      */}
      {(() => {
        const ox = oeverX(figuur.stenen.length, figuur.sprong, compact);
        const grond = plekken[figuur.stenen.length - 1]?.y ?? STEEN.midden;
        return (
          <g pointerEvents="none">
            <path
              d={`M${ox} ${HOOGTE}L${ox} ${grond + 6}Q${ox + 10} ${grond - 12} ${ox + 34} ${
                grond - 14
              }Q${ox + 62} ${grond - 16} ${ox + oeverBreed} ${grond - 4}L${
                ox + oeverBreed
              } ${HOOGTE}Z`}
              fill="#c8a86b"
            />
            <path
              d={`M${ox} ${grond + 6}Q${ox + 10} ${grond - 12} ${ox + 34} ${grond - 14}Q${
                ox + 62
              } ${grond - 16} ${ox + oeverBreed} ${grond - 4}`}
              stroke="#6fbf5e"
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
            />
            {sleutelOpOever && (
              <image
                href="/sleutel.png"
                x={ox + oeverBreed * 0.4}
                y={grond - 54}
                width={40}
                height={40}
                preserveAspectRatio="xMidYMax meet"
              />
            )}
          </g>
        );
      })()}

      {/*
        Het boogje van de sprong.

        Bewust ná de stenen, zodat het er bovenop ligt in plaats van erachter,
        en van rand tot rand door de opening tussen twee stenen — daar is de
        sprong, en daar staat de mascotte niet in de weg.
      */}
      {boogVan !== null && plekken[boogVan] && plekken[boogVan + 1] && (() => {
        const van = plekken[boogVan];
        const naar = plekken[boogVan + 1];
        const x1 = van.x + STEEN.breedte;
        const x2 = naar.x;
        const top = Math.min(van.y, naar.y) - STEEN.hoogte / 2 - 30;
        return (
          <g>
            <path
              d={`M${x1} ${van.y - STEEN.hoogte / 4}Q${(x1 + x2) / 2} ${top} ${x2} ${
                naar.y - STEEN.hoogte / 4
              }`}
              stroke="#e4832a"
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 6"
            />
            {/* Pijlpunt op de landingssteen. */}
            <path
              d={`M${x2 - 7} ${naar.y - STEEN.hoogte / 4 - 8}L${x2} ${
                naar.y - STEEN.hoogte / 4
              }L${x2 - 9} ${naar.y - STEEN.hoogte / 4 + 2}`}
              stroke="#e4832a"
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x={(x1 + x2) / 2}
              y={top + 2}
              textAnchor="middle"
              fontSize={21}
              fontWeight="800"
              fill="#b8631a"
              stroke="#ffffff"
              strokeWidth={4}
              paintOrder="stroke"
            >
              {teken}
              {figuur.sprong}
            </text>
          </g>
        );
      })()}

      {/*
        De mascotte. Geen tekening in code maar een afbeelding uit het beheer,
        zodat hij te vervangen is. Is er niets gekozen, dan staat er niets —
        liever leeg dan een verkeerd poppetje.
      */}
      {figuur.mascotte && (() => {
        /*
          Waar de vos staat. Tussen twee stenen in wordt er rechtlijnig
          geschoven; de boog van de sprong zit in `vosLift`.
        */
        const laatste = figuur.stenen.length - 1;
        const plekVan = (n: number) => {
          if (n <= laatste) return plekken[Math.max(0, n)];
          /* Voorbij de laatste steen: de oever. */
          const ox = oeverX(figuur.stenen.length, figuur.sprong, compact);
          return { x: ox + oeverBreed * 0.2, y: (plekken[laatste]?.y ?? STEEN.midden) - 12 };
        };
        const heel = Math.floor(vosPlek);
        const deel = vosPlek - heel;
        const a = plekVan(heel);
        const b = plekVan(heel + 1);
        if (!a || !b) return null;

        const x = a.x + (b.x - a.x) * deel;
        const grond = a.y + (b.y - a.y) * deel;
        /* De hoogte van de sprong: een boog van ruim een halve steen hoog. */
        const lift = vosLift * STEEN.hoogte * 1.25;

        const houdingen = {
          staand: figuur.mascotte,
          springend: figuur.mascotteSpringend || figuur.mascotte,
          juichend: figuur.mascotteJuichend || figuur.mascotte,
        };
        const breed = STEEN.vos * 0.86;

        return (
          <image
            pointerEvents="none"
            className={vosTrappelt ? "motion-safe:animate-vos-trappel" : undefined}
            href={`/vragen/${houdingen[vosHouding]}`}
            x={x + STEEN.breedte / 2 - breed / 2}
            /*
              De onderkant van het vak valt precies op het bovenvlak van de
              steen, en `xMidYMax` zet de afbeelding met zijn voeten daarop. Zo
              staat hij erop en zweeft hij er niet boven.
            */
            y={grond - STEEN.hoogte / 2 - STEEN.vos - lift}
            width={breed}
            height={STEEN.vos}
            preserveAspectRatio="xMidYMax meet"
          />
        );
      })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------

/**
 * De hele vraag: de rij stenen, met een invulveld op elke lege steen.
 *
 * `ingevuld` bevat wat er in de lege stenen staat, van links naar rechts.
 */
/** Hoe lang één sprongetje duurt. */
const SPRONG_MS = 520;

export function Stapstenen({
  figuur,
  ingevuld,
  fase,
  goedeWaarden = null,
  onWijzig,
  onBevestig,
  onSprongKlaar,
  sleepbediening,
  onKiesSleepSteen,
}: {
  figuur: Stapfiguur;
  sleepbediening?: React.ReactNode;
  onKiesSleepSteen?: (index: number) => void;
  ingevuld: string[];
  fase: Steenfase;
  goedeWaarden?: number[] | null;
  onWijzig: (nieuw: string[]) => void;
  /** Enter in een steen doet hetzelfde als de knop Controleer. */
  onBevestig?: () => void;
  /**
   * De vos is aan de overkant en heeft de sleutel.
   *
   * Het oefenscherm wacht hierop met het feestscherm, anders zou dat over de
   * sprong heen komen te liggen en zie je er niets van.
   */
  onSprongKlaar?: () => void;
}) {
  const aantalLeeg = figuur.stenen.filter((w) => w === null).length;
  const rolvak = useRef<HTMLDivElement>(null);
  /*
    Smal scherm? Dan gaat de rij compacter zitten, zodat alles past zonder dat
    het kind hoeft te vegen. Begint op `false`, net als op de server: zo tekent
    de browser bij het overnemen precies hetzelfde, en pas daarna wordt er
    gekeken hoe breed het scherm werkelijk is.
  */
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const vraag = window.matchMedia("(max-width: 640px)");
    const kijk = () => setCompact(vraag.matches);
    kijk();
    vraag.addEventListener("change", kijk);
    return () => vraag.removeEventListener("change", kijk);
  }, []);
  /* De eerste lege steen staat meteen klaar; anders moet een kind eerst zoeken. */
  const [actief, setActief] = useState(0);
  const vorigeVraag = useRef(figuur);
  /** De invulvelden die over de lege stenen liggen, van links naar rechts. */
  const invulvelden = useRef<(HTMLInputElement | null)[]>([]);

  /*
    De vos springt op twee momenten, en daartussen staat hij stil.

      1. Bij het openen van de vraag loopt hij de stenen af die al een getal
         hebben, en blijft staan op de laatste vóór de eerste lege steen. Dat
         laat zien waar de telrij begint en hoe hij loopt. Mag de eerste steen
         leeg zijn, dan begint hij niet op steen 0 maar op de eerste steen mét
         een getal: op een lege steen hoort hij niet te staan.
      2. Ná een goed antwoord springt hij verder over de zojuist ingevulde
         stenen naar de oever, en pakt daar de sleutel op.

    Er wordt hierbij niets uitgesproken. Een stem die tijdens het invullen "4,
    5, 6" opzegt, praat door het denken van het kind heen en geeft bovendien de
    telrij al weg. Hardop tellen hoort in het uitlegfilmpje, waar het bedoeld is
    om iets uit te leggen.
  */
  /*
    Waar hij begint en waar hij stopt.

    `vosStart` is de eerste steen met een getal — meestal steen 0, en alleen
    anders als de eerste steen leeg is. Vanaf daar springt hij door tot vlak
    vóór de eerstvolgende lege steen. Is er verderop geen lege steen meer, dan
    blijft hij staan waar hij staat.
  */
  const vosStart = Math.max(0, figuur.stenen.findIndex((w) => w !== null));
  const volgendeLeeg = figuur.stenen.findIndex((w, i) => i > vosStart && w === null);
  const laatsteGevuld = volgendeLeeg <= vosStart ? vosStart : volgendeLeeg - 1;

  const [vos, setVos] = useState({ op: vosStart, lift: 0 });
  const [houding, setHouding] = useState<"staand" | "springend" | "juichend">("staand");
  /*
    Trappelen als hij stilstaat en de vraag nog open staat: hij wacht tot hij
    verder mag. Met een CSS-animatie en niet met een beeldje-per-beeldje
    berekening — anders wordt de hele rij stenen zestig keer per seconde
    opnieuw getekend voor een wipje van vier pixels.
  */
  const [sleutelOpOever, setSleutelOpOever] = useState(true);
  const loopt = useRef<number | null>(null);
  const noodklok = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopLopen = () => {
    if (loopt.current !== null) cancelAnimationFrame(loopt.current);
    loopt.current = null;
    if (noodklok.current) clearTimeout(noodklok.current);
    noodklok.current = null;
  };

  /**
   * De vos van `vanaf` naar `tot` laten springen, steen voor steen.
   *
   * Tijdgestuurd en niet per beeldje: staat het tabblad op de achtergrond, dan
   * levert de browser geen beeldjes en zou een sprong per beeldje blijven
   * hangen. `nood` maakt het bovendien sowieso af, zodat het oefenscherm nooit
   * op een sprong blijft wachten.
   */
  const laatSpringen = (vanaf: number, tot: number, klaar?: () => void) => {
    stopLopen();
    const sprongen = Math.max(0, tot - vanaf);
    if (sprongen === 0) {
      setVos({ op: vanaf, lift: 0 });
      klaar?.();
      return;
    }

    const begin = nuInMs();
    const duur = sprongen * SPRONG_MS;
    /*
      Tot welke steen de plop al geklonken heeft. De plop hoort bij het NEERKOMEN
      en niet bij het afzetten, dus hij gaat af op het beeldje waarin de vos een
      volgende steen bereikt. Daarmee loopt het geluid gelijk met wat je ziet.
    */
    let geplopt = vanaf;

    const stap = () => {
      const t = Math.min(1, (nuInMs() - begin) / duur);
      const plek = vanaf + t * sprongen;
      const heel = Math.floor(plek);
      const deel = plek - heel;
      /* Een boogje per sprong: omhoog en weer omlaag. */
      setVos({ op: plek, lift: deel === 0 ? 0 : Math.sin(deel * Math.PI) });
      setHouding(t < 1 ? "springend" : "staand");

      /* Net geland op een volgende steen: precies één plop. */
      if (heel > geplopt) {
        geplopt = heel;
        if (opgavegeluidStaatAan()) plop();
      }

      if (t >= 1) {
        stopLopen();
        setVos({ op: tot, lift: 0 });
        if (geplopt < tot) {
          geplopt = tot;
          if (opgavegeluidStaatAan()) plop();
        }
        klaar?.();
        return;
      }
      loopt.current = requestAnimationFrame(stap);
    };

    loopt.current = requestAnimationFrame(stap);
    /*
      Vangnet. Komen er geen beeldjes — een tabblad op de achtergrond, een
      tablet die het druk heeft — dan blijft de vos anders halverwege hangen en
      wacht het oefenscherm eeuwig op het feest. Deze klok maakt de sprong
      sowieso af.
    */
    noodklok.current = setTimeout(() => {
      stopLopen();
      setVos({ op: tot, lift: 0 });
      setHouding("staand");
      klaar?.();
    }, duur + 700);
  };

  /*
    Moment 1: bij het openen van de vraag.

    Het springen begint net ná het tekenen, met een klok van nul milliseconden.
    Bewust een klok en geen `requestAnimationFrame`: staat het tabblad op de
    achtergrond, dan levert de browser geen beeldjes en zou het springen nooit
    beginnen. Een klok loopt daar wél door.
  */
  useEffect(() => {
    const start = setTimeout(() => {
      setVos({ op: vosStart, lift: 0 });
      setHouding("staand");
      setSleutelOpOever(true);
      laatSpringen(vosStart, laatsteGevuld);
    }, 0);
    return () => {
      clearTimeout(start);
      stopLopen();
    };
    /* Alleen opnieuw bij een andere vraag; niet bij elke toetsaanslag. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figuur]);

  /* Moment 2: pas na een goed antwoord, door naar de oever. */
  useEffect(() => {
    if (fase !== "goed") return;
    /* Ook hier een klok en geen beeldje; zie moment 1 hierboven. */
    const start = setTimeout(() => {
      laatSpringen(laatsteGevuld, figuur.stenen.length, () => {
        setHouding("juichend");
        setSleutelOpOever(false);
        onSprongKlaar?.();
      });
    }, 0);
    return () => {
      clearTimeout(start);
      stopLopen();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  useEffect(() => {
    if (vorigeVraag.current !== figuur) {
      vorigeVraag.current = figuur;
      setActief(0);
    }
  }, [figuur]);

  /*
    De cursor staat meteen in de eerste lege steen.

    Anders moet een kind eerst zoeken waar het moet beginnen, en op een laptop
    zou het zelfs eerst moeten klikken voordat er iets gebeurt als het gaat
    typen. Net als bij de deuren in Vos' straat.

    Met `preventScroll`, anders springt de bladzijde bij elke nieuwe vraag naar
    de rij toe. Komt het toetsenbord van een tablet erdoor omhoog, dan regelt
    `bijAandacht` in het veld zelf het meeschuiven — dat hangt aan `onFocus` en
    gaat dus ook bij deze automatische sprong langs.
  */
  useEffect(() => {
    if (sleepbediening !== undefined) return;
    /* Nul milliseconden: eerst tekenen, dan pas de aandacht verzetten. */
    const klok = setTimeout(() => invulvelden.current[0]?.focus({ preventScroll: true }), 0);
    return () => clearTimeout(klok);
    /* Alleen bij een andere vraag; niet bij elke toetsaanslag. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figuur]);

  /*
    Het schuifvak meenemen naar wat er toe doet.

    Zolang het kind invult is dat de steen die aan de beurt is; is het antwoord
    goed, dan de overkant, want daar springt de vos naartoe en ligt de sleutel.
    Past alles gewoon op het scherm, dan valt er niets te schuiven en gebeurt er
    hier niets.
  */
  useEffect(() => {
    const vak = rolvak.current;
    if (!vak) return;

    /*
      De toets op "past het wel" staat bewust ín `schuif` en niet hier.
      Stond hij hier, dan werd de meeluisteraar voor het draaien nooit
      aangezet zolang de rij toevallig paste — en dan gebeurt er ook niets
      meer zodra het scherm smaller wordt.
    */
    const schuif = (zacht: boolean) => {
      if (vak.scrollWidth <= vak.clientWidth) return;
      const gedrag = zacht ? ("smooth" as const) : ("auto" as const);
      if (fase !== "bezig") {
        vak.scrollTo({ left: vak.scrollWidth, behavior: gedrag });
        return;
      }
      const lege = figuur.stenen
        .map((w, i) => (w === null ? i : -1))
        .filter((i) => i >= 0);
      const steen = lege[actief] ?? 0;
      const plekken = steenPlekken(figuur.stenen.length, figuur.sprong, compact);
      const deel =
        (plekken[steen]?.x ?? 0) / breedteVoor(figuur.stenen.length, figuur.sprong, compact);
      const doel = deel * vak.scrollWidth - vak.clientWidth / 2 + 40;
      vak.scrollTo({ left: Math.max(0, doel), behavior: gedrag });
    };

    const klok = setTimeout(() => schuif(true), 60);
    /*
      Ook opnieuw bij het draaien van een tablet of het openklappen van een
      toetsenbord: de rij is dan ineens smaller of breder, en zonder dit staat
      het kind naar het verkeerde stuk van de beek te kijken.
    */
    const bijDraaien = () => schuif(false);
    window.addEventListener("resize", bijDraaien);
    return () => {
      clearTimeout(klok);
      window.removeEventListener("resize", bijDraaien);
    };
  }, [actief, fase, figuur, compact]);

  const uit = fase !== "bezig";

  /*
    De lege stenen zijn de invulvelden.

    Er ligt een echt invoerveld over elke lege steen — onzichtbaar, want de
    steen in de tekening ís het vak. Zo komt op een tablet het systeemtoetsenbord
    op met alleen cijfers, knippert de cursor waar getypt wordt, loopt Tab langs
    de stenen en is Enter hetzelfde als Controleer. Zie HARDE REGEL 5 in
    CLAUDE.md: er komt geen nagebouwd toetsenbord op het scherm.

    Niet bij de bosspellen die deze rij lenen: daar wordt gesleept, en daar
    staat de bediening in `sleepbediening`.
  */
  const velden = sleepbediening === undefined && fase === "bezig";
  const legeStenen = figuur.stenen
    .map((waarde, i) => (waarde === null ? i : -1))
    .filter((i) => i >= 0);
  const plekken = steenPlekken(figuur.stenen.length, figuur.sprong, compact);
  const tekenbreedte = breedteVoor(figuur.stenen.length, figuur.sprong, compact);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  /*
    Wat er op een steen getypt wordt.

    Alles wat geen cijfer is gaat eruit — plakken en de spraakknop kunnen er
    letters in krijgen — en hoogstens drie cijfers; verder komt een telrij tot
    honderd niet.
  */
  function typ(legeIndex: number, ruw: string) {
    if (uit) return;
    const nieuw = [...ingevuld];
    nieuw[legeIndex] = ruw.replace(/\D/g, "").slice(0, 3);
    onWijzig(nieuw);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/*
        De hele rij past, ook op een telefoon: op een smal scherm gaan de gaten,
        de oever en de marge krapper zitten. Het schuifvak blijft er als vangnet
        voor de uiterste instellingen — acht stenen met sprongen van tien — en
        schuift dan mee naar de steen die aan de beurt is.
      */}
      <div
        ref={rolvak}
        /*
          Op een smal scherm loopt de rij door de rand van de kaart heen. Die
          rand kost veertig pixels, en dat is op een telefoon het verschil
          tussen een cijfer van vijftien of van zeventien. De tekening heeft
          zijn eigen marge, dus hij plakt niet tegen de rand aan. Vanaf een
          tablet past alles ruim en staat het weer netjes binnen de kaart.
        */
        className="-mx-5 w-[calc(100%+2.5rem)] max-w-none overflow-x-auto overscroll-x-contain sm:mx-0 sm:w-full sm:max-w-[42rem]"
      >
        {/* De tekening met, bij een gewone vraag, de invulvelden er precies op. */}
        <div className="relative">
          <Steenrij
            compact={compact}
            figuur={figuur}
            ingevuld={ingevuld}
            actief={actief}
            goedeWaarden={goedeWaarden}
            fase={fase}
            vosOp={vos.op}
            vosLift={vos.lift}
            vosHouding={houding}
            sleutelOpOever={sleutelOpOever}
            vosTrappelt={fase === "bezig" && houding === "staand"}
            invoerErboven={velden}
            onKiesSteen={(index) => { setActief(index); onKiesSleepSteen?.(index); }}
          />

          {velden &&
            legeStenen.map((steen, legeIndex) => {
              const plek = plekken[steen];
              if (!plek) return null;
              return (
                <span
                  key={steen}
                  className="absolute [container-type:size]"
                  style={{
                    left: `${(plek.x / tekenbreedte) * 100}%`,
                    top: `${((plek.y - STEEN.hoogte / 2) / HOOGTE) * 100}%`,
                    width: `${(STEEN.breedte / tekenbreedte) * 100}%`,
                    height: `${(STEEN.hoogte / HOOGTE) * 100}%`,
                  }}
                >
                  <input
                    ref={(el) => {
                      invulvelden.current[legeIndex] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    enterKeyHint="done"
                    autoComplete="off"
                    value={ingevuld[legeIndex] ?? ""}
                    aria-label={`Getal op steen ${legeIndex + 1} van ${aantalLeeg}`}
                    /*
                      Geen eigen rand en geen eigen achtergrond: de steen in de
                      tekening ís het vak. Zonder `border-0` zet de browser er
                      zijn eigen randje omheen en staat er een kader binnen een
                      kader. Het cijfer staat in `cqw`, dus in procenten van de
                      steen: zo schaalt het mee met de rij zonder rekenwerk.
                    */
                    className="absolute inset-0 h-full w-full border-0 bg-transparent p-0 text-center font-extrabold text-inkt caret-huisstijl outline-none"
                    style={{ fontSize: "39cqw", lineHeight: 1 }}
                    onFocus={(e) => {
                      setActief(legeIndex);
                      onKiesSleepSteen?.(legeIndex);
                      bijAandacht(e.currentTarget);
                    }}
                    onBlur={bijWeggaan}
                    onChange={(e) => typ(legeIndex, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                        onBevestig?.();
                        return;
                      }
                      /* Met de pijltjes naar de volgende of vorige lege steen. */
                      const naar =
                        e.key === "ArrowRight" || e.key === "ArrowDown"
                          ? legeIndex + 1
                          : e.key === "ArrowLeft" || e.key === "ArrowUp"
                            ? legeIndex - 1
                            : null;
                      if (naar === null) return;
                      const doel = invulvelden.current[naar];
                      if (!doel) return;
                      e.preventDefault();
                      doel.focus();
                    }}
                  />
                </span>
              );
            })}
        </div>
      </div>

      {/* Welke steen er aan de beurt is, ook voor wie het niet ziet. */}
      {sleepbediening === undefined && aantalLeeg > 1 && fase === "bezig" && (
        <p className="text-sm font-bold text-inkt-zacht">
          Steen {actief + 1} van {aantalLeeg}. Tik een andere lege steen aan om te wisselen.
        </p>
      )}

      {sleepbediening}
    </div>
  );
}
