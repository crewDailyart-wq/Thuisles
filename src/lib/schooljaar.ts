/**
 * Het Nederlandse schooljaar.
 *
 * Loopt van augustus tot en met juli. Wordt gebruikt als stempel bij
 * schoolgegevens en bij een verificatie: die verloopt niet vanzelf, maar je
 * moet wel kunnen zien uit welk jaar hij komt.
 */

/** Bijvoorbeeld "2026/2027". In juli 2026 is dat nog "2025/2026". */
export function huidigSchooljaar(op: Date = new Date()): string {
  const jaar = op.getFullYear();
  // Augustus (maand 7) is de eerste maand van het nieuwe schooljaar.
  const start = op.getMonth() >= 7 ? jaar : jaar - 1;
  return `${start}/${start + 1}`;
}

/**
 * Is het tijd voor de jaarlijkse vraag "klopt de groep en de methode nog?"
 *
 * Die vraag hoort één keer per schooljaar gesteld te worden, aan het begin.
 * Zolang het opgeslagen schooljaar gelijk is aan het huidige, is er niets te
 * vragen.
 */
export function vraagJaarcontrole(
  laatstBevestigdSchooljaar: string | null,
  op: Date = new Date(),
): boolean {
  return laatstBevestigdSchooljaar !== huidigSchooljaar(op);
}
