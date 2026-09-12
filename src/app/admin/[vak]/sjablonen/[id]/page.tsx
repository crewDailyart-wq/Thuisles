import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { SjabloonDetail } from "@/components/beheer/SjabloonDetail";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { haalSjabloon } from "@/lib/data/sjablonen";
import { haalVak } from "@/lib/data/structuur";
import { haalVragenVanSjabloon } from "@/lib/data/vragen";

export default async function SjabloonPagina({
  params,
}: {
  params: Promise<{ vak: string; id: string }>;
}) {
  const { vak: vakSlug, id } = await params;
  const vak = haalVak(vakSlug);
  const sjabloon = haalSjabloon(id);
  if (!vak || !sjabloon) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Sjablonen", href: `/admin/${vak.slug}/sjablonen` },
          { label: sjabloon.naam },
        ]}
        titel={sjabloon.naam}
        bijschrift={`${sjabloon.leerdoelCode} — ${sjabloon.leerdoelTitel}`}
      />
      <SjabloonDetail
        sjabloon={sjabloon}
        vragen={haalVragenVanSjabloon(sjabloon.id)}
        vakSlug={vak.slug}
        algemeenAantal={haalAlgemeenAantalVragen()}
      />
    </div>
  );
}
