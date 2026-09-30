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
import { Gegeven, Invulvak } from "@/components/oefenen/Splitsopdracht";
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
    return (
      <div className="mx-auto w-fit">
        <div className="flex gap-2.5">
          {figuur.getallen.map((n, i) => (
            <Gegeven key={i} waarde={n} maat="klein" />
          ))}
        </div>
        <div aria-hidden="true" className="my-2 h-0.5 w-full rounded-full bg-inkt/70" />
        <div className="flex gap-2.5">
          {figuur.getallen.map((n, i) => (
            <Fragment key={i}>{vak(i, `Wat hoort er bij ${n}?`, "klein")}</Fragment>
          ))}
        </div>
      </div>
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
        getypt={getypt}
        uit={uit}
        vak={vak}
        onKaartje={(n) => {
          if (uit) return;
          const nieuw = [...getypt];
          const plek = nieuw.findIndex((w) => w === "");
          if (plek < 0) return;
          nieuw[plek] = String(n);
          /* Altijd van klein naar groot doorgeven; de volgorde telt niet mee. */
          const gevuld = nieuw.every((w) => w !== "");
          setGetypt(nieuw);
          onWijzig(
            gevuld
              ? nieuw
                  .map(Number)
                  .sort((a, b) => a - b)
                  .join(",")
              : "",
          );
        }}
        onLeeg={() => {
          if (uit) return;
          meld(Array.from({ length: aantal }, () => ""));
        }}
      />
    );
  }

  return (
    <Koppelsommen
      figuur={figuur}
      fase={fase}
      uit={uit}
      uitslagen={uitslagen}
      juist={juist}
      onWijzig={onWijzig}
    />
  );
}

// ---------------------------------------------------------------------------
// Kies twee getallen
// ---------------------------------------------------------------------------

/**
 * Zes kaartjes en een som met twee lege vakjes.
 *
 * Tikken op een kaartje vult het eerstvolgende lege vakje; typen mag ook. Met
 * de knop eronder maakt het kind de twee vakjes in één keer weer leeg, zodat
 * een misklik niet betekent dat er per vakje gewist moet worden.
 */
function Tweegetallen({
  figuur,
  getypt,
  uit,
  vak,
  onKaartje,
  onLeeg,
}: {
  figuur: Extract<Optelfiguur, { soort: "tweegetallen" }>;
  getypt: string[];
  uit: boolean;
  vak: (nummer: number, label: string, maat?: "gewoon" | "groot" | "klein") => React.ReactNode;
  onKaartje: (n: number) => void;
  onLeeg: () => void;
}) {
  const gekozen = getypt.filter((w) => w !== "").map(Number);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="grid w-full max-w-md grid-cols-3 gap-2.5">
        {figuur.getallen.map((n, i) => (
          <button
            key={i}
            type="button"
            disabled={uit}
            onClick={() => onKaartje(n)}
            className={`grid h-14 place-items-center rounded-2xl border-2 text-xl font-extrabold tabular-nums transition disabled:cursor-not-allowed ${
              gekozen.includes(n)
                ? "border-huisstijl bg-huisstijl-zacht text-inkt"
                : "border-geel bg-geel-zacht text-inkt"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        {vak(0, "Het eerste getal")}
        <span className="text-2xl font-extrabold text-inkt-zacht">+</span>
        {vak(1, "Het tweede getal")}
        <span className="text-2xl font-extrabold text-inkt-zacht">=</span>
        <Gegeven waarde={figuur.doel} />
      </div>

      {!uit && gekozen.length > 0 && (
        <button
          type="button"
          onClick={onLeeg}
          className="text-sm font-bold text-inkt-zacht underline underline-offset-4"
        >
          Opnieuw kiezen
        </button>
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
function Koppelsommen({
  figuur,
  fase,
  uit,
  uitslagen,
  juist,
  onWijzig,
}: {
  figuur: Extract<Optelfiguur, { soort: "koppelsommen" }>;
  fase: Fase;
  uit: boolean;
  uitslagen: ("goed" | "fout" | null)[];
  juist: number[];
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
                {s.eerste} + {s.tweede}
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
                    aria-label={`Uitkomst ${figuur.keuzes[welke]} bij ${s.eerste} plus ${s.tweede}`}
                    onPointerDown={(e) => pak(e, welke)}
                    className={`size-full rounded-xl [touch-action:none] ${bezig?.nummer === welke ? "opacity-30" : ""}`}
                  >
                    {figuur.keuzes[welke]}
                  </button>
                ) : null}
              </div>
              {uit && uitslag === "fout" && (
                <span className="text-sm font-extrabold text-groen-diep">{juist[rij]}</span>
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
