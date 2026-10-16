"use client";

/**
 * Proef: de startpagina als pop-upboek (16 oktober 2026, keuze eigenaar).
 *
 * Alleen te zien met /zappie?achtergrond=popup. De pagina wordt een
 * opengeslagen boek (opmaak in startpagina.css) en hierin staan de pop-ups:
 * lagen uitgeknipt papier die omhoog klappen zodra ze in beeld komen.
 *
 *   - links van de werelden een eilandje met een vuurtoren en een vogeltje;
 *   - rechts een raket op een rots, een maan en sterren aan draadjes;
 *   - onder "Mijn leerpad" drie lagen heuvels met een papieren Zappie;
 *   - boven de vakken een vlaggetjeslijn;
 *   - onderaan een rij grachtenhuizen, een molen en een bootje.
 *
 * Kleine verrassingen in plaats van constante beweging: komt de muis of een
 * vinger in de buurt, dan springt de raket op, knipoogt Zappie, schommelen de
 * vlaggetjes en sterren, klapt het vogeltje met zijn vleugels, draait de molen
 * een kwartslag en deint het bootje. Met de muis schuiven de lagen een paar
 * pixels mee (diepte). Bij "Beweging uit" en "minder beweging" staat alles
 * stil en staan de pop-ups meteen rechtop.
 *
 * Bewust géén verlopen, gloed of glans: matte papierkleuren, een harde
 * papierschaduw en randjes die een tikje onregelmatig zijn, alsof ze met een
 * schaar zijn geknipt.
 */

import { useEffect, useRef, useState } from "react";
import { useBewegingsstand } from "@/components/zappie/reis/beweging";

/* ------------------------------------------------------------------------- */
/* Geknipt papier: vormen met een klein beetje onregelmatigheid               */
/* ------------------------------------------------------------------------- */

/** Altijd dezelfde "toevallige" afwijking, zodat server en browser hetzelfde tekenen. */
function maakToeval(zaad: number) {
  let z = zaad;
  return () => {
    z = (z * 16807) % 2147483647;
    return (z - 1) / 2147483646;
  };
}

/** Een veelhoek met randjes die net niet recht zijn. */
function geknipt(punten: [number, number][], zaad: number, speling = 0.9) {
  const r = maakToeval(zaad);
  return (
    "M" +
    punten
      .map(([x, y]) => `${(x + (r() - 0.5) * speling * 2).toFixed(1)} ${(y + (r() - 0.5) * speling * 2).toFixed(1)}`)
      .join(" L") +
    " Z"
  );
}

/** Een heuvelrand over de hele breedte, met een paar toppen en wat geknipte hobbels. */
function heuvels(breedte: number, hoogte: number, basis: number, toppen: number, golf: number, zaad: number) {
  const r = maakToeval(zaad);
  const punten: [number, number][] = [[0, hoogte]];
  const stappen = 64;
  const fase = r() * Math.PI * 2;
  for (let i = 0; i <= stappen; i++) {
    const x = (i / stappen) * breedte;
    const y = basis - Math.sin((i / stappen) * Math.PI * toppen + fase) * golf - (r() - 0.5) * 3;
    punten.push([x, y]);
  }
  punten.push([breedte, hoogte]);
  return "M" + punten.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + " Z";
}

/** Een ster met vijf punten rond (cx, cy). */
function ster(cx: number, cy: number, buiten: number, binnen: number) {
  const punten: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const hoek = -Math.PI / 2 + (i * Math.PI) / 5;
    const straal = i % 2 === 0 ? buiten : binnen;
    punten.push([cx + Math.cos(hoek) * straal, cy + Math.sin(hoek) * straal]);
  }
  return punten;
}

type Gevel = "trap" | "klok" | "punt" | "hals";

