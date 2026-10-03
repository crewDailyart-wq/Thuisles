"use client";

/**
 * De wijzerklok.
 *
 * Eén tekening voor het hele domein Tijd: aflezen, kiezen uit vier klokken, de
 * wijzers zelf zetten, en de klok met een vlek erop. Alles in SVG, zodat hij op
 * elk scherm scherp blijft en netjes meeschaalt.
 *
 * ---------------------------------------------------------------------------
 * Hoe de wijzers staan
 * ---------------------------------------------------------------------------
 * De kleine wijzer schuift mee met de minuten. Om half drie staat hij dus
 * tussen de 2 en de 3 in, en niet óp de 2 — juist daaraan leest een kind af of
 * het half drie of half vier is. De hoeken komen uit `wijzerhoeken` in
 * `@/lib/tijd`, zodat de klok, de vraag en de uitleg nooit uit de pas lopen.
 *
 * ---------------------------------------------------------------------------
 * Uitlijnen
 * ---------------------------------------------------------------------------
 * Alles hangt aan het middelpunt (100, 100) en wordt gedraaid; er wordt niets
 * met de hand uitgerekend en nergens een streepje "ongeveer" neergezet. De
 * cijfers staan op een vaste straal, gecentreerd op hun eigen punt met
 * `text-anchor` en `dominant-baseline` — dan staat de 12 precies boven het
 * midden en de 6 precies eronder, ook als het lettertype iets anders is.
 * De streepjes lopen van de rand naar binnen en raken de cijfers niet.
 *
 * De klok is altijd vierkant en schaalt met zijn vak mee, dus hij kan nooit
 * over iets anders heen vallen.
 */

import { useRef, useState } from "react";
import { minuutBijHoek, uurBijHoek, wijzerhoeken, type Tijd } from "@/lib/tijd";
import { opgavegeluidStaatAan, plop } from "@/lib/geluid";

const MIDDEN = 100;
const RAND = 92;

/*
  Alle klokken zien er hetzelfde uit, op verzoek van de eigenaar: de grote
  wijzer komt tot bij de streepjes (die beginnen op straal 76), zodat je ziet
  bij welk streepje hij staat, en de kleine wijzer is duidelijk korter en
  dikker. De grote wijzer loopt daarbij over de cijfers; dat is bewust.
*/
const MINUUTWIJZER = 74;
const UURWIJZER = 38;

/*
  Afgerond op twee decimalen. De server en de browser rekenen cos en sin net
  iets anders uit in de laatste decimaal; zonder afronden klaagt React dat de
  tekening van de server niet overeenkomt met die in de browser.
*/
const rond = (n: number) => Math.round(n * 100) / 100;

/** De punten van een streepje op de rand, in graden vanaf twaalf uur. */
function streepje(graden: number, lengte: number) {
  const hoek = ((graden - 90) * Math.PI) / 180;
  const buiten = RAND - 4;
  const binnen = buiten - lengte;
  return {
    x1: rond(MIDDEN + Math.cos(hoek) * buiten),
    y1: rond(MIDDEN + Math.sin(hoek) * buiten),
    x2: rond(MIDDEN + Math.cos(hoek) * binnen),
    y2: rond(MIDDEN + Math.sin(hoek) * binnen),
  };
}

/** Waar een cijfer staat: op een vaste straal, gecentreerd op zijn eigen punt. */
function cijferplek(uur: number) {
  const hoek = ((uur * 30 - 90) * Math.PI) / 180;
  return { x: rond(MIDDEN + Math.cos(hoek) * 66), y: rond(MIDDEN + Math.sin(hoek) * 66) };
}

/** Een vlek op de klok: waar hij ligt, hoe groot en welke kleur. */
export type Vlek = {
  /** Waar het midden van de vlek ligt, in graden vanaf twaalf uur. */
  hoek: number;
  /** Hoe ver van het midden van de klok, 0 is het middelpunt en 1 de rand. */
  afstand: number;
  /** Hoe groot, als deel van de straal (dwars op de straal). */
  grootte: number;
  kleur: string;
  /**
   * Hoe diep de vlek is, langs de straal, als deel van de straal. Leeg =
   * gelijk aan `grootte`: dan is hij ongeveer rond. Een grote vlek over drie
   * cijfers is breder dan diep, zodat hij het midden vrijlaat.
   */
  diepte?: number;
  /** Voor de vorm: elke opgave een net iets andere inktvlek. */
  zaad?: number;
  /** Een kleine extra draaiing, in graden. */
  draai?: number;
  /** Onder of boven de wijzers; zie de tekenvolgorde in `Klok`. */
  laag?: "onder-wijzers" | "boven-wijzers";
};

