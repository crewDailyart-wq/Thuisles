import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { SjabloonFormulier } from "@/components/beheer/SjabloonFormulier";
import { haalVak } from "@/lib/data/structuur";
import { haalLeerdoelen } from "@/lib/data/vragen";

export default async function NieuwSjabloonPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  const p = await searchParams;
  const start = Array.isArray(p.leerdoel) ? p.leerdoel[0] : p.leerdoel;
  const leerdoelen = haalLeerdoelen().filter((l) => l.vakSlug === vakSlug);

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Sjablonen", href: `/admin/${vak.slug}/sjablonen` },
          { label: "Nieuw" },
        ]}
        titel="Nieuw sjabloon"
        bijschrift="Kies waar het bij hoort, wat voor sommen, en kijk in het voorbeeld of het klopt."
      />
      <SjabloonFormulier
        vakSlug={vak.slug}
        leerdoelen={leerdoelen}
        startLeerdoelId={start ?? ""}
      />
    </div>
  );
}
