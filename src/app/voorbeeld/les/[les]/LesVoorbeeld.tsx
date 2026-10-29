"use client";

import { useMemo } from "react";
import { Lesspeler } from "@/components/les/Lesscherm";
import { zoekDraaiboek } from "@/components/les/lessen";

/**
 * `?indeling=synthesis` (28 oktober 2026): de les met de indeling van
 * Synthesis bekijken, ook als het draaiboek die nog niet zelf aanzet.
 */
export function LesVoorbeeld({ id, naam }: { id: string; naam: string }) {
  const les = useMemo(() => {
    const d = zoekDraaiboek(id);
    if (!d || typeof window === "undefined") return d;
    return new URLSearchParams(window.location.search).get("indeling") === "synthesis" ? { ...d, indeling: "synthesis" as const } : d;
  }, [id]);
  return les ? <Lesspeler les={les} naam={naam} /> : null;
}
