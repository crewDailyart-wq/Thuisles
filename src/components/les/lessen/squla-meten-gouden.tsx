/**
 * DE GOUDEN LES METEN (10 november 2026; BOUWREGELS hoofdstuk 15, 15.21, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-meten-oppervlakte-1-gouden — een NIEUWE versie naast squla-meten-oppervlakte-1 "Hoe groot is het?"
 *   (BOUWREGELS 15.8). De oude les (squla-meten.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze
 *   versie de oude voor kinderen.
 *
 * Waarom deze Squla-les: van de 7 Squla-lessen Meten (pizza 1–3, hoeveelheden 1–2, oppervlakte 1–2) past alleen
 * "Hoe groot is het?" bij het draaiboek Meten (Area: Cover It Up: welke is groter, tel de tegels die het bedekt;
 * KOPPELING.md §11). Pizza's en vol/leeg/zwaar/licht hebben geen Synthesis-les. Level 1 (oppervlakte-1) is gekozen:
 * groep 3, getallen tot 12, en het heeft "even groot / groter" (Cover It Up stap 5) en "tel de blaadjes" (stap 3) met
 * gelijke tegels; level 2 gaat over grote en kleine blaadjes (alleen Tile Sizes, maar kort bekeken). KEUZES Ronde 28.
 *
 * Inhoud (15.21, 15.22 punt 1): die van squla-meten-oppervlakte-1. Dezelfde 12 vragen in dezelfde volgorde, dezelfde
 * tekeningen, getallen en keuzes, en daarna komen 3 vragen terug (eerst wat niet meteen goed was, aangevuld met de vaste
 * reserve), zoals de oude les: samen 15. Niets toegevoegd, niets weggelaten (15.21: geen gok, geen tegels leggen, geen
 * Max, geen eenheden, geen trapkleed).
 *
 * Skelet (15.22 punt 3): het draaiboek Meten (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meten.md):
 *   begin    geen startvraag (§1: "meteen de eerste vraag"); bij ons de groet en het uitlegdeel in 1 stuk (laag 1);
 *   vraag    het beeld komt, de vraag met de keuzes tegelijk; een tik is het antwoord (§0); kies er 2 en op volgorde
 *            gaan met het vinkje (6.5); typen in een echt invulvak (HARDE REGEL 5); bij typen mag het kind de blaadjes
 *            aantikken om te tellen (§0 "tegels aantikken om ze te markeren": een nummer in de kleur van de blaadjes);
 *   goed     scherm 1 s groen, korte lof met een reactie, bij typen het getal naast de tafel ("10 blaadjes", §3 C.4);
 *            vanzelf door ±0,7 s (15.27; draaiboek 0,6–0,7 s);
 *   fout     1e fout: eerste zin + hint uit de fouttabel (§3 C.3: een eigen zin per fout getal), de vraag in andere
 *            woorden, de nummers van het kind blijven staan (§3 C.3); 2e fout: uitleg, dan SAMEN (§3 G: samen tellen;
 *            het kind tikt elk ding aan en Bliepo zegt het getal), nu pas het antwoord in beeld; nooit stoppen (15.18);
 *   hulp     hulphandje alleen bij doe-opdrachten (op volgorde, samen tellen, de kleine stap), ± 6 s na de opdrachtzin;
 *            bij keuzes en typen niets (§4: "bij keuzevragen met knoppen: niets");
 *   snel     niets (§3 A.2 en C.2: Synthesis zegt niets over snelheid);
 *   einde    slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *
 * De verder-pijl (15.27): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem vanzelf verder (`zegDoor`).
 * De pijl staat rechts onder de tekst als snelkoppeling. Bij vragen en opdrachten staat er geen pijl.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout,
 * samen gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 */

import { WAS_NAKIJKEN } from "./squla-klok-gouden-zinnen";
import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import type { MetenProps, MDing } from "../vlakken/squla-meten-vlak";
import { METEN_VOORWERPEN } from "../vlakken/squla-meten-tekeningen";
import { GoudenMetenVlak, kaartenVan, losseVan, omPunten, puntenVan, schilderijVan, vakkenVan, velVan, grootVan, type GoudenMetenProps, type Merk, type Punt } from "../vlakken/squla-meten-gouden-vlak";
import { zegTelwoord, zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { stopPraten, zegEnWacht } from "@/lib/stem";
import { metUitspraak } from "../voorkeuren";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { percentageGoed } from "@/lib/les-kleuren";
import { EIND_TIK_KAART, eindzin } from "../eindzinnen";
import {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  REACTIE_JA,
  REACTIE_ROBOT,
  RESERVE,
  TEGELS,
  VRAGEN,
  ZIN,
  foutReactie,
  foutenVan,
  isKijkvraag,
  metNaam,
  metenFout,
  metenReactie,
  nieuweKiezer,
  type Fout,
  type Licht,
  type Rijtje,
  type Vraag,
} from "./squla-meten-gouden-zinnen";
import { alleenBijKeuze } from "./squla-klok-gouden-zinnen";

const LES_ID = "squla-meten-oppervlakte-1-gouden";

/* ---------- tempo (draaiboek Meten §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,15–0,3 s na een tik). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27; draaiboek 0,6–0,7 s). */
const DOOR_NA_MS = 400;
/** Vangnet bij een kleine stap (LESRECEPT, geleerd bij Splitsen en Meer-minder): na zoveel stilte doet Bliepo de stap zelf. */
const VANGNET_MS = 20000;

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
  /** Alle denkfouten van deze speelbeurt (voor het resultaat van de kaart op het eindscherm, 15.55). */
  alleDenkfouten: string[];
  log: unknown[];
  robotReactie: boolean;
  nakijk: number;
  nr: number;
  golf: number;
  typNr: number;
  ordenUitgelegd: boolean;
  tweeUitgelegd: boolean;
  /** Wat het oude vlak nu laat zien (om plekken uit te rekenen). */
  m: MetenProps;
};
const STAAT = new WeakMap<Lesgids, Staat>();

const LEEG_M: Omit<MetenProps, "nr"> = { groot: null, tel: [], balans: null, vergelijk: null, kaarten: [], kaartenActief: false, uit: [], goed: [], fout: [], licht: [], gekozen: [], orden: null, naspeel: null };
const LEEG_G: Partial<GoudenMetenProps> = { kies2: null, merken: [], tik: null, typ: null, label: null, vakTerug: null, velTik: null, rondje: null, hulphand: null };

