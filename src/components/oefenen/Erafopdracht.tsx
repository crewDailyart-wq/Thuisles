"use client";

/**
 * De opdrachten van het domein Erafsommen.
 *
 * Eén component voor alle vijf, want ze delen alles wat telt: gele vakjes voor
 * wat gegeven is, witte vakjes waar het kind zelf iets invult, en zo min
 * mogelijk op het scherm. Wat verschilt is alleen hoe het op de kaart staat.
 *
 *   minsomplaatje   één groep plaatjes; het eraf-deel schuift grijs opzij
 *   wegstrepen      het kind streept zelf weg, met een teller onder het bordje
 *   minsom          de kale som, met een oranje minteken
 *   plaatjesminsom  één groep plaatjes met het eraf-deel grijs
 *   minkoppelen     minsommen aan hun uitkomst slepen
 *   rekenrekflits   even kijken naar het rek, dan gaat er een kaart overheen
 *   rekenrekaf      de som bovenaan, het rekenrek eronder om weg te schuiven
 *   rekenrekhoofd   dezelfde som, maar zonder rek erbij
 *
 * ---------------------------------------------------------------------------
 * Eén beeldtaal
 * ---------------------------------------------------------------------------
 * Overal hetzelfde beeld, zodat een kind het maar één keer hoeft te leren:
 * plaatjes in rijtjes van vijf, wat eraf gaat grijs en half doorzichtig, wat
 * overblijft fel, het totaal met een oranje label en wat eraf gaat met een
 * grijs label. Zie ONTWERPREGELS.md; de kleuren komen uit de centrale
 * variabelen in `globals.css`.
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
import { Groepje, Koppelsommen } from "@/components/oefenen/Optelopdracht";
import { Wegtikken } from "@/components/oefenen/Wegtikken";
import { Erafbordje } from "@/components/oefenen/Erafbordje";
import { Rekenrek } from "@/components/oefenen/Rekenrek";
import type { Figuur } from "@/lib/generatoren/soort";

/** Dezelfde drie standen als in het oefenscherm. */
type Fase = "bezig" | "goed" | "fout";

/** De figuren die dit scherm tekent. */
export type Eraffiguur = Extract<
  Figuur,
  {
    soort:
      | "wegstrepen"
      | "minsomplaatje"
      | "plaatjesminsom"
      | "minsom"
      | "minkoppelen"
      | "rekenrekflits"
      | "rekenrekaf"
      | "rekenrekhoofd";
  }
>;

const SOORTEN = [
  "wegstrepen",
  "minsomplaatje",
  "plaatjesminsom",
  "minsom",
  "minkoppelen",
  "rekenrekflits",
  "rekenrekaf",
  "rekenrekhoofd",
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
    case "rekenrekaf":
    case "rekenrekhoofd":
      return [figuur.van - figuur.af];
    case "rekenrekflits":
      return [figuur.aantal];
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

/** Het minteken: in de huisstijlkleur, zodat je meteen ziet dat er iets afgaat. */
function Minteken({ maat = "gewoon" }: { maat?: "gewoon" | "groot" }) {
  return (
    <span
      className={`font-extrabold text-huisstijl ${maat === "groot" ? "text-4xl sm:text-5xl" : "text-2xl"}`}
    >
      −
    </span>
  );
}

function Isgelijk({ maat = "gewoon" }: { maat?: "gewoon" | "groot" }) {
  return (
    <span
      className={`font-extrabold text-inkt-zacht ${maat === "groot" ? "text-4xl sm:text-5xl" : "text-2xl"}`}
    >
      =
    </span>
  );
}

/*
  Hieronder staan drie onderdelen die nu nergens meer gebruikt worden: het
  grijze label "− 4", het losse getal in een som en het lijstje met de laatste
  plaatjes. Ze horen bij de oudere opbouw van de plaatjessommen — één groep
  met grijze plaatjes erin. Op verzoek van de eigenaar blijven ze staan voor
  het geval die opbouw ooit weer nodig is.
*/
/**
 * Het kleine grijze label naast de plaatjes die eraf gaan: "− 4".
 *
 * Dezelfde kleuren als het grijze getallabel uit de beeldtaal, maar kleiner:
 * het hoort bij de plaatjes en mag de som eronder niet overstemmen.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Eraflabel({ aantal }: { aantal: number }) {
  return (
    <span className="rounded-xl border-2 border-eraf bg-eraf-zacht px-2 py-0.5 text-base font-extrabold tabular-nums text-eraf">
      − {aantal}
    </span>
  );
}

/**
 * Een getal in de som, zonder vakje eromheen.
 *
 * Voor de stand zonder getallen onder de groepjes: daar hoort de som bij het
 * beeld en niet als tweede rij labels. Grote donkere cijfers, zodat ze even
 * goed te lezen zijn als een label.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Getal({ waarde }: { waarde: number }) {
  return (
    <span className="text-3xl font-extrabold tabular-nums text-inkt sm:text-4xl">{waarde}</span>
  );
}

/**
 * Wat er na een goed antwoord onder de som verschijnt.
 *
 * De redenering in cijfers, zodat een kind ziet waaróm het klopt: de
 * splitsing bij een som binnen het tiental, of de twee stappen bij een som
 * over de tien. Het hoeft er niets mee te doen; het is alleen om te zien.
 */
function Nabeschouwing({ regels }: { regels: string[] }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-groen-zacht px-5 py-3">
      {regels.map((regel) => (
        <p key={regel} className="text-xl font-extrabold tabular-nums text-groen-diep">
          {regel}
        </p>
      ))}
    </div>
  );
}

