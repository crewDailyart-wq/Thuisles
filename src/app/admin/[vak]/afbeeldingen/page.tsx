/**
 * Overzicht en beheer van afbeeldingen.
 *
 * Alles wat hier staat, is direct te kiezen bij een vraag of een antwoord —
 * dezelfde map, dezelfde bestandsnamen. Er is dus geen apart systeem naast het
 * bestaande.
 */

import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { Afbeeldingbeheer } from "@/components/beheer/Afbeeldingbeheer";
import { haalVak } from "@/lib/data/structuur";
import { lijstMetDetails } from "@/lib/data/afbeeldingen";
import { telAfbeeldingGebruik } from "@/lib/data/vragen";

export default async function AfbeeldingenPagina({
  params,
}: {
  params: Promise<{ vak: string }>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  const afbeeldingen = lijstMetDetails();
  const gebruik = telAfbeeldingGebruik(afbeeldingen.map((a) => a.naam));

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Afbeeldingen" },
        ]}
        titel="Afbeeldingen"
        bijschrift="Upload hier plaatjes en koppel ze daarna aan een vraag of een antwoord. Deze verzameling is gedeeld met alle vakken."
      />

      <Afbeeldingbeheer afbeeldingen={afbeeldingen} gebruik={gebruik} />
    </div>
  );
}
