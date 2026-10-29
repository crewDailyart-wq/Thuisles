"use client";

/**
 * Knop in de lesbalk, naast Pauze: de geluidjes van de les aan of uit
 * (29 oktober 2026, opdracht eigenaar). Los van de stem van Bliepo: die blijft
 * gewoon praten. De stand blijft bewaard op dit apparaat (localStorage).
 * Heeft de ouder "Geluidjes in de lessen" uitgezet, dan is de knop er niet.
 */

import { useSyncExternalStore } from "react";
import { abonneerGeluidjes, geluidjesAan, geluidjesVanOuder, zetGeluidjes } from "@/lib/lesgeluiden";

function stand(): "aan" | "uit" | "weg" {
  if (!geluidjesVanOuder()) return "weg";
  return geluidjesAan() ? "aan" : "uit";
}

export function GeluidjesKnop() {
  const nu = useSyncExternalStore(abonneerGeluidjes, stand, () => "aan" as const);
  if (nu === "weg") return null;
  const aan = nu === "aan";
  return (
    <button
      type="button"
      aria-label="Geluidjes aan/uit"
      aria-pressed={aan}
      title={aan ? "Geluidjes staan aan" : "Geluidjes staan uit"}
      data-knop="geluidjes"
      onClick={() => zetGeluidjes(!aan)}
    >
      {/* Eigen icoon: een muzieknootje met twee sterretjes; uit = nootje met een streep erdoor. */}
      <svg width="20" height="18" viewBox="0 0 20 18" aria-hidden style={{ opacity: aan ? 1 : 0.55 }}>
        <path d="M7 3.2 L14 1.6 V11.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 3.2 V13.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="5" cy="13.6" rx="2.6" ry="2.1" fill="currentColor" />
        <ellipse cx="12" cy="11.8" rx="2.6" ry="2.1" fill="currentColor" />
        {aan ? (
          <>
            <path d="M17.2 4.2 v2.4 M16 5.4 h2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M2.2 4.6 v1.8 M1.3 5.5 h1.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </>
        ) : (
          <path d="M2 2 L18 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
