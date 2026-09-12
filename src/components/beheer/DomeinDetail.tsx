"use client";

/**
 * Detailscherm van één domein: gegevens, bewerken, en de onderwerpen eronder.
 * Zelfde opbouw als het onderwerp- en leerdoelscherm.
 */

import Link from "next/link";
import { useRef, useState } from "react";
import { bewerkDomein, nieuwSubdomein, wegDomein } from "@/app/admin/structuuracties";
import { Gegevens, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Bewerkknop, Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import type { Domein, Subdomein, Vak } from "@/lib/types";

export function DomeinDetail({
  vak,
  domein,
  subdomeinen,
  cijfers,
}: {
  vak: Vak;
  domein: Domein;
  subdomeinen: Subdomein[];
  cijfers: Record<string, { leerdoelen: number; vragen: number; leeg: number }>;
}) {
  const { doe, bezig, fout } = useActie();
  const [bewerken, setBewerken] = useState(false);
  const [toevoegen, setToevoegen] = useState(false);
  const naamVeld = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Gegevens"
        acties={<Bewerkknop open={bewerken} onWissel={() => setBewerken(!bewerken)} />}
      >
        <Gegevens
          rijen={[
            ["Naam", domein.naam],
            ["Webadres", <code key="s" className="font-mono text-xs">/{domein.slug}</code>],
            ["Omschrijving", domein.omschrijving || <span className="text-beheer-zacht">—</span>],
            ["Zichtbaar voor kinderen", domein.actief ? "Ja" : "Nee"],
            ["Onderwerpen", subdomeinen.length],
          ]}
        />

        {bewerken && (
          <form
            action={(data) => doe(() => bewerkDomein(data), () => setBewerken(false))}
            className="mt-4 border-t border-beheer-rand pt-4"
          >
            <input type="hidden" name="id" value={domein.id} />
            <input type="hidden" name="icoon" value={domein.icoon} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                name="naam"
                defaultValue={domein.naam}
                onKeyDown={opSneltoets}
                className={stijl.veld}
              />
              <input
                name="omschrijving"
                defaultValue={domein.omschrijving}
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
                defaultChecked={domein.actief}
                className="size-4 accent-[#5b3fd6]"
              />
              Zichtbaar voor kinderen
            </label>
            <Fout tekst={fout} />
            <div className="mt-3 flex gap-2">
              <button type="submit" disabled={bezig} className={stijl.knop}>
                Opslaan
              </button>
              <button
                type="button"
                onClick={() =>
                  doe(() => {
                    const d = new FormData();
                    d.set("id", domein.id);
                    return wegDomein(d);
                  })
                }
                className="inline-flex h-8 items-center rounded-md px-2 text-xs text-beheer-zacht transition hover:text-roze"
              >
                Domein verwijderen
              </button>
            </div>
          </form>
        )}
      </Paneel>

      <Paneel
        titel="Onderwerpen"
        bijschrift={`${subdomeinen.length} binnen ${domein.naam}`}
        acties={
          <button type="button" onClick={() => setToevoegen(!toevoegen)} className={stijl.knop}>
            {toevoegen ? "Sluiten" : "+ Nieuw onderwerp"}
          </button>
        }
        geenVulling
      >
        {subdomeinen.length === 0 ? (
          <Leeg tekst="Nog geen onderwerpen." hint="Voeg er hieronder een toe." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <Tabelkop kolommen={["Onderwerp", "Leerdoelen", "Vragen", "Zonder vragen", ""]} />
              <tbody>
                {subdomeinen.map((s) => {
                  const c = cijfers[s.id] ?? { leerdoelen: 0, vragen: 0, leeg: 0 };
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/${vak.slug}/structuur/${domein.slug}/${s.slug}`}
                          className="font-medium transition hover:text-viool"
                        >
                          {s.naam}
                        </Link>
                        {s.omschrijving && (
                          <span className="block text-xs text-beheer-zacht">{s.omschrijving}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{c.leerdoelen}</td>
                      <td className="px-3 py-2 tabular-nums">{c.vragen}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {c.leeg > 0 ? (
                          <span className="rounded bg-oranje-zacht px-1.5 py-0.5 text-xs font-semibold text-oranje-diep">
                            {c.leeg}
                          </span>
                        ) : (
                          <span className="text-beheer-zacht">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/admin/${vak.slug}/structuur/${domein.slug}/${s.slug}`}
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

        {toevoegen && (
          <form
            action={(data) =>
              doe(() => nieuwSubdomein(data), () => {
                if (naamVeld.current) naamVeld.current.value = "";
                naamVeld.current?.focus();
              })
            }
            className="border-t border-beheer-rand bg-beheer-vlak/60 p-4"
          >
            <input type="hidden" name="domeinId" value={domein.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                ref={naamVeld}
                name="naam"
                autoFocus
                required
                placeholder="Naam van het onderwerp"
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
            <Fout tekst={fout} />
            <button type="submit" disabled={bezig} className={`${stijl.knop} mt-3`}>
              Toevoegen
            </button>
            <span className="ml-2 text-xs text-beheer-zacht">
              Blijft open voor de volgende · Cmd/Ctrl + Enter
            </span>
          </form>
        )}
      </Paneel>
    </div>
  );
}
