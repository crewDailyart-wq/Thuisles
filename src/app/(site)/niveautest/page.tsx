/**
 * De gratis niveautest: kies de groep.
 *
 * Alleen groepen waarvoor in Beheer → Niveautest een toets is samengesteld.
 * Is dat er geen enkele, dan bestaat deze pagina niet (404) en staat er
 * nergens een knop naartoe (keuze eigenaar: "alleen het systeem, nog niets
 * tonen").
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IcoonPijl, IcoonVink } from "@/components/site/Iconen";
import { groepenMetToets, onderdelenVanGroep } from "@/lib/data/niveautest";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gratis niveautest",
  description:
    "Ontdek gratis en zonder account hoe je kind ervoor staat: per onderdeel beheerst, bijna of nog oefenen, gemeten met de referentieniveaus 1F, 2F en 1S van de doorstroomtoets.",
};

export default function NiveautestPagina() {
  const groepen = groepenMetToets().map((groep) => {
    const onderdelen = onderdelenVanGroep(groep).filter((o) => o.bruikbaar > 0);
    return {
      groep,
      onderdelen: onderdelen.length,
      vragen: onderdelen.reduce((n, o) => n + Math.min(o.aantal, o.bruikbaar), 0),
    };
  });
  if (groepen.length === 0) notFound();

  return (
    <>
      <section className="st-paginakop">
        <div className="st-binnen">
          <p className="st-boventitel">Gratis, zonder account</p>
          <h1 className="st-h1 st-titel">
            De gratis <em>niveautest</em>
          </h1>
          <p className="st-inleiding">
            Ontdek in één korte toets hoe je kind ervoor staat. Per onderdeel zie je wat het beheerst, wat bijna lukt en
            waar het nog op kan oefenen, en bij welk referentieniveau dat hoort: 1F, 2F of 1S, de niveaus van de
            doorstroomtoets.
          </p>
          <ul className="st-nt-punten">
            {["Gratis en zonder account", "Er wordt niets bewaard", "De uitslag zie je meteen"].map((t) => (
              <li key={t}>
                <span className="st-vink">
                  <IcoonVink />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="st-sectie" style={{ paddingTop: 0 }} aria-labelledby="kies-groep">
        <div className="st-binnen">
          <h2 id="kies-groep" className="st-h2 st-titel st-nt-kies">
            In welke groep zit je kind?
          </h2>
          <ul className="st-nt-groepen">
            {groepen.map((g) => (
              <li key={g.groep}>
                <Link href={`/niveautest/${g.groep}`} className="st-nt-groep st-glas">
                  <span className="st-titel">Groep {g.groep}</span>
                  <small>
                    {g.vragen} {g.vragen === 1 ? "vraag" : "vragen"} · {g.onderdelen}{" "}
                    {g.onderdelen === 1 ? "onderdeel" : "onderdelen"}
                  </small>
                  <IcoonPijl />
                </Link>
              </li>
            ))}
          </ul>
          <p className="st-nt-klein">Een indicatie van het niveau, geen officiële toets.</p>
        </div>
      </section>
    </>
  );
}
