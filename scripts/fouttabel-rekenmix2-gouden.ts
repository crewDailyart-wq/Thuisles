/**
 * Maakt FOUTTABEL-squla-rekenmix-mix2-1-gouden.md uit de code (squla-rekenmix2-gouden-zinnen.ts) en controleert de fouttabel
 * (12 november 2026; strenger gemaakt op 18 november 2026, zoals Tellen, Meer-minder en Tijd: ALLE varianten worden gekeurd
 * en de kiezer wordt nagespeeld met dezelfde functies als de les: foutReactie, opnieuwZin, samenZinnen, goedReactie).
 *   1. inhoud: dezelfde 15 vragen (boterham of spiesje, beleg, vraag, volgorde van de 3 plaatjes) als de oude les squla-rekenmix-mix2-1;
 *   2. elk fout plaatje heeft een rij met een vaste denkfout;
 *   3. waarheid: elke variant van wat Bliepo zegt (over het gekozen plaatje, bij samen kijken, na goed) klopt;
 *   4. verklappen (15.17): geen hint noemt een richting of een plek; na de eerste zin blijven 2 plaatjes over;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. tekstvak: elk stuk hooguit 110 tekens; bij elke hint passen minstens 2 versies van de vraag erachter;
 *   7. WOORDEN-GROEP3.md: geen woord van de niet-lijst, geen "fout", geen "vinkje", geen cijfers zonder kleur;
 *   8. de kiezer nagespeeld in 2.000 lessen (willekeurige antwoorden): nooit 2 keer achter elkaar dezelfde zin, geen
 *      woord 2 keer in 1 reactie, 2e keer een ander begin, "weer" alleen bij hetzelfde plaatje, altijd een vraag of opdracht.
 *   npx tsx scripts/fouttabel-rekenmix2-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import {
  VRAGEN,
  ZIN,
  GOEDREACTIE,
  AANMOEDIG,
  MAX_STUK,
  WISSEL,
  kaal,
  past,
  foutenVan,
  goedPlaatje,
  doelNiveau,
  metVoorbeeld,
  weerGekozen,
  woordenVan,
  foutReactie,
  opnieuwZin,
  opnieuwVoor,
  hintsDiePassen,
  samenZinnen,
  samenKlaarZin,
  handZin,
  goedReactie,
  goedReacties,
  type Fout,
  type Vraag2,
} from "../src/components/les/lessen/squla-rekenmix2-gouden-zinnen";
import { LOF } from "../src/components/les/lessen/squla-klok-gouden-zinnen";

const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix2-1"'), bron.indexOf("const mix2_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const oud = [...vragenBlok.matchAll(/\{ t: "hoeveel", ding: "(\w+)", keuzes: \[([\d, ]+)\], wat: "(\w+)"(?:, beleg: "(\w+)")? \}/g)].map((m) => ({ soort: m[1], keuzes: JSON.parse(`[${m[2]}]`) as number[], wat: m[3], beleg: m[4] }));
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} vragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    if (JSON.stringify(o) !== JSON.stringify({ soort: v.soort, keuzes: v.keuzes, wat: v.wat, beleg: v.beleg })) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify({ soort: v.soort, keuzes: v.keuzes, wat: v.wat, beleg: v.beleg })}`);
    if (!v.keuzes.includes(doelNiveau(v)) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede plaatje staat er niet in of de 3 plaatjes zijn niet verschillend`);
  });
  /* De fixes van de logica-controle (F16) blijven: de eerste vraag zonder "vinkje" en met de opdracht. */
  const v1 = ZIN.vraag(VRAGEN[0], true).join(" ");
  if (v1 !== "Kijk naar de boterham bovenaan. Op welke boterham zit meer kaas? Tik op de goede boterham.") fouten.push(`vraag 1 is veranderd: "${v1}"`);
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix2-1 vergeleken (boterham of spiesje, beleg, vraag, volgorde van de plaatjes).`);
}

/* 2-6. Tabel, waarheid, verklappen, opdrachten, tekstvak — voor ELKE variant. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg|Kies)\b/;
const RICHTING = /voller|leger|volst|leegst|meeste|minste|\bmeest\b|\bminst\b|\bmeer\b|minder|evenveel|zoveel|zelfde|precies|lijkt/i;
const PLEK = /\blinks|rechts|midden|middelste|\beerste\b|\btweede\b|\bderde\b|\blaatste\b|vlak naast|dichtbij|bijna|tussen/i;
const isVraagOfOpdracht = (z: string) => /\?\s*$/.test(kaal(z)) || /(^|[.!?] )(Tik|Kies)\b/.test(kaal(z));
let beweringen = 0;
let telling = 0;
let varianten = 0;
const zegt = (z: string, re: RegExp) => re.test(kaal(z));
for (const v of VRAGEN) {
  const F = foutenVan(v);
  v.keuzes.forEach((niv, k) => {
    if (niv !== doelNiveau(v) && !F[String(k)]) fouten.push(`geen rij voor ${v.id} plaatje ${k}`);
  });
  if (F[String(goedPlaatje(v))]) fouten.push(`${v.id}: het goede plaatje heeft een fouttabel-rij`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const c = v.keuzes[Number(a)];
    const waar = `${v.id} plaatje ${a}`;
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    const V = f.v;
    varianten += V.eerste.length + V.nuEerste.length + V.hint.length + V.uitleg.length + V.weerEerste.length + V.weerUitleg.length;
    const klopt = (z: string, ok: boolean, wat: string) => {
      beweringen++;
      if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
    };
    /* Waarheid over het gekozen plaatje, voor elke eerste zin (ook "Nu koos je …"). */
    for (const z of [...V.eerste, ...V.nuEerste]) {
      if (metVoorbeeld(v)) {
        if (zegt(z, /evenveel|net zoveel|precies op/)) klopt(z, c === 1, "evenveel als bovenaan");
        else if (zegt(z, /\bmeer\b/)) klopt(z, c > 1, "meer dan bovenaan");
        else if (zegt(z, /minder/)) klopt(z, c < 1, "minder dan bovenaan");
        else fouten.push(`${waar}: de eerste zin zegt niet wat er klopt: "${z}"`);
      } else {
        const meest = v.wat === "meest";
        if (zegt(z, /juist/)) klopt(z, meest ? c === 0 && zegt(z, /minst/) : c === 2 && zegt(z, /meest/), "juist het tegenovergestelde");
        else if (zegt(z, /niet/)) klopt(z, c === 1 && zegt(z, meest ? /meeste/ : /minste/), "niet het meeste/minste (het middelste)");
        else fouten.push(`${waar}: de eerste zin zegt niet wat er klopt: "${z}"`);
        if (zegt(z, /veel/) && !zegt(z, /\bmeer|meest/)) klopt(z, c === 1, "veel (het middelste plaatje)");
      }
      if (PLEK.test(kaal(z))) fouten.push(`${waar}: de eerste zin noemt een plek: "${z}"`);
      if (!past(z)) fouten.push(`${waar}: te lang voor het tekstvak: "${z}"`);
      if (/\bweer\b/i.test(z)) fouten.push(`${waar}: "weer" in een gewone eerste zin: "${z}"`);
    }
    /* Verklappen: de hint noemt geen richting en geen plek; er passen minstens 2 versies van de vraag achter. */
    for (const z of V.hint) {
      if (RICHTING.test(kaal(z))) fouten.push(`${waar}: de hint noemt een richting: "${z}"`);
      if (PLEK.test(kaal(z))) fouten.push(`${waar}: de hint noemt een plek: "${z}"`);
      if (/\?\s*$/.test(z)) fouten.push(`${waar}: de hint eindigt met een eigen vraag (dan 2 vragen achter elkaar): "${z}"`);
    }
    if (hintsDiePassen(v, V.hint).length < V.hint.length) fouten.push(`${waar}: na sommige hints passen geen 2 versies van de vraag: ${V.hint.filter((h) => !hintsDiePassen(v, [h]).length).join(" | ")}`);
    if (new Set(V.hint).size < 3) fouten.push(`${waar}: minder dan 3 hints`);
    /* Na de eerste zin blijven 2 plaatjes over, altijd met het goede erbij. */
    const over = v.keuzes.filter((_, k) => k !== Number(a));
    if (over.length !== 2 || !over.includes(doelNiveau(v))) fouten.push(`${waar}: na de eerste zin blijven niet 2 plaatjes over met het goede`);
    for (const z of [...V.uitleg, ...V.weerEerste, ...V.weerUitleg]) {
      if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${z}"`);
      if (!past(z)) fouten.push(`${waar}: te lang: "${z}"`);
    }
    for (const z of V.weerEerste) if (!/\bweer\b/i.test(z)) fouten.push(`${waar}: weer-zin zonder "weer": "${z}"`);
  }
  /* De vraag na de hint: altijd een vraag of opdracht, nooit de vraag van de eerste keer, nooit een plek. */
  for (const z of ZIN.opnieuw(v)) {
    if (!isVraagOfOpdracht(z)) fouten.push(`${v.id}: de vraag na de hint is geen vraag of opdracht: "${z}"`);
    if (PLEK.test(kaal(z))) fouten.push(`${v.id}: de vraag na de hint noemt een plek: "${z}"`);
    if (ZIN.vraag(v).includes(z)) fouten.push(`${v.id}: de vraag na de hint is dezelfde zin als de eerste keer: "${z}"`);
  }
  /* Samen kijken: wat Bliepo bij elk plaatje zegt klopt met dat plaatje. */
  for (const niv of [0, 1, 2])
    for (const z of ZIN.samenPlaatje(v, niv)) {
      beweringen++;
      const ok = metVoorbeeld(v)
        ? niv === 0
          ? zegt(z, /minder/)
          : niv === 2
            ? zegt(z, /\bmeer\b/)
            : zegt(z, /evenveel|net zoveel|precies op/)
        : niv === 0
          ? zegt(z, /minste/)
          : niv === 2
            ? zegt(z, /meeste/)
            : zegt(z, /meer/) && !zegt(z, /meeste/);
      if (!ok) fouten.push(`${v.id}: samen kijken, plaatje met niveau ${niv}: niet waar: "${z}"`);
    }
  /* Na goed en bij samen klaar: wat Bliepo zegt past bij de vraag. */
  const goedWoord = v.wat === "meer" ? /\bmeer\b|voller/ : v.wat === "minder" ? /minder|leger/ : v.wat === "evenveel" ? /evenveel|net zoveel|net zo|precies op/ : v.wat === "meest" ? /meeste|volst|\bmeest\b/ : /minste|leegst|\bminst\b/;
  for (const z of [...GOEDREACTIE(v).zinnen, ...ZIN.samenKlaar(v), ...ZIN.samenZelf(v), ...ZIN.samenTik(v).slice(0, 1)]) {
    beweringen++;
    if (!goedWoord.test(kaal(z))) fouten.push(`${v.id}: zegt niet wat er goed is: "${z}"`);
  }
  for (const z of ZIN.samenZelf(v)) if (/^ja\b/i.test(z)) fouten.push(`${v.id}: "Ja" na het vangnet: "${z}"`);
  for (const z of [...ZIN.samenTik(v), ...ZIN.samenHand(v)]) if (!isVraagOfOpdracht(z)) fouten.push(`${v.id}: geen opdracht bij samen kijken: "${z}"`);
  for (const z of ZIN.samenHand(v)) for (const a of AANMOEDIG) if (!past(a, z)) fouten.push(`${v.id}: hulphandje te lang: "${a} ${z}"`);
  /* Nooit 2 keer "Ja" en nooit een woord van de lof herhaald: na elke lofzin blijft er een reactie over. */
  for (const lof of LOF.zinnen) {
    const r = goedReacties(v, lof);
    if (!r.length) fouten.push(`${v.id}: na "${lof}" past geen reactie`);
    for (const z of r) if (/^ja\b/i.test(z) && /\bja\b/i.test(lof)) fouten.push(`${v.id}: 2 keer "Ja": "${lof} ${z}"`);
  }
  for (const z of ZIN.vraag(v, true)) if (!past(z)) fouten.push(`${v.id}: vraag te lang: "${z}"`);
  if (!past(...ZIN.vraag(v, true))) fouten.push(`${v.id}: de eerste vraag past niet in 1 stuk`);
  for (const intro of ZIN.vraagIntro(v)) if (!past(...ZIN.vraag(v, false, intro))) fouten.push(`${v.id}: vraag met "${intro}" past niet in 1 stuk`);
}

