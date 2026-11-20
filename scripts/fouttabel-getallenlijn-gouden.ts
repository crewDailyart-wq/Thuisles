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
 * - Strenger sinds 18 november 2026 (Bliepo als warme juf, zoals de proefles Tellen): ELKE variant van elke zin wordt
 *   nagelopen, niet alleen 1 vaste zin per rij. Elke zin wordt in stukjes geknipt (bij . ! ?) en elk stukje moet het
 *   script kennen: een bewering die klopt met het beeld, of een neutraal stukje ("Je koos 7"). Uit de beweringen rekent
 *   het script per eerste zin + hint uit welke keuzes nog over zijn (15.17); "bijna" en "dichtbij" mogen alleen als er dan
 *   nog 2 keuzes dichtbij zijn; geen getal 2 keer in 1 zin of in 2 zinnen achter elkaar; geen opdracht bij de 2e keer;
 *   elke opdracht zegt wat het kind doet (F16); alles past in het tekstvak; en de kiezer wordt 20.000 keer nagespeeld.
 */
import { writeFileSync } from "node:fs";
import {
  AANMOEDIG_TIKKEN,
  MAX_REACTIE,
  NABIJ,
  UITLEG_VRAAG,
  VRAGEN,
  WISSELWOORDEN,
  ZIN,
  anker,
  deeltGetal,
  foutReactie,
  foutenVan,
  getallenIn,
  hintVan,
  kaal,
  lengte,
  lijnReactie,
  passend,
  plekVan,
  sprongStart,
  uitlegFout,
  volgordes,
  zonderGetalUit,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-getallenlijn-gouden-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const fouten: string[] = [];
const vorm = maakVorm(WISSELWOORDEN);
/** Een zin in stukjes (bij . ! ?), zonder kleurcodes en leestekens aan het eind. */
const stukjes = (z: string) => kaal(z).split(/(?<=[.!?])\s+/).map((x) => x.replace(/[.!?]+$/, "").trim()).filter(Boolean);
const eersteStuk = (z: string) => stukjes(z)[0] ?? "";
const laatsteStuk = (z: string) => stukjes(z).at(-1) ?? "";
/** Zegt deze zin wat het kind doet? Een vraagteken of een gebiedende wijs (BOUWREGELS 15.37; "Kijk …" telt niet). */
const OPDRACHT = /\?|(^|[.!?] )(Tik|Sleep|Zet|Laat)\b|\bTik erop\b|\bSleep hem\b/;
/** Een opdracht die het kind bij de 2e keer niet meer kan doen (daarna doet Bliepo het samen voor). */
const GEBIEDEND = /^(Tel|Kijk|Zoek|Begin|Tik|Sleep|Probeer|Wijs|Zet)\b/;

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
  /* De vraag zelf: een vraagteken of een opdracht, en nooit 2 vragen achter elkaar met precies dezelfde zin. */
  const vraag = ZIN.vraag(v).join(" ");
  if (!OPDRACHT.test(kaal(vraag))) fouten.push(`${v.id}: de vraag zegt niet wat het kind doet: "${kaal(vraag)}"`);
  if (i > 0 && kaal(ZIN.vraag(VRAGEN[i - 1]).join(" ")) === kaal(vraag)) fouten.push(`${v.id}: dezelfde vraagzin als de vraag ervoor: "${kaal(vraag)}"`);
  /* Binnen de vraag klinkt een getal niet in 2 zinnen achter elkaar (behalve het verhaaltje bij "wat is meer": daar vraagt de vraag naar die 2 getallen). */
  if (v.soort !== "meer") ZIN.vraag(v).forEach((z, k, l) => k > 0 && deeltGetal(l[k - 1], z) && fouten.push(`${v.id}: de vraag noemt een getal 2 keer achter elkaar: "${kaal(vraag)}"`));
});

