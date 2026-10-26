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

/*
  Het gebarenwoordenboek testen (26 oktober 2026, opdracht eigenaar): vijftien
  zinnen met het gebaar dat je zou moeten zien, op het woord waar het bij hoort.
*/
export const WOORDENBOEK_ZINNEN: { kort: string; tekst: string; verwacht: string }[] = [
  { kort: "Langzaam", tekst: "We doen het heel langzaam.", verwacht: "trage, rustige beweging op 'langzaam'" },
  { kort: "Erbij", tekst: "Er komen er drie bij.", verwacht: "iets naar zich toe halen op 'bij' (bij een los getal geen vingers)" },
  { kort: "Groot en klein", tekst: "Deze is groot, en deze is klein.", verwacht: "handen ver uit elkaar op 'groot', dicht bij elkaar op 'klein'" },
  { kort: "Tellen", tekst: "Tel maar mee: een, twee, drie.", verwacht: "op zijn vingers tellen: 1, 2, 3 vingers" },
  { kort: "Eraf", tekst: "Haal er twee weg.", verwacht: "wegvegen op 'weg'" },
  { kort: "Snel", tekst: "Dat ging heel snel!", verwacht: "snelle korte bewegingen op 'snel'" },
  { kort: "Stop", tekst: "Stop, wacht even.", verwacht: "hand vooruit op 'Stop'" },
  { kort: "Klik op", tekst: "Klik op het goede antwoord.", verwacht: "met zijn wijsvinger naar de opdracht wijzen op 'Klik op'" },
  { kort: "Kijk hiernaar", tekst: "Kijk hiernaar, dit zijn de kralen.", verwacht: "met zijn wijsvinger naar de opdracht wijzen op 'Kijk hiernaar'" },
  { kort: "Links", tekst: "Kijk naar de toren links.", verwacht: "naar de opdracht wijzen, dan wijzen naar links" },
  { kort: "Rechts", tekst: "Het antwoord staat rechts.", verwacht: "wijzen naar rechts op 'rechts'" },
  { kort: "Boven", tekst: "Wijs het bovenste plaatje aan.", verwacht: "wijzen naar boven op 'bovenste'" },
  { kort: "Onder", tekst: "Het getal staat onderaan.", verwacht: "wijzen naar onder op 'onderaan'" },
  { kort: "Eerst, dan", tekst: "Eerst tel je de rode, dan de blauwe.", verwacht: "linkerhand op 'Eerst', rechterhand op 'dan'" },
  { kort: "Samen", tekst: "Zet ze samen in een groep.", verwacht: "handen naar elkaar op 'samen'" },
  { kort: "Meer", tekst: "Welke kant heeft meer stippen?", verwacht: "hand omhoog op 'meer'" },
  { kort: "Nadenken", tekst: "Hmm, denk even goed na.", verwacht: "hand bij zijn borst, hoofd scheef" },
];

export function TestPraten() {
  const [nu, zetNu] = useState(-1);
  /* Een zin uit het gebarenwoordenboek (index), of geen. */
  const [boek, zetBoek] = useState<number | null>(null);
  /*
    Alleen op de ontwikkelcomputer (26 oktober 2026): een paar zinnen laten
    zeggen zoals in een opdracht (met de soort zin), voor de grote gebarentest.
  */
  const [proef, zetProef] = useState<{ zinnen: string[]; soort: Zinsoort | null; nu: number; n: number } | null>(null);
  const [ronde, zetRonde] = useState(0);
  /* Een losse echte beweging (knoppen hieronder, 24 oktober 2026). */
  const [los, zetLos] = useState<{ naam: string; n: number } | null>(null);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as unknown as { __proefZeg?: (zinnen: string[], soort: Zinsoort | null) => void };
    w.__proefZeg = (zinnen, soort) => {
      stop.current?.();
      stopPraten();
      zetNu(-1);
      zetBoek(null);
      zetLos(null);
      const n = Date.now();
      zetProef({ zinnen, soort, nu: 0, n });
      stop.current = zegNaElkaar(zinnen, (i) => zetProef((p) => (p && p.n === n ? { ...p, nu: i } : p)), () => {}, true);
    };
    return () => {
      delete w.__proefZeg;
    };
  }, []);

  useEffect(
    () => () => {
      stop.current?.();
      stopPraten();
    },
    [],
  );

  function zegBoek(i: number) {
    stop.current?.();
    stopPraten();
    zetNu(-1);
    zetLos(null);
    zetRonde((r) => r + 1);
    zetBoek(i);
    stop.current = zegNaElkaar([WOORDENBOEK_ZINNEN[i].tekst], () => {}, () => {}, true);
  }

  function start() {
    stop.current?.();
    stopPraten();
    zetBoek(null);
    zetRonde((r) => r + 1);
    zetNu(0);
    stop.current = zegNaElkaar(
      ZINNEN.map((z) => z.tekst),
      (i) => zetNu(i),
      () => zetNu(-1),
      true,
    );
  }

  const zin = proef ? { label: "Test", tekst: proef.zinnen[proef.nu], soort: proef.soort } : nu >= 0 ? ZINNEN[nu] : boek !== null ? { label: WOORDENBOEK_ZINNEN[boek].kort, tekst: WOORDENBOEK_ZINNEN[boek].tekst, soort: null } : null;
  const gebaar = zin?.soort
    ? { naam: kiesGebaar(zin.soort, `test:${ronde}:${proef?.n ?? 0}`, proef ? proef.nu : nu), n: `${ronde}:${proef ? `${proef.n}:${proef.nu}` : nu}`, opStem: true }
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
            {zin && <BliepoTekst key={`${ronde}:${nu}:${proef?.n ?? 0}:${proef?.nu ?? 0}`} woorden={inWoorden(zin.tekst)} gesproken={zin.tekst} />}
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

      {/* Het gebarenwoordenboek (26 oktober 2026): vijftien testzinnen met het gebaar dat je zou moeten zien. */}
      <h3 className="mt-5 text-base font-bold">Gebarenwoordenboek</h3>
      <p className="mt-1 text-sm text-white/75">
        Vijftien zinnen. Tik op een zin: Bliepo zegt hem en maakt het gebaar op het woord waar het bij hoort (het hoogste punt precies op
        het woord). Ernaast staat wat je zou moeten zien.
      </p>
      <ol className="mt-2 grid gap-2 sm:grid-cols-2">
        {WOORDENBOEK_ZINNEN.map((z, i) => (
          <li key={z.tekst}>
            <button
              type="button"
              onClick={() => zegBoek(i)}
              aria-pressed={boek === i}
              className={`flex w-full min-h-11 flex-col items-start rounded-2xl px-4 py-2 text-left text-sm ${boek === i ? "bg-white text-[#0d2a6b]" : "bg-white/10 hover:bg-white/20"}`}
            >
              <span className="font-bold">
                {i + 1}. {z.tekst}
              </span>
              <span className={boek === i ? "text-[#0d2a6b]/75" : "text-white/70"}>Verwacht: {z.verwacht}</span>
            </button>
          </li>
        ))}
      </ol>

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
