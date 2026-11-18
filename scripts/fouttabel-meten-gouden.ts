/**
 * Maakt FOUTTABEL-squla-meten-oppervlakte-1-gouden.md uit de code (squla-meten-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd bij
 * Tellen, Huisnummers en Getallenlijn").
 *   npx tsx scripts/fouttabel-meten-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel antwoorden er na de eerste zin + de hint
 * logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de zin het antwoord en stopt het script (behalve bij
 * een vraag met 2 keuzes: daar is dat altijd zo, met een noot). Bij typen kijkt het script of het goede getal niet in de
 * eerste zin of hint staat. Bij op volgorde: geen zin noemt de hele goede volgorde.
 * Waarheidscontrole (keuring Huisnummers): wat Bliepo zegt moet WAAR zijn voor ELK antwoord dat een kind kan geven: bij
 * typen elk getal van 0 tot 99, bij op volgorde elke volgorde, bij kies er 2 elk paar.
 * Uitleg bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): geen zin die begint met Tel, Tik, Kijk, Zoek,
 * Begin, Sleep of Leg.
 *
 * STRENGER sinds 18 november 2026 (Bliepo als warme juf, zoals de proefles Tellen): het script loopt ALLE varianten na,
 * niet alleen 1 vaste zin per rij: verklappen (ook "dichtbij" en "bijna"), waarheid, geen "fout", geen getal 2 keer in 1
 * zin, elke reactie past in het tekstvak, na elke hint komt een vraag of opdracht (15.37, F16), en de kiezer wordt 20.000
 * keer nagespeeld: nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen.
 */
