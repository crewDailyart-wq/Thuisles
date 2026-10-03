/**
 * De woorden bij delen om zelf te doen: groepjes maken en eerlijk verdelen.
 *
 * Los van het scherm, zodat de generator (de vraagzin), de uitleg na een fout
 * antwoord en het scherm zelf precies dezelfde woorden gebruiken. Hier staat
 * geen React in.
 */

import type { Deelthema } from "@/lib/generatoren/soort";

/** Om de beurt per opgave: appels in zakjes, knikkers in potjes, eieren in doosjes. */
export const GROEPJESTHEMAS: Deelthema[] = ["appels", "knikkers", "eieren"];
/** Om de beurt per opgave: koekjes op bordjes, snoepjes voor kinderen, visjes in kommen. */
export const VERDEELTHEMAS: Deelthema[] = ["koekjes", "snoepjes", "visjes"];
/** Alle zes, in een vaste volgorde: het nummer gaat mee in de somgegevens. */
export const ALLE_DEELTHEMAS: Deelthema[] = [...GROEPJESTHEMAS, ...VERDEELTHEMAS];

export const DEELWOORDEN: Record<
  Deelthema,
  { voorwerp: string; voorwerpen: string; houder: string; houders: string }
> = {
  appels: { voorwerp: "appel", voorwerpen: "appels", houder: "zakje", houders: "zakjes" },
  knikkers: { voorwerp: "knikker", voorwerpen: "knikkers", houder: "potje", houders: "potjes" },
  eieren: { voorwerp: "ei", voorwerpen: "eieren", houder: "doosje", houders: "doosjes" },
  koekjes: { voorwerp: "koekje", voorwerpen: "koekjes", houder: "bordje", houders: "bordjes" },
  snoepjes: { voorwerp: "snoepje", voorwerpen: "snoepjes", houder: "kind", houders: "kinderen" },
  visjes: { voorwerp: "visje", voorwerpen: "visjes", houder: "kom", houders: "kommen" },
};

/** De opdracht bovenaan: "Maak groepjes van 5." of "Verdeel eerlijk over de 4 bordjes." */
export function bouwOpdracht(bouw: "groepjes" | "verdelen", deler: number, thema: Deelthema): string {
  if (bouw === "groepjes") return `Maak groepjes van ${deler}.`;
  const w = DEELWOORDEN[thema];
  return deler === 1 ? `Leg alles bij 1 ${w.houder}.` : `Verdeel eerlijk over de ${deler} ${w.houders}.`;
}

/** De vraag die verschijnt zodra alles in groepjes zit of verdeeld is. */
export function bouwVraag(thema: Deelthema): string {
  switch (thema) {
    case "koekjes":
      return "Hoeveel koekjes krijgt ieder bordje?";
    case "snoepjes":
      return "Hoeveel snoepjes krijgt ieder kind?";
    case "visjes":
      return "Hoeveel visjes komen er in elke kom?";
    default:
      return `Hoeveel ${DEELWOORDEN[thema].houders} zijn het?`;
  }
}

/**
 * Het goede antwoord in gewone taal, na een fout antwoord.
 *
 *   Het zijn 7 zakjes van 5, want 35 : 5 = 7.
 *   Het zijn 7 groepjes van 5, want 35 : 5 = 7.
 *   Ieder bordje krijgt 5, want 20 : 4 = 5.
 */
export function deelZin(
  geheel: number,
  deler: number,
  bouw: "groepjes" | "verdelen",
  thema: Deelthema | null,
  metThema: boolean,
): string {
  const r = geheel / deler;
  const som = `${geheel} : ${deler} = ${r}`;

  if (bouw === "groepjes") {
    const w = metThema && thema ? DEELWOORDEN[thema] : { houder: "groepje", houders: "groepjes" };
    return r === 1
      ? `Het is 1 ${w.houder} van ${deler}, want ${som}.`
      : `Het zijn ${r} ${w.houders} van ${deler}, want ${som}.`;
  }

  if (metThema && thema === "koekjes") return `Ieder bordje krijgt ${r}, want ${som}.`;
  if (metThema && thema === "snoepjes") return `Ieder kind krijgt ${r}, want ${som}.`;
  if (metThema && thema === "visjes") {
    return r === 1
      ? `In elke kom komt 1 visje, want ${som}.`
      : `In elke kom komen ${r} visjes, want ${som}.`;
  }
  return `Het goede antwoord is ${r}, want ${som}.`;
}

/**
 * Dezelfde zin, uit de somgegevens van een opgave. Geeft `null` bij een kale
 * deelsom van vroeger; dan geldt de gewone zin van "zo los je het op".
 */
export function deelsomZin(som: {
  variant?: string;
  getallen: number[];
  extra?: Record<string, number>;
}): string | null {
  if (som.variant !== "groepjes" && som.variant !== "verdelen") return null;
  const [geheel, deler] = som.getallen;
  const thema = ALLE_DEELTHEMAS[som.extra?.thema ?? -1] ?? null;
  return deelZin(geheel, deler, som.variant, thema, som.extra?.stap === 1);
}
