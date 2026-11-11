/**
 * Maakt FOUTTABEL-squla-vormen-patronen-1-gouden.md uit de code (squla-vormen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de INHOUDS-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17;
 * LESRECEPT "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld").
 *   npx tsx scripts/fouttabel-vormen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Inhoud: dezelfde 15 vragen als squla-vormen-patronen-1 (zelfde volgorde, zelfde kralen, dingen, vormen en keuzes); per
 * keuzevraag precies 1 goede keuze, en het goede antwoord volgt echt uit het patroon.
 * Verklapcontrole: per vraag en per fout antwoord noemen de eerste zin en de hint het goede antwoord niet, het rondje staat
 * nooit om het antwoord, er blijven na de eerste zin minstens 2 keuzes over, geen "tussen … en …".
 * Waarheidscontrole: elke zin in de eerste zin, de hint, de uitleg en de "weer"-zinnen wordt nagelopen tegen het beeld van
 * DEZE vraag (wat er aan het eind ligt, wat er naast de lege plek ligt, wat er in het patroon na wat komt). Een zin die het
 * script niet kent, telt als fout.
 */
import { writeFileSync } from "node:fs";
import { KLEURWOORD, type Kleur } from "../src/components/les/vlakken/squla-vormen-tekenen";
import { DENKFOUT_UITLEG, DENKFOUTEN, DING, PUZZEL_FOUT, VORM, VRAGEN, ZIN, eindReeks, foutenVan, herhaal, naVan, namen, patroonReactie, voorPlek, voorVan, type Fout, type Kettingvraag, type Keuzevraag, type Vraag } from "../src/components/les/lessen/squla-vormen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const fouten: string[] = [];

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
/** "een rode kraal", "de banaan", "het groene vierkant", "rood" → het ding in de vraag (of null). */
function lees(v: { wat: string }, t: string): string | null {
  const w = t.trim().replace(/^(een|de|het) /, "");
  if (v.wat === "kraal") {
    const m = w.match(/^(\w+)(?: kraal)?$/);
    return m && KLEURVAN[m[1]] ? KLEURVAN[m[1]] : null;
  }
  if (v.wat === "ding") return DINGVAN[w] ?? null;
  const m = w.match(/^(?:\w+ )?(\w+)$/);
  return m ? (VORMVAN[m[1]] ?? null) : null;
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
    /* Het goede antwoord volgt uit het patroon: de rij is het patroon herhaald, en op de lege plek hoort `goed`. */
    const lengte = v.rij.length;
    const vol = herhaal(v.eenheid, lengte);
    if (v.rij.some((x, i) => x !== null && x !== vol[i])) fouten.push(`${v.id}: de rij is niet het patroon`);
    if (vol[v.plek] !== v.goed) fouten.push(`${v.id}: op de lege plek hoort niet ${v.goed}`);
    if (v.rij.filter((x) => x === null).length !== 1) fouten.push(`${v.id}: niet precies 1 lege plek`);
    /* Elke andere keuze past niet (anders 2 goede antwoorden, 14.30). */
    for (const k of v.keuzes) if (k !== v.goed && vol[v.plek] === k) fouten.push(`${v.id}: ${k} past ook`);
  }
  if (v.soort === "ketting") {
    if ([...v.losse].sort().join() !== [...v.doel].sort().join()) fouten.push(`${v.id}: de losse kralen zijn niet de 3 die nodig zijn`);
    if (herhaal(v.eenheid, v.getoond + 3).slice(v.getoond).join() !== v.doel.join()) fouten.push(`${v.id}: het doel volgt niet uit het patroon`);
  }
}

