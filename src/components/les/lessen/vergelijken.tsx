/**
 * Lessen van "Vergelijken", naar de Synthesis-unit "Compare the Pair"
 * (INSPIRATIE.md ronde 1, 2 en 3, blok K; LESSENPLAN.md G7–G11). Groep 3.
 *
 * Tweede vorm (27 oktober 2026, BOUWEN-PHASER.md): alles als hologrammen in
 * Bliepo's ruimte, wereld Aarde. De vakjeskaarten van Synthesis zijn twee
 * glazen potjes met 6 of 10 plekken; de blokjes zijn vuurvliegjes (blauw,
 * geel, groen); de getallen staan in lantaarntjes met een gloeiend teken
 * ertussen. Eén vlak voor de hele les: ../vlakken/vergelijken-holo-vlak.tsx
 * (de oude vlakken vergelijken-kaarten en vergelijken-getallen blijven staan).
 *
 * 1. Instaptoets (G7): grootste groep, gelijk maken, een getal bij < en >;
 *    daarna oefenen tot 15 opgaven.
 * 2. Meer of minder (G8): grootste groep, hoeveel meer, één kleur tussen
 *    andere kleuren, gelijk maken.
 * 3. De tekens (G9): =, < en > ontdekken en gebruiken bij twee potjes.
 * 4. Getallen vergelijken (G10): dezelfde tekens bij losse getallen.
 * 5. Eindtoets (G11): als de instaptoets, met andere getallen.
 *
 * Hulp (R3 en LESSENPLAN § 1d):
 * - hulphandje: de vuurvliegjes zakken naar onderen, zodat je de hoogte
 *   vergelijkt; in een toets: "we leren het samen" en de toets stopt;
 * - 1× fout (les): samen tellen met een teller boven de potjes (grootste
 *   groep), andere kleuren weg (één kleur), het antwoord als vraag
 *   teruglezen + het gele stipje (tekens);
 * - 2× fout (les): Bliepo zegt het antwoord of doet het voor, of "we stoppen
 *   hier even mee"; de vraag komt aan het eind van de les nog één keer terug;
 * - weet ik niet: Bliepo zegt het antwoord, de vraag komt later terug;
 * - toets: geen uitleg, meteen de volgende vraag; na 2 fouten stopt de toets
 *   vriendelijk en verwijst naar de les "Meer of minder".
 *
 * De tekens heten altijd voluit: "is gelijk aan", "is kleiner dan",
 * "is groter dan". Antwoordkeuzes zijn cijfers; moet het een woord zijn
 * ("Ja", "Nee"), dan leest Bliepo het voor bij tikken (holo/keuzes.tsx).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { vierKeuzes } from "../holo/keuzes";
import { knoppenOpPlek } from "./antwoordknoppen";
import { VergelijkenHolo, type Deel, type HoloProps, type Kant, type Kleur, type Teken, type Vak } from "../vlakken/vergelijken-holo-vlak";
import { VAKKLEUR } from "../vlakken/vergelijken-kaarten";

type Vast = Exclude<Teken, "?">;

/* ---------- algemeen ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** `n` vuurvliegjes van één kleur, door elkaar in een potje met `rijen` rijen. */
function verspreid(n: number, kleur: Kleur, rijen: number): Vak[] {
  const plekken = schud(Array.from({ length: rijen * 2 }, (_, i) => i)).slice(0, n);
  return Array.from({ length: rijen * 2 }, (_, i) => (plekken.includes(i) ? kleur : ""));
}

/** `n` vuurvliegjes van één kleur, netjes van onderen gevuld (links eerst). */
function onderaan(n: number, kleur: Kleur, rijen: number): Vak[] {
  const uit: Vak[] = Array(rijen * 2).fill("");
  let over = n;
  for (let r = rijen - 1; r >= 0 && over > 0; r--) {
    for (const k of [0, 1]) {
      if (over > 0) {
        uit[r * 2 + k] = kleur;
        over--;
      }
    }
  }
  return uit;
}

/** Een potje met meer kleuren door elkaar. */
function gemengd(aantallen: Partial<Record<Kleur, number>>, rijen: number): Vak[] {
  const kleuren: Vak[] = [];
  for (const [k, n] of Object.entries(aantallen) as [Kleur, number][]) for (let i = 0; i < n; i++) kleuren.push(k);
  while (kleuren.length < rijen * 2) kleuren.push("");
  return schud(kleuren);
}

function leeg(rijen: number): Vak[] {
  return Array(rijen * 2).fill("");
}

function tel(v: Vak[], kleur?: Kleur): number {
  return v.filter((k) => (kleur ? k === kleur : k !== "")).length;
}

function eersteKleur(v: Vak[], anders: Kleur): Kleur {
  return (v.find((x) => x !== "") || anders) as Kleur;
}

/** Bijvoeglijk: "de blauwe groep", "gele vuurvliegjes". */
const BN: Record<Kleur, string> = { blauw: "blauwe", geel: "gele", groen: "groene" };
/** Na "een" of "elk" bij een het-woord: "een blauw vuurvliegje". */
const KN: Record<Kleur, string> = { blauw: "blauw", geel: "geel", groen: "groen" };

function vliegjes(n: number): string {
  return n === 1 ? "vuurvliegje" : "vuurvliegjes";
}

const WOORD: Record<Vast, string> = { "=": "is gelijk aan", "<": "is kleiner dan", ">": "is groter dan" };

/** Het goede teken tussen a en b. */
function tekenVoor(a: number, b: number): Vast {
  return a === b ? "=" : a < b ? "<" : ">";
}

/** "{5} is groter dan {4}" */
function zin(a: number, t: Vast, b: number): string {
  return `{${a}} ${WOORD[t]} {${b}}`;
}

/** "Links zijn het er {4}, rechts {6}." (bij 1: "Links is er {1}, …") */
function linksRechts(a: number, b: number): string {
  return `${a === 1 ? "Links is er {1}" : `Links zijn het er {${a}}`}, rechts {${b}}.`;
}

/* ---------- het vlak bedienen ---------- */

type Melding = {
  soort: string;
  kant?: Kant;
  links: number;
  rechts: number;
  n?: number;
  klaar?: boolean;
  gekozen?: Kant | null;
  teken?: Teken | null;
  s?: Teken;
  delen?: Deel[];
  waarde?: number | null;
  keuze?: number | string;
};

/** Alles wat niet bij een nieuwe opgave hoort, gaat uit. */
const UIT: Partial<HoloProps> = {
  overgang: "nieuw",
  teken: null,
  tekenTik: false,
  stip: null,
  kies: false,
  telKleur: null,
  alleen: null,
  kader: null,
  tik: null,
  kleurLinks: "blauw",
  kleurRechts: "geel",
  aantallen: false,
  pijl: null,
  teller: null,
  vink: false,
  hand: false,
  weetniet: false,
  keuzes: null,
  uit: [],
  goedeKeuze: null,
  invoer: false,
};

/** De bediening van het vlak, plus wat de les onthoudt (eerste keer aanwijzen, vragen voor later). */
function maakVlak(l: Lesgids) {
  let zet = 0;
  let effect = 0;
  let zak = 0;
  let getoond = false;
  const zetNeer = (p: HoloProps) => {
    if (!getoond) {
      getoond = true;
      l.vlak<HoloProps>(VergelijkenHolo, p);
    } else l.pasVlakAan<HoloProps>(p);
  };
  const gewezen = new Set<string>();
  return {
    /** Vragen die later in de les terugkomen (na 2× fout of "weet ik niet"). */
    later: [] as (() => Promise<void>)[],
    potjes(links: Vak[], rechts: Vak[], extra: Partial<HoloProps> = {}) {
      zetNeer({ ...UIT, ...extra, links, rechts, delen: null, zet: ++zet } as HoloProps);
    },
    lampen(delen: Deel[], extra: Partial<HoloProps> = {}) {
      zetNeer({ ...UIT, ...extra, links: null, rechts: null, delen, zet: ++zet } as HoloProps);
    },
    pas(p: Partial<HoloProps>) {
      l.pasVlakAan<HoloProps>(p);
    },
    /** Hulp: de vuurvliegjes zakken netjes naar onderen. */
    zak() {
      l.pasVlakAan<HoloProps>({ zak: ++zak });
    },
    golf(waar: Kant | "midden") {
      l.pasVlakAan<HoloProps>({ effect: { soort: "golf", waar, n: ++effect } });
    },
    schud(waar: Kant | "midden") {
      l.pasVlakAan<HoloProps>({ effect: { soort: "schud", waar, n: ++effect } });
    },
    /**
     * De eerste keer in de les: Bliepo wijst de knoppen aan en zegt wat ze
     * doen. Heeft het kind intussen al geantwoord (`p`), dan stopt hij daarmee.
     */
    async wijs(p: Promise<unknown>, ...knoppen: [string, string][]) {
      let al = false;
      void p.then(() => (al = true));
      for (const [knop, zin] of knoppen) {
        if (al) return;
        if (gewezen.has(knop)) continue;
        gewezen.add(knop);
        /*
          Niet langer wachten dan nodig: tikt het kind een woord aan, dan leest
          Bliepo dat woord voor en komt het einde van deze zin nooit.
        */
        await Promise.race([l.wijsAan(knop, zin), p]);
      }
    },
  };
}

type V = ReturnType<typeof maakVlak>;

/**
 * Wachten op het vlak. Doet het kind een poos niets, dan herhaalt Bliepo de
 * opdracht één keer (R3, hulpregel 6).
 */
