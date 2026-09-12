"use client";

/**
 * Eén veld om een afbeelding te koppelen.
 *
 * Drie manieren, in oplopende luiheid:
 *   - typen (met aanvulling uit de bestaande bestanden);
 *   - kiezen uit de keuzelijst;
 *   - een nieuw bestand uploaden. Dat wordt meteen opgeslagen, aan de lijst
 *     toegevoegd en ingevuld — zonder dat er iets ververst hoeft te worden.
 *
 * Wordt gebruikt bij de afbeelding van de vraag zelf en bij elk antwoord, zodat
 * het overal hetzelfde werkt.
 */

import { useId, useRef, useState, useTransition } from "react";
import { uploadAfbeelding } from "@/app/admin/acties";
import { ACCEPT, controleerVooraf } from "@/lib/afbeeldingregels";

export function AfbeeldingKiezer({
  naam,
  waarde,
  beschikbaar,
  onWijzig,
  onNieuw,
  plaatshouder = "Afbeelding (optioneel)",
  compact = false,
}: {
  /** Naam van het formulierveld dat wordt meegestuurd. */
  naam: string;
  waarde: string;
  beschikbaar: string[];
  onWijzig: (waarde: string) => void;
  /** Wordt aangeroepen na een geslaagde upload, met de opgeslagen naam. */
  onNieuw: (bestandsnaam: string) => void;
  plaatshouder?: string;
  compact?: boolean;
}) {
  const lijstId = useId();
  const invoer = useRef<HTMLInputElement>(null);
  const [fout, setFout] = useState("");
  const [bezig, start] = useTransition();

  const bestaat = beschikbaar.includes(waarde);

  function kies(bestand: File) {
    const vooraf = controleerVooraf(bestand.name, bestand.size);
    if (vooraf) {
      setFout(vooraf);
      return;
    }
    setFout("");

    const data = new FormData();
    data.set("bestand", bestand);

    start(async () => {
      const uitslag = await uploadAfbeelding(data);
      if (uitslag.ok) onNieuw(uitslag.naam);
      else setFout(uitslag.fout);
    });
  }

  const veld = `w-full rounded-md border border-beheer-rand bg-white px-3 py-2 ${
    compact ? "text-xs" : "text-sm"
  } text-beheer-inkt outline-none transition placeholder:text-beheer-zacht/70 focus:border-viool focus:ring-2 focus:ring-viool/20`;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          name={naam}
          list={lijstId}
          value={waarde}
          onChange={(e) => onWijzig(e.target.value)}
          placeholder={plaatshouder}
          className={veld}
        />
        <datalist id={lijstId}>
          {beschikbaar.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>

        <button
          type="button"
          onClick={() => invoer.current?.click()}
          disabled={bezig}
          title="Nieuwe afbeelding uploaden vanaf je computer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-viool px-2.5 text-xs font-semibold text-viool transition hover:bg-viool/8 disabled:opacity-55"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
            <path d="M12 15.5V4.5M8 8.5 12 4.5l4 4M5 19.5h14" />
          </svg>
          {bezig ? "Bezig…" : "Uploaden"}
        </button>

        <input
          ref={invoer}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const b = e.target.files?.[0];
            if (b) kies(b);
            e.target.value = "";
          }}
        />

        {waarde ? (
          bestaat ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`/vragen/${waarde}`}
              alt=""
              className="size-10 shrink-0 rounded border border-beheer-rand bg-white object-contain p-0.5"
            />
          ) : (
            <span
              title="Dit bestand staat niet in public/vragen"
              className="grid size-10 shrink-0 place-items-center rounded border border-roze/40 bg-roze-zacht text-xs font-bold text-roze"
            >
              ?
            </span>
          )
        ) : (
          <span className="size-10 shrink-0 rounded border border-dashed border-beheer-rand" />
        )}
      </div>

      {fout && <p className="mt-1 text-xs font-medium text-roze">{fout}</p>}
    </div>
  );
}
