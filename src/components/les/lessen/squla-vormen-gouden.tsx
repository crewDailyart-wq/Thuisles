/**
 * DE GOUDEN LES VORMEN: PATRONEN (11 november 2026; BOUWREGELS hoofdstuk 15, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-vormen-patronen-1-gouden — een NIEUWE versie naast squla-vormen-patronen-1 "Patronen" (BOUWREGELS 15.8). De
 *   oude les (squla-vormen.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze versie de oude voor
 *   kinderen.
 *
 * Waarom deze Squla-les: van de 7 Squla-lessen Vormen is "Patronen" level 1 de eerste (de eerste Squla-oefening van
 * "Vormen en figuren", en de eerste in de lessenlijst). De 3 lessen "Vormen en kleuren" zijn de vormenpuzzels: die raken
 * we niet aan zonder vraag. Zie KEUZES-VOOR-SARA.md, Ronde 36.
 *
 * Inhoud (15.22 punt 1): die van squla-vormen-patronen-1. Dezelfde 15 vragen in dezelfde volgorde, met dezelfde kralen,
 * dingen, vormen en keuzes, en dezelfde puzzel.
 *
 * Skelet: er is GEEN Synthesis-les over vormen of patronen (KOPPELING.md §13). Volgens BOUWREGELS 15.25 krijgt Vormen EXACT
 * HETZELFDE SKELET als de andere gouden lessen (laag 1); het deel dat per onderwerp anders is (hulp in beeld, denkfouten,
 * hints, samen voordoen) is "EIGEN INVULLING, NIET VAN SYNTHESIS" (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/vormen.md).
 *   begin    geen startvraag; de groet en het uitlegdeel in 1 stuk, met de blauw-gele ketting van de oude les in beeld;
 *   vraag    het beeld komt, de vraag met de keuzes tegelijk. Kiezen: tik op een keuze (alleen een vinkje erop, 6.5) en
 *            dan op het vinkje van het lesscherm. De ketting: 3 kralen slepen, dan het vinkje. De puzzel: een opdracht,
 *            klaar als alle stukjes vastzitten;
 *   goed     scherm 1 s groen, lof + korte reactie, een lichtgolf; vanzelf door ±0,7 s (15.27);
 *   fout     1e fout: eerste zin uit de fouttabel (met een rood rondje om de gekozen keuze), dan de hint en het kind kiest
 *            opnieuw; 2e fout: uitleg, dan SAMEN (Bliepo wijst het stukje aan dat terugkomt, rondje om de goede keuze, het
 *            kind tikt hem aan; bij de ketting legt Bliepo 2 kralen en sleept het kind de laatste); nooit stoppen (15.18);
 *   hulp     hulphandje alleen bij opdrachten (de ketting, de puzzel, de kleine stap bij het samen voordoen), ± 6 s na de
 *            opdrachtzin; bij kiezen niets (15.19);
 *   snel     niets (er is geen draaiboek met een opmerking over snelheid; 6.10);
 *   einde    slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartPatronen, type Beeld, type Deel, type Ketting, type VormenProps } from "../vlakken/squla-vormen-vlak";
import { GoudenVormenVlak, type GoudenVormenProps, type Keuzeplek, type Punt } from "../vlakken/squla-vormen-gouden-vlak";
import type { Kleur } from "../vlakken/squla-vormen-tekenen";
import { zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import {
  AANMOEDIG,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  PUZZEL_FOUT,
  REACTIE_JA,
  REACTIE_ROBOT,
  VOORWERPEN,
  VRAGEN,
  ZIN,
  foutenVan,
  herhaal,
  kettingFout,
  metNaam,
  namen,
  patroonReactie,
  type Fout,
  type Kettingvraag,
  type Keuzevraag,
  type Puzzelvraag,
  type Rijtje,
  type Vraag,
} from "./squla-vormen-gouden-zinnen";

const LES_ID = "squla-vormen-patronen-1-gouden";

/* ---------- tempo (laag 1, zoals de andere gouden lessen) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;
/** Vangnet bij de ketting: zo lang zonder nakijken (het kind blijft schuiven), dan doen we het samen. */
const KETTING_VANGNET_MS = 45000;

/* ---------- het beeld (zelfde maten als de oude les) ---------- */

const rijX = (n: number, i: number, tussen: number) => 490 + (i - (n - 1) / 2) * tussen;
const KEUZE_Y = 590;
const keuzeX = (n: number, i: number) => rijX(n, i, n === 4 ? 190 : 230);
const KRAAL_R = 34;
const KRAAL_TUSSEN = 86;
const RIJ_Y = 250;

