/**
 * Lege staat op de kinderkant: hier staat nog niets klaar.
 *
 * Nodig omdat een leeg vak geen fout is. Er is niets stuk; er is alleen nog
 * geen inhoud gemaakt. Zonder dit blok krijgt een kind een kop met een belofte
 * ("Kies zelf een onderdeel") en daaronder witruimte, en dat leest als een
 * kapotte pagina.
 *
 * Bewust geen datum en geen belofte over wanneer er wel iets komt: dat weten
 * we niet, en aan een kind moet je dat soort dingen niet toezeggen.
 */

import { Icoon } from "@/components/kind/Icoon";

export function NogNiets({
  titel = "Nog geen onderwerpen beschikbaar",
  tekst,
}: {
  titel?: string;
  tekst: string;
}) {
  return (
    <div className="w-full max-w-lg rounded-groot border border-dashed border-rand bg-kaart px-6 py-8 text-center shadow-zacht">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-room text-inkt-zacht">
        <Icoon naam="oefenen" className="size-7" />
      </span>
      <p className="mt-3 text-base font-extrabold">{titel}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm font-semibold text-inkt-zacht">
        {tekst}
      </p>
    </div>
  );
}
