/**
 * npm run voorwerpen — houdt de vaste plaatjes bij (zie WISSELEN.md).
 *
 *  1. controleert de lijst (src/lib/voorwerpen): geldige namen, geen dubbele,
 *     elk voorwerp dat een les noemt staat in de lijst;
 *  2. maakt een tijdelijk plaatje (placeholder) in public/voorwerpen/ voor
 *     elk voorwerp dat nog geen eigen plaatje van Sara heeft;
 *  3. schrijft MAGNIFIC-PROMPTS.md en PLAATJES-STAND.md opnieuw.
 *
 * Een eigen plaatje (bron "eigen" in status.json) wordt nooit overschreven.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { squlaLessen, voorwerpenLijst } from "./voorwerpen/lessen.mjs";
import { prompt, placeholderSvg, STIJL, STIJL_DIER } from "./voorwerpen/stijl.mjs";

const { VOORWERPEN, GROEPEN } = await voorwerpenLijst();
const STATUS = "src/lib/voorwerpen/status.json";
const status = JSON.parse(readFileSync(STATUS, "utf8"));
const fouten = [];

/* 1. controle */
const namen = new Map();
for (const v of VOORWERPEN) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.naam)) fouten.push(`ongeldige naam "${v.naam}"`);
  if (namen.has(v.naam)) fouten.push(`"${v.naam}" staat twee keer in de lijst`);
  namen.set(v.naam, v);
  if (!GROEPEN.some((g) => g.sleutel === v.groep)) fouten.push(`"${v.naam}": onbekende groep ${v.groep}`);
  if (!v.schets?.trim() || !v.onderwerp?.trim() || !v.titel?.trim()) fouten.push(`"${v.naam}": titel, onderwerp of schets ontbreekt`);
  if (/\b(eyes?|face|smil)/i.test(v.onderwerp) && !v.dier) fouten.push(`"${v.naam}": geen gezicht of ogen in het onderwerp`);
  if (/\b(people|person|child|kid|boy|girl|man|woman|hand)s?\b/i.test(v.onderwerp)) fouten.push(`"${v.naam}": geen mensen in het onderwerp`);
}
const lessenVan = new Map();
const LESSEN = await squlaLessen();
for (const les of LESSEN) {
  for (const n of les.voorwerpen ?? []) {
    if (!namen.has(n)) fouten.push(`les ${les.id} gebruikt "${n}", maar dat staat niet in de lijst`);
    if (!lessenVan.has(n)) lessenVan.set(n, []);
    lessenVan.get(n).push(les);
  }
}
if (fouten.length) {
  console.error("Voorwerpen kloppen niet:\n- " + fouten.join("\n- "));
  process.exit(1);
}

/* 2. placeholders */
let gemaakt = 0;
for (const v of VOORWERPEN) {
  const s = status[v.naam];
  if (s?.bron === "eigen") continue;
  const svg = placeholderSvg(v);
  const h = createHash("sha1").update(svg).digest("hex").slice(0, 10);
  const pad = `public/voorwerpen/${v.naam}.png`;
  if (s?.h === h && existsSync(pad)) continue;
  await sharp(Buffer.from(svg)).png({ palette: true, compressionLevel: 9 }).toFile(pad);
  status[v.naam] = { bron: "placeholder", v: (s?.v ?? 0) + 1, h };
  gemaakt++;
}
for (const n of Object.keys(status)) if (!namen.has(n)) console.warn(`let op: ${n} staat in status.json maar niet meer in de lijst`);
writeFileSync(STATUS, JSON.stringify(Object.fromEntries(Object.entries(status).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");

/* 3. MAGNIFIC-PROMPTS.md en PLAATJES-STAND.md */
const volgorde = GROEPEN.flatMap((g) => VOORWERPEN.filter((v) => v.groep === g.sleutel).sort((a, b) => a.titel.localeCompare(b.titel, "nl")));
const nummer = new Map(volgorde.map((v, i) => [v.naam, i + 1]));
const lesTekst = (n) => (lessenVan.get(n) ?? []).map((l) => `${l.titel} (\`${l.id}\`)`).join(", ") || "_nog in geen enkele les_";
const klaar = (n) => status[n]?.bron === "eigen";

let md = `# Magnific-prompts

Alle plaatjes die de lessen gebruiken. Dit bestand wordt gemaakt door \`npm run voorwerpen\`: niet met de hand aanpassen.

**Instellingen voor elke generatie (vast):** Google Nano Banana 2, resolutie **1K**, formaat **16:9**. Elke prompt eindigt met dezelfde stijlzin:

> ${STIJL}

Bij een dier (zo min mogelijk dieren):

> ${STIJL_DIER}

- ✅ gegenereerd = het plaatje uit Magnific staat in de les. ⬜ nog niet = er staat nog een tijdelijk plaatje.
- Zelf maken kan ook: zet het plaatje in \`plaatjes-inbox/\` en zeg "verwerk de inbox" (zie WISSELEN.md).
- De nummers kunnen opschuiven als er plaatjes bij komen.

Gegenereerd: ${volgorde.filter((v) => klaar(v.naam)).length} van ${volgorde.length}.
`;
for (const g of GROEPEN) {
  const in_ = volgorde.filter((v) => v.groep === g.sleutel);
  if (!in_.length) continue;
  md += `\n## ${g.titel}\n`;
  for (const v of in_) {
    md += `\n### ${nummer.get(v.naam)}. ${v.titel} — \`${v.naam}.png\` — ${klaar(v.naam) ? "✅ gegenereerd" : "⬜ nog niet"}\n\nLessen: ${lesTekst(v.naam)}\n\n\`\`\`\n${prompt(v)}\n\`\`\`\n`;
  }
}
writeFileSync("MAGNIFIC-PROMPTS.md", md);

const open = volgorde.filter((v) => !klaar(v.naam));
const af = volgorde.filter((v) => klaar(v.naam));
writeFileSync(
  "PLAATJES-STAND.md",
  `# Stand van de plaatjes

Gemaakt door \`npm run voorwerpen\`. ${af.length} vervangen, ${open.length} nog open.

## Vervangen (${af.length})
${af.map((v) => `- ✅ ${nummer.get(v.naam)}. ${v.titel} — \`${v.naam}.png\` (versie ${status[v.naam].v})`).join("\n") || "_nog niets_"}

## Nog open (${open.length})
${open.map((v) => `- ⬜ ${nummer.get(v.naam)}. ${v.titel} — \`${v.naam}.png\``).join("\n") || "_niets meer: alles is vervangen_"}
`,
);
console.log(`Voorwerpen: ${volgorde.length} in de lijst, ${af.length} eigen plaatjes, ${open.length} tijdelijk; ${gemaakt} tijdelijke plaatjes (opnieuw) gemaakt.`);
process.exit(0);
