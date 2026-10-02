import type { MetadataRoute } from "next";
import {
  OPENBARE_GROEPEN,
  haalOpenbareDomeinen,
  haalOpenbareOefeningen,
  haalOpenbareOnderwerpen,
} from "@/lib/data/openbaar";
import { TALEN, openbaarAdres, taalvoorvoegsel } from "@/lib/seo";

/**
 * De sitemap: alle openbare adressen, met hun vertalingen.
 *
 * Alleen de openbare kant; wat dicht staat in `robots.txt` hoort hier ook niet
 * in. De adressen komen uit de namen in de database, dus deze lijst loopt
 * vanzelf mee met wat er in het beheer wordt aangemaakt — er is niets om bij te
 * houden.
 *
 * Per adres staan de vier talen als `alternates`, zodat een zoekmachine weet
 * dat het dezelfde pagina is. Nederlands is het hoofdadres.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const regels: MetadataRoute.Sitemap = [];

  /** Eén adres plus zijn vertalingen. */
  const bij = (zonderTaal: string) => {
    regels.push({
      url: zonderTaal,
      alternates: {
        languages: Object.fromEntries(
          TALEN.map((t) => [t, `${taalvoorvoegsel(t)}${zonderTaal}`]),
        ),
      },
    });
  };

  const domeinen = haalOpenbareDomeinen();

  for (const groep of OPENBARE_GROEPEN) {
    bij(openbaarAdres("nl", groep));
    for (const domein of domeinen) {
      bij(openbaarAdres("nl", groep, domein.adresdeel));
      for (const onderwerp of haalOpenbareOnderwerpen(domein.id)) {
        bij(openbaarAdres("nl", groep, domein.adresdeel, onderwerp.adresdeel));
      }
      for (const oefening of haalOpenbareOefeningen(domein.id, groep)) {
        bij(openbaarAdres("nl", groep, domein.adresdeel, oefening.adresdeel));
      }
    }
  }

  return regels;
}
