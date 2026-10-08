"use client";

/**
 * De raket op het oefenscherm (oktober 2026), een Godot-bouwsteen.
 *
 * Bovenaan de som met twee vakjes (▢ + ▢ = 9) die zich vullen met de stenen
 * die het kind in Godot aantikt; eronder de raket in een iframe. Kiezen is
 * tikken, dus hier staat geen invulvak. Thuisles kijkt na, Godot vliegt alleen
 * (zie `lib/godot/brug.ts`). Tikken op de planeet is hetzelfde als Controleer.
 *
 * Net als de groepjesmaker zonder `key` per vraag: Godot laadt maar één keer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { useGodot, type GodotBericht } from "@/lib/godot/brug";
import { RAKET_ZINNEN } from "@/lib/godot/zinnen";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type Raketfiguur = Extract<Figuur, { soort: "raketsom" }>;

export function isRaketfiguur(figuur: Figuur | null | undefined): figuur is Raketfiguur {
  return !!figuur && figuur.soort === "raketsom";
}

export function RaketOpdracht({
  vraagId,
  figuur,
  juist,
  fase,
  onWijzig,
  onBevestig,
  onKlaar,
  onMaatje,
}: {
  vraagId: string;
  figuur: Raketfiguur;
  /** Het goede paar, "4,5". */
  juist: string;
  fase: Fase;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  onKlaar?: () => void;
  onMaatje?: (zinnen: string[]) => void;
}) {
  const { doel, stenen, vast } = figuur;
  const [gekozen, setGekozen] = useState<number[]>(vast >= 0 ? [stenen[vast]] : []);
  const maatjeRef = useRef(onMaatje);
  const wijzigRef = useRef(onWijzig);
  const bevestigRef = useRef(onBevestig);
  useEffect(() => {
    maatjeRef.current = onMaatje;
    wijzigRef.current = onWijzig;
    bevestigRef.current = onBevestig;
  }, [onMaatje, onWijzig, onBevestig]);

  const opBericht = useCallback((bericht: GodotBericht) => {
    if (bericht.type === "keuze" && Array.isArray(bericht.getallen)) {
      const getallen = (bericht.getallen as number[]).map(Number);
      setGekozen(getallen);
      /* Het antwoord is het paar van klein naar groot: de volgorde telt niet. */
      wijzigRef.current(getallen.length === 2 ? [...getallen].sort((a, b) => a - b).join(",") : "");
      maatjeRef.current?.([]);
    }
    if (bericht.type === "lanceer") bevestigRef.current();
    if (bericht.type === "zeg" && Array.isArray(bericht.sleutels)) {
      const zinnen = (bericht.sleutels as string[]).flatMap((s) => RAKET_ZINNEN[s] ?? []);
      if (zinnen.length > 0) maatjeRef.current?.(zinnen);
    }
  }, []);
  const { frame, geladen, stuur } = useGodot("raket", opBericht);

  /* Een nieuwe opgave: de vakjes leeg, en de stenen naar Godot. */
  const [vorige, setVorige] = useState(vraagId);
  if (vorige !== vraagId) {
    setVorige(vraagId);
    setGekozen(vast >= 0 ? [stenen[vast]] : []);
  }
  useEffect(() => {
    if (geladen) stuur({ type: "opgave", doel, stenen, vast });
  }, [geladen, vraagId, doel, stenen, vast, stuur]);

  useEffect(() => {
    if (geladen && fase !== "bezig") stuur({ type: "fase", fase, goed: juist.split(",").map(Number) });
  }, [fase, geladen, juist, stuur]);

  /* Na een goed antwoord vliegt de raket eerst; daarna het feest. */
  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onKlaar?.(), 2600);
    return () => window.clearTimeout(klokje);
  }, [fase, onKlaar]);

  const teken = (t: string) => <span className="text-2xl font-extrabold text-inkt-zacht">{t}</span>;
  const vakje = (n: number | undefined, i: number) =>
    n === undefined ? (
      <span
        key={i}
        aria-label="Nog geen steen gekozen"
        className="grid size-16 place-items-center rounded-2xl border-2 border-dashed border-rand text-2xl font-extrabold text-inkt-zacht sm:size-[4.25rem]"
      >
        ?
      </span>
    ) : (
      <Gegeven key={i} waarde={n} />
    );
  const goedePaar = juist.split(",").map(Number);
  const getoond = fase === "fout" ? goedePaar : gekozen;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-3" aria-live="polite">
        {vakje(getoond[0], 0)}
        {teken("+")}
        {vakje(getoond[1], 1)}
        {teken("=")}
        <Gegeven waarde={doel} />
      </div>

      <div data-godotvak="" className="relative w-full max-w-[44rem] overflow-hidden rounded-2xl border-2 border-rand bg-[#0f1b3d] aspect-[6/5]">
        <iframe ref={frame} title="De raket: kies twee stenen" className="absolute inset-0 size-full border-0" allow="autoplay" />
        {!geladen && (
          <div className="absolute inset-0 grid place-items-center bg-[#0f1b3d] text-base font-bold text-white/80">
            De raket wordt klaargezet…
          </div>
        )}
      </div>

      {fase === "goed" && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">
          Goed zo! {goedePaar[1]} en {goedePaar[0]} is samen {doel}.
        </p>
      )}
      {fase === "fout" && (
        <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">
          {goedePaar[1]} en {goedePaar[0]} maken samen {doel}.
        </p>
      )}
    </div>
  );
}
