"use client";

import { useMemo, useRef, useState } from "react";
import type { Bosfiguur } from "@/lib/generatoren/bosspellen-catalogus";
import type { Figuur } from "@/lib/generatoren/soort";
import { Stapstenen } from "./Stapstenen";

/** De bestaande Thuisles-houdingen uit het afbeeldingenbeheer. */
export function vosStenen(f: Bosfiguur): Extract<Figuur, { soort: "stapstenen" }> {
  return {
    soort: "stapstenen", stenen: f.getallen.map((n, i) => f.modus === "ordenen" || f.leeg.includes(i) ? null : n),
    sprong: Math.abs(f.stap) || 1, richting: f.stap < 0 ? "terug" : "vooruit",
    mascotte: "chatgpt-image-sep-15-2026-08-18-08-pm-2.png",
    mascotteSpringend: "chatgpt-image-sep-15-2026-08-18-08-pm-3.png",
    mascotteJuichend: "chatgpt-image-sep-15-2026-08-18-08-pm-4.png",
  };
}

export function VosSleepSpel({ figuur, fase, onWijzig, onKlaar }: {
  figuur: Bosfiguur; fase: "bezig" | "goed" | "fout";
  onWijzig: (antwoord: string) => void; onKlaar?: () => void;
}) {
  const stenen = useMemo(() => vosStenen(figuur), [figuur]);
  const [waarden, setWaarden] = useState<string[]>(stenen.stenen.filter(n => n === null).map(() => ""));
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const gebied = useRef<HTMLDivElement>(null);
  const gebaar = useRef<{ x: number; y: number; n: number; bewogen: boolean } | null>(null);
  const gelegd = useRef<number[]>([]);
  const uit = fase !== "bezig";
  const keuzes = useMemo(() => {
    const juist = figuur.modus === "ordenen" ? figuur.getallen : figuur.leeg.map(i => figuur.getallen[i]);
    // Bij één lege steen is er ook iets te kiezen. Geen antwoordvolgorde weggeven.
    const pool = juist.length === 1 ? [...new Set([juist[0], Math.max(0, juist[0] - 1), juist[0] < 20 ? juist[0] + 1 : juist[0] - 2])] : [...juist];
    return pool.sort((a,b) => ((a * 13 + 7) % 23) - ((b * 13 + 7) % 23));
  }, [figuur]);
  function plaats(n: number, index: number) {
    if (uit) return;
    const nieuw = waarden.map(v => v === String(n) ? "" : v);
    nieuw[index] = String(n);
    gelegd.current = [...gelegd.current.filter(i => i !== index && nieuw[i] !== ""), index];
    setWaarden(nieuw); setGekozen(null); setZweef(null);
    onWijzig(nieuw.every(Boolean) ? nieuw.join(",") : "");
  }
  function tikSteen(index: number) {
    if (uit) return;
    if (gekozen !== null) plaats(gekozen, index);
    else if (waarden[index]) {
      const nieuw = [...waarden]; nieuw[index] = "";
      setWaarden(nieuw); onWijzig(""); setGekozen(null);
    }
  }
  return <div ref={gebied} className="w-full" onPointerMove={e => {
    const g = gebaar.current;
    if (!g || uit) return;
    if (Math.hypot(e.clientX-g.x, e.clientY-g.y) > 8) g.bewogen = true;
    if (g.bewogen) setZweef({ x:e.clientX, y:e.clientY });
  }} onPointerUp={e => {
    const g = gebaar.current; gebaar.current = null; setZweef(null);
    if (!g?.bewogen || uit) return;
    for (const steen of gebied.current?.querySelectorAll<SVGElement>("[data-sleep-steen]") ?? []) {
      const r = steen.getBoundingClientRect();
      if (e.clientX >= r.left-5 && e.clientX <= r.right+5 && e.clientY >= r.top-10 && e.clientY <= r.bottom+10) {
        plaats(g.n, Number(steen.dataset.sleepSteen)); break;
      }
    }
    setGekozen(null);
  }} onPointerCancel={() => { gebaar.current = null; setZweef(null); setGekozen(null); }}>
    <Stapstenen figuur={stenen} ingevuld={waarden} fase={fase} onWijzig={() => {}} onSprongKlaar={onKlaar} onKiesSleepSteen={tikSteen}
      sleepbediening={<div className="flex w-full flex-col items-center gap-4">
        {!uit && <>
          <p className="text-center text-lg font-extrabold text-huisstijl-diep">Sleep de getallen naar de stenen.</p>
          <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Getallen om te slepen">
            {keuzes.map(n => <button key={n} type="button" disabled={waarden.includes(String(n))}
              aria-label={`Getal ${n}`} aria-pressed={gekozen === n}
              className={`grid size-16 touch-none select-none place-items-center rounded-2xl border-2 border-huisstijl text-3xl font-extrabold shadow-[0_4px_0_#b54d0a] transition active:translate-y-1 active:shadow-none disabled:invisible ${gekozen === n ? "bg-huisstijl text-white" : "bg-white text-huisstijl-diep"}`}
              onPointerDown={e => { gebaar.current = { x:e.clientX,y:e.clientY,n,bewogen:false }; setGekozen(n); e.currentTarget.setPointerCapture?.(e.pointerId); }}
              onClick={e => { if (e.detail === 0) setGekozen(n); }}>{n}</button>)}
          </div>
          <button type="button" disabled={!waarden.some(Boolean)} className="min-h-11 rounded-xl px-4 font-bold text-huisstijl-diep disabled:opacity-30" onClick={() => {
            const index = [...gelegd.current].reverse().find(i => waarden[i] !== "");
            if (index === undefined) return;
            const nieuw = [...waarden]; nieuw[index] = ""; setWaarden(nieuw); setGekozen(null); onWijzig("");
          }}>↶ Laatste terug</button>
          <span className="sr-only">Je kunt ook een getal aantikken en daarna een steen. Tik een gevuld getal terug om te veranderen.</span>
        </>}
      </div>}/>
    {zweef && gekozen !== null && <span aria-hidden="true" className="pointer-events-none fixed z-[80] grid size-16 place-items-center rounded-2xl border-2 border-white bg-huisstijl text-3xl font-extrabold text-white shadow-lg" style={{left:zweef.x-32,top:zweef.y-32}}>{gekozen}</span>}
  </div>;
}
