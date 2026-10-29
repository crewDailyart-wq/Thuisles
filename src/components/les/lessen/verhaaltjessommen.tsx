/**
 * Lessen: Verhaaltjessommen — naar Synthesis "Word Problems" (INSPIRATIE.md,
 * ronde 1 en 2, en blok J "Verhaaltje uitpluizen"). Groep 3.
 *
 * Groep 3 kan nog niet lezen: de mascotte leest het verhaal zin voor zin
 * voor, en eronder staat een tekening van wat er gebeurt (één soort per som,
 * hoogstens 5 op een rij). De som staat groot onderaan.
 *
 * De vaste route bij het uitpluizen, zoals Synthesis:
 * 1. tik op de getallen (gele cirkel);
 * 2. tik op de zin met de vraag (roze);
 * 3. erbij of eraf, en tik op de woorden die dat zeggen (groen);
 * 4. de som vakje voor vakje: welk getal eerst, welk getal erbij/eraf;
 * 5. naspelen in de tekening;
 * 6. het antwoord.
 * Bij een fout eerst een kleinere vraag of "tel nog eens", daarna samen.
 * Een foute keuze krijgt nooit het woord "fout".
 *
 * Munten uit Synthesis zijn hier knikkers: geld mag alleen met de officiële
 * afbeeldingen, en die horen niet in een verhaaltje met tikken.
 */

import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import {
  BLAUW,
  KRIJT_LETTER,
  Figuur,
  getallenIn,
  MINT,
  VerhaalBord,
  voorleeszin,
  type Plekstaat,
  type Somstuk,
  type VerhaalProps,
  type Verhaalsoort,
} from "../vlakken/verhaal-bord";
/* Sinds 28 oktober 2026 de bloementuin (eigen voorwerpenstijl, voorbeeld voor de eigenaar); het hologrambord blijft staan. */
import { knoppenOpPlek } from "./antwoordknoppen";
import { VerhaalTuin, type HoloSoort, type VerhaalHoloProps } from "../vlakken/verhaal-bliepo-tuin";
import { vierKeuzes } from "../holo/keuzes";
import { sfeerVoor, speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- kleine hulpjes ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** De naam van het kind in het verhaal, of "jij". */
/*
  In de verhaaltjes is het kind "jij", niet zijn naam (28 oktober 2026, stem van Ruth): de naam is een los
  stemfragment dat alleen bij het begin, na een mooie reeks en aan het eind klinkt; midden in een verhaalzin
  zou hij niet natuurlijk klinken en zou elke zin per kind opnieuw gemaakt moeten worden.
*/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wie = (_l: Lesgids) => "jij";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Wie = (_l: Lesgids) => "Jij";

/** Antwoordtegels: het goede getal en de afleiders, zonder dubbele, aangevuld tot `aantal`. Nooit boven de 20 (groep 3). */
function tegels(aantal: number, goed: number, ...andere: number[]): number[] {
  const uit = [goed];
  for (const x of [...andere, goed + 1, goed - 1, goed + 2, goed - 2, goed + 3]) {
    if (uit.length >= aantal) break;
    if (x >= 0 && x <= 20 && !uit.includes(x)) uit.push(x);
  }
  return schud(uit);
}

async function kiesGetal(l: Lesgids, opties: number[]): Promise<number | null> {
  const k = await l.kies(opties.map(String));
  return k === null ? null : Number(k);
}

const plekken = (aan: number, uit: number): Plekstaat[] => [...Array(aan).fill("aan"), ...Array(uit).fill("uit")];

/** Een som als tekst om voor te lezen: "{7} − {2} = {5}". */
const somZin = (a: number, op: string, b: number, c: number) => `{${a}} ${op} {${b}} = {${c}}.`;

/** Enkelvoud of meervoud: "1 ballon", "3 ballonnen". */
const mv = (n: number, enkelvoud: string, meervoud: string) => (n === 1 ? enkelvoud : meervoud);

/** "Er is nog {1} ballon over." of "Er zijn nog {5} ballonnen over." */
const nogOver = (n: number, enkelvoud: string, meervoud: string) => (n === 1 ? `Er is nog {1} ${enkelvoud} over.` : `Er zijn nog {${n}} ${meervoud} over.`);

/* ---------- het bord ---------- */

/** Houdt bij wat er op het bord staat, zodat het draaiboek erop kan rekenen. */
class Bord {
  p: VerhaalProps;
  constructor(
    private l: Lesgids,
    start: VerhaalProps,
  ) {
    this.p = start;
    l.vlak(VerhaalBord, start);
  }
  zet(extra: Partial<VerhaalProps>) {
    this.p = { ...this.p, ...extra };
    this.l.pasVlakAan<VerhaalProps>(extra);
  }
  /** Een nieuw verhaal: alles terug naar het begin. */
  nieuw(zinnen: string[], extra: Partial<VerhaalProps> = {}) {
    const leeg: VerhaalProps = {
      zinnen,
      zichtbaar: 0,
      stippelVoor: null,
      midden: false,
      omcirkeld: [],
      doorgestreept: [],
      vraagZin: null,
      flitsZin: null,
      signaalGroen: false,
      groeneZin: null,
      onbekendKleur: null,
      tik: null,
      plaatjes: null,
      geteld: [],
      tel: null,
      som: null,
      somActief: null,
      weetNiet: false,
      klaarKnop: false,
      ...extra,
    };
    this.p = leeg;
    this.l.pasVlakAan<VerhaalProps>(leeg);
  }
  somDeel(i: number, d: Somstuk) {
    this.zet({ som: (this.p.som ?? []).map((x, j) => (j === i ? d : x)) });
  }
  zetPlaatjes(soort: Verhaalsoort, aan: number, uit: number) {
    this.zet({ plaatjes: { soort, plekken: plekken(aan, uit) }, geteld: [], tel: null });
  }
}

/** De mascotte leest het verhaal voor; de zinnen verschijnen één voor één. */
async function vertel(b: Bord, l: Lesgids) {
  for (let i = 0; i < b.p.zinnen.length; i++) {
    b.zet({ zichtbaar: i + 1 });
    await l.zeg(voorleeszin(b.p.zinnen[i]));
  }
}

/** Wachten op een tik in het verhaal (of "Weet ik niet"). `hulp`: een tip als het kind na een tijdje nog niets doet. */
async function wachtTik(b: Bord, l: Lesgids, tik: "getal" | "zin" | "woord", hulp?: string[]): Promise<Vlakgebeurtenis> {
  b.zet({ tik, weetNiet: true });
  const p = l.wachtOpVlak(["getal", "zin", "woord", "weetniet"]);
  let klaar = false;
  const klok = hulp
    ? setTimeout(() => {
        if (!klaar) void l.zeg(...hulp).catch(() => {});
      }, 14000)
    : undefined;
  try {
    return await p;
  } finally {
    klaar = true;
    clearTimeout(klok);
    b.zet({ tik: null, weetNiet: false });
  }
}

/** Het kind speelt het verhaal na: precies `aantal` plaatjes weghalen of erbij doen. */
async function naspelen(b: Bord, l: Lesgids, aantal: number, modus: "weg" | "erbij") {
  const geteld: number[] = [];
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], tel: null });
  while (geteld.length < aantal) {
    const g = await l.wachtOpVlak<{ soort: string; i: number }>("plaatje");
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    geteld.push(g.i);
    const nieuw = pl.plekken.map((st, j) => (j === g.i ? (modus === "weg" ? "uit" : "aan") : st));
    b.zet({ plaatjes: { ...pl, plekken: nieuw }, geteld: [...geteld] });
  }
  b.zet({ tik: null });
  await l.wacht(600);
}

/** Het kind maakt zelf het verhaal: zoveel plaatjes als het wil, dan het vinkje. */
async function zelfKiezen(b: Bord, l: Lesgids, modus: "weg" | "erbij", max: number): Promise<number> {
  const geteld: number[] = [];
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], klaarKnop: false });
  while (geteld.length < max) {
    const g = await l.wachtOpVlak<{ soort: string; i: number }>(["plaatje", "klaar"]);
    if (g.soort === "klaar") {
      if (geteld.length > 0) break;
      continue;
    }
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    geteld.push(g.i);
    const nieuw = pl.plekken.map((st, j) => (j === g.i ? (modus === "weg" ? "uit" : "aan") : st));
    b.zet({ plaatjes: { ...pl, plekken: nieuw }, geteld: [...geteld], klaarKnop: true });
  }
  b.zet({ tik: null, klaarKnop: false });
  await l.wacht(500);
  return geteld.length;
}

/** Samen tellen: er komen nummers op de plaatjes in deze staat. */
async function telSamen(b: Bord, l: Lesgids, op: Plekstaat) {
  const n = b.p.plaatjes?.plekken.filter((st) => st === op).length ?? 0;
  b.zet({ geteld: [] });
  for (let t = 1; t <= n; t++) {
    b.zet({ tel: { op, tot: t } });
    await l.wacht(450);
  }
  await l.wacht(300);
}

/**
 * Het antwoord vragen (typen, of kiezen uit tegels). Bij de eerste fout:
 * terug naar het plaatje ("tel nog eens"); daarna samen tellen.
 * Geeft terug of het meteen goed was.
 */
async function vraagAntwoord(
  b: Bord,
  l: Lesgids,
  v: { antwoord: number; keuzes?: number[]; telTip: string; antwoordZin: string; telOp: Plekstaat },
): Promise<boolean> {
  for (let poging = 1; ; poging++) {
    const x = v.keuzes ? await kiesGetal(l, v.keuzes) : await l.getal();
    if (x === v.antwoord) return poging === 1;
    if (x !== null && poging === 1) {
      await l.zeg(`{${x}}? Niet helemaal.`, v.telTip);
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
    await telSamen(b, l, v.telOp);
    await l.zeg(v.antwoordZin);
    b.zet({ tel: null });
    return false;
  }
}

/* ---------- uitpluizen (Small en Bigger Problems) ---------- */

type Pluisverhaal = {
  zinnen: string[];
  soort: Verhaalsoort;
  /** Plaatjes aan het begin: zoveel aan, zoveel lege plekken. */
  aan: number;
  leeg: number;
  a: number;
  b: number;
  op: "+" | "−";
  vraagZin: number;
  watZoeken: string;
  signaalVraag: string;
  signaalTip: string;
  signaalUitleg: string;
  /** Eén zin waarom de andere keuze (erbij/eraf) niet past. */
  foutUitleg: string;
  kleineVraag: { zinnen: string[]; erbij: string; eraf: string; goed: string[] };
  beginVraag: string;
  beginAntwoord: string[];
  tweedeVraag: string;
  tweedeAntwoord: string[];
  naspelen: string[];
  antwoordVraag: string;
  telTip: string;
  antwoordZin: string;
  /** Antwoordtegels; zonder tegels typt het kind het antwoord. */
  keuzes?: number[];
  /** Bij naspelen met een meelopende som: wat de begeleider vraagt ("Doe er 5 knikkers bij."). */
  levendOpdracht?: string[];
};

const uitkomst = (v: { a: number; b: number; op: "+" | "−" }) => (v.op === "+" ? v.a + v.b : v.a - v.b);
const LEGE_SOM = (op: string): Somstuk[] => [{ t: "vraag" }, { t: "teken", s: op }, { t: "vraag" }, { t: "teken", s: "=" }, { t: "vraag" }];

/** Het verhaal op het bord zetten en voorlezen, met de plaatjes erbij. */
async function begin(b: Bord, l: Lesgids, v: Pluisverhaal) {
  b.nieuw(v.zinnen);
  b.zetPlaatjes(v.soort, v.aan, v.leeg);
  await vertel(b, l);
}

/**
 * Naspelen met een som die meeloopt (More Word Problems): de som begint als
 * "12 + 0 = 12" en verandert bij elke tik. Het kind tikt op het vinkje als
 * het klaar is; klopt het aantal niet, dan zegt de les dat en begint het
 * opnieuw. Zijn er genoeg, dan kan er niet meer getikt worden.
 */
async function levendNaspelen(b: Bord, l: Lesgids, a: number, op: "+" | "−", n: number, opdracht: string[]) {
  const modus = op === "+" ? "erbij" : "weg";
  const begin = b.p.plaatjes;
  const somNu = (k: number) =>
    b.zet({
      som: [{ t: "getal", n: a }, { t: "teken", s: op }, { t: "getal", n: k }, { t: "teken", s: "=" }, { t: "getal", n: op === "+" ? a + k : a - k }],
      somActief: null,
    });
  for (;;) {
    const geteld: number[] = [];
    somNu(0);
    b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], tel: null, klaarKnop: true });
    await l.zeg(...opdracht);
    for (;;) {
      const g = await l.wachtOpVlak<{ soort: string; i: number }>(["plaatje", "klaar"]);
      if (g.soort === "klaar") break;
      const pl = b.p.plaatjes;
      if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
      geteld.push(g.i);
      b.zet({ plaatjes: { ...pl, plekken: pl.plekken.map((st, j) => (j === g.i ? (modus === "weg" ? "uit" : "aan") : st)) }, geteld: [...geteld] });
      somNu(geteld.length);
      if (geteld.length === n) {
        b.zet({ tik: null });
        await l.zeg("Goed zo.", "Tik nu op het vinkje.");
      }
    }
    b.zet({ tik: null, klaarKnop: false });
    if (geteld.length === n) {
      b.zet({ geteld: [] });
      await l.wacht(300);
      return;
    }
    const gedaan = modus === "erbij" ? "bijgedaan" : "weggehaald";
    const moest = modus === "erbij" ? "bijdoen" : "weghalen";
    await l.zeg(`Ah, je hebt er {${geteld.length}} ${gedaan}.`, "Dat is niet genoeg.", `We moesten er {${n}} ${moest}.`);
    b.zet({ plaatjes: begin, geteld: [] });
  }
}

/** Het verhaal laat zichzelf gebeuren: de plaatjes gaan één voor één aan of uit. */
async function laatGebeuren(b: Bord, l: Lesgids, soort: Verhaalsoort, a: number, n: number, op: "+" | "−", plekkenTotaal: number) {
  for (let i = 1; i <= n; i++) {
    const aan = op === "+" ? a + i : a - i;
    b.zet({ plaatjes: { soort, plekken: plekken(aan, plekkenTotaal - aan) } });
    await l.wacht(200);
  }
}

/**
 * De hele uitpluis-route, stap voor stap.
 * `levend`: naspelen met een meelopende som en het vinkje (More Word Problems).
 * `zonderKeuze`: de vraag "erbij of eraf?" is al gesteld; meteen de woorden zoeken.
 */
async function pluisUit(b: Bord, l: Lesgids, v: Pluisverhaal, o: { levend?: boolean; zonderKeuze?: boolean } = {}) {
  const antwoord = uitkomst(v);
  const getallen = getallenIn(v.zinnen);

  /* Alleen de tekst, groot in het midden. */
  b.zet({ midden: true, som: null });
  await l.wacht(400);

  /* 1. De getallen. */
  await l.zeg("Tik op alle getallen in het verhaal.");
  const gevonden: string[] = [];
  while (gevonden.length < getallen.length) {
    const g = await wachtTik(b, l, "getal");
    if (g.soort === "weetniet") {
      b.zet({ omcirkeld: getallen.map((x) => x.sleutel) });
      await l.zeg("Kijk, hier staan de getallen.");
      break;
    }
    const sleutel = g.sleutel as string;
    if (gevonden.includes(sleutel)) continue;
    gevonden.push(sleutel);
    b.zet({ omcirkeld: [...gevonden] });
    if (gevonden.length < getallen.length) await l.zeg("Je hebt één getal.", "Tik nu op het andere.");
  }
  await l.zeg(`Ja, {${v.a}} en {${v.b}}.`, "Dat is een goed begin.");

  /* 2. De vraag. */
  await l.zeg("Wat moeten we uitzoeken?", "Tik op de zin met de vraag.");
  for (let fout = 0; ; ) {
    const g = await wachtTik(b, l, "zin");
    if (g.soort === "zin" && g.i === v.vraagZin) {
      b.zet({ vraagZin: v.vraagZin });
      await l.zeg("Dat klopt.", v.watZoeken);
      break;
    }
    if (g.soort === "zin") {
      b.zet({ flitsZin: g.i as number });
      await l.wacht(700);
      b.zet({ flitsZin: null });
    }
    fout++;
    if (g.soort === "weetniet" || fout >= 2) {
      b.zet({ vraagZin: v.vraagZin });
      await l.zeg("Kijk, deze zin stelt de vraag.", "Hij eindigt met een vraagteken.", v.watZoeken);
      break;
    }
    await l.zeg("Hm, goed geprobeerd.", "Maar die zin stelt geen vraag.");
    await l.verder();
    await l.zeg("Ik geef je een tip.", "Zoek de zin die eindigt met een vraagteken.", "Tik dan op die zin.");
  }

  /* 3. Erbij of eraf, en de woorden die dat zeggen. */
  let keuze: string | null = v.op === "+" ? "Erbij" : "Eraf";
  if (!o.zonderKeuze) {
    await l.zeg("Is het een plussom of een minsom?", "Komt er iets bij, of gaat er iets af?");
    keuze = await l.kies(["Erbij", "Eraf"]);
  }
  if (keuze === (v.op === "+" ? "Erbij" : "Eraf")) {
    await l.zeg(o.zonderKeuze ? "" : "Heel goed.", v.signaalVraag);
    for (let fout = 0; ; ) {
      const g = await wachtTik(b, l, "woord", fout === 0 ? [v.signaalTip] : undefined);
      if (g.soort === "woord" && g.signaal) {
        b.zet({ signaalGroen: true });
        await l.zeg("Goed gezien.", v.signaalUitleg);
        break;
      }
      fout++;
      if (g.soort === "weetniet" || fout >= 2) {
        b.zet({ signaalGroen: true });
        await l.zeg("Kijk, hier staat het.", v.signaalUitleg);
        break;
      }
      await l.zeg(v.signaalTip);
    }
  } else {
    /* Een kleinere vraag, in gewone woorden. Daarna geen woordenstap meer. */
    if (keuze === null) await l.zeg("Geen zorgen.", "Ik vraag het anders.");
    else await l.zeg("Goed geprobeerd.", v.foutUitleg);
    await l.zeg(...v.kleineVraag.zinnen);
    const k2 = await l.kies([v.kleineVraag.erbij, v.kleineVraag.eraf]);
    b.zet({ signaalGroen: true });
    if (k2 === (v.op === "+" ? v.kleineVraag.erbij : v.kleineVraag.eraf)) await l.zeg("Precies.", ...v.kleineVraag.goed);
    else await l.zeg("Kijk naar de groene woorden.", ...v.kleineVraag.goed);
  }

  /* 4. De som, vakje voor vakje. De tekening komt terug. */
  b.zet({ midden: false, som: LEGE_SOM(v.op), somActief: 0 });
  b.zetPlaatjes(v.soort, v.aan, v.leeg);
  const streep = (n: number) => {
    const plek = getallen.find((x) => x.n === n && !(b.p.doorgestreept ?? []).includes(x.sleutel));
    if (plek) b.zet({ doorgestreept: [...(b.p.doorgestreept ?? []), plek.sleutel] });
  };
  await l.zeg("We weten nu alles voor de som.", "Welk getal zetten we *eerst*?");
  if (v.a !== v.b) {
    const opties = [v.a, v.b].sort((x, y) => x - y);
    let k = await kiesGetal(l, opties);
    if (k !== v.a) {
      if (k !== null && v.op === "+") {
        await l.zeg("Dat mag ook.", "Maar we volgen het verhaal.", ...v.beginAntwoord);
      } else {
        await l.zeg(k === null ? "Geen zorgen." : `{${k}}? Niet helemaal.`, v.beginVraag);
        k = await kiesGetal(l, opties);
        if (k !== v.a) await l.zeg(...v.beginAntwoord);
      }
    }
  }
  b.somDeel(0, { t: "getal", n: v.a });
  streep(v.a);
  b.zet({ somActief: 2 });
  await l.zeg("Goed.", v.tweedeVraag);
  if (v.a !== v.b) {
    const k = await kiesGetal(l, [v.a, v.b].sort((x, y) => x - y));
    if (k !== v.b) await l.zeg(...v.tweedeAntwoord);
  }
  b.somDeel(2, { t: "getal", n: v.b });
  streep(v.b);
  b.zet({ somActief: 4 });

  /* 5. Naspelen. */
  if (o.levend) {
    await l.zeg("Mooi, alles staat klaar.");
    await levendNaspelen(b, l, v.a, v.op, v.b, v.levendOpdracht ?? v.naspelen.slice(-1));
  } else {
    await l.zeg("Mooi, alles staat klaar.", ...v.naspelen);
    await naspelen(b, l, v.b, v.op === "+" ? "erbij" : "weg");
  }

  /* 6. Het antwoord. */
  await l.zeg(v.antwoordVraag);
  const meteen = await vraagAntwoord(b, l, { ...v, antwoord, telOp: "aan" });
  b.somDeel(4, { t: "getal", n: antwoord });
  b.zet({ somActief: null, geteld: [] });
  await l.zeg(meteen ? "Heel goed gedaan." : "Kijk, nu is de som af.", somZin(v.a, v.op, v.b, antwoord));
}

/**
 * Een verhaal dat het kind meteen zelf probeert. Lukt het in één keer, dan
 * spelen we het alleen nog na; anders pluizen we het samen uit.
 */
async function meteenProberen(b: Bord, l: Lesgids, v: Pluisverhaal) {
  const antwoord = uitkomst(v);
  await l.zeg("Laat maar zien.", v.antwoordVraag);
  const x = v.keuzes ? await kiesGetal(l, v.keuzes) : await l.getal();
  if (x === antwoord) {
    b.zet({ som: [{ t: "getal", n: v.a }, { t: "teken", s: v.op }, { t: "getal", n: v.b }, { t: "teken", s: "=" }, { t: "getal", n: antwoord }] });
    await l.zeg("Knap!", somZin(v.a, v.op, v.b, antwoord), ...v.naspelen);
    await naspelen(b, l, v.b, v.op === "+" ? "erbij" : "weg");
    await l.zeg("Zie je wel?", v.antwoordZin);
    return;
  }
  await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, "We doen het samen stap voor stap.");
  b.zetPlaatjes(v.soort, v.aan, v.leeg);
  await pluisUit(b, l, v);
}

/* ---------- de verhalen ---------- */

