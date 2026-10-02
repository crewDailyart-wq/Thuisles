"use client";

/**
 * Kaartjes met een som erop naar de goede regel slepen.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit naast `Koppelsommen` staat
 * ---------------------------------------------------------------------------
 * `Koppelsommen` in `Optelopdracht.tsx` sleept getállen: één getal per vakje,
 * en het weet zelf hoe het de uitkomst van een rij uitrekent. Hier worden geen
 * getallen gesleept maar sommen — "5 × 4" naar "20 : 5" — en dan is het
 * antwoord het nummer van het kaartje en niet een getal.
 *
 * Dat is bewust een eigen onderdeel geworden en geen uitbreiding van het
 * bestaande. `Koppelsommen` hangt onder vier oefeningen die allemaal werken;
 * dat onderdeel opentrekken om twee soorten inhoud te kunnen tekenen zou die
 * vier in gevaar brengen voor een opdracht die er niets mee te maken heeft (zie
 * HARDE REGEL 1). De bediening is wél precies dezelfde, zoals ONTWERPREGELS.md
 * voorschrijft: het kaartje hangt onder de vinger, het hele doelvak telt, het
 * doelvak licht op, loslaten naast een vak brengt het kaartje terug, tikken
 * werkt ook, en het scherm scrollt niet mee.
 *
 * ---------------------------------------------------------------------------
 * Uitlijnen
 * ---------------------------------------------------------------------------
 * De regels staan in een raster met twee vaste kolommen: links de som, rechts
 * het vak waar het kaartje in moet. Daardoor staan alle vakken recht onder
 * elkaar, ook als de ene som breder is dan de andere. De kaartjes die nog
 * klaarliggen staan onder een eigen gestippelde rand, met genoeg ruimte zodat
 * een kaartje nooit over een regel heen valt.
 */

import { useEffect, useRef, useState } from "react";

type Fase = "bezig" | "goed" | "fout";

/** Waar een kaartje ligt: in de voorraad, of bij regel nummer zoveel. */
type Plek = "voorraad" | number;

