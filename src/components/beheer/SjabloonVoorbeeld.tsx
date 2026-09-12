"use client";

/**
 * Live voorbeeld van tien sommen.
 *
 * Draait volledig in de browser: de generatoren zijn puur rekenwerk zonder
 * database, dus het voorbeeld ververst meteen bij elke wijziging, zonder
 * wachten en zonder dat er iets wordt opgeslagen.
 */

import { useMemo } from "react";
import { Kralenrij, Splitsboom } from "@/components/oefenen/Figuurtekening";
import { zoekGenerator } from "@/lib/generatoren";
import type { Instellingen } from "@/lib/generatoren/soort";

export function SjabloonVoorbeeld({
  soort,
  instellingen,
  aantal = 10,
  /* Voor welke groep het voorbeeld is; bepaalt welke vraagzin je ziet. */
  groep = 5,
}: {
  soort: string;
  instellingen: Instellingen;
  aantal?: number;
  groep?: number;
}) {
  const generator = zoekGenerator(soort);

  const sommen = useMemo(() => {
    if (!generator) return [];
    // Vast zaad: het voorbeeld springt dan niet rond bij elke toetsaanslag.
    return generator.maak(instellingen, aantal, new Set(), 20260101, groep);
  }, [generator, instellingen, aantal, groep]);

  const maximum = generator?.maximum(instellingen) ?? null;

  if (!generator) return null;

  if (sommen.length === 0) {
    return (
      <p className="rounded-md border border-oranje/40 bg-oranje-zacht px-3 py-2 text-sm text-oranje-diep">
        Met deze instellingen komen er geen sommen uit. Vink bijvoorbeeld een
        tafel aan, of maak het bereik ruimer.
      </p>
    );
  }

  return (
    <div>
      <ol className="divide-y divide-beheer-rand-zacht rounded-md border border-beheer-rand">
        {sommen.map((som, i) => {
          const antwoord =
            som.vorm === "meerkeuze"
              ? (som.opties?.[Number(som.antwoord)]?.tekst ?? "?")
              : som.antwoord;

          return (
            <li key={som.handtekening} className="flex items-start gap-3 px-3 py-2">
              <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-beheer-zacht">
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{som.vraagtekst}</p>

                {som.figuur?.soort === "splitsboom" && (
                  <div className="mt-1 w-32">
                    <Splitsboom figuur={som.figuur} />
                  </div>
                )}

                {/*
                  Een kralenketting is breed; die krijgt meer ruimte dan de
                  splitsboom, anders zijn de kralen niet te tellen.
                */}
                {som.figuur?.soort === "kralenrij" && (
                  <div className="mt-1 w-full max-w-sm">
                    <Kralenrij figuur={som.figuur} pijlBeweegt={false} />
                  </div>
                )}

                {som.vorm === "meerkeuze" && (
                  <p className="mt-0.5 text-xs text-beheer-zacht">
                    Keuzes: {(som.opties ?? []).map((o) => o.tekst).join(" · ")}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded bg-groen-zacht px-2 py-0.5 text-xs font-semibold text-groen-diep">
                {antwoord}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-2 text-xs text-beheer-zacht">
        {maximum === null
          ? "Er zijn heel veel verschillende sommen mogelijk met deze instellingen."
          : `Met deze instellingen zijn er in totaal ${maximum} verschillende sommen mogelijk.`}
      </p>
    </div>
  );
}
