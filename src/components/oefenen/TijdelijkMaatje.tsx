"use client";

/**
 * Het tijdelijke maatje van de Godot-bouwstenen (oktober 2026).
 *
 * Geen vos, en nog geen naam: een rond bolletje in een Thuisles-kleur, met twee
 * ogen en een mond. Komt er een echte mascotte, dan hoeft alleen dit bestand
 * anders (en `POPPETJE_GODOT` in `lib/maatje/poppetje.ts`).
 *
 * Wat het kan:
 *   rustig  knippert af en toe
 *   praat   de mond gaat open en dicht, en het wiebelt een beetje
 *   blij    lacht (bij een goed antwoord)
 *   denkt   kijkt omhoog, met drie puntjes (wachten)
 *   troost  wijst omhoog naar het speelveld
 */

import type { MaatjeHouding } from "@/lib/maatje/poppetje";

/** De kleur van het bolletje: mint uit de Thuisles-kleuren. */
const KLEUR = "var(--color-mint)";
const KLEUR_ZACHT = "var(--color-mint-zacht)";

export function TijdelijkMaatje({ houding, className = "" }: { houding: MaatjeHouding; className?: string }) {
  const blij = houding === "blij";
  const praat = houding === "praat";
  const denkt = houding === "denkt";
  const wijst = houding === "troost";

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${praat ? "motion-safe:animate-[maatje-wiebel_0.9s_ease-in-out_infinite]" : ""}`}
      role="img"
      aria-label="Het maatje"
    >
      <style>{`
        @keyframes maatje-knipper { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        @keyframes maatje-mond { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        @keyframes maatje-wiebel { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes maatje-wijs { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @media (prefers-reduced-motion: reduce) { .maatje-beweegt { animation: none !important; } }
      `}</style>

      {/* schaduw */}
      <ellipse cx="50" cy="93" rx="26" ry="5" fill="#2c2545" opacity="0.12" />

      {/* het arm(pje) dat naar het speelveld wijst */}
      {wijst && (
        <g className="maatje-beweegt" style={{ animation: "maatje-wijs 1.2s ease-in-out infinite" }}>
          <path d="M78 52 C88 40 90 28 88 18" fill="none" stroke={KLEUR} strokeWidth="9" strokeLinecap="round" />
          <circle cx="88" cy="16" r="6" fill={KLEUR} />
        </g>
      )}

      {/* het bolletje */}
      <circle cx="50" cy="55" r="36" fill={KLEUR} />
      <ellipse cx="38" cy="38" rx="11" ry="7" fill="#ffffff" opacity="0.25" />
      <circle cx="30" cy="66" r="6" fill={KLEUR_ZACHT} opacity="0.55" />
      <circle cx="70" cy="66" r="6" fill={KLEUR_ZACHT} opacity="0.55" />

      {/* ogen */}
      {blij ? (
        <g fill="none" stroke="#2c2545" strokeWidth="4" strokeLinecap="round">
          <path d="M33 52 Q38 46 43 52" />
          <path d="M57 52 Q62 46 67 52" />
        </g>
      ) : (
        <g
          className="maatje-beweegt"
          style={{ transformOrigin: "50px 52px", animation: "maatje-knipper 4s infinite" }}
          fill="#2c2545"
        >
          <circle cx="38" cy={denkt ? 47 : 52} r="5" />
          <circle cx="62" cy={denkt ? 47 : 52} r="5" />
          <circle cx="39.5" cy={denkt ? 45.5 : 50.5} r="1.6" fill="#ffffff" />
          <circle cx="63.5" cy={denkt ? 45.5 : 50.5} r="1.6" fill="#ffffff" />
        </g>
      )}

      {/* mond */}
      {blij ? (
        <path d="M36 64 Q50 80 64 64 Z" fill="#2c2545" />
      ) : praat ? (
        <ellipse
          className="maatje-beweegt"
          cx="50"
          cy="68"
          rx="7"
          ry="6"
          fill="#2c2545"
          style={{ transformOrigin: "50px 68px", animation: "maatje-mond 0.35s ease-in-out infinite" }}
        />
      ) : denkt ? (
        <path d="M43 69 L57 67" stroke="#2c2545" strokeWidth="4" strokeLinecap="round" />
      ) : (
        <path d="M40 66 Q50 74 60 66" fill="none" stroke="#2c2545" strokeWidth="4" strokeLinecap="round" />
      )}

      {/* nadenken: drie puntjes */}
      {denkt && (
        <g fill="#6e6685">
          <circle cx="76" cy="20" r="3" />
          <circle cx="85" cy="13" r="3.5" />
          <circle cx="95" cy="6" r="4" />
        </g>
      )}
    </svg>
  );
}
