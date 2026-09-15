/**
 * Stap 3: onderwerpen en oefeningen naast elkaar.
 *
 * Eerder waren dit twee schermen: eerst een raster met onderwerpen, en pas na
 * een klik de leerdoelen daarbinnen. Dat betekende telkens heen en weer om te
 * zien wat er in een ander onderwerp zit. Nu staat het naast elkaar:
 *
 *   LINKS   alle onderwerpen van dit domein, onder elkaar, met een balkje
 *           voortgang. Het gekozen onderwerp is duidelijk gemarkeerd.
 *   RECHTS  meteen de leerdoelen van dat onderwerp, elk met status, eventueel
 *           een label "Nieuw", en een klik die rechtstreeks naar de oefening
 *           gaat.
 *
 * Op een telefoon staan de twee kolommen onder elkaar: eerst de lijst met
 * onderwerpen, daaronder de oefeningen van het gekozen onderwerp.
 *
 * ---------------------------------------------------------------------------
 * Welk onderwerp er rechts staat, staat in de URL
 * ---------------------------------------------------------------------------
 * `?onderwerp=<slug>`, en zonder die parameter het eerste onderwerp. Dat is
 * bewust geen toestand in de browser:
 *
 *   - de terugknop van de browser doet wat je verwacht;
 *   - een link naar een onderwerp is te delen en te bewaren;
 *   - de pagina blijft volledig op de server opgebouwd, net als de rest.
 *
 * Er komt geen nieuwe data aan te pas: links is `haalSubdomeinen`, rechts is
 * `haalOefenStart` — allebei bestond al.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Icoon } from "@/components/kind/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import { Paginakop, TerugLink } from "@/components/oefenen/Paginakop";
import { Voortgangsbalk } from "@/components/oefenen/Voortgangsbalk";
import {
  haalDomein,
  haalHuidigKind,
  haalOefenStart,
  haalSubdomeinen,
  haalVak,
} from "@/lib/data/queries";
import { nieuwPerLeerdoel, telGepubliceerdPerLeerdoel } from "@/lib/data/vragen";
import type { MasteryStatus } from "@/lib/types";

/*
  De vier standen van een leerdoel, in onze eigen kleuren:
  grijs = nog niet begonnen, blauw = mee bezig, amber = bijna, groen = klaar.
*/
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

