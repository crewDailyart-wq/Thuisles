"use client";

/**
 * De knop "zet deze oefeningen klaar".
 *
 * Staat onderaan een pagina als vervolgactie, en geeft daarna in gewone taal
 * terug wat er is gebeurd.
 */

import { useActionState } from "react";
import { haalOefeningWeg, zetOefeningenKlaar } from "@/app/ouder/voortgangacties";

type Uitkomst = { fout: string } | { gelukt: string } | null;

export function ZetKlaar({
  kindId,
  leerdoelIds,
  reden,
  label,
}: {
  kindId: string;
  leerdoelIds: string[];
  reden: string;
  label: string;
}) {
  const [uitkomst, verstuur, bezig] = useActionState<Uitkomst, FormData>(
    zetOefeningenKlaar,
    null,
  );

  if (leerdoelIds.length === 0) return null;

  return (
    <form action={verstuur} className="flex flex-col gap-3">
      <input type="hidden" name="kindId" value={kindId} />
      <input type="hidden" name="reden" value={reden} />
      {leerdoelIds.map((id) => (
        <input key={id} type="hidden" name="leerdoelId" value={id} />
      ))}

      {uitkomst && (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2.5 text-sm ${
            "fout" in uitkomst
              ? "border-oranje/40 bg-oranje-zacht text-oranje-diep"
              : "border-groen/40 bg-groen-zacht text-groen-diep"
          }`}
        >
          {"fout" in uitkomst ? uitkomst.fout : uitkomst.gelukt}
        </p>
      )}

      <button
        type="submit"
        disabled={bezig}
        className="inline-flex min-h-11 items-center justify-center self-start rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
      >
        {bezig ? "Even geduld…" : label}
      </button>
    </form>
  );
}

/** Wat er nu klaarstaat, met de mogelijkheid het weer weg te halen. */
export function Klaargezet({
  kindId,
  items,
}: {
  kindId: string;
  items: { id: string; titel: string; reden: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center gap-3 border-t border-beheer-rand-zacht py-2.5 first:border-t-0"
        >
          <span className="min-w-0 flex-1 text-sm">
            <span className="block font-medium">{item.titel}</span>
            <span className="block text-xs text-beheer-zacht">{item.reden}</span>
          </span>
          <form action={haalOefeningWeg}>
            <input type="hidden" name="kindId" value={kindId} />
            <input type="hidden" name="klaargezetId" value={item.id} />
            <button
              type="submit"
              className="min-h-11 text-xs text-beheer-zacht transition hover:text-viool"
            >
              Weghalen
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
