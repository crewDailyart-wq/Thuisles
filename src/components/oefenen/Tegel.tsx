/**
 * Klikbare tegel voor een domein of onderwerp.
 *
 * Eén component voor beide niveaus, zodat de navigatie er op elk niveau
 * hetzelfde uitziet. Een tegel zonder `href` is nog niet te openen en wordt
 * gedempt getoond met een slotje — nooit als een dode knop die niets doet.
 */

import Link from "next/link";
import { Icoon } from "@/components/kind/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import { Voortgangsbalk } from "@/components/oefenen/Voortgangsbalk";
import type { PictogramNaam } from "@/lib/types";

type Props = {
  href?: string;
  icoon: PictogramNaam;
  titel: string;
  omschrijving: string;
  beheerst?: number;
  totaal?: number;
  /** Tekst in plaats van de voortgang, bijv. bij een gesloten domein. */
  notitie?: string;
};

export function Tegel({
  href,
  icoon,
  titel,
  omschrijving,
  beheerst,
  totaal,
  notitie,
}: Props) {
  const dicht = !href;

  const inhoud = (
    <>
      <span className="flex items-start gap-3">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-room shadow-zacht ${
            dicht ? "opacity-55 grayscale" : ""
          }`}
        >
          <Pictogram naam={icoon} className="size-8" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-base font-extrabold leading-tight ${
              dicht ? "text-inkt-zacht" : ""
            }`}
          >
            {titel}
          </span>
          <span className="mt-0.5 block text-xs font-semibold leading-snug text-inkt-zacht">
            {omschrijving}
          </span>
        </span>
        {href ? (
          <Icoon naam="pijl" className="mt-1 size-4 shrink-0 text-viool" />
        ) : (
          <Icoon naam="slot" className="mt-1 size-4 shrink-0 text-inkt-zacht" />
        )}
      </span>

      <span className="mt-auto block pt-4">
        {notitie ? (
          <span className="block text-[0.7rem] font-bold text-inkt-zacht">
            {notitie}
          </span>
        ) : (
          <Voortgangsbalk beheerst={beheerst ?? 0} totaal={totaal ?? 0} />
        )}
      </span>
    </>
  );

  const basis =
    "flex h-full flex-col rounded-groot border bg-kaart p-4 text-left shadow-zacht";

  if (dicht) {
    return (
      <div className={`${basis} border-rand`} aria-disabled="true">
        {inhoud}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${basis} border-rand transition hover:-translate-y-0.5 hover:border-viool hover:shadow-op`}
    >
      {inhoud}
    </Link>
  );
}
