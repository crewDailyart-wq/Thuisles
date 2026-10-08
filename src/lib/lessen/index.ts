/**
 * Alle uitleglessen, op één plek. Een nieuwe les: in een bestand per onderdeel
 * zetten en hier aanmelden.
 */

import type { Les } from "@/lib/lessen/soort";
import { LESSEN_TOT10 } from "@/lib/lessen/optellen-tot-10";

export const ALLE_LESSEN: Les[] = [...LESSEN_TOT10];

export function zoekLes(id: string): Les | null {
  return ALLE_LESSEN.find((l) => l.id === id) ?? null;
}
