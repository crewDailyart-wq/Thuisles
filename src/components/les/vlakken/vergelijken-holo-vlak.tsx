"use client";

/**
 * Vergelijken als hologrammen in Bliepo's ruimte (27 oktober 2026,
 * LESSENPLAN.md G7–G11, wereld Aarde). Vervangt voor de draaiboeken de oude
 * vlakken `vergelijken-kaarten.tsx` en `vergelijken-getallen.tsx` (die
 * blijven bestaan). Eén vlak voor de hele les, zodat de hologrammen niet
 * steeds opnieuw beginnen:
 *
 * - **Potjes**: twee glazen potjes (2 × 3 of 2 × 5 plekken) met vuurvliegjes,
 *   zoals de vakjeskaarten van Synthesis. Eventueel een teken ertussen.
 * - **Lantaarns**: getallen in lantaarntjes met een teken ertussen ("6 ? 3"),
 *   of drie lantaarntjes met een vraagteken (tekens ontdekken).
 *
 * Wat het kind kan doen, zet het draaiboek aan met props; het vlak meldt:
 *   `vakje`   {kant, links, rechts}       een plekje aan/uit (prop `tik`)
 *   `tel`     {kant, n, klaar}            samen tellen (prop `teller`)
 *   `teken`   {s, index}                  het teken wisselt = → > → <
 *   `rol`     {index, n}                  een getal rolt verder (1 … 9)
 *   `klaar`   {gekozen, links, rechts, teken, delen, waarde}  het vinkje
 *   `keuze`   {keuze}                     een keuzeknop
 *   `weetniet`                            het vraagteken-knopje
 *   `hand`                                het hulphandje
 * De knoppen hebben `data-knop` (vink, weetniet, hand, keuzes) zodat Bliepo
 * ze kan aanwijzen. Getallen typen gaat in een echt invulvak in de lantaarn
 * (HARDE REGEL 5).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Vlakbasis } from "../soort";
import { getalkleur } from "../tegels";
import { HOLO_CANVAS, useHoloMotor } from "../holo/motor";
import { KeuzeKnoppen } from "../holo/keuzes";
import { GOED, WARM } from "../holo/basis";
import { IkoonTeken } from "../ikonen";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import {
  KLEUR_CSS,
  maakVergelijkScene,
  MIDDEN_X,
  plek,
  POT_X,
  potMaat,
  type Kant,
  type Kleur,
  type Plek,
  type Ring,
  type Teken,
  type TekenPlek,
  type Vak,
  type VergelijkScene,
} from "./vergelijken-holo-scene";
import s from "./vergelijken-holo.module.css";

export type { Kant, Kleur, Vak, Teken };

export type Deel =
  | { t: "getal"; n: number; rol?: boolean; maat?: number }
  | { t: "teken"; s: Teken; tik?: boolean; lamp?: boolean }
  | { t: "vraag" };

export type HoloProps = {
  /** Nieuwe opgave: het vlak neemt alles opnieuw over (vakjes, teken, delen). */
  zet: number;
  /** Hoe de vuurvliegjes bij deze zet bewegen: nieuw (invliegen) of zak (netjes naar onderen glijden). */
  overgang?: "nieuw" | "zak";
  links?: Vak[] | null;
  rechts?: Vak[] | null;
  /** Het teken tussen de potjes. */
  teken?: Teken | null;
  tekenTik?: boolean;
  /** Getallen en tekens in lantaarntjes (in plaats van de potjes). */
  delen?: Deel[] | null;
  stip?: "klein" | "groot" | null;
  /** Op een potje tikken kiest het (lichtringen); het vinkje bevestigt. */
  kies?: boolean;
  telKleur?: Kleur | null;
  /** Alleen deze kleur laten zien; de andere vliegjes worden even heel zwak. */
  alleen?: Kleur | null;
  /** Lichtringen om de vliegjes van deze kant (en eventueel alleen deze kleur). */
  kader?: { kant: Kant; kleur?: Kleur } | null;
  tik?: Kant | "beide" | null;
  kleurLinks?: Kleur;
  kleurRechts?: Kleur;
  /** De aantallen groot boven de potjes. */
  aantallen?: boolean;
  /** Een licht pijltje onder het potje dat het kind mag veranderen. */
  pijl?: Kant | null;
  /** Samen tellen: het kind tikt de vliegjes van deze kant één voor één aan. */
  teller?: Kant | null;
  vink?: boolean;
  hand?: boolean;
  weetniet?: boolean;
  keuzes?: (number | string)[] | null;
  uit?: (number | string)[];
  goedeKeuze?: number | string | null;
  /** Het vraagteken in een lantaarn is een invulvak. */
  invoer?: boolean;
  /** Hulp: elke nieuwe waarde laat de vuurvliegjes netjes naar onderen zakken (zoals een toren). */
  zak?: number;
  /** Een lichtgolf of zacht schudden; elke nieuwe `n` speelt hem één keer. */
  effect?: { soort: "golf" | "schud"; waar: Kant | "midden"; n: number } | null;
};

