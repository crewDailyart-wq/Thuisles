/**
 * De begroeting van Bliepo op de startpagina (23 oktober 2026, opdracht
 * eigenaar).
 *
 * Bliepo naast "Kies jouw vak" begroet het kind hooguit één keer per dag, met
 * een zin die past bij de situatie. De naam gaat er los voor ("Hoi Sam!"):
 * zo wordt elke begroeting maar één keer ingesproken en gedeeld door alle
 * kinderen, en kost de naam per kind maar een paar tekens.
 *
 * Dit bestand mag zowel in de browser als op de server gebruikt worden.
 */

export type Situatie = "eerste" | "gisteren" | "terug" | "ochtend" | "middag" | "avond";

export const BEGROETINGEN: Record<Situatie, string[]> = {
  eerste: ["Ik ben Bliepo, jouw rekenmaatje. Zullen we samen beginnen?"],
  gisteren: ["Gisteren deed je het super. Zin in nog een rondje?", "Gisteren ging het heel goed. Zullen we verder?"],
  terug: ["Welkom terug! Ik heb je gemist.", "Daar ben je weer! Ik heb je gemist."],
  ochtend: ["Goedemorgen! Zin om te rekenen?", "Goedemorgen! Fijn dat je er bent."],
  middag: ["Goedemiddag! Zullen we samen oefenen?", "Goedemiddag! Leuk dat je er weer bent."],
  avond: ["Goedenavond! Nog even oefenen?", "Goedenavond! Fijn dat je er bent."],
};

/*
  Korte begroetingen (23 oktober 2026, opdracht eigenaar): komt het kind via
  "Wie gaat er oefenen?" binnen en is het vandaag al volledig begroet, dan zegt
  Bliepo iets korts. Ze wisselen elkaar af, zodat het niet saai wordt.
*/
export const KORTE_BEGROETINGEN = [
  "Daar ben je weer!",
  "Zullen we verder?",
  "Fijn dat je er weer bent!",
  "Hoi! Klaar voor een rondje?",
  "Daar ben je! Zin om te oefenen?",
  "Welkom terug, rekenheld!",
];

/** Alle begroetingen, om ze vooraf in te spreken. */
export function alleBegroetingen(): string[] {
  return [...Object.values(BEGROETINGEN).flat(), ...KORTE_BEGROETINGEN];
}

/** Het losse naamstukje. Alleen letters, spaties en streepjes; hooguit 24 tekens. */
export function naamZin(naam: string | null | undefined): string | null {
  const schoon = (naam ?? "").normalize("NFC").replace(/[^\p{L}\p{M} '-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return schoon ? `Hoi ${schoon}!` : null;
}

export type Gegevens = {
  /** Uur van de dag (0-23), in Nederland. */
  uur: number;
  /** Volgnummer van de dag, om tussen varianten te wisselen. */
  dagnummer: number;
  /** Is Bliepo dit kind al eens begroet (of heeft het al geoefend)? */
  eerderGezien: boolean;
  /** Was het kind gisteren of vandaag nog bezig? Zo niet: "Welkom terug". */
  gisterenOfVandaagActief: boolean;
  /** Gisteren goed geoefend (genoeg vragen, meestal goed)? */
  gisterenGoed: boolean;
};

export function kiesSituatie(g: Gegevens): Situatie {
  if (!g.eerderGezien) return "eerste";
  if (g.gisterenGoed) return "gisteren";
  if (!g.gisterenOfVandaagActief) return "terug";
  if (g.uur >= 5 && g.uur < 12) return "ochtend";
  if (g.uur >= 12 && g.uur < 18) return "middag";
  return "avond";
}

export function kiesBegroeting(g: Gegevens): { situatie: Situatie; zin: string } {
  const situatie = kiesSituatie(g);
  const lijst = BEGROETINGEN[situatie];
  return { situatie, zin: lijst[g.dagnummer % lijst.length] };
}
