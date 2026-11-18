/**
 * Maakt FOUTTABEL-squla-splits-splitsen1-1-gouden.md uit de code (squla-splitsen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de VERKLAPCONTROLE (BOUWREGELS 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-splitsen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan. Stopt met een foutmelding als een zin het
 * antwoord verklapt.
 */
import { writeFileSync } from "node:fs";
import { AANMOEDIG_SLEPEN, KB, OMDRAAIWOORDEN, OPNIEUW_BEGIN, PARENREACTIE, SPLITSREACTIE_WARM, TOTAAL_KEUZES, VRAGEN, WISSELWOORDEN, ZIN, dichtbijAnders, opdracht, opnieuw, huisFout, parenFout, tienFout, totaalFout, tweedeEerste, weerGekozen, weerGelegd, weerGelegdTien, zelfdeKern, type Fout, type HuisVraag, type ParenVraag, type TienVraag } from "../src/components/les/lessen/squla-splitsen-gouden-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* ---------- verklapcontrole ---------- */
/**
 * Wat het kind zelf moet vinden ("het antwoord"):
 *   - huisje (vraag 1–9): het andere deel (het "?" onder het oranje vak of de zak). Het eerste deel staat in de opdracht en
 *     onder het paarse vak, dat mag Bliepo noemen;
 *   - 3 huisjes (vraag 10): het getal in elk leeg vakje;
 *   - doos met doek (vraag 11–15): het aantal onder de doek;
 *   - "hoeveel samen?" (uitleg): 5.
 * Eerste zin, hint en de "weer"-zin mogen dat getal niet noemen (ook niet als "1 te veel / 1 te weinig" bij de doos) en
 * bij "omgedraaid" niet zeggen dat de delen omgedraaid zijn (dan weet het kind meteen het andere deel).
 */
