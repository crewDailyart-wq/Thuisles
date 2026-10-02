/**
 * Wat de generatoren van het domein Geld delen.
 *
 * Elk geld-type heeft dezelfde vraagzin-velden, dezelfde uitleg en dezelfde
 * foutpatronen, en kiest zijn foute keuzes op dezelfde manier. Dat staat hier
 * één keer, zodat een kind bij "Wisselgeld kiezen" en bij "Hoeveel korting?"
 * dezelfde soort valkuilen tegenkomt.
 */

import type { Leeftijdsgroep, Somgegevens } from "@/lib/generatoren/foutpatroon";
import {
  bepaalVraagtekst,
  husselen,
  vraagtekstVelden,
  type Generator,
  type Instellingen,
  type Veld,
} from "@/lib/generatoren/soort";
import { geldPatronen } from "@/lib/generatoren/patronen/geld";
import { geldAanpak } from "@/lib/generatoren/aanpak/geld";
import { geldUitleg } from "@/lib/generatoren/scripts/geld";

/** De vraagzin is bij elk geld-type de zin van de opgave zelf. */
export const GELDZIN = "{zin}";
export const GELDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": GELDZIN,
  "56": GELDZIN,
  "78": GELDZIN,
};

/** De zeven vraagzin-velden, met een echte voorbeeldzin in het grijs. */
export function geldzinVelden(voorbeeld: string): Veld[] {
  return vraagtekstVelden(GELDZINNEN, {
    voorbeeldzinnen: { "34": voorbeeld, "56": voorbeeld, "78": voorbeeld },
    extraHulp: "Op de plek van {zin} komt de zin van deze opgave te staan.",
  });
}

/** Wat elk geld-type hetzelfde heeft. */
export const GELDBASIS = {
  vraagteksten: { standaard: GELDZINNEN },
  foutpatronen: geldPatronen,
  aanpak: geldAanpak,
  uitleganimatie: geldUitleg,
} satisfies Pick<Generator, "vraagteksten" | "foutpatronen" | "aanpak" | "uitleganimatie">;

/** De vraagzin voor een opgave: de eigen zin van de beheerder, of de zin van de opgave. */
export function geldVraag(
  generator: Pick<Generator, "vraagteksten">,
  inst: Instellingen,
  groep: number,
  som: Somgegevens,
  zin: string,
): string {
  return bepaalVraagtekst(generator, inst, groep, som, { zin });
}

/**
 * Keuzes met precies één goede, gehusseld.
 *
 * De valkuilen worden in volgorde geprobeerd; wat negatief is, dubbel, of
 * gelijk aan het goede antwoord valt weg. Zo blijven de echte denkfouten — een
 * euro ernaast, tien cent ernaast — als eerste over (WERKPLAN.md).
 */
export function bedragkeuzes(
  kans: () => number,
  goed: number,
  valkuilen: number[],
  hoeveel: number,
): { keuzes: number[]; goed: number } {
  const uniek: number[] = [];
  for (const v of valkuilen) {
    if (v > 0 && v !== goed && !uniek.includes(v)) uniek.push(v);
  }
  const keuzes = husselen(kans, [goed, ...uniek.slice(0, hoeveel - 1)]);
  return { keuzes, goed: keuzes.indexOf(goed) };
}

/** Een geheel getal tussen van en tot, beide meegeteld. */
export function tussen(kans: () => number, van: number, tot: number): number {
  return van + Math.floor(kans() * (tot - van + 1));
}

/** Een lijst uit een tekstveld: gescheiden door komma's, puntkomma's of enters. */
export function woordenlijst(waarde: string): string[] {
  return waarde
    .split(/[,\n;]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/** Eén ding met een prijsbereik in hele euro's: "een ijsje 1-4". */
export type Prijsding = { ding: string; van: number; tot: number };

/**
 * Een lijst dingen met een prijsbereik, uit een tekstveld in de admin.
 *
 * Per ding de naam en daarachter van-tot in hele euro's, gescheiden door
 * komma's: "een ijsje 1-4, een bal 5-20, een fiets 60-99". Zo past de prijs
 * bij het ding: een ijsje kost nooit € 87. Alles blijft onder de 100 euro.
 *
 * Staat er bij een ding geen bereik, dan geldt 1 tot en met 20 euro; dat is de
 * veiligste stand en dan valt er tenminste nog iets te oefenen.
 */
export function prijslijst(waarde: string): Prijsding[] {
  return woordenlijst(waarde).map((regel) => {
    const m = regel.match(/^(.*?)\s*€?\s*(\d+)\s*[-–]\s*€?\s*(\d+)\s*$/);
    if (!m || m[1].trim() === "") return { ding: regel, van: 1, tot: 20 };
    const a = Math.max(1, Math.min(99, Number(m[2])));
    const b = Math.max(1, Math.min(99, Number(m[3])));
    return { ding: m[1].trim(), van: Math.min(a, b), tot: Math.max(a, b) };
  });
}
