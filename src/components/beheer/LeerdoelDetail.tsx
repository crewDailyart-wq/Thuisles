"use client";

/**
 * Detailscherm van één leerdoel: gegevens, bewerken, en de vragen eronder.
 * Zelfde opbouw als de schermen erboven.
 */

import Link from "next/link";
import { useState } from "react";
import { verwijder, wisselPublicatie } from "@/app/admin/acties";
import {
  bewerkLeerdoel,
  bewerkUitlegvorm,
  kopieerLeerdoel,
  wegLeerdoel,
} from "@/app/admin/structuuracties";
import { Gegevens, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Bewerkknop, Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import { UitlegVoorbeeld } from "@/components/beheer/UitlegVoorbeeld";
import { GROEPSVORMEN, VORM_OMSCHRIJVING } from "@/lib/generatoren/uitlegscript";
import type { VraagInContext } from "@/lib/vraagtypes";
import { STATUS_LABEL, VORM_LABEL, antwoordInTekst } from "@/lib/vraagtypes";
import type { Domein, Leerdoel, Subdomein, Vak } from "@/lib/types";

function kort(tekst: string, max = 64) {
  return tekst.length > max ? `${tekst.slice(0, max - 1)}…` : tekst;
}

export function LeerdoelDetail({
  vak,
  domein,
  subdomein,
  leerdoel,
  vragen,
  algemeenAantal,
}: {
  vak: Vak;
  domein: Domein;
  subdomein: Subdomein;
  leerdoel: Leerdoel;
  vragen: VraagInContext[];
  /** De algemene standaard, om te tonen wat 'leeg' betekent. */
  algemeenAantal: number;
}) {
  const { doe, bezig, fout, router } = useActie();
  const [bewerken, setBewerken] = useState(false);
  const [van, setVan] = useState<number>(leerdoel.groepVan);
  const [tot, setTot] = useState<number>(leerdoel.groepTot);

  const gepubliceerd = vragen.filter((v) => v.status === "gepubliceerd").length;
  // Een echte som van dit leerdoel, om de uitleg mee te kunnen bekijken.
  const voorbeeldSom = vragen.find((v) => v.somgegevens)?.somgegevens ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Gegevens"
        acties={<Bewerkknop open={bewerken} onWissel={() => setBewerken(!bewerken)} />}
      >
        <Gegevens
          rijen={[
            ["Code", <code key="c" className="font-mono text-xs">{leerdoel.code}</code>],
            ["Titel", leerdoel.titel],
            [
              "Groep",
              leerdoel.groepVan === leerdoel.groepTot
                ? `Groep ${leerdoel.groepVan}`
                : `Groep ${leerdoel.groepVan} tot en met ${leerdoel.groepTot}`,
            ],
            [
              "Vragen per oefensessie",
              /*
                Alleen ter informatie. Instellen doe je bij het sjabloon; daar
                zit je toch al als je aan de vragen van dit leerdoel werkt.
              */
              leerdoel.vragenPerSessie === null ? (
                <span key="p" className="text-beheer-zacht">
                  Volgt de algemene standaard ({algemeenAantal}) — aan te passen bij het
                  sjabloon
                </span>
              ) : (
                <span key="p">
                  {leerdoel.vragenPerSessie}{" "}
                  <span className="text-beheer-zacht">— aan te passen bij het sjabloon</span>
                </span>
              ),
            ],
            ["Plek", `${vak.naam} › ${domein.naam} › ${subdomein.naam}`],
            ["Vragen", `${vragen.length} (${gepubliceerd} gepubliceerd)`],
          ]}
        />

        {bewerken && (
          <form
            action={(data) => doe(() => bewerkLeerdoel(data), () => setBewerken(false))}
            className="mt-4 border-t border-beheer-rand pt-4"
          >
            <input type="hidden" name="id" value={leerdoel.id} />
            <div className="flex flex-wrap items-center gap-2">
              <input
                name="titel"
                defaultValue={leerdoel.titel}
                onKeyDown={opSneltoets}
                className={`${stijl.veld} min-w-[16rem] flex-1`}
              />
              <span className="text-xs text-beheer-zacht">groep</span>
              <select name="groepVan" value={van} onChange={(e) => setVan(Number(e.target.value))} className={stijl.veldSmal}>
                {[3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <span className="text-xs text-beheer-zacht">t/m</span>
              <select name="groepTot" value={tot} onChange={(e) => setTot(Number(e.target.value))} className={stijl.veldSmal}>
                {[3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <Fout tekst={fout} />
            <div className="mt-3 flex gap-2">
              <button type="submit" disabled={bezig} className={stijl.knop}>Opslaan</button>
              <button
                type="button"
                onClick={() =>
                  doe(() => {
                    const d = new FormData();
                    d.set("id", leerdoel.id);
                    return kopieerLeerdoel(d);
                  })
                }
                className={stijl.knopStil}
              >
                Kopiëren
              </button>
              <button
                type="button"
                onClick={() =>
                  doe(
                    () => {
                      const d = new FormData();
                      d.set("id", leerdoel.id);
                      return wegLeerdoel(d);
                    },
                    () => router.push(`/admin/${vak.slug}/structuur/${domein.slug}/${subdomein.slug}`),
                  )
                }
                className="inline-flex h-8 items-center rounded-md px-2 text-xs text-beheer-zacht transition hover:text-roze"
              >
                Leerdoel verwijderen
              </button>
            </div>
          </form>
        )}
      </Paneel>

      <Paneel
        titel="Uitleg bij een fout antwoord"
        bijschrift="Normaal volgt de vorm de groep van het kind. Hier kun je er voor dit leerdoel een andere kiezen."
      >
        <form
          action={(data) => doe(() => bewerkUitlegvorm(data))}
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="id" value={leerdoel.id} />
          <label className="block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Vorm van de uitleg
            </span>
            <select
              name="uitlegvorm"
              defaultValue={leerdoel.uitlegvorm ?? ""}
              className={stijl.veld}
            >
              <option value="">Volg de groep van het kind</option>
              {GROEPSVORMEN.map((v) => (
                <option key={v} value={v}>
                  Altijd: {VORM_OMSCHRIJVING[v]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={bezig} className={stijl.knop}>
            Opslaan
          </button>
        </form>

        {voorbeeldSom && (
          <div className="mt-3">
            <UitlegVoorbeeld soort={voorbeeldSom.soort} voorbeeld={voorbeeldSom} />
          </div>
        )}
      </Paneel>

      <Paneel
        titel="Vragen"
        bijschrift={`${vragen.length} bij dit leerdoel`}
        acties={
          <Link
            href={`/admin/${vak.slug}/vragen/nieuw?leerdoel=${leerdoel.id}`}
            className={stijl.knop}
          >
            + Nieuwe vraag
          </Link>
        }
        geenVulling
      >
        {vragen.length === 0 ? (
          <Leeg
            tekst="Nog geen vragen bij dit leerdoel."
            hint="Voeg er een toe, of upload er meerdere tegelijk via Uploaden."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <Tabelkop kolommen={["Vraag", "Type", "Groep", "Status", ""]} />
              <tbody>
                {vragen.map((v) => (
                  <tr key={v.id} className="border-b border-beheer-rand-zacht last:border-0 hover:bg-beheer-vlak/70">
                    <td className="max-w-[26rem] px-3 py-2">
                      <span className="block font-medium" title={v.vraagtekst}>{kort(v.vraagtekst)}</span>
                      <span className="mt-0.5 block text-xs text-beheer-zacht">
                        Antwoord: {antwoordInTekst(v)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="whitespace-nowrap rounded border border-beheer-rand bg-beheer-vlak px-1.5 py-0.5 text-xs font-medium">
                        {VORM_LABEL[v.vorm]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{v.groep}</td>
                    <td className="px-3 py-2">
                      <form action={wisselPublicatie}>
                        <input type="hidden" name="id" value={v.id} />
                        <button
                          type="submit"
                          title="Klik om te wisselen tussen concept en gepubliceerd"
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                            v.status === "gepubliceerd"
                              ? "bg-groen-zacht text-groen-diep hover:bg-groen/20"
                              : "bg-beheer-vlak text-beheer-zacht hover:bg-beheer-rand"
                          }`}
                        >
                          {STATUS_LABEL[v.status]}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form action={verwijder}>
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" className={`text-xs ${stijl.gevaar}`}>
                          Verwijderen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>
    </div>
  );
}
