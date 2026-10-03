"use client";

/**
 * Het antwoordvak bij een verhaaltjessom.
 *
 * Het verhaal zelf staat als vraag bovenaan. Hieronder kiest het kind uit vier
 * knoppen met de eenheid erbij ("12 stickers"), of typt het getal in een gewoon
 * invoerveld met de eenheid erachter. Geen getallenpad: alleen een echt
 * invoerveld met cijfers en het toetsenbord van het apparaat (HARDE REGEL 5).
 */

import { useEffect, useRef, useState } from "react";
import { Keuzeknoppen } from "@/components/oefenen/Tijdopdracht";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import type { Verhaalfiguur } from "@/lib/verhaalfiguren";

type Fase = "bezig" | "goed" | "fout";

export function Verhaalopdracht({
  figuur,
  antwoord,
  juist,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
}: {
  figuur: Verhaalfiguur;
  antwoord: string;
  /** Het goede antwoord zoals het in de vraag staat: een getal, of het nummer van de knop. */
  juist: string;
  fase: Fase;
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
}) {
  const uit = fase !== "bezig";
  const [waarde, setWaarde] = useState(antwoord);
  const veld = useRef<HTMLInputElement | null>(null);
  const { bijAandacht, bijWeggaan } = useInBeeld();

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setWaarde("");
  }, [fase]);

  useEffect(() => {
    if (metCursor && fase === "bezig" && !figuur.keuzes) veld.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);

  if (figuur.keuzes) {
    const gekozen = waarde === "" ? null : Number(waarde);
    return (
      <div className="flex w-full flex-col items-center">
        <Keuzeknoppen
          keuzes={figuur.keuzes}
          gekozen={gekozen}
          juist={figuur.goed}
          uit={uit}
          onKies={(n) => {
            if (uit) return;
            setWaarde(String(n));
            onWijzig(String(n));
          }}
          tweeKolommen
        />
      </div>
    );
  }

  const uitslag = !uit ? null : waarde !== "" && Number(waarde) === Number(juist) ? "goed" : "fout";
  const kleur =
    uitslag === "goed"
      ? "border-groen bg-groen-zacht text-groen-diep"
      : uitslag === "fout"
        ? "border-roze bg-roze-zacht text-roze"
        : "border-rand bg-kaart text-inkt focus-within:border-huisstijl";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Je antwoord">
      <span className={`grid h-16 w-24 place-items-center rounded-2xl border-2 text-2xl font-extrabold tabular-nums ${kleur}`}>
        <input
          ref={veld}
          type="text"
          aria-label={`Het antwoord, in ${figuur.eenheid}`}
          value={waarde}
          placeholder={uitslag === null ? "?" : undefined}
          readOnly={uit}
          disabled={uit}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          maxLength={3}
          onFocus={(e) => bijAandacht(e.currentTarget)}
          onBlur={bijWeggaan}
          onChange={(e) => {
            if (uit) return;
            const schoon = e.target.value.replace(/\D/g, "").slice(0, 3);
            setWaarde(schoon);
            onWijzig(schoon === "" ? "" : String(Number(schoon)));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onBevestig();
            }
          }}
          className="size-full rounded-[inherit] bg-transparent text-center outline-none placeholder:text-rand"
        />
      </span>
      <span className="text-xl font-extrabold text-inkt-zacht">{figuur.eenheid}</span>
    </div>
  );
}
