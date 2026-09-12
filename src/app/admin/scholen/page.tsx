/**
 * Scholen: de DUO-import en de methodestatus per school.
 *
 * De lijst zelf komt uit open data van DUO. Elke rij draagt de bron en de
 * datum van de import mee, zodat in de ouderomgeving te tonen is waar de
 * gegevens vandaan komen. Dat is ook wat de licentie (CC-BY 4.0) verlangt.
 */

import Link from "next/link";
import { Gegevens, Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { Scholenimport } from "@/components/beheer/Schoolformulieren";
import { trekIn } from "@/app/admin/schoolacties";
import {
  aantalScholen,
  aantalGesloten,
  DUO,
  laatsteImport,
  methodestatus,
  zoekScholen,
} from "@/lib/data/scholen";
import type { MethodeHerkomst } from "@/lib/types";

const STATUSLABEL: Record<MethodeHerkomst, string> = {
  geverifieerd: "Geverifieerd door Thuisles",
  opgegeven_door_ouder: "Opgegeven door een ouder, nog niet geverifieerd",
  onbekend: "Rekenmethode nog niet bekend",
};

const STATUSKLEUR: Record<MethodeHerkomst, string> = {
  geverifieerd: "bg-groen-zacht text-groen-diep",
  opgegeven_door_ouder: "bg-oranje-zacht text-oranje-diep",
  onbekend: "bg-beheer-vlak text-beheer-zacht",
};

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ScholenPagina({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const zoekterm = (q ?? "").trim();
  const gevonden = zoekterm ? zoekScholen(zoekterm, 50) : [];
  const laatste = laatsteImport();

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Scholen" }]}
        titel="Scholen"
        bijschrift="De lijst van Nederlandse basisscholen, en wat we per school over de rekenmethode weten."
      />

      <Paneel titel="Schoollijst">
        <div className="grid gap-5 lg:grid-cols-2">
          <Scholenimport />

          <div>
            <Gegevens
              rijen={[
                ["Scholen in de lijst", aantalScholen().toLocaleString("nl-NL")],
                [
                  "Waarvan gesloten",
                  aantalGesloten().toLocaleString("nl-NL"),
                ],
                [
                  "Laatst vernieuwd",
                  laatste ? datum(laatste.uitgevoerdOp) : "Nog niet gebeurd",
                ],
                [
                  "Wat er toen veranderde",
                  laatste
                    ? `${laatste.nieuw} nieuw · ${laatste.gewijzigd} gewijzigd · ${laatste.gesloten} gesloten`
                    : "—",
                ],
                ["Bron", DUO.naam],
                ["Licentie", DUO.licentie],
              ]}
            />
            <p className="mt-3 text-xs leading-relaxed text-beheer-zacht">
              Hergebruik is toegestaan onder{" "}
              <a
                href={DUO.link}
                target="_blank"
                rel="noreferrer"
                className="text-viool hover:underline"
              >
                CC-BY 4.0
              </a>
              , mits de bron wordt vermeld. Die vermelding staat ook in de
              ouderomgeving, met de datum van de laatste vernieuwing. DUO werkt
              de lijst maandelijks bij; de lijst wordt hier bij de eerste start
              automatisch ingeladen en blijft daarna staan.
            </p>
          </div>
        </div>
      </Paneel>

      <Paneel
        titel="Zoeken"
        bijschrift="Op naam, plaats of postcode — hetzelfde zoekveld dat de ouder gebruikt."
      >
        <form method="get" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={zoekterm}
            placeholder="Naam, plaats of postcode"
            className={`${stijl.veld} max-w-sm`}
          />
          <button type="submit" className={stijl.knop}>
            Zoeken
          </button>
        </form>
      </Paneel>

      {zoekterm && (
        <Paneel titel={`Gevonden (${gevonden.length})`} geenVulling>
          {gevonden.length === 0 ? (
            <Leeg
              tekst="Geen school gevonden."
              hint="Probeer een deel van de naam, of de postcode."
            />
          ) : (
            <table className="w-full">
              <Tabelkop kolommen={["School", "Plaats", "BRIN", "Rekenmethode", ""]} />
              <tbody>
                {gevonden.map((school) => {
                  const stand = methodestatus(school.id);
                  return (
                    <tr
                      key={school.id}
                      className="border-b border-beheer-rand-zacht last:border-b-0 align-top"
                    >
                      <td className="px-3 py-2 text-sm font-medium">
                        {school.naam}
                        {school.geslotenOp && (
                          <span className="ml-1.5 rounded bg-beheer-vlak px-1.5 py-0.5 text-[0.68rem] font-normal text-beheer-zacht">
                            gesloten
                          </span>
                        )}
                        {school.website && (
                          <a
                            href={school.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 block text-xs font-normal text-beheer-zacht hover:text-viool"
                          >
                            {school.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-beheer-zacht">
                        {school.plaats}
                        <span className="block text-xs">{school.postcode}</span>
                      </td>
                      <td className="px-3 py-2 text-sm tabular-nums text-beheer-zacht">
                        {school.brin}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[0.68rem] font-medium ${STATUSKLEUR[stand.herkomst]}`}
                        >
                          {STATUSLABEL[stand.herkomst]}
                        </span>
                        {stand.methode && (
                          <span className="mt-1 block font-medium">
                            {stand.methode.naam}
                            {stand.herkomst === "opgegeven_door_ouder" &&
                              ` · ${stand.aantalOpgaven}× opgegeven`}
                          </span>
                        )}
                        {stand.herkomst === "geverifieerd" && (
                          <span className="mt-0.5 block text-xs text-beheer-zacht">
                            {stand.bron} · {datum(stand.bevestigdOp!)} ·
                            schooljaar {stand.schooljaar}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {stand.herkomst === "geverifieerd" ? (
                          <form action={trekIn}>
                            <input type="hidden" name="schoolId" value={school.id} />
                            <button type="submit" className={stijl.gevaar}>
                              Intrekken
                            </button>
                          </form>
                        ) : (
                          <Link href="/admin/verificaties" className={stijl.link}>
                            Wachtrij
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Paneel>
      )}
    </div>
  );
}
