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
import { VerhaalHolo, type HoloSoort, type VerhaalHoloProps } from "../vlakken/verhaal-holo-bord";
import { vierKeuzes } from "../holo/keuzes";

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
const wie = (l: Lesgids) => l.naam || "jij";
const Wie = (l: Lesgids) => l.naam || "Jij";

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
    await l.zeg("Hmm, goed geprobeerd.", "Maar die zin stelt geen vraag.");
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
  await l.zeg(x === null ? "Geen zorgen." : `{${x}}? Niet helemaal.`, "We halen hem samen uit elkaar.");
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
      ? [`Ik blies ${start} ballonnen op.`, `${Wie(l)} liet er ${weg} [knappen].`, "Hoeveel ballonnen zijn er nog over?"]
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
      : ["De som staat klaar.", `Laat {${weg}} ${mv(weg, "ballon", "ballonnen")} wegvliegen.`, `Tik op {${weg}} ${mv(weg, "ballon", "ballonnen")}.`],
    antwoordVraag: "Hoeveel ballonnen zijn er nog over?",
    telTip: "Tel de ballonnen die er nog zijn.",
    antwoordZin: nogOver(over, "ballon", "ballonnen"),
    keuzes,
  };
}

function lampjes(l: Lesgids, start: number, uit: number, keuzes?: number[]): Pluisverhaal {
  const nog = start - uit;
  return {
    zinnen: [`Er zijn ${start} lampjes aan.`, `${Wie(l)} doet er ${uit} [uit].`, "Hoeveel lampjes zijn er nog aan?"],
    soort: "lampje",
    aan: start,
    leeg: 0,
    a: start,
    b: uit,
    op: "−",
    vraagZin: 2,
    watZoeken: "We zoeken hoeveel lampjes er nog aan blijven.",
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
    beginVraag: "Hoeveel lampjes waren er eerst aan?",
    beginAntwoord: [`Er waren eerst {${start}} lampjes aan.`, "Die zetten we vooraan."],
    tweedeVraag: "En welk getal zegt hoeveel er uitgaan?",
    tweedeAntwoord: [uit === 1 ? "Er gaat {1} lampje uit." : `Er gaan {${uit}} lampjes uit.`, `Dus halen we {${uit}} eraf.`],
    naspelen: ["De som staat klaar.", uit === 1 ? "Tik op {1} lampje om het uit te doen." : `Tik op {${uit}} lampjes om ze uit te doen.`],
    antwoordVraag: "Hoeveel lampjes zijn er nog aan?",
    telTip: "Tel de lampjes die nog branden.",
    antwoordZin: nog === 1 ? "Er is nog {1} lampje aan." : `Er zijn nog {${nog}} lampjes aan.`,
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
      if (k === null) await l.zeg("Geen zorgen.", "We halen hem samen uit elkaar.");
      else await l.zeg(`${k.replace(/(\d+)/g, "{$1}")}?`, "Niet helemaal.", "Zullen we hem samen uit elkaar halen?");
    }
  } else {
    await l.zeg("Zulke sommen zijn in het begin lastig.", "We halen hem samen uit elkaar.");
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
    await l.zeg(x === null ? "Geen zorgen." : "Hmm.", "We kijken samen.");
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
      await l.zeg(`Kijk, {${p}} ${v.ding}.`, `Doe ze uit tot er nog {${eind}} aan zijn.`);
      await naspelen(b, l, antwoord, "weg");
      await l.zeg(`Nu zijn er nog {${eind}} aan.`, "Hoeveel heb je er uitgedaan?");
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
    await l.zeg("Kijk eens.", `Er zijn nog {${eind}} ${v.ding} aan.`);
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
  b.nieuw([`Er zijn ${start} lampjes aan.`, `${Wie(l)} doet er ${uit} uit.`, "Hoeveel lampjes zijn er nog aan?"]);
  b.zetPlaatjes("lampje", start, 20 - start);
  await vertel(b, l);
  if (voorDeVraag && !(await voorDeVraag())) return false;
  await l.zeg("Wat denk jij?", "Hoeveel lampjes blijven er aan?");
  for (let poging = 1; ; poging++) {
    const x = await kiesGetal(l, keuzes);
    if (x === nog) {
      await l.zeg("Goed zo.", `Er zijn er nog {${nog}} aan.`);
      break;
    }
    if (x !== null && poging === 1) {
      await l.zeg(`{${x}}?`, Math.abs(x - nog) <= 1 ? "Dat is heel dichtbij." : "Niet helemaal.", "Kijk nog eens.");
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen." : "Niet helemaal.", `Er blijven er {${nog}} aan.`);
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
      await l.zeg("Geen probleem.", "We halen het verhaal uit elkaar.", "Dan snappen we wat er gevraagd wordt.");
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
      await l.zeg("Geen probleem.", "We halen hem samen uit elkaar.");
      await pluisUit(b, l, v2);
    }
    await l.zeg("Je deed dus {5} plus {3}.", "Wissel de getallen nu eens om.", "Krijg je dan hetzelfde antwoord?");
    const om = await l.kies(["Ja", "Nee"]);
    b.zet({ som: [{ t: "getal", n: 3 }, { t: "teken", s: "+" }, { t: "getal", n: 5 }, { t: "teken", s: "=" }, { t: "getal", n: 8 }] });
    if (om === "Ja") await l.zeg("Natuurlijk.", "Bij plussen maakt de volgorde niet uit.", "Het antwoord blijft {8}.");
    else await l.zeg("Kijk maar.", "{3} + {5} is ook {8}.", "Bij plussen maakt de volgorde niet uit.");
    await l.verder();

    /* 3. Zelf een verhaal maken: ballonnen laten knappen. */
    b.nieuw([]);
    b.zetPlaatjes("ballon", 10, 0);
    await l.zeg("Nu ben jij de baas over het verhaal.", "Laat een paar ballonnen knappen.", "Tik op het vinkje als je klaar bent.");
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
        if (k === `10 + ${knal}`) await l.zeg("Erbij past niet.", "Er knappen ballonnen.", "Dan gaan er ballonnen weg.");
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
      await l.zeg("Geen probleem.", "We halen hem samen uit elkaar.");
      await pluisUit(b, l, v3);
    }

    await l.zeg(l.naam ? `${l.naam}, wil je afronden?` : "Wil je afronden?", "Of nog één, waarbij je zelf de som bouwt?");
    const nog = await l.kies(["Afronden", "Nog één"]);
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
      await l.zeg("Dat is oké.", "We halen dit verhaal samen uit elkaar.");
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
      await l.zeg("Dat is oké.", "We halen hem samen uit elkaar.");
      await pluisUit(b, l, v2);
    }
    await l.verder();

    /* 3. Zelf bloemen planten; nu meteen de som kiezen. */
    b.nieuw([]);
    b.zetPlaatjes("bloem", 7, 13);
    await l.zeg("Nu ben jij de baas over de som.", "Er staan al {7} bloemen.", "Plant er nog wat bij.", "Tik op het vinkje als je klaar bent.");
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
      await l.zeg(x === null ? "Geen zorgen." : `{${x}} bloemen? Niet helemaal.`, "We planten de nieuwe bloemen.", `Plant {${plant}} ${mv(plant, "bloem", "bloemen")} in de lege potjes.`);
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

    await l.zeg(l.naam ? `${l.naam}, wil je afronden?` : "Wil je afronden?", "Of nog één verhaal met knikkers?");
    const nog = await l.kies(["Afronden", "Nog één"]);
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
      zinnen: ["Er staan _wat_ _bloemen_ in de tuin.", `${Wie(l)} plantte er nog 5 bij.`, "Nu zijn het er samen 9.", "Hoeveel bloemen stonden er eerst?"],
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
      onbekendKnop: "Wat bloemen",
      rekenVraag: "Hoeveel plus {5} is {9}?",
      antwoordZin: "Ja, er stonden eerst {4} bloemen.",
      somKeuzes: ["? + 5 = 9", "5 + ? = 9", "? − 5 = 9"],
      goedeSom: "? + 5 = 9",
    });

    /* 2. Lampjes: 20 − ? = 13. */
    await l.zeg("Goed zo.", "We kijken naar een nieuw verhaal.");
    await omgekeerd(b, l, {
      zinnen: ["Er zijn 20 lampjes aan.", `${Wie(l)} doet er _een_ _paar_ uit.`, "Nu zijn er nog 13 aan.", `Hoeveel lampjes deed ${wie(l)} uit?`],
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
      vragen: ["Hoeveel lampjes waren er in het begin aan?", "Hoeveel lampjes gingen uit?", "Hoeveel zijn er nog aan?"],
      betekenis: { 13: "Dat zijn de lampjes die nog aan zijn.", 20: "Zoveel lampjes waren er in het begin." },
      onbekendKnop: "Een paar",
      rekenVraag: "{20} min hoeveel is {13}?",
      antwoordZin: "Precies, er gingen {7} lampjes uit.",
      somKeuzes: ["20 − ? = 13", "? − 20 = 13", "20 + ? = 13"],
      goedeSom: "20 − ? = 13",
    });

    /* 3. Knikkers: ? + 7 = 12. */
    await l.zeg(l.naam ? `Je doet het goed, ${l.naam}.` : "Je doet het goed.", "Nog één.", "Dit is het laatste verhaal.");
    await omgekeerd(b, l, {
      zinnen: ["Tim heeft _wat_ _knikkers_.", `${Wie(l)} geeft hem er nog 7.`, "Nu heeft Tim er 12.", "Met hoeveel knikkers begon Tim?"],
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
      onbekendKnop: "Wat knikkers",
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
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}.` : "Goed gedaan.", "Wil je nog één verhaal over koekjes?", "Of zullen we afronden?");
    const nog = await l.kies(["Nog één", "Afronden"]);
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
        await l.zeg(k === null ? "Geen zorgen." : "Niet helemaal.", "We halen hem samen uit elkaar.");
        await pluisUit(b, l, v4, { levend: true });
      }
      await l.verder();
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je lost deze verhaaltjes vlot op.", "Tik op de kaart om hem af te vinken.");
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

/** Houdt bij wat er in het hologramvlak staat, en hoeveel opgaven het kind al deed. */
class HBord {
  p: VerhaalHoloProps = { zinnen: [], zichtbaar: 0 };
  /** Knoppen die Bliepo al eens heeft aangewezen. */
  gewezen = new Set<string>();
  /** Aantal opgaven in deze les (vaste regel: minstens 15). */
  opgaven = 0;
  /** Korte verhaaltjes die later in de les terugkomen (2× fout of "weet ik niet"). */
  later: Kort[] = [];
  constructor(private l: Lesgids) {
    l.vlak(VerhaalHolo, this.p);
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
      ...extra,
    };
    this.p = { ...leeg, golfNr: this.p.golfNr, schudNr: this.p.schudNr };
    this.l.pasVlakAan<VerhaalHoloProps>(leeg);
  }
  somDeel(i: number, d: Somstuk) {
    this.zet({ som: (this.p.som ?? []).map((x, j) => (j === i ? d : x)) });
  }
  zetPlaatjes(soort: HoloSoort, aan: number, uit: number, leeg: "plek" | "eigen" = "eigen") {
    this.zet({ plaatjes: { soort, plekken: plekken(aan, uit), leeg }, geteld: [], tel: null });
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
  }
}

/** Bliepo wijst een knop één keer per les aan. */
async function wijsEenKeer(b: HBord, l: Lesgids, knop: string, ...zinnen: string[]) {
  if (b.gewezen.has(knop)) return;
  b.gewezen.add(knop);
  await l.wijsAan(knop, ...zinnen);
}

/** Het verhaal voorlezen; de zinnen verschijnen één voor één. */
async function vertelH(b: HBord, l: Lesgids) {
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
  o: { uit?: (number | string)[]; som?: boolean; weetNiet?: boolean; wijs?: string[]; wijsSleutel?: string; goed?: number | string } = {},
): Promise<number | string | null> {
  const weetNiet = o.weetNiet !== false;
  /* Voor de automatische test: welke knop nu goed is (zoals bij de flitskaarten). */
  window.__phaser = { ...window.__phaser, antwoord: o.goed ?? null };
  b.zet({ keuzes: { opties, uit: o.uit ?? [], som: o.som }, weetNiet });
  const p = l.wachtOpVlak<{ soort: string; waarde?: number | string }>(["keuze", "weetniet"]);
  /* Na een tik meteen weg, ook als Bliepo de knoppen nog aanwijst. */
  void p.then(() => b.zet({ keuzes: null, weetNiet: false }));
  const sleutel = o.wijsSleutel ?? "keuzes";
  if (!b.gewezen.has(sleutel)) {
    b.gewezen.add(sleutel);
    await l.wijsAan("keuzes", ...(o.wijs ?? ["Tik op het goede getal."]));
  }
  if (weetNiet) await wijsEenKeer(b, l, "weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
  const g = await p;
  b.zet({ keuzes: null, weetNiet: false });
  return g.soort === "weetniet" ? null : (g.waarde ?? null);
}

async function kiesGetalH(b: HBord, l: Lesgids, opties: number[], uit: number[] = [], goed?: number): Promise<number | null> {
  const k = await kiesH(b, l, opties, { uit, goed });
  return k === null ? null : Number(k);
}

/** Erbij of eraf, met een plus- en een minknop (groep 3 leest nog niet). */
async function erbijErafH(b: HBord, l: Lesgids, op: "+" | "−"): Promise<"Erbij" | "Eraf" | null> {
  const k = await kiesH(b, l, ["+", "−"], {
    goed: op,
    wijsSleutel: "plusmin",
    wijs: ["Komt er iets bij?", "Tik dan op de plus.", "Gaat er iets af?", "Tik dan op de min."],
  });
  return k === null ? null : k === "+" ? "Erbij" : "Eraf";
}

/** De pijl om verder te gaan; de eerste keer wijst Bliepo hem aan. */
async function verderH(b: HBord, l: Lesgids) {
  const p = l.verder();
  await wijsEenKeer(b, l, "verder", "Tik op de pijl.", "Dan gaan we verder.");
  await p;
}

/** Wachten op een tik in het verhaal (of "Weet ik niet"); `hulp` zegt Bliepo als het kind na een tijdje niets doet. */
async function wachtTikH(b: HBord, l: Lesgids, tik: "getal" | "zin" | "woord", hulp?: string[]): Promise<Vlakgebeurtenis> {
  b.zet({ tik, weetNiet: true });
  const p = l.wachtOpVlak(["getal", "zin", "woord", "weetniet"]);
  await wijsEenKeer(b, l, "weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
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
  for (let k = van + stap; stap > 0 ? k <= tot : k >= tot; k += stap) {
    b.zetPlekken(plekken(k, totaal - k));
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
async function kortH(b: HBord, l: Lesgids, k: Kort, magLater = true) {
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
  const keuzes = keuzesMet(antwoord, opgeteld);
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
      await l.zeg("We komen hier later nog op terug.");
      b.later.push(k);
    }
    break;
  }
  await verderH(b, l);
  b.zet({ geteld: [] });
}

/** Korte verhaaltjes tot er minstens 15 opgaven zijn; daarna komt terug wat nog lastig was. */
async function vulAan(b: HBord, l: Lesgids, bank: Kort[]) {
  const lijst = schud(bank);
  if (b.opgaven < 15) await l.zeg("We oefenen nog een paar korte verhaaltjes.", "Luister goed.");
  for (let i = 0; b.opgaven < 15 && i < lijst.length; i++) await kortH(b, l, lijst[i]);
  const terug = b.later.splice(0);
  for (const k of terug) {
    await l.zeg("Deze kwam net al langs.", "Weet je het nu?");
    await kortH(b, l, k, false);
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
      await l.zeg("We komen hier later nog op terug.");
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
  if (x === null) await l.zeg("Geen probleem.", "We halen hem samen uit elkaar.");
  else {
    b.fout();
    if (x === opgeteld) await l.zeg(`{${x}}?`, "Ah, ik zie wat je denkt.", "Het lijkt alsof je ze hebt opgeteld.", "We halen hem samen uit elkaar.");
    else await l.zeg(`{${x}}? Niet helemaal.`, "We halen hem samen uit elkaar.");
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
async function toetsVraag(b: HBord, l: Lesgids, opties: (number | string)[], goed: number | string, som = false): Promise<boolean> {
  b.opgave();
  let uit: (number | string)[] = [];
  for (let poging = 1; poging <= 2; poging++) {
    const x = await kiesH(b, l, opties, { uit, som, goed, wijsSleutel: som ? "sommen" : "keuzes", wijs: som ? ["Tik op de som die past."] : undefined });
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
  await l.zeg("Dat is 'm.", `Er branden er nog {${nog}}.`);
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
  kortMin("lichtje", ["Er zweven 6 lichtjes.", "Er zweven er 2 weg.", "Hoeveel lichtjes zijn er nog?"], 6, 2, "lichtjes", "Hoeveel lichtjes zijn er nog?", "Tel de lichtjes die er nog zijn.", "Er zijn nog {4} lichtjes."),
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
  kortMin("lichtje", ["Er zweven 13 lichtjes.", "Er zweven er 5 weg.", "Hoeveel lichtjes zijn er nog?"], 13, 5, "lichtjes", "Hoeveel lichtjes zijn er nog?", "Tel de lichtjes die er nog zijn.", "Er zijn nog {8} lichtjes."),
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
  vers("bloem", ["Er staan wat bloemen in de tuin.", "Bliepo plant er 4 bij.", "Nu zijn het er 10.", "Hoeveel bloemen stonden er eerst?"], 6, 4, "+", 0, "Tel de bloemen die er eerst stonden.", "Er stonden eerst {6} bloemen.", "plek"),
  vers("lantaarn", ["Er branden 15 lantaarntjes.", "Bliepo doet er een paar uit.", "Nu branden er nog 9.", "Hoeveel lantaarntjes deed Bliepo uit?"], 15, 6, "−", 2, "Tel de lantaarntjes die uit zijn.", "Bliepo deed er {6} uit."),
  vers("vuurvlieg", ["Er zweven 8 vuurvliegjes.", "Er komen er nog wat bij.", "Nu zijn het er 13.", "Hoeveel vuurvliegjes kwamen erbij?"], 8, 5, "+", 2, "Tel de vuurvliegjes die erbij kwamen.", "Er kwamen {5} vuurvliegjes bij."),
  vers("paddenstoel", ["Er gloeien wat paddenstoelen.", "Er gaan er nog 6 gloeien.", "Nu gloeien er 14.", "Hoeveel paddenstoelen gloeiden er eerst?"], 8, 6, "+", 0, "Tel de paddenstoelen die eerst gloeiden.", "Er gloeiden eerst {8} paddenstoelen."),
  vers("lichtje", ["Er zweven wat lichtjes.", "Er zweven er 5 weg.", "Nu zijn er nog 7.", "Hoeveel lichtjes waren er eerst?"], 12, 5, "−", 0, "Tel alle lichtjes.", "Er waren eerst {12} lichtjes."),
  vers("vuurvlieg", ["Er zweven 18 vuurvliegjes.", "Er vliegen er een paar weg.", "Nu zijn er nog 10.", "Hoeveel vuurvliegjes vlogen er weg?"], 18, 8, "−", 2, "Tel de plekjes waar een vuurvliegje was.", "Er vlogen {8} vuurvliegjes weg."),
  vers("bloem", ["Er staan 9 bloemen in de tuin.", "Bliepo plant er nog wat bij.", "Nu zijn het er 16.", "Hoeveel bloemen plantte Bliepo?"], 9, 7, "+", 2, "Tel de bloemen die erbij kwamen.", "Bliepo plantte er {7}.", "plek"),
  vers("lantaarn", ["Er branden wat lantaarntjes.", "Bliepo doet er nog 3 aan.", "Nu branden er 11.", "Hoeveel lantaarntjes brandden er eerst?"], 8, 3, "+", 0, "Tel de lantaarntjes die eerst brandden.", "Er brandden eerst {8} lantaarntjes."),
  vers("paddenstoel", ["Er gloeien 17 paddenstoelen.", "Er gaan er een paar uit.", "Nu gloeien er nog 8.", "Hoeveel paddenstoelen gingen er uit?"], 17, 9, "−", 2, "Tel de paddenstoelen die uit zijn.", "Er gingen {9} paddenstoelen uit."),
  vers("lichtje", ["Er zweven 5 lichtjes.", "Bliepo tovert er nog wat bij.", "Nu zijn het er 12.", "Hoeveel lichtjes toverde Bliepo erbij?"], 5, 7, "+", 2, "Tel de lichtjes die erbij kwamen.", "Bliepo toverde er {7} bij."),
  vers("vuurvlieg", ["Er zweven wat vuurvliegjes.", "Er komen er nog 7 bij.", "Nu zijn het er 15.", "Hoeveel vuurvliegjes waren er eerst?"], 8, 7, "+", 0, "Tel de vuurvliegjes die er eerst waren.", "Er waren eerst {8} vuurvliegjes."),
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

  await l.zeg("Dit verhaal is een beetje door elkaar.", "Denk je dat je het zelf kunt?");
  const zelf = await l.kies(["Ja", "Nee"]);
  let gebouwd = false;
  if (zelf === "Ja") {
    await l.zeg("Mooi.", "Welke som past bij het verhaal?");
    b.opgave();
    const k = await kiesH(b, l, schud(v.somKeuzes), { som: true, wijsSleutel: "sommen", wijs: ["Tik op de som die past."], goed: v.goedeSom });
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
    } else if (k === null) await l.zeg("Geen zorgen.", "We halen hem samen uit elkaar.");
    else {
      b.fout();
      await l.zeg(`${String(k).replace(/(\d+)/g, "{$1}")}?`, "Niet helemaal.", "Zullen we hem samen uit elkaar halen?");
    }
  } else {
    await l.zeg("Zulke sommen zijn in het begin lastig.", "We halen hem samen uit elkaar.");
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
    await l.zeg(x === null ? "Geen zorgen." : "Hmm.", "We kijken samen.");
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

const instaptoets: Lesdraaiboek = {
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

const kleineVerhalen: Lesdraaiboek = {
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
      await l.zeg("Geen probleem.", "We halen het verhaal uit elkaar.", "Dan snappen we wat er gevraagd wordt.");
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
      await l.zeg("Geen probleem.", "We halen hem samen uit elkaar.");
      await pluisUitH(b, l, v2);
    }
    b.opgave();
    await l.zeg("Je deed dus {5} plus {3}.", "Wissel de getallen nu eens om.", "Krijg je dan hetzelfde antwoord?");
    const om = await l.kies(["Ja", "Nee"]);
    b.zet({ som: somVol(3, "+", 5) });
    if (om === "Ja") {
      b.goed();
      await l.zeg("Natuurlijk.", "Bij plussen maakt de volgorde niet uit.", "Het antwoord blijft {8}.");
    } else await l.zeg("Kijk maar.", "{3} + {5} is ook {8}.", "Bij plussen maakt de volgorde niet uit.");
    await verderH(b, l);

    /* 3. Zelf een verhaal maken: lantaarntjes uitdoen. */
    b.nieuw([]);
    b.zetPlaatjes("lantaarn", 10, 0);
    b.opgave();
    await l.zeg("Nu ben jij de baas over het verhaal.", "Laat een paar lantaarntjes uitgaan.", "Tik op een lantaarntje om het uit te doen.");
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
      await l.zeg("Geen probleem.", "We halen hem samen uit elkaar.");
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

const groteVerhalen: Lesdraaiboek = {
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
      await l.zeg("Dat is oké.", "Laten we hem samen uit elkaar halen.");
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
      await l.zeg("Dat is oké.", "Laten we hem samen uit elkaar halen.");
      await pluisUitH(b, l, v2, { terugLaten: true });
    }
    await verderH(b, l);

    /* 3. Zelf bloemen planten; nu meteen: welke som past? */
    b.nieuw([]);
    b.zetPlaatjes("bloem", 7, 13, "plek");
    b.opgave();
    await l.zeg("Nu ben jij de baas over de som.", "Er staan al {7} bloemen.", "Plant er nog wat bij.", "Tik op de lege plekjes.");
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

const verstopteGetallen: Lesdraaiboek = {
  id: "verhaal-verstopte-getallen",
  titel: "Verstopte getallen",
  synthesis: "Word Problems · Mixed Problems",
  kaarttekening: KaartVerstoptH,

  async speel(l) {
    const b = new HBord(l);

    /* 1. Bloemen: ? + 5 = 9. */
    await omgekeerdH(b, l, {
      zinnen: ["Er staan _wat_ _bloemen_ in de tuin.", `${Wie(l)} plant er nog 5 bij.`, "Nu zijn het er samen 9.", "Hoeveel bloemen stonden er eerst?"],
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
      zinnen: ["Er gloeien _wat_ _paddenstoelen_.", "Er gaan er nog 7 gloeien.", "Nu gloeien er 12.", "Hoeveel paddenstoelen gloeiden er eerst?"],
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

const eindtoets: Lesdraaiboek = {
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

export const LESSEN_VERHAALTJESSOMMEN: Lesdraaiboek[] = [instaptoets, kleineVerhalen, groteVerhalen, verstopteGetallen, eindtoets, meerVerhaaltjes];
