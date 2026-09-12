"use client";

/**
 * Donkere zijbalk met de hoofdnavigatie (vanaf grote schermen).
 * Op telefoon en kleine tablet valt de app terug op de balk onderaan.
 *
 * Opbouw van boven naar beneden:
 *   1. een marineblauw blok dat precies zo hoog is als logo plus navigatie;
 *   2. een zachte overgang van marineblauw naar volledig doorzichtig;
 *   3. een doorzichtig deel waar de landschap-achtergrond van de pagina
 *      doorheen komt, met onderaan het vosje en zijn tekstballon.
 *
 * Zo blijft er geen grote lege donkere kolom onder de navigatie staan.
 * Marineblauw is de basiskleur; paars wordt alleen nog als accent gebruikt,
 * bij het actieve menu-item en het beeldmerk.
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icoon, type IcoonNaam } from "@/components/kind/Icoon";

type NavItem = {
  href: "/start" | "/oefenen" | "/voortgang" | "/wereld" | "/maatje" | "/profiel";
  label: string;
  icoon: IcoonNaam;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/start", label: "Start", icoon: "start" },
  { href: "/oefenen", label: "Oefenen", icoon: "oefenen" },
  { href: "/voortgang", label: "Voortgang", icoon: "voortgang" },
  { href: "/wereld", label: "Wereld", icoon: "wereld" },
  { href: "/maatje", label: "Maatje", icoon: "maatje" },
  { href: "/profiel", label: "Profiel", icoon: "profiel" },
];

/** Eigen beeldmerk: een telraam-achtige vorm in een afgerond vierkant. */
function Beeldmerk() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-viool">
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <g stroke="white" strokeWidth={2} strokeLinecap="round">
          <path d="M5 7.5h14M5 12h14M5 16.5h14" />
        </g>
        <g fill="#f2bb2e">
          <circle cx={9} cy={7.5} r={2.4} />
          <circle cx={15} cy={12} r={2.4} />
          <circle cx={8} cy={16.5} r={2.4} />
        </g>
      </svg>
    </span>
  );
}

export function Zijbalk() {
  const pad = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-50 flex-col overflow-hidden lg:flex">
      {/* 1. Marineblauw blok: logo en navigatie dicht bij elkaar. */}
      <div className="bg-nacht px-2.5 pb-3 pt-4 text-white">
        <Link href="/start" className="mb-4 flex items-center gap-2.5 px-1.5">
          <Beeldmerk />
          <span className="min-w-0">
            <span className="block text-base font-extrabold leading-tight">
              Thuisles
            </span>
            <span className="block truncate text-[0.65rem] font-semibold text-white/55">
              Rekenen, in jouw tempo
            </span>
          </span>
        </Link>

        <nav aria-label="Hoofdmenu">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const actief = pad === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={actief ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-bold transition-colors ${
                      actief
                        ? "bg-viool text-white"
                        : "text-white/70 hover:bg-nacht-op hover:text-white"
                    }`}
                  >
                    <Icoon naam={item.icoon} className="size-[1.15rem] shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* 2. Zachte overgang naar doorzichtig, direct onder "Profiel". */}
      <div className="h-24 shrink-0 bg-[linear-gradient(180deg,#10203f_0%,rgba(16,32,63,0.55)_46%,rgba(16,32,63,0)_100%)]" />

      {/* 3. Doorzichtig deel: hier komt de landschap-achtergrond doorheen. */}
      <div className="flex min-h-0 flex-1 flex-col justify-end px-3 pb-4">
        <div className="relative mx-auto mb-1.5 w-fit max-w-full rounded-2xl rounded-br-md bg-white px-3 py-2 text-center shadow-op">
          <p className="text-[0.68rem] font-extrabold leading-snug text-inkt">
            Nog 1 oefening en je dag is compleet!
          </p>
          {/* puntje van de ballon, wijst naar het vosje */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 right-6 size-2.5 rotate-45 bg-white"
          />
        </div>

        {/*
          Het vosje bestaat uit twee lagen, uit `vos.png` gesneden: het lijf en
          los daarvan het opgeheven handje. Zo staat het vosje zelf stil en
          zwaait alleen de hand, draaiend om de pols.

          Alle maten staan in procenten van de onderliggende afbeelding. De
          twee lagen blijven daardoor op elke schermgrootte precies op elkaar
          staan, en niets vervormt: de breedte is vast en de hoogte volgt.
        */}
        <div className="relative mx-auto w-[8.25rem] drop-shadow-[0_10px_18px_rgba(10,23,48,0.35)]">
          <Image
            src="/vos-lijf.png"
            alt="Vos, het maatje van Thuisles"
            width={1086}
            height={1448}
            sizes="160px"
            className="h-auto w-full"
          />
          <Image
            src="/vos-arm.png"
            alt=""
            aria-hidden="true"
            width={231}
            height={268}
            sizes="40px"
            className="absolute w-[21.2707%] animate-vos-zwaai"
            style={{
              left: "73.4807%",
              top: "26.5884%",
              height: "auto",
              transformOrigin: "34.63% 88%",
            }}
          />
        </div>
      </div>
    </aside>
  );
}
