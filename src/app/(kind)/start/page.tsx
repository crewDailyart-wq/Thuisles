/**
 * Startscherm van het kind — scherm 1.
 *
 * Dit scherm haalt alles in één keer op via de datalaag en verdeelt het over
 * de onderdelen. Zelf bevat het geen logica: dat houdt het scherm rustig en
 * maakt de overstap naar de echte database straks een kwestie van één bestand
 * aanpassen (`src/lib/data/queries.ts`).
 */

import { Mascotte } from "@/components/kind/Mascotte";
import { RekenPaneel } from "@/components/kind/RekenPaneel";
import { SchoolMethodeKaart } from "@/components/kind/SchoolMethodeKaart";
import { TipKaartjes } from "@/components/kind/TipKaartjes";
import { Vakkenmenu } from "@/components/kind/Vakkenmenu";
import { Wereldpad } from "@/components/kind/Wereldpad";
import { haalHuidigKind, haalStartscherm } from "@/lib/data/queries";

export default async function StartPagina() {
  const kind = await haalHuidigKind();
  const data = await haalStartscherm(kind.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">Startscherm van {kind.roepnaam}</h1>

      {/*
        De vakken staan bovenaan en buiten het raster hieronder. Dat is waar
        een kind begint: eerst kiezen waar het mee aan de slag gaat, en pas
        daarna de verdieping per vak. Buiten het raster, omdat het blok anders
        de smalle kolom van het raster zou volgen en daarmee klein zou blijven.
      */}
      <Vakkenmenu vakken={data.vakken} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-8">
          <RekenPaneel
            subdomeinen={data.subdomeinen}
            methode={data.methode}
            blokken={data.methodeBlokken}
          />
        </div>

        <aside className="flex flex-col gap-4">
          <SchoolMethodeKaart methode={data.methode} groep={data.kind.groep} />
          <TipKaartjes />
        </aside>
      </div>

      <Wereldpad gebieden={data.wereld} />
      <Mascotte />
    </div>
  );
}
