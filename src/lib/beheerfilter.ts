/**
 * De stapsgewijze filter van de beheeromgeving.
 *
 * Overal in het beheer wordt in dezelfde volgorde ingezoomd:
 *
 *   groep → vak → domein → subdomein → leerdoel
 *
 * Elke stap mag leeg blijven. Leeg betekent "alles op dit niveau": geen groep
 * is alle groepen, geen domein is het hele vak. Een stap wordt pas ingevuld
 * als de stap erboven gekozen is — een subdomein zonder domein zegt niets.
 *
 * Dit bestand bevat alleen de regels, geen database en geen React, zodat de
 * schermen en de datalaag allebei dezelfde definitie gebruiken.
 */

/** De groepen waarin Thuisles werkt. */
export const GROEPEN = [3, 4, 5, 6, 7, 8] as const;

export type Beheerfilter = {
  /** Leeg = alle groepen. */
  groep: string;
  /** Leeg = het hele vak. */
  domein: string;
  /** Leeg = het hele domein. */
  subdomein: string;
  /** Leeg = het hele subdomein. */
  leerdoel: string;
};

export const LEEG: Beheerfilter = { groep: "", domein: "", subdomein: "", leerdoel: "" };

/** De niveaus in volgorde, zodat schermen ze niet zelf hoeven op te sommen. */
export const NIVEAUS = ["groep", "domein", "subdomein", "leerdoel"] as const;
export type Niveau = (typeof NIVEAUS)[number];

/**
 * De filter uit de zoekparameters van de URL halen.
 *
 * Onderliggende niveaus worden genegeerd zolang het niveau erboven leeg is.
 * Zo kan een half opgeruimde URL nooit een onlogische combinatie opleveren,
 * bijvoorbeeld een subdomein zonder domein.
 */
export function leesFilter(
  p: Record<string, string | string[] | undefined>,
): Beheerfilter {
  const een = (k: string) => {
    const w = p[k];
    return (Array.isArray(w) ? w[0] : w) ?? "";
  };

  const groep = GROEPEN.some((g) => String(g) === een("groep")) ? een("groep") : "";
  const domein = een("domein");
  const subdomein = domein ? een("subdomein") : "";
  const leerdoel = subdomein ? een("leerdoel") : "";

  return { groep, domein, subdomein, leerdoel };
}

/** Hoort dit leerdoel bij de gekozen groep? Leeg = altijd. */
export function pastBijGroepsfilter(
  leerdoel: { groepVan: number; groepTot: number },
  groep: string,
): boolean {
  if (!groep) return true;
  const g = Number(groep);
  return leerdoel.groepVan <= g && g <= leerdoel.groepTot;
}

/**
 * Een lijst leerdoelen door de hele filter halen.
 *
 * Werkt op alles wat de vier velden heeft die ertoe doen; zo is dezelfde
 * functie bruikbaar voor leerdoelregels, sjablonen en wat er later bij komt.
 */
export function filterLeerdoelen<
  T extends {
    id?: string;
    groepVan: number;
    groepTot: number;
    domeinSlug: string;
    subdomeinSlug: string;
  },
>(rijen: T[], filter: Beheerfilter, leerdoelIdVan: (rij: T) => string = (r) => r.id ?? ""): T[] {
  return rijen.filter((r) => {
    if (!pastBijGroepsfilter(r, filter.groep)) return false;
    if (filter.domein && r.domeinSlug !== filter.domein) return false;
    if (filter.subdomein && r.subdomeinSlug !== filter.subdomein) return false;
    if (filter.leerdoel && leerdoelIdVan(r) !== filter.leerdoel) return false;
    return true;
  });
}

/** Is er iets ingesteld? Bepaalt of "Filters wissen" zin heeft. */
export function heeftFilter(f: Beheerfilter): boolean {
  return Boolean(f.groep || f.domein || f.subdomein || f.leerdoel);
}
