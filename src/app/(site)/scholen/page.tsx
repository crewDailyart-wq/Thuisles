/**
 * De scholenkaart: alle basisscholen van Nederland, met per school de
 * doorstroomtoets, de behaalde referentieniveaus en de bekende methode.
 * Kiezen gaat naar de ouderomgeving, waar de school aan het kind wordt
 * gekoppeld.
 */

import type { Metadata } from "next";
import { Scholenkaart } from "@/components/site/Scholenkaart";
import { MERKNAAM } from "@/lib/merk";
import { getal, scholenoverzicht } from "@/lib/site/inhoud";

export const metadata: Metadata = {
  title: "Scholenkaart: alle basisscholen van Nederland",
  description:
    "Zoek elke basisschool van Nederland op de kaart. Zie welke doorstroomtoets de school afneemt, welke referentieniveaus de leerlingen halen en welke methode er wordt gebruikt.",
};

export default function ScholenPagina() {
  const { aantal, peiljaar } = scholenoverzicht();
  return (
    <>
      <section className="st-paginakop">
        <div className="st-binnen">
          <p className="st-boventitel">De scholenkaart</p>
          <h1 className="st-h1 st-titel">
            Alle <em>{getal(aantal)}</em> basisscholen van Nederland.
          </h1>
          <p className="st-inleiding">
            Zoek de school van je kind. Je ziet welke doorstroomtoets de school afneemt, welk deel van de leerlingen de
            referentieniveaus haalt (peiljaar {peiljaar}) en welke methode er wordt gebruikt. Koppel de school aan je kind
            en {MERKNAAM} sluit er vanaf dan op aan.
          </p>
        </div>
      </section>
      <section className="st-kaartsectie" aria-label="Scholenkaart">
        <div className="st-binnen st-breed">
          <Scholenkaart />
        </div>
      </section>
    </>
  );
}