export default async function DomeinPagina({
  params,
  searchParams,
}: {
  params: Promise<{ vak: string; domein: string }>;
  searchParams: Promise<{ onderwerp?: string }>;
}) {
  const { vak: vakSlug, domein: domeinSlug } = await params;
  const { onderwerp } = await searchParams;

  const vak = await haalVak(vakSlug);
  const domein = await haalDomein(vakSlug, domeinSlug);
  if (!vak || !domein) notFound();

  const kind = await haalHuidigKind();
  const onderwerpen = await haalSubdomeinen(vakSlug, domeinSlug, kind.id);

  const basis = `/oefenen/${vak.slug}/${domein.slug}`;
  const kop = (
    <Paginakop
      kruimels={[
        { label: "Start", href: "/start" },
        { label: "Oefenen", href: "/oefenen" },
        { label: vak.naam, href: `/oefenen/${vak.slug}` },
        { label: "Vrij oefenen", href: `/oefenen/${vak.slug}/vrij` },
        { label: domein.naam },
      ]}
      titel={domein.naam}
      uitleg={`${domein.omschrijving}. Kies links een onderwerp; rechts zie je meteen waarmee je kunt oefenen.`}
    />
  );

  if (onderwerpen.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {kop}
        <p className="w-fit rounded-kaart border border-white/70 bg-kaart px-5 py-4 text-sm font-semibold text-inkt-zacht shadow-zacht">
          Voor groep {kind.groep} staat hier nog niets klaar.
        </p>
        <TerugLink href={`/oefenen/${vak.slug}/vrij`} label="Terug naar vrij oefenen" />
      </div>
    );
  }

  /*
    Een onbekend onderwerp in de URL is geen fout: dan valt hij gewoon terug op
    het eerste. Een kind mag nooit op een lege pagina uitkomen door een typefout
    of een oude link.
  */
  const gekozen =
    onderwerpen.find((o) => o.subdomein.slug === onderwerp) ?? onderwerpen[0];

  const detail = await haalOefenStart(
    vakSlug,
    domeinSlug,
    gekozen.subdomein.slug,
    kind.id,
  );
  if (!detail) notFound();

  const leerdoelIds = detail.leerdoelen.map((l) => l.leerdoel.id);
  const vragenPer = telGepubliceerdPerLeerdoel(leerdoelIds);
  const nieuwPer = nieuwPerLeerdoel(leerdoelIds);
  const oefenHref = `${basis}/${gekozen.subdomein.slug}/oefening`;

  return (
    <div className="flex flex-col gap-6">
      {kop}

      {/*
        Naast elkaar zodra er ruimte voor is. Op een tablet in portret (vanaf
        768px) is de linkerkolom wat smaller, anders blijft er rechts te weinig
        over voor de oefeningen. Op een telefoon staan ze onder elkaar: eerst
        de onderwerpen, daaronder de oefeningen van het gekozen onderwerp.
      */}
      <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)] md:items-start lg:grid-cols-[20rem_minmax(0,1fr)]">
        {/* ------------------------------------------------------ LINKS */}
        <nav
          aria-label="Onderwerpen"
          className="rounded-groot border border-rand bg-kaart p-3 shadow-zacht sm:p-4"
        >
          <h2 className="mb-3 px-1 text-base font-extrabold">Onderwerpen</h2>

          <ul className="flex flex-col gap-1.5">
            {onderwerpen.map(({ subdomein, aantalLeerdoelen, aantalBeheerst }) => {
              const actief = subdomein.id === gekozen.subdomein.id;
              return (
                <li key={subdomein.id}>
                  <Link
                    href={`${basis}?onderwerp=${subdomein.slug}`}
                    aria-current={actief ? "true" : undefined}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-2.5 transition ${
                      actief
                        ? "border-huisstijl bg-huisstijl-zacht"
                        : "border-transparent hover:border-rand hover:bg-room/60"
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                        actief ? "bg-kaart shadow-zacht" : "bg-room"
                      }`}
                    >
                      <Pictogram naam={subdomein.icoon} className="size-7" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-extrabold leading-tight ${
                          actief ? "text-huisstijl-diep" : ""
                        }`}
                      >
                        {subdomein.naam}
                      </span>
                      {/* Het kleine voortgangsindicatortje. */}
                      <span className="mt-1 block">
                        <Voortgangsbalk
                          beheerst={aantalBeheerst}
                          totaal={aantalLeerdoelen}
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ----------------------------------------------------- RECHTS */}
        <section
          aria-label={`Oefeningen binnen ${gekozen.subdomein.naam}`}
          className="rounded-groot border border-rand bg-kaart p-5 shadow-zacht sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold leading-tight">
                {gekozen.subdomein.naam}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-inkt-zacht">
                {gekozen.subdomein.omschrijving}
              </p>
            </div>

          </div>

          <ol className="mt-5 flex flex-col gap-2.5">
            {detail.leerdoelen.map(({ leerdoel, status }) => {
              const heeftVragen = (vragenPer[leerdoel.id] ?? 0) > 0;

              const binnenkant = (
                <>
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-3 shrink-0 rounded-full ${STATUS_STIP[status]}`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold leading-tight">
                        {leerdoel.titel}
                      </span>
                      {nieuwPer[leerdoel.id] && (
                        <span className="rounded-full bg-huisstijl-diep px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide text-white">
                          Nieuw
                        </span>
                      )}
                    </span>

                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.66rem] font-extrabold ${STATUS_STIJL[status]}`}
                      >
                        {STATUS_TEKST[status]}
                      </span>
                      {!heeftVragen && (
                        <span className="text-[0.66rem] font-bold text-inkt-zacht">
                          Nog geen vragen
                        </span>
                      )}
                    </span>
                  </span>

                  {heeftVragen && (
                    <Icoon
                      naam="pijl"
                      className="mt-1 size-4 shrink-0 text-inkt-zacht transition-transform group-hover:translate-x-1"
                    />
                  )}
                </>
              );

              return (
                <li key={leerdoel.id}>
                  {heeftVragen ? (
                    <Link
                      href={`${oefenHref}?leerdoel=${leerdoel.id}`}
                      className="group flex w-full items-start gap-3 rounded-2xl border border-rand bg-room/50 p-3.5 transition hover:border-huisstijl hover:bg-huisstijl-zacht"
                    >
                      {binnenkant}
                    </Link>
                  ) : (
                    // Geen dode knop: zonder vragen is de regel niet klikbaar.
                    <div className="flex w-full items-start gap-3 rounded-2xl border border-rand bg-room/50 p-3.5 opacity-70">
                      {binnenkant}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <TerugLink href={`/oefenen/${vak.slug}/vrij`} label="Terug naar vrij oefenen" />
    </div>
  );
}
