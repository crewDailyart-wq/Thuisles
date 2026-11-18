/**
 * Maakt FOUTTABEL-squla-rekenmix-mix1-1-gouden.md uit de code (squla-rekenmix-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en controleert de fouttabel (11 november 2026). Gemaakt naar scripts/fouttabel-tellen-gouden.ts (de
 * vragen volgen de gouden les Tellen), met de controles die later zijn geleerd (LESRECEPT "Geleerd bij …"):
 *   1. inhoud: dezelfde 15 vragen, aantallen en keuzes als de oude les squla-rekenmix-mix1-1 (gelezen uit de bron);
 *   2. elk fout antwoord heeft een rij met een vaste denkfout;
 *   3. verklapcontrole (15.17): na eerste zin + hint blijven er minstens 2 keuzes logisch over; zonder richting ook geen
 *      richtingwoord in de hint;
 *   4. waarheidscontrole: "dichtbij" alleen bij hooguit 2 verschil, "te veel"/"te weinig" in de goede richting,
 *      "rij voor rij"/"linksboven" alleen bij rijen, "van links naar rechts"/"Begin links" alleen bij 2 aan 2,
 *      "van boven naar beneden" niet bij rijen of 2 aan 2, enkelvoud bij 1;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. paren: 2 foute antwoorden bij 1 vraag zeggen nooit allebei "dichtbij"; zonder richting minstens 3 versies;
 *   7. herhaalcontrole (geleerd bij Rekentaal, Tijd): geen woord of getal 2 keer in 1 reactie bij een fout (eerste zin +
 *      hint; eerste zin, "Je koos weer …" of een andere eerste zin + uitleg; de "weer"-zinnen), behalve kleine woordjes,
 *      de woorden van de vraag en vaste uitdrukkingen ("rij voor rij", "1 voor 1");
 *   8. WOORDEN-GROEP3.md: geen woord van de niet-lijst (vergelijk, groep, soort, correct, selecteer …), ook niet in de
 *      reserve-versies; geen "fout";
 *   9. elk getal in een zin heeft een kleur ({n:kleur}); geen kaal cijfer in alle zinnen van de les.
 * 18 november 2026 (warme juf, varianten): alle controles lopen nu over ALLE varianten, via dezelfde functies als de les
 * (foutReactie, opnieuwZin, de gedeelde kiezer nooit-dubbel.ts), en de kiezer wordt 20.000 keer nagespeeld: nooit 2 keer
 * dezelfde zin, geen getal 2 keer in 1 stuk, na de hint altijd een vraag of opdracht (15.37, F16), alles past in het
 * tekstvak (hooguit 110 tekens en 3 zinnen), nooit "fout" of "vinkje".
 *   npx tsx scripts/fouttabel-rekenmix-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { APPEL, BAL, BIJNA_RM, NAAM_GROET, POTLOOD, RICHTINGWOORDEN_RM, RM, TELREACTIE_RM, VARIANTEN_FOUT_RM, VRAGEN, WISSEL_RM, deeltGetalRm, eindigtMetOpdrachtRm, foutReactie, foutenRm, opnieuwZin, pastRm, zelfdeKernRm, type Fout, type Variant, type Varianten } from "../src/components/les/lessen/squla-rekenmix-gouden-zinnen";
import { deeltStuk, maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix1-1"'), bron.indexOf("const mix1_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const vragen = [...vragenBlok.matchAll(/\{ t: "tel", v: (\w+), gr: (los|rijen|paren)\((.*?)\), keuzes: \[([\d, ]+)\]/g)];
  const naarDing: Record<string, string> = { APPEL: "appels", BAL: "ballen", POTLOOD: "potloden", AUTO: "auto's", BLOEM: "bloemen", KNIKKER: "knikkers", STER: "sterren" };
  const oud = vragen.map((m) => {
    const vorm = m[2];
    const args = m[3];
    const n = vorm === "los" ? Number(/n: (\d+)/.exec(args)![1]) : vorm === "paren" ? Number(args.split(",")[1]) : (JSON.parse(/\[([\d, ]+)\]/.exec(args)![0]) as number[]).reduce((a, b) => a + b, 0);
    const rijen = vorm === "rijen" ? (JSON.parse(/\[([\d, ]+)\]/.exec(args)![0]) as number[]) : undefined;
    return { ding: naarDing[m[1]], vorm, n, keuzes: JSON.parse(`[${m[4]}]`) as number[], rijen };
  });
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} telvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const zelfde = o.ding === v.ding.naam && o.vorm === v.vorm && o.n === v.n && JSON.stringify(o.keuzes) === JSON.stringify(v.keuzes) && JSON.stringify(o.rijen) === JSON.stringify(v.rijen);
    if (!zelfde) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify({ ding: v.ding.naam, vorm: v.vorm, n: v.n, keuzes: v.keuzes, rijen: v.rijen })}`);
    if (!v.keuzes.includes(v.n) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix1-1 vergeleken (ding, manier van liggen, aantal, keuzes, rijen).`);
}

/* 2–6. Tabel, verklappen, waarheid, opdrachten, paren: voor ALLE varianten (18 nov 2026, zoals Tellen en Dagen). */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg|Probeer)\b/;
const MEER = /nog niet allemaal|sla geen|sla er geen|niet geteld|nog meer|te weinig|overgeslagen|ook de laatste|\bmeer\b|\bover\b/i;
const MINDER = /te veel|1 keer|maar 1|2 keer|zo veel liggen er niet|\bminder\b/i;
let beweringen = 0;
let telling = 0;
let combinaties = 0;
let paren = 0;
const alleVarianten = (f: Fout & { v: Varianten }) => [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg];
for (const v of VRAGEN) {
  const F = foutenRm(v);
  for (const k of v.keuzes) if (k !== v.n && !F[String(k)]) fouten.push(`geen rij voor ${v.id} ${k}`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    const rest = v.keuzes.filter((k) => k !== x);
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    if (f.v.eerste.length < 3) fouten.push(`${waar}: maar ${f.v.eerste.length} eerste zinnen`);
    if (f.v.hint.length < 3) fouten.push(`${waar}: maar ${f.v.hint.length} hints`);
    if (f.v.uitleg.length < 3) fouten.push(`${waar}: maar ${f.v.uitleg.length} zinnen uitleg`);
    if (f.v.weerEerste.length < 2) fouten.push(`${waar}: maar ${f.v.weerEerste.length} "weer"-zinnen`);
    for (const z of [...f.v.eerste, ...f.v.hint]) if (f.noot && RICHTINGWOORDEN_RM.test(kaal(z))) fouten.push(`${waar}: zonder richting, maar toch een richting: "${kaal(z)}"`);
    /* Verklappen (15.17): na elke eerste zin + elke hint blijven er minstens 2 keuzes over, het goede er altijd bij. */
    for (const e of f.v.eerste)
      for (const h of f.v.hint) {
        combinaties++;
        const tekst = kaal(`${e} ${h}`);
        const meer = MEER.test(tekst);
        const minder = MINDER.test(tekst);
        const over = rest.filter((k) => (meer ? k > x : true) && (minder ? k < x : true));
        if (meer && minder) fouten.push(`${waar}: "${tekst}" zegt te weinig en te veel tegelijk`);
        if (over.length <= 1) fouten.push(`${waar}: na "${tekst}" blijft alleen ${over.join("")} over`);
        if (!over.includes(v.n)) fouten.push(`${waar}: het goede antwoord valt weg na "${tekst}" (de zin klopt niet)`);
        if (!f.noot && !MEER.test(kaal(e)) && !MINDER.test(kaal(e))) fouten.push(`${waar}: eerste zin zonder richting terwijl "weer" daarop rekent: "${kaal(e)}"`);
      }
    /* Waarheid: elke bewering in elke variant klopt voor DIT antwoord bij DEZE vraag. */
    const klopt = (re: RegExp, ok: boolean, wat: string) => {
      for (const z of alleVarianten(f).map(kaal))
        if (re.test(z)) {
          beweringen++;
          if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
        }
    };
    klopt(BIJNA_RM, Math.abs(x - v.n) <= 2, "bijna/dichtbij/iets, maar het scheelt meer dan 2");
    klopt(/te veel|2 keer geteld|zo veel liggen er niet/i, x > v.n, "te veel, maar het kind koos minder");
    klopt(/nog niet allemaal|te weinig|niet geteld|nog meer|overgeslagen|Er mist|Er missen|\bmeer\.$/i, x < v.n, "te weinig, maar het kind koos meer");
    klopt(new RegExp(`\\b1 ${v.ding.een}\\b`), Math.abs(x - v.n) === 1, "precies 1 verschil, maar het scheelt meer");
    klopt(/een paar/, Math.abs(x - v.n) >= 2, "een paar, maar het scheelt er maar 1");
    klopt(/rij voor rij|bovenaan/, v.vorm === "rijen", "rij voor rij / bovenaan, maar ze liggen niet in rijen");
    klopt(/van links naar rechts|Begin links /, v.vorm === "paren", "van links naar rechts, alleen bij 2 aan 2");
    klopt(/van boven naar beneden/, v.vorm === "los", "van boven naar beneden, alleen bij door elkaar");
    klopt(/linksboven/, false, "linksboven (lastig voor groep 3)");
    klopt(/\bweer\b/, true, "");
    for (const z of [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    for (const z of alleVarianten(f)) {
      const g = kaal(z).match(/\d+/g) ?? [];
      if (new Set(g).size !== g.length) fouten.push(`${waar}: een getal staat 2 keer in "${kaal(z)}"`);
      if (new RegExp(`\\b${v.n}\\b`).test(kaal(z))) fouten.push(`${waar}: het goede getal staat in "${kaal(z)}"`);
    }
    /* Past in het tekstvak: elke eerste zin met minstens 1 uitleg; elke hint met de vraag erachter. */
    for (const e of [...f.v.eerste, ...RM.weerGekozen(x, v.ding)]) if (!f.v.uitleg.some((u) => pastRm(e, u))) fouten.push(`${waar}: geen uitleg past achter "${kaal(e)}"`);
    for (const e of f.v.weerEerste) if (!f.v.weerUitleg.some((u) => pastRm(e, u))) fouten.push(`${waar}: geen uitleg past achter "${kaal(e)}"`);
    for (const h of f.v.hint) {
      if (eindigtMetOpdrachtRm(h)) {
        if (!pastRm(h)) fouten.push(`${waar}: hint te lang: "${kaal(h)}"`);
        continue;
      }
      const passend = RM.opnieuw(v.ding).filter((z) => pastRm(h, z) && !deeltGetalRm(h, z));
      if (passend.length < 2) fouten.push(`${waar}: achter de hint "${kaal(h)}" passen maar ${passend.length} versies van de vraag`);
    }
  }
  /* Paren (2 verschillende antwoorden bij 1 vraag): elke eerste zin van de 1e keer tegen elke zin die foutReactie bij de 2e keer kan kiezen. */
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const zelfde = e.soort === f.soort && !e.noot;
      for (const z1 of e.v.eerste) {
        const kandidaten = zelfde ? f.v.weerEerste : f.v.eerste.filter((z) => !zelfdeKernRm(z1, z) && z !== z1);
        if (!kandidaten.length) fouten.push(`${v.id} ${a} dan ${b}: geen eerste zin over voor de 2e keer`);
        for (const z2 of kandidaten) {
          paren++;
          if (zelfdeKernRm(z1, z2)) fouten.push(`${v.id} ${a} dan ${b}: 2 keer hetzelfde woord ("${kaal(z1)}" en dan "${kaal(z2)}")`);
          const uit = zelfde ? f.v.weerUitleg : f.v.uitleg;
          if (!uit.some((u) => !deeltStuk(z2, u) && pastRm(z2, u))) fouten.push(`${v.id} ${a} dan ${b}: elke uitleg herhaalt een stuk uit "${kaal(z2)}" of past niet`);
        }
      }
    }
}
const zonderRichting = new Set(VRAGEN.flatMap((v) => Object.values(foutenRm(v)).filter((f) => f.noot).flatMap((f) => f.v.eerste.map((z) => kaal(z).replace(/\d+/g, "#")))));
const aantalZonderRichting = VRAGEN.flatMap((v) => Object.values(foutenRm(v)).filter((f) => f.noot)).length;
if (aantalZonderRichting && zonderRichting.size < 3) fouten.push(`eerste zin zonder richting heeft maar ${zonderRichting.size} versie(s)`);

/* 7. NOOIT 2 KEER HETZELFDE: speel de les-functies (foutReactie, opnieuwZin) met de kiezer 20.000 keer na. */
let reacties = 0;
let stukken = 0;
{
  const vorm = maakVorm(WISSEL_RM);
  const K = maakKiezer({ wissel: WISSEL_RM });
  const laatste = new Map<string, string>();
  let dubbel = 0;
  const neem: Variant = (sleutel, zinnen, mag) => {
    const z = K.kies(sleutel, zinnen, mag);
    if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
      dubbel++;
      if (dubbel <= 5) console.error(`   dubbel bij "${sleutel}": ${kaal(z)}`);
    }
    laatste.set(sleutel, vorm(z));
    return z;
  };
  /* Elk stuk tekst: past in het tekstvak, geen getal 2 keer, niets 2 keer, nooit "fout" of "vinkje". */
  const stuk = (wat: string, delen: string[]) => {
    stukken++;
    const t = kaal(delen.filter(Boolean).join(" "));
    if (!pastRm(t)) fouten.push(`${wat}: past niet in het tekstvak (${t.length} tekens): "${t}"`);
    const g = t.match(/\d+/g) ?? [];
    if (new Set(g).size !== g.length) fouten.push(`${wat}: een getal 2 keer in 1 stuk: "${t}"`);
    if (/\bfout\b|vinkje/i.test(t)) fouten.push(`${wat}: "fout" of "vinkje" in "${t}"`);
    const zz = delen.filter(Boolean);
    for (let i = 1; i < zz.length; i++) if (deeltStuk(zz[i - 1], zz[i])) fouten.push(`${wat}: stuk 2 keer in 1 reactie: "${t}"`);
  };
  let herhaald = 0;
  for (let i = 0; i < 20000; i++) {
    const v = VRAGEN[Math.floor(Math.random() * VRAGEN.length)];
    const F = Object.entries(foutenRm(v));
    const [a, f] = F[Math.floor(Math.random() * F.length)];
    const ond = () => "Hmm.";
    const r1 = foutReactie(neem, f, v, { x: Number(a), poging: 1, eerder: null, eersteX: null, eersteZin: "", onduidelijk: ond });
    const op = opnieuwZin(neem, v, r1[1]);
    reacties++;
    stuk("1e keer, eerste zin", [r1[0]]);
    stuk("1e keer, hint en vraag", [r1[1], op]);
    if (!eindigtMetOpdrachtRm([r1[1], op].filter(Boolean).join(" "))) fouten.push(`na de hint geen vraag of opdracht: "${kaal(r1[1])} ${kaal(op)}"`);
    if (deeltGetalRm(r1[0], r1[1])) herhaald++;
    if (Math.random() < 0.4) continue;
    const [b, g] = Math.random() < 0.3 ? [a, f] : F[Math.floor(Math.random() * F.length)];
    const r2 = foutReactie(neem, g, v, { x: Number(b), poging: 2, eerder: f, eersteX: Number(a), eersteZin: r1[0], onduidelijk: ond });
    reacties++;
    stuk("2e keer", r2);
    if (kaal(r2[0]) === kaal(r1[0])) fouten.push(`2 keer dezelfde eerste zin bij 1 vraag: "${kaal(r1[0])}"`);
    if (zelfdeKernRm(r1[0], r2[0])) fouten.push(`2 keer hetzelfde woord bij 1 vraag: "${kaal(r1[0])}" en "${kaal(r2[0])}"`);
    if (/\bweer\b/i.test(r2[0]) && !(a === b || (f.soort === g.soort && !f.noot))) fouten.push(`"weer" klopt niet: "${kaal(r2[0])}"`);
    const help = neem("samenHelp", RM.samenHelp);
    stuk("samen: help", [help]);
    stuk("samen: opdracht", [neem("samenTik", RM.samenTik(v.ding))]);
    stuk("samen: hulphandje", [neem("aanmoedigTikken", RM.aanmoedigTikken), neem("samenHand", RM.samenHand(v.ding))]);
    stuk("samen: klaar", [neem("samenKlaar", RM.samenKlaar(v.n, v.ding))]);
  }
  console.log(`Nooit 2 keer hetzelfde: ${reacties} reacties nagespeeld, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0), ${herhaald} keer een getal uit de eerste zin in de hint (moet 0), ${stukken} stukken nagelopen op lengte, getal 2 keer en "fout"/"vinkje".`);
  if (dubbel) fouten.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
  if (herhaald) fouten.push(`${herhaald} keer een getal uit de eerste zin in de hint`);
}

