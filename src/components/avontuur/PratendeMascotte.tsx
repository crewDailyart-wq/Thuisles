"use client";

/**
 * Bliepo met een tekstwolkje dat hij ook hardop zegt (startscherm).
 *
 * Het wolkje staat er meteen. Hardop zeggen gebeurt pas na een tik op Bliepo
 * of het wolkje: een browser laat een pagina niet uit zichzelf praten. Staat
 * het geluid van de uitleg uit, dan zwijgt hij en blijft alleen het wolkje.
 * Tijdens het praten beweegt zijn mond (zie `Bliepo`).
 */

import { useSyncExternalStore } from "react";
import { Bliepo } from "@/components/avontuur/Bliepo";
import { abonneerGeluid, geluidOpServer, geluidStaatAan } from "@/lib/geluid";
import { zeg } from "@/lib/stem";

export function PratendeMascotte({
  tekst,
  className = "",
  bliepoKlasse = "",
  wolkjeKlasse = "",
}: {
  tekst: string;
  className?: string;
  bliepoKlasse?: string;
  wolkjeKlasse?: string;
}) {
  const geluid = useSyncExternalStore(abonneerGeluid, geluidStaatAan, geluidOpServer);

  return (
    <button
      type="button"
      onClick={() => geluid && zeg(tekst)}
      className={`flex items-end text-left ${className}`}
      aria-label={geluid ? `${tekst} Tik om het te horen.` : tekst}
    >
      <Bliepo className={bliepoKlasse} />
      <span className={`av-wolkje ${wolkjeKlasse}`}>{tekst}</span>
    </button>
  );
}
