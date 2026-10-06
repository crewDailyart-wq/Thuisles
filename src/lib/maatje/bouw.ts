/**
 * Gereedschap om de zes teksten van een opgave in elkaar te zetten.
 *
 * Elke schrijver (per domein, in `schrijvers/`) levert de inhoud; dit bestand
 * zorgt dat het overal dezelfde vorm heeft: dezelfde openers, geen dubbele
 * herkenning, en het goede antwoord nooit als "fout".
 */

import { verbeterTaal } from "@/lib/maatje/taal";
import { GEEN_PLAATJE, type Controlegegevens, type Fouttekst, type Geschreven, type MaatjeTeksten, type Zin } from "@/lib/maatje/types";

/** Hoofdstuk 3: een kort compliment op het proberen. */
export const GOED_OPENERS = ["Goed zo!", "Knap gedaan!", "Ja, dat klopt!"];
/** Hoofdstuk 3: troost in één woord of korte zin. */
export const FOUT_OPENERS = ["Bijna!", "Oei, kijk even mee.", "Kijk even mee."];

/** De versie van de schrijvers. Omhoog zodra de teksten anders worden. */
export const MAATJE_VERSIE = 1;

export function zin(tekst: string, stap: string = GEEN_PLAATJE): Zin {
  return { tekst: verbeterTaal(tekst), stap: verbeterTaal(stap) };
}

export type Fout = Fouttekst & { getallen?: number[] };

export type Ontwerp = {
  /** Het goede antwoord zoals de speler het nakijkt (`vraag.antwoord`). */
  antwoord: string;
  voorlezen: string;
  bouw?: Zin | null;
  goed: Zin[];
  fouten: Fout[];
  uitleg: Zin[];
  tip: Zin;
  rondewoord?: "sommen" | "opdrachten";
  opgave: number[];
  tussen?: number[];
  /** Wat vóór Controleer niet genoemd mag worden. */
  geheim: number[];
};

function schoon(w: string): string {
  return w.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Van ontwerp naar opgeslagen teksten.
 *
 * Een antwoord dat bij twee fouten past, hoort bij de eerste: de volgorde in
 * het ontwerp is de voorrang. Een fout die zo geen eigen antwoord meer
 * overhoudt, valt weg — die kan bij deze som niet voorkomen. Het goede
 * antwoord zelf kan nooit een fout zijn.
 */
export function maak(o: Ontwerp): Geschreven {
  const goedeAntwoorden = new Set(o.antwoord.split("|").map(schoon));
  const gezien = new Set<string>();
  const lijst: Fouttekst[] = [];
  const perFout: Record<string, number[]> = {};

  for (const f of o.fouten) {
    const eigen = f.antwoorden.filter((a) => {
      const s = schoon(a);
      if (s === "" || goedeAntwoorden.has(s) || gezien.has(s)) return false;
      if (!s.includes("*") && !s.includes("!") && !s.startsWith("~") && /^-/.test(s)) return false;
      gezien.add(s);
      return true;
    });
    if (eigen.length === 0) continue;
    if (lijst.some((x) => x.code === f.code)) continue;
    lijst.push({ code: f.code, antwoorden: eigen, zinnen: f.zinnen });
    perFout[f.code] = [
      ...(f.getallen ?? []),
      /* "Je zit er 1 naast", "Je zit er 10 naast": dat verschil rekent Thuisles uit. */
      ...(f.code.includes("een-ernaast") ? [1] : []),
      ...(/tien|tiental/.test(f.code) ? [10] : []),
      ...eigen.filter((a) => !a.startsWith("~")).flatMap((a) => (a.match(/\d+/g) ?? []).map(Number)),
    ];
  }

  const antwoordGetallen = (o.antwoord.split("|")[0].match(/\d+/g) ?? []).map(Number);

  const teksten: MaatjeTeksten = {
    versie: MAATJE_VERSIE,
    voor: o.antwoord,
    voorlezen: zin(o.voorlezen),
    bouw: o.bouw ?? null,
    goed: { openers: GOED_OPENERS, zinnen: o.goed },
    fouten: { openers: FOUT_OPENERS, lijst },
    uitleg: o.uitleg,
    tip: o.tip,
    rondewoord: o.rondewoord ?? "sommen",
  };

  const controle: Controlegegevens = {
    opgave: o.opgave,
    tussen: o.tussen ?? [],
    antwoord: [...new Set([...o.geheim])],
    perFout,
    bekend: lijst.map((f) => f.code),
  };
  /* Het goede antwoord mag na Controleer altijd genoemd worden. */
  controle.tussen.push(...antwoordGetallen);

  return { teksten, controle };
}
