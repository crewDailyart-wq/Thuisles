/**
 * De regels voor afbeeldingen: welke formaten mogen, hoe groot, en hoe een
 * bestandsnaam eruit hoort te zien.
 *
 * Staat hier los van de opslag, zodat zowel de browser (om meteen te kunnen
 * waarschuwen) als de server (die het laatste woord heeft) dezelfde regels
 * gebruikt.
 */

export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_TEKST = "5 MB";

/** Toegestane extensies met het bijbehorende bestandstype. */
export const TOEGESTAAN: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export const EXTENSIES = Object.keys(TOEGESTAAN);

/** Voor het bestandsvenster: alleen deze soorten laten zien. */
export const ACCEPT = [...EXTENSIES, ...new Set(Object.values(TOEGESTAAN))].join(",");

export function extensieVan(naam: string): string {
  const punt = naam.lastIndexOf(".");
  return punt === -1 ? "" : naam.slice(punt).toLowerCase();
}

export function leesbareGrootte(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Maakt van een naam als "Halve Pizza (1).PNG" een nette "halve-pizza-1.png".
 * Zo hoeft niemand na te denken over hoofdletters, spaties of rare tekens.
 */
export function veiligeNaam(origineel: string): string {
  const ext = extensieVan(origineel);
  const kaal = ext ? origineel.slice(0, -ext.length) : origineel;

  const schoon = kaal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${schoon || "afbeelding"}${ext}`;
}

/**
 * Snelle controle vóór het versturen. De server controleert daarna nog een
 * keer, en kijkt dan ook echt in het bestand.
 */
export function controleerVooraf(naam: string, grootte: number): string | null {
  const ext = extensieVan(naam);

  if (!ext || !(ext in TOEGESTAAN)) {
    return `"${naam}" is geen ${EXTENSIES.join(", ")}-bestand.`;
  }
  if (grootte > MAX_BYTES) {
    return `"${naam}" is ${leesbareGrootte(grootte)}. Het maximum is ${MAX_TEKST}.`;
  }
  if (grootte === 0) {
    return `"${naam}" is leeg.`;
  }
  return null;
}
