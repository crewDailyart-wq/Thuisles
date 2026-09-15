import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { SjabloonFormulier } from "@/components/beheer/SjabloonFormulier";
import { haalDomeinen, haalSubdomeinen, haalVak } from "@/lib/data/structuur";
import { haalLeerdoelen } from "@/lib/data/vragen";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";
import { lijstAfbeeldingen } from "@/lib/data/afbeeldingen";

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

  /*
    De onderwerpen komen uit de STRUCTUUR en niet uit de leerdoelen.

    Zou je ze uit de leerdoelen afleiden, dan mist elk onderwerp waar nog geen
    leerdoel onder hangt — en juist daar wil je een oefening kunnen beginnen.
    Ontbreekt het leerdoel, dan biedt het formulier aan er één te maken.
  */
  const onderwerpen = haalDomeinen(vak.id).flatMap((domein) =>
    haalSubdomeinen(domein.id).map((sub) => ({
      id: sub.id,
      naam: sub.naam,
      domeinNaam: domein.naam,
    })),
  );

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
        onderwerpen={onderwerpen}
        startLeerdoelId={start ?? ""}
        algemeenAantal={haalAlgemeenAantalVragen()}
        afbeeldingen={lijstAfbeeldingen()}
      />
    </div>
  );
}
