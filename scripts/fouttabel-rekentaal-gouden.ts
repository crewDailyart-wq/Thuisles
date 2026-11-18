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
 *
 * Sinds 18 november 2026 (Bliepo als warme juf, zoals Tellen en Vormen) keurt het script ELKE variant van elk rijtje, en
 * elke combinatie die de les kan kiezen (eerste zin + hint + de vraag opnieuw; eerste zin + uitleg):
 *   - elke zin moet het script kennen en waar zijn voor deze vraag en dit antwoord;
 *   - niets verklapt (15.17), na elke hint een vraag of opdracht (15.37, F16), geen opdracht bij de 2e keer;
 *   - nooit het woord "fout" of "vinkje" (dan laat het lesscherm de hele zin weg), geen kaal cijfer, alles past in het
 *     tekstvak; achter elke eerste zin passen minstens 2 hints, 2 vragen en 2 uitleggen (anders toch 2 keer dezelfde);
 *   - nooit 2 keer hetzelfde: de kiezer wordt 20.000 keer nagespeeld met dezelfde functie als de les (foutReactie).
 */
import { writeFileSync } from "node:fs";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import {
  AANMOEDIG_DOEN,
  DENKFOUTEN,
  DENKFOUT_UITLEG,
  MAX_STUK,
  VRAGEN,
  WISSELWOORDEN,
  ZIN,
  alleVraagZinnen,
  dubbelIn,
  foutReactie,
  foutenVan,
  kaal,
  lengte,
  meervoud,
  naamVan,
  nuKoos,
  opnieuwVan,
  passend,
  rekenReactie,
  vraagZin,
  volgordes,
  zonderDubbel,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-rekentaal-gouden-zinnen";

const vorm = maakVorm(WISSELWOORDEN);
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

/* 2. Waarheidscontrole: wat een zin beweert, klopt voor deze vraag en dit antwoord. Een zin die het script niet kent, is fout. */
const isMax = (v: Vraag, id: string) => v.dingen.every((d) => d.id === id || maat(v, d.id) < maat(v, id));
const isMin = (v: Vraag, id: string) => v.dingen.every((d) => d.id === id || maat(v, d.id) > maat(v, id));
const ander = (v: Vraag, id: string) => v.dingen.find((d) => d.id !== id)!.id;
const groteKant = (v: Vraag) => /groter|grootst|langer|langst/.test(v.woord);
function bekend(v: Vraag, x: string, z: string): string | null {
  let m: RegExpMatchArray | null;
  const xs = x.split(",");
  const kies = v.soort !== "volgorde";
  const lijnig = v.ding === "sliert" || v.ding === "broodje";
  /* Wat het kind koos (1 keer genoemd). */
  if ((m = z.match(/^(?:Je koos(?: weer)?|Nu koos je|Je tikte(?: weer)? op|Nu tikte je op|Weer) (deze|dit) (\w+)(?:, zie ik)?\.$/))) return kies && v.soort !== "weeg" && m[2] === v.ding && (m[1] === "dit") === v.het ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(Deze|Dit) (\w+)\?$/))) return kies && v.soort !== "weeg" && m[2] === v.ding && (m[1] === "Dit") === v.het ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(?:Je koos(?: weer)?|Nu koos je|Je tikte(?: weer)? op|Nu tikte je op|Weer) ((?:de|het) [\w ]+?)(?:, zie ik)?\.$/))) return kies && naamVan(v, x) === m[1] ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^((?:De|Het) [\w ]+)\?$/))) return v.soort === "weeg" && naamVan(v, x).toLowerCase() === m[1].toLowerCase() ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(?:Je begon met|Nu begon je met|Je zette eerst|Nu zette je eerst) (deze|dit) (\w+)\.$/)) || (m = z.match(/^(Deze|Dit) (\w+) eerst\?$/))) return !kies && m[2] === v.ding ? null : "past niet";
  /* Twee voorwerpen. */
  if (/^(Hij|Die) is kleiner dan de andere\.$/.test(z)) return v.soort === "twee" && !lijnig && maat(v, x) < maat(v, ander(v, x)) ? null : "is niet kleiner";
  if (/^(Hij|Die) is groter dan de andere\.$/.test(z)) return v.soort === "twee" && !lijnig && maat(v, x) > maat(v, ander(v, x)) ? null : "is niet groter";
  if (z === "Hij is hoger en breder dan de andere.") return v.soort === "twee" && maat(v, x) > maat(v, ander(v, x)) && v.ding === "beker" ? null : "is niet hoger en breder";
  if (["Het is leeg.", "Daar zit niets in.", "Dat is helemaal leeg."].includes(z)) return vul(v, x) === 0 ? null : "is niet leeg";
  if (["Het is vol.", "Dat is helemaal vol.", "Dat zit tot bovenaan vol."].includes(z)) return vul(v, x) === 1 ? null : "is niet vol";
  if (z === "Daar zit sap in.") return vul(v, x) > 0 ? null : "er zit geen sap in";
  if (["Die hangt hoger.", "Die gaat omhoog.", "Die kant staat hoog."].includes(z)) return v.soort === "weeg" && x !== v.zwaar ? null : "hangt niet hoger";
  if (["Die hangt lager.", "Die gaat omlaag.", "Die kant staat laag."].includes(z)) return v.soort === "weeg" && x === v.zwaar ? null : "hangt niet lager";
  if (/^Die is groot, maar (hangt hoger|gaat omhoog)\.$/.test(z)) return v.soort === "weeg" && x !== v.zwaar && v.dingen.find((d) => d.id === x)!.soort === "mand" ? null : "klopt niet";
  if (z === "Die stopt eerder." || z === "Die houdt eerder op.") return v.ding === "sliert" && maat(v, x) < maat(v, ander(v, x)) ? null : "stopt niet eerder";
  if (z === "Die loopt verder door." || z === "Die is langer dan de andere.") return v.ding === "sliert" && maat(v, x) > maat(v, ander(v, x)) ? null : "loopt niet verder";
  /* Drie voorwerpen. */
  if ((m = z.match(/^(Die|Dat) is niet (de|het) (grootst|kleinst|langst|kortst)e?\.$/))) {
    const groot = m[3] === "grootst" || m[3] === "langst";
    return v.soort === "drie" && !(groot ? isMax(v, x) : isMin(v, x)) && (m[3].startsWith("lang") || m[3].startsWith("kort")) === lijnig && (m[1] === "Dat") === v.het ? null : "klopt niet";
  }
  if ((m = z.match(/^(Die|Dat) is (de|het) (grootst|kleinst|langst|kortst)(e|(?: van allemaal))\.$/))) {
    const groot = m[3] === "grootst" || m[3] === "langst";
    return v.soort === "drie" && (groot ? isMax(v, x) : isMin(v, x)) && (m[3].startsWith("lang") || m[3].startsWith("kort")) === lijnig ? null : "klopt niet";
  }
  if (z === "Dat stopt het eerst.") return v.soort === "drie" && v.ding === "broodje" && isMin(v, x) ? null : "stopt niet het eerst";
  if (z === "Dat loopt het verst door.") return v.soort === "drie" && v.ding === "broodje" && isMax(v, x) ? null : "loopt niet het verst";
  /* Op volgorde. */
  if (z === "Je zette ze van groot naar klein." || z === "Nu zette je ze van groot naar klein." || z === "Van groot naar klein?") return !kies && xs.every((id, i) => i === 0 || maat(v, xs[i - 1]) > maat(v, id)) ? null : "niet van groot naar klein";
  if (z === "Dat is net andersom.") return !kies && x === [...v.goed.split(",")].reverse().join(",") ? null : "niet andersom";
  if (z === "De grootste staat nu vooraan.") return !kies && isMax(v, xs[0]) ? null : "de grootste staat niet vooraan";
  if ((m = z.match(/^(?:Maar e|E)r (ligt|staat) nog een kleinere\.$/))) return !kies && !isMin(v, xs[0]) && m[1] === (v.ding === "beker" ? "staat" : "ligt") ? null : "er is geen kleinere (of bekers liggen / appels staan)";
  if (/^(Je zette|Nu zette je) de grootste in het midden\.$/.test(z) || z === "De grootste staat nu in het midden." || z === "In het midden staat nu de grootste.") return !kies && isMax(v, xs[1]) ? null : "de grootste staat niet in het midden";
  if (z === "Weer stond de kleinste niet vooraan." || z === "Ook nu stond de kleinste niet vooraan.") return !kies && !isMin(v, xs[0]) ? null : "de kleinste stond wel vooraan";
  if (z === "Je zette ze weer in dezelfde volgorde." || z === "Weer dezelfde volgorde, zie ik.") return !kies ? null : "past niet";
  /* De vraag (opnieuw, in andere woorden) en de opdracht. */
  if (z === vraagZin(v)) return null;
  if ((m = z.match(/^(.+), denk je\?$/))) return kies && `${m[1]}?` === vraagZin(v) ? null : "de vraag in andere woorden klopt niet";
  if ((m = z.match(/^(?:Tik op|Kies) (de|het) (\w+) (die|dat) ([\w ]+) is\.$/))) return kies && v.soort !== "weeg" && m[2] === v.ding && (m[1] === "het") === v.het && (m[3] === "dat") === v.het && m[4] === v.woord ? null : "past niet bij de vraag";
  if ((m = z.match(/^(?:Tik op|Kies) wat (\w+) is\.$/))) return v.soort === "weeg" && m[1] === v.woord ? null : "past niet bij de vraag";
  if ((m = z.match(/^Zet de (\w+) van klein naar groot\.$/))) return !kies && m[1] === meervoud(v) ? null : "past niet";
  if (z === "Zet ze nu van klein naar groot." || z === "Tik ze aan van klein naar groot.") return !kies ? null : "past niet";
  /* Hints: hoe je kijkt (passend bij het beeld van deze vraag). */
  if (z === "Ze beginnen bij dezelfde streep.") return v.indeling === "onder" ? null : "geen streep";
  if (/^Kijk waar (elke sliert ophoudt|ze allemaal stoppen)\.$/.test(z)) return v.indeling === "onder" && (!z.includes("sliert") || v.ding === "sliert") ? null : "past niet";
  if ((m = z.match(/^Kijk (welke sliert|welk broodje) als eerste ophoudt\.$/))) return v.indeling === "onder" && m[1].endsWith(v.ding) && !groteKant(v) ? null : "past niet";
  if ((m = z.match(/^Volg (elke sliert|elk broodje) met je ogen tot het eind\.$/))) return v.indeling === "onder" && m[1].endsWith(v.ding) ? null : "past niet";
  if (/^(Kijk van rand tot rand hoe breed ze zijn|Kijk hoe breed elke pannenkoek is)\.$/.test(z)) return v.ding === "pannenkoek" ? null : "past niet";
  if (z === "Kijk hoe hoog en hoe breed ze zijn.") return v.indeling === "rij" && ["beker", "mand", "appel"].includes(v.ding) ? null : "past niet";
  if ((m = z.match(/^Kijk (?:goed )?naar (allebei de|alle) (\w+)\.$/))) return v.indeling === "rij" && m[2] === meervoud(v) && (m[1] === "alle") === (v.dingen.length === 3) ? null : "past niet";
  if ((m = z.match(/^Kijk goed in (allebei de|alle) glazen\.$/))) return v.ding === "glas" && (m[1] === "alle") === (v.dingen.length === 3) ? null : "past niet";
  if ((m = z.match(/^Kijk welke (\w+) (minder hoog|het minst hoog|het hoogst) komt\.$/))) return v.indeling === "rij" && m[1] === v.ding && ["beker", "mand", "appel"].includes(v.ding) && (m[2] === "het hoogst") === groteKant(v) && (m[2] === "minder hoog") === (v.dingen.length === 2) ? null : "past niet";
  /* WOORDEN-GROEP3.md: "vergelijken" als werkwoord niet (keuring 11 november 2026). */
  if (/\bvergelijk/i.test(z)) return "vergelijk (WOORDEN-GROEP3.md)";
  if (/^(Kijk hoe hoog het sap komt|Zoek sap tot aan de rand|Kijk waar geen sap in zit|Zoek waar niets in zit|Kijk tot waar het sap komt|Zoek sap tot de helft)\.$/.test(z)) return v.ding === "glas" ? null : "geen glazen";
  if (/^(Iets zwaars trekt de weegschaal omlaag|Kijk welke kant van de weegschaal zakt|Kijk welke schaal lager hangt|Zoek de schaal die het laagst is|Iets groots is niet altijd zwaar)\.$/.test(z)) return v.soort === "weeg" && v.woord === "zwaarder" ? null : "past niet bij lichter";
  if (/^(Iets lichts gaat omhoog op de weegschaal|Kijk welke kant van de weegschaal omhoog gaat|Kijk welke schaal hoger hangt|Zoek de schaal die het hoogst is)\.$/.test(z)) return v.soort === "weeg" && v.woord === "lichter" ? null : "past niet bij zwaarder";
  if ((m = z.match(/^Kijk (?:goed )?welke (?:(\w+) )?het kleinst is\.$/)) || /^Zoek eerst de kleinste\.$/.test(z)) return !kies && !isMin(v, xs[0]) && (!m?.[1] || m[1] === v.ding) ? null : "past niet (het kind begon al met de kleinste)";
  if (/^(Begin met de kleinste en pak dan steeds een grotere|De kleinste komt eerst, de grootste als laatste|Begin bij de kleinste|Pak daarna steeds een grotere)\.$/.test(z)) return !kies && !isMin(v, xs[0]) ? null : "past niet (het kind begon al met de kleinste)";
  if (/^(Tik steeds op de kleinste die nog over is|Pak steeds de kleinste die nog over is|Kijk na elke tik welke nu het kleinst is)\.$/.test(z)) return !kies && isMin(v, xs[0]) ? null : "past niet";
  /* Uitleg bij de 2e fout (daarna doet Bliepo het samen voor). */
  const uitleg: [RegExp, (v: Vraag) => boolean][] = [
    [/^Groter betekent hier: hij is breder\.$|^Een grotere pannenkoek is breder\.$/, (q) => q.woord === "groter" && q.ding === "pannenkoek"],
    [/^Kleiner betekent: lager en smaller\.$|^Een kleine beker is niet zo hoog en niet zo breed\.$/, (q) => q.woord === "kleiner" && q.ding === "beker"],
    [/^Vol betekent: het sap komt tot de rand\.$|^In een vol glas komt het sap tot bovenaan\.$/, (q) => q.woord === "vol"],
    [/^Leeg betekent: er zit niets in\.$|^In een leeg glas zit helemaal niets\.$/, (q) => q.woord === "leeg"],
    [/^Wat zwaarder is, zakt naar beneden\.$|^De zware kant van de weegschaal zakt naar beneden\.$|^Hoe zwaarder iets is, hoe lager het hangt\.$/, (q) => q.soort === "weeg" && q.woord === "zwaarder"],
    [/^Wat lichter is, gaat omhoog\.$|^De lichte kant van de weegschaal gaat omhoog\.$|^Hoe lichter iets is, hoe hoger het hangt\.$|^Iets lichts blijft boven hangen\.$/, (q) => q.soort === "weeg" && q.woord === "lichter"],
    [/^Langer betekent: hij loopt verder door\.$|^Een langere sliert gaat verder door\.$/, (q) => q.woord === "langer"],
    [/^Korter betekent: hij stopt eerder\.$|^Een kortere sliert houdt eerder op\.$/, (q) => q.woord === "korter"],
    [/^Een andere mand is nog groter\.$|^Er staat een mand die nog groter is\.$/, (q) => q.nr === 9 && !isMax(q, x) && !isMin(q, x)],
    [/^Een andere appel is nog kleiner\.$|^Er ligt een appel die nog kleiner is\.$/, (q) => q.nr === 11 && !isMax(q, x) && !isMin(q, x)],
    [/^Een ander broodje loopt nog verder door\.$|^Er ligt een broodje dat nog verder doorloopt\.$/, (q) => q.nr === 12 && !isMax(q, x) && !isMin(q, x)],
    [/^Een ander broodje stopt nog eerder\.$|^Er ligt een broodje dat nog eerder stopt\.$/, (q) => q.nr === 14 && !isMax(q, x) && !isMin(q, x)],
    [/^Het grootst (betekent: groter dan alle andere|is groter dan alle andere manden)\.$/, (q) => q.woord === "het grootst"],
    [/^Het kleinst (betekent: kleiner dan alle andere|is kleiner dan alle andere appels)\.$/, (q) => q.woord === "het kleinst"],
    [/^Het langst (betekent: langer dan alle andere|is langer dan alle andere broodjes)\.$/, (q) => q.woord === "het langst"],
    [/^Het kortst (betekent: korter dan alle andere|is korter dan alle andere broodjes)\.$/, (q) => q.woord === "het kortst"],
    [/^Half vol is niet tot de rand, maar tot de helft\.$/, (q) => q.woord === "half vol" && vul(q, x) === 1],
    [/^Bij half vol komt het sap tot (de helft|het midden)\.$|^In een glas dat half vol is, komt het sap tot het midden\.$/, (q) => q.woord === "half vol"],
    [/^Van klein naar groot: de kleinste staat vooraan\.$|^Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere\.$|^De kleinste hoort helemaal aan het begin\.$/, (q) => q.soort === "volgorde"],
    [/^De kleinste hoort vooraan\.$|^Van klein naar groot begint altijd met de kleinste\.$/, (q) => q.soort === "volgorde" && !isMin(q, xs[0])],
    [/^Van klein naar groot: je begint links\.$|^Je begint links, met de kleinste\.$/, (q) => q.soort === "volgorde"],
    [/^Na de kleinste komt eerst de middelste\.$|^De middelste hoort direct na de kleinste\.$/, (q) => q.soort === "volgorde" && isMin(q, xs[0]) && isMax(q, xs[1])],
  ];
  for (const [re, ok] of uitleg) if (re.test(z)) return ok(v) ? null : "uitleg past niet";
  return `onbekende zin (niet na te lopen): "${z}"`;
}

