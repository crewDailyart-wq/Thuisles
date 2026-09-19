/**
 * De vaste bouwstenen van de ouderomgeving.
 *
 * Elke pagina wordt uit deze blokken opgebouwd, altijd in dezelfde volgorde
 * (zie `Pagina` hieronder):
 *
 *   1. paginatitel + één regel uitleg in gewone taal
 *   2. het belangrijkste eerst, in vaste blokken
 *   3. daaronder details — uitklapbaar, nooit standaard open
 *   4. onderaan één duidelijke vervolgactie, nooit meer dan twee knoppen
 *
 * Kleur is nergens het enige verschil: bij elke status hoort ook een vast
 * icoon en een vast woord. Groen en oranje zijn uitsluitend voor statussen,
 * paars uitsluitend voor knoppen en actieve items.
 */

import Link from "next/link";
import { Moeilijkheid } from "@/components/Moeilijkheid";
import { Icoon } from "@/components/ouder/Icoon";
import type { MasteryStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Pagina-omhulsel
// ---------------------------------------------------------------------------

export type Kruimel = { label: string; href?: string };

/** Kruimelpad. Staat op elke pagina dieper dan de vijf hoofdonderdelen. */
export function Kruimelpad({ paden }: { paden: Kruimel[] }) {
  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-beheer-zacht">
        {paden.map((k, i) => (
          <li key={`${k.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">›</span>}
            {k.href ? (
              <Link href={k.href} className="transition hover:text-viool hover:underline">
                {k.label}
              </Link>
            ) : (
              <span className="font-medium text-beheer-inkt">{k.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * De vaste opbouw van elke pagina. `titel` en `uitleg` zijn verplicht: elk
 * scherm legt in één regel uit wat de ouder ermee kan.
 */
export function Pagina({
  titel,
  uitleg,
  kruimels,
  children,
}: {
  titel: string;
  uitleg: string;
  kruimels?: Kruimel[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        {kruimels && <Kruimelpad paden={kruimels} />}
        <h1 className="text-2xl font-semibold tracking-tight">{titel}</h1>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-beheer-zacht">
          {uitleg}
        </p>
      </header>
      {children}
    </div>
  );
}

/** Een gewone kaart. Kaarten zijn voor samenvattingen, tabellen voor lijsten. */
export function Kaart({
  titel,
  bijschrift,
  children,
}: {
  titel?: string;
  bijschrift?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-beheer-rand bg-white p-5">
      {titel && (
        <header className="mb-4">
          <h2 className="text-base font-semibold">{titel}</h2>
          {bijschrift && (
            <p className="mt-0.5 text-sm text-beheer-zacht">{bijschrift}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * De vervolgactie onderaan de pagina. Eén knop, hooguit twee.
 * De tweede knop is altijd de rustige variant.
 */
export function Vervolgactie({
  primair,
  secundair,
}: {
  primair: { label: string; href?: string };
  secundair?: { label: string; href?: string };
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-beheer-rand pt-5 sm:flex-row">
      <Knop label={primair.label} href={primair.href} />
      {secundair && <Knop label={secundair.label} href={secundair.href} stil />}
    </div>
  );
}

export function Knop({
  label,
  href,
  stil = false,
}: {
  label: string;
  href?: string;
  stil?: boolean;
}) {
  // min-h-11: groot genoeg tikvlak op een telefoon.
  const klasse = stil
    ? "inline-flex min-h-11 items-center justify-center rounded-lg border border-beheer-rand bg-white px-4 text-sm font-medium transition hover:border-viool hover:text-viool"
    : "inline-flex min-h-11 items-center justify-center rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep";

  if (href) {
    return (
      <Link href={href} className={klasse}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className={klasse}>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// De drie statusblokken: Sterk, Aandacht, Aanbevolen
//
// Altijd deze drie, altijd in deze volgorde, altijd dezelfde kleur, hetzelfde
// icoon en dezelfde plek. Ook als er niets in staat: dan een nette lege tekst.
// ---------------------------------------------------------------------------

export type Statussoort = "sterk" | "aandacht" | "aanbevolen";

const STATUS = {
  sterk: {
    woord: "Sterk",
    rand: "border-groen/35",
    vlak: "bg-groen-zacht",
    inkt: "text-groen-diep",
  },
  aandacht: {
    woord: "Aandacht",
    rand: "border-oranje/35",
    vlak: "bg-oranje-zacht",
    inkt: "text-oranje-diep",
  },
  aanbevolen: {
    woord: "Aanbevolen",
    rand: "border-viool/30",
    vlak: "bg-viool-zacht",
    inkt: "text-viool-diep",
  },
} as const satisfies Record<Statussoort, unknown>;

export function Statusblok({
  soort,
  regels,
  leeg,
}: {
  soort: Statussoort;
  /** Korte, positief geformuleerde regels. Geen percentages. */
  regels: React.ReactNode[];
  /** Wat er staat als er niets is. Nooit een leeg vak. */
  leeg: string;
}) {
  const s = STATUS[soort];
  return (
    <section className={`rounded-xl border ${s.rand} ${s.vlak} p-4`}>
      <h2 className={`flex items-center gap-2 text-sm font-semibold ${s.inkt}`}>
        <Icoon naam={soort} className="size-[1.15rem] shrink-0" />
        {s.woord}
      </h2>
      {regels.length === 0 ? (
        <p className="mt-2.5 text-sm leading-relaxed text-beheer-zacht">{leeg}</p>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {regels.map((r, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {r}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** De drie blokken naast elkaar; op telefoon onder elkaar, in dezelfde volgorde. */
export function Statusrij({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>;
}

// ---------------------------------------------------------------------------
// Vaardigheidskaart: vier standen met vaste kleur én vaste vorm
// ---------------------------------------------------------------------------

const STAND: Record<
  MasteryStatus,
  { woord: string; kleur: string; deel: number; vinkje: boolean }
> = {
  nog_niet_gestart: { woord: "Nog niet gestart", kleur: "#98a0ac", deel: 0, vinkje: false },
  oefent: { woord: "Oefent", kleur: "#3577cc", deel: 0.5, vinkje: false },
  bijna_beheerst: { woord: "Bijna beheerst", kleur: "#4fbe86", deel: 0.8, vinkje: false },
  beheerst: { woord: "Beheerst", kleur: "#1f9d63", deel: 1, vinkje: true },
};

/**
 * Het merkje bij een stand: een ring die voor een deel gevuld is, en bij
 * "beheerst" een vinkje. Zo verschilt niet alleen de kleur maar ook de vorm.
 */
export function Standmerk({
  stand,
  className = "size-5",
}: {
  stand: MasteryStatus;
  className?: string;
}) {
  const s = STAND[stand];
  // Omtrek van de binnencirkel (r = 4.5). Met een dikke streep vult die de
  // cirkel als een taartpunt.
  const omtrek = 2 * Math.PI * 4.5;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx={12} cy={12} r={9} fill="none" stroke={s.kleur} strokeWidth={1.8} />
      {s.deel > 0 && !s.vinkje && (
        <circle
          cx={12}
          cy={12}
          r={4.5}
          fill="none"
          stroke={s.kleur}
          strokeWidth={9}
          strokeDasharray={`${s.deel * omtrek} ${omtrek}`}
          transform="rotate(-90 12 12)"
        />
      )}
      {s.vinkje && (
        <>
          <circle cx={12} cy={12} r={9} fill={s.kleur} />
          <path
            d="M8.2 12.3l2.6 2.6 5-5.4"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

/** De legenda hoort altijd zichtbaar bij een lijst met vaardigheden. */
export function Standlegenda() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {(Object.keys(STAND) as MasteryStatus[]).map((stand) => (
        <li key={stand} className="flex items-center gap-1.5 text-xs text-beheer-zacht">
          <Standmerk stand={stand} className="size-4 shrink-0" />
          {STAND[stand].woord}
        </li>
      ))}
    </ul>
  );
}

/** Eén leerdoel als regel op de vaardigheidskaart. */
export function Vaardigheid({
  titel,
  stand,
  bijschrift,
  moeilijkheid = null,
  href,
}: {
  titel: React.ReactNode;
  stand: MasteryStatus;
  /** Bijvoorbeeld het methodeblok waar dit leerdoel bij hoort. */
  bijschrift?: React.ReactNode;
  /**
   * Hoe moeilijk deze vaardigheid is, 1 tot 5, of `null`.
   *
   * Voor een ouder is dat het verschil tussen "hij loopt vast op iets moeilijks"
   * en "hij loopt vast op iets makkelijks" — en dat vraagt een andere reactie.
   */
  moeilijkheid?: number | null;
  href?: string;
}) {
  const inhoud = (
    <>
      <Standmerk stand={stand} className="mt-0.5 size-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{titel}</span>
          <Moeilijkheid waarde={moeilijkheid} />
        </span>
        <span className="block text-xs text-beheer-zacht">
          {STAND[stand].woord}
          {bijschrift ? <> · {bijschrift}</> : null}
        </span>
      </span>
      {href && <Icoon naam="pijl" className="mt-0.5 size-4 shrink-0 text-beheer-zacht" />}
    </>
  );

  const klasse =
    "flex min-h-11 w-full items-start gap-3 border-t border-beheer-rand-zacht py-3 text-left first:border-t-0";

  return href ? (
    <Link href={href} className={`${klasse} transition hover:text-viool`}>
      {inhoud}
    </Link>
  ) : (
    <div className={klasse}>{inhoud}</div>
  );
}

/** Markeert waar de klas nu zit. Wij schatten dit nooit zelf. */
export function Blokmarkering({ tekst }: { tekst: string }) {
  return (
    <p className="my-1 rounded-lg bg-beheer-vlak px-3 py-2 text-xs font-medium text-beheer-zacht">
      {tekst}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Uitklapbare details — nooit standaard open
// ---------------------------------------------------------------------------

export function Uitklap({
  titel,
  bijschrift,
  children,
}: {
  titel: string;
  bijschrift?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-beheer-rand bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5">
        <span>
          <span className="block text-sm font-semibold">{titel}</span>
          {bijschrift && (
            <span className="block text-xs text-beheer-zacht">{bijschrift}</span>
          )}
        </span>
        <Icoon
          naam="uitklap"
          className="size-4 shrink-0 text-beheer-zacht transition group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-beheer-rand-zacht px-5 py-4">{children}</div>
    </details>
  );
}

/**
 * "Wat ging er mis en hoe help ik thuis" — altijd dezelfde drie kopjes in
 * dezelfde volgorde, bij elke som die fout ging.
 */
export function WatGingErMis({
  som,
  watGingErMis,
  opSchool,
  zegDitThuis,
}: {
  som: React.ReactNode;
  watGingErMis: React.ReactNode;
  opSchool: React.ReactNode;
  zegDitThuis: React.ReactNode;
}) {
  return (
    <Uitklap titel="Wat ging er mis en hoe help ik thuis" bijschrift={undefined}>
      <p className="mb-3 text-sm font-semibold tabular-nums">{som}</p>
      <dl className="flex flex-col gap-3.5">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
            Wat ging er mis
          </dt>
          <dd className="mt-1 text-sm leading-relaxed">{watGingErMis}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
            Zo leert je kind het op school
          </dt>
          <dd className="mt-1 text-sm leading-relaxed">{opSchool}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
            Zeg dit thuis
          </dt>
          <dd className="mt-1 text-sm leading-relaxed">{zegDitThuis}</dd>
        </div>
      </dl>
    </Uitklap>
  );
}

// ---------------------------------------------------------------------------
// Kleine hulpjes
// ---------------------------------------------------------------------------

/** Rijtje eigenschappen, bijvoorbeeld school en methode. */
export function Gegevens({ rijen }: { rijen: [string, React.ReactNode][] }) {
  return (
    <dl className="flex flex-col">
      {rijen.map(([label, waarde]) => (
        <div
          key={label}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-beheer-rand-zacht py-2.5 first:border-t-0"
        >
          <dt className="text-sm text-beheer-zacht">{label}</dt>
          <dd className="text-sm font-medium">{waarde}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Een lege toestand is ook netjes: nooit een leeg scherm. */
export function Leeg({ tekst, actie }: { tekst: string; actie?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-beheer-rand bg-white px-5 py-8 text-center">
      <p className="text-sm text-beheer-zacht">{tekst}</p>
      {actie && (
        <div className="mt-3 flex justify-center">
          <Knop label={actie} stil />
        </div>
      )}
    </div>
  );
}

/**
 * Wat een ouder ziet zolang er nog geen kindprofiel is.
 *
 * Ook dit is een lege toestand met een uitweg: nooit een leeg scherm.
 */
export function GeenKind() {
  return (
    <Pagina
      titel="Nog geen kind toegevoegd"
      uitleg="Voeg eerst een profiel toe. Daarna zie je hier hoe het met je kind gaat."
    >
      <Leeg tekst="Een profiel heeft alleen een roepnaam, een groep en een avatar nodig." />
      <Vervolgactie
        primair={{ label: "Kind toevoegen", href: "/ouder/instellingen" }}
      />
    </Pagina>
  );
}

/**
 * Vaste markering voor onderdelen die nog juridisch of privacy-technisch
 * beoordeeld moeten worden. Blijft zichtbaar tot die beoordeling er is.
 */
export function Beoordeling({
  soort,
  punten,
}: {
  soort: "PRIVACY REVIEW REQUIRED" | "LEGAL REVIEW REQUIRED";
  punten: string[];
}) {
  return (
    <section className="rounded-xl border-2 border-dashed border-oranje/50 bg-oranje-zacht/40 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-oranje-diep">
        {soort}
      </h2>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-sm text-beheer-inkt">
        {punten.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
