/**
 * Schil van het scherm waar een kindprofiel wordt gekozen.
 *
 * Staat los van allebei de omgevingen: geen ouder-navigatie en geen
 * kinderkant. Wel dezelfde rustige stijl als de ouderomgeving, want het is de
 * ouder die het apparaat doorgeeft.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thuisles",
};

export const dynamic = "force-dynamic";

export default function ToegangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-zakelijk flex min-h-dvh flex-col bg-beheer-vlak text-beheer-inkt">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-viool text-sm font-bold text-white">
            T
          </span>
          <span className="text-sm">
            <span className="block font-semibold leading-tight">Thuisles</span>
            <span className="block text-xs text-beheer-zacht">
              Oefenen met rekenen, in je eigen tempo
            </span>
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
