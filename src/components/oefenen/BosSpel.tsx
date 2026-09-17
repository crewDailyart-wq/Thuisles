"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BOSONTWERPEN, type Bosfiguur, type Bosthema } from "@/lib/generatoren/bosspellen-catalogus";
import { Plaatjesraster } from "./Plaatjesraster";
import { Cijferinvoer } from "./Cijferinvoer";
import { VosSleepSpel, vosStenen } from "./VosSleepSpel";
import { Steenrij } from "./Stapstenen";
import { BosVos, Kikker } from "./BosDecor";
import stijl from "./BosAvontuur.module.css";

function Speelveld({ thema, children, mand = false, goed = false }: { thema: Bosthema; children: React.ReactNode; mand?: boolean; goed?: boolean }) {
  return <div className={stijl.veld} data-thema={thema} data-speelveld>
    <span className={stijl.zon} aria-hidden="true"/><span className={stijl.wolkje} aria-hidden="true"/>
    <div className={`${stijl.inhoud} ${goed ? (thema === "trein" ? stijl.vertrek : stijl.feest) : ""}`}>{children}</div>
    <BosVos className={stijl.vos}/>
    {mand ? <span className={stijl.mand} data-mand aria-hidden="true"/> : <span className={stijl.grasspriet} aria-hidden="true">✿</span>}
  </div>;
}

/** Het rekenbeeld is gedeeld door vraag, beheer en uitlegfilmpje. */
function Voorwerp({ thema }: { thema: Bosthema }) {
  return <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
    {thema === "appels" ? <><path d="M25 14Q34 5 39 10Q34 18 25 17" fill="#64a567"/><path d="M24 16L22 7" stroke="#8b572e" strokeWidth="4"/><path d="M24 17C5 6 2 35 17 42Q24 39 31 42C47 35 42 6 24 17" fill="#e8690f"/><path d="M14 21Q9 26 13 32" stroke="#ffdba5" strokeWidth="3" fill="none"/></>
      : thema === "blaadjes" ? <><path d="M7 37Q3 9 40 6Q46 37 7 37" fill="#e9a732"/><path d="M8 39L33 14M19 27L17 15M25 22L35 25" stroke="#976421" strokeWidth="2.5" fill="none"/></>
      : thema === "blokken" ? <><path d="M7 14L24 5L41 14L24 24Z" fill="#f7b46f"/><path d="M7 14V35L24 44V24Z" fill="#e8690f"/><path d="M24 24L41 14V35L24 44Z" fill="#c35313"/></>
      : thema === "sterren" ? <path d="M24 3L30 16L45 18L34 29L37 44L24 37L11 44L14 29L3 18L18 16Z" fill="#f2bb2e" stroke="#ba8620" strokeWidth="2"/>
      : thema === "trein" ? <><circle cx="11" cy="12" r="8" fill="#bc8354"/><circle cx="37" cy="12" r="8" fill="#bc8354"/><circle cx="24" cy="25" r="19" fill="#dca16d"/><ellipse cx="24" cy="33" rx="11" ry="8" fill="#ffedd2"/><circle cx="17" cy="24" r="2.5" fill="#392c27"/><circle cx="31" cy="24" r="2.5" fill="#392c27"/><ellipse cx="24" cy="30" rx="4" ry="3" fill="#392c27"/></>
      : <><circle cx="24" cy="24" r="18" fill="#e8690f" stroke="#bc5510" strokeWidth="3"/><circle cx="18" cy="17" r="5" fill="#ffbd7f"/><circle cx="24" cy="24" r="4" fill="#fff6e9"/></>}
  </svg>;
}

