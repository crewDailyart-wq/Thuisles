"use client";

/**
 * De stijlkiezer (24 oktober 2026, opdracht eigenaar): lettertype, kleuren en
 * knopvorm van de nieuwe onderdelen kiezen, met een live voorbeeld dat dezelfde
 * opmaak gebruikt als het echte gesprek (components/gesprek). Pas na Bewaren
 * zien de kinderen het.
 */

import { useEffect, useState, useTransition } from "react";
import { bewaarStijl, stijlTerug } from "@/app/admin/stijlacties";
import { isStandaard, KNOPVORMEN, LETTERTYPES, STANDAARD_STIJL, stijlVariabelen, type Knopvorm, type Lettertype, type Stijl } from "@/lib/stijl";
import "@/components/gesprek/gesprek.css";

const KLEUREN: { sleutel: keyof Stijl; label: string; uitleg: string }[] = [
  { sleutel: "tekst", label: "Tekst van Bliepo", uitleg: "Wat hij zegt en al gezegd heeft." },
  { sleutel: "gedimd", label: "Nog niet gezegd", uitleg: "Wordt half doorzichtig getoond." },
  { sleutel: "accent", label: "Woord van nu", uitleg: "Het woord dat hij op dit moment zegt." },
  { sleutel: "knop", label: "Antwoordknop", uitleg: "De achtergrond van de knoppen." },
  { sleutel: "knoptekst", label: "Tekst op de knop", uitleg: "" },
  { sleutel: "microfoon", label: "Microfoontje", uitleg: "Het icoon op de witte praatknop." },
];

const ZIN = "In deze les gaan we groepjes en getallen vergelijken.".split(" ");

export function Stijlkiezer({ begin }: { begin: Stijl }) {
  const [stijl, zetStijl] = useState<Stijl>(begin);
  const [bewaard, zetBewaard] = useState<Stijl>(begin);
  const [bezig, start] = useTransition();
  const [melding, zetMelding] = useState("");
  /* Het meelezen in het voorbeeld loopt steeds rond. */
  const [woord, zetWoord] = useState(0);
  useEffect(() => {
    const klok = window.setInterval(() => zetWoord((w) => (w + 1) % (ZIN.length + 4)), 420);
    return () => window.clearInterval(klok);
  }, []);

  const zet = <K extends keyof Stijl>(k: K, v: Stijl[K]) => {
    zetStijl((s) => ({ ...s, [k]: v }));
    zetMelding("");
  };
  const veranderd = (Object.keys(stijl) as (keyof Stijl)[]).some((k) => stijl[k] !== bewaard[k]);

  const veld = "rounded-md border border-beheer-rand bg-white px-2 py-1.5 text-sm";
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4 rounded-lg border border-beheer-rand bg-white p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Lettertype
          <select className={veld} value={stijl.lettertype} onChange={(e) => zet("lettertype", e.target.value as Lettertype)}>
            {(Object.keys(LETTERTYPES) as Lettertype[]).map((k) => (
              <option key={k} value={k}>
                {LETTERTYPES[k].label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-semibold">Knopvorm</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(Object.keys(KNOPVORMEN) as Knopvorm[]).map((k) => (
              <label
                key={k}
                className={`flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm ${stijl.knopvorm === k ? "border-viool bg-viool/10 font-semibold" : "border-beheer-rand"}`}
                style={{ borderRadius: KNOPVORMEN[k].css }}
              >
                <input type="radio" name="knopvorm" className="sr-only" checked={stijl.knopvorm === k} onChange={() => zet("knopvorm", k)} />
                {KNOPVORMEN[k].label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Kleuren</legend>
          {KLEUREN.map((k) => (
            <label key={k.sleutel} className="flex items-center gap-3 text-sm">
              <input
                type="color"
                value={stijl[k.sleutel] as string}
                onChange={(e) => zet(k.sleutel, e.target.value as never)}
                className="h-9 w-12 cursor-pointer rounded border border-beheer-rand bg-white p-0.5"
              />
              <span className="flex flex-col">
                <span className="font-medium">{k.label}</span>
                {k.uitleg && <span className="text-xs text-beheer-zacht">{k.uitleg}</span>}
              </span>
              <span className="ml-auto font-mono text-xs text-beheer-zacht">{stijl[k.sleutel] as string}</span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2 border-t border-beheer-rand pt-3">
          <button
            type="button"
            disabled={bezig || !veranderd}
            onClick={() =>
              start(async () => {
                const uit = await bewaarStijl(stijl);
                zetStijl(uit.stijl);
                zetBewaard(uit.stijl);
                zetMelding("Bewaard. De kinderen zien de nieuwe stijl vanaf nu.");
              })
            }
            className="rounded-md bg-viool px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Bewaren
          </button>
          <button
            type="button"
            disabled={bezig || isStandaard(stijl)}
            onClick={() => {
              if (isStandaard(bewaard)) {
                zetStijl(STANDAARD_STIJL);
                return;
              }
              start(async () => {
                const uit = await stijlTerug();
                zetStijl(uit.stijl);
                zetBewaard(uit.stijl);
                zetMelding("Terug naar de standaard (het goedgekeurde ontwerp).");
              });
            }}
            className="rounded-md border border-beheer-rand px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Terug naar de standaard
          </button>
          {veranderd && !melding && <span className="text-xs text-beheer-zacht">Nog niet bewaard.</span>}
          {melding && (
            <span role="status" className="text-xs font-semibold text-groen">
              {melding}
            </span>
          )}
        </div>
      </div>

      {/* Het live voorbeeld: dezelfde opmaak als het echte gesprek. */}
      <div
        aria-label="Voorbeeld"
        className="relative overflow-hidden rounded-xl bg-[#0b3fc4] p-5 [container-type:inline-size]"
        style={stijlVariabelen(stijl) as React.CSSProperties}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- dezelfde achtergrond als de opdrachten */}
        <img className="absolute inset-0 h-full w-full object-cover" src="/assets/bliepo/achtergrond-opdracht/liggend-1280.webp" alt="" />
        <div className="relative ml-auto max-w-md" style={{ ["--gs-tekstmaat" as string]: "24px", ["--gs-knopmaat" as string]: "18px" }}>
          <div className="gs-kolom">
            <div className="gs-gesprek" style={{ maskImage: "none" }}>
              <p className="gs-kind">Een beetje</p>
              <p className="gs-alinea gs-meelezen">
                <span className="gs-woord gs-gezegd">Dat is al een mooi begin.</span>
              </p>
              <p className="gs-alinea gs-meelezen">
                {ZIN.map((w, i) => (
                  <span key={i} className={`gs-woord${woord >= i ? " gs-gezegd" : ""}${woord === i ? " gs-nu" : ""}`}>
                    {w}
                    {i < ZIN.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>
            <div className="gs-knoppen">
              <button type="button" className="gs-knop" tabIndex={-1}>
                Eerst een korte check
              </button>
              <button type="button" className="gs-knop" tabIndex={-1}>
                Begin met de les
              </button>
            </div>
            <div className="gs-onder" style={{ justifyContent: "flex-end" }}>
              <div className="gs-praat" style={{ marginBottom: 0 }}>
                <span className="gs-praatknop" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="gs-microfoon" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
