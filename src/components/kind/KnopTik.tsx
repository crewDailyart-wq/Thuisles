"use client";

/**
 * Een zacht tikje bij elke knop die het kind indrukt (29 oktober 2026, opdracht
 * eigenaar). Tekent niets. In de nagebouwde lessen speelt het lesscherm zelf al
 * het klikje op het goede moment; daar doet dit niets, anders klinkt het dubbel.
 */

import { useEffect } from "react";
import { speelTik } from "@/lib/lesgeluiden";

const KNOP = 'button, a[href], [role="button"], [data-zin], [data-getal], [data-signaal]';

export function KnopTik({ toegestaan }: { toegestaan: boolean }) {
  useEffect(() => {
    const opTik = (e: PointerEvent) => {
      const doel = e.target instanceof Element ? e.target.closest(KNOP) : null;
      if (!doel || (doel as HTMLButtonElement).disabled || doel.getAttribute("aria-disabled") === "true") return;
      if (doel.closest('[data-indeling="synthesis"]')) return;
      speelTik(toegestaan);
    };
    window.addEventListener("pointerdown", opTik, { capture: true });
    return () => window.removeEventListener("pointerdown", opTik, { capture: true });
  }, [toegestaan]);
  return null;
}
