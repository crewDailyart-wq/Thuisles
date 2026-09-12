"use client";

/**
 * De stapsgewijze filter boven elke lange lijst in het beheer.
 *
 * Altijd dezelfde volgorde, op elk scherm hetzelfde:
 *
 *   groep → vak → domein → subdomein → leerdoel
 *
 * Een niveau verschijnt pas zodra het niveau erboven gekozen is. Zonder domein
 * heeft een subdomeinkeuze geen betekenis, en een half gevulde keuzelijst is
 * verwarrender dan geen keuzelijst.
 *
 * ---------------------------------------------------------------------------
 * Waar de keuze leeft
 * ---------------------------------------------------------------------------
 * In het webadres. Daardoor is een gefilterd overzicht te bewaren en door te
 * sturen, werkt de terugknop, en blijft de filter staan na het verwijderen of
 * publiceren van een vraag — die schermen halen zichzelf immers opnieuw op.
 *
 * Het vak is geen zoekparameter maar een deel van het pad (`/admin/rekenen/…`).
 * Een ander vak kiezen springt dus naar hetzelfde scherm binnen dat vak, en
 * zet de filters daaronder leeg: een domein van rekenen bestaat niet bij taal.
 *
 * ---------------------------------------------------------------------------
 * Onthouden
 * ---------------------------------------------------------------------------
 * De laatste keuze wordt per scherm bewaard in `localStorage`. Kom je terug op
 * een scherm zónder filters in het adres, dan wordt die keuze hersteld. Dat is
 * bewust alleen bij een "kaal" adres: een gedeelde link met filters erin hoort
 * te tonen wat er in die link staat, niet wat jij de vorige keer deed.
 *
 * "Filters wissen" wist ook het geheugen, anders komt de filter bij de
 * volgende keer gewoon weer terug en lijkt de knop stuk.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { GROEPEN, NIVEAUS, type Niveau } from "@/lib/beheerfilter";

export type Optie = { waarde: string; label: string };

/** Alles wat het scherm aanlevert om de keuzelijsten te kunnen vullen. */
export type StapfilterGegevens = {
  /** Waar dit scherm staat, zonder vak: "vragen", "overzicht", "sjablonen". */
  scherm: string;
  vakSlug: string;
  vakken: Optie[];
  /** Domeinen binnen het gekozen vak. */
  domeinen: Optie[];
  /** Subdomeinen binnen het gekozen domein. Leeg als er geen domein gekozen is. */
  subdomeinen: Optie[];
  /** Leerdoelen binnen het gekozen subdomein. Leeg als er geen gekozen is. */
  leerdoelen: Optie[];
};

const veld =
  "h-9 rounded-md border border-beheer-rand bg-white px-2.5 text-sm text-beheer-inkt outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20";

