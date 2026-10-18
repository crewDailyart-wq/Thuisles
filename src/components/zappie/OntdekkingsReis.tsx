"use client";

/**
 * De onderste helft van de Zappie-startpagina (derde ontwerp, 13 oktober 2026):
 *
 * 1. Vrij oefenen: de vakken over de hele breedte;
 * 2. een wolkenlaag als overgang;
 * 3. Bliepo’s atelier: Bliepo op het paspodium en de paskamer ernaast;
 * 4. het slot: "Tot de volgende missie!" boven de aarde.
 *
 * Op 15 oktober 2026 zijn op verzoek van de eigenaar de werkplaats (voertuigen
 * en bouwplannen) en de kustillustratie weggehaald.
 *
 * Eerlijk over wat er is (opdracht eigenaar):
 * - alleen Rekenen heeft oefeningen; de andere vakken zeggen "Binnenkort";
 * - het atelier is een paskamer: passen kan altijd, kopen en bewaren komen
 *   later. Er gaan geen tokens af.
 *
 * Het atelier is een 3D-scène.
 */

import Link from "next/link";
import { EmbeddedAtelier } from "@/components/zappie/atelier/EmbeddedAtelier";
import { useState } from "react";
import { IcoonPijl, IcoonSter } from "@/components/zappie/Iconen";
import { Prototype3D } from "@/components/zappie/bouwtekening/Prototype3D";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";
import { AccessoireBeeld, VakBeeld, type AccessoireId, type VakId } from "@/components/zappie/reis/Beelden";

export const VAKKEN: readonly { id: VakId; naam: string; kleur: string; href?: string }[] = [
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

/** Wat Bliepo aan het passen is: per groep hoogstens één ding. */
type Gepast = Partial<Record<Groep, Exclude<AccessoireId, "standaard">>>;

export function OntdekkingsReis() {
  return (
    <>
      <VrijOefenen />
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

function VrijOefenen() {
  const [vakBericht, zetVakBericht] = useState("");

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

        {/* De werkplaats (voertuigen en bouwplannen) is op 15 oktober 2026 op verzoek van de eigenaar weggehaald; de vakken krijgen nu de hele breedte. */}
      </div>
    </section>
  );
}

function Atelier() {
  const [filter, zetFilter] = useState<(typeof FILTERS)[number]>("Alles");
  const [gepast, zetGepast] = useState<Gepast>({});
  const bewegingRustig = useBewegingsstand() !== "aan";
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
              Bliepo’s atelier
            </h2>
            <p>Maak Bliepo van jou! Pas petjes, kleuren en extra’s.</p>

          </div>
        </header>
      </div>

      <div className="zs-atelier-podium">
        <EmbeddedAtelier mascot={
          /*
            Bliepo op het podium (18 oktober 2026, met toestemming van de
            eigenaar): dezelfde 3D-robot als onderaan de pagina
            (public/assets/zappie/3d/zappie.glb via Prototype3D), naar voren
            en zonder de muis te volgen. Hij vervangt de oude robot met de Z.
            Die staat nog in components/zappie/Zappie.tsx, maar wordt hier niet
            meer getoond.
            Wat je in de paskamer kiest, past nu op Bliepo (startpagina.css,
            "zs-pasrobot--bliepo").
          */
          <div className="zs-pasrobot zs-pasrobot--bliepo" data-kleur={gepast.Kleuren ?? "eigen"} aria-hidden="true">
            <Prototype3D rustig={bewegingRustig} rusthoek={0} volgMuis={false} />
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
              ? "Tik op iets om het op Bliepo te passen."
              : `Bliepo past nu: ${aan.map((a) => a.naam).join(", ")}.`}
          </p>
          <button type="button" className="zs-terugknop" disabled={niets} onClick={() => zetGepast({})}>
            Terug naar je eigen Bliepo
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
      {/* De kustillustratie is op 15 oktober 2026 met akkoord van de eigenaar weggehaald: hier eindigt de reis nu bij de aarde in de ruimtehemel. */}
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
