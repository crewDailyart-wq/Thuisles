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

const instaptoets: Lesdraaiboek = {
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

const kleineVerhalen: Lesdraaiboek = {
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

const groteVerhalen: Lesdraaiboek = {
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

const verstopteGetallen: Lesdraaiboek = {
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

const eindtoets: Lesdraaiboek = {
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

export const LESSEN_VERHAALTJESSOMMEN: Lesdraaiboek[] = [instaptoets, kleineVerhalen, groteVerhalen, verstopteGetallen, eindtoets, meerVerhaaltjes];
