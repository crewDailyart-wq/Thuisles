import "server-only";

/**
 * De keuzelijsten voor de stapsgewijze beheerfilter.
 *
 * Eén plek die bepaalt wat er in de keuzelijsten staat, zodat alle
 * beheerschermen dezelfde opties krijgen en er nooit een domein van een ander
 * vak tussen kan staan.
 *
 * Een niveau wordt pas gevuld als het niveau erboven gekozen is: geen domein
 * betekent een lege lijst met onderwerpen. Zo kan het scherm die keuzelijst
 * eenvoudigweg weglaten in plaats van een lege lijst te tonen.
 *
 * De groepsfilter werkt door in de lijsten zelf: kies je groep 4, dan
 * verschijnen alleen domeinen en onderwerpen waar voor groep 4 iets in zit.
 * Anders kies je een domein dat daarna een lege lijst oplevert.
 */

import { haalVakken } from "@/lib/data/structuur";
import { haalLeerdoelen } from "@/lib/data/vragen";
import { pastBijGroepsfilter, type Beheerfilter } from "@/lib/beheerfilter";

export type Optie = { waarde: string; label: string };

export type Filteropties = {
  vakken: Optie[];
  domeinen: Optie[];
  subdomeinen: Optie[];
  leerdoelen: Optie[];
};

/** Volgorde bewaren en dubbelen eruit, op slug. */
function uniek(paren: [string, string][]): Optie[] {
  return [...new Map(paren).entries()].map(([waarde, label]) => ({ waarde, label }));
}

export function haalFilteropties(
  vakSlug: string,
  filter: Beheerfilter,
): Filteropties {
  const vakken = haalVakken().map((v) => ({ waarde: v.slug, label: v.naam }));

  // Alles binnen dit vak dat bij de gekozen groep hoort.
  const binnenVak = haalLeerdoelen()
    .filter((l) => l.vakSlug === vakSlug)
    .filter((l) => pastBijGroepsfilter(l, filter.groep));

  const domeinen = uniek(binnenVak.map((l) => [l.domeinSlug, l.domeinNaam]));

  const binnenDomein = filter.domein
    ? binnenVak.filter((l) => l.domeinSlug === filter.domein)
    : [];
  const subdomeinen = uniek(binnenDomein.map((l) => [l.subdomeinSlug, l.subdomeinNaam]));

  const binnenSubdomein = filter.subdomein
    ? binnenDomein.filter((l) => l.subdomeinSlug === filter.subdomein)
    : [];
  const leerdoelen = binnenSubdomein.map((l) => ({
    waarde: l.id,
    label: `${l.code} — ${l.titel}`,
  }));

  return { vakken, domeinen, subdomeinen, leerdoelen };
}
