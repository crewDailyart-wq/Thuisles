/**
 * DE GOUDEN LES MINSOMMEN (10 november 2026; BOUWREGELS hoofdstuk 15, 15.20, 15.22, 15.25, 15.27–15.30; LESRECEPT.md).
 *
 *   squla-min-machine-1-gouden — een NIEUWE versie naast squla-min-machine-1 "Minsommen: hoeveel over?" (BOUWREGELS
 *   15.8). De oude les (squla-minsommen.tsx) blijft precies zoals hij is; pas na akkoord van Sara vervangt deze versie
 *   de oude voor kinderen.
 *
 * Waarom deze Squla-les: het draaiboek Minsommen (Dot Destruction) noemt "Hoeveel over? 1 (squla-min-machine-1)" de
 * Squla-les die er het best bij past: een machine waar 10 in gaat en waar iets af gaat (draaiboek §8), daarna kale
 * minsommen tot 10 (de oefenreeks, §2 stap 17). Alles tot 10.
 *
 * Inhoud (15.22 punt 1): die van squla-min-machine-1. Dezelfde 15 vragen in dezelfde volgorde, dezelfde getallen en
 * dezelfde 3 keuzes: 5 keer de min-machine, 6 keer het schoolbord, 4 keer een kale som in het midden.
 *
 * Skelet (15.22 punt 3): het draaiboek Minsommen (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/minsommen.md):
 *   stap 1  openen: geen startvraag en geen proef (§0); Bliepo groet en zegt in hetzelfde stuk wat we gaan doen; vanzelf
 *           door (15.27);
 *   som     (§3 E en G, de oefenreeks): de vraag met de 3 keuzes tegelijk; de tik is het antwoord;
 *     - goed in 1 keer: scherm 1 s groen, lof + de som in woorden (§2 stap 17: "klopt; 9 − 8 = 1"); bij de machine
 *       draait de machine nu pas (naspelen, 1.22) en komen de blokjes eruit; vanzelf door;
 *     - 1e fout (Bliepo, 15.9/15.11): scherm 1,5 s rood, geen fout-geluidje, de knoppen weg; eerste zin + hint uit de
 *       fouttabel, met het rode rondje om het getal dat eraf gaat; vanzelf door, dan dezelfde 3 keuzes opnieuw;
 *     - 2e fout: uitleg bij de denkfout, dan SAMEN voordoen zoals het draaiboek bij 10 − 4 (§3 E): de stippen komen in
 *       beeld, het KIND haalt er zelf zoveel weg als in de som staat (de kleine stap), Bliepo telt hardop mee (§3 F) en de
 *       teller telt mee; daarna "er blijven er 6 over; 10 − 4 = 6" en de les gaat door;
 *     - goed na een fout: alleen een korte bevestiging met de som (§3 G.3);
 *   de TELLER (15.20): staat alleen in beeld bij het samen voordoen (en bij de uitleg van de stippenmachine aan het begin, waar hij de stippen telt), dus nooit zolang een van de 15 vragen nog open is;
 *   hulphandje: alleen bij de opdracht "haal er … weg" (na ± 6 s stilte, met 1 korte zin, 15.19); bij een keuzevraag
 *     zegt Bliepo niets (§4: Synthesis ook niet);
 *   heel snel: Bliepo zegt niets (§3 G.7, BOUWREGELS 6.10);
 *   stap 19 einde: een slotzin, de kaart, een eindzin uit het rijtje en "Tik op de kaart." (geen pijl op de kaart).
 *  Ronde 34 (12 november 2026, Sara punt 24.5): vóór de 15 vragen komt de uitleg "de machine leren kennen" (draaiboek `intro`,
 *   stap 1 t/m 4 en 7), in eigen woorden: Bliepo zegt waar de stippenmachine voor dient, het kind tikt op de plusknop
 *   (de teller telt mee), doet er nog 2 stippen bij, en kiest dan bij 2 keuzevragen wat het totaal doet en hoe "erbij doen"
 *   heet. Zelfde regels als de rest (2 pogingen, hint zonder antwoord, 2e fout = samen voordoen met 1 tik op de plus).
 *   Niet gebouwd: de vraag "blijft het totaal stijgen?" (stap 5 en 6, alleen na een fout), plussommen als opwarmer, de
 *   zapper, het minteken en "alles weg" (stap 8 t/m 16): niet in de Squla-les (KEUZES-VOOR-SARA.md, Ronde 24).
 *
 * De verder-pijl (15.27, zoals de gouden klokles): Bliepo praat door; na elk stuk tekst gaat de les ±0,7 s na de stem
 * vanzelf verder (`zegDoor`). De pijl staat rechts onder de tekst als snelkoppeling: een tik stopt de stem en gaat meteen
 * door. Bij vragen en opdrachten staat er geen pijl (`zegOpdracht` haalt hem weg).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; zonder gekozen kind gebeurt er niets); mislukt dat, dan gaat de les
 * gewoon door.
 */

