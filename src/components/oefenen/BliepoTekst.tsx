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

import { praatHeelUit, stemOnderweg, zeg } from "@/lib/stem";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  /*
    Het woord van nu hoort bij 1 uitspraak (v). Zonder dat bleef het laatste woord van de vorige zin nog 1 beeldje staan
    als de volgende zin begon: dan stond de nieuwe zin heel even wit en werd hij daarna weer gedimd (F7, gemeten bij de
    gouden les Meer-minder, 10 november 2026).
  */
  const [nu, zetNu] = useState<{ v: unknown; i: number }>({ v: null, i: -1 });
  useEffect(() => {
    if (!past || !v) return;
    let frame = 0;
    const loop = () => {
      const t = (performance.now() - v.start) / 1000;
      let i = -1;
      for (let k = 0; k < v.tijden.length; k++) if (v.tijden[k].begin <= t) i = k;
      zetNu((oud) => (oud.v === v && oud.i === i ? oud : { v, i }));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [past, v]);
  return past && nu.v === v ? nu.i : -1;
}

export function BliepoTekst({
  woorden,
  gesproken,
  className = "",
  regelNaZin = false,
}: {
  woorden: React.ReactNode[];
  gesproken?: string | null;
  className?: string;
  /** Elke zin van het blok op een eigen regel (alleen lessen met `vraagBoven`). */
  regelNaZin?: boolean;
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
  /*
    De 2,5 tel gelden per zin: de klok begint opnieuw zodra deze zin aan de beurt is (`gesproken` verandert). Eerst liep
    hij vanaf het begin van het stuk; wachtte de 2e zin langer dan 2,5 tel op de 1e, dan werd hij wit en daarna, als
    Bliepo hem ging zeggen, weer gedimd (F7, gemeten bij de gouden les Minsommen, 10 november 2026).
  */
  const [verlopen, zetVerlopen] = useState<string | null | undefined>(undefined);
  const wacht = verlopen !== gesproken;
  const [gelezen, zetGelezen] = useState<string | null>(null);
  const leest = nu >= 0;
  /*
    Alleen in lessen met de optie "heel uitpraten" (lib/stem.ts praatHeelUit; gouden lessen, 11 november 2026, F7 en
    KEUZES-VOOR-SARA.md Ronde 28b punt 9): werd de zin wit omdat de stem na 2,5 tel nog niet begonnen was (bijvoorbeeld
    omdat de site lang deed over de vraag of Ruth de zin heeft), dan BLIJFT hij wit als Bliepo hem daarna toch zegt. Alleen
    het woord van nu krijgt dan nog de accentkleur; niets wordt meer gedimd. Zonder de optie verandert er niets.
  */
  const [witGebleven, zetWitGebleven] = useState<string | null | undefined>(undefined);
  const bezig = useRef({ leest: false, gelezen: null as string | null });
  useEffect(() => {
    bezig.current = { leest, gelezen };
  }, [leest, gelezen]);
  /*
    Alleen in lessen met de optie woordenMeeMetStem (lib/stem.ts stemOnderweg; 11 november 2026, F10): is de stem na 2,5 tel
    nog onderweg (de Google-stem doet er soms 2 tot 3 tel over, of het bestand van Ruth wordt nog opgehaald), dan blijft
    de zin gedimd en wordt hij woord voor woord wit zodra Bliepo begint. Eerst werd hij dan in 1 keer helemaal wit (per zin
    in plaats van per woord). Zonder de optie is stemOnderweg altijd false: dan verandert er niets.
  */
  useEffect(() => {
    let klok = 0;
    const kijk = () => {
      if (gesproken && !bezig.current.leest && stemOnderweg(gesproken)) {
        klok = window.setTimeout(kijk, 150);
        return;
      }
      zetVerlopen(gesproken);
      if (praatHeelUit() && !bezig.current.leest && bezig.current.gelezen !== gesproken) zetWitGebleven(gesproken);
    };
    klok = window.setTimeout(kijk, 2500);
    return () => window.clearTimeout(klok);
  }, [gesproken]);
  const blijftWit = Boolean(gesproken) && witGebleven === gesproken;
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
    <p
      ref={zin}
      className={`bliepo-tekst ${oplichten ? "bliepo-tekst-meelezen" : ""} ${leest ? "bliepo-tekst-leest" : ""} ${className}`}
      /* Tikt het kind op de zin, dan leest Bliepo hem nog eens voor (27 oktober 2026; groep 3 leest nog niet). */
      onClick={gesproken ? () => zeg(gesproken) : undefined}
      style={gesproken ? { cursor: "pointer" } : undefined}
      title={gesproken ? "Tik om het nog eens te horen" : undefined}
    >
      {woorden.map((w, i) => {
        const soort = blijftWit ? (leest && i === nu ? " bliepo-tekst-gezegd bliepo-tekst-nu" : "") : leest ? (i < nu ? " bliepo-tekst-gezegd" : i === nu ? " bliepo-tekst-gezegd bliepo-tekst-nu" : " bliepo-tekst-nog") : voorStem ? " bliepo-tekst-nog" : "";
        return (
          <Fragment key={i}>
            <span className={`bliepo-tekst-woord${soort}`}>
              {w}
              {i < woorden.length - 1 ? " " : ""}
            </span>
            {regelNaZin && i < woorden.length - 1 && /[.!]$/.test(tekstVan(w)) ? <br /> : null}
          </Fragment>
        );
      })}
    </p>
  );
}

/** De tekst die in een woord (of een woord met kleur) staat. */
function tekstVan(w: unknown): string {
  if (typeof w === "string" || typeof w === "number") return String(w);
  if (Array.isArray(w)) return w.map(tekstVan).join("");
  if (w && typeof w === "object" && "props" in w) return tekstVan((w as { props: { children?: unknown } }).props.children);
  return "";
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
