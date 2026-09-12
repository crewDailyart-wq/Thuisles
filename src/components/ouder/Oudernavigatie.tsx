"use client";

/**
 * De vaste navigatie van de ouderomgeving.
 *
 * Altijd dezelfde vijf onderdelen, altijd in dezelfde volgorde. Op een
 * telefoon staan ze bovenaan als een rij van vijf; vanaf een groot scherm
 * links als zijbalk. Er komt nooit iets bij of af, zodat een ouder nooit
 * hoeft te zoeken.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icoon, type OuderIcoonNaam } from "@/components/ouder/Icoon";

type Onderdeel = {
  deel: string;
  label: string;
  /** Kortere naam voor de smalle balk op een telefoon. */
  kort: string;
  icoon: OuderIcoonNaam;
};

export const ONDERDELEN: Onderdeel[] = [
  { deel: "overzicht", label: "Overzicht", kort: "Overzicht", icoon: "overzicht" },
  { deel: "voortgang", label: "Voortgang", kort: "Voortgang", icoon: "voortgang" },
  { deel: "school", label: "School & methode", kort: "School", icoon: "school" },
  { deel: "instellingen", label: "Instellingen", kort: "Instellingen", icoon: "instellingen" },
  { deel: "abonnement", label: "Abonnement", kort: "Abonnement", icoon: "abonnement" },
];

function isActief(pad: string, deel: string) {
  return pad === `/ouder/${deel}` || pad.startsWith(`/ouder/${deel}/`);
}

/** De rij van vijf bovenaan, op telefoon en kleine tablet. */
export function Navigatiebalk() {
  const pad = usePathname();
  return (
    <nav aria-label="Ouderomgeving" className="lg:hidden">
      <ul className="grid grid-cols-5">
        {ONDERDELEN.map((o) => {
          const actief = isActief(pad, o.deel);
          return (
            <li key={o.deel}>
              <Link
                href={`/ouder/${o.deel}`}
                aria-current={actief ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 border-b-2 px-1 py-2 text-center transition ${
                  actief
                    ? "border-viool text-viool"
                    : "border-transparent text-beheer-zacht"
                }`}
              >
                <Icoon naam={o.icoon} className="size-5 shrink-0" />
                <span className="text-[0.62rem] font-medium leading-tight">
                  {o.kort}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Dezelfde vijf onderdelen links, vanaf een groot scherm. */
export function Zijnavigatie() {
  const pad = usePathname();
  return (
    <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-60 border-r border-beheer-rand bg-white px-3 py-5 lg:block">
      <nav aria-label="Ouderomgeving">
        <ul className="flex flex-col gap-1">
          {ONDERDELEN.map((o) => {
            const actief = isActief(pad, o.deel);
            return (
              <li key={o.deel}>
                <Link
                  href={`/ouder/${o.deel}`}
                  aria-current={actief ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${
                    actief
                      ? "bg-viool-zacht font-semibold text-viool-diep"
                      : "text-beheer-inkt hover:bg-beheer-vlak"
                  }`}
                >
                  <Icoon naam={o.icoon} className="size-5 shrink-0" />
                  {o.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
