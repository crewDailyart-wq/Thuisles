/**
 * Maakt FOUTTABEL-squla-rekenmix-mix3-4-gouden.md uit de code (squla-rekenmix3-gouden-zinnen.ts) en keurt de fouttabel
 * (12 november 2026; 18 november 2026: ALLE varianten, zoals bij Tellen, Klok, Vormen, Rekentaal en Rekenmix 4). Controles:
 *   1. inhoud: dezelfde 15 vragen (ding, doos of zak, totaal, deel buiten, keuzes) als de oude les squla-rekenmix-mix3-4;
 *   2. elk fout antwoord heeft een rij met een vaste denkfout en genoeg varianten;
 *   3. waarheidscontrole op elke variant: de som in de eerste zin klopt (buiten + gekozen), "te veel" / "te weinig" in de
 *      goede richting, "buiten" alleen bij het deel dat je ziet, "totaal" alleen bij het totaal, enkelvoud bij 1;
 *   4. verklappen (15.17): geen variant noemt het goede getal;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. niets dubbel (15.29): in elke combinatie die de les kan kiezen geen woord of getal 2 keer; achter elke eerste zin
 *      passen minstens 2 hints en 2 uitleggen; varianten in 1 rijtje zijn nooit dezelfde zin;
 *   7. altijd een vraag of opdracht na de hint (15.37, F16); "Hoeveel zitten er in de doos?" blijft 1 van de versies;
 *   8. alles past in het tekstvak (hooguit 110 tekens en 3 zinnen per stuk);
 *   9. WOORDEN-GROEP3.md: geen woord van de niet-lijst, geen "fout", geen "vinkje", elk getal een kleur;
 *  10. de kiezer wordt 20.000 lessen lang nagespeeld met dezelfde functies als de les (foutReactie3, opnieuw3).
 *   npx tsx scripts/fouttabel-rekenmix3-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import { EINDE, EINDE_VEEL_FOUTEN, LOF, MOMENT, NAAM_GROET, NAAM_LOF, metNaam } from "../src/components/les/lessen/squla-klok-gouden-zinnen";
import { RM3, SPLITSREACTIE_3, SPLITSREACTIE_JA, VRAGEN, WISSEL_3, ZIN, eindigtMetOpdracht4, foutReactie3, fouten3, herhaling4, hintsNa3, kaal4 as kaal, opnieuw3, opnieuwNa3, past4, plekken, uitlegNa3, vraagWoorden3, type Fout3 } from "../src/components/les/lessen/squla-rekenmix3-gouden-zinnen";

const fouten: string[] = [];
const vorm = maakVorm(WISSEL_3);
const getallen = (z: string): string[] => kaal(z).match(/\d+/g) ?? [];
const getalDubbel = (a: string, b: string) => getallen(a).some((n) => getallen(b).includes(n));

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix3-4"'), bron.indexOf("Rekenmix 4 (Squla 12435)"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const oud = [...vragenBlok.matchAll(/\{ t: "splits", v: (\w+), houder: "(\w+)", tot: (\d+), buiten: (\d+), keuzes: \[([\d, ]+)\] \}/g)].map((m) => ({ ding: m[1] === "BAL" ? "ballen" : "knikkers", houder: m[2], tot: Number(m[3]), buiten: Number(m[4]), keuzes: JSON.parse(`[${m[5]}]`) as number[] }));
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} splitsvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const nieuw = { ding: v.ding.naam, houder: v.houder, tot: v.tot, buiten: v.buiten, keuzes: v.keuzes };
    if (JSON.stringify(o) !== JSON.stringify(nieuw)) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify(nieuw)}`);
    if (!v.keuzes.includes(v.binnen) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
    const pl = plekken(v);
    if (pl.filter((p) => p.rol === "buiten").length !== v.buiten || pl.filter((p) => p.rol === "binnen").length !== v.binnen) fouten.push(`vraag ${v.nr}: aantal dingen in beeld klopt niet`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix3-4 vergeleken (ding, doos of zak, totaal, deel buiten, keuzes).`);
}

/* 2–9. Elke variant van elk fout antwoord. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg|Probeer|Denk)\b/;
let beweringen = 0;
let telling = 0;
let varianten = 0;
const nietWaar = (waar: string, z: string, re: RegExp, ok: boolean, wat: string) => {
  if (!re.test(kaal(z))) return;
  beweringen++;
  if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${kaal(z)}")`);
};
const nooitDubbel = (waar: string, lijst: string[]) => {
  const v = lijst.map(vorm);
  if (new Set(v).size !== v.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin: ${lijst.map(kaal).join(" | ")}`);
};

for (const v of VRAGEN) {
  const F = fouten3(v);
  const vraagZin = kaal(ZIN.vraag(v).join(" "));
  if (!RM3.opnieuw(v).includes(ZIN.opnieuw(v))) fouten.push(`${v.id}: "${ZIN.opnieuw(v)}" (logica-controle) is geen versie meer van de vraag na de hint`);
  for (const k of v.keuzes) if (k !== v.binnen && !F[String(k)]) fouten.push(`geen rij voor ${v.id} ${k}`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    const V = f.v;
    if (V.eerste.length < 3) fouten.push(`${waar}: maar ${V.eerste.length} eerste zinnen`);
    if (V.hint.length < 3) fouten.push(`${waar}: maar ${V.hint.length} hints`);
    if (V.uitleg.length < 2) fouten.push(`${waar}: maar ${V.uitleg.length} uitleggen`);
    if (V.weerEerste.length < 2 || V.weerUitleg.length < 2) fouten.push(`${waar}: te weinig "weer"-zinnen`);
    for (const [naam, lijst] of Object.entries(V)) nooitDubbel(`${waar} ${naam}`, lijst);
    const weerG = RM3.weerGekozen(x, v.ding);
    const alles = [...V.eerste, ...V.hint, ...V.uitleg, ...V.weerEerste, ...V.weerUitleg, ...weerG];
    varianten += alles.length;
    for (const z of alles) {
      nietWaar(waar, z, /te veel|meer dan|te hoog|boven de|te groot/, x > v.binnen && x !== v.tot, "te veel, maar het kind koos niet te veel");
      nietWaar(waar, z, /te weinig|minder dan|te laag|niet tot|te klein/, x < v.binnen && x !== v.buiten, "te weinig, maar het kind koos niet te weinig");
      nietWaar(waar, z, /liggen er buiten|ligt er buiten|Die \d+ zie je al|die buiten liggen|van buiten|Die (ligt|liggen) buiten|zie je al buiten/, x === v.buiten, "buiten, maar het gekozen getal is niet het deel dat je ziet");
      nietWaar(waar, z, /is het totaal|zijn er samen|Dat zijn ze allemaal|alle \w+ samen|Zoveel zijn het er samen/, x === v.tot, "totaal, maar het gekozen getal is niet het totaal");
      /* Verklappen: geen variant noemt wat er in de doos zit (het goede getal). */
      if (getallen(z).includes(String(v.binnen)) && !/tot \d+|vanaf \d+|bij \d+|er \d+\.|^\d+ (ligt|liggen)|Die \d+|is \d+\.|samen \d+|dat \d+\.|zijn er \d+|de \d+/.test(kaal(z))) fouten.push(`${waar}: noemt het goede getal ${v.binnen}: "${kaal(z)}"`);
    }
    /* De som in de eerste zin klopt. */
    for (const e of V.eerste) {
      const m = /samen met de \w+ buiten is dat (\d+)|zijn er (\d+) |maakt samen (\d+)|samen (\d+)\.|erbij is dat (\d+)/.exec(kaal(e));
      if (m && (f.code === "te-veel" || f.code === "te-weinig")) {
        beweringen++;
        const som = Number(m.slice(1).find(Boolean));
        if (som !== v.buiten + x) fouten.push(`${waar}: de som klopt niet: ${som} i.p.v. ${v.buiten + x} ("${kaal(e)}")`);
      }
    }
    for (const z of [...V.uitleg, ...V.weerEerste, ...V.weerUitleg]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    for (const e of [...V.eerste, ...weerG]) {
      if (!past4(e)) fouten.push(`${waar}: te lang: "${kaal(e)}"`);
      const hints = hintsNa3(f, v, e);
      const uitleg = uitlegNa3(V.uitleg, v, e);
      if (V.eerste.includes(e) && hints.length < 2) fouten.push(`${waar}: na "${kaal(e)}" passen maar ${hints.length} hints`);
      if (uitleg.length < 2) fouten.push(`${waar}: na "${kaal(e)}" passen maar ${uitleg.length} uitleggen`);
      if (!V.eerste.includes(e)) continue;
      for (const h of hints) if (!eindigtMetOpdracht4(h) && !opnieuwNa3(v, e, h).length) fouten.push(`${waar}: na "${kaal(e)} ${kaal(h)}" past geen vraag meer (F16)`);
    }
    for (const w of V.weerEerste) if (uitlegNa3(V.weerUitleg, v, w).length < 1) fouten.push(`${waar}: na "${kaal(w)}" past geen uitleg`);
    for (const z of RM3.opnieuw(v)) if (kaal(z) === vraagZin) fouten.push(`${waar}: de vraag na de hint is precies de hele vraag van de 1e keer`);
  }
}

