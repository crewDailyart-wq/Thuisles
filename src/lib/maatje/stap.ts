/**
 * Welke plaatje-stap het maatje nu uitspreekt.
 *
 * Het maatje zet hier de stap van de zin die het op dit moment zegt ("bovenste
 * rij vult zich"); een plaatje dat wil meelopen, luistert hier naar met
 * `useSyncExternalStore(abonneerMaatjeStap, huidigeMaatjeStap, () => null)`.
 */

let huidig: string | null = null;
const luisteraars = new Set<() => void>();

export function zetMaatjeStap(stap: string | null): void {
  if (stap === huidig) return;
  huidig = stap;
  for (const f of luisteraars) f();
}

export function huidigeMaatjeStap(): string | null {
  return huidig;
}

export function abonneerMaatjeStap(f: () => void): () => void {
  luisteraars.add(f);
  return () => {
    luisteraars.delete(f);
  };
}
