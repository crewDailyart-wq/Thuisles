"use client";

/**
 * De opdrachten van de domeinen Tafels en Delen.
 *
 * Eén component voor alle dertien, want ze delen alles wat telt: gele vakjes
 * voor wat gegeven is, witte vakjes waar het kind zelf iets invult, kaartjes om
 * te slepen, en verder zo min mogelijk op het scherm.
 *
 *   deelsom            8 : 2 = ▢
 *   deelkoppelen       vijf deelsommen met de uitkomsten ernaartoe te slepen
 *   welkedeelsom       ▢ : ▢ = 5, zelf een deelsom maken
 *   keersom            3 × 5 = ▢
 *   keerkoppelen       vijf keersommen met de uitkomsten ernaartoe te slepen
 *   welkekeersom       ▢ × ▢ = 24, zelf een keersom maken
 *   keerraster         blokjes in rijen; hoeveel zijn het samen?
 *   keerplaatjes       plaatjes in rijen; ▢ × ▢ = ▢
 *   handigkeer         een som die je kent, en daaronder de nieuwe
 *   keernullen         drie sommen onder elkaar, elke regel een nul erbij
 *   keerdeelkoppelen   bij elke deelsom de keersom slepen die erbij hoort
 *   keerdeelsamen      20 : 2 = ▢ en ▢ × 2 = 20
 *   marktkraam         een kraampje met prijzen
 *
 * ---------------------------------------------------------------------------
 * Uitlijnen: waar het eerder op misging
 * ---------------------------------------------------------------------------
 * Staan er meer sommen onder elkaar — bij "Rekenen met nullen", "Handig
 * rekenen" en "Keersom en deelsom samen" — dan staan ze in een raster met vaste
 * kolommen, niet als losse regels met flexbox. Daardoor staat elk teken recht
 * onder het teken erboven en elk vakje recht onder het vakje erboven, ook als
 * het ene getal één cijfer heeft en het andere drie. Met losse regels
 * verschuift alles zodra een getal breder wordt, en dan lijken de sommen niet
 * meer bij elkaar te horen.
 *
 * Het raster bij "Rijen en kolommen tellen" heeft even grote vakjes en overal
 * dezelfde ruimte ertussen, en staat als geheel gecentreerd. Dat het als geheel
 * gecentreerd staat en niet per rij is belangrijk: anders staat een halfvolle
 * laatste rij in het midden in plaats van onder de rij erboven, en dan zijn de
 * kolommen niet meer te volgen.
 *
 * Alles wat breder kan worden dan het scherm — het raster, de kraam, de rijen
 * plaatjes — zit in een eigen vakje dat zelf mag schuiven. De kaart eronder
 * schuift nooit mee, zodat de vraagzin en de knop Controleer op hun plek
 * blijven.
 *
 * ---------------------------------------------------------------------------
 * Dezelfde afspraken als bij Splitsen, Optellen en Aftrekken
 * ---------------------------------------------------------------------------
 * Geel is gegeven, wit is invullen, en de vakjes komen uit hetzelfde onderdeel.
 * Elk leeg vakje is een echt invoerveld dat alleen cijfers toont en waarbij de
 * oefening meeschuift als het toetsenbord opengaat; er komt nergens een
 * nagebouwd cijfertoetsenbord in beeld (HARDE REGEL 5). Goed of fout laat het
 * scherm pas zien nadat er op Controleer is gedrukt.
 */

import { useEffect, useRef, useState } from "react";
import { Gegeven, Invulvak } from "@/components/oefenen/Splitsopdracht";
import { Koppelsommen } from "@/components/oefenen/Optelopdracht";
import { Telplaatje } from "@/components/oefenen/Telplaatjes";
import { Sleepkaartjes } from "@/components/oefenen/Sleepkaartjes";
import { isTelplaatje } from "@/lib/telplaatjes";
import {
  grootsteAntwoord,
  isZelfBedacht,
  juisteAntwoorden,
  paarKlopt,
  type Keerfiguur,
} from "@/lib/keerfiguren";

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

/*
  Welke figuren dit scherm tekent, wat er in de vakjes hoort en of een zelf
  bedacht paar klopt, staat in `@/lib/keerfiguren`. Daar staat geen React in, dus
  kan `npm run opgaven` van elke gemaakte opgave nakijken dat het antwoord van de
  generator precies past op de vakjes die hier getekend worden.
*/
export type { Keerfiguur };
export { isKeerfiguur, juisteAntwoorden } from "@/lib/keerfiguren";

