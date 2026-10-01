"use client";

/**
 * De opdrachten van het domein Optellen.
 *
 * Eén component voor alle negen, want ze delen alles wat telt: gele vakjes
 * voor wat gegeven is, witte vakjes waar het kind zelf iets invult, kaartjes
 * om aan te tikken, en verder zo min mogelijk op het scherm. Wat verschilt is
 * alleen hoe het op de kaart staat.
 *
 *   plaatjessom    twee groepjes voorwerpen, met de som eronder
 *   plussom        de kale som: 4 + 3 = ▢
 *   somkeuze       vier kaartjes; welke hoort er (niet) bij?
 *   aanvultabel    vier getallen op een rij, eronder lege vakjes
 *   evenveelsom    een som bovenaan en vier kaartjes eronder
 *   koppelsommen   vijf sommen met de uitkomsten ernaartoe te slepen
 *   viatien        7 + 7 = 10 + ▢ = ▢
 *   tweegetallen   zes kaartjes; welke twee maken samen het doelgetal?
 *   balans         5 + ▢ = 1 + 7
 *
 * ---------------------------------------------------------------------------
 * Dezelfde afspraken als bij Splitsen
 * ---------------------------------------------------------------------------
 * Geel is gegeven, wit is invullen, en de vakjes zelf komen uit hetzelfde
 * onderdeel — zo ziet een kind aan de kleur meteen wat er van hem gevraagd
 * wordt, in welk domein hij ook bezig is. Elk leeg vakje is een echt
 * invoerveld dat alleen cijfers toont en waarbij de oefening meeschuift als
 * het toetsenbord opengaat; er komt nergens een nagebouwd cijfertoetsenbord in
 * beeld (HARDE REGEL 5). Goed of fout laat het scherm pas zien nadat er op
 * Controleer is gedrukt.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import { Gegeven, Handje, Invulvak } from "@/components/oefenen/Splitsopdracht";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";
import { isTelplaatje } from "@/lib/telplaatjes";
import type { Figuur } from "@/lib/generatoren/soort";

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

/** De figuren die dit scherm tekent. */
export type Optelfiguur = Extract<
  Figuur,
  {
    soort:
      | "plaatjessom"
      | "plussom"
      | "somkeuze"
      | "aanvultabel"
      | "evenveelsom"
      | "koppelsommen"
      | "viatien"
      | "tweegetallen"
      | "balans";
  }
>;

const SOORTEN = [
  "plaatjessom",
  "plussom",
  "somkeuze",
  "aanvultabel",
  "evenveelsom",
  "koppelsommen",
  "viatien",
  "tweegetallen",
  "balans",
];

export function isOptelfiguur(figuur: Figuur | null | undefined): figuur is Optelfiguur {
  return figuur !== null && figuur !== undefined && SOORTEN.includes(figuur.soort);
}

/**
 * Wat er in de lege vakjes hoort, in de volgorde van het antwoord.
 *
 * Het staat niet in de vraag maar valt uit de tekening af te leiden. Zo kan dit
 * scherm na het nakijken elk vakje apart groen of rood kleuren.
 */
export function juisteAntwoorden(figuur: Optelfiguur): number[] {
  switch (figuur.soort) {
    case "plaatjessom": {
      const totaal = figuur.eerste + figuur.tweede;
      return figuur.stand === "som" ? [figuur.eerste, figuur.tweede, totaal] : [totaal];
    }
    case "plussom":
      return [figuur.eerste + figuur.tweede];
    case "somkeuze":
      return [
        figuur.stand === "nietbij"
          ? figuur.kaarten.findIndex((k) => k.eerste + k.tweede !== figuur.doel)
          : figuur.kaarten.findIndex((k) => k.eerste + k.tweede === k.uitkomst),
      ];
    case "aanvultabel":
      return figuur.getallen.map((n) => figuur.doel - n);
    case "evenveelsom": {
      const totaal = figuur.eerste + figuur.tweede;
      return [figuur.kaarten.findIndex((k) => k.eerste + k.tweede === totaal)];
    }
    case "koppelsommen":
      return figuur.sommen.map((s) => s.eerste + s.tweede);
    case "viatien": {
      const totaal = figuur.eerste + figuur.tweede;
      return [totaal - 10, totaal];
    }
    case "tweegetallen": {
      for (let i = 0; i < figuur.getallen.length; i++) {
        for (let j = i + 1; j < figuur.getallen.length; j++) {
          if (figuur.getallen[i] + figuur.getallen[j] === figuur.doel) {
            return [
              Math.min(figuur.getallen[i], figuur.getallen[j]),
              Math.max(figuur.getallen[i], figuur.getallen[j]),
            ];
          }
        }
      }
      return [0, 0];
    }
    default: {
      /* De balans: de volle kant uitrekenen, daar het bekende getal van af. */
      const leegLinks = figuur.links.includes(null);
      const volleKant = leegLinks
        ? (figuur.rechts[0] as number) + (figuur.rechts[1] as number)
        : (figuur.links[0] as number) + (figuur.links[1] as number);
      const bekend = (leegLinks ? figuur.links : figuur.rechts).find(
        (n): n is number => n !== null,
      );
      return [volleKant - (bekend ?? 0)];
    }
  }
}

