/**
 * Eigen pictogrammenset van Thuisles.
 *
 * Alle beeldjes zijn hier met de hand getekend als SVG: vlakken in de
 * huisstijlkleuren met een duidelijke omlijning. Geen emoji en geen ingekochte
 * iconenbibliotheek, zodat de app een eigen, herkenbaar gezicht heeft en er op
 * elk apparaat hetzelfde uitziet (emoji verschillen per telefoon en computer).
 *
 * Elk pictogram is getekend op een vierkant van 40 bij 40.
 */

import type { PictogramNaam } from "@/lib/types";

const VIOOL = "#5b3fd6";
const GROEN = "#1f9d63";
const ORANJE = "#e4832a";
const GEEL = "#f2bb2e";
const LUCHT = "#3577cc";
const ROZE = "#e4607f";
const INKT = "#2c2545";

/** Open lijnen: overal dezelfde afronding, zonder vulling. */
const lijn = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
} as const;

/** Gevulde vormen: dezelfde afronding, maar de eigen vulling blijft staan. */
const vlak = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

const TEKENINGEN: Record<PictogramNaam, React.ReactNode> = {
  // --- Vakken ------------------------------------------------------------
  "vak-rekenen": (
    <>
      <rect x="5" y="7" width="30" height="26" rx="6" fill="#eee9ff" stroke={VIOOL} strokeWidth="2.2" />
      <path d="M8 14h24M8 20h24M8 26h24" stroke={VIOOL} strokeWidth="1.5" opacity="0.4" {...lijn} />
      <circle cx="14" cy="14" r="3" fill={GEEL} />
      <circle cx="23" cy="14" r="3" fill={ORANJE} />
      <circle cx="18" cy="20" r="3" fill={GROEN} />
      <circle cx="27" cy="20" r="3" fill={LUCHT} />
      <circle cx="12" cy="26" r="3" fill={ROZE} />
      <circle cx="21" cy="26" r="3" fill={VIOOL} />
    </>
  ),
  "vak-taal": (
    <>
      <path
        d="M8 8h24a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H19l-7 5.5V28H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z"
        fill="#e2edfb"
        stroke={LUCHT}
        strokeWidth="2.2"
        {...vlak}
      />
      <path d="M10.5 15h19M10.5 21h12" stroke={LUCHT} strokeWidth="2.4" {...lijn} />
    </>
  ),
  "vak-spelling": (
    <>
      <path d="M25 5.5 34.5 15 16.5 33 6 35.5 8.5 25 25 5.5Z" fill="#fdeada" stroke={ORANJE} strokeWidth="2.2" {...vlak} />
      <path d="M21.5 9 31 18.5" stroke={ORANJE} strokeWidth="2.2" {...lijn} />
      <path d="M8.5 25 16.5 33" stroke={ORANJE} strokeWidth="2.2" {...lijn} />
    </>
  ),
  "vak-lezen": (
    <>
      <path d="M4.5 9.5c5.5-2 10.5-1.5 15.5 2v21c-5-3.5-10-4-15.5-2v-21Z" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" {...vlak} />
      <path d="M35.5 9.5c-5.5-2-10.5-1.5-15.5 2v21c5-3.5 10-4 15.5-2v-21Z" fill="#ffffff" stroke={GROEN} strokeWidth="2.2" {...vlak} />
      <path d="M20 11.5v21" stroke={GROEN} strokeWidth="2.2" {...lijn} />
    </>
  ),
  "vak-engels": (
    <>
      <circle cx="20" cy="20" r="14.5" fill="#e2edfb" stroke={LUCHT} strokeWidth="2.2" />
      <path d="M5.5 20h29" stroke={LUCHT} strokeWidth="2" {...lijn} />
      <path d="M20 5.5c4.2 4.2 6.3 9 6.3 14.5S24.2 30.3 20 34.5c-4.2-4.2-6.3-9-6.3-14.5S15.8 9.7 20 5.5Z" stroke={LUCHT} strokeWidth="2" {...lijn} />
    </>
  ),

  // --- Subdomeinen rekenen ----------------------------------------------
  tellen: (
    <>
      <rect x="4" y="23" width="9.5" height="12" rx="3" fill="#dcf4e8" stroke={GROEN} strokeWidth="2" />
      <rect x="15.2" y="16" width="9.5" height="19" rx="3" fill="#fdeada" stroke={ORANJE} strokeWidth="2" />
      <rect x="26.4" y="8" width="9.5" height="27" rx="3" fill="#eee9ff" stroke={VIOOL} strokeWidth="2" />
      <circle cx="8.8" cy="29" r="1.9" fill={GROEN} />
      <circle cx="20" cy="25.5" r="1.9" fill={ORANJE} />
      <circle cx="31.2" cy="21.5" r="1.9" fill={VIOOL} />
    </>
  ),
  getalbegrip: (
    <>
      <path d="M4 29h32" stroke={VIOOL} strokeWidth="2.6" {...lijn} />
      <path d="M9 29v-4.5M17 29v-3.5M25 29v-3.5M33 29v-4.5" stroke={VIOOL} strokeWidth="2" opacity="0.45" {...lijn} />
      <path d="M21 4.5a6.8 6.8 0 0 1 6.8 6.8c0 4.6-6.8 10.4-6.8 10.4s-6.8-5.8-6.8-10.4A6.8 6.8 0 0 1 21 4.5Z" fill={GEEL} stroke={ORANJE} strokeWidth="2" {...vlak} />
      <circle cx="21" cy="11.3" r="2.4" fill="#ffffff" />
    </>
  ),
  "grote-getallen": (
    <>
      <rect x="4" y="6" width="32" height="8.5" rx="3" fill="#eee9ff" stroke={VIOOL} strokeWidth="2" />
      <path d="M12 6v8.5M20 6v8.5M28 6v8.5" stroke={VIOOL} strokeWidth="1.4" opacity="0.45" />
      <rect x="8" y="16.5" width="24" height="8.5" rx="3" fill="#e2edfb" stroke={LUCHT} strokeWidth="2" />
      <path d="M16 16.5V25M24 16.5V25" stroke={LUCHT} strokeWidth="1.4" opacity="0.45" />
      <rect x="13" y="27" width="14" height="8.5" rx="3" fill="#dcf4e8" stroke={GROEN} strokeWidth="2" />
      <path d="M20 27v8.5" stroke={GROEN} strokeWidth="1.4" opacity="0.45" />
    </>
  ),
  breuken: (
    <>
      <circle cx="20" cy="20" r="14.5" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" />
      <path d="M20 5.5A14.5 14.5 0 0 1 34.5 20H20V5.5Z" fill={ROZE} />
      <path d="M20 5.5v29M5.5 20h29" stroke={ROZE} strokeWidth="2.2" {...lijn} />
    </>
  ),
  kommagetallen: (
    <>
      <rect x="4" y="11" width="32" height="14" rx="4.5" fill="#e2edfb" stroke={LUCHT} strokeWidth="2.2" />
      <path d="M11 11v6M18 11v8.5M25 11v6M32 11v8.5" stroke={LUCHT} strokeWidth="2" {...lijn} />
      <circle cx="18" cy="30.5" r="2.9" fill={ORANJE} />
      <path d="M19 33.2c.6 1.7-.5 2.9-1.9 3.4" stroke={ORANJE} strokeWidth="2.2" {...lijn} />
    </>
  ),
  /* Getallen lezen en schrijven: een cijfer op een schrijfregel. */
  schrijven: (
    <>
      <rect x="4" y="6" width="32" height="28" rx="5" fill="#eee9ff" stroke={VIOOL} strokeWidth="2.2" />
      <path d="M9 26h22" stroke={VIOOL} strokeWidth="1.6" opacity="0.5" />
      <path d="M15 13v13M15 13h4a4 4 0 0 1 0 8h-4" stroke={VIOOL} strokeWidth="2.6" {...lijn} />
      <path d="M26.5 13v13" stroke={ORANJE} strokeWidth="2.6" {...lijn} />
    </>
  ),

  /* Vergelijken en ordenen: kleiner dan, groter dan. */
  vergelijken: (
    <>
      <path d="M16 8 6.5 20 16 32" stroke={LUCHT} strokeWidth="3.4" {...lijn} />
      <path d="M24 8l9.5 12L24 32" stroke={ROZE} strokeWidth="3.4" {...lijn} />
    </>
  ),

  /* Even en oneven: twee nette paren, en eentje die overblijft. */
  "even-oneven": (
    <>
      <circle cx="11" cy="12" r="4.5" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="23" cy="12" r="4.5" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="11" cy="24" r="4.5" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="23" cy="24" r="4.5" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="11" cy="34.5" r="4" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" />
    </>
  ),
  optellen: (
    <>
      <rect x="3.5" y="3.5" width="19" height="19" rx="6" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <path d="M13 8.5v9M8.5 13h9" stroke={GROEN} strokeWidth="2.8" {...lijn} />
      <rect x="17.5" y="17.5" width="19" height="19" rx="6" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" />
      <path d="M22.5 27h9" stroke={ROZE} strokeWidth="2.8" {...lijn} />
    </>
  ),
  /*
    Aftrekken krijgt een eigen beeldje: `optellen` toont plus én min samen en
    was bedoeld voor het gecombineerde domein. Nu die twee apart bestaan, moet
    aftrekken ook los herkenbaar zijn.
  */
  aftrekken: (
    <>
      <rect x="10.5" y="10.5" width="19" height="19" rx="6" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" />
      <path d="M15.5 20h9" stroke={ROZE} strokeWidth="2.8" {...lijn} />
    </>
  ),
  tafels: (
    <>
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#eee9ff" stroke={VIOOL} strokeWidth="2.2" />
      {[12.5, 20, 27.5].map((y) =>
        [12.5, 20, 27.5].map((x, i) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.7" fill={i === 1 ? GEEL : VIOOL} />
        )),
      )}
    </>
  ),
  vermenigvuldigen: (
    <>
      <path d="M5 11.5 13.5 20M13.5 11.5 5 20" stroke={ORANJE} strokeWidth="3.2" {...lijn} />
      <rect x="18.5" y="6" width="17.5" height="28" rx="5" fill="#eee9ff" stroke={VIOOL} strokeWidth="2.2" />
      {[12.5, 20, 27.5].map((y) => (
        <g key={y}>
          <circle cx="23.5" cy={y} r="2.5" fill={VIOOL} />
          <circle cx="31" cy={y} r="2.5" fill={VIOOL} />
        </g>
      ))}
    </>
  ),
  delen: (
    <>
      <rect x="3.5" y="8.5" width="33" height="23" rx="7" fill="#e2edfb" stroke={LUCHT} strokeWidth="2.2" />
      <path d="M20 8.5v23" stroke={LUCHT} strokeWidth="2.2" strokeDasharray="3.5 3.5" {...lijn} />
      <circle cx="11.8" cy="16" r="2.7" fill={LUCHT} />
      <circle cx="11.8" cy="24" r="2.7" fill={LUCHT} />
      <circle cx="28.2" cy="16" r="2.7" fill={LUCHT} />
      <circle cx="28.2" cy="24" r="2.7" fill={LUCHT} />
    </>
  ),
  handig: (
    <>
      <path d="M22 3.5 11 21.5h7.5L16 36.5l12.5-19.5H21l3-13.5Z" fill={GEEL} stroke={ORANJE} strokeWidth="2.2" {...vlak} />
      <path d="M6 8.5 7.5 12 11 13.5 7.5 15 6 18.5 4.5 15 1 13.5 4.5 12 6 8.5Z" fill={ORANJE} opacity="0.55" />
      <path d="M34.5 24 35.6 26.6 38.2 27.7 35.6 28.8 34.5 31.4 33.4 28.8 30.8 27.7 33.4 26.6 34.5 24Z" fill={ORANJE} opacity="0.55" />
    </>
  ),

  // --- Wereldgebieden ----------------------------------------------------
  dorp: (
    <>
      <path d="M22 26.5 28.5 21l7.5 5.5V35H22v-8.5Z" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" {...vlak} />
      <path d="M5 22.5 14 15.5l9 7V35H5V22.5Z" fill="#fdeada" stroke={ORANJE} strokeWidth="2.2" {...vlak} />
      <path d="M2.5 23.5 14 14.5l11.5 9" stroke={ORANJE} strokeWidth="2.6" {...lijn} />
      <rect x="11" y="26" width="6" height="9" rx="1.6" fill={ORANJE} />
    </>
  ),
  bos: (
    <>
      <rect x="10.4" y="26" width="3.2" height="9" rx="1.4" fill={ORANJE} />
      <path d="M12 5.5 21.5 27H2.5L12 5.5Z" fill={GROEN} />
      <rect x="26.4" y="28" width="3.2" height="7" rx="1.4" fill={ORANJE} />
      <path d="M28 13 36 29H20L28 13Z" fill="#0f9c8c" />
    </>
  ),
  meer: (
    <>
      <path d="M20 5.5v19" stroke={INKT} strokeWidth="2.2" {...lijn} />
      <path d="M21.5 7 31.5 24h-10V7Z" fill={ROZE} />
      <path d="M18.5 11.5 9 24h9.5V11.5Z" fill={GEEL} />
      <path d="M3 28q3.2-3.2 6.4 0t6.4 0 6.4 0 6.4 0 6.4 0" stroke={LUCHT} strokeWidth="2.6" {...lijn} />
      <path d="M3 34q3.2-3.2 6.4 0t6.4 0 6.4 0 6.4 0 6.4 0" stroke={LUCHT} strokeWidth="2.6" opacity="0.5" {...lijn} />
    </>
  ),
  berg: (
    <>
      <path d="M21 34 30 17l8.5 17H21Z" fill="#8f79c8" />
      <path d="M30 17l3.6 7.2-2.2-1-1.4.9-1.5-.9-2.1 1L30 17Z" fill="#ffffff" />
      <path d="M1.5 34 15 9l13.5 25H1.5Z" fill="#7965b3" />
      <path d="M15 9l5.4 10-3-1.4-2.4 1.3-2.4-1.3-3 1.4L15 9Z" fill="#ffffff" />
    </>
  ),
  kust: (
    <>
      <path d="M2 30c5-3.5 11.5-5 18-5s13 1.5 18 5v3H2v-3Z" fill={GEEL} />
      <path d="M22 30c-1.5-7-1-11.5 1-15" stroke={ORANJE} strokeWidth="2.8" {...lijn} />
      <path d="M23 14c-4.5-2.5-9-1-11 2.5 4.5-1.5 8-.5 10.5 1.5Z" fill={GROEN} />
      <path d="M23 14c4.5-2.5 9.5-1 11.5 2.5-4.5-1.5-8.5-.5-11 1.5Z" fill="#0f9c8c" />
      <path d="M23 13.5c1-4 4.5-6 8-5.5-2.5 1.5-4.5 3.5-5.5 6Z" fill={GROEN} />
      <path d="M2 36q3.6-3 7.2 0t7.2 0 7.2 0 7.2 0 7.2 0" stroke={LUCHT} strokeWidth="2.4" opacity="0.7" {...lijn} />
    </>
  ),

  // --- Domeinen die nog geen leerdoelen hebben ---------------------------
  meten: (
    <>
      <path d="M4.5 12.5h31a2.5 2.5 0 0 1 2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5h-31A2.5 2.5 0 0 1 2 25V15a2.5 2.5 0 0 1 2.5-2.5Z" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" {...vlak} />
      <path d="M9.5 12.5v6M16 12.5v9M22.5 12.5v6M29 12.5v9" stroke={GROEN} strokeWidth="2.2" {...lijn} />
      <path d="M6 33.5h28M6 31v5M34 31v5" stroke={ORANJE} strokeWidth="2.2" {...lijn} />
    </>
  ),
  tijd: (
    <>
      <circle cx="20" cy="21" r="14" fill="#e2edfb" stroke={LUCHT} strokeWidth="2.2" />
      <path d="M20 13v8.5l5.5 3.5" stroke={LUCHT} strokeWidth="2.8" {...lijn} />
      <path d="M14 4.5 9 8.5M26 4.5l5 4" stroke={ORANJE} strokeWidth="2.6" {...lijn} />
      <circle cx="20" cy="21" r="1.8" fill={ORANJE} />
    </>
  ),
  geld: (
    <>
      <rect x="2.5" y="13" width="24" height="15" rx="3.5" fill="#dcf4e8" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="14.5" cy="20.5" r="4" fill="none" stroke={GROEN} strokeWidth="2.2" />
      <circle cx="27.5" cy="24" r="9.5" fill={GEEL} stroke={ORANJE} strokeWidth="2.2" />
      <path d="M31 20.4a4.2 4.2 0 0 0-5.6 1.4c-1.5 2.6 0 6 3.1 6.5M24.4 22.6h5M23.8 25.4h5" stroke={ORANJE} strokeWidth="2.1" {...lijn} />
    </>
  ),
  meetkunde: (
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" fill="#fde6ec" stroke={ROZE} strokeWidth="2.2" {...vlak} />
      <circle cx="28.5" cy="12" r="8.5" fill="#e2edfb" stroke={LUCHT} strokeWidth="2.2" />
      <rect x="9" y="23.5" width="22" height="13.5" rx="3.5" fill="#eee9ff" stroke={VIOOL} strokeWidth="2.2" />
    </>
  ),

  // --- Profiel -----------------------------------------------------------
  /* Staafdiagram voor "Tabellen & grafieken". */
  grafiek: (
    <>
      <path d="M6 5v29h28" stroke={INKT} strokeWidth="2.4" {...lijn} />
      <rect x="11" y="20" width="5.5" height="10" rx="1.8" fill="#dcf4e8" stroke={GROEN} strokeWidth="2" />
      <rect x="19.5" y="13" width="5.5" height="17" rx="1.8" fill="#e2edfb" stroke={LUCHT} strokeWidth="2" />
      <rect x="28" y="8.5" width="5.5" height="21.5" rx="1.8" fill="#eee9ff" stroke={VIOOL} strokeWidth="2" />
    </>
  ),
  vos: (
    <>
      <path d="M10 17 6.5 4.5 18 11.5Z" fill="#e8843c" />
      <path d="M30 17 33.5 4.5 22 11.5Z" fill="#e8843c" />
      <path d="M20 7c9.5 0 16 7.5 16 15.5S29 36 20 36 4 30.5 4 22.5 10.5 7 20 7Z" fill="#e8843c" />
      <path d="M20 20c6 0 11 5 11 9.5S26 36 20 36 9 33.9 9 29.5 14 20 20 20Z" fill="#fdf2e2" />
      <circle cx="14" cy="21" r="2.6" fill={INKT} />
      <circle cx="26" cy="21" r="2.6" fill={INKT} />
      <path d="M20 26.5c2 0 3.2 1.2 3.2 2.5S21.8 31 20 31s-3.2-.7-3.2-2S18 26.5 20 26.5Z" fill={INKT} />
    </>
  ),
};

export function Pictogram({
  naam,
  className = "size-8",
}: {
  naam: PictogramNaam;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {TEKENINGEN[naam]}
    </svg>
  );
}
