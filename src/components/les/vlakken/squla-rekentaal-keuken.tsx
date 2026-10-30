"use client";

/**
 * Rekentaal in de keuken en bij de picknick (30 oktober 2026, les
 * "Groot en klein, vol en leeg", naar een oefening van Squla maar met eigen
 * tekeningen). Pannenkoeken, bekers, glazen sap, manden, appels, een meloen,
 * een aardbei, een zak meel, broodjes en slierten spaghetti, in de vlakke
 * Bliepo-stijl (bliepo-voorwerpen.ts): dekkende vormen met een donkerblauwe
 * rand. Alles is gewone SVG; er wordt niets per beeld uitgerekend.
 *
 * De voorwerpen zijn zelf de antwoordknoppen: echte <button>s met een naam
 * (aria-label), voor te lezen met de muis of lang indrukken (keuzeStem).
 *
 * Indelingen:
 * - "rij": naast elkaar op de tafel of het kleed, onderkant gelijk;
 * - "onder": onder elkaar, links gelijk (lang en kort), met een startstreep;
 * - "weegschaal": twee voorwerpen op een weegschaal die naar de zware kant kantelt;
 * - "volgorde": drie voorwerpen boven, drie lege plekken onder (klein → groot).
 *
 * Melding: `{ soort: "tik", id }`, alleen als `actief`.
 */

import { useEffect, useState, type ReactNode } from "react";
import type { Vlakbasis } from "../soort";
import { PALET } from "./bliepo-voorwerpen";
import { keuzeStem } from "../keuzestem";
import s from "./squla-rekentaal.module.css";

export type RekenSoort = "pannenkoek" | "beker" | "glas" | "mand" | "appel" | "meloen" | "aardbei" | "zak" | "broodje" | "sliert";

export type RekenDing = {
  id: string;
  soort: RekenSoort;
  /** De naam voor voorlezen en schermlezers, bijvoorbeeld "de grote beker". */
  naam: string;
  /** Hoe groot (1 = gewoon). */
  maat?: number;
  /** Broodje en sliert: de lengte in punten. */
  lengte?: number;
  /** Glas: 0 = leeg, 0,5 = half vol, 1 = vol. */
  vul?: number;
};

export type RekentaalProps = {
  /** Nieuw nummer = nieuw tafereel (begint opnieuw, de weegschaal kantelt opnieuw). */
  nr: number;
  indeling: "rij" | "onder" | "weegschaal" | "volgorde";
  dingen: RekenDing[];
  ondergrond: "tafel" | "kleed";
  /** Weegschaal: het zware voorwerp. */
  zwaar?: string;
  actief: boolean;
  markeer: string[];
  goed: string[];
  wiebel: { id: string; n: number } | null;
  /** Volgorde: wat al op een plek staat, van links naar rechts. */
  geplaatst: string[];
};

const NAVY = PALET.navy;
const LIJN = 6;

/* ---------- de tekeningen ---------- */

function maten(d: RekenDing): { b: number; h: number } {
  const m = d.maat ?? 1;
  switch (d.soort) {
    case "pannenkoek":
      return { b: 220 * m, h: 220 * m };
    case "beker":
      return { b: 180 * m, h: 180 * m };
    case "glas":
      return { b: 130 * m, h: 190 * m };
    case "mand":
      return { b: 230 * m, h: 190 * m };
    case "appel":
      return { b: 120 * m, h: 125 * m };
    case "meloen":
      return { b: 210 * m, h: 165 * m };
    case "aardbei":
      return { b: 80 * m, h: 90 * m };
    case "zak":
      return { b: 150 * m, h: 175 * m };
    case "broodje":
      return { b: d.lengte ?? 300, h: 70 };
    case "sliert":
      return { b: d.lengte ?? 300, h: 44 };
  }
}

function Pannenkoek() {
  return (
    <>
      <circle cx="110" cy="110" r="100" fill="#f6c768" stroke={NAVY} strokeWidth={LIJN} />
      <circle cx="110" cy="110" r="76" fill="#f9d98f" />
      <ellipse cx="80" cy="85" rx="14" ry="9" fill="#d99a45" />
      <ellipse cx="140" cy="100" rx="11" ry="7" fill="#d99a45" />
      <ellipse cx="105" cy="145" rx="16" ry="9" fill="#d99a45" />
      <ellipse cx="150" cy="150" rx="7" ry="5" fill="#d99a45" />
      <ellipse cx="65" cy="130" rx="8" ry="5" fill="#d99a45" />
    </>
  );
}