function Verzameling({ aantal, thema, weg = 0, opgelicht = 0, aantikbaar = false, uit = false }: { aantal: number; thema: Bosthema; weg?: number; opgelicht?: number; aantikbaar?: boolean; uit?: boolean }) {
  const [gepakt, setGepakt] = useState<Record<number, { x: number; y: number }>>({});
  return <div className={`${stijl.oogst} ${thema === "trein" ? "rounded-2xl border-b-8 border-huisstijl bg-white/70 p-3" : ""}`}>
    {Array.from({ length: aantal }, (_, i) => {
      const verdwenen = i >= aantal - weg;
      const inhoud = <><Voorwerp thema={thema}/>{verdwenen ? <span className="absolute inset-0 grid place-items-center text-3xl font-extrabold text-inkt" aria-label="weggewaaid">×</span> : i < opgelicht ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-groen text-xs font-extrabold text-white">✓</span> : null}</>;
      return aantikbaar ? <button type="button" key={i} disabled={uit || verdwenen} aria-label={`Tel voorwerp ${i + 1}`} aria-pressed={Boolean(gepakt[i])}
        className={`${stijl.pluk} ${verdwenen ? stijl.weg : ""} ${gepakt[i] ? stijl.geplukt : ""}`}
        style={{"--pluk-x": `${gepakt[i]?.x ?? 0}px`, "--pluk-y": `${gepakt[i]?.y ?? 95}px`} as CSSProperties}
        onClick={(event) => {
          const van = event.currentTarget.getBoundingClientRect();
          const naar = event.currentTarget.closest('[data-speelveld]')?.querySelector('[data-mand]')?.getBoundingClientRect();
          setGepakt((oud) => { const nieuw = { ...oud }; if (nieuw[i]) delete nieuw[i]; else nieuw[i] = { x: naar ? naar.x + naar.width / 2 - van.x - van.width / 2 : 0, y: naar ? naar.y - van.y : 95 }; return nieuw; });
        }}>{inhoud}</button> : <span key={i} className={`relative aspect-square ${stijl.gevuld} ${verdwenen ? "opacity-20" : ""}`}>{inhoud}</span>;
    })}
    {aantal === 0 && <span className="col-span-5 min-h-12" aria-label="Leeg" />}
  </div>;
}

function Rijvak({ thema, children, actief = false }: { thema: Bosthema; children: React.ReactNode; actief?: boolean }) {
  return <div className="relative min-w-0 flex-1 text-center">
    {thema === "huisjes" && <div className="mx-auto h-8 w-full bg-huisstijl [clip-path:polygon(50%_0,100%_100%,0_100%)]" />}
    <div className={`relative flex min-h-20 items-center justify-center border-2 p-1 sm:min-h-28 ${actief ? "border-huisstijl bg-huisstijl-zacht" : "border-rand bg-kaart"} ${thema === "waterlelies" ? "rounded-[45%] border-groen/40 bg-groen-zacht" : "rounded-xl"}`}>
      {children}
      {thema === "huisjes" && <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-5 w-4 -translate-x-1/2 rounded-t-full bg-[#a87642] sm:h-7 sm:w-6"/>}
    </div>
    {thema === "trein" && <div className="mx-2 flex justify-between" aria-hidden="true"><span className="size-3 rounded-full bg-inkt-zacht"/><span className="size-3 rounded-full bg-inkt-zacht"/></div>}
  </div>;
}

export function BosBeeld(props: { figuur: Bosfiguur; opgelost?: boolean; opgelicht?: number }) {
  if (props.figuur.modus === "rij" || props.figuur.modus === "ordenen") {
    const f = props.figuur;
    const rij = f.modus === "ordenen" ? [...f.getallen].sort((a,b) => f.stap * (a-b)) : f.getallen;
    return <Steenrij figuur={vosStenen(f)} ingevuld={(f.modus === "ordenen" ? rij : f.leeg.map(i => rij[i])).map((n, i) => props.opgelost || (f.modus === "ordenen" ? i : f.leeg[i]) < (props.opgelicht ?? 0) ? String(n) : "")} vosOp={Math.max(0, Math.min(rij.length - 1, (props.opgelicht ?? 1) - 1))} />;
  }
  return <Speelveld thema={props.figuur.thema}><RekenBeeld {...props}/></Speelveld>;
}

function RekenBeeld({ figuur: f, opgelost = false, opgelicht = 0 }: { figuur: Bosfiguur; opgelost?: boolean; opgelicht?: number }) {
  if (f.modus === "rij" || f.modus === "ordenen" || f.modus === "kiezen") {
    const rij = (f.modus === "ordenen" && (opgelost || opgelicht > 0)) || (f.modus === "kiezen" && opgelicht > 0)
      ? [...f.getallen].sort((a, b) => f.modus === "ordenen" ? f.stap * (a - b) : a - b) : f.getallen;
    return <div className={`flex gap-2 py-4 sm:gap-4 ${stijl.route}`}>{rij.map((n, i) => <Rijvak key={i} thema={f.thema} actief={opgelost && f.modus === "kiezen" ? n === (f.stap === 1 ? Math.max(...rij) : Math.min(...rij)) : i < opgelicht}>
      {f.thema === "waterlelies" && i === Math.min(rij.length - 1, Math.max(0, opgelicht - 1)) && <span key={`uitlegkikker-${i}`} className={stijl.kikker}><Kikker/></span>}
      <span className="text-2xl font-extrabold sm:text-4xl">{f.modus === "rij" && f.leeg.includes(i) && !opgelost && i >= opgelicht ? "?" : n}</span>
    </Rijvak>)}</div>;
  }
  if (f.modus === "hoeveelheid") {
    const goed = f.doel + (BOSONTWERPEN.find((o) => o.id === f.ontwerp)?.meerMinder ? f.stap : 0);
    return <div className="grid gap-2 sm:grid-cols-3">{f.keuzes.map((n, i) => <div key={i} className={`rounded-2xl border-2 p-1 ${opgelicht > 0 || opgelost ? n === goed ? "border-groen bg-groen-zacht" : "border-rand opacity-35" : "border-rand"}`}><Verzameling aantal={n} thema={f.thema} opgelicht={n === goed ? opgelicht : 0}/></div>)}</div>;
  }
  return <Verzameling aantal={f.modus === "maken" ? (opgelost ? f.doel : opgelicht) : f.doel} thema={f.thema} weg={f.weg} opgelicht={opgelicht} />;
}

export function BosSpel({ figuur: f, fase, onWijzig, onBevestig, onKlaar }: {
  figuur: Bosfiguur; fase: "bezig" | "goed" | "fout";
  onWijzig: (antwoord: string) => void; onBevestig: () => void; onKlaar?: () => void;
}) {
  const [waarde, setWaarde] = useState("");
  const [aantal, setAantal] = useState(0);
  const vosTelt = f.modus === "tellen" && (f.thema === "appels" || f.thema === "sterren");
  useEffect(() => {
    if (fase !== "goed" || !onKlaar || f.modus === "rij" || f.modus === "ordenen" || vosTelt) return;
    const klok = setTimeout(onKlaar, 1100);
    return () => clearTimeout(klok);
  }, [fase, onKlaar, f.modus, vosTelt]);
  const uit = fase !== "bezig";
  const gekozenKleur = fase === "goed" ? "border-groen bg-groen-zacht text-groen-diep" : fase === "fout" ? "border-rood bg-rood/10 text-rood" : "border-huisstijl bg-huisstijl-zacht";
  const knop = "min-h-14 min-w-14 rounded-2xl border-2 border-rand bg-kaart px-4 py-3 text-2xl font-extrabold transition hover:border-huisstijl focus-visible:outline-2 focus-visible:outline-huisstijl disabled:cursor-default";
  const kies = (n: number) => { setWaarde(String(n)); onWijzig(String(n)); };

  if (f.modus === "rij" || f.modus === "ordenen") return <VosSleepSpel figuur={f} fase={fase} onWijzig={onWijzig} onKlaar={onKlaar}/>;

  if (f.modus === "maken") return <div className="space-y-5">
    <Speelveld thema={f.thema} mand goed={fase === "goed"}>
    <div className="mb-5 text-center"><span className={stijl.ticket}>{f.doel}</span></div>
    <Verzameling aantal={aantal} thema={f.thema}/>
    </Speelveld>
    <div className="flex items-center justify-center gap-5">{[-1, 1].map((verschil) => <button type="button" key={verschil} aria-label={verschil > 0 ? "Kraal erbij" : "Kraal eraf"} className={verschil > 0 ? stijl.losseKraal : knop} disabled={uit || (verschil < 0 ? aantal === 0 : aantal === 20)} onClick={() => { const n = aantal + verschil; setAantal(n); onWijzig(String(n)); }}>{verschil > 0 ? <Voorwerp thema="kralen"/> : "↶"}</button>)}</div>
  </div>;

  if (f.modus === "hoeveelheid") return <Speelveld thema={f.thema} goed={fase === "goed"}><div className="grid gap-2 sm:grid-cols-3 sm:gap-4">{f.keuzes.map((n, i) => <button type="button" key={i} disabled={uit} aria-label={`Mand ${i + 1}`} aria-pressed={waarde === String(n)} className={`min-h-28 rounded-2xl border-2 border-b-8 p-2 transition ${waarde === String(n) ? gekozenKleur : "border-[#bd8854] bg-[#fff5df]"}`} onClick={() => kies(n)}><Verzameling aantal={n} thema={f.thema}/></button>)}</div></Speelveld>;

  return <div className="space-y-5">
    {vosTelt ? <Plaatjesraster aantal={f.doel} plaatje={f.thema === "appels" ? "appel" : "ster"} afbeelding={null} perRij={5} groepsruimte={false} fase={fase} antwoordGekozen={waarde !== ""} onKlaar={onKlaar} vos={{ vangend: "chatgpt-image-sep-16-2026-03-03-49-am.png", wachtend: "chatgpt-image-sep-16-2026-03-03-41-am.png", blij: "chatgpt-image-sep-16-2026-03-03-55-am.png" }}/> : f.modus !== "kiezen" ? <Speelveld thema={f.thema} mand goed={fase === "goed"}>
      <Verzameling aantal={f.doel} thema={f.thema} weg={f.weg} aantikbaar uit={uit}/>
      <span className={stijl.plukHint}>{f.thema === "appels" ? "Tik om te plukken" : "Tik en tel mee"}</span>
    </Speelveld> : <Speelveld thema="huisjes" goed={fase === "goed"}><div className="mx-auto h-28 w-48" aria-hidden="true"><span className="block text-center text-7xl">🏰</span></div><div className="text-center text-sm font-extrabold text-huisstijl-diep">Open de schatpoort</div></Speelveld>}
    {f.keuzes.length ? <div className="flex flex-wrap justify-center gap-3">{f.keuzes.map((n) => <button type="button" key={n} disabled={uit} aria-pressed={waarde === String(n)} className={`${knop} ${waarde === String(n) ? gekozenKleur : ""}`} onClick={() => kies(n)}>{n}</button>)}</div>
      : <Cijferinvoer waarde={waarde} fase={fase} markeer maxCijfers={2} onBevestig={onBevestig} onWijzig={(v) => { setWaarde(v); onWijzig(v === "" ? "" : String(Number(v))); }}/>}
  </div>;
}
