import { metBestaandeOpmaak } from "@/lib/lessen/tekstbewerking";

/** Houd ook twee gelijke getallen met verschillende kleuren in hun oorspronkelijke volgorde. */
export function voorstelMetOpmaak(tekst: string, bron: string): string {
  const kleuren = new Map<string, string[]>();
  for (const match of bron.matchAll(/\{(\d+)(?::([a-z]+))?\}/g)) {
    kleuren.set(match[1], [...(kleuren.get(match[1]) ?? []), match[0]]);
  }
  const gebruikt = new Map<string, number>();
  const woorden = metBestaandeOpmaak(tekst, bron.replace(/\{\d+(?::[a-z]+)?\}/g, ""));
  return woorden.replace(/\[\[[bgrum]:[^\]]+\]\]|\{[^{}]+\}|(?<![\p{L}\p{N}])\d+(?![\p{L}\p{N}])/gu, (getal) => {
    if (!/^\d+$/.test(getal)) return getal;
    const reeks = kleuren.get(getal);
    if (!reeks?.length) return `{${getal}:wit}`;
    const i = gebruikt.get(getal) ?? 0;
    gebruikt.set(getal, i + 1);
    return reeks[Math.min(i, reeks.length - 1)];
  });
}
