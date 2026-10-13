"use client";

import { useSyncExternalStore } from "react";

const SLEUTEL = "zappie:rustige-omgeving:v1";
const GEBEURTENIS = "zappie:omgevingsbeweging";
const MEDIA = "(prefers-reduced-motion: reduce)";
let tijdelijkRustig = false;

/** Alleen de camerastand; geen leergegevens, geen React-render per animatiebeeld. */
export const reisStand = { positie: 0 };

function lees(): "aan" | "rustig" | "systeem" {
  if (window.matchMedia(MEDIA).matches) return "systeem";
  try {
    return window.sessionStorage.getItem(SLEUTEL) === "ja" ? "rustig" : "aan";
  } catch {
    return tijdelijkRustig ? "rustig" : "aan";
  }
}

function luister(wijzig: () => void) {
  const media = window.matchMedia(MEDIA);
  media.addEventListener("change", wijzig);
  window.addEventListener(GEBEURTENIS, wijzig);
  return () => {
    media.removeEventListener("change", wijzig);
    window.removeEventListener(GEBEURTENIS, wijzig);
  };
}

export function zetOmgevingRustig(rustig: boolean) {
  tijdelijkRustig = rustig;
  try { window.sessionStorage.setItem(SLEUTEL, rustig ? "ja" : "nee"); } catch { /* Privémodus: deze sessie blijft bruikbaar. */ }
  window.dispatchEvent(new Event(GEBEURTENIS));
}

export function useBewegingsstand() {
  return useSyncExternalStore(luister, lees, () => "aan" as const);
}
