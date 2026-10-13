/**
 * Lijniconen voor de openbare site. Eén stijl: 24 × 24, lijn in de
 * tekstkleur, ronde uiteinden. Altijd aria-hidden: er staat tekst naast.
 */

type P = { className?: string };

function Icoon({ className, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IcoonVink = (p: P) => (
  <Icoon {...p}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </Icoon>
);

export const IcoonStreep = (p: P) => (
  <Icoon {...p}>
    <path d="M6 12h12" />
  </Icoon>
);

export const IcoonPijl = (p: P) => (
  <Icoon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icoon>
);

export const IcoonSpeld = (p: P) => (
  <Icoon {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.6" />
  </Icoon>
);

export const IcoonSchool = (p: P) => (
  <Icoon {...p}>
    <path d="M3 10.5 12 5l9 5.5" />
    <path d="M5.5 9.5V19h13V9.5" />
    <path d="M10 19v-4.5h4V19" />
  </Icoon>
);

export const IcoonBoek = (p: P) => (
  <Icoon {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </Icoon>
);

export const IcoonDoel = (p: P) => (
  <Icoon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icoon>
);

export const IcoonLezen = (p: P) => (
  <Icoon {...p}>
    <path d="M3.5 18 8 6l4.5 12M5.2 13.5h5.6" />
    <path d="M15 11.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm3 0V18" />
  </Icoon>
);

export const IcoonOor = (p: P) => (
  <Icoon {...p}>
    <path d="M7 9.5a5.5 5.5 0 1 1 11 0c0 3.5-3.5 4.5-3.5 7.5a3 3 0 0 1-5.5 1.6" />
    <path d="M10 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3" />
  </Icoon>
);

export const IcoonFocus = (p: P) => (
  <Icoon {...p}>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <circle cx="12" cy="12" r="3" />
  </Icoon>
);

export const IcoonTaal = (p: P) => (
  <Icoon {...p}>
    <path d="M4 5h8M8 3v2M10.5 5c-.6 3.6-3 6.6-6 8" />
    <path d="M6 9c1.2 1.8 2.7 3 4.5 3.8" />
    <path d="m12.5 21 4-10 4 10M14 17.5h5" />
  </Icoon>
);

export const IcoonHart = (p: P) => (
  <Icoon {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
  </Icoon>
);

export const IcoonDownload = (p: P) => (
  <Icoon {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
  </Icoon>
);

export const IcoonDoos = (p: P) => (
  <Icoon {...p}>
    <path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4v-9Z" />
    <path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9" />
  </Icoon>
);

export const IcoonGrafiek = (p: P) => (
  <Icoon {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="m7.5 15 3.5-4 3 2.5 5-6" />
  </Icoon>
);

export const IcoonSchild = (p: P) => (
  <Icoon {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icoon>
);

export const IcoonToets = (p: P) => (
  <Icoon {...p}>
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M9 3.5h6v2.5H9zM8.5 11l1.5 1.5L13 9.5M8.5 16.5h7" />
  </Icoon>
);

export const IcoonMenu = (p: P) => (
  <Icoon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icoon>
);

export const IcoonKruis = (p: P) => (
  <Icoon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icoon>
);

export const IcoonZoek = (p: P) => (
  <Icoon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icoon>
);

export const IcoonToetsenbord = (p: P) => (
  <Icoon {...p}>
    <rect x="3" y="6.5" width="18" height="11" rx="2" />
    <path d="M7 10h.01M10.5 10h.01M14 10h.01M17.5 10h.01M8 14h8" />
  </Icoon>
);

/** De ster van het Zappie-logo, in kleur. */
export function LogoSter({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="m24 4.5 5.9 12.2 13.3 1.9-9.6 9.4 2.3 13.3L24 35l-11.9 6.3 2.3-13.3-9.6-9.4 13.3-1.9z"
        fill="#ffd447"
        stroke="#f29b11"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
