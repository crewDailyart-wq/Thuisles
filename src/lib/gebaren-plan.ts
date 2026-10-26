/**
 * Het gebarenplan van de server (zie lib/gebaren-server.ts), in de browser
 * één keer per zin opgehaald, tegelijk met het geluid. De 3D-Bliepo gebruikt
 * het als het gebarenwoordenboek zelf niets vindt (dan heeft een goedkoop
 * AI-model één keer gekeken welk gebaar past).
 */

import type { Gebaarmoment } from "@/lib/bliepo-gebaren";

const plannen = new Map<string, Gebaarmoment[]>();
const bezig = new Set<string>();

export function haalGebarenPlan(zin: string): void {
  const z = zin.trim();
  if (!z || plannen.has(z) || bezig.has(z) || typeof window === "undefined") return;
  bezig.add(z);
  /* `v`: de versie van het woordenboek, zodat de browser geen oud plan uit zijn geheugen haalt (26 oktober 2026). */
  void fetch(`/api/stem/gebaren?v=2&zin=${encodeURIComponent(z)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { gebaren?: Gebaarmoment[] } | null) => {
      if (Array.isArray(j?.gebaren)) plannen.set(z, j.gebaren);
    })
    .catch(() => {})
    .finally(() => bezig.delete(z));
}

/** Het plan als het er al is (anders null). */
export function bekendGebarenPlan(zin: string): Gebaarmoment[] | null {
  return plannen.get(zin.trim()) ?? null;
}
