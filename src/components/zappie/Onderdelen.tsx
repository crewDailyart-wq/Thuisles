/**
 * Kleine onderdelen van Zappie die op elk scherm terugkomen: het logo, de
 * tekstballon en de ruimteachtergrond.
 */

import Link from "next/link";
import { MERKNAAM } from "@/lib/merk";
import { ASSETS } from "@/lib/zappie/werelden";

/** Het Zappie-logo, met code gemaakt: witte ronde letters en een geel sterretje. */
export function ZappieLogo({ className = "" }: { className?: string }) {
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

/**
 * De ruimteachtergrond: vult altijd het hele scherm en staat stil terwijl de
 * inhoud eroverheen schuift. AVIF waar dat kan, anders WebP, in de maat die bij
 * het scherm past.
 */
export function Ruimte() {
  const maten = [828, 1280, 1672];
  const set = (ext: string) =>
    maten.map((b) => `${ASSETS}/space-earth-background-${b}.${ext} ${b}w`).join(", ");
  return (
    <div className="zp-ruimte" aria-hidden="true">
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