/* 7. Alle zinnen van de les: niet-lijst, "fout", "vinkje", cijfers, lidwoorden. */
const alleZinnen: string[] = [...ZIN.begin, ...ZIN.samenHelp, ...ZIN.slot, ...ZIN.kaartTik, ...AANMOEDIG];
for (const v of VRAGEN) {
  alleZinnen.push(...ZIN.vraag(v, false), ...ZIN.vraag(v, true), ...ZIN.vraagIntro(v), ...ZIN.opnieuw(v), ZIN.samenKijk(v), ...[0, 1, 2].flatMap((n) => ZIN.samenPlaatje(v, n)), ...ZIN.samenTik(v), ...ZIN.samenHand(v), ...ZIN.samenKlaar(v), ...ZIN.samenZelf(v), ...GOEDREACTIE(v).zinnen, weerGekozen(v));
  for (const f of Object.values(foutenVan(v))) alleZinnen.push(...f.v.eerste, ...f.v.nuEerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg);
}
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding)\b/i;
let cijfers = 0;
for (const z of new Set(alleZinnen)) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b/i.test(z)) fouten.push(`het woord "fout": "${z}"`);
  if (/vinkje/i.test(z)) fouten.push(`het woord "vinkje" (dan valt de hele zin weg, F16): "${z}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) {
    cijfers++;
    fouten.push(`cijfer zonder kleur in een zin (14.20): "${z}"`);
  }
  if (/\b(de|het)\s+(de|het)\b/i.test(z)) fouten.push(`dubbel lidwoord: "${z}"`);
  if (/\belke spiesje\b|\belk boterham\b|\bdeze spiesje\b|\bdit boterham\b|\bandere spiesje\b|\bdie spiesje\b|\bdat boterham\b|\bwelke spiesje\b|\bwelk boterham\b|\bde goede spiesje\b|\bdezelfde spiesje\b|\bhetzelfde boterham\b/i.test(z)) fouten.push(`verkeerd lidwoord: "${z}"`);
  if (!past(z)) fouten.push(`te lang voor het tekstvak (${kaal(z).length} > ${MAX_STUK}): "${z}"`);
}

/* 8. De kiezer naspelen: 2.000 lessen met willekeurige antwoorden, precies zoals de les kiest. */
const vorm = maakVorm(WISSEL);
const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar al bij hoe waar welke welk we jij ik hem zit zitten heeft is".split(" "));
const woordenIn = (t: string) => kaal(t).toLowerCase().split(/[^a-zà-ÿ0-9']+/).filter(Boolean);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
/** Een woord (geen klein woordje, geen woord uit de vraag) 2 keer in 1 reactie? */
function dubbel(v: Vraag2, delen: string[]): string | null {
  const vraagWoorden = new Set([...ZIN.vraag(v, true), ...ZIN.opnieuw(v)].flatMap(woordenIn));
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenIn)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) if (n >= 2 && !KLEIN.has(w) && !vraagWoorden.has(w)) return `"${w}" ${n} keer`;
  return null;
}
const tel = { dubbel: 0, achterElkaar: 0, woord: 0, zelfdeBegin: 0, inVraag: 0, weer: 0, lang: 0, geenOpdracht: 0, reacties: 0, vragen: 0 };
const voorbeelden: string[] = [];
const meld = (soort: keyof typeof tel, tekst: string) => {
  tel[soort]++;
  if (voorbeelden.length < 12) voorbeelden.push(`${soort}: ${tekst}`);
};
{
  let zaad = 2026;
  const toeval = () => ((zaad = (zaad * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const pak = <T,>(l: readonly T[]) => l[Math.floor(toeval() * l.length)];
  for (let les = 0; les < 2000; les++) {
    const K = maakKiezer({ wissel: WISSEL, toeval });
    const vorigePerSleutel = new Map<string, string>();
    let laatste = "";
    const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
      const z = K.kies(sleutel, zinnen, mag);
      if (vorigePerSleutel.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) meld("dubbel", `${sleutel}: 2 keer "${kaal(z)}"`);
      vorigePerSleutel.set(sleutel, vorm(z));
      return z;
    };
    /* Wat Bliepo zegt, stuk voor stuk: nooit 2 keer achter elkaar hetzelfde stuk, nooit te lang. */
    const stuk = (z: string) => {
      if (!past(z)) meld("lang", kaal(z));
      if (vorm(z) === laatste) meld("achterElkaar", kaal(z));
      laatste = vorm(z);
    };
    stuk(variant("begin", ZIN.begin));
    VRAGEN.forEach((v, i) => {
      tel.vragen++;
      const gezegd: string[] = [];
      /* Dezelfde zin 2 keer bij 1 vraag (de vraagzin zelf mag na de hint terugkomen: 15.37). */
      const vraagZinnen = new Set(ZIN.vraag(v, false).map((z) => kaal(z).toLowerCase()));
      const zeg = (...z: string[]) => {
        for (const q of z.flatMap(zinnenVan).map((x) => x.toLowerCase())) {
          if (gezegd.includes(q) && !vraagZinnen.has(q)) meld("inVraag", `${v.id}: "${q}" 2 keer bij 1 vraag`);
          gezegd.push(q);
        }
      };
      const vraag = ZIN.vraag(v, i === 0, i === 0 || !metVoorbeeld(v) ? "" : variant("intro", ZIN.vraagIntro(v)));
      stuk(vraag.join(" "));
      zeg(...vraag);
      const r = toeval();
      if (r < 0.25) {
        const lof = pak(LOF.zinnen);
        const g = goedReactie(variant, v, lof);
        stuk(`${lof} ${g}`);
        return;
      }
      const tabel = foutenVan(v);
      const plekken = Object.keys(tabel);
      const a1 = pak(plekken);
      const f1: Fout = tabel[a1];
      const s1 = foutReactie(variant, f1, 1, { zelfdePlaatje: false, eersteZin: "" });
      tel.reacties++;
      if (/\bweer\b/i.test(s1[0])) meld("weer", `"weer" bij de 1e keer: "${kaal(s1[0])}"`);
      const op = opnieuwZin(variant, v, s1[1]);
      if (!opnieuwVoor(v, s1[1]).includes(op)) meld("lang", `vraag na de hint past niet: ${kaal(s1[1])} ${kaal(op)}`);
      const d1 = dubbel(v, [s1[0], s1[1], op]);
      if (d1) meld("woord", `${d1}: ${kaal(s1.join(" "))} ${kaal(op)}`);
      stuk(s1[0]);
      stuk(`${s1[1]} ${op}`);
      if (!isVraagOfOpdracht(op)) meld("geenOpdracht", kaal(op));
      zeg(s1[0], s1[1], op);
      if (r < 0.55) {
        /* Goed na een fout: een korte bevestiging uit het gedeelde rijtje (niet van deze les). */
        laatste = "";
        return;
      }
      const a2 = toeval() < 0.4 ? a1 : plekken.find((p) => p !== a1) ?? a1;
      const s2 = foutReactie(variant, tabel[a2], 2, { zelfdePlaatje: a2 === a1, eersteZin: s1[0] });
      tel.reacties++;
      if (a2 !== a1 && woordenIn(s2[0]).slice(0, 2).join(" ") === woordenIn(s1[0]).slice(0, 2).join(" ")) meld("zelfdeBegin", `"${kaal(s1[0])}" en daarna "${kaal(s2[0])}"`);
      if (/\bweer\b/i.test(s2[0]) !== (a2 === a1)) meld("weer", `"weer" klopt niet: "${kaal(s2[0])}" (zelfde plaatje: ${a2 === a1})`);
      const d2 = dubbel(v, s2);
      if (d2) meld("woord", `${d2}: ${kaal(s2.join(" "))}`);
      for (const z of s2) if (OPDRACHT.test(kaal(z))) meld("geenOpdracht", `opdracht bij de 2e fout: ${kaal(z)}`);
      s2.forEach(stuk);
      zeg(...s2);
      const help = variant("samenHelp", ZIN.samenHelp);
      stuk(help);
      zeg(help);
      const samen = samenZinnen(variant, v);
      samen.plaatjes.forEach(stuk);
      zeg(...samen.plaatjes);
      stuk(samen.tik);
      if (!isVraagOfOpdracht(samen.tik)) meld("geenOpdracht", kaal(samen.tik));
      zeg(samen.tik);
      if (toeval() < 0.3) {
        const h = handZin(variant, v);
        if (!past(h)) meld("lang", kaal(h));
        if (!isVraagOfOpdracht(h)) meld("geenOpdracht", kaal(h));
      }
      const zelf = toeval() < 0.15;
      const volgorde = [...v.keuzes].sort((x, y) => x - y);
      const klaar = samenKlaarZin(variant, v, zelf, [samen.plaatjes[volgorde.indexOf(doelNiveau(v))], samen.tik]);
      stuk(klaar);
      zeg(klaar);
    });
    stuk(variant("slot", ZIN.slot));
    const k = variant("kaartTik", ZIN.kaartTik);
    if (!isVraagOfOpdracht(k)) meld("geenOpdracht", k);
  }
}

const somNaspel = Object.entries(tel).filter(([k]) => k !== "reacties" && k !== "vragen").reduce((a, [, n]) => a + n, 0);
if (somNaspel) fouten.push(`kiezer nagespeeld: ${JSON.stringify(tel)}\n  ${voorbeelden.join("\n  ")}`);
else console.log(`Kiezer nagespeeld: 2.000 lessen, ${tel.vragen} vragen, ${tel.reacties} reacties: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een woord 2 keer in 1 reactie, 0 keer hetzelfde begin bij de 2e keer, 0 keer dezelfde zin 2 keer bij 1 vraag, "weer" alleen bij hetzelfde plaatje, 0 keer te lang, altijd een vraag of opdracht.`);

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute plaatjes, ${varianten} varianten in de fouttabel; waarheid ${beweringen} beweringen; ${new Set(alleZinnen).size} verschillende zinnen nagelopen (niet-lijst, "fout", "vinkje", cijfers, lidwoorden, lengte; ${cijfers} cijfers)`);
if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log("Alles in orde: alles waar, geen richting of plek in een hint, geen herhaling, alles past in het tekstvak.");

