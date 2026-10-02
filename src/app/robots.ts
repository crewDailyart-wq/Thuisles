import type { MetadataRoute } from "next";
import { GESLOTEN_PADEN } from "@/lib/seo";

/**
 * `robots.txt`: waar een zoekmachine wel en niet mag komen.
 *
 * Alleen de openbare pagina's voor ouders staan open. De admin, de
 * oefenpagina's en alles achter de login gaan dicht (WERKPLAN.md, SEO-basis
 * punt 5). Welke paden dat zijn staat in `GESLOTEN_PADEN`, zodat het op één
 * plek staat en niet uit de pas kan lopen met de `noindex` op die pagina's.
 *
 * Dit is bewust niet het enige slot. `robots.txt` is een verzoek: een adres dat
 * ergens anders gelinkt staat kan er alsnog in belanden. De pagina's zelf
 * dragen daarom óók `noindex`; zie `NIET_INDEXEREN`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: GESLOTEN_PADEN }],
  };
}
