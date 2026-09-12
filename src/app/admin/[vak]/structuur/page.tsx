/**
 * Domeinen & leerdoelen.
 *
 * De stapsgewijze filter staat er ook hier boven, zodat het beheer overal
 * hetzelfde werkt. Wat deze lijst ervan kan laten zien is beperkt tot wat er
 * in staat: domeinen. Kies je groep 3, dan vallen domeinen weg waar voor groep
 * 3 niets in zit; kies je een domein, dan blijft dat domein over. Een
 * onderwerp of leerdoel kiezen versmalt de lijst niet verder — die staan een
 * niveau dieper, achter "Openen" — maar de keuze blijft wel staan en gaat mee
 * naar de andere beheerschermen.
 */

import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { DomeinenTabel } from "@/components/beheer/DomeinenTabel";
import { Stapfilter } from "@/components/beheer/Stapfilter";
import { leesFilter, pastBijGroepsfilter } from "@/lib/beheerfilter";
import { haalFilteropties } from "@/lib/data/filteropties";
import { haalDomeinen, haalVak } from "@/lib/data/structuur";
import { haalDekkingPerDomein, haalLeerdoelen } from "@/lib/data/vragen";

export default async function StructuurPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  const filter = leesFilter(await searchParams);
  const opties = haalFilteropties(vak.slug, filter);

  /*
    Welke domeinen hebben iets voor de gekozen groep? Zonder groepsfilter is
    dat allemaal. Een domein zonder leerdoelen valt nooit weg: dat is juist een
    domein waar nog werk ligt.
  */
  const metInhoud = new Set(
    haalLeerdoelen()
      .filter((l) => l.vakSlug === vak.slug && pastBijGroepsfilter(l, filter.groep))
      .map((l) => l.domeinSlug),
  );
  const heeftLeerdoelen = new Set(
    haalLeerdoelen()
      .filter((l) => l.vakSlug === vak.slug)
      .map((l) => l.domeinSlug),
  );

  const domeinen = haalDomeinen(vak.id)
    .filter((d) => !filter.domein || d.slug === filter.domein)
    .filter((d) => !filter.groep || metInhoud.has(d.slug) || !heeftLeerdoelen.has(d.slug));

  const cijfers = Object.fromEntries(
    haalDekkingPerDomein(vak.id).map((d) => [
      d.domeinId,
      { subdomeinen: d.subdomeinen, leerdoelen: d.leerdoelen, vragen: d.vragen },
    ]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Domeinen & leerdoelen" },
        ]}
        titel="Domeinen & leerdoelen"
        bijschrift="Vak › domein › onderwerp › leerdoel. Klik door om te verdiepen."
      />

      <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4">
        <Stapfilter gegevens={{ scherm: "structuur", vakSlug: vak.slug, ...opties }} />
      </section>

      <DomeinenTabel vak={vak} domeinen={domeinen} cijfers={cijfers} />
    </div>
  );
}
