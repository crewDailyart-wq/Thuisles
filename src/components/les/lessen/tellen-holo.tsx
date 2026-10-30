/**
 * De groep 3-lessen van "Tellen" in Phaser (27 oktober 2026, LESSENPLAN.md
 * G2–G6 en G4b, wereld Oceaan; BOUWEN-PHASER.md). Zelfde leerstappen als
 * Synthesis "Color Count" (Assessment, Color Count, The Next 10, Writing
 * Numbers to 20, Counting On, Mastery Check), nu met hologrammen:
 *
 *   kleuren tellen   lichtvisjes in een rooster van 3 × 7 (tellen-holo-rooster)
 *   toetsen          kwallen in hetzelfde rooster, het bubbelveld en de schelpen
 *   tellen na 10     twee schelpen met 10 parelplekken (tellen-holo-schelpen)
 *   schrijven        schelp(en), schrijfbord(en) en cijferkaarten (tellen-holo-schrijven)
 *   doortellen       het getallenveld van bubbels tot 50 (tellen-holo-veld)
 *
 * Hulp volgt de aantekeningen per les en anders de ALGEMENE HULPREGELS (R3):
 * 1× fout = vriendelijke reactie + één hint bij de handeling; 2× fout =
 * Bliepo doet het voor of zegt het antwoord, en de vraag komt later in de
 * les terug; "weet ik niet" = het antwoord + "we komen hier later op terug".
 * Toetsen: 1× fout = "37? Kijk nog eens.", 2× fout = de toets stopt en we
 * oefenen samen. Het woord "fout" valt nooit.
 *
 * Elke les begint met "Weet je dit al?" (Ja · Nee · Weet ik niet): ja = een
 * korte proef; lukt die, dan is de les klaar.
 *
 * De vorige versies van deze lessen staan nog in tellen-tot-120.tsx (…Oud).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import {
  TelRooster,
  type Kleur,
  type TelRoosterProps,
} from "../vlakken/tellen-holo-rooster";
import {
  TelSchelpen,
  type TelSchelpenProps,
} from "../vlakken/tellen-holo-schelpen";
import { knoppenOpPlek } from "./antwoordknoppen";
import { TelVeld, type TelVeldProps } from "../vlakken/tellen-holo-veld";
import {
  TelSchrijven,
  type TelSchrijvenProps,
} from "../vlakken/tellen-holo-schrijven";
import { GETALWOORD } from "../vlakken/tellen-tienstroken";
import { KLEURCODE } from "../vlakken/tellen-kleurrooster";
import { KOLOMKLEUR } from "../vlakken/tellen-getallenveld";
import { TEGELKLEUR } from "../tegels";

/* ---------- algemeen ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

const metNaam = (l: Lesgids, zin: string) =>
  l.naam
    ? `${zin.replace(/[.!]$/, "")}, ${l.naam}${zin.endsWith("!") ? "!" : "."}`
    : zin;

/** Een teller voor de lichtgolf bij goed. */
let golfTeller = 0;
const golf = () => ++golfTeller;

/**
 * Voor de automatische test (zoals `window.__phaser.antwoord` bij de flitsen):
 * wat er nu goed is. `hulp` = een vraag binnen de hulp (de test antwoordt dan
 * altijd goed). Het kind ziet hier niets van.
 */
declare global {
  interface Window {
    __telAntwoord?: {
      id: number;
      doe: string;
      hulp?: boolean;
      [k: string]: unknown;
    };
  }
}
let antwoordId = 0;
function zetAntwoord(
  doe: string,
  gegevens: Record<string, unknown> = {},
  hulp = false,
) {
  if (typeof window !== "undefined")
    window.__telAntwoord = { id: ++antwoordId, doe, hulp, ...gegevens };
  return typeof window !== "undefined" ? window.__telAntwoord : undefined;
}
/** Na een hulpvraag terug naar de opdracht van daarvoor (zelfde vraag). */
function herstelAntwoord(a: Window["__telAntwoord"]) {
  if (typeof window !== "undefined" && a) window.__telAntwoord = a;
}

/** Het kind is aan de beurt (voor de test: nu mag hij iets doen). */
function beurtVan<T>(p: Promise<T>): Promise<T> {
  const a = typeof window !== "undefined" ? window.__telAntwoord : undefined;
  if (a) a.beurt = ((a.beurt as number) ?? 0) + 1;
  return p;
}

/** Een vraag die later terugkomt zet zijn eigen vlak neer (het vlak van dat moment kan een ander zijn). */
async function zetVeld(l: Lesgids) {
  l.vlak(TelVeld, { tot: 50 });
  await l.wacht(600);
}

/** Vragen die later in de les terugkomen (2× fout of "weet ik niet"). */
type Later = (() => Promise<void>)[];

/** Na de les: de vragen die nog terug moesten komen, één keer. */
async function speelLater(l: Lesgids, later: Later, inleiding: string[]) {
  if (later.length === 0) return;
  await l.zeg(...inleiding);
  await l.verder();
  const lijst = later.splice(0, later.length);
  for (const vraag of lijst) await vraag();
}

/**
 * Iets zeggen terwijl de knoppen blijven staan (de knop "Weet ik niet"
 * verdwijnt niet). `l.zeg` haalt de bediening weg; `wijsAan` niet.
 */
const zegErbij = (l: Lesgids, ...zinnen: string[]) => l.wijsAan("-", ...zinnen);

/** Na een poos niets doen zegt Bliepo vanzelf de hulpzin. Geeft een functie die de herinnering stopt. */
function herinner(
  l: Lesgids,
  zinnen: string[],
  ms = 15000,
  erbij = true,
  ook?: () => void,
): () => void {
  const klok = setTimeout(() => {
    ook?.();
    void (erbij ? zegErbij(l, ...zinnen) : l.zeg(...zinnen)).catch(() => {});
  }, ms);
  return () => clearTimeout(klok);
}

/** Wachten op een tik in het vlak, met "Weet ik niet" erbij. `null` = weet ik niet. */
function tikOfWeetNiet<G>(
  l: Lesgids,
  soort: string | string[],
): Promise<G | null> {
  return Promise.race([
    l.wachtOpVlak(soort) as Promise<G>,
    l.kies([]).then(() => null),
  ]);
}

/** De eerste keer in de les wijst Bliepo de knop "Weet ik niet" aan. */
async function wijsWeetNiet(l: Lesgids, staat: { gewezen: Set<string> }) {
  if (staat.gewezen.has("weetniet")) return;
  staat.gewezen.add("weetniet");
  await l.wijsAan(
    "weetniet",
    "Weet je het niet?",
    "Tik dan op het vraagteken.",
  );
}
async function wijsKnop(
  l: Lesgids,
  staat: { gewezen: Set<string> },
  knop: string,
  ...zinnen: string[]
) {
  if (staat.gewezen.has(knop)) return;
  staat.gewezen.add(knop);
  await l.wijsAan(knop, ...zinnen);
}

/**
 * "Weet je dit al?" (Ja · Nee · Weet ik niet). Bij de eerste keer wijst
 * Bliepo de knop met het vraagteken aan.
 */
async function weetJeDitAl(
  l: Lesgids,
  staat: { gewezen: Set<string> },
  zinnen: string[],
): Promise<"ja" | "nee" | "weetniet"> {
  await l.zeg(...zinnen);
  zetAntwoord("start");
  const p = l.kies(["Ja", "Nee"]);
  await zegErbij(l, "Tik op *ja* of *nee*.", "Tik dan op het vinkje.");
  staat.gewezen.add("weetniet");
  await l.wijsAan("weetniet", "Weet je het niet? Tik dan op het vraagteken.");
  const k = await beurtVan(p);
  return k === null ? "weetniet" : k === "Ja" ? "ja" : "nee";
}

/**
 * Het vinkje van "Klaar" staat op de vaste plek onder de zin van Bliepo, niet
 * meer in het vlak (28 oktober 2026, besluit eigenaar).
 */
const metVinkje = (l: Lesgids) =>
  knoppenOpPlek(l, {
    voor: [TelRooster, TelSchelpen, TelVeld],
    soorten: { klaar: "controleer" },
    aanwijs: { vinkje: "controleer" },
    zichtbaar: (p) => (p.klaarKnop ? ["klaar"] : []),
  });

type Staat = { gewezen: Set<string> };
const nieuweStaat = (): Staat => ({ gewezen: new Set() });

/* =====================================================================
   Het kleurenrooster (Kleuren tellen, en vraag 1 van de toetsen)
   ===================================================================== */

type TR = TelRoosterProps;
const hr = (l: Lesgids, p: Partial<TR>) => l.pasVlakAan<TR>(p);

/** "rode", "gele": de kleur als bijvoeglijk naamwoord. */
const BIJ: Record<Kleur, string> = {
  rood: "rode",
  oranje: "oranje",
  geel: "gele",
  groen: "groene",
  blauw: "blauwe",
  paars: "paarse",
};

/** Een rooster van 21 plekken met precies deze aantallen, door elkaar. */
function rooster(aantallen: [Kleur, number][]): Kleur[] {
  const uit: Kleur[] = [];
  for (const [k, n] of aantallen) for (let i = 0; i < n; i++) uit.push(k);
  return schud(uit);
}

function verdeel(kleuren: Kleur[], aantallen: number[]): [Kleur, number][] {
  const a = schud(aantallen);
  return kleuren.map((k, i) => [k, a[i]]);
}

type KleurTik = { soort: "kleur"; kleur: Kleur; index: number };

/** Het kind tikt een visje aan; geeft de kleur. Een kleur uit `niet` telt niet. */
async function kiesKleur(l: Lesgids, niet: Kleur[] = []): Promise<Kleur> {
  for (;;) {
    hr(l, { modus: "kleur" });
    zetAntwoord("kleurVrij", { niet }, true);
    const g = await beurtVan(l.wachtOpVlak<KleurTik>("kleur"));
    hr(l, { modus: null });
    if (!niet.includes(g.kleur)) return g.kleur;
    await l.zeg("Die kleur hebben we al.", "Tik op een andere kleur.");
  }
}

/**
 * Samen tellen: de andere kleuren worden dof en de visjes van deze kleuren
 * krijgen om de beurt een nummer (in leesvolgorde). Het cijfer kleurt mee.
 */
async function telSamen(
  l: Lesgids,
  vakjes: (Kleur | null)[],
  kleuren: Kleur[],
  opties: { tot?: number; cijfers?: boolean; hardop?: boolean } = {},
): Promise<void> {
  const plekken = vakjes.flatMap((k, i) =>
    k && kleuren.includes(k) ? [i] : [],
  );
  const tot = Math.min(opties.tot ?? plekken.length, plekken.length);
  const kleur = kleuren[0];
  hr(l, {
    fel: kleuren,
    nummers: {},
    cijferMarkering: opties.cijfers ? { n: 0, kleur } : null,
  });
  await l.wacht(450);
  const nummers: Record<number, number> = {};
  for (let j = 0; j < tot; j++) {
    nummers[plekken[j]] = j + 1;
    hr(l, {
      nummers: { ...nummers },
      ...(opties.cijfers && j + 1 <= 9
        ? { cijferMarkering: { n: j + 1, kleur } }
        : {}),
    });
    if (opties.hardop)
      await l.zeg(kleuren.length === 1 ? `{${j + 1}:${kleur}}` : `{${j + 1}}`);
    else await l.wacht(480);
  }
}

/**
 * "Hoeveel … zie je?" met de cijfers 0–9 rond het rooster (Synthesis).
 * 1× fout: te veel → "dan heb je er te veel geteld"; te weinig → samen tellen
 * tot dat getal, er blijven er over. 2× fout of "weet ik niet": samen tellen,
 * het antwoord, en de vraag komt later terug.
 */
