/**
 * Kleine onderdelen van Zappie die op elk scherm terugkomen: het logo, de
 * tekstballon en de ruimteachtergrond.
 */

import Link from "next/link";
import { MERKNAAM } from "@/lib/merk";
import { ASSETS } from "@/lib/zappie/werelden";

/*
  Het Zappie-logo. Sinds 15 oktober 2026 het plaatje van de eigenaar (robot
  op de letters, public/assets/zappie/logo-zappie.*). Het oude logo in code
  (witte letters en een geel sterretje) staat er nog: zet LOGO_PLAATJE op false
  en het is terug.
*/
const LOGO_PLAATJE = true;

export function ZappieLogo({ className = "" }: { className?: string }) {
  if (LOGO_PLAATJE) {
    return (
      <Link href="/zappie" className={`zp-logo zp-logo-plaatje ${className}`} aria-label={`${MERKNAAM}, naar de start`}>
        <picture>
          <source type="image/webp" srcSet="/assets/zappie/logo-zappie.webp" />
          <img src="/assets/zappie/logo-zappie.png" alt={MERKNAAM} width={900} height={450} draggable={false} />
        </picture>
      </Link>
    );
  }
  return (
    <Link href="/zappie" className={`zp-logo zp-titel ${className}`} aria-label={`${MERKNAAM}, naar de start`}>
      <span className="zp-logo-tekst">{MERKNAAM}</span>
      <svg viewBox="0 0 48 48" className="zp-logo-ster" aria-hidden="true">
        <path
          d="m24 4.5 5.9 12.2 13.3 1.9-9.6 9.4 2.3 13.3L24 35l-11.9 6.3 2.3-13.3-9.6-9.4 13.3-1.9z"
          fill="#ffd447"
          stroke="#f29b11"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

/**
 * De tekstballon van Zappie. `aria-live` zodat een voorleesprogramma meeleest
 * als Zappie iets nieuws zegt.
 */
export function Tekstballon({
  kop,
  tekst,
  className = "",
}: {
  kop?: string;
  tekst: string;
  className?: string;
}) {
  return (
    <div className={`zp-ballon ${className}`} role="status" aria-live="polite">
      <svg viewBox="0 0 40 40" className="zp-ballon-vonk" aria-hidden="true">
        <path d="M8 30 15 20M20 34l2-12M30 31l-4-9" stroke="#ffd447" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <p>
        {kop && <span className="zp-ballon-kop">{kop}</span>}
        <span className="zp-ballon-tekst">{tekst}</span>
      </p>
    </div>
  );
}

/** Een wereldbeeld als losse, doorzichtige bol. */
export function Wereldbeeld({ beeld, className = "", laden = "eager" }: { beeld: string; className?: string; laden?: "eager" | "lazy" }) {
  return (
    <picture>
      <source type="image/avif" srcSet={`${ASSETS}/${beeld}.avif`} />
      <img src={`${ASSETS}/${beeld}.webp`} alt="" className={className} loading={laden} decoding="async" draggable={false} />
    </picture>
  );
}
