"use client";

/**
 * Nieuw sjabloon maken: naam, onderwerp, soort, instellingen, voorbeeld, aantal.
 *
 * De volgorde volgt precies hoe je werkt: geef de oefening een naam, kies bij
 * welk onderwerp hij hoort, kies het soort som, stel wat in, kijk of het klopt,
 * en maak er dan een stapel van. Zolang je niets op "Opslaan" klikt, is er
 * niets bewaard.
 *
 * ---------------------------------------------------------------------------
 * Onderwerp kiezen, geen leerdoel
 * ---------------------------------------------------------------------------
 * Je kiest hier het SUBDOMEIN (onderwerp), niet één specifiek leerdoel. Dat is
 * hoe je erover nadenkt: "een oefening bij Tellen & sprongen", niet "een
 * oefening bij leerdoel REK-GET-TEL-01".
 *
 * De vragen zelf blijven onder water wél aan een leerdoel hangen, want daar
 * hangt de hele voortgang aan: beheersing, aandacht, het ouderdashboard en de
 * methodekoppeling. `kiesLeerdoel` hieronder zoekt dat leerdoel er automatisch
 * bij; jij krijgt het nooit te zien.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { genereer, nieuwSjabloon } from "@/app/admin/sjabloonacties";
import { nieuwLeerdoel } from "@/app/admin/structuuracties";
import { Paneel, stijl } from "@/components/beheer/Bouwstenen";
import { SjabloonInstellingen } from "@/components/beheer/SjabloonInstellingen";
import { SjabloonVoorbeeld } from "@/components/beheer/SjabloonVoorbeeld";
import { alleGeneratoren, zoekGenerator } from "@/lib/generatoren";
import { MAX_SOMMEN_PER_KEER } from "@/lib/generatoren/soort";
import type { Instellingen } from "@/lib/generatoren/soort";
import type { LeerdoelRegel } from "@/lib/data/vragen";

/**
 * De leerdoelen binnen dit onderwerp waar een kind van deze groep aan werkt.
 *
 * Alleen leerdoelen waarvan het groepsbereik om de gekozen groep heen valt. Een
 * leerdoel voor groep 6 hoort niet bij een oefening voor groep 4; zou je die
 * toch koppelen, dan klopt de voortgang niet meer.
 */
function passendeLeerdoelen(binnenOnderwerp: LeerdoelRegel[], groep: number): LeerdoelRegel[] {
  return binnenOnderwerp.filter((l) => groep >= l.groepVan && groep <= l.groepTot);
}

export type OnderwerpRegel = { id: string; naam: string; domeinNaam: string };