function Keuze({
  label,
  opties,
  waarde,
  alles,
  onWijzig,
}: {
  label: string;
  opties: Optie[];
  waarde: string;
  alles: string;
  onWijzig: (waarde: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.68rem] font-medium uppercase tracking-wide text-beheer-zacht">
        {label}
      </span>
      <select
        value={waarde}
        onChange={(e) => onWijzig(e.target.value)}
        className={`${veld} min-w-[9rem] max-w-[16rem]`}
      >
        <option value="">{alles}</option>
        {opties.map((o) => (
          <option key={o.waarde} value={o.waarde}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Eén stap in het kruimelpad met filters, met een kruisje om hem te wissen. */
function Kruimel({
  label,
  onWis,
}: {
  label: string;
  onWis: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-viool/25 bg-viool/8 py-0.5 pl-2 pr-1 text-xs font-medium text-viool-diep">
      {label}
      <button
        type="button"
        onClick={onWis}
        aria-label={`Filter ${label} weghalen`}
        title={`Filter ${label} weghalen`}
        className="grid size-4 place-items-center rounded text-viool transition hover:bg-viool hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" className="size-3" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </span>
  );
}

export function Stapfilter({
  gegevens,
  /** Extra velden van dit scherm (zoeken, vraagtype) die blijven staan. */
  extra,
}: {
  gegevens: StapfilterGegevens;
  extra?: React.ReactNode;
}) {
  const { scherm, vakSlug, vakken, domeinen, subdomeinen, leerdoelen } = gegevens;
  const router = useRouter();
  const params = useSearchParams();
  const [bezig, start] = useTransition();

  const sleutel = `thuisles.beheerfilter.${scherm}`;
  const huidig = (n: Niveau) => params.get(n) ?? "";
  const query = params.toString();

  // Eén keer per scherm terugzetten wat er de vorige keer stond.
  const hersteld = useRef(false);
  useEffect(() => {
    if (hersteld.current) return;
    hersteld.current = true;

    // Staat er al iets in het adres? Dan gaat dat voor.
    if (NIVEAUS.some((n) => params.get(n))) return;

    let bewaard: string | null = null;
    try {
      bewaard = window.localStorage.getItem(sleutel);
    } catch {
      // Privémodus of geblokkeerde opslag: dan gewoon zonder geheugen verder.
      return;
    }
    if (!bewaard) return;

    const terug = new URLSearchParams(query);
    let iets = false;
    for (const [n, w] of Object.entries(JSON.parse(bewaard) as Record<string, string>)) {
      if (w) {
        terug.set(n, w);
        iets = true;
      }
    }
    if (iets) router.replace(`/admin/${vakSlug}/${scherm}?${terug.toString()}`);
  }, [params, query, router, scherm, sleutel, vakSlug]);

  function ga(nieuw: URLSearchParams, naarVak = vakSlug) {
    nieuw.delete("toegevoegd");
    try {
      window.localStorage.setItem(
        sleutel,
        JSON.stringify(Object.fromEntries(NIVEAUS.map((n) => [n, nieuw.get(n) ?? ""]))),
      );
    } catch {
      // Niet kunnen onthouden is vervelend, maar mag het filteren niet breken.
    }
    const q = nieuw.toString();
    start(() => router.replace(`/admin/${naarVak}/${scherm}${q ? `?${q}` : ""}`));
  }

  /** Een niveau zetten en alles eronder leegmaken. */
  function zet(niveau: Niveau, waarde: string) {
    const nieuw = new URLSearchParams(params.toString());
    if (waarde) nieuw.set(niveau, waarde);
    else nieuw.delete(niveau);

    const vanaf = NIVEAUS.indexOf(niveau) + 1;
    for (const lager of NIVEAUS.slice(vanaf)) nieuw.delete(lager);

    ga(nieuw);
  }

  function wisselVak(nieuwVak: string) {
    // Een domein van het ene vak bestaat niet bij het andere.
    const nieuw = new URLSearchParams(params.toString());
    for (const n of NIVEAUS) if (n !== "groep") nieuw.delete(n);
    ga(nieuw, nieuwVak || vakSlug);
  }

  function wisAlles() {
    try {
      window.localStorage.removeItem(sleutel);
    } catch {
      // Zie boven.
    }
    start(() => router.replace(`/admin/${vakSlug}/${scherm}`));
  }

  const label = (opties: Optie[], waarde: string) =>
    opties.find((o) => o.waarde === waarde)?.label ?? waarde;

  const vakNaam = label(vakken, vakSlug);
  const actief = NIVEAUS.some((n) => huidig(n));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Keuze
          label="Groep"
          alles="Alle groepen"
          opties={GROEPEN.map((g) => ({ waarde: String(g), label: `Groep ${g}` }))}
          waarde={huidig("groep")}
          onWijzig={(w) => zet("groep", w)}
        />

        {/* Het vak zit in het pad, dus dit springt naar hetzelfde scherm daar. */}
        <label className="flex flex-col gap-1">
          <span className="text-[0.68rem] font-medium uppercase tracking-wide text-beheer-zacht">
            Vak
          </span>
          <select
            value={vakSlug}
            onChange={(e) => wisselVak(e.target.value)}
            className={`${veld} min-w-[9rem]`}
          >
            {vakken.map((v) => (
              <option key={v.waarde} value={v.waarde}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <Keuze
          label="Domein"
          alles="Hele vak"
          opties={domeinen}
          waarde={huidig("domein")}
          onWijzig={(w) => zet("domein", w)}
        />

        {/* Pas zichtbaar zodra er een domein gekozen is. */}
        {huidig("domein") && (
          <Keuze
            label="Onderwerp"
            alles="Hele domein"
            opties={subdomeinen}
            waarde={huidig("subdomein")}
            onWijzig={(w) => zet("subdomein", w)}
          />
        )}

        {huidig("subdomein") && (
          <Keuze
            label="Leerdoel"
            alles="Hele onderwerp"
            opties={leerdoelen}
            waarde={huidig("leerdoel")}
            onWijzig={(w) => zet("leerdoel", w)}
          />
        )}

        {extra}

        {bezig && <span className="pb-2 text-xs text-beheer-zacht">Bezig…</span>}
      </div>

      {/* Wat staat er nu aan? Met per stap een kruisje om hem weg te halen. */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-beheer-rand-zacht pt-3">
        <span className="text-[0.68rem] font-medium uppercase tracking-wide text-beheer-zacht">
          Filter
        </span>

        {huidig("groep") ? (
          <Kruimel label={`Groep ${huidig("groep")}`} onWis={() => zet("groep", "")} />
        ) : (
          <span className="rounded-md border border-beheer-rand bg-beheer-vlak px-2 py-0.5 text-xs text-beheer-zacht">
            Alle groepen
          </span>
        )}

        <span aria-hidden="true" className="text-beheer-zacht">›</span>
        {/* Het vak kun je niet weghalen; je bent altijd binnen één vak. */}
        <span className="rounded-md border border-beheer-rand bg-beheer-vlak px-2 py-0.5 text-xs font-medium">
          {vakNaam}
        </span>

        {huidig("domein") && (
          <>
            <span aria-hidden="true" className="text-beheer-zacht">›</span>
            <Kruimel
              label={label(domeinen, huidig("domein"))}
              onWis={() => zet("domein", "")}
            />
          </>
        )}

        {huidig("subdomein") && (
          <>
            <span aria-hidden="true" className="text-beheer-zacht">›</span>
            <Kruimel
              label={label(subdomeinen, huidig("subdomein"))}
              onWis={() => zet("subdomein", "")}
            />
          </>
        )}

        {huidig("leerdoel") && (
          <>
            <span aria-hidden="true" className="text-beheer-zacht">›</span>
            <Kruimel
              label={label(leerdoelen, huidig("leerdoel"))}
              onWis={() => zet("leerdoel", "")}
            />
          </>
        )}

        {actief && (
          <button
            type="button"
            onClick={wisAlles}
            className="ml-1 rounded px-2 py-0.5 text-xs font-semibold text-viool transition hover:bg-viool/8"
          >
            Alles wissen
          </button>
        )}
      </div>
    </div>
  );
}