/* 8 en 9. Alle zinnen van de les: niet-lijst, "fout", "vinkje", kale cijfers, genoeg varianten. */
const alleZinnen: string[] = [...RM.begin, RM.vraagEerste, ...RM.natellen, ...RM.samenHelp, ...RM.slot, ...RM.kaartTik, ...RM.aanmoedigTikken];
const rijtjes: [string, string[], number][] = [["begin", RM.begin, 3], ["natellen", RM.natellen, 3], ["samenHelp", RM.samenHelp, 4], ["slot", RM.slot, 3], ["kaartTik", RM.kaartTik, 3], ["aanmoedigTikken", RM.aanmoedigTikken, 5]];
for (const v of VRAGEN) {
  rijtjes.push(["opnieuw", RM.opnieuw(v.ding), 3], ["natellenKlaar", RM.natellenKlaar(v.n, v.ding), 3], ["natellenKlaarSnel", RM.natellenKlaarSnel(v.n, v.ding), 3], ["samenTik", RM.samenTik(v.ding), 3], ["samenHand", RM.samenHand(v.ding), 3], ["samenKlaar", RM.samenKlaar(v.n, v.ding), 3], ["samenZelf", RM.samenZelf(v.n, v.ding), 2], ["TELREACTIE_RM", TELREACTIE_RM(v.n, v.ding).zinnen, 7]);
  alleZinnen.push(RM.vraag(v.ding), ...RM.opnieuw(v.ding), ...RM.natellenKlaar(v.n, v.ding), ...RM.natellenKlaarSnel(v.n, v.ding), ...RM.samenTik(v.ding), ...RM.samenHand(v.ding), ...RM.samenKlaar(v.n, v.ding), ...RM.samenZelf(v.n, v.ding), ...TELREACTIE_RM(v.n, v.ding).zinnen);
  for (const [a, f] of Object.entries(foutenRm(v))) alleZinnen.push(...alleVarianten(f), ...RM.weerGekozen(Number(a), v.ding));
  for (const z of RM.opnieuw(v.ding)) if (!eindigtMetOpdrachtRm(z) || /\d/.test(kaal(z))) fouten.push(`vraag terug na de hint is geen vraag of opdracht, of noemt een getal: "${z}"`);
  for (const z of RM.samenZelf(v.n, v.ding)) if (!/^Kijk, /.test(z)) fouten.push(`samenZelf begint niet met "Kijk, ": "${z}"`);
  if (!RM.begin.every((z) => pastRm(NAAM_GROET.replace("{naam}", "Testkind"), z))) fouten.push("begin past niet met de groet in het tekstvak");
}
for (const [naam, zinnen, min] of rijtjes) if (new Set(zinnen).size < min) fouten.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding|linksboven)\b/i;
let kaleCijfers = 0;
for (const z of alleZinnen) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b|vinkje/i.test(z)) fouten.push(`het woord "fout" of "vinkje": "${z}"`);
  const zonderMarkup = z.replace(/\{\d+:[a-z]+\}/g, "");
  if (/\d/.test(zonderMarkup)) {
    kaleCijfers++;
    fouten.push(`kaal cijfer (geen kleur, 14.20): "${z}"`);
  }
  const g = kaal(z).match(/\d+/g) ?? [];
  if (new Set(g).size !== g.length) fouten.push(`een getal staat 2 keer in "${kaal(z)}"`);
  if (kaal(z).split(/\s+/).length > 14) fouten.push(`te lange zin (meer dan 14 woorden): "${kaal(z)}"`);
}
for (const z of alleZinnen) if (/\belke potlood\b/i.test(z)) fouten.push(`"elke potlood": "${z}"`);
for (const v of VRAGEN) for (const z of alleZinnen) if (new RegExp(`\\{1:[a-z]+\\} ${v.ding.naam}\\b`).test(z)) fouten.push(`meervoud bij 1: "${z}"`);

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute antwoorden; ${combinaties} combinaties van eerste zin en hint en ${paren} paren van 1e en 2e keer nagelopen; waarheidscontrole ${beweringen} beweringen (alle varianten); ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout", "vinkje", kale cijfers en lengte (${kaleCijfers} kaal); ${zonderRichting.size} versies van de eerste zin zonder richting.`);
if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].slice(0, 80).join("\n"));
  process.exit(1);
}
console.log("Alles in orde: geen verklapper, alles waar, altijd een vraag of opdracht na de hint, nooit 2 keer dezelfde zin, alles past in het tekstvak.");