export function SjabloonFormulier({
  vakSlug,
  leerdoelen,
  onderwerpen,
  startLeerdoelId = "",
}: {
  vakSlug: string;
  /** Bestaande leerdoelen, om er een passend bij te zoeken. */
  leerdoelen: LeerdoelRegel[];
  /** Alle onderwerpen van dit vak, ook die zonder leerdoel. */
  onderwerpen: OnderwerpRegel[];
  startLeerdoelId?: string;
}) {
  const router = useRouter();
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState("");

  /*
    Kom je hier vanaf een leerdoelpagina, dan staat dat leerdoel in
    `startLeerdoelId`. We zetten het onderwerp daarvan alvast klaar.
  */
  const [subdomeinId, setSubdomeinId] = useState(
    () => leerdoelen.find((l) => l.id === startLeerdoelId)?.subdomeinId ?? "",
  );
  const [soort, setSoort] = useState("");
  const [naam, setNaam] = useState("");
  const [hint, setHint] = useState("");
  const [aantal, setAantal] = useState(30);
  const [instellingen, setInstellingen] = useState<Instellingen>({});

  const generator = soort ? zoekGenerator(soort) : null;
  const [groep, setGroep] = useState<number | "">("");

  const binnenOnderwerp = useMemo(
    () => leerdoelen.filter((l) => l.subdomeinId === subdomeinId),
    [leerdoelen, subdomeinId],
  );

  /*
    Welke groepen je kunt kiezen.
    
    Zijn er leerdoelen, dan van de laagste groep die er voorkomt tot de hoogste.
    Zijn die er nog niet, dan de hele basisschoolrange die de app kent (3 t/m 8),
    want dan bepaalt jouw keuze straks het bereik van het nieuwe leerdoel.
  */
  const groepen = useMemo(() => {
    if (binnenOnderwerp.length === 0) return [3, 4, 5, 6, 7, 8];
    const van = Math.min(...binnenOnderwerp.map((l) => l.groepVan));
    const tot = Math.max(...binnenOnderwerp.map((l) => l.groepTot));
    return Array.from({ length: tot - van + 1 }, (_, i) => van + i);
  }, [binnenOnderwerp]);

  /*
    Waar wordt de voortgang van dit sjabloon bijgehouden?

    Standaard krijgt elke oefening een EIGEN leerdoel, vernoemd naar de naam die
    je bovenaan invult. Daardoor ziet een kind onder een onderwerp meerdere
    oefeningen naast elkaar staan — "Bus tellen", "Kralen tellen" — elk met een
    eigen voortgangsbalkje.

    Wil je twee oefeningen sámen één vaardigheid laten meten, dan koppel je de
    tweede bewust aan een bestaand leerdoel.
  */
  const [koppeling, setKoppeling] = useState<"nieuw" | "bestaand">("nieuw");
  const [bestaandLeerdoelId, setBestaandLeerdoelId] = useState("");

  const kandidaten = groep === "" ? [] : passendeLeerdoelen(binnenOnderwerp, groep);
  const onderwerpNaam = onderwerpen.find((o) => o.id === subdomeinId)?.naam ?? "dit onderwerp";

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
    if (!naam.trim()) return setFout("Geef de oefening eerst een naam.");
    if (!subdomeinId) return setFout("Kies eerst een onderwerp.");
    if (!soort) return setFout("Kies een soort som.");
    if (!groep) return setFout("Kies een groep.");

    if (koppeling === "bestaand" && !bestaandLeerdoelId) {
      return setFout("Kies het leerdoel waaraan je dit sjabloon wilt koppelen.");
    }

    start(async () => {
      /*
        Standaard een eigen leerdoel voor deze oefening, met dezelfde naam. Zo
        krijgt elke oefening onder een onderwerp een eigen voortgangsbalkje.
        Mislukt het aanmaken — bijvoorbeeld omdat er al een leerdoel met deze
        naam bestaat — dan stoppen we; er wordt dan ook geen sjabloon gemaakt.
      */
      let leerdoelId = bestaandLeerdoelId;

      if (koppeling === "nieuw") {
        const nieuw = new FormData();
        nieuw.set("subdomeinId", subdomeinId);
        nieuw.set("titel", naam.trim());
        nieuw.set("groepVan", String(groep));
        nieuw.set("groepTot", String(groep));

        const gemaaktLeerdoel = await nieuwLeerdoel(nieuw);
        if (!gemaaktLeerdoel.ok) return setFout(gemaaktLeerdoel.fout);
        leerdoelId = gemaaktLeerdoel.waarde.id;
      }

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
        {/*
          De naam staat bovenaan en niet pas bij het opslaan. Het is het eerste
          wat je zelf bedenkt ("Bus tellen tot 30") en het is meteen te zien
          waar dit sjabloon over gaat, ook als je halverwege wordt weggeroepen.
        */}
        <label className="block">
          <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
            Naam van deze oefening
          </span>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Bijvoorbeeld: Bus tellen tot 30"
            className={`${stijl.veld} text-base font-semibold`}
          />
          <span className="mt-1 block text-xs text-beheer-zacht">
            Zo heet deze oefening in het overzicht. Kies je een soort som, dan
            wordt de naam daarvan alvast ingevuld.
          </span>
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
            Onderwerp
          </span>
          <select
            value={subdomeinId}
            onChange={(e) => {
              setSubdomeinId(e.target.value);
              setGroep("");
            }}
            className={stijl.veld}
          >
            <option value="">Kies een onderwerp…</option>
            {onderwerpen.map((o) => (
              <option key={o.id} value={o.id}>
                {o.domeinNaam} › {o.naam}
              </option>
            ))}
          </select>
        </label>

        {subdomeinId && (
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

        {/*
          Waar de voortgang onder valt. Standaard een eigen leerdoel per
          oefening: dan ziet een kind onder een onderwerp meerdere oefeningen
          naast elkaar, elk met een eigen balkje. Koppelen aan een bestaand
          leerdoel is de uitzondering, voor wie twee oefeningen samen één
          vaardigheid wil laten meten.
        */}
        {subdomeinId && groep !== "" && (
          <fieldset className="mt-4 rounded-md border border-beheer-rand px-3 py-3">
            <legend className="px-1 text-[0.68rem] font-semibold uppercase tracking-wide text-beheer-zacht">
              Voortgang bijhouden onder
            </legend>

            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="koppeling"
                checked={koppeling === "nieuw"}
                onChange={() => setKoppeling("nieuw")}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-semibold">Een eigen leerdoel voor deze oefening</span>
                <span className="mt-0.5 block text-xs text-beheer-zacht">
                  {naam.trim()
                    ? `Er komt een leerdoel "${naam.trim()}" onder ${onderwerpNaam}.`
                    : "Krijgt de naam die je bovenaan invult."}
                </span>
              </span>
            </label>

            <label className="mt-2.5 flex items-start gap-2">
              <input
                type="radio"
                name="koppeling"
                checked={koppeling === "bestaand"}
                onChange={() => setKoppeling("bestaand")}
                disabled={kandidaten.length === 0}
                className="mt-1"
              />
              <span className="text-sm">
                <span
                  className={`font-semibold ${kandidaten.length === 0 ? "text-beheer-zacht" : ""}`}
                >
                  Koppelen aan een bestaand leerdoel
                </span>
                <span className="mt-0.5 block text-xs text-beheer-zacht">
                  {kandidaten.length === 0
                    ? `Er is nog geen leerdoel voor groep ${groep} onder ${onderwerpNaam}.`
                    : "Twee oefeningen meten dan samen één vaardigheid."}
                </span>
              </span>
            </label>

            {koppeling === "bestaand" && kandidaten.length > 0 && (
              <select
                value={bestaandLeerdoelId}
                onChange={(e) => setBestaandLeerdoelId(e.target.value)}
                className={`${stijl.veld} mt-2`}
              >
                <option value="">Kies een leerdoel…</option>
                {kandidaten.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titel}
                  </option>
                ))}
              </select>
            )}
          </fieldset>
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
              {/*
                De gekozen groep gaat mee, want die bepaalt welke vraagzin je
                ziet. Zolang er nog geen groep gekozen is, toont het voorbeeld
                de gezamenlijke zin.
              */}
              <SjabloonVoorbeeld
                soort={soort}
                instellingen={instellingen}
                groep={groep === "" ? undefined : groep}
              />
            </Paneel>
          </div>

          <Paneel titel="5. Opslaan en sommen maken">
            {/* De naam staat bij stap 1; hier alleen nog de hint. */}
            <div className="grid gap-3">
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
                  max={MAX_SOMMEN_PER_KEER}
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
