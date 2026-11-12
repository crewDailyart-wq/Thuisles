/**
 * De voorbeeldpagina (/voorbeeld/les/<id>?naam=...) bewaart niets voor een kind zonder oudertoestemming (besluit Sara,
 * 12 november 2026). Alleen de naam "Testkind" mag bewaren, en dan ook alleen als het gekozen profiel op dit apparaat
 * Testkind heet (anders zou het voorbeeld bij een echt kind terechtkomen). De pagina waar de tik vandaan komt, staat in
 * de Referer die de browser meestuurt. Alles buiten /voorbeeld (de gewone kinderkant) blijft zoals het was.
 */
export function voorbeeldMagBewaren(referer: string | null, kindNaam: string): boolean {
  let url: URL;
  try {
    url = new URL(referer ?? "");
  } catch {
    return true; /* geen (leesbare) Referer: de gewone kinderkant stuurt hem altijd mee; daar verandert niets */
  }
  if (url.pathname !== "/voorbeeld" && !url.pathname.startsWith("/voorbeeld/")) return true;
  return url.searchParams.get("naam") === "Testkind" && kindNaam === "Testkind";
}
