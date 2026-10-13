"use client";

/**
 * Het heelal achter alle Zappie-schermen, in lagen.
 *
 * Van achter naar voor:
 *   1. de ruimteachtergrond van de eigenaar (het plaatje);
 *   2. nevels die heel langzaam verschuiven;
 *   3. sterren in drie dieptes, gouden sterren, gouden stofjes en af en toe een
 *      vallende ster (`Sterrenveld`);
 *   4. de draaiende aarde onderaan (`DraaiendeAarde`), met wolken en gloed;
 *   5. lichtstralen bij de horizon.
 *
 * Alles staat stil en vast achter de inhoud en vangt geen klikken op. Bij een
 * muis bewegen de lagen een paar pixels mee (parallax), elk op zijn eigen
 * diepte; zie `useParallax`. Tijdens een missie (`rustig`) staat de aarde stil
 * en zijn er minder sterren, zodat niets afleidt van de sommen.
 */

import { ASSETS } from "@/lib/zappie/werelden";

export function Heelal({ rustig = false }: { rustig?: boolean }) {
  const maten = [828, 1280, 1672];
  const set = (ext: string) => maten.map((b) => `${ASSETS}/space-earth-background-${b}.${ext} ${b}w`).join(", ");
  return (
    <div className="zp-heelal" aria-hidden="true" data-rustig={rustig ? "ja" : "nee"}>
      <div className="zp-laag zp-laag-ruimte">
        <picture>
          <source type="image/avif" srcSet={set("avif")} sizes="100vw" />
          <img
            src={`${ASSETS}/space-earth-background-1672.webp`}
            srcSet={set("webp")}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
    </div>
  );
}
