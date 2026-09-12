"use client";

/**
 * De kind-wisselaar, bovenaan de ouderomgeving.
 *
 * Alles op elke pagina gaat over het gekozen kind. Daarom staat de naam altijd
 * in beeld, ook tijdens het scrollen. Zijn er meerdere kinderen, dan klapt dit
 * een lijst open; is er één kind, dan is het gewoon de naam.
 *
 * Wisselen gaat via de server: daar wordt gecontroleerd of het gekozen profiel
 * wel bij deze ouder hoort.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bekijkAnderKind } from "@/app/ouder/acties";
import { Icoon } from "@/components/ouder/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import type { Kind } from "@/lib/types";

function Avatar({ kind }: { kind: Kind }) {
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full bg-viool-zacht"
      aria-hidden="true"
    >
      <Pictogram naam={kind.avatar} className="size-5" />
    </span>
  );
}

function Naam({ kind }: { kind: Kind }) {
  return (
    <span className="min-w-0 text-sm">
      <span className="block truncate font-semibold leading-tight">
        {kind.roepnaam}
      </span>
      <span className="block text-xs text-beheer-zacht">Groep {kind.groep}</span>
    </span>
  );
}

export function Kindwisselaar({
  kinderen,
  gekozen,
}: {
  kinderen: Kind[];
  gekozen: Kind | null;
}) {
  const [open, setOpen] = useState(false);
  const vak = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function buiten(e: MouseEvent) {
      if (!vak.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", buiten);
    return () => document.removeEventListener("mousedown", buiten);
  }, [open]);

  // Nog geen kind: dan is er niets te wisselen, wel iets te doen.
  if (!gekozen) {
    return (
      <Link
        href="/ouder/instellingen"
        className="inline-flex min-h-11 items-center rounded-lg border border-beheer-rand bg-white px-3 text-sm font-medium transition hover:border-viool"
      >
        Kind toevoegen
      </Link>
    );
  }

  if (kinderen.length === 1) {
    return (
      <div className="flex items-center gap-2.5">
        <Avatar kind={gekozen} />
        <Naam kind={gekozen} />
      </div>
    );
  }

  return (
    <div ref={vak} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2.5 rounded-lg border border-beheer-rand bg-white px-2.5 text-left transition hover:border-viool"
      >
        <Avatar kind={gekozen} />
        <Naam kind={gekozen} />
        <Icoon
          naam="uitklap"
          className={`size-4 shrink-0 text-beheer-zacht transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-60 overflow-hidden rounded-lg border border-beheer-rand bg-white py-1 shadow-lg"
        >
          <ul>
            {kinderen.map((k) => (
              <li key={k.id}>
                <form action={bekijkAnderKind} onSubmit={() => setOpen(false)}>
                  <input type="hidden" name="kindId" value={k.id} />
                  <button
                    type="submit"
                    className={`flex min-h-12 w-full items-center gap-2.5 px-3 text-left transition hover:bg-beheer-vlak ${
                      k.id === gekozen.id ? "bg-viool-zacht/50" : ""
                    }`}
                  >
                    <Avatar kind={k} />
                    <Naam kind={k} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
