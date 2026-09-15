"use client";

/**
 * De balk bovenaan het oefenscherm.
 *
 * In de focusstand is dit het enige dat er naast de vraag nog staat. Drie
 * dingen, van links naar rechts:
 *
 *   - een terugknop, om de oefening te verlaten;
 *   - het midden: één bolletje per vraag van deze sessie, met daaronder een
 *     dunne voortgangsbalk;
 *   - de sleutelteller, met het aantal.
 *
 * Die teller staat hier niet alleen ter informatie: het is het mikpunt van de
 * sleutel die na een goed antwoord komt aanvliegen. Zonder teller in beeld zou
 * die animatie nergens heen gaan.
 *
 * ---------------------------------------------------------------------------
 * De bolletjes
 * ---------------------------------------------------------------------------
 * Goed beantwoord is groen, fout beantwoord is rood, de vraag waar het kind nu
 * mee bezig is heeft een rand, en wat nog komt blijft leeg. Roze voor een fout
 * antwoord staat niet in de opdracht, maar de andere keus — fout ook leeg
 * laten — zou betekenen dat je aan de rij niet kunt zien hoe ver je bent.
 * Roze is in dit ontwerp de zachte foutkleur, geen alarmkleur.
 *
 * Bij veel vragen zouden de bolletjes te klein worden om nog iets te zeggen.
 * Vanaf een stuk of twintig krimpen ze daarom niet verder, maar mag de rij
 * zijwaarts schuiven.
 */

import { useEffect, useRef } from "react";
import { Sleutelteller } from "@/components/kind/Sleutelteller";
import { PijlTerug } from "@/components/oefenen/Symbolen";

export type Bolstand = "goed" | "fout" | "nu" | "open";

function Bolletje({ stand }: { stand: Bolstand }) {
  /*
    De balk heeft de huisstijlkleur, dus een oranje rand om het huidige
    bolletje zou je niet zien. De rand is daarom wit, en het bolletje zelf iets groter: zo springt
    "hier ben je" eruit zonder dat er een tweede kleur bij hoeft.
  */
  const vorm =
    stand === "goed"
      ? "size-2.5 bg-goed-op-balk"
      : stand === "fout"
        ? "size-2.5 bg-fout-op-balk"
        : stand === "nu"
          ? "size-3.5 bg-huisstijl-diep ring-2 ring-white"
          : "size-2.5 bg-white/35";

  return <span aria-hidden="true" className={`shrink-0 rounded-full ${vorm}`} />;
}

export function Oefenbalk({
  terugHref,
  standen,
  index,
  beginsaldo,
}: {
  terugHref: string;
  /** Eén stand per vraag van deze sessie, in volgorde. */
  standen: Bolstand[];
  /** De vraag waar het kind nu is, om de voortgangsbalk te vullen. */
  index: number;
  beginsaldo: number;
}) {
  /*
    De rij bolletjes past op een telefoon niet naast elkaar.

    Hij schuift dan, en zonder hulp blijft hij aan het begin staan — waardoor
    een kind bij vraag negen alleen nog lege bolletjes ziet en de groene van de
    goede antwoorden buiten beeld vallen. Daarom schuift de rij mee met de vraag
    waar het kind is. Past alles gewoon, dan gebeurt hier niets.
  */
  const bollenrij = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rij = bollenrij.current;
    if (!rij || rij.scrollWidth <= rij.clientWidth) return;
    const bol = rij.children[index] as HTMLElement | undefined;
    if (!bol) return;
    /*
      Gemeten ten opzichte van de rij zelf, met de echte plek op het scherm.
      `offsetLeft` zou hier de afstand tot de hele balk geven — die is sticky en
      telt dus als ankerpunt — en dan schuift de rij naar het verkeerde bolletje.
    */
    const rijVak = rij.getBoundingClientRect();
    const bolVak = bol.getBoundingClientRect();
    const doel =
      rij.scrollLeft + (bolVak.left - rijVak.left) - rij.clientWidth / 2 + bolVak.width / 2;
    rij.scrollTo({ left: Math.max(0, doel), behavior: "smooth" });
  }, [index, standen.length]);

  const aantal = standen.length;
  const gevuld = aantal === 0 ? 0 : (index / aantal) * 100;

  return (
    <header
      /*
        z-50: het feestscherm na een goed antwoord ligt op z-40 over de hele
        pagina. Deze balk moet daarbovenop blijven, want de sleutel vliegt naar
        de teller die erin staat. Zou de balk eronder verdwijnen, dan vloog de
        sleutel naar een punt buiten beeld.
      */
      className="sticky top-0 z-50 w-full border-b border-huisstijl-diep/25 bg-huisstijl"
    >
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-5">
        {/*
          Terug. Een gewone link en geen "ga terug in de geschiedenis": het
          kind moet altijd op hetzelfde, bekende scherm uitkomen.
        */}
        <a
          href={terugHref}
          aria-label="Terug"
          title="Terug"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <PijlTerug className="size-6" />
        </a>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/*
            De rij bolletjes. `overflow-x-auto` met verborgen schuifbalk: bij
            veel vragen schuift de rij mee in plaats van dat alles kleiner
            wordt.
          */}
          <div
            ref={bollenrij}
            /*
              `safe center`: gewoon gecentreerd als alles past, maar vanaf
              links zodra de rij te lang wordt. Met een gewone `center` loopt
              de rij aan béide kanten over en is het linkerdeel niet meer te
              bereiken — precies waar de groene bolletjes van de goede
              antwoorden staan. Op een telefoon zag je die daardoor nooit.
            */
            className="flex items-center gap-1 overflow-x-auto [justify-content:safe_center] [scrollbar-width:none] sm:gap-1.5 [&::-webkit-scrollbar]:hidden"
          >
            {standen.map((stand, i) => (
              <Bolletje key={i} stand={stand} />
            ))}
          </div>

          {/* De dunne balk eronder, die meevult met de sessie. */}
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-white/25"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={aantal}
            aria-valuenow={index}
            aria-label={`Vraag ${Math.min(index + 1, aantal)} van ${aantal}`}
          >
            <span
              className="block h-full rounded-full bg-white transition-[width] duration-300"
              style={{ width: `${gevuld}%` }}
            />
          </div>
        </div>

        <div className="shrink-0">
          <Sleutelteller beginsaldo={beginsaldo} klein />
        </div>
      </div>
    </header>
  );
}
