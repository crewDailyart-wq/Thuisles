/**
 * Lessen van het onderdeel "Tellen tot 120" (oktober 2026); zie ../soort.ts.
 *
 * Naar de groep-3-lessen van Synthesis "Count to 120" (INSPIRATIE.md, ronde 1
 * en 2): Assessment, Color Count, The Next 10, Counting On en Mastery Check.
 * Van de groep-4-lessen "Count to 120" en "Counting in 10s" staat alleen het
 * groep-3-deel hier (tweede bouwronde, 10 oktober 2026): het veld tot 50
 * (50 vinden, en wat daar binnen het bereik van groep 3 bij hoort) en een
 * tienergetal aantikken.
 *
 * Vlakken: het kleurenrooster (3 × 7 gekleurde vakken), de tienstroken (2 × 5
 * met getalwoorden) en het gekleurde getallenveld (rijen van 10, elke kolom
 * een eigen kleur).
 *
 * Bij een fout geeft de les eerst een richting of benoemt hij de denkfout
 * ("je zet de 10 en de 1 naast elkaar"), en daarna samen tellen of het
 * antwoord. Het woord "fout" valt nooit. De toetsen geven geen lange uitleg.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KLEURCODE, Kleurrooster, type Kleur, type KleurroosterProps } from "../vlakken/tellen-kleurrooster";
import { Tienstroken, type TienstrokenProps } from "../vlakken/tellen-tienstroken";
import { Getallenveld, KOLOMKLEUR, type GetallenveldProps } from "../vlakken/tellen-getallenveld";
import { GETALWOORD } from "../vlakken/tellen-tienstroken";
import { instaptoetsTellen, kleurenTellen, tellenNa10, getallenSchrijven, doortellen, eindtoetsTellen } from "./tellen-holo";

/* ---------- algemeen ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

const metNaam = (l: Lesgids, zin: string) => (l.naam ? `${zin.replace(/[.!]$/, "")}, ${l.naam}${zin.endsWith("!") ? "!" : "."}` : zin);

/**
 * Iets aantikken in het vlak, met links de knop "Weet ik niet" (een keuze
 * zonder opties). Geeft de melding, of `null` bij "Weet ik niet". Na afloop
 * zegt de les altijd meteen iets, zodat de knop weer verdwijnt.
 */
async function tikOfWeetNiet<G extends { soort: string }>(l: Lesgids, soort: string): Promise<G | null> {
  return Promise.race([l.wachtOpVlak<G & { [k: string]: unknown }>(soort), l.kies([]).then(() => null)]);
}

/* ---------- het kleurenrooster ---------- */

type KR = KleurroosterProps;
const kr = (l: Lesgids, p: Partial<KR>) => l.pasVlakAan<KR>(p);

/** "rode", "gele": de kleur als bijvoeglijk naamwoord. */
const BIJ: Record<Kleur, string> = { rood: "rode", oranje: "oranje", geel: "gele", groen: "groene", blauw: "blauwe", paars: "paarse" };

/** Een rooster van 21 vakken met precies deze aantallen, door elkaar. */
function rooster(aantallen: [Kleur, number][]): Kleur[] {
  const uit: Kleur[] = [];
  for (const [k, n] of aantallen) for (let i = 0; i < n; i++) uit.push(k);
  return schud(uit);
}

/** Aantallen over kleuren verdelen, in willekeurige volgorde. */
function verdeel(kleuren: Kleur[], aantallen: number[]): [Kleur, number][] {
  const a = schud(aantallen);
  return kleuren.map((k, i) => [k, a[i]]);
}

type KleurTik = { soort: "kleur"; kleur: Kleur; index: number };

/** Het kind tikt een vak aan; geeft de kleur. Een kleur uit `niet` telt niet. */
async function kiesKleur(l: Lesgids, niet: Kleur[] = []): Promise<Kleur> {
  for (;;) {
    kr(l, { modus: "kleur" });
    const g = await l.wachtOpVlak<KleurTik>("kleur");
    kr(l, { modus: null });
    if (!niet.includes(g.kleur)) return g.kleur;
    await l.zeg("Kies deze keer een andere kleur.");
  }
}

/**
 * Samen tellen: de andere kleuren worden donker en de vakken van deze kleuren
 * krijgen om de beurt een nummer (in leesvolgorde). Bij de cijfers kleurt het
 * cijfer mee, vanaf 0.
 */
async function telSamen(l: Lesgids, vakjes: (Kleur | null)[], kleuren: Kleur[], opties: { tot?: number; cijfers?: boolean } = {}): Promise<void> {
  const plekken = vakjes.flatMap((k, i) => (k && kleuren.includes(k) ? [i] : []));
  const tot = Math.min(opties.tot ?? plekken.length, plekken.length);
  const kleur = kleuren[0];
  kr(l, { fel: kleuren, nummers: {}, cijferMarkering: opties.cijfers ? { n: 0, kleur } : null });
  await l.wacht(450);
  const nummers: Record<number, number> = {};
  for (let j = 0; j < tot; j++) {
    nummers[plekken[j]] = j + 1;
    kr(l, { nummers: { ...nummers }, ...(opties.cijfers && j + 1 <= 9 ? { cijferMarkering: { n: j + 1, kleur } } : {}) });
    await l.wacht(480);
  }
}

/**
 * "Hoeveel … zijn er?" met de cijfers 0–9 rond het rooster.
 * Te veel → "dan heb je er te veel geteld"; te weinig → samen tellen tot dat
 * getal, er blijven vakken over; de derde keer tellen we alles samen.
 * `samenBijGoed`: ook bij een goed antwoord één keer samen natellen.
 */
async function telVraag(l: Lesgids, vakjes: (Kleur | null)[], kleuren: Kleur[], wat: string, samenBijGoed: boolean): Promise<void> {
  const n = vakjes.filter((k) => k && kleuren.includes(k)).length;
  const kleur = kleuren[0];
  kr(l, { cijfers: true, fel: kleuren, nummers: {}, cijferMarkering: null });
  await l.zeg(`Hoeveel ${wat} zie je?`, "Tel ze en tik op het goede getal.");
  for (let poging = 1; ; poging++) {
    kr(l, { modus: "cijfer" });
    const g = await tikOfWeetNiet<{ soort: "cijfer"; n: number }>(l, "cijfer");
    kr(l, { modus: null });
    if (g === null) {
      await l.zeg("Geen zorgen.", "We tellen ze samen.");
      await telSamen(l, vakjes, kleuren, { cijfers: true });
      await l.zeg(`Het zijn {${n}} ${wat}.`);
      await l.verder();
      break;
    }
    const x = g.n;
    kr(l, { cijferMarkering: { n: x, kleur } });
    if (x === n) {
      if (samenBijGoed) {
        await l.zeg(`{${n}:${kleur}}?`, "We tellen samen, vanaf {0}.");
        await telSamen(l, vakjes, kleuren, { cijfers: true });
        await l.zeg("Zie je wel?", "Je had het precies goed.");
        await l.verder();
      } else {
        await telSamen(l, vakjes, kleuren, { cijfers: true });
        await l.zeg("Precies.", `{${n}} ${wat}.`);
        await l.wacht(500);
      }
      break;
    }
    if (poging >= 3) {
      await l.zeg("We tellen ze samen.");
      await telSamen(l, vakjes, kleuren, { cijfers: true });
      await l.zeg(`Het zijn {${n}} ${wat}.`);
      await l.verder();
      break;
    }
    if (x > n) {
      await l.zeg(`{${x}} ${x === 1 ? wat.replace(/vakjes$/, "vakje") : wat}?`, "Dan heb je er te veel geteld.");
      await l.verder();
    } else {
      await l.zeg(`{${x}} ${x === 1 ? wat.replace(/vakjes$/, "vakje") : wat}?`, "We tellen ze samen.");
      await telSamen(l, vakjes, kleuren, { tot: x, cijfers: true });
      await l.zeg("Ah, er zijn er nog over.", `Dus het zijn er meer dan {${x}${kleuren.length === 1 ? `:${kleur}` : ""}}.`);
      await l.verder();
    }
    kr(l, { nummers: {}, cijferMarkering: null, fel: kleuren });
    await l.zeg("Probeer het nog eens.", `Tel de ${wat} en tik op het getal.`);
  }
  kr(l, { nummers: {}, cijferMarkering: null, cijfers: false });
}

