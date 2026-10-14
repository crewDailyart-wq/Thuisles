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

/* ------------------------------------------------------------------------- */
/* Startpagina, tweede ontwerp (oktober 2026)                                */
/* ------------------------------------------------------------------------- */

/** Kompas: de missieknop en "Vandaag op ontdekking". */
export function IcoonKompas({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#fff" stroke="#f2a20f" strokeWidth="3.5" />
      <circle cx="24" cy="24" r="15" fill="#e9f4ff" />
      <path d="m24 9.5 4.2 14.5H19.8z" fill="#ef4836" />
      <path d="m24 38.5-4.2-14.5h8.4z" fill="#1d6fd6" />
      <circle cx="24" cy="24" r="2.6" fill="#0a2350" />
      <path d="M24 4v3M24 41v3M4 24h3M41 24h3" stroke="#f2a20f" strokeWidth="2.6" {...rond} />
    </svg>
  );
}

/** Golf: de Oceaan. */
export function IcoonGolf({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="zp-golf-kleur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fe6ff" />
          <stop offset="1" stopColor="#1d7fe0" />
        </linearGradient>
      </defs>
      <path
        d="M6 38c5-13 13-25 27-26 6-.4 10 3 9 8-3-4-9-4-12 0 4-1 8 1 8 5-5-3-11 0-11 6 0 4 3 7 9 7H6z"
        fill="url(#zp-golf-kleur)"
      />
      <path d="M14 33c3-8 8-14 15-17" fill="none" stroke="#fff" strokeWidth="2.6" opacity=".85" {...rond} />
      <path d="M4 42h40" stroke="#1d7fe0" strokeWidth="3" {...rond} />
    </svg>
  );
}

/** Blad: de Aarde. */
export function IcoonBlad({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M40 7C20 6 9 16 9 30c0 4 1 7 3 10 2-9 8-17 17-22-7 6-12 13-14 23 4 2 8 2 12 1 12-4 14-20 13-35z" fill="#5fd36a" />
      <path d="M14 39c3-9 9-16 16-21" fill="none" stroke="#2e9a43" strokeWidth="2.4" {...rond} />
    </svg>
  );
}

/** Spiraal: het Universum. */
export function IcoonSpiraal({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="#2a1b6e" />
      <path
        d="M24 24c0-2.2 3-2.6 4-.4 1.4 3-2 6.6-5.6 5.6-4.8-1.4-5.2-8-1.4-10.8 5-3.6 12.4-.6 13 5.6.8 7.4-7 12.6-14 10.4"
        fill="none"
        stroke="#ffd447"
        strokeWidth="3.4"
        {...rond}
      />
    </svg>
  );
}

/** Een stapel boeken: Schoolpad. */
export function IcoonBoeken({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="8" y="42" width="46" height="12" rx="3" fill="#2f7fd8" />
      <rect x="8" y="42" width="46" height="4" rx="2" fill="#5aa7f2" />
      <path d="M50 44v8" stroke="#fff" strokeWidth="2.4" opacity=".8" {...rond} />
      <rect x="12" y="29" width="42" height="12" rx="3" fill="#3faa55" transform="rotate(-4 33 35)" />
      <path d="M49 31v8" stroke="#fff" strokeWidth="2.4" opacity=".8" transform="rotate(-4 33 35)" {...rond} />
      <rect x="9" y="15" width="42" height="13" rx="3" fill="#e5483c" transform="rotate(5 30 21)" />
      <rect x="9" y="15" width="42" height="4" rx="2" fill="#ff7a6b" transform="rotate(5 30 21)" />
      <path d="M46 18v8" stroke="#ffd447" strokeWidth="2.6" transform="rotate(5 30 21)" {...rond} />
    </svg>
  );
}

/** Een berg met een vlag: Toetssprong. */
export function IcoonBerg({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="54" rx="26" ry="6" fill="#2b8a4e" />
      <path d="M6 54 28 16l26 38z" fill="#3b78d8" />
      <path d="M28 16 54 54H34z" fill="#2a5db4" />
      <path d="m28 16-7 12 4-2 3 4 3-4 4 2z" fill="#fff" />
      <path d="M28 16V4" stroke="#5b4636" strokeWidth="2.4" {...rond} />
      <path d="M28 4h11l-3 4 3 4H28z" fill="#ef4836" />
    </svg>
  );
}

/** Een raket: Vrije Missie. */
export function IcoonRaket({ className }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M22 44c-6 2-9 8-10 14 6-1 12-4 14-10z" fill="#ffb52e" />
      <path d="M24 46c-3 1.5-5 4.5-5.5 8 3.5-.5 6.5-2.5 8-5.5z" fill="#ff6a3d" />
      <path d="M40 6c10 2 16 8 18 18L34 48 16 30z" fill="#f4f7fb" />
      <path d="M40 6c10 2 16 8 18 18l-6 6c-1-10-8-17-18-18z" fill="#e5483c" />
      <circle cx="38" cy="26" r="6" fill="#2f7fd8" stroke="#fff" strokeWidth="2.4" />
      <path d="M16 30 8 32l6-12 10-2zM34 48l-2 8 12-6 2-10z" fill="#e5483c" />
    </svg>
  );
}

