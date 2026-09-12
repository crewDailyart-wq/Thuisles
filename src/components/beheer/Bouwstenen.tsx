/**
 * Vaste bouwstenen voor alle beheerschermen.
 *
 * Elk detailscherm (vak, domein, onderwerp, leerdoel) is op dezelfde manier
 * opgebouwd:
 *
 *   1. kruimelpad  — waar ben ik
 *   2. kop         — titel, korte samenvatting, knoppen rechts
 *   3. gegevens    — de eigenschappen, met bewerken direct daaronder
 *   4. tabel       — wat er onder dit onderdeel hangt
 *
 * Door dat overal gelijk te houden hoef je maar één keer te leren hoe een
 * scherm werkt.
 */

import Link from "next/link";

export type Kruimel = { label: string; href?: string };

export function Kruimelpad({ paden }: { paden: Kruimel[] }) {
  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-beheer-zacht">
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

export function Kop({
  kruimels,
  titel,
  bijschrift,
  acties,
}: {
  kruimels: Kruimel[];
  titel: string;
  bijschrift?: string;
  acties?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1.5">
      <Kruimelpad paden={kruimels} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{titel}</h1>
          {bijschrift && (
            <p className="mt-0.5 text-sm text-beheer-zacht">{bijschrift}</p>
          )}
        </div>
        {acties && <div className="flex flex-wrap gap-2">{acties}</div>}
      </div>
    </header>
  );
}

export function Paneel({
  titel,
  bijschrift,
  acties,
  children,
  geenVulling = false,
}: {
  titel: string;
  bijschrift?: string;
  acties?: React.ReactNode;
  children: React.ReactNode;
  /** Zet uit als er een tabel in staat die tot de rand mag lopen. */
  geenVulling?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-beheer-rand px-4 py-2.5">
        <div>
          <h2 className="text-sm font-semibold">{titel}</h2>
          {bijschrift && <p className="text-xs text-beheer-zacht">{bijschrift}</p>}
        </div>
        {acties && <div className="flex flex-wrap gap-1.5">{acties}</div>}
      </header>
      <div className={geenVulling ? "" : "p-4"}>{children}</div>
    </section>
  );
}

/** Rijtje eigenschappen bovenaan een detailscherm. */
export function Gegevens({ rijen }: { rijen: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {rijen.map(([label, waarde]) => (
        <div key={label}>
          <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
            {label}
          </dt>
          <dd className="mt-0.5 text-sm">{waarde}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Tabelkop({ kolommen }: { kolommen: string[] }) {
  return (
    <thead>
      <tr className="border-b border-beheer-rand bg-beheer-vlak text-left">
        {kolommen.map((k, i) => (
          <th
            key={`${k}-${i}`}
            scope="col"
            className="px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht"
          >
            {k}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function Leeg({ tekst, hint }: { tekst: string; hint?: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-medium">{tekst}</p>
      {hint && <p className="mt-1 text-sm text-beheer-zacht">{hint}</p>}
    </div>
  );
}

/** Klasses die overal hetzelfde zijn, zodat knoppen en velden niet gaan zwerven. */
export const stijl = {
  veld:
    "w-full rounded-md border border-beheer-rand bg-white px-2.5 py-1.5 text-sm outline-none transition placeholder:text-beheer-zacht/70 focus:border-viool focus:ring-2 focus:ring-viool/20",
  veldSmal:
    "rounded-md border border-beheer-rand bg-white px-2 py-1.5 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20",
  knop:
    "inline-flex h-8 items-center rounded-md bg-viool px-3 text-xs font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60",
  knopStil:
    "inline-flex h-8 items-center rounded-md border border-beheer-rand px-3 text-xs font-medium transition hover:border-viool hover:text-viool",
  knopGroot:
    "inline-flex h-9 items-center gap-1.5 rounded-md bg-viool px-3.5 text-sm font-semibold text-white transition hover:bg-viool-diep",
  link: "text-beheer-zacht transition hover:text-viool",
  gevaar: "text-beheer-zacht transition hover:text-roze",
} as const;
