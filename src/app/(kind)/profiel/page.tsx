/**
 * Profiel van het kind.
 *
 * Het scherm zelf wordt later gebouwd. Wat er nu al staat: de knop waarmee
 * het apparaat terug naar de ouder gaat. Zonder die knop kan een kind op een
 * tablet niet terug, en de ouder moet er altijd bij kunnen.
 *
 * Uitloggen doet dit niet: de ouder blijft ingelogd, alleen het kindprofiel
 * wordt losgelaten.
 */

import { verlaatProfiel } from "@/app/(toegang)/acties";
import { haalHuidigKind } from "@/lib/data/queries";

export default async function Pagina() {
  const kind = await haalHuidigKind();

  return (
    <div className="mx-auto max-w-md rounded-kaart border border-dashed border-rand bg-kaart p-10 text-center shadow-zacht">
      <p className="text-5xl" aria-hidden="true">
        🦊
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">Hoi {kind.roepnaam}!</h1>
      <p className="mt-2 text-sm font-semibold text-inkt-zacht">
        Hier pas je straks je avatar en instellingen aan.
      </p>
      <p className="mt-6 inline-block rounded-full bg-huisstijl-zacht px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-huisstijl-diep">
        Dit scherm bouwen we hierna
      </p>

      <form action={verlaatProfiel} className="mt-8 border-t border-rand pt-6">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-rand bg-white px-5 text-sm font-bold text-inkt-zacht transition hover:border-huisstijl hover:text-huisstijl"
        >
          Klaar met oefenen — terug naar papa of mama
        </button>
      </form>
    </div>
  );
}
