"use client";

/**
 * Elke beweging van Bliepo los bekijken (23 oktober 2026, opdracht eigenaar).
 *
 * Het 3D-model had al losse onderdelen met scharnieren; sinds vandaag bewegen
 * ze apart en vloeiend (Levendig in lib/zappie3d/zappie.js): in rust kijkt hij
 * rond en veren de antennes na, en hieronder speelt elke knop één beweging.
 * "Praten" laat hem een zin zeggen: dan knikt hij mee op de stem en maakt hij
 * kleine handgebaren. Op de telefoon staat er een filmpje van dezelfde
 * beweging (BliepoFilmpje).
 */

import { useState } from "react";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { zeg } from "@/lib/stem";

const KNOPPEN: { naam: string; tekst: string }[] = [
  { naam: "greet", tekst: "Zwaaien (begroeting)" },
  { naam: "cap", tekst: "Petje rechtzetten" },
  { naam: "think", tekst: "Nadenken" },
  { naam: "correct", tekst: "Goed antwoord" },
  { naam: "incorrect", tekst: "Fout (bemoedigend knikken)" },
  { naam: "checkTail", tekst: "Naar zijn stekker kijken" },
];

export function BewegingenDemo() {
  const [gebaar, zetGebaar] = useState<{ naam: string; n: number } | null>(null);
  const [rustig, zetRustig] = useState(false);
  const speel = (naam: string) => zetGebaar((g) => ({ naam, n: (g?.n ?? 0) + 1 }));

  return (
    <section className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/20 bg-white/5 p-5" aria-labelledby="kop-bewegingen">
      <h2 id="kop-bewegingen" className="text-xl font-bold">
        Bewegingen van Bliepo
      </h2>
      <p className="mt-1 text-sm text-white/75">
        In rust staat hij stevig en ademt hij zacht; zijn hoofd kijkt af en toe rond (of naar de muis), de antennes veren na,
        en soms zwaait hij of zet hij zijn petje recht. Klik op een knop om één beweging te zien.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[260px_1fr]">
        <div className="relative mx-auto aspect-[276/348] w-full max-w-[260px]">
          <Bliepo3DGedeeld rustig={rustig} rusthoek={0} gebaar={gebaar} />
        </div>
        <div className="flex flex-wrap content-start gap-2">
          {KNOPPEN.map((k) => (
            <button
              key={k.naam}
              type="button"
              onClick={() => speel(k.naam)}
              className="min-h-11 rounded-full bg-white px-4 py-2 font-bold text-[#0d2a6b] hover:bg-sky-100"
            >
              {k.tekst}
            </button>
          ))}
          <button
            type="button"
            onClick={() => zeg("Hoi! Kijk, als ik praat, knik ik mee en beweeg ik mijn handen een beetje.")}
            className="min-h-11 rounded-full bg-white px-4 py-2 font-bold text-[#0d2a6b] hover:bg-sky-100"
          >
            Praten
          </button>
          <button
            type="button"
            onClick={() => zetRustig((r) => !r)}
            className="min-h-11 rounded-full border border-white/50 px-4 py-2 font-bold text-white hover:bg-white/10"
          >
            {rustig ? "Beweging aan" : "Beweging uit"}
          </button>
        </div>
      </div>
    </section>
  );
}
