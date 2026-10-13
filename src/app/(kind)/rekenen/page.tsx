/**
 * Het rekenscherm in de sterrenstijl (nieuwe layout, oktober 2026).
 *
 * Hier kom je als je op het startscherm op de paarse tegel Rekenen tikt.
 * Bovenaan "Rekenen" met een terugknop naar het startscherm, daaronder de
 * rekendomeinen als grote 3D-tegels, elk met een eigen kleur, een eigen wit
 * icoon en klein de voortgang.
 *
 * Alleen domeinen waarin dit kind echt iets kan oefenen, staan erop: een
 * oefening voor de groep van het kind met gepubliceerde vragen. Zie
 * `haalOefenbaar`.
 *
 * De oude route (Oefenen → Rekenen → Vrij oefenen / Volgens je methode)
 * bestaat nog en is te vinden via "Meer".
 */

import { notFound } from "next/navigation";
import { DomeinIcoon } from "@/components/avontuur/DomeinIconen";
import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Schermkop } from "@/components/avontuur/Schermkop";
import { Sterrenscherm } from "@/components/avontuur/Sterrenscherm";
import { Tegelraster } from "@/components/avontuur/Tegelraster";
import { VakTegel } from "@/components/avontuur/VakTegel";
import { domeinKleur, scheefVoor, tegelKleuren } from "@/components/avontuur/kleuren";
import { haalHuidigKind, haalOefenbaar, haalVak } from "@/lib/data/queries";

export default async function RekenPagina() {
  const vak = await haalVak("rekenen");
  if (!vak) notFound();
  const kind = await haalHuidigKind();
  const domeinen = await haalOefenbaar(vak.slug, kind.id);

  return (
    <Sterrenscherm>
      <Schermkop
        terug={{ href: "/zappie", label: "Terug naar het startscherm" }}
        titel="Rekenen"
        onder="Waar wil je mee oefenen?"
        rechts={
          <HoofdMascotte className="w-14 drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)] sm:w-20 lg:w-24" />
        }
      />

      {domeinen.length === 0 ? (
        <p className="av-kaart mx-auto mt-16 max-w-md px-6 py-5 text-center text-lg font-bold">
          Voor groep {kind.groep} staat hier nog niets klaar.
        </p>
      ) : (
        <Tegelraster aantal={domeinen.length}>
          {domeinen.map(({ domein, aantalOefeningen, aantalBeheerst }, i) => {
            const k = tegelKleuren(domeinKleur(domein.slug, i));
            return (
              <li key={domein.id}>
                <VakTegel
                  href={`/rekenen/${domein.slug}`}
                  naam={domein.naam}
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
      )}
    </Sterrenscherm>
  );
}
