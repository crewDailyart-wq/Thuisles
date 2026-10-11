"use client";

/**
 * Het scherm van een uitleg-les (oktober 2026), zo dicht mogelijk bij
 * Synthesis: links de tekst van de mascotte met daaronder wat het kind kan
 * doen, in het midden een groot raster, rechts de bak met tegels en bovenaan
 * (als die er is) de som. Linksonder een vaste plek voor de mascotte.
 *
 * Het draaiboek (zie `soort.ts`) stuurt alles via de gids `l`. Elke stap van
 * de gids wacht tot het kind iets doet. Getallen worden getypt in een echt
 * invulvak (HARDE REGEL 5), niet op een nagebouwd cijferveld.
 *
 * Schrijft niets naar de database.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { stopPraten, zegNaElkaar } from "@/lib/stem";
import { leesVoorkeuren, metUitspraak, type Lesvoorkeuren } from "./voorkeuren";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { getalkleur, hoogte, stapel, TEGELKLEUR, vorm, type Hokje } from "./tegels";
import type { Lesdraaiboek, Lesgids, Somdeel, Vlak, Vlakgebeurtenis } from "./soort";
import s from "./Lesscherm.module.css";

/* ---------- vaste maten van het speelvlak ---------- */

const B = 1280;
const H = 720;
const CEL = 66;
const KOLOMMEN = 12;
const RASTER_X = 322;
const BAK_X = 1200; // midden van de bak

function rasterMaat(metSom: boolean) {
  return metSom ? { y: 118, rijen: 8 } : { y: 63, rijen: 9 };
}

/* ---------- toestand ---------- */

type Stuk = { id: number; n: number; weg?: boolean };
type Torenstaat = { id: number; stukken: Stuk[]; draait?: boolean };
type Bediening =
  | null
  | { soort: "getal" }
  | { soort: "kies"; opties: string[] }
  | { soort: "verder" }
  | { soort: "somvak"; index: number };

type Beeld = {
  zinnen: string[];
  zichtbaar: number;
  praat: boolean;
  bediening: Bediening;
  bak: { tegels: number[]; om: boolean; slot: number[] };
  bakActief: boolean;
  hand: boolean;
  torens: Torenstaat[];
  som: Somdeel[] | null;
  tel: number;
  kaart: null | { afgevinkt: boolean };
  klaar: boolean;
  vlak: null | { comp: Vlak; props: object };
};

const BEGIN: Beeld = {
  zinnen: [],
  zichtbaar: 0,
  praat: false,
  bediening: null,
  bak: { tegels: [], om: false, slot: [] },
  bakActief: false,
  hand: false,
  torens: [],
  som: null,
  tel: 0,
  kaart: null,
  klaar: false,
  vlak: null,
};

type Wachters = {
  getal?: (v: number | null) => void;
  kies?: (v: string | null) => void;
  verder?: () => void;
  pak?: (n: number) => void;
  somvak?: (v: number) => void;
  kaart?: () => void;
  vlak?: (g: Vlakgebeurtenis) => void;
};

const STOP = Symbol("les gestopt");

/** De zin zonder de opmaaktekens, voor de stem. */
function kaal(zin: string): string {
  return zin.replace(/[{}*]/g, "").replace(/−/g, " min ");
}

/* ---------- waar staat wat ---------- */

/** De torens op het raster: per toren de kolom, de onderste rij en per stuk de hokjes. */
function legTorens(torens: Torenstaat[], rijen: number) {
  const starts = [5, 8, 2];
  const vormen = torens.map((t) => stapel(t.stukken.map((st) => st.n)));
  const hoogtes = vormen.map((v) => Math.max(1, ...v.flat().map((h) => h.r + 1)));
  const hoogst = Math.max(1, ...hoogtes);
  const onder = Math.min(rijen - 1, Math.floor((rijen + hoogst) / 2) - 1);
  return torens.map((t, i) => ({
    toren: t,
    kolom: starts[i] ?? 5,
    hoogte: hoogtes[i],
    boven: onder - hoogtes[i] + 1,
    hokjes: vormen[i],
  }));
}

