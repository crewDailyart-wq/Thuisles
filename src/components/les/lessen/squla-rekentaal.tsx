/**
 * Groot en klein, vol en leeg (30 oktober 2026, opdracht eigenaar): een
 * groep 3-les naar een oefening van Squla (Meten en maten · Rekentaal), met
 * eigen inhoud en eigen tekeningen (vlakken/squla-rekentaal-keuken.tsx).
 *
 * Leerdoel: rekentaal. Groot, groter, grootst; klein, kleiner, kleinst; vol,
 * leeg, half vol; zwaar en licht (weegschaal); lang en kort; op volgorde van
 * klein naar groot. Eerst in de keuken, daarna bij de picknick.
 *
 * Het kind tikt op de tekening zelf. Hulp zoals de nagebouwde Synthesis-lessen
 * (verhaaltjessommen.tsx, `meteenS` en `eindAntwoordS`):
 * - 1× fout: "Niet helemaal." en de keuze "Nog een keer" of "Hulp";
 * - "Nog een keer" = dezelfde vraag; nog eens fout of "Hulp" = samen uitzoeken;
 * - na het samen uitzoeken: 1× fout = een tip, 2× fout = even pauze en de les stopt.
 * Geen "Weet ik niet"-knop (opdracht eigenaar).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartRekentaal, SqulaRekentaalKeuken, type RekenDing, type RekentaalProps } from "../vlakken/squla-rekentaal-keuken";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- het tafereel ---------- */

type Tafereel = Pick<RekentaalProps, "indeling" | "dingen"> & Partial<Pick<RekentaalProps, "ondergrond" | "zwaar">>;

let tafereelNr = 0;
let wiebelNr = 0;

function toon(l: Lesgids, t: Tafereel) {
  l.vlak<RekentaalProps>(SqulaRekentaalKeuken, {
    ondergrond: "tafel",
    actief: false,
    markeer: [],
    goed: [],
    wiebel: null,
    geplaatst: [],
    ...t,
    nr: ++tafereelNr,
  });
}

/** Bliepo wijst deze voorwerpen aan (een gele ring); zonder ids: niets. */
function wijs(l: Lesgids, ...ids: string[]) {
  l.pasVlakAan<RekentaalProps>({ markeer: ids });
  if (ids.length) speelLesgeluid("markeer");
}

/** Wachten tot het kind op een voorwerp tikt. */
async function tikDing(l: Lesgids): Promise<string> {
  l.pasVlakAan<RekentaalProps>({ actief: true });
  const g = await l.wachtOpVlak<{ soort: "tik"; id: string }>("tik");
  l.pasVlakAan<RekentaalProps>({ actief: false });
  return g.id;
}

function schud(l: Lesgids, id: string) {
  l.pasVlakAan<RekentaalProps>({ wiebel: { id, n: ++wiebelNr } });
  speelLesgeluid("mis");
}

/** Eén voorwerp aanwijzen: goed of niet. */
function kiesEen(l: Lesgids, goed: string) {
  return async () => {
    /* Voor de automatische test: welk voorwerp nu goed is. */
    window.__phaser = { ...window.__phaser, antwoord: goed };
    const x = await tikDing(l);
    if (x === goed) {
      l.pasVlakAan<RekentaalProps>({ goed: [x], markeer: [] });
      speelLesgeluid("goed");
      return true;
    }
    schud(l, x);
    return false;
  };
}

/** Drie voorwerpen op volgorde zetten: van klein naar groot. Een verkeerde tik = fout; alles gaat terug. */
function opVolgorde(l: Lesgids, volgorde: string[]) {
  return async () => {
    l.pasVlakAan<RekentaalProps>({ geplaatst: [], goed: [], markeer: [] });
    const rij: string[] = [];
    for (const doel of volgorde) {
      window.__phaser = { ...window.__phaser, antwoord: doel };
      const x = await tikDing(l);
      if (x !== doel) {
        schud(l, x);
        await l.wacht(650);
        l.pasVlakAan<RekentaalProps>({ geplaatst: [] });
        return false;
      }
      rij.push(x);
      l.pasVlakAan<RekentaalProps>({ geplaatst: [...rij] });
      speelLesgeluid("schuif");
    }
    l.pasVlakAan<RekentaalProps>({ goed: [...volgorde] });
    speelLesgeluid("goed");
    return true;
  };
}

