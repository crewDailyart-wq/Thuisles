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
  verhuisLeerdoel,
  wegLeerdoel,
} from "@/app/admin/structuuracties";
import { Gegevens, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Bewerkknop, Fout, opSneltoets, useActie } from "@/components/beheer/RegelFormulier";
import { UitlegVoorbeeld } from "@/components/beheer/UitlegVoorbeeld";
import { Moeilijkheid } from "@/components/Moeilijkheid";
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
  onderwerpen = [],
  algemeenAantal,
}: {
  vak: Vak;
  domein: Domein;
  subdomein: Subdomein;
  leerdoel: Leerdoel;
  vragen: VraagInContext[];
  /** Alle onderwerpen van dit vak, om het leerdoel naartoe te verhuizen. */
  onderwerpen?: { id: string; naam: string; domeinNaam: string }[];
  /** De algemene standaard, om te tonen wat 'leeg' betekent. */
  algemeenAantal: number;
}) {
  const { doe, bezig, fout, router } = useActie();
  const [bewerken, setBewerken] = useState(false);
  const [naarOnderwerp, setNaarOnderwerp] = useState("");
  const [moeilijk, setMoeilijk] = useState<string>(
    leerdoel.moeilijkheid === null ? "" : String(leerdoel.moeilijkheid),
  );
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
            [
              "Naam in beheer",
              leerdoel.beheernaam ?? (
                <span key="b" className="text-beheer-zacht">
                  Leeg — dan geldt de titel hieronder
                </span>
              ),
            ],
            ["Titel voor het kind", leerdoel.titel],
            [
              "Moeilijkheid",
              leerdoel.moeilijkheid === null ? (
                <span key="m" className="text-beheer-zacht">
                  Niet ingevuld — het kind ziet dan geen bolletjes
                </span>
              ) : (
                <Moeilijkheid key="m" waarde={leerdoel.moeilijkheid} maat="ruim" />
              ),
            ],
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

            {/*
              Twee namen onder elkaar. De bovenste is van jou, de onderste is
              wat een kind leest. Ze staan met opzet in deze volgorde: in het
              beheer kijk je naar de eerste.
            */}
            <label className="mb-2 block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                Naam in beheer
              </span>
              <input
                name="beheernaam"
                defaultValue={leerdoel.beheernaam ?? ""}
                placeholder="Leeg laten = de titel hieronder"
                onKeyDown={opSneltoets}
                className={`${stijl.veld} w-full`}
              />
              <span className="mt-1 block text-xs text-beheer-zacht">
                Alleen jij ziet deze naam. Hij moet uniek zijn binnen dit onderwerp;
                daardoor mogen twee leerdoelen voor een kind wél hetzelfde heten.
              </span>
            </label>

            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Titel voor het kind
            </span>
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

            {/*
              De moeilijkheidsgraad hoort bij het leerdoel en niet bij het
              sjabloon: het gaat om hoe moeilijk de vaardigheid is, niet om hoe
              de sommen gemaakt worden.
            */}
            <label className="mt-3 block">
              <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                Moeilijkheid
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  name="moeilijkheid"
                  value={moeilijk}
                  onChange={(e) => setMoeilijk(e.target.value)}
                  className={stijl.veld}
                >
                  <option value="">Niet ingevuld</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} van 5
                    </option>
                  ))}
                </select>
                <Moeilijkheid waarde={moeilijk === "" ? null : Number(moeilijk)} maat="ruim" />
              </div>
              <span className="mt-1 block text-xs text-beheer-zacht">
                Het kind ziet dit als bolletjes op de tegel. Leeg = geen bolletjes.
                Onderwerpen worden op moeilijkheid gesorteerd; leerdoelen zonder
                moeilijkheid staan achteraan.
              </span>
            </label>

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

        {/*
          Verhuizen naar een ander onderwerp.

          Bewust een eigen blok met een eigen knop, en niet een keuzelijst in het
          formulier hierboven. Dat formulier stuurt titel en groep mee; een
          onderwerp dat daar half in hangt, zou bij elke titelwijziging
          meeverhuizen of juist leeg binnenkomen. Zie HARDE REGEL 1.
        */}
        {bewerken && onderwerpen.length > 1 && (
          <div className="mt-4 border-t border-beheer-rand pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-beheer-zacht">
              Verplaatsen naar een ander onderwerp
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={naarOnderwerp}
                onChange={(e) => setNaarOnderwerp(e.target.value)}
                className={`${stijl.veld} min-w-[18rem] flex-1`}
              >
                <option value="">Kies een onderwerp…</option>
                {onderwerpen
                  .filter((o) => o.id !== subdomein.id)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.domeinNaam} › {o.naam}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={bezig || naarOnderwerp === ""}
                onClick={() =>
                  doe(() => {
                    const d = new FormData();
                    d.set("id", leerdoel.id);
                    d.set("subdomeinId", naarOnderwerp);
                    return verhuisLeerdoel(d);
                  }, () => router.push(`/admin/${vak.slug}/structuur`))
                }
                className={stijl.knop}
              >
                Verplaatsen
              </button>
            </div>
            <p className="mt-2 text-xs text-beheer-zacht">
              De vragen, het sjabloon en de voortgang blijven aan dit leerdoel
              hangen en gaan gewoon mee. De code <code className="font-mono">{leerdoel.code}</code>{" "}
              blijft staan zoals hij is. Het leerdoel komt achteraan in het nieuwe
              onderwerp. Let op: het webadres van de oefening verandert, dus een
              oefensessie die een kind halverwege heeft laten staan, begint
              opnieuw — de behaalde voortgang blijft wel gewoon staan.
            </p>
          </div>
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
