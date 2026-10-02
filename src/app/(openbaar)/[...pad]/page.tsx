/**
 * De openbare pagina's, achter één adres-lezer.
 *
 * ---------------------------------------------------------------------------
 * Waarom één bestand en niet vier mappen
 * ---------------------------------------------------------------------------
 * De adressen zien er zo uit:
 *
 *     /groep-4                          wat leert een kind in groep 4
 *     /groep-4/tafels                   het domein, met zijn onderwerpen
 *     /groep-4/tafels/tafels-oefenen    een onderwerp
 *     /groep-4/tafels/tafel-van-3       een oefening
 *     /tr/groep-4/tafels/tafel-van-3    hetzelfde, in het Turks
 *
 * Een map per niveau zou betekenen dat de taal er als extra laag omheen moet,
 * en dan staat `/groep-4/tafels` in twee mappen die allebei "een naam met twee
 * delen" zijn — dat kan Next niet uit elkaar houden. Eén lezer die het pad
 * zelf uit elkaar haalt is korter, en er is maar één plek waar de regels staan.
 *
 * Omdat dit het laatste adres is dat Next probeert, krijgen alle bestaande
 * pagina's vanzelf voorrang: `/start`, `/oefenen/...`, `/admin/...` en
 * `/ouder/...` komen hier nooit langs. Wat er wél langskomt en geen pagina
 * oplevert, wordt een gewone 404 — precies zoals het al was.
 *
 * ---------------------------------------------------------------------------
 * Het derde deel: onderwerp of oefening
 * ---------------------------------------------------------------------------
 * Allebei hangen ze onder het domein. Er wordt eerst naar een onderwerp
 * gekeken en daarna naar een oefening. Een naam die toevallig bij allebei
 * bestaat komt dus op het onderwerp uit; dat is de pagina met het meeste erop.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  OPENBARE_GROEPEN,
  haalOpenbareDomeinen,
  haalOpenbareOefeningen,
  haalOpenbareOnderwerpen,
  isOpenbareGroep,
  zoekOpenbaarDomein,
  zoekOpenbaarOnderwerp,
  zoekOpenbareOefening,
  type OpenbaarOnderdeel,
  type OpenbareOefening,
} from "@/lib/data/openbaar";
import {
  STANDAARDTAAL,
  TAALNAAM,
  TALEN,
  groepdeel,
  isTaal,
  leesGroepdeel,
  leesrichting,
  openbaarAdres,
  paginabeschrijving,
  paginatitel,
  taalvoorvoegsel,
  type Taal,
} from "@/lib/seo";

// ---------------------------------------------------------------------------
// Het adres lezen
// ---------------------------------------------------------------------------

/** Wat er op het scherm komt, uit het pad gelezen. */
type Pagina =
  | { soort: "groep"; taal: Taal; groep: number }
  | { soort: "domein"; taal: Taal; groep: number; domein: OpenbaarOnderdeel }
  | {
      soort: "onderwerp";
      taal: Taal;
      groep: number;
      domein: OpenbaarOnderdeel;
      onderwerp: OpenbaarOnderdeel;
    }
  | {
      soort: "oefening";
      taal: Taal;
      groep: number;
      domein: OpenbaarOnderdeel;
      oefening: OpenbareOefening;
    };

/**
 * Het pad uit elkaar halen, en `null` als er geen openbare pagina bij hoort.
 *
 * Werkt niet met redirects: dat mag een `generateMetadata` niet doen, en hij
 * leest hetzelfde pad als de pagina. Of er doorgestuurd moet worden, bepaalt
 * `nieuwAdres` hieronder.
 */
