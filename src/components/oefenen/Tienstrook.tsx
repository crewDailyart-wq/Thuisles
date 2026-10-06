"use client";

/**
 * Bouwsteen 1: de tienstrook (optellen tot en met 20, oktober 2026).
 *
 * Twee rijen van tien vakjes (of één rij tot en met 10), met na elke vijf
 * vakjes een duidelijke tussenruimte, zodat je groepjes van vijf ziet. Blokjes
 * van het eerste getal zijn mandarijnoranje, die van het tweede getal hebben de
 * tweede huisstijlkleur (viool).
 *
 * Een blokje gaat altijd naar het volgende lege vakje: eerst de bovenste rij
 * van links naar rechts, dan de onderste. Het kind tikt een blokje (of plaatje)
 * aan of sleept het naar de strook; het schuift dan soepel naar dat vakje.
 *
 * Er staat geen teller bij: het kind telt zelf. Elk blokje en elk vakje is 48
 * pixels, groot genoeg voor een vinger, en alles werkt met pointer-events, dus
 * met muis, touchpad en vinger hetzelfde.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

/** 0 = eerste getal (oranje), 1 = tweede getal (viool). */
export type Kleur = 0 | 1;

const KLEUR = ["bg-huisstijl", "bg-viool"] as const;
const MAAT = 48;
const SLEEPDREMPEL = 6;

