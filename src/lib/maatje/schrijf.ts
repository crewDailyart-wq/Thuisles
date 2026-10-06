/**
 * Het maatje schrijft zijn teksten: van een opgave naar de zes teksten van
 * hoofdstuk 4 van MAATJE-HANDLEIDING.md.
 *
 * Er is geen sleutel voor de Claude API, dus de teksten komen hier uit vaste
 * zinnen per soort som, met de getallen uit de opgave zelf. Thuisles rekent,
 * het maatje vult alleen woorden in — precies zoals de handleiding het zegt.
 *
 * Geeft `null` als er voor deze soort opgave (nog) geen schrijver is. Dan
 * blijft het maatje bij die oefening uit.
 */

import { controleer, type Melding } from "@/lib/maatje/controle";
import type { Geschreven } from "@/lib/maatje/types";
import { schrijfRekenen } from "@/lib/maatje/schrijvers/rekenen-kiezen";
import { schrijfTafelsDelen } from "@/lib/maatje/schrijvers/tafels-delen";
import { schrijfSplitsen } from "@/lib/maatje/schrijvers/splitsen";

export type Opgave = {
  vorm: string;
  vraagtekst: string;
  antwoord: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  figuur: any;
  somgegevens: { soort: string; variant?: string; getallen: number[]; goed: number; extra?: Record<string, number> } | null;
  domeinNaam: string;
  opties?: { tekst: string }[] | null;
};

export type Uitkomst = { geschreven: Geschreven; meldingen: Melding[] } | null;

export function schrijfMaatje(o: Opgave): Uitkomst {
  let geschreven: Geschreven | null = null;
  try {
    geschreven = schrijfRekenen(o) ?? schrijfTafelsDelen(o) ?? schrijfSplitsen(o);
  } catch {
    geschreven = null;
  }
  if (!geschreven) return null;
  return { geschreven, meldingen: controleer(geschreven.teksten, geschreven.controle) };
}
