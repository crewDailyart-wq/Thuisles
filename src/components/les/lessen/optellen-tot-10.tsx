/**
 * Lessen van het onderdeel Optellen tot 10 — naar de Synthesis-unit
 * "Add within 10" (INSPIRATIE.md, ronde 1 en ronde 2). Groep 3. Zie ../soort.ts.
 *
 * "Adding below 10" staat apart in ./optellen-onder-10.ts. Hier de andere
 * zeven, in de volgorde van Synthesis:
 * Assessment · Doubles · True or False · Missing Numbers · Add Three Numbers ·
 * Splitting Sums · Mastery Check.
 *
 * Alle lessen met tegels gebruiken het tegelvlak (../vlakken/optellen-tegelvlak):
 * daar kan een tegel óp een andere liggen (bedekken), een lege vorm gevuld
 * worden, en bepaalt de les op welke toren een tegel komt. De som tekent het
 * vlak zelf; het kind typt in het invulvak links (HARDE REGEL 5).
 *
 * Splitting Sums gebruikt de stippen (../vlakken/optellen-stippen).
 *
 * Bij een fout nooit het woord "fout": eerst een richting of de foute som
 * voorrekenen, daarna het antwoord met de reden. "Weet ik niet" → "Geen
 * zorgen" en samen doen. De toetsen geven geen uitleg bij een fout.
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { hoogte, TEGELKLEUR, vorm } from "../tegels";
import { Tegelvlak, zetIn, type Tegeltoren, type Tegelvlakprops } from "../vlakken/optellen-tegelvlak";
import { Stippen, zelfdeGroepen, type Stippenprops } from "../vlakken/optellen-stippen";

/* ====================================================================== */
/* Kleine hulpjes                                                          */
/* ====================================================================== */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

function kies1<T>(lijst: T[]): T {
  return lijst[Math.floor(Math.random() * lijst.length)];
}

function reeks(van: number, tot: number): number[] {
  return Array.from({ length: tot - van + 1 }, (_, i) => van + i);
}

const optel = (delen: number[]) => delen.reduce((a, b) => a + b, 0);

/** "{2} plus {3} plus {4}", voor in een zin. */
const somWoorden = (delen: number[]) => delen.map((n) => `{${n}}`).join(" plus ");

/** "2 + 3 + 4" → [2, 3, 4] */
const losse = (som: string) => som.split("+").map((d) => Number(d.trim()));

/** "de {2} en de {3}", "de {2}, de {3} en de {4}" */
function opsomming(delen: number[]): string {
  const d = delen.map((n) => `de {${n}}`);
  return d.length < 2 ? d.join("") : `${d.slice(0, -1).join(", ")} en ${d[d.length - 1]}`;
}

const G = (n: number): Somdeel => ({ t: "getal", n });
const T = (s: string): Somdeel => ({ t: "teken", s });
const V = (waarde?: string): Somdeel => ({ t: "vak", waarde });

/** Een som voor bovenaan: getallen of vakjes, met plussen en een is-teken. */
function somRij(delen: (number | string | null)[], totaal: number | string | null): Somdeel[] {
  const stuk = (d: number | string | null): Somdeel => (typeof d === "number" ? G(d) : V(d ?? undefined));
  const uit: Somdeel[] = [];
  delen.forEach((d, i) => {
    if (i > 0) uit.push(T("+"));
    uit.push(stuk(d));
  });
  uit.push(T("="), stuk(totaal));
  return uit;
}

const metNaam = (l: Lesgids, zin: string) => (l.naam ? `${zin}, ${l.naam}!` : `${zin}!`);

/** Wacht op iets, en zeg de hulpzinnen als het kind na een tijdje nog niets doet. */
async function metHulp<X>(l: Lesgids, p: Promise<X>, zinnen: string[], ms = 14000): Promise<X> {
  let klaar = false;
  const klok = setTimeout(() => {
    if (!klaar) void l.zeg(...zinnen).catch(() => {});
  }, ms);
  try {
    return await p;
  } finally {
    klaar = true;
    clearTimeout(klok);
  }
}

/* ====================================================================== */
/* Het tegelvlak                                                           */
/* ====================================================================== */

const pas = (l: Lesgids, p: Partial<Tegelvlakprops>) => l.pasVlakAan<Tegelvlakprops>(p);

/** Wat er in het vak ligt; elke verandering gaat meteen naar het scherm. */
class Werkvlak {
  torens: Tegeltoren[] = [];
  constructor(private l: Lesgids) {}

  toon() {
    pas(this.l, { torens: this.torens.map((t) => ({ ...t, stukken: [...t.stukken] })), tel: null });
  }
  zet(torens: Tegeltoren[]) {
    this.torens = torens.map((t) => ({ ...t, stukken: [...t.stukken] }));
    this.toon();
  }
  toren(i: number): Tegeltoren {
    while (this.torens.length <= i) this.torens.push({ stukken: [] });
    return this.torens[i];
  }
  /** Een tegel op toren `i`, netjes zonder gat. */
  leg(i: number, n: number) {
    const t = this.toren(i);
    t.stukken = optel(t.stukken) + n > 16 ? [n] : zetIn(t.stukken, n);
    t.wegLaatste = false;
    this.toon();
  }
  maakLeeg(i: number) {
    this.toren(i).stukken = [];
    this.toon();
  }
  heeftStukken(i: number) {
    return (this.torens[i]?.stukken.length ?? 0) > 0;
  }
  /** Een tegel die niet past: hij verschijnt even bovenop en verdwijnt weer. */
  async evenLaten(i: number, n: number) {
    const t = this.toren(i);
    t.stukken = [...t.stukken, n];
    this.toon();
    await this.l.wacht(650);
    t.wegLaatste = true;
    this.toon();
    await this.l.wacht(420);
    t.stukken = t.stukken.slice(0, -1);
    t.wegLaatste = false;
    this.toon();
  }
}

/** Wacht tot het kind een tegel in het vak zet. */
async function pakTegel(l: Lesgids, hulp?: string[]): Promise<number> {
  const p = l.wachtOpVlak("tegel");
  pas(l, { actief: true });
  const g = hulp ? await metHulp(l, p, hulp) : await p;
  pas(l, { actief: false });
  return Number(g.n);
}

const PAK_HULP = ["Tik op een tegel.", "Tik dan in het vak."];

/** De kleur van een tegel als woord, zoals de begeleider hem noemt ("de gele tegel"). */
const KLEURWOORD: Record<number, string> = {
  1: "rode",
  2: "oranje",
  3: "gele",
  4: "lichtgroene",
  5: "groene",
  6: "lichtblauwe",
  7: "blauwe",
  8: "paarse",
  9: "roze",
  10: "roze",
};

/**
 * Het kind typt een getal, en mag ondertussen tegels neerleggen om te helpen
 * (op toren `i`). Met Maak leeg gaan die tegels weer weg.
 */
async function getalMetTegels(l: Lesgids, vak: Werkvlak, i = 0): Promise<number | null> {
  const antwoord = l.getal().then((v) => ({ t: "getal" as const, v }));
  for (;;) {
    const tegel = l.wachtOpVlak(["tegel", "leeg"]).then((e) => ({ t: "vlak" as const, e }));
    pas(l, { actief: true, leegKnop: vak.heeftStukken(i) });
    const r = await Promise.race([antwoord, tegel]);
    if (r.t === "getal") {
      pas(l, { actief: false, leegKnop: false });
      return r.v;
    }
    if (r.e.soort === "leeg") vak.maakLeeg(i);
    else vak.leg(i, Number(r.e.n));
  }
}

