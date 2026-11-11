/**
 * Maakt FOUTTABEL-squla-rekentaal-gouden.md uit de code (squla-rekentaal-gouden-zinnen.ts), zodat de tabel altijd klopt
 * met de les, en doet de REKEN-, VERKLAP-, WAARHEIDS- en HERHAALCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17;
 * LESRECEPT "geleerd bij Tellen", "de keuring Huisnummers", "Geld", "Dagen", "de keuring Dagen" en "Tijd").
 *   npx tsx scripts/fouttabel-rekentaal-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Inhoudscontrole: dezelfde 16 vragen als squla-rekentaal (voorwerpen, maten, ids, vraagzinnen, goede antwoorden); het
 * goede antwoord is echt het enige goede (14.30), uitgerekend uit de maten.
 * Verklapcontrole: per vraag en per fout antwoord: de eerste zin en de hint noemen het goede voorwerp niet, na de eerste
 * zin blijft het goede antwoord over (en minstens 2 keuzes als er 3 zijn), geen "tussen … en …", het rondje staat nooit om
 * het antwoord, de zin bij de 2e fout is geen opdracht, de hint eindigt met de vraag (of de opdracht).
 * Waarheidscontrole: elke bewering in de eerste zin, de hint, de uitleg en de "weer"-zin wordt nagelopen tegen DEZE vraag
 * en dit antwoord. Een zin die het script niet kent, telt als fout.
 * Herhaalcontrole (keuring Dagen, les Tijd): in 1 reactie bij een fout (eerste zin + hint, of eerste/weer + uitleg) komt
 * geen woord 2 keer voor, behalve kleine woordjes en de woorden van de vraag zelf; geen getal 2 keer; niet 2 keer dezelfde
 * naam achter elkaar. Ook: paren foute antwoorden per vraag, kale cijfers (14.20), lengte (15.30), versies per hint (5.10).
 */
import { writeFileSync } from "node:fs";
import { DENKFOUTEN, DENKFOUT_UITLEG, VRAGEN, ZIN, foutenVan, meervoud, naamVan, rekenReactie, volgordes, ditDing, type Fout, type Vraag } from "../src/components/les/lessen/squla-rekentaal-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const fouten: string[] = [];

