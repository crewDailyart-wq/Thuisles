"use client";

/**
 * Gesprek met Bliepo — gedeeld onderdeel voor alle nieuwe lessen en
 * opdrachten (24 oktober 2026, akkoord eigenaar op het voorbeeld op
 * /voorbeeld-bliepo). De oude opdrachten gebruiken het niet: die gaan naar
 * concepten.
 *
 * Wat er in zit:
 * - `useGesprek()`: houdt de alinea's bij en laat Bliepo zinnen zeggen. Elke
 *   zin wordt een eigen alinea; hooguit drie van Bliepo plus het laatste
 *   antwoord van het kind, de oudste schuift rustig weg. Een zin komt met de
 *   precieze tijden per woord van ElevenLabs (Ruth, /api/stem/tijden; één keer
 *   gemaakt en bewaard, daarna gratis); lukt dat niet, dan de gewone stem met
 *   geschatte tijden. De stem meldt elke zin (lib/voorlezen.ts), zodat de
 *   3D-Bliepo en de filmpjes de gebaren op de woorden maken.
 * - `<GesprekTekst>`: de alinea's, links uitgelijnd, groot, dik en wit, zonder
 *   ballon. Meelezen: nog niet gezegd = gedimd, gezegd = wit, het woord van nu
 *   = warme accentkleur ("Woorden oplichten" uit: alles meteen wit).
 * - `<Antwoordknoppen>`: grote, ronde knoppen; Bliepo leest ze niet voor.
 * - `<Praatknop>`: een ronde microfoonknop naast Bliepo. Eén keer tikken;
 *   Bliepo luistert en stopt vanzelf na ongeveer een tel stilte (hooguit 15
 *   tellen), of als het kind nog een keer tikt. Tijdens het luisteren: zachte
 *   golfjes van de stem van het kind op Bliepo's scherm (lib/bliepo-geluid.ts,
 *   luisterNiveau), Bliepo kijkt naar het kind met zijn hoofd licht schuin, en
 *   de knop pulseert zacht mee. De opname gaat naar de tutor (/api/tutor) en
 *   wordt nergens bewaard.
 * - `<BliepoGesprek>`: alles samen in één kolom (tekst, knoppen, Bliepo met de
 *   praatknop ernaast), met een gesprek uit vaste stappen. De eerste keer op
 *   dit apparaat wijst Bliepo de praatknop aan: "Wil je mij iets vragen? Tik
 *   dan hier."
 *
 * Kleuren, lettertype en knopvorm komen uit de stijlkiezer (/admin/stijl, CSS-
 * variabelen --stijl-…); zonder keuze de standaard.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BliepoVloer } from "@/components/oefenen/BliepoVloer";
import { useOplichten, useWoordNu } from "@/components/oefenen/BliepoTekst";
import { zetLuisteren } from "@/lib/bliepo-geluid";
import { speelAntwoord, stopPraten, zegEnWacht } from "@/lib/stem";
import { meldVoorlezen, spraakGrenzen, stopVoorlezen } from "@/lib/voorlezen";
import { PRAATKNOP_UITLEG, PRATEN_UIT } from "./teksten";
import "./gesprek.css";

export type Knop = { label: string; naar: string };
/** Een stap in een gesprek: wat Bliepo zegt (een zin per alinea), waarmee het kind kan antwoorden, en eventueel een gebaar bij de eerste zin. */
export type Stap = { zinnen: string[]; knoppen: Knop[]; gebaar?: string };
export type Alinea = {
  id: number;
  van: "bliepo" | "kind";
  tekst: string;
  /** Precieze tijden per woord (seconden) en wanneer het geluid begon (performance.now), als die er zijn. */
  tijden?: { begin: number }[];
  start?: number;
  /** Helemaal gezegd (alles wit). */
  klaar?: boolean;
  /** Schuift weg (de oudste, als het te veel wordt). */
  weg?: boolean;
};
/** Het gebaar voor de 3D-Bliepo (Bliepo3DGedeeld, prop `gebaar`). */
export type Gebaar = { naam: string; n: number; opStem?: boolean };