/** Welke plaatjes eraf gaan: altijd de laatste, zodat wat blijft vooraan staat. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eraflijst(totaal: number, eraf: number): number[] {
  return Array.from({ length: eraf }, (_, i) => totaal - 1 - i);
}

/**
 * Of het handje bij Wegstrepen al is voorgedaan.
 *
 * Bewust naast de component: elke vraag krijgt een eigen exemplaar van dit
 * scherm, en het handje hoort maar bij de eerste som van een oefening.
 */
let handjeGetoondWegstrepen = false;

export function Erafopdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
  onKlaar,
}: {
  figuur: Eraffiguur;
  antwoord: string;
  fase: Fase;
  /** Mag de cursor vanzelf in het eerste lege vakje gaan staan? Uit in beheer. */
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  /** Klaar met wat er na een goed antwoord nog te zien is; dan mag het feest. */
  onKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const juist = juisteAntwoorden(figuur);
  const aantal = juist.length;
  const grootste = grootsteAntwoord(figuur);

  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, aantal));
  const velden = useRef<(HTMLInputElement | null)[]>([]);

  /** Welke plaatjes het kind heeft weggestreept. */
  const [weg, setWeg] = useState<number[]>([]);
  /** Hoeveel kralen er van het rekenrek zijn weggeschoven. */
  const [kralenWeg, setKralenWeg] = useState(0);
  /** Knippert de teller even oranje? Dat gebeurt bij eentje te veel. */
  const [knipper, setKnipper] = useState(false);
  /*
    Het handje doet bij de eerste som van een oefening één keer voor dat je op
    een plaatje kunt tikken. Daarna komt het niet meer terug, en zodra het kind
    zelf tikt is het meteen weg.
  */
  const [handje, setHandje] = useState(false);

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGetypt(Array.from({ length: aantal }, () => ""));
      setWeg([]);
      setKralenWeg(0);
      setKnipper(false);
    }
  }, [fase, aantal]);

  /* Bij een nieuwe vraag staat de cursor meteen in het eerste lege vakje. */
  useEffect(() => {
    if (!metCursor || fase !== "bezig") return;
    velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  /*
    Het handje bij de eerste som waar het kind zelf wegstreept. Het verdwijnt
    na vier wenken vanzelf, en eerder zodra het kind zelf tikt. De vlag gaat
    pas aan het eind om; in ontwikkeling draait een effect twee keer, en met
    een vlag vooraf zou het handje nooit te zien zijn.
  */
  useEffect(() => {
    if (!metCursor || uit || handjeGetoondWegstrepen) return;
    if (figuur.soort !== "wegstrepen") return;

    /* Even wachten tot de vraag staat; dan pas wenkt het handje. */
    const klokjes = [
      window.setTimeout(() => setHandje(true), 600),
      window.setTimeout(() => {
        setHandje(false);
        handjeGetoondWegstrepen = true;
      }, 4800),
    ];
    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [metCursor, uit, figuur.soort]);

  /*
    Na een goed antwoord blijft de redenering onder de som even staan: de
    splitsing of de twee stappen via de tien. Het feestscherm wacht daarop,
    anders zou een kind die regels nooit lezen.
  */
  useEffect(() => {
    if (fase !== "goed") return;
    if (figuur.soort !== "rekenrekaf" || figuur.stand === "vanaf10") return;
    const klokje = window.setTimeout(() => onKlaar?.(), 2400);
    return () => window.clearTimeout(klokje);
  }, [fase, figuur, onKlaar]);

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
  function vak(
    nummer: number,
    label: string,
    maat: "gewoon" | "groot" | "klein" = "gewoon",
    rand: "gewoon" | "oranje" | "grijs" | "neutraal" = "gewoon",
  ) {
    return (
      <Invulvak
        waarde={getypt[nummer] ?? ""}
        uitslag={uitslagen[nummer] ?? null}
        maat={maat}
        rand={rand}
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

  /** Een plaatje aan- of uitzetten. */
  function tik(nummer: number) {
    if (uit) return;
    setHandje(false);
    handjeGetoondWegstrepen = true;
    const nieuw = weg.includes(nummer) ? weg.filter((n) => n !== nummer) : [...weg, nummer];
    setWeg(nieuw);

    /* Eentje te veel: de teller licht even op en gaat daarna vanzelf uit. */
    if (figuur.soort === "wegstrepen" && nieuw.length > figuur.eraf) {
      setKnipper(true);
      window.setTimeout(() => setKnipper(false), 600);
    }
  }

  if (figuur.soort === "wegstrepen") {
    const teveel = weg.length > figuur.eraf;
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <Erafbordje
          aantal={figuur.eraf}
          gevuld={Math.min(weg.length, figuur.eraf)}
          teveel={teveel && knipper}
        />
        <Wegtikken
          aantal={figuur.totaal}
          voorwerp={figuur.voorwerp}
          weg={weg}
          tikbaar={!uit}
          wijsAan={handje}
          maat="gewoon"
          onTik={tik}
        />
        {/*
          De som staat onder de plaatjes, met het invulvak erin: wat het kind
          wegstreept en wat het opschrijft horen bij elkaar. Het totaal in een
          oranje label, wat eraf gaat in een grijs — dezelfde beeldtaal als bij
          de andere opdrachten van het onderwerp.

          Het kind mag altijd zelf het antwoord typen, ook zonder weg te
          strepen: het wegstrepen is hulp, het getal is het antwoord.
        */}
        <div className="flex items-center justify-center gap-3">
          <Gegeven waarde={figuur.totaal} kleur="oranje" />
          <Minteken />
          <Gegeven waarde={figuur.eraf} kleur="grijs" />
          <Isgelijk />
          {vak(0, "Hoeveel blijven er over?")}
        </div>
      </div>
    );
  }

  if (figuur.soort === "minsomplaatje") {
    /*
      Dezelfde opbouw als "Maak de plussom bij het plaatje" bij Optellen: twee
      groepjes naast elkaar in rijtjes van vijf, en daaronder de hele som op
      dezelfde plek. Alleen het teken is anders, het tweede groepje staat er
      vaag bij omdat het eraf gaat, en de twee vakjes krijgen de kleuren van
      de beeldtaal: oranje voor het totaal, grijs voor wat eraf gaat.
    */
    return (
      <div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-center justify-items-center gap-x-4 gap-y-3 sm:gap-x-7">
        <Groepje aantal={figuur.totaal} soort={figuur.voorwerp} kleur={0} />
        <span />
        <Groepje aantal={figuur.eraf} soort={figuur.voorwerp} kleur={1} grijs />
        <span />

        {vak(0, "Hoeveel waren er eerst?", "gewoon", "oranje")}
        <Minteken />
        {vak(1, "Hoeveel gaan eraf?", "gewoon", "grijs")}
        <span className="flex items-center gap-3">
          <Isgelijk />
          {vak(2, "Hoeveel blijven er over?", "gewoon", "neutraal")}
        </span>
      </div>
    );
  }

  if (figuur.soort === "plaatjesminsom") {
    /*
      Dezelfde opbouw als "Optellen met plaatjes" bij Optellen: twee groepjes
      naast elkaar en daaronder de som. Met de getallen erbij staan ze in de
      labels van de beeldtaal — oranje voor het totaal, grijs voor wat eraf
      gaat. Zonder getallen blijft die rij leeg: dan telt het kind zelf.
    */
    return (
      <div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-center justify-items-center gap-x-4 gap-y-3 sm:gap-x-7">
        <Groepje aantal={figuur.totaal} soort={figuur.voorwerp} kleur={0} />
        {/*
          Zonder getallen is er geen som onder de groepjes, en dan horen het
          minteken en het antwoord bij de plaatjes zelf. Met de getallen erbij
          staan ze een rij lager, precies zoals bij de plussommen.
        */}
        {figuur.metGetallen ? <span /> : <Minteken />}
        <Groepje aantal={figuur.eraf} soort={figuur.voorwerp} kleur={1} grijs />
        {figuur.metGetallen ? (
          <span />
        ) : (
          <span className="flex items-center gap-3">
            <Isgelijk />
            {vak(0, "Hoeveel blijven er over?", "gewoon", "neutraal")}
          </span>
        )}

        {figuur.metGetallen && (
          <>
            <Gegeven waarde={figuur.totaal} kleur="oranje" />
            <Minteken />
            <Gegeven waarde={figuur.eraf} kleur="grijs" />
            <span className="flex items-center gap-3">
              <Isgelijk />
              {vak(0, "Hoeveel blijven er over?", "gewoon", "neutraal")}
            </span>
          </>
        )}
      </div>
    );
  }

  if (figuur.soort === "minsom") {
    /* Geen plaatjes: alleen grote cijfers, met het minteken in de huisstijl. */
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Gegeven waarde={figuur.van} maat="groot" kleur="oranje" />
        <Minteken maat="groot" />
        <Gegeven waarde={figuur.af} maat="groot" kleur="grijs" />
        <Isgelijk maat="groot" />
        {vak(0, "De uitkomst", "groot")}
      </div>
    );
  }

  if (figuur.soort === "rekenrekflits") {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="w-full max-w-md">
          <Rekenrek
            aantal={figuur.aantal}
            modus="flitsen"
            seconden={figuur.seconden}
            toonBordje={false}
          />
        </div>
        {vak(0, "Hoeveel kralen zag je?", "groot", "neutraal")}
      </div>
    );
  }

  if (figuur.soort === "rekenrekaf") {
    /*
      De som staat bovenaan met het lege vakje erin, het rek eronder. Zo ziet
      een kind dat wat het wegschuift precies is wat er in de som vanaf gaat.
      Na een goed antwoord komt de redenering erbij: bij een som binnen het
      tiental de splitsing, bij een som over de tien de twee stappen.
    */
    const eenheden = figuur.van % 10;
    const naarTien = figuur.van - eenheden;
    const rest = figuur.af - eenheden;
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex items-center justify-center gap-3">
          <Gegeven waarde={figuur.van} kleur="oranje" />
          <Minteken />
          <Gegeven waarde={figuur.af} kleur="grijs" />
          <Isgelijk />
          {vak(0, "Hoeveel blijft er over?", "gewoon", "neutraal")}
        </div>

        <div className="w-full max-w-md">
          <Rekenrek
            aantal={figuur.van}
            eraf={figuur.af}
            modus="wegschuiven"
            splitsbeen={figuur.stand === "via10"}
            onWeg={setKralenWeg}
          />
        </div>

        {fase === "goed" && figuur.stand === "klein" && (
          <Nabeschouwing
            regels={[
              `${eenheden} − ${figuur.af} = ${eenheden - figuur.af}, dus ${figuur.van} − ${figuur.af} = ${figuur.van - figuur.af}`,
            ]}
          />
        )}

        {/*
          Bij een som over de tien komen de twee stappen mee terwijl het kind
          schuift: de eerste zodra de onderste rij leeg is en de bovenste rij
          oplicht, de tweede zodra alle rondjes vol zijn. De uitkomst van die
          tweede blijft een vraagteken tot het antwoord goed is — anders staat
          het antwoord er al voordat het kind heeft nagedacht.
        */}
        {figuur.stand === "via10" && kralenWeg >= eenheden && (
          <Nabeschouwing
            regels={[
              `${figuur.van} − ${eenheden} = ${naarTien}`,
              ...(kralenWeg >= figuur.af
                ? [`${naarTien} − ${rest} = ${fase === "goed" ? figuur.van - figuur.af : "?"}`]
                : []),
            ]}
          />
        )}
      </div>
    );
  }

  if (figuur.soort === "rekenrekhoofd") {
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Gegeven waarde={figuur.van} maat="groot" kleur="oranje" />
        <Minteken maat="groot" />
        <Gegeven waarde={figuur.af} maat="groot" kleur="grijs" />
        <Isgelijk maat="groot" />
        {vak(0, "De uitkomst", "groot", "neutraal")}
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
      vinkjeBijGoed
      onWijzig={(waarde) => {
        setGetypt(uitAntwoord(waarde, aantal));
        onWijzig(waarde);
      }}
    />
  );
}