function Beker() {
  return (
    <>
      <path d="M136 62 h16 a24 24 0 0 1 0 48 h-16" fill="none" stroke={NAVY} strokeWidth="18" strokeLinecap="round" />
      <path d="M136 62 h16 a24 24 0 0 1 0 48 h-16" fill="none" stroke={PALET.koraal} strokeWidth="7" strokeLinecap="round" />
      <path d="M30 30 h108 v118 a22 22 0 0 1 -22 22 h-64 a22 22 0 0 1 -22 -22 Z" fill={PALET.koraal} stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <rect x="33" y="78" width="102" height="24" fill={PALET.warmwit} />
      <path d="M30 78 h108 M30 102 h108" stroke={NAVY} strokeWidth="3" />
    </>
  );
}

function Glas({ vul }: { vul: number }) {
  /* De wand loopt van (12,12)–(118,12) bovenaan naar (26,180)–(104,180) onderaan. */
  const links = (y: number) => 12 + ((y - 12) / 168) * 14;
  const rechts = (y: number) => 118 - ((y - 12) / 168) * 14;
  const bodem = 174;
  const top = bodem - Math.max(0, Math.min(1, vul)) * 150;
  return (
    <>
      <path d="M12 12 H118 L104 180 H26 Z" fill="#dff1f7" />
      {vul > 0 && (
        <>
          <path d={`M${links(top) + 4} ${top} H${rechts(top) - 4} L${rechts(bodem) - 4} ${bodem} H${links(bodem) + 4} Z`} fill="#ffa63d" />
          <path d={`M${links(top) + 4} ${top} H${rechts(top) - 4}`} stroke="#e07f12" strokeWidth="4" />
        </>
      )}
      <path d="M12 12 H118 L104 180 H26 Z" fill="none" stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <path d="M30 30 L38 150" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    </>
  );
}

function Mand() {
  return (
    <>
      <path d="M48 92 C48 8, 182 8, 182 92" fill="none" stroke={NAVY} strokeWidth="18" strokeLinecap="round" />
      <path d="M48 92 C48 8, 182 8, 182 92" fill="none" stroke="#d9a066" strokeWidth="7" strokeLinecap="round" />
      <path d="M14 86 H216 L194 182 H36 Z" fill="#d9a066" stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <path d="M24 118 H206 M31 150 H199" stroke="#a8693a" strokeWidth="5" />
      <path d="M66 90 L72 178 M115 90 V178 M164 90 L158 178" stroke="#a8693a" strokeWidth="5" />
      <rect x="14" y="80" width="202" height="16" rx="6" fill={PALET.koraal} stroke={NAVY} strokeWidth="4" />
    </>
  );
}

function Appel() {
  return (
    <>
      <path d="M60 30 Q62 14 72 6" fill="none" stroke={NAVY} strokeWidth="6" strokeLinecap="round" />
      <path d="M66 22 C78 6, 100 8, 104 18 C92 28, 76 30, 66 22 Z" fill="#5fbf6a" stroke={NAVY} strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 34 C30 16, 4 40, 11 76 C17 106, 40 124, 60 113 C80 124, 103 106, 109 76 C116 40, 90 16, 60 34 Z" fill="#e8504a" stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <path d="M32 54 C26 64, 26 76, 30 86" fill="none" stroke="#ffb3a6" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function Meloen() {
  return (
    <>
      <ellipse cx="105" cy="86" rx="98" ry="74" fill="#5cbf6e" stroke={NAVY} strokeWidth={LIJN} />
      <path d="M40 40 C70 70, 70 110, 42 136 M85 16 C110 60, 110 116, 86 158 M140 18 C160 60, 160 116, 138 156 M178 42 C190 70, 190 104, 176 132" fill="none" stroke="#2f7d44" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="105" cy="86" rx="98" ry="74" fill="none" stroke={NAVY} strokeWidth={LIJN} />
    </>
  );
}

function Aardbei() {
  return (
    <>
      <path d="M40 86 C12 62, 4 34, 14 24 C24 14, 56 14, 66 24 C76 34, 68 62, 40 86 Z" fill="#e8504a" stroke={NAVY} strokeWidth="5" strokeLinejoin="round" />
      <path d="M18 22 L30 8 L40 20 L50 8 L62 22 Q40 30 18 22 Z" fill="#5fbf6a" stroke={NAVY} strokeWidth="4" strokeLinejoin="round" />
      {[
        [28, 38],
        [44, 36],
        [56, 46],
        [36, 52],
        [48, 62],
        [26, 50],
        [40, 72],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.6" ry="3.6" fill={PALET.geelLicht} />
      ))}
    </>
  );
}

