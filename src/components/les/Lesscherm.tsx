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

import { MERKNAAM } from "@/lib/merk";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { stopPraten, zegNaElkaar, zetLesStem } from "@/lib/stem";
import { speelLesgeluid, zetLesgeluiden } from "@/lib/lesgeluiden";
import { GeluidjesKnop } from "./GeluidjesKnop";
import { wachtOpBliepo } from "@/lib/bliepo-in-beeld";
import { LosPraatknop } from "@/components/gesprek/Gesprek";
import { Bliepo } from "@/components/avontuur/Bliepo";
import { leesVoorkeuren, metUitspraak, type Lesvoorkeuren } from "./voorkeuren";
import { useInBeeld } from "@/components/oefenen/toetsenbordruimte";
import { getalkleur, hoogte, stapel, TEGELKLEUR, vorm, type Hokje } from "./tegels";
import type { Lesdraaiboek, Lesgids, Somdeel, Vlak, Vlakgebeurtenis, Kiesinstel } from "./soort";
import s from "./Lesscherm.module.css";
import { OpdrachtDecor } from "@/components/oefenen/OpdrachtDecor";
import { BliepoVloer } from "@/components/oefenen/BliepoVloer";
import { kiesGebaar, vraagOfUitleg } from "@/lib/bliepo-gebaren";
import { BliepoTekst } from "@/components/oefenen/BliepoTekst";
import { IkoonKnop, IkoonTeken } from "./ikonen";
import { keuzeStem, useKeuzesAlvast } from "./keuzestem";
import "@/components/oefenen/opdracht-nieuw.css";

/*
  Het ontwerp van de lessen (23 oktober 2026, opdracht eigenaar): "nieuw" =
  de blauwe ruimte als achtergrond, het speelvlak links en Bliepo rechts voor
  de cirkel met een tekstballon erboven (wat hij zegt en wat het kind kan
  doen). "oud" = het donkere scherm met de tekst linksboven en Bliepo klein in
  de hoek. Het lesvlak (1280 x 720) en het plaatje hebben allebei 16:9, dus op
  een gewoon scherm staat Bliepo precies op de cirkel.
*/
const ONTWERP: "nieuw" | "oud" = "nieuw";

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
  | { soort: "kies"; opties: string[]; instel?: Kiesinstel }
  | { soort: "knoppen"; welke: ("weetniet" | "controleer" | "hulp")[] }
  | { soort: "verder" }
  | { soort: "somvak"; index: number };

type Beeld = {
  zinnen: string[];
  zichtbaar: number;
  praat: boolean;
  bediening: Bediening;
  /** De knop die Bliepo nu aanwijst (`data-knop`), of null. */
  aanwijs: string | null;
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
  aanwijs: null,
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
  knoppen?: (v: "weetniet" | "controleer" | "hulp") => void;
  verder?: () => void;
  pak?: (n: number) => void;
  somvak?: (v: number) => void;
  kaart?: () => void;
  vlak?: (g: Vlakgebeurtenis) => void;
  /** De zinnen waarmee Bliepo net een knop aanwees ("Tik dan op de pijl."). */
  wijsZinnen?: string[];
};

const STOP = Symbol("les gestopt");

/** De zin zonder de opmaaktekens, voor de stem. */
function kaal(zin: string): string {
  return zin.replace(/\{(\d+):[a-z]+\}/g, "{$1}").replace(/\[\[[bgrum]:([^\]]+)\]\]/g, "$1").replace(/[{}*]/g, "").replace(/−/g, " min ");
}

/*
  Het getal in de kleur van het voorwerp waar het over gaat (30 oktober 2026, opdracht eigenaar):
  "Er zijn {6} groene visjes" → de 6 groen, niet de tegelkleur van 6. Een les kan het ook zelf
  zeggen met {6:groen}. Staat er geen kleurwoord bij, dan blijft de tegelkleur (die hoort bij de
  tegels en stippen in die kleur).
*/
export const KLEURNAAM: Record<string, string> = {
  rood: "#ff7b7b",
  oranje: "#ffad5c",
  geel: "#ffe066",
  groen: "#7ee0a0",
  blauw: "#8fc4ff",
  paars: "#c9a2ff",
  roze: "#ff9fd2",
  wit: "#ffffff",
  bruin: "#d9a066",
};
const KLEURWOORD: Record<string, string> = {
  rood: "rood", rode: "rood", oranje: "oranje", geel: "geel", gele: "geel", groen: "groen", groene: "groen",
  blauw: "blauw", blauwe: "blauw", paars: "paars", paarse: "paars", roze: "roze", wit: "wit", witte: "wit", bruin: "bruin", bruine: "bruin",
};
/** Zet bij elk {getal} zonder kleur de kleur van het kleurwoord dat erbij hoort: direct erna (binnen 3 woorden), of het enige kleurwoord in de zin. */
export function kleurGetallen(zin: string): string {
  const woorden = zin.split(/(\s+)/);
  const kleurOp = (w: string) => KLEURWOORD[w.toLowerCase().replace(/[^a-z]/g, "")];
  const alle = new Set(woorden.map(kleurOp).filter(Boolean));
  return woorden
    .map((w, i) => {
      const m = /^\{(\d+)\}(.*)$/.exec(w);
      if (!m) return w;
      let k: string | undefined;
      for (let j = i + 2, n = 0; j < woorden.length && n < 3 && !k; j += 2, n++) k = kleurOp(woorden[j]);
      if (!k && alle.size === 1) k = [...alle][0];
      return k ? `{${m[1]}:${k}}${m[2]}` : w;
    })
    .join("");
}
const getalKleur = (n: string, naam?: string) => (naam && KLEURNAAM[naam]) || getalkleur(Number(n));

