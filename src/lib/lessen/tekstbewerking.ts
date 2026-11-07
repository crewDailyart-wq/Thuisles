/** Toon bij het bewerken gewone tekst, zonder interne kleur- of nadrukcodes. */
export function leesbareLesTekst(tekst: string): string {
  return tekst.replace(/\{(\d+):[a-z]+\}/g, "$1").replace(/\[\[[bgrum]:([^\]]+)\]\]/g, "$1").replace(/[{}*]/g, "");
}

/** Bewaar de bestaande nadruk op getallen en woorden wanneer ze in de nieuwe tekst staan. */
export function metBestaandeOpmaak(tekst: string, bron: string): string {
  const opmaak = new Map<string, string>();
  for (const deel of bron.match(/\{\d+(?::[a-z]+)?\}|\[\[[bgrum]:[^\]]+\]\]|\*[^*]+\*/g) ?? []) {
    const leesbaar = leesbareLesTekst(deel);
    if (leesbaar) opmaak.set(leesbaar, deel);
  }
  if (!opmaak.size) return tekst;
  const zoek = [...opmaak.keys()].sort((a, b) => b.length - a.length).map((deel) => deel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return tekst.replace(new RegExp(`(?<![\\p{L}\\p{N}])(?:${zoek})(?![\\p{L}\\p{N}])`, "gu"), (deel) => opmaak.get(deel) ?? deel);
}
