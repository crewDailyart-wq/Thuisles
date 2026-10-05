"use client";

/**
 * Groepjes maken met bolletjes die als magneetjes tegen elkaar klikken.
 *
 * Bij een deelsom als 20 : 4 liggen er 20 egale bolletjes in een kring in het
 * midden. Het kind maakt er groepjes van 4 van:
 *
 *   slepen    een los bolletje tegen een ander bolletje aan: ze klikken aan
 *             elkaar vast en krijgen een andere kleur. Een klontje sleep je als
 *             geheel aan de ruimte om de bolletjes heen.
 *   tikken    een bolletje aantikken en daarna een ander: het tweede springt
 *             tegen het eerste aan. Voor wie slepen moeilijk vindt.
 *   losmaken  een bolletje uit een klontje slepen dat nog niet vol is.
 *
 * Een groepje is vol bij precies zoveel bolletjes als het getal waardoor je
 * deelt. Dan komt er een zachte cirkel omheen en blijft het liggen. Een
 * bolletje extra tegen een vol groepje stuitert zacht terug. Er staat nergens
 * een teller: het kind telt de groepjes zelf.
 *
 * Alles blijft binnen het eigen vak, dus nooit buiten het scherm en nooit over
 * de som of de knoppen. Groepjes liggen nooit over elkaar: na elke zet worden
 * ze uit elkaar geschoven, waarbij een vol groepje blijft waar het ligt.
 *
 * Een bolletje is 48 pixels, groot genoeg voor een vinger. Het werkt met
 * pointer-events, dus met muis, touchpad en vinger op dezelfde manier.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/** Middellijn van een bolletje, en de afstand tussen twee die tegen elkaar liggen. */
const MAAT = 48;
const R = MAAT / 2;
const STAP = MAAT + 2;
/** Zo dichtbij moet een bolletje komen om vast te klikken. */
const RAAKAFSTAND = MAAT + 14;
/** Vanaf zoveel pixels beweging is een aanraking slepen in plaats van tikken. */
const SLEEPDREMPEL = 6;
/** Ruimte tussen twee groepjes die naast elkaar liggen. */
const LUCHT = 10;

type Groep = { id: number; leden: number[]; x: number; y: number };
type Punt = { x: number; y: number };

/** Waar de bolletjes van een klontje liggen ten opzichte van het midden: zo compact mogelijk. */
function vormVan(n: number): Punt[] {
  if (n <= 1) return [{ x: 0, y: 0 }];
  const kolommen = n <= 3 ? n : n === 4 ? 2 : n <= 9 ? 3 : 4;
  const rijen = Math.ceil(n / kolommen);
  const uit: Punt[] = [];
  for (let i = 0; i < n; i++) {
    const rij = Math.floor(i / kolommen);
    const inRij = rij === rijen - 1 ? n - rij * kolommen : kolommen;
    const kol = i % kolommen;
    uit.push({ x: (kol - (inRij - 1) / 2) * STAP, y: (rij - (rijen - 1) / 2) * STAP });
  }
  return uit;
}

/** Hoe ver een klontje van zijn midden reikt. */
function straalVan(n: number): number {
  return Math.max(...vormVan(n).map((p) => Math.hypot(p.x, p.y))) + R;
}

/**
 * De beginstand: losse bolletjes verspreid in een kring in het midden, nooit
 * over elkaar. Een zonnebloempatroon, zo ver uit elkaar dat er overal minstens
 * een vingerbreedte tussen zit, en zo nodig wat platter gedrukt als het vak
 * smal is.
 */
