/**
 * Vakkenmenu als rij ronde tegels op een effen wit paneel.
 *
 * Dit is het eerste blok van het startscherm en daarmee het eerste wat een
 * kind ziet. Daarom zijn de tegels groot: kiezen waar je mee aan de slag gaat
 * is de eerste handeling, en die moet je niet hoeven zoeken. Het blok is zo
 * gemaakt dat het bij elke telefoonmaat helemaal in beeld staat zonder
 * scrollen — vandaar dat de tegels op de smalste schermen een maatje kleiner
 * zijn, zodat er drie naast elkaar passen en het bij twee rijen blijft.
 *
 * Dat paneel is er niet voor de sier: het landschap op de achtergrond loopt
 * hier doorheen, en zonder die laag zouden de namen van de vakken op sommige
 * schermbreedtes over een berg of het kasteel vallen. Het paneel is precies zo
 * breed als de tegels zelf, zodat het landschap ernaast in beeld blijft.
 *
 * Alleen Rekenen is actief. De andere vakken zijn zichtbaar zodat een kind
 * ziet dat er meer aankomt, maar dragen een slotje en zijn niet aanklikbaar.
 * Er wordt geen datum beloofd.
 */

import Link from "next/link";
import { Icoon } from "@/components/kind/Icoon";
import { Pictogram } from "@/components/kind/Pictogram";
import type { Vak } from "@/lib/types";

export function Vakkenmenu({ vakken }: { vakken: Vak[] }) {
  return (
    <section
      aria-labelledby="kop-vakken"
      className="w-fit max-w-full rounded-groot border border-white/70 bg-kaart p-4 shadow-zacht sm:p-6"
    >
      <h2 id="kop-vakken" className="mb-4 text-xl font-extrabold sm:text-2xl">
        Vakken
      </h2>

      <ul className="flex flex-wrap gap-3 sm:gap-6">
        {vakken.map((vak) => (
          <li key={vak.id} className="w-[4.75rem] text-center sm:w-28">
            {vak.actief ? (
              // Actief vak: klikken opent de domeinen binnen dat vak.
              <Link
                href={`/oefenen/${vak.slug}`}
                aria-current="true"
                className="group block"
              >
                <span className="mx-auto grid size-[4.5rem] place-items-center rounded-full bg-kaart shadow-op ring-4 ring-huisstijl transition group-hover:-translate-y-0.5 sm:size-26">
                  <Pictogram naam={vak.icoon} className="size-10 sm:size-14" />
                </span>
                <span className="mt-2 block text-sm font-bold leading-tight text-inkt sm:text-base">
                  {vak.naam}
                </span>
              </Link>
            ) : (
              <>
                <span className="relative mx-auto grid size-[4.5rem] place-items-center rounded-full border border-rand bg-kaart opacity-55 shadow-zacht grayscale sm:size-26">
                  <Pictogram naam={vak.icoon} className="size-10 sm:size-14" />
                  <span className="absolute -bottom-0.5 -right-0.5 grid size-7 place-items-center rounded-full border-2 border-room bg-rand text-inkt-zacht">
                    <Icoon naam="slot" className="size-3.5" />
                  </span>
                </span>
                <span className="mt-2 block text-sm font-bold leading-tight text-inkt-zacht sm:text-base">
                  {vak.naam}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
