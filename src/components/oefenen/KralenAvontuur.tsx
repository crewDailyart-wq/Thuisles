"use client";

import { useEffect } from "react";
import type { Figuur } from "@/lib/generatoren/soort";
import { Kralenrij } from "./Figuurtekening";
import stijl from "./KralenAvontuur.module.css";

/**
 * Het rekenrek bij de vraag "de hoeveelste kraal is dit?".
 *
 * De kralen zijn hier met opzet NIET aan te tikken. De pijl wijst de kraal al
 * aan, dus er valt niets te zoeken; het kind hoeft alleen te bepalen de
 * hoeveelste die kraal is, en dat doet het met de vijfstructuur. Die structuur
 * staat al in beeld doordat de kleur om de vijf kralen wisselt.
 *
 * Er stond hier eerder wél een teller: aantikken zette een groene ring om een
 * kraal, en een wit handje deed het de eerste seconden voor. Dat werkte tegen
 * deze vraag in. Het handje lag groot en wit over de kralen en leek bij de
 * opgave te horen, en het aantikken nodigde uit tot één voor één tellen —
 * precies wat dit type juist wil afleren. De kralen staan nu stil.
 *
 * Het aantikken zelf is niet uit `Kralenrij` verdwenen: het uitlegfilmpje telt
 * er nog gewoon mee. Het wordt hier alleen niet meer aangezet.
 */
export function KralenAvontuur({ figuur, fase, onKlaar }: {
  figuur: Extract<Figuur, { soort: "kralenrij" }>;
  fase: "bezig" | "goed" | "fout";
  onKlaar: () => void;
}) {
  useEffect(() => {
    if (fase !== "goed") return;
    // Ook zonder animationend (achtergrondtab of minder beweging) gaat het verder.
    const klok = setTimeout(onKlaar, 1600);
    return () => clearTimeout(klok);
  }, [fase, onKlaar]);
  const goed = fase === "goed";
  /* Vos wacht rustig en juicht pas als het antwoord goed is. */
  const pose = goed ? "4" : "2";
  return <section className="w-full" aria-label="Kralen tellen met Vos">
    <div className={stijl.pad}>
      <div className={`${stijl.reiziger} ${goed ? stijl.naarSleutel : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={stijl.vos} src={`/vragen/chatgpt-image-sep-15-2026-08-18-08-pm-${pose}.png`} alt="Vos"/>
      </div>
      <p className={stijl.ballon} aria-live="polite">{goed ? "Gevonden!" : fase === "fout" ? "We kijken samen." : "Tel je mee?"}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/sleutel.png" alt="" className={`${stijl.sleutel} ${goed ? stijl.gepakt : ""}`}/>
    </div>
    {/* Alleen het rek en de pijl; niets om aan te tikken. */}
    <Kralenrij figuur={figuur} />
  </section>;
}
