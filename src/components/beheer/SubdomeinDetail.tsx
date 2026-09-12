"use client";

/**
 * Detailscherm van één onderwerp: gegevens, bewerken, en de leerdoelen
 * eronder — inclusief los toevoegen, meerdere tegelijk en kopiëren.
 */

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  bewerkLeerdoel,
  bewerkSubdomein,
  kopieerLeerdoel,
  nieuweLeerdoelenUitLijst,
  nieuwLeerdoel,
  wegLeerdoel,
  wegSubdomein,
} from "@/app/admin/structuuracties";
import { Gegevens, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Bewerkknop, Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import type { RegelUitslag } from "@/lib/data/structuur";
import type { Domein, Leerdoel, Subdomein, Vak } from "@/lib/types";

function Groep({ naam, waarde, onWijzig }: { naam: string; waarde: number; onWijzig: (n: number) => void }) {
  return (
    <select
      name={naam}
      value={waarde}
      onChange={(e) => onWijzig(Number(e.target.value))}
      className={stijl.veldSmal}
    >
      {[3, 4, 5, 6, 7, 8].map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  );
}

export function SubdomeinDetail({
  vak,
  domein,
  subdomein,
  leerdoelen,
  vragenPerLeerdoel,
}: {
  vak: Vak;
  domein: Domein;
  subdomein: Subdomein;
  leerdoelen: Leerdoel[];
  vragenPerLeerdoel: Record<string, number>;
}) {
  const { doe, bezig, fout, router } = useActie();
  const [bewerken, setBewerken] = useState(false);
  const [modus, setModus] = useState<"een" | "lijst">("een");
  const [bewerktDoel, setBewerktDoel] = useState<string | null>(null);
  const [van, setVan] = useState<number>(leerdoelen[0]?.groepVan ?? 4);
  const [tot, setTot] = useState<number>(leerdoelen[0]?.groepTot ?? 5);
  const [lijstUitslag, setLijstUitslag] = useState<RegelUitslag[] | null>(null);
  const [bezigLijst, startLijst] = useTransition();

  const titelVeld = useRef<HTMLInputElement>(null);
  const lijstVeld = useRef<HTMLTextAreaElement>(null);

  const basis = `/admin/${vak.slug}/structuur/${domein.slug}/${subdomein.slug}`;

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Gegevens"
        acties={<Bewerkknop open={bewerken} onWissel={() => setBewerken(!bewerken)} />}
      >
        <Gegevens
          rijen={[
            ["Naam", subdomein.naam],
            ["Webadres", <code key="s" className="font-mono text-xs">/{subdomein.slug}</code>],
            ["Omschrijving", subdomein.omschrijving || <span className="text-beheer-zacht">—</span>],
            ["Domein", domein.naam],
            ["Leerdoelen", leerdoelen.length],
          ]}
        />

        {bewerken && (
          <form
            action={(data) => doe(() => bewerkSubdomein(data), () => setBewerken(false))}
            className="mt-4 border-t border-beheer-rand pt-4"
          >
            <input type="hidden" name="id" value={subdomein.id} />
            <input type="hidden" name="icoon" value={subdomein.icoon} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input name="naam" defaultValue={subdomein.naam} onKeyDown={opSneltoets} className={stijl.veld} />
              <input
                name="omschrijving"
                defaultValue={subdomein.omschrijving}
                placeholder="Korte omschrijving"
                onKeyDown={opSneltoets}
                className={stijl.veld}
              />
            </div>
            <Fout tekst={fout} />
            <div className="mt-3 flex gap-2">
              <button type="submit" disabled={bezig} className={stijl.knop}>Opslaan</button>
              <button
                type="button"
                onClick={() =>
                  doe(() => {
                    const d = new FormData();
                    d.set("id", subdomein.id);
                    return wegSubdomein(d);
                  })
                }
                className="inline-flex h-8 items-center rounded-md px-2 text-xs text-beheer-zacht transition hover:text-roze"
              >
                Onderwerp verwijderen
              </button>
            </div>
          </form>
        )}
      </Paneel>

      <Paneel titel="Leerdoelen" bijschrift={`${leerdoelen.length} binnen ${subdomein.naam}`} geenVulling>
        {leerdoelen.length === 0 ? (
          <Leeg tekst="Nog geen leerdoelen." hint="Voeg ze hieronder toe." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <Tabelkop kolommen={["Code", "Leerdoel", "Groep", "Vragen", ""]} />
              <tbody>
                {leerdoelen.map((doel) => (
                  <tr key={doel.id} className="border-b border-beheer-rand-zacht last:border-0">
                    {bewerktDoel === doel.id ? (
                      <td colSpan={5} className="bg-beheer-vlak/60 p-3">
                        <form action={(data) => doe(() => bewerkLeerdoel(data), () => setBewerktDoel(null))}>
                          <input type="hidden" name="id" value={doel.id} />
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              name="titel"
                              defaultValue={doel.titel}
                              onKeyDown={opSneltoets}
                              className={`${stijl.veld} min-w-[16rem] flex-1`}
                            />
                            <span className="text-xs text-beheer-zacht">groep</span>
                            <Groep naam="groepVan" waarde={van} onWijzig={setVan} />
                            <span className="text-xs text-beheer-zacht">t/m</span>
                            <Groep naam="groepTot" waarde={tot} onWijzig={setTot} />
                            <button type="submit" disabled={bezig} className={stijl.knop}>Opslaan</button>
                            <button type="button" onClick={() => setBewerktDoel(null)} className={stijl.knopStil}>
                              Annuleren
                            </button>
                          </div>
                          <Fout tekst={fout} />
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-beheer-zacht">
                          {doel.code}
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`${basis}/${doel.id}`} className="font-medium transition hover:text-viool">
                            {doel.titel}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                          {doel.groepVan === doel.groepTot ? doel.groepVan : `${doel.groepVan}–${doel.groepTot}`}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {(vragenPerLeerdoel[doel.id] ?? 0) === 0 ? (
                            <span className="rounded bg-oranje-zacht px-1.5 py-0.5 text-xs font-semibold text-oranje-diep">
                              0
                            </span>
                          ) : (
                            vragenPerLeerdoel[doel.id]
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-3 text-xs">
                            <Link href={`${basis}/${doel.id}`} className={stijl.link}>Openen</Link>
                            <button
                              type="button"
                              onClick={() => {
                                setVan(doel.groepVan);
                                setTot(doel.groepTot);
                                setBewerktDoel(doel.id);
                              }}
                              className={stijl.link}
                            >
                              Bewerken
                            </button>
                            <button
                              type="button"
                              title="Maak een kopie als startpunt"
                              onClick={() =>
                                doe(() => {
                                  const d = new FormData();
                                  d.set("id", doel.id);
                                  return kopieerLeerdoel(d);
                                })
                              }
                              className={stijl.link}
                            >
                              Kopiëren
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                doe(() => {
                                  const d = new FormData();
                                  d.set("id", doel.id);
                                  return wegLeerdoel(d);
                                })
                              }
                              className={stijl.gevaar}
                            >
                              Verwijderen
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {fout && !bewerken && bewerktDoel === null && (
          <div className="px-4 pb-3"><Fout tekst={fout} /></div>
        )}
      </Paneel>

      {/* Toevoegen: los of als lijst */}
      <div className="overflow-hidden rounded-lg border border-beheer-rand bg-beheer-kaart">
        <div className="flex gap-1 border-b border-beheer-rand px-3 pt-2.5">
          {([["een", "Eén leerdoel"], ["lijst", "Meerdere tegelijk"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setModus(k)}
              className={`rounded-t-md px-3 py-1.5 text-xs font-semibold transition ${
                modus === k ? "bg-viool text-white" : "text-beheer-zacht hover:text-viool"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {modus === "een" ? (
            <form
              action={(data) =>
                doe(() => nieuwLeerdoel(data), () => {
                  if (titelVeld.current) titelVeld.current.value = "";
                  titelVeld.current?.focus();
                })
              }
            >
              <input type="hidden" name="subdomeinId" value={subdomein.id} />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={titelVeld}
                  name="titel"
                  required
                  placeholder="Titel van het leerdoel"
                  onKeyDown={opSneltoets}
                  className={`${stijl.veld} min-w-[16rem] flex-1`}
                />
                <span className="text-xs text-beheer-zacht">groep</span>
                <Groep naam="groepVan" waarde={van} onWijzig={setVan} />
                <span className="text-xs text-beheer-zacht">t/m</span>
                <Groep naam="groepTot" waarde={tot} onWijzig={setTot} />
                <button type="submit" disabled={bezig} className={stijl.knop}>Toevoegen</button>
              </div>
              <p className="mt-1.5 text-xs text-beheer-zacht">
                Code en webadres worden automatisch gemaakt. Na opslaan staat de
                cursor meteen klaar voor de volgende — of gebruik Cmd/Ctrl + Enter.
              </p>
              <Fout tekst={fout} />
            </form>
          ) : (
            <form
              action={(data) =>
                startLijst(async () => {
                  const u = await nieuweLeerdoelenUitLijst(data);
                  setLijstUitslag(u);
                  if (u.some((r) => r.gelukt)) {
                    if (lijstVeld.current) lijstVeld.current.value = "";
                    router.refresh();
                  }
                })
              }
            >
              <input type="hidden" name="subdomeinId" value={subdomein.id} />
              <p className="mb-2 text-xs text-beheer-zacht">
                Eén leerdoel per regel. Een afwijkende groep zet je erachter met
                een streepje:{" "}
                <code className="rounded bg-beheer-vlak px-1 font-mono">
                  Tafels van 7, 8 en 9 | 5-6
                </code>
              </p>
              <textarea
                ref={lijstVeld}
                name="lijst"
                rows={6}
                placeholder={"Eerste leerdoel\nTweede leerdoel\nDerde leerdoel | 6-7"}
                className={`${stijl.veld} font-mono text-xs`}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-beheer-zacht">Standaard groep</span>
                <Groep naam="groepVan" waarde={van} onWijzig={setVan} />
                <span className="text-xs text-beheer-zacht">t/m</span>
                <Groep naam="groepTot" waarde={tot} onWijzig={setTot} />
                <button type="submit" disabled={bezigLijst} className={stijl.knop}>
                  {bezigLijst ? "Bezig…" : "Alles toevoegen"}
                </button>
              </div>

              {lijstUitslag && (
                <ul className="mt-3 divide-y divide-beheer-rand-zacht rounded-md border border-beheer-rand">
                  {lijstUitslag.map((r, i) => (
                    <li key={`${r.regel}-${i}`} className="flex items-start gap-2 px-3 py-1.5">
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-white ${
                          r.gelukt ? "bg-groen" : "bg-roze"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" className="size-2.5">
                          {r.gelukt ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6 6 18" />}
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 text-xs">
                        {r.gelukt && r.code && (
                          <span className="mr-1.5 font-mono text-beheer-zacht">{r.code}</span>
                        )}
                        {r.regel}
                        {r.fout && <span className="block text-roze">{r.fout}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
