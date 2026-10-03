/**
 * Wat er bij een geld-opdracht in de vakjes hoort.
 *
 * Net als `tijdfiguren.ts`: een gewoon bestand zonder React, zodat `npm run
 * opgaven` van élke gemaakte opgave kan nakijken dat het antwoord van de
 * generator precies is wat het scherm als goed ziet.
 */

import type { Figuur } from "@/lib/generatoren/soort";
import { afgerond, antwoordVan, totaal } from "@/lib/geld";

/**
 * Wat er in het ene invoerveld van Geldnotatie staat, als bedrag in centen.
 *
 * Goed zijn "6,45", "7,5" (= 7,50), "26", "26,-" en "26,00". Een punt in
 * plaats van een komma geeft `"punt"`: dat is niet fout, het kind krijgt de
 * hint "Gebruik een komma" (WERKPLAN.md). Iets onleesbaars of leegs: null.
 */
export function leesGeldnotatie(tekst: string): number | "punt" | null {
  const t = tekst.trim().replace(/\s+/g, "");
  if (t === "") return null;
  if (t.includes(".")) return "punt";
  const m = t.match(/^(\d{1,3})(?:,(-|\d{1,2}))?$/);
  if (!m) return null;
  const euro = Number(m[1]);
  const na = m[2];
  if (na === undefined || na === "-") return euro * 100;
  return euro * 100 + (na.length === 1 ? Number(na) * 10 : Number(na));
}

export const GELDSOORTEN = [
  "geldkiezen",
  "geldvolgorde",
  "geldtellen",
  "geldleggen",
  "muntenofeuros",
  "geldgroepen",
  "welkegroepjes",
  "evenveel",
  "geldontbreekt",
  "geldsom",
  "geldverhaal",
  "kunjebetalen",
  "bonnetje",
  "geldafronden",
  "geldschatten",
  "geldkorting",
  "geldnotatie",
] as const;

/** De figuren van het domein Geld. */
export type Geldfiguur = Extract<Figuur, { soort: (typeof GELDSOORTEN)[number] }>;

export function isGeldfiguur(figuur: Figuur | null | undefined): figuur is Geldfiguur {
  return (
    figuur !== null &&
    figuur !== undefined &&
    (GELDSOORTEN as readonly string[]).includes(figuur.soort)
  );
}

/** Wat er op het bonnetje opgeteld moet worden: de som van de regels. */
export function bonnetjeTotaal(figuur: Extract<Geldfiguur, { soort: "bonnetje" }>): number {
  return totaal(figuur.regels.map((r) => r.prijs));
}

/** Kan dit zinnetje bij "Kun je het betalen?" van het budget? */
export function kanBetalen(budget: number, regel: { aantal: number; prijs: number }): boolean {
  return regel.aantal * regel.prijs <= budget;
}

/**
 * Het antwoord dat bij deze tekening hoort, als tekst.
 *
 * Een bedrag als "euro's,centen" (`antwoordVan`), een keuze als het nummer van
 * de knop, en bij meer vakjes de waarden met komma's ertussen.
 */
export function juistAntwoord(figuur: Geldfiguur): string {
  switch (figuur.soort) {
    case "geldkiezen":
    case "geldgroepen":
      return String(figuur.goed);

    case "geldvolgorde":
      /* Per plek van weinig naar veel het nummer van het kaartje dat daar hoort. */
      return figuur.stukken
        .map((_, i) => i)
        .sort((a, b) => figuur.stukken[a] - figuur.stukken[b])
        .join(",");

    case "geldtellen":
      return antwoordVan(totaal(figuur.stukken));

    case "geldleggen":
      return antwoordVan(figuur.doel);

    case "muntenofeuros":
      return `${figuur.aantal},${(figuur.aantal * figuur.munt) / 100}`;

    case "welkegroepjes":
      return figuur.groepen
        .map((g, i) => (totaal(g) === figuur.prijs ? i : -1))
        .filter((i) => i >= 0)
        .join(",");

    case "evenveel":
      return String((figuur.aantal * figuur.van) / figuur.naar);

    case "geldontbreekt":
      return figuur.keuzes
        ? String(figuur.goed)
        : antwoordVan(figuur.prijs - totaal(figuur.liggend));

    case "geldsom": {
      const links = totaal(figuur.links);
      const rechts = totaal(figuur.rechts);
      return antwoordVan(figuur.teken === "+" ? links + rechts : links - rechts);
    }

    case "geldverhaal":
      return figuur.keuzes ? String(figuur.goed) : antwoordVan(figuur.uitkomst);

    case "kunjebetalen":
      /* Per zin: 0 is Ja, 1 is Nee — dezelfde volgorde als de twee knoppen. */
      return figuur.regels.map((r) => (kanBetalen(figuur.budget, r) ? "0" : "1")).join(",");

    case "bonnetje":
      return antwoordVan(
        figuur.kwijt === null ? bonnetjeTotaal(figuur) : figuur.regels[figuur.kwijt].prijs,
      );

    case "geldafronden":
      return figuur.keuzes ? String(figuur.goed) : antwoordVan(afgerond(figuur.prijs));

    case "geldschatten": {
      if (figuur.keuzes) return String(figuur.goed);
      const [a, b] = figuur.prijzen.map(afgerond);
      if (figuur.stand === "samenstap") {
        return [a, b, a + b].map(antwoordVan).join(",");
      }
      if (figuur.stand === "samen") return antwoordVan(a + b);
      return antwoordVan((figuur.portemonnee ?? 0) - a);
    }

    case "geldnotatie":
      return figuur.keuzes ? String(figuur.goed) : antwoordVan(figuur.bedrag);

    case "geldkorting":
      if (figuur.keuzes) return String(figuur.goed);
      return antwoordVan(figuur.stand === "korting" ? figuur.korting : figuur.was - figuur.korting);
  }
}