function beginstand(n: number, breedte: number): { punten: Punt[]; hoogte: number } {
  const afstand = MAAT + 12;
  let c = 20;
  let punten: Punt[] = [];
  const kortste = (ps: Punt[]) => {
    let k = Infinity;
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) k = Math.min(k, Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y));
    return k;
  };
  for (; c < 200; c += 1) {
    punten = Array.from({ length: n }, (_, i) => {
      const r = c * Math.sqrt(i + 0.5);
      const hoek = i * 2.39996;
      return { x: r * Math.cos(hoek), y: r * Math.sin(hoek) };
    });
    if (kortste(punten) >= afstand) break;
  }
  /* Past de kring niet in de breedte, dan smaller en hoger tot alles weer vrij ligt. */
  const halveBreedte = Math.max(...punten.map((p) => Math.abs(p.x))) + R;
  const ruimte = breedte / 2 - 8;
  if (halveBreedte > ruimte) {
    const f = ruimte / halveBreedte;
    let rek = 1 / f;
    let platter = punten.map((p) => ({ x: p.x * f, y: p.y * rek }));
    while (kortste(platter) < afstand && rek < 6) {
      rek += 0.05;
      platter = punten.map((p) => ({ x: p.x * f, y: p.y * rek }));
    }
    punten = platter;
  }
  const boven = Math.min(...punten.map((p) => p.y)) - R;
  const onder = Math.max(...punten.map((p) => p.y)) + R;
  /* Ruimte erboven en eronder om groepjes neer te leggen. */
  const marge = 20;
  const hoogte = Math.max(240, onder - boven + 2 * marge);
  const midden = { x: breedte / 2, y: hoogte / 2 - (boven + onder) / 2 };
  return { punten: punten.map((p) => ({ x: p.x + midden.x, y: p.y + midden.y })), hoogte };
}