async function wachtOp(l: Lesgids, soorten: string[], herinner?: string[]): Promise<Melding> {
  const p = l.wachtOpVlak<Melding>(soorten);
  if (!herinner?.length) return p;
  const klok = setTimeout(() => void l.zeg(...herinner).catch(() => {}), 25000);
  try {
    return await p;
  } finally {
    clearTimeout(klok);
  }
}

/**
 * Het vinkje, het handje en "weet ik niet" staan op de vaste plek onder de zin
 * van Bliepo (28 oktober 2026). Het handje en "weet ik niet" zijn daar één
 * vraagteken; alleen bij de toetsvraag met het getal staan ze naast elkaar met
 * een ander gevolg, daar blijft het handje in het vlak (`handInVlak`).
 */
const metVasteKnoppen = (l: Lesgids) =>
  knoppenOpPlek(l, {
    voor: VergelijkenHolo,
    soorten: { klaar: "controleer", hand: "weetniet", weetniet: "weetniet" },
    aanwijs: { vink: "controleer", hand: "weetniet" },
    zichtbaar: (p) => [p.vink ? "klaar" : "", p.hand && !p.handInVlak ? "hand" : "", p.weetniet ? "weetniet" : ""].filter(Boolean),
    geldig: (knop, stand) => knop !== "controleer" || stand.kanVink !== false,
  });

/** Een keuze met woorden (Bliepo leest ze voor bij tikken). `null` = weet ik niet. */
async function kiesWoord(l: Lesgids, v: V, opties: string[], o: { weetniet?: boolean } = {}): Promise<string | null> {
  /* Woorden staan op de vaste plek onder de zin van Bliepo (28 oktober 2026), niet meer in het vlak. */
  const p = l.kies(opties, { direct: true, weetniet: o.weetniet ? undefined : false });
  p.catch(() => {});
  await v.wijs(p, ["keuzes", "Tik op je antwoord."], ...(o.weetniet ? [["weetniet", "Weet je het niet? Tik dan op het vraagteken."] as [string, string]] : []));
  return p;
}

/** Alle vragen die nog terug moesten komen, één keer. */
async function speelLater(l: Lesgids, v: V) {
  if (v.later.length === 0) return;
  await l.zeg("We gaan nog even terug naar een paar vragen van net.");
  while (v.later.length > 0) {
    const vraag = v.later.shift()!;
    await vraag();
    await l.wacht(500);
  }
}

/* ---------- opdrachten die vaker terugkomen ---------- */

type Uitslag = "goed" | "herkansing" | "uitgelegd" | "later";

/** Samen tellen (R3, 1× fout): het kind tikt elk vuurvliegje aan, het getal boven het potje telt mee. */
async function samenTellen(l: Lesgids, v: V, kant: Kant, kleur: Kleur, eerste: boolean) {
  const opdracht = `Tik op elk ${KN[kleur]} vuurvliegje.`;
  await l.zeg(eerste ? opdracht : `Tik nu op de ${BN[kleur]} vuurvliegjes.`, "Ik tel mee.");
  v.pas({ teller: kant });
  for (;;) {
    const g = await wachtOp(l, ["tel"], [opdracht]);
    if (g.klaar) break;
  }
  v.pas({ teller: null });
  await l.wacht(400);
}

/**
 * "Tik op de grootste groep" (G8, en het oefenen na de toets). Het kind tikt
 * een potje aan en bevestigt met het vinkje.
 * - hulphandje: de vuurvliegjes zakken; "Tik op de grootste groep hier."
 * - 1× fout: samen tellen (of, bij meer kleuren, de andere kleuren weg);
 * - 2× fout: "we stoppen hier even mee" en de vraag komt later terug
 *   (`opnieuw`), of bij de herhaling: Bliepo zegt het antwoord.
 */
async function grootsteGroep(
  l: Lesgids,
  v: V,
  links: Vak[],
  rechts: Vak[],
  vraag: string,
  o: { kleur?: Kleur; opnieuw?: boolean } = {},
): Promise<Uitslag> {
  const { kleur } = o;
  const a = tel(links, kleur);
  const b = tel(rechts, kleur);
  const goed: Kant = a > b ? "links" : "rechts";
  const gemengdeKleuren = !!kleur && [...links, ...rechts].some((x) => x !== "" && x !== kleur);
  const kl = kleur ?? eersteKleur(links, "blauw");
  const kr = kleur ?? eersteKleur(rechts, "geel");
  v.potjes(links, rechts, { telKleur: kleur ?? null });
  await l.zeg(vraag, "Tik dan op het vinkje.");
  v.pas({ kies: true, vink: true, hand: true });
  let handGebruikt = false;
  let hier = vraag;
  for (let poging = 0; ; ) {
    const p = wachtOp(l, ["klaar", "hand"], [hier]);
    await v.wijs(p, ["hand", "Vind je het lastig? Tik dan op het vraagteken."], ["vink", "Ben je klaar? Tik dan op het vinkje."]);
    const g = await p;
    if (g.soort === "hand") {
      handGebruikt = true;
      v.pas({ hand: false, kies: false, vink: false });
      v.zak();
      await l.wacht(700);
      hier = kleur ? vraag.replace(/\.$/, " hier.") : "Tik op de grootste groep hier.";
      await l.zeg(hier);
      v.pas({ kies: true, vink: true });
      continue;
    }
    const kant = g.gekozen ?? goed;
    v.pas({ kies: false, vink: false, hand: false, kader: { kant, kleur } });
    if (kant === goed) {
      v.golf(kant);
      return poging === 0 && !handGebruikt ? "goed" : "herkansing";
    }
    v.schud(kant);
    poging++;
    if (poging >= 2) {
      if (o.opnieuw) {
        await l.zeg("Ah, dat zie ik anders.", "Geen zorgen, we stoppen hier even mee.", "Dat zien we later.");
        await l.verder();
        v.later.push(async () => {
          const r = await grootsteGroep(l, v, links, rechts, vraag, { kleur });
          if (r !== "uitgelegd") await l.zeg("Ja, dat klopt.", kleur ? `Dat potje heeft de meeste ${BN[kleur]}.` : `De ${BN[goed === "links" ? kl : kr]} groep is de grootste.`);
        });
        return "later";
      }
      v.pas({ kader: { kant: goed, kleur }, aantallen: true });
      await l.zeg(
        `${goed === "links" ? "Links" : "Rechts"} zijn het er {${Math.max(a, b)}}.`,
        `Aan de andere kant {${Math.min(a, b)}}.`,
        kleur ? `Het ${goed === "links" ? "linker" : "rechter"} potje heeft de meeste ${BN[kleur]}.` : `De ${BN[goed === "links" ? kl : kr]} groep is de grootste.`,
      );
      await l.verder();
      return "uitgelegd";
    }
    /* 1× fout. */
    await l.wacht(500);
    v.pas({ kader: null });
    if (gemengdeKleuren && kleur) {
      await l.zeg("Geen zorgen.", "Ik haal de andere kleuren even weg.");
      v.pas({ alleen: kleur, telKleur: kleur });
      await l.wacht(500);
    } else {
      await l.zeg("Hmm, laten we samen tellen.");
      await samenTellen(l, v, "links", kl, true);
      await l.zeg("Uitstekend.");
      await samenTellen(l, v, "rechts", kr, false);
    }
    hier = vraag;
    await l.zeg(vraag, "Tik dan op het vinkje.");
    v.pas({ kies: true, vink: true });
  }
}

/**
 * "Hoeveel meer?" bij de potjes die er staan (G8). Keuzes met cijfers en
 * "weet ik niet". 1× fout: de vuurvliegjes zakken netjes naar onderen;
 * 2× fout of weet ik niet: Bliepo zegt het antwoord en de vraag komt terug.
 */
async function hoeveelMeer(l: Lesgids, v: V, links: Vak[], rechts: Vak[], o: { opnieuw?: boolean; vers?: boolean } = {}): Promise<boolean> {
  const a = tel(links);
  const b = tel(rechts);
  const n = Math.abs(a - b);
  const meerKant: Kant = b > a ? "rechts" : "links";
  const kleur = eersteKleur(meerKant === "rechts" ? rechts : links, "geel");
  if (o.vers) v.potjes(links, rechts);
  const vraag = `Hoeveel ${BN[kleur]} vuurvliegjes zijn er meer?`;
  await l.zeg(o.vers ? "Kijk naar de potjes." : "Maar weet je ook hoeveel *meer*?", vraag);
  const opties = vierKeuzes(n, 1, 9);
  const uit: number[] = [];
  v.pas({ keuzes: opties, uit: [], goedeKeuze: null, weetniet: true });
  const antwoord = async (later: boolean) => {
    v.pas({ keuzes: null, weetniet: false, aantallen: true });
    await l.zeg(`Kijk: er ${n === 1 ? "steekt" : "steken"} {${n}} ${n === 1 ? KN[kleur] : BN[kleur]} ${vliegjes(n)} bovenuit.`, `Er ${n === 1 ? "is" : "zijn"} er {${n}} meer.`, ...(later ? ["Dat zien we later."] : []));
    await l.verder();
    if (later) v.later.push(async () => void (await hoeveelMeer(l, v, verspreid(a, eersteKleur(links, "blauw"), links.length / 2), verspreid(b, eersteKleur(rechts, "geel"), rechts.length / 2), { vers: true })));
  };
  for (let poging = 0; ; ) {
    const p = wachtOp(l, ["keuze", "weetniet"], [vraag]);
    await v.wijs(p, ["keuzes", "Tik op het goede getal."], ["weetniet", "Weet je het niet? Tik dan op het vraagteken."]);
    const g = await p;
    if (g.soort === "weetniet") {
      v.zak();
      await l.zeg("Geen zorgen.");
      await antwoord(!!o.opnieuw);
      return false;
    }
    const x = Number(g.keuze);
    if (x === n) {
      v.pas({ goedeKeuze: n, weetniet: false });
      v.golf(meerKant);
      await l.zeg("Dat klopt.", `Er ${n === 1 ? "is" : "zijn"} {${n}} ${n === 1 ? KN[kleur] : BN[kleur]} ${vliegjes(n)} meer.`);
      v.pas({ keuzes: null, goedeKeuze: null });
      return poging === 0;
    }
    poging++;
    uit.push(x);
    v.pas({ uit: [...uit] });
    if (poging >= 2) {
      v.zak();
      await l.zeg("Niet helemaal.");
      await antwoord(!!o.opnieuw);
      return false;
    }
    v.pas({ keuzes: null, weetniet: false });
    await l.zeg(`{${x}} ${x === 1 ? KN[kleur] : BN[kleur]} ${vliegjes(x)} meer?`, "Niet helemaal.");
    v.zak();
    await l.wacht(600);
    await l.zeg("Ik heb de vuurvliegjes netjes neergezet.", "Nu vergelijk je ze makkelijker.", vraag);
    v.pas({ keuzes: opties, uit: [...uit], weetniet: true });
  }
}