/* 9. Alle andere zinnen van de les. */
const alleZinnen: string[] = [...RM3.begin, ...RM3.slot, ...RM3.kaartTik, ...RM3.aanmoedigTikken];
for (const v of VRAGEN) {
  alleZinnen.push(...RM3.vraag(v, false), ...RM3.vraag(v, true), ...RM3.opnieuw(v), ...RM3.samenHelp(v), ...RM3.samenBuiten(v), ...RM3.samenKomen(v), ...RM3.samenTik(v), ...RM3.samenHand(v), ...RM3.samenKlaar(v), ...RM3.samenZelf(v), ...RM3.natellen(v), ...RM3.natellenKlaar(v), ...RM3.natellenKlaarSnel(v), ...SPLITSREACTIE_3(v));
  for (const [a, f] of Object.entries(fouten3(v))) alleZinnen.push(...Object.values(f.v).flat(), ...RM3.weerGekozen(Number(a), v.ding));
  if (!past4(...RM3.vraag(v, true))) fouten.push(`${v.id}: de eerste vraag past niet in het tekstvak`);
  /* Samen tellen: het totaal (het laatste getal) en wat in de doos zat, nooit hetzelfde getal 2 keer achter elkaar (K3). */
  for (const z of [...RM3.samenKlaar(v), ...RM3.natellenKlaar(v)]) if (new Set(getallen(z)).size !== getallen(z).length) fouten.push(`${v.id}: getal 2 keer: "${kaal(z)}"`);
  for (const z of [...RM3.samenKlaar(v), ...RM3.natellenKlaar(v)]) if (getallen(z)[0] !== String(v.tot)) fouten.push(`${v.id}: het laatste getal van het tellen is ${v.tot}: "${kaal(z)}"`);
}
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding)\b/i;
let kaleCijfers = 0;
for (const z of alleZinnen) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b/i.test(z)) fouten.push(`het woord "fout": "${z}"`);
  if (/vinkje/i.test(z)) fouten.push(`het woord "vinkje" (dan valt de hele zin weg, 15.37): "${z}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) {
    kaleCijfers++;
    fouten.push(`kaal cijfer (geen kleur, 14.20): "${z}"`);
  }
  if (!past4(z)) fouten.push(`te lang voor het tekstvak: "${kaal(z)}"`);
  if (/\{1:[a-z]+\} (ballen|knikkers)\b|\{1:[a-z]+\} (liggen|zitten|zaten)\b|(liggen|zaten|zitten) (er )?\{1:/.test(z)) fouten.push(`meervoud bij 1: "${z}"`);
}
const groet = metNaam(NAAM_GROET, "Testkind");
if (RM3.begin.filter((z) => past4(groet, z)).length < 2) fouten.push("na de groet passen minder dan 2 beginzinnen");
for (const e of [...EINDE.zinnen, EINDE_VEEL_FOUTEN]) if (!RM3.kaartTik.some((z) => past4(e, z))) fouten.push(`na "${e}" past geen kaartzin`);
for (const v of VRAGEN) for (const a of RM3.aanmoedigTikken) for (const h of RM3.samenHand(v)) if (!past4(a, h)) fouten.push(`te lang: "${a} ${kaal(h)}"`);
{
  const lofjes = [...LOF.zinnen, ...NAAM_LOF.zinnen.map((z) => metNaam(z, "Testkind")), ...Object.values(MOMENT).flatMap((m) => m.zinnen)];
  for (const v of VRAGEN)
    for (const lof of lofjes) {
      const r = SPLITSREACTIE_3(v);
      const mag = r.filter((z, i) => z.split(/[\s,:!.]/)[0].toLowerCase() !== lof.split(/[\s,:!.]/)[0].toLowerCase() && !(/\bja\b/i.test(lof) && SPLITSREACTIE_JA.includes(i)) && herhaling4([lof, z]) === null && past4(lof, z));
      if (mag.length < 2) fouten.push(`${v.id}: na "${lof}" passen maar ${mag.length} zinnen met wat er in de doos zat`);
    }
}
/* 10. De kiezer nalopen: 20.000 lessen met dezelfde functies als de les. */
const LESSEN = 20000;
let reacties = 0;
let zelfdeAchterElkaar = 0;
let woordDubbel = 0;
let tweedeZelfde = 0;
let zonderVraag = 0;
let teLang = 0;
let toeval = 12345;
const rnd = () => ((toeval = (toeval * 1103515245 + 12345) % 2147483648) / 2147483648);
const ALLE_F = new Map(VRAGEN.map((v) => [v.id, fouten3(v)]));
for (let les = 0; les < LESSEN; les++) {
  const K = maakKiezer({ wissel: WISSEL_3, toeval: rnd });
  const vorig = new Map<string, string>();
  const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = K.kies(sleutel, zinnen, mag);
    /* Kan dezelfde zin 2 keer achter elkaar komen? Alleen als het rijtje maar 1 zin over had. */
    if (vorig.get(sleutel) === vorm(z) && zinnen.filter((q) => vorm(q) !== vorm(z)).length > 0) zelfdeAchterElkaar++;
    vorig.set(sleutel, vorm(z));
    return z;
  };
  for (const v of VRAGEN) {
    if (rnd() < 0.5) continue;
    const F = ALLE_F.get(v.id)!;
    const fout = Object.keys(F);
    const x1 = fout[Math.floor(rnd() * fout.length)];
    const f1: Fout3 = F[x1];
    const r1 = foutReactie3(variant, f1, v, { x: Number(x1), poging: 1, eerder: null, eersteX: null, eersteZin: "", onduidelijk: () => "" });
    const vr = opnieuw3(variant, v, r1[0], r1[1]);
    reacties++;
    if (herhaling4([...r1, vr], vraagWoorden3(v)) || getalDubbel(r1[0], r1[1])) woordDubbel++;
    if (!vr && !eindigtMetOpdracht4(r1[1])) zonderVraag++;
    if (!past4(r1[0]) || !past4(r1[1], vr)) teLang++;
    if (rnd() < 0.4) continue;
    const x2 = fout[Math.floor(rnd() * fout.length)];
    const r2 = foutReactie3(variant, F[x2], v, { x: Number(x2), poging: 2, eerder: f1, eersteX: Number(x1), eersteZin: r1[0], onduidelijk: () => "" });
    reacties++;
    if (herhaling4(r2, vraagWoorden3(v)) || getalDubbel(r2[0], r2[1])) woordDubbel++;
    if (r2.some((z) => r1.includes(z))) tweedeZelfde++;
    if (!past4(...r2)) teLang++;
  }
}
if (zelfdeAchterElkaar) fouten.push(`kiezer: ${zelfdeAchterElkaar} keer dezelfde zin 2 keer achter elkaar`);
if (woordDubbel) fouten.push(`kiezer: ${woordDubbel} keer een woord of getal 2 keer in 1 reactie`);
if (tweedeZelfde) fouten.push(`kiezer: ${tweedeZelfde} keer bij de 2e keer een zin van de 1e keer`);
if (zonderVraag) fouten.push(`kiezer: ${zonderVraag} keer geen vraag of opdracht na de hint (F16)`);
if (teLang) fouten.push(`kiezer: ${teLang} keer een stuk dat niet in het tekstvak past`);

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute antwoorden, ${varianten} varianten; waarheidscontrole ${beweringen} beweringen; ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout", "vinkje", lengte en kale cijfers (${kaleCijfers} kaal).`);
console.log(`Kiezer: ${LESSEN} lessen nagespeeld, ${reacties} reacties: ${zelfdeAchterElkaar} keer dezelfde zin achter elkaar, ${woordDubbel} keer een woord 2 keer, ${tweedeZelfde} keer een zin van de 1e keer bij de 2e, ${zonderVraag} keer geen vraag na de hint, ${teLang} keer te lang.`);
if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log("Alles in orde: het goede getal nooit genoemd, alles waar, niets dubbel, altijd een vraag na de hint, alles past in het tekstvak.");