/* 3. Wat voor elke variant geldt. */
const OPDRACHT = /\?\s*$|(^|[.!?]\s+)(Tik|Kies|Zet|Sleep)\b/;
const GEBIEDEND = /^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Zeg|Zet|Denk|Begin|Pak|Vergelijk|Leg|Volg|Kies)\b/;
let varianten = 0;
let beweringen = 0;
let combinaties = 0;
function algemeen(waar: string, z: string) {
  varianten++;
  if (/\bfout\b/i.test(kaal(z))) fouten.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
  if (/vinkje/i.test(z)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die hele zin weg, BOUWREGELS 15.37): "${kaal(z)}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${waar}: getal zonder kleur in "${z}" (14.20)`);
  if (/\bvergelijk/i.test(z)) fouten.push(`${waar}: "vergelijk" (WOORDEN-GROEP3.md): "${kaal(z)}"`);
  if (lengte(z) > MAX_STUK) fouten.push(`${waar}: te lang voor het tekstvak (${lengte(z)} tekens): "${kaal(z)}"`);
}
/** Een rijtje varianten: genoeg, geen 2 dezelfde (ook niet met een ander voorwerp of rekenwoord erin). */
function rijtje(waar: string, lijst: readonly string[], min = 2, opdracht = false) {
  if (lijst.length < min) fouten.push(`${waar}: ${lijst.length} ${lijst.length === 1 ? "variant" : "varianten"}, minstens ${min} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
  for (const z of lijst) {
    algemeen(waar, z);
    if (opdracht && !OPDRACHT.test(kaal(z))) fouten.push(`${waar}: zegt niet wat het kind doet (F16): "${kaal(z)}"`);
  }
}

/* 4. De fouttabel: compleet, elke variant waar, niets verklapt (15.17), altijd een vraag of opdracht (F16). */
function keurFout(waar: string, v: Vraag, x: string, f: Fout) {
  const V = f.v;
  if (f.code === "onduidelijk") return void fouten.push(`${waar}: vaste keuzes horen een denkfout te hebben`);
  const lijsten: [string, string[]][] = [["eerste zin", V.eerste], ["hint", V.hint], ["uitleg", V.uitleg], ["weer", V.weerEerste], ["weer-uitleg", V.weerUitleg]];
  for (const [naam, lijst] of lijsten) if (lijst.length || !naam.startsWith("weer")) rijtje(`${waar} ${naam}`, lijst, naam === "uitleg" ? 2 : naam.startsWith("weer") ? 2 : 3);
  const opnieuw = opnieuwVan(v);
  rijtje(`${waar} de vraag opnieuw`, opnieuw, 3, true);
  if (!V.eerste.includes(f.eerste)) fouten.push(`${waar}: de vaste eerste zin van de tabel is geen variant`);
  /* Waar? Elke zin van elke variant. */
  for (const [naam, lijst] of [...lijsten, ["de vraag opnieuw", opnieuw]] as [string, string[]][])
    for (const z of lijst)
      for (const s of zinnenVan(z)) {
        beweringen++;
        const r = bekend(v, x, s);
        if (r) fouten.push(`${waar} ${naam}: ${r} ("${s}")`);
      }
  /* Niet verklappen (15.17). */
  const xs = x.split(",");
  if (v.soort !== "volgorde") {
    if (x === v.goed) fouten.push(`${waar}: fout antwoord is het goede`);
    if (f.rondje === v.goed) fouten.push(`${waar}: rondje om het antwoord`);
    if (f.rondje !== x) fouten.push(`${waar}: het rondje staat niet om wat het kind koos`);
    if (!f.over.includes(v.goed)) fouten.push(`${waar}: het goede antwoord valt weg na de eerste zin (de zin klopt niet)`);
    if (f.over.length < Math.min(2, v.dingen.length - 1)) fouten.push(`${waar}: na de eerste zin blijft alleen ${f.over.join("")} over`);
    for (const z of [...V.eerste, ...V.hint, ...opnieuw]) {
      const t = kaal(z).toLowerCase();
      if (t.includes(naamVan(v, v.goed).toLowerCase())) fouten.push(`${waar}: noemt het antwoord (${naamVan(v, v.goed)}): "${kaal(z)}"`);
      if (/tussen .* en /i.test(t)) fouten.push(`${waar}: "tussen … en …" in "${kaal(z)}"`);
    }
  } else {
    const goed = v.goed.split(",");
    if (!f.rondje || xs.indexOf(f.rondje) === goed.indexOf(f.rondje)) fouten.push(`${waar}: het rondje staat om iets wat al goed staat`);
  }
  /* De 2e keer: geen opdracht (daarna doet Bliepo het samen voor). */
  for (const [naam, lijst] of lijsten.slice(2)) for (const z of lijst) for (const s of zinnenVan(z)) if (GEBIEDEND.test(s)) fouten.push(`${waar} ${naam}: een opdracht bij de 2e keer: "${s}"`);
  /* Elke eerste zin: minstens 2 hints zonder herhaling; na elke hint minstens 2 vragen of opdrachten die passen; elke
     combinatie die de les kan kiezen, zegt geen woord 2 keer en eindigt met een vraag of opdracht (F16). */
  for (const e of V.eerste) {
    const hints = passend(zonderDubbel(v, V.hint, e));
    if (hints.length < 2) fouten.push(`${waar}: maar ${hints.length} hint mogelijk na "${kaal(e)}" (dan hoort het kind 2 keer dezelfde)`);
    for (const h of hints) {
      const os = passend(zonderDubbel(v, opnieuw, e, h), h);
      if (os.length < 2) fouten.push(`${waar}: na "${kaal(e)} ${kaal(h)}" passen maar ${os.length} vragen (dan hoort het kind 2 keer dezelfde)`);
      for (const o of os) {
        combinaties++;
        const r = dubbelIn(v, [e, h, o]);
        if (r) fouten.push(`${waar}: herhaling in 1 reactie (1e fout): ${r} — ${kaal(e)} | ${kaal(h)} ${kaal(o)}`);
        if (!OPDRACHT.test(kaal(`${h} ${o}`))) fouten.push(`${waar}: "${kaal(`${h} ${o}`)}" zegt niet wat het kind doet (F16)`);
        if (lengte(h, o) > MAX_STUK) fouten.push(`${waar}: hint + vraag te lang (${lengte(h, o)} tekens)`);
        if (o === vraagZin(v)) fouten.push(`${waar}: na de hint precies dezelfde vraagzin als de 1e keer`);
      }
    }
  }
  /* 2e keer: na elke eerste zin ("Nu koos je …", "Je koos weer …", "weer") passen minstens 2 uitleggen zonder herhaling. */
  const tweede: [string, string[], string[]][] = [
    ["2e fout (ander antwoord)", V.eerste.map(nuKoos), V.uitleg],
    ["2e fout (zelfde antwoord)", ZIN.weerGekozen(v, v.soort === "volgorde" ? "" : x), V.uitleg],
    ...(V.weerEerste.length ? [["2e fout (weer)", V.weerEerste, V.weerUitleg] as [string, string[], string[]]] : []),
  ];
  for (const [naam, eersten, uitleggen] of tweede)
    for (const e of eersten) {
      const kan = uitleggen.filter((u) => !dubbelIn(v, [e, u]) && lengte(u) <= MAX_STUK);
      if (kan.length < 2) fouten.push(`${waar}: ${naam}: na "${kaal(e)}" past maar ${kan.length} uitleg (dan hoort het kind 2 keer dezelfde)`);
      combinaties += kan.length;
    }
}

let telling = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = (v.soort === "volgorde" ? volgordes(v) : v.dingen.map((d) => d.id)).filter((k) => k !== v.goed).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${a}: geen vaste denkfout (${f.code})`);
    keurFout(`${v.id} ${a}`, v, a, f);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    for (const h of f.v.hint) hintsPerCode.get(f.code)!.add(kaal(h));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* "Je koos weer …" bij hetzelfde antwoord 2 keer: waar, en genoeg varianten. */
  for (const a of Object.keys(tabel)) {
    const lijst = ZIN.weerGekozen(v, v.soort === "volgorde" ? "" : a);
    rijtje(`${v.id} ${a} weer gekozen`, lijst, 2);
    for (const z of lijst) for (const s of zinnenVan(z)) { beweringen++; const r = bekend(v, a, s); if (r) fouten.push(`${v.id} ${a} weer gekozen: ${r} ("${s}")`); }
  }
  /* Paren foute antwoorden per vraag (keuring Tellen, Splitsen, Dagen): 2 foute antwoorden krijgen niet dezelfde eerste zin. */
  const rijen = Object.values(tabel);
  for (let i = 0; i < rijen.length; i++)
    for (let j = i + 1; j < rijen.length; j++) {
      if (rijen[i].soort === rijen[j].soort && rijen[i].weer.length) continue;
      for (const a of rijen[i].v.eerste) if (rijen[j].v.eerste.includes(a)) fouten.push(`${v.id}: 2 foute antwoorden krijgen dezelfde zin "${a}"`);
    }
}