/* 1. Inhoud (11.9, 14.30): de 16 vragen van squla-rekentaal (squla-rekentaal.tsx, vragenKeuken en vragenPicknick). */
type Oud = { vraag: string; indeling: string; ondergrond: string; zwaar?: string; dingen: string; goed: string };
const OUD: Oud[] = [
  { vraag: "Welke pannenkoek is groter? Tik erop.", indeling: "rij", ondergrond: "tafel", dingen: "k pannenkoek de kleine pannenkoek m0.6|g pannenkoek de grote pannenkoek m0.95", goed: "g" },
  { vraag: "Welke beker is kleiner?", indeling: "rij", ondergrond: "tafel", dingen: "g beker de grote beker m1.05|k beker de kleine beker m0.65", goed: "k" },
  { vraag: "Welk glas is vol?", indeling: "rij", ondergrond: "tafel", dingen: "leeg glas het lege glas v0|vol glas het volle glas v1", goed: "vol" },
  { vraag: "Welk glas is leeg?", indeling: "rij", ondergrond: "tafel", dingen: "vol glas het volle glas v1|leeg glas het lege glas v0", goed: "leeg" },
  { vraag: "Kijk naar de weegschaal. Wat is zwaarder?", indeling: "weegschaal", ondergrond: "tafel", zwaar: "meloen", dingen: "appel appel de appel|meloen meloen de meloen m0.8", goed: "meloen" },
  { vraag: "Kijk naar de weegschaal. Wat is lichter?", indeling: "weegschaal", ondergrond: "tafel", zwaar: "zak", dingen: "zak zak de zak meel m0.8|aardbei aardbei de aardbei", goed: "aardbei" },
  { vraag: "Kijk naar de slierten spaghetti. Welke sliert is langer?", indeling: "onder", ondergrond: "tafel", dingen: "kort sliert de korte sliert l330|lang sliert de lange sliert l640", goed: "lang" },
  { vraag: "Welke sliert is korter?", indeling: "onder", ondergrond: "tafel", dingen: "lang sliert de lange sliert l600|kort sliert de korte sliert l400", goed: "kort" },
  { vraag: "Welke mand is het grootst?", indeling: "rij", ondergrond: "kleed", dingen: "m mand de middelste mand m0.85|g mand de grootste mand m1.12|k mand de kleinste mand m0.6", goed: "g" },
  { vraag: "Welk glas is half vol?", indeling: "rij", ondergrond: "kleed", dingen: "vol glas het volle glas v1|leeg glas het lege glas v0|half glas het halfvolle glas v0.5", goed: "half" },
  { vraag: "Welke appel is het kleinst?", indeling: "rij", ondergrond: "kleed", dingen: "g appel de grootste appel m1.35|k appel de kleinste appel m0.7|m appel de middelste appel m1", goed: "k" },
  { vraag: "Welk broodje is het langst?", indeling: "onder", ondergrond: "kleed", dingen: "k broodje het kortste broodje l300|l broodje het langste broodje l640|m broodje het middelste broodje l470", goed: "l" },
  { vraag: "Kijk naar de weegschaal. Wat is zwaarder?", indeling: "weegschaal", ondergrond: "kleed", zwaar: "meloen", dingen: "mand mand de lege mand m0.8|meloen meloen de meloen m0.6", goed: "meloen" },
  { vraag: "Welk broodje is het kortst?", indeling: "onder", ondergrond: "kleed", dingen: "m broodje het middelste broodje l450|l broodje het langste broodje l620|k broodje het kortste broodje l270", goed: "k" },
  { vraag: "Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste.", indeling: "volgorde", ondergrond: "kleed", dingen: "m appel de middelste appel m0.95|g appel de grootste appel m1.3|k appel de kleinste appel m0.6", goed: "k,m,g" },
  { vraag: "Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste.", indeling: "volgorde", ondergrond: "kleed", dingen: "g beker de grootste beker m0.95|k beker de kleinste beker m0.45|m beker de middelste beker m0.7", goed: "k,m,g" },
];
const dingTekst = (v: Vraag) => v.dingen.map((d) => `${d.id} ${d.soort} ${d.naam}${d.maat !== undefined ? ` m${d.maat}` : ""}${d.vul !== undefined ? ` v${d.vul}` : ""}${d.lengte !== undefined ? ` l${d.lengte}` : ""}`).join("|");
if (VRAGEN.length !== OUD.length) fouten.push(`${VRAGEN.length} vragen in plaats van ${OUD.length} (squla-rekentaal)`);

/** Hoe groot iets is in de vraag (zelfde soort voorwerpen): lengte, of de maat. */
const maat = (v: Vraag, id: string) => {
  const d = v.dingen.find((q) => q.id === id)!;
  return d.lengte ?? d.maat ?? 1;
};
const vul = (v: Vraag, id: string) => v.dingen.find((q) => q.id === id)!.vul ?? -1;
/** Het echte goede antwoord, uitgerekend uit de maten (niet uit de les). */
function echtGoed(v: Vraag): string {
  const ids = v.dingen.map((d) => d.id);
  const op = [...ids].sort((a, b) => maat(v, a) - maat(v, b));
  if (v.soort === "volgorde") return op.join(",");
  if (v.soort === "weeg") return v.woord === "zwaarder" ? v.zwaar! : ids.find((i) => i !== v.zwaar)!;
  if (v.woord === "vol") return ids.find((i) => vul(v, i) === 1)!;
  if (v.woord === "leeg") return ids.find((i) => vul(v, i) === 0)!;
  if (v.woord === "half vol") return ids.find((i) => vul(v, i) === 0.5)!;
  if (/groter|grootst|langer|langst/.test(v.woord)) return op.at(-1)!;
  return op[0];
}
VRAGEN.forEach((v, i) => {
  const o = OUD[i];
  if (!o) return;
  if (v.vraag.join(" ") !== o.vraag) fouten.push(`${v.id}: andere vraagzin dan de oude les ("${v.vraag.join(" ")}")`);
  if (v.indeling !== o.indeling || v.ondergrond !== o.ondergrond || (v.zwaar ?? "") !== (o.zwaar ?? "")) fouten.push(`${v.id}: ander beeld dan de oude les`);
  if (dingTekst(v) !== o.dingen) fouten.push(`${v.id}: andere voorwerpen dan de oude les (${dingTekst(v)})`);
  if (v.goed !== o.goed) fouten.push(`${v.id}: ander goed antwoord dan de oude les`);
  if (echtGoed(v) !== v.goed) fouten.push(`${v.id}: het goede antwoord klopt niet met de maten (${echtGoed(v)})`);
  /* Precies 1 goed antwoord (14.30): geen 2 voorwerpen even groot of even lang. */
  const m = v.dingen.map((d) => `${d.lengte ?? d.maat ?? 1}-${d.vul ?? ""}`);
  if (v.soort !== "weeg" && new Set(m).size !== m.length) fouten.push(`${v.id}: 2 voorwerpen zijn even groot`);
  if (new Set(v.dingen.map((d) => d.naam)).size !== v.dingen.length) fouten.push(`${v.id}: 2 voorwerpen met dezelfde naam`);
});

