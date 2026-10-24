"use client";

/**
 * Voorbeeld "Gesprek met Bliepo" (24 oktober 2026, opdracht eigenaar). Alleen
 * op deze testpagina; de echte opdrachten en lessen veranderen pas na akkoord.
 *
 * Bliepo voert een echt gesprek, zoals een tutor, in plaats van één korte zin:
 * - Hij zegt een paar korte zinnen na elkaar; elke zin is een eigen alinea in
 *   de kolom boven hem: links uitgelijnd, groot, dik en wit, zonder ballon of
 *   kader. Eerdere zinnen blijven staan; komt er een nieuwe bij en wordt het
 *   te veel, dan schuift de oudste rustig weg (hooguit drie in beeld).
 * - Meelezen: wat hij nog niet gezegd heeft is gedimd (lichtgrijs), een woord
 *   wordt wit op het moment dat hij het zegt, en het woord van nu krijgt de
 *   warme accentkleur. De tijden per woord komen van ElevenLabs (Ruth, "with
 *   timestamps", /api/stem/tijden; één keer gemaakt en bewaard, daarna gratis).
 *   Bij "Woorden oplichten" uit staat alles meteen wit.
 * - Antwoordknoppen: grote, ronde knoppen onder de tekst. Bliepo leest ze niet
 *   voor; na een tik reageert hij met nieuwe zinnen en gaat het gesprek verder.
 * - Terugpraten: "Houd vast om te praten" (de tutor-functie, /api/tutor). Wat
 *   het kind zei en wat Bliepo antwoordt, komen in het gesprek.
 * - Bliepo zelf: de 3D-Bliepo (laptop) of de filmpjes (telefoon), met de echte
 *   gebaren op de woorden; de stem meldt elke zin met de precieze woordtijden.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { useOplichten, useWoordNu } from "@/components/oefenen/BliepoTekst";
import { speelAntwoord, stopPraten, zegEnWacht } from "@/lib/stem";
import { meldVoorlezen, spraakGrenzen, stopVoorlezen } from "@/lib/voorlezen";
import "./gesprek.css";

import { GESPREK, GESPREK_ZINNEN, type Knop } from "./gesprek-tekst";

const MAX_ALINEAS = 3;

type Woord = { woord: string; begin: number; eind: number };
type Opname = { data: ArrayBuffer; woorden: Woord[] };
type Alinea = {
  id: number;
  van: "bliepo" | "kind";
  tekst: string;
  /** Precieze tijden per woord en wanneer het geluid begon (performance.now), als die er zijn. */
  tijden?: { begin: number }[];
  start?: number;
  /** Helemaal gezegd (alles wit). */
  klaar?: boolean;
  /** Schuift weg (de oudste, als het te veel wordt). */
  weg?: boolean;
};

const opnames = new Map<string, Promise<Opname | null>>();
function haal(zin: string): Promise<Opname | null> {
  let p = opnames.get(zin);
  if (!p) {
    p = fetch(`/api/stem/tijden?zin=${encodeURIComponent(zin)}&groep=3`)
      .then((a) => (a.ok ? a.json() : null))
      .then((j: { audio: string; woorden: Woord[] } | null) =>
        j
          ? {
              data: Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0)).buffer,
              woorden: j.woorden,
            }
          : null,
      )
      .catch(() => null);
    p.then((o) => !o && opnames.delete(zin));
    opnames.set(zin, p);
  }
  return p;
}

const wachtEven = (ms: number) => new Promise<void>((klaar) => setTimeout(klaar, ms));