/** Het grootste getal dat in een vakje kan komen; daarmee weet het scherm wanneer het vol is. */
function grootsteAntwoord(figuur: Optelfiguur): number {
  return Math.max(20, ...juisteAntwoorden(figuur));
}

/** Het opgeslagen antwoord terug naar één tekst per vakje. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord === "" ? [] : antwoord.split(",");
  return Array.from({ length: hoeveel }, (_, i) => delen[i] ?? "");
}

// ---------------------------------------------------------------------------
// De voorwerpen
// ---------------------------------------------------------------------------

/**
 * Twee kleuren, voor de oude zelfgetekende vormpjes hieronder.
 *
 * De voorwerpen van Plaatjes tellen hebben hun eigen kleuren; die groepjes
 * worden uit elkaar gehouden door het vlak eronder.
 */
const KLEUREN = [
  { vul: "var(--color-huisstijl)", rand: "var(--color-huisstijl-donker)" },
  { vul: "var(--color-viool)", rand: "var(--color-viool-diep)" },
];

/**
 * Eén zelfgetekend voorwerpje, in vier soorten.
 *
 * De plaatjes van Plaatjes tellen hebben dit vervangen, maar dit blijft staan
 * voor de soorten die daar niet bij zitten — het blaadje — zodat vragen die al
 * gemaakt zijn gewoon blijven werken.
 */
