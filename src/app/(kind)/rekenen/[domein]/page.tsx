/**
 * Een rekendomein in de sterrenstijl: de onderwerpen als 3D-tegels.
 *
 * Tik op een onderwerp en je ziet de oefeningen daarin. Net als op het
 * rekenscherm staan alleen onderwerpen waarin dit kind echt iets kan oefenen.
 */

import { notFound } from "next/navigation";
import { DomeinIcoon } from "@/components/avontuur/DomeinIconen";
import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Schermkop } from "@/components/avontuur/Schermkop";
import { Sterrenscherm } from "@/components/avontuur/Sterrenscherm";
import { Tegelraster } from "@/components/avontuur/Tegelraster";
import { VakTegel } from "@/components/avontuur/VakTegel";
import {
  domeinKleur,
  onderwerpKleur,
  scheefVoor,
  tegelKleuren,
} from "@/components/avontuur/kleuren";
import { haalHuidigKind, haalOefenbaar } from "@/lib/data/queries";

export default async function RekenDomeinPagina({ params }: PageProps<"/rekenen/[domein]">) {
  const { domein: slug } = await params;
  const kind = await haalHuidigKind();
  const domeinen = await haalOefenbaar("rekenen", kind.id);
  const plek = domeinen.findIndex((d) => d.domein.slug === slug);
  if (plek === -1) notFound();
  const { domein, onderwerpen } = domeinen[plek];
  const kleur = domeinKleur(domein.slug, plek);

  return (
    <Sterrenscherm>
      <Schermkop
        terug={{ href: "/rekenen", label: "Terug naar Rekenen" }}
        titel={domein.naam}
        onder="Kies een onderwerp!"
        rechts={
          <HoofdMascotte className="w-14 drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)] sm:w-20 lg:w-24" />
        }
      />

      <Tegelraster aantal={onderwerpen.length}>
        {onderwerpen.map(({ subdomein, aantalOefeningen, aantalBeheerst }, i) => {
          const k = tegelKleuren(onderwerpKleur(kleur, i));
          return (
            <li key={subdomein.id}>
              <VakTegel
                href={`/rekenen/${domein.slug}/${subdomein.slug}`}
                naam={subdomein.naam}
                kleur={k.kleur}
                rand={k.rand}
                licht={k.licht}
                scheef={scheefVoor(i)}
                voortgang={{ beheerst: aantalBeheerst, totaal: aantalOefeningen }}
              >
                <DomeinIcoon slug={domein.slug} />
              </VakTegel>
            </li>
          );
        })}
      </Tegelraster>
    </Sterrenscherm>
  );
}
