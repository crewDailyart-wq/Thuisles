/**
 * "Meer" — alles wat vóór de nieuwe layout op het startscherm stond, in de
 * sterrenstijl (oktober 2026).
 *
 * Je komt hier via het ronde menuknopje naast het Hoi-vakje op het
 * startscherm. Er is niets weggehaald, alleen verplaatst (HARDE REGEL 1):
 *
 *   - het menu (Oefenen, Voortgang, Wereld, Maatje, Profiel);
 *   - het oude vakkenmenu;
 *   - vrij oefenen en oefenen volgens je methode (het rekenpaneel);
 *   - school & methode en de tips;
 *   - jouw wereld en de vos.
 *
 * De sleutels en de groep staan nu klein in het Hoi-vakje op het startscherm.
 */

import Link from "next/link";
import { Schermkop } from "@/components/avontuur/Schermkop";
import { Sterrenscherm } from "@/components/avontuur/Sterrenscherm";
import { Icoon } from "@/components/kind/Icoon";
import { Mascotte } from "@/components/kind/Mascotte";
import { RekenPaneel } from "@/components/kind/RekenPaneel";
import { SchoolMethodeKaart } from "@/components/kind/SchoolMethodeKaart";
import { TipKaartjes } from "@/components/kind/TipKaartjes";
import { Vakkenmenu } from "@/components/kind/Vakkenmenu";
import { Wereldpad } from "@/components/kind/Wereldpad";
import { NAV_ITEMS } from "@/components/kind/navigatie";
import { haalHuidigKind, haalStartscherm } from "@/lib/data/queries";

/* De knoppen van het menu om de beurt in een andere kleur. */
const KNOPKLEUREN = ["paars", "groen", "lucht", "roze", "oranje"];

export default async function MeerPagina() {
  const kind = await haalHuidigKind();
  const data = await haalStartscherm(kind.id);

  return (
    <Sterrenscherm className="gap-8 pb-16">
      <Schermkop terug={{ href: "/start", label: "Terug naar het startscherm" }} titel="Meer" />

      <nav aria-label="Hoofdmenu" className="flex flex-wrap justify-center gap-3">
        {NAV_ITEMS.filter((item) => item.href !== "/start").map((item, i) => {
          const kleur = KNOPKLEUREN[i % KNOPKLEUREN.length];
          return (
            <Link
              key={item.href}
              href={item.href}
              className="av-knop"
              style={
                {
                  "--tegel": `var(--av-${kleur})`,
                  "--tegel-rand": `var(--av-${kleur}-rand)`,
                } as React.CSSProperties
              }
            >
              <Icoon naam={item.icoon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="text-inkt">
        <Vakkenmenu vakken={data.vakken} />
      </div>

      <div className="grid gap-6 text-inkt xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-8">
          <RekenPaneel subdomeinen={data.subdomeinen} methode={data.methode} blokken={data.methodeBlokken} />
        </div>

        <aside className="flex flex-col gap-4">
          <SchoolMethodeKaart methode={data.methode} groep={data.kind.groep} />
          <TipKaartjes />
        </aside>
      </div>

      <div className="text-inkt">
        <Wereldpad gebieden={data.wereld} />
        <Mascotte />
      </div>
    </Sterrenscherm>
  );
}