/* 2. Waarheidscontrole: wat een zin beweert, klopt voor deze vraag en dit antwoord. */
const isMax = (v: Vraag, id: string) => v.dingen.every((d) => d.id === id || maat(v, d.id) < maat(v, id));
const isMin = (v: Vraag, id: string) => v.dingen.every((d) => d.id === id || maat(v, d.id) > maat(v, id));
const ander = (v: Vraag, id: string) => v.dingen.find((d) => d.id !== id)!.id;
const vraagZin = (v: Vraag) => v.vraag.find((z) => z.endsWith("?")) ?? "";
function bekend(v: Vraag, x: string, z: string): string | null {
  let m: RegExpMatchArray | null;
  const xs = x.split(",");
  const kies = v.soort !== "volgorde";
  /* Wat het kind koos. */
  if ((m = z.match(/^(?:Je koos|Nu koos je)(?: weer)? (deze|dit) (\w+)\.$/))) return kies && v.soort !== "weeg" && m[2] === v.ding && (m[1] === "dit") === v.het ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(?:Je koos|Nu koos je)(?: weer)? (de [\w ]+)\.$/))) return v.soort === "weeg" && naamVan(v, x) === m[1] ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je begon met (deze|dit) (\w+)\.$/))) return !kies && m[2] === v.ding ? null : "past niet";
  /* Twee voorwerpen. */
  if (z === "Hij is kleiner dan de andere.") return v.soort === "twee" && maat(v, x) < maat(v, ander(v, x)) && v.ding !== "sliert" ? null : "is niet kleiner";
  if (z === "Hij is hoger en breder dan de andere.") return v.soort === "twee" && maat(v, x) > maat(v, ander(v, x)) && v.ding === "beker" ? null : "is niet hoger en breder";
  if (z === "Het is leeg." || z === "Daar zit niets in.") return vul(v, x) === 0 ? null : "is niet leeg";
  if (z === "Het is vol." || z === "Dat is helemaal vol.") return vul(v, x) === 1 ? null : "is niet vol";
  if (z === "Die hangt hoger.") return v.soort === "weeg" && x !== v.zwaar ? null : "hangt niet hoger";
  if (z === "Die hangt lager.") return v.soort === "weeg" && x === v.zwaar ? null : "hangt niet lager";
  if (z === "Die is groot, maar hangt hoger.") return v.soort === "weeg" && x !== v.zwaar && v.dingen.find((d) => d.id === x)!.soort === "mand" ? null : "klopt niet";
  if (z === "Die stopt eerder.") return v.ding === "sliert" && maat(v, x) < maat(v, ander(v, x)) ? null : "stopt niet eerder";
  if (z === "Die loopt verder door.") return v.ding === "sliert" && maat(v, x) > maat(v, ander(v, x)) ? null : "loopt niet verder";
  /* Drie voorwerpen. */
  if (/^(Die|Dat) is niet (de|het) (grootste|kleinste|langste|kortste)\.$/.test(z)) {
    const w = z.match(/(grootste|kleinste|langste|kortste)/)![1];
    const groot = w === "grootste" || w === "langste";
    return v.soort === "drie" && !(groot ? isMax(v, x) : isMin(v, x)) && (w.startsWith("lang") || w.startsWith("kort")) === (v.ding === "broodje") ? null : "klopt niet";
  }
  if (/^Dat is (de|het) (grootste|kleinste|langste|kortste)\.$/.test(z)) {
    const w = z.match(/(grootste|kleinste|langste|kortste)/)![1];
    const groot = w === "grootste" || w === "langste";
    return v.soort === "drie" && (groot ? isMax(v, x) : isMin(v, x)) && (w.startsWith("lang") || w.startsWith("kort")) === (v.ding === "broodje") ? null : "klopt niet";
  }
  /* Op volgorde. */
  if (z === "Je zette ze van groot naar klein.") return !kies && xs.every((id, i) => i === 0 || maat(v, xs[i - 1]) > maat(v, id)) ? null : "niet van groot naar klein";
  if (z === "Er ligt nog een kleinere.") return !kies && !isMin(v, xs[0]) ? null : "er is geen kleinere";
  if (z === "Je zette de grootste in het midden.") return !kies && isMax(v, xs[1]) ? null : "de grootste staat niet in het midden";
  if (z === "Weer stond de kleinste niet vooraan.") return !kies && !isMin(v, xs[0]) ? null : "de kleinste stond wel vooraan";
  if (z === "Je zette ze weer in dezelfde volgorde.") return !kies ? null : "past niet";
  /* Hints: hoe je kijkt (passend bij het beeld van deze vraag). */
  if (z === vraagZin(v)) return null;
  if ((m = z.match(/^Zet de (\w+) van klein naar groot\.$/))) return !kies && m[1] === meervoud(v) ? null : "past niet";
  if (z === "Ze beginnen bij dezelfde streep.") return v.indeling === "onder" ? null : "geen streep";
  if (/^Kijk waar (elke sliert ophoudt|ze allemaal stoppen)\.$/.test(z) || z === "Kijk welke sliert als eerste ophoudt.") return v.indeling === "onder" && (!z.includes("sliert") || v.ding === "sliert") ? null : "past niet";
  if (/^(Kijk van rand tot rand hoe breed ze zijn|Vergelijk hoe breed ze zijn)\.$/.test(z)) return v.ding === "pannenkoek" ? null : "past niet";
  if (/^(Kijk hoe hoog en hoe breed ze zijn|Vergelijk ze naast elkaar|Vergelijk ze allemaal met elkaar)\.$/.test(z)) return v.indeling === "rij" && ["beker", "mand", "appel"].includes(v.ding) ? null : "past niet";
  if (/^(Kijk hoe hoog het sap komt|Zoek sap tot aan de rand|Kijk waar geen sap in zit|Zoek waar niets in zit|Kijk tot waar het sap komt|Zoek sap tot de helft)\.$/.test(z)) return v.ding === "glas" ? null : "geen glazen";
  if (/^(Iets zwaars trekt de weegschaal omlaag|Kijk welke kant van de weegschaal zakt|Iets lichts gaat omhoog op de weegschaal|Kijk welke kant van de weegschaal omhoog gaat|Iets groots is niet altijd zwaar)\.$/.test(z)) return v.soort === "weeg" ? null : "geen weegschaal";
  if (/^(Kijk welke het kleinst is|Begin met de kleinste en pak dan steeds een grotere)\.$/.test(z)) return !kies ? null : "past niet";
  /* Uitleg bij de 2e fout (daarna doet Bliepo het samen voor). */
  const uitleg: [RegExp, (v: Vraag) => boolean][] = [
    [/^Groter betekent hier: hij is breder\.$/, (q) => q.woord === "groter" && q.ding === "pannenkoek"],
    [/^Kleiner betekent: lager en smaller\.$/, (q) => q.woord === "kleiner" && q.ding === "beker"],
    [/^Vol betekent: het sap komt tot de rand\.$/, (q) => q.woord === "vol"],
    [/^Leeg betekent: er zit niets in\.$/, (q) => q.woord === "leeg"],
    [/^Wat zwaarder is, zakt naar beneden\.$/, (q) => q.soort === "weeg" && q.woord === "zwaarder"],
    [/^De zware kant van de weegschaal zakt naar beneden\.$/, (q) => q.soort === "weeg" && q.woord === "zwaarder"],
    [/^Wat lichter is, gaat omhoog\.$/, (q) => q.soort === "weeg" && q.woord === "lichter"],
    [/^Langer betekent: hij loopt verder door\.$/, (q) => q.woord === "langer"],
    [/^Korter betekent: hij stopt eerder\.$/, (q) => q.woord === "korter"],
    [/^Een andere mand is nog groter\.$/, (q) => q.nr === 9 && !isMax(q, x) && !isMin(q, x)],
    [/^Een andere appel is nog kleiner\.$/, (q) => q.nr === 11 && !isMax(q, x) && !isMin(q, x)],
    [/^Een ander broodje loopt nog verder door\.$/, (q) => q.nr === 12 && !isMax(q, x) && !isMin(q, x)],
    [/^Een ander broodje stopt nog eerder\.$/, (q) => q.nr === 14 && !isMax(q, x) && !isMin(q, x)],
    [/^Het grootst betekent: groter dan alle andere\.$/, (q) => q.woord === "het grootst"],
    [/^Het kleinst betekent: kleiner dan alle andere\.$/, (q) => q.woord === "het kleinst"],
    [/^Het langst betekent: langer dan alle andere\.$/, (q) => q.woord === "het langst"],
    [/^Het kortst betekent: korter dan alle andere\.$/, (q) => q.woord === "het kortst"],
    [/^Half vol is niet tot de rand, maar tot de helft\.$/, (q) => q.woord === "half vol" && vul(q, x) === 1],
    [/^Bij half vol komt het sap tot de helft\.$/, (q) => q.woord === "half vol"],
    [/^Van klein naar groot: de kleinste staat vooraan\.$/, (q) => q.soort === "volgorde"],
    [/^De kleinste hoort vooraan\.$/, (q) => q.soort === "volgorde" && !isMin(q, xs[0])],
    [/^Van klein naar groot: je begint links\.$/, (q) => q.soort === "volgorde"],
    [/^Na de kleinste komt eerst de middelste\.$/, (q) => q.soort === "volgorde" && isMin(q, xs[0]) && isMax(q, xs[1])],
  ];
  for (const [re, ok] of uitleg) if (re.test(z)) return ok(v) ? null : "uitleg past niet";
  return `onbekende zin (niet na te lopen): "${z}"`;
}