function vogels(): Pluisverhaal {
  return {
    zinnen: ["Er zitten 7 vogels op een draad.", "Er [vliegen] 2 [weg].", "Hoeveel vogels zijn er nog over?"],
    soort: "vogel",
    aan: 7,
    leeg: 0,
    a: 7,
    b: 2,
    op: "−",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel vogels er nog over zijn.",
    signaalVraag: "Tik op de woorden die zeggen dat het eraf gaat.",
    signaalTip: "Tip: tik op de woorden die zeggen wat de vogels doen.",
    signaalUitleg: "Er vliegen vogels weg.",
    foutUitleg: "Maar er komen geen vogels bij.",
    kleineVraag: {
      zinnen: ["Er vliegen vogels weg.", "Komen er dan vogels bij?", "Of gaan er vogels weg?"],
      erbij: "Er komen vogels bij",
      eraf: "Er gaan vogels weg",
      goed: ["Er gaan vogels weg.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel vogels zaten er eerst op de draad?",
    beginAntwoord: ["Er zaten eerst {7} vogels.", "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeAntwoord: ["Er vliegen {2} vogels weg.", "Dus halen we {2} eraf."],
    naspelen: ["Je weet het antwoord vast al.", "Laat de {2} vogels toch maar wegvliegen.", "Tik op {2} vogels."],
    antwoordVraag: "Hoeveel vogels zijn er dus over?",
    telTip: "Tel de vogels die er nog zitten.",
    antwoordZin: "Er zijn nog {5} vogels over.",
  };
}

function bloemenErbij(l: Lesgids, start: number, erbij: number, plekkenTotaal: number, gemaakt: boolean): Pluisverhaal {
  const som = start + erbij;
  return {
    zinnen: gemaakt
      ? [`Er stonden ${start} bloemen in een tuin.`, `${Wie(l)} plantte er ${erbij} [bij].`, "Hoeveel bloemen staan er nu in de tuin?"]
      : [`Er staan ${start} bloemen in een tuin.`, erbij === 1 ? "Er komt nog 1 bloem [bij]." : `Er komen nog ${erbij} bloemen [bij].`, "Hoeveel bloemen zijn er nu samen?"],
    soort: "bloem",
    aan: start,
    leeg: plekkenTotaal - start,
    a: start,
    b: erbij,
    op: "+",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel bloemen er nu samen zijn.",
    signaalVraag: "Tik op het woord dat zegt dat er iets bijkomt.",
    signaalTip: "Tip: tik op het woord dat zegt wat er met de bloemen gebeurt.",
    signaalUitleg: "Het woord *bij* zegt dat er bloemen bijkomen.",
    foutUitleg: "Maar er gaan geen bloemen weg.",
    kleineVraag: {
      zinnen: ["Er komen bloemen bij.", "Worden het er dan meer?", "Of worden het er minder?"],
      erbij: "Meer",
      eraf: "Minder",
      goed: ["Het worden er meer.", "Dus het is erbij."],
    },
    beginVraag: "Hoeveel bloemen stonden er eerst?",
    beginAntwoord: [`Er stonden eerst {${start}} bloemen.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal doen we erbij?",
    tweedeAntwoord: [erbij === 1 ? "Er komt {1} bloem bij." : `Er komen {${erbij}} bloemen bij.`, `Dus doen we {${erbij}} erbij.`],
    naspelen: [
      "Je weet het antwoord vast al.",
      erbij === 1 ? "Laat die bloem toch maar groeien." : `Laat de {${erbij}} bloemen toch maar groeien.`,
      `Tik op {${erbij}} ${mv(erbij, "leeg potje", "lege potjes")}.`,
    ],
    antwoordVraag: "Hoeveel bloemen zijn er nu?",
    telTip: "Tel alle bloemen.",
    antwoordZin: `Er zijn nu {${som}} bloemen.`,
  };
}

function ballonnen(l: Lesgids, start: number, weg: number, gemaakt: boolean, keuzes?: number[]): Pluisverhaal {
  const over = start - weg;
  return {
    zinnen: gemaakt
      ? [`${Wie(l)} blies ${start} ballonnen op.`, `Daarna liet ${wie(l)} er ${weg} [knappen].`, "Hoeveel ballonnen zijn er nog over?"]
      : [`Er zijn ${start} ballonnen op een feestje.`, weg === 1 ? "Er [vliegt] 1 [weg]." : `Er [vliegen] ${weg} [weg].`, "Hoeveel ballonnen zijn er nog over?"],
    soort: "ballon",
    aan: start,
    leeg: 0,
    a: start,
    b: weg,
    op: "−",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel ballonnen er nog over zijn.",
    signaalVraag: gemaakt ? "Tik op het woord dat zegt dat het eraf gaat." : "Tik op de woorden die zeggen dat het eraf gaat.",
    signaalTip: gemaakt ? "Tip: tik op wat er met de ballonnen gebeurt." : "Tip: tik op de woorden die zeggen wat de ballonnen doen.",
    signaalUitleg: gemaakt ? "Er knappen ballonnen." : "Er vliegen ballonnen weg.",
    foutUitleg: "Maar er komen geen ballonnen bij.",
    kleineVraag: {
      zinnen: gemaakt
        ? ["Er knappen ballonnen.", "Komen er dan ballonnen bij?", "Of gaan er ballonnen weg?"]
        : ["Er vliegen ballonnen weg.", "Komen er dan ballonnen bij?", "Of gaan er ballonnen weg?"],
      erbij: "Er komen ballonnen bij",
      eraf: "Er gaan ballonnen weg",
      goed: ["Er gaan ballonnen weg.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel ballonnen waren er eerst?",
    beginAntwoord: [`Er waren eerst {${start}} ballonnen.`, "Die zetten we vooraan."],
    tweedeVraag: gemaakt ? "En welk getal halen we eraf?" : "En welk getal zegt hoeveel er wegvliegen?",
    tweedeAntwoord: [
      gemaakt ? (weg === 1 ? "Er knapt {1} ballon." : `Er knappen {${weg}} ballonnen.`) : weg === 1 ? "Er vliegt {1} ballon weg." : `Er vliegen {${weg}} ballonnen weg.`,
      `Dus halen we {${weg}} eraf.`,
    ],
    naspelen: gemaakt
      ? ["Je weet het antwoord vast al.", weg === 1 ? "Laat die ballon toch nog eens knappen." : `Laat de {${weg}} ballonnen toch nog eens knappen.`]
      : ["De som staat klaar.", weg === 1 ? "Tik op de ballon die wegvliegt." : `Tik op de {${weg}} ballonnen die wegvliegen.`],
    antwoordVraag: "Hoeveel ballonnen zijn er nog over?",
    telTip: "Tel de ballonnen die er nog zijn.",
    antwoordZin: nogOver(over, "ballon", "ballonnen"),
    keuzes,
  };
}

function lampjes(l: Lesgids, start: number, uit: number, keuzes?: number[]): Pluisverhaal {
  const nog = start - uit;
  return {
    zinnen: [`Er branden ${start} lampjes.`, `${Wie(l)} doet er ${uit} [uit].`, "Hoeveel lampjes branden er nog?"],
    soort: "lampje",
    aan: start,
    leeg: 0,
    a: start,
    b: uit,
    op: "−",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel lampjes er nog blijven branden.",
    signaalVraag: "Tik op het woord dat zegt dat er lampjes uitgaan.",
    signaalTip: "Tip: tik op het woord dat zegt wat er met de lampjes gebeurt.",
    signaalUitleg: "Het woord *uit* zegt dat er minder lampjes branden.",
    foutUitleg: "Maar er gaan lampjes uit.",
    kleineVraag: {
      zinnen: ["Er gaan lampjes uit.", "Branden er dan meer lampjes?", "Of minder?"],
      erbij: "Meer",
      eraf: "Minder",
      goed: ["Er branden minder lampjes.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel lampjes brandden er eerst?",
    beginAntwoord: [`Eerst brandden er {${start}} lampjes.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal zegt hoeveel er uitgaan?",
    tweedeAntwoord: [uit === 1 ? "Er gaat {1} lampje uit." : `Er gaan {${uit}} lampjes uit.`, `Dus halen we {${uit}} eraf.`],
    naspelen: ["De som staat klaar.", uit === 1 ? "Tik op {1} lampje om het uit te doen." : `Tik op {${uit}} lampjes om ze uit te doen.`],
    antwoordVraag: "Hoeveel lampjes branden er nog?",
    telTip: "Tel de lampjes die nog branden.",
    antwoordZin: nog === 1 ? "Er brandt nog {1} lampje." : `Er branden nog {${nog}} lampjes.`,
    keuzes,
  };
}

/* ---------- "omgekeerde" verhalen (Mixed Problems) ---------- */

type Omgekeerd = {
  zinnen: string[];
  soort: Verhaalsoort;
  ding: string;
  /** Begin, verandering, eind; `null` is het onbekende getal. */
  delen: [number | null, number | null, number];
  op: "+" | "−";
  /** Zin over de verandering (wordt groen als hint). */
  veranderZin: number;
  waarom: string;
  groterKleiner: { vraag: string[]; opties: [string, string]; goed: string[] };
  vragen: [string, string, string];
  /** Wat een getal uit het verhaal betekent, als het kind het op de verkeerde plek zet. */
  betekenis: Record<number, string>;
  onbekendKnop: string;
  rekenVraag: string;
  antwoordZin: string;
  somKeuzes: string[];
  goedeSom: string;
};

const WEET_NIET = "Dat weten we nog niet";

async function omgekeerd(b: Bord, l: Lesgids, v: Omgekeerd) {
  const onbekend = v.delen[0] === null ? 0 : 1;
  const [p, q, eind] = v.delen;
  const antwoord = v.op === "+" ? eind - (p ?? q ?? 0) : (p ?? 0) - eind;
  const kleur = onbekend === 0 ? BLAUW : MINT;
  const getallen = [...new Set(v.delen.filter((x): x is number => x !== null))].sort((x, y) => x - y);
  const somPlek = [0, 2, 4];

  b.nieuw(v.zinnen, { stippelVoor: v.zinnen.length - 1 });
  await vertel(b, l);
  b.zet({ som: [{ t: "leeg" }, { t: "leeg", smal: true }, { t: "leeg" }, { t: "teken", s: "=" }, { t: "leeg" }] });

  await l.zeg("In dit verhaal is een getal verstopt.", "Denk je dat je het zelf kunt?");
  const zelf = await l.kies(["Ja", "Nee"]);
  let gebouwd = false;
  if (zelf === "Ja") {
    await l.zeg("Mooi.", "Welke som past bij het verhaal?");
    const k = await l.kies(schud(v.somKeuzes));
    if (k === v.goedeSom) {
      const som: Somstuk[] = [
        p === null ? { t: "vraag", kleur } : { t: "getal", n: p },
        { t: "teken", s: v.op },
        q === null ? { t: "vraag", kleur } : { t: "getal", n: q },
        { t: "teken", s: "=" },
        { t: "getal", n: eind },
      ];
      b.zet({ som, onbekendKleur: kleur });
      await l.zeg("Precies.");
      gebouwd = true;
    } else {
      if (k === null) await l.zeg("Geen zorgen.", "We doen het samen stap voor stap.");
      else await l.zeg(`${k.replace(/(\d+)/g, "{$1}")}?`, "Niet helemaal.", "Zullen we het samen stap voor stap doen?");
    }
  } else {
    await l.zeg("Zulke sommen zijn in het begin lastig.", "We doen het samen stap voor stap.");
  }

  if (!gebouwd) {
    /* Erbij of eraf. */
    await l.zeg("Eerst: komt er iets bij, of gaat er iets af?");
    const k = await l.kies(["Erbij", "Eraf"]);
    if (k === (v.op === "+" ? "Erbij" : "Eraf")) {
      await l.zeg("Precies.", v.waarom);
    } else {
      b.zet({ groeneZin: v.veranderZin });
      await l.zeg(...v.groterKleiner.vraag);
      const k2 = await l.kies(v.groterKleiner.opties);
      await l.zeg(k2 === v.groterKleiner.opties[0] ? "Precies." : "Kijk naar de groene zin.", ...v.groterKleiner.goed);
      b.zet({ groeneZin: null });
    }
    b.somDeel(1, { t: "teken", s: v.op });

    /* Het begin, de verandering en het eind, één voor één. */
    for (let j = 0; j < 3; j++) {
      b.zet({ somActief: somPlek[j] });
      await l.zeg(j === 0 ? "Denk hier goed over na." : "", v.vragen[j]);
      const goed = v.delen[j];
      let knop = WEET_NIET;
      for (let poging = 1; ; poging++) {
        const keuze = await l.kies([...getallen.map(String), knop]);
        const isGoed = goed === null ? keuze === knop : keuze === String(goed);
        if (isGoed) {
          if (goed === null) {
            b.somDeel(somPlek[j], { t: "vraag", kleur });
            b.zet({ onbekendKleur: kleur, groeneZin: null });
            await l.zeg("Goed.", "Dat weten we nog niet.", "Daarom zetten we een vraagteken.");
          } else {
            b.somDeel(somPlek[j], { t: "getal", n: goed });
            await l.zeg(`Precies, {${goed}}.`);
          }
          break;
        }
        if (goed === null && poging === 1 && keuze !== null && keuze !== knop) {
          /* Een getal uit het verhaal op de plek van het onbekende. */
          b.zet({ groeneZin: v.veranderZin });
          knop = v.onbekendKnop;
          await l.zeg(`{${keuze}}?`, v.betekenis[Number(keuze)] ?? "Dat getal hoort ergens anders.", "Kijk naar de groene zin.");
          continue;
        }
        if (goed === null) {
          b.somDeel(somPlek[j], { t: "vraag", kleur });
          b.zet({ onbekendKleur: kleur, groeneZin: null });
          await l.zeg("Dat getal staat niet in het verhaal.", "Dat weten we dus nog niet.", "Daarom zetten we een vraagteken.");
        } else {
          b.somDeel(somPlek[j], { t: "getal", n: goed });
          await l.zeg("Kijk nog eens naar het verhaal.", v.betekenis[goed]);
        }
        break;
      }
    }
    b.zet({ somActief: null });
    await l.zeg("We hebben de som gebouwd.");
  }

  /* Rekenen. */
  b.zet({ somActief: somPlek[onbekend] });
  await l.zeg(v.rekenVraag);
  const x = await l.getal();
  const zetAntwoord = () => {
    b.somDeel(somPlek[onbekend], { t: "getal", n: antwoord });
    b.zet({ somActief: null });
  };
  if (x === antwoord) {
    zetAntwoord();
    await l.zeg(v.antwoordZin, "De som ziet er goed uit.", "Maar we controleren hem even.");
  } else {
    /* Het plaatje komt erbij en we rekenen terug. */
    await l.zeg(x === null ? "Geen zorgen." : "Hm.", "We kijken samen.");
    if (onbekend === 0) {
      b.zetPlaatjes(v.soort, eind, 0);
      await l.zeg(`Dit zijn alle {${eind}} ${v.ding}.`, `Haal de {${q}} weg die erbij kwamen.`);
      await naspelen(b, l, q ?? 0, "weg");
      await l.zeg("Zoveel waren er in het begin.", `Hoeveel ${v.ding} zijn het?`);
      await vraagAntwoord(b, l, {
        antwoord,
        telTip: `Tel de ${v.ding} die er nog zijn.`,
        antwoordZin: `Het zijn er {${antwoord}}.`,
        telOp: "aan",
      });
    } else {
      b.zetPlaatjes(v.soort, p ?? 0, 0);
      await l.zeg(`Kijk, {${p}} ${v.ding}.`, `Doe ze uit tot er nog {${eind}} branden.`);
      await naspelen(b, l, antwoord, "weg");
      await l.zeg(`Nu branden er nog {${eind}}.`, "Hoeveel heb je er uitgedaan?");
      await vraagAntwoord(b, l, {
        antwoord,
        telTip: `Tel de ${v.ding} die uit zijn.`,
        antwoordZin: `Het zijn er {${antwoord}}.`,
        telOp: "uit",
      });
    }
    zetAntwoord();
    await l.zeg(`Dus het getal is {${antwoord}}.`, "Nu controleren we de som.");
  }

  /* De controle: het verhaal vooruit naspelen. */
  if (onbekend === 0) {
    b.zetPlaatjes(v.soort, antwoord, q ?? 0);
    await l.zeg(`In het begin waren er {${antwoord}} ${v.ding}.`, `Er kwamen er {${q}} bij.`, "Kun je die er nu bij doen?");
    await naspelen(b, l, q ?? 0, "erbij");
    await l.zeg("Kijk eens.", `Er zijn nu samen {${eind}} ${v.ding}.`);
  } else {
    b.zetPlaatjes(v.soort, p ?? 0, 0);
    await l.zeg(`Er waren {${p}} ${v.ding}.`, `Er gingen er {${antwoord}} uit.`, "Kun je die nu uitdoen?");
    await naspelen(b, l, antwoord, "weg");
    await l.zeg("Kijk eens.", `Nu branden er nog {${eind}} ${v.ding}.`);
  }
  await l.verder();
}

/* ---------- toetsvragen (Assessment en Mastery Check) ---------- */

/**
 * Lampjes uitdoen: meteen het antwoord kiezen uit vier. `voorDeVraag` komt
 * tussen het verhaal en de vraag (bij de instaptoets: "weet je hoe dit moet?").
 */
async function toetsLampjes(b: Bord, l: Lesgids, start: number, uit: number, keuzes: number[], voorDeVraag?: () => Promise<boolean>): Promise<boolean> {
  const nog = start - uit;
  b.nieuw([`Er branden ${start} lampjes.`, `${Wie(l)} doet er ${uit} uit.`, "Hoeveel lampjes branden er nog?"]);
  b.zetPlaatjes("lampje", start, 20 - start);
  await vertel(b, l);
  if (voorDeVraag && !(await voorDeVraag())) return false;
  await l.zeg("Wat denk jij?", "Hoeveel lampjes blijven er branden?");
  for (let poging = 1; ; poging++) {
    const x = await kiesGetal(l, keuzes);
    if (x === nog) {
      await l.zeg("Goed zo.", `Er branden er nog {${nog}}.`);
      break;
    }
    if (x !== null && poging === 1) {
      await l.zeg(`{${x}}?`, Math.abs(x - nog) <= 1 ? "Dat is heel dichtbij." : "Niet helemaal.", "Kijk nog eens.");
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen." : "Niet helemaal.", `Er blijven er {${nog}} branden.`);
    break;
  }
  /* Als controle gaan de lampjes echt uit, één voor één. */
  for (let i = 1; i <= uit; i++) {
    b.zet({ plaatjes: { soort: "lampje", plekken: plekken(start - i, 20 - start + i) } });
    await l.wacht(180);
  }
  b.zet({ som: [{ t: "getal", n: start }, { t: "teken", s: "−" }, { t: "getal", n: uit }, { t: "teken", s: "=" }, { t: "getal", n: nog }] });
  await l.verder();
  return true;
}

/**
 * Het begin van een toets, zoals Synthesis: "Weet je hoe je zulke sommen
 * oplost?" Bij ja mag het kind kiezen: de toets, of naar de eerste les.
 * Geeft `false` als het kind voor de les kiest.
 */
async function toetsOfLes(l: Lesgids): Promise<boolean> {
  await l.zeg("Weet je hoe je zulke verhaaltjessommen oplost?");
  const weet = await l.kies(["Ja", "Nee"]);
  if (weet !== "Ja") {
    await l.zeg("Geen zorgen.", "Probeer het gewoon.");
    return true;
  }
  await l.zeg("Oké.", "Wil je in een toets laten zien wat je kunt?", "Of doen we samen de lessen?");
  const keuze = await l.kies(["Toets", "Eerste les"]);
  if (keuze === "Eerste les") {
    await l.zeg("Prima.", 'Begin dan met de les "Kleine verhaaltjes".', "Daar doen we het samen.");
    return false;
  }
  await l.zeg("Mooi.");
  return true;
}

/** Bloemen erbij met het eind bekend: eerst de som kiezen, dan het antwoord. */
async function toetsBloemen(b: Bord, l: Lesgids, start: number, eind: number, somKeuzes: string[], keuzes: number[]) {
  const erbij = eind - start;
  b.nieuw(
    [`Er staan ${start} bloemen in een tuin.`, `${Wie(l)} plantte er nog wat bij.`, `Nu zijn het er samen ${eind}.`, `Hoeveel bloemen plantte ${wie(l)}?`],
    { stippelVoor: 3 },
  );
  await vertel(b, l);
  await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
  const goedeSom = `${start} + ? = ${eind}`;
  const k = await l.kies(schud(somKeuzes));
  const som: Somstuk[] = [{ t: "getal", n: start }, { t: "teken", s: "+" }, { t: "vraag", kleur: MINT }, { t: "teken", s: "=" }, { t: "getal", n: eind }];
  b.zet({ som });
  if (k === goedeSom) await l.zeg("Goed.", `Hoeveel bloemen plantte ${wie(l)} dan?`);
  else await l.zeg(k === null ? "Geen zorgen." : "Die past niet.", "Er komen bloemen bij.", `Deze som past: {${start}} + ? = {${eind}}.`, `Hoeveel bloemen plantte ${wie(l)}?`);
  for (let poging = 1; ; poging++) {
    const x = await kiesGetal(l, keuzes);
    if (x === erbij) {
      await l.zeg("Precies.", `Er kwamen {${erbij}} bloemen bij.`);
      break;
    }
    if (x !== null && poging === 1) {
      await l.zeg(`{${x}}?`, Math.abs(x - erbij) <= 1 ? "Dat is heel dichtbij." : "Niet helemaal.", "Kijk nog eens.");
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen." : "Niet helemaal.", `Er kwamen {${erbij}} bloemen bij.`);
    break;
  }
  b.somDeel(2, { t: "getal", n: erbij });
  /* Als controle groeien de bloemen. */
  b.zetPlaatjes("bloem", start, erbij);
  await l.wacht(300);
  for (let i = 1; i <= erbij; i++) {
    b.zet({ plaatjes: { soort: "bloem", plekken: plekken(start + i, erbij - i) } });
    await l.wacht(180);
  }
  await l.verder();
}

/* ---------- kaarttekeningen (244 × 190) ---------- */

function Rijtje({ soort, aantal, x, y, maat = 36, uit = 0 }: { soort: Verhaalsoort; aantal: number; x: number; y: number; maat?: number; uit?: number }) {
  return (
    <>
      {Array.from({ length: aantal }, (_, i) => (
        <g key={i} transform={`translate(${x + (i % 5) * (maat + 4)} ${y + Math.floor(i / 5) * (maat + 6)}) scale(${maat / 60})`}>
          <Figuur soort={soort} nr={i} staat={i >= aantal - uit ? "uit" : "aan"} />
        </g>
      ))}
    </>
  );
}

function KrijtSom({ tekst, x, y }: { tekst: string; x: number; y: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill="#f3f1ea" fontSize="30" style={{ fontFamily: KRIJT_LETTER }}>
      {tekst}
    </text>
  );
}

function KaartToets() {
  return (
    <>
      <Rijtje soort="lampje" aantal={5} x={22} y={30} maat={36} uit={2} />
      <Rijtje soort="bloem" aantal={5} x={22} y={100} maat={36} />
    </>
  );
}
function KaartKlein() {
  return <Rijtje soort="ballon" aantal={10} x={22} y={30} maat={36} />;
}
function KaartGroot() {
  return (
    <>
      <g transform="translate(82 16) scale(1.3)">
        <Figuur soort="vogel" nr={1} />
      </g>
      <KrijtSom tekst="15 − 7 = 8" x={122} y={150} />
    </>
  );
}
function KaartOmgekeerd() {
  return (
    <>
      <g transform="translate(86 12) scale(1.2)">
        <Figuur soort="lampje" />
      </g>
      <KrijtSom tekst="5 + ? = 12" x={122} y={150} />
    </>
  );
}

/* ---------- de lessen ---------- */

const instaptoetsOud: Lesdraaiboek = {
  id: "verhaal-instaptoets",
  titel: "Instaptoets: verhaaltjessommen",
  synthesis: "Word Problems · Assessment",
  kaarttekening: KaartToets,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });
    await l.zeg("Ik heb een verhaaltjessom voor je.", "Ik lees hem voor.");
    if (!(await toetsLampjes(b, l, 17, 9, [7, 8, 9, 17], () => toetsOfLes(l)))) return;

    await toetsBloemen(b, l, 7, 15, ["7 + ? = 15", "7 + 15 = ?", "7 − ? = 15"], [7, 8, 9, 15]);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je hebt lastige verhaaltjessommen opgelost.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const kleineVerhalenOud: Lesdraaiboek = {
  id: "verhaal-kleine-verhalen",
  titel: "Kleine verhaaltjes",
  synthesis: "Word Problems · Small Problems",
  kaarttekening: KaartKlein,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });

    /* 1. Vogels: 7 − 2. */
    const v1 = vogels();
    await l.zeg("We gaan verhaaltjessommen maken.", "Luister goed.");
    await begin(b, l, v1);
    await l.zeg("Heb je hulp nodig bij deze?");
    const hulp = await l.kies(["Ja", "Nee"]);
    if (hulp === "Nee") {
      await meteenProberen(b, l, v1);
    } else {
      await l.zeg("Geen probleem.", "We kijken stap voor stap naar het verhaal.", "Dan snappen we wat er gevraagd wordt.");
      await pluisUit(b, l, v1);
    }
    await l.verder();

    /* 2. Bloemen: 5 + 3, en omwisselen. */
    const v2 = bloemenErbij(l, 5, 3, 10, false);
    await begin(b, l, v2);
    await l.zeg("Denk je dat je het antwoord al weet?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") {
      await meteenProberen(b, l, v2);
    } else {
      await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
      await pluisUit(b, l, v2);
    }
    await l.zeg("Je deed dus {5} plus {3}.", "Wissel de getallen nu eens om.", "Krijg je dan hetzelfde antwoord?");
    const om = await l.kies(["Ja", "Nee"]);
    b.zet({ som: [{ t: "getal", n: 3 }, { t: "teken", s: "+" }, { t: "getal", n: 5 }, { t: "teken", s: "=" }, { t: "getal", n: 8 }] });
    if (om === "Ja") await l.zeg("Natuurlijk.", "Bij plussen mag je de getallen wisselen.", "Het antwoord blijft {8}.");
    else await l.zeg("Kijk maar.", "{3} + {5} is ook {8}.", "Bij plussen mag je de getallen wisselen.");
    await l.verder();

    /* 3. Zelf een verhaal maken: ballonnen laten knappen. */
    b.nieuw([]);
    b.zetPlaatjes("ballon", 10, 0);
    await l.zeg("Nu bepaal jij het verhaal.", "Laat een paar ballonnen knappen.", "Tik op het vinkje als je klaar bent.");
    const knal = await zelfKiezen(b, l, "weg", 9);
    await l.zeg("Goed zo.", "Ik lees jouw verhaal voor.");
    const v3 = ballonnen(l, 10, knal, true);
    await begin(b, l, v3);
    await l.zeg("Wat denk je?", "Kun je deze meteen oplossen?");
    const meteen = await l.kies(["Ja", "Nee"]);
    if (meteen === "Ja") {
      await l.zeg("Mooi.", "Welke som past bij het verhaal?");
      const goed = `10 − ${knal}`;
      const k = await l.kies(schud([`10 + ${knal}`, `${10 + knal} − 10`, goed]));
      if (k === goed) {
        await l.zeg(`Precies, {10} − {${knal}}.`, "Wat is het antwoord?");
      } else {
        if (k === `10 + ${knal}`) await l.zeg("Erbij past hier niet.", "Er knappen ballonnen.", "Dan gaan er ballonnen weg.");
        else if (k !== null) await l.zeg(`Daar staat {${10 + knal}} in.`, "Maar er waren maar {10} ballonnen.");
        else await l.zeg("Geen zorgen.");
        await l.zeg(`Deze som past: {10} − {${knal}}.`, "Hoeveel ballonnen zijn er nog over?");
      }
      b.zet({ som: [{ t: "getal", n: 10 }, { t: "teken", s: "−" }, { t: "getal", n: knal }, { t: "teken", s: "=" }, { t: "vraag" }] });
      const x = await l.getal();
      if (x === 10 - knal) {
        await l.zeg("Raak!", somZin(10, "−", knal, 10 - knal));
      } else {
        await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, knal === 1 ? "Laat de ballon nog eens knappen." : `Laat de {${knal}} ballonnen nog eens knappen.`);
        await naspelen(b, l, knal, "weg");
        await l.zeg("Hoeveel ballonnen zijn er nog over?");
        await vraagAntwoord(b, l, { antwoord: 10 - knal, telTip: v3.telTip, antwoordZin: v3.antwoordZin, telOp: "aan" });
        await l.zeg(somZin(10, "−", knal, 10 - knal));
      }
      b.somDeel(4, { t: "getal", n: 10 - knal });
    } else {
      await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
      await pluisUit(b, l, v3);
    }

    await l.zeg(l.naam ? `${l.naam}, wil je stoppen?` : "Wil je stoppen?", "Of nog één, waarbij je zelf de som bouwt?");
    const nog = await l.kies(["Stoppen", "Nog één"]);
    if (nog === "Nog één") {
      /* 4. Zelf bloemen planten. */
      b.nieuw([]);
      b.zetPlaatjes("bloem", 3, 7);
      await l.zeg("We gebruiken de bloemen weer.", "Er staan er al {3}.", "Plant er nog een paar bij.", "Tik op het vinkje als je klaar bent.");
      const plant = await zelfKiezen(b, l, "erbij", 7);
      await l.zeg("Mooi.", `Je plantte er {${plant}} bij.`, "We maken er een verhaaltje van.");
      const v4 = bloemenErbij(l, 3, plant, 10, true);
      await begin(b, l, v4);
      await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
      const goed = `3 + ${plant}`;
      const fout7 = `${3 + plant} + ${plant}`;
      const k = await l.kies(schud([goed, `3 − ${plant}`, fout7]));
      b.zet({ som: [{ t: "getal", n: 3 }, { t: "teken", s: "+" }, { t: "getal", n: plant }, { t: "teken", s: "=" }, { t: "vraag" }] });
      if (k === goed) {
        await l.zeg(`Precies, {3} + {${plant}}.`, "Hoeveel bloemen staan er nu?");
        const x = await l.getal();
        if (x !== 3 + plant) {
          await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, "We planten de bloemen.", `Plant er maar {${plant}} bij.`);
          await naspelen(b, l, plant, "erbij");
          await l.zeg("Hoeveel bloemen zijn het nu?");
          await vraagAntwoord(b, l, { antwoord: 3 + plant, telTip: "Tel alle bloemen.", antwoordZin: v4.antwoordZin, telOp: "aan" });
        }
      } else {
        if (k === fout7) await l.zeg(`Je koos {${3 + plant}} + {${plant}}.`, `Maar {${3 + plant}} is juist wat we zoeken.`, "We doen het samen.");
        else if (k !== null) await l.zeg("Kijk goed naar het teken.", "We doen het samen.");
        else await l.zeg("Geen zorgen.", "We doen het samen.");
        await l.zeg("Komt er iets bij, of gaat er iets af?");
        const k2 = await l.kies(["Erbij", "Eraf"]);
        await l.zeg(k2 === "Erbij" ? "Precies." : "Kijk, er komen bloemen bij.", "We doen er bloemen bij.", "Dat is plussen.");
        await l.zeg("We planten de bloemen.", `Plant er maar {${plant}} bij.`);
        await naspelen(b, l, plant, "erbij");
        await l.zeg("Tel de bloemen die er stonden en die je plantte.", "Hoeveel zijn het er nu?");
        await vraagAntwoord(b, l, { antwoord: 3 + plant, telTip: "Tel alle bloemen.", antwoordZin: v4.antwoordZin, telOp: "aan" });
      }
      b.somDeel(4, { t: "getal", n: 3 + plant });
      await l.zeg("Goed zo.", `Er staan nu {${3 + plant}} bloemen.`);
      await l.verder();
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je snapt de verhaaltjessommen steeds beter.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const groteVerhalenOud: Lesdraaiboek = {
  id: "verhaal-grote-verhalen",
  titel: "Grotere verhaaltjes",
  synthesis: "Word Problems · Bigger Problems",
  kaarttekening: KaartGroot,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });

    /* 1. Ballonnen: 17 − 9, nog helemaal samen. */
    const v1 = ballonnen(l, 17, 9, false, tegels(4, 8, 17, 9, 7));
    await begin(b, l, v1);
    await l.zeg("Deze verhaaltjes zijn wat lastiger.", "Denk je dat je ze alleen kunt?");
    const alleen = await l.kies(["Ja", "Nee"]);
    if (alleen === "Ja") {
      await meteenProberen(b, l, v1);
    } else {
      await l.zeg("Dat is oké.", "We doen dit verhaal samen stap voor stap.");
      await pluisUit(b, l, v1);
    }
    await l.verder();

    /* 2. Lampjes: 20 − 12. */
    const v2 = lampjes(l, 20, 12, tegels(4, 8, 20, 12, 9));
    await begin(b, l, v2);
    await l.zeg("Denk je dat je deze al weet?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") {
      await meteenProberen(b, l, v2);
    } else {
      await l.zeg("Dat is oké.", "We doen het samen stap voor stap.");
      await pluisUit(b, l, v2);
    }
    await l.verder();

    /* 3. Zelf bloemen planten; nu meteen de som kiezen. */
    b.nieuw([]);
    b.zetPlaatjes("bloem", 7, 13);
    await l.zeg("Nu bepaal jij de som.", "Er staan al {7} bloemen.", "Plant er nog wat bij.", "Tik op het vinkje als je klaar bent.");
    const plant = await zelfKiezen(b, l, "erbij", 13);
    const samen = 7 + plant;
    b.nieuw([`Er staan 7 bloemen in een tuin.`, `${Wie(l)} plant er ${plant} bij.`, "Hoeveel bloemen zijn het nu?"]);
    b.zetPlaatjes("bloem", 7, 13);
    await vertel(b, l);
    await l.zeg("Welke som past bij *dit* verhaal?");
    const goed = `7 + ${plant}`;
    const k = await l.kies(schud([goed, `7 − ${plant}`, `${samen} − 7`]));
    if (k === goed) await l.zeg("Precies.", "Er komen bloemen bij, dus het is plus.");
    else await l.zeg(k === null ? "Geen zorgen." : "Niet helemaal.", "Er komen bloemen bij.", `Dus de som is {7} + {${plant}}.`);
    b.zet({ som: [{ t: "getal", n: 7 }, { t: "teken", s: "+" }, { t: "getal", n: plant }, { t: "teken", s: "=" }, { t: "vraag" }] });
    await l.zeg("Hoeveel bloemen zijn het nu?");
    const keuzes = tegels(4, samen, samen + 1, 7, plant);
    const x = await kiesGetal(l, keuzes);
    if (x !== samen) {
      await l.zeg(x === null ? "Geen zorgen." : `{${x}} ${x === 1 ? "bloem" : "bloemen"}? Niet helemaal.`, "We planten de nieuwe bloemen.", `Plant {${plant}} ${mv(plant, "bloem", "bloemen")} in de lege potjes.`);
      await naspelen(b, l, plant, "erbij");
      await l.zeg("Tel alle bloemen.", "Hoeveel zijn het er nu?");
      const zelf = await vraagAntwoord(b, l, { antwoord: samen, keuzes, telTip: "Tel alle bloemen nog eens.", antwoordZin: `Er zijn nu {${samen}} bloemen.`, telOp: "aan" });
      b.somDeel(4, { t: "getal", n: samen });
      if (zelf) await l.zeg("Ja.", `Er zijn nu {${samen}} bloemen.`);
    } else {
      b.somDeel(4, { t: "getal", n: samen });
      await l.zeg("Goed zo.", `Er zijn nu {${samen}} bloemen.`);
    }
    await l.verder();

    await l.zeg(l.naam ? `${l.naam}, wil je stoppen?` : "Wil je stoppen?", "Of nog één verhaal met knikkers?");
    const nog = await l.kies(["Stoppen", "Nog één"]);
    if (nog === "Nog één") {
      /* 4. Zelf knikkers weggeven. */
      b.nieuw([]);
      b.zetPlaatjes("knikker", 16, 0);
      await l.zeg("Tik op een paar knikkers om ze weg te geven.", "Tik op het vinkje als je klaar bent.");
      const weg = await zelfKiezen(b, l, "weg", 15);
      const over = 16 - weg;
      b.nieuw([`Er zijn 16 knikkers.`, `${Wie(l)} geeft er ${weg} weg.`, "Hoeveel knikkers zijn er nog over?"]);
      b.zetPlaatjes("knikker", 16, 0);
      await vertel(b, l);
      await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
      const goedeSom = `16 − ${weg}`;
      const k4 = await l.kies(schud([`16 + ${weg}`, `${weg} − 16`, goedeSom]));
      if (k4 === goedeSom) await l.zeg(`Precies, {16} − {${weg}}.`);
      else await l.zeg(k4 === null ? "Geen zorgen." : "Niet helemaal.", "Er gaan knikkers weg.", `Dus de som is {16} − {${weg}}.`);
      b.zet({ som: [{ t: "getal", n: 16 }, { t: "teken", s: "−" }, { t: "getal", n: weg }, { t: "teken", s: "=" }, { t: "vraag" }] });
      await l.zeg("Hoeveel knikkers zijn er dus over?");
      const keuzes4 = tegels(4, over, over + 1, 16, weg);
      const y = await kiesGetal(l, keuzes4);
      if (y !== over) {
        await l.zeg(y === null ? "Geen zorgen." : `{${y}}? Niet helemaal.`, weg === 1 ? "Geef de knikker nog eens weg." : `Geef de {${weg}} knikkers nog eens weg.`);
        await naspelen(b, l, weg, "weg");
        await l.zeg("Hoeveel knikkers zijn er nog over?");
        await vraagAntwoord(b, l, { antwoord: over, keuzes: keuzes4, telTip: "Tel de knikkers die er nog zijn.", antwoordZin: nogOver(over, "knikker", "knikkers"), telOp: "aan" });
      }
      b.somDeel(4, { t: "getal", n: over });
      await l.zeg("Goed.", nogOver(over, "knikker", "knikkers"));
      await l.verder();
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je kunt deze verhaaltjessommen al goed.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const verstopteGetallenOud: Lesdraaiboek = {
  id: "verhaal-verstopte-getallen",
  titel: "Verstopte getallen",
  synthesis: "Word Problems · Mixed Problems",
  kaarttekening: KaartOmgekeerd,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });

    /* 1. Bloemen: ? + 5 = 9. */
    await omgekeerd(b, l, {
      zinnen: ["Er staan _een_ _paar_ _bloemen_ in de tuin.", `${Wie(l)} plantte er nog 5 bij.`, "Nu zijn het er samen 9.", "Hoeveel bloemen stonden er eerst?"],
      soort: "bloem",
      ding: "bloemen",
      delen: [null, 5, 9],
      op: "+",
      veranderZin: 1,
      waarom: "Er komen bloemen bij.",
      groterKleiner: {
        vraag: [`${Wie(l)} plantte er bloemen bij.`, "Worden het er meer of minder?"],
        opties: ["Meer", "Minder"],
        goed: ["Het worden er meer.", "Dat is erbij."],
      },
      vragen: ["Hoeveel bloemen stonden er eerst?", `En hoeveel bloemen plantte ${wie(l)}?`, "En hoeveel bloemen zijn er samen?"],
      betekenis: { 5: `Er kwamen {5} bloemen bij.`, 9: "Er zijn er samen {9}." },
      onbekendKnop: "Een paar bloemen",
      rekenVraag: "Hoeveel plus {5} is {9}?",
      antwoordZin: "Ja, er stonden eerst {4} bloemen.",
      somKeuzes: ["? + 5 = 9", "5 + ? = 9", "? − 5 = 9"],
      goedeSom: "? + 5 = 9",
    });

    /* 2. Lampjes: 20 − ? = 13. */
    await l.zeg("Goed zo.", "We kijken naar een nieuw verhaal.");
    await omgekeerd(b, l, {
      zinnen: ["Er branden 20 lampjes.", `${Wie(l)} doet er _een_ _paar_ uit.`, "Nu branden er nog 13.", `Hoeveel lampjes deed ${wie(l)} uit?`],
      soort: "lampje",
      ding: "lampjes",
      delen: [20, null, 13],
      op: "−",
      veranderZin: 1,
      waarom: "Er gaan lampjes uit.",
      groterKleiner: {
        vraag: ["Er gaan lampjes uit.", "Worden het er meer of minder?"],
        opties: ["Minder", "Meer"],
        goed: ["Het worden er minder.", "Dat is eraf."],
      },
      vragen: ["Hoeveel lampjes brandden er in het begin?", "Hoeveel lampjes gingen uit?", "Hoeveel branden er nog?"],
      betekenis: { 13: "Dat zijn de lampjes die nog branden.", 20: "Zoveel lampjes waren er in het begin." },
      onbekendKnop: "Een paar",
      rekenVraag: "{20} min hoeveel is {13}?",
      antwoordZin: "Precies, er gingen {7} lampjes uit.",
      somKeuzes: ["20 − ? = 13", "? − 20 = 13", "20 + ? = 13"],
      goedeSom: "20 − ? = 13",
    });

    /* 3. Knikkers: ? + 7 = 12. */
    await l.zeg(l.naam ? `Je doet het goed, ${l.naam}.` : "Je doet het goed.", "Nog één.", "Dit is het laatste verhaal.");
    await omgekeerd(b, l, {
      zinnen: ["Tim heeft _een_ _paar_ _knikkers_.", `${Wie(l)} geeft hem er nog 7.`, "Nu heeft Tim er 12.", "Met hoeveel knikkers begon Tim?"],
      soort: "knikker",
      ding: "knikkers",
      delen: [null, 7, 12],
      op: "+",
      veranderZin: 1,
      waarom: "Tim krijgt er knikkers bij.",
      groterKleiner: {
        vraag: ["Tim krijgt er knikkers bij.", "Heeft hij er dan meer of minder?"],
        opties: ["Meer", "Minder"],
        goed: ["Hij heeft er dan meer.", "Dat is erbij."],
      },
      vragen: ["Met hoeveel knikkers begon Tim?", `En hoeveel knikkers gaf ${wie(l)} hem?`, "En hoeveel heeft hij er nu?"],
      betekenis: { 7: "Zoveel knikkers kreeg Tim erbij.", 12: "Zoveel heeft Tim er nu." },
      onbekendKnop: "Een paar knikkers",
      rekenVraag: "Hoeveel plus {7} is {12}?",
      antwoordZin: "Ja, Tim begon met {5} knikkers.",
      somKeuzes: ["? + 7 = 12", "7 + ? = 12", "? − 7 = 12"],
      goedeSom: "? + 7 = 12",
    });

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je vindt de verstopte getallen al.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const eindtoetsOud: Lesdraaiboek = {
  id: "verhaal-eindtoets",
  titel: "Eindtoets: verhaaltjessommen",
  synthesis: "Word Problems · Mastery Check",
  kaarttekening: KaartToets,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });
    await l.zeg("Ik heb verhaaltjessommen voor je.", "Ik lees elk verhaal voor.");
    if (!(await toetsLampjes(b, l, 14, 8, [5, 6, 7, 14], () => toetsOfLes(l)))) return;
    await toetsBloemen(b, l, 6, 17, ["6 + ? = 17", "6 + 17 = ?", "6 − ? = 17"], [10, 11, 12, 17]);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je hebt lastige verhaaltjessommen opgelost.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- More Word Problems · More Word Problems (groep 3-deel) ---------- */

/*
 * Synthesis rekent hier tot 100 met een tientallen-eenhedenteller (groep 4).
 * Het groep 3-deel zijn de uitpluisstappen en het verloop per verhaal:
 * erbij of eraf? → (hulp?) → naspelen terwijl de som meeloopt → het antwoord.
 * Daarom dezelfde vier verhalen in dezelfde volgorde, met getallen tot 20 en
 * zonder teller: het kind tikt de plaatjes zelf aan.
 */

function knikkersErbij(l: Lesgids): Pluisverhaal {
  return {
    zinnen: ["Tim heeft 12 knikkers.", `${Wie(l)} geeft hem er 5 [bij].`, "Hoeveel knikkers heeft Tim nu samen?"],
    soort: "knikker",
    aan: 12,
    leeg: 8,
    a: 12,
    b: 5,
    op: "+",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel knikkers Tim nu samen heeft.",
    signaalVraag: "Tik op het woord dat zegt dat er iets bijkomt.",
    signaalTip: "Tip: tik op het woord dat zegt wat er met de knikkers gebeurt.",
    signaalUitleg: "Het woord *bij* zegt dat er knikkers bijkomen.",
    foutUitleg: "Maar Tim krijgt er knikkers bij.",
    kleineVraag: {
      zinnen: ["Tim krijgt knikkers.", "Heeft hij er dan meer?", "Of minder?"],
      erbij: "Meer",
      eraf: "Minder",
      goed: ["Hij heeft er meer.", "Dus het is erbij."],
    },
    beginVraag: "Hoeveel knikkers had Tim eerst?",
    beginAntwoord: ["Tim had eerst {12} knikkers.", "Die zetten we vooraan."],
    tweedeVraag: "En welk getal doen we erbij?",
    tweedeAntwoord: ["Hij krijgt er {5} bij.", "Dus doen we {5} erbij."],
    naspelen: ["Doe de {5} knikkers erbij.", "Tik op {5} lege plekjes."],
    levendOpdracht: ["Doe er {5} knikkers bij.", "Tik op de lege plekjes."],
    antwoordVraag: "Hoeveel knikkers heeft Tim dus samen?",
    telTip: "Tel alle knikkers.",
    antwoordZin: "Tim heeft nu {17} knikkers.",
    keuzes: schud([17, 5, 12, 7]),
  };
}

function ballonnenKnappen(l: Lesgids): Pluisverhaal {
  return {
    ...ballonnen(l, 18, 6, false, schud([12, 6, 18, 11])),
    zinnen: ["Er zijn 18 ballonnen op een feestje.", `${Wie(l)} laat er 6 [knappen].`, "Hoeveel ballonnen zijn er nog over?"],
    signaalVraag: "Tik op het woord dat zegt dat het eraf gaat.",
    signaalTip: "Tip: tik op het woord dat zegt wat er met de ballonnen gebeurt.",
    signaalUitleg: "Er knappen ballonnen.",
    kleineVraag: {
      zinnen: ["Er knappen ballonnen.", "Komen er dan ballonnen bij?", "Of gaan er ballonnen weg?"],
      erbij: "Er komen ballonnen bij",
      eraf: "Er gaan ballonnen weg",
      goed: ["Er gaan ballonnen weg.", "Dus het is eraf."],
    },
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeAntwoord: ["Er knappen {6} ballonnen.", "Dus halen we {6} eraf."],
    naspelen: ["Laat {6} ballonnen knappen."],
    levendOpdracht: ["Haal {6} ballonnen weg.", "Tik op de ballonnen."],
  };
}

function lampjesUit(l: Lesgids): Pluisverhaal {
  return {
    ...lampjes(l, 15, 7, schud([8, 7, 15, 9])),
    leeg: 5,
    levendOpdracht: ["Doe er {7} uit.", "Tik op de lampjes."],
  };
}

function koekjesOp(l: Lesgids): Pluisverhaal {
  return {
    zinnen: ["Er zijn 20 koekjes.", `${Wie(l)} en een vriendje [eten] er 9 [op].`, "Hoeveel koekjes zijn er nog over?"],
    soort: "koekje",
    aan: 20,
    leeg: 0,
    a: 20,
    b: 9,
    op: "−",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel koekjes er nog over zijn.",
    signaalVraag: "Tik op de woorden die zeggen dat het eraf gaat.",
    signaalTip: "Tip: tik op de woorden die zeggen wat er met de koekjes gebeurt.",
    signaalUitleg: "Er worden koekjes opgegeten.",
    foutUitleg: "Maar er komen geen koekjes bij.",
    kleineVraag: {
      zinnen: ["Er worden koekjes opgegeten.", "Komen er dan koekjes bij?", "Of gaan er koekjes weg?"],
      erbij: "Er komen koekjes bij",
      eraf: "Er gaan koekjes weg",
      goed: ["Er gaan koekjes weg.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel koekjes waren er eerst?",
    beginAntwoord: ["Er waren eerst {20} koekjes.", "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeAntwoord: ["Er worden {9} koekjes opgegeten.", "Dus halen we {9} eraf."],
    naspelen: ["Tik op {9} koekjes om ze op te eten."],
    levendOpdracht: ["Haal {9} koekjes weg.", "Tik op de koekjes."],
    antwoordVraag: "Hoeveel koekjes zijn er dus over?",
    telTip: "Tel de koekjes die er nog zijn.",
    antwoordZin: "Er zijn nog {11} koekjes over.",
    keuzes: schud([9, 10, 11, 20]),
  };
}

/** De som bovenaan met een vraagteken op de plek van het antwoord. */
const somMetVraag = (v: Pluisverhaal): Somstuk[] => [{ t: "getal", n: v.a }, { t: "teken", s: v.op }, { t: "getal", n: v.b }, { t: "teken", s: "=" }, { t: "vraag" }];

/**
 * Het antwoord kiezen. Goed: het verhaal gebeurt vanzelf. Niet goed: het kind
 * speelt het na terwijl de som meeloopt, en kiest dan opnieuw.
 */
async function antwoordMetNaspelen(b: Bord, l: Lesgids, v: Pluisverhaal, goedZin: string, foutZin: string[]) {
  const antwoord = uitkomst(v);
  b.zet({ som: somMetVraag(v) });
  await l.zeg(v.antwoordVraag);
  const x = await kiesGetal(l, v.keuzes ?? [antwoord]);
  if (x === antwoord) {
    await laatGebeuren(b, l, v.soort, v.a, v.b, v.op, v.aan + v.leeg);
    b.somDeel(4, { t: "getal", n: antwoord });
    await l.zeg(goedZin, somZin(v.a, v.op, v.b, antwoord));
    return;
  }
  await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, ...foutZin);
  await levendNaspelen(b, l, v.a, v.op, v.b, v.levendOpdracht ?? v.naspelen);
  await l.zeg(v.antwoordVraag);
  await vraagAntwoord(b, l, { ...v, antwoord, telOp: "aan" });
  b.somDeel(4, { t: "getal", n: antwoord });
  await l.zeg("Goed zo.", somZin(v.a, v.op, v.b, antwoord));
}

/**
 * Eerst "erbij of eraf?". Goed: verder op de manier van dit verhaal. Niet
 * goed: "daar ben ik niet zo zeker van" en samen uitpluizen, zoals Synthesis.
 * Geeft `false` als het verhaal al is uitgepluisd.
 */
async function erbijOfEraf(b: Bord, l: Lesgids, v: Pluisverhaal, opening: string[]): Promise<boolean> {
  await l.zeg(...opening, "Komt er iets bij, of gaat er iets af?");
  const k = await l.kies(["Erbij", "Eraf"]);
  if (k === (v.op === "+" ? "Erbij" : "Eraf")) return true;
  if (k === null) await l.zeg("Geen zorgen.", "We kijken samen.");
  else await l.zeg(`${k}?`, "Daar ben ik niet zo zeker van.", "We kijken samen nog eens.");
  await pluisUit(b, l, v, { levend: true, zonderKeuze: true });
  return false;
}

function KaartMeer() {
  return (
    <>
      <Rijtje soort="knikker" aantal={5} x={22} y={30} maat={36} />
      <KrijtSom tekst="12 + 5 = 17" x={122} y={150} />
    </>
  );
}

const meerVerhaaltjes: Lesdraaiboek = {
  id: "verhaal-meer-verhaaltjes",
  titel: "Meer verhaaltjes",
  synthesis: "More Word Problems · More Word Problems (groep 3-deel)",
  kaarttekening: KaartMeer,

  async speel(l) {
    const b = new Bord(l, { zinnen: [], zichtbaar: 0 });

    /* 1. Knikkers erbij: 12 + 5. */
    const v1 = knikkersErbij(l);
    await begin(b, l, v1);
    if (await erbijOfEraf(b, l, v1, ["Wat denk je?"])) {
      await l.zeg("Precies, erbij.", "Kijk, hier is de som.");
      await antwoordMetNaspelen(b, l, v1, "Goed zo.", ["We doen de knikkers erbij."]);
    }
    await l.verder();

    /* 2. Ballonnen eraf: 18 − 6, met hulp als het kind dat wil. */
    const v2 = ballonnenKnappen(l);
    await begin(b, l, v2);
    if (await erbijOfEraf(b, l, v2, ["Hoe zit het met deze?"])) {
      await l.zeg("Ja, eraf.", "Maar deze is best lastig.", "Wil je hulp?");
      const hulp = await l.kies(["Ja", "Nee"]);
      if (hulp === "Ja") {
        await levendNaspelen(b, l, v2.a, v2.op, v2.b, v2.levendOpdracht ?? v2.naspelen);
        await l.zeg("Mooi.", v2.antwoordVraag);
        await vraagAntwoord(b, l, { ...v2, antwoord: uitkomst(v2), telOp: "aan" });
        b.somDeel(4, { t: "getal", n: uitkomst(v2) });
        await l.zeg("Goed zo.", somZin(v2.a, v2.op, v2.b, uitkomst(v2)));
      } else {
        await l.zeg("Goed, probeer het zelf.");
        await antwoordMetNaspelen(b, l, v2, "Goed zo.", ["We laten de ballonnen knappen."]);
      }
    }
    await l.verder();

    /* 3. Lampjes uit: 15 − 7, over het tiental. */
    const v3 = lampjesUit(l);
    await begin(b, l, v3);
    if (await erbijOfEraf(b, l, v3, ["Wat denk je?"])) {
      await l.zeg("Precies.", "Weet je het antwoord?");
      const weet = await l.kies(["Ja", "Nee"]);
      if (weet === "Ja") {
        await l.zeg("Goed gezien.");
        await antwoordMetNaspelen(b, l, v3, "Goed zo.", ["Zullen we de lampjes zelf uitdoen?"]);
      } else {
        await l.zeg("Geen probleem.", "We doen de lampjes zelf uit.");
        await levendNaspelen(b, l, v3.a, v3.op, v3.b, v3.levendOpdracht ?? v3.naspelen);
        await l.zeg(v3.antwoordVraag);
        await vraagAntwoord(b, l, { ...v3, antwoord: uitkomst(v3), telOp: "aan" });
        b.somDeel(4, { t: "getal", n: uitkomst(v3) });
        await l.zeg("Goed zo.", somZin(v3.a, v3.op, v3.b, uitkomst(v3)));
      }
    }
    await l.verder();

    /* 4. Nog één, als het kind wil: koekjes. Meteen de som kiezen. */
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}.` : "Goed gedaan.", "Wil je nog één verhaal over koekjes?", "Of zullen we stoppen?");
    const nog = await l.kies(["Nog één", "Stoppen"]);
    if (nog === "Nog één") {
      const v4 = koekjesOp(l);
      await begin(b, l, v4);
      await l.zeg("Welke som past bij het verhaal?");
      const goed = "20 − 9";
      const k = await l.kies(schud(["20 + 9", "9 − 20", goed]));
      if (k === goed) {
        await l.zeg("Goed zo.", "{20} − {9}.");
        await antwoordMetNaspelen(b, l, v4, "Goed.", ["We eten de koekjes zelf op."]);
      } else {
        await l.zeg(k === null ? "Geen zorgen." : "Niet helemaal.", "We doen het samen stap voor stap.");
        await pluisUit(b, l, v4, { levend: true });
      }
      await l.verder();
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je lost deze verhaaltjes snel op.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/**
 * De krijtbord-versies van V1–V5 (tot 27 oktober 2026). Ze staan niet meer in
 * de lessenlijst; de hologramversies hieronder hebben dezelfde ids. Ze blijven
 * staan zodat ze terug kunnen als de eigenaar dat wil (HARDE REGEL 1).
 */
export const LESSEN_VERHAALTJESSOMMEN_OUD: Lesdraaiboek[] = [instaptoetsOud, kleineVerhalenOud, groteVerhalenOud, verstopteGetallenOud, eindtoetsOud];

/* =====================================================================
 * V1–V5 als hologrammen in Phaser (27 oktober 2026, LESSENPLAN.md § 2.6,
 * BOUWEN-PHASER.md). Zelfde leerstappen als Synthesis "Word Problems" en als
 * de krijtbord-versies hierboven; anders:
 * - de voorwerpen zijn Aarde-hologrammen, één soort per verhaal
 *   (vuurvliegjes, bloemen, lantaarntjes, paddenstoelen, lichtjes);
 * - antwoorden kiest het kind met grote cijferknoppen in beeld (fout = grijs,
 *   kies opnieuw); erbij of eraf met een plus- en een minknop;
 * - groep 3 leest nog niet: Bliepo leest alles voor en wijst de knoppen de
 *   eerste keer aan; de tekst in beeld is om mee te lezen;
 * - minstens 15 opgaven per les: na de verhalen van Synthesis korte
 *   oefenverhaaltjes tot de 15 vol zijn, en wat het kind 2× fout had of niet
 *   wist, komt aan het eind nog één keer terug.
 * ===================================================================== */

/**
 * Het vinkje en "weet ik niet" van het verhaal staan op de vaste plek onder de
 * zin van Bliepo (28 oktober 2026, besluit eigenaar), niet meer in het vlak.
 */
function metVasteKnoppen(les: Lesdraaiboek): Lesdraaiboek {
  return {
    ...les,
    speel: (l) =>
      les.speel(
        knoppenOpPlek(l, {
          voor: VerhaalTuin,
          soorten: { klaar: "controleer", weetniet: "weetniet" },
          zichtbaar: (p) => [p.klaarKnop ? "klaar" : "", p.weetNiet ? "weetniet" : ""].filter(Boolean),
        }),
      ),
  };
}

/** Houdt bij wat er in het hologramvlak staat, en hoeveel opgaven het kind al deed. */
/** "1 vogeltje", niet "1 vogeltjes" (keurder, 28 okt 2026). */
function enkelvoud(ding: string): string {
  const vast: Record<string, string> = { vogeltjes: "vogeltje", bloemen: "bloem", ballonnen: "ballon", lampen: "lamp", lampjes: "lampje", munten: "munt", lichtjes: "lichtje", lantaarntjes: "lantaarntje", paddenstoelen: "paddenstoel", knikkers: "knikker", potten: "pot", vuurvliegjes: "vuurvliegje", koekjes: "koekje" };
  return vast[ding] ?? ding;
}

class HBord {
  p: VerhaalHoloProps = { zinnen: [], zichtbaar: 0 };
  /** Knoppen die Bliepo al eens heeft aangewezen. */
  gewezen = new Set<string>();
  /** Nagebouwde lessen: geen extra aanwijs-zinnen ("Tik op de pijl."), want Synthesis heeft die niet (28 okt 2026). */
  zonderAanwijzen = false;
  /** Aantal opgaven in deze les (vaste regel: minstens 15). */
  opgaven = 0;
  /** Korte verhaaltjes die later in de les terugkomen (2× fout of "weet ik niet"). */
  later: Kort[] = [];
  constructor(private l: Lesgids) {
    l.vlak(VerhaalTuin, this.p);
  }
  zet(extra: Partial<VerhaalHoloProps>) {
    this.p = { ...this.p, ...extra };
    this.l.pasVlakAan<VerhaalHoloProps>(extra);
  }
  nieuw(zinnen: string[], extra: Partial<VerhaalHoloProps> = {}) {
    const leeg: VerhaalHoloProps = {
      zinnen,
      zichtbaar: 0,
      stippelVoor: null,
      midden: false,
      omcirkeld: [],
      doorgestreept: [],
      vraagZin: null,
      flitsZin: null,
      signaalGroen: false,
      groeneZin: null,
      hintZin: null,
      hintVraagteken: false,
      onbekendKleur: null,
      tik: null,
      plaatjes: null,
      geteld: [],
      tel: null,
      som: null,
      somActief: null,
      keuzes: null,
      weetNiet: false,
      klaarKnop: false,
      leesZin: null,
      woordKleur: {},
      somBijMidden: false,
      alleenZin: null,
      tikAlleen: null,
      scheidingNa: null,
      handje: false,
      /* Nagebouwde lessen (vergelijking 28 okt 2026): geen streepje onder wat je kunt aantikken, zoals Synthesis. */
      kaal: this.zonderAanwijzen,
      ...extra,
    };
    this.p = { ...leeg, golfNr: this.p.golfNr, schudNr: this.p.schudNr };
    this.l.pasVlakAan<VerhaalHoloProps>(leeg);
  }
  somDeel(i: number, d: Somstuk) {
    this.zet({ som: (this.p.som ?? []).map((x, j) => (j === i ? d : x)) });
  }
  zetPlaatjes(soort: HoloSoort, aan: number, uit: number, leeg: "plek" | "eigen" = "eigen", extra: { rij?: number; bloeit?: boolean } = {}) {
    this.sfeer(soort);
    this.zet({ plaatjes: { soort, plekken: plekken(aan, uit), leeg, zweefNr: this.zweefTeller, ...extra }, geteld: [], tel: null });
  }
  /*
    Sfeergeluidje als de voorwerpen van een nieuw verhaal in beeld komen (29 oktober 2026):
    Synthesis laat bij het vogelverhaal heel zacht 2 s vogeltjes horen. Wij doen dat bij elk
    nieuw soort voorwerp; niet opnieuw bij dezelfde voorwerpen binnen 20 s. Het wacht als
    Bliepo praat. LEGAL REVIEW REQUIRED (moment van Synthesis overgenomen).
  */
  private laatsteSfeer: { soort: string; op: number } | null = null;
  private sfeer(soort: HoloSoort) {
    if (this.p.plaatjes?.soort === soort) return;
    const nu = Date.now();
    if (this.laatsteSfeer && this.laatsteSfeer.soort === soort && nu - this.laatsteSfeer.op < 20000) return;
    const naam = sfeerVoor(soort);
    if (!naam) return;
    this.laatsteSfeer = { soort, op: nu };
    speelLesgeluid(naam);
  }
  /** Telt op per les: de voorwerpen zweven van onderen omhoog als dit hoger wordt (ballonnen bij het voorlezen). */
  zweefTeller = 0;
  /** Voorwerpen met een eigen stand per plek (bijvoorbeeld 16 munten en 4 lege plekken). */
  zetStand(soort: HoloSoort, stand: Plekstaat[], leeg: "plek" | "eigen" = "eigen", extra: { rij?: number; bloeit?: boolean } = {}) {
    this.sfeer(soort);
    this.zet({ plaatjes: { soort, plekken: stand, leeg, zweefNr: this.zweefTeller, ...extra }, geteld: [], tel: null });
  }
  /** Bloempotten met een plantje laten bloeien (of weer een spruitje). */
  bloei(aan: boolean) {
    const pl = this.p.plaatjes;
    if (pl) this.zet({ plaatjes: { ...pl, bloeit: aan } });
  }
  /** De plekken veranderen, de soort blijft. */
  zetPlekken(nieuw: Plekstaat[]) {
    const pl = this.p.plaatjes;
    if (pl) this.zet({ plaatjes: { ...pl, plekken: nieuw } });
  }
  goed() {
    this.zet({ golfNr: (this.p.golfNr ?? 0) + 1 });
  }
  fout() {
    this.zet({ schudNr: (this.p.schudNr ?? 0) + 1 });
  }
  opgave() {
    this.opgaven++;
    /* Voor de automatische test: hoeveel opgaven er al waren. */
    window.__phaser = { ...window.__phaser, opgaven: this.opgaven };
  }
}

/**
 * De woorden rond woord `j` tot het volgende getal (Synthesis Bigger Problems: de knoppen in het
 * verhaal zijn woordgroepen, zoals "fly away."). Zonder `j`: alle woorden van de zin die geen getal zijn.
 */
function woordGroep(zin: string, i: number, j?: number): Record<string, "r" | "g"> {
  const woorden = zin.split(" ").filter(Boolean);
  const getal = (w: string) => /^\d+[.,?!]?$/.test(w);
  let van = 0;
  let tot = woorden.length - 1;
  if (j !== undefined && !getal(woorden[j] ?? "")) {
    van = j;
    while (van > 0 && !getal(woorden[van - 1])) van--;
    tot = j;
    while (tot < woorden.length - 1 && !getal(woorden[tot + 1])) tot++;
  }
  const uit: Record<string, "r" | "g"> = {};
  for (let k = van; k <= tot; k++) if (!getal(woorden[k])) uit[`${i}-${k}`] = "r";
  return uit;
}
const kleurAlles = (m: Record<string, "r" | "g">, kleur: "r" | "g") => Object.fromEntries(Object.keys(m).map((k) => [k, kleur])) as Record<string, "r" | "g">;

/** "En welk getal halen we eraf?" → het woord eraf/erbij/weg in het groen (hoort bij het groene vraagteken, zoals Synthesis). */
function groenWoord(zin: string): string {
  return zin.replace(/\b(eraf|erbij|weg|bij|uit)(?=[?.!]?$)/, "[[g:$1]]");
}

/** Bliepo wijst een knop één keer per les aan. */
async function wijsEenKeer(b: HBord, l: Lesgids, knop: string, ...zinnen: string[]) {
  if (b.zonderAanwijzen || b.gewezen.has(knop)) return;
  b.gewezen.add(knop);
  await l.wijsAan(knop, ...zinnen);
}

/** Het verhaal voorlezen; de zinnen verschijnen één voor één. */
async function vertelH(b: HBord, l: Lesgids) {
  if (b.zonderAanwijzen) {
    /* Zoals Synthesis: het hele verhaal staat er; de zin die Bliepo voorleest kleurt op. */
    b.zet({ zichtbaar: b.p.zinnen.length });
    for (let i = 0; i < b.p.zinnen.length; i++) {
      b.zet({ leesZin: i });
      await l.zeg(voorleeszin(b.p.zinnen[i]));
    }
    b.zet({ leesZin: null });
    return;
  }
  for (let i = 0; i < b.p.zinnen.length; i++) {
    b.zet({ zichtbaar: i + 1 });
    await l.zeg(voorleeszin(b.p.zinnen[i]));
  }
}

/**
 * Grote keuzeknoppen in beeld. Geeft de keuze, of `null` bij "Weet ik niet".
 * `wijs`: wat Bliepo zegt als hij de knoppen de eerste keer aanwijst.
 */
async function kiesH(
  b: HBord,
  l: Lesgids,
  opties: (number | string)[],
  o: { uit?: (number | string)[]; som?: boolean; weetNiet?: boolean; wijs?: string[]; wijsSleutel?: string; goed?: number | string; tegels?: boolean; vinkje?: boolean } = {},
): Promise<number | string | null> {
  /* Sinds 28 oktober 2026 (Synthesis-indeling): de keuzes, de cijferknoppen en "Weet ik niet" staan in het lesscherm (l.kies),
     in een kolom links. Wat fout was, staat er niet meer bij. Voor de automatische test: welke knop nu goed is. */
  window.__phaser = { ...window.__phaser, antwoord: o.goed ?? null };
  const uit = o.uit ?? [];
  const lijst = opties.filter((x) => !uit.includes(x)).map(String);
  /* Zoals Synthesis: getallen en tegels zijn meteen het antwoord (geen vinkje); sommen en erbij/eraf met vinkje. */
  const direct = !o.som && !o.vinkje;
  /* De cijfertegels 1–9 staan altijd links in het rooster van drie (zoals Synthesis), ook als de aanroep het niet vraagt. */
  const tegels = !!o.tegels || (lijst.length >= 5 && lijst.every((x) => /^[1-9]$/.test(x)));
  const p = l.kies(lijst, { direct, weetniet: o.weetNiet === false ? false : "Weet ik niet", raster: tegels });
  const sleutel = o.wijsSleutel ?? "keuzes";
  if (!b.zonderAanwijzen && !b.gewezen.has(sleutel)) {
    b.gewezen.add(sleutel);
    await l.wijsAan(direct ? "keuzes" : "controleer", ...(o.wijs ?? (direct ? ["Tik op het goede antwoord."] : ["Kies het goede antwoord.", "Tik dan op het vinkje."])));
  }
  if (o.weetNiet !== false) await wijsEenKeer(b, l, "weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
  const k = await p;
  if (k === null) return null;
  return opties.find((x) => String(x) === k) ?? k;
}

async function kiesGetalH(b: HBord, l: Lesgids, opties: number[], uit: number[] = [], goed?: number): Promise<number | null> {
  const k = await kiesH(b, l, opties, { uit, goed });
  return k === null ? null : Number(k);
}

/** Erbij of eraf, met een plus- en een minknop (groep 3 leest nog niet). */
async function erbijErafH(b: HBord, l: Lesgids, op: "+" | "−"): Promise<"Erbij" | "Eraf" | null> {
  const k = await kiesH(b, l, ["+ Erbij", "− Eraf"], {
    goed: op === "+" ? "+ Erbij" : "− Eraf",
    wijsSleutel: "plusmin",
    wijs: ["Komt er iets bij?", "Kies dan erbij.", "Gaat er iets af?", "Kies dan eraf.", "Tik dan op het vinkje."],
    vinkje: true,
  });
  return k === null ? null : String(k).startsWith("+") ? "Erbij" : "Eraf";
}

/** De pijl om verder te gaan; de eerste keer wijst Bliepo hem aan. */
async function verderH(b: HBord, l: Lesgids) {
  const p = l.verder();
  await wijsEenKeer(b, l, "verder", "Tik op de pijl.", "Dan gaan we verder.");
  await p;
}

/** Wachten op een tik in het verhaal (of "Weet ik niet"); `hulp` zegt Bliepo als het kind na een tijdje niets doet. */
async function wachtTikH(b: HBord, l: Lesgids, tik: "getal" | "zin" | "woord", hulp?: string[], weetNiet = true): Promise<Vlakgebeurtenis> {
  /* Synthesis-lessen: bij het aantikken van getallen, de vraagzin en het signaalwoord heeft Synthesis geen "Weet ik niet" (`weetNiet = false`). */
  b.zet({ tik, weetNiet });
  const p = l.wachtOpVlak(["getal", "zin", "woord", "weetniet"]);
  if (weetNiet) await wijsEenKeer(b, l, "weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
  let klaar = false;
  const klok = hulp
    ? setTimeout(() => {
        if (!klaar) void l.zeg(...hulp).catch(() => {});
      }, 14000)
    : undefined;
  try {
    return await p;
  } finally {
    klaar = true;
    clearTimeout(klok);
    b.zet({ tik: null, weetNiet: false });
  }
}

/** Het kind speelt het verhaal na: precies `aantal` voorwerpen weghalen of erbij doen. */
async function naspelenH(b: HBord, l: Lesgids, aantal: number, modus: "weg" | "erbij") {
  const geteld: number[] = [];
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], tel: null });
  while (geteld.length < aantal) {
    const g = await l.wachtOpVlak<{ soort: string; i: number }>("plaatje");
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    geteld.push(g.i);
    b.zet({ plaatjes: { ...pl, plekken: pl.plekken.map((st, j) => (j === g.i ? (modus === "weg" ? "uit" : "aan") : st)) }, geteld: [...geteld] });
  }
  b.zet({ tik: null });
  await l.wacht(700);
}

/** Het kind maakt zelf het verhaal: zoveel voorwerpen als het wil, dan het vinkje. */
async function zelfKiezenH(b: HBord, l: Lesgids, modus: "weg" | "erbij", max: number): Promise<number> {
  const geteld: number[] = [];
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], klaarKnop: false });
  while (geteld.length < max) {
    const p = l.wachtOpVlak<{ soort: string; i: number }>(["plaatje", "klaar"]);
    if (geteld.length === 1) await wijsEenKeer(b, l, "klaar", "Ben je klaar?", "Tik dan op het vinkje.");
    const g = await p;
    if (g.soort === "klaar") {
      if (geteld.length > 0) break;
      continue;
    }
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    geteld.push(g.i);
    b.zet({ plaatjes: { ...pl, plekken: pl.plekken.map((st, j) => (j === g.i ? (modus === "weg" ? "uit" : "aan") : st)) }, geteld: [...geteld], klaarKnop: true });
  }
  b.zet({ tik: null, klaarKnop: false, geteld: [] });
  await l.wacht(400);
  return geteld.length;
}

/** Samen tellen: er komen nummers bij de voorwerpen in deze staat, één voor één. */
async function telSamenH(b: HBord, l: Lesgids, op: Plekstaat) {
  const n = b.p.plaatjes?.plekken.filter((st) => st === op).length ?? 0;
  b.zet({ geteld: [] });
  for (let t = 1; t <= n; t++) {
    b.zet({ tel: { op, tot: t } });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/** Nummers bij precies deze voorwerpen, één voor één (samen tellen). */
async function telDeze(b: HBord, l: Lesgids, deze: number[]) {
  b.zet({ tel: null, geteld: [] });
  for (let t = 1; t <= deze.length; t++) {
    b.zet({ geteld: deze.slice(0, t) });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/** Het verhaal laat zichzelf gebeuren: de voorwerpen gaan één voor één aan of uit. */
async function laatGebeurenH(b: HBord, l: Lesgids, van: number, tot: number, totaal: number, ms = 260) {
  const stap = van < tot ? 1 : -1;
  /* Lege plekken van het begin blijven leeg (stippelrondje); alleen wat uitgaat wordt grijs. */
  const leeg = (b.p.plaatjes?.plekken ?? []).filter((st) => st === "leeg").length;
  for (let k = van + stap; stap > 0 ? k <= tot : k >= tot; k += stap) {
    b.zetPlekken([...plekken(k, totaal - k - leeg), ...Array<Plekstaat>(leeg).fill("leeg")]);
    await l.wacht(ms);
  }
}

/** Keuzes rond het antwoord, met de denkfout erbij als die past (bijvoorbeeld opgeteld in plaats van eraf). */
function keuzesMet(antwoord: number, ...extra: number[]): number[] {
  const basis = vierKeuzes(antwoord, 0, 20);
  for (const x of extra) {
    if (x < 0 || x > 20 || basis.includes(x)) continue;
    const weg = basis.findIndex((y) => y !== antwoord);
    basis.splice(weg, 1, x);
  }
  return [...new Set(basis)].sort((p, q) => p - q);
}

/* ---------- korte verhaaltjes (oefenen, en wat later terugkomt) ---------- */

type Kort = {
  zinnen: string[];
  soort: HoloSoort;
  leeg?: "plek" | "eigen";
  /** Begin en verandering; de som is a + b of a − b. */
  a: number;
  b: number;
  op: "+" | "−";
  /** Welk deel onbekend is: 0 het begin, 2 de verandering, 4 de uitkomst (standaard). */
  onbekend?: 0 | 2 | 4;
  vraag: string;
  /** Wat Bliepo laat tellen als hulp. */
  telTip: string;
  antwoordZin: string;
};

const eindVan = (k: { a: number; b: number; op: "+" | "−" }) => (k.op === "+" ? k.a + k.b : k.a - k.b);
const antwoordVan = (k: Kort) => (k.onbekend === 0 ? k.a : k.onbekend === 2 ? k.b : eindVan(k));

/** Hoeveel plekken er zijn en hoeveel er aan het begin van het verhaal aan zijn. */
function kortPlekken(k: Kort) {
  const eind = eindVan(k);
  const totaal = k.op === "+" ? eind : k.a;
  /* Is het begin onbekend, dan zie je eerst hoe het nu is (het eind). */
  const startAan = k.onbekend === 0 ? eind : k.a;
  return { eind, totaal, startAan };
}

/** De som met een vraagteken op de onbekende plek, of helemaal ingevuld. */
function kortSom(k: Kort, af: boolean): Somstuk[] {
  const delen = [k.a, k.b, eindVan(k)];
  const plek = k.onbekend ?? 4;
  return [0, 1, 2, 3, 4].map((i): Somstuk => {
    if (i === 1) return { t: "teken", s: k.op };
    if (i === 3) return { t: "teken", s: "=" };
    const n = delen[i / 2];
    return !af && i === plek ? { t: "vraag", kleur: plek === 0 ? BLAUW : plek === 2 ? MINT : undefined } : { t: "getal", n };
  });
}

/**
 * Hulp in beeld (1× fout): het verhaal speelt zich af, en Bliepo laat zien
 * welke voorwerpen je moet tellen. Geeft die voorwerpen terug.
 */
async function kortHulp(b: HBord, l: Lesgids, k: Kort): Promise<number[]> {
  const { eind, totaal } = kortPlekken(k);
  const reeks = (van: number, tot: number) => Array.from({ length: Math.max(0, tot - van) }, (_, i) => van + i);
  if (k.onbekend === 0) {
    if (k.op === "+") {
      /* Wat erbij kwam, gaat terug; wat overblijft was het begin. */
      await laatGebeurenH(b, l, eind, k.a, totaal);
      return reeks(0, k.a);
    }
    await laatGebeurenH(b, l, eind, k.a, totaal);
    return reeks(0, k.a);
  }
  await laatGebeurenH(b, l, k.a, eind, totaal);
  if (k.onbekend === 2) return k.op === "+" ? reeks(k.a, eind) : reeks(eind, k.a);
  return reeks(0, eind);
}

/** Het verhaal vooruit laten gebeuren (na een goed antwoord). */
async function kortNaspelen(b: HBord, l: Lesgids, k: Kort) {
  const { eind, totaal } = kortPlekken(k);
  if (k.onbekend === 0) {
    b.zetPlekken(plekken(k.a, totaal - k.a));
    await l.wacht(500);
  }
  await laatGebeurenH(b, l, k.a, eind, totaal, 200);
}

const JA = ["Ja!", "Precies.", "Klopt.", "Goed zo."];

/** Een kort verhaaltje: voorlezen, het antwoord kiezen, en hulp zoals in de les. */
async function kortH(b: HBord, l: Lesgids, k: Kort, magLater = true, tegels = false) {
  const { totaal, startAan } = kortPlekken(k);
  const antwoord = antwoordVan(k);
  b.nieuw(k.zinnen, { stippelVoor: k.onbekend === undefined || k.onbekend === 4 ? null : k.zinnen.length - 1 });
  b.zetPlaatjes(k.soort, startAan, totaal - startAan, k.leeg ?? "eigen");
  await vertelH(b, l);
  if (k.onbekend === 0 || k.onbekend === 2) b.zet({ som: kortSom(k, false), somActief: k.onbekend });
  b.opgave();
  /* De vraag is meestal de laatste zin van het verhaal: dan niet twee keer hetzelfde zeggen. */
  const laatste = k.zinnen[k.zinnen.length - 1].replace(/[[\]_]/g, "").replace(/\b(\d+)\b/g, "{$1}");
  await l.zeg(k.vraag === laatste ? "Wat denk jij?" : k.vraag);
  /* De denkfout: opgeteld waar het eraf moest, of een getal uit het verhaal op de plek van het onbekende. */
  const opgeteld = k.op === "−" && (k.onbekend ?? 4) === 4 ? k.a + k.b : -1;
  const keuzes = tegels && antwoord <= 9 ? TEGELS : keuzesMet(antwoord, opgeteld);
  let uit: number[] = [];
  let geholpen = false;
  for (let poging = 1; ; poging++) {
    const x = await kiesGetalH(b, l, keuzes, uit, antwoord);
    if (x === antwoord) {
      b.goed();
      b.zet({ geteld: [] });
      if (!geholpen) await kortNaspelen(b, l, k);
      b.zet({ som: kortSom(k, true), somActief: null });
      await l.zeg(poging === 1 ? JA[b.opgaven % JA.length] : "Goed zo.", somZin(k.a, k.op, k.b, eindVan(k)));
      break;
    }
    if (x !== null && poging === 1) {
      b.fout();
      uit = [x];
      if (x === opgeteld) await l.zeg(`{${x}}?`, "Ah, ik zie wat je denkt.", "Het lijkt alsof je ze hebt opgeteld.", "Kijk maar wat er gebeurt.");
      else if (k.onbekend !== undefined && k.onbekend !== 4 && (x === k.a || x === k.b || x === eindVan(k)))
        await l.zeg(`{${x}}?`, "Dat getal staat al in het verhaal.", "Kijk maar wat er gebeurt.");
      else await l.zeg(`{${x}}? Niet helemaal.`, "Kijk maar wat er gebeurt.");
      const tel = await kortHulp(b, l, k);
      geholpen = true;
      b.zet({ geteld: tel });
      await l.zeg(k.telTip);
      continue;
    }
    /* 2× niet goed, of "weet ik niet": samen tellen, het antwoord, en later nog eens. */
    await l.zeg(x === null ? "Geen probleem." : "Niet helemaal.", "We tellen samen.");
    const tel = geholpen ? (b.p.geteld ?? []) : await kortHulp(b, l, k);
    await telDeze(b, l, tel);
    b.zet({ som: kortSom(k, true), somActief: null });
    await l.zeg(k.antwoordZin);
    if (magLater) {
      await l.zeg("Dit verhaaltje komt straks nog een keer terug.");
      b.later.push(k);
    }
    break;
  }
  await verderH(b, l);
  b.zet({ geteld: [] });
}

/** Korte verhaaltjes tot er minstens 15 opgaven zijn; daarna komt terug wat nog lastig was. */
async function vulAan(b: HBord, l: Lesgids, bank: Kort[], ordered = false, tegels = false) {
  const lijst = ordered ? bank : schud(bank);
  if (b.opgaven < 15) await l.zeg("We oefenen nog een paar korte verhaaltjes.", "Luister goed.");
  for (let i = 0; b.opgaven < 15 && i < lijst.length; i++) await kortH(b, l, lijst[i], true, tegels);
  const terug = b.later.splice(0);
  for (const k of terug) {
    await l.zeg("Deze kwam net al langs.", "Weet je het nu?");
    await kortH(b, l, k, false, tegels);
  }
}

/* ---------- de verhalen die we uitpluizen ---------- */

type HPluis = {
  zinnen: string[];
  soort: HoloSoort;
  leegVorm?: "plek" | "eigen";
  /** Voorwerpen aan het begin: zoveel aan, zoveel lege plekken. */
  aan: number;
  leeg: number;
  a: number;
  b: number;
  op: "+" | "−";
  vraagZin: number;
  /** De zin met de woorden die zeggen of het erbij of eraf is. */
  signaalZin: number;
  watZoeken: string;
  signaalVraag: string;
  signaalTip: string;
  signaalUitleg: string;
  foutUitleg: string[];
  kleineVraag: { zinnen: string[]; erbij: string; eraf: string; goed: string[] };
  beginVraag: string;
  beginAntwoord: string[];
  tweedeVraag: string;
  tweedeAntwoord: string[];
  naspelen: string[];
  antwoordVraag: string;
  telTip: string;
  antwoordZin: string;
  keuzes?: number[];
  /** Als kort verhaaltje, voor als het later terugkomt. */
  kort: Kort;
};

/** "1 vuurvliegje" of "3 vuurvliegjes". */
const stuks = (n: number, een: string, meer: string) => `{${n}} ${n === 1 ? een : meer}`;

function vuurvliegWeg(a: number, w: number, keuzes?: number[]): HPluis {
  const c = a - w;
  const zinnen = [`Er zweven ${a} vuurvliegjes.`, w === 1 ? "Er [vliegt] 1 [weg]." : `Er [vliegen] ${w} [weg].`, "Hoeveel vuurvliegjes zijn er nog?"];
  const antwoordZin = c === 1 ? "Er is nog {1} vuurvliegje." : `Er zijn nog {${c}} vuurvliegjes.`;
  return {
    zinnen,
    soort: "vuurvlieg",
    aan: a,
    leeg: 0,
    a,
    b: w,
    op: "−",
    vraagZin: 2,
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel vuurvliegjes er nog zijn.",
    signaalVraag: "Tik op de woorden die zeggen dat het eraf gaat.",
    signaalTip: "Tip: tik op de woorden die zeggen wat de vuurvliegjes doen.",
    signaalUitleg: "Er vliegen vuurvliegjes weg.",
    foutUitleg: ["Maar er komen geen vuurvliegjes bij."],
    kleineVraag: {
      zinnen: ["Er vliegen vuurvliegjes weg.", "Moet je er dan wat bij doen?", "Of moet je er wat weghalen?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er wat weg.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel vuurvliegjes waren er eerst?",
    beginAntwoord: [`Er waren eerst {${a}} vuurvliegjes.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeAntwoord: [w === 1 ? "Er vliegt {1} vuurvliegje weg." : `Er vliegen {${w}} vuurvliegjes weg.`, `Dus halen we {${w}} eraf.`],
    naspelen: [
      "Je weet het antwoord vast al.",
      w === 1 ? "Laat dat vuurvliegje toch maar wegvliegen." : `Laat de {${w}} vuurvliegjes toch maar wegvliegen.`,
      `Tik op ${stuks(w, "vuurvliegje", "vuurvliegjes")}.`,
    ],
    antwoordVraag: "Hoeveel vuurvliegjes zijn er dus nog?",
    telTip: "Tel de vuurvliegjes die er nog zijn.",
    antwoordZin,
    keuzes,
    kort: { zinnen: zinnen.map((z) => z.replace(/[[\]]/g, "")), soort: "vuurvlieg", a, b: w, op: "−", vraag: "Hoeveel vuurvliegjes zijn er nog?", telTip: "Tel de vuurvliegjes die er nog zijn.", antwoordZin },
  };
}

function bloemenOpen(a: number, n: number, keuzes?: number[]): HPluis {
  const c = a + n;
  const zinnen = [`Er bloeien ${a} bloemen.`, n === 1 ? "Er gaat nog 1 knopje [open]." : `Er gaan nog ${n} knopjes [open].`, "Hoeveel bloemen bloeien er nu?"];
  const antwoordZin = `Er bloeien nu {${c}} bloemen.`;
  return {
    zinnen,
    soort: "bloem",
    aan: a,
    leeg: n,
    a,
    b: n,
    op: "+",
    vraagZin: 2,
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel bloemen er nu bloeien.",
    signaalVraag: "Tik op het woord dat zegt dat er bloemen bijkomen.",
    signaalTip: "Tip: tik op het woord dat zegt wat de knopjes doen.",
    signaalUitleg: "Het woord *open* zegt dat er bloemen bijkomen.",
    foutUitleg: ["Maar er gaan geen bloemen weg."],
    kleineVraag: {
      zinnen: ["Er gaan knopjes open.", "Worden het dan meer bloemen?", "Of minder?"],
      erbij: "Meer",
      eraf: "Minder",
      goed: ["Het worden er meer.", "Dus het is erbij."],
    },
    beginVraag: "Hoeveel bloemen bloeiden er eerst?",
    beginAntwoord: [`Er bloeiden eerst {${a}} bloemen.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal doen we erbij?",
    tweedeAntwoord: [n === 1 ? "Er gaat {1} knopje open." : `Er gaan {${n}} knopjes open.`, `Dus doen we {${n}} erbij.`],
    naspelen: [
      "Je weet het antwoord vast al.",
      n === 1 ? "Laat dat knopje toch maar opengaan." : `Laat de {${n}} knopjes toch maar opengaan.`,
      `Tik op ${stuks(n, "knopje", "knopjes")}.`,
    ],
    antwoordVraag: "Hoeveel bloemen bloeien er nu?",
    telTip: "Tel alle bloemen die bloeien.",
    antwoordZin,
    keuzes,
    kort: { zinnen: zinnen.map((z) => z.replace(/[[\]]/g, "")), soort: "bloem", a, b: n, op: "+", vraag: "Hoeveel bloemen bloeien er nu?", telTip: "Tel alle bloemen die bloeien.", antwoordZin },
  };
}

function lantaarnsUit(l: Lesgids, a: number, n: number, totaal = a, keuzes?: number[]): HPluis {
  const c = a - n;
  const zinnen = [`Er branden ${a} lantaarntjes.`, `${Wie(l)} doet er ${n} [uit].`, "Hoeveel lantaarntjes branden er nog?"];
  const antwoordZin = c === 1 ? "Er brandt nog {1} lantaarntje." : `Er branden nog {${c}} lantaarntjes.`;
  return {
    zinnen,
    soort: "lantaarn",
    aan: a,
    leeg: totaal - a,
    a,
    b: n,
    op: "−",
    vraagZin: 2,
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel lantaarntjes er nog branden.",
    signaalVraag: "Tik op het woord dat zegt dat er lantaarntjes uitgaan.",
    signaalTip: "Tip: tik op het woord dat zegt wat er met de lantaarntjes gebeurt.",
    signaalUitleg: "Het woord *uit* zegt dat er minder lantaarntjes branden.",
    foutUitleg: ["Maar er gaan lantaarntjes uit."],
    kleineVraag: {
      zinnen: ["Er gaan lantaarntjes uit.", "Branden er dan meer lantaarntjes?", "Of minder?"],
      erbij: "Meer",
      eraf: "Minder",
      goed: ["Er branden er minder.", "Dus het is eraf."],
    },
    beginVraag: "Hoeveel lantaarntjes brandden er eerst?",
    beginAntwoord: [`Er brandden eerst {${a}} lantaarntjes.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal zegt hoeveel er uitgaan?",
    tweedeAntwoord: [n === 1 ? "Er gaat {1} lantaarntje uit." : `Er gaan {${n}} lantaarntjes uit.`, `Dus halen we {${n}} eraf.`],
    naspelen: ["De som staat klaar.", n === 1 ? "Tik op {1} lantaarntje om het uit te doen." : `Tik op {${n}} lantaarntjes om ze uit te doen.`],
    antwoordVraag: "Hoeveel lantaarntjes branden er nog?",
    telTip: "Tel de lantaarntjes die nog branden.",
    antwoordZin,
    keuzes,
    kort: {
      zinnen: zinnen.map((z) => z.replace(/[[\]]/g, "")),
      soort: "lantaarn",
      a,
      b: n,
      op: "−",
      vraag: "Hoeveel lantaarntjes branden er nog?",
      telTip: "Tel de lantaarntjes die nog branden.",
      antwoordZin,
    },
  };
}

/** Plekken voor `aan`, en met lege plekken erbij tot `totaal`. */
const somVol = (a: number, op: "+" | "−", b: number): Somstuk[] => [
  { t: "getal", n: a },
  { t: "teken", s: op },
  { t: "getal", n: b },
  { t: "teken", s: "=" },
  { t: "getal", n: op === "+" ? a + b : a - b },
];
const somVraag = (a: number, op: "+" | "−", b: number): Somstuk[] => [{ t: "getal", n: a }, { t: "teken", s: op }, { t: "getal", n: b }, { t: "teken", s: "=" }, { t: "vraag" }];

async function beginH(b: HBord, l: Lesgids, v: HPluis) {
  b.nieuw(v.zinnen);
  b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen");
  await vertelH(b, l);
}

/**
 * Het antwoord kiezen. 1× niet goed: grijs, "tel nog eens" en opnieuw;
 * 2× of "weet ik niet": samen tellen, het antwoord, en het verhaal komt
 * later nog eens terug. Geeft terug of het meteen goed was.
 */
async function vraagAntwoordH(
  b: HBord,
  l: Lesgids,
  v: { antwoord: number; keuzes: number[]; telTip: string; antwoordZin: string; telOp: Plekstaat; kort?: Kort },
): Promise<boolean> {
  b.opgave();
  let uit: number[] = [];
  for (let poging = 1; ; poging++) {
    const x = await kiesGetalH(b, l, v.keuzes, uit, v.antwoord);
    if (x === v.antwoord) {
      b.goed();
      return poging === 1;
    }
    if (x !== null && poging === 1) {
      b.fout();
      uit = [x];
      await l.zeg(`{${x}}? Niet helemaal.`, v.telTip);
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
    await telSamenH(b, l, v.telOp);
    await l.zeg(v.antwoordZin);
    b.zet({ tel: null });
    if (v.kort) {
      await l.zeg("Dit verhaaltje komt straks nog een keer terug.");
      b.later.push(v.kort);
    }
    return false;
  }
}

/** De hele uitpluisroute, stap voor stap (Small en Bigger Problems). */
async function pluisUitH(b: HBord, l: Lesgids, v: HPluis, o: { zonderKeuze?: boolean; terugLaten?: boolean } = {}) {
  const antwoord = uitkomst(v);
  const getallen = getallenIn(v.zinnen);

  /* Alleen de tekst, groot in het midden. */
  b.zet({ midden: true, som: null });
  await l.wacht(400);

  /* 1. De getallen. Een tik op een woord dat geen getal is: geen reactie. */
  b.opgave();
  await l.zeg("Tik op alle getallen in het verhaal.");
  const gevonden: string[] = [];
  while (gevonden.length < getallen.length) {
    const g = await wachtTikH(b, l, "getal", ["Getallen zijn cijfers, zoals een {2} of een {7}.", "Tik op de cijfers in het verhaal."]);
    if (g.soort === "weetniet") {
      b.zet({ omcirkeld: getallen.map((x) => x.sleutel) });
      await l.zeg("Kijk, hier staan de getallen.");
      break;
    }
    const sleutel = g.sleutel as string;
    if (gevonden.includes(sleutel)) continue;
    gevonden.push(sleutel);
    b.zet({ omcirkeld: [...gevonden] });
    if (gevonden.length < getallen.length) await l.zeg("Je hebt één getal.", "Tik nu op het andere.");
  }
  await l.zeg(`Ja, {${v.a}} en {${v.b}}.`, "Dat is een goed begin.");

  /* 2. De vraag. */
  b.opgave();
  await l.zeg("Wat moeten we uitzoeken?", "Tik op de zin met de vraag.");
  for (let fout = 0; ; ) {
    const g = await wachtTikH(b, l, "zin");
    if (g.soort === "zin" && g.i === v.vraagZin) {
      b.zet({ vraagZin: v.vraagZin, hintVraagteken: false });
      await l.zeg("Dat klopt.", v.watZoeken);
      break;
    }
    if (g.soort === "zin") {
      b.zet({ flitsZin: g.i as number });
      b.fout();
      await l.wacht(700);
      b.zet({ flitsZin: null });
    }
    fout++;
    if (g.soort === "weetniet" || fout >= 2) {
      b.zet({ vraagZin: v.vraagZin, hintVraagteken: false });
      await l.zeg("Kijk, deze zin stelt de vraag.", "Hij eindigt met een vraagteken.", v.watZoeken);
      break;
    }
    await l.zeg("Goed geprobeerd.", "Maar dat stuk stelt de vraag niet.");
    /* Hulp in beeld: het vraagteken licht op. */
    b.zet({ hintVraagteken: true });
    await l.zeg("Ik geef je een tip.", "Zoek de zin met een vraagteken aan het eind.", "Tik dan op die zin.");
  }

  /* 3. Erbij of eraf, en de woorden die dat zeggen. */
  b.opgave();
  let keuze: string | null = v.op === "+" ? "Erbij" : "Eraf";
  if (!o.zonderKeuze) {
    await l.zeg("Is het een plussom of een minsom?", "Komt er iets bij, of gaat er iets af?");
    keuze = await erbijErafH(b, l, v.op);
  }
  if (keuze === (v.op === "+" ? "Erbij" : "Eraf")) {
    await l.zeg(o.zonderKeuze ? "" : "Heel goed.", v.signaalVraag);
    for (let fout = 0; ; ) {
      const g = await wachtTikH(b, l, "woord", fout === 0 ? [v.signaalTip] : undefined);
      if (g.soort === "woord" && g.signaal) {
        b.zet({ signaalGroen: true, hintZin: null });
        await l.zeg("Goed gezien.", v.signaalUitleg);
        break;
      }
      fout++;
      if (g.soort === "weetniet" || fout >= 2) {
        b.zet({ signaalGroen: true, hintZin: null });
        await l.zeg("Kijk, hier staat het.", v.signaalUitleg);
        break;
      }
      /* Hulp: Bliepo leest het aangetikte woord voor, en de goede zin krijgt een rand. */
      b.fout();
      b.zet({ hintZin: v.signaalZin });
      await l.zeg(`Daar staat *${String(g.tekst ?? "")}*.`, "Het staat in de zin met de rand.", "Luister nog eens.", voorleeszin(v.zinnen[v.signaalZin]), v.signaalTip);
    }
  } else {
    /* Een kleinere vraag, in gewone woorden. Daarna geen woordenstap meer. */
    b.fout();
    if (keuze === null) await l.zeg("Geen zorgen.", "Ik vraag het anders.");
    else await l.zeg("Goed geprobeerd.", ...v.foutUitleg);
    if (o.terugLaten) {
      /* Bigger Problems: de voorwerpen komen terug in beeld. */
      b.zet({ midden: false });
      await l.wacht(900);
    }
    await l.zeg(...v.kleineVraag.zinnen);
    const k2 = await l.kies([v.kleineVraag.erbij, v.kleineVraag.eraf]);
    b.zet({ signaalGroen: true, midden: true });
    if (k2 === (v.op === "+" ? v.kleineVraag.erbij : v.kleineVraag.eraf)) await l.zeg("Precies.", ...v.kleineVraag.goed);
    else await l.zeg("Kijk naar de groene woorden.", ...v.kleineVraag.goed);
  }

  /* 4. De som, vakje voor vakje. De voorwerpen komen terug. */
  b.zet({ midden: false, som: LEGE_SOM(v.op), somActief: 0 });
  b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen");
  const streep = (n: number) => {
    const plek = getallen.find((x) => x.n === n && !(b.p.doorgestreept ?? []).includes(x.sleutel));
    if (plek) b.zet({ doorgestreept: [...(b.p.doorgestreept ?? []), plek.sleutel] });
  };
  b.opgave();
  await l.zeg("We weten nu alles voor de som.", "Welk getal zetten we *eerst*?");
  const opties = [v.a, v.b].sort((x, y) => x - y);
  if (v.a !== v.b) {
    let k = await kiesGetalH(b, l, opties, [], v.a);
    if (k !== v.a) {
      if (k !== null && v.op === "+") {
        await l.zeg("Dat mag ook.", "Maar we volgen het verhaal.", ...v.beginAntwoord);
      } else {
        /* Een kleinere vraag (Synthesis: "hoeveel waren er in het begin?"). */
        if (k !== null) b.fout();
        await l.zeg(k === null ? "Geen zorgen." : `{${k}}? Niet helemaal.`, v.beginVraag);
        k = await kiesGetalH(b, l, opties, [], v.a);
        if (k !== v.a) await l.zeg(...v.beginAntwoord);
      }
    }
  }
  b.somDeel(0, { t: "getal", n: v.a });
  streep(v.a);
  b.zet({ somActief: 2 });
  await l.zeg("Goed.", v.tweedeVraag);
  if (v.a !== v.b) {
    const k = await kiesGetalH(b, l, opties, [], v.b);
    if (k !== v.b) await l.zeg(...v.tweedeAntwoord);
  }
  b.somDeel(2, { t: "getal", n: v.b });
  streep(v.b);
  b.zet({ somActief: 4 });

  /* 5. Naspelen. */
  await l.zeg("Mooi, alles staat klaar.", ...v.naspelen);
  await naspelenH(b, l, v.b, v.op === "+" ? "erbij" : "weg");

  /* 6. Het antwoord. */
  await l.zeg(v.antwoordVraag);
  const meteen = await vraagAntwoordH(b, l, { ...v, antwoord, keuzes: v.keuzes ?? keuzesMet(antwoord), telOp: "aan", kort: v.kort });
  b.somDeel(4, { t: "getal", n: antwoord });
  b.zet({ somActief: null, geteld: [] });
  await l.zeg(meteen ? "Heel goed gedaan." : "Kijk, nu is de som af.", somZin(v.a, v.op, v.b, antwoord));
}

/**
 * Het kind probeert het meteen zelf. Goed: alleen nog naspelen. Niet goed of
 * "weet ik niet": Bliepo benoemt de denkfout en we pluizen het samen uit
 * (R3 Small Problems: fout = de hulproute).
 */
async function meteenH(b: HBord, l: Lesgids, v: HPluis, opening: string[]) {
  const antwoord = uitkomst(v);
  const opgeteld = v.op === "−" ? v.a + v.b : -1;
  const keuzes = v.keuzes ?? keuzesMet(antwoord, opgeteld);
  b.opgave();
  await l.zeg(...opening, v.antwoordVraag);
  const x = await kiesGetalH(b, l, keuzes, [], antwoord);
  if (x === antwoord) {
    b.goed();
    b.zet({ som: somVol(v.a, v.op, v.b) });
    await l.zeg("Knap!", somZin(v.a, v.op, v.b, antwoord), "Kijk maar.", ...v.naspelen.slice(-1));
    await naspelenH(b, l, v.b, v.op === "+" ? "erbij" : "weg");
    await l.zeg("Zie je wel?", v.antwoordZin);
    return;
  }
  if (x === null) await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
  else {
    b.fout();
    if (x === opgeteld) await l.zeg(`{${x}}?`, "Ah, ik zie wat je denkt.", "Het lijkt alsof je ze hebt opgeteld.", "We doen het samen stap voor stap.");
    else await l.zeg(`{${x}}? Niet helemaal.`, "We doen het samen stap voor stap.");
  }
  await pluisUitH(b, l, v);
}

/**
 * Welke som past bij het verhaal? (Bigger Problems, verhaal 3 en 4, en
 * Small Problems, verhaal 3 en 4.) Daarna het antwoord; niet goed = eerst
 * naspelen met de voorwerpen.
 */
async function somKiezenH(
  b: HBord,
  l: Lesgids,
  v: { a: number; b: number; op: "+" | "−"; foutSommen: string[]; ding: string; somUitleg: string; naspelen: string[]; antwoordVraag: string; telTip: string; antwoordZin: string; kort: Kort },
) {
  const goed = `${v.a} ${v.op} ${v.b}`;
  const antwoord = v.op === "+" ? v.a + v.b : v.a - v.b;
  b.opgave();
  const k = await kiesH(b, l, schud([goed, ...v.foutSommen]), { som: true, wijsSleutel: "sommen", wijs: ["Tik op de som die past."], goed });
  if (k === goed) await l.zeg(`Precies, {${v.a}} ${v.op} {${v.b}}.`, v.somUitleg);
  else {
    if (k !== null) b.fout();
    await l.zeg(k === null ? "Geen zorgen." : "Niet helemaal.", v.somUitleg, `Deze som past: {${v.a}} ${v.op} {${v.b}}.`);
  }
  b.zet({ som: somVraag(v.a, v.op, v.b), somActief: 4 });
  await l.zeg(v.antwoordVraag);
  b.opgave();
  const keuzes = keuzesMet(antwoord, v.op === "−" ? v.a + v.b : -1);
  const x = await kiesGetalH(b, l, keuzes, [], antwoord);
  if (x === antwoord) {
    b.goed();
    await l.zeg("Goed zo.", v.antwoordZin);
  } else {
    if (x !== null) b.fout();
    await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, ...v.naspelen);
    await naspelenH(b, l, v.b, v.op === "+" ? "erbij" : "weg");
    await l.zeg(v.antwoordVraag);
    b.opgaven--; /* dezelfde opgave, niet dubbel tellen */
    const zelf = await vraagAntwoordH(b, l, { antwoord, keuzes, telTip: v.telTip, antwoordZin: v.antwoordZin, telOp: "aan", kort: v.kort });
    if (zelf) await l.zeg("Ja.", v.antwoordZin);
  }
  b.somDeel(4, { t: "getal", n: antwoord });
  b.zet({ somActief: null });
}

/* ---------- toetsen (Assessment en Mastery Check) ---------- */

/**
 * Een toetsvraag: 1× niet goed = "kijk nog eens" en dezelfde vraag (de foute
 * knop grijs); 2× niet goed of "weet ik niet" = naar de les. Geeft `false` als
 * het kind naar de les gaat.
 */
async function toetsVraag(b: HBord, l: Lesgids, opties: (number | string)[], goed: number | string, som = false, weetNiet = true): Promise<boolean> {
  b.opgave();
  let uit: (number | string)[] = [];
  for (let poging = 1; poging <= 2; poging++) {
    const x = await kiesH(b, l, opties, { uit, som, goed, weetNiet, wijsSleutel: som ? "sommen" : "keuzes", wijs: som ? ["Tik op de som die past."] : undefined });
    if (x === goed) {
      b.goed();
      return true;
    }
    if (x === null) return false;
    if (poging === 1) {
      b.fout();
      uit = [x];
      const dichtbij = typeof x === "number" && typeof goed === "number" && Math.abs(x - goed) <= 1;
      await l.zeg(typeof x === "number" ? `{${x}}?` : `${x.replace(/(\d+)/g, "{$1}")}?`, dichtbij ? "Heel dichtbij." : "", "Kijk nog eens.");
    }
  }
  return false;
}

async function naarDeLes(l: Lesgids) {
  await l.zeg("Geen probleem, we leren het samen.", 'Begin met de les "Kleine verhaaltjes".', "Daar doen we het stap voor stap.");
}

/**
 * Het begin van een toets, zoals Synthesis: "Weet je hoe je zulke sommen
 * oplost?" Bij ja mag het kind kiezen: de toets, of naar de eerste les.
 * Geeft `false` als het kind voor de les kiest.
 */
async function toetsOfLesH(l: Lesgids): Promise<boolean> {
  await l.zeg("Weet je hoe je zulke verhaaltjessommen oplost?");
  const weet = await l.kies(["Ja", "Nee"]);
  if (weet !== "Ja") {
    await l.zeg("Geen zorgen.", "Probeer het gewoon.");
    return true;
  }
  await l.zeg("Oké.", "Wil je in een toets laten zien wat je kunt?", "Of doen we samen de lessen?");
  const keuze = await l.kies(["Toets", "Les"]);
  if (keuze === "Les") {
    await l.zeg("Prima.", 'Begin dan met de les "Kleine verhaaltjes".', "Daar doen we het samen.");
    return false;
  }
  await l.zeg("Mooi.");
  return true;
}

/** De hele toets: lantaarntjes uitdoen, bloemen planten met een verstopt getal, en daarna oefenen tot 15. */
async function toetsH(l: Lesgids, t: { uitA: number; uitN: number; uitKeuzes: number[]; plantA: number; plantEind: number; sommen: string[]; plantKeuzes: number[] }) {
  const b = new HBord(l);
  const nog = t.uitA - t.uitN;
  await l.zeg("Ik heb verhaaltjessommen voor je.", "Ik lees elk verhaal voor.");

  /* Verhaal 1: lantaarntjes uitdoen (20 plekken, zoals Synthesis). */
  b.nieuw([`Er branden ${t.uitA} lantaarntjes.`, `${Wie(l)} doet er ${t.uitN} uit.`, "Hoeveel lantaarntjes branden er nog?"]);
  b.zetPlaatjes("lantaarn", t.uitA, 20 - t.uitA);
  await vertelH(b, l);
  if (!(await toetsOfLesH(l))) return false;
  await l.zeg("Wat denk jij?", "Hoeveel lantaarntjes blijven er branden?");
  if (!(await toetsVraag(b, l, t.uitKeuzes, nog))) {
    await naarDeLes(l);
    return false;
  }
  await l.zeg("Dat klopt.", `Er branden er nog {${nog}}.`);
  await laatGebeurenH(b, l, t.uitA, nog, 20, 180);
  b.zet({ som: somVol(t.uitA, "−", t.uitN) });
  await verderH(b, l);

  /* Verhaal 2: bloemen planten; eerst de som kiezen (het getal in het midden is verstopt). */
  const erbij = t.plantEind - t.plantA;
  b.nieuw([`Er staan ${t.plantA} bloemen in de tuin.`, `${Wie(l)} plant er nog wat bij.`, `Nu zijn het er samen ${t.plantEind}.`, `Hoeveel bloemen plantte ${wie(l)}?`], { stippelVoor: 3 });
  b.zetPlaatjes("bloem", t.plantA, 0, "plek");
  await vertelH(b, l);
  await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
  const goedeSom = `${t.plantA} + ? = ${t.plantEind}`;
  if (!(await toetsVraag(b, l, schud([goedeSom, ...t.sommen]), goedeSom, true))) {
    await naarDeLes(l);
    return false;
  }
  b.zet({ som: [{ t: "getal", n: t.plantA }, { t: "teken", s: "+" }, { t: "vraag", kleur: MINT }, { t: "teken", s: "=" }, { t: "getal", n: t.plantEind }], somActief: 2 });
  await l.zeg("Goed.", `Hoeveel bloemen plantte ${wie(l)} dan?`);
  if (!(await toetsVraag(b, l, t.plantKeuzes, erbij))) {
    await naarDeLes(l);
    return false;
  }
  b.somDeel(2, { t: "getal", n: erbij });
  b.zet({ somActief: null });
  await l.zeg("Precies.", `${Wie(l)} plantte er {${erbij}} bij.`);
  /* Als controle komen de bloemen erbij. */
  b.zetPlaatjes("bloem", t.plantA, erbij, "plek");
  await l.wacht(500);
  await laatGebeurenH(b, l, t.plantA, t.plantEind, t.plantEind, 160);
  await verderH(b, l);

  await l.zeg(l.naam ? `Mooi werk, ${l.naam}.` : "Mooi werk.", "Je hebt lastige verhaaltjessommen opgelost.");
  await vulAan(b, l, BANK_20);
  return true;
}

/* ---------- de verhalen voor het oefenen ---------- */

const kortMin = (soort: HoloSoort, zinnen: string[], a: number, b: number, ding: string, vraag: string, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  zinnen,
  soort,
  a,
  b,
  op: "−",
  vraag,
  telTip,
  antwoordZin,
  leeg,
});
const kortPlus = (soort: HoloSoort, zinnen: string[], a: number, b: number, vraag: string, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  zinnen,
  soort,
  a,
  b,
  op: "+",
  vraag,
  telTip,
  antwoordZin,
  leeg,
});

/** Verhaaltjes tot 10 (Kleine verhaaltjes). */
const BANK_10: Kort[] = [
  kortMin("vuurvlieg", ["Er zweven 8 vuurvliegjes.", "Er vliegen er 3 weg.", "Hoeveel vuurvliegjes zijn er nog?"], 8, 3, "vuurvliegjes", "Hoeveel vuurvliegjes zijn er nog?", "Tel de vuurvliegjes die er nog zijn.", "Er zijn nog {5} vuurvliegjes."),
  kortPlus("bloem", ["Er bloeien 4 bloemen.", "Er gaan nog 2 knopjes open.", "Hoeveel bloemen bloeien er nu?"], 4, 2, "Hoeveel bloemen bloeien er nu?", "Tel alle bloemen die bloeien.", "Er bloeien nu {6} bloemen."),
  kortMin("lantaarn", ["Er branden 9 lantaarntjes.", "Er gaan er 4 uit.", "Hoeveel lantaarntjes branden er nog?"], 9, 4, "lantaarntjes", "Hoeveel lantaarntjes branden er nog?", "Tel de lantaarntjes die nog branden.", "Er branden nog {5} lantaarntjes."),
  kortPlus("paddenstoel", ["Er gloeien 3 paddenstoelen.", "Er gaan er nog 4 gloeien.", "Hoeveel paddenstoelen gloeien er nu?"], 3, 4, "Hoeveel paddenstoelen gloeien er nu?", "Tel alle paddenstoelen die gloeien.", "Er gloeien nu {7} paddenstoelen."),
  kortMin("lichtje", ["Er zweven 6 lichtjes.", "Er vliegen er 2 weg.", "Hoeveel lichtjes zijn er nog?"], 6, 2, "lichtjes", "Hoeveel lichtjes zijn er nog?", "Tel de lichtjes die er nog zijn.", "Er zijn nog {4} lichtjes."),
  kortPlus("bloem", ["Er staan 6 bloemen in de tuin.", "Bliepo plant er 3 bij.", "Hoeveel bloemen staan er nu?"], 6, 3, "Hoeveel bloemen staan er nu?", "Tel alle bloemen.", "Er staan nu {9} bloemen.", "plek"),
  kortPlus("vuurvlieg", ["Er zweven 5 vuurvliegjes.", "Er komen er 4 bij.", "Hoeveel vuurvliegjes zijn het nu?"], 5, 4, "Hoeveel vuurvliegjes zijn het nu?", "Tel alle vuurvliegjes.", "Het zijn nu {9} vuurvliegjes."),
  kortPlus("lantaarn", ["Er branden 2 lantaarntjes.", "Bliepo doet er nog 5 aan.", "Hoeveel lantaarntjes branden er nu?"], 2, 5, "Hoeveel lantaarntjes branden er nu?", "Tel alle lantaarntjes die branden.", "Er branden nu {7} lantaarntjes."),
  kortMin("paddenstoel", ["Er gloeien 10 paddenstoelen.", "Er gaan er 6 uit.", "Hoeveel paddenstoelen gloeien er nog?"], 10, 6, "paddenstoelen", "Hoeveel paddenstoelen gloeien er nog?", "Tel de paddenstoelen die nog gloeien.", "Er gloeien nog {4} paddenstoelen."),
  kortPlus("lichtje", ["Er zweven 3 lichtjes.", "Bliepo tovert er nog 3 bij.", "Hoeveel lichtjes zijn het nu?"], 3, 3, "Hoeveel lichtjes zijn het nu?", "Tel alle lichtjes.", "Het zijn nu {6} lichtjes."),
  kortMin("vuurvlieg", ["Er zweven 10 vuurvliegjes.", "Er vliegen er 7 weg.", "Hoeveel vuurvliegjes zijn er nog?"], 10, 7, "vuurvliegjes", "Hoeveel vuurvliegjes zijn er nog?", "Tel de vuurvliegjes die er nog zijn.", "Er zijn nog {3} vuurvliegjes."),
  kortMin("bloem", ["Er bloeien 7 bloemen.", "Er gaan er 2 dicht.", "Hoeveel bloemen bloeien er nog?"], 7, 2, "bloemen", "Hoeveel bloemen bloeien er nog?", "Tel de bloemen die nog bloeien.", "Er bloeien nog {5} bloemen."),
];

/** Verhaaltjes tot 20 (Grotere verhaaltjes en de toetsen). */
const BANK_20: Kort[] = [
  kortMin("vuurvlieg", ["Er zweven 15 vuurvliegjes.", "Er vliegen er 7 weg.", "Hoeveel vuurvliegjes zijn er nog?"], 15, 7, "vuurvliegjes", "Hoeveel vuurvliegjes zijn er nog?", "Tel de vuurvliegjes die er nog zijn.", "Er zijn nog {8} vuurvliegjes."),
  kortPlus("bloem", ["Er staan 8 bloemen in de tuin.", "Bliepo plant er 5 bij.", "Hoeveel bloemen staan er nu?"], 8, 5, "Hoeveel bloemen staan er nu?", "Tel alle bloemen.", "Er staan nu {13} bloemen.", "plek"),
  kortMin("lantaarn", ["Er branden 18 lantaarntjes.", "Er gaan er 9 uit.", "Hoeveel lantaarntjes branden er nog?"], 18, 9, "lantaarntjes", "Hoeveel lantaarntjes branden er nog?", "Tel de lantaarntjes die nog branden.", "Er branden nog {9} lantaarntjes."),
  kortPlus("paddenstoel", ["Er gloeien 9 paddenstoelen.", "Er gaan er nog 6 gloeien.", "Hoeveel paddenstoelen gloeien er nu?"], 9, 6, "Hoeveel paddenstoelen gloeien er nu?", "Tel alle paddenstoelen die gloeien.", "Er gloeien nu {15} paddenstoelen."),
  kortMin("lichtje", ["Er zweven 13 lichtjes.", "Er vliegen er 5 weg.", "Hoeveel lichtjes zijn er nog?"], 13, 5, "lichtjes", "Hoeveel lichtjes zijn er nog?", "Tel de lichtjes die er nog zijn.", "Er zijn nog {8} lichtjes."),
  kortPlus("vuurvlieg", ["Er zweven 7 vuurvliegjes.", "Er komen er 7 bij.", "Hoeveel vuurvliegjes zijn het nu?"], 7, 7, "Hoeveel vuurvliegjes zijn het nu?", "Tel alle vuurvliegjes.", "Het zijn nu {14} vuurvliegjes."),
  kortPlus("lantaarn", ["Er branden 11 lantaarntjes.", "Bliepo doet er nog 6 aan.", "Hoeveel lantaarntjes branden er nu?"], 11, 6, "Hoeveel lantaarntjes branden er nu?", "Tel alle lantaarntjes die branden.", "Er branden nu {17} lantaarntjes."),
  kortMin("bloem", ["Er bloeien 16 bloemen.", "Er gaan er 8 dicht.", "Hoeveel bloemen bloeien er nog?"], 16, 8, "bloemen", "Hoeveel bloemen bloeien er nog?", "Tel de bloemen die nog bloeien.", "Er bloeien nog {8} bloemen."),
  kortMin("paddenstoel", ["Er gloeien 14 paddenstoelen.", "Er gaan er 6 uit.", "Hoeveel paddenstoelen gloeien er nog?"], 14, 6, "paddenstoelen", "Hoeveel paddenstoelen gloeien er nog?", "Tel de paddenstoelen die nog gloeien.", "Er gloeien nog {8} paddenstoelen."),
  kortPlus("lichtje", ["Er zweven 12 lichtjes.", "Bliepo tovert er nog 8 bij.", "Hoeveel lichtjes zijn het nu?"], 12, 8, "Hoeveel lichtjes zijn het nu?", "Tel alle lichtjes.", "Het zijn nu {20} lichtjes."),
  kortMin("vuurvlieg", ["Er zweven 20 vuurvliegjes.", "Er vliegen er 11 weg.", "Hoeveel vuurvliegjes zijn er nog?"], 20, 11, "vuurvliegjes", "Hoeveel vuurvliegjes zijn er nog?", "Tel de vuurvliegjes die er nog zijn.", "Er zijn nog {9} vuurvliegjes."),
  kortPlus("bloem", ["Er bloeien 9 bloemen.", "Er gaan nog 4 knopjes open.", "Hoeveel bloemen bloeien er nu?"], 9, 4, "Hoeveel bloemen bloeien er nu?", "Tel alle bloemen die bloeien.", "Er bloeien nu {13} bloemen."),
  kortMin("lantaarn", ["Er branden 12 lantaarntjes.", "Er gaan er 4 uit.", "Hoeveel lantaarntjes branden er nog?"], 12, 4, "lantaarntjes", "Hoeveel lantaarntjes branden er nog?", "Tel de lantaarntjes die nog branden.", "Er branden nog {8} lantaarntjes."),
];

/** Verhaaltjes met een verstopt getal (Verstopte getallen). */
const vers = (soort: HoloSoort, zinnen: string[], a: number, b: number, op: "+" | "−", onbekend: 0 | 2, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  zinnen,
  soort,
  a,
  b,
  op,
  onbekend,
  /* Zelf omgezet: voorleeszin() komt uit een client-bestand en mag hier (bij het laden van de lijst) niet. */
  vraag: zinnen[zinnen.length - 1].replace(/[[\]_]/g, "").replace(/\b(\d+)\b/g, "{$1}"),
  telTip,
  antwoordZin,
  leeg,
});
const BANK_VERSTOPT: Kort[] = [
  vers("bloem", ["Er staan een paar bloemen in de tuin.", "Bliepo plant er 4 bij.", "Nu zijn het er 10.", "Hoeveel bloemen stonden er eerst?"], 6, 4, "+", 0, "Tel de bloemen die er eerst stonden.", "Er stonden eerst {6} bloemen.", "plek"),
  vers("lantaarn", ["Er branden 15 lantaarntjes.", "Bliepo doet er een paar uit.", "Nu branden er nog 9.", "Hoeveel lantaarntjes deed Bliepo uit?"], 15, 6, "−", 2, "Tel de lantaarntjes die uit zijn.", "Bliepo deed er {6} uit."),
  vers("vuurvlieg", ["Er zweven 8 vuurvliegjes.", "Er komen er nog wat bij.", "Nu zijn het er 13.", "Hoeveel vuurvliegjes kwamen erbij?"], 8, 5, "+", 2, "Tel de vuurvliegjes die erbij kwamen.", "Er kwamen {5} vuurvliegjes bij."),
  vers("paddenstoel", ["Er gloeien een paar paddenstoelen.", "Er gaan er nog 6 gloeien.", "Nu gloeien er 14.", "Hoeveel paddenstoelen gloeiden er eerst?"], 8, 6, "+", 0, "Tel de paddenstoelen die eerst gloeiden.", "Er gloeiden eerst {8} paddenstoelen."),
  vers("lichtje", ["Er zweven een paar lichtjes.", "Er vliegen er 5 weg.", "Nu zijn er nog 7.", "Hoeveel lichtjes waren er eerst?"], 12, 5, "−", 0, "Tel alle lichtjes.", "Er waren eerst {12} lichtjes."),
  vers("vuurvlieg", ["Er zweven 18 vuurvliegjes.", "Er vliegen er een paar weg.", "Nu zijn er nog 10.", "Hoeveel vuurvliegjes vlogen er weg?"], 18, 8, "−", 2, "Tel de plekjes waar een vuurvliegje was.", "Er vlogen {8} vuurvliegjes weg."),
  vers("bloem", ["Er staan 9 bloemen in de tuin.", "Bliepo plant er nog wat bij.", "Nu zijn het er 16.", "Hoeveel bloemen plantte Bliepo?"], 9, 7, "+", 2, "Tel de bloemen die erbij kwamen.", "Bliepo plantte er {7}.", "plek"),
  vers("lantaarn", ["Er branden wat lantaarntjes.", "Bliepo doet er nog 3 aan.", "Nu branden er 11.", "Hoeveel lantaarntjes brandden er eerst?"], 8, 3, "+", 0, "Tel de lantaarntjes die eerst brandden.", "Er brandden eerst {8} lantaarntjes."),
  vers("paddenstoel", ["Er gloeien 17 paddenstoelen.", "Er gaan er een paar uit.", "Nu gloeien er nog 8.", "Hoeveel paddenstoelen gingen er uit?"], 17, 9, "−", 2, "Tel de paddenstoelen die uit zijn.", "Er gingen {9} paddenstoelen uit."),
  vers("lichtje", ["Er zweven 5 lichtjes.", "Bliepo tovert er nog wat bij.", "Nu zijn het er 12.", "Hoeveel lichtjes toverde Bliepo erbij?"], 5, 7, "+", 2, "Tel de lichtjes die erbij kwamen.", "Bliepo toverde er {7} bij."),
  vers("vuurvlieg", ["Er zweven een paar vuurvliegjes.", "Er komen er nog 7 bij.", "Nu zijn het er 15.", "Hoeveel vuurvliegjes waren er eerst?"], 8, 7, "+", 0, "Tel de vuurvliegjes die er eerst waren.", "Er waren eerst {8} vuurvliegjes."),
  vers("lantaarn", ["Er branden 20 lantaarntjes.", "Bliepo doet er een paar uit.", "Nu branden er nog 14.", "Hoeveel lantaarntjes deed Bliepo uit?"], 20, 6, "−", 2, "Tel de lantaarntjes die uit zijn.", "Bliepo deed er {6} uit."),
];

