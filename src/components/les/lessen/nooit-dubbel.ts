/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; proefles: de gouden les Tellen).
 *
 * Een gedeelde kiezer voor zinnen van Bliepo die in varianten bestaan (reacties, aanmoediging, "Kom, we tellen ze
 * samen", "Tik op de kaart", hints, uitleg). Hij kiest willekeurig, maar:
 *   - nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen (de kiezer leeft de hele les);
 *   - "dezelfde zin" = dezelfde zin als je de getallen en de wisselwoorden (appel, peer, ...) wegdenkt: "Je koos 12."
 *     en "Je koos 14." zijn dezelfde zin;
 *   - als het kan ook niet 2 keer achter elkaar hetzelfde begin ("Je koos ..." en daarna weer "Je koos ...").
 * Zuiver: geen koppeling met het lesscherm of de database, zodat ook de fouttabel-scripts dit kunnen laden.
 * Andere gouden lessen kunnen deze kiezer later ook gebruiken; nu gebruikt alleen Tellen (gouden en extra) hem.
 */

/** Zonder kleurcode: {12:rood} wordt 12. */
const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");

/** De vorm van een zin: getallen worden #, wisselwoorden (bijvoorbeeld het fruit) worden ~. */
export function maakVorm(wissel: readonly string[] = []) {
  const woorden = [...wissel].sort((a, b) => b.length - a.length);
  const re = woorden.length ? new RegExp(`\\b(${woorden.join("|")})\\b`, "gi") : null;
  return (z: string) => {
    let v = kaal(z).toLowerCase().replace(/\d+/g, "#");
    if (re) v = v.replace(re, "~");
    return v.replace(/\s+/g, " ").trim();
  };
}

/** Het begin van een zin: de eerste 2 woorden tot het eerste leesteken ("je koos", "bijna", "#"). */
export const beginVan = (z: string) =>
  kaal(z)
    .toLowerCase()
    .replace(/\d+/g, "#")
    .split(/[.!?,:]/)[0]
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");

/** Hebben 2 zinnen een stuk van `n` woorden achter elkaar gemeen? (Om "… niet geteld. … niet geteld." te voorkomen.) */
export function deeltStuk(a: string, b: string, n = 2): boolean {
  const woorden = (z: string) => kaal(z).toLowerCase().replace(/\d+/g, "#").replace(/[.!?,:]/g, " ").split(/\s+/).filter(Boolean);
  const A = woorden(a);
  const stukken = new Set<string>();
  for (let i = 0; i + n <= A.length; i++) stukken.add(A.slice(i, i + n).join(" "));
  const B = woorden(b);
  for (let i = 0; i + n <= B.length; i++) if (stukken.has(B.slice(i, i + n).join(" "))) return true;
  return false;
}

export type Kiezer = {
  /**
   * Kies een zin uit `zinnen`. `sleutel` = de situatie ("eerste", "hint", "samenHelp", ...): binnen 1 sleutel komt nooit
   * 2 keer achter elkaar dezelfde zin. `mag` = een extra wens (bijvoorbeeld: geen stuk herhalen uit de zin ervoor). "Nooit
   * 2 keer dezelfde" gaat voor de wens; een harde eis haal je daarom vooraf zelf uit de lijst.
   */
  kies: (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;
};

export function maakKiezer(o: { wissel?: readonly string[]; toeval?: () => number } = {}): Kiezer {
  const vorm = maakVorm(o.wissel);
  const toeval = o.toeval ?? Math.random;
  const vorige = new Map<string, { vorm: string; begin: string }>();
  return {
    kies(sleutel, zinnen, mag = () => true) {
      if (!zinnen.length) return "";
      const v = vorige.get(sleutel);
      /* Van streng naar soepel: de eerste laag waar nog een zin over is, wint. */
      const lagen: ((z: string) => boolean)[] = [
        (z) => mag(z) && (!v || (vorm(z) !== v.vorm && beginVan(z) !== v.begin)),
        (z) => mag(z) && (!v || vorm(z) !== v.vorm),
        (z) => !v || vorm(z) !== v.vorm,
        (z) => mag(z),
        () => true,
      ];
      for (const laag of lagen) {
        const over = zinnen.filter(laag);
        if (!over.length) continue;
        const z = over[Math.floor(toeval() * over.length)] ?? over[0];
        vorige.set(sleutel, { vorm: vorm(z), begin: beginVan(z) });
        return z;
      }
      return zinnen[0];
    },
  };
}