/* 2. De beweringen: elk stukje van elke variant moet het script kennen en het moet kloppen met het beeld. */
type C = { v: Vraag; x: string; X: number; raket: number; g: number; f: Fout; xs: number[] };
type Uit = boolean | { ok: boolean; houdt?: (k: string) => boolean; richting?: boolean; nabij?: boolean };
type Regel = [RegExp, (m: RegExpMatchArray, c: C) => Uit];
/* "Het ruimteschip" is het ding met id `satelliet` (19 nov 2026: "satelliet" was een moeilijk woord). */
const DING = "(Het raketje|De ufo|Het ruimteschip|het raketje|de ufo|het ruimteschip)";
const dingVan = (s: string) => s.toLowerCase().split(" ")[1].replace("ruimteschip", "satelliet");
const opLijn = (c: C, n: number) => c.v.van !== undefined && n >= c.v.van && n <= c.v.tot!;
const lijnvraag = (c: C) => c.v.soort === "bij" || c.v.soort === "natien" || c.v.soort === "ongeveer";
const kantKlopt = (c: C, kant: string) => (kant === "verder") === ((c.v.n ?? 0) > anker(c.v));
const plekKlopt = (c: C, kant: string, n: number) => {
  const p = plekVan(c.v, c.x)!;
  return n === c.v.n && (kant === "vóór" ? p < n : p > n);
};
const REGELS: Regel[] = [
  /* Neutraal: wat het kind koos. */
  [/^Je koos (\d+)$/, (m, c) => +m[1] === c.X],
  [/^(\d+)$/, (m, c) => +m[1] === c.X],
  [/^Je tikte op (\d+)$/, (m, c) => +m[1] === c.X],
  [/^Probeer het nog eens$/, () => true],
  /* Bijna en dichtbij: alleen als het er 1 naast zit (de controle "nog 2 keuzes dichtbij" staat verderop). */
  [/^Bijna$/, (_, c) => ({ ok: Math.abs(c.X - c.g) === 1, nabij: true })],
  [/^Dat is heel dichtbij$/, (_, c) => ({ ok: Math.abs(c.X - c.g) === 1, nabij: true })],
  /* Bij welk getal: het raketje staat verder / minder ver. */
  [/^Het raketje staat (net iets )?verder dan de (\d+)$/, (m, c) => ({ ok: c.raket > +m[2] && +m[2] === c.X, houdt: (k) => +k > +m[2], richting: true, nabij: !!m[1] })],
  [/^Het raketje (staat|is al|staat iets) verder$/, (m, c) => ({ ok: c.raket > c.X, houdt: (k) => +k > c.X, richting: true, nabij: /iets/.test(m[1]) })],
  [/^Daar is het raketje al voorbij$/, (_, c) => ({ ok: c.raket > c.X, houdt: (k) => +k > c.X, richting: true })],
  [/^Het raketje staat verder dan dat getal$/, (_, c) => ({ ok: c.raket > c.X, richting: true })],
  [/^(\d+) ligt verder dan het raketje$/, (m, c) => ({ ok: +m[1] > c.raket && +m[1] === c.X, houdt: (k) => +k < +m[1], richting: true })],
  [/^Dat getal ligt verder dan het raketje$/, (_, c) => ({ ok: c.X > c.raket, richting: true })],
  [/^Zo ver (?:als (?:de )?(\d+) )?is het raketje (?:nog )?niet$/, (m, c) => ({ ok: c.X > c.raket && (m[1] === undefined || +m[1] === c.X), houdt: (k) => +k < c.X, richting: true })],
  [/^Daar is het raketje nog niet$/, (_, c) => ({ ok: c.X > c.raket, houdt: (k) => +k < c.X, richting: true })],
  [/^Dat is te ver$/, (_, c) => ({ ok: c.X > c.raket, houdt: (k) => +k < c.X, richting: true })],
  [/^(\d+) is net iets te ver$/, (m, c) => ({ ok: +m[1] === c.X && c.X > c.raket, houdt: (k) => +k < c.X, richting: true, nabij: true })],
  [/^Maar het is iets te ver$/, (_, c) => ({ ok: c.X > c.raket, houdt: (k) => +k < c.X, richting: true, nabij: true })],
  [/^Het raketje staat minder ver$/, (_, c) => ({ ok: c.X > c.raket, richting: true })],
  /* Niet op deze lijn. */
  [/^(?:(\d+)|Dat getal) staat niet op deze lijn$/, (m, c) => ({ ok: !opLijn(c, c.X) && (m[1] === undefined || +m[1] === c.X), houdt: (k) => opLijn(c, +k) })],
  [/^Dat getal vind ik niet op deze lijn$/, (_, c) => ({ ok: !opLijn(c, c.X), houdt: (k) => opLijn(c, +k) })],
  [/^Deze lijn begint (?:pas )?bij de (\d+)$/, (m, c) => +m[1] === c.v.van],
  [/^Je koos weer een getal dat niet op de lijn staat$|^Dat getal staat weer niet op de lijn$|^Weer een getal dat niet op de lijn staat, zie ik$/, (_, c) => !opLijn(c, c.X)],
  [/^Het getal bij het raketje heeft 2 cijfers(, net als de getallen ernaast)?$/, (m, c) => c.raket >= 11 && c.raket <= 98 && (!m[1] || (c.raket - 1 >= 10 && c.raket + 1 >= 10))],
  [/^De getallen naast het raketje hebben 2 cijfers$/, (_, c) => c.raket - 1 >= 10 && c.raket + 1 <= 99],
  /* Zonder richting. */
  [/^Bij de (\d+) staat het raketje niet$|^Het raketje staat niet bij de (\d+)$/, (m, c) => +(m[1] ?? m[2]) === c.X && c.raket !== c.X],
  [/^Daar staat het raketje niet$|^Het raketje staat ergens anders$/, (_, c) => c.raket !== c.X],
  /* De hints op de lijn: een getal dat je echt ziet (en dat geen keuze is die nog over is: dat rekent `houdt` na). */
  [/^(?:Kijk naar|Zoek|Zoek eerst|Begin bij) de (\d+)(?: op de lijn)?$/, (m, c) => ({ ok: !!c.v.labels && c.v.labels.includes(+m[1]) && +m[1] !== c.raket && String(+m[1]) !== c.v.goed, houdt: (k) => k !== m[1] })],
  [/^Tel vanaf daar de streepjes tot het raketje$|^Tel de streepjes tot je bij het raketje bent$|^Tel de streepjes vanaf een getal dat je ziet$|^Kijk recht onder het raketje$|^Zoek een getal dat je ziet$|^Tel de streepjes tot het raketje$/, (_, c) => lijnvraag(c)],
  /* De uitleg bij de 2e keer (dan mag "vlak vóór" en "het volgende streepje": het antwoord komt daarna in beeld). Zou zo'n
     zin bij de 1e keer staan, dan blijft er maar 1 keuze over (`houdt`) en stopt het script. */
  [/^Het raketje staat bij het streepje na de (\d+)$|^Vlak na de (\d+) staat het raketje$/, (m, c) => ({ ok: +(m[1] ?? m[2]) === c.X && c.raket === c.X + 1, houdt: (k) => +k === c.X + 1 })],
  [/^Het raketje staat bij het volgende streepje$/, (_, c) => ({ ok: c.raket === c.X + 1, houdt: (k) => +k === c.X + 1 })],
  [/^(?:(\d+)|Dat getal) staat vlak vóór het raketje$/, (m, c) => ({ ok: (m[1] === undefined || +m[1] === c.X) && c.raket === c.X + 1, houdt: (k) => +k === c.X + 1 })],
  [/^Het raketje staat bij het streepje vóór de (\d+)$|^Vlak vóór de (\d+) staat het raketje$/, (m, c) => ({ ok: +(m[1] ?? m[2]) === c.X && c.raket === c.X - 1, houdt: (k) => +k === c.X - 1 })],
  [/^Het raketje staat bij het streepje ervoor$/, (_, c) => ({ ok: c.raket === c.X - 1, houdt: (k) => +k === c.X - 1 })],
  [/^(?:(\d+)|Dat getal) staat vlak na het raketje$/, (m, c) => ({ ok: (m[1] === undefined || +m[1] === c.X) && c.raket === c.X - 1, houdt: (k) => +k === c.X - 1 })],
  [/^Recht onder het raketje hoort het getal dat we zoeken$|^We zoeken het getal recht onder het raketje$/, (_, c) => c.v.soort === "bij" && c.g === c.raket],
  [/^Je koos weer een getal vóór het raketje$|^Dat is weer vóór het raketje$|^Weer een getal vóór het raketje, zie ik$/, (_, c) => c.X < c.raket],
  [/^Je koos weer een getal dat te ver ligt$|^Dat is weer te ver$|^Weer te ver, zie ik$/, (_, c) => c.X > c.raket],
  /* Na 10. */
  [/^Zo ver als (\d+) is het raketje nog niet$/, (m, c) => ({ ok: +m[1] === c.X && c.X > c.raket, houdt: (k) => +k < c.X, richting: true })],
  [/^Het raketje is al voorbij de (\d+)$/, (m, c) => ({ ok: c.v.soort === "natien" && c.raket > +m[1] && c.v.labels!.includes(+m[1]), houdt: (k) => +k > +m[1] })],
  [/^Tel vanaf daar de streepjes$|^Tel verder vanaf dat getal$|^Tel de streepjes vanaf het laatste getal dat je ziet$/, (_, c) => c.v.soort === "natien"],
  [/^Na de (\d+) gaat de lijn gewoon door$/, (m, c) => ({ ok: c.v.soort === "natien" && !!c.v.door && +m[1] === c.v.tot, houdt: (k) => +k > +m[1] })],
  [/^(\d+) staat vooraan op de lijn(, vlak na de 0)?$/, (m, c) => +m[1] === c.X && (m[2] ? c.X === 1 : c.X <= 2) && opLijn(c, c.X)],
  [/^Dat getal staat vooraan( op de lijn)?$|^Dat staat helemaal vooraan op de lijn$/, (_, c) => c.X <= 2 && opLijn(c, c.X)],
  [/^Je koos weer een getal van vooraan op de lijn$|^Dat staat weer vooraan op de lijn$/, (_, c) => c.X <= 2],
  [/^Het raketje is al veel verder$/, (_, c) => c.raket - c.X >= 5],
  [/^Met (\d+) sla je een streepje over$/, (m, c) => ({ ok: +m[1] === c.X && c.X === c.g + 1, houdt: (k) => +k === c.X - 1 })],
  [/^Dan sla je een streepje over$/, (_, c) => ({ ok: c.X === c.g + 1, houdt: (k) => +k === c.X - 1 })],
  [/^Na de (\d+) komt eerst het getal dat 1 groter is$/, (m, c) => c.v.soort === "natien" && +m[1] === 10 && c.g === 11],
  [/^Na de (\d+) komen getallen met 2 cijfers$/, (m) => +m[1] === 10],
  /* Wat is meer. */
  [/^(?:(\d+)|Dat getal) zeg je eerder als je telt$|^Dat komt eerder als je telt$/, (m, c) => !!c.v.meer && c.X === Math.min(c.v.meer.a, c.v.meer.b) && (m[1] === undefined || +m[1] === c.X)],
  [/^Het getal dat je later zegt als je telt, is meer$|^Op de getallenlijn staat het getal dat meer is, verder naar rechts$|^Tel maar in je hoofd$|^Welk getal zeg je later$|^Hoe verder je komt als je telt, hoe meer het is$|^Wat later komt, is meer$|^Wat je later zegt als je telt, is meer$/, (_, c) => c.v.soort === "meer"],
  /* Op volgorde (xs = hoe het kind de kaarten legde). */
  [/^Na (\d+) legde je (\d+)(, het grootste getal)?$|^Na (\d+) komt bij jou (?:meteen )?(\d+)(, het grootste getal)?$/, (m, c) => {
    const a = +(m[1] ?? m[4]);
    const b = +(m[2] ?? m[5]);
    const i = c.xs.indexOf(a);
    return i >= 0 && c.xs[i + 1] === b && b !== c.v.goed.split(",").map(Number)[i + 1] && (!(m[3] ?? m[6]) || b === Math.max(...c.xs));
  }],
  [/^Je legde (\d+) (?:vlak )?na (\d+)$/, (m, c) => {
    const i = c.xs.indexOf(+m[2]);
    return i >= 0 && c.xs[i + 1] === +m[1] && +m[1] !== c.v.goed.split(",").map(Number)[i + 1];
  }],
  [/^Dat is het grootste getal$/, (_, c) => c.f.code === "volgorde-omgedraaid" && c.xs[1] === Math.max(...c.xs)],
  [/^Zoek steeds het kleinste getal dat nog over is$|^Er komt steeds 1 bij$|^Sla geen getal over$|^Tel maar hardop verder$|^Welk getal komt dan$/, (_, c) => c.v.soort === "orden"],
  [/^Tussen (\d+) en (\d+) hoort nog een getal$/, (m, c) => +m[2] - +m[1] >= 2 && c.xs[c.xs.indexOf(+m[1]) + 1] === +m[2]],
  [/^Daar hoort nog een getal tussen$|^Er hoort nog een getal tussen$|^Je sloeg een getal over$|^Er is een getal overgeslagen$|^Ik mis een getal in de rij$/, (_, c) => c.f.code === "getal-overgeslagen"],
  [/^Na (\d+) komt het getal dat 1 groter is$/, (m, c) => c.v.soort === "orden" && c.v.goed.split(",").slice(0, -1).includes(m[1])],
  [/^Elk getal is 1 groter dan het getal ervoor$|^Van klein naar groot: het kleinste vooraan, dan steeds 1 groter$|^We gaan van klein naar groot$|^Het kleinste getal komt eerst$|^Dan steeds 1 groter$|^We beginnen met het kleinste getal$|^Het kleinste komt eerst$/, (_, c) => c.v.soort === "orden"],
  [/^Je legde het grootste getal vlak na (\d+)$/, (m, c) => +m[1] === c.xs[0] && c.xs[1] === Math.max(...c.xs)],
  [/^Je legde ze van groot naar klein$|^Je legde ze weer van groot naar klein$|^Ze liggen weer van groot naar klein$|^Weer van groot naar klein, zie ik$/, (_, c) => c.f.code === "volgorde-omgedraaid"],
  /* Wat staat er bij. */
  [new RegExp(`^${DING} staat (vóór|na) de (\\d+)$`), (m, c) => dingVan(m[1]) === c.x && plekKlopt(c, m[2], +m[3])],
  [new RegExp(`^Je tikte op ${DING}$`), (m, c) => dingVan(m[1]) === c.x],
  [new RegExp(`^${DING}$`), (m, c) => dingVan(m[1]) === c.x],
  [/^(Die|Dat) staat (?:nog )?(vóór|na) de (\d+)$/, (m, c) => (m[1] === "Dat") === (c.x === "raketje" || c.x === "satelliet") && plekKlopt(c, m[2], +m[3])],
  [/^(Die|Dat) staat al voorbij de (\d+)$/, (m, c) => (m[1] === "Dat") === (c.x === "raketje" || c.x === "satelliet") && plekKlopt(c, "na", +m[2])],
  [/^Tel dan de streepjes (verder|terug)$|^Tel streepje voor streepje (verder|terug)$|^Tel vanaf daar de streepjes (verder|terug)$/, (m, c) => c.v.soort === "wie" && kantKlopt(c, m[1] ?? m[2] ?? m[3])],
  [new RegExp(`^(?:${DING}|Die|Dat) staat bij de (\\d+)$`), (m, c) => (!m[1] || dingVan(m[1]) === c.x) && plekVan(c.v, c.x) === +m[2]],
  [/^Dat is (\d+) streepjes? (vóór|na) de (\d+)$|^(?:Die|Dat) staat (\d+) streepjes? (vóór|na) de (\d+)$/, (m, c) => {
    const [d, kant, n] = m[1] !== undefined ? [+m[1], m[2], +m[3]] : [+m[4], m[5], +m[6]];
    return Math.abs(n - plekVan(c.v, c.x)!) === d && plekKlopt(c, kant, n);
  }],
  [/^Je tikte weer op iets (vóór|na) de (\d+)$|^Dat staat weer (vóór|na) de (\d+)$|^Weer iets (vóór|na) de (\d+), zie ik$/, (m, c) => plekKlopt(c, m[1] ?? m[3] ?? m[5], +(m[2] ?? m[4] ?? m[6]))],
  [/^De (\d+) helpt je tellen$|^Vanaf de (\d+) kun je de streepjes tellen$/, (m, c) => c.v.labels!.includes(+(m[1] ?? m[2])) && +(m[1] ?? m[2]) === anker(c.v)],
  /* Het dichtst bij. */
  [/^Van (\d+) naar de (\d+) zijn het (\d+) sprongen$|^(\d+) ligt (\d+) sprongen van de (\d+) af$/, (m, c) => {
    const [x, n, d] = m[1] !== undefined ? [+m[1], +m[2], +m[3]] : [+m[4], +m[6], +m[5]];
    return x === c.X && n === c.v.n && Math.abs(x - n) === d && d > 1;
  }],
  [/^Dat ligt (\d+) sprongen van de (\d+) af$/, (m, c) => +m[2] === c.v.n && Math.abs(c.X - +m[2]) === +m[1]],
  [/^Tel bij elk getal de sprongen$|^Hoe minder sprongen, hoe dichterbij$|^Tel ze bij elk getal$|^Welk getal heeft de minste sprongen nodig$|^Tel ze maar$|^We tellen de sprongen op de getallenlijn$/, (_, c) => c.v.soort === "dichtst"],
  [/^Van (\d+) naar de (\d+) is het ver: (\d+) sprongen$/, (m, c) => +m[1] === c.X && +m[2] === c.v.n && Math.abs(c.X - c.v.n!) === +m[3] && +m[3] >= 5],
  [/^Dat is niet het dichtst bij$|^Dat getal ligt verder weg$/, (_, c) => c.v.soort === "dichtst" && c.x !== c.v.goed],
  /* 20 november 2026 (keuring, 15.36): bij "het dichtst bij" staat nog geen lijn in beeld, dus "tellen" in plaats van "sprongen".
     Waarheid: het juiste getal, de juiste afstand, en "verder" als het gekozen getal kleiner is dan het doel, anders "terug". */
  [/^Van (\d+) naar de (\d+) tel je (\d+) (verder|terug)$|^Van (\d+) tot de (\d+) moet je (\d+) (verder|terug) tellen$/, (m, c) => {
    const [x, n, d, k] = m[1] !== undefined ? [+m[1], +m[2], +m[3], m[4]] : [+m[5], +m[6], +m[7], m[8]];
    return x === c.X && n === c.v.n && Math.abs(x - n) === d && d > 1 && k === (x < n ? "verder" : "terug");
  }],
  [/^Dan tel je (\d+) (verder|terug) tot de (\d+)$/, (m, c) => +m[3] === c.v.n && Math.abs(c.X - c.v.n!) === +m[1] && m[2] === (c.X < c.v.n! ? "verder" : "terug")],
  [/^Van (\d+) naar de (\d+) is het ver: je telt (\d+) (verder|terug)$/, (m, c) => +m[1] === c.X && +m[2] === c.v.n && Math.abs(c.X - c.v.n!) === +m[3] && +m[3] >= 5 && m[4] === (c.X < c.v.n! ? "verder" : "terug")],
  [/^Van (\d+) tel je (\d+) (verder|terug) tot de (\d+)$/, (m, c) => +m[1] === c.X && +m[4] === c.v.n && Math.abs(c.X - c.v.n!) === +m[2] && m[3] === (c.X < c.v.n! ? "verder" : "terug")],
  [/^Tel in je hoofd vanaf elk bordje$|^Hoe minder je hoeft te tellen, hoe dichterbij$|^Hoe minder tellen, hoe dichterbij$|^Probeer het bij elk bordje in je hoofd$|^Tel bij elk bordje in je hoofd hoe ver het is$|^Kies het getal dat het minst ver is$|^We zetten de getallen op een lijn en tellen de sprongen$/, (_, c) => c.v.soort === "dichtst"],
  /* Ongeveer. */
  [/^(?:(\d+)|Dat getal|Dat) ligt vlak (na|vóór) de (\d+)$/, (m, c) => (m[1] === undefined || +m[1] === c.X) && c.X === +m[3] + (m[2] === "na" ? 1 : -1) && c.v.labels!.includes(+m[3])],
  [/^(?:(\d+)|Dat getal|Dat) ligt tussen de (\d+) en de (\d+)$/, (m, c) => (m[1] === undefined || +m[1] === c.X) && c.X > +m[2] + 1 && c.X < +m[3] - 1 && c.v.labels!.includes(+m[2]) && c.v.labels!.includes(+m[3])],
  [/^Kijk welk getal op de lijn het dichtst bij het raketje staat$|^Zoek het getal op de lijn dat vlak bij het raketje staat$|^Het raketje staat vlak bij een getal op de lijn$|^Zoek dat getal$/, (_, c) => c.v.soort === "ongeveer"],
  [/^Het raketje staat vlak bij de (\d+)$/, (m, c) => Math.abs(c.raket - +m[1]) <= 1 && c.v.labels!.includes(+m[1])],
  [/^Daar ligt (\d+) niet$/, (m, c) => +m[1] === c.X && Math.abs(c.X - anker(c.v)) > 1],
  [/^Dat getal ligt niet vlak bij de (\d+)$/, (m, c) => +m[1] === anker(c.v) && Math.abs(c.X - +m[1]) > 1],
  [/^Het raketje wel$/, (_, c) => c.v.soort === "ongeveer"],
];
/* De uitlegvraag ("Hoeveel sprongen maakte het raketje?", 3 bogen van de 0 naar de 3; het kind koos 2 of 4). */
const REGELS_UITLEG: Regel[] = [
  [/^Je koos (\d+)$|^(\d+)$/, (m, c) => +(m[1] ?? m[2]) === c.X],
  [/^Je telde de getallen 0, 1, 2 en 3$|^Zoveel getallen zijn het: 0, 1, 2 en 3$|^Je telde weer de getallen$|^Dat zijn weer de getallen$|^Weer de getallen geteld, zie ik$/, (_, c) => c.X === 4],
  [/^Dat zijn er (\d+)$/, (m, c) => +m[1] === 4 && c.X === 4],
  [/^Maar we tellen de sprongen, niet de getallen$|^We zoeken hoeveel sprongen het zijn$|^Kijk naar de bogen$|^Alleen de bogen tellen mee$|^Elke boog is 1 sprong$|^Bij elke sprong hoort 1 boog$|^Elke boog telt mee$/, () => true],
  [/^De 0 is het begin$|^Bij de 0 begon het raketje$|^Daar sprong het (raketje )?nog niet$|^Het begin telt niet mee$/, () => true],
  [/^Er zijn meer bogen dan (\d+)$/, (m, c) => ({ ok: +m[1] === c.X && c.X < 3, houdt: (k) => +k > c.X, richting: true })],
  [/^Ik zie meer bogen$|^Ik tel meer bogen$|^Er zijn meer bogen$/, (_, c) => ({ ok: c.X < 3, houdt: (k) => +k > c.X, richting: true })],
  [/^Tel elke boog, van de 0 tot het raketje$|^Wijs de bogen stuk voor stuk aan en tel ze$|^Begin bij de 0$|^Tel de bogen tot het raketje$/, () => true],
  [/^Je telde weer te weinig bogen$|^Dat zijn er weer te weinig$|^Weer te weinig bogen, zie ik$/, (_, c) => c.X < 3],
];

