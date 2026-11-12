/**
 * Maakt FOUTTABEL-squla-getallenlijn-kat-1-gouden.md uit de code (squla-getallenlijn-gouden-zinnen.ts), zodat de tabel
 * altijd klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT
 * "geleerd bij Tellen" en "geleerd bij de keuring Huisnummers").
 *   npx tsx scripts/fouttabel-getallenlijn-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * - Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 *   logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de zin het antwoord en stopt het script (behalve
 *   bij een vraag met maar 2 keuzes: daar blijft er altijd 1 over; dan mag de zin het antwoord niet noemen). Geen eerste
 *   zin of hint noemt het antwoord, of 2 buren van het antwoord tegelijk.
 * - Waarheidscontrole: in deze les kiest het kind altijd uit vaste keuzes (getallen, dingen, kaarten); het script gaat
 *   ELK fout antwoord langs (bij op volgorde: elke volgorde van de 3 kaarten) en controleert elke bewering in de eerste
 *   zin, de uitleg en de "weer"-zinnen tegen het beeld (waar het raketje staat, welke getallen op de lijn staan, waar de
 *   ufo staat, hoeveel stapjes iets ligt). Een eerste zin die het script niet kan nalopen, telt als fout.
 */
import { writeFileSync } from "node:fs";
import {
  UITLEG_VRAAG,
  VRAGEN,
  ZIN,
  anker,
  foutenVan,
  hintVan,
  lijnReactie,
  plekVan,
  sprongStart,
  uitlegFout,
  volgordes,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-getallenlijn-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): de 15 vragen van squla-getallenlijn-kat-1 (KAT_1 in squla-getallenlijn.tsx). */