import { writeFileSync } from "node:fs";
import {
  AANMOEDIG_TIKKEN,
  MAAT,
  MAX_HINT,
  MAX_UITLEG,
  ONDUIDELIJK,
  RESERVE,
  TEGELS,
  VRAGEN,
  WISSEL,
  ZIN,
  foutReactie,
  foutenVan,
  lengte,
  metenFout,
  metenReactie,
  naamVan,
  nieuweKiezer,
  paren,
  typFout,
  volgordes,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-meten-gouden-zinnen";
import { maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30, 15.21): 12 vragen zoals squla-meten-oppervlakte-1, in dezelfde volgorde. */
const OUD: [string, string, string][] = [
  ["twee", "muur|v=1", "huis,zon"],
  ["twee", "muur|v=2", "boot,planeet"],
  ["orden", "", "a,b,c,d"],
  ["orden", "", "2,4,6"],
  ["kies", "vellen|draai=1", "Ze zijn even groot."],
  ["twee", "ruitjes|a=2x4|b=1x8", "even,tel"],
  ["kies", "matten|a=2x2|b=1x4", "Ze zijn even groot."],
  ["kies", "matten|a=2x5|b=1x10", "Ze zijn even groot."],
  ["typ", "tafel|k=5|r=2|kl=groen", "10"],
  ["typ", "tafel|k=3|r=3|kl=blauw", "9"],
  ["typ", "tafel|k=4|r=3|kl=oranje", "12"],
  ["orden", "", "3,5,7"],
];
if (VRAGEN.length !== 12) fouten.push(`${VRAGEN.length} vragen in plaats van 12 (squla-meten-oppervlakte-1; daarna komen er 3 terug: samen 15)`);
VRAGEN.forEach((v, i) => {
  const [soort, beeld, goed] = OUD[i];
  if (v.soort !== soort || v.beeld !== beeld || v.goed !== goed) fouten.push(`${v.id}: wijkt af van de oude les`);
  if (v.soort === "typ" && v.k! * v.r! !== Number(v.goed)) fouten.push(`${v.id}: ${v.k} × ${v.r} is niet ${v.goed}`);
  if (v.soort === "kies" && v.opties!.filter((o) => o === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (v.soort === "twee" && paren(v).filter((p) => p === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed paar`);
  if (v.soort === "orden" && v.juist!.some((id, j) => j > 0 && MAAT[v.juist![j - 1]] >= MAAT[id])) fouten.push(`${v.id}: de goede volgorde loopt niet op`);
  if (v.thema === "schilderij") {
    const kl = v.kaarten!.filter((k) => k.label === "kleinst").map((k) => TEGELS[k.id]);
    const gr = v.kaarten!.filter((k) => k.label === "grootst").map((k) => TEGELS[k.id]);
    const goedKl = v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!;
    if (TEGELS[goedKl.id] !== Math.min(...kl) || Math.max(...gr) !== Math.max(...v.kaarten!.map((k) => TEGELS[k.id]))) fouten.push(`${v.id}: de tegels kloppen niet met kleinst/grootst`);
  }
});
/* De tegels achter de schilderijen (MUREN in squla-meten-tekeningen.ts: zon 3×3, bloem 4×4, huis 4×5, boot 3×2, boom 2×6, planeet 5×4). */
const MUUR = { zon: 9, bloem: 16, huis: 20, boot: 6, boom: 12, planeet: 20 } as Record<string, number>;
for (const [k, n] of Object.entries(MUUR)) if (TEGELS[k] !== n) fouten.push(`TEGELS ${k}: ${TEGELS[k]} in plaats van ${n}`);

/* 2. Fouttabel compleet en verklapcontrole: ELKE variant (18 november 2026). */
const OPDRACHT = /(^|[.!?:] )(Tel|Tik|Kijk|Zoek|Begin|Sleep|Leg|Pak|Draai|Typ|Kies|Zet)\b/;
/** Een vraag of opdracht die zegt wat het kind doet (15.37): een vraagteken, of een gebiedende wijs. "Kijk …" en "Probeer het nog eens." alleen tellen niet. */
const DOE = /\?|(^|[.!?:] )(Tel|Tik|Zoek|Begin|Sleep|Leg|Pak|Typ|Kies|Zet)\b/;
const vorm = maakVorm(WISSEL);
const stukken = (z: string) => kaal(z).split(/(?<=[.!?])\s+/).filter(Boolean);
/** Staat er in 1 zin 2 keer hetzelfde getal? */
const getalDubbel = (z: string) => stukken(z).find((s) => { const g = getallenIn(s); return new Set(g).size !== g.length; });
const alleAntwoorden = (v: Vraag) => (v.soort === "typ" ? Array.from({ length: 100 }, (_, i) => String(i)) : v.soort === "twee" ? paren(v) : v.soort === "orden" ? volgordes(v) : v.opties!).filter((x) => x !== v.goed);
const foutVan = (x: string, v: Vraag) => (v.soort === "typ" ? typFout(Number(x), v) : metenFout(x, v));
const DICHTBIJ = /dichtbij|vlak naast|bijna|net niet|scheelt/i;
const RICHTING = /te veel|te weinig|\bmeer\b|\bminder\b|\berbij\b|\beraf\b|hoger|lager/i;

const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  const onduidelijk = f.code === "onduidelijk";
  if (!onduidelijk && !f.v.eerste.length) return "geen eerste zin";
  if (!f.v.hint.length) return "geen hint";
  if (!f.v.uitleg.length) return "geen uitleg";
  const metWeer = !f.noot && !onduidelijk;
  if (metWeer && (f.v.weerEerste.length < 2 || f.v.weerUitleg.length < 2)) return "minder dan 2 varianten voor 'weer'";
  const lijsten: [string, string[]][] = [["eerste zin", f.v.eerste], ["hint", f.v.hint], ["uitleg", f.v.uitleg], ["weer", f.v.weerEerste], ["weer-uitleg", f.v.weerUitleg]];
  for (const [naam, lijst] of lijsten) {
    if (!lijst.length) continue;
    /* Bij vaste keuzes die niet voorkomen (vangnet "onduidelijk" bij kiezen) is 1 zin genoeg; overal elders minstens 2. */
    if (lijst.length < 2 && !(onduidelijk && v.soort !== "typ")) return `${naam}: maar ${lijst.length} variant`;
    if (new Set(lijst.map(vorm)).size !== lijst.length) return `${naam}: 2 varianten zijn dezelfde zin`;
    for (const z of lijst) {
      if (/\bfout\b/i.test(z)) return `${naam}: het woord "fout" in "${kaal(z)}"`;
      if (getalDubbel(z)) return `${naam}: een getal staat 2 keer in 1 zin: "${kaal(z)}"`;
      if (/tussen \d+ en \d+/.test(kaal(z))) return `${naam}: "${kaal(z)}" noemt 2 buren`;
      if (/\b1 te (veel|weinig)\b/.test(kaal(z))) return `${naam}: "${kaal(z)}" zegt de richting (1 te veel of 1 te weinig)`;
      /* Typen: geen enkele variant noemt het antwoord (het komt pas bij het samen tellen in beeld). */
      if (v.soort === "typ" && getallenIn(z).includes(Number(v.goed))) return `${naam}: "${kaal(z)}" noemt het antwoord ${v.goed}`;
    }
  }
  /* De uitleg bij de 2e keer is uitleg, geen opdracht (daarna doet Bliepo het samen voor). */
  for (const z of [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg]) if (OPDRACHT.test(kaal(z))) return `de uitleg bij de 2e keer is een opdracht ("${kaal(z)}")`;
  const eersteEnHint = [...f.v.eerste, ...f.v.hint].map(kaal);
  if (v.soort === "typ") {
    /* "Dichtbij" en "bijna" alleen als het er 1 naast zit, en dan zonder richting; er blijven dan 2 getallen over (15.17). */
    const naast = Math.abs(Number(a) - Number(v.goed)) === 1;
    for (const z of eersteEnHint) {
      if (DICHTBIJ.test(z) && !naast) return `"${z}" zegt dichtbij, maar ${a} is niet 1 naast ${v.goed}`;
      if (f.code === "een-ernaast" && RICHTING.test(z)) return `"${z}" geeft een richting (dan is het antwoord verklapt)`;
    }
    if (f.code === "een-ernaast" && Number(a) - 1 < 0) return "na 'dichtbij' blijft maar 1 getal over";
    return null;
  }
  if (v.soort === "orden") {
    for (const z of eersteEnHint) {
      if (z.includes(v.juist!.map((id) => naamVan(v, id)).join(", "))) return "de hele volgorde staat in de zin";
      if (/\btussen\b/i.test(z)) return `"${z}" zegt wat ertussen hoort (bij 3 plaatjes is dat het antwoord)`;
    }
    return null;
  }
  if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  if (f.over.length <= 1 && !f.noot) return `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over`;
  if (v.soort === "twee") {
    /* "1 van je 2 kaartjes klopt": geen enkele eerste zin of hint zegt welk kaartje (geen naam, geen 'kleinste', geen 'even groot'). */
    const eenKlopt = f.code === "verkeerde-kleinste" || f.code === "vorm-verandert-grootte";
    const namen = v.kaarten!.map((k) => k.naam.toLowerCase());
    if (eenKlopt) for (const z of eersteEnHint) if (namen.some((n) => z.toLowerCase().includes(n)) || /kleinste|kleinst\b|grootste|grootst\b|even groot/i.test(z)) return `"${z}" wijst 1 kaartje aan (dan blijft er maar 1 paar over)`;
  }
  if (v.thema === "matten") for (const z of eersteEnHint) if (/even groot|evenveel/i.test(z)) return `"${z}" zegt het antwoord`;
  return null;
};
let telling = 0;
let combinaties = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "twee" ? paren(v).length - 1 : v.soort === "orden" ? volgordes(v).length - 1 : v.soort === "kies" ? v.opties!.length - 1 : 4;
  if (v.soort === "typ" ? Object.keys(tabel).length < nodig : Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    if (v.soort !== "typ" && f.code === "onduidelijk") fouten.push(`${v.id} ${a}: bij vaste keuzes heeft elke rij een denkfout (geleerd bij Getallenlijn)`);
  }
  /* Elk antwoord dat een kind kan geven (typen: 0 tot 99), niet alleen de rijen van de tabel. */
  for (const a of alleAntwoorden(v)) {
    const f = foutVan(a, v);
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    /* De reactie past in het tekstvak (15.30): bij elke eerste zin is er een hint, en bij elke eerste zin van de 2e keer een uitleg, die past. */
    const eersten = f.v.eerste.length ? f.v.eerste : ONDUIDELIJK.zinnen;
    combinaties += eersten.length * f.v.hint.length;
    /* Minstens 2 die passen (bij het vangnet "onduidelijk" bij vaste keuzes 1): anders kan de kiezer niet wisselen. */
    const min = f.code === "onduidelijk" && v.soort !== "typ" ? 1 : 2;
    for (const e of eersten) if (f.v.hint.filter((h) => lengte(e, h) <= MAX_HINT).length < min) fouten.push(`${v.id} ${a}: te lang: minder dan ${min} hints passen bij "${kaal(e)}"`);
    for (const e of [...eersten, ...ZIN.weerGekozen(a, v), ...(f.code === "een-ernaast" ? ZIN.weerDichtbij : [])]) if (f.v.uitleg.filter((u) => lengte(e, u) <= MAX_UITLEG).length < min) fouten.push(`${v.id} ${a}: te lang: minder dan ${min} keer uitleg past bij "${kaal(e)}"`);
    for (const e of f.v.weerEerste) if (f.v.weerUitleg.filter((u) => lengte(e, u) <= MAX_UITLEG).length < 2) fouten.push(`${v.id} ${a}: te lang: minder dan 2 keer uitleg past bij "${kaal(e)}"`);
  }
  /* De reacties bij goed noemen alleen getallen die bij deze vraag horen. */
  const mag = new Set([Number(v.goed), v.k, v.r, v.stukken, 8, 2, ...Object.values(TEGELS)].filter((x): x is number => typeof x === "number"));
  if (!metenReactie(v).zinnen.every((z) => getallenIn(z).every((n) => mag.has(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
  for (const z of metenReactie(v).zinnen) if (getalDubbel(z)) fouten.push(`${v.id}: een getal staat 2 keer in de reactie "${kaal(z)}"`);
  if (new Set(metenReactie(v).zinnen.map(vorm)).size !== metenReactie(v).zinnen.length) fouten.push(`${v.id}: 2 reacties bij goed zijn dezelfde zin`);
}

/* 3. Waarheidscontrole: voor elk antwoord dat een kind kan geven, is ELKE variant van wat Bliepo zegt waar? */
let waarheid = 0;
for (const v of VRAGEN) {
  for (const x of alleAntwoorden(v)) {
    const f = foutVan(x, v);
    const alle = [...f.v.eerste, ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg].map(kaal);
    const eersten = [...f.v.eerste, ...f.v.weerEerste].map(kaal);
    for (const tekst of alle) {
      const mis = (r: string) => fouten.push(`${v.id} ${x}: niet waar: ${r} ("${tekst}")`);
      waarheid++;
      if (v.soort === "typ") {
        const n = v.k! * v.r!;
        const X = Number(x);
        if (/bovenste rij/.test(tekst) && X !== v.k) mis("niet de bovenste rij");
        if (/rij overgeslagen|sloeg weer een rij over|mis je nog een hele rij/.test(tekst) && X !== n - v.k!) mis("geen rij overgeslagen");
        if (DICHTBIJ.test(tekst) && Math.abs(X - n) !== 1) mis("niet dichtbij");
        const m = /Je (?:deed|telde) (\d+) en (\d+) bij elkaar/.exec(tekst);
        if (m && (+m[1] + +m[2] !== X || +m[1] !== v.k || +m[2] !== v.r)) mis("niet de rij en de rijen bij elkaar");
        /* "Je typte 9." en "9?" noemen het getal dat het kind typte. */
        const t = /^Je typte (\d+)\.|^(\d+)\?|^Bijna! (\d+) /.exec(tekst);
        if (t && Number(t[1] ?? t[2] ?? t[3]) !== X) mis("een ander getal dan het kind typte");
        if (/nog een rij onder|De rij eronder/.test(tekst) && v.r !== 2) mis("er ligt meer dan 1 rij onder");
        if (/meer rijen onder|De rijen eronder/.test(tekst) && v.r! < 3) mis("er ligt maar 1 rij onder");
      }
      if (v.soort === "orden") {
        const xx = x.split(",");
        const dalend = xx.every((id, i) => i === 0 || MAAT[xx[i - 1]] > MAAT[id]);
        if (eersten.includes(tekst) && /van (groot naar klein|breed naar smal)|Je begon met (de grootste|het breedste)/.test(tekst) && !dalend) mis("niet van groot naar klein");
        if (eersten.includes(tekst) && /ligt nog niet|lag weer niet|Je begon niet met/.test(tekst) && xx[0] === v.juist![0]) mis("vooraan ligt wel de kleinste");
        const na = /^(?:Na|Achter) (.+?) (?:legde je|ligt|komt nu) (.+?)\.$/.exec(tekst);
        if (na) {
          const a = v.losse!.find((k) => k.naam === na[1]);
          const pa = a ? xx.indexOf(a.id) : -1;
          if (pa < 0 || pa === xx.length - 1) mis(`"${na[1]}" ligt niet vóór een ander plaatje`);
          else {
            const b = xx[pa + 1];
            if (/kleinere tafel|smaller muurtje/.test(na[2])) {
              if (MAAT[b] >= MAAT[xx[pa]]) mis("het plaatje erna is niet kleiner");
            } else if (naamVan(v, b) !== na[2]) mis(`na "${na[1]}" ligt niet "${na[2]}"`);
            if (xx.slice(0, pa + 1).some((id, i) => id !== v.juist![i])) mis("vóór die plek lag al iets op de verkeerde plek (de zin wijst dan niet de eerste fout aan)");
          }
        }
        if (/2 tafels/.test(tekst) && (v.thema !== "tafels" || x !== "a,b,d,c")) mis("niet de 2 tafels met 6 borden omgedraaid");
        if (/muurtje/.test(tekst) && v.thema === "tafels") mis("een muurtje bij de tafels");
        if (/\btafel/.test(tekst) && v.thema !== "tafels") mis("een tafel bij de muurtjes");
      }
      if (v.soort === "twee") {
        const ids = x.split(",");
        const labels = ids.map((id) => v.kaarten!.find((k) => k.id === id)!.label);
        if (eersten.includes(tekst) && /'het kleinst'|'kleinst'/.test(tekst) && !labels.every((l) => l === "kleinst")) mis("niet 2 keer 'het kleinst'");
        if (/^(Bijna! )?1 (van|kaartje)/.test(tekst) && ids.filter((id) => v.goed.split(",").includes(id)).length !== 1) mis("niet precies 1 van de 2 klopt");
        if (/'even groot' én (op )?'niet even groot'/.test(tekst) && !(ids.includes("even") && ids.includes("niet"))) mis("niet allebei gekozen");
        if (/weer 'niet even groot'/i.test(tekst) && !ids.includes("niet")) mis("niet 'niet even groot' gekozen");
      }
      if (v.thema === "matten") {
        const [a, b] = /a=(\d+)x(\d+)\|b=(\d+)x(\d+)/.exec(v.beeld)!.slice(1).map(Number).reduce<[number[], number[]]>((acc, n, i) => (acc[i < 2 ? 0 : 1].push(n), acc), [[], []]);
        if (/hoger/i.test(tekst) && !(x === "Mat 1 is groter." && a[0] > b[0])) mis("mat 1 is niet hoger (of niet gekozen)");
        if (/langer/i.test(tekst) && !(x === "Mat 2 is groter." && b[1] > a[1])) mis("mat 2 is niet langer (of niet gekozen)");
        if (/mat 1/i.test(tekst) && x !== "Mat 1 is groter.") mis("mat 1 niet gekozen");
        if (/mat 2/i.test(tekst) && x !== "Mat 2 is groter.") mis("mat 2 niet gekozen");
        if (a[0] * a[1] !== b[0] * b[1] || a[0] * a[1] !== v.stukken) mis("de matten zijn niet even groot");
      }
    }
  }
}

/* 4. De vaste zinnen: genoeg varianten, geen 2 dezelfde, geen "fout", geen getal 2 keer in 1 zin, en het kind weet wat het doet (15.37). */
const v1 = (soort: Vraag["thema"]) => VRAGEN.find((v) => v.thema === soort)!;
/** [naam, varianten, minstens zoveel, moet een vraag of opdracht zijn] */
const VAST: [string, string[], number, boolean][] = [
  ["begin", ZIN.start, 2, false],
  ...(["schilderij", "ruitjes", "tafels", "muurtjes", "vellen", "matten", "tafel"] as const).map((t): [string, string[], number, boolean] => [`de vraag opnieuw na de hint (${t})`, ZIN.opnieuw(v1(t)), 2, true]),
  ["hulphandje: aanmoediging", AANMOEDIG_TIKKEN, 5, false],
  ["hulphandje op volgorde: een leeg vak", ZIN.ordenHand, 2, true],
  ...(["tafel", "schilderij", "ruitjes", "matten", "vellen", "tafels"] as const).map((t): [string, string[], number, boolean] => [`2e keer mis: samen (${t === "tafels" ? "op volgorde" : t})`, ZIN.samen(v1(t)), 4, false]),
  ["samen tellen (tafel): het kind tikt", ZIN.samenTelTafel, 3, true],
  ["hulphandje: blaadje", ZIN.samenTelHand, 2, true],
  ["samen (schilderijen): per schilderij", ZIN.samenSchilderij("de zon", 9), 3, false],
  ["samen (schilderijen): de minste en de meeste", ZIN.samenSchilderijSlot("de zon", "het huis"), 2, false],
  ["samen (schilderijen): het kind tikt", ZIN.samenTweeStap, 2, true],
  ["hulphandje: kaartje", ZIN.samenTweeHand, 2, true],
  ["samen (ruitjes): Bliepo telde blauw", ZIN.samenBlauwKlaar, 2, false],
  ["samen (ruitjes): het kind telt geel", ZIN.samenGeelStap, 2, true],
  ["hulphandje: hokje", ZIN.samenGeelHand, 2, true],
  ["samen (matten): Bliepo telde mat 1", ZIN.samenMat1Klaar(4), 2, false],
  ["samen (matten): het kind telt mat 2", ZIN.samenMat2Stap, 2, true],
  ["hulphandje: stuk", ZIN.samenMatHand, 2, true],
  ["samen (gedraaid kaartje): het kind tikt", ZIN.samenVelStap, 2, true],
  ["hulphandje: het kaartje", ZIN.samenVelHand, 2, true],
  ["samen (op volgorde): vooraan", ZIN.samenOrden(v1("tafels"), 0, "a"), 2, false],
  ["samen (op volgorde): daarna", ZIN.samenOrden(v1("tafels"), 1, "b"), 3, false],
  ["samen (op volgorde): het kind sleept de laatste", ZIN.samenOrdenStap(v1("tafels"), "d"), 2, true],
  ["hulphandje: slepen", ZIN.samenOrdenHand, 2, true],
  ...(["tafel", "schilderij", "ruitjes", "matten", "vellen", "tafels"] as const).flatMap((t): [string, string[], number, boolean][] => [
    [`samen: klaar (${t === "tafels" ? "op volgorde" : t})`, ZIN.samenKlaar(v1(t)), 2, false],
    [`samen: Bliepo deed het zelf (${t === "tafels" ? "op volgorde" : t})`, ZIN.samenZelf(v1(t)), 2, false],
  ]),
  ["weer vlak naast het antwoord", ZIN.weerDichtbij, 3, false],
  ...(["tafels", "schilderij", "tafel", "matten"] as const).map((t): [string, string[], number, boolean] => [`hetzelfde antwoord 2 keer (${v1(t).soort})`, ZIN.weerGekozen("9", v1(t)), 3, false]),
  ["er komt 1 vraag terug", ZIN.terug1, 2, false],
  ["er komen vragen terug", ZIN.terugN(3), 2, false],
  ["nog 1 vraag om te oefenen", ZIN.extra1, 2, false],
  ["nog vragen om te oefenen", ZIN.extraN(3), 2, false],
  ["de vragen die terugkwamen gingen weer mis", ZIN.terugLastig, 2, false],
  ["slot", ZIN.slot, 3, false],
  ["de kaart", ZIN.kaartTik, 3, true],
];
for (const [naam, lijst, min, doe] of VAST) {
  if (lijst.length < min) fouten.push(`${naam}: ${lijst.length} varianten, minstens ${min} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${naam}: 2 varianten zijn dezelfde zin`);
  for (const z of lijst) {
    if (/\bfout\b/i.test(z)) fouten.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
    if (getalDubbel(z)) fouten.push(`${naam}: een getal staat 2 keer in 1 zin: "${kaal(z)}"`);
    if (doe && !DOE.test(kaal(z))) fouten.push(`${naam}: "${kaal(z)}" is geen vraag of opdracht (15.37)`);
    if (/vinkje/i.test(z)) fouten.push(`${naam}: het woord "vinkje" (het lesscherm laat die zin weg, 15.37)`);
  }
}
/* Elke vraag eindigt met een vraag of opdracht (15.36, 15.37), zonder "vinkje", en is nooit gelijk aan zijn eigen "opnieuw". */
for (const v of VRAGEN) {
  const z = kaal(v.vraag.join(" "));
  if (!DOE.test(z)) fouten.push(`${v.id}: de vraag "${z}" is geen vraag of opdracht`);
  if (/vinkje/i.test(z)) fouten.push(`${v.id}: het woord "vinkje" in de vraag`);
  for (const s of [...(v.intro ?? []), ...v.vraag]) if (getalDubbel(s)) fouten.push(`${v.id}: een getal staat 2 keer in "${kaal(s)}"`);
  for (const o of ZIN.opnieuw(v)) if (v.vraag.includes(o)) fouten.push(`${v.id}: "opnieuw" is dezelfde zin als de vraag ("${o}")`);
  /* Samen voordoen: het antwoord klopt, en het getal staat er precies 1 keer in (niet 2 keer achter elkaar). */
  for (const k of [...ZIN.samenKlaar(v), ...ZIN.samenZelf(v)].map(kaal)) {
    if (v.soort === "typ" && getallenIn(k).join() !== v.goed) fouten.push(`${v.id}: samen-klaar noemt niet precies 1 keer ${v.goed}: "${k}"`);
    if (v.thema === "matten" && getallenIn(k).filter((n) => n === v.stukken).length !== 1) fouten.push(`${v.id}: samen-klaar noemt niet precies 1 keer ${v.stukken}: "${k}"`);
    if (v.thema === "ruitjes" && getallenIn(k).join() !== "8") fouten.push(`${v.id}: samen-klaar noemt niet precies 1 keer 8: "${k}"`);
    if ((v.thema === "matten" || v.thema === "ruitjes" || v.thema === "vellen") && !/even groot/.test(k)) fouten.push(`${v.id}: samen-klaar zegt niet "even groot": "${k}"`);
  }
}

/* 5. De kiezer 20.000 keer naspelen (dezelfde functie als de les): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen. */
let gespeeld = 0;
let reacties = 0;
{
  let zaad = 20261118;
  const toeval = () => ((zaad = (zaad * 1664525 + 1013904223) % 4294967296), zaad / 4294967296);
  const uit = <T,>(l: readonly T[]) => l[Math.floor(toeval() * l.length)];
  const k = nieuweKiezer(toeval);
  /* De zin uit het vaste rijtje (denkfout niet duidelijk) kiest de les met zijn eigen rijtjes-kiezer, die ook nooit herhaalt. */
  const k10 = nieuweKiezer(toeval);
  /** De laatste zin per rol (eerste zin, tweede zin, opnieuw, samen, klaar): over de hele reeks lessen heen. */
  const vorige = new Map<string, string>();
  const zie = (rol: string, z: string, waar: string) => {
    if (vorige.get(rol) === vorm(z)) fouten.push(`naspelen: 2 keer achter elkaar dezelfde zin (${rol}) bij ${waar}: "${kaal(z)}"`);
    vorige.set(rol, vorm(z));
  };
  while (gespeeld < 20000) {
    /* 1 les: de 12 vragen en dan 3 die terugkomen. */
    const mis: number[] = [];
    const reeks = VRAGEN.map((_, i) => i);
    for (let stap = 0; stap < 15; stap++) {
      if (stap === 12) reeks.push(...[...mis, ...RESERVE.filter((i) => !mis.includes(i))].slice(0, 3));
      const v = VRAGEN[reeks[stap]];
      const soort = toeval();
      if (soort < 0.25) continue; /* meteen goed */
      if (stap < 12) mis.push(reeks[stap]);
      const antwoorden = v.soort === "typ" && toeval() < 0.8 ? Object.keys(foutenVan(v)) : alleAntwoorden(v);
      const x1 = uit(antwoorden);
      const f1 = foutVan(x1, v);
      const r1 = foutReactie(k, { f: f1, v, x: x1, poging: 1, eerder: null, eersteX: null, onduidelijk: k10.kies("onduidelijk", ONDUIDELIJK.zinnen) });
      const opnieuw = k.kies("opnieuw", ZIN.opnieuw(v));
      gespeeld++;
      reacties++;
      const na = (r: string[], waar: string, max: number) => {
        if (r.length !== 2 || r.some((z) => !z)) fouten.push(`naspelen: geen 2 zinnen bij ${waar}`);
        if (vorm(r[0]) === vorm(r[1])) fouten.push(`naspelen: 2 keer dezelfde zin in 1 reactie bij ${waar}: "${kaal(r.join(" "))}"`);
        if (lengte(...r) > max) fouten.push(`naspelen: te lang (${lengte(...r)} tekens) bij ${waar}: "${kaal(r.join(" "))}"`);
        zie("eerste zin", r[0], waar);
        zie("tweede zin", r[1], waar);
      };
      na(r1, `${v.id} ${x1}`, MAX_HINT);
      zie("opnieuw", opnieuw, v.id);
      if (!DOE.test(kaal(opnieuw))) fouten.push(`naspelen: na de hint geen vraag of opdracht bij ${v.id}`);
      if (soort < 0.6) continue; /* goed na 1 keer mis */
      /* 2e keer mis: vaak hetzelfde antwoord of dezelfde denkfout. */
      const x2 = toeval() < 0.4 ? x1 : uit(antwoorden);
      const f2 = foutVan(x2, v);
      const r2 = foutReactie(k, { f: f2, v, x: x2, poging: 2, eerder: f1, eersteX: x1, onduidelijk: k10.kies("onduidelijk", ONDUIDELIJK.zinnen.filter((_, i) => i !== 9)) });
      reacties++;
      na(r2, `${v.id} ${x1} en dan ${x2}`, MAX_UITLEG);
      /* Bij dezelfde vraag zegt Bliepo de 2e keer niet dezelfde eerste zin als de 1e keer. */
      if (vorm(r2[0]) === vorm(r1[0])) fouten.push(`naspelen: 2 keer dezelfde eerste zin bij ${v.id} (${x1}, ${x2}): "${kaal(r2[0])}"`);
      if (/\bweer\b/i.test(r2[0]) && !(x1 === x2 || f1.soort === f2.soort)) fouten.push(`naspelen: "weer" zonder dat het klopt bij ${v.id} (${x1}, ${x2}): "${kaal(r2[0])}"`);
      for (const z of r2) if (OPDRACHT.test(kaal(z))) fouten.push(`naspelen: een opdracht bij de 2e keer bij ${v.id}: "${kaal(z)}"`);
      zie("samen", k.kies("samen", ZIN.samen(v)), v.id);
      const zelf = toeval() < 0.1;
      zie(zelf ? "zelf" : "klaar", k.kies(zelf ? "samenZelf" : "samenKlaar", zelf ? ZIN.samenZelf(v) : ZIN.samenKlaar(v)), v.id);
    }
  }
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].slice(0, 60).join("\n") + (fouten.length > 60 ? `\n… (${fouten.length} meldingen)` : ""));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden in de tabel, ${combinaties} combinaties van eerste zin en hint, ${waarheid} zinnen op waarheid gecontroleerd, ${VAST.length} rijtjes vaste zinnen).`);
console.log(`Nooit 2 keer hetzelfde: ${gespeeld} vragen nagespeeld (${reacties} reacties), 0 keer dezelfde zin 2 keer achter elkaar.`);

/* 6. De tabel (in §2 en §3 staat steeds de eerste variant; §4 heeft ze allemaal). */
const soortNaam = { twee: "kies er 2", orden: "op volgorde", kies: "kiezen", typ: "typen" } as const;
const vraagNaam = (v: Vraag) => `${v.nr}. ${soortNaam[v.soort]}: ${kaal([...(v.intro ?? []), ...v.vraag].join(" "))} → ${v.soort === "twee" ? v.goed.split(",").map((id) => v.kaarten!.find((k) => k.id === id)!.zeg).join(" + ") : v.soort === "orden" ? v.juist!.map((id) => naamVan(v, id)).join(", ") : v.goed}`;
const antwoord = (v: Vraag, a: string) => (v.soort === "twee" ? a.split(",").map((id) => v.kaarten!.find((k) => k.id === id)!.zeg).join(" + ") : v.soort === "orden" ? a.split(",").map((id) => naamVan(v, id).replace(/^(de|het) /, "")).join(" · ") : a);
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${antwoord(v, a)} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} | ${f.eigen ? "**eigen invulling, niet van Synthesis**" : "Synthesis"} — ${f.bron} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) => `${kaal(ZIN.samen(v)[0])} … ${kaal(ZIN.samenKlaar(v)[0])}`;
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v))
    .filter(([, f], i, alle) => alle.findIndex(([, g]) => g.soort === f.soort) === i)
    .map(([a, f]) => `| ${v.nr} | ${antwoord(v, a)} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");
const typAlgemeen = VRAGEN.filter((v) => v.soort === "typ").map((v) => `| ${v.nr} | ${kaal(typFout(50, v).hint)} | ${kaal(typFout(50, v).uitleg)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Meten (squla-meten-oppervlakte-1-gouden, "Hoe groot is het?")

Gemaakt op 10 november 2026, bijgewerkt op 18 november 2026 (Bliepo als warme juf; alle varianten in §4), **uit de code** met \`npx tsx scripts/fouttabel-meten-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-meten-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (12 vragen, daarna 3 die terugkomen; tekeningen, getallen, keuzes) is die van squla-meten-oppervlakte-1 en blijft gelijk (BOUWREGELS 15.21, 15.22).

**Bron van de reacties:** het draaiboek Meten (Area: Cover It Up), §3 C (een eigen zin per fout getal bij "hoeveel tegels?": de bovenste rij, een rij gemist, 1 te veel), §3 G (samen tellen: het kind tikt elk ding aan, Bliepo zegt het getal) en §7 (denkfouten: \`een-rij-geteld\`, \`rij-gemist\`, \`een-te-veel\`, \`lang-lijkt-groter\`, \`groot-vierkant-lijkt-groter\`, \`vorm-verandert-grootte\`).

**Eigen invulling, niet van Synthesis (15.22 punt 5):** Cover It Up heeft geen "kies er 2", geen "op volgorde" en geen speelmatten of gedraaid kaartje (draaiboek §8). Die vragen hebben hetzelfde skelet (vraag met het beeld, 1e fout zin + hint + vraag in andere woorden, 2e fout uitleg en samen voordoen), maar hun eerste zinnen en hints zijn eigen invulling; de laatste kolom zegt het per rij.

**Getalkleur (2.1, 2.2):** blaadjes groen, blauw of oranje; blauwe en gele hokjes blauw en geel; tegels op de muur geel; stenen rood; borden, puzzelstukken in allerlei kleuren en kale getallen wit. Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen of vinkjes gaan weg (bij typen wordt het vak leeg; bij op volgorde glijden de plaatjes terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om wat hij noemt (de bovenste rij, mat 1 of 2, kaartje 2, het vak), nooit om het antwoord. Bij de schilderijen worden de tegels erachter zichtbaar. Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw. De nummers die het kind op de blaadjes zette, blijven staan (draaiboek §3 C.3).
- **Verklappen (15.17):** de eerste zin zegt alleen wat zeker is over het gekozen antwoord. Bij typen nooit "1 te veel" of "1 te weinig" (dan weet je het antwoord), wel "Dat is dichtbij." (alleen als het er 1 naast zit; er blijven dan 2 getallen over). Bij kies er 2 zegt Bliepo "1 van je 2 kaartjes klopt." en niet welke (anders blijft er maar 1 paar over); ook de hint wijst dan geen kaartje aan. Het script rekent het na voor ELKE variant en voor elk antwoord dat een kind kan geven.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** na de hint stelt Bliepo de vraag opnieuw, in andere woorden ("Welke 2 kaartjes kloppen?", "Leg ze nu van klein naar groot.", "Hoeveel blaadjes tel je nu? Typ het getal."). Het script keurt elke variant.
- **2e fout:** een korte uitleg bij de denkfout (uitleg, geen opdracht), dan samen voordoen: bij de tafel tikt het kind elk blaadje aan en Bliepo zegt het getal (samen tellen, §3 G); bij de matten en de ruitjes telt Bliepo de eerste en het kind de tweede; bij de schilderijen noemt Bliepo per schilderij de tegels en tikt het kind de 2 goede kaartjes aan; bij het gedraaide kaartje tikt het kind kaartje 2 en het draait terug; bij op volgorde legt Bliepo ze en sleept het kind de laatste. Het hulphandje komt vanzelf na ± 6 s. Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde antwoord 2 keer:** de eerste zin wordt "Je koos weer …" ("Je typte weer …", "Je legde ze weer zo neer.").
- **Nooit 2 keer hetzelfde (18 november 2026):** elke zin heeft varianten; de les kiest met de gedeelde kiezer (\`nooit-dubbel.ts\`) nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen. Het script speelt de kiezer 20.000 keer na.
- **Een getal klinkt niet 2 keer achter elkaar:** bij het samen tellen zegt Bliepo het laatste getal in de zin erna ("En 10! Zo groot is de tafel."), niet eerst los.
- **Niet duidelijk (\`onduidelijk\`):** bij typen, voor elk getal dat niet in de tabel staat (of waar 2 denkfouten passen): een zin uit BLIEPO-KARAKTER.md §10 en de algemene hint hieronder. Geen reden verzonnen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`een-rij-geteld\` | telde alleen de bovenste rij blaadjes | draaiboek §7 (gezien) |
| \`rij-gemist\` | sloeg een hele rij over | draaiboek §7 (gezien) |
| \`een-ernaast\` | telde er 1 te veel of 1 te weinig | draaiboek §7 \`een-te-veel\` (gezien); de richting zegt Bliepo niet |
| \`rij-en-rijen-opgeteld\` | deed de blaadjes van 1 rij en het aantal rijen bij elkaar | de oude les (Squla); niet gezien bij Synthesis |
| \`twee-keer-kleinst\` | koos 2 keer "het kleinst" | eigen invulling |
| \`verkeerde-kleinste\` | koos het verkeerde schilderij als kleinste | eigen invulling |
| \`even-en-niet-samen\` | koos "even groot" én "niet even groot" | eigen invulling |
| \`vorm-verandert-grootte\` | denkt dat een andere vorm een andere grootte heeft | draaiboek §7 (gezien bij het trapkleed) |
| \`draaien-verandert-grootte\` | denkt dat een gedraaid kaartje een andere grootte heeft | draaiboek §7 \`vorm-verandert-grootte\` |
| \`hoog-lijkt-groter\` | vindt de hogere mat groter | draaiboek §7 \`groot-vierkant-lijkt-groter\` (gezien) |
| \`lang-lijkt-groter\` | vindt de langere mat groter | draaiboek §7 (gezien) |
| \`volgorde-omgedraaid\` | legde ze van groot naar klein | eigen invulling |
| \`kleinste-niet-vooraan\` | legde vooraan niet het kleinste | eigen invulling |
| \`kleiner-erna\` | legde na een plaatje een kleiner plaatje | eigen invulling |
| \`overgeslagen\` | sloeg een plaatje over | eigen invulling |
| \`plek-over-niet-gezien\` | zag niet dat op de tafel met plek over meer borden passen | eigen invulling (de oude les legt het zo uit) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen; bij typen de meest voorkomende getallen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm | Bron |
|---|---|---|---|---|---|---|
${rijen}

**Typen, elk ander getal (algemeen, \`onduidelijk\`):**

| Vraag | Hint | Uitleg bij de 2e fout |
|---|---|---|
${typAlgemeen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen (begin … einde) |
|---|---|---|---|---|
${uitleg}
`;
const lijst = (naam: string, l: string[]) => `| ${naam} | ${l.map(kaal).join(" / ")} |`;
const T = (nr: number, x: string) => foutVan(x, VRAGEN[nr - 1]).v;
const rij5 = (naam: string, nr: number, x: string) => {
  const t = T(nr, x);
  return [lijst(`${naam}: eerste zin`, t.eerste.length ? t.eerste : ["(een zin uit het vaste rijtje, BLIEPO-KARAKTER.md §10)"]), lijst(`${naam}: hint`, t.hint), lijst(`${naam}: uitleg 2e keer`, t.uitleg), ...(t.weerEerste.length ? [lijst(`${naam}: weer (2 keer dezelfde denkfout)`, [...t.weerEerste, ...t.weerUitleg])] : [])];
};
const varianten = [
  ...VAST.map(([naam, l]) => lijst(naam, l)),
  ...VRAGEN.filter((v, i, alle) => alle.findIndex((w) => w.thema === v.thema) === i).map((v) => lijst(`reactie na lof (${v.thema})`, metenReactie(v).zinnen)),
  ...rij5("schilderijen, 2 keer 'kleinst' gekozen", 1, "bloem,zon"),
  ...rij5("schilderijen, 1 kaartje klopt", 1, "bloem,huis"),
  ...rij5("ruitjes, 'even groot' en 'niet even groot'", 6, "even,niet"),
  ...rij5("ruitjes, 1 kaartje klopt", 6, "niet,tel"),
  ...rij5("op volgorde (tafels), omgedraaid", 3, "d,c,b,a"),
  ...rij5("op volgorde (tafels), de 2 tafels met 6 borden", 3, "a,b,d,c"),
  ...rij5("op volgorde (tafels), de kleinste niet vooraan", 3, "b,a,c,d"),
  ...rij5("op volgorde (muurtjes), de smalste niet vooraan", 4, "4,2,6"),
  ...rij5("op volgorde (tafels), een tafel overgeslagen", 3, "a,c,b,d"),
  ...rij5("op volgorde (muurtjes), een muurtje overgeslagen", 4, "2,6,4"),
  ...rij5("het gedraaide kaartje", 5, "Ze zijn niet even groot."),
  ...rij5("speelmatten, mat 1 gekozen", 7, "Mat 1 is groter."),
  ...rij5("speelmatten, mat 2 gekozen", 7, "Mat 2 is groter."),
  ...rij5("typen (10 blaadjes), alleen de bovenste rij: 5", 9, "5"),
  ...rij5("typen (12 blaadjes), 1 rij overgeslagen: 8", 11, "8"),
  ...rij5("typen (10 blaadjes), er 1 naast: 9", 9, "9"),
  ...rij5("typen (10 blaadjes), rij en rijen bij elkaar: 7", 9, "7"),
  ...rij5("typen, elk ander getal (eerste zin uit BLIEPO-KARAKTER.md §10)", 9, "50"),
].join("\n");
const tekstMetVarianten = `${tekst}
## 4. Alle varianten (18 november 2026: Bliepo als warme juf; nooit 2 keer achter elkaar dezelfde zin)

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer (\`nooit-dubbel.ts\`). In §2 en §3 hierboven staat steeds de eerste variant; hier staan ze allemaal (met voorbeelden). Het script loopt ELKE variant na, voor elk antwoord dat een kind kan geven: geen "fout", geen antwoord in welke zin dan ook, "dichtbij" alleen als het er 1 naast zit en zonder richting, geen getal 2 keer in 1 zin, de uitleg is geen opdracht, elke reactie past in het tekstvak, en na elke hint komt een vraag of opdracht. Oud naast nieuw: WIJZIGINGEN-ZINNEN-METEN.md.

| Situatie | Varianten |
|---|---|
${varianten}
`;
writeFileSync(new URL("../FOUTTABEL-squla-meten-oppervlakte-1-gouden.md", import.meta.url), tekstMetVarianten);
console.log("FOUTTABEL-squla-meten-oppervlakte-1-gouden.md geschreven.");
