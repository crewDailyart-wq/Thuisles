"use client";

/**
 * Getallen naar de juiste afbeelding slepen.
 *
 * Boven staan de figuren met onder elk een leeg vakje; daaronder de losse
 * getallen. Het kind sleept een getal naar een vakje, en mag het daarna weer
 * verplaatsen of terugleggen.
 *
 * ---------------------------------------------------------------------------
 * Waarom geen HTML-slepen
 * ---------------------------------------------------------------------------
 * De ingebouwde `draggable` van HTML werkt niet op een touchscreen — en dit is
 * bij uitstek iets wat op een tablet wordt gedaan. Daarom pointer-events:
 * `pointerdown`, `pointermove` en `pointerup` gelden voor muis, vinger én pen,
 * dus er is maar één manier van doen die overal werkt.
 *
 * `setPointerCapture` houdt de sleep bij het element, ook als de vinger even
 * buiten het vakje komt. `touch-action: none` op een getal voorkomt dat het
 * scherm meescrollt terwijl er gesleept wordt.
 *
 * ---------------------------------------------------------------------------
 * Ook zonder slepen
 * ---------------------------------------------------------------------------
 * Tikken werkt net zo goed: tik een getal aan en tik daarna een vakje. Voor een
 * kind met kleine of onhandige vingers is dat vaak makkelijker, en het is de
 * enige manier die met een toetsenbord te bedienen valt. Slepen blijft gewoon
 * werken; dit is er een manier bij, geen vervanging.
 */

import { useRef, useState } from "react";
import { Telfiguur } from "@/components/oefenen/Telfiguren";
import type { Figuur } from "@/lib/generatoren/soort";

export type Sleepfase = "bezig" | "goed" | "fout";

/** Waar een getal ligt: in de voorraad, of onder figuur nummer zoveel. */
type Plek = { soort: "voorraad" } | { soort: "vak"; index: number };

