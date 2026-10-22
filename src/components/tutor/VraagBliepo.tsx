"use client";

/**
 * De knop "Vraag het Bliepo" (Praten met Bliepo, 22 oktober 2026).
 *
 * Het kind houdt de knop ingedrukt (muis, vinger of spatiebalk), stelt een
 * vraag en laat los. Hooguit 15 seconden. De opname gaat naar /api/tutor en
 * wordt nergens bewaard. Bliepo antwoordt met zijn stem; het lijntje en de
 * mond bewegen mee, en het antwoord staat kort in een tekstballon.
 *
 * Staat bij elke vraag in de oefeningen en lessen, maar alleen als de ouder
 * "Praten met Bliepo" heeft aangezet. Op /voorbeeld-bliepo staat hij altijd
 * aan (demo).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { speelAntwoord, stopPraten, zeg, zegEnWacht } from "@/lib/stem";
import { VASTE_ANTWOORDEN } from "@/lib/tutor/hints";

export type TutorOpgave = {
  /** Vast kenmerk van de opgave: zo worden antwoorden gedeeld en begint de hintladder opnieuw bij een nieuwe opgave. */
  opgaveId: string;
  /** Wat er op het scherm staat (de vraag), zoals Bliepo hem zou voorlezen. */
  opgaveTekst: string;
  domein?: string;
  leerdoel?: string;
  /** De eigen tip en uitleg van de opgave (maatje), als die er zijn. */
  tip?: string;
  uitleg?: string;
};

type Stand = "klaar" | "luistert" | "denkt" | "praat" | "leeg" | "fout";

const MAX_SECONDEN = 15;