function minderBeweging(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Eén blokje: een egaal vierkantje met zachte hoeken. */
export function Blokje({
  kleur,
  klein = false,
  inVak = false,
}: {
  kleur: Kleur;
  klein?: boolean;
  /** In een vakje van de strook: groeit en krimpt mee met het vakje. */
  inVak?: boolean;
}) {
  const maat = inVak ? "size-[88%] rounded-[22%]" : klein ? "size-6 rounded-md" : "size-11 rounded-xl";
  return (
    <span
      aria-hidden="true"
      className={`block ${KLEUR[kleur]} ${maat} shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)]`}
    />
  );
}

/**
 * De strook zelf. `vakjes` zegt per vakje welk blokje erin ligt. Met
 * `tienLicht` licht de volle bovenste rij op als "10".
 */
export function Strook({
  vakjes,
  rijen,
  tienLicht,
  vakRef,
  strookRef,
  opvallend = false,
  vertraagd = false,
}: {
  vakjes: (Kleur | null)[];
  rijen: 1 | 2;
  /** Weggelaten: geen plek voor "10". Onwaar: wel de plek, nog niet opgelicht. */
  tienLicht?: boolean;
  vakRef?: (i: number, el: HTMLSpanElement | null) => void;
  strookRef?: (el: HTMLDivElement | null) => void;
  /** Licht de strook op als er iets naartoe gesleept wordt. */
  opvallend?: boolean;
  /** Bij de uitleg na een fout antwoord: de blokjes komen één voor één. */
  vertraagd?: boolean;
}) {
  return (
    /*
      Op een smal scherm (telefoon) krimpen de vakjes mee, zodat de hele strook
      past zonder te schuiven. Op een tablet en laptop zijn ze 48 pixels. De
      blokjes en plaatjes waar het kind op tikt, staan buiten de strook en
      blijven altijd 48 pixels.
    */
    <div className="w-full">
      <div
        ref={strookRef}
        role="img"
        aria-label="Tienstrook"
        className={`mx-auto flex w-full max-w-max flex-col gap-1.5 rounded-2xl border-2 p-1.5 transition-colors sm:gap-2 sm:p-2 ${
          opvallend ? "border-huisstijl bg-huisstijl-zacht" : "border-tabellijn bg-kaart"
        }`}
      >
        {Array.from({ length: rijen }, (_, r) => (
          <div key={r} className="relative flex items-center gap-[3px] sm:gap-1">
            {Array.from({ length: 10 }, (_, k) => {
              const i = r * 10 + k;
              const kleur = vakjes[i] ?? null;
              return (
                <span
                  key={k}
                  ref={(el) => vakRef?.(i, el)}
                  className={`grid aspect-square w-12 min-w-0 shrink place-items-center rounded-[22%] border-2 border-dashed border-rand ${k === 5 ? "ml-1.5 sm:ml-3" : ""}`}
                >
                  {kleur !== null && (
                    <span
                      className={`grid size-full place-items-center ${vertraagd ? "motion-safe:animate-teller-pop" : ""}`}
                      style={vertraagd ? { animationDelay: `${i * 90}ms`, animationFillMode: "both" } : undefined}
                    >
                      <Blokje kleur={kleur} inVak />
                    </span>
                  )}
                </span>
              );
            })}
            {/*
              De volle eerste rij: dat is 10. De plek ernaast is er altijd, ook
              als hij leeg is, zodat de strook niet verspringt als hij oplicht.
            */}
            {tienLicht !== undefined && (
              <span className="ml-0.5 grid w-8 shrink-0 place-items-center sm:ml-1 sm:w-11">
                {r === 0 && tienLicht && (
                  <span className="motion-safe:animate-teller-pop rounded-lg bg-geel px-1 py-0.5 text-base font-extrabold text-inkt sm:px-1.5 sm:text-xl">
                    10
                  </span>
                )}
              </span>
            )}
            {r === 0 && tienLicht && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 right-8 rounded-2xl border-4 border-geel bg-geel/15 sm:right-11"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Iets om naar de strook te brengen: een blokje of een plaatje. Tikken brengt
 * het meteen; slepen kan ook, en loslaten boven de strook zet het in het
 * volgende lege vakje. Loslaten ernaast brengt het terug.
 */
export function Sleepding({
  label,
  uit,
  boven,
  onNaarStrook,
  onBoven,
  children,
}: {
  label: string;
  uit: boolean;
  /** Ligt de aanwijzer boven de strook? */
  boven: (x: number, y: number) => boolean;
  onNaarStrook: (van: DOMRect) => void;
  onBoven?: (ja: boolean) => void;
  children: ReactNode;
}) {
  const knop = useRef<HTMLButtonElement | null>(null);
  const start = useRef<{ x: number; y: number; sleept: boolean } | null>(null);
  const [schuif, setSchuif] = useState<{ x: number; y: number } | null>(null);

  return (
    <button
      ref={knop}
      type="button"
      aria-label={label}
      disabled={uit}
      onPointerDown={(e) => {
        if (uit) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, sleept: false };
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (!s.sleept && Math.hypot(dx, dy) < SLEEPDREMPEL) return;
        s.sleept = true;
        setSchuif({ x: dx, y: dy });
        onBoven?.(boven(e.clientX, e.clientY));
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        onBoven?.(false);
        if (!s) return;
        const rect = knop.current?.getBoundingClientRect();
        setSchuif(null);
        if (!rect) return;
        if (!s.sleept || boven(e.clientX, e.clientY)) onNaarStrook(rect);
      }}
      onPointerCancel={() => {
        start.current = null;
        setSchuif(null);
        onBoven?.(false);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && knop.current) {
          e.preventDefault();
          onNaarStrook(knop.current.getBoundingClientRect());
        }
      }}
      className="grid size-12 shrink-0 touch-none place-items-center rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-lucht enabled:cursor-grab enabled:hover:scale-105 disabled:cursor-default"
      style={
        schuif
          ? { transform: `translate(${schuif.x}px, ${schuif.y}px) scale(1.08)`, zIndex: 20, position: "relative" }
          : { transition: "transform 200ms" }
      }
    >
      {children}
    </button>
  );
}

/** Een blokje dat van zijn plek naar een vakje van de strook schuift. */
type Vlucht = { id: number; van: DOMRect; naar: DOMRect; kleur: Kleur; klaar: () => void };

function Vliegend({ vlucht }: { vlucht: Vlucht }) {
  const [aan, setAan] = useState(false);
  useEffect(() => {
    const raam = requestAnimationFrame(() => setAan(true));
    const klok = window.setTimeout(vlucht.klaar, 320);
    return () => {
      cancelAnimationFrame(raam);
      window.clearTimeout(klok);
    };
  }, [vlucht]);
  const { van, naar } = vlucht;
  const dx = naar.left + naar.width / 2 - (van.left + van.width / 2);
  const dy = naar.top + naar.height / 2 - (van.top + van.height / 2);
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed z-50 grid place-items-center"
      style={{
        left: van.left + van.width / 2 - MAAT / 2 + 2,
        top: van.top + van.height / 2 - MAAT / 2 + 2,
        transform: aan ? `translate(${dx}px, ${dy}px)` : "none",
        transition: "transform 300ms cubic-bezier(0.3, 0.8, 0.4, 1)",
      }}
    >
      <Blokje kleur={vlucht.kleur} />
    </span>
  );
}

/**
 * Het bijhouden van de strook: welk vakje is het volgende, en het schuiven
 * ernaartoe. `begin` zijn de vakjes die er al liggen (het eerste getal).
 */
export function useStrook(begin: (Kleur | null)[]) {
  const [vakjes, setVakjes] = useState<(Kleur | null)[]>(begin);
  const [onderweg, setOnderweg] = useState<Vlucht[]>([]);
  const [boven, setBoven] = useState(false);
  const vakken = useRef<(HTMLSpanElement | null)[]>([]);
  const strook = useRef<HTMLDivElement | null>(null);
  const gereserveerd = useRef(begin.filter((k) => k !== null).length);
  const teller = useRef(0);

  /** Ligt dit punt boven de strook? */
  const isBoven = (x: number, y: number) => {
    const r = strook.current?.getBoundingClientRect();
    return !!r && x >= r.left - 16 && x <= r.right + 16 && y >= r.top - 16 && y <= r.bottom + 16;
  };

  /** Een blokje naar het volgende lege vakje sturen. */
  function stuur(van: DOMRect, kleur: Kleur, daarna?: () => void) {
    const plek = gereserveerd.current;
    if (plek >= vakjes.length) return;
    gereserveerd.current = plek + 1;
    const leg = () => {
      setVakjes((v) => v.map((k, i) => (i === plek ? kleur : k)));
      daarna?.();
    };
    const naar = vakken.current[plek]?.getBoundingClientRect();
    if (!naar || minderBeweging()) {
      leg();
      return;
    }
    const id = teller.current++;
    setOnderweg((o) => [
      ...o,
      {
        id,
        van,
        naar,
        kleur,
        klaar: () => {
          setOnderweg((oo) => oo.filter((x) => x.id !== id));
          leg();
        },
      },
    ]);
  }

  return {
    vakjes,
    boven,
    setBoven,
    isBoven,
    stuur,
    vakRef: (i: number, el: HTMLSpanElement | null) => {
      vakken.current[i] = el;
    },
    strookRef: (el: HTMLDivElement | null) => {
      strook.current = el;
    },
    vluchten: onderweg.map((v) => <Vliegend key={v.id} vlucht={v} />),
  };
}

/**
 * De strook bij een som als 8 + 5: het eerste getal ligt er al in, de blokjes
 * van het tweede getal liggen ernaast. Het kind zet ze er één voor één in; de
 * tien wordt eerst vol, de rest komt in de tweede rij.
 */
export function StrookBouwer({
  eerste,
  tweede,
  uit,
  tienLicht = false,
  onKlaar,
}: {
  eerste: number;
  tweede: number;
  uit: boolean;
  /** Licht de volle eerste rij op als "10" (bij optellen via 10). */
  tienLicht?: boolean;
  onKlaar: (klaar: boolean) => void;
}) {
  const totaal = eerste + tweede;
  const rijen: 1 | 2 = totaal > 10 ? 2 : 1;
  const s = useStrook(Array.from({ length: rijen * 10 }, (_, i) => (i < eerste ? 0 : null)));
  const [over, setOver] = useState(tweede);
  const gelegd = s.vakjes.filter((k) => k !== null).length;
  const klaar = gelegd === totaal;
  useEffect(() => onKlaar(klaar), [klaar, onKlaar]);
  const tienVol = s.vakjes.slice(0, 10).every((k) => k !== null);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Strook
        vakjes={s.vakjes}
        rijen={rijen}
        tienLicht={tienLicht ? tienVol : undefined}
        vakRef={s.vakRef}
        strookRef={s.strookRef}
        opvallend={s.boven}
      />
      {/* De blokjes van het tweede getal, in rijtjes van vijf. */}
      {over > 0 && (
        <div className="flex max-w-[22rem] flex-wrap justify-center gap-x-4 gap-y-1">
          {Array.from({ length: Math.ceil(over / 5) }, (_, r) => (
            <div key={r} className="flex gap-1">
              {Array.from({ length: Math.min(5, over - r * 5) }, (_, k) => (
                <Sleepding
                  key={k}
                  label="Blokje naar de strook"
                  uit={uit}
                  boven={s.isBoven}
                  onBoven={s.setBoven}
                  onNaarStrook={(van) => {
                    setOver((o) => Math.max(0, o - 1));
                    s.stuur(van, 1);
                  }}
                >
                  <Blokje kleur={1} />
                </Sleepding>
              ))}
            </div>
          ))}
        </div>
      )}
      {s.vluchten}
    </div>
  );
}

/**
 * De strook als uitleg na een fout antwoord: rustig gevuld, blokje voor blokje,
 * met het eerste getal in oranje en het tweede in viool.
 */
export function StrookUitleg({ eerste, tweede }: { eerste: number; tweede: number }) {
  const totaal = eerste + tweede;
  const rijen: 1 | 2 = totaal > 10 ? 2 : 1;
  const vakjes = Array.from({ length: rijen * 10 }, (_, i): Kleur | null =>
    i < eerste ? 0 : i < totaal ? 1 : null,
  );
  return <Strook vakjes={vakjes} rijen={rijen} vertraagd />;
}
