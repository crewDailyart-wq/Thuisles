"use client";

/**
 * De geluidsvoorkeur van het kind uit de database overnemen.
 *
 * Tekent niets. Het enige wat dit doet, is de stand die de server heeft
 * opgehaald doorgeven aan de kleine opslag in `lib/geluid.ts`, zodat elke knop
 * en elk geluidje in de kindomgeving dezelfde stand gebruikt.
 *
 * Waarom hier en niet in het oefenscherm: de voorkeur geldt voor de hele
 * kindomgeving, en dit is het enige punt waar élk kindscherm langskomt.
 *
 * Waarom in een effect en niet tijdens het tekenen: de server weet niet wat er
 * in deze browser is onthouden, dus zouden die twee anders uit elkaar kunnen
 * lopen tijdens het opbouwen van de pagina. Nu komt de stand van de server er
 * meteen na het eerste beeldje overheen — de database is de baas.
 */

import { useEffect } from "react";
import { neemGeluidsvoorkeurOver } from "@/lib/geluid";

export function Geluidsvoorkeur({ uitleg, opgave }: { uitleg: boolean; opgave: boolean }) {
  useEffect(() => {
    neemGeluidsvoorkeurOver(uitleg, opgave);
  }, [uitleg, opgave]);

  return null;
}
