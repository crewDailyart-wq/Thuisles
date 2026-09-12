"use client";

/**
 * Het feestscherm bij een goed antwoord.
 *
 * Een schermvullende laag over de vraag heen. De vraag is niet meer te zien:
 * dit is een eigen moment, geen blokje ergens in de opgave. Er staat bewust
 * geen tekst op. Wat er gebeurd is, zegt de confetti en de sleutel al, en een
 * kind van zeven leest "Goed gedaan!" toch niet meer als het scherm ontploft.
 *
 * Op het scherm staan twee dingen:
 *   - confetti over de volle breedte en hoogte (canvas, zie `lib/confetti.ts`);
 *   - de sleutel, groot in het midden, die naar de teller bovenin zweeft.
 *
 * ---------------------------------------------------------------------------
 * Geen knop
 * ---------------------------------------------------------------------------
 * Na een goed antwoord hoeft een kind niets te bevestigen: het was goed, dus
 * het gaat verder. Zodra de sleutel bij de teller is, komt de volgende vraag
 * vanzelf. Een knop zou hier alleen maar een extra handeling zijn tussen twee
 * sommen die allebei al gelukt zijn.
 *
 * Bij een FOUT antwoord is dat precies andersom: daar staat wél een knop, want
 * dan moet het kind zelf kunnen bepalen hoe lang het naar de uitleg kijkt.
 *
 * De sleutel is allang bijgeschreven op het moment dat dit scherm verschijnt —
 * dat gebeurt bij het antwoord zelf, niet hier.
 *
 * ---------------------------------------------------------------------------
 * Waarom de teller zichtbaar blijft
 * ---------------------------------------------------------------------------
 * De laag ligt op `z-40` binnen de kolom van de kindomgeving; de teller in de
 * header staat daarbinnen op `z-50`. De sleutel vliegt dus naar iets dat je
 * echt ziet liggen. Zie ook het commentaar in `app/(kind)/layout.tsx`.
 */

import { useEffect, useRef } from "react";
import { startConfetti } from "@/lib/confetti";
import { SLEUTEL_DOEL_ID } from "@/lib/sleutelwinkel";

/** Hoe lang het feest duurt. De sleutel doet hier ongeveer over. */
const FEEST_MS = 4000;

/** Deel van de tijd dat de sleutel groot in het midden blijft hangen. */
const WACHT_DEEL = 0.14;

/** Hoeveel keer zo groot de sleutel in het midden is als in de teller. */
const VERGROTING = 3.6;

