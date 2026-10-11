"use client";

/**
 * De groepjesmaker op het oefenscherm (oktober 2026).
 *
 * Bovenaan de keersom met een echt invulvak (HARDE REGEL 5); eronder de kast
 * uit Godot, in een iframe. Thuisles kijkt het antwoord na, Godot bouwt alleen
 * (zie `lib/godot/brug.ts`). Het invulvak gaat pas open als de bouw klopt,
 * net als bij het rekenrek.
 *
 * Het iframe blijft staan van opgave tot opgave: het component krijgt met
 * opzet geen `key` per vraag, zodat Godot maar één keer hoeft te laden. Bij een
 * nieuwe opgave gaat er alleen een nieuw bericht naar Godot.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Gegeven, Invulvak } from "@/components/oefenen/Splitsopdracht";
import { useGodot, type GodotBericht } from "@/lib/godot/brug";
import { zinnenVoor } from "@/lib/godot/zinnen";
import { stuks } from "@/lib/maatje/taal";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type Groepjesfiguur = Extract<Figuur, { soort: "groepjesmaker" }>;

export function isGroepjesfiguur(figuur: Figuur | null | undefined): figuur is Groepjesfiguur {
  return !!figuur && figuur.soort === "groepjesmaker";
}

/** "4 doosjes van 3 is 12." — na Controleer. */
export function groepjesZin(a: number, b: number): string {
  if (a === 0) return `Geen doosjes, dus geen bolletjes: 0 × ${b} = 0.`;
  return `${stuks(a, "doosje", "doosjes")} van ${b} is ${a * b}.`;
}

export function GroepjesmakerOpdracht({
  vraagId,
  figuur,
  antwoord,
  fase,
  onWijzig,
  onBevestig,
  onKlaar,
  onMaatje,
}: {
  vraagId: string;
  figuur: Groepjesfiguur;
  antwoord: string;
  fase: Fase;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  /** Na een goed antwoord: het tellen is klaar, het feest mag komen. */
  onKlaar?: () => void;
  /** Het maatje zegt iets tijdens het bouwen; een lege lijst = het kind is bezig. */
  onMaatje?: (zinnen: string[]) => void;
}) {
  const { a, b, stand } = figuur;
  const uit = fase !== "bezig";
  const [getypt, setGetypt] = useState(antwoord);
  const [gebouwd, setGebouwd] = useState(false);
  const veld = useRef<HTMLInputElement | null>(null);
  const maatjeRef = useRef(onMaatje);
  useEffect(() => {
    maatjeRef.current = onMaatje;
  }, [onMaatje]);
  /* De plussom krimpt de eerste keer langzaam; daarna vlot. */
  const alGekrompen = useRef(false);

  const opBericht = useCallback(
    (bericht: GodotBericht) => {
      if (bericht.type === "bouw" || bericht.type === "voorspelling") maatjeRef.current?.([]);
      if (bericht.type === "gebouwd") setGebouwd(bericht.klaar === true);
      if (bericht.type === "zeg" && Array.isArray(bericht.sleutels)) {
        const zinnen = zinnenVoor(bericht.sleutels as string[], { a: Number(bericht.a), b: Number(bericht.b) });
        if (zinnen.length > 0) maatjeRef.current?.(zinnen);
      }
    },
    [],
  );
  const { frame, geladen, stuur } = useGodot("groepjesmaker", opBericht);


  /* Een nieuwe opgave: alles terug naar het begin, en de som naar Godot. */
  const [vorige, setVorige] = useState(vraagId);
  if (vorige !== vraagId) {
    setVorige(vraagId);
    setGetypt("");
    setGebouwd(false);
  }
  useEffect(() => {
    if (!geladen) return;
    stuur({ type: "opgave", a, b, stand, eersteKeer: !alGekrompen.current });
    alGekrompen.current = true;
  }, [geladen, vraagId, a, b, stand, stuur]);

  /* Na Controleer: goed → meetellen, fout → de kast bouwt zelf de goede manier. */
  useEffect(() => {
    if (geladen && fase !== "bezig") stuur({ type: "fase", fase });
  }, [fase, geladen, stuur]);

  /* Is de bouw af, dan meteen de cursor in het vakje. */
  useEffect(() => {
    if (gebouwd && fase === "bezig") veld.current?.focus({ preventScroll: true });
  }, [gebouwd, fase]);

  /* Na een goed antwoord tellen de doosjes mee; daarna het feest. */
  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onKlaar?.(), 900 + Math.max(1, a) * 450);
    return () => window.clearTimeout(klokje);
  }, [fase, a, onKlaar]);

  function typ(tekst: string) {
    if (uit) return;
    setGetypt(tekst);
    onWijzig(tekst);
  }

  const uitslag = !uit ? null : getypt !== "" && Number(getypt) === a * b ? "goed" : "fout";
  const teken = (t: string) => <span className="text-2xl font-extrabold text-inkt-zacht">{t}</span>;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-3">
        <Gegeven waarde={a} />
        {teken("×")}
        <Gegeven waarde={b} />
        {teken("=")}
        <Invulvak
          waarde={getypt}
          uitslag={uitslag}
          label="Hoeveel bolletjes samen?"
          uit={uit || !gebouwd}
          veldRef={(el) => {
            veld.current = el;
          }}
          onTyp={typ}
          onBevestig={onBevestig}
        />
      </div>

      <div data-godotvak="" className="relative w-full overflow-hidden aspect-video">
        <iframe
          ref={frame}
          title="De groepjesmaker: doosjes met bolletjes"
          className="absolute inset-0 size-full border-0"
          allow="autoplay"
        />
        {!geladen && (
          <div className="absolute inset-0 grid place-items-center text-base font-bold text-white/80">
            De groepjesmaker wordt klaargezet…
          </div>
        )}
      </div>

      {fase === "goed" && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">
          Goed zo! {groepjesZin(a, b)}
        </p>
      )}
      {fase === "fout" && (
        <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">{groepjesZin(a, b)}</p>
      )}
    </div>
  );
}
