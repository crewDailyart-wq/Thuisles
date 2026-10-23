"use client";

/**
 * Oplichten aan of uit (23 oktober 2026, opdracht eigenaar): terwijl Bliepo
 * voorleest lichten de woorden en sommen op. Staat standaard aan; hier zet het
 * kind of de ouder het om. Bewaard op dit apparaat, net als de andere
 * lesvoorkeuren (components/les/voorkeuren.ts).
 */

import { useState, useSyncExternalStore } from "react";
import { bewaarVoorkeuren, leesVoorkeuren } from "@/components/les/voorkeuren";

const geen = () => () => {};

export function OplichtenKeuze() {
  const opgeslagen = useSyncExternalStore(geen, () => leesVoorkeuren().oplichten, () => true);
  const [aan, zetAan] = useState<boolean | null>(null);
  const nu = aan ?? opgeslagen;
  const kies = (w: boolean) => {
    bewaarVoorkeuren({ oplichten: w });
    zetAan(w);
  };
  return (
    <fieldset className="mt-6 border-t border-rand pt-6 text-left">
      <legend className="text-base font-extrabold">Woorden laten oplichten</legend>
      <p className="mt-1 text-sm font-semibold text-inkt-zacht">Terwijl Bliepo voorleest, lichten de woorden en sommen op.</p>
      <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Woorden laten oplichten">
        {[
          { w: true, tekst: "Aan" },
          { w: false, tekst: "Uit" },
        ].map((k) => (
          <button
            key={k.tekst}
            type="button"
            role="radio"
            aria-checked={nu === k.w}
            onClick={() => kies(k.w)}
            className={`min-h-11 flex-1 rounded-full border-2 px-5 text-base font-extrabold transition ${
              nu === k.w ? "border-huisstijl bg-huisstijl text-white" : "border-rand bg-white text-inkt-zacht hover:border-huisstijl"
            }`}
          >
            {k.tekst}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
