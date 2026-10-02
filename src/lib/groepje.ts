/**
 * Het groepje van een leerdoel, zoals "Aflezen" of "Klok zetten".
 *
 * Er is geen aparte kolom voor groepjes: het groepje staat vooraan in de naam
 * in beheer, met een punt ertussen — "Aflezen · Hele uren aflezen op de
 * wijzerklok". Het kinderscherm toont het als kopje boven de oefeningen, en de
 * lijst loopt per groepje op van makkelijk naar moeilijk.
 *
 * `null` als er geen groepje is.
 */
export function groepjeVan(leerdoel: { beheernaam: string | null }): string | null {
  const naam = leerdoel.beheernaam ?? "";
  const plek = naam.indexOf(" · ");
  return plek > 0 ? naam.slice(0, plek).trim() : null;
}
