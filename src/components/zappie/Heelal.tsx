"use client";

/**
 * Het heelal achter alle Zappie-schermen, in lagen.
 *
 * Van achter naar voor:
 *   1. de ruimtehemel (`Ruimtehemel`): lucht, planeten en de aarde onderaan,
 *      helemaal in code. Tot 15 oktober 2026 stond hier de ruimtefoto
 *      (`space-earth-background-*`); die is op verzoek van de eigenaar
 *      vervangen. De bestanden van de foto blijven staan;
 *   2. nevels die heel langzaam verschuiven;
 *   3. sterren in drie dieptes, gouden sterren, gouden stofjes en af en toe een
 *      vallende ster (`Sterrenveld`).
 *
 * De lichtstralen bij de horizon (de zon uit de foto) en de gloed om de
 * planeten uit de foto zijn op 15 oktober 2026 met akkoord van de eigenaar
 * weggehaald: zonder de foto hingen ze los in de lucht.
 *
 * De draaiende aarde (`DraaiendeAarde`, een WebGL-bol over de aarde in het
 * plaatje) staat hier niet meer in: op verzoek van de eigenaar (13 oktober
 * 2026) blijft alleen de oorspronkelijke ruimtefoto met de aarde erin over.
 * Het bestand blijft staan, voor als hij ooit terug moet.
 *
 * Alles staat vast achter de inhoud en vangt geen klikken op. Bij een muis
 * bewegen de lagen een paar pixels mee (parallax), elk op zijn eigen diepte;
 * zie `useParallax`. Tijdens een missie (`rustig`) zijn er minder sterren en
 * beweegt er niets, zodat niets afleidt van de sommen.
 */

import { useRef } from "react";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { useParallax } from "@/components/zappie/parallax";
import { Ruimtehemel } from "@/components/zappie/Ruimtehemel";
import { Sterrenveld } from "@/components/zappie/Sterrenveld";

export function Heelal({ rustig: focus = false }: { rustig?: boolean }) {
  const bewegingsstand = useBewegingsstand();
  const rustig = focus || bewegingsstand !== "aan";
  const laag = useRef<HTMLDivElement>(null);
  useParallax(laag, !rustig);

  return (
    <div ref={laag} className="zp-heelal" aria-hidden="true" data-rustig={rustig ? "ja" : "nee"}>
      <div className="zp-laag zp-laag-ruimte">
        <Ruimtehemel rustig={rustig} />
      </div>
      <div className="zp-laag zp-nevels">
        <span className="zp-nevel zp-nevel-1" />
        <span className="zp-nevel zp-nevel-2" />
        <span className="zp-nevel zp-nevel-3" />
      </div>
      <Sterrenveld rustig={rustig} />
    </div>
  );
}
