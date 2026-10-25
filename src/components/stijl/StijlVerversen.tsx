"use client";

/**
 * Bewaart de eigenaar een nieuwe stijl in de stijlkiezer, dan krijgt elk open
 * tabblad van de kinderkant in dezelfde browser dat meteen te horen en haalt
 * het de pagina opnieuw op (zonder te herladen, het kind raakt niets kwijt).
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const STIJL_KANAAL = "thuisles-stijl";

export function StijlVerversen() {
  const router = useRouter();
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const kanaal = new BroadcastChannel(STIJL_KANAAL);
    kanaal.onmessage = () => router.refresh();
    return () => kanaal.close();
  }, [router]);
  return null;
}
