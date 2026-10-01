"use client";

/**
 * De opdrachten van het domein Erafsommen.
 *
 * Eén component voor alle vijf, want ze delen alles wat telt: gele vakjes voor
 * wat gegeven is, witte vakjes waar het kind zelf iets invult, en zo min
 * mogelijk op het scherm. Wat verschilt is alleen hoe het op de kaart staat.
 *
 *   wegstrepen      een groep plaatjes; het kind streept er zelf een paar weg
 *   minsomplaatje   er schuiven er vanzelf weg; het kind vult de hele som in
 *   plaatjesminsom  plaatjes − plaatjes = ▢, met of zonder getallen erbij
 *   minsom          de kale som, bij de eerste sommen met het rekenrek erbij
 *   minkoppelen     minsommen aan hun uitkomst slepen
 *
 * ---------------------------------------------------------------------------
 * Eerst zien, dan rekenen
 * ---------------------------------------------------------------------------
 * De eerste sommen van een oefening zijn visueel: het kind streept zelf weg of
 * schuift zelf kralen. Daarna volgt gewoon oefenen. Hoeveel sommen dat zijn
 * staat per sjabloon in de database; in de vraag staat alleen nog of déze som
 * visueel is (`visueel` in de figuur).
 *
 * ---------------------------------------------------------------------------
 * Dezelfde afspraken als bij Splitsen en Optellen
 * ---------------------------------------------------------------------------
 * Geel is gegeven, wit is invullen, en de vakjes komen uit hetzelfde onderdeel
 * — zo ziet een kind aan de kleur meteen wat er van hem gevraagd wordt. Elk
 * leeg vakje is een echt invoerveld dat alleen cijfers toont en waarbij de
 * oefening meeschuift als het toetsenbord opengaat; er komt nergens een
 * nagebouwd cijfertoetsenbord in beeld (HARDE REGEL 5). Goed of fout laat het
 * scherm pas zien nadat er op Controleer is gedrukt.
 */

import { useEffect, useRef, useState } from "react";
import { Gegeven, Invulvak } from "@/components/oefenen/Splitsopdracht";
import { Koppelsommen } from "@/components/oefenen/Optelopdracht";
import { Wegtikken } from "@/components/oefenen/Wegtikken";
import { Rekenrek } from "@/components/oefenen/Rekenrek";
import type { Figuur } from "@/lib/generatoren/soort";

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

/** De figuren die dit scherm tekent. */
export type Eraffiguur = Extract<
  Figuur,
  {
    soort: "wegstrepen" | "minsomplaatje" | "plaatjesminsom" | "minsom" | "minkoppelen";
  }
>;

const SOORTEN = [
  "wegstrepen",
  "minsomplaatje",
  "plaatjesminsom",
  "minsom",
  "minkoppelen",
];

export function isEraffiguur(figuur: Figuur | null | undefined): figuur is Eraffiguur {
  return figuur !== null && figuur !== undefined && SOORTEN.includes(figuur.soort);
}

/**
 * Wat er in de lege vakjes hoort, in de volgorde van het antwoord.
 *
 * Het staat niet in de vraag maar valt uit de tekening af te leiden. Zo kan
 * dit scherm na het nakijken elk vakje apart groen of rood kleuren.
 */
export function juisteAntwoorden(figuur: Eraffiguur): number[] {
  switch (figuur.soort) {
    case "wegstrepen":
      return [figuur.totaal - figuur.eraf];
    case "minsomplaatje":
      return [figuur.totaal, figuur.eraf, figuur.totaal - figuur.eraf];
    case "plaatjesminsom":
      return [figuur.totaal - figuur.eraf];
    case "minsom":
      return [figuur.van - figuur.af];
    default:
      return figuur.sommen.map((s) => s.eerste - s.tweede);
  }
}

/** Het grootste getal dat als antwoord kan voorkomen; voor het doorspringen. */
function grootsteAntwoord(figuur: Eraffiguur): number {
  return Math.max(20, ...juisteAntwoorden(figuur));
}

/** Een opgeslagen antwoord weer uit elkaar halen, één waarde per vakje. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord ? antwoord.split(",") : [];
  return Array.from({ length: hoeveel }, (_, i) => delen[i] ?? "");
}

/** Het minteken, overal hetzelfde. */
function Minteken() {
  return <span className="text-2xl font-extrabold text-inkt-zacht">−</span>;
}

function Isgelijk() {
  return <span className="text-2xl font-extrabold text-inkt-zacht">=</span>;
}

