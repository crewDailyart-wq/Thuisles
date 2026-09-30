"use client";

/**
 * De vijf opdrachten van het domein Splitsen.
 *
 * Eén component voor alle vijf, want ze delen alles wat telt: gele vakjes voor
 * wat gegeven is, witte vakjes waar het kind zelf iets invult, en verder zo
 * min mogelijk op het scherm. Wat verschilt is alleen hoe de vakjes staan.
 *
 *   splitstabel      een tabel met rijen — of het splitshuis met raampjes
 *   aanvullen        twee vakjes met klein erboven waar het samen op uitkomt
 *   splitsschema     het hele getal met twee pijltjes naar twee vakjes — of
 *                    de kersen aan hun steeltjes
 *   verdelen         kralen die het kind naar twee vakken sleept
 *   splitsdriehoek   drie vakken in een driehoek, drie sommen eromheen
 *
 * ---------------------------------------------------------------------------
 * Geel is gegeven, wit is invullen
 * ---------------------------------------------------------------------------
 * Die afspraak geldt in alle vijf, en er staat verder geen uitleg bij. Een kind
 * hoeft maar één keer te leren dat het in de witte vakjes iets moet doen; daarna
 * herkent het elke nieuwe opdracht meteen. Oranje blijft van de knoppen.
 *
 * ---------------------------------------------------------------------------
 * Het toetsenbord
 * ---------------------------------------------------------------------------
 * Elk leeg vakje is een echt invoerveld dat alleen cijfers toont en waarbij de
 * oefening meeschuift als het toetsenbord opengaat. Er komt dus nergens een
 * nagebouwd cijfertoetsenbord in beeld; zie HARDE REGEL 5 in CLAUDE.md.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import { Vosbeeld, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import type { Figuur } from "@/lib/generatoren/soort";

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

/** De figuren die dit scherm tekent. */
export type Splitsfiguur = Extract<
  Figuur,
  { soort: "splitstabel" | "aanvullen" | "splitsschema" | "verdelen" | "splitsdriehoek" }
>;

export function isSplitsfiguur(figuur: Figuur | null | undefined): figuur is Splitsfiguur {
  return (
    figuur !== null &&
    figuur !== undefined &&
    (figuur.soort === "splitstabel" ||
      figuur.soort === "aanvullen" ||
      figuur.soort === "splitsschema" ||
      figuur.soort === "verdelen" ||
      figuur.soort === "splitsdriehoek")
  );
}

/**
 * Wat er in de lege vakjes hoort, in dezelfde volgorde als het antwoord.
 *
 * Het staat niet in de vraag maar valt uit de tekening af te leiden, en dat is
 * met opzet: zo kan dit scherm na het nakijken elk vakje apart groen of rood
 * kleuren zonder dat het goede antwoord al in de figuur meegestuurd hoeft te
 * worden.
 */
export function juisteAntwoorden(figuur: Splitsfiguur): number[] {
  if (figuur.soort === "splitstabel") return figuur.gegeven.map((n) => figuur.doel - n);
  if (figuur.soort === "aanvullen") return [figuur.doel - figuur.gegeven];
  if (figuur.soort === "splitsschema") {
    const gegeven = figuur.links ?? figuur.rechts ?? 0;
    return [figuur.geheel - gegeven];
  }
  if (figuur.soort === "verdelen") {
    const links = (figuur.aantal + figuur.verschil) / 2;
    return [links, figuur.aantal - links];
  }
  /* De driehoek: eerst linksonder, dan links, dan rechts. */
  const boven = figuur.boven ?? 0;
  const rechtsonder = figuur.rechtsonder ?? 0;
  const onder = figuur.onder ?? 0;
  const linksonder = onder - rechtsonder;
  return [linksonder, boven + linksonder, boven + rechtsonder];
}

/** Het opgeslagen antwoord terug naar één tekst per vakje. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord === "" ? [] : antwoord.split(",");
  return Array.from({ length: hoeveel }, (_, i) => delen[i] ?? "");
}

/**
 * In welke volgorde de cursor langs de vakjes gaat: van boven naar beneden en
 * van links naar rechts, zoals een kind leest.
 *
 * Dat is niet altijd de volgorde van het antwoord. Bij de driehoek staat het
 * vak linksonder als eerste in het antwoord — dat is de volgorde waarin de
 * sommen zijn opgeslagen — maar op het scherm staan de twee zijkanten hoger.
 */
function leesvolgorde(figuur: Splitsfiguur): number[] {
  if (figuur.soort === "splitsdriehoek") return [1, 2, 0];
  return juisteAntwoorden(figuur).map((_, i) => i);
}

/**
 * Het grootste getal dat in een vakje kan komen te staan.
 *
 * Hiermee weet het scherm wanneer een vakje vol is: kan er geen cijfer meer
 * bij zonder dat het getal te groot wordt, dan is het kind klaar met dit vakje
 * en mag de cursor door naar het volgende. Het is een bovengrens van de
 * opdracht zelf en verklapt dus geen antwoord.
 */
function grootsteAntwoord(figuur: Splitsfiguur): number {
  if (figuur.soort === "splitstabel" || figuur.soort === "aanvullen") return figuur.doel - 1;
  if (figuur.soort === "splitsschema") return figuur.geheel;
  if (figuur.soort === "verdelen") return figuur.aantal;
  return Math.max(
    ...juisteAntwoorden(figuur),
    figuur.boven ?? 0,
    figuur.onder ?? 0,
    figuur.rechtsonder ?? 0,
  );
}

/** Hoeveel vakjes het kind invult. */
function aantalVakjes(figuur: Splitsfiguur): number {
  return juisteAntwoorden(figuur).length;
}

// ---------------------------------------------------------------------------
// De twee soorten vakjes
// ---------------------------------------------------------------------------

const VAK =
  "grid place-items-center rounded-2xl border-2 text-center font-extrabold tabular-nums";

/**
 * De vorm van een vakje.
 *
 * Vierkant is de gewone; rond hoort bij de kersen en blad bij de splitsbloem.
 * Het lege vakje krijgt dezelfde vorm als het gevulde, zodat ook de rand van
 * het actieve vakje de vorm van een blaadje heeft en niet die van een hokje.
 */
export type Vakvorm = "vierkant" | "rond" | "bladLinks" | "bladRechts";

const VORM: Record<Vakvorm, string> = {
  vierkant: "",
  rond: "!rounded-full",
  bladLinks: "!rounded-[85%_15%_85%_15%]",
  bladRechts: "!rounded-[15%_85%_15%_85%]",
};