/**
 * "Maak de groepen gelijk": het kind zet blauwe vuurvliegjes erbij of laat
 * ze wegvliegen, en tikt op het vinkje. Hulphandje: alles zakt naar onderen.
 * `uitleg`: bij de eerste fout eerst vragen wat "gelijk" betekent (R2).
 */
async function gelijkMaken(l: Lesgids, v: V, links: Vak[], rechts: Vak[], zinnen: string[], o: { uitleg?: boolean } = {}): Promise<boolean | "voorgedaan"> {
  const doel = tel(rechts);
  const start = tel(links);
  const rijen = links.length / 2;
  v.potjes(links, rechts, { pijl: "links" });
  await l.zeg(...zinnen);
  v.pas({ tik: "links", vink: true, hand: true });
  let handGebruikt = false;
  for (let poging = 0; ; poging++) {
    const p = wachtOp(l, ["klaar", "hand"], ["Maak de groepen gelijk.", "Tik dan op het vinkje."]);
    await v.wijs(p, ["hand", "Vind je het lastig? Tik dan op het vraagteken."], ["vink", "Ben je klaar? Tik dan op het vinkje."]);
    const g = await p;
    if (g.soort === "hand") {
      handGebruikt = true;
      poging--;
      v.pas({ hand: false, vink: false });
      v.zak();
      await l.zeg("Kijk, nu staan ze netjes onderaan.");
      v.pas({ vink: true });
      continue;
    }
    if (g.links === doel) {
      v.pas({ tik: null, vink: false, hand: false, pijl: null, aantallen: true });
      v.golf("links");
      return poging === 0 && !handGebruikt;
    }
    v.pas({ tik: null, vink: false, hand: false });
    if (poging >= 1) {
      v.potjes(onderaan(doel, "blauw", rijen), onderaan(doel, eersteKleur(rechts, "geel"), rijen), { aantallen: true });
      await l.zeg(`Kijk: zo zijn er aan elke kant {${doel}}.`, "Dan zijn de groepen gelijk.");
      await l.verder();
      return "voorgedaan";
    }
    if (o.uitleg) {
      await l.zeg("Ik help je even.", "Weet je wat *gelijk* betekent?");
      const b = await kiesWoord(l, v, ["Hetzelfde", "Anders"], { weetniet: true });
      await l.zeg(b === "Hetzelfde" ? "Helemaal goed." : "Gelijk betekent hetzelfde.", "Gelijke groepen hebben evenveel vuurvliegjes.");
      await l.verder();
      v.potjes(links, rechts, { pijl: "links" });
      await l.zeg("Wat denk je?", "Zijn *deze* groepen gelijk?");
      const zijn = await kiesWoord(l, v, ["Ja", "Nee"], { weetniet: true });
      if (zijn === "Nee") await l.zeg("Klopt, ze zijn nog niet gelijk.");
      else await l.zeg(`Kijk, links zijn het er {${start}}.`, `Rechts zijn het er {${doel}}.`, "Ze zijn nog niet gelijk.");
      await l.zeg("Verander de blauwe kant tot ze gelijk zijn.");
    } else {
      v.pas({ aantallen: true });
      await l.zeg(
        linksRechts(g.links, doel),
        g.links < doel ? `Je hebt er nog {${doel - g.links}} nodig.` : `Er ${g.links - doel === 1 ? "is" : "zijn"} er {${g.links - doel}} te veel.`,
      );
    }
    v.pas({ tik: "links", vink: true, hand: true });
  }
}

/**
 * Een getal typen op het vraagteken in de lantaarn ("8 < ?"). Elk getal dat
 * klopt is goed. 1× fout: de bewering als vraag + een gerichte hint;
 * 2× fout of weet ik niet: een voorbeeld, en de vraag komt later terug.
 */
async function vulIn(l: Lesgids, v: V, a: number | null, t: Vast, b: number | null, voorbeeld: number, zinnen: string[], o: { opnieuw?: boolean } = {}): Promise<boolean> {
  const delen = (x: number | null): Deel[] => [
    a === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: a },
    { t: "teken", s: t },
    b === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: b },
  ];
  const klopt = (x: number) => tekenVoor(a ?? x, b ?? x) === t;
  const bekend = (a ?? b) as number;
  const hint =
    t === "="
      ? `Zoek het getal dat gelijk is aan {${bekend}}.`
      : a === null
        ? `Zoek een getal dat ${t === "<" ? "kleiner" : "groter"} is dan {${bekend}}.`
        : `Zoek een getal dat ${t === "<" ? "groter" : "kleiner"} is dan {${bekend}}.`;
  const vraagkant: "links" | "rechts" = a === null ? "links" : "rechts";
  v.lampen(delen(null), { invoer: true });
  await l.zeg(...zinnen);
  v.pas({ vink: true, weetniet: true });
  const voorbeeldZeggen = async () => {
    v.lampen(delen(voorbeeld));
    v.golf(vraagkant);
    await l.zeg(`Bijvoorbeeld {${voorbeeld}}.`, `${zin(a ?? voorbeeld, t, b ?? voorbeeld)}.`, ...(o.opnieuw ? ["Dat zien we later."] : []));
    await l.verder();
    if (o.opnieuw) v.later.push(async () => void (await vulIn(l, v, a, t, b, voorbeeld, ["Welk getal past op het vraagteken?"])));
  };
  for (let poging = 0; ; ) {
    const p = wachtOp(l, ["klaar", "weetniet"], ["Welk getal past op het vraagteken?"]);
    await v.wijs(p, ["invul", "Tik op het vraagteken en typ een getal."], ["vink", "Tik dan op het vinkje."], ["weetniet", "Weet je het niet? Tik dan op het vraagteken hier."]);
    const g = await p;
    v.pas({ vink: false, weetniet: false });
    if (g.soort === "weetniet") {
      await l.zeg("Geen zorgen.");
      await voorbeeldZeggen();
      return false;
    }
    const x = g.waarde ?? 0;
    if (klopt(x)) {
      v.lampen(delen(x));
      v.golf("midden");
      await l.zeg("Helemaal goed.", `${zin(a ?? x, t, b ?? x)}.`);
      return poging === 0;
    }
    poging++;
    v.lampen(delen(x));
    v.schud("midden");
    if (poging >= 2) {
      await l.zeg(`${zin(a ?? x, t, b ?? x)}?`, "Dat klopt niet.");
      await voorbeeldZeggen();
      return false;
    }
    await l.zeg(`${zin(a ?? x, t, b ?? x)}?`, "Dat lijkt niet te kloppen.", hint);
    v.lampen(delen(null), { invoer: true, vink: true, weetniet: true });
  }
}

/* ---------- kaarttekeningen ---------- */

function Lijnkaart({ x, n, kleur, vol }: { x: number; n: number; kleur: string; vol: number[] }) {
  return (
    <g stroke={kleur} strokeWidth="3" fill="none" strokeLinejoin="round">
      {Array.from({ length: n }, (_, i) => {
        const cx = x + (i % 2) * 34;
        const cy = 30 + Math.floor(i / 2) * 34;
        return (
          <g key={i} transform={`rotate(${i % 3 === 0 ? -2 : 2} ${cx + 14} ${cy + 14})`}>
            <rect x={cx} y={cy} width="28" height="28" rx="5" />
            {vol.includes(i) && <path d={`M${cx + 7} ${cy + 21} L${cx + 21} ${cy + 7}`} />}
          </g>
        );
      })}
    </g>
  );
}

function KaartGroepen() {
  return (
    <g>
      <Lijnkaart x={44} n={8} kleur={VAKKLEUR.blauw} vol={[1, 3, 4, 5, 6, 7]} />
      <Lijnkaart x={140} n={8} kleur={VAKKLEUR.oranje} vol={[3, 5, 6, 7]} />
    </g>
  );
}

function KaartTekens() {
  return (
    <g>
      <Lijnkaart x={30} n={6} kleur={VAKKLEUR.blauw} vol={[3, 4, 5]} />
      <polyline points="134,80 110,96 134,112" fill="none" stroke="#f3ecdf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <Lijnkaart x={152} n={6} kleur={VAKKLEUR.groen} vol={[0, 1, 2, 3, 4, 5]} />
    </g>
  );
}

