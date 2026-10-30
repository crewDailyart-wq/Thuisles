"use client";

/**
 * Kies een stijl (/admin/kies-stijl, 30 oktober 2026, opdracht eigenaar).
 *
 * Per onderdeel staan de varianten (A, B, C, D) naast elkaar, elk als klein
 * lesscherm: een verhaalzin, de tekst boven Bliepo en drie antwoordknoppen.
 * "Speel af" laat Ruth de zinnen voorlezen (vooraf gemaakte bestanden), zodat
 * je ook het oplichten ziet. Muis op een knop: Ruth zegt de keuze.
 *
 * De keuze is een deel van de gewone stijl (lib/stijl.ts, velden kv…), dus
 * hetzelfde systeem als /admin/stijl. Opslaan = bewaarStijl, en de kinderkant
 * leest de stijl bij elk openen van een pagina (components/StijlVariabelen).
 */

import { useState } from "react";
import { bewaarStijl } from "@/app/admin/stijlacties";
import { stijlCss, type Stijl } from "@/lib/stijl";
import { BLIEPO_TEKST, HOEVEEL, OPLICHTEN, type Letter } from "@/lib/stijl-varianten";
import { stopPraten, zegNaElkaar } from "@/lib/stem";
import { BliepoTekst, inWoorden } from "@/components/oefenen/BliepoTekst";
import { keuzeStem } from "@/components/les/keuzestem";
import les from "@/components/les/Lesscherm.module.css";
import "@/components/oefenen/opdracht-nieuw.css";

type Veld = "kvBliepoTekst" | "kvOplichten" | "kvHoeveel";

const ONDERDELEN: { veld: Veld; titel: string; varianten: Record<string, { naam: string; uitleg: string }> }[] = [
  { veld: "kvBliepoTekst", titel: "1. Lettertype en kleur van de tekst boven Bliepo", varianten: BLIEPO_TEKST },
  { veld: "kvOplichten", titel: "2. Hoe de tekst boven Bliepo oplicht bij voorlezen en aantikken", varianten: OPLICHTEN },
  { veld: "kvHoeveel", titel: "3. Hoeveel tekst er tegelijk oplicht boven Bliepo", varianten: HOEVEEL },
];

/* Zinnen die al met de stem van Ruth bewaard zijn (uit de 10 nieuwe lessen): er wordt niets nieuws gemaakt. */
const VOORBEELDEN: Record<Letter, { verhaal: string[]; bliepo: string; keuzes: string[] }> = {
  A: { verhaal: ["Er zitten 7 vogeltjes op een draad.", "Er vliegen er 2 weg."], bliepo: "Hoeveel vogeltjes zitten er nog op de draad?", keuzes: ["5", "7", "9"] },
  B: { verhaal: ["Er staan een paar bloemen in een tuin.", "Jij plant er nog 5 bij."], bliepo: "Hoeveel bloemen stonden er eerst?", keuzes: ["4", "5", "9"] },
  C: { verhaal: ["Er waren eerst 9 ballonnen."], bliepo: "Hoeveel ballonnen zijn er nog?", keuzes: ["5", "7", "9"] },
  D: { verhaal: ["Er zijn nu 12 munten."], bliepo: "Hoeveel munten kreeg ik erbij?", keuzes: ["4", "5", "7"] },
};