/* ---------- één vraag, met de hulp zoals Synthesis ---------- */

type Vraag = {
  tafereel: Tafereel;
  /** Bliepo stelt de vraag. */
  vraag: () => Promise<void>;
  /** Het kind antwoordt; `true` = goed. */
  antwoord: () => Promise<boolean>;
  /** Waarom het goed is (na "Precies." of "Goed zo."). */
  reden: () => Promise<void>;
  /** Samen uitzoeken: Bliepo wijst aan en legt uit. */
  samen: () => Promise<void>;
  /** Na het samen uitzoeken nog eens fout: een tip. */
  tip: () => Promise<void>;
};

async function vraagMetHulp(l: Lesgids, v: Vraag) {
  toon(l, v.tafereel);
  await l.wacht(500);
  await v.vraag();
  if (await v.antwoord()) {
    await l.zeg("Precies.");
    await v.reden();
    await l.wacht(400);
    return;
  }

  /* Zoals Synthesis: na één fout de keuze "Nog een keer" of "Hulp". */
  await l.zeg("Niet helemaal.");
  await l.zeg("Wil je hulp, of nog een keer proberen?");
  const keuze = await l.kies(["Nog een keer", "Hulp"], { weetniet: false, direct: true });
  if (keuze === "Nog een keer") {
    l.pasVlakAan<RekentaalProps>({ wiebel: null });
    await v.vraag();
    if (await v.antwoord()) {
      await l.zeg("Precies.");
      await v.reden();
      await l.wacht(400);
      return;
    }
    await l.zeg("Niet helemaal.", "Laten we het samen uitzoeken.");
  } else await l.zeg("Goed.", "We doen het samen, stap voor stap.");

  /* Samen uitzoeken. */
  l.pasVlakAan<RekentaalProps>({ wiebel: null, markeer: [], goed: [], geplaatst: [] });
  await v.samen();
  wijs(l);
  await v.vraag();

  /* Het eindantwoord: 1× fout = een tip, 2× fout = even pauze (zoals Synthesis). */
  for (let poging = 1; ; poging++) {
    if (await v.antwoord()) {
      await l.zeg("Goed zo.");
      await v.reden();
      await l.wacht(400);
      return;
    }
    if (poging === 1) {
      await l.zeg("Niet helemaal.");
      await v.tip();
      continue;
    }
    await l.zeg("Niet helemaal.", "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await l.verder();
    return l.stopLes();
  }
}

/* ---------- de voorwerpen ---------- */

const ding = (id: string, soort: RekenDing["soort"], naam: string, extra: Partial<RekenDing> = {}): RekenDing => ({ id, soort, naam, ...extra });

/* ---------- de les ---------- */

async function kennismaken(l: Lesgids) {
  toon(l, {
    indeling: "rij",
    dingen: [ding("groot", "pannenkoek", "de grote pannenkoek", { maat: 1 }), ding("klein", "pannenkoek", "de kleine pannenkoek", { maat: 0.5 })],
  });
  await l.zeg("We gaan bakken in de keuken.", "Kijk naar de pannenkoeken.");
  wijs(l, "groot");
  await l.zeg("Deze pannenkoek is groot.");
  wijs(l, "klein");
  await l.zeg("Deze pannenkoek is klein.");
  wijs(l);
  await l.zeg("We leren woorden als groot en klein.", "En vol en leeg, zwaar en licht.", "En lang en kort.");
  await l.zeg("Kun je dit al?");
  const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
  if (kan === "Ja") {
    await l.zeg("Fijn. Dan gaan we meteen oefenen.");
    return;
  }
  await l.zeg("Geen probleem. Ik laat het je zien.");

  /* Groot, groter, grootst. */
  toon(l, {
    indeling: "rij",
    dingen: [ding("k", "mand", "de kleine mand", { maat: 0.6 }), ding("m", "mand", "de grotere mand", { maat: 0.85 }), ding("g", "mand", "de grootste mand", { maat: 1.12 })],
  });
  await l.zeg("Kijk naar de manden.");
  wijs(l, "k");
  await l.zeg("Deze mand is klein.");
  wijs(l, "m");
  await l.zeg("Deze mand is groter.");
  wijs(l, "g");
  await l.zeg("En deze mand is het grootst.");
  wijs(l, "k");
  await l.zeg("De kleine mand is het kleinst.");
  await l.verder();
  wijs(l);

  /* Vol, half vol, leeg. */
  toon(l, {
    indeling: "rij",
    dingen: [ding("vol", "glas", "het volle glas", { vul: 1 }), ding("half", "glas", "het halfvolle glas", { vul: 0.5 }), ding("leeg", "glas", "het lege glas", { vul: 0 })],
  });
  await l.zeg("Kijk naar de glazen sap.");
  wijs(l, "vol");
  await l.zeg("Dit glas is vol.");
  wijs(l, "half");
  await l.zeg("Dit glas is half vol.");
  wijs(l, "leeg");
  await l.zeg("Dit glas is leeg.", "Er zit niets in.");
  await l.verder();
  wijs(l);

  /* Zwaar en licht. */
  toon(l, {
    indeling: "weegschaal",
    zwaar: "meloen",
    dingen: [ding("meloen", "meloen", "de meloen", { maat: 0.8 }), ding("appel", "appel", "de appel")],
  });
  await l.zeg("Dit is een weegschaal.");
  await l.wacht(900);
  wijs(l, "meloen");
  await l.zeg("De meloen is zwaar.", "Die kant zakt naar beneden.");
  wijs(l, "appel");
  await l.zeg("De appel is licht.", "Die kant gaat omhoog.");
  await l.verder();
  wijs(l);

  /* Lang en kort. */
  toon(l, {
    indeling: "onder",
    dingen: [ding("lang", "broodje", "het lange broodje", { lengte: 620 }), ding("kort", "broodje", "het korte broodje", { lengte: 300 })],
  });
  await l.zeg("Kijk naar de broodjes.");
  wijs(l, "lang");
  await l.zeg("Dit broodje is lang.");
  wijs(l, "kort");
  await l.zeg("Dit broodje is kort.");
  await l.verder();
  wijs(l);
  await l.zeg("Nu ga jij het doen.");
}

function vragenKeuken(l: Lesgids): Vraag[] {
  return [
    /* 1. Groter, van twee. */
    {
      tafereel: { indeling: "rij", dingen: [ding("k", "pannenkoek", "de kleine pannenkoek", { maat: 0.6 }), ding("g", "pannenkoek", "de grote pannenkoek", { maat: 0.95 })] },
      vraag: () => l.zeg("Welke pannenkoek is groter?", "Tik erop."),
      antwoord: kiesEen(l, "g"),
      reden: () => l.zeg("Deze pannenkoek is groter."),
      samen: async () => {
        wijs(l, "k");
        await l.zeg("Deze pannenkoek is klein.");
        wijs(l, "g");
        await l.zeg("Deze pannenkoek is groot.", "Dus deze pannenkoek is groter.");
        wijs(l);
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welke pannenkoek is groter?"),
    },
    /* 2. Kleiner, van twee. */
    {
      tafereel: { indeling: "rij", dingen: [ding("g", "beker", "de grote beker", { maat: 1.05 }), ding("k", "beker", "de kleine beker", { maat: 0.65 })] },
      vraag: () => l.zeg("Welke beker is kleiner?"),
      antwoord: kiesEen(l, "k"),
      reden: () => l.zeg("Deze beker is kleiner."),
      samen: async () => {
        wijs(l, "g");
        await l.zeg("Deze beker is groot.");
        wijs(l, "k");
        await l.zeg("Deze beker is klein.");
        wijs(l);
        await l.zeg("De kleine beker is kleiner.");
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welke beker is kleiner?"),
    },
    /* 3. Vol. */
    {
      tafereel: { indeling: "rij", dingen: [ding("leeg", "glas", "het lege glas", { vul: 0 }), ding("vol", "glas", "het volle glas", { vul: 1 })] },
      vraag: () => l.zeg("Welk glas is vol?"),
      antwoord: kiesEen(l, "vol"),
      reden: () => l.zeg("Dit glas is vol."),
      samen: async () => {
        wijs(l, "leeg");
        await l.zeg("In dit glas zit niets.");
        wijs(l, "vol");
        await l.zeg("Dit glas zit tot de rand vol sap.");
        wijs(l);
        await l.zeg("Vol betekent: er past niets meer bij.");
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welk glas is vol?"),
    },
    /* 4. Leeg. */
    {
      tafereel: { indeling: "rij", dingen: [ding("vol", "glas", "het volle glas", { vul: 1 }), ding("leeg", "glas", "het lege glas", { vul: 0 })] },
      vraag: () => l.zeg("Welk glas is leeg?"),
      antwoord: kiesEen(l, "leeg"),
      reden: () => l.zeg("Dit glas is leeg.", "Er zit niets in."),
      samen: async () => {
        wijs(l, "vol");
        await l.zeg("In dit glas zit sap.");
        wijs(l, "leeg");
        await l.zeg("In dit glas zit niets.");
        wijs(l);
        await l.zeg("Een glas zonder sap is leeg.");
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welk glas is leeg?"),
    },
    /* 5. Zwaarder: de kant die zakt. */
    {
      tafereel: { indeling: "weegschaal", zwaar: "meloen", dingen: [ding("appel", "appel", "de appel"), ding("meloen", "meloen", "de meloen", { maat: 0.8 })] },
      vraag: () => l.zeg("Kijk naar de weegschaal.", "Wat is zwaarder?"),
      antwoord: kiesEen(l, "meloen"),
      reden: () => l.zeg("De meloen is zwaarder.", "Die kant zakt naar beneden."),
      samen: async () => {
        await l.zeg("Kijk naar de weegschaal.");
        wijs(l, "meloen");
        await l.zeg("Deze kant zakt naar beneden.");
        wijs(l, "appel");
        await l.zeg("Deze kant gaat omhoog.");
        wijs(l);
        await l.zeg("Wat naar beneden zakt, is zwaarder.");
      },
      tip: () => l.zeg("Kijk welke kant naar beneden zakt.", "Wat is zwaarder?"),
    },
    /* 6. Lichter: de kant die omhoog gaat. */
    {
      tafereel: { indeling: "weegschaal", zwaar: "zak", dingen: [ding("zak", "zak", "de zak meel", { maat: 0.8 }), ding("aardbei", "aardbei", "de aardbei")] },
      vraag: () => l.zeg("Kijk naar de weegschaal.", "Wat is lichter?"),
      antwoord: kiesEen(l, "aardbei"),
      reden: () => l.zeg("De aardbei is lichter.", "Die kant gaat omhoog."),
      samen: async () => {
        wijs(l, "zak");
        await l.zeg("De zak meel zakt naar beneden.", "Die is zwaar.");
        wijs(l, "aardbei");
        await l.zeg("De aardbei gaat omhoog.", "Die is licht.");
        wijs(l);
        await l.zeg("Wat omhooggaat, is lichter.");
      },
      tip: () => l.zeg("Kijk welke kant omhooggaat.", "Wat is lichter?"),
    },
    /* 7. Langer. */
    {
      tafereel: { indeling: "onder", dingen: [ding("kort", "sliert", "de korte sliert", { lengte: 330 }), ding("lang", "sliert", "de lange sliert", { lengte: 640 })] },
      vraag: () => l.zeg("Kijk naar de slierten spaghetti.", "Welke sliert is langer?"),
      antwoord: kiesEen(l, "lang"),
      reden: () => l.zeg("Deze sliert is langer."),
      samen: async () => {
        await l.zeg("De slierten beginnen op dezelfde plek.");
        wijs(l, "kort");
        await l.zeg("Deze sliert houdt snel op.");
        wijs(l, "lang");
        await l.zeg("Deze sliert gaat verder door.");
        await l.zeg("Die is dus langer.");
      },
      tip: () => l.zeg("Kijk waar de slierten ophouden.", "Welke sliert is langer?"),
    },
    /* 8. Korter. */
    {
      tafereel: { indeling: "onder", dingen: [ding("lang", "sliert", "de lange sliert", { lengte: 600 }), ding("kort", "sliert", "de korte sliert", { lengte: 400 })] },
      vraag: () => l.zeg("Welke sliert is korter?"),
      antwoord: kiesEen(l, "kort"),
      reden: () => l.zeg("Deze sliert is korter."),
      samen: async () => {
        await l.zeg("De slierten beginnen op dezelfde plek.");
        wijs(l, "lang");
        await l.zeg("Deze sliert is lang.");
        wijs(l, "kort");
        await l.zeg("Deze sliert is kort.");
        wijs(l);
        await l.zeg("De korte sliert is korter.");
      },
      tip: () => l.zeg("Kijk waar de slierten ophouden.", "Welke sliert is korter?"),
    },
  ];
}

function vragenPicknick(l: Lesgids): Vraag[] {
  return [
    /* 9. Het grootst, van drie. */
    {
      tafereel: {
        indeling: "rij",
        ondergrond: "kleed",
        dingen: [ding("m", "mand", "de middelste mand", { maat: 0.85 }), ding("g", "mand", "de grootste mand", { maat: 1.12 }), ding("k", "mand", "de kleinste mand", { maat: 0.6 })],
      },
      vraag: () => l.zeg("Welke mand is het grootst?"),
      antwoord: kiesEen(l, "g"),
      reden: () => l.zeg("Deze mand is het grootst."),
      samen: async () => {
        wijs(l, "k");
        await l.zeg("Deze mand is klein.");
        wijs(l, "m");
        await l.zeg("Deze mand is groter.");
        wijs(l, "g");
        await l.zeg("En deze mand is het grootst.");
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welke mand is het grootst?"),
    },
    /* 10. Half vol, van drie. */
    {
      tafereel: {
        indeling: "rij",
        ondergrond: "kleed",
        dingen: [ding("vol", "glas", "het volle glas", { vul: 1 }), ding("leeg", "glas", "het lege glas", { vul: 0 }), ding("half", "glas", "het halfvolle glas", { vul: 0.5 })],
      },
      vraag: () => l.zeg("Welk glas is half vol?"),
      antwoord: kiesEen(l, "half"),
      reden: () => l.zeg("Dit glas is half vol.", "Het sap komt tot de helft."),
      samen: async () => {
        wijs(l, "vol");
        await l.zeg("Dit glas is vol.");
        wijs(l, "leeg");
        await l.zeg("Dit glas is leeg.");
        wijs(l, "half");
        await l.zeg("Het sap in dit glas komt tot de helft.");
      },
      tip: () => l.zeg("Kijk hoe hoog het sap komt.", "Welk glas is half vol?"),
    },
    /* 11. Het kleinst, van drie. */
    {
      tafereel: {
        indeling: "rij",
        ondergrond: "kleed",
        dingen: [ding("g", "appel", "de grootste appel", { maat: 1.35 }), ding("k", "appel", "de kleinste appel", { maat: 0.7 }), ding("m", "appel", "de middelste appel", { maat: 1 })],
      },
      vraag: () => l.zeg("Welke appel is het kleinst?"),
      antwoord: kiesEen(l, "k"),
      reden: () => l.zeg("Deze appel is het kleinst."),
      samen: async () => {
        wijs(l, "g");
        await l.zeg("Deze appel is groot.");
        wijs(l, "m");
        await l.zeg("Deze appel is kleiner.");
        wijs(l, "k");
        await l.zeg("En deze appel is het kleinst.");
      },
      tip: () => l.zeg("Kijk nog eens goed.", "Welke appel is het kleinst?"),
    },
    /* 12. Het langst, van drie. */
    {
      tafereel: {
        indeling: "onder",
        ondergrond: "kleed",
        dingen: [ding("k", "broodje", "het kortste broodje", { lengte: 300 }), ding("l", "broodje", "het langste broodje", { lengte: 640 }), ding("m", "broodje", "het middelste broodje", { lengte: 470 })],
      },
      vraag: () => l.zeg("Welk broodje is het langst?"),
      antwoord: kiesEen(l, "l"),
      reden: () => l.zeg("Dit broodje is het langst."),
      samen: async () => {
        await l.zeg("De broodjes beginnen op dezelfde plek.");
        wijs(l, "k");
        await l.zeg("Dit broodje is kort.");
        wijs(l, "m");
        await l.zeg("Dit broodje is langer.");
        wijs(l, "l");
        await l.zeg("Dit broodje gaat het verst door.", "Het is het langst.");
      },
      tip: () => l.zeg("Kijk waar de broodjes ophouden.", "Welk broodje is het langst?"),
    },
    /* 13. Groot is niet altijd zwaar. */
    {
      tafereel: {
        indeling: "weegschaal",
        ondergrond: "kleed",
        zwaar: "meloen",
        dingen: [ding("mand", "mand", "de lege mand", { maat: 0.8 }), ding("meloen", "meloen", "de meloen", { maat: 0.6 })],
      },
      vraag: () => l.zeg("Kijk naar de weegschaal.", "Wat is zwaarder?"),
      antwoord: kiesEen(l, "meloen"),
      reden: () => l.zeg("De meloen is zwaarder.", "Die kant zakt naar beneden."),
      samen: async () => {
        wijs(l, "mand");
        await l.zeg("De mand is groot, maar hij is leeg.", "Die kant gaat omhoog.");
        wijs(l, "meloen");
        await l.zeg("De kant met de meloen zakt naar beneden.");
        await l.zeg("Dus de meloen is zwaarder.");
      },
      tip: () => l.zeg("Kijk welke kant naar beneden zakt.", "Wat is zwaarder?"),
    },
    /* 14. Het kortst, van drie. */
    {
      tafereel: {
        indeling: "onder",
        ondergrond: "kleed",
        dingen: [ding("m", "broodje", "het middelste broodje", { lengte: 450 }), ding("l", "broodje", "het langste broodje", { lengte: 620 }), ding("k", "broodje", "het kortste broodje", { lengte: 270 })],
      },
      vraag: () => l.zeg("Welk broodje is het kortst?"),
      antwoord: kiesEen(l, "k"),
      reden: () => l.zeg("Dit broodje is het kortst."),
      samen: async () => {
        await l.zeg("De broodjes beginnen op dezelfde plek.");
        wijs(l, "l");
        await l.zeg("Dit broodje is lang.");
        wijs(l, "m");
        await l.zeg("Dit broodje is korter.");
        wijs(l, "k");
        await l.zeg("Dit broodje is het kortst.");
      },
      tip: () => l.zeg("Kijk waar de broodjes ophouden.", "Welk broodje is het kortst?"),
    },
    /* 15. Op volgorde: appels. */
    {
      tafereel: {
        indeling: "volgorde",
        ondergrond: "kleed",
        dingen: [ding("m", "appel", "de middelste appel", { maat: 0.95 }), ding("g", "appel", "de grootste appel", { maat: 1.3 }), ding("k", "appel", "de kleinste appel", { maat: 0.6 })],
      },
      vraag: () => l.zeg("Zet de appels op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."),
      antwoord: opVolgorde(l, ["k", "m", "g"]),
      reden: () => l.zeg("Klein, groter, het grootst."),
      samen: async () => {
        await l.zeg("We zoeken eerst de kleinste.");
        wijs(l, "k");
        await l.zeg("Deze appel is het kleinst.");
        wijs(l, "m");
        await l.zeg("Dan komt deze appel.");
        wijs(l, "g");
        await l.zeg("Deze appel is het grootst.", "Die komt als laatste.");
      },
      tip: () => l.zeg("Begin met de kleinste appel."),
    },
    /* 16. Op volgorde: bekers. */
    {
      tafereel: {
        indeling: "volgorde",
        ondergrond: "kleed",
        dingen: [ding("g", "beker", "de grootste beker", { maat: 0.95 }), ding("k", "beker", "de kleinste beker", { maat: 0.45 }), ding("m", "beker", "de middelste beker", { maat: 0.7 })],
      },
      vraag: () => l.zeg("Zet de bekers op volgorde.", "Van klein naar groot.", "Tik eerst op de kleinste."),
      antwoord: opVolgorde(l, ["k", "m", "g"]),
      reden: () => l.zeg("Klein, groter, het grootst."),
      samen: async () => {
        await l.zeg("We zoeken eerst de kleinste.");
        wijs(l, "k");
        await l.zeg("Deze beker is het kleinst.");
        wijs(l, "m");
        await l.zeg("Dan komt deze beker.");
        wijs(l, "g");
        await l.zeg("Deze beker is het grootst.", "Die komt als laatste.");
      },
      tip: () => l.zeg("Begin met de kleinste beker."),
    },
  ];
}

const rekentaal: Lesdraaiboek = {
  id: "squla-rekentaal",
  titel: "Groot en klein, vol en leeg",
  synthesis: "Squla groep 3 · Meten en maten · Rekentaal (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartRekentaal,

  async speel(l) {
    await kennismaken(l);

    /* In de keuken. */
    for (const v of vragenKeuken(l)) await vraagMetHulp(l, v);

    /* Bij de picknick. */
    toon(l, { indeling: "rij", ondergrond: "kleed", dingen: [] });
    await l.zeg("Goed gewerkt in de keuken.", "Nu gaan we picknicken in het park.");
    for (const v of vragenPicknick(l)) await vraagMetHulp(l, v);

    const tik = l.kaart();
    await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je kent nu veel rekenwoorden.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_SQULA_REKENTAAL: Lesdraaiboek[] = [rekentaal];