/** "Van welke kleur zijn er …?" Geeft terug of het goed was. */
async function welkeKleur(l: Lesgids, vakjes: Kleur[], doel: Kleur, opties: Kleur[], vraag: string[], naMis: "door" | "laatZien"): Promise<boolean> {
  const n = vakjes.filter((k) => k === doel).length;
  kr(l, { vakjes, fel: null, nummers: {}, cijfers: false });
  await l.zeg(...vraag);
  const keuze = (await l.kies(opties)) as Kleur | null;
  if (keuze === doel) {
    await telSamen(l, vakjes, [doel]);
    await l.zeg("Dat klopt.", `Er zijn {${n}} *${BIJ[doel]}* vakjes.`);
    await l.verder();
    return true;
  }
  if (keuze === null) {
    await l.zeg("Geen zorgen.", `We tellen de *${BIJ[doel]}* samen.`);
    await telSamen(l, vakjes, [doel]);
    await l.zeg(`Er zijn {${n}} *${BIJ[doel]}* vakjes.`);
    await l.verder();
    return false;
  }
  const m = vakjes.filter((k) => k === keuze).length;
  await l.zeg(`{${n}} *${BIJ[keuze]}* vakjes?`, "We tellen ze samen.");
  await telSamen(l, vakjes, [keuze]);
  await l.zeg("Ah.", m === 1 ? `Er is maar {1} *${BIJ[keuze]}* vakje, niet {${n}}.` : `Er zijn {${m}} *${BIJ[keuze]}* vakjes, niet {${n}}.`);
  await l.verder();
  if (naMis === "laatZien") {
    kr(l, { nummers: {} });
    await l.zeg(`Kijk, er zijn {${n}} *${BIJ[doel]}* vakjes.`);
    await telSamen(l, vakjes, [doel]);
    await l.verder();
  }
  return false;
}

/**
 * Zelf inkleuren: tik een vak om het te kleuren, nog eens om het uit te zetten.
 * Met verfpotjes kies je eerst een kleur. `controle` geeft `null` als het
 * klopt, anders wat de mascotte zegt.
 */
async function inkleuren(l: Lesgids, verf: Kleur[], controle: (v: (Kleur | null)[]) => string[] | null): Promise<void> {
  const vakjes: (Kleur | null)[] = Array(21).fill(null);
  let gekozen = verf[0];
  kr(l, { vakjes: [...vakjes], fel: null, nummers: {}, cijfers: false, verf: verf.length > 1 ? verf : null, gekozenVerf: gekozen });
  for (;;) {
    kr(l, { modus: "inkleuren", klaarKnop: true });
    const g = await l.wachtOpVlak<{ soort: string; index?: number; kleur?: Kleur }>(["vakje", "verf", "klaar"]);
    if (g.soort === "vakje" && g.index !== undefined) {
      vakjes[g.index] = vakjes[g.index] === gekozen ? null : gekozen;
      kr(l, { vakjes: [...vakjes] });
    } else if (g.soort === "verf" && g.kleur) {
      gekozen = g.kleur;
      kr(l, { gekozenVerf: gekozen });
    } else if (g.soort === "klaar") {
      kr(l, { modus: null, klaarKnop: false });
      const fout = controle(vakjes);
      if (!fout) return;
      await l.zeg(...fout);
    }
  }
}

/* ---------- de tienstroken ---------- */

type TS = TienstrokenProps;
const ts = (l: Lesgids, p: Partial<TS>) => l.pasVlakAan<TS>(p);
type StrookTik = { soort: "tik"; strook: 1 | 2; gevuld: boolean };

/**
 * Een keuzevraag over een getal. Bij de eerste misser benoemt de les de
 * denkfout en mag het kind het nog eens proberen; daarna (of bij "Weet ik
 * niet") volgt het antwoord.
 */
async function getalVraag(
  l: Lesgids,
  vraag: string[],
  opties: string[],
  goed: string,
  denkfout: (keuze: string) => string[],
  opnieuw: string[],
  antwoord: string[],
): Promise<boolean> {
  /* true = het kind koos zelf het goede getal; false = de les gaf het antwoord. */
  await l.zeg(...vraag);
  for (let poging = 1; ; poging++) {
    const k = await l.kies(opties);
    if (k === goed) return true;
    if (k === null || poging >= 2) {
      await l.zeg(k === null ? "Geen zorgen." : "Ik help je even.", ...antwoord);
      await l.verder();
      return false;
    }
    await l.zeg(...denkfout(k));
    await l.verder();
    await l.zeg("Probeer het nog eens.", ...opnieuw);
  }
}

/** Vier verschillende aantallen rond `n` (0–10), oplopend. */
function rond(n: number): number[] {
  const kandidaten = [n, n - 1, n + 1, n + 2, n - 2, n + 3, n - 3].filter((x) => x >= 0 && x <= 10);
  return [...new Set(kandidaten)].slice(0, 4).sort((a, b) => a - b);
}

/**
 * Na een tijdje niets doen zegt de mascotte vanzelf een hulpzin (zoals bij
 * Synthesis). Geeft een functie die de herinnering stopt. Alleen gebruiken
 * terwijl het kind in het vlak werkt (er staan dan geen knoppen links).
 */
function herinner(l: Lesgids, zinnen: string[], ms = 12000): () => void {
  const klok = setTimeout(() => void l.zeg(...zinnen).catch(() => {}), ms);
  return () => clearTimeout(klok);
}

