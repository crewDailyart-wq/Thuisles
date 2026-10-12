/**
 * Het logo linksboven: de naam van de website, een geel sterretje en het
 * handgeschreven zinnetje met een streepje eronder.
 *
 * De naam komt uit `lib/merk.ts`; daar verandert hij later op één plek.
 */

import Link from "next/link";
import { MERKNAAM, MERKZIN } from "@/lib/merk";

export function Logo({ href = "/zappie" }: { href?: string }) {
  return (
    <Link href={href} className="relative inline-block leading-none text-white">
      <span className="av-titel relative inline-block text-[clamp(2rem,4.2vw,3.6rem)] drop-shadow-[0_4px_0_rgba(10,20,90,0.35)]">
        {MERKNAAM}
        {/* geel sterretje boven de laatste letter */}
        <svg viewBox="0 0 20 20" aria-hidden="true" className="absolute -right-3 -top-3 size-[0.45em]">
          <path d="M10 1l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 14.6 4.6 17.5l1.2-6L1.3 7.3l6.1-.7z" fill="var(--av-glitter)" />
        </svg>
      </span>
      <span className="av-hand mt-1 block -rotate-6 whitespace-nowrap pl-[18%] text-[clamp(1.1rem,1.9vw,1.7rem)] text-white/85">
        {MERKZIN}
        <svg viewBox="0 0 120 12" aria-hidden="true" className="-mt-0.5 block h-[0.45em] w-[70%]">
          <path d="M2 9 C40 3 80 2 118 5" fill="none" stroke="#9fb4ff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
    </Link>
  );
}
