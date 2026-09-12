/**
 * Schil van de beheeromgeving.
 *
 * Staat volledig los van de kinderkant: geen landschap, geen ronde kaarten,
 * geen illustraties. Wit en lichtgrijs, kleinere letters, meer informatie per
 * scherm. Paars komt alleen terug op knoppen en actieve elementen.
 *
 * De zijbalk leest zelf uit het webadres welk vak actief is. Staat er geen vak
 * in (bijvoorbeeld op het scherm "Vakken beheren"), dan valt hij terug op het
 * eerste actieve vak.
 */

import type { Metadata } from "next";
import { Beheerbalk } from "@/components/beheer/Beheerbalk";
import { haalVakken } from "@/lib/data/structuur";

export const metadata: Metadata = {
  title: "Thuisles beheer",
};

/** De beheerschermen tonen live gegevens en mogen niet worden voorgebakken. */
export const dynamic = "force-dynamic";

export default function BeheerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // min-h-dvh in plaats van min-h-full: anders stopt het grijze vlak bij het
  // einde van de inhoud en schemert de achtergrond van de kinderkant erdoor.
  return (
    <div className="font-zakelijk min-h-dvh bg-beheer-vlak text-beheer-inkt">
      <Beheerbalk vakken={haalVakken()} />
      <div className="pl-14 sm:pl-56">
        <main className="mx-auto w-full max-w-[86rem] px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