function Zak() {
  return (
    <>
      <path d="M36 50 C18 84, 14 140, 30 168 H120 C136 140, 132 84, 114 50 Z" fill={PALET.warmwit} stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <path d="M48 50 L38 14 H112 L102 50 Z" fill={PALET.warmwit} stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      <rect x="40" y="42" width="70" height="14" rx="6" fill={PALET.koraal} stroke={NAVY} strokeWidth="4" />
      {/* een korenaar */}
      <path d="M75 150 V86" stroke="#c98b32" strokeWidth="5" strokeLinecap="round" />
      {[94, 110, 126].map((y) => (
        <g key={y}>
          <ellipse cx="66" cy={y} rx="7" ry="11" transform={`rotate(-30 66 ${y})`} fill={PALET.geel} stroke="#c98b32" strokeWidth="2" />
          <ellipse cx="84" cy={y} rx="7" ry="11" transform={`rotate(30 84 ${y})`} fill={PALET.geel} stroke="#c98b32" strokeWidth="2" />
        </g>
      ))}
    </>
  );
}

function Broodje({ b }: { b: number }) {
  const sneden: number[] = [];
  for (let x = 60; x < b - 40; x += 62) sneden.push(x);
  return (
    <>
      <rect x="4" y="8" width={b - 8} height="54" rx="27" fill="#e3a557" stroke={NAVY} strokeWidth={LIJN} />
      {sneden.map((x) => (
        <path key={x} d={`M${x - 12} 46 L${x + 12} 22`} stroke="#b97832" strokeWidth="6" strokeLinecap="round" />
      ))}
    </>
  );
}

