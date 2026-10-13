"use client";

/**
 * De robot met een tekstwolkje dat hij ook hardop zegt (startscherm).
 *
 * Het wolkje staat er meteen. Hardop zeggen gebeurt pas na een tik op de robot
 * of het wolkje: een browser laat een pagina niet uit zichzelf praten. Staat
 * het geluid van de uitleg uit, dan zwijgt hij en blijft alleen het wolkje.
 * Tijdens het praten beweegt zijn mond (zie `Robot`).
 */

import { useSyncExternalStore } from "react";
import { Robot } from "@/components/avontuur/Robot";
import { abonneerGeluid, geluidOpServer, geluidStaatAan } from "@/lib/geluid";
import { zeg } from "@/lib/stem";

export function PratendeMascotte({
  tekst,
  className = "",
  robotKlasse = "",
  wolkjeKlasse = "",
}: {
  tekst: string;
  className?: string;
  robotKlasse?: string;
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
      <Robot className={robotKlasse} />
      <span className={`av-wolkje ${wolkjeKlasse}`}>{tekst}</span>
    </button>
  );
}