export { PRAATKNOP_UITLEG };
const UITLEG_SLEUTEL = "thuisles:praatknop-uitgelegd";
const MAX_BLIEPO = 3;
const MAX_SECONDEN = 15;
const STILTE_MS = 1000;

type Woord = { woord: string; begin: number; eind: number };
type Opname = { data: ArrayBuffer; woorden: Woord[] };
const opnames = new Map<string, Promise<Opname | null>>();

/** Een zin van Ruth met de tijden per woord (bewaard op de server; elke zin wordt hooguit één keer gemaakt). */
export function haalZinMetTijden(zin: string, groep = 3): Promise<Opname | null> {
  const sleutel = `${groep}\n${zin}`;
  let p = opnames.get(sleutel);
  if (!p) {
    p = fetch(`/api/stem/tijden?zin=${encodeURIComponent(zin)}&groep=${groep}`)
      .then((a) => (a.ok ? a.json() : null))
      .then((j: { audio: string; woorden: Woord[] } | null) =>
        j ? { data: Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0)).buffer, woorden: j.woorden } : null,
      )
      .catch(() => null);
    void p.then((o) => !o && opnames.delete(sleutel));
    opnames.set(sleutel, p);
  }
  return p;
}

const wachtEven = (ms: number) => new Promise<void>((klaar) => setTimeout(klaar, ms));

