/**
 * De twee namen van een leerdoel.
 *
 * `titel` is wat het kind en de ouder zien. `beheernaam` is wat alleen in het
 * beheer staat, en die mag leeg blijven. Deze twee hulpjes staan hier en niet
 * bij de database, omdat de schermen aan alle kanten — beheer, kind en ouder —
 * ermee rekenen, en die mogen niet aan de server-only kant komen.
 */

/**
 * De naam waaraan de beheerder een leerdoel herkent.
 *
 * Dít is wat uniek moet zijn binnen een onderwerp, en niet de titel. Twee
 * leerdoelen mogen voor een kind hetzelfde heten zolang de beheerder ze uit
 * elkaar kan houden; kan dat niet, dan is er geen verschil te zien en is het
 * een vergissing.
 */
export function beheerlabel(l: { titel: string; beheernaam?: string | null }): string {
  const eigen = (l.beheernaam ?? "").trim();
  return eigen === "" ? l.titel : eigen;
}

/** 1 tot 5, of `null`. Alles daarbuiten telt als niet ingevuld. */
export function begrensMoeilijkheid(waarde: unknown): number | null {
  const n = Math.round(Number(waarde));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n;
}