/** Een klein, vast toevalsgetal uit een zaad: dezelfde vlek ziet er altijd hetzelfde uit. */
function vlekkans(zaad: number): () => number {
  let a = (zaad >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * De vlekvorm: een echte inktvlek.
 *
 * Een onregelmatige vorm met ronde uitstulpingen en een paar losse spetters
 * ernaast, helemaal ondoorzichtig. De binnenkant komt nooit dichter bij het
 * midden van de vlek dan 88 procent van zijn maat, zodat hij altijd afdekt wat
 * hij moet afdekken. Vorm en draaiing volgen uit het zaad; een oude vlek zonder
 * zaad wordt het oude, simpele rondje met deuken.
 */
function Vlekvorm({ vlek }: { vlek: Vlek }) {
  const hoek = ((vlek.hoek - 90) * Math.PI) / 180;
  const x = MIDDEN + Math.cos(hoek) * RAND * vlek.afstand;
  const y = MIDDEN + Math.sin(hoek) * RAND * vlek.afstand;
  const r = RAND * vlek.grootte;

  if (vlek.zaad === undefined) {
    /* Zes punten op een rondje, om en om iets dichterbij: dat geeft een vlek. */
    const punten = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const straal = r * (i % 2 === 0 ? 1 : 0.82);
      return `${rond(x + Math.cos(a) * straal)},${rond(y + Math.sin(a) * straal)}`;
    });
    return <polygon points={punten.join(" ")} fill={vlek.kleur} />;
  }

  const kans = vlekkans(vlek.zaad);
  const rx = r;
  const ry = RAND * (vlek.diepte ?? vlek.grootte);
  /* De vorm ligt plat langs de rand: breed dwars op de straal, diep langs de straal. */
  const stand = vlek.hoek + (vlek.draai ?? 0);

  /* Elf punten rondom, elk op een iets andere afstand; daartussen ronde bochten. */
  const n = 11;
  const punten = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + kans() * 0.25;
    const f = 0.88 + kans() * 0.28;
    return { px: Math.cos(a) * rx * f, py: Math.sin(a) * ry * f };
  });
  const midden = (p: { px: number; py: number }, q: { px: number; py: number }) => ({
    px: (p.px + q.px) / 2,
    py: (p.py + q.py) / 2,
  });
  const start = midden(punten[n - 1], punten[0]);
  let pad = `M ${rond(start.px)} ${rond(start.py)}`;
  for (let i = 0; i < n; i++) {
    const p = punten[i];
    const m = midden(p, punten[(i + 1) % n]);
    /* Een beetje naar buiten getrokken: dat geeft de ronde bobbels van een inktvlek. */
    pad += ` Q ${rond(p.px * 1.12)} ${rond(p.py * 1.12)} ${rond(m.px)} ${rond(m.py)}`;
  }
  pad += " Z";

  /* Drie kleine spetters er net naast. */
  const spetters = Array.from({ length: 3 }, () => {
    const a = kans() * Math.PI * 2;
    const af = 1.12 + kans() * 0.16;
    return {
      cx: rond(Math.cos(a) * rx * af),
      cy: rond(Math.sin(a) * ry * af),
      r: rond(Math.max(1.6, Math.min(rx, ry) * (0.08 + kans() * 0.08))),
    };
  });

  return (
    <g transform={`translate(${rond(x)} ${rond(y)}) rotate(${rond(stand)})`} fill={vlek.kleur}>
      <path d={pad} />
      {spetters.map((sp, i) => (
        <circle key={i} cx={sp.cx} cy={sp.cy} r={sp.r} />
      ))}
    </g>
  );
}

/**
 * Dezelfde oranje inktvlek, los van de klok: voor "Wat zit er onder de vlek?"
 * bij Optellen en Aftrekken. Vorm en draaiing volgen uit het zaad, zodat de
 * vlek per opgave een beetje anders is maar bij opnieuw tekenen gelijk blijft.
 */
export function Inktvlek({ zaad, className = "" }: { zaad: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" overflow="visible" aria-hidden="true" className={className}>
      <Vlekvorm
        vlek={{ hoek: 0, afstand: 0, grootte: 0.78, diepte: 0.62, kleur: "var(--color-huisstijl)", zaad, draai: (zaad % 21) - 10 }}
      />
    </svg>
  );
}