function Voorwerp({ soort, kleur }: { soort: string; kleur: (typeof KLEUREN)[number] }) {
  const vorm = () => {
    if (soort === "ster") {
      return (
        <path
          d="M12 3 14.6 9.2 21 9.8 16.2 14.1 17.6 20.4 12 17.1 6.4 20.4 7.8 14.1 3 9.8 9.4 9.2Z"
          fill={kleur.vul}
          stroke={kleur.rand}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      );
    }
    if (soort === "blaadje") {
      return (
        <>
          <path
            d="M20 4C11 4 4 9.5 4 17c0 1.6.4 2.4.4 2.4S12 20 16 16s4-12 4-12Z"
            fill={kleur.vul}
            stroke={kleur.rand}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M18 6 6 18" stroke={kleur.rand} strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    }
    if (soort === "eikel") {
      return (
        <>
          <path
            d="M6 11c0 5 2.7 9 6 9s6-4 6-9Z"
            fill={kleur.vul}
            stroke={kleur.rand}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <rect x="4.5" y="6" width="15" height="5.5" rx="2.4" fill={kleur.rand} />
          <path d="M12 3v3" stroke={kleur.rand} strokeWidth="1.6" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <circle cx="12" cy="14" r="7.5" fill={kleur.vul} stroke={kleur.rand} strokeWidth="1.4" />
        <path d="M12 6.5V4" stroke={kleur.rand} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12.5 5.5c2-1.6 4-1.4 4-1.4s-.4 2.2-2.4 2.8Z" fill={kleur.rand} />
      </>
    );
  };

  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      {vorm()}
    </svg>
  );
}

/** Nooit meer dan vijf naast elkaar; wat niet past, komt op een rij eronder. */
const PER_RIJ = 5;

/**
 * Hoe groot één voorwerp is.
 *
 * Klein genoeg dat de hele opdracht — vraagzin, twintig voorwerpen, de som en
 * de knop Controleer — op een laptopscherm past zonder te scrollen, en groot
 * genoeg om het voorwerp te herkennen. Op een smal scherm nog een maatje
 * kleiner.
 */
const MAAT = "size-[30px] shrink-0 sm:size-[38px]";

/**
 * Eén voorwerp: het plaatje van Plaatjes tellen, of anders de oude tekening.
 *
 * Dat er nog een terugval is, is met opzet: „blaadje” bestaat alleen als eigen
 * tekening, en vragen die daarmee gemaakt zijn moeten blijven werken.
 */
function Voorwerpje({ soort, kleur }: { soort: string; kleur: 0 | 1 }) {
  if (isTelplaatje(soort)) {
    return (
      <span className={"block " + MAAT}>
        <Telplaatje naam={soort} />
      </span>
    );
  }
  return <Voorwerp soort={soort} kleur={KLEUREN[kleur]} />;
}

/**
 * Een groepje voorwerpen.
 *
 * Rijtjes van hooguit vijf, links uitgelijnd, en wat niet past komt eronder.
 * Vijf is te overzien in één blik; tien naast elkaar niet, en dan gaat een kind
 * stuk voor stuk tellen. Dat het twee groepjes zijn, doet de ruimte ertussen:
 * de groepjes staan gewoon op de witte kaart, zonder vlak eronder.
 */
function Groepje({ aantal, soort, kleur }: { aantal: number; soort: string; kleur: 0 | 1 }) {
  const rijen: number[] = [];
  for (let rest = aantal; rest > 0; rest -= PER_RIJ) rijen.push(Math.min(PER_RIJ, rest));

  return (
    <span className="flex flex-col items-start gap-1.5">
      {rijen.map((inRij, r) => (
        <span key={r} className="flex items-center gap-1.5">
          {Array.from({ length: inRij }, (_, i) => (
            <Voorwerpje key={i} soort={soort} kleur={kleur} />
          ))}
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Kaartjes om aan te tikken
// ---------------------------------------------------------------------------

/** Een kaartje met een som of een getal erop; het kind kiest er een. */
function Kaartje({
  children,
  gekozen,
  uitslag,
  uit,
  groot = false,
  onKies,
}: {
  children: React.ReactNode;
  gekozen: boolean;
  uitslag: "goed" | "fout" | null;
  uit: boolean;
  groot?: boolean;
  onKies: () => void;
}) {
  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : gekozen
          ? "border-huisstijl bg-huisstijl-zacht text-inkt"
          : "border-rand bg-kaart text-inkt hover:border-huisstijl/50";

  return (
    <button
      type="button"
      disabled={uit}
      onClick={onKies}
      className={`grid min-h-16 place-items-center rounded-2xl border-2 px-4 font-extrabold tabular-nums transition disabled:cursor-not-allowed ${
        groot ? "text-2xl" : "text-xl"
      } ${kleur}`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Het scherm zelf
// ---------------------------------------------------------------------------

export function Optelopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Optelfiguur;
  antwoord: string;
  fase: Fase;
  /** Mag de cursor vanzelf in het eerste lege vakje gaan staan? Uit in beheer. */
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const juist = juisteAntwoorden(figuur);
  const aantal = juist.length;
  const grootste = grootsteAntwoord(figuur);
  /* Bij de keuze-opdrachten is het antwoord het nummer van een kaartje. */
  const kiest = figuur.soort === "somkeuze" || figuur.soort === "evenveelsom";

  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, aantal));
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setGetypt(Array.from({ length: aantal }, () => ""));
  }, [fase, aantal]);

  /* Bij een nieuwe vraag staat de cursor meteen in het eerste lege vakje. */
  useEffect(() => {
    if (!metCursor || kiest || fase !== "bezig") return;
    velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  /*
    Wat er per vakje goed of fout is.

    Bij "kies twee getallen" telt de volgorde niet mee — 7 en 12 is hetzelfde
    paar als 12 en 7 — dus daar is het paar als geheel goed of fout.
  */
  const paarGoed =
    figuur.soort === "tweegetallen" &&
    [...getypt]
      .map(Number)
      .sort((a, b) => a - b)
      .join(",") === juist.join(",");
  const uitslagen: ("goed" | "fout" | null)[] = !uit
    ? juist.map(() => null)
    : figuur.soort === "tweegetallen"
      ? juist.map(() => (paarGoed ? "goed" : "fout"))
      : juist.map((n, i) => (Number(getypt[i]) === n ? "goed" : "fout"));

  /** Doorgeven wat er staat; pas als alles gevuld is valt er iets na te kijken. */
  function meld(nieuw: string[]) {
    setGetypt(nieuw);
    onWijzig(nieuw.every((w) => w !== "") ? nieuw.join(",") : "");
  }

  function typ(nummer: number, tekst: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[nummer] = tekst;
    meld(nieuw);

    /* Is dit vakje vol, dan springt de cursor door naar het volgende lege. */
    if (!metCursor || tekst === "" || Number(tekst) * 10 <= grootste) return;
    const volgende = nieuw.findIndex((w, i) => i > nummer && w === "");
    if (volgende >= 0) velden.current[volgende]?.focus();
  }

  /** Eén invulvak, met alles eromheen al ingevuld. */
  function vak(nummer: number, label: string, maat: "gewoon" | "groot" | "klein" = "gewoon") {
    return (
      <Invulvak
        waarde={getypt[nummer] ?? ""}
        uitslag={uitslagen[nummer] ?? null}
        maat={maat}
        label={label}
        uit={uit}
        veldRef={(el) => {
          velden.current[nummer] = el;
        }}
        onTyp={(tekst) => typ(nummer, tekst)}
        onBevestig={onBevestig}
        onVolgende={() => velden.current[nummer + 1]?.focus()}
      />
    );
  }

  /** Een kaartje kiezen: het nummer ervan ís het antwoord. */
  function kies(nummer: number) {
    if (uit) return;
    meld([String(nummer)]);
  }

  const teken = <span className="text-2xl font-extrabold text-inkt-zacht">+</span>;
  const isgelijk = <span className="text-2xl font-extrabold text-inkt-zacht">=</span>;

  if (figuur.soort === "plaatjessom") {
    const heleSom = figuur.stand === "som";
    return (
      /*
        Vier kolommen: het eerste groepje, het plusteken, het tweede groepje en
        dan „= ▢”. Zo staat elk getal van de som recht onder zijn eigen groepje
        en staat de hele som op één regel, op dezelfde hoogte. Tussen de
        plaatjes zelf staat geen plusteken: daar doet de ruimte het werk.
      */
      <div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-center justify-items-center gap-x-4 gap-y-3 sm:gap-x-7">
        <Groepje aantal={figuur.eerste} soort={figuur.voorwerp} kleur={0} />
        <span />
        <Groepje aantal={figuur.tweede} soort={figuur.voorwerp} kleur={1} />
        <span />

        {heleSom ? vak(0, "Het eerste groepje") : <Gegeven waarde={figuur.eerste} />}
        {teken}
        {heleSom ? vak(1, "Het tweede groepje") : <Gegeven waarde={figuur.tweede} />}
        <span className="flex items-center gap-3">
          {isgelijk}
          {vak(heleSom ? 2 : 0, "Hoeveel samen?")}
        </span>
      </div>
    );
  }

  if (figuur.soort === "plussom") {
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Gegeven waarde={figuur.eerste} maat="groot" />
        {teken}
        <Gegeven waarde={figuur.tweede} maat="groot" />
        {isgelijk}
        {vak(0, "De uitkomst", "groot")}
      </div>
    );
  }

  if (figuur.soort === "somkeuze") {
    const gekozen = getypt[0] === "" ? -1 : Number(getypt[0]);
    return (
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
        {figuur.kaarten.map((k, i) => (
          <Kaartje
            key={i}
            gekozen={gekozen === i}
            uitslag={uit && gekozen === i ? (uitslagen[0] ?? null) : uit && i === juist[0] ? "goed" : null}
            uit={uit}
            groot
            onKies={() => kies(i)}
          >
            {figuur.stand === "klopt"
              ? `${k.eerste} + ${k.tweede} = ${k.uitkomst}`
              : `${k.eerste} + ${k.tweede}`}
          </Kaartje>
        ))}
      </div>
    );
  }

  if (figuur.soort === "evenveelsom") {
    const gekozen = getypt[0] === "" ? -1 : Number(getypt[0]);
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <Gegeven waarde={figuur.eerste} />
          {teken}
          <Gegeven waarde={figuur.tweede} />
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {figuur.kaarten.map((k, i) => (
            <Kaartje
              key={i}
              gekozen={gekozen === i}
              uitslag={uit && gekozen === i ? (uitslagen[0] ?? null) : uit && i === juist[0] ? "goed" : null}
              uit={uit}
              groot
              onKies={() => kies(i)}
            >
              {k.eerste} + {k.tweede}
            </Kaartje>
          ))}
        </div>
      </div>
    );
  }

  if (figuur.soort === "aanvultabel") {
    /*
      Een echte tabel, zoals op school: lijnen om én tussen alle vakken, even
      dik aan de buitenkant als binnenin. Daarom een `<table>` met
      `border-collapse` en geen rijtjes losse vakjes — dan valt er geen enkele
      lijn dubbel of weg, en hoeft er geen aparte streep tussen de twee rijen.

      Boven staat wat gegeven is: het hele vak is zachtgeel, niet een geel
      kaartje in een vak. Onder staat in elk vak een wit invulvakje, een maatje
      kleiner dan het vak zelf.
    */
    const HOKJE = "size-16 border-2 border-tabellijn p-0 sm:size-[4.25rem]";
    return (
      <table className="mx-auto border-collapse">
        <tbody>
          <tr>
            {figuur.getallen.map((n, i) => (
              <td
                key={i}
                className={`${HOKJE} bg-geel-zacht text-center text-2xl font-extrabold tabular-nums text-inkt sm:text-3xl`}
              >
                {n}
              </td>
            ))}
          </tr>
          <tr>
            {figuur.getallen.map((n, i) => (
              <td key={i} className={HOKJE}>
                <span className="grid place-items-center">
                  {vak(i, `Wat hoort er bij ${n}?`, "klein")}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  }

  if (figuur.soort === "viatien") {
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
        <Gegeven waarde={figuur.eerste} />
        {teken}
        <Gegeven waarde={figuur.tweede} />
        {isgelijk}
        <Gegeven waarde={10} />
        {teken}
        {vak(0, "Hoeveel blijft er over?")}
        {isgelijk}
        {vak(1, "De uitkomst")}
      </div>
    );
  }

  if (figuur.soort === "balans") {
    const kant = (getallen: (number | null)[], vanaf: number) => (
      <span className="flex items-center gap-2.5">
        {getallen[0] === null ? vak(vanaf, "Het lege vakje") : <Gegeven waarde={getallen[0]} />}
        {teken}
        {getallen[1] === null ? vak(vanaf, "Het lege vakje") : <Gegeven waarde={getallen[1]} />}
      </span>
    );
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
        {kant(figuur.links, 0)}
        {isgelijk}
        {kant(figuur.rechts, 0)}
      </div>
    );
  }

  if (figuur.soort === "tweegetallen") {
    return (
      <Tweegetallen
        figuur={figuur}
        fase={fase}
        uit={uit}
        metCursor={metCursor}
        uitslagen={uitslagen}
        onKiezen={(paar) => {
          if (uit) return;
          const nieuw = paar.map((n) => (n === null ? "" : String(n)));
          setGetypt(nieuw);
          /* Altijd van klein naar groot doorgeven; de volgorde telt niet mee. */
          onWijzig(
            nieuw.every((w) => w !== "")
              ? nieuw
                  .map(Number)
                  .sort((a, b) => a - b)
                  .join(",")
              : "",
          );
        }}
      />
    );
  }

  /*
    Het koppelen houdt zijn eigen sleepstand bij en meldt per rij de uitkomst.
    Die melding wordt hier ook in `getypt` gezet, want daar leest het nakijken
    uit welke rij goed of fout is. Zonder dat werd elke rij rood, ook de rijen
    die wél klopten.
  */
  return (
    <Koppelsommen
      figuur={figuur}
      fase={fase}
      uit={uit}
      uitslagen={uitslagen}
      onWijzig={(waarde) => {
        setGetypt(uitAntwoord(waarde, aantal));
        onWijzig(waarde);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Kies twee getallen
// ---------------------------------------------------------------------------

/** Waar een kaartje ligt: in de rij bovenaan, of in een van de twee vakjes. */
type Kaartplek = "rij" | 0 | 1;

/**
 * Of het handje bij dit type al is voorgedaan.
 *
 * Bewust naast de component, net als bij Verdelen: elke vraag krijgt een eigen
 * exemplaar van dit scherm, en het handje hoort maar één keer per oefening te
 * komen.
 */
let handjeGetoondTweegetallen = false;

/**
 * De maat van een getalkaartje.
 *
 * Even groot en even vierkant als de vakjes in de som eronder, zodat te zien
 * is dat het kaartje precies in zo'n vakje hoort. `KAART` is de maat in
 * pixels, voor het kaartje dat los onder de vinger meereist.
 */
const KAARTMAAT = "size-16 text-2xl sm:size-[4.25rem] sm:text-3xl";
const KAART = 64;

/**
 * Zes kaartjes en een som met twee lege vakjes.
 *
 * ---------------------------------------------------------------------------
 * Slepen, net als bij Verdelen in twee groepen
 * ---------------------------------------------------------------------------
 * Het kind sleept een getalkaartje naar een van de twee vakjes in de som. Het
 * kaartje hangt onder de vinger, het hele vakje telt als doel en licht op
 * zodra je erboven hangt, en loslaten naast een vakje brengt het kaartje terug.
 * Eén tik op een kaartje legt het in het eerste lege vakje; een tik op een
 * gevuld vakje haalt het kaartje er weer uit. Dat gaat met pointer-events,
 * want die gelden voor muis, vinger én pen.
 *
 * Een kaartje dat in een vakje ligt, is uit de rij verdwenen — op zijn plek
 * blijft een leeg hokje staan, zodat de rij niet verspringt en het kaartje
 * straks weer op zijn eigen plek terugkomt. Zo kan hetzelfde getal nooit twee
 * keer gebruikt worden. Sleep je een kaartje naar een vakje waar al iets in
 * ligt, dan gaat dat oude getal terug naar de rij.
 *
 * De volgorde telt niet mee bij het nakijken: 14 + 1 is hetzelfde paar als
 * 1 + 14. Daarom is het paar als geheel goed of fout.
 */
function Tweegetallen({
  figuur,
  fase,
  uit,
  metCursor,
  uitslagen,
  onKiezen,
}: {
  figuur: Extract<Optelfiguur, { soort: "tweegetallen" }>;
  fase: Fase;
  uit: boolean;
  /** Bij het kind: dan wordt het handje één keer voorgedaan. Uit in beheer. */
  metCursor: boolean;
  uitslagen: ("goed" | "fout" | null)[];
  onKiezen: (paar: (number | null)[]) => void;
}) {
  /** Welk kaartje (de plek in de rij) er in vakje 0 en vakje 1 ligt. */
  const [inVak, setInVak] = useState<(number | null)[]>([null, null]);
  /** Welk kaartje er nu in de hand is, en waar het vandaan komt. */
  const [bezig, setBezig] = useState<{ kaart: number; vanaf: Kaartplek } | null>(null);
  /** Waar de vinger is, zodat het kaartje eronder mee kan reizen. */
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  /** Boven welk vakje de vinger hangt; dat vakje licht op. */
  const [boven, setBoven] = useState<Kaartplek | null>(null);

  const vakken = useRef<{ rij: HTMLDivElement | null; vak: (HTMLDivElement | null)[] }>({
    rij: null,
    vak: [null, null],
  });

  /*
    Tik of sleep? Aan het begin van het gebaar is dat niet te zien. Daarom
    wordt bijgehouden of de vinger echt een stuk verplaatst is; een paar pixels
    tellen niet mee, want een kindervinger staat nooit helemaal stil.
  */
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);
  const SLEEPGRENS = 8;

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setInVak([null, null]);
  }, [fase]);

  /*
    Het handje dat één keer voordoet hoe het werkt: het pakt het eerste kaartje
    op, brengt het naar het eerste vakje en zet het weer terug — zonder dat er
    iets verandert aan wat er ligt. Daarna komt het deze oefening niet meer
    terug. De vlag gaat pas in het laatste klokje om; zie Verdelen.
  */
  const [handje, setHandje] = useState<{ x: number; y: number } | null>(null);
  const strook = useRef<HTMLDivElement | null>(null);
  const eersteKaart = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!metCursor || uit || handjeGetoondTweegetallen) return;

    const klokjes: number[] = [];
    const meet = () => {
      const buiten = strook.current?.getBoundingClientRect();
      const start = eersteKaart.current?.getBoundingClientRect();
      const doel = vakken.current.vak[0]?.getBoundingClientRect();
      if (!buiten || !start || !doel) return null;
      return {
        van: {
          x: start.left - buiten.left + start.width / 2,
          y: start.top - buiten.top + start.height / 2,
        },
        naar: {
          x: doel.left - buiten.left + doel.width / 2,
          y: doel.top - buiten.top + doel.height / 2,
        },
      };
    };

    klokjes.push(
      window.setTimeout(() => {
        const plekken = meet();
        if (!plekken) return;
        setHandje(plekken.van);
        klokjes.push(window.setTimeout(() => setHandje(plekken.naar), 700));
        klokjes.push(window.setTimeout(() => setHandje(plekken.van), 1900));
        klokjes.push(
          window.setTimeout(() => {
            setHandje(null);
            handjeGetoondTweegetallen = true;
          }, 3100),
        );
      }, 600),
    );

    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [metCursor, uit]);

  /** Een kaartje ergens neerleggen; wat er lag, gaat terug naar de rij. */
  function leg(kaart: number, naar: Kaartplek) {
    if (uit) return;
    const nieuw = [...inVak];
    for (let i = 0; i < nieuw.length; i++) if (nieuw[i] === kaart) nieuw[i] = null;
    if (naar !== "rij") nieuw[naar] = kaart;
    setInVak(nieuw);
    onKiezen(nieuw.map((k) => (k === null ? null : figuur.getallen[k])));
  }

  /** Boven welk vakje hangt de vinger? `null` = ernaast. */
  function plekOnder(x: number, y: number): Kaartplek | null {
    for (const nummer of [0, 1] as const) {
      const r = vakken.current.vak[nummer]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return nummer;
    }
    const r = vakken.current.rij?.getBoundingClientRect();
    if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return "rij";
    return null;
  }

  function pak(e: React.PointerEvent, kaart: number, vanaf: Kaartplek) {
    if (uit) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Lukt het vasthouden niet, dan werkt het slepen nog wel — minder vergevend. */
    }
    setBezig({ kaart, vanaf });
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(plekOnder(e.clientX, e.clientY));
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const begin = beginpunt.current;
    if (begin && Math.hypot(e.clientX - begin.x, e.clientY - begin.y) > SLEEPGRENS) {
      verplaatst.current = true;
    }
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(plekOnder(e.clientX, e.clientY));
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    const doel = plekOnder(e.clientX, e.clientY);
    const { kaart, vanaf } = bezig;
    setBezig(null);
    setZweef(null);
    setBoven(null);

    /*
      Nauwelijks bewogen? Dan was het een tik: vanuit de rij naar het eerste
      lege vakje, en vanuit een vakje weer terug naar de rij.
    */
    if (!verplaatst.current) {
      if (vanaf !== "rij") {
        leg(kaart, "rij");
        return;
      }
      const leeg = inVak.findIndex((k) => k === null);
      if (leeg >= 0) leg(kaart, leeg as 0 | 1);
      return;
    }

    /* Naast alles losgelaten: het kaartje blijft waar het lag. */
    if (doel === null) return;
    leg(kaart, doel);
  }

  /** Eén getalkaartje: geel, met het getal erop. */
  const kaartje = (kaart: number, vanaf: Kaartplek, eerste = false) => (
    <button
      ref={eerste ? eersteKaart : undefined}
      type="button"
      disabled={uit}
      aria-label={`Kaartje ${figuur.getallen[kaart]}`}
      onPointerDown={(e) => pak(e, kaart, vanaf)}
      className={`grid ${KAARTMAAT} shrink-0 cursor-grab select-none place-items-center rounded-2xl border-2 border-geel bg-geel-zacht font-extrabold tabular-nums text-inkt transition [touch-action:none] active:cursor-grabbing disabled:cursor-not-allowed ${
        bezig?.kaart === kaart ? "opacity-30" : ""
      }`}
    >
      {figuur.getallen[kaart]}
    </button>
  );

  /** De rand van een vakje: groen of rood na het nakijken, anders licht. */
  const vakStijl = (nummer: 0 | 1) => {
    if (uitslagen[nummer] === "goed") return "border-groen bg-groen-zacht text-groen-diep";
    if (uitslagen[nummer] === "fout") return "border-roze bg-roze-zacht text-roze";
    /* Boven het vakje waar de vinger hangt: vol aan. Met een kaartje in de
       hand: allebei zacht, zodat een kind ziet waar het naartoe kan. */
    if (boven === nummer) return "border-huisstijl bg-huisstijl-zacht text-inkt";
    if (bezig !== null) return "border-huisstijl/50 bg-huisstijl-zacht/50 text-inkt";
    return "border-rand bg-kaart text-inkt";
  };

  const gebruikt = (kaart: number) => inVak.includes(kaart);

  return (
    <div
      ref={strook}
      className={`relative flex w-full flex-col items-center gap-5 ${
        bezig !== null ? "cursor-grabbing" : ""
      }`}
      onPointerDown={(e) => {
        /* Elk nieuw gebaar begint als een tik, tot de vinger echt beweegt. */
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/*
        De rij kaartjes. Wat in een vakje ligt, laat hier een leeg hokje achter.

        Zes naast elkaar als dat past, anders twee rijen van drie. Dat hangt af
        van de ruimte die de kaart zelf overhoudt en niet van de breedte van
        het scherm — vandaar een container-query en geen `sm:`. Zes kaartjes
        van hooguit 68 px met lucht ertussen hebben net geen 30rem nodig.
      */}
      <div className="@container w-full">
        <div
          ref={(el) => {
            vakken.current.rij = el;
          }}
          className="mx-auto grid w-fit grid-cols-3 justify-items-center gap-2.5 [touch-action:none] @[30rem]:grid-cols-6"
        >
          {figuur.getallen.map((n, i) =>
            gebruikt(i) ? (
              <span
                key={i}
                aria-hidden="true"
                className={`${KAARTMAAT} block rounded-2xl border-2 border-dashed border-rand`}
              />
            ) : (
              <Fragment key={i}>{kaartje(i, "rij", i === 0)}</Fragment>
            ),
          )}
        </div>
      </div>

      {/* De som: twee vakjes om een kaartje in te leggen, en het doelgetal. */}
      <div className="flex items-center gap-2.5">
        {([0, 1] as const).map((nummer) => (
          <Fragment key={nummer}>
            {nummer === 1 && <span className="text-2xl font-extrabold text-inkt-zacht">+</span>}
            <div
              ref={(el) => {
                vakken.current.vak[nummer] = el;
              }}
              aria-label={nummer === 0 ? "Het eerste getal" : "Het tweede getal"}
              onPointerDown={(e) => {
                const kaart = inVak[nummer];
                if (kaart !== null) pak(e, kaart, nummer);
              }}
              className={`grid ${KAARTMAAT} place-items-center rounded-2xl border-2 font-extrabold tabular-nums transition [touch-action:none] ${
                inVak[nummer] !== null && !uit ? "cursor-grab active:cursor-grabbing" : ""
              } ${vakStijl(nummer)}`}
            >
              {inVak[nummer] === null ? (
                <span className="text-inkt-zacht/60">?</span>
              ) : (
                figuur.getallen[inVak[nummer] as number]
              )}
            </div>
          </Fragment>
        ))}
        <span className="text-2xl font-extrabold text-inkt-zacht">=</span>
        <Gegeven waarde={figuur.doel} />
      </div>

      {!uit && inVak.some((k) => k !== null) && (
        <button
          type="button"
          onClick={() => {
            setInVak([null, null]);
            onKiezen([null, null]);
          }}
          className="text-sm font-bold text-inkt-zacht underline underline-offset-4"
        >
          Opnieuw kiezen
        </button>
      )}

      {/*
        Het handje dat één keer voordoet wat de bedoeling is. Het reageert
        nergens op; het kind kan er gewoon doorheen tikken.
      */}
      {handje && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-20 transition-all duration-700 ease-in-out"
          style={{ left: handje.x - KAART / 2, top: handje.y - KAART / 2 }}
        >
          <span className="relative block">
            <span
              className="grid place-items-center rounded-2xl border-2 border-geel bg-geel-zacht text-2xl font-extrabold tabular-nums text-inkt shadow-op"
              style={{ width: KAART, height: KAART }}
            >
              {figuur.getallen[0]}
            </span>
            <span className="absolute left-8 top-9">
              <Handje />
            </span>
          </span>
        </span>
      )}

      {/* Het kaartje dat met de vinger meereist. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] grid place-items-center rounded-2xl border-2 border-geel bg-geel-zacht text-2xl font-extrabold tabular-nums text-inkt shadow-op"
          style={{
            left: zweef.x - KAART / 2,
            top: zweef.y - KAART / 2,
            width: KAART,
            height: KAART,
          }}
        >
          {figuur.getallen[bezig.kaart]}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Koppel de som aan de uitkomst
// ---------------------------------------------------------------------------

type Uitkomstplek = "voorraad" | number;

/**
 * Vijf sommen met een leeg vak ernaast, en de uitkomsten los eronder.
 *
 * Het slepen werkt precies zoals bij "Verdelen in twee groepen": de kaart
 * hangt onder de vinger, het vak waar je boven hangt licht op, en losaten
 * naast een vak legt hem terug. Eén tik verplaatst hem ook — naar het eerste
 * lege vak, en vanuit een vak weer terug naar beneden.
 */
export function Koppelsommen({
  figuur,
  fase,
  uit,
  uitslagen,
  teken = "+",
  onWijzig,
}: {
  figuur: { sommen: { eerste: number; tweede: number }[]; keuzes: number[] };
  fase: Fase;
  uit: boolean;
  uitslagen: ("goed" | "fout" | null)[];
  /** Het teken tussen de twee getallen; "−" bij de erafsommen. */
  teken?: string;
  onWijzig: (waarde: string) => void;
}) {
  /* Waar elke losse uitkomst ligt: beneden, of bij som nummer zoveel. */
  const [plek, setPlek] = useState<Uitkomstplek[]>(() => figuur.keuzes.map(() => "voorraad"));
  const [bezig, setBezig] = useState<{ nummer: number; vanaf: Uitkomstplek } | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const [boven, setBoven] = useState<Uitkomstplek | null>(null);

  const vakken = useRef<(HTMLDivElement | null)[]>([]);
  const voorraadRef = useRef<HTMLDivElement | null>(null);
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);
  const SLEEPGRENS = 8;

  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setPlek(figuur.keuzes.map(() => "voorraad"));
  }, [fase, figuur.keuzes]);

  function leg(nummer: number, naar: Uitkomstplek) {
    if (uit) return;
    const nieuw = [...plek];
    /* In een vak past er maar één; wie er lag gaat terug naar beneden. */
    if (naar !== "voorraad") {
      nieuw.forEach((p, i) => {
        if (p === naar) nieuw[i] = "voorraad";
      });
    }
    nieuw[nummer] = naar;
    setPlek(nieuw);

    const perRij = figuur.sommen.map((_, rij) => {
      const welke = nieuw.findIndex((p) => p === rij);
      return welke < 0 ? "" : String(figuur.keuzes[welke]);
    });
    onWijzig(perRij.every((w) => w !== "") ? perRij.join(",") : "");
  }

  function vakOnder(x: number, y: number): Uitkomstplek | null {
    for (let i = 0; i < vakken.current.length; i++) {
      const el = vakken.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    const v = voorraadRef.current?.getBoundingClientRect();
    if (v && x >= v.left && x <= v.right && y >= v.top && y <= v.bottom) return "voorraad";
    return null;
  }

  function pak(e: React.PointerEvent, nummer: number) {
    if (uit) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Lukt het vasthouden niet, dan werkt het slepen nog wel. */
    }
    setBezig({ nummer, vanaf: plek[nummer] });
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(vakOnder(e.clientX, e.clientY));
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const begin = beginpunt.current;
    if (begin && Math.hypot(e.clientX - begin.x, e.clientY - begin.y) > SLEEPGRENS) {
      verplaatst.current = true;
    }
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(vakOnder(e.clientX, e.clientY));
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    const doel = vakOnder(e.clientX, e.clientY);
    const { nummer, vanaf } = bezig;
    setBezig(null);
    setZweef(null);
    setBoven(null);

    /* Nauwelijks bewogen? Dan was het een tik. */
    if (!verplaatst.current) {
      if (vanaf === "voorraad") {
        const leegVak = figuur.sommen.findIndex((_, rij) => !plek.includes(rij));
        if (leegVak >= 0) leg(nummer, leegVak);
      } else {
        leg(nummer, "voorraad");
      }
      return;
    }
    if (doel === null) return;
    leg(nummer, doel);
  }

  /** Eén los getal om te slepen. */
  const kaart = (nummer: number) => (
    <button
      key={nummer}
      type="button"
      disabled={uit}
      aria-label={`Uitkomst ${figuur.keuzes[nummer]}`}
      onPointerDown={(e) => pak(e, nummer)}
      className={`grid size-12 place-items-center rounded-2xl border-2 border-geel bg-geel-zacht text-xl font-extrabold tabular-nums text-inkt transition [touch-action:none] disabled:cursor-not-allowed ${
        bezig?.nummer === nummer ? "opacity-30" : ""
      }`}
    >
      {figuur.keuzes[nummer]}
    </button>
  );

  const inVak = (rij: number) => plek.findIndex((p) => p === rij);

  /** Wat er bij een rij hoort; het teken bepaalt of er bij of af gaat. */
  const hoortBij = (s: { eerste: number; tweede: number }) =>
    teken === "+" ? s.eerste + s.tweede : s.eerste - s.tweede;

  return (
    <div
      className="relative flex w-full flex-col items-center gap-4"
      onPointerDown={(e) => {
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      <div className="flex flex-col gap-2">
        {figuur.sommen.map((s, rij) => {
          const welke = inVak(rij);
          const uitslag = uitslagen[rij] ?? null;
          const rand =
            uitslag === "goed"
              ? "border-groen bg-groen-zacht text-groen-diep"
              : uitslag === "fout"
                ? "border-roze bg-roze-zacht text-roze"
                : boven === rij
                  ? "border-huisstijl bg-huisstijl-zacht"
                  : "border-rand bg-kaart";
          return (
            <div key={rij} className="flex items-center gap-3">
              <span className="w-24 text-right text-xl font-extrabold tabular-nums text-inkt">
                {s.eerste} {teken} {s.tweede}
              </span>
              <span className="text-xl font-extrabold text-inkt-zacht">=</span>
              <div
                ref={(el) => {
                  vakken.current[rij] = el;
                }}
                className={`grid size-12 place-items-center rounded-2xl border-2 text-xl font-extrabold tabular-nums transition [touch-action:none] ${rand}`}
              >
                {welke >= 0 ? (
                  <button
                    type="button"
                    disabled={uit}
                    aria-label={`Uitkomst ${figuur.keuzes[welke]} bij ${s.eerste} ${teken === "+" ? "plus" : "min"} ${s.tweede}`}
                    onPointerDown={(e) => pak(e, welke)}
                    className={`size-full rounded-xl [touch-action:none] ${bezig?.nummer === welke ? "opacity-30" : ""}`}
                  >
                    {figuur.keuzes[welke]}
                  </button>
                ) : null}
              </div>
              {uit && uitslag === "fout" && (
                <span className="text-sm font-extrabold text-groen-diep">{hoortBij(s)}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* De losse uitkomsten die nog geplaatst moeten worden. */}
      <div
        ref={voorraadRef}
        className={`flex min-h-14 w-full max-w-sm flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2 transition [touch-action:none] ${
          boven === "voorraad" ? "border-huisstijl bg-huisstijl-zacht" : "border-rand"
        }`}
      >
        {plek.map((p, i) => (p === "voorraad" ? kaart(i) : null))}
      </div>

      {/* Het getal dat met de vinger meereist. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] grid size-12 place-items-center rounded-2xl border-2 border-geel bg-geel-zacht text-xl font-extrabold tabular-nums text-inkt shadow-op"
          style={{ left: zweef.x - 24, top: zweef.y - 24 }}
        >
          {figuur.keuzes[bezig.nummer]}
        </span>
      )}
    </div>
  );
}
