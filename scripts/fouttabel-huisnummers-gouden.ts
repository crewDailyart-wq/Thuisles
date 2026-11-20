/**
 * Maakt FOUTTABEL-squla-huisnummers-gouden.md uit de code (squla-huisnummers-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN- en VERKLAPCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-huisnummers-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de zin het antwoord en stopt het script. Bij typen
 * zijn er altijd veel antwoorden over; daar kijkt het script alleen of het goede getal niet in de eerste zin of hint staat.
 * Geen zin mag het woord "fout" hebben, en geen eerste zin of hint mag 2 buren tegelijk noemen ("tussen 15 en 17").
 *
 * 18 november 2026 (warme zinnen in varianten, zoals Tellen en Splitsen): het script keurt nu ALLE varianten, niet alleen
 * de eerste: verklappen, waarheid, geen getal 2 keer in 1 stuk, geen hint die met een vraag eindigt, genoeg varianten per
 * situatie, heldere opdrachtzinnen (15.36), en het speelt de kiezer 20.000 keer na (nooit 2 keer achter elkaar dezelfde).
 */
import { writeFileSync } from "node:fs";
import { AANMOEDIG_TIKKEN, OPNIEUW_BEGIN, VRAGEN, ZIN, buur, deeltGetal, foutStuk, foutenVan, gat, hintNoemtHuis, hintsVan, huisFout as huisFoutVoor, huisReactie, isTyp, nummers, opnieuwZin, pastNa, vooruit, type Fout, type Vraag } from "../src/components/les/lessen/squla-huisnummers-gouden-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const keuzesVan = (v: Vraag) => v.opties ?? v.losse ?? [];

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): 17 vragen zoals squla-huisnummers; precies 1 goed antwoord. */
const OUD: [string, string, number, string][] = [
  ["na", "6,7,?", 8, "9,8,6"], ["voor", "?,12,13", 11, "13,11,10"], ["tussen", "14,15,?,17,18", 16, "16,19,13"], ["na", "17,18,19,?", 20, ""], ["sleep", "8,9,_,11,12", 10, "7,10,13"],
  ["na", "24,25,?", 26, "24,27,26"], ["terug", "?,27,28,29", 26, "30,26,25"], ["voor", "?,21,22", 20, "22,19,20"], ["tussen", "26,27,?,29,30", 28, "28,26,38"], ["sleep", "21,22,23,_,25", 24, "42,24,26"], ["voor", "?,30,31", 29, ""],
  ["na", "38,39,?", 40, "30,41,40"], ["terug", "?,41,42,43", 40, "44,39,40"], ["tussen", "45,46,?,48,49", 47, "44,47,50"], ["sleep", "32,33,_,35,36", 34, "37,43,34"], ["na", "47,48,49,?", 50, ""], ["terug", "?,35,36,37", 34, "34,38,33"],
];
if (VRAGEN.length !== 17) fouten.push(`${VRAGEN.length} vragen in plaats van 17 (squla-huisnummers)`);
VRAGEN.forEach((v, i) => {
  const [soort, huizen, goed, keuzes] = OUD[i];
  if (v.soort !== soort || v.huizen.map((h) => (h === null ? "_" : h)).join(",") !== huizen || v.goed !== goed || keuzesVan(v).join(",") !== keuzes) fouten.push(`${v.id}: wijkt af van de oude les`);
  const k = keuzesVan(v);
  if (k.length && k.filter((x) => x === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (new Set(k).size !== k.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk`);
  /* De rij klopt: steeds 1 erbij, met het goede antwoord op het gat. */
  const rij = v.huizen.map((h, j) => (j === gat(v) ? v.goed : h));
  if (rij.some((h, j) => j > 0 && (h as number) !== (rij[j - 1] as number) + 1)) fouten.push(`${v.id}: de straat telt niet steeds 1 verder`);
  if (nummers(v).includes(v.goed)) fouten.push(`${v.id}: het goede nummer staat al in de straat`);
  if (!vooruit(v) && v.goed !== buur(v) - 1) fouten.push(`${v.id}: buur klopt niet`);
});

/* 2. Fouttabel compleet en verklapcontrole: ELKE variant (18 nov 2026). */
const zinnenIn = (z: string) => kaal(z).split(/(?<=[.!?])\s+/).filter(Boolean);
const woorden = (z: string) => z.split(/\s+/).filter(Boolean).length;
const dubbelGetal = (z: string) => {
  const g = getallenIn(z);
  return g.find((n, i) => g.indexOf(n) !== i);
};
/** Algemene keuring van 1 zin (elke variant, elke soort): nooit "fout", geen getal 2 keer, hooguit 14 woorden per zin, hooguit 2 zinnen. */
const keurZin = (waar: string, z: string) => {
  if (/\bfout(en|je)?\b/i.test(z)) fouten.push(`${waar}: het woord "fout" ("${kaal(z)}")`);
  if (dubbelGetal(z) !== undefined) fouten.push(`${waar}: het getal ${dubbelGetal(z)} staat er 2 keer ("${kaal(z)}")`);
  if (zinnenIn(z).length > 2) fouten.push(`${waar}: meer dan 2 zinnen in 1 stuk ("${kaal(z)}")`);
  for (const d of zinnenIn(z)) if (woorden(d) > 14) fouten.push(`${waar}: zin van ${woorden(d)} woorden ("${d}")`);
  if (/\bmis(t|sen)\b/i.test(z)) fouten.push(`${waar}: "missen" in plaats van "ontbreken" ("${kaal(z)}")`);
};
const verklap = (v: Vraag, a: string, f: Fout): string[] => {
  const uit: string[] = [];
  if (f.code !== "onduidelijk" && !f.v.eerste.length) uit.push("geen eerste zin");
  if (!f.v.hint.length) uit.push("geen hint");
  for (const z of [...f.v.eerste, ...f.v.hint]) {
    if (getallenIn(z).includes(v.goed)) uit.push(`de eerste zin of hint noemt het antwoord ${v.goed} ("${kaal(z)}")`);
    if (/tussen \d+ en \d+/.test(kaal(z))) uit.push(`de eerste zin of hint noemt 2 buren ("${kaal(z)}")`);
    /* Alleen bij de uitleg (2e keer) mag Bliepo zeggen dat de cijfers andersom staan of hoeveel het scheelt. */
    if (/andersom|omgedraaid|\b10 (naast|onder|boven)|scheelt/i.test(kaal(z))) uit.push(`de eerste zin of hint zegt hoe ver het ernaast zit ("${kaal(z)}")`);
  }
  /* Een hint eindigt niet met een vraag: de vraag zelf komt er meteen achteraan (3.23). */
  for (const z of f.v.hint) if (/\?\s*$/.test(z)) uit.push(`de hint eindigt met een vraag ("${kaal(z)}")`);
  /* Genoeg varianten per situatie. */
  if (f.code !== "onduidelijk") {
    if (f.v.eerste.length < 3) uit.push(`maar ${f.v.eerste.length} varianten van de eerste zin`);
    if (f.v.uitleg.length < 2) uit.push(`maar ${f.v.uitleg.length} varianten van de uitleg`);
    if (!f.noot && f.v.weerEerste.length < 3) uit.push(`maar ${f.v.weerEerste.length} varianten van "weer"`);
    if (!f.noot && f.v.weerUitleg.length < 2) uit.push(`maar ${f.v.weerUitleg.length} varianten van de uitleg bij "weer"`);
    if (new Set(f.v.eerste.map(vorm)).size !== f.v.eerste.length) uit.push("2 varianten van de eerste zin zijn dezelfde zin");
  }
  if (f.v.hint.length < 4) uit.push(`maar ${f.v.hint.length} hints`);
  /* Bij elke eerste zin passen minstens 2 hints en 2 uitleggen die geen getal herhalen (dan hoeft de kiezer nooit te wijken). */
  const x = Number(a);
  for (const e of f.v.eerste) {
    if (f.v.hint.filter(pastNa(e)).length < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 hints zonder herhaald getal`);
    if (f.v.uitleg.filter(pastNa(e)).length < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaald getal`);
  }
  if (f.code !== "onduidelijk") for (const e of ZIN.weerGekozen(x, v)) if (f.v.uitleg.filter(pastNa(e)).length < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaald getal`);
  for (const e of f.v.weerEerste) if (f.v.weerUitleg.filter(pastNa(e)).length < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaald getal`);
  /* De zinnen bij de 2e keer zijn uitleg, geen opdracht: daarna telt Bliepo samen (het kind kan dan niets doen). */
  for (const z of [...f.v.uitleg, ...f.v.weerUitleg]) if (/^(Tel|Ga|Typ|Sleep|Tik|Kies|Begin|Zeg)\b/.test(kaal(z))) uit.push(`de uitleg is een opdracht ("${kaal(z)}")`);
  for (const z of f.v.weerEerste) if (!/\bweer\b|ook al/i.test(z)) uit.push(`"weer" ontbreekt ("${kaal(z)}")`);
  if (isTyp(v)) return uit;
  if (!f.over.includes(v.goed)) uit.push("het goede antwoord valt weg na de eerste zin (de zin klopt niet)");
  if (f.over.length <= 1) uit.push(`na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over`);
  return uit;
};
const vorm = maakVorm();
let telling = 0;
let variantenTeller = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const k = keuzesVan(v);
  if (k.length && Object.keys(tabel).length !== k.length - 1) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${k.length - 1} nodig`);
  if (!k.length && Object.keys(tabel).length < 5) fouten.push(`${v.id}: te weinig rijen voor een typvraag`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    for (const r of verklap(v, a, f)) fouten.push(`${v.id} ${a}: ${r}`);
    for (const z of [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg, ...ZIN.weerGekozen(Number(a), v)]) {
      variantenTeller++;
      keurZin(`${v.id} ${a}`, z);
    }
    for (const z of ZIN.weerGekozen(Number(a), v)) if (!getallenIn(z).includes(Number(a))) fouten.push(`${v.id} ${a}: "weer gekozen" noemt het getal niet`);
  }
  /* De samen-zinnen kloppen (11.9): het nummer van het gat klinkt precies 1 keer, na "En dan" of "En daarna". */
  for (const z of ZIN.samenGat(v)) {
    if (!/^En (dan|dan komt|daarna) \d+[.!]/.test(kaal(z)) || getallenIn(z).filter((n) => n === v.goed).length !== 1 || getallenIn(z).length !== 1) fouten.push(`${v.id}: samenGat klopt niet ("${kaal(z)}")`);
  }
  for (const z of [...ZIN.samenStap(v), ...ZIN.samenHand(v), ...ZIN.samenKlaar(v), ...ZIN.samenZelf(v)]) if (getallenIn(z).some((n) => n !== v.goed)) fouten.push(`${v.id}: een samen-zin noemt een ander getal ("${kaal(z)}")`);
  /* Na het vangnet geen "Ja" alsof het kind het deed (keuring Meer-minder, 10 nov). */
  for (const z of ZIN.samenZelf(v)) if (/^(Ja|Precies|Samen)/.test(z)) fouten.push(`${v.id}: samenZelf klinkt alsof het kind het deed ("${kaal(z)}")`);
  const mag = [v.goed, v.goed - 1, v.goed + 1, 1];
  if (!huisReactie(v).zinnen.every((z) => getallenIn(z).every((n) => mag.includes(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
  if (!huisReactie(v).zinnen.every((z) => getallenIn(z).includes(v.goed) || /steeds 1/.test(z))) fouten.push(`${v.id}: een reactie bij goed noemt het nummer niet`);
  /* De opdrachtzinnen zelf (15.36, 15.37): een vraag of een opdracht, kort, en de nieuwe poging in andere woorden. */
  const vraagZin = ZIN.vraag(v).join(" ");
  const opdrachten: [string, string[]][] = [["vraag", [vraagZin]], ["opnieuw", ZIN.opnieuw(v)], ["samenStap", ZIN.samenStap(v)], ["samenHand", ZIN.samenHand(v)], ["sleepHand", ZIN.sleepHand]];
  for (const [naam, lijst] of opdrachten)
    for (const z of lijst) {
      keurZin(`${v.id} ${naam}`, z);
      if (!/\?/.test(z) && !/(^|[.!?:] )(Tik|Sleep|Typ|Pak|Kies)\b/.test(kaal(z))) fouten.push(`${v.id} ${naam}: geen vraag en geen opdracht ("${kaal(z)}")`);
    }
  for (const z of ZIN.opnieuw(v)) if (kaal(z) === kaal(vraagZin) || kaal(z) === kaal(ZIN.vraag(v)[0])) fouten.push(`${v.id}: de nieuwe poging is dezelfde zin als de vraag`);
  if (ZIN.opnieuw(v).filter((z) => !getallenIn(z).length).length < 2) fouten.push(`${v.id}: minder dan 2 versies van de nieuwe poging zonder getal`);
  for (const z of hintsVan(v)) if (/huis \d|Begin bij/.test(kaal(z)) !== hintNoemtHuis(z) && !/huis (links|rechts)/.test(z)) fouten.push(`${v.id}: het rondje past niet bij de hint ("${kaal(z)}")`);
  for (const lijst of [ZIN.samenBegin(v), ZIN.samenGat(v), ZIN.samenKlaar(v), ZIN.aanloop(v)]) for (const z of lijst) keurZin(`${v.id} verloop`, z);
}
/* Genoeg varianten van de vaste zinnen van het verloop. */
const AANTAL: [string, readonly string[], number][] = [
  ["begin", ZIN.begin, 2], ["samen", ZIN.samen, 5], ["sleepHand", ZIN.sleepHand, 3], ["slot", ZIN.slot, 3], ["kaartTik", ZIN.kaartTik, 3], ["opnieuwBegin", OPNIEUW_BEGIN, 4], ["aanmoediging", AANMOEDIG_TIKKEN, 5],
  ["terug lopen", ZIN.aanloop(VRAGEN[6]), 3], ["samenBegin verder", ZIN.samenBegin(VRAGEN[0]), 3], ["samenBegin terug", ZIN.samenBegin(VRAGEN[1]), 3], ["samenGat", ZIN.samenGat(VRAGEN[0]), 3], ["samenGat slepen", ZIN.samenGat(VRAGEN[4]), 3],
  ["samenStap", ZIN.samenStap(VRAGEN[0]), 3], ["samenStap slepen", ZIN.samenStap(VRAGEN[4]), 2], ["samenKlaar", ZIN.samenKlaar(VRAGEN[0]), 3], ["samenZelf", ZIN.samenZelf(VRAGEN[0]), 2], ["weerGekozen", ZIN.weerGekozen(9, VRAGEN[0]), 3],
];
for (const [naam, lijst, n] of AANTAL) {
  if (lijst.length < n) fouten.push(`${naam}: ${lijst.length} varianten, ${n} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${naam}: 2 varianten zijn dezelfde zin`);
  for (const z of lijst) keurZin(naam, z);
}
for (const z of [...ZIN.blok, ZIN.typEerst]) keurZin("verloop", z);

/*
  3. Waarheidscontrole (keuring 10 nov): bij typen kan het kind elk nummer typen. Voor elk nummer van 0 tot 99 moet wat
  Bliepo zegt WAAR zijn bij deze straat (eerder: "De nummers hier beginnen met een 2" bij 30, 31; "het vraagteken staat
  midden in de straat" terwijl het aan het eind stond).
*/
let waarheid = 0;
for (const v of VRAGEN) {
  const g = gat(v);
  const midden = g > 0 && g < v.huizen.length - 1;
  const bekend = nummers(v);
  const xs = isTyp(v) ? Array.from({ length: 100 }, (_, i) => i) : keuzesVan(v);
  for (const x of xs) {
    if (x === v.goed) continue;
    const f = foutenVan(v)[String(x)] ?? huisFoutVoor(x, v);
    waarheid++;
    for (const zin of [...f.v.eerste, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg]) {
    const tekst = kaal(zin);
    const mis = (r: string) => fouten.push(`${v.id} ${x}: niet waar: ${r} ("${tekst}")`);
    if (!midden && /midden in de straat|aan het (begin|eind) van de straat/.test(tekst)) mis("het gat staat niet midden in de straat");
    for (const m of tekst.matchAll(/(?:beginnen met een|steeds een|begint elk nummer met een|Dat is hier een|zoeken, begint met een) (\d)\b/g)) {
      const t = Number(m[1]);
      if (/zoeken, begint|Dat is hier een/.test(m[0])) {
        if (t !== Math.floor(v.goed / 10)) mis("tiental van het antwoord");
        continue;
      }
      const ernaast = /huizen ernaast|buren/.test(tekst) ? [v.huizen[g - 1], v.huizen[g + 1]].filter((h): h is number => typeof h === "number") : bekend;
      if (!ernaast.every((n) => Math.floor(n / 10) === t)) mis(`niet alle nummers beginnen met een ${t}`);
    }
    for (const m of tekst.matchAll(/(Na|Voor) (\d+) komt een (groter|kleiner) nummer/g)) {
      const goedBuur = (m[1] === "Na" ? v.goed - 1 : v.goed + 1) === Number(m[2]);
      const goedKant = m[3] === "groter" ? v.goed > x : v.goed < x;
      if (!goedBuur || !goedKant) mis(m[0]);
    }
    for (const m of tekst.matchAll(/(\d+) komt (voor|na) (\d+)/g)) if (m[2] === "voor" ? +m[1] >= +m[3] : +m[1] <= +m[3]) mis(m[0]);
    for (const m of tekst.matchAll(/komt (al voor|pas na) (\d+)/g)) if (m[1] === "al voor" ? x >= +m[2] : x <= +m[2]) mis(m[0]);
    if (/te klein/.test(tekst) && x > v.goed) mis("te klein");
    if (/te groot/.test(tekst) && x < v.goed) mis("te groot");
    if (/te ver|sla je een huis over|overgeslagen/.test(tekst) && (vooruit(v) ? x < v.goed : x > v.goed)) mis("te ver");
    if (/staat (er )?(ook )?al|is er al|zie je al/.test(tekst) && !/nog niet/.test(tekst) && !bekend.includes(x)) mis("staat er al");
    if (/Zo tel je verder|verder geteld|verder tellen\./.test(tekst) && x < v.goed) mis("verder tellen");
    if (/Zo tel je terug|weer terug tellen/.test(tekst) && x > v.goed) mis("terug tellen");
    if (/begin van het nummer|cijfer achter|nog niet af/.test(tekst) && x !== Math.floor(v.goed / 10)) mis("begin van het nummer");
    if (/(Je (koos|typte)|Je sleepte huis) (\d+)\./.test(tekst) && Number(tekst.match(/(?:Je (?:koos|typte)|Je sleepte huis) (\d+)\./)![1]) !== x) mis("wat het kind koos");
    if ((/Je koos/.test(tekst) && (isTyp(v) || v.soort === "sleep")) || (/Je typte/.test(tekst) && !isTyp(v)) || (/sleepte/.test(tekst) && v.soort !== "sleep")) mis("koos, typte of sleepte");
    }
  }
}

/*
  4. De kiezer naspelen (18 nov 2026): 20.000 vragen met willekeurige antwoorden die niet goed zijn, met precies de keuze
  van de les (`foutStuk`, `opnieuwZin`). Nooit 2 keer achter elkaar dezelfde zin binnen 1 situatie; de 2e keer nooit
  dezelfde eerste zin als de 1e keer; geen getal 2 keer in 1 stuk, en de nieuwe poging herhaalt geen getal uit de hint.
*/
{
  let zaad = 12345;
  const toeval = () => ((zaad = (zaad * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const K = maakKiezer({ toeval });
  const vorige = new Map<string, string>();
  let dubbel = 0;
  let getalDubbel = 0;
  let zelfdeEerste = 0;
  const voorbeelden: string[] = [];
  const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = K.kies(sleutel, zinnen, mag);
    if (vorige.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) {
      dubbel++;
      if (voorbeelden.length < 5) voorbeelden.push(`${sleutel}: 2 keer "${kaal(z)}"`);
    }
    vorige.set(sleutel, vorm(z));
    return z;
  };
  const ond = ["Die is lastig, hè.", "We zoeken het samen.", "Ik help je een stukje.", "Kom, we kijken samen."];
  let ondNr = 0;
  const pak = <T,>(l: T[]) => l[Math.floor(toeval() * l.length)];
  for (let i = 0; i < 20000; i++) {
    const v = pak(VRAGEN);
    const tabel = foutenVan(v);
    const kandidaten = isTyp(v) ? [...Object.keys(tabel).map(Number), ...Array.from({ length: 6 }, () => Math.floor(toeval() * 60))].filter((n) => n !== v.goed) : Object.keys(tabel).map(Number);
    const x1 = pak(kandidaten);
    const f1 = tabel[String(x1)] ?? huisFoutVoor(x1, v);
    const o = (x: number, zelfde: boolean) => ({ x, zelfdeAntwoord: zelfde, onduidelijk: () => ond[ondNr++ % ond.length] });
    const s1 = foutStuk(variant, f1, v, 1, null, o(x1, false));
    if (deeltGetal(s1[0], s1[1])) { getalDubbel++; if (voorbeelden.length < 5) voorbeelden.push(`getal 2 keer: "${kaal(s1.join(" "))}"`); }
    const op = opnieuwZin(variant, v, s1);
    if (s1.some((z) => deeltGetal(z, op))) { getalDubbel++; if (voorbeelden.length < 5) voorbeelden.push(`getal 2 keer: "${kaal(s1.join(" "))}" → "${kaal(op)}"`); }
    if (toeval() < 0.3) continue; /* de 2e keer goed */
    const x2 = toeval() < 0.4 ? x1 : pak(kandidaten);
    const f2 = tabel[String(x2)] ?? huisFoutVoor(x2, v);
    const s2 = foutStuk(variant, f2, v, 2, f1, o(x2, x2 === x1));
    if (s2.length > 1 && deeltGetal(s2[0], s2[1])) { getalDubbel++; if (voorbeelden.length < 5) voorbeelden.push(`getal 2 keer: "${kaal(s2.join(" "))}"`); }
    if (vorm(s2[0]) === vorm(s1[0])) { zelfdeEerste++; if (voorbeelden.length < 5) voorbeelden.push(`1e en 2e keer dezelfde eerste zin: "${kaal(s2[0])}"`); }
    variant("samen", ZIN.samen);
    variant("samenBegin", ZIN.samenBegin(v));
    variant("samenGat", ZIN.samenGat(v));
    variant("samenStap", ZIN.samenStap(v));
    variant("samenKlaar", ZIN.samenKlaar(v));
  }
  if (dubbel || getalDubbel || zelfdeEerste) fouten.push(`kiezer nagespeeld: ${dubbel} keer 2 keer achter elkaar dezelfde zin, ${getalDubbel} keer een getal 2 keer vlak achter elkaar, ${zelfdeEerste} keer dezelfde eerste zin bij de 1e en 2e keer\n  ${voorbeelden.join("\n  ")}`);
  else console.log("Kiezer 20.000 keer nagespeeld: 0 keer 2 keer achter elkaar dezelfde zin, 0 keer een getal 2 keer vlak achter elkaar.");
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden in de tabel, ${variantenTeller} varianten gekeurd, ${waarheid} nummers op waarheid gecontroleerd).`);

/* 3. De tabel. */
const straat = (v: Vraag) => v.huizen.map((h) => (h === null ? "_" : h)).join(" ");
const soortNaam = { na: "erna", voor: "ervoor", tussen: "ertussen", sleep: "slepen", terug: "terugtellen" } as const;
const vraagNaam = (v: Vraag) => `${v.nr}. ${soortNaam[v.soort]}: ${straat(v)} → ${v.goed} (${v.opties ? `keuzes ${v.opties.join(" / ")}` : v.losse ? `huizen ${v.losse.join(" / ")}` : "typen"})`;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} | ${f.eigen ? "**eigen invulling, niet van Synthesis**" : "Synthesis"} — ${f.bron} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) => {
  const g = gat(v);
  const idx = v.huizen.map((_, i) => i).filter((i) => (vooruit(v) ? i < g : i > g));
  const reeks = (vooruit(v) ? idx : idx.reverse()).map((i) => v.huizen[i]).join(", ");
  return `${ZIN.samen[0]} ${ZIN.samenBegin(v)[0]} ${reeks} — ${kaal(ZIN.samenGat(v)[0])} — ${kaal(ZIN.samenStap(v)[0])} — ${kaal(ZIN.samenKlaar(v)[0])}`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");
const hints = VRAGEN.map((v) => `| ${v.nr} | ${soortNaam[v.soort]} | ${hintsVan(v).map(kaal).join(" / ")} | ${v.huizen[v.huizen.indexOf(buur(v))]} |`).join("\n");

/* Alle varianten: per denkfout 1 voorbeeld (het eerste foute antwoord in de les met die denkfout), en de vaste zinnen. */
const lijst = (l: readonly string[]) => (l.length ? l.map(kaal).join(" / ") : "—");
const gezien = new Set<string>();
const variantRijen: string[] = [];
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const sleutel = `${f.code}|${f.soort}|${f.noot ? "noot" : ""}|${v.soort === "sleep" ? "sleep" : isTyp(v) ? "typ" : "kies"}|${vooruit(v)}`;
    if (gezien.has(sleutel) || f.code === "onduidelijk") continue;
    gezien.add(sleutel);
    variantRijen.push(`| \`${f.code}\`${f.noot ? " (wat er mis is niet genoemd)" : ""} — vraag ${v.nr}, antwoord ${a} | ${lijst(f.v.eerste)} | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} | ${lijst(f.v.weerUitleg)} | ${lijst(ZIN.weerGekozen(Number(a), v))} |`);
  }
const V1 = VRAGEN[0];
const VS = VRAGEN[4];
const VT = VRAGEN[6];
const vast: [string, readonly string[]][] = [
  ["Begin van de les (na de groet)", ZIN.begin],
  ["Nieuw blok met grotere nummers", ZIN.blok.filter(Boolean)],
  ["Voor de vraag: ertussen / slepen (1 keer per les)", [...ZIN.aanloop(VRAGEN[2]), ...ZIN.aanloop(VS)]],
  ["Voor de vraag: terugtellen (elke keer)", ZIN.aanloop(VT)],
  ["Begin van een nieuwe poging", OPNIEUW_BEGIN],
  ["Nieuwe poging: erna (kiezen)", ZIN.opnieuw(V1)],
  ["Nieuwe poging: ervoor en terugtellen (kiezen)", ZIN.opnieuw(VRAGEN[1])],
  ["Nieuwe poging: ertussen", ZIN.opnieuw(VRAGEN[2])],
  ["Nieuwe poging: typen", [...ZIN.opnieuw(VRAGEN[3]), ZIN.opnieuw(VRAGEN[10])[0]]],
  ["Nieuwe poging: slepen", ZIN.opnieuw(VS)],
  ["2e keer: samen tellen", ZIN.samen],
  ["Bliepo telt: verder", ZIN.samenBegin(V1)],
  ["Bliepo telt: terug", ZIN.samenBegin(VT)],
  ["Bij het vraagteken (erna)", ZIN.samenGat(V1)],
  ["Bij het vraagteken (ervoor, terugtellen)", ZIN.samenGat(VT)],
  ["Bij het vraagteken (ertussen)", ZIN.samenGat(VRAGEN[2])],
  ["Bij de lege plek (slepen)", ZIN.samenGat(VS)],
  ["De kleine stap: tikken", ZIN.samenStap(V1)],
  ["De kleine stap: slepen", ZIN.samenStap(VS)],
  ["Hulphandje bij de kleine stap", [...ZIN.samenHand(V1), ...ZIN.samenHand(VS)]],
  ["Klaar met samen tellen: tikken", ZIN.samenKlaar(V1)],
  ["Klaar met samen tellen: slepen", ZIN.samenKlaar(VS)],
  ["Bliepo deed de stap zelf (vangnet)", [...ZIN.samenZelf(V1), ...ZIN.samenZelf(VS)]],
  ["Hulphandje bij slepen: aanmoediging", AANMOEDIG_TIKKEN],
  ["Hulphandje bij slepen: wat te doen", ZIN.sleepHand],
  ["Zin met het nummer na lof (erna)", huisReactie(V1).zinnen],
  ["Slot", ZIN.slot],
  ["Bij de kaart", ZIN.kaartTik],
];
const vastRijen = vast.map(([naam, l]) => `| ${naam} | ${l.length} | ${lijst(l)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Huisnummers (squla-huisnummers-gouden, "Huisnummers: wat komt erna?")

Gemaakt op 10 november 2026, bijgewerkt op 18 november 2026 (warme zinnen in varianten, §5 en §6) **uit de code** met \`npx tsx scripts/fouttabel-huisnummers-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-huisnummers-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (17 vragen, getallen, keuzes) is die van squla-huisnummers en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Huisnummers (Counting On), §3 A.2 en C.2 (een andere zin per soort fout: vlak ernaast, 10 ernaast, te ver, verkeerde rij), §3 C.5 en D.3 (de 2e fout: Bliepo telt zelf, 1 stap per keer) en §7 (denkfouten). Synthesis noemt bij verder tellen alleen wat zeker is ("je ging een beetje te ver"); Bliepo ook (BOUWREGELS 15.9).

**Eigen invulling, niet van Synthesis (15.22 punt 5):** Counting On heeft alleen "erna" (verder tellen) en over het tiental. **Ervoor, ertussen, slepen en terugtellen** zitten er niet in (draaiboek §8 en §11). Die vragen hebben hetzelfde skelet (vraag met het beeld, 1e fout zin + hint + vraag in andere woorden, 2e fout samen tellen), maar hun eerste zinnen en hints zijn eigen invulling; de laatste kolom zegt het per rij.

Huisnummers staan wit op een donker bordje; in de les zijn de getallen in Bliepo's zinnen dus wit (2.2). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen gaan weg (bij typen wordt het vak leeg; bij slepen glijdt het huis terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om het buurhuis dat hij noemt (nooit om het antwoord). Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw.
- **Verklappen (15.17):** de eerste zin zegt alleen iets over het gekozen nummer; er blijven altijd 2 keuzes over. Bliepo noemt nooit 2 buren tegelijk ("tussen 15 en 17" zou 16 verklappen). Zou de eerste zin toch maar 1 keuze overlaten, dan zegt hij alleen "Huis 37 past niet op deze plek." Het script rekent dat per fout antwoord na.
- **2e fout:** een korte uitleg bij de denkfout, "Kom, we tellen samen." (5 varianten) en dan telt Bliepo langs de huizen (elk huis krijgt even het rondje, hij zegt het nummer). Bij het gat komt het nummer op het bordje. Dan de kleine stap: het kind tikt het huis met het nieuwe nummer aan, of sleept het goede huis naar de lege plek (het hulphandje komt vanzelf na ± 6 s). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde getal 2 keer:** de eerste zin wordt "Je koos weer …" ("Je typte weer …", "Je sleepte weer huis …"; 3 varianten).
- **Varianten (18 november 2026):** elke zin die terugkomt heeft een rijtje versies (§5 en §6). De les kiest met de gedeelde kiezer: nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen ("Je koos 9." en "Je koos 27." tellen als dezelfde zin). In de tabellen van §3 en §4 staat steeds de eerste versie. Een getal klinkt nooit 2 keer in 1 stuk: noemt de eerste zin een getal, dan kiest de les een hint zonder dat getal, en de nieuwe poging herhaalt geen getal uit de hint.
- **Niet duidelijk (\`onduidelijk\`):** bij typen, voor elk getal dat niet in de tabel staat: een zin uit BLIEPO-KARAKTER.md §10 en de hint. Geen reden verzonnen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`staat-al\` | koos een nummer dat al in de straat staat | eigen invulling (wat zeker is) |
| \`een-te-veel\` | telde 2 verder of 2 terug (sloeg een huis over) | draaiboek §7 \`een-te-veel\` ("je ging een beetje te ver") |
| \`verkeerde-richting\` | telde verder in plaats van terug | eigen invulling (terugtellen zit niet in Counting On) |
| \`buiten-de-rij\` | koos een nummer van voor of na de straat | eigen invulling (ertussen en slepen zitten niet in Counting On) |
| \`cijfers-omgedraaid\` | de cijfers andersom (42 voor 24) | draaiboek §7 (gezien bij zoeken; Synthesis zei er niets over) |
| \`tien-ernaast\` | zit er 10 naast (38 voor 28) | draaiboek §7 ("je zit er 10 onder") |
| \`verkeerde-rij\` | na 39 terug naar 30, of het verkeerde tiental (39 voor 29) | draaiboek §7 \`verkeerde-rij\` en tiental-hulp |
| \`alleen-tientalcijfer\` | typte alleen het eerste cijfer (2 voor 20) | draaiboek §7 (gezien bij zoeken) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De hint per vraag (het buurhuis krijgt een rood rondje)

| Vraag | Soort | Hints (de les kiest er 1, steeds een andere; geen enkele eindigt met een vraag) | Rondje om huis (alleen als de hint dat huis noemt) |
|---|---|---|---|
${hints}

## 3. De fouttabel: per vraag elk fout antwoord (${telling} rijen; bij typen de meest voorkomende)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm | Bron |
|---|---|---|---|---|---|---|
${rijen}

## 4. De 2e fout: uitleg, anders uitleggen en samen tellen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen tellen (Bliepo telt, het kind doet de laatste stap) |
|---|---|---|---|---|
${uitleg}

## 5. Alle varianten per denkfout (1 voorbeeld per denkfout; het script keurt ze bij elk antwoord)

| Denkfout — voorbeeld | Eerste zin | Uitleg (2e keer) | "Weer" (2 keer dezelfde denkfout) | Uitleg bij "weer" | Hetzelfde antwoord 2 keer |
|---|---|---|---|---|---|
${variantRijen.join("\n")}

## 6. Alle varianten van de vaste zinnen

| Situatie | Aantal | Zinnen |
|---|---|---|
${vastRijen}
`;
writeFileSync(new URL("../FOUTTABEL-squla-huisnummers-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-huisnummers-gouden.md geschreven.");
