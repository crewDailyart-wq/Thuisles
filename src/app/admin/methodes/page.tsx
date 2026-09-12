/**
 * Methodes beheren — de afstemmingslaag.
 *
 * LEGAL REVIEW REQUIRED: hier staan namen van methodes en uitgevers. Alleen
 * als tekst. Geen logo's, geen omslagen, geen huisstijl, en nooit inhoud uit
 * een methode.
 */

import Link from "next/link";
import { Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { NieuweMethode } from "@/components/beheer/Methodeformulieren";
import { haalBlokken, haalMethodes } from "@/lib/data/methodes";

export default function MethodesPagina() {
  const methodes = haalMethodes();

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Methodes" }]}
        titel="Rekenmethodes"
        bijschrift="De volgorde van school, gekoppeld aan eigen Thuisles-leerdoelen."
      />

      <div className="rounded-lg border-2 border-dashed border-oranje/50 bg-oranje-zacht/40 p-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-oranje-diep">
          Legal review required
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          Van een methode leggen we alleen de <strong>naam</strong> en de{" "}
          <strong>uitgever</strong> vast, als gewone tekst. Er staat geen inhoud
          uit een methode in Thuisles: geen opgaven, teksten, uitleg of beeld.
          Komt daar iets van bij, of wordt er een logo of omslag getoond, dan
          eerst juridisch laten toetsen.
        </p>
      </div>

      <Paneel titel="Nieuwe methode">
        <NieuweMethode />
      </Paneel>

      <Paneel titel={`Methodes (${methodes.length})`} geenVulling>
        {methodes.length === 0 ? (
          <Leeg
            tekst="Nog geen methodes."
            hint="Voeg er een toe; daarna kun je per groep de blokken instellen."
          />
        ) : (
          <table className="w-full">
            <Tabelkop kolommen={["Naam", "Uitgever", "Blokken", "Zichtbaar", ""]} />
            <tbody>
              {methodes.map((m) => {
                const blokken = haalBlokken(m.id);
                const groepen = [...new Set(blokken.map((b) => b.groep))].sort();
                return (
                  <tr key={m.id} className="border-b border-beheer-rand-zacht last:border-b-0">
                    <td className="px-3 py-2 text-sm font-medium">
                      <Link href={`/admin/methodes/${m.id}`} className="hover:text-viool">
                        {m.naam}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-sm text-beheer-zacht">
                      {m.uitgever || "—"}
                    </td>
                    <td className="px-3 py-2 text-sm tabular-nums">
                      {blokken.length}
                      {groepen.length > 0 && (
                        <span className="text-beheer-zacht">
                          {" "}
                          (groep {groepen.join(", ")})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {m.actief ? "Ja" : <span className="text-beheer-zacht">Nee</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/methodes/${m.id}`} className={stijl.link}>
                        Openen
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Paneel>
    </div>
  );
}