/** Een kralenketting: kralen aan een touw. `null` = een lege plek. Ids: "r-0", "r-1" … (zoals de oude les). */
function kralenRij(rij: (string | null)[], extraPlekken = 0, y = RIJ_Y): Deel[] {
  const n = rij.length + extraPlekken;
  const x0 = rijX(n, 0, KRAAL_TUSSEN) - 46;
  const x1 = rijX(n, n - 1, KRAAL_TUSSEN) + 46;
  return [{ s: "touw", id: "touw", punten: [x0, y, x1, y] }, ...rij.map((k, i): Deel => ({ s: "kraal", id: `r-${i}`, x: rijX(n, i, KRAAL_TUSSEN), y, r: KRAAL_R, kleur: k as Kleur | null }))];
}
/** Dingen op een rij met de lege plek en een pijl erboven (zoals de oude les). */
function dingenRij(rij: (string | null)[], gat: number): Deel[] {
  const n = rij.length;
  const tussen = Math.min(110, 880 / n);
  const maat = tussen * 0.82;
  const y = RIJ_Y + 10;
  const delen: Deel[] = rij.map((naam, i): Deel => (naam === null ? { s: "vorm", id: `r-${i}`, x: rijX(n, i, tussen), y, maat, vorm: "cirkel", kleur: null } : { s: "vw", id: `r-${i}`, naam, x: rijX(n, i, tussen), y, maat }));
  delen.push({ s: "pijl", id: "pijl", x: rijX(n, gat, tussen), y: y - maat / 2 - 48, lang: 74 });
  return delen;
}
/** Vormen op een rij; op de lege plek alleen de pijl (zoals de oude les). */
function vormenRij(v: Keuzevraag): Deel[] {
  const n = v.rij.length;
  const tussen = 104;
  const delen: Deel[] = v.rij.flatMap((x, i): Deel[] => (x === null ? [] : [{ s: "vorm", id: `r-${i}`, x: rijX(n, i, tussen), y: RIJ_Y, maat: 92, vorm: x as never, kleur: v.kleur![x] }]));
  delen.push({ s: "pijl", id: "pijl", x: rijX(n, n - 1, tussen), y: RIJ_Y, lang: 74 });
  return delen;
}
/** Het beeld van een keuzevraag: de rij en de 3 keuzes in een zacht vak (op een willekeurige plek, 1.23). */
function keuzeBeeld(v: Keuzevraag, volgorde: string[]): { beeld: Beeld; plekken: Keuzeplek[] } {
  const n = namen(v.wat, v.kleur);
  const plekken: Keuzeplek[] = volgorde.map((id, i) => {
    const b = v.wat === "kraal" ? 120 : 150;
    return { id, x: keuzeX(volgorde.length, i), y: KEUZE_Y, b, h: b, aria: n.kort(id) };
  });
  const keuzeDelen = plekken.flatMap((p): Deel[] => {
    const tek: Deel =
      v.wat === "kraal"
        ? { s: "kraal", id: `kz-${p.id}`, groep: p.id, x: p.x, y: p.y, r: 44, kleur: p.id as Kleur }
        : v.wat === "ding"
          ? { s: "vw", id: `kz-${p.id}`, groep: p.id, naam: p.id, x: p.x, y: p.y, maat: 120 }
          : { s: "vorm", id: `kz-${p.id}`, groep: p.id, x: p.x, y: p.y, maat: 120, vorm: p.id as never, kleur: v.kleur![p.id] };
    /* Het zachte vak achter de keuze (oude vlak, `vak`); tikken gaat via de knoppen van het gouden vlak. */
    return [tek, { s: "tik", id: `vak-${p.id}`, x: p.x, y: p.y, b: p.b, h: p.h, aria: p.aria, vak: true }];
  });
  const rij = v.wat === "kraal" ? kralenRij(v.rij) : v.wat === "ding" ? dingenRij(v.rij, v.plek) : vormenRij(v);
  return { beeld: { id: `${v.id}-${Math.random().toString(36).slice(2, 7)}`, delen: [...rij, ...keuzeDelen] }, plekken };
}

/** Voor de eigen test (vaste zone, 15.30): de rechterrand van alles wat het vlak tekent, in punten van het vlak. */
function rechtsVan(delen: Deel[]): number {
  return Math.max(
    0,
    ...delen.map((d) => {
      if (d.s === "kraal") return d.x + d.r;
      if (d.s === "touw") return Math.max(...d.punten.filter((_, i) => i % 2 === 0));
      if (d.s === "tik") return d.x + d.b / 2;
      if (d.s === "pijl") return d.x + 25;
      if (d.s === "vw" || d.s === "vorm") return d.x + d.maat / 2;
      return 0;
    }),
  );
}
/** De losse puzzelstukjes liggen tot x = 884 (oude vlak, LOS) plus een half stukje (390 / 3 / 2). */
const PUZZEL_RECHTS = 884 + 65;

/* ---------- staat per les ---------- */

type Uitkomst = "goed" | "naFout" | "samen";
type Staat = {
  vorige: Map<Rijtje | string, number>;
  recent: Map<Rijtje | string, number[]>;
  zinNr: number;
  robotNr: number;
  namen: number;
  naamKeer: number;
  naamVraag: number;
  opRij: number;
  momenten: Set<string>;
  vraag: number;
  haak: number;
  laatste: boolean;
  eerste: Map<string, Uitkomst>;
  vraagFouten: Map<string, string[]>;
  log: unknown[];
  robotReactie: boolean;
  nakijk: number;
  goedTeller: number;
  hint: number;
  legt: number;
  samenNr: number;
  kiesUitgelegd: boolean;
  sleepUitgelegd: boolean;
  puzzelUitgelegd: boolean;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG_V: Partial<GoudenVormenProps> = { beeld: null, licht: [], actief: false, ketting: null, puzzel: null, kies: null, hulphand: null };

const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [], robotReactie: false, nakijk: 0, goedTeller: 0, hint: 0, legt: 0, samenNr: 0, kiesUitgelegd: false, sleepUitgelegd: false, puzzelUitgelegd: false }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenVormenProps>) => l.pasVlakAan<GoudenVormenProps>(p);
/** Een nieuw beeld (Bliepo tovert het tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<GoudenVormenProps>) => zet(l, { ...LEEG_V, ...p });
/** De lichtgolf bij goed (7.6: geen gloed om de keuze, wel een korte golf). */
const golf = (l: Lesgids) => zet(l, { goed: ++st(l).goedTeller });

