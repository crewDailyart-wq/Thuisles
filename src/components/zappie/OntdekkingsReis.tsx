"use client";

/**
 * De onderste helft van de Zappie-startpagina (derde ontwerp, 13 oktober 2026):
 *
 * 1. Vrij oefenen: links de vakken, rechts de werkplaats als grote scène;
 * 2. een wolkenlaag als overgang van de lucht naar de kust;
 * 3. Zappies atelier: Zappie op het paspodium en de paskamer ernaast;
 * 4. het kustpanorama als eindbestemming.
 *
 * Eerlijk over wat er is (opdracht eigenaar):
 * - alleen Rekenen heeft oefeningen; de andere vakken zeggen "Binnenkort";
 * - de werkplaats toont bouwplannen. De voortgang is die van de echte missies
 *   in de bijbehorende wereld; de voertuigen zijn nog niet speelbaar;
 * - het atelier is een paskamer: passen kan altijd, kopen en bewaren komen
 *   later. Er gaan geen tokens af.
 *
 * Het atelier is een 3D-scène; de overige illustraties zijn platte beelden:
 * een lasvonk, een werklamp, de knoppen op de voertuigen en Zappie zelf.
 */

import Link from "next/link";
import { EmbeddedAtelier } from "@/components/zappie/atelier/EmbeddedAtelier";
import { useState } from "react";
import { IcoonPijl, IcoonSlot, IcoonSter } from "@/components/zappie/Iconen";
import { Zappie } from "@/components/zappie/Zappie";
import { AccessoireBeeld, VakBeeld, type AccessoireId, type VakId } from "@/components/zappie/reis/Beelden";
import { Illustratie } from "@/components/zappie/reis/Illustratie";
import type { WereldStand } from "@/lib/zappie/voortgang";
import type { WereldId } from "@/lib/zappie/werelden";

const VAKKEN: readonly { id: VakId; naam: string; kleur: string; href?: string }[] = [
  { id: "rekenen", naam: "Rekenen", kleur: "blauw", href: "/rekenen" },
  { id: "taal", naam: "Taal", kleur: "rood" },
  { id: "lezen", naam: "Begrijpend lezen", kleur: "oranje" },
  { id: "spelling", naam: "Spelling", kleur: "paars" },
  { id: "aardrijkskunde", naam: "Aardrijkskunde", kleur: "groen" },
  { id: "geschiedenis", naam: "Geschiedenis", kleur: "brons" },
  { id: "natuur", naam: "Natuur", kleur: "groen" },
  { id: "woordenschat", naam: "Woordenschat", kleur: "rood" },
  { id: "engels", naam: "Engels", kleur: "blauw" },
];

type VoertuigId = "vliegtuig" | "onderzeeer" | "raket";

/**
 * De voertuigen in de werkplaats, van links naar rechts zoals ze in het beeld
 * staan. `plek` is het midden van het voertuig in procenten van de
 * illustratie (werkplaats, 1448 × 1086).
 */
const VOERTUIGEN: readonly { id: VoertuigId; naam: string; wereld: WereldId; doel: string; plek: [number, number] }[] = [
  { id: "vliegtuig", naam: "Vliegtuig", wereld: "aarde", doel: "Vlieg straks over de bergen van de Aarde.", plek: [16, 43] },
  { id: "onderzeeer", naam: "Onderzeeër", wereld: "oceaan", doel: "Duik straks dieper de Oceaan in.", plek: [53, 57] },
  { id: "raket", naam: "Raket", wereld: "heelal", doel: "Vlieg straks naar het Universum.", plek: [86, 40] },
];

type Groep = "Petjes" | "Kleuren" | "Extra’s";
const ACCESSOIRES: readonly { id: Exclude<AccessoireId, "standaard">; naam: string; groep: Groep }[] = [
  { id: "pet", naam: "Ontdekkerspet", groep: "Petjes" },
  { id: "kroon", naam: "Sterrenkroon", groep: "Petjes" },
  { id: "oceaan", naam: "Oceaanblauw", groep: "Kleuren" },
  { id: "goud", naam: "Sterrengoud", groep: "Kleuren" },
  { id: "bril", naam: "Ruimtebril", groep: "Extra’s" },
  { id: "antenne", naam: "Sterrenantenne", groep: "Extra’s" },
];
const FILTERS = ["Alles", "Petjes", "Kleuren", "Extra’s"] as const;

/** Wat Zappie aan het passen is: per groep hoogstens één ding. */
type Gepast = Partial<Record<Groep, Exclude<AccessoireId, "standaard">>>;

export function OntdekkingsReis({ standen }: { standen: WereldStand[] }) {
  return (
    <>
      <VrijOefenen standen={standen} />
      <div className="zs-wolken" aria-hidden="true" data-reis="wolken">
        <span className="zs-wolk zs-wolk-1" />
        <span className="zs-wolk zs-wolk-2" />
        <span className="zs-wolk zs-wolk-3" />
        <span className="zs-wolk zs-wolk-4" />
      </div>
      <Atelier />
      <Kust />
    </>
  );
}

