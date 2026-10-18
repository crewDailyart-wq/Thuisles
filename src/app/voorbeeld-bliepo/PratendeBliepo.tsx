"use client";

/**
 * Proef op /voorbeeld-bliepo: Bliepo zoals in de lessen, met het live lijntje
 * op zijn scherm (18 oktober 2026). "Laat Bliepo praten" speelt een kort
 * testgeluid af via lib/bliepo-geluid.ts, precies zoals de stem straks gaat.
 */

import { useState } from "react";
import { Bliepo } from "@/components/avontuur/Bliepo";
import { useBewegingsstand, zetOmgevingRustig } from "@/components/zappie/reis/beweging";
import { speelBliepoGeluid } from "@/lib/bliepo-geluid";
import type { MaatjeHouding } from "@/lib/maatje/poppetje";

const HOUDINGEN: { id: MaatjeHouding; naam: string }[] = [
  { id: "rustig", naam: "Rustig" },
  { id: "blij", naam: "Juichen" },
  { id: "denkt", naam: "Nadenken" },
  { id: "troost", naam: "Troosten" },
];

export function PratendeBliepo() {
  const [houding, zetHouding] = useState<MaatjeHouding>("rustig");
  const [beurt, zetBeurt] = useState(0);
  const beweging = useBewegingsstand();
  const knop = "rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 aria-pressed:bg-white/20";

  return (
    <section className="mt-6 rounded-3xl border border-white/20 bg-white/5 p-4" aria-labelledby="kop-praten">
      <h2 id="kop-praten" className="text-lg font-bold">
        Bliepo in de lessen: het lijntje praat mee
      </h2>
      <p className="max-w-3xl text-sm text-white/70">
        Bliepo is een plaatje zonder lijntje; alleen het lijntje wordt live getekend. Als hij praat, springt het mee op
        het geluid; als hij stil is, is het een rustig hartslaglijntje. Bij &quot;Beweging uit&quot; blijft het een rustige lijn.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-6">
        {/* key: bij een nieuwe houding begint het juichen of leunen opnieuw */}
        <Bliepo key={`${houding}-${beurt}`} houding={houding} className="w-40 sm:w-56" />
        <div className="flex max-w-md flex-wrap gap-2">
          <button
            type="button"
            className={`${knop} bg-[#ffc72c] !text-[#0d2a6b] hover:bg-[#ffd75e]`}
            onClick={() => speelBliepoGeluid("/assets/zappie/bliepo/testgeluid.mp3")}
          >
            Laat Bliepo praten
          </button>
          <button type="button" className={knop} onClick={() => zetOmgevingRustig(beweging === "aan")}>
            {beweging === "aan" ? "Beweging uit" : "Beweging aan"}
          </button>
          {HOUDINGEN.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-pressed={houding === h.id}
              className={knop}
              onClick={() => {
                zetHouding(h.id);
                zetBeurt((b) => b + 1);
              }}
            >
              {h.naam}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
