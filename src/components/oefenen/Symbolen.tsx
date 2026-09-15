/**
 * De symbolen op de knoppen in de uitleg.
 *
 * Met code getekend en niet als lettertekens of emoji: zo hebben ze overal
 * precies dezelfde vorm en dikte, en schalen ze mee met de knop. `currentColor`
 * laat ze de tekstkleur van de knop volgen, zodat er nooit een los kleurtje
 * naast komt te staan.
 *
 * De vormen zijn bewust de bekendste die er zijn — een pijl vooruit, een
 * driehoekje, een ronde terugpijl, een luidspreker, een kruisje — want een kind
 * van zes leest de tekst nog niet vloeiend maar herkent deze vormen van elke
 * afstandsbediening.
 *
 * Op één plek, zodat de animatie (groep 3 tot en met 6) en de leeslijst
 * (groep 7 en 8) dezelfde tekens gebruiken en niet uit elkaar kunnen lopen.
 */

/** Dikke pijl naar rechts: verder. */
export function PijlVooruit({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M4 12h13M12 5.5 18.5 12 12 18.5"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Dikke pijl naar links: terug. */
export function PijlTerug({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M20 12H7M12 5.5 5.5 12 12 18.5"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Driehoekje: afspelen. */
export function Driehoek({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M7.5 5.2 19 12 7.5 18.8Z" fill="currentColor" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round" />
    </svg>
  );
}

/** Ronde terugpijl: nog een keer. */
export function RondeTerugpijl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M4 3.5v4.2h4.2"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Luidspreker: geluid staat aan. */
export function Luidspreker({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Luidspreker met een streep erdoor: geluid staat uit. */
export function LuidsprekerUit({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* De streep erdoor: meteen te zien dat er geen geluid is. */}
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
    </svg>
  );
}

/** Kruisje: sluiten. */
export function Kruisje({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M6.5 6.5l11 11M17.5 6.5l-11 11"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Wissen: de backspace-pijl van een gewoon toetsenbord.
 *
 * Een pijl naar links met een kruisje erin. Bewust hetzelfde beeld als op een
 * echt toetsenbord — dat heeft een kind al eens gezien, en het woord "Wissen"
 * leest niet iedereen in groep 4 vlot genoeg om er tijdens het rekenen op te
 * durven drukken.
 */
export function Wisser({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      {/* De omtrek: een punt links, een blok rechts. */}
      <path
        d="M9 4.5h10a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H9L2.8 12.8a1.2 1.2 0 0 1 0-1.6L9 4.5Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Het kruisje erin. */}
      <path
        d="M11.8 9.4l5.4 5.2M17.2 9.4l-5.4 5.2"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}