const WISSEL: Record<Teken, Teken> = { "?": "=", "=": ">", ">": "<", "<": "=" };
const LAMP_Y = 330;
const LAMP_STAP = 250;
const TEKEN_Y_POT = 236;

function telVol(v: Vak[], kleur?: Kleur | null) {
  return v.filter((k) => (kleur ? k === kleur : k !== "")).length;
}

/** Dezelfde vuurvliegjes, netjes van onderen gevuld (links eerst); de kleur `eerst` komt onderaan. */
function onderaan(v: Vak[], eerst: Kleur | null): Vak[] {
  const vol = v.filter((k) => k !== "").sort((a, b) => (eerst ? Number(b === eerst) - Number(a === eerst) : 0));
  const uit: Vak[] = Array(v.length).fill("");
  const rijen = v.length / 2;
  let k = 0;
  for (let r = rijen - 1; r >= 0; r--) for (const c of [0, 1]) if (k < vol.length) uit[r * 2 + c] = vol[k++];
  return uit;
}

/** Waar de gele stipjes komen bij een teken met midden (x, y) en maat d. */
function stipPlekken(teken: Teken, stip: "klein" | "groot", x: number, y: number, d: number): Plek[] {
  if (teken !== "<" && teken !== ">") return [];
  const punt = teken === "<" ? -1 : 1;
  if (stip === "klein") return [{ x: x + punt * (d * 0.36 + 26), y }];
  return [
    { x: x - punt * (d * 0.3 + 22), y: y - d * 0.44 },
    { x: x - punt * (d * 0.3 + 22), y: y + d * 0.44 },
  ];
}

function HandTeken() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden>
      <path
        d="M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z"
        fill="currentColor"
      />
    </svg>
  );
}

