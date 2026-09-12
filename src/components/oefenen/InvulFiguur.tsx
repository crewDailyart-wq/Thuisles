"use client";

/**
 * Een tekening waarin het kind rechtstreeks antwoordt.
 *
 * Het lege vakje uit de tekening wordt hier een echt invoerveld, precies op
 * dezelfde plek en in dezelfde stijl als de andere vakjes. Er is dus geen los
 * tekstveld ernaast meer nodig.
 *
 * Waarom een invoerveld óver de tekening en niet erin: zo blijft de tekening
 * een gewone tekening (die ook stil getoond kan worden, bijvoorbeeld in het
 * beheer), en gedraagt het invulveld zich als een normaal invoerveld — met
 * toetsenbord, cursor en voorleesondersteuning.
 *
 * De plek wordt in procenten berekend uit de maten van de tekening, zodat
 * vakje en veld bij elk schermformaat op elkaar blijven liggen.
 */

import { useEffect, useRef } from "react";
import { Figuurtekening, beschrijfFiguur } from "@/components/oefenen/Figuurtekening";
import type { Figuur } from "@/lib/generatoren/soort";

export type Invulfase = "bezig" | "goed" | "bijna" | "fout";

const STIJL: Record<Invulfase, string> = {
  bezig:
    "border-dashed border-oranje bg-white text-oranje-diep focus:border-solid focus:border-viool focus:text-inkt",
  goed: "border-solid border-groen bg-groen-zacht text-groen-diep",
  bijna: "border-solid border-oranje bg-amber-zacht text-oranje-diep",
  /* Groep 3-4: het eigen antwoord duidelijk rood, zonder tekst eromheen. */
  fout: "border-solid border-roze bg-roze-zacht text-roze",
};

export function InvulFiguur({
  figuur,
  waarde,
  fase,
  vraagId,
  label,
  onWijzig,
  onBevestig,
}: {
  figuur: Figuur;
  waarde: string;
  fase: Invulfase;
  /** Verandert bij elke nieuwe vraag; daarop springt de cursor terug. */
  vraagId: string;
  label: string;
  onWijzig: (waarde: string) => void;
  /** Enter doet hetzelfde als de knop Controleer. */
  onBevestig: () => void;
}) {
  const invoer = useRef<HTMLInputElement>(null);
  const beschrijving = beschrijfFiguur(figuur);
  const vak = beschrijving.invulvak;

  // Bij een nieuwe som staat de cursor meteen in het vakje.
  useEffect(() => {
    invoer.current?.focus();
  }, [vraagId]);

  if (!vak) return <Figuurtekening figuur={figuur} />;

  const naarProcent = (waarde: number, totaal: number) => `${(waarde / totaal) * 100}%`;

  return (
    <div className="relative mx-auto w-full max-w-[19rem]">
      <Figuurtekening figuur={figuur} interactief />

      <input
        ref={invoer}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={waarde}
        disabled={fase !== "bezig"}
        aria-label={label}
        onChange={(e) => onWijzig(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onBevestig();
          }
        }}
        className={`absolute rounded-[0.5rem] border-[2.5px] text-center text-[1.3rem] font-extrabold outline-none transition-colors disabled:cursor-default sm:text-[1.45rem] ${STIJL[fase]}`}
        style={{
          left: naarProcent(vak.x, beschrijving.breedte),
          top: naarProcent(vak.y, beschrijving.hoogte),
          width: naarProcent(vak.breedte, beschrijving.breedte),
          height: naarProcent(vak.hoogte, beschrijving.hoogte),
        }}
      />
    </div>
  );
}
