/**
 * Het scherm van Bliepo kleurt mee met het antwoord (Sara, 8 november 2026, besluit 2):
 * rood bij een fout, groen bij goed. Op de keuze van het kind zelf komt bij een fout
 * geen rood. De les meldt het hier; Bliepo (3D of filmpje) kijkt mee en kleurt zijn scherm.
 */
export type BliepoSchermSoort = "goed" | "fout";
export type BliepoSchermMelding = { soort: BliepoSchermSoort; n: number };

let huidig: BliepoSchermMelding | null = null;
const luisteraars = new Set<() => void>();

/** Meld dat het antwoord goed of fout was: Bliepo's scherm kleurt groen of rood. */
export function bliepoScherm(soort: BliepoSchermSoort): void {
  huidig = { soort, n: (huidig?.n ?? 0) + 1 };
  luisteraars.forEach((l) => l());
}

export function abonneerBliepoScherm(l: () => void): () => void {
  luisteraars.add(l);
  return () => {
    luisteraars.delete(l);
  };
}

export function huidigeBliepoScherm(): BliepoSchermMelding | null {
  return huidig;
}
