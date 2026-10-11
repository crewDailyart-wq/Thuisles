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
 * (HARDE REGEL 1): onder het eerste scherm, bij "Nog meer voor jou". Daar
 * staan het menu, de sleutels, de groep, het rekenpaneel, de schoolmethode,
 * de tips, het wereldpad en het oude vakkenmenu. Of dat zo blijft, beslist de
 * eigenaar.
 *
 * Dit scherm haalt alles in één keer op via de datalaag en bevat zelf geen
 * logica.
 */

import Link from "next/link";
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
import { Groepwisselaar } from "@/components/kind/Groepwisselaar";
import { Icoon } from "@/components/kind/Icoon";
import { Mascotte } from "@/components/kind/Mascotte";
import { Pictogram } from "@/components/kind/Pictogram";
import { RekenPaneel } from "@/components/kind/RekenPaneel";
import { SchoolMethodeKaart } from "@/components/kind/SchoolMethodeKaart";
import { Sleutelteller } from "@/components/kind/Sleutelteller";
import { TipKaartjes } from "@/components/kind/TipKaartjes";
import { Vakkenmenu } from "@/components/kind/Vakkenmenu";
import { Wereldpad } from "@/components/kind/Wereldpad";
import { NAV_ITEMS } from "@/components/kind/navigatie";
import {
  haalHuidigKind,
  haalSleutelstand,
  haalStartscherm,
} from "@/lib/data/queries";
import { MERKMOTTO } from "@/lib/merk";

/** De vier vakken op het startscherm, in de kleuren van het voorbeeld. */
const VAKKEN = [
  {
    naam: "Rekenen",
    href: "/oefenen/rekenen",
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
  const data = await haalStartscherm(kind.id);
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
          <header className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-3 lg:grid-cols-[1fr_auto_1fr]">
            <div className="pt-1">
              <Logo />
            </div>

            {/* Midden boven: de titel. Op een smal scherm onder logo en begroeting. */}
            <div className="av-gloed col-span-2 row-start-2 text-center lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:pt-2">
              <h1 className="av-titel relative inline-flex items-center gap-[0.35em] text-[clamp(2.1rem,5vw,4.4rem)] drop-shadow-[0_5px_0_rgba(10,20,90,0.35)]">
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

            {/* Rechtsboven: de begroeting met het plaatje van het kind. */}
            <div className="justify-self-end lg:col-start-3 lg:row-start-1">
              <div className="av-kaart flex items-center gap-3 py-2 pl-2 pr-4 sm:pr-6">
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
                </span>
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

      {/* ------------------------------------------------------------------
          Onder het eerste scherm: alles wat er al op het startscherm stond.
          ------------------------------------------------------------------ */}
      <section
        aria-labelledby="kop-meer"
        className="relative mx-auto flex w-full max-w-[86rem] flex-col gap-8 px-4 pb-16 pt-6 sm:px-8 lg:px-12"
      >
        <h2 id="kop-meer" className="av-titel text-3xl">
          Nog meer voor jou
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Hoofdmenu" className="flex flex-wrap gap-3">
            {NAV_ITEMS.filter((item) => item.href !== "/start").map(
              (item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="av-knop"
                  style={
                    {
                      "--tegel": [
                        "var(--av-paars)",
                        "var(--av-groen)",
                        "var(--av-lucht)",
                        "var(--av-roze)",
                        "var(--av-oranje)",
                      ][i % 5],
                      "--tegel-rand": [
                        "var(--av-paars-rand)",
                        "var(--av-groen-rand)",
                        "var(--av-lucht-rand)",
                        "var(--av-roze-rand)",
                        "var(--av-oranje-rand)",
                      ][i % 5],
                    } as React.CSSProperties
                  }
                >
                  <Icoon naam={item.icoon} className="size-5" />
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="ms-auto flex flex-wrap items-center gap-2.5 text-inkt">
            <Sleutelteller beginsaldo={sleutels.saldo} />
            <div className="flex items-center gap-2.5 rounded-full border border-white/70 bg-kaart py-1.5 pl-1.5 pr-4 shadow-zacht">
              <span className="grid size-10 place-items-center overflow-hidden rounded-full bg-huisstijl-zacht">
                <Pictogram naam={kind.avatar} className="size-8" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold">
                  {kind.roepnaam}
                </span>
                <Groepwisselaar groep={kind.groep} />
              </span>
            </div>
          </div>
        </div>

        <div className="text-inkt">
          <Vakkenmenu vakken={data.vakken} />
        </div>

        <div className="grid gap-6 text-inkt xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-8">
            <RekenPaneel
              subdomeinen={data.subdomeinen}
              methode={data.methode}
              blokken={data.methodeBlokken}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <SchoolMethodeKaart
              methode={data.methode}
              groep={data.kind.groep}
            />
            <TipKaartjes />
          </aside>
        </div>

        <div className="text-inkt">
          <Wereldpad gebieden={data.wereld} />
          <Mascotte />
        </div>
      </section>
    </div>
  );
}
