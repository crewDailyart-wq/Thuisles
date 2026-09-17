"use client";

/**
 * Vos' trein: zet de wagons op volgorde.
 *
 * Een vrolijke locomotief links, met daarachter lege koppelplekken. De wagons
 * staan door elkaar op het rangeerspoor eronder, elk met een groot getal. Het
 * kind sleept ze op volgorde achter de locomotief.
 *
 * ---------------------------------------------------------------------------
 * Hetzelfde slepen als bij "Tellen en slepen"
 * ---------------------------------------------------------------------------
 * Bewust dezelfde bediening: oppakken met een tik of met een sleep, neerzetten
 * op een lege plek, en een wagon die al staat kun je weer oppakken. Een kind
 * dat het daar geleerd heeft, hoeft hier niets nieuws te leren.
 *
 * De ingebouwde `draggable` van HTML werkt niet op een touchscreen, en dit is
 * een app voor tablets. Daarom met pointer-gebeurtenissen, precies zoals bij
 * dat type.
 *
 * ---------------------------------------------------------------------------
 * Waarom een trein
 * ---------------------------------------------------------------------------
 * Ordenen is voor een kind geen som maar een handeling: iets op de goede plek
 * leggen. Een trein maakt die handeling zichtbaar — de wagons horen áchter
 * elkaar, en zodra het klopt rijdt hij weg. Dat is de beloning, en meteen de
 * controle.
 */

import { useRef, useState } from "react";
import { Vosbeeld, type Voshoudingen } from "@/components/oefenen/Vosnaastvak";

const RAND = "#33261c";
const RANDDIKTE = 4;

/** Vrolijke wagonkleuren, in vaste volgorde zodat een wagon zijn kleur houdt. */
const KLEUREN = ["#f2a03d", "#6ec2a0", "#ef8080", "#87b9ee", "#c79ae8"];

/** De locomotief, met een wolkje stoom uit de schoorsteen. */
function Locomotief() {
  return (
    <svg viewBox="0 0 120 100" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Stoomwolkjes */}
      <g className="motion-safe:animate-stoom">
        <circle cx="30" cy="16" r="9" fill="#ffffff" opacity="0.95" stroke={RAND} strokeWidth="2.5" />
        <circle cx="45" cy="8" r="6" fill="#ffffff" opacity="0.8" stroke={RAND} strokeWidth="2.5" />
      </g>

      {/* Schoorsteen */}
      <rect x="22" y="26" width="16" height="16" rx="3" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      {/* Cabine */}
      <path
        d="M62 26 h40 a4 4 0 0 1 4 4 v42 h-44 z"
        fill="#e2622f"
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeLinejoin="round"
      />
      <rect x="72" y="34" width="24" height="20" rx="4" fill="#eaf6ff" stroke={RAND} strokeWidth={RANDDIKTE * 0.8} />
      {/* Ketel */}
      <rect x="14" y="42" width="52" height="30" rx="8" fill="#f2a03d" stroke={RAND} strokeWidth={RANDDIKTE} />
      <path d="M20 48 h34 v6 h-34 z" fill="#ffffff" opacity="0.35" />
      {/* Wielen */}
      <circle cx="30" cy="78" r="12" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="30" cy="78" r="4" fill="#fdf6e8" />
      <circle cx="84" cy="80" r="10" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="84" cy="80" r="3.5" fill="#fdf6e8" />
    </svg>
  );
}

/** Eén wagon, met zijn getal groot op de zijkant. */
function Wagon({ getal, kleur }: { getal: number | null; kleur: number }) {
  const vlak = getal === null ? "#fdf6e8" : KLEUREN[kleur % KLEUREN.length];

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
      {/* Koppelstuk */}
      <rect x="-6" y="52" width="12" height="7" rx="3" fill={RAND} />
      <rect
        x="4"
        y="24"
        width="92"
        height="48"
        rx="8"
        fill={vlak}
        stroke={RAND}
        strokeWidth={RANDDIKTE}
        strokeDasharray={getal === null ? "9 7" : undefined}
      />
      {getal !== null && (
        <>
          <path d="M10 30 h76 v7 h-76 z" fill="#ffffff" opacity="0.35" />
          <text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="800" fill={RAND}>
            {getal}
          </text>
        </>
      )}
      <circle cx="28" cy="80" r="10" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="28" cy="80" r="3.5" fill="#fdf6e8" />
      <circle cx="72" cy="80" r="10" fill="#3f4b5b" stroke={RAND} strokeWidth={RANDDIKTE} />
      <circle cx="72" cy="80" r="3.5" fill="#fdf6e8" />
    </svg>
  );
}