let waarheid = 0;
let varianten = 0;
let combinaties = 0;
/** Loop 1 zin na: elk stukje moet bekend zijn en kloppen. Geeft terug wat de zin over de keuzes zegt. */
function loopNa(waar: string, z: string, c: C, regels: Regel[]) {
  const uit = { houdt: [] as ((k: string) => boolean)[], richting: false, nabij: false };
  for (const stuk of stukjes(z)) {
    let bekend = false;
    for (const [re, test] of regels) {
      const m = stuk.match(re);
      if (!m) continue;
      bekend = true;
      waarheid++;
      const r = test(m, c);
      const o = typeof r === "boolean" ? { ok: r } : r;
      if (!o.ok) fouten.push(`${waar}: niet waar: "${stuk}" (in "${kaal(z)}")`);
      if (o.houdt) uit.houdt.push(o.houdt);
      if (o.richting) uit.richting = true;
      if (o.nabij) uit.nabij = true;
      break;
    }
    if (!bekend) fouten.push(`${waar}: het script kan dit stukje niet nalopen: "${stuk}" (in "${kaal(z)}")`);
  }
  if (NABIJ.test(kaal(z)) && !uit.nabij) fouten.push(`${waar}: "${kaal(z)}" zegt bijna of dichtbij, maar het script ziet dat niet`);
  return uit;
}
/** Wat voor elke variant geldt. */
function algemeen(waar: string, z: string) {
  varianten++;
  if (/\bfout\b/i.test(z)) fouten.push(`${waar}: het woord "fout" in "${kaal(z)}"`);
  if (/vinkje/i.test(z)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die hele zin weg, BOUWREGELS 15.37): "${kaal(z)}"`);
  const g = getallenIn(z);
  const dubbel = g.find((n, i) => g.indexOf(n) !== i);
  if (dubbel !== undefined) fouten.push(`${waar}: het getal ${dubbel} staat 2 keer in "${kaal(z)}"`);
  if (lengte(z) > MAX_REACTIE) fouten.push(`${waar}: te lang voor het tekstvak (${lengte(z)} tekens): "${kaal(z)}"`);
}
/** Een rijtje varianten: genoeg, geen 2 dezelfde. */
function rijtje(waar: string, lijst: readonly string[], min = 2) {
  if (lijst.length < min) fouten.push(`${waar}: ${lijst.length} ${lijst.length === 1 ? "variant" : "varianten"}, minstens ${min} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
  lijst.forEach((z) => algemeen(waar, z));
}

