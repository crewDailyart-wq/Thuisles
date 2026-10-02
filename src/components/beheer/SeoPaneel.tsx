"use client";

/**
 * De twee SEO-velden bij een domein, onderwerp of oefening.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit een eigen paneel is met een eigen actie
 * ---------------------------------------------------------------------------
 * De paginatitel en de korte beschrijving horen bij de openbare kant, niet bij
 * de naam of de groep. Ze staan daarom in hun eigen paneel met hun eigen
 * serveractie, en niet als twee velden erbij in het formulier waarmee je de
 * naam aanpast.
 *
 * Dat is geen smaakkwestie. Zou de titel meegaan in dat formulier, dan komt hij
 * als lege waarde binnen zodra een ander scherm alleen de naam bijwerkt — en
 * dan wist een naamswijziging de titel. Dat is woord voor woord het verhaal
 * achter HARDE REGEL 1 in CLAUDE.md. Eén formulier dat alleen over deze twee
 * velden gaat, kan dat niet.
 *
 * ---------------------------------------------------------------------------
 * Leeg is de normale stand
 * ---------------------------------------------------------------------------
 * Leeg betekent hier: het systeem maakt zelf een nette titel. Wat dat wordt
 * staat er grijs bij, zodat je ziet wat je overschrijft voordat je iets typt.
 */

import { useState } from "react";
import { bewerkSeoteksten } from "@/app/admin/structuuracties";
import { Gegevens, Paneel, stijl } from "@/components/beheer/Bouwstenen";
import { Bewerkknop, Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import { paginabeschrijving, paginatitel, type Taal } from "@/lib/seo";

export function SeoPaneel({
  soort,
  id,
  naam,
  groep,
  openbaarAdres,
  titel,
  omschrijving,
}: {
  soort: "domein" | "subdomein" | "leerdoel";
  id: string;
  /** De naam waarop de standaardtitel wordt gebouwd. */
  naam: string;
  /** Voor welke groep de pagina bedoeld is, of null bij een domein. */
  groep: number | null;
  /** Het adres van de openbare pagina, om te laten zien en te openen. */
  openbaarAdres: string;
  titel: string;
  omschrijving: string;
}) {
  const { doe, bezig, fout } = useActie();
  const [bewerken, setBewerken] = useState(false);

  const standaardTitel = paginatitel("", naam, groep);
  const standaardOmschrijving = paginabeschrijving("", naam, groep);
  /* De taal doet hier niets; het adres komt al kant-en-klaar binnen. */
  const taal: Taal = "nl";

  return (
    <Paneel
      titel="Openbare pagina"
      bijschrift="Wat Google van deze pagina te zien krijgt."
      acties={<Bewerkknop open={bewerken} onWissel={() => setBewerken(!bewerken)} />}
    >
      <Gegevens
        rijen={[
          [
            "Webadres",
            <a
              key="a"
              href={openbaarAdres}
              lang={taal}
              className="font-mono text-xs underline hover:text-viool"
            >
              {openbaarAdres}
            </a>,
          ],
          [
            "Paginatitel",
            titel ? (
              titel
            ) : (
              <span key="t" className="text-beheer-zacht">
                {standaardTitel} <span className="text-xs">(standaard)</span>
              </span>
            ),
          ],
          [
            "Korte beschrijving",
            omschrijving ? (
              omschrijving
            ) : (
              <span key="o" className="text-beheer-zacht">
                {standaardOmschrijving} <span className="text-xs">(standaard)</span>
              </span>
            ),
          ],
        ]}
      />

      {bewerken && (
        <form
          action={(data) => doe(() => bewerkSeoteksten(data), () => setBewerken(false))}
          className="mt-4 border-t border-beheer-rand pt-4"
        >
          <input type="hidden" name="soort" value={soort} />
          <input type="hidden" name="id" value={id} />
          <label className="block text-xs font-medium text-beheer-zacht" htmlFor="seo-titel">
            Paginatitel
          </label>
          <input
            id="seo-titel"
            name="seoTitel"
            defaultValue={titel}
            placeholder={standaardTitel}
            onKeyDown={opSneltoets}
            className={`${stijl.veld} mt-1`}
          />
          <label
            className="mt-3 block text-xs font-medium text-beheer-zacht"
            htmlFor="seo-omschrijving"
          >
            Korte beschrijving
          </label>
          <input
            id="seo-omschrijving"
            name="seoOmschrijving"
            defaultValue={omschrijving}
            placeholder={standaardOmschrijving}
            onKeyDown={opSneltoets}
            className={`${stijl.veld} mt-1`}
          />
          <p className="mt-2 text-xs text-beheer-zacht">
            Leeg laten mag: dan maakt Thuisles zelf een nette titel en beschrijving,
            zoals het grijze voorbeeld hierboven.
          </p>
          <Fout tekst={fout} />
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={bezig} className={stijl.knop}>
              Opslaan
            </button>
            <button type="button" onClick={() => setBewerken(false)} className={stijl.knopStil}>
              Annuleren
            </button>
          </div>
        </form>
      )}
    </Paneel>
  );
}