/** De tegels in de bak: grootte en plek. */
function legBak(tegels: number[]) {
  const ruimte = 14;
  const rijen = tegels.reduce((a, n) => a + hoogte(n), 0);
  const c = Math.max(14, Math.min(40, Math.floor((620 - ruimte * Math.max(0, tegels.length - 1)) / Math.max(1, rijen))));
  const totaal = rijen * c + ruimte * Math.max(0, tegels.length - 1);
  let y = H / 2 - totaal / 2;
  return {
    c,
    plekken: tegels.map((n) => {
      const plek = { n, x: BAK_X - c, y, b: 2 * c, h: hoogte(n) * c };
      y += hoogte(n) * c + ruimte;
      return plek;
    }),
  };
}

/* ---------- kleine tekenstukjes ---------- */

function Hokjes({ n, hokjes, c, h, telVan, tel }: { n: number; hokjes: Hokje[]; c: number; h: number; telVan?: number; tel?: number }) {
  const kleur = TEGELKLEUR[n] ?? "#cccccc";
  const volgorde = [...hokjes].sort((a, b) => a.r - b.r || a.k - b.k);
  return (
    <>
      {hokjes.map((hk) => {
        const nr = telVan !== undefined ? telVan + volgorde.indexOf(hk) + 1 : 0;
        const geteld = !!tel && nr > 0 && nr <= tel;
        return (
          <div
            key={`${hk.k}-${hk.r}`}
            className={s.hokje}
            style={{ left: hk.k * c, top: (h - 1 - hk.r) * c, width: c, height: c, background: kleur }}
          >
            <div className={`${s.gat} ${geteld ? s.geteld : ""}`} style={geteld ? { fontSize: c * 0.32 } : undefined}>
              {geteld ? nr : ""}
            </div>
          </div>
        );
      })}
    </>
  );
}

function Tegel({ n, c }: { n: number; c: number }) {
  return (
    <div style={{ position: "relative", width: 2 * c, height: hoogte(n) * c }}>
      <Hokjes n={n} hokjes={vorm(n)} c={c} h={hoogte(n)} />
    </div>
  );
}

function Zin({ zin }: { zin: string }) {
  const delen = useMemo(() => {
    const uit: { soort: "woord" | "getal" | "nadruk"; tekst: string }[] = [];
    const re = /\{(\d+)\}([.,!?:]?)|\*([^*]+)\*([.,!?:]?)|(\S+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(zin))) {
      if (m[1] !== undefined) uit.push({ soort: "getal", tekst: m[1] }, ...(m[2] ? [{ soort: "woord" as const, tekst: m[2] }] : []));
      else if (m[3] !== undefined) uit.push({ soort: "nadruk", tekst: m[3] }, ...(m[4] ? [{ soort: "woord" as const, tekst: m[4] }] : []));
      else uit.push({ soort: "woord", tekst: m[5] });
    }
    return uit;
  }, [zin]);
  let woord = 0;
  return (
    <p>
      {delen.map((d, i) => {
        const plak = /^[.,!?:]$/.test(d.tekst) && d.soort === "woord";
        const vertraging = { animationDelay: `${(plak ? woord : woord++) * 70}ms` };
        const spatie = i < delen.length - 1 && !/^[.,!?:]$/.test(delen[i + 1].tekst) ? " " : "";
        if (d.soort === "getal")
          return (
            <span key={i} className={`${s.woord} ${s.getal}`} style={{ ...vertraging, color: getalkleur(Number(d.tekst)) }}>
              {d.tekst}
              {spatie}
            </span>
          );
        if (d.soort === "nadruk")
          return (
            <em key={i} className={s.woord} style={vertraging}>
              {d.tekst}
              {spatie}
            </em>
          );
        return (
          <span key={i} className={s.woord} style={vertraging}>
            {d.tekst}
            {spatie}
          </span>
        );
      })}
    </p>
  );
}

