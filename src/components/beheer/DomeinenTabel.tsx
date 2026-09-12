"use client";

/** Domeinen binnen een vak: tabel plus een formulier om er een toe te voegen. */

import Link from "next/link";
import { useRef, useState } from "react";
import { nieuwDomein } from "@/app/admin/structuuracties";
import { Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import type { Domein, Vak } from "@/lib/types";

export function DomeinenTabel({
  vak,
  domeinen,
  cijfers,
}: {
  vak: Vak;
  domeinen: Domein[];
  cijfers: Record<string, { subdomeinen: number; leerdoelen: number; vragen: number }>;
}) {
  const { doe, bezig, fout } = useActie();
  const [open, setOpen] = useState(false);
  const naamVeld = useRef<HTMLInputElement>(null);

  return (
    <>
      <Paneel
        titel="Domeinen"
        bijschrift={`${domeinen.length} in ${vak.naam}`}
        acties={
          <button type="button" onClick={() => setOpen(!open)} className={stijl.knop}>
            {open ? "Sluiten" : "+ Nieuw domein"}
          </button>
        }
        geenVulling
      >
        {domeinen.length === 0 ? (
          <Leeg tekst="Nog geen domeinen." hint="Voeg er hieronder een toe." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <Tabelkop
                kolommen={["Domein", "Onderwerpen", "Leerdoelen", "Vragen", "Zichtbaar", ""]}
              />
              <tbody>
                {domeinen.map((d) => {
                  const c = cijfers[d.id] ?? { subdomeinen: 0, leerdoelen: 0, vragen: 0 };
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/${vak.slug}/structuur/${d.slug}`}
                          className="font-medium transition hover:text-viool"
                        >
                          {d.naam}
                        </Link>
                        {d.omschrijving && (
                          <span className="block text-xs text-beheer-zacht">{d.omschrijving}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{c.subdomeinen}</td>
                      <td className="px-3 py-2 tabular-nums">{c.leerdoelen}</td>
                      <td className="px-3 py-2 tabular-nums">{c.vragen}</td>
                      <td className="px-3 py-2">
                        {d.actief ? (
                          <span className="text-xs text-beheer-zacht">Ja</span>
                        ) : (
                          <span className="rounded bg-beheer-vlak px-1.5 py-0.5 text-xs font-medium text-beheer-zacht">
                            Nee
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/admin/${vak.slug}/structuur/${d.slug}`}
                          className="text-xs text-beheer-zacht transition hover:text-viool"
                        >
                          Openen
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {open && (
          <form
            action={(data) =>
              doe(() => nieuwDomein(data), () => {
                if (naamVeld.current) naamVeld.current.value = "";
                naamVeld.current?.focus();
              })
            }
            className="border-t border-beheer-rand bg-beheer-vlak/60 p-4"
          >
            <input type="hidden" name="vakId" value={vak.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                ref={naamVeld}
                name="naam"
                autoFocus
                required
                placeholder="Naam van het domein"
                onKeyDown={opSneltoets}
                className={stijl.veld}
              />
              <input
                name="omschrijving"
                placeholder="Korte omschrijving"
                onKeyDown={opSneltoets}
                className={stijl.veld}
              />
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="actief"
                value="aan"
                defaultChecked
                className="size-4 accent-[#5b3fd6]"
              />
              Zichtbaar voor kinderen
            </label>
            <Fout tekst={fout} />
            <button type="submit" disabled={bezig} className={`${stijl.knop} mt-3`}>
              Toevoegen
            </button>
            <span className="ml-2 text-xs text-beheer-zacht">
              Webadres wordt automatisch gemaakt · Cmd/Ctrl + Enter
            </span>
          </form>
        )}
      </Paneel>
    </>
  );
}
