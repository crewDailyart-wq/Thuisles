"use client";

import { Lesspeler } from "@/components/les/Lesscherm";
import { zoekDraaiboek } from "@/components/les/lessen";

export function LesVoorbeeld({ id, naam }: { id: string; naam: string }) {
  const les = zoekDraaiboek(id);
  return les ? <Lesspeler les={les} naam={naam} /> : null;
}
