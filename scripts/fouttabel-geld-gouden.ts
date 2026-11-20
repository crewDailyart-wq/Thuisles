/**
 * Maakt FOUTTABEL-squla-geld-geldmachine-1-gouden.md uit de code (squla-geld-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.22, 14.30, 15.17; LESRECEPT
 * "geleerd bij Tellen", "geleerd bij de keuring Huisnummers").
 *   npx tsx scripts/fouttabel-geld-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord: de eerste zin en de hint noemen het goede antwoord niet, er blijven
 * na de eerste zin + hint minstens 2 keuzes over (het goede er ook bij), het getal dat het kind zoekt staat wit in de
 * vraag en de hint (14.22), en het rondje staat nooit om het antwoord.
 * Waarheidscontrole: elke bewering in de eerste zin, de hint, de uitleg en de "weer"-zinnen wordt nagelopen tegen het
 * beeld van DEZE vraag (wat het kind koos, vorm, getal, aantal cijfers, kleur, midden, hoeveel munten of briefjes er in
 * beeld liggen). Een zin die het script niet kent, telt als fout.
 *
 * 18 november 2026 (warme zinnen in varianten, zoals Tellen, Splitsen, Huisnummers en Meten): het script keurt nu ALLE
 * varianten, niet alleen de eerste: verklappen, waarheid, geen getal 2 keer in 1 stuk, geen hint die met een vraag
 * eindigt, altijd een vraag of opdracht in beeld (15.37, F16; nooit het woord "vinkje"), genoeg varianten per situatie,
 * elk stuk past in het tekstvak, en het speelt de kiezer 20.000 keer na (nooit 2 keer achter elkaar dezelfde).
 */
import { writeFileSync } from "node:fs";
import { isBriefje, type GeldSoort } from "../src/components/les/vlakken/squla-geld-soorten";
import {
  AANMOEDIG_TIKKEN,
  DENKFOUT_UITLEG,
  DENKFOUTEN,
  FEIT,
  MAX_STUK,
  VRAGEN,
  WISSEL,
  ZIN,
  deeltGetal,
  eenheid,
  foutStuk,
  foutenVan,
  geldReactie,
  getal,
  goedVan,
  knop,
  nuKoos,
  opnieuwZin,
  pastNa,
  type Ding,
  type Fout,
  type Vraag,
  type Waarvraag,
  type Watvraag,
} from "../src/components/les/lessen/squla-geld-gouden-zinnen";
import { EINDE, EINDE_VEEL_FOUTEN, NAAM_GROET } from "../src/components/les/lessen/squla-klok-gouden-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const doelVan = (v: Vraag): GeldSoort => (v.soort === "waar" ? v.doel : v.soort === "wat" ? v.ding : v.zoek);
const inBeeld = (v: Vraag): Ding[] => (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? [v.ding] : v.bellen);
const keuzes = (v: Vraag): string[] => (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? v.opties.map(knop) : [...new Set(v.bellen)].filter((b) => b !== v.zoek));
const naamX = (v: Vraag, a: string): Ding => (v.soort === "wat" ? v.opties.find((o) => knop(o) === a)! : (a as Ding));
const vorm = maakVorm(WISSEL);
const vormVan = (x: GeldSoort) => (isBriefje(x) ? "briefje" : "munt");

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): 12 vragen zoals squla-geld-geldmachine-1; precies 1 goed antwoord. */
const OUD: [string, string, string][] = [
  ["waar", "m1", "m2,b5,m1"], ["waar", "m2", "m1,m2,b20"], ["waar", "b5", "b50,c50,b5"], ["wat", "b10", "b100,m1,b10"], ["waar", "b20", "b10,m2,b20"], ["wat", "m1", "m1,knoop,m2"],
  ["wat", "b5", "b5,b50,c50"], ["bellen", "m1", "m1,m2,m1,c50,knoop,m1"], ["waar", "b10", "b20,b100,b10"], ["wat", "b20", "b20,b10,b50"], ["wat", "m2", "m1,m2,c50"], ["waar", "b5", "b10,b5,b20"],
];
if (VRAGEN.length !== 12) fouten.push(`${VRAGEN.length} vragen in plaats van 12 (squla-geld-geldmachine-1)`);
const telSoort = (s: string) => VRAGEN.filter((v) => v.soort === s).length;
if (telSoort("waar") !== 6 || telSoort("wat") !== 5 || telSoort("bellen") !== 1) fouten.push("niet 6 keer 'waar zie je', 5 keer 'wat is dit' en 1 keer de zwevende munten");
VRAGEN.forEach((v, i) => {
  const d = doelVan(v);
  const [soort, doel, lijst] = OUD[i] ?? ["", "", ""];
  if (v.soort !== soort || d !== doel || inBeeldOfKeuzes(v).join(",") !== lijst) fouten.push(`${v.id}: wijkt af van de oude les (het geld of de keuzes zijn veranderd)`);
  if (v.soort === "waar" && v.keuzes.filter((k) => k === d).length !== 1) fouten.push(`${v.id}: niet precies 1 goed kaartje`);
  if (v.soort === "waar" && new Set(v.keuzes).size !== v.keuzes.length) fouten.push(`${v.id}: 2 kaartjes zijn gelijk`);
  if (v.soort === "wat" && v.opties.filter((k) => k === d).length !== 1) fouten.push(`${v.id}: niet precies 1 goede knop`);
  if (v.soort === "wat" && new Set(v.opties.map(knop)).size !== v.opties.length) fouten.push(`${v.id}: 2 knoppen zijn gelijk`);
  if (v.soort === "bellen" && v.bellen.filter((b) => b === d).length !== 3) fouten.push(`${v.id}: niet 3 munten van 1 euro`);
});
function inBeeldOfKeuzes(v: Vraag): string[] {
  return v.soort === "waar" ? v.keuzes : v.soort === "wat" ? v.opties : v.bellen;
}

