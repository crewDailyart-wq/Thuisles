/**
 * Stap 2: hoe wil je oefenen?
 *
 * Dit scherm zat er eerder niet tussen; je kwam vanaf "Rekenen" meteen in de
 * lijst met onderdelen. Nu komt eerst deze keuze, want de twee routes door de
 * stof zijn wezenlijk verschillend en dat verschil moet een kind zelf kunnen
 * maken:
 *
 *   vrij oefenen    -> het kind kiest zelf een onderwerp
 *   volgens school  -> de volgorde komt van de gekoppelde methode
 *
 * Beide routes gebruiken dezelfde Thuisles-vragendatabase. Er bestaat maar één
 * set vragen; de methodekoppeling verandert alleen de volgorde waarin ze
 * langskomen. Zie `haalMethodeoverzicht` in de datalaag.
 *
 * Bewust kaal: geen kruimelpad, geen paginakop, geen begroeting. De twee
 * kaarten zeggen zelf al waar ze heen gaan — titel, uitleg en knop staan er
 * in getekend. Alles wat daar nog omheen staat, leidt af van de enige vraag
 * die dit scherm stelt. De begroeting hoort bij de gedeelde header en laat
 * zichzelf hier weg; zie `components/kind/Begroeting.tsx`. Terug kan via de
 * link onderaan en via de balk met Start, Oefenen en de rest.
 */

import { notFound } from "next/navigation";
import { TerugLink } from "@/components/oefenen/Paginakop";
import { Routekeuze } from "@/components/oefenen/Routekeuze";
import { haalVak } from "@/lib/data/queries";

export default async function VakPagina({
  params,
}: {
  params: Promise<{ vak: string }>;
}) {
  const { vak: vakSlug } = await params;
  const vak = await haalVak(vakSlug);
  if (!vak) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/*
        De enige kop op dit scherm is voorleesbaar maar onzichtbaar: de
        getekende titels staan in de afbeeldingen, en die kan een
        voorleesprogramma niet lezen.
      */}
      <h1 className="sr-only">{vak.naam} — hoe wil je oefenen?</h1>

      <Routekeuze vakSlug={vak.slug} />

      <TerugLink href="/oefenen" label="Terug naar de vakken" />
    </div>
  );
}
