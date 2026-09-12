/**
 * Overzicht van alle vragen.
 *
 * Tabelvorm, bewust compact: veel regels in beeld, korte kolommen, en per rij
 * knoppen om te publiceren of te verwijderen. De vraagtekst wordt ingekort
 * zodat de rijen even hoog blijven; de volledige tekst staat in de tooltip.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Kop, stijl } from "@/components/beheer/Bouwstenen";
import { Stapfilter } from "@/components/beheer/Stapfilter";
import { Zoekvelden } from "@/components/beheer/Zoekvelden";
import { leesFilter } from "@/lib/beheerfilter";
import { haalFilteropties } from "@/lib/data/filteropties";
import { verwijder, wisselPublicatie } from "@/app/admin/acties";
import { haalVak } from "@/lib/data/structuur";
import { haalVragen } from "@/lib/data/vragen";
import { STATUS_LABEL, VORM_LABEL, antwoordInTekst } from "@/lib/vraagtypes";

function kort(tekst: string, max = 70) {
  return tekst.length > max ? `${tekst.slice(0, max - 1)}…` : tekst;
}

export default async function VragenPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  const p = await searchParams;
  const eerste = (k: string) => (Array.isArray(p[k]) ? p[k][0] : p[k]) ?? "";

  const filter = leesFilter(p);
  const opties = haalFilteropties(vakSlug, filter);

  const vragen = haalVragen({
    zoek: eerste("zoek"),
    vak: vakSlug,
    domein: filter.domein,
    subdomein: filter.subdomein,
    leerdoel: filter.leerdoel,
    groep: filter.groep,
    vorm: eerste("vorm"),
  });

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Vragen" },
        ]}
        titel="Vragen"
        bijschrift={`${vragen.length} ${vragen.length === 1 ? "vraag" : "vragen"} gevonden. Elke vraag hangt aan een leerdoel.`}
        acties={
          <Link href={`/admin/${vak.slug}/vragen/nieuw`} className={stijl.knopGroot}>
            <span aria-hidden="true" className="text-base leading-none">+</span>
            Nieuwe vraag
          </Link>
        }
      />

      {eerste("toegevoegd") === "1" && (
        <p className="rounded-md border border-groen/30 bg-groen-zacht px-3 py-2 text-sm font-medium text-groen-diep">
          De vraag is opgeslagen.
        </p>
      )}

      <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4">
        {/*
          Dezelfde stapsgewijze filter als op de andere beheerschermen. Zoeken
          en vraagtype horen alleen bij dit scherm en staan daarom als extra
          velden ernaast, niet in de gedeelde filter.
        */}
        <Stapfilter
          gegevens={{ scherm: "vragen", vakSlug: vak.slug, ...opties }}
          extra={<Zoekvelden basisPad={`/admin/${vak.slug}/vragen`} />}
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart">
        {vragen.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium">Nog geen vragen gevonden.</p>
            <p className="mt-1 text-sm text-beheer-zacht">
              Voeg er één toe, of upload een bestand met meerdere vragen tegelijk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-beheer-rand bg-beheer-vlak text-left">
                  {["Vraag", "Type", "Leerdoel", "Groep", "Status", ""].map((k) => (
                    <th
                      key={k}
                      scope="col"
                      className="px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vragen.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                  >
                    <td className="max-w-[24rem] px-3 py-2.5">
                      <span className="block font-medium" title={v.vraagtekst}>
                        {kort(v.vraagtekst)}
                      </span>
                      <span className="mt-0.5 block text-xs text-beheer-zacht">
                        Antwoord: {antwoordInTekst(v)}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className="whitespace-nowrap rounded border border-beheer-rand bg-beheer-vlak px-1.5 py-0.5 text-xs font-medium">
                        {VORM_LABEL[v.vorm]}
                      </span>
                    </td>

                    <td className="max-w-[18rem] px-3 py-2.5">
                      <span className="block truncate font-medium" title={v.leerdoelTitel}>
                        {v.leerdoelTitel}
                      </span>
                      <span className="block truncate text-xs text-beheer-zacht">
                        {v.vakNaam} › {v.domeinNaam} › {v.subdomeinNaam}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                      Groep {v.groep}
                    </td>

                    <td className="px-3 py-2.5">
                      <form action={wisselPublicatie}>
                        <input type="hidden" name="id" value={v.id} />
                        <button
                          type="submit"
                          title="Klik om te wisselen tussen concept en gepubliceerd"
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                            v.status === "gepubliceerd"
                              ? "bg-groen-zacht text-groen-diep hover:bg-groen/20"
                              : "bg-beheer-vlak text-beheer-zacht hover:bg-beheer-rand"
                          }`}
                        >
                          {STATUS_LABEL[v.status]}
                        </button>
                      </form>
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/${vak.slug}/vragen/nieuw?kopie=${v.id}`}
                          title="Bewerken"
                          aria-label={`Vraag bewerken: ${v.vraagtekst}`}
                          className="grid size-7 place-items-center rounded text-beheer-zacht transition hover:bg-viool/10 hover:text-viool"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                            <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
                            <path d="M14.5 5.5 18.5 9.5" />
                          </svg>
                        </Link>

                        <form action={verwijder}>
                          <input type="hidden" name="id" value={v.id} />
                          <button
                            type="submit"
                            title="Verwijderen"
                            aria-label={`Vraag verwijderen: ${v.vraagtekst}`}
                            className="grid size-7 place-items-center rounded text-beheer-zacht transition hover:bg-roze/10 hover:text-roze"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                              <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5 7.5 20h9l1-13.5" />
                              <path d="M10.5 10v6M13.5 10v6" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