/* ---------- "omgekeerde" verhalen (Mixed Problems) ---------- */

type OmgekeerdH = Omit<Omgekeerd, "soort"> & { soort: HoloSoort; leeg?: "plek" | "eigen" };

async function omgekeerdH(b: HBord, l: Lesgids, v: OmgekeerdH) {
  const onbekend = v.delen[0] === null ? 0 : 1;
  const [p, q, eind] = v.delen;
  const antwoord = v.op === "+" ? eind - (p ?? q ?? 0) : (p ?? 0) - eind;
  const kleur = onbekend === 0 ? BLAUW : MINT;
  const getallen = [...new Set(v.delen.filter((x): x is number => x !== null))].sort((x, y) => x - y);
  const somPlek = [0, 2, 4];
  const leeg = v.leeg ?? "eigen";

  b.nieuw(v.zinnen, { stippelVoor: v.zinnen.length - 1 });
  /* Wat je nu ziet: het eind van het verhaal (of het begin als dat bekend is). */
  if (onbekend === 0) b.zetPlaatjes(v.soort, eind, 0, leeg);
  else b.zetPlaatjes(v.soort, p ?? 0, 0, leeg);
  await vertelH(b, l);
  b.zet({ som: [{ t: "leeg" }, { t: "leeg", smal: true }, { t: "leeg" }, { t: "teken", s: "=" }, { t: "leeg" }] });

  await l.zeg("Dit verhaal is een beetje anders.", "Denk je dat je het zelf kunt?");
  const zelf = await l.kies(["Ja", "Nee"]);
  let gebouwd = false;
  if (zelf === "Ja") {
    await l.zeg("Mooi.", "Welke som past bij het verhaal?");
    b.opgave();
    const k = await kiesH(b, l, b.zonderAanwijzen ? v.somKeuzes : schud(v.somKeuzes), { som: true, wijsSleutel: "sommen", wijs: ["Tik op de som die past."], goed: v.goedeSom });
    if (k === v.goedeSom) {
      b.zet({
        som: [
          p === null ? { t: "vraag", kleur } : { t: "getal", n: p },
          { t: "teken", s: v.op },
          q === null ? { t: "vraag", kleur } : { t: "getal", n: q },
          { t: "teken", s: "=" },
          { t: "getal", n: eind },
        ],
        onbekendKleur: kleur,
      });
      await l.zeg("Precies.");
      gebouwd = true;
    } else if (k === null) await l.zeg("Geen zorgen.", "We doen het samen stap voor stap.");
    else {
      b.fout();
      await l.zeg(`${String(k).replace(/(\d+)/g, "{$1}")}?`, "Niet helemaal.", "Zullen we het samen stap voor stap doen?");
    }
  } else {
    await l.zeg("Zulke sommen zijn in het begin lastig.", "We doen het samen stap voor stap.");
  }

  if (!gebouwd) {
    /* Erbij of eraf; niet goed = de zin licht op en een kleinere vraag. */
    b.opgave();
    await l.zeg("Eerst: komt er iets bij, of gaat er iets af?");
    const k = await erbijErafH(b, l, v.op);
    if (k === (v.op === "+" ? "Erbij" : "Eraf")) {
      await l.zeg("Precies.", v.waarom);
    } else {
      if (k !== null) b.fout();
      b.zet({ groeneZin: v.veranderZin });
      await l.zeg(...v.groterKleiner.vraag);
      const k2 = await l.kies(v.groterKleiner.opties);
      await l.zeg(k2 === v.groterKleiner.opties[0] ? "Precies." : "Kijk naar de groene zin.", ...v.groterKleiner.goed);
      b.zet({ groeneZin: null });
    }
    b.somDeel(1, { t: "teken", s: v.op });

    /* Het begin, de verandering en het eind, één voor één. "?" = dat weten we nog niet. */
    for (let j = 0; j < 3; j++) {
      b.zet({ somActief: somPlek[j] });
      await l.zeg(j === 0 ? "Denk hier goed over na." : "", v.vragen[j]);
      const goed = v.delen[j];
      b.opgave();
      for (let poging = 1; ; poging++) {
        const keuze = await kiesH(b, l, [...getallen, "?"], {
          weetNiet: false,
          goed: goed ?? "?",
          wijsSleutel: "nognietweten",
          wijs: ["Weten we het nog niet?", "Tik dan op het vraagteken."],
        });
        const isGoed = goed === null ? keuze === "?" : keuze === goed;
        if (isGoed) {
          if (goed === null) {
            b.somDeel(somPlek[j], { t: "vraag", kleur });
            b.zet({ onbekendKleur: kleur, groeneZin: null });
            await l.zeg("Goed.", "Dat weten we nog niet.", "Daarom zetten we een vraagteken.");
          } else {
            b.somDeel(somPlek[j], { t: "getal", n: goed });
            await l.zeg(`Precies, {${goed}}.`);
          }
          break;
        }
        if (goed === null && poging === 1 && typeof keuze === "number") {
          /* Een getal uit het verhaal op de plek van het onbekende. */
          b.fout();
          b.zet({ groeneZin: v.veranderZin });
          await l.zeg(`{${keuze}}?`, v.betekenis[keuze] ?? "Dat getal hoort ergens anders.", "Luister naar deze zin.", voorleeszin(v.zinnen[v.veranderZin]));
          continue;
        }
        if (goed === null) {
          b.somDeel(somPlek[j], { t: "vraag", kleur });
          b.zet({ onbekendKleur: kleur, groeneZin: null });
          await l.zeg("Dat getal staat niet in het verhaal.", "Dat weten we dus nog niet.", "Daarom zetten we een vraagteken.");
        } else {
          b.somDeel(somPlek[j], { t: "getal", n: goed });
          await l.zeg("Luister nog eens naar het verhaal.", v.betekenis[goed]);
        }
        break;
      }
    }
    b.zet({ somActief: null });
    await l.zeg("We hebben de som gebouwd.");
  }

  /* Rekenen. */
  b.zet({ somActief: somPlek[onbekend] });
  await l.zeg(v.rekenVraag);
  b.opgave();
  const keuzes = keuzesMet(antwoord, ...getallen);
  const x = await kiesGetalH(b, l, keuzes, [], antwoord);
  const zetAntwoord = () => {
    b.somDeel(somPlek[onbekend], { t: "getal", n: antwoord });
    b.zet({ somActief: null });
  };
  if (x === antwoord) {
    b.goed();
    zetAntwoord();
    await l.zeg(v.antwoordZin, "De som ziet er goed uit.", "Maar we controleren hem even.");
  } else {
    /* Met de voorwerpen terugrekenen. */
    if (x !== null) b.fout();
    await l.zeg(x === null ? "Geen zorgen." : "Hm.", "We kijken samen.");
    if (onbekend === 0) {
      b.zetPlaatjes(v.soort, eind, 0, leeg);
      await l.zeg(`Dit zijn alle {${eind}} ${v.ding}.`, `Haal de {${q}} weg die erbij kwamen.`);
      await naspelenH(b, l, q ?? 0, "weg");
      await l.zeg("Zoveel waren er in het begin.", `Hoeveel ${v.ding} zijn het?`);
      b.opgaven--;
      await vraagAntwoordH(b, l, { antwoord, keuzes, telTip: `Tel de ${v.ding} die er nog zijn.`, antwoordZin: `Het zijn er {${antwoord}}.`, telOp: "aan" });
    } else {
      b.zetPlaatjes(v.soort, p ?? 0, 0, leeg);
      await l.zeg(`Kijk, {${p}} ${v.ding}.`, `Doe ze uit tot er nog {${eind}} branden.`);
      await naspelenH(b, l, antwoord, "weg");
      await l.zeg(`Nu branden er nog {${eind}}.`, "Hoeveel heb je er uitgedaan?");
      b.opgaven--;
      await vraagAntwoordH(b, l, { antwoord, keuzes, telTip: `Tel de ${v.ding} die uit zijn.`, antwoordZin: `Het zijn er {${antwoord}}.`, telOp: "uit" });
    }
    zetAntwoord();
    await l.zeg(`Dus het getal is {${antwoord}}.`, "Nu controleren we de som.");
  }

  /* De controle: het verhaal vooruit naspelen. */
  if (onbekend === 0) {
    b.zetPlaatjes(v.soort, antwoord, q ?? 0, leeg);
    await l.zeg(`In het begin waren er {${antwoord}} ${v.ding}.`, `Er kwamen er {${q}} bij.`, "Kun je die er nu bij doen?");
    await naspelenH(b, l, q ?? 0, "erbij");
    b.goed();
    await l.zeg("Kijk eens.", `Er zijn nu samen {${eind}} ${v.ding}.`);
  } else {
    b.zetPlaatjes(v.soort, p ?? 0, 0, leeg);
    await l.zeg(`Er brandden {${p}} ${v.ding}.`, `Er gingen er {${antwoord}} uit.`, "Kun je die nu uitdoen?");
    await naspelenH(b, l, antwoord, "weg");
    b.goed();
    await l.zeg("Kijk eens.", `Er branden nog {${eind}} ${v.ding}.`);
  }
  await verderH(b, l);
}