/* 5. De vaste zinnen: genoeg varianten, geen 2 dezelfde, en elke opdracht zegt wat het kind doet (F16). */
const VAST: [string, readonly string[], number, boolean][] = [
  ["begin", ZIN.start, 3, false],
  ["naar de picknick", ZIN.picknick.map((p) => p.join(" ")), 3, false],
  ["samen", ZIN.samen, 5, false],
  ["vangnet op volgorde", ZIN.volgVangnet, 3, false],
  ["hulphandje bij de kleine stap", ZIN.handDing, 3, true],
  ["slot", ZIN.slot, 3, false],
  ["kaart", ZIN.kaartTik, 3, true],
  ["aanmoediging (hulphandje)", AANMOEDIG_DOEN, 5, false],
];
for (const [naam, lijst, min, opdracht] of VAST) rijtje(naam, lijst, min, opdracht);
for (const z of ZIN.start) if (lengte("Hoi Testkind! Fijn dat je er bent.", z) > MAX_STUK) fouten.push(`begin: te lang met de groet: "${z}"`);
for (const p of ZIN.picknick) for (const z of p) algemeen("naar de picknick", z);
for (const z of ZIN.volgVangnet) if (/samen/i.test(z) === false && !/help/i.test(z)) fouten.push(`vangnet op volgorde zegt niet dat Bliepo helpt: "${z}"`);

