"use client";

/**
 * Een werkblad of poster uploaden. Na het opslaan staat het uit; aanzetten
 * gaat in de lijst eronder.
 */

import { useActionState } from "react";
import { stijl } from "@/components/beheer/Bouwstenen";
import { uploadWerkblad, type Werkbladuitslag } from "@/app/admin/werkbladacties";

export function Werkbladformulier({ maxMb }: { maxMb: number }) {
  const [uitslag, actie, bezig] = useActionState<Werkbladuitslag, FormData>(uploadWerkblad, null);

  return (
    <form action={actie} className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Titel</span>
        <input name="titel" required className={stijl.veld} placeholder="Bijvoorbeeld: Breuken op een rij" />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Korte omschrijving</span>
        <input name="omschrijving" className={stijl.veld} placeholder="Eén zin over wat erop staat" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Soort</span>
        <select name="soort" className={stijl.veld} defaultValue="werkblad">
          <option value="werkblad">Werkblad</option>
          <option value="poster">Poster</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Vak</span>
        <input name="vak" className={stijl.veld} placeholder="Rekenen, Taal, Spelling…" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Groepen</span>
        <input name="groepen" className={stijl.veld} placeholder="Bijvoorbeeld: 5 t/m 8" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Bestand</span>
        <input
          name="bestand"
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          className="text-sm"
        />
        <span className="text-xs text-beheer-zacht">PDF, PNG, JPG of WEBP, hoogstens {maxMb} MB.</span>
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" className={stijl.knop} disabled={bezig}>
          {bezig ? "Bezig met opslaan…" : "Opslaan"}
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

/** Weghalen, met eerst een vraag: het bestand gaat ook weg. */
export function WerkbladWeghalen({ id, titel, actie }: { id: string; titel: string; actie: (data: FormData) => Promise<void> }) {
  return (
    <form
      action={actie}
      onSubmit={(e) => {
        if (!window.confirm(`"${titel}" weghalen? Het bestand gaat ook weg.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={stijl.gevaar}>
        Weghalen
      </button>
    </form>
  );
}