function Voorbeeld({ stijl, veld, letter, gekozen, kies }: { stijl: Stijl; veld: Veld; letter: string; gekozen: boolean; kies: () => void }) {
  const klas = `kv-${veld}-${letter}`;
  const css = stijlCss({ ...stijl, [veld]: letter } as Stijl, `.${klas}`);
  const vb = VOORBEELDEN[letter as Letter];
  const [lezen, zetLezen] = useState(-1);
  const speel = () => {
    stopPraten();
    zegNaElkaar(
      [...vb.verhaal, vb.bliepo],
      (i) => zetLezen(i),
      () => zetLezen(-1),
      true,
    );
  };
  return (
    <div className={`flex flex-col gap-2 rounded-xl border-4 p-2 ${gekozen ? "border-amber-400 bg-amber-50" : "border-transparent bg-white"}`}>
      {css && <style>{css}</style>}
      <div className={`${klas} opdracht-nieuw relative flex flex-col items-center gap-3 overflow-hidden rounded-lg px-3 py-4 text-center`} style={{ background: "radial-gradient(ellipse at 50% 30%, #2f6bff 0%, #1740b8 60%, #0d2a7a 100%)", minHeight: 300 }}>
        <div className="verhaal-tekst" style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>
          {vb.verhaal.map((z, i) => (
            <div key={z} className={`verhaal-zin ${lezen === i ? "verhaal-zin-lezen" : ""}`} style={{ transition: "color .3s" }}>
              {z}
            </div>
          ))}
        </div>
        <BliepoTekst woorden={inWoorden(vb.bliepo)} gesproken={vb.bliepo} className="!text-[22px]" />
        <div className="flex flex-wrap justify-center gap-2">
          {vb.keuzes.map((k, i) => (
            <button
              key={k}
              type="button"
              {...keuzeStem(k)}
              className={`${les.knop} ${les.som}`}
              style={{ ...keuzeStem(k).style, minWidth: 64 }}
              data-keuze={i === 2 ? "uit" : ""}
              aria-pressed={i === 1}
            >
              {k}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/70">2e knop: gekozen · 3e knop: fout gekozen</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={speel} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
          ▶ Speel af
        </button>
        <button type="button" onClick={kies} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${gekozen ? "bg-amber-400 text-black" : "bg-gray-200"}`}>
          {gekozen ? `✓ ${letter} gekozen` : `Kies ${letter}`}
        </button>
      </div>
    </div>
  );
}

export function KiesStijl({ begin }: { begin: Stijl }) {
  const [stijl, zetStijl] = useState<Stijl>(begin);
  const [bewaard, zetBewaard] = useState<Stijl>(begin);
  const [bezig, zetBezig] = useState(false);
  const [melding, zetMelding] = useState("");
  const veranderd = ONDERDELEN.some((o) => stijl[o.veld] !== bewaard[o.veld]);

  const opslaan = async () => {
    zetBezig(true);
    /* Alleen de vijf keuzes van deze pagina; de rest van de stijl blijft zoals hij bewaard is. */
    const r = await bewaarStijl({ ...bewaard, ...Object.fromEntries(ONDERDELEN.map((o) => [o.veld, stijl[o.veld]])) } as Stijl);
    zetBewaard(r.stijl);
    zetStijl(r.stijl);
    zetBezig(false);
    zetMelding("Opgeslagen. Kinderen zien het als ze een les openen of verversen.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Zoals in de les (de zin die Bliepo voorleest); een variant kan dit overschrijven. */}
      <style>{".verhaal-zin-lezen{color:#ff8a80}"}</style>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow">
        <button type="button" disabled={!veranderd || bezig} onClick={opslaan} className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white disabled:opacity-40">
          {bezig ? "Bezig…" : "Opslaan"}
        </button>
        <a href="/voorbeeld/les/verhaal-kleine-verhalen?naam=Testkind" target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">
          Bekijk als kind
        </a>
        <span className="text-sm">
          Nu bewaard: {ONDERDELEN.map((o, i) => `${i + 1}${bewaard[o.veld]}`).join(" · ")}
        </span>
        {melding && <span className="text-sm font-semibold text-green-700">{melding}</span>}
      </div>
      {ONDERDELEN.map((o) => (
        <section key={o.veld} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{o.titel}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(o.varianten).map(([letter, v]) => (
              <div key={letter} className="flex flex-col gap-1">
                <div className="text-sm">
                  <b>{letter}</b> · {v.naam} <span className="text-gray-500">({v.uitleg})</span>
                </div>
                <Voorbeeld stijl={stijl} veld={o.veld} letter={letter} gekozen={stijl[o.veld] === letter} kies={() => { zetMelding(""); zetStijl({ ...stijl, [o.veld]: letter } as Stijl); }} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