function minderBeweging(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function Bolletjes({
  geheel,
  deler,
  uit,
  oplichten,
  onKlaar,
}: {
  geheel: number;
  deler: number;
  /** Nagekeken: niets meer te verschuiven. */
  uit: boolean;
  /** Na een goed antwoord: de groepjes lichten één voor één op. */
  oplichten: boolean;
  /** Of alle bolletjes in volle groepjes zitten. */
  onKlaar: (klaar: boolean) => void;
}) {
  const vak = useRef<HTMLDivElement | null>(null);
  const [breedte, setBreedte] = useState(0);
  const [groepen, setGroepen] = useState<Groep[]>([]);
  const [hoogte, setHoogte] = useState(240);
  const [gekozen, setGekozen] = useState<number | null>(null);
  /** Wat er nu gesleept wordt, en waar het begon. */
  const [sleep, setSleep] = useState<{ groep: number; x: number; y: number } | null>(null);
  const [raak, setRaak] = useState<number | null>(null);
  /** Bolletjes die net vastklikten, en groepjes die terugstuiteren: voor de korte beweging. */
  const [klik, setKlik] = useState<Record<number, number>>({});
  const [stuiter, setStuiter] = useState<Record<number, number>>({});
  const volgendId = useRef(geheel);
  /* De stand van nu, voor de aanraak-handlers; `zetGroepen` houdt hem gelijk met de state. */
  const stand = useRef<Groep[]>([]);
  const zetGroepen = (g: Groep[]) => {
    stand.current = g;
    setGroepen(g);
  };
  const beweegteller = useRef(1);
  const aanraking = useRef<{
    bal: number;
    groep: number;
    start: Punt;
    begin: Punt;
    losgemaakt: boolean;
    gesleept: boolean;
    alsGeheel: boolean;
  } | null>(null);

  const beweging = minderBeweging() ? "none" : "transform 300ms cubic-bezier(0.3, 0.8, 0.4, 1)";

  /*
    De breedte van het vak volgen. De eerste meting geeft de beginstand; een
    latere (ander scherm, tablet gedraaid) zet alles weer binnen het vak.
  */
  useLayoutEffect(() => {
    const el = vak.current;
    if (!el) return;
    const meet = () => {
      const b = el.clientWidth;
      if (b === 0) return;
      setBreedte(b);
      const oud = stand.current;
      if (oud.length > 0) {
        stand.current = oud.map((g) => {
          const r = straalVan(g.leden.length);
          return { ...g, x: Math.min(Math.max(g.x, r), b - r) };
        });
      } else {
        const { punten, hoogte: h } = beginstand(geheel, b);
        setHoogte(h);
        stand.current = punten.map((p, i) => ({ id: i, leden: [i], x: p.x, y: p.y }));
      }
      setGroepen(stand.current);
    };
    const kijker = new ResizeObserver(meet);
    kijker.observe(el);
    return () => kijker.disconnect();
  }, [geheel]);

  const vol = useCallback((g: Groep) => g.leden.length === deler, [deler]);
  const klaar = groepen.length > 0 && groepen.every(vol);
  useEffect(() => onKlaar(klaar), [klaar, onKlaar]);

  /** Waar elk bolletje ligt. */
  const plekken = useMemo(() => {
    const uit = new Map<number, { x: number; y: number; groep: Groep }>();
    for (const g of groepen) {
      const vorm = vormVan(g.leden.length);
      g.leden.forEach((bal, i) => uit.set(bal, { x: g.x + vorm[i].x, y: g.y + vorm[i].y, groep: g }));
    }
    return uit;
  }, [groepen]);

  /* Een bolletje in een vol groepje kan niet meer gekozen zijn. */
  const gekozenPlek = gekozen === null ? undefined : plekken.get(gekozen);
  const actief = gekozenPlek && !(vol(gekozenPlek.groep) && deler > 1) ? gekozen : null;

  function binnen(g: Groep, b = breedte, h = hoogte): Groep {
    const r = straalVan(g.leden.length);
    return { ...g, x: Math.min(Math.max(g.x, r), b - r), y: Math.min(Math.max(g.y, r), h - r) };
  }

  /**
   * Groepjes uit elkaar schuiven tot er niets meer overlapt. Een vol groepje
   * blijft liggen; `vast` (het groepje waar net iets bij kwam) ook, zodat het
   * blijft waar het kind het maakte.
   */
  function uitElkaar(lijst: Groep[], vast: number | null, beweger: number | null): Groep[] {
    const gs = lijst.map((g) => ({ ...g }));
    for (let ronde = 0; ronde < 60; ronde++) {
      let verschoven = false;
      for (let i = 0; i < gs.length; i++) {
        for (let j = i + 1; j < gs.length; j++) {
          const a = gs[i];
          const b = gs[j];
          const nodig = straalVan(a.leden.length) + straalVan(b.leden.length) + LUCHT;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          if (d >= nodig) continue;
          if (d < 0.01) {
            dx = 1;
            dy = 0;
            d = 1;
          }
          const stilA = a.id === vast || vol(a) || (beweger !== null && b.id === beweger);
          const stilB = b.id === vast || vol(b) || (beweger !== null && a.id === beweger);
          const duw = nodig - d;
          const ux = dx / d;
          const uy = dy / d;
          if (stilA && !stilB) {
            b.x += ux * duw;
            b.y += uy * duw;
          } else if (stilB && !stilA) {
            a.x -= ux * duw;
            a.y -= uy * duw;
          } else {
            a.x -= (ux * duw) / 2;
            a.y -= (uy * duw) / 2;
            b.x += (ux * duw) / 2;
            b.y += (uy * duw) / 2;
          }
          gs[i] = binnen(a);
          gs[j] = binnen(b);
          verschoven = true;
        }
      }
      if (!verschoven) break;
    }
    return gs;
  }

  /** Een bolletje dat net vastklikte: een korte "klik". */
  function laatKlikken(ballen: number[]) {
    const nu = beweegteller.current++;
    setKlik((k) => ({ ...k, ...Object.fromEntries(ballen.map((b) => [b, nu])) }));
  }
  function laatStuiteren(groep: number) {
    const nu = beweegteller.current++;
    setStuiter((s) => ({ ...s, [groep]: nu }));
  }

  /** Groepje `los` bij groepje `doel` voegen, als het past. Geeft terug of het lukte. */
  function voegSamen(lijst: Groep[], losId: number, doelId: number): Groep[] | null {
    const los = lijst.find((g) => g.id === losId);
    const doel = lijst.find((g) => g.id === doelId);
    if (!los || !doel || los === doel) return null;
    if (doel.leden.length + los.leden.length > deler) return null;
    const samen = binnen({ ...doel, leden: [...doel.leden, ...los.leden] });
    const rest = lijst.filter((g) => g.id !== losId && g.id !== doelId);
    laatKlikken(los.leden);
    return uitElkaar([...rest, samen], samen.id, null);
  }

  /** Eén bolletje uit zijn klontje halen, als een eigen los groepje op dezelfde plek. */
  function maakLos(lijst: Groep[], bal: number): { lijst: Groep[]; nieuw: number } {
    const plek = plekken.get(bal);
    const oud = lijst.find((g) => g.leden.includes(bal));
    if (!plek || !oud || oud.leden.length === 1) return { lijst, nieuw: oud?.id ?? -1 };
    const nieuw = volgendId.current++;
    const rest = { ...oud, leden: oud.leden.filter((b) => b !== bal) };
    return {
      lijst: [...lijst.filter((g) => g.id !== oud.id), rest, { id: nieuw, leden: [bal], x: plek.x, y: plek.y }],
      nieuw,
    };
  }

  /** Welk ander groepje raakt het groepje op deze plek? */
  function zoekRaak(lijst: Groep[], groepId: number): number | null {
    const zelf = lijst.find((g) => g.id === groepId);
    if (!zelf) return null;
    const mijn = vormVan(zelf.leden.length).map((p) => ({ x: zelf.x + p.x, y: zelf.y + p.y }));
    let beste: { id: number; d: number } | null = null;
    for (const g of lijst) {
      if (g.id === groepId) continue;
      const vorm = vormVan(g.leden.length);
      for (const p of vorm) {
        for (const m of mijn) {
          const d = Math.hypot(g.x + p.x - m.x, g.y + p.y - m.y);
          if (d < RAAKAFSTAND && (!beste || d < beste.d)) beste = { id: g.id, d };
        }
      }
    }
    return beste?.id ?? null;
  }

  // -------------------------------------------------------------------------
  // Aanraken, slepen en loslaten
  // -------------------------------------------------------------------------

  function vakPunt(e: React.PointerEvent): Punt {
    const r = vak.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  }

  function begin(e: React.PointerEvent, bal: number, alsGeheel: boolean) {
    if (uit) return;
    const plek = plekken.get(bal);
    if (!plek) return;
    e.preventDefault();
    vak.current?.setPointerCapture(e.pointerId);
    aanraking.current = {
      bal,
      groep: plek.groep.id,
      start: vakPunt(e),
      begin: { x: plek.groep.x, y: plek.groep.y },
      losgemaakt: false,
      gesleept: false,
      alsGeheel,
    };
  }

  function beweeg(e: React.PointerEvent) {
    const a = aanraking.current;
    if (!a) return;
    const p = vakPunt(e);
    const dx = p.x - a.start.x;
    const dy = p.y - a.start.y;
    if (!a.gesleept && Math.hypot(dx, dy) < SLEEPDREMPEL) return;

    let gs = stand.current;
    const eigen = gs.find((g) => g.id === a.groep);
    if (!eigen) return;
    /* Een vol groepje blijft liggen. */
    if (vol(eigen) && eigen.leden.length > 1) return;
    if (!a.gesleept) {
      a.gesleept = true;
      setGekozen(null);
      /* Een bolletje uit een klontje slepen maakt het los; aan de rand pak je het hele klontje. */
      if (!a.alsGeheel && eigen.leden.length > 1) {
        const plek = plekken.get(a.bal);
        const los = maakLos(gs, a.bal);
        gs = los.lijst;
        a.groep = los.nieuw;
        a.losgemaakt = true;
        if (plek) a.begin = { x: plek.x, y: plek.y };
      }
      setSleep({ groep: a.groep, x: a.begin.x, y: a.begin.y });
    }
    const verplaatst = gs.map((g) => (g.id === a.groep ? binnen({ ...g, x: a.begin.x + dx, y: a.begin.y + dy }) : g));
    setRaak(zoekRaak(verplaatst, a.groep));
    zetGroepen(verplaatst);
  }

  function einde() {
    const a = aanraking.current;
    aanraking.current = null;
    if (!a) return;
    if (!a.gesleept) {
      tik(a.bal);
      return;
    }
    setSleep(null);
    setRaak(null);
    const lijst = stand.current;
    const doel = zoekRaak(lijst, a.groep);
    if (doel !== null) {
      const samen = voegSamen(lijst, a.groep, doel);
      if (samen) {
        zetGroepen(samen);
        return;
      }
      /* Past niet: zacht terug naar waar het vandaan kwam. */
      laatStuiteren(a.groep);
      const terug = lijst.map((g) => (g.id === a.groep ? binnen({ ...g, x: a.begin.x, y: a.begin.y }) : g));
      zetGroepen(uitElkaar(terug, null, a.groep));
      return;
    }
    /* Losgelaten in de ruimte: blijft liggen, maar nooit over een ander groepje. */
    zetGroepen(uitElkaar(lijst, null, a.groep));
  }

  /** Tikken: eerst een bolletje kiezen, dan een ander dat ertegenaan springt. */
  function tik(bal: number) {
    const plek = plekken.get(bal);
    if (!plek) return;
    if (vol(plek.groep) && deler > 1) {
      laatStuiteren(plek.groep.id);
      setGekozen(null);
      return;
    }
    if (actief === null || actief === bal) {
      setGekozen(actief === bal ? null : bal);
      return;
    }
    const doelPlek = plekken.get(actief);
    if (!doelPlek || doelPlek.groep.id === plek.groep.id) {
      setGekozen(bal);
      return;
    }
    if (vol(doelPlek.groep)) {
      laatStuiteren(plek.groep.id);
      setGekozen(null);
      return;
    }
    /* Is het groepje daarna vol, dan telt de keuze vanzelf niet meer (`actief`). */
    const los = maakLos(stand.current, bal);
    const samen = voegSamen(los.lijst, los.nieuw, doelPlek.groep.id);
    if (samen) zetGroepen(samen);
  }

  // -------------------------------------------------------------------------
  // Tekenen
  // -------------------------------------------------------------------------

  const volleGroepen = groepen.filter(vol);

  return (
    <div
      ref={vak}
      className="relative w-full touch-manipulation select-none overflow-hidden rounded-3xl"
      style={{ height: hoogte }}
      onPointerMove={beweeg}
      onPointerUp={einde}
      onPointerCancel={einde}
    >
      {/* De zachte cirkel om een vol groepje, en de greep om een klontje als geheel te slepen. */}
      {groepen.map((g) => {
        const r = straalVan(g.leden.length) + 10;
        const isVol = vol(g) && deler > 1;
        if (g.leden.length < 2) return null;
        const volgorde = volleGroepen.findIndex((v) => v.id === g.id);
        return (
          <div
            key={`rand-${g.id}`}
            aria-hidden="true"
            onPointerDown={isVol ? undefined : (e) => begin(e, g.leden[0], true)}
            className={`absolute left-0 top-0 rounded-full ${
              isVol
                ? `border-2 border-huisstijl/30 bg-huisstijl-zacht ${oplichten ? "motion-safe:animate-groepje-licht" : ""}`
                : "cursor-grab touch-none"
            } ${raak === g.id ? "ring-4 ring-huisstijl/40" : ""}`}
            style={{
              width: 2 * r,
              height: 2 * r,
              transform: `translate(${g.x - r}px, ${g.y - r}px)`,
              transition: sleep?.groep === g.id ? "none" : beweging,
              animationDelay: oplichten && volgorde >= 0 ? `${volgorde * 350}ms` : undefined,
            }}
          />
        );
      })}

      {/* De bolletjes zelf. */}
      {Array.from({ length: geheel }, (_, bal) => {
        const plek = plekken.get(bal);
        if (!plek) return null;
        const inKlontje = plek.groep.leden.length > 1;
        const isVol = vol(plek.groep) && deler > 1;
        const kiest = actief === bal;
        const geraakt = raak === plek.groep.id;
        return (
          <button
            key={`${bal}-${klik[bal] ?? 0}-${stuiter[plek.groep.id] ?? 0}`}
            type="button"
            aria-label={
              isVol ? "Bolletje in een vol groepje" : kiest ? "Gekozen bolletje" : inKlontje ? "Bolletje in een groepje" : "Los bolletje"
            }
            aria-pressed={kiest}
            disabled={uit}
            onPointerDown={(e) => begin(e, bal, false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tik(bal);
              }
            }}
            className="absolute left-0 top-0 touch-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-lucht disabled:cursor-default"
            style={{
              width: MAAT,
              height: MAAT,
              transform: `translate(${plek.x - R}px, ${plek.y - R}px)`,
              transition: sleep?.groep === plek.groep.id ? "none" : beweging,
              zIndex: sleep?.groep === plek.groep.id ? 2 : 1,
              cursor: uit || isVol ? "default" : "grab",
            }}
          >
            <span
              className={`block size-full rounded-full transition-[background-color,box-shadow] duration-150 ${
                isVol ? "bg-huisstijl-diep" : inKlontje ? "bg-huisstijl-diep" : "bg-huisstijl"
              } ${kiest ? "ring-4 ring-inkt/70 ring-offset-2" : ""} ${geraakt ? "brightness-110" : ""} ${
                klik[bal] ? "motion-safe:animate-bolletje-klik" : ""
              } ${stuiter[plek.groep.id] ? "motion-safe:animate-bolletje-stuiter" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