/** Bouwen in de tweede strook: tik vakken aan of uit tot het getal klopt. */
async function bouw(l: Lesgids, doel: number, staat: { rechts: number }, hulp: string): Promise<void> {
  ts(l, { onderstreept: doel, nummersLinks: false });
  await l.zeg(`Maak het getal {${doel}} in het rooster.`, hulp);
  for (;;) {
    ts(l, { modus: "bouw", klaarKnop: true });
    const stop = herinner(l, ["Kijk naar het tweede rooster.", hulp, "Tik op het vinkje als je klaar bent."]);
    const g = await l.wachtOpVlak<{ soort: string; strook?: number; gevuld?: boolean }>(["tik", "klaar"]);
    stop();
    if (g.soort === "tik") {
      staat.rechts = Math.max(0, Math.min(10, staat.rechts + (g.gevuld ? -1 : 1)));
      ts(l, { rechts: staat.rechts });
      continue;
    }
    ts(l, { modus: null, klaarKnop: false });
    const r = staat.rechts;
    if (10 + r === doel) {
      await l.zeg("Goed zo.", `Dat is {${doel}}.`);
      await l.wacht(600);
      ts(l, { onderstreept: null });
      return;
    }
    /* Samen kijken: eerst de 10, dan de losse, dan welk getal dat is. */
    await l.zeg(`We zoeken het getal {${doel}}.`, "We kijken samen.");
    await l.verder();
    ts(l, { nummersLinks: true });
    await l.zeg("Links zijn er {10}.", "Kijk nu naar de vakjes rechts.", "Hoeveel zijn het er?");
    const k1 = await l.kies(rond(r).map(String));
    await l.zeg(k1 === String(r) ? "Goed." : r === 1 ? "Het is er {1}." : `Het zijn er {${r}}.`, `{10} en nog {${r}}.`, "Welk getal is dat?");
    /* Alleen de vakjes rechts, of één ernaast; groep 3 blijft tot en met 20. */
    const opties = [...new Set([r, 10 + r - 1, 10 + r, 10 + r + 1])].filter((x) => x <= 20).sort((a, b) => a - b).map(String);
    const k2 = await l.kies(opties);
    await l.zeg(k2 === String(10 + r) ? `Goed, {${10 + r}}.` : `Het is {${10 + r}}.`, `Maar we maken het getal {${doel}}.`);
    ts(l, { nummersLinks: false });
    await l.verder();
    await l.zeg(`Maak het getal {${doel}} in het rooster.`, doel > 10 + r ? "Tik op een leeg vakje om het te vullen." : "Tik op een vakje om het weg te halen.");
  }
}

/* ---------- het getallenveld ---------- */

type GV = GetallenveldProps;
const gv = (l: Lesgids, p: Partial<GV>) => l.pasVlakAan<GV>(p);
type VeldTik = { soort: "getal"; n: number };

const rij = (n: number) => {
  const begin = Math.floor((n - 1) / 10) * 10 + 1;
  return Array.from({ length: 10 }, (_, i) => begin + i);
};

async function tikVeld(l: Lesgids): Promise<number | null> {
  gv(l, { actief: true });
  const g = await tikOfWeetNiet<VeldTik>(l, "getal");
  gv(l, { actief: false });
  return g ? g.n : null;
}

/** Wat de les zegt als het kind het verkeerde getal aantikt. */
function zoekFout(x: number, doel: number): string[] {
  const d = x - doel;
  const omgedraaid = x >= 10 && doel >= 10 && String(x).split("").reverse().join("") === String(doel);
  if (Math.abs(d) === 10) return [`Ah, dat is {${x}}.`, `Dat is {10} te ${d < 0 ? "weinig" : "veel"}.`];
  if (Math.abs(d) === 1) return [`Ah, dat is {${x}}.`, "Dat ligt er vlak naast."];
  if (omgedraaid) return [`Hmm, dat is {${x}}.`, `We zoeken {${doel}}.`];
  return [`Dat is {${x}}.`, `We zoeken {${doel}}.`];
}

/**
 * Een getal zoeken in het veld. Eerste misser: zeggen wat het kind aantikte
 * (in de toets kort: "37? Kijk nog eens."). Tweede misser of "Weet ik niet":
 * alleen de goede rij licht op. Daarna laat de les het getal zien.
 */
async function zoekGetal(l: Lesgids, doel: number, opdracht: string[], goed: string[], toets: boolean): Promise<boolean> {
  gv(l, { rand: [], pijl: null, licht: null });
  await l.zeg(...opdracht);
  let hulp = false;
  for (let fout = 0; ; ) {
    const x = await tikVeld(l);
    if (x === doel) {
      gv(l, { rand: [doel], pijl: null, licht: null });
      await l.zeg(...goed);
      return fout === 0 && !hulp;
    }
    if (x !== null) {
      fout++;
      gv(l, { pijl: x });
    }
    if (x !== null && fout === 1 && !hulp) {
      /* Eerste misser: zeggen wat het kind aantikte. */
      await l.zeg(...(toets ? [`{${x}}?`, "Kijk nog eens goed."] : zoekFout(x, doel)));
      gv(l, { pijl: null });
      await l.zeg(toets ? `Zoek het getal {${doel}}.` : "Probeer het nog eens.", `Tik op {${doel}}.`);
      continue;
    }
    if (!hulp) {
      /* Tweede misser of "Weet ik niet": alleen de goede rij licht op. */
      hulp = true;
      gv(l, { pijl: null, licht: rij(doel) });
      await l.zeg(x === null ? "Geen zorgen." : "Ik help je even.", `{${doel}} staat in deze rij.`, `Tik op {${doel}}.`);
      continue;
    }
    gv(l, { pijl: null, licht: null, rand: [doel] });
    await l.zeg(x === null ? "Geen zorgen." : "Kijk eens.", `Hier staat {${doel}}.`);
    await l.verder();
    return false;
  }
}

/** De aanwijzer loopt van `van` naar `naar`; met `hardop` telt de les mee. */
async function loop(l: Lesgids, van: number, naar: number, hardop = false): Promise<void> {
  for (let n = van + 1, k = 1; n <= naar; n++, k++) {
    gv(l, { pijl: n });
    if (hardop) await l.zeg(`{${k}}`);
    else await l.wacht(450);
  }
}

/** "Begin bij …, tel … verder": tik het eindgetal aan (tussenstappen mogen) en het vinkje. */
async function telVerder(l: Lesgids, start: number, n: number, eerste: boolean): Promise<void> {
  const eind = start + n;
  let pijl = start;
  gv(l, { rand: [start], pijl, licht: null });
  await l.zeg(`Begin bij {${start}}.`, `Tel {${n}} verder.`, ...(eerste ? ["Tik op de getallen terwijl je telt.", "Tik dan op het vinkje."] : []));
  for (let fout = 0; ; ) {
    gv(l, { actief: true, klaarKnop: true });
    const g = await l.wachtOpVlak<{ soort: string; n?: number }>(["getal", "klaar"]);
    if (g.soort === "getal" && g.n !== undefined) {
      pijl = g.n;
      gv(l, { pijl });
      continue;
    }
    gv(l, { actief: false, klaarKnop: false });
    if (pijl === eind) {
      await l.zeg("Dat klopt.", `Je begon bij {${start}} en telde {${n}} verder.`, `Je kwam uit op {${eind}}.`);
      await l.verder();
      return;
    }
    if (pijl === start) {
      await l.zeg("Tik op de getallen terwijl je telt.", `Begin bij {${start}} en tel {${n}} verder.`);
      continue;
    }
    fout++;
    if (fout >= 3) {
      pijl = start;
      gv(l, { pijl });
      await l.zeg("We tellen samen.");
      await loop(l, start, eind, true);
      await l.zeg(`Je komt uit op {${eind}}.`);
      await l.verder();
      return;
    }
    if (pijl === eind - 1) {
      /* De klassieke fout: het startgetal meetellen. */
      await l.zeg(`{${pijl}}?`, "Dat is heel dichtbij.", "Maar het is er net één te weinig.");
      await l.verder();
      await l.zeg("Wat was het eerste getal dat je telde?");
      const k = await l.kies([start, start + 1, start + 2].map(String));
      if (k === String(start)) {
        await l.zeg("Daar sta je al.", "Dat getal tel je niet mee.", `Tel je {1} verder, dan kom je op {${start + 1}}.`);
      } else if (k === String(start + 1)) {
        await l.zeg(`Ja, je begint te tellen bij {${start + 1}}.`, "Tel nog eens, één voor één.");
      } else {
        await l.zeg(`Na {${start}} komt eerst {${start + 1}}.`, "Daar begin je te tellen.");
      }
      await l.verder();
    } else if (pijl > eind) {
      await l.zeg(`Je bent op {${pijl}}.`, "Dat is te ver.", "Tel nog eens, één voor één.");
    } else {
      await l.zeg(`Je bent op {${pijl}}.`, "Je moet nog verder tellen.");
    }
    pijl = start;
    gv(l, { pijl });
    await l.zeg(`Begin bij {${start}}.`, `Tel {${n}} verder.`);
  }
}

