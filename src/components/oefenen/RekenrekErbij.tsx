"use client";

/**
 * Optellen met het rekenrek (oktober 2026).
 *
 * Hetzelfde rekenrek als bij "Aftrekken met het rekenrek": twee rijen van tien
 * kralen, elke rij vijf rode en vijf witte, in hetzelfde houten frame en met
 * dezelfde kraaltekening (`Kraaltje` uit Figuurtekening). Het rek voor
 * aftrekken (`Rekenrek.tsx`) is niet aangeraakt; dit is een eigen onderdeel
 * met de andere beweging die erbij nodig is.
 *
 * De kralen beginnen rechts; wat links staat, telt mee. Het eerste getal staat
 * er al links. Het kind schuift het tweede getal erbij, in één beweging: een
 * kraal naar links slepen neemt alle kralen links ervan mee. Tikken op een
 * kraal doet hetzelfde. Terugslepen (of tikken op een geschoven kraal) zet de
 * kralen terug. Eerst moet de bovenste rij vol, pas daarna kan het kind op de
 * onderste rij schuiven, en het rek schuift nooit meer dan het tweede getal.
 * De kralen van het tweede getal krijgen een lichte gloed. Er staat geen
 * teller: het kind telt zelf.
 *
 * Na een fout antwoord schuiven de kralen rustig zelf zoals het hoort
 * (stand "kijken").
 */

import { useEffect, useRef, useState } from "react";
import { Kraaltje, Kraalverloop, REKENREK_KLEUREN } from "@/components/oefenen/Figuurtekening";
import { Gegeven, Invulvak } from "@/components/oefenen/Splitsopdracht";
import { Pootjes } from "@/components/oefenen/Pootjes";
import { rekenrekAntwoord, rekenrekZin } from "@/lib/generatoren/rekenrekerbij";
import type { Figuur } from "@/lib/generatoren/soort";

type Fase = "bezig" | "goed" | "fout";
export type Rekenrekfiguur = Extract<Figuur, { soort: "rekenrekerbij" }>;

export function isRekenrekfiguur(figuur: Figuur | null | undefined): figuur is Rekenrekfiguur {
  return !!figuur && figuur.soort === "rekenrekerbij";
}

/* Dezelfde maatvoering als het rekenrek bij aftrekken. */
const MAAT = { straal: 13, afstand: 32, post: 9, balk: 9, binnen: 10, rijhoogte: 52 };
const PER_RIJ = 10;
const PER_KLEUR = 5;
const GAT = 2;
const PLEKKEN = PER_RIJ + GAT;
const SLEEPDREMPEL = 8;

