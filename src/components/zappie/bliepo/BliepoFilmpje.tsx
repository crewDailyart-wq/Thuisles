"use client";

/**
 * Bliepo als klein herhalend filmpje: hij zweeft rustig en zwaait (18 oktober
 * 2026; eerst op de testpagina /voorbeeld-bliepo). Sinds 19 oktober 2026 is dit
 * Bliepo op telefoon, tablet en trage apparaten, in plaats van de 3D-robot
 * (lichte weergave, zie Bliepo3DGedeeld en lib/lichte-weergave.ts).
 *
 * Opgenomen uit hetzelfde 3D-model (zappie.glb), in dezelfde hoek als de robot
 * onderaan de startpagina, met een doorzichtige achtergrond:
 *   - bliepo-zweef.webm (VP9 met doorzichtigheid) voor Chrome, Edge, Firefox;
 *   - bliepo-zweef.webp (geanimeerd) voor Safari, iPhone en iPad: die tonen de
 *     doorzichtigheid van WebM niet;
 *   - bliepo-stil.webp: het eerste beeldje, bij "Beweging uit" of "minder
 *     beweging".
 * Buiten beeld staat het filmpje op pauze.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const MAP = "/assets/zappie/bliepo";
const geenAbonnement = () => () => {};

/** Safari en alles op iPhone/iPad (ook Chrome daar is WebKit). */
function isWebKit() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios || (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Firefox\//.test(ua));
}

export function BliepoFilmpje({
  rustig = false,
  className = "",
  onKlaar,
}: {
  rustig?: boolean;
  className?: string;
  onKlaar?: () => void;
}) {
  const soort = useSyncExternalStore(geenAbonnement, () => (isWebKit() ? "webp" : "webm"), () => "stil");
  const film = useRef<HTMLVideoElement>(null);
  const [klaar, zetKlaar] = useState(false);

  /* Alleen afspelen als hij in beeld is, en niet bij "Beweging uit". */
  useEffect(() => {
    const v = film.current;
    if (!v) return;
    if (rustig) {
      v.pause();
      v.currentTime = 0;
      return;
    }
    const kijker = new IntersectionObserver((items) => {
      if (items.some((i) => i.isIntersecting)) void v.play().catch(() => {});
      else v.pause();
    });
    kijker.observe(v);
    return () => kijker.disconnect();
  }, [rustig, soort]);

  useEffect(() => {
    if (klaar) onKlaar?.();
  }, [klaar, onKlaar]);

  const klasse = `block h-full w-full object-contain ${className}`;
  if (soort === "stil" || (rustig && soort === "webp")) {
    // eslint-disable-next-line @next/next/no-img-element -- een doorzichtig stilstaand beeldje, geen optimalisatie nodig
    return <img src={`${MAP}/bliepo-stil.webp`} alt="" draggable={false} className={klasse} onLoad={() => zetKlaar(true)} />;
  }
  if (soort === "webp") {
    // eslint-disable-next-line @next/next/no-img-element -- geanimeerde WebP; next/image zou hem stilzetten
    return <img src={`${MAP}/bliepo-zweef.webp`} alt="" draggable={false} className={klasse} onLoad={() => zetKlaar(true)} />;
  }
  return (
    <video
      ref={film}
      className={klasse}
      src={`${MAP}/bliepo-zweef.webm`}
      poster={`${MAP}/bliepo-stil.webp`}
      muted
      loop
      playsInline
      autoPlay={!rustig}
      preload="auto"
      aria-hidden="true"
      onLoadedData={() => zetKlaar(true)}
    />
  );
}