/* De leesbare tabel: per fout antwoord 1 vaste variant als voorbeeld (de les kiest steeds een andere). */
const vast = <T>(l: T[], nr: number): T => l[nr % l.length];
const vormNaam = { los: "door elkaar", rijen: "in rijen", paren: "2 aan 2" } as const;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenRm(v)).map(([a, f]) => `| ${v.nr}. ${v.n} ${v.ding.naam}, ${vormNaam[v.vorm]}${v.rijen ? ` (${v.rijen.join("+")})` : ""} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(vast(f.v.eerste, v.nr))} | ${kaal(vast(f.v.hint, v.nr))} | ${f.scherm} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) => {
  const F = Object.entries(foutenRm(v));
  return F.map(([a, f]) => {
    const ander = F.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e keer was een andere denkfout: dan de uitleg links)" : ander.noot ? "— (1e keer zei Bliepo alleen dat het dichtbij was: dan de uitleg links)" : `${kaal(vast(f.v.weerEerste, v.nr))} ${kaal(vast(f.v.weerUitleg, v.nr))}`;
    return `| ${v.nr}. ${v.n} ${v.ding.naam} | ${a} (\`${f.code}\`) | ${kaal(vast(f.v.eerste, v.nr + 1))} ${kaal(vast(f.v.uitleg, v.nr))} | ${weer} |`;
  });
}).join("\n");
const voorbeeld = (d: typeof APPEL, vorm: "rijen" | "los" | "paren", X: string) => VARIANTEN_FOUT_RM(d, vorm, X).map(([naam, z]) => `| ${naam} | ${z.map(kaal).join(" / ")} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, "Rekenmix 1")

Gemaakt op 11 november 2026, bijgewerkt op 18 november 2026 (Bliepo als warme juf: alle zinnen in varianten; oud naast nieuw in WIJZIGINGEN-ZINNEN-REKENMIX1.md), **uit de code** met \`npx tsx scripts/fouttabel-rekenmix-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, dingen, aantallen, manier van liggen, 3 keuzes per vraag) is die van squla-rekenmix-mix1-1 en blijft gelijk (BOUWREGELS 15.22); het script vergelijkt dat met de oude les.

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn telvragen, dus ze volgen de **gouden les Tellen** (squla-tellen-fruit-1-gouden; draaiboek Tellen, Color Count). Zelfde verloop, zelfde zinnen (vraag, natellen, samen tellen, vangnet, lof met het aantal), zelfde soort reactie bij een fout (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel), of geen richting als die maar 1 keuze zou overlaten.

**Eigen invulling, niet van Synthesis (net als bij Tellen):** de hints, de uitleg en deze tabel. Anders dan bij Tellen: de dingen liggen hier soms **door elkaar**, soms **in rijen** en soms **2 aan 2**; de hint past bij wat het kind ziet ("rij voor rij" alleen bij rijen, "van links naar rechts" bij 2 aan 2, "van boven naar beneden" bij door elkaar). Sommige keuzes liggen 3 naast het goede getal (Squla): dan zegt Bliepo niet "dichtbij". En geen woord of getal 2 keer in 1 reactie (geleerd bij Rekentaal en Tijd).

In de les staan de getallen in de kleur van het ding (appel, bal, auto en bloem rood; potlood groen; knikker blauw; ster geel); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11), zoals de gouden les Tellen:**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, de dingen blijven staan zonder nummers. Bliepo zegt de eerste zin (± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint en **de vraag erachter** ("Hoeveel ballen zie je?", "Hoeveel zijn het er dan?" of "Tik dan op het goede getal."; 15.37, F16). Eindigt de hint al met "tik op het getal", dan komt de vraag niet nog een keer.
- **Varianten (18 november 2026):** elke zin bestaat in varianten (§6). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`). In §2 en §3 staat per fout antwoord 1 variant als voorbeeld; het script loopt ALLE varianten na.
- **2e fout:** de eerste zin en een korte uitleg bij de denkfout (geen opdracht, zonder het antwoord), "Kom, we tellen ze samen." (of een van de 4 andere versies). Dan tikt het kind elk ding aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal; de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. …").
- **Dezelfde denkfout 2 keer** (en Bliepo noemde de 1e keer de richting): "Je telde er weer …" (of een variant) en een andere uitleg (laatste kolom van §3). **Hetzelfde foute getal 2 keer:** "Je koos weer 9." (of "Je tikte weer op 9." / "Weer 9, zie ik.") in plaats van dezelfde eerste zin. **Een ander getal:** een eerste zin zonder het woord dat Bliepo bij deze vraag al zei (nooit 2 keer "dichtbij").
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede).
- Elke fout wordt met de naam van de denkfout bewaard; elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