/** Een opgeslagen antwoord weer uit elkaar halen, één waarde per vakje. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord ? antwoord.split(",") : [];
  return Array.from({ length: hoeveel }, (_, i) => delen[i] ?? "");
}

// ---------------------------------------------------------------------------
// Tekens
// ---------------------------------------------------------------------------

/** Het maalteken: een echt kruisje, geen sterretje en geen letter x. */
function Teken({
  wat,
  maat = "gewoon",
}: {
  wat: "keer" | "deel" | "isgelijk";
  maat?: "gewoon" | "groot";
}) {
  const kleur = wat === "isgelijk" ? "text-inkt-zacht" : "text-huisstijl";
  return (
    <span
      aria-hidden="true"
      className={`font-extrabold ${kleur} ${
        maat === "groot" ? "text-4xl sm:text-5xl" : "text-2xl"
      }`}
    >
      {wat === "keer" ? "×" : wat === "deel" ? ":" : "="}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Het raster en de rijen plaatjes
// ---------------------------------------------------------------------------

/**
 * Blokjes in rijen en kolommen.
 *
 * Een echt raster: even grote vakjes, overal dezelfde ruimte ertussen, en als
 * geheel gecentreerd. De kolommen staan dus recht onder elkaar, ook als de
 * laatste rij niet vol zou zijn — bij dit type is elke rij trouwens altijd vol,
 * en dat is precies waarom je er een keersom van kunt maken.
 */
function Raster({ rijen, kolommen }: { rijen: number; kolommen: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        aria-hidden="true"
        className="mx-auto grid w-fit gap-1.5"
        style={{ gridTemplateColumns: `repeat(${kolommen}, 1.5rem)` }}
      >
        {Array.from({ length: rijen * kolommen }, (_, i) => (
          <span
            key={i}
            className="size-6 rounded-md border-2 border-viool bg-viool-zacht"
          />
        ))}
      </div>
    </div>
  );
}

/** Dezelfde opstelling, maar met de getekende voorwerpen van Plaatjes tellen. */
function Plaatjesraster({
  rijen,
  kolommen,
  voorwerp,
}: {
  rijen: number;
  kolommen: number;
  voorwerp: string;
}) {
  if (!isTelplaatje(voorwerp)) return <Raster rijen={rijen} kolommen={kolommen} />;
  return (
    <div className="w-full overflow-x-auto">
      <div
        aria-hidden="true"
        className="mx-auto grid w-fit gap-x-2 gap-y-1"
        style={{ gridTemplateColumns: `repeat(${kolommen}, 2.25rem)` }}
      >
        {Array.from({ length: rijen * kolommen }, (_, i) => (
          <span key={i} className="block size-9">
            <Telplaatje naam={voorwerp} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het kraampje
// ---------------------------------------------------------------------------

/**
 * Een prijskaartje bij een product.
 *
 * Het bedrag staat in een geel vakje met een euroteken ervoor: hetzelfde geel
 * als bij elk ander gegeven getal, zodat een kind meteen ziet dat dit iets is
 * wat gegeven is en geen invulvakje.
 */
function Prijskaartje({ bedrag }: { bedrag: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border-2 border-geel bg-geel-zacht px-2.5 py-1 text-lg font-extrabold tabular-nums text-inkt">
      <span aria-hidden="true">€</span>
      {bedrag}
    </span>
  );
}

/**
 * Het kraampje zelf: per regel het aantal, waarvan, en wat één stuk kost.
 *
 * Een echte tabel met lijnen om en tussen alle vakken, zoals op school; zie
 * ONTWERPREGELS.md. Daarmee staat elk getal recht onder het getal erboven, ook
 * als de ene naam veel langer is dan de andere. De tabel mag binnen zijn eigen
 * vakje schuiven als het scherm smal is; de kaart eronder schuift niet mee.
 */
function Kraam({ waren }: { waren: { naam: string; prijs: number; aantal: number }[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="mx-auto border-collapse text-left">
        <thead>
          <tr>
            <th className="border-2 border-tabellijn px-3 py-1.5 text-xs font-semibold text-inkt-zacht">
              Hoeveel
            </th>
            <th className="border-2 border-tabellijn px-3 py-1.5 text-xs font-semibold text-inkt-zacht">
              Wat
            </th>
            <th className="border-2 border-tabellijn px-3 py-1.5 text-xs font-semibold text-inkt-zacht">
              Prijs per stuk
            </th>
          </tr>
        </thead>
        <tbody>
          {waren.map((w) => (
            <tr key={w.naam}>
              <td className="border-2 border-tabellijn px-3 py-1.5 text-xl font-extrabold tabular-nums text-inkt">
                {w.aantal}
              </td>
              <td className="border-2 border-tabellijn px-3 py-1.5 text-base text-inkt">
                {w.naam}
              </td>
              <td className="border-2 border-tabellijn px-3 py-1.5">
                <Prijskaartje bedrag={w.prijs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het scherm zelf
// ---------------------------------------------------------------------------

export function Keeropdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Keerfiguur;
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
  /* Bij deze twee mag het kind zelf een som bedenken; dan telt het paar. */
  const zelfBedacht = isZelfBedacht(figuur);

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
    if (!metCursor || fase !== "bezig") return;
    velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  const paarGoed = zelfBedacht && paarKlopt(figuur, getypt);
  const uitslagen: ("goed" | "fout" | null)[] = !uit
    ? juist.map(() => null)
    : zelfBedacht
      ? juist.map(() => (paarGoed ? "goed" : "fout"))
      : juist.map((n, i) => (Number(getypt[i]) === n ? "goed" : "fout"));

  /** Doorgeven wat er staat; pas als alles gevuld is valt er iets na te kijken. */
  function meld(nieuw: string[]) {
    setGetypt(nieuw);
    onWijzig(nieuw.every((w) => w !== "") ? nieuw.join(",") : "");
  }

  function typ(nummer: number, waarde: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[nummer] = waarde;
    meld(nieuw);

    /* Is dit vakje vol, dan springt de cursor door naar het volgende lege. */
    if (!metCursor || waarde === "" || Number(waarde) * 10 <= grootste) return;
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
        onTyp={(waarde) => typ(nummer, waarde)}
        onBevestig={onBevestig}
        onVolgende={() => velden.current[nummer + 1]?.focus()}
      />
    );
  }

  // -------------------------------------------------------------------------
  // De kale sommen
  // -------------------------------------------------------------------------

  if (figuur.soort === "deelsom" || figuur.soort === "keersom") {
    const deel = figuur.soort === "deelsom";
    const eerste = deel ? figuur.geheel : figuur.eerste;
    const tweede = deel ? figuur.deler : figuur.tweede;
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        <Gegeven waarde={eerste} maat="groot" breed />
        <Teken wat={deel ? "deel" : "keer"} maat="groot" />
        <Gegeven waarde={tweede} maat="groot" />
        <Teken wat="isgelijk" maat="groot" />
        {vak(0, "De uitkomst", "groot")}
      </div>
    );
  }

  if (figuur.soort === "welkedeelsom" || figuur.soort === "welkekeersom") {
    const deel = figuur.soort === "welkedeelsom";
    return (
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        {vak(0, deel ? "Welk getal deel je?" : "Het eerste getal", "groot")}
        <Teken wat={deel ? "deel" : "keer"} maat="groot" />
        {vak(1, deel ? "Waardoor deel je?" : "Het tweede getal", "groot")}
        <Teken wat="isgelijk" maat="groot" />
        <Gegeven waarde={figuur.uitkomst} maat="groot" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Het raster en de plaatjes
  // -------------------------------------------------------------------------

  if (figuur.soort === "keerraster") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Raster rijen={figuur.rijen} kolommen={figuur.kolommen} />
        {vak(0, "Hoeveel zijn het samen?", "groot")}
      </div>
    );
  }

  if (figuur.soort === "keerplaatjes") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Plaatjesraster
          rijen={figuur.rijen}
          kolommen={figuur.kolommen}
          voorwerp={figuur.voorwerp}
        />
        {/*
          De hele som op één regel, in de volgorde waarin je hem leest: hoeveel
          rijen, hoeveel per rij, en samen hoeveel.
        */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {vak(0, "Hoeveel rijen zijn er?")}
          <Teken wat="keer" />
          {vak(1, "Hoeveel staan er in een rij?")}
          <Teken wat="isgelijk" />
          {vak(2, "Hoeveel zijn het samen?")}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Meer sommen onder elkaar: altijd in een raster met vaste kolommen
  // -------------------------------------------------------------------------

  /*
    Vijf kolommen: getal, teken, getal, isgelijk, getal. Elke som vult precies
    die vijf, dus staat elk teken recht onder het teken erboven. `justify-items`
    op center houdt de vakjes in hun kolom gecentreerd, ook als een getal in de
    ene rij breder is dan in de andere.
  */
  const SOMRASTER =
    "grid grid-cols-[auto_auto_auto_auto_auto] items-center justify-center justify-items-center gap-x-3 gap-y-3";

  if (figuur.soort === "handigkeer") {
    const nieuw = figuur.stap === "tienkeer" ? figuur.mee * 10 : figuur.mee * 2;
    return (
      <div className={`w-full ${SOMRASTER}`}>
        {/* De som die het kind al kent, helemaal uitgerekend. */}
        <Gegeven waarde={figuur.tafel} />
        <Teken wat="keer" />
        <Gegeven waarde={figuur.mee} />
        <Teken wat="isgelijk" />
        <Gegeven waarde={figuur.tafel * figuur.mee} breed />

        {/* En daaronder de nieuwe, met hetzelfde eerste getal. */}
        <Gegeven waarde={figuur.tafel} />
        <Teken wat="keer" />
        <Gegeven waarde={nieuw} breed />
        <Teken wat="isgelijk" />
        {vak(0, "De uitkomst")}
      </div>
    );
  }

  if (figuur.soort === "keernullen") {
    /* Drie sommen: dezelfde tafel, en de uitkomst krijgt er elke regel een nul bij. */
    return (
      <div className={`w-full ${SOMRASTER}`}>
        {[1, 10, 100].map((factor, rij) => (
          <Fragmentregel
            key={factor}
            tafel={figuur.tafel}
            product={figuur.tafel * figuur.mee * factor}
            vakje={vak(rij, `Het ontbrekende getal, regel ${rij + 1}`)}
          />
        ))}
      </div>
    );
  }

  if (figuur.soort === "keerdeelsamen") {
    return (
      <div className={`w-full ${SOMRASTER}`}>
        {/* De deelsom: het hele getal, gedeeld door, is gelijk aan het lege vakje. */}
        <Gegeven waarde={figuur.geheel} breed />
        <Teken wat="deel" />
        <Gegeven waarde={figuur.deler} />
        <Teken wat="isgelijk" />
        {vak(0, "De uitkomst van de deelsom")}

        {/* En de keersom eronder, met het lege vakje vooraan. */}
        {vak(1, "Het ontbrekende getal in de keersom")}
        <Teken wat="keer" />
        <Gegeven waarde={figuur.deler} />
        <Teken wat="isgelijk" />
        <Gegeven waarde={figuur.geheel} breed />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Het kraampje
  // -------------------------------------------------------------------------

  if (figuur.soort === "marktkraam") {
    const totaal = figuur.waren.reduce((n, w) => n + w.prijs * w.aantal, 0);
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <Kraam waren={figuur.waren} />

        {figuur.betaald !== null && (
          <p className="text-center text-base font-semibold text-inkt">
            Je betaalt met{" "}
            <span className="whitespace-nowrap">€ {figuur.betaald}</span>.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span aria-hidden="true" className="text-3xl font-extrabold text-inkt-zacht sm:text-4xl">
            €
          </span>
          {vak(0, figuur.betaald === null ? "Wat kost het samen?" : "Hoeveel krijg je terug?", "groot")}
        </div>

        {/* Alleen na het nakijken, zodat het antwoord er niet vooraf staat. */}
        {uit && figuur.betaald !== null && (
          <p className="text-sm text-inkt-zacht">Samen kost het € {totaal}.</p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Koppelen
  // -------------------------------------------------------------------------

  if (figuur.soort === "keerdeelkoppelen") {
    return (
      <Sleepkaartjes
        regels={figuur.sommen.map((s) => `${s.geheel} : ${s.deler}`)}
        keuzes={figuur.keuzes.map((k) => `${k.eerste} × ${k.tweede}`)}
        fase={fase}
        uit={uit}
        uitslagen={uitslagen}
        /* Bij een fout antwoord laat het scherm zien wat er had moeten staan. */
        goedeKeuzes={juist}
        onWijzig={(waarde) => {
          setGetypt(uitAntwoord(waarde, aantal));
          onWijzig(waarde);
        }}
      />
    );
  }

  /*
    Het koppelen van losse uitkomsten gebruikt het onderdeel dat er al staat;
    alleen het teken ertussen verschilt. Het houdt zijn eigen sleepstand bij en
    meldt per rij de uitkomst, en die melding wordt hier ook in `getypt` gezet,
    want daar leest het nakijken uit welke rij goed of fout is.
  */
  return (
    <Koppelsommen
      figuur={figuur}
      fase={fase}
      uit={uit}
      uitslagen={uitslagen}
      teken={figuur.soort === "deelkoppelen" ? ":" : "×"}
      vinkjeBijGoed
      onWijzig={(waarde) => {
        setGetypt(uitAntwoord(waarde, aantal));
        onWijzig(waarde);
      }}
    />
  );
}

/**
 * Eén regel van "Rekenen met nullen": tafel × ▢ = uitkomst.
 *
 * Staat apart zodat de drie regels precies dezelfde vijf vakken van het raster
 * vullen; met een losse `<div>` per regel zouden de tekens niet meer onder
 * elkaar staan.
 */
function Fragmentregel({
  tafel,
  product,
  vakje,
}: {
  tafel: number;
  product: number;
  vakje: React.ReactNode;
}) {
  return (
    <>
      <Gegeven waarde={tafel} />
      <Teken wat="keer" />
      {vakje}
      <Teken wat="isgelijk" />
      {/* Bij de derde regel staat hier een getal van vier cijfers; dat mag meegroeien. */}
      <Gegeven waarde={product} breed />
    </>
  );
}