import { WAS_NAKIJKEN } from "./squla-klok-gouden-zinnen";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { machineDuur } from "../vlakken/squla-minsommen-vlak";
import { GoudenMinVlak, wegPlek, PLUS_PLEK, type GoudenMinProps } from "../vlakken/squla-minsommen-gouden-vlak";
import { KLEURHEX } from "../vlakken/squla-getalring";
import { zegTelwoord, zetTestAntwoord } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { percentageGoed } from "@/lib/les-kleuren";
import { EIND_TIK_KAART, eindzin } from "../eindzinnen";
import {
  AANMOEDIG_TIKKEN,
  BEVESTIG,
  INTRO,
  INTRO_KLEUR,
  INTRO_VRAGEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  VRAGEN,
  ZIN,
  foutenVan,
  g,
  kleurenVan,
  metNaam,
  minReactie,
  type Fout,
  type IntroVraag,
  type Minvraag,
  type Rijtje,
} from "./squla-minsommen-gouden-zinnen";
import { beginVan, deeltStuk, maakKiezer } from "./nooit-dubbel";
import { alleenBijKeuze } from "./squla-klok-gouden-zinnen";

const LES_ID = "squla-min-machine-1-gouden";

/* ---------- tempo (draaiboek Minsommen §5) ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s; draaiboek: stem 0,1–0,5 s na de tik). */
const DENK_MS = 250;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ± 6 s). */
const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (zeg() wacht zelf al 0,3 s; samen ±0,7 s; 15.27). */
const DOOR_NA_MS = 400;
/** De keuzes groot in het midden (zoals de oude les: onder de bak van de machine 620, anders 600). Sinds 20 nov 2026 niet meer gebruikt: de keuzes staan rechts onder Bliepo's zin (15.32). */
const MIDDEN_MACHINE = 620;
const MIDDEN_SOM = 600;

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026; zoals de proefles Tellen): alle zinnen in varianten (ZIN, INTRO en de
 * fouttabel) kiest de les met de gedeelde kiezer. Nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen (en
 * ook niet als je de les nog een keer speelt: de kiezer leeft zolang de pagina open is). "Je koos 7." en "Je koos 4."
 * tellen als dezelfde zin.
 */
const KIEZER = maakKiezer();
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);
/** Hoe lang een stuk tekst op het scherm is (zonder de kleurcodes). Een reactie moet in het tekstvak passen (15.30). */
const lengte = (...zinnen: string[]) => zinnen.join(" ").replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1").length;
/** De langste reacties van de eerste versie pasten: eerste zin + hint ± 90 tekens, uitleg + "we doen het samen" ± 110. */
const MAX_HINT = 90;
const MAX_UITLEG = 110;
/** Wat er bij de 2e keer over is voor de uitleg, als de kortste "we doen het samen" er nog achter moet. */
const RUIMTE_UITLEG = MAX_UITLEG - 1 - Math.min(...ZIN.samen.map((z) => z.length));
/**
 * Alleen de varianten die met de rest van de reactie in het tekstvak passen (een harde eis: die haal je vooraf uit de
 * lijst, want de kiezer laat "nooit 2 keer dezelfde" voorgaan op een wens). Past er geen, dan de kortste.
 */
const passend = (zinnen: readonly string[], max: number, ...rest: string[]): string[] => {
  const over = zinnen.filter((z) => lengte(...rest, z) <= max);
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};

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
  goed: number;
  fout: number;
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
  /** Hoeveel keer het hulphandje bij de plusknop kwam: de zin wisselt (F8: nooit 2 keer dezelfde zin vlak na elkaar). */
  handNr: number;
  /** Voortgangsbalk (28 nov 2026, zoals Klok): de 2 keer op de plus tikken bij het leren kennen van de machine (geen vraag). */
  plusTel: number;
};
const STAAT = new WeakMap<Lesgids, Staat>();
const st = (l: Lesgids): Staat => {
  let s = STAAT.get(l);
  if (!s)
    STAAT.set(
      l,
      (s = { vorige: new Map(), recent: new Map(), zinNr: 0, robotNr: -99, namen: 0, naamKeer: 0, naamVraag: -99, opRij: 0, momenten: new Set(), goed: 0, fout: 0, vraag: 0, haak: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), alleDenkfouten: [...(l.hervat?.denkfouten ?? [])], log: [], robotReactie: false, nakijk: 0, handNr: 0, plusTel: 0 }),
    );
  return s;
};

const zet = (l: Lesgids, p: Partial<GoudenMinProps>) => l.pasVlakAan<GoudenMinProps>(p);
const LEEG: Partial<GoudenMinProps> = { kaleSom: null, machineRondje: false, weg: null, teller: null, hand: null, uitkomst: null, grijs: 0, licht: null, stippen: null, verbind: null, bubbels: null, erbij: null, ring: null };

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