function soepel(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function Feestscherm({
  onAfgelopen,
  onGeland,
}: {
  /**
   * Het feest is voorbij. Hierna gaat het scherm vanzelf naar de volgende
   * vraag; er is bewust geen knop om op te wachten.
   */
  onAfgelopen: () => void;
  /** De sleutel is bij de teller. Daar mag hij nu opgeteld worden. */
  onGeland: () => void;
}) {
  const doek = useRef<HTMLCanvasElement>(null);
  const sleutel = useRef<HTMLImageElement>(null);

  /*
    `onGeland` in een ref, zodat de animatie niet opnieuw begint wanneer de
    ouder hertekent en een nieuwe functie doorgeeft.
  */
  const meldGeland = useRef(onGeland);
  const meldAfgelopen = useRef(onAfgelopen);
  useEffect(() => {
    meldGeland.current = onGeland;
    meldAfgelopen.current = onAfgelopen;
  });

  useEffect(() => {
    const stil = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let gemeld = false;
    const meldEens = () => {
      if (gemeld) return;
      gemeld = true;
      meldGeland.current();
    };

    /*
      Minder beweging ingesteld: geen confetti en geen vlucht. Het feestscherm
      blijft wel staan — het is de plek waar de knop staat — en de sleutel
      wordt gewoon geteld.
    */
    if (stil) {
      /*
        Minder beweging: geen confetti en geen vlucht, maar wel hetzelfde
        verloop. Kort genoeg om niet te wachten, lang genoeg om te zien dat
        het antwoord goed was.
      */
      const t = setTimeout(() => {
        meldEens();
        meldAfgelopen.current();
      }, 900);
      return () => clearTimeout(t);
    }

    const stopConfetti = doek.current
      ? startConfetti(doek.current, FEEST_MS)
      : () => {};

    const beeld = sleutel.current;
    if (!beeld) {
      meldEens();
      const t = setTimeout(() => meldAfgelopen.current(), FEEST_MS);
      return () => {
        clearTimeout(t);
        stopConfetti();
      };
    }

    const doel = document.getElementById(SLEUTEL_DOEL_ID)?.getBoundingClientRect();
    const eindX = doel ? doel.left + doel.width / 2 : window.innerWidth - 60;
    const eindY = doel ? doel.top + doel.height / 2 : 60;
    const beginX = window.innerWidth / 2;
    const beginY = window.innerHeight / 2;

    // De richting van begin naar eind, om er loodrecht op te kunnen slingeren.
    const dx = eindX - beginX;
    const dy = eindY - beginY;
    const lengte = Math.hypot(dx, dy) || 1;
    const loodX = -dy / lengte;
    const loodY = dx / lengte;

    let bezig = true;
    let handvat = 0;
    const begin = performance.now();

    function stap(nu: number) {
      if (!bezig || !beeld) return;

      const t = Math.min((nu - begin) / FEEST_MS, 1);

      let x: number;
      let y: number;
      let schaal: number;
      let draai: number;

      if (t < WACHT_DEEL) {
        /*
          Even groot in het midden blijven staan, met een klein veertje erin,
          zodat het kind eerst ziet wát er verschijnt voordat het wegvliegt.
        */
        const w = t / WACHT_DEEL;
        x = beginX;
        y = beginY;
        schaal = VERGROTING * (1 + 0.1 * Math.sin(w * Math.PI));
        draai = Math.sin(w * Math.PI * 2) * 6;
      } else {
        const v = soepel((t - WACHT_DEEL) / (1 - WACHT_DEEL));

        // De rechte lijn van midden naar teller.
        const rechtX = beginX + dx * v;
        const rechtY = beginY + dy * v;

        /*
          Daaroverheen een slingering loodrecht op die lijn, die naar het eind
          toe uitdooft. Samen met de boog hieronder geeft dat een baan die
          zweeft in plaats van schuift.
        */
        const slinger = Math.sin(v * Math.PI * 2.6) * 90 * (1 - v);
        const boog = Math.sin(v * Math.PI) * 70;

        x = rechtX + loodX * slinger;
        y = rechtY + loodY * slinger - boog;

        schaal = VERGROTING + (1 - VERGROTING) * v;
        draai = Math.sin(v * Math.PI * 2.2) * 14 * (1 - v * 0.5);
      }

      beeld.style.transform =
        `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) ` +
        `scale(${schaal}) rotate(${draai}deg)`;

      if (t >= 1) {
        bezig = false;
        beeld.style.opacity = "0";
        meldEens();
        // De sleutel is binnen; hierna mag de volgende vraag komen.
        meldAfgelopen.current();
        return;
      }

      handvat = requestAnimationFrame(stap);
    }

    handvat = requestAnimationFrame(stap);

    return () => {
      bezig = false;
      cancelAnimationFrame(handvat);
      stopConfetti();
      /*
        Hier bewust NIET `meldEens()`. Dit opruimen gebeurt namelijk ook als
        React het effect in ontwikkelmodus twee keer doorloopt; de teller zou
        dan al optellen terwijl de sleutel nog in het midden hangt.

        Klikt het kind vroeg door, dan telt `volgende()` in OefenSpeler de
        sleutel alsnog. De sleutel staat op dat moment sowieso al in de
        database — dit gaat alleen over wanneer het getal verspringt.
      */
    };
  }, []);

  return (
    <div
      /*
        Dekkend, niet doorschijnend: de vraag en het landschap mogen er niet
        doorheen schemeren, anders blijft het een laagje over de opgave in
        plaats van een eigen scherm.
      */
      className="fixed inset-0 z-40 bg-room"
      role="dialog"
      aria-label="Goed gedaan"
    >
      {/* De confetti ligt over het hele scherm en vangt geen klikken af. */}
      <canvas
        ref={doek}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/*
        De sleutel. Dezelfde afbeelding als in de teller (`/sleutel.png`), met
        de hoogte van de teller als basismaat; het vergroten gebeurt met
        `scale`, zodat begin- en eindformaat gegarandeerd op elkaar aansluiten.

        Een gewone `img` en geen `next/image`: dit staat los in beeld op een
        gemeten plek en heeft de omhulling van `next/image` juist in de weg.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={sleutel}
        src="/sleutel.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={332}
        className="pointer-events-none absolute left-0 top-0 h-11 w-auto will-change-transform"
        style={{
          transform: "translate3d(50vw, 50vh, 0) translate(-50%, -50%) scale(3.6)",
          filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.25))",
        }}
      />

    </div>
  );
}
