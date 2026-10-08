"use client";

/**
 * Een Godot-spel op het oefenscherm, van het algemene soort (oktober 2026).
 *
 * Eén component voor alle nieuwe Godot-bouwstenen. Welk spel er in het iframe
 * komt en wat er naar Godot gaat, staat in de figuur (`soort: "godotspel"`),
 * die de generator maakt. Thuisles kijkt na; Godot laat zien en laat kiezen
 * (zie `lib/godot/brug.ts`).
 *
 *   Thuisles → Godot   { type: "opgave", stand, ...opgave }
 *                      { type: "fase", fase, antwoord }   na Controleer
 *   Godot → Thuisles   { type: "antwoord", waarde }        bij invoer "kiezen"
 *                      { type: "lanceer" }                 = Controleer
 *                      { type: "klaar", klaar }            het invulvak mag open
 *
 * Bij invoer "typen" staat er een echt invulvak in de kop (HARDE REGEL 5), op
 * de plek van het vraagteken. Zonder `key` per vraag: Godot laadt één keer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Invulvak } from "@/components/oefenen/Splitsopdracht";
import { useGodot, type GodotBericht } from "@/lib/godot/brug";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type GodotSpelfiguur = Extract<Figuur, { soort: "godotspel" }>;

export function isGodotSpelfiguur(figuur: Figuur | null | undefined): figuur is GodotSpelfiguur {
  return !!figuur && figuur.soort === "godotspel";
}

export function GodotSpelOpdracht({
  vraagId,
  figuur,
  juist,
  antwoord,
  fase,
  onWijzig,
  onBevestig,
  onKlaar,
  onMaatje,
}: {
  vraagId: string;
  figuur: GodotSpelfiguur;
  /** Het goede antwoord; gaat na Controleer naar Godot, zodat het spel de goede manier kan laten zien. */
  juist: string;
  antwoord: string;
  fase: Fase;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  onKlaar?: () => void;
  onMaatje?: (zinnen: string[]) => void;
}) {
  const { spel, stand, invoer, kop, label, opgave } = figuur;
  const uit = fase !== "bezig";
  const [getypt, setGetypt] = useState(antwoord);
  const [klaar, setKlaar] = useState(!figuur.wacht);
  const veld = useRef<HTMLInputElement | null>(null);
  const refs = useRef({ onWijzig, onBevestig, onMaatje });
  useEffect(() => {
    refs.current = { onWijzig, onBevestig, onMaatje };
  }, [onWijzig, onBevestig, onMaatje]);

  const opBericht = useCallback(
    (bericht: GodotBericht) => {
      if (bericht.type === "antwoord" && typeof bericht.waarde === "string") {
        refs.current.onWijzig(bericht.waarde);
        refs.current.onMaatje?.([]);
      }
      if (bericht.type === "klaar") setKlaar(bericht.klaar === true);
      if (bericht.type === "lanceer") refs.current.onBevestig();
    },
    [],
  );
  const { frame, geladen, stuur } = useGodot(spel, opBericht);

  /* Een nieuwe opgave: het vakje leeg, en (zo nodig) weer dicht tot Godot klaar meldt. */
  const [vorige, setVorige] = useState(vraagId);
  if (vorige !== vraagId) {
    setVorige(vraagId);
    setGetypt("");
    setKlaar(!figuur.wacht);
  }
  useEffect(() => {
    if (geladen) stuur({ type: "opgave", stand, ...opgave });
  }, [geladen, vraagId, stand, opgave, stuur]);

  useEffect(() => {
    if (geladen && fase !== "bezig") stuur({ type: "fase", fase, antwoord: juist });
  }, [fase, geladen, juist, stuur]);

  useEffect(() => {
    if (invoer === "typen" && klaar && fase === "bezig" && geladen) veld.current?.focus({ preventScroll: true });
  }, [invoer, klaar, fase, geladen]);

  /* Komt "klaar" niet (een traag apparaat, een tabblad op de achtergrond), dan gaat het vakje na een paar tellen toch open. */
  useEffect(() => {
    if (klaar || !geladen) return;
    const klokje = window.setTimeout(() => setKlaar(true), 3500);
    return () => window.clearTimeout(klokje);
  }, [klaar, geladen, vraagId]);

  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onKlaar?.(), 1800);
    return () => window.clearTimeout(klokje);
  }, [fase, onKlaar]);

  function typ(tekst: string) {
    if (uit) return;
    setGetypt(tekst);
    onWijzig(tekst);
  }

  const gegeven = invoer === "typen" ? getypt : antwoord;
  const uitslag = !uit ? null : gegeven.trim() === juist.trim() ? "goed" : "fout";
  const [voor, ...rest] = kop.split("?");
  const na = rest.join("?");

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {figuur.uitleg && figuur.uitleg.length > 0 && (
        <div data-uitlegblok="" className="w-full max-w-[44rem] rounded-2xl border-2 border-rand bg-white/5 px-5 py-4 text-xl font-bold leading-snug">
          {figuur.uitleg.map((z, i) => (
            <p key={i}>{z}</p>
          ))}
        </div>
      )}

      {kop.trim() !== "" && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-extrabold">
          {invoer === "typen" && kop.includes("?") ? (
            <>
              {voor.trim() !== "" && <span>{voor.trim()}</span>}
              <Invulvak
                waarde={getypt}
                uitslag={uitslag}
                label={label}
                uit={uit || !klaar}
                veldRef={(el) => {
                  veld.current = el;
                }}
                onTyp={typ}
                onBevestig={onBevestig}
              />
              {na.trim() !== "" && <span>{na.trim()}</span>}
            </>
          ) : kop.includes("?") ? (
            /* Kiezen in het spel: op de plek van het vraagteken staat wat het kind koos. */
            <>
              {voor.trim() !== "" && <span>{voor.trim()}</span>}
              <span
                className={`grid min-w-14 place-items-center rounded-xl border-2 px-3 py-1 ${
                  uitslag === "goed" ? "border-groen bg-groen-zacht text-groen-diep" : uitslag === "fout" ? "border-roze bg-roze-zacht text-roze" : "border-rand"
                }`}
              >
                {antwoord.trim() !== "" ? antwoord : "?"}
              </span>
              {na.trim() !== "" && <span>{na.trim()}</span>}
            </>
          ) : (
            <span>{kop}</span>
          )}
        </div>
      )}

      {/*
        Het speelvlak, zonder kader: zo groot als het scherm toelaat. Hoe breed
        precies, staat in globals.css ([data-godotvak]): op een laptop moeten
        de som, het spel en Controleer samen in beeld blijven.
      */}
      <div
        data-godotvak=""
        className="relative w-full overflow-hidden aspect-video"
      >
        <iframe ref={frame} title={label} className="absolute inset-0 size-full border-0" allow="autoplay" />
        {!geladen && (
          <div className="absolute inset-0 grid place-items-center text-base font-bold text-white/80">
            Het spel wordt klaargezet…
          </div>
        )}
      </div>

      {fase === "goed" && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">{figuur.goedZin}</p>
      )}
      {fase === "fout" && (
        <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">{figuur.foutZin}</p>
      )}
    </div>
  );
}