/** Voor de eigen test en de speelcontrole: wat de les nu vraagt (window.__phaser.minTaak). */
function haak(l: Lesgids, info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  const s = st(l);
  if (nieuw) s.vraag++;
  window.__phaser = { ...window.__phaser, minTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
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
/* Minsommen: de 2 vragen bij het leren kennen van de machine (intro-totaal, intro-optellen) horen bij de normale route. */
const balkTotaal = (): number => VRAGEN.length + 2;
/**
 * Opnieuw doen na de beste kleur (15.60): dan valt het leren kennen van de machine weg, met zijn 2 vragen. Die tellen dan
 * niet voor het percentage en de balk (zo kan een perfecte herhaling 100% halen). Anders telt de balk ook de 2 opdrachten
 * op de plus mee (28 nov 2026, zoals Klok); het percentage niet.
 */
const vragenTotaal = (l: Lesgids): number => (l.zonderUitleg ? VRAGEN.length : balkTotaal());
const balk = (l: Lesgids) => {
  const s = st(l);
  l.voortgang?.(Math.min(1, (s.eerste.size + s.plusTel) / (vragenTotaal(l) + (l.zonderUitleg ? 0 : 2))));
};

/**
 * Verdergaan waar je was (15.53): is deze vraag al gemaakt vóór het kind wegging, dan telt het antwoord van toen en slaat de
 * les de vraag (met zijn overgangszin) over. Zoals `klaarAl` in squla-extra-basis.
 */
function klaarAl(l: Lesgids, vraag: string): boolean {
  const al = l.hervat?.antwoorden.find((a) => a[0] === vraag)?.[1];
  if (!al) return false;
  const s = st(l);
  if (!s.eerste.has(vraag)) s.eerste.set(vraag, al);
  balk(l);
  return true;
}

function noteer(l: Lesgids, vraag: string, uit: Uitkomst): Uitkomst {
  const s = st(l);
  const nieuweVraag = !s.eerste.has(vraag);
  if (nieuweVraag) s.eerste.set(vraag, uit);
  balk(l);
  const fouten = s.vraagFouten.get(vraag) ?? [];
  s.vraagFouten.delete(vraag);
  s.alleDenkfouten.push(...fouten);
  /* Verdergaan waar je was (15.53): na elke vraag onthouden waar het kind is. */
  l.stap?.(vraag, uit, fouten);
  if (typeof window === "undefined") return uit;
  const naam = { goed: "goed in één keer", naFout: "goed na een fout", samen: "samen gedaan" } as const;
  /* Een sleutel per vraag is maar 1 keer te verdienen, ook bij opnieuw spelen (15.52, 15.55; zoals noteer in
     squla-extra-basis.ts): zegt de server "al verdiend", dan vliegt er geen sleutel; weet hij niets, dan wel. */
  const eerstKeer = uit === "goed" && nieuweVraag;
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
  /* Alleen de 15 vragen van de Squla-les tellen mee; de 2 vragen van de uitleg niet. */
  const alle = [...st(l).eerste.entries()].filter(([id]) => VRAGEN.some((v) => v.id === id)).map(([, u]) => u);
  return alle.length > 0 && alle.filter((x) => x !== "goed").length * 2 >= alle.length;
}

/* ---------- het vaste rijtje (zelfde regels als de gouden lessen klok, Tellen, Splitsen en Plussommen) ---------- */

/* De zinnen die vroeger "nagekeken" zeiden (19 nov 2026: het woord is weg; zie WAS_NAKIJKEN). */
const NAKIJK = WAS_NAKIJKEN;
/** Hebben 2 zinnen een woord van 5 letters of meer gemeen? (Niet "Klopt helemaal! Dat klopt, …" of 2 keer "precies".) */
const deeltWoord = (a: string, b: string) => {
  const w = (z: string) => z.toLowerCase().replace(/\{[^}]*\}/g, " ").split(/[^a-zà-ÿ]+/).filter((x) => x.length >= 5);
  const A = new Set(w(a));
  return w(b).some((x) => A.has(x));
};
const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();

/* Ronde 45: de reactie met het aantal heeft per vraag een nieuw rijtje; met een vaste sleutel ("reactie") onthoudt de les de
   vorige zin over alle vragen, dus nooit 2 keer achter elkaar dezelfde zin met een ander getal. */
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
  const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i));
  const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
  s.vorige.set(sleutel, i);
  s.recent.set(sleutel, [...(s.recent.get(sleutel) ?? []), i]);
  if (r.robot.includes(i)) s.robotNr = s.zinNr;
  if (NAKIJK.test(r.zinnen[i])) s.nakijk++;
  return r.zinnen[i];
}

/** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin; daarna de som (draaiboek §2 stap 17). */
function lofZinnen(l: Lesgids, v: Minvraag, eerste: boolean): string[] {
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
  /* "Dat heb je goed gezien" alleen bij kijkvragen (dit zijn rekenvragen). */
  lof ??= kies(l, LOF, [LOF_KIJK_INDEX, ...alleenBijKeuze(l, LOF)]);
  const { rij: reactie, ja, robot } = minReactie(v);
  /* Lof en reactie beginnen niet met hetzelfde woord, en nooit 2 keer "Ja" (ook "ja" midden in de lofzin telt). */
  const zonder = reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof) || deeltWoord(reactie.zinnen[i], lof));
  if (/\bja\b/i.test(lof)) zonder.push(...ja);
  /* Een robotreactie hooguit 1 keer per les. */
  if (s.robotReactie) zonder.push(robot);
  const r = kies(l, reactie, zonder, "reactie");
  if (r === reactie.zinnen[robot]) s.robotReactie = true;
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

/* ---------- DE VERDER-PIJL (15.27, zoals de gouden klokles) ---------- */

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
  /* De pijl blijft staan tot er een vraag, opdracht of de eindkaart komt (ontwerp Sara 10 nov: niet aan/uit tussen stukken). */
}