/** De mascotte telt de hokjes van toren `i`, één voor één. */
async function telHokjes(l: Lesgids, i: number, aantal: number, onbedekt = false) {
  for (let tot = 1; tot <= aantal; tot++) {
    pas(l, { tel: { toren: i, tot, onbedekt } });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/**
 * Het kind zet tegels in het vak tot alle `delen` erin liggen (op toren `i`).
 * Een tegel die er niet bij hoort, verschijnt even en verdwijnt weer.
 */
async function zetDelen(l: Lesgids, vak: Werkvlak, i: number, delen: number[], tussendoor: string[][] = []) {
  const over = [...delen];
  let gelegd = 0;
  while (over.length > 0) {
    const n = await pakTegel(l, [`Zet ${opsomming(over)} in het vak.`]);
    const plek = over.indexOf(n);
    if (plek < 0) {
      await vak.evenLaten(i, n);
      await l.zeg(over.length === 1 ? `Zoek de {${over[0]}}.` : `Zoek ${opsomming(over)}.`);
      continue;
    }
    over.splice(plek, 1);
    vak.leg(i, n);
    if (over.length > 0 && tussendoor[gelegd]) await l.zeg(...tussendoor[gelegd]);
    gelegd++;
  }
}

/* ====================================================================== */
/* Toetsen: Assessment en Mastery Check                                    */
/* ====================================================================== */

type Toets = "instap" | "eind";
type Toetsuitslag = "goed" | "herkansing" | "fout" | "stop";

const LES_ONDER_10 = "Optellen onder de 10";
const LES_DUBBELEN = "Dubbelen";
const LES_ONTBREKEND = "Het ontbrekende getal";

/**
 * Een toetsvraag met een getal. Geen uitleg bij een fout.
 * - Instaptoets: de eerste keer "kijk nog eens"; bij de tweede fout stopt de
 *   toets en noemt hij de les waar je dit leert (zoals Synthesis).
 * - Eindtoets: de foute som als vraag en nog een kans; daarna kort het
 *   antwoord, en de toets gaat door.
 */
async function toetsGetal(
  l: Lesgids,
  soort: Toets,
  juist: number,
  o: { vraag: string[]; fout: (x: number) => string; antwoord: string[]; les: string; getal?: () => Promise<number | null> },
): Promise<Toetsuitslag> {
  const lees = o.getal ?? (() => l.getal());
  let x = await lees();
  if (x === juist) return "goed";
  if (soort === "instap") {
    if (x === null) await l.zeg("Geen zorgen.", "Kijk nog eens goed.");
    else await l.zeg(o.fout(x), Math.abs(x - juist) <= 1 ? "Dat is heel dichtbij." : "Hmm, niet helemaal.", "Kijk nog eens.");
    await l.verder();
    await l.zeg(...o.vraag);
    x = await lees();
    if (x === juist) return "herkansing";
    await l.zeg(x === null ? "Geen zorgen." : o.fout(x), "We stoppen de toets hier.", `In de les "${o.les}" leren we dit samen.`);
    return "stop";
  }
  await l.zeg(x === null ? "Geen zorgen." : o.fout(x), "Probeer die nog eens.");
  await l.verder();
  await l.zeg(...o.vraag);
  x = await lees();
  if (x === juist) return "herkansing";
  await l.zeg(...o.antwoord);
  await l.verder();
  return "fout";
}

/** Een toetsvraag met knoppen. Zelfde regels, maar deze vragen stoppen de toets nooit. */
async function toetsKies(
  l: Lesgids,
  soort: Toets,
  juist: string,
  o: { opties: string[]; vraag: string[]; fout: (x: string) => string; antwoord: string[] },
): Promise<Toetsuitslag> {
  let k = await l.kies(o.opties);
  if (k === juist) return "goed";
  if (k === null) await l.zeg("Geen zorgen.", "Kijk nog eens goed.");
  else if (soort === "instap") await l.zeg(o.fout(k), "Weet je het zeker?", "Kijk nog eens.");
  else await l.zeg(o.fout(k), "Probeer die nog eens.");
  await l.verder();
  await l.zeg(...o.vraag);
  k = await l.kies(o.opties.length > 2 ? o.opties.filter((x) => x !== k) : o.opties);
  if (k === juist) return "herkansing";
  await l.zeg(...o.antwoord);
  await l.verder();
  return "fout";
}

/** Assessment en Mastery Check: dezelfde zeven vragen, met andere getallen. */
async function toetsOptellen(l: Lesgids, soort: Toets) {
  const eind = soort === "eind";
  const vak = new Werkvlak(l);
  l.vlak(Tegelvlak, { torens: [], bak: [3, 4, 5, 6] });

  await l.zeg("In deze lessen maak je plussommen onder de {10}.", "Ben je daar al goed in?");
  const al = await l.kies(["Ja", "Nee"]);
  if (al === "Ja") {
    /* Zoals Synthesis: na "ja" mag het kind kiezen tussen de toets en de eerste les. */
    await l.zeg("Mooi.", "Wil je een korte toets doen?", "Of begin je liever bij de eerste les?");
    const keuze = await l.kies(["Toets", "Eerste les"]);
    if (keuze === "Eerste les") {
      vak.zet([]);
      pas(l, { bak: [] });
      await l.zeg("Prima.", `Begin dan met de les "${LES_ONDER_10}".`, "Daar leer je het stap voor stap.");
      return;
    }
    await l.zeg(keuze === "Toets" ? "Goed." : "Dan doen we de toets.", "Laat maar zien wat je kunt.");
  } else {
    await l.zeg("Geen probleem.", "We kijken gewoon wat je al weet.");
  }

  /* 1. Een tegel herkennen. */
  await l.zeg("Oké.", "Zie je de tegels rechts?", "Tik er één aan, of sleep hem in het vak.");
  const a = await pakTegel(l, PAK_HULP);
  vak.zet([{ stukken: [a] }]);
  const vraag1 = ["Welk getal is dit?"];
  await l.zeg(`Goed gekozen, de ${KLEURWOORD[a] ?? ""} tegel.`, ...vraag1);
  let r = await toetsGetal(l, soort, a, {
    vraag: vraag1,
    fout: (x) => `Een {${x}}?`,
    antwoord: [`Het is een {${a}}.`],
    les: LES_ONDER_10,
  });
  if (r === "stop") return;

  /* 2. Twee tegels samen. */
  pas(l, { bak: [2, 3, 4, 5, 6].filter((t) => t !== a) });
  await l.zeg(r === "fout" ? "" : `Ja, het is een {${a}}.`, "Zet er nog een tegel bij.");
  const b = await pakTegel(l, PAK_HULP);
  vak.leg(0, b);
  const vraag2 = [`Wat is {${a}} en {${b}} samen?`];
  await l.zeg(`Dat is een {${b}}.`, ...vraag2);
  r = await toetsGetal(l, soort, a + b, {
    vraag: vraag2,
    fout: (x) => `{${a}} en {${b}} is {${x}}?`,
    antwoord: [`{${a}} en {${b}} is samen {${a + b}}.`],
    les: LES_ONDER_10,
  });
  if (r === "stop") return;
  if (r !== "fout") await l.zeg(metNaam(l, r === "herkansing" ? "Nu klopt het" : "Dat klopt"), `{${a}} en {${b}} is samen {${a + b}}.`);

  /* 3. Een kale som; de tegels mogen helpen. */
  const [p, q] = kies1(eind ? [[4, 2], [2, 5], [3, 4]] : [[6, 2], [2, 6], [4, 2], [3, 5]]);
  vak.zet([]);
  pas(l, { bak: reeks(1, 8) });
  const vraag3 = [`Wat is {${p}} plus {${q}}?`, "Je mag de tegels gebruiken."];
  await l.zeg(eind ? "Oké, nu deze." : "Hier komt de volgende vraag.", ...vraag3);
  r = await toetsGetal(l, soort, p + q, {
    vraag: vraag3,
    fout: (x) => `{${p}} plus {${q}} is {${x}}?`,
    antwoord: [`{${p}} plus {${q}} is {${p + q}}.`],
    les: LES_ONDER_10,
    getal: () => getalMetTegels(l, vak),
  });
  if (r === "stop") return;
  if (r !== "fout") await l.zeg("Precies.", `{${p}} plus {${q}} is {${p + q}}.`);

  /* 4. Verdubbelen. */
  vak.zet([]);
  pas(l, { bak: [3, 4, 5] });
  await l.zeg("Zet nog een tegel in het vak.", "Nu gaan we verdubbelen.");
  const d = await pakTegel(l, PAK_HULP);
  vak.zet([{ stukken: [d] }]);
  const vraag4 = [`Wat is het dubbele van {${d}}?`];
  await l.zeg("Mooie keuze.", ...vraag4);
  r = await toetsGetal(l, soort, 2 * d, {
    vraag: vraag4,
    fout: (x) => `{${x}}?`,
    antwoord: [`Het dubbele van {${d}} is {${2 * d}}.`],
    les: LES_DUBBELEN,
  });
  if (r === "stop") return;
  if (r !== "fout") {
    vak.leg(0, d);
    await l.zeg("Ja, dat klopt.", `Het dubbele van {${d}} is {${2 * d}}.`);
    await l.wacht(600);
  }

  /* 5. Een lastige som over de 10, met knoppen. */
  const [s1, s2] = eind ? [7, 8] : [6, 7];
  /* Echte kinderfouten: er 1 naast, of de 10 vergeten (7 + 8: alleen de 5 die na de 10 komt). */
  const opties5 = eind ? ["5", "14", "15", "16"] : ["3", "12", "13", "14"];
  vak.zet([]);
  pas(l, { raster: false, bak: [], som: somRij([s1, s2], null) });
  const vraag5 = [`Wat is {${s1}} plus {${s2}}?`];
  await l.zeg("Nu een lastige som.", ...vraag5);
  r = await toetsKies(l, soort, String(s1 + s2), {
    opties: opties5,
    vraag: vraag5,
    fout: (x) => `{${s1}} plus {${s2}} is {${x}}?`,
    antwoord: [`{${s1}} plus {${s2}} is {${s1 + s2}}.`],
  });
  pas(l, { som: somRij([s1, s2], s1 + s2) });
  if (r !== "fout") await l.zeg("Goed zo.");

  /* 6. Waar of niet waar. */
  const [w1, w2, wt] = eind ? [3, 8, 11] : [4, 9, 12];
  const waar = w1 + w2 === wt;
  pas(l, { som: somRij([w1, w2], wt) });
  const vraag6 = ["Kijk naar deze som.", "Is hij waar of niet waar?"];
  await l.zeg(...vraag6);
  r = await toetsKies(l, soort, waar ? "Waar" : "Niet waar", {
    opties: ["Waar", "Niet waar"],
    vraag: vraag6,
    fout: () => "Hmm.",
    antwoord: [`{${w1}} plus {${w2}} is {${w1 + w2}}.`, waar ? "Dus de som is *waar*." : "Dus de som is *niet waar*."],
  });
  if (r !== "fout") await l.zeg("Dat klopt.", waar ? `{${w1}} plus {${w2}} is {${wt}}.` : `{${w1}} plus {${w2}} is niet {${wt}}.`);

  /* 7. Aanvullen tot 10: een tegel op de 10. */
  vak.zet([{ onder: [10], stukken: [] }]);
  pas(l, { raster: true, som: null, bak: [3, 4, 6, 7] });
  await l.zeg("Deze keer ligt er een {10} in het vak.", "Leg er een tegel bovenop.");
  const k = await pakTegel(l, PAK_HULP);
  const n = 10 - k;
  vak.leg(0, k);
  pas(l, { som: somRij([k, null], 10) });
  const vraag7 = [`Wat moet er bij de {${k}} om {10} te maken?`];
  await l.zeg("Kijk wat je hebt neergelegd.", ...vraag7);
  r = await toetsGetal(l, soort, n, {
    vraag: vraag7,
    fout: (x) => `{${k}} en {${x}} is {10}?`,
    antwoord: [`Er moet {${n}} bij.`],
    les: LES_ONTBREKEND,
  });
  if (r === "stop") return;
  pas(l, { som: somRij([k, n], 10) });
  if (r !== "fout") {
    await l.zeg("Helemaal goed.", `Het ontbrekende getal is {${n}}.`);
    await l.verder();
  }

  /* Einde: de kaart. */
  vak.zet([]);
  pas(l, { bak: [], som: null });
  const tik = l.kaart();
  await l.zeg(metNaam(l, "Goed gedaan"), "Je kunt plussommen maken tot {10}.", "Tik op de kaart om hem af te vinken.");
  await tik;
}

/* ====================================================================== */
/* Kaarttekeningen (244 × 190)                                             */
/* ====================================================================== */

function Lijntegel({ n, x, y, c = 32 }: { n: number; x: number; y: number; c?: number }) {
  const h = hoogte(n);
  return (
    <g transform={`translate(${x} ${y})`} stroke={TEGELKLEUR[n] ?? "#ffffff"} strokeWidth="3" fill="none" strokeLinejoin="round">
      {vorm(n).map((hk) => (
        <g key={`${hk.k}-${hk.r}`}>
          <rect x={hk.k * c + 1} y={(h - 1 - hk.r) * c + 1} width={c - 2} height={c - 2} rx="3" />
          <circle cx={hk.k * c + c / 2} cy={(h - 1 - hk.r) * c + c / 2} r={c * 0.2} />
        </g>
      ))}
    </g>
  );
}

const kaartLetter = { fill: "#f1f3f8", fontSize: 30, fontWeight: 800, fontFamily: "inherit" } as const;

function KaartKlopt() {
  return (
    <g>
      <Lijntegel n={6} x={34} y={52} />
      <text x={122} y={112} textAnchor="middle" style={kaartLetter}>
        =
      </text>
      <Lijntegel n={2} x={146} y={116} />
      <Lijntegel n={4} x={146} y={50} />
      <text x={20} y={34} style={kaartLetter}>
        ?
      </text>
      <text x={210} y={34} style={kaartLetter}>
        ?
      </text>
    </g>
  );
}

function KaartOntbrekend() {
  return (
    <g>
      <text x={122} y={40} textAnchor="middle" style={kaartLetter}>
        <tspan fill={TEGELKLEUR[4]}>4</tspan> + ? = <tspan fill={TEGELKLEUR[7]}>7</tspan>
      </text>
      <Lijntegel n={4} x={58} y={110} />
      <g stroke={TEGELKLEUR[2]} strokeWidth="3" fill="none" strokeDasharray="5 4">
        <rect x={135} y={79} width={30} height={30} rx="3" />
        <rect x={167} y={111} width={30} height={30} rx="3" />
        <rect x={135} y={111} width={30} height={30} rx="3" />
      </g>
    </g>
  );
}

function KaartDrie() {
  return (
    <g>
      <text x={122} y={40} textAnchor="middle" style={kaartLetter}>
        ? + ? + ?
      </text>
      <Lijntegel n={8} x={30} y={58} c={28} />
      <Lijntegel n={3} x={112} y={114} c={28} />
      <Lijntegel n={1} x={180} y={142} c={28} />
    </g>
  );
}

function KaartStippen() {
  const groep = (n: number, x: number) =>
    Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x + (i % 2) * 24} cy={86 + Math.floor(i / 2) * 24} r={9} fill="none" stroke={TEGELKLEUR[n]} strokeWidth="3" />
    ));
  return (
    <g>
      {groep(3, 22)}
      <text x={82} y={110} textAnchor="middle" style={kaartLetter}>
        +
      </text>
      {groep(2, 104)}
      <text x={164} y={110} textAnchor="middle" style={kaartLetter}>
        +
      </text>
      {groep(2, 186)}
      <text x={122} y={44} textAnchor="middle" style={kaartLetter}>
        7
      </text>
    </g>
  );
}