/* De leesbare tabel. */
const SOORT = { meer: "meer", minder: "minder", evenveel: "evenveel", meest: "de meeste", minst: "de minste" } as const;
const NIV = ["weinig", "veel", "heel veel"];
const lijst = (l: string[]) => l.map(kaal).join(" / ");
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]: [string, Fout]) => `| ${v.nr}. ${woordenVan(v).ding} met ${woordenVan(v).wat}, ${SOORT[v.wat]} (plaatjes ${v.keuzes.map((n) => NIV[n]).join(" / ")}) | plaatje ${Number(a) + 1} (${NIV[v.keuzes[Number(a)]]}) | \`${f.code}\` — ${f.denkfout} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} | ${f.scherm} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr}. ${woordenVan(v).ding} met ${woordenVan(v).wat}, ${SOORT[v.wat]} | plaatje ${Number(a) + 1} (\`${f.code}\`) | ${lijst(f.v.nuEerste)} | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} + ${lijst(f.v.weerUitleg)} |`),
).join("\n");
const opnieuw = VRAGEN.map((v) => `| ${v.nr}. ${woordenVan(v).ding} met ${woordenVan(v).wat}, ${SOORT[v.wat]} | ${lijst(ZIN.opnieuw(v))} |`).join("\n");
const samen = VRAGEN.map((v) => `| ${v.nr}. ${SOORT[v.wat]} | ${[0, 1, 2].map((n) => `${NIV[n]}: ${lijst(ZIN.samenPlaatje(v, n))}`).join("<br>")} | ${lijst(ZIN.samenTik(v))} | ${lijst(ZIN.samenKlaar(v))} | ${lijst(GOEDREACTIE(v).zinnen)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekenmix 2 (squla-rekenmix-mix2-1-gouden)

Gemaakt op 12 november 2026, bijgewerkt op 18 november 2026 (Bliepo als warme juf: alle zinnen in varianten). **Uit de code** met \`npx tsx scripts/fouttabel-rekenmix2-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix2-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, boterham of spiesje, beleg, vraag, volgorde van de 3 plaatjes) is die van de oude les squla-rekenmix-mix2-1 (BOUWREGELS 15.22). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENMIX2.md.

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen vergelijken hoeveel er op een boterham of spiesje zit (meer, minder, evenveel, de meeste, de minste; zonder getal), dus ze volgen de **gouden les Meer-minder**: tik op een plaatje (alleen een vinkje) en dan op het vinkje van het lesscherm. **Eigen invulling, niet van Synthesis:** de hints, de uitleg en deze tabel (More or Less heeft geen plaatjes zonder getal).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, een eerste zin (wat er klopt van het gekozen plaatje; sluit alleen dat plaatje uit), dan in 1 stuk de hint (geen richting, geen plek) en de vraag in andere woorden (F16, BOUWREGELS 15.37). 2e fout = een eerste zin (hetzelfde plaatje: "Je koos weer …"; een ander plaatje: met een ander begin dan de 1e keer) en de uitleg (geen opdracht), "Kom, we kijken samen." (of een andere versie), Bliepo wijst elk plaatje aan en zegt hoeveel erop zit, en het kind tikt het goede plaatje; de les gaat door. Elke lijst hieronder = varianten; de les kiest er steeds 1, nooit 2 keer achter elkaar dezelfde (gedeelde kiezer \`nooit-dubbel.ts\`).

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`koos-evenveel\` | koos het plaatje met evenveel als bovenaan |
| \`koos-meer\` | koos het plaatje met meer dan bovenaan |
| \`koos-minder\` | koos het plaatje met minder dan bovenaan |
| \`koos-het-tegenovergestelde\` | koos juist het minste (bij de meeste) of het meeste (bij de minste) |
| \`koos-het-middelste\` | koos het plaatje dat niet het meeste of minste heeft |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen (komt niet voor) |

## 2. Per vraag: elk fout plaatje (${telling} rijen)

| Vraag | Fout plaatje | Denkfout | Bliepo's eerste zin (varianten) | Hint (varianten) | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De vraag na de hint (varianten; nooit de zin van de eerste keer)

| Vraag | Versies |
|---|---|
${opnieuw}

## 4. Na de 2e fout

| Vraag | 2e fout (denkfout) | Eerste zin bij een ander plaatje (plus de eerste zinnen uit §2 met een ander begin) | Uitleg | Hetzelfde plaatje 2 keer |
|---|---|---|---|---|
${uitleg}

## 5. Samen kijken en goed

| Vraag | Bliepo bij elk plaatje | Nu het kind | Klaar | Reactie na de lof |
|---|---|---|---|---|
${samen}

## 6. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix2-1; vraag 1 ongewijzigd ("… Tik op de goede boterham."); ${telling} foute plaatjes met een vaste denkfout; ${varianten} varianten in de fouttabel; waarheid (${beweringen} beweringen, elke variant); geen hint noemt een richting of plek en na de eerste zin blijven 2 plaatjes over; geen opdracht in de uitleg; elk stuk hooguit ${MAX_STUK} tekens en na elke hint passen 2 versies van de vraag; geen woord van de niet-lijst, geen "fout", geen "vinkje", geen cijfers zonder kleur; de kiezer nagespeeld in 2.000 lessen (0 keer dezelfde zin achter elkaar, 0 keer een woord 2 keer in 1 reactie, "weer" alleen bij hetzelfde plaatje, altijd een vraag of opdracht).
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix2-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix2-1-gouden.md geschreven");
