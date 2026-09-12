/**
 * Overzicht van alle foutpatronen.
 *
 * Foutpatronen horen bij een generator-type, net als de instellingen. Dit
 * scherm laat zien wat er per type klaarstaat en waarschuwt als er iets
 * ontbreekt, zodat een half type nooit stilzwijgend in gebruik raakt.
 *
 * De ouderteksten staan hier nu in het Nederlands. De vertalingen naar Turks,
 * Arabisch en Pools en het aanpassen via dit scherm volgen in de volgende
 * stap.
 */

import { Gegevens, Kop, Paneel, Tabelkop } from "@/components/beheer/Bouwstenen";
import { alleGeneratoren } from "@/lib/generatoren";
import { controleerAanpak, controleerPatronen } from "@/lib/generatoren/foutpatroon";
import { VORM_OMSCHRIJVING, controleerUitleg } from "@/lib/generatoren/uitlegscript";

const LEEFTIJD_LABEL = { "34": "Groep 3-4", "56": "Groep 5-6", "78": "Groep 7-8" } as const;

export default function FoutpatronenPagina() {
  const types = alleGeneratoren.map((g) => ({
    generator: g,
    gebreken: [
      ...controleerPatronen(g.foutpatronen),
      ...controleerAanpak(g.aanpak),
      ...controleerUitleg(g.uitleganimatie, { soort: g.id, getallen: [19, 3], goed: 16 }).map(
        (x) => ({ patroon: VORM_OMSCHRIJVING[x.vorm], wat: x.wat }),
      ),
    ],
  }));

  // Een voorbeeldsom, zodat je kunt zien wat een kind te zien krijgt.
  const proef = { soort: "proef", getallen: [19, 3], goed: 16 };
  const onvolledig = types.filter((t) => t.gebreken.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Foutpatronen" }]}
        titel="Foutpatronen"
        bijschrift="Bij elk soort som horen vaste denkfouten, een uitleg 'zo los je het op', en een uitleg-animatie voor alle drie de groepsvormen."
      />

      {onvolledig.length > 0 ? (
        <div className="rounded-lg border border-oranje/40 bg-oranje-zacht p-4">
          <p className="text-sm font-semibold text-oranje-diep">
            {onvolledig.length} {onvolledig.length === 1 ? "type is" : "types zijn"} nog niet compleet
          </p>
          <ul className="mt-1.5 list-inside list-disc text-sm text-oranje-diep">
            {onvolledig.map((t) =>
              t.gebreken.map((g, i) => (
                <li key={`${t.generator.id}-${i}`}>
                  <strong className="font-semibold">{t.generator.naam}</strong> — {g.patroon}: {g.wat}
                </li>
              )),
            )}
          </ul>
        </div>
      ) : (
        <p className="rounded-lg border border-groen/30 bg-groen-zacht px-4 py-2.5 text-sm font-medium text-groen-diep">
          Alle {types.length} soorten sommen hebben complete foutpatronen.
        </p>
      )}

      {types.map(({ generator, gebreken }) => (
        <div key={generator.id} className="flex flex-col gap-3">
          <Paneel
            titel={`${generator.naam} — zo los je het op`}
            bijschrift="Wat een kind ziet als er geen denkfout wordt herkend. Bij elke fout is er dus altijd een uitleg."
          >
            <dl className="flex flex-col gap-2">
              {(["34", "56", "78"] as const).map((groep) => (
                <div key={groep}>
                  <dt className="text-[0.66rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                    {LEEFTIJD_LABEL[groep]}
                  </dt>
                  <dd className="text-sm">{generator.aanpak.zin(proef)[groep]}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[0.66rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Antwoord met controle
                </dt>
                <dd className="text-sm">{generator.aanpak.controle(proef)}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Laat het me zien
                </dt>
                <dd className="text-sm">
                  {generator.aanpak.stappen(proef).map((st) => `${st.tekst} ${st.som ?? ""}`).join(" → ")}
                </dd>
              </div>
            </dl>
          </Paneel>

        <Paneel
          titel={generator.naam}
          bijschrift={`${generator.foutpatronen.length} foutpatronen${gebreken.length ? " · nog niet compleet" : ""}`}
          geenVulling
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <Tabelkop kolommen={["Patroon", "Wat het kind ziet", "Hint", "Voor de ouder"]} />
              <tbody>
                {generator.foutpatronen.map((p) => (
                  <tr key={p.id} className="border-b border-beheer-rand-zacht align-top last:border-0">
                    <td className="px-3 py-2">
                      <span className="block font-medium">{p.naam}</span>
                      <span className="block font-mono text-xs text-beheer-zacht">{p.id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <dl className="flex flex-col gap-1">
                        {(["34", "56", "78"] as const).map((groep) => (
                          <div key={groep}>
                            <dt className="text-[0.66rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                              {LEEFTIJD_LABEL[groep]}
                            </dt>
                            <dd className="text-xs">{p.kindtekst[groep]}</dd>
                          </div>
                        ))}
                      </dl>
                    </td>
                    <td className="max-w-[16rem] px-3 py-2 text-xs">{p.hint}</td>
                    <td className="max-w-[22rem] px-3 py-2">
                      <p className="text-xs">{p.ouder.uitleg}</p>
                      <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                        Zinnen voor thuis
                      </p>
                      <ul className="list-inside list-disc text-xs text-beheer-zacht">
                        {p.ouder.zinnen.map((z) => (
                          <li key={z}>{z}</li>
                        ))}
                      </ul>
                      <p className="mt-1 text-xs text-beheer-zacht">
                        Schoolwoord: <strong className="font-semibold text-beheer-inkt">{p.ouder.schoolwoord}</strong>
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Paneel>
        </div>
      ))}

      <Paneel titel="Nog te doen">
        <Gegevens
          rijen={[
            ["Uitleg-animaties", "Splitsen groep 3-4 en 7-8 zijn klaar; 5-6 en de andere types volgen"],
            ["Vertalingen", "Turks, Arabisch en Pools — volgende stap"],
            ["Aanpassen via dit scherm", "Volgende stap"],
            ["Nieuwe generator-types", "Leveren altijd hun eigen foutpatronen mee"],
          ]}
        />
      </Paneel>
    </div>
  );
}
