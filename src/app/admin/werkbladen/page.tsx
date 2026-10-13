/**
 * Werkbladen en posters: gratis te downloaden op de openbare site.
 *
 * Alleen wat hier staat én aan staat, komt op /werkbladen. Zolang er niets aan
 * staat, is die pagina er niet en staat hij ook niet in het menu.
 */

import { Kop, Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { WerkbladWeghalen, Werkbladformulier } from "@/components/beheer/Werkbladformulier";
import { verwijderWerkbladActie, wisselWerkblad } from "@/app/admin/werkbladacties";
import { alleWerkbladen, MAX_WERKBLAD_MB } from "@/lib/data/werkbladen";

export const dynamic = "force-dynamic";

export default function WerkbladenBeheer() {
  const werkbladen = alleWerkbladen();
  const aan = werkbladen.filter((w) => w.zichtbaar).length;

  return (
    <div className="flex flex-col gap-5">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Werkbladen" }]}
        titel="Werkbladen en posters"
        bijschrift={`Gratis te downloaden op de openbare site. ${aan} van de ${werkbladen.length} staan aan.`}
      />

      <Paneel titel="Nieuw werkblad of poster" bijschrift="Na het opslaan staat het uit, zodat je het eerst kunt bekijken.">
        <Werkbladformulier maxMb={MAX_WERKBLAD_MB} />
      </Paneel>

      <Paneel titel="Alle werkbladen" geenVulling>
        {werkbladen.length === 0 ? (
          <Leeg
            tekst="Er zijn nog geen werkbladen."
            hint="Zolang er niets aan staat, is de pagina Werkbladen op de site er niet en staat hij niet in het menu."
          />
        ) : (
          <table className="w-full text-sm">
            <Tabelkop kolommen={["Titel", "Soort", "Vak", "Groepen", "Bestand", "Op de site", ""]} />
            <tbody>
              {werkbladen.map((w) => (
                <tr key={w.id} className="border-b border-beheer-rand last:border-0">
                  <td className="px-3 py-2">
                    <span className="font-medium">{w.titel}</span>
                    {w.omschrijving && <span className="block text-xs text-beheer-zacht">{w.omschrijving}</span>}
                  </td>
                  <td className="px-3 py-2">{w.soort === "poster" ? "Poster" : "Werkblad"}</td>
                  <td className="px-3 py-2">{w.vak || "–"}</td>
                  <td className="px-3 py-2">{w.groepen || "–"}</td>
                  <td className="px-3 py-2">
                    <a href={`/werkbladen/bestand/${w.bestand}`} target="_blank" rel="noopener" className={stijl.link}>
                      Bekijken
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <form action={wisselWerkblad}>
                      <input type="hidden" name="id" value={w.id} />
                      <input type="hidden" name="zichtbaar" value={w.zichtbaar ? "0" : "1"} />
                      <button type="submit" className={w.zichtbaar ? stijl.knop : stijl.knopStil}>
                        {w.zichtbaar ? "Aan" : "Uit"}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <WerkbladWeghalen id={w.id} titel={w.titel} actie={verwijderWerkbladActie} />
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
