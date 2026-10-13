"use client";

/**
 * De achtergrond van de openbare site: diep ruimteblauw met een stille,
 * zachtjes fonkelende sterrenhemel (dezelfde als bij Zappie, zonder aarde en
 * zonder parallax). Bij "minder beweging" staat hij stil.
 */

import { Sterrenveld } from "@/components/zappie/Sterrenveld";

export function Achtergrond() {
  return (
    <div className="st-achtergrond" aria-hidden="true">
      <Sterrenveld />
    </div>
  );
}
