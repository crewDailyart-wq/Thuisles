"use client";

/**
 * Delen om zelf te doen: groepjes maken en eerlijk verdelen.
 *
 * Het kind doet eerst zelf wat er bij delen gebeurt, en typt daarna pas het
 * antwoord (ONTWERPREGELS.md, "Interactieve oefeningen"). De deelsom staat
 * vanaf het begin bovenaan, met het lege vakje erin.
 *
 *   groepjes  bolletjes die als magneetjes tegen elkaar klikken; zie
 *             `Bolletjes`. Een rustig scherm zonder extra tekst.
 *   verdelen  een stapel appels en de mandjes. Een tik op een mandje laat er
 *             één appel naartoe gaan; een tik op een appel in een mandje legt
 *             hem terug. Meer dan 30: ook een knop "Iedereen één".
 *
 * Er staat nergens een teller: het kind telt zelf. Het vakje is er meteen,
 * maar het kind kan pas typen als alle bolletjes in volle groepjes zitten of
 * alle appels eerlijk verdeeld zijn; dan staat de cursor er meteen in. Bij
 * stap "hulp" kan het kind meteen typen, en bouwt het alleen als het op Hulp
 * drukt.
 *
 * Het vakje zelf komt uit `Keeropdracht`, zodat typen, nakijken en meeschuiven
 * met het toetsenbord hetzelfde blijven (HARDE REGEL 5).
 */

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { Bolletjes } from "@/components/oefenen/Bolletjes";
import { bouwOpdracht, deelGoedZin, deelZin } from "@/lib/deelthema";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
type Deelfiguur = Extract<Figuur, { soort: "deelsom" }>;

/** Boven dit aantal helpt het scherm: een heel zakje per tik, of "Iedereen één". */
const VEEL = 30;

// ---------------------------------------------------------------------------
// Tekeningen
// ---------------------------------------------------------------------------

