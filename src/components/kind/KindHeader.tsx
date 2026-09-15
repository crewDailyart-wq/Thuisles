/**
 * Header van de kindomgeving.
 *
 * Grote, vette begroeting, met daarnaast de sleutelteller en een
 * profielbolletje met naam en groep. Bewust rustig: het laat zien wat er is
 * zonder druk te zetten.
 */

import { Begroeting } from "@/components/kind/Begroeting";
import { Groepwisselaar } from "@/components/kind/Groepwisselaar";
import { Pictogram } from "@/components/kind/Pictogram";
import { Sleutelteller } from "@/components/kind/Sleutelteller";
import type { Kind, Sleutelstand } from "@/lib/types";

function begroeting(): string {
  const uur = new Date().getHours();
  if (uur < 6) return "Goedenacht";
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

export function KindHeader({
  kind,
  sleutels,
}: {
  kind: Kind;
  sleutels: Sleutelstand;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-6 sm:pt-8">
      {/*
        De begroeting staat als enige tekst los op de landschapsillustratie.
        Die is fel en druk, dus krijgt de begroeting hetzelfde kleine, effen
        witte vlak als "Vakken" en "Jouw wereld": zo blijft de tekst overal
        leesbaar, ook boven de heldere lucht, zonder dat er een laag over de
        illustratie zelf hoeft.

        Op het keuzescherm binnen een vak laat `Begroeting` zichzelf weg; de
        `ms-auto` hieronder houdt de pillen dan alsnog rechts.
      */}
      <Begroeting groet={begroeting()} roepnaam={kind.roepnaam} />

      <div className="ms-auto flex flex-wrap items-center gap-2.5">
        <Sleutelteller beginsaldo={sleutels.saldo} />

        {/* Profielbolletje met naam en groep. */}
        <div className="flex items-center gap-2.5 rounded-full border border-white/70 bg-kaart py-1.5 pl-1.5 pr-4 shadow-zacht">
          <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-huisstijl-zacht">
            <Pictogram naam={kind.avatar} className="size-8" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold">{kind.roepnaam}</span>
            {/*
              Was gewone tekst; is nu een snelkoppeling naar de groep van dit
              kind. Verandert dezelfde instelling als de ouderomgeving.
            */}
            <Groepwisselaar groep={kind.groep} />
          </span>
        </div>
      </div>
    </header>
  );
}
