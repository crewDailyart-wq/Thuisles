"use client";

/**
 * "Kies jouw vak": het vakkenpaneel bovenaan de startpagina (16 oktober 2026,
 * op verzoek van de eigenaar, naar zijn voorbeeld). De werelden en Mijn
 * leerpad staan eronder.
 *
 * Een rij grote, gekleurde vaktegels die je opzij kunt schuiven (met de
 * pijltjes, door te vegen of met het toetsenbord), stipjes die laten zien waar
 * je bent, en "Start missie". Je tikt een vak aan en drukt op Start missie.
 * Rekenen heeft oefeningen en gaat naar /rekenen; de andere vakken zeggen
 * eerlijk dat ze binnenkort komen, met dezelfde zin als bij de vakken verderop.
 *
 * De vakken zelf (namen, volgorde, waar ze heen gaan) komen uit VAKKEN in
 * OntdekkingsReis.tsx, zodat ze op één plek staan. De vakken onder "Wat wil je
 * ontdekken?" blijven gewoon staan.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IcoonPijl } from "@/components/zappie/Iconen";
import { VAKKEN } from "@/components/zappie/OntdekkingsReis";
import { VakBeeld } from "@/components/zappie/reis/Beelden";

export function VakkenPaneel() {
  const [gekozen, zetGekozen] = useState<string>(VAKKEN[0].id);
  const [bericht, zetBericht] = useState("");
  const [pagina, zetPagina] = useState(0);
  const [paginas, zetPaginas] = useState(1);
  const rij = useRef<HTMLUListElement>(null);

  /* Hoeveel "bladzijden" de rij heeft, en op welke we zijn: voor de stipjes. */
  useEffect(() => {
    const el = rij.current;
    if (!el) return;
    const meet = () => {
      const n = Math.max(1, Math.round(el.scrollWidth / Math.max(1, el.clientWidth)));
      zetPaginas(n);
      const max = el.scrollWidth - el.clientWidth;
      zetPagina(max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (n - 1)));
    };
    meet();
    el.addEventListener("scroll", meet, { passive: true });
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(el);
    return () => {
      el.removeEventListener("scroll", meet);
      waarnemer.disconnect();
    };
  }, []);

  const schuif = (richting: number) => {
    const el = rij.current;
    if (!el) return;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: richting * el.clientWidth * 0.8, behavior: rustig ? "auto" : "smooth" });
  };

  const naarPagina = (n: number) => {
    const el = rij.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: paginas > 1 ? (max * n) / (paginas - 1) : 0, behavior: rustig ? "auto" : "smooth" });
  };

  const vak = VAKKEN.find((v) => v.id === gekozen) ?? VAKKEN[0];

  return (
    <section className="zp-vakpaneel" aria-labelledby="zp-kop-vakpaneel">
      <div className="zp-vk-kaart">
        <h2 id="zp-kop-vakpaneel" className="zp-titel zp-vk-kop">
          Kies jouw vak
        </h2>

        <div className="zp-vk-schuif">
          <button type="button" className="zp-vk-pijl zp-vk-pijl-links" aria-label="Vorige vakken" onClick={() => schuif(-1)} disabled={pagina === 0}>
            <IcoonPijl className="size-[55%]" />
          </button>
          <ul ref={rij} className="zp-vk-rij" aria-label="Vakken">
            {VAKKEN.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  className="zp-vk-tegel"
                  data-kleur={v.kleur}
                  aria-pressed={v.id === gekozen}
                  onClick={() => {
                    zetGekozen(v.id);
                    zetBericht("");
                  }}
                >
                  {!v.href && <span className="zp-vk-label">Binnenkort</span>}
                  {v.id === gekozen && (
                    <span className="zp-vk-vink" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M6 12.5 10.2 16.5 18 8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  <span className="zp-vk-beeld">
                    <VakBeeld soort={v.id} />
                  </span>
                  <span className="zp-vk-naam zp-titel">{v.naam}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="zp-vk-pijl zp-vk-pijl-rechts" aria-label="Volgende vakken" onClick={() => schuif(1)} disabled={pagina >= paginas - 1}>
            <IcoonPijl className="size-[55%]" />
          </button>
        </div>

        {paginas > 1 && (
          <div className="zp-vk-stipjes">
            {Array.from({ length: paginas }, (_, i) => (
              <button
                key={i}
                type="button"
                className="zp-vk-stip"
                aria-label={`Vakken, deel ${i + 1} van ${paginas}`}
                aria-current={i === pagina ? "true" : undefined}
                onClick={() => naarPagina(i)}
              />
            ))}
          </div>
        )}

        {vak.href ? (
          <Link href={vak.href} className="zp-vk-start zp-titel">
            Start missie
            <IcoonPijl className="zp-vk-start-pijl" />
          </Link>
        ) : (
          <button
            type="button"
            className="zp-vk-start zp-titel"
            onClick={() => zetBericht(`${vak.naam} komt binnenkort. Met Rekenen kun je nu al beginnen!`)}
          >
            Start missie
            <IcoonPijl className="zp-vk-start-pijl" />
          </button>
        )}
        <p className="zp-vk-bericht" role="status">
          {bericht}
        </p>
      </div>
    </section>
  );
}
