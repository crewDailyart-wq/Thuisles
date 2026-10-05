"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { startMagneetveld } from "@/components/oefenen/magneetveld";
import { deelGoedZin, deelZin } from "@/lib/deelthema";
import styles from "./MagneetDeelsom.module.css";

/** Een lokale bouwcontrole vóór het normale nakijken; nooit een opgeslagen antwoord veranderen. */
export const DeelbouwControle = createContext<RefObject<(() => boolean) | null> | null>(null);

export function MagneetDeelsom({ geheel, deler, zaad, fase, vakje, onOpnieuw, onGezien }: {
  geheel: number; deler: number; zaad: number; fase: "bezig" | "goed" | "fout";
  vakje: ReactNode; onOpnieuw: () => void; onGezien?: () => void;
}) {
  const vak = useRef<HTMLDivElement>(null);
  const motor = useRef<ReturnType<typeof startMagneetveld> | null>(null);
  const controleRef = useContext(DeelbouwControle);
  const [ronde, setRonde] = useState(0);
  const [melding, setMelding] = useState("");
  const naTellen = useRef(onGezien);
  useEffect(() => { naTellen.current = onGezien; }, [onGezien]);

  useEffect(() => {
    if (!vak.current) return;
    const spel = startMagneetveld(vak.current, geheel, deler, zaad + ronde, () => setMelding(""));
    motor.current = spel;
    if (controleRef) controleRef.current = () => {
      if (spel.klopt()) return true;
      setMelding(`Kijk nog eens: heeft elk groepje ${deler === 1 ? "1 bolletje" : `${deler} bolletjes`}?`);
      return false;
    };
    return () => { if (controleRef) controleRef.current = null; motor.current = null; spel.stop(); };
  }, [geheel, deler, zaad, ronde, controleRef]);

  useEffect(() => {
    motor.current?.zetUit(fase !== "bezig");
    if (fase === "goed") motor.current?.telMee(() => naTellen.current?.());
  }, [fase, ronde]);

  return <div className="flex w-full flex-col items-center gap-3" data-magneet-deelsom>
    <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3" aria-label={`${geheel} gedeeld door ${deler}`}>
      <Gegeven waarde={geheel} maat="groot" breed />
      <span aria-hidden="true" className="text-4xl font-extrabold text-huisstijl">:</span>
      <Gegeven waarde={deler} maat="groot" />
      <span aria-hidden="true" className="text-4xl font-extrabold text-inkt-zacht">=</span>
      {vakje}
    </div>
    <p className="text-center text-xl font-extrabold text-inkt sm:text-2xl">Maak groepjes van {deler}.</p>
    <div className={styles.houder}><div ref={vak} className={styles.veld} aria-label={`Speelveld met ${geheel} bolletjes`} /></div>
    {fase === "bezig" && <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <p className="text-center text-sm font-semibold text-inkt-zacht">Sleep of tik twee bolletjes tegen elkaar.</p>
      <button type="button" className="min-h-11 rounded-full border-2 border-rand bg-kaart px-4 text-sm font-extrabold text-inkt-zacht hover:bg-room" onClick={() => { setRonde(r => r + 1); setMelding(""); onOpnieuw(); }}>Opnieuw</button>
    </div>}
    <p className="text-center text-base font-bold text-huisstijl-diep" aria-live="polite">{melding}</p>
    {fase === "goed" && <p className="rounded-2xl bg-groen-zacht px-4 py-2 text-center text-lg font-extrabold text-groen-diep">{deelGoedZin(geheel, deler, "groepjes")}</p>}
    {fase === "fout" && <p className="rounded-2xl bg-lucht-zacht px-4 py-2 text-center text-lg font-extrabold text-lucht">{deelZin(geheel, deler, "groepjes")}</p>}
  </div>;
}