function controleer(waar: string, f: Fout, verboden: string[], extra: RegExp | null) {
  /* Sinds 18 nov 2026: ALLE varianten (niet alleen de vaste van de tabel). */
  const alle: [string, string][] = [["eerste zin", f.eerste], ["hint", f.hint], ["weer", f.weer.join(" ")], ...(f.v ? [...f.v.eerste.map((z): [string, string] => ["eerste zin", z]), ...f.v.hint.map((z): [string, string] => ["hint", z]), ...f.v.weerEerste.map((z): [string, string] => ["weer", z]), ...f.v.weerUitleg.map((z): [string, string] => ["weer", z])] : [])];
  if (f.v) {
    const elk = [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg];
    for (const z of elk) if (/\bfout/i.test(z)) fouten.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
    if (f.v.eerste.length < (f.code === "som-klopt-niet" ? 2 : 3)) fouten.push(`${waar}: maar ${f.v.eerste.length} variant(en) van de eerste zin`);
    if (f.v.hint.length < 2 || f.v.uitleg.length < 2) fouten.push(`${waar}: minder dan 2 varianten van hint of uitleg`);
    if (f.v.weerEerste.length && (f.v.weerEerste.length < 2 || f.v.weerUitleg.length < 2)) fouten.push(`${waar}: minder dan 2 varianten van "weer"`);
    if (f.noot) for (const z of [...f.v.eerste, ...f.v.hint]) if (/te veel|te weinig|\bmeer\b|\bminder\b|zo veel/i.test(kaal(z))) fouten.push(`${waar}: variant geeft toch een richting: "${kaal(z)}"`);
    /* Bij de 2e fout is er altijd een eerste zin over die niet "dichtbij/bijna/scheelt" herhaalt en niet dezelfde is. */
    for (const z1 of f.v.eerste) for (const z2 of tweedeEerste(f, z1)) if (f.v.eerste.length > 1 && (z1 === z2 || zelfdeKern(z1, z2))) fouten.push(`${waar}: 2e fout herhaalt "${kaal(z1)}" met "${kaal(z2)}"`);
  }
  for (const [naam, tekst] of alle) {
    for (const v of verboden) if (tekst.includes(v)) fouten.push(`${waar}: ${naam} noemt het antwoord (${kaal(v)}): "${kaal(tekst)}"`);
    if (extra && extra.test(tekst)) fouten.push(`${waar}: ${naam} verklapt het antwoord: "${kaal(tekst)}"`);
  }
  if (!f.eerste && f.code !== "onduidelijk") fouten.push(`${waar}: geen eerste zin`);
  if (!f.hint) fouten.push(`${waar}: geen hint`);
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg}`)) fouten.push(`${waar}: het woord "fout"`);
}

type Rij = { vraag: string; antwoord: string; f: Fout };
const rijen: Rij[] = [];

/** De meest voorkomende foute verdelingen bij de 3 huisjes (alles 9 ballen). */
function parenFoutePogingen(v: ParenVraag): number[][] {
  const r = v.paren.map(([t, d]) => t - d);
  const n = r.reduce((a, b) => a + b, 0);
  const lijst = [
    [3, 3, 3],
    [r[1], r[0], r[2]],
    [r[0], r[2], r[1]],
    [r[0] + 1, r[1] - 1, r[2]],
    [r[0], r[1] + 1, r[2] - 1],
    [n, 0, 0],
    [0, 0, n],
  ];
  return lijst.filter((t) => t.every((x) => x >= 0) && t.reduce((a, b) => a + b, 0) === n && !t.every((x, i) => x === r[i]));
}

for (const v of VRAGEN) {
  if (v.soort === "huis") {
    const rest = v.tot - v.deel;
    for (let p = 0; p <= v.tot; p++) {
      if (p === v.deel) continue;
      const f = huisFout(v, p);
      controleer(`${v.id} ${p}+${v.tot - p}`, f, [`{${rest}:${KB}}`], f.code === "omgedraaid" ? OMDRAAIWOORDEN : null);
      if (f.code === "omgedraaid" && !f.noot) fouten.push(`${v.id}: omgedraaid zonder noot`);
      rijen.push({ vraag: `${v.nr}. ${v.tot} ${v.vw === "pion" ? "pionnen" : "ballen"}${v.zak ? " (zak)" : ""}: ${v.deel} paars + ? (goed: ${rest})`, antwoord: `${p} paars, ${v.tot - p} ${v.zak ? "zak" : "oranje"}`, f });
    }
  } else if (v.soort === "tienvak") {
    const r = 10 - v.zicht;
    for (let n = 1; n <= 10; n++) {
      if (n === r) continue;
      const f = tienFout(v, n);
      controleer(`${v.id} ${n}`, f, [`{${r}:${KB}}`, `{${r}:wit}`], /\b1 te (veel|weinig)\b|er \{?1(:[a-z]+\})? te/i);
      rijen.push({ vraag: `${v.nr}. doos: ${v.zicht} te zien, ? onder de doek (goed: ${r})`, antwoord: `${n} in het vak`, f });
    }
  } else {
    const r = v.paren.map(([t, d]) => t - d);
    for (const tel of parenFoutePogingen(v)) {
      const f = parenFout(v, tel);
      const i = tel.findIndex((c, j) => c !== r[j]);
      controleer(`${v.id} ${tel.join("-")}`, f, [`{${r[i]}:${KB}}`], null);
      rijen.push({ vraag: `${v.nr}. 3 huisjes ${v.paren.map(([t, d]) => `${t}=${d}+?`).join(", ")} (goed: ${r.join(", ")})`, antwoord: tel.join(", "), f });
    }
  }
}
for (const x of TOTAAL_KEUZES.filter((k) => k !== 5)) {
  const f = totaalFout(x);
  controleer(`uitleg-totaal ${x}`, f, ["{5:", " 5 ", " 5."], null);
  rijen.push({ vraag: "Uitleg (na Nee): hoeveel pionnen zijn er samen? (1 / 4 / 5; goed: 5)", antwoord: String(x), f });
}

/*
 * Waarheidscontrole (keuring Huisnummers, 10 nov 2026) en geen opdracht bij de 2e fout (keuring Getallenlijn): voor elk
 * mogelijk fout antwoord (huisje: elke verdeling, doos: 1 t/m 10 ballen) moet elke bewering kloppen, en de zinnen bij de 2e
 * fout (uitleg en "weer") zijn uitleg: meteen daarna doet Bliepo het samen voor.
 */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Leg|Sleep|Schuif|Pak|Zoek|Tik)\b/;
let beweringen = 0;
const dichtVersies = new Set<string>();
for (const r of rijen) {
  const f = r.f;
  for (const z of [f.uitleg, ...f.weer, ...(f.v ? [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg] : [])]) if (OPDRACHT.test(kaal(z))) fouten.push(`${r.vraag} ${r.antwoord}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
}
for (const v of VRAGEN) {
  if (v.soort === "tienvak") {
    const goed = 10 - v.zicht;
    for (let n = 1; n <= 10; n++) {
      if (n === goed) continue;
      const f = tienFout(v, n);
      const alles = kaal([f.eerste, f.hint, f.uitleg, ...f.weer, ...(f.v ? [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg] : [])].join(" "));
      /* Alle varianten van de eerste zin (18 nov 2026): elke bewering moet waar zijn. */
      for (const e of (f.v?.eerste ?? []).map(kaal)) {
        beweringen++;
        const mis = (wat: string) => fouten.push(`${v.id} ${n}: niet waar (${wat}): "${e}"`);
        if (/dichtbij|scheelt|bijna|net niet/i.test(e) && Math.abs(n - goed) !== 1) mis("dichtbij");
        if (/te veel|zo veel liggen er niet/i.test(e) && !(n > goed)) mis("te veel");
        if (/te weinig|liggen er meer/i.test(e) && !(n < goed)) mis("te weinig");
        if (/hele doos/i.test(e) && n !== 10) mis("hele doos");
        if (/zie je (er )?al|die je al ziet/i.test(e) && n !== v.zicht) mis("zoveel zie je al");
        const getallen = e.match(/\d+/g) ?? [];
        if (getallen.some((x) => Number(x) !== n)) mis("ander getal dan het kind legde");
        if (getallen.length > 1) mis("getal 2 keer");
        if (n === 1 && /\b1 ballen|Dat zijn er/.test(e)) mis("meervoud bij 1");
      }
      for (const z of weerGelegdTien(n).map(kaal)) if ((z.match(/\d+/g) ?? []).join() !== String(n) || (n === 1 && /ballen/.test(z))) fouten.push(`${v.id} ${n}: weerGelegdTien klopt niet: "${z}"`);
      const klopt = (re: RegExp, ok: boolean, wat: string) => {
        if (!re.test(alles)) return;
        beweringen++;
        if (!ok) fouten.push(`${v.id} ${n}: niet waar: ${wat} ("${alles}")`);
      };
      klopt(/dichtbij|scheelt niet veel/, Math.abs(n - goed) === 1, "dichtbij");
      klopt(/te veel/, n > goed, "te veel");
      klopt(/te weinig/, n < goed, "te weinig");
      klopt(/hele doos/, n === 10, "hele doos");
      klopt(/zoveel ballen zie je al/i, n === v.zicht, "zoveel zie je al");
      klopt(new RegExp(`Je legde er ${n}\\b`), true, "");
      if (f.noot) {
        for (const e of f.v?.eerste ?? [f.eerste]) dichtVersies.add(kaal(e).replace(/\d+/g, "#"));
        if (dichtbijAnders(n, v) === f.eerste) fouten.push(`${v.id} ${n}: dichtbijAnders is dezelfde zin`);
        /* Keuring 11 nov 2026: 2 keer 1 ernaast bij 1 doos zegt nooit 2 keer "dichtbij". */
        if (/dichtbij/.test(f.eerste) && /dichtbij/.test(dichtbijAnders(n, v))) fouten.push(`${v.id} ${n}: 2 keer "dichtbij" bij 1 vraag`);
      }
      /* Keuring 11 nov 2026: enkelvoud en meervoud ("Je legde er 1. Dat zijn er …" was fout). */
      if (/\b1\. Dat zijn er\b/.test(kaal(f.eerste))) fouten.push(`${v.id} ${n}: meervoud bij 1: "${kaal(f.eerste)}"`);
    }
  } else if (v.soort === "huis") {
    for (let p = 0; p <= v.tot; p++) {
      if (p === v.deel) continue;
      const f = huisFout(v, p);
      /* Alle varianten van de eerste zin (18 nov 2026): waar, enkelvoud/meervoud goed, geen getal 2 keer. */
      const een = Math.abs(p - v.deel) === 1;
      for (const z of (f.v?.eerste ?? []).map(kaal)) {
        beweringen++;
        const mis = (wat: string) => fouten.push(`${v.id} ${p}: niet waar (${wat}): "${z}"`);
        if (/te veel/.test(z) && !(p > v.deel)) mis("te veel");
        if (/te weinig/.test(z) && !(p < v.deel)) mis("te weinig");
        if (/\b1 (pion|bal) te|er (net )?1 te/.test(z) && !een) mis("1 te veel/weinig");
        const getallen = (z.match(/\d+/g) ?? []).map(Number);
        if (getallen.some((x) => x !== p && !(een && x === 1))) mis("ander getal dan er ligt");
        if (new Set(getallen).size !== getallen.length) mis("getal 2 keer");
        if (/\b1 (pionnen|ballen)\b|ligt [2-9]|liggen 1\b/.test(z)) mis("enkelvoud/meervoud");
        if (/leeg/.test(z) && p !== 0) mis("leeg");
        if (/\balle\b/i.test(z) && p !== 0 && p !== v.tot) mis("alle");
      }
      for (const z of weerGelegd(p, v.vw).map(kaal)) if (/\b1 (pionnen|ballen)\b|liggen weer 1\b|ligt weer [2-9]/.test(z)) fouten.push(`${v.id} ${p}: weerGelegd klopt niet: "${z}"`);
      for (const z of (f.v?.hint ?? []).map(kaal)) if (p === 1 && /Tel de|Wijs de/.test(z)) fouten.push(`${v.id} ${p}: hint over tellen bij 1 ding: "${z}"`);
      const e = kaal(f.eerste);
      const m = /In het paarse vak (?:ligt|liggen) (\d+)/.exec(e);
      if (m) {
        beweringen++;
        if (Number(m[1]) !== p) fouten.push(`${v.id} ${p}: niet waar: "${e}"`);
      }
      if (/te veel/.test(e)) { beweringen++; if (!(p > v.deel)) fouten.push(`${v.id} ${p}: niet waar (te veel): "${e}"`); }
      if (/te weinig/.test(e)) { beweringen++; if (!(p < v.deel)) fouten.push(`${v.id} ${p}: niet waar (te weinig): "${e}"`); }
      /* Keuring 11 nov 2026: "de andere ballen" terwijl er maar 1 over is (vraag 7). */
      const rest1 = v.tot - v.deel === 1;
      for (const z of [f.hint, f.uitleg, ...f.weer]) if (rest1 && /\bandere (pionnen|ballen|pingpongballen)\b/.test(kaal(z))) fouten.push(`${v.id} ${p}: meervoud bij 1 over: "${kaal(z)}"`);
    }
    if (v.tot - v.deel === 1)
      for (const z of [opnieuw(v, 0), ZIN.handRest(v), ...ZIN.samenHuisRest(v)]) if (/\bandere (gaan|pionnen|ballen)\b/.test(kaal(z))) fouten.push(`${v.id}: meervoud bij 1 over: "${kaal(z)}"`);
  }
}
/*
 * NOOIT 2 KEER HETZELFDE (Sara, 18 nov 2026): speel de kiezer 20.000 keer na met willekeurige vragen en foute antwoorden en
 * kijk of er ooit 2 keer achter elkaar dezelfde zin komt (getallen en voorwerpen weggedacht), ook over vragen heen.
 */
{
  const vorm = maakVorm(WISSELWOORDEN);
  const K = maakKiezer({ wissel: WISSELWOORDEN });
  const laatste = new Map<string, string>();
  let dubbel = 0;
  let keer = 0;
  const neem = (sleutel: string, zinnen: string[]) => {
    const z = K.kies(sleutel, zinnen);
    keer++;
    if (laatste.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
      dubbel++;
      if (dubbel <= 5) console.error(`   dubbel bij "${sleutel}": ${kaal(z)} (keuze uit: ${zinnen.map(kaal).join(" | ")})`);
    }
    laatste.set(sleutel, vorm(z));
    return z;
  };
  const foutVan = (v: (typeof VRAGEN)[number]): { f: Fout; x: number; weer: string[] } => {
    if (v.soort === "huis") {
      let p = v.deel;
      while (p === v.deel) p = Math.floor(Math.random() * (v.tot + 1));
      return { f: huisFout(v, p), x: p, weer: weerGelegd(p, v.vw) };
    }
    if (v.soort === "tienvak") {
      let n = 10 - v.zicht;
      while (n === 10 - v.zicht) n = 1 + Math.floor(Math.random() * 10);
      return { f: tienFout(v, n), x: n, weer: weerGelegdTien(n) };
    }
    const pogingen = parenFoutePogingen(v);
    const k = Math.floor(Math.random() * pogingen.length);
    return { f: parenFout(v, pogingen[k]), x: k, weer: [] };
  };
  for (let i = 0; i < 20000; i++) {
    const v = VRAGEN[Math.floor(Math.random() * VRAGEN.length)];
    const a = foutVan(v);
    const e = neem("eerste", a.f.v!.eerste);
    neem("hint", a.f.v!.hint);
    neem("opnieuw", OPNIEUW_BEGIN);
    if (Math.random() < 0.5) continue;
    const b = foutVan(v);
    if ((a.f.soort ?? a.f.code) === (b.f.soort ?? b.f.code) && !a.f.noot && b.f.v!.weerEerste.length) {
      neem("weer", b.f.v!.weerEerste);
      neem("uitleg", b.f.v!.weerUitleg);
    } else {
      if (a.x === b.x && b.weer.length) neem("weerGekozen", b.weer);
      else {
        const e2 = neem("eerste", tweedeEerste(b.f, e));
        if (v.soort !== "paren" && zelfdeKern(e, e2)) fouten.push(`${v.id}: 2 keer "dichtbij/bijna/scheelt" bij 1 vraag: "${kaal(e)}" en "${kaal(e2)}"`);
      }
      neem("uitleg", b.f.v!.uitleg);
    }
    neem("samenHelp", ZIN.samenHelp);
    neem("aanmoedig", AANMOEDIG_SLEPEN);
    if (v.soort === "huis") {
      neem("samenDeel", ZIN.samenHuisDeel(v));
      neem("samenRest", ZIN.samenHuisRest(v));
      neem("samenKlaar", ZIN.samenHuisKlaar(v));
      neem("hand", ZIN.hand(v.vw));
    } else if (v.soort === "tienvak") {
      neem("samenDeel", ZIN.samenTienDoek(v));
      neem("samenRest", ZIN.samenTienRest);
      neem("samenKlaar", ZIN.samenTienKlaar(v));
      neem("hand", ZIN.handTien);
    } else {
      for (const [t, d] of v.paren) neem("samenParenHuis", ZIN.samenParenHuis(t, d));
      neem("samenRest", ZIN.samenParenRest);
      neem("samenKlaar", ZIN.samenParenKlaar);
    }
  }
  console.log(`Nooit 2 keer hetzelfde: ${keer} keer gekozen, ${dubbel} keer 2 keer achter elkaar dezelfde zin (moet 0).`);
  if (dubbel) fouten.push(`de kiezer gaf ${dubbel} keer 2 keer achter elkaar dezelfde zin`);
}