/* ---------- kaarttekeningen (244 × 190) ---------- */

function KaartVoorwerp({ soort, x, y, aan = true }: { soort: HoloSoort; x: number; y: number; aan?: boolean }) {
  const k = aan ? 1 : 0.35;
  switch (soort) {
    case "lantaarn":
      return (
        <g transform={`translate(${x} ${y})`} opacity={aan ? 1 : 0.45}>
          <path d="M-8 -16 a8 8 0 0 1 16 0" fill="none" stroke="#ffe3a0" strokeWidth="2" />
          <rect x="-11" y="-14" width="22" height="30" rx="5" fill={aan ? "#ffd56a" : "#2c3c64"} stroke="#c98a2e" strokeWidth="2" />
        </g>
      );
    case "bloem":
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M0 4 V20" stroke="#5fd08a" strokeWidth="3" />
          {[0, 72, 144, 216, 288].map((h) => (
            <circle key={h} cx={9 * Math.sin((h * Math.PI) / 180)} cy={-6 - 9 * Math.cos((h * Math.PI) / 180)} r="7" fill="#ef6fb2" />
          ))}
          <circle cx="0" cy="-6" r="5" fill="#ffe36e" />
        </g>
      );
    default:
      return (
        <g transform={`translate(${x} ${y})`} opacity={k}>
          <ellipse cx="-8" cy="-8" rx="9" ry="5" fill="rgba(225,250,255,0.6)" transform="rotate(-30 -8 -8)" />
          <ellipse cx="8" cy="-8" rx="9" ry="5" fill="rgba(225,250,255,0.6)" transform="rotate(30 8 -8)" />
          <ellipse cx="0" cy="4" rx="8" ry="11" fill="#e6ff7a" />
          <circle cx="0" cy="-9" r="5" fill="#4b5a33" />
        </g>
      );
  }
}

