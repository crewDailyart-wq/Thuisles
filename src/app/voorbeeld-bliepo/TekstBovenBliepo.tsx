"use client";

/**
 * Voorbeeld "Tekst boven Bliepo" (23 oktober 2026, opdracht eigenaar). Alleen
 * op deze testpagina; de echte opdrachten en lessen veranderen pas na akkoord.
 *
 * - De tekst staat los en vrij boven Bliepo's hoofd, zonder ballon of kader:
 *   groot, dik, wit en rond (zoals op de startpagina), gecentreerd, met een
 *   zachte schaduw. Korte regels voor groep 3.
 * - Een lange tekst gaat in stukjes (per zin) die na elkaar verschijnen
 *   terwijl Bliepo praat.
 * - Oplichten als karaoke: elk woord licht op op het moment dat Ruth het zegt.
 *   De tijden per woord komen van ElevenLabs ("with timestamps", via
 *   /api/stem/tijden); geluid en tijden horen bij elkaar.
 * - Een klein luidsprekerknopje naast de tekst om het nog eens te horen.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Bliepo3DGedeeld } from "@/components/zappie/bliepo/Bliepo3DGedeeld";
import { speelBliepoData } from "@/lib/bliepo-geluid";
import { stopPraten } from "@/lib/stem";
import "./tekst-boven-bliepo.css";

const ZINNEN = {
  kort: "Hoeveel is zeven plus acht?",
  lang: "Kijk eens naar deze vraagtekens. Tik ze alle drie aan. Er zitten belangrijke tekens achter.",
} as const;
type Soort = keyof typeof ZINNEN;
type Woord = { woord: string; begin: number; eind: number };
type Opname = { data: ArrayBuffer; woorden: Woord[] };

const opnames = new Map<string, Promise<Opname | null>>();
function haal(zin: string): Promise<Opname | null> {
  let p = opnames.get(zin);
  if (!p) {
    p = fetch(`/api/stem/tijden?zin=${encodeURIComponent(zin)}&groep=3`)
      .then((a) => (a.ok ? a.json() : null))
      .then((j: { audio: string; woorden: Woord[] } | null) =>
        j ? { data: Uint8Array.from(atob(j.audio), (c) => c.charCodeAt(0)).buffer, woorden: j.woorden } : null,
      )
      .catch(() => null);
    opnames.set(zin, p);
  }
  return p;
}

/** De zin in stukjes per zin, met per stukje welke woorden (op volgorde) erbij horen. */
function stukjes(zin: string): string[][] {
  return (zin.match(/[^.!?]+[.!?]*/g) ?? [zin]).map((s) => s.trim().split(/\s+/)).filter((s) => s.length);
}

export function TekstBovenBliepo() {
  const [soort, zetSoort] = useState<Soort>("lang");
  const [oplichten, zetOplichten] = useState(true);
  /* Waar Bliepo is: -1 = nog niet begonnen; anders het woord (over de hele zin geteld) dat hij nu zegt. */
  const [woordNu, zetWoordNu] = useState(-1);
  const [praat, zetPraat] = useState(false);
  const stop = useRef<(() => void) | null>(null);
  const klok = useRef(0);

  const zin = ZINNEN[soort];
  const delen = stukjes(zin);
  const telling = delen.map((d) => d.length);
  /* Het stukje met het woord van nu (of het eerste). */
  let stukIndex = 0;
  if (woordNu >= 0) {
    let n = 0;
    for (let i = 0; i < telling.length; i++) {
      if (woordNu < n + telling[i]) {
        stukIndex = i;
        break;
      }
      n += telling[i];
      stukIndex = i;
    }
  }
  const eersteVanStuk = telling.slice(0, stukIndex).reduce((a, b) => a + b, 0);

  const stil = useCallback(() => {
    stop.current?.();
    stop.current = null;
    cancelAnimationFrame(klok.current);
    zetPraat(false);
  }, []);

  useEffect(() => stil, [stil]);

  async function praatNu(welke: Soort = soort) {
    stil();
    stopPraten();
    zetWoordNu(-1);
    const o = await haal(ZINNEN[welke]);
    if (!o) return;
    let start = 0;
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      let i = -1;
      for (let k = 0; k < o.woorden.length; k++) if (o.woorden[k].begin <= t) i = k;
      zetWoordNu(i);
      klok.current = requestAnimationFrame(loop);
    };
    zetPraat(true);
    const s = await speelBliepoData(o.data.slice(0), {
      stilte: 0.2,
      gestart: () => {
        start = performance.now();
        loop();
      },
      klaar: () => {
        cancelAnimationFrame(klok.current);
        zetWoordNu(o.woorden.length);
        zetPraat(false);
      },
    });
    stop.current = s;
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/20 bg-white/5 p-5" aria-labelledby="kop-tekst-boven">
      <h2 id="kop-tekst-boven" className="text-xl font-bold">
        Tekst boven Bliepo
      </h2>
      <p className="mt-1 text-sm text-white/75">
        Voorbeeld: de tekst staat vrij boven Bliepo, zonder ballon. Elk woord licht op als Bliepo het zegt; een lange tekst
        komt in stukjes. Nog niet in de echte opdrachten en lessen.
      </p>

      <div className="tbb-scene mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- dezelfde achtergrond als de opdrachten */}
        <img className="tbb-achtergrond" src="/assets/bliepo/achtergrond-opdracht/liggend-1280.webp" alt="" />

        <div className="tbb-bord" aria-hidden="true">
          <p className="tbb-som">7 + 8 =</p>
          <span className="tbb-vak" />
          <div className="tbb-tekens">
            <span>?</span>
            <span>?</span>
            <span>?</span>
          </div>
        </div>

        <div className="tbb-bliepo">
          <div className="tbb-tekst" aria-live="polite">
            <p className={oplichten && praat ? "tbb-meelezen" : undefined}>
              {delen[stukIndex].map((w, i) => {
                const index = eersteVanStuk + i;
                const gezegd = oplichten && woordNu >= index && praat;
                const nu = oplichten && woordNu === index && praat;
                return (
                  <span key={`${stukIndex}-${i}`} className={`tbb-woord${gezegd ? " tbb-gezegd" : ""}${nu ? " tbb-nu" : ""}`}>
                    {w}{" "}
                  </span>
                );
              })}
              <button type="button" className="tbb-luister" onClick={() => void praatNu()} aria-label="Nog eens horen" title="Nog eens horen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                  <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
                  <path d="M16.5 8.5a5 5 0 0 1 0 7" />
                </svg>
              </button>
            </p>

          </div>
          <div className="tbb-robot" aria-hidden="true">
            <Bliepo3DGedeeld rustig={false} rusthoek={-Math.PI / 9} geenTiktekst />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-full border border-white/40" role="radiogroup" aria-label="Voorbeeldzin">
          {(Object.keys(ZINNEN) as Soort[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={soort === k}
              onClick={() => {
                stil();
                zetWoordNu(-1);
                zetSoort(k);
              }}
              className={`min-h-11 px-4 font-bold ${soort === k ? "bg-white text-[#0d2a6b]" : "text-white hover:bg-white/10"}`}
            >
              {k === "kort" ? "Korte zin" : "Lange zin"}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void praatNu()} className="min-h-11 rounded-full bg-orange-500 px-5 font-extrabold text-white hover:bg-orange-600">
          Laat Bliepo praten
        </button>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
          <input type="checkbox" className="size-5" checked={oplichten} onChange={(e) => zetOplichten(e.target.checked)} />
          Woorden oplichten
        </label>
      </div>
    </section>
  );
}