/* 3. Herhaalcontrole: geen woord 2 keer in 1 reactie (behalve kleine woordjes en de woorden van de vraag). */
const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar zit al bij hoe waar welke welk".split(" "));
const woordenVan = (t: string) => kaal(t).toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter(Boolean);
function dubbel(v: Vraag, delen: string[]): string | null {
  const vraagWoorden = new Set(woordenVan(v.vraag.join(" ")));
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenVan)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) {
    if (n < 2) continue;
    if (/^\d+$/.test(w)) return `getal ${w} 2 keer`;
    if (KLEIN.has(w) || vraagWoorden.has(w)) continue;
    return `"${w}" ${n} keer`;
  }
  /* Niet 2 keer dezelfde naam achter elkaar ("Je koos zondag. Zondag …"). */
  const zinnen = delen.flatMap(zinnenVan);
  for (let i = 1; i < zinnen.length; i++) {
    const a = woordenVan(zinnen[i - 1]).at(-1);
    const b = woordenVan(zinnen[i])[0];
    if (a && b && a === b && !KLEIN.has(a)) return `"${a}" 2 keer achter elkaar`;
  }
  return null;
}

const verklap = (v: Vraag, x: string, f: Fout): string | null => {
  if (!f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (/tussen .* en /i.test(kaal(`${f.eerste} ${f.hint}`))) return '"tussen … en …" in eerste zin of hint';
  if (v.soort !== "volgorde") {
    /* Het goede voorwerp niet bij naam genoemd in de eerste zin of de hint. */
    if (kaal(`${f.eerste} ${f.hint}`).toLowerCase().includes(naamVan(v, v.goed).toLowerCase())) return `de eerste zin of hint noemt het antwoord (${naamVan(v, v.goed)})`;
    if (f.rondje === v.goed) return "rondje om het antwoord";
    if (f.rondje !== x) return "het rondje staat niet om wat het kind koos";
    if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
    if (f.over.length < Math.min(2, v.dingen.length - 1)) return `na de eerste zin blijft alleen ${f.over.join("")} over`;
    if (!f.hint.trim().endsWith(vraagZin(v))) return `de hint eindigt niet met de vraag: "${f.hint}"`;
  } else {
    const xs = x.split(",");
    const goed = v.goed.split(",");
    if (!f.rondje || xs.indexOf(f.rondje) === goed.indexOf(f.rondje)) return "het rondje staat om iets wat al goed staat";
    if (!/Zet de \w+ van klein naar groot\.$/.test(f.hint.trim())) return `de hint eindigt niet met de opdracht: "${f.hint}"`;
  }
  /* De zin bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of [...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) if (/^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Zeg|Zet|Denk|Begin|Pak|Vergelijk|Leg)\b/.test(z)) return `opdracht in de uitleg bij de 2e fout: "${z}"`;
  for (const z of [...zinnenVan(f.eerste), ...zinnenVan(f.hint), ...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) {
    const r = bekend(v, x, z);
    if (r) return `waarheidscontrole: ${r}`;
  }
  /* Herhaalcontrole per reactie: 1e fout (eerste + hint), 2e fout (eerste of "weer"/"Nu koos je" + uitleg). */
  const nuKoos = f.eerste.replace(/^Je koos /, "Nu koos je ");
  for (const [wat, delen] of [
    ["1e fout", [f.eerste, f.hint]],
    ["2e fout", [f.eerste, f.uitleg]],
    ["2e fout (ander antwoord)", [nuKoos, f.uitleg]],
    ["2e fout (zelfde antwoord)", [ZIN.weerGekozen(v, x), f.uitleg]],
    ...(f.weer.length ? [["2e fout (weer)", f.weer] as [string, string[]]] : []),
  ] as [string, string[]][]) {
    const r = dubbel(v, delen);
    if (r) return `herhaling in 1 reactie (${wat}): ${r} — ${delen.map(kaal).join(" | ")}`;
  }
  return null;
};

let telling = 0;
let beweringen = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = (v.soort === "volgorde" ? volgordes(v) : v.dingen.map((d) => d.id)).filter((k) => k !== v.goed).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    beweringen += zinnenVan(f.eerste).length + zinnenVan(f.hint).length + zinnenVan(f.uitleg).length + f.weer.flatMap(zinnenVan).length;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${a}: geen vaste denkfout (${f.code})`);
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    hintsPerCode.get(f.code)!.add(kaal(f.hint));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* Paren foute antwoorden per vraag (keuring Tellen, Splitsen, Dagen): niet 2 keer dezelfde eerste zin bij 1 vraag,
     behalve bij dezelfde denkfout (dan zegt Bliepo de 2e keer de "weer"-zin). */
  const rijen = Object.values(tabel);
  for (let i = 0; i < rijen.length; i++)
    for (let j = i + 1; j < rijen.length; j++) {
      if (rijen[i].soort === rijen[j].soort && rijen[i].weer.length) continue;
      const a = zinnenVan(rijen[i].eerste).at(-1);
      const b = zinnenVan(rijen[j].eerste).at(-1);
      if (a && b && a === b) fouten.push(`${v.id}: 2 foute antwoorden krijgen dezelfde zin "${a}"`);
    }
}

/* De samen-zinnen: niet 2 keer hetzelfde begin achter elkaar, en het voorwerp waar Bliepo "deze" zegt, bestaat. */
for (const v of VRAGEN) {
  const reeks = [ZIN.samen[0], ...(v.samen.intro ? [v.samen.intro] : []), ...v.samen.stappen.map((s) => s[1]), v.samen.jij, v.samen.klaar];
  for (const [id] of v.samen.stappen) if (!v.dingen.some((d) => d.id === id)) fouten.push(`${v.id}: samen wijst een voorwerp aan dat er niet is (${id})`);
  if (v.soort === "volgorde" && v.samen.stappen.some(([id]) => id === v.goed.split(",").at(-1))) fouten.push(`${v.id}: samen doet de stap die het kind zelf moet doen`);
  for (let i = 1; i < reeks.length; i++) if (woordenVan(reeks[i])[0] === woordenVan(reeks[i - 1])[0] && woordenVan(reeks[i])[0] !== "en") fouten.push(`${v.id}: 2 samen-zinnen achter elkaar met hetzelfde begin: "${reeks[i - 1]}" "${reeks[i]}"`);
  if (!v.samen.jij.includes(v.soort === "volgorde" ? `grootste ${v.ding}` : naamVan(v, v.goed).replace(/^(de|het) /, ""))) fouten.push(`${v.id}: de kleine stap noemt niet het goede voorwerp`);
  if (!/^Ja, /.test(v.samen.klaar) || !/^Kijk, /.test(ZIN.zelf(v.samen.klaar))) fouten.push(`${v.id}: klaar-zin of vangnet-zin klopt niet`);
}

/* Elk getal in een zin van Bliepo heeft een kleur of wit (14.20): geen kaal cijfer. */
const kaalCijfer = (z: string) => /\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""));
const alleZinnen: string[] = [ZIN.start, ...ZIN.picknick, ...ZIN.samen, ZIN.handDing, ZIN.volgVangnet, ZIN.slot, ZIN.kaartTik];
for (const v of VRAGEN) {
  alleZinnen.push(...v.vraag, ...Object.values(foutenVan(v)).flatMap((f) => [f.eerste, f.hint, f.uitleg, ...f.weer]), ...rekenReactie(v).zinnen);
  alleZinnen.push(...(v.samen.intro ? [v.samen.intro] : []), ...v.samen.stappen.map((s) => s[1]), v.samen.jij, v.samen.klaar, ZIN.zelf(v.samen.klaar));
  for (const d of v.dingen) alleZinnen.push(ZIN.weerGekozen(v, d.id), ditDing(v, d.id));
  if (v.soort === "volgorde") alleZinnen.push(ZIN.handVolgorde(v), ZIN.weerGekozen(v, "g,m,k"));
}
for (const z of alleZinnen) if (kaalCijfer(z)) fouten.push(`getal zonder kleur in "${z}" (14.20)`);

/* De reactie na goed klopt met het beeld (11.9). */
for (const v of VRAGEN) {
  if (v.soort === "volgorde") continue;
  for (const z of rekenReactie(v).zinnen) if (/grootst|kleinst|langst|kortst/.test(z) && !z.includes(v.woord) && !/alle andere/.test(z)) fouten.push(`${v.id}: reactie past niet bij de vraag: "${z}"`);
}

/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

/* Lengte: elk stuk past in het vaste tekstvak (15.30; ± 110 tekens is bij de andere gouden lessen het langste dat past). */
for (const z of alleZinnen) if (kaal(z).length > 110) fouten.push(`te lang voor het tekstvak (${kaal(z).length} tekens): "${kaal(z)}"`);

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole, waarheidscontrole en herhaalcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${beweringen} beweringen nagelopen, ${alleZinnen.length} zinnen op kale cijfers en lengte).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 4. De tabel. */
const keuzeNaam = (v: Vraag, x: string) => (v.soort === "volgorde" ? x.split(",").map((id) => naamVan(v, id).replace(/^(de|het) /, "")).join(" → ") : naamVan(v, x));
const vraagNaam = (v: Vraag) => `${v.nr}. ${v.vraag.join(" ")}${v.soort === "volgorde" ? "" : ` (keuzes ${v.dingen.map((d) => d.naam).join(" / ")})`}`;
const rijen = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${keuzeNaam(v, a)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`)).join("\n");
const samenZin = (v: Vraag) =>
  `${v.samen.intro ? `"${v.samen.intro}" ` : ""}${v.samen.stappen.map(([id, z]) => `rondje om ${naamVan(v, id)}: "${z}"`).join(" ")} — ${v.soort === "volgorde" ? "Bliepo zet die op hun plek; " : ""}rondje om ${naamVan(v, v.goed.split(",").at(-1)!)}: "${v.samen.jij}" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "${v.samen.klaar}" (vangnet: "${ZIN.zelf(v.samen.klaar)}")`;
