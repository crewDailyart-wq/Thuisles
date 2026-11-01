/**
 * Gedeelde stukjes voor de lessen "Splitsen" (squla-splitsen.tsx) en de
 * schattenjacht (squla-piraat.tsx), 31 oktober 2026. De hulp zelf is altijd
 * de vaste hulp van Bliepo (squla-hulp.ts).
 */

import type { ComponentType } from "react";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag as echteSqulaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { SqulaSplitsVlak, type Beeld, type SplitsProps } from "../vlakken/squla-splitsen-vlak";

/**
 * Het beginscherm ("Kun je dit al?") laat de EERSTE vraag van de les zien,
 * zonder dat het kind iets hoeft te doen. `voorbeeldVan(vraag)` draait die
 * vraag, maar `squlaVraag` zet dan alleen het beeld neer (geen vraag, geen
 * antwoord). Zo blijft het voorbeeld altijd gelijk aan de echte eerste vraag.
 */
let voorbeeldAan = false;
export function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  if (voorbeeldAan) {
    v.toon?.();
    return Promise.resolve(true);
  }
  return echteSqulaVraag(l, v);
}
export function voorbeeldVan(vraag: Vraag): (l: Lesgids, st: Stand) => void {
  return (l, st) => {
    voorbeeldAan = true;
    try {
      void vraag(l, st).catch(() => {});
    } finally {
      voorbeeldAan = false;
    }
  };
}

/** Een getal in de zin (wit, of in een kleur). */
export const g = (n: number, k = "wit") => `{${n}:${k}}`;

export type Stand = { huidig: string; goed: number; fout: number; typUitgelegd: boolean; tikUitgelegd: boolean; letters: number };
export type Vraag = (l: Lesgids, st: Stand) => Promise<boolean>;

export const zet = (l: Lesgids, p: Partial<SplitsProps>) => l.pasVlakAan<SplitsProps>(p);
export const LEEG: Partial<SplitsProps> = { licht: [], goedIds: [], uit: [], toon: [], actief: false };

/** Een nieuw beeld (Bliepo tovert het tevoorschijn). Hetzelfde beeld (nog een keer, na de uitleg): alles blijft staan. */
export function toon(l: Lesgids, st: Stand, beeld: Beeld, extra: Partial<SplitsProps> = {}): boolean {
  if (st.huidig === beeld.id) return false;
  st.huidig = beeld.id;
  zet(l, { ...LEEG, beeld, ...extra });
  speelLesgeluid("verschijn");
  return true;
}

export const goedBeeld = (l: Lesgids, st: Stand, extra: Partial<SplitsProps> = {}) => zet(l, { goed: ++st.goed, licht: [], actief: false, ...extra });
export const foutBeeld = (l: Lesgids, st: Stand) => zet(l, { fout: ++st.fout });

export async function kiesGetal(l: Lesgids, keuzes: number[]) {
  return Number(await l.kies(keuzes.map(String), { weetniet: false, direct: true }));
}

export async function kiesTekst(l: Lesgids, opties: string[]) {
  return String(await l.kies(opties, { weetniet: false, direct: true }));
}

/** Wachten tot het kind iets in de tekening aantikt. */
export async function tik(l: Lesgids): Promise<string> {
  zet(l, { actief: true });
  const t = await l.wachtOpVlak<{ soort: string; id: string }>("tik");
  zet(l, { actief: false });
  return t.id;
}

/**
 * Twee dingen aantikken (nog eens op hetzelfde = niet meer gekozen). Het
 * eerste licht op. `test(a)` geeft voor de automatische test wat er daarna
 * goed is. Daarna vanzelf nakijken.
 */
export async function kiesTwee(l: Lesgids, eerste: string, test: (a: string) => string): Promise<[string, string]> {
  for (;;) {
    zetTestAntwoord(eerste);
    zet(l, { licht: [] });
    const a = await tik(l);
    zet(l, { licht: [a] });
    zetTestAntwoord(test(a));
    const b = await tik(l);
    if (b === a) continue;
    zet(l, { licht: [a, b] });
    await l.wacht(450);
    return [a, b];
  }
}

