"use client";

/**
 * Een getal intypen met het toetsenbord van het apparaat zelf.
 *
 * Eén vierkant vak onder de tekening; het kind tikt erop en typt het getal met
 * het toetsenbord van de laptop, de tablet of de telefoon. Gebruikt door
 * "Plaatjes tellen" en "Blokken tientallen en eenheden" als de vraag op open
 * vraag staat, en door de telspellen in het bos waar het kind zelf het aantal
 * invult.
 *
 * Er komt hier nooit een nagebouwd cijfertoetsenbord op het scherm; zie HARDE
 * REGEL 5 in CLAUDE.md.
 *
 * ---------------------------------------------------------------------------
 * Alleen cijfers
 * ---------------------------------------------------------------------------
 * `inputMode="numeric"` samen met `pattern="[0-9]*"`: die twee samen laten een
 * tablet en een telefoon het cijferblok tonen in plaats van het letterbord.
 * Alleen `inputMode` is niet genoeg — oudere iPads kijken naar het patroon.
 * Wat er toch aan letters binnenkomt (plakken, een spraakknop) wordt er bij het
 * typen uitgefilterd, zodat er nooit iets anders dan cijfers in het vak staat.
 *
 * ---------------------------------------------------------------------------
 * Het toetsenbord bedekt de onderste helft
 * ---------------------------------------------------------------------------
 * Op een tablet schuift dat toetsenbord over de pagina heen, en dan vallen het
 * invulvak en de knop Controleer er precies achter. Dat wordt overal in de app
 * op dezelfde manier opgelost; zie `useInBeeld` in `toetsenbordruimte.ts`.
 */

import { useRef } from "react";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";

export function Telinvoer({
  waarde,
  fase,
  markeer,
  maxCijfers = 3,
  label = "Typ je antwoord",
  onWijzig,
  onBevestig,
}: {
  waarde: string;
  fase: "bezig" | "goed" | "fout";
  /** Groep 3-4: fout kleurt rood. Zie het antwoordscherm. */
  markeer: boolean;
  maxCijfers?: number;
  /** Wat een voorleesprogramma zegt; per type anders, want de vraag is anders. */
  label?: string;
  onWijzig: (nieuw: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const vak = useRef<HTMLInputElement>(null);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  function typ(ruw: string) {
    if (uit) return;
    onWijzig(ruw.replace(/\D/g, "").slice(0, maxCijfers));
  }

  const kleur =
    fase === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : markeer && fase === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-room/50";

  return (
    <div className="flex flex-col items-center">
      {/*
        Even groot als het vak dat hier eerst stond, zodat het beeld hetzelfde
        blijft: één vierkant vlak onder de tekening met het getal er groot in.

        Geen labeltje erboven — een leeg vak onder een telvraag spreekt voor
        zich — maar wel een naam voor wie het scherm laat voorlezen.
      */}
      <input
        ref={vak}
        type="text"
        aria-label={label}
        value={waarde}
        disabled={uit}
        autoComplete="off"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        maxLength={maxCijfers}
        onFocus={(e) => bijAandacht(e.currentTarget)}
        onBlur={bijWeggaan}
        onChange={(e) => typ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            /*
              Eerst het toetsenbord dicht en dan nakijken: anders staat de
              uitslag onder het toetsenbord en ziet het kind hem niet.
            */
            vak.current?.blur();
            onBevestig();
          }
        }}
        className={`grid h-24 w-28 place-items-center rounded-2xl border-2 text-center text-4xl font-extrabold tabular-nums outline-none transition focus:border-huisstijl disabled:cursor-not-allowed ${kleur}`}
      />
    </div>
  );
}