/* De vaste zinnen van het verloop (ZIN): nooit "fout", geen getal 2 keer in 1 zin, genoeg varianten per situatie. */
const H = VRAGEN[1] as HuisVraag;
const H1 = VRAGEN[6] as HuisVraag;
const T = VRAGEN[10] as TienVraag;
const VERLOOP: [string, string[], number][] = [
  ["Begin van de les", ZIN.begin, 2],
  ["Opnieuw proberen na de 1e keer (begin van de opdracht)", OPNIEUW_BEGIN, 3],
  ["Hulphandje: aanmoediging", AANMOEDIG_SLEPEN, 3],
  ["Hulphandje: wat te doen (huisje)", ZIN.hand("pion"), 2],
  ["Hulphandje: wat te doen (doos)", ZIN.handTien, 2],
  ["2e keer mis: we doen het samen", ZIN.samenHelp, 3],
  ["Samen (huisje): Bliepo legt het eerste deel", ZIN.samenHuisDeel(H), 2],
  ["Samen (huisje): het kind sleept de rest", ZIN.samenHuisRest(H), 2],
  ["Samen (huisje): er is nog 1 over", ZIN.samenHuisRest(H1), 2],
  ["Samen (huisje): klaar", ZIN.samenHuisKlaar(H), 2],
  ["Samen (huisje): Bliepo legt de rest zelf", ZIN.samenHuisZelf(H), 2],
  ["Samen (doos): de doek gaat weg", ZIN.samenTienDoek(T), 2],
  ["Samen (doos): het kind sleept de laatste", ZIN.samenTienRest, 2],
  ["Samen (doos): klaar", ZIN.samenTienKlaar(T), 2],
  ["Samen (doos): Bliepo legt de laatste zelf", ZIN.samenTienZelf(T), 2],
  ["Samen (3 huisjes): per huisje", ZIN.samenParenHuis(6, 4), 3],
  ["Samen (3 huisjes): het kind sleept de laatste", ZIN.samenParenRest, 2],
  ["Samen (3 huisjes): klaar", ZIN.samenParenKlaar, 2],
  ["Samen (3 huisjes): Bliepo legt de laatste zelf", ZIN.samenParenZelf, 2],
  ["Hetzelfde antwoord 2 keer (huisje)", weerGelegd(5, "pion"), 3],
  ["Hetzelfde antwoord 2 keer (doos)", weerGelegdTien(6), 3],
  ["Hetzelfde antwoord 2 keer (hoeveel samen?)", weerGekozen(4), 3],
  ["Zin met de 2 delen na lof", SPLITSREACTIE_WARM(7, 4, 3).zinnen, 5],
  ["Zin na lof bij de 3 huisjes", PARENREACTIE.zinnen, 3],
  ["Slot", ZIN.slot, 2],
  ["Tik op de kaart", ZIN.kaartTik, 3],
];
for (const [naam, zinnen, min] of VERLOOP) {
  if (new Set(zinnen).size < min) fouten.push(`${naam}: maar ${new Set(zinnen).size} variant(en), moet minstens ${min}`);
  for (const z of zinnen) {
    if (/\bfout/i.test(z)) fouten.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
    const gg = kaal(z).match(/\d+/g) ?? [];
    if (new Set(gg).size !== gg.length) fouten.push(`${naam}: een getal staat 2 keer in "${kaal(z)}"`);
  }
}
for (const z of [...ZIN.samenHuisZelf(H), ...ZIN.samenTienZelf(T), ...ZIN.samenParenZelf]) if (!/^Kijk, /.test(z)) fouten.push(`vangnet: elke variant begint met "Kijk, " (geen "Ja", geen "samen"): "${kaal(z)}"`);
for (const z of [...ZIN.samenHuisKlaar(H), ...ZIN.samenTienKlaar(T), ...ZIN.samenParenKlaar]) if (!/^(Samen|Kijk)/.test(z)) fouten.push(`samen klaar: begint niet met "Samen" of "Kijk": "${kaal(z)}"`);
/* De opdrachtzinnen (15.36): kort (hooguit 14 woorden per zin), geen "missen", nooit "fout". */
for (const v of VRAGEN)
  for (let keer = 0; keer < 4; keer++)
    for (const stuk of [...opdracht(v, keer), opnieuw(v, keer)])
      for (const z of kaal(stuk).split(/(?<=[.!?]) /)) {
        if (z.split(/\s+/).length > 14) fouten.push(`${v.id}: opdrachtzin langer dan 14 woorden: "${z}"`);
        if (/\bmissen\b|\bmist\b|\bfout/i.test(z)) fouten.push(`${v.id}: "missen" of "fout" in de opdracht: "${z}"`);
      }