/** De zin bij een opdracht: geen pijl; de les wacht daarna op de opdracht. Doet het kind hem al tijdens de zin, dan meteen door. */
async function zegOpdracht(l: Lesgids, zinnen: string[], melding: Promise<unknown>) {
  log(l, "opdrachtzin", { zin: zinnen.join(" ") });
  l.verderWeg?.();
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  await Promise.race([z, melding]);
}

/** De keuzeknoppen tegelijk met de zinnen. Een tik tijdens de zin telt. Geen pijl (l.kies vervangt hem). */
async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[], midden: number): Promise<string> {
  /* Rechts onder Bliepo's zin (besluit Sara, 20 nov 2026, KEUZES-VOOR-SARA Ronde 53 punt 3; BOUWREGELS 15.32): `midden`
     (groot in het midden onder de machine of het bord, 7 november) wordt niet meer meegegeven. */
  void midden;
  const p = l.kies(opties, { direct: true, weetniet: false });
  log(l, "vraag", { zin: zinnen.join(" "), opties });
  const z = zeg(l, ...zinnen);
  z.catch(() => {});
  const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
  const klaar = eerst === "gezegd" ? performance.now() : null;
  if (klaar) log(l, "vraag-klaar");
  const x = (await p) ?? "";
  log(l, "tik", { x, naVraag: klaar ? Math.round(performance.now() - klaar) : -1 });
  return x;
}

/**
 * Wat Bliepo zegt bij een fout, uit de fouttabel. Elke zin heeft varianten (18 november 2026); de kiezer neemt nooit 2
 * keer achter elkaar dezelfde, ook niet over vragen heen.
 *   1e keer: eerste zin (wat het kind koos) + hint.
 *   2e keer: de uitleg (1 reactie, met het gekozen getal hooguit 1 keer); of, bij 2 keer dezelfde denkfout, "weer" + een
 *   andere uitleg; of, bij hetzelfde getal 2 keer, "Je koos weer …" + de uitleg zonder getal.
 */