/** Een gegeven getal: geel met donkere cijfers. */
export function Gegeven({
  waarde,
  maat = "gewoon",
  vorm = "vierkant",
}: {
  waarde: number;
  maat?: "gewoon" | "groot" | "klein";
  vorm?: Vakvorm;
}) {
  const grootte =
    maat === "groot"
      ? "size-[4.25rem] text-3xl sm:size-20 sm:text-4xl"
      : maat === "klein"
        ? "size-12 text-xl"
        : "size-16 text-2xl sm:size-[4.25rem] sm:text-3xl";
  return (
    <span className={`${VAK} ${grootte} border-geel bg-geel-zacht text-inkt ${VORM[vorm]}`}>
      {waarde}
    </span>
  );
}

/** Een leeg vakje: wit met een lichte rand, en een echt invoerveld erin. */
export function Invulvak({
  waarde,
  uitslag,
  maat = "gewoon",
  label,
  uit,
  vorm = "vierkant",
  randDonker = false,
  veldRef,
  onTyp,
  onBevestig,
  onVolgende,
  onActief,
}: {
  waarde: string;
  uitslag: "goed" | "fout" | null;
  maat?: "gewoon" | "groot" | "klein";
  label: string;
  vorm?: Vakvorm;
  /** Een iets donkerder rand, voor op een gekleurde ondergrond. */
  randDonker?: boolean;
  uit: boolean;
  veldRef?: (el: HTMLInputElement | null) => void;
  onTyp: (tekst: string) => void;
  onBevestig?: () => void;
  onVolgende?: () => void;
  /** Dit vakje is aan de beurt; de tekening eromheen kan daarop reageren. */
  onActief?: () => void;
}) {
  const { bijAandacht, bijWeggaan } = useInBeeld();

  const grootte =
    maat === "groot"
      ? "size-[4.25rem] text-3xl sm:size-20 sm:text-4xl"
      : maat === "klein"
        ? "size-12 text-xl"
        : "size-16 text-2xl sm:size-[4.25rem] sm:text-3xl";

  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep motion-safe:animate-kraal-stuiter"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : `bg-kaart text-inkt focus-within:border-huisstijl ${randDonker ? "border-inkt/25" : "border-rand"}`;

  return (
    <span className={`${VAK} ${grootte} ${kleur} ${VORM[vorm]}`}>
      <input
        ref={veldRef}
        type="text"
        aria-label={label}
        value={waarde}
        placeholder={uitslag === null ? "?" : undefined}
        readOnly={uit}
        disabled={uit}
        autoComplete="off"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        maxLength={3}
        onFocus={(e) => {
          bijAandacht(e.currentTarget);
          onActief?.();
        }}
        onBlur={bijWeggaan}
        onChange={(e) => onTyp(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onBevestig?.();
          }
          if (e.key === "Tab" && !e.shiftKey) onVolgende?.();
        }}
        className="size-full rounded-[inherit] bg-transparent text-center font-extrabold outline-none placeholder:text-rand"
      />
    </span>
  );
}

/** Vos naast de tekening, klein. Alleen bij de speelse uiterlijken. */
function VosErnaast({ vos, blij }: { vos: Voshoudingen | null; blij: boolean }) {
  if (!vos || !(vos.vangend || vos.wachtend || vos.blij)) return null;
  return (
    <span className={`w-20 shrink-0 self-end sm:w-24 ${blij ? "motion-safe:animate-vos-zwaai" : ""}`}>
      <Vosbeeld houdingen={vos} stand={blij ? "blij" : "wachtend"} stil={!blij} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Het scherm zelf
// ---------------------------------------------------------------------------

export function Splitsopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
  onKlaar,
}: {
  figuur: Splitsfiguur;
  antwoord: string;
  fase: Fase;
  /**
   * Mag de cursor vanzelf in het eerste lege vakje gaan staan?
   *
   * Aan bij het kind: dan is meteen te zien waar het moet beginnen, zonder dat
   * het eerst ergens op hoeft te tikken. Uit in het voorbeeld in beheer — daar
   * staan tien opgaven onder elkaar, en die zouden om beurten de cursor en het
   * toetsenbord naar zich toe trekken.
   */
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  /**
   * Klaar met vieren.
   *
   * Bij de speelse uiterlijken duurt dat even: Vos springt het raam uit, de
   * bloem bloeit open. Zolang dat loopt houdt het oefenscherm het feestscherm
   * tegen, want dat legt zich er anders meteen overheen en dan ziet een kind
   * er niets van.
   */
  onKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const juist = juisteAntwoorden(figuur);
  const aantal = aantalVakjes(figuur);

  /* Was er al iets ingevuld — een hervatte oefensessie — dan staat dat er weer. */
  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, aantal));
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  const volgorde = leesvolgorde(figuur);
  const grootste = grootsteAntwoord(figuur);
  /*
    Het feestscherm mag pas komen als het vieren hier klaar is.

    Bij de tabel en de andere opdrachten valt er niets te wachten; die melden
    zich meteen. Het klokje loopt altijd af, ook als er iets misgaat met een
    animatie — anders zou het feest helemaal uitblijven.
  */
  const viert =
    figuur.soort === "splitstabel" && figuur.uiterlijk !== "eenvoudig";
  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onKlaar?.(), viert ? 1200 : 0);
    return () => window.clearTimeout(klokje);
    /*
      Alleen op de fase, niet op `onKlaar`.

      Het oefenscherm maakt die functie bij elke hertekening opnieuw aan. Zou
      hij in deze lijst staan, dan begon het klokje bij elke hertekening weer
      van voren af aan en zou het feest kunnen uitblijven.
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, viert]);

  /* De allereerste splitsdriehoek krijgt één keer een voorbeeld te zien. */
  const voordoen = useVoordoen(
    figuur.soort === "splitsdriehoek" && metCursor && fase === "bezig",
  );

  /*
    Opnieuw beginnen: stond de vraag al op nagekeken en gaat hij terug naar
    "bezig", dan horen de vakjes weer leeg te zijn.

    Het moet aan die overgang hangen en niet aan een leeg antwoord. Zolang niet
    álle vakjes gevuld zijn geeft dit scherm namelijk een leeg antwoord door —
    dat is precies wat er gebeurt terwijl het kind het eerste vakje intypt, en
    dan zou alles wat er net getypt is meteen weer verdwijnen.
  */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGetypt(Array.from({ length: aantal }, () => ""));
      /* En de cursor staat weer in het eerste vakje, net als bij een nieuwe vraag. */
      if (metCursor) velden.current[volgorde[0] ?? 0]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, aantal]);

  /** Het eerste vakje dat nog leeg is, in leesvolgorde. */
  function eersteLege(waarden: string[]): number | null {
    return volgorde.find((i) => (waarden[i] ?? "") === "") ?? null;
  }

  /*
    Bij een nieuwe vraag staat de cursor meteen in het eerste lege vakje.

    Zo ziet een kind aan de oranje rand en het knipperende streepje waar het
    moet beginnen. Het gebeurt één keer, bij het openen van de vraag: elke
    vraag krijgt een eigen exemplaar van dit scherm mee.
  */
  useEffect(() => {
    if (!metCursor || fase !== "bezig") return;
    const eerste = eersteLege(getypt);
    if (eerste !== null) velden.current[eerste]?.focus();
    /* Alleen bij het openen; daarna bepaalt het typen waar de cursor heen gaat. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  function typ(nummer: number, tekst: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[nummer] = tekst;
    setGetypt(nieuw);
    /* Pas als alles ingevuld is, is er een antwoord om na te kijken. */
    onWijzig(nieuw.every((w) => w !== "") ? nieuw.join(",") : "");

    /*
      Is dit vakje vol, dan springt de cursor door naar het volgende lege.

      "Vol" is: er kan geen cijfer meer bij zonder dat het getal groter wordt
      dan in deze opdracht mogelijk is. Bij een opdracht tot 20 springt hij dus
      door na "16", maar wacht hij nog even na "1" — daar kan immers nog een
      cijfer achter.
    */
    if (!metCursor || tekst === "") return;
    const kanErnogBij = Number(tekst) * 10 <= grootste;
    if (kanErnogBij) return;
    const volgende = eersteLege(nieuw);
    if (volgende !== null && volgende !== nummer) velden.current[volgende]?.focus();
  }

  const uitslagen: ("goed" | "fout" | null)[] = uit
    ? juist.map((n, i) => (Number(getypt[i]) === n ? "goed" : "fout"))
    : juist.map(() => null);

  const alGoed = fase === "goed";

  /** Eén invulvak, met alles eromheen al ingevuld. */
  function vak(
    nummer: number,
    label: string,
    maat: "gewoon" | "groot" | "klein" = "gewoon",
    vorm: Vakvorm = "vierkant",
    onActief?: () => void,
    randDonker = false,
  ) {
    return (
      <Invulvak
        waarde={getypt[nummer] ?? ""}
        uitslag={uitslagen[nummer] ?? null}
        maat={maat}
        label={label}
        uit={uit}
        vorm={vorm}
        randDonker={randDonker}
        onActief={onActief}
        veldRef={(el) => {
          velden.current[nummer] = el;
        }}
        onTyp={(tekst) => typ(nummer, tekst)}
        onBevestig={onBevestig}
        onVolgende={() => {
          const plek = volgorde.indexOf(nummer);
          const volgende = volgorde[plek + 1];
          if (volgende !== undefined) velden.current[volgende]?.focus();
        }}
      />
    );
  }

  if (figuur.soort === "splitstabel") {
    if (figuur.uiterlijk === "speels") {
      return (
        <Splitshuis
          figuur={figuur}
          vak={vak}
          fase={fase}
          ingevuld={getypt.filter((w) => w !== "").length}
        />
      );
    }
    if (figuur.uiterlijk === "bloem") {
      return <Splitsbloem figuur={figuur} vak={vak} fase={fase} />;
    }
    return <Splitstabel figuur={figuur} vak={vak} />;
  }

  if (figuur.soort === "aanvullen") {
    /* Waar het samen op uit moet komen staat in de vraagzin erboven. */
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Gegeven waarde={figuur.gegeven} maat="groot" />
        {vak(0, `Wat hoort er bij ${figuur.gegeven}?`, "groot")}
      </div>
    );
  }

  if (figuur.soort === "splitsschema") {
    return figuur.uiterlijk === "speels" ? (
      <Kersen figuur={figuur} vak={vak} blij={alGoed} />
    ) : (
      <Schema figuur={figuur} vak={vak} />
    );
  }

  if (figuur.soort === "verdelen") {
    return (
      <Verdelen
        figuur={figuur}
        fase={fase}
        uit={uit}
        metCursor={metCursor}
        uitslagen={uitslagen}
        onWijzig={onWijzig}
      />
    );
  }

  return <Driehoek figuur={figuur} vak={vak} demo={voordoen} />;
}