/** Een grachtenhuis: gevel, ramen (uitgeknipt, dus papierkleur) en een deur. */
function Huis({ x, b, h, gevel, kleur, zaad, grond }: { x: number; b: number; h: number; gevel: Gevel; kleur: string; zaad: number; grond: number }) {
  const top = grond - h;
  let vorm: string;
  if (gevel === "trap") {
    const s = 13;
    vorm = geknipt(
      [
        [x, grond], [x, top], [x + b * 0.14, top], [x + b * 0.14, top - s], [x + b * 0.28, top - s],
        [x + b * 0.28, top - s * 2], [x + b * 0.4, top - s * 2], [x + b * 0.4, top - s * 3],
        [x + b * 0.6, top - s * 3], [x + b * 0.6, top - s * 2], [x + b * 0.72, top - s * 2],
        [x + b * 0.72, top - s], [x + b * 0.86, top - s], [x + b * 0.86, top], [x + b, top], [x + b, grond],
      ],
      zaad,
    );
  } else if (gevel === "punt") {
    vorm = geknipt([[x, grond], [x, top], [x + b / 2, top - b * 0.5], [x + b, top], [x + b, grond]], zaad);
  } else if (gevel === "hals") {
    vorm = geknipt(
      [
        [x, grond], [x, top], [x + b * 0.18, top - 6], [x + b * 0.28, top - 22], [x + b * 0.28, top - 40],
        [x + b * 0.72, top - 40], [x + b * 0.72, top - 22], [x + b * 0.82, top - 6], [x + b, top], [x + b, grond],
      ],
      zaad,
    );
  } else {
    vorm = `M${x} ${grond} V${top} Q${x + b * 0.1} ${top - 4} ${x + b * 0.2} ${top - 18} C${x + b * 0.24} ${top - 46} ${x + b * 0.76} ${top - 46} ${x + b * 0.8} ${top - 18} Q${x + b * 0.9} ${top - 4} ${x + b} ${top} V${grond} Z`;
  }
  const kolommen = b > 80 ? 3 : 2;
  const ramen: React.ReactNode[] = [];
  for (let rij = 0; top + 16 + rij * 34 < grond - 52; rij++) {
    for (let k = 0; k < kolommen; k++) {
      const rx = x + ((k + 0.5) * b) / kolommen - 6;
      ramen.push(<rect key={`${rij}-${k}`} x={rx} y={top + 16 + rij * 34} width={12} height={18} rx={1.5} />);
    }
  }
  return (
    <g>
      <path d={vorm} fill={kleur} />
      <g fill="var(--pb-papier)">
        {ramen}
        <rect x={x + b / 2 - 8} y={grond - 30} width={16} height={30} rx={7} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------------- */
/* De scènes                                                                  */
/* ------------------------------------------------------------------------- */

/** Eén laag papier: schuift met de muis mee (diepte) en klapt omhoog als hij opent. */
function Laag({ diepte, volgorde, children, viewBox, passend = "xMidYMax meet" }: { diepte: number; volgorde: number; children: React.ReactNode; viewBox: string; passend?: string }) {
  return (
    <div className="pb-laag" style={{ "--d": diepte } as React.CSSProperties}>
      <div className="pb-vouw" style={{ "--i": volgorde } as React.CSSProperties}>
        <svg viewBox={viewBox} preserveAspectRatio={passend} aria-hidden="true">
          {children}
        </svg>
      </div>
    </div>
  );
}

function Vuurtoren() {
  const vb = "0 0 240 400";
  return (
    <>
      <Laag viewBox={vb} diepte={2} volgorde={0}>
        <path d={geknipt([[-160, 334], [-100, 326], [-40, 334], [0, 336], [40, 326], [90, 334], [140, 324], [190, 333], [240, 325], [300, 333], [380, 326], [380, 400], [-160, 400]], 11)} fill="var(--pb-zee-licht)" />
        <g data-reageer="vogel" className="pb-vogel">
          <path className="pb-vleugel pb-vleugel-l" d="M70 92 Q58 80 44 84 Q58 88 70 96 Z" fill="var(--pb-inkt)" />
          <path className="pb-vleugel pb-vleugel-r" d="M70 92 Q82 78 98 82 Q82 88 70 96 Z" fill="var(--pb-inkt)" />
        </g>
      </Laag>
      <Laag viewBox={vb} diepte={5} volgorde={1}>
        <path d="M128 168 L0 120 L0 214 Z" fill="var(--pb-oker)" opacity="0.35" />
        <path d={geknipt([[22, 352], [48, 316], [92, 300], [150, 296], [196, 308], [226, 340], [232, 360], [16, 362]], 12)} fill="var(--pb-salie)" />
        <path d={geknipt([[40, 356], [70, 338], [120, 334], [180, 338], [214, 356]], 13)} fill="var(--pb-zand)" />
        <path d={geknipt([[116, 314], [124, 182], [148, 182], [156, 314]], 14)} fill="var(--pb-room)" />
        <path d={geknipt([[121, 262], [151, 262], [153, 286], [119, 286]], 15)} fill="var(--pb-koraal)" />
        <path d={geknipt([[123, 214], [149, 214], [150, 236], [122, 236]], 16)} fill="var(--pb-koraal)" />
        <path d={geknipt([[118, 182], [154, 182], [150, 160], [122, 160]], 17)} fill="var(--pb-inkt)" />
        <rect x="128" y="164" width="16" height="13" rx="2" fill="var(--pb-oker)" />
        <path d={geknipt([[116, 160], [136, 140], [156, 160]], 18)} fill="var(--pb-koraal)" />
      </Laag>
      <Laag viewBox={vb} diepte={9} volgorde={2}>
        <path d={`M-160 372 ${Array.from({ length: 14 }, () => "q20 -14 40 0").join(" ")} V400 H-160 Z`} fill="var(--pb-zee)" />
      </Laag>
    </>
  );
}

function Raket() {
  const vb = "0 0 240 400";
  return (
    <>
      <Laag viewBox={vb} diepte={2} volgorde={0}>
        <circle cx="168" cy="92" r="36" fill="var(--pb-maan)" />
        <circle cx="156" cy="82" r="7" fill="var(--pb-zand)" />
        <circle cx="180" cy="104" r="5" fill="var(--pb-zand)" />
        {[
          [40, 58],
          [96, 120],
          [214, 166],
        ].map(([x, lengte], i) => (
          <g key={x} data-reageer="ster" className="pb-hangster">
            <path d={`M${x} 0 V${lengte - 14}`} stroke="var(--pb-inkt)" strokeWidth="1.2" />
            <path d={geknipt(ster(x, lengte, 14, 6.5), 30 + i, 0.4)} fill="var(--pb-oker)" />
          </g>
        ))}
      </Laag>
      <Laag viewBox={vb} diepte={5} volgorde={1}>
        <path d={geknipt([[-140, 400], [-140, 392], [-60, 386], [0, 390], [60, 386], [74, 330], [104, 300], [160, 292], [206, 312], [232, 352], [300, 376], [400, 386], [400, 400]], 21)} fill="var(--pb-rots)" />
        <g data-reageer="raket" className="pb-raket">
          <path d={geknipt([[108, 168], [124, 170], [138, 196], [140, 292], [92, 292], [94, 196]], 22, 0.6)} fill="var(--pb-room)" />
          <path d={geknipt([[96, 196], [116, 150], [136, 196]], 23, 0.5)} fill="var(--pb-koraal)" />
          <circle cx="116" cy="224" r="12" fill="var(--pb-zee)" stroke="var(--pb-inkt)" strokeWidth="3" />
          <path d={geknipt([[94, 250], [72, 296], [94, 290]], 24, 0.5)} fill="var(--pb-koraal)" />
          <path d={geknipt([[138, 250], [160, 296], [138, 290]], 25, 0.5)} fill="var(--pb-koraal)" />
          <path className="pb-vlam" d={geknipt([[100, 292], [116, 330], [132, 292]], 26, 0.5)} fill="var(--pb-oker)" />
        </g>
      </Laag>
      <Laag viewBox={vb} diepte={9} volgorde={2}>
        <path d={geknipt([[20, 400], [36, 372], [58, 364], [74, 380], [92, 368], [110, 400]], 27)} fill="var(--pb-salie)" />
        <path d={geknipt([[176, 400], [190, 378], [212, 370], [234, 382], [240, 400]], 28)} fill="var(--pb-salie)" />
      </Laag>
    </>
  );
}

function PapierenZappie() {
  return (
    <g data-reageer="zappie" className="pb-zappie" transform="translate(300 40)">
      <path d="M50 6 V20" stroke="var(--pb-inkt)" strokeWidth="3" />
      <circle cx="50" cy="6" r="6" fill="var(--pb-oker)" />
      <path d={geknipt([[14, 22], [86, 22], [92, 30], [92, 74], [86, 82], [14, 82], [8, 74], [8, 30]], 41, 0.5)} fill="var(--pb-room)" />
      <path d={geknipt([[20, 32], [80, 32], [82, 68], [18, 68]], 42, 0.5)} fill="var(--pb-inkt)" />
      <ellipse className="pb-oog" cx="38" cy="48" rx="6" ry="7" fill="var(--pb-zee-licht)" />
      <ellipse className="pb-oog pb-oog-knipoog" cx="62" cy="48" rx="6" ry="7" fill="var(--pb-zee-licht)" />
      <path d="M40 60 Q50 66 60 60" stroke="var(--pb-zee-licht)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={geknipt([[22, 84], [78, 84], [82, 130], [18, 130]], 43, 0.5)} fill="var(--pb-room)" />
      <circle cx="50" cy="106" r="10" fill="var(--pb-zee)" />
      <path d="M47 99 L54 106 L48 107 L53 114" stroke="var(--pb-oker)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path className="pb-zwaaiarm" d={geknipt([[82, 92], [104, 74], [110, 80], [86, 100]], 44, 0.4)} fill="var(--pb-room)" />
      <path d={geknipt([[18, 92], [4, 118], [10, 122], [22, 100]], 45, 0.4)} fill="var(--pb-room)" />
      <circle cx="30" cy="134" r="9" fill="var(--pb-inkt)" />
      <circle cx="70" cy="134" r="9" fill="var(--pb-inkt)" />
    </g>
  );
}

function Heuvels() {
  const vb = "0 0 1600 240";
  const passend = "xMidYMax slice";
  return (
    <>
      <Laag viewBox={vb} diepte={2} volgorde={0} passend={passend}>
        <path d={heuvels(1600, 240, 96, 5, 26, 51)} fill="var(--pb-salie-licht)" />
      </Laag>
      <Laag viewBox={vb} diepte={5} volgorde={1} passend={passend}>
        <path d={heuvels(1600, 240, 150, 3, 22, 52)} fill="var(--pb-zee)" />
        {[140, 520, 980, 1130, 1420].map((x, i) => (
          <path key={x} d={geknipt([[x - 16, 150 - (i % 2) * 14], [x, 102 - (i % 2) * 14], [x + 16, 150 - (i % 2) * 14]], 60 + i, 0.6)} fill="var(--pb-inkt)" opacity="0.75" />
        ))}
      </Laag>
      <Laag viewBox={vb} diepte={8} volgorde={2} passend={passend}>
        <path d={heuvels(1600, 240, 200, 2, 16, 53)} fill="var(--pb-oker)" />
        <PapierenZappie />
      </Laag>
    </>
  );
}

const VLAGKLEUREN = ["var(--pb-koraal)", "var(--pb-oker)", "var(--pb-zee)", "var(--pb-salie)", "var(--pb-inkt)"];

function Vlaggetjes() {
  /* Twee doorhangende lijnen; de vlaggetjes hangen er op gelijke afstand aan. */
  const boog = (t: number, x0: number, x1: number) => {
    const x = x0 + (x1 - x0) * t;
    const y = 8 + Math.sin(Math.PI * t) * 34;
    return [x, y] as const;
  };
  const vlaggen: { x: number; y: number; kleur: string }[] = [];
  let n = 0;
  for (const [x0, x1] of [[0, 800], [800, 1600]] as const) {
    for (let k = 1; k < 12; k++) {
      const [x, y] = boog(k / 12, x0, x1);
      vlaggen.push({ x, y, kleur: VLAGKLEUREN[n++ % VLAGKLEUREN.length] });
    }
  }
  return (
    <Laag viewBox="0 0 1600 100" diepte={3} volgorde={0} passend="xMidYMin slice">
      <path d="M0 8 Q400 76 800 8 Q1200 76 1600 8" stroke="var(--pb-inkt)" strokeWidth="1.6" fill="none" />
      {vlaggen.map((v, i) => (
        <g key={i} data-reageer="vlag" className="pb-vlag">
          <path d={geknipt([[v.x - 17, v.y], [v.x + 17, v.y], [v.x, v.y + 42]], 70 + i, 0.6)} fill={v.kleur} />
        </g>
      ))}
    </Laag>
  );
}

const HUIZEN: { b: number; h: number; gevel: Gevel; kleur: string }[] = [
  { b: 78, h: 150, gevel: "trap", kleur: "var(--pb-koraal)" },
  { b: 64, h: 178, gevel: "klok", kleur: "var(--pb-inkt)" },
  { b: 86, h: 136, gevel: "hals", kleur: "var(--pb-oker)" },
  { b: 70, h: 164, gevel: "punt", kleur: "var(--pb-zee)" },
  { b: 92, h: 146, gevel: "trap", kleur: "var(--pb-salie)" },
  { b: 66, h: 184, gevel: "klok", kleur: "var(--pb-koraal)" },
  { b: 80, h: 140, gevel: "hals", kleur: "var(--pb-inkt)" },
  { b: 72, h: 170, gevel: "trap", kleur: "var(--pb-oker)" },
];

/** De huizen naast elkaar langs de gracht, vanaf x = 250. */
const RIJ = HUIZEN.concat(HUIZEN.slice(0, 7)).reduce<{ x: number; b: number; h: number; gevel: Gevel; kleur: string }[]>((lijst, h) => {
  const vorige = lijst[lijst.length - 1];
  return [...lijst, { ...h, x: vorige ? vorige.x + vorige.b + 2 : 250 }];
}, []);

function Gracht() {
  const vb = "0 0 1600 300";
  const passend = "xMidYMax slice";
  const grond = 262;
  const rij = RIJ.map((h, i) => <Huis key={i} x={h.x} b={h.b} h={h.h} gevel={h.gevel} kleur={h.kleur} zaad={80 + i} grond={grond} />);
  return (
    <>
      <Laag viewBox={vb} diepte={2} volgorde={0} passend={passend}>
        <path d={geknipt([[0, 262], [0, 190], [60, 190], [60, 150], [130, 150], [130, 200], [210, 200], [210, 170], [1400, 170], [1400, 140], [1470, 140], [1470, 186], [1600, 186], [1600, 262]], 90)} fill="var(--pb-salie-licht)" />
        <g transform="translate(110 40)">
          <path d={geknipt([[18, 222], [30, 70], [62, 70], [74, 222]], 91)} fill="var(--pb-room)" />
          <path d={geknipt([[26, 74], [46, 46], [66, 74]], 92)} fill="var(--pb-inkt)" />
          <rect x="38" y="186" width="16" height="36" rx="7" fill="var(--pb-inkt)" />
          <g data-reageer="molen" className="pb-wieken">
            {[0, 90, 180, 270].map((hoek) => (
              <g key={hoek} transform={`rotate(${hoek} 46 64)`}>
                <path d={geknipt([[43, 64], [49, 64], [52, -10], [40, -10]], 93 + hoek, 0.4)} fill="var(--pb-koraal)" />
                <path d="M40 -6 H52 M40 10 H50 M41 26 H50 M42 42 H49" stroke="var(--pb-room)" strokeWidth="1.5" />
              </g>
            ))}
            <circle cx="46" cy="64" r="6" fill="var(--pb-inkt)" />
          </g>
        </g>
      </Laag>
      <Laag viewBox={vb} diepte={5} volgorde={1} passend={passend}>
        {rij}
      </Laag>
      <Laag viewBox={vb} diepte={8} volgorde={2} passend={passend}>
        <path d="M0 262 H1600 V300 H0 Z" fill="var(--pb-zee)" />
        <path d="M80 280 h50 M300 288 h70 M620 279 h40 M900 290 h60 M1180 281 h50 M1450 289 h60" stroke="var(--pb-zee-licht)" strokeWidth="3" strokeLinecap="round" />
        <g data-reageer="boot" className="pb-boot">
          <path d={geknipt([[1040, 268], [1120, 268], [1106, 286], [1054, 286]], 99, 0.5)} fill="var(--pb-koraal)" />
          <path d="M1080 268 V226" stroke="var(--pb-inkt)" strokeWidth="2.5" />
          <path d={geknipt([[1082, 228], [1110, 262], [1082, 262]], 98, 0.5)} fill="var(--pb-room)" />
        </g>
      </Laag>
    </>
  );
}

/* ------------------------------------------------------------------------- */
/* Op de juiste plek zetten en laten reageren                                 */
/* ------------------------------------------------------------------------- */

type Vak = { x: number; y: number; b: number; h: number };
type Plekken = { links?: Vak; rechts?: Vak; heuvels?: Vak; vlaggen?: Vak; gracht?: Vak };

/** Hoe ver een reactie reikt, in pixels rond het stukje papier. */
const BEREIK = 70;
/** Hoe lang een reactie duurt voor hij opnieuw kan. */
const DUUR = 1400;

export function PopupBoek() {
  const laag = useRef<HTMLDivElement>(null);
  const [plek, zetPlek] = useState<Plekken | null>(null);
  const rustig = useBewegingsstand() !== "aan";

  /* Meten waar de scènes moeten staan: rond de werelden, onder Mijn leerpad, boven de vakken en onderaan. */
  useEffect(() => {
    const el = laag.current;
    const boek = el?.parentElement;
    if (!el || !boek) return;
    const meet = () => {
      const basis = boek.getBoundingClientRect();
      const rel = (r: DOMRect): Vak => ({ x: r.left - basis.left, y: r.top - basis.top, b: r.width, h: r.height });
      const breedte = basis.width;
      const nieuw: Plekken = {};
      const kaarten = [...document.querySelectorAll(".zp-werelden a, .zp-werelden button")].map((k) => k.getBoundingClientRect());
      if (kaarten.length) {
        const links = Math.min(...kaarten.map((k) => k.left)) - basis.left;
        const rechts = Math.max(...kaarten.map((k) => k.right)) - basis.left;
        const boven = Math.min(...kaarten.map((k) => k.top)) - basis.top;
        const onder = Math.max(...kaarten.map((k) => k.bottom)) - basis.top;
        const hoogte = onder - boven;
        if (links > 140) nieuw.links = { x: 0, y: boven, b: links - 12, h: hoogte };
        if (breedte - rechts > 140) nieuw.rechts = { x: rechts + 12, y: boven, b: breedte - rechts - 12, h: hoogte };
      }
      const missie = document.querySelector(".zp-missieplek");
      if (missie) {
        const m = rel(missie.getBoundingClientRect());
        nieuw.heuvels = { x: 0, y: m.y + m.h - 30, b: breedte, h: Math.min(240, Math.max(150, breedte * 0.16)) };
      }
      const vakken = document.getElementById("vrij-oefenen");
      if (vakken) {
        const v = rel(vakken.getBoundingClientRect());
        nieuw.vlaggen = { x: 0, y: v.y - 6, b: breedte, h: 100 };
      }
      const kust = document.querySelector(".zs-kust");
      if (kust) {
        const k = rel(kust.getBoundingClientRect());
        const h = Math.min(280, Math.max(170, breedte * 0.18));
        nieuw.gracht = { x: 0, y: k.y + k.h - h, b: breedte, h };
      }
      zetPlek(nieuw);
    };
    meet();
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(document.body);
    window.addEventListener("resize", meet);
    return () => {
      waarnemer.disconnect();
      window.removeEventListener("resize", meet);
    };
  }, []);

  /* Openklappen zodra een scène in beeld komt (één keer). */
  useEffect(() => {
    const el = laag.current;
    if (!el || !plek) return;
    const scenes = [...el.querySelectorAll<HTMLElement>(".pb-scene")];
    if (rustig) {
      scenes.forEach((s) => (s.dataset.open = "ja"));
      return;
    }
    const kijker = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) {
            (item.target as HTMLElement).dataset.open = "ja";
            kijker.unobserve(item.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    scenes.forEach((s) => kijker.observe(s));
    return () => kijker.disconnect();
  }, [plek, rustig]);

  /* Diepte met de muis, en kleine verrassingen in de buurt van de muis of een vinger. */
  useEffect(() => {
    const el = laag.current;
    if (!el || !plek || rustig) return;
    let frame = 0;
    let laatste: PointerEvent | null = null;
    const bezig = new WeakMap<Element, number>();
    const verwerk = () => {
      frame = 0;
      const e = laatste;
      if (!e) return;
      if (e.pointerType === "mouse") {
        el.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      }
      const nu = performance.now();
      for (const stuk of el.querySelectorAll("[data-reageer]")) {
        const r = stuk.getBoundingClientRect();
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        if (dx * dx + dy * dy > BEREIK * BEREIK) continue;
        if ((bezig.get(stuk) ?? 0) > nu) continue;
        bezig.set(stuk, nu + DUUR);
        stuk.classList.add("pb-actief");
        window.setTimeout(() => stuk.classList.remove("pb-actief"), DUUR - 100);
      }
    };
    const beweeg = (e: PointerEvent) => {
      laatste = e;
      if (!frame) frame = requestAnimationFrame(verwerk);
    };
    window.addEventListener("pointermove", beweeg, { passive: true });
    window.addEventListener("pointerdown", beweeg, { passive: true });
    return () => {
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerdown", beweeg);
      cancelAnimationFrame(frame);
    };
  }, [plek, rustig]);

  const scene = (naam: keyof Plekken, inhoud: React.ReactNode) => {
    const v = plek?.[naam];
    if (!v) return null;
    return (
      <div className={`pb-scene pb-scene-${naam}`} style={{ left: v.x, top: v.y, width: v.b, height: v.h }}>
        {inhoud}
      </div>
    );
  };

  return (
    <div ref={laag} className="pb" aria-hidden="true" data-rustig={rustig ? "ja" : "nee"}>
      {scene("links", <Vuurtoren />)}
      {scene("rechts", <Raket />)}
      {scene("heuvels", <Heuvels />)}
      {scene("vlaggen", <Vlaggetjes />)}
      {scene("gracht", <Gracht />)}
    </div>
  );
}
