/**
 * Bulk-upload in drie stappen, in gewone taal.
 *
 * Bewust geen jargon: iemand die alleen Excel kent moet dit kunnen volgen.
 * Het voorbeeldbestand wordt live opgebouwd uit de echte leerdoelen, dus wie
 * het ongewijzigd uploadt, krijgt meteen drie werkende vragen.
 */

import { notFound } from "next/navigation";
import { Kop } from "@/components/beheer/Bouwstenen";
import { Uploadvak } from "@/components/beheer/Uploadvak";
import { haalVak } from "@/lib/data/structuur";
import { CSV_KOLOMMEN } from "@/lib/data/import";

const KOLOM_UITLEG: Record<string, string> = {
  vak: "Rekenen. Wordt gecontroleerd tegen het leerdoel.",
  domein: "Bijvoorbeeld Bewerkingen. Wordt gecontroleerd.",
  subdomein: "Bijvoorbeeld Tafels. Wordt gecontroleerd.",
  leerdoel: "De code (REK-BEW-TAF-02) of de exacte titel. Dit is de koppeling.",
  groep: "3 tot en met 8. Moet binnen het bereik van het leerdoel vallen.",
  vraagtype: "meerkeuze, open of waar/niet waar.",
  vraagtekst: "De vraag zoals het kind hem leest.",
  antwoord: "Zie de uitleg hieronder: dit verschilt per vraagtype.",
  hint: "Optioneel. Het steuntje als het kind vastloopt.",
  uitleg: "Optioneel maar aanbevolen: zo los je deze som op. Wordt getoond bij een fout antwoord.",
  uitleg_afbeelding: "Optioneel. Afbeelding bij die uitleg.",
  afbeelding: "Optioneel. Afbeelding bij de vraag zelf.",
  optie_a_afbeelding: "Optioneel. Afbeelding bij het eerste antwoord.",
  optie_b_afbeelding: "Optioneel. Afbeelding bij het tweede antwoord.",
  optie_c_afbeelding: "Optioneel. Afbeelding bij het derde antwoord.",
  optie_d_afbeelding: "Optioneel. Afbeelding bij het vierde antwoord.",
  optie_e_afbeelding: "Optioneel. Afbeelding bij het vijfde antwoord.",
  optie_f_afbeelding: "Optioneel. Afbeelding bij het zesde antwoord.",
};

function Stap({
  nummer,
  titel,
  children,
}: {
  nummer: number;
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-beheer-rand bg-beheer-kaart p-4 sm:p-5">
      <h2 className="mb-2 flex items-center gap-2.5 text-sm font-semibold">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-viool text-xs font-bold text-white">
          {nummer}
        </span>
        {titel}
      </h2>
      <div className="pl-[2.15rem]">{children}</div>
    </section>
  );
}

export default async function UploadPagina({
  params,
}: {
  params: Promise<{ vak: string }>;
}) {
  const { vak: vakSlug } = await params;
  const vak = haalVak(vakSlug);
  if (!vak) notFound();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <Kop
        kruimels={[
          { label: vak.naam, href: `/admin/${vak.slug}/overzicht` },
          { label: "Uploaden" },
        ]}
        titel="Vragen uploaden"
        bijschrift="Voeg in één keer veel vragen toe met een Excel-bestand (.xlsx) of een CSV."
      />

      <Stap nummer={1} titel="Download het voorbeeldbestand">
        <p className="text-sm text-beheer-zacht">
          Hierin staan de goede kolommen en drie ingevulde voorbeeldvragen. Open
          het in Excel of Numbers.
        </p>
        <a
          href={`/admin/${vak.slug}/voorbeeldbestand`}
          download
          className="mt-2.5 inline-flex h-9 items-center gap-2 rounded-md border border-viool px-3.5 text-sm font-semibold text-viool transition hover:bg-viool/8"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
            <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />
          </svg>
          Voorbeeldbestand downloaden
        </a>
      </Stap>

      <Stap nummer={2} titel="Vul het bestand in">
        <p className="mb-3 text-sm text-beheer-zacht">
          Eén regel is één vraag. De kolommen mogen niet van naam veranderen.
        </p>

        <div className="overflow-hidden rounded-md border border-beheer-rand">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {CSV_KOLOMMEN.map((kolom) => (
                <tr key={kolom} className="border-b border-beheer-rand-zacht last:border-0">
                  <th
                    scope="row"
                    className="w-32 bg-beheer-vlak px-3 py-1.5 text-left align-top font-mono text-xs font-semibold"
                  >
                    {kolom}
                  </th>
                  <td className="px-3 py-1.5 text-xs text-beheer-zacht">
                    {KOLOM_UITLEG[kolom]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-md bg-beheer-vlak p-3">
          <p className="text-xs font-semibold">Hoe vul je de kolom antwoord in?</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-xs text-beheer-zacht">
            <li>
              <strong className="font-semibold text-beheer-inkt">Meerkeuze</strong> —
              antwoorden gescheiden door een liggend streepje, met een sterretje
              voor het goede: <code className="rounded bg-white px-1 py-0.5 font-mono">20|22|*24|26</code>
            </li>
            <li>
              <strong className="font-semibold text-beheer-inkt">Open vraag</strong> —
              het goede antwoord. Meerdere schrijfwijzen mag, gescheiden door een
              streepje: <code className="rounded bg-white px-1 py-0.5 font-mono">75|vijfenzeventig</code>
            </li>
            <li>
              <strong className="font-semibold text-beheer-inkt">Waar / niet waar</strong> —
              vul <code className="rounded bg-white px-1 py-0.5 font-mono">waar</code> of{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono">niet waar</code> in.
            </li>
          </ul>
        </div>

        <div className="mt-3 rounded-md bg-beheer-vlak p-3">
          <p className="text-xs font-semibold">Afbeeldingen bij de antwoorden</p>
          <p className="mt-1.5 text-xs text-beheer-zacht">
            De kolommen <code className="rounded bg-white px-1 py-0.5 font-mono">optie_a_afbeelding</code>{" "}
            tot en met <code className="rounded bg-white px-1 py-0.5 font-mono">optie_f_afbeelding</code>{" "}
            horen bij het eerste tot en met het zesde antwoord. Vul de
            bestandsnaam in van een bestand uit de map{" "}
            <code className="rounded bg-white px-1 py-0.5 font-mono">public/vragen</code>.
          </p>
          <p className="mt-1.5 text-xs text-beheer-zacht">
            Een antwoord mag alleen een plaatje zijn, zonder tekst. Laat dan het
            tekstdeel leeg maar houd de streepjes aan, zodat de plek klopt.
            Bijvoorbeeld <code className="rounded bg-white px-1 py-0.5 font-mono">|*||</code>{" "}
            voor vier antwoorden waarvan het tweede goed is.
          </p>
        </div>
      </Stap>

      <Stap nummer={3} titel="Upload het bestand">
        <p className="mb-3 text-sm text-beheer-zacht">
          Elke regel wordt apart gecontroleerd. Goede regels worden meteen
          opgeslagen; regels met een fout worden overgeslagen, met de reden
          erbij. Er gaat dus nooit stilzwijgend iets mis.
        </p>
        <Uploadvak />
      </Stap>
    </div>
  );
}