function Appel({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 12c-3-3-13-3-13 9 0 8 6 14 10 14 2 0 2-1 3-1s1 1 3 1c4 0 10-6 10-14 0-12-10-12-13-9z"
        fill="var(--color-fout)"
      />
      <path
        d="M20 12c0-3 1-6 3-7"
        stroke="#6b3d1f"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M22 9c3-4 8-4 9-2-2 3-6 4-9 2z" fill="var(--color-groen)" />
      <ellipse cx="13" cy="19" rx="2.4" ry="4" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function Mandje() {
  return (
    <svg viewBox="0 0 80 52" className="h-14 w-24" aria-hidden="true">
      <path
        d="M18 22c0-16 44-16 44 0"
        stroke="var(--color-oranje-diep)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M6 22h68l-8 26H14z"
        fill="var(--color-amber)"
        stroke="var(--color-oranje-diep)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 31h60M13 40h54M26 22l-3 26M40 22v26M54 22l3 26"
        stroke="var(--color-oranje-diep)"
        strokeWidth="1.6"
        opacity="0.6"
      />
    </svg>
  );
}

function Knop({
  children,
  onClick,
  uit = false,
}: {
  children: ReactNode;
  onClick: () => void;
  uit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uit}
      className="min-h-11 rounded-2xl border-2 border-huisstijl bg-kaart px-4 text-lg font-extrabold text-huisstijl transition enabled:hover:bg-huisstijl-zacht disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Eerlijk verdelen
// ---------------------------------------------------------------------------

function Verdelen({
  figuur,
  uit,
  verdeling,
  zet,
}: {
  figuur: Deelfiguur;
  uit: boolean;
  verdeling: number[];
  zet: Dispatch<SetStateAction<number[]>>;
}) {
  const { geheel } = figuur;
  const stapel = geheel - verdeling.reduce((n, x) => n + x, 0);

  const geef = (i: number) =>
    zet((v) =>
      v.reduce((n, x) => n + x, 0) >= geheel
        ? v
        : v.map((n, j) => (j === i ? n + 1 : n)),
    );
  const terug = (i: number) =>
    zet((v) => v.map((n, j) => (j === i && n > 0 ? n - 1 : n)));

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* De stapel: klein en dicht op elkaar; je tikt niet hierop maar op een mandje. */}
      <div
        aria-label={stapel > 0 ? "De stapel appels" : "De stapel is leeg"}
        className="flex min-h-12 max-w-[22rem] flex-wrap items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed border-rand px-3 py-2"
      >
        {Array.from({ length: stapel }, (_, i) => (
          <Appel key={i} className="size-6" />
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-3">
        {verdeling.map((aantal, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-2xl bg-room/60 p-2"
          >
            <div className="grid min-h-11 grid-cols-[repeat(3,2.75rem)] justify-center gap-0.5">
              {Array.from({ length: aantal }, (_, j) => (
                <button
                  key={j}
                  type="button"
                  aria-label="Leg een appel terug op de stapel"
                  disabled={uit}
                  onClick={() => terug(i)}
                  className="motion-safe:animate-teller-pop grid size-11 touch-manipulation place-items-center rounded-full enabled:hover:bg-kaart disabled:cursor-default"
                >
                  <Appel />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label={`Geef mandje ${i + 1} een appel`}
              disabled={uit}
              onClick={() => geef(i)}
              className="grid min-h-11 touch-manipulation place-items-center rounded-xl px-1 transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:cursor-default"
            >
              <Mandje />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Het geheel
// ---------------------------------------------------------------------------

export function Deelbouwer({
  figuur,
  fase,
  vakje,
  onOpnieuw,
  onKlaar,
  onGezien,
}: {
  figuur: Deelfiguur;
  fase: Fase;
  /** Het invulvak uit `Keeropdracht`; `geblokkeerd` zolang er nog gebouwd wordt. */
  vakje: (geblokkeerd: boolean) => ReactNode;
  /** Ook het getypte antwoord weer leeg. */
  onOpnieuw: () => void;
  /** Alles gebouwd: het vakje gaat open en mag de aandacht krijgen. */
  onKlaar: () => void;
  /** Na een goed antwoord: de zin heeft even gestaan, het feest mag komen. */
  onGezien?: () => void;
}) {
  const uit = fase !== "bezig";
  const bouw = figuur.bouw ?? "groepjes";
  const hulpstap = figuur.stap === "hulp";

  const leeg = () => Array.from({ length: figuur.deler }, () => 0);
  /* Bij groepjes maken: of alles in volle groepjes zit, en een teller om opnieuw te beginnen. */
  const [groepjesKlaar, setGroepjesKlaar] = useState(false);
  const [ronde, setRonde] = useState(0);
  const [verdeling, setVerdeling] = useState<number[]>(leeg);
  const [hulpOpen, setHulpOpen] = useState(false);

  function opnieuw() {
    setRonde((r) => r + 1);
    setGroepjesKlaar(false);
    setVerdeling(leeg());
    onOpnieuw();
  }

  /* Na nakijken en opnieuw proberen: weer van voren af aan. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setRonde((r) => r + 1);
      setGroepjesKlaar(false);
      setVerdeling(leeg());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  /* Na een goed antwoord blijft de zin even staan; daarna pas het feest. */
  useEffect(() => {
    if (fase !== "goed") return;
    const klokje = window.setTimeout(() => onGezien?.(), 2400);
    return () => window.clearTimeout(klokje);
  }, [fase, onGezien]);

  const verdeeld = verdeling.reduce((n, x) => n + x, 0);
  const stapelLeeg = verdeeld === figuur.geheel;
  const evenveel = verdeling.every((n) => n === verdeling[0]);
  const klaar =
    bouw === "groepjes" ? groepjesKlaar : stapelLeeg && evenveel;
  const bouwen = !hulpstap || hulpOpen;
  const geblokkeerd = bouwen && !klaar;

  /* Zodra alles in zakjes zit of verdeeld is, gaat het vakje open en krijgt het de cursor. */
  const wasKlaar = useRef(klaar);
  useEffect(() => {
    if (klaar && !wasKlaar.current) onKlaar();
    wasKlaar.current = klaar;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klaar]);

  const teken = (t: string, kleur: string) => (
    <span
      aria-hidden="true"
      className={`text-4xl font-extrabold sm:text-5xl ${kleur}`}
    >
      {t}
    </span>
  );

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* De deelsom, vanaf het begin bovenaan. */}
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        <Gegeven waarde={figuur.geheel} maat="groot" breed />
        {teken(":", "text-huisstijl")}
        <Gegeven waarde={figuur.deler} maat="groot" />
        {teken("=", "text-inkt-zacht")}
        {vakje(geblokkeerd)}
      </div>

      {hulpstap && !hulpOpen && !uit && (
        <Knop onClick={() => setHulpOpen(true)}>Hulp</Knop>
      )}

      {bouwen && (
        <>
          {/* Bij verdelen staat de opdracht erbij; groepjes maken is een rustig scherm. */}
          {hulpstap && bouw === "verdelen" && (
            <p className="text-center text-xl font-extrabold text-inkt">
              {bouwOpdracht(bouw, figuur.deler)}
            </p>
          )}
          {bouw === "groepjes" ? (
            <Bolletjes
              key={ronde}
              geheel={figuur.geheel}
              deler={figuur.deler}
              uit={uit}
              oplichten={fase === "goed"}
              onKlaar={setGroepjesKlaar}
            />
          ) : (
            <Verdelen
              figuur={figuur}
              uit={uit}
              verdeling={verdeling}
              zet={setVerdeling}
            />
          )}
          {bouw === "verdelen" && stapelLeeg && !evenveel && (
            <p className="text-center text-xl font-extrabold text-huisstijl-diep">
              Kijk goed: heeft iedereen evenveel?
            </p>
          )}
          {!uit && (
            <div className="flex flex-wrap justify-center gap-3">
              {bouw === "verdelen" && figuur.geheel > VEEL && (
                <Knop
                  uit={stapelLeeg}
                  onClick={() =>
                    setVerdeling((v) => {
                      let over = figuur.geheel - v.reduce((n, x) => n + x, 0);
                      return v.map((n) => {
                        if (over <= 0) return n;
                        over--;
                        return n + 1;
                      });
                    })
                  }
                >
                  Iedereen één
                </Knop>
              )}
              <Knop onClick={opnieuw}>Opnieuw</Knop>
            </div>
          )}
        </>
      )}

      {/* Bij goed en bij fout de zin in gewone woorden. */}
      {fase === "goed" && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">
          {deelGoedZin(figuur.geheel, figuur.deler, bouw)}
        </p>
      )}
      {fase === "fout" && (
        <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">
          {deelZin(figuur.geheel, figuur.deler, bouw)}
        </p>
      )}
    </div>
  );
}
