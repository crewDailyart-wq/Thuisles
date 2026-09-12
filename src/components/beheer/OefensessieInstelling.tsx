"use client";

/**
 * De algemene standaard voor het aantal vragen per oefensessie.
 *
 * Geldt voor elk leerdoel dat zelf geen aantal heeft ingesteld. Een leerdoel
 * dat wél een eigen aantal heeft, trekt zich hier niets van aan — zo hoef je
 * alleen de uitzonderingen apart te regelen.
 */

import { useState } from "react";
import { Paneel, stijl } from "@/components/beheer/Bouwstenen";
import { Fout, useActie } from "@/components/beheer/RegelFormulier";
import { zetAlgemeenAantal } from "@/app/admin/instellingacties";

export function OefensessieInstelling({
  huidig,
  afwijkend,
}: {
  huidig: number;
  /** Hoeveel leerdoelen een eigen aantal hebben; die volgen dit niet. */
  afwijkend: number;
}) {
  const { doe, bezig, fout } = useActie();
  const [aantal, setAantal] = useState(huidig);
  const [bericht, setBericht] = useState("");

  return (
    <Paneel
      titel="Oefensessies"
      bijschrift="Hoeveel vragen een kind per oefensessie krijgt."
    >
      <form
        action={(data) =>
          doe(
            () => zetAlgemeenAantal(data),
            (u) => setBericht(`Opgeslagen: ${u.ok ? u.waarde : aantal} vragen per sessie.`),
          )
        }
        className="flex flex-wrap items-end gap-3"
      >
        <label className="block">
          <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
            Standaard aantal vragen
          </span>
          <input
            name="aantal"
            type="number"
            min={1}
            max={50}
            value={aantal}
            onChange={(e) => setAantal(Number(e.target.value))}
            className={`${stijl.veld} w-32`}
          />
        </label>
        <button type="submit" disabled={bezig} className={stijl.knop}>
          Opslaan
        </button>
      </form>

      <Fout tekst={fout} />
      {bericht && <p className="mt-2 text-sm text-groen-diep">{bericht}</p>}

      <p className="mt-3 text-xs text-beheer-zacht">
        {afwijkend === 0
          ? "Alle leerdoelen volgen deze standaard."
          : `${afwijkend} ${afwijkend === 1 ? "leerdoel heeft" : "leerdoelen hebben"} een eigen aantal ingesteld en volgen deze standaard niet. Dat pas je aan bij het leerdoel zelf.`}{" "}
        Zijn er minder gepubliceerde vragen dan gevraagd, dan komen ze gewoon allemaal langs.
      </p>
    </Paneel>
  );
}