function KaartGetallen() {
  return (
    <g fontFamily="var(--font-les), sans-serif" fontWeight="700" fontSize="78" textAnchor="middle">
      <text x="56" y="126" fill="none" stroke="#3bbfe6" strokeWidth="3">
        6
      </text>
      <polyline points="104,72 140,96 104,120" fill="none" stroke="#f3ecdf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="190" y="126" fill="none" stroke="#fde01a" strokeWidth="3">
        3
      </text>
    </g>
  );
}

/* ---------- de toets (instap en eind) ---------- */

type Toetsgetallen = {
  groot: [number, number];
  gelijk: [number, number];
  kleinerDan: number;
  groterDan: number;
  /** Het oefenen na de toets (tot 15 opgaven samen). */
  oefen: {
    groot: [number, number][];
    gelijk: [number, number][];
    getal: [number | null, Vast, number | null, number][];
    meer: [number, number][];
  };
};

/**
 * De toets zoals Synthesis (R2/R3): 4 vragen, bij een fout geen uitleg en
 * meteen de volgende. Hulphandje = "we leren het samen" en de toets stopt;
 * na 2 fouten stopt hij ook (LESSENPLAN G7: 2× fout = naar de les).
 */
async function toets(l: Lesgids, t: Toetsgetallen) {
  const v = maakVlak(l);
  v.potjes(verspreid(7, "blauw", 5), verspreid(7, "geel", 5));
  await l.zeg("In dit onderdeel gaan we groepen en getallen vergelijken.", "Denk je dat je hier al goed in bent?");
  const al = await kiesWoord(l, v, ["Ja", "Nee"]);
  if (al === "Ja") {
    /* Zoals Synthesis: na "ja" kiest het kind tussen de toets en de eerste les. */
    await l.zeg("Mooi.", "Wil je een korte toets doen?", "Of begin je liever bij de eerste les?");
    const keuze = await kiesWoord(l, v, ["Toets", "Les"]);
    if (keuze !== "Toets") {
      await l.zeg("Prima.", 'Begin dan met de les "Meer of minder".', "Daar oefenen we het samen.");
      return;
    }
    await l.zeg("Goed.", "Laat maar zien wat je kunt.");
  } else {
    await l.zeg("Geen probleem.", "We kijken gewoon wat je al weet.");
  }

  let fouten = 0;
  const stop = async (reden: "hand" | "fouten") => {
    v.pas({ kies: false, vink: false, hand: false, weetniet: false, tik: null, keuzes: null });
    await l.zeg(
      reden === "hand" ? "Geen probleem, ik help je." : "Dit vind je nog een beetje lastig.",
      'Laten we het samen leren in de les "Meer of minder".',
    );
  };
  /** Na een fout: geen uitleg, meteen door. */
  const fout = async () => {
    fouten++;
    await l.zeg("Oké.");
  };

  /* Vraag 1: de grootste groep. */
  const [gb, gg] = t.groot;
  v.potjes(verspreid(gb, "blauw", 5), verspreid(gg, "geel", 5));
  await l.zeg("Tik op de grootste groep.", "Tik dan op het vinkje.");
  v.pas({ kies: true, vink: true, hand: true });
  const p = wachtOp(l, ["klaar", "hand"], ["Tik op de grootste groep."]);
  await v.wijs(p, ["vink", "Ben je klaar? Tik dan op het vinkje."], ["hand", "Kun je dit nog niet? Tik dan op het vraagteken."]);
  let g = await p;
  v.pas({ kies: false, vink: false, hand: false });
  if (g.soort === "hand") return stop("hand");
  const grootKant: Kant = gb > gg ? "links" : "rechts";
  v.pas({ kader: { kant: g.gekozen ?? grootKant } });
  if (g.gekozen === grootKant) {
    v.golf(grootKant);
    await l.zeg("Ja.", `De blauwe groep heeft er {${gb}}.`);
  } else await fout();
  await l.wacht(500);

  /* Vraag 2: gelijk maken (het vinkje telt; tussendoor tellen niet). */
  const [eb, eg] = t.gelijk;
  v.potjes(verspreid(eb, "blauw", 5), verspreid(eg, "geel", 5), { pijl: "links" });
  await l.zeg("Zet blauwe vuurvliegjes erbij of laat ze wegvliegen.", "Maak de groepen gelijk.", "Tik dan op het vinkje.");
  v.pas({ tik: "links", vink: true, hand: true });
  g = await wachtOp(l, ["klaar", "hand"], ["Maak de groepen gelijk.", "Tik dan op het vinkje."]);
  v.pas({ tik: null, vink: false, hand: false, pijl: null });
  if (g.soort === "hand") return stop("hand");
  if (g.links === eg) {
    v.pas({ aantallen: true });
    v.golf("links");
    await l.zeg("Netjes gedaan.", `{${eg}} vuurvliegjes aan elke kant.`, "De groepen zijn gelijk.");
  } else await fout();
  if (fouten >= 2) return stop("fouten");
  await l.wacht(500);

  /* Vraag 3 en 4: een getal bij een teken. */
  const getalVraag = async (a: number | null, tk: Vast, b: number | null, voorbeeld: number, zinnen: string[]) => {
    const delen = (x: number | null): Deel[] => [
      a === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: a },
      { t: "teken", s: tk },
      b === null ? (x === null ? { t: "vraag" } : { t: "getal", n: x }) : { t: "getal", n: b },
    ];
    v.lampen(delen(null), { invoer: true });
    await l.zeg(...zinnen);
    v.pas({ vink: true, weetniet: true, hand: true, handInVlak: true });
    const q = wachtOp(l, ["klaar", "weetniet", "hand"], ["Welk getal past op het vraagteken?"]);
    await v.wijs(q, ["invul", "Tik op het vraagteken en typ een getal."], ["weetniet", "Weet je het niet? Tik dan op het vraagteken hier."]);
    const m = await q;
    v.pas({ vink: false, weetniet: false, hand: false, handInVlak: false });
    if (m.soort === "hand") return "hand" as const;
    if (m.soort === "weetniet") {
      /* Alleen hier is "weet ik niet" (R3): Bliepo zegt het antwoord; telt als niet beheerst. */
      v.lampen(delen(voorbeeld));
      await l.zeg(`Bijvoorbeeld {${voorbeeld}}.`, `${zin(a ?? voorbeeld, tk, b ?? voorbeeld)}.`);
      fouten++;
      return "fout" as const;
    }
    const x = m.waarde ?? 0;
    v.lampen(delen(x));
    if (tekenVoor(a ?? x, b ?? x) === tk) {
      v.golf("midden");
      await l.zeg("Helemaal goed.", `${zin(a ?? x, tk, b ?? x)}.`);
      return "goed" as const;
    }
    await fout();
    return "fout" as const;
  };
  if ((await getalVraag(t.kleinerDan, "<", null, 9, ["Nu vergelijken we getallen met tekens.", "Welk getal past op het vraagteken?"])) === "hand") return stop("hand");
  if (fouten >= 2) return stop("fouten");
  await l.wacht(600);
  if ((await getalVraag(null, ">", t.groterDan, Math.min(9, t.groterDan + 2), ["Nog één, dan is de toets klaar.", "Welk getal past op het vraagteken?"])) === "hand") return stop("hand");
  if (fouten >= 2) return stop("fouten");
  await l.wacht(600);

  /* Daarna oefenen, met hulp zoals in de lessen (samen 15 opgaven). */
  await l.zeg(fouten === 0 ? "Knap, alles goed!" : "Goed gedaan.", "We oefenen nog even door.");
  await l.verder();
  const o = t.oefen;
  for (let i = 0; i < 3; i++) {
    const [b, gl] = o.groot[i];
    const r = await grootsteGroep(l, v, verspreid(b, "blauw", 5), verspreid(gl, "geel", 5), "Tik op de grootste groep.");
    if (r !== "uitgelegd") await l.zeg("Dat klopt.", `De ${b > gl ? "blauwe" : "gele"} groep is de grootste.`);
    await l.wacht(400);
    if (i < o.meer.length) {
      const [mb, mg] = o.meer[i];
      await hoeveelMeer(l, v, verspreid(mb, "blauw", 5), verspreid(mg, "geel", 5), { vers: true });
      await l.wacht(400);
    }
    const [eb2, eg2] = o.gelijk[i];
    if ((await gelijkMaken(l, v, verspreid(eb2, "blauw", 5), verspreid(eg2, "geel", 5), ["Maak de groepen gelijk.", "Tik dan op het vinkje."])) !== "voorgedaan") {
      await l.zeg("Goed zo.", `{${eg2}} aan elke kant.`);
    }
    await l.wacht(400);
    const [a, tk, b2, vb] = o.getal[i];
    await vulIn(l, v, a, tk, b2, vb, ["Welk getal past op het vraagteken?"]);
    await l.wacht(400);
  }

  const tik = l.kaart();
  await Promise.race([l.zeg(l.naam ? `Mooi werk, ${l.naam}!` : "Mooi werk!", "Je kunt groepen en getallen vergelijken.", "Tik op de kaart om hem af te vinken."), tik]);
  await tik;
}

/* ---------- G7: instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "vergelijken-instaptoets",
  titel: "Instaptoets: vergelijken",
  synthesis: "Compare the Pair · Assessment",
  kaarttekening: KaartGroepen,
  async speel(ruw) {
    const l = metVasteKnoppen(ruw);
    await toets(l, {
      groot: [7, 6],
      gelijk: [8, 6],
      kleinerDan: 8,
      groterDan: 8,
      oefen: {
        groot: [
          [5, 8],
          [9, 7],
          [4, 6],
        ],
        meer: [
          [5, 8],
          [9, 7],
        ],
        gelijk: [
          [5, 7],
          [9, 6],
          [3, 4],
        ],
        getal: [
          [7, "<", null, 9],
          [null, ">", 6, 8],
          [null, "=", 4, 4],
        ],
      },
    });
  },
};

/* ---------- G8: meer of minder ---------- */

