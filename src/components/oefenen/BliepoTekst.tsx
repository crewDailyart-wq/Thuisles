"use client";

/**
 * De tekst boven Bliepo, met oplichtende woorden (23 oktober 2026, akkoord
 * eigenaar op het voorbeeld "Tekst boven Bliepo"). Eén gedeeld onderdeel voor
 * alle opdrachten (Maatje), lessen en "Zo werkt het", zodat nieuwe opdrachten
 * het vanzelf gebruiken.
 *
 * - Vrij boven Bliepo, zonder ballon of kader: groot, dik en wit (ronde
 *   letters), met een zachte schaduw (opdracht-nieuw.css, .bliepo-tekst).
 * - Meelezen (sinds 24 oktober 2026): nog niet gezegd gedimd, gezegd wit,
 *   het woord van nu in de warme accentkleur (eerst lichtten de woorden geel
 *   op). Elk woord wordt wit op het moment dat Bliepo het zegt (lib/voorlezen.ts:
 *   de stem meldt wanneer de zin begint, de tijden per woord worden geschat
 *   uit het geluid zelf). Staat standaard aan; uit bij Profiel ("Woorden
 *   oplichten bij voorlezen").
 *
 * `woorden`: de woorden zoals ze in beeld staan (mag opmaak hebben, zoals een
 * gekleurd getal); `gesproken`: dezelfde zin zoals de stem hem kreeg. Klopt
 * dat met de zin die nu klinkt, dan lichten de woorden op.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { abonneerVoorlees, huidigeVoorlees, vergelijkbaar } from "@/lib/voorlezen";
import { leesVoorkeuren } from "@/components/les/voorkeuren";
import { spreekbaar } from "@/lib/maatje/taal";

const geen = () => () => {};

/** Mogen de woorden oplichten? (standaard ja; bij Profiel om te zetten) */
export function useOplichten(): boolean {
  return useSyncExternalStore(geen, () => leesVoorkeuren().oplichten, () => true);
}

