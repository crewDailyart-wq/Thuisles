/**
 * Voortgang › één onderdeel.
 *
 * Alle leerdoelen van dit domein die bij de groep van het kind horen, elk met
 * zijn stand. Kruimelpad bovenaan, verder dezelfde opbouw als elke pagina.
 */

import { notFound } from "next/navigation";
import {
  GeenKind,
  Kaart,
  Pagina,
  Standlegenda,
  Vaardigheid,
} from "@/components/ouder/Bouwstenen";
import { ZetKlaar } from "@/components/ouder/Klaarzetten";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { leerdoelenVanGroep } from "@/lib/data/dashboard";
import { haalVoortgang } from "@/lib/data/voortgang";

export default async function DomeinPagina({
  params,
}: {
  params: Promise<{ domein: string }>;
}) {
  const ouder = await vereisOuder();
  const kind = await bekekenKind(ouder.id);
  if (!kind) return <GeenKind />;

  const { domein: domeinSlug } = await params;
  const plekken = leerdoelenVanGroep(kind.groep).filter(
    (p) => p.domein.slug === domeinSlug,
  );
  if (plekken.length === 0) notFound();

  const domein = plekken[0].domein;
  const voortgang = new Map(haalVoortgang(kind.id).map((v) => [v.leerdoelId, v]));

  // Wat aandacht vraagt binnen dit onderdeel; dat is ook de vervolgactie.
  const aandacht = plekken
    .filter((p) => {
      const v = voortgang.get(p.leerdoel.id);
      return v?.aandacht || v?.zelfLastig;
    })
    .map((p) => p.leerdoel.id);

  return (
    <Pagina
      kruimels={[
        { label: "Voortgang", href: "/ouder/voortgang" },
        { label: domein.naam },
      ]}
      titel={domein.naam}
      uitleg={`Alle onderdelen van ${domein.naam.toLowerCase()} die bij groep ${kind.groep} horen, met de stand van ${kind.roepnaam}.`}
    >
      <Kaart>
        <Standlegenda />
      </Kaart>

      <Kaart titel="Onderdelen">
        {plekken.map((plek) => {
          const v = voortgang.get(plek.leerdoel.id);
          return (
            <Vaardigheid
              key={plek.leerdoel.id}
              titel={plek.leerdoel.titel}
              stand={v?.status ?? "nog_niet_gestart"}
              bijschrift={
                v?.aandacht || v?.zelfLastig ? "vraagt aandacht" : plek.subdomein.naam
              }
              href={`/ouder/voortgang/${domeinSlug}/${plek.leerdoel.code}`}
            />
          );
        })}
      </Kaart>

      <div className="border-t border-beheer-rand pt-5">
        {aandacht.length > 0 ? (
          <ZetKlaar
            kindId={kind.id}
            leerdoelIds={aandacht}
            reden={`Even herhalen: ${domein.naam.toLowerCase()}`}
            label={`Zet deze oefeningen klaar voor ${kind.roepnaam}`}
          />
        ) : (
          <p className="text-sm text-beheer-zacht">
            Binnen {domein.naam.toLowerCase()} vraagt niets extra aandacht.
          </p>
        )}
      </div>
    </Pagina>
  );
}
