/**
 * Welke bekende fout past bij wat het kind gaf?
 *
 * Draait in de browser, direct na Controleer. Kijkt alleen naar het gegeven
 * antwoord en de antwoorden die bij elke bekende fout zijn opgeschreven; zie
 * `Fouttekst.antwoorden`. Past er geen, dan komt de volledige uitleg (tekst 5).
 */

import type { Fouttekst, MaatjeTeksten } from "@/lib/maatje/types";

function schoon(waarde: string): string {
  return waarde
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .replace(/^€\s?/, "")
    .replace(/(\d)\.(\d)/g, "$1,$2");
}

function deelPast(patroon: string, waarde: string): boolean {
  if (patroon === "*") return true;
  /* "~37..45": elk getal van 37 tot en met 45, ook met een komma ertussen (schatten op de getallenlijn). */
  if (patroon.startsWith("~")) {
    const [van, tot] = patroon.slice(1).split("..").map(Number);
    const getal = Number(schoon(waarde).replace(",", "."));
    return waarde.trim() !== "" && Number.isFinite(getal) && getal >= van && getal <= tot;
  }
  if (patroon.startsWith("!")) return schoon(waarde) !== schoon(patroon.slice(1)) && waarde.trim() !== "";
  return schoon(waarde) === schoon(patroon);
}

function past(patroon: string, gegeven: string): boolean {
  if (!patroon.includes(",") || !gegeven.includes(",")) return deelPast(patroon, gegeven);
  const p = patroon.split(",");
  const g = gegeven.split(",");
  return p.length === g.length && p.every((deel, i) => deelPast(deel, g[i]));
}

export function herkenMaatjeFout(teksten: MaatjeTeksten, gegeven: string): Fouttekst | null {
  for (const fout of teksten.fouten.lijst) {
    if (fout.antwoorden.some((a) => past(a, gegeven))) return fout;
  }
  return null;
}
