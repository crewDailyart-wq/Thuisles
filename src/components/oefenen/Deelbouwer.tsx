"use client";

/**
 * Delen om zelf te doen: groepjes maken en eerlijk verdelen, altijd met appels.
 *
 * Het kind doet eerst zelf wat er bij delen gebeurt, en typt daarna pas het
 * antwoord (ONTWERPREGELS.md, "Interactieve oefeningen"). De deelsom staat
 * vanaf het begin bovenaan, met het lege vakje erin.
 *
 *   groepjes  losse appels en één leeg zakje. Een aangetikte appel krijgt een
 *             rand; nog een tik laat hem weer los. Zijn er genoeg aangetikt
 *             voor een groepje, dan worden ze met een lijntje verbonden en
 *             schuiven ze samen in het zakje. Dan komt er een nieuw leeg zakje.
 *             Nooit alle zakjes vooraf, want dan verklap je het antwoord.
 *             Meer dan 30 appels: één tik vult meteen een heel zakje.
 *   verdelen  een stapel appels en de mandjes. Een tik op een mandje laat er
 *             één appel naartoe gaan; een tik op een appel in een mandje legt
 *             hem terug. Meer dan 30: ook een knop "Iedereen één".
 *
 * Er staat nergens een teller: het kind telt zelf. Het vakje is er meteen,
 * maar het kind kan pas typen als alle appels in zakjes zitten of eerlijk
 * verdeeld zijn. Bij stap "hulp" kan het kind meteen typen, en bouwt het
 * alleen als het op Hulp drukt.
 *
 * Elke appel is een knop van minstens 44 bij 44 pixels; tikken werkt met muis
 * en vinger. Het vakje zelf komt uit `Keeropdracht`, zodat typen, nakijken en
 * meeschuiven met het toetsenbord hetzelfde blijven (HARDE REGEL 5).
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Gegeven } from "@/components/oefenen/Splitsopdracht";
import { bouwOpdracht, deelGoedZin, deelZin } from "@/lib/deelthema";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
type Deelfiguur = Extract<Figuur, { soort: "deelsom" }>;

/** Boven dit aantal helpt het scherm: een heel zakje per tik, of "Iedereen één". */
const VEEL = 30;
/** Hoe lang het lijntje te zien is, en hoe lang het schuiven naar het zakje duurt. */
const LIJN_MS = 550;
const SCHUIF_MS = 450;

