/**
 * Overzicht en dekking.
 *
 * Bedoeld als startpunt van een werksessie: hoeveel staat er, en vooral —
 * waar staat nog niets? De lijst met leerdoelen zonder vragen staat daarom
 * groot in beeld, met per regel een knop om er meteen een vraag bij te maken.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Gegevens, Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Stapfilter } from "@/components/beheer/Stapfilter";
import { leesFilter } from "@/lib/beheerfilter";
import { haalFilteropties } from "@/lib/data/filteropties";
import { haalVak } from "@/lib/data/structuur";
import {
  haalDekkingPerDomein,
  haalLeerdoelenZonderVragen,
  haalVakCijfers,
} from "@/lib/data/vragen";

function Cijfer({
  label,
  waarde,
  bij,
  nadruk = false,
}: {
  label: string;
  waarde: number;
  bij?: string;
  nadruk?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        nadruk && waarde > 0
          ? "border-oranje/40 bg-oranje-zacht"
          : "border-beheer-rand bg-beheer-kaart"
      }`}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums">{waarde}</p>
      {bij && <p className="text-xs text-beheer-zacht">{bij}</p>}
    </div>
  );
}

export default async function OverzichtPagina({
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
  const opties = haalFilteropties(vak.slug, filter);

  const cijfers = haalVakCijfers(vak.id);
  const dekking = haalDekkingPerDomein(vak.id);
  const leeg = haalLeerdoelenZonderVragen(vak.slug, filter);

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: vak.naam }]}
        titel={`${vak.naam} — overzicht`}
        bijschrift={
          vak.actief
            ? "Zichtbaar voor kinderen."
            : "Dit vak is nog verborgen voor kinderen."
        }
        acties={
          <>
            <Link href={`/admin/${vak.slug}/vragen/nieuw`} className={stijl.knopGroot}>
              <span aria-hidden="true" className="text-base leading-none">+</span>
              Nieuwe vraag
            </Link>
            <Link
              href={`/admin/${vak.slug}/structuur`}
              className="inline-flex h-9 items-center rounded-md border border-beheer-rand px-3.5 text-sm font-medium transition hover:border-viool hover:text-viool"
            >
              Structuur beheren
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Cijfer label="Domeinen" waarde={cijfers.domeinen} />
        <Cijfer label="Onderwerpen" waarde={cijfers.subdomeinen} />
        <Cijfer label="Leerdoelen" waarde={cijfers.leerdoelen} />
        <Cijfer
          label="Vragen"
          waarde={cijfers.vragen}
          bij={`${cijfers.gepubliceerd} gepubliceerd · ${cijfers.concept} concept`}
        />
        <Cijfer
          label="Zonder vragen"
          waarde={cijfers.leerdoelenZonderVragen}
          bij="leerdoelen waar nog niets bij staat"
          nadruk
        />
      </div>

      {/*
        De filter staat boven de lijst met ontbrekende content: dat is de lijst
        waarin je gericht wilt kunnen zoeken. De cijfers erboven blijven het
        hele vak tellen — anders weet je niet meer waar je totaal op slaat.
      */}
      <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4">
        <Stapfilter
          gegevens={{ scherm: "overzicht", vakSlug: vak.slug, ...opties }}
        />
      </section>

      {/* Waar moet ik beginnen? */}
      <Paneel
        titel="Hier ontbreekt nog content"
        bijschrift={
          leeg.length === 0
            ? "Binnen deze filter heeft elk leerdoel minstens één vraag."
            : `${leeg.length} ${leeg.length === 1 ? "leerdoel heeft" : "leerdoelen hebben"} nog geen enkele vraag.`
        }
        geenVulling
      >
        {leeg.length === 0 ? (
          <Leeg
            tekst="Niets meer te doen hier."
            hint="Elk leerdoel binnen deze filter heeft al minstens één vraag."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <Tabelkop kolommen={["Code", "Leerdoel", "Plek", "Groep", ""]} />
              <tbody>
                {leeg.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-beheer-zacht">
                      {l.code}
                    </td>
                    <td className="px-3 py-2 font-medium">{l.titel}</td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">
                      {l.domeinNaam} › {l.subdomeinNaam}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {l.groepVan === l.groepTot
                        ? l.groepVan
                        : `${l.groepVan}–${l.groepTot}`}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/${vak.slug}/vragen/nieuw?leerdoel=${l.id}`}
                        className="text-xs font-semibold text-viool transition hover:underline"
                      >
                        Vraag toevoegen
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>

      {/* Dekking per domein */}
      <Paneel titel="Dekking per domein" geenVulling>
        {dekking.length === 0 ? (
          <Leeg
            tekst="Nog geen domeinen."
            hint="Maak er een aan bij Domeinen & leerdoelen."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <Tabelkop
                kolommen={["Domein", "Onderwerpen", "Leerdoelen", "Vragen", "Zonder vragen", ""]}
              />
              <tbody>
                {dekking.map((d) => (
                  <tr
                    key={d.domeinId}
                    className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                  >
                    <td className="px-3 py-2 font-medium">
                      {d.domeinNaam}
                      {!d.actief && (
                        <span className="ml-1.5 rounded bg-beheer-vlak px-1 py-0.5 text-[0.6rem] font-medium text-beheer-zacht">
                          verborgen
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{d.subdomeinen}</td>
                    <td className="px-3 py-2 tabular-nums">{d.leerdoelen}</td>
                    <td className="px-3 py-2 tabular-nums">{d.vragen}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {d.leerdoelenZonderVragen > 0 ? (
                        <span className="rounded bg-oranje-zacht px-1.5 py-0.5 text-xs font-semibold text-oranje-diep">
                          {d.leerdoelenZonderVragen}
                        </span>
                      ) : (
                        <span className="text-beheer-zacht">0</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/${vak.slug}/structuur/${d.domeinSlug}`}
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

      <Paneel titel="Over dit vak">
        <Gegevens
          rijen={[
            ["Naam", vak.naam],
            ["Webadres", <code key="s" className="font-mono text-xs">/{vak.slug}</code>],
            ["Omschrijving", vak.omschrijving || <span className="text-beheer-zacht">—</span>],
            ["Zichtbaar voor kinderen", vak.actief ? "Ja" : "Nee"],
          ]}
        />
        <Link
          href="/admin/vakken"
          className="mt-3 inline-block text-xs font-medium text-viool transition hover:underline"
        >
          Vakken beheren
        </Link>
      </Paneel>
    </div>
  );
}