/* 2. Waarheidscontrole: elke losse zin van elke variant, tegen het beeld van DEZE vraag en wat het kind koos. */
const bekend = (v: Vraag, x: Ding, z: string): string | null => {
  const d = doelVan(v);
  const xs = x as GeldSoort;
  const geld = x !== "knoop";
  const beeld = inBeeld(v).filter((k) => k !== "knoop") as GeldSoort[];
  const munten = beeld.filter((k) => !isBriefje(k)).length;
  const briefjes = beeld.filter((k) => isBriefje(k)).length;
  const lengte = geld ? String(getal(xs)).length : 0;
  let m: RegExpMatchArray | null;
  /* Wat het kind koos. */
  if ((m = z.match(/^(?:Je koos|Je tikte op|Nu koos je|Nu tikte je op|Dit is|Dat is|Kijk, dat is) (?:een|de|het) (munt|briefje) van (\d+) (euro|cent)\.$/))) return geld && m[1] === vormVan(xs) && Number(m[2]) === getal(xs) && m[3] === eenheid(xs) ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(?:Je koos|Je tikte op|Nu koos je|Nu tikte je op) (\d+) (euro|cent)\.$/)) || (m = z.match(/^(\d+) (euro|cent)\?$/))) return v.soort === "wat" && geld && Number(m[1]) === getal(xs) && m[2] === eenheid(xs) ? null : "noemt niet wat het kind koos";
  if (/^(Je koos een knoop|Nu koos je een knoop|Je tikte op een knoop|Nu tikte je op een knoop|Je tikte op de knoop|Dat is een knoop|Een knoop\?|Je tikte weer op de knoop|Weer de knoop, zie ik)[.?]?$/.test(z)) return !geld ? null : "zegt knoop, maar het kind koos geen knoop";
  /* Vorm. */
  if ((m = z.match(/^Dat is geen (munt|briefje)\.$/)) || (m = z.match(/^Maar we zoeken een (munt|briefje)\.$/)) || (m = z.match(/^Een (munt|briefje) ziet er anders uit\.$/))) return geld && m[1] === vormVan(d) && vormVan(xs) !== vormVan(d) ? null : "klopt niet met de vorm";
  if ((m = z.match(/^(?:Maar dat|Dat) is een (munt|briefje)\.$/))) return geld && m[1] === vormVan(xs) ? null : "klopt niet met de vorm";
  if (/^Dat is van papier\.$/.test(z)) return geld && isBriefje(xs) ? null : "het gekozen geld is geen briefje";
  if (/^Die is rond\.$/.test(z)) return geld && !isBriefje(xs) ? null : "het gekozen geld is geen munt";
  if ((m = z.match(/^Je koos weer een (munt|briefje)\.$/)) || (m = z.match(/^Weer een (munt|briefje), zie ik\.$/)) || (m = z.match(/^(?:Dit|Dat) is ook weer een (munt|briefje)\.$/))) return geld && m[1] === vormVan(xs) && vormVan(xs) !== vormVan(d) ? null : "klopt niet met wat het kind koos";
  /* Hoeveel cijfers er op het gekozen geld staan (ook de grammatica: 1 cijfer, 2 cijfers). */
  if ((m = z.match(/^(?:Op dat (?:briefje|munt) (staan|staat)|Dat getal heeft|Dat schrijf je met|Dat getal schrijf je met|In dat getal (staan|staat)) (\d+) (cijfers?)\.$/)) || (m = z.match(/^(?:Je koos weer het getal met|Weer het getal met)()() (\d+) (cijfers?)(?:, zie ik)?\.$/))) {
    const n = Number(m[3]);
    const ww = m[1] || m[2];
    if (!geld || n !== lengte) return "verkeerd aantal cijfers";
    if ((m[4] === "cijfer") !== (n === 1) || (ww && (ww === "staat") !== (n === 1))) return "grammatica: 1 cijfer, 2 cijfers";
    return null;
  }
  /* Een ander getal, en hoe het gekozen geld eruitziet. */
  if (/^Kijk maar, dat getal staat erop\.$/.test(z)) return geld ? null : "een knoop heeft geen getal";
  if ((m = z.match(/^Dat is ook een (munt|briefje), maar een (andere?)\.$/))) return geld && m[1] === vormVan(xs) && vormVan(xs) === vormVan(d) && xs !== d && (m[2] === "ander") === isBriefje(xs) ? null : "klopt niet met de vorm (of: een ander briefje, een andere munt)";
  if (/^(We zoeken een ander getal|Op dit geld staat een ander getal)\.$/.test(z)) return geld && getal(xs) !== getal(d) && (!/dit geld/.test(z) || v.soort === "wat") ? null : "het getal is niet anders";
  if ((m = z.match(/^Die munt is (zilver|goud) in het midden\.$/))) return (xs === "m1" || xs === "m2") && FEIT.midden[xs] === m[1] ? null : "klopt niet met het midden van de munt";
  if (/^Die munt is helemaal goud\.$/.test(z)) return xs === "c50" ? null : "klopt niet met de munt";
  if ((m = z.match(/^Dat briefje is (\w+)\.$/))) return geld && FEIT.kleur[xs] === m[1] ? null : "klopt niet met de kleur";
  if ((m = z.match(/^Je koos weer een (munt|briefje) met een ander getal\.$/)) || (m = z.match(/^Weer een (munt|briefje) met een ander getal, zie ik\.$/))) return geld && m[1] === vormVan(xs) && getal(xs) !== getal(d) ? null : "klopt niet met wat het kind koos";
  /* De knoop. */
  if (/^(Een knoop heeft gaatjes|Maar een knoop heeft gaatjes|Daar zitten gaatjes in|Met een knoop kun je niet betalen|Daar kun je niet mee betalen|Die heeft gaatjes, een munt niet|Een knoop is geen geld|Een knoop zit aan je jas|Het is geen geld|Met een knoop kun je niets kopen)\.$/.test(z)) return !geld ? null : "gaat over een knoop";
  if (/^Hier niet\.$/.test(z)) return !geld && v.soort === "wat" ? null : "klopt niet";
  /* De zwevende munten. */
  if (/^Die zoeken we niet\.$/.test(z)) return v.soort === "bellen" && x !== d ? null : "klopt niet";
  if (/^(Je tikte weer op een andere munt|Weer een andere munt, zie ik)\.$/.test(z)) return v.soort === "bellen" && geld && !isBriefje(xs) && xs !== d ? null : "klopt niet";
  if ((m = z.match(/^Op de munten die we zoeken staat een (\d+)\.$/)) || (m = z.match(/^We zoeken alleen de munten met een (\d+) erop\.$/))) return v.soort === "bellen" && Number(m[1]) === getal(d) ? null : "klopt niet";
  if ((m = z.match(/^Tik alleen op munten met een (\d+) erop\.$/)) || (m = z.match(/^Zoek de munten met een (\d+)(?: erop)?\.$/)) || (m = z.match(/^Tik op de munten met een (\d+)\.$/))) return v.soort === "bellen" && Number(m[1]) === getal(d) ? null : "klopt niet";
  if (/^Die zijn zilver in het midden\.$/.test(z)) return v.soort === "bellen" && FEIT.midden[d] === "zilver" ? null : "klopt niet";
  if (/^Tik ze aan\.$/.test(z)) return v.soort === "bellen" ? null : "klopt niet";
  /* Wat altijd waar is over munten en briefjes (uitleg). */
  if (/^(Een munt is rond|Een munt is rond en van metaal|Een briefje is een rechthoek|Een briefje is van papier, met 4 hoeken|Een briefje is een rechthoek van papier|Een briefje is van papier|Munten zijn rond en van metaal|Briefjes zijn van papier|Munten zijn rond, briefjes niet|Briefjes zijn rechthoeken, munten niet|Een briefje niet|Een munt niet|Geld dat rond is, is een munt|Geld van papier is een briefje|Een briefje is niet rond|Een munt is niet van papier)\.$/.test(z)) return null;
  if (/^(Het getal op het geld zegt hoeveel het waard is|Elk geld heeft een eigen getal|Op geld staat altijd een getal|Zo weet je hoeveel het is|Een 0 erachter maakt het getal groter|Elk cijfer hoort bij het getal, ook de 0|Ook de 0 hoort bij het getal|Met een 0 erachter is het een ander getal|Een 0 erachter maakt een ander getal|Een getal kan meer cijfers hebben|Lees ze allemaal|Kijk naar alle cijfers van het getal|Kijk naar de vorm)\.$/.test(z)) return null;
  if (/^Het getal op een (munt zegt hoeveel hij waard is|briefje zegt hoeveel euro het is)\.$/.test(z)) return null;
  if (/^De munt van 1 euro is zilver in het midden\.$/.test(z)) return FEIT.midden.m1 === "zilver" && !isBriefje(d) ? null : "klopt niet";
  if (/^Die van 2 euro is goud\.$/.test(z)) return FEIT.midden.m2 === "goud" && !isBriefje(d) ? null : "klopt niet";
  if (/^(Elk briefje heeft een eigen kleur en een eigen getal|Niet elk briefje is evenveel waard)\.$/.test(z)) return isBriefje(d) ? null : "het gaat hier niet om briefjes";
  if (/^Niet elke munt is evenveel waard\.$/.test(z)) return !isBriefje(d) ? null : "het gaat hier niet om munten";
  /* Hints bij "Waar zie je …?" (hoe je zoekt, waar je kijkt). */
  if (/^We zoeken een munt\.$/.test(z)) return !isBriefje(d) ? null : "we zoeken geen munt";
  if (/^We zoeken een briefje\.$/.test(z)) return isBriefje(d) ? null : "we zoeken geen briefje";
  if (/^(Kijk naar het getal op elke munt|Lees het getal op de munten|Op elke munt staat een getal|Lees het getal op elke munt)\.$/.test(z)) return munten >= 2 ? null : "er liggen geen 2 munten";
  if (/^(Kijk naar het getal op elk briefje|Lees het getal op de briefjes|Lees het hele getal op elk briefje|Op elk briefje staat een getal)\.$/.test(z)) return briefjes >= 2 ? null : "er liggen geen 2 briefjes";
  if (/^Lees ze maar\.$/.test(z)) return munten + briefjes >= 2 ? null : "er ligt maar 1 ding";
  /* Hints bij "Wat is dit?" (1 geld in beeld). */
  if (/^(Dit geld is een rechthoek van papier: een briefje|Kijk naar de vorm: dit is een briefje|Dit geld is niet rond|Het is een briefje|Dit geld is een rechthoek, geen rondje|Dit geld is van papier|Het is geen munt)\.$/.test(z)) return v.soort === "wat" && isBriefje(d) ? null : "dit geld is geen briefje";
  if (/^(Lees het getal erop|Lees ook het getal|Lees het maar)\.$/.test(z)) return v.soort === "wat" ? null : "past niet bij het geld in beeld";
  if (/^(Lees het getal op dit briefje|Lees het hele getal op dit briefje|Kijk naar alle cijfers op dit briefje|Kijk naar de kleur van dit briefje|Tel de cijfers op dit briefje|Welke kleur heeft dit briefje\?)$/.test(z.replace(/\.$/, ""))) return v.soort === "wat" && isBriefje(d) ? null : "dit geld is geen briefje";
  if (/^(Kijk naar het midden van deze munt|Lees het getal op deze munt|Kijk welk getal er op deze munt staat|Welke kleur heeft het midden van deze munt\?|Op deze munt staat een getal|Dit is geld: een munt|Dit is een munt|Er staat een getal op|Op een munt staat een getal|Dit geld is rond: het is een munt|Dit geld is rond, geen rechthoek|Dit geld is rond|Het is geen briefje)$/.test(z.replace(/\.$/, ""))) return v.soort === "wat" && !isBriefje(d) ? null : "dit geld is geen munt";
  return `onbekende zin (niet na te lopen): "${z}"`;
};

