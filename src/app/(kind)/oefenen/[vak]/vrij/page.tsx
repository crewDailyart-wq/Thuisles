/**
 * Stap 3a — vrij oefenen: de onderdelen binnen een vak.
 *
 * Dit scherm stond eerder op `/oefenen/[vak]`. Sinds er eerst een keuze komt
 * tussen vrij oefenen en de schoolroute, hangt het een niveau dieper. De
 * inhoud is niet veranderd: de tegels komen rechtstreeks uit de
 * leerdoelstructuur, en de voortgang per domein is de optelsom van de
 * leerdoelen eronder die bij de groep van het kind horen.
 */

import { notFound } from "next/navigation";
import { Paginakop, TerugLink } from "@/components/oefenen/Paginakop";
import { NogNiets } from "@/components/kind/NogNiets";
import { Tegel } from "@/components/oefenen/Tegel";
import { haalDomeinen, haalHuidigKind, haalVak } from "@/lib/data/queries";

export default async function VrijOefenenPagina({
  params,
}: {
  params: Promise<{ vak: string }>;
}) {
  const { vak: vakSlug } = await params;
  const vak = await haalVak(vakSlug);
  if (!vak) notFound();

  const kind = await haalHuidigKind();
  const domeinen = await haalDomeinen(vakSlug, kind.id);

  return (
    <div className="flex flex-col gap-6">
      <Paginakop
        kruimels={[
          { label: "Start", href: "/start" },
          { label: "Oefenen", href: "/oefenen" },
          { label: vak.naam, href: `/oefenen/${vak.slug}` },
          { label: "Vrij oefenen" },
        ]}
        titel="Vrij oefenen"
        uitleg="Kies zelf een onderdeel. Binnen elk onderdeel staan de onderwerpen waarmee je kunt oefenen."
      />

      {domeinen.length === 0 ? (
        <NogNiets
          tekst={`Voor groep ${kind.groep} staat er bij ${vak.naam.toLowerCase()} nog niets klaar. Zodra er onderwerpen zijn, verschijnen ze hier vanzelf.`}
        />
      ) : (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {domeinen.map(({ domein, aantalSubdomeinen, aantalLeerdoelen, aantalBeheerst }) => {
          const teOpenen = domein.actief && aantalSubdomeinen > 0;
          return (
            <li key={domein.id}>
              <Tegel
                href={teOpenen ? `/oefenen/${vak.slug}/${domein.slug}` : undefined}
                icoon={domein.icoon}
                titel={domein.naam}
                omschrijving={domein.omschrijving}
                beheerst={aantalBeheerst}
                totaal={aantalLeerdoelen}
                notitie={teOpenen ? undefined : "Nog geen onderwerpen"}
              />
            </li>
          );
        })}
      </ul>
      )}

      <TerugLink href={`/oefenen/${vak.slug}`} label="Terug naar de keuze" />
    </div>
  );
}
