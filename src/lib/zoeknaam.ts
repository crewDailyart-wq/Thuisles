/**
 * Namen vergelijkbaar maken.
 *
 * Ouders typen de naam van een school zelden precies zoals hij in de
 * DUO-lijst staat. "regenboog" moet "OBS De Regenboog" vinden, "St. Jozef"
 * moet "Sint Jozefschool" vinden. Daarom wordt elke naam teruggebracht tot
 * kleine letters zonder accenten en zonder leestekens, en worden lidwoorden
 * en veelgebruikte schoolsoorten apart behandeld.
 */

/** Schoolsoorten en lidwoorden die vooraan staan en niets onderscheiden. */
const VOORVOEGSELS = [
  "obs", "rkbs", "pcbs", "cbs", "bs", "kbs", "sbo", "ikc", "kindcentrum",
  "basisschool", "school", "de", "het", "t", "s",
];

/** Kleine letters, geen accenten, geen leestekens, enkele spaties. */
export function normaliseer(tekst: string): string {
  return tekst
    .normalize("NFD")
    // Accenttekens weghalen: "Ariëns" wordt "ariens".
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Dezelfde naam, maar zonder de voorvoegsels vooraan.
 *
 * "obs de regenboog" wordt "regenboog". Zo vindt een ouder die alleen de
 * roepnaam van de school kent hem toch.
 */
export function kern(tekst: string): string {
  let woorden = normaliseer(tekst).split(" ").filter(Boolean);
  while (woorden.length > 1 && VOORVOEGSELS.includes(woorden[0])) {
    woorden = woorden.slice(1);
  }
  return woorden.join(" ");
}

/** Postcodes met en zonder spatie gelijktrekken: "9306 tc" wordt "9306TC". */
export function postcode(tekst: string): string {
  return tekst.replace(/\s+/g, "").toUpperCase();
}

/** Ziet dit eruit als (het begin van) een postcode? */
export function lijktOpPostcode(tekst: string): boolean {
  return /^\d{4}\s*[a-z]{0,2}$/i.test(tekst.trim());
}