/* 3. Keuring van elke zin en elk stuk. */
const woorden = (z: string) => z.split(/\s+/).filter(Boolean).length;
const dubbelGetal = (z: string) => {
  const n = getallenIn(z);
  return n.find((x, i) => n.indexOf(x) !== i);
};
const OPDRACHT = /(^|[.!?:] )(Tik|Zoek|Kies|Lees|Kijk|Tel|Sleep|Wijs)\b/;
/** Staat er een vraag of een opdracht die zegt wat het kind doet (15.37, F16)? "Kijk" en "Lees" alleen zijn geen opdracht. */
const isVraagOfOpdracht = (z: string) => /\?/.test(z) || /(^|[.!?:] )(?:Nu jij! )?(Tik|Zoek|Kies)\b/.test(kaal(z));
/** Algemene keuring van 1 stuk (elke variant, elke soort). */
const keurStuk = (waar: string, z: string, o: { vraag?: boolean } = {}) => {
  const k = kaal(z);
  if (/\bfout(en|je)?\b/i.test(k)) fouten.push(`${waar}: het woord "fout" ("${k}")`);
  if (/vinkje/i.test(k)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die zin weg, 15.37) ("${k}")`);
  if (!o.vraag && dubbelGetal(z) !== undefined) fouten.push(`${waar}: het getal ${dubbelGetal(z)} staat er 2 keer ("${k}")`);
  if (zinnenVan(z).length > 3) fouten.push(`${waar}: meer dan 3 zinnen in 1 stuk ("${k}")`);
  for (const d of zinnenVan(z)) if (woorden(d) > 14) fouten.push(`${waar}: zin van ${woorden(d)} woorden ("${d}")`);
  if (k.length > MAX_STUK) fouten.push(`${waar}: ${k.length} tekens, past niet in het tekstvak (hooguit ${MAX_STUK}) ("${k}")`);
  /* Elk getal heeft een kleur of wit (14.20): geen kaal cijfer. */
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${waar}: getal zonder kleur (14.20) ("${z}")`);
};
const genoeg = (waar: string, lijst: readonly string[], n: number) => {
  if (lijst.length < n) fouten.push(`${waar}: ${lijst.length} varianten, ${n} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
};

const verklap = (v: Vraag, a: string, f: Fout): string[] => {
  const uit: string[] = [];
  const d = doelVan(v);
  const x = naamX(v, a);
  if (f.code !== "onduidelijk" && !f.v.eerste.length) uit.push("geen eerste zin");
  if (!f.v.hint.length) uit.push("geen hint");
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint]) {
    if (/tussen .* en /i.test(kaal(z))) uit.push(`"tussen … en …" in eerste zin of hint ("${kaal(z)}")`);
    /* Het goede antwoord niet genoemd (bij de zwevende munten noemt de opdracht zelf al "1 euro"). */
    if (v.soort !== "bellen" && getallenIn(z).includes(getal(d))) uit.push(`de eerste zin of hint noemt het getal van het antwoord (${getal(d)}) ("${kaal(z)}")`);
    if (v.soort === "wat" && kaal(z).includes(goedVan(v))) uit.push(`de eerste zin of hint noemt het antwoord ("${kaal(z)}")`);
    /* Kleur verklapt niets: het getal dat het kind zoekt is wit (14.22). */
    if (new RegExp(`\\{${getal(d)}:(?!wit)`).test(z)) uit.push(`het gezochte getal heeft een kleur ("${z}")`);
  }
  /* Bij kiezen eindigt geen hint met een vraag (de vraag komt er meteen achteraan, 3.23); bij de zwevende munten is de hint de nieuwe opdracht. */
  for (const z of f.v.hint) {
    if (v.soort !== "bellen" && /\?\s*$/.test(z)) uit.push(`de hint eindigt met een vraag ("${kaal(z)}")`);
    if (v.soort === "bellen" && !isVraagOfOpdracht(z)) uit.push(`de hint is geen opdracht (15.37) ("${kaal(z)}")`);
  }
  /* Het rondje staat nooit om het antwoord. */
  if (f.rondje === "gekozen" && a === d) uit.push("rondje om het antwoord");
  if (!f.over.includes(d)) uit.push("het goede antwoord valt weg na de hint (de hint klopt niet)");
  if (f.over.length < 2) uit.push(`na de eerste zin en de hint blijft alleen ${f.over.join("")} over`);
  /* De zinnen bij de 2e keer zijn uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg]) for (const d1 of zinnenVan(z)) if (OPDRACHT.test(d1)) uit.push(`opdracht in de uitleg bij de 2e keer: "${d1}"`);
  for (const z of f.v.weerEerste) if (!/\bweer\b/i.test(z)) uit.push(`"weer" ontbreekt ("${kaal(z)}")`);
  /* Genoeg varianten. */
  if (f.code !== "onduidelijk") {
    genoeg("eerste zin", f.v.eerste, 3);
    genoeg("uitleg", f.v.uitleg, 3);
    if (f.v.weerEerste.length) {
      genoeg('"weer"', f.v.weerEerste, 2);
      genoeg('uitleg bij "weer"', f.v.weerUitleg, 2);
    }
  }
  genoeg("hint", f.v.hint, 3);
  /* Bij elke eerste zin passen minstens 2 hints en 2 uitleggen die geen getal en geen stuk herhalen (dan hoeft de kiezer nooit te wijken). */
  for (const e of [...f.v.eerste, nuKoos(f.v.eerste[0])]) {
    if (new Set(f.v.hint.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 hints zonder herhaling`);
    if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  }
  for (const e of ZIN.weerGekozen(x, v)) if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  for (const e of f.v.weerEerste) if (new Set(f.v.weerUitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  /* Past in het tekstvak (harde eis): bij elke hint passen minstens 2 versies van de vraag erachter, zonder herhaald getal. */
  if (v.soort !== "bellen")
    for (const h of f.v.hint) {
      const op = (v.soort === "waar" ? ZIN.opnieuwWaar(v) : ZIN.opnieuwWat(v)).filter((z) => kaal(`${h} ${z}`).length <= MAX_STUK);
      if (op.length < 2) uit.push(`bij de hint "${kaal(h)}" passen minder dan 2 versies van de vraag in het tekstvak`);
      for (const z of op) if (deeltGetal(h, z)) uit.push(`de hint en de vraag erachter noemen hetzelfde getal ("${kaal(`${h} ${z}`)}")`);
    }
  /* Waarheid: elke losse zin van elke variant. */
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg, ...ZIN.weerGekozen(x, v)])
    for (const d1 of zinnenVan(z)) {
      beweringen++;
      const r = /^(Je koos weer|Je tikte weer op|Weer|Dat is weer) (de knoop|(?:de|het) (?:munt|briefje) van \d+ (?:euro|cent)|\d+ (?:euro|cent))(, zie ik)?\.$/.test(d1) ? weerKlopt(v, x, d1) : bekend(v, x, d1);
      if (r) uit.push(`waarheidscontrole: ${r} ("${d1}")`);
    }
  return uit;
};
/** "Je koos weer de munt van 2 euro.": noemt precies wat het kind (weer) koos. */
function weerKlopt(v: Vraag, x: Ding, z: string): string | null {
  if (/knoop/.test(z)) return x === "knoop" ? null : "zegt knoop";
  if (x === "knoop") return "het kind koos de knoop";
  const m = z.match(/(?:(munt|briefje) van )?(\d+) (euro|cent)/)!;
  if (Number(m[2]) !== getal(x) || m[3] !== eenheid(x) || (m[1] && m[1] !== vormVan(x))) return "noemt niet wat het kind koos";
  if ((v.soort === "wat") !== !m[1]) return "bij 'Wat is dit?' koos het kind een knop, geen geld in beeld";
  return null;
}