function KaartRij({ soort, aantal, uit = 0, y }: { soort: HoloSoort; aantal: number; uit?: number; y: number }) {
  return (
    <>
      {Array.from({ length: aantal }, (_, i) => (
        <KaartVoorwerp key={i} soort={soort} x={42 + i * 40} y={y} aan={i < aantal - uit} />
      ))}
    </>
  );
}

function KaartSom({ tekst }: { tekst: string }) {
  return (
    <text x="122" y="168" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="800" style={{ fontFamily: "var(--font-les), system-ui, sans-serif" }}>
      {tekst}
    </text>
  );
}

function KaartToetsH() {
  return (
    <>
      <KaartRij soort="lantaarn" aantal={5} uit={2} y={46} />
      <KaartRij soort="bloem" aantal={5} y={110} />
    </>
  );
}
function KaartKleinH() {
  return (
    <>
      <KaartRij soort="vuurvlieg" aantal={5} uit={2} y={70} />
      <KaartSom tekst="7 − 2 = 5" />
    </>
  );
}
function KaartGrootH() {
  return (
    <>
      <KaartRij soort="lantaarn" aantal={5} uit={3} y={70} />
      <KaartSom tekst="17 − 9 = 8" />
    </>
  );
}
function KaartVerstoptH() {
  return (
    <>
      <KaartRij soort="bloem" aantal={5} y={70} />
      <KaartSom tekst="? + 5 = 9" />
    </>
  );
}

/* ---------- de lessen ---------- */

