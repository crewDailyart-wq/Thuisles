/**
 * De pictogrammen van Zappie, met de hand getekend als SVG.
 *
 * Geen emoji en geen iconenbibliotheek: die zien er op elk apparaat anders uit.
 * Alles is getekend op een vierkant van 48 bij 48 en schaalt met `className`.
 */

type P = { className?: string };

const rond = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IcoonHuis({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M8 22.5 24 9l16 13.5" fill="none" stroke="#fff" strokeWidth="5" {...rond} />
      <path d="M12.5 21v17.5a2.5 2.5 0 0 0 2.5 2.5h18a2.5 2.5 0 0 0 2.5-2.5V21L24 11.5z" fill="#fff" />
      <path d="M20 41V31.5a4 4 0 0 1 8 0V41z" fill="#1d6fd6" />
    </svg>
  );
}

export function IcoonController({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M14.5 14h19c5.6 0 9.2 4.3 10.2 10.6l1.2 7.6c.8 5-4.6 8.1-8.2 4.6l-4.3-4.3h-16.8l-4.3 4.3c-3.6 3.5-9 .4-8.2-4.6l1.2-7.6C5.3 18.3 8.9 14 14.5 14z"
        fill="#9fdcff"
      />
      <path d="M15 20.5v8M11 24.5h8" stroke="#123c86" strokeWidth="3.4" {...rond} />
      <circle cx="32.5" cy="21.8" r="2.4" fill="#123c86" />
      <circle cx="37" cy="26.3" r="2.4" fill="#123c86" />
      <circle cx="28" cy="26.3" r="2.4" fill="#123c86" />
    </svg>
  );
}

export function IcoonWereldbol({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="17" fill="none" stroke="#9fdcff" strokeWidth="3.6" />
      <ellipse cx="24" cy="24" rx="7.5" ry="17" fill="none" stroke="#9fdcff" strokeWidth="3.2" />
      <path d="M7.5 18.5h33M7.5 29.5h33" fill="none" stroke="#9fdcff" strokeWidth="3.2" />
    </svg>
  );
}

export function IcoonSter({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="m24 4.5 5.9 12.2 13.3 1.9-9.6 9.4 2.3 13.3L24 35l-11.9 6.3 2.3-13.3-9.6-9.4 13.3-1.9z"
        fill="#ffd447"
        stroke="#f29b11"
        strokeWidth="2.4"
        {...rond}
      />
      <path d="M17.5 19.5 21 12.8" stroke="#fff6c8" strokeWidth="2.6" opacity=".9" {...rond} />
    </svg>
  );
}

export function IcoonSlot({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M15.5 21v-5.5a8.5 8.5 0 0 1 17 0V21" fill="none" stroke="#fff" strokeWidth="4.4" {...rond} />
      <rect x="10" y="20" width="28" height="22" rx="5" fill="#fff" />
      <path d="M24 28.5v5" stroke="#0b326a" strokeWidth="4" {...rond} />
    </svg>
  );
}

export function IcoonKalender({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="7" y="10" width="34" height="31" rx="6" fill="#9fdcff" />
      <path d="M7 19.5h34v-3.5a6 6 0 0 0-6-6H13a6 6 0 0 0-6 6z" fill="#4fb3ff" />
      <path d="M16 6.5v7M32 6.5v7" stroke="#fff" strokeWidth="3.6" {...rond} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((k) => (
          <rect key={`${r}${k}`} x={13 + k * 8.5} y={23.5 + r * 5.6} width="5" height="3.6" rx="1.2" fill="#0b4fa3" opacity={r === 1 && k === 1 ? 1 : 0.55} />
        )),
      )}
    </svg>
  );
}

export function IcoonKasteel({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 3.5v8" stroke="#fff" strokeWidth="2.4" {...rond} />
      <path d="M24.8 3.8h6.6l-2 2.5 2 2.5h-6.6z" fill="#fff" />
      <path
        d="M17 18 24 10l7 8zM5 44V25l4-4 4 4v-4h3.5v-4h15V21H35v4l4-4 4 4v19H29v-7a5 5 0 0 0-10 0v7z"
        fill="#fff"
      />
    </svg>
  );
}

export function IcoonPijl({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="m18 10 14 14-14 14" fill="none" stroke="currentColor" strokeWidth="6" {...rond} />
    </svg>
  );
}

export function IcoonTerug({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M29 10 15 24l14 14" fill="none" stroke="currentColor" strokeWidth="6" {...rond} />
    </svg>
  );
}

export function IcoonLamp({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 9.5c-7.2 0-12.5 5.4-12.5 12.1 0 4.4 2.3 7.3 4.6 9.6 1.5 1.5 2.2 3.1 2.2 4.8h11.4c0-1.7.7-3.3 2.2-4.8 2.3-2.3 4.6-5.2 4.6-9.6 0-6.7-5.3-12.1-12.5-12.1z"
        fill="#ffd447"
        stroke="#f29b11"
        strokeWidth="2"
      />
      <path d="M18.5 19.5a6.5 6.5 0 0 1 5-4.6" fill="none" stroke="#fff8d6" strokeWidth="2.6" {...rond} />
      <rect x="18.3" y="37" width="11.4" height="4.2" rx="1.4" fill="#8aa0c2" />
      <rect x="19.6" y="41.6" width="8.8" height="3.6" rx="1.6" fill="#6b80a6" />
      <path d="M24 2.8v3.4M8.2 9.4l2.5 2.4M39.8 9.4l-2.5 2.4M3.6 22h3.5M40.9 22h3.5" stroke="#ffd447" strokeWidth="2.8" {...rond} />
    </svg>
  );
}

/** De drie gekleurde cijfers van Rekenen: groot, rond en een beetje dik. */
export function BeeldRekenen() {
  return (
    <span className="zp-tegelbeeld zp-titel" aria-hidden="true">
      <span style={{ color: "#1f86f0", "--diep": "#0f5cb3" } as React.CSSProperties}>1</span>
      <span style={{ color: "#ffc21f", "--diep": "#d68a00", translate: "0 -0.22em" } as React.CSSProperties}>2</span>
      <span style={{ color: "#f0453a", "--diep": "#b52a21" } as React.CSSProperties}>3</span>
    </span>
  );
}

/** De drie gekleurde letters van Taal. */
export function BeeldTaal() {
  return (
    <span className="zp-tegelbeeld zp-titel" aria-hidden="true">
      <span style={{ color: "#f0453a", "--diep": "#b52a21" } as React.CSSProperties}>A</span>
      <span style={{ color: "#ffc21f", "--diep": "#d68a00", translate: "0 -0.22em" } as React.CSSProperties}>B</span>
      <span style={{ color: "#1f86f0", "--diep": "#0f5cb3" } as React.CSSProperties}>C</span>
    </span>
  );
}
