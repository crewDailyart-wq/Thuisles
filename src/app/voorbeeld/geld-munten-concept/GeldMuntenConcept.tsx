"use client";

import { Lesspeler } from "@/components/les/Lesscherm";
import { zoekDraaiboek } from "@/components/les/lessen";
import { GetekendeMuntenContext } from "@/components/les/vlakken/geld-muntstijl";

/** Het bestaande beginscherm; uitsluitend de muntillustraties in de les zijn anders. */
export function GeldMuntenConcept() {
  const les = zoekDraaiboek("squla-geld-geldmachine-1");
  if (!les) return null;
  return <GetekendeMuntenContext.Provider value={true}>
    <Lesspeler les={les} />
  </GetekendeMuntenContext.Provider>;
}
