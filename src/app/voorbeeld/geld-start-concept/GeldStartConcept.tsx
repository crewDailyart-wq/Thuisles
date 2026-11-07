"use client";

import { Lesspeler } from "@/components/les/Lesscherm";
import { zoekDraaiboek } from "@/components/les/lessen";

const id = "squla-geld-geldmachine-1";

/** Het goedgekeurde startbeeld is nu ook onderdeel van de echte les. */
export function GeldStartConcept() {
  const les = zoekDraaiboek(id);
  return les ? <Lesspeler les={les} /> : null;
}
