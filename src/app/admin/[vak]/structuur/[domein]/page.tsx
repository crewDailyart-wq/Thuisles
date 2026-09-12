import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { DomeinDetail } from "@/components/beheer/DomeinDetail";
import {
  haalLeerdoelen,
  haalSubdomeinen,
  haalVak,
  zoekDomein,
} from "@/lib/data/structuur";
import { haalLeerdoelen as haalMetTelling } from "@/lib/data/vragen";

export default async function DomeinPagina({
  params,
}: {
  params: Promise<{ vak: string; domein: string }>;
}) {
  const { vak: vakSlug, domein: domeinSlug } = await params;
  const vak = haalVak(vakSlug);
  const domein = vak ? zoekDomein(vak.id, domeinSlug) : null;
  if (!vak || !domein) notFound();

  const subdomeinen = haalSubdomeinen(domein.id);
  const telling = new Map(haalMetTelling().map((l) => [l.id, l.aantalVragen]));

  const cijfers = Object.fromEntries(
    subdomeinen.map((s) => {
      const doelen = haalLeerdoelen(s.id);
      const vragen = doelen.reduce((n, d) => n + (telling.get(d.id) ?? 0), 0);
      const leeg = doelen.filter((d) => (telling.get(d.id) ?? 0) === 0).length;
      return [s.id, { leerdoelen: doelen.length, vragen, leeg }];
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Domeinen & leerdoelen", href: `/admin/${vak.slug}/structuur` },
          { label: domein.naam },
        ]}
        titel={domein.naam}
        bijschrift={domein.omschrijving || undefined}
      />
      <DomeinDetail vak={vak} domein={domein} subdomeinen={subdomeinen} cijfers={cijfers} />
    </div>
  );
}
