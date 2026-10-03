"use client";

/**
 * De opdrachten van het domein Tijd.
 *
 * Eén component voor alle vijfentwintig, want ze delen alles wat telt: dezelfde
 * klok, dezelfde kalender, dezelfde keuzeknoppen en dezelfde invulvakjes als de
 * rest van Thuisles.
 *
 *   Wijzerklok en digitale klok
 *     urenminuten        1 uur = ▢ minuten
 *     dagdeel            een digitale tijd; ochtend, middag, avond of nacht?
 *     klokaflezen        een klok; kies de tijd in woorden of digitaal
 *     klokkiezen         kies de goede klok uit vier
 *     klokzetten         zet zelf de wijzers
 *     klokkoppelen       sleep elke digitale tijd naar de goede klok
 *     klokkenvolgorde    sleep vier klokken van vroeg naar laat
 *     kloktypen          typ de tijd in twee vakjes
 *     wijzeraanwijzen    tik op de wijzer van de uren of van de minuten
 *     klokklopt          klopt de klok bij de zin? ja of nee
 *     klokduur           hoe lang duurt het? ▢ uur ▢ minuten
 *
 *   Digitale klok
 *     digitaaldelen      tik op het urendeel of het minutendeel
 *     digitaaldagdeel    een situatie; kies "zeven uur 's ochtends"
 *     digitaalaflezen    een digitale tijd; kies de tijd in woorden
 *     digitaalverschil   twee klokken; hoeveel tijd zit ertussen?
 *
 *   Wijzerklok met vlekken
 *     klokvlek           een klok met een vlek erop; kies de tijd
 *
 *   Maanden en dagen
 *     dagvraag           een vraag over de dagen; kies uit drie
 *     dagenaanvullen     typ de ontbrekende dagen
 *     maandvraag         een vraag over de maanden; kies uit drie
 *     maandenaanvullen   typ de ontbrekende maand, met of zonder jaarcirkel
 *
 *   Kalender
 *     kalenderdag        op welke dag valt het? kies de weekdag
 *     kalenderzoek       tik de gevraagde dag aan in de kalender
 *     kalenderaantal     hoeveel dagen of zondagen heeft deze maand?
 *     kalenderdatum      welke datum is het dan? kies uit vier
 *     kalendernachtjes   hoeveel nachtjes nog slapen?
 *
 * ---------------------------------------------------------------------------
 * Uitlijnen
 * ---------------------------------------------------------------------------
 * De klok en de kalender zijn allebei vierkant en schalen met hun vak mee, dus
 * ze kunnen nooit over iets anders heen vallen. Vier klokken om uit te kiezen
 * staan in een raster van twee bij twee met even grote vakken; op een smal
 * scherm blijven dat twee kolommen, want één kolom maakt de pagina te lang om
 * te overzien. De kalender mag binnen zijn eigen vakje schuiven; de kaart
 * eronder schuift nooit mee.
 *
 * ---------------------------------------------------------------------------
 * Dezelfde afspraken als bij de andere domeinen
 * ---------------------------------------------------------------------------
 * Geel is gegeven, wit is invullen. Elk leeg vakje is een echt invoerveld; er
 * komt nergens een nagebouwd cijfertoetsenbord in beeld (HARDE REGEL 5). Goed
 * of fout laat het scherm pas zien nadat er op Controleer is gedrukt — bij een
 * keuze tikt het kind eerst, kan het nog wijzigen, en drukt dan pas op
 * Controleer.
 *
 * Bij "hoeveel tijd later" en "hoe lang duurt het" vult het kind beide vakjes
 * in; bij hele uren typt het 0 bij de minuten. Een leeg vakje telt niet als 0
 * (op verzoek van de eigenaar, oktober 2026); zie `minutenMagLeeg`.
 */

