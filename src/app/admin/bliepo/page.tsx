/**
 * Bliepo-gebruik (22 oktober 2026, opdracht eigenaar): alleen voor de
 * eigenaar. Per dag hoeveel vragen kinderen aan Bliepo stelden, hoeveel een
 * vooraf gemaakte hint kregen, hoeveel live (AI) en hoeveel een gedeeld
 * antwoord, wat het kostte bij OpenAI en hoeveel tekens bij ElevenLabs.
 * Niets per kind: alleen totalen.
 */

import { Gegevens, Kop, Paneel, Tabelkop } from "@/components/beheer/Bouwstenen";
import { budget, dagen, elevenReserve, elevenTekens } from "@/lib/tutor/gebruik";
import { MODEL_DENKEN, MODEL_LUISTEREN, openaiAan } from "@/lib/tutor/openai";

export const dynamic = "force-dynamic";

const dollar = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

export default async function BliepoGebruik() {
  const b = budget();
  const t = await elevenTekens();
  const rijen = dagen(31);
  return (
    <div className="flex flex-col gap-4">
      <Kop
        kruimels={[{ label: "Beheer", href: "/admin" }, { label: "Bliepo-gebruik" }]}
        titel="Bliepo-gebruik"
        bijschrift="Praten met Bliepo: vragen per dag, kosten bij OpenAI en tekens bij ElevenLabs. Alleen totalen, niets per kind."
      />

      {b.op ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
          Het OpenAI-budget van deze maand is op ({dollar(b.kosten)} van {dollar(b.budget)}). Bliepo geeft nu alleen vooraf gemaakte
          hints. Het budget staat in Railway als OPENAI_BUDGET_USD.
        </p>
      ) : b.waarschuwing ? (
        <p className="rounded-lg border border-oranje/40 bg-oranje-zacht px-4 py-2.5 text-sm font-semibold text-oranje-diep">
          Let op: {b.procent}% van het OpenAI-budget van deze maand is gebruikt ({dollar(b.kosten)} van {dollar(b.budget)}).
        </p>
      ) : null}

      <Paneel titel="Deze maand">
        <Gegevens
          rijen={[
            ["OpenAI", openaiAan() ? `${dollar(b.kosten)} van ${dollar(b.budget)} (${b.procent}%)` : "Geen sleutel ingesteld"],
            [
              "ElevenLabs-tekens",
              t
                ? `${t.gebruikt.toLocaleString("nl-NL")} van ${t.limiet.toLocaleString("nl-NL")} (${elevenReserve().toLocaleString("nl-NL")} blijven over voor vaste zinnen en hints)`
                : "Niet op te halen",
            ],
            ["Modellen", `luisteren: ${MODEL_LUISTEREN()}, nadenken: ${MODEL_DENKEN()}, stem live: Ruth (eleven_v4_turbo)`],
          ]}
        />
      </Paneel>

      <Paneel titel="Per dag">
        {rijen.length === 0 ? (
          <p className="text-sm text-beheer-zacht">Er zijn nog geen vragen aan Bliepo gesteld.</p>
        ) : (
          <table className="w-full text-sm">
            <Tabelkop kolommen={["Datum", "Vragen", "Hints", "Live", "Gedeeld", "OpenAI", "ElevenLabs-tekens", "Fish-tekens"]} />
            <tbody>
              {rijen.map((r) => (
                <tr key={r.datum} className="border-t border-beheer-rand-zacht">
                  <td className="py-1.5">{r.datum}</td>
                  <td>{r.vragen}</td>
                  <td>{r.hints}</td>
                  <td>{r.live}</td>
                  <td>{r.gedeeld}</td>
                  <td>{dollar(r.kosten_usd)}</td>
                  <td>{r.eleven_tekens.toLocaleString("nl-NL")}</td>
                  <td>{r.fish_tekens.toLocaleString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paneel>
    </div>
  );
}
