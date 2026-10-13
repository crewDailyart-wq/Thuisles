/**
 * De uitslag van de niveautest: per onderdeel en per referentieniveau.
 *
 * Los van de rest, zodat de grenzen op één plek staan: de toets in de browser
 * rekent ermee, en het beheerscherm laat ze zien.
 */

/** Per onderdeel: zoveel goed of meer is "beheerst". */
export const GRENS_BEHEERST = 0.8;
/** Per onderdeel: zoveel goed of meer is "bijna". */
export const GRENS_BIJNA = 0.5;
/** Per referentieniveau, alle onderdelen met dat niveau samen. */
export const GRENS_NIVEAU = 0.75;

export type Beoordeling = "beheerst" | "bijna" | "oefenen";

export const BEOORDELING_LABEL: Record<Beoordeling, string> = {
  beheerst: "Beheerst",
  bijna: "Bijna",
  oefenen: "Nog oefenen",
};

export function beoordeel(goed: number, totaal: number): Beoordeling {
  if (totaal <= 0) return "oefenen";
  const deel = goed / totaal;
  if (deel >= GRENS_BEHEERST) return "beheerst";
  if (deel >= GRENS_BIJNA) return "bijna";
  return "oefenen";
}

export type Uitslagonderdeel = { id: string; titel: string; niveau: string };

export type Onderdeeluitslag = Uitslagonderdeel & { goed: number; totaal: number; beoordeling: Beoordeling };
export type Niveauuitslag = { niveau: string; goed: number; totaal: number; beheerst: boolean };

export type Uitslag = {
  goed: number;
  totaal: number;
  onderdelen: Onderdeeluitslag[];
  niveaus: Niveauuitslag[];
  /** Wat het eerst aandacht verdient: de zwakste onderdelen die nog niet beheerst zijn. */
  oefenpunten: Onderdeeluitslag[];
};

const NIVEAUVOLGORDE = ["1F", "2F", "1S"];

export function berekenUitslag(
  onderdelen: Uitslagonderdeel[],
  antwoorden: { onderdeelId: string; goed: boolean }[],
): Uitslag {
  const perOnderdeel: Onderdeeluitslag[] = onderdelen.map((o) => {
    const eigen = antwoorden.filter((a) => a.onderdeelId === o.id);
    const goed = eigen.filter((a) => a.goed).length;
    return { ...o, goed, totaal: eigen.length, beoordeling: beoordeel(goed, eigen.length) };
  });

  const niveaus = NIVEAUVOLGORDE.flatMap((niveau) => {
    const rij = perOnderdeel.filter((o) => o.niveau === niveau);
    const totaal = rij.reduce((n, o) => n + o.totaal, 0);
    if (totaal === 0) return [];
    const goed = rij.reduce((n, o) => n + o.goed, 0);
    return [{ niveau, goed, totaal, beheerst: goed / totaal >= GRENS_NIVEAU }];
  });

  const oefenpunten = perOnderdeel
    .filter((o) => o.totaal > 0 && o.beoordeling !== "beheerst")
    .sort((a, b) => a.goed / a.totaal - b.goed / b.totaal)
    .slice(0, 3);

  return {
    goed: perOnderdeel.reduce((n, o) => n + o.goed, 0),
    totaal: perOnderdeel.reduce((n, o) => n + o.totaal, 0),
    onderdelen: perOnderdeel,
    niveaus,
    oefenpunten,
  };
}