/**
 * Het bordje met de opdracht erop: "5 eraf".
 *
 * Donker en groot, niet als klein grijs tekstje: dit is de informatie waar de
 * som om draait, dus die moet een kind in één oogopslag zien.
 */
function Erafbordje({ aantal }: { aantal: number }) {
  return (
    <span className="rounded-2xl bg-inkt px-4 py-1.5 text-xl font-extrabold text-white">
      {aantal} eraf
    </span>
  );
}

export function Erafopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Eraffiguur;
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

  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, aantal));
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  /** Welke plaatjes of kralen het kind heeft weggestreept. */
  const [weg, setWeg] = useState<number[]>([]);

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGetypt(Array.from({ length: aantal }, () => ""));
      setWeg([]);
    }
  }, [fase, aantal]);

  /* Bij een nieuwe vraag staat de cursor meteen in het eerste lege vakje. */
  useEffect(() => {
    if (!metCursor || fase !== "bezig") return;
    velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  const uitslagen: ("goed" | "fout" | null)[] = !uit
    ? juist.map(() => null)
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

  /** Een plaatje of kraal aan- of uitzetten. */
  function tik(nummer: number) {
    if (uit) return;
    setWeg((eerder) =>
      eerder.includes(nummer) ? eerder.filter((n) => n !== nummer) : [...eerder, nummer],
    );
  }

  if (figuur.soort === "wegstrepen") {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <Erafbordje aantal={figuur.eraf} />
        <Wegtikken
          aantal={figuur.totaal}
          voorwerp={figuur.voorwerp}
          weg={weg}
          tikbaar={!uit}
          maat="gewoon"
          onTik={tik}
        />
        {/* Geen isgelijkteken: er staat geen som, alleen de vraag hoeveel er over zijn. */}
        {vak(0, "Hoeveel blijven er over?")}
      </div>
    );
  }

  if (figuur.soort === "minsomplaatje") {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <Wegtikken
          aantal={figuur.totaal}
          voorwerp={figuur.voorwerp}
          weg={[]}
          vanzelf={figuur.eraf}
          maat="gewoon"
        />
        <div className="flex items-center justify-center gap-3">
          {vak(0, "Hoeveel waren er eerst?")}
          <Minteken />
          {vak(1, "Hoeveel gingen er weg?")}
          <Isgelijk />
          {vak(2, "Hoeveel blijven er over?")}
        </div>
      </div>
    );
  }

  if (figuur.soort === "plaatjesminsom") {
    /*
      De twee groepjes staan naast elkaar met het minteken ertussen, en het
      getal — als dat erbij hoort — recht onder zijn eigen groepje. Bij een
      visuele som streept het kind in het linkergroepje zelf weg; dan zie je
      in één beeld waarom er overblijft wat er overblijft.
    */
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-center justify-items-center gap-x-4 gap-y-3 sm:gap-x-6">
          <Wegtikken
            aantal={figuur.totaal}
            voorwerp={figuur.voorwerp}
            weg={weg}
            tikbaar={figuur.visueel && !uit}
            maat="klein"
            onTik={tik}
          />
          <Minteken />
          <Wegtikken
            aantal={figuur.eraf}
            voorwerp={figuur.voorwerp}
            weg={[]}
            maat="klein"
          />
          <span className="flex items-center gap-3">
            <Isgelijk />
            {vak(0, "Hoeveel blijven er over?")}
          </span>

          {figuur.metGetallen && (
            <>
              <Gegeven waarde={figuur.totaal} maat="klein" />
              <span />
              <Gegeven waarde={figuur.eraf} maat="klein" />
              <span />
            </>
          )}
        </div>
      </div>
    );
  }

  if (figuur.soort === "minsom") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {figuur.visueel && (
          <div className="w-full max-w-md">
            <Rekenrek aantal={figuur.van} weg={weg} tikbaar={!uit} onTik={tik} />
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Gegeven waarde={figuur.van} maat="groot" />
          <Minteken />
          <Gegeven waarde={figuur.af} maat="groot" />
          <Isgelijk />
          {vak(0, "De uitkomst", "groot")}
        </div>
      </div>
    );
  }

  /*
    Het koppelen houdt zijn eigen sleepstand bij en meldt per rij de uitkomst.
    Die melding wordt hier ook in `getypt` gezet, want daar leest het nakijken
    uit welke rij goed of fout is.
  */
  return (
    <Koppelsommen
      figuur={figuur}
      fase={fase}
      uit={uit}
      uitslagen={uitslagen}
      teken="−"
      onWijzig={(waarde) => {
        setGetypt(uitAntwoord(waarde, aantal));
        onWijzig(waarde);
      }}
    />
  );
}