/* Per vraag: de vraagzinnen, samen voordoen, de reactie na de lof. */
let vorigeZinnen: string[] = [];
for (const v of VRAGEN) {
  const opties = alleVraagZinnen(v);
  for (const zinnen of opties) {
    for (const z of zinnen) algemeen(`${v.id} vraag`, z);
    if (lengte(...zinnen) > MAX_STUK) fouten.push(`${v.id}: de vraag is te lang (${lengte(...zinnen)} tekens)`);
    if (!OPDRACHT.test(kaal(zinnen.join(" ")))) fouten.push(`${v.id}: de vraag zegt niet wat het kind doet (F16)`);
  }
  /* Niet 2 keer precies dezelfde zin als bij de vraag ervoor (als er maar 1 keuze is). */
  if (opties.length === 1) for (const z of opties[0]) if (vorigeZinnen.includes(z)) fouten.push(`${v.id}: dezelfde zin als bij de vraag ervoor: "${z}"`);
  vorigeZinnen = opties.length === 1 ? opties[0] : [];
  if (opties.length > 1 && opties.some((o) => o.join(" ") !== v.vraag.join(" ") && !o.slice(1).every((z, i) => z === v.vraag[i + 1]))) fouten.push(`${v.id}: alleen de kijk-zin mag wisselen`);
  if (opties.length === 1 && opties[0].join(" ") !== v.vraag.join(" ")) {
    const ok = v.soort === "volgorde" && VRAGEN[VRAGEN.indexOf(v) - 1]?.soort === "volgorde" && opties[0].join(" ").includes(meervoud(v)) && /van klein naar groot/.test(opties[0].join(" ")) && /kleinste/.test(opties[0].join(" "));
    if (!ok) fouten.push(`${v.id}: andere vraagzinnen dan de oude les: "${opties[0].join(" ")}"`);
  }
  /* Samen voordoen. */
  for (const [id] of v.samen.stappen) if (!v.dingen.some((d) => d.id === id)) fouten.push(`${v.id}: samen wijst een voorwerp aan dat er niet is (${id})`);
  if (v.soort === "volgorde" && v.samen.stappen.some(([id]) => id === v.goed.split(",").at(-1))) fouten.push(`${v.id}: samen doet de stap die het kind zelf moet doen`);
  if (v.samen.intro) rijtje(`${v.id} samen: begin`, v.samen.intro, 2);
  v.samen.stappen.forEach(([, l], i) => {
    rijtje(`${v.id} samen: stap ${i + 1}`, l, 2);
    if (l.every((z) => /^Kijk\b/.test(z))) fouten.push(`${v.id} samen: stap ${i + 1} begint altijd met "Kijk"`);
  });
  rijtje(`${v.id} samen: jij`, v.samen.jij, 3, true);
  for (const z of v.samen.jij) if (!/rondje|erop/.test(z) && !z.includes(v.soort === "volgorde" ? `grootste ${v.ding}` : naamVan(v, v.goed).replace(/^(de|het) /, ""))) fouten.push(`${v.id}: de kleine stap zegt niet waar het kind tikt: "${z}"`);
  rijtje(`${v.id} samen: klaar`, ZIN.samenKlaar(v), 3);
  rijtje(`${v.id} samen: Bliepo deed het`, ZIN.samenZelf(v), 2);
  if (!/^Ja, /.test(v.samen.klaar)) fouten.push(`${v.id}: klaar-zin begint niet met "Ja, "`);
  for (const z of ZIN.samenZelf(v)) if (/^(Ja|Precies)\b/.test(z)) fouten.push(`${v.id}: na het vangnet begint "${z}" met lof`);
  rijtje(`${v.id} reactie na lof`, rekenReactie(v).zinnen, 7);
  if (v.soort !== "volgorde") for (const z of rekenReactie(v).zinnen) if (/grootst|kleinst|langst|kortst/.test(z) && !z.includes(v.woord) && !/alle andere/.test(z)) fouten.push(`${v.id}: reactie past niet bij de vraag: "${z}"`);
  rijtje(`${v.id} hulphandje op volgorde`, v.soort === "volgorde" ? ZIN.handVolgorde(v) : ["-", "+"], 2, v.soort === "volgorde");
}
for (const z of [...ZIN.handDing, ...VRAGEN.filter((v) => v.soort === "volgorde").flatMap((v) => ZIN.handVolgorde(v))]) if (!passend(AANMOEDIG_DOEN, z).some((a) => lengte(a, z) <= MAX_STUK)) fouten.push(`hulphandje te lang: "${z}"`);
/* Alle reactie-rijtjes hebben dezelfde volgorde (de les bewaakt "niet 2 keer dezelfde" met 1 sleutel, over vragen heen). */
for (const v of VRAGEN) if (rekenReactie(v).zinnen.length !== rekenReactie(VRAGEN[0]).zinnen.length) fouten.push(`${v.id}: reactie-rijtje heeft een andere lengte`);