function minderBeweging(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

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

/** Een zakje: leeg en open, of vol met kleine appels erin. */
function Zakje({ inhoud, leeg = false }: { inhoud: number; leeg?: boolean }) {
  const kolommen = Math.min(Math.max(inhoud, 1), 5);
  return (
    <span
      className={`relative inline-flex min-h-16 min-w-16 flex-col items-center justify-end rounded-b-[1.6rem] rounded-t-md border-[3px] px-2 pb-2 pt-4 ${
        leeg
          ? "border-dashed border-huisstijl bg-huisstijl-zacht/60"
          : "motion-safe:animate-teller-pop border-amber bg-amber-zacht"
      }`}
    >
      {/* De rand bovenaan, waar het zakje dichtgaat. */}
      <span
        className="absolute inset-x-1 top-1 h-1.5 rounded-full bg-amber/50"
        aria-hidden="true"
      />
      {!leeg && (
        <span
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${kolommen}, 0.95rem)` }}
        >
          {Array.from({ length: inhoud }, (_, i) => (
            <Appel key={i} className="size-[0.95rem]" />
          ))}
        </span>
      )}
    </span>
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

/** Rijtjes van vijf, met ruimte tussen de rijtjes: zo is het te tellen. */
function InRijtjes({ children }: { children: ReactNode[] }) {
  const rijtjes: ReactNode[][] = [];
  children.forEach((kind, i) => {
    if (i % 5 === 0) rijtjes.push([]);
    rijtjes[rijtjes.length - 1].push(kind);
  });
  return (
    <div className="flex max-w-[34rem] flex-wrap justify-center gap-x-4 gap-y-1">
      {rijtjes.map((rij, i) => (
        <div key={i} className="flex gap-0.5">
          {rij}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Groepjes maken
// ---------------------------------------------------------------------------

type Groepstand = {
  /** Per vol zakje de nummers van de appels erin. */
  zakjes: number[][];
  /** De appels met een rand: aangetikt, nog niet in een zakje. */
  gekozen: number[];
  /** Wat er met een vol groepje gebeurt: eerst het lijntje, dan schuiven. */
  stap: "kiezen" | "lijn" | "schuiven";
};

const LEGE_GROEPSTAND: Groepstand = { zakjes: [], gekozen: [], stap: "kiezen" };

function Groepjes({
  figuur,
  uit,
  stand,
  zet,
}: {
  figuur: Deelfiguur;
  uit: boolean;
  stand: Groepstand;
  zet: Dispatch<SetStateAction<Groepstand>>;
}) {
  const { geheel, deler } = figuur;
  const veel = geheel > VEEL;
  const inZakje = new Set(stand.zakjes.flat());
  const los = geheel - inZakje.size;

  const vlak = useRef<HTMLDivElement | null>(null);
  const appels = useRef<(HTMLButtonElement | null)[]>([]);
  const legeZak = useRef<HTMLSpanElement | null>(null);
  const [lijn, setLijn] = useState<{ x: number; y: number }[]>([]);
  const [schuif, setSchuif] = useState<Record<number, string>>({});

  function tik(i: number) {
    zet((s) => {
      if (s.stap !== "kiezen" || s.zakjes.flat().includes(i)) return s;
      if (s.gekozen.includes(i))
        return { ...s, gekozen: s.gekozen.filter((x) => x !== i) };
      if (veel) {
        /* Eén tik vult meteen een heel zakje: deze appel en de losse erna. */
        const bezet = new Set([...s.zakjes.flat(), ...s.gekozen]);
        const vrij = Array.from(
          { length: geheel },
          (_, n) => (i + n) % geheel,
        ).filter((n) => !bezet.has(n));
        return { ...s, gekozen: [...s.gekozen, ...vrij].slice(0, deler) };
      }
      return { ...s, gekozen: [...s.gekozen, i] };
    });
  }

  /* Is het groepje vol, dan het lijntje; daarna schuiven; daarna in het zakje. */
  useEffect(() => {
    if (stand.stap === "kiezen" && stand.gekozen.length === deler) {
      zet((s) => ({ ...s, stap: "lijn" }));
      return;
    }
    if (stand.stap === "lijn") {
      const klokje = window.setTimeout(
        () => zet((s) => ({ ...s, stap: "schuiven" })),
        minderBeweging() ? 250 : LIJN_MS,
      );
      return () => window.clearTimeout(klokje);
    }
    if (stand.stap === "schuiven") {
      const klokje = window.setTimeout(
        () =>
          zet((s) => ({
            zakjes: [...s.zakjes, s.gekozen],
            gekozen: [],
            stap: "kiezen",
          })),
        minderBeweging() ? 0 : SCHUIF_MS,
      );
      return () => window.clearTimeout(klokje);
    }
  }, [stand.stap, stand.gekozen.length, deler, zet]);

  /* Waar het lijntje loopt en waarheen de appels schuiven: gemeten, niet geschat. */
  useLayoutEffect(() => {
    const bak = vlak.current?.getBoundingClientRect();
    if (!bak || stand.stap === "kiezen") {
      setLijn([]);
      setSchuif({});
      return;
    }
    const midden = (el: Element | null | undefined) => {
      const r = el?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    };
    const punten = stand.gekozen
      .map((i) => midden(appels.current[i]))
      .filter((p) => p !== null);
    setLijn(punten.map((p) => ({ x: p.x - bak.left, y: p.y - bak.top })));
    if (stand.stap === "schuiven") {
      const doel = midden(legeZak.current);
      if (doel) {
        setSchuif(
          Object.fromEntries(
            stand.gekozen.map((i, n) => {
              const p = punten[n];
              return [
                i,
                p
                  ? `translate(${doel.x - p.x}px, ${doel.y - p.y}px) scale(0.4)`
                  : "",
              ];
            }),
          ),
        );
      }
    }
  }, [stand.stap, stand.gekozen]);

  return (
    <div
      ref={vlak}
      className="relative flex w-full flex-col items-center gap-4"
    >
      {/* De zakjes: de volle, en één leeg zakje zolang er nog losse appels zijn. */}
      <div className="flex min-h-16 flex-wrap items-end justify-center gap-3">
        {stand.zakjes.map((z, i) => (
          <Zakje key={i} inhoud={z.length} />
        ))}
        {los > 0 && (
          <span ref={legeZak} aria-label="Een leeg zakje">
            <Zakje inhoud={0} leeg />
          </span>
        )}
      </div>

      {/*
        De losse appels, in rijtjes van vijf. Een appel in een zakje laat een
        lege plek achter, zodat de rest niet verspringt; zijn ze allemaal op,
        dan verdwijnt het hele vak.
      */}
      {los > 0 && (
        <InRijtjes>
          {Array.from({ length: geheel }, (_, i) => {
            if (inZakje.has(i))
              return <span key={i} className="size-11" aria-hidden="true" />;
            const gekozen = stand.gekozen.includes(i);
            return (
              <button
                key={i}
                ref={(el) => {
                  appels.current[i] = el;
                }}
                type="button"
                aria-label={
                  gekozen
                    ? "Laat deze appel los"
                    : veel
                      ? "Vul een zakje"
                      : "Tik deze appel aan"
                }
                aria-pressed={gekozen}
                disabled={uit || stand.stap !== "kiezen"}
                onClick={() => tik(i)}
                style={
                  schuif[i]
                    ? {
                        transform: schuif[i],
                        opacity: 0.3,
                        transition: `transform ${SCHUIF_MS}ms ease-in, opacity ${SCHUIF_MS}ms ease-in`,
                      }
                    : undefined
                }
                className={`grid size-11 touch-manipulation place-items-center rounded-full border-[3px] transition-colors disabled:cursor-default ${
                  gekozen
                    ? "border-huisstijl bg-huisstijl-zacht"
                    : "border-transparent enabled:hover:bg-room"
                }`}
              >
                <Appel />
              </button>
            );
          })}
        </InRijtjes>
      )}

      {/* Het lijntje dat een vol groepje verbindt. */}
      {lijn.length > 1 && (
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <polyline
            points={lijn.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--color-huisstijl)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={stand.stap === "schuiven" ? 0 : 0.9}
            style={{ transition: `opacity ${SCHUIF_MS}ms` }}
          />
        </svg>
      )}
    </div>
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
  const [groepen, setGroepen] = useState<Groepstand>(LEGE_GROEPSTAND);
  const [verdeling, setVerdeling] = useState<number[]>(leeg);
  const [hulpOpen, setHulpOpen] = useState(false);

  function opnieuw() {
    setGroepen(LEGE_GROEPSTAND);
    setVerdeling(leeg());
    onOpnieuw();
  }

  /* Na nakijken en opnieuw proberen: weer van voren af aan. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") {
      setGroepen(LEGE_GROEPSTAND);
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
    bouw === "groepjes"
      ? groepen.zakjes.flat().length === figuur.geheel
      : stapelLeeg && evenveel;
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
          {hulpstap && (
            <p className="text-center text-xl font-extrabold text-inkt">
              {bouwOpdracht(bouw, figuur.deler)}
            </p>
          )}
          {bouw === "groepjes" ? (
            <Groepjes
              figuur={figuur}
              uit={uit}
              stand={groepen}
              zet={setGroepen}
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
