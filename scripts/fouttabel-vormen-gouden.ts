/**
 * Maakt FOUTTABEL-squla-vormen-patronen-1-gouden.md uit de code (squla-vormen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de INHOUDS-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17;
 * LESRECEPT "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld").
 *   npx tsx scripts/fouttabel-vormen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Sinds 18 november 2026 (warme juf, zoals Tellen en Getallenlijn) loopt het script ALLE varianten na, niet 1 vaste zin:
 *   - inhoud: dezelfde 15 vragen als squla-vormen-patronen-1; per keuzevraag precies 1 goede keuze die uit het patroon volgt;
 *   - waarheid: elke zin van elke variant (eerste zin, hint, uitleg, "weer") wordt nagelopen tegen het beeld van DEZE
 *     vraag; een zin die het script niet kent, telt als fout;
 *   - verklappen (15.17): geen eerste zin of hint noemt het goede antwoord, het rondje staat nooit om het antwoord, er
 *     blijven altijd minstens 2 keuzes over;
 *   - niets dubbel (15.29): geen getal en geen kraal, ding of vorm 2 keer in 1 stuk, en de hint noemt niet nog eens wat de
 *     eerste zin net noemde; 2 varianten van 1 rijtje zijn nooit dezelfde zin;
 *   - altijd een vraag of opdracht (15.37, F16): na elke hint komt een vraag of "Tik …"/"Sleep …"; elke opdracht zegt
 *     wat het kind doet; nooit het woord "vinkje" (dan laat het lesscherm de hele zin weg) en nooit "fout";
 *   - geen opdracht bij de 2e keer (daarna doet Bliepo het samen voor);
 *   - alles past in het tekstvak (hooguit MAX_STUK tekens per stuk);
 *   - nooit 2 keer hetzelfde: de kiezer wordt 20.000 keer nagespeeld met dezelfde functie als de les (foutReactie).
 */
import { writeFileSync } from "node:fs";
import { KLEURWOORD, type Kleur } from "../src/components/les/vlakken/squla-vormen-tekenen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import {
  AANMOEDIG,
  DENKFOUT_UITLEG,
  DENKFOUTEN,
  DING,
  MAX_STUK,
  PUZZEL_FOUT,
  VORM,
  VRAGEN,
  WISSELWOORDEN,
  ZIN,
  deeltDing,
  dingenIn,
  eindReeks,
  foutReactie,
  foutenVan,
  herhaal,
  kaal,
  lengte,
  naVan,
  namen,
  opnieuwNa,
  paarVoor,
  passend,
  patroonReactie,
  voorPlek,
  voorVan,
  zonderDingUit,
  type Fout,
  type Kettingvraag,
  type Keuzevraag,
  type Vraag,
} from "../src/components/les/lessen/squla-vormen-gouden-zinnen";

const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const fouten: string[] = [];
const vorm = maakVorm(WISSELWOORDEN);
/** Een vraag of een opdracht: een vraagteken, of een zin die begint met Tik, Sleep, Kies, Zet of Leg (15.37, F16). */
const OPDRACHT = /\?|(^|[.!?:] )(tik|sleep|kies|zet|leg)\b/i;
/** Een opdracht die het kind bij de 2e keer niet meer kan doen (daarna doet Bliepo het samen voor). */
const GEBIEDEND = /^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Leg|Kies|Begin)\b/;
let varianten = 0;
let combinaties = 0;
let beweringen = 0;

/* Woord → ding (kleur, ding of vorm), om zinnen terug te lezen. */
const KLEURVAN: Record<string, Kleur> = {};
for (const [k, [a, b]] of Object.entries(KLEURWOORD)) {
  KLEURVAN[a] = k as Kleur;
  KLEURVAN[b] = k as Kleur;
}
const DINGVAN: Record<string, string> = {};
for (const [k, [, enk]] of Object.entries(DING)) DINGVAN[enk] = k;
const VORMVAN: Record<string, string> = {};
for (const [k, w] of Object.entries(VORM)) VORMVAN[w![1]] = k;
/** "een rode kraal", "de banaan", "het groene vierkant", "rood", "De appel" → het ding in de vraag (of null). */
function lees(v: { wat: string }, t: string): string | null {
  const w = t.trim().toLowerCase().replace(/^(een|de|het) /, "");
  if (v.wat === "kraal") {
    const m = w.match(/^(\w+)(?: kraal)?$/);
    return m && KLEURVAN[m[1]] ? KLEURVAN[m[1]] : null;
  }
  if (v.wat === "ding") return DINGVAN[w] ?? null;
  const m = w.match(/^(?:\w+ )?(\w+)$/);
  return m ? (VORMVAN[m[1]] ?? null) : null;
}
/** "Die kleur" bij een kraal, "Die" bij een de-woord, "Dat" bij een het-woord. */
function dieKlopt(v: { wat: string }, die: string, x: string): boolean {
  if (v.wat === "kraal") return die === "Die kleur";
  const lw = v.wat === "ding" ? DING[x]?.[0] : VORM[x as never]?.[0];
  return die === (lw === "het" ? "Dat" : "Die");
}

/* 1. Inhoud (15.22, 14.30): zoals squla-vormen-patronen-1. */
if (VRAGEN.length !== 15) fouten.push(`${VRAGEN.length} vragen in plaats van 15 (squla-vormen-patronen-1)`);
const tel = (f: (v: Vraag) => boolean) => VRAGEN.filter(f).length;
if (tel((v) => v.soort === "keuze" && v.wat === "kraal") !== 7 || tel((v) => v.soort === "ketting") !== 3 || tel((v) => v.soort === "keuze" && v.wat === "ding") !== 3 || tel((v) => v.soort === "keuze" && v.wat === "vorm") !== 1 || tel((v) => v.soort === "puzzel") !== 1)
  fouten.push("niet 7 kralen kiezen, 3 kettingen, 3 keer de pijl, 1 vormenrij en 1 puzzel");
