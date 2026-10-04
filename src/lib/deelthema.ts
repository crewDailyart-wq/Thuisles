/**
 * De woorden bij delen om zelf te doen: groepjes maken en eerlijk verdelen.
 *
 * Los van het scherm, zodat de generator (de vraagzin), de uitleg na een fout
 * antwoord en het scherm zelf precies dezelfde woorden gebruiken. Hier staat
 * geen React in.
 *
 * Sinds oktober 2026 altijd appels (keuze van de eigenaar): in zakjes bij
 * groepjes maken, in mandjes bij eerlijk verdelen. De andere thema's staan er
 * nog voor opgaven uit de eerste versie, die als concept bewaard zijn.
 */

import type { Deelthema } from "@/lib/generatoren/soort";

/** Alle thema's, in een vaste volgorde: het nummer gaat mee in de somgegevens. */
export const ALLE_DEELTHEMAS: Deelthema[] = ["appels", "knikkers", "eieren", "koekjes", "snoepjes", "visjes", "mandjes"];

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
  mandjes: { voorwerp: "appel", voorwerpen: "appels", houder: "mandje", houders: "mandjes" },
};

/** Het thema bij een manier van delen. */
export function themaVoor(bouw: "groepjes" | "verdelen"): Deelthema {
  return bouw === "groepjes" ? "appels" : "mandjes";
}

/** De opdracht bovenaan: "Maak groepjes van 3." of "Verdeel de appels eerlijk over de 4 mandjes." */
export function bouwOpdracht(bouw: "groepjes" | "verdelen", deler: number): string {
  if (bouw === "groepjes") return `Maak groepjes van ${deler}.`;
  return deler === 1 ? "Leg de appels in het mandje." : `Verdeel de appels eerlijk over de ${deler} mandjes.`;
}

const appels = (n: number) => (n === 1 ? "1 appel" : `${n} appels`);

/** De kern van de zin: "4 zakjes met 3 appels" of "elk mandje krijgt 5 appels". */
function kern(geheel: number, deler: number, bouw: "groepjes" | "verdelen"): string {
  const r = geheel / deler;
  if (bouw === "groepjes") return `${r === 1 ? "1 zakje" : `${r} zakjes`} met ${appels(deler)}`;
  return deler === 1 ? `het mandje krijgt ${appels(r)}` : `elk mandje krijgt ${appels(r)}`;
}

/**
 * Na een goed antwoord: "Goed zo! 4 zakjes met 3 appels. 12 : 3 = 4."
 */
export function deelGoedZin(geheel: number, deler: number, bouw: "groepjes" | "verdelen"): string {
  const k = kern(geheel, deler, bouw);
  return `Goed zo! ${k.charAt(0).toUpperCase()}${k.slice(1)}. ${geheel} : ${deler} = ${geheel / deler}.`;
}

/**
 * Na een fout antwoord: "Het zijn 4 zakjes met 3 appels, want 12 : 3 = 4." of
 * "Elk mandje krijgt 5 appels, want 20 : 4 = 5."
 */
export function deelZin(geheel: number, deler: number, bouw: "groepjes" | "verdelen"): string {
  const som = `${geheel} : ${deler} = ${geheel / deler}`;
  if (bouw === "groepjes") {
    const r = geheel / deler;
    return `Het ${r === 1 ? "is" : "zijn"} ${kern(geheel, deler, bouw)}, want ${som}.`;
  }
  const k = kern(geheel, deler, bouw);
  return `${k.charAt(0).toUpperCase()}${k.slice(1)}, want ${som}.`;
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
  return deelZin(geheel, deler, som.variant);
}