const meerOfMinder: Lesdraaiboek = {
  id: "vergelijken-meer-of-minder",
  titel: "Meer of minder",
  synthesis: "Compare the Pair · More or Less",
  kaarttekening: KaartGroepen,

  async speel(ruw) {
    const l = metVasteKnoppen(ruw);
    const v = maakVlak(l);
    v.potjes(leeg(3), leeg(3));
    await l.zeg("Vandaag gaan we groepen vergelijken.");
    await l.wacht(600);

    /* 1. De grootste groep (2 × 3). */
    let foutloos = true;
    const groot = async (b: number, g: number, rijen: number, vraag: string, lof: string[]) => {
      const li = verspreid(b, "blauw", rijen);
      const re = verspreid(g, "geel", rijen);
      const r = await grootsteGroep(l, v, li, re, vraag, { opnieuw: true });
      if (r === "goed" || r === "herkansing") await l.zeg(...lof);
      foutloos &&= r === "goed";
      await l.wacht(500);
      return { li, re, r };
    };
    await groot(3, 5, 3, "Tik op de grootste groep.", ["Dat klopt.", "De gele groep is hier de grootste."]);
    await groot(2, 4, 3, "Tik op de groep met de meeste vuurvliegjes.", ["Dat klopt.", "De gele groep heeft meer vuurvliegjes."]);
    await groot(4, 3, 3, "Tik op de grootste groep.", ["Precies.", "De blauwe groep is groter."]);
    await groot(5, 6, 3, "Tik op de groep met de meeste vuurvliegjes.", ["Ja.", "De gele groep heeft er meer."]);

    /* 2. Hoeveel meer? (2 × 5) */
    let st = await groot(8, 9, 5, "Tik op de grootste groep.", ["Precies."]);
    if (!(await hoeveelMeer(l, v, st.li, st.re, { opnieuw: true }))) foutloos = false;
    await l.wacht(500);
    st = await groot(7, 5, 5, "Tik op de grootste groep.", ["Ja, de blauwe groep."]);
    if (!(await hoeveelMeer(l, v, st.li, st.re, { opnieuw: true }))) foutloos = false;

    /* Synthesis maakt het moeilijker omdat het goed gaat; anders zegt hij gewoon dat er iets nieuws komt. */
    if (foutloos) await l.zeg(l.naam ? `${l.naam}, dit gaat je makkelijk af.` : "Dit kun je makkelijk.", "De volgende wordt iets moeilijker.");
    else await l.zeg("Goed geoefend.", "Nu komt er iets nieuws.");
    await l.verder();

    /* 3. Eén kleur tussen andere kleuren. */
    const kleurVraag = async (li: Vak[], re: Vak[], kleur: Kleur, lof: string[]) => {
      const r = await grootsteGroep(l, v, li, re, `Tik op het potje met de meeste ${BN[kleur]} vuurvliegjes.`, { kleur, opnieuw: true });
      if (r === "goed" || r === "herkansing") await l.zeg(...lof);
      await l.wacht(500);
    };
    await kleurVraag(gemengd({ groen: 4, blauw: 1, geel: 1 }, 3), gemengd({ groen: 3, geel: 2, blauw: 1 }, 3), "groen", ["Ja.", "Dat potje heeft meer groene."]);
    await kleurVraag(gemengd({ blauw: 3, groen: 2, geel: 1 }, 3), gemengd({ blauw: 2, geel: 2, groen: 2 }, 3), "blauw", [
      l.naam ? `Dat klopt, ${l.naam}.` : "Dat klopt.",
      "Het linker potje heeft de meeste blauwe.",
    ]);
    await kleurVraag(gemengd({ groen: 8, blauw: 1, geel: 1 }, 5), gemengd({ groen: 6, geel: 2, blauw: 2 }, 5), "groen", ["Dat klopt.", "Het linker potje heeft meer groene."]);
    await kleurVraag(gemengd({ geel: 4, groen: 3, blauw: 2 }, 5), gemengd({ geel: 6, blauw: 2, groen: 1 }, 5), "geel", ["Goed zo.", "Het rechter potje heeft meer gele."]);
    await l.zeg(l.naam ? `${l.naam}, je doet het heel goed.` : "Je doet het heel goed.", "We oefenen nog één ding.");
    await l.verder();

    /* 4. Gelijk maken. */
    const zinnen = ["Zet blauwe vuurvliegjes erbij of laat ze wegvliegen.", "Maak de groepen *gelijk*.", "Tik dan op het vinkje."];
    if ((await gelijkMaken(l, v, verspreid(3, "blauw", 3), verspreid(4, "geel", 3), zinnen, { uitleg: true })) !== "voorgedaan")
      await l.zeg("Perfect.", "De groepen zijn gelijk.", "{4} vuurvliegjes aan elke kant.");
    await l.wacht(800);
    if ((await gelijkMaken(l, v, verspreid(5, "blauw", 3), verspreid(4, "geel", 3), ["Maak de groepen weer gelijk.", "Verander alleen de blauwe kant."])) !== "voorgedaan")
      await l.zeg("Netjes gedaan.", "{4} vuurvliegjes aan elke kant.", "De groepen zijn gelijk.");
    await l.wacht(800);
    if ((await gelijkMaken(l, v, verspreid(7, "blauw", 5), verspreid(9, "geel", 5), ["Nog één keer.", "Maak de groepen gelijk."])) !== "voorgedaan")
      await l.zeg("Perfect.", "De groepen zijn gelijk.", "{9} vuurvliegjes aan elke kant.");
    await l.wacht(800);

    await speelLater(l, v);

    const tik = l.kaart();
    /* Tikt het kind al op de kaart terwijl Bliepo nog praat, dan gewoon door. */
    await Promise.race([l.zeg(l.naam ? `Mooi werk, ${l.naam}!` : "Mooi werk!", "Groepen vergelijken lukt je al goed.", "Tik op de kaart om hem af te vinken."), tik]);
    await tik;
  },
};

/* ---------- G9: de tekens ---------- */

/** Het kind zet `n` vuurvliegjes in één potje; te veel wordt uitgelegd. */
async function tikVakjes(l: Lesgids, v: V, kant: Kant, n: number) {
  v.pas({ tik: kant });
  for (;;) {
    const g = await wachtOp(l, ["vakje"], [`Tik op {${n}} lege plekjes.`]);
    if (g[kant] === n) break;
    if (g[kant] > n) {
      v.pas({ tik: null });
      await l.zeg("Dat zijn er te veel.", "Tik op een vuurvliegje om het weg te laten vliegen.");
      v.pas({ tik: kant });
    }
  }
  v.pas({ tik: null });
  v.golf(kant);
}

/** Het teken kiezen tussen twee potjes (tik op het teken, dan het vinkje). */
async function kiesTekenPotjes(l: Lesgids, v: V, li: Vak[], re: Vak[], vraag: string[], lof: string, o: { opnieuw?: boolean } = {}): Promise<boolean> {
  const a = tel(li);
  const b = tel(re);
  const goed = tekenVoor(a, b);
  v.potjes(li, re, { teken: "?" });
  await l.zeg(...vraag);
  v.pas({ tekenTik: true, vink: true, weetniet: true });
  const uitleg = async (later: boolean) => {
    const rijen = li.length / 2;
    v.potjes(onderaan(a, eersteKleur(li, "blauw"), rijen), onderaan(b, eersteKleur(re, "geel"), rijen), { teken: goed, aantallen: true, stip: goed === "=" ? null : "klein", overgang: "zak" });
    await l.zeg(`Het hoort zo: ${zin(a, goed, b)}.`, goed === "=" ? "Ze zijn even groot." : "De kleine kant wijst naar de kleinste groep.", ...(later ? ["Dat zien we later."] : []));
    await l.verder();
    if (later) v.later.push(async () => void (await kiesTekenPotjes(l, v, li, re, ["Welk teken hoort hier?"], "Goed zo.")));
  };
  for (let poging = 0; ; ) {
    const p = wachtOp(l, ["klaar", "weetniet"], ["Tik op het vraagteken.", "Tik dan op het vinkje."]);
    await v.wijs(p, ["teken", "Tik op het vraagteken om het teken te wisselen."], ["vink", "Ben je klaar? Tik dan op het vinkje."], ["weetniet", "Weet je het niet? Tik dan op het vraagteken hier."]);
    const m = await p;
    if (m.soort === "weetniet") {
      v.pas({ tekenTik: false, vink: false, weetniet: false });
      await l.zeg("Geen zorgen.");
      await uitleg(!!o.opnieuw);
      return false;
    }
    if (m.teken === "?" || !m.teken) {
      await l.zeg("Tik eerst op het vraagteken.");
      continue;
    }
    if (m.teken === goed) {
      v.pas({ tekenTik: false, vink: false, weetniet: false, stip: null, teken: goed });
      v.golf("midden");
      await l.zeg(lof, `${zin(a, goed, b)}.`);
      return poging === 0;
    }
    poging++;
    v.schud("midden");
    if (poging >= 2) {
      v.pas({ tekenTik: false, vink: false, weetniet: false });
      await uitleg(!!o.opnieuw);
      return false;
    }
    const fout = m.teken as Vast;
    v.pas({ vink: false });
    if (goed === "=") {
      v.pas({ aantallen: true });
      await l.zeg(`${zin(a, fout, b)}?`, "Kijk goed: ze zijn even groot.", "Dan hoort daar het is-gelijkteken.");
    } else {
      v.pas({ stip: "klein", aantallen: true });
      await l.zeg(fout === "=" ? `{${a}} en {${b}} zijn gelijk?` : "Hmm.", "De kleinste groep hoort aan de kleine kant van het teken.", "Probeer het nog eens.");
    }
    v.pas({ vink: true });
  }
}