// ---------------------------------------------------------------------------
// De splitstabel
// ---------------------------------------------------------------------------

/**
 * Staat het lege vakje van deze rij rechts?
 *
 * Sommen van vóór de instelling "Leeg vakje" hebben dit niet staan; die stonden
 * allemaal met het lege vakje rechts en horen er nog net zo uit te zien.
 */
function leegRechtsVan(
  figuur: Extract<Splitsfiguur, { soort: "splitstabel" }>,
  rij: number,
): boolean {
  return figuur.leegRechts?.[rij] ?? true;
}

/**
 * De splitstabel zoals hij in een rekenschrift staat.
 *
 * Het doelgetal staat groot en kaal bovenaan — het is geen vakje om iets mee te
 * doen, het is de kop van de tabel. Daaronder een streep over de hele breedte
 * en vanaf het midden daarvan een lijn naar beneden: die twee lijnen maken er
 * één tabel van in plaats van losse vakjes onder elkaar. Links en rechts van de
 * middenlijn staat per rij één getal; het gele vakje is gegeven, het witte vult
 * het kind in.
 */
function Splitstabel({
  figuur,
  vak,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitstabel" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
    onActief?: () => void,
    randDonker?: boolean,
  ) => React.ReactNode;
}) {
  /*
    De tabel is precies zo breed als de twee kolommen samen (`w-fit`) en staat
    daarmee in het midden van de kaart. De horizontale streep steekt er aan
    allebei de kanten een klein stukje buiten; de verticale streep loopt van
    onder die streep tot onder de laatste rij, en verder niet.
  */
  return (
    <div className="mx-auto w-fit">
      {/* Het doelgetal: groot, donker, zonder vakje eromheen. */}
      <p className="text-center text-4xl font-extrabold tabular-nums text-inkt">{figuur.doel}</p>

      {/* De streep eronder, net iets breder dan de tabel, aan beide kanten evenveel. */}
      <div aria-hidden="true" className="-mx-3 mt-2 h-0.5 rounded-full bg-inkt/70" />

      <div className="relative pt-3">
        {/* En vanaf het midden daarvan de lijn naar beneden. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-inkt/70"
        />

        <div className="flex flex-col gap-2.5">
          {figuur.gegeven.map((n, i) => {
            const leegRechts = leegRechtsVan(figuur, i);
            return (
              <div key={i} className="grid grid-cols-2 items-center gap-x-6">
                <span className="justify-self-end">
                  {leegRechts ? (
                    <Gegeven waarde={n} />
                  ) : (
                    vak(i, `Welk getal hoort er links bij ${n}?`)
                  )}
                </span>
                <span className="justify-self-start">
                  {leegRechts ? (
                    vak(i, `Welk getal hoort er rechts bij ${n}?`)
                  ) : (
                    <Gegeven waarde={n} />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het splitshuis
// ---------------------------------------------------------------------------

/**
 * Het splitshuis.
 *
 * Het doelgetal staat op het dak. Daaronder een raampje waar Vos uit kijkt, en
 * daaronder de verdiepingen: per verdieping twee raampjes, links het getal dat
 * gegeven is en rechts het lege — of andersom, als de instelling dat zegt.
 *
 * ---------------------------------------------------------------------------
 * Wat Vos doet
 * ---------------------------------------------------------------------------
 * Tijdens het invullen ademt hij zachtjes: hij staat niet stil, maar verraadt
 * ook niets. Vult het kind een vakje in, dan knikt hij kort — een seintje dat
 * het is aangekomen, en niet meer dan dat. Pas ná Controleer laat hij merken
 * hoe het ging: bij alles goed springt hij half uit het raam met een paar
 * sterretjes en worden de muren even warmer, bij een fout schudt hij rustig
 * zijn hoofd. Welke vakjes goed of fout zijn, blijft het werk van de vakjes
 * zelf: groen en rood, net als bij elke andere opdracht.
 *
 * Alle reacties duren minder dan een seconde, en met "minder beweging" aan
 * staat alles stil — elke animatie hangt aan `motion-safe`.
 */
function Splitshuis({
  figuur,
  vak,
  fase,
  ingevuld,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitstabel" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
    onActief?: () => void,
    randDonker?: boolean,
  ) => React.ReactNode;
  fase: Fase;
  /** Hoeveel vakjes er ingevuld zijn; bij elke erbij knikt Vos even. */
  ingevuld: number;
}) {
  const vos = figuur.vos;
  const goed = fase === "goed";
  const fout = fase === "fout";

  /*
    Welke houding er bij dit moment hoort.

    Is er een blije vos ingesteld, dan komt die na een goed antwoord in beeld;
    anders blijft het bij de gewone vos en doet alleen de beweging het werk.
  */
  const bestand = goed ? (vos.blij ?? vos.vangend) : (vos.wachtend ?? vos.vangend);

  /* Een knikje bij elk vakje dat erbij komt; de teller herstart de animatie. */
  const [knikken, setKnikken] = useState(0);
  const vorigIngevuld = useRef(ingevuld);
  useEffect(() => {
    if (ingevuld > vorigIngevuld.current) setKnikken((n) => n + 1);
    vorigIngevuld.current = ingevuld;
  }, [ingevuld]);

  const beweging = fout
    ? "motion-safe:animate-vos-schudt"
    : knikken > 0
      ? "motion-safe:animate-vos-knik"
      : "motion-safe:animate-vos-ademt";

  return (
    <div className="flex w-full flex-col items-center">
      {/* Het dak: een driehoek in de huisstijlkleur met het doelgetal erop. */}
      <div className="relative flex justify-center">
        <div
          aria-hidden="true"
          className="h-0 w-0 border-x-[8.5rem] border-b-[3.75rem] border-x-transparent border-b-huisstijl"
        />
        <span className="absolute bottom-1 text-3xl font-extrabold text-white">{figuur.doel}</span>
      </div>

      {/* De muren; bij een goed antwoord gaan de lichtjes even aan. */}
      <div
        className={`flex w-[17rem] flex-col items-center gap-2 rounded-b-2xl border-2 border-huisstijl/30 px-3 pt-3 transition-colors duration-500 ${
          goed ? "bg-amber-zacht" : "bg-huisstijl-zacht/60"
        }`}
      >
        {/*
          Het zolderraampje.

          Het plaatje van Vos is een hele vos in een vierkant; in het raampje
          hoort alleen zijn kop, dus het hangt ruim twee keer zo breed aan de
          bovenkant. Het knipvlak loopt door tot boven het raam: daardoor kan
          hij er bij een goed antwoord half uitspringen zonder dat de rest van
          zijn lijf ineens zichtbaar wordt.
        */}
        <span className="relative block size-14 rounded-xl bg-kaart">
          {goed && bestand ? (
            /*
              Klopt alles, dan springt hij er echt uit.

              Het knipvlak loopt nu ruim boven en naast het raam door, en hij
              staat er als hele vos in: hij begint onder de vensterbank — daar
              valt hij buiten het knipvlak — en komt er bovenuit. Onder het raam
              blijft hij verborgen, dus het blijft een raam en geen gat.
            */
            <span className="pointer-events-none absolute -inset-x-5 bottom-0 top-[-5.5rem] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key="springt"
                src={`/vragen/${bestand}`}
                alt=""
                draggable={false}
                className="absolute bottom-0 left-1/2 w-24 max-w-none -translate-x-1/2 select-none drop-shadow-md motion-safe:animate-vos-uit-raam"
              />
            </span>
          ) : (
            <span className="absolute inset-x-0 bottom-0 top-[-2.25rem] overflow-hidden">
              {bestand ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={`${fase}-${knikken}`}
                  src={`/vragen/${bestand}`}
                  alt=""
                  draggable={false}
                  className={`absolute left-1/2 top-9 w-[210%] max-w-none -translate-x-1/2 select-none ${beweging}`}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-1/2 size-8 -translate-x-1/2 rounded-full bg-huisstijl/20"
                />
              )}
            </span>
          )}

          {/* Het kozijn, over het knipvlak heen. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl border-2 border-huisstijl"
          />

          {/* En bij alles goed: een paar sterretjes die opstijgen. */}
          {goed &&
            [
              { x: -18, vertraging: 0 },
              { x: 4, vertraging: 120 },
              { x: 22, vertraging: 240 },
            ].map((ster) => (
              <span
                key={ster.x}
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 text-sm text-amber motion-safe:animate-sterretje"
                style={{ left: `calc(50% + ${ster.x}px)`, animationDelay: `${ster.vertraging}ms` }}
              >
                ★
              </span>
            ))}
        </span>

        {figuur.gegeven.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            {leegRechtsVan(figuur, i) ? (
              <>
                <Gegeven waarde={n} maat="klein" />
                {vak(i, `Welk getal hoort bij ${n}?`, "klein", "vierkant", undefined, true)}
              </>
            ) : (
              <>
                {vak(i, `Welk getal hoort bij ${n}?`, "klein", "vierkant", undefined, true)}
                <Gegeven waarde={n} maat="klein" />
              </>
            )}
          </div>
        ))}

        {/* En onderaan de voordeur, in donkeroranje. */}
        <span
          aria-hidden="true"
          className="mt-1 h-9 w-12 rounded-t-xl border-2 border-b-0 border-huisstijl-donker bg-huisstijl-diep"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// De splitsbloem
// ---------------------------------------------------------------------------

/** De blaadjes rond het hart: acht zachte oranje blaadjes in een kring. */
function Bloemblaadjes() {
  return (
    <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="60"
          cy="24"
          rx="15"
          ry="23"
          transform={`rotate(${i * 45} 60 60)`}
          fill="var(--color-oranje-zacht)"
          stroke="var(--color-oranje)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/**
 * De splitsbloem.
 *
 * In het hart staat het getal waar het om gaat. Aan de steel zitten drie paar
 * blaadjes; elk paar is samen dat getal. Per paar staat er in één blaadje een
 * getal en is het andere leeg — en dat wisselt, dus het kind moet per paar
 * kijken welke kant het invult.
 *
 * Zijn alle drie de paren goed, dan bloeit de bloem even op en komt Vos kijken.
 */
function Splitsbloem({
  figuur,
  vak,
  fase,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitstabel" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
  ) => React.ReactNode;
  fase: Fase;
}) {
  /* Een goed ingevuld blaadje kleurt vanzelf groen; dat doet het vakje zelf. */
  const allesGoed = fase === "goed";
  const vos = figuur.vos;
  const vosbestand = vos.blij ?? vos.vangend;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Het hart met de blaadjes eromheen. */}
      <div
        className={`relative size-32 shrink-0 ${allesGoed ? "motion-safe:animate-kraal-pulse" : ""}`}
      >
        <Bloemblaadjes />
        <span className="absolute inset-[1.75rem] grid place-items-center rounded-full border-2 border-geel bg-geel-zacht text-3xl font-extrabold tabular-nums text-inkt">
          {figuur.doel}
        </span>

        {/* Vos komt pas kijken als alles klopt. */}
        {allesGoed && vosbestand && (
          <span className="absolute -right-16 bottom-0 w-16 motion-safe:animate-vos-springt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/vragen/${vosbestand}`} alt="" draggable={false} className="w-full select-none" />
          </span>
        )}
      </div>

      {/* De steel met drie paar blaadjes. */}
      <div className="relative flex flex-col items-center gap-2 pb-2">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-groen-diep"
        />
        {figuur.gegeven.map((n, i) => {
          const leegRechts = leegRechtsVan(figuur, i);
          return (
            <div key={i} className="relative flex items-center gap-8">
              {leegRechts ? (
                <>
                  <Gegeven waarde={n} maat="klein" vorm="bladLinks" />
                  {vak(i, `Welk getal hoort bij ${n}?`, "klein", "bladRechts")}
                </>
              ) : (
                <>
                  {vak(i, `Welk getal hoort bij ${n}?`, "klein", "bladLinks")}
                  <Gegeven waarde={n} maat="klein" vorm="bladRechts" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het splitsschema en de kersen
// ---------------------------------------------------------------------------

/**
 * Eén pijl: een doorlopende steel met een gevulde punt aan het eind.
 *
 * De punt wordt uitgerekend vanaf de richting van de steel, dus hij staat
 * vanzelf recht op de lijn en is aan allebei de kanten even breed.
 */
function Pijl({ van, naar }: { van: [number, number]; naar: [number, number] }) {
  const [x1, y1] = van;
  const [x2, y2] = naar;
  const lengte = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / lengte;
  const uy = (y2 - y1) / lengte;

  /** Waar de punt begint, en hoe breed hij is. */
  const KOP = 12;
  const HALVE_BREEDTE = 6;
  const bx = x2 - ux * KOP;
  const by = y2 - uy * KOP;

  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${bx - uy * HALVE_BREEDTE},${by + ux * HALVE_BREEDTE} ${bx + uy * HALVE_BREEDTE},${by - ux * HALVE_BREEDTE}`}
        fill="currentColor"
      />
    </>
  );
}

/**
 * De twee pijlen van het hele getal naar de vakjes eronder.
 *
 * In dezelfde donkere kleur als de cijfers, zodat ze meetellen als onderdeel
 * van het schema en niet wegvallen. De strook is precies zo breed als de twee
 * vakjes samen, dus elke punt wijst naar het midden van zijn eigen vakje; hij
 * stopt er net boven en raakt het vakje niet.
 */
function Pijltjes() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 176 44"
      className="h-11 w-[10.5rem] text-inkt sm:w-44"
    >
      <Pijl van={[88, 0]} naar={[34, 40]} />
      <Pijl van={[88, 0]} naar={[142, 40]} />
    </svg>
  );
}

function Schema({
  figuur,
  vak,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitsschema" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
    onActief?: () => void,
    randDonker?: boolean,
  ) => React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <Gegeven waarde={figuur.geheel} maat="groot" />
      <Pijltjes />
      <div className="flex items-start gap-10">
        {figuur.links === null ? vak(0, "Welk getal hoort hier?") : <Gegeven waarde={figuur.links} />}
        {figuur.rechts === null ? vak(0, "Welk getal hoort hier?") : <Gegeven waarde={figuur.rechts} />}
      </div>
    </div>
  );
}

function Kersen({
  figuur,
  vak,
  blij,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitsschema" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
    onActief?: () => void,
    randDonker?: boolean,
  ) => React.ReactNode;
  blij: boolean;
}) {
  return (
    <div className="flex w-full items-end justify-center gap-2">
      <div className="flex flex-col items-center">
        <Gegeven waarde={figuur.geheel} maat="groot" vorm="rond" />

        {/* De twee steeltjes. */}
        <svg aria-hidden="true" viewBox="0 0 120 40" className="h-10 w-44 text-groen-diep">
          <path d="M60 0 C 44 14, 32 22, 24 36" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M60 0 C 76 14, 88 22, 96 36" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>

        <div className={`flex items-start gap-8 ${blij ? "motion-safe:animate-kraal-stuiter" : ""}`}>
          {figuur.links === null ? (
            vak(0, "Welk getal hoort hier?", "gewoon", "rond")
          ) : (
            <Gegeven waarde={figuur.links} vorm="rond" />
          )}
          {figuur.rechts === null ? (
            vak(0, "Welk getal hoort hier?", "gewoon", "rond")
          ) : (
            <Gegeven waarde={figuur.rechts} vorm="rond" />
          )}
        </div>
      </div>

      <VosErnaast vos={figuur.vos} blij={blij} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// De splitsdriehoek
// ---------------------------------------------------------------------------

/**
 * Drie vakken in een driehoek, met aan elke zijde de som van de twee vakken
 * ernaast. De lijnen zijn dun en licht: ze wijzen alleen aan wat bij wat hoort.
 */
/**
 * Eén keer voordoen hoe de splitsdriehoek werkt.
 *
 * Bij de allereerste splitsdriehoek die een kind krijgt, lichten twee vakken en
 * de som die erbij hoort achter elkaar op, met de som in beeld. Daarna nooit
 * meer: dat onthoudt de browser van dit kind zelf.
 *
 * Met opzet met vaste voorbeeldgetallen (9 + 2 = 11) en niet met de getallen van
 * de vraag zelf — anders staat het antwoord meteen op het scherm.
 */
const VOORGEDAAN = "thuisles-splitsdriehoek-voorgedaan";

const VOORDOEN: { plekken: Driehoekplek[]; som: string | null }[] = [
  { plekken: [], som: null },
  { plekken: ["boven"], som: "9" },
  { plekken: ["boven", "linksonder"], som: "9 + 2" },
  { plekken: ["boven", "linksonder", "links"], som: "9 + 2 = 11" },
  { plekken: [], som: null },
];

function useVoordoen(aan: boolean): { plekken: Driehoekplek[]; som: string | null } {
  const [stap, setStap] = useState(0);

  useEffect(() => {
    if (!aan) return;
    let eerder = true;
    try {
      eerder = window.localStorage.getItem(VOORGEDAAN) === "ja";
    } catch {
      /* Geen opslag beschikbaar: dan doen we het deze keer gewoon niet. */
    }
    if (eerder) return;

    /*
      Pas afvinken als het voordoen klaar is, niet meteen.

      In ontwikkelmodus voert React elk effect twee keer uit — starten, opruimen,
      opnieuw starten. Zou het vinkje meteen gezet worden, dan zou de tweede
      ronde er niet meer aan beginnen en zag een kind het nooit.
    */
    const klokjes = [1, 2, 3, 4].map((n) =>
      window.setTimeout(() => {
        setStap(n);
        if (n === 4) {
          try {
            window.localStorage.setItem(VOORGEDAAN, "ja");
          } catch {
            /* Zie hierboven. */
          }
        }
      }, n * 1000),
    );
    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [aan]);

  return VOORDOEN[stap] ?? VOORDOEN[0];
}

/** De zes plekken van de driehoek: drie vakken erin, drie sommen eromheen. */
type Driehoekplek = "boven" | "linksonder" | "rechtsonder" | "links" | "rechts" | "onder";

/**
 * Welke plekken bij elkaar horen.
 *
 * Elke som buiten de driehoek is de optelling van de twee vakken ernaast. Licht
 * er één op, dan lichten de andere twee mee — zo laat de tekening zelf zien wat
 * er van het kind gevraagd wordt.
 */
const DRIEHOEKSOMMEN: Record<"links" | "rechts" | "onder", [Driehoekplek, Driehoekplek]> = {
  links: ["boven", "linksonder"],
  rechts: ["boven", "rechtsonder"],
  onder: ["linksonder", "rechtsonder"],
};

/** Welke plekken oplichten als deze plek aan de beurt is. */
function hoortBij(plek: Driehoekplek): Driehoekplek[] {
  if (plek === "links" || plek === "rechts" || plek === "onder") return DRIEHOEKSOMMEN[plek];
  return (Object.keys(DRIEHOEKSOMMEN) as (keyof typeof DRIEHOEKSOMMEN)[]).filter((som) =>
    DRIEHOEKSOMMEN[som].includes(plek),
  );
}

/* De tekening in echte pixels, zodat de lijnen overal even dik blijven. */
const DRIEHOEK = {
  breed: 280,
  hoog: 236,
  /* De drie punten van de driehoek. */
  top: [140, 6] as const,
  linksonderpunt: [24, 176] as const,
  rechtsonderpunt: [256, 176] as const,
  /* Het midden, en de middens van de drie zijden. */
  midden: [140, 119] as const,
  middenLinks: [82, 91] as const,
  middenRechts: [198, 91] as const,
  middenOnder: [140, 176] as const,
  /* Waar de zes vakjes staan. */
  plekken: {
    boven: [140, 72],
    linksonder: [96, 141],
    rechtsonder: [184, 141],
    links: [42, 72],
    rechts: [238, 72],
    onder: [140, 206],
  } as Record<Driehoekplek, [number, number]>,
};

const punt = ([x, y]: readonly [number, number]) => `${x},${y}`;

/**
 * De splitsdriehoek.
 *
 * Een grote driehoek met drie lijnen vanuit het midden naar de middens van de
 * zijden: daardoor ontstaan er drie vakken — boven, linksonder en rechtsonder.
 * In elk vak staat een getal of een leeg vakje. Buiten de driehoek staan de drie
 * sommen: links en rechts op de hoogte van het bovenste vak, en één onder de
 * driehoek.
 *
 * ---------------------------------------------------------------------------
 * De tekening wijst zelf aan wat erbij hoort
 * ---------------------------------------------------------------------------
 * Zodra een vakje aan de beurt is — of het kind tikt erop — lichten de vakken op
 * die daarbij horen. Bij de som links zijn dat boven en linksonder, en andersom:
 * staat de cursor in het vak linksonder, dan lichten de sommen links en onder
 * op. Zo hoeft er geen regel tekst bij te staan over wat er opgeteld moet worden.
 */
function Driehoek({
  figuur,
  vak,
  demo,
}: {
  figuur: Extract<Splitsfiguur, { soort: "splitsdriehoek" }>;
  vak: (
    nummer: number,
    label: string,
    maat?: "gewoon" | "groot" | "klein",
    vorm?: Vakvorm,
    onActief?: () => void,
    randDonker?: boolean,
  ) => React.ReactNode;
  /** Welke plekken nu worden voorgedaan, en met welke som erbij. */
  demo: { plekken: Driehoekplek[]; som: string | null };
}) {
  const [actief, setActief] = useState<Driehoekplek | null>(null);

  /* Tijdens het voordoen wijst de tekening zelf; dan telt de cursor even niet. */
  const oplichtend =
    demo.plekken.length > 0
      ? demo.plekken
      : actief === null
        ? []
        : [actief, ...hoortBij(actief)];

  const licht = (plek: Driehoekplek) => oplichtend.includes(plek);

  /** Eén plek: een geel vakje met een getal, of een wit vakje om in te vullen. */
  function plek(naam: Driehoekplek, waarde: number | null, nummer: number, label: string) {
    const [x, y] = DRIEHOEK.plekken[naam];
    return (
      <span
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl transition ${
          licht(naam) ? "ring-4 ring-huisstijl/40" : ""
        }`}
        style={{ left: x, top: y }}
        /* Een tik op een geel vakje wijst ook aan; een leeg vakje meldt het zelf. */
        onClick={() => setActief(naam)}
      >
        {waarde === null ? (
          vak(nummer, label, "klein", "vierkant", () => setActief(naam))
        ) : (
          <Gegeven waarde={waarde} maat="klein" />
        )}
      </span>
    );
  }

  const vlak = (naam: "boven" | "linksonder" | "rechtsonder", punten: string) => (
    <polygon
      points={punten}
      style={{ fill: licht(naam) ? "var(--color-huisstijl-zacht)" : "transparent" }}
    />
  );

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className="relative"
        style={{ width: DRIEHOEK.breed, height: DRIEHOEK.hoog }}
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${DRIEHOEK.breed} ${DRIEHOEK.hoog}`}
          className="absolute inset-0 h-full w-full text-inkt"
        >
          {/* Eerst de drie vakken, zodat ze achter de lijnen liggen. */}
          {vlak(
            "boven",
            [DRIEHOEK.top, DRIEHOEK.middenRechts, DRIEHOEK.midden, DRIEHOEK.middenLinks]
              .map(punt)
              .join(" "),
          )}
          {vlak(
            "linksonder",
            [DRIEHOEK.middenLinks, DRIEHOEK.midden, DRIEHOEK.middenOnder, DRIEHOEK.linksonderpunt]
              .map(punt)
              .join(" "),
          )}
          {vlak(
            "rechtsonder",
            [DRIEHOEK.middenRechts, DRIEHOEK.rechtsonderpunt, DRIEHOEK.middenOnder, DRIEHOEK.midden]
              .map(punt)
              .join(" "),
          )}

          {/* De drie lijnen vanuit het midden naar de middens van de zijden. */}
          {[DRIEHOEK.middenLinks, DRIEHOEK.middenRechts, DRIEHOEK.middenOnder].map((naar, i) => (
            <line
              key={i}
              x1={DRIEHOEK.midden[0]}
              y1={DRIEHOEK.midden[1]}
              x2={naar[0]}
              y2={naar[1]}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}

          {/* En de driehoek eromheen. */}
          <polygon
            points={[DRIEHOEK.top, DRIEHOEK.rechtsonderpunt, DRIEHOEK.linksonderpunt]
              .map(punt)
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>

        {plek("boven", figuur.boven, 0, "Het vak bovenin")}
        {plek("linksonder", figuur.linksonder, 0, "Het vak linksonder")}
        {plek("rechtsonder", figuur.rechtsonder, 0, "Het vak rechtsonder")}
        {plek("links", figuur.links, 1, "De som links van de driehoek")}
        {plek("rechts", figuur.rechts, 2, "De som rechts van de driehoek")}
        {plek("onder", figuur.onder, 0, "De som onder de driehoek")}
      </div>

      {/* Alleen tijdens het voordoen: de som die erbij hoort. */}
      {demo.som !== null && (
        <p className="text-lg font-extrabold tabular-nums text-huisstijl-diep">{demo.som}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verdelen in twee groepen
// ---------------------------------------------------------------------------

/** Waar een kraal ligt: in de voorraad bovenin, of in een van de twee vakken. */
type Kraalplek = "voorraad" | "links" | "rechts";

const KRAAL = 28;

/**
 * Of het handje al is voorgedaan.
 *
 * Bewust naast de component: elke vraag krijgt een eigen exemplaar van dit
 * scherm, en het handje hoort maar één keer per oefening te komen. Bij het
 * opnieuw openen van de oefening begint het weer bij vals.
 */
let handjeGetoond = false;

/**
 * Het witte handje, hetzelfde als bij de kralenrij.
 *
 * Wordt ook bij Optellen gebruikt, zodat het voordoen overal hetzelfde handje
 * is; daarom staat het hier als export.
 */
export function Handje() {
  return (
    <svg viewBox="0 0 30 32" className="h-8 w-8 drop-shadow-sm" aria-hidden="true">
      <path
        d="M8 13V3a2.5 2.5 0 0 1 5 0v8-1a2.3 2.3 0 0 1 4.6 0v1a2.2 2.2 0 0 1 4.4 0v2a2.2 2.2 0 0 1 4.4 0v7c0 6-3.5 10-9 10h-2c-3.5 0-5.5-2-7.5-5l-5-7a2.5 2.5 0 0 1 3.8-3.2L8 17Z"
        fill="#ffffff"
        stroke="#24364b"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Kralen naar twee vakken slepen.
 *
 * ---------------------------------------------------------------------------
 * Hoe het slepen werkt
 * ---------------------------------------------------------------------------
 * Precies zoals bij "Tellen en slepen": pointer-events, want die gelden voor
 * muis, vinger én pen, en de ingebouwde `draggable` van HTML doet op een
 * touchscreen niets. Bij het oppakken houdt `setPointerCapture` de sleep bij
 * de kraal, ook als de vinger er even naast komt; `touch-action: none` zorgt
 * dat het scherm niet meescrollt terwijl er gesleept wordt.
 *
 * De kraal die je vasthoudt reist als los bolletje met de vinger mee — dat is
 * wat het slepen zichtbaar maakt. Het vak waar je boven hangt licht op, zodat
 * een kind ziet waar hij terechtkomt. Laat je hem ergens anders los, dan blijft
 * hij gewoon liggen waar hij lag.
 *
 * ---------------------------------------------------------------------------
 * Ook zonder slepen
 * ---------------------------------------------------------------------------
 * Eén tik op een kraal in de voorraad legt hem in het linkervak; één tik op een
 * kraal die al in een vak ligt haalt hem terug naar boven. Voor kleine handjes
 * is dat vaak makkelijker dan slepen — en slepen blijft gewoon werken.
 *
 * Er wordt pas een antwoord doorgegeven als alle kralen verdeeld zijn. Zolang
 * er nog eentje boven ligt, valt er niets na te kijken.
 */
function Verdelen({
  figuur,
  fase,
  uit,
  metCursor,
  uitslagen,
  onWijzig,
}: {
  figuur: Extract<Splitsfiguur, { soort: "verdelen" }>;
  fase: Fase;
  uit: boolean;
  /** Bij het kind: dan wiebelen de kralen en wordt het handje voorgedaan. */
  metCursor: boolean;
  uitslagen: ("goed" | "fout" | null)[];
  onWijzig: (waarde: string) => void;
}) {
  const [plek, setPlek] = useState<Kraalplek[]>(() =>
    Array.from({ length: figuur.aantal }, () => "voorraad" as const),
  );
  /** Welke kraal er nu in de hand is, en waar hij vandaan komt. */
  const [bezig, setBezig] = useState<{ nummer: number; vanaf: Kraalplek } | null>(null);
  /** Waar de vinger is, zodat de kraal eronder mee kan reizen. */
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  /** Boven welk vak de vinger hangt; dat vak licht op. */
  const [boven, setBoven] = useState<Kraalplek | null>(null);

  const vakken = useRef<Record<Kraalplek, HTMLDivElement | null>>({
    voorraad: null,
    links: null,
    rechts: null,
  });

  /*
    Tik of sleep? Aan het begin van het gebaar is dat niet te zien — een sleep
    begint met dezelfde pointerdown als een tik. Daarom wordt bijgehouden of de
    vinger echt een stuk verplaatst is; een paar pixels tellen niet mee, want
    een kindervinger staat nooit helemaal stil.
  */
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);
  const SLEEPGRENS = 8;

  /* Net als bij de vakjes: pas leegmaken als de vraag opnieuw begint. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setPlek(Array.from({ length: figuur.aantal }, () => "voorraad" as const));
    }
  }, [fase, figuur.aantal]);

  /* Heeft het kind al een kraal verplaatst? Dan hoeft er niets meer te wiebelen. */
  const alVerplaatst = plek.some((p) => p !== "voorraad");

  /*
    Het handje dat één keer voordoet hoe het werkt.

    Het pakt de eerste kraal op, sleept hem naar het linkervak en zet hem weer
    terug — zonder dat er iets verandert aan wat er ligt. Daarna is het klaar
    en komt het deze oefening niet meer terug.
  */
  const [handje, setHandje] = useState<{ x: number; y: number } | null>(null);
  const strook = useRef<HTMLDivElement | null>(null);
  const eersteKraal = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!metCursor || uit || handjeGetoond) return;

    const klokjes: number[] = [];
    const meet = () => {
      const buiten = strook.current?.getBoundingClientRect();
      const start = eersteKraal.current?.getBoundingClientRect();
      const doel = vakken.current.links?.getBoundingClientRect();
      if (!buiten || !start || !doel) return null;
      return {
        van: {
          x: start.left - buiten.left + start.width / 2,
          y: start.top - buiten.top + start.height / 2,
        },
        naar: {
          x: doel.left - buiten.left + doel.width / 2,
          y: doel.top - buiten.top + 26,
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
            /* Pas nu afgevinkt; zie de uitleg bij het voordoen van de driehoek. */
            handjeGetoond = true;
          }, 3100),
        );
      }, 600),
    );

    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [metCursor, uit]);

  function leg(nummer: number, naar: Kraalplek) {
    if (uit) return;
    const nieuw = [...plek];
    nieuw[nummer] = naar;
    setPlek(nieuw);

    const links = nieuw.filter((p) => p === "links").length;
    const rechts = nieuw.filter((p) => p === "rechts").length;
    const klaar = nieuw.every((p) => p !== "voorraad");
    onWijzig(klaar ? `${links},${rechts}` : "");
  }

  /** Boven welk vak hangt de vinger? `null` = ernaast. */
  function vakOnder(x: number, y: number): Kraalplek | null {
    for (const naam of ["links", "rechts", "voorraad"] as Kraalplek[]) {
      const el = vakken.current[naam];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return naam;
    }
    return null;
  }

  function pak(e: React.PointerEvent, nummer: number) {
    if (uit) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Lukt het vasthouden niet, dan werkt het slepen nog wel — minder vergevend. */
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

    /*
      Nauwelijks bewogen? Dan was het een tik: uit de voorraad naar het
      linkervak, en vanuit een vak weer terug naar boven.
    */
    if (!verplaatst.current) {
      leg(nummer, vanaf === "voorraad" ? "links" : "voorraad");
      return;
    }

    /* Naast alle vakken losgelaten: hij blijft liggen waar hij lag. */
    if (doel === null) return;
    leg(nummer, doel);
  }

  const kralen = (waar: Kraalplek) =>
    plek.map((p, i) => (p === waar ? i : -1)).filter((i) => i >= 0);

  /* Zolang er nog niets verplaatst is, wiebelen de kralen om de paar seconden. */
  const wiebelt = metCursor && !uit && !alVerplaatst && handje === null;

  /** Eén kraal: een bolletje dat je kunt vastpakken of aantikken. */
  const kraal = (nummer: number, eerste = false) => (
    <button
      key={nummer}
      ref={eerste ? eersteKraal : undefined}
      type="button"
      disabled={uit}
      aria-label={`Kraal ${nummer + 1}`}
      onPointerDown={(e) => pak(e, nummer)}
      className={`size-7 shrink-0 select-none rounded-full border-2 border-viool-diep bg-viool transition [touch-action:none] disabled:cursor-not-allowed ${
        bezig?.nummer === nummer ? "opacity-30" : ""
      } ${wiebelt ? "motion-safe:animate-kraal-wiebel" : ""}`}
    />
  );

  /** De rand van een vak: groen of rood na het nakijken, anders licht. */
  const vakStijl = (kant: "links" | "rechts", nummer: 0 | 1) => {
    if (uitslagen[nummer] === "goed") return "border-groen bg-groen-zacht";
    if (uitslagen[nummer] === "fout") return "border-roze bg-roze-zacht";
    /* Boven het vak waar de vinger hangt: vol aan. Met een kraal in de hand:
       allebei zacht, zodat een kind ziet waar hij naartoe kan. */
    if (boven === kant) return "border-huisstijl bg-huisstijl-zacht";
    if (bezig !== null) return "border-huisstijl/50 bg-huisstijl-zacht/50";
    return "border-rand bg-kaart";
  };

  return (
    <div
      ref={strook}
      className="relative flex w-full flex-col items-center gap-4"
      onPointerDown={(e) => {
        /* Elk nieuw gebaar begint als een tik, tot de vinger echt beweegt. */
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/* De voorraad: hier liggen de kralen die nog verdeeld moeten worden. */}
      <div
        ref={(el) => {
          vakken.current.voorraad = el;
        }}
        className={`flex min-h-12 w-full max-w-sm flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2 transition [touch-action:none] ${
          boven === "voorraad" ? "border-huisstijl bg-huisstijl-zacht" : "border-rand"
        }`}
      >
        {kralen("voorraad").map((i, plaats) => kraal(i, plaats === 0))}
        {kralen("voorraad").length === 0 && (
          <span className="text-xs font-bold text-inkt-zacht">alles verdeeld</span>
        )}
      </div>

      {/* De twee vakken. */}
      <div className="flex w-full items-start justify-center gap-4">
        {(
          [
            ["links", 0],
            ["rechts", 1],
          ] as const
        ).map(([kant, nummer]) => (
          <div
            key={kant}
            ref={(el) => {
              vakken.current[kant] = el;
            }}
            className={`flex min-h-24 w-36 flex-wrap content-start justify-center gap-2 rounded-2xl border-2 p-2 transition [touch-action:none] sm:w-40 ${vakStijl(kant, nummer)}`}
          >
            {kralen(kant).map((i) => kraal(i))}
          </div>
        ))}
      </div>

      {/*
        Het handje dat één keer voordoet wat de bedoeling is: het pakt een kraal
        op, brengt hem naar het linkervak en zet hem weer terug. Het reageert
        nergens op; het kind kan er gewoon doorheen tikken.
      */}
      {handje && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-20 transition-all duration-700 ease-in-out"
          style={{ left: handje.x - KRAAL / 2, top: handje.y - KRAAL / 2 }}
        >
          <span className="relative block">
            <span className="block size-7 rounded-full border-2 border-viool-diep bg-viool" />
            <span className="absolute left-4 top-4">
              <Handje />
            </span>
          </span>
        </span>
      )}

      {/* De kraal die met de vinger meereist. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] rounded-full border-2 border-viool-diep bg-viool shadow-op"
          style={{
            left: zweef.x - KRAAL / 2,
            top: zweef.y - KRAAL / 2,
            width: KRAAL,
            height: KRAAL,
          }}
        />
      )}
    </div>
  );
}
