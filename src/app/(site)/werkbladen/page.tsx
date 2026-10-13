/**
 * Gratis werkbladen en posters, voor iedereen.
 *
 * Alleen wat in beheer aan staat. Staat er niets aan, dan bestaat deze pagina
 * niet (404) en staat hij ook niet in het menu (keuze eigenaar: "alleen het
 * systeem, nog niets tonen").
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IcoonDownload } from "@/components/site/Iconen";
import { zichtbareWerkbladen } from "@/lib/data/werkbladen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gratis werkbladen en posters",
  description:
    "Gratis werkbladen en posters die lastige onderwerpen van de basisschool eenvoudig uitleggen, zoals breuken en werkwoordspelling. Te downloaden en te printen.",
};

export default function WerkbladenPagina() {
  let werkbladen: ReturnType<typeof zichtbareWerkbladen> = [];
  try {
    werkbladen = zichtbareWerkbladen();
  } catch {
    werkbladen = [];
  }
  if (werkbladen.length === 0) notFound();

  return (
    <>
      <section className="st-paginakop">
        <div className="st-binnen">
          <p className="st-boventitel">Gratis voor iedereen</p>
          <h1 className="st-h1 st-titel">
            Werkbladen en <em>posters</em>
          </h1>
          <p className="st-inleiding">
            Lastige onderwerpen van de basisschool, eenvoudig uitgelegd. Gratis te downloaden en te printen, ook zonder
            account.
          </p>
        </div>
      </section>
      <section className="st-sectie" style={{ paddingTop: 0 }} aria-label="Werkbladen">
        <div className="st-binnen">
          <ul className="st-raster st-werkbladlijst" data-kolommen="3">
            {werkbladen.map((w) => (
              <li key={w.id} className="st-kaart st-glas">
                <p className="st-werkblad-soort">
                  {w.soort === "poster" ? "Poster" : "Werkblad"}
                  {w.vak && ` · ${w.vak}`}
                  {w.groepen && ` · groep ${w.groepen}`}
                </p>
                <h2 className="st-titel">{w.titel}</h2>
                {w.omschrijving && <p>{w.omschrijving}</p>}
                <a
                  href={`/werkbladen/bestand/${w.bestand}`}
                  className="st-knop st-knop-goud st-knop-klein"
                  download
                  target="_blank"
                  rel="noopener"
                >
                  <IcoonDownload />
                  Downloaden
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