/* 2. Waarheidscontrole van 1 zin. */
const vraagVan = (v: Keuzevraag | Kettingvraag) => ("plek" in v ? v : null);
function waar(v: Keuzevraag | Kettingvraag, x: string, z: string, gelegd?: string[]): string | null {
  let m: RegExpMatchArray | null;
  const kv = vraagVan(v as Keuzevraag);
  const voor = kv ? voorPlek(kv) : [...(v as Kettingvraag).rij];
  const laatste = voor.at(-1)!;
  const links = kv ? kv.rij[kv.plek - 1] : null;
  const rechts = kv ? kv.rij[kv.plek + 1] : null;
  const rijW = v.wat === "kraal" ? "ketting" : "rij";
  if ((m = z.match(/^Je koos weer (.+)\.$/)) && lees(v, m[1])) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos (?!weer )(.+)\.$/))) return lees(v, m[1]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Aan het eind ligt al (.+)\.$/))) return kv?.vorm !== "gat" && lees(v, m[1]) === laatste && laatste === x && eindReeks(voor) === 1 ? null : "klopt niet met het eind";
  if ((m = z.match(/^Aan het eind liggen al (\d+) (.+)\.$/))) return kv?.vorm !== "gat" && laatste === x && eindReeks(voor) === Number(m[1]) && namen(v.wat, kv?.kleur).meer(x) === m[2] ? null : "klopt niet met het eind";
  if ((m = z.match(/^In dit patroon komt (.+) na (\d+) (.+)\.$/))) {
    const a = lees(v, m[1]);
    const n = Number(m[2]);
    if (a !== x || namen(v.wat, kv?.kleur).meer(laatste) !== m[3] || n < 2) return "klopt niet met het patroon";
    const u = v.eenheid as string[];
    const j = u.indexOf(x);
    for (let k = 1; k <= n; k++) if (u[(j - k + u.length * 2) % u.length] !== laatste) return "klopt niet met het patroon";
    if (u[(j - n - 1 + u.length * 2) % u.length] === laatste) return "klopt niet met het patroon";
    return u.filter((e) => e === x).length && eindReeks(voor) < n ? null : "het paar aan het eind is al af";
  }
  if ((m = z.match(/^(Links|Rechts) van (?:de lege plek|de pijl) ligt al (.+)\.$/))) return lees(v, m[2]) === x && x === (m[1] === "Links" ? links : rechts) ? null : "klopt niet met de buur";
  if (!gelegd && (m = z.match(/^Na (.+) komt nooit (.+)\.$/))) {
    const a = lees(v, m[1]);
    const b = lees(v, m[2]);
    return a && b && b === x && (kv?.vorm === "gat" ? a === links : a === laatste) && !naVan(v.eenheid, a).has(b) ? null : "klopt niet: het kan wel na elkaar";
  }
  if ((m = z.match(/^Aan het eind ligt nog maar (\d+) (.+)\.$/))) return lees(v, m[2]) === laatste && eindReeks(voor) === Number(m[1]) ? null : "klopt niet met het eind";
  if ((m = z.match(/^Zoek eerder in de (ketting|rij) (.+)\. Kijk wat (daarna|ervoor) komt\.$/)) || (m = z.match(/^Zoek eerder in de (ketting|rij) (.+)\.$/))) {
    const a = lees(v, m[2]);
    if (m[1] !== rijW || !a) return "klopt niet";
    const plek = kv ? kv.plek : voor.length;
    const rij = kv ? kv.rij : voor;
    const eerder = rij.map((e, i) => (e === a && i < plek - (kv?.vorm === "gat" ? 1 : 1) ? i : -1)).filter((i) => i >= 0);
    if (!eerder.length) return `er ligt eerder geen ${m[2]}`;
    if (m[3] === "ervoor") return voorVan(v.eenheid, a).size === 1 ? null : "wat ervoor komt is niet steeds hetzelfde";
    return naVan(v.eenheid, a).size === 1 ? null : "wat daarna komt is niet steeds hetzelfde (misleidend)";
  }
  if (/^Kijk wat (daarna|ervoor) komt\.$/.test(z)) return null;
  if ((m = z.match(/^Kijk links van (de lege plek|de pijl)\.$/))) return kv?.vorm === "gat" && links && (m[1] === "de pijl") === (v.wat === "ding") ? null : "geen lege plek";
  if ((m = z.match(/^Zoek (die kraal|dat) eerder\.$/))) return (m[1] === "die kraal") === (v.wat === "kraal") && kv && kv.rij.slice(0, kv.plek - 1).includes(links) && naVan(v.eenheid, links!).size === 1 ? null : "klopt niet";
  if ((m = z.match(/^Kijk naar het begin van de (ketting|rij)\.$/))) return m[1] === rijW ? null : "verkeerd woord voor de rij";
  if (/^Zoek (in de ketting )?het stukje dat steeds terugkomt\.$/.test(z)) return null;
  if ((m = z.match(/^Kijk hoe vaak elke (kleur|vorm) achter elkaar komt\.$/))) return v.eenheid.some((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e) ? null : "er komt niets 2 keer achter elkaar";
  if ((m = z.match(/^In deze (ketting|rij) komt elke (kleur|vorm) (\d+) keer achter elkaar\.$/))) return v.eenheid.every((e, i) => v.eenheid[(i + 1) % v.eenheid.length] === e || v.eenheid[(i - 1 + v.eenheid.length) % v.eenheid.length] === e) && m[3] === "2" ? null : "niet elke kleur 2 keer";
  if ((m = z.match(/^(.+) (?:komt|komen) steeds (\d+) keer achter elkaar\.$/))) {
    const delen = m[1].split(" en ").map((d) => lees(v, d.toLowerCase()));
    return delen.every((d) => d && v.eenheid.some((e, i) => e === d && v.eenheid[(i + 1) % v.eenheid.length] === d)) && m[2] === "2" ? null : "klopt niet";
  }
  if (/^(Een patroon gaat steeds in dezelfde volgorde|In een patroon komt steeds hetzelfde stukje terug|Het patroon loopt ook door op de lege plek|Ook op de lege plek gaat het patroon gewoon verder)\.$/.test(z)) return null;
  if (/^Je koos weer hetzelfde als (aan het eind|ernaast)\.$/.test(z)) return null;
  if ((m = z.match(/^Na (.+) komt in dit patroon steeds (iets anders|een andere kleur)\.$/))) {
    const a = lees(v, m[1]);
    return a && !naVan(v.eenheid, a).has(a) ? null : "klopt niet";
  }
  if ((m = z.match(/^Na (\d+) (.+) komt steeds iets anders\.$/))) {
    const n = Number(m[1]);
    const u = v.eenheid;
    const max = Math.max(...u.map((_, i) => { let k = 0; while (k < u.length && u[(i + k) % u.length] === laatste) k++; return k; }));
    return namen(v.wat, kv?.kleur).meer(laatste) === m[2] && max === n ? null : "klopt niet";
  }
  if ((m = z.match(/^Vóór (.+) komt in dit patroon steeds (iets anders|een andere kleur)\.$/))) {
    const a = lees(v, m[1]);
    return a && !voorVan(v.eenheid, a).has(a) ? null : "klopt niet";
  }
  if ((m = z.match(/^Je koos weer iets dat niet na (.+) komt\.$/))) return lees(v, m[1]) ? null : "onbekend ding";
  if ((m = z.match(/^Na (.+) komt in dit patroon steeds (dezelfde kleur|hetzelfde ding|dezelfde vorm)\.$/))) {
    const a = lees(v, m[1]);
    return a && naVan(v.eenheid, a).size === 1 ? null : "klopt niet: er komt niet steeds hetzelfde na";
  }
  if ((m = z.match(/^(.+) staat aan het eind nog maar (\d+) keer\.$/))) return lees(v, m[1].toLowerCase()) === laatste && eindReeks(voor) === Number(m[2]) ? null : "klopt niet met het eind";
  /* De ketting. */
  if (gelegd) {
    const i = gelegd.findIndex((k, p) => k !== (v as Kettingvraag).doel[p]);
    if ((m = z.match(/^Je sleepte eerst een (\w+) kraal\.$/))) return i === 0 && KLEURVAN[m[1]] === gelegd[0] ? null : "klopt niet met wat het kind sleepte";
    if (/^De eerste kraal klopt\.$/.test(z)) return i >= 1 ? null : "de eerste kraal klopt niet";
    if ((m = z.match(/^Daarna sleepte je een (\w+) kraal\.$/))) return KLEURVAN[m[1]] === gelegd[i] ? null : "klopt niet";
    if ((m = z.match(/^De ketting eindigt al met een (\w+) kraal\.$/))) return KLEURVAN[m[1]] === laatste && x === laatste ? null : "klopt niet";
    if ((m = z.match(/^Na (\w+) komt nooit (\w+)\.$/))) {
      const a = KLEURVAN[m[1]];
      const b = KLEURVAN[m[2]];
      const ervoor = i === 0 ? laatste : (v as Kettingvraag).doel[i - 1];
      return a === ervoor && b === gelegd[i] && !naVan(v.eenheid, a).has(b) ? null : "klopt niet";
    }
    if (/^Je sleepte weer (dezelfde kleur als ervoor|een kraal die niet na \w+ komt)\.$/.test(z)) return null;
    if ((m = z.match(/^Na (\w+) komt in dit patroon steeds (dezelfde kleur|een andere kleur)\.$/))) {
      const a = KLEURVAN[m[1]];
      return a && (m[2] === "dezelfde kleur" ? naVan(v.eenheid, a).size === 1 : !naVan(v.eenheid, a).has(a)) ? null : "klopt niet";
    }
  }
  return `onbekende zin (niet na te lopen): "${z}"`;
}

