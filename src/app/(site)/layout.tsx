/**
 * De openbare site van Zappie: de homepagina en wat erbij hoort.
 *
 * Los van de kinderkant en de ouderomgeving, maar in dezelfde huisstijl (zie
 * site.css). Hier komt iemand binnen vanuit Google: wat is Zappie, wat doet
 * het, wat kost het. Alles wat hier staat, mag Google lezen; de kinder- en
 * ouderpagina's blijven daarbuiten (robots.ts en het wachtwoordslot).
 */

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./site.css";
import { Achtergrond } from "@/components/site/Achtergrond";
import { Kop, Logo } from "@/components/site/Kop";
import { MERKNAAM } from "@/lib/merk";
import { niveautestBeschikbaar, scholenoverzicht, siteMenu } from "@/lib/site/inhoud";
import { aantalZichtbareWerkbladen } from "@/lib/data/werkbladen";

export const metadata: Metadata = {
  title: {
    default: `${MERKNAAM}: oefenen dat aansluit op de methode van school`,
    template: `%s | ${MERKNAAM}`,
  },
  description:
    "Zappie laat kinderen in groep 3 tot en met 8 oefenen met precies wat er in de klas gebeurt: afgestemd op de lesmethode van hun school, de kerndoelen en de referentieniveaus van de doorstroomtoets. Toegankelijk voor ieder kind.",
};

export const viewport: Viewport = {
  themeColor: "#040d29",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const menu = siteMenu();
  const werkbladen = aantalZichtbareWerkbladen() > 0;
  const test = niveautestBeschikbaar();
  const { peiljaar } = scholenoverzicht();

  return (
    <div className="st">
      <a href="#inhoud" className="st-overslaan">
        Naar de inhoud
      </a>
      <Achtergrond />
      <Kop menu={menu} />
      <main id="inhoud">{children}</main>

      <footer className="st-voet">
        <div className="st-binnen">
          <div className="st-voet-raster">
            <div className="st-voet-merk">
              <Logo />
              <p>
                Oefenen dat aansluit op de methode van school. Voor groep 3 tot en met 8, afgestemd op de kerndoelen en
                de referentieniveaus van de doorstroomtoets.
              </p>
            </div>
            <nav aria-labelledby="voet-zappie">
              <h2 id="voet-zappie" className="st-titel">
                {MERKNAAM}
              </h2>
              <ul>
                <li>
                  <Link href="/#zo-werkt-het">Zo werkt het</Link>
                </li>
                <li>
                  <Link href="/scholen">Scholenkaart</Link>
                </li>
                <li>
                  <Link href="/#doorstroomtoets">Doorstroomtoets</Link>
                </li>
                <li>
                  <Link href="/#toegankelijk">Toegankelijk</Link>
                </li>
              </ul>
            </nav>
            <nav aria-labelledby="voet-ouders">
              <h2 id="voet-ouders" className="st-titel">
                Ouders
              </h2>
              <ul>
                <li>
                  <Link href="/ouder/overzicht" prefetch={false}>Inloggen</Link>
                </li>
                <li>
                  <Link href="/#prijzen">Prijzen</Link>
                </li>
                <li>
                  <Link href="/#vragen">Veelgestelde vragen</Link>
                </li>
              </ul>
            </nav>
            {(werkbladen || test) && (
              <nav aria-labelledby="voet-gratis">
                <h2 id="voet-gratis" className="st-titel">
                  Gratis
                </h2>
                <ul>
                  {werkbladen && (
                    <li>
                      <Link href="/werkbladen">Werkbladen en posters</Link>
                    </li>
                  )}
                  {test && (
                    <li>
                      <Link href="/niveautest">Niveautest</Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
          <div className="st-voet-juridisch">
            <p>
              © {new Date().getFullYear()} {MERKNAAM}. {MERKNAAM} is onafhankelijk en niet verbonden aan Stichting Cito,
              Bureau ICE, de makers van ROUTE 8, DIA en AMN, of aan de uitgevers van lesmethodes. Genoemde namen zijn
              merken van hun eigenaars en staan hier alleen om aan te geven waarop {MERKNAAM} aansluit.
            </p>
            <p>
              Schoolgegevens: DUO Open Onderwijsdata (CC BY 4.0), peiljaar {peiljaar}. Kaart: CBS Gebiedsindelingen (CC
              BY 4.0) en PDOK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
