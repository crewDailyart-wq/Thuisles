"use client";

/**
 * Zijbalk van de beheeromgeving.
 *
 * Bovenaan een vakkiezer, daaronder de schermen binnen dat vak. Nu staat er
 * alleen Rekenen in, maar de opbouw is er al op gemaakt dat er vakken
 * bijkomen: de keuzelijst leest gewoon wat er in de database staat, en elk
 * webadres begint met het vak.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Vak } from "@/lib/types";

type Item = { deel: string; label: string; pad: string };

const ITEMS: Item[] = [
  { deel: "overzicht", label: "Overzicht", pad: "M4 13h6V4H4zM14 20h6V4h-6zM4 20h6v-4H4z" },
  { deel: "structuur", label: "Domeinen & leerdoelen", pad: "M4.5 6.5h15M4.5 12h15M4.5 17.5h15M8.5 4v16" },
  { deel: "vragen", label: "Vragen", pad: "M4 5.5h16M4 12h16M4 18.5h10" },
  { deel: "sjablonen", label: "Sjablonen", pad: "M4.5 4.5h15v6h-15zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z" },
  { deel: "afbeeldingen", label: "Afbeeldingen", pad: "M4.5 5.5h15v13h-15zM4.5 15l4-4 4 4M13 13.5l2.5-2.5 4 4M15.5 9.5h.01" },
  { deel: "uploaden", label: "Uploaden", pad: "M12 16.5V4.5M7.5 9 12 4.5 16.5 9M4.5 19.5h15" },
];

/** Onderdelen die niet bij één vak horen. */
const ALGEMEEN = [
  {
    href: "/admin/scholen",
    label: "Scholen",
    pad: "M12 3.5 21 8v1.5H3V8zM5.5 9.5v8M18.5 9.5v8M9.5 9.5v8M14.5 9.5v8M3.5 20.5h17",
  },
  {
    href: "/admin/methodes",
    label: "Methodes",
    pad: "M4.5 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2h-6zM19.5 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z",
  },
  {
    href: "/admin/zoeker",
    label: "Methodezoeker",
    pad: "M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12M15 15l4.5 4.5",
  },
  {
    href: "/admin/verificaties",
    label: "Verificaties",
    pad: "M12 3.5 19.5 6v6c0 4-3.2 7.4-7.5 8.5C7.7 19.4 4.5 16 4.5 12V6zM9 12l2.2 2.2L15.5 10",
  },
];

export function Beheerbalk({ vakken }: { vakken: Vak[] }) {
  const pad = usePathname();
  const router = useRouter();

  // /admin/<vak>/... -> het vak staat op de tweede plek in het webadres.
  const uitPad = pad.split("/")[2];
  const huidigVak =
    vakken.find((v) => v.slug === uitPad) ??
    vakken.find((v) => v.actief) ??
    vakken[0];

  if (!huidigVak) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-14 flex-col bg-beheer-balk py-3 text-white sm:w-56">
      <div className="mb-3 flex items-center gap-2.5 px-3 sm:px-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-viool text-[0.7rem] font-bold">
          T
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold leading-tight">Thuisles</span>
          <span className="block truncate text-[0.68rem] text-white/50">Beheer</span>
        </span>
      </div>

      {/* Vakkiezer */}
      <div className="mb-3 hidden px-3 sm:block">
        <label className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-wide text-white/40">
          Vak
        </label>
        <select
          value={huidigVak.slug}
          onChange={(e) => router.push(`/admin/${e.target.value}/overzicht`)}
          className="w-full rounded-md border border-white/15 bg-beheer-balk-op px-2 py-1.5 text-sm text-white outline-none transition focus:border-viool"
        >
          {vakken.map((v) => (
            <option key={v.id} value={v.slug} className="text-beheer-inkt">
              {v.naam}
              {v.actief ? "" : " (verborgen)"}
            </option>
          ))}
        </select>
        <Link
          href="/admin/vakken"
          className="mt-1 block text-[0.68rem] text-white/45 transition hover:text-white/80"
        >
          Vakken beheren
        </Link>
      </div>

      <nav aria-label="Beheermenu" className="px-2">
        <ul className="flex flex-col gap-0.5">
          {ITEMS.map((item) => {
            const href = `/admin/${huidigVak.slug}/${item.deel}`;
            const actief = pad.startsWith(href);
            return (
              <li key={item.deel}>
                <Link
                  href={href}
                  aria-current={actief ? "page" : undefined}
                  title={item.label}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    actief
                      ? "bg-viool font-semibold text-white"
                      : "text-white/70 hover:bg-beheer-balk-op hover:text-white"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-[1.15rem] shrink-0"
                    aria-hidden="true"
                  >
                    <path d={item.pad} />
                  </svg>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/*
        Scholen en methodes horen niet bij één vak: het zijn de afstemmings-
        laag voor het hele platform. Daarom een eigen blok, los van de vakken.
      */}
      <div className="mt-4 px-2">
        <p className="mb-1 px-2.5 text-[0.62rem] font-semibold uppercase tracking-wide text-white/40">
          <span className="hidden sm:inline">Scholen &amp; methodes</span>
        </p>
        <ul className="flex flex-col gap-0.5">
          {ALGEMEEN.map((item) => {
            const actief = pad.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={actief ? "page" : undefined}
                  title={item.label}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    actief
                      ? "bg-viool font-semibold text-white"
                      : "text-white/70 hover:bg-beheer-balk-op hover:text-white"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-[1.15rem] shrink-0"
                    aria-hidden="true"
                  >
                    <path d={item.pad} />
                  </svg>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href="/admin/stemtest"
        className="mx-2 mt-auto rounded-md px-2.5 py-2 text-[0.72rem] text-white/45 transition-colors hover:bg-beheer-balk-op hover:text-white/80"
      >
        <span className="hidden sm:inline">Stemtest</span>
        <span className="sm:hidden">🔊</span>
      </Link>

      <Link
        href="/admin/foutpatronen"
        className="mx-2 rounded-md px-2.5 py-2 text-[0.72rem] text-white/45 transition-colors hover:bg-beheer-balk-op hover:text-white/80"
      >
        <span className="hidden sm:inline">Foutpatronen</span>
        <span className="sm:hidden">!</span>
      </Link>

      <Link
        href="/ouder"
        className="mx-2 rounded-md px-2.5 py-2 text-[0.72rem] text-white/45 transition-colors hover:bg-beheer-balk-op hover:text-white/80"
      >
        <span className="hidden sm:inline">Naar de ouderomgeving</span>
        <span className="sm:hidden">O</span>
      </Link>

      <Link
        href="/start"
        className="mx-2 mb-0 rounded-md px-2.5 py-2 text-[0.72rem] text-white/45 transition-colors hover:bg-beheer-balk-op hover:text-white/80"
      >
        <span className="hidden sm:inline">Naar de leeromgeving</span>
        <span className="sm:hidden">&larr;</span>
      </Link>
    </aside>
  );
}
