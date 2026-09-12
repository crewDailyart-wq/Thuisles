"use client";

/**
 * Stemtest.
 *
 * Laat zien welke Nederlandse stemmen dit apparaat heeft, welke Thuisles kiest
 * en waarom. Open deze pagina op je Mac, iPad en Android-telefoon: elk apparaat
 * heeft zijn eigen stemmen, dus dit is de enige manier om te zien wat een kind
 * daar echt hoort.
 */

import { useEffect, useState } from "react";
import { Leeg, Paneel, Tabelkop, stijl } from "@/components/beheer/Bouwstenen";
import { beoordeelStemmen, kiesStem, zeg } from "@/lib/stem";

type Regel = { naam: string; taal: string; lokaal: boolean; score: number; reden: string };

const PROEFZIN = "Hoi! Ik ben Vos. Tel je met me mee?";

export function Stemtest() {
  const [regels, setRegels] = useState<Regel[]>([]);
  const [gekozen, setGekozen] = useState<string>("");

  useEffect(() => {
    function lees() {
      const lijst = beoordeelStemmen().map((r) => ({
        naam: r.stem.name,
        taal: r.stem.lang,
        lokaal: r.stem.localService,
        score: r.score,
        reden: r.reden,
      }));
      setRegels(lijst);
      setGekozen(kiesStem().stem?.name ?? "");
    }

    // Stemmen komen op sommige apparaten pas later binnen.
    lees();
    window.speechSynthesis?.addEventListener("voiceschanged", lees);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", lees);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Paneel
        titel="Wat dit apparaat kiest"
        bijschrift="Thuisles kiest automatisch de best beschikbare Nederlandse vrouwenstem."
      >
        {gekozen ? (
          <>
            <p className="text-sm">
              Gekozen stem: <strong className="font-semibold">{gekozen}</strong>
            </p>
            <button
              type="button"
              onClick={() => zeg(PROEFZIN)}
              className={`${stijl.knop} mt-3`}
            >
              Beluister de proefzin
            </button>
            <p className="mt-2 text-xs text-beheer-zacht">
              &ldquo;{PROEFZIN}&rdquo;
            </p>
          </>
        ) : (
          <p className="text-sm text-beheer-zacht">
            Dit apparaat heeft geen Nederlandse stem. Vos praat dan niet; de
            uitleg werkt verder gewoon.
          </p>
        )}
      </Paneel>

      <Paneel
        titel="Alle Nederlandse stemmen op dit apparaat"
        bijschrift="Hoogste score wint. Mannelijke stemmen krijgen strafpunten, betere varianten pluspunten."
        geenVulling
      >
        {regels.length === 0 ? (
          <Leeg tekst="Nog geen stemmen gevonden." hint="Ververs de pagina eens." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <Tabelkop kolommen={["Stem", "Taal", "Soort", "Score", "Waarom", ""]} />
              <tbody>
                {regels.map((r) => (
                  <tr
                    key={r.naam}
                    className={`border-b border-beheer-rand-zacht last:border-0 ${
                      r.naam === gekozen ? "bg-groen-zacht/60" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {r.naam}
                      {r.naam === gekozen && (
                        <span className="ml-2 rounded-full bg-groen px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                          gekozen
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">{r.taal}</td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">
                      {r.lokaal ? "op het apparaat" : "via internet"}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{r.score}</td>
                    <td className="px-3 py-2 text-xs text-beheer-zacht">{r.reden}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const stem = window.speechSynthesis
                            .getVoices()
                            .find((v) => v.name === r.naam);
                          if (!stem) return;
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(PROEFZIN);
                          u.voice = stem;
                          u.lang = stem.lang;
                          u.rate = 0.88;
                          u.pitch = 1.2;
                          window.speechSynthesis.speak(u);
                        }}
                        className="text-xs text-beheer-zacht transition hover:text-viool"
                      >
                        Beluisteren
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Paneel>
    </div>
  );
}