/* ====================================================================== */
/* 1. Assessment                                                           */
/* ====================================================================== */

const instaptoets: Lesdraaiboek = {
  id: "optellen-tot-10-instaptoets",
  titel: "Instaptoets: optellen tot 10",
  synthesis: "Add within 10 · Assessment",
  kaarttegels: [3, 1],
  speel: (l) => toetsOptellen(l, "instap"),
};

/* ====================================================================== */
/* 2. Doubles                                                              */
/* ====================================================================== */

/** Het kind zet twee dezelfde tegels in het vak. Geeft het getal terug. */
async function maakDubbel(l: Lesgids, vak: Werkvlak): Promise<number> {
  const a = await pakTegel(l, ["Tik op een tegel.", "Zet hem in het vak."]);
  vak.zet([{ stukken: [a] }]);
  /* Een oneven tegel draait om in de bak, zodat de tweede er precies tegenaan past. */
  if (a % 2 === 1) {
    pas(l, { om: true });
    await l.wacht(650);
  }
  for (let fouten = 0; ; ) {
    const b = await pakTegel(l, [`Zet er nog een {${a}} bij.`]);
    if (b === a) {
      vak.leg(0, b);
      pas(l, { om: false });
      return a;
    }
    await vak.evenLaten(0, b);
    fouten++;
    await l.zeg(fouten === 1 ? "Twee *dezelfde* tegels." : "", `Zet er nog een {${a}} bij.`);
  }
}

/** "Wat is het dubbele van a?" Bij fout: tel a en a samen; daarna samen tellen. */
async function dubbelVraag(l: Lesgids, a: number) {
  const d = 2 * a;
  let x = await l.getal();
  if (x === d) {
    await l.zeg("Ja!", `Het dubbele van {${a}} is {${d}}.`);
    return;
  }
  if (x !== null) {
    await l.zeg("Net niet.", `Tel {${a}} en {${a}} samen.`, "Dan weet je het dubbele.");
    x = await l.getal();
    if (x === d) {
      await l.zeg("Goed zo.", `Het dubbele van {${a}} is {${d}}.`);
      return;
    }
  }
  await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
  await telHokjes(l, 0, d);
  await l.zeg(`{${a}} en {${a}} is samen {${d}}.`, `Het dubbele van {${a}} is {${d}}.`);
  await l.verder();
}

/** Welk getal moet je verdubbelen om `t` te maken? De t ligt er; tegels mogen erop. */
async function halveer(l: Lesgids, vak: Werkvlak, t: number, zinnen: string[], goed: string[]) {
  const h = t / 2;
  vak.zet([{ onder: [t], stukken: [] }]);
  await l.zeg(...zinnen);
  let x = await getalMetTegels(l, vak);
  if (x === h) {
    await l.zeg(...goed);
    return;
  }
  if (x !== null) {
    await l.zeg("Net niet.", `{${x}} en {${x}} is samen {${2 * x}}.`, `We zoeken {${t}}.`);
    x = await getalMetTegels(l, vak);
    if (x === h) {
      await l.zeg(...goed);
      return;
    }
  }
  vak.zet([{ onder: [t], stukken: [h, h] }]);
  await l.zeg(x === null ? "Geen zorgen." : "Kijk eens.", `{${h}} en {${h}} passen precies op de {${t}}.`, `Het dubbele van {${h}} is {${t}}.`);
  await l.verder();
}

