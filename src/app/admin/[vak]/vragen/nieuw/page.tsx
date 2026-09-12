import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { VraagFormulier } from "@/components/beheer/VraagFormulier";
import { lijstAfbeeldingen } from "@/lib/data/afbeeldingen";
import { haalVakken } from "@/lib/data/structuur";
import { haalLeerdoelen } from "@/lib/data/vragen";
import { VRAAGVORMEN, type Vraagvorm } from "@/lib/vraagtypes";

export default async function NieuweVraagPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVakken().find((v) => v.slug === vakSlug);
  if (!vak) notFound();

  const p = await searchParams;
  const gevraagd = Array.isArray(p.type) ? p.type[0] : p.type;
  const startVorm = VRAAGVORMEN.includes(gevraagd as Vraagvorm)
    ? (gevraagd as Vraagvorm)
    : "";

  // Alleen de leerdoelen van dit vak: je maakt een vraag binnen het vak waar
  // je in zit.
  const leerdoelen = haalLeerdoelen().filter((l) => l.vakSlug === vakSlug);
  const afbeeldingen = lijstAfbeeldingen();
  const startLeerdoel = Array.isArray(p.leerdoel) ? p.leerdoel[0] : p.leerdoel;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Vragen", href: `/admin/${vak.slug}/vragen` },
          { label: "Nieuwe vraag" },
        ]}
        titel="Nieuwe vraag"
        bijschrift="Kies eerst het vraagtype. Daarna verschijnen alleen de velden die daarbij horen."
      />

      <VraagFormulier
        leerdoelen={leerdoelen}
        vakId={vak.id}
        afbeeldingen={afbeeldingen}
        startVorm={startVorm}
        startLeerdoelId={startLeerdoel ?? ""}
      />
    </div>
  );
}