if (dichtVersies.size < 3) fouten.push(`eerste zin "dichtbij" bij de doos heeft maar ${dichtVersies.size} versie(s)`);
console.log(`Waarheidscontrole: ${beweringen} beweringen nagelopen; ${dichtVersies.size} versies van "dichtbij"; geen opdracht in de zinnen bij de 2e fout.`);

if (fouten.length) {
  console.error("VERKLAPPERS / FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Verklapcontrole: ${rijen.length} foute antwoorden nagelopen; geen zin noemt het antwoord, geen "omgedraaid" bij omgedraaid, geen "1 te veel/weinig" bij de doos.`);

/* ---------- de tabel ---------- */
const cel = (z: string) => kaal(z).replace(/\|/g, "/");
const tabel = rijen.map((r) => `| ${r.vraag} | ${r.antwoord} | \`${r.f.code}\` — ${r.f.denkfout}${r.f.noot ? ` *(${r.f.noot})*` : ""}${r.f.eigen ? " *(eigen invulling, niet van Synthesis)*" : ""} | ${cel(r.f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${cel(r.f.hint)} | ${cel(r.f.scherm)} |`).join("\n");
const uitleg = rijen.map((r) => `| ${r.vraag.split(":")[0]} | ${r.antwoord} (\`${r.f.code}\`) | ${cel(r.f.eerste)} ${cel(r.f.uitleg)} | ${r.f.weer.length ? cel(r.f.weer.join(" ")) : "— (1e keer niet gezegd wat er mis was: dan de gewone uitleg, geen \"weer\")"} |`).join("\n");

const H3 = VRAGEN[2] as HuisVraag;
const VOORBEELDEN: [string, Fout][] = [
  ["Huisje: alles in het paarse vak", huisFout(H3, 7)],
  ["Huisje: alles in het oranje vak", huisFout(H3, 0)],
  ["Huisje: de delen omgedraaid (niet gezegd)", huisFout(H3, 4)],
  ["Huisje: 1 te weinig", huisFout(H3, 2)],
  ["Huisje: te veel", huisFout(H3, 5)],
  ["Huisje: 1 pion in het vak, te weinig", huisFout(H3, 1)],
  ["Doos: alle 10 gelegd", tienFout(T, 10)],
  ["Doos: net zoveel als je ziet", tienFout(T, 7)],
  ["Doos: 1 ernaast (richting niet gezegd)", tienFout(T, 4)],
  ["Doos: te veel", tienFout(T, 6)],
  ["Doos: 1 bal, te weinig", tienFout(T, 1)],
  ["3 huisjes: de som klopt niet", parenFout(VRAGEN[9] as ParenVraag, [3, 3, 3])],
  ["3 huisjes: een vakje nog leeg", parenFout(VRAGEN[9] as ParenVraag, [0, 0, 9])],
  ["Uitleg: hoeveel samen? (koos een deel)", totaalFout(4)],
];

const tekst = `# FOUTTABEL — gouden les Splitsen (squla-splits-splitsen1-1-gouden, "Splitsen tot 10")

Gemaakt op 9 november 2026, bijgewerkt op 10 november 2026 (omgezet naar de nieuwste gouden stijl, KEUZES-VOOR-SARA.md Ronde 29) en op 18 november 2026 (warmere zinnen in varianten, zelfde aanpak als de proefles Tellen; oud naast nieuw in WIJZIGINGEN-ZINNEN-SPLITSEN.md), **uit de code** met \`npx tsx scripts/fouttabel-splitsen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-splitsen-gouden-zinnen.ts\` en draai het script opnieuw (het doet ook de verklapcontrole en stopt bij een verklapper). De inhoud (15 vragen, getallen, voorwerpen) is die van squla-splits-splitsen1-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** draaiboek Splitsen (Part Part Whole), §3 en §7: Bliepo zegt wat er nu ligt (de getallen van het kind), en bij de huisjes met een leeg vakje rekent hij voor ("4 en 3 is samen 7. We zoeken 6.", \`som-klopt-niet\`). **Eigen invulling, niet van Synthesis:** de doos van 10 met de doek (vraag 11–15; Part Part Whole heeft geen doos met een doek) en de hints die naar het getal onder het paarse vak wijzen (Synthesis heeft geen opdracht met 1 deel gegeven, alleen het handje). Gemarkeerd in de tabel.

In de les staan de getallen in de kleur van het vak: paars = het eerste deel, oranje = het andere deel; het totaal is wit (de pionnen hebben allemaal een andere kleur). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Nakijken:** bij de huisjes vanzelf zodra alles in een vak ligt en het kind 0,4 s niets sleept (in de proef na een fout 1,6 s), zodat het kind nog kan schuiven (14.26, 14.30). Bij de doos met het vinkje (zie KEUZES-VOOR-SARA.md, Ronde 21).
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de dingen schudden even en blijven liggen. Bliepo zegt de eerste zin en de hint (1 uiting); de pijl staat erbij als snelkoppeling en ± 0,7 s na de zin gaat het vanzelf verder (BOUWREGELS 15.27, sinds 10 november 2026; het draaiboek wacht hier op de pijl, 15.27 gaat voor). Noemt de hint het getal onder het paarse vak, dan krijgt dat getal een rondje; bij de 3 huisjes het huisje, bij de doos de doos. Na de pijl gaan de vakken leeg en zegt Bliepo de opdracht kort opnieuw (§3 F.2). **In de proef** (na Ja) blijven de dingen liggen (§3 A.2).
- **2e fout:** de uitleg bij de denkfout (laatste tabel), dan "Kom, we doen het samen." (of een variant, 5 in totaal). Bliepo legt het ene deel zelf in het paarse vak (bij de doos: de doek gaat open en Bliepo legt de ballen op 1 na; bij de huisjes alles op 1 bal na) en het kind sleept de rest (de kleine stap; het handje van Synthesis, §3 F.6). Daarna het andere deel onder het vak, "Samen hebben we 9 gesplitst in 6 en 3." (of een variant), en de les gaat vanzelf door. Sleept het kind 20 s niets, dan legt Bliepo de rest zelf ("Kijk, ik leg de rest erbij. …").
- **2e fout in de proef:** geen samen voordoen: "Dat is nog lastig. We kijken eerst samen hoe splitsen werkt." en dan de uitleg (draaiboek §3 A.4).
- **Verklappen (15.17):** de hint wijst naar het getal onder het paarse vak (dat staat al in de opdracht) of naar de doek, nooit naar het andere deel. Bij \`omgedraaid\` zegt Bliepo niet dat de delen omgedraaid zijn; bij de doos zegt hij bij 1 ernaast alleen dat het dichtbij is ("Je legde er 6. Je zit er dichtbij." / "Bijna! 6 is het net niet.", 5 varianten; zoals de gouden les Tellen). Komt bij dezelfde doos nog een antwoord dat 1 ernaast zit, dan een variant zonder hetzelfde woord.
- **Twee keer dezelfde denkfout:** "weer" en een andere uitleg (laatste kolom), alleen als Bliepo de 1e keer al zei wat er mis was. Hetzelfde foute antwoord 2 keer: de eerste zin wordt "Er liggen weer 5 pionnen in het paarse vak." / "Je legde er weer 6." / "Je koos weer 4." (elk 3 varianten).
- **Varianten (18 november 2026):** elke zin bij een fout bestaat in varianten (§5). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer \`nooit-dubbel.ts\`). In §2 en §3 staat per fout antwoord 1 vaste variant als voorbeeld; het script loopt ALLE varianten na (verklappen, waarheid, enkelvoud en meervoud, geen opdracht bij de 2e fout, geen getal 2 keer in 1 zin, nooit het woord "fout") en speelt de kiezer 20.000 keer na.
- **Niet duidelijk (\`onduidelijk\`):** komt hier niet voor (elke foute verdeling heeft een denkfout); als vangnet een zin uit BLIEPO-KARAKTER.md §10.
- **Bewaard:** elke fout met de naam van de denkfout (tabel \`les_uitkomsten\`, alleen als er een kind gekozen is), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-veel\` / \`te-weinig\` | te veel of te weinig in het paarse vak (of in de doos-opdracht in het vak) | draaiboek §7 (\`som-klopt-niet\`, tellen) |
| \`een-te-veel\` / \`een-te-weinig\` | er precies 1 naast (verkeerd geteld) | draaiboek §7 (gezien) |
| \`omgedraaid\` | het getal van het paarse vak in het andere vak gelegd | draaiboek §7 (gezien, bij vrije splitsingen) |
| \`alles-in-1-vak\` | alles in 1 vak, het andere bleef leeg | draaiboek §7 \`deel-is-totaal-ander-leeg\` |
| \`som-klopt-niet\` | bij een huisje zijn het getal en de ballen samen niet het getal in het dak | draaiboek §7 (gezien, vaak) |
| \`totaal-als-deel\` | alle 10 ballen in het vak gelegd (het totaal) | draaiboek §7 (gezien bij een keuzevraag); eigen invulling bij de doos |
| \`zichtbaar-gelegd\` | net zoveel gelegd als er al te zien zijn | eigen invulling, niet van Synthesis |
| \`deel-voor-totaal\` | bij "hoeveel samen?" een deel gekozen | draaiboek §7 (gezien) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt uit draaiboek §7: \`cijfers-naast-elkaar\` en \`verkeerde-som\` (er is geen somvraag in deze Squla-les), \`woord-verkeerd\` (geen woordvraag), \`al-gevonden\` (alleen in de uitleg "splits 5 op een andere manier": daar telt het niet als fout), \`te-weinig-delen-geteld\` (geen tegel).

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

Bij de huisjes ligt alles in een vak (anders wordt er nog niet nagekeken), dus het andere vak heeft steeds de rest. Bij de doos kan het kind 1 tot 10 ballen leggen. Bij de 3 huisjes staan de meest voorkomende foute verdelingen.

| Vraag | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${tabel}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd "Kom, we doen het samen." (of een variant) en het samen voordoen (nu pas het antwoord in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, de dingen wippen op met een lichtgolf; een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en wat er gesplitst is (${SPLITSREACTIE_WARM(7, 4, 3).zinnen.map((z) => `"${kaal(z)}"`).join(" / ")}), als 1 uiting. Het andere deel komt onder het vak en het totaal in het dak. Begint de lofzin met "Ja", dan komt een reactie zonder "Ja"; de robotreactie hooguit 1 keer per les. **Daarna vanzelf door** (0,6 s na de zin; draaiboek §0).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Heel snel:** Bliepo zegt niets over snel (draaiboek §3 B.7 en F.8). Slepen tijdens Bliepo's zin telt gewoon mee.
- **Lang niets doen:** na ± 6 s stilte bij een opdracht komt vanzelf het hulphandje: van het hoopje naar een leeg vak (nooit naar een vak dat al iets heeft: dat zou zeggen of het genoeg is). De eerste keer per opdracht met een aanmoediging en 1 korte zin ("Pak een pion en sleep hem naar een vak." of een variant). Ligt er bij de doos al iets in het vak, dan komt er niets (het kind is bezig). Bij een keuzevraag: niets.
- **Vinkje (doos):** de eerste keer legt het lesscherm het zelf uit ("Klaar? Tik dan op het vinkje."); de les zegt er niets bij.
- **Rust voor het nakijken:** 0,4 s zonder slepen (dan meteen de reactie); in de proef na een fout (de dingen blijven liggen) 1,6 s, zodat het kind er een paar kan schuiven.
- **Proef na een fout, lang stil:** het handje wijst van het vak met te veel naar het andere vak ("Schuif een pion uit het paarse vak naar het oranje vak."), zonder aanmoediging ervoor.

## 5. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer. Voorbeelden met vraag 3 (7 pionnen, 3 paars), vraag 11 (doos, 7 te zien), vraag 10 (3 huisjes) en de uitlegvraag.

### Bij een fout

| Situatie | Eerste zin | Hint | Uitleg bij de 2e keer | "Weer" (2 keer dezelfde denkfout) |
|---|---|---|---|---|
${VOORBEELDEN.map(([naam, f]) => `| ${naam} | ${f.v!.eerste.map(cel).join(" / ")} | ${f.v!.hint.map(cel).join(" / ")} | ${f.v!.uitleg.map(cel).join(" / ")} | ${f.v!.weerEerste.length ? `${f.v!.weerEerste.map(cel).join(" / ")} — dan: ${f.v!.weerUitleg.map(cel).join(" / ")}` : "—"} |`).join("\n")}

### Het verloop

| Situatie | Varianten |
|---|---|
${VERLOOP.map(([naam, z]) => `| ${naam} | ${z.map(cel).join(" / ")} |`).join("\n")}

### De opdracht zelf (15.36)

| Vraag | Opdracht | Na de 1e keer mis |
|---|---|---|
${VRAGEN.map((v) => `| ${v.nr} | ${cel(opdracht(v, v.soort === "huis" ? (v.zak ? v.nr - 6 : v.nr - 1) : v.soort === "tienvak" ? v.nr - 11 : 0).join(" "))} | ${cel(opnieuw(v, v.nr))} |`).join("\n")}
`;

writeFileSync(new URL("../FOUTTABEL-squla-splits-splitsen1-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-splits-splitsen1-1-gouden.md geschreven");