import { useEffect, useRef, useState } from "react";
import { Invulvak } from "@/components/oefenen/Splitsopdracht";
import { Digitaleklok, Klok } from "@/components/oefenen/Klok";
import { Jaarcirkel, Kalender } from "@/components/oefenen/Kalender";
import { Sleepkaartjes } from "@/components/oefenen/Sleepkaartjes";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { DAGDEEL_ACHTER, MAANDEN, dagdeelVan, plusDagen } from "@/lib/tijd";
import {
  aantalVakjes,
  doeltijd,
  isTijdfiguur,
  juistAntwoord,
  minutenMagLeeg,
  type Tijdfiguur,
} from "@/lib/tijdfiguren";

export type { Tijdfiguur };
export { isTijdfiguur, juistAntwoord };

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

// ---------------------------------------------------------------------------
// Gedeelde onderdelen
// ---------------------------------------------------------------------------

/**
 * Keuzeknoppen met tekst erop.
 *
 * Twee kolommen bij vier keuzes, één kolom bij twee of drie: dan staan de
 * knoppen even breed onder elkaar en valt er niets half naast. Goed of fout
 * komt pas na Controleer; daarvoor laat alleen de gekozen knop zien dat hij
 * gekozen is.
 */
export function Keuzeknoppen({
  keuzes,
  gekozen,
  juist,
  uit,
  onKies,
  volgorde,
  tweeKolommen = false,
}: {
  keuzes: string[];
  gekozen: number | null;
  juist: number;
  uit: boolean;
  onKies: (nummer: number) => void;
  /**
   * In welke volgorde de knoppen op het scherm staan, als nummers van
   * `keuzes`. Het antwoord blijft het nummer in `keuzes`; alleen de plek op
   * het scherm verandert. Leeg = zoals ze in `keuzes` staan.
   */
  volgorde?: number[];
  /** Altijd twee naast elkaar, ook op een smal scherm. */
  tweeKolommen?: boolean;
}) {
  const plekken =
    volgorde && volgorde.length === keuzes.length && volgorde.every((i) => i >= 0)
      ? volgorde
      : keuzes.map((_, i) => i);
  return (
    <div
      className={`grid w-full max-w-md gap-2 ${
        tweeKolommen ? "grid-cols-2" : keuzes.length >= 4 ? "sm:grid-cols-2" : ""
      }`}
    >
      {plekken.map((i) => {
        const keuze = keuzes[i];
        const isGekozen = gekozen === i;
        const kleur = !uit
          ? isGekozen
            ? "border-huisstijl bg-huisstijl-zacht text-inkt"
            : "border-rand bg-kaart text-inkt hover:border-huisstijl/50"
          : i === juist
            ? "border-groen bg-groen-zacht text-groen-diep"
            : isGekozen
              ? "border-roze bg-roze-zacht text-roze"
              : "border-rand bg-kaart text-inkt-zacht";
        return (
          <button
            key={`${keuze}-${i}`}
            type="button"
            disabled={uit}
            aria-pressed={isGekozen}
            onClick={() => onKies(i)}
            className={`min-h-12 rounded-2xl border-2 px-4 py-2 text-base font-extrabold transition disabled:cursor-not-allowed ${kleur}`}
          >
            {keuze}
          </button>
        );
      })}
    </div>
  );
}