let telling = 0;
let beweringen = 0;
let variantenTeller = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const d = doelVan(v);
  const nodig = keuzes(v).filter((k) => k !== goedVan(v)).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    if (!DENKFOUTEN.includes(f.code)) fouten.push(`${v.id} ${a}: onbekende denkfout ${f.code}`);
    for (const r of verklap(v, a, f)) fouten.push(`${v.id} ${a}: ${r}`);
    for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg, ...ZIN.weerGekozen(naamX(v, a), v)]) {
      variantenTeller++;
      keurStuk(`${v.id} ${a}`, z);
    }
    genoeg(`${v.id} ${a}: hetzelfde antwoord 2 keer`, ZIN.weerGekozen(naamX(v, a), v), 3);
    for (const z of ZIN.weerGekozen(naamX(v, a), v)) if (!/\bweer\b/i.test(z)) fouten.push(`${v.id} ${a}: "weer" ontbreekt ("${kaal(z)}")`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    for (const h of f.v.hint) hintsPerCode.get(f.code)!.add(kaal(h));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* De vraag zelf: het gezochte getal is wit (14.22), en het is een vraag of opdracht (15.36, 15.37). */
  const vraagStukken = v.soort === "waar" ? [ZIN.waarVraag(v, true).join(" "), ZIN.waarVraag(v, false).join(" ")] : v.soort === "wat" ? [ZIN.watVraag(v).join(" ")] : [...ZIN.bellenIntro(v), ...ZIN.bellenOpdracht(v)];
  for (const vraag of vraagStukken) {
    if (new RegExp(`\\{${getal(d)}:(?!wit)`).test(vraag)) fouten.push(`${v.id}: het gezochte getal heeft een kleur in de vraag (verklapt, 14.22)`);
    keurStuk(`${v.id} vraag`, vraag, { vraag: v.soort === "wat" });
  }
  /* Alles waarbij de les op het kind wacht: een vraag of een opdracht (F16). */
  const wacht: [string, readonly string[]][] =
    v.soort === "waar"
      ? [["vraag", [ZIN.waarVraag(v, true).join(" "), ZIN.waarVraag(v, false).join(" ")]], ["opnieuw", ZIN.opnieuwWaar(v)], ["samen: nu jij", ZIN.samenWaarJij(d)], ["hulphandje", ZIN.samenWaarHand]]
      : v.soort === "wat"
        ? [["vraag", [ZIN.watVraag(v).join(" ")]], ["opnieuw", ZIN.opnieuwWat(v)], ["samen: nu jij", ZIN.samenWatJij(d)], ["hulphandje", ZIN.samenWatHand(d)]]
        : [["opdracht", ZIN.bellenOpdracht(v)], ["hulphandje", ZIN.bellenHand(v)], ["samen: nu jij", ZIN.samenBelJij], ["hulphandje samen", ZIN.samenBelHand]];
  for (const [naam, lijst] of wacht)
    for (const z of lijst) {
      keurStuk(`${v.id} ${naam}`, z, { vraag: v.soort === "wat" && naam === "vraag" });
      if (!isVraagOfOpdracht(z)) fouten.push(`${v.id} ${naam}: geen vraag en geen opdracht (15.37) ("${kaal(z)}")`);
    }
  /* Varianten van het verloop per vraag. */
  const verloop: [string, readonly string[], number][] =
    v.soort === "waar"
      ? [["opnieuw", ZIN.opnieuwWaar(v), 3], ["samen", ZIN.samen(v), 5], ["samenWaar", ZIN.samenWaar(d), 3], ["samenWaarJij", ZIN.samenWaarJij(d), 2], ["samenWaarHand", ZIN.samenWaarHand, 2], ["samenWaarKlaar", ZIN.samenWaarKlaar(d), 3], ["samenWaarZelf", ZIN.samenWaarZelf(d), 2]]
      : v.soort === "wat"
        ? [["opnieuw", ZIN.opnieuwWat(v), 3], ["samen", ZIN.samen(v), 5], ["samenWatVorm", ZIN.samenWatVorm(d), 3], ["samenWatGetal", ZIN.samenWatGetal(d), 3], ["samenWatJij", ZIN.samenWatJij(d), 2], ["samenWatHand", ZIN.samenWatHand(d), 2], ["samenWatKlaar", ZIN.samenWatKlaar(d), 3], ["samenWatZelf", ZIN.samenWatZelf(d), 2]]
        : [["bellenIntro", ZIN.bellenIntro(v), 2], ["bellenOpdracht", ZIN.bellenOpdracht(v), 2], ["bellenHand", ZIN.bellenHand(v), 2], ["samen", ZIN.samen(v), 5], ["samenBelEen", ZIN.samenBelEen, 3], ["samenBelNog", ZIN.samenBelNog, 3], ["samenBelJij", ZIN.samenBelJij, 3], ["samenBelHand", ZIN.samenBelHand, 2], ["samenBelKlaar", ZIN.samenBelKlaar(3), 3], ["samenBelZelf", ZIN.samenBelZelf, 2]];
  for (const [naam, lijst, n] of verloop) {
    genoeg(`${v.id} ${naam}`, lijst, n);
    for (const z of lijst) {
      variantenTeller++;
      keurStuk(`${v.id} ${naam}`, z);
    }
  }
  /* De zinnen bij het samen voordoen kloppen (11.9). */
  const samenZinnen = v.soort === "waar" ? [...ZIN.samenWaar(d), ...ZIN.samenWaarKlaar(d), ...ZIN.samenWaarZelf(d)] : v.soort === "wat" ? [...ZIN.samenWatVorm(d), ...ZIN.samenWatGetal(d), ...ZIN.samenWatKlaar(d), ...ZIN.samenWatZelf(d)] : [...ZIN.samenBelKlaar(3), ...ZIN.samenBelZelf, ...ZIN.samenBelEen];
  for (const z of samenZinnen.map(kaal)) {
    if (v.soort !== "bellen" && !getallenIn(z).every((n) => n === getal(d) || n === 4)) fouten.push(`${v.id}: samen-zin met een ander getal: "${z}"`);
    if (/\b4 hoeken\b/.test(z) && !isBriefje(d)) fouten.push(`${v.id}: samen-zin zegt 4 hoeken bij een munt: "${z}"`);
    if (/rechthoek|papier|\bbriefje\b|\bhet aan\b/.test(z) && !isBriefje(d)) fouten.push(`${v.id}: samen-zin zegt briefje bij een munt: "${z}"`);
    if (/\brond\b|\bmunt\b|\bhem aan\b|\bhij\b/.test(z) && isBriefje(d)) fouten.push(`${v.id}: samen-zin zegt munt bij een briefje: "${z}"`);
    if (v.soort !== "bellen" && /euro|cent/.test(z) && !new RegExp(`\\b${getal(d)} ${eenheid(d)}|Zoveel ${eenheid(d)}`).test(z)) fouten.push(`${v.id}: samen-zin met het verkeerde bedrag: "${z}"`);
  }
  /* Na het vangnet geen "Ja" alsof het kind het deed (keuring Meer-minder); de test zoekt "Kijk, ". */
  for (const z of v.soort === "waar" ? ZIN.samenWaarZelf(d) : v.soort === "wat" ? ZIN.samenWatZelf(d) : ZIN.samenBelZelf) if (!/^Kijk, /.test(z)) fouten.push(`${v.id}: de zin na het vangnet begint niet met "Kijk, " ("${kaal(z)}")`);
  /* De reactie na lof noemt alleen het geld van deze vraag. */
  const reactie = geldReactie(v);
  genoeg(`${v.id} reactie na lof`, reactie.zinnen, 7);
  for (const z of reactie.zinnen) {
    keurStuk(`${v.id} reactie na lof`, z);
    if (v.soort !== "bellen" && !getallenIn(z).every((n) => n === getal(d))) fouten.push(`${v.id}: een reactie bij goed noemt een ander getal ("${kaal(z)}")`);
    if (v.soort !== "bellen" && /euro|cent/.test(z) && !z.includes(eenheid(d))) fouten.push(`${v.id}: een reactie bij goed noemt de verkeerde eenheid ("${kaal(z)}")`);
    if (/\bmunt\b|\brond\b/.test(z) && v.soort !== "bellen" && isBriefje(d)) fouten.push(`${v.id}: een reactie bij goed zegt munt bij een briefje ("${kaal(z)}")`);
    if (/briefje|papier/.test(z) && !isBriefje(d)) fouten.push(`${v.id}: een reactie bij goed zegt briefje bij een munt ("${kaal(z)}")`);
  }
}
/* De vaste zinnen van het verloop: genoeg varianten, elk stuk gekeurd. */
const VAST: [string, readonly string[], number][] = [
  ["begin", ZIN.start, 3], ["terug (1)", ZIN.terug1, 3], ["terug (meer)", ZIN.terugN(3), 3], ["extra (1)", ZIN.extra1, 2], ["extra (meer)", ZIN.extraN(3), 2], ["later nog eens", ZIN.terugLastig, 2], ["slot", ZIN.slot, 3], ["bij de kaart", ZIN.kaartTik, 3], ["aanmoediging", AANMOEDIG_TIKKEN, 5],
];
for (const [naam, lijst, n] of VAST) {
  genoeg(naam, lijst, n);
  for (const z of lijst) {
    variantenTeller++;
    keurStuk(naam, z);
  }
}
/* Het begin (met de groet in 1 stuk) is nooit langer dan de zin die Sara goedkeurde: die paste in het tekstvak (15.30). */
for (const z of ZIN.start) if (z.length > ZIN.start[0].length) fouten.push(`begin: langer dan de goedgekeurde beginzin, past niet met de groet in het tekstvak ("${z}")`);
void NAAM_GROET;
/* Het hulphandje: aanmoediging + opdracht in 1 stuk; het einde: eindzin + "Tik op de kaart." in 1 stuk. */
for (const a of AANMOEDIG_TIKKEN) for (const h of [...ZIN.samenWaarHand, ...ZIN.samenWatHand("b100"), ...ZIN.samenBelHand, ...ZIN.bellenHand(VRAGEN[7] as never)]) keurStuk("hulphandje", `${a} ${h}`);
for (const e of [...EINDE.zinnen, EINDE_VEEL_FOUTEN]) for (const k of ZIN.kaartTik) if (kaal(`${e} ${k}`).length > MAX_STUK) fouten.push(`einde: "${e} ${k}" past niet in het tekstvak`);
for (const k of ZIN.kaartTik) if (!isVraagOfOpdracht(k)) fouten.push(`bij de kaart: geen opdracht ("${k}")`);