function leesPad(delen: string[]): Pagina | null {
  const rest = [...delen];

  /* Een taal vooraan hoort bij het adres, geen taal betekent Nederlands. */
  const taal: Taal = isTaal(rest[0]) ? (rest.shift() as Taal) : STANDAARDTAAL;

  const groep = leesGroepdeel(rest.shift() ?? "");
  if (!isOpenbareGroep(groep)) return null;
  if (rest.length === 0) return { soort: "groep", taal, groep };

  const domein = zoekOpenbaarDomein(rest.shift() as string);
  if (!domein) return null;
  if (rest.length === 0) return { soort: "domein", taal, groep, domein };

  const laatste = rest.shift() as string;
  /* Meer dan vier delen bestaat niet; dan is het geen van onze adressen. */
  if (rest.length > 0) return null;

  const onderwerp = zoekOpenbaarOnderwerp(domein.id, laatste);
  if (onderwerp) return { soort: "onderwerp", taal, groep, domein, onderwerp };

  const oefening = zoekOpenbareOefening(domein.id, groep, laatste);
  if (oefening) return { soort: "oefening", taal, groep, domein, oefening };

  return null;
}

/** Het adres zoals het nú hoort te zijn. Het echte adres van deze pagina. */
function huidigAdres(pagina: Pagina): string {
  const { taal, groep } = pagina;
  if (pagina.soort === "groep") return openbaarAdres(taal, groep);
  if (pagina.soort === "domein") return openbaarAdres(taal, groep, pagina.domein.adresdeel);
  if (pagina.soort === "onderwerp") {
    return openbaarAdres(taal, groep, pagina.domein.adresdeel, pagina.onderwerp.adresdeel);
  }
  return openbaarAdres(taal, groep, pagina.domein.adresdeel, pagina.oefening.adresdeel);
}

/**
 * Het pad waar deze bezoeker naartoe hoort, of null als hij goed zit.
 *
 * Twee gevallen: een naam is veranderd, dus het oude adres hoort door te sturen
 * naar het nieuwe; of iemand typte `/nl/...`, en Nederlands heeft geen
 * voorvoegsel. Allebei een blijvende verhuizing, zodat een zoekmachine het
 * nieuwe adres overneemt en het oude laat vallen.
 */
function nieuwAdres(delen: string[], pagina: Pagina): string | null {
  const nu = huidigAdres(pagina);
  const gevraagd = `/${delen.join("/")}`;
  return nu === gevraagd ? null : nu;
}

/** Waar de pagina over gaat, in één woordgroep. Gebruikt in titel en tekst. */
function onderdeelnaam(pagina: Pagina): string {
  if (pagina.soort === "groep") return "Rekenen";
  if (pagina.soort === "domein") return pagina.domein.naam;
  if (pagina.soort === "onderwerp") return pagina.onderwerp.naam;
  return pagina.oefening.naam;
}

/** De eigen titel en beschrijving uit de admin, als er een is ingevuld. */
function eigenTeksten(pagina: Pagina): { titel: string | null; omschrijving: string | null } {
  if (pagina.soort === "groep") return { titel: null, omschrijving: null };
  const bron =
    pagina.soort === "domein"
      ? pagina.domein
      : pagina.soort === "onderwerp"
        ? pagina.onderwerp
        : pagina.oefening;
  return { titel: bron.seoTitel, omschrijving: bron.seoOmschrijving };
}

// ---------------------------------------------------------------------------
// De kop van de pagina
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pad?: string[] }>;
}): Promise<Metadata> {
  const { pad = [] } = await params;
  const pagina = leesPad(pad);
  if (!pagina) return {};

  const naam = onderdeelnaam(pagina);
  const eigen = eigenTeksten(pagina);
  const adres = huidigAdres(pagina);

  /*
    Elke taal krijgt zijn eigen adres, met de juiste taalaanduiding voor
    zoekmachines (WERKPLAN.md, SEO-basis punt 6). `x-default` wijst naar het
    Nederlands: dat is de taal waarin de site gemaakt is.
  */
  const zonderTaal = adres.slice(taalvoorvoegsel(pagina.taal).length);
  const talen = Object.fromEntries(
    TALEN.map((t) => [t, `${taalvoorvoegsel(t)}${zonderTaal}`]),
  );

  return {
    title: paginatitel(eigen.titel, naam, pagina.groep),
    description: paginabeschrijving(eigen.omschrijving, naam, pagina.groep),
    alternates: {
      canonical: adres,
      languages: { ...talen, "x-default": zonderTaal },
    },
  };
}