function VrijOefenen({ standen }: { standen: WereldStand[] }) {
  const [vakBericht, zetVakBericht] = useState("");
  const [voertuig, kiesVoertuig] = useState<VoertuigId>("onderzeeer");
  const plan = VOERTUIGEN.find((v) => v.id === voertuig)!;
  const stand = standen.find((s) => s.wereld.id === plan.wereld)!;
  const vorige = standen[standen.indexOf(stand) - 1];

  return (
    <section className="zs-sectie zs-leren" id="vrij-oefenen" aria-labelledby="zs-kop-vakken" data-reis="atmosfeer">
      <div className="zs-binnen zs-leren-raster">
        <div className="zs-vakkenkant">
          <header className="zs-kop">
            <IcoonSter className="zs-kop-ster" />
            <div>
              <h2 id="zs-kop-vakken" className="zp-titel">
                Wat wil je ontdekken?
              </h2>
              <p>Kies een vak en ga op avontuur!</p>
            </div>
          </header>

          <ul className="zs-vakken">
            {VAKKEN.map((vak) => {
              const inhoud = (
                <>
                  {!vak.href && <span className="zs-label">Binnenkort</span>}
                  <span className="zs-vak-beeld">
                    <VakBeeld soort={vak.id} />
                  </span>
                  <span className="zs-vak-naam zp-titel">{vak.naam}</span>
                  <span className="zs-vak-pijl" aria-hidden="true">
                    <IcoonPijl className="size-[55%]" />
                  </span>
                </>
              );
              return (
                <li key={vak.id}>
                  {vak.href ? (
                    <Link className="zs-vak" data-kleur={vak.kleur} href={vak.href}>
                      {inhoud}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="zs-vak"
                      data-kleur={vak.kleur}
                      data-binnenkort="ja"
                      aria-label={`${vak.naam}, binnenkort`}
                      onClick={() => zetVakBericht(`${vak.naam} komt binnenkort. Met Rekenen kun je nu al beginnen!`)}
                    >
                      {inhoud}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="zs-vakbericht" role="status">
            {vakBericht || "Rekenen staat voor je klaar. De andere vakken komen er stap voor stap bij."}
          </p>
          <Link href="/zappie/oefenen?vrij=1" className="zs-tekstlink">
            Liever meteen een vrije missie?
            <IcoonPijl className="size-[0.85em]" />
          </Link>
        </div>

        <section className="zs-werkplaats" aria-labelledby="zs-kop-werkplaats">
          <div className="zs-scene zs-werkplaats-scene" data-voertuig={voertuig}>
            <Illustratie
              naam="werkplaats"
              alt="Zappies werkplaats: hulprobots bouwen aan een gouden onderzeeër, links staat een vliegtuig en rechts een raket."
              sizes="(min-width: 1100px) 44vw, 94vw"
            />
            <span className="zs-werklamp" aria-hidden="true" />
            <span className="zs-lasvonk" aria-hidden="true" />
            <header className="zs-scene-kop">
              <h3 id="zs-kop-werkplaats" className="zp-titel">
                Werkplaats
              </h3>
              <p>Bouw aan nieuwe voertuigen!</p>
            </header>
            <ul className="zs-voertuigen" aria-label="Kies een bouwplan">
              {VOERTUIGEN.map((v) => {
                const s = standen.find((x) => x.wereld.id === v.wereld)!;
                return (
                  <li key={v.id} style={{ left: `${v.plek[0]}%`, top: `${v.plek[1]}%` }}>
                    <button
                      type="button"
                      className="zs-voertuig"
                      data-id={v.id}
                      aria-pressed={voertuig === v.id}
                      data-open={s.open ? "ja" : "nee"}
                      onClick={() => kiesVoertuig(v.id)}
                    >
                      <span className="zs-voertuig-ring" aria-hidden="true" />
                      <span className="zs-voertuig-naam">
                        {!s.open && <IcoonSlot className="zs-voertuig-slot" />}
                        {v.naam}
                        <span className="sr-only">{s.open ? `, ${s.klaar} van de ${s.wereld.missies} missies` : ", nog op slot"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="zs-bouwplan" aria-live="polite">
            <div className="zs-bouwplan-kop">
              <span className="zs-klein">Op de tekentafel</span>
              <h4 className="zp-titel">{plan.naam}</h4>
              <span className="zs-label zs-label-los">{stand.open ? "Bouwplan" : "Op slot"}</span>
            </div>
            {stand.open ? (
              <>
                <div className="zs-bouwplan-stand">
                  <span>
                    <strong>{stand.klaar}</strong> van de {stand.wereld.missies} missies in de {stand.wereld.naam}
                  </span>
                  <progress max={stand.wereld.missies} value={stand.klaar} aria-label={`${stand.klaar} van de ${stand.wereld.missies} missies in de ${stand.wereld.naam}`} />
                </div>
                <p>
                  {plan.doel}{" "}
                  {stand.klaar < stand.wereld.missies
                    ? `Volgende stap: missie ${stand.klaar + 1} in de ${stand.wereld.naam}.`
                    : `Alle missies in de ${stand.wereld.naam} zijn klaar!`}
                </p>
              </>
            ) : (
              <p>
                {plan.doel} Dit bouwplan gaat open als de {vorige?.wereld.naam ?? "vorige wereld"} helemaal ontdekt is
                {stand.nogNodig > 0 ? `: nog ${stand.nogNodig} ${stand.nogNodig === 1 ? "missie" : "missies"}.` : "."}
              </p>
            )}
            <p className="zs-eerlijk">De werkplaats is in aanbouw: je bekijkt de bouwplannen. De voertuigen zijn nog niet speelbaar.</p>
          </div>
        </section>
      </div>
    </section>
  );
}

function Atelier() {
  const [filter, zetFilter] = useState<(typeof FILTERS)[number]>("Alles");
  const [gepast, zetGepast] = useState<Gepast>({});
  const lijst = ACCESSOIRES.filter((a) => filter === "Alles" || a.groep === filter);
  const aan = ACCESSOIRES.filter((a) => gepast[a.groep] === a.id);
  const niets = aan.length === 0;

  function pas(a: (typeof ACCESSOIRES)[number]) {
    zetGepast((g) => ({ ...g, [a.groep]: g[a.groep] === a.id ? undefined : a.id }));
  }

  return (
    <section className="zs-sectie zs-atelier" id="zappies-atelier" aria-labelledby="zs-kop-atelier" data-reis="kust">
      <div className="zs-binnen">
        <header className="zs-kop">
          <IcoonSter className="zs-kop-ster" />
          <div>
            <h2 id="zs-kop-atelier" className="zp-titel">
              Zappies atelier
            </h2>
            <p>Maak Zappie van jou! Pas petjes, kleuren en extra’s.</p>

          </div>
        </header>
      </div>

      <div className="zs-atelier-podium">
        <EmbeddedAtelier mascot={
          <div className="zs-pasrobot" data-kleur={gepast.Kleuren ?? "eigen"} aria-hidden="true">
            <Zappie stemming="blij" houding="zwaai" />
            {gepast.Petjes && <AccessoireBeeld soort={gepast.Petjes} className={`zs-gepast zs-gepast-${gepast.Petjes}`} />}
            {gepast["Extra’s"] && <AccessoireBeeld soort={gepast["Extra’s"]} className={`zs-gepast zs-gepast-${gepast["Extra’s"]}`} />}
          </div>
        } />

        <section className="zs-paskamer" aria-labelledby="zs-kop-paskamer">
          <div className="zs-paskamer-kop">
            <h3 id="zs-kop-paskamer" className="zp-titel">
              Wat past bij jou?
            </h3>
            <span className="zs-label zs-label-los">Paskamer</span>
          </div>
          <div className="zs-filters" role="group" aria-label="Laat zien">
            {FILTERS.map((naam) => (
              <button type="button" key={naam} aria-pressed={filter === naam} onClick={() => zetFilter(naam)}>
                {naam}
              </button>
            ))}
          </div>
          <ul className="zs-producten">
            {lijst.map((a) => {
              const op = gepast[a.groep] === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className="zs-product"
                    aria-pressed={op}
                    aria-label={`${a.naam} ${op ? "afdoen" : "passen"}`}
                    onClick={() => pas(a)}
                  >
                    <AccessoireBeeld soort={a.id} className="zs-product-beeld" />
                    <span className="zs-product-naam zp-titel">{a.naam}</span>
                    <span className="zs-product-actie">{op ? "Gepast ✓" : "Passen"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="zs-passtatus" role="status">
            {niets
              ? "Tik op iets om het op Zappie te passen."
              : `Zappie past nu: ${aan.map((a) => a.naam).join(", ")}.`}
          </p>
          <button type="button" className="zs-terugknop" disabled={niets} onClick={() => zetGepast({})}>
            Terug naar je eigen Zappie
          </button>
          <p className="zs-eerlijk">
            Dit is een paskamer: passen kan altijd en er gaan geen tokens af. Kopen en bewaren komen later. Echte
            beloningen staan bij <Link href="/zappie/beloningen">Beloningen</Link>.
          </p>
        </section>
      </div>
    </section>
  );
}

function Kust() {
  /* Terug naar boven: rustig scrollen, of meteen bij "minder beweging". */
  function naarBoven() {
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: rustig ? "auto" : "smooth" });
    document.querySelector<HTMLElement>(".zp-missieknop")?.focus({ preventScroll: true });
  }

  return (
    <section className="zs-kust" aria-labelledby="zs-kop-kust" data-reis="kust">
      <Illustratie
        naam="kust"
        alt="Zappies thuisbasis aan een turquoise zee, met blauwe koepels, een vuurtoren, watervallen en een stad tussen de bergen."
        sizes="100vw"
      />
      <div className="zs-kust-tekst">
        <h2 id="zs-kop-kust" className="zp-titel">
          Tot de volgende missie!
        </h2>
        <p>Elke missie brengt je een stukje verder.</p>
        <button type="button" className="zs-terug zp-titel" onClick={naarBoven}>
          Terug naar de sterren
          <IcoonPijl className="zs-terug-pijl" />
        </button>
      </div>
    </section>
  );
}
