"use client";

/**
 * Bliepo op de vloer, met zijn tekstballon erboven (23 oktober 2026,
 * opdracht eigenaar). Voor alle opdrachten (Maatje) en lessen (Lesscherm).
 *
 *   - Op laptop en computer de echte 3D-Bliepo met losse bewegende onderdelen
 *     (Bliepo3DGedeeld, één gedeelde 3D-motor); op telefoon en tablet de
 *     bewegende filmpjes. Het lijntje op zijn scherm volgt live zijn stem.
 *   - De ballon staat BOVEN hem, met een puntje naar zijn hoofd: wat hij zegt
 *     en (in een les) wat het kind kan doen. Met een luidsprekerknopje om het
 *     nog eens te horen, en in opdrachten ook de knop om zijn stem uit te zetten
 *     (die stond er al).
 *   - `plek`: "vast" = rechts op de cirkel van de achtergrond (opdrachten op
 *     een groot scherm; op een staand of smal scherm onder het bord), "kolom"
 *     = in de rechterkolom van het lesvlak.
 *   - `gebaar`: juichen, bemoedigend knikken, nadenken of zwaaien.
 *   - `plek: "gesprek"` (26 oktober 2026): het gesprek met Bliepo
 *     (components/gesprek) gebruikt hetzelfde onderdeel, met zijn zinnen en
 *     antwoordknoppen boven hem zonder ballon, en de praatknop (`naast`)
 *     direct naast hem. Zo staat Bliepo in de oefening, de instaptoets, de les
 *     en het gesprek op dezelfde manier.
 *   - `robot`: een eigen Bliepo in plaats van de standaard 3D-Bliepo.
 */

import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { Luidspreker, LuidsprekerUit } from "@/components/oefenen/Symbolen";
import { useEffect, useRef } from "react";
import { meldBliepoAan } from "@/lib/bliepo-in-beeld";

export function BliepoVloer({
  children,
  plek = "vast",
  gebaar = null,
  onNogEens,
  geluid,
  onGeluid,
  className = "",
  robot,
  naast,
}: {
  children: React.ReactNode;
  plek?: "vast" | "kolom" | "gesprek";
  gebaar?: { naam: string; n: number | string; opStem?: boolean } | null;
  /** Het luidsprekerknopje: nog eens voorlezen. */
  onNogEens?: () => void;
  /** Staat zijn stem aan? Dan wisselt het knopje de stem aan/uit (opdrachten). */
  geluid?: boolean;
  onGeluid?: (aan: boolean) => void;
  className?: string;
  /** Een eigen Bliepo (bijvoorbeeld met een gebaar van buitenaf). */
  robot?: React.ReactNode;
  /** Iets direct naast Bliepo, zoals de praatknop. */
  naast?: React.ReactNode;
}) {
  const rustig = useBewegingsstand() !== "aan";
  const metSchakelaar = typeof geluid === "boolean" && onGeluid;
  /*
    Tekst en stem wachten tot Bliepo in beeld staat (26 oktober 2026,
    lib/bliepo-in-beeld.ts): hij meldt zich hier aan, en zodra hij voor het
    eerst getekend is, mogen opdracht en les beginnen met praten.
  */
  const aanmelding = useRef<ReturnType<typeof meldBliepoAan> | null>(null);
  const eigenRobot = Boolean(robot);
  useEffect(() => {
    const a = meldBliepoAan();
    aanmelding.current = a;
    if (eigenRobot) a.getekend();
    return () => {
      a.weg();
      aanmelding.current = null;
    };
  }, [eigenRobot]);
  const bliepo = (
    <div className="bliepo-vloer-robot" aria-hidden="true">
      {robot ?? <Bliepo3DGedeeld rustig={rustig} rusthoek={-Math.PI / 9} volgMuis gebaar={gebaar} geenTiktekst onKlaar={() => aanmelding.current?.getekend()} />}
    </div>
  );
  return (
    <div className={`bliepo-vloer ${className}`} data-plek={plek} data-maatje="">
      <div className="bliepo-vloer-ballon" aria-live="polite">
        <div className="bliepo-vloer-tekst">{children}</div>
        {(onNogEens || metSchakelaar) && (
        <div className="bliepo-vloer-knoppen">
          {onNogEens && (
            <button type="button" className="bliepo-vloer-geluid" onClick={onNogEens} aria-label="Nog eens horen" title="Nog eens horen">
              <NogEens />
            </button>
          )}
          {metSchakelaar && (
            <button
              type="button"
              className="bliepo-vloer-geluid bliepo-vloer-stem"
              onClick={() => onGeluid!(!geluid)}
              aria-pressed={geluid}
              aria-label={geluid ? "Stem van Bliepo uitzetten" : "Stem van Bliepo aanzetten"}
              title={geluid ? "Stem van Bliepo uit" : "Stem van Bliepo aan"}
            >
              {geluid ? <Luidspreker className="size-5" /> : <LuidsprekerUit className="size-5" />}
            </button>
          )}
        </div>
        )}
      </div>
      {naast ? (
        <div className="bliepo-vloer-onder">
          {bliepo}
          {naast}
        </div>
      ) : (
        bliepo
      )}
    </div>
  );
}

/** Nog eens horen: een pijltje in de rondte met een luidsprekertje erin. */
function NogEens() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4.5h-4.5" />
      <path d="M8.5 10.5h2l2.5-2v7l-2.5-2h-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}