/* 3. De fouttabel: compleet, elke variant waar, niets verklapt (15.17). */
function keurFout(waar: string, c: C, keuzes: string[], goed: string, regels: Regel[], weerGekozen: string[]) {
  const f = c.f;
  if (f.code === "onduidelijk") return void fouten.push(`${waar}: geen denkfout gevonden (bij vaste keuzes moet elke rij een denkfout hebben)`);
  const V = f.v;
  if (!V) return void fouten.push(`${waar}: geen varianten`);
  const kanWeer = V.weerEerste.length > 0;
  if (!kanWeer && f.weer.length) fouten.push(`${waar}: wel een vaste "weer"-zin maar geen varianten`);
  const lijsten: [string, string[]][] = [["eerste zin", V.eerste], ["hint", V.hint], ["uitleg", V.uitleg], ["uitleg na \"weer gekozen\"", V.uitlegLos], ...(kanWeer ? ([["weer", V.weerEerste], ["weer-uitleg", V.weerUitleg]] as [string, string[]][]) : [])];
  const gezegd = new Map<string, ReturnType<typeof loopNa>>();
  for (const [naam, lijst] of lijsten) {
    rijtje(`${waar} ${naam}`, lijst);
    for (const z of lijst) gezegd.set(`${naam}|${z}`, loopNa(`${waar} ${naam}`, z, c, regels));
  }
  /* De vaste velden (voor de tabel) zijn 1 van de varianten. */
  if (!V.eerste.includes(f.eerste) || !V.hint.includes(f.hint) || !V.uitleg.includes(f.uitleg)) fouten.push(`${waar}: de vaste zin van de tabel is geen variant`);
  const andere = keuzes.filter((k) => k !== c.x);
  const getalvraag = !Number.isNaN(Number(goed));
  for (const e of V.eerste) {
    const E = gezegd.get(`eerste zin|${e}`)!;
    /* Geen enkele variant bij de 1e keer noemt het antwoord. */
    if (getalvraag && getallenIn(e).includes(Number(goed)) && !regels.includes(REGELS_UITLEG[0])) fouten.push(`${waar}: de eerste zin noemt het antwoord: "${kaal(e)}"`);
    if (f.noot && /kant niet genoemd/.test(f.noot) && E.richting) fouten.push(`${waar}: richting niet genoemd, maar "${kaal(e)}" geeft toch een richting`);
    /* De hints die de les bij deze eerste zin kan kiezen: zonder een getal uit de eerste zin, en passend in het tekstvak. */
    const zonder = V.hint.filter((h) => !deeltGetal(e, h));
    if (!zonder.length) fouten.push(`${waar}: elke hint herhaalt een getal uit "${kaal(e)}"`);
    const kan = zonder.filter((h) => lengte(e, h) <= MAX_REACTIE);
    if (!kan.length) fouten.push(`${waar}: geen hint past in het tekstvak achter "${kaal(e)}"`);
    if (kan.length < 2) fouten.push(`${waar}: maar ${kan.length} hint mogelijk achter "${kaal(e)}" (dan hoort het kind 2 keer dezelfde)`);
    for (const h of kan) {
      combinaties++;
      const H = gezegd.get(`hint|${h}`)!;
      if (getalvraag && getallenIn(h).includes(Number(goed)) && !regels.includes(REGELS_UITLEG[0])) fouten.push(`${waar}: de hint noemt het antwoord: "${kaal(h)}"`);
      if (!getalvraag && c.v.soort === "wie" && kaal(h).toLowerCase().includes(goed)) fouten.push(`${waar}: de hint noemt het goede ding: "${kaal(h)}"`);
      if (c.v.soort === "orden" && (/komt \d+/.test(kaal(h)) || kaal(`${e} ${h}`).includes(goed.split(",").join(", ")))) fouten.push(`${waar}: de hint noemt een kaart of de goede volgorde: "${kaal(h)}"`);
      if (f.noot && /kant niet genoemd/.test(f.noot) && (H.richting || /\b(verder|terug|vóór|na|voorbij)\b/.test(kaal(h)) || getallenIn(h).length)) fouten.push(`${waar}: na een zin zonder richting geeft de hint toch een richting of een getal: "${kaal(h)}"`);
      /* Welke keuzes zijn er na deze eerste zin + deze hint nog over? */
      const over = andere.filter((k) => [...E.houdt, ...H.houdt].every((mag) => mag(k)));
      if (c.v.soort === "orden") continue;
      if (!over.includes(goed)) fouten.push(`${waar}: het goede antwoord valt weg na "${kaal(`${e} ${h}`)}" (de zin klopt niet)`);
      const tweeKeuzes = !!f.noot && /2 keuzes|nog 1 getal over/.test(f.noot);
      /* Ook als er door de vraag zelf al maar 1 keuze over is: de zin zegt niet hoeveel het scheelt ("1 streepje", "vlak na"). */
      if (tweeKeuzes && /streepje over|1 streepje|vlak (na|vóór)|1 groter|1 verder/.test(kaal(`${e} ${h}`))) fouten.push(`${waar}: "${kaal(`${e} ${h}`)}" zegt hoeveel het scheelt (dan is het antwoord verklapt)`);
      if (over.length <= 1 && !tweeKeuzes) fouten.push(`${waar}: na "${kaal(`${e} ${h}`)}" blijft alleen ${over.join("")} over`);
      /* Bijna en dichtbij: alleen als er dan nog 2 keuzes dichtbij (hooguit 2 ernaast) over zijn. */
      if ((E.nabij || H.nabij) && over.filter((k) => Math.abs(Number(k) - c.X) <= 2).length < 2) fouten.push(`${waar}: "${kaal(`${e} ${h}`)}" zegt bijna of dichtbij, maar dan is er nog maar 1 keuze dichtbij`);
      /* De code zegt hetzelfde als de zinnen (voor de tabel). */
      if (c.v.soort !== "wie" && over.slice().sort().join() !== f.over.slice().sort().join() && over.length < f.over.length) fouten.push(`${waar}: de zinnen laten minder keuzes over (${over.join(", ")}) dan de code zegt (${f.over.join(", ")}): "${kaal(`${e} ${h}`)}"`);
    }
  }
  /* De 2e keer: uitleg en "weer" zijn geen opdracht (daarna doet Bliepo het samen voor), en alles past. */
  for (const [naam, lijst] of lijsten.slice(2)) for (const z of lijst) for (const stuk of stukjes(z)) if (GEBIEDEND.test(stuk)) fouten.push(`${waar} ${naam}: een opdracht bij de 2e keer: "${kaal(z)}"`);
  const paren = (naam: string, eersten: string[], daarna: string[]) => {
    for (const e of eersten) {
      const kan = daarna.filter((u) => !deeltGetal(e, u) && lengte(e, u) <= MAX_REACTIE);
      if (!kan.length) fouten.push(`${waar} ${naam}: achter "${kaal(e)}" past geen uitleg (te lang, of hetzelfde getal 2 keer achter elkaar)`);
    }
  };
  if (kanWeer) paren("weer", V.weerEerste, V.weerUitleg);
  paren("weer gekozen", weerGekozen, V.uitlegLos);
  for (const z of weerGekozen) algemeen(`${waar} weer gekozen`, z);
}

