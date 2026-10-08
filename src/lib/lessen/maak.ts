/**
 * Hulpjes om een lesstap kort op te schrijven.
 *
 * Zo blijft een les leesbaar als een draaiboek: wat de mascotte zegt, wat er
 * in beeld staat, wat het kind doet en wat het goede antwoord is.
 */

import type { Lesstap } from "@/lib/lessen/soort";

export type Toren = { stukken?: number[]; basis?: number; gat?: number; getal?: boolean };

type Basis = {
  uitleg?: string[];
  vraag: string;
  kop?: string;
  antwoord: string;
  goed: string;
  fout: string;
  tip: string;
};

/** Een tegelstap waarbij het kind een getal typt. */
export function tegelsTypen(s: Basis & { torens: Toren[]; leg?: number }): Lesstap {
  return {
    uitleg: s.uitleg ?? [],
    vraag: s.vraag,
    kop: s.kop ?? "?",
    invoer: "typen",
    spel: "tegels",
    opgave: { torens: s.torens, leg: s.leg ?? 0 },
    antwoord: s.antwoord,
    goedZin: s.goed,
    foutZin: s.fout,
    tip: s.tip,
  };
}

/** Een tegelstap waarbij het kind tegels uit de bak kiest. */
export function tegelsKiezen(s: Basis & { torens: Toren[]; bak: number[]; kies?: number; leg?: number }): Lesstap {
  return {
    uitleg: s.uitleg ?? [],
    vraag: s.vraag,
    kop: s.kop ?? "",
    invoer: "kiezen",
    spel: "tegels",
    opgave: { torens: s.torens, bak: s.bak, kies: s.kies ?? 1, leg: s.leg ?? 0 },
    antwoord: s.antwoord,
    goedZin: s.goed,
    foutZin: s.fout,
    tip: s.tip,
  };
}

/** Een tegelstap met knoppen om uit te kiezen (klopt / klopt niet, of sommen). */
export function tegelsKnoppen(s: Basis & { torens: Toren[]; knoppen: string[] }): Lesstap {
  return {
    uitleg: s.uitleg ?? [],
    vraag: s.vraag,
    kop: s.kop ?? "",
    invoer: "kiezen",
    spel: "tegels",
    opgave: { torens: s.torens, knoppen: s.knoppen },
    antwoord: s.antwoord,
    goedZin: s.goed,
    foutZin: s.fout,
    tip: s.tip,
  };
}

/** Een stap met bolletjes in groepjes (splitsen in meer delen). */
export function bolletjes(s: Basis & { groepen: number[]; knoppen?: string[]; invoer: "typen" | "kiezen" }): Lesstap {
  return {
    uitleg: s.uitleg ?? [],
    vraag: s.vraag,
    kop: s.kop ?? (s.invoer === "typen" ? "?" : ""),
    invoer: s.invoer,
    spel: "stippen",
    opgave: { stand: "splits", groepen: s.groepen, knoppen: s.knoppen ?? [] },
    antwoord: s.antwoord,
    goedZin: s.goed,
    foutZin: s.fout,
    tip: s.tip,
  };
}