/*
  Gekleurde woorden in de zin van Bliepo (28 oktober 2026, zoals Synthesis): [[b:eerst]] blauw,
  [[g:eraf]] groen, [[r:…]] roze. Dezelfde kleur als het vraagteken in de som of het gekleurde
  woord in het verhaal, zodat het kind ziet wat bij elkaar hoort. Kleuren uit het Bliepo-palet.
*/
export const ACCENT: Record<string, string> = {
  b: "#8fc4ff",
  g: "#7ee0b3",
  r: "#ffa194",
  /* Kloklessen (28 oktober 2026, zoals Synthesis woorden in de kleur van hun wijzer zet): [[u:urenwijzer]] in de koraalkleur van de urenwijzer, [[m:minutenwijzer]] in de petrolkleur van de minutenwijzer, licht genoeg voor de donkere achtergrond. */
  u: "#ffa194",
  m: "#74d3da",
};

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

/**
 * Een lesregel in woorden voor BliepoTekst: per gesproken woord één stukje,
 * met de opmaak van de les (gekleurd getal, nadruk); een leesteken plakt aan
 * het woord ervoor.
 */
function zinWoorden(ruw: string): React.ReactNode[] {
  const zin = kleurGetallen(ruw);
  const uit: React.ReactNode[] = [];
  const re = /\[\[([bgrum]):([^\]]+)\]\]([.,!?:]?)|\{(\d+)(?::([a-z]+))?\}([.,!?:]?)|\*([^*]+)\*([.,!?:]?)|(\S+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(zin))) {
    if (m[1] !== undefined) {
      const woorden = m[2].split(/\s+/);
      woorden.forEach((w, j) =>
        uit.push(
          <span key={i++} style={{ color: ACCENT[m![1]] }}>
            {w}
            {j === woorden.length - 1 ? m![3] : ""}
          </span>,
        ),
      );
      continue;
    }
    const naam = m[5];
    m = [m[0], m[4], m[6], m[7], m[8], m[9]] as unknown as RegExpExecArray;
    if (m[1] !== undefined)
      uit.push(
        <span key={i++}>
          <span className={s.getal} style={{ color: getalKleur(m[1], naam) }}>
            {m[1]}
          </span>
          {m[2]}
        </span>,
      );
    else if (m[3] !== undefined)
      for (const [j, w] of m[3].split(/\s+/).entries())
        uit.push(
          <em key={i++}>
            {w}
            {j === m[3].split(/\s+/).length - 1 ? m[4] : ""}
          </em>,
        );
    else if (/^[.,!?:]$/.test(m[5]) && uit.length) uit[uit.length - 1] = <span key={i++}>{uit[uit.length - 1]}{m[5]}</span>;
    else uit.push(<span key={i++}>{m[5]}</span>);
  }
  return uit;
}

function Zin({ zin: ruw }: { zin: string }) {
  const zin = kleurGetallen(ruw);
  const delen = useMemo(() => {
    const uit: { soort: "woord" | "getal" | "nadruk"; tekst: string; kleur?: string }[] = [];
    const re = /\[\[([bgrum]):([^\]]+)\]\]([.,!?:]?)|\{(\d+)(?::([a-z]+))?\}([.,!?:]?)|\*([^*]+)\*([.,!?:]?)|(\S+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(zin))) {
      if (m[1] !== undefined) {
        const k = ACCENT[m[1]];
        for (const w of m[2].split(/\s+/)) uit.push({ soort: "woord", tekst: w, kleur: k });
        if (m[3]) uit.push({ soort: "woord", tekst: m[3] });
        continue;
      }
      const naam = m[5];
      m = [m[0], m[4], m[6], m[7], m[8], m[9]] as unknown as RegExpExecArray;
      if (m[1] !== undefined) uit.push({ soort: "getal", tekst: m[1], kleur: getalKleur(m[1], naam) }, ...(m[2] ? [{ soort: "woord" as const, tekst: m[2] }] : []));
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
            <span key={i} className={`${s.woord} ${s.getal}`} style={{ ...vertraging, color: d.kleur ?? getalkleur(Number(d.tekst)) }}>
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
          <span key={i} className={s.woord} style={d.kleur ? { ...vertraging, color: d.kleur } : vertraging}>
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
  tutor = null,
}: {
  les: Lesdraaiboek;
  naam?: string;
  onKlaar?: () => void;
  terugHref?: string;
  /** Praten met Bliepo (22 oktober 2026): alleen als de ouder het aanzette. */
  tutor?: { groep: number } | null;
}) {
  const [ronde, setRonde] = useState(0);
  return (
    <Lesscherm
      key={ronde}
      les={les}
      naam={naam}
      opnieuw={() => setRonde((r) => r + 1)}
      onKlaar={onKlaar}
      terugHref={terugHref}
      tutor={tutor}
    />
  );
}