## 1. Denkfouten (zelfde namen als de gouden les Tellen)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) | draaiboek Tellen §7 |
| \`te-veel\` | telde er te veel (telde er een 2 keer) | draaiboek Tellen §7 |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt: \`alleen-volle-rijen\` van de gouden les Tellen (in deze les is geen fout antwoord gelijk aan alleen de volle rijen).

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd "Kom, we tellen ze samen." (of een andere versie) en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Eerste zin + uitleg bij de 2e fout | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed (zoals de gouden les Tellen)

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje en het aantal (${TELREACTIE_RM(7, APPEL).zinnen.map((z) => `"${kaal(z)}"`).join(" / ")}), samen als 1 uiting; de nummers 1 t/m n staan tegelijk bij de dingen (bij 2 aan 2 per paar: boven, onder, zodat onder 2, 4, 6 … staat). Vanzelf door.
- **Eerste vraag in één keer goed:** lofzin, "${RM.natellen[0]}" (of een variant), Bliepo telt hardop (± 1,15 s per nummer). Het laatste getal zegt hij in de slotzin, zodat het maar 1 keer klinkt: "${kaal(RM.natellenKlaar(7, APPEL)[0])}". Een tik op de pijl zet alle nummers er meteen bij: dan "${kaal(RM.natellenKlaarSnel(7, APPEL)[0])}"
- **Goed na een fout:** alleen een korte bevestiging; de nummers staan erbij.
- **Heel snel:** Bliepo zegt niets (BOUWREGELS 6.10, Tellen).

## 5. Controles van het script

${`Inhoud gelijk aan squla-rekenmix-mix1-1; ${telling} foute antwoorden met een vaste denkfout; verklapcontrole over ${combinaties} combinaties van eerste zin en hint (er blijven altijd minstens 2 keuzes over, het goede er altijd bij; zonder richting ook geen richtingwoord); waarheidscontrole (${beweringen} beweringen, alle varianten: "dichtbij", "bijna" en "iets" alleen bij hooguit 2 verschil, "rij voor rij" alleen bij rijen enzovoort); geen opdracht bij de 2e keer; ${paren} paren van 1e en 2e keer (nooit 2 keer "dichtbij" of dezelfde eerste zin bij 1 vraag); de kiezer ${reacties} reacties nagespeeld met de functies van de les (nooit 2 keer dezelfde zin achter elkaar, geen getal 2 keer in 1 stuk, geen stuk 2 keer in 1 reactie, na de hint altijd een vraag of opdracht, ${stukken} stukken passen in het tekstvak); ${alleZinnen.length} zinnen zonder woord van de niet-lijst, zonder "fout" of "vinkje", zonder kaal cijfer en hooguit 14 woorden.`}

## 6. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer. "Je koos 7." en "Je koos 9." tellen als dezelfde zin.

### Bij een fout: ballen in rijen (voorbeeld met het getal 9)

| Situatie | Varianten |
|---|---|
${voorbeeld(BAL, "rijen", "9")}

### Bij een fout: hints bij appels door elkaar en potloden 2 aan 2

| Situatie | Varianten |
|---|---|
${VARIANTEN_FOUT_RM(APPEL, "los", "9").filter(([n]) => n.startsWith("Hint")).map(([naam, z]) => `| ${naam} (door elkaar) | ${z.map(kaal).join(" / ")} |`).join("\n")}
${VARIANTEN_FOUT_RM(POTLOOD, "paren", "9").filter(([n]) => n.startsWith("Hint")).map(([naam, z]) => `| ${naam} (2 aan 2) | ${z.map(kaal).join(" / ")} |`).join("\n")}

Liggen er 3 of meer tussen het gekozen en het goede getal (vraag 7, 10 en 14), dan vallen de versies met "dichtbij", "bijna", "scheelt", "iets" en "een klein beetje" weg.

### Het verloop

| Situatie | Varianten |
|---|---|
| Begin van de les (na "Hoi …! Fijn dat je er bent.") | ${RM.begin.join(" / ")} |
| De vraag (blijft gelijk) | ${RM.vraag(BAL)} (de eerste keer met: ${RM.vraagEerste}) |
| De vraag terug na de hint | ${RM.opnieuw(BAL).join(" / ")} |
| Eerste vraag goed: Bliepo telt na | ${RM.natellen.join(" / ")} |
| Na het natellen | ${RM.natellenKlaar(7, APPEL).map(kaal).join(" / ")} |
| Na het natellen, als het kind op de pijl tikte | ${RM.natellenKlaarSnel(7, APPEL).map(kaal).join(" / ")} |
| 2e keer: we gaan samen tellen | ${RM.samenHelp.join(" / ")} |
| Samen tellen: de opdracht | ${RM.samenTik(BAL).join(" / ")} (bij potloden: ${RM.samenTik(POTLOOD)[0]}) |
| Samen tellen: het hulphandje (aanmoediging) | ${RM.aanmoedigTikken.join(" / ")} |
| Samen tellen: het hulphandje (wat te doen) | ${RM.samenHand(BAL).join(" / ")} |
| Samen tellen: klaar | ${RM.samenKlaar(10, BAL).map(kaal).join(" / ")} |
| Samen tellen: 20 s niets, Bliepo telt de rest | ${RM.samenZelf(10, BAL).map(kaal).join(" / ")} |
| Hetzelfde getal 2 keer | ${RM.weerGekozen(9, BAL).map(kaal).join(" / ")} |
| Slotzin | ${RM.slot.map(kaal).join(" / ")} |
| De kaart | ${RM.kaartTik.join(" / ")} |
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix1-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix1-1-gouden.md geschreven");
