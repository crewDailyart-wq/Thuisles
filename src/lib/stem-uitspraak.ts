/**
 * Uitspraaklijst voor de stem van Bliepo (22 oktober 2026, opdracht eigenaar).
 *
 * Fish Audio spreekt sommige Nederlandse woorden uit alsof ze Engels of Duits
 * zijn ("Hoi" klinkt als "Hej"). Voor die woorden krijgt Fish Audio een
 * andere spelling die wél goed klinkt. Wat er op het scherm staat en waarmee
 * de controle vergelijkt, blijft de gewone spelling.
 *
 * Elk woord hier is gemeten: de gewone spelling ging fout bij het
 * terugluisteren (spraak naar tekst), de vervanging ging goed.
 *
 * Ook gemeten en NIET in de lijst, omdat ze in een zin goed gaan (0 fouten op
 * 72 zinnen): keer, gedeeld door, kwart, derde, vijfde, tientallen, eenheden,
 * de getallen tot honderd, en woorden met ui, ij, eu, g en sch (uil, ijsje,
 * deur, goed, schuur, schoolbord). Ook "Mooi", "Bijna", "Klopt", "Fenna" en
 * "Bliepo" gaan goed; andere spellingen van "Precies" en "Oké" waren niet
 * beter.
 *
 * Verander je iets in de lijst, verhoog dan UITSPRAAK_VERSIE: dan worden de
 * zinnen met dat woord opnieuw gemaakt.
 */

export const UITSPRAAK_VERSIE = 1;

/** [woord zoals het in de zin staat, spelling voor Fish Audio]. Hele woorden, hoofdletters maken niet uit. */
export const UITSPRAAK: [string, string][] = [
  /* "Hoi" klonk als "Hej" of "Hei": gewoon 2 van de 4 goed, als "Hooij" 4 van de 4. */
  ["Hoi", "Hooij"],
  /* "Ja" klonk als het Engelse "Yeah": gewoon 2 van de 4 goed, als "Jaa" 4 van de 4. */
  ["Ja", "Jaa"],
];

function vangHoofdletter(origineel: string, vervanging: string) {
  return origineel[0] === origineel[0].toUpperCase() ? vervanging[0].toUpperCase() + vervanging.slice(1) : vervanging;
}

const regels = UITSPRAAK.map(([woord, vervanging]) => ({
  patroon: new RegExp(`(?<![\\p{L}])${woord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "giu"),
  vervanging,
}));

/** De zin met de spelling uit de uitspraaklijst, alleen voor wat Fish Audio krijgt. */
export function voorUitspraak(zin: string): string {
  let uit = zin;
  for (const { patroon, vervanging } of regels) uit = uit.replace(patroon, (gevonden) => vangHoofdletter(gevonden, vervanging));
  return uit;
}
