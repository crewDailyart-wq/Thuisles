/**
 * GEDEELDE HULP VOOR DE 3 EXTRA GOUDEN LESSEN (12 november 2026; besluit Sara 20.3, 21.7, 22.3):
 *   squla-tellen-fruit-1-gouden-extra, squla-splits-splitsen1-1-gouden-extra, squla-plus-bakkerij-1-gouden-extra.
 *
 * Dit zijn APARTE lessen naast de gouden lessen: de bestaande gouden lessen veranderen niet. Alles hier is dezelfde
 * werkwijze als in de gouden Tellen (squla-tellen-gouden.tsx), maar los van die les opgebouwd, zodat er niets van de
 * bestaande lessen wordt aangeraakt: Bliepo praat door (15.27), 2 pogingen (15.11), hulphandje vanzelf na ± 6 s bij een
 * opdracht (15.19), rood scherm 1,5 s bij fout en groen 1 s bij goed, geen foutgeluidje, elke fout en elke uitkomst in
 * de voortgang (bewaarUitkomst; zonder gekozen kind gebeurt er niets).
 *
 * Eigen invulling, niet van Synthesis: de woorden, de hints en de fouttabellen; het verloop (de soort vragen) komt uit het
 * draaiboek van het onderwerp (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/*.md).
 */

import type { Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bewaarUitkomst } from "@/app/lesuitkomstacties";
import { BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, LOF_KIJK_INDEX, MOMENT, NAAM_LOF, ONDUIDELIJK, ONDUIDELIJK_NOG_1_KEER, OND_FOUT, metNaam, zaad, type Fout, type Rijtje } from "./squla-extra-zuiver";
import { zetTestAntwoord } from "./squla-hulp";

export { BEVESTIG, EINDE, EINDE_VEEL_FOUTEN, LOF, MOMENT, NAAM_LOF, ONDUIDELIJK, OND_FOUT, metNaam, zaad, type Fout, type Rijtje };

/* ---------- tempo ---------- */

/** Reactie na een tik (6.10a: 0,2 tot 0,4 s). */
export const DENK_MS = 200;
/** Bij een opdracht: na zoveel stilte vanzelf het hulphandje (15.19: ongeveer 6 s). */
export const AANWIJZING_MS = 6000;
/** Zo lang na het einde van de stem komt het volgende stuk (15.27). */
export const DOOR_NA_MS = 400;
/** Vangnet bij samen doen: na zoveel stilte doet Bliepo de rest zelf. */
export const VANGNET_MS = 20000;

export type Uitkomst = "goed" | "naFout" | "samen";

type Staat = { vorige: Map<Rijtje, number>; zinNr: number; robotNr: number; naamVraag: number; naamKeer: number; namen: number; opRij: number; momenten: Set<string>; haak: number; goed: number; fout: number; vraag: number; laatste: boolean; eerste: Map<string, Uitkomst>; vraagFouten: Map<string, string[]>; log: unknown[] };