/** "Hoeveel moet je nog verder tellen tot …?" (typen). */
async function nogTot(l: Lesgids, van: number, tiental: number): Promise<void> {
  const d = tiental - van;
  gv(l, { pijl: van });
  await l.zeg(`Je staat op {${van}}.`, `Hoeveel moet je verder tellen tot {${tiental}}?`);
  for (let fout = 0; ; ) {
    const x = await l.getal();
    if (x === d) {
      gv(l, { pijl: tiental });
      await l.zeg("Ja.", `Van {${van}} naar {${tiental}} tel je {${d}} verder.`);
      await l.verder();
      return;
    }
    if (x === null || fout >= 1) {
      await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
      gv(l, { pijl: van });
      await loop(l, van, tiental, true);
      await l.zeg(`Van {${van}} naar {${tiental}} tel je {${d}} verder.`);
      await l.verder();
      return;
    }
    fout++;
    if (x === d + 1) {
      await l.zeg(`{${x}}?`, `Ik denk dat je {${van}} hebt meegeteld.`);
      gv(l, { pijl: van + 1 });
      await l.zeg(`Je begint te tellen bij {${van + 1}}.`);
      gv(l, { pijl: van });
    } else {
      await l.zeg(`Hmm, {${x}} is te ${x < d ? "weinig" : "veel"}.`, `Tel vanaf {${van + 1}} tot {${tiental}}.`);
    }
    await l.zeg("Probeer het nog eens.", `Je staat op {${van}}.`, `Hoeveel moet je verder tellen tot {${tiental}}?`);
  }
}

/* ---------- de toetsen ---------- */

type Toetsopzet = {
  kleur: Kleur;
  rest: [Kleur, number][];
  aantal: number;
  zoek: number;
  stappen: number;
  opties: number[];
  tien: { start: number; opties: number[]; inleiding: string[] }[];
};

/** Een vraag "tel 10 verder vanaf …" (tot en met 100; nooit keuzes boven de 100). */
async function tienVerder(l: Lesgids, start: number, opties: number[], inleiding: string[]): Promise<void> {
  const eind = start + 10;
  gv(l, { tot: 100, rand: [start], pijl: null, licht: null });
  await l.zeg(...inleiding);
  await l.verder();
  await l.zeg(`Tel vanaf hier {10} verder.`, "Op welk getal kom je?");
  for (let poging = 1; ; poging++) {
    const k = await l.kies(opties.map(String));
    if (k === String(eind)) {
      await l.zeg("Ja.", `{${eind}}.`);
      await l.wacht(600);
      return;
    }
    if (k !== null && poging === 1) {
      await l.zeg(`{${k}}?`, "Kijk nog eens goed.", `Tel {10} verder vanaf {${start}}.`);
      continue;
    }
    /* 10 verder staat recht eronder (het eindgetal blijft tot en met 100). */
    gv(l, { pijl: eind });
    await l.zeg(k === null ? "Geen zorgen." : "Kijk eens.", "{10} verder staat recht eronder.", `Het is {${eind}}.`);
    await l.verder();
    gv(l, { tot: 100, pijl: null });
    return;
  }
}

async function toets(l: Lesgids, o: Toetsopzet, slot: string[]): Promise<void> {
  /* 1. Hoeveel vakjes van één kleur (typen). */
  const vakjes = rooster([[o.kleur, o.aantal], ...o.rest]);
  l.vlak(Kleurrooster, { vakjes });
  await l.zeg("We gaan tellen, tot {100}.", "Eerst kijken we wat je al kunt.");
  await l.verder();
  await l.zeg("Kijk naar dit rooster.", `Hoeveel vakjes zijn *${o.kleur}*?`);
  const x = await l.getal();
  if (x === o.aantal) {
    kr(l, { fel: [o.kleur] });
    await l.zeg("Goed zo.", `{${o.aantal}} *${BIJ[o.kleur]}* vakjes.`);
  } else {
    await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen ze samen.");
    await telSamen(l, vakjes, [o.kleur]);
    await l.zeg(`Het zijn {${o.aantal}} *${BIJ[o.kleur]}* vakjes.`);
  }
  await l.verder();

  /* 2. Een getal zoeken in het veld tot 100. */
  l.vlak(Getallenveld, { tot: 100 });
  await zoekGetal(l, o.zoek, [`Zoek het getal {${o.zoek}}.`, "Tik erop."], ["Ja!", `{${o.zoek}}.`], true);
  await l.verder();

  /* 3. Doortellen vanaf dat getal (kiezen). */
  const eind = o.zoek + o.stappen;
  await l.zeg(`Tel vanaf {${o.zoek}} nog {${o.stappen}} verder.`, "Op welk getal kom je?");
  for (let poging = 1; ; poging++) {
    const k = await l.kies(o.opties.map(String));
    if (k === String(eind)) {
      await l.zeg("Precies.", `{${eind}}.`);
      break;
    }
    if (k !== null && poging === 1) {
      await l.zeg(`{${k}}?`, "Kijk nog eens goed.", `Tel {${o.stappen}} verder vanaf {${o.zoek}}.`);
      continue;
    }
    await l.zeg(k === null ? "Geen zorgen." : "Kijk, ik tel mee.");
    await loop(l, o.zoek, eind);
    await l.zeg(`Je komt op {${eind}}.`);
    break;
  }
  await l.verder();

  /* 4 en 5. Tien verder, tot en met 100. */
  for (const t of o.tien) await tienVerder(l, t.start, t.opties, t.inleiding);

  /* Einde: de kaart. */
  const tik = l.kaart();
  await l.zeg(...slot, "Tik op de kaart om hem af te vinken.");
  await tik;
}

/* ---------- lijntekeningen voor op de kaart ---------- */

function KaartRooster() {
  const kleuren: Kleur[] = ["rood", "oranje", "blauw", "groen", "paars", "geel", "rood", "blauw", "groen", "oranje", "paars", "rood"];
  return (
    <g fill="none" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
      {kleuren.map((k, i) => {
        const x = 30 + (i % 4) * 48;
        const y = 34 + Math.floor(i / 4) * 48;
        return (
          <g key={i} stroke={KLEURCODE[k]}>
            <rect x={x} y={y} width="38" height="38" rx="6" transform={`rotate(${i % 2 ? 2 : -2} ${x + 19} ${y + 19})`} />
            <path d={`M${x + 9} ${y + 27}l8 -8M${x + 17} ${y + 29}l10 -10`} strokeWidth="2.2" />
          </g>
        );
      })}
    </g>
  );
}

