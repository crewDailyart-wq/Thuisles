"use client";

/**
 * De uitlegspeler: speelt een uitlegscript af.
 *
 * Eén ding tegelijk in beeld, groot, zonder afleiding. Vos zegt per stap één
 * zin en leest die voor. Het kind bepaalt het tempo met "Verder", of kiest
 * "Afspelen" om het achter elkaar te zien. Bij een teltap tikt het kind zelf
 * de blokjes aan.
 *
 * De speler weet niets over rekenen. Hij speelt af wat een generator-type
 * aanlevert, dus een nieuw soort som werkt hier vanzelf mee.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BosBeeld } from "@/components/oefenen/BosSpel";
import { Bus, Kralenrij, Splitsboom } from "@/components/oefenen/Figuurtekening";
import {
  Driehoek,
  Kruisje,
  PijlVooruit,
  RondeTerugpijl,
} from "@/components/oefenen/Symbolen";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
import { Telfiguur } from "@/components/oefenen/Telfiguren";
import { Steenrij } from "@/components/oefenen/Stapstenen";
import { Getallenlijnbeeld } from "@/components/oefenen/Getallenlijn";
import { Uitlegraster } from "@/components/oefenen/Plaatjesraster";
import { Uitlegblokken } from "@/components/oefenen/Mabblokken";
import { Uitlegstraat } from "@/components/oefenen/Huizenrij";
import { Uitlegvissen } from "@/components/oefenen/Visvijver";
import { Uitlegtrein } from "@/components/oefenen/Trein";
import { Uitlegvak } from "@/components/oefenen/Vakken";
import { Uitlegzaal } from "@/components/oefenen/Bioscoop";
import { Blokjes } from "@/components/oefenen/modellen/Blokjes";
import {
  abonneerOpgavegeluid,
  belletje,
  opgavegeluidOpServer,
  opgavegeluidStaatAan,
  tel,
} from "@/lib/geluid";
import { stopPraten, zeg } from "@/lib/stem";
import { STANDAARD_TIKZIN } from "@/lib/generatoren/uitlegscript";
import type { Bloktoestand, Model, Uitlegscript } from "@/lib/generatoren/uitlegscript";

export function Uitlegspeler({
  script,
  onSluit,
  onNogEen,
  mascotte = null,
  telplaatje = null,
  vakmateriaal = null,
  vakperRij = null,
}: {
  script: Uitlegscript;
  onSluit: () => void;
  /** Aangeboden na afloop: nog een vergelijkbare som proberen. */
  onNogEen?: () => void;
  /**
   * De mascotte van de vraag waar deze uitleg bij hoort.
   *
   * Die staat bij de vraag en niet in de somgegevens — daar passen alleen
   * getallen in. Zo ziet het kind in de uitleg dezelfde vos als in de vraag.
   */
  mascotte?: string | null;
  /**
   * Welk getekend telplaatje er in de vraag stond.
   *
   * Zelfde reden als bij `mascotte`: in de somgegevens passen alleen getallen,
   * dus de naam van het plaatje kan alleen langs deze weg mee. Zo telt het kind
   * in de uitleg dezelfde eendjes als in de vraag.
   */
  telplaatje?: string | null;
  /**
   * Welk materiaal er in de vakken zat: telplaatjes, kralen of blokken, en
   * hoe het lag.
   *
   * Zelfde reden als bij `telplaatje`: in de somgegevens passen alleen
   * getallen, dus dit kan alleen langs deze weg mee.
   */
  vakmateriaal?: string | null;
  vakperRij?: number | null;
}) {
  const [stapNr, setStapNr] = useState(0);
  const [getikt, setGetikt] = useState<number[]>([]);
  const [automatisch, setAutomatisch] = useState(false);
  const [wijsSleutel, setWijsSleutel] = useState(0);

  /*
    Een rustig duwtje naar "Verder", alleen voor groep 3.

    Doet het kind een paar seconden niets, dan wijst Vos naar de knop en zegt
    wat die doet. Eén keer per stap, en meteen weg zodra er iets gebeurt — het
    is een aanbod, geen aansporing die blijft doorgaan.

    Alleen groep 3: vanaf groep 4 weet een kind wel wat een knop met een pijl
    doet, en dan wordt zo'n duwtje betuttelend.
  */
  const [duwtjeVoor, setDuwtjeVoor] = useState<string | null>(null);
  /*
    Eén geluidsknop, en die staat in de opgave — rechtsboven de kaart. Er zat
    hier vroeger een tweede; die is eruit, omdat een kind van zes niet hoort te
    moeten uitzoeken welke van twee luidsprekers wát het zwijgen oplegt.

    Wat die knop hier uitzet, is alleen de versiering: het tiktoontje bij het
    meetellen en het belletje bij het antwoord.

    Wat Vos zégt, blijft altijd klinken. De gesproken uitleg is waar dit
    filmpje voor bestaat; die wegdrukken met dezelfde knop die een plopje
    dempt, zou betekenen dat een kind de les kwijtraakt omdat het de
    geluidjes te druk vond. Het hardop meetellen hoort daar ook bij: tellen is
    horen wélk getal erbij komt.
  */
  const geluidAan = useSyncExternalStore(
    abonneerOpgavegeluid,
    opgavegeluidStaatAan,
    opgavegeluidOpServer,
  );
  const tijdklok = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stap = script.stappen[stapNr];
  const laatste = stapNr === script.stappen.length - 1;

  /*
    Waarop er getikt moet worden. Het generator-type geeft dat mee, want alleen
    dat weet of het kralen, kinderen of blokjes zijn. Zegt een type er niets
    over, dan de algemene zin.
  */
  const tikzin = stap?.meetellen ? (stap.meetellen.aansporing ?? STANDAARD_TIKZIN) : "";

  const voorGroep3 = script.vorm === "3";

  /*
    Vos leest de zin voor zodra een stap in beeld komt.

    Moet het kind tikken, dan zegt hij er meteen bij waarop — in dezelfde adem,
    want twee losse aanroepen zouden elkaar afbreken. Voorheen kwam die
    aansporing pas na zes seconden, en zat een kind dus te wachten op iets wat
    het nog niet wist.
  */
  useEffect(() => {
    if (!stap) return;
    zeg(tikzin ? `${stap.zin} ${tikzin}` : stap.zin);
    return () => stopPraten();
  }, [stapNr, stap, tikzin]);

  /*
    Doet het kind niets bij een teltap, dan wijst het handje opnieuw en
    herhaalt Vos de aansporing. Zodra er getikt is, stopt dat.
  */
  useEffect(() => {
    if (!stap?.meetellen || getikt.length > 0) return;
    const klok = setInterval(() => {
      setWijsSleutel((n) => n + 1);
      zeg(tikzin);
    }, 6000);
    return () => clearInterval(klok);
  }, [stapNr, stap, getikt.length, tikzin]);

  // Het feestje bij het antwoord.
  useEffect(() => {
    if (stap?.feest && geluidAan) belletje();
  }, [stapNr, stap, geluidAan]);

  // Vanzelf doorlopen als "Afspelen" aanstaat.
  useEffect(() => {
    if (!automatisch || laatste || stap?.meetellen) return;
    tijdklok.current = setTimeout(() => setStapNr((n) => n + 1), 2600);
    return () => {
      if (tijdklok.current) clearTimeout(tijdklok.current);
    };
  }, [automatisch, stapNr, laatste, stap]);

  const nogTeTikken = stap?.meetellen ? stap.meetellen.aantal - getikt.length : 0;
  const magVerder = !stap?.meetellen || nogTeTikken <= 0;

  /*
    Het duwtje van hierboven. De klok begint bij elke nieuwe stap opnieuw en
    wordt afgebroken zodra het kind doorklikt of de stap verandert, zodat er
    nooit twee tegelijk lopen.

    Zes seconden: lang genoeg om rustig naar het plaatje te kijken, kort genoeg
    om niet vast te lopen.
  */
  useEffect(() => {
    if (!voorGroep3 || laatste || automatisch || !magVerder) return;

    const klok = setTimeout(() => {
      setDuwtjeVoor(`${script.vorm}:${stapNr}`);
      zeg("Klik hier om verder te gaan");
    }, 6000);

    return () => clearTimeout(klok);
  }, [voorGroep3, laatste, automatisch, magVerder, stapNr, script.vorm]);

  /*
    Of het duwtje nú in beeld hoort.

    Bewust afgeleid en niet onthouden als losse vlag: die bleef aan staan bij de
    volgende stap en zelfs bij een andere groep. Door de vorm én het stapnummer
    in de waarde te zetten, hoort het duwtje altijd bij precies dat ene moment.
  */
  const wijsNaarVerder =
    voorGroep3 && !laatste && duwtjeVoor === `${script.vorm}:${stapNr}`;


  function verder() {
    setDuwtjeVoor(null);
    if (laatste) return;
    setStapNr(stapNr + 1);
    setGetikt([]);
    setWijsSleutel(0);
  }

  function opnieuw() {
    setDuwtjeVoor(null);
    setStapNr(0);
    setGetikt([]);
    setAutomatisch(false);
  }

  function tik(index: number) {
    setDuwtjeVoor(null);
    if (getikt.includes(index)) return;
    const nieuw = [...getikt, index];
    setGetikt(nieuw);
    /* Het tiktoontje is versiering en volgt de geluidsknop. */
    if (geluidAan) tel();
    /*
      Hardop meetellen. Het getal zelf uitspreken werkt beter dan alleen een
      toontje: tellen is horen wélk getal erbij komt, niet dát er iets bij
      komt. De stem leest "3" in het Nederlands als "drie".

      Dit is uitleg, geen versiering, dus het klinkt ook als het geluid uit
      staat — net als de zinnen die Vos voorleest.
    */
    zeg(String(nieuw.length));
    if (stap?.meetellen && nieuw.length >= stap.meetellen.aantal && geluidAan) {
      belletje();
    }
  }

  if (!stap) return null;

  return (
    <div className="mt-5 rounded-groot border-2 border-huisstijl/25 bg-huisstijl-zacht/40 p-4 sm:p-5">
      {/*
        Kop met alleen knopjes.

        De titel ("Zo doe je het — tellen met vijven") is weg: het paneel spreekt
        voor zich, en die zin was voor de jongste kinderen toch niet te lezen.
        De strategienaam is daarmee niet verdwenen uit de app — hij staat nog in
        het beheer bij "Bekijk uitleg", waar hij wél gelezen wordt.

        De sluitknop is een symbool zonder tekst. De naam hangt als
        `aria-label` en `title` aan de knop, zodat een voorleesprogramma blijft
        zeggen wat hij doet.

        Hier stond ook een luidsprekerknop. Die is eruit: het geluid van het
        filmpje hangt nu aan de ene knop in de opgave, samen met de plop en het
        sleutelgeluid.
      */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onSluit}
          aria-label="Sluiten"
          title="Sluiten"
          className="grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-huisstijl"
        >
          <Kruisje className="size-6" />
        </button>
      </div>

      {/* Het model: één ding tegelijk, groot */}
      <div className="rounded-2xl bg-white p-4 sm:p-6">
        <div className="mx-auto w-full max-w-md">
          <Modelbeeld
            model={stap.model}
            getikt={getikt}
            mascotte={mascotte}
            telplaatje={telplaatje}
            vakmateriaal={vakmateriaal}
            vakperRij={vakperRij}
            telbaar={Boolean(stap.meetellen)}
            telbaarAantal={stap.meetellen?.aantal ?? 0}
            wijsAan={Boolean(stap.meetellen) && getikt.length === 0}
            wijsSleutel={wijsSleutel}
            onTik={tik}
          />
        </div>
      </div>

      {/* Vos met zijn zin. Hij wisselt van kant als de stap dat aangeeft. */}
      <div
        className={`mt-3 flex items-end gap-2.5 transition-all duration-700 ${
          stap.kant === "rechts" ? "flex-row-reverse" : ""
        }`}
      >
        {/*
          `key` op de stap: bij elke nieuwe stap wordt Vos opnieuw opgebouwd,
          zodat het knikje echt opnieuw afspeelt in plaats van één keer bij het
          openen. Zo beweegt hij mee met de voortgang.
        */}
        <span
          key={stapNr}
          className="animate-vos-knik grid size-16 shrink-0 place-items-center rounded-full bg-white shadow-zacht"
        >
          <VosFiguur
            houding={wijsNaarVerder ? "wijzend" : (stap.houding ?? "blij")}
            beweging={wijsNaarVerder ? "wijzen" : (stap.beweging ?? "praten")}
            className="size-14"
          />
        </span>
        <p
          className={`relative rounded-kaart bg-white px-4 py-3 text-base font-extrabold shadow-zacht ${
            stap.kant === "rechts" ? "rounded-br-md" : "rounded-bl-md"
          }`}
        >
          {stap.zin}
          <span
            aria-hidden="true"
            className={`absolute bottom-3 size-3 rotate-45 bg-white ${
              stap.kant === "rechts" ? "-right-1.5" : "-left-1.5"
            }`}
          />
        </p>
      </div>

      {/* Meetellen */}
      {stap.meetellen && (
        <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2.5 text-center text-sm font-extrabold text-huisstijl-diep">
          {nogTeTikken > 0
            ? /*
                 Dezelfde zin als Vos zegt, maar zonder het uitroepteken: er komt
                 hier nog een telling achteraan. Voorheen stond hier een eigen
                 lijstje per model, dat los kon lopen van wat het type meegaf.
               */
              `${tikzin.replace(/!+$/, "")} — ${
                getikt.length === 0
                  ? `${stap.meetellen.aantal} te tellen`
                  : `${getikt.length} geteld, nog ${nogTeTikken} te gaan`
              }`
            : `Je hebt er ${getikt.length} geteld!`}
        </p>
      )}

      {/*
        Bediening.

        "Verder" is de knop waar het om draait en is daarom duidelijk zwaarder
        gemaakt dan de andere twee: groter, gevuld, met schaduw en een groot
        symbool. De andere twee zijn er wel, maar vragen geen aandacht. Zo is in
        één oogopslag te zien waar je moet klikken, zonder dat er iets verdwijnt.
      */}
      {/*
        Het duwtje in beeld, alleen voor groep 3. Bewust hier en niet in de
        tekstballon van Vos: die blijft de zin van de stap houden, zodat er
        niets verdwijnt waar het kind net naar zat te kijken.
      */}
      {wijsNaarVerder && !laatste && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-extrabold text-huisstijl">
          <span aria-hidden="true" className="motion-safe:animate-hand-wijs text-lg">
            👇
          </span>
          Klik hier om verder te gaan
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {/*
          Alleen symbolen, geen woorden.

          De naam van de knop verdwijnt daarmee niet: hij staat als `aria-label`
          (voor een voorleesprogramma) en als `title` (het tekstwolkje bij
          aanwijzen met de muis). Een knop zonder toegankelijke naam is voor wie
          het scherm niet ziet een knop zonder functie, en dat zou wél iets
          weghalen.

          De vlakken zijn rond en ruim: "Verder" is 64 pixels, de andere twee 48.
          Allebei ruim boven de 44 pixels die een vingertop nodig heeft, en
          "Verder" blijft duidelijk de grootste.
        */}
        {!laatste && (
          <button
            type="button"
            onClick={verder}
            disabled={!magVerder}
            aria-label="Verder"
            title="Verder"
            className={`grid size-16 place-items-center rounded-full bg-huisstijl-diep text-white shadow-op transition hover:bg-huisstijl-donker disabled:opacity-45 ${
              wijsNaarVerder ? "motion-safe:animate-blok-klaar ring-4 ring-huisstijl/30" : ""
            }`}
          >
            <PijlVooruit className="size-9" />
          </button>
        )}

        {!laatste && !automatisch && (
          <button
            type="button"
            onClick={() => setAutomatisch(true)}
            aria-label="Afspelen"
            title="Afspelen"
            className="grid size-12 place-items-center rounded-full border-2 border-huisstijl text-huisstijl transition hover:bg-huisstijl-zacht"
          >
            <Driehoek className="size-6" />
          </button>
        )}

        <button
          type="button"
          onClick={opnieuw}
          aria-label="Nog een keer"
          title="Nog een keer"
          className="grid size-12 place-items-center rounded-full border-2 border-rand text-inkt-zacht transition hover:border-huisstijl hover:text-huisstijl"
        >
          <RondeTerugpijl className="size-6" />
        </button>

        {laatste && onNogEen && (
          <button
            type="button"
            onClick={onNogEen}
            className="inline-flex items-center gap-2 rounded-full bg-groen px-5 py-3 text-base font-extrabold text-white transition hover:bg-groen-diep"
          >
            Wil je er nog eentje proberen?
          </button>
        )}
      </div>

      {/* Waar ben ik? */}
      <div className="mt-3 flex gap-1.5">
        {script.stappen.map((s, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < stapNr ? "bg-huisstijl" : i === stapNr ? "bg-huisstijl-diep" : "bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Modelbeeld({
  model,
  getikt,
  mascotte,
  telplaatje,
  vakmateriaal,
  vakperRij,
  telbaar,
  telbaarAantal,
  wijsAan,
  wijsSleutel,
  onTik,
}: {
  model: Model;
  getikt: number[];
  /** De mascotte van de vraag; zie `Uitlegspeler`. */
  mascotte: string | null;
  /** Het getekende telplaatje van de vraag; zie `Uitlegspeler`. */
  telplaatje: string | null;
  /** Het materiaal in de vakken van de vraag; zie `Uitlegspeler`. */
  vakmateriaal: string | null;
  /** De opstelling in die vakken; zie `Uitlegspeler`. */
  vakperRij: number | null;
  telbaar: boolean;
  /** Hoeveel er bij deze stap geteld moeten worden. */
  telbaarAantal: number;
  wijsAan: boolean;
  wijsSleutel: number;
  onTik: (i: number) => void;
}) {
  if (model.soort === "bosspel") {
    return <BosBeeld figuur={model.figuur} opgelicht={model.opgelicht} opgelost={model.opgelost} />;
  }
  if (model.soort === "blokjes") {
    const blokjes: Bloktoestand[] = model.blokjes.map((t, i) =>
      getikt.includes(i) ? "geteld" : t,
    );
    return (
      <Blokjes
        blokjes={blokjes}
        perRij={model.perRij}
        bijschrift={model.bijschrift}
        telbaar={telbaar}
        wijsAan={wijsAan}
        wijsSleutel={wijsSleutel}
        onTik={onTik}
      />
    );
  }

  if (model.soort === "kralen") {
    return (
      <Kralenrij
        figuur={{
          soort: "kralenrij",
          totaal: model.totaal,
          perGroep: model.perGroep,
          pijlOp: model.pijlOp,
          palet: model.palet,
        }}
        opgelicht={model.opgelicht}
        toonPijl={model.pijlOp > 0}
        telbaar={telbaar}
        telbaarAantal={telbaarAantal}
        getikt={getikt}
        wijsAan={wijsAan}
        wijsSleutel={wijsSleutel}
        onTik={onTik}
      />
    );
  }

  if (model.soort === "bus") {
    return (
      <Bus
        figuur={{
          soort: "bus",
          plaatsen: model.plaatsen,
          totaal: model.totaal,
          perGroep: model.perGroep,
          palet: model.palet,
        }}
        opgelicht={model.opgelicht}
        bijschrift={model.bijschrift}
        telbaar={telbaar}
        telbaarAantal={telbaarAantal}
        getikt={getikt}
        wijsAan={wijsAan}
        wijsSleutel={wijsSleutel}
        onTik={onTik}
      />
    );
  }

  if (model.soort === "telfiguur") {
    return (
      <div className="flex flex-col items-center gap-2">
        <Telfiguur
          soort={model.telsoort}
          aantal={model.aantal}
          opgelicht={model.opgelicht}
          className="h-48 w-48 drop-shadow-sm sm:h-56 sm:w-56"
          telbaar={telbaar}
          telbaarAantal={telbaarAantal}
          getikt={getikt}
          wijsAan={wijsAan}
          wijsSleutel={wijsSleutel}
          onTik={onTik}
        />
        {model.bijschrift && (
          <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">
            {model.bijschrift}
          </p>
        )}
      </div>
    );
  }

  if (model.soort === "stapstenen") {
    return (
      <div className="w-full">
        <Steenrij
          figuur={{
            soort: "stapstenen",
            stenen: model.stenen,
            sprong: model.sprong,
            richting: model.richting,
            mascotte: model.mascotte ?? mascotte,
          }}
          /* Zelfde beeld als in de vraag: oever links, en gespiegeld bij terugtellen. */
          startoever
          spiegelen
          vosOp={model.vosOp}
          boogVan={model.boogVan}
        />
      </div>
    );
  }

  if (model.soort === "plaatjesraster") {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <Uitlegraster
          aantal={model.aantal}
          /* Hetzelfde getekende plaatje als in de vraag; zie `telplaatje`. */
          plaatje={model.plaatje ?? telplaatje}
          /* Het plaatje staat bij de vraag; zie de toelichting bij `mascotte`. */
          afbeelding={model.afbeelding ?? mascotte}
          perRij={model.perRij}
          groepsruimte={model.groepsruimte}
          opgelicht={model.opgelicht}
          rijNadruk={model.rijNadruk}
          telbaar={telbaar}
          getikt={getikt}
          onTik={onTik}
        />
        {model.bijschrift && (
          <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">
            {model.bijschrift}
          </p>
        )}
      </div>
    );
  }

  if (model.soort === "mabblokken") {
    return (
      <Uitlegblokken
        tientallen={model.tientallen}
        eenheden={model.eenheden}
        stavenOp={model.stavenOp}
        losseOp={model.losseOp}
        nadruk={model.nadruk}
        bijschrift={model.bijschrift}
      />
    );
  }

  if (model.soort === "huizenrij") {
    return (
      <Uitlegstraat
        huizen={model.huizen}
        vosBij={model.vosBij}
        zichtbaar={model.zichtbaar}
        nadruk={model.nadruk}
        bijschrift={model.bijschrift}
      />
    );
  }

  if (model.soort === "visvijver") {
    return (
      <Uitlegvissen vissen={model.vissen} nadruk={model.nadruk} bijschrift={model.bijschrift} />
    );
  }

  if (model.soort === "trein") {
    return (
      <Uitlegtrein
        volgorde={model.volgorde}
        klaar={model.klaar}
        nadruk={model.nadruk}
        bijschrift={model.bijschrift}
      />
    );
  }

  if (model.soort === "vak") {
    return (
      <Uitlegvak
        aantal={model.aantal}
        /* Materiaal, plaatje en opstelling komen van de vraag; zie `telplaatje`. */
        soort={(model.materiaal ?? vakmateriaal ?? "telplaatjes") as "telplaatjes" | "kralen" | "blokken"}
        plaatje={model.plaatje ?? telplaatje ?? "eend"}
        perRij={vakperRij ?? 5}
        geteld={model.geteld}
        bijschrift={model.bijschrift}
      />
    );
  }

  if (model.soort === "bioscoop") {
    return (
      <Uitlegzaal
        aantal={model.aantal}
        perRij={model.perRij}
        zichtbaar={model.zichtbaar}
        vanaf={model.vanaf}
        tot={model.tot}
        bijschrift={model.bijschrift}
      />
    );
  }

  if (model.soort === "splitsboom") {
    return (
      <Splitsboom
        figuur={{
          soort: "splitsboom",
          geheel: model.geheel,
          links: model.links,
          rechts: model.rechts,
        }}
      />
    );
  }

  if (model.soort === "getallenlijn") {
    /*
      Dezelfde lijn als in de vraag. `telTot` is het streepje waar Vos in deze
      stap staat, `nadruk` het getal dat oplicht, en `vlag` zet het vlaggetje
      neer zodra hij er is. De mascotte zelf zit in de speler eromheen.
    */
    return (
      <div className="w-full">
        {model.wijzer !== undefined ? (
          /* De tussenstand: het wijzertje met de twee vakjes eronder op de lijn. */
          <Getallenlijnbeeld
            start={model.start}
            eind={model.eind}
            stap={model.stap}
            zichtbaar={model.zichtbaar}
            wijzer={{ getal: model.wijzer, licht: model.nadruk !== null }}
            vakjes={model.vakjes ?? []}
            getypt={model.getypt ?? []}
            opDeLijn
            nadruk={model.nadruk}
            /*
              Vos loopt in de uitleg over de lijn mee: eerst naar het streepje
              links van het wijzertje, dan naar dat rechts ervan. Zijn plaatje
              komt uit de vraag; zie `mascotte` hierboven.
            */
            vos={mascotte ? { vangend: mascotte, wachtend: mascotte, blij: mascotte } : null}
            vosBij={model.telTot}
          />
        ) : (
          <Getallenlijnbeeld
            start={model.start}
            eind={model.eind}
            stap={model.stap}
            zichtbaar={model.zichtbaar}
            vosBij={model.telTot}
            vlag={model.doel}
            geplant={model.vlag}
            nadruk={model.nadruk}
            /* De schatstand: een vrije lijn met hulpstreepjes; zie het model. */
            vrij={model.vrij}
            hulplijnen={model.hulplijnen ?? []}
            vos={
              model.vrij && mascotte
                ? { vangend: mascotte, wachtend: mascotte, blij: mascotte }
                : null
            }
          />
        )}
      </div>
    );
  }

  return (
    <p className="py-6 text-center text-3xl font-extrabold tabular-nums sm:text-4xl">
      {model.tekst}
    </p>
  );
}