/* 3. Per fout antwoord: verklappen, waarheid, geen opdracht bij de 2e fout. */
function controleer(v: Keuzevraag | Kettingvraag, sleutel: string, f: Fout): string | null {
  if (!f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (/tussen .* en /i.test(kaal(`${f.eerste} ${f.hint}`))) return '"tussen … en …" in eerste zin of hint';
  if (v.soort === "keuze") {
    const n = namen(v.wat, v.kleur);
    const t = kaal(`${f.eerste} ${f.hint}`).toLowerCase();
    if (t.includes(n.een(v.goed).toLowerCase()) || t.includes(n.de(v.goed).toLowerCase())) return `de eerste zin of hint noemt het antwoord (${n.een(v.goed)})`;
    if (sleutel === v.goed) return "fout antwoord is het goede";
    if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin";
    if (f.over.length < 2) return "na de eerste zin en de hint blijft er maar 1 over";
  } else {
    const t = kaal(`${f.eerste} ${f.hint}`);
    if (new RegExp(`na ${v.rij.at(-1)} komen`, "i").test(t)) return "noemt het antwoord";
    if (f.over.length < 2) return "na de eerste zin blijft er maar 1 kraal over";
  }
  for (const z of [...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) if (/^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Leg)\b/.test(z)) return `opdracht in de uitleg bij de 2e fout: "${z}"`;
  const x = v.soort === "keuze" ? sleutel : sleutel.split(",")[v.soort === "ketting" ? sleutel.split(",").findIndex((k, p) => k !== v.doel[p]) : 0];
  for (const z of [...zinnenVan(f.eerste), ...zinnenVan(f.hint), ...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) {
    const r = waar(v, x, z, v.soort === "ketting" ? sleutel.split(",") : undefined);
    if (r) return `waarheidscontrole: ${r} ("${z}")`;
  }
  return null;
}

let telling = 0;
let beweringen = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  if (v.soort === "puzzel") continue;
  const tabel = foutenVan(v);
  const nodig = v.soort === "keuze" ? v.keuzes.length - 1 : 5;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    beweringen += zinnenVan(f.eerste).length + zinnenVan(f.hint).length + zinnenVan(f.uitleg).length + f.weer.flatMap(zinnenVan).length;
    if (!DENKFOUTEN.includes(f.code)) fouten.push(`${v.id} ${a}: onbekende denkfout ${f.code}`);
    if (f.code === "onduidelijk") fouten.push(`${v.id} ${a}: vaste keuzes horen een denkfout te hebben (geleerd bij Getallenlijn)`);
    const r = controleer(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    hintsPerCode.get(f.code)!.add(kaal(f.hint));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* 2 foute antwoorden bij dezelfde vraag: niet 2 keer dezelfde eerste zin (keuring Meten). Bij de ketting telt de eerste
     kraal die niet klopt (zelfde kraal op dezelfde plek = "Je sleepte weer …"). */
  const sleutelVan = (a: string) => (v.soort === "ketting" ? (() => { const p = a.split(","); const i = p.findIndex((k, j) => k !== v.doel[j]); return `${i}:${p[i]}`; })() : a);
  const perSleutel = new Map<string, string>();
  for (const [a, f] of Object.entries(tabel)) perSleutel.set(sleutelVan(a), f.eerste);
  const eersten = [...perSleutel.values()];
  if (new Set(eersten).size !== eersten.length) fouten.push(`${v.id}: 2 foute antwoorden krijgen dezelfde eerste zin`);
}
/* Elk getal in een zin van Bliepo heeft een kleur of wit (14.20): geen kaal cijfer. */
const kaalCijfer = (z: string) => /\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""));
const alleZinnen: string[] = [ZIN.start, ZIN.kettingIntro, ZIN.kettingOpdracht, ZIN.kettingHand, ZIN.puzzelIntro, ZIN.puzzelOpdracht(true), ZIN.puzzelOpdracht(false), ZIN.puzzelHand, ...ZIN.samen, ZIN.samenHand, ZIN.samenKettingJij, ZIN.samenKettingHand, ZIN.samenKettingKlaar, ZIN.samenKettingZelf, ZIN.samenPuzzel, ZIN.samenPuzzelJij, ZIN.samenPuzzelKlaar, ZIN.samenPuzzelZelf, ...ZIN.puzzelWijs, ...ZIN.puzzelWijsJij, ZIN.puzzelVangnet1, ZIN.puzzelVangnet2, ZIN.kettingVangnet, ZIN.slot, ZIN.kaartTik, ...PUZZEL_FOUT.eerste, ...PUZZEL_FOUT.hint, PUZZEL_FOUT.uitleg];
for (const v of VRAGEN) {
  alleZinnen.push(...patroonReactie(v).zinnen);
  if (v.soort === "keuze") alleZinnen.push(...ZIN.vraag(v, true), ZIN.opnieuw(v), ZIN.samenPatroon(v.wat, v.eenheid, v.kleur), ZIN.samenGoed(v), ZIN.samenJij(v), ZIN.samenKlaar(v), ZIN.samenZelf(v));
  if (v.soort === "ketting") alleZinnen.push(ZIN.samenPatroon("kraal", v.eenheid), ZIN.samenKetting(v));
  if (v.soort !== "puzzel") for (const f of Object.values(foutenVan(v))) alleZinnen.push(f.eerste, f.hint, f.uitleg, ...f.weer);
}
for (const z of alleZinnen) if (kaalCijfer(z)) fouten.push(`getal zonder kleur in "${z}" (14.20)`);
/* Een getal dat naar kralen of vormen van 1 kleur verwijst, heeft die kleur (2.2); "2 keer" is wit. */
for (const z of alleZinnen) for (const m of z.matchAll(/\{(\d+):([a-z]+)\} (\w+)/g)) if (m[3] === "keer" ? m[2] !== "wit" : m[2] === "wit") fouten.push(`kleur van ${m[1]} klopt niet in "${z}"`);
/* De vraagzinnen zijn die van de oude les (squla-vormen.tsx). */
const OUD = ["Kijk naar de ketting.", "Welke kraal komt nu?", "Er is een lege plek in de ketting.", "Welke kraal hoort op de lege plek?", "Er is iets weg.", "Wat hoort bij de pijl?", "Kijk naar de vormen.", "Welke vorm komt nu?"];
for (const v of VRAGEN) if (v.soort === "keuze") for (const z of ZIN.vraag(v, false)) if (!OUD.includes(z) && !/^Welke kraal komt na de \w+ kraal\?$/.test(z)) fouten.push(`${v.id}: vraagzin niet van de oude les: "${z}"`);
/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${beweringen} beweringen nagelopen, ${alleZinnen.length} zinnen op kale cijfers).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 4. De tabel. */
const vraagNaam = (v: Vraag): string => {
  if (v.soort === "puzzel") return `${v.nr}. Puzzel (${v.n} × ${v.n} stukjes)`;
  if (v.soort === "ketting") return `${v.nr}. Maak de ketting langer (${v.rij.map((k) => KLEURWOORD[k][0]).join(", ")}; losse kralen ${v.losse.map((k) => KLEURWOORD[k][0]).join(", ")}; goed: ${v.doel.map((k) => KLEURWOORD[k][0]).join(", ")})`;
  const n = namen(v.wat, v.kleur);
  return `${v.nr}. ${kaal(ZIN.vraag(v, false).at(-1)!)} (${v.rij.map((x) => (x === null ? "▢" : n.kort(x))).join(", ")}; keuzes ${v.keuzes.map(n.kort).join(" / ")}; goed: ${n.kort(v.goed)})`;
};
const naamAntwoord = (v: Vraag, a: string) => (v.soort === "keuze" ? namen(v.wat, v.kleur).kort(a) : a.split(",").map((k) => KLEURWOORD[k as Kleur][0]).join(", "));
const rijen = VRAGEN.flatMap((v) => (v.soort === "puzzel" ? [] : Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${naamAntwoord(v, a)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`))).join("\n");
const samenTekst = (v: Vraag) => {
  if (v.soort === "keuze") return `"${kaal(ZIN.samenPatroon(v.wat, v.eenheid, v.kleur))}" (rondje om het stukje dat terugkomt) — rondje om de goede keuze: "${kaal(ZIN.samenGoed(v))}" — "${kaal(ZIN.samenJij(v))}" (het kind tikt hem aan; handje na ± 6 s) — "${kaal(ZIN.samenKlaar(v))}" (vangnet: "${kaal(ZIN.samenZelf(v))}")`;
  if (v.soort === "ketting") return `"${kaal(ZIN.samenPatroon("kraal", v.eenheid))}" — Bliepo legt de eerste 2 kralen: "${kaal(ZIN.samenKetting(v))}" — "${ZIN.samenKettingJij}" (het kind sleept de laatste; handje na ± 6 s) — "${ZIN.samenKettingKlaar}" (vangnet: "${ZIN.samenKettingZelf}")`;
  return "";
};
const uitleg = VRAGEN.flatMap((v) => (v.soort === "puzzel" ? [] : Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${naamAntwoord(v, a)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (3 versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "—"} | ${samenTekst(v)} |`))).join("\n");

