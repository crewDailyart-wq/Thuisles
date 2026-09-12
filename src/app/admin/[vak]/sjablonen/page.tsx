/** Overzicht van alle sjablonen binnen een vak. */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Stapfilter } from "@/components/beheer/Stapfilter";
import { filterLeerdoelen, leesFilter } from "@/lib/beheerfilter";
import { haalFilteropties } from "@/lib/data/filteropties";
import { haalSjablonen } from "@/lib/data/sjablonen";
import { haalVak } from "@/lib/data/structuur";
import { alleGeneratoren, zoekGenerator } from "@/lib/generatoren";
import { controleerAanpak, controleerPatronen } from "@/lib/generatoren/foutpatroon";

export default async function SjablonenPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  const filter = leesFilter(await searchParams);
  const opties = haalFilteropties(vakSlug, filter);

  /*
    Dezelfde filterregels als op de andere schermen. Een sjabloon hangt aan een
    leerdoel, dus de groepsrange van dat leerdoel bepaalt bij welke groep het
    hoort — precies zoals bij vragen.
  */
  const sjablonen = filterLeerdoelen(
    haalSjablonen(vakSlug),
    filter,
    (sj) => sj.leerdoelId,
  );

  // Een type zonder complete foutpatronen is niet af; dat moet zichtbaar zijn.
  const onvolledig = alleGeneratoren.filter(
    (g) => controleerPatronen(g.foutpatronen).length > 0 || controleerAanpak(g.aanpak).length > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Sjablonen" },
        ]}
        titel="Sjablonen"
        bijschrift="Een sjabloon maakt sommen met wisselende getallen. Handgemaakte vragen blijven gewoon via het formulier of de upload gaan."
        acties={
          <Link href={`/admin/${vak.slug}/sjablonen/nieuw`} className={stijl.knopGroot}>
            <span aria-hidden="true" className="text-base leading-none">+</span>
            Nieuw sjabloon
          </Link>
        }
      />

      {onvolledig.length > 0 && (
        <div className="rounded-lg border border-oranje/40 bg-oranje-zacht px-4 py-2.5">
          <p className="text-sm font-medium text-oranje-diep">
            Let op: {onvolledig.map((g) => g.naam).join(", ")}{" "}
            {onvolledig.length === 1 ? "is" : "zijn"} nog niet compleet (foutpatronen of uitleg).{" "}
            <Link href="/admin/foutpatronen" className="underline">
              Bekijken
            </Link>
          </p>
        </div>
      )}

      <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4">
        <Stapfilter gegevens={{ scherm: "sjablonen", vakSlug: vak.slug, ...opties }} />
      </section>

      <Paneel
        titel="Alle sjablonen"
        bijschrift={`${sjablonen.length} ${sjablonen.length === 1 ? "sjabloon" : "sjablonen"} binnen deze filter`}
        geenVulling
      >
        {sjablonen.length === 0 ? (
          <Leeg
            tekst="Geen sjablonen gevonden."
            hint="Pas de filter aan, of maak er een aan om in één keer veel sommen te laten maken."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <Tabelkop kolommen={["Sjabloon", "Soort", "Leerdoel", "Groep", "Sommen", ""]} />
              <tbody>
                {sjablonen.map((sj) => (
                  <tr
                    key={sj.id}
                    className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/${vak.slug}/sjablonen/${sj.id}`}
                        className="font-medium transition hover:text-viool"
                      >
                        {sj.naam}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">
                      {zoekGenerator(sj.soort)?.naam ?? sj.soort}
                    </td>
                    <td className="max-w-[18rem] px-3 py-2">
                      <span className="block truncate">{sj.leerdoelTitel}</span>
                      <span className="block truncate text-xs text-beheer-zacht">
                        {sj.domeinNaam} › {sj.subdomeinNaam}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{sj.groep}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {sj.aantalVragen}
                      {sj.aantalConcept > 0 && (
                        <span className="ml-1.5 rounded bg-beheer-vlak px-1.5 py-0.5 text-xs font-medium text-beheer-zacht">
                          {sj.aantalConcept} concept
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/${vak.slug}/sjablonen/${sj.id}`}
                        className="text-xs text-beheer-zacht transition hover:text-viool"
                      >
                        Openen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>
    </div>
  );
}
