import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { LeerdoelDetail } from "@/components/beheer/LeerdoelDetail";
import { haalVak, zoekDomein, zoekLeerdoel, zoekSubdomein } from "@/lib/data/structuur";
import { haalVragen } from "@/lib/data/vragen";
import { haalAlgemeenAantalVragen } from "@/lib/data/instellingen";

export default async function LeerdoelPagina({
  params,
}: {
  params: Promise<{ vak: string; domein: string; subdomein: string; leerdoel: string }>;
}) {
  const p = await params;
  const vak = haalVak(p.vak);
  const domein = vak ? zoekDomein(vak.id, p.domein) : null;
  const subdomein = domein ? zoekSubdomein(domein.id, p.subdomein) : null;
  const leerdoel = zoekLeerdoel(p.leerdoel);
  if (!vak || !domein || !subdomein || !leerdoel) notFound();

  const vragen = haalVragen({ leerdoel: leerdoel.id });

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Domeinen & leerdoelen", href: `/admin/${vak.slug}/structuur` },
          { label: domein.naam, href: `/admin/${vak.slug}/structuur/${domein.slug}` },
          { label: subdomein.naam, href: `/admin/${vak.slug}/structuur/${domein.slug}/${subdomein.slug}` },
          { label: leerdoel.code },
        ]}
        titel={leerdoel.titel}
        bijschrift={`Leerdoel ${leerdoel.code}`}
      />
      <LeerdoelDetail
        vak={vak}
        domein={domein}
        subdomein={subdomein}
        leerdoel={leerdoel}
        vragen={vragen}
      algemeenAantal={haalAlgemeenAantalVragen()}
      />
    </div>
  );
}
