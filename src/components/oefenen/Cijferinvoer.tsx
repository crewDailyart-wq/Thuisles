"use client";

/**
 * Een getal invullen met een cijfertoetsenbord op het scherm.
 *
 * ---------------------------------------------------------------------------
 * Waarom geen gewoon invoervak
 * ---------------------------------------------------------------------------
 * Een `<input>` roept op een tablet het toetsenbord van het apparaat op, en dat
 * schuift over de oefening heen — precies over het beeld waar het kind naar
 * moet kijken om te kunnen tellen. Dit toetsenbord staat gewoon in de pagina:
 * het duwt niets weg en de toetsen zijn groot genoeg voor een kindervinger.
 *
 * Dezelfde toetsen als bij "Telrij stapstenen", in dezelfde volgorde, met
 * dezelfde wisknop met de backspace-pijl. Een kind dat het daar geleerd heeft,
 * hoeft hier niets nieuws te leren.
 *
 * ---------------------------------------------------------------------------
 * En op een laptop gewoon typen
 * ---------------------------------------------------------------------------
 * Wie een echt toetsenbord heeft, gebruikt dat. De cijfers werken, backspace
 * wist, en Enter is hetzelfde als op Controleer drukken. Er wordt meegeluisterd
 * op het venster en niet op een veld, want er ís geen veld om in te klikken.
 */

import { useEffect, useRef } from "react";
import { Wisser } from "@/components/oefenen/Symbolen";

/** Dezelfde indeling als het toetsenbord bij de stapstenen. */
const TOETSEN = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

export function Cijferinvoer({
  waarde,
  fase,
  markeer,
  maxCijfers = 3,
  onWijzig,
  onBevestig,
}: {
  waarde: string;
  fase: "bezig" | "goed" | "fout";
  /** Groep 3-4: fout kleurt rood. Zie het antwoordscherm. */
  markeer: boolean;
  maxCijfers?: number;
  onWijzig: (nieuw: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";

  /*
    Wat er nu staat, ook binnen dezelfde tel.

    React werkt de toestand pas bij het volgende beeldje bij. Twee toetsen vlak
    achter elkaar zouden daardoor allebei van dezelfde oude waarde uitgaan, en
    dan valt er eentje weg: "18" wordt dan "8". Deze verwijzing loopt mee met
    wat er net is getypt, zodat ook snel typen klopt.
  */
  const laatste = useRef(waarde);
  useEffect(() => {
    laatste.current = waarde;
  }, [waarde]);

  function typ(cijfer: string) {
    if (uit || laatste.current.length >= maxCijfers) return;
    laatste.current += cijfer;
    onWijzig(laatste.current);
  }

  function wis() {
    if (uit) return;
    laatste.current = laatste.current.slice(0, -1);
    onWijzig(laatste.current);
  }

  /*
    Meeluisteren op het echte toetsenbord.

    Alleen zolang het kind mag invullen, en alleen bij losse toetsen: met een
    Ctrl of Cmd erbij is het een snelkoppeling van de browser en daar blijven we
    vanaf.
  */
  useEffect(() => {
    if (uit) return;

    function bijToets(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      /*
        Staat de aandacht in een veld waar je in kunt typen, dan is die toets
        daarvoor. Zonder deze regel zou een cijfer in bijvoorbeeld een zoekvak
        hier worden weggekaapt.
      */
      const doel = e.target;
      if (
        doel instanceof HTMLElement &&
        (doel.tagName === "INPUT" || doel.tagName === "TEXTAREA" || doel.isContentEditable)
      ) {
        return;
      }
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        typ(e.key);
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        wis();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onBevestig();
      }
    }

    window.addEventListener("keydown", bijToets);
    return () => window.removeEventListener("keydown", bijToets);
  });

  const kleur =
    fase === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : markeer && fase === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-room/50";

  return (
    <div className="flex flex-col items-center gap-4">
      {/*
        Wat er tot nu toe staat, groot en op één plek.

        Geen invoervak maar een vlak om naar te kijken: er valt niets in te
        klikken, dus er hoort ook geen knipperende streep in te staan. Voor wie
        het scherm laat voorlezen staat er wél wat het is en wat erin staat.
      */}
      <output
        aria-live="polite"
        aria-label="Jouw antwoord"
        className={`grid h-24 w-28 place-items-center rounded-2xl border-2 text-4xl font-extrabold tabular-nums transition ${kleur}`}
      >
        {waarde === "" ? " " : waarde}
      </output>

      {fase === "bezig" && (
        <div
          role="group"
          aria-label="Cijfers"
          className="grid w-full max-w-[17rem] grid-cols-3 gap-2"
        >
          {TOETSEN.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => typ(t)}
              className={`h-14 rounded-2xl border-2 border-huisstijl bg-white text-2xl font-extrabold text-huisstijl-diep transition hover:bg-huisstijl-zacht ${
                t === "0" ? "col-start-2" : ""
              }`}
            >
              {t}
            </button>
          ))}
          {/*
            Wissen als beeld en niet als woord: dezelfde backspace-pijl als op
            een gewoon toetsenbord. De naam hangt er onzichtbaar aan, voor wie
            het scherm laat voorlezen.
          */}
          <button
            type="button"
            onClick={wis}
            aria-label="Wissen"
            title="Wissen"
            className="col-start-3 row-start-4 grid h-14 place-items-center rounded-2xl border-2 border-roze/50 bg-white text-roze transition hover:bg-roze-zacht"
          >
            <Wisser className="size-7" />
          </button>
        </div>
      )}
    </div>
  );
}
