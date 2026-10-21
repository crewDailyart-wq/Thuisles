"use client";

/**
 * Proef op /voorbeeld-bliepo (21 oktober 2026, opdracht eigenaar): de vaste
 * zinnen die Bliepo vaak zegt, elk met een afspeelknop en "Opnieuw maken".
 *
 * Zo kan de eigenaar elke zin één keer beluisteren en een zin die raar klinkt
 * opnieuw laten maken bij Fish Audio (POST /api/stem). De oude versie blijft
 * bewaard in de map stem/oud. Daarna hoort iedereen de nieuwe versie.
 *
 * De zinnen staan hier precies zoals ze in de lessen en oefeningen staan, met
 * dezelfde leestekens: "Goed zo." en "Goed zo!" zijn voor de stem twee
 * verschillende zinnen.
 */

import { useState } from "react";
import { zeg } from "@/lib/stem";

const VASTE_ZINNEN = [
  "Goed zo.",
  "Goed zo!",
  "Goed.",
  "Goed gedaan.",
  "Goed gedaan!",
  "Goed gezien.",
  "Heel goed.",
  "Helemaal goed.",
  "Helemaal goed!",
  "Precies.",
  "Precies goed.",
  "Dat klopt.",
  "Klopt.",
  "Ja.",
  "Ja!",
  "Mooi.",
  "Mooi!",
  "Mooi gedaan.",
  "Prima.",
  "Knap gedaan.",
  "Knap gedaan!",
  "Wauw!",
  "Je hebt het!",
  "Oké.",
  "Bijna.",
  "Bijna!",
  "Probeer het nog eens.",
  "Probeer deze.",
  "Probeer deze eens.",
  "Geen zorgen.",
  "Geen probleem.",
  "Ik snap wat je denkt.",
  "Kijk eens.",
  "Nog eentje.",
  "Nog twee, om zeker te weten dat je het snapt.",
  "Reken uit.",
  "Hoe laat is het?",
];

type Stand = "nieuw" | "gehoord" | "bezig" | "opnieuw" | "fout";

export function StemZinnen() {
  const [stand, zetStand] = useState<Record<string, Stand>>({});
  const [eigen, zetEigen] = useState("");
  const [extra, zetExtra] = useState<string[]>([]);
  const knop = "rounded-full border border-white/40 px-3 py-1 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50";

  const speel = (zin: string) => {
    zeg(zin);
    zetStand((s) => ({ ...s, [zin]: s[zin] === "opnieuw" ? "opnieuw" : "gehoord" }));
  };

  const opnieuw = async (zin: string) => {
    zetStand((s) => ({ ...s, [zin]: "bezig" }));
    const antwoord = await fetch("/api/stem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zin }),
    }).catch(() => null);
    if (!antwoord?.ok) {
      zetStand((s) => ({ ...s, [zin]: "fout" }));
      return;
    }
    zetStand((s) => ({ ...s, [zin]: "opnieuw" }));
    zeg(zin);
  };

  const tekst: Record<Stand, string> = {
    nieuw: "",
    gehoord: "✓ beluisterd",
    bezig: "wordt opnieuw gemaakt…",
    opnieuw: "✓ opnieuw gemaakt",
    fout: "lukte niet, probeer later nog eens",
  };

  const zinnen = [...VASTE_ZINNEN, ...extra];

  return (
    <section className="mt-6 rounded-3xl border border-white/20 bg-white/5 p-4" aria-labelledby="kop-stem">
      <h2 id="kop-stem" className="text-lg font-bold">
        De stem van Bliepo: vaste zinnen
      </h2>
      <p className="max-w-3xl text-sm text-white/70">
        Beluister elke zin één keer. Klinkt een zin raar, klik dan op &quot;Opnieuw maken&quot;: Fish Audio maakt hem
        opnieuw en Bliepo zegt hem meteen. Niet mooi? Gewoon nog een keer. De oude versie wordt bewaard.
      </p>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {zinnen.map((zin) => {
          const s = stand[zin] ?? "nieuw";
          return (
            <li key={zin} className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5">
              <span className="min-w-0 flex-1 font-medium">{zin}</span>
              <button type="button" className={knop} onClick={() => speel(zin)} disabled={s === "bezig"}>
                ▶ Afspelen
              </button>
              <button type="button" className={knop} onClick={() => void opnieuw(zin)} disabled={s === "bezig"}>
                Opnieuw maken
              </button>
              {s !== "nieuw" && <span className="w-full text-xs text-white/70">{tekst[s]}</span>}
            </li>
          );
        })}
      </ul>
      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const zin = eigen.trim();
          if (!zin) return;
          if (!zinnen.includes(zin)) zetExtra((x) => [...x, zin]);
          zetEigen("");
          speel(zin);
        }}
      >
        <label htmlFor="eigen-zin" className="text-sm text-white/80">
          Andere zin uitproberen:
        </label>
        <input
          id="eigen-zin"
          value={eigen}
          onChange={(e) => zetEigen(e.target.value)}
          maxLength={500}
          className="min-w-0 flex-1 rounded-full border border-white/40 bg-transparent px-3 py-1 text-sm text-white"
          placeholder="Typ een zin, precies zoals Bliepo hem zegt"
        />
        <button type="submit" className={knop}>
          ▶ Afspelen
        </button>
      </form>
    </section>
  );
}
