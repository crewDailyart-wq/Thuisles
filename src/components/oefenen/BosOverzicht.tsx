"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BOSONTWERPEN } from "@/lib/generatoren/bosspellen-catalogus";
import { bosGeneratoren } from "@/lib/generatoren/bosspellen";
import { BosSpel } from "./BosSpel";
import { Feestscherm } from "./Feestscherm";
import { Uitlegweergave } from "./Uitlegweergave";
import { SLEUTEL_DOEL_ID } from "@/lib/sleutelwinkel";
import { isGoed } from "@/lib/antwoord";
import { wekGeluid } from "@/lib/geluid";
import { zeg, stopPraten } from "@/lib/stem";
import type { OefenVraag } from "@/lib/vraagtypes";
import { BosMiniatuur, BosVos } from "./BosDecor";
import stijl from "./BosAvontuur.module.css";

/** Alleen een voorvertoning: dezelfde spel- en feedbackcomponenten, zonder serveracties. */
export function BosOverzicht({ spel }: { spel?: string }) {
  const [gekozen, setGekozen] = useState<number | null>(() => { const i = BOSONTWERPEN.findIndex(o => o.id === spel); return i < 0 ? null : i; });
  const [beurt, setBeurt] = useState(1);
  const [antwoord, setAntwoord] = useState("");
  const [fase, setFase] = useState<"bezig" | "goed" | "fout">("bezig");
  const [sleutels, setSleutels] = useState(0);
  const [uitlegOpen, setUitlegOpen] = useState(false);
  const [spelKlaar, setSpelKlaar] = useState(false);
  const vergrendeld = useRef(false);
  const geland = useRef(false);
  const generator = gekozen === null ? null : bosGeneratoren[gekozen];
  const som = useMemo(() => generator?.maak(generator.standaard, 1, new Set(), beurt * 917 + 31, 4)[0], [generator, beurt]);

  function reset(index: number | null) { stopPraten(); setGekozen(index); setAntwoord(""); setFase("bezig"); setUitlegOpen(false); setSpelKlaar(false); vergrendeld.current = false; geland.current = false; }
  function volgende() { setBeurt((n) => n + 1); reset(gekozen); }
  function controleer() {
    if (!som || !antwoord || vergrendeld.current) return;
    vergrendeld.current = true;
    const vraag: OefenVraag = { ...som, id: som.handtekening, opties: som.opties ?? null, hint: null, afbeelding: null, figuur: som.figuur ?? null, uitleg: null, uitlegAfbeelding: null, uitlegvorm: null, leerdoelId: "", leerdoelTitel: "" };
    if (isGoed(vraag, antwoord)) { wekGeluid(); setFase("goed"); }
    else { setFase("fout"); setUitlegOpen(true); }
  }

  return <main className={`${stijl.wereld} text-inkt`}>
    <header className="sticky top-0 z-50 border-b border-huisstijl-diep/25 bg-huisstijl text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        {gekozen === null ? <Link href="/start" className="font-extrabold">← Thuisles</Link> : <button type="button" className="min-h-11 font-extrabold" onClick={() => reset(null)}>← Alle spellen</button>}
        <span className="text-xs font-bold sm:text-sm">Voorbeeld · oefensleutels</span>
        <span className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-extrabold" aria-label={`${sleutels} oefensleutels`}>
          <span id={SLEUTEL_DOEL_ID} className="block size-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sleutel.png" alt="" className="size-8 object-contain"/>
          </span>{sleutels}
        </span>
      </div>
    </header>
    {gekozen === null ? <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className={stijl.welkom}><BosVos className={stijl.maatje}/><div className={stijl.ballon}><span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-huisstijl-diep">Tellen tot en met 20</span><h1>Kies je avontuur!</h1><p>22 spellen. Ga je mee?</p></div></div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">{BOSONTWERPEN.map((o, i) => <button type="button" key={o.id} onClick={() => reset(i)} className={stijl.kaart} aria-label={`${o.naam} — Spelen`} title={o.vaardigheid}>
        <div className={stijl.plaat} data-thema={o.thema}><BosMiniatuur thema={o.thema}/><span className={stijl.nummer}>{i + 1}</span></div>
        <div className={stijl.kaarttekst}><h2>{o.naam}</h2><span className={stijl.speel} aria-hidden="true">▶</span></div><span className="sr-only">Spelen · {o.vaardigheid}</span>
      </button>)}</div>
      <p className="mt-8 rounded-2xl bg-white/90 p-4 text-sm text-inkt-zacht">Voorbeeld: geen opgeslagen voortgang. Generators vind je in Beheer → Sjablonen → Nieuw.</p>
    </div> : som?.figuur?.soort === "bosspel" && generator ? <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-groot border border-rand bg-kaart p-5 shadow-op sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3"><span className="text-sm font-bold text-inkt-zacht">{generator.naam}</span><button type="button" onClick={() => zeg(som.vraagtekst)} aria-label="Lees de vraag voor" className="min-h-11 min-w-11 rounded-full bg-huisstijl-zacht">🔊</button></div>
        <h1 className="mb-5 text-center text-3xl font-extrabold sm:text-4xl">{som.vraagtekst}</h1>
        <BosSpel key={`${gekozen}:${beurt}`} figuur={som.figuur} fase={fase} onWijzig={setAntwoord} onBevestig={controleer} onKlaar={() => setSpelKlaar(true)}/>
        <div className="mt-6 flex justify-center gap-3">
          {fase === "bezig" && <button type="button" data-controleer="" disabled={!antwoord} onClick={controleer} className="min-h-14 rounded-2xl bg-huisstijl px-8 py-3 text-xl font-extrabold text-white disabled:opacity-40">Controleer</button>}
          {fase === "fout" && <><button type="button" onClick={() => setUitlegOpen(true)} className="min-h-12 rounded-xl bg-huisstijl-zacht px-4 font-extrabold text-huisstijl-diep">Bekijk uitleg</button><button type="button" onClick={volgende} className="min-h-12 rounded-xl bg-huisstijl px-4 font-extrabold text-white">Volgende →</button></>}
        </div>
      </div>
      {uitlegOpen && <Uitlegweergave vorm="4" script={generator.uitleganimatie.script(som.somgegevens, "4", generator.uitleganimatie.standaardStrategie("4"))} onSluit={() => { stopPraten(); setUitlegOpen(false); }}/ >}
      {fase === "goed" && spelKlaar && <Feestscherm onGeland={() => { if (!geland.current) { geland.current = true; setSleutels((n) => n + 1); } }} onAfgelopen={volgende}/>}
    </div> : null}
  </main>;
}
