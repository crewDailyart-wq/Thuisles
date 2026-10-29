/*
  Antwoordknoppen op de vaste plek (28 oktober 2026, besluit eigenaar).

  Het vinkje en het vraagteken staan in elke les direct onder de zin van
  Bliepo (`l.knoppen`), nooit in het speelvlak. Een vlak dat die knoppen
  vroeger zelf tekende, meldt nog steeds `klaar`, `hulp` enzovoort, maar nu
  komt die melding van de knop van het lesscherm.

  `knoppenOpPlek(l, regels)` pakt een gids in, zodat het draaiboek zelf
  nauwelijks verandert:

  - `wachtOpVlak(["klaar", "hulp"])` wacht ook op de knoppen van het
    lesscherm en geeft dezelfde melding terug als het vlak vroeger deed
    (soort + de stand van het vlak, die het vlak geeft via `standBron`);
  - `wijsAan("klaar", …)` wijst de knop op de nieuwe plek aan;
  - de knoppen staan er alleen als het vlak ze zou tonen (`zichtbaar`).

  Het vlak krijgt de eigenschap `standBron` mee: een functie waaraan het een
  functie geeft die de stand levert op het moment dat de knop getikt wordt.
*/
import type { Lesgids, Vlakgebeurtenis } from "../soort";

/* "hulp" = het handje (kloklessen, 28 oktober 2026). */
export type Antwoordknop = "weetniet" | "controleer" | "hulp";

export type Knopregels = {
  /** Vlaksoort die vroeger bij een knop hoorde -> knop van het lesscherm. */
  soorten: Record<string, Antwoordknop>;
  /** Alleen voor dit vlak (de nieuwe); een ander vlak houdt zijn eigen knoppen. */
  voor?: unknown | unknown[];
  /** Oude `data-knop`-naam in het vlak -> knop van het lesscherm (voor `wijsAan`). */
  aanwijs?: Record<string, Antwoordknop>;
  /**
   * Welke vlaksoorten hebben nu een knop? Krijgt de huidige eigenschappen van
   * het vlak. `null` = alle (standaard).
   */
  /**
   * Mag deze knop nu? Krijgt de stand van het vlak (zie `standBron`). Bij
   * `false` doet de tik niets (het vinkje zonder keuze).
   */
  geldig?: (knop: Antwoordknop, stand: Record<string, unknown>) => boolean;
  zichtbaar?: (props: Record<string, unknown>) => string[] | null;
};

export function knoppenOpPlek(l: Lesgids, regels: Knopregels): Lesgids {
  let props: Record<string, unknown> = {};
  let geefStand: () => Record<string, unknown> = () => ({});
  const standBron = (f: () => Record<string, unknown>) => {
    geefStand = f;
  };
  let actief = true;

  const vlak: Lesgids["vlak"] = (comp, p) => {
    props = comp ? { ...(p as Record<string, unknown>) } : {};
    geefStand = () => ({});
    actief = !regels.voor || (Array.isArray(regels.voor) ? regels.voor.includes(comp) : comp === regels.voor);
    (l.vlak as (c: unknown, p?: object) => void)(comp, comp && actief ? { ...(p ?? {}), standBron } : p);
  };
  const pasVlakAan: Lesgids["pasVlakAan"] = (p) => {
    props = { ...props, ...(p as Record<string, unknown>) };
    l.pasVlakAan(p);
  };
  const wijsAan: Lesgids["wijsAan"] = (knop, ...zinnen) => l.wijsAan((actief && regels.aanwijs?.[knop]) || knop, ...zinnen);

  const wachtOpVlak = <G extends Vlakgebeurtenis = Vlakgebeurtenis>(soort?: string | string[]): Promise<G> => {
    const vlakWacht = l.wachtOpVlak<G>(soort);
    if (!actief) return vlakWacht;
    const gevraagd = soort === undefined ? Object.keys(regels.soorten) : Array.isArray(soort) ? soort : [soort];
    const zicht = regels.zichtbaar ? regels.zichtbaar(props) : null;
    const bruikbaar = gevraagd.filter((s) => regels.soorten[s] && (zicht === null || zicht.includes(s)));
    if (bruikbaar.length === 0) return vlakWacht;
    const welke = [...new Set(bruikbaar.map((s) => regels.soorten[s]))];
    const knoppen = (async () => {
      for (;;) {
        const k = await l.knoppen(welke);
        const stand = geefStand();
        if (regels.geldig && !regels.geldig(k, stand)) continue;
        const s = bruikbaar.find((x) => regels.soorten[x] === k) ?? bruikbaar[0];
        return { ...stand, soort: s } as unknown as G;
      }
    })();
    /* De knoppen die niet gekozen worden, vallen vanzelf weg: het lesscherm haalt ze weg bij de volgende melding. */
    knoppen.catch(() => {});
    return Promise.race([vlakWacht, knoppen]);
  };

  return { ...l, vlak, pasVlakAan, wijsAan, wachtOpVlak };
}
