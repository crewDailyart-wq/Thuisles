/**
 * De openbare pagina van één les uit groep 3, voor ouders en Google.
 *
 * Een gewone serverpagina: geen Phaser, geen "use client", alleen HTML. De
 * teksten komen uit `lib/seo/lessen-groep3.ts`, niet uit de database.
 *
 * Alles wat in de gestructureerde gegevens (JSON-LD) staat, staat ook zichtbaar
 * op de pagina: dezelfde titel, beschrijving, leerdoel en precies dezelfde
 * veelgestelde vragen. Er is geen verborgen tekst die alleen Google ziet.
 */

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { MERKNAAM } from "@/lib/merk";
import { zoekLesregel } from "@/lib/lessen/catalogus";
import {
  LESGROEP,
  LEERROUTE_GROEP3,
  SOORTNAAM,
  buren,
  domeinnaam,
  lesAdres,
  mogelijkePlaatjes,
  plekOpRoute,
  subdomeinnaam,
  veelgesteldeVragen,
  type SeoLes,
} from "@/lib/seo/lessen-groep3";

/** Waar een ouder zich gratis aanmeldt: dezelfde knop als "Begin gratis" op de homepagina. */
const START_GRATIS = "/ouder/overzicht";

/** De plaatjes die echt in `public/` staan. Ontbreekt er een, dan komt er niets voor in de plaats. */
function bestaandePlaatjes(les: SeoLes): string[] {
  return mogelijkePlaatjes(les).filter((p) => fs.existsSync(path.join(process.cwd(), "public", p)));
}

/** Kan deze les los geprobeerd worden? Alleen als hij in de lescatalogus staat. */
function teProberen(les: SeoLes): boolean {
  return zoekLesregel(les.id) !== null;
}

function domeinAdres(les: SeoLes): string {
  return `/groep-${LESGROEP}/${les.domein}`;
}

function subdomeinAdres(les: SeoLes): string {
  return `/groep-${LESGROEP}/${les.domein}/${les.subdomein}`;
}

/** De gestructureerde gegevens: de les, de vragen en het kruimelpad. */
function gestructureerdeGegevens(les: SeoLes, plaatjes: string[]) {
  const adres = lesAdres(les);
  const vragen = veelgesteldeVragen(les);
  return [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: les.titel,
      headline: les.seoTitel,
      description: les.beschrijving,
      url: adres,
      inLanguage: "nl",
      educationalLevel: `groep ${LESGROEP}`,
      teaches: les.leert,
      learningResourceType: SOORTNAAM[les.soort],
      isAccessibleForFree: true,
      provider: { "@type": "Organization", name: MERKNAAM },
      isPartOf: {
        "@type": "CreativeWork",
        name: `${domeinnaam(les)} – ${subdomeinnaam(les)}`,
        url: subdomeinAdres(les),
      },
      ...(plaatjes.length > 0 ? { image: plaatjes } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: vragen.map((v) => ({
        "@type": "Question",
        name: v.vraag,
        acceptedAnswer: { "@type": "Answer", text: v.antwoord },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { naam: `Groep ${LESGROEP}`, adres: `/groep-${LESGROEP}` },
        { naam: domeinnaam(les), adres: domeinAdres(les) },
        { naam: subdomeinnaam(les), adres: subdomeinAdres(les) },
        { naam: les.titel, adres },
      ].map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.naam, item: k.adres })),
    },
  ];
}