/** Het woord (index) dat Bliepo nu zegt in deze zin, of -1. */
export function useWoordNu(gesproken: string | null | undefined): number {
  const v = useSyncExternalStore(abonneerVoorlees, huidigeVoorlees, () => null);
  const past = Boolean(v && gesproken && vergelijkbaar(v.zin) === vergelijkbaar(gesproken));
  const [nu, zetNu] = useState(-1);
  useEffect(() => {
    if (!past || !v) return;
    let frame = 0;
    const loop = () => {
      const t = (performance.now() - v.start) / 1000;
      let i = -1;
      for (let k = 0; k < v.tijden.length; k++) if (v.tijden[k].begin <= t) i = k;
      zetNu(i);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [past, v]);
  return past ? nu : -1;
}

export function BliepoTekst({
  woorden,
  gesproken,
  className = "",
}: {
  woorden: React.ReactNode[];
  gesproken?: string | null;
  className?: string;
}) {
  const oplichten = useOplichten();
  const nu = useWoordNu(oplichten ? gesproken : null);
  /*
    Meelezen (24 oktober 2026, akkoord eigenaar; vervangt de gele oplichting):
    wat Bliepo nog niet gezegd heeft is gedimd, een woord wordt wit zodra hij
    het zegt, en het woord van nu krijgt de warme accentkleur. Een nieuwe zin
    staat al gedimd klaar tot de stem begint (geen witte flits ervoor); begint
    er binnen 2,5 tel geen stem (stem uit), dan gewoon helemaal wit.
  */
  const [wacht, zetWacht] = useState(true);
  const [gelezen, zetGelezen] = useState<string | null>(null);
  useEffect(() => {
    const klok = window.setTimeout(() => zetWacht(false), 2500);
    return () => window.clearTimeout(klok);
  }, [gesproken]);
  const leest = nu >= 0;
  useEffect(() => {
    if (leest && gesproken) {
      const klok = window.setTimeout(() => zetGelezen(gesproken), 0);
      return () => window.clearTimeout(klok);
    }
  }, [leest, gesproken]);
  const klaarMetZin = gelezen === gesproken;
  /*
    Een lange zin past soms niet helemaal boven Bliepo (dan schuift de ballon):
    het woord van nu blijft in beeld, zonder dat de pagina zelf verschuift.
  */
  const zin = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const woord = zin.current?.querySelector<HTMLElement>(".bliepo-tekst-nu");
    const vak = zin.current?.closest<HTMLElement>(".bliepo-vloer-ballon");
    if (!woord || !vak || vak.scrollHeight <= vak.clientHeight) return;
    const w = woord.getBoundingClientRect();
    const v = vak.getBoundingClientRect();
    if (w.top < v.top || w.bottom > v.bottom) vak.scrollTop += w.top - v.top - v.height / 3;
  }, [nu]);
  const voorStem = oplichten && Boolean(gesproken) && wacht && !leest && !klaarMetZin;
  return (
    <p ref={zin} className={`bliepo-tekst ${oplichten ? "bliepo-tekst-meelezen" : ""} ${className}`}>
      {woorden.map((w, i) => {
        const soort = leest ? (i < nu ? " bliepo-tekst-gezegd" : i === nu ? " bliepo-tekst-gezegd bliepo-tekst-nu" : " bliepo-tekst-nog") : voorStem ? " bliepo-tekst-nog" : "";
        return (
          <span key={i} className={`bliepo-tekst-woord${soort}`}>
            {w}
            {i < woorden.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}

/** Een gewone zin in woorden. */
export function inWoorden(zin: string): string[] {
  return zin.trim().split(/\s+/).filter(Boolean);
}

/** Eén regel in het gesprek boven Bliepo. */
export type BliepoRegel = {
  id: string;
  tekst: string;
  van?: "bliepo" | "kind";
  /** Wat hij precies uitspreekt (voor het meelezen); anders de tekst, uitspreekbaar gemaakt. */
  gesproken?: string;
};

/** Hooguit zoveel regels staan er op de pagina; hoeveel er te zien zijn, bepaalt de stijl (1 tot 6, standaard 3). */
export const MAX_REGELS = 6;

/**
 * De zinnen van Bliepo onder elkaar, zoals een gesprek (26 oktober 2026,
 * opdracht eigenaar). Nieuwe zinnen komen onderaan erbij; zijn er meer dan
 * het aantal uit de stijlkiezer ("Aantal zinnen zichtbaar"), dan valt de
 * oudste bovenaan weg (opdracht-nieuw.css, .bliepo-zinnen). Alleen de nieuwste
 * zin leest mee (grijs, wit, het woord van nu oranje); de eerdere staan wit.
 * Is er weinig ruimte, dan kan het kind binnen het tekstvak omhoog schuiven;
 * de nieuwste zin blijft in beeld.
 */
export function BliepoZinnen({ regels }: { regels: BliepoRegel[] }) {
  const lijst = regels.slice(-MAX_REGELS);
  const vak = useRef<HTMLDivElement>(null);
  const laatste = lijst[lijst.length - 1]?.id;
  useEffect(() => {
    const ballon = vak.current?.closest<HTMLElement>(".bliepo-vloer-ballon");
    if (ballon && ballon.scrollHeight > ballon.clientHeight) ballon.scrollTop = ballon.scrollHeight;
  }, [laatste]);
  return (
    <div ref={vak} className="bliepo-zinnen">
      {lijst.map((r, i) =>
        r.van === "kind" ? (
          <p key={r.id} className="bliepo-zin bliepo-zin-kind">
            <span className="sr-only">Jij: </span>
            {r.tekst}
          </p>
        ) : (
          <BliepoTekst
            key={r.id}
            className="bliepo-zin"
            woorden={inWoorden(r.tekst)}
            gesproken={i === lijst.length - 1 ? (r.gesproken ?? spreekbaar(r.tekst)) : null}
          />
        ),
      )}
    </div>
  );
}
