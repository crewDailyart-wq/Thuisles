/**
 * Eén methode: naam, uitgever, en per groep de blokken in volgorde.
 *
 * Per blok wordt vastgelegd welke EIGEN Thuisles-leerdoelen erbij horen. Dat
 * is de hele afstemming — de inhoud blijft van Thuisles.
 */

import { notFound } from "next/navigation";
import { Kop, Leeg, Paneel, stijl } from "@/components/beheer/Bouwstenen";
import {
  BlokBewerken,
  MethodeGegevens,
  NieuwBlok,
} from "@/components/beheer/Methodeformulieren";
import { schuifBlok, wegMetBlok } from "@/app/admin/schoolacties";
import { haalBlokken, haalMethode, nietVerbondenZin } from "@/lib/data/methodes";
import {
  haalDomeinen,
  haalLeerdoelen,
  haalSubdomeinen,
} from "@/lib/data/structuur";

const GROEPEN = [3, 4, 5, 6, 7, 8] as const;

export default async function MethodePagina({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ groep?: string }>;
}) {
  const { id } = await params;
  const methode = haalMethode(id);
  if (!methode) notFound();

  const { groep: groepUitAdres } = await searchParams;
  const groep = GROEPEN.includes(Number(groepUitAdres) as (typeof GROEPEN)[number])
    ? Number(groepUitAdres)
    : 5;

  const blokken = haalBlokken(methode.id, groep);

  // Alle leerdoelen die bij deze groep passen, met hun plek in de structuur.
  const domeinen = haalDomeinen();
  const subdomeinen = haalSubdomeinen();
  const leerdoelen = haalLeerdoelen()
    .filter((ld) => ld.groepVan <= groep && groep <= ld.groepTot)
    .map((ld) => {
      const sub = subdomeinen.find((s) => s.id === ld.subdomeinId);
      const dom = domeinen.find((d) => d.id === sub?.domeinId);
      return { ...ld, pad: `${dom?.naam ?? "?"} › ${sub?.naam ?? "?"}` };
    })
    .sort((a, b) => a.pad.localeCompare(b.pad) || a.volgorde - b.volgorde);

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[
          { label: "Beheer", href: "/admin" },
          { label: "Methodes", href: "/admin/methodes" },
          { label: methode.naam },
        ]}
        titel={methode.naam}
        bijschrift={methode.uitgever || "Geen uitgever ingevuld"}
      />

      <Paneel titel="Gegevens">
        <MethodeGegevens methode={methode} />
        <p className="mt-4 border-t border-beheer-rand-zacht pt-3 text-xs leading-relaxed text-beheer-zacht">
          Deze zin staat overal onder een vermelding van deze methode, ook in de
          ouderomgeving: &ldquo;{nietVerbondenZin(methode)}&rdquo;
        </p>
      </Paneel>

      <Paneel
        titel="Blokken per groep"
        bijschrift="De volgorde die de klas aanhoudt. Kinderen zien deze volgorde bij 'Oefenen volgens je methode'."
        acties={
          <div className="flex flex-wrap gap-1">
            {GROEPEN.map((g) => (
              <a
                key={g}
                href={`/admin/methodes/${methode.id}?groep=${g}`}
                className={
                  g === groep
                    ? "inline-flex h-8 items-center rounded-md bg-viool px-2.5 text-xs font-semibold text-white"
                    : stijl.knopStil
                }
              >
                Groep {g}
              </a>
            ))}
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <NieuwBlok methodeId={methode.id} groep={groep} />

          {blokken.length === 0 ? (
            <Leeg
              tekst={`Nog geen blokken voor groep ${groep}.`}
              hint="Voeg het eerste blok toe; de nummering gaat vanzelf."
            />
          ) : (
            <ol className="flex flex-col gap-2">
              {blokken.map((blok, i) => (
                <li
                  key={blok.id}
                  className="rounded-lg border border-beheer-rand bg-beheer-kaart"
                >
                  <details>
                    <summary className="flex cursor-pointer items-center gap-2 px-3 py-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-viool-zacht text-xs font-bold text-viool-diep">
                        {blok.nummer}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{blok.titel}</span>
                        <span className="block text-xs text-beheer-zacht">
                          {blok.leerdoelIds.length} leerdoel
                          {blok.leerdoelIds.length === 1 ? "" : "en"} gekoppeld
                        </span>
                      </span>
                    </summary>

                    <div className="border-t border-beheer-rand-zacht p-3">
                      <BlokBewerken blok={blok} leerdoelen={leerdoelen} />

                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-beheer-rand-zacht pt-3">
                        {i > 0 && (
                          <form action={schuifBlok}>
                            <input type="hidden" name="blokId" value={blok.id} />
                            <input type="hidden" name="richting" value="op" />
                            <button type="submit" className={stijl.knopStil}>
                              ↑ Eerder
                            </button>
                          </form>
                        )}
                        {i < blokken.length - 1 && (
                          <form action={schuifBlok}>
                            <input type="hidden" name="blokId" value={blok.id} />
                            <input type="hidden" name="richting" value="neer" />
                            <button type="submit" className={stijl.knopStil}>
                              ↓ Later
                            </button>
                          </form>
                        )}
                        <form action={wegMetBlok}>
                          <input type="hidden" name="blokId" value={blok.id} />
                          <button type="submit" className={stijl.knopStil}>
                            Blok verwijderen
                          </button>
                        </form>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Paneel>
    </div>
  );
}
