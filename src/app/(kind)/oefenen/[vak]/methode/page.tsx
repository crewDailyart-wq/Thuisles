/**
 * Stap 3b — oefenen volgens school.
 *
 * Hier staat wat er van school bekend is: de gekoppelde school, de groep, de
 * rekenmethode, en de blokken van die methode met de Thuisles-onderwerpen die
 * eraan gekoppeld zijn.
 *
 * De vragen zijn EXACT dezelfde als bij vrij oefenen. Er is maar één
 * Thuisles-vragendatabase. Het enige wat de methodekoppeling doet, is de
 * volgorde bepalen: `blok_leerdoelen` zegt welke leerdoelen bij welk blok
 * horen, en die volgorde bepaalt onder welk blok een onderwerp verschijnt. Een
 * onderwerp linkt dan ook naar precies dezelfde oefenpagina als bij vrij
 * oefenen.
 *
 * HARDE PROJECTREGEL: is de methode niet betrouwbaar bekend, dan verschijnt
 * "Rekenmethode nog niet bekend." en verder niets. Er wordt nooit een methode
 * geraden, en er worden nooit blokken verzonnen.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BLOK_LABEL,
  BLOK_RAND,
  BlokMerk,
  MethodeOnbekend,
} from "@/components/kind/Methodeblok";
import { Pictogram } from "@/components/kind/Pictogram";
import { SchoolMethodeKaart } from "@/components/kind/SchoolMethodeKaart";
import { Paginakop, TerugLink } from "@/components/oefenen/Paginakop";
import { haalHuidigKind, haalMethodeoverzicht, haalVak } from "@/lib/data/queries";
import type { MethodeBlokMetOnderwerpen } from "@/lib/types";

/** Eén blok met de onderwerpen die eronder vallen. */
function Blok({
  blok,
  vakSlug,
}: {
  blok: MethodeBlokMetOnderwerpen;
  vakSlug: string;
}) {
  const opSlot = blok.status === "gesloten";

  return (
    <li
      className={`rounded-groot border-2 p-4 sm:p-5 ${BLOK_RAND[blok.status]}`}
    >
      <div className="flex items-center gap-3">
        <BlokMerk blok={blok} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold leading-tight">
            Blok {blok.nummer} — {blok.titel}
          </p>
          <p className="text-xs font-bold text-inkt-zacht">
            {BLOK_LABEL[blok.status]}
          </p>
        </div>
      </div>

      {/*
        Geen koppeling ingevuld? Dan blijft het leeg. Nooit een gok tonen.
      */}
      {blok.onderwerpen.length === 0 ? (
        <p className="mt-3 text-xs font-semibold text-inkt-zacht">
          Bij dit blok zijn nog geen onderwerpen gekoppeld.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {blok.onderwerpen.map(
            ({ subdomein, domein, aantalLeerdoelen, aantalBeheerst }) => {
              const procent = aantalLeerdoelen
                ? Math.round((aantalBeheerst / aantalLeerdoelen) * 100)
                : 0;

              const binnenkant = (
                <>
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-kaart shadow-zacht">
                      <Pictogram naam={subdomein.icoon} className="size-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold leading-tight">
                        {subdomein.naam}
                      </span>
                      <span className="block text-xs font-semibold text-inkt-zacht">
                        {domein.naam}
                      </span>
                    </span>
                  </span>

                  <span className="mt-auto block pt-3">
                    <span
                      className="block h-1.5 w-full overflow-hidden rounded-full bg-rand"
                      role="img"
                      aria-label={`${aantalBeheerst} van ${aantalLeerdoelen} leerdoelen beheerst`}
                    >
                      <span
                        className="block h-full rounded-full bg-groen"
                        style={{ width: `${procent}%` }}
                      />
                    </span>
                    <span className="mt-1 block text-[0.7rem] font-bold text-inkt-zacht">
                      {aantalBeheerst} van {aantalLeerdoelen} beheerst
                    </span>
                  </span>
                </>
              );

              return (
                <li key={subdomein.id}>
                  {opSlot ? (
                    // Nog dicht: wel zichtbaar, niet aanklikbaar. Geen dode knop.
                    <span className="flex h-full w-full cursor-not-allowed flex-col rounded-2xl border border-rand bg-kaart/70 p-3">
                      {binnenkant}
                    </span>
                  ) : (
                    <Link
                      // Exact dezelfde oefenpagina als bij vrij oefenen.
                      href={`/oefenen/${vakSlug}/${domein.slug}/${subdomein.slug}`}
                      className="flex h-full w-full flex-col rounded-2xl border border-rand bg-kaart p-3 transition hover:-translate-y-0.5 hover:border-lucht hover:bg-lucht-zacht"
                    >
                      {binnenkant}
                    </Link>
                  )}
                </li>
              );
            },
          )}
        </ul>
      )}
    </li>
  );
}

export default async function MethodePagina({
  params,
}: {
  params: Promise<{ vak: string }>;
}) {
  const { vak: vakSlug } = await params;
  const vak = await haalVak(vakSlug);
  if (!vak) notFound();

  const kind = await haalHuidigKind();
  const { methode, blokken } = await haalMethodeoverzicht(kind.id);

  return (
    <div className="flex flex-col gap-6">
      <Paginakop
        kruimels={[
          { label: "Start", href: "/start" },
          { label: "Oefenen", href: "/oefenen" },
          { label: vak.naam, href: `/oefenen/${vak.slug}` },
          { label: "Volgens school" },
        ]}
        titel="Oefenen volgens school"
        uitleg="Dezelfde oefeningen als bij vrij oefenen, in de volgorde van jouw school."
      />

      <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <SchoolMethodeKaart methode={methode} groep={kind.groep} />

        <section aria-labelledby="kop-blokken">
          <h2 id="kop-blokken" className="mb-3 text-lg font-extrabold">
            <span className="rounded-kaart bg-kaart px-3 py-1.5 shadow-zacht">
              Blokken van je methode
            </span>
          </h2>

          {blokken.length === 0 ? (
            <MethodeOnbekend />
          ) : (
            <ol className="flex flex-col gap-3">
              {blokken.map((blok) => (
                <Blok key={blok.id} blok={blok} vakSlug={vak.slug} />
              ))}
            </ol>
          )}
        </section>
      </div>

      <TerugLink href={`/oefenen/${vak.slug}`} label="Terug naar de keuze" />
    </div>
  );
}
