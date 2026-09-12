"use client";

/**
 * Beheer van vakken.
 *
 * Een vak is gewoon een rij in de database, net als een domein of een
 * leerdoel. Er komt dus geen code aan te pas om er een bij te maken: naam,
 * omschrijving, pictogram, wel of niet zichtbaar — klaar.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bewerkVak, nieuwVak, wegVak } from "@/app/admin/structuuracties";
import { Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Pictogram } from "@/components/kind/Pictogram";
import type { PictogramNaam, Vak } from "@/lib/types";

const PICTOGRAMKEUZE: PictogramNaam[] = [
  "vak-rekenen", "vak-taal", "vak-spelling", "vak-lezen", "vak-engels",
  "getalbegrip", "optellen", "tafels", "breuken", "meten", "tijd", "geld", "meetkunde",
];

function VakVelden({
  vak,
  bezig,
}: {
  vak?: Vak;
  bezig: boolean;
}) {
  const [icoon, setIcoon] = useState<PictogramNaam>(vak?.icoon ?? "vak-rekenen");

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="naam"
          defaultValue={vak?.naam}
          placeholder="Naam van het vak"
          required
          className={stijl.veld}
        />
        <input
          name="omschrijving"
          defaultValue={vak?.omschrijving}
          placeholder="Korte omschrijving voor het kind"
          className={stijl.veld}
        />
      </div>

      <div className="mt-2">
        <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
          Pictogram
        </span>
        <input type="hidden" name="icoon" value={icoon} />
        <div className="flex flex-wrap gap-1.5">
          {PICTOGRAMKEUZE.map((naam) => (
            <button
              key={naam}
              type="button"
              onClick={() => setIcoon(naam)}
              aria-label={naam}
              aria-pressed={icoon === naam}
              className={`grid size-9 place-items-center rounded-md border transition ${
                icoon === naam
                  ? "border-viool bg-viool/8 ring-2 ring-viool/25"
                  : "border-beheer-rand bg-white hover:border-viool/50"
              }`}
            >
              <Pictogram naam={naam} className="size-6" />
            </button>
          ))}
        </div>
      </div>

      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="actief"
          value="aan"
          defaultChecked={vak?.actief ?? false}
          className="size-4 accent-[#5b3fd6]"
        />
        Zichtbaar voor kinderen
      </label>

      <button type="submit" disabled={bezig} className={`${stijl.knop} mt-3`}>
        {vak ? "Opslaan" : "Vak aanmaken"}
      </button>
    </>
  );
}

export function VakkenBeheer({
  vakken,
  domeinenPerVak,
}: {
  vakken: Vak[];
  domeinenPerVak: Record<string, number>;
}) {
  const router = useRouter();
  const [bezig, start] = useTransition();
  const [open, setOpen] = useState<string | null>(null);
  const [fout, setFout] = useState<Record<string, string>>({});

  function doe(sleutel: string, actie: () => Promise<{ ok: boolean; fout?: string }>, na?: () => void) {
    setFout((f) => ({ ...f, [sleutel]: "" }));
    start(async () => {
      const u = await actie();
      if (!u.ok) {
        setFout((f) => ({ ...f, [sleutel]: u.fout ?? "Er ging iets mis." }));
        return;
      }
      na?.();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Alle vakken"
        bijschrift={`${vakken.length} vakken. Alleen zichtbare vakken kan een kind openen.`}
        geenVulling
      >
        {vakken.length === 0 ? (
          <Leeg tekst="Nog geen vakken." />
        ) : (
          <table className="w-full border-collapse text-sm">
            <Tabelkop kolommen={["", "Vak", "Webadres", "Domeinen", "Zichtbaar", ""]} />
            <tbody>
              {vakken.map((vak) => (
                <tr key={vak.id} className="border-b border-beheer-rand-zacht last:border-0">
                  {open === vak.id ? (
                    <td colSpan={6} className="bg-beheer-vlak/60 p-4">
                      <form
                        action={(data) => doe(vak.id, () => bewerkVak(data), () => setOpen(null))}
                      >
                        <input type="hidden" name="id" value={vak.id} />
                        <VakVelden vak={vak} bezig={bezig} />
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={() => setOpen(null)} className={stijl.knopStil}>
                            Annuleren
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              doe(vak.id, () => {
                                const d = new FormData();
                                d.set("id", vak.id);
                                return wegVak(d);
                              })
                            }
                            className="inline-flex h-8 items-center rounded-md px-2 text-xs text-beheer-zacht transition hover:text-roze"
                          >
                            Vak verwijderen
                          </button>
                        </div>
                        {fout[vak.id] && (
                          <p className="mt-2 rounded border border-roze/40 bg-roze-zacht px-2 py-1 text-xs font-medium text-roze">
                            {fout[vak.id]}
                          </p>
                        )}
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="w-10 py-2 pl-3">
                        <Pictogram naam={vak.icoon} className="size-6" />
                      </td>
                      <td className="px-3 py-2">
                        <span className="block font-medium">{vak.naam}</span>
                        {vak.omschrijving && (
                          <span className="block text-xs text-beheer-zacht">{vak.omschrijving}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-beheer-zacht">/{vak.slug}</td>
                      <td className="px-3 py-2 tabular-nums">{domeinenPerVak[vak.id] ?? 0}</td>
                      <td className="px-3 py-2">
                        {vak.actief ? (
                          <span className="rounded-full bg-groen-zacht px-2 py-0.5 text-xs font-semibold text-groen-diep">
                            Ja
                          </span>
                        ) : (
                          <span className="rounded-full bg-beheer-vlak px-2 py-0.5 text-xs font-medium text-beheer-zacht">
                            Nee
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-3 text-xs">
                          <Link href={`/admin/${vak.slug}/overzicht`} className={stijl.link}>
                            Openen
                          </Link>
                          <button type="button" onClick={() => setOpen(vak.id)} className={stijl.link}>
                            Bewerken
                          </button>
                        </div>
                        {fout[vak.id] && (
                          <p className="mt-1 text-right text-xs text-roze">{fout[vak.id]}</p>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paneel>

      <Paneel titel="Nieuw vak">
        <form action={(data) => doe("nieuw", () => nieuwVak(data))}>
          <VakVelden bezig={bezig} />
          {fout.nieuw && (
            <p className="mt-2 rounded border border-roze/40 bg-roze-zacht px-2 py-1 text-xs font-medium text-roze">
              {fout.nieuw}
            </p>
          )}
          <p className="mt-2 text-xs text-beheer-zacht">
            Het webadres wordt automatisch gemaakt uit de naam. Daarna maak je
            binnen het vak domeinen, onderwerpen en leerdoelen aan — er hoeft
            niets aan de code te gebeuren.
          </p>
        </form>
      </Paneel>
    </div>
  );
}
