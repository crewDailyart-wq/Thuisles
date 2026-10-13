"use client";

/**
 * Een onderdeel aan de niveautest toevoegen: welke groep, welk leerdoel,
 * hoeveel vragen en bij welk referentieniveau.
 */

import { useActionState } from "react";
import { stijl } from "@/components/beheer/Bouwstenen";
import { voegToetsonderdeelToe, type Niveautestuitslag } from "@/app/admin/niveautestacties";

export type Leerdoelkeuze = { id: string; label: string; groep: string };

export function Niveautestformulier({
  leerdoelen,
  groepen,
  niveaus,
  max,
}: {
  /** Per vak en domein, zodat de lijst te overzien is. */
  leerdoelen: Leerdoelkeuze[];
  groepen: readonly number[];
  niveaus: readonly string[];
  max: number;
}) {
  const [uitslag, actie, bezig] = useActionState<Niveautestuitslag, FormData>(voegToetsonderdeelToe, null);
  const perGroep = new Map<string, Leerdoelkeuze[]>();
  for (const l of leerdoelen) perGroep.set(l.groep, [...(perGroep.get(l.groep) ?? []), l]);

  return (
    <form action={actie} className="grid gap-3 sm:grid-cols-[8rem_1fr_7rem_9rem]">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Groep</span>
        <select name="groep" className={stijl.veld} defaultValue={String(groepen.at(-1))}>
          {groepen.map((g) => (
            <option key={g} value={g}>
              Groep {g}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Leerdoel</span>
        <select name="leerdoel" required className={stijl.veld} defaultValue="">
          <option value="" disabled>
            Kies een leerdoel
          </option>
          {[...perGroep].map(([kop, rij]) => (
            <optgroup key={kop} label={kop}>
              {rij.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Vragen</span>
        <input name="aantal" type="number" min={1} max={max} defaultValue={3} required className={stijl.veld} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Referentieniveau</span>
        <select name="niveau" className={stijl.veld} defaultValue="">
          <option value="">Geen</option>
          {niveaus.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
        <button type="submit" className={stijl.knop} disabled={bezig}>
          {bezig ? "Bezig…" : "Toevoegen"}
        </button>
        {uitslag && (
          <p role="status" className={`text-sm ${uitslag.ok ? "text-groen-diep" : "text-roze"}`}>
            {uitslag.melding}
          </p>
        )}
      </div>
    </form>
  );
}

/** Uit de toets halen, met eerst een vraag. Het leerdoel zelf blijft staan. */
export function OnderdeelWeghalen({
  id,
  titel,
  groep,
  actie,
}: {
  id: string;
  titel: string;
  groep: number;
  actie: (data: FormData) => Promise<void>;
}) {
  return (
    <form
      action={actie}
      onSubmit={(e) => {
        if (!window.confirm(`"${titel}" uit de toets van groep ${groep} halen? Het leerdoel en de vragen blijven staan.`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={stijl.gevaar}>
        Uit de toets
      </button>
    </form>
  );
}
