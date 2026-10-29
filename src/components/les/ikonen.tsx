"use client";

/**
 * Knoppen met een icoon, voor kinderen die nog niet lezen (27 oktober 2026,
 * ONTWERPREGELS.md "Groep 3: kinderen die nog niet lezen"). Het icoon is
 * genoeg; een klein woord eronder mag. Elke knop krijgt `data-knop`, zodat
 * Bliepo er in een les naar kan wijzen (`l.wijsAan("weetniet", …)`).
 *
 *   vink        = Controleer
 *   vraag       = Weet ik niet
 *   verder      = Verder
 *   luidspreker = Nog eens horen
 *   opnieuw     = Opnieuw / Nog een keer
 *   terug       = Terug
 *   hand        = Hulp (een open hand, bij het zetten van de klok; 28 oktober 2026)
 */

import type { ButtonHTMLAttributes } from "react";
import s from "./ikonen.module.css";

export type Ikoon = "vink" | "vraag" | "verder" | "luidspreker" | "opnieuw" | "terug" | "start" | "race" | "klaar" | "hand";

export function IkoonTeken({ ikoon, maat = 26 }: { ikoon: Ikoon; maat?: number }) {
  const lijn = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={maat} height={maat} viewBox="0 0 24 24" aria-hidden>
      {ikoon === "vink" && <path d="M5 12.5l4.5 4.5L19 7.5" {...lijn} strokeWidth={3} />}
      {ikoon === "vraag" && (
        <>
          <path d="M8.8 9a3.3 3.3 0 1 1 4.6 3c-1 .5-1.4 1.1-1.4 2.2v.6" {...lijn} />
          <circle cx="12" cy="18.6" r="1.5" fill="currentColor" />
        </>
      )}
      {ikoon === "verder" && <path d="M12 5v14M6 13l6 6 6-6" {...lijn} />}
      {ikoon === "luidspreker" && (
        <>
          <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" />
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...lijn} />
        </>
      )}
      {ikoon === "opnieuw" && (
        <>
          <path d="M19.5 12A7.5 7.5 0 1 1 17 6.4" {...lijn} />
          <path d="M18.5 3v4.5H14" {...lijn} />
        </>
      )}
      {ikoon === "terug" && <path d="M19 12H5M11 6l-6 6 6 6" {...lijn} />}
      {ikoon === "start" && <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />}
      {ikoon === "race" && (
        <>
          <path d="M5 21V4" {...lijn} />
          <path d="M5 4.5h12l-2.5 4 2.5 4H5" fill="currentColor" />
        </>
      )}
      {/* Een open hand: vier vingers en een duim, zelf getekend. */}
      {ikoon === "hand" && (
        <path d="M8 13V6.2a1.4 1.4 0 0 1 2.8 0V11M10.8 11V4.6a1.4 1.4 0 0 1 2.8 0V11M13.6 11V5.4a1.4 1.4 0 0 1 2.8 0V12M16.4 12V8.2a1.4 1.4 0 0 1 2.8 0v5.3c0 4-2.6 7-6.6 7h-.8c-2.4 0-3.8-1-5.2-2.9l-2.4-3.4a1.4 1.4 0 0 1 2.2-1.7L8 14" {...lijn} strokeWidth={2.2} />
      )}
      {ikoon === "klaar" && (
        <>
          <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" />
          <path d="M7 6H4.5a3 3 0 0 0 3.5 4M17 6h2.5a3 3 0 0 1-3.5 4M12 14v4M8.5 20h7" {...lijn} />
        </>
      )}
    </svg>
  );
}

/** Een knop met een groot icoon en een klein woord eronder. */
export function IkoonKnop({
  ikoon,
  label,
  knop,
  kleur = "standaard",
  className = "",
  ...rest
}: {
  ikoon: Ikoon;
  /** Het kleine woord onder het icoon (ook voor voorleesprogramma's). */
  label: string;
  /** Naam voor `data-knop` (om aan te wijzen). Standaard het icoon. */
  knop?: string;
  kleur?: "standaard" | "blauw" | "groen" | "oranje" | "roze";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type="button" aria-label={label} data-knop={knop ?? ikoon} className={`${s.knop} ${s[kleur]} ${className}`} {...rest}>
      <span className={s.icoon}>
        <IkoonTeken ikoon={ikoon} />
      </span>
      <span className={s.woord}>{label}</span>
    </button>
  );
}