/* De leesbare tabel. */
const lijst = (l: string[]) => l.map((z) => kaal(z)).join(" / ");
const rijen = VRAGEN.flatMap((v) => Object.entries(fouten3(v)).map(([a, f]) => `| ${v.nr}. ${v.tot} ${v.ding.naam}, ${v.buiten} buiten, rest in de ${v.houder} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} |`)).join("\n");
const uitleg = VRAGEN.flatMap((v) => Object.entries(fouten3(v)).map(([a, f]) => `| ${v.nr}. ${v.tot} ${v.ding.naam} | ${a} (\`${f.code}\`) | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} + ${lijst(f.v.weerUitleg)} |`)).join("\n");
const vragen = VRAGEN.map((v) => `| ${v.nr}. ${v.tot} ${v.ding.naam}, ${v.buiten} buiten | ${kaal(ZIN.vraag(v).join(" "))} | ${lijst(RM3.opnieuw(v))} |`).join("\n");
const v1 = VRAGEN[0];
const v11 = VRAGEN[10];
const vast: [string, string[]][] = [
  ["Begin (na de groet)", RM3.begin],
  ["Samen nakijken (vraag 1)", RM3.natellen(v1)],
  ["Na het nakijken (6 ballen, 4 in de doos)", RM3.natellenKlaar(v1)],
  ["Na het nakijken, na een tik op de pijl", RM3.natellenKlaarSnel(v1)],
  ["Samen tellen: begin", RM3.samenHelp(v1)],
  ["Samen tellen: wat buiten ligt", RM3.samenBuiten(v1)],
  ["Samen tellen: de doos gaat open", RM3.samenKomen(v1)],
  ["Samen tellen: de doos gaat open (1 knikker, vraag 11)", RM3.samenKomen(v11)],
  ["Samen tellen: opdracht", RM3.samenTik(v1)],
  ["Samen tellen: opdracht (1 knikker)", RM3.samenTik(v11)],
  ["Hulphandje: aanmoediging", RM3.aanmoedigTikken],
  ["Hulphandje: wat te doen", RM3.samenHand(v1)],
  ["Samen tellen: klaar", RM3.samenKlaar(v1)],
  ["Vangnet (Bliepo telt zelf verder)", RM3.samenZelf(v1)],
  ["Zin na de lof", SPLITSREACTIE_3(v1)],
  ["Hetzelfde getal 2 keer", RM3.weerGekozen(5, v1.ding)],
  ["Slot", RM3.slot],
  ["Kaart", RM3.kaartTik],
];

