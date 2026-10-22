"use client";

/**
 * Demo van Praten met Bliepo op /voorbeeld-bliepo (22 oktober 2026, opdracht
 * eigenaar): hier staat het altijd aan, zonder kind, om het te proberen. Een
 * vaste voorbeeldvraag in de code (niet in de database); de groep is te kiezen
 * zodat toon en tempo per groep te horen zijn.
 */

import { useState } from "react";
import { VraagBliepo } from "@/components/tutor/VraagBliepo";

const GROEPEN = [
  { groep: 1, label: "Groep 1-2" },
  { groep: 4, label: "Groep 3-5" },
  { groep: 7, label: "Groep 6-8" },
];

const OPGAVE = { opgaveTekst: "Hoeveel is 7 + 8?", domein: "optellen", leerdoel: "Optellen tot 20 over het tiental" };

export function TutorDemo() {
  const [groep, zetGroep] = useState(4);
  const knop = "rounded-full border border-white/40 px-3 py-1 text-sm font-semibold text-white hover:bg-white/10";
  return (
    <section className="mt-6 rounded-3xl border border-white/20 bg-white/5 p-4" aria-labelledby="kop-tutor">
      <h2 id="kop-tutor" className="text-lg font-bold">
        Praten met Bliepo (demo)
      </h2>
      <p className="max-w-3xl text-sm text-white/70">
        Houd de knop ingedrukt, stel een vraag en laat los. Probeer &quot;Ik snap het niet&quot; (een vooraf gemaakte hint),
        &quot;Kun je het nog eens zeggen?&quot;, of een eigen vraag zoals &quot;Waarom moet ik eerst de tien vol maken?&quot; (dan
        denkt de AI na). Bliepo verklapt het antwoord nooit.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Groep">
        {GROEPEN.map((g) => (
          <button
            key={g.groep}
            type="button"
            className={`${knop} ${groep === g.groep ? "bg-white/20" : ""}`}
            aria-pressed={groep === g.groep}
            onClick={() => zetGroep(g.groep)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-2xl font-bold">{OPGAVE.opgaveTekst}</p>
      <div className="mt-3 flex justify-center">
        <VraagBliepo opgave={{ ...OPGAVE, opgaveId: "demo:zeven-plus-acht" }} demo groep={groep} />
      </div>
    </section>
  );
}
