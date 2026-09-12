"use client";

/**
 * Beheerscherm voor afbeeldingen: uploaden en overzicht in één.
 *
 * Staat als client-component samen, zodat het overzicht meteen bijwerkt na een
 * upload zonder dat er iets ververst hoeft te worden.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { verwijderAfbeeldingActie } from "@/app/admin/acties";
import { AfbeeldingBulkUpload } from "@/components/beheer/AfbeeldingBulkUpload";
import type { AfbeeldingRegel } from "@/lib/data/afbeeldingen";

export function Afbeeldingbeheer({
  afbeeldingen,
  gebruik,
}: {
  afbeeldingen: AfbeeldingRegel[];
  /** Per bestandsnaam: in hoeveel vragen hij wordt gebruikt. */
  gebruik: Record<string, number>;
}) {
  const router = useRouter();
  const [zoek, setZoek] = useState("");

  const getoond = afbeeldingen.filter((a) =>
    a.naam.toLowerCase().includes(zoek.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Nieuwe afbeeldingen toevoegen</h2>
        <AfbeeldingBulkUpload onKlaar={() => router.refresh()} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              Beschikbare afbeeldingen ({afbeeldingen.length})
            </h2>
            <p className="text-xs text-beheer-zacht">
              Deze kun je koppelen aan een vraag of aan een antwoord.
            </p>
          </div>

          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op bestandsnaam"
            className="h-9 w-56 rounded-md border border-beheer-rand bg-white px-2.5 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20"
          />
        </div>

        {getoond.length === 0 ? (
          <p className="rounded-lg border border-beheer-rand bg-beheer-kaart px-4 py-10 text-center text-sm text-beheer-zacht">
            {afbeeldingen.length === 0
              ? "Er staan nog geen afbeeldingen klaar. Upload er hierboven een paar."
              : "Geen afbeelding met die naam."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {getoond.map((a) => {
              const aantal = gebruik[a.naam] ?? 0;
              return (
                <li
                  key={a.naam}
                  className="flex flex-col overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/vragen/${a.naam}`}
                    alt={a.naam}
                    className="aspect-square w-full bg-beheer-vlak object-contain p-2"
                  />

                  <div className="flex flex-1 flex-col gap-1 border-t border-beheer-rand p-2">
                    <p className="truncate font-mono text-[0.7rem]" title={a.naam}>
                      {a.naam}
                    </p>
                    <p className="text-[0.68rem] text-beheer-zacht">
                      {a.grootte}
                      {aantal > 0 && ` · in ${aantal} ${aantal === 1 ? "vraag" : "vragen"}`}
                    </p>

                    <div className="mt-auto pt-1">
                      {aantal > 0 ? (
                        <span
                          title="Deze afbeelding wordt gebruikt en kan niet worden verwijderd."
                          className="text-[0.68rem] font-medium text-beheer-zacht"
                        >
                          In gebruik
                        </span>
                      ) : (
                        <form action={verwijderAfbeeldingActie}>
                          <input type="hidden" name="naam" value={a.naam} />
                          <button
                            type="submit"
                            className="text-[0.68rem] font-medium text-beheer-zacht transition hover:text-roze"
                          >
                            Verwijderen
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