const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), alleDenkfouten: [], log: [], robotReactie: false, nakijk: 0, nr: 0, golf: 0, typNr: 0, ordenUitgelegd: false, tweeUitgelegd: false, m: { ...LEEG_M, nr: 0 } }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenMetenProps>) => l.pasVlakAan<GoudenMetenProps>(p);
/** Iets aan het beeld van het oude vlak veranderen (en onthouden, voor de plekken). */
const pasM = (l: Lesgids, p: Partial<MetenProps>) => {
  const s = st(l);
  s.m = { ...s.m, ...p };
  zet(l, p);
};
/** Een nieuw beeld (Bliepo tovert het tevoorschijn): alles van de vorige vraag weg. */
const nieuwBeeld = (l: Lesgids, p: Partial<MetenProps>) => {
  const s = st(l);
  s.m = { ...LEEG_M, nr: ++s.nr, ...p };
  zet(l, { ...s.m, ...LEEG_G });
};

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

/** Voor de eigen test: wat de les nu vraagt (window.__phaser.mtTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, mtTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
}

/* ---------- denkfouten en uitkomsten bewaren (zoals de andere gouden lessen) ---------- */

function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
  const s = st(l);
  s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
  if (typeof window === "undefined") return;
  const w = window as unknown as { __denkfouten?: unknown[] };
  (w.__denkfouten ??= []).push({ les: LES_ID, tijd: new Date().toISOString(), ...d });
}

/* Voortgangsbalk (BOUWREGELS 15.54): zoveel vragen heeft een normale route; vragen die alleen na een fout terugkomen
   tellen niet mee (Math.min). Na elke afgeronde vraag een stukje verder; nooit terug (het lesscherm negeert een lagere waarde). */
const balkTotaal = (): number => VRAGEN.length + 3;

function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  const nieuweVraag = !s.eerste.has(vraag);
  if (nieuweVraag) s.eerste.set(vraag, uit);
  l.voortgang?.(Math.min(1, s.eerste.size / balkTotaal()));
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  s.alleDenkfouten.push(...fouten);
  if (typeof window === "undefined") return uit;
  const naam = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  /* Een sleutel per vraag is maar 1 keer te verdienen, ook bij opnieuw spelen (15.52, 15.55; zoals noteer in
     squla-extra-basis.ts): zegt de server "al verdiend", dan vliegt er geen sleutel; weet hij niets, dan wel. */
  /* Een vraag die terugkomt ("-terug") is dezelfde vraag: geen 2e sleutel (15.55: 1 sleutel per vraag). */
    const eerstKeer = uit === "goed" && nieuweVraag && !vraag.endsWith("-terug");
  try {
    void bewaarUitkomst({ lesId: LES_ID, vraagId: vraag, uitkomst: naam[uit], denkfouten: uit === "goed" ? [] : fouten, pogingen: uit === "goed" ? 1 : 2 })
      .then((r) => {
        if (eerstKeer && !(r.ok && r.nieuweSleutel === false)) l.sleutel?.();
      })
      .catch(() => {
        if (eerstKeer) l.sleutel?.();
      });
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

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen): alle zinnen in varianten (ZIN en de
 * fouttabel) kiest de les met de gedeelde kiezer (nooit-dubbel.ts). Nooit dezelfde zin 2 keer achter elkaar, ook niet over
 * vragen heen (en ook niet als je de les nog een keer speelt: de kiezer leeft zolang de pagina open is). "Je typte weer
 * 9." en "Je typte weer 11." tellen als dezelfde zin, net als dezelfde zin over een tafel en over een muurtje.
 */
const KIEZER = nieuweKiezer();
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);

/* De zinnen die vroeger "nagekeken" zeiden (19 nov 2026: het woord is weg; zie WAS_NAKIJKEN). */
const NAKIJK = WAS_NAKIJKEN;
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

/** Een lofzin (zonder reactie): een speciaal moment, soms de naam, anders een lofzin. */
function lofZin(l: Lesgids, kijk: boolean, eerste: boolean): string {
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
  /* "Dat heb je goed gezien" alleen bij kijkvragen. */
  lof ??= kies(l, LOF, [...(kijk ? [] : [LOF_KIJK_INDEX]), ...alleenBijKeuze(l, LOF)]);
  return lof;
}

/** Lof bij goed in 1 keer, met daarachter een korte reactie op wat het kind koos (BLIEPO-KARAKTER §4 Meten). */
function lofZinnen(l: Lesgids, v: Vraag, eerste: boolean): string[] {
  const s = st(l);
  const lof = lofZin(l, isKijkvraag(v), eerste);
  const reactie = metenReactie(v);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof));
  if (/\bja\b/i.test(lof)) zonder.push(...REACTIE_JA);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie || s.zinNr - s.robotNr <= 2) zonder.push(REACTIE_ROBOT);
  const r = kies(l, reactie, zonder, "reactie");
  if (r === reactie.zinnen[REACTIE_ROBOT]) s.robotReactie = true;
  return [lof, r];
}
const bevestig = (l: Lesgids) => {
  st(l).opRij = 0;
  return kies(l, BEVESTIG, alleenBijKeuze(l, BEVESTIG));
};