/* Afwisseling (5.10): elke denkfout heeft minstens 3 hints. */
for (const [code, n] of aantalPerCode) if ((hintsPerCode.get(code)?.size ?? 0) < 3) fouten.push(`denkfout ${code}: ${n} keer, maar minder dan 3 hints`);

/*
  4. De kiezer naspelen (18 nov 2026): 20.000 vragen met willekeurige antwoorden die niet goed zijn, met precies de keuze
  van de les (`foutStuk`, `opnieuwZin`, dezelfde sleutels). Nooit 2 keer achter elkaar dezelfde zin binnen 1 situatie; de
  2e keer nooit dezelfde eerste zin als de 1e keer; geen zin 2 keer in 1 reactie; de hint herhaalt geen getal en geen stuk
  uit de eerste zin; "weer" alleen als het klopt; elk stuk past in het tekstvak.
*/
{
  let zaad = 12345;
  const toeval = () => ((zaad = (zaad * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const K = maakKiezer({ wissel: WISSEL, toeval });
  const vorige = new Map<string, string>();
  const tel = { dubbel: 0, herhaald: 0, zelfdeEerste: 0, inReactie: 0, weer: 0, lang: 0, geenOpdracht: 0, reacties: 0 };
  const voorbeelden: string[] = [];
  const meld = (soort: keyof typeof tel, tekst: string) => {
    tel[soort]++;
    if (voorbeelden.length < 8) voorbeelden.push(`${soort}: ${tekst}`);
  };
  const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = K.kies(sleutel, zinnen, mag);
    if (vorige.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) meld("dubbel", `${sleutel}: 2 keer "${kaal(z)}"`);
    vorige.set(sleutel, vorm(z));
    if (kaal(z).length > MAX_STUK) meld("lang", kaal(z));
    return z;
  };
  const pak = <T,>(l: T[]) => l[Math.floor(toeval() * l.length)];
  const hand = (sleutel: string, lijst: readonly string[]) => {
    const z = `${variant("aanmoedig", AANMOEDIG_TIKKEN)} ${variant(sleutel, lijst)}`;
    if (kaal(z).length > MAX_STUK) meld("lang", kaal(z));
    if (!isVraagOfOpdracht(z)) meld("geenOpdracht", kaal(z));
  };
  variant("start", ZIN.start);
  for (let i = 0; i < 20000; i++) {
    const v = pak(VRAGEN);
    const d = doelVan(v);
    const tabel = foutenVan(v);
    const antwoorden = Object.keys(tabel);
    if (v.soort === "bellen") {
      variant("bellenIntro", ZIN.bellenIntro(v));
      const op = variant("bellenOpdracht", ZIN.bellenOpdracht(v));
      if (!isVraagOfOpdracht(op)) meld("geenOpdracht", kaal(op));
      if (toeval() < 0.3) hand("bellenHand", ZIN.bellenHand(v));
    }
    if (toeval() < 0.15) continue; /* meteen goed */
    const a1 = pak(antwoorden);
    const f1 = tabel[a1];
    const o = (a: string, zelfde: boolean) => ({ x: naamX(v, a), zelfdeAntwoord: zelfde, onduidelijk: () => "Die is lastig, hè." });
    const s1 = foutStuk(variant, f1, v, 1, null, o(a1, false));
    tel.reacties++;
    if (!pastNa(s1[0])(s1[1])) meld("herhaald", `"${kaal(s1.join(" "))}"`);
    if (/\bweer\b/i.test(s1[0])) meld("weer", `"weer" bij de 1e keer: "${kaal(s1[0])}"`);
    if (v.soort === "bellen") {
      if (!isVraagOfOpdracht(s1[1])) meld("geenOpdracht", kaal(s1[1]));
    } else {
      const op = opnieuwZin(variant, v as Waarvraag | Watvraag, s1[1]);
      const stuk = `${s1[1]} ${op}`;
      if (kaal(stuk).length > MAX_STUK) meld("lang", kaal(stuk));
      if (!isVraagOfOpdracht(op)) meld("geenOpdracht", kaal(stuk));
      if (deeltGetal(s1[1], op)) meld("herhaald", `"${kaal(stuk)}"`);
    }
    if (toeval() < 0.3) continue; /* de 2e keer goed */
    const a2 = toeval() < 0.4 ? a1 : pak(antwoorden);
    const f2 = tabel[a2];
    const s2 = foutStuk(variant, f2, v, 2, f1, o(a2, a2 === a1));
    tel.reacties++;
    if (!pastNa(s2[0])(s2[1])) meld("herhaald", `"${kaal(s2.join(" "))}"`);
    if (vorm(s2[0]) === vorm(s1[0])) meld("zelfdeEerste", `"${kaal(s1[0])}" en daarna "${kaal(s2[0])}"`);
    if (vorm(s2[0]) === vorm(s2[1]) || vorm(s1[0]) === vorm(s1[1])) meld("inReactie", kaal(s2.join(" ")));
    if (/\bweer\b/i.test(s2[0]) && !(a2 === a1 || f1.soort === f2.soort)) meld("weer", `"weer" uit het niets: "${kaal(s2[0])}"`);
    /* Samen voordoen: dezelfde sleutels als de les. */
    const sm = variant("samen", ZIN.samen(v));
    if (vorm(sm) === vorm(s2[0])) meld("inReactie", kaal(sm));
    const zelf = toeval() < 0.1;
    if (v.soort === "waar") {
      variant("samenWaar", ZIN.samenWaar(d));
      const jij = variant("samenJij", ZIN.samenWaarJij(d));
      if (!isVraagOfOpdracht(jij)) meld("geenOpdracht", kaal(jij));
      if (toeval() < 0.3) hand("samenHand", ZIN.samenWaarHand);
      variant(zelf ? "samenZelf" : "samenKlaar", zelf ? ZIN.samenWaarZelf(d) : ZIN.samenWaarKlaar(d));
    } else if (v.soort === "wat") {
      const a = variant("samenWatVorm", ZIN.samenWatVorm(d));
      const b = variant("samenWatGetal", ZIN.samenWatGetal(d));
      if (deeltGetal(a, b)) meld("herhaald", `"${kaal(a)}" en "${kaal(b)}"`);
      const jij = variant("samenJij", ZIN.samenWatJij(d));
      if (!isVraagOfOpdracht(jij)) meld("geenOpdracht", kaal(jij));
      if (deeltGetal(b, jij)) meld("herhaald", `"${kaal(b)}" en "${kaal(jij)}"`);
      if (toeval() < 0.3) hand("samenHand", ZIN.samenWatHand(d));
      variant(zelf ? "samenZelf" : "samenKlaar", zelf ? ZIN.samenWatZelf(d) : ZIN.samenWatKlaar(d));
    } else {
      variant("samenBelEen", ZIN.samenBelEen);
      if (toeval() < 0.6) variant("samenBelNog", ZIN.samenBelNog);
      const jij = variant("samenJij", ZIN.samenBelJij);
      if (!isVraagOfOpdracht(jij)) meld("geenOpdracht", kaal(jij));
      if (toeval() < 0.3) hand("samenHand", ZIN.samenBelHand);
      variant(zelf ? "samenZelf" : "samenKlaar", zelf ? ZIN.samenBelZelf : ZIN.samenBelKlaar(3));
    }
    if (i % 12 === 0) {
      variant("terug", pak([ZIN.terug1, ZIN.terugN(2), ZIN.terugN(3), ZIN.extra1, ZIN.extraN(3)]));
      variant("terugLastig", ZIN.terugLastig);
      variant("slot", ZIN.slot);
      variant("kaartTik", ZIN.kaartTik);
    }
  }
  const mis = tel.dubbel + tel.herhaald + tel.zelfdeEerste + tel.inReactie + tel.weer + tel.lang + tel.geenOpdracht;
  if (mis)
    fouten.push(
      `kiezer nagespeeld: ${tel.dubbel} keer 2 keer achter elkaar dezelfde zin, ${tel.herhaald} keer een getal of stuk herhaald, ${tel.zelfdeEerste} keer dezelfde eerste zin bij de 1e en 2e keer, ${tel.inReactie} keer dezelfde zin 2 keer in 1 reactie, ${tel.weer} keer "weer" dat niet klopt, ${tel.lang} keer te lang voor het tekstvak, ${tel.geenOpdracht} keer geen vraag of opdracht\n  ${voorbeelden.join("\n  ")}`,
    );
  else console.log(`Kiezer 20.000 keer nagespeeld (${tel.reacties} reacties): 0 keer 2 keer achter elkaar dezelfde zin, 0 keer een getal of stuk herhaald, 0 keer dezelfde eerste zin bij de 1e en 2e keer, 0 keer "weer" dat niet klopt, 0 keer te lang, altijd een vraag of opdracht.`);
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${variantenTeller} varianten gekeurd, ${beweringen} beweringen nagelopen).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 5. De tabel. */
const naamGeld = (x: Ding) => (x === "knoop" ? "knoop" : `${isBriefje(x) ? "briefje" : "munt"} van ${getal(x)} ${eenheid(x)}`);
const vraagNaam = (v: Vraag) =>
  v.soort === "waar" ? `${v.nr}. Waar zie je een ${naamGeld(v.doel)}? (${v.keuzes.map(naamGeld).join(" / ")})` : v.soort === "wat" ? `${v.nr}. Wat is dit? (${naamGeld(v.ding)}; knoppen ${v.opties.map(knop).join(" / ")})` : `${v.nr}. Zwevende munten: tik op alle munten van 1 euro (${v.bellen.map(naamGeld).join(", ")})`;
const rondjeTekst = (f: Fout) => (f.rondje === "gekozen" ? "rood rondje om het gekozen geld bij de eerste zin" : f.rondje === "geld" ? "rood rondje om het geld in beeld bij de hint" : "geen rondje");
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${v.soort === "wat" ? a : naamGeld(a as Ding)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm}; ${rondjeTekst(f)} |`),
).join("\n");
const samenZin = (v: Vraag) => {
  const d = doelVan(v);
  if (v.soort === "waar") return `Rondje om het goede kaartje: "${kaal(ZIN.samenWaar(d)[0])}" — "${kaal(ZIN.samenWaarJij(d)[0])}" (het kind tikt het aan; handje na ± 6 s) — "${kaal(ZIN.samenWaarKlaar(d)[0])}" (vangnet: "${kaal(ZIN.samenWaarZelf(d)[0])}")`;
  if (v.soort === "wat") return `Rondje om het geld: "${kaal(ZIN.samenWatVorm(d)[0])}" "${kaal(ZIN.samenWatGetal(d)[0])}" — "${kaal(ZIN.samenWatJij(d)[0])}" (het kind tikt het geld aan) — "${kaal(ZIN.samenWatKlaar(d)[0])}" (vangnet: "${kaal(ZIN.samenWatZelf(d)[0])}")`;
  return `Bliepo wijst de munten van 1 euro aan die nog niet gevonden zijn, 1 rondje tegelijk ("${kaal(ZIN.samenBelEen[0])}" "${kaal(ZIN.samenBelNog[0])}"); de laatste: "${kaal(ZIN.samenBelJij[0])}" (het kind tikt hem aan) — "${kaal(ZIN.samenBelKlaar(3)[0])}" (vangnet: "${kaal(ZIN.samenBelZelf[0])}")`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${v.soort === "wat" ? a : naamGeld(a as Ding)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (5 versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");

/* Alle varianten: per denkfout en soort vraag 1 voorbeeld (het eerste antwoord in de les met die denkfout), en de vaste zinnen. */
const lijst = (l: readonly string[]) => (l.length ? l.map(kaal).join(" / ") : "—");
const soortNaam = { waar: "Waar zie je …?", wat: "Wat is dit?", bellen: "zwevende munten" } as const;
const gezien = new Set<string>();
const variantRijen: string[] = [];
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const sleutel = `${v.soort}|${f.soort}|${a === "50 cent" ? "c50" : ""}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    variantRijen.push(`| ${soortNaam[v.soort]} — \`${f.code}\` — vraag ${v.nr}, antwoord ${v.soort === "wat" ? a : naamGeld(a as Ding)} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} | ${lijst(f.v.weerUitleg)} | ${lijst(ZIN.weerGekozen(naamX(v, a), v))} |`);
  }
const W1 = VRAGEN[0] as Waarvraag;
const W9 = VRAGEN[8] as Waarvraag;
const T4 = VRAGEN[3] as Watvraag;
const T6 = VRAGEN[5] as Watvraag;
const B8 = VRAGEN[7] as Extract<Vraag, { soort: "bellen" }>;
const vast: [string, readonly string[]][] = [
  ["Begin van de les (na de groet)", ZIN.start],
  ["Waar zie je …?: de vraag opnieuw na de hint", ZIN.opnieuwWaar(W1)],
  ["Wat is dit?: de vraag opnieuw na de hint", [...ZIN.opnieuwWat(T6), ...ZIN.opnieuwWat(T4)]],
  ["Zwevende munten: wat er gebeurt", ZIN.bellenIntro(B8)],
  ["Zwevende munten: de opdracht", ZIN.bellenOpdracht(B8)],
  ["Zwevende munten: het hulphandje", ZIN.bellenHand(B8)],
  ["Hulphandje: aanmoediging (komt voor de opdracht)", AANMOEDIG_TIKKEN],
  ["2e keer mis: samen (Waar zie je …? en zwevende munten)", ZIN.samen(W1)],
  ["2e keer mis: samen (Wat is dit?)", ZIN.samen(T6)],
  ["Samen, Waar zie je …?: Bliepo wijst de munt aan", ZIN.samenWaar("m1")],
  ["Samen, Waar zie je …?: Bliepo wijst het briefje aan", ZIN.samenWaar(W9.doel)],
  ["Samen, Waar zie je …?: nu het kind", [...ZIN.samenWaarJij("m1"), ZIN.samenWaarJij("b10")[1]]],
  ["Samen, Waar zie je …?: hulphandje", ZIN.samenWaarHand],
  ["Samen, Waar zie je …?: klaar", ZIN.samenWaarKlaar("m1")],
  ["Samen, Waar zie je …?: Bliepo deed het zelf (vangnet)", [...ZIN.samenWaarZelf("m1"), ZIN.samenWaarZelf("b10")[1]]],
  ["Samen, Wat is dit?: de vorm (munt)", ZIN.samenWatVorm("m1")],
  ["Samen, Wat is dit?: de vorm (briefje)", ZIN.samenWatVorm("b10")],
  ["Samen, Wat is dit?: het getal (munt)", ZIN.samenWatGetal("m1")],
  ["Samen, Wat is dit?: het getal (briefje)", ZIN.samenWatGetal("b10")],
  ["Samen, Wat is dit?: nu het kind", [...ZIN.samenWatJij("m1"), ...ZIN.samenWatJij("b10")]],
  ["Samen, Wat is dit?: hulphandje", [...ZIN.samenWatHand("m1"), ...ZIN.samenWatHand("b10")]],
  ["Samen, Wat is dit?: klaar", ZIN.samenWatKlaar("b10")],
  ["Samen, Wat is dit?: Bliepo deed het zelf (vangnet)", ZIN.samenWatZelf("b10")],
  ["Samen, zwevende munten: de eerste munt", ZIN.samenBelEen],
  ["Samen, zwevende munten: de volgende munt", ZIN.samenBelNog],
  ["Samen, zwevende munten: nu het kind", ZIN.samenBelJij],
  ["Samen, zwevende munten: hulphandje", ZIN.samenBelHand],
  ["Samen, zwevende munten: klaar", ZIN.samenBelKlaar(3)],
  ["Samen, zwevende munten: Bliepo deed het zelf (vangnet)", ZIN.samenBelZelf],
  ["Zin na lof: munt", geldReactie(W1).zinnen],
  ["Zin na lof: briefje", geldReactie(W9).zinnen],
  ["Zin na lof: zwevende munten", geldReactie(B8).zinnen],
  ["Vragen die terugkomen (na een vraag die niet meteen goed was)", [...ZIN.terug1, ...ZIN.terugN(3)]],
  ["Vragen die terugkomen (alles was meteen goed)", [...ZIN.extra1, ...ZIN.extraN(3)]],
  ["Na de vragen die terugkomen, als het weer niet lukte", ZIN.terugLastig],
  ["Slot", ZIN.slot],
  ["Bij de kaart", ZIN.kaartTik],
];
const vastRijen = vast.map(([naam, l]) => `| ${naam} | ${l.length} | ${lijst(l)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Geld (squla-geld-geldmachine-1-gouden, "Munten en briefjes")

Gemaakt op 11 november 2026, bijgewerkt op 18 november 2026 (warme zinnen in varianten, §4 en §5) **uit de code** met \`npx tsx scripts/fouttabel-geld-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-geld-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (12 vragen, het geld, de keuzes) is die van squla-geld-geldmachine-1 en blijft gelijk (BOUWREGELS 15.22). Daarna komen 3 vragen terug (zoals de oude les), met dezelfde fouttabel.

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over geld (KOPPELING.md §8). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: de vorm (munt of briefje), hetzelfde eerste cijfer (5 en 50, 10 en 100), een ander getal, of de knoop. Bliepo zegt alleen wat waar is over het geld dat het kind koos; hij verzint geen reden.

In de les staan de getallen in de kleur van het geld (munten geel, 5 grijs-wit, 10 rood, 20 blauw, 50 oranje, 100 groen). Het getal dat het kind zoekt is in de vraag en de hint wit (anders verklapt de kleur het antwoord, 14.22). Hier zonder kleur.

**Zo werkt het bij een antwoord dat niet goed is — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e keer:** Bliepo's scherm 1,5 seconde rood (geen geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos, met een rood rondje om dat geld zolang hij het noemt (bij "Wat is dit?" gaan de knoppen weg). Daarna komt de hint met de vraag erachter ("Waar zie je …?", "Wat is het?"), en tegelijk mag het kind opnieuw kiezen. Bij de zwevende munten is de hint de nieuwe opdracht. Zo staat er altijd een vraag of opdracht in beeld (15.37). Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin en de hint noemen het goede geld niet, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over. Het script rekent dat voor ELKE variant na en stopt bij een verklapper.
- **2e keer:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (5 versies) en dan samen voordoen (laatste kolom): nu staat het rondje om het goede geld, Bliepo zegt wat het is en waarom, en het kind tikt het aan (de kleine stap). Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (4e kolom).
- **Hetzelfde antwoord 2 keer:** de eerste zin wordt "Je koos weer …" (3 versies).
- **Een ander antwoord bij de 2e keer:** nooit dezelfde eerste zin als de 1e keer; 1 van de versies is "Nu koos je …" / "Nu tikte je op …".
- **Varianten (18 november 2026):** elke zin die terugkomt heeft een rijtje versies (§4 en §5). De les kiest met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen ("Je koos de munt van 2 euro." en "Je koos het briefje van 10 euro." tellen als dezelfde zin). In de tabellen van §2 en §3 staat steeds de eerste versie. Een getal klinkt nooit 2 keer in 1 stuk, en de hint herhaalt geen stuk uit de zin ervoor.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke keer wordt de naam van de denkfout bewaard, en elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk antwoord dat niet goed is (${telling} rijen; steeds de eerste versie)

| Vraag | Antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e keer: uitleg, anders uitleggen en samen voordoen (steeds de eerste versie)

| Vraag | Antwoord | Uitleg bij de 2e keer | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}

## 4. Alle varianten per denkfout (1 voorbeeld per soort vraag en denkfout; het script keurt ze bij elk antwoord)

| Soort vraag — denkfout — voorbeeld | Eerste zin | Hint (bij kiezen komt de vraag erachter) | Uitleg (2e keer) | "Weer" (2 keer dezelfde denkfout) | Uitleg bij "weer" | Hetzelfde antwoord 2 keer |
|---|---|---|---|---|---|---|
${variantRijen.join("\n")}

## 5. Alle varianten van de vaste zinnen

| Situatie | Aantal | Zinnen |
|---|---|---|
${vastRijen}
`;
writeFileSync(new URL("../FOUTTABEL-squla-geld-geldmachine-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-geld-geldmachine-1-gouden.md geschreven.");