const Pijl = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
    <path d="M10 3v12M4.5 10l5.5 5.5 5.5-5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Vink = ({ maat = 20 }: { maat?: number }) => (
  <svg width={maat} height={maat} viewBox="0 0 20 20" aria-hidden>
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Een tegel als losse lijntekening, voor op de kaart. */
function Lijntegel({ n, x, y, c }: { n: number; x: number; y: number; c: number }) {
  const h = hoogte(n);
  const kleur = TEGELKLEUR[n] ?? "#ffffff";
  return (
    <g transform={`translate(${x} ${y})`} stroke={kleur} strokeWidth="3.2" fill="none" strokeLinejoin="round" strokeLinecap="round">
      {vorm(n).map((hk) => (
        <g key={`${hk.k}-${hk.r}`}>
          <rect x={hk.k * c + 1} y={(h - 1 - hk.r) * c + 1} width={c - 2} height={c - 2} rx="3" transform={`rotate(${(hk.k + hk.r) % 2 ? 1.5 : -1.5} ${hk.k * c + c / 2} ${(h - 1 - hk.r) * c + c / 2})`} />
          <ellipse cx={hk.k * c + c / 2} cy={(h - 1 - hk.r) * c + c / 2} rx={c * 0.2} ry={c * 0.22} />
        </g>
      ))}
    </g>
  );
}

/* ---------- het scherm ---------- */

/**
 * Een les afspelen. `onKlaar` komt één keer per keer spelen, na de kaart.
 * `terugHref`: waar "Stoppen" en "Terug" heen gaan (op de kinderkant).
 */
export function Lesspeler({
  les,
  naam = "",
  onKlaar,
  terugHref,
}: {
  les: Lesdraaiboek;
  naam?: string;
  onKlaar?: () => void;
  terugHref?: string;
}) {
  const [ronde, setRonde] = useState(0);
  return (
    <Lesscherm key={ronde} les={les} naam={naam} opnieuw={() => setRonde((r) => r + 1)} onKlaar={onKlaar} terugHref={terugHref} />
  );
}