const tekst = `# FOUTTABEL — gouden les Rekenmix 3 heel moeilijk (squla-rekenmix-mix3-4-gouden)

Gemaakt **uit de code** met \`npx tsx scripts/fouttabel-rekenmix3-gouden.ts\` (12 november 2026; 18 november 2026: alle zinnen in varianten, Bliepo als warme juf, oud naast nieuw in WIJZIGINGEN-ZINNEN-REKENMIX34.md); pas zinnen aan in \`src/components/les/lessen/squla-rekenmix3-gouden-zinnen.ts\` (deel "18 NOVEMBER 2026") en draai het script opnieuw. De inhoud (15 vragen, totalen, deel buiten, doos of zak, keuzes, volgorde) is die van de oude les squla-rekenmix-mix3-4 (BOUWREGELS 15.22).

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn splitsvragen ("Er zijn 6 ballen. Hoeveel zitten er in de doos?"), dus ze volgen de **gouden les Splitsen** in het verloop van de gouden Rekenmix. **Eigen invulling, niet van Synthesis:** de hints, de uitleg en deze tabel.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, een eerste zin (wat het kind koos, 1 keer genoemd), dan de hint en de vraag nog 1 keer in een van de versies hieronder (F16; niet als de hint zelf al een vraag is) en de 3 knoppen terug. 2e fout = een eerste zin en een uitleg (geen opdracht), een zin om samen te tellen, Bliepo zegt wat buiten ligt, de dingen komen uit de doos en het kind tikt ze aan; Bliepo telt verder. De les gaat door. Hetzelfde getal 2 keer: "Je koos weer 3." + uitleg; dezelfde denkfout met een ander getal: "weer"-zinnen. **Elke zin heeft varianten** (gescheiden door /); de les kiest er steeds 1, nooit dezelfde 2 keer achter elkaar, ook niet over vragen heen, en nooit een combinatie met een woord of getal 2 keer.

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`buiten-genoemd\` | noemde het deel dat je ziet (buiten) |
| \`totaal-genoemd\` | noemde het totaal |
| \`te-veel\` | koos te veel: buiten en gekozen getal samen komt boven het totaal |
| \`te-weinig\` | koos te weinig: buiten en gekozen getal samen komt onder het totaal |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen (komt niet voor) |

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin (varianten) | Hint (varianten; daarna de vraag, als de hint geen vraag is) |
|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

| Vraag | 2e fout (denkfout) | Uitleg na de eerste zin (varianten) | Dezelfde denkfout met een ander getal: "weer" + uitleg |
|---|---|---|---|
${uitleg}

## 4. De vraag, en de vraag na de hint

| Vraag | De vraag (zoals de oude les) | Na de hint (versies) |
|---|---|---|
${vragen}

## 5. De vaste zinnen van het verloop (met vraag 1 als voorbeeld)

| Situatie | Varianten |
|---|---|
${vast.map(([n, l]) => `| ${n} | ${lijst(l)} |`).join("\n")}

Lof, korte bevestiging, eindzin en groet: het vaste rijtje uit BLIEPO-KARAKTER.md (\`squla-klok-gouden-zinnen.ts\`, niet veranderd).

## 6. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix3-4; ${telling} foute antwoorden met een vaste denkfout en ${varianten} varianten; waarheidscontrole (${beweringen} beweringen, ook of de som in de eerste zin klopt); geen variant noemt het goede getal; geen opdracht in de uitleg; niets dubbel en alles past in het tekstvak (ook groet + begin, eindzin + kaart, lof + reactie, aanmoediging + hulphandje); na elke hint een vraag (F16); samen tellen noemt het laatste getal maar 1 keer; geen woord van de niet-lijst, geen "fout", geen "vinkje"; elk getal heeft een kleur. De kiezer is ${LESSEN} lessen nagespeeld (${reacties} reacties) met dezelfde functies als de les: 0 keer dezelfde zin achter elkaar, 0 keer een woord 2 keer in 1 reactie, 0 keer bij de 2e keer een zin van de 1e, altijd een vraag na de hint.
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix3-4-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix3-4-gouden.md geschreven");