const OUD: [string, string, string][] = [
  ["bij", "6", "7,5,6"],
  ["bij", "2", "2,1,4"],
  ["bij", "9", "8,9,10"],
  ["natien", "11", "11,1,12"],
  ["meer", "14", "14,13"],
  ["orden", "5,6,7,8", "7,8,6"],
  ["orden", "12,13,14,15", "14,13,15"],
  ["bij", "14", "15,4,14"],
  ["bij", "18", "17,18,8"],
  ["wie", "raketje", "raketje,ufo,satelliet"],
  ["wie", "ufo", "raketje,ufo,satelliet"],
  ["dichtst", "18", "18,8,14"],
  ["dichtst", "11", "17,4,11"],
  ["ongeveer", "11", "11,16,19"],
  ["ongeveer", "19", "13,19,16"],
];
if (VRAGEN.length !== 15) fouten.push(`${VRAGEN.length} vragen in plaats van 15 (squla-getallenlijn-kat-1)`);
VRAGEN.forEach((v, i) => {
  const [soort, goed, keuzes] = OUD[i];
  if (v.soort !== soort || v.goed !== goed || v.opties.join(",") !== keuzes) fouten.push(`${v.id}: wijkt af van de oude les`);
  if (v.soort !== "orden" && v.opties.filter((x) => x === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (new Set(v.opties).size !== v.opties.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk`);
  /* Het goede antwoord klopt met het beeld. */
  if (v.soort === "bij" && (v.labels!.includes(v.raketje!) || Number(v.goed) !== v.raketje)) fouten.push(`${v.id}: het raketje staat niet bij het goede getal, of het getal staat al op de lijn`);
  if (v.soort === "natien" && (v.raketje !== 11 || v.labels!.includes(11))) fouten.push(`${v.id}: na 10 klopt niet`);
  if (v.soort === "meer" && Number(v.goed) !== Math.max(v.meer!.a, v.meer!.b)) fouten.push(`${v.id}: meer klopt niet`);
  if (v.soort === "orden") {
    const g = v.goed.split(",").map(Number);
    if (g.some((n, k) => k > 0 && n !== g[k - 1] + 1)) fouten.push(`${v.id}: de volgorde telt niet steeds 1 verder`);
    if (volgordes(v).filter((x) => x === v.goed).length !== 1) fouten.push(`${v.id}: de goede volgorde komt niet precies 1 keer voor`);
  }
  if (v.soort === "wie" && plekVan(v, v.goed) !== v.n) fouten.push(`${v.id}: het goede ding staat niet bij ${v.n}`);
  if (v.soort === "wie" && ["raketje", "ufo", "satelliet"].filter((z) => plekVan(v, z) === v.n).length !== 1) fouten.push(`${v.id}: niet precies 1 ding bij ${v.n}`);
  if (v.soort === "dichtst") {
    const d = v.bordjes!.map((n) => Math.abs(n - v.n!));
    if (d.filter((x) => x === Math.min(...d)).length !== 1) fouten.push(`${v.id}: 2 getallen liggen even dicht bij`);
  }
  if (v.soort === "ongeveer") {
    const d = v.opties.map((n) => Math.abs(Number(n) - v.raketje!));
    if (d.filter((x) => x === 0).length !== 1) fouten.push(`${v.id}: ongeveer heeft niet precies 1 passend getal`);
  }
});

/* 2. Fouttabel compleet en verklapcontrole. */
const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  const eh = `${f.eerste} ${f.hint}`;
  if (v.soort === "orden") {
    if (kaal(eh).includes(v.goed.split(",").join(", "))) return "de eerste zin of hint noemt de goede volgorde";
    /* De hint noemt nooit welke kaart na een getal komt ("na 5 komt 6"). */
    if (/komt \d+/.test(kaal(f.hint))) return "de hint noemt een kaart";
    return null;
  }
  if (v.soort === "wie") {
    if (kaal(f.hint).toLowerCase().includes(v.goed)) return "de hint noemt het goede ding";
    if (!f.over.includes(v.goed)) return "het goede ding valt weg na de eerste zin (de zin klopt niet)";
    return f.over.length <= 1 ? `na "${kaal(eh)}" blijft alleen ${f.over.join("")} over` : null;
  }
  const g = Number(v.goed);
  if (getallenIn(eh).includes(g)) return `de eerste zin of hint noemt het antwoord ${g}`;
  if (new RegExp(`tussen de ${g - 1} en de ${g + 1}`).test(kaal(eh))) return "de eerste zin of hint noemt 2 buren (dan is het antwoord verklapt)";
  if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  if (f.noot && /kant/.test(f.noot) && /\b(verder|terug|vóór|na|voorbij)\b/.test(kaal(f.hint))) return "na een zin zonder richting geeft de hint toch een richting";
  if (f.over.length <= 1 && !(v.opties.length === 2 && f.noot)) return `na "${kaal(eh)}" blijft alleen ${f.over.join("")} over`;
  return null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "orden" ? volgordes(v).length - 1 : v.opties.length - 1;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (f.code === "onduidelijk") fouten.push(`${v.id} ${a}: geen denkfout gevonden (bij vaste keuzes moet elke rij een denkfout hebben)`);
  }
  /* De reactie bij goed noemt alleen getallen die bij de vraag horen. */
  const g = v.soort === "wie" || v.soort === "orden" ? NaN : Number(v.goed);
  const mag = new Set<number>([g, g - 1, g + 1, 1, 2, v.n ?? -1, anker(v), ...(v.meer ? [v.meer.a, v.meer.b] : []), ...(v.soort === "orden" ? v.goed.split(",").map(Number) : []), ...(v.soort === "dichtst" ? [Math.abs(g - v.n!)] : [])]);
  if (!lijnReactie(v).zinnen.every((z) => getallenIn(z).every((n) => mag.has(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
  /* Het samen voordoen eindigt bij het goede antwoord. */
  const doel = ZIN.samenDoel(v);
  if (v.soort !== "orden" && v.soort !== "wie" && !getallenIn(doel).includes(Number(v.goed))) fouten.push(`${v.id}: samenDoel noemt het antwoord niet`);
  if (v.soort === "dichtst") {
    const d = Math.abs(Number(v.goed) - v.n!);
    if (!new RegExp(`maar ${d} sprong`).test(kaal(doel))) fouten.push(`${v.id}: samenDoel telt de sprongen niet goed`);
  }
}
/* De uitlegvraag na Nee (3 sprongen vanaf de 0). */
for (const x of UITLEG_VRAAG.opties.filter((o) => o !== UITLEG_VRAAG.goed)) {
  const f = uitlegFout(x);
  telling++;
  /* "Je telde de getallen 0, 1, 2 en 3" noemt de getallen op de lijn (zoals Synthesis), niet het aantal sprongen. */
  if (/3 sprong|sprongen: 3|3 bogen/.test(kaal(`${f.eerste} ${f.hint}`))) fouten.push(`uitlegvraag ${x}: noemt het antwoord 3`);
  if (f.over.length < 2 || !f.over.includes("3")) fouten.push(`uitlegvraag ${x}: verklapcontrole`);
}

/* 3. Waarheidscontrole: elke bewering tegen het beeld. */
let waarheid = 0;
const r = (re: RegExp, t: string) => [...t.matchAll(new RegExp(re.source, "g"))];
for (const v of VRAGEN) {
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const eerste = kaal(f.eerste);
    const tekst = kaal([f.eerste, f.hint, f.uitleg, ...f.weer].join(" "));
    const mis = (wat: string) => fouten.push(`${v.id} ${a}: niet waar: ${wat} ("${tekst}")`);
    const raket = v.raketje ?? NaN;
    const opLijn = (n: number) => v.van !== undefined && n >= v.van && n <= v.tot!;
    let gecheckt = 0;
    const check = (ok: boolean, wat: string) => {
      waarheid++;
      gecheckt++;
      if (!ok) mis(wat);
    };
    for (const m of r(/(\d+) staat vlak vóór het raketje/, tekst)) check(+m[1] === raket - 1, m[0]);
    for (const m of r(/(\d+) staat vlak na het raketje/, tekst)) check(+m[1] === raket + 1, m[0]);
    for (const m of r(/(\d+) is het streepje vóór het raketje/, tekst)) check(+m[1] === raket - 1, m[0]);
    for (const m of r(/(\d+) is het streepje na het raketje/, tekst)) check(+m[1] === raket + 1, m[0]);
    for (const m of r(/Bij de (\d+) is het raketje nog niet/, tekst)) check(+m[1] < raket, m[0]);
    for (const m of r(/Zo ver als de (\d+) is het raketje nog niet/, tekst)) check(+m[1] > raket, m[0]);
    for (const m of r(/(\d+) ligt verder dan het raketje/, tekst)) check(+m[1] > raket, m[0]);
    for (const m of r(/Het raketje staat verder dan de (\d+)/, tekst)) check(raket > +m[1], m[0]);
    for (const m of r(/Bij de (\d+) staat het raketje niet/, tekst)) check(raket !== +m[1], m[0]);
    for (const m of r(/Het raketje staat niet bij de (\d+)/, tekst)) check(raket !== +m[1], m[0]);
    for (const m of r(/Het raketje staat 1 streepje verder dan de (\d+)/, tekst)) check(raket === +m[1] + 1, m[0]);
    for (const m of r(/Het raketje staat 1 streepje vóór de (\d+)/, tekst)) check(raket === +m[1] - 1, m[0]);
    for (const m of r(/(\d+) staat niet op deze lijn/, tekst)) check(!opLijn(+m[1]), m[0]);
    for (const m of r(/Deze lijn begint bij de (\d+)/, tekst)) check(+m[1] === v.van, m[0]);
    if (/Het getal bij het raketje heeft 2 cijfers, net als de getallen ernaast/.test(tekst)) check(raket >= 11 && raket <= 98, "2 cijfers");
    for (const m of r(/Met (\d+) sla je een streepje over/, tekst)) check(+m[1] === Number(v.goed) + 1, m[0]);
    for (const m of r(/(\d+) staat vooraan op de lijn, vlak na de 0/, tekst)) check(+m[1] === 1 && opLijn(1), m[0]);
    for (const m of r(/Het raketje is al voorbij de (\d+)/, tekst)) check(raket > +m[1], m[0]);
    for (const m of r(/(\d+) zeg je eerder als je telt/, tekst)) check(!!v.meer && +m[1] === Math.min(v.meer.a, v.meer.b), m[0]);
    if (v.soort === "orden") {
      const xs = a.split(",").map(Number);
      for (const m of r(/Na (\d+) zette je (\d+)/, tekst)) {
        const i = xs.indexOf(+m[1]);
        check(i >= 0 && xs[i + 1] === +m[2], m[0]);
      }
      if (/, het grootste getal/.test(eerste)) check(xs[1] === Math.max(...xs), "het grootste getal");
      if (/Dat is kleiner/.test(eerste)) {
        const m = eerste.match(/Na (\d+) zette je (\d+)/)!;
        check(+m[2] < +m[1], "kleiner");
      }
    }
    if (v.soort === "wie") {
      for (const m of r(/(Het raketje|De ufo|De satelliet) staat (vóór|na) de (\d+)/, tekst)) {
        const z = m[1].split(" ")[1];
        const p = plekVan(v, z)!;
        check(m[2] === "vóór" ? p < +m[3] : p > +m[3], m[0]);
      }
      for (const m of r(/(Het raketje|De ufo|De satelliet) staat bij de (\d+)\. Dat is (\d+) streepjes? (vóór|na) de (\d+)/, tekst)) {
        const p = plekVan(v, m[1].split(" ")[1])!;
        check(p === +m[2] && Math.abs(+m[5] - p) === +m[3] && (m[4] === "vóór" ? p < +m[5] : p > +m[5]), m[0]);
      }
      for (const m of r(/Tel de streepjes vanaf de (\d+)/, tekst)) check(v.labels!.includes(+m[1]), m[0]);
      for (const m of r(/De (\d+) helpt je tellen/, tekst)) check(v.labels!.includes(+m[1]) && m[1] === String(anker(v)), m[0]);
    }
    if (v.soort === "dichtst") {
      for (const m of r(/Van (\d+) naar de (\d+) zijn het (\d+) sprongen/, tekst)) check(Math.abs(+m[1] - +m[2]) === +m[3] && +m[2] === v.n, m[0]);
      for (const m of r(/(\d+) ligt (\d+) sprongen van de (\d+) af/, tekst)) check(Math.abs(+m[1] - +m[3]) === +m[2] && +m[3] === v.n, m[0]);
    }
    if (v.soort === "ongeveer") {
      for (const m of r(/(\d+) ligt vlak na de (\d+)/, tekst)) check(+m[1] === +m[2] + 1 && v.labels!.includes(+m[2]), m[0]);
      for (const m of r(/(\d+) ligt vlak vóór de (\d+)/, tekst)) check(+m[1] === +m[2] - 1 && v.labels!.includes(+m[2]), m[0]);
      for (const m of r(/(\d+) ligt tussen de (\d+) en de (\d+)/, tekst)) check(+m[1] > +m[2] && +m[1] < +m[3], m[0]);
      for (const m of r(/Het raketje staat vlak bij de (\d+)/, tekst)) check(Math.abs(raket - +m[1]) <= 1 && v.labels!.includes(+m[1]), m[0]);
    }
    /* De hint: begint bij een getal dat je echt ziet, en telt de goede kant op. */
    for (const m of r(/Begin bij de (\d+)/, kaal(f.hint))) check(!!v.labels && v.labels.includes(+m[1]), `de hint begint bij ${m[1]}, maar dat staat niet op de lijn`);
    for (const m of r(/Zoek (?:eerst )?de (\d+)/, kaal(f.hint))) check(!!v.labels && v.labels.includes(+m[1]), `de hint zoekt ${m[1]}, maar dat staat niet op de lijn`);
    for (const m of r(/Kijk naar de (\d+)\. Het raketje staat 1 streepje verder/, kaal(f.hint))) check(raket === +m[1] + 1, m[0]);
    /* Keurder 10 nov: de hint zegt niet meer waar het raketje staat, maar hoe je telt (15.17). */
    for (const m of r(/Kijk naar de (\d+)\. Tel vanaf daar de streepjes tot het raketje/, kaal(f.hint))) check(!!v.labels && v.labels.includes(+m[1]) && +m[1] !== raket, m[0]);
    if (/Recht onder het raketje hoort het getal dat we zoeken/.test(tekst)) check(v.soort === "bij" && Number(v.goed) === raket, "recht onder het raketje");
    for (const m of r(/tel streepje voor streepje (verder|terug) tot de (\d+)/, kaal(f.hint))) check((m[1] === "verder") === (+m[2] > anker(v)), m[0]);
    for (const m of r(/Tel dan de streepjes (verder|terug) tot de (\d+)/, kaal(f.hint))) check((m[1] === "verder") === (+m[2] > anker(v)), m[0]);
    /* Elke eerste zin moet na te lopen zijn (anders kan het script niet zeggen of hij waar is). */
    if (!gecheckt) fouten.push(`${v.id} ${a}: de eerste zin kan het script niet nalopen: "${eerste}"`);
  }
  /* De sprongen bij het samen voordoen beginnen bij een getal dat je ziet (of bij het doel bij "dichtst"). */
  const s = sprongStart(v);
  if (v.soort !== "orden" && v.soort !== "dichtst" && v.soort !== "meer" && !(v.labels ?? []).includes(s)) fouten.push(`${v.id}: het samen springen begint bij ${s}, maar dat staat niet op de lijn`);
}
/* De hint van de uitlegvraag. */
waarheid += 2;

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + de uitlegvraag, ${telling} foute antwoorden in de tabel, ${waarheid} beweringen nagelopen).`);

/* 4. De tabel. */
const soortNaam = { bij: "bij welk getal", natien: "na 10", meer: "wat is meer", orden: "op volgorde", wie: "wat staat er bij", dichtst: "het dichtst bij", ongeveer: "ongeveer" } as const;
const beeldVan = (v: Vraag) =>
  v.soort === "orden"
    ? `vakken ${v.vakken!.map((n) => n ?? "_").join(" ")}, kaarten ${v.opties.join(" / ")}`
    : v.soort === "dichtst"
      ? `bordjes ${v.bordjes!.join(" / ")}, doel ${v.n}`
      : v.soort === "meer"
        ? `${v.meer!.a} of ${v.meer!.b}`
        : `lijn ${v.van}–${v.tot}${v.streepjes ? ` (streepjes ${v.streepjes.join(", ")})` : ""}, raketje bij ${v.raketje}${v.wezens ? `, ${v.wezens.map((w) => `${w.soort} bij ${w.n}`).join(", ")}` : ""}`;
const vraagNaam = (v: Vraag) => `${v.nr}. ${soortNaam[v.soort]}: ${beeldVan(v)} → ${v.goed}${v.soort === "orden" ? "" : ` (keuzes ${v.opties.join(" / ")})`}`;
const rondje = (f: Fout) => (!f.licht ? "geen rondje" : f.licht.soort === "getal" ? `rondje om de ${f.licht.n}` : f.licht.soort === "bordje" ? `rondje om bordje ${f.licht.n}` : `rondje om vak ${f.licht.i + 1}`);
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${rondje(f)}; ${f.scherm} | ${f.eigen ? "**eigen invulling, niet van Synthesis**" : "Synthesis"} — ${f.bron} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) => {
  if (v.soort === "orden") {
    const g = v.goed.split(",");
    return `${ZIN.samen(v)} ${g.slice(1, -1).map((n, i) => kaal(ZIN.samenOrden(+g[i], +n))).join(" ")} — ${kaal(ZIN.samenStap(v))} — ${kaal(ZIN.samenKlaar(v))}`;
  }
  const doel = v.soort === "wie" ? v.n! : v.soort === "meer" ? v.meer!.b : v.soort === "dichtst" ? v.n! : Number(v.goed);
  const start = sprongStart(v);
  const stap = Math.sign(doel - start) || 1;
  const sprongen: string[] = [];
  let i = 0;
  for (let k = start + stap; stap > 0 ? k < doel : k > doel; k += stap) sprongen.push(v.soort === "dichtst" ? String(++i) : String(k));
  return `${ZIN.samen(v)} ${ZIN.samenBegin(v).map(kaal).join(" ")} [sprongen met bogen: ${start} → ${doel}${sprongen.length ? `; Bliepo zegt ${sprongen.join(", ")}` : ""}] ${kaal(ZIN.samenDoel(v))} — ${kaal(ZIN.samenStap(v))} — ${kaal(ZIN.samenKlaar(v))}`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");
const hints = VRAGEN.map((v) => `| ${v.nr} | ${soortNaam[v.soort]} | ${kaal(hintVan(v))} |`).join("\n");
const uitlegRijen = UITLEG_VRAAG.opties
  .filter((o) => o !== UITLEG_VRAAG.goed)
  .map((x) => {
    const f = uitlegFout(x);
    return `| ${x} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${kaal(f.uitleg)} | ${f.eigen ? "eigen invulling" : "Synthesis"} — ${f.bron} |`;
  })
  .join("\n");

const tekst = `# FOUTTABEL — gouden les Getallenlijn (squla-getallenlijn-kat-1-gouden, "Het raketje op de getallenlijn")

Gemaakt op 10 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-getallenlijn-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-getallenlijn-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, lijnen, getallen, keuzes) is die van squla-getallenlijn-kat-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Getallenlijn (Difference Dash: Count the Jumps), §3 B (springen per 1, "geen sprong van 1"), §3 C en D (de denkfout "de getallen geteld in plaats van de sprongen" benoemen, de hulpvraag "hoeveel sprongen?"), §3 E.3 en F.3 (bij een fout de getallen vastzetten en samen springen) en §7 (denkfouten). Synthesis benoemt een denkfout alleen als die zeker is; Bliepo ook (BOUWREGELS 15.9).

**Eigen invulling, niet van Synthesis (15.22 punt 5):** Count the Jumps gaat over het verschil tussen 2 getallen. **Bij welk getal staat het, na 10, wat is meer, op volgorde, wat staat er bij, het dichtst bij en ongeveer** zitten er niet in (draaiboek §8 en §11 punt 2). Die vragen hebben hetzelfde skelet (vraag met het beeld, 1e fout zin + hint + vraag in andere woorden, 2e fout samen springen met bogen), maar hun eerste zinnen en hints zijn eigen invulling; de laatste kolom zegt het per rij. Alleen de uitlegvraag na Nee ("hoeveel sprongen?") volgt Synthesis.

De getallen op de lijn zijn wit; in de les zijn de getallen in Bliepo's zinnen dus wit (2.2), behalve de 13 en 14 sterren in het verhaaltje bij "wat is meer": die zijn geel, zoals de sterren in beeld (2.1, 14.27). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen gaan weg (bij "wat staat er bij" gaat het vinkje weg; bij op volgorde blijven de kaarten even liggen en glijden daarna terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om het getal (of vak, of bordje) dat hij noemt, nooit om het antwoord. Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw.
- **Verklappen (15.17):** de eerste zin zegt alleen iets over wat het kind koos; er blijven altijd 2 keuzes over (bij "wat is meer" zijn er maar 2 keuzes: dan noemt Bliepo alleen de regel). Hij noemt nooit het antwoord en nooit beide buren ervan. Het script rekent dat per fout antwoord na.
- **2e fout:** een korte uitleg bij de denkfout, dan samen: Bliepo zet de getallen klaar en springt over de lijn, 1 per keer, elke sprong krijgt een boog die blijft staan (draaiboek §0, §3 E.3). Bij het doel komt het getal op de lijn (nu pas het antwoord in beeld). Dan de kleine stap: het kind tikt het getal (of het ding) aan, of sleept de laatste kaart in het vak (het hulphandje komt vanzelf na ± 6 s). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" ("Je tikte weer op …", "Je legde ze weer zo neer.").
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Fouttabel per vraag (elk fout antwoord)

| Vraag | Fout antwoord | Denkfout (naam voor de voortgang) | Eerste zin van Bliepo | Hint | Op het scherm | Bron |
|---|---|---|---|---|---|---|
${rijen}

## 2. Na de 2e fout: uitleg en samen voordoen

| Vraag | Fout antwoord | Uitleg | Zelfde denkfout 2 keer ("weer") | Samen voordoen en de kleine stap |
|---|---|---|---|---|
${uitleg}

Na het vangnet (20 s niets, of bij op volgorde 3 keer anders gelegd) doet Bliepo de laatste stap zelf en zegt hij "Kijk, …" (geen "Ja").

## 3. De hint per vraag (2 à 3 versies per soort, zodat het kind niet steeds hetzelfde hoort)

| Vraag | Soort | Hint |
|---|---|---|
${hints}

## 4. De uitlegvraag na Nee: "Hoeveel sprongen maakte het raketje?" (3 sprongen van de 0 naar de 3; keuzes 2 / 3 / 4)

| Fout antwoord | Denkfout | Eerste zin | Hint | Uitleg na de 2e fout | Bron |
|---|---|---|---|---|---|
${uitlegRijen}

Bij de 2e fout telt Bliepo de bogen (1, 2, 3; het rondje staat even om het getal waar elke boog landt), zegt "Dat zijn 3 sprongen." en het kind tikt de 3 aan. Daarna: "${kaal(ZIN.uitlegWaarom)}"

Bij het springen in de uitleg (draaiboek §3 B): alleen de getallen 1, 2 en 3 zijn wit en tikbaar. Tikt het kind een getal verder dan het volgende (een sprong overslaan), dan blijft het raketje staan en zegt Bliepo "${ZIN.uitlegOverslaan.join(" ")}" (bij de 3 in 1 keer: "${ZIN.uitlegHeleStuk.join(" ")}"). Na 3 keer, of 20 s niets, springt Bliepo zelf: "${ZIN.uitlegSpringZelf}" Dit telt niet als fout (geen rood scherm), zoals bij Synthesis.

## 5. Denkfouten: de vaste namen (voor de voortgang)

| Naam | Wat het kind doet | Waar |
|---|---|---|
| \`streepje-ervoor\` | koos het getal van het streepje vóór het raketje | bij welk getal |
| \`streepje-erna\` | koos het getal van het streepje na het raketje | bij welk getal |
| \`te-ver\` | keek verder dan het raketje (2 of meer) | bij welk getal |
| \`niet-ver-genoeg\` | keek niet ver genoeg (2 of meer) | bij welk getal |
| \`tiental-vergeten\` | koos alleen het laatste cijfer (4 voor 14, 1 voor 11) | bij welk getal, na 10 |
| \`streepje-overgeslagen\` | sloeg een streepje over (12 na 10) | na 10 |
| \`kleiner-gekozen\` | groter en kleiner verwisseld | wat is meer |
| \`volgorde-omgedraaid\` | legde de kaarten van groot naar klein | op volgorde |
| \`getal-overgeslagen\` | sloeg een getal over in de rij | op volgorde |
| \`kleiner-erna\` | legde een kleiner getal na een groter | op volgorde |
| \`ding-ervoor\` / \`ding-erna\` | tikte op een ding dat vóór of na het getal staat | wat staat er bij |
| \`verder-weg\` | koos een getal dat verder weg ligt | het dichtst bij |
| \`ander-stuk\` | koos een getal in een ander stuk van de lijn | ongeveer |
| \`getallen-tellen-ipv-sprongen\` | telde de getallen in plaats van de sprongen (Synthesis, §7) | uitlegvraag |
| \`te-weinig-bogen\` | telde een boog te weinig | uitlegvraag |
`;
writeFileSync(new URL("../FOUTTABEL-squla-getallenlijn-kat-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-getallenlijn-kat-1-gouden.md geschreven.");