function Sliert({ b }: { b: number }) {
  const y = 22;
  let d = `M12 ${y}`;
  let omhoog = true;
  for (let x = 12; x < b - 12; x += 24) {
    const naar = Math.min(x + 24, b - 12);
    d += ` Q${(x + naar) / 2} ${omhoog ? y - 14 : y + 14} ${naar} ${y}`;
    omhoog = !omhoog;
  }
  return (
    <>
      <path d={d} fill="none" stroke={NAVY} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ffd36b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Tekening({ d }: { d: RekenDing }) {
  const { b, h } = maten(d);
  let vak = "0 0 220 220";
  let inhoud: ReactNode = null;
  switch (d.soort) {
    case "pannenkoek":
      inhoud = <Pannenkoek />;
      break;
    case "beker":
      vak = "0 0 180 180";
      inhoud = <Beker />;
      break;
    case "glas":
      vak = "0 0 130 190";
      inhoud = <Glas vul={d.vul ?? 0} />;
      break;
    case "mand":
      vak = "0 0 230 190";
      inhoud = <Mand />;
      break;
    case "appel":
      vak = "0 0 120 125";
      inhoud = <Appel />;
      break;
    case "meloen":
      vak = "0 0 210 165";
      inhoud = <Meloen />;
      break;
    case "aardbei":
      vak = "0 0 80 90";
      inhoud = <Aardbei />;
      break;
    case "zak":
      vak = "0 0 150 175";
      inhoud = <Zak />;
      break;
    case "broodje":
      vak = `0 0 ${b} 70`;
      inhoud = <Broodje b={b} />;
      break;
    case "sliert":
      vak = `0 0 ${b} 44`;
      inhoud = <Sliert b={b} />;
      break;
  }
  return (
    <svg width={b} height={h} viewBox={vak} aria-hidden="true" focusable="false">
      {inhoud}
    </svg>
  );
}

/* ---------- de ondergrond ---------- */

function Ondergrond({ soort, x, y, b, h }: { soort: "tafel" | "kleed"; x: number; y: number; b: number; h: number }) {
  if (soort === "tafel") {
    return (
      <g>
        <rect x={x} y={y} width={b} height={Math.min(h, 34)} rx="10" fill="#c98b52" stroke={NAVY} strokeWidth={LIJN} />
        {h > 34 && <rect x={x + 6} y={y + 34} width={b - 12} height={h - 34} rx="10" fill="#b5773f" />}
      </g>
    );
  }
  /* Het picknickkleed: een geblokt kleed, rood en warmwit. */
  const cel = 46;
  const kolommen = Math.ceil(b / cel);
  const rijen = Math.ceil(h / cel);
  const blokken: ReactNode[] = [];
  for (let r = 0; r < rijen; r++)
    for (let k = 0; k < kolommen; k++)
      if ((r + k) % 2 === 0)
        blokken.push(<rect key={`${r}-${k}`} x={x + k * cel} y={y + r * cel} width={Math.min(cel, x + b - (x + k * cel))} height={Math.min(cel, y + h - (y + r * cel))} fill={PALET.koraal} />);
  return (
    <g>
      <rect x={x} y={y} width={b} height={h} rx="14" fill={PALET.warmwit} />
      {blokken}
      <rect x={x} y={y} width={b} height={h} rx="14" fill="none" stroke={NAVY} strokeWidth={LIJN} />
    </g>
  );
}

/* ---------- de weegschaal ---------- */

const DRAAI_X = 480;
const DRAAI_Y = 210;
const ARM = 230;
const HANG = 170;
const KANTEL = 10;
const ZAK = Math.round(ARM * Math.sin((KANTEL * Math.PI) / 180));

function Weegschaal({ links, rechts }: { links: number; rechts: number }) {
  /* links/rechts: hoeveel die schaal zakt (+) of stijgt (−). */
  const hoek = links > 0 ? -KANTEL : rechts > 0 ? KANTEL : 0;
  const schaal = (x: number, dy: number) => {
    const y = DRAAI_Y + HANG;
    return (
      <g className={s.schaal} style={{ transform: `translateY(${dy}px)` }}>
        <path d={`M${x - 104} ${y} L${x} ${y - HANG} L${x + 104} ${y}`} fill="none" stroke="#d6d8e1" strokeWidth="3" />
        <path d={`M${x - 112} ${y} A112 30 0 0 0 ${x + 112} ${y} Z`} fill={PALET.warmwit} stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <g>
      <path d={`M${DRAAI_X - 14} ${DRAAI_Y} H${DRAAI_X + 14} V590 H${DRAAI_X - 14} Z`} fill={PALET.petrol} stroke={NAVY} strokeWidth={LIJN} />
      <path d={`M${DRAAI_X - 90} 616 L${DRAAI_X - 64} 584 H${DRAAI_X + 64} L${DRAAI_X + 90} 616 Z`} fill={PALET.petrol} stroke={NAVY} strokeWidth={LIJN} strokeLinejoin="round" />
      {schaal(DRAAI_X - ARM, links)}
      {schaal(DRAAI_X + ARM, rechts)}
      <g className={s.balk} style={{ transformOrigin: `${DRAAI_X}px ${DRAAI_Y}px`, transformBox: "view-box", transform: `rotate(${hoek}deg)` }}>
        <rect x={DRAAI_X - ARM - 12} y={DRAAI_Y - 9} width={2 * ARM + 24} height="18" rx="9" fill={PALET.geel} stroke={NAVY} strokeWidth="5" />
      </g>
      <circle cx={DRAAI_X} cy={DRAAI_Y} r="15" fill={PALET.koraal} stroke={NAVY} strokeWidth="5" />
    </g>
  );
}

/* ---------- het vlak ---------- */

type Plek = { x: number; y: number; weeg?: boolean };

function Tafereel(p: RekentaalProps & Vlakbasis) {
  const { indeling, dingen, ondergrond, zwaar, actief, markeer, goed, wiebel, geplaatst, meld } = p;
  /* De weegschaal begint recht en kantelt daarna (nieuw tafereel = nieuwe sleutel = opnieuw). */
  const [gekanteld, zetGekanteld] = useState(false);
  useEffect(() => {
    if (indeling !== "weegschaal") return;
    const t = setTimeout(() => zetGekanteld(true), 450);
    return () => clearTimeout(t);
  }, [indeling]);

  const plekken = new Map<string, Plek>();
  const achter: ReactNode[] = [];
  const n = dingen.length;

  if (indeling === "rij") {
    const xs = n === 2 ? [300, 660] : n === 3 ? [200, 480, 760] : dingen.map((_, i) => 140 + (i * 700) / Math.max(1, n - 1));
    const grond = 540;
    dingen.forEach((d, i) => plekken.set(d.id, { x: xs[i], y: grond }));
    achter.push(<Ondergrond key="grond" soort={ondergrond} x={50} y={ondergrond === "kleed" ? grond - 30 : grond} b={860} h={ondergrond === "kleed" ? 150 : 110} />);
  } else if (indeling === "onder") {
    const ys = n === 2 ? [330, 470] : [270, 400, 530];
    const start = 150;
    const top = ys[0] - 80;
    const bodem = ys[ys.length - 1] + 80;
    achter.push(<Ondergrond key="grond" soort={ondergrond} x={90} y={top} b={820} h={bodem - top} />);
    achter.push(<path key="start" d={`M${start} ${top + 14} V${bodem - 14}`} stroke={NAVY} strokeWidth="5" strokeDasharray="12 10" strokeLinecap="round" />);
    dingen.forEach((d, i) => {
      const { b, h } = maten(d);
      plekken.set(d.id, { x: start + b / 2, y: ys[i] + h / 2 });
    });
  } else if (indeling === "weegschaal") {
    const [a, b2] = dingen;
    const linksZwaar = zwaar === a?.id;
    const dl = gekanteld ? (linksZwaar ? ZAK : -ZAK) : 0;
    const dr = -dl;
    achter.push(<Ondergrond key="grond" soort={ondergrond} x={170} y={ondergrond === "kleed" ? 586 : 616} b={620} h={ondergrond === "kleed" ? 110 : 80} />);
    achter.push(<Weegschaal key="weeg" links={dl} rechts={dr} />);
    if (a) plekken.set(a.id, { x: DRAAI_X - ARM, y: DRAAI_Y + HANG - 4 + dl, weeg: true });
    if (b2) plekken.set(b2.id, { x: DRAAI_X + ARM, y: DRAAI_Y + HANG - 4 + dr, weeg: true });
  } else {
    /* Volgorde: boven de voorwerpen, onder drie lege plekken die van klein naar groot gaan. */
    const xs = [200, 480, 760];
    const boven = 400;
    const onder = 668;
    achter.push(<Ondergrond key="grond" soort={ondergrond} x={50} y={ondergrond === "kleed" ? boven - 30 : boven} b={860} h={ondergrond === "kleed" ? 120 : 60} />);
    achter.push(<rect key="plank" x={90} y={onder} width={780} height={22} rx="8" fill="#c98b52" stroke={NAVY} strokeWidth={LIJN} />);
    const opMaat = [...dingen].sort((x, y) => maten(x).b * maten(x).h - maten(y).b * maten(y).h);
    const plekX = [260, 480, 700];
    opMaat.forEach((d, i) => {
      const { b, h } = maten(d);
      achter.push(
        <rect key={`plek-${i}`} x={plekX[i] - b / 2 - 6} y={onder - h - 10} width={b + 12} height={h + 6} rx="16" fill="none" stroke="rgba(160,180,220,0.55)" strokeWidth="4" strokeDasharray="12 9" />,
      );
    });
    dingen.forEach((d, i) => {
      const k = geplaatst.indexOf(d.id);
      plekken.set(d.id, k >= 0 ? { x: plekX[k], y: onder - 4 } : { x: xs[i], y: boven });
    });
  }

  return (
    <div className={s.vlak}>
      <svg className={s.achter} width="980" height="720" viewBox="0 0 980 720" aria-hidden="true">
        {achter}
      </svg>
      {dingen.map((d) => {
        const plek = plekken.get(d.id);
        if (!plek) return null;
        const { b, h } = maten(d);
        const staatAlGoed = indeling === "volgorde" && geplaatst.includes(d.id);
        const kanTikken = actief && !staatAlGoed;
        const schudt = wiebel?.id === d.id;
        /* "onder": y is het midden; anders de onderkant. */
        const top = indeling === "onder" ? plek.y - h / 2 : plek.y - h;
        const stem = keuzeStem(d.naam);
        return (
          <button
            key={d.id}
            type="button"
            className={`${s.ding} ${plek.weeg ? s.op_weegschaal : ""}`}
            {...stem}
            style={{ ...stem.style, left: plek.x - b / 2, top, width: b, height: h }}
            aria-label={d.naam}
            data-ding={d.id}
            aria-disabled={!kanTikken}
            data-actief={kanTikken ? "ja" : undefined}
            data-markeer={markeer.includes(d.id) ? "ja" : undefined}
            data-goed={goed.includes(d.id) ? "ja" : undefined}
            onClick={() => {
              if (kanTikken) meld({ soort: "tik", id: d.id });
            }}
          >
            <span key={schudt ? `w${wiebel?.n}` : "s"} className={schudt ? s.wiebel : s.stil}>
              <Tekening d={d} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SqulaRekentaalKeuken(p: RekentaalProps & Vlakbasis) {
  return <Tafereel key={p.nr} {...p} />;
}

/** De lijntekening op de verzamelkaart (244 × 190): een grote en een kleine pannenkoek. */
export function KaartRekentaal() {
  return (
    <g fill="none" stroke="#e6e8ee" strokeWidth={3.2} strokeLinecap="round">
      <circle cx="88" cy="100" r="62" />
      <circle cx="88" cy="100" r="46" strokeWidth={2} />
      <circle cx="190" cy="132" r="30" />
      <circle cx="190" cy="132" r="21" strokeWidth={2} />
      <path d="M20 168 H224" />
    </g>
  );
}
