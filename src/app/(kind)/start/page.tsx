/**
 * Startscherm van het kind: "Wat wil je doen?" (nieuwe layout, oktober 2026).
 *
 * Voorbeeld: ontwerp/startscherm.png. Stijl: app/avontuur.css en STIJLGIDS.md.
 *
 * Het eerste scherm is precies het voorbeeld: logo, titel, begroeting, vier
 * vaktegels, de mascotte en "Jij kunt het!". Dit scherm draagt geen zijbalk en
 * geen kopbalk (zie `Kindschil`).
 *
 * Alles wat er vóór de nieuwe layout op het startscherm stond, staat er nog
 * (HARDE REGEL 1), alleen op een andere plek:
 *   - de sleutels en de groep klein in het Hoi-vakje rechtsboven;
 *   - het menu achter het ronde knopje naast het Hoi-vakje, op de pagina
 *     "Meer" (/meer). Daar staan ook vrij oefenen, oefenen volgens je
 *     methode, school & methode, de tips, het oude vakkenmenu, jouw wereld
 *     en de vos.
 *
 * Dit scherm laadt alleen wat erop staat: het kind en de sleutels.
 *
 * Het haalt alles via de datalaag op en bevat zelf geen logica.
 */

import { Glitter } from "@/components/avontuur/Glitter";
import { HoofdMascotte } from "@/components/avontuur/HoofdMascotte";
import { Logo } from "@/components/avontuur/Logo";
import { Hemel } from "@/components/avontuur/Hemel";
import {
  IcoonLezen,
  IcoonRekenen,
  IcoonSpelling,
  IcoonTaal,
} from "@/components/avontuur/VakIconen";
import { VakTegel } from "@/components/avontuur/VakTegel";
import { Menuknop } from "@/components/avontuur/Menuknop";
import { Groepwisselaar } from "@/components/kind/Groepwisselaar";
import { Pictogram } from "@/components/kind/Pictogram";
import { Sleutelteller } from "@/components/kind/Sleutelteller";
import { haalHuidigKind, haalSleutelstand } from "@/lib/data/queries";
import { MERKMOTTO } from "@/lib/merk";

/** De vier vakken op het startscherm, in de kleuren van het voorbeeld. */
const VAKKEN = [
  {
    naam: "Rekenen",
    href: "/rekenen",
    kleur: "paars",
    scheef: "-2.5deg",
    Icoon: IcoonRekenen,
  },
  {
    naam: "Taal",
    href: "/binnenkort/taal",
    kleur: "roze",
    scheef: "1.5deg",
    Icoon: IcoonTaal,
  },
  {
    naam: "Spelling",
    href: "/binnenkort/spelling",
    kleur: "oranje",
    scheef: "-1deg",
    Icoon: IcoonSpelling,
  },
  {
    naam: "Begrijpend lezen",
    href: "/binnenkort/lezen",
    kleur: "geel",
    scheef: "2deg",
    Icoon: IcoonLezen,
    licht: true,
  },
] as const;

