"use client";

/**
 * Het rekenrek: twee staafjes met tien kralen, vijf rode en vijf witte.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit onderdeel er is
 * ---------------------------------------------------------------------------
 * Het rekenrek is op school hét model voor erbij en eraf. Een kind zet er
 * dertien kralen op, schuift er vijf weg en ziet dat er acht overblijven. Dat
 * zien gaat vooraf aan het kale rekenen.
 *
 * Het staat los van één domein, zodat elk volgend domein — eraf, erbij,
 * verdubbelen — hetzelfde rek kan gebruiken. Kralen tellen heeft hier niets
 * mee te maken: dat tekent zijn eigen kralenrij en is onveranderd. Alleen de
 * tekening van één kraal komt uit dezelfde bron, zodat een kraal er overal
 * hetzelfde uitziet.
 *
 * ---------------------------------------------------------------------------
 * Hoe de kralen staan
 * ---------------------------------------------------------------------------
 * De bovenste rij wordt altijd eerst gevuld tot tien, de rest komt op de
 * onderste rij: vijftien is tien boven en vijf onder. Kralen die meedoen staan
 * links tegen elkaar, kralen die eraf zijn staan rechts. De kralen die niet
 * bij de som horen staan lichtjes op de achtergrond mee, want een rekenrek
 * heeft nu eenmaal altijd twintig kralen.
 *
 * ---------------------------------------------------------------------------
 * Vier standen
 * ---------------------------------------------------------------------------
 *   stil          alleen kijken; er beweegt niets.
 *   wegschuiven   het kind doet het zelf. Er gaat altijd de láátste kraal weg:
 *                 eerst de onderste rij van rechts naar links, daarna de
 *                 bovenste. Tikken op een weggeschoven kraal zet de laatste
 *                 weer terug. Slepen over de kralen werkt ook.
 *   flitsen       het rek staat er een paar tellen en gaat dan onder een
 *                 kaart. Hoelang dat duurt komt uit de instellingen.
 *   kijken        het rek speelt de som zelf af, kraal voor kraal. Voor de
 *                 uitleg bij een fout antwoord.
 *
 * Bij wegschuiven en kijken hoort hetzelfde bordje als bij Wegstrepen: "7
 * eraf" met rondjes eronder die meelopen. De rondjes staan in groepjes die bij
 * de rijen passen, zodat een kind ziet dat er eerst vijf van de onderste rij
 * af gaan en dan nog twee van de bovenste.
 *
 * En er is het moment bij de tien: blijven er precies tien kralen over en is
 * de onderste rij leeg, dan licht de bovenste rij één seconde zacht op. Dat is
 * het ankerpunt waar alles in groep 4 om draait.
 */

import { useEffect, useRef, useState } from "react";
import {
  Kraaltje,
  Kraalverloop,
  REKENREK_KLEUREN,
} from "@/components/oefenen/Figuurtekening";
import { Erafbordje } from "@/components/oefenen/Erafbordje";

/** Maatvoering, op één plek zodat alles meeschaalt. */
const MAAT = {
  straal: 13,
  afstand: 32,
  post: 9,
  balk: 9,
  binnen: 10,
  rijhoogte: 52,
};

const PER_RIJ = 10;
const PER_KLEUR = 5;
const RIJEN = 2;

/** Hoeveel kralen er op het hele rek zitten: altijd twintig. */
export const REKENREK_KRALEN = PER_RIJ * RIJEN;

/** Hoelang de kaart bij het flitsen op zich laat wachten, als niets is ingesteld. */
export const FLITS_SECONDEN = 2;

export type Rekenrekmodus = "stil" | "wegschuiven" | "flitsen" | "kijken";

/**
 * Hoe de rondjes onder het bordje in groepjes vallen.
 *
 * Eerst zoveel rondjes als er kralen op de onderste rij staan, dan de rest.
 * Past alles op de onderste rij, dan blijft het bij één groepje. Zo laat de
 * teller dezelfde weg zien als de kralen: eerst de onderste rij leeg, daarna
 * pas aan de bovenste beginnen.
 */