export function Sleepkaartjes({
  regels,
  keuzes,
  keuzeLabels,
  grootVak = false,
  fase,
  uit,
  uitslagen,
  goedeKeuzes,
  onWijzig,
}: {
  /**
   * Wat er links staat, van boven naar beneden.
   *
   * Een som als tekst bij Tafels en Delen, een getekende klok bij Tijd. Daarom
   * geen tekst maar wat er maar getekend kan worden.
   */
  regels: React.ReactNode[];
  /** De kaartjes, in de volgorde waarin ze klaarliggen. */
  keuzes: React.ReactNode[];
  /**
   * Hoe elk kaartje heet, voor wie het scherm laat voorlezen.
   *
   * Staat een som als tekst op het kaartje, dan is dat genoeg en mag dit weg;
   * bij een getekende klok valt er niets voor te lezen en hoort hier de tijd.
   */
  keuzeLabels?: string[];
  /**
   * Vakjes die meteen hoog genoeg zijn voor een kaartje met een getekende
   * klok. Anders springt het vakje groter zodra het kaartje erin valt.
   */
  grootVak?: boolean;
  fase: Fase;
  uit: boolean;
  uitslagen: ("goed" | "fout" | null)[];
  /** Per regel het nummer van het kaartje dat erbij hoort; voor na het nakijken. */
  goedeKeuzes: number[];
  onWijzig: (waarde: string) => void;
}) {
  const [plek, setPlek] = useState<Plek[]>(() => keuzes.map(() => "voorraad"));
  const [bezig, setBezig] = useState<{ nummer: number; vanaf: Plek } | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const [boven, setBoven] = useState<Plek | null>(null);

  const vakken = useRef<(HTMLDivElement | null)[]>([]);
  const voorraadRef = useRef<HTMLDivElement | null>(null);
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);
  const SLEEPGRENS = 8;

  /* Opnieuw beginnen: alleen bij de overgang van nagekeken terug naar bezig. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    const wasKlaar = vorigeFase.current !== "bezig";
    vorigeFase.current = fase;
    if (wasKlaar && fase === "bezig") setPlek(keuzes.map(() => "voorraad"));
  }, [fase, keuzes]);

  function leg(nummer: number, naar: Plek) {
    if (uit) return;
    const nieuw = [...plek];
    /* In een vak past er maar één; wie er lag gaat terug naar de voorraad. */
    if (naar !== "voorraad") {
      nieuw.forEach((p, i) => {
        if (p === naar) nieuw[i] = "voorraad";
      });
    }
    nieuw[nummer] = naar;
    setPlek(nieuw);

    /* Per regel het nummer van het kaartje dat erin ligt. */
    const perRegel = regels.map((_, rij) => {
      const welke = nieuw.findIndex((p) => p === rij);
      return welke < 0 ? "" : String(welke);
    });
    onWijzig(perRegel.every((w) => w !== "") ? perRegel.join(",") : "");
  }

  function vakOnder(x: number, y: number): Plek | null {
    for (let i = 0; i < vakken.current.length; i++) {
      const el = vakken.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    const v = voorraadRef.current?.getBoundingClientRect();
    if (v && x >= v.left && x <= v.right && y >= v.top && y <= v.bottom) return "voorraad";
    return null;
  }

  function pak(e: React.PointerEvent, nummer: number) {
    if (uit) return;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Lukt het vasthouden niet, dan werkt het slepen nog wel. */
    }
    setBezig({ nummer, vanaf: plek[nummer] });
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(vakOnder(e.clientX, e.clientY));
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const begin = beginpunt.current;
    if (begin && Math.hypot(e.clientX - begin.x, e.clientY - begin.y) > SLEEPGRENS) {
      verplaatst.current = true;
    }
    setZweef({ x: e.clientX, y: e.clientY });
    setBoven(vakOnder(e.clientX, e.clientY));
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    const doel = vakOnder(e.clientX, e.clientY);
    const { nummer, vanaf } = bezig;
    setBezig(null);
    setZweef(null);
    setBoven(null);

    /* Nauwelijks bewogen? Dan was het een tik. */
    if (!verplaatst.current) {
      if (vanaf === "voorraad") {
        const leegVak = regels.findIndex((_, rij) => !plek.includes(rij));
        if (leegVak >= 0) leg(nummer, leegVak);
      } else {
        leg(nummer, "voorraad");
      }
      return;
    }
    if (doel === null) return;
    leg(nummer, doel);
  }

  /** Eén kaartje met een som erop. */
  const kaart = (nummer: number, inVak: boolean) => (
    <button
      key={nummer}
      type="button"
      disabled={uit}
      aria-label={`Kaartje ${keuzeLabels?.[nummer] ?? String(keuzes[nummer])}`}
      onPointerDown={(e) => pak(e, nummer)}
      className={`grid place-items-center rounded-2xl border-2 border-geel bg-geel-zacht text-lg font-extrabold tabular-nums text-inkt transition [touch-action:none] disabled:cursor-not-allowed ${
        /* In het vakje minder rand, zodat ook een getekende klok erin past. */
        inVak ? "size-full px-1 py-1" : "px-3 py-2"
      } ${bezig?.nummer === nummer ? "opacity-30" : ""}`}
    >
      {keuzes[nummer]}
    </button>
  );

  return (
    <div
      className="relative flex w-full flex-col items-center gap-4"
      onPointerDown={(e) => {
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/*
        Twee vaste kolommen: links de som, rechts het vak. Zo staan alle vakken
        recht onder elkaar, los van hoe breed de som ervoor is.
      */}
      <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-2">
        {regels.map((regel, rij) => {
          const welke = plek.findIndex((p) => p === rij);
          const uitslag = uitslagen[rij] ?? null;
          const rand =
            uitslag === "goed"
              ? "border-groen bg-groen-zacht"
              : uitslag === "fout"
                ? "border-roze bg-roze-zacht"
                : boven === rij
                  ? "border-huisstijl bg-huisstijl-zacht"
                  : "border-rand bg-kaart";
          return (
            <div key={rij} className="col-span-2 grid grid-cols-subgrid items-center">
              <span className="flex items-center justify-end text-right text-xl font-extrabold tabular-nums text-inkt">
                {regel}
              </span>
              <span className="flex items-center gap-2">
                <div
                  ref={(el) => {
                    vakken.current[rij] = el;
                  }}
                  className={`grid ${grootVak ? "min-h-30" : "min-h-15"} min-w-32 place-items-center rounded-2xl border-2 p-1 transition [touch-action:none] ${rand}`}
                >
                  {welke >= 0 ? kaart(welke, true) : null}
                </div>
                {/* Pas na Controleer: welk kaartje het had moeten zijn. */}
                {uit && uitslag === "fout" && (
                  <span className="text-sm font-extrabold text-groen-diep">
                    {keuzeLabels?.[goedeKeuzes[rij]] ?? keuzes[goedeKeuzes[rij]]}
                  </span>
                )}
                {uit && uitslag === "goed" && (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5 text-groen-diep"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* De kaartjes die nog klaarliggen. */}
      <div
        ref={voorraadRef}
        className={`flex min-h-16 w-full max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2 transition [touch-action:none] ${
          boven === "voorraad" ? "border-huisstijl bg-huisstijl-zacht" : "border-rand"
        }`}
      >
        {plek.map((p, i) => (p === "voorraad" ? kaart(i, false) : null))}
      </div>

      {/* Het kaartje dat met de vinger meereist. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] grid place-items-center rounded-2xl border-2 border-geel bg-geel-zacht px-3 py-2 text-lg font-extrabold tabular-nums text-inkt shadow-op"
          style={{ left: zweef.x - 40, top: zweef.y - 28 }}
        >
          {keuzes[bezig.nummer]}
        </span>
      )}
    </div>
  );
}