/** Zinnen van Bliepo, met {naam} ingevuld (hooguit 2 keer per les; daarna valt de naam netjes weg). */
const zeg = (l: Lesgids, ...zinnen: string[]) =>
  l.zeg(
    ...zinnen.map((z) => {
      if (!z.includes("{naam}")) return z;
      const s = st(l);
      s.namen++;
      return metNaam(z, s.namen <= 2 ? l.naam : "");
    }),
  );

/** Een klein logboek voor de eigen test (window.__gouden). Verandert niets aan de les. */
function log(l: Lesgids, wat: string, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const s = st(l);
  s.log.push({ t: Math.round(performance.now()), wat, ...extra });
  (window as unknown as { __gouden?: unknown[] }).__gouden = s.log;
}

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.vormTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, vormTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
}

/* ---------- denkfouten en uitkomsten bewaren (zoals de andere gouden lessen) ---------- */

function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const w = window as unknown as { __denkfouten?: unknown[] };
  (w.__denkfouten ??= []).push({ les: LES_ID, tijd: new Date().toISOString(), ...d });
}

function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  if (!s.eerste.has(vraag)) s.eerste.set(vraag, uit);
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  if (typeof window === "undefined") return uit;
  const naam = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  try {
    void bewaarUitkomst({ lesId: LES_ID, vraagId: vraag, uitkomst: naam[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 }).catch(() => {});
  } catch {
    /* bewaren mislukt: de les gaat gewoon door */
  }
  const w = window as unknown as { __uitkomsten?: unknown[] };
  (w.__uitkomsten ??= []).push({ les: LES_ID, vraag, uitkomst: { goed: "goed-in-een-keer", naFout: "goed-na-fout", samen: "samen-gedaan" }[uit], teltVoorBeheersing: uit === "goed", denkfouten: fouten, tijd: new Date().toISOString() });
  return uit;
}

/** "Volgende keer gaat het nog beter" alleen als de helft of meer niet in 1 keer goed was (15.13 punt 3). */
function veelFouten(l: Lesgids): boolean {
  const alle = [...st(l).eerste.values()];
  return alle.length > 0 && alle.filter((x) => x !== "goed").length * 2 >= alle.length;
}

/* ---------- het vaste rijtje (zelfde regels als de andere gouden lessen) ---------- */

const NAKIJK = /nakijk|nagekeken/i;
const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();

/** Een zin uit een rijtje; `sleutel` = welk rijtje (een reactie-rijtje wordt per vraag opnieuw gemaakt). */
function kies(l: Lesgids, r: Rijtje, zonder: number[] = [], sleutel: Rijtje | string = r): string {
  const s = st(l);
  s.zinNr++;
  const vorige = s.vorige.get(sleutel) ?? -1;
  /* Niet alleen niet 2 keer achter elkaar: ook geen zin die er net nog was (F7, 15.28). */
  const recent = (s.recent.get(sleutel) ?? []).slice(-Math.max(1, Math.min(8, r.zinnen.length - 3)));
  const robotMag = s.zinNr - s.robotNr > 6;
  /* "Nakijken" hooguit 2 keer per les, in lof, momenten en reacties samen (geleerd bij Splitsen). */
  const nakijkOp = s.nakijk >= 2;
  const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !recent.includes(i) && !zonder.includes(i) && (robotMag || !r.robot.includes(i)) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i) && !(nakijkOp && NAKIJK.test(r.zinnen[i])));
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(sleutel, i);
  s.recent.set(sleutel, [...(s.recent.get(sleutel) ?? []), i]);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  if (NAKIJK.test(r.zinnen[i])) s.nakijk++;
  return r.zinnen[i];
}

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; met een korte reactie. */
function lofZinnen(l: Lesgids, v: Vraag, eerste: boolean): string[] {
  const s = st(l);
  s.opRij++;
  const moment = (naam: keyof typeof MOMENT, nu: boolean) => {
    if (!nu || s.momenten.has(naam)) return null;
    s.momenten.add(naam);
    return kies(l, MOMENT[naam]);
  };
  let lof = moment("laatste", s.laatste) ?? moment("eerste", eerste) ?? moment("drieOpRij", s.opRij >= 3);
  if (!lof && s.naamKeer < 2 && s.namen < 2 && s.vraag - s.naamVraag >= 4 && s.opRij >= 2 && l.naam) {
    s.naamKeer++;
    s.naamVraag = s.vraag;
    lof = kies(l, NAAM_LOF);
  }
  /* "Dat heb je goed gezien" alleen bij een kijkvraag (kiezen); niet bij de ketting en de puzzel (slepen). */
  lof ??= kies(l, LOF, v.soort === "keuze" ? [] : [LOF_KIJK_INDEX]);
  const reactie = patroonReactie(v);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...REACTIE_JA);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(REACTIE_ROBOT);
  const r = kies(l, reactie, zonder, `reactie-${v.soort}`);
  if (r === reactie.zinnen[REACTIE_ROBOT]) s.robotReactie = true;
  return [lof, r];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG);
};
/** De eerste zin bij de 2e fout met een ander antwoord: "Nu koos je …" in plaats van weer "Je koos …". */
const nuKoos = (z: string) => z.replace(/^Je koos /, "Nu koos je ").replace(/^Je sleepte /, "Nu sleepte je ");
/** "Kom, we kijken samen." in 3 versies, om de beurt (LESRECEPT, geleerd bij de omzetting Tellen en Splitsen). */
const samenZin = (l: Lesgids) => ZIN.samen[st(l).samenNr++ % ZIN.samen.length];

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- DE VERDER-PIJL (15.27, zoals de andere gouden lessen) ---------- */

