"use client";

/**
 * Nieuw sjabloon maken: leerdoel, soort, instellingen, voorbeeld, aantal.
 *
 * De volgorde volgt precies hoe je werkt: kies waar het bij hoort, kies het
 * soort som, stel wat in, kijk of het klopt, en maak er dan een stapel van.
 * Zolang je niets op "Opslaan" klikt, is er niets bewaard.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { genereer, nieuwSjabloon } from "@/app/admin/sjabloonacties";
import { Paneel, stijl } from "@/components/beheer/Bouwstenen";
import { SjabloonInstellingen } from "@/components/beheer/SjabloonInstellingen";
import { SjabloonVoorbeeld } from "@/components/beheer/SjabloonVoorbeeld";
import { alleGeneratoren, zoekGenerator } from "@/lib/generatoren";
import type { Instellingen } from "@/lib/generatoren/soort";
import type { LeerdoelRegel } from "@/lib/data/vragen";

export function SjabloonFormulier({
  vakSlug,
  leerdoelen,
  startLeerdoelId = "",
}: {
  vakSlug: string;
  leerdoelen: LeerdoelRegel[];
  startLeerdoelId?: string;
}) {
  const router = useRouter();
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState("");

  const [leerdoelId, setLeerdoelId] = useState(startLeerdoelId);
  const [soort, setSoort] = useState("");
  const [naam, setNaam] = useState("");
  const [hint, setHint] = useState("");
  const [aantal, setAantal] = useState(30);
  const [instellingen, setInstellingen] = useState<Instellingen>({});

  const leerdoel = leerdoelen.find((l) => l.id === leerdoelId);
  const generator = soort ? zoekGenerator(soort) : null;
  const [groep, setGroep] = useState<number | "">("");

  const groepen = useMemo(
    () =>
      leerdoel
        ? Array.from(
            { length: leerdoel.groepTot - leerdoel.groepVan + 1 },
            (_, i) => leerdoel.groepVan + i,
          )
        : [],
    [leerdoel],
  );

  const maximum = generator?.maximum(instellingen) ?? null;
  const teMaken = maximum === null ? aantal : Math.min(aantal, maximum);

  function kiesSoort(id: string) {
    setSoort(id);
    const g = zoekGenerator(id);
    setInstellingen(g ? { ...g.standaard } : {});
    if (g && !naam.trim()) setNaam(g.naam);
  }

  function opslaanEnMaken() {
    setFout("");
    if (!leerdoelId) return setFout("Kies eerst een leerdoel.");
    if (!soort) return setFout("Kies een soort som.");
    if (!groep) return setFout("Kies een groep.");

    start(async () => {
      const data = new FormData();
      data.set("leerdoelId", leerdoelId);
      data.set("naam", naam);
      data.set("soort", soort);
      data.set("instellingen", JSON.stringify(instellingen));
      data.set("hint", hint);
      data.set("groep", String(groep));

      const gemaakt = await nieuwSjabloon(data);
      if (!gemaakt.ok) return setFout(gemaakt.fout);

      const tweede = new FormData();
      tweede.set("id", gemaakt.waarde);
      tweede.set("aantal", String(teMaken));
      const uitslag = await genereer(tweede);
      if (!uitslag.ok) return setFout(uitslag.fout);

      router.push(`/admin/${vakSlug}/sjablonen/${gemaakt.waarde}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Paneel titel="1. Waar hoort het bij?">
        <label className="block">
          <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
            Leerdoel
          </span>
          <select
            value={leerdoelId}
            onChange={(e) => {
              setLeerdoelId(e.target.value);
              setGroep("");
            }}
            className={stijl.veld}
          >
            <option value="">Kies een leerdoel…</option>
            {leerdoelen.map((l) => (
              <option key={l.id} value={l.id}>
                {l.domeinNaam} › {l.subdomeinNaam} — {l.titel}
              </option>
            ))}
          </select>
        </label>

        {leerdoel && (
          <label className="mt-3 block">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Groep
            </span>
            <select
              value={groep}
              onChange={(e) => setGroep(Number(e.target.value))}
              className={`${stijl.veld} w-40`}
            >
              <option value="">Kies…</option>
              {groepen.map((g) => (
                <option key={g} value={g}>
                  Groep {g}
                </option>
              ))}
            </select>
          </label>
        )}
      </Paneel>

      <Paneel titel="2. Wat voor sommen?">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {alleGeneratoren.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => kiesSoort(g.id)}
              aria-pressed={soort === g.id}
              className={`rounded-md border p-3 text-left transition ${
                soort === g.id
                  ? "border-viool bg-viool/6 ring-2 ring-viool/25"
                  : "border-beheer-rand bg-white hover:border-viool/50"
              }`}
            >
              <span className="block text-sm font-semibold">{g.naam}</span>
              <span className="mt-0.5 block text-xs leading-snug text-beheer-zacht">
                {g.uitleg}
              </span>
            </button>
          ))}
        </div>
      </Paneel>

      {generator && (
        <>
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <Paneel titel="3. Instellingen" bijschrift={generator.suggestie}>
              <SjabloonInstellingen
                velden={generator.velden}
                waarden={instellingen}
                onWijzig={(sleutel, waarde) =>
                  setInstellingen((h) => ({ ...h, [sleutel]: waarde }))
                }
              />
            </Paneel>

            <Paneel
              titel="4. Voorbeeld"
              bijschrift="Zo zouden de sommen eruitzien. Er is nog niets opgeslagen."
            >
              <SjabloonVoorbeeld soort={soort} instellingen={instellingen} />
            </Paneel>
          </div>

          <Paneel titel="5. Opslaan en sommen maken">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Naam van het sjabloon
                </span>
                <input
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  placeholder="Bijvoorbeeld: Tafels 3, 4 en 6"
                  className={stijl.veld}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Hint bij een fout antwoord
                </span>
                <input
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="Bijvoorbeeld: Maak eerst het tiental vol"
                  className={stijl.veld}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
                  Hoeveel sommen
                </span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={aantal}
                  onChange={(e) => setAantal(Number(e.target.value))}
                  className={`${stijl.veld} w-28`}
                />
              </label>

              <button
                type="button"
                onClick={opslaanEnMaken}
                disabled={bezig}
                className="inline-flex h-9 items-center rounded-md bg-viool px-4 text-sm font-semibold text-white transition hover:bg-viool-diep disabled:opacity-60"
              >
                {bezig ? "Bezig…" : `Opslaan en ${teMaken} sommen maken`}
              </button>

              {maximum !== null && aantal > maximum && (
                <p className="text-xs text-oranje-diep">
                  Met deze instellingen bestaan er maar {maximum} verschillende
                  sommen. Er worden er dus {maximum} gemaakt.
                </p>
              )}
            </div>

            <p className="mt-2 text-xs text-beheer-zacht">
              De sommen komen als <strong>concept</strong> bij het leerdoel te
              staan. Je kunt ze daarna bekijken en in één klik publiceren.
            </p>

            {fout && (
              <p className="mt-2 rounded border border-roze/40 bg-roze-zacht px-2 py-1 text-xs font-medium text-roze">
                {fout}
              </p>
            )}
          </Paneel>
        </>
      )}
    </div>
  );
}
