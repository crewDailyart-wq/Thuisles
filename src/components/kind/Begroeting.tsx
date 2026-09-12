"use client";

/**
 * De begroeting linksboven ("Goedemiddag / Hoi Fenna!").
 *
 * Staat normaal op elk scherm van de kindomgeving, want hij komt uit de
 * gedeelde header in `(kind)/layout.tsx`. Op één scherm is hij ongewenst: het
 * keuzescherm binnen een vak (`/oefenen/rekenen`). Daar staan twee grote
 * kaarten die het verhaal zelf vertellen, en alles eromheen leidt daarvan af.
 *
 * Daarom kijkt dit onderdeel naar het pad. Dat kan alleen aan de clientkant,
 * vandaar `"use client"` — maar de begroetingstekst zelf wordt op de server
 * bepaald en als `groet` doorgegeven. Zou de klok hier worden uitgelezen, dan
 * kan de tijd van de browser afwijken van die van de server en klopt de
 * eerste weergave niet met wat er al stond.
 */

import { usePathname } from "next/navigation";

/** Precies één segment achter /oefenen: het keuzescherm binnen een vak. */
const KEUZESCHERM = /^\/oefenen\/[^/]+$/;

export function Begroeting({
  groet,
  roepnaam,
}: {
  groet: string;
  roepnaam: string;
}) {
  if (KEUZESCHERM.test(usePathname())) return null;

  return (
    <div className="w-fit rounded-groot border border-white/70 bg-kaart px-4 py-2.5 shadow-zacht">
      <p className="text-sm font-extrabold text-inkt-zacht sm:text-base">
        {groet}
      </p>
      {/*
        Bewust geen <h1>: elke pagina heeft zijn eigen hoofdkop. Dit is een
        begroeting, geen paginatitel.
      */}
      <p className="text-3xl font-extrabold leading-tight sm:text-4xl">
        Hoi {roepnaam}!
      </p>
    </div>
  );
}
