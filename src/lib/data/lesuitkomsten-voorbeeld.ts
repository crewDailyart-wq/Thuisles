/**
 * De voorbeeldpagina (/voorbeeld/les/<id>?naam=...) bewaart niets voor een kind zonder oudertoestemming (besluit Sara,
 * 12 november 2026). Alleen de naam "Testkind" mag bewaren, en dan ook alleen als het gekozen profiel op dit apparaat
 * Testkind heet (anders zou het voorbeeld bij een echt kind terechtkomen). De pagina waar de tik vandaan komt, staat in
 * de Referer die de browser meestuurt. Alles buiten /voorbeeld (de gewone kinderkant) blijft zoals het was.
 *
 * Strenger gemaakt (besluit Sara, 19 november 2026, ALLE-VRAGEN.md B5; PRIVACY.md punt C): de voorbeeldpagina bewaart
 * NOOIT iets, behalve voor Testkind, ook als de browser geen (leesbare) Referer meestuurt. Dan kijkt de server naar de
 * routeboom die Next.js bij elke serveractie meestuurt (kop "next-router-state-tree"): daarin staat op welke pagina de
 * les open staat (zonder de ?naam=...). Is het /voorbeeld: alleen Testkind. Is het een andere pagina (de gewone
 * kinderkant): zoals het was. Weet de server het helemaal niet (geen Referer én geen routeboom; dat stuurt de gewone
 * kinderkant nooit zo): dan alleen Testkind.
 */
export function voorbeeldMagBewaren(referer: string | null, kindNaam: string, routeBoom: string | null = null): boolean {
  const testkind = kindNaam === "Testkind";
  const boom = routeIsVoorbeeld(routeBoom);
  let url: URL | null = null;
  try {
    url = new URL(referer ?? "");
  } catch {
    url = null;
  }
  if (url) {
    if (url.pathname === "/voorbeeld" || url.pathname.startsWith("/voorbeeld/")) return url.searchParams.get("naam") === "Testkind" && testkind;
    /* De Referer zegt "niet het voorbeeld", maar de routeboom wel: voor de zekerheid alleen Testkind. */
    if (boom === true) return testkind;
    return true;
  }
  /* Geen (leesbare) Referer. */
  if (boom === false) return true; /* de gewone kinderkant: daar verandert niets */
  return testkind; /* het voorbeeld, of onbekend: nooit voor een echt kind */
}

/**
 * Staat de les op een /voorbeeld-pagina? Leest de routeboom van Next.js (de kop "next-router-state-tree", als JSON met
 * %-codering): ["", { children: ["voorbeeld", { children: [...] }] }]. Routegroepen ("(kind)") tellen niet mee.
 * Geeft null als er geen (leesbare) routeboom is.
 */
export function routeIsVoorbeeld(routeBoom: string | null): boolean | null {
  if (!routeBoom) return null;
  let boom: unknown;
  try {
    boom = JSON.parse(decodeURIComponent(routeBoom));
  } catch {
    try {
      boom = JSON.parse(routeBoom);
    } catch {
      return null;
    }
  }
  const naam = (segment: unknown): string | null => {
    if (typeof segment === "string") return segment;
    if (Array.isArray(segment) && typeof segment[1] === "string") return segment[1];
    return null;
  };
  let knoop: unknown = boom;
  for (let diepte = 0; diepte < 20 && Array.isArray(knoop); diepte++) {
    const segment = naam(knoop[0]);
    if (segment === null) return null;
    if (segment !== "" && !(segment.startsWith("(") && segment.endsWith(")"))) return segment === "voorbeeld";
    const kinderen = knoop[1] as Record<string, unknown> | undefined;
    if (!kinderen || typeof kinderen !== "object") return null;
    knoop = kinderen.children ?? Object.values(kinderen)[0];
  }
  return null;
}
