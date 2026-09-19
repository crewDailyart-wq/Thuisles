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
import { Standaardvos } from "@/components/beheer/Standaardvos";
import { haalVak } from "@/lib/data/structuur";
import { lijstMetDetails } from "@/lib/data/afbeeldingen";
import {
  haalAlleTypemascottes,
  haalStandaardvos,
  vosIsVastgezet,
} from "@/lib/data/instellingen";
import { Typemascottes } from "@/components/beheer/Typemascottes";
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

  /*
    De vos van de oefeningen hoort hier: het is een afbeelding, en dit is de
    plek waar afbeeldingen geregeld worden. `afgeleid` zegt of hij nog uit een
    sjabloon komt in plaats van hier te zijn vastgezet.
  */
  const vos = haalStandaardvos();
  const vastgezet = vosIsVastgezet();
  /* En per soort oefening de eigen standaard; zie `Typemascottes`. */
  const perType = haalAlleTypemascottes();

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

      <Standaardvos
        begin={{
          vangend: vos.vangend ?? "",
          wachtend: vos.wachtend ?? "",
          blij: vos.blij ?? "",
        }}
        beschikbaar={afbeeldingen.map((a) => a.naam)}
        afgeleid={!vastgezet && vos.vangend !== null}
      />

      <Typemascottes begin={perType} beschikbaar={afbeeldingen.map((a) => a.naam)} />

      <Afbeeldingbeheer afbeeldingen={afbeeldingen} gebruik={gebruik} />
    </div>
  );
}