export function VraagBliepo({
  opgave,
  demo = false,
  groep,
  onHerhaal,
}: {
  opgave: TutorOpgave;
  demo?: boolean;
  groep?: number;
  /** De vraag nog eens laten voorlezen ("kun je het nog eens zeggen?"). Zonder: Bliepo leest de opgavetekst. */
  onHerhaal?: () => void;
}) {
  const [stand, zetStand] = useState<Stand>("klaar");
  /* De ballon hoort bij één opgave: bij een nieuwe opgave is hij vanzelf weg. */
  const [ballonVan, zetBallonVan] = useState<{ id: string; tekst: string }>({ id: "", tekst: "" });
  const ballon = ballonVan.id === opgave.opgaveId ? ballonVan.tekst : "";
  const zetBallon = useCallback((tekst: string) => zetBallonVan({ id: opgave.opgaveId, tekst }), [opgave.opgaveId]);
  const [seconden, zetSeconden] = useState(0);
  const [melding, zetMelding] = useState("");
  const hintStap = useRef(0);
  const gesprek = useRef<{ vraag: string; antwoord: string }[]>([]);
  const opname = useRef<{ recorder: MediaRecorder; stukken: Blob[]; begin: number; stream: MediaStream } | null>(null);
  const klok = useRef<ReturnType<typeof setInterval> | null>(null);
  const opgeladen = useRef(true);
  const eindigRef = useRef<() => Promise<void>>(async () => {});

  /* Nieuwe opgave: de hintladder en het gesprek beginnen opnieuw. */
  useEffect(() => {
    hintStap.current = 0;
    gesprek.current = [];
  }, [opgave.opgaveId]);

  useEffect(
    () => () => {
      opname.current?.stream.getTracks().forEach((t) => t.stop());
      if (klok.current) clearInterval(klok.current);
    },
    [],
  );

  const herhaal = useCallback(() => {
    if (onHerhaal) onHerhaal();
    else if (opgave.opgaveTekst) zeg(opgave.opgaveTekst);
  }, [onHerhaal, opgave.opgaveTekst]);

  const verstuur = useCallback(
    async (audio: Blob, duur: number) => {
      zetStand("denkt");
      const formulier = new FormData();
      formulier.append("audio", audio, "vraag");
      formulier.append("seconden", String(Math.round(duur * 10) / 10));
      formulier.append(
        "context",
        JSON.stringify({ ...opgave, hintStap: hintStap.current, gesprek: gesprek.current, demo, groep }),
      );
      /*
        Duurt het antwoord langer dan 0,7 s, dan zegt Bliepo meteen "Hmm, even
        nadenken." (vooraf ingesproken, kost niets). Het antwoord komt daarna,
        zonder de zin af te kappen.
      */
      let opvulling: Promise<void> | null = null;
      const wachter = setTimeout(() => {
        opvulling = Promise.race([zegEnWacht([VASTE_ANTWOORDEN.denken]), wachtEven(4000)]);
      }, 700);
      const antwoord = await fetch("/api/tutor", { method: "POST", body: formulier }).catch(() => null);
      clearTimeout(wachter);
      if (opvulling) await opvulling;
      const j = (await antwoord?.json().catch(() => null)) as
        | { soort?: string; zinnen?: string[]; tekst?: string; audio?: string; hintStap?: number; gehoord?: string; limiet?: boolean }
        | null;
      if (!antwoord?.ok || !j) {
        zetStand("fout");
        zetBallon("Er ging iets mis. Probeer het zo nog eens.");
        return;
      }
      if (typeof j.hintStap === "number") hintStap.current = j.hintStap;
      if (j.limiet) opgeladen.current = false;

      zetStand("praat");
      if ((j.soort === "live" || j.soort === "gedeeld") && j.tekst && j.audio) {
        zetBallon(j.tekst);
        if (j.gehoord) gesprek.current = [...gesprek.current, { vraag: j.gehoord, antwoord: j.tekst }].slice(-3);
        const bytes = Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0));
        await speelAntwoord(bytes.buffer);
      } else if (j.soort === "herhaal") {
        zetBallon(j.zinnen?.join(" ") ?? opgave.opgaveTekst);
        herhaal();
        if (j.zinnen?.length) await wachtEven(2500).then(() => zegEnWacht(j.zinnen ?? []));
      } else {
        const zinnen = j.zinnen ?? (j.tekst ? [j.tekst] : []);
        zetBallon(zinnen.join(" "));
        await Promise.race([zegEnWacht(zinnen), wachtEven(20000)]);
      }
      zetStand(opgeladen.current ? "klaar" : "leeg");
    },
    [opgave, demo, groep, herhaal, zetBallon],
  );

  const begin = useCallback(async () => {
    if (stand === "luistert" || stand === "denkt") return;
    stopPraten();
    zetMelding("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      zetMelding("Ik mag de microfoon niet gebruiken. Vraag een volwassene om de microfoon aan te zetten.");
      return;
    }
    const soort = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((s) => MediaRecorder.isTypeSupported?.(s));
    const recorder = new MediaRecorder(stream, soort ? { mimeType: soort } : undefined);
    const stukken: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && stukken.push(e.data);
    opname.current = { recorder, stukken, begin: performance.now(), stream };
    recorder.start(250);
    zetStand("luistert");
    zetSeconden(0);
    klok.current = setInterval(() => {
      const s = (performance.now() - (opname.current?.begin ?? 0)) / 1000;
      zetSeconden(Math.floor(s));
      if (s >= MAX_SECONDEN) void eindigRef.current();
    }, 200);
  }, [stand]);

  const eindig = useCallback(async () => {
    const o = opname.current;
    if (!o) return;
    opname.current = null;
    if (klok.current) clearInterval(klok.current);
    const duur = (performance.now() - o.begin) / 1000;
    await new Promise<void>((klaar) => {
      o.recorder.onstop = () => klaar();
      o.recorder.stop();
    });
    o.stream.getTracks().forEach((t) => t.stop());
    if (duur < 0.6) {
      zetStand(opgeladen.current ? "klaar" : "leeg");
      zetMelding("Houd de knop ingedrukt terwijl je praat, en laat dan los.");
      return;
    }
    await verstuur(new Blob(o.stukken, { type: o.recorder.mimeType || "audio/webm" }), duur);
  }, [verstuur]);

  useEffect(() => {
    eindigRef.current = eindig;
  }, [eindig]);

  const bezig = stand === "denkt" || stand === "praat";
  const tekst =
    stand === "luistert"
      ? `Ik luister… ${MAX_SECONDEN - seconden}`
      : stand === "denkt"
        ? "Bliepo denkt na…"
        : stand === "praat"
          ? "Bliepo praat…"
          : stand === "leeg"
            ? "Bliepo laadt op"
            : "Vraag het Bliepo";

  return (
    <div className="flex flex-col items-center gap-2" data-vraag-bliepo="">
      <button
        type="button"
        aria-label={stand === "leeg" ? "Bliepo laadt op. De hints werken wel." : "Vraag het Bliepo: houd ingedrukt en praat"}
        disabled={bezig}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
          void begin();
        }}
        onPointerUp={() => void eindig()}
        onPointerCancel={() => void eindig()}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            void begin();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") void eindig();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={`inline-flex min-h-12 select-none items-center gap-2 rounded-full px-6 py-3 text-base font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] transition [touch-action:none] disabled:opacity-60 ${
          stand === "luistert" ? "animate-pulse bg-red-500" : stand === "leeg" ? "bg-slate-500" : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {stand === "leeg" ? <Batterij /> : <Microfoon />}
        <span>{tekst}</span>
      </button>
      {melding && <p className="max-w-xs text-center text-sm font-semibold">{melding}</p>}
      {ballon && (
        <p aria-live="polite" className="max-w-sm rounded-2xl bg-white px-4 py-2 text-center text-base font-semibold text-slate-800 shadow">
          {ballon}
        </p>
      )}
    </div>
  );
}

function wachtEven(ms: number) {
  return new Promise<void>((klaar) => setTimeout(klaar, ms));
}

function Microfoon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function Batterij() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 11v2" />
      <rect x="4.5" y="9.5" width="4" height="5" rx="0.5" fill="currentColor" />
    </svg>
  );
}
