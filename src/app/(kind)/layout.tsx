/**
 * Schil van de kindomgeving.
 *
 * Op grote schermen: donkere zijbalk links, inhoud rechts daarvan.
 * Op telefoon en kleine tablet: geen zijbalk, maar de balk onderaan.
 * De achtergrondillustratie ligt vast over het hele scherm; de inhoud scrollt
 * daaroverheen.
 *
 * Tijdens het oefenen valt die hele schil weg en houdt het kind alleen de
 * vraag over. Welke schermen dat zijn, bepaalt `Kindschil`; deze layout haalt
 * alleen de gegevens op.
 */

import type { Metadata } from "next";
import { Geluidsvoorkeur } from "@/components/kind/Geluidsvoorkeur";
import { Kindschil } from "@/components/kind/Kindschil";
import { haalGeluidsvoorkeuren } from "@/lib/data/kindinstellingen";
import { haalHuidigKind, haalSleutelstand } from "@/lib/data/queries";
import { NIET_INDEXEREN } from "@/lib/seo";

/**
 * De kinderkant hoort niet in een zoekresultaat.
 *
 * Deze schermen zijn van één kind: zijn voortgang, zijn sleutels, de oefening
 * waar het gebleven was. Ze staan achter de login en ze gaan ook met `noindex`
 * dicht, want een adres dat ergens gelinkt staat kan anders alsnog in Google
 * belanden. De openbare pagina's voor ouders staan hier helemaal los van.
 */
export const metadata: Metadata = {
  robots: NIET_INDEXEREN,
};

/**
 * Deze schermen zijn per kind verschillend en mogen dus niet vooraf als
 * vaste pagina worden klaargezet. Zodra er echt wordt ingelogd, is dit
 * noodzakelijk; nu voorkomt het al dat de begroeting blijft hangen.
 */
export const dynamic = "force-dynamic";

export default async function KindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const kind = await haalHuidigKind();
  const sleutels = await haalSleutelstand(kind.id);
  /* Staat het geluid aan? Dat hoort bij het kind, niet bij dit apparaat. */
  const geluid = haalGeluidsvoorkeuren(kind.id);

  return (
    <Kindschil kind={kind} sleutels={sleutels}>
      <Geluidsvoorkeur uitleg={geluid.uitleg} opgave={geluid.opgave} />
      {children}
    </Kindschil>
  );
}