export function VergelijkenHolo(p: HoloProps & Vlakbasis) {
  const {
    zet,
    overgang,
    links = null,
    rechts = null,
    teken = null,
    tekenTik = false,
    delen = null,
    stip = null,
    kies = false,
    telKleur = null,
    alleen = null,
    kader = null,
    tik = null,
    kleurLinks = "blauw",
    kleurRechts = "geel",
    aantallen = false,
    pijl = null,
    teller = null,
    vink = false,
    hand = false,
    weetniet = false,
    keuzes = null,
    uit = [],
    goedeKeuze = null,
    invoer = false,
    effect = null,
    zak = 0,
    meld,
    schaal,
  } = p;
  const { plek: canvasPlek, scene } = useHoloMotor<VergelijkScene>(schaal, maakVergelijkScene());
  const { bijAandacht, bijWeggaan } = useInBeeld();

  /* ---------- wat het kind verandert; opnieuw bij elke zet ---------- */
  const [vakjes, setVakjes] = useState({ links: links ?? [], rechts: rechts ?? [] });
  const [tk, setTk] = useState<Teken | null>(teken);
  const [nu, setNu] = useState<Deel[]>(delen ?? []);
  const [gekozen, setGekozen] = useState<Kant | null>(null);
  const [geteld, setGeteld] = useState<{ links: number[]; rechts: number[]; aan: boolean }>({ links: [], rechts: [], aan: false });
  const [waarde, setWaarde] = useState("");
  const [vorigeZet, setVorigeZet] = useState(zet);
  if (zet !== vorigeZet) {
    setVorigeZet(zet);
    setVakjes({ links: links ?? [], rechts: rechts ?? [] });
    setTk(teken);
    setNu(delen ?? []);
    setGekozen(null);
    setGeteld({ links: [], rechts: [], aan: false });
    setWaarde("");
  }
  /* Teller aan: de getallen boven de potjes blijven staan tot de volgende zet. */
  if (teller && !geteld.aan) setGeteld({ ...geteld, aan: true });
  /* Het draaiboek mag ook binnen een zet de vliegjes (alleen) of het teken vervangen. */
  const [vorigeLinks, setVorigeLinks] = useState(links);
  const [vorigeRechts, setVorigeRechts] = useState(rechts);
  if (links !== vorigeLinks || rechts !== vorigeRechts) {
    setVorigeLinks(links);
    setVorigeRechts(rechts);
    if (zet === vorigeZet) setVakjes({ links: links ?? [], rechts: rechts ?? [] });
  }
  const [vorigTeken, setVorigTeken] = useState(teken);
  if (teken !== vorigTeken) {
    setVorigTeken(teken);
    if (zet === vorigeZet) setTk(teken);
  }
  const [vorigeDelen, setVorigeDelen] = useState(delen);
  if (delen !== vorigeDelen) {
    setVorigeDelen(delen);
    if (zet === vorigeZet) setNu(delen ?? []);
  }

  /* Hulp: de vuurvliegjes zakken naar onderen (eerst de kleur waar het om gaat). */
  const [vorigeZak, setVorigeZak] = useState(zak);
  if (zak !== vorigeZak) {
    setVorigeZak(zak);
    setVakjes((v) => ({ links: onderaan(v.links, alleen), rechts: onderaan(v.rechts, alleen) }));
  }

  /*
    Na een antwoord (vinkje, keuze, weet ik niet, handje) staat de bediening
    even op slot tot het draaiboek de volgende stap zet; zo telt een tweede
    tik niet en ziet het kind meteen dat zijn antwoord binnen is.
  */
  const [bezig, setBezig] = useState(false);
  const vraagSleutel = JSON.stringify([zet, vink, keuzes, uit, weetniet, hand, kies, tik, invoer, tekenTik]);
  const [vorigeSleutel, setVorigeSleutel] = useState(vraagSleutel);
  if (vraagSleutel !== vorigeSleutel) {
    setVorigeSleutel(vraagSleutel);
    setBezig(false);
  }
  /* Vangnet: komt er geen volgende stap (het draaiboek luisterde net niet), dan na even weer open. */
  useEffect(() => {
    if (!bezig) return;
    const klok = setTimeout(() => setBezig(false), 3000);
    return () => clearTimeout(klok);
  }, [bezig]);
  const antwoord = (g: Parameters<typeof meld>[0]) => {
    setBezig(true);
    meld(g);
  };

  const metPotjes = links !== null && rechts !== null;
  const rijen = metPotjes ? Math.ceil(Math.max(vakjes.links.length, vakjes.rechts.length) / 2) : null;
  const maat = rijen ? potMaat(rijen) : null;
  const metLampen = !metPotjes && nu.length > 0;
  const lampStart = MIDDEN_X - ((nu.length - 1) * LAMP_STAP) / 2;

  /* ---------- de scène bijwerken ---------- */

  useEffect(() => {
    scene?.potjes(rijen);
  }, [scene, rijen]);

  const syncZet = useRef<number | null>(null);
  const syncZak = useRef(zak);
  useEffect(() => {
    if (!scene || !rijen) return;
    const wijze = syncZet.current !== zet ? (overgang ?? "nieuw") : syncZak.current !== vorigeZak ? "zak" : "diff";
    syncZet.current = zet;
    syncZak.current = vorigeZak;
    scene.vliegjes("links", vakjes.links, wijze, alleen);
    scene.vliegjes("rechts", vakjes.rechts, wijze, alleen);
    /* `overgang` hoort bij de zet; niet opnieuw afspelen als alleen dat verandert. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, rijen, vakjes, alleen, zet, vorigeZak]);

  const ringLijst = useMemo<Ring[]>(() => {
    if (!rijen || !maat) return [];
    const uit: Ring[] = [];
    const r = maat.cel * 0.46;
    const getoond = kies ? (gekozen ? { kant: gekozen, kleur: telKleur ?? undefined } : null) : kader;
    if (getoond) {
      vakjes[getoond.kant].forEach((k, i) => {
        if (k && (!getoond.kleur || k === getoond.kleur) && (!alleen || k === alleen)) uit.push({ ...plek(getoond.kant, rijen, i), r, kleur: WARM });
      });
    }
    for (const kant of ["links", "rechts"] as Kant[]) for (const i of geteld[kant]) uit.push({ ...plek(kant, rijen, i), r, kleur: GOED });
    return uit;
  }, [rijen, maat, kies, gekozen, telKleur, kader, vakjes, alleen, geteld]);
  useEffect(() => {
    scene?.ringen(ringLijst);
  }, [scene, ringLijst]);

  const tekenLijst = useMemo<TekenPlek[]>(() => {
    if (metPotjes) return tk ? [{ x: MIDDEN_X, y: TEKEN_Y_POT, s: tk, maat: 1 }] : [];
    return nu.flatMap((d, i) => (d.t === "teken" ? [{ x: lampStart + i * LAMP_STAP, y: LAMP_Y, s: d.s, maat: d.lamp ? 0.95 : 1.05 }] : []));
  }, [metPotjes, tk, nu, lampStart]);
  useEffect(() => {
    scene?.tekens(tekenLijst);
  }, [scene, tekenLijst]);

  const lampLijst = useMemo<Plek[]>(
    () => (metLampen ? nu.flatMap((d, i) => (d.t !== "teken" || d.lamp ? [{ x: lampStart + i * LAMP_STAP, y: LAMP_Y }] : [])) : []),
    [metLampen, nu, lampStart],
  );
  useEffect(() => {
    scene?.lantaarns(lampLijst);
  }, [scene, lampLijst]);

  const stipLijst = useMemo<Plek[]>(() => {
    if (!stip) return [];
    if (metPotjes) return tk ? stipPlekken(tk, stip, MIDDEN_X, TEKEN_Y_POT, 140) : [];
    const i = nu.findIndex((d) => d.t === "teken");
    const d = nu[i];
    return d && d.t === "teken" ? stipPlekken(d.s, stip, lampStart + i * LAMP_STAP, LAMP_Y, 147) : [];
  }, [stip, metPotjes, tk, nu, lampStart]);
  useEffect(() => {
    scene?.stippen(stipLijst);
  }, [scene, stipLijst]);

  const pijlLijst = useMemo<Plek[]>(() => {
    const uit: Plek[] = [];
    const onder = maat ? maat.onder + 30 + 26 : 0;
    if (maat && pijl) uit.push({ x: POT_X[pijl], y: onder });
    if (maat && teller) uit.push({ x: POT_X[teller], y: onder });
    if (metLampen) nu.forEach((d, i) => d.t === "getal" && d.rol && uit.push({ x: lampStart + i * LAMP_STAP, y: LAMP_Y + 165 }));
    return uit;
  }, [maat, pijl, teller, metLampen, nu, lampStart]);
  useEffect(() => {
    scene?.pijlen(pijlLijst);
  }, [scene, pijlLijst]);

  const effectN = useRef<number | null>(null);
  useEffect(() => {
    if (!scene || !effect || effectN.current === effect.n) return;
    effectN.current = effect.n;
    if (effect.soort === "golf") {
      const x = effect.waar === "midden" ? MIDDEN_X : POT_X[effect.waar];
      scene.golfOp(x, metLampen ? LAMP_Y : maat ? (effect.waar === "midden" ? TEKEN_Y_POT : 400) : 330);
    } else if (effect.waar === "midden") scene.schudTeken();
    else scene.schudPot(effect.waar);
  }, [scene, effect, metLampen, maat]);

  /* ---------- wat het kind doet ---------- */

  const zetVakje = (kant: Kant, i: number) => {
    const lijst = [...vakjes[kant]];
    lijst[i] = lijst[i] ? "" : kant === "links" ? kleurLinks : kleurRechts;
    const nieuw = { ...vakjes, [kant]: lijst };
    setVakjes(nieuw);
    meld({ soort: "vakje", kant, links: telVol(nieuw.links), rechts: telVol(nieuw.rechts) });
  };

  const tel = (kant: Kant, i: number) => {
    if (geteld[kant].includes(i)) return;
    const lijst = [...geteld[kant], i];
    setGeteld({ ...geteld, [kant]: lijst });
    meld({ soort: "tel", kant, n: lijst.length, klaar: lijst.length >= telVol(vakjes[kant], alleen) });
  };

  const tikDeel = (i: number) => {
    const d = nu[i];
    if (d.t === "getal" && d.rol) {
      const n = (d.n % 9) + 1;
      const nieuw = nu.map((x, j) => (j === i ? { ...d, n } : x));
      setNu(nieuw);
      meld({ soort: "rol", index: i, n, delen: nieuw });
    } else if (d.t === "teken" && d.tik) {
      const s2 = WISSEL[d.s];
      const nieuw = nu.map((x, j) => (j === i ? { ...d, s: s2 } : x));
      setNu(nieuw);
      meld({ soort: "teken", index: i, s: s2, delen: nieuw });
    }
  };

  const kanVink = kies ? gekozen !== null : invoer && nu.some((d) => d.t === "vraag") ? waarde !== "" : true;
  const druk = () => {
    if (!vink || !kanVink || bezig) return;
    antwoord({
      soort: "klaar",
      gekozen,
      links: telVol(vakjes.links),
      rechts: telVol(vakjes.rechts),
      teken: metPotjes ? tk : (nu.find((d) => d.t === "teken") as { s: Teken } | undefined)?.s ?? null,
      delen: nu,
      waarde: waarde === "" ? null : Number(waarde),
    });
  };

  /* Zeg het ook voor een voorleesprogramma. */
  const voorlezen = metPotjes
    ? `Links ${telVol(vakjes.links, alleen)}, rechts ${telVol(vakjes.rechts, alleen)}${tk ? `, teken ${tk === "?" ? "vraagteken" : tk}` : ""}`
    : nu.map((d) => (d.t === "getal" ? String(d.n) : d.t === "vraag" ? "vraagteken" : d.s === "?" ? "vraagteken" : d.s)).join(" ");

  /* Waar de knoppen staan: tussen de potjes, of onder de lantaarns. */
  const knoppenStijl: CSSProperties = metPotjes ? { left: MIDDEN_X, top: 596 } : { left: MIDDEN_X, top: 610 };
  const metWoorden = (keuzes ?? []).some((k) => typeof k === "string" && /[a-z]/i.test(k));
  const keuzeStijl: CSSProperties = metPotjes ? { left: MIDDEN_X, top: tk ? 340 : 300 } : { left: MIDDEN_X, top: metLampen ? 500 : 420 };

  /* Voor de automatische test (zoals window.__phaser.antwoord bij de flitsen): wat er nu staat. */
  const staat = JSON.stringify({ l: vakjes.links, r: vakjes.rechts, tk, nu, telKleur, alleen });

  return (
    <div className={s.vlak} data-staat={staat}>
      <div ref={canvasPlek} style={HOLO_CANVAS} aria-hidden />
      <span className="sr-only" aria-live="polite">
        {voorlezen}
      </span>

      {/* De potjes: tikvlakken over de getekende plekjes en potjes. */}
      {metPotjes &&
        maat &&
        rijen &&
        (["links", "rechts"] as Kant[]).map((kant) => {
          const magTik = tik === kant || tik === "beide";
          const magTel = teller === kant;
          /* Tikvlak zo groot als de ruimte rond het plekje (op de telefoon zo groot mogelijk). */
          const tikB = maat.cel + maat.gat + 2 * 6;
          const tikH = maat.cel + maat.gat;
          return (
            <div key={kant}>
              {kies && (
                <button
                  type="button"
                  className={`${s.pot} ${gekozen === kant ? s.gekozen : ""}`}
                  data-vgl-pot={kant}
                  aria-label={`Kies de groep ${kant}`}
                  aria-pressed={gekozen === kant}
                  style={{ left: POT_X[kant] - maat.buitenB / 2, top: maat.buitenBoven, width: maat.buitenB, height: maat.onder + 16 - maat.buitenBoven }}
                  disabled={bezig}
                  onClick={() => setGekozen(kant)}
                />
              )}
              {(magTik || magTel) &&
                vakjes[kant].map((k, i) => {
                  const pl = plek(kant, rijen, i);
                  const telbaar = magTel && k !== "" && (!alleen || k === alleen);
                  if (magTel && !telbaar) return null;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${s.plek} ${s.vierkant}`}
                      data-vgl-plek={`${kant}-${i}`}
                      data-vol={k !== ""}
                      aria-label={magTel ? "Vuurvliegje, tik om te tellen" : k ? "Vuurvliegje, tik om het weg te laten vliegen" : "Leeg plekje, tik voor een vuurvliegje"}
                      style={{ left: pl.x - tikB / 2, top: pl.y - tikH / 2, width: tikB, height: tikH }}
                      onClick={() => (magTel ? tel(kant, i) : zetVakje(kant, i))}
                    />
                  );
                })}
            </div>
          );
        })}

      {/* De getallen boven de potjes (aantallen, of de teller bij samen tellen). */}
      {metPotjes &&
        maat &&
        (aantallen || geteld.aan) &&
        (["links", "rechts"] as Kant[]).map((kant) => {
          const n = aantallen && !geteld.aan ? telVol(vakjes[kant], alleen) : geteld[kant].length;
          const kleur = (vakjes[kant].find((k) => k !== "" && (!alleen || k === alleen)) || (kant === "links" ? kleurLinks : kleurRechts)) as Kleur;
          return (
            <div key={`n-${kant}-${n}`} className={s.aantal} style={{ left: POT_X[kant], top: maat.buitenBoven - 58, color: KLEUR_CSS[kleur] }}>
              {n}
            </div>
          );
        })}

      {/* Het teken tussen de potjes (tikken wisselt het). */}
      {metPotjes && tk && tekenTik && (
        <button
          type="button"
          className={s.teken}
          data-knop="teken"
          aria-label="Teken, tik om te wisselen"
          style={{ left: MIDDEN_X - 75, top: TEKEN_Y_POT - 75 }}
          onClick={() => {
            const n = WISSEL[tk];
            setTk(n);
            meld({ soort: "teken", s: n, index: 0 });
          }}
        />
      )}

      {/* De lantaarns: getallen als scherpe tekst, het vraagteken als invulvak. */}
      {metLampen &&
        nu.map((d, i) => {
          const x = lampStart + i * LAMP_STAP;
          const kanTik = (d.t === "getal" && !!d.rol) || (d.t === "teken" && !!d.tik);
          if (d.t === "vraag" && invoer)
            return (
              <input
                key={`v${i}`}
                className={s.invul}
                style={{ left: x - 78, top: LAMP_Y - 72 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={2}
                aria-label="Typ een getal"
                data-knop="invul"
                value={waarde}
                onChange={(e) => setWaarde(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onFocus={(e) => bijAandacht(e.currentTarget)}
                onBlur={bijWeggaan}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    druk();
                  }
                }}
              />
            );
          return (
            <button
              key={`d${i}`}
              type="button"
              className={s.lamp}
              data-deel={i}
              data-knop={kanTik ? (d.t === "teken" ? "teken" : "rol") : undefined}
              tabIndex={kanTik ? 0 : -1}
              aria-hidden={kanTik ? undefined : true}
              aria-label={kanTik ? (d.t === "getal" ? `Getal ${d.n}, tik om te veranderen` : "Teken, tik om te wisselen") : undefined}
              style={{ left: x - 95, top: LAMP_Y - 110, cursor: kanTik ? "pointer" : "default" }}
              onClick={() => kanTik && tikDeel(i)}
            >
              {d.t === "getal" && (
                <span key={d.n} className={s.getal} style={{ color: getalkleur(d.n), fontSize: 132 * (d.maat ?? 1) }}>
                  {d.n}
                </span>
              )}
              {d.t === "vraag" && <span className={s.vraag}>?</span>}
            </button>
          );
        })}

      {/* Keuzes: cijfers of (voorgelezen) woorden. */}
      {keuzes && keuzes.length > 0 && (
        <div className={`${s.keuzes} ${metPotjes ? s.kolom : ""} ${metWoorden ? s.woorden : ""}`} style={keuzeStijl}>
          <KeuzeKnoppen opties={keuzes} uit={uit} goed={goedeKeuze} actief={!bezig} kies={(o) => antwoord({ soort: "keuze", keuze: o })} />
        </div>
      )}

      {/* Hulphandje, weet ik niet en het vinkje. */}
      {(vink || hand || weetniet) && (
        <div className={s.knoppen} style={knoppenStijl}>
          {hand && (
            <button type="button" className={`${s.rond} ${s.hand}`} data-knop="hand" aria-label="Hulp" disabled={bezig} onClick={() => antwoord({ soort: "hand" })}>
              <HandTeken />
            </button>
          )}
          {weetniet && (
            <button type="button" className={`${s.rond} ${s.weetniet}`} data-knop="weetniet" aria-label="Weet ik niet" disabled={bezig} onClick={() => antwoord({ soort: "weetniet" })}>
              <IkoonTeken ikoon="vraag" maat={40} />
            </button>
          )}
          {vink && (
            <button type="button" className={`${s.rond} ${s.vink}`} data-knop="vink" data-controleer aria-label="Controleer" disabled={!kanVink || bezig} onClick={druk}>
              <IkoonTeken ikoon="vink" maat={44} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