export function schud<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function maakBasis(LES_ID: string) {
  const STAAT = new WeakMap<Lesgids, Staat>();
  const st = (l: Lesgids): Staat => {
    let s = STAAT.get(l);
    if (!s) STAAT.set(l, (s = { vorige: new Map(), zinNr: 0, robotNr: -99, naamVraag: -99, naamKeer: 0, namen: 0, opRij: 0, momenten: new Set(), haak: 0, goed: 0, fout: 0, vraag: 0, laatste: false, eerste: new Map(), vraagFouten: new Map(), log: [] }));
    return s;
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

  /** Voor de eigen test: wat de les nu vraagt (window.__phaser.telTaak). Verandert niets aan de les. */
  function haak(l: Lesgids, info: Record<string, unknown> | null) {
    if (typeof window === "undefined") return;
    const s = st(l);
    window.__phaser = { ...window.__phaser, telTaak: info ? { ...info, n: ++s.haak, v: s.vraag } : null } as typeof window.__phaser;
  }

  function legDenkfoutVast(l: Lesgids, d: { vraag: string; antwoord: string; denkfout: string; poging: number }) {
    const s = st(l);
    s.vraagFouten.set(d.vraag, [...(s.vraagFouten.get(d.vraag) ?? []), d.denkfout]);
    if (typeof window === "undefined") return;
    const regel = { les: LES_ID, tijd: new Date().toISOString(), ...d };
    const w = window as unknown as { __denkfouten?: unknown[] };
    (w.__denkfouten ??= []).push(regel);
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

  /** Kies een zin uit een vast rijtje: nooit dezelfde als de vorige, robotzinnen niet kort na elkaar. */
  function kies(l: Lesgids, r: Rijtje, zonder: number[] = []): string {
    const s = st(l);
    s.zinNr++;
    const vorige = s.vorige.get(r) ?? -1;
    const robotMag = s.zinNr - s.robotNr > 6;
    const mag = r.zinnen.map((_, i) => i).filter((i) => i !== vorige && !zonder.includes(i) && (robotMag || !r.robot.includes(i)));
    const keuze = mag.length ? mag : r.zinnen.map((_, i) => i).filter((i) => i !== vorige);
    const i = keuze[Math.floor(Math.random() * keuze.length)] ?? 0;
    s.vorige.set(r, i);
    if (r.robot.includes(i)) s.robotNr = s.zinNr;
    return r.zinnen[i];
  }

  /** Lof bij goed in 1 keer: een speciaal moment, soms de naam, anders een lofzin. */
  function lof(l: Lesgids, eerste: boolean): string {
    const s = st(l);
    s.opRij++;
    const moment = (naam: keyof typeof MOMENT, nu: boolean) => {
      if (!nu || s.momenten.has(naam)) return null;
      s.momenten.add(naam);
      return kies(l, MOMENT[naam]);
    };
    let uit = moment("laatste", s.laatste) ?? moment("eerste", eerste) ?? moment("drieOpRij", s.opRij >= 3);
    if (!uit && s.naamKeer < 2 && s.namen < 2 && s.vraag - s.naamVraag >= 4 && s.opRij >= 2 && l.naam) {
      s.naamKeer++;
      s.naamVraag = s.vraag;
      uit = kies(l, NAAM_LOF);
    }
    return uit ?? kies(l, LOF, [LOF_KIJK_INDEX]);
  }
  const bevestig = (l: Lesgids) => {
    st(l).opRij = 0;
    return kies(l, BEVESTIG);
  };

  /* ---------- zeggen met en zonder pijl (15.27) ---------- */

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

  /** De zin bij een opdracht: geen pijl; de les wacht daarna op de opdracht. */
  function zegOpdracht(l: Lesgids, zin: string): Promise<void> {
    log(l, "opdrachtzin", { zin });
    l.verderWeg?.();
    const z = zeg(l, zin);
    z.catch(() => {});
    void z.then(() => log(l, "vraag-klaar"), () => {});
    return z;
  }

  /** Keuzeknoppen tegelijk met de zinnen (de vraag, of bij de 2e poging de hint). Een tik tijdens de zin telt. */
  async function vraagMetKnoppen(l: Lesgids, opties: string[], zinnen: string[], instel: { raster?: boolean } = {}): Promise<string> {
    const p = l.kies(opties, { direct: true, weetniet: false, ...instel });
    log(l, "vraag", { zin: zinnen.join(" "), opties });
    /* De vraag is 1 uiting: tikt het kind al tijdens de 1e zin, dan begint Bliepo niet alsnog aan de 2e. */
    const z = zeg(l, zinnen.join(" "));
    z.catch(() => {});
    const eerst = await Promise.race([z.then(() => "gezegd" as const), p.then(() => "getikt" as const)]);
    const klaar = eerst === "gezegd" ? performance.now() : null;
    if (klaar) log(l, "vraag-klaar");
    const x = (await p) ?? "";
    log(l, "tik", { x, naVraag: klaar ? Math.round(performance.now() - klaar) : -1 });
    return x;
  }

  /** Wat Bliepo zegt bij een fout, uit de fouttabel. */
  function foutZinnen(l: Lesgids, f: Fout, poging: 1 | 2, eerder: Fout | null): string[] {
    const eerste = f.eerste || kies(l, ONDUIDELIJK, poging === 2 ? [ONDUIDELIJK_NOG_1_KEER] : []);
    if (poging === 1) return [eerste, f.hint];
    /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was (niet na alleen "… is dichtbij."). */
    const zelfde = eerder !== null && eerder.soort === f.soort && !eerder.noot && f.code !== "onduidelijk" && f.weer.length > 0;
    return zelfde ? f.weer : [eerste, f.uitleg];
  }

  function goedMoment(l: Lesgids) {
    speelLesgeluid("goed");
    bliepoScherm("goed");
    return ++st(l).goed;
  }
  function foutMoment(l: Lesgids) {
    /* Geen fout-geluidje en geen rood op de keuze; alleen Bliepo's scherm kleurt rood (5.3). */
    bliepoScherm("fout");
    st(l).opRij = 0;
    return ++st(l).fout;
  }

  /**
   * Het hulphandje bij een opdracht (15.19): na ± 6 s stilte komt vanzelf het handje, de eerste keer met 1 korte zin.
   * `aan()` zet het handje in beeld; `uit()` haalt het weg. Elke tik van het kind zet de tijd terug (`opnieuw()`).
   */
  function handKlok(l: Lesgids, o: { aan: () => void; uit: () => void; zin?: string | null }) {
    let klok: ReturnType<typeof setTimeout> | undefined;
    let gezegd = false;
    let weg = false;
    const opnieuw = () => {
      clearTimeout(klok);
      if (weg) return;
      o.uit();
      klok = setTimeout(() => {
        if (weg) return;
        log(l, "aanwijzing");
        o.aan();
        if (!gezegd && o.zin) {
          gezegd = true;
          void zeg(l, o.zin).catch(() => {});
        }
      }, AANWIJZING_MS);
    };
    const stop = () => {
      weg = true;
      clearTimeout(klok);
      o.uit();
    };
    return { opnieuw, stop };
  }

  /** Eén keuzevraag met 2 pogingen; de beelden en het samen doen zitten in `o` (de les zelf). */
  async function keuzeVraag(
    l: Lesgids,
    o: {
      id: string;
      opties: string[];
      goed: string;
      zinnen: string[];
      /** Alle foute antwoorden van deze vraag. */
      fout: (x: string) => Fout;
      /** Eerste vraag van de les (lof "goed begin"). */
      eerste?: boolean;
      /** Bij goed in 1 keer: wat Bliepo zegt (lof erbij, evt. beeld). Geeft de zinnen terug. */
      bijGoed: (poging: 1 | 2, lofZin: string) => Promise<void> | void;
      /** Bij een fout: het beeld (dof maken, ...). */
      bijFout?: (x: string, f: Fout, poging: 1 | 2) => void;
      /** De 2e fout: uitleg is al gezegd; nu samen voordoen. */
      samen: (x: string, f: Fout) => Promise<void>;
      /** Raster met cijfertegels (antwoordtegels 1–9). */
      raster?: boolean;
    },
  ): Promise<Uitkomst> {
    const s = st(l);
    s.vraag++;
    let eerder: Fout | null = null;
    let eersteX = "";
    let zinnen = o.zinnen;
    for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
      zetTestAntwoord(o.goed);
      haak(l, { soort: "kies", opties: o.opties, goed: o.goed, poging, vraag: o.id, fout: o.opties.filter((k) => k !== o.goed) });
      const x = await vraagMetKnoppen(l, o.opties, zinnen, { raster: o.raster });
      haak(l, null);
      await l.wacht(DENK_MS);
      if (x === o.goed) {
        goedMoment(l);
        if (poging === 1) {
          await o.bijGoed(1, lof(l, !!o.eerste));
          return noteer(l, o.id, "goed");
        }
        await o.bijGoed(2, bevestig(l));
        return noteer(l, o.id, "naFout");
      }
      foutMoment(l);
      const f = o.fout(x);
      legDenkfoutVast(l, { vraag: o.id, antwoord: x, denkfout: f.code, poging });
      const fz = foutZinnen(l, f, poging, eerder).filter(Boolean);
      /* Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin. */
      if (poging === 2 && x === eersteX && fz[0] === f.eerste && f.weer.length) fz.splice(0, fz.length, ...f.weer);
      log(l, "reactie", { soort: `fout${poging}`, vraag: o.id, x, denkfout: f.code, zin: fz.join(" ") });
      o.bijFout?.(x, f, poging);
      if (poging === 1) {
        /* 1e fout: de eerste zin (vanzelf door), dan komen de knoppen terug met de hint (een vraag: geen pijl). */
        await zegDoor(l, fz[0]);
        zinnen = fz.slice(1);
        eerder = f;
        eersteX = x;
      } else {
        /* 2e fout (15.11): uitleg, samen voordoen, door. */
        await zegDoor(l, ...fz);
        await o.samen(x, f);
        return noteer(l, o.id, "samen");
      }
    }
    return noteer(l, o.id, "samen");
  }

  /** De einde-stap: slotzin, kaart, eindzin uit het rijtje (zelfde als de andere gouden lessen). */
  async function einde(l: Lesgids, slot: string) {
    void l.zeg().catch(() => {});
    await zegDoor(l, slot);
    log(l, "kaart");
    l.verderWeg?.();
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await zeg(l, `${veelFouten(l) ? EINDE_VEEL_FOUTEN : kies(l, EINDE)} Tik op de kaart.`);
    await tik;
  }

  return { st, zeg, log, haak, legDenkfoutVast, noteer, veelFouten, kies, lof, bevestig, zegDoor, zegOpdracht, vraagMetKnoppen, foutZinnen, goedMoment, foutMoment, handKlok, keuzeVraag, einde };
}

export type Basis = ReturnType<typeof maakBasis>;
