"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import s from "./geld-concept.module.css";

const voorbeelden = {
  briefje: { waarde: 10, afbeelding: "/geld/concept/briefje-10-euro.png", alt: "Een briefje van tien euro", naam: "briefje" },
  munt: { waarde: 1, afbeelding: "/geld/los/munt-1-euro.png", alt: "Een munt van één euro", naam: "munt" },
};

export function GeldConcept() {
  const [soort, setSoort] = useState<keyof typeof voorbeelden>("briefje");
  const [antwoord, setAntwoord] = useState<number | null>(null);
  const voorbeeld = voorbeelden[soort];
  const goed = antwoord === voorbeeld.waarde;

  function wissel(nieuw: keyof typeof voorbeelden) {
    setSoort(nieuw);
    setAntwoord(null);
  }

  return (
    <main className={s.pagina}>
      <header className={s.balk}>
        <Link className={s.terug} href="/voorbeeld/les/squla-geld-geldmachine-1">← Naar de huidige les</Link>
        <span className={s.concept}>Concept · Munten en briefjes</span>
        <div className={s.wissel} aria-label="Kies een voorbeeld">
          <button type="button" aria-pressed={soort === "briefje"} onClick={() => wissel("briefje")}>Briefje</button>
          <button type="button" aria-pressed={soort === "munt"} onClick={() => wissel("munt")}>Munt</button>
        </div>
      </header>

      <section className={s.oefening} aria-labelledby="geldvraag">
        <h1 id="geldvraag">Hoeveel euro is dit?</h1>

        <div className={s.geldvlak}>
          <Image
            key={soort}
            className={soort === "munt" ? s.munt : s.briefje}
            src={voorbeeld.afbeelding}
            alt={voorbeeld.alt}
            width={soort === "munt" ? 240 : 420}
            height={240}
            priority
            unoptimized
          />
        </div>

        <div className={s.antwoorden} role="group" aria-labelledby="geldvraag">
          {[100, 1, 10].map((bedrag) => (
            <button
              key={bedrag}
              type="button"
              className={antwoord === bedrag ? (goed ? s.goed : s.opnieuw) : undefined}
              aria-pressed={antwoord === bedrag}
              disabled={goed}
              onClick={() => setAntwoord(bedrag)}
            >
              {antwoord === bedrag && goed && <span aria-hidden="true">✓ </span>}
              {bedrag} euro
            </button>
          ))}
        </div>

        <div className={s.feedback}>
          <p role="status" aria-live="polite">
            {antwoord === null ? null : goed
              ? `Ja, dit is ${voorbeeld.waarde} euro!`
              : `Nog niet. Kijk naar het getal op ${soort === "briefje" ? "het" : "de"} ${voorbeeld.naam}. Probeer het nog eens.`}
          </p>
          {goed && <button type="button" className={s.verder} onClick={() => wissel(soort === "briefje" ? "munt" : "briefje")}>Bekijk {soort === "briefje" ? "een munt" : "een briefje"} →</button>}
        </div>
      </section>

      <Image className={s.bliepo} src="/assets/zappie/bliepo/bliepo-stil.webp" alt="Bliepo" width={160} height={195} unoptimized />
    </main>
  );
}