function foutZinnen(l: Lesgids, f: Fout, x: string, kleur: string, poging: 1 | 2, eerder: Fout | null, eersteX: string, eersteZin: string): string[] {
  if (!f.v) {
    /* Denkfout niet duidelijk (komt in deze les niet voor): een zin uit het vaste rijtje en de algemene hint. */
    const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
    return poging === 1 ? [eerste, f.hint] : [eerste, f.uitleg];
  }
  if (poging === 1) {
    const eerste = variant("eerste", f.v.eerste);
    return [eerste, variant("hint", passend(f.v.hint, MAX_HINT, eerste), (z) => !deeltStuk(eerste, z))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was (niet na alleen "… dichtbij."). */
  if (eerder !== null && eerder.soort === f.soort && !eerder.noot && !f.noot) {
    const weer = variant("weer", f.v.weerEerste);
    return [weer, variant("weerUitleg", passend(f.v.weerUitleg, RUIMTE_UITLEG, weer), (z) => !deeltStuk(weer, z))];
  }
  /* Hetzelfde getal 2 keer: "Je koos weer …" en de uitleg zonder getal. */
  if (x === eersteX) return [variant("weerGekozen", ZIN.weerGekozen(Number(x), kleur)), variant("uitlegLos", f.v.uitlegLos)];
  /* Een ander getal: de uitleg, liefst met een ander begin dan de eerste zin bij deze vraag ("Je koos …" 2 keer). */
  return [variant("uitleg", passend(f.v.uitleg, RUIMTE_UITLEG), (z) => beginVan(z) !== beginVan(eersteZin))];
}

/* ---------- het beeld ---------- */

const hex = (k: string) => KLEURHEX[k] ?? "#ffffff";

/** Een nieuw beeld (Bliepo tovert het tevoorschijn); de zin van de vorige vraag gaat weg (geleerd bij Tellen). */
function toonBeeld(l: Lesgids, v: Minvraag, geluid = true) {
  l.som(null);
  if (v.soort === "machine") zet(l, { ...LEEG, toneel: { soort: "machine", id: `gouden-${v.id}`, start: 10, eraf: v.b } });
  else zet(l, { ...LEEG, toneel: v.soort === "bord" ? { soort: "bord", id: `gouden-${v.id}` } : { soort: "som", id: `gouden-${v.id}`, deco: null }, kaleSom: kaleSom(v, null) });
  if (geluid) speelLesgeluid("verschijn");
}

/** De kale som op het bord of in het midden: wit (14.27); het rondje om het getal dat eraf gaat alleen als Bliepo het noemt. */
function kaleSom(v: Minvraag, uitkomst: number | null, rondjeB = false): GoudenMinProps["kaleSom"] {
  if (v.soort === "machine") return null;
  return { plek: v.soort === "bord" ? "bord" : "midden", a: v.a, b: v.b, uitkomst, kleuren: ["#ffffff", "#ffffff"], rondjeB };
}

/** Het rode rondje om het getal dat eraf gaat (machine: op de machine; som: de b), of weg. */
function rondje(l: Lesgids, v: Minvraag, aan: boolean) {
  if (v.soort === "machine") zet(l, { machineRondje: aan });
  else zet(l, { kaleSom: kaleSom(v, null, aan) });
}

/* ---------- samen voordoen (2e fout; draaiboek §3 E en F) ---------- */

/**
 * De stippen komen in beeld met de som bovenaan en de teller (15.20: pas nu). Het kind haalt er zelf zoveel weg als er
 * in de som staat (een tik per stip; meer weghalen kan niet, zoals bij Synthesis), Bliepo telt hardop mee. Na ± 6 s
 * stilte komt vanzelf het hulphandje met 1 korte zin (15.19). Daarna de uitkomst met de som.
 */
async function samenVoordoen(l: Lesgids, v: Minvraag) {
  const [ka, kb] = kleurenVan(v, true);
  const A = hex(ka);
  const B = hex(kb);
  const weg = Array.from({ length: v.a }, () => false);
  let n = 0;
  const stand = (tikbaar: boolean) => zet(l, { weg: { n: v.a, weg: [...weg], kleurA: A, kleurB: B, tikbaar }, teller: { n: v.a - n, kleur: A } });
  /* Het oude beeld weg; bovenaan de som in de kleuren van de stippen, met een vraagteken. */
  zet(l, { ...LEEG, toneel: null, kaleSom: { plek: "boven", a: v.a, b: v.b, uitkomst: null, kleuren: [A, B] } });
  stand(false);
  speelLesgeluid("verschijn");
  await l.wacht(50);
  await zegDoor(l, variant("samenStippen", ZIN.samenStippen(v)));
  /* De opdracht: geen pijl (15.27). Een tik op een stip telt al tijdens de zin. */
  haak(l, { soort: "weg", nodig: v.b, vraag: v.id });
  stand(true);
  const volgende = () => weg.lastIndexOf(false);
  zetTestAntwoord(`weg-${volgende()}`);
  let handGezegd = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const wachtOpHand = () => {
    clearTimeout(klok);
    klok = setTimeout(() => {
      const i = volgende();
      if (i < 0 || n >= v.b) return;
      /* De vingertop schuin rechtsonder de stip, in de ruimte ernaast (geleerd bij Tellen). */
      const p = wegPlek(i, v.a);
      log(l, "aanwijzing", { i });
      zet(l, { hand: { plek: { x: p.x + 16, y: p.y + 20 }, sleutel: `weg-${i}-${Date.now()}` } });
      if (!handGezegd) {
        handGezegd = true;
        void zeg(l, `${variant("aanmoedigTikken", AANMOEDIG_TIKKEN)} ${variant("samenHand", ZIN.samenHand)}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  let eersteTik: (() => void) | null = null;
  const gedaan = new Promise<void>((r) => (eersteTik = r));
  const opdracht = [variant("samenWeg", ZIN.samenWeg(v))];
  void zegOpdracht(l, opdracht, gedaan).catch(() => {});
  wachtOpHand();
  try {
    while (n < v.b) {
      const t = await l.wachtOpVlak<{ soort: string; index: number }>("wegTik");
      (eersteTik as (() => void) | null)?.();
      if (weg[t.index]) continue;
      weg[t.index] = true;
      n++;
      const klaar = n === v.b;
      zet(l, { hand: null });
      stand(!klaar);
      speelLesgeluid("tik");
      log(l, "weg-tik", { i: t.index, n });
      /* Bliepo telt hardop mee (draaiboek §3 F); bij de laatste zegt hij meteen de uitkomst. */
      if (!klaar) {
        zetTestAntwoord(`weg-${volgende()}`);
        /* 15.47: de opdracht blijft in beeld, het getal komt eronder. */
        void zegTelwoord(l, opdracht, ZIN.samenTel(v, n)).catch(() => {});
        wachtOpHand();
      }
    }
  } finally {
    clearTimeout(klok);
    zet(l, { hand: null });
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  speelLesgeluid("goed");
  bliepoScherm("goed");
  zet(l, { kaleSom: { plek: "boven", a: v.a, b: v.b, uitkomst: v.a - v.b, kleuren: [A, B] } });
  await zegDoor(l, variant("samenKlaar", ZIN.samenKlaar(v)));
}

/* ---------- de uitleg aan het begin: de stippenmachine (draaiboek Minsommen stap 1 t/m 7; ronde 34) ---------- */

/** De stippen en de teller van de uitleg: `n` stippen, de plusknop tikbaar of dof. */
function toonMachine(l: Lesgids, n: number, plus: "aan" | "dof") {
  zet(l, { erbij: { n, kleur: hex(INTRO_KLEUR), plus }, teller: { n, kleur: hex(INTRO_KLEUR) } });
}

/**
 * Het kind tikt `nodig` keer op de plusknop (een opdracht: geen pijl, de les wacht, 15.27). Elke tik: een stip erbij en
 * de teller telt mee. Na ± 6 s stilte komt vanzelf het hulphandje met 1 korte zin (15.19). Meer tikken dan gevraagd kan
 * niet (de knop wordt dof). Geeft het aantal stippen terug.
 */
async function tikPlus(l: Lesgids, begin: number, nodig: number, zinnen: string[], vraag: string, ring: boolean): Promise<number> {
  let n = begin;
  let gedaan = 0;
  toonMachine(l, n, "aan");
  if (ring) zet(l, { ring: "plus" });
  haak(l, { soort: "plus", nodig, vraag }, true);
  zetTestAntwoord("plus");
  let handGezegd = false;
  let klok: ReturnType<typeof setTimeout> | undefined;
  const wachtOpHand = () => {
    clearTimeout(klok);
    klok = setTimeout(() => {
      if (gedaan >= nodig) return;
      log(l, "aanwijzing", { plus: true });
      zet(l, { hand: { plek: { x: PLUS_PLEK.x + 16, y: PLUS_PLEK.y + 20 }, sleutel: `plus-${n}-${Date.now()}` } });
      if (!handGezegd) {
        handGezegd = true;
        st(l).handNr++;
        void zeg(l, `${variant("aanmoedigTikken", AANMOEDIG_TIKKEN)} ${variant("plusHand", INTRO.plusHand)}`).catch(() => {});
      }
    }, AANWIJZING_MS);
  };
  let eersteTik: (() => void) | null = null;
  const eerste = new Promise<void>((r) => (eersteTik = r));
  void zegOpdracht(l, zinnen, eerste).catch(() => {});
  wachtOpHand();
  try {
    while (gedaan < nodig) {
      await l.wachtOpVlak<{ soort: string }>("plusTik");
      (eersteTik as (() => void) | null)?.();
      gedaan++;
      n++;
      zet(l, { hand: null, ring: null });
      toonMachine(l, n, gedaan >= nodig ? "dof" : "aan");
      speelLesgeluid("tik");
      log(l, "plus-tik", { n });
      if (gedaan < nodig) wachtOpHand();
    }
  } finally {
    clearTimeout(klok);
    zet(l, { hand: null, ring: null });
  }
  haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  return n;
}

/** Een keuzevraag van de uitleg: 2 pogingen (15.11), hint zonder het antwoord (15.17), 2e fout = samen voordoen. */
async function introVraag(l: Lesgids, q: IntroVraag, stippen: number): Promise<number> {
  const s = st(l);
  const opties = schud(q.keuzes);
  let zinnen = q.vraag;
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(q.goed);
    haak(l, { soort: "kies", opties, goed: q.goed, poging, vraag: q.id }, poging === 1);
    const x = await vraagMetKnoppen(l, opties, zinnen, MIDDEN_SOM);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === q.goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed });
      /* Lof (zonder de bijzondere momenten van de 15 vragen), en wat er klopt; geen woord dat in beide zinnen begint. */
      const lof = poging === 1 ? kies(l, LOF, [LOF_KIJK_INDEX, ...alleenBijKeuze(l, LOF)]) : bevestig(l);
      const reactie = rijtjeIntro(q);
      const r = kies(l, reactie, reactie.zinnen.map((_, i) => i).filter((i) => woord(reactie.zinnen[i]) === woord(lof)), `reactie-${q.id}`);
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: q.id, zin: `${lof} ${r}` });
      await zegDoor(l, lof, r);
      noteer(l, q.id, poging === 1 ? "goed" : "naFout");
      return stippen;
    }
    bliepoScherm("fout");
    s.opRij = 0;
    const f = q.fouten[x];
    zet(l, { fout: ++s.fout });
    legDenkfoutVast(l, { vraag: q.id, antwoord: x, denkfout: f.code, poging });
    log(l, "reactie", { soort: `fout${poging}`, vraag: q.id, x, denkfout: f.code });
    if (poging === 1) {
      zet(l, { ring: f.ring });
      await zegDoor(l, f.eerste, f.hint);
      zet(l, { ring: null });
      zinnen = q.opnieuw;
      continue;
    }
    /* 2e fout: uitleg, dan samen voordoen: het kind doet de kleine stap (1 keer op de plus). */
    await zegDoor(l, ...f.tweede, variant("samen", passend(ZIN.samen, MAX_UITLEG, ...f.tweede)));
    const n = await tikPlus(l, stippen, 1, q.samen.opdracht, q.id, false);
    speelLesgeluid("goed");
    bliepoScherm("goed");
    await zegDoor(l, ...q.samen.klaar);
    noteer(l, q.id, "samen");
    return n;
  }
  return stippen;
}
const rijtjeIntro = (q: IntroVraag): Rijtje => ({ zinnen: q.goedReactie, robot: [] });

/** Stap 1 t/m 7 van het draaiboek: de machine leren kennen (stippen erbij, de teller, het totaal, hoe heet dit). */
async function leerMachineKennen(l: Lesgids) {
  /* Verdergaan (15.53): de vragen van het leren kennen die al gemaakt zijn, komen niet terug (met hun uitleg ervoor). */
  const gedaan = INTRO_VRAGEN.map((q) => klaarAl(l, q.id));
  if (gedaan.every(Boolean)) {
    st(l).plusTel = 2;
    balk(l);
    return;
  }
  let n: number;
  if (gedaan.some(Boolean)) {
    /* Halverwege: de machine staat weer met het aantal stippen van toen (onthouden). De 2 opdrachten op de plus waren al gedaan. */
    st(l).plusTel = 2;
    balk(l);
    n = Number(l.hervat?.extra.stippen ?? 3);
    toonMachine(l, n, "dof");
  } else {
    await zegDoor(l, variant("introBegin", INTRO.begin));
    n = await tikPlus(l, 0, 1, INTRO.plusEerst, "intro-plus-1", true);
    st(l).plusTel++;
    balk(l);
    zet(l, { ring: "teller" });
    await zegDoor(l, INTRO.eersteStip);
    zet(l, { ring: null });
    n = await tikPlus(l, n, 2, INTRO.meer, "intro-plus-3", false);
    st(l).plusTel++;
    balk(l);
  }
  for (const [k, q] of INTRO_VRAGEN.entries()) {
    if (gedaan[k]) continue;
    n = await introVraag(l, q, n);
    l.onthoud?.("stippen", n);
  }
  await zegDoor(l, variant("introEinde", INTRO.einde));
}

/* ---------- een vraag ---------- */

async function minVraag(l: Lesgids, v: Minvraag, i: number): Promise<Uitkomst> {
  const s = st(l);
  const u = v.a - v.b;
  const goed = String(u);
  const opties = schud(v.keuzes).map(String);
  const fouten = foutenVan(v);
  const [ka, kb] = kleurenVan(v);
  const midden = v.soort === "machine" ? MIDDEN_MACHINE : MIDDEN_SOM;
  const eersteVraag = i === 0;
  if (!eersteVraag) {
    void l.zeg().catch(() => {});
    toonBeeld(l, v);
    /* De vraag komt met het nieuwe beeld (zoals Synthesis), ±0,7 s na het einde van de vorige zin (15.27). */
    await l.wacht(150);
    /* De eerste keer het schoolbord: wat het kind ziet verandert, dus een korte overgang (BLIEPO-KARAKTER.md §12). */
    if (v.soort === "bord" && !VRAGEN.slice(0, i).some((x) => x.soort === "bord")) await zegDoor(l, variant("bordEerst", ZIN.bordEerst));
  }
  const vraagZinnen = v.soort === "machine" ? ZIN.machineVraag(v, v.nr > 1) : ZIN.somVraag(v);
  let zinnen = vraagZinnen;
  let eerder: Fout | null = null;
  let eersteX = "";
  let eersteZin = "";
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    zetTestAntwoord(goed);
    haak(l, { soort: "kies", opties, goed, poging, vraag: v.id }, poging === 1);
    const x = await vraagMetKnoppen(l, opties, zinnen, midden);
    haak(l, null);
    await l.wacht(DENK_MS);
    if (x === goed) {
      speelLesgeluid("goed");
      bliepoScherm("goed");
      zet(l, { goed: ++s.goed, machineRondje: false });
      /* Het goede antwoord in beeld: de machine draait nu pas (naspelen), of de uitkomst komt in de som. */
      const machineKlaar = v.soort === "machine" ? l.wacht(machineDuur(10, v.b) + 200) : null;
      if (v.soort === "machine") zet(l, { uitkomst: u });
      else zet(l, { kaleSom: kaleSom(v, u) });
      const zz = poging === 1 ? lofZinnen(l, v, eersteVraag) : [bevestig(l), `${g(v.a, ka)} − ${g(v.b, kb)} = ${g(u, ka)}.`];
      log(l, "reactie", { soort: poging === 1 ? "goed" : "goed-na-fout", vraag: v.id, zin: zz.join(" ") });
      const getikt = await zegDoor(l, ...zz);
      /* Even kijken naar de machine tot de blokjes eruit zijn (zoals de oude les); een tik op de pijl = meteen door. */
      if (machineKlaar && !getikt) await Promise.race([machineKlaar, l.verder()]);
      return noteer(l, v.id, poging === 1 ? "goed" : "naFout");
    }
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (BOUWREGELS 5.3). */
    bliepoScherm("fout");
    s.opRij = 0;
    const f = fouten[x] ?? onduidelijk(v);
    zet(l, { fout: ++s.fout });
    legDenkfoutVast(l, { vraag: v.id, antwoord: x, denkfout: f.code, poging });
    const fz = foutZinnen(l, f, x, ka, poging, eerder, eersteX, eersteZin).filter(Boolean);
    log(l, "reactie", { soort: `fout${poging}`, vraag: v.id, x, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout: de eerste zin en de hint, met het rode rondje om het getal dat eraf gaat; vanzelf door (15.27). */
      if (f.rondje) rondje(l, v, true);
      await zegDoor(l, ...fz);
      rondje(l, v, false);
      zinnen = [variant("opnieuw", ZIN.opnieuw(v))];
      eerder = f;
      eersteX = x;
      eersteZin = fz[0] ?? "";
      continue;
    }
    /* 2e fout (15.11): uitleg, dan samen voordoen; het kind haalt zelf weg. */
    await zegDoor(l, ...fz, variant("samen", passend(ZIN.samen, MAX_UITLEG, ...fz), (z) => !fz.some((y) => deeltStuk(y, z))));
    await samenVoordoen(l, v);
    return noteer(l, v.id, "samen");
  }
  return noteer(l, v.id, "samen");
}

const onduidelijk = (v: Minvraag): Fout => ({ code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk", eerste: "", hint: `Begin bij ${g(v.a, kleurenVan(v)[0])} en tel ${g(v.b, kleurenVan(v)[1])} terug.`, uitleg: "We rekenen het samen uit.", weer: [], rondje: "eraf", scherm: "", beperking: {} });

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-min-machine-1-gouden",
  titel: "Minsommen: hoeveel over?",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla; geleerd bij Tellen). */
  synthesis: "Squla groep 3 · Minsommen · Minsommen · level 1 · gouden les (nieuwe versie van squla-min-machine-1) · verloop draaiboek Minsommen (Dot Destruction)",
  indeling: "synthesis",
  browserstem: true,
  /* BOUWREGELS 15.27: zinnen van 1 stuk onder elkaar, pijl rechts als snelkoppeling, een tik stopt de stem. */
  pijlZoalsSynthesis: true,
  /* Bliepo praat zijn zinnen helemaal uit (15.27 punt 5; lib/stem.ts heelUitpraten). */
  stemHeelUitpraten: true,
  /* Elk woord licht op als Bliepo het zegt, ook met de browserstem (BOUWREGELS 3.7, 10 nov 2026; lib/stem.ts woordenMee). */
  woordenMeeMetStem: true,
  /* Het nieuwe eindscherm (15.55, EINDSCHERM-INBOUW.md, 27 nov 2026). De oude kaart (KaartMinsommen) blijft in
     squla-minsommen-vlak.tsx staan; deze les gebruikt hem niet meer. */
  eindscherm: true,
  eindLeerzin: "Je kunt nu minsommen maken tot 10.",
  eindPlaatje: "/voorwerpen/schoolbord.png",
  eindOnderwerp: "Minsommen",
  eindKaartZin: EIND_TIK_KAART,
  nacht: true,
  voorwerpen: ["schoolbord"],
  async speel(l) {
    STAAT.delete(l);
    log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    l.voortgang?.(0);
    /* Stap 1. Openen: de lege stippenmachine staat er (teller 0); Bliepo groet en zegt in hetzelfde stuk wat we gaan doen. */
    l.vlak<GoudenMinProps>(GoudenMinVlak, { toneel: null });
    toonMachine(l, 0, "dof");
    await l.wacht(600);
    st(l).naamKeer = 1;
    st(l).naamVraag = 0;
    /* Verdergaan (15.53): "welkom terug" in plaats van de groet. Opnieuw doen: eerst zeggen dat het kind de les al deed. */
    if (l.hervat) await zegDoor(l, l.openingsZin ?? NAAM_GROET);
    /* Opnieuw doen na de beste kleur (15.60, zoals Synthesis): eerst de groet, dan "dit ken je al", en meteen vraag 1. Geen
       uitlegdeel en geen machine leren kennen (ook niet bij verdergaan in zo'n beurt). */
    else if (l.zonderUitleg) await zegDoor(l, ...[NAAM_GROET, l.openingsZin ?? ""].filter(Boolean));
    else await zegDoor(l, ...(l.openingsZin ? [l.openingsZin] : []), NAAM_GROET, variant("begin", ZIN.begin));

    /* De machine leren kennen (ronde 34, 12 november 2026): draaiboek stap 1 t/m 7, in eigen woorden. */
    if (!l.zonderUitleg) await leerMachineKennen(l);
    /* Dan de eerste vraag van de Squla-les: de min-machine met blokjes. */
    void l.zeg().catch(() => {});
    toonBeeld(l, VRAGEN[0]);
    await l.wacht(150);

    /* De 15 vragen van squla-min-machine-1. */
    for (const [i, v] of VRAGEN.entries()) {
      /* Verdergaan: al gemaakt vóór het weggaan? Overslaan, met de overgangszin. */
      if (klaarAl(l, v.id)) continue;
      st(l).laatste = i === VRAGEN.length - 1;
      /* Af en toe een overgangszin (BLIEPO-KARAKTER.md §12); meestal niet, het tempo gaat voor. */
      if (i === 11) await zegDoor(l, kies(l, OVERGANG));
      await minVraag(l, v, i);
    }

    /* Stap 19. Einde: het nieuwe eindscherm (15.55; EINDSCHERM-INBOUW.md, 27 nov 2026). Was: slotzin, de kaart, een
       eindzin uit het rijtje, "Tik op de kaart." en het afscheid. */
    l.som(null);
    zet(l, { ...LEEG, toneel: null });
    await eindeScherm(l);
  },
};

/**
 * Percentage goed in 1 keer (van alle vragen van de les, ook de 2 bij het leren kennen van de machine) en de denkfouten
 * van deze speelbeurt, voor de kleur van de kaart en het bewaren (15.55). Op de voorbeeldpagina kun je met `&snel=p72`
 * een percentage forceren (alleen om elke kleur te kunnen zien).
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
  return { percentage: percentageGoed(goed, Math.max(vragenTotaal(l), s.eerste.size)), denkfouten: [...s.alleDenkfouten] };
}

/** Het eindscherm met 1 eindzin van Bliepo (zoals Tellen extra; de standaardzinnen uit eindzinnen.ts). */
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
  l.vlak<GoudenMinProps>(GoudenMinVlak, { toneel: null });
  toonMachine(l, 0, "dof");
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

export const LESSEN_SQULA_MINSOMMEN_GOUDEN: Lesdraaiboek[] = [gouden];