function minderBeweging(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function RekenrekErbij({
  eerste,
  tweede,
  modus,
  onKlaar,
}: {
  eerste: number;
  tweede: number;
  /** schuiven: het kind doet het; kijken: de kralen schuiven zelf; stil: alleen kijken. */
  modus: "schuiven" | "kijken" | "stil";
  onKlaar?: (klaar: boolean) => void;
}) {
  const [rood, wit] = REKENREK_KLEUREN;
  const doel = Math.min(20, eerste + tweede);
  const [links, setLinks] = useState(eerste);
  const [wiebel, setWiebel] = useState(0);
  const start = useRef<{ kraal: number; x: number } | null>(null);

  const klaar = links === doel;
  useEffect(() => onKlaar?.(klaar), [klaar, onKlaar]);

  /* Kijken: kraal voor kraal erbij, met rust ertussen. */
  useEffect(() => {
    if (modus !== "kijken") return;
    const stap = minderBeweging() ? 0 : 550;
    const klokjes: number[] = [];
    for (let n = eerste + 1; n <= doel; n++) {
      klokjes.push(window.setTimeout(() => setLinks(n), 600 + (n - eerste) * stap));
    }
    return () => klokjes.forEach((k) => window.clearTimeout(k));
  }, [modus, eerste, doel]);

  /** Kraal `n` en alles links ervan naar links, binnen de grenzen. */
  function naarLinks(n: number) {
    if (n < links) return;
    /* Eerst de bovenste rij vol. */
    if (n >= PER_RIJ && links < PER_RIJ) {
      setWiebel((w) => w + 1);
      return;
    }
    setLinks(Math.min(n + 1, doel));
  }
  /** Kraal `n` en alles rechts ervan terug, maar nooit het eerste getal. */
  function naarRechts(n: number) {
    if (n >= links || n < eerste) return;
    setLinks(n);
  }

  const binnenBreedte = MAAT.binnen * 2 + (PLEKKEN - 1) * MAAT.afstand + MAAT.straal * 2;
  const breedte = MAAT.post * 2 + binnenBreedte;
  const hoogte = MAAT.balk * 2 + 2 * MAAT.rijhoogte;
  const xVan = (k: number) => MAAT.post + MAAT.binnen + MAAT.straal + k * MAAT.afstand;
  const magSchuiven = modus === "schuiven";

  return (
    <div className="w-full max-w-[34rem] [touch-action:none]">
      <svg
        viewBox={`0 0 ${breedte} ${hoogte}`}
        className="h-auto w-full select-none"
        role={magSchuiven ? "group" : "img"}
        aria-label={`Een rekenrek met ${links} kralen aan de linkerkant.`}
        onPointerUp={(e) => {
          const s = start.current;
          start.current = null;
          if (!s || !magSchuiven) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) < SLEEPDREMPEL) {
            if (s.kraal >= links) naarLinks(s.kraal);
            else naarRechts(s.kraal);
          } else if (dx < 0) naarLinks(s.kraal);
          else naarRechts(s.kraal);
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
      >
        <defs>
          <Kraalverloop id="erbij-rood" kleur={rood} />
          <Kraalverloop id="erbij-wit" kleur={wit} />
        </defs>

        {/* Het houten frame, net als bij Aftrekken met het rekenrek. */}
        <g>
          <rect x={2} y={2} width={breedte - 4} height={hoogte - 4} rx={9} fill="#fdf6ea" />
          <rect x={0} y={0} width={breedte} height={MAAT.balk + 3} rx={5} fill="#d29a55" />
          <rect x={0} y={0} width={breedte} height={4} rx={2} fill="#e5b57c" />
          <rect x={0} y={hoogte - MAAT.balk - 3} width={breedte} height={MAAT.balk + 3} rx={5} fill="#c08a4a" />
          <rect x={0} y={0} width={MAAT.post} height={hoogte} rx={4} fill="#d29a55" />
          <rect x={breedte - MAAT.post} y={0} width={MAAT.post} height={hoogte} rx={4} fill="#c08a4a" />
          <rect x={2} y={2} width={breedte - 4} height={hoogte - 4} rx={9} fill="none" stroke="#a8763b" strokeWidth={1.6} />
        </g>

        {[0, 1].map((rij) => {
          const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
          return (
            <line key={rij} x1={MAAT.post} y1={y} x2={breedte - MAAT.post} y2={y} stroke="#b3aa9c" strokeWidth={3.5} strokeLinecap="round" />
          );
        })}

        {Array.from({ length: 2 * PER_RIJ }, (_, n) => {
          const rij = Math.floor(n / PER_RIJ);
          const kolom = n % PER_RIJ;
          const telt = n < links;
          const x = xVan(telt ? kolom : kolom + GAT);
          const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
          const kleur = kolom < PER_KLEUR ? rood : wit;
          const gloed = telt && n >= eerste;
          const tikbaar = magSchuiven && (n >= links ? !(n >= PER_RIJ && links < PER_RIJ) && links < doel : n >= eerste);
          return (
            <g
              key={n}
              transform={`translate(${x} ${y})`}
              className={`[transition:transform_350ms_ease-in-out] ${magSchuiven ? "cursor-pointer" : ""}`}
              role={magSchuiven ? "button" : undefined}
              tabIndex={tikbaar ? 0 : undefined}
              aria-label={magSchuiven ? (telt ? "Kraal terugschuiven" : "Kraal naar links schuiven") : undefined}
              onPointerDown={
                magSchuiven
                  ? (e) => {
                      e.preventDefault();
                      (e.currentTarget.ownerSVGElement as SVGSVGElement | null)?.setPointerCapture(e.pointerId);
                      start.current = { kraal: n, x: e.clientX };
                    }
                  : undefined
              }
              onKeyDown={
                magSchuiven
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (n >= links) naarLinks(n);
                        else naarRechts(n);
                      }
                    }
                  : undefined
              }
            >
              {/* De lichte gloed om de kralen van het tweede getal. */}
              {gloed && <circle r={MAAT.straal + 5} fill="var(--color-geel)" opacity={0.45} />}
              {/* Te vroeg op de onderste rij: die kralen wiebelen even. */}
              <g
                key={rij === 1 && n >= links ? wiebel : 0}
                className={rij === 1 && wiebel > 0 && n >= links ? "motion-safe:animate-bolletje-stuiter" : ""}
              >
                <Kraaltje straal={MAAT.straal} kleur={kleur} verloopId={kleur === rood ? "erbij-rood" : "erbij-wit"} />
              </g>
              {/* Ruim tikvlak, ook met een vinger op een tablet. */}
              {magSchuiven && <circle r={MAAT.straal + 6} fill="transparent" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Het opgeslagen antwoord terug naar één tekst per vakje. */
function uitAntwoord(antwoord: string, hoeveel: number): string[] {
  const delen = antwoord === "" ? [] : antwoord.split(",");
  return Array.from({ length: hoeveel }, (_, i) => delen[i] ?? "");
}

/**
 * De opdracht: de som bovenaan, het rekenrek eronder (om en om), en na het
 * nakijken de zin in gewone taal.
 */
export function RekenrekErbijOpdracht({
  figuur,
  antwoord,
  fase,
  metCursor = false,
  onWijzig,
  onBevestig,
  onKlaar,
}: {
  figuur: Rekenrekfiguur;
  antwoord: string;
  fase: Fase;
  metCursor?: boolean;
  onWijzig: (waarde: string) => void;
  onBevestig: () => void;
  /** Na een goed antwoord: de zin heeft even gestaan, het feest mag komen. */
  onKlaar?: () => void;
}) {
  const uit = fase !== "bezig";
  const { stand, eerste, tweede } = figuur;
  const juist = rekenrekAntwoord(stand, eerste, tweede);
  const [getypt, setGetypt] = useState<string[]>(() => uitAntwoord(antwoord, juist.length));
  const [geschoven, setGeschoven] = useState(false);
  const velden = useRef<(HTMLInputElement | null)[]>([]);
  const geblokkeerd = !!figuur.rekenrek && !geschoven;

  /* Zonder rekenrek: de cursor meteen in het eerste vakje. Met: zodra alles geschoven is. */
  useEffect(() => {
    if (metCursor && fase === "bezig" && !figuur.rekenrek) velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metCursor]);
  useEffect(() => {
    if (geschoven && metCursor && fase === "bezig") velden.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geschoven]);

  /* Na een goed antwoord blijft de zin even staan; daarna het feest. */
  useEffect(() => {
    if (fase !== "goed" || !figuur.hulpBijFout) return;
    const klokje = window.setTimeout(() => onKlaar?.(), 2400);
    return () => window.clearTimeout(klokje);
  }, [fase, figuur.hulpBijFout, onKlaar]);

  const uitslag = (i: number): "goed" | "fout" | null =>
    !uit ? null : Number(getypt[i]) === juist[i] && getypt[i] !== "" ? "goed" : "fout";

  function typ(i: number, tekst: string) {
    if (uit) return;
    const nieuw = [...getypt];
    nieuw[i] = tekst;
    setGetypt(nieuw);
    onWijzig(nieuw.every((w) => w !== "") ? nieuw.join(",") : "");
    /*
      Is het vakje vol, dan springt de cursor door naar het volgende lege. Een
      pootje is altijd één cijfer, dus daar meteen.
    */
    const pootje = stand === "pootjes" && i < 2;
    /* Het linker pootje: pas door als het samen met het eerste getal 10 is. */
    if (pootje && i === 0 && Number(tekst) !== 10 - eerste) return;
    if (!metCursor || tekst === "" || (!pootje && Number(tekst) * 10 <= Math.max(20, juist[i]))) return;
    const volgende = nieuw.findIndex((w, j) => j > i && w === "");
    if (volgende >= 0) velden.current[volgende]?.focus();
  }

  const vak = (i: number, label: string, maat: "gewoon" | "klein" = "gewoon") => (
    <Invulvak
      waarde={getypt[i] ?? ""}
      uitslag={uitslag(i)}
      maat={maat}
      label={label}
      uit={uit || geblokkeerd}
      veldRef={(el) => {
        velden.current[i] = el;
      }}
      onTyp={(t) => typ(i, t)}
      onBevestig={onBevestig}
      onVolgende={() => velden.current[i + 1]?.focus()}
    />
  );

  const teken = (t: string) => <span className="text-2xl font-extrabold text-inkt-zacht">{t}</span>;
  const som =
    stand === "pootjes" ? (
      <Pootjes
        eerste={eerste}
        tweede={tweede}
        links={vak(0, "Hoeveel tot 10?", "klein")}
        rechts={vak(1, "Hoeveel daarna nog?", "klein")}
        uitkomst={vak(2, "De uitkomst")}
        waarden={getypt}
        fase={fase}
      />
    ) : stand === "aanvullen" && figuur.omgekeerd ? (
      /* Andersom: 10 = 7 + ▢. Het rekenrek werkt hetzelfde. */
      <div className="flex items-center justify-center gap-3">
        <Gegeven waarde={eerste + tweede} />
        {teken("=")}
        <Gegeven waarde={eerste} />
        {teken("+")}
        {vak(0, "Hoeveel erbij?")}
      </div>
    ) : stand === "aanvullen" ? (
      <div className="flex items-center justify-center gap-3">
        <Gegeven waarde={eerste} />
        {teken("+")}
        {vak(0, "Hoeveel erbij?")}
        {teken("=")}
        <Gegeven waarde={eerste + tweede} />
      </div>
    ) : (
      <div className="flex items-center justify-center gap-3">
        <Gegeven waarde={eerste} />
        {teken("+")}
        <Gegeven waarde={tweede} />
        {teken("=")}
        {vak(0, "De uitkomst")}
      </div>
    );

  const zin = rekenrekZin(stand, eerste, tweede);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {som}
      {figuur.rekenrek && fase !== "fout" && (
        <RekenrekErbij eerste={eerste} tweede={tweede} modus={uit ? "stil" : "schuiven"} onKlaar={setGeschoven} />
      )}
      {fase === "goed" && figuur.hulpBijFout && (
        <p className="rounded-2xl bg-groen-zacht px-4 py-3 text-center text-xl font-extrabold text-groen-diep">Goed zo! {zin}</p>
      )}
      {fase === "fout" && figuur.hulpBijFout && (
        <>
          <RekenrekErbij key="uitleg" eerste={eerste} tweede={tweede} modus="kijken" />
          <p className="rounded-2xl bg-lucht-zacht px-4 py-3 text-center text-lg font-extrabold text-lucht">{zin}</p>
        </>
      )}
    </div>
  );
}