let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "orden" ? volgordes(v).length - 1 : v.opties.length - 1;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const c: C = { v, x: a, X: v.soort === "orden" || v.soort === "wie" ? NaN : Number(a), raket: v.raketje ?? NaN, g: Number(v.goed), f, xs: v.soort === "orden" ? a.split(",").map(Number) : [] };
    keurFout(`${v.id} ${a}`, c, v.soort === "orden" ? [] : v.opties, v.goed, REGELS, ZIN.weerGekozen(a, v));
    /* Het rondje staat nooit om het antwoord. */
    if (f.licht?.soort === "getal" && String(f.licht.n) === v.goed) fouten.push(`${v.id} ${a}: het rondje staat om het antwoord`);
    if (f.licht?.soort === "getal" && !(v.labels ?? []).includes(f.licht.n)) fouten.push(`${v.id} ${a}: het rondje staat om ${f.licht.n}, maar dat staat niet op de lijn`);
  }
  /* De reactie bij goed noemt alleen getallen die bij de vraag horen. */
  const g = v.soort === "wie" || v.soort === "orden" ? NaN : Number(v.goed);
  const mag = new Set<number>([g, g - 1, g + 1, 1, 2, v.n ?? -1, anker(v), ...(v.meer ? [v.meer.a, v.meer.b] : []), ...(v.soort === "orden" ? v.goed.split(",").map(Number) : []), ...(v.soort === "dichtst" ? [Math.abs(g - v.n!)] : [])]);
  const reactie = lijnReactie(v).zinnen;
  if (!reactie.every((z) => getallenIn(z).every((n) => mag.has(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
  rijtje(`${v.id} reactie na lof`, reactie, 5);
  /* Het samen voordoen: elke variant klopt en eindigt bij het goede antwoord. */
  if (v.soort !== "orden") {
    const doel = ZIN.samenDoel(v);
    const begin = ZIN.samenBegin(v);
    rijtje(`${v.id} samen: bij het doel`, doel);
    rijtje(`${v.id} samen: begin`, begin);
    const s = sprongStart(v);
    for (const z of begin) if (!getallenIn(z).includes(s)) fouten.push(`${v.id}: samenBegin noemt het begin van de sprongen (${s}) niet: "${kaal(z)}"`);
    for (const z of doel) {
      if (v.soort === "dichtst") {
        const d = Math.abs(Number(v.goed) - v.n!);
        if (!new RegExp(`maar ${d} sprong${d === 1 ? "\\b" : "en"}`).test(kaal(z))) fouten.push(`${v.id}: samenDoel telt de sprongen niet goed: "${kaal(z)}"`);
        if (!begin.every((b) => getallenIn(b).includes(Number(v.goed)) && getallenIn(b).includes(v.n!))) fouten.push(`${v.id}: samenBegin noemt de 2 getallen niet`);
      } else if (v.soort === "wie") {
        if (!getallenIn(z).includes(v.n!) || !kaal(z).includes(v.goed)) fouten.push(`${v.id}: samenDoel noemt het getal of het ding niet: "${kaal(z)}"`);
      } else if (!getallenIn(z).includes(Number(v.goed))) fouten.push(`${v.id}: samenDoel noemt het antwoord niet: "${kaal(z)}"`);
    }
    /* De sprongen bij het samen voordoen beginnen bij een getal dat je ziet (of bij het doel bij "dichtst"). */
    if (v.soort !== "dichtst" && v.soort !== "meer" && !(v.labels ?? []).includes(s)) fouten.push(`${v.id}: het samen springen begint bij ${s}, maar dat staat niet op de lijn`);
  }
  /* Achter elkaar klinkt een getal niet 2 keer: de rij uitingen van het samen voordoen, voor elke variant. */
  const rij: string[][] = [];
  if (v.soort === "orden") {
    const goed = v.goed.split(",").map(Number);
    for (let i = 1; i < goed.length - 1; i++) rij.push(ZIN.samenOrden(goed[i - 1], goed[i], i === 1));
  } else {
    const doel = v.soort === "wie" ? v.n! : v.soort === "meer" ? v.meer!.b : v.soort === "dichtst" ? v.n! : Number(v.goed);
    const start = sprongStart(v);
    const stap = Math.sign(doel - start) || 1;
    rij.push(ZIN.samenBegin(v));
    let i = 0;
    for (let k = start + stap; stap > 0 ? k < doel : k > doel; k += stap) rij.push([v.soort === "dichtst" ? ZIN.samenTelSprong(++i) : ZIN.samenSprong(k)]);
    rij.push(ZIN.samenDoel(v));
  }
  rij.push(ZIN.samenStap(v));
  rij.forEach((nu, k) => {
    if (k === 0) return;
    for (const a of rij[k - 1]) for (const b of nu) if (deeltGetal(laatsteStuk(a), eersteStuk(b))) fouten.push(`${v.id} samen voordoen: een getal 2 keer achter elkaar: "${kaal(a)}" en dan "${kaal(b)}"`);
  });
  /* Na de hint komt de vraag in andere woorden terug: ook daar geen getal 2 keer achter elkaar. */
  for (const f of Object.values(tabel)) for (const h of f.v?.hint ?? []) for (const o of ZIN.opnieuw(v)) if (deeltGetal(laatsteStuk(h), eersteStuk(o))) fouten.push(`${v.id}: een getal 2 keer achter elkaar: hint "${kaal(h)}" en dan "${kaal(o)}"`);
  /* De varianten per vraag: genoeg, geen 2 dezelfde, en een opdracht zegt wat het kind doet (F16). */
  const opdrachten: [string, string[]][] = [["de vraag opnieuw", ZIN.opnieuw(v)], ["samen: de kleine stap", ZIN.samenStap(v)], ["samen: hulphandje", ZIN.samenHand(v)]];
  for (const [naam, lijst] of opdrachten) {
    rijtje(`${v.id} ${naam}`, lijst);
    for (const z of lijst) if (!OPDRACHT.test(kaal(z))) fouten.push(`${v.id} ${naam}: zegt niet wat het kind doet (F16): "${kaal(z)}"`);
  }
  for (const [naam, lijst, min] of [["samen: begin (kom, we …)", ZIN.samen(v), 3], ["samen: klaar", ZIN.samenKlaar(v), 2], ["samen: Bliepo deed het zelf", ZIN.samenZelf(v), 2], ["hetzelfde antwoord 2 keer", ZIN.weerGekozen(v.soort === "orden" ? "x" : v.soort === "wie" ? "ufo" : "7", v), 2]] as [string, string[], number][]) rijtje(`${v.id} ${naam}`, lijst, min);
  /* Na het vangnet geen "Ja" alsof het kind het deed. */
  for (const z of ZIN.samenZelf(v)) if (/^(Ja|Precies|Goed)\b/.test(z)) fouten.push(`${v.id}: samenZelf begint met lof: "${z}"`);
}
/* De uitlegvraag na Nee (3 sprongen vanaf de 0). */
for (const x of UITLEG_VRAAG.opties.filter((o) => o !== UITLEG_VRAAG.goed)) {
  const f = uitlegFout(x);
  telling++;
  const c: C = { v: VRAGEN[0], x, X: Number(x), raket: 3, g: 3, f, xs: [] };
  keurFout(`uitlegvraag ${x}`, c, UITLEG_VRAAG.opties, UITLEG_VRAAG.goed, REGELS_UITLEG, ZIN.weerGekozen(x, VRAGEN[0]));
  /* "Je telde de getallen 0, 1, 2 en 3" noemt de getallen op de lijn (zoals Synthesis), niet het aantal sprongen. */
  for (const z of [...f.v!.eerste, ...f.v!.hint]) if (/3 sprong|sprongen: 3|3 bogen|3 keer/.test(kaal(z)) || (x === "2" && getallenIn(z).includes(3))) fouten.push(`uitlegvraag ${x}: noemt het antwoord 3: "${kaal(z)}"`);
  if (f.over.length < 2 || !f.over.includes("3")) fouten.push(`uitlegvraag ${x}: verklapcontrole`);
}

/* 4. De vaste varianten: genoeg, geen 2 dezelfde, geen "fout", en elke opdracht zegt wat het kind doet (F16). */
const plat = (l: string[][]) => l.map((x) => x.join(" "));
const VAST: [string, string[], number, boolean][] = [
  ["begin (met de startvraag)", ZIN.start, 2, true],
  ["proef: begin", ZIN.proefBegin, 2, false],
  ["proef: goed", ZIN.proefGoed, 2, false],
  ["proef: nog lastig", plat(ZIN.proefLastig), 2, false],
  ["uitleg: samen beginnen", ZIN.samenBeginnen, 2, false],
  ["uitleg: de getallenlijn", plat(ZIN.uitlegLijn), 2, false],
  ["uitleg: het raketje bij de 0", ZIN.uitlegStart, 2, false],
  ["uitleg: opdracht springen", plat(ZIN.uitlegSpring), 2, true],
  ["uitleg: hulphandje bij het springen", ZIN.uitlegSpringHand, 2, true],
  ["uitleg: een sprong overgeslagen", plat(ZIN.uitlegOverslaan), 2, true],
  ["uitleg: nog een keer overgeslagen", plat(ZIN.uitlegOverslaanWeer), 2, true],
  ["uitleg: het hele stuk in 1 keer", plat(ZIN.uitlegHeleStuk), 2, true],
  ["uitleg: Bliepo springt zelf", ZIN.uitlegSpringZelf, 2, false],
  ["uitleg: waarom (na goed)", ZIN.uitlegWaarom, 2, false],
  ["uitleg: samen de bogen tellen", ZIN.uitlegSamen, 3, false],
  ["uitleg: na het tellen van de bogen", ZIN.uitlegSamenKlaar, 2, false],
  ["uitleg: de kleine stap", ZIN.uitlegSamenStap, 2, true],
  ["uitleg: hulphandje bij de kleine stap", ZIN.uitlegSamenHand, 2, true],
  ["uitleg: na de kleine stap", ZIN.uitlegSamenNa, 2, false],
  ["uitleg: Bliepo deed de stap zelf", ZIN.uitlegSamenZelf, 2, false],
  ["uitleg: nu jij", ZIN.nuJij, 2, false],
  ["op volgorde: hulphandje", ZIN.ordenHand, 2, true],
  ["ongeveer, samen: de streepjes erbij", ZIN.samenStreepjes, 2, false],
  ["hulphandje: aanmoediging", AANMOEDIG_TIKKEN, 3, false],
  ["slot", ZIN.slot, 2, false],
  ["de kaart", ZIN.kaartTik, 2, true],
];
for (const [naam, lijst, min, opdracht] of VAST) {
  rijtje(naam, lijst, min);
  if (opdracht) for (const z of lijst) if (!OPDRACHT.test(kaal(z))) fouten.push(`${naam}: zegt niet wat het kind doet (F16): "${kaal(z)}"`);
}
/* De beginzin (met de groet erboven) en de slotzin: niet langer dan de eerste versie, die in het tekstvak paste (15.30). */
for (const z of ZIN.start) if (lengte(z) > 79) fouten.push(`begin: te lang voor het tekstvak met de groet erboven (${lengte(z)} tekens, hooguit 79): "${z}"`);
for (const z of ZIN.slot) if (lengte(z) > 53) fouten.push(`slot: te lang (${lengte(z)} tekens, hooguit 53): "${z}"`);
for (const z of [ZIN.uitlegVraag, ZIN.uitlegVraagOpnieuw, ZIN.ordenHoe]) {
  algemeen("vaste zin", z);
  if (!OPDRACHT.test(z)) fouten.push(`vaste zin: zegt niet wat het kind doet (F16): "${z}"`);
}
/* Het hulphandje zegt een aanmoediging + een opdracht in 1 keer: ook dat past, en de opdracht blijft een opdracht. */
for (const a of AANMOEDIG_TIKKEN) for (const z of [...ZIN.ordenHand, ...ZIN.uitlegSpringHand, ...ZIN.uitlegSamenHand, ...VRAGEN.flatMap((v) => ZIN.samenHand(v))]) if (lengte(a, z) > MAX_REACTIE) fouten.push(`hulphandje te lang: "${a} ${kaal(z)}"`);
/* De uitleg: na "1. 2. 3." en na de waarom-zin klinkt het getal niet meteen nog een keer. */
for (const z of ZIN.uitlegSamenKlaar) if (getallenIn(z).includes(3)) fouten.push(`uitleg: na het tellen (1, 2, 3) noemt "${z}" de 3 nog een keer`);
for (const z of [...ZIN.uitlegSamenNa, ...ZIN.uitlegSamenZelf]) if (getallenIn(z).length) fouten.push(`uitleg: "${kaal(z)}" noemt een getal dat net gezegd is`);
for (const z of ZIN.uitlegSamenZelf) if (/^(Ja|Precies|Goed)\b/.test(z)) fouten.push(`uitleg: na het vangnet begint "${z}" met lof`);

/* 5. NOOIT 2 KEER HETZELFDE: de kiezer 20.000 keer naspelen met willekeurige vragen en keuzes (dezelfde functie als de les). */
let gespeeld = 0;
{
  let zaad = 20261118;
  const toeval = () => ((zaad = (zaad * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const kiezer = maakKiezer({ wissel: WISSELWOORDEN, toeval });
  const vorige = new Map<string, string>();
  let melding = 0;
  const kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = kiezer.kies(sleutel, zinnen, mag);
    if (vorige.get(sleutel) === vorm(z) && melding++ < 5) fouten.push(`kiezer: 2 keer achter elkaar dezelfde zin bij "${sleutel}": "${kaal(z)}"`);
    vorige.set(sleutel, vorm(z));
    return z;
  };
  const pak = <T,>(l: T[]) => l[Math.floor(toeval() * l.length)];
  const reactieOk = (waar: string, zinnen: string[]) => {
    if (lengte(...zinnen) > MAX_REACTIE && melding++ < 5) fouten.push(`kiezer: te lang (${lengte(...zinnen)} tekens) bij ${waar}: "${kaal(zinnen.join(" "))}"`);
    if (zinnen.length === 2 && (vorm(zinnen[0]) === vorm(zinnen[1]) || deeltGetal(zinnen[0], zinnen[1])) && melding++ < 5) fouten.push(`kiezer: 2 keer hetzelfde (zin of getal) in 1 reactie bij ${waar}: "${kaal(zinnen.join(" "))}"`);
  };
  for (let i = 0; i < 20000; i++) {
    /* Soms de uitlegvraag, meestal een van de 15 vragen. */
    const uitleg = toeval() < 0.08;
    const v = uitleg ? VRAGEN[0] : pak(VRAGEN);
    const tabel = uitleg ? Object.fromEntries(UITLEG_VRAAG.opties.filter((o) => o !== UITLEG_VRAAG.goed).map((o) => [o, uitlegFout(o)])) : foutenVan(v);
    const x1 = pak(Object.keys(tabel));
    const f1 = tabel[x1];
    const z1 = foutReactie(kies, f1, 1, null, false, "", ZIN.weerGekozen(x1, v));
    reactieOk(`${v.id} ${x1} (1e keer)`, z1);
    if (!uitleg) kies("opnieuw", ZIN.opnieuw(v));
    gespeeld++;
    /* De helft van de keren ook de 2e keer mis (hetzelfde of een ander antwoord). */
    if (toeval() < 0.5) continue;
    const x2 = pak(Object.keys(tabel));
    const z2 = foutReactie(kies, tabel[x2], 2, f1, x2 === x1, z1[0], ZIN.weerGekozen(x2, v));
    reactieOk(`${v.id} ${x1} en dan ${x2} (2e keer)`, z2);
    if (z2.some((z) => z1.includes(z)) && melding++ < 5) fouten.push(`kiezer: bij de 2e keer dezelfde zin als bij de 1e keer (${v.id} ${x1} en dan ${x2}): "${kaal(z2.join(" "))}"`);
    kies("samen", uitleg ? ZIN.uitlegSamen : ZIN.samen(v));
    gespeeld++;
  }
  /* Elke vraag kan zo tot een reactie komen die past (de les kiest alleen varianten die passen). */
  void passend;
  void zonderGetalUit;
}

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + de uitlegvraag, ${telling} foute antwoorden in de tabel, ${varianten} varianten nagelopen, ${waarheid} beweringen, ${combinaties} combinaties van eerste zin + hint, kiezer ${gespeeld} keer nagespeeld).`);

/* 6. De tabel (met van elk rijtje 1 vaste variant; alle varianten staan in §6 van de tabel). */
const vast = <T,>(l: T[], v: Vraag) => l[v.nr % l.length];
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
    return `${vast(ZIN.samen(v), v)} ${g.slice(1, -1).map((n, i) => kaal(vast(ZIN.samenOrden(+g[i], +n, i === 0), v))).join(" ")} — ${kaal(vast(ZIN.samenStap(v), v))} — ${kaal(vast(ZIN.samenKlaar(v), v))}`;
  }
  const doel = v.soort === "wie" ? v.n! : v.soort === "meer" ? v.meer!.b : v.soort === "dichtst" ? v.n! : Number(v.goed);
  const start = sprongStart(v);
  const stap = Math.sign(doel - start) || 1;
  const sprongen: string[] = [];
  let i = 0;
  for (let k = start + stap; stap > 0 ? k < doel : k > doel; k += stap) sprongen.push(v.soort === "dichtst" ? String(++i) : String(k));
  return `${vast(ZIN.samen(v), v)} ${v.soort === "ongeveer" ? `${vast(ZIN.samenStreepjes, v)} ` : ""}${kaal(vast(ZIN.samenBegin(v), v))} [sprongen met bogen: ${start} → ${doel}${sprongen.length ? `; Bliepo zegt ${sprongen.join(", ")}` : ""}] ${kaal(vast(ZIN.samenDoel(v), v))} — ${kaal(vast(ZIN.samenStap(v), v))} — ${kaal(vast(ZIN.samenKlaar(v), v))}`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
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
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen gaan weg (bij "wat staat er bij" gaat het vinkje weg; bij op volgorde blijven de kaarten even liggen en glijden daarna terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om het getal (of vak, of bordje) dat hij noemt, nooit om het antwoord, en alleen als hij dat getal ook echt noemt. Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw. Zo staat er altijd een vraag of opdracht in beeld (15.37, F16).
- **Verklappen (15.17), strenger sinds 18 november 2026:** de eerste zin zegt alleen wat zeker is over wat het kind koos (het raketje staat verder, of minder ver); er blijven altijd 2 keuzes over (bij "wat is meer" zijn er maar 2 keuzes en bij "na 10" valt de 1 al af door de vraag: dan noemt Bliepo alleen de regel of de kant). Bij de 1e keer zegt hij nooit "vlak vóór", "vlak na" of "1 streepje" (dan weet je het antwoord), en "bijna" of "dichtbij" alleen als er dan nog 2 keuzes dichtbij zijn. De hint telt vanaf een getal dat geen keuze is die nog over is, en zegt nooit hoeveel streepjes het is. Het script rekent dat voor ELKE variant na.
- **2e fout:** een korte uitleg bij de denkfout (1 reactie; nu mag "1 streepje", want het antwoord komt daarna toch in beeld), dan samen: Bliepo zet de getallen klaar en springt over de lijn, 1 per keer, elke sprong krijgt een boog die blijft staan (draaiboek §0, §3 E.3). Bij het doel komt het getal op de lijn (nu pas het antwoord in beeld). Dan de kleine stap: het kind tikt het getal (of het ding) aan, of sleept de laatste kaart in het vak (het hulphandje komt vanzelf na ± 6 s). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" ("Je tikte weer op …", "Je legde ze weer zo neer."), met een uitleg zonder dat getal.
- **Nooit 2 keer hetzelfde:** elke zin heeft varianten (§6); de les kiest steeds een andere dan de vorige keer, ook over vragen heen. Een getal klinkt niet 2 keer achter elkaar.
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

## 3. De hint per vraag (1 vaste variant; alle hints staan in §6)

| Vraag | Soort | Hint |
|---|---|---|
${hints}

## 4. De uitlegvraag na Nee: "Hoeveel sprongen maakte het raketje?" (3 sprongen van de 0 naar de 3; keuzes 2 / 3 / 4)

| Fout antwoord | Denkfout | Eerste zin | Hint | Uitleg na de 2e fout | Bron |
|---|---|---|---|---|---|
${uitlegRijen}

Bij de 2e fout zegt Bliepo "${ZIN.uitlegSamen[0]}", telt hij de bogen (1, 2, 3; het rondje staat even om het getal waar elke boog landt), zegt "${ZIN.uitlegSamenKlaar[0]}" en het kind tikt de 3 aan ("${kaal(ZIN.uitlegSamenStap[0])}"). Daarna: "${ZIN.uitlegSamenNa[0]}" (na het vangnet: "${ZIN.uitlegSamenZelf[0]}"). Bij goed: een lofzin en "${kaal(ZIN.uitlegWaarom[0])}"

Bij het springen in de uitleg (draaiboek §3 B): alleen de getallen 1, 2 en 3 zijn wit en tikbaar. Tikt het kind een getal verder dan het volgende (een sprong overslaan), dan blijft het raketje staan en zegt Bliepo "${ZIN.uitlegOverslaan[0].join(" ")}" (bij de 3 in 1 keer: "${ZIN.uitlegHeleStuk[0].join(" ")}"; de 2e keer: "${ZIN.uitlegOverslaanWeer[0].join(" ")}"). Elke variant eindigt met wat het kind doet, want de les wacht daarna op een tik (F16). Na 3 keer, of 20 s niets, springt Bliepo zelf: "${ZIN.uitlegSpringZelf[0]}" Dit telt niet als fout (geen rood scherm), zoals bij Synthesis.

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
const lijst = (naam: string, l: string[]) => `| ${naam} | ${l.map(kaal).join(" / ")} |`;
const F = (nr: number, x: string) => foutenVan(VRAGEN[nr - 1])[x].v!;
const V = (nr: number) => VRAGEN[nr - 1];
const alleVarianten = [
  ...VAST.map(([naam, l]) => lijst(naam, l)),
  lijst("de vraag opnieuw: bij welk getal", ZIN.opnieuw(V(1))),
  lijst("de vraag opnieuw: na 10", ZIN.opnieuw(V(4))),
  lijst("de vraag opnieuw: wat is meer", ZIN.opnieuw(V(5))),
  lijst("de vraag opnieuw: op volgorde", ZIN.opnieuw(V(6))),
  lijst("de vraag opnieuw: wat staat er bij", ZIN.opnieuw(V(10))),
  lijst("de vraag opnieuw: het dichtst bij", ZIN.opnieuw(V(12))),
  lijst("de vraag opnieuw: ongeveer", ZIN.opnieuw(V(14))),
  lijst("1e keer, eerste zin: vóór het raketje, met bijna (vraag 1, koos 5)", F(1, "5").eerste),
  lijst("1e keer, eerste zin: vóór het raketje, zonder bijna (vraag 2, koos 1)", F(2, "1").eerste),
  lijst("1e keer, eerste zin: na het raketje, met bijna (vraag 1, koos 7)", F(1, "7").eerste),
  lijst("1e keer, eerste zin: te ver (vraag 2, koos 4)", F(2, "4").eerste),
  lijst("1e keer, eerste zin: zonder richting (vraag 9, koos 17)", F(9, "17").eerste),
  lijst("1e keer, eerste zin: niet op de lijn (vraag 8, koos 4)", F(8, "4").eerste),
  lijst("1e keer, eerste zin: na 10, te ver (koos 12)", F(4, "12").eerste),
  lijst("1e keer, eerste zin: na 10, vooraan (koos 1)", F(4, "1").eerste),
  lijst("1e keer, eerste zin: wat is meer (koos 13)", F(5, "13").eerste),
  lijst("1e keer, eerste zin: op volgorde, getal overgeslagen (5, 7, 6, 8)", F(6, "5,7,6,8").eerste),
  lijst("1e keer, eerste zin: op volgorde, van groot naar klein (5, 8, 7, 6)", F(6, "5,8,7,6").eerste),
  lijst("1e keer, eerste zin: wat staat er bij 17 (tikte op de ufo)", F(10, "ufo").eerste),
  lijst("1e keer, eerste zin: wat staat er bij 17 (tikte op het ruimteschip)", F(10, "satelliet").eerste),
  lijst("1e keer, eerste zin: het dichtst bij 20 (koos 8)", F(12, "8").eerste),
  lijst("1e keer, eerste zin: ongeveer (vraag 14, koos 16)", F(14, "16").eerste),
  lijst("1e keer, eerste zin: ongeveer (vraag 15, koos 13)", F(15, "13").eerste),
  lijst("hint: bij welk getal (vraag 1, koos 7)", F(1, "7").hint),
  lijst("hint: bij welk getal, zonder richting (vraag 9, koos 17)", F(9, "17").hint),
  lijst("hint: na 10", F(4, "12").hint),
  lijst("hint: wat is meer", F(5, "13").hint),
  lijst("hint: op volgorde", F(6, "5,7,6,8").hint),
  lijst("hint: wat staat er bij 17", F(10, "ufo").hint),
  lijst("hint: het dichtst bij", F(12, "8").hint),
  lijst("hint: ongeveer", F(14, "16").hint),
  lijst("2e keer, uitleg: 1 streepje vóór het raketje (vraag 1, koos 5)", F(1, "5").uitleg),
  lijst("2e keer, uitleg: 1 streepje na het raketje (vraag 1, koos 7)", F(1, "7").uitleg),
  lijst("2e keer, uitleg: te ver (vraag 2, koos 4)", F(2, "4").uitleg),
  lijst("2e keer, uitleg: niet op de lijn (vraag 8, koos 4)", F(8, "4").uitleg),
  lijst("2e keer, uitleg: na 10 (koos 12 / koos 1)", [...F(4, "12").uitleg, ...F(4, "1").uitleg]),
  lijst("2e keer, uitleg: wat is meer", F(5, "13").uitleg),
  lijst("2e keer, uitleg: op volgorde (overgeslagen / van groot naar klein)", [...F(6, "5,7,6,8").uitleg, ...F(6, "5,8,7,6").uitleg]),
  lijst("2e keer, uitleg: wat staat er bij 17 (ufo)", F(10, "ufo").uitleg),
  lijst("2e keer, uitleg: het dichtst bij 20 (koos 8)", F(12, "8").uitleg),
  lijst("2e keer, uitleg: ongeveer (vraag 14, koos 16)", F(14, "16").uitleg),
  lijst("2e keer, hetzelfde antwoord: \"Je koos weer …\"", [...ZIN.weerGekozen("7", V(1)), ...ZIN.weerGekozen("ufo", V(10)), ...ZIN.weerGekozen("x", V(6))]),
  lijst("2e keer, hetzelfde antwoord: de uitleg erachter (bij welk getal: ervoor / erna / te ver / niet op de lijn)", [...F(1, "5").uitlegLos, ...F(1, "7").uitlegLos, ...F(2, "4").uitlegLos, ...F(8, "4").uitlegLos]),
  lijst("2e keer, hetzelfde antwoord: de uitleg erachter (na 10 / meer / dichtst bij / ongeveer)", [...F(4, "12").uitlegLos, ...F(5, "13").uitlegLos, ...F(12, "8").uitlegLos, ...F(14, "16").uitlegLos]),
  lijst("2 keer dezelfde denkfout: vóór het raketje (vraag 1, koos 5)", [...F(1, "5").weerEerste, ...F(1, "5").weerUitleg]),
  lijst("2 keer dezelfde denkfout: na het raketje (vraag 1, koos 7)", [...F(1, "7").weerEerste, ...F(1, "7").weerUitleg]),
  lijst("2 keer dezelfde denkfout: niet op de lijn", [...F(8, "4").weerEerste, ...F(8, "4").weerUitleg]),
  lijst("2 keer dezelfde denkfout: na 10, vooraan", [...F(4, "1").weerEerste, ...F(4, "1").weerUitleg]),
  lijst("2 keer dezelfde denkfout: op volgorde (overgeslagen)", [...F(6, "5,7,6,8").weerEerste, ...F(6, "5,7,6,8").weerUitleg]),
  lijst("2 keer dezelfde denkfout: op volgorde (van groot naar klein)", [...F(6, "5,8,7,6").weerEerste, ...F(6, "5,8,7,6").weerUitleg]),
  lijst("2 keer dezelfde denkfout: wat staat er bij 17 (ufo)", [...F(10, "ufo").weerEerste, ...F(10, "ufo").weerUitleg]),
  lijst("samen voordoen: begin (springen / op volgorde / dichtst bij)", [...ZIN.samen(V(1)), ...ZIN.samen(V(6)), ...ZIN.samen(V(12))]),
  lijst("samen: waar de sprongen beginnen (vraag 1 / wat is meer / dichtst bij)", [...ZIN.samenBegin(V(1)), ...ZIN.samenBegin(V(5)), ...ZIN.samenBegin(V(12))]),
  lijst("samen: bij het doel (vraag 1)", ZIN.samenDoel(V(1))),
  lijst("samen: bij het doel (wat is meer)", ZIN.samenDoel(V(5))),
  lijst("samen: bij het doel (wat staat er bij 17)", ZIN.samenDoel(V(10))),
  lijst("samen: bij het doel (dichtst bij 20 / dichtst bij 10)", [...ZIN.samenDoel(V(12)), ...ZIN.samenDoel(V(13))]),
  lijst("samen: op volgorde, de kaarten (5, 6, 7)", [...ZIN.samenOrden(5, 6, true), ...ZIN.samenOrden(6, 7, false)]),
  lijst("samen: de kleine stap (getal / wat is meer / ding / kaart)", [...ZIN.samenStap(V(1)), ...ZIN.samenStap(V(5)), ...ZIN.samenStap(V(10)), ...ZIN.samenStap(V(6))]),
  lijst("samen: hulphandje (getal / ding / kaart)", [...ZIN.samenHand(V(1)), ...ZIN.samenHand(V(10)), ...ZIN.samenHand(V(6))]),
  lijst("samen: klaar (vraag 1 / na 10 / meer / op volgorde / ding / dichtst bij)", [...ZIN.samenKlaar(V(1)), ...ZIN.samenKlaar(V(4)), ...ZIN.samenKlaar(V(5)), ...ZIN.samenKlaar(V(6)), ...ZIN.samenKlaar(V(10)), ...ZIN.samenKlaar(V(12))]),
  lijst("samen: Bliepo deed de stap zelf (getal / kaart / ding)", [...ZIN.samenZelf(V(1)), ...ZIN.samenZelf(V(6)), ...ZIN.samenZelf(V(10))]),
  lijst("reactie na lof: bij welk getal (vraag 1)", lijnReactie(V(1)).zinnen),
  lijst("reactie na lof: na 10", lijnReactie(V(4)).zinnen),
  lijst("reactie na lof: wat is meer", lijnReactie(V(5)).zinnen),
  lijst("reactie na lof: op volgorde", lijnReactie(V(6)).zinnen),
  lijst("reactie na lof: wat staat er bij 17", lijnReactie(V(10)).zinnen),
  lijst("reactie na lof: het dichtst bij 20", lijnReactie(V(12)).zinnen),
  lijst("reactie na lof: ongeveer (vraag 14)", lijnReactie(V(14)).zinnen),
  ...UITLEG_VRAAG.opties.filter((o) => o !== UITLEG_VRAAG.goed).flatMap((x) => {
    const u = uitlegFout(x).v!;
    return [lijst(`uitlegvraag, koos ${x}: eerste zin`, u.eerste), lijst(`uitlegvraag, koos ${x}: hint`, u.hint), lijst(`uitlegvraag, koos ${x}: uitleg bij de 2e keer`, [...u.uitleg, ...u.uitlegLos]), lijst(`uitlegvraag, koos ${x}: 2 keer dezelfde denkfout`, [...u.weerEerste, ...u.weerUitleg])];
  }),
].join("\n");
const vragenlijst = VRAGEN.map((v) => `| ${v.nr} | ${soortNaam[v.soort]} | ${kaal(ZIN.vraag(v).join(" "))}${v.soort === "orden" && v.nr === 6 ? ` ${ZIN.ordenHoe}` : ""} |`).join("\n");
const tekstMetVarianten = `${tekst}
## 6. Alle varianten (18 november 2026: Bliepo als warme juf; nooit 2 keer achter elkaar dezelfde zin)

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. "Je koos 7." en "Je koos 4." tellen als dezelfde zin, net als "Je tikte weer op de ufo." en "Je tikte weer op het raketje.". In §1 t/m §4 hierboven staat steeds 1 vaste variant; hier staan ze allemaal (met voorbeeldgetallen). Het script loopt ELKE variant na (zie bovenaan het script): waar, niets verklapt, geen getal 2 keer achter elkaar, geen opdracht bij de 2e keer, elke opdracht zegt wat het kind doet, alles past in het tekstvak (hooguit ${MAX_REACTIE} tekens per reactie). Oud naast nieuw: WIJZIGINGEN-ZINNEN-GETALLENLIJN.md.

| Situatie | Varianten |
|---|---|
${alleVarianten}

## 7. De 15 vragen (de zinnen van de vraag zelf; geen varianten: dezelfde soort vraag heet overal hetzelfde, BOUWREGELS 3.11)

Volgt een vraag op een vraag van dezelfde soort, dan klinkt hij net anders ("nu", "ook deze", "En …"), zodat Bliepo niet 2 keer precies dezelfde zin zegt.

| Vraag | Soort | Wat Bliepo zegt |
|---|---|---|
${vragenlijst}
`;
writeFileSync(new URL("../FOUTTABEL-squla-getallenlijn-kat-1-gouden.md", import.meta.url), tekstMetVarianten);
console.log("FOUTTABEL-squla-getallenlijn-kat-1-gouden.md geschreven.");
