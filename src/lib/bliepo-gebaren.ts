/**
 * Welk gebaar maakt Bliepo bij deze zin? (23 oktober 2026, opdracht eigenaar:
 * handgebaren die passen bij het moment, zoals een juf.)
 *
 * Eén gedeelde plek voor opdrachten (Maatje), lessen (Lesscherm) en de
 * testknop "Test praten" op /voorbeeld-bliepo. De namen zijn de bewegingen
 * van de 3D-Bliepo (ACTIONS in lib/zappie3d/zappie.js):
 *   - vraag: open handen naar voren, hoofd licht scheef;
 *   - uitleg: naar de opdracht wijzen, of iets laten zien met zijn handen;
 *   - hint: één hand omhoog alsof hij een idee heeft;
 *   - goed: duim omhoog, in zijn handen klappen, of juichen;
 *   - fout: bemoedigend knikken met open handen, of een vuistje;
 *   - begroeting: zwaaien.
 * Er wordt afgewisseld: zinnen na elkaar krijgen bij dezelfde soort een
 * ander gebaar, en per bericht begint de rij ergens anders.
 */

export type Zinsoort = "vraag" | "uitleg" | "hint" | "goed" | "fout" | "begroeting";

const GEBAREN: Record<Zinsoort, string[]> = {
  vraag: ["ask"],
  uitleg: ["pointTask", "explain"],
  hint: ["idea"],
  goed: ["thumbsUp", "clap", "correct"],
  fout: ["encourage", "fist", "incorrect"],
  begroeting: ["wave"],
};

/**
 * Kies een passend gebaar voor deze soort zin. `sleutel` (bijvoorbeeld het
 * bericht) en `nummer` (de hoeveelste zin) maken de keus vast voor die zin,
 * en zinnen na elkaar krijgen bij dezelfde soort een ander gebaar.
 */
export function kiesGebaar(soort: Zinsoort, sleutel: string, nummer = 0): string {
  const lijst = GEBAREN[soort];
  let h = 0;
  for (let i = 0; i < sleutel.length; i++) h = (h * 31 + sleutel.charCodeAt(i)) >>> 0;
  return lijst[(h + nummer) % lijst.length];
}

/** Een vraag of een uitleg, aan de zin zelf te zien. */
export function vraagOfUitleg(zin: string): Zinsoort {
  return /\?\s*$/.test(zin.trim()) ? "vraag" : "uitleg";
}
