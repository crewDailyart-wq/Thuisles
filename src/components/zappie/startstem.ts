/**
 * De luidspreker bij Bliepo op de startpagina (23 oktober 2026, opdracht
 * eigenaar): staat hij uit, dan praat Bliepo daar niet (de tekstballon blijft).
 * Bewaard op dit apparaat; zonder opslag (privévenster) staat hij gewoon aan.
 */

const SLEUTEL = "bliepo-startstem";
const luisteraars = new Set<() => void>();

export function startstemAan(): boolean {
  try {
    return localStorage.getItem(SLEUTEL) !== "uit";
  } catch {
    return true;
  }
}

export function zetStartstem(aan: boolean): void {
  try {
    localStorage.setItem(SLEUTEL, aan ? "aan" : "uit");
  } catch {
    /* Geen opslag: dan alleen voor dit bezoek. */
  }
  for (const f of luisteraars) f();
}

export function abonneerStartstem(f: () => void): () => void {
  luisteraars.add(f);
  return () => {
    luisteraars.delete(f);
  };
}
