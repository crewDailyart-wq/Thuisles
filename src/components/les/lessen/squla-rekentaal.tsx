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
 * Sinds 4 november 2026 de hulp van Synthesis (BOUWREGELS 5.1):
 * - 1× fout: korte reactie op wat het kind aantikte en meteen opnieuw;
 * - 2× fout: Bliepo legt het uit, laat het goede antwoord zien en het kind gaat door.
 * Geen keuzevraag, geen pauze. Geen weet-ik-niet-knop (opdracht eigenaar).
 */

import { begeleideVraag, laatZienZin, naamMag, opener, samenOefenen, uitlegVoorVraag, bevestig, zetSynthesisHulp } from "./squla-uitleg";
import { beginzinnen } from "@/lib/lessen/beginzinnen";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartRekentaal, SqulaRekentaalKeuken, type RekenDing, type RekentaalProps } from "../vlakken/squla-rekentaal-keuken";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- het tafereel ---------- */

type Tafereel = Pick<RekentaalProps, "indeling" | "dingen"> & Partial<Pick<RekentaalProps, "ondergrond" | "zwaar">>;

let tafereelNr = 0;
let wiebelNr = 0;

/* Bij een goed antwoord alleen een korte bevestiging uit de gedeelde `bevestig()` (Sara, 4 nov); het waarom zit in het beeld. */
/** Wat het kind het laatst aantikte, welke voorwerpen goed zijn, en bij welke stap van het op volgorde zetten het misging. */
let huidigeDingen: RekenDing[] = [];
let laatsteTik = "";
let huidigGoed: string[] = [];
let laatsteStap = 0;
const naamVan = (id: string) => huidigeDingen.find((d) => d.id === id)?.naam ?? "dit";
const zonderJa = (z: string) => z.replace(/^(Ja|Dat klopt|Goed zo|Precies)[,.]?\s*/i, "").replace(/^./, (c) => c.toUpperCase());

