/**
 * Kop van een oefenscherm: kruimelpad, titel en korte uitleg.
 *
 * Staat op een effen wit paneel, net als "Vakken" en "Jouw wereld" op het
 * startscherm. Dat is nodig omdat de landschap-achtergrond hier doorheen
 * loopt; zonder dat vlak zou de tekst er soms op wegvallen. Het vlak is
 * dekkend en klein gehouden: de illustratie eromheen blijft onaangetast.
 */

import Link from "next/link";
import { Icoon } from "@/components/kind/Icoon";

export type Kruimel = { label: string; href?: string };

export function Paginakop({
  kruimels,
  titel,
  uitleg,
}: {
  kruimels: Kruimel[];
  titel: string;
  uitleg: string;
}) {
  return (
    <div className="w-fit max-w-full rounded-groot border border-white/70 bg-kaart px-5 py-4 shadow-zacht">
      <nav aria-label="Kruimelpad" className="mb-1.5">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-bold text-inkt-zacht">
          {kruimels.map((kruimel, i) => (
            <li key={kruimel.label} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-inkt-zacht/60">
                  /
                </span>
              )}
              {kruimel.href ? (
                <Link
                  href={kruimel.href}
                  className="rounded px-0.5 underline-offset-2 hover:text-huisstijl hover:underline"
                >
                  {kruimel.label}
                </Link>
              ) : (
                <span className="text-inkt">{kruimel.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
        {titel}
      </h1>
      <p className="mt-1 max-w-xl text-sm font-semibold text-inkt-zacht">
        {uitleg}
      </p>
    </div>
  );
}

/** Terugknop, zodat een kind altijd een stap terug kan zonder de browserknop. */
export function TerugLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-kaart px-4 py-2 text-sm font-extrabold text-inkt shadow-zacht transition hover:bg-room"
    >
      <Icoon naam="pijl" className="size-4 rotate-180" />
      {label}
    </Link>
  );
}