const instaptoetsHolo: Lesdraaiboek = {
  id: "verhaal-instaptoets",
  titel: "Instaptoets: verhaaltjessommen",
  synthesis: "Word Problems · Assessment",
  kaarttekening: KaartToetsH,

  async speel(l) {
    const af = await toetsH(l, {
      uitA: 17,
      uitN: 9,
      uitKeuzes: [7, 8, 9, 17, 25, 26],
      plantA: 7,
      plantEind: 15,
      sommen: ["7 + 15 = ?", "7 − ? = 15"],
      plantKeuzes: [7, 8, 9, 14, 15, 22],
    });
    if (!af) return;
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je kunt verhaaltjessommen oplossen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const kleineVerhalenHolo: Lesdraaiboek = {
  id: "verhaal-kleine-verhalen",
  titel: "Kleine verhaaltjes",
  synthesis: "Word Problems · Small Problems",
  kaarttekening: KaartKleinH,

  async speel(l) {
    const b = new HBord(l);

    /* 1. Vuurvliegjes: 7 − 2. Eerst: heb je hulp nodig? */
    const v1 = vuurvliegWeg(7, 2, [4, 5, 6, 9]);
    await l.zeg("We gaan verhaaltjessommen maken.", "Luister goed.");
    await beginH(b, l, v1);
    await l.zeg("Denk je dat je hulp nodig hebt bij deze?");
    const hulp = await l.kies(["Ja", "Nee"]);
    if (hulp === "Nee") {
      await meteenH(b, l, v1, ["Uitstekend.", "Vertel eens."]);
    } else {
      await l.zeg("Geen probleem.", "We kijken stap voor stap naar het verhaal.", "Dan snappen we wat er gevraagd wordt.");
      await pluisUitH(b, l, v1);
    }
    await verderH(b, l);

    /* 2. Bloemen: 5 + 3, en daarna omwisselen. */
    const v2 = bloemenOpen(5, 3, [2, 7, 8, 9]);
    await beginH(b, l, v2);
    await l.zeg("Denk je dat je het antwoord al weet?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") await meteenH(b, l, v2, ["Laat maar zien."]);
    else {
      await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
      await pluisUitH(b, l, v2);
    }
    b.opgave();
    await l.zeg("Je deed dus {5} plus {3}.", "Wissel de getallen nu eens om.", "Krijg je dan hetzelfde antwoord?");
    const om = await l.kies(["Ja", "Nee"]);
    b.zet({ som: somVol(3, "+", 5) });
    if (om === "Ja") {
      b.goed();
      await l.zeg("Natuurlijk.", "Bij plussen mag je de getallen wisselen.", "Het antwoord blijft {8}.");
    } else await l.zeg("Kijk maar.", "{3} + {5} is ook {8}.", "Bij plussen mag je de getallen wisselen.");
    await verderH(b, l);

    /* 3. Zelf een verhaal maken: lantaarntjes uitdoen. */
    b.nieuw([]);
    b.zetPlaatjes("lantaarn", 10, 0);
    b.opgave();
    await l.zeg("Nu bepaal jij het verhaal.", "Laat een paar lantaarntjes uitgaan.", "Tik op een lantaarntje om het uit te doen.");
    const uit = await zelfKiezenH(b, l, "weg", 9);
    await l.zeg("Goed zo.", "Ik lees jouw verhaal voor.");
    const v3 = lantaarnsUit(l, 10, uit);
    await beginH(b, l, v3);
    await l.zeg("Wat denk je?", "Kun je deze meteen oplossen?");
    const meteen = await l.kies(["Ja", "Nee"]);
    if (meteen === "Ja") {
      await l.zeg("Mooi.", "Welke som past bij het verhaal?");
      await somKiezenH(b, l, {
        a: 10,
        b: uit,
        op: "−",
        foutSommen: [`10 + ${uit}`, `${10 + uit} − 10`],
        ding: "lantaarntjes",
        somUitleg: "Er gaan lantaarntjes uit, dus het is min.",
        naspelen: [uit === 1 ? "Doe het lantaarntje nog eens uit." : `Doe de {${uit}} lantaarntjes nog eens uit.`],
        antwoordVraag: v3.antwoordVraag,
        telTip: v3.telTip,
        antwoordZin: v3.antwoordZin,
        kort: v3.kort,
      });
    } else {
      await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
      await pluisUitH(b, l, v3);
    }
    await verderH(b, l);

    /* 4. Zelf bloemen planten; de som zelf bouwen. */
    b.nieuw([]);
    b.zetPlaatjes("bloem", 3, 7, "plek");
    b.opgave();
    await l.zeg("We gebruiken nu bloemen.", "Er staan er al {3}.", "Plant er nog een paar bij.", "Tik op een leeg plekje.");
    const plant = await zelfKiezenH(b, l, "erbij", 7);
    await l.zeg("Mooi.", `Je plantte er {${plant}} bij.`, "We maken er een verhaaltje van.");
    const v4zinnen = ["Er staan 3 bloemen in de tuin.", `${Wie(l)} plant er ${plant} bij.`, "Hoeveel bloemen staan er nu in de tuin?"];
    b.nieuw(v4zinnen);
    b.zetPlaatjes("bloem", 3, 7, "plek");
    await vertelH(b, l);
    await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
    await somKiezenH(b, l, {
      a: 3,
      b: plant,
      op: "+",
      foutSommen: [`3 − ${plant}`, `${3 + plant} + ${plant}`],
      ding: "bloemen",
      somUitleg: "Er komen bloemen bij, dus het is plus.",
      naspelen: ["We planten de bloemen.", `Plant er maar {${plant}} bij.`],
      antwoordVraag: "Hoeveel bloemen staan er nu?",
      telTip: "Tel alle bloemen.",
      antwoordZin: `Er staan nu {${3 + plant}} bloemen.`,
      kort: kortPlus("bloem", v4zinnen, 3, plant, "Hoeveel bloemen staan er nu in de tuin?", "Tel alle bloemen.", `Er staan nu {${3 + plant}} bloemen.`, "plek"),
    });
    await verderH(b, l);

    await vulAan(b, l, BANK_10);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je snapt de verhaaltjessommen steeds beter.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const groteVerhalenHolo: Lesdraaiboek = {
  id: "verhaal-grote-verhalen",
  titel: "Grotere verhaaltjes",
  synthesis: "Word Problems · Bigger Problems",
  kaarttekening: KaartGrootH,

  async speel(l) {
    const b = new HBord(l);

    /* 1. Vuurvliegjes: 17 − 9, nog helemaal samen. */
    const v1 = vuurvliegWeg(17, 9, [7, 8, 9, 17]);
    v1.foutUitleg = ["Erbij doen vertelt ons niet hoeveel er nog zijn.", "Zullen we ze terug laten komen?"];
    v1.kleineVraag = {
      zinnen: ["Om vuurvliegjes te laten wegvliegen:", "moet je er dan wat bij doen?", "Of moet je er wat weghalen?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er wat weg.", "Dat is eraf."],
    };
    await beginH(b, l, v1);
    await l.zeg("Deze verhaaltjes zijn wat lastiger.", "Lukt het je alleen?");
    const alleen = await l.kies(["Ja", "Nee"]);
    if (alleen === "Ja") await meteenH(b, l, v1, ["Laat maar zien."]);
    else {
      await l.zeg("Dat is oké.", "Laten we het samen stap voor stap doen.");
      await pluisUitH(b, l, v1, { terugLaten: true });
    }
    await verderH(b, l);

    /* 2. Lantaarntjes: 20 − 12. */
    const v2 = lantaarnsUit(l, 20, 12, 20, [8, 9, 12, 20]);
    await beginH(b, l, v2);
    await l.zeg("Denk je dat je deze al weet?");
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") await meteenH(b, l, v2, ["Laat maar zien."]);
    else {
      await l.zeg("Dat is oké.", "Laten we het samen stap voor stap doen.");
      await pluisUitH(b, l, v2, { terugLaten: true });
    }
    await verderH(b, l);

    /* 3. Zelf bloemen planten; nu meteen: welke som past? */
    b.nieuw([]);
    b.zetPlaatjes("bloem", 7, 13, "plek");
    b.opgave();
    await l.zeg("Nu bepaal jij de som.", "Er staan al {7} bloemen.", "Plant er nog wat bij.", "Tik op de lege plekjes.");
    const plant = await zelfKiezenH(b, l, "erbij", 13);
    const samen = 7 + plant;
    const v3zinnen = ["Er staan 7 bloemen in de tuin.", `${Wie(l)} plant er ${plant} bij.`, "Hoeveel bloemen zijn het nu?"];
    b.nieuw(v3zinnen);
    b.zetPlaatjes("bloem", 7, 13, "plek");
    await vertelH(b, l);
    await l.zeg("Welke som past bij *dit* verhaal?");
    await somKiezenH(b, l, {
      a: 7,
      b: plant,
      op: "+",
      foutSommen: [`7 − ${plant}`, `${samen} − 7`],
      ding: "bloemen",
      somUitleg: "Er komen bloemen bij, dus het is plus.",
      naspelen: ["We planten de nieuwe bloemen.", `Plant er {${plant}} op de lege plekjes.`],
      antwoordVraag: "Hoeveel bloemen zijn het nu?",
      telTip: "Tel alle bloemen nog eens.",
      antwoordZin: `Er zijn nu {${samen}} bloemen.`,
      kort: kortPlus("bloem", v3zinnen, 7, plant, "Hoeveel bloemen zijn het nu?", "Tel alle bloemen.", `Er zijn nu {${samen}} bloemen.`, "plek"),
    });
    await verderH(b, l);

    /* 4. Zelf lichtjes laten wegzweven (Synthesis: munten uitgeven). */
    b.nieuw([]);
    b.zetPlaatjes("lichtje", 16, 0);
    b.opgave();
    await l.zeg("Hier zweven {16} lichtjes.", "Tik op een paar lichtjes om ze weg te laten zweven.");
    const weg = await zelfKiezenH(b, l, "weg", 15);
    const over = 16 - weg;
    const v4zinnen = ["Er zweven 16 lichtjes.", `${Wie(l)} laat er ${weg} wegzweven.`, "Hoeveel lichtjes zijn er nog?"];
    b.nieuw(v4zinnen);
    b.zetPlaatjes("lichtje", 16, 0);
    await vertelH(b, l);
    await l.zeg("Eerst een vraag.", "Welke som past bij het verhaal?");
    const overZin = over === 1 ? "Er is nog {1} lichtje." : `Er zijn nog {${over}} lichtjes.`;
    await somKiezenH(b, l, {
      a: 16,
      b: weg,
      op: "−",
      foutSommen: [`16 + ${weg}`, `${weg} − 16`],
      ding: "lichtjes",
      somUitleg: "Er gaan lichtjes weg, dus het is min.",
      naspelen: [weg === 1 ? "Laat het lichtje nog eens wegzweven." : `Laat de {${weg}} lichtjes nog eens wegzweven.`],
      antwoordVraag: "Hoeveel lichtjes zijn er nog?",
      telTip: "Tel de lichtjes die er nog zijn.",
      antwoordZin: overZin,
      kort: kortMin("lichtje", v4zinnen, 16, weg, "lichtjes", "Hoeveel lichtjes zijn er nog?", "Tel de lichtjes die er nog zijn.", overZin),
    });
    await verderH(b, l);

    await vulAan(b, l, BANK_20);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je kunt deze verhaaltjessommen al goed.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const verstopteGetallenHolo: Lesdraaiboek = {
  id: "verhaal-verstopte-getallen",
  titel: "Verstopte getallen",
  synthesis: "Word Problems · Mixed Problems",
  kaarttekening: KaartVerstoptH,

  async speel(l) {
    const b = new HBord(l);

    /* 1. Bloemen: ? + 5 = 9. */
    await omgekeerdH(b, l, {
      zinnen: ["Er staan _een_ _paar_ _bloemen_ in de tuin.", `${Wie(l)} plant er nog 5 bij.`, "Nu zijn het er samen 9.", "Hoeveel bloemen stonden er eerst?"],
      soort: "bloem",
      leeg: "plek",
      ding: "bloemen",
      delen: [null, 5, 9],
      op: "+",
      veranderZin: 1,
      waarom: "Er komen bloemen bij.",
      groterKleiner: {
        vraag: [`${Wie(l)} plant er bloemen bij.`, "Wordt de tuin groter of kleiner?"],
        opties: ["Groter", "Kleiner"],
        goed: ["De tuin wordt groter.", "Dat is erbij."],
      },
      vragen: ["Hoeveel bloemen stonden er eerst?", `En hoeveel bloemen plant ${wie(l)}?`, "En hoeveel bloemen zijn er samen?"],
      betekenis: { 5: "Er komen {5} bloemen bij.", 9: "Er zijn er samen {9}." },
      onbekendKnop: "?",
      rekenVraag: "Hoeveel plus {5} is {9}?",
      antwoordZin: "Ja, er stonden eerst {4} bloemen.",
      somKeuzes: ["? + 5 = 9", "5 + ? = 9", "? − 5 = 9"],
      goedeSom: "? + 5 = 9",
    });

    /* 2. Lantaarntjes: 20 − ? = 13. */
    await l.zeg("Goed zo.", "We kijken naar een nieuw verhaal.");
    await omgekeerdH(b, l, {
      zinnen: ["Er branden 20 lantaarntjes.", `${Wie(l)} doet er _een_ _paar_ uit.`, "Nu branden er nog 13.", `Hoeveel lantaarntjes deed ${wie(l)} uit?`],
      soort: "lantaarn",
      ding: "lantaarntjes",
      delen: [20, null, 13],
      op: "−",
      veranderZin: 1,
      waarom: "Er gaan lantaarntjes uit.",
      groterKleiner: {
        vraag: ["Er gaan lantaarntjes uit.", "Branden er dan meer of minder?"],
        opties: ["Minder", "Meer"],
        goed: ["Er branden er minder.", "Dat is eraf."],
      },
      vragen: ["Hoeveel lantaarntjes brandden er eerst?", "Hoeveel lantaarntjes gingen uit?", "Hoeveel branden er nog?"],
      betekenis: { 13: "Dat zijn de lantaarntjes die nog branden.", 20: "Zoveel lantaarntjes brandden er eerst." },
      onbekendKnop: "?",
      rekenVraag: "{20} min hoeveel is {13}?",
      antwoordZin: "Precies, er gingen {7} lantaarntjes uit.",
      somKeuzes: ["20 − ? = 13", "? − 20 = 13", "20 + ? = 13"],
      goedeSom: "20 − ? = 13",
    });

    /* 3. Paddenstoelen: ? + 7 = 12 (Synthesis: munten; 7 + ? = 12 telt als niet goed: de som volgt het verhaal). */
    await l.zeg(l.naam ? `Je doet het goed, ${l.naam}.` : "Je doet het goed.", "Nog één verhaal.");
    await omgekeerdH(b, l, {
      zinnen: ["Er gloeien _een_ _paar_ _paddenstoelen_.", "Er gaan er nog 7 gloeien.", "Nu gloeien er 12.", "Hoeveel paddenstoelen gloeiden er eerst?"],
      soort: "paddenstoel",
      ding: "paddenstoelen",
      delen: [null, 7, 12],
      op: "+",
      veranderZin: 1,
      waarom: "Er gaan paddenstoelen gloeien.",
      groterKleiner: {
        vraag: ["Er gaan paddenstoelen gloeien.", "Gloeien er dan meer of minder?"],
        opties: ["Meer", "Minder"],
        goed: ["Er gloeien er meer.", "Dat is erbij."],
      },
      vragen: ["Hoeveel paddenstoelen gloeiden er eerst?", "En hoeveel gaan er gloeien?", "En hoeveel gloeien er nu?"],
      betekenis: { 7: "Zoveel paddenstoelen gaan er gloeien.", 12: "Zoveel gloeien er nu." },
      onbekendKnop: "?",
      rekenVraag: "Hoeveel plus {7} is {12}?",
      antwoordZin: "Ja, er gloeiden eerst {5} paddenstoelen.",
      somKeuzes: ["? + 7 = 12", "7 + ? = 12", "? − 7 = 12"],
      goedeSom: "? + 7 = 12",
    });

    await vulAan(b, l, BANK_VERSTOPT);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je vindt de verstopte getallen al.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const eindtoetsHolo: Lesdraaiboek = {
  id: "verhaal-eindtoets",
  titel: "Eindtoets: verhaaltjessommen",
  synthesis: "Word Problems · Mastery Check",
  kaarttekening: KaartToetsH,

  async speel(l) {
    const af = await toetsH(l, {
      uitA: 14,
      uitN: 8,
      uitKeuzes: [5, 6, 7, 14, 21, 22],
      plantA: 6,
      plantEind: 17,
      sommen: ["6 − ? = 17"],
      plantKeuzes: [6, 10, 11, 12, 17, 23],
    });
    if (!af) return;
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je hebt lastige verhaaltjessommen opgelost.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** De vorige versie (hologram-bloementuin, 27 oktober 2026); blijft staan, maar staat niet meer in de catalogus. */
export const LESSEN_VERHAALTJESSOMMEN_HOLO: Lesdraaiboek[] = [instaptoetsHolo, kleineVerhalenHolo, groteVerhalenHolo, verstopteGetallenHolo, eindtoetsHolo].map(metVasteKnoppen);

/* =====================================================================
 * NABOUW SYNTHESIS (28 oktober 2026, opdracht eigenaar): V1–V5 precies zoals
 * Synthesis "Word Problems", met Nederlandse zinnen van Bliepo en de eigen
 * voorwerpen (vogeltjes op een draad, bloempotten, ballonnen, gloeilampen,
 * munten). Zie SYNTHESIS-ANALYSE/V*-NABOUW.md. Verschillen met de vorige
 * versie hierboven (Holo):
 * - antwoorden kiezen met 9 cijferknoppen (1–9) of 4 / 6 getallen;
 * - 2× fout op het eindantwoord: "laten we even pauze nemen" en de les stopt
 *   (l.stopLes), in een toets begint de eerste les meteen;
 * - na het uitpluizen pijlen om verder te gaan, 3 hints bij de vraagzin;
 * - extra oefenvragen van dezelfde soort NA de stappen van Synthesis, tot 15.
 * ===================================================================== */

const TEGELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Zes antwoordknoppen rond het goede antwoord (de toetsen). */
/* Sinds de vergelijking (28 okt 2026) gebruiken de toetsen toetsKeuzes; deze blijft staan (niets weghalen). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function zesKeuzes(antwoord: number, ...extra: number[]): number[] {
  const set = new Set<number>([antwoord]);
  for (const x of [...extra, antwoord + 1, antwoord - 1, antwoord + 2, antwoord - 2, antwoord + 10, antwoord - 10, antwoord + 3]) {
    if (set.size >= 6) break;
    if (x >= 0 && x <= 30) set.add(x);
  }
  for (let n = 0; set.size < 6; n++) set.add(n);
  return [...set].sort((p, q) => p - q);
}

/** Het kind speelt het verhaal na en Bliepo telt hardop mee ("Eén." "Twee."). */
/** Het geluidje bij het naspelen (eigen klank, zelfde moment als Synthesis). */
function naspeelGeluid(soort: HoloSoort) {
  if (soort === "vogel" || soort === "vuurvlieg" || soort === "lichtje") return "vlieg" as const;
  if (soort === "pot" || soort === "bloem") return "groei" as const;
  if (soort === "ballon") return "knal" as const;
  if (soort === "munt") return "munt" as const;
  return "lamp" as const;
}

/**
 * `o.alleen`: alleen deze voorwerpen mogen (Synthesis Mixed Problems: alleen de
 * bloemen die erbij kwamen); `o.doel`: wat er van een getikt voorwerp wordt
 * (standaard uit of aan; een uitgegeven munt wordt een lege plek).
 */
async function naspelenS(b: HBord, l: Lesgids, aantal: number, modus: "weg" | "erbij", tel = true, o: { alleen?: number[]; doel?: Plekstaat } = {}) {
  const geteld: number[] = [];
  const naar: Plekstaat = o.doel ?? (modus === "weg" ? "uit" : "aan");
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], tel: null, tikAlleen: o.alleen ?? null });
  while (geteld.length < aantal) {
    const g = await l.wachtOpVlak<{ soort: string; i: number }>("plaatje");
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    if (o.alleen && !o.alleen.includes(g.i)) continue;
    geteld.push(g.i);
    speelLesgeluid(naspeelGeluid(pl.soort));
    b.zet({ plaatjes: { ...pl, plekken: pl.plekken.map((st, j) => (j === g.i ? naar : st)) }, geteld: [...geteld] });
    if (tel) void l.zeg(`{${geteld.length}}`).catch(() => {});
  }
  b.zet({ tik: null, tikAlleen: null });
  await l.wacht(800);
  /* De nummertjes waren voor het tellen tijdens het tikken; daarna weg, anders staan ze op lege plekken bij "hoeveel zijn er nog?". */
  b.zet({ geteld: [] });
}

/** Lampen die uit zijn, worden na een tel een lege omtrek (Synthesis: eerst grijs, dan alleen het lijntje). */
async function omtrekS(b: HBord, l: Lesgids) {
  const pl = b.p.plaatjes;
  if (!pl || pl.soort !== "lamp" || !pl.plekken.includes("uit")) return;
  await l.wacht(500);
  b.zetPlekken((b.p.plaatjes ?? pl).plekken.map((st) => (st === "uit" ? "leeg" : st)));
}

/**
 * Het kind maakt zelf een verhaal (Synthesis Bigger Problems): het tikt zoveel
 * voorwerpen als het wil; is het `stilNa` ms stil na een tik, dan gaat Bliepo
 * vanzelf verder. Geeft de getikte plekken.
 */
async function zelfKiezenS(b: HBord, l: Lesgids, modus: "weg" | "erbij", max: number, naar: Plekstaat, stilNa: number): Promise<number[]> {
  const geteld: number[] = [];
  b.zet({ tik: "plaatje", tikPlaatje: modus, geteld: [], tel: null });
  while (geteld.length < max) {
    const tik = l.wachtOpVlak<{ soort: string; i: number }>("plaatje");
    const g = geteld.length === 0 ? await tik : await Promise.race([tik, l.wacht(stilNa).then(() => null)]);
    if (!g) break;
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== (modus === "weg" ? "aan" : "uit")) continue;
    geteld.push(g.i);
    speelLesgeluid(naspeelGeluid(pl.soort));
    b.zetPlekken(pl.plekken.map((st, j) => (j === g.i ? naar : st)));
  }
  b.zet({ tik: null });
  await l.wacht(400);
  return geteld;
}

/** Het kind doet voorwerpen uit tot er nog `tot` aan zijn; Bliepo telt AF hoeveel er nog aan zijn (Synthesis Mixed Problems). */
async function uitTotS(b: HBord, l: Lesgids, tot: number) {
  b.zet({ tik: "plaatje", tikPlaatje: "weg", geteld: [], tel: null });
  for (;;) {
    const pl0 = b.p.plaatjes;
    const aan = pl0 ? pl0.plekken.filter((st) => st === "aan").length : 0;
    if (!pl0 || aan <= tot) break;
    const g = await l.wachtOpVlak<{ soort: string; i: number }>("plaatje");
    const pl = b.p.plaatjes;
    if (!pl || pl.plekken[g.i] !== "aan") continue;
    speelLesgeluid(naspeelGeluid(pl.soort));
    b.zetPlekken(pl.plekken.map((st, j) => (j === g.i ? "uit" : st)));
    void l.zeg(`{${aan - 1}}`).catch(() => {});
  }
  b.zet({ tik: null });
  await l.wacht(700);
  await omtrekS(b, l);
}

/**
 * Voorlezen met de voorwerpen erbij zoals Synthesis Bigger Problems: "zweef" =
 * ballonnen zweven van onderen omhoog; "aan" = de lampen gaan tijdens het
 * voorlezen één voor één aan.
 */
async function vertelS(b: HBord, l: Lesgids, komt?: "zweef" | "aan") {
  const pl = b.p.plaatjes;
  if (komt === "zweef" && pl) {
    b.zweefTeller++;
    b.zet({ plaatjes: { ...pl, zweefNr: b.zweefTeller } });
  }
  let klaar: Promise<void> = Promise.resolve();
  if (komt === "aan" && pl) {
    const doel = [...pl.plekken];
    b.zetPlekken(doel.map((st) => (st === "aan" ? "uit" : st)));
    klaar = (async () => {
      await l.wacht(400);
      for (let i = 0; i < doel.length; i++) {
        if (doel[i] !== "aan") continue;
        const nu = b.p.plaatjes;
        if (!nu) return;
        b.zetPlekken(nu.plekken.map((st, j) => (j === i ? "aan" : st)));
        await l.wacht(140);
      }
    })().catch(() => {});
  }
  await vertelH(b, l);
  await klaar;
}

/** Vier antwoordknoppen (2 × 2) zoals Synthesis: het antwoord, één meer, en de getallen uit het verhaal. */
function vierS(antwoord: number, ...extra: number[]): number[] {
  const uit: number[] = [];
  for (const x of [antwoord, antwoord + 1, ...extra, antwoord - 1, antwoord + 2, antwoord + 3]) {
    if (uit.length >= 4) break;
    if (x >= 0 && x <= 40 && !uit.includes(x)) uit.push(x);
  }
  return uit;
}

/** Een som als tekst voor Bliepo: "{7} + ? = {15}". */
const somTekst = (som: string) => som.replace(/(\d+)/g, "{$1}");

/** Antwoord kiezen tot het goed is (een kleine tussenstap; fout = grijs, "weet ik niet" = Bliepo zegt het). */
async function kiesTotGoed(b: HBord, l: Lesgids, antwoord: number, tip: string) {
  let uit: number[] = [];
  for (;;) {
    /* Zonder "Weet ik niet": Synthesis heeft hem hier niet; bij een fout volgt de tip (zoals bij 1× en 2× fout). */
    const x = await kiesH(b, l, TEGELS, { uit, goed: antwoord, tegels: true, weetNiet: false });
    if (x === antwoord) {
      b.goed();
      return;
    }
    if (x === null) {
      await l.zeg("Geen probleem.", `Het is {${antwoord}}.`);
      return;
    }
    b.fout();
    uit = [...uit, Number(x)];
    await l.zeg(`{${x}}? Niet helemaal.`, tip);
  }
}

/**
 * Het eindantwoord, zoals Synthesis: 1× fout = "niet helemaal" en een tip,
 * 2× fout = "laten we even pauze nemen" en de les stopt. `terugBijWeetNiet`:
 * "weet ik niet" geeft "weetniet" terug (dan volgt het uitpluizen); anders telt
 * het als een poging.
 */
async function eindAntwoordS(
  b: HBord,
  l: Lesgids,
  o: { antwoord: number; keuzes?: number[]; weetNiet: boolean; terugBijWeetNiet?: boolean; tip: string; ding: string; groot?: boolean; vraag?: string },
): Promise<"goed" | "weetniet"> {
  const opties = o.keuzes ?? TEGELS;
  let uit: number[] = [];
  for (let poging = 1; ; poging++) {
    const x = await kiesH(b, l, opties, { uit, goed: o.antwoord, weetNiet: o.weetNiet, tegels: !o.keuzes });
    if (x === o.antwoord) {
      b.goed();
      return "goed";
    }
    if (x === null && o.terugBijWeetNiet) return "weetniet";
    if (poging === 1 && o.groot) {
      /* Synthesis Bigger Problems: een hint "een paar minder/meer" (of "dat is oké"), dan de pijl, dan "tel nog eens". */
      if (x === null) await l.zeg("Dat is oké.");
      else {
        b.fout();
        const n = Number(x);
        await l.zeg(`{${n}} ${n === 1 ? enkelvoud(o.ding) : o.ding}?`, n > o.antwoord ? "Het zijn er een paar minder." : "Het zijn er een paar meer.");
      }
      await verderH(b, l);
      await l.zeg(o.tip, ...(o.vraag ? [o.vraag] : []));
      continue;
    }
    if (poging === 1) {
      if (x === null) await l.zeg("Geen probleem.", o.tip);
      else {
        b.fout();
        /* Synthesis laat de foute tegel staan. */
        uit = b.zonderAanwijzen ? [] : [Number(x)];
        await l.zeg(`{${x}} ${x === 1 ? enkelvoud(o.ding) : o.ding}? Niet helemaal.`);
        await verderH(b, l);
        await l.zeg(o.tip);
      }
      continue;
    }
    if (x !== null) b.fout();
    await l.zeg(x === null ? "Dat is niet erg." : `{${x}} ${x === 1 ? enkelvoud(o.ding) : o.ding}? Dat is nog niet het getal dat ik tel.`, "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await verderH(b, l);
    return l.stopLes();
  }
}

/* ---------- de verhalen die we uitpluizen ---------- */

type SPluis = {
  zinnen: string[];
  soort: HoloSoort;
  leegVorm?: "plek" | "eigen";
  rij?: number;
  aan: number;
  leeg: number;
  a: number;
  b: number;
  op: "+" | "−";
  /** De zin met de woorden die zeggen of het erbij of eraf is. */
  signaalZin: number;
  watZoeken: string;
  signaalTip: string;
  signaalUitleg: string;
  foutUitleg: string[];
  kleineVraag: { zinnen: string[]; erbij: string; eraf: string; goed: string[] };
  beginVraag: string;
  beginAntwoord: string[];
  tweedeVraag: string;
  tweedeVraag2: string;
  tweedeAntwoord: string[];
  naspelen: string[];
  antwoordVraag: string;
  ding: string;
  telTip: string;
  antwoordZin: string;
  /** Vier antwoordknoppen (grotere verhaaltjes); zonder: de cijferknoppen 1–9. */
  keuzes?: number[];
  /** Wat Bliepo zegt als het kind het getal van de verandering als antwoord kiest. */
  redenB?: string;
  /** De opdracht bij het signaalwoord, in de woorden van het verhaal (Synthesis). Zonder: "Tik op het woord dat zegt dat dit een minsom is." */
  signaalOpdracht?: string;
  /** Welke voorwerpen het kind zelf koos (zelfgemaakt verhaal): Bliepo speelt na met precies die. */
  gekozenPlekken?: number[];
  /** Grotere verhaaltjes (Synthesis): de vraag naar het tweede getal, met het signaalwoord uit het verhaal in het groen. */
  tweedeVraagGroot?: string;
  /** Grotere verhaaltjes: "weet ik niet" bij erbij of eraf = meteen naspelen, vóór de som (Synthesis Bigger Problems). */
  naspelenUitleg?: { zinnen: string[]; klaar: string[] };
};

const sMinKlein = (zinnen: string[]) => zinnen;

function vogeltjesWeg(a: number, w: number): SPluis {
  const c = a - w;
  return {
    zinnen: sMinKlein([`Er zitten ${a} vogeltjes op een draad.`, `Er [vliegen] er ${w} [weg].`, "Hoeveel vogeltjes zitten er nog op de draad?"]),
    soort: "vogel",
    rij: a,
    aan: a,
    leeg: 0,
    a,
    b: w,
    op: "−",
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel vogeltjes er nog zitten.",
    /* Het signaal is twee woorden ("vliegen … weg"), dus meervoud, zoals Synthesis ("Tap on the words"). */
    signaalTip: "Welke woorden zeggen dat er vogeltjes weggaan?",
    signaalOpdracht: "Tik op de woorden die zeggen dat dit een minsom is.",
    signaalUitleg: "Er vliegen vogeltjes weg. Dat is een minsom.",
    foutUitleg: ["Maar er komen geen vogeltjes bij."],
    kleineVraag: {
      zinnen: ["Willen we dat er vogeltjes wegvliegen?", "Moeten er dan vogeltjes bij, of eraf?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er vogeltjes weg.", "Dat is een minsom."],
    },
    beginVraag: "Hoeveel vogeltjes zaten er eerst op de draad?",
    beginAntwoord: [`Er zaten eerst {${a}} vogeltjes op de draad.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeVraag2: "Welk getal zegt hoeveel vogeltjes er wegvliegen?",
    tweedeAntwoord: [`Er vliegen {${w}} vogeltjes weg.`, `Dus halen we {${w}} eraf.`],
    naspelen: ["Je weet het antwoord vast al.", `Laat de {${w}} vogeltjes maar wegvliegen.`, "Tik op de vogeltjes."],
    antwoordVraag: "Hoeveel vogeltjes zijn er nog?",
    ding: "vogeltjes",
    telTip: "Probeer de vogeltjes nog eens te tellen.",
    antwoordZin: `Er zijn nog {${c}} vogeltjes.`,
  };
}

/** Bloemen die erbij komen: K2 (5 + 3), K4 (3 + 4) en G3 (7 + 6). */
function bloemenBij(o: { a: number; n: number; leeg: number; zin2: string; vraag: string; keuzes?: number[] }): SPluis {
  const { a, n } = o;
  return {
    zinnen: [`Er staan ${a} bloemen in een tuin.`, o.zin2, o.vraag],
    soort: "pot",
    aan: a,
    leeg: o.leeg,
    a,
    b: n,
    op: "+",
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel bloemen het samen zijn.",
    signaalTip: "Welk woord zegt dat er bloemen bijkomen?",
    signaalUitleg: "Het woord *bij* zegt dat er bloemen bijkomen. Dat is een plussom.",
    foutUitleg: ["Bloemen weghalen helpt ons niet.", "We willen weten hoeveel het er samen zijn."],
    kleineVraag: {
      zinnen: ["Willen we dat er meer bloemen groeien?", "Moeten er dan bloemen bij, of eraf?"],
      erbij: "Erbij planten",
      eraf: "Weghalen",
      goed: ["We planten er bloemen bij.", "Dat is een plussom."],
    },
    beginVraag: "Hoeveel bloemen stonden er eerst in de tuin?",
    beginAntwoord: [`Er stonden eerst {${a}} bloemen.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal doen we erbij?",
    tweedeVraag2: "Welk getal zegt hoeveel bloemen erbij komen?",
    tweedeAntwoord: [`Er komen {${n}} bloemen bij.`, `Dus doen we {${n}} erbij.`],
    naspelen: ["Je bent klaar met de som.", `Laat de {${n}} extra bloemen maar groeien.`, "Tik op de lege potjes."],
    antwoordVraag: "Hoeveel bloemen zijn het nu?",
    ding: "bloemen",
    telTip: "Tel alle bloemen nog eens.",
    antwoordZin: `Het zijn er {${a + n}} samen.`,
    keuzes: o.keuzes,
  };
}

function ballonnenPoppen(l: Lesgids, a: number, k: number): SPluis {
  return {
    zinnen: [`Er zijn ${a} ballonnen.`, `${Wie(l)} laat er ${k} [knappen].`, "Hoeveel ballonnen zijn er nog heel?"],
    soort: "ballon",
    rij: a <= 10 ? a : undefined,
    aan: a,
    leeg: 0,
    a,
    b: k,
    op: "−",
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel ballonnen er nog heel zijn.",
    signaalTip: "Welk woord zegt dat er ballonnen weggaan?",
    signaalUitleg: "Er knappen ballonnen. Dat is een minsom.",
    foutUitleg: ["Maar er komen geen ballonnen bij."],
    kleineVraag: {
      zinnen: ["Willen we dat er ballonnen knappen?", "Moeten er dan ballonnen bij, of eraf?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er ballonnen weg.", "Dat is een minsom."],
    },
    beginVraag: "Hoeveel ballonnen waren er eerst?",
    beginAntwoord: [`Er waren eerst {${a}} ballonnen.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeVraag2: "Welk getal zegt hoeveel ballonnen er knappen?",
    /* Het kind kiest zelf hoeveel (ook 1): enkelvoud en meervoud kloppen. */
    tweedeAntwoord: [k === 1 ? "Er knapt {1} ballon." : `Er knappen {${k}} ballonnen.`, `Dus halen we {${k}} eraf.`],
    naspelen: ["Je weet het antwoord vast al.", k === 1 ? "Laat de ballon maar knappen." : `Laat de {${k}} ballonnen maar knappen.`, k === 1 ? "Tik op een ballon." : "Tik op de ballonnen."],
    antwoordVraag: "Hoeveel ballonnen zijn er nog heel?",
    ding: "ballonnen",
    telTip: "Probeer de ballonnen die heel zijn nog eens te tellen.",
    antwoordZin: a - k === 1 ? "Er is nog {1} ballon heel." : `Er zijn nog {${a - k}} ballonnen heel.`,
  };
}

function ballonnenWeg(a: number, w: number, keuzes: number[]): SPluis {
  return {
    ...ballonnenPoppen({ naam: "", } as Lesgids, a, w),
    zinnen: [`Er zijn ${a} ballonnen op een feestje.`, `Er [vliegen] er ${w} [weg].`, "Hoeveel ballonnen zijn er nog?"],
    watZoeken: "We zoeken hoeveel ballonnen er nog zijn.",
    /* Twee woorden ("vliegen … weg"), dus meervoud (Synthesis: "Which words tell us …"). */
    signaalTip: "Welke woorden zeggen dat er ballonnen weggaan?",
    signaalUitleg: "Er vliegen ballonnen weg. Dat is een minsom.",
    kleineVraag: {
      zinnen: ["Willen we dat er ballonnen wegvliegen?", "Moeten er dan ballonnen bij, of eraf?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er ballonnen weg.", "Dat is een minsom."],
    },
    tweedeVraag2: "Welk getal zegt hoeveel ballonnen er wegvliegen?",
    signaalOpdracht: "Tik op de woorden die zeggen dat er ballonnen wegvliegen.",
    tweedeVraagGroot: "En welk getal zegt hoeveel er [[g:wegvliegen]]?",
    tweedeAntwoord: [`Er vliegen {${w}} ballonnen weg.`, `Dus halen we {${w}} eraf.`],
    naspelen: ["De som staat klaar.", `Tik op de {${w}} ballonnen die wegvliegen.`],
    antwoordVraag: "Hoeveel ballonnen zijn er nog?",
    antwoordZin: `Er zijn nog {${a - w}} ballonnen.`,
    telTip: "Probeer de ballonnen die er nog zijn eens te tellen.",
    keuzes,
    redenB: `{${w}}? Zoveel ballonnen vliegen weg. We zoeken hoeveel er blijven.`,
    naspelenUitleg: {
      zinnen: ["Hm, als ballonnen wegvliegen, komen er geen bij.", "Er gaan er een paar weg.", `Tik op {${w}} ballonnen om ze te laten knappen.`],
      klaar: ["Zie je?", `Je haalde er {${w}} weg.`, "Dat is een minsom."],
    },
  };
}

function lampenUit(a: number, w: number, keuzes: number[], wie: string): SPluis {
  return {
    zinnen: [`Er branden ${a} lampen.`, `${wie} doe${wie === "Ik" ? "" : "t"} er ${w} [uit].`, "Hoeveel lampen branden er nog?"],
    soort: "lamp",
    aan: a,
    leeg: 20 - a,
    a,
    b: w,
    op: "−",
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel lampen er nog branden.",
    signaalTip: "Welk woord zegt dat er lampen uitgaan?",
    signaalUitleg: "Er gaan lampen uit. Dat is een minsom.",
    foutUitleg: ["Maar er gaan geen lampen aan."],
    kleineVraag: {
      zinnen: ["Willen we dat er lampen uitgaan?", "Moeten er dan lampen bij, of eraf?"],
      erbij: "Erbij doen",
      eraf: "Weghalen",
      goed: ["We halen er lampen weg.", "Dat is een minsom."],
    },
    beginVraag: "Hoeveel lampen brandden er eerst?",
    beginAntwoord: [`Eerst brandden er {${a}} lampen.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal halen we eraf?",
    tweedeVraag2: "Welk getal zegt hoeveel lampen er uitgaan?",
    signaalOpdracht: "Tik op het woord dat zegt dat er lampen uitgaan.",
    tweedeVraagGroot: "En welk getal zegt hoeveel er [[g:uitgaan]]?",
    tweedeAntwoord: [`Er gaan {${w}} lampen uit.`, `Dus halen we {${w}} eraf.`],
    naspelen: ["De som staat klaar.", `Doe de {${w}} lampen maar uit.`, "Tik op de lampen."],
    antwoordVraag: "Hoeveel lampen branden er nog?",
    ding: "lampen",
    telTip: "Tel de lampen die nog branden.",
    antwoordZin: `Er branden nog {${a - w}} lampen.`,
    keuzes,
    redenB: `{${w}}? Zoveel lampen gaan uit. We zoeken hoeveel er nog branden.`,
    naspelenUitleg: {
      zinnen: ["Hm, als je lampen uitdoet, komen er geen bij.", "Er gaan er een paar uit.", `Tik op {${w}} lampen om ze uit te doen.`],
      klaar: ["Zie je?", `Je deed er {${w}} uit.`, "Dat is een minsom."],
    },
  };
}

function muntenUit(l: Lesgids, a: number, w: number, keuzes: number[]): SPluis {
  return {
    zinnen: [`Er zijn ${a} munten.`, `${Wie(l)} geeft er ${w} [uit].`, "Hoeveel munten zijn er nog?"],
    soort: "munt",
    aan: a,
    leeg: 0,
    a,
    b: w,
    op: "−",
    signaalZin: 1,
    watZoeken: "We zoeken hoeveel munten er nog zijn. Als je munten uitgeeft, heb je er minder.",
    signaalTip: "Welk woord zegt dat er munten weggaan?",
    signaalUitleg: "Munten uitgeven. Dat is een minsom.",
    foutUitleg: ["Maar er komen geen munten bij."],
    kleineVraag: { zinnen: [], erbij: "Erbij", eraf: "Weghalen", goed: [] },
    beginVraag: "Hoeveel munten waren er eerst?",
    beginAntwoord: [`Er waren eerst {${a}} munten.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal zegt hoeveel er zijn uitgegeven?",
    tweedeVraag2: "Welk getal zegt hoeveel munten er zijn uitgegeven?",
    tweedeAntwoord: [w === 1 ? "Er is {1} munt uitgegeven." : `Er zijn {${w}} munten uitgegeven.`, `Dus halen we {${w}} eraf.`],
    naspelen: ["De som staat klaar.", w === 1 ? "Tik op {1} munt om hem uit te geven." : `Tik op {${w}} munten om ze uit te geven.`],
    antwoordVraag: "Hoeveel munten zijn er nog?",
    ding: "munten",
    telTip: "Tel de munten die er nog zijn.",
    antwoordZin: a - w === 1 ? "Er is nog {1} munt." : `Er zijn nog {${a - w}} munten.`,
    keuzes,
    redenB: `{${w}}? Zoveel munten zijn uitgegeven. We zoeken hoeveel er nog zijn.`,
  };
}

const uitkomstS = (v: { a: number; b: number; op: "+" | "−" }) => (v.op === "+" ? v.a + v.b : v.a - v.b);

async function beginS(b: HBord, l: Lesgids, v: SPluis, komt?: "zweef" | "aan") {
  b.nieuw(v.zinnen);
  b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen", { rij: v.rij, bloeit: false });
  /* Grotere verhaaltjes (Synthesis): de voorwerpen komen tijdens het voorlezen binnen; anders gewoon voorlezen. */
  if (komt) await vertelS(b, l, komt);
  else await vertelH(b, l);
}

/** Na een goed antwoord bij bloemen: de nieuwe bloemen staan er, en alle bloemen bloeien. */
async function bloeiNa(b: HBord, l: Lesgids, v: SPluis, laatErbij: boolean) {
  if (v.soort !== "pot") return;
  if (laatErbij) await laatGebeurenH(b, l, v.a, v.a + v.b, v.aan + v.leeg, 220);
  b.bloei(true);
  await l.wacht(500);
}

/**
 * De hele uitpluisroute, stap voor stap, zoals Synthesis (Small en Bigger
 * Problems): getallen, vraagzin (3 hints), erbij of eraf, signaalwoord, de som
 * vakje voor vakje, naspelen, eindantwoord. `kort`: zonder erbij/eraf en zonder
 * signaalwoord (Bigger Problems, munten).
 */
async function pluisUitS(b: HBord, l: Lesgids, v: SPluis, o: { kort?: boolean; groot?: boolean; somBlijft?: boolean } = {}) {
  const antwoord = uitkomstS(v);
  const getallen = getallenIn(v.zinnen);
  const vraagZin = v.zinnen.length - 1;

  /* Grotere verhaaltjes (Synthesis): stond er al een som, dan blijft die onderaan staan tot we de som bouwen. */
  b.zet({ midden: true, som: o.somBlijft ? b.p.som : null, somBijMidden: !!o.somBlijft });
  await l.wacht(400);

  /* 1. De getallen. */
  b.opgave();
  await l.zeg("Tik op alle getallen in het verhaal.");
  const gevonden: string[] = [];
  while (gevonden.length < getallen.length) {
    const g = await wachtTikH(b, l, "getal", ["Getallen schrijven we met cijfers, zoals {2} of {7}.", "Tik op de getallen in het verhaal."], false);
    if (g.soort === "weetniet") {
      b.zet({ omcirkeld: getallen.map((x) => x.sleutel) });
      await l.zeg("Kijk, hier staan de getallen.");
      break;
    }
    const sleutel = g.sleutel as string;
    if (gevonden.includes(sleutel)) continue;
    gevonden.push(sleutel);
    b.zet({ omcirkeld: [...gevonden] });
    speelLesgeluid("goed");
    /* Synthesis zegt tussendoor niets: alleen de ring en het geluidje. */
    if (gevonden.length < getallen.length && !b.zonderAanwijzen) await l.zeg("Je hebt één getal.", "Tik nu op het andere.");
  }
  await l.zeg(`Ja, {${v.a}} en {${v.b}}.`, "Dat is een goed begin.");
  await verderH(b, l);

  /* 2. De vraag: drie hints. */
  b.opgave();
  await l.zeg("Wat moeten we uitzoeken?", "Tik op de zin die de vraag stelt.");
  for (let fout = 0; ; ) {
    const g = await wachtTikH(b, l, "zin", undefined, false);
    if (g.soort === "zin" && g.i === vraagZin) {
      b.zet({ vraagZin, hintVraagteken: false, woordKleur: {} });
      speelLesgeluid("goed");
      await l.zeg("Dat klopt.", v.watZoeken);
      break;
    }
    if (g.soort === "zin" && b.zonderAanwijzen) {
      /* Zoals Synthesis: alleen het aangetikte woord kleurt (tot de pijl); bij Grotere verhaaltjes de woordgroep. Tik naast de woorden: de hele zin. */
      const i = g.i as number;
      const j = g.j as number | undefined;
      b.zet({ woordKleur: o.groot || j === undefined ? woordGroep(v.zinnen[i], i, j) : { [`${i}-${j}`]: "r" } });
      speelLesgeluid("mis");
    } else if (g.soort === "zin") {
      b.zet({ flitsZin: g.i as number });
      b.fout();
      await l.wacht(700);
      b.zet({ flitsZin: null });
    }
    fout++;
    if (g.soort === "weetniet" || fout >= 3) {
      b.zet({ vraagZin, hintVraagteken: false });
      await l.zeg("Kijk, deze zin stelt de vraag.", "Daar staat het vraagteken.", v.watZoeken);
      break;
    }
    await l.zeg("Goed geprobeerd.", fout === 1 ? "Maar die zin stelt geen vraag." : "Maar ook die zin stelt geen vraag.");
    await verderH(b, l);
    if (b.zonderAanwijzen) {
      b.zet({ woordKleur: {} });
      speelLesgeluid("terug");
    }
    if (fout === 1) {
      if (!b.zonderAanwijzen) b.zet({ hintVraagteken: true });
      await l.zeg("Hier is een hint.", "Zoek de zin met het vraagteken.", "Tik dan op die zin.");
    } else {
      await l.zeg("Nog een hint.", "Zoek de zin die begint met *Hoeveel*.", "Tik op die zin.");
    }
  }
  await verderH(b, l);

  /* 3. Erbij of eraf, en het signaalwoord. */
  if (!o.kort) {
    b.opgave();
    await l.zeg("Is dit een plussom of een minsom?", "Komt er iets bij of gaat er iets af?");
    const keuze = await erbijErafH(b, l, v.op);
    if (keuze === (v.op === "+" ? "Erbij" : "Eraf")) {
      await l.zeg("Heel goed.", v.signaalOpdracht ? v.signaalOpdracht : `Tik op het woord dat zegt dat dit een ${v.op === "+" ? "plussom" : "minsom"} is.`);
      for (let fout = 0; ; ) {
        const g = await wachtTikH(b, l, "woord", fout === 0 ? [v.signaalTip] : undefined, false);
        if (g.soort === "woord" && g.signaal) {
          b.zet({ signaalGroen: true, hintZin: null, woordKleur: {} });
          speelLesgeluid("goed");
          await l.zeg("Goed gekozen.", v.signaalUitleg);
          break;
        }
        fout++;
        if (g.soort === "weetniet" || fout >= 2) {
          b.zet({ signaalGroen: true, hintZin: null });
          await l.zeg("Kijk, hier staat het.", v.signaalUitleg);
          break;
        }
        if (b.zonderAanwijzen) {
          /* Zoals Synthesis: het aangetikte woord kleurt groen, na de pijl weer wit; dan een andere vraag. */
          if (g.sleutel) {
            /* Grotere verhaaltjes: de hele woordgroep kleurt (Synthesis: "balloons at a party." groen). */
            const [zi, wj] = String(g.sleutel).split("-").map(Number);
            b.zet({ woordKleur: o.groot ? kleurAlles(woordGroep(v.zinnen[zi], zi, wj), "g") : { [String(g.sleutel)]: "g" } });
          }
          speelLesgeluid("mis");
          /* Grotere verhaaltjes: de hele woordgroep kleurt, dus geen los woord noemen (Synthesis: "You've chosen that part."). */
          /* Vroeg Bliepo om "de woorden", dan ook "niet de woorden" (taal, vergelijking 28 okt 2026). */
          const meer = (v.signaalOpdracht ?? "").includes("woorden");
          await l.zeg(o.groot ? "Je koos dat stuk." : `Je koos *${String(g.tekst ?? "")}*.`, o.groot ? "Dat is niet wat ik zoek." : meer ? "Dat zijn niet de woorden die ik zoek." : "Dat is niet het woord dat ik zoek.", "Probeer het nog een keer.");
          await verderH(b, l);
          b.zet({ woordKleur: {} });
          speelLesgeluid("terug");
          await l.zeg(v.signaalTip);
          continue;
        }
        b.fout();
        b.zet({ hintZin: v.signaalZin });
        await l.zeg(`Je koos *${String(g.tekst ?? "")}*.`, "Dat is niet het woord dat ik zoek.");
        await verderH(b, l);
        await l.zeg("Het staat in de zin met de rand.", voorleeszin(v.zinnen[v.signaalZin]), v.signaalTip);
      }
      await verderH(b, l);
    } else if (o.groot && v.naspelenUitleg) {
      /*
        Synthesis Bigger Problems: de voorwerpen schuiven terug in beeld. Fout = een
        kleinere vraag; "weet ik niet" (op de vraag of de kleinere vraag) = meteen
        naspelen, vóór de som, en daarna geen signaalwoord.
      */
      if (keuze === null) await l.zeg("Geen zorgen.", "We kijken samen.");
      else {
        b.fout();
        await l.zeg("Goed geprobeerd.", ...v.foutUitleg, "Zullen we ze terug in beeld halen?");
      }
      b.zet({ midden: false, somBijMidden: false });
      b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen", { rij: v.rij, bloeit: false });
      speelLesgeluid("schuif");
      await l.wacht(900);
      const goedKlein = v.op === "+" ? v.kleineVraag.erbij : v.kleineVraag.eraf;
      let k2: string | null = null;
      if (keuze !== null) {
        await l.zeg(...v.kleineVraag.zinnen);
        k2 = await kiesH(b, l, [v.kleineVraag.erbij, v.kleineVraag.eraf], { goed: goedKlein, vinkje: true }).then((x) => (x === null ? null : String(x)));
      }
      if (k2 === goedKlein) {
        speelLesgeluid("goed");
        await l.zeg("Precies.", ...v.kleineVraag.goed);
      } else {
        if (k2 !== null) b.fout();
        await l.zeg(...v.naspelenUitleg.zinnen);
        await naspelenS(b, l, v.b, v.op === "+" ? "erbij" : "weg");
        await omtrekS(b, l);
        await l.zeg(...v.naspelenUitleg.klaar);
      }
      await verderH(b, l);
    } else {
      /* De voorwerpen komen terug in beeld, met een kleinere vraag in gewone woorden. */
      if (keuze === null) await l.zeg("Geen zorgen.", "Ik laat het je zien.");
      else {
        b.fout();
        await l.zeg("Goed geprobeerd.", ...v.foutUitleg, "Zullen we ze erbij laten komen en beter kijken?");
      }
      b.zet({ midden: false });
      b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen", { rij: v.rij, bloeit: false });
      await l.wacht(900);
      await l.zeg(...v.kleineVraag.zinnen);
      const k2 = await l.kies([v.kleineVraag.erbij, v.kleineVraag.eraf]);
      if (k2 === (v.op === "+" ? v.kleineVraag.erbij : v.kleineVraag.eraf)) await l.zeg("Precies.", ...v.kleineVraag.goed);
      else await l.zeg("Kijk maar.", ...v.kleineVraag.goed);
      await verderH(b, l);
    }
  }

  /* 4. De som, vakje voor vakje. */
  /* Zoals Synthesis: de plaatjes schuiven terug in beeld, het signaal blijft groen, het eerste vraagteken is blauw. */
  b.zet({ midden: false, somBijMidden: false, som: LEGE_SOM(v.op), somActief: 0, signaalGroen: b.zonderAanwijzen ? (b.p.signaalGroen ?? false) : false });
  if (b.zonderAanwijzen) b.somDeel(0, { t: "vraag", kleur: BLAUW });
  b.zetPlaatjes(v.soort, v.aan, v.leeg, v.leegVorm ?? "eigen", { rij: v.rij, bloeit: false });
  speelLesgeluid("schuif");
  const streep = (n: number) => {
    const plek = getallen.find((x) => x.n === n && !(b.p.doorgestreept ?? []).includes(x.sleutel));
    if (plek) b.zet({ doorgestreept: [...(b.p.doorgestreept ?? []), plek.sleutel] });
  };
  b.opgave();
  await l.zeg("We hebben alles voor de som.", b.zonderAanwijzen ? "Welk getal zetten we [[b:eerst]]?" : "Welk getal zetten we eerst?");
  /* Grotere verhaaltjes (Synthesis): de getallen in de volgorde van het verhaal; Kleine verhaaltjes: van klein naar groot. */
  const opties = o.groot ? [v.a, v.b] : [v.a, v.b].sort((x, y) => x - y);
  if (v.a !== v.b) {
    let k = await kiesGetalH(b, l, opties, [], v.a);
    if (k !== v.a) {
      if (k === null) {
        b.zet({ hintZin: 0 });
        await l.zeg("Laten we alleen naar deze zin kijken.", voorleeszin(v.zinnen[0]), v.beginVraag);
      } else {
        b.fout();
        await l.zeg(`{${k}}? Niet helemaal.`, v.beginVraag);
      }
      /* Grotere verhaaltjes (Synthesis): de knoppen blijven op hun plek; Kleine verhaaltjes: omgedraaid. */
      k = await kiesGetalH(b, l, o.groot ? opties : [...opties].reverse(), [], v.a);
      b.zet({ hintZin: null });
      if (k !== v.a) await l.zeg(...v.beginAntwoord);
    }
  }
  b.somDeel(0, { t: "getal", n: v.a });
  streep(v.a);
  speelLesgeluid("naarSom");
  b.somDeel(2, { t: "vraag", kleur: MINT });
  b.zet({ somActief: 2, groeneZin: b.zonderAanwijzen ? null : v.signaalZin });
  await l.zeg("Klopt.", b.zonderAanwijzen ? groenWoord(o.groot && v.tweedeVraagGroot ? v.tweedeVraagGroot : v.tweedeVraag) : v.tweedeVraag);
  if (v.a !== v.b) {
    /* Grotere verhaaltjes (Synthesis): de knoppen blijven eerst op hun plek, en draaien pas om na een fout of "weet ik niet". */
    let k = await kiesGetalH(b, l, o.groot ? opties : [...opties].reverse(), [], v.b);
    if (k !== v.b) {
      if (k !== null) b.fout();
      await l.zeg(k === null ? (o.groot ? "Dat is oké. Ik help je een beetje." : "Geen zorgen.") : `{${k}}? Niet helemaal.`, v.tweedeVraag2);
      k = await kiesGetalH(b, l, o.groot ? [...opties].reverse() : opties, [], v.b);
      if (k !== v.b && o.groot) {
        /* Synthesis Bigger Problems: het verhaal krimpt tot de zin met het antwoord. Daarna komt alles terug en kleurt het signaal groen. */
        if (k !== null) b.fout();
        b.zet({ alleenZin: v.signaalZin });
        speelLesgeluid("terug");
        await l.zeg("Kijk naar deze zin.", v.tweedeVraag2);
        for (let p = 0; p < 2 && k !== v.b; p++) {
          k = await kiesGetalH(b, l, [...opties].reverse(), [], v.b);
          if (k !== v.b && p === 0) {
            if (k !== null) b.fout();
            await l.zeg("Kijk nog eens goed.", v.tweedeVraag2);
          }
        }
        b.zet({ alleenZin: null, signaalGroen: true });
        if (k !== v.b) await l.zeg(...v.tweedeAntwoord);
      } else if (k !== v.b) await l.zeg(...v.tweedeAntwoord);
    }
  }
  b.somDeel(2, { t: "getal", n: v.b });
  streep(v.b);
  speelLesgeluid("naarSom");
  b.zet({ somActief: 4, groeneZin: null });

  /* 5. Naspelen, Bliepo telt mee. */
  /* Niet twee keer "klaar" ("Mooi, alles staat klaar." + "De som staat klaar."): Synthesis zegt het één keer. */
  await l.zeg(...(v.naspelen[0] === "De som staat klaar." ? [] : ["Mooi, alles staat klaar."]), ...v.naspelen);
  await naspelenS(b, l, v.b, v.op === "+" ? "erbij" : "weg");
  /* Synthesis: uitgedane lampen worden na de laatste tik een lege omtrek. */
  if (o.groot) await omtrekS(b, l);

  /* 6. Het antwoord. */
  await l.zeg(v.antwoordVraag);
  b.opgave();
  await eindAntwoordS(b, l, { antwoord, keuzes: v.keuzes, weetNiet: !!v.keuzes, tip: v.telTip, ding: v.ding, groot: o.groot, vraag: o.groot ? v.antwoordVraag : undefined });
  b.somDeel(4, { t: "getal", n: antwoord });
  b.zet({ somActief: null, geteld: [] });
  await bloeiNa(b, l, v, false);
  if (o.groot) await l.zeg("Goed zo.", v.antwoordZin);
  else await l.zeg("Goed zo.", somZin(v.a, v.op, v.b, antwoord));
}

/** Het kind probeert het zonder hulp. Goed: klaar. Fout of "weet ik niet": we pluizen het uit. */
/** Geeft `true` als het antwoord meteen goed was (zonder uitpluisroute). */
async function meteenS(b: HBord, l: Lesgids, v: SPluis, opening: string[]): Promise<boolean> {
  const antwoord = uitkomstS(v);
  b.opgave();
  await l.zeg(...opening, v.antwoordVraag);
  const x = await kiesH(b, l, v.keuzes ?? TEGELS, { goed: antwoord, tegels: !v.keuzes });
  if (x === antwoord) {
    b.goed();
    b.zet({ som: somVol(v.a, v.op, v.b) });
    if (v.op === "+") await bloeiNa(b, l, v, true);
    await l.zeg("Precies.", somZin(v.a, v.op, v.b, antwoord), v.antwoordZin);
    return true;
  }
  if (x === null) await l.zeg("Geen probleem.", "We doen het verhaal samen stap voor stap.");
  else if (b.zonderAanwijzen) {
    /* Zoals Synthesis: na één fout de keuze "Nog een keer" of "Hulp"; na nog een fout samen uitpluizen. */
    b.fout();
    await l.zeg(`{${x}}? Niet helemaal.`);
    await l.zeg("Wil je hulp, of nog een keer proberen?");
    const keuze = await l.kies(["Nog een keer", "Hulp"], { weetniet: false });
    if (keuze === "Nog een keer") {
      await l.zeg(v.antwoordVraag);
      const y = await kiesH(b, l, v.keuzes ?? TEGELS, { goed: antwoord, tegels: !v.keuzes });
      if (y === antwoord) {
        b.goed();
        b.zet({ som: somVol(v.a, v.op, v.b) });
        if (v.op === "+") await bloeiNa(b, l, v, true);
        await l.zeg("Precies.", somZin(v.a, v.op, v.b, antwoord), v.antwoordZin);
        return true;
      }
      if (y !== null) b.fout();
      await l.zeg(y === null ? "Geen probleem." : `{${y}}? Niet helemaal.`, "Laten we het samen uitzoeken.");
    } else await l.zeg("Goed.", "We doen het verhaal samen stap voor stap.");
  } else {
    b.fout();
    await l.zeg(`{${x}}? Niet helemaal.`, "We doen het verhaal samen stap voor stap.");
  }
  await pluisUitS(b, l, v);
  return false;
}

/**
 * Welke som past bij het verhaal? Goed: het antwoord kiezen. Fout, of een
 * verkeerd antwoord: "laten we het samen uitzoeken" en de hele route.
 */
async function somKiezenS(b: HBord, l: Lesgids, v: SPluis, o: { foutSommen: string[]; kort?: boolean; groot?: boolean }) {
  const goed = `${v.a} ${v.op} ${v.b}`;
  const antwoord = uitkomstS(v);
  b.opgave();
  /*
    Zoals Synthesis: vaste volgorde. Minsom: de goede als laatste (17 + 9 | 26 − 17 | 17 − 9, 10 + 2 | 12 − 10 | 10 − 2);
    plussom: de goede bovenaan. Vóór de vergelijking (28 okt 2026) werden ze geschud.
  */
  const k = await kiesH(b, l, b.zonderAanwijzen ? (v.op === "+" ? [goed, ...o.foutSommen] : [...o.foutSommen, goed]) : schud([goed, ...o.foutSommen]), { som: true, wijsSleutel: "sommen", wijs: ["Tik op de som die past."], goed });
  if (k !== goed) {
    if (k !== null) b.fout();
    await l.zeg(k === null ? "Geen zorgen." : `${String(k).replace(/(\d+)/g, "{$1}")}? Dat is niet de som die ik zocht.`, "Laten we het samen uitzoeken.");
    await pluisUitS(b, l, v, { kort: o.kort, groot: o.groot });
    return;
  }
  /* Grotere verhaaltjes (Synthesis): de gekozen som schuift onderaan in beeld. Kleine verhaaltjes: geen som onderaan (Synthesis Small Problems 032). */
  const somOnder = o.groot || !b.zonderAanwijzen;
  if (somOnder) b.zet({ som: somVraag(v.a, v.op, v.b), somActief: 4 });
  if (o.groot) speelLesgeluid("schuif");
  await l.zeg(`Precies, {${v.a}} ${v.op} {${v.b}}.`, v.antwoordVraag);
  b.opgave();
  /* Zoals Synthesis: de vier antwoordknoppen hebben "Weet ik niet"; de cijfertegels hier ook (Small Problems 032: "I don't know"). */
  const x = await kiesH(b, l, v.keuzes ?? TEGELS, { goed: antwoord, tegels: !v.keuzes, weetNiet: !!v.keuzes || b.zonderAanwijzen });
  if (x === antwoord) {
    b.goed();
    if (somOnder) b.somDeel(4, { t: "getal", n: antwoord });
    b.zet({ somActief: null });
    if (v.op === "+") await bloeiNa(b, l, v, true);
    /* Bij eraf het plaatje laten meegaan (keurder, 28 okt): anders branden er nog alle lampen terwijl Bliepo zegt dat er 8 branden. */
    else if (b.p.plaatjes && b.p.plaatjes.soort !== "ballon") await laatGebeurenH(b, l, v.a, antwoord, b.p.plaatjes.plekken.length, 140);
    /* Ballonnen (Synthesis Small Problems 033): Bliepo laat ze zelf knappen, de laatste eerst. */
    else if (b.p.plaatjes && b.zonderAanwijzen) await knapZelfS(b, l, v.b, v.gekozenPlekken);
    if (o.groot) await omtrekS(b, l);
    await l.zeg("Precies.", ...(o.groot ? [] : [somZin(v.a, v.op, v.b, antwoord)]), v.antwoordZin);
    return;
  }
  if (x !== null) b.fout();
  await l.zeg(x === null ? "Geen zorgen." : x === v.b && v.redenB ? v.redenB : `{${x}}? Niet helemaal.`, "Laten we het samen uitzoeken.");
  /* Grotere verhaaltjes (Synthesis): gaat vanzelf door, en de som blijft onderaan staan tijdens het uitpluizen. */
  if (!o.groot) await verderH(b, l);
  await pluisUitS(b, l, v, { kort: o.kort, groot: o.groot, somBlijft: o.groot });
}

/**
 * Een verhaal dat het kind zelf maakte (Synthesis Bigger Problems): welke som
 * past? Een foute som krijgt GEEN uitpluisroute, maar uitleg, en Bliepo zet
 * de goede som onderaan. Daarna het antwoord: goed = Bliepo speelt het zelf
 * na; fout = het kind speelt het na en telt; nog eens fout = pauze.
 */
async function zelfSomS(
  b: HBord,
  l: Lesgids,
  v: SPluis,
  o: { foutSommen: string[]; waarom: (som: string) => string[]; naspeelHulp: string[]; telVraag: string[]; naspeelDoel?: Plekstaat },
) {
  const goed = `${v.a} ${v.op} ${v.b}`;
  const antwoord = uitkomstS(v);
  b.opgave();
  /* Zoals Synthesis: vaste volgorde, de plussom bovenaan (7 + 1 | 7 − 1 | 8 − 7 en 16 + 5 | 21 − 16 | 16 − 5). */
  const k = await kiesH(b, l, v.op === "+" ? [goed, ...o.foutSommen] : [...o.foutSommen, goed], { som: true, goed });
  if (k !== goed) {
    if (k !== null) b.fout();
    await l.zeg(...(k === null ? ["Geen zorgen."] : [`Jij koos de som ${somTekst(String(k))}.`, ...o.waarom(String(k))]), `Deze som past: ${somTekst(goed)}.`);
  }
  b.zet({ som: somVraag(v.a, v.op, v.b), somActief: 4 });
  speelLesgeluid("schuif");
  await l.zeg(k === goed ? `Precies, ${somTekst(goed)}.` : "", v.antwoordVraag);
  b.opgave();
  const keuzes = v.keuzes ?? TEGELS;
  for (let poging = 1; ; poging++) {
    const x = await kiesH(b, l, keuzes, { goed: antwoord, tegels: !v.keuzes });
    if (x === antwoord) {
      b.goed();
      b.somDeel(4, { t: "getal", n: antwoord });
      b.zet({ somActief: null });
      /* Synthesis: na een goed antwoord speelt Bliepo het verhaal zelf na. */
      if (poging === 1) await speelZelfNaS(b, l, v);
      else if (v.soort === "pot") b.bloei(true);
      await l.zeg("Goed zo.", v.antwoordZin);
      return;
    }
    if (x !== null) b.fout();
    const n = Number(x);
    if (poging === 1) {
      await l.zeg(x === null ? "Geen zorgen." : `{${n}} ${n === 1 ? enkelvoud(v.ding) : v.ding}? Niet helemaal.`, ...o.naspeelHulp);
      await naspelenS(b, l, v.b, v.op === "+" ? "erbij" : "weg", false, { doel: o.naspeelDoel });
      if (v.soort === "pot") b.bloei(true);
      await l.zeg(...o.telVraag);
      continue;
    }
    await l.zeg(x === null ? "Dat is niet erg." : `{${n}} ${n === 1 ? enkelvoud(v.ding) : v.ding}? Dat is nog niet het getal dat ik tel.`, "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await verderH(b, l);
    return l.stopLes();
  }
}

/** Bliepo laat zelf `n` ballonnen knappen (de laatste eerst), met het knalgeluidje. */
async function knapZelfS(b: HBord, l: Lesgids, n: number, gekozen?: number[]) {
  const pl = b.p.plaatjes;
  if (!pl) return;
  const aanPlekken = pl.plekken.map((st, i) => (st === "aan" ? i : -1)).filter((i) => i >= 0);
  /* Synthesis: dezelfde ballonnen die het kind koos. */
  const deze = gekozen && gekozen.length === n ? gekozen : aanPlekken.slice(-n).reverse();
  for (const i of deze) {
    const nu = b.p.plaatjes;
    if (!nu) return;
    speelLesgeluid(naspeelGeluid(nu.soort));
    b.zetPlekken(nu.plekken.map((st, j) => (j === i ? "uit" : st)));
    await l.wacht(260);
  }
}

/** Bliepo speelt een zelfgemaakt verhaal na: bloemen erbij, of munten die wegdraaien (de laatste eerst). */
async function speelZelfNaS(b: HBord, l: Lesgids, v: SPluis) {
  const pl = b.p.plaatjes;
  if (!pl) return;
  if (v.op === "+") {
    await laatGebeurenH(b, l, v.a, v.a + v.b, pl.plekken.length, 220);
    if (v.soort === "pot") b.bloei(true);
    return;
  }
  const aanPlekken = pl.plekken.map((st, i) => (st === "aan" ? i : -1)).filter((i) => i >= 0);
  for (const i of aanPlekken.slice(-v.b).reverse()) {
    const nu = b.p.plaatjes;
    if (!nu) return;
    speelLesgeluid(naspeelGeluid(nu.soort));
    b.zetPlekken(nu.plekken.map((st, j) => (j === i ? "leeg" : st)));
    await l.wacht(260);
  }
}

/** Het kind maakt zelf het verhaal: Bliepo zegt wat het moet doen, het kind tikt. */
async function zelfMaken(b: HBord, l: Lesgids, o: { soort: HoloSoort; aan: number; leeg: number; rij?: number; modus: "weg" | "erbij"; aantal: number; opening: string[]; klaar: string[] }) {
  b.nieuw([]);
  b.zetPlaatjes(o.soort, o.aan, o.leeg, "eigen", { rij: o.rij, bloeit: false });
  await l.zeg(...o.opening);
  await naspelenS(b, l, o.aantal, o.modus, false);
  await l.zeg(...o.klaar);
  await verderH(b, l);
}

const KANS = ["Ja", "Nee"];

/* ---------- toetsen (Assessment en Mastery Check) ---------- */

/** Een korte toets-stop: Bliepo zegt het, en de eerste les begint meteen in hetzelfde scherm. */
async function stopToets(l: Lesgids, eerste: Lesdraaiboek): Promise<false> {
  await l.zeg("Laten we de toets hier stoppen.", "We beginnen met de eerste les.", "Daar leren we het samen.");
  await eerste.speel(l);
  return false;
}

/**
 * De zes antwoordknoppen van een toetsvraag zoals Synthesis Word Problems Check: het antwoord,
 * één eronder en één erboven, en de denkfouten (de getallen uit het verhaal en hun som), door
 * elkaar (Synthesis zet ze niet op volgorde). Eén keer gemengd: bij "kijk nog eens" blijven ze staan.
 */
function toetsKeuzes(antwoord: number, ...denkfouten: number[]): number[] {
  const set = new Set<number>([antwoord]);
  for (const x of [antwoord - 1, antwoord + 1, ...denkfouten, antwoord + 2, antwoord - 2, antwoord + 10]) {
    if (set.size >= 6) break;
    if (x >= 0 && x <= 40) set.add(x);
  }
  return schud([...set]);
}

/** Extra toetsverhalen, oplopend in moeilijkheid: "hoeveel blijven er over". */
type ToetsUit = { soort: HoloSoort; a: number; w: number; zinnen: string[]; rij?: boolean };
const TOETS_UIT: ToetsUit[] = [
  { soort: "ballon", a: 12, w: 5, zinnen: ["Er zijn 12 ballonnen.", "Er vliegen er 5 weg.", "Hoeveel ballonnen zijn er nog?"] },
  { soort: "munt", a: 13, w: 6, zinnen: ["Er zijn 13 munten.", "Je geeft er 6 uit.", "Hoeveel munten zijn er nog?"] },
  { soort: "vogel", a: 9, w: 4, zinnen: ["Er zitten 9 vogeltjes op een draad.", "Er vliegen er 4 weg.", "Hoeveel vogeltjes zitten er nog?"], rij: true },
  { soort: "lamp", a: 16, w: 7, zinnen: ["Er branden 16 lampen.", "Er gaan er 7 uit.", "Hoeveel lampen branden er nog?"] },
  { soort: "ballon", a: 19, w: 11, zinnen: ["Er zijn 19 ballonnen op een feestje.", "Er vliegen er 11 weg.", "Hoeveel ballonnen zijn er nog?"] },
  { soort: "munt", a: 17, w: 8, zinnen: ["Er zijn 17 munten.", "Je geeft er 8 uit.", "Hoeveel munten zijn er nog?"] },
];

/** Extra toetsverhalen met een verstopt getal: "hoeveel kwamen erbij". */
type ToetsBij = { soort: HoloSoort; a: number; c: number; zinnen: string[]; leeg: "plek" | "eigen" };
const TOETS_BIJ: ToetsBij[] = [
  /* Vraag en verhaal in dezelfde tijd (vergelijking 28 okt 2026): "komen erbij", niet "kwamen erbij". */
  { soort: "vogel", a: 4, c: 11, zinnen: ["Er zitten 4 vogeltjes op een draad.", "Er komen er nog een paar bij.", "Nu zijn het er 11.", "Hoeveel vogeltjes komen erbij?"], leeg: "plek" },
  { soort: "munt", a: 6, c: 14, zinnen: ["Je hebt 6 munten.", "Je krijgt er nog een paar bij.", "Nu heb je er 14.", "Hoeveel munten krijg je erbij?"], leeg: "plek" },
  { soort: "ballon", a: 8, c: 16, zinnen: ["Je hebt 8 ballonnen.", "Je krijgt er nog een paar bij.", "Nu heb je er 16.", "Hoeveel ballonnen krijg je erbij?"], leeg: "plek" },
  { soort: "pot", a: 9, c: 17, zinnen: ["Er staan 9 bloemen in een tuin.", "Er komen er nog een paar bij.", "Nu zijn het er 17.", "Hoeveel bloemen komen erbij?"], leeg: "eigen" },
  { soort: "munt", a: 11, c: 19, zinnen: ["Je hebt 11 munten.", "Je krijgt er nog een paar bij.", "Nu heb je er 19.", "Hoeveel munten krijg je erbij?"], leeg: "plek" },
];

/**
 * Het begin van een toets, zoals Synthesis: "Weet je hoe je dit oplost?", dan
 * de keuze toets of les. Geeft `true` als de toets doorgaat.
 */
async function toetsOfLesS(l: Lesgids, eerste: Lesdraaiboek): Promise<boolean> {
  await l.zeg("Weet je hoe je zulke verhaaltjessommen oplost?");
  const weet = await l.kies(KANS, { weetniet: false });
  if (weet !== "Ja") {
    await stopToets(l, eerste);
    return false;
  }
  await l.zeg("Oké.", "Wil je laten zien wat je al kunt?", "Dan doen we een toets, en kun je sneller verder.", "Of doen we samen de lessen?");
  const keuze = await l.kies(["Toets", "Les"], { weetniet: false });
  /* Zoals Synthesis: na "Toets" meteen de eerste vraag ("Goed. Wat denk je?"), geen extra "Mooi." ervoor. */
  if (keuze === "Toets") return true;
  await l.zeg("Prima.", "Dan beginnen we met de eerste les.");
  await eerste.speel(l);
  return false;
}

/**
 * Eén toetsvraag zoals Synthesis Word Problems Check: geen "Weet ik niet",
 * wel het handje (stopt de toets, de eerste les begint). 1× fout: "Dat is heel
 * dichtbij. Kijk nog eens." en dezelfde vraag met dezelfde knoppen; 2× fout:
 * de toets stopt en de eerste les begint. Geeft `false` als de toets stopt.
 */
async function toetsVraagS(b: HBord, l: Lesgids, eerste: Lesdraaiboek, opties: (number | string)[], goed: number | string, vraag: string[], herhaal: string[], som = false, doorNaar?: Lesdraaiboek): Promise<boolean> {
  b.opgave();
  for (let poging = 1; poging <= 2; poging++) {
    await l.zeg(...(poging === 1 ? vraag : herhaal));
    const keuze = kiesH(b, l, opties, { som, goed, weetNiet: false });
    /* Het handje verschijnt na de spraak, naast de vraag. */
    b.zet({ handje: true });
    const hand = l.wachtOpVlak("handje").then(
      () => "handje" as const,
      () => new Promise<never>(() => {}),
    );
    const x = await Promise.race([keuze, hand]);
    b.zet({ handje: false });
    if (x === "handje") {
      await l.zeg("Geen zorgen.", "Laten we de toets hier stoppen en met de eerste les beginnen.");
      await eerste.speel(l);
      return false;
    }
    if (x === goed) {
      b.goed();
      return true;
    }
    b.fout();
    if (poging === 1) await l.zeg(typeof x === "number" ? `{${x}}? Dat is heel dichtbij.` : `${somTekst(String(x))}?`, "Kijk nog eens.");
  }
  await l.zeg("Dat is een goede poging.", "We bekijken dit samen in een les.");
  await verderH(b, l);
  /*
    Synthesis: was er al een vraag goed, dan tellen de eerste lessen als gehaald en stelt de tutor
    de volgende les voor ("Should we jump right in?" Ja/Nee). De kaarten van de gehaalde lessen
    toont het lesscherm niet (valt buiten deze klus).
  */
  if (doorNaar) {
    l.vlak(null);
    await l.zeg("De kleine en de grotere verhaaltjes kun je al.", `De les ${doorNaar.titel} is een mooie volgende stap.`, "Zullen we meteen beginnen?");
    if ((await l.kies(KANS, { weetniet: false })) === "Ja") {
      await doorNaar.speel(l);
      return false;
    }
  }
  await eerste.speel(l);
  return false;
}

async function toetsS(
  l: Lesgids,
  eerste: Lesdraaiboek,
  /** Synthesis: na een goede eerste vraag en daarna 2× fout stelt de tutor deze les voor. */
  volgende: Lesdraaiboek | undefined,
  t: { lampA: number; lampN: number; lampKeuzes: number[]; potA: number; potEind: number; sommen: string[]; potKeuzes: number[] },
): Promise<boolean> {
  const b = new HBord(l);
  b.zonderAanwijzen = true;
  const nog = t.lampA - t.lampN;

  /* Vraag 1: lampen uit (20 plekken, zoals Synthesis). Geen aankondiging: meteen voorlezen; de lampen gaan één voor één aan, de rest zijn lege omtrekken. */
  b.nieuw([`Er branden ${t.lampA} lampen.`, `${Wie(l)} doet er ${t.lampN} uit.`, "Hoeveel lampen branden er nog?"]);
  b.zetStand("lamp", [...Array<Plekstaat>(t.lampA).fill("aan"), ...Array<Plekstaat>(20 - t.lampA).fill("leeg")]);
  await vertelS(b, l, "aan");
  if (!(await toetsOfLesS(l, eerste))) return false;
  if (!(await toetsVraagS(b, l, eerste, schud(t.lampKeuzes), nog, ["Goed.", "Wat denk je?", "Hoeveel lampen branden er nog?"], ["Hoeveel lampen branden er nog?"]))) return false;
  await l.zeg("Dat klopt.", `Er branden nog {${nog}} lampen.`);
  /* Bliepo doet zelf de lampen uit: eerst grijs, dan een lege omtrek. Geen som in beeld. */
  await laatGebeurenH(b, l, t.lampA, nog, 20, 180);
  await omtrekS(b, l);
  await verderH(b, l);

  /* Vraag 2: bloemen, alleen tekst met een stippellijn voor de vraag (geen plaatjes). */
  const erbij = t.potEind - t.potA;
  b.nieuw([`Er staan ${t.potA} bloemen in een tuin.`, `${Wie(l)} plant er nog een paar bij.`, `Nu zijn het er ${t.potEind}.`, `Hoeveel bloemen plant ${wie(l)} erbij?`], { stippelVoor: 3 });
  await vertelH(b, l);
  const goedeSom = `${t.potA} + ? = ${t.potEind}`;
  /* Zoals Synthesis: drie sommen in vaste volgorde, de goede bovenaan (6 + ? = 17 | 6 + 17 = ? | 6 − ? = 17). */
  if (!(await toetsVraagS(b, l, eerste, [goedeSom, ...t.sommen], goedeSom, ["Voordat we het oplossen, eerst een vraag.", "Welke som past bij het verhaal?"], ["Welke som past bij het verhaal?"], true, volgende))) return false;
  /* De som verschijnt pas nu, met een groen vraagteken op de tweede plek. */
  b.zet({ som: [{ t: "getal", n: t.potA }, { t: "teken", s: "+" }, { t: "vraag", kleur: MINT }, { t: "teken", s: "=" }, { t: "getal", n: t.potEind }], somActief: 2 });
  speelLesgeluid("schuif");
  if (!(await toetsVraagS(b, l, eerste, schud(t.potKeuzes), erbij, ["Klopt.", `[[b:Hoeveel]] bloemen plant ${wie(l)} erbij?`], [`Hoeveel bloemen plant ${wie(l)} erbij?`], false, volgende))) return false;
  b.somDeel(2, { t: "getal", n: erbij });
  b.zet({ somActief: null });
  await l.zeg("Precies.", `${Wie(l)} plant er {${erbij}} bij.`);
  await verderH(b, l);

  /* Extra toetsvragen van dezelfde soort (alleen tekst, zoals vraag 2), tot er 15 zijn. Na het allerlaatste goede antwoord meteen de kaart. */
  let u = 0;
  let p = 0;
  for (let ronde = 0; b.opgaven < 15 && ronde < 12; ronde++) {
    if (ronde % 2 === 0 && u < TOETS_UIT.length) {
      const v = TOETS_UIT[u++];
      const ant = v.a - v.w;
      /* Zelfde soort vraag als vraag 1, dus ook met plaatjes (vergelijking 28 okt 2026). Lampen: 20 plekken. */
      const totaal = v.soort === "lamp" ? 20 : v.a;
      b.nieuw(v.zinnen);
      b.zetStand(v.soort, [...Array<Plekstaat>(v.a).fill("aan"), ...Array<Plekstaat>(totaal - v.a).fill("leeg")], "eigen", { rij: v.rij ? v.a : undefined });
      await vertelH(b, l);
      const vraag = v.zinnen[2].replace(/\b(\d+)\b/g, "{$1}");
      if (!(await toetsVraagS(b, l, eerste, toetsKeuzes(ant, v.a, v.a + v.w, v.a + v.w - 1), ant, ["Wat denk je?", vraag], [vraag], false, volgende))) return false;
      if (b.opgaven >= 15) return true;
      /* Zoals Synthesis ("6 are still on"): de bevestiging noemt wat er geteld wordt. */
      const telZin: Record<string, string> = { ballon: "Er zijn nog {N} ballonnen.", munt: "Er zijn nog {N} munten.", vogel: "Er zitten nog {N} vogeltjes.", lamp: "Er branden nog {N} lampen." };
      await l.zeg("Dat klopt.", (telZin[v.soort] ?? "Het zijn er {N}.").replace("N", String(ant)));
      /* Zoals vraag 1: Bliepo laat het zelf gebeuren. */
      await laatGebeurenH(b, l, v.a, ant, totaal, 160);
      if (v.soort === "lamp") await omtrekS(b, l);
      await verderH(b, l);
    } else if (p < TOETS_BIJ.length) {
      const v = TOETS_BIJ[p++];
      const ant = v.c - v.a;
      b.nieuw(v.zinnen, { stippelVoor: 3 });
      await vertelH(b, l);
      const goed = `${v.a} + ? = ${v.c}`;
      if (!(await toetsVraagS(b, l, eerste, [goed, `${v.a} + ${v.c} = ?`, `${v.a} − ? = ${v.c}`], goed, ["Welke som past bij het verhaal?"], ["Welke som past bij het verhaal?"], true, volgende))) return false;
      b.zet({ som: [{ t: "getal", n: v.a }, { t: "teken", s: "+" }, { t: "vraag", kleur: MINT }, { t: "teken", s: "=" }, { t: "getal", n: v.c }], somActief: 2 });
      speelLesgeluid("schuif");
      const vraag = v.zinnen[3].replace(/\b(\d+)\b/g, "{$1}");
      /* Zoals vraag 2: "Hoeveel" blauw zodra de som onderaan staat. */
      const vraagBlauw = vraag.replace(/^Hoeveel/, "[[b:Hoeveel]]");
      if (!(await toetsVraagS(b, l, eerste, toetsKeuzes(ant, v.a, v.c, v.a + v.c), ant, ["Klopt.", vraagBlauw], [vraag], false, volgende))) return false;
      b.somDeel(2, { t: "getal", n: ant });
      b.zet({ somActief: null });
      if (b.opgaven >= 15) return true;
      /* Zelfde werkwoord als het verhaal: "Je krijgt er 8 bij." of "Er komen er 7 bij." */
      await l.zeg("Precies.", v.zinnen[1].startsWith("Je krijgt") ? `Je krijgt er {${ant}} bij.` : `Er komen er {${ant}} bij.`);
      await verderH(b, l);
    }
  }
  return true;
}

/* ---------- oefenverhalen NA de stappen van Synthesis (tot 15 vragen) ---------- */

const kMin = (soort: HoloSoort, zinnen: string[], a: number, b: number, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  zinnen,
  soort,
  a,
  b,
  op: "−",
  vraag: zinnen[zinnen.length - 1].replace(/\b(\d+)\b/g, "{$1}"),
  telTip,
  antwoordZin,
  leeg,
});
const kPlus = (soort: HoloSoort, zinnen: string[], a: number, b: number, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  ...kMin(soort, zinnen, a, b, telTip, antwoordZin, leeg),
  op: "+",
});

/** Tot 10 (Kleine verhaaltjes): oplopend, antwoorden 1–9, elk voorwerp en elke getallenreeks één keer. */
const BANK_S10: Kort[] = [
  kMin("ballon", ["Er zijn 6 ballonnen.", "Er knappen er 2.", "Hoeveel ballonnen zijn er nog heel?"], 6, 2, "Tel de ballonnen die heel zijn.", "Er zijn nog {4} ballonnen heel."),
  kPlus("pot", ["Er staan 4 bloemen in een tuin.", "Er komen er nog 2 bij.", "Hoeveel bloemen zijn het nu?"], 4, 2, "Tel alle bloemen.", "Het zijn er {6}."),
  kMin("lamp", ["Er branden 8 lampen.", "Er gaan er 3 uit.", "Hoeveel lampen branden er nog?"], 8, 3, "Tel de lampen die nog branden.", "Er branden nog {5} lampen."),
  kPlus("munt", ["Je hebt 3 munten.", "Je krijgt er 4 bij.", "Hoeveel munten heb je nu?"], 3, 4, "Tel alle munten.", "Je hebt nu {7} munten.", "plek"),
  kMin("vogel", ["Er zitten 9 vogeltjes op een draad.", "Er vliegen er 5 weg.", "Hoeveel vogeltjes zitten er nog?"], 9, 5, "Tel de vogeltjes die er nog zijn.", "Er zitten nog {4} vogeltjes."),
  kPlus("ballon", ["Er zijn 5 ballonnen.", "Er komen er 3 bij.", "Hoeveel ballonnen zijn het nu?"], 5, 3, "Tel alle ballonnen.", "Het zijn er {8}.", "plek"),
  kMin("munt", ["Je hebt 10 munten.", "Je geeft er 6 uit.", "Hoeveel munten heb je nog?"], 10, 6, "Tel de munten die je nog hebt.", "Je hebt nog {4} munten."),
  kPlus("lamp", ["Er branden 2 lampen.", "Ik doe er nog 6 aan.", "Hoeveel lampen branden er nu?"], 2, 6, "Tel alle lampen die branden.", "Er branden nu {8} lampen."),
  kPlus("vogel", ["Er zitten 4 vogeltjes op een draad.", "Er komen er 5 bij.", "Hoeveel vogeltjes zitten er nu?"], 4, 5, "Tel alle vogeltjes.", "Er zitten nu {9} vogeltjes.", "plek"),
  kMin("ballon", ["Er zijn 9 ballonnen.", "Er knappen er 4.", "Hoeveel ballonnen zijn er nog heel?"], 9, 4, "Tel de ballonnen die heel zijn.", "Er zijn nog {5} ballonnen heel."),
];

/** Tot 20 (Grotere verhaaltjes): oplopend. */
const BANK_S20: Kort[] = [
  kMin("ballon", ["Er zijn 12 ballonnen.", "Er vliegen er 5 weg.", "Hoeveel ballonnen zijn er nog?"], 12, 5, "Tel de ballonnen die er nog zijn.", "Er zijn nog {7} ballonnen."),
  kMin("lamp", ["Er branden 15 lampen.", "Er gaan er 8 uit.", "Hoeveel lampen branden er nog?"], 15, 8, "Tel de lampen die nog branden.", "Er branden nog {7} lampen."),
  kPlus("pot", ["Er staan 8 bloemen in een tuin.", "Er komen er 7 bij.", "Hoeveel bloemen zijn het nu?"], 8, 7, "Tel alle bloemen.", "Het zijn er {15}."),
  kMin("munt", ["Je hebt 18 munten.", "Je geeft er 9 uit.", "Hoeveel munten heb je nog?"], 18, 9, "Tel de munten die je nog hebt.", "Je hebt nog {9} munten."),
  kPlus("vogel", ["Er zitten 9 vogeltjes op een draad.", "Er komen er 6 bij.", "Hoeveel vogeltjes zitten er nu?"], 9, 6, "Tel alle vogeltjes.", "Er zitten nu {15} vogeltjes.", "plek"),
  kMin("vogel", ["Er zitten 16 vogeltjes op een draad.", "Er vliegen er 7 weg.", "Hoeveel vogeltjes zitten er nog?"], 16, 7, "Tel de vogeltjes die er nog zijn.", "Er zitten nog {9} vogeltjes."),
  kPlus("ballon", ["Er zijn 11 ballonnen.", "Er komen er 6 bij.", "Hoeveel ballonnen zijn het nu?"], 11, 6, "Tel alle ballonnen.", "Het zijn er {17}.", "plek"),
  kMin("lamp", ["Er branden 20 lampen.", "Er gaan er 13 uit.", "Hoeveel lampen branden er nog?"], 20, 13, "Tel de lampen die nog branden.", "Er branden nog {7} lampen."),
  kPlus("munt", ["Je hebt 12 munten.", "Je krijgt er 8 bij.", "Hoeveel munten heb je nu?"], 12, 8, "Tel alle munten.", "Je hebt nu {20} munten.", "plek"),
  kMin("ballon", ["Er zijn 17 ballonnen.", "Er knappen er 8.", "Hoeveel ballonnen zijn er nog heel?"], 17, 8, "Tel de ballonnen die heel zijn.", "Er zijn nog {9} ballonnen heel."),
];

/** Met een verstopt getal (Verstopte getallen): oplopend. */
const vs = (soort: HoloSoort, zinnen: string[], a: number, b: number, op: "+" | "−", onbekend: 0 | 2, telTip: string, antwoordZin: string, leeg?: "plek"): Kort => ({
  zinnen,
  soort,
  a,
  b,
  op,
  onbekend,
  vraag: zinnen[zinnen.length - 1].replace(/\b(\d+)\b/g, "{$1}"),
  telTip,
  antwoordZin,
  leeg,
});
const BANK_S_VERSTOPT: Kort[] = [
  vs("pot", ["Er staan een paar bloemen in een tuin.", "Er komen er 3 bij.", "Nu zijn het er 8.", "Hoeveel bloemen stonden er eerst?"], 5, 3, "+", 0, "Tel de bloemen die er eerst stonden.", "Er stonden eerst {5} bloemen."),
  vs("lamp", ["Er branden 10 lampen.", "Ik doe er een paar uit.", "Nu branden er nog 6.", "Hoeveel lampen doe ik uit?"], 10, 4, "−", 2, "Tel de lampen die uit zijn.", "Ik doe er {4} uit."),
  vs("munt", ["Je hebt 6 munten.", "Je krijgt er nog een paar bij.", "Nu heb je er 11.", "Hoeveel munten kreeg je erbij?"], 6, 5, "+", 2, "Tel de munten die erbij kwamen.", "Je kreeg er {5} bij.", "plek"),
  vs("ballon", ["Er zijn een paar ballonnen.", "Er knappen er 4.", "Nu zijn er nog 5 heel.", "Hoeveel ballonnen waren er eerst?"], 9, 4, "−", 0, "Tel alle ballonnen.", "Er waren eerst {9} ballonnen."),
  vs("vogel", ["Er zitten een paar vogeltjes op een draad.", "Er komen er 4 bij.", "Nu zijn het er 11.", "Hoeveel vogeltjes zaten er eerst?"], 7, 4, "+", 0, "Tel de vogeltjes die er eerst waren.", "Er zaten eerst {7} vogeltjes.", "plek"),
  vs("lamp", ["Er branden 14 lampen.", "Ik doe er een paar uit.", "Nu branden er nog 9.", "Hoeveel lampen doe ik uit?"], 14, 5, "−", 2, "Tel de lampen die uit zijn.", "Ik doe er {5} uit."),
  vs("munt", ["Je hebt een paar munten.", "Je krijgt er 8 bij.", "Nu heb je er 15.", "Hoeveel munten had je eerst?"], 7, 8, "+", 0, "Tel de munten die je eerst had.", "Je had eerst {7} munten.", "plek"),
  vs("ballon", ["Er zijn 18 ballonnen.", "Er vliegen er een paar weg.", "Nu zijn er nog 11.", "Hoeveel ballonnen vlogen er weg?"], 18, 7, "−", 2, "Tel de ballonnen die wegvlogen.", "Er vlogen {7} ballonnen weg."),
  vs("pot", ["Er staan 9 bloemen in een tuin.", "Er komen er nog een paar bij.", "Nu zijn het er 17.", "Hoeveel bloemen kwamen erbij?"], 9, 8, "+", 2, "Tel de bloemen die erbij kwamen.", "Er kwamen {8} bloemen bij."),
  vs("munt", ["Je hebt een paar munten.", "Je geeft er 9 uit.", "Nu heb je er nog 8.", "Hoeveel munten had je eerst?"], 17, 9, "−", 0, "Tel alle munten.", "Je had eerst {17} munten."),
];
type OmgekeerdS = Omit<Omgekeerd, "soort"> & {
  soort: HoloSoort;
  leeg?: "plek" | "eigen";
  rij?: number;
  intro?: string[];
  rekenVraagBouw?: string;
  /** Hulp na een fout antwoord: "Laten we naar … kijken." */
  hulpNaar?: string;
  /** Hulp bij eraf: wat Bliepo zegt vóór het uitdoen, en erna. */
  uitTot?: string[];
  uitKlaar?: string[];
  /** De controle bij erbij: "Jij plantte er {5} bij." */
  erbijZin?: string;
  /** Ik-verhaal: de beginzin bij de controle (N = het getal), anders "We begonnen met …". */
  beginZin?: string;
  /** Een getal op de plek van het onbekende: waarom niet ("Maar we *begonnen* niet met zoveel."), per deel. */
  nietZo?: [string, string, string];
  /** "Dat weten we nog niet" bij een deel dat we wél weten: waarom wel, per deel. */
  welWeten?: [string, string, string];
};

/** De Synthesis-knop voor het onbekende deel; na een fout heet hij naar het woord uit het verhaal. */
const EEN_PAAR = "Een paar";

/**
 * Verstopte getallen, gedrag zoals Synthesis Mixed Problems
 * (GEDRAG-V4-verstopte-getallen.md, 28 okt 2026):
 * - alleen de tekst met een stippellijn voor de vraag; plaatjes pas bij hulp en controle;
 * - Nee (of een foute som): de lege som schuift in beeld en we bouwen hem deel voor deel,
 *   met de knop "Dat weten we nog niet" (goed bij het onbekende deel: een crème "?");
 * - bij een fout maakt Bliepo zelf de hulpzin groen; geen ringen, niets doorgestreept;
 * - het "?" krijgt pas een kleur als de som af is (blauw vooraan, groen in het midden);
 * - Ja + goede som: geen som onderaan; de som komt pas na het goede antwoord;
 * - fout antwoord: het verhaal verdwijnt, we rekenen terug met de plaatjes;
 * - na elk goed antwoord een controle met de plaatjes.
 */
async function omgekeerdS(b: HBord, l: Lesgids, v: OmgekeerdS) {
  const onbekend = v.delen[0] === null ? 0 : 1;
  const [p, q, eind] = v.delen;
  const antwoord = v.op === "+" ? eind - (p ?? q ?? 0) : (p ?? 0) - eind;
  const kleur = onbekend === 0 ? BLAUW : MINT;
  const getallen = [...new Set(v.delen.filter((x): x is number => x !== null))].sort((x, y) => x - y);
  const somPlek = [0, 2, 4];
  const leeg = v.leeg ?? "eigen";
  const ding = (n: number) => (n === 1 ? enkelvoud(v.ding) : v.ding);
  const somMet = (ant: Somstuk): Somstuk[] => [
    p === null ? ant : { t: "getal", n: p },
    { t: "teken", s: v.op },
    q === null ? ant : { t: "getal", n: q },
    { t: "teken", s: "=" },
    { t: "getal", n: eind },
  ];
  const plusMin = v.op === "+" ? "plussom" : "minsom";

  b.nieuw(v.zinnen, { stippelVoor: v.zinnen.length - 1 });
  /* Eerst alleen de tekst, zonder plaatjes en zonder som (zoals Synthesis). */
  await vertelH(b, l);

  await l.zeg(...(v.intro ?? ["Dit verhaal is een beetje anders.", "Denk je dat je het zelf kunt?"]));
  const zelf = await l.kies(["Ja", "Nee"], { weetniet: false });
  let direct = false;
  if (zelf === "Ja") {
    await l.zeg("Mooi.", "Welke som past bij het verhaal?");
    b.opgave();
    const k = await kiesH(b, l, b.zonderAanwijzen ? v.somKeuzes : schud(v.somKeuzes), { som: true, wijsSleutel: "sommen", wijs: ["Tik op de som die past."], goed: v.goedeSom });
    if (k === v.goedeSom) direct = true;
    else if (k === null) await l.zeg("Geen zorgen.", "We doen het samen stap voor stap.");
    else {
      b.fout();
      await l.zeg(`${somTekst(String(k))}?`, "Niet helemaal.", "Zullen we het samen stap voor stap doen?");
    }
  } else {
    await l.zeg("Zulke sommen zijn in het begin lastig.", "We doen het samen stap voor stap.");
  }

  if (!direct) {
    /* De lege som schuift onderaan in beeld (open strepen, geen vakjes). */
    b.zet({ som: [{ t: "leeg" }, { t: "leeg", smal: true }, { t: "leeg" }, { t: "teken", s: "=" }, { t: "leeg" }] });
    speelLesgeluid("schuif");

    /* Erbij of eraf; niet goed = Bliepo maakt de zin over de verandering groen en stelt een makkelijkere vraag. */
    b.opgave();
    await l.zeg("Eerst: is dit een plussom of een minsom?");
    const k = await erbijErafH(b, l, v.op);
    if (k === (v.op === "+" ? "Erbij" : "Eraf")) {
      speelLesgeluid("goed");
      b.somDeel(1, { t: "teken", s: v.op });
      await l.zeg("Precies.", `Het is een ${plusMin}.`, v.waarom);
    } else {
      if (k !== null) b.fout();
      b.zet({ groeneZin: v.veranderZin });
      speelLesgeluid("markeer");
      await l.zeg(...v.groterKleiner.vraag);
      const k2 = await l.kies(v.groterKleiner.opties);
      speelLesgeluid("goed");
      b.somDeel(1, { t: "teken", s: v.op });
      await l.zeg(k2 === v.groterKleiner.opties[0] ? "Precies." : "Kijk naar de groene zin.", ...v.groterKleiner.goed);
      b.zet({ groeneZin: null });
    }
    await verderH(b, l);

    /* Het begin, de verandering en het eind, één voor één. */
    const nietZo = v.nietZo ?? ["Maar we *begonnen* niet met zoveel.", `Maar zoveel ${v.ding} kwamen er niet bij.`, "Maar zoveel zijn het er niet."];
    const welWeten = v.welWeten ?? ["Want hoe het begon, weten we *wel*.", "Want hoeveel erbij kwamen, weten we *wel*.", "Want hoeveel het er nu zijn, weten we *wel*."];
    for (let j = 0; j < 3; j++) {
      const goed = v.delen[j];
      b.opgave();
      await l.zeg(j === 0 ? "Denk hier goed over na." : "", v.vragen[j]);
      let knop = WEET_NIET;
      for (let poging = 1; ; poging++) {
        const keuze = await kiesH(b, l, [...getallen, knop], { weetNiet: false, goed: goed ?? knop, wijsSleutel: "nognietweten" });
        const isGoed = goed === null ? keuze === knop : keuze === goed;
        if (isGoed) {
          b.zet({ groeneZin: null });
          speelLesgeluid("goed");
          if (goed === null) {
            /* Een crème "?": de kleur komt pas als de som af is. */
            b.somDeel(somPlek[j], { t: "vraag" });
            if (knop === EEN_PAAR) {
              await l.zeg("Ja, precies.", "Het zijn er *een paar*.", "Maar we weten nog niet precies hoeveel.");
              await verderH(b, l);
            } else await l.zeg("Klopt.", "Dat weten we nog niet.");
          } else {
            b.somDeel(somPlek[j], { t: "getal", n: goed });
            await l.zeg(`Precies, {${goed}} ${ding(goed)}.`);
          }
          break;
        }
        if (poging >= 2) {
          /* Nog eens niet goed: Bliepo zet het erin en zegt waarom. */
          b.zet({ groeneZin: null });
          if (goed === null) {
            b.somDeel(somPlek[j], { t: "vraag" });
            await l.zeg("Kijk, hier staan *een paar*.", "Dat weten we nog niet.");
          } else {
            b.somDeel(somPlek[j], { t: "getal", n: goed });
            await l.zeg(`Kijk, het is {${goed}}.`, v.betekenis[goed] ?? "");
          }
          break;
        }
        b.fout();
        if (goed === null && typeof keuze === "number") {
          await l.zeg(`{${keuze}} ${ding(keuze)}?`, "Ah, ik zie wat je denkt.", nietZo[j]);
          await verderH(b, l);
          knop = EEN_PAAR;
        } else if (goed !== null && keuze === WEET_NIET) {
          await l.zeg("Ah, ik zie waarom je dat kiest.", "Maar deze vraag is anders.", welWeten[j]);
          await verderH(b, l);
        } else {
          await l.zeg(`{${String(keuze)}} ${ding(Number(keuze))}? Niet helemaal.`);
        }
        /* Bliepo maakt zelf de zin groen die helpt. */
        b.zet({ groeneZin: j });
        speelLesgeluid("markeer");
        await l.zeg("Kijk naar de zin die ik groen heb gemaakt.", v.vragen[j]);
      }
    }
    /* De som is af: nu krijgt het "?" zijn kleur (blauw vooraan, groen in het midden). */
    b.somDeel(somPlek[onbekend], { t: "vraag", kleur });
    await l.zeg("We hebben de som gebouwd.", v.rekenVraagBouw ?? v.rekenVraag);
  } else {
    /* Ja + goede som: nog geen som onderaan (zoals Synthesis). */
    await l.zeg(`Precies, ${somTekst(v.goedeSom)}.`, v.rekenVraag);
  }

  /* Rekenen: cijfertegels 1–9 en "Weet ik niet". */
  b.opgave();
  let x = await kiesH(b, l, TEGELS, { goed: antwoord, tegels: true });
  if (direct && x !== antwoord && x !== null) {
    /* 1× fout zonder hulp: een korte hint, dan nog één keer. */
    b.fout();
    await l.zeg(`{${Number(x)}}? Ik tel er ${Number(x) > antwoord ? "minder" : "meer"}.`);
    await l.zeg("Probeer het nog één keer.", v.rekenVraag);
    x = await kiesH(b, l, TEGELS, { goed: antwoord, tegels: true });
  }
  if (x === antwoord) {
    b.goed();
    speelLesgeluid("goed");
    b.zet({ som: somMet({ t: "getal", n: antwoord }), somActief: null });
  } else {
    /* Hulp: het verhaal verdwijnt, alleen de som blijft (met een crème "?"), en we rekenen terug met de plaatjes. */
    if (x !== null) b.fout();
    await l.zeg(x === null ? "Dat is oké." : `{${Number(x)}}?`, `Laten we naar ${v.hulpNaar ?? `de ${v.ding}`} kijken.`);
    b.zet({ zinnen: [], zichtbaar: 0, stippelVoor: null, som: somMet({ t: "vraag" }), somActief: null });
    await l.wacht(400);
    if (onbekend === 0) {
      const totaal = v.soort === "munt" ? 20 : Math.max(10, eind);
      const alleen = Array.from({ length: q ?? 0 }, (_, i) => eind - (q ?? 0) + i);
      b.zetStand(v.soort, plekken(eind, totaal - eind), v.soort === "pot" ? "eigen" : leeg, { rij: v.rij, bloeit: true });
      /* Bij de hulp geen grenslijn tussen de bloemen (Synthesis); 0 = geen lijn. */
      b.zet({ scheidingNa: 0 });
      speelLesgeluid("schuif");
      await l.zeg("Kijk, dit is ons totaal.", `Er zijn er {${eind}}.`, `Haal de {${q}} weg die erbij kwamen.`);
      await naspelenS(b, l, q ?? 0, "weg", true, { alleen });
      await l.zeg("Perfect.", "Dit is wat we in het [[b:begin]] hadden.", `Hoeveel ${v.ding} zijn het?`);
    } else {
      b.zetStand(v.soort, plekken(p ?? 0, 0), leeg, { rij: v.rij });
      speelLesgeluid("schuif");
      await l.zeg(`We begonnen met deze {${p}} ${ding(p ?? 0)}.`, ...(v.uitTot ?? [`Haal er een paar weg tot er nog {${eind}} zijn.`]));
      await uitTotS(b, l, eind);
      await l.zeg(...(v.uitKlaar ?? ["Goed zo.", `Nu zijn er nog {${eind}}.`, "Kijk goed.", `Hoeveel ${v.ding} haalde je weg?`]));
    }
    const y = await kiesH(b, l, TEGELS, { goed: antwoord, tegels: true });
    if (y === antwoord) {
      b.goed();
      speelLesgeluid("goed");
    } else await l.zeg(`Kijk, het zijn er {${antwoord}}.`);
    b.zet({ som: somMet({ t: "getal", n: antwoord }) });
  }
  await l.zeg(v.antwoordZin, "De som ziet er goed uit.", "Maar we controleren hem even.");
  await verderH(b, l);

  /* De controle: het verhaal verdwijnt, de plaatjes in de beginstand, en het kind speelt het verhaal vooruit na. */
  b.zet({ zinnen: [], zichtbaar: 0, stippelVoor: null });
  if (onbekend === 0) {
    const totaal = v.soort === "munt" ? 20 : Math.max(10, eind);
    b.zetStand(v.soort, plekken(antwoord, totaal - antwoord), v.soort === "pot" ? "eigen" : leeg, { rij: v.rij, bloeit: true });
    /* Bij de bloemen een stippellijn: links wat er in het begin stond, rechts wat erbij komt. */
    if (v.soort === "pot") b.zet({ scheidingNa: antwoord });
    speelLesgeluid("schuif");
    await l.zeg(v.beginZin ? v.beginZin.replace("N", String(antwoord)) : `We begonnen met {${antwoord}} ${ding(antwoord)}.`, v.erbijZin ?? `Er kwamen er {${q}} bij.`, "Kun je die er nu bij doen?");
    await naspelenS(b, l, q ?? 0, "erbij");
    b.goed();
    if (v.soort === "pot") b.bloei(true);
    await l.zeg("Kijk eens.", `Er zijn nu {${eind}} ${ding(eind)}.`, `{${antwoord}} + {${q}} = {${eind}}.`);
  } else {
    b.zetStand(v.soort, plekken(p ?? 0, 0), leeg, { rij: v.rij });
    speelLesgeluid("schuif");
    /* Synthesis: "There are 20 lights. I turned 7 off." De lampen branden dan allemaal, dus "Er zijn" (niet "Er waren"). */
    await l.zeg(v.soort === "lamp" ? `Er zijn {${p}} ${ding(p ?? 0)}.` : `Er waren {${p}} ${ding(p ?? 0)}.`, v.soort === "lamp" ? `Ik doe er {${antwoord}} uit.` : `Er gingen er {${antwoord}} weg.`, v.soort === "lamp" ? "Kun je die nu uitdoen?" : "Kun je die nu weghalen?");
    await naspelenS(b, l, antwoord, "weg");
    await omtrekS(b, l);
    b.goed();
    await l.zeg("Kijk eens.", v.soort === "lamp" ? `Er branden nog {${eind}} ${ding(eind)}.` : `Er zijn nog {${eind}} ${ding(eind)}.`, `{${p}} − {${antwoord}} = {${eind}}.`);
  }
  await verderH(b, l);
}

/* ---------- kaarttekeningen (244 × 190), in de Bliepo-stijl ---------- */

const KP = { navy: "#1d2b5e", geel: "#ffc845", koraal: "#f2715e", petrol: "#127c86", warmwit: "#fff7ea", grijs: "#c3c9d8", roze: "#f6a9c8" };

function KaartDing({ vorm, x, y, aan = true, nr = 0 }: { vorm: "ballon" | "lamp" | "munt" | "pot" | "vogel"; x: number; y: number; aan?: boolean; nr?: number }) {
  void nr;
  const kl = vorm === "vogel" ? KP.geel : vorm === "ballon" ? KP.koraal : KP.roze;
  switch (vorm) {
    case "ballon":
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M0 10 Q-4 16 0 22" fill="none" stroke={KP.navy} strokeWidth="2" />
          {aan ? <ellipse cx="0" cy="-2" rx="11" ry="13" fill={kl} stroke={KP.navy} strokeWidth="2.5" /> : <path d="M0 -8 L4 -3 L10 -4 L6 1 L9 7 L3 5 L0 10 L-3 5 L-9 7 L-6 1 L-10 -4 L-4 -3 Z" fill={KP.navy} />}
        </g>
      );
    case "lamp":
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle cx="0" cy="-4" r="12" fill={aan ? KP.geel : KP.grijs} stroke={KP.navy} strokeWidth="2.5" />
          <rect x="-7" y="7" width="14" height="8" rx="2" fill="#8a93ab" stroke={KP.navy} strokeWidth="2" />
        </g>
      );
    case "munt":
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle cx="0" cy="0" r="13" fill={aan ? KP.geel : KP.grijs} stroke={KP.navy} strokeWidth="2.5" />
          <circle cx="0" cy="0" r="8" fill="none" stroke={aan ? KP.navy : "#8a93ab"} strokeWidth="1.8" />
        </g>
      );
    case "pot":
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M0 2 V-12" stroke={KP.petrol} strokeWidth="3" />
          <circle cx="0" cy="-15" r="7" fill={kl} stroke={KP.navy} strokeWidth="2" />
          <path d="M-9 2 H9 L7 15 H-7 Z" fill={KP.koraal} stroke={KP.navy} strokeWidth="2.5" />
        </g>
      );
    default:
      return (
        <g transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="0" rx="12" ry="9" fill={kl} stroke={KP.navy} strokeWidth="2.5" />
          <path d="M-12 -2 L-19 0 L-12 3 Z" fill={KP.geel} stroke={KP.navy} strokeWidth="1.5" />
          <circle cx="-6" cy="-3" r="1.8" fill={KP.navy} />
        </g>
      );
  }
}

function KaartRijS({ vorm, aantal, uit = 0, y }: { vorm: "ballon" | "lamp" | "munt" | "pot" | "vogel"; aantal: number; uit?: number; y: number }) {
  return (
    <>
      {Array.from({ length: aantal }, (_, i) => (
        <KaartDing key={i} vorm={vorm} x={42 + i * 40} y={y} aan={i < aantal - uit} nr={i} />
      ))}
    </>
  );
}

function KaartToetsS() {
  return (
    <>
      <KaartRijS vorm="lamp" aantal={5} uit={2} y={46} />
      <KaartRijS vorm="pot" aantal={5} y={110} />
    </>
  );
}
function KaartKleinS() {
  return (
    <>
      <KaartRijS vorm="vogel" aantal={5} uit={2} y={70} />
      <KaartSom tekst="7 − 2 = 5" />
    </>
  );
}
function KaartGrootS() {
  return (
    <>
      <KaartRijS vorm="munt" aantal={5} uit={2} y={70} />
      <KaartSom tekst="15 − 7 = 8" />
    </>
  );
}
function KaartVerstoptS() {
  return (
    <>
      <KaartRijS vorm="lamp" aantal={5} y={70} />
      <KaartSom tekst="5 + ? = 12" />
    </>
  );
}

/* ---------- de lessen ---------- */

const instaptoets: Lesdraaiboek = {
  id: "verhaal-instaptoets",
  indeling: "synthesis",
  titel: "Instaptoets: verhaaltjessommen",
  synthesis: "Word Problems · Assessment",
  kaarttekening: KaartToetsS,

  async speel(l) {
    const af = await toetsS(l, kleineVerhalen, verstopteGetallen, {
      lampA: 18,
      lampN: 9,
      lampKeuzes: [8, 9, 10, 18, 26, 27],
      potA: 7,
      potEind: 15,
      sommen: ["7 + 15 = ?", "7 − ? = 15"],
      potKeuzes: [7, 8, 9, 14, 15, 22],
    });
    if (!af) return;
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je hebt lastige verhaaltjessommen opgelost.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const kleineVerhalen: Lesdraaiboek = {
  id: "verhaal-kleine-verhalen",
  indeling: "synthesis",
  titel: "Kleine verhaaltjes",
  synthesis: "Word Problems · Small Problems",
  kaarttekening: KaartKleinS,

  async speel(l) {
    const b = new HBord(l);
    b.zonderAanwijzen = true;

    /* 1. Vogeltjes: 7 − 2. Eerst: heb je hulp nodig? */
    const v1 = vogeltjesWeg(7, 2);
    await l.zeg("We gaan verhaaltjessommen maken.", "Luister goed.");
    await beginS(b, l, v1);
    await l.zeg("Denk je dat je hulp nodig hebt bij deze?");
    const hulp = await l.kies(KANS, { weetniet: false });
    let metHulp = hulp !== "Nee";
    if (hulp === "Nee") metHulp = !(await meteenS(b, l, v1, ["Heel goed.", "Laat maar zien."]));
    else {
      await l.zeg("Geen probleem.", "We kijken stap voor stap naar het verhaal.", "Dan snappen we wat er gevraagd wordt.");
      await pluisUitS(b, l, v1);
    }
    await verderH(b, l);

    /* 2. Bloemen: 5 + 3. Meteen het antwoord; bij "weet ik niet" of een fout de hele route. */
    const v2 = bloemenBij({ a: 5, n: 3, leeg: 5, zin2: "Er komen er nog 3 [bij].", vraag: "Hoeveel bloemen zijn het nu samen?" });
    /* Zoals Synthesis: eerst alleen de plaatjes en de aankondiging, na de pijl het verhaal. */
    b.nieuw([]);
    b.zetPlaatjes(v2.soort, v2.aan, v2.leeg, v2.leegVorm ?? "eigen", { rij: v2.rij, bloeit: false });
    speelLesgeluid("schuif");
    await l.zeg("We hebben een nieuw verhaaltje over bloemen.", "Laten we het samen lezen.");
    await verderH(b, l);
    await beginS(b, l, v2);
    /* Synthesis: ging verhaal 1 met hulp, dan eerst "Weet je het antwoord al?" (Ja/Nee). */
    let direct2 = false;
    if (metHulp) {
      await l.zeg("Weet je het antwoord al?");
      if ((await l.kies(KANS, { weetniet: false })) === "Ja") direct2 = await meteenS(b, l, v2, ["Lees de vraag goed."]);
      else {
        await l.zeg("Geen probleem.", "We doen het verhaal samen stap voor stap.");
        await pluisUitS(b, l, v2);
      }
    } else direct2 = await meteenS(b, l, v2, ["Lees de vraag goed."]);
    /* Synthesis: het omwisselen komt alleen na de hulproute; bij een direct goed antwoord gaat het meteen door. */
    if (!direct2) {
    b.opgave();
    /* Zoals Synthesis: het verhaal (met de gekleurde vraagzin) blijft staan; alleen de som draait om. */
    await l.zeg("Je telde {5} en {3} bij elkaar op.", "Maar als je de getallen omwisselt, krijg je dan nog steeds hetzelfde antwoord?");
    const om = await l.kies(KANS);
    b.zet({ som: somVol(3, "+", 5) });
    speelLesgeluid("naarSom");
    if (om === "Ja") {
      b.goed();
      await l.zeg("Natuurlijk.", "Bij een plussom mag je de getallen omwisselen.", "Het antwoord blijft hetzelfde.");
    } else {
      b.fout();
      await l.zeg("Kijk maar.", "De som is nu {3} plus {5}.", "Hoeveel is dat samen?");
      await kiesTotGoed(b, l, 8, "Tel {3} en {5} bij elkaar op.");
      await l.zeg("Natuurlijk.", "Bij een plussom mag je de getallen omwisselen.", "Het antwoord blijft hetzelfde.");
    }
    }
    await verderH(b, l);

    /* 3. Ballonnen: jij maakt het verhaal. */
    /* Nieuwe stap: het oude verhaal en de som gaan weg; de ballonnen staan al in beeld bij de aankondiging (Synthesis). */
    b.nieuw([]);
    b.zetPlaatjes("ballon", 10, 0, "eigen", { rij: 10 });
    await l.zeg("Oké, bij deze mag *jij* het verhaal maken.");
    await verderH(b, l);
    /* Synthesis: het kind kiest zelf hoeveel ballonnen knappen; na een korte stilte gaat Bliepo verder. */
    await l.zeg("Laat een paar ballonnen knappen.");
    const gekozen = await zelfKiezenS(b, l, "weg", 9, "uit", 2500);
    const geknapt = gekozen.length;
    await l.zeg("Perfect.", "Ik lees jouw verhaal voor.");
    await verderH(b, l);
    const v3 = { ...ballonnenPoppen(l, 10, geknapt), gekozenPlekken: gekozen };
    await beginS(b, l, v3);
    await l.zeg("Wat denk je?", "Kun je dit zelf oplossen?");
    const direct = await l.kies(KANS, { weetniet: false });
    if (direct === "Ja") {
      await l.zeg("Goed.", "Eerst nog iets.", "Welke som zegt wat we moeten doen?");
      await somKiezenS(b, l, v3, { foutSommen: [`10 + ${geknapt}`, `${10 + geknapt} − 10`] });
    } else {
      await l.zeg("Geen probleem.", "We doen het samen stap voor stap.");
      await pluisUitS(b, l, v3);
    }
    await verderH(b, l);

    /* Synthesis: "Wil je afronden? Of nog één, waarin je zelf het verhaal maakt?" (Finish | One more). */
    await l.zeg(l.naam ? `${l.naam}, wil je afronden?` : "Wil je afronden?", "Of nog één verhaaltje dat je zelf maakt?");
    const nogEen = (await kiesH(b, l, ["Afronden", "Nog één"], { goed: "Nog één", weetNiet: false, vinkje: true })) === "Nog één";

    /* 4. Bloemen planten: jij maakt de som. */
    if (nogEen) {
    await zelfMaken(b, l, {
      soort: "pot",
      aan: 3,
      leeg: 7,
      modus: "erbij",
      aantal: 4,
      opening: ["Nog één, en nu met bloemen.", "Er staan er al {3}.", "Plant er nog een paar bij.", "Tik op de lege potjes."],
      klaar: ["Mooi.", "Laten we er een verhaal van maken."],
    });
    const v4 = bloemenBij({ a: 3, n: 4, leeg: 7, zin2: `${Wie(l)} plant er 4 [bij].`, vraag: "Hoeveel bloemen staan er nu in de tuin?" });
    await beginS(b, l, v4);
    await l.zeg("Welke som past bij dit verhaal?");
    /* Geen onmogelijke som (3 − 4) meer tussen de keuzes. */
    await somKiezenS(b, l, v4, { foutSommen: ["4 − 3", "7 − 3"] });
    await verderH(b, l);
    }

    /* Extra oefenvragen van dezelfde soort, oplopend, tot er 15 zijn. */
    await vulAan(b, l, BANK_S10, true, true);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Echt goed gedaan, ${l.naam}.` : "Echt goed gedaan.", "Je snapt de verhaaltjessommen steeds beter.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const groteVerhalen: Lesdraaiboek = {
  id: "verhaal-grote-verhalen",
  indeling: "synthesis",
  titel: "Grotere verhaaltjes",
  synthesis: "Word Problems · Bigger Problems",
  kaarttekening: KaartGrootS,

  async speel(l) {
    const b = new HBord(l);
    b.zonderAanwijzen = true;

    /*
      Gedrag zoals Synthesis Bigger Problems (GEDRAG-V3-grotere-verhaaltjes.md,
      28 okt 2026): geen aankondiging per verhaal; de voorwerpen komen tijdens het
      voorlezen binnen; eerst de som kiezen, dan 4 antwoordknoppen; 2× fout op het
      antwoord = pauze (de les stopt).
    */
    /* 1. Ballonnen: 17 − 9. De ballonnen zweven tijdens het voorlezen van onderen omhoog. */
    const v1 = ballonnenWeg(17, 9, [8, 17, 9, 7]);
    await beginS(b, l, v1, "zweef");
    await l.zeg("Deze verhaaltjes zijn wat lastiger.", "Kun je deze zelf oplossen?");
    if ((await l.kies(KANS, { weetniet: false })) === "Ja") {
      await l.zeg("Goed.", "Eerst nog iets.", "Welke som zegt wat we moeten doen?");
      await somKiezenS(b, l, v1, { foutSommen: ["17 + 9", "26 − 17"], groot: true });
    } else {
      await l.zeg("Dat is oké.", "Laten we het samen stap voor stap doen.");
      await pluisUitS(b, l, v1, { groot: true });
    }
    await verderH(b, l);

    /* 2. Lampen: 20 − 12. De lampen gaan tijdens het voorlezen één voor één aan. */
    const v2 = lampenUit(20, 12, [8, 20, 12, 32], "Ik");
    await beginS(b, l, v2, "aan");
    /* Synthesis: "Think you know this one already?" */
    await l.zeg("Weet je deze al?");
    if ((await l.kies(KANS, { weetniet: false })) === "Ja") {
      await l.zeg("Goed.", "Welke som past bij het verhaal?");
      await somKiezenS(b, l, v2, { foutSommen: ["20 + 12", "32 − 20"], groot: true });
    } else {
      await l.zeg("Dat is oké.", "Laten we het samen stap voor stap doen.");
      await pluisUitS(b, l, v2, { groot: true });
    }
    await verderH(b, l);

    /* 3. Bloemen planten: het kind plant er zelf zoveel bij als het wil (Synthesis: na een korte stilte gaat Bliepo verder). */
    b.nieuw([]);
    b.zetStand("pot", plekken(7, 13), "eigen", { bloeit: true });
    /* Synthesis: de stippellijn staat meteen na de 7 bloemen (grens tussen het begin en wat erbij komt). */
    b.zet({ scheidingNa: 7 });
    speelLesgeluid("schuif");
    await l.zeg("Oké, bij deze mag jij het verhaal maken.");
    await verderH(b, l);
    await l.zeg("Plant er een paar bloemen bij.", "Tik op de lege potjes.");
    const geplant = (await zelfKiezenS(b, l, "erbij", 13, "aan", 2500)).length;
    await l.zeg("Mooi.", `Je plantte er {${geplant}} bij.`, "Laten we er een verhaaltje van maken.");
    await verderH(b, l);
    const v3 = bloemenBij({ a: 7, n: geplant, leeg: 13, zin2: `${Wie(l)} plant er ${geplant} [bij].`, vraag: "Hoeveel bloemen zijn het nu?", keuzes: vierS(7 + geplant, 7, geplant) });
    /* Het verhaal komt boven de bloemen; bij de vraag staan de nieuwe bloemen er weer niet (Bliepo speelt het pas na het goede antwoord na). */
    b.nieuw(v3.zinnen, { plaatjes: b.p.plaatjes, scheidingNa: 7 });
    await vertelH(b, l);
    b.zetPlekken(plekken(7, 13));
    await l.zeg("Welke som past bij dit verhaal?");
    await zelfSomS(b, l, v3, {
      /* Geen onmogelijke som (7 − 13) als het kind meer plantte dan er stonden. */
      foutSommen: [geplant > 7 ? `${geplant} − 7` : `7 − ${geplant}`, `${7 + geplant} − 7`],
      waarom: (som) => (som.includes("−") ? ["Dan gaan er bloemen weg.", "Maar er komen bloemen bij."] : ["Die past niet bij het verhaal."]),
      naspeelHulp: ["Laten we de nieuwe bloemen planten.", `Plant er {${geplant}} in de lege potjes.`],
      telVraag: ["Tel alle bloemen.", "Hoeveel zijn het nu?"],
    });

    /* Afronden, of nog één verhaaltje met munten (Synthesis). */
    await verderH(b, l);
    await l.zeg(l.naam ? `${l.naam}, wil je afronden?` : "Wil je afronden?", "Of nog één verhaaltje, waarin ik je munten geef om uit te geven?");
    const nogEen = (await kiesH(b, l, ["Afronden", "Nog één"], { goed: "Nog één", weetNiet: false, vinkje: true })) === "Nog één";

    /* 4. Munten uitgeven: het kind kiest zelf hoeveel. */
    if (nogEen) {
      const begin: Plekstaat[] = [...Array<Plekstaat>(16).fill("aan"), ...Array<Plekstaat>(4).fill("leeg")];
      b.nieuw([]);
      b.zetStand("munt", begin);
      speelLesgeluid("schuif");
      await l.zeg("Tik op een paar munten om ze uit te geven.");
      const weg = await zelfKiezenS(b, l, "weg", 15, "leeg", 2000);
      const n = weg.length;
      await l.zeg("Mooi.", `Je gaf {${n}} ${mv(n, "munt", "munten")} uit.`, "Ik lees jouw verhaal voor.");
      await verderH(b, l);
      const v4 = muntenUit(l, 16, n, vierS(16 - n, 16, 16 + n));
      /* Bij het voorlezen staan de uitgegeven munten grijs op hun plek; bij de vraag zijn ze weer allemaal goud. */
      b.nieuw(v4.zinnen);
      b.zetStand("munt", begin.map((st, i) => (weg.includes(i) ? "uit" : st)));
      await vertelH(b, l);
      b.zetPlekken(begin);
      /* Korte zin: de vraag van vier regels duwde het knopje "nog eens horen" tegen Bliepo aan. */
      await l.zeg("Eerst nog iets.", "Welke som past bij het verhaal?");
      await zelfSomS(b, l, v4, {
        foutSommen: [`16 + ${n}`, `${16 + n} − 16`],
        waarom: (som) => (som.includes("+") ? ["Dan komen er munten bij.", "Maar je gaf munten uit."] : ["Die past niet bij het verhaal."]),
        naspeelHulp: ["Laten we de munten uitgeven.", `Tik op {${n}} ${mv(n, "munt", "munten")}.`],
        telVraag: ["Tel de munten die er nog zijn.", "Hoeveel zijn het?"],
        naspeelDoel: "leeg",
      });
      await verderH(b, l);
    }

    await vulAan(b, l, BANK_S20, true, false);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Heel goed gedaan, ${l.naam}.` : "Heel goed gedaan.", "Je kunt deze verhaaltjessommen al goed.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const verstopteGetallen: Lesdraaiboek = {
  id: "verhaal-verstopte-getallen",
  indeling: "synthesis",
  titel: "Verstopte getallen",
  synthesis: "Word Problems · Mixed Problems",
  kaarttekening: KaartVerstoptS,

  async speel(l) {
    const b = new HBord(l);
    b.zonderAanwijzen = true;

    /* 1. Bloemen: ? + 5 = 9. */
    await omgekeerdS(b, l, {
      zinnen: ["Er staan _een_ _paar_ _bloemen_ in een tuin.", `${Wie(l)} plant er nog 5 bij.`, "Nu zijn het er samen 9.", "Hoeveel bloemen stonden er eerst?"],
      soort: "pot",
      leeg: "eigen",
      ding: "bloemen",
      delen: [null, 5, 9],
      op: "+",
      veranderZin: 1,
      waarom: "Er komen bloemen bij.",
      groterKleiner: {
        vraag: [`${Wie(l)} plant er bloemen bij.`, "Wordt de tuin dan groter of kleiner?"],
        opties: ["Groter", "Kleiner"],
        goed: ["De tuin wordt groter.", "Dat is een plussom."],
      },
      vragen: ["Met hoeveel bloemen begonnen we?", `Hoeveel bloemen plant ${wie(l)}?`, "Hoeveel bloemen zijn het samen?"],
      betekenis: { 5: "Er komen {5} bloemen bij.", 9: "Er zijn er samen {9}." },
      onbekendKnop: "?",
      rekenVraag: "Hoeveel bloemen stonden er eerst?",
      rekenVraagBouw: "[[b:Hoeveel]] moeten we bij {5} doen om {9} te krijgen?",
      antwoordZin: "Ja, er stonden eerst {4} bloemen.",
      hulpNaar: "de tuin",
      erbijZin: `${Wie(l)} plantte er {5} bij.`,
      somKeuzes: ["? + 5 = 9", "5 + ? = 9", "? − 5 = 9"],
      goedeSom: "? + 5 = 9",
      intro: ["Dit verhaaltje is een beetje anders.", "Kun je het zelf oplossen?"],
    });
    await l.zeg("Goed werk.", "Laten we naar een nieuw verhaaltje kijken.");
    await verderH(b, l);
    /* Zoals Synthesis: tussen de verhalen wordt het scherm helemaal leeg. */
    b.nieuw([]);
    await l.wacht(500);

    /* 2. Lampen: 20 − ? = 13. */
    await omgekeerdS(b, l, {
      zinnen: ["Er branden 20 lampen.", "Ik doe er _een_ _paar_ uit.", "Er branden er nog 13.", "Hoeveel lampen doe ik uit?"],
      soort: "lamp",
      ding: "lampen",
      delen: [20, null, 13],
      op: "−",
      veranderZin: 1,
      waarom: "Ik doe lampen uit.",
      groterKleiner: {
        vraag: ["Ik doe er lampen uit.", "Branden er dan meer of minder lampen?"],
        opties: ["Minder", "Meer"],
        goed: ["Er branden er minder.", "Dat is een minsom."],
      },
      vragen: ["Hoeveel lampen brandden er eerst?", "Hoeveel lampen doe ik uit?", "Hoeveel lampen branden er nog?"],
      betekenis: { 13: "Dat zijn de lampen die nog branden.", 20: "Zoveel lampen brandden er eerst." },
      onbekendKnop: "?",
      rekenVraag: "Hoeveel lampen doe ik uit?",
      rekenVraagBouw: "[[g:Hoeveel]] moeten we van {20} afhalen om {13} over te houden?",
      antwoordZin: "Precies, ik doe er {7} uit.",
      hulpNaar: "de lampen",
      uitTot: ["Doe er een paar uit, tot er nog {13} branden."],
      uitKlaar: ["Goed zo.", "Je deed er een paar uit, en nu branden er nog maar {13}.", "Kijk goed.", "Hoeveel lampen deed je uit?"],
      nietZo: ["Maar we *begonnen* niet met zoveel.", "Maar zoveel lampen doe ik niet uit.", "Maar zoveel branden er niet."],
      welWeten: ["Want hoeveel lampen er eerst brandden, weten we *wel*.", "Want hoeveel lampen ik uitdoe, weten we *wel*.", "Want hoeveel lampen er nog branden, weten we *wel*."],
      somKeuzes: ["20 − ? = 13", "? − 20 = 13", "20 + ? = 13"],
      goedeSom: "20 − ? = 13",
      intro: ["En dit verhaaltje?", "Kun je het zelf oplossen?"],
    });
    await l.zeg(l.naam ? `Je doet het goed, ${l.naam}.` : "Je doet het goed.", "Laten we er nog één doen.");
    await verderH(b, l);
    b.nieuw([]);
    await l.wacht(500);

    /* 3. Munten: ? + 7 = 12. */
    await omgekeerdS(b, l, {
      zinnen: ["Ik heb _een_ _paar_ _munten_.", `${Wie(l)} geeft me er nog 7.`, "Nu heb ik er 12.", "Hoeveel munten had ik eerst?"],
      soort: "munt",
      leeg: "plek",
      ding: "munten",
      delen: [null, 7, 12],
      op: "+",
      veranderZin: 1,
      waarom: "Ik krijg munten erbij.",
      groterKleiner: {
        vraag: ["Ik krijg munten erbij.", "Heb ik dan meer of minder munten?"],
        opties: ["Meer", "Minder"],
        goed: ["Ik heb er meer.", "Dat is een plussom."],
      },
      vragen: ["Hoeveel munten had ik eerst?", "Hoeveel munten kreeg ik erbij?", "Hoeveel munten heb ik nu?"],
      betekenis: { 7: "Zoveel munten kreeg ik erbij.", 12: "Zoveel munten heb ik nu." },
      onbekendKnop: "?",
      rekenVraag: "Hoeveel munten had ik eerst?",
      rekenVraagBouw: "[[b:Hoeveel]] moeten we bij {7} doen om {12} te krijgen?",
      antwoordZin: "Ja, ik had eerst {5} munten.",
      hulpNaar: "de munten",
      erbijZin: `${Wie(l)} gaf me er {7} bij.`,
      /* Het verhaal is in de ik-vorm (Synthesis: "I started with 5 coins"). */
      beginZin: "Ik had eerst {N} munten.",
      somKeuzes: ["? + 7 = 12", "7 + ? = 12", "? − 7 = 12"],
      goedeSom: "? + 7 = 12",
      intro: ["Het laatste verhaaltje.", "Denk je dat je het kunt?"],
    });
    /* Zoals Synthesis: na het laatste verhaal geen "afronden of nog één"; het scherm wordt leeg. */
    b.nieuw([]);

    await vulAan(b, l, BANK_S_VERSTOPT, true, true);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Echt goed gedaan, ${l.naam}.` : "Echt goed gedaan.", "Je vindt de verstopte getallen al.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const eindtoets: Lesdraaiboek = {
  id: "verhaal-eindtoets",
  indeling: "synthesis",
  titel: "Eindtoets: verhaaltjessommen",
  synthesis: "Word Problems · Mastery Check",
  kaarttekening: KaartToetsS,

  async speel(l) {
    const af = await toetsS(l, kleineVerhalen, verstopteGetallen, {
      lampA: 14,
      lampN: 8,
      lampKeuzes: [5, 6, 7, 8, 14, 22],
      potA: 6,
      potEind: 17,
      /* Drie sommen, zoals Synthesis (er stond er maar één foute). */
      sommen: ["6 + 17 = ?", "6 − ? = 17"],
      potKeuzes: [6, 10, 11, 12, 17, 23],
    });
    if (!af) return;
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je hebt lastige verhaaltjessommen opgelost.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_VERHAALTJESSOMMEN: Lesdraaiboek[] = [instaptoets, kleineVerhalen, groteVerhalen, verstopteGetallen, eindtoets, meerVerhaaltjes].map(metVasteKnoppen);
