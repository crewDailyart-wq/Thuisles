"use client";

/**
 * Navigatiebalk voor telefoon en kleine tablet.
 *
 * Op grote schermen neemt de donkere zijbalk deze rol over; daar is deze balk
 * verborgen. Grote raakvlakken (ruim 44px) omdat jonge kinderen minder
 * precies tikken.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icoon } from "@/components/kind/Icoon";
import { NAV_ITEMS } from "@/components/kind/Zijbalk";

export function Onderbalk() {
  const pad = usePathname();

  return (
    <nav
      aria-label="Hoofdmenu"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between gap-1 rounded-[1.75rem] border border-rand bg-kaart p-1.5 shadow-op">
        {NAV_ITEMS.map((item) => {
          const actief = pad === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={actief ? "page" : undefined}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[1.35rem] px-1 py-1.5 text-[0.68rem] font-bold transition-colors ${
                  actief
                    ? "bg-huisstijl-diep text-white"
                    : "text-inkt-zacht hover:bg-huisstijl-zacht hover:text-huisstijl-diep"
                }`}
              >
                <Icoon naam={item.icoon} className="size-[1.35rem]" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
