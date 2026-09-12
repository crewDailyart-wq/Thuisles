"use client";

/**
 * De vorm van het profielkeuzescherm.
 *
 * Eén kaart, velden onder elkaar, een foutmelding in gewone taal boven de
 * knop, en een knop die tijdens het versturen aangeeft dat hij bezig is.
 */

import { useActionState } from "react";

export type Uitkomst = { fout: string } | null;

export function Kaart({
  titel,
  uitleg,
  children,
}: {
  titel: string;
  uitleg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-beheer-rand bg-white p-6">
      <h1 className="text-xl font-semibold tracking-tight">{titel}</h1>
      <p className="mt-1 text-sm leading-relaxed text-beheer-zacht">{uitleg}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Veld({
  label,
  naam,
  soort = "text",
  hulp,
  ...rest
}: {
  label: string;
  naam: string;
  soort?: string;
  hulp?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      {hulp && <span className="block text-xs text-beheer-zacht">{hulp}</span>}
      <input
        name={naam}
        type={soort}
        className="mt-1.5 h-11 w-full rounded-lg border border-beheer-rand bg-white px-3 text-sm outline-none transition focus:border-viool focus:ring-2 focus:ring-viool/20"
        {...rest}
      />
    </label>
  );
}

export function Fout({ tekst }: { tekst?: string }) {
  if (!tekst) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-oranje/40 bg-oranje-zacht px-3 py-2.5 text-sm text-oranje-diep"
    >
      {tekst}
    </p>
  );
}

/** Een formulier dat een serveractie aanroept en de foutmelding toont. */
export function Toegangsformulier({
  actie,
  knop,
  children,
}: {
  actie: (vorige: Uitkomst, gegevens: FormData) => Promise<Uitkomst>;
  knop: string;
  children: React.ReactNode;
}) {
  const [uitkomst, verstuur, bezig] = useActionState(actie, null);

  return (
    <form action={verstuur} className="flex flex-col gap-4">
      {children}
      <Fout tekst={uitkomst?.fout} />
      <button
        type="submit"
        disabled={bezig}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
      >
        {bezig ? "Even geduld…" : knop}
      </button>
    </form>
  );
}
