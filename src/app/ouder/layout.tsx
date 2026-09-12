/**
 * Schil van de ouderomgeving.
 *
 * Rustig, gestructureerd en zakelijk: wit en lichtgrijs, donkergrijze tekst,
 * paars alleen op knoppen en het actieve menu-item. Geen mascotte, geen
 * confetti, geen munten — die horen bij de kinderkant.
 *
 * De opbouw ligt vast (F1 uit de opdracht):
 *   - bovenaan altijd de kind-wisselaar, zodat zichtbaar blijft over wie het
 *     op deze pagina gaat;
 *   - daarnaast dezelfde vijf onderdelen, in dezelfde volgorde: op telefoon
 *     bovenaan, vanaf een groot scherm links.
 *
 * TIJDELIJK GEEN INLOG: wie de app opent is meteen de ouder. Dat staat met
 * zoveel woorden onderaan het scherm, want iets wat niemand ziet, wordt
 * vergeten. Zie `src/lib/auth/sessie.ts`.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Kindwisselaar } from "@/components/ouder/Kindwisselaar";
import { Navigatiebalk, Zijnavigatie } from "@/components/ouder/Oudernavigatie";
import { bekekenKind, vereisOuder } from "@/lib/auth/sessie";
import { haalKinderen } from "@/lib/data/kinderen";

export const metadata: Metadata = {
  title: "Thuisles voor ouders",
};

/** Deze schermen gaan over één kind en mogen niet worden voorgebakken. */
export const dynamic = "force-dynamic";

export default async function OuderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ouder = await vereisOuder();
  const kinderen = haalKinderen(ouder.id);
  const gekozen = await bekekenKind(ouder.id);

  return (
    <div className="font-zakelijk min-h-dvh bg-beheer-vlak text-beheer-inkt">
      <header className="sticky top-0 z-30 border-b border-beheer-rand bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <span className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-viool text-sm font-bold text-white">
              T
            </span>
            <span className="hidden text-sm sm:block">
              <span className="block font-semibold leading-tight">Thuisles</span>
              <span className="block text-xs text-beheer-zacht">Voor ouders</span>
            </span>
          </span>

          <div className="flex min-w-0 items-center gap-2">
            <Kindwisselaar kinderen={kinderen} gekozen={gekozen} />

            {/* Het apparaat doorgeven aan het kind. */}
            <Link
              href="/kies"
              title="Naar het oefenscherm"
              className="inline-flex min-h-11 items-center rounded-lg border border-beheer-rand px-3 text-xs font-medium transition hover:border-viool hover:text-viool"
            >
              Oefenen
            </Link>

          </div>
        </div>

        <Navigatiebalk />
      </header>

      <Zijnavigatie />

      <div className="lg:pl-60">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {children}

          {/*
            Zichtbare herinnering zolang er geen inlog is. Verdwijnt zodra
            Supabase Auth is aangesloten.
          */}
          <p className="border-t border-beheer-rand pt-4 text-xs leading-relaxed text-beheer-zacht">
            Thuisles staat nog niet online. Er is daarom geen inlog: iedereen
            die deze app opent, ziet deze gegevens.
          </p>
        </main>
      </div>
    </div>
  );
}
