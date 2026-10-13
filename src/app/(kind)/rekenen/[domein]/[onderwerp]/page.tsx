/**
 * Een onderwerp in de sterrenstijl: de oefeningen, elk op een eigen kaartje.
 *
 * Dezelfde lijst als rechts op de oude domeinpagina (/oefenen/rekenen/...):
 * dezelfde volgorde, de groepjes als kopje, de stand per oefening, het label
 * "Nieuw" en de moeilijkheid. Een tik gaat naar precies dezelfde oefening,
 * met `van=ster` erbij, zodat "terug" na de oefening weer hier uitkomt.
 */

import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Moeilijkheid } from "@/components/Moeilijkheid";
import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Schermkop } from "@/components/avontuur/Schermkop";
import { Sterrenscherm } from "@/components/avontuur/Sterrenscherm";
import { TegelBezig } from "@/components/avontuur/TegelBezig";
import { Icoon } from "@/components/kind/Icoon";
import { haalHuidigKind, haalOefenStart } from "@/lib/data/queries";
import { nieuwPerLeerdoel, telGepubliceerdPerLeerdoel } from "@/lib/data/vragen";
import { groepjeVan } from "@/lib/groepje";
import type { MasteryStatus } from "@/lib/types";

/* Dezelfde vier standen en kleuren als op de oude domeinpagina. */
const STATUS_TEKST: Record<MasteryStatus, string> = {
  nog_niet_gestart: "Nog niet begonnen",
  oefent: "Je oefent hiermee",
  bijna_beheerst: "Bijna beheerst",
  beheerst: "Beheerst",
};

const STATUS_STIJL: Record<MasteryStatus, string> = {
  nog_niet_gestart: "bg-room text-inkt-zacht",
  oefent: "bg-lucht-zacht text-lucht",
  bijna_beheerst: "bg-amber-zacht text-oranje-diep",
  beheerst: "bg-groen-zacht text-groen-diep",
};

const STATUS_STIP: Record<MasteryStatus, string> = {
  nog_niet_gestart: "bg-rand",
  oefent: "bg-lucht",
  bijna_beheerst: "bg-amber",
  beheerst: "bg-groen",
};

export default async function RekenOnderwerpPagina({
  params,
}: PageProps<"/rekenen/[domein]/[onderwerp]">) {
  const { domein: domeinSlug, onderwerp } = await params;
  const kind = await haalHuidigKind();
  const detail = await haalOefenStart("rekenen", domeinSlug, onderwerp, kind.id);
  if (!detail || detail.leerdoelen.length === 0) notFound();

  const ids = detail.leerdoelen.map((l) => l.leerdoel.id);
  const vragenPer = telGepubliceerdPerLeerdoel(ids);
  const nieuwPer = nieuwPerLeerdoel(ids);
  const oefenHref = `/oefenen/rekenen/${detail.domein.slug}/${detail.subdomein.slug}/oefening`;

  return (
    <Sterrenscherm>
      <Schermkop
        terug={{ href: `/rekenen/${detail.domein.slug}`, label: `Terug naar ${detail.domein.naam}` }}
        titel={detail.subdomein.naam}
        onder="Kies een oefening!"
        rechts={
          <HoofdMascotte className="w-14 drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)] sm:w-20 lg:w-24" />
        }
      />

      <ol className="mx-auto mt-8 grid w-full max-w-[74rem] gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {detail.leerdoelen.map(({ leerdoel, status }, i, rij) => {
          const heeftVragen = (vragenPer[leerdoel.id] ?? 0) > 0;
          const kop = groepjeVan(leerdoel);
          const nieuwKop = kop !== null && (i === 0 || groepjeVan(rij[i - 1].leerdoel) !== kop);

          const binnenkant = (
            <>
              <span aria-hidden="true" className={`mt-1.5 size-3.5 shrink-0 rounded-full ${STATUS_STIP[status]}`} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold leading-tight">{leerdoel.titel}</span>
                  {nieuwPer[leerdoel.id] && (
                    <span className="rounded-full bg-huisstijl-diep px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide text-white">
                      Nieuw
                    </span>
                  )}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold ${STATUS_STIJL[status]}`}>
                    {STATUS_TEKST[status]}
                  </span>
                  <Moeilijkheid waarde={leerdoel.moeilijkheid} maat="ruim" />
                  {!heeftVragen && (
                    <span className="text-[0.7rem] font-bold text-inkt-zacht">Nog geen vragen</span>
                  )}
                </span>
              </span>
              {heeftVragen && (
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--av-paars)] text-white shadow-[0_3px_0_var(--av-paars-rand)] transition-transform group-hover:translate-x-1">
                  <Icoon naam="pijl" className="size-5" />
                </span>
              )}
            </>
          );

          return (
            <Fragment key={leerdoel.id}>
              {nieuwKop && (
                <li className={`col-span-full ${i === 0 ? "" : "mt-4"}`}>
                  <h2 className="av-titel px-1 text-xl [text-shadow:0_2px_6px_rgba(10,16,90,0.7)]">{kop}</h2>
                </li>
              )}
              <li>
                {heeftVragen ? (
                  <Link
                    href={`${oefenHref}?leerdoel=${leerdoel.id}&van=ster`}
                    className="group relative flex min-h-[4.5rem] w-full items-start gap-3 rounded-[1.25rem] bg-white p-4 text-inkt shadow-[0_5px_0_#c9d2ff,0_12px_22px_rgba(8,14,70,0.35)] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#c9d2ff,0_4px_10px_rgba(8,14,70,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {binnenkant}
                    <TegelBezig />
                  </Link>
                ) : (
                  // Geen dode knop: zonder vragen is het kaartje niet aan te tikken.
                  <div className="flex min-h-[4.5rem] w-full items-start gap-3 rounded-[1.25rem] bg-white/75 p-4 text-inkt opacity-80">
                    {binnenkant}
                  </div>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </Sterrenscherm>
  );
}
