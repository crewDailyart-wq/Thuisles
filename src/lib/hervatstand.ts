/**
 * Verdergaan waar je was (BOUWREGELS 15.53, besluit Sara 28 november 2026): wat er van een niet-afgemaakte speelbeurt bewaard
 * wordt. Alleen de les en de stap (welke vragen al gemaakt zijn en hoe), de denkfouten (voor het resultaat aan het eind) en
 * zo nodig een eigen keuze van de les die nodig is om dezelfde stap terug te vinden. Geen andere gegevens.
 */
export type HervatUitkomst = "goed" | "naFout" | "samen";

export type Hervatstand = {
  antwoorden: [string, HervatUitkomst][];
  denkfouten: string[];
  extra: Record<string, string | number>;
};

/** Maakt van onbekende invoer een nette stand, of null. */
export function netteStand(x: unknown): Hervatstand | null {
  if (!x || typeof x !== "object") return null;
  const s = x as Partial<Hervatstand>;
  if (!Array.isArray(s.antwoorden)) return null;
  const antwoorden = s.antwoorden
    .filter((a): a is [string, HervatUitkomst] => Array.isArray(a) && typeof a[0] === "string" && /^[A-Za-z0-9_.:-]{1,80}$/.test(a[0]) && ["goed", "naFout", "samen"].includes(a[1] as string))
    .slice(0, 80)
    .map((a) => [a[0], a[1]] as [string, HervatUitkomst]);
  if (!antwoorden.length) return null;
  const denkfouten = Array.isArray(s.denkfouten) ? s.denkfouten.slice(0, 200).map((d) => String(d).slice(0, 80)) : [];
  const extra: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(s.extra && typeof s.extra === "object" ? s.extra : {}).slice(0, 30))
    if (typeof v === "number" || (typeof v === "string" && v.length <= 120)) extra[k.slice(0, 40)] = v;
  return { antwoorden, denkfouten, extra };
}

/** Goed in 1 keer (%) van wat tot nu gemaakt is: de kleur van het rondje. */
export const goedTotNu = (s: Hervatstand): number => Math.round((s.antwoorden.filter((a) => a[1] === "goed").length / Math.max(1, s.antwoorden.length)) * 100);