function KaartTienstrook() {
  return (
    <g fill="none" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
      {Array.from({ length: 10 }, (_, i) => {
        const x = 46 + (i % 2) * 30;
        const y = 22 + Math.floor(i / 2) * 30;
        return <rect key={i} x={x} y={y} width="26" height="26" rx="4" stroke="#f5c2d3" />;
      })}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={140 + (i % 2) * 30} y={112 - Math.floor(i / 2) * 30} width="26" height="26" rx="4" stroke="#fde01a" />
      ))}
    </g>
  );
}

function KaartDoortellen() {
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <rect x="72" y="45" width="100" height="100" rx="12" stroke={KOLOMKLEUR[5]} strokeWidth="3.4" />
      <text x="122" y="108" textAnchor="middle" fill={KOLOMKLEUR[5]} fontSize="40" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace">
        46
      </text>
      <path d="M112 22h20l-10 13z" stroke="#ffd84a" strokeWidth="3" />
      <path d="M112 168h20l-10 -13z" stroke="#ffd84a" strokeWidth="3" />
    </g>
  );
}

/* ---------- de lessen ---------- */

/** De vorige versie (vóór Phaser, 27 oktober 2026); blijft bewaard (HARDE REGEL 1), staat niet meer in de lijst. */
export const instaptoetsTellenOud: Lesdraaiboek = {
  id: "tellen-120-instaptoets",
  titel: "Instaptoets: tellen tot 100",
  synthesis: "Count to 120 · Assessment",
  kaarttekening: KaartRooster,

  async speel(l) {
    await toets(
      l,
      {
        kleur: "rood",
        aantal: 9,
        rest: [
          ["groen", 6],
          ["blauw", 6],
        ],
        zoek: 73,
        stappen: 8,
        opties: [74, 80, 81, 82],
        tien: [
          { start: 84, opties: [85, 93, 94, 95], inleiding: ["Kijk, nu staat {84} in een rand."] },
          { start: 81, opties: [82, 90, 91, 92], inleiding: ["En deze?", "Nu staat {81} in een rand."] },
        ],
      },
      [metNaam(l, "Je hebt goed laten zien wat je kunt."), "Je kunt al ver tellen."],
    );
  },
};

