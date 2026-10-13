/**
 * Wat de openbare site moet weten om te kunnen tonen: het menu en de cijfers.
 *
 * Werkbladen en de niveautest verschijnen alleen als er echt iets is (keuze
 * eigenaar, oktober 2026: "alleen het systeem, nog niets tonen"). Zodra er in
 * beheer een werkblad aan staat, komt het in het menu en op de homepagina.
 */

import { aantalZichtbareWerkbladen } from "@/lib/data/werkbladen";
import overzicht from "@/lib/site/scholenoverzicht.json";

export type Menupunt = { href: string; label: string };

/**
 * De niveautest heeft nog geen speler (zie SITE.md). Tot die er is, staat er
 * nergens een knop naar.
 */
export function niveautestBeschikbaar(): boolean {
  return false;
}

export function siteMenu(): Menupunt[] {
  const menu: Menupunt[] = [
    { href: "/#zo-werkt-het", label: "Zo werkt het" },
    { href: "/scholen", label: "Scholenkaart" },
    { href: "/#doorstroomtoets", label: "Doorstroomtoets" },
    { href: "/#toegankelijk", label: "Toegankelijk" },
  ];
  if (aantalZichtbareWerkbladen() > 0) menu.push({ href: "/werkbladen", label: "Werkbladen" });
  menu.push({ href: "/#prijzen", label: "Prijzen" });
  return menu;
}

export type Scholenoverzicht = {
  aantal: number;
  peiljaar: number;
  /** Landelijk: [% op of boven 1F, % op het streefniveau]. */
  landelijk: { rekenen: [number, number]; lezen: [number, number]; taalverzorging: [number, number] };
};

/**
 * De kerncijfers van de scholenkaart. Gemaakt door scripts/maak-scholenkaart.mjs,
 * tegelijk met public/scholenkaart/scholen.json, en meegebouwd in de code.
 */
export function scholenoverzicht(): Scholenoverzicht {
  return overzicht as Scholenoverzicht;
}

/** 6087 → "6.087" */
export function getal(n: number): string {
  return n.toLocaleString("nl-NL");
}