function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Losse plaatjes nooit al op volgorde, en bij 3 of meer ook nooit precies omgekeerd (zoals de oude les). */
function mengOrden<T extends { id: string }>(lijst: T[], juist: string[]): T[] {
  for (let i = 0; i < 40; i++) {
    const a = schud(lijst);
    const v = a.map((k) => k.id).join("|");
    if (v !== juist.join("|") && v !== [...juist].reverse().join("|")) return a;
  }
  const g = juist.map((id) => lijst.find((k) => k.id === id)!);
  return [g[1], g[0], ...g.slice(2)];
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
function handKlok(l: Lesgids, plek: () => { plek: Punt; naar?: Punt | null } | null, zinnen: readonly string[]) {
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
      zet(l, { hulphand: { ...p, sleutel: `hand-${Date.now()}` } });
      if (!gezegd) {
        gezegd = true;
        /* De zin wordt pas gekozen als Bliepo hem echt zegt: een zin die niemand hoorde telt niet mee voor "nooit 2 keer". */
        void zeg(l, `${variant("aanmoedig", AANMOEDIG_TIKKEN)} ${variant("hand", zinnen)}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  return {
    opnieuw: () => {
      zet(l, { hulphand: null });
      zetAan();
    },
    stop: () => {
      weg = true;
      clearTimeout(klok);
      zet(l, { hulphand: null });
    },
  };
}

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is, uit de fouttabel. Elke zin heeft varianten (18 november 2026); de
 * keuze zelf staat in squla-meten-gouden-zinnen.ts (`foutReactie`), zodat het fouttabel-script precies hetzelfde naspeelt.
 */
function foutZinnen(l: Lesgids, f: Fout, v: Vraag, x: string, poging: 1 | 2, eerder: Fout | null, eersteX: string | null): string[] {
  /* Denkfout niet duidelijk: een zin uit het vaste rijtje (BLIEPO-KARAKTER.md §10). */
  const onduidelijk = f.v.eerste.length ? "" : kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
  return foutReactie(KIEZER, { f, v, x, poging, eerder, eersteX, onduidelijk });
}

/* ---------- het beeld ---------- */

/** Het handje schuin naast een plek, in de lege ruimte (niet over een ander ding; geleerd bij Tellen). */
const plekNaast = (p: Punt): Punt => ({ x: p.x + 18, y: p.y + 26 });

type Ctx = { kaarten: MDing[]; losse: MDing[] };
const alsDing = (k: { id: string; tekening?: string; label?: string; zeg: string }): MDing => ({ id: k.id, tekening: k.tekening, label: k.label, zeg: k.zeg });

/** De volgorde van de kaartjes (1.23: het goede antwoord staat niet steeds op dezelfde plek). */
function maakCtx(v: Vraag): Ctx {
  return { kaarten: v.kaarten ? schud(v.kaarten).map(alsDing) : [], losse: v.losse ? mengOrden(v.losse, v.juist!).map(alsDing) : [] };
}

/** Het beeld van een vraag in het oude vlak. */
function beeldVan(v: Vraag, c: Ctx): Partial<MetenProps> {
  if (v.soort === "orden") return { orden: { vakken: v.juist!.map(() => null), losse: c.losse, actief: false } };
  if (v.soort === "twee") return { groot: v.beeld, kaarten: c.kaarten };
  return { groot: v.beeld };
}

/** Het rondje van de fouttabel (alleen om wat Bliepo noemt, nooit om het antwoord). */
function rondjeVan(l: Lesgids, v: Vraag, f: Licht) {
  const m = st(l).m;
  if (!f) return null;
  if (f.soort === "rij") return omPunten(puntenVan(m).slice(f.rij * v.k!, f.rij * v.k! + v.k!));
  if (f.soort === "mat") {
    const pts = puntenVan(m);
    const n = v.stukken!;
    return omPunten(f.mat === 1 ? pts.slice(0, n) : pts.slice(n, 2 * n));
  }
  if (f.soort === "vel") return velVan(m);
  return vakkenVan(m)[f.i] ?? null;
}

/** Waar het invulvak (en daarna het getal "10 blaadjes") onder de tafel staat. */
function onderTafel(l: Lesgids): Punt {
  const gr = grootVan(st(l).m);
  return { x: gr ? gr.x : 490, y: gr ? Math.min(640, gr.y + gr.h / 2 + 70) : 600 };
}

/* ---------- antwoorden ---------- */

/** De keuzeknoppen bij Bliepo tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function kiesAntwoord(l: Lesgids, opties: string[], zinnen: string[]): Promise<string> {
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  /* De vraag is 1 uiting (LESRECEPT, geleerd bij Tellen en Meer-minder). */
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  if (eerst === "gezegd") log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x });
  return x;
}

/**
 * Kies er 2: een tik zet een vinkje op het kaartje (nog een tik haalt het weg; een 3e kaartje neemt het oudste over).
 * Bliepo zegt de vraag en leest de kaartjes voor (zoals de oude les; het kaartje dat hij leest licht op). Het vinkje van het
 * lesscherm kijkt na zodra er 2 vinkjes staan (6.5).
 */
async function tweeAntwoord(l: Lesgids, v: Vraag, c: Ctx, zinnen: string[], voorlezen: boolean): Promise<string> {
  const s = st(l);
  let gekozen: string[] = [];
  const goed = v.goed.split(",");
  const zetKies = (tikbaar: boolean) => zet(l, { kies2: { gekozen: [...gekozen], tikbaar: tikbaar ? c.kaarten.map((k) => k.id) : [] } });
  const test = () => zetTestAntwoord(goed.find((g) => !gekozen.includes(g)) ?? null);
  zetKies(true);
  test();
  let klaar = false;
  const z = s.tweeUitgelegd ? zinnen : [...zinnen, ZIN.tweeHoe];
  s.tweeUitgelegd = true;
  log(l, "vraag", { zin: z.join(" "), opties: c.kaarten.map((k) => k.id) });
  l.verderWeg?.();
  /*
    F16 (Sara, 18 november 2026; BOUWREGELS 15.37): Bliepo leest de kaartjes voor, maar de VRAAG blijft in zijn tekstvak
    staan. Eerst kwam elke kaartzin in het tekstvak ("Het schilderij met de zon is het kleinst.") en bleef de laatste
    staan terwijl de les op het kind wachtte: dan stond er geen vraag meer. De kaartzin staat al op het kaartje zelf
    (dat oplicht als Bliepo het leest), dus hij hoeft niet ook in het tekstvak (15.31).
  */
  let leest = false;
  let leestNu: string | null = null;
  let stopLezen: (() => void) | null = null;
  const gestopt = new Promise<void>((r) => (stopLezen = r));
  void (async () => {
    await zeg(l, z.join(" ")).catch(() => {});
    if (voorlezen)
      for (const k of c.kaarten) {
        if (klaar) break;
        if (!k.zeg) continue;
        /* Een gekozen kaartje licht niet op: daar staat alleen het vinkje (Sara, 19 nov 2026; 7.8a: een gloed die als
           "gekozen" leest mag niet). */
        leestNu = k.id;
        pasM(l, { licht: gekozen.includes(k.id) ? [] : [k.id] });
        leest = true;
        await Promise.race([zegEnWacht([metUitspraak(k.zeg, l.naam)]), gestopt]);
        leest = false;
        leestNu = null;
      }
    if (!klaar) {
      pasM(l, { licht: [] });
      log(l, "vraag-klaar");
    }
  })();
  for (;;) {
    type Uit = { t: { soort: string; id: string } | null };
    const tik: Promise<Uit> = l.wachtOpVlak<{ soort: string; id: string }>("kaartKies").then((t) => ({ t }));
    const knop: Promise<Uit> | null = gekozen.length === 2 ? l.knoppen(["controleer"]).then(() => ({ t: null })) : null;
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    const id = r.t.id;
    gekozen = gekozen.includes(id) ? gekozen.filter((x) => x !== id) : [...gekozen, id].slice(-2);
    log(l, "kies", { gekozen });
    /* Kiest het kind het kaartje dat Bliepo nu voorleest: dan gaat het oplichten meteen uit (alleen het vinkje). */
    if (leestNu && gekozen.includes(leestNu)) pasM(l, { licht: [] });
    speelLesgeluid("tik");
    zetKies(true);
    test();
  }
  klaar = true;
  (stopLezen as (() => void) | null)?.();
  if (leest) stopPraten();
  pasM(l, { licht: [] });
  zetKies(false);
  zetTestAntwoord(null);
  const x = [...gekozen].sort().join(",");
  log(l, "tik", { x });
  return x;
}

/**
 * Op volgorde: slepen of tikken (het oude vlak; een tik legt het plaatje in het eerste lege vak). Een plaatje dat al in een
 * vak ligt, gaat met een tik terug. Als alle vakken vol zijn komt het vinkje (6.5). Na ± 6 s stilte wijst het handje een
 * leeg vak aan (nooit het goede plaatje, 15.17).
 */
async function ordenAntwoord(l: Lesgids, v: Vraag, c: Ctx, zinnen: string[]): Promise<string> {
  const s = st(l);
  const vakken: (string | null)[] = v.juist!.map(() => null);
  const zetOrden = (actief: boolean) => {
    pasM(l, { orden: { vakken: [...vakken], losse: c.losse, actief } });
    zet(l, { vakTerug: actief ? vakken.map((x, i) => (x ? i : -1)).filter((i) => i >= 0) : null });
  };
  const test = () => zetTestAntwoord(vakken.includes(null) ? (v.juist!.find((id, i) => vakken[i] === null && !vakken.includes(id)) ?? c.losse.find((k) => !vakken.includes(k.id))?.id ?? null) : null);
  zetOrden(true);
  test();
  const leegVak = () => {
    const i = vakken.findIndex((x) => x === null);
    const r = vakkenVan(st(l).m)[i];
    return i < 0 || !r ? null : { plek: plekNaast({ x: r.x, y: r.y }) };
  };
  const hand = handKlok(l, leegVak, ZIN.ordenHand);
  const eerst = l.wachtOpVlak(["leg", "vakTerug"]);
  /* De eerste keer per les zegt Bliepo hoe het werkt (3.15). */
  const zin = s.ordenUitgelegd ? zinnen : [...zinnen, ZIN.ordenHoe];
  s.ordenUitgelegd = true;
  void zegOpdracht(l, zin, eerst).then(() => {
    log(l, "vraag-klaar");
    hand.opnieuw();
  }, () => {});
  let melding: Promise<Vlakgebeurtenis> = eerst;
  for (;;) {
    type Uit = { t: Vlakgebeurtenis | null };
    const vol = vakken.every((x) => x !== null);
    const tik: Promise<Uit> = melding.then((t) => ({ t }));
    const knop: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ t: null })) : null;
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (!r.t) break;
    const t = r.t as Vlakgebeurtenis & { id?: string; vak?: number | null; i?: number };
    if (t.soort === "vakTerug" && typeof t.i === "number") vakken[t.i] = null;
    else if (t.soort === "leg" && t.id && !vakken.includes(t.id)) {
      const doel = typeof t.vak === "number" ? t.vak : vakken.indexOf(null);
      if (doel >= 0 && vakken[doel] === null) vakken[doel] = t.id;
    }
    log(l, "plaatje", { vakken });
    speelLesgeluid("schuif");
    hand.opnieuw();
    zetOrden(true);
    test();
    melding = l.wachtOpVlak(["leg", "vakTerug"]);
  }
  hand.stop();
  zetTestAntwoord(null);
  zetOrden(false);
  const x = vakken.join(",");
  log(l, "tik", { x });
  return x;
}

/** De nummers die het kind bij het tellen op de blaadjes zet (blijven staan bij een nieuwe poging, draaiboek §3 C.3). */
type Tel = { lijst: number[] };
const merkenVan = (l: Lesgids, lijst: number[], kleur: string): Merk[] => {
  const pts = puntenVan(st(l).m);
  return lijst.map((i, k) => ({ x: pts[i].x, y: pts[i].y, t: String(k + 1), kleur }));
};

/**
 * Typen in het echte invulvak onder de tafel (HARDE REGEL 5). Het vinkje van het lesscherm staat er pas als er een getal
 * in het vak staat; Enter werkt ook. Tussendoor mag het kind blaadjes aantikken om te tellen (draaiboek §0: een tik = het
 * volgende nummer, nog een tik = weer weg). Geen "Weet ik niet" (1.27).
 */
async function typAntwoord(l: Lesgids, v: Vraag, tel: Tel, zinnen: string[]): Promise<string> {
  const s = st(l);
  const invul = { waarde: "" };
  const pts = puntenVan(s.m);
  const kleur = v.kleur!;
  const zetTel = () => zet(l, { merken: merkenVan(l, tel.lijst, kleur), tik: pts.map((q, i) => ({ i, ...q })) });
  zetTel();
  zet(l, { typ: { sleutel: `typ-${v.id}-${++s.typNr}`, ...onderTafel(l) }, zetWaarde: (w) => (invul.waarde = w) });
  zetTestAntwoord(v.goed);
  log(l, "vraag", { zin: zinnen.join(" "), opties: ["typ"] });
  l.verderWeg?.();
  const z = zeg(l, zinnen.join(" "));
  z.catch(() => {});
  void z.then(() => log(l, "vraag-klaar"), () => {});
  let vol = false;
  for (;;) {
    type Uit = { g: Vlakgebeurtenis | null };
    const tik: Promise<Uit> = l.wachtOpVlak(["typVol", "typKlaar", "puntTik"]).then((g) => ({ g }));
    const knop: Promise<Uit> | null = vol ? l.knoppen(["controleer"]).then(() => ({ g: null })) : null;
    const r: Uit = await Promise.race(knop ? [tik, knop] : [tik]);
    if (r.g?.soort === "typVol") {
      vol = !!r.g.vol;
      continue;
    }
    if (r.g?.soort === "puntTik") {
      const i = Number((r.g as { i?: number }).i);
      tel.lijst = tel.lijst.includes(i) ? tel.lijst.filter((x) => x !== i) : [...tel.lijst, i];
      speelLesgeluid("tik");
      log(l, "markeer", { aantal: tel.lijst.length });
      zetTel();
      continue;
    }
    if (invul.waarde) break;
  }
  zet(l, { typ: null, tik: null });
  zetTestAntwoord(null);
  log(l, "tik", { x: invul.waarde });
  return String(Number(invul.waarde));
}

/* ---------- samen tellen en samen voordoen (2e fout; draaiboek §3 G) ---------- */

/**
 * Samen tellen: het kind tikt elk ding aan (in elke volgorde), het krijgt het volgende nummer en Bliepo zegt het getal
 * (draaiboek §3 G.1–G.2). Het handje wijst na ± 6 s stilte een ding aan dat nog niet geteld is. Vangnet: 20 s geen tik =
 * Bliepo telt de rest zelf (geeft `true`).
 */
async function telSamen(l: Lesgids, v: Vraag, indexen: number[], kleur: string, opdracht: readonly string[], handZin: readonly string[], vooraf: Merk[] = []): Promise<boolean> {
  const pts = puntenVan(st(l).m);
  const geteld: number[] = [];
  const merken = () => [...vooraf, ...geteld.map((i, k) => ({ x: pts[i].x, y: pts[i].y, t: String(k + 1), kleur }))];
  const open = () => indexen.filter((i) => !geteld.includes(i));
  const zetTel = () => zet(l, { merken: merken(), tik: open().map((i) => ({ i, ...pts[i] })) });
  zetTel();
  const test = () => zetTestAntwoord(open().length ? `punt-${open()[0]}` : null);
  test();
  haak(l, { soort: "telSamen", goed: `punt-${open()[0]}`, vraag: v.id });
  const hand = handKlok(l, () => (open().length ? { plek: plekNaast(pts[open()[0]]) } : null), handZin);
  let eersteTik: (() => void) | null = null;
  const tikt = new Promise<void>((r) => (eersteTik = r));
  const opdrachtZin = [variant("samenStap", opdracht)];
  void zegOpdracht(l, opdrachtZin, tikt).then(() => hand.opnieuw(), () => {});
  let zelf = false;
  try {
    while (open().length) {
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; i: number }>("puntTik"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null) {
        log(l, "vangnet", { geteld: geteld.length });
        zelf = true;
        break;
      }
      if (!open().includes(t.i)) continue;
      geteld.push(t.i);
      speelLesgeluid("tik");
      log(l, "tik", { x: `punt-${t.i}`, samen: true });
      zetTel();
      test();
      if (open().length) {
        haak(l, { soort: "telSamen", goed: `punt-${open()[0]}`, vraag: v.id });
        /* Bliepo zegt het getal bij elke tik; het laatste getal zegt hij in de zin erna ("En 10! Zo groot is de tafel."), niet
           eerst los en dan nog een keer in die zin (een getal klinkt nooit 2 keer achter elkaar; 18 november 2026). */
        /* 15.47: de opdracht blijft in beeld, het getal komt eronder. */
        void zegTelwoord(l, opdrachtZin, ZIN.telGetal(geteld.length, kleur)).catch(() => {});
      }
      hand.opnieuw();
    }
  } finally {
    hand.stop();
  }
  if (zelf) {
    /* Bliepo telt de rest zelf, rustig (de les loopt nooit vast). */
    zet(l, { tik: null });
    for (const i of open()) {
      geteld.push(i);
      zet(l, { merken: merken() });
      speelLesgeluid("tik");
      await l.wacht(250);
    }
  }
  zet(l, { tik: null, merken: merken() });
  haak(l, null);
  zetTestAntwoord(null);
  return zelf;
}

/**
 * Bliepo telt zelf (de eerste mat, de blauwe hokjes): elk ding krijgt een nummer, hij zegt het getal (vaste tijd per stap).
 * Het laatste getal zegt hij in de slotzin ("En 8! Zoveel hokjes heeft blauw."), zodat het niet 2 keer achter elkaar klinkt.
 */
async function telZelf(l: Lesgids, indexen: number[], kleur: string, slot: readonly string[]): Promise<Merk[]> {
  const pts = puntenVan(st(l).m);
  const merken: Merk[] = [];
  for (const [k, i] of indexen.entries()) {
    merken.push({ x: pts[i].x, y: pts[i].y, t: String(k + 1), kleur });
    zet(l, { merken: [...merken] });
    speelLesgeluid("tik");
    await zegDoor(l, k === indexen.length - 1 ? variant("telSlot", slot) : ZIN.telGetal(k + 1, kleur));
  }
  return merken;
}

/**
 * Het samen voordoen na de 2e fout (15.11): nu pas het antwoord in beeld, en het kind doet de kleine stap. Vangnet: 20 s
 * niets = Bliepo doet het zelf en zegt dan geen "Ja"/"samen" alsof het kind het deed.
 */
async function samenDoen(l: Lesgids, v: Vraag, c: Ctx) {
  const s = st(l);
  let zelf = false;
  zet(l, { rondje: null, hulphand: null, kies2: null });
  pasM(l, { licht: [] });

  if (v.thema === "tafel") {
    zet(l, { merken: [] });
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    zelf = await telSamen(l, v, puntenVan(s.m).map((_, i) => i), v.kleur!, ZIN.samenTelTafel, ZIN.samenTelHand);
    zet(l, { label: { ...onderTafel(l), t: ZIN.label(Number(v.goed)), kleur: v.kleur! } });
  } else if (v.thema === "matten") {
    const n = v.stukken!;
    zet(l, { merken: [] });
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    const mat1 = await telZelf(l, Array.from({ length: n }, (_, i) => i), "wit", ZIN.samenMat1Klaar(n));
    zelf = await telSamen(l, v, Array.from({ length: n }, (_, i) => n + i), "wit", ZIN.samenMat2Stap, ZIN.samenMatHand, mat1);
  } else if (v.thema === "ruitjes") {
    zet(l, { merken: [] });
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    const blauw = await telZelf(l, Array.from({ length: 8 }, (_, i) => i), "blauw", ZIN.samenBlauwKlaar);
    zelf = await telSamen(l, v, Array.from({ length: 8 }, (_, i) => 8 + i), "geel", ZIN.samenGeelStap, ZIN.samenGeelHand, blauw);
    zet(l, { kies2: { gekozen: v.goed.split(","), tikbaar: [] } });
    pasM(l, { golf: { id: "tel", n: ++s.golf } });
  } else if (v.thema === "schilderij") {
    if (!s.m.groot?.includes("zien=1")) pasM(l, { groot: `${v.beeld}|zien=1` });
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    /* Per schilderij: een rondje en hoeveel tegels het bedekt (het getal blijft staan, 7.8d), van links naar rechts. */
    const merken: Merk[] = [];
    const lijst = [...v.kaarten!].sort((a, b) => (schilderijVan(s.m, a.id)?.x ?? 0) - (schilderijVan(s.m, b.id)?.x ?? 0));
    for (const k of lijst) {
      const r = schilderijVan(s.m, k.id);
      if (!r) continue;
      merken.push({ x: r.x, y: r.y, t: String(TEGELS[k.id]), kleur: "geel" });
      zet(l, { rondje: r, merken: [...merken] });
      speelLesgeluid("tik");
      await zegDoor(l, variant("samenSchilderij", ZIN.samenSchilderij(k.naam, TEGELS[k.id])));
    }
    zet(l, { rondje: null });
    const goed = v.goed.split(",");
    const klein = v.kaarten!.find((k) => goed.includes(k.id) && k.label === "kleinst")!;
    const groot = v.kaarten!.find((k) => k.label === "grootst")!;
    await zegDoor(l, variant("samenSchilderijSlot", ZIN.samenSchilderijSlot(klein.naam, groot.naam)));
    /* De kleine stap: het kind tikt de 2 kaartjes die kloppen (alleen die 2 doen iets). */
    let gekozen: string[] = [];
    const zetK = () => zet(l, { kies2: { gekozen: [...gekozen], tikbaar: goed.filter((g) => !gekozen.includes(g)) } });
    zetK();
    const open = () => goed.filter((g) => !gekozen.includes(g));
    /* De kaartjes staan rechts onder Bliepo's zin (15.32); het handje wijst daar. */
    const rects = kaartenVan(s.m);
    const plekVan = (id: string) => {
      const r = rects[c.kaarten.findIndex((k) => k.id === id)];
      return r ? plekNaast({ x: r.x, y: r.y }) : null;
    };
    zetTestAntwoord(open()[0]);
    haak(l, { soort: "tweeSamen", goed: open()[0], vraag: v.id });
    const hand = handKlok(l, () => (open().length && plekVan(open()[0]) ? { plek: plekVan(open()[0])! } : null), ZIN.samenTweeHand);
    let eersteTik: (() => void) | null = null;
    const tikt = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, [variant("samenStap", ZIN.samenTweeStap)], tikt).then(() => hand.opnieuw(), () => {});
    try {
      while (open().length) {
        const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("kaartKies"), l.wacht(VANGNET_MS).then(() => null)]);
        (eersteTik as (() => void) | null)?.();
        if (t === null) {
          log(l, "vangnet", {});
          zelf = true;
          break;
        }
        if (!open().includes(t.id)) continue;
        gekozen = [...gekozen, t.id];
        speelLesgeluid("tik");
        log(l, "tik", { x: t.id, samen: true });
        zetK();
        if (open().length) {
          zetTestAntwoord(open()[0]);
          haak(l, { soort: "tweeSamen", goed: open()[0], vraag: v.id });
        }
        hand.opnieuw();
      }
    } finally {
      hand.stop();
    }
    zet(l, { kies2: { gekozen: goed, tikbaar: [] } });
    pasM(l, { golf: { id: groot.id, n: ++s.golf } });
  } else if (v.thema === "vellen") {
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    const r = velVan(s.m);
    zet(l, { velTik: r });
    zetTestAntwoord("kaartje-2");
    haak(l, { soort: "velSamen", goed: "kaartje-2", vraag: v.id });
    const hand = handKlok(l, () => (r ? { plek: plekNaast({ x: r.x, y: r.y }) } : null), ZIN.samenVelHand);
    let eersteTik: (() => void) | null = null;
    const tikt = new Promise<void>((res) => (eersteTik = res));
    void zegOpdracht(l, [variant("samenStap", ZIN.samenVelStap)], tikt).then(() => hand.opnieuw(), () => {});
    try {
      const t = await Promise.race([l.wachtOpVlak("velTik"), l.wacht(VANGNET_MS).then(() => null)]);
      (eersteTik as (() => void) | null)?.();
      if (t === null) {
        log(l, "vangnet", {});
        zelf = true;
      } else log(l, "tik", { x: "kaartje-2", samen: true });
    } finally {
      hand.stop();
      zet(l, { velTik: null });
    }
    pasM(l, { groot: "vellen|draai=0" });
    speelLesgeluid("schuif");
    await l.wacht(500);
  } else {
    /* Op volgorde: Bliepo legt ze op volgorde, het kind sleept de laatste (het handje doet het voor). */
    const juist = v.juist!;
    const vakken: (string | null)[] = juist.map(() => null);
    pasM(l, { orden: { vakken: [...vakken], losse: c.losse, actief: false } });
    zet(l, { vakTerug: null });
    await zegDoor(l, variant("samen", ZIN.samen(v)));
    for (let i = 0; i < juist.length - 1; i++) {
      vakken[i] = juist[i];
      pasM(l, { orden: { vakken: [...vakken], losse: c.losse, actief: false }, licht: [juist[i]] });
      speelLesgeluid("schuif");
      await zegDoor(l, variant("samenOrden", ZIN.samenOrden(v, i, juist[i])));
    }
    pasM(l, { licht: [] });
    const laatst = juist.at(-1)!;
    pasM(l, { orden: { vakken: [...vakken], losse: c.losse, actief: true } });
    zetTestAntwoord(laatst);
    haak(l, { soort: "ordenSamen", goed: laatst, vraag: v.id });
    const van = losseVan(s.m)[c.losse.findIndex((k) => k.id === laatst)];
    const naar = vakkenVan(s.m)[juist.length - 1];
    const hand = handKlok(l, () => (van && naar ? { plek: plekNaast({ x: van.x, y: van.y }), naar: plekNaast({ x: naar.x, y: naar.y }) } : null), ZIN.samenOrdenHand);
    let eersteTik: (() => void) | null = null;
    const tikt = new Promise<void>((r) => (eersteTik = r));
    void zegOpdracht(l, [variant("samenStap", ZIN.samenOrdenStap(v, laatst))], tikt).then(() => hand.opnieuw(), () => {});
    try {
      for (;;) {
        const t = await Promise.race([l.wachtOpVlak<{ soort: string; id: string }>("leg"), l.wacht(VANGNET_MS).then(() => null)]);
        (eersteTik as (() => void) | null)?.();
        if (t === null) {
          log(l, "vangnet", {});
          zelf = true;
          break;
        }
        if (t.id === laatst) {
          log(l, "tik", { x: laatst, samen: true });
          break;
        }
      }
    } finally {
      hand.stop();
    }
    vakken[juist.length - 1] = laatst;
    pasM(l, { orden: { vakken: [...vakken], losse: c.losse, actief: false } });
    speelLesgeluid("schuif");
    pasM(l, { golf: { id: laatst, n: ++s.golf } });
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  await zegDoor(l, zelf ? variant("samenZelf", ZIN.samenZelf(v)) : variant("samenKlaar", ZIN.samenKlaar(v)));
}

/* ---------- een vraag ---------- */

async function speelVraag(l: Lesgids, v: Vraag, o: { eerste: boolean; terug: boolean; ctx?: Ctx }): Promise<Uitkomst> {
  const s = st(l);
  const c = o.ctx ?? maakCtx(v);
  const id = o.terug ? `${v.id}-terug` : v.id;
  const opties = v.soort === "kies" ? schud(v.opties!) : null;
  const fouten = foutenVan(v);
  /* Een nieuw beeld (Bliepo tovert het tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
  if (!o.ctx) {
    void l.zeg().catch(() => {});
    nieuwBeeld(l, beeldVan(v, c));
    speelLesgeluid("verschijn");
    await l.wacht(150);
  }
  /* Eerst wat er in beeld is (1 stuk, met de pijl), dan de vraag: zo blijft elk stuk kort genoeg voor het vaste tekstvak (15.30). */
  if (v.intro) await zegDoor(l, ...v.intro);
  const tel: Tel = { lijst: [] };
  let zinnen = ZIN.vraag(v);
  let eerder: Fout | null = null;
  let eersteX: string | null = null;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    let x: string;
    if (opties) {
      zetTestAntwoord(v.goed);
      haak(l, { soort: "kies", opties, goed: v.goed, poging, vraag: id }, poging === 1);
      x = await kiesAntwoord(l, opties, zinnen);
    } else if (v.soort === "twee") {
      haak(l, { soort: "twee", opties: c.kaarten.map((k) => k.id), goed: v.goed, fout: Object.keys(fouten), poging, vraag: id }, poging === 1);
      x = await tweeAntwoord(l, v, c, zinnen, poging === 1);
    } else if (v.soort === "orden") {
      haak(l, { soort: "orden", goed: v.goed, losse: c.losse.map((k) => k.id), fout: Object.keys(fouten), poging, vraag: id }, poging === 1);
      x = await ordenAntwoord(l, v, c, zinnen);
    } else {
      haak(l, { soort: "typ", goed: v.goed, fout: Object.keys(fouten), poging, vraag: id }, poging === 1);
      x = await typAntwoord(l, v, tel, zinnen);
    }
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === v.goed) {
      if (v.soort === "typ") zet(l, { label: { ...onderTafel(l), t: ZIN.label(Number(v.goed)), kleur: v.kleur! } });
      if (v.soort === "twee") {
        zet(l, { kies2: { gekozen: v.goed.split(","), tikbaar: [] } });
        pasM(l, { golf: { id: v.goed.split(",")[0], n: ++s.golf } });
      }
      if (v.soort === "orden") pasM(l, { golf: { id: v.juist!.at(-1)!, n: ++s.golf } });
      speelLesgeluid("goed");
      bliepoScherm("goed");
      const zz = poging === 1 ? lofZinnen(l, v, o.eerste) : [bevestig(l)];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: id, zin: zz.join(" ") });
      await zegDoor(l, ...zz);
      return noteer(l, id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[x] ?? metenFout(x, v);
    legDenkfoutVast(l, { vraag: id, antwoord: x, denkfout: f.code, poging });
    /* Hetzelfde antwoord 2 keer: "Je koos weer …"; weer een getal vlak naast het antwoord: "Je zit er weer vlak naast." (in foutReactie). */
    const fz = foutZinnen(l, f, v, x, poging, eerder, eersteX).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: id, x, denkfout: f.code, zin: fz.join(" ") });
    /* De vinkjes gaan weg; gelegde plaatjes blijven even liggen bij de hint en glijden daarna terug (geen schudden, geen rood). */
    if (v.soort === "twee") zet(l, { kies2: null });
    if (poging === 1) {
      /* 1e fout: het rondje om wat de hint noemt (nooit om het antwoord, 15.17), en bij de schilderijen de tegels erachter. */
      if (f.zien && !s.m.groot?.includes("zien=1")) pasM(l, { groot: `${v.beeld}|zien=1` });
      zet(l, { rondje: rondjeVan(l, v, f.licht) });
      await zegDoor(l, ...fz);
      zet(l, { rondje: null });
      if (v.soort === "orden") pasM(l, { orden: { vakken: v.juist!.map(() => null), losse: c.losse, actief: false } });
      zinnen = [variant("opnieuw", ZIN.opnieuw(v))];
      eerder = f;
      eersteX = x;
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen; het kind doet de laatste stap. */
    await zegDoor(l, ...fz);
    await samenDoen(l, v, c);
    return noteer(l, id, "samen");
  }
  return noteer(l, id, "samen");
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-meten-oppervlakte-1-gouden",
  titel: "Hoe groot is het?",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Meten en maten · Oppervlakte · level 1 · gouden les (nieuwe versie van squla-meten-oppervlakte-1) · verloop draaiboek Meten (Area: Cover It Up)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7, 10 nov 2026; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  nacht: true,
  voorwerpen: METEN_VOORWERPEN,
  /* Het nieuwe eindscherm (15.55, EINDSCHERM-INBOUW.md, 27 nov 2026). De oude kaart (KaartOppervlakte) blijft in
     squla-meten-vlak.tsx staan; deze les gebruikt hem niet meer. */
  eindscherm: true,
  eindLeerzin: "Je kunt nu tellen hoeveel hokjes iets bedekt.",
  eindPlaatje: "/voorwerpen/picknickkleed.png",
  eindOnderwerp: "Hoe groot is het?",
  eindKaartZin: EIND_TIK_KAART,
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    l.voortgang?.(0);
    /* Het voorbeeld op het beginscherm (4.1): het beeld van vraag 1 (de muur met de schilderijen). */
    const c0 = maakCtx(VRAGEN[0]);
    const s = st(l);
    s.m = { ...LEEG_M, nr: ++s.nr, ...beeldVan(VRAGEN[0], c0) };
    l.vlak<GoudenMetenProps>(GoudenMetenVlak, { ...s.m, ...LEEG_G } as GoudenMetenProps);
    speelLesgeluid("verschijn");
    await l.wacht(600);

    /* Het begin (draaiboek §1: geen startvraag): de groet en het uitlegdeel in 1 stuk. Zonder eerdere tik zegt Bliepo het
       bij de eerste tik (lib/stem.ts heelUitpraten). */
    await zegDoor(l, NAAM_GROET, variant("start", ZIN.start));
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;

    /* De 12 vragen van squla-meten-oppervlakte-1. */
    const mis: number[] = [];
    for (let i = 0; i < VRAGEN.length; i++) {
      const uit = await speelVraag(l, VRAGEN[i], { eerste: i === 0, terug: false, ctx: i === 0 ? c0 : undefined });
      if (uit !== "goed") mis.push(i);
    }

    /* Daarna 3 vragen terug: eerst wat niet meteen goed was, aangevuld met de vaste reserve (zoals de oude les). */
    const terug = [...mis, ...RESERVE.filter((i) => !mis.includes(i))].slice(0, 3);
    void l.zeg().catch(() => {});
    nieuwBeeld(l, {});
    await zegDoor(l, variant("terug", mis.length ? (terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length)) : terug.length === 1 ? ZIN.extra1 : ZIN.extraN(terug.length)));
    let weerFout = 0;
    for (const [n, i] of terug.entries()) {
      st(l).laatste = n === terug.length - 1;
      if ((await speelVraag(l, VRAGEN[i], { eerste: false, terug: true })) !== "goed") weerFout++;
    }
    if (weerFout) await zegDoor(l, variant("terugLastig", ZIN.terugLastig));

    /* Einde: het nieuwe eindscherm (15.55; EINDSCHERM-INBOUW.md, 27 nov 2026). Was: slotzin, de kaart, een eindzin uit het
       rijtje, "Tik op de kaart." en het afscheid. */
    void l.zeg().catch(() => {});
    nieuwBeeld(l, {});
    await eindeScherm(l);
  },
};

/**
 * Percentage goed in 1 keer en de denkfouten van deze speelbeurt, voor de kleur van de kaart en het bewaren (15.55; zoals
 * Tellen extra). De 12 vragen en de 3 vragen die terugkomen tellen (zoals de voortgangsbalk). Op de voorbeeldpagina kun je met `&snel=p72` een
 * percentage forceren (alleen om elke kleur te kunnen zien).
 */
function resultaat(l: Lesgids): { percentage: number; denkfouten: string[] } {
  if (l.snelEinde) {
    let p = l.snelEinde === "alles" ? 100 : l.snelEinde === "moeite" ? 40 : 80;
    try {
      const m = /^p(\d{1,3})$/.exec(new URLSearchParams(window.location.search).get("snel") ?? "");
      if (m) p = Math.min(100, Number(m[1]));
    } catch {
      /* standaard */
    }
    return { percentage: p, denkfouten: [] };
  }
  const s = st(l);
  const goed = [...s.eerste.values()].filter((x) => x === "goed").length;
  return { percentage: percentageGoed(goed, Math.max(balkTotaal(), s.eerste.size)), denkfouten: [...s.alleDenkfouten] };
}

/** Het eindscherm met 1 eindzin van Bliepo (zoals Tellen extra; alleen de standaardzinnen uit eindzinnen.ts). */
async function eindeScherm(l: Lesgids) {
  void l.zeg().catch(() => {});
  l.verderWeg?.();
  /* Voortgangsbalk (15.54): bij het einde precies vol. */
  l.voortgang?.(1);
  /* Het laatste sleuteltje vliegt nog (±0,9 s): eerst laten aankomen, dan pas het feest. */
  await l.wacht(1000);
  log(l, "eindscherm");
  l.eindscherm?.(resultaat(l));
  /* Bliepo praat pas als het feestgeluid (±1,4 s) voorbij is en de ster komt. */
  await l.wacht(1500);
  await zeg(l, eindzin(resultaat(l).percentage));
  await l.eindAfsluiten?.();
}

/** Alleen op de voorbeeldpagina (`&snel=1`): meteen naar het eindscherm, met een paar sleutels om de teller te zien. Bewaart niets. */
async function snelNaarEinde(l: Lesgids) {
  const totaal = balkTotaal();
  l.voortgang?.(0);
  const n = l.snelEinde === "alles" ? 5 : l.snelEinde === "moeite" ? 1 : 3;
  const c0 = maakCtx(VRAGEN[0]);
  const s = st(l);
  s.m = { ...LEEG_M, nr: ++s.nr, ...beeldVan(VRAGEN[0], c0) };
  l.vlak<GoudenMetenProps>(GoudenMetenVlak, { ...s.m, ...LEEG_G } as GoudenMetenProps);
  /* Eerst de groet: bij een geplakte link komt dan de afspeelknop (15.38) en mag er daarna geluid klinken. */
  await zeg(l, NAAM_GROET);
  await l.wacht(300);
  for (let i = 0; i < n; i++) {
    l.voortgang?.((i + 1) / totaal);
    l.sleutel?.();
    await l.wacht(1100);
  }
  await eindeScherm(l);
}

export const LESSEN_SQULA_METEN_GOUDEN: Lesdraaiboek[] = [gouden];