function toon(l: Lesgids, t: Tafereel) {
  huidigeDingen = t.dingen;
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

/** Bliepo wijst deze voorwerpen aan (een rood rondje); zonder ids: niets. */
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
    huidigGoed = [goed];
    const x = await tikDing(l);
    laatsteTik = x;
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
    huidigGoed = volgorde;
    for (const doel of volgorde) {
      window.__phaser = { ...window.__phaser, antwoord: doel };
      const x = await tikDing(l);
      laatsteTik = x;
      laatsteStap = rij.length;
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
  /** Eerste fout: wat Bliepo zegt over wat het kind aantikte (+ een hint). */
  reactie: (gekozen: string, stap: number) => string[];
};

async function vraagMetHulp(l: Lesgids, v: Vraag) {
  toon(l, v.tafereel);
  await l.wacht(500);
  await v.vraag();
  /* De hulp van Synthesis (BOUWREGELS 5.1 en 5.10): eerste fout = reactie en meteen opnieuw; tweede fout = uitleg,
     het goede antwoord laten zien en door. Geen keuzevraag, geen pauze. */
  for (let poging = 1; ; poging++) {
    if (await v.antwoord()) {
      await l.zeg(bevestig());
      await l.wacht(400);
      return;
    }
    if (poging === 1) {
      l.pasVlakAan<RekentaalProps>({ wiebel: null, geplaatst: [] });
      await l.zeg(...[opener(), ...v.reactie(laatsteTik, laatsteStap)].filter(Boolean));
      continue;
    }
    l.pasVlakAan<RekentaalProps>({ wiebel: null, markeer: [], goed: [], geplaatst: [] });
    await uitlegVoorVraag(l, v.samen);
    wijs(l);
    l.pasVlakAan<RekentaalProps>({ goed: [...huidigGoed], geplaatst: huidigGoed.length > 1 ? [...huidigGoed] : [] });
    await v.reden();
    await l.wacht(400);
    return;
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
  const opening = beginzinnen("squla-rekentaal")!;
  await l.zeg(`${opening.zin1} ${opening.zin2}`);
  zetSynthesisHulp(l);
  const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
  if (kan === "Ja") {
    await l.zeg("Fijn. Dan gaan we meteen oefenen.");
    return;
  }
  await samenOefenen(l, async () => {
    // Squla-opbouw: samen beginnen, voordoen, kindhandeling en antwoord,
    // bevestigen met een reden, daarna dezelfde aanpak met minder hulp.
    await l.zeg("Ik help je op weg. We kijken samen.");
    const stap = async (doel: string, vraag: string, tip: string, goed: string, wenk: string) => {
      await begeleideVraag(l, {
        toon: () => wijs(l),
        vraag: [vraag], antwoord: () => tikDing(l), isGoed: (x) => x === doel,
        noem: (x) => x, goed: async () => { wijs(l, doel); await l.zeg(goed); },
        samen: async () => { wijs(l, doel); await l.zeg(tip); },
        reactie: (x) => [`Je tikte op ${naamVan(x)}.`, wenk],
        toonAntwoord: async () => { wijs(l, doel); await l.zeg(zonderJa(goed)); },
        tip: [tip], testAntwoord: doel,
      }, false);
      wijs(l);
    };
    wijs(l, "groot");
    await l.zeg("Kijk, deze pannenkoek is groot.");
    wijs(l, "klein");
    await l.zeg("Deze pannenkoek is klein. Hij is kleiner dan de andere.");
    await stap("klein", "Zie jij de kleine pannenkoek? Tik die aan.", "Kijk naar beide pannenkoeken. Zoek de kleinste.", "Ja, deze is klein. De andere pannenkoek is groter.", "Kijk welke pannenkoek het minst breed is.");
    toon(l, { indeling: "rij", dingen: [ding("klein", "pannenkoek", "de kleine pannenkoek", { maat: 0.6 }), ding("groot", "pannenkoek", "de grote pannenkoek", { maat: 0.95 })] });
    await l.zeg("Nu liggen er andere pannenkoeken. Probeer het maar.");
    await stap("groot", "Welke pannenkoek is groot? Tik die aan.", "Kijk hoe groot de pannenkoeken zijn. Zoek de grootste.", "Goed zo. Deze pannenkoek is groter dan de andere.", "Kijk welke pannenkoek het breedst is.");

    toon(l, { indeling: "rij", dingen: [ding("vol", "glas", "het volle glas", { vul: 1 }), ding("leeg", "glas", "het lege glas", { vul: 0 })] });
    wijs(l, "vol");
    await l.zeg("Kijk in dit glas. Het zit vol sap.");
    wijs(l, "leeg");
    await l.zeg("In dit glas zit niets. Dit glas is leeg.");
    await stap("leeg", "Zie je het lege glas? Tik het aan.", "Zoek het glas waar niets in zit.", "Dat klopt. Het glas is leeg, want er zit niets in.", "Kijk in welk glas geen sap zit.");
    await l.zeg("Nu ben jij aan de beurt.");
    await stap("vol", "Welk glas is vol? Tik het aan.", "Kijk in de glazen. Zoek het glas dat vol sap zit.", "Ja, dit glas is vol. Het zit vol sap.", "Kijk in welk glas het sap tot bovenaan komt.");

    toon(l, { indeling: "weegschaal", zwaar: "meloen", dingen: [ding("meloen", "meloen", "de meloen", { maat: 0.8 }), ding("appel", "appel", "de appel")] });
    await l.zeg("Kijk naar de weegschaal. De zware kant gaat omlaag.");
    wijs(l, "meloen");
    await l.zeg("De meloen hangt lager. Hij is zwaarder dan de appel.");
    await stap("meloen", "Wat is zwaarder: de meloen of de appel? Tik het aan.", "Kijk welke kant lager hangt. Daar ligt het zwaarste fruit.", "Ja, de meloen is zwaarder. Daarom hangt die kant lager.", "Kijk welke kant van de weegschaal lager hangt.");
    await l.zeg("Kijk nu naar de andere kant.");
    await stap("appel", "Wat is lichter: de appel of de meloen? Tik het aan.", "De lichte kant hangt hoger. Kijk welk fruit daar ligt.", "Goed zo. De appel is lichter. Daarom hangt die kant hoger.", "Kijk welke kant van de weegschaal hoger hangt.");

    toon(l, { indeling: "onder", dingen: [ding("lang", "broodje", "het lange broodje", { lengte: 620 }), ding("kort", "broodje", "het korte broodje", { lengte: 300 })] });
    await l.zeg("De broodjes beginnen bij dezelfde streep.");
    wijs(l, "lang");
    await l.zeg("Dit broodje loopt verder door. Het is langer.");
    await stap("kort", "Welk broodje is korter? Tik het aan.", "Kijk waar de broodjes eindigen. Het korte broodje stopt eerder.", "Ja, dit broodje is korter. Het stopt eerder dan het andere.", "Kijk welk broodje als eerste ophoudt.");
    await l.zeg("Nu mag jij het proberen.");
    await stap("lang", "Welk broodje is langer? Tik het aan.", "Begin bij de streep. Kijk welk broodje verder doorloopt.", "Dat klopt. Dit broodje loopt verder door. Het is langer.", "Kijk welk broodje het verst doorloopt.");
    await l.zeg("Nu ga je verder met nieuwe plaatjes. Probeer het maar.");
  });
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
      reactie: () => ["Die pannenkoek is kleiner dan de andere.", "Vergelijk de randen: de brede pannenkoek reikt aan beide kanten verder."],
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
      reactie: () => ["Die beker is groter dan de andere.", "Vergelijk de bekers naast elkaar: de kleine beker is niet zo hoog en niet zo breed."],
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
      reactie: () => ["In dat glas zit niets.", "Let op het glas met sap tot bovenaan."],
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
      reactie: () => ["In dat glas zit sap.", "Kijk naar het glas zonder sap."],
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
      reactie: () => ["De appel ligt aan de kant die omhoog gaat.", "Wat zwaarder is, zakt naar beneden."],
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
      reactie: () => ["De kant van de zak meel zakt naar beneden.", "Kijk welke kant omhoog gaat."],
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
      reactie: () => ["Die sliert houdt snel op.", "Volg met je vinger elke sliert naar rechts. De lange sliert gaat het verst door."],
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
      reactie: () => ["Die sliert loopt verder door.", "Volg met je vinger elke sliert naar rechts tot waar hij stopt. De korte sliert stopt het eerst."],
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
      reactie: (x) => [x === "k" ? "Die mand is de kleinste." : "Die mand is groter dan 1 andere mand, maar niet de grootste.", "Zoek de mand die het hoogst en het breedst is."],
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
      reactie: (x) => [x === "vol" ? "Dat glas is helemaal vol." : "Dat glas is leeg.", "Kijk naar het glas waar het sap tot de helft komt."],
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
      reactie: (x) => [x === "g" ? "Die appel is de grootste." : "Die appel is groter dan 1 andere appel.", "Zoek de appel met de kleinste rondte."],
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
      reactie: (x) => [x === "k" ? "Dit broodje houdt als eerste op." : "Dit is niet het langste broodje.", "Kijk welk broodje het verst doorloopt."],
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
      reactie: () => ["De mand is groot, maar hij is leeg. Zijn kant gaat omhoog.", "Kijk welke kant omlaag zakt."],
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
      reactie: (x) => [x === "l" ? "Dit broodje is het langste." : "Dit is niet het kortste broodje.", "Kijk welk broodje als eerste ophoudt."],
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
      reactie: (_x, stap) => (stap === 0 ? ["Dat is niet de kleinste appel.", "Begin met de kleinste."] : stap === 1 ? ["Dat is niet de middelste appel.", "Na de kleinste komt de middelste."] : ["Die komt niet als laatste.", "De grootste appel komt als laatste."]),
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
      reactie: (_x, stap) => (stap === 0 ? ["Dat is niet de kleinste beker.", "Begin met de kleinste."] : stap === 1 ? ["Dat is niet de middelste beker.", "Na de kleinste komt de middelste."] : ["Die komt niet als laatste.", "De grootste beker komt als laatste."]),
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
    await l.zeg(l.naam && naamMag(l) ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Je kent nu veel rekenwoorden.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_SQULA_REKENTAAL: Lesdraaiboek[] = [rekentaal];
