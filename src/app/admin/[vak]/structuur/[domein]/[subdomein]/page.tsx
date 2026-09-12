import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { SubdomeinDetail } from "@/components/beheer/SubdomeinDetail";
import {
  haalLeerdoelen,
  haalVak,
  zoekDomein,
  zoekSubdomein,
} from "@/lib/data/structuur";
import { haalLeerdoelen as haalMetTelling } from "@/lib/data/vragen";

export default async function SubdomeinPagina({
  params,
}: {
  params: Promise<{ vak: string; domein: string; subdomein: string }>;
}) {
  const { vak: vakSlug, domein: domeinSlug, subdomein: subSlug } = await params;
  const vak = haalVak(vakSlug);
  const domein = vak ? zoekDomein(vak.id, domeinSlug) : null;
  const subdomein = domein ? zoekSubdomein(domein.id, subSlug) : null;
  if (!vak || !domein || !subdomein) notFound();

  const leerdoelen = haalLeerdoelen(subdomein.id);
  const vragenPerLeerdoel = Object.fromEntries(
    haalMetTelling().map((l) => [l.id, l.aantalVragen]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Domeinen & leerdoelen", href: `/admin/${vak.slug}/structuur` },
          { label: domein.naam, href: `/admin/${vak.slug}/structuur/${domein.slug}` },
          { label: subdomein.naam },
        ]}
        titel={subdomein.naam}
        bijschrift={subdomein.omschrijving || undefined}
      />
      <SubdomeinDetail
        vak={vak}
        domein={domein}
        subdomein={subdomein}
        leerdoelen={leerdoelen}
        vragenPerLeerdoel={vragenPerLeerdoel}
      />
    </div>
  );
}