/** Het gesprek: de alinea's en Bliepo die zinnen zegt. */
export function useGesprek({ groep = 3 }: { groep?: number } = {}) {
  const [alineas, zetAlineas] = useState<Alinea[]>([]);
  const teller = useRef(0);
  /** Elke nieuwe beurt (een stap, een vraag van het kind) maakt de vorige ongeldig. */
  const beurt = useRef(0);

  useEffect(
    () => () => {
      beurt.current += 1;
      stopPraten();
      stopVoorlezen();
    },
    [],
  );

  /*
    Een alinea erbij; zijn het er te veel, dan schuift de oudste rustig weg:
    hooguit drie zinnen van Bliepo, plus het laatste antwoord van het kind (zo
    zie je waar hij op reageert).
  */
  const voegToe = useCallback((a: Omit<Alinea, "id">) => {
    const id = ++teller.current;
    zetAlineas((oud) => {
      const zichtbaar = [...oud.filter((x) => !x.weg), { ...a, id }];
      const weg = new Set<number>();
      for (const [van, max] of [["bliepo", MAX_BLIEPO], ["kind", 1]] as const) {
        const rij = zichtbaar.filter((x) => x.van === van);
        rij.slice(0, Math.max(0, rij.length - max)).forEach((x) => weg.add(x.id));
      }
      return [...oud.map((x) => (weg.has(x.id) ? { ...x, weg: true } : x)), { ...a, id }];
    });
    window.setTimeout(() => zetAlineas((oud) => oud.filter((x) => !x.weg)), 650);
    return id;
  }, []);
  const werkBij = useCallback((id: number, deel: Partial<Alinea>) => {
    zetAlineas((oud) => oud.map((x) => (x.id === id ? { ...x, ...deel } : x)));
  }, []);

  /** Eén zin: in beeld (gedimd), Ruth zegt hem, de woorden lichten mee op. */
  const zegZin = useCallback(
    async (zin: string, mijn = beurt.current) => {
      const id = voegToe({ van: "bliepo", tekst: zin });
      const o = await haalZinMetTijden(zin, groep);
      if (mijn !== beurt.current) return;
      if (!o) {
        /* Geen bewaarde zin (en ElevenLabs lukt niet): de gewone stem, met geschatte tijden. */
        await Promise.race([zegEnWacht([zin]), wachtEven(8000)]);
        werkBij(id, { klaar: true });
        return;
      }
      let grenzen: { begin: number; eind: number } | null = null;
      const tijden = o.woorden.map((w) => ({ begin: w.begin, eind: w.eind }));
      await speelAntwoord(o.data.slice(0), {
        metGeluid: (b) => (grenzen = spraakGrenzen(b.getChannelData(0), b.sampleRate)),
        gestart: () => {
          meldVoorlezen(zin, grenzen ?? { begin: 0.05, eind: 1 }, tijden);
          werkBij(id, { tijden, start: performance.now() });
        },
      });
      stopVoorlezen();
      werkBij(id, { klaar: true });
    },
    [groep, voegToe, werkBij],
  );

  /** Een paar zinnen na elkaar, met een korte adempauze. Geeft false als er intussen iets anders begon. */
  const zegZinnen = useCallback(
    async (zinnen: string[], bijZin?: (i: number) => void) => {
      const mijn = ++beurt.current;
      for (let i = 0; i < zinnen.length; i++) {
        if (mijn !== beurt.current) return false;
        bijZin?.(i);
        await zegZin(zinnen[i], mijn);
        await wachtEven(280);
      }
      return mijn === beurt.current;
    },
    [zegZin],
  );

  /** Een antwoord van de tutor: met eigen geluid (live) of met de gewone stem. */
  const zegAntwoord = useCallback(
    async (a: { zinnen: string[]; audio?: ArrayBuffer }) => {
      const mijn = ++beurt.current;
      if (a.audio && a.zinnen.length) {
        const tekst = a.zinnen.join(" ");
        const id = voegToe({ van: "bliepo", tekst });
        let grenzen: { begin: number; eind: number } | null = null;
        await speelAntwoord(a.audio, {
          metGeluid: (b) => (grenzen = spraakGrenzen(b.getChannelData(0), b.sampleRate)),
          /* Geen precieze tijden bij een live antwoord: geschat uit het geluid (lib/voorlezen.ts). */
          gestart: () => meldVoorlezen(tekst, grenzen ?? { begin: 0.05, eind: 2 }),
        });
        stopVoorlezen();
        werkBij(id, { klaar: true });
      } else {
        for (const zin of a.zinnen) {
          if (mijn !== beurt.current) return false;
          const id = voegToe({ van: "bliepo", tekst: zin });
          await Promise.race([zegEnWacht([zin]), wachtEven(9000)]);
          werkBij(id, { klaar: true });
        }
      }
      return mijn === beurt.current;
    },
    [voegToe, werkBij],
  );

  /** Alles stil en leeg (opnieuw beginnen). */
  const wis = useCallback(() => {
    beurt.current += 1;
    stopPraten();
    stopVoorlezen();
    zetAlineas([]);
  }, []);
  /** Wat Bliepo zei afbreken (bijvoorbeeld omdat het kind iets gaat vragen). */
  const onderbreek = useCallback(() => {
    beurt.current += 1;
    stopPraten();
    stopVoorlezen();
  }, []);

  const kindZegt = useCallback((tekst: string) => voegToe({ van: "kind", tekst, klaar: true }), [voegToe]);

  return { alineas, zegZin, zegZinnen, zegAntwoord, kindZegt, wis, onderbreek };
}

/** De alinea's van het gesprek. */
export function GesprekTekst({ alineas, oplichten, leeg }: { alineas: Alinea[]; oplichten: boolean; leeg?: React.ReactNode }) {
  return (
    <div className="gs-gesprek" aria-live="polite">
      {!alineas.length && leeg}
      {alineas.map((a) =>
        a.van === "kind" ? (
          <p key={a.id} className={`gs-kind${a.weg ? " gs-weg" : ""}`}>
            <span className="sr-only">Jij: </span>
            {a.tekst}
          </p>
        ) : (
          <AlineaTekst key={a.id} alinea={a} oplichten={oplichten} />
        ),
      )}
    </div>
  );
}

