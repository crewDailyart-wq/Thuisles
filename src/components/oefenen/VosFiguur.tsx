"use client";

/**
 * Vos als figuurtje dat meebeweegt met de uitleg.
 *
 * Werkt op twee manieren, met precies dezelfde bediening:
 *
 *   1. Zijn er plaatjes in `public/vos` (blij.png, wijzend.png, ...), dan
 *      worden die gebruikt. De mond en de ogen worden er met code overheen
 *      getekend, op de plek die in `src/lib/vosposities.ts` staat.
 *   2. Zijn die er nog niet, dan tekent hij zichzelf. Zelfde houdingen,
 *      zelfde bewegende mond en knipperende ogen.
 *
 * Daardoor werkt de animatie nu al, en kun je hem later vervangen door echte
 * plaatjes — of door een geanimeerd figuurtje — zonder dat de uitlegscripts of
 * de speler veranderen.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  VOSPOSITIES,
  vosBestand,
  type Houding,
} from "@/lib/vosposities";
import { abonneerPraten, praatOpServer, praatVos } from "@/lib/stem";

export type Beweging = "stil" | "praten" | "wijzen" | "juichen";

/** Hoe ver de mond openstaat. */
type Mond = "dicht" | "half" | "open";

export function VosFiguur({
  houding = "blij",
  beweging = "stil",
  className = "size-20",
}: {
  houding?: Houding;
  beweging?: Beweging;
  className?: string;
}) {
  const praat = useSyncExternalStore(abonneerPraten, praatVos, praatOpServer);
  const [mondStand, setMondStand] = useState<Mond>("dicht");
  const [knippert, setKnippert] = useState(false);
  const [heeftPlaatje, setHeeftPlaatje] = useState(true);

  /*
    De mond gaat open en dicht zolang de stem praat, met een natuurlijk ritme.
    Praat Vos niet, dan is de mond gewoon dicht — dat leiden we af, zodat er
    niets hoeft te worden teruggezet.
  */
  useEffect(() => {
    if (!praat) return;
    const standen: Mond[] = ["open", "half", "open", "dicht", "half"];
    let i = 0;
    const klok = setInterval(() => {
      setMondStand(standen[i % standen.length]);
      i++;
    }, 130);
    return () => clearInterval(klok);
  }, [praat]);

  const mond: Mond = praat ? mondStand : "dicht";

  // Af en toe knipperen, met onregelmatige tussenpozen.
  useEffect(() => {
    let stop = false;
    let klok: ReturnType<typeof setTimeout>;

    function plan() {
      klok = setTimeout(
        () => {
          if (stop) return;
          setKnippert(true);
          setTimeout(() => {
            if (!stop) setKnippert(false);
            plan();
          }, 150);
        },
        2500 + Math.random() * 3500,
      );
    }
    plan();

    return () => {
      stop = true;
      clearTimeout(klok);
    };
  }, []);

  const bewegingKlasse =
    beweging === "juichen"
      ? "animate-vos-sprong"
      : beweging === "wijzen"
        ? "animate-vos-buigen"
        : praat || beweging === "praten"
          ? "animate-vos-wiebel"
          : "";

  const positie = VOSPOSITIES[houding];

  return (
    <span className={`relative inline-block ${className} ${bewegingKlasse}`}>
      {heeftPlaatje ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vosBestand(houding)}
            alt=""
            onError={() => setHeeftPlaatje(false)}
            className="h-full w-full object-contain"
          />
          <Gezicht positie={positie} mond={mond} knippert={knippert} />
        </>
      ) : (
        <GetekendeVos houding={houding} mond={mond} knippert={knippert} />
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------

/** Mond en ogen over een aangeleverd plaatje heen. */
function Gezicht({
  positie,
  mond,
  knippert,
}: {
  positie: (typeof VOSPOSITIES)[Houding];
  mond: Mond;
  knippert: boolean;
}) {
  const hoogte =
    mond === "dicht" ? 0.18 : mond === "half" ? 0.55 : 1;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <ellipse
        cx={positie.mond.x}
        cy={positie.mond.y}
        rx={positie.mond.breedte / 2}
        ry={(positie.mond.hoogte / 2) * hoogte}
        fill="#7d2b3a"
        stroke="#2c2545"
        strokeWidth={0.8}
      />
      {knippert && (
        <>
          <ellipse
            cx={positie.ogen.links.x}
            cy={positie.ogen.links.y}
            rx={positie.ogen.straal}
            ry={positie.ogen.straal * 0.35}
            fill="#e8843c"
          />
          <ellipse
            cx={positie.ogen.rechts.x}
            cy={positie.ogen.rechts.y}
            rx={positie.ogen.straal}
            ry={positie.ogen.straal * 0.35}
            fill="#e8843c"
          />
        </>
      )}
    </svg>
  );
}

/**
 * De getekende Vos, voor zolang er nog geen plaatjes zijn.
 * Zelfde houdingen, zelfde mond en ogen.
 */
function GetekendeVos({
  houding,
  mond,
  knippert,
}: {
  houding: Houding;
  mond: Mond;
  knippert: boolean;
}) {
  const mondHoogte = mond === "dicht" ? 1.2 : mond === "half" ? 4 : 7;
  const wenkbrauw = houding === "verrast" ? -3 : houding === "denkend" ? 1.5 : 0;
  const oogStraal = houding === "verrast" ? 6 : 5.4;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      {/* oren */}
      <path d="M26 44 L20 12 L48 30 Z" fill="#e8843c" />
      <path d="M74 44 L80 12 L52 30 Z" fill="#e8843c" />
      <path d="M29 40 L25 21 L42 32 Z" fill="#c9536f" />
      <path d="M71 40 L75 21 L58 32 Z" fill="#c9536f" />

      {/* kop */}
      <path
        d="M50 22 C73 22 88 40 88 60 C88 80 71 94 50 94 C29 94 12 80 12 60 C12 40 27 22 50 22 Z"
        fill="#e8843c"
      />
      {/* snuit */}
      <path
        d="M50 54 C65 54 76 66 76 76 C76 87 64 94 50 94 C36 94 24 87 24 76 C24 66 35 54 50 54 Z"
        fill="#fdf2e2"
      />

      {/* wenkbrauwen: geven de houding weer */}
      <g stroke="#2c2545" strokeWidth={2.4} strokeLinecap="round">
        <path d={`M31 ${47 + wenkbrauw} q6 -4 12 -1`} fill="none" />
        <path d={`M69 ${47 + wenkbrauw} q-6 -4 -12 -1`} fill="none" />
      </g>

      {/* ogen */}
      {knippert ? (
        <g stroke="#2c2545" strokeWidth={2.4} strokeLinecap="round">
          <path d="M32 58 q5 3 10 0" fill="none" />
          <path d="M58 58 q5 3 10 0" fill="none" />
        </g>
      ) : (
        <>
          <circle cx={37} cy={58} r={oogStraal} fill="#2c2545" />
          <circle cx={63} cy={58} r={oogStraal} fill="#2c2545" />
          <circle cx={38.8} cy={56} r={1.9} fill="#ffffff" />
          <circle cx={64.8} cy={56} r={1.9} fill="#ffffff" />
        </>
      )}

      {/* neus */}
      <ellipse cx={50} cy={70} rx={6} ry={4.6} fill="#2c2545" />

      {/* mond: gaat open en dicht */}
      <ellipse cx={50} cy={80} rx={7} ry={mondHoogte} fill="#7d2b3a" />

      {/* wangetjes */}
      <ellipse cx={28} cy={72} rx={6} ry={4} fill="#f6b39a" opacity={0.75} />
      <ellipse cx={72} cy={72} rx={6} ry={4} fill="#f6b39a" opacity={0.75} />
    </svg>
  );
}
