/**
 * Het poppetje van het maatje.
 *
 * Voorlopig is dat Vos. Komt er een ander maatje, dan hoeft alleen dit
 * bestand anders: welke houding van het plaatje bij welke stemming hoort. De
 * plaatjes zelf staan in `public/vos` (zie `vosposities.ts`); zolang die er
 * niet zijn, tekent Vos zichzelf.
 */

import type { Houding } from "@/lib/vosposities";
import type { Beweging } from "@/components/oefenen/VosFiguur";

/** De vijf houdingen uit de opdracht. "praat" is een beweging: de mond gaat open en dicht. */
export type MaatjeHouding = "rustig" | "praat" | "blij" | "denkt" | "troost";

export const POPPETJE: { naam: string; houdingen: Record<MaatjeHouding, { houding: Houding; beweging: Beweging }> } = {
  naam: "Vos",
  houdingen: {
    rustig: { houding: "blij", beweging: "stil" },
    praat: { houding: "blij", beweging: "praten" },
    blij: { houding: "juichend", beweging: "juichen" },
    denkt: { houding: "denkend", beweging: "stil" },
    /* Een eigen troostplaatje is er nog niet; Vos wijst dan rustig naar de som. */
    troost: { houding: "wijzend", beweging: "wijzen" },
  },
};