/** Vier klokken om uit te kiezen, in een raster van twee bij twee. */
function Klokkeuze({
  keuzes,
  gekozen,
  juist,
  uit,
  onKies,
}: {
  keuzes: { uur: number; minuut: number }[];
  gekozen: number | null;
  juist: number;
  uit: boolean;
  onKies: (nummer: number) => void;
}) {
  return (
    <div className="grid w-full max-w-sm grid-cols-2 justify-items-center gap-3">
      {keuzes.map((k, i) => {
        const isGekozen = gekozen === i;
        const kleur = !uit
          ? isGekozen
            ? "border-huisstijl bg-huisstijl-zacht"
            : "border-rand bg-kaart hover:border-huisstijl/50"
          : i === juist
            ? "border-groen bg-groen-zacht"
            : isGekozen
              ? "border-roze bg-roze-zacht"
              : "border-rand bg-kaart opacity-60";
        return (
          <button
            key={i}
            type="button"
            disabled={uit}
            aria-pressed={isGekozen}
            onClick={() => onKies(i)}
            className={`grid place-items-center rounded-2xl border-2 p-2 transition disabled:cursor-not-allowed ${kleur}`}
          >
            <Klok tijd={k} maat="klein" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Een invoervakje voor een woord: een dag of een maand.
 *
 * Dezelfde vorm en dezelfde kleuren als een gewoon invulvakje, maar breder en
 * met letters. Hoofdletters en spaties maken niet uit bij het nakijken; bij een
 * fout komt de goede spelling eronder te staan.
 */
function Woordvak({
  waarde,
  uitslag,
  label,
  uit,
  veldRef,
  onTyp,
  onBevestig,
}: {
  waarde: string;
  uitslag: "goed" | "fout" | null;
  label: string;
  uit: boolean;
  veldRef?: (el: HTMLInputElement | null) => void;
  onTyp: (tekst: string) => void;
  onBevestig?: () => void;
}) {
  const { bijAandacht, bijWeggaan } = useInBeeld();
  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-kaart text-inkt focus-within:border-huisstijl";

  return (
    <span className={`inline-grid h-12 w-32 place-items-center rounded-2xl border-2 ${kleur}`}>
      <input
        ref={veldRef}
        type="text"
        aria-label={label}
        value={waarde}
        placeholder={uitslag === null ? "?" : undefined}
        readOnly={uit}
        disabled={uit}
        autoComplete="off"
        autoCapitalize="none"
        enterKeyHint="done"
        maxLength={12}
        onFocus={(e) => bijAandacht(e.currentTarget)}
        onBlur={bijWeggaan}
        onChange={(e) => onTyp(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 12))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onBevestig?.();
          }
        }}
        className="size-full rounded-[inherit] bg-transparent px-2 text-center text-base font-extrabold outline-none placeholder:text-rand"
      />
    </span>
  );
}

/** De grote zin bij de opgave: de situatie of de vraag zelf. */
function Zin({ tekst }: { tekst: string }) {
  if (!tekst) return null;
  return (
    <p className="max-w-md text-center text-lg font-extrabold leading-snug text-inkt">{tekst}</p>
  );
}

/**
 * Waar de wijzers beginnen bij "zet de klok".
 *
 * Nooit op twaalf uur (dan liggen de wijzers over elkaar en zie je er maar
 * één), nooit op het antwoord, en altijd op een heel uur, zodat de wijzers
 * duidelijk los van elkaar staan. Welk uur hangt af van de opgave en niet van
 * toeval: dan staat de klok bij elke keer opbouwen hetzelfde.
 */
function beginVanKlok(figuur: Extract<Tijdfiguur, { soort: "klokzetten" }>): {
  uur: number;
  minuut: number;
} {
  const doel = doeltijd(figuur);
  const zaad = (figuur.begin?.uur ?? 0) * 5 + doel.uur * 7 + doel.minuut + 5;
  let uur = (zaad % 11) + 1;
  if (uur === doel.uur % 12 && doel.minuut === 0) uur = (uur % 11) + 1;
  return { uur, minuut: 0 };
}

// ---------------------------------------------------------------------------
// Het scherm zelf
// ---------------------------------------------------------------------------

export function Tijdopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Tijdfiguur;
  antwoord: string;
  fase: Fase;
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const juist = juistAntwoord(figuur);
  const hoeveel = aantalVakjes(figuur);

  const [getypt, setGetypt] = useState<string[]>(() =>
    Array.from({ length: hoeveel }, (_, i) => (antwoord ? (antwoord.split(",")[i] ?? "") : "")),
  );
  /** Bij de klok die het kind zelf zet: waar de wijzers nu staan. */
  const beginstand = figuur.soort === "klokzetten" ? beginVanKlok(figuur) : { uur: 0, minuut: 0 };
  const [gezet, setGezet] = useState<{ uur: number; minuut: number }>(beginstand);
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGetypt(Array.from({ length: hoeveel }, () => ""));
      setGezet(beginstand);
    }
    // De beginstand hoort bij de opgave; die verandert niet zolang dit scherm staat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, hoeveel]);

  /* Bij een nieuwe vraag staat de cursor meteen in het eerste lege vakje. */
  useEffect(() => {
    if (!metCursor || fase !== "bezig") return;
    velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  /*
    Soms zijn er meer goede schrijfwijzen, met een liggend streepje ertussen:
    bij een wijzerklok zonder dagdeel is zes uur ook 18:00. Het eerste is wat
    het scherm na een fout als goed antwoord laat zien; goed is elk van de
    schrijfwijzen die helemaal klopt.
  */
  const schrijfwijzen = juist.split("|").map((w) => w.split(","));
  const juisteDelen = schrijfwijzen[0];
  const magLeeg = minutenMagLeeg(figuur);

  /** Wat er per vakje ingevuld staat, met een leeg minutenvakje als 0. */
  function gelezen(i: number): string {
    const w = getypt[i] ?? "";
    if (w === "" && magLeeg && i === 1) return "0";
    return /^\d+$/.test(w) ? String(Number(w)) : w;
  }

  const uitslagen: ("goed" | "fout" | null)[] = !uit
    ? juisteDelen.map(() => null)
    : (schrijfwijzen.find((w) => w.every((n, i) => gelezen(i).toLowerCase() === n.toLowerCase())) ??
        juisteDelen).map((n, i) =>
        gelezen(i).toLowerCase() === n.toLowerCase() ? "goed" : "fout",
      );

  /**
   * Doorgeven wat er staat.
   *
   * Normaal pas als alles gevuld is. Bij "hoeveel tijd later" telt het
   * minutenvakje als 0 zodra het leeg blijft, dus daar is het genoeg als de
   * uren erin staan — precies de afspraak met de eigenaar.
   */
  function meld(nieuw: string[]) {
    setGetypt(nieuw);
    const klaar = magLeeg
      ? nieuw[0] !== ""
      : nieuw.length === hoeveel && nieuw.every((w) => w !== "");
    /* "06" is gewoon 6: een getal met een nul ervoor telt net zo goed. */
    const waarden = nieuw.map((w, i) =>
      w === "" && magLeeg && i === 1 ? "0" : /^\d+$/.test(w) ? String(Number(w)) : w,
    );
    onWijzig(klaar ? waarden.join(",") : "");
  }

  function typ(nummer: number, waarde: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[nummer] = waarde;
    meld(nieuw);
  }

  /** Een keuze maken: het nummer van de knop ís het antwoord. */
  function kies(nummer: number) {
    if (uit) return;
    meld([String(nummer)]);
  }

  const gekozen = getypt[0] === "" ? null : Number(getypt[0]);

  /** Eén getalvakje. */
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
        onTyp={(waarde) => typ(nummer, waarde)}
        onBevestig={onBevestig}
        onVolgende={() => velden.current[nummer + 1]?.focus()}
      />
    );
  }

  /** Twee vakjes met "uur" en "minuten" erachter. */
  function urenEnMinuten() {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {vak(0, "Hoeveel uur?")}
        <span className="text-base font-extrabold text-inkt-zacht">uur</span>
        {vak(1, "Hoeveel minuten?")}
        <span className="text-base font-extrabold text-inkt-zacht">minuten</span>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Typen: een getal
  // -------------------------------------------------------------------------

  if (figuur.soort === "urenminuten") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {/* De zin zelf staat al bovenaan als vraag; hier alleen het vakje. */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {vak(0, figuur.zin, "groot")}
          <span className="text-xl font-extrabold text-inkt-zacht">{figuur.eenheid}</span>
        </div>
      </div>
    );
  }

  if (figuur.soort === "kalenderaantal") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Kalender jaar={figuur.jaar} maand={figuur.maand} />
        {vak(0, figuur.zin, "groot")}
      </div>
    );
  }

  if (figuur.soort === "kalendernachtjes") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Kalender
          jaar={figuur.jaar}
          maand={figuur.maand}
          vandaag={figuur.dag}
          doel={figuur.doel}
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {vak(0, figuur.zin, "groot")}
          <span className="text-xl font-extrabold text-inkt-zacht">nachtjes</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Typen: uren en minuten
  // -------------------------------------------------------------------------

  if (figuur.soort === "kloktypen") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Klok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="groot" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {vak(0, "Het uur")}
          <span className="text-3xl font-extrabold text-inkt-zacht">:</span>
          {vak(1, "De minuten")}
        </div>
      </div>
    );
  }

  if (figuur.soort === "klokduur") {
    /*
      De klok laat zien hoe laat het nu is; de andere tijd staat in de vraag.
      Bij de lagere niveaus kiest het kind uit vier knoppen in schooltaal, altijd
      van kort naar lang. Anders typt het in de vakjes ▢ uur ▢ minuten, die bij
      de start allebei leeg zijn.
    */
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Klok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="groot" />
        {figuur.keuzes ? (
          <Keuzeknoppen
            keuzes={figuur.keuzes}
            gekozen={gekozen}
            juist={Number(juist)}
            uit={uit}
            onKies={kies}
            tweeKolommen
          />
        ) : (
          <>
            {urenEnMinuten()}
            <p className="text-sm text-inkt-zacht">Vul beide vakjes in. Geen minuten? Typ dan een 0.</p>
          </>
        )}
      </div>
    );
  }

  if (figuur.soort === "digitaalverschil") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {/*
          De twee klokken met een pijl ertussen, NU en LATER of EERDER en NU
          erboven. De pijl wijst altijd van nu naar de andere tijd.

          Naast elkaar alleen als er echt plek is voor allebei plus de pijl —
          gemeten aan het vak zelf (@container), niet aan het scherm, want in
          het voorbeeld in de admin is het vak smal op een breed scherm. Anders
          onder elkaar met de pijl naar beneden. Eerder stond er flex-wrap: dan
          viel de tweede klok naar de volgende regel en bleef de pijl naast de
          eerste hangen, wijzend naar niets.
        */}
        {(() => {
          /*
            NU staat er altijd bij, en de andere klok heet LATER of EERDER. De
            klokken staan in de volgorde van de tijd: bij later NU links en de
            pijl naar rechts, bij eerder de eerdere klok links en de pijl naar
            links, terug naar de vroegere tijd.
          */
          const eerder = figuur.richting === "eerder";
          const nu = { uur: figuur.eersteUur, minuut: figuur.eersteMinuut };
          const ander = { uur: figuur.tweedeUur, minuut: figuur.tweedeMinuut };
          const metLabel = (label: string, tijd: { uur: number; minuut: number }) => (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-inkt-zacht">{label}</span>
              <Digitaleklok tijd={tijd} />
            </div>
          );
          return (
            <div className="@container w-full">
              <div className="flex flex-col items-center justify-center gap-2 @md:flex-row @md:items-end @md:gap-3">
                {eerder ? metLabel("Eerder", ander) : metLabel("Nu", nu)}
                <span aria-hidden="true" className="flex flex-col items-center text-huisstijl @md:px-1 @md:pb-3">
                  <span className="text-3xl leading-none font-extrabold @md:hidden">{eerder ? "↑" : "↓"}</span>
                  <span className="hidden text-3xl leading-none font-extrabold @md:inline">{eerder ? "←" : "→"}</span>
                </span>
                {eerder ? metLabel("Nu", nu) : metLabel("Later", ander)}
              </div>
            </div>
          );
        })()}
        {urenEnMinuten()}
        <p className="text-sm text-inkt-zacht">Vul beide vakjes in. Geen minuten? Typ dan een 0.</p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Typen: woorden
  // -------------------------------------------------------------------------

  if (figuur.soort === "dagenaanvullen" || figuur.soort === "maandenaanvullen") {
    /* Welk gat het hoeveelste is, zodat elk vakje zijn eigen nummer krijgt. */
    const gatnummers = figuur.rij.map((_, i) =>
      figuur.rij.slice(0, i + 1).filter((w) => w === null).length - 1,
    );
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {figuur.soort === "maandenaanvullen" && figuur.jaarcirkel && <Jaarcirkel />}
        {/*
          Eén rij als alle vakjes op één regel passen, anders onder elkaar.
          Nooit afbreken naar een tweede regel: dan staan ze als een blokje van
          twee bij twee en is niet meer te zien in welke volgorde je leest.
        */}
        <div className="@container w-full">
          <div className="flex flex-col items-center justify-center gap-2 @xl:flex-row">
            {figuur.rij.map((woord, i) => {
              if (woord !== null) {
                return (
                  <span
                    key={i}
                    className="inline-grid h-12 w-32 place-items-center rounded-2xl border-2 border-geel bg-geel-zacht px-2 text-base font-extrabold text-inkt"
                  >
                    {woord}
                  </span>
                );
              }
              const nummer = gatnummers[i];
              return (
                <Woordvak
                  key={i}
                  waarde={getypt[nummer] ?? ""}
                  uitslag={uitslagen[nummer] ?? null}
                  label={`Het ontbrekende woord op plek ${i + 1}`}
                  uit={uit}
                  veldRef={(el) => {
                    velden.current[nummer] = el;
                  }}
                  onTyp={(waarde) => typ(nummer, waarde)}
                  onBevestig={onBevestig}
                />
              );
            })}
          </div>
        </div>
        {/* Na een fout de goede spelling, want daar gaat deze opdracht ook over. */}
        {uit && uitslagen.some((u) => u === "fout") && (
          <p className="text-base font-extrabold text-groen-diep">
            {figuur.ontbreekt.join(" · ")}
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Zelf de wijzers zetten
  // -------------------------------------------------------------------------

  if (figuur.soort === "klokzetten") {
    /* De grote wijzer stopt bij elk streepje: elke minuut, zoals op een echte klok. */
    const klikstap = 1;
    const zet = (t: { uur: number; minuut: number }) => {
      const nieuw = { uur: ((t.uur % 12) + 12) % 12, minuut: t.minuut };
      setGezet(nieuw);
      meld([String(nieuw.uur), String(nieuw.minuut)]);
    };
    const start =
      figuur.opdracht === "verschuiving"
        ? { uur: figuur.uur, minuut: figuur.minuut }
        : null;
    /* Vóór het nakijken staat de klok op wat het kind heeft gezet. */
    const nu = uit
      ? { uur: Number(juisteDelen[0]), minuut: Number(juisteDelen[1]) }
      : gezet;
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {start && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-inkt-zacht">
              Nu
            </span>
            <Klok tijd={start} maat="klein" />
          </div>
        )}
        {!uit && (
          <p className="text-sm font-semibold text-inkt-zacht">Sleep de wijzers naar de goede tijd.</p>
        )}
        <Klok tijd={nu} maat="groot" zetbaar={!uit} stap={klikstap} onZet={zet} />
        {uit && (
          <p
            className={`text-base font-extrabold ${
              uitslagen.every((u) => u === "goed") ? "text-groen-diep" : "text-roze"
            }`}
          >
            {uitslagen.every((u) => u === "goed") ? "Goed gezet!" : "Zo hoorde de klok te staan."}
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Slepen
  // -------------------------------------------------------------------------

  if (figuur.soort === "klokkoppelen") {
    return (
      <Sleepkaartjes
        /* Groter dan "klein": de cijfers moeten ook op een tablet goed te lezen zijn. */
        regels={figuur.klokken.map((k, i) => <Klok key={i} tijd={k} maat="middel" />)}
        keuzes={figuur.keuzes.map((k, i) => (
          <Digitaleklok key={i} tijd={k} maat="klein" />
        ))}
        keuzeLabels={figuur.keuzes.map(
          (k) => `${String(k.uur).padStart(2, "0")}:${String(k.minuut).padStart(2, "0")}`,
        )}
        fase={fase}
        uit={uit}
        uitslagen={uitslagen}
        goedeKeuzes={juisteDelen.map(Number)}
        onWijzig={(waarde) => {
          setGetypt(waarde === "" ? Array.from({ length: hoeveel }, () => "") : waarde.split(","));
          onWijzig(waarde);
        }}
      />
    );
  }

  if (figuur.soort === "klokkenvolgorde") {
    return (
      <Sleepkaartjes
        regels={figuur.klokken.map((_, i) => (
          <span key={i} className="text-base font-extrabold text-inkt">
            {i + 1}e
          </span>
        ))}
        keuzes={figuur.klokken.map((k, i) => (
          <Klok key={i} tijd={k} maat="klein" />
        ))}
        opEenRij
        keuzeLabels={figuur.klokken.map(
          (k) => `Klok die ${String(k.uur).padStart(2, "0")}:${String(k.minuut).padStart(2, "0")} aanwijst`,
        )}
        fase={fase}
        uit={uit}
        uitslagen={uitslagen}
        goedeKeuzes={juisteDelen.map(Number)}
        onWijzig={(waarde) => {
          setGetypt(waarde === "" ? Array.from({ length: hoeveel }, () => "") : waarde.split(","));
          onWijzig(waarde);
        }}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Tikken op een deel van het beeld
  // -------------------------------------------------------------------------

  if (figuur.soort === "wijzeraanwijzen") {
    const nadruk = gekozen === null ? null : gekozen === 0 ? "uur" : "minuut";
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Klok
          tijd={{ uur: figuur.uur, minuut: figuur.minuut }}
          maat="groot"
          nadruk={uit ? (juist === "0" ? "uur" : "minuut") : nadruk}
        />
        <Keuzeknoppen
          keuzes={["De kleine wijzer", "De grote wijzer"]}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
        />
      </div>
    );
  }

  if (figuur.soort === "digitaaldelen") {
    const nadruk = gekozen === null ? null : gekozen === 0 ? "uur" : "minuut";
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {figuur.metUitleg && (
          <p className="max-w-md rounded-2xl bg-geel-zacht px-4 py-3 text-center text-base font-semibold text-inkt">
            Vóór de dubbele punt staan de uren. Erachter staan de minuten.
          </p>
        )}
        <Digitaleklok
          tijd={{ uur: figuur.uur, minuut: figuur.minuut }}
          maat="groot"
          nadruk={uit ? (juist === "0" ? "uur" : "minuut") : nadruk}
          onKiesDeel={uit ? undefined : (deel) => kies(deel === "uur" ? 0 : 1)}
        />
        <Keuzeknoppen
          keuzes={["Het urendeel", "Het minutendeel"]}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
        />
      </div>
    );
  }

  if (figuur.soort === "kalenderzoek") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Kalender
          jaar={figuur.jaar}
          maand={figuur.maand}
          gekozen={getypt[0] === "" ? null : Number(getypt[0])}
          juist={figuur.juisteDag}
          uit={uit}
          onTik={(dag) => meld([String(dag)])}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Kiezen uit klokken
  // -------------------------------------------------------------------------

  if (figuur.soort === "klokkiezen") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {figuur.vraag === "digitaal" && (
          <Digitaleklok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="groot" />
        )}
        {figuur.vraag === "verschuiving" && (
          <Klok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="gewoon" />
        )}
        <Klokkeuze
          keuzes={figuur.keuzes}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Kiezen uit antwoorden in woorden
  // -------------------------------------------------------------------------

  const keuzeKop = () => {
    if (figuur.soort === "klokaflezen" || figuur.soort === "klokvlek") {
      const klok = (
        <Klok
          tijd={{ uur: figuur.uur, minuut: figuur.minuut }}
          maat="groot"
          vlek={figuur.soort === "klokvlek" ? figuur.vlek : null}
        />
      );
      /*
        Een wijzerklok laat geen ochtend of avond zien. Moet het antwoord in
        24-uursnotatie, dan staat het dagdeel er altijd bij, onder de klok —
        niet alleen in de vraagzin, want die kan de beheerder aanpassen.
      */
      if (figuur.soort === "klokaflezen" && figuur.metDagdeel) {
        return (
          <div className="flex flex-col items-center gap-3">
            {klok}
            <Zin tekst={`Het is ${DAGDEEL_ACHTER[dagdeelVan({ uur: figuur.uur, minuut: figuur.minuut })]}.`} />
          </div>
        );
      }
      return klok;
    }
    if (
      figuur.soort === "dagdeel" ||
      figuur.soort === "digitaalaflezen" ||
      figuur.soort === "digitaaldagdeel"
    ) {
      return <Digitaleklok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="groot" />;
    }
    if (figuur.soort === "klokklopt") {
      return <Klok tijd={{ uur: figuur.uur, minuut: figuur.minuut }} maat="groot" />;
    }
    if (figuur.soort === "kalenderdag") {
      return <Kalender jaar={figuur.jaar} maand={figuur.maand} vandaag={figuur.dag} />;
    }
    if (figuur.soort === "kalenderdatum") {
      /*
        Over de maandgrens staan er twee kalenders, altijd in de volgorde van
        de tijd: vooruit deze maand en de volgende, terug de vorige en deze.
        Anders staat bij "3 dagen geleden" op 2 april de maand maart er niet bij.
      */
      const volgende = plusDagen({ jaar: figuur.jaar, maand: figuur.maand, dag: 1 }, 32);
      const vorige = plusDagen({ jaar: figuur.jaar, maand: figuur.maand, dag: 1 }, -1);
      /*
        Twee maanden staan altijd naast elkaar, op een smal scherm kleiner,
        zodat alles op één scherm past zonder scrollen.
      */
      const twee = figuur.tweedeMaand;
      const deze = <Kalender jaar={figuur.jaar} maand={figuur.maand} vandaag={figuur.dag} compact={twee} />;
      return (
        <div className={twee ? "grid w-full grid-cols-2 items-start gap-2 sm:gap-4" : "flex w-full justify-center"}>
          {twee && figuur.schuif < 0 && <Kalender jaar={vorige.jaar} maand={vorige.maand} compact />}
          {deze}
          {twee && figuur.schuif > 0 && <Kalender jaar={volgende.jaar} maand={volgende.maand} compact />}
        </div>
      );
    }
    return null;
  };

  if (figuur.soort === "klokklopt") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {keuzeKop()}
        <Zin tekst={figuur.bewering} />
        <Keuzeknoppen
          keuzes={["Ja", "Nee"]}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
        />
      </div>
    );
  }

  if (figuur.soort === "dagdeel") {
    /*
      Altijd in dezelfde volgorde, zoals de dag loopt: boven ochtend en
      middag, onder avond en nacht. Nooit geschud, zodat een kind de knop
      blind terugvindt. Ook oudere opgaven, waarin de keuzes nog door elkaar
      stonden, komen zo in deze volgorde op het scherm.
    */
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {keuzeKop()}
        <Keuzeknoppen
          keuzes={figuur.keuzes}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
          volgorde={DAGDELEN_OP_VOLGORDE.map((d) => figuur.keuzes.indexOf(d))}
          tweeKolommen
        />
      </div>
    );
  }

  if (
    figuur.soort === "dagvraag" ||
    figuur.soort === "maandvraag" ||
    figuur.soort === "klokaflezen" ||
    figuur.soort === "klokvlek" ||
    figuur.soort === "digitaalaflezen" ||
    figuur.soort === "digitaaldagdeel" ||
    figuur.soort === "kalenderdag" ||
    figuur.soort === "kalenderdatum"
  ) {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {keuzeKop()}
        <Keuzeknoppen
          keuzes={figuur.keuzes}
          gekozen={gekozen}
          juist={Number(juist)}
          uit={uit}
          onKies={kies}
          /* Bij twee kalenders naast elkaar ook de knoppen twee naast elkaar: dan past het op één scherm. */
          tweeKolommen={figuur.soort === "kalenderdatum" && figuur.tweedeMaand}
        />
      </div>
    );
  }

  /* Hier komt niets meer; elk soort hierboven is afgehandeld. */
  return null;
}

/** De vaste volgorde van de knoppen bij "Dagdelen". */
const DAGDELEN_OP_VOLGORDE = ["ochtend", "middag", "avond", "nacht"];

/** De maandnaam, voor schermen die hem erbij willen zetten. */
export function maandnaam(maand: number): string {
  return MAANDEN[maand - 1];
}

/** De tijd waar een verschuiving op uitkomt; ook buiten dit scherm bruikbaar. */
export { doeltijd };