/** Bliepo zegt een stuk tekst; de les gaat ±0,7 s na de stem vanzelf door. De pijl staat erbij; een tik = meteen door. */
async function zegDoor(l: Lesgids, ...zinnen: string[]): Promise<boolean> {
  zinnen = zinnen.filter(Boolean);
  if (!zinnen.length) return false;
  log(l, "pijl-door", { zin: zinnen.join(" ") });
  const p = l.verder();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const wie = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (wie === "getikt") {
    log(l, "pijl-getikt");
    return true;
  }
  log(l, "zin-klaar");
  const tik = await Promise.race([l.wacht(DOOR_NA_MS).then(() => false), p.then(() => true)]);
  if (tik) log(l, "pijl-getikt");
  return tik;
}

/** De zin bij een opdracht: geen pijl; de les wacht daarna op de opdracht. Doet het kind hem al tijdens de zin, dan meteen door. */
async function zegOpdracht(l: Lesgids, zinnen: string[], melding: Promise<unknown>) {
  log(l, "opdrachtzin", { zin: zinnen.join(" ") });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  await Promise.race([z, melding]);
}

/** Het hulphandje na ± 6 s stilte (gerekend vanaf het einde van de opdrachtzin), met 1 korte zin (alleen de 1e keer per opdracht). */
function handKlok(l: Lesgids, plek: () => Punt | null, zin: string) {
  let gezegd = false;
  let weg = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const zetAan = () => {
    clearTimeout(klok);
    if (weg) return;
    klok = setTimeout(() => {
      const p = plek();
      if (!p || weg) return;
      log(l, "aanwijzing");
      zet(l, { hulphand: { plek: p, sleutel: `hand-${Date.now()}` } });
      if (!gezegd) {
        gezegd = true;
        void zeg(l, `${AANMOEDIG[Math.floor(Math.random() * AANMOEDIG.length)]} ${zin}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  return {
    opnieuw: () => {
      zet(l, { hulphand: null });
      zetAan();
    },
    /** Meteen het handje (bij het samen voordoen na een tik op iets anders: het antwoord staat dan al in beeld). */
    nu: () => {
      const p = plek();
      if (p && !weg) zet(l, { hulphand: { plek: p, sleutel: `hand-${Date.now()}` } });
    },
    stop: () => {
      weg = true;
      clearTimeout(klok);
      zet(l, { hulphand: null });
    },
  };
}

/** Wat Bliepo zegt bij een fout, uit de fouttabel (zelfde regels als de andere gouden lessen). */
function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
  const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  if (poging === 1) return [eerste, f.hint];
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  const zelfde = eerder !== null && eerder.soort === f.soort && f.weer.length > 0 && f.code !== "onduidelijk";
  return zelfde ? f.weer : [eerste, f.uitleg];
}
const onduidelijk = (): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: "Kijk naar het begin. Zoek het stukje dat steeds terugkomt.", uitleg: "Een patroon gaat steeds in dezelfde volgorde.", weer: [], scherm: "", over: [], bewering: { soort: "geen" } });

/* ---------- kiezen: tik op een keuze (vinkje) en dan op het vinkje van het lesscherm ---------- */

/**
 * Het kind tikt een keuze (alleen een vinkje erop; nog een tik haalt het weg, een andere keuze neemt het over) en dan
 * het vinkje van het lesscherm (6.5). Een tik tijdens de vraagzin telt. Geen pijl. `naZin`: als de zin klaar is (het
 * rondje van de hint gaat dan weg, 7.8).
 */
async function kiesKeuze(l: Lesgids, plekken: Keuzeplek[], zinnen: string[], naZin?: () => void): Promise<string> {
  const ids = plekken.map((p) => p.id);
  let gekozen: string | null = null;
  zet(l, { kies: { gekozen, tikbaar: ids, plekken } });
  log(l, "vraag", { zin: zinnen.join(" "), opties: ids });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(
    () => {
      log(l, "vraag-klaar");
      naZin?.();
    },
    () => {},
  );
  for (;;) {
    type Uit = { t: { soort: string; id: string } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; id: string }>("vormKies").then((t) => ({ t }));
    const knopP: Promise<Uit> | null = gekozen === null ? null : l.knoppen(["controleer"]).then(() => ({ t: null }));
    const r: Uit = await Promise.race(knopP ? [tik, knopP] : [tik]);
    if (!r.t) break;
    gekozen = gekozen === r.t.id ? null : r.t.id;
    log(l, "kies", { gekozen });
    speelLesgeluid("tik");
    zet(l, { kies: { gekozen, tikbaar: ids, plekken } });
  }
  log(l, "tik", { x: gekozen });
  zet(l, { kies: { gekozen, tikbaar: [], plekken } });
  return gekozen as string;
}

/**
 * De kleine stap bij het samen voordoen: het kind tikt de keuze met het rondje aan. Een tik op iets anders: het handje
 * wijst meteen het goede aan (het antwoord staat al in beeld). Vangnet: 20 s niets of 3 keer iets anders, dan doet
 * Bliepo het zelf. Geeft true als Bliepo het zelf deed.
 */
async function tikSamen(l: Lesgids, o: { plekken: Keuzeplek[]; goed: string; zin: string; handZin: string; vraag: string }): Promise<boolean> {
  const ids = o.plekken.map((p) => p.id);
  zet(l, { kies: { gekozen: null, tikbaar: ids, plekken: o.plekken } });
  haak(l, { soort: "samenTik", goed: o.goed, vraag: o.vraag });
  zetTestAntwoord(o.goed);
  const p = o.plekken.find((x) => x.id === o.goed)!;
  /* Het handje schuin rechtsonder in het vak, niet over de keuze zelf (geleerd bij Tellen). */
  const hand = handKlok(l, () => ({ x: p.x + p.b * 0.3, y: p.y + p.h * 0.28 }), o.handZin);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [o.zin], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    let mis = 0;
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("vormKies"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null || (t.id !== o.goed && ++mis >= 3)) {
        log(l, "vangnet", { mis });
        zelf = true;
        break;
      }
      log(l, "tik", { x: t.id, samen: true });
      if (t.id === o.goed) break;
      hand.nu();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zetTestAntwoord(null);
  return zelf;
}

async function samenKeuze(l: Lesgids, v: Keuzevraag, plekken: Keuzeplek[], id: string) {
  zet(l, { kies: null });
  await zegDoor(l, samenZin(l));
  /* Bliepo wijst het stukje aan dat steeds terugkomt (het eerste stukje van de rij). */
  zet(l, { licht: v.eenheid.map((_, i) => `r-${i}`) });
  await zegDoor(l, ZIN.samenPatroon(v.wat, v.eenheid, v.kleur));
  /* Nu pas het goede antwoord in beeld: het rondje om de goede keuze (15.11). */
  zet(l, { licht: [v.goed] });
  await zegDoor(l, ZIN.samenGoed(v));
  const zelf = await tikSamen(l, { plekken, goed: v.goed, zin: ZIN.samenJij(v), handZin: ZIN.samenHand, vraag: id });
  zet(l, { kies: { gekozen: v.goed, tikbaar: [], plekken }, licht: [] });
  golf(l);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenZelf(v) : ZIN.samenKlaar(v));
}

async function keuzeVraag(l: Lesgids, v: Keuzevraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  void l.zeg().catch(() => {});
  const { beeld, plekken } = keuzeBeeld(v, schud(v.keuzes));
  nieuwBeeld(l, { beeld });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  const fouten = foutenVan(v);
  let zinnen = ZIN.vraag(v, !s.kiesUitgelegd);
  s.kiesUitgelegd = true;
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  let naZin: (() => void) | undefined;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(v.goed);
    haak(l, { soort: "keuze", opties: plekken.map((p) => p.id), goed: v.goed, fout: v.keuzes.filter((k) => k !== v.goed), poging, vraag: id, rechts: rechtsVan(beeld.delen) }, poging === 1);
    const x = await kiesKeuze(l, plekken, zinnen, naZin);
    haak(l, null);
    zetTestAntwoord(null);
    zet(l, { licht: [] });
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      golf(l);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). Het vinkje gaat weg. */
    bliepoScherm("fout");
    s.opRij = 0;
    zet(l, { kies: null });
    const f = fouten[x] ?? onduidelijk();
    legDenkfoutVast(l, { vraag: id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && x === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerGekozen(v, x);
    /* Een ander fout antwoord bij de 2e fout: niet 2 keer "Je koos …" achter elkaar (keuring Tellen en Splitsen). */
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* Het rondje om de gekozen keuze zolang Bliepo hem noemt (7.8; nooit om het antwoord, 15.17). */
    zet(l, { licht: [x] });
    log(l, "rondje", { ids: [x], wanneer: "fout", goed: v.goed });
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint en de vraag kort zijn de nieuwe vraagzin; de keuzes komen meteen terug (geen 2 keer de vraag,
         LESRECEPT Ronde 30; de hint zegt waar het over gaat, F1). */
      /* Zegt de hint zelf al waar het over gaat ("… Kijk wat daarna komt." bij "Welke kraal komt na …?"), dan niet nog
         eens de vraag erachter: dat is dubbel en te lang voor het vaste tekstvak (15.30; geleerd bij Geld). */
      zinnen = v.vorm === "na" && /Kijk wat daarna komt\./.test(fz[1] ?? "") ? [...fz.slice(1)] : [...fz.slice(1), ZIN.opnieuw(v)];
      eerder = f;
      eersteX = x;
      naZin = undefined;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind tikt de goede keuze aan. */
    await zegDoor(l, ...fz.slice(1));
    await samenKeuze(l, v, plekken, id);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de ketting langer maken (een opdracht: slepen, dan het vinkje) ---------- */

/** De lege plekken en de losse kralen (zelfde plekken als de oude les). */
function kettingBeeld(v: Kettingvraag, ronde: string, plekken: number, losse: Kleur[], doel: Kleur[], getoond: Kleur[]): Ketting {
  const n = getoond.length + plekken;
  return {
    id: `${v.id}-${ronde}`,
    plekken: Array.from({ length: plekken }, (_, i) => ({ x: rijX(n, getoond.length + i, KRAAL_TUSSEN), y: RIJ_Y })),
    losse: losse.map((k, i) => ({ id: k, kleur: k, x: keuzeX(losse.length === 1 ? 3 : losse.length, losse.length === 1 ? 1 : i), y: KEUZE_Y })),
    r: KRAAL_R + 4,
    doel,
  };
}
/** Waar het handje bij de ketting komt: bij de eerste lege plek (daar moet een kraal heen; het zegt niet welke). */
const plekPunt = (k: Ketting): Punt => ({ x: k.plekken[0].x + 22, y: k.plekken[0].y + 26 });

/**
 * Wacht tot de ketting vol is en het kind op het vinkje tikt (6.5). Het kind mag schuiven tot het vinkje. Vangnet: na
 * lange tijd zonder nakijken (het kind blijft schuiven of doet niets) geeft dit `null`: dan doen we het samen.
 */
async function kettingAntwoord(l: Lesgids, hand: ReturnType<typeof handKlok>, vangnetMs: number): Promise<string[] | null> {
  let vol: string[] | null = null;
  const tot = Date.now() + vangnetMs;
  for (;;) {
    type Uit = { soort: string; ids?: string[] } | { soort: "vinkje" } | { soort: "tijd" };
    const ev: Promise<Uit> = l.wachtOpVlak<{ soort: string; ids?: string[] }>(["kettingVol", "kettingOpen", "kettingKraal"]);
    const knopP: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ soort: "vinkje" as const })) : null;
    const tijd: Promise<Uit> = l.wacht(Math.max(0, tot - Date.now())).then(() => ({ soort: "tijd" as const }));
    const r: Uit = await Promise.race(knopP ? [ev, knopP, tijd] : [ev, tijd]);
    if (r.soort === "tijd") return null;
    if (r.soort === "vinkje") return vol;
    /* Het kind schoof een kraal (voor de eigen test een actie van het kind, zoals een tik). */
    log(l, "kies", { kraal: r.soort });
    hand.opnieuw();
    if (r.soort === "kettingVol") vol = (r as { ids?: string[] }).ids ?? null;
    if (r.soort === "kettingOpen") vol = null;
  }
}

async function samenKetting(l: Lesgids, v: Kettingvraag, id: string) {
  await zegDoor(l, samenZin(l));
  /* Bliepo wijst het stukje aan dat steeds terugkomt. */
  nieuwBeeld(l, { beeld: { id: `${id}-samen`, delen: kralenRij(v.rij, 3) } });
  zet(l, { licht: v.eenheid.map((_, i) => `r-${i}`) });
  await zegDoor(l, ZIN.samenPatroon("kraal", v.eenheid));
  /* Nu pas het antwoord in beeld: Bliepo legt de eerste 2 kralen; het kind sleept de laatste (de kleine stap). */
  const getoond = [...v.rij, v.doel[0], v.doel[1]];
  nieuwBeeld(l, { beeld: { id: `${id}-samen2`, delen: kralenRij(getoond, 1) }, licht: [`r-${v.rij.length}`, `r-${v.rij.length + 1}`] });
  await zegDoor(l, ZIN.samenKetting(v));
  zet(l, { licht: [] });
  const k = kettingBeeld(v, "samen", 1, [v.doel[2]], [v.doel[2]], getoond);
  zet(l, { ketting: k, actief: true });
  haak(l, { soort: "samenKetting", goed: [v.doel[2]], losse: k.losse, plekken: k.plekken, vraag: id, rechts: rechtsVan(kralenRij(getoond, 1)) });
  const hand = handKlok(l, () => plekPunt(k), ZIN.samenKettingHand);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.samenKettingJij], gedaan).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string }>(["kettingVol", "kettingKraal"]), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null) {
        log(l, "vangnet", {});
        zelf = true;
        break;
      }
      log(l, "kies", { kraal: t.soort });
      if (t.soort === "kettingVol") break;
      hand.opnieuw();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  zet(l, { actief: false });
  if (zelf) nieuwBeeld(l, { beeld: { id: `${id}-af`, delen: kralenRij(herhaal(v.eenheid, v.rij.length + 3)) } });
  golf(l);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? ZIN.samenKettingZelf : ZIN.samenKettingKlaar);
}

async function kettingVraag(l: Lesgids, v: Kettingvraag, eersteVraag: boolean): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { beeld: { id: `${id}-beeld`, delen: kralenRij(v.rij, 3) } });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  /* Eerst wat er moet gebeuren (1 stuk, met de pijl), dan de opdracht: zo blijft elk stuk kort genoeg (15.30). */
  await zegDoor(l, ZIN.kettingIntro);
  let opdracht = [ZIN.kettingOpdracht];
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const k = kettingBeeld(v, `p${poging}`, 3, v.losse, v.doel, v.rij);
    zet(l, { ketting: k, actief: true });
    haak(l, { soort: "ketting", goed: v.doel, losse: k.losse, plekken: k.plekken, poging, vraag: id, rechts: Math.max(rechtsVan(kralenRij(v.rij, 3)), ...k.losse.map((x) => x.x + k.r)) }, poging === 1);
    const hand = handKlok(l, () => plekPunt(k), ZIN.kettingHand);
    let eersteTik: (() => void) | null = null;
    const gedaan = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, opdracht, gedaan).then(() => hand.opnieuw(), () => {});
    let gelegd: string[] | null;
    try {
      gelegd = await kettingAntwoord(l, hand, KETTING_VANGNET_MS);
    } finally {
      hand.stop();
    }
    (eersteTik as (() => void) | null)?.();
    haak(l, null);
    zet(l, { actief: false });
    if (gelegd === null) {
      /* Vangnet: lang niets nagekeken. Geen fout, wel samen voordoen (de les loopt nooit vast). */
      log(l, "vangnet", { ketting: true });
      await zegDoor(l, ZIN.kettingVangnet);
      await samenKetting(l, v, id);
      return noteer(l, id, "samen");
    }
    log(l, "tik", { x: gelegd.join(",") });
    await l.wacht(DENK_MS);
    if (gelegd.join() === v.doel.join()) {
      golf(l);
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const f = kettingFout(v, gelegd);
    const plek = gelegd.findIndex((x, p) => x !== v.doel[p]);
    const xNu = `${plek}:${gelegd[plek]}`;
    legDenkfoutVast(l, { vraag: id, antwoord: gelegd.join(","), denkfout: f.code, poging });
    const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && xNu === eersteX && fz[0] === f.eerste) fz[0] = ZIN.weerKetting(plek, gelegd[plek], plek > 0 ? v.doel[plek - 1] : null);
    else if (poging === 2 && eerder && fz[0] === f.eerste) fz[0] = nuKoos(fz[0]);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x: gelegd.join(","), denkfout: f.code, zin: fz.join(" ") });
    /* De kralen gaan terug naar beneden; bij de eerste kraal een rondje om de laatste kraal van de ketting (die noemt Bliepo). */
    zet(l, { ketting: null });
    const rondje = plek === 0 ? [`r-${v.rij.length - 1}`] : [];
    zet(l, { licht: rondje });
    log(l, "rondje", { ids: rondje, wanneer: "fout", goed: "de ketting" });
    await zegDoor(l, fz[0]);
    zet(l, { licht: [] });
    if (poging === 1) {
      /* 1e fout: de hint is de nieuwe opdrachtzin (bij een opdracht geen opdracht erachter, LESRECEPT Ronde 30). */
      opdracht = [...fz.slice(1)];
      eerder = f;
      eersteX = xNu;
      continue;
    }
    await zegDoor(l, ...fz.slice(1));
    await samenKetting(l, v, id);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de puzzel (een opdracht) ---------- */

async function puzzelVraag(l: Lesgids, v: Puzzelvraag): Promise<Uitkomst> {
  const s = st(l);
  const id = v.id;
  void l.zeg().catch(() => {});
  nieuwBeeld(l, { puzzel: { id: `${id}-${Date.now()}`, plaatje: v.plaatje, n: v.n } });
  speelLesgeluid("verschijn");
  /* Eerst even het hele plaatje (het oude vlak laat het 2,2 s zien), dan de opdracht. */
  await zegDoor(l, ZIN.puzzelIntro);
  const eerste = !s.puzzelUitgelegd;
  s.puzzelUitgelegd = true;
  haak(l, { soort: "puzzel", vraag: id, poging: 1, rechts: PUZZEL_RECHTS }, true);
  /* Het handje bij het bord (daar moeten de stukjes heen; het zegt niet welk stukje waar). */
  const hand = handKlok(l, () => ({ x: 480 + 30, y: 360 + 40 }), ZIN.puzzelHand);
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, [ZIN.puzzelOpdracht(eerste)], gedaan).then(() => hand.opnieuw(), () => {});
  let mis = 0;
  let samen = false;
  let vangnet = 0;
  let wijsNr = 0;
  try {
    for (;;) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string }>(["puzzelStuk", "puzzelMis", "puzzelKlaar"]), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t?.soort === "puzzelKlaar") break;
      if (t?.soort === "puzzelStuk") {
        log(l, "kies", { stukje: true });
        hand.opnieuw();
        continue;
      }
      if (t === null) {
        /* Vangnet (geleerd bij Splitsen): 20 s geen stukje erbij. De 1e keer legt Bliepo er 1, daarna maakt hij hem af. */
        vangnet++;
        samen = true;
        log(l, "vangnet", { puzzel: vangnet });
        hand.stop();
        if (vangnet === 1) {
          zet(l, { bliepoLegt: ++s.legt });
          await zegDoor(l, ZIN.puzzelVangnet1);
          hand.opnieuw();
          continue;
        }
        await zegDoor(l, ZIN.puzzelVangnet2);
        for (let i = 0; i < v.n * v.n; i++) {
          zet(l, { bliepoLegt: ++s.legt });
          await l.wacht(180);
        }
        await l.wachtOpVlak("puzzelKlaar");
        break;
      }
      /* Een stukje op een plek waar het niet past (een actie van het kind). */
      mis++;
      log(l, "kies", { stukje: false });
      hand.stop();
      bliepoScherm("fout");
      s.opRij = 0;
      legDenkfoutVast(l, { vraag: id, antwoord: "stukje op een verkeerde plek", denkfout: PUZZEL_FOUT.code, poging: Math.min(mis, 2) });
      if (mis === 1) {
        const zz = [PUZZEL_FOUT.eerste[v.nr % 2], PUZZEL_FOUT.hint[v.nr % 2]];
        log(l, "reactie", { soort: "fout1", vraag: id, x: "mis", denkfout: PUZZEL_FOUT.code, zin: zz.join(" ") });
        await zegDoor(l, zz[0]);
        /* Bij een opdracht is de hint de nieuwe opdrachtzin (geen pijl). */
        void zegOpdracht(l, [zz[1]], Promise.resolve()).catch(() => {});
        hand.opnieuw();
        continue;
      }
      if (mis === 2) {
        /* 2e keer: uitleg en samen voordoen (15.11): het rondje om de plek van 1 stukje, het kind sleept het erheen. */
        samen = true;
        const zz = [PUZZEL_FOUT.eerste[(v.nr + 1) % 2], PUZZEL_FOUT.uitleg];
        log(l, "reactie", { soort: "fout2", vraag: id, x: "mis", denkfout: PUZZEL_FOUT.code, zin: zz.join(" ") });
        await zegDoor(l, zz[0]);
        await zegDoor(l, zz[1]);
        await zegDoor(l, samenZin(l));
        zet(l, { hint: ++s.hint });
        log(l, "rondje", { ids: ["plek"], wanneer: "samen", goed: "plek van het stukje" });
        await zegDoor(l, ZIN.samenPuzzel);
        let klaar = false;
        void zegOpdracht(l, [ZIN.samenPuzzelJij], Promise.resolve()).catch(() => {});
        const t2 = await Promise.race([l.wachtOpVlak<{ soort: string }>(["puzzelStuk", "puzzelKlaar"]), l.wacht(VANGNET_MS).then(() => null)]);
        if (t2 === null) {
          zet(l, { bliepoLegt: ++s.legt });
          log(l, "vangnet", { puzzelSamen: true });
        }
        if (t2?.soort === "puzzelKlaar") klaar = true;
        zet(l, { hintWeg: s.hint });
        await zegDoor(l, t2 === null ? ZIN.samenPuzzelZelf : ZIN.samenPuzzelKlaar);
        if (klaar) break;
        void zegOpdracht(l, [ZIN.puzzelOpdracht(false)], Promise.resolve()).catch(() => {});
        hand.opnieuw();
        continue;
      }
      /* Na het samen voordoen: Bliepo wijst de plek aan (zoals de oude les), het kind sleept het stukje zelf. */
      zet(l, { hint: ++s.hint });
      log(l, "rondje", { ids: ["plek"], wanneer: "samen", goed: "plek van het stukje" });
      await zegDoor(l, ZIN.puzzelWijs[wijsNr % ZIN.puzzelWijs.length]);
      zet(l, { hintWeg: s.hint });
      void zegOpdracht(l, [ZIN.puzzelWijsJij[wijsNr++ % ZIN.puzzelWijsJij.length]], Promise.resolve()).catch(() => {});
      hand.opnieuw();
    }
  } finally {
    hand.stop();
  }
  haak(l, null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  const uit: Uitkomst = samen ? "samen" : mis ? "naFout" : "goed";
  const zz = uit === "goed" ? lofZinnen(l, v, false) : [bevestig(l)];
  log(l, "reactie", { soort: uit === "goed" ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
  await zegDoor(l, ...zz);
  return noteer(l, id, uit);
}

/* ---------- een vraag ---------- */

function speelVraag(l: Lesgids, v: Vraag, eerste: boolean): Promise<Uitkomst> {
  if (v.soort === "keuze") return keuzeVraag(l, v, eerste);
  if (v.soort === "ketting") return kettingVraag(l, v, eerste);
  return puzzelVraag(l, v);
}

/* ---------- de les ---------- */

/** Het beeld op het beginscherm (4.1): de blauw-gele ketting van de oude les. */
const BEGIN: Beeld = { id: "begin", delen: kralenRij(herhaal<Kleur>(["blauw", "geel"], 6)) };

const gouden: Lesdraaiboek = {
  id: "squla-vormen-patronen-1-gouden",
  titel: "Patronen",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Vormen en figuren · Patronen · level 1 · gouden les (nieuwe versie van squla-vormen-patronen-1) · geen Synthesis-les: skelet van de gouden lessen, eigen invulling",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  nacht: true,
  voorwerpen: VOORWERPEN,
  kaarttekening: KaartPatronen,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    l.vlak<GoudenVormenProps>(GoudenVormenVlak, { ...LEEG_V, beeld: BEGIN } as GoudenVormenProps & VormenProps);
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het bij de
       eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, ZIN.start);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 15 vragen van squla-vormen-patronen-1. */
    for (let i = 0; i < VRAGEN.length; i++) {
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 10) await zegDoor(l, kies(l, OVERGANG));
      await speelVraag(l, VRAGEN[i], i === 0);
    }

    /* Einde: slotzin, kaart, eindzin uit het rijtje en wat het kind met de kaart doet (geen pijl). */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, {});
    await zegDoor(l, ZIN.slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} ${ZIN.kaartTik}`);
    await tik;
  },
};

export const LESSEN_SQULA_VORMEN_GOUDEN: Lesdraaiboek[] = [gouden];
