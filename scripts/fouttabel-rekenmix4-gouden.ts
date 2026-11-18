/**
 * Maakt FOUTTABEL-squla-rekenmix-mix4-1-gouden.md uit de code (squla-rekenmix4-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en keurt de fouttabel (12 november 2026; 18 november 2026: ALLE varianten, zoals bij Tellen, Klok,
 * Vormen en Rekentaal). Controles:
 *   1. inhoud: dezelfde 15 vragen (ding, soort, aantal, keuzes, rijen, andere dingen, delen) als de oude les
 *      squla-rekenmix-mix4-1 (gelezen uit de bron);
 *   2. elk fout antwoord heeft een rij met een vaste denkfout en genoeg varianten;
 *   3. verklapcontrole (15.17), voor ELKE combinatie eerste zin + hint: er blijven minstens 2 keuzes logisch over en het
 *      goede antwoord valt nooit weg; zonder richting geen richtingwoord;
 *   4. waarheidscontrole op elke variant: "dichtbij"/"bijna" alleen bij hooguit 2 verschil, "te veel"/"te weinig" in de
 *      goede richting, "rij voor rij" alleen bij rijen, "van boven naar beneden" alleen door elkaar, "alleen de …" alleen in
 *      een druk plaatje, "bovenste rij"/"beide rijen" alleen bij 2 rijen samen, "maar een deel" alleen bij 1 rij;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. niets dubbel (15.29): in elke combinatie die de les kan kiezen geen woord of getal 2 keer; achter elke eerste zin
 *      passen minstens 2 hints en 2 uitleggen; varianten in 1 rijtje zijn nooit dezelfde zin;
 *   7. altijd een vraag of opdracht na de hint (15.37, F16), en nooit precies de vraagzin van de 1e keer;
 *   8. alles past in het tekstvak (hooguit 110 tekens en 3 zinnen per stuk);
 *   9. WOORDEN-GROEP3.md: geen woord van de niet-lijst, geen "fout", geen "vinkje", elk getal een kleur, enkelvoud bij 1;
 *  10. de kiezer wordt 20.000 lessen lang nagespeeld met dezelfde functies als de les (foutReactie4, opnieuw4).
 *   npx tsx scripts/fouttabel-rekenmix4-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";
import { EINDE, EINDE_VEEL_FOUTEN, LOF, MOMENT, NAAM_GROET, NAAM_LOF, metNaam } from "../src/components/les/lessen/squla-klok-gouden-zinnen";
import { RICHTINGWOORDEN, RM4, TELREACTIE_4, TELREACTIE_JA, TELREACTIE_ROBOT, VRAGEN, WISSEL_4, eindigtMetOpdracht4, foutReactie4, fouten4, hard4, herhaling4, hintsNa4, opnieuwNa4, uitlegNa4, kaal4 as kaal, opnieuw4, past4, plekken, vraagWoorden4, type Fout4 } from "../src/components/les/lessen/squla-rekenmix4-gouden-zinnen";

const fouten: string[] = [];
const vorm = maakVorm(WISSEL_4);

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix4-1"'), bron.indexOf("const mix4_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const regels = [...vragenBlok.matchAll(/\{ t: "tel", v: (\w+), gr: (.*?), keuzes: \[([\d, ]+)\], soort: "(\w+)"/g)];
  const naarDing: Record<string, string> = { APPEL: "appels", BAL: "ballen", KNIKKER: "knikkers", STER: "sterren", AARDBEI: "aardbeien", KRAAL: "kralen", RAKET: "raketjes", PLANEET: "planeten", UFO: "ufo's", SATELLIET: "satellieten", KNOOP: "knopen" };
  const beeldNaam: Record<string, string> = { raketje: "raketjes", ster: "sterren", planeet: "planeten", ufo: "ufo's", satelliet: "satellieten", bal: "ballen", appel: "appels", knikker: "knikkers" };
  const oud = regels.map((m) => {
    const gr = m[2];
    const soort = m[4];
    const o: Record<string, unknown> = { ding: naarDing[m[1]], soort, keuzes: JSON.parse(`[${m[3]}]`) };
    if (gr.startsWith("los(")) {
      const soorten = [...gr.matchAll(/naam: "(\w+)", n: (\d+)/g)].map((x) => ({ ding: beeldNaam[x[1]] ?? x[1], n: Number(x[2]) }));
      o.n = soorten[0].n;
      if (soort === "druk") o.extra = soorten.slice(1);
    } else if (gr.startsWith("rijen(")) {
      const r = JSON.parse(/\[([\d, ]+)\]/.exec(gr)![0]) as number[];
      o.n = r.reduce((x, y) => x + y, 0);
      o.rijen = r;
    } else if (gr.startsWith("tweeGroepen(")) {
      const g = /tweeGroepen\("\w+", (\d+), (\d+)/.exec(gr)!;
      o.n = Number(g[1]) + Number(g[2]);
      o.delen = [Number(g[1]), Number(g[2])];
    }
    return o;
  });
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} telvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const nieuw: Record<string, unknown> = { ding: v.ding.naam, soort: v.soort, keuzes: v.keuzes, n: v.n };
    if (v.rijen) nieuw.rijen = v.rijen;
    if (v.delen) nieuw.delen = v.delen;
    if (v.soort === "druk") nieuw.extra = (v.extra ?? []).map((e) => ({ ding: e.ding.naam, n: e.n }));
    const sleutels = (x: Record<string, unknown>) => JSON.stringify(Object.keys(x).sort().map((k) => [k, x[k]]));
    if (sleutels(o) !== sleutels(nieuw)) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify(nieuw)}`);
    if (!v.keuzes.includes(v.n) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
    const pl = plekken(v);
    if (pl.filter((p) => p.doel).length !== v.n) fouten.push(`vraag ${v.nr}: ${pl.filter((p) => p.doel).length} dingen om te tellen in beeld, ${v.n} verwacht`);
    if (v.soort === "druk" && pl.length !== v.n + (v.extra ?? []).reduce((t, e) => t + e.n, 0)) fouten.push(`vraag ${v.nr}: aantal dingen in beeld klopt niet`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix4-1 vergeleken (ding, soort, aantal, keuzes, rijen, andere dingen, delen).`);
}

/* 2–9. Elke variant van elk fout antwoord. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg|Probeer)\b/;
const MEER = /nog niet allemaal|te weinig|sla (er )?geen|niet geteld|\bover\b|maar een deel|nog meer|ook de laatste|alleen (bovenaan|onderaan)|hoort nog|horen nog|ook de (bovenste|onderste)/i;
const MINDER = /te veel|\b1 keer|2 keer|zo veel zijn er niet|alleen de \w+ tellen mee|tellen niet mee/i;
let beweringen = 0;
let telling = 0;
let combinaties = 0;
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
const getallen = (z: string): string[] => kaal(z).match(/\d+/g) ?? [];
const getalDubbel = (a: string, b: string) => getallen(a).some((n) => getallen(b).includes(n));

for (const v of VRAGEN) {
  const F = fouten4(v);
  const vraagZin = kaal(RM4.vraag(v).join(" "));
  for (const k of v.keuzes) if (k !== v.n && !F[String(k)]) fouten.push(`geen rij voor ${v.id} ${k}`);
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
    const weerG = RM4.weerGekozen(x, v.ding);
    const alles = [...V.eerste, ...V.hint, ...V.uitleg, ...V.weerEerste, ...V.weerUitleg, ...weerG];
    varianten += alles.length;
    /* 4. Waarheid. */
    for (const z of alles) {
      nietWaar(waar, z, /dichtbij|bijna|scheelt|net niet|\biets\b|klein beetje/i, Math.abs(x - v.n) <= 2, "bijna/dichtbij, maar het scheelt meer dan 2");
      nietWaar(waar, z, /te veel|2 keer geteld|zo veel zijn er niet/i, x > v.n, "te veel, maar het kind koos minder");
      nietWaar(waar, z, /nog niet allemaal|te weinig|Er mist|Er missen|overgeslagen|niet geteld|nog meer/i, x < v.n, "te weinig, maar het kind koos meer");
      nietWaar(waar, z, /Er mist nog 1 |Er is 1 |Je hebt 1 /, Math.abs(x - v.n) === 1, "1 verschil, maar het is meer");
      nietWaar(waar, z, /een paar/, Math.abs(x - v.n) >= 2, "een paar, maar het is er 1");
      nietWaar(waar, z, /rij voor rij|linksboven/, v.vorm === "rijen", "rij voor rij / linksboven, maar ze liggen niet in rijen");
      nietWaar(waar, z, /van boven naar beneden/, v.vorm === "los", "van boven naar beneden, alleen bij door elkaar");
      nietWaar(waar, z, /alleen de (?!bovenste|onderste)|tellen niet mee|telt niet mee|Zoek (alle|de) |Kijk overal/, v.vorm === "druk", "alleen de …, maar het is geen druk plaatje");
      nietWaar(waar, z, /bovenste|onderste|beide rijen|andere rij|\brij\b(?! voor)/, v.vorm === "samen" || /rij voor rij/.test(kaal(z)), "bovenste/onderste rij, maar het zijn geen 2 rijen samen");
      nietWaar(waar, z, /maar een deel|alleen bovenaan|alleen onderaan/, v.vorm === "samen" && !!v.delen?.includes(x) && x < v.n, "maar een deel, maar het gekozen getal is geen rij");
      nietWaar(waar, z, /alleen bovenaan|ook de onderste/, v.delen?.[0] === x, "bovenaan, maar het gekozen getal is de onderste rij");
      nietWaar(waar, z, /alleen onderaan|ook de bovenste/, v.delen?.[1] === x && v.delen?.[0] !== x, "onderaan, maar het gekozen getal is de bovenste rij");
    }
    /* 5. Geen opdracht bij de 2e keer. */
    for (const z of [...V.uitleg, ...V.weerEerste, ...V.weerUitleg]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    /* 3. Verklappen, voor elke combinatie eerste zin + hint. */
    for (const e of V.eerste)
      for (const h of V.hint) {
        combinaties++;
        const tekst = kaal(`${e} ${h}`);
        const rest = v.keuzes.filter((k) => k !== x);
        const meer = MEER.test(tekst);
        const minder = MINDER.test(tekst);
        const over = rest.filter((k) => (meer ? k > x : true) && (minder ? k < x : true));
        if (f.noot && (RICHTINGWOORDEN.test(kaal(h)) || RICHTINGWOORDEN.test(kaal(e)) || meer || minder)) fouten.push(`${waar}: zonder richting, maar toch een richting: "${tekst}"`);
        if (over.length <= 1) fouten.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over`);
        if (!over.includes(v.n)) fouten.push(`${waar}: het goede antwoord valt weg na "${tekst}" (de zin klopt niet)`);
      }
    /* 6–8. Wat de les kan kiezen: na elke eerste zin minstens 2 hints en 2 uitleggen; elk stuk past; na de hint een vraag. */
    for (const e of [...V.eerste, ...weerG]) {
      if (!past4(e)) fouten.push(`${waar}: te lang: "${kaal(e)}"`);
      const hints = hintsNa4(f, v, e);
      const uitleg = uitlegNa4(V.uitleg, v, e);
      if (V.eerste.includes(e) && hints.length < 2) fouten.push(`${waar}: na "${kaal(e)}" passen maar ${hints.length} hints`);
      if (uitleg.length < 2) fouten.push(`${waar}: na "${kaal(e)}" passen maar ${uitleg.length} uitleggen`);
      if (!V.eerste.includes(e)) continue;
      for (const h of hints) if (!eindigtMetOpdracht4(h) && !opnieuwNa4(v, e, h).length) fouten.push(`${waar}: na "${kaal(e)} ${kaal(h)}" past geen vraag meer (F16)`);
    }
    for (const w of V.weerEerste) if (uitlegNa4(V.weerUitleg, v, w).length < 1) fouten.push(`${waar}: na "${kaal(w)}" past geen uitleg`);
    for (const z of RM4.opnieuw(v)) if (kaal(z) === vraagZin) fouten.push(`${waar}: de vraag na de hint is precies de vraag van de 1e keer: "${kaal(z)}"`);
  }
}
const zonderRichting = new Set(VRAGEN.flatMap((v) => Object.values(fouten4(v)).filter((f) => f.noot).flatMap((f) => f.v.eerste.map((z) => vorm(z)))));

/* 9. Alle andere zinnen van de les: niet-lijst, "fout", "vinkje", kale cijfers, enkelvoud bij 1, lengte. */
const alleZinnen: string[] = [...RM4.begin, ...RM4.samenHelp, ...RM4.slot, ...RM4.kaartTik, ...RM4.aanmoedigTikken];
for (const v of VRAGEN) {
  alleZinnen.push(...RM4.vraag(v, false), ...RM4.vraag(v, true), ...RM4.opnieuw(v), ...RM4.natellen(v.ding), ...RM4.natellenKlaar(v.n, v.ding), ...RM4.natellenKlaarSnel(v.n, v.ding), ...RM4.samenTik(v.ding), ...RM4.samenHand(v.ding), ...RM4.samenKlaar(v.n, v.ding), ...RM4.samenZelf(v.n, v.ding), ...TELREACTIE_4(v.n, v.ding).zinnen);
  for (const [a, f] of Object.entries(fouten4(v))) alleZinnen.push(...Object.values(f.v).flat(), ...RM4.weerGekozen(Number(a), v.ding));
  if (!past4(...RM4.vraag(v, true))) fouten.push(`${v.id}: de eerste vraag past niet in het tekstvak`);
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
}
for (const z of alleZinnen) if (/\belke (potlood|raketje)\b/i.test(z)) fouten.push(`"elke" bij een het-woord: "${z}"`);
for (const v of VRAGEN) for (const z of alleZinnen) if (new RegExp(`\\{1:[a-z]+\\} ${v.ding.naam}\\b`).test(z)) fouten.push(`meervoud bij 1: "${z}"`);
/* Stukken die samen worden gezegd: groet + begin, aanmoediging + hulphandje, eindzin + kaart, lof + reactie. */
const groet = metNaam(NAAM_GROET, "Testkind");
if (RM4.begin.filter((z) => past4(groet, z)).length < 2) fouten.push("na de groet passen minder dan 2 beginzinnen");
for (const e of [...EINDE.zinnen, EINDE_VEEL_FOUTEN]) if (!hard4(RM4.kaartTik, (z) => past4(e, z)).some((z) => past4(e, z))) fouten.push(`na "${e}" past geen kaartzin`);
for (const v of VRAGEN) for (const a of RM4.aanmoedigTikken) for (const h of RM4.samenHand(v.ding)) if (!past4(a, h)) fouten.push(`te lang: "${a} ${kaal(h)}"`);
{
  const lofjes = [...LOF.zinnen, ...NAAM_LOF.zinnen.map((z) => metNaam(z, "Testkind")), ...Object.values(MOMENT).flatMap((m) => m.zinnen)];
  for (const v of VRAGEN)
    for (const lof of lofjes) {
      const r = TELREACTIE_4(v.n, v.ding).zinnen;
      const mag = r.filter((z, i) => z.split(/[\s,:!.]/)[0].toLowerCase() !== lof.split(/[\s,:!.]/)[0].toLowerCase() && !(/\bja\b/i.test(lof) && TELREACTIE_JA.includes(i)) && i !== TELREACTIE_ROBOT && herhaling4([lof, z]) === null && past4(lof, z));
      if (mag.length < 2) fouten.push(`${v.id}: na "${lof}" passen maar ${mag.length} zinnen met het aantal`);
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
const ALLE_F = new Map(VRAGEN.map((v) => [v.id, fouten4(v)]));
for (let les = 0; les < LESSEN; les++) {
  const K = maakKiezer({ wissel: WISSEL_4, toeval: rnd });
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
    const f1: Fout4 = F[x1];
    const r1 = foutReactie4(variant, f1, v, { x: Number(x1), poging: 1, eerder: null, eersteX: null, eersteZin: "", onduidelijk: () => "" });
    const vr = opnieuw4(variant, v, r1[0], r1[1]);
    reacties++;
    if (herhaling4([...r1, vr], vraagWoorden4(v)) || getalDubbel(r1[0], r1[1])) woordDubbel++;
    if (!vr && !eindigtMetOpdracht4(r1[1])) zonderVraag++;
    if (!past4(r1[0]) || !past4(r1[1], vr)) teLang++;
    if (rnd() < 0.4) continue;
    const x2 = fout[Math.floor(rnd() * fout.length)];
    const r2 = foutReactie4(variant, F[x2], v, { x: Number(x2), poging: 2, eerder: f1, eersteX: Number(x1), eersteZin: r1[0], onduidelijk: () => "" });
    reacties++;
    if (herhaling4(r2, vraagWoorden4(v)) || getalDubbel(r2[0], r2[1])) woordDubbel++;
    if (r2.some((z) => r1.includes(z))) tweedeZelfde++;
    if (!past4(...r2)) teLang++;
  }
}
if (zelfdeAchterElkaar) fouten.push(`kiezer: ${zelfdeAchterElkaar} keer dezelfde zin 2 keer achter elkaar`);
if (woordDubbel) fouten.push(`kiezer: ${woordDubbel} keer een woord of getal 2 keer in 1 reactie`);
if (tweedeZelfde) fouten.push(`kiezer: ${tweedeZelfde} keer bij de 2e keer een zin van de 1e keer`);
if (zonderVraag) fouten.push(`kiezer: ${zonderVraag} keer geen vraag of opdracht na de hint (F16)`);
if (teLang) fouten.push(`kiezer: ${teLang} keer een stuk dat niet in het tekstvak past`);

console.log(
  `Fouttabel: ${VRAGEN.length} vragen, ${telling} foute antwoorden, ${varianten} varianten; waarheidscontrole ${beweringen} beweringen; verklapcontrole ${combinaties} combinaties; ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout", "vinkje", lengte en kale cijfers (${kaleCijfers} kaal); ${zonderRichting.size} versies van de eerste zin zonder richting.`,
);
console.log(`Kiezer: ${LESSEN} lessen nagespeeld, ${reacties} reacties: ${zelfdeAchterElkaar} keer dezelfde zin achter elkaar, ${woordDubbel} keer een woord 2 keer, ${tweedeZelfde} keer een zin van de 1e keer bij de 2e, ${zonderVraag} keer geen vraag na de hint, ${teLang} keer te lang.`);
if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log("Alles in orde: geen verklapper, alles waar, niets dubbel, altijd een vraag na de hint, alles past in het tekstvak.");

/* De leesbare tabel. */
const vormNaam = { los: "door elkaar", rijen: "in rijen", druk: "in een druk plaatje (alleen deze soort tellen)", samen: "2 rijen samen" } as const;
const lijst = (l: string[]) => l.map((z) => kaal(z)).join(" / ");
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(fouten4(v)).map(([a, f]) => `| ${v.nr}. ${v.n} ${v.ding.naam}, ${vormNaam[v.vorm]}${v.rijen ? ` (${v.rijen.join("+")})` : ""} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) => Object.entries(fouten4(v)).map(([a, f]) => `| ${v.nr}. ${v.n} ${v.ding.naam} | ${a} (\`${f.code}\`) | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} + ${lijst(f.v.weerUitleg)} |`)).join("\n");
const vragen = VRAGEN.map((v) => `| ${v.nr}. ${v.ding.naam} (${vormNaam[v.vorm]}) | ${kaal(RM4.vraag(v, false).join(" "))} | ${kaal(RM4.vraag(v, true).join(" "))} | ${lijst(RM4.opnieuw(v))} |`).join("\n");
const v1 = VRAGEN[0];
const vast: [string, string[]][] = [
  ["Begin (na de groet)", RM4.begin],
  ["Samen natellen (vraag 1)", RM4.natellen(v1.ding)],
  ["Na het natellen (8 raketjes)", RM4.natellenKlaar(v1.n, v1.ding)],
  ["Na het natellen, na een tik op de pijl", RM4.natellenKlaarSnel(v1.n, v1.ding)],
  ["Samen tellen: begin", RM4.samenHelp],
  ["Samen tellen: opdracht", RM4.samenTik(v1.ding)],
  ["Hulphandje: aanmoediging", RM4.aanmoedigTikken],
  ["Hulphandje: wat te doen", RM4.samenHand(v1.ding)],
  ["Samen tellen: klaar", RM4.samenKlaar(v1.n, v1.ding)],
  ["Vangnet (Bliepo telt zelf verder)", RM4.samenZelf(v1.n, v1.ding)],
  ["Zin met het aantal na de lof", TELREACTIE_4(v1.n, v1.ding).zinnen],
  ["Hetzelfde getal 2 keer", RM4.weerGekozen(9, v1.ding)],
  ["Slot", RM4.slot],
  ["Kaart", RM4.kaartTik],
];

const tekst = `# FOUTTABEL — gouden les Rekenmix 4 (squla-rekenmix-mix4-1-gouden, "Rekenmix 4")

Gemaakt **uit de code** met \`npx tsx scripts/fouttabel-rekenmix4-gouden.ts\` (12 november 2026; 18 november 2026: alle zinnen in varianten, Bliepo als warme juf, oud naast nieuw in WIJZIGINGEN-ZINNEN-REKENMIX34.md); pas zinnen aan in \`src/components/les/lessen/squla-rekenmix4-gouden-zinnen.ts\` (deel "18 NOVEMBER 2026") en draai het script opnieuw. De inhoud (15 vragen, dingen, aantallen, soorten, keuzes, volgorde) is die van de oude les squla-rekenmix-mix4-1 (BOUWREGELS 15.22).

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn telvragen, dus ze volgen de **gouden les Tellen** en de gouden Rekenmix 1. **Eigen invulling, niet van Synthesis:** de hints en de uitleg, passend bij de 3 soorten telvraag: gewoon tellen (door elkaar of in rijen), tellen in een druk plaatje (de andere dingen tellen niet mee) en 2 rijen samen tellen. Een deel van de zinnen is de tekst van Synthesis (Color Count) in het Nederlands, zoals bij Tellen.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, een eerste zin (wat het kind koos, 1 keer genoemd), dan een hint en de vraag in andere woorden (F16) en de 3 knoppen terug. 2e fout = een eerste zin en een uitleg (geen opdracht), een zin om samen te tellen en het kind tikt elk ding aan dat meetelt; de les gaat door. Dezelfde denkfout 2 keer (en de 1e keer met richting): "weer"-zinnen; hetzelfde getal 2 keer: "Je koos weer 9.". **Elke zin heeft varianten** (hieronder gescheiden door /); de les kiest er steeds 1, nooit dezelfde 2 keer achter elkaar, ook niet over vragen heen, en nooit een combinatie met een woord of getal 2 keer.

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) |
| \`te-veel\` | telde er te veel (een 2 keer, of in een druk plaatje ook andere dingen mee) |
| \`maar-een-rij\` | alleen bij 2 rijen samen: koos het aantal van 1 rij |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen (komt niet voor) |

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin (varianten) | Hint (varianten; daarna de vraag in andere woorden) |
|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

| Vraag | 2e fout (denkfout) | Uitleg na de eerste zin (varianten) | Dezelfde denkfout 2 keer: "weer" + andere uitleg |
|---|---|---|---|
${uitleg}

## 4. De vraag, en de vraag na de hint

| Vraag | Gewoon | De eerste keer van deze soort | Na de hint (in andere woorden; niet als de hint al een vraag is) |
|---|---|---|---|
${vragen}

## 5. De vaste zinnen van het verloop (met vraag 1 als voorbeeld)

| Situatie | Varianten |
|---|---|
${vast.map(([n, l]) => `| ${n} | ${lijst(l)} |`).join("\n")}

Lof, korte bevestiging, eindzin en groet: het vaste rijtje uit BLIEPO-KARAKTER.md (\`squla-klok-gouden-zinnen.ts\`, niet veranderd).

## 6. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix4-1; ${telling} foute antwoorden met een vaste denkfout en ${varianten} varianten; verklapcontrole op ${combinaties} combinaties eerste zin + hint; waarheidscontrole (${beweringen} beweringen); geen opdracht in de uitleg; niets dubbel en alles past in het tekstvak (ook groet + begin, eindzin + kaart, lof + aantal, aanmoediging + hulphandje); na elke hint een vraag of opdracht (F16); geen woord van de niet-lijst, geen "fout", geen "vinkje"; elk getal heeft een kleur. De kiezer is ${LESSEN} lessen nagespeeld (${reacties} reacties) met dezelfde functies als de les: 0 keer dezelfde zin achter elkaar, 0 keer een woord 2 keer in 1 reactie, 0 keer bij de 2e keer een zin van de 1e, altijd een vraag na de hint.
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix4-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix4-1-gouden.md geschreven");
