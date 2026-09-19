import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { LeerdoelDetail } from "@/components/beheer/LeerdoelDetail";
import {
  haalDomeinen,
  haalSubdomeinen,
  haalVak,
  zoekDomein,
  zoekLeerdoel,
  zoekSubdomein,
} from "@/lib/data/structuur";
import { haalVragen } from "@/lib/data/vragen";
import { beheerlabel } from "@/lib/leerdoelnaam";
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

  /*
    Alle onderwerpen van dit vak, om het leerdoel naartoe te kunnen verhuizen.
    Met de naam van het domein erbij, want "Tellen & sprongen" zegt weinig als
    je niet ziet onder welk domein het hangt.
  */
  const onderwerpen = haalDomeinen(vak.id).flatMap((d) =>
    haalSubdomeinen(d.id).map((s) => ({
      id: s.id,
      naam: s.naam,
      domeinNaam: d.naam,
    })),
  );

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
        /*
          In het beheer staat jouw eigen naam vooraan; de titel die het kind
          ziet komt eronder. Heb je geen eigen naam, dan staat er alleen de
          titel — zoals het was.
        */
        titel={beheerlabel(leerdoel)}
        bijschrift={
          leerdoel.beheernaam
            ? `Leerdoel ${leerdoel.code} — kind ziet: ${leerdoel.titel}`
            : `Leerdoel ${leerdoel.code}`
        }
      />
      <LeerdoelDetail
        vak={vak}
        domein={domein}
        subdomein={subdomein}
        leerdoel={leerdoel}
        vragen={vragen}
        onderwerpen={onderwerpen}
      algemeenAantal={haalAlgemeenAantalVragen()}
      />
    </div>
  );
}