const tekst = `# FOUTTABEL — gouden les Vormen: Patronen (squla-vormen-patronen-1-gouden, "Patronen")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-vormen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-vormen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, de kralen, de dingen, de vormen, de keuzes en de puzzel) is die van squla-vormen-patronen-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22, 15.25).** Synthesis heeft geen les over vormen of patronen (KOPPELING.md §13). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: hetzelfde als aan het eind, hetzelfde als ernaast, een paar dat nog niet af is, of iets wat in dit patroon niet direct na het vorige komt. Bliepo zegt alleen wat waar is over wat het kind koos en wat er in beeld ligt; hij verzint geen reden.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos en iets waars daarover, met een rood rondje om die keuze zolang hij het noemt. Daarna komt de hint met de vraag kort erachter, en tegelijk mag het kind opnieuw kiezen (geen 2 keer de vraag). Bij de ketting gaan de kralen terug naar beneden en is de hint de nieuwe opdrachtzin. Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin en de hint noemen het goede antwoord niet, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over. Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." en dan samen voordoen (laatste kolom): Bliepo wijst het stukje aan dat steeds terugkomt, nu staat het rondje om de goede keuze, en het kind tikt hem aan (de kleine stap). Bij de ketting legt Bliepo de eerste 2 kralen en sleept het kind de laatste. Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (4e kolom). Met een richting (links of rechts van de lege plek) is elke kant een eigen soort.
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" / "Je sleepte weer …".
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" / "Nu sleepte je …".
- **De puzzel** kan niet echt fout: een stukje op een verkeerde plek klikt niet vast. De 1e keer: "${PUZZEL_FOUT.eerste.join('" / "')}" + "${PUZZEL_FOUT.hint.join('" / "')}" (de opdracht blijft). De 2e keer: "${PUZZEL_FOUT.uitleg}" en samen voordoen: een rondje om de plek van 1 stukje, het kind sleept het erheen. Daarna bij elke verkeerde plek het rondje opnieuw. Denkfout \`stukje-mis\`. Vangnet: 20 s geen stukje erbij = Bliepo legt er 1; nog 20 s = Bliepo maakt de puzzel af.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle foute keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen; de puzzel staat hierboven)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-vormen-patronen-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-vormen-patronen-1-gouden.md geschreven.");
