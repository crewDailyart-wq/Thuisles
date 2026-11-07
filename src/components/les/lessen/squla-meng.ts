/**
 * Het goede antwoord staat niet steeds op dezelfde plek (BOUWREGELS 1.23, herstel 7 november 2026, groep C:
 * piraat, splitsen, plus, min, rekenmix, rekentaal).
 *
 * `meng(keuzes)` geeft de keuzes in een willekeurige volgorde terug. Per lijst (hetzelfde array-object) blijft de
 * volgorde gelijk zolang de pagina open is: bij een tweede poging van dezelfde vraag springen de knoppen dus niet.
 * Bij een nieuwe les-start (pagina opnieuw) is de volgorde weer anders. De antwoordwaarden en de beoordeling
 * veranderen niet: alleen de plek wisselt.
 *
 * `mengSleutel(sleutel, keuzes)` doet hetzelfde voor keuzes die elke keer opnieuw als nieuw array worden gemaakt
 * (bijvoorbeeld `keuzes.map(String)`): de sleutel (bv. de vraag-id plus de keuzes) bepaalt dan de volgorde.
 */

const perLijst = new WeakMap<object, unknown[]>();
const perSleutel = new Map<string, number[]>();

/** Fisher-Yates: elke volgorde even vaak, dus geen vast patroon (niet altijd links, niet om en om). */
function volgorde(n: number): number[] {
  const v = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}

export function meng<T>(keuzes: readonly T[]): T[] {
  const oud = perLijst.get(keuzes) as T[] | undefined;
  if (oud) return oud;
  const v = volgorde(keuzes.length).map((i) => keuzes[i]);
  perLijst.set(keuzes, v);
  return v;
}

export function mengSleutel<T>(sleutel: string, keuzes: readonly T[]): T[] {
  const k = `${sleutel}|${keuzes.length}`;
  let v = perSleutel.get(k);
  if (!v) {
    v = volgorde(keuzes.length);
    perSleutel.set(k, v);
  }
  return v.map((i) => keuzes[i]);
}