function Lesscherm({
  les,
  naam,
  opnieuw,
  onKlaar,
  terugHref,
}: {
  les: Lesdraaiboek;
  naam: string;
  opnieuw: () => void;
  onKlaar?: () => void;
  terugHref?: string;
}) {
  const klaarMelding = useRef(onKlaar);
  useEffect(() => {
    klaarMelding.current = onKlaar;
  }, [onKlaar]);
  const [beeld, setBeeld] = useState<Beeld>(BEGIN);
  const wacht = useRef<Wachters>({});
  const [schaal, setSchaal] = useState(0);
  const [pauze, setPauze] = useState(false);
  const raster = useRef<HTMLDivElement>(null);
  const [sleep, setSleep] = useState<null | { n: number; x: number; y: number; vanX: number; vanY: number }>(null);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [handGezien, setHandGezien] = useState(false);
  /* Voorkeuren uit de les "Jouw instellingen"; pas na het laden gelezen (geen localStorage op de server). */
  const [voorkeuren, setVoorkeuren] = useState<Lesvoorkeuren | null>(null);

  /* Het vaste speelvlak zo groot als het scherm toelaat. */
  useEffect(() => {
    const meet = () => setSchaal(Math.min(window.innerWidth / B, window.innerHeight / H));
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, []);

  /* Het draaiboek afspelen. */
  useEffect(() => {
    let levend = true;
    let stopStem: (() => void) | null = null;
    let id = 0;
    /* Eén bron van waarheid binnen deze afspeelronde; het scherm volgt. */
    let staat = BEGIN;
    /* "Jouw instellingen" bewaart onderweg, dus steeds opnieuw gelezen. */
    const vk = () => leesVoorkeuren();
    const pas = (f: (b: Beeld) => Beeld) => {
      if (!levend) return;
      staat = f(staat);
      setBeeld(staat);
    };
    const zet = (f: (b: Beeld) => Beeld) => {
      if (!levend) throw STOP;
      pas(f);
    };
    const pauzeer = (ms: number) =>
      new Promise<void>((res, rej) => setTimeout(() => (levend ? res() : rej(STOP)), ms));

    const spreek = (zinnen: string[]) =>
      new Promise<void>((res) => {
        /* Bij elke zin opnieuw, zodat een keuze in "Jouw instellingen" meteen zichtbaar is. */
        if (levend) setVoorkeuren(vk());
        zet((b) => ({ ...b, zinnen, zichtbaar: 0, praat: zinnen.length > 0, bediening: null }));
        if (zinnen.length === 0) return res();
        stopStem?.();
        stopStem = zegNaElkaar(
          zinnen.map((z) => metUitspraak(kaal(z), naam, vk())),
          (i) => pas((b) => (b.zinnen === zinnen ? { ...b, zichtbaar: Math.max(b.zichtbaar, i + 1) } : b)),
          () => {
            if (!levend) return;
            pas((b) => (b.zinnen === zinnen ? { ...b, zichtbaar: zinnen.length, praat: false } : b));
            setTimeout(res, 300);
          },
          true,
        );
      });

    const gids: Lesgids = {
      naam,
      zeg: (...zinnen) => spreek(zinnen.filter(Boolean)),
      getal: () =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "getal" } }));
          wacht.current.getal = (v) => {
            wacht.current.getal = undefined;
            pas((b) => ({ ...b, bediening: null }));
            res(v);
          };
        }),
      kies: (opties) =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "kies", opties } }));
          /* "Zal ik de keuzes voorlezen?" uit "Zo werkt het". */
          if (vk().keuzesVoorlezen) {
            stopStem?.();
            stopStem = zegNaElkaar(opties.map(kaal), () => {}, () => {}, true);
          }
          wacht.current.kies = (v) => {
            wacht.current.kies = undefined;
            pas((b) => ({ ...b, bediening: null }));
            res(v);
          };
        }),
      verder: () =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "verder" } }));
          wacht.current.verder = () => {
            wacht.current.verder = undefined;
            pas((b) => ({ ...b, bediening: null }));
            res();
          };
        }),
      bak: (tegels, opties = {}) => zet((b) => ({ ...b, bak: { tegels, om: !!opties.om, slot: [] } })),
      uitBak: (n) => zet((b) => ({ ...b, bak: { ...b.bak, tegels: b.bak.tegels.filter((t) => t !== n) } })),
      slot: (n) => zet((b) => ({ ...b, bak: { ...b.bak, slot: [...b.bak.slot, n] } })),
      pak: (opties = {}) =>
        new Promise((res) => {
          zet((b) => ({ ...b, bakActief: true, hand: !!opties.hand }));
          const klok = opties.hulp
            ? setTimeout(() => {
                if (levend && wacht.current.pak) void spreek(opties.hulp!).catch(() => {});
              }, 12000)
            : undefined;
          wacht.current.pak = (n) => {
            clearTimeout(klok);
            wacht.current.pak = undefined;
            pas((b) => ({ ...b, bakActief: false, hand: false }));
            res(n);
          };
        }),
      leg: (n, opties = {}) =>
        zet((b) => {
          const stuk = { id: ++id, n };
          const torens = b.torens.filter((t) => t.stukken.some((st) => !st.weg));
          if (opties.naast || torens.length === 0) return { ...b, tel: 0, torens: [...torens, { id: ++id, stukken: [stuk] }] };
          const laatste = torens[torens.length - 1];
          return { ...b, tel: 0, torens: [...torens.slice(0, -1), { ...laatste, stukken: [...laatste.stukken, stuk] }] };
        }),
      haalWeg: async () => {
        zet((b) => {
          const t = b.torens[b.torens.length - 1];
          if (!t) return b;
          const stukken = t.stukken.map((st, i) => (i === t.stukken.length - 1 ? { ...st, weg: true } : st));
          return { ...b, torens: [...b.torens.slice(0, -1), { ...t, stukken }] };
        });
        await pauzeer(420);
        zet((b) => ({
          ...b,
          torens: b.torens
            .map((t) => ({ ...t, stukken: t.stukken.filter((st) => !st.weg) }))
            .filter((t) => t.stukken.length > 0),
        }));
      },
      leeg: async () => {
        zet((b) => ({ ...b, torens: b.torens.map((t) => ({ ...t, stukken: t.stukken.map((st) => ({ ...st, weg: true })) })) }));
        await pauzeer(420);
        zet((b) => ({ ...b, torens: [], tel: 0 }));
      },
      draai: async () => {
        zet((b) => ({ ...b, tel: 0, torens: b.torens.map((t) => ({ ...t, draait: true })) }));
        await pauzeer(950);
        zet((b) => ({ ...b, torens: b.torens.map((t) => ({ ...t, draait: false, stukken: [...t.stukken].reverse() })) }));
      },
      tel: async () => {
        const totaal = staat.torens.reduce((a, t) => a + t.stukken.reduce((x, st) => x + st.n, 0), 0);
        for (let i = 1; i <= totaal; i++) {
          zet((b) => ({ ...b, tel: i }));
          await pauzeer(420);
        }
        await pauzeer(300);
      },
      som: (delen) => zet((b) => ({ ...b, som: delen })),
      somVak: (index) =>
        new Promise((res) => {
          zet((b) => ({
            ...b,
            som: b.som?.map((d, i) => (i === index && d.t === "vak" ? { t: "vak" } : d)) ?? null,
            bediening: { soort: "somvak", index },
          }));
          wacht.current.somvak = (v) => {
            wacht.current.somvak = undefined;
            pas((b) => ({
              ...b,
              bediening: null,
              som: b.som?.map((d, i) => (i === index && d.t === "vak" ? { t: "vak", waarde: String(v) } : d)) ?? null,
            }));
            res(v);
          };
        }),
      kaart: () =>
        new Promise((res) => {
          zet((b) => ({ ...b, kaart: { afgevinkt: false }, som: null }));
          wacht.current.kaart = () => {
            wacht.current.kaart = undefined;
            stopPraten();
            pas((b) => ({ ...b, kaart: { afgevinkt: true } }));
            setTimeout(res, 900);
          };
        }),
      wacht: pauzeer,
      vlak: (comp, props) => zet((b) => ({ ...b, vlak: comp ? { comp: comp as Vlak, props: props ?? {} } : null })),
      pasVlakAan: (props) => zet((b) => (b.vlak ? { ...b, vlak: { ...b.vlak, props: { ...b.vlak.props, ...props } } } : b)),
      wachtOpVlak: <G extends Vlakgebeurtenis = Vlakgebeurtenis>(soort?: string | string[]) =>
        new Promise<G>((res, rej) => {
          if (!levend) return rej(STOP);
          const soorten = soort === undefined ? null : Array.isArray(soort) ? soort : [soort];
          wacht.current.vlak = (g) => {
            if (soorten && !soorten.includes(g.soort)) return;
            wacht.current.vlak = undefined;
            res(g as G);
          };
        }),
    };

    les
      .speel(gids)
      .then(() => {
        if (!levend) return;
        pas((b) => ({ ...b, klaar: true }));
        klaarMelding.current?.();
      })
      .catch((fout) => {
        if (fout !== STOP) throw fout;
      });

    return () => {
      levend = false;
      stopStem?.();
      stopPraten();
      wacht.current = {};
    };
  }, [les, naam]);

  /* ---------- tegels slepen en tikken ---------- */

  const opRaster = useCallback((x: number, y: number) => {
    const r = raster.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }, []);

  const meldVlak = useCallback((g: Vlakgebeurtenis) => wacht.current.vlak?.(g), []);

  const zetNeer = useCallback((n: number) => {
    setGekozen(null);
    wacht.current.pak?.(n);
  }, []);

  useEffect(() => {
    if (!sleep) return;
    const beweeg = (e: PointerEvent) => setSleep((v) => (v ? { ...v, x: e.clientX, y: e.clientY } : v));
    const los = (e: PointerEvent) => {
      const bewogen = Math.hypot(e.clientX - sleep.vanX, e.clientY - sleep.vanY) > 8;
      if (bewogen && opRaster(e.clientX, e.clientY)) zetNeer(sleep.n);
      else if (!bewogen) setGekozen((g) => (g === sleep.n ? null : sleep.n));
      setSleep(null);
    };
    window.addEventListener("pointermove", beweeg);
    window.addEventListener("pointerup", los);
    return () => {
      window.removeEventListener("pointermove", beweeg);
      window.removeEventListener("pointerup", los);
    };
  }, [sleep, opRaster, zetNeer]);

  /* ---------- tekenen ---------- */

  const { y: rasterY, rijen } = rasterMaat(!!beeld.som);
  const torens = legTorens(beeld.torens, rijen);
  const bak = legBak(beeld.bak.tegels);
  const praatTegel = beeld.bakActief;
  /* Waar het tellen per stuk begint: alle stukken ervoor bij elkaar. */
  const telStart = new Map<number, number>();
  torens.reduce((a, { toren }) => toren.stukken.reduce((x, st) => (telStart.set(st.id, x), x + st.n), a), 0);

  const eersteBak = bak.plekken.find((p) => !beeld.bak.slot.includes(p.n));
  const handStijl = eersteBak
    ? ({
        left: 0,
        top: 0,
        "--van-x": `${eersteBak.x + eersteBak.b / 2}px`,
        "--van-y": `${eersteBak.y + eersteBak.h / 2}px`,
        "--naar-x": `${RASTER_X + 6 * CEL}px`,
        "--naar-y": `${rasterY + (rijen / 2) * CEL}px`,
      } as CSSProperties)
    : undefined;

  const b = beeld.bediening;

  return (
    <div className={s.wortel}>
      <div
        className={s.vlak}
        style={{ transform: `translate(-50%, -50%) scale(${schaal || 1})`, opacity: schaal ? 1 : 0 }}
      >
        {/* naam en pauze */}
        <div className={s.pil}>
          <button
            type="button"
            aria-label="Pauze"
            onClick={() => {
              window.speechSynthesis?.pause();
              setPauze(true);
            }}
          >
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
              <rect x="1" y="1" width="4" height="14" rx="1.2" fill="currentColor" />
              <rect x="9" y="1" width="4" height="14" rx="1.2" fill="currentColor" />
            </svg>
          </button>
          <span>{naam || "Thuisles"}</span>
        </div>

        {/* wat de mascotte zegt, en wat het kind kan doen */}
        <div
          className={s.tekst}
          aria-live="polite"
          data-letters={voorkeuren?.letters ?? "gewoon"}
          data-oplichten={voorkeuren && !voorkeuren.oplichten ? "uit" : "aan"}
        >
          {beeld.zinnen.slice(0, beeld.zichtbaar).map((z, i) => (
            <Zin key={`${i}-${z}`} zin={z} />
          ))}
          {b?.soort === "getal" && <Getalvak onKlaar={(v) => wacht.current.getal?.(v)} />}
          {b?.soort === "somvak" && <SomBevestig />}
          {b?.soort === "kies" && <Keuzes opties={b.opties} onKlaar={(v) => wacht.current.kies?.(v)} />}
          {b?.soort === "verder" && (
            <div className={s.bediening}>
              <button type="button" className={s.rond} aria-label="Verder" autoFocus onClick={() => wacht.current.verder?.()}>
                <Pijl />
              </button>
            </div>
          )}
          {beeld.klaar && (
            <div className={s.bediening}>
              <button type="button" className={`${s.knop} ${s.breed}`} onClick={opnieuw}>
                Nog een keer
              </button>
              {terugHref && (
                <a className={`${s.knop} ${s.breed}`} href={terugHref}>
                  Terug
                </a>
              )}
            </div>
          )}
        </div>

        <div className={s.mascotte} data-praat={beeld.praat}>
          mascotte
        </div>

        {/* de som bovenaan */}
        {beeld.som && !beeld.kaart && (
          <div className={s.sombalk}>
            {beeld.som.map((d, i) =>
              d.t === "getal" ? (
                <span key={i} style={{ color: getalkleur(d.n) }}>
                  {d.n}
                </span>
              ) : d.t === "teken" ? (
                <span key={i} className={s.somteken}>
                  {d.s}
                </span>
              ) : b?.soort === "somvak" && b.index === i ? (
                <Somvak key={`vak-${i}`} onKlaar={(v) => wacht.current.somvak?.(v)} />
              ) : (
                <span
                  key={i}
                  className={s.somvak}
                  style={{ display: "grid", placeItems: "center", color: d.waarde ? getalkleur(Number(d.waarde)) : undefined }}
                >
                  {d.waarde ?? ""}
                </span>
              ),
            )}
          </div>
        )}

        {/* een eigen speelvlak, of het raster met de torens */}
        {beeld.vlak && !beeld.kaart && (
          <div style={{ position: "absolute", left: 300, top: 0, width: 980, height: 720 }}>
            <beeld.vlak.comp {...beeld.vlak.props} meld={meldVlak} schaal={schaal || 1} metSom={!!beeld.som} />
          </div>
        )}
        {!beeld.kaart && !beeld.vlak && (
          <div
            ref={raster}
            className={s.raster}
            style={{ left: RASTER_X, top: rasterY, width: KOLOMMEN * CEL, height: rijen * CEL }}
            onPointerUp={() => {
              if (gekozen !== null && beeld.bakActief && !sleep) zetNeer(gekozen);
            }}
          >
            <svg width={KOLOMMEN * CEL} height={rijen * CEL} aria-hidden>
              {Array.from({ length: KOLOMMEN + 1 }, (_, i) => (
                <line key={`k${i}`} x1={i * CEL + 0.5} y1={0} x2={i * CEL + 0.5} y2={rijen * CEL} stroke="rgba(160,180,220,0.3)" strokeDasharray="2 3" />
              ))}
              {Array.from({ length: rijen + 1 }, (_, i) => (
                <line key={`r${i}`} x1={0} y1={i * CEL + 0.5} x2={KOLOMMEN * CEL} y2={i * CEL + 0.5} stroke="rgba(160,180,220,0.3)" strokeDasharray="2 3" />
              ))}
            </svg>
            {torens.map(({ toren, kolom, hoogte: h, boven, hokjes }) => (
              <div
                key={toren.id}
                className={`${s.toren} ${toren.draait ? s.draait : ""}`}
                style={{ left: kolom * CEL, top: boven * CEL, width: 2 * CEL, height: h * CEL }}
              >
                {toren.stukken.map((st, i) => {
                  const van = telStart.get(st.id) ?? 0;
                  return (
                    <div key={st.id} className={`${s.stuk} ${st.weg ? s.weg : ""}`}>
                      <Hokjes n={st.n} hokjes={hokjes[i]} c={CEL} h={h} telVan={van} tel={beeld.tel} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* de bak */}
        {!beeld.kaart &&
          !beeld.vlak &&
          bak.plekken.map((p) => {
            const opSlot = beeld.bak.slot.includes(p.n);
            const pakbaar = praatTegel && !opSlot;
            return (
              <div
                key={p.n}
                className={`${s.baktegel} ${opSlot ? s.bakslot : !praatTegel ? s.bakdof : ""} ${pakbaar ? s.pakbaar : ""} ${gekozen === p.n ? s.gekozen : ""}`}
                data-om={beeld.bak.om}
                style={{ left: p.x, top: p.y }}
                role={pakbaar ? "button" : undefined}
                aria-label={pakbaar ? `Tegel ${p.n}` : undefined}
                onPointerDown={(e) => {
                  if (!pakbaar) return;
                  e.preventDefault();
                  setHandGezien(true);
                  setSleep({ n: p.n, x: e.clientX, y: e.clientY, vanX: e.clientX, vanY: e.clientY });
                }}
              >
                <Tegel n={p.n} c={bak.c} />
              </div>
            );
          })}

        {beeld.hand && !handGezien && handStijl && (
          <svg className={s.hand} style={handStijl} viewBox="0 0 48 48" aria-hidden>
            <path
              d="M18 22V9.5a3 3 0 0 1 6 0V20l1-.2V17a3 3 0 0 1 6 0v3.5a3 3 0 0 1 5.5 1.6v2.7a3 3 0 0 1 5 2.2V33c0 7-5 12-12 12h-3c-4 0-6.5-1.7-9-5l-6-8a3.1 3.1 0 0 1 4.6-4.1L18 30z"
              fill="#ffffff"
              stroke="#1b2233"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* de kaart aan het eind */}
        {beeld.kaart && (
          <button type="button" className={s.kaart} onClick={() => wacht.current.kaart?.()} aria-label={`${les.titel}: tik om af te vinken`}>
            <svg width="244" height="190" viewBox="0 0 244 190" aria-hidden>
              {les.kaarttekening ? (
                <les.kaarttekening />
              ) : (
                (les.kaarttegels ?? [3, 1]).map((n, i) => <Lijntegel key={i} n={n} x={30 + i * 100} y={i === 0 ? 40 : 30} c={40} />)
              )}
            </svg>
            <span className={s.kaarttitel}>{les.titel}</span>
            {beeld.kaart.afgevinkt && (
              <span className={s.vinkje}>
                <Vink maat={34} />
              </span>
            )}
          </button>
        )}

        {pauze && (
          <div className={s.pauze}>
            <div className={s.pauzemenu}>
              <p>Pauze</p>
              <button
                type="button"
                className={`${s.knop} ${s.breed}`}
                autoFocus
                onClick={() => {
                  window.speechSynthesis?.resume();
                  setPauze(false);
                }}
              >
                Verder
              </button>
              {terugHref && (
                <a className={`${s.knop} ${s.breed}`} href={terugHref}>
                  Stoppen
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* de tegel die onder de vinger hangt */}
      {sleep && Math.hypot(sleep.x - sleep.vanX, sleep.y - sleep.vanY) > 8 && (
        <div className={s.spook} style={{ left: sleep.x - CEL * schaal, top: sleep.y - (hoogte(sleep.n) * CEL * schaal) / 2 }}>
          <Tegel n={sleep.n} c={CEL * schaal} />
        </div>
      )}
    </div>
  );
}

/* ---------- invoer ---------- */

function alleenCijfers(v: string) {
  return v.replace(/\D/g, "").slice(0, 3);
}

/** Een echt invulvak met het blauwe vinkje, en "Weet ik niet". */
function Getalvak({ onKlaar }: { onKlaar: (v: number | null) => void }) {
  const [waarde, setWaarde] = useState("");
  const { bijAandacht, bijWeggaan } = useInBeeld();
  return (
    <div className={s.bediening}>
      <form
        className={s.rij}
        onSubmit={(e) => {
          e.preventDefault();
          if (waarde) onKlaar(Number(waarde));
        }}
      >
        <input
          className={s.vak}
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label="Jouw antwoord"
          value={waarde}
          onChange={(e) => setWaarde(alleenCijfers(e.target.value))}
          onFocus={(e) => bijAandacht(e.currentTarget)}
          onBlur={bijWeggaan}
        />
        <button type="submit" className={s.rond} aria-label="Controleer" data-controleer disabled={!waarde}>
          <Vink />
        </button>
      </form>
      <button type="button" className={`${s.knop} ${s.breed}`} onClick={() => onKlaar(null)}>
        Weet ik niet
      </button>
    </div>
  );
}

/** Een vakje in de som bovenaan, waarin het kind typt. */
function Somvak({ onKlaar }: { onKlaar: (v: number) => void }) {
  const [waarde, setWaarde] = useState("");
  const { bijAandacht, bijWeggaan } = useInBeeld();
  return (
    <form
      id="somvak"
      onSubmit={(e) => {
        e.preventDefault();
        if (waarde) onKlaar(Number(waarde));
      }}
    >
      <input
        className={s.somvak}
        autoFocus
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        aria-label="Vul het vakje in"
        value={waarde}
        style={{ color: waarde ? getalkleur(Number(waarde)) : undefined }}
        onChange={(e) => setWaarde(alleenCijfers(e.target.value))}
        onFocus={(e) => bijAandacht(e.currentTarget)}
        onBlur={bijWeggaan}
      />
    </form>
  );
}

/** Het vinkje links bij een vakje in de som. */
function SomBevestig() {
  return (
    <div className={s.bediening}>
      <button type="submit" form="somvak" className={s.rond} aria-label="Controleer" data-controleer>
        <Vink />
      </button>
    </div>
  );
}

/** Knoppen om te kiezen; pas het vinkje kijkt na. "Weet ik niet" gaat meteen. */
function Keuzes({ opties, onKlaar }: { opties: string[]; onKlaar: (v: string | null) => void }) {
  const [keuze, setKeuze] = useState<string | null>(null);
  const kort = opties.every((o) => o.length <= 3);
  return (
    <div className={s.bediening}>
      <div className={kort ? s.rij : s.bediening} style={kort ? { flexWrap: "wrap", width: 262 } : { opacity: 1, animation: "none" }}>
        {opties.map((o) => (
          <button key={o} type="button" className={`${s.knop} ${/[=+−]/.test(o) || /^\d+$/.test(o) ? s.som : ""}`} aria-pressed={keuze === o} onClick={() => setKeuze(o)}>
            {o}
          </button>
        ))}
      </div>
      <div className={s.rij}>
        <button type="button" className={s.knop} onClick={() => onKlaar(null)}>
          Weet ik niet
        </button>
        {keuze !== null && (
          <button type="button" className={s.rond} aria-label="Controleer" data-controleer onClick={() => onKlaar(keuze)}>
            <Vink />
          </button>
        )}
      </div>
    </div>
  );
}