const tekens: Lesdraaiboek = {
  id: "vergelijken-tekens",
  titel: "De tekens =, < en >",
  synthesis: "Compare the Pair · Comparison Symbols",
  kaarttekening: KaartTekens,

  async speel(ruw) {
    const l = metVasteKnoppen(ruw);
    const v = maakVlak(l);

    /* 1. Drie verstopte tekens in drie lantaarntjes. */
    v.lampen([
      { t: "teken", s: "?", tik: true, lamp: true },
      { t: "teken", s: "?", tik: true, lamp: true },
      { t: "teken", s: "?", tik: true, lamp: true },
    ]);
    await l.zeg("Kijk eens naar deze vraagtekens.", "Tik ze alle drie aan.", "Er zitten belangrijke tekens achter.");
    let eerste = true;
    let blijf = false;
    let gevonden: Teken[] = ["?", "?", "?"];
    for (;;) {
      const m = await wachtOp(l, ["teken"], ["Tik op de vraagtekens."]);
      gevonden = (m.delen ?? []).map((d) => (d.t === "teken" ? d.s : "?"));
      if (new Set(gevonden).size === 3 && !gevonden.includes("?")) break;
      if (eerste && gevonden.includes("?")) {
        eerste = false;
        void l.zeg("Geef elk vraagteken een tik.");
      } else if (!blijf && !gevonden.includes("?")) {
        blijf = true;
        void l.zeg("Blijf erop tikken.", "Er zijn drie verschillende tekens.");
      }
    }
    v.lampen(gevonden.map((s) => ({ t: "teken" as const, s, lamp: true })));
    v.golf("midden");
    await l.zeg("Uitstekend.", "Vandaag oefenen we met deze tekens.", "Heb je ze al eens gebruikt?");
    const al = await kiesWoord(l, v, ["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi, dan herhalen we ze even." : "Geen probleem, we leren ze nu.");
    await l.wacht(500);

    /* 2. Is gelijk aan. */
    v.lampen([{ t: "teken", s: "=" }]);
    await l.zeg("Dit teken zie je vaak bij rekenen.", "Weet je hoe het heet?");
    const naam = await kiesWoord(l, v, ["is gelijk aan", "plus", "min"], { weetniet: true });
    if (naam === "is gelijk aan") await l.zeg("Ja.", "Dit is het is-gelijkteken.");
    else await l.zeg(naam === null ? "Geen zorgen." : naam === "plus" ? "Een plusteken? Niet helemaal." : "Een minteken? Niet helemaal.", "Dit is het is-gelijkteken.");
    await l.verder();

    v.potjes(leeg(3), leeg(3), { teken: "=" });
    await l.zeg("Tik op de lege plekjes.", "Zorg dat er aan elke kant {3} vuurvliegjes zijn.");
    await tikVakjes(l, v, "links", 3);
    await l.zeg("Top.", "Nu {3} in het andere potje.");
    await tikVakjes(l, v, "rechts", 3);
    await l.zeg("Perfect.", "Aan elke kant {3}.", "Het is-gelijkteken laat zien dat ze evenveel hebben.");
    await l.verder();

    /* 3. Kleiner dan. */
    await l.zeg("Dat was het eerste teken.", "Nu het volgende.");
    v.potjes(leeg(3), leeg(3), { teken: "<" });
    await l.zeg("Dit teken heet *is kleiner dan*.", "Je gebruikt het als links minder is dan rechts.");
    await l.verder();
    await l.zeg("Dat kan lastig zijn.", "Daarom heb ik een trucje.");
    v.pas({ stip: "klein" });
    await l.zeg("Kijk naar het gele stipje.", "Dat is de kleine kant van het teken.", "Aan deze kant zet je de kleinste groep.");
    await l.verder();
    await l.zeg("Zet hier een kleine groep neer.", "Tik op {2} lege plekjes.");
    await tikVakjes(l, v, "links", 2);
    await l.zeg("Perfect.", "Dat is een kleine groep.");
    v.pas({ stip: "groot" });
    await l.zeg("Aan deze kant is het teken wijd open.", "Dit is de grote kant.");
    await l.verder();
    await l.zeg("Maak hier een grotere groep dan {2}.", "Tik op {5} lege plekjes.");
    await tikVakjes(l, v, "rechts", 5);
    v.pas({ aantallen: true });
    await l.zeg("Perfect.", `Je liet zien: ${zin(2, "<", 5)}.`);
    await l.verder();

    /* 4. Groter dan. */
    v.potjes(leeg(3), leeg(3), { teken: ">" });
    await l.zeg("En als laatste dit teken.", "Het heet *is groter dan*.", "Je gebruikt het als links meer is dan rechts.");
    await l.verder();
    v.pas({ stip: "groot" });
    await l.zeg("Kijk: de stipjes staan bij de grote kant.", "Zet hier een grotere groep neer.", "Tik op {3} lege plekjes.");
    v.pas({ tik: "beide" });
    for (;;) {
      const m = await wachtOp(l, ["vakje"], ["Tik op {3} lege plekjes aan de grote kant."]);
      if (m.rechts > 0) {
        v.pas({ tik: null });
        v.potjes(onderaan(m.links, "blauw", 3), leeg(3), { teken: ">", stip: "groot" });
        await l.zeg("Ah, je tikte aan de andere kant.", "We kijken nu alleen naar de grote kant.", "Tik aan deze kant op {3} plekjes.");
        if (m.links === 3) break;
        v.pas({ tik: "beide" });
        continue;
      }
      if (m.links === 3) break;
      if (m.links > 3) {
        v.pas({ tik: null });
        await l.zeg("Dat zijn er te veel.", "Tik op een vuurvliegje om het weg te laten vliegen.");
        v.pas({ tik: "beide" });
      }
    }
    v.pas({ tik: null, stip: "klein" });
    v.golf("links");
    await l.zeg("Aan de kleine kant zet je de kleinste groep.", "Tik hier op {1} plekje.");
    await tikVakjes(l, v, "rechts", 1);
    v.pas({ aantallen: true });
    await l.zeg("Heel goed.", `Je liet zien: ${zin(3, ">", 1)}.`);
    await l.verder();

    /* 5. Zelf of nog eens? */
    await l.zeg("Je doet het heel goed.", "Wil je de tekens zelf gebruiken?", "Of wil je nog wat oefenen?");
    const keuze = await kiesWoord(l, v, ["Zelf doen", "Oefenen"]);
    if (keuze !== "Zelf doen") {
      await l.zeg("Goed, we kijken nog één keer.");
      v.potjes(onderaan(3, "blauw", 3), onderaan(3, "geel", 3), { teken: "=", aantallen: true });
      await l.zeg(`${zin(3, "=", 3)}.`, "Aan beide kanten evenveel.");
      await l.verder();
      v.potjes(onderaan(2, "blauw", 3), onderaan(5, "geel", 3), { teken: "<", aantallen: true, stip: "klein" });
      await l.zeg(`${zin(2, "<", 5)}.`, "De kleine kant wijst naar de kleinste groep.");
      await l.verder();
      v.potjes(onderaan(3, "blauw", 3), onderaan(1, "geel", 3), { teken: ">", aantallen: true, stip: "klein" });
      await l.zeg(`${zin(3, ">", 1)}.`, "De kleine kant wijst weer naar de kleinste groep.");
      await l.verder();
      await l.zeg("Nu probeer je het zelf.");
    } else {
      await l.zeg("Fantastisch.", "Laat maar zien wat je kunt.");
    }

    /* 6. Zelf het teken kiezen. */
    const opgaven: [Vak[], Vak[], string][] = [
      [verspreid(5, "groen", 3), verspreid(4, "blauw", 3), "Dat ziet er goed uit."],
      [verspreid(3, "geel", 3), verspreid(5, "groen", 3), "Ja, goed zo."],
      [verspreid(4, "blauw", 3), verspreid(4, "geel", 3), "Helemaal goed."],
      [verspreid(8, "blauw", 5), verspreid(7, "geel", 5), l.naam ? `Netjes gedaan, ${l.naam}.` : "Netjes gedaan."],
      [verspreid(2, "groen", 5), verspreid(6, "geel", 5), "Precies."],
      [verspreid(9, "geel", 5), verspreid(9, "blauw", 5), "Klopt."],
    ];
    let eersteOpgave = true;
    for (const [li, re, lof] of opgaven) {
      await kiesTekenPotjes(l, v, li, re, eersteOpgave ? ["Kies het goede teken tussen de groepen.", "Tik op het vraagteken om te wisselen."] : ["Welk teken hoort hier?"], lof, { opnieuw: true });
      eersteOpgave = false;
      await l.wacht(500);
    }

    /* 7. Omgekeerd: het teken staat er al, het kind maakt de groepen. */
    await l.zeg(l.naam ? `${l.naam}, je kent ze goed.` : "Je kent ze goed.", "We doen het nu een beetje anders.");
    await l.verder();
    const bouw: [Vast, number][] = [
      [">", 3],
      ["<", 3],
      ["<", 5],
    ];
    let eersteBouw = true;
    let laatste = { links: 0, rechts: 0 };
    for (const [tk, rijen] of bouw) {
      v.potjes(leeg(rijen), leeg(rijen), { teken: tk });
      await l.zeg(
        eersteBouw ? "Zet in beide potjes vuurvliegjes." : "Maak weer twee groepen.",
        "Zorg dat het teken klopt.",
        ...(eersteBouw ? ["Tik op een leeg plekje voor een vuurvliegje.", "Tik op een vuurvliegje om het weg te laten vliegen."] : []),
      );
      eersteBouw = false;
      v.pas({ tik: "beide", vink: true });
      let fouten = 0;
      for (;;) {
        const m = await wachtOp(l, ["klaar"], ["Zorg dat het teken klopt.", "Tik dan op het vinkje."]);
        if (tekenVoor(m.links, m.rechts) === tk && m.links + m.rechts > 0) {
          laatste = { links: m.links, rechts: m.rechts };
          v.pas({ tik: null, vink: false, aantallen: true, stip: null });
          v.golf("midden");
          await l.zeg("Precies.", `${zin(m.links, tk, m.rechts)}.`);
          break;
        }
        fouten++;
        v.pas({ tik: null, vink: false, aantallen: true });
        v.schud("midden");
        if (fouten === 1) {
          await l.zeg("Hmm, dat past nog niet bij het teken.", "Ik zet de getallen erbij.");
        } else if (fouten === 2) {
          v.pas({ stip: "klein" });
          await l.zeg("Kijk naar het gele stipje.", "De kleinste groep hoort aan de kleine kant.");
        } else {
          /* 3× niet gelukt: Bliepo doet het voor, zodat de les niet vastloopt. */
          const [x, y] = tk === ">" ? [3, 1] : [2, rijen > 3 ? 6 : 4];
          v.potjes(onderaan(x, "blauw", rijen), onderaan(y, "geel", rijen), { teken: tk, aantallen: true, stip: "klein" });
          await l.zeg("Ik doe het even voor.", `${zin(x, tk, y)}.`, "De kleine kant wijst naar de kleinste groep.");
          await l.verder();
          laatste = { links: x, rechts: y };
          break;
        }
        v.pas({ tik: "beide", vink: true });
      }
      await l.wacht(500);
    }

    /* Hoeveel erbij om gelijk te maken? */
    const erbij = async (li: number, re: number, opnieuw: boolean) => {
      const nodig = re - li;
      const rijen = 5;
      v.potjes(onderaan(li, "blauw", rijen), onderaan(re, "geel", rijen), { teken: "<", aantallen: true, overgang: "zak" });
      const vraag = "Hoeveel blauwe vuurvliegjes moeten erbij?";
      await l.zeg("Nu maken we de groepen gelijk.", vraag);
      const opties = vierKeuzes(nodig, 1, 9);
      const uit: number[] = [];
      v.pas({ keuzes: opties, weetniet: true });
      for (let poging = 0; ; ) {
        const p = wachtOp(l, ["keuze", "weetniet"], [vraag]);
        await v.wijs(p, ["keuzes", "Tik op het goede getal."]);
        const m = await p;
        const x = m.soort === "keuze" ? Number(m.keuze) : null;
        if (x === nodig) {
          v.pas({ goedeKeuze: nodig, weetniet: false });
          await l.wacht(400);
          v.potjes(onderaan(re, "blauw", rijen), onderaan(re, "geel", rijen), { teken: "=", aantallen: true, overgang: "zak" });
          v.golf("midden");
          await l.zeg("Bingo!", `Met {${nodig}} ${vliegjes(nodig)} erbij zijn de groepen gelijk.`);
          await l.verder();
          return;
        }
        if (x !== null) {
          poging++;
          uit.push(x);
          v.pas({ uit: [...uit] });
        }
        if (x === null || poging >= 2) {
          v.pas({ keuzes: null, weetniet: false });
          v.potjes(onderaan(re, "blauw", rijen), onderaan(re, "geel", rijen), { teken: "=", aantallen: true, overgang: "zak" });
          await l.zeg(x === null ? "Geen zorgen." : "Kijk maar.", `Er ${nodig === 1 ? "moet" : "moeten"} er {${nodig}} bij.`, `{${li}} en {${nodig}} is samen {${re}}.`, ...(opnieuw ? ["Dat zien we later."] : []));
          await l.verder();
          if (opnieuw) v.later.push(() => erbij(li, re, false));
          return;
        }
        v.pas({ keuzes: null, weetniet: false });
        await l.zeg(linksRechts(li, re), "Kijk nog eens hoeveel er links mist.");
        v.pas({ keuzes: opties, uit: [...uit], weetniet: true });
      }
    };
    const li = laatste.links < laatste.rechts ? laatste.links : 2;
    const re = laatste.links < laatste.rechts ? laatste.rechts : 6;
    await erbij(li, re, true);

    await speelLater(l, v);

    const tik = l.kaart();
    /* Tikt het kind al op de kaart terwijl Bliepo nog praat, dan gewoon door. */
    await Promise.race([l.zeg(l.naam ? `Mooi werk, ${l.naam}!` : "Mooi werk!", "Je kent deze tekens nu.", "Tik op de kaart om hem af te vinken."), tik]);
    await tik;
  },
};

/* ---------- G10: getallen vergelijken ---------- */

/**
 * Het kind kiest het teken tussen twee getallen. 1× fout: het antwoord als
 * vraag teruglezen ("{5} is groter dan {8}?"), dan helpen het gele stipje en
 * grote/kleine getallen; 2× fout of weet ik niet: Bliepo zegt het en de vraag
 * komt later terug.
 */
async function kiesTeken(l: Lesgids, v: V, a: number, b: number, vraag: string[], lof: string, o: { opnieuw?: boolean } = {}): Promise<boolean> {
  const goed = tekenVoor(a, b);
  const delen = (s: Teken, hulp = false, tik = true): Deel[] => [
    { t: "getal", n: a, maat: hulp && a !== b ? (a > b ? 1.25 : 0.72) : 1 },
    { t: "teken", s, tik },
    { t: "getal", n: b, maat: hulp && a !== b ? (b > a ? 1.25 : 0.72) : 1 },
  ];
  v.lampen(delen("?"));
  await l.zeg(...vraag);
  v.pas({ vink: true, weetniet: true });
  const zegHet = async (later: boolean) => {
    v.lampen(delen(goed, false, false), { stip: goed === "=" ? null : "klein" });
    await l.zeg(`Het hoort zo: ${zin(a, goed, b)}.`, goed === "=" ? "Ze zijn hetzelfde." : "De kleine kant wijst naar het kleinste getal.", ...(later ? ["Dat zien we later."] : []));
    await l.verder();
    if (later) v.later.push(async () => void (await kiesTeken(l, v, a, b, ["Welk teken hoort hier?"], "Goed zo.")));
  };
  let hulp = false;
  for (let poging = 0; ; ) {
    const p = wachtOp(l, ["klaar", "weetniet"], ["Tik op het vraagteken.", "Tik dan op het vinkje."]);
    await v.wijs(p, ["teken", "Tik op het vraagteken om het teken te wisselen."], ["vink", "Ben je klaar? Tik dan op het vinkje."], ["weetniet", "Weet je het niet? Tik dan op het vraagteken hier."]);
    const m = await p;
    if (m.soort === "weetniet") {
      v.pas({ vink: false, weetniet: false });
      await l.zeg("Geen zorgen.");
      await zegHet(!!o.opnieuw);
      return false;
    }
    const t = m.teken ?? "?";
    if (t === "?") {
      await l.zeg("Tik eerst op het vraagteken.");
      continue;
    }
    if (t === goed) {
      v.lampen(delen(goed, false, false));
      v.golf("midden");
      v.pas({ vink: false, weetniet: false });
      await l.zeg(lof, `${zin(a, goed, b)}.`);
      return poging === 0;
    }
    poging++;
    v.schud("midden");
    v.pas({ vink: false, weetniet: false });
    if (poging >= 2) {
      await l.zeg(t === "=" ? `{${a}} en {${b}} zijn gelijk?` : `${zin(a, t, b)}?`, "Dat klopt niet.");
      await zegHet(!!o.opnieuw);
      return false;
    }
    await l.zeg(t === "=" ? `{${a}} en {${b}} zijn gelijk?` : `${zin(a, t, b)}?`, "Dat lijkt niet te kloppen.");
    hulp = true;
    v.lampen(delen("?", hulp), { stip: goed === "=" ? null : "klein" });
    await l.zeg(goed === "=" ? "Kijk: het zijn dezelfde getallen." : "De kleine kant wijst naar het kleinste getal.", "Probeer het nog eens.");
    v.pas({ vink: true, weetniet: true });
  }
}

/** Een getal laten rollen (tikken: 1 → 2 → … → 9 → 1) tot het klopt. */
async function rol(l: Lesgids, v: V, start: number, tk: Vast, b: number, klopt: (n: number) => boolean, extra: Partial<HoloProps>, onderweg?: (n: number) => Promise<void>) {
  v.lampen([{ t: "getal", n: start, rol: true }, { t: "teken", s: tk }, { t: "getal", n: b }], extra);
  return async (zinnen: string[]) => {
    await l.zeg(...zinnen);
    await v.wijs(new Promise(() => {}), ["rol", "Tik op het getal om het te veranderen."]);
    let n = start;
    for (;;) {
      const m = await wachtOp(l, ["rol"], ["Tik op het getal."]);
      n = m.n ?? n;
      if (klopt(n)) break;
      if (onderweg) await onderweg(n);
    }
    v.lampen([{ t: "getal", n }, { t: "teken", s: tk }, { t: "getal", n: b }], { stip: extra.stip ?? null });
    v.golf("midden");
    return n;
  };
}

const getallenVergelijken: Lesdraaiboek = {
  id: "vergelijken-getallen",
  titel: "Getallen vergelijken",
  synthesis: "Compare the Pair · Comparing Numbers",
  kaarttekening: KaartGetallen,

  async speel(ruw) {
    const l = metVasteKnoppen(ruw);
    const v = maakVlak(l);
    v.lampen([{ t: "getal", n: 6 }, { t: "teken", s: "?" }, { t: "getal", n: 3 }]);
    await l.zeg("We gaan getallen vergelijken met tekens.", "Kun je dat al?");
    const kan = await kiesWoord(l, v, ["Ja", "Nee"]);
    let totaal = 0;
    let zonderHulp = 0;

    if (kan !== "Ja") {
      /* Herhaling van de tekens. */
      await l.zeg("Geen probleem.", "We herhalen wat de tekens betekenen.");
      await l.wacht(500);
      v.lampen([{ t: "teken", s: "=" }]);
      await l.zeg("Dit teken zie je vaak bij rekenen.", "Weet je hoe het heet?");
      const naam = await kiesWoord(l, v, ["is gelijk aan", "plus", "min"], { weetniet: true });
      if (naam === "is gelijk aan") await l.zeg("Dat klopt.", "Het heet het is-gelijkteken.");
      else await l.zeg(naam === null ? "Geen zorgen." : naam === "plus" ? "Een plusteken? Niet helemaal." : "Een minteken? Niet helemaal.", "Het heet het is-gelijkteken.");
      await l.zeg("Het is-gelijkteken zegt: beide kanten zijn hetzelfde.", "We proberen het met getallen.");
      await l.verder();

      let gezegd = false;
      let speel = await rol(l, v, 1, "=", 7, (n) => n === 7, {}, async () => {
        if (gezegd) return;
        gezegd = true;
        void l.zeg("Blijf tikken tot je bij de {7} bent.");
      });
      await speel(["Tik op dit getal tot het gelijk is aan {7}."]);
      totaal++;
      zonderHulp++;
      await l.zeg("Daar heb je het.", `${zin(7, "=", 7)}.`, "Het teken in het midden zegt dat ze hetzelfde zijn.");
      await l.verder();

      /* Kleiner dan. */
      v.lampen([{ t: "teken", s: "<" }]);
      await l.zeg("Dit teken heet *is kleiner dan*.", "Je gebruikt het als het linker getal het kleinste is.", "Ik heb een trucje voor je.");
      v.pas({ stip: "klein" });
      await l.zeg("Kijk naar het gele stipje.", "Dat is de kleine kant van het teken.", "Die kant wijst naar het kleinste getal.");
      await l.verder();
      speel = await rol(l, v, 8, "<", 5, (n) => n < 5, { stip: "klein" });
      const kl = await speel(["Maar {8} is niet kleiner dan {5}.", "Maak van de {8} een getal onder de {5}.", "Tik erop om het te veranderen."]);
      totaal++;
      zonderHulp++;
      await l.zeg("Perfect.", `Nu zegt het teken: ${zin(kl, "<", 5)}.`);
      await l.verder();

      /* Groter dan. */
      v.lampen([{ t: "teken", s: ">" }]);
      await l.zeg("Het laatste teken heet *is groter dan*.", "Je gebruikt het als het linker getal het grootste is.");
      v.pas({ stip: "groot" });
      await l.zeg("Kijk: de stipjes staan bij de grote kant.", "Daar komt het grootste getal.");
      await l.verder();
      let bijVier = false;
      speel = await rol(l, v, 1, ">", 4, (n) => n > 4, { stip: "groot" }, async (n) => {
        if (n === 4 && !bijVier) {
          bijVier = true;
          void l.zeg("Nu zijn ze gelijk.", "Maak er een getal *boven* de {4} van.");
        }
      });
      const gr = await speel(["Maar {1} is niet groter dan {4}.", "Maak van de {1} een getal boven de {4}."]);
      totaal++;
      zonderHulp++;
      await l.zeg("Perfect.", `Nu zegt het teken: ${zin(gr, ">", 4)}.`);
      await l.verder();

      await l.zeg(l.naam ? `Je snapt het al, ${l.naam}.` : "Je snapt het al.", "Wil je zelf een som proberen?", "Of de tekens nog eens bekijken?");
      const verder = await kiesWoord(l, v, ["Zelf", "Nog eens"]);
      if (verder !== "Zelf") {
        v.lampen([{ t: "getal", n: 7 }, { t: "teken", s: "=" }, { t: "getal", n: 7 }]);
        await l.zeg(`${zin(7, "=", 7)}.`, "Beide kanten zijn hetzelfde.");
        await l.verder();
        v.lampen([{ t: "getal", n: 3 }, { t: "teken", s: "<" }, { t: "getal", n: 5 }], { stip: "klein" });
        await l.zeg(`${zin(3, "<", 5)}.`, "De kleine kant wijst naar het kleinste getal.");
        await l.verder();
        v.lampen([{ t: "getal", n: 6 }, { t: "teken", s: ">" }, { t: "getal", n: 2 }], { stip: "klein" });
        await l.zeg(`${zin(6, ">", 2)}.`, "Ook hier wijst de kleine kant naar het kleinste getal.");
        await l.verder();
        await l.zeg("Nu probeer je het zelf.");
      } else {
        await l.zeg("Top.", "We beginnen meteen.");
      }
    } else {
      await l.zeg("Mooi.", "Dan beginnen we meteen.");
    }

    /* Zelf het teken kiezen; tussendoor vraagt Bliepo of het kind wil doorgaan (Synthesis). */
    const opgaven: [number, number, string][] = [
      [7, 5, "Dat ziet er goed uit."],
      [5, 8, "Absoluut."],
      [5, 5, "Helemaal goed."],
      [9, 6, "Netjes."],
      [3, 4, "Ja, goed zo."],
      [8, 2, "Precies."],
      [6, 6, "Klopt."],
      [4, 9, "Goed zo."],
      [10, 7, "Helemaal goed."],
      [2, 1, "Ja!"],
    ];
    let gestopt = false;
    for (let i = 0; i < opgaven.length; i++) {
      const [a, b, lof] = opgaven[i];
      const vraag = i === 0 ? ["Kies het goede teken tussen de getallen.", "Tik op het vraagteken om te wisselen."] : ["Welk teken hoort hier?"];
      if (await kiesTeken(l, v, a, b, vraag, lof, { opnieuw: true })) zonderHulp++;
      totaal++;
      await l.wacht(500);
      /* Na elke 4 opgaven: even checken (R3, hulpregel 10). "Nee" rondt netjes af. */
      if ((i + 1) % 4 === 0 && i + 1 < opgaven.length) {
        await l.zeg(i < 4 ? "Even kijken." : "", i < 4 ? "Wil je doorgaan met deze les?" : "Zullen we doorgaan?");
        const door = await kiesWoord(l, v, ["Ja", "Nee"]);
        if (door === "Nee") {
          await l.zeg("Oké.", "Dan stoppen we.");
          gestopt = true;
          break;
        }
        await l.zeg("Klinkt goed.");
      }
    }

    let nog: string | null = "Stoppen";
    if (!gestopt) {
      await l.zeg("Wil je nog wat oefenen?", "Of zullen we stoppen?");
      nog = await kiesWoord(l, v, ["Oefenen", "Stoppen"]);
    }
    if (nog !== "Stoppen") {
      await l.zeg("Goed, nu kies jij het getal.");
      const invul: [number | null, Vast, number | null, number][] = [
        [5, ">", null, 3],
        [null, "<", 4, 2],
        [null, "=", 5, 5],
        [7, "<", null, 9],
        [null, ">", 6, 8],
      ];
      for (const [a, t, b, vb] of invul) {
        if (await vulIn(l, v, a, t, b, vb, ["Welk getal past op het vraagteken?"], { opnieuw: true })) zonderHulp++;
        totaal++;
        await l.wacht(500);
      }
    }
    if (!gestopt) await speelLater(l, v);
    else v.later.length = 0;

    if (zonderHulp === totaal) await l.zeg(`Je had er {${totaal}} van de {${totaal}} goed, zonder hulp.`, "Misschien moet jij de juf zijn!");
    else await l.zeg("Je hebt goed geoefend.");
    await l.verder();

    const tik = l.kaart();
    /* Tikt het kind al op de kaart terwijl Bliepo nog praat, dan gewoon door. */
    await Promise.race([l.zeg(l.naam ? `Mooi werk, ${l.naam}!` : "Mooi werk!", "Je kunt getallen vergelijken met tekens.", "Tik op de kaart om hem af te vinken."), tik]);
    await tik;
  },
};

/* ---------- G11: eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "vergelijken-eindtoets",
  titel: "Eindtoets: vergelijken",
  synthesis: "Compare the Pair · Mastery Check",
  kaarttekening: KaartGroepen,
  async speel(ruw) {
    const l = metVasteKnoppen(ruw);
    await toets(l, {
      groot: [9, 7],
      gelijk: [9, 7],
      kleinerDan: 8,
      groterDan: 5,
      oefen: {
        groot: [
          [6, 9],
          [8, 5],
          [3, 4],
        ],
        meer: [
          [6, 9],
          [8, 5],
        ],
        gelijk: [
          [4, 6],
          [10, 8],
          [6, 5],
        ],
        getal: [
          [6, "<", null, 8],
          [null, ">", 3, 5],
          [null, "=", 7, 7],
        ],
      },
    });
  },
};

export const LESSEN_VERGELIJKEN: Lesdraaiboek[] = [instaptoets, meerOfMinder, tekens, getallenVergelijken, eindtoets];
