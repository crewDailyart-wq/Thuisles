"use client";

/**
 * De laser op het oefenscherm (oktober 2026), een Godot-bouwsteen: raak alle
 * goede stenen. Kiezen is tikken, dus hier staat geen invulvak. Vuur! in Godot
 * is hetzelfde als Controleer. Thuisles kijkt na (zie `lib/godot/brug.ts`).
 * Zonder `key` per vraag: Godot laadt maar één keer.
 */

import { useCallback, useEffect, useRef } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { useGodot, type GodotBericht } from "@/lib/godot/brug";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type Laserfiguur = Extract<Figuur, { soort: "laser" }>;

export function isLaserfiguur(figuur: Figuur | null | undefined): figuur is Laserfiguur {
  return !!figuur && figuur.soort === "laser";
}

export function LaserOpdracht({
  vraagId,
  figuur,
  fase,
  onWijzig,
  onBevestig,
  onKlaar,
  onMaatje,
}: {
  vraagId: string;
  figuur: Laserfiguur;
  fase: Fase;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  onKlaar?: () => void;
  onMaatje?: (zinnen: string[]) => void;
}) {
  const { stenen, goed, stand } = figuur;
  const refs = useRef({ onWijzig, onBevestig, onMaatje });
  useEffect(() => {
    refs.current = { onWijzig, onBevestig, onMaatje };
  }, [onWijzig, onBevestig, onMaatje]);

  const opBericht = useCallback((bericht: GodotBericht) => {
    if (bericht.type === "keuze" && Array.isArray(bericht.indexen)) {
      const indexen = (bericht.indexen as number[]).map(Number).sort((a, b) => a - b);
      refs.current.onWijzig(indexen.join(","));
      refs.current.onMaatje?.([]);
    }
    if (bericht.type === "lanceer") refs.current.onBevestig();
  }, []);
  const { frame, geladen, stuur } = useGodot("laser", opBericht);

  useEffect(() => {
    if (geladen) stuur({ type: "opgave", stenen });
  }, [geladen, vraagId, stenen, stuur]);

  useEffect(() => {
    if (geladen && fase !== "bezig") stuur({ type: "fase", fase, goed });
  }, [fase, geladen, goed, stuur]);

  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onKlaar?.(), 2200);
    return () => window.clearTimeout(klokje);
  }, [fase, onKlaar]);

  const goedeStenen = goed.map((i) => stenen[i]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-3 text-xl font-extrabold text-inkt-zacht">
        {stand === "tafel" ? (
          <>
            <span>Tafel van</span>
            <Gegeven waarde={figuur.tafel ?? 0} />
          </>
        ) : (
          <>
            <span>Uitkomst</span>
            <Gegeven waarde={figuur.doel ?? 0} />
          </>
        )}
      </div>

      <div data-godotvak="" className="relative w-full max-w-[44rem] overflow-hidden rounded-2xl border-2 border-rand bg-[#0f1b3d] aspect-[6/5]">
        <iframe ref={frame} title="De laser: raak de goede stenen" className="absolute inset-0 size-full border-0" allow="autoplay" />
        {!geladen && (
          <div className="absolute inset-0 grid place-items-center bg-[#0f1b3d] text-base font-bold text-white/80">
            De laser wordt klaargezet…
          </div>
        )}
      </div>

      {fase === "goed" && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">
          Goed zo! Je hebt ze alle drie geraakt.
        </p>
      )}
      {fase === "fout" && (
        <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">
          Deze horen erbij: {goedeStenen.join(", ")}.
        </p>
      )}
    </div>
  );
}
