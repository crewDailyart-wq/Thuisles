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
import { Bus, Kralenrij, Splitsboom } from "@/components/oefenen/Figuurtekening";
import {
  Driehoek,
  Kruisje,
  Luidspreker,
  LuidsprekerUit,
  PijlVooruit,
  RondeTerugpijl,
} from "@/components/oefenen/Symbolen";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
import { Telfiguur } from "@/components/oefenen/Telfiguren";
import { Blokjes } from "@/components/oefenen/modellen/Blokjes";
import {
  abonneerGeluid,
  belletje,
  geluidOpServer,
  geluidStaatAan,
  tel,
  zetGeluid,
} from "@/lib/geluid";
import { stopPraten, zeg } from "@/lib/stem";
import { STANDAARD_TIKZIN } from "@/lib/generatoren/uitlegscript";
import type { Bloktoestand, Model, Uitlegscript } from "@/lib/generatoren/uitlegscript";

export function Uitlegspeler({
  script,
  onSluit,
  onNogEen,
}: {
  script: Uitlegscript;
  onSluit: () => void;
  /** Aangeboden na afloop: nog een vergelijkbare som proberen. */
  onNogEen?: () => void;
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
  const geluidAan = useSyncExternalStore(abonneerGeluid, geluidStaatAan, geluidOpServer);
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
    if (!geluidAan || !stap) return;
    zeg(tikzin ? `${stap.zin} ${tikzin}` : stap.zin);
    return () => stopPraten();
  }, [stapNr, geluidAan, stap, tikzin]);

  /*
    Doet het kind niets bij een teltap, dan wijst het handje opnieuw en
    herhaalt Vos de aansporing. Zodra er getikt is, stopt dat.
  */
  useEffect(() => {
    if (!stap?.meetellen || getikt.length > 0) return;
    const klok = setInterval(() => {
      setWijsSleutel((n) => n + 1);
      if (geluidAan) zeg(tikzin);
    }, 6000);
    return () => clearInterval(klok);
  }, [stapNr, stap, getikt.length, geluidAan, tikzin]);

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
      if (geluidAan) zeg("Klik hier om verder te gaan");
    }, 6000);

    return () => clearTimeout(klok);
  }, [voorGroep3, laatste, automatisch, magVerder, stapNr, geluidAan, script.vorm]);

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
    if (geluidAan) {
      tel();
      /*
        Hardop meetellen. Het getal zelf uitspreken werkt beter dan alleen een
        toontje: tellen is horen wélk getal erbij komt, niet dát er iets bij
        komt. De stem leest "3" in het Nederlands als "drie".
      */
      zeg(String(nieuw.length));
    }
    if (stap?.meetellen && nieuw.length >= stap.meetellen.aantal && geluidAan) {
      belletje();
    }
  }

  if (!stap) return null;

  return (
    <div className="mt-5 rounded-groot border-2 border-viool/25 bg-viool-zacht/40 p-4 sm:p-5">
      {/*
        Kop met alleen knopjes.

        De titel ("Zo doe je het — tellen met vijven") is weg: het paneel spreekt
        voor zich, en die zin was voor de jongste kinderen toch niet te lezen.
        De strategienaam is daarmee niet verdwenen uit de app — hij staat nog in
        het beheer bij "Bekijk uitleg", waar hij wél gelezen wordt.

        De twee knoppen zijn symbolen zonder tekst. Hun naam hangt als
        `aria-label` en `title` aan de knop, zodat een voorleesprogramma blijft
        zeggen wat ze doen. `aria-pressed` blijft staan: dat vertelt of het
        geluid aan of uit staat.
      */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => zetGeluid(!geluidAan)}
          aria-pressed={geluidAan}
          aria-label={geluidAan ? "Geluid aan" : "Geluid uit"}
          title={geluidAan ? "Geluid aan" : "Geluid uit"}
          className="grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-viool"
        >
          {geluidAan ? (
            <Luidspreker className="size-6" />
          ) : (
            <LuidsprekerUit className="size-6" />
          )}
        </button>
        <button
          type="button"
          onClick={onSluit}
          aria-label="Sluiten"
          title="Sluiten"
          className="grid size-11 place-items-center rounded-full bg-white/80 text-inkt-zacht transition hover:text-viool"
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
        <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2.5 text-center text-sm font-extrabold text-viool-diep">
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
        <p className="mt-3 flex items-center gap-1.5 text-sm font-extrabold text-viool">
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
            className={`grid size-16 place-items-center rounded-full bg-viool text-white shadow-op transition hover:bg-viool-diep disabled:opacity-45 ${
              wijsNaarVerder ? "motion-safe:animate-blok-klaar ring-4 ring-viool/30" : ""
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
            className="grid size-12 place-items-center rounded-full border-2 border-viool text-viool transition hover:bg-viool-zacht"
          >
            <Driehoek className="size-6" />
          </button>
        )}

        <button
          type="button"
          onClick={opnieuw}
          aria-label="Nog een keer"
          title="Nog een keer"
          className="grid size-12 place-items-center rounded-full border-2 border-rand text-inkt-zacht transition hover:border-viool hover:text-viool"
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
              i < stapNr ? "bg-viool" : i === stapNr ? "bg-viool-diep" : "bg-white/70"
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
  telbaar,
  telbaarAantal,
  wijsAan,
  wijsSleutel,
  onTik,
}: {
  model: Model;
  getikt: number[];
  telbaar: boolean;
  /** Hoeveel er bij deze stap geteld moeten worden. */
  telbaarAantal: number;
  wijsAan: boolean;
  wijsSleutel: number;
  onTik: (i: number) => void;
}) {
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
          <p className="text-3xl font-extrabold tabular-nums text-viool-diep">
            {model.bijschrift}
          </p>
        )}
      </div>
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

  return (
    <p className="py-6 text-center text-3xl font-extrabold tabular-nums sm:text-4xl">
      {model.tekst}
    </p>
  );
}