/**
 * Het grijpgebied van een wijzer: onzichtbaar, maar veel breder dan de wijzer
 * zelf (22 in de tekening, op een klok van 224 pixels ruim een vingertop
 * breed) en tot net voorbij het uiteinde. Zo pakt een kindervinger de wijzer
 * makkelijk, terwijl de klok eruitziet als een gewone klok.
 */
function Grijpgebied({
  van,
  tot,
  sleept,
  onPak,
}: {
  van: number;
  tot: number;
  sleept: boolean;
  onPak: (e: React.PointerEvent) => void;
}) {
  return (
    <line
      x1={MIDDEN}
      y1={MIDDEN - van}
      x2={MIDDEN}
      y2={MIDDEN - tot}
      stroke="transparent"
      strokeWidth={22}
      strokeLinecap="round"
      onPointerDown={onPak}
      style={{ cursor: sleept ? "grabbing" : "grab" }}
    />
  );
}

export function Klok({
  tijd,
  maat = "gewoon",
  vlek = null,
  /** Welke wijzer oplicht; voor "Tik op de wijzer van de uren". */
  nadruk = null,
  /** Mag het kind de wijzers zelf verslepen? */
  zetbaar = false,
  /** Hoe fijn de grote wijzer mag staan: 60 = alleen hele uren, 5 = vijf minuten. */
  stap = 5,
  onZet,
}: {
  tijd: Tijd;
  maat?: "klein" | "middel" | "gewoon" | "groot";
  vlek?: Vlek | null;
  nadruk?: "uur" | "minuut" | null;
  zetbaar?: boolean;
  stap?: number;
  onZet?: (tijd: Tijd) => void;
}) {
  const hoeken = wijzerhoeken(tijd);
  const vak = useRef<SVGSVGElement | null>(null);
  const [sleept, setSleept] = useState<"uur" | "minuut" | null>(null);

  const grootte =
    maat === "klein"
      ? "size-24"
      : maat === "middel"
        ? "size-32 sm:size-36"
        : maat === "groot"
          ? "size-56 sm:size-64"
          : "size-40 sm:size-48";

  /** De hoek van de muis of vinger ten opzichte van het midden van de klok. */
  function hoekVanPunt(x: number, y: number): number | null {
    const kader = vak.current?.getBoundingClientRect();
    if (!kader) return null;
    const dx = x - (kader.left + kader.width / 2);
    const dy = y - (kader.top + kader.height / 2);
    /* Vanaf twaalf uur met de klok mee, net als `wijzerhoeken`. */
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  }

  /*
    De stand tijdens het slepen. Een ref en geen state, zodat elke beweging de
    vorige stand meteen kent — ook als er twee bewegingen komen voordat React
    opnieuw getekend heeft.
  */
  const stand = useRef<Tijd>(tijd);
  /** Wanneer de laatste plop klonk. */
  const laatstePlop = useRef(0);

  /*
    Een plop bij elk streepje en elk uur: hetzelfde geluid als bij de vos op de
    getallenlijn. Bij heel snel slepen hoogstens één per 40 milliseconden,
    anders gaat het kraken. Staat het geluid uit, dan geen plop.
  */
  function plopBijStap() {
    const nu = performance.now();
    if (nu - laatstePlop.current < 40) return;
    laatstePlop.current = nu;
    if (opgavegeluidStaatAan()) plop();
  }

  function verplaats(e: React.PointerEvent, welke: "uur" | "minuut") {
    if (!zetbaar || !onZet) return;
    const hoek = hoekVanPunt(e.clientX, e.clientY);
    if (hoek === null) return;
    const nu = stand.current;

    if (welke === "minuut") {
      const minuut = minuutBijHoek(hoek, stap);
      /*
        Zoals bij een echte klok draait de kleine wijzer mee: gaat de grote
        wijzer over de twaalf heen, dan schuift het uur een stap op (of terug).
        Bij half zeven staat de kleine wijzer daardoor vanzelf tussen 6 en 7.
      */
      let uur = nu.uur;
      if (nu.minuut >= 45 && minuut < 15) uur += 1;
      else if (nu.minuut < 15 && minuut >= 45) uur -= 1;
      const nieuw = { uur: ((uur % 12) + 12) % 12, minuut };
      if (nieuw.uur === nu.uur && nieuw.minuut === nu.minuut) return;
      stand.current = nieuw;
      plopBijStap();
      onZet(nieuw);
    } else {
      /* De kleine wijzer springt per heel uur; de minuten blijven staan. */
      const nieuw = { uur: uurBijHoek(hoek), minuut: nu.minuut };
      if (nieuw.uur === nu.uur % 12) return;
      stand.current = nieuw;
      plopBijStap();
      onZet(nieuw);
    }
  }

  /*
    Beginnen met slepen. `preventDefault` houdt de browser tegen die anders de
    hele klok als plaatje meesleept of de cijfers als tekst selecteert, en met
    pointer capture blijft de wijzer de vinger volgen, ook buiten de klok.
  */
  function pak(e: React.PointerEvent, welke: "uur" | "minuut") {
    if (!zetbaar) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      vak.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Zonder capture werkt slepen binnen de klok gewoon nog. */
    }
    stand.current = tijd;
    setSleept(welke);
  }

  function los(e: React.PointerEvent) {
    try {
      if (vak.current?.hasPointerCapture(e.pointerId)) vak.current.releasePointerCapture(e.pointerId);
    } catch {
      /* Niets vast, niets los te laten. */
    }
    setSleept(null);
  }

  const kleurUur = nadruk === "uur" ? "var(--color-huisstijl)" : "var(--color-inkt)";
  const kleurMinuut = nadruk === "minuut" ? "var(--color-huisstijl)" : "var(--color-inkt)";
  const minuutlengte = MINUUTWIJZER;

  const wijzersEl = (
    <>
      {/* De kleine wijzer: kort en dik. Draait om het middelpunt. */}
      <g transform={`rotate(${hoeken.uur} ${MIDDEN} ${MIDDEN})`}>
        <line
          x1={MIDDEN}
          y1={MIDDEN}
          x2={MIDDEN}
          y2={MIDDEN - UURWIJZER}
          stroke={kleurUur}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {zetbaar && (
          <Grijpgebied van={8} tot={UURWIJZER + 6} sleept={sleept === "uur"} onPak={(e) => pak(e, "uur")} />
        )}
      </g>

      {/* De grote wijzer: lang en dun, dus altijd uit elkaar te houden. */}
      <g transform={`rotate(${hoeken.minuut} ${MIDDEN} ${MIDDEN})`}>
        <line
          x1={MIDDEN}
          y1={MIDDEN}
          x2={MIDDEN}
          y2={MIDDEN - minuutlengte}
          stroke={kleurMinuut}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {zetbaar && (
          <Grijpgebied
            van={UURWIJZER - 4}
            tot={minuutlengte + 6}
            sleept={sleept === "minuut"}
            onPak={(e) => pak(e, "minuut")}
          />
        )}
      </g>
    </>
  );

  const cijfersEl = (
    <>
      {/*
        De twaalf cijfers, elk gecentreerd op zijn eigen punt.

        Na de wijzers getekend, met een witte rand eromheen: zo valt een cijfer
        nooit weg achter de grote wijzer. Op elk heel uur staat die precies op
        de 12, en juist dat cijfer moet een kind kunnen lezen.
      */}
      {Array.from({ length: 12 }, (_, i) => {
        const uur = i + 1;
        const plek = cijferplek(uur);
        return (
          <text
            key={uur}
            x={plek.x}
            y={plek.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={800}
            fill="var(--color-inkt)"
            stroke="white"
            strokeWidth={5}
            strokeLinejoin="round"
            paintOrder="stroke"
            pointerEvents="none"
          >
            {uur}
          </text>
        );
      })}
    </>
  );

  const middenEl = (
    <>
      {/* Eén klein rondje in het midden. */}
      <circle cx={MIDDEN} cy={MIDDEN} r={5} fill="var(--color-inkt)" />
    </>
  );

  return (
    <svg
      ref={vak}
      viewBox="0 0 200 200"
      overflow="visible"
      className={`${grootte} shrink-0 select-none ${zetbaar ? "[touch-action:none]" : ""}`}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        cursor: sleept ? "grabbing" : undefined,
      }}
      /* draggable staat niet in de SVG-typen van React, maar de browser kent het wel. */
      {...({ draggable: "false" } as Record<string, string>)}
      onDragStart={(e) => e.preventDefault()}
      role="img"
      aria-label={`Klok die ${String(tijd.uur).padStart(2, "0")}:${String(tijd.minuut).padStart(2, "0")} aanwijst`}
      onPointerMove={(e) => sleept && verplaats(e, sleept)}
      onPointerUp={los}
      onPointerCancel={los}
    >
      {/* De wijzerplaat. */}
      <circle
        cx={MIDDEN}
        cy={MIDDEN}
        r={RAND}
        fill="var(--color-kaart)"
        stroke="var(--color-inkt)"
        strokeWidth={4}
      />

      {/* Zestig streepjes: elk vijfde langer en dikker, zoals op een echte klok. */}
      {Array.from({ length: 60 }, (_, i) => {
        const vijftal = i % 5 === 0;
        const s = streepje(i * 6, vijftal ? 12 : 6);
        return (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="var(--color-inkt)"
            strokeWidth={vijftal ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/*
        De volgorde van tekenen hangt af van de vlek (wachtrij, oktober 2026):

          - een vlek over cijfers ("cijfers", "groot"): eerst de cijfers, dan
            de vlek, dan de wijzers. De vlek verbergt het cijfer, de wijzers
            blijven helemaal te zien;
          - een vlek over een wijzer: eerst de wijzers, dan de vlek, dan de
            cijfers. De vlek verbergt het puntje van de wijzer, de cijfers
            blijven te zien;
          - geen vlek (of een oude vlek zonder laag): de wijzers, de cijfers
            erboven, en een oude vlek als laatste, zoals het altijd was.
      */}
      {vlek?.laag === "onder-wijzers" ? (
        <>
          {cijfersEl}
          <Vlekvorm vlek={vlek} />
          {wijzersEl}
          {middenEl}
        </>
      ) : vlek?.laag === "boven-wijzers" ? (
        <>
          {wijzersEl}
          <Vlekvorm vlek={vlek} />
          {cijfersEl}
          {middenEl}
        </>
      ) : (
        <>
          {wijzersEl}
          {cijfersEl}
          {middenEl}
          {vlek && <Vlekvorm vlek={vlek} />}
        </>
      )}
    </svg>
  );
}

/**
 * De digitale klok: uren en minuten, altijd twee cijfers.
 *
 * Een donker vlak met lichte cijfers, zoals een wekker. De dubbele punt staat
 * in een eigen kolom met vaste breedte, zodat de cijfers links en rechts ervan
 * niet verspringen als er een 1 in staat — `tabular-nums` doet de rest.
 */
export function Digitaleklok({
  tijd,
  maat = "gewoon",
  nadruk = null,
  onKiesDeel,
}: {
  tijd: Tijd;
  /**
   * "klein" is voor op een sleepkaartje: dan moet hij in een vakje van de
   * klok ernaast passen, en een gewone digitale klok is daar te breed voor.
   */
  maat?: "klein" | "gewoon" | "groot";
  /** Welk deel oplicht: de uren of de minuten. */
  nadruk?: "uur" | "minuut" | null;
  /** Mag het kind op het uren- of minutendeel tikken? */
  onKiesDeel?: (deel: "uur" | "minuut") => void;
}) {
  const cijfers =
    maat === "groot"
      ? "text-5xl sm:text-6xl px-4 py-2"
      : maat === "klein"
        ? "text-lg px-1.5 py-0.5"
        : "text-4xl sm:text-5xl px-4 py-2";
  const deel = (welke: "uur" | "minuut", waarde: number) => {
    const op = nadruk === welke;
    const kleur = op ? "bg-huisstijl text-white" : "text-room";
    const inhoud = String(waarde).padStart(2, "0");
    if (!onKiesDeel) {
      return <span className={`rounded-lg px-1.5 ${kleur}`}>{inhoud}</span>;
    }
    return (
      <button
        type="button"
        aria-label={welke === "uur" ? "Het urendeel" : "Het minutendeel"}
        onClick={() => onKiesDeel(welke)}
        className={`rounded-lg px-1.5 transition ${kleur} ${op ? "" : "hover:bg-nacht-op"}`}
      >
        {inhoud}
      </button>
    );
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-2xl bg-nacht font-extrabold tabular-nums ${cijfers}`}
    >
      {deel("uur", tijd.uur)}
      <span aria-hidden="true" className={`${maat === "klein" ? "w-2" : "w-4"} text-center text-room`}>
        :
      </span>
      {deel("minuut", tijd.minuut)}
    </span>
  );
}