/** Een alinea van Bliepo: gedimd, wit als het gezegd is, het woord van nu in de accentkleur. */
function AlineaTekst({ alinea, oplichten }: { alinea: Alinea; oplichten: boolean }) {
  const woorden = alinea.tekst.trim().split(/\s+/);
  /* Zonder precieze tijden (live antwoord, gewone stem): het geschatte woord van de stem. */
  const geschat = useWoordNu(oplichten && !alinea.tijden && !alinea.klaar ? alinea.tekst : null);
  const [nu, zetNu] = useState(-1);
  useEffect(() => {
    if (!oplichten || !alinea.tijden || alinea.start === undefined || alinea.klaar) return;
    const { tijden, start } = alinea;
    let frame = 0;
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      let i = -1;
      for (let k = 0; k < tijden.length; k++) if (tijden[k].begin <= t) i = k;
      zetNu(i);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [oplichten, alinea]);
  const woordNu = alinea.klaar ? woorden.length : alinea.tijden ? nu : geschat;
  return (
    <p className={`gs-alinea${alinea.weg ? " gs-weg" : ""}${oplichten ? " gs-meelezen" : ""}`}>
      {woorden.map((w, i) => (
        <span key={i} className={`gs-woord${woordNu >= i ? " gs-gezegd" : ""}${!alinea.klaar && woordNu === i ? " gs-nu" : ""}`}>
          {w}
          {i < woorden.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/** Grote, ronde antwoordknoppen (Bliepo leest ze niet voor). */
export function Antwoordknoppen({ knoppen, onKies }: { knoppen: Knop[]; onKies: (k: Knop) => void }) {
  return (
    <div className="gs-knoppen" role="group" aria-label="Antwoorden">
      {knoppen.map((k, i) => (
        <button key={k.label} type="button" className="gs-knop" style={{ animationDelay: `${i * 90}ms` }} onClick={() => onKies(k)}>
          {k.label}
        </button>
      ))}
    </div>
  );
}

export type TutorAntwoord = { gehoord?: string; zinnen: string[]; audio?: ArrayBuffer };
/** Waar de vraag van het kind over gaat (voor de tutor). */
export type TutorOnderwerp = { opgaveId: string; opgaveTekst: string; domein?: string; leerdoel?: string; demo?: boolean; groep?: number };

/**
 * De ronde microfoonknop. Eén keer tikken: Bliepo luistert tot het kind een
 * tel stil is (of nog een keer tikt, of na 15 tellen), dan gaat de opname naar
 * de tutor.
 */
export function Praatknop({
  onderwerp,
  uit = false,
  aangewezen = false,
  onBegin,
  onAntwoord,
  onKlaar,
  dicht = false,
  onDicht,
}: {
  onderwerp: () => TutorOnderwerp;
  uit?: boolean;
  /**
   * "Praten met Bliepo" staat uit voor dit kind (26 oktober 2026, opdracht
   * eigenaar): de knop staat er wel, maar grijs; een tik roept `onDicht` aan
   * (Bliepo legt dan uit dat papa of mama het kan aanzetten).
   */
  dicht?: boolean;
  onDicht?: () => void;
  /** Bliepo wijst de knop nu aan (de eerste keer): de knop licht op. */
  aangewezen?: boolean;
  onBegin?: () => void;
  onAntwoord: (a: TutorAntwoord) => void | Promise<void>;
  /** Klaar zonder antwoord (niets gehoord, geen microfoon, iets mis). */
  onKlaar?: () => void;
}) {
  const [stand, zetStand] = useState<"klaar" | "luistert" | "denkt">("klaar");
  const [melding, zetMelding] = useState("");
  const knop = useRef<HTMLButtonElement>(null);
  const opname = useRef<{
    recorder: MediaRecorder;
    stukken: Blob[];
    begin: number;
    stream: MediaStream;
    context: AudioContext;
    frame: number;
    gepraat: number;
    laatsteStem: number;
  } | null>(null);
  const hintStap = useRef(0);
  const stopRef = useRef<(verstuur: boolean) => Promise<void>>(async () => {});

  useEffect(
    () => () => {
      const o = opname.current;
      if (!o) return;
      cancelAnimationFrame(o.frame);
      o.stream.getTracks().forEach((t) => t.stop());
      void o.context.close();
      zetLuisteren(null);
    },
    [],
  );

  const begin = async () => {
    if (stand !== "klaar" || uit) return;
    onBegin?.();
    stopPraten();
    zetMelding("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      zetMelding("Ik mag de microfoon niet gebruiken. Vraag een volwassene om de microfoon aan te zetten.");
      onKlaar?.();
      return;
    }
    const soort = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((s) => MediaRecorder.isTypeSupported?.(s));
    const recorder = new MediaRecorder(stream, soort ? { mimeType: soort } : undefined);
    const stukken: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && stukken.push(e.data);
    recorder.start(250);

    /*
      Luisteren naar de stem van het kind: hoe hard (voor de golfjes op
      Bliepo's scherm en het pulseren van de knop) en of het stil is. De
      stilte-drempel past zich aan het geruis in de kamer aan.
    */
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new Ctx();
    void context.resume();
    const bron = context.createMediaStreamSource(stream);
    const meter = context.createAnalyser();
    meter.fftSize = 1024;
    bron.connect(meter);
    const monsters = new Float32Array(meter.fftSize);
    let ruis = -60;
    let niveau = 0;
    const nu0 = performance.now();
    const o = { recorder, stukken, begin: nu0, stream, context, frame: 0, gepraat: 0, laatsteStem: 0 };
    opname.current = o;
    zetLuisteren(() => niveau);
    let vorige = nu0;
    const meet = (t: number) => {
      const dt = t - vorige;
      vorige = t;
      meter.getFloatTimeDomainData(monsters);
      let som = 0;
      for (let i = 0; i < monsters.length; i++) som += monsters[i] * monsters[i];
      const db = 10 * Math.log10(som / monsters.length + 1e-12);
      /* Het geruis volgt langzaam de stilste stukken. */
      ruis = db < ruis ? ruis + (db - ruis) * 0.2 : ruis + (db - ruis) * 0.004;
      const drempel = Math.max(ruis + 10, -50);
      const stem = db > drempel;
      if (stem) {
        o.gepraat += dt;
        o.laatsteStem = t;
      }
      const doel = Math.max(0, Math.min(1, (db - drempel + 6) / 30));
      niveau += (doel - niveau) * (doel > niveau ? 0.5 : 0.15);
      knop.current?.style.setProperty("--gs-luid", niveau.toFixed(3));
      const duur = t - o.begin;
      /* Stoppen: een tel stil na het praten, hooguit 15 tellen, of 6 tellen niets gezegd. */
      if ((o.gepraat > 250 && t - o.laatsteStem > STILTE_MS) || duur > MAX_SECONDEN * 1000 || (o.gepraat < 150 && duur > 6000)) {
        void stopRef.current(o.gepraat > 250);
        return;
      }
      o.frame = requestAnimationFrame(meet);
    };
    o.frame = requestAnimationFrame(meet);
    zetStand("luistert");
  };

  const stop = async (verstuur: boolean) => {
    const o = opname.current;
    if (!o) return;
    opname.current = null;
    cancelAnimationFrame(o.frame);
    zetLuisteren(null);
    knop.current?.style.setProperty("--gs-luid", "0");
    const duur = (performance.now() - o.begin) / 1000;
    await new Promise<void>((klaar) => {
      o.recorder.onstop = () => klaar();
      o.recorder.stop();
    });
    o.stream.getTracks().forEach((t) => t.stop());
    void o.context.close();
    if (!verstuur) {
      zetStand("klaar");
      zetMelding("Ik hoorde niets. Tik nog eens en praat maar.");
      onKlaar?.();
      return;
    }
    zetStand("denkt");
    const formulier = new FormData();
    formulier.append("audio", new Blob(o.stukken, { type: o.recorder.mimeType || "audio/webm" }), "vraag");
    formulier.append("seconden", String(Math.round(duur * 10) / 10));
    const ow = onderwerp();
    formulier.append("context", JSON.stringify({ ...ow, hintStap: hintStap.current, gesprek: [] }));
    const antwoord = await fetch("/api/tutor", { method: "POST", body: formulier }).catch(() => null);
    const j = (await antwoord?.json().catch(() => null)) as
      | { soort?: string; zinnen?: string[]; tekst?: string; audio?: string; hintStap?: number; gehoord?: string }
      | null;
    zetStand("klaar");
    if (!antwoord?.ok || !j) {
      zetMelding("Er ging iets mis. Probeer het zo nog eens.");
      onKlaar?.();
      return;
    }
    if (typeof j.hintStap === "number") hintStap.current = j.hintStap;
    const audio = j.tekst && j.audio ? Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0)).buffer : undefined;
    const zinnen = audio && j.tekst ? [j.tekst] : j.soort === "herhaal" ? [ow.opgaveTekst] : (j.zinnen ?? (j.tekst ? [j.tekst] : []));
    await onAntwoord({ gehoord: j.gehoord, zinnen, audio });
  };

  useEffect(() => {
    stopRef.current = stop;
  });

  const label = dicht
    ? "Praten met Bliepo staat uit"
    : stand === "luistert"
      ? "Ik luister. Tik nog eens als je klaar bent."
      : stand === "denkt"
        ? "Bliepo denkt na"
        : "Tik om iets te zeggen";
  return (
    <div className="gs-praat">
      <button
        ref={knop}
        type="button"
        disabled={uit || stand === "denkt"}
        title={label}
        className={`gs-praatknop${dicht ? " gs-dicht" : ""}${stand === "luistert" ? " gs-luistert" : ""}${stand === "denkt" ? " gs-denkt" : ""}${aangewezen ? " gs-aangewezen" : ""}`}
        aria-disabled={dicht || undefined}
        onClick={() => (dicht ? onDicht?.() : stand === "luistert" ? void stop(true) : void begin())}
      >
        <svg viewBox="0 0 24 24" className="gs-microfoon" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        <span className="sr-only">{label}</span>
      </button>
      {melding && (
        <p className="gs-melding" role="status">
          {melding}
        </p>
      )}
    </div>
  );
}

/**
 * Het hele gesprek in één kolom: tekst, antwoordknoppen, Bliepo (als
 * `children`) met de praatknop ernaast. Het gesprek loopt over vaste stappen;
 * `start` is de eerste. Zet `begin` op een nieuw getal om (opnieuw) te
 * beginnen (een tik is nodig voordat er geluid mag).
 */
export function BliepoGesprek({
  stappen,
  start = "start",
  begin,
  onderwerp,
  oplichten: oplichtenEigen,
  uitlegAltijd = false,
  onGebaar,
  leeg,
  children,
  plek = "gesprek",
}: {
  stappen: Record<string, Stap>;
  start?: string;
  begin: number;
  onderwerp: Omit<TutorOnderwerp, "opgaveTekst">;
  oplichten?: boolean;
  /** De uitleg van de praatknop altijd laten zien (voorbeeld), niet alleen de eerste keer. */
  uitlegAltijd?: boolean;
  /** Een gebaar voor de 3D-Bliepo (zie Bliepo3DGedeeld, prop `gebaar`). */
  onGebaar?: (naam: string, opStem: boolean) => void;
  leeg?: React.ReactNode;
  /** Een eigen Bliepo; zonder staat de gewone 3D-Bliepo er. */
  children?: React.ReactNode;
  /** "vast": op de cirkel rechts in een opdracht; "gesprek": in een eigen vak. */
  plek?: "vast" | "gesprek";
}) {
  const voorkeur = useOplichten();
  const oplichten = oplichtenEigen ?? voorkeur;
  const g = useGesprek({ groep: onderwerp.groep ?? 3 });
  const [knoppen, zetKnoppen] = useState<Knop[]>([]);
  const [aangewezen, zetAangewezen] = useState(false);
  const stapNu = useRef(start);
  const laatsteVraag = useRef("");
  const uitgelegd = useRef(false);

  const speelStap = useCallback(
    async (naam: string) => {
      const stap = stappen[naam];
      if (!stap) return;
      stapNu.current = naam;
      zetKnoppen([]);
      const af = await g.zegZinnen(stap.zinnen, (i) => {
        if (i === 0 && stap.gebaar) onGebaar?.(stap.gebaar, true);
        if (/\?\s*$/.test(stap.zinnen[i])) laatsteVraag.current = stap.zinnen[i];
      });
      if (!af) return;
      /* De eerste keer: Bliepo wijst de praatknop aan. */
      let eerder = true;
      try {
        eerder = localStorage.getItem(UITLEG_SLEUTEL) === "ja";
      } catch {
        /* geen opslag: dan gewoon uitleggen */
        eerder = false;
      }
      if (!uitgelegd.current && (uitlegAltijd || !eerder)) {
        uitgelegd.current = true;
        try {
          localStorage.setItem(UITLEG_SLEUTEL, "ja");
        } catch {
          /* niet erg */
        }
        zetAangewezen(true);
        const klaar = await g.zegZinnen([PRAATKNOP_UITLEG], () => onGebaar?.("wijsKnop", false));
        zetAangewezen(false);
        if (!klaar) return;
      }
      zetKnoppen(stap.knoppen);
    },
    [g, stappen, onGebaar, uitlegAltijd],
  );

  useEffect(() => {
    if (!begin) return;
    g.wis();
    uitgelegd.current = false;
    const t = window.setTimeout(() => void speelStap(start), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een nieuwe start
  }, [begin]);

  const kies = (k: Knop) => {
    g.onderbreek();
    zetKnoppen([]);
    if (k.naar === start) g.wis();
    else g.kindZegt(k.label);
    void speelStap(k.naar);
  };

  const praatknop = (
    <Praatknop
      uit={!begin}
      aangewezen={aangewezen}
      onderwerp={() => ({ ...onderwerp, opgaveTekst: laatsteVraag.current || stappen[stapNu.current]?.zinnen.join(" ") || "" })}
      onBegin={() => {
        g.onderbreek();
        zetKnoppen([]);
      }}
      onAntwoord={async (a) => {
        if (a.gehoord) g.kindZegt(a.gehoord);
        const af = await g.zegAntwoord(a);
        /* Daarna gaat het gesprek verder waar het was. */
        if (af) zetKnoppen(stappen[stapNu.current]?.knoppen ?? []);
      }}
      onKlaar={() => zetKnoppen(stappen[stapNu.current]?.knoppen ?? [])}
    />
  );

  /*
    Hetzelfde gedeelde onderdeel als de opdrachten en de lessen (BliepoVloer):
    in een opdracht op een groot scherm staat Bliepo zo vast op de cirkel rechts
    (plek "vast"), in een eigen vak zoals het voorbeeld in een kolom ("gesprek").
  */
  return (
    <BliepoVloer plek={plek} className="gs-kolom" robot={children} naast={praatknop}>
      <GesprekTekst alineas={g.alineas} oplichten={oplichten} leeg={leeg} />
      <Antwoordknoppen knoppen={knoppen} onKies={kies} />
    </BliepoVloer>
  );
}

/**
 * De ronde microfoonknop voor een scherm zonder eigen gesprek (zoals een les,
 * 26 oktober 2026): dezelfde knop, en Bliepo spreekt het antwoord uit. Staat
 * "Praten met Bliepo" uit (`aan` false), dan grijs, en bij een tik legt hij
 * uit dat papa of mama het kan aanzetten.
 */
export function LosPraatknop({ aan, onderwerp }: { aan: boolean; onderwerp: () => TutorOnderwerp }) {
  return (
    <Praatknop
      dicht={!aan}
      onDicht={() => {
        stopPraten();
        void zegEnWacht([PRATEN_UIT]);
      }}
      onderwerp={onderwerp}
      onBegin={() => stopPraten()}
      onAntwoord={async (a) => {
        if (a.audio && a.zinnen.length) {
          const tekst = a.zinnen.join(" ");
          let grenzen: { begin: number; eind: number } | null = null;
          await speelAntwoord(a.audio, {
            metGeluid: (b) => (grenzen = spraakGrenzen(b.getChannelData(0), b.sampleRate)),
            gestart: () => meldVoorlezen(tekst, grenzen ?? { begin: 0.05, eind: 2 }),
          });
          stopVoorlezen();
        } else if (a.zinnen.length) await zegEnWacht(a.zinnen);
      }}
    />
  );
}
