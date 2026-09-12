/**
 * Stap 1 van de oefenroute: kies een vak.
 *
 * Alleen Rekenen is nu te openen. De andere vakken staan er wel, zodat een
 * kind ziet dat er meer aankomt, maar zijn niet aanklikbaar. Er wordt geen
 * datum beloofd.
 */

import { Paginakop } from "@/components/oefenen/Paginakop";
import { Tegel } from "@/components/oefenen/Tegel";
import { haalDomeinen, haalHuidigKind, haalVakken } from "@/lib/data/queries";

export default async function OefenenPagina() {
  const vakken = await haalVakken();
  const kind = await haalHuidigKind();

  /*
    Hoeveel valt er in dit vak te oefenen voor DEZE groep? Een vak dat wel
    actief is maar nog leeg, mag niet "Klaar om te oefenen" beloven — dan klik
    je door naar een leeg scherm en denk je dat er iets stuk is.
  */
  const gevuld = new Map<string, boolean>();
  for (const vak of vakken.filter((v) => v.actief)) {
    const domeinen = await haalDomeinen(vak.slug, kind.id);
    gevuld.set(vak.slug, domeinen.some((d) => d.aantalLeerdoelen > 0));
  }

  return (
    <div className="flex flex-col gap-6">
      <Paginakop
        kruimels={[{ label: "Start", href: "/start" }, { label: "Oefenen" }]}
        titel="Waar wil je mee oefenen?"
        uitleg="Kies een vak."
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vakken.map((vak) => (
          <li key={vak.id}>
            <Tegel
              href={vak.actief ? `/oefenen/${vak.slug}` : undefined}
              icoon={vak.icoon}
              titel={vak.naam}
              omschrijving={vak.omschrijving}
              notitie={
                !vak.actief
                  ? "Later"
                  : gevuld.get(vak.slug)
                    ? "Klaar om te oefenen"
                    : "Nog geen onderwerpen"
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