export default async function StartPagina() {
  const kind = await haalHuidigKind();
  const sleutels = await haalSleutelstand(kind.id);

  return (
    <div
      data-stijl="avontuur"
      className="relative isolate min-h-[100svh] overflow-x-hidden"
    >
      <Hemel />
      {/* ------------------------------------------------------------------
          Het eerste scherm: precies het voorbeeld.
          ------------------------------------------------------------------ */}
      <section className="relative isolate min-h-[100svh]">
        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[100rem] flex-col px-4 pb-6 pt-4 sm:px-8 sm:pt-6 lg:px-12">
          {/*
            De kop. Groot scherm (vanaf 1280): logo, titel en begroeting naast
            elkaar, zoals het voorbeeld. Tablet en laptop tot 1280: logo en
            begroeting boven, de titel eronder in het midden. Telefoon: logo en
            menuknopje boven, de begroeting eronder, dan de titel.
          */}
          <header className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-3 xl:grid-cols-[1fr_auto_1fr]">
            <div className="pt-1">
              <Logo />
            </div>

            {/* Telefoon: het menuknopje rechts naast het logo. */}
            <div className="justify-self-end sm:hidden">
              <Menuknop />
            </div>

            <div className="av-gloed col-span-2 row-start-3 text-center sm:row-start-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:pt-2">
              <h1 className="av-titel relative inline-flex items-center gap-[0.35em] text-[clamp(2.1rem,5vw,4.4rem)] drop-shadow-[0_5px_0_rgba(10,20,90,0.35)] xl:text-[clamp(2.1rem,4.4vw,4.4rem)]">
                <Glitter kant="links" className="size-[0.6em] shrink-0" />
                Wat wil je doen?
                <Glitter
                  className="size-[0.6em] shrink-0"
                  kleur="var(--av-vonk)"
                />
              </h1>
              <p className="av-hand mt-1 -rotate-1 text-[clamp(1.25rem,2.2vw,2rem)] text-white/90">
                Kies een vak en ga op ontdekking!
              </p>
            </div>

            {/*
              De begroeting met het plaatje van het kind, klein de sleutels en
              de groep, en (vanaf tablet) ernaast het ronde menuknopje naar
              "Meer".
            */}
            <div className="col-span-2 row-start-2 flex items-start gap-3 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-self-end xl:col-start-3">
              <div className="av-kaart flex items-center gap-3 py-2 pl-2 pr-4 sm:pr-5">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white sm:size-14">
                  <Pictogram naam={kind.avatar} className="size-9 sm:size-11" />
                </span>
                <span className="whitespace-nowrap leading-tight">
                  <span className="av-titel block text-base sm:text-xl">
                    Hoi {kind.roepnaam}!
                  </span>
                  <span className="block text-xs font-semibold text-white/80 sm:text-sm">
                    Fijn dat je er bent!
                  </span>
                  {/* liever een regel erbij dan over elkaar heen */}
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="shrink-0">
                      <Sleutelteller beginsaldo={sleutels.saldo} klein />
                    </span>
                    <span className="shrink-0">
                      <Groepwisselaar groep={kind.groep} opDonker />
                    </span>
                  </span>
                </span>
              </div>
              <div className="hidden sm:block">
                <Menuknop />
              </div>
            </div>
          </header>

          {/* Midden: de mascotte, de vier tegels en "Jij kunt het!". */}
          <div className="relative flex flex-1 flex-col items-center justify-center py-8 lg:pb-[7vh] lg:pt-[3vh]">
            <ul className="grid w-full max-w-[34rem] grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:max-w-[min(74rem,74vw)] lg:grid-cols-4 lg:gap-x-[2.4vw]">
              {VAKKEN.map((v) => (
                <li key={v.naam}>
                  <VakTegel
                    href={v.href}
                    naam={v.naam}
                    kleur={`var(--av-${v.kleur})`}
                    rand={`var(--av-${v.kleur}-rand)`}
                    scheef={v.scheef}
                    licht={"licht" in v && v.licht}
                  >
                    <v.Icoon />
                  </VakTegel>
                </li>
              ))}
            </ul>

            {/* Groot scherm: mascotte links, "Jij kunt het!" rechts, los op de hemel. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[3%] left-[-1.5rem] hidden w-[clamp(8rem,15vw,15rem)] lg:block"
            >
              <Glitter
                kant="links"
                className="absolute -right-4 top-[22%] size-10"
              />
              <HoofdMascotte className="w-full drop-shadow-[0_14px_20px_rgba(8,14,70,0.45)]" />
            </div>
            <p className="av-hand absolute right-0 top-1/2 hidden -translate-y-1/2 rotate-[-8deg] text-center text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-[#c9d6ff] lg:block">
              Jij
              <br />
              kunt het!
              <br />
              <span aria-hidden="true">♡</span>
            </p>

            {/* Smal scherm: mascotte en "Jij kunt het!" naast elkaar onder de tegels. */}
            <div className="mt-10 flex items-center gap-4 lg:hidden">
              <HoofdMascotte className="w-24 drop-shadow-[0_10px_16px_rgba(8,14,70,0.45)] sm:w-28" />
              <p className="av-hand rotate-[-6deg] text-4xl text-[#c9d6ff]">
                Jij kunt het! <span aria-hidden="true">♡</span>
              </p>
            </div>
          </div>

          {/* Linksonder: het motto. */}
          <p className="relative text-xs font-extrabold uppercase tracking-[0.2em] text-white/80 [text-shadow:0_1px_4px_rgba(10,16,90,0.8)]">
            {MERKMOTTO.join(" • ")}
          </p>
        </div>
      </section>
    </div>
  );
}