/** De vorige versie (vóór Phaser, 27 oktober 2026); blijft bewaard (HARDE REGEL 1), staat niet meer in de lijst. */
export const kleurenTellenOud: Lesdraaiboek = {
  id: "tellen-120-kleuren-tellen",
  titel: "Kleuren tellen",
  synthesis: "Count to 120 · Color Count",
  kaarttekening: KaartRooster,

  async speel(l) {
    /* 1. Een lievelingskleur kiezen en tellen. */
    let vakjes: Kleur[] = rooster(verdeel(["rood", "oranje", "paars", "blauw", "geel"], [5, 4, 4, 4, 4]));
    l.vlak(Kleurrooster, { vakjes });
    await l.zeg("Kijk, een *kleurenrooster*.", "Daarmee gaan we tellen.");
    await l.verder();
    await l.zeg("Kies eerst een kleur.", "Tik op je lievelingskleur.");
    const eerste = await kiesKleur(l);
    kr(l, { fel: [eerste] });
    await l.zeg("Oké, mooi.", `We tellen eerst de *${BIJ[eerste]}* vakjes.`);
    await l.verder();
    await telVraag(l, vakjes, [eerste], `*${BIJ[eerste]}* vakjes`, true);

    /* 2. Een grotere groep. */
    const anders = schud((["rood", "oranje", "paars", "blauw", "geel"] as Kleur[]).filter((k) => k !== eerste));
    vakjes = rooster([
      [anders[0], 7],
      [anders[1], 5],
      [eerste, 4],
      [anders[2], 3],
      [anders[3], 2],
    ]);
    kr(l, { vakjes, fel: null, nummers: {}, cijfers: false });
    await l.zeg("Nu proberen we een grotere groep.", "Tik op een andere kleur.");
    const tweede = await kiesKleur(l, [eerste]);
    kr(l, { fel: [tweede] });
    await l.zeg(`Oké, deze keer tellen we de *${BIJ[tweede]}* vakjes.`);
    await l.wacht(400);
    await telVraag(l, vakjes, [tweede], `*${BIJ[tweede]}* vakjes`, false);

    /* 3. Omgekeerd: van welke kleur zijn er 9? */
    vakjes = rooster([
      ["rood", 7],
      ["blauw", 9],
      ["groen", 4],
      ["paars", 1],
    ]);
    const goed9 = await welkeKleur(
      l,
      vakjes,
      "blauw",
      ["rood", "blauw", "groen", "paars"],
      ["Nu doen we het een beetje anders.", "Van welke kleur zijn er {9}?", "Rood, blauw, groen of paars?"],
      "door",
    );
    if (!goed9) await l.zeg("We doen er nog één.");

    /* 4. Nog zo een: van welke kleur zijn er 8? */
    vakjes = rooster([
      ["rood", 6],
      ["groen", 4],
      ["paars", 8],
      ["blauw", 3],
    ]);
    await welkeKleur(l, vakjes, "paars", ["rood", "groen", "paars", "blauw"], ["Probeer deze eens.", "Van welke kleur zijn er {8}?", "Rood, groen, paars of blauw?"], "laatZien");

    /* 5. Twee kleuren samen. */
    const zes: Kleur[] = ["rood", "oranje", "geel", "groen", "blauw", "paars"];
    const verdeling = verdeel(zes, [4, 4, 4, 3, 3, 3]);
    vakjes = rooster(verdeling);
    kr(l, { vakjes, fel: null, nummers: {}, rand: [] });
    await l.zeg(metNaam(l, "Oké."), "Kies nu twee kleuren.", "Tik op een vakje van elke kleur.");
    const a = await kiesKleur(l);
    kr(l, { rand: [a] });
    const b = await kiesKleur(l, [a]);
    kr(l, { rand: [a, b], fel: [a, b] });
    await l.zeg(`Dus deze keer nemen we *${a}* en *${b}*.`);
    await l.wacht(300);
    vakjes = rooster(verdeling);
    kr(l, { vakjes, rand: [] });
    await l.zeg("Ik schud het rooster even.", "We tellen de twee kleuren samen.");
    await telVraag(l, vakjes, [a, b], `*${BIJ[a]}* en *${BIJ[b]}* vakjes`, false);

    /* 6. Zelf inkleuren: 4 paarse vakjes. */
    kr(l, { vakjes: Array(21).fill(null), fel: null, rand: [], nummers: {} });
    await l.zeg("Nu maak je het zelf.", "Maak {4} *paarse* vakjes in het rooster.", "Tik dan op het vinkje.");
    await inkleuren(l, ["paars"], (v) => {
      const n = v.filter((k) => k === "paars").length;
      if (n === 4) return null;
      if (n === 0) return ["Tik op de lege vakjes.", "Dan worden ze paars."];
      if (n > 4) return ["Dat zijn er te veel.", "Tik op een vakje om het weer leeg te maken."];
      return ["Dat zijn er nog te weinig.", `Je hebt er nu {${n}:paars}.`, "Tik op een leeg vakje."];
    });
    await l.zeg("Goed zo.", "{4} *paarse* vakjes.");
    await l.verder();

    /* 7. De laatste uitdaging: 4 rood, 7 blauw, 10 groen. */
    await l.zeg("Nog één laatste opdracht.", "Zullen we meer kleuren gebruiken?");
    await l.verder();
    kr(l, { vakjes: Array(21).fill(null) });
    await l.zeg("Maak {4} *rode* vakjes.", "Maak {7} *blauwe* vakjes.", "En maak {10} *groene* vakjes.", "Kies eerst een verfpotje.");
    const doelen: [Kleur, number][] = [
      ["rood", 4],
      ["blauw", 7],
      ["groen", 10],
    ];
    await inkleuren(l, ["rood", "blauw", "groen"], (v) => {
      for (const [k, doel] of doelen) {
        const n = v.filter((x) => x === k).length;
        if (n !== doel) {
          return [
            `Kijk nog eens naar de *${BIJ[k]}* vakjes.`,
            `Je hebt er nu {${n}:${k}}.`,
            `Er moeten er {${doel}:${k}} zijn.`,
            n > doel ? "Tik op een vakje om het weer leeg te maken." : "Kies de verf en tik op een leeg vakje.",
          ];
        }
      }
      return null;
    });
    kr(l, { verf: null });
    await l.zeg("Knap gedaan.", "Je hebt het hele rooster gevuld.");
    await l.verder();

    /* Einde: de kaart. */
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Echt knap!"), "Je hebt helemaal tot {10} geteld.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** De vorige versie (vóór Phaser, 27 oktober 2026); blijft bewaard (HARDE REGEL 1), staat niet meer in de lijst. */
export const tellenNa10Oud: Lesdraaiboek = {
  id: "tellen-120-na-tien",
  titel: "Tellen van 10 tot 20",
  synthesis: "Count to 120 · The Next 10",
  kaarttekening: KaartTienstrook,

  async speel(l) {
    const staat = { links: 0, rechts: 0 };

    /* 1. Eén strook: tik de vakjes en tel. */
    l.vlak(Tienstroken, { links: 0, rechts: 0 });
    await l.zeg("Dit rooster ziet er anders uit.", "Hoeveel vakjes heeft het?", "Tik op elk vakje om te tellen.");
    while (staat.links < 10) {
      ts(l, { modus: "links" });
      const g = await l.wachtOpVlak<StrookTik>("tik");
      /* Elke tik kleurt het volgende vakje (ook een tik op een gekleurd vak). */
      if (g.strook === 1) {
        staat.links++;
        ts(l, { links: staat.links });
      }
    }
    ts(l, { modus: null });
    await l.wacht(400);
    await l.zeg("Dus hier zijn er {10} bij elkaar.", "Een groep van {10}.");
    await l.verder();

    /* 2. Wat komt er na 10? */
    ts(l, { tweede: true });
    await l.zeg("Maar wat komt er na {10}?", "Laat het zien in het rooster.");
    for (;;) {
      ts(l, { modus: "rechts" });
      const g = await l.wachtOpVlak<StrookTik>("tik");
      if (g.strook === 2) break;
    }
    staat.rechts = 1;
    ts(l, { modus: null, rechts: 1 });
    const goed11 = await getalVraag(
      l,
      ["Nu heb je een groep van {10}.", "En nog {1} erbij.", "Welk getal is dit?"],
      ["1", "10", "11", "12"],
      "11",
      (k) =>
        k === "12"
          ? ["Dat is er één te veel.", "Rechts staat maar {1} vakje."]
          : k === "1"
            ? ["Dat is alleen het vakje rechts.", "Kijk ook naar de groep van {10}."]
            : ["{10} is alleen de volle groep.", "Er komt nog {1} bij."],
      ["Een groep van {10}, en nog {1}.", "Welk getal is dit?"],
      ["Na {10} komt {11}.", "{10} en nog {1} is {11}."],
    );

    /* Hoe zeg je 11? (De keuzes worden ook voorgelezen.) */
    await l.zeg(goed11 ? "Goed." : "", "Weet je hoe dit getal heet?", "Is het *tieneen*, *elf*, *twaalf* of *dertien*?");
    for (let poging = 1; ; poging++) {
      const k = await l.kies(["tieneen", "elf", "twaalf", "dertien"]);
      if (k === "elf") {
        await l.zeg("Heel goed, *elf*.", "Dat zetten we naast het rooster.");
        break;
      }
      if (k === null) {
        await l.zeg("Geen zorgen.", "We zeggen *elf*.", "Dat zetten we naast het rooster.");
        break;
      }
      if (k === "tieneen") await l.zeg("Ik snap wat je denkt.", "Zo hebben we het gemaakt.", "Maar we zeggen *elf*.");
      else await l.zeg(`*${k[0].toUpperCase()}${k.slice(1)}* komt straks.`, "Dit getal heet *elf*.");
      await l.verder();
      if (poging >= 2) {
        await l.zeg("Dat zetten we naast het rooster.");
        break;
      }
      await l.zeg("Probeer het nog eens.", "Hoe heet dit getal?", "Is het *tieneen*, *elf*, *twaalf* of *dertien*?");
    }
    const lijst = [10, 11];
    ts(l, { lijst: [...lijst] });
    await l.verder();

    /* 3. 12 en 13. */
    await l.zeg("Daar bewaren we al onze getallen.", "Tik nog één vakje aan.");
    for (;;) {
      ts(l, { modus: "rechts" });
      const g = await l.wachtOpVlak<StrookTik>("tik");
      if (g.strook === 2) break;
    }
    staat.rechts = 2;
    ts(l, { modus: null, rechts: 2 });
    const goed12 = await getalVraag(
      l,
      ["Je hebt nog steeds een groep van {10}.", "Nu komen er {2} bij.", "Welk getal heb je gemaakt?"],
      ["2", "10", "12", "13"],
      "12",
      (k) =>
        k === "13"
          ? ["Dat is er één te veel.", "Rechts staan {2} vakjes."]
          : k === "2"
            ? ["Dat zijn alleen de vakjes rechts.", "Kijk ook naar de groep van {10}."]
            : ["{10} is alleen de volle groep.", "Er komen nog {2} bij."],
      ["Een groep van {10}, en nog {2}.", "Welk getal is dit?"],
      ["{10} en nog {2} is {12}."],
    );
    lijst.push(12);
    ts(l, { lijst: [...lijst] });
    if (goed12) {
      await l.zeg("Dat klopt.", "{10} en nog {2} is {12}.");
      await l.verder();
    }

    const goed13 = await getalVraag(
      l,
      ["Wat komt er na {12}?"],
      ["3", "12", "13", "14"],
      "13",
      (k) =>
        k === "12"
          ? ["{12} heb je al.", "Welk getal komt daarna?"]
          : k === "14"
            ? ["Dat is er één te ver.", "Wat komt er direct na {12}?"]
            : ["Kijk ook naar de groep van {10}.", "{3} is alleen het stuk rechts."],
      ["Wat komt er na {12}?"],
      ["Na {12} komt {13}."],
    );
    staat.rechts = 3;
    lijst.push(13);
    ts(l, { rechts: 3, lijst: [...lijst] });
    await l.zeg(goed13 ? "Ja, het getal {13}." : "", "Kijk, ons lijstje groeit.");
    await l.verder();

    /* 4. Zelf doortikken tot 19. */
    await l.zeg("Blijf nu tikken tot de roosters bijna vol zijn.");
    while (staat.rechts < 9) {
      ts(l, { modus: "rechts" });
      const g = await l.wachtOpVlak<StrookTik>("tik");
      if (g.strook !== 2) continue;
      staat.rechts++;
      lijst.push(10 + staat.rechts);
      ts(l, { rechts: staat.rechts, lijst: [...lijst] });
    }
    ts(l, { modus: null });
    await l.wacht(400);
    const goed20 = await getalVraag(
      l,
      ["We stoppen hier even.", "Je hebt tot {19} geteld.", "Weet je welk getal hierna komt?"],
      ["10", "18", "19", "20"],
      "20",
      (k) =>
        k === "10"
          ? ["{10} is één groep van {10}.", "Straks heb je twee groepen van {10}."]
          : k === "18"
            ? ["{18} komt vóór {19}.", "Wat komt er direct na {19}?"]
            : ["{19} heb je al.", "Wat komt er direct na {19}?"],
      ["Welk getal komt na {19}?"],
      ["Na {19} komt {20}."],
    );
    staat.rechts = 10;
    lijst.push(20);
    ts(l, { rechts: 10, lijst: [...lijst] });
    await l.zeg(goed20 ? "Heel goed." : "Kijk.", "Twee groepen van {10} is {20}.");
    await l.verder();

    /* 5. Het spel: bouw het getal. */
    await l.zeg("Je bent goed begonnen.", "Nu doen we een spel.", "Ik zeg een getal, jij bouwt het.");
    await l.verder();
    await bouw(l, 10, staat, "Tik op vakjes in het rechter rooster om ze weg te halen.");
    await bouw(l, 17, staat, "Tik op een leeg vakje om het te vullen.");
    await bouw(l, 14, staat, "Tik op vakjes om ze te vullen of weg te halen.");

    /* Einde: de kaart. */
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Knap gedaan!"), `Je kunt nu tellen van {10} tot {20}.`, "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** De vorige versie (vóór Phaser, 27 oktober 2026); blijft bewaard (HARDE REGEL 1), staat niet meer in de lijst. */
export const doortellenOud: Lesdraaiboek = {
  id: "tellen-120-doortellen",
  titel: "Doortellen",
  synthesis: "Count to 120 · Counting On",
  kaarttekening: KaartDoortellen,

  async speel(l) {
    /* 1. Het veld tot 20, dan tot 50. */
    l.vlak(Getallenveld, { tot: 20 });
    await zoekGetal(l, 20, ["Tot nu toe telde je tot {20}.", "Kun je {20} vinden in dit rooster?"], ["Heel goed.", "Maar vandaag tellen we nog verder."], false);
    await l.verder();
    gv(l, { tot: 50, rand: [] });
    await l.wacht(700);
    await zoekGetal(l, 50, ["Kijk, het rooster groeit.", "Tik op het grootste getal dat je ziet."], ["Ja.", "Het rooster gaat tot {50}."], false);
    await l.verder();

    /* 2. Het spel: zoek het getal. */
    await l.zeg("Nu een snel spelletje.", "Ik zeg een getal.", "Jij zoekt het in het rooster.");
    await l.verder();
    const reeks: [number, string][] = [
      [39, "We beginnen met deze."],
      [12, "Volgende."],
      [29, "Oké."],
      [47, "Oké."],
      [31, "Nog één."],
      [22, "Volgende."],
    ];
    const lof = ["Heel goed.", "Mooi.", "Ja.", "Goed zo."];
    for (let i = 0; i < reeks.length; i++) {
      const [n, inleiding] = reeks[i];
      await zoekGetal(l, n, [inleiding, `Tik op {${n}}.`], [lof[i % lof.length], `Dat is {${n}}.`], false);
      await l.wacht(300);
    }
    gv(l, { rand: [] });
    await l.zeg(metNaam(l, "Je snapt het."), "Nu gaan we doortellen met grote getallen.");
    await l.verder();

    /* 3. Welk getal staat in de rand? */
    gv(l, { rand: [42] });
    await l.zeg("We beginnen hier.", "Welk getal staat in de rand?");
    const k = await l.kies(["32", "41", "42", "43"]);
    if (k === "42") {
      await l.zeg("Ja, dat is {42}.");
    } else {
      await l.zeg(k === null ? "Geen zorgen." : "Kijk nog eens goed.", "Het getal heeft een {4} en een {2}.", "Welk getal is dat?");
      const k2 = await l.kies(["40", "41", "42", "43"]);
      await l.zeg(k2 === "42" ? "Ja, dat is {42}." : "Het is {42}.");
    }
    await l.wacht(400);

    /* 4. Doortellen binnen de rij, en aanvullen tot het tiental. */
    await telVerder(l, 42, 3, true);
    await telVerder(l, 41, 3, false);
    await nogTot(l, 44, 50);

    /* 5. Moeilijker, als het kind dat wil. */
    gv(l, { rand: [], pijl: null });
    await l.zeg("Je doet het heel goed.", "Wil je het moeilijker proberen?");
    const moeilijker = await l.kies(["Ja", "Nog niet"]);
    if (moeilijker === "Ja") {
      await telVerder(l, 28, 6, false);
      await nogTot(l, 34, 40);
      await telVerder(l, 32, 9, false);
      await telVerder(l, 38, 7, false);
    } else {
      await l.zeg(moeilijker === null ? "Geen zorgen." : "Prima.", "We doen er nog één in dezelfde rij.");
      await telVerder(l, 33, 4, false);
      await nogTot(l, 37, 40);
    }

    /* Einde: de kaart. */
    gv(l, { rand: [], pijl: null });
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Knap gedaan!"), "Je kunt doortellen als een kampioen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** De vorige versie (vóór Phaser, 27 oktober 2026); blijft bewaard (HARDE REGEL 1), staat niet meer in de lijst. */
export const eindtoetsTellenOud: Lesdraaiboek = {
  id: "tellen-120-eindtoets",
  titel: "Eindtoets: tellen tot 100",
  synthesis: "Count to 120 · Mastery Check",
  kaarttekening: KaartRooster,

  async speel(l) {
    await toets(
      l,
      {
        kleur: "groen",
        aantal: 8,
        rest: [
          ["rood", 7],
          ["blauw", 6],
        ],
        zoek: 76,
        stappen: 7,
        opties: [77, 82, 83, 84],
        tien: [
          { start: 86, opties: [87, 95, 96, 97], inleiding: ["Oké, nu staat {86} in een rand."] },
          { start: 87, opties: [88, 96, 97, 98], inleiding: ["We doen er nog één.", "Iets sneller.", "En deze?", "Nu staat {87} in een rand."] },
        ],
      },
      [metNaam(l, "Goed gedaan!"), "Je kunt al goed tellen."],
    );
  },
};


/* ---------- groep-3-deel van "Count to 120" en "Counting in 10s" ---------- */

function KaartVijftig() {
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <rect x="72" y="45" width="100" height="100" rx="12" stroke={KOLOMKLEUR[9]} strokeWidth="3.4" />
      <text x="122" y="108" textAnchor="middle" fill={KOLOMKLEUR[9]} fontSize="40" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace">
        50
      </text>
      <path d="M112 22h20l-10 13z" stroke="#ef8d45" strokeWidth="3" />
      <path d="M112 168h20l-10 -13z" stroke="#ef8d45" strokeWidth="3" />
    </g>
  );
}

function KaartTieners() {
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {[13, 14, 15].map((n, i) => (
        <g key={n}>
          <rect x={28 + i * 66} y="62" width="56" height="56" rx="9" stroke={KOLOMKLEUR[(n - 1) % 10]} strokeWidth="3.2" />
          <text x={56 + i * 66} y="99" textAnchor="middle" fill={KOLOMKLEUR[(n - 1) % 10]} fontSize="24" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace">
            {n}
          </text>
        </g>
      ))}
    </g>
  );
}

export const getallenTot50: Lesdraaiboek = {
  id: "tellen-120-tot-50",
  titel: "Getallen tot 50",
  synthesis: "Count to 120 · Count to 120 (groep 3-deel)",
  kaarttekening: KaartVijftig,

  async speel(l) {
    /* 1. Opwarmen: tik 50. (Bij Synthesis groeit het rooster daarna tot 100; dat is groep 4.) */
    l.vlak(Getallenveld, { tot: 50 });
    await zoekGetal(
      l,
      50,
      ["Dit rooster ken je vast nog.", "Eerst even oefenen.", "Tik op het getal {50}."],
      ["Goed zo.", "Dat is het grootste getal in het rooster."],
      false,
    );
    await l.verder();

    /* 2. Snelle vingers, met getallen tot 50. */
    await l.zeg("We spelen *snelle vingers*.", "Ik noem een getal.", "Jij tikt erop.");
    await l.verder();
    const reeks: [number, string, string][] = [
      [41, "We beginnen met deze.", "Raak."],
      [29, "Zoek nu deze.", "Heel goed."],
      [35, "Kijk of je deze kunt vinden.", "Precies."],
    ];
    for (const [n, inleiding, lof] of reeks) {
      await zoekGetal(l, n, [inleiding, `Zoek {${n}} in het rooster.`], [lof, `Dat is {${n}}.`], false);
      await l.wacht(300);
    }
    gv(l, { rand: [] });
    await l.zeg(metNaam(l, "Je kent dit rooster echt goed."), "Zullen we nu doortellen?");
    await l.verder();

    /* 3. Welk getal wijs ik aan? Bij een misser meteen de hulp: "een 4 en een 5". */
    gv(l, { rand: [45] });
    await l.zeg("We beginnen hier.", "Welk getal staat in de rand?");
    const k = await l.kies(["35", "44", "45", "46"]);
    if (k === "45") {
      await l.zeg("Ja, dat is {45}.");
    } else {
      await l.zeg(k === null ? "Geen zorgen." : `{${k}}?`, k === null ? "" : "Kijk nog eens goed.", "Het getal heeft een {4} en een {5}.", "Welk getal is dat?");
      const k2 = await l.kies(["35", "44", "45", "46"]);
      await l.zeg(k2 === "45" ? "Ja, dat is {45}." : "Het is {45}: een {4} en een {5}.");
    }
    await l.wacht(400);

    /* 4. Doortellen binnen de rij, en aanvullen tot 50. */
    await telVerder(l, 45, 3, true);
    await telVerder(l, 41, 5, false);
    await nogTot(l, 46, 50);

    /* Einde: de kaart. */
    gv(l, { rand: [], pijl: null });
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Goed bezig!"), "Nu vind je elk getal tot {50}.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

const TIENERS = [11, 12, 13, 14, 15, 16, 17, 18, 19];

/** "Tik op een tienergetal." Een getal uit `niet` telt niet (dat had het kind al). */
async function tikTiener(l: Lesgids, opdracht: string[], niet: number[] = []): Promise<number> {
  gv(l, { rand: niet, pijl: null, licht: null });
  await l.zeg(...opdracht);
  let hulp = false;
  for (let fout = 0; ; ) {
    const x = await tikVeld(l);
    if (x !== null && TIENERS.includes(x) && !niet.includes(x)) {
      gv(l, { rand: [...niet, x], pijl: null, licht: null });
      if (x >= 13) {
        const woord = GETALWOORD[x];
        await l.zeg("Heel goed.", `{${x}} is een tienergetal.`, `${woord[0].toUpperCase()}${woord.slice(1)} eindigt op *tien*.`);
      } else {
        await l.zeg("Heel goed.", `{${x}} is een tienergetal.`, "Het komt net na tien.");
      }
      await l.wacht(500);
      return x;
    }
    if (x !== null && niet.includes(x)) {
      await l.zeg("Die had je net al.", "Tik op een ander tienergetal.");
      continue;
    }
    if (x !== null) fout++;
    if (x !== null && fout === 1 && !hulp) {
      gv(l, { pijl: x });
      if (x === 10) await l.zeg("{10}.", "Tienergetallen komen *na* tien.");
      else if (x < 10) await l.zeg(`{${x}}.`, "Dat is kleiner dan tien.", "Tienergetallen komen *na* tien.");
      else if (x === 20) await l.zeg("{20}.", "Dat is twintig.", "Tienergetallen komen *voor* twintig.");
      else await l.zeg(`{${x}}.`, "Dat is te ver.", "Tienergetallen komen net na tien.");
      gv(l, { pijl: null });
      await l.zeg(...opdracht);
      continue;
    }
    /* Tweede misser of "Weet ik niet": alleen de tienergetallen lichten op. */
    hulp = true;
    gv(l, { pijl: null, licht: TIENERS });
    await l.zeg(x === null ? "Geen zorgen." : "Ik help je even.", "De tienergetallen staan hier.", "Tik op een van deze getallen.");
  }
}

export const tienergetallen: Lesdraaiboek = {
  id: "tellen-120-tienergetallen",
  titel: "Tienergetallen",
  synthesis: "Count to 120 · Counting in 10s (groep 3-deel)",
  kaarttekening: KaartTieners,

  async speel(l) {
    l.vlak(Getallenveld, { tot: 100 });
    const eerste = await tikTiener(l, ["Tik op een tienergetal."]);

    /* Alle tienergetallen even laten zien. */
    gv(l, { rand: [eerste], licht: TIENERS });
    await l.zeg("Kijk, dit zijn alle tienergetallen.", "Van {11} tot en met {19}.");
    await l.verder();

    /* Nog één keer, met een ander getal. */
    await tikTiener(l, ["Tik op nog een ander tienergetal."], [eerste]);
    await l.verder();

    /* Einde: de kaart. (Bij Synthesis volgt hierna "tel 10 verder"; dat is groep 4.) */
    gv(l, { rand: [], pijl: null, licht: null });
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Knap gedaan!"), "Je kent de tienergetallen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/*
  De volgorde van Synthesis: Assessment, Color Count, The Next 10, Writing Numbers to 20 (nieuw in ronde 3),
  Counting On, Count to 120, Counting in 10s, Mastery Check. Sinds 27 oktober 2026 de Phaser-versies
  (zie tellen-holo.tsx); de vorige versies hierboven (…Oud) blijven bewaard.
*/
export const LESSEN_TELLEN_TOT_120: Lesdraaiboek[] = [
  instaptoetsTellen,
  kleurenTellen,
  tellenNa10,
  getallenSchrijven,
  doortellen,
  getallenTot50,
  tienergetallen,
  eindtoetsTellen,
];
