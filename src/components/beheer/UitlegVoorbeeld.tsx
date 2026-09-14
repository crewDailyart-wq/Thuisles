"use client";

/**
 * "Bekijk uitleg" in het beheer.
 *
 * Laat per groepsvorm precies zien wat een kind te zien krijgt. Daarvoor wordt
 * hetzelfde onderdeel gebruikt als op de kinderkant (`Uitlegweergave`), niet
 * een eigen versie — zo kunnen de twee niet uit elkaar lopen.
 *
 * Elke groep is apart te bekijken. Groep 3 tot en met 6 krijgt de animatie met
 * Vos, groep 7 en 8 de compacte stappenlijst. Bestaat een animatie nog niet, dan
 * zie je hier de terugval die het kind ook krijgt.
 */

import { useState } from "react";
import { stijl } from "@/components/beheer/Bouwstenen";
import { Uitlegweergave } from "@/components/oefenen/Uitlegweergave";
import { zoekGenerator } from "@/lib/generatoren";
import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import {
  GROEPSVORMEN,
  MANIER_VAN_VORM,
  VORM_OMSCHRIJVING,
  type Groepsvorm,
} from "@/lib/generatoren/uitlegscript";

export function UitlegVoorbeeld({
  soort,
  voorbeeld,
}: {
  soort: string;
  /** Een som van dit type, om de uitleg mee te laten zien. */
  voorbeeld: Somgegevens;
}) {
  const generator = zoekGenerator(soort);
  const bron = generator?.uitleganimatie ?? null;

  const [open, setOpen] = useState(false);
  const [vorm, setVorm] = useState<Groepsvorm>("3");
  const [strategie, setStrategie] = useState(bron?.standaardStrategie("3") ?? "standaard");

  if (!bron) return null;

  const script = bron.script(voorbeeld, vorm, strategie);
  // Wat het kind ziet als er (nog) geen animatie is: de "zo los je het op"-stappen.
  const terugval = generator?.aanpak.stappen(voorbeeld).map((st) => ({
    tekst: st.tekst,
    som: st.som,
    figuur: st.figuur,
  }));

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={stijl.knopStil}>
        Bekijk uitleg
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-beheer-rand bg-beheer-vlak/60 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Groepsvorm
            </span>
            <select
              value={vorm}
              onChange={(e) => setVorm(e.target.value as Groepsvorm)}
              className={stijl.veld}
            >
              {GROEPSVORMEN.map((v) => (
                <option key={v} value={v}>
                  {VORM_OMSCHRIJVING[v]}
                </option>
              ))}
            </select>
          </label>

          {bron.strategieen.length > 0 && (
            <label className="block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                Strategie
              </span>
              <select
                value={strategie}
                onChange={(e) => setStrategie(e.target.value)}
                className={stijl.veld}
              >
                {bron.strategieen.map((s) => (
                  <option key={s.waarde} value={s.waarde}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <button type="button" onClick={() => setOpen(false)} className={stijl.knopStil}>
          Sluiten
        </button>
      </div>

      <p className="mt-2 text-xs text-beheer-zacht">
        Voorbeeldsom: {voorbeeld.getallen.join(" en ")} — antwoord {voorbeeld.goed}. Modellen:{" "}
        {bron.modellen.join(", ")}.
      </p>

      {!script && MANIER_VAN_VORM[vorm] !== "78" && (
        <p className="mt-3 rounded-md border border-oranje/40 bg-oranje-zacht px-3 py-2 text-sm text-oranje-diep">
          Voor {VORM_OMSCHRIJVING[vorm].toLowerCase()} is er nog geen animatie. Hieronder staat
          wat een kind dan wél ziet.
        </p>
      )}

      {/*
        Precies wat een kind ziet. `font-sans` zet het kinderlettertype terug,
        want de beheeromgeving gebruikt een ander lettertype.
      */}
      <div className="mt-1 font-sans">
        <Uitlegweergave
          vorm={vorm}
          script={script}
          terugval={terugval}
          onSluit={() => setOpen(false)}
        />
      </div>

      <p className="mt-3 text-xs text-beheer-zacht">
        Wordt er een denkfout herkend, dan staan hier de stappen van die
        denkfout. Zonder herkende denkfout ziet een kind precies dit.
      </p>
    </div>
  );
}