function Lesscherm({
  les,
  naam,
  opnieuw,
  onKlaar,
  terugHref,
  tutor,
}: {
  les: Lesdraaiboek;
  naam: string;
  opnieuw: () => void;
  onKlaar?: () => void;
  terugHref?: string;
  tutor: { groep: number } | null;
}) {
  const klaarMelding = useRef(onKlaar);
  useEffect(() => {
    klaarMelding.current = onKlaar;
  }, [onKlaar]);
  const [beeld, setBeeld] = useState<Beeld>(BEGIN);
  const wacht = useRef<Wachters>({});
  const [schaal, setSchaal] = useState(0);
  /*
    Staand scherm (telefoon, tablet rechtop) in het nieuwe ontwerp: het
    speelvlak vult de breedte bovenaan, de ballon met Bliepo staat eronder in
    de vrije ruimte (anders werd alles heel klein).
  */
  const [staand, setStaand] = useState(false);
  const [pauze, setPauze] = useState(false);
  const raster = useRef<HTMLDivElement>(null);
  const [sleep, setSleep] = useState<null | { n: number; x: number; y: number; vanX: number; vanY: number }>(null);
  const [gekozen, setGekozen] = useState<number | null>(null);
  const [handGezien, setHandGezien] = useState(false);
  /* Voorkeuren uit de les "Jouw instellingen"; pas na het laden gelezen (geen localStorage op de server). */
  const [voorkeuren, setVoorkeuren] = useState<Lesvoorkeuren | null>(null);

  /* Het vaste speelvlak zo groot als het scherm toelaat. */
  /* De nagebouwde lessen: alleen de bewaarde stem van Ruth, nooit de browserstem; de naam gaat mee voor het naamfragment (28 okt 2026). */
  useEffect(() => {
    zetLesStem({ alleenServer: les.indeling === "synthesis" && !les.browserstem, naam });
    zetLesgeluiden(les.indeling === "synthesis");
    return () => {
      zetLesStem({ alleenServer: false });
      zetLesgeluiden(false);
    };
  }, [les.indeling, naam]);

  useEffect(() => {
    const meet = () => {
      const rechtop = ONTWERP === "nieuw" && window.innerHeight > window.innerWidth;
      setStaand(rechtop);
      setSchaal(
        rechtop
          ? Math.min(window.innerWidth / (B - 300), (window.innerHeight * 0.52) / (H + (les.indeling === "synthesis" ? 0 : 46)))
          : Math.min(window.innerWidth / B, window.innerHeight / H),
      );
    };
    meet();
    window.addEventListener("resize", meet);
    return () => window.removeEventListener("resize", meet);
  }, [les.indeling]);

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

    /* Stopt de stem halverwege (tik op de kaart), dan moet de les toch verder: anders blijft hij hangen en telt hij niet als af (28 okt 2026). */
    let spreekAf: (() => void) | null = null;
    const spreek = (zinnen: string[], houdBediening = false) =>
      new Promise<void>((res0) => {
        let gedaan = false;
        const res = () => {
          if (gedaan) return;
          gedaan = true;
          if (spreekAf === res) spreekAf = null;
          res0();
        };
        spreekAf = res;
        /* Bij elke zin opnieuw, zodat een keuze in "Jouw instellingen" meteen zichtbaar is. */
        if (levend) setVoorkeuren(vk());
        /*
          Wacht de les nog op een antwoord (kiezen, een getal, de pijl), dan
          blijven die knoppen staan, ook als Bliepo intussen iets zegt. Anders
          verdwijnen de knoppen terwijl de les erop blijft wachten, en zit het
          kind vast (28 oktober 2026, "Tik op ja of nee" zonder Ja/Nee).
        */
        const wachtOpAntwoord = Boolean(wacht.current.kies || wacht.current.knoppen || wacht.current.getal || wacht.current.somvak || wacht.current.verder);
        zet((b) => ({ ...b, zinnen, zichtbaar: 0, praat: zinnen.length > 0, bediening: houdBediening || wachtOpAntwoord ? b.bediening : null }));
        if (zinnen.length === 0) return res();
        stopStem?.();
        /* Eerst Bliepo in beeld, dan pas zijn stem (26 oktober 2026, lib/bliepo-in-beeld.ts). */
        void wachtOpBliepo().then(() => {
          if (!levend || staat.zinnen !== zinnen) return res();
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
      });

    /* Na een tik is een aanwijszin ("Tik dan op de pijl.") voorbij: die gaat weg, zodat het scherm geen oude stap laat zien. */
    const wegMetAanwijszin = (b: { zinnen: string[] }) => {
      const z = wacht.current.wijsZinnen;
      wacht.current.wijsZinnen = undefined;
      return z && b.zinnen === z ? { zinnen: [] as string[], zichtbaar: 0, praat: false } : {};
    };

    /*
      Groep 3 leest nog niet (28 oktober 2026, opdracht eigenaar): in de nagebouwde
      lessen benoemt Bliepo elke knop de eerste keer dat hij in de les verschijnt,
      ook waar Synthesis dat niet doet. De knop pulseert terwijl Bliepo hem noemt;
      daarna staat zijn vraag weer in beeld. Tikt het kind al eerder, dan stopt hij.
      De zinnen staan ook in scripts/stemlessen.mjs (BENOEM), voor de stem van Ruth.
    */
    const benoemd = new Set<string>();
    const benoemAan = les.indeling === "synthesis";
    const zichtbaar = (knop: string) =>
      typeof document !== "undefined" &&
      [...document.querySelectorAll<HTMLElement>(`[data-knop="${CSS.escape(knop)}"]`)].some((el) => el.getBoundingClientRect().width > 2);
    const benoem = async (stappen: { knop: string; zin: string }[]) => {
      if (!benoemAan) return;
      /* Wacht tot Bliepo uitgesproken is en de knoppen in beeld staan. */
      await pauzeer(200);
      while (levend && staat.praat) await pauzeer(150);
      if (!zichtbaar("handje") || benoemd.has(BENOEM.handje)) {
        /* niets extra */
      } else stappen = [...stappen, { knop: "handje", zin: BENOEM.handje }];
      /* Alleen knoppen die echt in beeld staan (een les kan "Weet ik niet" verbergen of elders zetten). */
      const nieuw = stappen.filter((st) => !benoemd.has(st.zin) && (!st.knop || zichtbaar(st.knop)));
      if (!nieuw.length) return;
      const bediening = staat.bediening;
      const vorige = staat.zinnen;
      for (const st of nieuw) {
        if (!levend || staat.bediening !== bediening) break;
        benoemd.add(st.zin);
        const z = [st.zin];
        wacht.current.wijsZinnen = z;
        pas((b) => ({ ...b, aanwijs: st.knop || null }));
        await spreek(z, true);
        await pauzeer(250);
      }
      pas((b) => {
        const eigen = b.zinnen.length === 1 && nieuw.some((st) => st.zin === b.zinnen[0]);
        return { ...b, aanwijs: null, ...(eigen && vorige.length ? { zinnen: vorige, zichtbaar: vorige.length, praat: false } : {}) };
      });
    };
    const benoemStil = (stappen: { knop: string; zin: string }[]) => void benoem(stappen).catch(() => {});

    const gids: Lesgids = {
      naam,
      /* Nergens meer "Tik op het vinkje." (30 oktober 2026, opdracht eigenaar: in alle lessen). */
      zeg: (...zinnen) => {
        const z = zinnen.filter((zin) => zin && !/vinkje/i.test(zin));
        /* Bleef er niets over, dan blijft de vorige zin van Bliepo gewoon staan. */
        return z.length || !zinnen.length ? spreek(z) : Promise.resolve();
      },
      wijsAan: async (knop, ...zinnen) => {
        /*
          Heeft het kind al geantwoord (de les wacht nergens meer op en de knop is weg), dan wijst Bliepo
          hem niet meer aan: anders zegt hij "Tik dan op het vraagteken." zonder vraagteken (29 okt 2026, speelcontrole).
        */
        const w = wacht.current;
        if (!w.kies && !w.knoppen && !w.getal && !w.somvak && !w.verder && !zichtbaar(knop)) return;
        zet((b) => ({ ...b, aanwijs: knop }));
        try {
          /*
            De pijl legt Bliepo niet steeds opnieuw uit (30 oktober 2026, opdracht eigenaar):
            nieuwe kinderen krijgen dat aan het begin van de site uitgelegd. De pijl licht
            alleen even op.
          */
          /* Ook "Tik daarna op het vinkje." en dergelijke niet meer (30 oktober 2026, opdracht eigenaar). */
          /*
            En ook niet meer "Weet je het niet? Tik dan op het vraagteken." of "Tik dan op de knop: Weet ik niet."
            (30 oktober 2026, opdracht eigenaar; Synthesis zegt dat ook niet). De knop licht alleen even op.
          */
          const stil =
            knop === "verder" ||
            knop === "weetniet" ||
            knop === "hulpvlak" ||
            zinnen.some((zin) => /vinkje|weet je het niet|weet ik niet|hulp nodig|vind je het lastig|kun je dit nog niet/i.test(zin ?? ""));
          const z = stil ? [] : zinnen.filter(Boolean);
          /* Zonder zinnen alleen aanwijzen: de vraag van Bliepo blijft dan staan (anders was zijn tekst leeg naast de keuzes). */
          const vorige = staat.zinnen;
          if (z.length) {
            wacht.current.wijsZinnen = z;
            await spreek(z, true);
          }
          await pauzeer(500);
          /* Daarna staat de vraag van Bliepo weer in beeld (niet de aanwijzing), zodat het scherm laat zien wat er gevraagd wordt. */
          if (z.length && vorige.length) pas((b) => (b.zinnen === z ? { ...b, zinnen: vorige, zichtbaar: vorige.length, praat: false } : b));
        } finally {
          pas((b) => ({ ...b, aanwijs: null }));
        }
      },
      getal: () =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "getal" } }));
          /* "Typ het getal. Tik dan op het vinkje." niet meer (30 oktober 2026, opdracht eigenaar). */
          wacht.current.getal = (v) => {
            wacht.current.getal = undefined;
            pas((b) => ({ ...b, bediening: null, ...wegMetAanwijszin(b) }));
            res(v);
          };
        }),
      knoppen: (welke) =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "knoppen", welke } }));
          benoemStil(welke.map((k) => ({ knop: k, zin: BENOEM[k] })));
          wacht.current.knoppen = (v) => {
            wacht.current.knoppen = undefined;
            speelLesgeluid("beurt");
            pas((b) => ({ ...b, bediening: null, ...wegMetAanwijszin(b) }));
            res(v);
          };
        }),
      kies: (opties, instel) =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "kies", opties, instel } }));
          /*
            De keuzes zelf benoemt Bliepo niet meer (30 oktober 2026, opdracht eigenaar):
            het kind laat ze voorlezen met de muis, lang indrukken of het luidsprekertje
            (keuzestem.tsx). Het vraagteken en het vinkje noemt hij nog wel de eerste keer.
          */
          benoemStil([
            /* Ook het vraagteken noemt Bliepo niet meer (30 oktober 2026, opdracht eigenaar). */
            /* Het vinkje noemt Bliepo niet meer (30 oktober 2026, opdracht eigenaar: onnodig). */
          ]);
          /*
            De keuzes worden niet voorgelezen (22 oktober 2026, opdracht
            eigenaar): Bliepo leest alleen de vraag, de uitleg en zijn reacties
            voor. Tot dan las hij ze voor als het kind dat in "Zo werkt het"
            had gekozen (`keuzesVoorlezen`); die keuze wordt nog wel bewaard.
          */
          wacht.current.kies = (v) => {
            wacht.current.kies = undefined;
            speelLesgeluid("beurt");
            pas((b) => ({ ...b, bediening: null, ...wegMetAanwijszin(b) }));
            res(v);
          };
        }),
      verder: () =>
        new Promise((res) => {
          zet((b) => ({ ...b, bediening: { soort: "verder" } }));
          /* De pijl wordt niet meer benoemd (30 oktober 2026, opdracht eigenaar). */
          wacht.current.verder = () => {
            wacht.current.verder = undefined;
            speelLesgeluid("beurt");
            pas((b) => ({ ...b, bediening: null, ...wegMetAanwijszin(b) }));
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
            pas((b) => ({ ...b, praat: false, zichtbaar: b.zinnen.length }));
            spreekAf?.();
            pas((b) => ({ ...b, kaart: { afgevinkt: true } }));
            setTimeout(res, 900);
          };
        }),
      stopLes: () =>
        new Promise<never>((_, rej) => {
          /* Zonder kaart en zonder klaarmelding: de les telt niet als af (zoals Synthesis bij "pauze"). */
          pas((b) => ({ ...b, bediening: null, kaart: null, klaar: true }));
          rej(STOP);
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
            /*
              Stond er alleen "Weet ik niet" naast de tik in het vlak (kies([])),
              dan hoort die bij deze beurt: weg ermee, anders blijft er een dode
              knop staan waar de les niet meer op reageert (28 oktober 2026).
            */
            if (wacht.current.kies && staat.bediening?.soort === "kies" && staat.bediening.opties.length === 0) {
              wacht.current.kies = undefined;
              pas((b) => ({ ...b, bediening: null }));
            }
            if (wacht.current.knoppen && staat.bediening?.soort === "knoppen") {
              wacht.current.knoppen = undefined;
              pas((b) => ({ ...b, bediening: null }));
            }
            /* Het handje in de toets (28 oktober 2026, gedrag Synthesis) breekt de beurt af: de keuzes van deze beurt gaan weg. */
            if (g.soort === "handje" && wacht.current.kies) {
              wacht.current.kies = undefined;
              pas((b) => ({ ...b, bediening: null }));
            }
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

  const nieuw = ONTWERP === "nieuw";
  /* Staand scherm, andere lessen (29 okt 2026, overlapcontrole): de naam- en pauzebalk boven het speelvlak, niet over de cijfertegels. */
  const pilBoven = nieuw && staand && les.indeling !== "synthesis" ? 46 : 0;
  /* De indeling van Synthesis (28 oktober 2026): zin en knoppen in een kolom links, Bliepo rechts zonder ballon. */
  const synth = nieuw && !staand && les.indeling === "synthesis";
  /*
    Vaste plek voor de antwoordkeuzes (28 oktober 2026, besluit eigenaar):
    Ja/Nee, "Weet ik niet" en andere keuzes staan ALTIJD direct onder de zin
    van Bliepo, rechts boven hem, in elke les. Alleen de antwoordtegels met
    cijfers (1–9) staan bij de indeling van Synthesis in de kolom links.
  */
  const tegelsLinks = synth && b?.soort === "kies" && !!b.instel?.raster;
  /*
    Gebaren bij het praten (23 oktober 2026, opdracht eigenaar): bij elke zin
    die Bliepo zegt een passend gebaar (vraag: open handen; uitleg: wijzen of
    laten zien; lib/bliepo-gebaren.ts); juichen als de les klaar is.
  */
  const lesZin = beeld.zichtbaar > 0 ? kaal(beeld.zinnen[beeld.zichtbaar - 1] ?? "") : "";
  const lesGebaar = beeld.klaar
    ? { naam: "correct", n: "klaar" }
    : lesZin
      ? { naam: kiesGebaar(vraagOfUitleg(lesZin), lesZin, beeld.zichtbaar), n: `${beeld.zichtbaar}:${lesZin}`, opStem: true }
      : null;

  /* Wat de mascotte zegt, en wat het kind kan doen (oud: linksboven; nieuw: in de ballon boven Bliepo). */
  /* De ronde microfoonknop naast Bliepo; grijs als "Praten met Bliepo" uit staat (26 oktober 2026). */
  const praatknop = (
    <LosPraatknop
      aan={Boolean(tutor)}
      onderwerp={() => ({
        opgaveId: `les:${les.id}:${kortKenmerk(beeld.zinnen.join("|"))}`,
        opgaveTekst: beeld.zinnen.map(kaal).join(" "),
        domein: les.id,
        leerdoel: les.titel,
        groep: tutor?.groep,
      })}
    />
  );
  /* De zin en de knoppen; bij de indeling van Synthesis apart: de zin boven Bliepo, de knoppen in de kolom links (28 oktober 2026). */
  const maakTekstblok = (deel: "alles" | "zin" | "knoppen") => (
        <div
          className={`${s.tekst} les-tekst`}
          aria-live="polite"
          data-letters={voorkeuren?.letters ?? "gewoon"}
          data-oplichten={voorkeuren && !voorkeuren.oplichten ? "uit" : "aan"}
        >
          {/*
            Nieuw ontwerp (23 oktober 2026, akkoord eigenaar): alleen de zin die
            Bliepo nu zegt, vrij boven hem, met oplichtende woorden (BliepoTekst).
            Oud: alle zinnen onder elkaar.
          */}
          {deel !== "knoppen" && (nieuw
            ? beeld.zichtbaar > 0 && (
                <BliepoTekst
                  key={`${beeld.zichtbaar}-${beeld.zinnen[beeld.zichtbaar - 1]}`}
                  woorden={zinWoorden(beeld.zinnen[beeld.zichtbaar - 1])}
                  gesproken={metUitspraak(kaal(beeld.zinnen[beeld.zichtbaar - 1]), naam, voorkeuren ?? leesVoorkeuren())}
                />
              )
            : beeld.zinnen.slice(0, beeld.zichtbaar).map((z, i) => <Zin key={`${i}-${z}`} zin={z} />))}
          {deel !== "zin" && b?.soort === "getal" && <Getalvak onKlaar={(v) => wacht.current.getal?.(v)} />}
          {deel !== "zin" && b?.soort === "somvak" && <SomBevestig />}
          {deel !== "zin" && b?.soort === "kies" && (
            <Keuzes
              opties={b.opties}
              /* Tegels links (Synthesis): "Weet ik niet" staat dan bij Bliepo, op de vaste plek (besluit eigenaar 28 okt). */
              instel={deel === "knoppen" ? { ...b.instel, weetniet: false } : b.instel}
              synth={tegelsLinks}
              stil={!!beeld.aanwijs}
              onKlaar={(v) => wacht.current.kies?.(v)}
            />
          )}
          {deel === "zin" && b?.soort === "kies" && b.instel?.weetniet !== false && (
            <div className={s.bediening}>
              <div className={s.rij}>
                <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => wacht.current.kies?.(null)} />
              </div>
            </div>
          )}
          {deel !== "zin" && b?.soort === "knoppen" && (
            <div className={s.bediening}>
              <div className={s.rij}>
                {b.welke.includes("weetniet") && (
                  <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => wacht.current.knoppen?.("weetniet")} />
                )}
                {/* Het handje: hulp bij het zetten van de klok (28 oktober 2026, zoals Synthesis). */}
                {b.welke.includes("hulp") && (
                  <IkoonKnop ikoon="hand" label="Hulp" knop="hulp" onClick={() => wacht.current.knoppen?.("hulp")} />
                )}
                {b.welke.includes("controleer") && (
                  <button type="button" className={s.rond} aria-label="Controleer" data-controleer data-knop="controleer" onClick={() => wacht.current.knoppen?.("controleer")}>
                    <Vink />
                  </button>
                )}
              </div>
            </div>
          )}
          {deel !== "zin" && b?.soort === "verder" && (
            <div className={s.bediening}>
              <button type="button" className={s.rond} aria-label="Verder" data-knop="verder" autoFocus onClick={() => wacht.current.verder?.()}>
                <Pijl />
              </button>
            </div>
          )}
          {/*
            De oranje knop "Vraag het Bliepo" staat hier niet meer (26 oktober
            2026, opdracht eigenaar): praten gaat met de ronde microfoonknop
            naast Bliepo (BliepoVloer), dezelfde als in de stijlkiezer.
          */}
          {deel !== "zin" && beeld.klaar && (
            <div className={s.bediening}>
              {/* Met iconen (groep 3 leest nog niet; 27 oktober 2026). */}
              <div className={s.rij}>
                <IkoonKnop ikoon="opnieuw" label="Nog een keer" knop="opnieuw" onClick={opnieuw} />
                {terugHref && (
                  <a className={`${s.knop}`} href={terugHref} data-knop="terug" aria-label="Terug" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <IkoonTeken ikoon="terug" />
                    Terug
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
  );
  const tekstblok = maakTekstblok("alles");

  /* De knop die Bliepo aanwijst pulseert (ook knoppen in een eigen speelvlak). */
  useEffect(() => {
    const k = beeld.aanwijs;
    if (!k) return;
    const knoppen = [...document.querySelectorAll<HTMLElement>(`[data-knop="${CSS.escape(k)}"]`)];
    knoppen.forEach((el) => el.classList.add("les-aanwijs"));
    return () => knoppen.forEach((el) => el.classList.remove("les-aanwijs"));
  }, [beeld.aanwijs, beeld.bediening]);

  const pilBalk = (
    <div
      className={s.pil}
      style={
        pilBoven
          ? {
              /* Vast bovenaan het scherm: blijft zichtbaar als de pagina meeschuift voor het toetsenbord (29 okt 2026). */
              position: "fixed",
              left: "auto",
              right: `calc(100vw - (100vw - ${(B - 300) * (schaal || 1)}px) / 2 - ${(B - 312) * (schaal || 1)}px)`,
              top: 8 + 12 * (schaal || 1),
              transform: `scale(${schaal || 1})`,
              transformOrigin: "top right",
              zIndex: 20,
            }
          : nieuw
            ? { left: "auto", right: staand ? 312 : 12 }
            : undefined
      }
    >
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
      {/* Geluidjes aan/uit, los van de stem (29 oktober 2026); alleen waar de les geluidjes heeft. */}
      {les.indeling === "synthesis" && <GeluidjesKnop />}
      <span>{naam || MERKNAAM}</span>
    </div>
  );

  return (
    <div className={s.wortel} data-les-ontwerp={ONTWERP} data-indeling={nieuw && les.indeling === "synthesis" ? "synthesis" : undefined} data-staand={staand ? "ja" : undefined}>
      {nieuw && <OpdrachtDecor />}
      {nieuw && les.nacht && <div className="opdracht-nacht" aria-hidden="true" />}
      {pilBoven ? pilBalk : null}
      <div
        className={s.vlak}
        style={
          staand
            ? {
                left: `calc((100vw - ${(B - 300) * (schaal || 1)}px) / 2)`,
                top: 8 + pilBoven * (schaal || 1),
                transformOrigin: "0 0",
                transform: `scale(${schaal || 1})`,
                opacity: schaal ? 1 : 0,
              }
            : { transform: `translate(-50%, -50%) scale(${schaal || 1})`, opacity: schaal ? 1 : 0 }
        }
      >
        {/* naam en pauze */}
        {!pilBoven && pilBalk}
        {!nieuw && tekstblok}
        {tegelsLinks && <div className={s.synthKolom}>{maakTekstblok("knoppen")}</div>}

        {/* Bliepo: praat mee met de tekst, en juicht als de les klaar is. */}
        {!nieuw && (
          <div className={s.mascotte} data-praat={beeld.praat}>
            <Bliepo houding={beeld.klaar ? "blij" : "rustig"} praat={beeld.praat} className="h-full" />
          </div>
        )}

        {/* Nieuw: Bliepo rechts voor de cirkel, met de ballon erboven. */}
        {nieuw && !staand && (
          <BliepoVloer
            plek="kolom"
            naast={praatknop}
            gebaar={lesGebaar}
            onNogEens={
              beeld.praat || beeld.zichtbaar === 0
                ? undefined
                : () => zegNaElkaar(beeld.zinnen.slice(0, beeld.zichtbaar).map(kaal), () => {}, () => {}, true)
            }
          >
            {tegelsLinks ? maakTekstblok("zin") : tekstblok}
          </BliepoVloer>
        )}

        {/* Nieuw: het speelvlak schuift 300 naar links (de rechterkolom is voor Bliepo). */}
        <div className={nieuw ? "les-inhoud" : undefined} style={nieuw ? undefined : { display: "contents" }}>
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
        </div>

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

      {/* Nieuw, staand scherm: de ballon met Bliepo onder het speelvlak. */}
      {nieuw && staand && (
        <div className="les-staand" style={{ top: 16 + (H + pilBoven) * (schaal || 1) }}>
          <BliepoVloer
            naast={praatknop}
            gebaar={lesGebaar}
            onNogEens={
              beeld.praat || beeld.zichtbaar === 0
                ? undefined
                : () => zegNaElkaar(beeld.zinnen.slice(0, beeld.zichtbaar).map(kaal), () => {}, () => {}, true)
            }
          >
            {tekstblok}
          </BliepoVloer>
        </div>
      )}

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
        <button type="submit" className={s.rond} aria-label="Controleer" data-controleer data-knop="controleer" disabled={!waarde}>
          <Vink />
        </button>
      </form>
      <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => onKlaar(null)} />
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
      <button type="submit" form="somvak" className={s.rond} aria-label="Controleer" data-controleer data-knop="controleer">
        <Vink />
      </button>
    </div>
  );
}

/** Knoppen om te kiezen; pas het vinkje kijkt na. "Weet ik niet" gaat meteen. */
/* `stil`: Bliepo wijst nu een knop aan; dan het woord niet voorlezen, anders breekt het voorlezen de aanwijzing af en hangt de les (28 oktober 2026). */
/* Wat Bliepo zegt als hij een knop de eerste keer benoemt (groep 3 leest nog niet; zie benoem). */
export const BENOEM = {
  getallen: "Tik op het goede getal.",
  weetniet: "Weet je het niet? Tik dan op het vraagteken.",
  vinkje: "Tik daarna op het vinkje.",
  verder: "Tik op de pijl om verder te gaan.",
  getal: "Typ het getal. Tik dan op het vinkje.",
  controleer: "Klaar? Tik dan op het vinkje.",
  hulp: "Hulp nodig? Tik dan op het handje.",
  handje: "Wil je liever de les? Tik op het handje.",
} as const;

/** Een keuze zoals Bliepo hem voorleest: woorden gewoon, een som als "7 min 2 is 5". */
export function leesKeuze(o: string): string {
  return kaal(o).replace(/\s*=\s*/g, " is ").replace(/\s*\+\s*/g, " plus ").replace(/\?/g, "hoeveel").replace(/\s+/g, " ").trim();
}

function Keuzes({ opties, instel, synth, onKlaar }: { opties: string[]; instel?: Kiesinstel; synth?: boolean; stil?: boolean; onKlaar: (v: string | null) => void }) {
  const [keuze, setKeuze] = useState<string | null>(null);
  /* Bij de indeling van Synthesis staan alleen getallen naast elkaar; woorden (Ja, Nee) onder elkaar over de hele breedte. */
  const kort = opties.every((o) => o.length <= 3) && (!synth || opties.every((o) => /^\d/.test(o)));
  const direct = !!instel?.direct;
  /* Overal dezelfde knop met dezelfde naam ("Weet ik niet"); `weetniet: false` = geen knop. */
  const weetniet = instel?.weetniet;
  /* Antwoordtegels in een raster van 3 breed (zoals Synthesis), of de gewone rij/kolom. */
  const lijst = instel?.raster ? s.raster3 : kort ? s.rij : s.bediening;
  const lijstStijl = instel?.raster ? undefined : kort ? { flexWrap: "wrap" as const, width: 262 } : { opacity: 1, animation: "none" };
  useKeuzesAlvast(opties.map(leesKeuze));
  return (
    <div className={s.bediening}>
      {/* Drie of meer woordkeuzes: twee naast elkaar (alleen bij de indeling van Synthesis, via CSS), zodat de vraag van Bliepo niet omhoog uit beeld schuift. */}
      <div className={`${lijst} ${!instel?.raster && !kort && opties.length >= 3 ? s.twee : ""}`} style={lijstStijl}>
        {opties.map((o) => (
          <button
            key={o}
            type="button"
            className={`${s.knop} ${/[=+−]/.test(o) || /^\d+$/.test(o) ? s.som : ""}`}
            aria-pressed={keuze === o}
            data-knop={/^\d+$/.test(o) ? "getaltegel" : `keuze:${o}`}
            data-keuze=""
            {...keuzeStem(leesKeuze(o))}
            onClick={() => {
              setKeuze(o);
              if (!direct) speelLesgeluid("keuze");
              /*
                Een tik kiest alleen; voorlezen gaat via muis, lang indrukken of het luidsprekertje
                (30 oktober 2026). Tot dan las Bliepo een woordkeuze voor bij het tikken.
              */
              if (direct) onKlaar(o);
            }}
          >
            {o}
          </button>
        ))}
      </div>
      <div className={s.rij}>
        {weetniet !== false && (
          <IkoonKnop ikoon="vraag" label="Weet ik niet" knop="weetniet" onClick={() => onKlaar(null)} />
        )}
        {keuze !== null && !direct && (
          <button type="button" className={s.rond} aria-label="Controleer" data-controleer data-knop="controleer" onClick={() => onKlaar(keuze)}>
            <Vink />
          </button>
        )}
      </div>
    </div>
  );
}

/** Een kort, vast kenmerk van een tekst (voor Praten met Bliepo: welke vraag in de les). */
function kortKenmerk(tekst: string): string {
  let h = 5381;
  for (let i = 0; i < tekst.length; i++) h = ((h << 5) + h + tekst.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