for (const v of VRAGEN) {
  if (v.soort === "keuze") {
    if (v.keuzes.filter((k) => k === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goede keuze`);
    if (new Set(v.keuzes).size !== v.keuzes.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk`);
    const vol = herhaal(v.eenheid, v.rij.length);
    if (v.rij.some((x, i) => x !== null && x !== vol[i])) fouten.push(`${v.id}: de rij is niet het patroon`);
    if (vol[v.plek] !== v.goed) fouten.push(`${v.id}: op de lege plek hoort niet ${v.goed}`);
    if (v.rij.filter((x) => x === null).length !== 1) fouten.push(`${v.id}: niet precies 1 lege plek`);
    for (const k of v.keuzes) if (k !== v.goed && vol[v.plek] === k) fouten.push(`${v.id}: ${k} past ook`);
  }
  if (v.soort === "ketting") {
    if ([...v.losse].sort().join() !== [...v.doel].sort().join()) fouten.push(`${v.id}: de losse kralen zijn niet de 3 die nodig zijn`);
    if (herhaal(v.eenheid, v.getoond + 3).slice(v.getoond).join() !== v.doel.join()) fouten.push(`${v.id}: het doel volgt niet uit het patroon`);
  }
}

/* 2. Waarheidscontrole. */
type C = { v: Keuzevraag | Kettingvraag; x: string; gelegd?: string[] };
const geenBuren = (u: string[]) => u.every((e, i) => u[(i + 1) % u.length] !== e);
/** Het paar: `x` komt in het patroon pas na `n` keer `voor`, en aan het eind ligt er nog minder. */
function paarKlopt(c: C, n: number, meer: string): boolean {
  const kv = c.v as Keuzevraag;
  const voor = voorPlek(kv);
  const laatste = voor.at(-1)!;
  return namen(kv.wat, kv.kleur).meer(laatste) === meer && n >= 2 && paarVoor(kv.eenheid, c.x, laatste) === n && eindReeks(voor) < n;
}
/** Is 1 zin waar in het beeld van deze vraag? null = waar; anders de reden. */
function waarZin(c: C, z: string): string | null {
  const { v, x } = c;
  let m: RegExpMatchArray | null;
  if (v.soort === "ketting") return waarKetting(c, z);
  const n = namen(v.wat, v.kleur);
  const voor = voorPlek(v);
  const gat = v.vorm === "gat";
  const links = gat ? v.rij[v.plek - 1] : null;
  const rechts = gat ? v.rij[v.plek + 1] : null;
  const L = gat ? links! : voor.at(-1)!;
  const plekW = v.wat === "ding" ? "de pijl" : "de lege plek";
  const reeks = gat ? 0 : eindReeks(voor);
  /* De eerste zin. */
  if ((m = z.match(/^Je koos (dezelfde kleur|hetzelfde) als (links|rechts) van (de lege plek|de pijl)\.$/))) return gat && m[3] === plekW && (m[1] === "dezelfde kleur") === (v.wat === "kraal") && x === (m[2] === "links" ? links : rechts) ? null : "klopt niet met de buur";
  if ((m = z.match(/^Je koos dezelfde kleur als de laatste (kraal|kralen)\.$/))) return !gat && v.wat === "kraal" && x === L && (m[1] === "kralen") === reeks >= 2 ? null : "klopt niet met het eind";
  if ((m = z.match(/^Je koos hetzelfde als aan het eind van de (ketting|rij)\.$/))) return !gat && v.wat !== "kraal" && x === L ? null : "klopt niet met het eind";
  if ((m = z.match(/^Je koos weer (.+)\.$/)) && lees(v, m[1])) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je tikte weer op (.+)\.$/))) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Weer (.+), zie ik\.$/)) && lees(v, m[1])) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos (?!weer )(.+)\.$/)) && lees(v, m[1])) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(.+)\?$/)) && lees(v, m[1])) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^(Die kleur|Die|Dat) ligt al aan het eind( van de (ketting|rij))?\.$/))) return !gat && dieKlopt(v, m[1], x) && x === L && reeks === 1 && (!m[3] || m[3] === (v.wat === "kraal" ? "ketting" : "rij")) ? null : "klopt niet met het eind";
  if ((m = z.match(/^(Die kleur|Die|Dat) ligt al (\d+) keer aan het eind\.$/))) return !gat && dieKlopt(v, m[1], x) && x === L && reeks === Number(m[2]) ? null : "klopt niet met het eind";
  if ((m = z.match(/^Daarvan liggen er al (\d+) aan het eind\.$/))) return !gat && x === L && reeks === Number(m[1]) && reeks >= 2 ? null : "klopt niet met het eind";
  if ((m = z.match(/^(Die kleur|Die|Dat) ligt al (links|rechts) van (de lege plek|de pijl)\.$/))) return gat && dieKlopt(v, m[1], x) && m[3] === plekW && x === (m[2] === "links" ? links : rechts) ? null : "klopt niet met de buur";
  if ((m = z.match(/^(Links|Rechts) van (de lege plek|de pijl) ligt al (dezelfde kleur|hetzelfde)\.$/))) return gat && m[2] === plekW && (m[3] === "dezelfde kleur") === (v.wat === "kraal") && x === (m[1] === "Links" ? links : rechts) ? null : "klopt niet met de buur";
  if ((m = z.match(/^(Die kleur|Die|Dat) komt nooit na (.+)\.$/))) return dieKlopt(v, m[1], x) && lees(v, m[2]) === L && !naVan(v.eenheid, L).has(x) ? null : "klopt niet: het kan wel na elkaar";
  if ((m = z.match(/^Na (.+) komt in dit patroon iets anders\.$/))) return lees(v, m[1]) === L && !naVan(v.eenheid, L).has(x) ? null : "klopt niet: het kan wel na elkaar";
  if ((m = z.match(/^Na (.+) komt in dit patroon nooit (.+)\.$/))) return lees(v, m[1]) === L && lees(v, m[2]) === x && !naVan(v.eenheid, L).has(x) ? null : "klopt niet: het kan wel na elkaar";
  if ((m = z.match(/^(Die kleur|Die|Dat) komt pas na (\d+) (.+)\.$/))) return dieKlopt(v, m[1], x) && paarKlopt(c, Number(m[2]), m[3]) ? null : "klopt niet met het patroon";
  if ((m = z.match(/^Daarvoor komen eerst (\d+) (.+)\.$/))) return paarKlopt(c, Number(m[1]), m[2]) ? null : "klopt niet met het patroon";
  if ((m = z.match(/^In dit patroon komt (.+) pas na (\d+) (.+)\.$/))) return lees(v, m[1]) === x && paarKlopt(c, Number(m[2]), m[3]) ? null : "klopt niet met het patroon";
  /* 19 nov 2026 (A16.5, 15.17): de eerste zin bij de paar-fout noemt de goede kleur niet meer. */
  if ((m = z.match(/^(?:Kijk|Tel) hoe vaak elke (kleur|vorm) achter elkaar komt\.$/))) return (m[1] === "kleur") === (v.wat === "kraal") && v.eenheid.some((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e) ? null : "er komt niets 2 keer achter elkaar";
  if ((m = z.match(/^In dit patroon komt (.+) hier nog niet\.$/))) return lees(v, m[1]) === x && naVan(v.eenheid, L).has(x) ? null : "klopt niet met het patroon";
  /* Uitleg. */
  if (/^(Een patroon gaat steeds in dezelfde volgorde|In een patroon komt steeds hetzelfde stukje terug|In een patroon blijft de volgorde steeds hetzelfde)\.$/.test(z)) return null;
  if (/^(Het patroon loopt ook door op de lege plek|Ook op de lege plek gaat het patroon gewoon verder|De lege plek hoort ook bij het patroon)\.$/.test(z)) return gat ? null : "geen lege plek in de rij";
  if ((m = z.match(/^(?:In deze (?:ketting|rij) komt|Hier komt) elke (kleur|vorm) (?:steeds )?(\d+) keer achter elkaar\.$/))) return v.eenheid.every((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e || v.eenheid[(i - 1 + v.eenheid.length) % v.eenheid.length] === e) && m[2] === "2" ? null : "niet elke kleur 2 keer";
  if ((m = z.match(/^(?:In deze (?:ketting|rij) komen sommige (kleuren|vormen)|Sommige (kleuren|vormen) komen steeds) (\d+) keer achter elkaar\.$/))) return ((m[1] ?? m[2]) === "kleuren") === (v.wat === "kraal") && v.eenheid.some((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e) && m[3] === "2" ? null : "klopt niet";
  if ((m = z.match(/^(?:Hier (?:komt|komen) (.+)|(.+) (?:komt|komen)) steeds (\d+) keer achter elkaar\.$/))) {
    const delen = (m[1] ?? m[2]).split(" en ").map((d) => lees(v, d));
    return delen.every((d) => d && v.eenheid.some((e, i) => e === d && v.eenheid[(i + 1) % v.eenheid.length] === d)) && m[3] === "2" ? null : "klopt niet";
  }
  /* "Weer" (2 keer dezelfde denkfout). */
  if ((m = z.match(/^Je koos weer hetzelfde als (aan het eind|ernaast)\.$/)) || (m = z.match(/^Weer (?:dezelfde kleur|hetzelfde) als (aan het eind|ernaast), zie ik\.$/))) return m[1] === "ernaast" ? (gat && (x === links || x === rechts) ? null : "klopt niet") : !gat && x === L ? null : "klopt niet";
  if ((m = z.match(/^Je koos weer iets dat niet na (.+) komt\.$/)) || (m = z.match(/^Ook dat komt niet na (.+)\.$/))) return lees(v, m[1]) === L && !naVan(v.eenheid, L).has(x) ? null : "klopt niet";
  if ((m = z.match(/^Na (.+) komt in dit patroon steeds (iets anders|een andere kleur)\.$/))) {
    const a = lees(v, m[1]);
    return a && !naVan(v.eenheid, a).has(a) ? null : "klopt niet";
  }
  if ((m = z.match(/^Voor (.+) komt in dit patroon steeds (iets anders|een andere kleur)\.$/))) {
    const a = lees(v, m[1]);
    return a && !voorVan(v.eenheid, a).has(a) ? null : "klopt niet";
  }
  if (/^Ernaast komt in dit patroon steeds (iets anders|een andere kleur)\.$/.test(z)) return gat && geenBuren(v.eenheid) ? null : "er liggen wel 2 dezelfde naast elkaar";
  if ((m = z.match(/^Daarna komt in dit patroon steeds (dezelfde kleur|hetzelfde ding|dezelfde vorm)\.$/))) return naVan(v.eenheid, L).size === 1 ? null : "klopt niet: er komt niet steeds hetzelfde na";
  if ((m = z.match(/^Daarna komt in dit patroon nooit weer (.+)\.$/))) return lees(v, m[1]) === L && x === L && !naVan(v.eenheid, L).has(L) ? null : "klopt niet";
  if ((m = z.match(/^Na (\d+) (.+) komt (steeds iets anders|er een nieuwe kleur)\.$/))) {
    const k = Number(m[1]);
    const u = v.eenheid;
    const max = Math.max(...u.map((_, i) => { let j = 0; while (j < u.length && u[(i + j) % u.length] === L) j++; return j; }));
    return n.meer(L) === m[2] && max === k && (m[3] !== "er een nieuwe kleur" || v.wat === "kraal") ? null : "klopt niet";
  }
  if ((m = z.match(/^Aan het eind ligt nog maar (\d+) (.+)\.$/))) return lees(v, m[2]) === L && reeks === Number(m[1]) ? null : "klopt niet met het eind";
  if ((m = z.match(/^Aan het eind ligt (.+) nog alleen\.$/))) return lees(v, m[1]) === L && reeks === 1 ? null : "klopt niet met het eind";
  return `onbekende zin (niet na te lopen): "${z}"`;
}
function waarKetting(c: C, z: string): string | null {
  const v = c.v as Kettingvraag;
  const g = c.gelegd!;
  const i = g.findIndex((k, p) => k !== v.doel[p]);
  const x = g[i];
  const ervoor = i === 0 ? v.rij.at(-1)! : v.doel[i - 1];
  const nooit = (a: string, b: string) => a === ervoor && b === x && !naVan(v.eenheid, a).has(b);
  let m: RegExpMatchArray | null;
  if ((m = z.match(/^Je sleepte eerst een (\w+) kraal\.$/)) || (m = z.match(/^Eerst (\w+)\?$/)) || (m = z.match(/^Je begon met (\w+)\.$/))) return i === 0 && KLEURVAN[m[1]] === x ? null : "klopt niet met wat het kind sleepte";
  if (/^Je begon met dezelfde kleur als de laatste kraal\.$/.test(z)) return i === 0 && x === ervoor ? null : "klopt niet";
  if (/^(De eerste kraal klopt|De eerste kraal is goed)\.$/.test(z) || /^Goed begonnen!$/.test(z)) return i >= 1 ? null : "de eerste kraal klopt niet";
  if ((m = z.match(/^Daarna sleepte je (\w+)\.$/))) return KLEURVAN[m[1]] === x ? null : "klopt niet";
  if ((m = z.match(/^Die kleur ligt al aan het eind( van de ketting)?\.$/))) return i === 0 && x === ervoor ? null : "klopt niet";
  if ((m = z.match(/^(?:Die|Die kleur) komt nooit na (\w+)\.$/))) return nooit(KLEURVAN[m[1]], x) ? null : "klopt niet";
  if ((m = z.match(/^Maar (\w+) komt nooit na (\w+)\.$/))) return nooit(KLEURVAN[m[2]], KLEURVAN[m[1]]) ? null : "klopt niet";
  if ((m = z.match(/^(?:Maar n|N)a (\w+) komt in dit patroon iets anders\.$/))) return nooit(KLEURVAN[m[1]], x) ? null : "klopt niet";
  if (/^(Daarna sleepte je dezelfde kleur nog een keer|Maar de tweede heeft dezelfde kleur)\.$/.test(z)) return i >= 1 && x === ervoor ? null : "klopt niet";
  if (/^(Je sleepte weer dezelfde kleur als ervoor\.|Weer dezelfde kleur als ervoor, zie ik\.)$/.test(z)) return x === ervoor ? null : "klopt niet";
  if ((m = z.match(/^Je sleepte weer een kraal die niet na (\w+) komt\.$/)) || (m = z.match(/^Ook die kraal komt niet na (\w+)\.$/))) return nooit(KLEURVAN[m[1]], x) ? null : "klopt niet";
  if ((m = z.match(/^Na (\w+) komt in dit patroon steeds (dezelfde kleur|een andere kleur)\.$/))) {
    const a = KLEURVAN[m[1]];
    return a === ervoor && (m[2] === "dezelfde kleur" ? naVan(v.eenheid, a).size === 1 : !naVan(v.eenheid, a).has(a)) ? null : "klopt niet";
  }
  if (/^In deze ketting komt na een kleur steeds een andere kleur\.$/.test(z)) return geenBuren(v.eenheid) ? null : "klopt niet";
  if (/^Daarna komt in dit patroon steeds dezelfde kleur\.$/.test(z)) return naVan(v.eenheid, ervoor).size === 1 ? null : "klopt niet";
  if (/^(Een patroon gaat steeds in dezelfde volgorde|In een patroon komt steeds hetzelfde stukje terug|In een patroon blijft de volgorde steeds hetzelfde)\.$/.test(z)) return null;
  return `onbekende zin (niet na te lopen): "${z}"`;
}
/** Een hint (als geheel): klopt hij, en verwijst hij naar iets dat er echt ligt? */
function waarHint(c: C, h: string): string | null {
  const v = c.v;
  let m: RegExpMatchArray | null;
  const woord = v.wat === "kraal" ? "ketting" : "rij";
  if (new RegExp(`^(Zoek in de ketting het stukje dat steeds terugkomt|Zoek het stukje dat steeds terugkomt|Begin vooraan in de ${woord}\\. Zoek waar hetzelfde stukje weer begint|Een patroon is een stukje dat steeds terugkomt\\. Zoek dat stukje in de ${woord})\\.$`).test(h)) {
    /* Vooraan begint het patroon, en het begint in beeld nog een keer opnieuw. */
    const rij = v.soort === "ketting" ? v.rij : (v as Keuzevraag).rij;
    return rij.length > v.eenheid.length && rij[v.eenheid.length] !== undefined ? null : "het stukje komt in beeld geen 2e keer";
  }
  if ((m = h.match(/^(?:Kijk|Tel) hoe vaak elke (kleur|vorm) achter elkaar komt\.$/))) return (m[1] === "kleur") === (v.wat === "kraal") && v.eenheid.some((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e) ? null : "er komt niets 2 keer achter elkaar";
  if (v.soort === "ketting") {
    const g = c.gelegd!;
    const i = g.findIndex((k, p) => k !== v.doel[p]);
    const ervoor = i === 0 ? v.rij.at(-1)! : v.doel[i - 1];
    if ((m = h.match(/^Zoek eerder in de ketting een (\w+) kraal\. Kijk wat daarna komt\.$/))) return KLEURVAN[m[1]] === ervoor && v.rij.includes(ervoor) && naVan(v.eenheid, ervoor).size === 1 ? null : "klopt niet";
    if (/^Kijk naar de laatste kraal\. Zoek die kleur eerder en kijk wat daarna komt\.$/.test(h)) return i === 0 && v.rij.slice(0, -1).includes(ervoor) && naVan(v.eenheid, ervoor).size === 1 ? null : "klopt niet";
    return `onbekende hint: "${h}"`;
  }
  const kv = v as Keuzevraag;
  const gat = kv.vorm === "gat";
  const plekW = kv.wat === "ding" ? "de pijl" : "de lege plek";
  if ((m = h.match(/^Zoek eerder in de (ketting|rij) (.+)\. Kijk wat (daarna|ervoor) komt\.$/))) {
    const a = lees(kv, m[2]);
    if (m[1] !== woord || !a) return "klopt niet";
    if (gat) {
      const buur = m[3] === "daarna" ? kv.rij[kv.plek - 1] : kv.rij[kv.plek + 1];
      if (a !== buur) return "noemt niet wat naast de lege plek ligt";
      const eerder = m[3] === "daarna" ? kv.rij.slice(0, kv.plek - 1).includes(a) : kv.rij.slice(1, kv.plek).some((e, i) => e === a && kv.rij[i] !== null);
      if (!eerder) return `er ligt eerder geen ${m[2]}`;
      return (m[3] === "daarna" ? naVan(kv.eenheid, a) : voorVan(kv.eenheid, a)).size === 1 ? null : "wat ernaast komt is niet steeds hetzelfde (misleidend)";
    }
    const voor = voorPlek(kv);
    return m[3] === "daarna" && a === voor.at(-1) && voor.slice(0, -1).includes(a) && naVan(kv.eenheid, a).size === 1 ? null : "klopt niet";
  }
  if ((m = h.match(/^Kijk (links|rechts) van (de lege plek|de pijl)\. Zoek (die kraal|dat) eerder en kijk wat (daarna|ervoor) komt\.$/))) {
    if (!gat || m[2] !== plekW || (m[3] === "die kraal") !== (kv.wat === "kraal") || (m[1] === "links") !== (m[4] === "daarna")) return "klopt niet";
    const a = m[1] === "links" ? kv.rij[kv.plek - 1] : kv.rij[kv.plek + 1];
    if (!a) return "daar ligt niets";
    const eerder = m[1] === "links" ? kv.rij.slice(0, kv.plek - 1).includes(a) : kv.rij.slice(1, kv.plek).some((e, i) => e === a && kv.rij[i] !== null);
    return eerder && (m[1] === "links" ? naVan(kv.eenheid, a) : voorVan(kv.eenheid, a)).size === 1 ? null : "klopt niet";
  }
  if ((m = h.match(/^Kijk naar de laatste (kraal|vorm|ding)\. Zoek (die kleur|die vorm|dat) eerder en kijk wat daarna komt\.$/))) {
    const voor = voorPlek(kv);
    const a = voor.at(-1)!;
    const ok = !gat && m[1] === (kv.wat === "kraal" ? "kraal" : kv.wat) && m[2] === (kv.wat === "kraal" ? "die kleur" : kv.wat === "vorm" ? "die vorm" : "dat");
    return ok && voor.slice(0, -1).includes(a) && naVan(kv.eenheid, a).size === 1 ? null : "klopt niet";
  }
  return `onbekende hint: "${h}"`;
}

/* 3. Wat voor elke variant geldt. */
function algemeen(waar: string, z: string, telDing = true) {
  varianten++;
  if (/\bfout\b/i.test(kaal(z))) fouten.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
  if (/vinkje/i.test(z)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die hele zin weg, BOUWREGELS 15.37): "${kaal(z)}"`);
  const getallen = kaal(z).match(/\d+/g) ?? [];
  if (new Set(getallen).size !== getallen.length) fouten.push(`${waar}: een getal staat 2 keer in "${kaal(z)}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${waar}: getal zonder kleur in "${z}" (14.20)`);
  /* Een getal dat naar kralen of vormen van 1 kleur verwijst, heeft die kleur (2.2); "2 keer" is wit. */
  for (const m of z.matchAll(/\{(\d+):([a-z]+)\} (\w+)/g)) if (m[3] === "keer" ? m[2] !== "wit" : m[2] === "wit") fouten.push(`${waar}: kleur van ${m[1]} klopt niet in "${z}"`);
  if (telDing) {
    const d = dingenIn(z);
    const dubbel = d.find((x, i) => d.indexOf(x) !== i);
    if (dubbel) fouten.push(`${waar}: "${dubbel}" wordt 2 keer genoemd in "${kaal(z)}"`);
  }
  if (lengte(z) > MAX_STUK) fouten.push(`${waar}: te lang voor het tekstvak (${lengte(z)} tekens): "${kaal(z)}"`);
}
/** Een rijtje varianten: genoeg, geen 2 dezelfde (ook niet met een ander woord of getal erin). */
function rijtje(waar: string, lijst: readonly string[], min = 2, opdracht = false, telDing = true) {
  if (lijst.length < min) fouten.push(`${waar}: ${lijst.length} ${lijst.length === 1 ? "variant" : "varianten"}, minstens ${min} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
  for (const z of lijst) {
    algemeen(waar, z, telDing);
    if (opdracht && !OPDRACHT.test(kaal(z))) fouten.push(`${waar}: zegt niet wat het kind doet (F16): "${kaal(z)}"`);
  }
}

/* 4. De fouttabel: compleet, elke variant waar, niets verklapt (15.17), altijd een vraag of opdracht (F16). */
function keurFout(waar: string, c: C, f: Fout) {
  const V = f.v;
  if (f.code === "onduidelijk") return void fouten.push(`${waar}: vaste keuzes horen een denkfout te hebben (geleerd bij Getallenlijn)`);
  const lijsten: [string, string[]][] = [["eerste zin", V.eerste], ["hint", V.hint], ["uitleg", V.uitleg], ["weer", V.weerEerste], ["weer-uitleg", V.weerUitleg]];
  for (const [naam, lijst] of lijsten) rijtje(`${waar} ${naam}`, lijst);
  if (!V.eerste.includes(f.eerste) || !V.hint.includes(f.hint) || !V.uitleg.includes(f.uitleg)) fouten.push(`${waar}: de vaste zin van de tabel is geen variant`);
  /* Waar? */
  for (const [naam, lijst] of lijsten) {
    for (const z of lijst) {
      if (naam === "hint") {
        beweringen++;
        const r = waarHint(c, kaal(z));
        if (r) fouten.push(`${waar} hint: ${r} ("${kaal(z)}")`);
        continue;
      }
      for (const s of zinnenVan(z)) {
        beweringen++;
        const r = waarZin(c, s);
        if (r) fouten.push(`${waar} ${naam}: ${r} ("${s}")`);
      }
    }
  }
  /* Niet verklappen (15.17). */
  const v = c.v;
  if (v.soort === "keuze") {
    const n = namen(v.wat, v.kleur);
    if (c.x === v.goed) fouten.push(`${waar}: fout antwoord is het goede`);
    if (!f.over.includes(v.goed)) fouten.push(`${waar}: het goede antwoord valt weg na de eerste zin`);
    if (f.over.length < 2) fouten.push(`${waar}: na de eerste zin en de hint blijft er maar 1 over`);
    for (const z of [...V.eerste, ...V.hint]) {
      const t = kaal(z).toLowerCase();
      if (t.includes(n.een(v.goed).toLowerCase()) || t.includes(n.de(v.goed).toLowerCase())) fouten.push(`${waar}: noemt het antwoord (${n.een(v.goed)}): "${kaal(z)}"`);
      if (/tussen .* en /i.test(t)) fouten.push(`${waar}: "tussen … en …" in "${kaal(z)}"`);
    }
  } else {
    if (f.over.length < 2) fouten.push(`${waar}: na de eerste zin blijft er maar 1 kraal over`);
    for (const z of [...V.eerste, ...V.hint]) if (new RegExp(`na ${KLEURWOORD[(v as Kettingvraag).rij.at(-1)!][0]} komen`, "i").test(kaal(z))) fouten.push(`${waar}: noemt het antwoord: "${kaal(z)}"`);
  }
  /* De 2e keer: geen opdracht (daarna doet Bliepo het samen voor). */
  for (const [naam, lijst] of lijsten.slice(2)) for (const z of lijst) for (const s of zinnenVan(z)) if (GEBIEDEND.test(s)) fouten.push(`${waar} ${naam}: een opdracht bij de 2e keer: "${s}"`);
  /* Elke eerste zin: er zijn minstens 2 hints die passen en niet noemen wat de eerste zin noemde; na elke hint komt een
     vraag of opdracht die ook past (F16). */
  for (const e of V.eerste) {
    const kan = passend(zonderDingUit(V.hint, e));
    if (kan.some((h) => deeltDing(e, h))) fouten.push(`${waar}: na "${kaal(e)}" noemt elke hint nog eens hetzelfde`);
    if (kan.length < 2) fouten.push(`${waar}: maar ${kan.length} hint mogelijk na "${kaal(e)}" (dan hoort het kind 2 keer dezelfde)`);
    for (const h of kan) {
      combinaties++;
      const daarna = v.soort === "keuze" ? passend(opnieuwNa(v, h), h) : passend(ZIN.kettingOpnieuw, h);
      const past = (v.soort === "keuze" ? opnieuwNa(v, h) : ZIN.kettingOpnieuw).filter((o) => lengte(h, o) <= MAX_STUK);
      if (past.length < 2) fouten.push(`${waar}: na de hint "${kaal(h)}" passen maar ${past.length} vragen of opdrachten in het tekstvak (dan hoort het kind 2 keer dezelfde)`);
      for (const o of daarna) if (!OPDRACHT.test(kaal(`${h} ${o}`))) fouten.push(`${waar}: "${kaal(`${h} ${o}`)}" zegt niet wat het kind doet (F16)`);
      if (v.soort === "keuze" && daarna.every((o) => deeltDing(e, o)) && daarna.length) {
        /* mag (wens), geen fout: de vraag zelf noemt soms de kraal */
      }
    }
  }
  /* 2e keer: na elke eerste zin past een uitleg (andere woorden dan de eerste zin). */
  for (const [a, b] of [[V.eerste, V.uitleg], [V.weerEerste, V.weerUitleg]] as const)
    for (const e of a) {
      const kan = b.filter((u) => !deeltDing(e, u) && lengte(u) <= MAX_STUK);
      if (!kan.length) fouten.push(`${waar}: na "${kaal(e)}" noemt elke uitleg nog eens hetzelfde`);
      else if (kan.length < 2) fouten.push(`${waar}: na "${kaal(e)}" past maar 1 uitleg (dan hoort het kind 2 keer dezelfde)`);
    }
}

let telling = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  if (v.soort === "puzzel") continue;
  const tabel = foutenVan(v);
  const nodig = v.soort === "keuze" ? v.keuzes.length - 1 : 5;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    if (!DENKFOUTEN.includes(f.code)) fouten.push(`${v.id} ${a}: onbekende denkfout ${f.code}`);
    const gelegd = v.soort === "ketting" ? a.split(",") : undefined;
    const x = v.soort === "keuze" ? a : gelegd![gelegd!.findIndex((k, p) => k !== v.doel[p])];
    keurFout(`${v.id} ${a}`, { v, x, gelegd }, f);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    for (const h of f.v.hint) hintsPerCode.get(f.code)!.add(kaal(h));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* "Je koos weer …" bij hetzelfde antwoord 2 keer. */
  if (v.soort === "keuze") for (const x of v.keuzes.filter((k) => k !== v.goed)) for (const z of ZIN.weerGekozen(v, x)) for (const s of zinnenVan(z)) { const r = waarZin({ v, x }, s); if (r) fouten.push(`${v.id} weer gekozen: ${r} ("${s}")`); }
  if (v.soort === "keuze") rijtje(`${v.id} weer gekozen`, ZIN.weerGekozen(v, v.keuzes.find((k) => k !== v.goed)!));
}

/* 5. De vaste zinnen: genoeg varianten, geen 2 dezelfde, en elke opdracht zegt wat het kind doet (F16). */
const keuzes = VRAGEN.filter((v): v is Keuzevraag => v.soort === "keuze");
const kettingen = VRAGEN.filter((v): v is Kettingvraag => v.soort === "ketting");
const VAST: [string, readonly string[], number, boolean, boolean?][] = [
  ["begin", ZIN.start, 2, false, false],
  ["ketting: wat je ziet", ZIN.kettingIntro, 2, false],
  ["ketting: opdracht", ZIN.kettingOpdracht, 2, true],
  ["ketting: hulphandje", ZIN.kettingHand, 2, true],
  ["ketting: na de hint", ZIN.kettingOpnieuw, 2, true],
  ["puzzel: wat je ziet", ZIN.puzzelIntro, 2, false],
  ["puzzel: opdracht (1e keer)", ZIN.puzzelOpdracht(true), 2, true],
  ["puzzel: opdracht", ZIN.puzzelOpdracht(false), 2, true],
  ["puzzel: hulphandje", ZIN.puzzelHand, 2, true],
  ["samen", ZIN.samen, 4, false],
  ["samen: jij", ZIN.samenJij, 3, true],
  ["samen: hulphandje", ZIN.samenHand, 3, true],
  ["samen ketting: jij", ZIN.samenKettingJij, 3, true],
  ["samen ketting: hulphandje", ZIN.samenKettingHand, 3, true],
  ["samen ketting: klaar", ZIN.samenKettingKlaar, 3, false],
  ["samen ketting: Bliepo deed het", ZIN.samenKettingZelf, 2, false],
  ["puzzel: Bliepo wijst aan", ZIN.puzzelWijs, 2, false],
  ["puzzel: jij", ZIN.puzzelWijsJij, 3, true],
  ["samen puzzel: klaar", ZIN.samenPuzzelKlaar, 2, false],
  ["samen puzzel: Bliepo deed het", ZIN.samenPuzzelZelf, 2, false],
  ["puzzel: vangnet 1", ZIN.puzzelVangnet1, 2, false],
  ["puzzel: vangnet 2", ZIN.puzzelVangnet2, 2, false],
  ["ketting: vangnet", ZIN.kettingVangnet, 3, false],
  ["slot", ZIN.slot, 3, false],
  ["kaart", ZIN.kaartTik, 3, true],
  ["aanmoediging (hulphandje)", AANMOEDIG, 5, false],
  ["puzzel: eerste zin", PUZZEL_FOUT.eerste, 3, false],
  ["puzzel: hint (de nieuwe opdracht)", PUZZEL_FOUT.hint, 3, true],
  ["puzzel: uitleg", PUZZEL_FOUT.uitleg, 2, false],
];
for (const [naam, lijst, min, opdracht, telDing] of VAST) rijtje(naam, lijst, min, opdracht, telDing ?? true);
for (const z of [...PUZZEL_FOUT.uitleg, ...ZIN.samenKettingZelf, ...ZIN.samenPuzzelZelf, ...keuzes.flatMap((v) => ZIN.samenZelf(v))]) if (/^(Ja|Precies)\b/.test(z)) fouten.push(`na het vangnet begint "${z}" met lof`);
for (const z of PUZZEL_FOUT.uitleg) for (const s of zinnenVan(z)) if (GEBIEDEND.test(s)) fouten.push(`puzzel uitleg: een opdracht bij de 2e keer: "${s}"`);
/* De begin-zin past samen met de groet in 1 stuk. */
for (const z of ZIN.start) if (lengte("Hoi Testkind! Fijn dat je er bent.", z) > MAX_STUK) fouten.push(`begin: te lang met de groet: "${z}"`);
/* Het hulphandje zegt een aanmoediging + een opdracht in 1 keer: ook dat past. */
for (const z of [...ZIN.kettingHand, ...ZIN.puzzelHand, ...ZIN.samenHand, ...ZIN.samenKettingHand]) if (!passend(AANMOEDIG, z).some((a) => lengte(a, z) <= MAX_STUK)) fouten.push(`hulphandje te lang: "${z}"`);
/* Per vraag. */
const OUD = ["Welke kraal komt nu?", "Welke kraal hoort op de lege plek?", "Wat hoort bij de pijl?", "Welke vorm komt nu?"];
/* 19 nov 2026: de 2e vraag van dezelfde soort zonder los "En" aan het begin (keuring 15.36). */
const NOG = ["Welke kraal is de volgende?", "Welke kraal past op de lege plek?", "Wat komt er bij de pijl?", "Welke vorm is de volgende?"];
let vorigeVraag = "";
for (const v of VRAGEN) {
  if (v.soort === "keuze") {
    const vz = ZIN.vraag(v);
    if (!OUD.includes(vz) && !NOG.includes(vz) && !/^Welke kraal komt na de \w+ kraal\?$/.test(vz)) fouten.push(`${v.id}: vraagzin niet van de oude les: "${vz}"`);
    if (vz === vorigeVraag) fouten.push(`${v.id}: dezelfde vraagzin als de vraag ervoor: "${vz}"`);
    vorigeVraag = vz;
    rijtje(`${v.id} wat je ziet`, ZIN.vraagIntro(v), 2);
    for (const i of ZIN.vraagIntro(v)) if (lengte(i, vz, ZIN.tikErop) > MAX_STUK) fouten.push(`${v.id}: de vraag is te lang: "${i} ${vz}"`);
    rijtje(`${v.id} de vraag opnieuw`, ZIN.opnieuwVraag(v), 3, true);
    rijtje(`${v.id} na de hint kort`, ZIN.opnieuwKort(v), 2, true);
    rijtje(`${v.id} samen: het stukje`, ZIN.samenPatroon(v.wat, v.eenheid, v.kleur), 3, false, false);
    rijtje(`${v.id} samen: de goede keuze`, ZIN.samenGoed(v), 3);
    rijtje(`${v.id} samen: klaar`, ZIN.samenKlaar(v), 3);
    rijtje(`${v.id} samen: Bliepo deed het`, ZIN.samenZelf(v), 2);
    rijtje(`${v.id} reactie na lof`, patroonReactie(v).zinnen, 7);
  } else {
    vorigeVraag = "";
    rijtje(`${v.id} reactie na lof`, patroonReactie(v).zinnen, 7);
  }
  if (v.soort === "ketting") {
    rijtje(`${v.id} samen: het stukje`, ZIN.samenPatroon("kraal", v.eenheid), 3, false, false);
    rijtje(`${v.id} samen: Bliepo legt 2 kralen`, ZIN.samenKetting(v), 3);
    const [l, a, b] = [v.rij.at(-1)!, v.doel[0], v.doel[1]].map((k) => KLEURWOORD[k][0]);
    for (const z of ZIN.samenKetting(v)) if (![`Na ${l} komen ${a} en ${b}.`, `Ik leg ${a} en ${b} erbij. Die komen na ${l}.`, `Kijk, na ${l} komt eerst ${a} en dan ${b}.`].includes(z)) fouten.push(`${v.id}: onbekende zin bij samen voordoen: "${z}"`);
    rijtje(`${v.id} weer gesleept`, ZIN.weerKetting(0, v.losse[0], null), 2);
    rijtje(`${v.id} weer gesleept (2e kraal)`, ZIN.weerKetting(1, v.losse[0], v.doel[0]), 2);
  }
}
/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

/* 6. NOOIT 2 KEER HETZELFDE: de kiezer 20.000 keer naspelen met willekeurige vragen en keuzes (dezelfde functie als de les). */
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
    if (vorige.get(sleutel) === vorm(z)) meld(`kiezer: 2 keer achter elkaar dezelfde zin bij "${sleutel}": "${kaal(z)}"`);
    vorige.set(sleutel, vorm(z));
    return z;
  };
  const pak = <T,>(l: T[]) => l[Math.floor(toeval() * l.length)];
  const reactieOk = (waar: string, zinnen: string[]) => {
    for (const z of zinnen) if (lengte(z) > MAX_STUK) meld(`kiezer: te lang (${lengte(z)} tekens) bij ${waar}: "${kaal(z)}"`);
    if (zinnen.length === 2 && (vorm(zinnen[0]) === vorm(zinnen[1]) || deeltDing(zinnen[0], zinnen[1]))) meld(`kiezer: 2 keer hetzelfde (zin, kraal of ding) in 1 reactie bij ${waar}: "${kaal(zinnen.join(" | "))}"`);
    for (const z of zinnen) if (/\bfout\b|vinkje/i.test(z)) meld(`kiezer: verboden woord bij ${waar}: "${kaal(z)}"`);
  };
  const metFout = VRAGEN.filter((v) => v.soort !== "puzzel");
  for (let i = 0; i < 20000; i++) {
    const v = pak(metFout);
    const tabel = foutenVan(v);
    const a1 = pak(Object.keys(tabel));
    const f1 = tabel[a1];
    const sleutelVan = (a: string) => (v.soort === "ketting" ? (() => { const p = a.split(","); const j = p.findIndex((k, q) => k !== v.doel[q]); return `${j}:${p[j]}`; })() : a);
    const weerVan = (a: string) => (v.soort === "keuze" ? ZIN.weerGekozen(v, a) : (() => { const p = a.split(","); const j = p.findIndex((k, q) => k !== v.doel[q]); return ZIN.weerKetting(j, p[j], j > 0 ? v.doel[j - 1] : null); })());
    if (v.soort === "keuze") kies(`intro-${v.wat}-${v.vorm}`, ZIN.vraagIntro(v));
    else {
      kies("kettingIntro", ZIN.kettingIntro);
      kies("kettingOpdracht", ZIN.kettingOpdracht);
    }
    const z1 = foutReactie(kies, f1, 1, null, false, "", weerVan(a1));
    const na = v.soort === "keuze" ? kies("opnieuw", passend(opnieuwNa(v, z1[1]), z1[1]), (z) => !deeltDing(z1[0], z) && z !== ZIN.vraag(v)) : kies("kettingOpnieuw", passend(ZIN.kettingOpnieuw, z1[1]));
    reactieOk(`${v.id} ${a1} (1e keer)`, [z1[0], `${z1[1]} ${na}`]);
    if (deeltDing(z1[0], z1[1])) meld(`kiezer: de hint noemt nog eens wat de eerste zin noemde (${v.id} ${a1}): "${kaal(z1.join(" | "))}"`);
    if (!OPDRACHT.test(kaal(`${z1[1]} ${na}`))) meld(`kiezer: geen vraag of opdracht na de hint (${v.id} ${a1}): "${kaal(`${z1[1]} ${na}`)}"`);
    gespeeld++;
    if (toeval() < 0.5) continue;
    const a2 = pak(Object.keys(tabel));
    const z2 = foutReactie(kies, tabel[a2], 2, f1, sleutelVan(a2) === sleutelVan(a1), z1[0], weerVan(a2));
    reactieOk(`${v.id} ${a1} en dan ${a2} (2e keer)`, z2);
    if (z2.some((z) => z1.includes(z))) meld(`kiezer: bij de 2e keer dezelfde zin als bij de 1e keer (${v.id} ${a1} en dan ${a2}): "${kaal(z2.join(" "))}"`);
    kies("samen", ZIN.samen);
    if (v.soort === "keuze") {
      kies("samenPatroon", passend(ZIN.samenPatroon(v.wat, v.eenheid, v.kleur)));
      kies("samenGoed", ZIN.samenGoed(v));
      kies("samenJij", ZIN.samenJij);
      kies("samenKlaar", ZIN.samenKlaar(v));
    } else {
      kies("samenPatroon", passend(ZIN.samenPatroon("kraal", v.eenheid)));
      kies("samenKetting", ZIN.samenKetting(v));
      kies("samenKettingJij", ZIN.samenKettingJij);
      kies("samenKettingKlaar", ZIN.samenKettingKlaar);
    }
    gespeeld++;
  }
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${varianten} varianten nagelopen, ${beweringen} beweringen, ${combinaties} combinaties van eerste zin + hint, kiezer ${gespeeld} keer nagespeeld).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 7. De tabel (met van elk rijtje 1 vaste variant; alle varianten staan in §4). */
const vraagNaam = (v: Vraag): string => {
  if (v.soort === "puzzel") return `${v.nr}. Puzzel (${v.n} × ${v.n} stukjes)`;
  if (v.soort === "ketting") return `${v.nr}. Maak de ketting langer (${v.rij.map((k) => KLEURWOORD[k][0]).join(", ")}; losse kralen ${v.losse.map((k) => KLEURWOORD[k][0]).join(", ")}; goed: ${v.doel.map((k) => KLEURWOORD[k][0]).join(", ")})`;
  const n = namen(v.wat, v.kleur);
  return `${v.nr}. ${ZIN.vraag(v)} (${v.rij.map((x) => (x === null ? "▢" : n.kort(x))).join(", ")}; keuzes ${v.keuzes.map(n.kort).join(" / ")}; goed: ${n.kort(v.goed)})`;
};
const naamAntwoord = (v: Vraag, a: string) => (v.soort === "keuze" ? namen(v.wat, v.kleur).kort(a) : a.split(",").map((k) => KLEURWOORD[k as Kleur][0]).join(", "));
const rijen = VRAGEN.flatMap((v) => (v.soort === "puzzel" ? [] : Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${naamAntwoord(v, a)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`))).join("\n");
const eerst = <T,>(l: T[], v: { nr: number }) => l[v.nr % l.length];
const samenTekst = (v: Vraag) => {
  if (v.soort === "keuze") return `"${kaal(eerst(ZIN.samenPatroon(v.wat, v.eenheid, v.kleur), v))}" (rondje om het stukje dat terugkomt) — rondje om de goede keuze: "${kaal(eerst(ZIN.samenGoed(v), v))}" — "${eerst(ZIN.samenJij, v)}" (het kind tikt hem aan; handje na ± 6 s) — "${kaal(eerst(ZIN.samenKlaar(v), v))}" (vangnet: "${kaal(eerst(ZIN.samenZelf(v), v))}")`;
  if (v.soort === "ketting") return `"${kaal(eerst(ZIN.samenPatroon("kraal", v.eenheid), v))}" — Bliepo legt de eerste 2 kralen: "${kaal(eerst(ZIN.samenKetting(v), v))}" — "${eerst(ZIN.samenKettingJij, v)}" (het kind sleept de laatste; handje na ± 6 s) — "${eerst(ZIN.samenKettingKlaar, v)}" (vangnet: "${eerst(ZIN.samenKettingZelf, v)}")`;
  return "";
};
const uitleg = VRAGEN.flatMap((v) => (v.soort === "puzzel" ? [] : Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${naamAntwoord(v, a)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "${eerst(ZIN.samen, v)}" (${ZIN.samen.length} versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "—"} | ${samenTekst(v)} |`))).join("\n");
const lijst = (l: readonly string[]) => l.map((z) => `"${kaal(z)}"`).join(" / ");
const alleVarianten = VRAGEN.flatMap((v) => {
  if (v.soort === "puzzel") return [];
  const kop = `### ${vraagNaam(v)}\n\n${v.soort === "keuze" ? `- Wat je ziet: ${lijst(ZIN.vraagIntro(v))}; de vraag: "${ZIN.vraag(v)}"\n- De vraag opnieuw na de hint: ${lijst(ZIN.opnieuwVraag(v))}; na een hint die al zegt wat je zoekt: ${lijst(ZIN.opnieuwKort(v))}\n- Hetzelfde antwoord 2 keer: ${lijst(ZIN.weerGekozen(v, v.keuzes.find((k) => k !== v.goed)!))} (met dat antwoord)\n- Samen: ${lijst(ZIN.samenPatroon(v.wat, v.eenheid, v.kleur))} — ${lijst(ZIN.samenGoed(v))} — ${lijst(ZIN.samenKlaar(v))}` : `- Samen: ${lijst(ZIN.samenPatroon("kraal", v.eenheid))} — ${lijst(ZIN.samenKetting(v))}`}\n`;
  const fs = Object.entries(foutenVan(v)).map(([a, f]) => `**${naamAntwoord(v, a)}** (\`${f.code}\`)\n- eerste zin: ${lijst(f.v.eerste)}\n- hint: ${lijst(f.v.hint)}\n- uitleg (2e keer): ${lijst(f.v.uitleg)}\n- dezelfde denkfout 2 keer: ${lijst(f.v.weerEerste)} + ${lijst(f.v.weerUitleg)}`);
  return [kop, ...fs];
}).join("\n\n");

const tekst = `# FOUTTABEL — gouden les Vormen: Patronen (squla-vormen-patronen-1-gouden, "Patronen")

Gemaakt **uit de code** met \`npx tsx scripts/fouttabel-vormen-gouden.ts\` (eerste versie 11 november 2026; varianten sinds 18 november 2026); pas zinnen aan in \`src/components/les/lessen/squla-vormen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, de kralen, de dingen, de vormen, de keuzes en de puzzel) is die van squla-vormen-patronen-1 en blijft gelijk (BOUWREGELS 15.22). Oud naast nieuw: WIJZIGINGEN-ZINNEN-VORMEN.md.

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22, 15.25).** Synthesis heeft geen les over vormen of patronen (KOPPELING.md §13). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling; alleen de algemene zinnen "Ik help je even" en "Precies" komen van Synthesis. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: hetzelfde als aan het eind, hetzelfde als ernaast, een paar dat nog niet af is, of iets wat in dit patroon niet direct na het vorige komt. Bliepo zegt alleen wat waar is over wat het kind koos en wat er in beeld ligt; hij verzint geen reden.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos en iets waars daarover, met een rood rondje om die keuze zolang hij het noemt. Daarna de hint en meteen een vraag of opdracht: de vraag in andere woorden, of (als de hint al zegt wat je zoekt) kort "Tik dan op de kraal die past." Tegelijk mag het kind opnieuw kiezen. Bij de ketting gaan de kralen terug naar beneden; na de hint komt "Sleep de kralen dan opnieuw." (of een variant). Zo staat er altijd een vraag of opdracht in beeld (15.37, F16).
- **Verklappen (15.17):** geen eerste zin en geen hint noemt het goede antwoord, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over.
- **Niets dubbel (15.29):** wat het kind koos, noemt Bliepo 1 keer ("Je koos rood. Die kleur ligt al aan het eind."), en de hint noemt niet nog eens wat de eerste zin net noemde.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (${ZIN.samen.length} versies) en dan samen voordoen (§3): Bliepo wijst het stukje aan dat steeds terugkomt, nu staat het rondje om de goede keuze, en het kind tikt hem aan (de kleine stap). Bij de ketting legt Bliepo de eerste 2 kralen en sleept het kind de laatste. Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit. Met een richting (links of rechts van de lege plek) is elke kant een eigen soort.
- **Hetzelfde foute antwoord 2 keer:** "Je koos weer …" / "Weer rood, zie ik." / "Je sleepte weer …".
- **Een ander fout antwoord bij de 2e fout:** begint de eerste zin met "Je koos", dan wordt het "Nu koos je …".
- **De puzzel** kan niet echt fout: een stukje op een verkeerde plek klikt niet vast. De 1e keer: ${lijst(PUZZEL_FOUT.eerste)} + ${lijst(PUZZEL_FOUT.hint)} (de hint is de nieuwe opdracht). De 2e keer: ${lijst(PUZZEL_FOUT.uitleg)} en samen voordoen: een rondje om de plek van 1 stukje, het kind sleept het erheen. Daarna bij elke verkeerde plek het rondje opnieuw. Denkfout \`stukje-mis\`. Vangnet: 20 s geen stukje erbij = Bliepo legt er 1; nog 20 s = Bliepo maakt de puzzel af.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle foute keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- **Nooit 2 keer hetzelfde:** elke zin heeft varianten (§4); de les kiest met de gedeelde kiezer (\`nooit-dubbel.ts\`) steeds een andere dan de vorige keer, ook over vragen heen. "Je koos rood." en "Je koos blauw." tellen als dezelfde zin.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen; 1 vaste variant per cel, alle varianten in §4; de puzzel staat hierboven)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}

## 4. Alle varianten

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer: nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. Het script loopt ELKE variant na: waar in het beeld, niets verklapt, niets 2 keer genoemd, geen opdracht bij de 2e keer, na elke hint een vraag of opdracht, alles past in het tekstvak (hooguit ${MAX_STUK} tekens per stuk).

**Vaste zinnen van de les**
${VAST.map(([naam, l]) => `- ${naam}: ${lijst(l)}`).join("\n")}

${alleVarianten}
`;
writeFileSync(new URL("../FOUTTABEL-squla-vormen-patronen-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-vormen-patronen-1-gouden.md geschreven.");
