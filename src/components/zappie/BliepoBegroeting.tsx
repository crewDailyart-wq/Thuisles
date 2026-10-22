"use client";

/**
 * Bliepo begroet het kind op de startpagina (23 oktober 2026, opdracht
 * eigenaar), naast "Kies jouw vak".
 *
 *   - Hooguit één keer per dag (de server onthoudt het per kind; zonder kind
 *     onthoudt de browser het), niet bij elke paginawissel.
 *   - Een zin die past bij de situatie (lib/begroeting.ts), met de naam die
 *     de ouder heeft ingesteld er los voor: "Hoi Sam!".
 *   - Hij zwaait (niet bij "Beweging uit"), praat met Ruth, het lijntje op zijn
 *     scherm beweegt mee en de tekst staat kort in een tekstballon.
 *   - Browsers spelen pas geluid af als er op de pagina getikt is. Kan het nog
 *     niet, dan staat er "Tik op mij!" in zijn ballon en begint hij zodra er
 *     ergens op de pagina getikt wordt.
 *   - Met de luidspreker gaat zijn stem op de startpagina uit; de ballon blijft.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { magGeluid, stopPraten, zegNaElkaar } from "@/lib/stem";
import { abonneerStartstem, startstemAan, zetStartstem } from "@/components/zappie/startstem";

const ZELF = "bliepo-begroet-op";
const TIK = "Tik op mij!";

function vandaag() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

function leesZelf(): string | null {
  try {
    return localStorage.getItem(ZELF);
  } catch {
    return null;
  }
}

function zetZelf() {
  try {
    localStorage.setItem(ZELF, vandaag());
  } catch {
    /* Geen opslag: dan alleen voor dit bezoek. */
  }
}

type Antwoord = { al: true } | { al: false; zinnen: string[]; zelfOnthouden?: boolean };

export function useBegroeting() {
  const [ballon, zetBallon] = useState<string | null>(null);
  const [zwaai, zetZwaai] = useState(0);
  const klaar = useRef(false);

  useEffect(() => {
    let weg = false;
    let stopReeks: (() => void) | null = null;
    let wachtOpTik: (() => void) | null = null;
    const timers: number[] = [];

    const begin = (zinnen: string[], zelf: boolean) => {
      if (weg || klaar.current) return;
      klaar.current = true;
      wachtOpTik?.();
      zetZwaai((n) => n + 1);
      zetBallon(zinnen.join(" "));
      const afronden = () => {
        if (weg) return;
        if (zelf) zetZelf();
        void fetch("/api/begroeting", { method: "POST" }).catch(() => {});
        timers.push(window.setTimeout(() => !weg && zetBallon(null), 2500));
      };
      if (startstemAan()) stopReeks = zegNaElkaar(zinnen, () => {}, afronden, true);
      else timers.push(window.setTimeout(afronden, 1500 + zinnen.join(" ").length * 60));
    };

    void (async () => {
      const j = (await fetch("/api/begroeting", { cache: "no-store" })
        .then((a) => (a.ok ? a.json() : null))
        .catch(() => null)) as Antwoord | null;
      if (weg || !j || j.al || !j.zinnen?.length) return;
      if (j.zelfOnthouden && leesZelf() === vandaag()) return;
      const zinnen = j.zinnen;
      const zelf = Boolean(j.zelfOnthouden);
      /* Even wachten tot Bliepo in beeld staat. */
      await new Promise((r) => timers.push(window.setTimeout(r, 1200)));
      if (weg) return;
      if (!startstemAan() || magGeluid()) {
        begin(zinnen, zelf);
        return;
      }
      /* Nog geen tik gehad: de browser mag nog geen geluid maken. */
      zetBallon(TIK);
      const opTik = () => begin(zinnen, zelf);
      window.addEventListener("pointerdown", opTik, { once: true });
      window.addEventListener("keydown", opTik, { once: true });
      wachtOpTik = () => {
        window.removeEventListener("pointerdown", opTik);
        window.removeEventListener("keydown", opTik);
      };
    })();

    return () => {
      weg = true;
      wachtOpTik?.();
      stopReeks?.();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return { ballon, zwaai };
}

/** Het luidsprekertje bij Bliepo: zijn stem op de startpagina aan of uit. */
export function StartstemKnop({ className = "" }: { className?: string }) {
  const aan = useSyncExternalStore(abonneerStartstem, startstemAan, () => true);
  const wissel = useCallback(() => {
    if (aan) stopPraten();
    zetStartstem(!aan);
  }, [aan]);
  return (
    <button
      type="button"
      className={`zp-startstem ${className}`}
      aria-pressed={!aan}
      title={aan ? "Stem van Bliepo uit" : "Stem van Bliepo aan"}
      onClick={wissel}
    >
      <span className="sr-only">{aan ? "Stem van Bliepo uitzetten" : "Stem van Bliepo aanzetten"}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {aan ? (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a8.5 8.5 0 0 1 0 12" />
          </>
        ) : (
          <path d="M17 9l5 6M22 9l-5 6" />
        )}
      </svg>
    </button>
  );
}
