import type { Figuur } from "@/lib/generatoren/soort";

/** De soorten oefeningen die in een Godot-bouwsteen draaien. */
export const GODOT_SOORTEN = ["groepjesmaker", "raketsom", "laser", "godotspel"] as const;

/** Draait deze opgave in een Godot-bouwsteen? Dan het donkere thema en geen Vos. */
export function isGodotfiguur(figuur: Figuur | null | undefined): boolean {
  return !!figuur && (GODOT_SOORTEN as readonly string[]).includes(figuur.soort);
}