/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

/* 6. NOOIT 2 KEER HETZELFDE: de kiezer 20.000 keer naspelen met willekeurige vragen en antwoorden (dezelfde functie als de les). */
let gespeeld = 0;
{
  let zaad = 20261118;
  const toeval = () => (zaad = (zaad * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const kiezer = maakKiezer({ wissel: WISSELWOORDEN, toeval });
  const vorige = new Map<string, string>();
  let melding = 0;
  const meld = (t: string) => {
    if (melding++ < 8) fouten.push(t);
  };
  const kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = kiezer.kies(sleutel, zinnen, mag);
    if (zinnen.length > 1 && vorige.get(sleutel) === vorm(z)) meld(`kiezer: 2 keer achter elkaar dezelfde zin bij "${sleutel}": "${kaal(z)}"`);
    vorige.set(sleutel, vorm(z));
    return z;
  };
  const pak = <T,>(l: T[]) => l[Math.floor(toeval() * l.length)];
  const reactieOk = (waar: string, v: Vraag, zinnen: string[]) => {
    for (const z of zinnen) if (lengte(z) > MAX_STUK) meld(`kiezer: te lang (${lengte(z)} tekens) bij ${waar}: "${kaal(z)}"`);
    const r = dubbelIn(v, zinnen);
    if (r) meld(`kiezer: herhaling in 1 reactie bij ${waar}: ${r} — "${kaal(zinnen.join(" | "))}"`);
    for (const z of zinnen) if (/\bfout\b|vinkje/i.test(z)) meld(`kiezer: verboden woord bij ${waar}: "${kaal(z)}"`);
  };
  for (let i = 0; i < 20000; i++) {
    const v = pak(VRAGEN);
    const tabel = foutenVan(v);
    const a1 = pak(Object.keys(tabel));
    const f1 = tabel[a1];
    const z1 = foutReactie(kies, v, f1, 1, null, false, "");
    reactieOk(`${v.id} ${a1} (1e keer)`, v, z1);
    if (!OPDRACHT.test(kaal(z1[1]))) meld(`kiezer: geen vraag of opdracht na de hint (${v.id} ${a1}): "${kaal(z1[1])}"`);
    if (z1[1].endsWith(` ${vraagZin(v)}`)) meld(`kiezer: na de hint precies dezelfde vraagzin (${v.id})`);
    gespeeld++;
    if (toeval() < 0.4) continue;
    const a2 = toeval() < 0.5 ? a1 : pak(Object.keys(tabel));
    const z2 = foutReactie(kies, v, tabel[a2], 2, f1, a2 === a1, z1[0]);
    reactieOk(`${v.id} ${a1} en dan ${a2} (2e keer)`, v, z2);
    if (z2.some((z) => z1.includes(z) || z1.some((y) => vorm(y) === vorm(z)))) meld(`kiezer: bij de 2e keer dezelfde zin als bij de 1e keer (${v.id} ${a1} en dan ${a2}): "${kaal(z2.join(" "))}"`);
    if (z2.some((z) => /^(Tik|Kies|Zet)\b/.test(z))) meld(`kiezer: een opdracht bij de 2e keer (${v.id}): "${kaal(z2.join(" "))}"`);
    kies("samen", ZIN.samen);
    if (v.samen.intro) kies("samenIntro", v.samen.intro);
    v.samen.stappen.forEach(([, l], k) => kies(`samenStap${k}`, l));
    kies("samenJij", v.samen.jij);
    kies("samenKlaar", ZIN.samenKlaar(v));
    gespeeld++;
  }
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole, waarheidscontrole en herhaalcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${varianten} varianten nagelopen, ${beweringen} beweringen, ${combinaties} combinaties, kiezer ${gespeeld} keer nagespeeld).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 7. De tabel (1 vaste variant per cel; alle varianten in §4). */
const keuzeNaam = (v: Vraag, x: string) => (v.soort === "volgorde" ? x.split(",").map((id) => naamVan(v, id).replace(/^(de|het) /, "")).join(" → ") : naamVan(v, x));
const vraagNaam = (v: Vraag) => `${v.nr}. ${v.vraag.join(" ")}${v.soort === "volgorde" ? "" : ` (keuzes ${v.dingen.map((d) => d.naam).join(" / ")})`}`;
const rijen = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${keuzeNaam(v, a)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`)).join("\n");
const eerst = <T,>(l: T[], v: { nr: number }) => l[v.nr % l.length];
const samenZin = (v: Vraag) =>
  `${v.samen.intro ? `"${eerst(v.samen.intro, v)}" ` : ""}${v.samen.stappen.map(([id, z]) => `rondje om ${naamVan(v, id)}: "${eerst(z, v)}"`).join(" ")} — ${v.soort === "volgorde" ? "Bliepo zet die op hun plek; " : ""}rondje om ${naamVan(v, v.goed.split(",").at(-1)!)}: "${eerst(v.samen.jij, v)}" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "${eerst(ZIN.samenKlaar(v), v)}" (vangnet: "${eerst(ZIN.samenZelf(v), v)}")`;
const uitleg = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${keuzeNaam(v, a)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)}${f.weer.length ? ` (zelfde denkfout 2 keer: "${f.weer.join(" ")}")` : ""} + "${eerst(ZIN.samen, v)}" (${ZIN.samen.length} versies) | ${samenZin(v)} |`)).join("\n");
const lijst = (l: readonly string[]) => l.map((z) => `"${kaal(z)}"`).join(" / ");
const alleVarianten = VRAGEN.map((v) => {
  const kop = `### ${vraagNaam(v)}\n\n- De vraag: ${alleVraagZinnen(v).map((z) => `"${z.join(" ")}"`).join(" / ")}\n- De vraag opnieuw na de hint: ${lijst(opnieuwVan(v))}\n- Samen: ${v.samen.intro ? `${lijst(v.samen.intro)} — ` : ""}${v.samen.stappen.map(([, l]) => lijst(l)).join(" — ")} — ${lijst(v.samen.jij)} — ${lijst(ZIN.samenKlaar(v))} (vangnet: ${lijst(ZIN.samenZelf(v))})\n- Reactie na de lof: ${lijst(rekenReactie(v).zinnen)}${v.soort === "volgorde" ? `\n- Hulphandje: ${lijst(ZIN.handVolgorde(v))}` : ""}\n`;
  const fs = Object.entries(foutenVan(v)).map(([a, f]) => `**${keuzeNaam(v, a)}** (\`${f.code}\`)\n- eerste zin: ${lijst(f.v.eerste)}\n- hint: ${lijst(f.v.hint)}\n- uitleg (2e keer): ${lijst(f.v.uitleg)}\n- hetzelfde antwoord 2 keer: ${lijst(ZIN.weerGekozen(v, v.soort === "volgorde" ? "" : a))}${f.v.weerEerste.length ? `\n- dezelfde denkfout 2 keer: ${lijst(f.v.weerEerste)} + ${lijst(f.v.weerUitleg)}` : ""}`);
  return [kop, ...fs].join("\n\n");
}).join("\n\n");

