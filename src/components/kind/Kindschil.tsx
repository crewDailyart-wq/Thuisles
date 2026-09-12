"use client";

/**
 * De schil om de kindomgeving: zijbalk, header, achtergrond, balk onderaan.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit een clientcomponent is
 * ---------------------------------------------------------------------------
 * Tijdens het oefenen moet die schil wég. Een kind dat een som maakt, heeft
 * niets aan een menu, een begroeting of een landschap: dat zijn allemaal
 * dingen om naar te kijken in plaats van de vraag. Het oefenscherm regelt zijn
 * eigen balk bovenaan en vult verder het hele venster.
 *
 * Welke pagina er getoond wordt, weet alleen de browser (`usePathname`). De
 * layout zelf blijft daardoor een servercomponent die gewoon de gegevens
 * ophaalt; alleen de keuze "schil of geen schil" gebeurt hier.
 *
 * De inhoud (`children`) blijft een servercomponent en gaat ongewijzigd door.
 */

import { usePathname } from "next/navigation";
import { Achtergrond } from "@/components/kind/Achtergrond";
import { KindHeader } from "@/components/kind/KindHeader";
import { Onderbalk } from "@/components/kind/Onderbalk";
import { Zijbalk } from "@/components/kind/Zijbalk";
import type { Kind, Sleutelstand } from "@/lib/types";

/**
 * Op deze schermen gaat de schil uit.
 *
 * Bewust op het einde van het pad en niet op een losse vlag: zo kan er geen
 * scherm ontstaan dat wél een oefening is maar de schil toch meekrijgt.
 */
function isOefenscherm(pad: string): boolean {
  return pad.endsWith("/oefening");
}

export function Kindschil({
  kind,
  sleutels,
  children,
}: {
  kind: Kind;
  sleutels: Sleutelstand;
  children: React.ReactNode;
}) {
  const pad = usePathname();

  if (isOefenscherm(pad)) {
    /*
      Focusstand: geen zijbalk, geen header, geen landschap, geen balk
      onderaan. Alleen de oefening, over het hele venster.
    */
    return <main className="min-h-[100lvh]">{children}</main>;
  }

  return (
    <div className="relative min-h-full">
      <Achtergrond />
      <Zijbalk />

      {/*
        z-50 en niet z-10.

        Het feestscherm na een goed antwoord is een schermvullende laag binnen
        deze kolom, en de sleutelteller moet daar bovenop blijven staan —
        anders vliegt de sleutel naar een doel dat je niet ziet. Een z-index
        werkt alleen tussen elementen in dezelfde stapelcontext.

        De zijbalk en de balk onderaan staan op z-40. Deze kolom moet daar dus
        boven. Dat kan zonder gevolgen: de kolom houdt links ruimte vrij voor
        de zijbalk (`lg:pl-50`) en onderaan voor de balk (`pb-32`), dus ze
        overlappen elkaar nergens.
      */}
      <div className="relative z-50 lg:pl-50">
        <div className="mx-auto w-full max-w-[86rem] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-14">
          <KindHeader kind={kind} sleutels={sleutels} />
          <main className="pt-6">{children}</main>
        </div>
      </div>

      <Onderbalk />
    </div>
  );
}
