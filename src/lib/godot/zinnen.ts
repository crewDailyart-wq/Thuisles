/**
 * Wat het maatje zegt tijdens het bouwen in een Godot-bouwsteen.
 *
 * Godot stuurt alleen een sleutel ("krimpen", "andersom"); de zin zelf staat
 * hier, op één plek, volgens MAATJE-HANDLEIDING.md: hoogstens 10 woorden per
 * zin, nooit het antwoord vóór Controleer, en "bijna" in plaats van "fout".
 * Een hint is een kleinere vraag, nooit het antwoord.
 */

import { stuks } from "@/lib/maatje/taal";

type Getallen = { a: number; b: number };

const doosjes = (n: number) => stuks(n, "doosje", "doosjes");

export const GROEPJESMAKER_ZINNEN: Record<string, (g: Getallen) => string[]> = {
  /* De eerste keer dat de plussom krimpt tot een keersom. */
  krimpen: () => ["Steeds evenveel erbij.", "Dat schrijf je korter met keer."],
  /* Andersom gebouwd: niet fout. */
  andersom: ({ a, b }) => [`Jij maakte ${doosjes(b)} van ${a}.`, "Dat is evenveel!"],
  gebouwd: () => ["Typ nu hoeveel eikels het samen zijn."],
  /* Hints: een kleinere vraag. */
  ongelijk: () => ["Zit in elk doosje evenveel?"],
  teveel: ({ a }) => [a === 1 ? "Kijk naar de som. Hoeveel doosjes?" : "Kijk naar de som. Hoeveel doosjes horen erbij?"],
  per: () => ["Kijk nog eens: hoeveel eikels in één doosje?"],
  nul: () => ["Kijk goed: hoeveel doosjes vraagt de som?"],
  /* Wisselen: eerst voorspellen, dan draaien. */
  voorspellen: () => ["Wat denk je?", "Is het na draaien evenveel?"],
  evenveel: () => ["Ja, na draaien is het evenveel."],
  toch_evenveel: () => ["Kijk: na draaien is het toch evenveel."],
  /* Knippen in twee makkelijke sommen. */
  knippen: () => ["Knip de kast na 5 doosjes."],
  geknipt: () => ["Nu heb je twee makkelijke sommen."],
};

export function zinnenVoor(sleutels: string[], g: Getallen): string[] {
  return sleutels.flatMap((s) => GROEPJESMAKER_ZINNEN[s]?.(g) ?? []);
}

/** De raket: wat het maatje zegt tijdens het kiezen. */
export const RAKET_ZINNEN: Record<string, string[]> = {
  twee: ["Je kiest twee stenen.", "Tik op een steen om hem los te laten."],
  eerst_twee: ["Kies eerst twee stenen."],
};