const tekst = `# FOUTTABEL — gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg")

Gemaakt **uit de code** met \`npx tsx scripts/fouttabel-rekentaal-gouden.ts\` (eerste versie 11 november 2026; varianten sinds 18 november 2026); pas zinnen aan in \`src/components/les/lessen/squla-rekentaal-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (16 vragen, de voorwerpen, hun maten, de keuzes en de goede antwoorden) is die van squla-rekentaal en blijft gelijk (BOUWREGELS 15.22). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENTAAL.md.

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen tutorles over groot en klein, vol en leeg, zwaar en licht of lang en kort (KOPPELING.md §12: alleen het spel Less or More). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling; alleen de algemene zinnen "Ik help je even" en "Precies" komen van Synthesis. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: het andere uiterste gekozen (groot en klein, vol en leeg, zwaar en licht, lang en kort verwisseld), het middelste gekozen, het volle of lege glas bij half vol, het grootste ding op de weegschaal, en bij op volgorde: andersom, niet bij de kleinste begonnen, of de grootste in het midden. Bliepo zegt alleen wat waar is over wat het kind koos; hij verzint geen reden.

Getallen: Bliepo's zinnen in deze les hebben geen getallen.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos (1 keer), met een rood rondje om dat voorwerp zolang hij het noemt. Daarna de hint en meteen de vraag in andere woorden ("Welke pannenkoek is groter, denk je?", "Tik op de pannenkoek die groter is."; nooit precies dezelfde vraagzin als de 1e keer), en tegelijk mag het kind opnieuw kiezen. Bij op volgorde gaan alle voorwerpen terug naar boven en komt na de hint de opdracht ("Zet ze nu van klein naar groot."). Zo staat er altijd een vraag of opdracht in beeld (15.37, F16). Alles gaat vanzelf door (15.27).
- **Vragen met 2 voorwerpen** (vraag 1 t/m 8 en 13): na de 1e fout blijft er altijd maar 1 voorwerp over. Dat komt door de inhoud van Squla (2 keuzes); de eerste zin en de hint zeggen alleen iets over wat het kind koos en hoe je kijkt.
- **Verklappen (15.17):** de eerste zin, de hint en de vraag opnieuw noemen het goede voorwerp niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en bij 3 voorwerpen blijven er na de eerste zin altijd 2 over.
- **Herhaling:** in 1 reactie bij een fout komt geen woord 2 keer voor (behalve kleine woordjes en de woorden van de vraag zelf), en niet 2 keer dezelfde naam achter elkaar. De les kiest alleen combinaties die dat halen; het script keurt ze allemaal.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (${ZIN.samen.length} versies) en dan samen voordoen (§3): Bliepo wijst de voorwerpen 1 voor 1 aan met het rondje, dan staat het rondje om het goede voorwerp en het kind tikt het (de kleine stap; na ± 6 s stilte het hulphandje; vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf: "Kijk, …", geen "Ja"). Bij op volgorde zet Bliepo de kleinste en de middelste op hun plek en tikt het kind de grootste. "Ze beginnen bij dezelfde streep." zegt Bliepo bij samen voordoen niet als de hint het al zei. Daarna gaat de les door.
- **Hetzelfde foute antwoord 2 keer:** "Je koos weer …" / "Weer deze pannenkoek, zie ik." / "Je tikte weer op …" (bij op volgorde "Je zette ze weer in dezelfde volgorde.") en dan de uitleg (anders dan de hint van de 1e keer).
- **Dezelfde denkfout 2 keer met een ander antwoord:** kan alleen bij op volgorde (\`niet-bij-kleinste\`): dan zegt Bliepo de "weer"-zin.
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" of "Nu tikte je op …" (keuring Tellen en Splitsen).
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- **Nooit 2 keer hetzelfde:** elke zin heeft varianten (§4); de les kiest met de gedeelde kiezer (\`nooit-dubbel.ts\`) steeds een andere dan de vorige keer, ook over vragen heen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen; 1 vaste variant per cel, alle varianten in §4)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint en de vraag opnieuw | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Samen voordoen |
|---|---|---|---|
${uitleg}

## 4. Alle varianten

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer: nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. Het script loopt ELKE variant na: waar in het beeld, niets verklapt, geen woord 2 keer in 1 reactie, geen opdracht bij de 2e keer, na elke hint een vraag of opdracht, alles past in het tekstvak (hooguit ${MAX_STUK} tekens per stuk).

**Vaste zinnen van de les**
${VAST.map(([naam, l]) => `- ${naam}: ${lijst(l)}`).join("\n")}

${alleVarianten}
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekentaal-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekentaal-gouden.md geschreven.");
