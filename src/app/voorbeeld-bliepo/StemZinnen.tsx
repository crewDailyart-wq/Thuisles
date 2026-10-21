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

import { useEffect, useState } from "react";
import { zeg } from "@/lib/stem";
import { VASTE_ZINNEN } from "@/lib/stem-vaste-zinnen";

type Stand = "nieuw" | "gehoord" | "bezig" | "opnieuw" | "fout";

/** Een zin waarin na 3 keer opnieuw maken nog steeds een woord ontbrak (app/api/stem). */
type Mislukt = { zin: string; stuk: string; groep: string; gehoord: string; mist: string[]; tijd: string };
type Overzicht = {
  mislukt: Mislukt[];
  teller: { gemaakt: number; opnieuw: number; mislukt: number };
  voortgang: { bezig: boolean; klaar: number; totaal: number; mislukt: number };
};

export function StemZinnen() {
  const [stand, zetStand] = useState<Record<string, Stand>>({});
  const [eigen, zetEigen] = useState("");
  const [extra, zetExtra] = useState<string[]>([]);
  const [overzicht, zetOverzicht] = useState<Overzicht | null>(null);

  /* Het lijstje met zinnen waarin een woord bleef ontbreken; ververst zolang "alles opnieuw" loopt. */
  useEffect(() => {
    let weg = false;
    let klok: ReturnType<typeof setTimeout> | undefined;
    const haal = async () => {
      const o = (await fetch("/api/stem?mislukt=1").then((a) => (a.ok ? a.json() : null)).catch(() => null)) as Overzicht | null;
      if (weg) return;
      zetOverzicht(o);
      klok = setTimeout(haal, o?.voortgang.bezig ? 4000 : 30000);
    };
    void haal();
    return () => {
      weg = true;
      clearTimeout(klok);
    };
  }, []);

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
      <div className="mt-4 rounded-2xl bg-white/5 p-3" aria-live="polite">
        <h3 className="font-bold">Zinnen waarin een woord bleef ontbreken</h3>
        <p className="text-sm text-white/70">
          Elke nieuwe zin wordt teruggeluisterd. Mist er een woord, dan maakt Fish Audio hem opnieuw, hoogstens 3 keer.
          Lukt het dan nog niet, dan staat hij hier en zegt Bliepo hem met de oude stem.
        </p>
        {overzicht?.voortgang.bezig && (
          <p className="mt-1 text-sm">
            Alle zinnen worden opnieuw gemaakt: {overzicht.voortgang.klaar} van {overzicht.voortgang.totaal} klaar.
          </p>
        )}
        {overzicht && (
          <p className="mt-1 text-xs text-white/60">
            Gemaakt: {overzicht.teller.gemaakt} · opnieuw omdat er een woord miste: {overzicht.teller.opnieuw} · niet gelukt:{" "}
            {overzicht.teller.mislukt}
          </p>
        )}
        {overzicht && overzicht.mislukt.length === 0 && <p className="mt-2 text-sm">Geen. Alle zinnen zijn compleet.</p>}
        <ul className="mt-2 grid gap-1.5">
          {overzicht?.mislukt.map((m) => (
            <li key={`${m.groep}-${m.zin}`} className="rounded-xl bg-white/5 px-3 py-1.5 text-sm">
              <span className="font-medium">{m.zin}</span>
              <span className="block text-xs text-white/70">
                Groep {m.groep}. Gehoord: &quot;{m.gehoord}&quot;{m.mist.length > 0 && ` (mist: ${m.mist.join(", ")})`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