function Kruimels({ les }: { les: SeoLes }) {
  const delen: { naam: string; adres?: string }[] = [
    { naam: `Groep ${LESGROEP}`, adres: `/groep-${LESGROEP}` },
    { naam: domeinnaam(les), adres: domeinAdres(les) },
    { naam: subdomeinnaam(les), adres: subdomeinAdres(les) },
    { naam: les.titel },
  ];
  return (
    <nav aria-label="Je bent hier" className="mb-4 text-sm text-beheer-zacht">
      <ol className="flex flex-wrap items-center gap-1.5">
        {delen.map((d, i) => (
          <li key={d.naam} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-beheer-rand">
                /
              </span>
            )}
            {d.adres ? (
              <Link href={d.adres} className="underline hover:text-viool">
                {d.naam}
              </Link>
            ) : (
              <span className="font-semibold text-beheer-inkt">{d.naam}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Knoppen({ les }: { les: SeoLes }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {teProberen(les) && (
        <Link
          href={`/voorbeeld/les/${les.id}`}
          prefetch={false}
          className="inline-flex min-h-12 items-center rounded-lg bg-viool px-5 font-semibold text-white transition hover:bg-viool-diep"
        >
          Probeer deze les
        </Link>
      )}
      <Link
        href={START_GRATIS}
        prefetch={false}
        className="inline-flex min-h-12 items-center rounded-lg border border-viool bg-beheer-kaart px-5 font-semibold text-viool transition hover:bg-viool-zacht"
      >
        Start gratis
      </Link>
    </div>
  );
}

function Buurlessen({ les }: { les: SeoLes }) {
  const { vorige, volgende } = buren(les);
  return (
    <nav aria-label="Andere lessen" className="mt-10 grid gap-3 sm:grid-cols-2">
      {vorige ? (
        <Link
          href={lesAdres(vorige)}
          className="block rounded-lg border border-beheer-rand bg-beheer-kaart p-4 transition hover:border-viool"
        >
          <span className="block text-sm text-beheer-zacht">Vorige les</span>
          <span className="block font-semibold">{vorige.titel}</span>
        </Link>
      ) : (
        <span />
      )}
      {volgende && (
        <Link
          href={lesAdres(volgende)}
          className="block rounded-lg border border-beheer-rand bg-beheer-kaart p-4 text-right transition hover:border-viool"
        >
          <span className="block text-sm text-beheer-zacht">Volgende les</span>
          <span className="block font-semibold">{volgende.titel}</span>
        </Link>
      )}
    </nav>
  );
}

export function Lespagina({ les }: { les: SeoLes }) {
  const plaatjes = bestaandePlaatjes(les);
  const vragen = veelgesteldeVragen(les);
  const gegevens = gestructureerdeGegevens(les, plaatjes);

  return (
    <main lang="nl" dir="ltr" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gegevens).replace(/</g, "\\u003c") }}
      />

      <Kruimels les={les} />

      <p className="text-sm font-semibold text-viool">
        {SOORTNAAM[les.soort]} · {domeinnaam(les)} · groep {LESGROEP}
      </p>
      <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{les.seoTitel}</h1>
      <p className="mt-2 max-w-prose leading-relaxed text-beheer-zacht">{les.beschrijving}</p>

      <Knoppen les={les} />

      <section className="mt-8 rounded-lg border border-beheer-rand bg-beheer-kaart p-5">
        <h2 className="text-lg font-semibold">Wat leert je kind?</h2>
        <p className="mt-2 max-w-prose leading-relaxed">{les.leert}</p>

        <h3 className="mt-5 font-semibold">Zo gaat de les</h3>
        <ol className="mt-2 max-w-prose list-decimal space-y-1.5 pl-5 leading-relaxed">
          {les.stappen.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <p className="mt-5 max-w-prose text-sm leading-relaxed text-beheer-zacht">
          Deze les hoort bij {domeinnaam(les)}, onderwerp{" "}
          <Link href={subdomeinAdres(les)} className="underline hover:text-viool">
            {subdomeinnaam(les)}
          </Link>
          . Het is les {plekOpRoute(les)} van de {LEERROUTE_GROEP3.length} in de leerroute van groep {LESGROEP}.
        </p>
      </section>

      {plaatjes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Zo ziet de les eruit</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plaatjes.map((p, i) => (
              <li
                key={p}
                className="relative aspect-[16/10] overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart"
              >
                <Image
                  src={p}
                  alt={`Schermbeeld ${i + 1} uit de les ${les.titel}`}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Veelgestelde vragen</h2>
        <dl className="mt-3 space-y-4">
          {vragen.map((v) => (
            <div key={v.vraag} className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4">
              <dt className="font-semibold">{v.vraag}</dt>
              <dd className="mt-1 max-w-prose leading-relaxed text-beheer-zacht">{v.antwoord}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Buurlessen les={les} />

      <p className="mt-8 text-sm">
        <Link href={domeinAdres(les)} className="underline hover:text-viool">
          Meer over {domeinnaam(les).toLowerCase()} in groep {LESGROEP}
        </Link>
      </p>
    </main>
  );
}