export function GesprekMetBliepo() {
  const voorkeur = useOplichten();
  const [oplichtenEigen, zetOplichtenEigen] = useState<boolean | null>(null);
  const oplichten = oplichtenEigen ?? voorkeur;
  const [alineas, zetAlineas] = useState<Alinea[]>([]);
  const [knoppen, zetKnoppen] = useState<Knop[]>([]);
  const [bezig, zetBezig] = useState(false);
  const [begonnen, zetBegonnen] = useState(false);
  const [gebaar, zetGebaar] = useState<{
    naam: string;
    n: number;
    opStem: boolean;
  } | null>(null);
  const beurt = useRef(0);
  const teller = useRef(0);
  /* De laatste vraag van Bliepo: daar gaat een gesproken vraag van het kind over. */
  const laatsteVraag = useRef("");
  const stapNu = useRef("start");

  useEffect(
    () => () => {
      beurt.current += 1;
      stopPraten();
      stopVoorlezen();
    },
    [],
  );

  /* Alle zinnen alvast ophalen (ze zijn bewaard, dus dit kost niets meer). */
  useEffect(() => {
    if (begonnen) GESPREK_ZINNEN.forEach((z) => void haal(z));
  }, [begonnen]);

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
      for (const [van, max] of [["bliepo", MAX_ALINEAS], ["kind", 1]] as const) {
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

  /* Eén zin: in beeld (gedimd), Ruth zegt hem, de woorden lichten mee op. */
  const zegZin = useCallback(
    async (zin: string, mijn: number) => {
      const id = voegToe({ van: "bliepo", tekst: zin });
      const o = await haal(zin);
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
          /* De 3D-Bliepo en de filmpjes horen zo welke zin klinkt (gebaren op de woorden). */
          meldVoorlezen(zin, grenzen ?? { begin: 0.05, eind: 1 }, tijden);
          werkBij(id, { tijden, start: performance.now() });
        },
      });
      stopVoorlezen();
      werkBij(id, { klaar: true });
    },
    [voegToe, werkBij],
  );

  /* Een stap: de zinnen na elkaar, met een korte adempauze; daarna de knoppen. */
  const speelStap = useCallback(
    async (naam: string) => {
      const stap = GESPREK[naam];
      if (!stap) return;
      const mijn = ++beurt.current;
      stapNu.current = naam;
      zetKnoppen([]);
      zetBezig(true);
      for (let i = 0; i < stap.zinnen.length; i++) {
        if (mijn !== beurt.current) return;
        const zin = stap.zinnen[i];
        /* Bij de eerste zin het gebaar dat bij het moment hoort (goed, aanmoedigen); de rest kiest Bliepo op de woorden. */
        if (i === 0 && stap.gebaar)
          zetGebaar((g) => ({
            naam: stap.gebaar!,
            n: (g?.n ?? 0) + 1,
            opStem: true,
          }));
        await zegZin(zin, mijn);
        if (/\?\s*$/.test(zin)) laatsteVraag.current = zin;
        await wachtEven(280);
      }
      if (mijn !== beurt.current) return;
      zetBezig(false);
      zetKnoppen(stap.knoppen);
    },
    [zegZin],
  );

  const begin = () => {
    stopPraten();
    stopVoorlezen();
    zetAlineas([]);
    zetBegonnen(true);
    void speelStap("start");
  };

  const kies = (k: Knop) => {
    stopPraten();
    zetKnoppen([]);
    voegToe({ van: "kind", tekst: k.label, klaar: true });
    if (k.naar === "start") zetAlineas([]);
    void speelStap(k.naar);
  };

  /* Een gesproken vraag van het kind (tutor): eerst wat het zei, dan Bliepo's antwoord. */
  const opVraag = useCallback(() => {
    beurt.current += 1;
    stopPraten();
    zetBezig(true);
  }, []);
  const opAntwoord = useCallback(
    async (a: { gehoord?: string; zinnen: string[]; audio?: ArrayBuffer }) => {
      const mijn = ++beurt.current;
      if (a.gehoord) voegToe({ van: "kind", tekst: a.gehoord, klaar: true });
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
          if (mijn !== beurt.current) return;
          const id = voegToe({ van: "bliepo", tekst: zin });
          await Promise.race([zegEnWacht([zin]), wachtEven(9000)]);
          werkBij(id, { klaar: true });
        }
      }
      if (mijn !== beurt.current) return;
      zetBezig(false);
      /* Daarna gaat het gesprek verder waar het was. */
      zetKnoppen(GESPREK[stapNu.current]?.knoppen ?? []);
    },
    [voegToe, werkBij],
  );

  return (
    <section
      id="gesprek"
      className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/20 bg-white/5 p-5"
      aria-labelledby="kop-gesprek"
    >
      <h2 id="kop-gesprek" className="text-xl font-bold">
        Gesprek met Bliepo
      </h2>
      <p className="mt-1 text-sm text-white/75">
        Voorbeeld: Bliepo voert een kort gesprek bij de start van een les. Wat hij nog niet zei is grijs, het woord van nu oranje. Antwoord
        met de knoppen, of houd de microfoon vast en zeg het zelf. Nog niet in de echte lessen.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={begin}
          className="min-h-11 rounded-full bg-orange-500 px-5 font-extrabold text-white hover:bg-orange-600"
        >
          {begonnen ? "Begin opnieuw" : "Start het gesprek"}
        </button>
        <button
          type="button"
          aria-pressed={oplichten}
          onClick={() => zetOplichtenEigen(!oplichten)}
          className="min-h-11 rounded-full border border-white/40 px-4 text-sm font-bold hover:bg-white/10"
        >
          Woorden oplichten: {oplichten ? "aan" : "uit"}
        </button>
      </div>

      <div className="gmb-houder mt-4">
        <div className="gmb-scene">
          {/* eslint-disable-next-line @next/next/no-img-element -- dezelfde achtergrond als de opdrachten */}
          <img className="gmb-achtergrond" src="/assets/bliepo/achtergrond-opdracht/liggend-1280.webp" alt="" />

          <div className="gmb-bord" aria-label="Twee groepjes stippen: links vijf, rechts drie">
            <p className="gmb-bord-titel">Groepjes vergelijken</p>
            <div className="gmb-groepjes">
              <div className="gmb-groepje">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="gmb-stip gmb-stip-rood" />
                ))}
              </div>
              <div className="gmb-groepje">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className="gmb-stip gmb-stip-blauw" />
                ))}
              </div>
            </div>
          </div>

          <div className="gmb-kolom">
            <div className="gmb-gesprek" aria-live="polite">
              {!begonnen && <p className="gmb-alinea gmb-uitleg">Tik op &quot;Start het gesprek&quot;.</p>}
              {alineas.map((a) =>
                a.van === "kind" ? (
                  <p key={a.id} className={`gmb-kind${a.weg ? " gmb-weg" : ""}`}>
                    <span className="sr-only">Jij: </span>
                    {a.tekst}
                  </p>
                ) : (
                  <AlineaTekst key={a.id} alinea={a} oplichten={oplichten} />
                ),
              )}
            </div>
            <div className="gmb-knoppen" role="group" aria-label="Antwoorden">
              {knoppen.map((k, i) => (
                <button key={k.label} type="button" className="gmb-knop" style={{ animationDelay: `${i * 90}ms` }} onClick={() => kies(k)}>
                  {k.label}
                </button>
              ))}
            </div>
            <div className="gmb-robot" aria-hidden="true">
              <Bliepo3DGedeeld rustig={false} rusthoek={-Math.PI / 9} volgMuis={false} gebaar={gebaar} geenTiktekst />
            </div>
            <PraatKnop vraag={laatsteVraag} uit={!begonnen} onVraag={opVraag} onAntwoord={opAntwoord} onFout={() => zetBezig(false)} />
            {bezig && <span className="sr-only">Bliepo praat</span>}
          </div>
        </div>
      </div>
    </section>
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
    <p className={`gmb-alinea${alinea.weg ? " gmb-weg" : ""}${oplichten ? " gmb-meelezen" : ""}`}>
      {woorden.map((w, i) => (
        <span key={i} className={`gmb-woord${woordNu >= i ? " gmb-gezegd" : ""}${!alinea.klaar && woordNu === i ? " gmb-nu" : ""}`}>
          {w}
          {i < woorden.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

const MAX_SECONDEN = 15;

/**
 * "Houd vast om te praten": het kind houdt de knop vast (muis, vinger of
 * spatiebalk), zegt iets en laat los. De opname gaat naar de tutor
 * (/api/tutor, demo zonder kind, wordt nergens bewaard); het antwoord komt in
 * het gesprek.
 */
function PraatKnop({
  vraag,
  uit,
  onVraag,
  onAntwoord,
  onFout,
}: {
  vraag: React.RefObject<string>;
  uit: boolean;
  onVraag: () => void;
  onAntwoord: (a: { gehoord?: string; zinnen: string[]; audio?: ArrayBuffer }) => Promise<void>;
  onFout: () => void;
}) {
  const [stand, zetStand] = useState<"klaar" | "luistert" | "denkt">("klaar");
  const [seconden, zetSeconden] = useState(0);
  const [melding, zetMelding] = useState("");
  const opname = useRef<{
    recorder: MediaRecorder;
    stukken: Blob[];
    begin: number;
    stream: MediaStream;
  } | null>(null);
  const klok = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintStap = useRef(0);
  const eindigRef = useRef<() => Promise<void>>(async () => {});

  useEffect(
    () => () => {
      opname.current?.stream.getTracks().forEach((t) => t.stop());
      if (klok.current) clearInterval(klok.current);
    },
    [],
  );

  const begin = async () => {
    if (stand !== "klaar" || uit) return;
    onVraag();
    zetMelding("");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      zetMelding("Ik mag de microfoon niet gebruiken. Vraag een volwassene om de microfoon aan te zetten.");
      onFout();
      return;
    }
    const soort = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((s) =>
      MediaRecorder.isTypeSupported?.(s),
    );
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
  };

  const eindig = async () => {
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
      zetStand("klaar");
      zetMelding("Houd de knop vast terwijl je praat, en laat dan los.");
      onFout();
      return;
    }
    zetStand("denkt");
    const formulier = new FormData();
    formulier.append("audio", new Blob(o.stukken, { type: o.recorder.mimeType || "audio/webm" }), "vraag");
    formulier.append("seconden", String(Math.round(duur * 10) / 10));
    formulier.append(
      "context",
      JSON.stringify({
        opgaveId: "demo:gesprek-groepjes",
        opgaveTekst: vraag.current || "In deze les gaan we groepjes en getallen vergelijken.",
        domein: "getallen",
        leerdoel: "Groepjes en getallen vergelijken",
        hintStap: hintStap.current,
        gesprek: [],
        demo: true,
        groep: 3,
      }),
    );
    const antwoord = await fetch("/api/tutor", {
      method: "POST",
      body: formulier,
    }).catch(() => null);
    const j = (await antwoord?.json().catch(() => null)) as {
      soort?: string;
      zinnen?: string[];
      tekst?: string;
      audio?: string;
      hintStap?: number;
      gehoord?: string;
    } | null;
    zetStand("klaar");
    if (!antwoord?.ok || !j) {
      zetMelding("Er ging iets mis. Probeer het zo nog eens.");
      onFout();
      return;
    }
    if (typeof j.hintStap === "number") hintStap.current = j.hintStap;
    const audio = j.audio ? Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0)).buffer : undefined;
    const zinnen =
      j.tekst && audio ? [j.tekst] : j.soort === "herhaal" ? [vraag.current].filter(Boolean) : (j.zinnen ?? (j.tekst ? [j.tekst] : []));
    await onAntwoord({
      gehoord: j.gehoord,
      zinnen,
      audio: j.tekst ? audio : undefined,
    });
  };

  useEffect(() => {
    eindigRef.current = eindig;
  });

  const tekst =
    stand === "luistert" ? `Ik luister… ${MAX_SECONDEN - seconden}` : stand === "denkt" ? "Bliepo denkt na…" : "Houd vast om te praten";
  return (
    <div className="gmb-praat">
      <button
        type="button"
        disabled={uit || stand === "denkt"}
        aria-label={tekst}
        className={`gmb-praatknop${stand === "luistert" ? " gmb-luistert" : ""}`}
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
      >
        <svg
          viewBox="0 0 24 24"
          className="gmb-microfoon"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          aria-hidden
        >
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        <span>{tekst}</span>
      </button>
      {melding && <p className="gmb-melding">{melding}</p>}
    </div>
  );
}
