/**
 * De methodezoeker: starten, pauzeren en de voortgang zien.
 *
 * De zoeker kijkt per school op de eigen website of daar staat met welke
 * rekenmethode wordt gewerkt. Wat hij vindt is een VOORSTEL dat in de
 * verificatiewachtrij belandt — nooit meer dan dat. Ouders zien er niets van.
 *
 * LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.
 */

import Link from "next/link";
import { Gegevens, Kop, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import {
  pauzeerDeZoeker,
  startDeZoeker,
  zoekSchoolOpnieuw,
} from "@/app/admin/schoolacties";
import { verbinding } from "@/lib/db/sqlite";
import { haalMethodes } from "@/lib/data/methodes";
import { haalVoortgang } from "@/lib/data/zoeker";

export const dynamic = "force-dynamic";

/** "9 uur en 20 minuten", of "40 minuten". */
function duur(minuten: number | null) {
  if (minuten === null) return null;
  if (minuten < 60) return `ongeveer ${minuten} minuten`;
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  const uurtekst = `${uren} uur`;
  return rest === 0
    ? `ongeveer ${uurtekst}`
    : `ongeveer ${uurtekst} en ${rest} minuten`;
}

function tijd(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** De laatste scholen die aan de beurt zijn geweest, met hun uitkomst. */
function laatsteOpdrachten(limiet = 25) {
  return verbinding()
    .prepare(
      `select s.id, s.naam, s.plaats, s.website, z.status, z.reden, z.laatst_gezocht_op
       from zoekopdrachten z
       join scholen s on s.id = z.school_id
       where z.laatst_gezocht_op is not null
       order by z.laatst_gezocht_op desc
       limit ?`,
    )
    .all(limiet) as {
    id: string;
    naam: string;
    plaats: string;
    website: string;
    status: string;
    reden: string | null;
    laatst_gezocht_op: string;
  }[];
}

const STATUSWOORD: Record<string, string> = {
  te_doen: "Nog te doen",
  bezig: "Bezig",
  gevonden: "Iets gevonden",
  niets: "Niets gevonden",
  mislukt: "Mislukt",
  overgeslagen: "Overgeslagen",
};

const STATUSKLEUR: Record<string, string> = {
  gevonden: "bg-groen-zacht text-groen-diep",
  niets: "bg-beheer-vlak text-beheer-zacht",
  mislukt: "bg-oranje-zacht text-oranje-diep",
  overgeslagen: "bg-beheer-vlak text-beheer-zacht",
};

export default function ZoekerPagina() {
  const voortgang = haalVoortgang();
  const methodes = haalMethodes(true);
  const recent = laatsteOpdrachten();

  const procent = voortgang.totaal
    ? Math.round((voortgang.gedaan / voortgang.totaal) * 100)
    : 0;
  const teGaan = duur(voortgang.minutenTeGaan);

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Methodezoeker" }]}
        titel="Methodezoeker"
        bijschrift="Zoekt op schoolwebsites naar de rekenmethode. Wat hij vindt is een voorstel voor jou, nooit een verificatie."
      />

      <div className="rounded-lg border-2 border-dashed border-oranje/50 bg-oranje-zacht/40 p-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-oranje-diep">
          Legal review required — automatisch lezen van schoolwebsites
        </p>
        <p className="mt-1 text-xs leading-relaxed">
          De zoeker leest openbare pagina&rsquo;s en schoolgidsen van
          schoolwebsites. Hij volgt robots.txt, doet hooguit één verzoek per drie
          seconden per website, en bewaart alleen <strong>de ene zin</strong>{" "}
          waarin de methodenaam staat plus de link ernaartoe — nooit de hele
          pagina of schoolgids. Wat er precies wordt opgehaald en bewaard staat
          in <code className="rounded bg-white px-1">src/lib/zoeker/NOTITIE.md</code>.
        </p>
      </div>

      {methodes.length === 0 && (
        <p className="rounded-lg border border-oranje/40 bg-oranje-zacht px-4 py-2.5 text-sm text-oranje-diep">
          Er staan nog geen methodes in de admin. De zoeker weet dan niet waar
          hij naar moet zoeken.{" "}
          <Link href="/admin/methodes" className="underline">
            Methodes beheren
          </Link>
        </p>
      )}

      <Paneel
        titel={voortgang.actief ? "De zoeker loopt" : "De zoeker staat stil"}
        bijschrift={
          voortgang.actief
            ? `Gestart op ${tijd(voortgang.gestartOp)}, laatst iets gedaan om ${tijd(voortgang.laatstActiefOp)}. Hij werkt rustig door in de achtergrond.`
            : "Starten kan altijd; hij pakt op waar hij gebleven was."
        }
        acties={
          <form action={voortgang.actief ? pauzeerDeZoeker : startDeZoeker}>
            <button type="submit" className={stijl.knopGroot}>
              {voortgang.actief ? "Pauzeren" : "Starten"}
            </button>
          </form>
        }
      >
        {/* De teller: hoeveel gedaan, hoeveel voorstellen, hoeveel te gaan. */}
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              {voortgang.gedaan.toLocaleString("nl-NL")} van{" "}
              {voortgang.totaal.toLocaleString("nl-NL")} scholen bekeken
              <span className="ml-1.5 text-beheer-zacht">({procent}%)</span>
            </p>
            <p className="text-sm text-beheer-zacht">
              {voortgang.teDoen.toLocaleString("nl-NL")} nog te gaan
              {teGaan ? ` · ${teGaan}` : ""}
            </p>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full bg-beheer-rand"
            role="img"
            aria-label={`${procent} procent bekeken`}
          >
            <div
              className="h-full rounded-full bg-viool transition-[width]"
              style={{ width: `${procent}%` }}
            />
          </div>

          <p className="text-sm">
            <strong>{voortgang.openVoorstellen}</strong> voorstellen bij{" "}
            <strong>{voortgang.scholenMetVoorstel}</strong> scholen —{" "}
            <Link href="/admin/verificaties" className="text-viool hover:underline">
              naar de wachtrij
            </Link>
          </p>
        </div>

        <Gegevens
          rijen={[
            ["Iets gevonden", voortgang.gevonden.toLocaleString("nl-NL")],
            ["Niets gevonden", voortgang.niets.toLocaleString("nl-NL")],
            ["Mislukt", voortgang.mislukt.toLocaleString("nl-NL")],
            ["Overgeslagen", voortgang.overgeslagen.toLocaleString("nl-NL")],
          ]}
        />
        <p className="mt-3 text-xs leading-relaxed text-beheer-zacht">
          Scholen waar kinderen van Thuisles op zitten gaan voor; daarna de rest.
          Er worden drie scholen tegelijk bekeken — elke afzonderlijke website
          krijgt nog steeds hooguit één verzoek per drie seconden. Een school
          wordt eens per schooljaar vanzelf opnieuw bekeken. Ververs deze pagina
          om de stand bij te werken.
        </p>
      </Paneel>

      <Paneel titel="Laatst bekeken" geenVulling>
        {recent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-beheer-zacht">
            De zoeker is nog niet langs geweest.
          </p>
        ) : (
          <table className="w-full">
            <Tabelkop kolommen={["School", "Uitkomst", "Wanneer", ""]} />
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-beheer-rand-zacht last:border-b-0">
                  <td className="px-3 py-2 text-sm">
                    <span className="font-medium">{r.naam}</span>
                    <span className="block text-xs text-beheer-zacht">{r.plaats}</span>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[0.68rem] font-medium ${
                        STATUSKLEUR[r.status] ?? "bg-beheer-vlak text-beheer-zacht"
                      }`}
                    >
                      {STATUSWOORD[r.status] ?? r.status}
                    </span>
                    {r.reden && (
                      <span className="block text-xs text-beheer-zacht">{r.reden}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-beheer-zacht">
                    {tijd(r.laatst_gezocht_op)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <form action={zoekSchoolOpnieuw}>
                      <input type="hidden" name="schoolId" value={r.id} />
                      <button type="submit" className={stijl.link}>
                        Opnieuw
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paneel>
    </div>
  );
}