type Plek = { soort: "spoor" } | { soort: "vak"; index: number };

/**
 * De hele trein, met het rangeerspoor eronder.
 *
 * `ingevuld` is per koppelplek het getal dat er staat, of `null`. Dat is ook
 * wat er als antwoord doorgegeven wordt — in dezelfde volgorde, met komma's
 * ertussen, net als bij "Tellen en slepen".
 */
export function Trein({
  wagons,
  ingevuld,
  goedeWaarden = null,
  fase = "bezig",
  vos = { vangend: null, wachtend: null, blij: null },
  onWijzig,
}: {
  /** De getallen zoals ze op het rangeerspoor klaarstaan. */
  wagons: number[];
  ingevuld: (number | null)[];
  /** Na het nakijken: wat er had moeten staan. */
  goedeWaarden?: number[] | null;
  fase?: "bezig" | "goed" | "fout";
  vos?: Voshoudingen;
  onWijzig?: (nieuw: (number | null)[]) => void;
}) {
  const uit = fase !== "bezig";
  const [bezig, setBezig] = useState<{ waarde: number; vanaf: Plek } | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const vakken = useRef<(HTMLDivElement | null)[]>([]);
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);

  /* Wat er nog op het rangeerspoor staat: alles wat niet gekoppeld is. */
  const opSpoor: number[] = [];
  const gebruikt = [...ingevuld];
  for (const w of wagons) {
    const plek = gebruikt.indexOf(w);
    if (plek >= 0) gebruikt[plek] = null;
    else opSpoor.push(w);
  }

  function leg(waarde: number, vanaf: Plek, naar: Plek) {
    const nieuw = [...ingevuld];
    if (vanaf.soort === "vak") nieuw[vanaf.index] = null;

    if (naar.soort === "vak") {
      /* Staat er al een wagon? Die gaat terug naar het spoor. */
      nieuw[naar.index] = waarde;
    }
    setBezig(null);
    setZweef(null);
    onWijzig?.(nieuw);
  }

  function startSleep(e: React.PointerEvent, waarde: number, vanaf: Plek) {
    if (uit) return;
    setBezig({ waarde, vanaf });
    setZweef({ x: e.clientX, y: e.clientY });
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const start = beginpunt.current;
    if (start && (Math.abs(e.clientX - start.x) > 6 || Math.abs(e.clientY - start.y) > 6)) {
      verplaatst.current = true;
    }
    if (verplaatst.current) setZweef({ x: e.clientX, y: e.clientY });
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    /* Een tik zonder beweging laat de wagon in de hand; die zet je met een
       tweede tik neer. Zo werkt het ook bij "Tellen en slepen". */
    if (!verplaatst.current) return;

    let doel: number | null = null;
    vakken.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        doel = i;
      }
    });

    if (doel !== null) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index: doel });
      return;
    }
    if (bezig.vanaf.soort === "vak") {
      leg(bezig.waarde, bezig.vanaf, { soort: "spoor" });
      return;
    }
    setBezig(null);
    setZweef(null);
  }

  function tikVak(index: number) {
    if (uit) return;
    if (bezig) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index });
      return;
    }
    const erin = ingevuld[index];
    if (erin !== null) setBezig({ waarde: erin, vanaf: { soort: "vak", index } });
  }

  const goed = fase === "goed";

  return (
    <div
      className="flex flex-col gap-4"
      onPointerDown={(e) => {
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/* De trein zelf: locomotief met de koppelplekken erachter. */}
      <div className="rounded-groot border-2 border-rand bg-[#eaf6ff] p-3 shadow-op sm:p-4">
        <div
          className={`flex items-end gap-1 transition-transform duration-700 ease-in ${
            goed ? "translate-x-[12%]" : ""
          }`}
        >
          <span className="block w-[22%] shrink-0">
            <Locomotief />
          </span>

          {ingevuld.map((waarde, i) => (
            <div
              key={i}
              ref={(el) => {
                vakken.current[i] = el;
              }}
              onPointerDown={(e) => {
                const erin = ingevuld[i];
                if (!bezig && erin !== null) startSleep(e, erin, { soort: "vak", index: i });
              }}
              role="button"
              tabIndex={uit ? -1 : 0}
              aria-label={
                waarde === null ? `Lege plek ${i + 1}` : `Plek ${i + 1}: wagon ${waarde}`
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tikVak(i);
                }
              }}
              className={`w-full cursor-pointer rounded-xl transition [touch-action:none] ${
                bezig && fase === "bezig" ? "ring-2 ring-huisstijl/40" : ""
              } ${
                fase === "fout" && goedeWaarden && waarde !== goedeWaarden[i]
                  ? "ring-4 ring-roze"
                  : ""
              }`}
            >
              <Wagon getal={waarde} kleur={waarde === null ? 0 : wagons.indexOf(waarde)} />
              {fase === "fout" && goedeWaarden && waarde !== goedeWaarden[i] && (
                <span className="block text-center text-sm font-extrabold text-groen-diep">
                  {goedeWaarden[i]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* De rails onder de trein. */}
        <span aria-hidden="true" className="mt-1 block h-1.5 w-full rounded-full bg-[#9aa7b4]" />
      </div>

      {/* Het rangeerspoor: de wagons die nog moeten worden ingedeeld. */}
      {fase === "bezig" && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {opSpoor.map((waarde) => (
            <button
              key={waarde}
              type="button"
              onPointerDown={(e) => startSleep(e, waarde, { soort: "spoor" })}
              onClick={() => setBezig({ waarde, vanaf: { soort: "spoor" } })}
              aria-label={`Wagon ${waarde}`}
              className={`block w-[19%] min-w-16 select-none rounded-xl transition [touch-action:none] ${
                bezig?.waarde === waarde && bezig.vanaf.soort === "spoor"
                  ? "scale-105 ring-4 ring-huisstijl"
                  : "hover:scale-105"
              }`}
            >
              <Wagon getal={waarde} kleur={wagons.indexOf(waarde)} />
            </button>
          ))}

          {/* Vos kijkt toe vanaf de perronkant; hij staat buiten de wagons. */}
          {vos.vangend && (
            <span aria-hidden="true" className="block w-[14%] min-w-12">
              <Vosbeeld houdingen={vos} stand="wachtend" />
            </span>
          )}
        </div>
      )}

      {/* De wagon die meereist met de vinger of de muis. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 block w-20"
          style={{ left: zweef.x - 40, top: zweef.y - 40 }}
        >
          <Wagon getal={bezig.waarde} kleur={wagons.indexOf(bezig.waarde)} />
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dezelfde trein in het uitlegfilmpje
// ---------------------------------------------------------------------------

/**
 * De trein in de uitleg: de wagons springen één voor één op hun plek.
 *
 * `klaar` zegt hoeveel wagons er al gekoppeld zijn; `nadruk` welke er nu
 * oplicht. Zo is te zien dat ordenen stap voor stap gaat: eerst de kleinste,
 * dan de volgende.
 */
export function Uitlegtrein({
  volgorde,
  klaar,
  nadruk = null,
  bijschrift,
}: {
  /** De wagons in de goede volgorde. */
  volgorde: number[];
  klaar: number;
  nadruk?: number | null;
  bijschrift?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-sm rounded-groot border-2 border-rand bg-[#eaf6ff] p-3 shadow-op">
        <div className="flex items-end gap-1">
          <span className="block w-[22%] shrink-0">
            <Locomotief />
          </span>
          {volgorde.map((waarde, i) => (
            <span
              key={i}
              className={`block w-full transition ${
                i < klaar ? "" : "opacity-25"
              } ${nadruk === i ? "scale-110" : ""}`}
            >
              <Wagon getal={i < klaar ? waarde : null} kleur={i} />
            </span>
          ))}
        </div>
        <span aria-hidden="true" className="mt-1 block h-1.5 w-full rounded-full bg-[#9aa7b4]" />
      </div>
      {bijschrift && (
        <p className="text-3xl font-extrabold tabular-nums text-huisstijl-diep">{bijschrift}</p>
      )}
    </div>
  );
}