const dubbelen: Lesdraaiboek = {
  id: "optellen-tot-10-dubbelen",
  titel: "Dubbelen",
  synthesis: "Add within 10 · Doubles",
  kaarttegels: [4, 4],

  async speel(l) {
    const vak = new Werkvlak(l);
    l.vlak(Tegelvlak, { torens: [], bak: [1, 2, 3, 4, 5] });
    await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "We gaan iets nieuws leren.", "Weet je wat *dubbelen* zijn?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") await l.zeg("Mooi.", "Laat maar zien.");
    else await l.zeg("Geen probleem.", "We ontdekken het samen.");

    /* 1. Twee dezelfde tegels: een dubbel. */
    let bak = [1, 2, 3, 4, 6, 7];
    pas(l, { bak });
    await l.zeg("Zet twee dezelfde tegels in het vak.");
    const a = await maakDubbel(l, vak);
    await l.zeg("Goed zo!", "Je hebt een *dubbel* gemaakt.", "Twee keer hetzelfde getal.", `Wat is het dubbele van {${a}}?`);
    await dubbelVraag(l, a);

    vak.zet([]);
    bak = bak.filter((t) => t !== a);
    pas(l, { bak });
    await l.zeg("Nog één dubbel.", "Zet weer twee dezelfde tegels in het vak.");
    const b = await maakDubbel(l, vak);
    await l.zeg("Goed zo!", `Wat is het dubbele van {${b}}?`);
    await dubbelVraag(l, b);

    /* 2. Omgekeerd (halveren, zonder dat woord). */
    pas(l, { bak: reeks(1, 7) });
    await halveer(
      l,
      vak,
      4,
      ["Welk getal moet je verdubbelen om {4} te *maken*?", "Probeer het met de tegels als je wilt.", "Je mag ze ook op de {4} leggen."],
      ["Ja!", "{2} en {2} is {4}."],
    );
    await l.zeg("Nu proberen we grotere getallen.");
    await halveer(l, vak, 8, ["Welk getal moet je verdubbelen om {8} te maken?", "Je mag de tegels gebruiken."], ["Goed zo.", "{4} en {4} is {8}."]);
    await halveer(l, vak, 10, ["Welk getal moet je verdubbelen om {10} te maken?"], ["Knap gedaan!", "{5} en {5} is {10}.", "Je kent de dubbelen goed."]);
    await l.verder();

    /* Einde. */
    vak.zet([]);
    pas(l, { bak: [] });
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 3. True or False                                                        */
/* ====================================================================== */

/** "Is dit een …?" bij één tegel. */
async function tegelBewering(l: Lesgids, vak: Werkvlak, n: number, bewering: number, zin: string, opties: string[]) {
  vak.zet([{ stukken: [n] }]);
  await l.zeg(zin);
  const k = await l.kies(opties);
  return { k, waar: n === bewering };
}

/**
 * Een som snel beoordelen. De totaaltegel staat er al; klopt het antwoord
 * niet, dan bouwt het kind de delen ernaast en ziet het zelf.
 */
async function snelleSom(l: Lesgids, vak: Werkvlak, delen: number[], totaal: number) {
  const echt = optel(delen);
  const waar = echt === totaal;
  vak.zet([{ stukken: [totaal] }]);
  pas(l, { som: somRij(delen, totaal), bak: [] });
  await l.zeg(`${somWoorden(delen)} is {${totaal}}.`, "Is dat waar of niet waar?");
  const k = await l.kies(["Waar", "Niet waar"]);
  if (k !== null && (k === "Waar") === waar) {
    await l.zeg("Dat klopt.", waar ? `${somWoorden(delen)} is {${totaal}}.` : `${somWoorden(delen)} is {${echt}}.`, waar ? "De som is *waar*." : "De som is *niet waar*.");
    await l.verder();
    return;
  }
  await l.zeg(k === null ? "Geen zorgen." : "Laat het me dan maar zien met de tegels.", `Zet ${opsomming(delen)} naast de {${totaal}}.`);
  pas(l, { bak: [...new Set(delen)] });
  await zetDelen(l, vak, 1, delen);
  pas(l, { bak: [] });
  /* Zoals Synthesis: na het bouwen komt de vraag nog één keer. */
  await l.zeg("Goed gewerkt met de tegels.", "Kijk naar de twee kanten.", "Is de som dan waar of niet waar?");
  const k2 = await l.kies(["Waar", "Niet waar"]);
  if (k2 !== null && (k2 === "Waar") === waar) {
    await l.zeg("Dat klopt.", waar ? "De som is *waar*." : "De som is *niet waar*.", "Je hebt het laten zien met de tegels.");
  } else {
    await l.zeg(waar ? "Kijk, ze zijn even hoog." : echt > totaal ? "Kijk, de delen samen zijn hoger." : "Kijk, de delen samen zijn lager.", waar ? "Dus de som is *waar*." : "Dus de som is *niet waar*.");
  }
  await l.verder();
}

/** Zijn de twee torens even hoog? Geeft terug of het kind het goed zag. */
async function evenHoog(l: Lesgids, vraag: string, gelijk: boolean): Promise<boolean> {
  await l.zeg("Kijk naar de tegels.", vraag);
  const k = await l.kies(["Ja", "Nee"]);
  return k !== null && (k === "Ja") === gelijk;
}

/**
 * Eén tegel bij toren `i` zodat beide kanten gelijk zijn. Met `bak` staat het
 * handje erbij (zoals Synthesis): dan licht op waar de tegel hoort, en worden
 * de andere tegels in de bak dof.
 */
async function repareer(l: Lesgids, vak: Werkvlak, i: number, nodig: number, bak?: number[]) {
  let hulpAan = !!bak;
  for (let fouten = 0; ; ) {
    let n: number;
    if (hulpAan) {
      const p = l.wachtOpVlak(["tegel", "hulp"]);
      pas(l, { actief: true, hulpKnop: true });
      const g = await p;
      pas(l, { actief: false, hulpKnop: false });
      if (g.soort === "hulp") {
        hulpAan = false;
        pas(l, { hint: { toren: i, n: nodig }, slot: (bak ?? []).filter((t) => t !== nodig) });
        await l.zeg(`Zet de {${nodig}} hier.`);
        continue;
      }
      n = Number(g.n);
    } else {
      n = await pakTegel(l, ["Zet een tegel erbij.", "Dan zijn ze even hoog."]);
    }
    if (n === nodig) {
      pas(l, { hint: null, slot: [] });
      vak.leg(i, n);
      return;
    }
    await vak.evenLaten(i, n);
    fouten++;
    if (fouten === 1) await l.zeg("Hmm, dan zijn ze nog niet even hoog.", "Kijk hoeveel hokjes er missen.");
    else await l.zeg(nodig === 1 ? "Er mist nog {1} hokje." : `Er missen nog {${nodig}} hokjes.`, `Pak de {${nodig}}.`);
  }
}

const kloptDeSom: Lesdraaiboek = {
  id: "optellen-tot-10-klopt-de-som",
  titel: "Klopt de som?",
  synthesis: "Add within 10 · True or False",
  kaarttekening: KaartKlopt,

  async speel(l) {
    const vak = new Werkvlak(l);
    l.vlak(Tegelvlak, { torens: [], bak: [] });
    await l.zeg(l.naam ? `${l.naam}, ken je de woorden *waar* en *niet waar*?` : "Ken je de woorden *waar* en *niet waar*?");
    const ken = await l.kies(["Ja", "Nee"]);
    if (ken === "Ja") await l.zeg("Mooi.", "We beginnen makkelijk.");
    else await l.zeg("Geen probleem.", "We oefenen eerst met tegels.");

    /* 1. Waar en niet waar, bij losse tegels. */
    const b = await tegelBewering(l, vak, 1, 1, "Is dit een {1}?", ["Ja", "Nee"]);
    if (b.k === "Ja") await l.zeg("Ja.", "Dit *is* een {1}.", "Dat is dus *waar*.");
    else await l.zeg("Kijk, het is één hokje.", "Dit is een {1}.", "Dat is dus *waar*.");
    await l.verder();

    vak.zet([{ stukken: [2] }]);
    await l.zeg("En deze dan?", "Dit is een {3}, toch?");
    const k3 = await l.kies(["Ja", "Nee"]);
    if (k3 === "Nee") await l.zeg("Goed gezien.", "Dit is een {2}.", "Een {3} zeggen is dus *niet waar*.");
    else await l.zeg("Deze tegel is een {2}.", "Een {3} zeggen is dus *niet waar*.", "Want het klopt niet.");
    await l.verder();

    const spel: [number, number, string][] = [
      [8, 6, "Dit is een {6}."],
      [10, 10, "Dit is een {10}."],
      [5, 5, "Dit is een {5}."],
    ];
    for (const [n, bewering, zin] of spel) {
      const r = await tegelBewering(l, vak, n, bewering, zin, ["Waar", "Niet waar"]);
      const goed = r.k !== null && (r.k === "Waar") === r.waar;
      if (goed && r.waar) await l.zeg("Goed.");
      else if (goed) {
        await l.zeg("Dat klopt.", `Dit is een {${n}}.`);
        await l.verder();
      } else {
        await l.zeg("Kijk nog eens goed.", `Dit is een {${n}}.`, r.waar ? "Dus het is *waar*." : "Dus het is *niet waar*.");
        await l.verder();
      }
    }
    await l.zeg("Dit kun je goed.", "Nu iets wat *een beetje* lastiger is.");
    await l.verder();

    /* 2. 3 + 2 = 6: nagaan met tegels en repareren. */
    vak.zet([]);
    pas(l, { som: somRij([3, 2], 6) });
    await l.zeg("Kijk naar de som bovenaan.", "{3} plus {2} is {6}.", "Klopt dat?");
    let k = await l.kies(["Ja", "Nee"]);
    pas(l, { bak: [2, 3, 6] });
    await l.zeg(k === "Nee" ? "We gaan het na." : "", "In de som is het samen {6}.", "Zet de {6} in het vak.");
    await zetDelen(l, vak, 0, [6]);
    await l.zeg("Dus {6} is het totaal.", "Zet nu de kleine delen erin.", "De {2} en de {3}.");
    await zetDelen(l, vak, 1, [2, 3]);
    if (await evenHoog(l, "Zijn {2} en {3} samen {6}?", false)) await l.zeg("Goed gezien.", "Er mist een hokje.");
    else await l.zeg("Hmm, kijk goed.", "Bij {2} en {3} mist een hokje.");
    pas(l, { bak: [1, 2, 3] });
    await l.zeg("Kun je er één tegel bij zetten?", "Dan zijn ze *wél* even hoog.");
    await repareer(l, vak, 1, 1);
    pas(l, { bak: [], som: somRij([2, 3, 1], 6) });
    await l.zeg("Ja, zo is het beter.", "{2} plus {3} plus {1} is {6}.", "Nu klopt de som!");
    await l.verder();

    /* 3. 5 + 6 = 11: de 11 met de 10 en de 1. */
    vak.zet([]);
    pas(l, { som: somRij([5, 6], 11) });
    await l.zeg("Hier is een nieuwe som.", "{5} plus {6} is {11}.", "Klopt dat?");
    k = await l.kies(["Ja", "Nee"]);
    pas(l, { bak: [1, 5, 6, 10] });
    await l.zeg(k === "Ja" ? "We gaan het na met tegels." : "We gaan het na.", "Het totaal is {11}.", "Maak {11} met de {10} en de {1}.");
    await zetDelen(l, vak, 0, [10, 1]);
    await l.zeg("Zet nu de {5} en de {6} erin.", "Dan zien we of ze samen {11} maken.");
    await zetDelen(l, vak, 1, [5, 6], [["Dat is er één.", "Nu de andere."]]);
    pas(l, { bak: [] });
    if (await evenHoog(l, "Zijn {5} en {6} samen {11}?", true)) await l.zeg("Ja.", "Deze som is dus *waar*.", "{5} plus {6} is {11}.");
    else await l.zeg("Kijk, ze zijn even hoog.", "Deze som is dus *waar*.", "{5} plus {6} is {11}.");
    await l.verder();

    /* 4. 2 + 3 + 4 = 8: één te veel, de 8 wordt een 9. */
    vak.zet([]);
    pas(l, { som: somRij([2, 3, 4], 8) });
    await l.zeg("Nu een som met meer getallen.", "{2} plus {3} plus {4} is {8}.", "Is dat waar of niet waar?");
    await l.kies(["Waar", "Niet waar"]);
    pas(l, { bak: [2, 3, 4, 8] });
    await l.zeg("We gaan het na.", "Zet eerst de {8} erin.", "Dat is het totaal.");
    await zetDelen(l, vak, 0, [8]);
    await l.zeg("Zet nu alle kleine delen erin.", "De {2}, de {3} en de {4}.");
    await zetDelen(l, vak, 1, [2, 3, 4], [["Goed zo.", "Ga zo door."], ["Goed.", "Nog één."]]);
    if (await evenHoog(l, "Zijn {2}, {3} en {4} samen {8}?", false)) await l.zeg("Goed gezien.", "De kant met {2}, {3} en {4} is groter.");
    else await l.zeg("Hmm, ik weet het niet zo zeker.", "De kant met {2}, {3} en {4} is iets groter.");
    await l.verder();
    pas(l, { bak: [1, 2, 3, 4] });
    await l.zeg("Kun je één tegel bij de {8} zetten?", "Dan zijn beide kanten gelijk.", "Hulp nodig? Tik dan op het handje.");
    await repareer(l, vak, 0, 1, [1, 2, 3, 4]);
    pas(l, { bak: [], som: somRij([2, 3, 4], 9) });
    await l.zeg("Dat ziet er veel beter uit.", "Nu zijn beide kanten even groot.", "{2} plus {3} plus {4} is {9}.");
    await l.verder();

    /* 5. Snel, zonder slepen. Daarna kiest het kind: nog zo een, of moeilijker. */
    await snelleSom(l, vak, [2, 7], 9);
    vak.zet([]);
    pas(l, { som: null });
    await l.zeg("Nog één, en dan stoppen we.", "Wil je er nog zo een?", "Of iets moeilijkers, met meer getallen?");
    const keuze = await l.kies(["Nog zo een", "Moeilijker"]);
    if (keuze === "Moeilijker") await snelleSom(l, vak, [1, 2, 3, 4], 10);
    else await snelleSom(l, vak, [3, 4], 8);

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 4. Missing Numbers                                                      */
/* ====================================================================== */

/** Een getal vragen; bij een fout zegt de les het antwoord en gaat door. */
async function vraagKort(l: Lesgids, juist: number, bijFout: string[]) {
  const x = await l.getal();
  if (x !== juist) await l.zeg(...bijFout);
}

/** a + ? = totaal. De totaaltegel ligt er; tegels mogen erop. */
async function ontbrekend(l: Lesgids, vak: Werkvlak, a: number, totaal: number, onder: number[], bak: number[]) {
  const n = totaal - a;
  vak.zet([{ onder, stukken: [] }]);
  pas(l, { bak, som: somRij([a, null], totaal) });
  const goed = async () => {
    vak.zet([{ onder, stukken: zetIn([a], n) }]);
    pas(l, { som: somRij([a, n], totaal) });
    await l.zeg("Je hebt het!", `{${a}} plus {${n}} is {${totaal}}.`, `Het ontbrekende getal was {${n}}.`);
    await l.verder();
  };
  await l.zeg(`{${a}} plus hoeveel is {${totaal}}?`, "Je mag de tegels gebruiken.");
  let x = await getalMetTegels(l, vak);
  if (x === n) return goed();
  if (x !== null) {
    await l.zeg(
      `Kijk, {${a}} plus {${x}} is {${a + x}}.`,
      Math.abs(a + x - totaal) === 1 ? "Dichtbij, maar net niet." : a + x < totaal ? "Dat is te weinig." : "Dat is te veel.",
    );
    await l.verder();
    await l.zeg(`Wat moet er bij de {${a}} om {${totaal}} te maken?`);
    x = await getalMetTegels(l, vak);
    if (x === n) return goed();
  }
  /* Hulp: het bekende deel ligt over het totaal; tel wat er nog te zien is. */
  vak.zet([{ onder, stukken: [a] }]);
  pas(l, { bak: bak.filter((t) => t !== a) });
  await l.zeg(x === null ? "Geen zorgen." : "Ik help je een beetje.", `Ik heb een {${a}} op de {${totaal}} gelegd.`, "Tel de hokjes die je nog ziet.");
  await l.verder();
  await l.zeg(`Wat moet er bij de {${a}} om {${totaal}} te maken?`);
  x = await l.getal();
  if (x !== n) {
    await telHokjes(l, 0, n, true);
    await l.zeg(n === 1 ? "Ik tel {1} hokje." : `Ik tel {${n}} hokjes.`, `Het ontbrekende getal is {${n}}.`);
    pas(l, { som: somRij([a, n], totaal) });
    await l.verder();
    return;
  }
  return goed();
}

const ontbrekendGetal: Lesdraaiboek = {
  id: "optellen-tot-10-ontbrekend-getal",
  titel: "Het ontbrekende getal",
  synthesis: "Add within 10 · Missing Numbers",
  kaarttekening: KaartOntbrekend,

  async speel(l) {
    const vak = new Werkvlak(l);
    l.vlak(Tegelvlak, { torens: [{ onder: [7], stukken: [] }], bak: [] });

    /* 1. Welk getal is dit? */
    await l.zeg("We beginnen met een makkelijke.", "Welk getal is dit?");
    let x = await l.getal();
    if (x !== 7 && x !== null) {
      await l.zeg(Math.abs(x - 7) <= 1 ? "Je zit er een beetje naast." : "Hmm, dat is het niet.", "Welk getal zie je hier?");
      x = await l.getal();
    }
    if (x !== 7) {
      await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
      await telHokjes(l, 0, 7);
      await l.zeg("Het zijn {7} hokjes.", "Dus het is een {7}.");
      await l.verder();
    }

    /* 2. Een tegel bovenop de 7: een som met een ontbrekend getal. */
    let bak = reeks(1, 6);
    vak.zet([{ onder: [7], stukken: [] }]);
    pas(l, { bak, som: somRij([null, null], 7) });
    await l.zeg(x === 7 ? "Ja, het is een {7}." : "", "Nu leggen we er een tegel bovenop.", "Kies een tegel voor op de {7}.");
    const k = await pakTegel(l, PAK_HULP);
    const nodig = 7 - k;
    vak.leg(0, k);
    pas(l, { som: somRij([k, null], 7) });
    await l.zeg("Kijk eens.", "Je hebt een som met een *ontbrekend* getal gemaakt.", "Welke som is het?");
    const anderTotaal = k + 2 === 7 ? k + 1 : k + 2;
    const juist = `${k} + ? = 7`;
    const keuze = await l.kies(schud([juist, `${k} + ? = ${anderTotaal}`]));
    if (keuze === juist) {
      await l.zeg("Ja.", `{${k}} plus iets is {7}.`);
    } else {
      /* De vraag in stukjes: het totaal, het deel dat er ligt, en dan aanvullen. */
      await l.zeg(keuze === null ? "Geen zorgen." : "We denken er samen over na.", "Hoeveel is het samen?", "Kijk naar de grote tegel.");
      await vraagKort(l, 7, ["Kijk, de grote tegel is een {7}.", "Samen is het dus {7}."]);
      await l.zeg("Welk getal heb je op de {7} gelegd?");
      await vraagKort(l, k, [`Je hebt de {${k}} erop gelegd.`]);
      await l.zeg(`Er moet iets bij de {${k}}.`, "Dan is het samen {7}.");
      await l.verder();
    }

    await l.zeg("Zoek het ontbrekende getal.", `Zet de tegel erbij die met {${k}} samen {7} maakt.`);
    for (let fouten = 0; ; ) {
      const w = await pakTegel(l, [`Welke tegel past bij de {${k}}?`]);
      if (w === nodig) {
        vak.leg(0, w);
        break;
      }
      await vak.evenLaten(0, w);
      bak = bak.filter((t) => t !== w);
      pas(l, { bak });
      fouten++;
      if (fouten === 1) await l.zeg(`Hmm, dat maakt geen {7}.`, `Wat moet er bij de {${k}} om {7} te maken?`);
      else if (fouten === 2) await l.zeg(`{${k}} en {${w}} is samen {${k + w}}.`, k + w < 7 ? "Dat is te weinig." : "Dat is te veel.", "Zoek de tegel die precies past.");
      else await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Pak de {${nodig}}.`);
    }
    pas(l, { som: somRij([k, nodig], 7) });
    await l.zeg("Je hebt het!", "Je hebt het ontbrekende getal gevonden.", `{${k}} plus {${nodig}} is {7}.`);
    await l.verder();

    /* 3. 5 + ? = 9 */
    await ontbrekend(l, vak, 5, 9, [9], reeks(1, 9));

    /* 4. Het kind kiest zelf de volgende som. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    await l.zeg(l.naam ? `${l.naam}, je doet het goed.` : "Je doet het goed.", "Kies zelf de volgende som.");
    const zelf = await l.kies(["4 + ? = 11", "2 + ? = 5"]);
    if (zelf === "4 + ? = 11") await ontbrekend(l, vak, 4, 11, [10, 1], reeks(2, 9));
    else await ontbrekend(l, vak, 2, 5, [5], reeks(1, 4));

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    await l.zeg("Klaar!", "Deze les is af.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 5. Add Three Numbers                                                    */
/* ====================================================================== */

/** De som met drie vakjes; ingevulde getallen in hun kleur, de rest een vraagteken. */
function drieSom(getallen: number[], totaal: number | null, leeg = "?"): Somdeel[] {
  const d = [0, 1, 2].map((i) => (getallen[i] !== undefined ? String(getallen[i]) : leeg));
  return somRij(d, totaal);
}

/** Het kind typt drie getallen, één voor één; het vakje dat aan de beurt is licht op. */
async function typDrie(l: Lesgids, totaal: number): Promise<number[] | null> {
  const getallen: number[] = [];
  for (let i = 0; i < 3; i++) {
    pas(l, { som: drieSom(getallen, totaal), somAan: i * 2 });
    const x = await l.getal();
    if (x === null) {
      pas(l, { som: drieSom([], totaal), somAan: null });
      return null;
    }
    getallen.push(x);
  }
  pas(l, { som: drieSom(getallen, totaal), somAan: null });
  return getallen;
}

/** Samen invullen: per vakje zegt de les welke tegel erbij hoort (van boven naar onder). */
async function samenInvullen(l: Lesgids, volgorde: number[], totaal: number) {
  const woord = ["Bovenaan", "Daaronder", "Onderaan"];
  const getallen: number[] = [];
  for (let i = 0; i < 3; i++) {
    const n = volgorde[i];
    pas(l, { som: drieSom(getallen, totaal), somAan: i * 2 });
    await l.zeg(`${woord[i]} ligt een {${n}}.`, i === 0 ? "Typ hem in het eerste vakje." : "Typ hem in het volgende vakje.");
    while ((await l.getal()) !== n) await l.zeg(`Kijk goed: het is een {${n}}.`, `Typ de {${n}}.`);
    getallen.push(n);
  }
  pas(l, { som: drieSom(getallen, totaal), somAan: null });
}

/**
 * Het kind vult een lege vorm van `totaal` met tegels, tot er `aantal` liggen
 * (of tot `stopBij`). Een tegel die niet meer past, verschijnt even en
 * verdwijnt. Met `hulp` staat er "Weet ik niet" bij; dat geeft `null`.
 */
async function vulVorm(l: Lesgids, vak: Werkvlak, totaal: number, aantal: number, o: { hulp?: boolean; stopBij?: number } = {}): Promise<number[] | null> {
  const stop = o.stopBij ?? aantal;
  for (;;) {
    const stukken = vak.toren(0).stukken;
    if (stukken.length >= stop) return [...stukken];
    const tegel = l.wachtOpVlak("tegel").then((e) => Number(e.n));
    pas(l, { actief: true });
    const n = o.hulp ? await Promise.race([tegel, l.kies([]).then(() => null)]) : await tegel;
    pas(l, { actief: false });
    if (n === null) return null;
    const rest = totaal - optel(stukken) - n;
    const nogTegels = aantal - stukken.length - 1;
    if (rest < nogTegels || (nogTegels === 0 && rest !== 0)) {
      await vak.evenLaten(0, n);
      if (rest < 0) await l.zeg("Die is te groot voor de vorm.");
      else if (nogTegels === 0) await l.zeg("Dan blijft er een gat over.", "Zoek een tegel die precies past.");
      else await l.zeg(nogTegels === 1 ? "Dan past er geen tegel meer bij." : "Dan passen er geen twee tegels meer bij.", "Kies een kleinere tegel.");
      continue;
    }
    vak.leg(0, n);
  }
}

/** Het hulppad van Synthesis: drie getallen die samen 7 zijn, stap voor stap. */
async function drieSamen(l: Lesgids, vak: Werkvlak) {
  await l.zeg("Geen zorgen.", "Een som met drie getallen is lastig.", "We doen het samen.");
  await l.verder();
  vak.zet([{ omtrek: 7, stukken: [] }]);
  pas(l, { som: null, bak: reeks(1, 7) });
  await l.zeg("Ik heb een nieuwe vorm neergezet.", "Zet de tegel erin die precies past.");
  for (let fouten = 0; ; ) {
    const n = await pakTegel(l, ["Welke tegel is net zo groot als de vorm?"]);
    if (n === 7) {
      vak.leg(0, 7);
      break;
    }
    await vak.evenLaten(0, n);
    fouten++;
    await l.zeg(fouten === 1 ? "Die is te klein." : "", fouten === 1 ? "Zoek een tegel die de vorm helemaal vult." : "Pak de {7}.");
  }
  pas(l, { som: somRij(["?", "?", "?"], null), somAan: 6 });
  await l.zeg("Ja, die past precies.", "Typ dit getal achter het is-teken.");
  let x = await l.getal();
  if (x !== 7) {
    await telHokjes(l, 0, 7);
    await l.zeg("Het zijn {7} hokjes.", "Typ de {7}.");
    while (x !== 7) x = await l.getal();
  }
  pas(l, { som: drieSom([], 7), somAan: null });
  await l.zeg("Kijk nu naar de som.", "Hoeveel getallen ontbreken er?");
  x = await l.getal();
  await l.zeg(x === 3 ? "Ja." : "Tel de vakjes met een vraagteken: het zijn er {3}.", "We zoeken dus *drie* getallen.", "Samen moeten ze {7} zijn.");
  await l.verder();

  vak.zet([{ omtrek: 7, stukken: [] }]);
  pas(l, { bak: reeks(1, 5) });
  await l.zeg("Zet een tegel in de vorm.", "Welke je maar wilt.");
  await vulVorm(l, vak, 7, 3, { stopBij: 1 });
  await l.zeg("Mooi zo.", "Zet er nu precies *twee* bij.", "Dan is de vorm helemaal vol.");
  const stukken = (await vulVorm(l, vak, 7, 3)) ?? [];
  pas(l, { bak: [] });
  await l.zeg("Prachtig neergelegd.", "Mooie kleuren ook!");
  await l.verder();
  const volgorde = [...stukken].reverse();
  await l.zeg("Nu vullen we de som in.");
  await samenInvullen(l, volgorde, 7);
  await l.zeg("Knap gedaan!", `${somWoorden(volgorde)} is {7}.`);
  await l.verder();
}

const drieGetallen: Lesdraaiboek = {
  id: "optellen-tot-10-drie-getallen",
  titel: "Drie getallen optellen",
  synthesis: "Add within 10 · Add Three Numbers",
  kaarttekening: KaartDrie,

  async speel(l) {
    const vak = new Werkvlak(l);
    let gemist = 0;

    /* 1. Drie tegels maken samen 10: vul de som in. */
    const toren = kies1([
      [3, 5, 2],
      [7, 1, 2],
      [5, 1, 4],
    ]);
    const vanBoven = [...toren].reverse();
    const opbouw = async () => {
      for (let i = 1; i <= toren.length; i++) {
        vak.zet([{ stukken: toren.slice(0, i), rand: i === toren.length }]);
        await l.wacht(450);
      }
    };
    l.vlak(Tegelvlak, { torens: [], bak: reeks(1, 10).filter((t) => !toren.includes(t)), som: drieSom([], 10, "") });
    await opbouw();
    await l.zeg("Deze keer maak ik {10} met drie tegels.");
    await l.verder();
    await l.zeg("Vul de som in.", "Hij moet bij de tegels passen.");
    let g = await typDrie(l, 10);
    if (g && !zelfdeGroepen(g, toren)) {
      gemist++;
      await l.zeg("Hmm, kijk eens goed.", "Deze getallen passen niet bij de tegels.");
      await l.verder();
      pas(l, { som: drieSom([], 10) });
      vak.zet([]);
      await l.wacht(300);
      await opbouw();
      await l.zeg("We proberen het nog een keer.", "Vul de som in.");
      g = await typDrie(l, 10);
    }
    if (!g || !zelfdeGroepen(g, toren)) {
      if (!g) gemist++;
      await l.zeg(g ? "We doen het samen." : "Geen zorgen, we doen het samen.", "We lezen de tegels van boven naar onder.");
      await samenInvullen(l, vanBoven, 10);
      g = vanBoven;
    }
    await l.zeg("Ja, je hebt het!", `${somWoorden(g)} is {10}.`);
    await l.verder();

    /* 2. Een lege vorm van 9: drie tegels erin. */
    vak.zet([{ omtrek: 9, stukken: [] }]);
    pas(l, { som: drieSom([], 9), bak: reeks(1, 9) });
    await l.zeg("Zet drie tegels in deze vorm.", "Samen moeten ze {9} zijn.");
    const gevuld = await vulVorm(l, vak, 9, 3, { hulp: true });
    if (!gevuld) {
      gemist++;
      await drieSamen(l, vak);
    } else {
      pas(l, { bak: [] });
      await l.zeg("Mooi, de vorm is vol!", "Vul nu de som in.");
      const h = await typDrie(l, 9);
      const volgorde = [...gevuld].reverse();
      if (h && zelfdeGroepen(h, gevuld)) {
        await l.zeg("Helemaal goed.", `${somWoorden(h)} is {9}.`);
      } else {
        gemist++;
        await l.zeg(h ? "Hmm, die passen niet bij jouw tegels." : "Geen zorgen.", "We doen het samen.");
        await samenInvullen(l, volgorde, 9);
        await l.zeg("Ja.", `${somWoorden(volgorde)} is {9}.`);
      }
      await l.verder();
    }

    /* 3. Snel: alleen de vorm en drie vakjes. */
    const voorbeeld: Record<number, number[]> = { 6: [3, 2, 1], 9: [4, 3, 2], 8: [4, 3, 1] };
    for (const totaal of [6, 9, 8]) {
      vak.zet([{ omtrek: totaal, stukken: [] }]);
      pas(l, { som: drieSom([], totaal), bak: [] });
      await l.zeg("Vul de som in.", `Samen moet het {${totaal}} zijn.`);
      let poging = await typDrie(l, totaal);
      const klopt = (p: number[] | null) => !!p && p.every((n) => n >= 1) && optel(p) === totaal;
      if (poging && !klopt(poging)) {
        gemist++;
        if (poging.some((n) => n < 1)) await l.zeg("Bijna.", "Elk getal moet minstens {1} zijn.");
        else await l.zeg("Bijna.", `${somWoorden(poging)} is {${optel(poging)}}.`, `We zoeken {${totaal}}.`);
        await l.zeg("Probeer het nog een keer.");
        poging = await typDrie(l, totaal);
      }
      if (poging && klopt(poging)) {
        /* De getallen vallen als tegels in de vorm. */
        vak.zet([{ omtrek: totaal, stukken: poging.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
        await l.zeg(totaal === 8 ? "Raak!" : "Helemaal goed.", `${somWoorden(poging)} is {${totaal}}.`);
      } else {
        if (!poging) gemist++;
        const v = voorbeeld[totaal];
        vak.zet([{ omtrek: totaal, stukken: v.reduce<number[]>((a, n) => zetIn(a, n), []) }]);
        pas(l, { som: drieSom(v, totaal) });
        await l.zeg(poging ? "Kijk, zo kan het." : "Geen zorgen, kijk eens.", `${somWoorden(v)} is {${totaal}}.`);
      }
      await l.verder();
    }

    /* Einde. */
    vak.zet([]);
    pas(l, { som: null, bak: [] });
    const tik = l.kaart();
    if (gemist === 0) await l.zeg(metNaam(l, "Knap gedaan"), "Sommen met drie getallen kun je al.", "Tik op de kaart om hem af te vinken.");
    else await l.zeg("Goed gewerkt.", "Volgende keer gaat het vast nog beter.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 6. Splitting Sums                                                       */
/* ====================================================================== */

const ps = (l: Lesgids, p: Partial<Stippenprops>) => l.pasVlakAan<Stippenprops>(p);

/** Wat de stippen laten zien, en een teller om ze opnieuw te beginnen. */
class Stippenstand {
  sleutel = 0;
  constructor(private l: Lesgids) {}
  /** Opnieuw beginnen met deze groepjes. */
  zet(start: number[], extra: Partial<Stippenprops> = {}) {
    this.sleutel++;
    ps(this.l, { start, sleutel: this.sleutel, doel: null, tel: 0, ...extra });
  }
}

/** Wacht tot de stippen er zo uitzien. */
async function wachtTot(l: Lesgids, past: (g: number[]) => boolean, hulp?: string[]): Promise<number[]> {
  for (;;) {
    const e = l.wachtOpVlak("verander");
    ps(l, { actief: true });
    const g = (hulp ? await metHulp(l, e, hulp, 20000) : await e).groepen as number[];
    if (past(g)) return g;
  }
}

/** De mascotte telt de stippen, één voor één. */
async function telStippen(l: Lesgids, n: number) {
  for (let i = 1; i <= n; i++) {
    ps(l, { tel: i });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/**
 * Het kind maakt deze groepjes. Duurt het lang, dan biedt de les hulp aan:
 * tik op de pijl, dan zet hij de stippen goed.
 */
async function maakGroepen(l: Lesgids, stand: Stippenstand, doel: number[]) {
  const past = l.wachtOpVlak("past").then(() => "past" as const);
  ps(l, { doel, actief: true });
  let r = await Promise.race([past, l.wacht(45000).then(() => "tijd" as const)]);
  if (r === "tijd") {
    await l.zeg("Hier is een beetje hulp, als je wilt.", "Probeer het zelf, of tik op de pijl.", "Dan zet ik de stippen goed.");
    r = await Promise.race([past, l.verder().then(() => "tijd" as const)]);
    if (r === "tijd") {
      stand.zet(doel, { actief: false });
      await l.wacht(600);
    }
  }
  ps(l, { doel: null, actief: false });
}

/** Lukt het om deze som met de stippen te maken? Het vlak ziet het zelf, of het kind zegt "Het lukt niet". */
async function probeer(l: Lesgids, doel: number[]): Promise<"past" | "lukt niet"> {
  const past = l.wachtOpVlak("past").then(() => "past" as const);
  ps(l, { doel, actief: true });
  const knop = l.kies(["Het lukt niet"]).then(() => "lukt niet" as const);
  const r = await Promise.race([past, knop]);
  ps(l, { doel: null, actief: false });
  return r;
}

/**
 * Het kind kiest één som uit de lijst. `wel`: die je wél kunt maken met `n`,
 * anders die je níet kunt maken. Geeft terug of het meteen goed was.
 */
async function welkeSom(l: Lesgids, stand: Stippenstand, n: number, opties: string[], wel: boolean): Promise<boolean> {
  stand.zet([n], { knoppen: true, tik: "eraf", actief: true });
  await l.zeg(wel ? `Welke som kun je maken met {${n}}?` : `Welke som kun je *niet* maken met {${n}}?`);
  const kan = (o: string) => optel(losse(o)) === n;
  const k = await l.kies(schud(opties));
  ps(l, { actief: false });
  if (k !== null && kan(k) === wel) {
    await l.zeg("Precies goed.");
    return true;
  }
  if (k === null) {
    const juist = opties.find((o) => kan(o) === wel) ?? opties[0];
    await l.zeg("Geen zorgen.", `${somWoorden(losse(juist))} is samen {${optel(losse(juist))}}.`, wel ? "Die kun je maken." : "Die kun je *niet* maken.");
    await l.verder();
    return false;
  }
  const delen = losse(k);
  await l.zeg("We proberen het uit.", wel ? `Probeer ${somWoorden(delen)} te maken.` : `Maak ${somWoorden(delen)} met de stippen.`);
  const r = await probeer(l, delen);
  if (wel) {
    const s = optel(delen);
    await l.zeg(r === "past" ? "Kijk eens." : "Klopt, dat lukt niet.", `${somWoorden(delen)} is samen {${s}}.`, s > n ? `We hebben maar {${n}} stippen.` : `Dan blijven er stippen over.`);
  } else {
    if (r === "lukt niet") {
      stand.zet(delen);
      await l.zeg("Kijk, zo kan het wel.");
    }
    await l.zeg(`Die kun je dus *wél* maken.`, "We zochten welke *niet* kan.");
  }
  await l.verder();
  return false;
}

/**
 * Er zijn `aantal` goede sommen; het kind kiest ze één voor één. Een gekozen
 * som komt met een vinkje of kruisje in het lijstje. Geeft terug of het
 * zonder fouten ging.
 */
async function kiesMeerdere(l: Lesgids, stand: Stippenstand, n: number, opties: string[], aantal: number, zinnen: string[]): Promise<boolean> {
  stand.zet([n], { knoppen: true, tik: "eraf", actief: true, lijst: [] });
  const kan = (o: string) => optel(losse(o)) === n;
  const lijst: { som: string; teken?: "goed" | "fout" }[] = [];
  let over = schud(opties);
  let goed = 0;
  let foutloos = true;
  await l.zeg(...zinnen, `Er zijn er ${aantal === 2 ? "*twee*" : "*drie*"}.`, "Kies er eerst één.");
  while (goed < aantal) {
    ps(l, { actief: true });
    const k = await l.kies(over);
    if (k === null) {
      foutloos = false;
      for (const o of over.filter(kan)) lijst.push({ som: o, teken: "goed" });
      ps(l, { lijst: [...lijst], actief: false });
      await l.zeg("Geen zorgen.", aantal === 2 ? "Deze twee kun je maken." : "Deze drie kun je maken.");
      await l.verder();
      break;
    }
    over = over.filter((o) => o !== k);
    if (kan(k)) {
      goed++;
      lijst.push({ som: k, teken: "goed" });
      ps(l, { lijst: [...lijst] });
      if (goed < aantal) await l.zeg("Ja, die kan.", goed === aantal - 1 ? "Nog één." : "Kies er nog één.");
    } else {
      foutloos = false;
      lijst.push({ som: k, teken: "fout" });
      ps(l, { lijst: [...lijst] });
      await l.zeg("Die kan niet.", `${somWoorden(losse(k))} is samen {${optel(losse(k))}}.`, "Kies een andere.");
    }
  }
  ps(l, { actief: false });
  if (foutloos) await l.zeg("Goed gedaan!", aantal === 2 ? "Je hebt ze allebei gevonden." : "Je hebt ze alle drie gevonden.");
  else if (goed === aantal) await l.zeg("Nu heb je ze allemaal.");
  await l.verder();
  ps(l, { lijst: [] });
  return foutloos;
}

/** De hulples van Synthesis: tellen, uit elkaar, samen, splitsen, en drie uitdagingen. */
async function splitsHulp(l: Lesgids, stand: Stippenstand) {
  await l.zeg("Een getal splitsen kan lastig zijn.", "We kijken er samen naar.");
  await l.verder();

  stand.zet([6], { getallen: false, tik: "breek", knoppen: false, actief: false });
  await l.zeg("Hoeveel stippen zijn er?");
  let k = await l.kies(["4", "5", "6", "7"]);
  if (k !== "6" && k !== null) {
    await l.zeg("Niet helemaal.", "Misschien heb je je verteld.", "Tel nog eens.");
    const fout = k;
    k = await l.kies(["4", "5", "6", "7"].filter((o) => o !== fout));
  }
  if (k !== "6") {
    await l.zeg("We tellen samen.");
    await telStippen(l, 6);
    await l.zeg("Het zijn {6} stippen.");
  } else {
    await l.zeg("Je hebt het.", "{6} stippen.");
  }
  ps(l, { getallen: true, tel: 0 });
  await l.verder();

  await l.zeg("Tik op de groep stippen.", "Kijk wat er gebeurt.");
  await wachtTot(l, (g) => g.length === 6, ["Tik op de stippen."]);
  ps(l, { actief: false });
  await l.zeg("Goed zo.", "Hebben we nog evenveel stippen?");
  const evenveel = await l.kies(["Ja", "Nee"]);
  if (evenveel === "Ja") {
    await l.zeg("Precies.", "Nog steeds {6} stippen.");
  } else {
    await l.zeg("We tellen ze.", "Hoeveel stippen zijn er?");
    const t = await l.kies(["4", "5", "6", "7"]);
    if (t !== "6") await telStippen(l, 6);
    await l.zeg(t === "6" ? "Precies, {6} stippen." : "Het zijn {6} stippen.", "Dus nog evenveel.");
    ps(l, { tel: 0 });
  }
  await l.verder();

  ps(l, { knoppen: true, tik: "eraf" });
  await l.zeg("Tik nu op de knop *Alles samen*.");
  await wachtTot(l, (g) => g.length === 1, ["De knop staat onder de stippen."]);
  await l.zeg("Ze zijn weer samen.", "Tik nu één keer op de stippen.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [5, 1]), ["Tik op *Alles samen*.", "Tik dan één keer op de stippen."]);
  ps(l, { actief: false });
  await l.zeg("Goed zo!", "Je hebt {6} gesplitst in {5} en {1}.");
  await l.verder();
  await l.zeg("Tik nog eens op de groep van {5}.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [4, 1, 1]), ["Tik op de groep van {5}."]);
  ps(l, { actief: false });
  await l.zeg("Nu hebben we {4} plus {1} plus {1}.");
  await l.verder();
  await l.zeg("Nu gaan we slepen.", "Sleep de twee losse stippen naar elkaar.");
  await wachtTot(l, (g) => zelfdeGroepen(g, [4, 2]), ["Sleep een losse stip op de andere losse stip.", "Is er maar één losse stip? Tik dan eerst op de grote groep."]);
  ps(l, { actief: false });
  await l.zeg("Mooi gesleept!", "{4} en {2}.");
  await l.verder();
  await l.zeg("Hebben we nog steeds {6} stippen?");
  const nog = await l.kies(["Ja", "Nee"]);
  ps(l, { lijst: [{ som: "1 + 1 + 1 + 1 + 1 + 1" }, { som: "5 + 1" }, { som: "4 + 1 + 1" }, { som: "4 + 2" }] });
  await l.zeg(nog === "Ja" ? "Ja!" : "Kijk, het zijn er nog steeds {6}.", "Dit hebben we allemaal gemaakt.", "Het blijft steeds {6}.");
  await l.verder();
  ps(l, { lijst: [] });

  /* Drie uitdagingen met 8 stippen. */
  await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "Nu ga je het zelf gebruiken.");
  stand.zet([8], { knoppen: true, tik: "eraf", actief: false });
  await l.zeg("Uitdaging 1.", "Maak van de {8} allemaal losse stippen.");
  await maakGroepen(l, stand, Array<number>(8).fill(1));
  await l.zeg("Uitdaging 2.", "Maak {3} plus {5}.");
  await maakGroepen(l, stand, [3, 5]);
  await l.zeg("Uitdaging 3.", "Maak {2} plus {1} plus {3} plus {2}.");
  await maakGroepen(l, stand, [2, 1, 3, 2]);
  await l.zeg("Knap gedaan!", "Hebben we nog steeds {8} stippen?");
  const acht = await l.kies(["Ja", "Nee"]);
  await l.zeg(acht === "Ja" ? "Helemaal goed." : "Tel maar: het zijn er nog steeds {8}.");
  await l.verder();
}

/** De oefenronde na een fout in de controle: elke som uitproberen met de stippen. */
async function splitsOefenronde(l: Lesgids, stand: Stippenstand) {
  const sommen = schud(["2 + 3 + 2", "3 + 2 + 1", "2 + 2 + 2", "1 + 1 + 1 + 2"]);
  const lijst: { som: string; teken?: "goed" | "fout" }[] = sommen.map((som) => ({ som }));
  stand.zet([6], { knoppen: true, tik: "eraf", actief: false, lijst: [...lijst] });
  await l.zeg("Nu hebben we {6} stippen.", "We zoeken samen uit welke sommen kunnen.");
  await l.verder();
  for (let i = 0; i < sommen.length; i++) {
    const delen = losse(sommen[i]);
    const kan = optel(delen) === 6;
    await l.zeg(i === 0 ? "We beginnen met de eerste som." : i === sommen.length - 1 ? "Tot slot de laatste som." : "Nu de volgende som.", `Maak ${somWoorden(delen)} met de stippen.`);
    const r = await probeer(l, delen);
    if (r === "past") {
      lijst[i].teken = "goed";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Ja, die kun je maken!");
    } else if (!kan) {
      lijst[i].teken = "fout";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Precies.", `${somWoorden(delen)} is samen {${optel(delen)}}.`, "Die kun je niet maken met {6}.");
    } else {
      stand.zet(delen, { knoppen: true, tik: "eraf", lijst: [...lijst] });
      lijst[i].teken = "goed";
      ps(l, { lijst: [...lijst] });
      await l.zeg("Kijk, deze kan wel.", "Zo ziet het eruit.");
    }
    await l.verder();
    stand.zet([6], { knoppen: true, tik: "eraf", actief: false, lijst: [...lijst] });
  }
  await kiesMeerdere(l, stand, 6, sommen, 2, ["Welke sommen kun je maken met {6}?"]);
  await l.zeg("Nu is het jouw beurt.");
  await kiesMeerdere(l, stand, 5, ["2 + 1 + 3", "3 + 1 + 1", "1 + 1 + 1 + 1", "1 + 2 + 2"], 2, ["Welke sommen kun je maken met {5}?", "Probeer ze uit met de stippen."]);
}

const splitsen: Lesdraaiboek = {
  id: "optellen-tot-10-splitsen",
  titel: "Splitsen in delen",
  synthesis: "Add within 10 · Splitting Sums",
  kaarttekening: KaartStippen,

  async speel(l) {
    const stand = new Stippenstand(l);
    l.vlak(Stippen, { start: [7], sleutel: 0, getallen: true, tik: "breek" });

    /* 1. Ontdekken: tik, en de groep valt uit elkaar. */
    await l.zeg("Kijk eens naar deze {7} stippen.", "Tik erop.", "Kijk wat er gebeurt.");
    await wachtTot(l, (g) => g.length === 7, ["Tik op de stippen."]);
    ps(l, { actief: false });
    await l.zeg("Wauw!", "De groep is uit elkaar gesprongen.", "Kijk wat je er nog meer mee kunt.");
    await l.verder();

    ps(l, { tik: "eraf" });
    await l.zeg("Sleep stippen naar elkaar toe.", "Zo maak je groepjes.", "Tik op een groepje, dan springt er een stip af.");
    let samengevoegd = 0;
    let vorige = 7;
    while (samengevoegd < 2) {
      const g = await wachtTot(l, () => true, ["Sleep een stip op een andere stip."]);
      if (g.length < vorige) samengevoegd++;
      vorige = g.length;
    }
    await l.zeg("Mooi!", "Tik op de pijl als je klaar bent.");
    await l.verder();
    stand.zet([7], { tik: "eraf", actief: false });
    await l.zeg("Oké.", "Tijd voor een uitdaging.");

    /* 2. Welke som kun je maken met 7? En anders met 8. */
    ps(l, { actief: true });
    await l.zeg("Welke som kun je maken met {7}?", "Je mag de stippen gebruiken.");
    const k1 = await l.kies(schud(["1 + 3 + 2 + 1", "3 + 2 + 2 + 1", "2 + 1 + 2 + 1"]));
    ps(l, { actief: false });
    let hulp = false;
    if (k1 === "1 + 3 + 2 + 1") {
      await l.zeg("Goed zo!", "{1} plus {3} plus {2} plus {1} is {7}.");
      await l.verder();
    } else if (k1 === null) {
      hulp = true;
    } else {
      await l.zeg("Dat klopt niet helemaal.", `${somWoorden(losse(k1))} is samen {${optel(losse(k1))}}.`, "We hebben {7} stippen.");
      await l.verder();
      stand.zet([8], { tik: "eraf", actief: true });
      await l.zeg("We proberen het nog een keer.", "Nu hebben we {8} stippen.", "Welke som kun je maken met {8}?");
      const k2 = await l.kies(schud(["1 + 4 + 2 + 1", "2 + 3 + 2 + 2", "3 + 2 + 1 + 1"]));
      ps(l, { actief: false });
      if (k2 === "1 + 4 + 2 + 1") {
        await l.zeg("Goed zo!", "{1} plus {4} plus {2} plus {1} is {8}.");
        await l.verder();
      } else {
        if (k2 !== null) await l.zeg(`${somWoorden(losse(k2))} is samen {${optel(losse(k2))}}.`, "Dat is niet {8}.");
        hulp = true;
      }
    }
    if (hulp) await splitsHulp(l, stand);

    /* 3. De controle: welke wel, welke niet, welke drie. */
    let foutloos = true;
    foutloos = (await welkeSom(l, stand, 7, ["2 + 1 + 2 + 1", "1 + 3 + 2 + 1", "3 + 2 + 2 + 1", "2 + 2 + 1 + 1"], true)) && foutloos;
    foutloos = (await welkeSom(l, stand, 7, ["1 + 2 + 2 + 2", "2 + 1 + 3 + 1", "2 + 3 + 2 + 1", "2 + 2 + 2 + 1"], false)) && foutloos;
    await l.zeg("Nu denken we andersom.");
    foutloos = (await welkeSom(l, stand, 8, ["3 + 1 + 2 + 2", "2 + 2 + 2 + 2", "2 + 3 + 2 + 2", "1 + 2 + 2 + 3"], false)) && foutloos;
    foutloos =
      (await kiesMeerdere(l, stand, 7, ["2 + 2 + 1 + 1 + 1", "3 + 1 + 2 + 1", "1 + 2 + 1 + 2 + 1", "2 + 3 + 2 + 1"], 3, ["Tot slot: welke sommen kun je maken met {7}?"])) &&
      foutloos;

    /* Een fout in de controle: eerst oefenen, dan de controle nog één keer met andere sommen. */
    if (!foutloos) {
      await splitsOefenronde(l, stand);
      await welkeSom(l, stand, 8, ["1 + 3 + 2 + 1", "3 + 2 + 2 + 2", "2 + 1 + 2 + 2", "2 + 2 + 1 + 3"], true);
      await welkeSom(l, stand, 8, ["2 + 2 + 2 + 2", "1 + 2 + 2 + 3", "3 + 1 + 2 + 2", "2 + 3 + 2 + 2"], false);
      await kiesMeerdere(l, stand, 7, ["1 + 2 + 1 + 2 + 1", "2 + 3 + 2 + 1", "3 + 1 + 2 + 1", "2 + 2 + 1 + 1 + 1"], 3, ["Welke sommen kun je maken met {7}?"]);
    }

    /* Einde. */
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Goed gedaan!", "Je snapt hoe je een getal splitst.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ====================================================================== */
/* 7. Mastery Check                                                        */
/* ====================================================================== */

const eindtoets: Lesdraaiboek = {
  id: "optellen-tot-10-eindtoets",
  titel: "Eindtoets: optellen tot 10",
  synthesis: "Add within 10 · Mastery Check",
  kaarttegels: [3, 1],
  speel: (l) => toetsOptellen(l, "eind"),
};

export const LESSEN_OPTELLEN_TOT_10: Lesdraaiboek[] = [instaptoets, dubbelen, kloptDeSom, ontbrekendGetal, drieGetallen, splitsen, eindtoets];