const uitleg = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${keuzeNaam(v, a)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)}${f.weer.length ? ` (zelfde denkfout 2 keer: "${f.weer.join(" ")}")` : ""} + "Kom, we kijken samen." (3 versies) | ${samenZin(v)} |`)).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-rekentaal-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekentaal-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (16 vragen, de voorwerpen, hun maten, de keuzes en de goede antwoorden) is die van squla-rekentaal en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen tutorles over groot en klein, vol en leeg, zwaar en licht of lang en kort (KOPPELING.md §12: alleen het spel Less or More). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: het andere uiterste gekozen (groot en klein, vol en leeg, zwaar en licht, lang en kort verwisseld), het middelste gekozen, het volle of lege glas bij half vol, het grootste ding op de weegschaal, en bij op volgorde: andersom, niet bij de kleinste begonnen, of de grootste in het midden. Bliepo zegt alleen wat waar is over wat het kind koos; hij verzint geen reden.

Getallen: Bliepo's zinnen in deze les hebben geen getallen.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos, met een rood rondje om dat voorwerp zolang hij het noemt. Daarna komt de hint (die eindigt met de vraag), en tegelijk mag het kind opnieuw kiezen (geen 2 keer de vraag). Bij op volgorde gaan alle voorwerpen terug naar boven en is de hint de nieuwe opdracht. Alles gaat vanzelf door (15.27).
- **Vragen met 2 voorwerpen** (vraag 1 t/m 8 en 13): na de 1e fout blijft er altijd maar 1 voorwerp over. Dat komt door de inhoud van Squla (2 keuzes); de eerste zin en de hint zeggen alleen iets over wat het kind koos en hoe je kijkt.
- **Verklappen (15.17):** de eerste zin en de hint noemen het goede voorwerp niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en bij 3 voorwerpen blijven er na de eerste zin altijd 2 over ("Er is nog een grotere" mag dus niet bij het middelste: dan blijft alleen het grootste over). Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **Herhaling (keuring Dagen, les Tijd):** in 1 reactie bij een fout komt geen woord 2 keer voor (behalve kleine woordjes en de woorden van de vraag zelf), en niet 2 keer dezelfde naam achter elkaar. Het script controleert dat voor de 1e fout (eerste zin + hint) en voor de 2e fout (eerste zin, "Nu koos je …" of "Je koos weer …", + uitleg).
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." en dan samen voordoen (laatste kolom): Bliepo wijst de voorwerpen 1 voor 1 aan met het rondje, dan staat het rondje om het goede voorwerp en het kind tikt het (de kleine stap; na ± 6 s stilte het hulphandje; vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf: "Kijk, …", geen "Ja"). Bij op volgorde zet Bliepo de kleinste en de middelste op hun plek en tikt het kind de grootste. Daarna gaat de les door.
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" (bij op volgorde "Je zette ze weer in dezelfde volgorde.") en volgt de uitleg (anders dan de hint van de 1e keer).
- **Dezelfde denkfout 2 keer met een ander antwoord:** kan alleen bij op volgorde (\`niet-bij-kleinste\`): dan zegt Bliepo de "weer"-zin.
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" (keuring Tellen en Splitsen).
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Samen voordoen |
|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekentaal-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekentaal-gouden.md geschreven.");