/** Munt met ster: tokens. */
export function IcoonMunt({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#f2a20f" />
      <circle cx="24" cy="22.5" r="19" fill="#ffd447" />
      <circle cx="24" cy="22.5" r="14.5" fill="none" stroke="#f2a20f" strokeWidth="2" />
      <path d="m24 11 3.4 7 7.6 1.1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill="#fff3b0" stroke="#f2a20f" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Cadeautje: de volgende beloning. */
export function IcoonCadeau({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 16c-3-7-12-9-12-3 0 3 4 4 12 3zM24 16c3-7 12-9 12-3 0 3-4 4-12 3z" fill="#ffd447" stroke="#e39a10" strokeWidth="2" />
      <rect x="7" y="16" width="34" height="9" rx="2.5" fill="#4fb3ff" />
      <rect x="10" y="25" width="28" height="18" rx="2.5" fill="#2f7fd8" />
      <rect x="21" y="16" width="6" height="27" fill="#ffd447" />
    </svg>
  );
}

/** Tandwiel: instellingen. */
export function IcoonTandwiel({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M20.5 5h7l1 5.2 3.6 1.5 4.4-3 5 5-3 4.4 1.5 3.6 5.2 1v7l-5.2 1-1.5 3.6 3 4.4-5 5-4.4-3-3.6 1.5-1 5.2h-7l-1-5.2-3.6-1.5-4.4 3-5-5 3-4.4-1.5-3.6L5 27.5v-7l5.2-1 1.5-3.6-3-4.4 5-5 4.4 3 3.6-1.5z"
        fill="#9fdcff"
      />
      <circle cx="24" cy="24" r="6.5" fill="#0b326a" />
    </svg>
  );
}

/** Drie streepjes: het menu ("Meer"), zoals het menuknopje van de nieuwe layout. */
export function IcoonMenu({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="#9fdcff" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** Pijltje in handschrift, voor de notities. */
export function HandPijl({ className }: P) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M8 6c-4 10 0 20 22 27" fill="none" stroke="currentColor" strokeWidth="2.4" {...rond} />
      <path d="m22 35 8-2-4-7" fill="none" stroke="currentColor" strokeWidth="2.4" {...rond} />
    </svg>
  );
}

/** Stapstenen: Mijn leerpad. */
export function IcoonStapjes({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <ellipse cx="12" cy="37" rx="8" ry="4.6" fill="#e8f4ff" />
      <ellipse cx="24" cy="26" rx="7" ry="4" fill="#cfe7ff" />
      <ellipse cx="35" cy="16.5" rx="6" ry="3.4" fill="#b3d8ff" />
      <ellipse cx="42" cy="8.5" rx="4.2" ry="2.4" fill="#9cccff" />
    </svg>
  );
}

/** Rekenmachine: Rekenen. */
export function IcoonRekenen({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="9" y="5" width="30" height="38" rx="6" fill="#2fbf71" stroke="#fff" strokeWidth="2.5" />
      <rect x="14" y="10" width="20" height="8" rx="2" fill="#e9fff2" />
      <g fill="#fff">
        <circle cx="17" cy="25" r="2.6" />
        <circle cx="24" cy="25" r="2.6" />
        <circle cx="31" cy="25" r="2.6" />
        <circle cx="17" cy="32" r="2.6" />
        <circle cx="24" cy="32" r="2.6" />
        <circle cx="31" cy="32" r="2.6" />
        <circle cx="17" cy="38.5" r="2.2" />
        <circle cx="24" cy="38.5" r="2.2" />
        <circle cx="31" cy="38.5" r="2.2" />
      </g>
    </svg>
  );
}

/** Open boek: Herhalen. */
export function IcoonBoek({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 13c-5-4-12-5-18-4v27c6-1 13 0 18 4z" fill="#5aa9ff" />
      <path d="M24 13c5-4 12-5 18-4v27c-6-1-13 0-18 4z" fill="#3b8cf0" />
      <path d="M24 13v27" stroke="#fff" strokeWidth="2.4" {...rond} />
      <path d="M10 16c3.5-.4 7 .2 10 1.6M10 22c3.5-.4 7 .2 10 1.6M38 16c-3.5-.4-7 .2-10 1.6M38 22c-3.5-.4-7 .2-10 1.6" stroke="#e5f2ff" strokeWidth="1.8" fill="none" {...rond} />
    </svg>
  );
}

/** Beker: Uitdaging. */
export function IcoonBeker({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M15 7h18v10a9 9 0 0 1-18 0z" fill="#ffc83d" stroke="#e59b06" strokeWidth="2" />
      <path d="M15 10H8c0 7 3 10 8 10M33 10h7c0 7-3 10-8 10" fill="none" stroke="#e59b06" strokeWidth="3" {...rond} />
      <path d="M21 26h6v7h-6z" fill="#f2a20f" />
      <rect x="14" y="33" width="20" height="6" rx="2" fill="#ffc83d" stroke="#e59b06" strokeWidth="2" />
      <path d="M20 12v6" stroke="#fff6cf" strokeWidth="2.4" {...rond} />
    </svg>
  );
}

/** Vinkje in een rondje (klaar) of een leeg rondje (nog te doen). */
export function IcoonVinkRond({ className, aan }: P & { aan: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {aan ? (
        <>
          <circle cx="12" cy="12" r="10" fill="#fff" />
          <path d="m7.2 12.4 3.2 3.2 6.4-7" fill="none" stroke="#1f9d57" strokeWidth="2.8" {...rond} />
        </>
      ) : (
        <circle cx="12" cy="12" r="9" fill="none" stroke="rgb(214 232 255 / 0.85)" strokeWidth="2.2" />
      )}
    </svg>
  );
}