// ---------------------------------------------------------------------------
// Bouwstenen van het scherm
// ---------------------------------------------------------------------------

function Kruimels({ delen }: { delen: { naam: string; adres?: string }[] }) {
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

/**
 * De plek voor een uitlegtekst voor ouders.
 *
 * De opzet staat er, de teksten komen later (WERKPLAN.md, SEO-basis punt 3).
 * Bewust een echte kop met een echte vraag erin — "Hoe leert mijn kind de
 * tafels in groep 4?" — want dat is waar een ouder op zoekt. Wat er nu onder
 * staat, zegt eerlijk dat de tekst nog geschreven wordt; een pagina met
 * nepzinnen zou in een zoekresultaat terechtkomen alsof het een antwoord was.
 */
function Oudertekst({ onderdeel, groep }: { onderdeel: string; groep: number }) {
  return (
    <section className="mt-8 rounded-lg border border-beheer-rand bg-beheer-kaart p-5">
      <h2 className="text-lg font-semibold">
        Hoe leert mijn kind {onderdeel.toLowerCase()} in groep {groep}?
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-beheer-zacht">
        Hier komt de uitleg voor ouders: wat een kind in deze groep leert, in welke
        stappen dat gaat, en waar het meestal op vastloopt. Die tekst wordt nog
        geschreven.
      </p>
    </section>
  );
}

/** De taalkeuze onderaan. Elke taal is een eigen adres, geen knop die omschakelt. */
function Taalkeuze({ pagina }: { pagina: Pagina }) {
  const adres = huidigAdres(pagina);
  const zonderTaal = adres.slice(taalvoorvoegsel(pagina.taal).length);

  return (
    <nav aria-label="Taal" className="mt-10 border-t border-beheer-rand pt-4">
      <ul className="flex flex-wrap gap-3 text-sm">
        {TALEN.map((t) => (
          <li key={t}>
            {t === pagina.taal ? (
              <span className="font-semibold">{TAALNAAM[t]}</span>
            ) : (
              <Link
                href={`${taalvoorvoegsel(t)}${zonderTaal}`}
                hrefLang={t}
                className="underline hover:text-viool"
              >
                {TAALNAAM[t]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Een rij kaarten met links. Overal hetzelfde, van groep tot oefening. */
function Kaarten({
  items,
}: {
  items: { naam: string; adres: string; onder?: string }[];
}) {
  if (items.length === 0) {
    return (
      <p className="mt-2 text-sm text-beheer-zacht">
        Hier staat nog niets klaar. Er wordt aan gewerkt.
      </p>
    );
  }
  return (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.adres}>
          <Link
            href={i.adres}
            className="block h-full rounded-lg border border-beheer-rand bg-beheer-kaart p-4 transition hover:border-viool"
          >
            <span className="block font-semibold">{i.naam}</span>
            {i.onder && (
              <span className="mt-1 block text-sm text-beheer-zacht">{i.onder}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// De pagina
// ---------------------------------------------------------------------------

export default async function OpenbarePagina({
  params,
}: {
  params: Promise<{ pad?: string[] }>;
}) {
  const { pad = [] } = await params;
  const pagina = leesPad(pad);
  if (!pagina) notFound();

  const naar = nieuwAdres(pad, pagina);
  if (naar) permanentRedirect(naar);

  const { taal, groep } = pagina;
  const naam = onderdeelnaam(pagina);
  const eigen = eigenTeksten(pagina);

  const kruimels: { naam: string; adres?: string }[] = [
    { naam: `Groep ${groep}`, adres: pagina.soort === "groep" ? undefined : openbaarAdres(taal, groep) },
  ];
  if (pagina.soort !== "groep") {
    kruimels.push({
      naam: pagina.domein.naam,
      adres:
        pagina.soort === "domein"
          ? undefined
          : openbaarAdres(taal, groep, pagina.domein.adresdeel),
    });
  }
  if (pagina.soort === "onderwerp") kruimels.push({ naam: pagina.onderwerp.naam });
  if (pagina.soort === "oefening") kruimels.push({ naam: pagina.oefening.naam });

  return (
    <main
      dir={leesrichting(taal)}
      lang={taal}
      className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6"
    >
      <Kruimels delen={kruimels} />

      <h1 className="text-2xl font-semibold sm:text-3xl">
        {paginatitel(eigen.titel, naam, groep).replace(" | Thuisles", "")}
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-beheer-zacht">
        {paginabeschrijving(eigen.omschrijving, naam, groep)}
      </p>

      {pagina.soort === "groep" && (
        <>
          <h2 className="mt-8 text-lg font-semibold">Onderdelen in groep {groep}</h2>
          <Kaarten
            items={haalOpenbareDomeinen().map((d) => ({
              naam: d.naam,
              onder: d.omschrijving || undefined,
              adres: openbaarAdres(taal, groep, d.adresdeel),
            }))}
          />
          <h2 className="mt-8 text-lg font-semibold">Andere groepen</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {OPENBARE_GROEPEN.filter((g) => g !== groep).map((g) => (
              <li key={g}>
                <Link href={openbaarAdres(taal, g)} className="underline hover:text-viool">
                  {groepdeel(g).replace("-", " ")}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {pagina.soort === "domein" && (
        <>
          <h2 className="mt-8 text-lg font-semibold">Onderwerpen</h2>
          <Kaarten
            items={haalOpenbareOnderwerpen(pagina.domein.id).map((s) => ({
              naam: s.naam,
              onder: s.omschrijving || undefined,
              adres: openbaarAdres(taal, groep, pagina.domein.adresdeel, s.adresdeel),
            }))}
          />
          <h2 className="mt-8 text-lg font-semibold">Oefeningen voor groep {groep}</h2>
          <Kaarten
            items={haalOpenbareOefeningen(pagina.domein.id, groep).map((l) => ({
              naam: l.naam,
              onder: l.omschrijving || undefined,
              adres: openbaarAdres(taal, groep, pagina.domein.adresdeel, l.adresdeel),
            }))}
          />
          <Oudertekst onderdeel={pagina.domein.naam} groep={groep} />
        </>
      )}

      {pagina.soort === "onderwerp" && (
        <>
          <h2 className="mt-8 text-lg font-semibold">Oefeningen voor groep {groep}</h2>
          <Kaarten
            items={haalOpenbareOefeningen(pagina.domein.id, groep)
              .filter((l) => l.omschrijving === pagina.onderwerp.naam)
              .map((l) => ({
                naam: l.naam,
                adres: openbaarAdres(taal, groep, pagina.domein.adresdeel, l.adresdeel),
              }))}
          />
          <Oudertekst onderdeel={pagina.onderwerp.naam} groep={groep} />
        </>
      )}

      {pagina.soort === "oefening" && (
        <>
          <dl className="mt-8 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-semibold">Onderdeel</dt>
            <dd>{pagina.domein.naam}</dd>
            <dt className="font-semibold">Onderwerp</dt>
            <dd>{pagina.oefening.omschrijving || "—"}</dd>
            <dt className="font-semibold">Groep</dt>
            <dd>
              {pagina.oefening.groepVan === pagina.oefening.groepTot
                ? `Groep ${pagina.oefening.groepVan}`
                : `Groep ${pagina.oefening.groepVan} tot en met ${pagina.oefening.groepTot}`}
            </dd>
            {pagina.oefening.bolletjes !== null && (
              <>
                <dt className="font-semibold">Moeilijkheid</dt>
                <dd>{pagina.oefening.bolletjes} van de 5</dd>
              </>
            )}
          </dl>
          <Oudertekst onderdeel={pagina.oefening.naam} groep={groep} />
        </>
      )}

      <Taalkeuze pagina={pagina} />
    </main>
  );
}
