"use client";

/**
 * De bovenbalk van alle opdrachten in het nieuwe ontwerp (23 oktober 2026,
 * opdracht eigenaar, stijl van het plaatje "Kralen tellen").
 *
 * Eén rij over de hele breedte van het scherm, net als op de startpagina:
 *   - helemaal links de ronde terugknop;
 *   - daarnaast de gloeiende voortgangsbalk, lang over bijna de hele breedte
 *     (het hoofdonderdeel van de balk), met de titel van het leerdoel klein
 *     erboven links;
 *   - helemaal rechts "Vraag 3 van 15" (op telefoon kort: "3/15").
 *
 * Elk vakje in de balk is één vraag. Goed beantwoorde vakjes zijn helder
 * blauw gevuld, fout beantwoorde zacht oranje (zoals de groene en roze
 * bolletjes hiervoor), en het lichtgevende bolletje met sterretjes staat in
 * het vakje van de vraag van nu en schuift zacht mee.
 *
 * De sleutelteller staat hier op verzoek van de eigenaar niet meer; de
 * vliegende sleutel na een goed antwoord vliegt nu naar het bolletje
 * (`SLEUTEL_DOEL_ID`).
 */

import { PijlTerug } from "@/components/oefenen/Symbolen";
import { SLEUTEL_DOEL_ID } from "@/lib/sleutelwinkel";
import type { Bolstand } from "@/components/oefenen/Oefenbalk";

export function Voortgangskop({
  terugHref,
  titel,
  standen,
  index,
}: {
  terugHref: string;
  titel?: string;
  standen: Bolstand[];
  index: number;
}) {
  const aantal = Math.max(1, standen.length);
  const nu = Math.min(index + 1, standen.length);
  const plek = Math.min(1, (Math.min(index, aantal - 1) + 0.5) / aantal) * 100;

  return (
    <header data-oefenbalk="" className="vk">
      <div className="vk-rij">
        <a href={terugHref} aria-label="Terug" title="Terug" className="vk-terug">
          <PijlTerug className="size-6" />
        </a>

        <div className="vk-midden">
          {titel && <p className="vk-titel">{titel}</p>}
          <div
            className="vk-balk"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={standen.length}
            aria-valuenow={index}
            aria-label={`Vraag ${nu} van ${standen.length}`}
          >
            {standen.map((stand, i) => (
              <span key={i} className={`vk-vak vk-vak-${stand}`} />
            ))}
            <span className="vk-bol" style={{ left: `${plek}%` }} aria-hidden="true">
              <span id={SLEUTEL_DOEL_ID} className="vk-bol-kern" />
              <span className="vk-ster vk-ster-1">✦</span>
              <span className="vk-ster vk-ster-2">✦</span>
              <span className="vk-ster vk-ster-3">✦</span>
            </span>
          </div>
        </div>

        <p className="vk-teller">
          <span className="vk-teller-lang">
            Vraag {nu} van {standen.length}
          </span>
          <span className="vk-teller-kort" aria-hidden="true">
            {nu}/{standen.length}
          </span>
        </p>
      </div>
    </header>
  );
}