/** Een getal typen (echt invoerveld, HARDE REGEL 5). De eerste keer wijst Bliepo het vinkje aan. */
export async function typGetal(l: Lesgids, st: Stand): Promise<number> {
  const p = l.getal();
  if (!st.typUitgelegd) {
    st.typUitgelegd = true;
    await l.wijsAan("controleer", "Typ het getal.", "Tik dan op het vinkje.");
  }
  let x = await p;
  while (x === null) x = await l.getal();
  return x;
}

/** Een staafje-uitleg (naar het filmpje "Rekenen met staafjes"): de staaf van het totaal, en eronder het bekende stuk. */
export function staafBeeld(id: string, totaal: number, deel: number): Beeld {
  const blok = totaal > 12 ? 34 : 44;
  const x0 = 490 - (totaal * blok) / 2;
  return {
    id,
    delen: [
      { s: "tekst", id: "st-t", t: String(totaal), x: x0 - 50, y: 280, grootte: 54 },
      { s: "staaf", id: "st-a", x: x0, y: 280, n: deel, kleur: 0xdcecff, blok },
      { s: "staaf", id: "st-b", x: x0 + deel * blok, y: 280, n: totaal - deel, kleur: 0xdcecff, blok },
      { s: "tekst", id: "st-d", t: String(deel), x: x0 - 50, y: 380, grootte: 54, kleur: "#ffad5c" },
      { s: "staaf", id: "st-o", x: x0, y: 380, n: deel, kleur: 0xffad5c, blok },
      { s: "tekst", id: "st-v", t: "?", x: x0 + deel * blok + ((totaal - deel) * blok) / 2, y: 380, grootte: 54 },
    ],
  };
}

export type LesOpties = {
  id: string;
  titel: string;
  onderwerp: string;
  oefening: string;
  level: number;
  kaart: ComponentType;
  voorwerpen: string[];
  begin: Beeld | null;
  welkom: string[];
  /**
   * Het beginscherm (BOUWREGELS 4.1, squla-hulp.ts): zet een echte opgave uit
   * deze les in beeld, nog zonder dat het kind iets hoeft te doen. Daarna
   * tekent de eerste vraag (Ja) of de uitleg (Nee) het vlak opnieuw.
   */
  voorbeeld?: (l: Lesgids, st: Stand) => void;
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  vragen: Vraag[];
  /** Bij de start, vóór het welkom (bijvoorbeeld het verhaal klaarzetten). */
  start?: (l: Lesgids, st: Stand) => void;
  /** Na elke vraag (ook de verhaalstukjes van de schattenjacht). */
  naVraag?: (l: Lesgids, st: Stand) => Promise<void>;
  slot?: (l: Lesgids, st: Stand) => Promise<void>;
  eind: string;
};

export function les(t: LesOpties): Lesdraaiboek {
  return {
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · ${t.onderwerp} · ${t.oefening} · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    kaarttekening: t.kaart,
    nacht: true,
    voorwerpen: t.voorwerpen,
    async speel(l) {
      const st: Stand = { huidig: t.begin?.id ?? "", goed: 0, fout: 0, typUitgelegd: false, tikUitgelegd: false, letters: 0 };
      l.vlak<SplitsProps>(SqulaSplitsVlak, { beeld: t.begin });
      if (t.begin) speelLesgeluid("verschijn");
      t.start?.(l, st);
      const vb = t.voorbeeld;
      await squlaBegin(l, {
        welkom: t.welkom,
        uitleg: () => t.uitleg(l, st),
        ...(vb ? { voorbeeld: () => vb(l, st) } : {}),
      });
      /* Na het voorbeeld zet de eerste vraag zijn beeld weer schoon neer (niets van de uitleg blijft staan). */
      if (vb) {
        st.huidig = "";
        l.som(null);
      }
      let fouten = 0;
      for (const v of t.vragen) {
        if (!(await v(l, st))) fouten++;
        l.som(null);
        await t.naVraag?.(l, st);
      }
      l.som(null);
      await t.slot?.(l, st);
      await squlaEind(l, fouten, t.eind);
    },
  };
}