export function SleepGetallen({
  figuur,
  /** De getallen die te verslepen zijn, in de volgorde waarin ze getoond worden. */
  keuzes,
  /** Per figuur het neergelegde getal, of null. */
  ingevuld,
  fase,
  /** De goede getallen, om na een fout te kunnen laten zien wat het moest zijn. */
  goedeWaarden,
  onWijzig,
}: {
  figuur: Extract<Figuur, { soort: "telrij" }>;
  keuzes: number[];
  ingevuld: (number | null)[];
  fase: Sleepfase;
  goedeWaarden?: number[] | null;
  onWijzig: (nieuw: (number | null)[]) => void;
}) {
  /* Welk getal het kind nu vasthoudt of heeft aangetikt. */
  const [bezig, setBezig] = useState<{ waarde: number; vanaf: Plek } | null>(null);
  const [zweef, setZweef] = useState<{ x: number; y: number } | null>(null);
  const vakken = useRef<(HTMLDivElement | null)[]>([]);

  /*
    Tik of sleep? Dat scheelt wat er bij het loslaten hoort te gebeuren, en het
    is niet aan het gebaar zelf te zien: een sleep begint met precies dezelfde
    pointerdown als een tik. Daarom wordt hier bijgehouden of de vinger sinds
    het neerzetten echt een stuk verplaatst is. Een paar pixels tellen niet mee;
    een kindervinger staat nooit helemaal stil.
  */
  const verplaatst = useRef(false);
  const beginpunt = useRef<{ x: number; y: number } | null>(null);
  const SLEEPGRENS = 8;

  const uit = fase !== "bezig";

  /* Een getal uit de voorraad is op zodra het in een vakje ligt. */
  const voorraad = keuzes.filter((w, i) => {
    /* Dubbele getallen mogen: tel hoe vaak dit getal al ligt. */
    const eerder = keuzes.slice(0, i).filter((k) => k === w).length;
    const ligtErAl = ingevuld.filter((k) => k === w).length;
    return eerder >= ligtErAl;
  });

  function leg(waarde: number, vanaf: Plek, naar: Plek) {
    const nieuw = [...ingevuld];

    /* Eerst weghalen waar het vandaan komt. */
    if (vanaf.soort === "vak") nieuw[vanaf.index] = null;

    if (naar.soort === "vak") {
      /* Ligt er al iets? Dat gaat terug naar de voorraad. */
      nieuw[naar.index] = waarde;
    }

    onWijzig(nieuw);
    setBezig(null);
    setZweef(null);
  }

  /** Welk vakje ligt onder dit punt? `null` = ernaast, dus terug naar voorraad. */
  function vakOnder(x: number, y: number): number | null {
    for (let i = 0; i < vakken.current.length; i++) {
      const el = vakken.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  }

  function startSleep(e: React.PointerEvent, waarde: number, vanaf: Plek) {
    if (uit) return;
    /*
      De pointer vasthouden, zodat de sleep bij dit getal blijft ook als de
      vinger er even naast komt. Lukt dat niet (oude browser, rare pointer),
      dan werkt het slepen nog steeds — alleen minder vergevingsgezind.
    */
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* Geen bezwaar; zie hierboven. */
    }
    setBezig({ waarde, vanaf });
    setZweef({ x: e.clientX, y: e.clientY });
  }

  function beweeg(e: React.PointerEvent) {
    if (!bezig) return;
    const begin = beginpunt.current;
    if (begin && Math.hypot(e.clientX - begin.x, e.clientY - begin.y) > SLEEPGRENS) {
      verplaatst.current = true;
    }
    setZweef({ x: e.clientX, y: e.clientY });
  }

  function losLaten(e: React.PointerEvent) {
    if (!bezig) return;
    const doelIndex = vakOnder(e.clientX, e.clientY);

    /*
      Is er nauwelijks bewogen, dan was het een tik en geen sleep. Dan blijft het
      getal "in de hand" zodat het kind daarna een vakje kan aantikken: een tik
      op een getal pakt het op, een tik op een gevuld vakje ook.
    */
    if (!verplaatst.current) {
      const uitDitVak = bezig.vanaf.soort === "vak" && bezig.vanaf.index === doelIndex;
      if (doelIndex === null || uitDitVak) {
        setZweef(null);
        return;
      }
    }

    if (doelIndex !== null) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index: doelIndex });
      return;
    }

    /* Buiten alle vakken losgelaten: terug naar de voorraad. */
    if (bezig.vanaf.soort === "vak") {
      leg(bezig.waarde, bezig.vanaf, { soort: "voorraad" });
      return;
    }
    setZweef(null);
  }

  function tikVak(index: number) {
    if (uit) return;
    if (bezig) {
      leg(bezig.waarde, bezig.vanaf, { soort: "vak", index });
      return;
    }
    /* Niets in de hand: dan pakt een tik het getal uit dit vakje weer op. */
    const erin = ingevuld[index];
    if (erin !== null) setBezig({ waarde: erin, vanaf: { soort: "vak", index } });
  }

  const vakKleur = (i: number) => {
    if (fase === "bezig") return "border-rand bg-room/60";
    if (goedeWaarden && ingevuld[i] === goedeWaarden[i]) {
      return "border-groen bg-groen-zacht text-groen-diep";
    }
    return "border-roze bg-roze-zacht text-roze";
  };

  return (
    <div
      className="flex flex-col gap-5"
      onPointerDown={(e) => {
        /* Elk nieuw gebaar begint als een tik, totdat de vinger echt beweegt. */
        verplaatst.current = false;
        beginpunt.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={beweeg}
      onPointerUp={losLaten}
      onPointerCancel={losLaten}
    >
      {/* De figuren met hun vakje eronder. */}
      <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4">
        {figuur.items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Telfiguur
              soort={item.soort}
              aantal={item.aantal}
              className="h-24 w-24 drop-shadow-sm sm:h-28 sm:w-28"
            />
            <div
              ref={(el) => {
                vakken.current[i] = el;
              }}
              /*
                Geen onClick hier: het loslaten wordt al door `losLaten`
                afgehandeld, en een klik erbovenop pakte het net neergelegde
                getal meteen weer op. Het toetsenbord gebruikt `tikVak` nog wel.
              */
              onPointerDown={(e) => {
                /* Een gevuld vakje is zelf ook een plek om vanaf te slepen. */
                const erin = ingevuld[i];
                if (!bezig && erin !== null) startSleep(e, erin, { soort: "vak", index: i });
              }}
              role="button"
              tabIndex={uit ? -1 : 0}
              aria-label={
                ingevuld[i] === null
                  ? `Leeg vakje onder afbeelding ${i + 1}`
                  : `Vakje onder afbeelding ${i + 1}: ${ingevuld[i]}`
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tikVak(i);
                }
              }}
              className={`grid h-14 w-20 cursor-pointer place-items-center rounded-2xl border-2 border-dashed text-2xl font-extrabold transition [touch-action:none] ${vakKleur(
                i,
              )} ${bezig && fase === "bezig" ? "ring-2 ring-viool/40" : ""}`}
            >
              {ingevuld[i] ?? ""}
            </div>
            {/* Na een fout: wat het had moeten zijn. */}
            {fase === "fout" && goedeWaarden && ingevuld[i] !== goedeWaarden[i] && (
              <span className="text-sm font-extrabold text-groen-diep">{goedeWaarden[i]}</span>
            )}
          </div>
        ))}
      </div>

      {/* De losse getallen. */}
      {fase === "bezig" && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {voorraad.map((waarde, i) => (
            <button
              key={`${waarde}-${i}`}
              type="button"
              onPointerDown={(e) => startSleep(e, waarde, { soort: "voorraad" })}
              onClick={() => setBezig({ waarde, vanaf: { soort: "voorraad" } })}
              aria-label={`Getal ${waarde}`}
              className={`grid h-14 w-14 select-none place-items-center rounded-2xl border-2 text-2xl font-extrabold transition [touch-action:none] ${
                bezig?.waarde === waarde && bezig.vanaf.soort === "voorraad"
                  ? "border-viool bg-viool text-white"
                  : "border-viool/50 bg-white text-viool-diep hover:bg-viool-zacht"
              }`}
            >
              {waarde}
            </button>
          ))}
        </div>
      )}

      {/* Het getal dat meereist met de vinger of de muis. */}
      {bezig && zweef && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-[70] grid h-14 w-14 place-items-center rounded-2xl border-2 border-viool bg-viool text-2xl font-extrabold text-white shadow-op"
          style={{ left: zweef.x - 28, top: zweef.y - 28 }}
        >
          {bezig.waarde}
        </span>
      )}
    </div>
  );
}