async function telVraag(
  l: Lesgids,
  st: Staat,
  vakjes: (Kleur | null)[],
  kleuren: Kleur[],
  wat: string,
  o: {
    samenBijGoed?: boolean;
    later?: Later;
    opnieuw?: () => Promise<void>;
  } = {},
): Promise<boolean> {
  const n = vakjes.filter((k) => k && kleuren.includes(k)).length;
  const kleur = kleuren[0];
  hr(l, {
    cijfers: true,
    fel: kleuren,
    nummers: {},
    cijferMarkering: null,
    cijfersUit: [],
  });
  await l.zeg(`Hoeveel ${wat} zie je?`, "Tel ze en tik op het goede getal.");
  zetAntwoord("cijfer", { n });
  let goedGedaan = false;
  for (let poging = 1; ; poging++) {
    hr(l, { modus: "cijfer" });
    const p = tikOfWeetNiet<{ soort: "cijfer"; n: number }>(l, "cijfer");
    if (poging === 1) await wijsWeetNiet(l, st);
    const stop = herinner(l, [
      `Tel de ${wat} één voor één.`,
      "Tik dan op het getal.",
    ]);
    const g = await beurtVan(p);
    stop();
    hr(l, { modus: null });
    if (g === null) {
      await l.zeg("Geen zorgen.", "We tellen ze samen.");
      await telSamen(l, vakjes, kleuren, { cijfers: true });
      await l.zeg(
        `Het zijn {${n}} ${wat}.`,
        "Dat zien we later.",
      );
      await l.verder();
      if (o.later && o.opnieuw) o.later.push(o.opnieuw);
      break;
    }
    const x = g.n;
    hr(l, { cijferMarkering: { n: x, kleur } });
    if (x === n) {
      goedGedaan = poging === 1;
      hr(l, { golf: golf() });
      if (o.samenBijGoed) {
        await l.zeg(
          kleuren.length === 1 ? `{${n}:${kleur}}?` : `{${n}}?`,
          "We tellen samen, vanaf {0}.",
        );
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
    if (poging >= 2) {
      /* 2× fout: Bliepo telt het voor en zegt het antwoord; de vraag komt later terug. */
      await l.zeg("Kijk, ik tel ze voor.");
      await telSamen(l, vakjes, kleuren, { cijfers: true });
      await l.zeg(
        `Het zijn {${n}} ${wat}.`,
        "Dat zien we later.",
      );
      await l.verder();
      if (o.later && o.opnieuw) o.later.push(o.opnieuw);
      break;
    }
    const een =
      x === 1
        ? wat
            .replace(/visjes\*?$/, (m) => m.replace("visjes", "visje"))
            .replace(/kwallen\*?$/, (m) => m.replace("kwallen", "kwal"))
        : wat;
    if (x > n) {
      await l.zeg(`{${x}} ${een}?`, "Dan heb je er te veel geteld.");
      await l.verder();
    } else {
      await l.zeg(`{${x}} ${een}?`, "We tellen ze samen.");
      await telSamen(l, vakjes, kleuren, { tot: x, cijfers: true });
      await l.zeg(
        "Ah, er zijn er nog over.",
        kleuren.length === 1
          ? `Dus het zijn er meer dan {${x}:${kleur}}.`
          : `Dus het zijn er meer dan {${x}}.`,
      );
      await l.verder();
    }
    hr(l, {
      nummers: {},
      cijferMarkering: null,
      fel: kleuren,
      cijfersUit: [x],
    });
    await l.zeg("Probeer het nog eens.", `Tel de ${wat} en tik op het getal.`);
  }
  hr(l, { nummers: {}, cijferMarkering: null, cijfers: false, cijfersUit: [] });
  return goedGedaan;
}

/**
 * "Van welke kleur zijn er …?": het kind tikt een visje van die kleur
 * (een plaatje kiezen, geen woord). Verkeerde kleur: samen tellen, "dus 7,
 * niet 9", dan laat Bliepo de goede zien en komt de vraag later terug.
 */
async function welkeKleur(
  l: Lesgids,
  st: Staat,
  vakjes: Kleur[],
  doel: Kleur,
  vraag: string[],
  later?: Later,
  opnieuw?: () => Promise<void>,
): Promise<boolean> {
  const n = vakjes.filter((k) => k === doel).length;
  hr(l, { vakjes, fel: null, nummers: {}, cijfers: false, rand: [] });
  await l.zeg(...vraag, "Tik op een visje van die kleur.");
  hr(l, { modus: "kleur" });
  zetAntwoord("kleur", { kleur: doel });
  const p = tikOfWeetNiet<KleurTik>(l, "kleur");
  await wijsWeetNiet(l, st);
  const stop = herinner(l, [
    "Tel elke kleur.",
    `Van welke kleur zijn er {${n}}?`,
  ]);
  const g = await beurtVan(p);
  stop();
  hr(l, { modus: null });
  if (g?.kleur === doel) {
    hr(l, { rand: [doel], golf: golf() });
    await telSamen(l, vakjes, [doel]);
    await l.zeg("Dat klopt.", `Er zijn {${n}} *${BIJ[doel]}* visjes.`);
    await l.verder();
    hr(l, { rand: [] });
    return true;
  }
  if (g === null) {
    await l.zeg("Geen zorgen.", `Kijk, de *${BIJ[doel]}* visjes.`);
    await telSamen(l, vakjes, [doel]);
    await l.zeg(
      `Er zijn {${n}} *${BIJ[doel]}* visjes.`,
      "Dat zien we later.",
    );
    await l.verder();
    if (later && opnieuw) later.push(opnieuw);
    return false;
  }
  const keuze = g.kleur;
  const m = vakjes.filter((k) => k === keuze).length;
  hr(l, { rand: [keuze] });
  await l.zeg(`{${n}} *${BIJ[keuze]}* visjes?`, "We tellen ze samen.");
  await telSamen(l, vakjes, [keuze]);
  await l.zeg(
    "Ah.",
    m === 1
      ? `Er is maar {1} *${BIJ[keuze]}* visje, niet {${n}}.`
      : `Er zijn {${m}} *${BIJ[keuze]}* visjes, niet {${n}}.`,
  );
  await l.verder();
  hr(l, { nummers: {}, rand: [doel] });
  await l.zeg(`Kijk, er zijn {${n}} *${BIJ[doel]}* visjes.`);
  await telSamen(l, vakjes, [doel]);
  await l.verder();
  hr(l, { rand: [] });
  if (later && opnieuw) later.push(opnieuw);
  return false;
}

/**
 * Zelf maken: tik een lege plek om er een visje te toveren, nog eens om het
 * weg te halen. Met verfbolletjes kies je eerst een kleur. `controle` geeft
 * `null` als het klopt, anders wat Bliepo zegt. 2× niet goed: Bliepo maakt het
 * voor (`oplossing`).
 */
async function inkleuren(
  l: Lesgids,
  st: Staat,
  verf: Kleur[],
  controle: (v: (Kleur | null)[]) => string[] | null,
  oplossing: () => (Kleur | null)[],
  hulp: string[],
): Promise<boolean> {
  const vakjes: (Kleur | null)[] = Array(21).fill(null);
  let gekozen = verf[0];
  let fout = 0;
  hr(l, {
    vakjes: [...vakjes],
    fel: null,
    nummers: {},
    cijfers: false,
    rand: [],
    verf: verf.length > 1 ? verf : null,
    gekozenVerf: gekozen,
  });
  zetAntwoord("inkleuren", { oplossing: oplossing() });
  for (;;) {
    hr(l, { modus: "inkleuren", klaarKnop: true });
    const p = l.wachtOpVlak<{ soort: string; index?: number; kleur?: Kleur }>([
      "vakje",
      "verf",
      "klaar",
    ]);
    await wijsKnop(l, st, "vinkje", "Ben je klaar?", "Tik dan op het vinkje.");
    const stop = herinner(l, hulp, 18000, false);
    const g = await beurtVan(p);
    stop();
    if (g.soort === "vakje" && g.index !== undefined) {
      vakjes[g.index] = vakjes[g.index] === gekozen ? null : gekozen;
      hr(l, { vakjes: [...vakjes] });
    } else if (g.soort === "verf" && g.kleur) {
      gekozen = g.kleur;
      hr(l, { gekozenVerf: gekozen });
    } else if (g.soort === "klaar") {
      hr(l, { modus: null, klaarKnop: false });
      const zin = controle(vakjes);
      if (!zin) {
        hr(l, { golf: golf() });
        return fout === 0;
      }
      fout++;
      if (fout >= 2) {
        const goed = oplossing();
        hr(l, { vakjes: goed });
        await l.zeg("Kijk, ik maak het voor je.", "Zo klopt het.");
        await l.verder();
        return false;
      }
      await l.zeg(...zin);
    }
  }
}

/* ---------- Kleuren tellen (G3) ---------- */

export const kleurenTellen: Lesdraaiboek = {
  id: "tellen-120-kleuren-tellen",
  titel: "Kleuren tellen",
  synthesis: "Color Count · Color Count",
  kaarttekening: KaartRooster,

  async speel(ruw) {
    const l = metVinkje(ruw);
    const st = nieuweStaat();
    const later: Later = [];
    const vijf: Kleur[] = ["rood", "oranje", "paars", "blauw", "geel"];

    l.vlak(TelRooster, {
      vakjes: rooster(verdeel(vijf, [5, 4, 4, 4, 4])),
      voorwerp: "visje",
    });
    await l.zeg(
      "Hoi!",
      "Kijk, een school *lichtvisjes*.",
      "Daarmee gaan we tellen.",
    );
    const weet = await weetJeDitAl(l, st, [
      "Weet je al hoe je visjes van één kleur telt?",
    ]);
    if (weet === "ja") {
      /* Korte proef: één keer tellen, één keer de kleur zoeken. */
      await l.zeg("Mooi.", "Laat maar eens zien.");
      let v = rooster([
        ["blauw", 7],
        ["rood", 6],
        ["geel", 5],
        ["groen", 3],
      ]);
      hr(l, { vakjes: v, fel: null });
      const a = await telVraag(l, st, v, ["blauw"], "*blauwe* visjes");
      v = rooster([
        ["rood", 8],
        ["groen", 6],
        ["paars", 4],
        ["oranje", 3],
      ]);
      const b = await welkeKleur(l, st, v, "groen", [
        "Van welke kleur zijn er {6}?",
      ]);
      if (a && b) {
        const tik = l.kaart();
        await l.zeg(
          metNaam(l, "Knap gedaan!"),
          "Je kunt al visjes tellen.",
          "Tik op de kaart om hem af te vinken.",
        );
        await tik;
        return;
      }
      await l.zeg("Goed geprobeerd.", "We oefenen het samen.");
    } else if (weet === "nee") {
      await l.zeg("Geen probleem.", "We doen het samen.");
    } else {
      await l.zeg("Geen zorgen.", "We tellen de visjes één voor één.");
    }

    /* 1. Een lievelingskleur kiezen en tellen; ook bij goed één keer samen natellen. */
    let vakjes: Kleur[] = rooster(verdeel(vijf, [5, 4, 4, 4, 4]));
    hr(l, { vakjes, fel: null, rand: [] });
    await l.zeg(
      "Kies eerst een kleur.",
      "Tik op een visje in je lievelingskleur.",
    );
    const eerste = await kiesKleur(l);
    hr(l, { fel: [eerste], rand: [eerste] });
    await l.zeg("Oké, mooi.", `We tellen eerst de *${BIJ[eerste]}* visjes.`);
    await l.verder();
    hr(l, { rand: [] });
    const vraag = (v: (Kleur | null)[], k: Kleur[], wat: string) =>
      async function opnieuw() {
        const nieuw = schud(v as Kleur[]);
        hr(l, { vakjes: nieuw, fel: null, rand: [] });
        await l.wacht(500);
        await telVraag(l, st, nieuw, k, wat);
      };
    await telVraag(l, st, vakjes, [eerste], `*${BIJ[eerste]}* visjes`, {
      samenBijGoed: true,
      later,
      opnieuw: vraag(vakjes, [eerste], `*${BIJ[eerste]}* visjes`),
    });

    /* 2. Een grotere groep. */
    const anders = schud(vijf.filter((k) => k !== eerste));
    vakjes = rooster([
      [anders[0], 7],
      [anders[1], 5],
      [eerste, 4],
      [anders[2], 3],
      [anders[3], 2],
    ]);
    hr(l, { vakjes, fel: null, nummers: {}, cijfers: false });
    await l.zeg(
      "Nu proberen we een grotere groep.",
      "Tik op een visje in een andere kleur.",
    );
    const tweede = await kiesKleur(l, [eerste]);
    hr(l, { fel: [tweede] });
    await l.zeg(`Oké, deze keer tellen we de *${BIJ[tweede]}* visjes.`);
    await l.wacht(300);
    await telVraag(l, st, vakjes, [tweede], `*${BIJ[tweede]}* visjes`, {
      later,
      opnieuw: vraag(vakjes, [tweede], `*${BIJ[tweede]}* visjes`),
    });

    /* 3. Nog drie keer tellen, steeds een nieuw rooster. */
    const reeks: [Kleur, [Kleur, number][], string][] = [
      [
        "geel",
        [
          ["geel", 6],
          ["blauw", 5],
          ["rood", 5],
          ["groen", 5],
        ],
        "Nu de *gele* visjes.",
      ],
      [
        "groen",
        [
          ["groen", 8],
          ["paars", 6],
          ["oranje", 4],
          ["rood", 3],
        ],
        "En nu de *groene* visjes.",
      ],
      [
        "rood",
        [
          ["rood", 9],
          ["blauw", 6],
          ["geel", 6],
        ],
        "Nog één: de *rode* visjes.",
      ],
    ];
    for (const [k, verdeling, zin] of reeks) {
      vakjes = rooster(verdeling);
      hr(l, { vakjes, fel: null, nummers: {} });
      await l.zeg("Ik maak een nieuwe school.", zin);
      await telVraag(l, st, vakjes, [k], `*${BIJ[k]}* visjes`, {
        later,
        opnieuw: vraag(vakjes, [k], `*${BIJ[k]}* visjes`),
      });
    }

    /* 4. Omgekeerd: van welke kleur zijn er …? (drie keer) */
    const omgekeerd: [Kleur, [Kleur, number][], string[]][] = [
      [
        "blauw",
        [
          ["rood", 7],
          ["blauw", 9],
          ["groen", 4],
          ["paars", 1],
        ],
        ["Nu doen we het een beetje anders.", "Van welke kleur zijn er {9}?"],
      ],
      [
        "paars",
        [
          ["rood", 6],
          ["groen", 4],
          ["paars", 8],
          ["blauw", 3],
        ],
        ["Probeer deze eens.", "Van welke kleur zijn er {8}?"],
      ],
      [
        "oranje",
        [
          ["oranje", 5],
          ["geel", 7],
          ["blauw", 6],
          ["rood", 3],
        ],
        ["En deze.", "Van welke kleur zijn er {5}?"],
      ],
    ];
    for (const [doel, verdeling, zinnen] of omgekeerd) {
      const v = rooster(verdeling);
      const nogEens = async () => {
        await welkeKleur(l, st, schud(v), doel, [
          "Weet je deze nog?",
          ...zinnen.slice(1),
        ]);
      };
      await welkeKleur(l, st, v, doel, zinnen, later, nogEens);
    }

    /* 5. Twee kleuren samen (drie keer): eerst zelf kiezen, dan twee keer met kleuren van Bliepo. */
    const zes: Kleur[] = ["rood", "oranje", "geel", "groen", "blauw", "paars"];
    const verdeling = verdeel(zes, [4, 4, 4, 3, 3, 3]);
    vakjes = rooster(verdeling);
    hr(l, { vakjes, fel: null, nummers: {}, rand: [] });
    await l.zeg(
      metNaam(l, "Oké."),
      "Kies nu twee kleuren.",
      "Tik op een visje van elke kleur.",
    );
    const a = await kiesKleur(l);
    hr(l, { rand: [a] });
    const b = await kiesKleur(l, [a]);
    hr(l, { rand: [a, b], fel: [a, b] });
    await l.zeg(`Dus deze keer nemen we *${a}* en *${b}*.`);
    await l.wacht(300);
    vakjes = rooster(verdeling);
    hr(l, { vakjes, rand: [] });
    await l.zeg(
      "Ik schud de visjes even door elkaar.",
      "We tellen de twee kleuren samen.",
    );
    await telVraag(l, st, vakjes, [a, b], `*${BIJ[a]}* en *${BIJ[b]}* visjes`, {
      later,
      opnieuw: vraag(vakjes, [a, b], `*${BIJ[a]}* en *${BIJ[b]}* visjes`),
    });

    const paren: [Kleur, Kleur, [Kleur, number][]][] = [
      [
        "rood",
        "geel",
        [
          ["rood", 3],
          ["geel", 4],
          ["blauw", 7],
          ["groen", 7],
        ],
      ],
      [
        "blauw",
        "groen",
        [
          ["blauw", 5],
          ["groen", 3],
          ["paars", 7],
          ["oranje", 6],
        ],
      ],
    ];
    for (const [k1, k2, vd] of paren) {
      vakjes = rooster(vd);
      hr(l, { vakjes, fel: [k1, k2], nummers: {}, rand: [k1, k2] });
      await l.zeg(`Nu de *${BIJ[k1]}* en de *${BIJ[k2]}* visjes samen.`);
      await l.wacht(300);
      hr(l, { rand: [] });
      await telVraag(
        l,
        st,
        vakjes,
        [k1, k2],
        `*${BIJ[k1]}* en *${BIJ[k2]}* visjes`,
        {
          later,
          opnieuw: vraag(
            vakjes,
            [k1, k2],
            `*${BIJ[k1]}* en *${BIJ[k2]}* visjes`,
          ),
        },
      );
    }

    /* 6. Zelf maken: 4 paarse, dan 7 blauwe visjes. */
    const zelfMaken = async (k: Kleur, doel: number, eerst: boolean) => {
      hr(l, {
        vakjes: Array(21).fill(null),
        fel: null,
        rand: [],
        nummers: {},
        verf: null,
      });
      await l.zeg(
        eerst ? "Nu maak je het zelf." : "Nog een keer zelf maken.",
        `Tover {${doel}} *${BIJ[k]}* visjes.`,
        "Tik op een lege plek.",
      );
      await inkleuren(
        l,
        st,
        [k],
        (v) => {
          const n = v.filter((x) => x === k).length;
          if (n === doel) return null;
          if (n === 0)
            return [
              "Tik op de lege plekken.",
              `Dan komt er een *${BIJ[k]}* visje.`,
            ];
          if (n > doel)
            return [
              "Dat zijn er een paar te veel.",
              "Tik op een visje om het weer weg te halen.",
            ];
          return [
            "Dat zijn er nog te weinig.",
            `Je hebt er nu {${n}:${k}}.`,
            "Tik op een lege plek.",
          ];
        },
        () => Array.from({ length: 21 }, (_, i) => (i < doel ? k : null)),
        [
          `Tover {${doel}} *${BIJ[k]}* visjes.`,
          "Tik op een lege plek.",
          "Tik op het vinkje als je klaar bent.",
        ],
      );
      await l.zeg("Goed zo.", `{${doel}} *${BIJ[k]}* visjes.`);
      await l.verder();
    };
    await zelfMaken("paars", 4, true);
    await zelfMaken("blauw", 7, false);

    /* 7. Verdelen: het hele rooster vol, in twee keer. */
    const verdelen = async (doelen: [Kleur, number][], inleiding: string[]) => {
      await l.zeg(...inleiding);
      await l.verder();
      hr(l, { vakjes: Array(21).fill(null), verf: null });
      await l.zeg(
        ...doelen.map(([k, n]) => `Maak {${n}} *${BIJ[k]}* visjes.`),
        "Tik eerst op een verfbolletje.",
      );
      await inkleuren(
        l,
        st,
        doelen.map(([k]) => k),
        (v) => {
          for (const [k, doel] of doelen) {
            const n = v.filter((x) => x === k).length;
            if (n !== doel)
              return [
                `Kijk nog eens naar de *${BIJ[k]}* visjes.`,
                `Je hebt er nu {${n}:${k}}.`,
                `Er moeten er {${doel}:${k}} zijn.`,
                n > doel
                  ? "Tik op een visje om het weg te halen."
                  : "Kies de kleur en tik op een lege plek.",
              ];
          }
          return null;
        },
        () => doelen.flatMap(([k, n]) => Array<Kleur>(n).fill(k)),
        [
          "Tik eerst op een verfbolletje.",
          "Tik dan op een lege plek.",
          "Tik op het vinkje als je klaar bent.",
        ],
      );
      hr(l, { verf: null });
      await l.zeg("Knap gedaan.", "Het hele rooster is vol.");
      await l.verder();
    };
    await verdelen(
      [
        ["rood", 4],
        ["blauw", 7],
        ["groen", 10],
      ],
      ["Nog twee laatste opdrachten.", "Zullen we meer kleuren gebruiken?"],
    );
    await verdelen(
      [
        ["geel", 6],
        ["paars", 7],
        ["oranje", 8],
      ],
      ["En nu de allerlaatste."],
    );

    /* De vragen die nog terug moesten komen. */
    await speelLater(l, later, [
      "We doen nog een paar vragen van net.",
      "Weet je ze nu?",
    ]);

    const tik = l.kaart();
    await l.zeg(
      metNaam(l, "Echt knap!"),
      "Je hebt helemaal tot {10} geteld.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* =====================================================================
   De schelpen (Tellen van 10 tot 20, en vraag 4 van de toetsen)
   ===================================================================== */

type TS = TelSchelpenProps;
const hs = (l: Lesgids, p: Partial<TS>) => l.pasVlakAan<TS>(p);
type SchelpTik = { soort: "tik"; strook: 1 | 2; gevuld: boolean };

/**
 * Een keuzevraag over een getal (cijfers). 1× fout: Bliepo benoemt de
 * denkfout en het kind probeert opnieuw. 2× fout of "weet ik niet": het
 * antwoord, en de vraag komt later terug.
 */
async function getalVraag(
  l: Lesgids,
  st: Staat,
  vraag: string[],
  opties: string[],
  goed: string,
  denkfout: (keuze: string) => string[],
  opnieuw: string[],
  antwoord: string[],
  later?: { lijst: Later; vraag: () => Promise<void> },
): Promise<boolean> {
  await l.zeg(...vraag);
  zetAntwoord("kies", { waarde: goed });
  for (let poging = 1; ; poging++) {
    const p = l.kies(opties);
    if (poging === 1) await wijsWeetNiet(l, st);
    const k = await beurtVan(p);
    if (k === goed) {
      hs(l, { golf: golf() });
      return true;
    }
    if (k === null || poging >= 2) {
      await l.zeg(
        k === null ? "Geen zorgen." : "Ik help je even.",
        ...antwoord,
        "Dat zien we later.",
      );
      await l.verder();
      if (later) later.lijst.push(later.vraag);
      return false;
    }
    await l.zeg(...denkfout(k));
    await l.verder();
    await l.zeg("Probeer het nog eens.", ...opnieuw);
  }
}

/** Vier verschillende aantallen rond `n` (0–10), oplopend. */
function rond(n: number): number[] {
  const kandidaten = [n, n - 1, n + 1, n + 2, n - 2, n + 3, n - 3].filter(
    (x) => x >= 0 && x <= 10,
  );
  return [...new Set(kandidaten)].slice(0, 4).sort((a, b) => a - b);
}

/** Wacht op een tik op de schelp (`strook`); geeft door hoe vaak. */
async function tikSchelp(
  l: Lesgids,
  strook: 1 | 2,
  hulp: string[],
): Promise<void> {
  for (;;) {
    hs(l, { modus: strook === 1 ? "links" : "rechts" });
    zetAntwoord("schelp", { strook }, true);
    const stop = herinner(l, hulp, 15000, false);
    const g = await beurtVan(l.wachtOpVlak<SchelpTik>("tik"));
    stop();
    if (g.strook === strook) {
      hs(l, { modus: null });
      return;
    }
  }
}

/**
 * Bouwen in de tweede schelp: tik parels weg of lege plekken vol tot het getal
 * klopt, dan het vinkje. 1× niet goed: samen kijken (eerst de 10, dan de
 * losse, welk getal is dat?). 2× niet goed: Bliepo bouwt het voor, en het
 * getal komt later terug.
 */
async function bouw(
  l: Lesgids,
  st: Staat,
  doel: number,
  staat: { rechts: number },
  hulp: string,
  later?: Later,
): Promise<void> {
  hs(l, { onderstreept: doel, nummersLinks: false });
  await l.zeg(`Maak het getal {${doel}}.`, hulp);
  const mijnAntwoord = zetAntwoord("bouw", { rechts: doel - 10 });
  for (let fout = 0; ;) {
    hs(l, { modus: "bouw", klaarKnop: true });
    const p = l.wachtOpVlak<{
      soort: string;
      strook?: number;
      gevuld?: boolean;
    }>(["tik", "klaar"]);
    await wijsKnop(l, st, "vinkje", "Ben je klaar?", "Tik dan op het vinkje.");
    const stop = herinner(
      l,
      [
        "Kijk naar de tweede schelp.",
        hulp,
        "Tik op het vinkje als je klaar bent.",
      ],
      15000,
      false,
    );
    const g = await beurtVan(p);
    stop();
    if (g.soort === "tik") {
      staat.rechts = Math.max(
        0,
        Math.min(10, staat.rechts + (g.gevuld ? -1 : 1)),
      );
      hs(l, { rechts: staat.rechts });
      continue;
    }
    hs(l, { modus: null, klaarKnop: false });
    const r = staat.rechts;
    if (10 + r === doel) {
      hs(l, { golf: golf() });
      await l.zeg(
        fout === 0 ? "Goed zo." : "Ja, nu klopt het.",
        `Dat is {${doel}}.`,
      );
      await l.wacht(600);
      hs(l, { onderstreept: null });
      return;
    }
    fout++;
    if (fout >= 2) {
      /* Bliepo doet het voor. */
      staat.rechts = doel - 10;
      await l.zeg("Kijk, ik help je even.");
      hs(l, { rechts: staat.rechts });
      await l.zeg(
        `Een volle schelp is {10}.`,
        staat.rechts === 1
          ? "En nog {1} erbij."
          : `En nog {${staat.rechts}} erbij.`,
        `Samen is dat {${doel}}.`,
      );
      await l.verder();
      hs(l, { onderstreept: null });
      if (later)
        later.push(async () => {
          staat.rechts = Math.max(0, staat.rechts - 3);
          hs(l, { rechts: staat.rechts });
          await bouw(l, st, doel, staat, "Tik parels weg of leg er een bij.");
        });
      return;
    }
    /* Samen kijken: eerst de 10, dan de losse, dan welk getal dat is. */
    await l.zeg(`We zoeken het getal {${doel}}.`, "We kijken samen.");
    await l.verder();
    hs(l, { nummersLinks: true, gloei: 2 });
    await l.zeg(
      "In de eerste schelp liggen er {10}.",
      "Kijk nu naar de tweede schelp.",
      "Hoeveel parels liggen daar?",
    );
    zetAntwoord("kies", { waarde: String(r) }, true);
    const k1 = await beurtVan(l.kies(rond(r).map(String)));
    await l.zeg(
      k1 === String(r)
        ? "Goed."
        : r === 1
          ? "Er ligt {1} parel."
          : `Er liggen {${r}} parels.`,
      `{10} en nog {${r}}.`,
      "Welk getal is dat?",
    );
    const opties = [...new Set([r, 10 + r - 1, 10 + r, 10 + r + 1])]
      .filter((x) => x <= 20 && x >= 0)
      .sort((a, b) => a - b)
      .map(String);
    zetAntwoord("kies", { waarde: String(10 + r) }, true);
    const k2 = await beurtVan(l.kies(opties));
    await l.zeg(
      k2 === String(10 + r) ? `Goed, {${10 + r}}.` : `Het is {${10 + r}}.`,
      `Maar we maken het getal {${doel}}.`,
    );
    hs(l, { nummersLinks: false, gloei: null });
    herstelAntwoord(mijnAntwoord);
    await l.verder();
    await l.zeg(
      `Maak het getal {${doel}}.`,
      doel > 10 + r
        ? "Tik op een lege plek om er een parel te leggen."
        : "Tik op een parel om hem weg te halen.",
    );
  }
}

/* ---------- Tellen van 10 tot 20 (G4) ---------- */

export const tellenNa10: Lesdraaiboek = {
  id: "tellen-120-na-tien",
  titel: "Tellen van 10 tot 20",
  synthesis: "Color Count · The Next 10",
  kaarttekening: KaartTienstrook,

  async speel(ruw) {
    const l = metVinkje(ruw);
    const st = nieuweStaat();
    const later: Later = [];
    const staat = { links: 0, rechts: 0 };

    l.vlak(TelSchelpen, { links: 0, rechts: 0 });
    await l.zeg("Hoi!", "Kijk, een schelp met plekken voor parels.");
    const weet = await weetJeDitAl(l, st, [
      "We gaan tellen na {10}.",
      "Kun je dit al?",
    ]);
    if (weet === "ja") {
      await l.zeg("Mooi.", "Laat maar eens zien.");
      hs(l, { links: 10, rechts: 3, tweede: true, zonderLijst: true });
      await l.wacht(700);
      const a = await getalVraag(
        l,
        st,
        ["Welk getal is dit?"],
        ["3", "13", "14", "31"],
        "13",
        () => [],
        [],
        ["{10} en nog {3} is {13}."],
      );
      hs(l, { rechts: 7 });
      await l.wacht(500);
      const b = a
        ? await getalVraag(
            l,
            st,
            ["En dit?"],
            ["7", "16", "17", "71"],
            "17",
            () => [],
            [],
            ["{10} en nog {7} is {17}."],
          )
        : false;
      if (a && b) {
        const tik = l.kaart();
        await l.zeg(
          metNaam(l, "Knap gedaan!"),
          "Je kunt al tellen van {10} tot {20}.",
          "Tik op de kaart om hem af te vinken.",
        );
        await tik;
        return;
      }
      await l.zeg("Goed geprobeerd.", "We oefenen het samen.");
      hs(l, { links: 0, rechts: 0, tweede: false, zonderLijst: false });
      await l.wacht(500);
    } else if (weet === "nee") {
      await l.zeg("Geen probleem.", "We doen het samen.");
    } else {
      await l.zeg("Geen zorgen.", "Na {10} tellen we gewoon verder.");
    }

    /* 1. Eén schelp: tik tot hij vol is en tel mee. */
    await l.zeg(
      "Hoeveel parels passen in deze schelp?",
      "Tik op de schelp om een parel te leggen.",
    );
    while (staat.links < 10) {
      await tikSchelp(l, 1, [
        "Tik op de schelp.",
        "Dan komt er een parel bij.",
      ]);
      staat.links++;
      hs(l, { links: staat.links });
    }
    hs(l, { golf: golf() });
    await l.wacht(400);
    await l.zeg("Een volle schelp is {10}.", "Een groep van {10}.");
    await l.verder();

    /* 2. Wat komt er na 10? */
    hs(l, { tweede: true });
    await l.zeg(
      "Maar wat komt er na {10}?",
      "Leg een parel in de tweede schelp.",
    );
    await tikSchelp(l, 2, ["Tik op de tweede schelp."]);
    staat.rechts = 1;
    hs(l, { rechts: 1 });
    const vraag11 = async () => {
      hs(l, { rechts: 1 });
      await getalVraag(
        l,
        st,
        ["Kijk: {10} en nog {1}.", "Welk getal is dit?"],
        ["1", "10", "11", "101"],
        "11",
        () => [],
        [],
        ["{10} en nog {1} is {11}."],
      );
    };
    const goed11 = await getalVraag(
      l,
      st,
      [
        "Nu heb je een groep van {10}.",
        "En er komt {1} bij.",
        "Welk getal is dit?",
      ],
      ["1", "10", "11", "101"],
      "11",
      (k) =>
        k === "101"
          ? [
              "Ah, ik snap waarom je dat denkt.",
              "Je zette de {10} en de {1} naast elkaar.",
            ]
          : k === "1"
            ? [
                "Dat is alleen de tweede schelp.",
                "Kijk ook naar de groep van {10}.",
              ]
            : ["{10} is alleen de volle schelp.", "Er komt nog {1} bij."],
      ["Een groep van {10}, en nog {1}.", "Welk getal is dit?"],
      ["Na {10} komt {11}.", "{10} en nog {1} is {11}."],
      { lijst: later, vraag: vraag11 },
    );

    /* Hoe heet 11? (Woorden: Bliepo leest ze voor als je erop tikt.) */
    await l.zeg(
      goed11 ? "Goed." : "",
      "Weet je hoe dit getal heet?",
      "Tik op een woord, dan hoor je het.",
    );
    for (let poging = 1; ; poging++) {
      if (poging === 1) zetAntwoord("kies", { waarde: "elf" });
      const k = await beurtVan(l.kies(["tieneen", "elf", "twaalf", "dertien"]));
      if (k === "elf") {
        hs(l, { golf: golf() });
        await l.zeg("Heel goed, *elf*.", "Dat zetten we naast de schelpen.");
        break;
      }
      if (k === null) {
        await l.zeg(
          "Geen zorgen.",
          "We zeggen *elf*.",
          "Dat zetten we naast de schelpen.",
        );
        break;
      }
      if (k === "tieneen")
        await l.zeg(
          "Ik snap wat je denkt.",
          "Zo hebben we het gemaakt.",
          "Maar we zeggen *elf*.",
        );
      else
        await l.zeg(
          `*${k[0].toUpperCase()}${k.slice(1)}* komt straks.`,
          "Dit getal heet *elf*.",
        );
      await l.verder();
      if (poging >= 2) {
        await l.zeg("Dat zetten we naast de schelpen.");
        break;
      }
      await l.zeg("Probeer het nog eens.", "Hoe heet dit getal?");
    }
    const lijst = [10, 11];
    hs(l, { lijst: [...lijst] });
    await l.verder();

    /* 3. 12 en 13. */
    await l.zeg(
      "Daar bewaren we al onze getallen.",
      "Leg er nog een parel bij.",
    );
    await tikSchelp(l, 2, ["Tik op de tweede schelp."]);
    staat.rechts = 2;
    hs(l, { rechts: 2 });
    const goed12 = await getalVraag(
      l,
      st,
      [
        "Je hebt nog steeds een groep van {10}.",
        "Nu komen er {2} bij.",
        "Welk getal heb je gemaakt?",
      ],
      ["2", "10", "12", "102"],
      "12",
      (k) =>
        k === "102"
          ? [
              "Ah, ik snap waarom je dat denkt.",
              "Je zette de {10} en de {2} naast elkaar.",
            ]
          : k === "2"
            ? [
                "Dat is alleen de tweede schelp.",
                "Kijk ook naar de groep van {10}.",
              ]
            : ["{10} is alleen de volle schelp.", "Er komen nog {2} bij."],
      ["Een groep van {10}, en nog {2}.", "Welk getal is dit?"],
      ["{10} en nog {2} is {12}."],
      {
        lijst: later,
        vraag: async () => {
          hs(l, { rechts: 2 });
          await getalVraag(
            l,
            st,
            ["Kijk: {10} en nog {2}.", "Welk getal is dit?"],
            ["2", "10", "12", "102"],
            "12",
            () => [],
            [],
            ["{10} en nog {2} is {12}."],
          );
        },
      },
    );
    lijst.push(12);
    hs(l, { lijst: [...lijst] });
    if (goed12) {
      await l.zeg("Dat klopt.", "{10} en nog {2} is {12}.");
      await l.verder();
    }

    const goed13 = await getalVraag(
      l,
      st,
      ["Wat komt er na {12}?"],
      ["3", "13", "31", "14"],
      "13",
      (k) =>
        k === "31"
          ? ["Ah, ik snap waarom je dat denkt.", "Je draaide de cijfers om."]
          : k === "14"
            ? ["Dat is er één te ver.", "Wat komt er direct na {12}?"]
            : [
                "Kijk ook naar de groep van {10}.",
                "{3} is alleen de tweede schelp.",
              ],
      ["Wat komt er na {12}?"],
      ["Na {12} komt {13}."],
      {
        lijst: later,
        vraag: async () => {
          hs(l, { rechts: 3 });
          await getalVraag(
            l,
            st,
            ["Kijk: {10} en nog {3}.", "Welk getal is dit?"],
            ["3", "13", "31", "14"],
            "13",
            () => [],
            [],
            ["{10} en nog {3} is {13}."],
          );
        },
      },
    );
    staat.rechts = 3;
    lijst.push(13);
    hs(l, { rechts: 3, lijst: [...lijst] });
    await l.zeg(
      goed13 ? "Ja, het getal {13}." : "",
      "Kijk, ons lijstje groeit.",
    );
    await l.verder();

    /* 4. Zelf doortikken tot 19. */
    await l.zeg("Blijf nu tikken tot de schelpen bijna vol zijn.");
    while (staat.rechts < 9) {
      await tikSchelp(l, 2, ["Tik op de tweede schelp."]);
      staat.rechts++;
      lijst.push(10 + staat.rechts);
      hs(l, { rechts: staat.rechts, lijst: [...lijst] });
    }
    await l.wacht(400);
    const goed20 = await getalVraag(
      l,
      st,
      [
        "We stoppen hier even.",
        "Je hebt tot {19} geteld.",
        "Weet je welk getal hierna komt?",
      ],
      ["20", "21", "191", "1010"],
      "20",
      (k) =>
        k === "1010"
          ? ["Ik snap wat je denkt.", "Je zette twee tienen naast elkaar."]
          : k === "191"
            ? ["Ik snap wat je denkt.", "Je zette {19} en {1} naast elkaar."]
            : ["{21} is er één te ver.", "Wat komt er direct na {19}?"],
      ["Welk getal komt na {19}?"],
      ["Na {19} komt {20}."],
    );
    staat.rechts = 10;
    lijst.push(20);
    hs(l, { rechts: 10, lijst: [...lijst] });
    await l.zeg(
      goed20 ? "Heel goed." : "Kijk.",
      "Twee groepen van {10} is {20}.",
    );
    await l.verder();

    /* 5. Het spel: bouw het getal (11 getallen). */
    await l.zeg(
      "Je bent goed begonnen.",
      "Nu doen we een spel.",
      "Ik zeg een getal, jij bouwt het.",
    );
    await l.verder();
    await bouw(
      l,
      st,
      10,
      staat,
      "Tik op parels in de tweede schelp om ze weg te halen.",
      later,
    );
    await bouw(
      l,
      st,
      17,
      staat,
      "Tik op een lege plek om er een parel te leggen.",
      later,
    );
    const verder = [14, 12, 19, 15, 11, 18, 13, 16, 20];
    for (const n of verder)
      await bouw(l, st, n, staat, "Tik parels weg of leg er een bij.", later);

    await speelLater(l, later, [
      "We doen er nog een paar van net.",
      "Weet je ze nu?",
    ]);

    const tik = l.kaart();
    await l.zeg(
      metNaam(l, "Knap gedaan!"),
      "Je kunt nu tellen van {10} tot {20}.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* =====================================================================
   Getallen tot 20 schrijven (G4b, nieuw)
   ===================================================================== */

type TW = TelSchrijvenProps;
const hw = (l: Lesgids, p: Partial<TW>) => l.pasVlakAan<TW>(p);
let opgaveTeller = 0;

const CIJFERWOORD = [
  "nul",
  "één",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
];
const getalWoord = (n: number) =>
  n < 10 ? CIJFERWOORD[n] : (GETALWOORD[n] ?? String(n));
const schelpen = (n: number) =>
  n === 1 ? "één volle schelp" : `${CIJFERWOORD[n]} volle schelpen`;
const losse = (n: number) =>
  n === 0
    ? "geen losse parels erbij"
    : n === 1
      ? "één losse parel"
      : `${CIJFERWOORD[n]} losse parels`;

/**
 * Eén cijferkaart kiezen voor het actieve vak (of typen). 1× fout: de kaart
 * groot met een rode rand, de schelp gloeit, "die kaart is vijf". 2× fout:
 * Bliepo telt voor met nummertjes en alleen de goede kaart blijft over.
 * Geeft terug of het zonder hulp ging.
 */
async function kiesCijfer(
  l: Lesgids,
  st: Staat,
  o: {
    goed: number;
    tel: number;
    strook: 1 | 2;
    vak: number;
    vraag: string[];
    volle?: boolean;
    hulpZin: string;
    vakken: string[];
  },
): Promise<boolean> {
  const { goed } = o;
  hw(l, {
    modus: "kies",
    actiefVak: o.vak,
    kaartenUit: [],
    groteKaart: null,
    nummers: 0,
    gloei: null,
  });
  await l.zeg(...o.vraag);
  zetAntwoord("kaart", { n: goed });
  let uit: number[] = [];
  for (let poging = 1; ; poging++) {
    hw(l, { modus: "kies", kaartenUit: uit });
    const p = tikOfWeetNiet<{ soort: "cijfer"; n: number }>(l, "cijfer");
    if (poging === 1) {
      await wijsWeetNiet(l, st);
      await wijsKnop(
        l,
        st,
        "vak",
        "Je mag het cijfer ook typen.",
        "Tik dan hier.",
      );
    }
    const stop = herinner(l, [o.hulpZin], 15000, true, () =>
      hw(l, { gloei: o.strook }),
    );
    const g = await beurtVan(p);
    stop();
    hw(l, { modus: null, gloei: null });
    const telVoor = async () => {
      if (o.volle) {
        hw(l, { gloei: o.strook });
        await l.zeg(
          o.tel === 1
            ? "Kijk, er is {1:roze} volle schelp."
            : `Kijk, er zijn {${o.tel}:roze} volle schelpen.`,
        );
        hw(l, { gloei: null });
        return;
      }
      for (let i = 1; i <= o.tel; i++) {
        hw(l, { nummers: i });
        await l.zeg(`{${i}}`);
      }
    };
    if (g === null) {
      await l.zeg("Geen zorgen.");
      if (o.tel === 0)
        await l.zeg(
          "Er ligt geen enkele parel.",
          "Het getal voor niets is *nul*.",
        );
      else await telVoor();
      await l.zeg(`Het is {${goed}}.`, "Dat zien we later.");
      const vakken = [...o.vakken];
      vakken[o.vak] = String(goed);
      hw(l, { vakken, nummers: 0 });
      await l.verder();
      return false;
    }
    if (g.n === goed) {
      const vakken = [...o.vakken];
      vakken[o.vak] = String(goed);
      hw(l, {
        vakken,
        kaartenUit: [],
        groteKaart: null,
        nummers: 0,
        golf: golf(),
      });
      if (goed === 0 && !o.volle)
        await l.zeg(
          "Ja, {0}.",
          "Geen enkele.",
          "Het getal voor niets is *nul*.",
        );
      else await l.zeg(poging === 1 ? "Ja!" : "Goed zo.", `{${goed}}.`);
      return poging === 1;
    }
    if (poging === 1) {
      /* 1× fout: de gekozen kaart groot met een rode rand, de schelp gloeit. */
      hw(l, { groteKaart: g.n, gloei: o.strook });
      if (o.vak === 0 && o.volle)
        await l.zeg(
          `Die kaart is {${g.n}}.`,
          "Het eerste vak is voor de volle schelpen.",
        );
      else
        await l.zeg(
          `Die kaart is {${g.n}}.`,
          "Tel de parels en zoek dan dat getal.",
        );
      await l.verder();
      hw(l, { groteKaart: null, gloei: null });
      uit = [g.n];
      continue;
    }
    /* 2× fout: Bliepo telt voor, alleen de goede kaart blijft over. */
    await telVoor();
    uit = Array.from({ length: 10 }, (_, i) => i).filter((i) => i !== goed);
    hw(l, { kaartenUit: uit });
    await l.zeg(
      o.tel === 0
        ? "Er ligt geen enkele parel."
        : o.volle
          ? ""
          : `Dus er liggen {${o.tel}} parels.`,
      "Tik dat getal.",
    );
  }
}

/** Eén cijfer overtrekken. Geeft terug of het kind het zelf schreef. */
async function schrijfCijfer(
  l: Lesgids,
  cijfer: number,
  vak: number,
  spoor: boolean,
  zinnen: string[],
): Promise<boolean> {
  hw(l, {
    modus: "schrijf",
    actiefVak: vak,
    schrijfCijfer: cijfer,
    spoor,
    kaartenUit: [],
    groteKaart: null,
  });
  await l.zeg(...zinnen);
  zetAntwoord("schrijf", { cijfer });
  const stop = herinner(
    l,
    [
      "Begin bij de groene stip en volg de puntjes.",
      "Of tik op de groene stip.",
    ],
    16000,
    false,
    () => hw(l, { spoor: true }),
  );
  const g = await beurtVan(
    l.wachtOpVlak<{ soort: "geschreven"; zelf: boolean }>("geschreven"),
  );
  stop();
  hw(l, { modus: null, schrijfCijfer: null, golf: golf() });
  if (g.zelf)
    await l.zeg("Kijk, zo schrijf je een *" + CIJFERWOORD[cijfer] + "*.");
  else await l.zeg("Mooi geschreven!");
  return !g.zelf;
}

/** Eén opgave: tellen, de kaart(en) kiezen, en het getal schrijven. Geeft terug of alles zonder hulp ging. */
async function schrijfOpgave(
  l: Lesgids,
  st: Staat,
  n: number,
  spoor: boolean,
  eerste: { tellen: boolean; schrijven: boolean; tien: boolean },
): Promise<boolean> {
  const twee = n >= 10;
  const vakken = twee ? ["", ""] : [""];
  opgaveTeller++;
  hw(l, {
    aantal: n,
    vakken,
    modus: null,
    opgave: opgaveTeller,
    nummers: 0,
    groteKaart: null,
    kaartenUit: [],
    gloei: null,
  });
  await l.wacht(700);
  let zonderHulp = true;
  if (!twee) {
    const ok = await kiesCijfer(l, st, {
      goed: n,
      tel: n,
      strook: 1,
      vak: 0,
      vakken,
      vraag: eerste.tellen
        ? ["Hoeveel plekken zijn gevuld?", "Tik op de kaart met dat getal."]
        : ["Hoeveel parels zie je?"],
      hulpZin: "Tel de gevulde plekken één voor één.",
    });
    eerste.tellen = false;
    zonderHulp = ok;
    const zelf = await schrijfCijfer(l, n, 0, spoor || !ok, [
      `Schrijf *${CIJFERWOORD[n]}*.`,
      ...(eerste.schrijven
        ? ["Begin bij de groene stip.", "Volg de puntjes met je vinger."]
        : ["Begin bij de groene stip."]),
    ]);
    eerste.schrijven = false;
    return zonderHulp && zelf;
  }
  /* 10–20: twee vakken. Eerst de volle schelpen, dan de losse parels. */
  const t = Math.floor(n / 10);
  const e = n % 10;
  const ok1 = await kiesCijfer(l, st, {
    goed: t,
    tel: t,
    strook: 1,
    vak: 0,
    volle: true,
    vakken,
    vraag: eerste.tien
      ? [
          "Nu zijn er twee vakken.",
          "Het eerste vak is voor de volle schelpen.",
          "Hoeveel volle schelpen zie je?",
        ]
      : ["Eerst het eerste vak.", "Hoeveel volle schelpen zie je?"],
    hulpZin: "Het eerste vak is voor de volle schelpen.",
  });
  const vakken2 = [String(t), ""];
  const ok2 = await kiesCijfer(l, st, {
    goed: e,
    tel: n === 20 ? 0 : e,
    strook: 2,
    vak: 1,
    vakken: vakken2,
    vraag:
      n === 20
        ? [
            "Het tweede vak is voor de losse parels.",
            "Hoeveel losse parels zie je?",
          ]
        : ["Nu het tweede vak.", "Hoeveel losse parels zie je?"],
    hulpZin: "Tel de parels in de tweede schelp één voor één.",
  });
  zonderHulp = ok1 && ok2;
  if (eerste.tien || !zonderHulp) {
    await l.zeg(
      `De {${t}} staat voor ${schelpen(t)}.`,
      `De {${e}} staat voor ${losse(e)}.`,
    );
    await l.verder();
  }
  eerste.tien = false;
  await l.zeg(`Samen is dat {${n}}: *${getalWoord(n)}*.`);
  const a = await schrijfCijfer(l, t, 0, spoor || !zonderHulp, [
    `Schrijf *${getalWoord(n)}*.`,
    `Eerst de {${t}}.`,
    "Begin bij de groene stip.",
  ]);
  hw(l, { vakken: ["", String(e)] });
  const b = await schrijfCijfer(l, e, 1, spoor || !zonderHulp, [
    `Nu de {${e}}.`,
  ]);
  return zonderHulp && a && b;
}

export const getallenSchrijven: Lesdraaiboek = {
  id: "tellen-120-getallen-schrijven",
  titel: "Getallen tot 20 schrijven",
  synthesis: "Color Count · Writing Numbers to 20",
  kaarttekening: KaartSchrijven,

  async speel(ruw) {
    const l = metVinkje(ruw);
    const st = nieuweStaat();
    const eerste = { tellen: true, schrijven: true, tien: true };
    const later: number[] = [];

    l.vlak(TelSchrijven, { aantal: 3, vakken: [""], opgave: ++opgaveTeller });
    await l.zeg(
      "Hoi!",
      "We gaan parels tellen.",
      "En we schrijven op hoeveel het er zijn.",
    );
    const weet = await weetJeDitAl(l, st, ["Denk je dat je het al kunt?"]);
    if (weet === "ja") {
      await l.zeg("Mooi.", "Laat maar eens zien.");
      const a = await schrijfOpgave(l, st, 8, false, eerste);
      const b = a ? await schrijfOpgave(l, st, 13, false, eerste) : false;
      if (a && b) {
        const tik = l.kaart();
        await l.zeg(
          metNaam(l, "Knap gedaan!"),
          "Je kunt getallen tot {20} tellen en schrijven.",
          "Tik op de kaart om hem af te vinken.",
        );
        await tik;
        return;
      }
      await l.zeg("Goed geprobeerd.", "We oefenen het samen.");
    } else if (weet === "nee") {
      await l.zeg("Geen probleem.", "We doen het samen.");
    } else {
      await l.zeg(
        "Geen zorgen.",
        "Eerst tellen we, dan schrijven we het cijfer.",
      );
    }

    /* 15 opgaven, 0–20 door elkaar. De eerste vier met een stippelspoor, daarna alleen de stip en het pijltje. */
    const reeks = [3, 5, 1, 0, 7, 10, 2, 16, 4, 12, 9, 17, 6, 20, 14];
    let hulpNodig = false;
    for (let i = 0; i < reeks.length; i++) {
      const n = reeks[i];
      if (i === 4)
        await l.zeg(
          "Je doet het goed.",
          "Nu laat ik de puntjes weg.",
          "Volg alleen de groene stip en het pijltje.",
        );
      else if (i > 0)
        await l.zeg(["Volgende.", "En nu deze.", "Oké.", "Nog een."][i % 4]);
      const ok = await schrijfOpgave(l, st, n, i < 4 || hulpNodig, eerste);
      hulpNodig = !ok;
      if (!ok && !later.includes(n)) later.push(n);
    }

    /* De getallen die nog terug moesten komen. */
    if (later.length) {
      await l.zeg("We doen er nog een paar van net.", "Weet je ze nu?");
      await l.verder();
      for (const n of later.splice(0, 3))
        await schrijfOpgave(l, st, n, true, eerste);
    }

    const tik = l.kaart();
    await l.zeg(
      metNaam(l, "Knap gedaan!"),
      "Je kunt getallen tot {20} tellen en schrijven.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* =====================================================================
   Het getallenveld (Doortellen, en vraag 2, 3 en 5 van de toetsen)
   ===================================================================== */

type TV = TelVeldProps;
const hv = (l: Lesgids, p: Partial<TV>) => l.pasVlakAan<TV>(p);
type VeldTik = { soort: "getal"; n: number };

const rij = (n: number) => {
  const begin = Math.floor((n - 1) / 10) * 10 + 1;
  return Array.from({ length: 10 }, (_, i) => begin + i);
};

async function tikVeld(
  l: Lesgids,
  st: Staat,
  hulp: string[],
): Promise<number | null> {
  hv(l, { actief: true });
  const p = tikOfWeetNiet<VeldTik>(l, "getal");
  await wijsWeetNiet(l, st);
  const stop = herinner(l, hulp);
  const g = await beurtVan(p);
  stop();
  hv(l, { actief: false });
  return g ? g.n : null;
}

/** Wat Bliepo zegt als het kind het verkeerde getal aantikt (Synthesis: per soort fout een eigen zin). */
function zoekFout(x: number, doel: number): string[] {
  const d = x - doel;
  const omgedraaid =
    x >= 10 &&
    doel >= 10 &&
    String(x).split("").reverse().join("") === String(doel);
  if (Math.abs(d) === 10)
    return [
      `Ah, dat is {${x}}.`,
      d < 0 ? "Je zit er {10} onder." : "Je zit er {10} boven.",
    ];
  if (Math.abs(d) === 1)
    return [`Ah, dat is {${x}}.`, "Dat ligt er vlak naast."];
  if (omgedraaid) return [`Hmm, dat is {${x}}.`, `We zoeken {${doel}}.`];
  return [`Dat is {${x}}.`, `We zoeken {${doel}}.`];
}

/**
 * Een getal zoeken in het veld (G5, R3 Counting On): 1× fout = een eigen zin
 * per soort fout, opnieuw; 2× fout = de andere rijen worden dof, nog een
 * poging; 3× fout = "Ik help je even" en Bliepo wijst het aan, later terug.
 * "Weet ik niet" = Bliepo wijst het aan, later terug.
 */
async function zoekGetal(
  l: Lesgids,
  st: Staat,
  doel: number,
  opdracht: string[],
  goed: string[],
  later?: Later,
): Promise<boolean> {
  hv(l, { rand: [], pijl: null, licht: null });
  await l.zeg(...opdracht);
  zetAntwoord("getal", { n: doel });
  for (let fout = 0; ;) {
    const x = await tikVeld(l, st, [`Zoek {${doel}}.`, "Tik erop."]);
    if (x === doel) {
      hv(l, { rand: [doel], pijl: null, licht: null, golf: golf() });
      await l.zeg(...goed);
      return fout === 0;
    }
    if (x === null) {
      hv(l, { pijl: null, licht: null, rand: [doel] });
      await l.zeg(
        "Geen zorgen.",
        `Hier staat {${doel}}.`,
        "Dat zien we later.",
      );
      await l.verder();
      if (later)
        later.push(async () => {
          await zetVeld(l);
          await zoekGetal(
            l,
            st,
            doel,
            ["Weet je deze nog?", `Tik op {${doel}}.`],
            ["Ja!", `{${doel}}.`],
          );
        });
      return false;
    }
    fout++;
    hv(l, { pijl: x });
    if (fout === 1) {
      await l.zeg(...zoekFout(x, doel));
      hv(l, { pijl: null });
      await l.zeg("Probeer het nog eens.", `Tik op {${doel}}.`);
      continue;
    }
    if (fout === 2) {
      hv(l, { pijl: null, licht: rij(doel) });
      await l.zeg(
        "Nog een poging.",
        `{${doel}} staat in deze rij.`,
        `Tik op {${doel}}.`,
      );
      continue;
    }
    hv(l, { pijl: null, licht: null, rand: [doel] });
    await l.zeg("Ik help je even.", `Hier staat {${doel}}.`);
    await l.verder();
    if (later)
      later.push(async () => {
        await zetVeld(l);
        await zoekGetal(
          l,
          st,
          doel,
          ["Weet je deze nog?", `Tik op {${doel}}.`],
          ["Ja!", `{${doel}}.`],
        );
      });
    return false;
  }
}

/** "Welk getal staat in de rand?" Fout of "weet ik niet": "het heeft een 4 en een 2". */
async function benoem(
  l: Lesgids,
  st: Staat,
  n: number,
  opties: number[],
  inleiding: string[],
  later?: Later,
): Promise<boolean> {
  hv(l, { rand: [n], pijl: null, licht: null });
  await l.zeg(...inleiding, "Welk getal staat in de rand?");
  zetAntwoord("kies", { waarde: String(n) });
  const p = l.kies(opties.map(String));
  await wijsWeetNiet(l, st);
  const k = await beurtVan(p);
  if (k === String(n)) {
    hv(l, { golf: golf() });
    await l.zeg("Ja, dat is {" + n + "}.");
    await l.wacht(300);
    return true;
  }
  const [a, b] = String(n).split("");
  await l.zeg(
    k === null ? "Geen zorgen." : `{${k}}?`,
    k === null ? "" : "Kijk nog eens goed.",
    `Het getal heeft een {${a}} en een {${b}}.`,
    "Welk getal is dat?",
  );
  zetAntwoord("kies", { waarde: String(n) }, true);
  const k2 = await beurtVan(l.kies(opties.map(String)));
  if (k2 === String(n)) {
    hv(l, { golf: golf() });
    await l.zeg("Ja, dat is {" + n + "}.");
  } else {
    await l.zeg(
      `Het is {${n}}: een {${a}} en een {${b}}.`,
      "Dat zien we later.",
    );
    await l.verder();
    if (later)
      later.push(
        async () =>
          void (await benoem(l, st, n, opties, ["Weet je deze nog?"])),
      );
  }
  return false;
}

/** De aanwijzer loopt van `van` naar `naar`; met `hardop` telt Bliepo mee. */
async function loop(
  l: Lesgids,
  van: number,
  naar: number,
  hardop = false,
): Promise<void> {
  for (let n = van + 1, k = 1; n <= naar; n++, k++) {
    hv(l, { pijl: n });
    if (hardop) await l.zeg(`{${k}}`);
    else await l.wacht(450);
  }
}

/**
 * "Begin bij …, tel … verder": tik het eindgetal aan (tussenstappen mogen) en
 * het vinkje. 1× fout: een eigen zin (startgetal meegeteld: "wat was het eerste
 * getal dat je telde?"). 2× fout: samen tellen, later terug.
 */
async function telVerder(
  l: Lesgids,
  st: Staat,
  start: number,
  n: number,
  eerste: boolean,
  later?: Later,
): Promise<boolean> {
  const eind = start + n;
  let pijl = start;
  hv(l, { rand: [start], pijl, licht: null });
  await l.zeg(
    `Begin bij {${start}}.`,
    `Tel {${n}} verder.`,
    ...(eerste
      ? ["Tik op de getallen terwijl je telt.", "Tik dan op het vinkje."]
      : []),
  );
  const mijnAntwoord = zetAntwoord("verder", { start, eind });
  for (let fout = 0; ;) {
    hv(l, { actief: true, klaarKnop: true });
    const p = l.wachtOpVlak<{ soort: string; n?: number }>(["getal", "klaar"]);
    if (eerste)
      await wijsKnop(l, st, "vinkje", "Ben je er?", "Tik dan op het vinkje.");
    const stop = herinner(
      l,
      [`Begin bij {${start}}.`, `Tel {${n}} verder.`, "Tik dan op het vinkje."],
      16000,
      false,
    );
    const g = await beurtVan(p);
    stop();
    if (g.soort === "getal" && g.n !== undefined) {
      pijl = g.n;
      hv(l, { pijl });
      continue;
    }
    hv(l, { actief: false, klaarKnop: false });
    if (pijl === eind) {
      hv(l, { golf: golf() });
      await l.zeg(
        "Dat klopt.",
        `Je begon bij {${start}} en telde {${n}} verder.`,
        `Je kwam uit op {${eind}}.`,
      );
      await l.verder();
      return fout === 0;
    }
    if (pijl === start) {
      await l.zeg(
        "Tik op de getallen terwijl je telt.",
        `Begin bij {${start}} en tel {${n}} verder.`,
      );
      continue;
    }
    fout++;
    if (fout >= 2) {
      pijl = start;
      hv(l, { pijl });
      await l.zeg("Ik help je even.", "We tellen samen.");
      await loop(l, start, eind, true);
      await l.zeg(
        `Je komt uit op {${eind}}.`,
        "Dat zien we later.",
      );
      await l.verder();
      if (later)
        later.push(async () => {
          await zetVeld(l);
          await telVerder(l, st, start, n, false);
        });
      return false;
    }
    if (pijl === eind - 1) {
      /* De klassieke fout: het startgetal meetellen. */
      await l.zeg(
        `{${pijl}}?`,
        "Dat is heel dichtbij.",
        "Maar het is er net één te weinig.",
      );
      await l.verder();
      await l.zeg("Wat was het eerste getal dat je telde?");
      zetAntwoord("kies", { waarde: String(start) }, true);
      const k = await beurtVan(
        l.kies([start, start + 1, start + 2].map(String)),
      );
      if (k === String(start))
        await l.zeg(
          "Daar sta je al.",
          "Dat getal tel je niet mee.",
          `Tel je {1} verder, dan kom je op {${start + 1}}.`,
        );
      else if (k === String(start + 1))
        await l.zeg(
          `Ja, je begint te tellen bij {${start + 1}}.`,
          "Tel nog eens, één voor één.",
        );
      else
        await l.zeg(
          `Na {${start}} komt eerst {${start + 1}}.`,
          "Daar begin je te tellen.",
        );
      herstelAntwoord(mijnAntwoord);
      await l.verder();
    } else if (pijl > eind) {
      await l.zeg(
        `Je bent op {${pijl}}.`,
        "Dat is te ver.",
        "Tel nog eens, één voor één.",
      );
    } else {
      await l.zeg(`Je bent op {${pijl}}.`, "Je moet nog verder tellen.");
    }
    pijl = start;
    hv(l, { pijl });
    await l.zeg(
      "Probeer het nog eens.",
      `Begin bij {${start}}.`,
      `Tel {${n}} verder.`,
    );
  }
}

const EEN_TOT_NEGEN = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** "Hoeveel moet je nog verder tellen tot …?" (cijfers 1–9, zoals Synthesis). */
async function nogTot(
  l: Lesgids,
  st: Staat,
  van: number,
  tiental: number,
  later?: Later,
): Promise<boolean> {
  const d = tiental - van;
  hv(l, { pijl: van, rand: [van] });
  await l.zeg(
    `Je staat op {${van}}.`,
    `Hoeveel moet je verder tellen tot {${tiental}}?`,
  );
  zetAntwoord("kies", { waarde: String(d) });
  for (let fout = 0; ;) {
    const p = l.kies(EEN_TOT_NEGEN);
    await wijsWeetNiet(l, st);
    const k = await beurtVan(p);
    const x = k === null ? null : Number(k);
    if (x === d) {
      hv(l, { pijl: tiental, golf: golf() });
      await l.zeg(
        "Ja.",
        `Van {${van}} naar {${tiental}} tel je {${d}} verder.`,
      );
      await l.verder();
      return fout === 0;
    }
    if (x === null || fout >= 1) {
      await l.zeg(
        x === null ? "Geen zorgen, we tellen samen." : "Ik help je even.",
        ...(x === null ? [] : ["We tellen samen."]),
      );
      hv(l, { pijl: van });
      await loop(l, van, tiental, true);
      await l.zeg(
        `Van {${van}} naar {${tiental}} tel je {${d}} verder.`,
        "Dat zien we later.",
      );
      await l.verder();
      if (later)
        later.push(async () => {
          await zetVeld(l);
          await nogTot(l, st, van, tiental);
        });
      return false;
    }
    fout++;
    if (x === d + 1) {
      await l.zeg(`{${x}}?`, `Ik denk dat je {${van}} hebt meegeteld.`);
      hv(l, { pijl: van + 1 });
      await l.zeg(`Je begint te tellen bij {${van + 1}}.`);
      hv(l, { pijl: van });
    } else {
      await l.zeg(
        `Hmm, {${x}} is te ${x < d ? "weinig" : "veel"}.`,
        `Tel vanaf {${van + 1}} tot en met {${tiental}}.`,
      );
    }
    await l.zeg(
      "Probeer het nog eens.",
      `Hoeveel moet je verder tellen tot {${tiental}}?`,
    );
  }
}

/* ---------- Doortellen (G5) ---------- */

export const doortellen: Lesdraaiboek = {
  id: "tellen-120-doortellen",
  titel: "Doortellen",
  synthesis: "Color Count · Counting On",
  kaarttekening: KaartDoortellen,

  async speel(ruw) {
    const l = metVinkje(ruw);
    const st = nieuweStaat();
    const later: Later = [];

    l.vlak(TelVeld, { tot: 20 });
    await l.zeg("Hoi!", "Kijk, een veld vol bubbels met getallen.");
    const weet = await weetJeDitAl(l, st, [
      "We gaan doortellen.",
      "Kun je dit al?",
    ]);
    if (weet === "ja") {
      await l.zeg("Mooi.", "Laat maar eens zien.");
      hv(l, { tot: 50 });
      await l.wacht(800);
      const a = await zoekGetal(l, st, 37, ["Tik op {37}."], ["Ja!", "{37}."]);
      const b = a ? await telVerder(l, st, 23, 4, true) : false;
      if (a && b) {
        hv(l, { rand: [], pijl: null });
        const tik = l.kaart();
        await l.zeg(
          metNaam(l, "Knap gedaan!"),
          "Je kunt al doortellen.",
          "Tik op de kaart om hem af te vinken.",
        );
        await tik;
        return;
      }
      await l.zeg("Goed geprobeerd.", "We oefenen het samen.");
      hv(l, { tot: 20, rand: [], pijl: null });
      await l.wacht(600);
    } else if (weet === "nee") {
      await l.zeg("Geen probleem.", "We doen het samen.");
    } else {
      await l.zeg(
        "Geen zorgen.",
        "Doortellen is verder tellen vanaf een getal.",
      );
    }

    /* 1. Het veld tot 20, dan tot 50 (vinden: 6). */
    await zoekGetal(
      l,
      st,
      20,
      ["Tot nu toe telde je tot {20}.", "Kun je {20} vinden in dit veld?"],
      ["Heel goed.", "Maar vandaag tellen we nog verder."],
      later,
    );
    await l.verder();
    hv(l, { tot: 50, rand: [] });
    await l.wacht(900);
    await zoekGetal(
      l,
      st,
      50,
      ["Kijk, het veld groeit.", "Tik op het grootste getal dat je ziet."],
      ["Ja.", "Het veld gaat tot {50}."],
      later,
    );
    await l.verder();

    await l.zeg(
      "Nu een snel spelletje.",
      "Ik zeg een getal.",
      "Jij zoekt het in het veld.",
    );
    await l.verder();
    const reeks: [number, string, string][] = [
      [39, "We beginnen met deze.", "Heel goed."],
      [12, "Volgende.", "Mooi."],
      [47, "Oké.", "Ja."],
      [22, "Nog één.", "Goed zo."],
    ];
    for (const [n, inleiding, lof] of reeks) {
      await zoekGetal(
        l,
        st,
        n,
        [inleiding, `Tik op {${n}}.`],
        [lof, `Dat is {${n}}.`],
        later,
      );
      await l.wacht(300);
    }
    hv(l, { rand: [] });
    await l.zeg(metNaam(l, "Je snapt het."), "Nu gaan we doortellen.");
    await l.verder();

    /* 2. Benoemen (4) en doortellen (6), door elkaar. */
    await benoem(l, st, 42, [32, 41, 42, 43], ["We beginnen hier."], later);
    await telVerder(l, st, 42, 3, true, later);
    await benoem(
      l,
      st,
      26,
      [16, 25, 26, 62],
      ["Kijk, nu staat er een ander getal in de rand."],
      later,
    );
    await telVerder(l, st, 41, 3, false, later);
    await nogTot(l, st, 44, 50, later);

    hv(l, { rand: [], pijl: null });
    await l.zeg("Je doet het heel goed.", "Wil je het moeilijker proberen?");
    zetAntwoord("keuze", { opties: ["Ja", "Nog niet"] }, true);
    const moeilijker = await beurtVan(l.kies(["Ja", "Nog niet"]));
    await benoem(
      l,
      st,
      35,
      [25, 34, 35, 53],
      [
        moeilijker === "Ja"
          ? "Oké, top."
          : moeilijker === null
            ? "Geen zorgen."
            : "Prima.",
        "Eerst deze.",
      ],
      later,
    );
    if (moeilijker === "Ja") {
      await telVerder(l, st, 28, 6, false, later);
      await nogTot(l, st, 34, 40, later);
      await benoem(l, st, 18, [8, 17, 18, 81], ["En deze?"], later);
      await telVerder(l, st, 32, 9, false, later);
    } else {
      await telVerder(l, st, 33, 4, false, later);
      await nogTot(l, st, 37, 40, later);
      await benoem(l, st, 18, [8, 17, 18, 81], ["En deze?"], later);
      await telVerder(l, st, 24, 3, false, later);
    }

    hv(l, { rand: [], pijl: null });
    await speelLater(l, later, [
      "We doen er nog een paar van net.",
      "Weet je ze nu?",
    ]);

    hv(l, { rand: [], pijl: null });
    const tik = l.kaart();
    await l.zeg(
      metNaam(l, "Knap gedaan!"),
      "Je kunt doortellen als een kampioen.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* =====================================================================
   De toetsen (G2 en G6)
   ===================================================================== */

type Toetsopzet = {
  kleur: Kleur;
  aantal: number;
  rest: [Kleur, number][];
  /** Getal zoeken in het veld tot 50 (met de valkuil van omgedraaide cijfers). */
  zoek: number;
  /** Vanaf `zoek` nog zoveel verder (keuzes). */
  stappen: number;
  opties: number[];
  /** De schelpen: 10 en nog zoveel. */
  tiener: { los: number; opties: number[] };
  /** Hoeveel nog tot het volgende tiental (cijfers 1–9). */
  aanvul: { van: number; tot: number };
  /** Herhaling (10 opgaven) na de toets. */
  oefen: {
    kleuren: [Kleur, [Kleur, number][]][];
    zoek: number[];
    verder: [number, number][];
    tieners: number[];
  };
};

/**
 * Eén toetsvraag met keuzes. 1× fout: "{x}? Kijk nog eens goed." en nog een
 * kans. 2× fout: de toets stopt. "Weet ik niet": het antwoord, telt als niet
 * beheerst. Geeft "goed", "niet" (weet ik niet) of "stop".
 */
async function toetsKies(
  l: Lesgids,
  st: Staat,
  vraag: string[],
  opties: string[],
  goed: string,
  antwoord: string[],
  ook?: () => void,
): Promise<"goed" | "niet" | "stop"> {
  await l.zeg(...vraag);
  zetAntwoord("kies", { waarde: goed });
  for (let poging = 1; ; poging++) {
    const p = l.kies(opties);
    if (poging === 1) await wijsWeetNiet(l, st);
    const k = await beurtVan(p);
    if (k === goed) {
      ook?.();
      await l.zeg(
        ["Klopt.", "Ja!", "Precies."][Math.floor(Math.random() * 3)],
        `{${goed}}.`,
      );
      return "goed";
    }
    if (k === null) {
      await l.zeg(...antwoord);
      await l.verder();
      return "niet";
    }
    if (poging >= 2) return "stop";
    await l.zeg(`{${k}}?`, "Kijk nog eens goed.");
  }
}

async function toets(l: Lesgids, o: Toetsopzet, slot: string[]): Promise<void> {
  const st = nieuweStaat();
  const later: Later = [];
  let vakjes = rooster([[o.kleur, o.aantal], ...o.rest]);
  l.vlak(TelRooster, { vakjes, voorwerp: "kwal" });
  await l.zeg("Hoi!", "We gaan tellen, tot {50}.");
  const weet = await weetJeDitAl(l, st, ["Kun je dit al?"]);
  const echteToets = weet === "ja";
  if (echteToets) await l.zeg("Mooi.", "Laten we kijken wat je al weet.");
  else await l.zeg("Geen probleem.", "We oefenen samen.");

  let beheerst = 0;
  let gestopt = false;
  /* De toetsvragen. In de toets: 1× fout = nog een kans, 2× fout = de toets stopt. Anders: met hulp. */
  const stop = async () => {
    gestopt = true;
    await l.zeg("Geen probleem.", "Dit gaan we samen leren.");
    await l.verder();
  };

  /* 1. Hoeveel kwallen van één kleur (cijfers 0–9). */
  vraag1: {
    hr(l, { fel: null });
    if (!echteToets) {
      if (
        await telVraag(l, st, vakjes, [o.kleur], `*${BIJ[o.kleur]}* kwallen`, {
          later,
          opnieuw: async () => {
            const nieuw = schud(vakjes);
            l.vlak(TelRooster, { vakjes: nieuw, voorwerp: "kwal" });
            await l.wacht(800);
            await telVraag(
              l,
              st,
              nieuw,
              [o.kleur],
              `*${BIJ[o.kleur]}* kwallen`,
            );
          },
        })
      )
        beheerst++;
      break vraag1;
    }
    hr(l, { cijfers: true, cijfersUit: [] });
    await l.zeg(
      "Kijk naar de kwallen.",
      `Hoeveel kwallen zijn *${o.kleur}*?`,
      "Tik op het getal.",
    );
    zetAntwoord("cijfer", { n: o.aantal });
    for (let poging = 1; ; poging++) {
      hr(l, { modus: "cijfer" });
      const p = tikOfWeetNiet<{ soort: "cijfer"; n: number }>(l, "cijfer");
      if (poging === 1) await wijsWeetNiet(l, st);
      const g = await beurtVan(p);
      hr(l, { modus: null });
      if (g?.n === o.aantal) {
        hr(l, {
          cijferMarkering: { n: o.aantal, kleur: o.kleur },
          fel: [o.kleur],
          golf: golf(),
        });
        await l.zeg("Klopt.", `{${o.aantal}} *${BIJ[o.kleur]}* kwallen.`);
        beheerst++;
        break;
      }
      if (g === null) {
        hr(l, { fel: [o.kleur] });
        await l.zeg(`Het zijn {${o.aantal}} *${BIJ[o.kleur]}* kwallen.`);
        await l.verder();
        break;
      }
      if (poging >= 2) {
        await stop();
        break;
      }
      hr(l, { cijfersUit: [g.n] });
      await l.zeg(`{${g.n}:${o.kleur}}?`, "Kijk nog eens goed.");
    }
    await l.wacht(400);
    hr(l, { cijfers: false, cijferMarkering: null, cijfersUit: [] });
  }

  /* 2. Een getal zoeken in het veld tot 50 (valkuil: omgedraaide cijfers). */
  if (!gestopt) {
    l.vlak(TelVeld, { tot: 50 });
    await l.wacht(800);
    if (!echteToets) {
      if (
        await zoekGetal(
          l,
          st,
          o.zoek,
          [`Zoek het getal {${o.zoek}}.`, "Tik erop."],
          ["Ja!", `{${o.zoek}}.`],
          later,
        )
      )
        beheerst++;
    } else {
      await l.zeg(`Zoek het getal {${o.zoek}}.`, "Tik erop.");
      zetAntwoord("getal", { n: o.zoek });
      for (let poging = 1; ; poging++) {
        const x = await tikVeld(l, st, [`Zoek {${o.zoek}}.`]);
        if (x === o.zoek) {
          hv(l, { rand: [o.zoek], golf: golf() });
          await l.zeg("Ja!", `{${o.zoek}}.`);
          beheerst++;
          break;
        }
        if (x === null) {
          hv(l, { rand: [o.zoek] });
          await l.zeg(`Hier staat {${o.zoek}}.`);
          await l.verder();
          break;
        }
        if (poging >= 2) {
          await stop();
          break;
        }
        hv(l, { pijl: x });
        await l.zeg(`{${x}}?`, "Laten we die nog eens bekijken.");
        hv(l, { pijl: null });
        await l.zeg(`Zoek het getal {${o.zoek}}.`);
      }
      hv(l, { rand: [o.zoek], pijl: null });
    }
  }

  /* 3. Doortellen vanaf dat getal (keuzes). */
  if (!gestopt) {
    const eind = o.zoek + o.stappen;
    hv(l, { rand: [o.zoek], pijl: null });
    if (!echteToets) {
      if (await telVerder(l, st, o.zoek, o.stappen, true, later)) beheerst++;
    } else {
      const u = await toetsKies(
        l,
        st,
        [
          `Tel vanaf {${o.zoek}} nog {${o.stappen}} verder.`,
          "Op welk getal kom je?",
        ],
        o.opties.map(String),
        String(eind),
        [`Je komt op {${eind}}.`],
        () => hv(l, { pijl: eind, golf: golf() }),
      );
      if (u === "goed") beheerst++;
      if (u === "stop") await stop();
    }
  }

  /* 4. De schelpen: 10 en nog wat. */
  if (!gestopt) {
    const n = 10 + o.tiener.los;
    l.vlak(TelSchelpen, {
      links: 10,
      rechts: o.tiener.los,
      tweede: true,
      zonderLijst: true,
    });
    await l.wacht(900);
    if (!echteToets) {
      if (
        await getalVraag(
          l,
          st,
          ["Een volle schelp is {10}.", "Welk getal is dit?"],
          o.tiener.opties.map(String),
          String(n),
          (k) =>
            k.length === 3 || (Number(k) > 20 && k !== String(n))
              ? [
                  "Ik snap wat je denkt.",
                  "Je zette de cijfers om of naast elkaar.",
                ]
              : ["Kijk naar beide schelpen.", `{10} en nog {${o.tiener.los}}.`],
          ["Welk getal is dit?"],
          [`{10} en nog {${o.tiener.los}} is {${n}}.`],
          {
            lijst: later,
            vraag: async () => {
              l.vlak(TelSchelpen, {
                links: 10,
                rechts: o.tiener.los,
                tweede: true,
                zonderLijst: true,
              });
              await l.wacht(900);
              await getalVraag(
                l,
                st,
                ["Welk getal is dit?"],
                o.tiener.opties.map(String),
                String(n),
                () => [],
                [],
                [`Het is {${n}}.`],
              );
            },
          },
        )
      )
        beheerst++;
    } else {
      const u = await toetsKies(
        l,
        st,
        ["Een volle schelp is {10}.", "Welk getal is dit?"],
        o.tiener.opties.map(String),
        String(n),
        [`{10} en nog {${o.tiener.los}} is {${n}}.`],
        () => hs(l, { golf: golf() }),
      );
      if (u === "goed") beheerst++;
      if (u === "stop") await stop();
    }
  }

  /* 5. Hoeveel nog tot het tiental (cijfers 1–9). */
  if (!gestopt) {
    const { van, tot } = o.aanvul;
    l.vlak(TelVeld, { tot: 50, rand: [van], pijl: van });
    await l.wacht(800);
    if (!echteToets) {
      if (await nogTot(l, st, van, tot, later)) beheerst++;
    } else {
      const u = await toetsKies(
        l,
        st,
        [
          `Je staat op {${van}}.`,
          `Hoeveel moet je verder tellen tot {${tot}}?`,
        ],
        EEN_TOT_NEGEN,
        String(tot - van),
        [`Van {${van}} naar {${tot}} tel je {${tot - van}} verder.`],
        () => hv(l, { pijl: tot, golf: golf() }),
      );
      if (u === "goed") beheerst++;
      if (u === "stop") await stop();
    }
  }

  /* Uitslag van de toets. */
  if (echteToets && !gestopt && beheerst === 5) {
    await l.zeg(
      metNaam(l, "Je hebt goed laten zien wat je kunt."),
      "Je hebt deze lessen al afgevinkt.",
    );
  } else if (echteToets && !gestopt) {
    await l.zeg("Goed gewerkt.", "Een paar dingen oefenen we nog samen.");
  }
  await l.verder();

  /* Herhaling: 10 opgaven met hulp (samen 15 met de toets). */
  await l.zeg("Nu nog even oefenen.");
  for (const [k, verdeling] of o.oefen.kleuren) {
    vakjes = rooster(verdeling);
    l.vlak(TelRooster, { vakjes, voorwerp: "kwal" });
    await l.wacht(800);
    await telVraag(l, st, vakjes, [k], `*${BIJ[k]}* kwallen`, {
      later,
      opnieuw: async () => {
        const nieuw = schud(vakjes);
        l.vlak(TelRooster, { vakjes: nieuw, voorwerp: "kwal" });
        await l.wacht(800);
        await telVraag(l, st, nieuw, [k], `*${BIJ[k]}* kwallen`);
      },
    });
  }
  l.vlak(TelVeld, { tot: 50 });
  await l.wacht(800);
  for (const n of o.oefen.zoek)
    await zoekGetal(l, st, n, [`Tik op {${n}}.`], ["Ja.", `{${n}}.`], later);
  for (const [start, n] of o.oefen.verder)
    await telVerder(l, st, start, n, false, later);
  for (const los of o.oefen.tieners) {
    const n = 10 + los;
    l.vlak(TelSchelpen, {
      links: 10,
      rechts: los,
      tweede: true,
      zonderLijst: true,
    });
    await l.wacht(900);
    /* Afleiders: alleen de tweede schelp, één te veel, en de cijfers omgedraaid (16 → 61). */
    const keuzes = [...new Set([los, n, n + 1, Number(`${los}1`)])]
      .sort((a, b) => a - b)
      .map(String);
    await getalVraag(
      l,
      st,
      ["Welk getal is dit?"],
      keuzes,
      String(n),
      (k) =>
        k === String(los)
          ? [
              "Dat is alleen de tweede schelp.",
              "Kijk ook naar de volle schelp.",
            ]
          : k === `${los}1`
            ? ["Ik snap wat je denkt.", "Je draaide de cijfers om."]
            : [
                "Dat is er één te veel.",
                `In de tweede schelp liggen er {${los}}.`,
              ],
      ["Welk getal is dit?"],
      [`{10} en nog {${los}} is {${n}}.`],
    );
  }

  /* De vragen die nog terug moesten komen. */
  l.vlak(TelVeld, { tot: 50 });
  if (later.length) {
    await speelLater(l, later, ["Nog een paar van net.", "Weet je ze nu?"]);
  }

  const tik = l.kaart();
  await l.zeg(...slot, "Tik op de kaart om hem af te vinken.");
  await tik;
}

export const instaptoetsTellen: Lesdraaiboek = {
  id: "tellen-120-instaptoets",
  titel: "Instaptoets: tellen tot 100",
  synthesis: "Color Count · Assessment",
  kaarttekening: KaartRooster,

  async speel(ruw) {
    const l = metVinkje(ruw);
    await toets(
      l,
      {
        kleur: "rood",
        aantal: 9,
        rest: [
          ["groen", 6],
          ["blauw", 6],
        ],
        zoek: 34,
        stappen: 8,
        opties: [35, 41, 42, 43],
        tiener: { los: 3, opties: [3, 13, 14, 31] },
        aanvul: { van: 46, tot: 50 },
        oefen: {
          kleuren: [
            [
              "blauw",
              [
                ["blauw", 7],
                ["rood", 7],
                ["groen", 7],
              ],
            ],
            [
              "groen",
              [
                ["groen", 5],
                ["blauw", 8],
                ["rood", 8],
              ],
            ],
            [
              "rood",
              [
                ["rood", 8],
                ["groen", 6],
                ["blauw", 7],
              ],
            ],
          ],
          zoek: [27, 41, 19],
          verder: [
            [22, 3],
            [35, 4],
          ],
          tieners: [6, 8],
        },
      },
      [metNaam(l, "Goed gedaan!"), "Je kunt al goed tellen."],
    );
  },
};

export const eindtoetsTellen: Lesdraaiboek = {
  id: "tellen-120-eindtoets",
  titel: "Eindtoets: tellen tot 100",
  synthesis: "Color Count · Mastery Check",
  kaarttekening: KaartRooster,

  async speel(ruw) {
    const l = metVinkje(ruw);
    await toets(
      l,
      {
        kleur: "groen",
        aantal: 8,
        rest: [
          ["rood", 7],
          ["blauw", 6],
        ],
        zoek: 41,
        stappen: 7,
        opties: [42, 47, 48, 49],
        tiener: { los: 7, opties: [7, 17, 18, 71] },
        aanvul: { van: 34, tot: 40 },
        oefen: {
          kleuren: [
            [
              "rood",
              [
                ["rood", 6],
                ["groen", 8],
                ["blauw", 7],
              ],
            ],
            [
              "blauw",
              [
                ["blauw", 9],
                ["rood", 6],
                ["groen", 6],
              ],
            ],
            [
              "groen",
              [
                ["groen", 7],
                ["blauw", 7],
                ["rood", 7],
              ],
            ],
          ],
          zoek: [14, 38, 26],
          verder: [
            [43, 3],
            [21, 5],
          ],
          tieners: [4, 9],
        },
      },
      [metNaam(l, "Goed gedaan!"), "Je kunt al goed tellen."],
    );
  },
};

/* ---------- lijntekeningen voor op de kaart ---------- */

function KaartRooster() {
  const kleuren: Kleur[] = [
    "rood",
    "oranje",
    "blauw",
    "groen",
    "paars",
    "geel",
    "rood",
    "blauw",
    "groen",
    "oranje",
    "paars",
    "rood",
  ];
  return (
    <g
      fill="none"
      strokeWidth="3.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {kleuren.map((k, i) => {
        const x = 30 + (i % 4) * 48;
        const y = 34 + Math.floor(i / 4) * 48;
        return (
          <g key={i} stroke={KLEURCODE[k]}>
            <ellipse cx={x + 22} cy={y + 19} rx="15" ry="10" />
            <path d={`M${x + 7} ${y + 19}l-7 -7v14z`} />
          </g>
        );
      })}
    </g>
  );
}

function KaartTienstrook() {
  return (
    <g
      fill="none"
      strokeWidth="3.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        d="M40 30q10 -12 20 0q10 -12 20 0q10 -12 20 0v120h-60z"
        stroke="#7fe9ff"
      />
      <path
        d="M130 30q10 -12 20 0q10 -12 20 0q10 -12 20 0v120h-60z"
        stroke="#7fe9ff"
      />
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx={56 + (i % 2) * 28}
          cy={138 - Math.floor(i / 2) * 24}
          r="9"
          stroke="#f5c2d3"
        />
      ))}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={146 + (i % 2) * 28}
          cy={138 - Math.floor(i / 2) * 24}
          r="9"
          stroke={TEGELKLEUR[3]}
        />
      ))}
    </g>
  );
}

function KaartSchrijven() {
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <rect
        x="40"
        y="30"
        width="164"
        height="130"
        rx="14"
        stroke="#7fe9ff"
        strokeWidth="3"
      />
      <path d="M52 62h140M52 128h140" stroke="#bfe6ff" strokeWidth="2" />
      <path
        d="M52 95h140"
        stroke="#bfe6ff"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <path
        d="M98 70q24 -16 40 4q10 20 -16 26q30 4 18 26q-14 16 -42 4"
        stroke="#ffffff"
        strokeWidth="5"
      />
      <circle cx="98" cy="70" r="6" fill="#5fe08a" stroke="none" />
    </g>
  );
}

function KaartDoortellen() {
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <circle
        cx="122"
        cy="95"
        r="52"
        stroke={KOLOMKLEUR[5]}
        strokeWidth="3.4"
      />
      <text
        x="122"
        y="110"
        textAnchor="middle"
        fill={KOLOMKLEUR[5]}
        fontSize="40"
        fontWeight="700"
        fontFamily="ui-monospace, Menlo, monospace"
      >
        46
      </text>
      <path d="M112 22h20l-10 13z" stroke="#ffd84a" strokeWidth="3" />
      <path d="M112 168h20l-10 -13z" stroke="#ffd84a" strokeWidth="3" />
    </g>
  );
}