export function rondjesgroepen(aantal: number, eraf: number): number[] {
  const onder = Math.max(0, aantal - PER_RIJ);
  const eerste = Math.min(eraf, onder);
  const rest = eraf - eerste;
  if (eerste === 0) return rest > 0 ? [rest] : [];
  return rest > 0 ? [eerste, rest] : [eerste];
}

export function Rekenrek({
  aantal,
  eraf = 0,
  modus = "stil",
  vast,
  seconden = FLITS_SECONDEN,
  toonBordje = true,
  onWeg,
  onKlaar,
}: {
  /** Hoeveel kralen er meedoen; de rest staat lichter op de achtergrond. */
  aantal: number;
  /** Hoeveel er weg moeten. Voor het bordje en voor de stand "kijken". */
  eraf?: number;
  modus?: Rekenrekmodus;
  /**
   * Hoeveel kralen er weg zijn, van buitenaf gezet.
   *
   * Voor de uitleg: daar bepaalt de stap van het verhaal hoe het rek erbij
   * staat, en niet het rek zelf. Zonder deze waarde houdt het rek zijn eigen
   * stand bij, zoals bij het wegschuiven.
   */
  vast?: number;
  /** Na hoeveel tellen de kaart komt bij het flitsen; komt uit de database. */
  seconden?: number;
  /** Hoort er een bordje met rondjes bij? Uit als alleen het rek nodig is. */
  toonBordje?: boolean;
  /** Elke keer dat er een kraal bij of af gaat: hoeveel er nu weg zijn. */
  onWeg?: (weg: number) => void;
  /** Bij "kijken": de som is afgespeeld. */
  onKlaar?: () => void;
}) {
  const [rood, wit] = REKENREK_KLEUREN;
  const inSpel = Math.max(0, Math.min(REKENREK_KRALEN, Math.round(aantal)));

  /** Hoeveel kralen er weg zijn. Altijd de laatste, dus één getal is genoeg. */
  const [eigenWeg, setWeg] = useState(0);
  const weg = vast === undefined ? eigenWeg : Math.max(0, Math.min(inSpel, vast));
  /** De rondjes lichten even oranje op als er eentje te veel weg is. */
  const [knipper, setKnipper] = useState(false);
  /** Het moment bij de tien: de bovenste rij licht één seconde op. */
  const [tien, setTien] = useState(false);
  /** Bij het flitsen: ligt de kaart er al overheen? */
  const [bedekt, setBedekt] = useState(false);

  /*
    Een nieuwe som begint weer met alle kralen links.

    De vorige som staat in een ref, zodat er bij het eerste keer tekenen niets
    hoeft te worden teruggezet: dat staat al goed. Pas als er echt een andere
    som in beeld komt, gaat het rek weer op nul.
  */
  const vorigeSom = useRef(`${aantal}:${eraf}:${modus}`);
  useEffect(() => {
    const nu = `${aantal}:${eraf}:${modus}`;
    if (vorigeSom.current === nu) return;
    vorigeSom.current = nu;
    setWeg(0);
    setBedekt(false);
    setTien(false);
  }, [aantal, eraf, modus]);

  /* De kaart bij het flitsen. */
  useEffect(() => {
    if (modus !== "flitsen") return;
    const klokje = window.setTimeout(() => setBedekt(true), Math.max(0, seconden) * 1000);
    return () => window.clearTimeout(klokje);
  }, [modus, seconden, aantal]);

  /*
    De stand "kijken": kraal voor kraal, met rust ertussen. De klokjes worden
    bij het opruimen gestopt en opnieuw gezet; geen "al gedaan"-vlag, want in
    ontwikkeling draait elk effect twee keer en dan zou er niets gebeuren.
  */
  useEffect(() => {
    if (modus !== "kijken" || eraf <= 0) return;
    const klokjes: number[] = [];
    for (let i = 1; i <= eraf; i++) {
      klokjes.push(window.setTimeout(() => setWeg(i), 700 + i * 700));
    }
    klokjes.push(window.setTimeout(() => onKlaar?.(), 900 + eraf * 700));
    return () => klokjes.forEach((k) => window.clearTimeout(k));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modus, eraf, aantal]);

  /* Het moment bij de tien: alleen als het er door wegschuiven tien wórden. */
  const vorigeRest = useRef(inSpel);
  useEffect(() => {
    const rest = inSpel - weg;
    const was = vorigeRest.current;
    vorigeRest.current = rest;
    if (rest !== 10 || was <= 10) return;
    setTien(true);
    const klokje = window.setTimeout(() => setTien(false), 1000);
    return () => window.clearTimeout(klokje);
  }, [inSpel, weg]);

  /* Slepen: zolang de vinger neer is telt elke kraal die hij raakt mee. */
  const slepend = useRef(false);
  const laatste = useRef(-1);

  function verzet(nummer: number) {
    if (modus !== "wegschuiven") return;
    if (laatste.current === nummer) return;
    laatste.current = nummer;

    setWeg((eerder) => {
      const rest = inSpel - eerder;
      /* Een kraal die meedoet aantikken: de laatste gaat eraf. */
      const nieuw = nummer < rest ? Math.min(eerder + 1, inSpel) : Math.max(eerder - 1, 0);
      if (nieuw !== eerder) {
        onWeg?.(nieuw);
        if (nieuw > eraf && eraf > 0) {
          setKnipper(true);
          window.setTimeout(() => setKnipper(false), 600);
        }
      }
      return nieuw;
    });
  }

  const binnenBreedte = MAAT.binnen * 2 + (PER_RIJ - 1) * MAAT.afstand + MAAT.straal * 2;
  const breedte = MAAT.post * 2 + binnenBreedte;
  const hoogte = MAAT.balk * 2 + RIJEN * MAAT.rijhoogte;

  /** De x van plek `k` op een staafje, geteld vanaf links. */
  const xVan = (k: number) => MAAT.post + MAAT.binnen + MAAT.straal + k * MAAT.afstand;

  /**
   * Waar elke kraal nu staat.
   *
   * Per staafje schuiven de kralen die meedoen naar links aan elkaar, en de
   * kralen die eraf zijn naar rechts. Ze houden hun eigen kleur en hun eigen
   * volgorde, dus de vijf rode en vijf witte blijven herkenbaar.
   */
  const rest = inSpel - weg;
  const plekken: { x: number; y: number; staat: "blijft" | "weg" | "buiten" }[] = [];
  for (let rij = 0; rij < RIJEN; rij++) {
    const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
    let linksGeteld = 0;
    let rechtsGeteld = 0;
    for (let kolom = 0; kolom < PER_RIJ; kolom++) {
      const nummer = rij * PER_RIJ + kolom;
      const staat = nummer < rest ? "blijft" : nummer < inSpel ? "weg" : "buiten";
      const x = staat === "blijft" ? xVan(linksGeteld++) : xVan(PER_RIJ - 1 - rechtsGeteld++);
      plekken.push({ x, y, staat });
    }
  }

  const rekenrek = (
    <svg
      viewBox={`0 0 ${breedte} ${hoogte}`}
      className="h-auto w-full"
      role={modus === "wegschuiven" ? "group" : "img"}
      aria-label={`Een rekenrek met ${rest} kralen aan de linkerkant.`}
      onPointerDown={() => {
        slepend.current = true;
        laatste.current = -1;
      }}
      onPointerUp={() => {
        slepend.current = false;
        laatste.current = -1;
      }}
      onPointerLeave={() => {
        slepend.current = false;
        laatste.current = -1;
      }}
    >
      <defs>
        <Kraalverloop id="rekenrek-rood" kleur={rood} />
        <Kraalverloop id="rekenrek-wit" kleur={wit} />
      </defs>

      {/* Het houten frame, net als bij Kralen tellen. */}
      <g>
        <rect x={2} y={2} width={breedte - 4} height={hoogte - 4} rx={9} fill="#fdf6ea" />
        <rect x={0} y={0} width={breedte} height={MAAT.balk + 3} rx={5} fill="#d29a55" />
        <rect x={0} y={0} width={breedte} height={4} rx={2} fill="#e5b57c" />
        <rect
          x={0}
          y={hoogte - MAAT.balk - 3}
          width={breedte}
          height={MAAT.balk + 3}
          rx={5}
          fill="#c08a4a"
        />
        <rect x={0} y={0} width={MAAT.post} height={hoogte} rx={4} fill="#d29a55" />
        <rect
          x={breedte - MAAT.post}
          y={0}
          width={MAAT.post}
          height={hoogte}
          rx={4}
          fill="#c08a4a"
        />
        <rect
          x={2}
          y={2}
          width={breedte - 4}
          height={hoogte - 4}
          rx={9}
          fill="none"
          stroke="#a8763b"
          strokeWidth={1.6}
        />
      </g>

      {/*
        Het moment bij de tien: de bovenste rij licht zacht op in de
        huisstijlkleur. Eén seconde, en daarna is het weer rustig.
      */}
      {tien && (
        <rect
          x={MAAT.post}
          y={MAAT.balk}
          width={breedte - MAAT.post * 2}
          height={MAAT.rijhoogte}
          rx={8}
          fill="var(--color-huisstijl)"
          opacity={0}
          className="motion-safe:animate-tien-moment"
        />
      )}

      {/* De twee staafjes. */}
      {Array.from({ length: RIJEN }, (_, rij) => {
        const y = MAAT.balk + rij * MAAT.rijhoogte + MAAT.rijhoogte / 2;
        return (
          <line
            key={rij}
            x1={MAAT.post}
            y1={y}
            x2={breedte - MAAT.post}
            y2={y}
            stroke="#b3aa9c"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        );
      })}

      {plekken.map((plek, nummer) => {
        const kleur = nummer % PER_RIJ < PER_KLEUR ? rood : wit;
        const verloopId = kleur === rood ? "rekenrek-rood" : "rekenrek-wit";
        const magTikken = modus === "wegschuiven" && plek.staat !== "buiten";
        return (
          <g
            key={nummer}
            transform={`translate(${plek.x} ${plek.y})`}
            /* Weggeschoven: grijs en half doorzichtig, zoals overal bij eraf. */
            className={`[transition:transform_350ms_ease-in-out] ${
              plek.staat === "weg" ? "opacity-45 grayscale" : ""
            } ${magTikken ? "cursor-pointer" : ""}`}
            role={magTikken ? "button" : undefined}
            tabIndex={magTikken ? 0 : undefined}
            aria-label={magTikken ? `Kraal ${nummer + 1}` : undefined}
            aria-pressed={magTikken ? plek.staat === "weg" : undefined}
            onPointerDown={magTikken ? () => verzet(nummer) : undefined}
            onPointerEnter={
              magTikken
                ? () => {
                    if (slepend.current) verzet(nummer);
                  }
                : undefined
            }
            onKeyDown={
              magTikken
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      laatste.current = -1;
                      verzet(nummer);
                    }
                  }
                : undefined
            }
          >
            <Kraaltje
              straal={MAAT.straal}
              kleur={kleur}
              verloopId={verloopId}
              dof={plek.staat === "buiten"}
            />
            {/* Ruim tikvlak, ook op een tablet met dikke vingers. */}
            {magTikken && <circle cx={0} cy={0} r={MAAT.straal + 6} fill="transparent" />}
          </g>
        );
      })}
    </svg>
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {toonBordje && eraf > 0 && (
        <Erafbordje
          aantal={eraf}
          gevuld={Math.min(weg, eraf)}
          teveel={weg > eraf && knipper}
          groepen={rondjesgroepen(inSpel, eraf)}
        />
      )}

      <div className="relative w-full [touch-action:none]">
        {rekenrek}
        {/* De kaart bij het flitsen: het rek is weg, het beeld blijft in je hoofd. */}
        {bedekt && (
          <div
            className="absolute inset-0 grid place-items-center rounded-2xl bg-huisstijl text-5xl font-extrabold text-white shadow-op"
            aria-label="Het rekenrek is afgedekt."
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
}
