/**
 * Visueel en interactief optellen tot en met 20 (oktober 2026).
 *
 * Eén instelling per sjabloon, "Werking", zoals bij Delen:
 *
 *   typen   de werking van vroeger. Ook wat er staat als de instelling
 *           ontbreekt, zodat er bij geen enkel ander sjabloon iets verandert.
 *   bouwen  het kind bouwt zelf met de tienstrook of de weegschaal. Bij "om en
 *           om" bouwt het bij opgave 1, 3, 5, 7 en 9; opgave 2, 4, 6, 8 en 10
 *           zijn zo'n zelfde som zonder bouwen, en 11 tot en met 15 alleen de
 *           som. Een knop Hulp is er niet.
 *   hulp    niet zelf bouwen, maar na een fout antwoord laat de bouwsteen
 *           rustig zien hoe het wel werkt.
 *
 * Bij "bouwen" krijgt elke opgave ook die hulp na een fout antwoord.
 *
 * "Alleen typen" geldt meteen, ook voor opgaven die er al liggen: het ophalen
 * haalt de bouwstap en de hulp dan weg (`metWerkingVanSjabloon`).
 */

import { tekst, type Instellingen, type Veld } from "@/lib/generatoren/soort";

export type Optelwerking = "typen" | "bouwen" | "hulp";

export function optelwerking(inst: Instellingen): Optelwerking {
  const w = tekst(inst, "werking", "typen");
  return w === "bouwen" || w === "hulp" ? w : "typen";
}

/** Het instelveld; `bouwen` beschrijft wat er bij dit type gebouwd wordt. */
export function werkingVeld(bouwen: string | null, metHulp = true): Veld {
  return {
    soort: "keuze",
    sleutel: "werking",
    label: "Werking",
    opties: [
      { waarde: "typen", label: "Alleen typen (de oude werking)" },
      ...(bouwen ? [{ waarde: "bouwen", label: bouwen }] : []),
      ...(metHulp ? [{ waarde: "hulp", label: "Alleen hulp na een fout antwoord" }] : []),
    ],
    hulp: "Alleen typen geldt meteen, ook voor de opgaven die er al liggen; er hoeft niets opnieuw gemaakt te worden.",
  };
}

/**
 * Vijftien sommen om en om: `bouw` zijn de sommen waarbij het kind zelf bouwt,
 * `gelijk` zo'n zelfde soort som zonder bouwen, `rest` de laatste vijf. Komt
 * terug in de volgorde van de oefening, met per som of er gebouwd wordt.
 */
export function omEnOm<T>(bouw: T[], gelijk: T[], rest: T[]): { som: T; bouwen: boolean }[] {
  const uit: { som: T; bouwen: boolean }[] = [];
  const n = Math.max(bouw.length, gelijk.length);
  for (let i = 0; i < n; i++) {
    if (i < bouw.length) uit.push({ som: bouw[i], bouwen: true });
    if (i < gelijk.length) uit.push({ som: gelijk[i], bouwen: false });
  }
  for (const som of rest) uit.push({ som, bouwen: false });
  return uit;
}

/** Een lijst gelijkmatig uitdunnen tot `n` stuks, van klein naar groot. */
export function verspreid<T>(lijst: T[], n: number): T[] {
  if (lijst.length <= n) return [...lijst];
  return Array.from({ length: n }, (_, i) => lijst[Math.round((i * (lijst.length - 1)) / Math.max(1, n - 1))]);
}
