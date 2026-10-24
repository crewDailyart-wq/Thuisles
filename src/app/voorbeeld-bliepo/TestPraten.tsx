"use client";

/**
 * "Test praten" (23 oktober 2026, opdracht eigenaar): vijf voorbeeldzinnen
 * (een vraag, uitleg, hint, goed antwoord en aanmoediging) om te zien of
 * Bliepo tijdens het praten naar het kind kijkt, passende gebaren maakt
 * (lib/bliepo-gebaren.ts) en of het lijntje op zijn scherm goed meebeweegt.
 * Bliepo staat zoals in de opdrachten: rechts, een beetje naar de opdracht
 * gedraaid. Op telefoon het filmpje, met hetzelfde lijntje.
 */

import { useEffect, useRef, useState } from "react";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { BliepoTekst, inWoorden } from "@/components/oefenen/BliepoTekst";
import { kiesGebaar, type Zinsoort } from "@/lib/bliepo-gebaren";
import { stopPraten, zegNaElkaar } from "@/lib/stem";
import { ECHTE_GEBAREN } from "@/lib/zappie3d/echte-gebaren";
import "./tekst-boven-bliepo.css";
import "@/components/oefenen/opdracht-nieuw.css";

const ZINNEN: { soort: Zinsoort; label: string; tekst: string }[] = [
  { soort: "vraag", label: "Vraag", tekst: "Hoeveel kralen zie je aan de ketting?" },
  { soort: "uitleg", label: "Uitleg", tekst: "Kijk, hier zie je eerst vijf rode kralen." },
  { soort: "hint", label: "Hint", tekst: "Tip: tel eerst de rode kralen, en dan de witte." },
  { soort: "goed", label: "Goed antwoord", tekst: "Goed zo! Dat heb je knap gedaan." },
  { soort: "fout", label: "Aanmoediging", tekst: "Bijna! Probeer het nog een keer, jij kunt het." },
];

export function TestPraten() {
  const [nu, zetNu] = useState(-1);
  const [ronde, zetRonde] = useState(0);
  /* Een losse echte beweging (knoppen hieronder, 24 oktober 2026). */
  const [los, zetLos] = useState<{ naam: string; n: number } | null>(null);
  const stop = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      stop.current?.();
      stopPraten();
    },
    [],
  );

  function start() {
    stop.current?.();
    stopPraten();
    zetRonde((r) => r + 1);
    zetNu(0);
    stop.current = zegNaElkaar(
      ZINNEN.map((z) => z.tekst),
      (i) => zetNu(i),
      () => zetNu(-1),
      true,
    );
  }

  const zin = nu >= 0 ? ZINNEN[nu] : null;
  const gebaar = zin
    ? { naam: kiesGebaar(zin.soort, `test:${ronde}`, nu), n: `${ronde}:${nu}`, opStem: true }
    : los
      ? { naam: `echt:${los.naam}`, n: `los:${los.n}` }
      : null;

  return (
    <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/20 bg-white/5 p-5" aria-labelledby="kop-test-praten">
      <h2 id="kop-test-praten" className="text-xl font-bold">
        Test praten
      </h2>
      <p className="mt-1 text-sm text-white/75">
        Vijf zinnen: een vraag, uitleg, hint, goed antwoord en aanmoediging. Let op: kijkt hij naar jou, past het gebaar bij de
        zin, en springt het lijntje op zijn scherm mee met elke lettergreep?
      </p>

      <div className="tbb-scene mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- dezelfde achtergrond als de opdrachten */}
        <img className="tbb-achtergrond" src="/assets/bliepo/achtergrond-opdracht/liggend-1280.webp" alt="" />
        <div className="tbb-bord" aria-hidden="true">
          <p className="tbb-som">{zin ? zin.label : "Klaar?"}</p>
        </div>
        <div className="tbb-bliepo">
          <div className="tbb-tekst" aria-live="polite">
            {zin && <BliepoTekst key={`${ronde}:${nu}`} woorden={inWoorden(zin.tekst)} gesproken={zin.tekst} />}
          </div>
          <div className="tbb-robot" aria-hidden="true">
            <Bliepo3DGedeeld rustig={false} rusthoek={-Math.PI / 9} volgMuis gebaar={gebaar} geenTiktekst />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={start} className="min-h-11 rounded-full bg-orange-500 px-5 font-extrabold text-white hover:bg-orange-600">
          Test praten
        </button>
        <ol className="flex flex-wrap gap-2 text-sm">
          {ZINNEN.map((z, i) => (
            <li key={z.soort} className={`rounded-full px-3 py-1 font-bold ${i === nu ? "bg-white text-[#0d2a6b]" : "bg-white/10"}`}>
              {i + 1}. {z.label}
            </li>
          ))}
        </ol>
      </div>

      {/*
        Echte bewegingen (24 oktober 2026, opdracht eigenaar): door mensen
        opgenomen (Mixamo) en in Blender op Bliepo gezet. Een knop per beweging.
        Tijdens "Test praten" kiest Bliepo ze zelf, op de woorden.
      */}
      <h3 className="mt-5 text-base font-bold">Echte bewegingen</h3>
      <p className="mt-1 text-sm text-white/75">
        Door mensen opgenomen en op Bliepo gezet. Tijdens het praten kiest hij ze zelf, op het woord waar ze bij horen.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(ECHTE_GEBAREN).map(([naam, label]) => (
          <button
            key={naam}
            type="button"
            onClick={() => {
              stop.current?.();
              stopPraten();
              zetNu(-1);
              zetLos((l) => ({ naam, n: (l?.n ?? 0) + 1 }));
            }}
            className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-bold hover:bg-white/20"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
