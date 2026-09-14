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
import { Icoon } from "@/components/kind/Icoon";
import { Bus, Kralenrij, Splitsboom } from "@/components/oefenen/Figuurtekening";
import { VosFiguur } from "@/components/oefenen/VosFiguur";
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
  const geluidAan = useSyncExternalStore(abonneerGeluid, geluidStaatAan, geluidOpServer);
  const tijdklok = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stap = script.stappen[stapNr];
  const laatste = stapNr === script.stappen.length - 1;

  // Vos leest de zin voor zodra een stap in beeld komt.
  useEffect(() => {
    if (geluidAan && stap) zeg(stap.zin);
    return () => stopPraten();
  }, [stapNr, geluidAan, stap]);

  /*
    Doet het kind niets bij een teltap, dan wijst het handje opnieuw en
    herhaalt Vos de aansporing. Zodra er getikt is, stopt dat.
  */
  useEffect(() => {
    if (!stap?.meetellen || getikt.length > 0) return;
    const klok = setInterval(() => {
      setWijsSleutel((n) => n + 1);
      if (geluidAan) zeg(stap.meetellen?.aansporing ?? "Tik maar mee!");
    }, 6000);
    return () => clearInterval(klok);
  }, [stapNr, stap, getikt.length, geluidAan]);

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

  function verder() {
    if (laatste) return;
    setStapNr(stapNr + 1);
    setGetikt([]);
    setWijsSleutel(0);
  }

  function opnieuw() {
    setStapNr(0);
    setGetikt([]);
    setAutomatisch(false);
  }

  function tik(index: number) {
    if (getikt.includes(index)) return;
    const nieuw = [...getikt, index];
    setGetikt(nieuw);
    if (geluidAan) tel();
    if (stap?.meetellen && nieuw.length >= stap.meetellen.aantal && geluidAan) {
      belletje();
    }
  }

  if (!stap) return null;

  return (
    <div className="mt-5 rounded-groot border-2 border-viool/25 bg-viool-zacht/40 p-4 sm:p-5">
      {/* Kop met strategie en knopjes */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-viool-diep">
          Zo doe je het — {script.strategieNaam}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => zetGeluid(!geluidAan)}
            aria-pressed={geluidAan}
            className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-inkt-zacht transition hover:text-viool"
          >
            {geluidAan ? "🔊 Geluid aan" : "🔇 Geluid uit"}
          </button>
          <button
            type="button"
            onClick={onSluit}
            className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-inkt-zacht transition hover:text-viool"
          >
            Sluiten
          </button>
        </div>
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
            houding={stap.houding ?? "blij"}
            beweging={stap.beweging ?? "praten"}
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
            ? `${
                stap.model.soort === "kralen"
                  ? "Tik de kralen aan"
                  : stap.model.soort === "bus"
                    ? "Tik de kinderen aan"
                    : "Tik de blokjes aan"
              } — nog ${nogTeTikken} te gaan`
            : `Je hebt er ${getikt.length} geteld!`}
        </p>
      )}

      {/* Bediening */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {!laatste && (
          <button
            type="button"
            onClick={verder}
            disabled={!magVerder}
            className="inline-flex items-center gap-2 rounded-full bg-viool px-6 py-3 text-base font-extrabold text-white transition hover:bg-viool-diep disabled:opacity-45"
          >
            Verder
            <Icoon naam="pijl" className="size-5" />
          </button>
        )}

        {!laatste && !automatisch && (
          <button
            type="button"
            onClick={() => setAutomatisch(true)}
            className="rounded-full border-2 border-viool px-4 py-2.5 text-sm font-extrabold text-viool transition hover:bg-viool-zacht"
          >
            ▶ Afspelen
          </button>
        )}

        <button
          type="button"
          onClick={opnieuw}
          className="rounded-full border-2 border-rand px-4 py-2.5 text-sm font-extrabold text-inkt-zacht transition hover:border-viool hover:text-viool"
        >
          Nog een keer
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
