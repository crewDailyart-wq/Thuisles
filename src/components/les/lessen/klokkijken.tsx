/**
 * Lessen Klokkijken (groep 3) — naar Synthesis "Telling Time": Hour Hand Hunt,
 * Set the Hour, Halfway Around en Quarter Past (INSPIRATIE.md, ronde 1 en 2).
 *
 * Tweede bouwronde (10 oktober 2026): ook de groep 3-delen van The Counting
 * Clock, de Assessment (instaptoets), de Mastery Check (eindtoets), Beat the
 * Alarm, The Five-Minute Secret, en uit "How Long It Takes" Five en Ten
 * Minutes Later en Start to Finish. Van die lessen staan alleen de opdrachten
 * met het label groep 3 (of "3 en 4") erin; de rest is groep 4 of hoger.
 *
 * Alles gebeurt op de wijzerklok uit `../vlakken/klok-wijzerklok.tsx`.
 *
 * Phaser-ronde (27 oktober 2026, BOUWEN-PHASER.md): de vijf groep 3-lessen
 * uit LESSENPLAN.md (T1 De urenwijzer, T2 Hele uren zetten, T3 Halve uren,
 * T4 Kwart over, T5 5 minuten later) gebruiken de sterrenklok, een hologram
 * in Phaser (`../vlakken/klok-holo-sterrenklok.tsx`). Daarbij: "Weet je dit
 * al?" met een korte proef (Ja) of één uitlegzin (Weet ik niet), minstens 15
 * opgaven, een lichtgolf bij goed, Bliepo wijst de knoppen aan, en een vraag
 * die bij "weet ik niet" of 2× fout niet lukte komt later in de les terug.
 * De andere klokkenlessen houden de oude wijzerklok.
 *
 * Nederlandse tijdtaal, niet vertaald uit het Engels:
 * - "3 uur" (Engels: three o'clock);
 * - "half 4" = 3:30. In het Engels heet dat "half past three": daar noem je
 *   het uur dat voorbij is, wij noemen het uur dat eraan komt. Synthesis laat
 *   het kind kijken naar het getal dat de urenwijzer al voorbij is; wij laten
 *   het kind dáárna kijken waar de urenwijzer naartoe onderweg is. "Half 6"
 *   is: halverwege op weg naar 6 uur. Zie ook vragen-voor-later.
 * - "kwart over 3" (gelijk aan het Engels "quarter past three").
 *
 * Getallen in de zinnen staan niet tussen accolades: dan zouden ze de kleur
 * van een getaltegel krijgen (de 3 geel, de 7 blauw), en dat heeft hier niets
 * met de klok te maken.
 */

import type { ReactNode } from "react";
import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import { draaiduur, MINUUTKLEUR, UURKLEUR, Wijzerklok } from "../vlakken/klok-wijzerklok";
/* Sinds 28 oktober 2026 de Bliepo-klok (eigen voorwerpenstijl, voorbeeld voor de eigenaar); de sterrenklok blijft staan. */
import { knoppenOpPlek } from "./antwoordknoppen";
import { BliepoKlok, type BliepoKlokProps as SterrenklokProps } from "../vlakken/klok-bliepo-klok";
import { Wekker, type WekkerProps } from "../vlakken/klok-wekker";
import { Wekkerrace, type WekkerraceProps } from "../vlakken/klok-wekkerrace";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- tijd ---------- */

/** Minuten vanaf 12 uur: u(3, 30) = half 4. */
const u = (uur: number, minuut = 0) => uur * 60 + minuut;
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** Het uur dat de klok aanwijst, van 1 tot en met 12 (half 4 → 3). */
const uurVan = (t: number) => Math.floor(mod(t, 720) / 60) || 12;
const volgend = (uur: number) => (uur % 12) + 1;
const vorig = (uur: number) => ((uur + 10) % 12) + 1;
const zelfde = (a: number, b: number) => mod(a, 720) === mod(b, 720);

/* ---------- de klok in beeld ---------- */

/** Welke klok er in een les staat (voor de lichtgolf bij een goed antwoord en de vragen voor later). */
const klokVan = new WeakMap<Lesgids, Klok>();

class Klok {
  nu: number;
  private golven = 0;
  /** Vragen die later in de les terugkomen (na "weet ik niet" of 2× fout). */
  later: (() => Promise<unknown>)[] = [];
  /** Wat Bliepo al eens heeft aangewezen in deze les. */
  gewezen = new Set<string>();
  /**
   * `holo`: de sterrenklok in Phaser (de groep 3-lessen van de Phaser-ronde);
   * anders de oude wijzerklok.
   */
  constructor(
    private l: Lesgids,
    tijd: number,
    extra: Partial<SterrenklokProps> = {},
    readonly holo = false,
  ) {
    this.nu = tijd;
    klokVan.set(l, this);
    l.vlak<SterrenklokProps>(holo ? BliepoKlok : Wijzerklok, { stand: { tijd }, ...extra });
  }
  pas(p: Partial<SterrenklokProps>) {
    this.l.pasVlakAan<SterrenklokProps>(p);
  }
  /**
   * Goed antwoord: een rustige lichtgolf over de klok, en (zoals Synthesis,
   * 28 oktober 2026) een eigen goed-geluidje direct na het beurtgeluid. Fout
   * heeft geen eigen geluid. LEGAL REVIEW REQUIRED: het moment komt van Synthesis.
   */
  goed() {
    if (!this.holo) return;
    this.pas({ goed: ++this.golven });
    setTimeout(() => speelLesgeluid("goed"), 350);
  }
  /** Meteen naar deze tijd (elke wijzer de kortste weg). Een gekleurd getal van de vorige opgave wordt weer gewoon. */
  zet(tijd: number) {
    this.nu = tijd;
    this.pas({ stand: { tijd }, ...(this.holo ? { getalKleur: null } : {}) });
  }
  /** Rustig meedraaien, zoals een echte klok; klaar als de wijzers stilstaan. */
  async draai(tijd: number, houdKleur = false) {
    const verschil = tijd - this.nu;
    this.nu = tijd;
    /* `houdKleur` (Synthesis, Hour Hand Hunt): het gekleurde getal van de vorige klok blijft staan tot de volgende tip. */
    this.pas({ stand: { tijd, draai: true }, ...(this.holo && !houdKleur ? { getalKleur: null } : {}) });
    await this.l.wacht(draaiduur(verschil) + 250);
  }
  /** Iets verschijnt op de klok (wijzers, vlaggetje, Sam, een nieuwe tijd): een kort plopje, zoals Synthesis. */
  plop() {
    if (this.holo) speelLesgeluid("plop");
  }
  private rondjes = 0;
  /** Na een begeleide stap: de minutenwijzer draait één keer rond (Synthesis), de tijd blijft gelijk. */
  rondje() {
    this.pas({ rondje: ++this.rondjes });
  }
  /** Het vlaggetje en de boog van de huidige opgave (5 minuten later), om na het samen tellen terug te zetten. */
  vlagNu: number | null = null;
  boogNu: number | false = false;
  /** Hoeveel lof er al gegeven is (steeds een ander woord). */
  lofN = 0;
  /** Synthesis (Hour Hand Hunt): een net gekleurd getal blijft één klok langer staan; daarna gaat het weg. */
  kleurVers = false;
  snelN = 0;
}

/* ---------- gedrag van Synthesis (28 oktober 2026, nabouw; LEGAL REVIEW REQUIRED voor de overgenomen momenten) ---------- */

/** Korte lof na een goed antwoord, steeds een andere (Synthesis: Right, That's right, Exactly right, Spot on, Correct, Nice). */
const LOF = ["Klopt.", "Dat klopt.", "Precies goed.", "Helemaal goed.", "Goed zo.", "Mooi."];
function lof(l: Lesgids): string {
  const k = klokVan.get(l);
  const n = k ? k.lofN++ : 0;
  return LOF[n % LOF.length];
}

/** Snel goed geantwoord (binnen 3 seconden): Synthesis zegt dat erbij, soms met de naam. */
const SNEL_MS = 3000;
function snelZin(l: Lesgids): string {
  const k = klokVan.get(l);
  const n = k ? k.snelN++ : 0;
  const zinnen = [l.naam ? `Dat ging snel, ${l.naam}.` : "Dat ging snel.", "Dat was snel.", "Wat snel!"];
  return zinnen[n % zinnen.length];
}

/** Synthesis: een tip, dan wacht Bliepo op de pijl, dan komt de vraag opnieuw. */
async function tipDan(l: Lesgids, tip: string[], vraagZinnen: string[], naPijl?: () => void) {
  await l.zeg(...tip);
  await verder(l);
  /* Synthesis: wat na de pijl in beeld komt (een ring om het goede getal) staat er al tijdens de vraagzin. */
  naPijl?.();
  if (vraagZinnen.length) await l.zeg(...vraagZinnen);
}

/**
 * Synthesis: doet het kind een tijdje niets (±8 s, bij de urenwijzer ±3,5 s),
 * dan zegt Bliepo vanzelf een aanwijzing, één keer. Geeft een functie die de
 * aanwijzing afzegt (als het kind iets doet).
 */
function hintNa(l: Lesgids, ms: number, zinnen: string[]): () => void {
  let weg = false;
  const t = setTimeout(() => {
    if (!weg) l.zeg(...zinnen).catch(() => {});
  }, ms);
  return () => {
    weg = true;
    clearTimeout(t);
  };
}

/**
 * Eerst de testhaak zetten (wat de klokles nu vraagt), dan wachten op de klok
 * of een knop. Zo weten de speel- en rekencontrole wat er moet, ook als Bliepo
 * de opdracht daarna nog uitspreekt.
 */
function wachtKlok(l: Lesgids, soorten: string | string[], taak: Record<string, unknown>, nieuw: boolean): Promise<Klokmelding> {
  haak(taak, nieuw);
  return straks(l.wachtOpVlak<Klokmelding>(soorten));
}

type Klokmelding = Vlakgebeurtenis & { tijd: number };

/** De eerste keer in de les wijst Bliepo een knop aan en zegt wat hij doet (groep 3 leest nog niet). */
async function wijsEenKeer(l: Lesgids, knop: string, ...zinnen: string[]) {
  const k = klokVan.get(l);
  if (!k?.holo || k.gewezen.has(knop)) return;
  k.gewezen.add(knop);
  await l.wijsAan(knop, ...zinnen);
}

/**
 * Een belofte die pas later afgewacht wordt: stopt de les intussen (bijvoorbeeld
 * opnieuw beginnen), dan is dat geen onafgehandelde fout.
 */
function straks<T>(p: Promise<T>): Promise<T> {
  p.catch(() => {});
  return p;
}

/** De blauwe pijl; de eerste keer wijst Bliepo hem aan. */
async function verder(l: Lesgids) {
  const p = straks(l.verder());
  await wijsEenKeer(l, "verder", "Klaar met kijken?", "Tik dan op de pijl.");
  await p;
}

/**
 * Voor de automatische test (zoals `window.__phaser.antwoord` bij de
 * flitsen): wat het kind nu moet doen en wat goed is. Verandert niets aan de
 * les. `nieuw`: een nieuwe vraag (geen tweede poging).
 */
let haakN = 0;
let vraagN = 0;
function haak(info: Record<string, unknown> | null, nieuw = false) {
  if (typeof window === "undefined") return;
  if (nieuw) vraagN++;
  window.__phaser = { ...window.__phaser, klokTaak: info ? { ...info, n: ++haakN, v: vraagN } : null };
}

/** De vijf Synthesis-lessen (T1 t/m T5): elke keuze is direct (een tik = het antwoord), "Weet ik niet" is een gewone keuzeknop. */
const direct = new WeakSet<Lesgids>();

/**
 * Een keuze; de eerste keer wijst Bliepo het vraagteken aan. In de Synthesis-lessen
 * staat "Weet ik niet" alleen waar Synthesis hem ook heeft: `weetniet: false` laat
 * hem weg (een kind dat het niet weet krijgt dan hulp via 1× en 2× fout).
 */
async function kies(l: Lesgids, opties: string[], goed: string | null = null, poging = 1, o: { weetniet?: boolean } = {}) {
  haak({ soort: "kies", opties, goed, poging }, poging === 1);
  const begonnen = Date.now();
  const metKnop = o.weetniet !== false;
  const p = straks(direct.has(l) ? l.kies(opties, metKnop ? { direct: true, weetniet: "Weet ik niet" } : { direct: true, weetniet: false }) : l.kies(opties));
  if (metKnop || !direct.has(l)) await wijsEenKeer(l, "weetniet", "Weet je het niet?", direct.has(l) ? "Tik dan op de knop: Weet ik niet." : "Tik dan op het vraagteken.");
  const uit = await p;
  haak(null);
  laatsteKeuzeMs = Date.now() - begonnen;
  return uit;
}
/** Hoe lang het kind over de laatste keuze deed (voor "Dat ging snel"). */
let laatsteKeuzeMs = 99999;

/** De vragen die terugkomen ("weet ik niet" of 2× fout), nog één keer. */
/* Blijft staan (regel 1); sinds de nabouw van 28 oktober 2026 niet meer gebruikt in de vijf lessen. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function terugkomen(l: Lesgids, k: Klok) {
  const lijst = k.later.splice(0);
  if (!lijst.length) return;
  await l.zeg(lijst.length === 1 ? "Er is nog één vraag van net." : "Er zijn nog een paar vragen van net.", "Probeer het nog een keer.");
  await verder(l);
  for (const vraag of lijst) await vraag();
}

/* ---------- vragen ---------- */

type Vraag = {
  /** Wat er in beeld komt als het antwoord bekend is (goed, of na de uitleg). */
  toon?: () => void;
  goedZin?: string[];
  /** Na goed nog even op de pijl wachten, zodat het kind kan kijken. */
  verder?: boolean;
  /**
   * Bij een fout of "weet ik niet" (`null`): de uitleg. Geeft de keuzes voor
   * een tweede poging, of `null` om meteen het antwoord te geven.
   */
  fout: (keuze: string | null) => Promise<string[] | null>;
  /** Het antwoord met de reden, als het ook de tweede keer niet lukt. */
  antwoord: string[];
  /** De vraag nog eens, later in de les (na "weet ik niet" of 2× fout). */
  later?: () => Promise<unknown>;
  /** Synthesis-lessen: `false` = geen "Weet ik niet"-knop bij de eerste keuze (Synthesis heeft hem daar niet). */
  weetniet?: boolean;
  /** Idem bij de tweede poging; standaard geen knop (Synthesis heeft hem daar alleen waar de analyse het zegt). */
  weetnietTweede?: boolean;
  /*
    Gedrag van Synthesis (alleen in de vijf nagebouwde lessen, 28 oktober 2026):
  */
  /** Het goede getal op de klok: bij 2× fout een ring erom, daarna krijgt het de donkere kleur van zijn wijzer. */
  ring?: number;
  /** De ring hoort bij deze wijzer (kleur); standaard de urenwijzer. */
  ringWijzer?: "uur" | "minuut";
  /** De ring staat er al bij de tweede poging (na de tip). */
  ringTweede?: boolean;
  /** Extra beeld bij 2× fout (bijvoorbeeld het pulserende boogje). */
  bijFout2?: () => void;
  /** Bij 2× fout eerst samen iets doen (Synthesis: "We tellen het op de klok."), daarna het antwoord. */
  samenBijFout2?: () => Promise<void>;
  /** Iets wat pas na een tijdje in beeld komt terwijl het kind nadenkt (het driehoekje, ±4 s). */
  naVraag?: { ms: number; doe: () => void };
  /** Snel goed (binnen 3 s): Bliepo zegt dat erbij. */
  snel?: boolean;
};

/** Een keuzevraag. Geeft terug of het meteen goed was. */
async function vraag(l: Lesgids, opties: string[], goed: string, v: Vraag): Promise<boolean> {
  const synth = direct.has(l);
  const kl = klokVan.get(l);
  const uitstel = synth && v.naVraag ? setTimeout(v.naVraag.doe, v.naVraag.ms) : undefined;
  const keuze = await kies(l, opties, goed, 1, { weetniet: v.weetniet });
  clearTimeout(uitstel);
  if (keuze === goed) {
    kl?.goed();
    v.toon?.();
    const zin = [...(v.goedZin ?? [])];
    if (synth && v.snel && laatsteKeuzeMs < SNEL_MS) zin.push(snelZin(l));
    if (zin.length) await l.zeg(...zin);
    if (v.verder) await verder(l);
    return true;
  }
  const tweede = await v.fout(keuze);
  if (tweede) {
    if (synth && v.ring != null && v.ringTweede) kl?.pas({ ring: v.ring, ringWijzer: v.ringWijzer ?? "uur", ringPuls: false });
    const opnieuw = await kies(l, tweede, goed, 2, { weetniet: v.weetnietTweede ?? false });
    if (opnieuw === goed) {
      kl?.goed();
      /* Synthesis: goed na de tip = de ring gaat weg en het getal krijgt de donkere kleur van zijn wijzer. */
      if (synth && v.ring != null) {
        kl?.pas({ ring: null, getalKleur: { n: v.ring, wijzer: v.ringWijzer ?? "uur" } });
        if (kl) kl.kleurVers = true;
      }
      v.toon?.();
      await l.zeg(...(v.goedZin ?? ["Ja."]));
      if (v.verder) await verder(l);
      return false;
    }
  }
  if (synth) {
    /*
      Synthesis bij 2× fout: het antwoord met de reden, een ring om het goede
      getal dat daarna de kleur van zijn wijzer krijgt, en de les gaat vanzelf
      door (geen pijl, geen "komt straks terug").
    */
    if (v.ring != null) kl?.pas({ ring: v.ring, ringWijzer: v.ringWijzer ?? "uur", ringPuls: false });
    v.bijFout2?.();
    if (v.samenBijFout2) await v.samenBijFout2();
    v.toon?.();
    if (v.antwoord.length) await l.zeg(...v.antwoord);
    if (v.ring != null) {
      kl?.pas({ ring: null, getalKleur: { n: v.ring, wijzer: v.ringWijzer ?? "uur" } });
      if (kl) kl.kleurVers = true;
    }
    await l.wacht(500);
    return false;
  }
  v.toon?.();
  await l.zeg(...v.antwoord);
  const k = klokVan.get(l);
  if (v.later && k) {
    k.later.push(v.later);
    await l.zeg("Deze vraag komt straks nog een keer terug.");
  }
  await verder(l);
  return false;
}

/** De opties zonder de foute keuze, in dezelfde volgorde. */
const zonder = (opties: string[], weg: string | null) => opties.filter((o) => o !== weg);

/** Bij "weet ik niet" alleen "Geen zorgen", daarna meteen het antwoord. */
async function geenZorgen(l: Lesgids, keuze: string | null): Promise<null> {
  if (keuze === null) await l.zeg("Geen zorgen.");
  return null;
}

async function weetJeHet(l: Lesgids, ...zinnen: string[]) {
  await l.zeg(...zinnen, "Denk je dat je dit al weet?");
  const k = await kies(l, ["Ja", "Nee"]);
  if (k === "Ja") await l.zeg("Mooi.", "We lopen het toch even samen door.");
  else await l.zeg("Geen probleem.", "We doen het samen.");
}

/**
 * Het begin van een Phaser-les (LESSENPLAN.md § 1d): "Weet je dit al?".
 * Ja = een korte proef zonder uitleg; gaat die helemaal goed, dan mag de
 * opbouw over ("kan"). Nee = de hele opbouw ("leer"). Weet ik niet = één
 * uitlegzin en dan meteen oefenen ("kort").
 */
async function begin(l: Lesgids, zinnen: string[], o: { uitleg: string[]; proef: () => Promise<boolean> }): Promise<"kan" | "leer" | "kort"> {
  await l.zeg(...zinnen, "Denk je dat je dit al weet?");
  const k = await kies(l, ["Ja", "Nee"]);
  /* Synthesis-lessen: "Weet ik niet" geeft net als Nee de hele les ("No problem. Let's go through it together."). */
  if (k === "Nee" || (k === null && direct.has(l))) {
    await l.zeg("Geen probleem.", "We doen het samen.");
    return "leer";
  }
  if (k === null) {
    await l.zeg("Geen zorgen.", ...o.uitleg);
    await verder(l);
    return "kort";
  }
  await l.zeg("Mooi.", "Laat maar eens zien.");
  if (await o.proef()) {
    /* "Dan slaan we het begin over." klopt in elke les (de opbouw valt weg); "meteen oefenen" klopte niet bij de urenwijzer (29 oktober 2026). */
    await l.zeg("Knap, dat kun je al!", "Dan slaan we het begin over.");
    await verder(l);
    return "kan";
  }
  await l.zeg("Geen probleem.", "We leren het samen.");
  await verder(l);
  return "leer";
}

/** Een proefvraag aan het begin: geen uitleg, geen tweede kans. */
async function proefvraag(l: Lesgids, opties: string[], goed: string, weetniet = true): Promise<boolean> {
  const keuze = await kies(l, opties, goed, 1, { weetniet });
  if (keuze === goed) {
    klokVan.get(l)?.goed();
    await l.zeg("Ja.");
    return true;
  }
  return false;
}

/** Een vraag uit het toetsdeel: kort, bij een fout meteen het antwoord. */
/* Blijft staan (regel 1); sinds de nabouw van 28 oktober 2026 niet meer gebruikt in de vijf lessen. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function toetsvraag(l: Lesgids, opties: string[], goed: string, goedZin: string, uitleg: () => Promise<void>, weetniet = true): Promise<boolean> {
  const keuze = await kies(l, opties, goed, 1, { weetniet });
  if (keuze === goed) {
    klokVan.get(l)?.goed();
    await l.zeg(goedZin);
    return true;
  }
  await uitleg();
  await verder(l);
  return false;
}

async function kaartEinde(l: Lesgids, fouten: number, slot: string) {
  const tik = l.kaart();
  await l.zeg(
    fouten === 0
      ? l.naam
        ? `Alles goed, ${l.naam}!`
        : "Alles goed!"
      : l.naam
        ? `Goed gewerkt, ${l.naam}!`
        : "Goed gewerkt!",
    fouten === 0 ? slot : fouten === 1 ? "Je miste er maar één." : "Je hebt goed geoefend.",
    fouten === 1 ? "Dat was vast pech." : "",
    fouten > 0 ? "Volgende keer lukt het helemaal." : "",
    "Tik op de kaart om hem af te vinken.",
  );
  await tik;
}

/* ---------- zelf de klok zetten ---------- */

/*
  Zelf de klok zetten, zoals Synthesis (28 oktober 2026, GEDRAG-T1 t/m T5;
  LEGAL REVIEW REQUIRED voor de overgenomen momenten): de opdracht staat als
  kop boven de klok en Bliepo zegt hem; het handje (hulp) en soms het vinkje
  staan op de vaste plek. Doet het kind een tijdje niets, dan komt vanzelf een
  aanwijzing. Een tik op een verkeerd getal zet de wijzer daar, zonder reactie.
*/

/** De eerste keer wijst Bliepo het handje en het vinkje aan (groep 3 leest nog niet). */
async function wijsHandje(l: Lesgids, vinkje: boolean) {
  await wijsEenKeer(l, "hulp", "Hulp nodig?", "Tik dan op het handje.");
  if (vinkje) await wijsEenKeer(l, "klokcontrole", "Klaar?", "Tik dan op het vinkje.");
}

/**
 * "Ga naar de 2" (Synthesis, Hour Hand Hunt): een kop met de opdracht en een
 * ring om het getal. Tikt het kind een ander getal, dan gaat de wijzer daarheen
 * en gebeurt er verder niets. Na ±3,5 s niets doen komt de aanwijzing. Op het
 * doel: de wijzers draaien (de minutenwijzer een rondje) en het getal krijgt
 * de kleur van de urenwijzer. `hulpknop`: het handje staat erbij (stap voor
 * stap na het handje, Halfway Around); dan zegt het handje de aanwijzing nog eens.
 */
async function gaNaar(l: Lesgids, k: Klok, n: number, o: { kop?: string; hintMs?: number; hint?: string[]; hulpknop?: boolean } = {}) {
  const kop = o.kop ?? `Ga naar de ${n}.`;
  const hint = o.hint ?? [`Tik op de ${n}, of sleep de [[u:oranje urenwijzer]] erheen.`];
  const soorten = o.hulpknop ? ["gezet", "hulp"] : ["gezet"];
  k.pas({ doel: kop, ring: n, ringWijzer: "uur", ringPuls: false, pil: "uur", alleenGetal: null, beweegbaar: "uur", actief: false, hulpknop: !!o.hulpknop });
  const taak = (poging: number) => ({ soort: "uur", doel: n, poging });
  await l.zeg(kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, soorten, taak(1), true);
  if (o.hulpknop) await wijsHandje(l, false);
  for (let poging = 1; ; poging++) {
    const stop = hintNa(l, o.hintMs ?? 3500, hint);
    const g = await (klaar ?? wachtKlok(l, soorten, taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    if (g.soort === "hulp") {
      klaar = wachtKlok(l, soorten, taak(poging + 1), false);
      await l.zeg(...hint);
      continue;
    }
    k.nu = g.tijd;
    if (zelfde(g.tijd, u(n))) break;
  }
  speelLesgeluid("wijzerKlik");
  k.rondje();
  k.pas({ ring: null, getalKleur: { n, wijzer: "uur" }, doel: null, beweegbaar: null, actief: false, pil: null, hulpknop: false });
}

/**
 * De minutenwijzer naar `doel` (Synthesis: "Tik op het volgende getal",
 * "Draai de minutenwijzer één keer rond", "Minutenwijzer naar de 6"). Alleen
 * het handje erbij; er wordt meteen nagekeken. Met `klem` doet een getal
 * voorbij het doel niets (geen geluid, geen tekst); een getal ervoor (bij 10
 * minuten: eerst één getal) zet de wijzer daar en de opdracht loopt door. Het
 * handje zegt de aanwijzing nog eens. Geeft terug of het zonder handje lukte.
 */
async function minuutNaar(
  l: Lesgids,
  k: Klok,
  doel: number,
  o: { kop: string; hint: string[]; hintMs?: number; ring?: number | null; klem?: boolean; inkleur?: boolean; hintMeteen?: boolean; kijkUur?: boolean; boog?: "nu" | "naTik" | "eigen" },
): Promise<boolean> {
  const start = k.nu;
  const klem = o.klem ?? true;
  /* De boog van de opgave: meteen ("nu", standaard), pas na de tik ("naTik", Synthesis bij de eerste opdracht) of niet ("eigen": samen tellen heeft al een eigen boog vanaf de tijd van nu). */
  if ((o.boog ?? "nu") === "nu") toonBoog(k);
  k.pas({
    doel: o.kop,
    actief: false,
    beweegbaar: "minuut",
    grens: { van: start, tot: doel },
    klem,
    /* `kijkUur` (Synthesis, vooruitkijken): de pil om de urenwijzer en de minutenwijzer vaag, zodat het kind naar de urenwijzer kijkt. */
    pil: o.kijkUur ? "uur" : "minuut",
    ...(o.kijkUur ? { minuutwijzer: "flets" as const } : {}),
    ring: o.ring ?? null,
    ringWijzer: "minuut",
    ringPuls: false,
    alleenGetal: null,
    hulpknop: true,
    ...(o.inkleur ? { inkleur: true } : {}),
  });
  let handje = false;
  const taak = (poging: number) => ({ soort: "minuut", doel, poging, klem });
  await l.zeg(o.kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, ["gezet", "hulp"], taak(1), true);
  /* Synthesis (vooruitkijken): de aanwijzing komt meteen na de kop. */
  if (o.hintMeteen) await l.zeg(...o.hint);
  await wijsHandje(l, false);
  for (let poging = 1; ; poging++) {
    const stop = hintNa(l, o.hintMs ?? 8000, o.hint);
    const g = await (klaar ?? wachtKlok(l, ["gezet", "hulp"], taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    if (g.soort === "hulp") {
      handje = true;
      klaar = wachtKlok(l, ["gezet", "hulp"], taak(poging + 1), false);
      await l.zeg(...o.hint);
      continue;
    }
    /* Alleen via de testhaak kan de wijzer voorbij het doel komen: dan stil terug. */
    if (g.tijd > doel || g.tijd < start) {
      /* Terug zonder het gekleurde getal weg te halen. */
      k.pas({ stand: { tijd: k.nu } });
      continue;
    }
    k.nu = g.tijd;
    if (g.tijd === doel) break;
  }
  /* De klok in beeld staat zeker op het doel (een onderbroken animatie kon hem ertussen laten staan; het gekleurde getal blijft). */
  k.pas({ stand: { tijd: doel } });
  speelLesgeluid("wijzerKlik");
  if (o.boog === "naTik") toonBoog(k);
  k.pas({ actief: false, beweegbaar: null, grens: null, klem: false, pil: null, ring: null, doel: null, hulpknop: false, ...(o.kijkUur ? { minuutwijzer: "fel" as const } : {}) });
  return !handje;
}

/** De minutenwijzer zelf laten draaien tot `doel` (een rondje, een half rondje): kop, alleen het handje, meteen nagekeken. */
async function draaiMinuut(l: Lesgids, k: Klok, doel: number, hint: string[], kop = "Draai de minutenwijzer.", hintMeteen = false) {
  /* Met de aanwijzing meteen = vooruitkijken: dan ook de pil om de urenwijzer (Synthesis). */
  await minuutNaar(l, k, doel, { kop, hint, klem: false, hintMeteen, kijkUur: hintMeteen });
}

/** De eerste keer dat het vraagteken en het vinkje onder de klok staan, wijst Bliepo ze aan. */
async function wijsKlokknoppen(l: Lesgids) {
  await wijsEenKeer(l, "klokhulp", "Weet je het niet?", "Tik dan op het vraagteken.");
  await wijsEenKeer(l, "klokcontrole", "Klaar?", "Tik dan op het vinkje.");
}

type Zetten = {
  modus: "uur" | "beide" | "minuut";
  /** De tijd groot bovenaan ("half 9"). */
  doel?: string;
  /** Wat het handje zegt, en welk getal dan een ringetje krijgt. */
  hulp: string[];
  hulpring: number;
  /** De uitleg bij een verkeerde stand (de klok staat op `t`). */
  fout: (t: number) => Promise<void>;
  /** Na twee keer zet Bliepo het zelf goed en zegt dit (ALGEMENE HULPREGELS: 2× fout = voordoen). */
  uitleg: string[];
  /** Het handje (en 2× fout): Bliepo zet de klok samen met het kind, stap voor stap. */
  stappen?: () => Promise<void>;
};

/** Het kind zet de klok en tikt op het vinkje. Geeft terug of het meteen en zonder hulp lukte. */
async function laatZien(l: Lesgids, k: Klok, doel: number, z: Zetten): Promise<boolean> {
  k.pas({ actief: true, beweegbaar: z.modus, controle: true, doel: z.doel ?? null });
  let zonderHulp = true;
  for (let fouten = 0, poging = 1; ; poging++) {
    haak({ soort: "tijd", doel, poging, controle: true }, poging === 1);
    const wacht = straks(l.wachtOpVlak<Klokmelding>(["controle", "hulp"]));
    await wijsKlokknoppen(l);
    const g = await wacht;
    haak(null);
    k.nu = g.tijd;
    k.pas({ actief: false, pijl: null, pil: null });
    if (g.soort === "hulp" && z.stappen) {
      zonderHulp = false;
      k.pas({ controle: false });
      await l.zeg("Ik help je.");
      await z.stappen();
      break;
    }
    if (g.soort === "hulp") {
      zonderHulp = false;
      k.pas({ ring: z.hulpring });
      await l.zeg(...z.hulp);
      k.pas({ actief: true });
      continue;
    }
    if (zelfde(g.tijd, doel)) {
      k.goed();
      break;
    }
    zonderHulp = false;
    fouten++;
    if (fouten >= 2 && z.stappen) {
      k.pas({ ring: null, controle: false });
      await l.zeg("Laten we hem samen zetten.");
      await z.stappen();
      break;
    }
    if (fouten >= 2) {
      k.pas({ ring: null });
      await l.zeg("Kijk, zo.");
      k.zet(doel);
      await l.wacht(700);
      await l.zeg(...z.uitleg);
      await verder(l);
      break;
    }
    await z.fout(g.tijd);
    k.pas({ actief: true });
  }
  k.pas({ actief: false, beweegbaar: null, controle: false, ring: null, pijl: null, pil: null, doel: null });
  return zonderHulp;
}

/**
 * Een heel uur zetten met alleen de urenwijzer, zoals Synthesis (Set the Hour,
 * GEDRAG-T2): de kop "Laat 5 uur zien.", het handje en het vinkje. Er wordt
 * pas nagekeken bij het vinkje; een tik op een getal zet de wijzer daar.
 * Na ±8 s niets doen komt de aanwijzing. `start`: de urenwijzer begint op
 * een ander uur (de wijzers draaien er eerst heen).
 * - 1× fout: een blauwe pijl met de klok mee, "Dat is de 4. We willen de 5,
 *   dus draai verder." en wachten op de pijl; dan dezelfde opdracht (de pijl blijft).
 * - 2× fout of het handje ("Geen probleem."): een ring om het goede getal, het
 *   vinkje weg, alleen dat getal tikken; dan draait de minutenwijzer een rondje
 *   en het getal krijgt de kleur van de urenwijzer.
 * Geeft terug of het meteen en zonder hulp lukte; `hulp` zegt of het handje of
 * 2× fout de begeleide stap gaf, `handje` of dat het handje was.
 */
async function zetUur(l: Lesgids, k: Klok, uur: number, start: number | null = null): Promise<boolean> {
  if (!k.holo) return heelUur(l, k, uur);
  if (start !== null && !zelfde(k.nu, u(start))) {
    k.zet(u(start));
    await l.wacht(700);
  }
  const kop = `Laat ${uur} uur zien.`;
  const hint = [`Tik op de ${uur}, of sleep de [[u:oranje urenwijzer]] erheen.`];
  const open = () => k.pas({ doel: kop, actief: false, beweegbaar: "uur", controle: true, hulpknop: true, pil: "uur" });
  open();
  const taak = (poging: number) => ({ soort: "uur", doel: uur, poging, controle: true });
  await l.zeg(kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, ["controle", "hulp"], taak(1), true);
  await wijsHandje(l, true);
  let fouten = 0;
  let hulp = false;
  let handje = false;
  for (let poging = 1; ; poging++) {
    const voor = k.nu;
    const stop = hintNa(l, 8000, hint);
    const g = await (klaar ?? wachtKlok(l, ["controle", "hulp"], taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    k.nu = g.tijd;
    if (g.soort === "controle" && zelfde(g.tijd, u(uur))) break;
    k.pas({ doel: null, actief: false, controle: false, hulpknop: false });
    if (g.soort === "hulp") {
      hulp = handje = true;
      break;
    }
    fouten++;
    if (fouten >= 2) {
      hulp = true;
      break;
    }
    /* De blauwe pijl wijst altijd met de klok mee, vanaf het getal waar de wijzer nu staat. */
    const nu = uurVan(g.tijd);
    k.pas({ pijl: { van: nu, naar: volgend(nu) } });
    if (zelfde(g.tijd, voor)) await tipDan(l, [`De wijzer staat op de ${nu}.`, `Hij moet naar de ${uur}.`], []);
    else await tipDan(l, [`Dat is de ${nu}.`, `We willen de ${uur}, dus draai verder.`], []);
    open();
    await l.zeg(kop);
    k.pas({ actief: true });
    klaar = wachtKlok(l, ["controle", "hulp"], taak(poging + 1), false);
  }
  if (hulp) {
    /* Synthesis: na het handje pulseert de ring licht; na 2× fout staat hij stil. */
    k.pas({ pijl: null, ring: uur, ringWijzer: "uur", ringPuls: handje, alleenGetal: uur, beweegbaar: "uur", pil: "uur" });
    if (handje) await l.zeg("Geen probleem.");
    const begeleid = { soort: "uur", doel: uur, poging: 99, alleen: true };
    await l.zeg(`Tik op de ${uur}, of sleep de [[u:urenwijzer]] erheen.`);
    k.pas({ actief: true });
    let tik: Promise<Klokmelding> | null = wachtKlok(l, "gezet", begeleid, false);
    for (;;) {
      const g = await (tik ?? wachtKlok(l, "gezet", begeleid, false));
      tik = null;
      haak(null);
      k.nu = g.tijd;
      if (zelfde(g.tijd, u(uur))) break;
    }
    speelLesgeluid("wijzerKlik");
  }
  k.goed();
  if (hulp) {
    k.rondje();
    k.pas({ getalKleur: { n: uur, wijzer: "uur" } });
  }
  /* Synthesis (Set the Hour): de pil om de urenwijzer blijft staan na goed, tot de volgende vraag. */
  k.pas({ actief: false, beweegbaar: null, controle: false, hulpknop: false, ring: null, ringPuls: false, alleenGetal: null, pijl: null, pil: "uur", doel: null });
  zetUurUitslag = { hulp, handje };
  return !hulp && fouten === 0;
}
/** Hoe de laatste `zetUur` ging (voor de goede zin erna: "Daar is hij." of "Gelukt."). */
let zetUurUitslag = { hulp: false, handje: false };

/** Een heel uur zetten met alleen de urenwijzer (Set the Hour). */
function heelUur(l: Lesgids, k: Klok, uur: number): Promise<boolean> {
  return laatZien(l, k, u(uur), {
    modus: "uur",
    hulp: [`Tik op de ${uur}.`, "Of sleep de oranje urenwijzer erheen."],
    hulpring: uur,
    fout: async (t) => {
      const nu = uurVan(t);
      const vooruit = mod(uur - nu, 12) <= 6;
      k.pas({ pijl: { van: nu, naar: vooruit ? volgend(nu) : vorig(nu) } });
      await l.zeg(`Dat is de ${nu}.`, `Je zoekt de ${uur}.`, vooruit ? "Draai dus verder." : "Draai dus een stukje terug.");
    },
    uitleg: [`De urenwijzer wijst naar de ${uur}.`, `Het is ${uur} uur.`],
  });
}

/**
 * Samen zetten in stappen (Synthesis, na het handje: "Your wish is my command"):
 * eerst de kop "Urenwijzer naar de 8." met een ring, dan "Minutenwijzer naar de 6."
 * met een ring in de kleur van de minutenwijzer. Alleen het handje erbij.
 */
async function zetInStappen(l: Lesgids, k: Klok, doel: number) {
  const half = mod(doel, 60) === 30;
  const uur = uurVan(doel);
  const m = half ? 6 : 3;
  k.pas({ gekozen: null });
  await gaNaar(l, k, uur, { kop: `Urenwijzer naar de ${uur}.`, hintMs: 8000, hint: [`Tik op de ${uur}, of sleep de [[u:oranje urenwijzer]] erheen.`], hulpknop: true });
  await l.zeg(`Dat is ${uur} uur.`, half ? "Nu nog een half uur erbij." : "Nu nog een kwartier erbij.");
  await minuutNaar(l, k, doel, { kop: `Minutenwijzer naar de ${m}.`, hint: [`Tik op de ${m}, of sleep de [[m:minutenwijzer]] erheen.`], ring: m });
  k.goed();
  /* Synthesis: bij half wordt de 6 donkerpaars (Halfway Around); bij kwart over blijft de 8 gekleurd (Quarter Past). */
  if (half) k.pas({ getalKleur: { n: m, wijzer: "minuut" } });
  await l.zeg(half ? `Half ${volgend(uur)}.` : `Kwart over ${uur}.`, "Nu lukt het.");
}

/**
 * Half of kwart over zetten met beide wijzers, zoals Synthesis (Halfway Around,
 * Quarter Past): de klok begint op `start`, de kop "Laat half 9 zien.", het
 * handje en het vinkje; de urenwijzer is al gekozen. Een wijzer aantikken kiest
 * hem; een getal tikken zet de gekozen wijzer daar (de urenwijzer op een getal:
 * de minutenwijzer springt naar de 12; de minutenwijzer verzetten: de urenwijzer
 * schuift mee). Nagekeken bij het vinkje.
 * - Fout: uitleg in drie zinnen (wat goed is, wat niet, wat te doen), met de
 *   blauwe pijl als de urenwijzer verder moet; wachten op de pijl; opnieuw.
 * - Het handje ("Komt eraan!") of 2× fout: de klok terug naar het begin, en
 *   samen stap voor stap.
 * Geeft terug of het meteen en zonder hulp lukte.
 */
async function halfOfKwart(l: Lesgids, k: Klok, doel: number, start = u(12)): Promise<boolean> {
  const half = mod(doel, 60) === 30;
  const uur = uurVan(doel);
  const na = volgend(uur);
  const naam = half ? `half ${na}` : `kwart over ${uur}`;
  const m = half ? 6 : 3;
  const kop = `Laat ${naam} zien.`;
  if (!zelfde(k.nu, start)) {
    /* Synthesis: een getal dat bij de stappen gekleurd werd, blijft gekleurd tot het kind iets doet. */
    k.nu = start;
    k.pas({ stand: { tijd: start } });
    k.plop();
    await l.wacht(700);
  }
  /* Synthesis: de gekozen urenwijzer heeft meteen een pil (en houdt die ook als de minutenwijzer gekozen wordt). */
  const open = () => k.pas({ doel: kop, actief: false, beweegbaar: "beide", controle: true, hulpknop: true, gekozen: "uur", pil: "uur" });
  open();
  const taak = (poging: number) => ({ soort: "tijd", doel, poging, controle: true });
  await l.zeg(kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, ["controle", "hulp"], taak(1), true);
  await wijsHandje(l, true);
  let fouten = 0;
  let stappen = false;
  let handje = false;
  for (let poging = 1; ; poging++) {
    const stop = hintNa(l, 8000, ["Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet."]);
    const g = await (klaar ?? wachtKlok(l, ["controle", "hulp"], taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    k.nu = g.tijd;
    k.pas({ getalKleur: null });
    if (g.soort === "controle" && zelfde(g.tijd, doel)) break;
    k.pas({ doel: null, actief: false, controle: false, hulpknop: false, gekozen: null });
    if (g.soort === "hulp") {
      stappen = handje = true;
      break;
    }
    fouten++;
    if (fouten >= 2) {
      stappen = true;
      break;
    }
    const t = g.tijd;
    const minuutGoed = mod(t, 60) === mod(doel, 60);
    const uurNu = uurVan(t);
    if (minuutGoed) {
      k.pas({ pil: "uur", pijl: { van: uurNu, naar: volgend(uurNu) } });
      await tipDan(
        l,
        /* Synthesis: zeg waar de urenwijzer nu is, en draai hem verder ("has only passed the 6 … take it on around"). */
        [
          `De [[m:minutenwijzer]] klopt: ${half ? "een half rondje" : "een kwartrondje"}.`,
          `Maar de [[u:urenwijzer]] is pas de ${uurNu} voorbij.`,
          half ? `Draai hem verder, tot hij tussen de ${uur} en de ${na} staat.` : `Draai hem verder, tot hij net voorbij de ${uur} is.`,
        ],
        [],
      );
    } else if (uurNu === uur) {
      k.pas({ pil: "minuut" });
      await tipDan(
        l,
        [`De [[u:urenwijzer]] staat goed bij de ${uur}.`, `Maar bij ${half ? "half" : "kwart over"} staat de [[m:minutenwijzer]] op de ${m}.`, `Tik op de minutenwijzer, en dan op de ${m}.`],
        [],
      );
    } else {
      k.pas({ pil: "uur", pijl: { van: uurNu, naar: volgend(uurNu) } });
      /* Synthesis: "That's 9 o'clock. Tap the 8, or take the hour hand on around to it." (past bij de pijl met de klok mee). */
      await tipDan(l, [`Dat is ${tijdnaam(t)}.`, `We willen ${naam}.`, `Tik op de ${uur}, of draai de [[u:urenwijzer]] verder rond.`], []);
    }
    k.pas({ pil: null, pijl: null });
    open();
    await l.zeg(kop);
    k.pas({ actief: true });
    klaar = wachtKlok(l, ["controle", "hulp"], taak(poging + 1), false);
  }
  if (stappen) {
    await l.zeg(handje ? "Komt eraan!" : "Laten we hem samen zetten.");
    k.zet(start);
    await l.wacht(600);
    await zetInStappen(l, k, doel);
  } else k.goed();
  k.pas({ actief: false, beweegbaar: null, controle: false, hulpknop: false, gekozen: null, ring: null, pijl: null, pil: null, doel: null });
  return !stappen && fouten === 0;
}

/**
 * Een stuk van de klok inkleuren met de minutenwijzer, zoals Synthesis: de kop
 * "Kleur de helft in." met het handje en het vinkje. Nagekeken bij het vinkje.
 * 1× fout: een tip en wachten op de pijl, dan opnieuw. 2× fout: Bliepo zet de
 * wijzer zelf goed ("Hier is de helft."). Het handje zegt de aanwijzing nog eens.
 */
async function kleurIn(l: Lesgids, k: Klok, minuten: 30 | 15) {
  const start = k.nu;
  const kop = minuten === 30 ? "Kleur de helft in." : "Kleur een kwart in.";
  const hint = ["Tik op een getal om de [[m:minutenwijzer]] daar te zetten.", "Kijk dan naar het gekleurde stuk."];
  const open = () =>
    k.pas({ doel: kop, inkleur: true, actief: false, beweegbaar: "minuut", controle: true, hulpknop: true, pil: "minuut", grens: { van: start, tot: start + 55 } });
  open();
  const taak = (poging: number) => ({ soort: "minuut", doel: start + minuten, poging, controle: true });
  await l.zeg(kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, ["controle", "hulp"], taak(1), true);
  await wijsHandje(l, true);
  for (let fouten = 0, poging = 1; ; poging++) {
    const stop = hintNa(l, 8000, hint);
    const g = await (klaar ?? wachtKlok(l, ["controle", "hulp"], taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    k.nu = g.tijd;
    if (g.soort === "hulp") {
      klaar = wachtKlok(l, ["controle", "hulp"], taak(poging + 1), false);
      await l.zeg(...hint);
      continue;
    }
    const m = g.tijd - start;
    if (m === minuten) {
      k.goed();
      break;
    }
    k.pas({ doel: null, actief: false, controle: false, hulpknop: false });
    fouten++;
    if (fouten >= 2) {
      k.zet(start + minuten);
      speelLesgeluid("wijzerKlik");
      await l.zeg(
        ...(minuten === 30
          ? ["Hier is de helft.", "Het gekleurde stuk en het witte stuk zijn even groot."]
          : ["Hier is een kwart.", "De helft van de helft: één van vier even grote stukken."]),
      );
      break;
    }
    let tip: string[];
    if (m === 0) tip = ["Er is nog niets gekleurd."];
    else if (minuten === 30)
      tip = [
        m === 15 ? "Dat is een kwart." : m < 30 ? "Het gekleurde stuk is kleiner dan het witte stuk." : "Het gekleurde stuk is groter dan het witte stuk.",
        "De helft is als het gekleurde en het witte stuk even groot zijn.",
      ];
    else if (m === 30) tip = ["Dat is de helft.", "Een kwart is de helft van de helft."];
    else tip = [m < 15 ? "Dat is minder dan een kwart." : "Dat is meer dan een kwart.", "Een kwart is één van vier even grote stukken."];
    await tipDan(l, tip, []);
    open();
    await l.zeg(kop);
    k.pas({ actief: true });
    klaar = wachtKlok(l, ["controle", "hulp"], taak(poging + 1), false);
  }
  k.pas({ actief: false, beweegbaar: null, controle: false, hulpknop: false, grens: null, ring: null, doel: null, pil: null });
}

/* ---------- de kaarten aan het eind (lijntekeningen, 244 × 190) ---------- */

const KM = { x: 112, y: 95, r: 68 };

function Kaartklok({ children }: { children?: ReactNode }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={KM.x} cy={KM.y} r={KM.r} stroke="#e6e8ee" strokeWidth={3.2} />
      {children}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r1 = KM.r - 4;
        const r2 = KM.r - (i % 3 === 0 ? 14 : 9);
        return (
          <line
            key={i}
            x1={Math.round((KM.x + Math.sin(a) * r1) * 10) / 10}
            y1={Math.round((KM.y - Math.cos(a) * r1) * 10) / 10}
            x2={Math.round((KM.x + Math.sin(a) * r2) * 10) / 10}
            y2={Math.round((KM.y - Math.cos(a) * r2) * 10) / 10}
            stroke="#e6e8ee"
            strokeWidth={2.6}
          />
        );
      })}
      <circle cx={KM.x} cy={KM.y} r={4} stroke="#e6e8ee" strokeWidth={3} />
    </g>
  );
}

function Arcering({ id, pad, kleuren }: { id: string; pad: string; kleuren: string[] }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={pad} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={20 + i * 12} y1={190} x2={80 + i * 12} y2={0} stroke={kleuren[i % kleuren.length]} />
        ))}
      </g>
      <path d={pad} fill="none" stroke={kleuren[0]} strokeWidth={3.2} strokeLinejoin="round" />
    </>
  );
}

function KaartUrenwijzer() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x + 32} y2={KM.y - 18} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M196 52c0-12 18-14 18-2 0 9-10 10-10 20" fill="none" stroke="#ef5d8a" strokeWidth={5} strokeLinecap="round" />
      <circle cx={204} cy={84} r={3.5} fill="#ef5d8a" />
    </>
  );
}

function KaartUrenZetten() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x} y2={KM.y - 52} stroke={MINUUTKLEUR} strokeWidth={5} />
        <line x1={KM.x} y1={KM.y} x2={KM.x + 18} y2={KM.y + 31} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M30 128a88 88 0 0 1 0-66" fill="none" stroke="#3fb34f" strokeWidth={5} strokeLinecap="round" />
      <path d="M22 70l8-12 10 10" fill="none" stroke="#3fb34f" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function KaartHalf() {
  return (
    <>
      <Arcering id="klok-kaart-half" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x} ${KM.y + KM.r - 6} Z`} kleuren={["#3fb34f", "#b9e83f"]} />
      <Kaartklok />
    </>
  );
}

function KaartKwart() {
  return (
    <>
      <Arcering id="klok-kaart-kwart" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x + KM.r - 6} ${KM.y} Z`} kleuren={["#4561dc", "#8a2fb0"]} />
      <Kaartklok />
    </>
  );
}

/* =====================================================================
   Les 1 — De urenwijzer (Hour Hand Hunt)
   Gedrag naar SYNTHESIS-ANALYSE/GEDRAG-T1-de-urenwijzer.md (28 oktober 2026).
   ===================================================================== */

/**
 * "Waar wijst de urenwijzer naar?" (Synthesis stap 14 en 15). Fout 9 (de
 * achterkant): pil om de urenwijzer en een pijl bij de 9, tip, wachten op de
 * pijl; dan dezelfde vier knoppen. 2× fout: ring om het goede getal, het getal
 * kleurt, vanzelf door. Met `k`: bij "weet ik niet" of 2× fout komt hij
 * later terug (alleen in de oude lessen).
 */
function wijstNaar(l: Lesgids, opties: string[], n: number, k?: Klok): Promise<boolean> {
  const kl = k ?? klokVan.get(l);
  return vraag(l, opties, String(n), {
    weetnietTweede: true,
    ring: n,
    later: k
      ? async () => {
          k.pas({ wijzers: true, pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
          k.zet(u(n));
          await l.wacht(600);
          await l.zeg("Waar wijst de urenwijzer naar?");
          await wijstNaar(l, opties, n);
          k.pas({ pil: null, minuutwijzer: "fel" });
        }
      : undefined,
    goedZin: [lof(l)],
    fout: async (x) => {
      kl?.pas({ pil: "uur" });
      const achter = mod(n + 6 - 1, 12) + 1;
      if (x === String(achter)) {
        kl?.pas({ pijl: { van: achter, naar: volgend(achter) } });
        await tipDan(l, [`De ${achter} snap ik.`, "De wijzer lijkt op een pijl, en zijn achterkant wijst die kant op."], ["Waar wijst de [[u:urenwijzer]] dan naar?"]);
        kl?.pas({ pijl: null });
      } else await tipDan(l, [x === null ? "Een tip." : "Bijna.", "Volg de [[u:urenwijzer]] vanaf het midden tot zijn punt."], ["Waar wijst hij naar?"]);
      return opties;
    },
    antwoord: [`Het is de ${n}.`, `De [[u:urenwijzer]] begint in het midden, en zijn punt komt op de ${n}.`],
  }).finally(() => kl?.pas({ pil: "uur" }));
}

/** "Hoe laat is het?" bij een heel uur, nog een keer (een vraag die terugkomt, alleen in de oude lessen). */
async function nogEensHeel(l: Lesgids, k: Klok, uur: number, opties: string[]) {
  k.pas({ wijzers: true, pil: null, uurwijzer: "fel", minuutwijzer: "fel" });
  k.zet(u(uur));
  await l.wacht(600);
  await l.zeg("Hoe laat is het?");
  await vraag(l, opties, `${uur} uur`, {
    goedZin: [`Ja, het is ${uur} uur.`],
    fout: async (x) => {
      k.pas({ pil: "uur" });
      if (x === null) {
        await l.zeg("Geen zorgen.");
        return null;
      }
      await l.zeg("De korte wijzer laat het uur zien.", "Hoe laat is het?");
      return zonder(opties, x);
    },
    antwoord: [`De korte wijzer wijst naar de ${uur}.`, `Het is ${uur} uur.`],
  });
  k.pas({ pil: null });
}

/**
 * Een heel uur aflezen in het oefenblok (Synthesis stap 22): "9 minuten" →
 * de minutenwijzer vaag, pil om de urenwijzer, "Je vond de 9. Maar kijk bij
 * welke wijzer hij hoort." (wachten), dan een ring om de 9 en drie knoppen.
 * "Weet ik niet" → "Een tip. De urenwijzer laat het uur zien." (wachten),
 * ring, drie knoppen zonder "12 uur". 2× fout: het antwoord, vanzelf door.
 */
function toetsHeelUur(l: Lesgids, k: Klok, uur: number, opties: string[], vraagZin = "Hoe laat is het dan?"): Promise<boolean> {
  return vraag(l, opties, `${uur} uur`, {
    /* Synthesis (Hour Hand Hunt): ook bij de tweede poging staat "Weet ik niet" erbij. */
    weetnietTweede: true,
    ring: uur,
    ringTweede: true,
    snel: true,
    goedZin: [lof(l)],
    fout: async (x) => {
      /* Synthesis: hier verdwijnt het gekleurde getal van de vorige klok. */
      k.pas({ pil: "uur", minuutwijzer: "flets", getalKleur: null });
      const ringNu = () => k.pas({ ring: uur, ringWijzer: "uur", ringPuls: false });
      if (x === null) {
        await tipDan(l, ["Een tip.", "De [[u:urenwijzer]] laat het uur zien."], [vraagZin], ringNu);
        return zonder(opties, "12 uur");
      }
      if (x === "12 uur") await tipDan(l, ["De 12 is het getal van de [[m:minutenwijzer]].", "Het uur komt van de korte wijzer."], [vraagZin], ringNu);
      else await tipDan(l, [`Je vond de ${uur}.`, "Maar kijk bij welke wijzer hij hoort."], ["Welke tijd past bij de [[u:urenwijzer]]?"], ringNu);
      return zonder(opties, x);
    },
    antwoord: [`De korte wijzer wijst naar de ${uur}.`, "De lange wijzer staat recht omhoog.", `Dus het is ${uur} uur.`],
    later: () => nogEensHeel(l, k, uur, opties),
  }).finally(() => k.pas({ pil: null, minuutwijzer: "fel" }));
}

const urenwijzer: Lesdraaiboek = {
  id: "klok-urenwijzer",
  titel: "De urenwijzer",
  indeling: "synthesis",
  synthesis: "Telling Time · Hour Hand Hunt",
  kaarttekening: KaartUrenwijzer,

  async speel(l) {
    direct.add(l);
    const k = new Klok(l, u(3), {}, true);
    const start = await begin(l, ["We gaan leren hoe je het uur leest op een klok met wijzers, zoals deze."], {
      uitleg: ["De korte oranje wijzer is de urenwijzer.", "Hij wijst het uur aan."],
      proef: async () => {
        k.zet(u(5));
        await l.wacht(600);
        await l.zeg("Hoe laat is het?");
        if (!(await proefvraag(l, ["5 uur", "12 uur", "6 uur"], "5 uur"))) return false;
        k.zet(u(10));
        await l.wacht(600);
        await l.zeg("En nu?");
        return proefvraag(l, ["11 uur", "10 uur", "12 uur"], "10 uur");
      },
    });
    if (start === "leer") await urenwijzerOpbouw(l, k);
    else {
      k.zet(u(1));
      await l.wacht(600);
    }

    /* 8 t/m 16. De urenwijzer leest het uur, zetten, oefenen. */
    await urenwijzerOefenen(l, k);
  },
};

/**
 * De opbouw van "De urenwijzer" (Synthesis stap 3 t/m 13): de getallenlijn
 * die een klok wordt, boven en onder, met de klok mee, de 12 en de 1, de twee wijzers.
 */
async function urenwijzerOpbouw(l: Lesgids, k: Klok) {
  /* Stap 3–6. De klok is een opgerolde getallenlijn. */
  k.pas({ wijzers: false });
  await l.zeg("Kijk eens hiernaar.");
  speelLesgeluid("klokDraai");
  k.pas({ vorm: "lijn" });
  await l.wacht(1300);
  await l.zeg("Weet je hoe dit heet?");
  const lijn = await kies(l, ["een getallenlijn", "een klok"]);
  if (lijn === "een getallenlijn") {
    k.goed();
    await l.zeg("Een getallenlijn. Precies.");
  } else if (lijn === "een klok") await tipDan(l, ["Het is nog geen klok.", "Maar je bent me al voor!"], []);
  else await tipDan(l, ["Dit is een getallenlijn.", "De getallen 1 tot en met 12, op een rij."], []);
  await l.zeg("Tik op een van de getallen.");
  k.pas({ actief: true, tikGetal: true });
  haak({ soort: "getal", poging: 1 }, true);
  await l.wachtOpVlak("getal");
  haak(null);
  speelLesgeluid("klokDraai");
  k.pas({ actief: false, tikGetal: false, vorm: "klok" });
  await l.wacht(1400);
  await l.zeg("Dat is een rare manier om een getallenlijn vast te houden.", "Hoe noemen we dit?");
  const rond = await kies(l, ["een klok", "nog steeds een getallenlijn"]);
  if (rond === "een klok") {
    k.goed();
    await l.zeg("Een klok. Precies.");
  } else await l.zeg(rond === null ? "Geen zorgen." : "Hij is rond geworden.", "Het is een klok.");

  /* Stap 7. Het hoogste punt; het driehoekje komt pas na een paar tellen. */
  await l.zeg("Kijk naar het hoogste punt van de klok.", "Welk getal zie je daar?");
  await vraag(l, ["1", "6", "12"], "12", {
    weetniet: false,
    ring: 12,
    naVraag: { ms: 4000, doe: () => k.pas({ driehoek: 12 }) },
    goedZin: ["De 12. Helemaal bovenaan."],
    fout: async (x) => {
      k.pas({ driehoek: 12 });
      if (x === "1") await tipDan(l, ["Kijk hoger dan de 1."], ["Welk getal staat helemaal bovenaan?"]);
      else await tipDan(l, [`De ${x} staat niet bovenaan.`, "Kijk waar het driehoekje wijst."], ["Welk getal staat helemaal bovenaan?"]);
      return ["1", "6", "12"];
    },
    antwoord: ["Niet helemaal.", "De 12 staat helemaal bovenaan de cirkel."],
  });

  /* Stap 8. Het laagste punt: het driehoekje springt naar onder de 6 en komt weer zacht in beeld. */
  k.pas({ driehoek: null, ring: null });
  await l.zeg("Volg de klok helemaal rond.", "Welk getal staat helemaal onderaan?");
  await vraag(l, ["3", "6", "12"], "6", {
    weetniet: false,
    ring: 6,
    naVraag: { ms: 1500, doe: () => k.pas({ driehoek: 6 }) },
    goedZin: ["De 6. Helemaal onderaan."],
    fout: async (x) => {
      k.pas({ driehoek: 6 });
      if (x === "3") await tipDan(l, ["Ga verder, voorbij de 3, helemaal naar beneden."], ["Welk getal staat helemaal onderaan?"]);
      else await tipDan(l, [`De ${x} staat bovenaan.`, "Volg de klok helemaal rond, naar beneden."], ["Welk getal staat helemaal onderaan?"]);
      return ["3", "6", "12"];
    },
    antwoord: ["De 6 staat helemaal onderaan."],
  });
  k.pas({ driehoek: null, ring: null });

  /* Stap 9. Wat komt erna: met de klok mee. */
  await l.zeg("Kijk nu naar de 6.", "Welk getal komt meteen na de 6?");
  const na6 = await vraag(l, ["5", "7", "8"], "7", {
    ring: 7,
    toon: () => k.pas({ pijl: { van: 6, naar: 7 } }),
    goedZin: ["Van de 6 gaan we deze kant op naar de 7."],
    fout: async () => {
      k.pas({ pijl: { van: 6, naar: 7 } });
      await tipDan(l, ["*Na* betekent: deze kant op.", "Volg de pijl vanaf de 6."], ["Klokken gaan deze kant op.", "Welk getal komt dan meteen na de 6?"]);
      return ["5", "7", "8"];
    },
    antwoord: ["Ga één getal verder, waar de pijl naartoe wijst."],
  });
  if (!na6) await l.zeg("Van de 6 gaan we deze kant op naar de 7.");
  await l.zeg("Deze kant op heet *met de klok mee*.");
  await verder(l);
  k.pas({ pijl: null });

  /* Stap 10. Na de 12 komt de 1. */
  await l.zeg("Nu een lastige.", "Welk getal komt meteen na de 12?");
  await vraag(l, ["1", "11", "13"], "1", {
    ring: 1,
    toon: () => k.pas({ pijl: { van: 12, naar: 1 } }),
    goedZin: ["De 1.", "Na de 12 begint de klok weer bij 1."],
    fout: async (x) => {
      if (x === "13") {
        await l.zeg("De 13? Ik snap wat je bedoelt.", "Op een getallenlijn zou dat kloppen.");
        await verder(l);
        k.pas({ pijl: { van: 12, naar: 1 } });
        await l.zeg("Maar deze cirkel heeft geen 13.", "Ga met de klok mee vanaf de 12.", "Welk getal komt dan?");
        return ["1", "2", "11"];
      }
      k.pas({ pijl: { van: 12, naar: 1 } });
      await tipDan(l, [x === null ? "Een tip." : `De ${x} komt vóór de 12.`, "Ga met de klok mee vanaf de 12."], ["Welk getal komt dan?"]);
      return ["1", "2", "11"];
    },
    antwoord: ["Na de 12 begint de klok weer bij 1.", "Eén stap met de klok mee, en daar is hij."],
  });
  k.pas({ pijl: null });
  await l.wacht(300);

  /* Stap 11. Twee wijzers verschijnen (plopje): welke telt wat? */
  k.zet(u(1));
  await l.wacht(400);
  k.pas({ wijzers: true });
  k.plop();
  await l.wacht(500);
  await l.zeg("Er staan nu twee wijzers op onze klok.");
  await verder(l);
  await l.zeg("De ene telt de minuten, en de andere laat het uur zien.", "Wat telt de lange wijzer, denk je?");
  const lang = await kies(l, ["de minuten", "de uren"], "de minuten", 1, { weetniet: false });
  if (lang === "de minuten") {
    k.goed();
    await l.zeg("De lange telt de minuten.");
  } else {
    await l.zeg("Dat klinkt logisch, want een uur duurt langer dan een minuut.", "Maar op een klok is het andersom.");
    await l.zeg("De lange telt de minuten.");
  }
  await verder(l);

  /* Stap 12. Hoe heet de lange? De pil om de minutenwijzer, de urenwijzer vaag. */
  k.pas({ pil: "minuut", uurwijzer: "flets", minuutwijzer: "fel" });
  await l.zeg("Deze lange [[m:blauwgroene wijzer]] telt de minuten op een klok.", "Hoe heet hij, denk je?");
  await vraag(l, ["de minutenwijzer", "de urenwijzer", "de secondewijzer"], "de minutenwijzer", {
    weetnietTweede: true,
    goedZin: ["De [[m:minutenwijzer]]. Precies."],
    fout: async (x) => {
      await tipDan(
        l,
        x === "de secondewijzer" ? ["Een secondewijzer is heel dun.", "Die zit niet op deze klok."] : ["Een tip.", "De uren lezen we af met de [[u:korte wijzer]]."],
        ["Hoe heet de lange wijzer dan, denk je?"],
      );
      return zonder(["de minutenwijzer", "de urenwijzer", "de secondewijzer"], x ?? "de urenwijzer");
    },
    antwoord: ["Het is de [[m:minutenwijzer]].", "Minuten tellen is zijn enige taak."],
  });

  /* Stap 13. De pil verhuist naar de urenwijzer. */
  k.pas({ pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
  await l.zeg("En deze korte [[u:oranje wijzer]].", "Hoe noemen we die?");
  await vraag(l, ["de urenwijzer", "de secondewijzer"], "de urenwijzer", {
    goedZin: ["De [[u:urenwijzer]]. Ja."],
    fout: async (x) => {
      if (x === "de secondewijzer") await tipDan(l, ["Een secondewijzer is heel dun.", "Deze korte wijzer laat het uur zien."], ["Hoe noemen we hem dan?"]);
      else await tipDan(l, ["Een tip.", "Deze korte wijzer laat het uur zien."], ["Hoe noemen we hem dan?"]);
      return ["de urenwijzer", "de secondewijzer"];
    },
    antwoord: ["Hij laat het uur zien.", "Dus heet hij de [[u:urenwijzer]]."],
  });
}

/** Het uur lezen met de urenwijzer, zelf zetten en oefenen (Synthesis stap 14 t/m 23). */
async function urenwijzerOefenen(l: Lesgids, k: Klok) {
  /* Stap 14. "Laten we kijken hoe hij werkt." (wacht) — de urenwijzer draait terwijl de vraag klinkt. */
  k.pas({ wijzers: true, pil: "uur", uurwijzer: "fel", minuutwijzer: "flets" });
  await l.zeg("We gebruiken de [[u:urenwijzer]] om het uur te lezen.", "Laten we kijken hoe hij werkt.");
  await verder(l);
  const draait = k.draai(u(3));
  await l.zeg("Naar welk getal wijst de [[u:urenwijzer]]?");
  await draait;
  await wijstNaar(l, ["3", "9", "12"], 3);

  /* Stap 15. Hij beweegt weer: naar de 7, dan naar de 11. */
  const draait7 = k.draai(u(7));
  await l.zeg("De urenwijzer beweegt weer.", "Waar wijst hij nu?");
  await draait7;
  await wijstNaar(l, ["6", "7", "12"], 7);
  const draait11 = k.draai(u(11));
  await l.zeg("Nog eentje.", "Naar welk uur wijst hij nu?");
  await draait11;
  await wijstNaar(l, ["1", "11", "12"], 11);
  await l.zeg("Je kunt het uur lezen met de [[u:urenwijzer]].");

  /* Stap 16. De minutenwijzer komt terug, met de pil. */
  k.pas({ pil: "minuut", minuutwijzer: "fel", uurwijzer: "fel" });
  await l.wacht(500);
  await l.zeg("Laten we kijken wat de [[m:minutenwijzer]] doet.");
  await verder(l);
  k.pas({ pil: null });

  /* Stap 17. Zelf de urenwijzer verzetten: een kop met de opdracht, een ring om het getal. */
  await gaNaar(l, k, 2);
  await l.zeg("Kijk eens!", "De [[m:minutenwijzer]] wijst recht omhoog, naar de 12.");
  await gaNaar(l, k, 3);
  await l.zeg("Nu staan we op de 3.", "De [[m:minutenwijzer]] wijst nog steeds recht omhoog.");
  await gaNaar(l, k, 6);

  /* Stap 18. Waar wees de minutenwijzer? De urenwijzer vaag. */
  k.pas({ uurwijzer: "flets", pil: null });
  await l.zeg("Kijk eens!", "Waar wees de [[m:minutenwijzer]] elke keer bij een nieuw uur?");
  const opties18 = ["6", "12"];
  const keuze18 = await kies(l, opties18, "12", 1);
  if (keuze18 === "12") {
    k.goed();
    k.pas({ pil: "minuut" });
    await l.zeg("Recht omhoog, naar de 12.", "Elke keer.");
  } else {
    k.pas({ pil: "minuut" });
    if (keuze18 === "6") await tipDan(l, ["Op de 6 staat de korte wijzer.", "De lange wijzer wijst ergens anders heen."], []);
    else await tipDan(l, ["Geen zorgen."], []);
    await l.zeg("Let deze keer goed op de [[m:minutenwijzer]].");
    await verder(l);
    k.pas({ pil: null });
    await gaNaar(l, k, 7);
    k.pas({ uurwijzer: "flets", pil: "minuut" });
    await l.zeg("Waar eindigde de [[m:minutenwijzer]]?");
    const eind = await kies(l, ["7", "12"], "12", 2);
    if (eind === "12") {
      k.goed();
      await l.zeg("Recht omhoog, naar de 12.");
    } else {
      k.pas({ ring: 12, ringWijzer: "minuut" });
      await l.zeg("De korte wijzer kwam op de 7.", "De lange wijzer eindigde recht omhoog, zoals bij elk heel uur: op de 12.");
      k.pas({ ring: null, getalKleur: { n: 12, wijzer: "minuut" } });
    }
  }
  await l.zeg("Wijst de [[m:minutenwijzer]] recht omhoog? Dan begint er een nieuw uur.", "Zo'n tijd noemen we een *heel uur*.");
  await verder(l);
  k.pas({ pil: null, uurwijzer: "fel" });

  /* Stap 19. De klok naar 3 uur: waar wijst de urenwijzer, en hoe heet deze tijd? */
  k.zet(u(3));
  await l.wacht(600);
  await l.zeg("En waar wijst de [[u:urenwijzer]] nu?");
  await wijstNaar(l, ["3", "9", "12"], 3);
  k.pas({ pil: null });
  await l.zeg("Hoe noemen we deze tijd, denk je?");
  const naamOpties = ["3 uur", "3 twaalf", "3 nul", "12 uur"];
  await vraag(l, naamOpties, "3 uur", {
    weetniet: false,
    weetnietTweede: true,
    ring: 3,
    ringTweede: true,
    goedZin: ["Ja, het is 3 uur."],
    fout: async (x) => {
      if (x === "12 uur") {
        await l.zeg("De 12 is het getal van de [[m:minutenwijzer]].", "Het uur komt van de korte wijzer.");
        await verder(l);
      } else {
        await l.zeg("Bij een heel uur zeggen we het getal van de urenwijzer, en dan *uur*.");
        await verder(l);
      }
      k.pas({ pil: "uur" });
      await l.zeg("De korte wijzer laat het uur zien.", "Hoe noemen we deze tijd dan?");
      return ["3 uur", "4 uur"];
    },
    antwoord: ["De [[u:urenwijzer]] staat op de 3, en de [[m:minutenwijzer]] recht omhoog.", "Dus het is 3 uur."],
    later: () => nogEensHeel(l, k, 3, ["3 uur", "12 uur", "9 uur"]),
  });
  k.pas({ pil: null, ring: null });

  /* Stap 20. 6 uur. */
  await k.draai(u(6));
  await l.zeg("Hoe laat is het nu?");
  await toetsHeelUur(l, k, 6, ["6 uur", "12 uur", "6 minuten"], "Kijk naar de [[u:urenwijzer]]. Hoe laat is het dan?");

  /* Stap 21. Een lastige: half 8 is geen 7 uur. De klok springt (eigen geluid). */
  speelLesgeluid("klokDraai");
  await k.draai(u(7, 30));
  await l.zeg("Hier is een lastige.", "Is dit 7 uur?");
  const strik = await kies(l, ["Nee", "Ja"], "Nee", 1, { weetniet: false });
  if (strik === "Nee") k.goed();
  k.pas({ pil: "minuut" });
  /* Synthesis: bij een fout meteen de uitleg (geen "Kijk nog eens."). */
  await l.zeg(...(strik === "Nee" ? ["Goed gezien!"] : []), "Bij een heel uur wijst de [[m:minutenwijzer]] recht omhoog.", "Deze staat beneden, bij de 6.");
  /* Synthesis: alleen de pil om de urenwijzer (geen pijltje), en de kern: het uur is nog steeds 7 ("past 7", in het Nederlands: later dan 7 uur, nog geen 8 uur). */
  k.pas({ pil: "uur" });
  await l.zeg("Deze klok is dus al voorbij 7 uur.");
  await l.zeg("De [[u:urenwijzer]] is de 7 al voorbij, maar nog niet bij de 8.", "Het is nog geen 8 uur.");
  await verder(l);
  k.pas({ pil: null, pijl: null });

  /*
    Stap 22. Het oefenblok. Zoals Synthesis: bij een fout komt er meteen een
    extra klok ("Probeer deze."), en de bonusvraag komt alleen als alles goed ging.
  */
  await l.zeg("Nu een paar klokken voor jou.");
  let fouten = 0;
  /*
    Synthesis: één rij klokken (9, 4, 2, 10, 1). Elke klok in het oefenblok én
    elke extra klok na een fout ("Probeer deze.") is de volgende uit de rij. Wie
    alles goed heeft, ziet dus 9, 4 en 2 uur; wie fouten maakt, ook 10 en 1 uur.
  */
  const rij: [number, string[]][] = [
    [9, ["9 uur", "12 uur", "9 minuten"]],
    [4, ["4 uur", "5 uur", "12 uur"]],
    [2, ["2 uur", "3 uur", "12 uur"]],
    [10, ["10 uur", "11 uur", "12 uur"]],
    [1, ["1 uur", "2 uur", "12 uur"]],
    [8, ["8 uur", "12 uur", "8 minuten"]],
    [5, ["5 uur", "6 uur", "12 uur"]],
  ];
  /* Eén klok in het oefenblok: de wijzers draaien naar de tijd, dan de vraag. Bij een fout een extra klok. */
  /* Een gekleurd getal van de vorige klok blijft alleen staan als het net gekleurd is (één klok). */
  const draaiNaar = async (uur: number) => {
    if (!k.kleurVers) k.pas({ getalKleur: null });
    k.kleurVers = false;
    await k.draai(u(uur), true);
  };
  const klok = async (zin: string) => {
    const [uur, opties] = rij.shift() ?? [9, ["9 uur", "12 uur", "9 minuten"]];
    await draaiNaar(uur);
    await l.zeg(zin);
    const goed = await toetsHeelUur(l, k, uur, [...opties]);
    if (goed) return true;
    fouten++;
    const volgende = rij.shift();
    if (volgende) {
      const [eu, eo] = volgende;
      await l.zeg("Probeer deze.");
      await draaiNaar(eu);
      await l.zeg("Hoe laat is het?");
      await toetsHeelUur(l, k, eu, [...eo]);
    }
    return false;
  };

  await klok("Hoe laat is het?");
  await l.zeg("Welke wijzer liet het uur zien?");
  const w1 = await kies(l, ["de kleine", "de grote"], "de kleine", 1, { weetniet: false });
  if (w1 === "de kleine") {
    k.goed();
    await l.zeg(lof(l));
  } else {
    /* Synthesis: meteen opnieuw, met de gloed om de urenwijzer, zonder pijl. */
    k.pas({ pil: "uur" });
    await l.zeg("Kijk naar de wijzer die oplicht.", "Welke liet het uur zien?");
    const w2 = await kies(l, ["de kleine", "de grote"], "de kleine", 2, { weetniet: false });
    if (w2 === "de kleine") {
      k.goed();
      await l.zeg(lof(l));
    } else {
      fouten++;
      await l.zeg("De kleine.", "De [[u:urenwijzer]] laat het uur zien.");
    }
    k.pas({ pil: null });
  }

  await l.zeg("Nog twee zoals deze, om zeker te weten dat je het snapt.");
  await klok("En deze? Hoe laat is het?");
  /* Synthesis: de knoppen horen bij de klok in beeld (na een fout is dat de extra klok). */
  await l.zeg("Waar wijst de [[m:minutenwijzer]]?");
  const m1 = await kies(l, [String(uurVan(k.nu)), "12"], "12", 1, { weetniet: false });
  if (m1 === "12") {
    k.goed();
    await l.zeg(lof(l));
  } else {
    fouten++;
    k.pas({ pil: "minuut" });
    await l.zeg("Recht omhoog, naar de 12, bij elk heel uur.");
    k.pas({ pil: null });
  }

  await l.zeg("De laatste, en dan is de les klaar.");
  await klok("Hoe laat is het?");

  /* Stap 7 van de goede doorloop: de bonus, alleen als alles goed ging (de klok draait met een eigen geluid). */
  if (fouten === 0) {
    speelLesgeluid("klokDraai");
    await k.draai(u(12));
    await l.zeg("Je had ze allemaal goed.", "Dus hier is een vraag om mee af te sluiten.", "Hoe laat is het over een uur?");
    await vraag(l, ["1 uur", "11 uur", "2 uur"], "1 uur", {
      goedZin: [lof(l)],
      fout: async (x) => {
        await tipDan(l, [x === null ? "Een tip." : "Bijna.", "Een uur later is de [[u:urenwijzer]] één getal verder.", "Na de 12 komt de 1."], ["Hoe laat is het over een uur?"]);
        return zonder(["1 uur", "11 uur", "2 uur"], x);
      },
      antwoord: ["Over een uur is het 1 uur.", "Na de 12 begint de klok weer bij 1."],
    });
  }
  await l.zeg("Nu kun je het uur lezen met de [[u:urenwijzer]].");

  await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
}

/* =====================================================================
   Les 2 — Hele uren zetten (Set the Hour)
   ===================================================================== */

const heleUrenZetten: Lesdraaiboek = {
  id: "klok-hele-uren-zetten",
  titel: "Hele uren zetten",
  indeling: "synthesis",
  synthesis: "Telling Time · Set the Hour",
  kaarttekening: KaartUrenZetten,

  /*
    Gedrag naar SYNTHESIS-ANALYSE/GEDRAG-T2-hele-uren-zetten.md (28 oktober
    2026): "Weet je dit al?", de urenwijzer met pil (de minutenwijzer vaag),
    "Nu mag jij de wijzers bewegen.", dan de zet-opdrachten 5, 9, 12 en 7, de
    vraag naar de minutenwijzer (geen tweede kans), "Nog twee zoals deze" (11 en
    4, de minutenwijzer nu vol) en extra klokken van dezelfde soort tot
    minstens 15 (besluit 2 van de eigenaar). Elke opdracht begint op een ander
    uur. Zoals Synthesis telt voor de kaart alleen het oefenblok.
  */
  async speel(l) {
    direct.add(l);
    const k = new Klok(l, u(3), {}, true);
    await l.zeg("Je kunt al een heel uur lezen, en nu gaan we er zelf een zetten op deze klok.", "Denk je dat je dit al weet?");
    const al = await kies(l, ["Ja", "Nee"]);
    if (al === "Ja") await l.zeg("Mooi, dan gaan we kijken.");
    else await l.zeg("Geen probleem.", "We doen het samen.");
    k.pas({ pil: "uur", minuutwijzer: "flets" });
    await l.zeg("De [[u:urenwijzer]] laat het uur zien.");
    await verder(l);
    k.pas({ pil: null });
    await l.zeg("Nu mag jij de wijzers bewegen.");

    let fouten = 0;
    /** Na een zet-opdracht: de lof, of na de begeleide stap "Daar is hij. 5 uur." */
    const naZet = async (uur: number, goed: boolean, telt: boolean) => {
      if (zetUurUitslag.hulp) await l.zeg(zetUurUitslag.handje ? "Gelukt." : "Daar is hij.", `${uur} uur.`);
      else await l.zeg(lof(l));
      if (!goed && telt) fouten++;
    };

    /* 1–4. De eerste opdrachten (tellen niet mee voor de kaart, zoals Synthesis). */
    await naZet(5, await zetUur(l, k, 5, 3), false);
    await naZet(9, await zetUur(l, k, 9, 8), false);
    const twaalf = await zetUur(l, k, 12, null);
    await naZet(12, twaalf, false);
    k.pas({ ring: 12, ringWijzer: "uur", ringPuls: false });
    await l.zeg("De 12 staat helemaal bovenaan.");
    k.pas({ ring: null });
    await naZet(7, await zetUur(l, k, 7, 4), false);

    /* 5. Waar wijst de minutenwijzer? Geen tweede kans: bij een fout meteen het antwoord, vanzelf door. */
    k.pas({ minuutwijzer: "fel", pil: null });
    await l.zeg("Waar wijst de [[m:minutenwijzer]]?");
    const minuut = await kies(l, ["7", "12"], "12", 1, { weetniet: false });
    if (minuut === "12") {
      k.goed();
      await l.zeg(lof(l));
    } else {
      k.pas({ pil: "minuut" });
      await l.zeg("Recht omhoog, naar de 12, bij elk heel uur.");
      await l.wacht(500);
      k.pas({ pil: null });
    }

    /* 6 en 7. Het oefenblok: de minutenwijzer blijft nu vol. */
    await l.zeg("Nog twee zoals deze, om zeker te weten dat je het snapt.");
    await naZet(11, await zetUur(l, k, 11, 8), true);
    await l.zeg("En deze.");
    await naZet(4, await zetUur(l, k, 4, 1), true);

    /* Extra klokken van dezelfde soort (besluit 2: tot minstens 15). */
    await l.zeg("Nu nog wat extra oefenen.");
    const minuutVraag = async (uur: number) => {
      k.pas({ pil: null });
      await l.zeg("Waar wijst de [[m:minutenwijzer]]?");
      const m = await kies(l, [String(uur), "12"], "12", 1, { weetniet: false });
      if (m === "12") {
        k.goed();
        await l.zeg(lof(l));
      } else {
        fouten++;
        k.pas({ pil: "minuut" });
        await l.zeg("Recht omhoog, naar de 12, bij elk heel uur.");
        await l.wacht(500);
        k.pas({ pil: null });
      }
    };
    const extra = [
      [3, 10, true],
      [10, 6, false],
      [1, 9, false],
      [8, 2, true],
      [6, 11, false],
      [2, 7, false],
    ] as const;
    for (const [i, [uur, van, vraagMin]] of extra.entries()) {
      if (i === extra.length - 1) await l.zeg("De laatste, en dan is de les klaar.");
      await naZet(uur, await zetUur(l, k, uur, van), true);
      if (vraagMin) await minuutVraag(uur);
    }
    /* Synthesis: de slotzin pas aan het eind (eerst stond hij ook al vóór de extra opdrachten). */
    await l.zeg("Nu kun je de klok op elk heel uur zetten met de [[u:urenwijzer]].");

    await kaartEinde(l, fouten, "Je hebt het zonder hulp gedaan.");
  },
};

/* =====================================================================
   Les 3 — Halve uren (Halfway Around)
   Gedrag naar SYNTHESIS-ANALYSE/GEDRAG-T3-halve-uren.md (28 oktober 2026).
   ===================================================================== */

/**
 * Een halve tijd aflezen (oefenblok), met de Nederlandse valkuil: het uur dat
 * voorbij is. 1× fout: een tip, wachten op de pijl, dan andere knoppen (zoals
 * Synthesis bij half 12). 2× fout: een pulserend boogje tussen de twee getallen
 * en het antwoord, vanzelf door.
 */
async function toetsHalf(l: Lesgids, k: Klok, t: number, opties: string[], terug = true, weetniet = true, verborgen = false): Promise<boolean> {
  const uur = uurVan(t);
  const na = volgend(uur);
  const goed = await vraag(l, opties, `half ${na}`, {
    weetniet,
    snel: true,
    toon: () => k.pas({ randboog: { van: uur, tot: uur + 1 } }),
    bijFout2: () => k.pas({ randboog: { van: uur, tot: uur + 1, puls: true } }),
    goedZin: [`Half ${na}. ${lof(l)}`],
    later: terug
      ? async () => {
          k.pas({ minuutwijzer: "fel", inkleur: false });
          k.zet(t);
          await l.wacht(600);
          await l.zeg("Hoe laat is het?");
          await toetsHalf(l, k, t, opties, false, weetniet);
        }
      : undefined,
    fout: async (x) => {
      /* Synthesis: na een fout de pil om de urenwijzer en de minutenwijzer vaag. */
      k.pas({ pil: "uur", ...(verborgen ? {} : { minuutwijzer: "flets" as const }) });
      if (x === `half ${uur}`) {
        await tipDan(l, ["Ik snap wat je bedoelt.", `De [[u:urenwijzer]] is de ${uur} al voorbij.`], ["Maar bij half noemen we het uur waar hij naartoe gaat.", "Hoe laat is het dan?"]);
        /* Synthesis geeft hier (deels) andere knoppen. */
        const andere = [...new Set([...zonder(opties, x), `${na} uur`])];
        if (andere.length < 3) andere.push(`half ${mod(na + 5, 12) + 1}`);
        return andere.slice(0, 3);
      }
      if (x === "half 7" && na !== 7) {
        /* Synthesis: de valkuil met het getal van de minutenwijzer. */
        k.pas({ pil: "minuut" });
        await tipDan(l, ["Ik snap waar dat vandaan komt.", "De 6 is het getal van de [[m:minutenwijzer]]."], ["Het uur lees je af aan de [[u:urenwijzer]].", "Hoe laat is het dan?"]);
        k.pas({ pil: "uur" });
        return zonder(opties, x);
      }
      if (x === `${na} uur`) await tipDan(l, ["Ik snap waar dat vandaan komt.", `De [[u:urenwijzer]] is dicht bij de ${na}, maar hij is er nog niet.`], ["Hoe laat is het dan?"]);
      else if (x === null) await tipDan(l, ["Een tip.", "Kijk naar de [[u:urenwijzer]].", "Naar welk getal is hij op weg?"], ["Hoe laat is het dan?"]);
      else await tipDan(l, ["Kijk naar de [[u:urenwijzer]].", "Naar welk getal is hij op weg?"], ["Hoe laat is het dan?"]);
      return zonder(opties, x);
    },
    antwoord: [`Half ${na}.`, `De [[u:urenwijzer]] is de ${uur} voorbij, en op weg naar de ${na}.`],
  });
  k.pas({ pil: null, randboog: null, ...(verborgen ? {} : { minuutwijzer: "fel" as const }) });
  return goed;
}

/** "Waar moet de minutenwijzer dan wijzen?" met de minutenwijzer verstopt (half: de 6, kwart over: de 3). */
async function waarMinuut(l: Lesgids, k: Klok, m: 3 | 6): Promise<boolean> {
  const opties = m === 6 ? ["6", "11", "12"] : ["3", "6", "12"];
  const goed = await vraag(l, opties, String(m), {
    ring: m,
    ringWijzer: "minuut",
    ringTweede: true,
    snel: true,
    toon: () => {
      k.pas({ minuutwijzer: "fel", pil: "minuut" });
      k.plop();
    },
    goedZin: [lof(l)],
    fout: async (x) => {
      if (m === 6) await tipDan(l, [x === null ? "Een tip." : `Op de ${x} staat hij niet.`, "Bij half is de [[m:minutenwijzer]] een half rondje gegaan."], ["Waar moet hij dan wijzen?"]);
      else await tipDan(l, [x === null ? "Een tip." : x === "6" ? "Op de 6 staat hij bij half." : "Op de 12 staat hij bij een heel uur.", "Bij kwart over is de [[m:minutenwijzer]] een kwartrondje gegaan."], ["Waar moet hij dan wijzen?"]);
      return zonder(opties, x);
    },
    antwoord: m === 6 ? ["Bij half wijst de [[m:minutenwijzer]] naar de 6."] : ["Bij kwart over wijst de [[m:minutenwijzer]] naar de 3."],
  });
  k.pas({ minuutwijzer: "fel", pil: null });
  return goed;
}

const halveUren: Lesdraaiboek = {
  id: "klok-halve-uren",
  titel: "Halve uren",
  indeling: "synthesis",
  synthesis: "Telling Time · Halfway Around",
  kaarttekening: KaartHalf,

  /*
    Naar Synthesis · Halfway Around (GEDRAG-T3), in het Nederlands: "half past
    4" is bij ons half 5 (het uur waar de urenwijzer naartoe gaat). Daarom
    staat er na "half" steeds één zin extra over de urenwijzer die op weg is.
  */
  async speel(l) {
    direct.add(l);
    const k = new Klok(l, u(4, 30), {}, true);
    const start = await begin(l, ["We leren de klok lezen als de minutenwijzer een half rondje is gegaan.", "Dat heet half."], {
      uitleg: ["Bij half staat de minutenwijzer op de 6.", "De urenwijzer is dan op weg naar het volgende uur."],
      proef: async () => {
        k.zet(u(3, 30));
        await l.wacht(600);
        await l.zeg("Hoe laat is het?");
        if (!(await proefvraag(l, ["half 3", "half 4", "4 uur"], "half 4"))) return false;
        k.zet(u(5, 30));
        await l.wacht(600);
        await l.zeg("En nu?");
        return proefvraag(l, ["half 5", "6 uur", "half 6"], "half 6");
      },
    });

    if (start === "leer") {
      /* Stap 2. De urenwijzer staat tussen twee getallen; de minutenwijzer vaag. */
      k.zet(u(4, 30));
      /* Synthesis: de minutenwijzer vaag; de pil om de urenwijzer komt pas na een fout. */
      k.pas({ pil: null, minuutwijzer: "flets" });
      await l.zeg("De [[u:urenwijzer]] staat op een gekke plek.", "Waar wijst zijn punt naar?");
      const tussenOpties = ["de 4", "tussen de 4 en de 5", "de 5", "tussen de 5 en de 6", "de 6"];
      await vraag(l, tussenOpties, "tussen de 4 en de 5", {
        toon: () => k.pas({ randboog: { van: 4, tot: 5 } }),
        bijFout2: () => k.pas({ randboog: { van: 4, tot: 5, puls: true } }),
        goedZin: ["Tussen de 4 en de 5."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          if (x === "de 5") await tipDan(l, ["Ik snap wat je bedoelt.", "De punt gaat naar de 5, maar raakt hem nog niet."], ["Volg de [[u:urenwijzer]] dus tot zijn punt.", "Staat hij op de 4, of ergens ertussen?"]);
          else await tipDan(l, [x === null ? "Een tip." : "Bijna.", "Volg de [[u:urenwijzer]] vanaf het midden tot zijn punt."], ["Staat hij op een getal, of ergens ertussen?"]);
          return zonder(tussenOpties, x).slice(0, 4);
        },
        antwoord: ["Hij staat tussen de 4 en de 5.", "De punt staat in de ruimte ertussen, niet op een van beide."],
      });
      await l.wacht(400);
      k.pas({ randboog: null, pil: null });

      /* Stap 3. Welk uur is hij al voorbij? Geen tweede kans: na een fout het rode en dan het blauwe pijltje. */
      await l.zeg("Welk uur is hij al voorbij?");
      const voorbij = await kies(l, ["4", "5"], "4", 1);
      if (voorbij === "4") {
        k.goed();
        k.pas({ pijl: { van: 4, naar: 5 } });
        await l.zeg("Ja, de 4.", "Hij kwam eerst langs de 4, en nu is hij op weg naar de 5.");
      } else {
        if (voorbij === "5") {
          k.pas({ pijl: { van: 5, naar: 4, rood: true } });
          await l.zeg("Ik snap waarom je dat kiest.", "De punt wijst wel die kant op.");
        }
        k.pas({ pijl: { van: 4, naar: 5 } });
        await l.zeg("Klokken gaan met de klok mee, deze kant op.", "Hij kwam dus eerst langs de 4, en nu is hij op weg naar de 5.");
      }
      await verder(l);
      k.pas({ pijl: null });
      await l.zeg("De tijd is dus ergens tussen 4 uur en 5 uur.");
      /* Synthesis: de pil om de (nog vage) minutenwijzer blijft bij de derde zin staan. */
      k.pas({ pil: "minuut" });
      await l.zeg("De [[m:minutenwijzer]] weet precies waar.");
      await l.zeg("We zetten de klok op een tijd die we kennen, en kijken hoe hij op die plek komt.");
      await verder(l);

      /* Stap 4. Een heel uur (plopje): de minutenwijzer weer vol, de pil om de urenwijzer. */
      k.zet(u(3));
      k.pas({ pil: "uur", minuutwijzer: "fel" });
      k.plop();
      await l.wacht(500);
      await l.zeg("Hier staan we, op een heel uur.", "Hoe laat is het?");
      const driePlus = ["3 uur", "9 uur", "12 uur"];
      await vraag(l, driePlus, "3 uur", {
        ring: 3,
        toon: () => k.pas({ ring: 3 }),
        goedZin: ["3 uur. Klopt."],
        fout: async (x) => {
          await tipDan(l, ["Een tip.", "De [[u:urenwijzer]] laat het uur zien, en de [[m:minutenwijzer]] staat recht omhoog."], ["Hoe laat is het dan?"]);
          return zonder(driePlus, x);
        },
        antwoord: ["De [[u:urenwijzer]] wijst naar de 3.", "Het is 3 uur."],
      });
      k.pas({ ring: null, pil: null });

      /* Stap 5 en 6. Eén keer rond; wat deed de urenwijzer? Bij een fout: nog een keer rond, dan "waar eindigde hij?". */
      k.pas({ pil: "minuut" });
      await l.zeg("Vandaag mag jij de [[m:minutenwijzer]] bewegen.");
      await draaiMinuut(l, k, u(4), ["Tik op de 12, of sleep de [[m:minutenwijzer]] helemaal rond."], "Draai de minutenwijzer één keer rond.");
      /* Synthesis: de minutenwijzer vervaagt bij deze vraag, en blijft vaag tot het inkleuren. */
      k.pas({ minuutwijzer: "flets" });
      await l.zeg("De [[m:minutenwijzer]] ging helemaal rond.", "Wat deed de [[u:urenwijzer]] dan?");
      let h = 4;
      const deed = await kies(l, ["ging één getal verder", "bleef stilstaan", "ging ook helemaal rond"], "ging één getal verder", 1);
      if (deed === "ging één getal verder") {
        k.goed();
        await l.zeg("Hij ging één getal verder, naar de 4.");
      } else {
        k.pas({ pil: "uur" });
        if (deed === "bleef stilstaan") await l.zeg("Dat kiezen veel kinderen.", "Hij beweegt zo langzaam dat je het makkelijk mist.");
        else if (deed === "ging ook helemaal rond") await l.zeg("Hij bewoog wel, maar lang niet helemaal rond.");
        await l.zeg("Hij staat niet meer op de 3.");
        k.pas({ pil: null });
        await l.zeg("Kijk nog een keer.");
        k.pas({ minuutwijzer: "fel" });
        await draaiMinuut(l, k, u(5), ["Tik op de 12, of sleep de [[m:minutenwijzer]] helemaal rond."], "Draai de minutenwijzer één keer rond.");
        h = 5;
        k.pas({ minuutwijzer: "flets" });
        await l.zeg("De [[u:urenwijzer]] begon op de 4.", "Waar eindigde hij?");
        await vraag(l, ["4", "5", "6"], "5", {
          weetniet: false,
          ring: 5,
          goedZin: [lof(l)],
          fout: async (x) => {
            k.pas({ pil: "uur" });
            await tipDan(l, [`Op de ${x} staat hij niet.`, "Kijk waar de punt van de [[u:urenwijzer]] nu is."], ["Waar eindigde hij?"]);
            return zonder(["4", "5", "6"], x);
          },
          antwoord: ["Hij ging van de 4 naar de 5.", "Elke keer dat de [[m:minutenwijzer]] rond gaat, gaat de [[u:urenwijzer]] één getal verder."],
        });
        k.pas({ pil: null });
      }

      /* Stap 7. Hoeveel tijd? Bij een fout meteen "Niet helemaal." en de vraag anders gesteld (geen pijl). */
      await l.zeg(`Het was ${h - 1} uur, en nu is het ${h} uur.`, "Hoeveel tijd is er voorbij?");
      await vraag(l, ["een uur", "een minuut", "een dag"], "een uur", {
        goedZin: ["Een uur.", "Eén rondje van de [[m:minutenwijzer]] is een heel uur."],
        fout: async (x) => {
          await l.zeg("Niet helemaal.", `Van ${h - 1} uur tot ${h} uur: hoe lang is dat?`);
          return x === "een dag" ? ["een uur", "een minuut"] : ["een uur", "een dag"];
        },
        antwoord: ["Er is een uur voorbij.", "Eén rondje van de [[m:minutenwijzer]] is een heel uur."],
      });

      /* Stap 8. Een half rondje: de helft inkleuren (Synthesis: pil om de minutenwijzer, die weer vol is). */
      k.pas({ pil: "minuut", minuutwijzer: "fel" });
      await l.zeg("Nu kijken we wat er met de tijd gebeurt als de [[m:minutenwijzer]] maar een half rondje gaat.");
      await verder(l);
      await kleurIn(l, k, 30);

      /* Stap 9. Hoeveel van een uur? (Synthesis: de urenwijzer vaag.) */
      k.pas({ uurwijzer: "flets" });
      await l.zeg("Kijk naar het gekleurde stuk: het ging half rond.", "Hoeveel van een uur is er voorbij?");
      await vraag(l, ["een uur", "een half uur", "geen tijd"], "een half uur", {
        goedZin: ["Een half uur.", "Een half rondje is een half uur."],
        fout: async (x) => {
          await tipDan(l, ["Probeer dit.", "Helemaal rond was één uur."], ["Hoeveel van een uur is het gekleurde stuk dan?"]);
          return zonder(["een uur", "een half uur", "geen tijd"], x);
        },
        antwoord: ["Een half uur.", "Een half rondje is een half uur."],
      });
      await l.zeg(`Het is dus een half uur na ${h} uur.`);

      /* Stap 10. Waar is de urenwijzer nu? Goed: een rustig boogje. Synthesis: de urenwijzer weer vol, de minutenwijzer vaag. */
      k.pas({ pil: null, uurwijzer: "fel", minuutwijzer: "flets" });
      await l.zeg("Maar wat doet de [[u:urenwijzer]]?", "Waar staat hij nu?");
      const plekHalf = [`op de ${h}`, `tussen de ${h} en de ${h + 1}`, `op de ${h + 1}`, `tussen de ${h + 1} en de ${h + 2}`];
      await vraag(l, plekHalf, `tussen de ${h} en de ${h + 1}`, {
        toon: () => k.pas({ randboog: { van: h, tot: h + 1 } }),
        bijFout2: () => k.pas({ randboog: { van: h, tot: h + 1, puls: true } }),
        goedZin: [`Halverwege de ${h} en de ${h + 1}.`],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          await tipDan(l, [x === `op de ${h}` ? `Om ${h} uur stond hij precies op de ${h}.` : x === `op de ${h + 1}` ? `Hij is dicht bij de ${h + 1}, maar staat er nog niet op.` : "Kijk goed naar de punt.", "Er is een half uur voorbij."], ["Waar staat hij nu?"]);
          return zonder(plekHalf, x);
        },
        antwoord: [`Hij staat halverwege de ${h} en de ${h + 1}.`],
      });
      /* Het Nederlands: bij half noemen we het uur waar de urenwijzer naartoe gaat (Synthesis toont hier geen pijltje en geen boogje). */
      k.pas({ randboog: null });
      await l.zeg(`De [[u:urenwijzer]] is op weg naar de ${h + 1}, en hij is al halverwege.`, `Daarom heet deze tijd *half ${h + 1}*.`);
      await verder(l);
      k.pas({ pijl: null, pil: null, randboog: null });

      /* Stap 11. De minutenwijzer en het gekleurde stuk verdwijnen. */
      k.pas({ inkleur: false, minuutwijzer: "weg" });
      await l.zeg("Nu verstopt de [[m:minutenwijzer]] zich.", "Hoe laat is het, met alleen de [[u:urenwijzer]]?");
      const alleenUur = [`${h} uur`, `half ${h + 1}`, `${h + 1} uur`, `half ${h + 2}`];
      await vraag(l, alleenUur, `half ${h + 1}`, {
        goedZin: [`Half ${h + 1}.`, "Je kunt het lezen met alleen de [[u:urenwijzer]]."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          if (x === `${h + 1} uur` || x === `half ${h + 2}`) await tipDan(l, ["Ik snap waar dat vandaan komt.", `De [[u:urenwijzer]] is dicht bij de ${h + 1}, maar hij is er nog niet.`], ["Hoe laat is het dan?"]);
          else if (x === `${h} uur`) await tipDan(l, [`Om ${h} uur staat de [[u:urenwijzer]] precies op de ${h}.`, `Hij is de ${h} al voorbij.`], ["Hoe laat is het dan?"]);
          else await tipDan(l, ["Een tip.", `Hij staat halverwege, op weg naar de ${h + 1}.`], ["Hoe laat is het dan?"]);
          return zonder(alleenUur, x ?? `half ${h + 2}`);
        },
        /* Eerst stond hier ook "Hij is halverwege op weg naar de …": bijna dezelfde zin als de tip ervoor. */
        antwoord: [`Het is dus half ${h + 1}.`],
      });
      k.pas({ pil: null, minuutwijzer: "fel" });
      await l.zeg("En nu ken je de gekke klok van het begin: dat was half 5.");

      /* Stap 12. Sam (plopjes): zijn klok staat ernaast. */
      k.zet(u(h, 30));
      await l.wacht(400);
      k.pas({ sam: true, tweede: { tijd: u(h, 30), uurTijd: u(h), naam: "De klok van Sam" } });
      k.plop();
      await l.wacht(300);
      k.plop();
      await l.wacht(600);
      await l.zeg("Hier is mijn vriend Sam.");
      await l.zeg("Sam tekende een tijd op deze klok, en deed iets fout.");
      await l.zeg(`Sam wilde half ${h + 1} laten zien.`);
      await l.zeg("Daar is de tekening van Sam, naast jouw klok.", "Wat deed Sam fout?");
      await vraag(l, ["de urenwijzer", "de minutenwijzer", "niets"], "de urenwijzer", {
        goedZin: ["De [[u:urenwijzer]]. " + lof(l)],
        fout: async () => {
          await tipDan(l, ["Op de klok van Sam staat één wijzer op een andere plek."], ["Vergelijk ze nog eens.", "Welke wijzer zette Sam op de verkeerde plek?"]);
          return ["de urenwijzer", "de minutenwijzer"];
        },
        bijFout2: () => k.pas({ pil: "uur" }),
        antwoord: ["De [[u:urenwijzer]].", `Sam liet hem op de ${h} staan.`],
      });
      await l.zeg(`Maar er ging een half uur voorbij, dus hij moet halverwege de ${h} en de ${h + 1} staan.`);
      /* Synthesis: Sam en zijn klok vervagen al tijdens deze zin, de pil is weg. */
      k.pas({ pil: null, tweede: null, sam: false, wijzers: false });
      await l.zeg("Sam gaat het verbeteren.");
      await l.wacht(500);
      /* Synthesis: jouw klok staat even zonder wijzers, daarna springt hij naar half 8 (de wijzers komen terug met een plopje, hieronder). */

      /* Stap 13. Het hele verhaal van half (plopje, half 8). */
      k.zet(u(7, 30));
      k.pas({ wijzers: true });
      k.plop();
      await l.wacht(500);
      await l.zeg("Nu heb je het hele verhaal van half gezien.");
      /* Synthesis: geen pil bij deze vraag (pas na een fout). */
      await l.zeg("Tussen welke twee getallen staat de [[u:urenwijzer]]?");
      await vraag(l, ["6 en 7", "7 en 8", "8 en 9"], "7 en 8", {
        toon: () => k.pas({ randboog: { van: 7, tot: 8 } }),
        bijFout2: () => k.pas({ randboog: { van: 7, tot: 8, puls: true } }),
        goedZin: ["Tussen de 7 en de 8."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          await tipDan(l, [x === null ? "Een tip." : "Bijna.", "Volg de [[u:urenwijzer]] tot zijn punt."], ["Tussen welke twee getallen staat hij?"]);
          return zonder(["6 en 7", "7 en 8", "8 en 9"], x);
        },
        antwoord: ["Hij staat tussen de 7 en de 8."],
      });
      k.pas({ pil: null, randboog: null });
      /* Synthesis: "Half past 7. Good." en door, zonder nog een vraag (de oude vraag "Hoe laat is het dan?" is hier vervallen, 29 oktober 2026). */
      await l.zeg("Dan is het half 8.", lof(l));
    }

    /* Stap 14 en 15. Het oefenblok. */
    await l.zeg("Laten we nog meer halve uren lezen.");
    let fouten = 0;
    const lees = async (t: number, opties: string[], zin: string[], verborgen = false) => {
      k.zet(t);
      k.pas({ minuutwijzer: verborgen ? "weg" : "fel" });
      k.plop();
      await l.wacht(500);
      await l.zeg(...zin);
      const ok = await toetsHalf(l, k, t, opties, true, true, verborgen);
      if (!ok) fouten++;
      k.pas({ minuutwijzer: "fel" });
      return ok;
    };
    /*
      Synthesis: de keuzes hebben steeds een valkuil met het getal van de
      minutenwijzer (half past 6 = bij ons half 7), en na een meteen goede half
      12 volgt direct de verstopte minutenwijzer; half 3 komt na een fout.
    */
    /* Synthesis: één rij klokken (half 12, half 3, half 11, half 10); een extra klok na een fout is de volgende uit de rij. */
    const rijHalf: [number, string[]][] = [
      [u(2, 30), ["half 2", "half 3", "half 7"]],
      [u(10, 30), ["half 7", "half 10", "half 11"]],
      [u(9, 30), ["half 7", "half 9", "half 10"]],
    ];
    const volgendeHalf = async (zin: string[]) => {
      const [t, o] = rijHalf.shift() ?? [u(9, 30), ["half 7", "half 9", "half 10"]];
      return lees(t, o, zin);
    };
    const eerste = await lees(u(11, 30), ["half 7", "half 11", "half 12"], ["Hier is een lastige.", "Hoe laat is het?"]);
    if (!eerste) await volgendeHalf(["Hoe laat is het?"]);
    /* Terug naar half 12, nu zonder minutenwijzer. */
    k.zet(u(11, 30));
    k.pas({ minuutwijzer: "weg" });
    k.plop();
    await l.wacht(500);
    await l.zeg("Kijk waar de [[u:urenwijzer]] staat.", "Waar moet de [[m:minutenwijzer]] dan wijzen?");
    if (!(await waarMinuut(l, k, 6))) fouten++;
    await l.zeg("Nog twee zoals deze, om zeker te weten dat je het snapt.");
    await volgendeHalf(["Hoe laat is het?"]);
    await l.zeg("Nog één op dit niveau.");
    await volgendeHalf(["En deze? Hoe laat is het nu?"]);

    /* Stap 16. Zetten met twee wijzers (start 5 uur). Na hulp: "Nu eentje helemaal zelf." */
    await l.zeg("Dit is de moeilijkste vraag die ik voor je heb in deze les.");
    const zelf = await halfOfKwart(l, k, u(8, 30), u(5));
    if (zelf) await l.zeg(lof(l));
    else {
      fouten++;
      await l.zeg("Nu eentje helemaal zelf.");
      if (!(await halfOfKwart(l, k, u(2, 30), u(11)))) fouten++;
      else await l.zeg(lof(l));
    }

    /* Stap 17. Vooruitkijken: eerst kiezen, dan altijd zelf de minutenwijzer half rond draaien. */
    k.zet(u(9));
    k.plop();
    await l.wacht(500);
    await l.zeg("Nu een ander soort vraag.");
    await l.zeg("Half 10 is nog maar een half uur weg.", "Waar staat de [[u:urenwijzer]] dan?");
    const vooruit = ["op de 9", "tussen de 9 en de 10", "op de 10", "tussen de 10 en de 11"];
    const voorspel = await kies(l, vooruit, "tussen de 9 en de 10", 1);
    /* Synthesis: hier wordt niets ingekleurd. */
    await draaiMinuut(l, k, u(9, 30), ["Tik op de 6, of sleep de [[m:minutenwijzer]] erheen."], "Draai de minutenwijzer een half rondje.", true);
    /* Synthesis: geen pil om de urenwijzer bij "Kijk waar hij uitkwam" (pas na een fout). */
    if (voorspel === "tussen de 9 en de 10") {
      k.goed();
      k.pas({ randboog: { van: 9, tot: 10 } });
      await l.zeg("Precies.", "Net waar jij zei.");
    } else {
      fouten++;
      await l.zeg("Kijk waar hij uitkwam.", "Waar staat de [[u:urenwijzer]] nu?");
      await vraag(l, zonder(vooruit, voorspel).slice(0, 3), "tussen de 9 en de 10", {
        weetniet: false,
        toon: () => k.pas({ randboog: { van: 9, tot: 10 } }),
        bijFout2: () => k.pas({ randboog: { van: 9, tot: 10, puls: true } }),
        goedZin: ["Halverwege.", "Het halve uur ging voorbij, dus hij ging halverwege."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          await tipDan(l, [`Hij staat niet ${x}.`, "Volg de [[u:urenwijzer]] tot zijn punt."], ["Waar staat hij nu?"]);
          return zonder(vooruit, x).filter((o) => o !== voorspel);
        },
        antwoord: ["Hij staat halverwege de 9 en de 10.", "Het halve uur ging voorbij, dus hij ging halverwege."],
      });
    }
    k.pas({ pil: null, inkleur: false, randboog: null });

    /* Korte route (Ja of Weet ik niet bij het begin): extra klokken van dezelfde soort, tot minstens 15 vragen. */
    if (start !== "leer") {
      await l.zeg("Nu nog wat extra oefenen.");
      for (const [t, opties, zin, verborgen] of [
        [u(5, 30), ["half 5", "half 6", "6 uur"], "Hoe laat is het?", false],
        [u(8, 30), ["half 8", "half 9", "9 uur"], "En deze?", false],
        [u(1, 30), ["half 1", "half 2", "half 7"], "Hoe laat is het nu?", false],
        [u(9, 30), ["half 9", "half 10", "10 uur"], "Hier is de minutenwijzer verstopt. Hoe laat is het?", true],
        [u(3, 30), ["half 3", "half 4", "half 9"], "Nog een met een verstopte minutenwijzer. Hoe laat is het?", true],
        [u(12, 30), ["half 12", "half 1", "1 uur"], "Een lastige. Ook hier is de minutenwijzer verstopt. Hoe laat is het?", true],
      ] as const) {
        await lees(t, [...opties], [zin], verborgen);
      }
      if (!(await halfOfKwart(l, k, u(5, 30), u(12)))) fouten++;
      else await l.zeg(lof(l));
      await l.zeg("Nu de moeilijkste.");
      if (!(await halfOfKwart(l, k, u(10, 30), u(3)))) fouten++;
      else await l.zeg(lof(l));
    }

    await l.zeg("Nu kun je halve uren lezen en zetten.");

    /* De bonus, alleen als alles goed ging (de klok draait met een eigen geluid). */
    if (fouten === 0) {
      speelLesgeluid("klokDraai");
      await k.draai(u(12, 30));
      await l.zeg("Je had alles goed, dus hier is er nog één om mee af te sluiten.", "Hoe laat is het?");
      await vraag(l, ["half 1", "half 7", "half 12", "1 uur"], "half 1", {
        goedZin: [lof(l), "Na de 12 begint de klok weer opnieuw."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          await tipDan(l, ["Een tip.", "De [[u:urenwijzer]] is de 12 voorbij.", "Na de 12 komt de 1."], ["Hoe laat is het dan?"]);
          return zonder(["half 1", "half 7", "half 12", "1 uur"], x);
        },
        antwoord: ["Half 1.", "Na de 12 begint de klok weer opnieuw."],
      });
      k.pas({ pil: null });
    }

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Les 4 — Kwart over (Quarter Past)
   Gedrag naar SYNTHESIS-ANALYSE/GEDRAG-T4-kwart-over.md (28 oktober 2026).
   ===================================================================== */

/**
 * Kwart over aflezen (oefenblok). "kwart over 3" (de 3 van de minutenwijzer):
 * pil om de minutenwijzer, "Dat kiezen veel kinderen. De 3 is waar de
 * minutenwijzer naar wijst." (wachten), dan de pil naar de urenwijzer en
 * andere knoppen. 2× fout: een pulserend boogje net voorbij het uur, vanzelf door.
 */
async function toetsKwart(l: Lesgids, k: Klok, t: number, opties: string[], terug = true, weetniet = true): Promise<boolean> {
  const uur = uurVan(t);
  const goed = await vraag(l, opties, `kwart over ${uur}`, {
    weetniet,
    snel: true,
    toon: () => k.pas({ randboog: { van: uur, tot: uur + 0.25 } }),
    bijFout2: () => k.pas({ pil: "uur", randboog: { van: uur, tot: uur + 0.25, puls: true } }),
    goedZin: [lof(l)],
    later: terug
      ? async () => {
          k.pas({ minuutwijzer: "fel", inkleur: false });
          k.zet(t);
          await l.wacht(600);
          await l.zeg("Hoe laat is het?");
          await toetsKwart(l, k, t, opties, false, weetniet);
        }
      : undefined,
    fout: async (x) => {
      if (x === "kwart over 3") {
        k.pas({ pil: "minuut" });
        await l.zeg("Dat kiezen veel kinderen.", "De 3 is waar de [[m:minutenwijzer]] naar wijst.");
        await verder(l);
        k.pas({ pil: "uur" });
        await l.zeg("Maar de 3 is het getal van de minutenwijzer, niet van het uur.", "Hoe laat is het dan?");
        return [...new Set([`kwart over ${uur}`, `half ${volgend(uur)}`, `kwart over ${volgend(uur)}`])];
      }
      if (x?.startsWith("half")) {
        k.pas({ pil: "minuut" });
        await tipDan(l, ["Bij half staat de [[m:minutenwijzer]] op de 6.", "Deze staat op de 3."], ["Hoe laat is het dan?"]);
      } else {
        k.pas({ pil: "uur" });
        await tipDan(l, [x === null ? "Een tip." : "Bijna.", "Kijk naar de [[u:urenwijzer]].", "Welk getal is hij net voorbij?"], ["Hoe laat is het dan?"]);
      }
      return zonder(opties, x);
    },
    antwoord: [`Kwart over ${uur}.`, "De 3 hoort bij de [[m:minutenwijzer]].", `De [[u:urenwijzer]] staat net voorbij de ${uur}.`],
  });
  k.pas({ pil: null, randboog: null });
  return goed;
}

const kwartOver: Lesdraaiboek = {
  id: "klok-kwart-over",
  titel: "Kwart over",
  indeling: "synthesis",
  synthesis: "Telling Time · Quarter Past",
  kaarttekening: KaartKwart,

  /*
    Naar Synthesis · Quarter Past (GEDRAG-T4): een bekende tijd, een kwart
    inkleuren, een kwartier, de minutenwijzer op de 3, de urenwijzer net
    voorbij het uur, lezen, "Wil je een moeilijkere?", zetten, vooruitkijken,
    de bonus. Daarna extra klokken van dezelfde soort tot minstens 15
    (besluit 2 van de eigenaar).
  */
  async speel(l) {
    direct.add(l);
    const k = new Klok(l, u(7, 15), {}, true);
    const start = await begin(l, ["We leren de klok lezen als de minutenwijzer een kwartrondje is gegaan.", "Dat heet *kwart over*."], {
      uitleg: ["Bij kwart over staat de minutenwijzer op de 3.", "De urenwijzer staat dan net voorbij het uur."],
      proef: async () => {
        k.zet(u(6, 15));
        await l.wacht(600);
        await l.zeg("Hoe laat is het?");
        if (!(await proefvraag(l, ["kwart over 3", "kwart over 6", "half 7"], "kwart over 6"))) return false;
        k.zet(u(10, 15));
        await l.wacht(600);
        await l.zeg("En nu?");
        return proefvraag(l, ["kwart over 10", "kwart over 3", "half 11"], "kwart over 10");
      },
    });

    if (start === "leer") {
      /* Stap 2. Een tijd die je al kent (plopje). Fout: meteen het antwoord, geen tweede kans. */
      k.zet(u(4, 30));
      k.plop();
      await l.wacht(500);
      await l.zeg("Hier is een tijd die je al kent.", "Hoe laat is het?");
      const bekend = await kies(l, ["4 uur", "half 5", "half 6"], "half 5", 1);
      if (bekend === "half 5") {
        k.goed();
        await l.zeg("Half 5. " + lof(l));
      } else {
        await l.zeg("Het is half 5.", "De [[m:minutenwijzer]] staat op de 6, en de [[u:urenwijzer]] staat halverwege de 4 en de 5.");
      }
      /* Synthesis: de klok springt terug tijdens de zin. */
      k.zet(u(4));
      k.plop();
      await l.zeg("We zetten de klok terug op 4 uur.");
      await l.wacht(300);

      /* Stap 3. Een kwart inkleuren. */
      await kleurIn(l, k, 15);

      /* Stap 4. Hoeveel van het uur? */
      /* Synthesis: de urenwijzer vaag, tot de vraag over de minutenwijzer. */
      k.pas({ uurwijzer: "flets" });
      await l.zeg("De [[m:minutenwijzer]] ging dus een kwartrondje.", "Hoeveel van het uur is er voorbij?");
      await vraag(l, ["een kwartier", "een half uur", "een heel uur"], "een kwartier", {
        goedZin: ["Een kwartier.", "Een kwart van het rondje duurt een kwart van het uur."],
        fout: async (x) => {
          if (x === "een half uur") await tipDan(l, ["Ik snap wat je bedoelt.", "Een half uur is een half rondje."], ["Maar dit was maar een kwartrondje.", "Hoeveel van het uur is dat?"]);
          else if (x === "een heel uur") await tipDan(l, ["Een heel uur is een heel rondje."], ["Maar dit was maar een kwartrondje.", "Hoeveel van het uur is dat?"]);
          else await tipDan(l, ["Een tip.", "Een heel rondje is een uur."], ["Hoeveel van het uur is een kwartrondje?"]);
          /* Synthesis: bij de tweede poging zijn de foute keuze en "Weet ik niet" weg. */
          return x === null ? ["een kwartier", "een half uur"] : zonder(["een kwartier", "een half uur", "een heel uur"], x);
        },
        antwoord: ["Een kwartier.", "Een kwart van het rondje duurt een kwart van het uur."],
      });
      await l.zeg("Het is dus een kwartier na 4 uur.", "Deze tijd noemen we *kwart over 4*.");

      /* Stap 5. De minutenwijzer staat altijd op de 3: bij goed flitst een ring om de 3. */
      k.pas({ uurwijzer: "fel" });
      await l.zeg("Bij kwart over stopt de [[m:minutenwijzer]] altijd op dezelfde plek.", "Naar welk getal wijst hij?");
      await vraag(l, ["3", "6", "12"], "3", {
        ring: 3,
        ringWijzer: "minuut",
        ringTweede: true,
        toon: () => k.pas({ pil: "minuut", ring: 3, ringWijzer: "minuut" }),
        goedZin: ["De 3.", "Een kwartrondje, bij elk kwart over."],
        fout: async (x) => {
          k.pas({ pil: "minuut" });
          await tipDan(l, [x === "6" ? "Op de 6 staat hij bij half." : x === "12" ? "Op de 12 staat hij bij een heel uur." : "Een tip.", "Kijk naar de lange wijzer."], ["Naar welk getal wijst hij?"]);
          return zonder(["3", "6", "12"], x);
        },
        antwoord: ["De [[m:minutenwijzer]] wijst naar de 3."],
      });
      k.pas({ ring: null });

      /* Stap 6. De urenwijzer net voorbij het uur; de minutenwijzer vaag. */
      /* Synthesis: de minutenwijzer vaag; de pil om de urenwijzer komt pas na een fout. */
      k.pas({ pil: null, minuutwijzer: "flets", uurwijzer: "fel" });
      await l.zeg("Kijk nu naar de [[u:urenwijzer]].", "Waar staat hij?");
      const plekken = ["op de 4", "een klein stukje voorbij de 4", "halverwege de 4 en de 5"];
      await vraag(l, plekken, "een klein stukje voorbij de 4", {
        toon: () => k.pas({ randboog: { van: 4, tot: 4.25 } }),
        bijFout2: () => k.pas({ randboog: { van: 4, tot: 4.25, puls: true } }),
        goedZin: ["Een klein stukje voorbij de 4."],
        fout: async (x) => {
          k.pas({ pil: "uur" });
          if (x === "halverwege de 4 en de 5") await tipDan(l, ["Ik snap waarom je dat kiest.", "Halverwege staat hij bij half."], ["Maar er is pas een kwartier voorbij.", "Hoe ver is hij dan gekomen?"]);
          else if (x === "op de 4") await tipDan(l, ["Om 4 uur stond hij precies op de 4."], ["Maar er is een kwartier voorbij.", "Hoe ver is hij dan gekomen?"]);
          else await tipDan(l, ["Een tip.", "Er is een kwartier voorbij."], ["Hoe ver is de [[u:urenwijzer]] dan gekomen?"]);
          return x === "op de 4" ? ["een klein stukje voorbij de 4", "halverwege de 4 en de 5"] : x === null ? plekken : ["op de 4", "een klein stukje voorbij de 4"];
        },
        antwoord: ["Een klein stukje voorbij de 4.", "Er is een kwart van het uur voorbij, dus de [[u:urenwijzer]] ging een kwart van zijn weg."],
      });
      k.pas({ pil: null, inkleur: false, minuutwijzer: "fel", randboog: null });
    }

    /* Stap 7–9. Het oefenblok. Bij een fout komt er een extra klok ("Probeer deze."). */
    let fouten = 0;
    let moeilijker = false;
    /* Synthesis: na een fout eerst kwart over 7 ("Try this one."). */
    const extra = [u(7, 15), u(4, 15), u(10, 15)];
    const lees = async (t: number, opties: string[], zin: string[]) => {
      k.zet(t);
      k.plop();
      await l.wacht(500);
      await l.zeg(...zin);
      if (await toetsKwart(l, k, t, opties, true, true)) return true;
      fouten++;
      const e = extra.shift();
      if (e !== undefined) {
        /* Synthesis: de nieuwe klok staat er al bij "Probeer deze.". */
        k.zet(e);
        k.plop();
        await l.zeg("Probeer deze.");
        await l.wacht(300);
        await l.zeg("Hoe laat is het?");
        await toetsKwart(l, k, e, [`kwart over ${uurVan(e)}`, "kwart over 3", `half ${volgend(uurVan(e))}`], true, true);
      }
      return false;
    };
    await lees(u(9, 15), ["kwart over 3", "kwart over 9", "half 10"], ["Hoe laat is het?"]);

    /* De minutenwijzer verstopt (stap 8). Synthesis: daarna meteen "Wil je een moeilijkere?"; kwart over 7 en kwart over 2 staan nu bij het extra oefenen. */
    k.zet(u(5, 15));
    k.pas({ minuutwijzer: "weg" });
    k.plop();
    await l.wacht(500);
    await l.zeg("De [[u:urenwijzer]] staat een klein stukje voorbij de 5.", "Waar moet de [[m:minutenwijzer]] dan wijzen?");
    if (!(await waarMinuut(l, k, 3))) fouten++;

    /* Stap 9. "Wil je een moeilijkere?" Nee: "Nog eentje zoals deze", een gewone klok, en dan nog eens vragen. */
    const nogEen = [u(11, 15), u(6, 15)];
    for (let keer = 0; keer < 2 && !moeilijker; keer++) {
      await l.zeg("Wil je een moeilijkere?");
      const wil = await kies(l, ["Ja", "Nee"], null, 1, { weetniet: false });
      if (wil === "Ja") {
        moeilijker = true;
        await l.zeg(keer === 0 ? "Klinkt goed." : "Prima.");
      } else {
        await l.zeg("Prima.", keer === 0 ? "Nog eentje zoals deze, om zeker te weten dat je het snapt." : "Nog eentje dan.");
        const t = nogEen[keer];
        await lees(t, [`kwart over ${uurVan(t)}`, "kwart over 3", `half ${volgend(uurVan(t))}`], ["Hoe laat is het?"]);
      }
    }

    /* Stap 10. Zetten met twee wijzers (start 6 uur). Na hulp: "Nu eentje helemaal zelf." */
    await l.zeg(moeilijker ? "Dit is de moeilijkste vraag die ik voor je heb in deze les." : "Nu zet jij er een op de klok.");
    if (await halfOfKwart(l, k, u(8, 15), u(6))) await l.zeg(lof(l));
    else {
      fouten++;
      await l.zeg("Nu eentje helemaal zelf.");
      if (!(await halfOfKwart(l, k, u(2, 15), u(12)))) fouten++;
      else await l.zeg(lof(l));
    }

    /* Stap 11. Vooruitkijken: eerst kiezen, dan altijd zelf de minutenwijzer naar de 3. */
    k.zet(u(11));
    k.plop();
    await l.wacht(500);
    await l.zeg("Laten we een beetje vooruitkijken.");
    await l.zeg("Het is nu 11 uur.", "Waar staat de [[u:urenwijzer]] om kwart over 11?");
    const vooruit = ["op de 11", "een klein stukje voorbij de 11", "halverwege de 11 en de 12"];
    const voorspel = await kies(l, vooruit, "een klein stukje voorbij de 11", 1);
    /* Synthesis: hier wordt niets ingekleurd en krijgt de urenwijzer geen pil. */
    await draaiMinuut(l, k, u(11, 15), ["Tik op de 3, of sleep de [[m:minutenwijzer]] erheen.", "Kijk dan naar de [[u:urenwijzer]]."], "Minutenwijzer naar de 3.", true);
    if (voorspel === "een klein stukje voorbij de 11") {
      k.goed();
      k.pas({ randboog: { van: 11, tot: 11.25 } });
      await l.zeg(lof(l), "Net waar jij zei.");
    } else {
      fouten++;
      await l.zeg("Kijk waar hij stopte.", "Waar staat de [[u:urenwijzer]]?");
      const twee = voorspel === "op de 11" ? ["een klein stukje voorbij de 11", "halverwege de 11 en de 12"] : ["op de 11", "een klein stukje voorbij de 11"];
      await vraag(l, twee, "een klein stukje voorbij de 11", {
        weetniet: false,
        toon: () => k.pas({ randboog: { van: 11, tot: 11.25 } }),
        bijFout2: () => k.pas({ randboog: { van: 11, tot: 11.25, puls: true } }),
        goedZin: ["Net een stukje voorbij.", "Er ging een kwart van het uur voorbij, dus hij ging een kwart van zijn weg."],
        fout: async () => null,
        antwoord: ["Net een stukje voorbij de 11.", "Er ging een kwart van het uur voorbij, dus hij ging een kwart van zijn weg."],
      });
    }
    k.pas({ pil: null, inkleur: false, randboog: null });

    /* Extra klokken van dezelfde soort (besluit 2: tot minstens 15). */
    await l.zeg("Nu nog wat extra oefenen.");
    await lees(u(7, 15), ["kwart over 3", "kwart over 7", "half 8"], ["Hoe laat is het?"]);
    await lees(u(2, 15), ["kwart over 2", "half 3", "kwart over 3"], ["En deze?"]);
    await lees(u(1, 15), ["kwart over 1", "kwart over 3", "half 2"], ["Hoe laat is het?"]);
    await lees(u(4, 15), ["kwart over 4", "kwart over 5", "half 5"], ["En deze?"]);
    await lees(u(6, 15), ["kwart over 3", "kwart over 6", "half 7"], ["Hoe laat is het nu?"]);
    if (await halfOfKwart(l, k, u(3, 15), u(12))) await l.zeg(lof(l));
    else fouten++;
    if (await halfOfKwart(l, k, u(10, 15), u(7))) await l.zeg(lof(l));
    else fouten++;

    /* Korte route (Ja of Weet ik niet bij het begin): nog drie extra's, tot minstens 15 vragen. */
    if (start !== "leer") {
      await lees(u(3, 15), ["kwart over 3", "kwart over 4", "half 4"], ["Nog een paar.", "Hoe laat is het?"]);
      k.zet(u(8, 15));
      k.pas({ minuutwijzer: "weg" });
      k.plop();
      await l.wacht(500);
      await l.zeg("De [[u:urenwijzer]] staat een klein stukje voorbij de 8.", "Waar moet de [[m:minutenwijzer]] dan wijzen?");
      if (!(await waarMinuut(l, k, 3))) fouten++;
      await l.zeg("Nu de moeilijkste.");
      if (await halfOfKwart(l, k, u(6, 15), u(1))) await l.zeg(lof(l));
      else fouten++;
    }

    await l.zeg("Nu kun je kwart over lezen en zetten.");

    /* De bonus, alleen als alles goed ging (de klok draait met een eigen geluid). */
    if (fouten === 0) {
      speelLesgeluid("klokDraai");
      await k.draai(u(12, 15));
      await l.zeg("Je had alles goed, dus hier is nog een extra vraag.", "Hoe laat is het op deze klok?");
      await toetsKwart(l, k, u(12, 15), ["kwart over 1", "kwart over 3", "kwart over 12"], false, true);
      await l.zeg("Net een stukje voorbij het hoogste punt.");
    }

    /* Wie de moeilijkere koos, hoort dat aan het eind (wacht op de pijl). */
    if (moeilijker) {
      await l.zeg("Wat goed dat je de moeilijkere vragen kiest.", "Jij durft wel!");
      await verder(l);
    }

    await kaartEinde(l, fouten, "Heel knap gedaan.");
  },
};

/* =====================================================================
   Tweede bouwronde — hulpjes voor de nieuwe lessen
   ===================================================================== */

/** De digitale tijd: "2:35". */
const digitaal = (t: number) => `${uurVan(t)}:${String(mod(t, 60)).padStart(2, "0")}`;

/** Hoe je de tijd in het Nederlands zegt: "3 uur", "half 4", "10 over half 8". */
function tijdnaam(t: number): string {
  const m = mod(t, 60);
  const h = uurVan(t);
  const n = volgend(h);
  const namen: Record<number, string> = {
    0: `${h} uur`,
    5: `5 over ${h}`,
    10: `10 over ${h}`,
    15: `kwart over ${h}`,
    20: `10 voor half ${n}`,
    25: `5 voor half ${n}`,
    30: `half ${n}`,
    35: `5 over half ${n}`,
    40: `10 over half ${n}`,
    45: `kwart voor ${n}`,
    50: `10 voor ${n}`,
    55: `5 voor ${n}`,
  };
  return namen[m] ?? digitaal(t);
}

/**
 * De minutenwijzer verder zetten tot `doel`. Hij kan niet verder dan het doel
 * (zoals bij Synthesis). Met `tussenstap` mag het kind in stapjes gaan: een
 * stap die nog niet ver genoeg is krijgt de eerste keer geen reactie.
 */
async function minuutVerder(
  l: Lesgids,
  k: Klok,
  doel: number,
  o: {
    hint: string[];
    ring?: number | null;
    alleenGetal?: boolean;
    tussenstap?: boolean;
    /** Na 2× niet goed: een cirkel om het goede getal, en alleen dat getal werkt nog (ALGEMENE HULPREGELS). */
    cirkelNa2?: boolean;
  },
): Promise<boolean> {
  const start = k.nu;
  k.pas({
    actief: true,
    beweegbaar: "minuut",
    grens: { van: start, tot: doel },
    klem: true,
    pil: "minuut",
    ring: o.ring ?? null,
    alleenGetal: o.alleenGetal ? (o.ring ?? null) : null,
  });
  let stil = !!o.tussenstap;
  let hints = 0;
  for (let poging = 1; ; poging++) {
    haak({ soort: "minuut", doel, poging, klem: true }, poging === 1);
    const g = await l.wachtOpVlak<Klokmelding>(["gezet", "mis"]);
    haak(null);
    k.nu = g.tijd;
    if (g.soort === "gezet" && g.tijd === doel) break;
    if (g.soort === "gezet" && stil && g.tijd > start) {
      stil = false;
      continue;
    }
    k.pas({ actief: false });
    hints++;
    if (o.cirkelNa2 && hints >= 2) {
      const getal = mod(doel, 60) / 5 || 12;
      k.pas({ ring: getal, alleenGetal: getal });
      await l.zeg(`Tik op de ${getal}, in de cirkel.`);
    } else await l.zeg(...o.hint);
    k.pas({ actief: true });
  }
  k.goed();
  k.pas({ actief: false, beweegbaar: null, grens: null, klem: false, pil: null, ring: null, alleenGetal: null });
  return hints === 0;
}

/** Zo beweeg je de wijzers (uitleg uit de toets van Synthesis). */
async function uitlegWijzers(l: Lesgids) {
  await l.zeg("Er zijn twee manieren om de wijzers te bewegen.", "Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.");
  await verder(l);
  await l.zeg("Je mag een wijzer ook slepen.", "Sleep je de minutenwijzer, dan draait de urenwijzer mee.");
  await verder(l);
}

/** Een toetsvraag: de klok aflezen. Geen uitleg; geeft terug of het goed was en wat er gekozen is. */
async function leesToets(l: Lesgids, k: Klok, t: number, vraagzin: string[], opties: string[], goedZin: string): Promise<{ goed: boolean; keuze: string | null }> {
  k.zet(t);
  await l.wacht(500);
  await l.zeg(...vraagzin);
  const keuze = await kies(l, opties);
  const goed = keuze === tijdnaam(t);
  if (goed) await l.zeg(goedZin);
  return { goed, keuze };
}

/** Een toetsvraag: de klok zelf zetten met beide wijzers, en dan het vinkje. */
async function zetToets(l: Lesgids, k: Klok, doel: number, opdracht: string[], hulp: string[], goedZin: string): Promise<{ goed: boolean; tijd: number }> {
  await l.zeg(...opdracht);
  k.pas({ actief: true, beweegbaar: "beide", controle: true });
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>(["controle", "hulp"]);
    k.nu = g.tijd;
    if (g.soort === "hulp") {
      k.pas({ actief: false });
      await l.zeg(...hulp);
      k.pas({ actief: true });
      continue;
    }
    k.pas({ actief: false, beweegbaar: null, controle: false });
    const goed = zelfde(g.tijd, doel);
    if (goed) await l.zeg(goedZin);
    return { goed, tijd: g.tijd };
  }
}

const HULP_HEEL = ["Tik op de urenwijzer.", "Tik dan op een getal.", "Of sleep de oranje urenwijzer erheen."];
const HULP_HALF = ["Tik op een wijzer om hem te kiezen.", "Tik dan waar hij heen moet.", "Bij half staat de minutenwijzer op de 6."];

/* ---------- kaarten voor de nieuwe lessen ---------- */

function Kaarttekst({ x, y, kleur, maat, children }: { x: number; y: number; kleur: string; maat: number; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={maat} fontWeight={800} fill={kleur} style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
      {children}
    </text>
  );
}

function KaartWekker() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={42} y={56} width={160} height={92} rx={22} stroke="#e6e8ee" strokeWidth={3.2} />
      <rect x={56} y={68} width={132} height={68} rx={12} stroke="#e6e8ee" strokeWidth={2.4} />
      <path d="M70 160h22M152 160h22" stroke="#e6e8ee" strokeWidth={5} />
      <Kaarttekst x={98} y={103} kleur="#4b8af5" maat={40}>
        9
      </Kaarttekst>
      <circle cx={122} cy={93} r={3.5} fill="#e6e8ee" />
      <circle cx={122} cy={113} r={3.5} fill="#e6e8ee" />
      <Kaarttekst x={156} y={103} kleur="#ef5d8a" maat={40}>
        00
      </Kaarttekst>
    </g>
  );
}

function KaartToets() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x} y2={KM.y - 50} stroke={MINUUTKLEUR} strokeWidth={5} />
        <line x1={KM.x} y1={KM.y} x2={KM.x + 30} y2={KM.y - 6} stroke={UURKLEUR} strokeWidth={8} />
      </Kaartklok>
      <path d="M170 128l14 14 28-34" fill="none" stroke="#3fb34f" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function KaartRace() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M70 48a26 26 0 0 1 38-8M174 48a26 26 0 0 0-38-8" stroke="#f4bb3a" strokeWidth={6} />
      <circle cx={122} cy={100} r={58} stroke="#e6e8ee" strokeWidth={3.2} />
      <circle cx={122} cy={100} r={44} stroke="#b98cf5" strokeWidth={5} strokeDasharray="200 90" transform="rotate(-90 122 100)" />
      <path d="M86 152l-10 14M158 152l10 14" stroke="#e6e8ee" strokeWidth={5} />
      <Kaarttekst x={122} y={102} kleur="#cfe2ff" maat={30}>
        1:00
      </Kaarttekst>
    </g>
  );
}

function KaartVijven() {
  return (
    <>
      <Kaartklok>
        <line x1={KM.x} y1={KM.y} x2={KM.x - 26} y2={KM.y + 44} stroke={MINUUTKLEUR} strokeWidth={5} />
      </Kaartklok>
      <Kaarttekst x={200} y={60} kleur="#ef5d8a" maat={44}>
        5
      </Kaarttekst>
    </>
  );
}

function KaartLater() {
  return (
    <>
      <Arcering id="klok-kaart-later" pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 0 1 ${KM.x + 30} ${KM.y - KM.r + 13} Z`} kleuren={["#4561dc", "#8a2fb0"]} />
      <Kaartklok />
      <Kaarttekst x={200} y={60} kleur="#ef5d8a" maat={36}>
        +5
      </Kaarttekst>
    </>
  );
}

function KaartSamen() {
  return (
    <>
      <Arcering
        id="klok-kaart-samen"
        pad={`M${KM.x} ${KM.y} V${KM.y - KM.r + 6} A${KM.r - 6} ${KM.r - 6} 0 1 1 ${KM.x - KM.r + 6} ${KM.y} Z`}
        kleuren={["#8a2fb0", "#4561dc"]}
      />
      <Kaartklok />
      <Kaarttekst x={204} y={60} kleur="#ef5d8a" maat={34}>
        45
      </Kaarttekst>
    </>
  );
}

/* =====================================================================
   Instaptoets: klokkijken (Assessment, groep 3-deel)
   ===================================================================== */

const instaptoets: Lesdraaiboek = {
  id: "klok-instaptoets",
  titel: "Instaptoets: klokkijken",
  synthesis: "Telling Time · Assessment (groep 3-deel)",
  kaarttekening: KaartToets,

  async speel(l) {
    const k = new Klok(l, u(3));
    await l.zeg("In deze lessen leer je klokkijken.", "Op een klok met wijzers.", "Kun je dat al?");
    const al = await kies(l, ["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Goed." : "Geen probleem.", "We kijken eerst wat je al weet.", "Doe maar wat je kunt.");
    await verder(l);
    let fouten = 0;

    /* Een heel uur aflezen. Bij een fout nog een van dezelfde soort. */
    let r = await leesToets(l, k, u(1), ["Hoe laat is het?"], ["half 2", "12 uur", "2 uur", "1 uur"], "Klopt.");
    if (!r.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await leesToets(l, k, u(10), ["Hoe laat is het?"], ["half 11", "12 uur", "11 uur", "10 uur"], "Klopt.")).goed) fouten++;
    }

    /* Een heel uur zetten. */
    await uitlegWijzers(l);
    let z = await zetToets(l, k, u(2), ["Laat 2 uur zien."], HULP_HEEL, "Zo is het goed.");
    if (!z.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await zetToets(l, k, u(7), ["Laat 7 uur zien."], HULP_HEEL, "Zo is het goed.")).goed) fouten++;
    }

    /* Half aflezen. De afleiders zijn de Nederlandse valkuilen. */
    r = await leesToets(l, k, u(1, 30), ["Hoe laat is het nu?"], ["half 1", "half 2", "1 uur", "6 uur"], "Mooi.");
    if (!r.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await leesToets(l, k, u(7, 30), ["Hoe laat is het nu?"], ["half 7", "half 8", "7 uur", "6 uur"], "Mooi.")).goed) fouten++;
    }

    /* Half zetten. */
    z = await zetToets(l, k, u(4, 30), ["Laat half 5 zien."], HULP_HALF, "Klopt.");
    if (!z.goed) {
      fouten++;
      await l.zeg("Oké.", "Nog eentje zo.");
      if (!(await zetToets(l, k, u(10, 30), ["Laat half 11 zien."], HULP_HALF, "Klopt.")).goed) fouten++;
    }

    const tik = l.kaart();
    if (fouten === 0) {
      await l.zeg(l.naam ? `Mooi gedaan, ${l.naam}!` : "Mooi gedaan!", "Je kunt al hele en halve uren lezen.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg(l.naam ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "In de lessen oefenen we samen verder.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

/* =====================================================================
   De digitale klok (The Counting Clock, groep 3-deel)
   ===================================================================== */

/** Wachten tot de wekker op `doel` staat (het kind drukt op de uurknop). */
async function wachtOpWekker(l: Lesgids, doel: number) {
  for (;;) {
    const g = await l.wachtOpVlak<Klokmelding>("uur");
    if (g.tijd >= doel) return;
  }
}

/** "Hoe laat is het?" bij een heel uur op de wekker. Bij een fout geen tweede poging, maar het antwoord met de reden. */
async function wekkerLezen(l: Lesgids, uur: number, opties: string[]): Promise<boolean> {
  const keuze = await kies(l, opties);
  if (keuze === `${uur} uur`) {
    await l.zeg("Ja.", `Het is ${uur} uur.`);
    return true;
  }
  l.pasVlakAan<WekkerProps>({ rand: "uur" });
  if (keuze) await l.zeg("Kijk goed naar de urenkant.", `Daar staat geen ${keuze.replace(" uur", "")}.`);
  else await l.zeg("Geen zorgen.");
  await l.zeg(`Het is ${uur} uur.`, `De urenkant zegt ${uur}.`, "De minutenkant zegt: nul minuten erbij.");
  await verder(l);
  l.pasVlakAan<WekkerProps>({ rand: null });
  return false;
}

const digitaleKlok: Lesdraaiboek = {
  id: "klok-digitale-klok",
  titel: "De digitale klok",
  synthesis: "Telling Time · The Counting Clock (groep 3-deel)",
  kaarttekening: KaartWekker,

  async speel(l) {
    const w = (p: Partial<WekkerProps>) => l.pasVlakAan<WekkerProps>(p);
    l.vlak<WekkerProps>(Wekker, { stand: { tijd: u(7) }, kiezen: true, actief: false });
    await l.zeg("Tik op de klok die je wilt.", "Het maakt niet uit welke.");
    w({ actief: true });
    const { keuze } = await l.wachtOpVlak<Vlakgebeurtenis & { keuze: number }>("gekozen");
    w({ kiezen: false, keuze, actief: false });
    await l.wacht(500);
    await weetJeHet(l, "We gaan leren hoe je een klok als deze leest.", "Zo'n klok zit in een magnetron of in een auto.");

    /* 1. Wat duurt een minuut? */
    await l.zeg("Eén minuut is een korte tijd.", "Ongeveer zo lang als een liedje zingen.");
    await verder(l);
    await l.zeg("Welke duurt ongeveer een minuut?");
    await vraag(l, ["één keer knipperen", "een liedje zingen", "een hele nacht slapen"], "een liedje zingen", {
      goedZin: ["Klopt.", "Dat duurt ongeveer een minuut."],
      fout: async (x) => {
        if (x === "één keer knipperen") await l.zeg("Knipperen gaat veel sneller dan een minuut.");
        else if (x === "een hele nacht slapen") await l.zeg("Slapen duurt veel langer dan een minuut.");
        else await l.zeg("Geen zorgen.");
        return null;
      },
      antwoord: ["Een liedje zingen duurt ongeveer een minuut."],
    });

    /* 2. De urenkant en de minutenkant. */
    w({ rand: "uur" });
    await l.zeg("Kijk naar de klok.", "Links staat het uur, in oranje.", "Dat is de urenkant.");
    await verder(l);
    w({ rand: "minuut" });
    await l.zeg("Rechts staan de minuten, in paars.", "Dat is de minutenkant.");
    await verder(l);

    /* 3. De oranje knop: elke druk een heel uur. */
    w({ rand: null, uurknop: true, tot: u(8) });
    await l.zeg("Hier is een ronde oranje knop.", "Elke druk telt er een heel uur bij.", "Druk één keer.");
    w({ actief: true });
    await wachtOpWekker(l, u(8));
    w({ actief: false, rand: "minuut" });
    await l.zeg("Eén druk, en er ging een heel uur voorbij.", "De minutenkant zegt nog steeds 00.", "Dus is het weer een heel uur.");
    await verder(l);
    await l.zeg("De minutenkant zegt 00.", "Nul minuten: precies het uur.", "Dus hoe laat is het?");
    w({ rand: null });
    let fouten = 0;
    if (!(await wekkerLezen(l, 8, ["7 uur", "8 uur", "9 uur"]))) fouten++;

    w({ tot: u(9) });
    await l.zeg("Druk nog een keer.");
    w({ actief: true });
    await wachtOpWekker(l, u(9));
    w({ actief: false });
    await l.zeg("Hoe laat is het nu?");
    if (!(await wekkerLezen(l, 9, ["8 uur", "9 uur", "10 uur"]))) fouten++;

    w({ tot: u(12) });
    await l.zeg("Houd de knop nu ingedrukt.", "Hij gaat steeds sneller.", "Hij stopt vanzelf bij 12 uur.");
    w({ actief: true });
    await wachtOpWekker(l, u(12));
    w({ actief: false });
    await l.wacht(400);
    await l.zeg("Hoe laat is het?");
    if (!(await wekkerLezen(l, 12, ["11 uur", "12 uur", "1 uur"]))) fouten++;

    w({ uurknop: false, stand: { tijd: u(3) } });
    await l.wacht(500);
    await l.zeg("Probeer deze.", "Hoe laat is het op deze klok?");
    if (!(await wekkerLezen(l, 3, ["4 uur", "2 uur", "3 uur"]))) fouten++;

    await l.zeg("Klokken als deze heten *digitale klokken*.", "En jij kunt nu elk heel uur lezen.");
    await verder(l);
    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Tellen in vijven (The Five-Minute Secret, groep 3-deel)
   ===================================================================== */

/** Welk minuutgetal komt er buiten de klok bij, als de minutenwijzer op getal `n` staat. */
const totGetal = (n: number) => Array.from({ length: n }, (_, i) => (i + 1) * 5);

const tellenInVijven: Lesdraaiboek = {
  id: "klok-tellen-in-vijven",
  titel: "Tellen in vijven",
  synthesis: "Telling Time · The Five-Minute Secret (groep 3-deel)",
  kaarttekening: KaartVijven,

  async speel(l) {
    const k = new Klok(l, u(7, 35));
    await weetJeHet(l, "We gaan tellen in vijven, op de klok.");

    /* 1. Elk streepje is één minuut. */
    k.zet(u(7));
    await l.wacht(600);
    k.pas({ uurwijzer: "flets" });
    await l.zeg("Kijk naar de kleine streepjes rond de klok.", "Elk streepje is één minuut.");
    await verder(l);

    /* 2. Naar de 1: dat is 5 minuten. */
    await l.zeg("Zet de minutenwijzer op de 1.");
    await minuutVerder(l, k, u(7, 5), { hint: ["Tik op de 1.", "Of sleep de minutenwijzer erheen."], ring: 1, alleenGetal: true });
    await l.zeg("Mooi.", "Hoeveel minuten is de minutenwijzer net verschoven?");
    const x = await l.getal();
    if (x === 5) {
      k.pas({ streepjes: { van: 1, tot: 4 } });
      await l.zeg("Ja, 5 minuten.", "5 streepjes, dus 5 minuten.");
    } else {
      if (x === 1) {
        await l.zeg("Ik snap wat je denkt.", "Je zette hem op de 1, dat klopt.");
        await verder(l);
      } else if (x !== null) {
        await l.zeg(`Hm, het is niet ${x}.`);
      }
      k.pas({ streepjes: { van: 1, tot: 4 } });
      await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "Maar elk paars streepje is één minuut.", "Tel de streepjes van de 12 tot de 1.", "Hoeveel minuten zijn het?");
      const y = await l.getal();
      if (y === 5) await l.zeg("Ja, goed geteld.", "5 streepjes, dus 5 minuten.");
      else await l.zeg("Het zijn 5 streepjes.", "Dus 5 minuten.");
    }
    await l.zeg("Staat de minutenwijzer op de 1?", "Dan betekent de 1 dus 5 minuten.");
    k.pas({ labels: totGetal(1) });
    await verder(l);
    k.pas({ streepjes: null });

    /* 3. Naar de 2: 10 minuten. */
    await l.zeg("Zet de minutenwijzer op de 2.");
    await minuutVerder(l, k, u(7, 10), { hint: ["Tik op de 2.", "Of sleep de minutenwijzer erheen."], ring: 2, alleenGetal: true });
    await l.zeg("Hoeveel minuten is hij vanaf de 12 verschoven?");
    await vraag(l, ["2", "6", "10"], "10", {
      toon: () => k.pas({ labels: totGetal(2), streepjes: null }),
      goedZin: ["Ja, 10 minuten."],
      fout: async (keuze) => {
        k.pas({ streepjes: { van: 1, tot: 9 } });
        if (keuze === "2") {
          await l.zeg("Ik snap waarom: hij wijst naar de 2.");
          await verder(l);
          await l.zeg("Maar elk paars streepje is één minuut.", "Tel de minuten van de 12 tot de 2.", "Hoeveel tel je?");
          return ["6", "10"];
        }
        if (keuze === "6") {
          await l.zeg("Tel de streepjes nog eens.", "Van de 12 tot de 2.", "Hoeveel tel je?");
          return ["2", "10"];
        }
        await l.zeg("Geen zorgen.", "We tellen de streepjes samen.");
        return null;
      },
      antwoord: ["5 tot de 1, en nog 5 tot de 2.", "Samen 10 minuten."],
    });

    /* 4. Nu de rest zelf: 15, 20, 25, 30. */
    await l.zeg("Nu doe jij de rest.", "Zet de minutenwijzer steeds verder.", "En vertel hoeveel minuten het zijn.");
    await verder(l);
    const stappen: { n: number; opties: string[]; vraagzin: string; goedZin: string[] }[] = [
      { n: 3, opties: ["3", "11", "15"], vraagzin: "Hoeveel minuten zijn het nu?", goedZin: ["15.", "Dat is kwart over 7."] },
      { n: 4, opties: ["4", "16", "20"], vraagzin: "Hoeveel minuten na 7 uur is het nu?", goedZin: ["Ja, 20."] },
      { n: 5, opties: ["5", "21", "25"], vraagzin: "En hoeveel minuten nu?", goedZin: ["Klopt, 25."] },
      { n: 6, opties: ["6", "26", "30"], vraagzin: "En nu?", goedZin: ["30.", "Dat is half 8."] },
    ];
    for (const st of stappen) {
      await l.zeg(`Zet de minutenwijzer op de ${st.n}.`);
      await minuutVerder(l, k, u(7, st.n * 5), { hint: [`Tik op de ${st.n}.`, "Of sleep de minutenwijzer erheen."], ring: st.n, alleenGetal: true });
      await l.zeg(st.vraagzin);
      const goed = String(st.n * 5);
      await vraag(l, st.opties, goed, {
        toon: () => k.pas({ labels: totGetal(st.n) }),
        goedZin: st.goedZin,
        fout: async (keuze) => {
          if (keuze === String(st.n)) {
            await l.zeg(`Hij wijst wel naar de ${st.n}.`, "Maar elk getal is 5 minuten.", `Tel in vijven verder vanaf ${st.n * 5 - 5}.`);
          } else if (keuze !== null) {
            await l.zeg("Elk getal is 5 minuten.", `Tel in vijven verder vanaf ${st.n * 5 - 5}.`);
          } else {
            await l.zeg("Geen zorgen.");
            return null;
          }
          return zonder(st.opties, keuze);
        },
        antwoord: [`${st.n * 5 - 5}, en nog 5 erbij.`, `Dat is ${goed}.`],
      });
    }

    /* 5. Welk getal komt er steeds bij? */
    await l.zeg(l.naam ? `Hé ${l.naam}, je doet het goed!` : "Hé, je doet het goed!", "We doen er steeds hetzelfde getal bij.", "Welk getal?");
    await vraag(l, ["1", "5", "10"], "5", {
      goedZin: ["Dat klopt.", "Rond de klok tellen we in vijven."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === null) return geenZorgen(l, keuze);
        await l.zeg("Kijk naar de getallen buiten de klok.", "5, 10, 15, 20, 25, 30.", "Wat komt er steeds bij?");
        return zonder(["1", "5", "10"], keuze);
      },
      antwoord: ["Er komt steeds 5 bij.", "Rond de klok tellen we in vijven."],
    });

    /* 6. Een sprong naar de 9: tel in vijven door. */
    await k.draai(u(7, 45));
    await l.zeg("De minutenwijzer sprong naar de 9.", "Tel in vijven verder vanaf de 6.", "Hoeveel minuten zijn het nu?");
    await vraag(l, ["9", "35", "45"], "45", {
      toon: () => k.pas({ labels: totGetal(9) }),
      goedZin: ["Ja, 45.", "Dat is kwart voor 8."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === "35") {
          await l.zeg("Veel kinderen kiezen die.", "Je telde er maar één keer 5 bij.");
          await verder(l);
          await l.zeg("Maar de 9 is 3 getallen na de 6.", "Dus 3 keer 5 erbij: 35, 40, 45.", "Hoeveel minuten zijn het nu?");
          return ["35", "45"];
        }
        if (keuze === "9") {
          await l.zeg("Hij wijst wel naar de 9.", "Maar elk getal is 5 minuten.", "Tel in vijven: 30, 35, 40, 45.", "Hoeveel minuten zijn het?");
          return ["9", "45"];
        }
        return geenZorgen(l, keuze);
      },
      antwoord: ["Vanaf 30 tellen we door: 35, 40, 45.", "Het zijn 45 minuten."],
    });

    /* 7. Terug bij de 12: een heel uur. */
    await k.draai(u(8));
    await l.zeg("De minutenwijzer is terug bij de 12.", "Hoeveel minuten duurt de hele ronde?");
    await vraag(l, ["0", "12", "60"], "60", {
      toon: () => k.pas({ labels: [0, ...totGetal(11)] }),
      goedZin: ["60.", "Een heel uur.", "Bij de 12 staat 00, want daar begint het tellen opnieuw."],
      verder: true,
      fout: async (keuze) => {
        if (keuze === "12") await l.zeg("Er staan 12 getallen op de klok.", "Maar elk getal is 5 minuten.", "Tel door in vijven: 50, 55 …");
        else if (keuze === "0") await l.zeg("Bij de 12 begint het tellen opnieuw.", "Maar hoeveel minuten waren het helemaal rond?");
        else return geenZorgen(l, keuze);
        return zonder(["0", "12", "60"], keuze);
      },
      antwoord: ["Na 55 komt 60.", "Een hele ronde is 60 minuten: een heel uur."],
    });

    /* 8. De klok is een getallenlijn die in vijven telt, rondgebogen. */
    k.pas({ uurwijzer: "fel", vorm: "lijn", lijnMinuten: true });
    await l.wacht(1300);
    await l.zeg("Kijk, een getallenlijn die in vijven telt.", "Een klok is zo'n lijn, maar dan in een cirkel.");
    await verder(l);
    k.pas({ vorm: "klok" });
    await l.wacht(1300);
    await l.zeg("Nu kun je op de klok tellen in vijven.");
    await verder(l);

    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "5, 10, 15 … tot 60.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* =====================================================================
   Eindtoets: klokkijken (Mastery Check, groep 3-deel)
   ===================================================================== */

const eindtoets: Lesdraaiboek = {
  id: "klok-eindtoets",
  titel: "Eindtoets: klokkijken",
  synthesis: "Telling Time · Mastery Check (groep 3-deel)",
  kaarttekening: KaartToets,

  async speel(l) {
    const k = new Klok(l, u(3));
    await l.zeg("In deze lessen leer je klokkijken.", "Op een klok met wijzers.", "Kun je dat al?");
    const al = await kies(l, ["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Goed." : "Geen probleem.", "We doen een korte toets.", "Dan zien we wat je al kunt.");
    await verder(l);

    /* Bij één fout komt er een herkansing van dezelfde soort; bij de tweede fout stopt de toets. */
    let fouten = 0;
    const mis: string[] = [];
    let gestopt = false;

    type Stap = () => Promise<{ goed: boolean; reactie: string }>;
    const met = async (soort: string, eerste: Stap, herkansing: Stap) => {
      if (gestopt) return;
      let r = await eerste();
      if (r.goed) return;
      fouten++;
      if (!mis.includes(soort)) mis.push(soort);
      if (fouten >= 2) {
        gestopt = true;
        await l.zeg(r.reactie);
        return;
      }
      await l.zeg(r.reactie, "Nog eentje zo.");
      r = await herkansing();
      if (r.goed) return;
      fouten++;
      gestopt = true;
      await l.zeg(r.reactie);
    };

    const lees = (t: number, opties: string[], goedZin: string): Stap => async () => {
      const r = await leesToets(l, k, t, ["Hoe laat is het?"], opties, goedZin);
      return { goed: r.goed, reactie: r.keuze ? `${r.keuze.charAt(0).toUpperCase()}${r.keuze.slice(1)}?` : "Hm." };
    };
    const zet = (doel: number, hulp: string[], goedZin: string): Stap => async () => {
      const r = await zetToets(l, k, doel, [`Laat ${tijdnaam(doel)} zien.`], hulp, goedZin);
      return { goed: r.goed, reactie: `Dat is ${tijdnaam(r.tijd)}.` };
    };

    await l.zeg("Nu een klok met wijzers.");
    await met("heel", lees(u(8), ["8 uur", "12 uur", "9 uur", "half 9"], "Klopt."), lees(u(2), ["half 3", "12 uur", "2 uur", "3 uur"], "Goed."));
    if (!gestopt) await uitlegWijzers(l);
    await met("heel", zet(u(5), HULP_HEEL, "Zo is het goed."), zet(u(10), HULP_HEEL, "Zo is het goed."));
    await met("half", lees(u(4, 30), ["half 4", "half 5", "4 uur", "6 uur"], "Mooi."), lees(u(8, 30), ["half 8", "half 9", "8 uur", "6 uur"], "Mooi."));
    await met("half", zet(u(5, 30), HULP_HALF, "Klopt."), zet(u(2, 30), HULP_HALF, "Klopt."));

    const tik = l.kaart();
    if (!gestopt && fouten === 0) {
      await l.zeg(l.naam ? `Mooi gedaan, ${l.naam}!` : "Mooi gedaan!", "Je kunt hele en halve uren lezen en zetten.", "Tik op de kaart om hem af te vinken.");
    } else if (!gestopt) {
      await l.zeg(l.naam ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "Je miste er maar één.", "Tik op de kaart om hem af te vinken.");
    } else {
      const namen = [...(mis.includes("heel") ? ["De urenwijzer", "Hele uren zetten"] : []), ...(mis.includes("half") ? ["Halve uren"] : [])];
      const lessen = namen.length > 1 ? `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}` : namen[0];
      await l.zeg(
        "We doen eerst een stapje terug.",
        namen.length > 1 ? "Oefen nog even met deze lessen:" : "Oefen nog even met deze les:",
        `${lessen}.`,
        "Daarna doe je de toets opnieuw.",
      );
      await verder(l);
      await l.zeg("Tik op de kaart om voor nu te stoppen.");
    }
    await tik;
  },
};

/* =====================================================================
   Versla de wekker (Beat the Alarm, groep 3-deel)
   ===================================================================== */

const verslaDeWekker: Lesdraaiboek = {
  id: "klok-versla-de-wekker",
  titel: "Versla de wekker",
  synthesis: "Telling Time · Beat the Alarm (groep 3-deel)",
  kaarttekening: KaartRace,

  async speel(l) {
    l.vlak<WekkerraceProps>(Wekkerrace, { naam: l.naam, actief: false });
    await l.zeg("Hoeveel klokken kun je lezen voordat de wekker afgaat?", "Je hebt één minuut.", "Tik op Start.");
    l.pasVlakAan<WekkerraceProps>({ actief: true });
    await l.wachtOpVlak("start");
    /* Tijdens de race geen oude zin in beeld. */
    await l.zeg();
    for (;;) {
      l.pasVlakAan<WekkerraceProps>({ actief: false });
      const uit = await l.wachtOpVlak<Vlakgebeurtenis & { goed: number; nieuw: boolean }>("klaar");
      await l.zeg(
        "De tijd is om!",
        uit.goed === 0 ? "Je had er nog geen goed." : uit.goed === 1 ? "Je had er 1 goed." : `Je had er ${uit.goed} goed.`,
        uit.nieuw ? "Dat is een nieuw record!" : "",
        "Nog een keer, of ben je klaar?",
      );
      l.pasVlakAan<WekkerraceProps>({ actief: true });
      const keuze = await l.wachtOpVlak(["opnieuw", "stop"]);
      if (keuze.soort === "stop") break;
      await l.zeg();
    }
    l.pasVlakAan<WekkerraceProps>({ actief: false });
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gespeeld, ${l.naam}!` : "Goed gespeeld!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* =====================================================================
   5 en 10 minuten later (How Long It Takes: Five en Ten Minutes Later, groep 3-deel)
   Gedrag naar SYNTHESIS-ANALYSE/GEDRAG-T5-minuten-later.md (28 oktober 2026).
   ===================================================================== */

/**
 * Bij 2× fout (Synthesis: "Let's count it on the clock."): het vlaggetje gaat
 * naar de tijd van nu. Bij 5 minuten vanaf een getal tikt het kind zelf het
 * volgende getal; anders draait Bliepo de minutenwijzer, 5 of 10 minuten per
 * keer, en het kind kijkt naar de cijfers. Dan "Dan is het dus 2:45." en wachten
 * op de pijl. Het vlaggetje en de boog van de opgave komen terug.
 */
async function telOpDeKlok(l: Lesgids, k: Klok, van: number, stap: number) {
  const doel = van + stap;
  const per = stap % 10 === 0 ? 10 : 5;
  /*
    Synthesis: het eindantwoord pas na het tellen (niet vooraf verklappen). Het
    vlaggetje gaat naar de tijd van nu, met de '0' erbij; de boog groeit mee
    terwijl er geteld wordt. (De oude zin "Van 2:40 naar 2:45." is vervallen,
    29 oktober 2026.)
  */
  /* Synthesis: tijdens de zin alleen het vlaggetje (met de pil om de minutenwijzer); de '0' en de boog komen met de opdracht. */
  k.pas({ boog: null, vlag: van, pil: "minuut" });
  k.plop();
  await l.zeg("We tellen het samen op de klok.");
  k.pas({ boog: { van, stap: per } });
  if (stap === 5 && mod(van, 5) === 0) {
    const getal = mod(doel, 60) / 5 || 12;
    await minuutNaar(l, k, doel, { kop: "Tik op het volgende getal.", hint: [`Tik op de ${getal} op de klok.`], boog: "eigen" });
  } else {
    await l.zeg(`Kijk naar de cijfers terwijl de [[m:minutenwijzer]] draait, ${per} minuten per keer.`);
    for (let t = van + per; t <= doel; t += per) {
      await k.draai(t);
      speelLesgeluid("wijzerKlik");
    }
  }
  /* De pil om de minutenwijzer hoort bij het samen tellen; daarna weer weg (Synthesis heeft hem niet bij de volgende vragen). */
  k.pas({ pil: null });
  await l.zeg(`Dan is het dus ${digitaal(doel)}.`);
  await verder(l);
  if (k.vlagNu !== null) k.pas({ vlag: k.vlagNu, boog: k.boogNu ? { van: k.vlagNu, stap: k.boogNu } : null });
  else k.pas({ vlag: null, boog: null });
}

/**
 * "Hoe laat is het 5 (10, 15, 25, 30) minuten later?" Zoals Synthesis: goed =
 * lof, en Bliepo draait zelf de minutenwijzer door (de boog groeit). 1× fout:
 * twee zinnen (de eerste gaat vanzelf, de tweede wacht op de pijl) en dan de
 * vraag anders gesteld met 3 knoppen. 2× fout: samen tellen op de klok.
 * Een antwoord als 2:60 of 3:68 krijgt: een klok telt niet tot 60, na 2:59
 * komt 3:00; bij 10 minuten eerst de tussenvraag "wat zegt de klok bij de 12?".
 */
async function hoeLaatLater(
  l: Lesgids,
  k: Klok,
  van: number,
  opties: string[],
  goedZin: string,
  o: { stap?: number; terug?: boolean; weetniet?: boolean } = {},
): Promise<boolean> {
  const stap = o.stap ?? 5;
  const doel = van + stap;
  const goed = digitaal(doel);
  const getallen = stap / 5 === 1 ? "één getal" : `${stap / 5} getallen`;
  const nu = mod(van, 60);
  const uur = uurVan(van);
  const daarna = volgend(uur);
  const opnieuw = [`Het is ${digitaal(van)}, en er gaan ${stap} minuten voorbij.`, "Hoe laat is het dan?"];
  const uitslag = await vraag(l, opties, goed, {
    /* Synthesis heeft "Weet ik niet" alleen bij de eerste keuzevraag van elke klok. */
    weetniet: o.weetniet ?? true,
    snel: true,
    toon: () => {
      toonBoog(k);
      if (!zelfde(k.nu, doel)) void k.draai(doel).then(() => speelLesgeluid("wijzerKlik"));
    },
    goedZin: [goedZin],
    fout: async (x) => {
      const minuten = x === null ? -1 : Number(x.split(":")[1]);
      if (x === digitaal(van + 1)) {
        await l.zeg("Ik snap wat je bedoelt.", "Eén klein streepje is 1 minuut, dat klopt.");
        await tipDan(l, [`Maar ${stap} minuten later is ${stap} streepjes verder, niet 1.`], opnieuw);
      } else if (x !== null && minuten >= 60) {
        await l.zeg("Ik snap waarom je dat kiest.", `${nu} en ${stap} erbij is ${nu + stap} minuten, en je optelling klopt.`);
        if (stap === 10) {
          await tipDan(l, [`Maar een klok telt niet tot ${nu + stap} minuten.`], [`Het is ${digitaal(van)}.`, "Wat zegt de klok als de [[m:minutenwijzer]] bij de 12 bovenaan komt?"]);
          const tussen = await kies(l, [`${uur}:00`, `${uur}:60`, `${daarna}:00`], `${daarna}:00`, 2, { weetniet: false });
          if (tussen === `${daarna}:00`) {
            k.goed();
            await l.zeg(lof(l));
          } else await l.zeg(`Na ${uur}:59 komt ${daarna}:00 op de klok, en dan begint een nieuw uur.`);
          await l.zeg(`Het is ${digitaal(van)}, en er gaan ${stap} minuten voorbij.`, `Onderweg zegt de klok ${daarna}:00.`, "Hoe laat is het dan?");
        } else await tipDan(l, ["Maar een klok telt niet tot 60 minuten.", `Na ${uur}:59 komt ${daarna}:00, en dan begint een nieuw uur.`], opnieuw);
      } else if (stap === 5 && x === digitaal(van + 10)) {
        await l.zeg("Dat kiezen veel kinderen.", "Dat is 10 minuten later: twee keer vijf.");
        await tipDan(l, ["Maar 5 minuten later is maar één keer vijf."], opnieuw);
      } else if (stap === 10 && x === digitaal(van + 5)) {
        await l.zeg("Dat kiezen veel kinderen.", "Dat is 5 minuten later: één getal.");
        await tipDan(l, ["Maar 10 minuten later is twee getallen verder."], opnieuw);
      } else if (x !== null && nu % 5 !== 0 && minuten % 5 === 0 && minuten > nu && minuten < nu + stap) {
        await l.zeg("Ik snap waar die vandaan komt.", `Om ${x} komt de [[m:minutenwijzer]] bij het volgende getal, dat klopt.`);
        await tipDan(l, [`Maar ${stap} minuten later is ${stap} streepjes verder, en dat gaat er voorbij.`], opnieuw);
      } else if (x === `${uur}:00` && nu + stap >= 60) {
        await l.zeg("Ik snap wat je bedoelt.", "De [[m:minutenwijzer]] komt bovenaan bij de 12, dat klopt.");
        await tipDan(l, ["Maar de minutenwijzer gaat onderweg voorbij de 12.", `Na ${uur}:59 komt ${daarna}:00, en dan begint een nieuw uur.`], opnieuw);
      } else if (x !== null) {
        await tipDan(l, ["Elk getal op de klok is 5 minuten.", `De [[m:minutenwijzer]] gaat ${getallen} verder.`], opnieuw);
      } else {
        await tipDan(l, ["Een tip.", "Elk getal op de klok is 5 minuten."], opnieuw);
      }
      return zonder(opties, x);
    },
    samenBijFout2: () => telOpDeKlok(l, k, van, stap),
    antwoord: [],
    later: o.terug
      ? async () => {
          k.pas({ boog: null, vlag: null });
          k.zet(van);
          await l.wacht(600);
          k.pas({ vlag: van, boog: { van, stap: stap >= 10 && stap !== 25 ? 10 : 5 } });
          await l.zeg(`Het is ${digitaal(van)}.`, `Hoe laat is het ${stap} minuten later?`);
          await hoeLaatLater(l, k, van, opties, "Goed zo.", { stap });
          await l.wacht(500);
        }
      : undefined,
  });
  await boogUitleg(l, k);
  return uitslag;
}

/** De minutenwijzer zelf 5 minuten verder ("Tik op het volgende getal.", "En nog 5."). Geeft terug of het zonder het handje lukte. */
function vijfVerder(l: Lesgids, k: Klok, doel: number, kop = "Tik op het volgende getal."): Promise<boolean> {
  const getal = mod(doel, 60) / 5 || 12;
  return minuutNaar(l, k, doel, { kop, hint: [`Tik op de ${getal} op de klok.`] });
}

/** Een nieuwe begintijd (twee plopjes): de klok springt erheen, met het vlaggetje (en de boog, per `boog` minuten een andere kleur) vanaf daar. */
async function nieuweTijd(l: Lesgids, k: Klok, t: number, boog: number | false, vlag = true) {
  k.pas({ boog: null, vlag: null });
  k.zet(t);
  k.plop();
  await l.wacht(500);
  /* Synthesis: in het oefenblok staat er geen vlaggetje en geen boog (alleen bij uitleg en bij een tijd tussen twee getallen). */
  k.vlagNu = vlag ? t : null;
  k.boogNu = vlag ? boog : false;
  if (!vlag) return;
  /* Synthesis: eerst alleen het vlaggetje; de boog (met de '0') komt pas bij de opdracht of als de wijzer gaat (toonBoog). */
  k.pas({ vlag: t, boog: null });
  k.plop();
  /* De eerste keer legt Bliepo uit wat het vlaggetje is (één keer per les); de boog legt hij uit als die er voor het eerst is (boogUitleg). */
  if (!k.gewezen.has("vlag")) {
    k.gewezen.add("vlag");
    await l.zeg("Het vlaggetje laat zien waar we begonnen.");
  }
}

/** De boog van de huidige opgave in beeld (vanaf het vlaggetje). */
function toonBoog(k: Klok) {
  if (k.vlagNu !== null && k.boogNu) k.pas({ boog: { van: k.vlagNu, stap: k.boogNu } });
}

/** De eerste keer dat de boog gegroeid is, zegt Bliepo wat hij betekent (één keer per les). */
async function boogUitleg(l: Lesgids, k: Klok) {
  if (k.vlagNu === null || !k.boogNu || k.gewezen.has("boog")) return;
  k.gewezen.add("boog");
  await l.zeg("De gele boog laat zien hoeveel minuten erbij komen.");
}

/**
 * Zelf zetten (Synthesis: "It's 7:10. Show 15 minutes later."): de kop, het
 * handje en het vinkje; de digitale klok is vaag. Na ±15 s niets doen komt de
 * aanwijzing. 1× fout: uitleg (bij "de klok zegt 30" de valkuil van Synthesis)
 * en wachten op de pijl; 2× fout of het handje: een ring om het goede getal.
 */
async function minutenZetten(l: Lesgids, k: Klok, van: number, plus: number): Promise<boolean> {
  const doel = van + plus;
  const getal = mod(doel, 60) / 5 || 12;
  /* Synthesis: de kop noemt de begintijd ("It's 7:10. Show 15 minutes later."). */
  const kop = `Het is ${digitaal(van)}. Laat ${plus} minuten later zien.`;
  const hint = ["Tik op een getal om de [[m:minutenwijzer]] daar te zetten, of sleep hem."];
  const open = () => k.pas({ doel: kop, actief: false, beweegbaar: "minuut", controle: true, hulpknop: true, pil: "minuut", grens: { van, tot: van + 55 }, digitaal: true, digitaalVaag: true });
  open();
  const taak = (poging: number) => ({ soort: "minuut", doel, poging, controle: true });
  await l.zeg(kop);
  k.pas({ actief: true });
  let klaar: Promise<Klokmelding> | null = wachtKlok(l, ["controle", "hulp"], taak(1), true);
  await wijsHandje(l, true);
  let fouten = 0;
  let hulp = false;
  for (let poging = 1; ; poging++) {
    const stop = hintNa(l, 15000, hint);
    const g = await (klaar ?? wachtKlok(l, ["controle", "hulp"], taak(poging), false));
    klaar = null;
    stop();
    haak(null);
    k.nu = g.tijd;
    if (g.soort === "controle" && g.tijd === doel) {
      k.goed();
      break;
    }
    /* Synthesis: tijdens de uitleg is de digitale klok weg; de wijzer kan dan niet verschuiven. */
    k.pas({ doel: null, actief: false, controle: false, hulpknop: false, beweegbaar: null, digitaal: false });
    if (g.soort === "controle") fouten++;
    if (g.soort === "hulp" || fouten >= 2) {
      hulp = true;
      k.pas({ ring: getal, ringWijzer: "minuut", ringPuls: true, beweegbaar: "minuut", digitaal: true });
      const begeleid = { soort: "minuut", doel, poging: 99 };
      await l.zeg(g.soort === "hulp" ? "Geen probleem." : "Laten we het samen doen.", `Tik op de ${getal}, of sleep de [[m:minutenwijzer]] erheen.`);
      k.pas({ actief: true });
      let tik: Promise<Klokmelding> | null = wachtKlok(l, "gezet", begeleid, false);
      for (;;) {
        const t = await (tik ?? wachtKlok(l, "gezet", begeleid, false));
        tik = null;
        haak(null);
        k.nu = t.tijd;
        if (t.tijd === doel) break;
      }
      speelLesgeluid("wijzerKlik");
      k.goed();
      k.pas({ getalKleur: { n: getal, wijzer: "minuut" } });
      break;
    }
    if (mod(g.tijd, 60) === plus % 60 && g.tijd !== doel) {
      await l.zeg("Dat kiezen veel kinderen.", `Daar zegt de klok ${plus} minuten, dat klopt.`);
      await tipDan(l, [`Maar we willen ${plus} minuten verder vanaf het begin.`, "Begin bij het vlaggetje en tel verder."], []);
    } else {
      await tipDan(l, [`Nu zegt de klok ${digitaal(g.tijd)}.`, "Elk getal op de klok is 5 minuten.", `${plus} minuten is ${plus / 5} getallen verder vanaf het vlaggetje.`], []);
    }
    open();
    await l.zeg(kop);
    k.pas({ actief: true });
    klaar = wachtKlok(l, ["controle", "hulp"], taak(poging + 1), false);
  }
  k.pas({ actief: false, beweegbaar: null, controle: false, hulpknop: false, ring: null, ringPuls: false, pil: null, grens: null, doel: null, digitaal: true, digitaalVaag: false });
  return !hulp && fouten === 0;
}

const minutenLater: Lesdraaiboek = {
  id: "klok-minuten-later",
  titel: "5 en 10 minuten later",
  indeling: "synthesis",
  synthesis: "How Long It Takes · Five Minutes Later + Ten Minutes Later",
  kaarttekening: KaartLater,

  /*
    Naar Synthesis · Five Minutes Later en Ten Minutes Later (GEDRAG-T5), na
    elkaar in één les: eerst tellen met vijven (koekjes, doortellen, over het
    uur, oefenen, de fout van Sam, grotere sprongen, zetten, bonus), dan tellen
    met tienen (zelfde opbouw met 10, 20 en 30 minuten). De digitale klok
    komt in beeld na de eerste stap (uur in de kleur van de urenwijzer, minuten
    in die van de minutenwijzer), het vlaggetje bij de begintijd en de
    tijdboog met 0 · 5 · 10 of 0 · 10 · 20 · 30 erbuiten.
  */
  async speel(l) {
    direct.add(l);
    const k = new Klok(l, u(2, 35), { digitaal: false }, true);
    let fouten = 0;
    const tel = (goed: boolean) => {
      if (!goed) fouten++;
    };
    /** De samenvatting: de minuten in de digitale klok lichten op. */
    const samenvatting = async (...zinnen: string[]) => {
      k.pas({ digitaalLicht: true });
      await l.zeg(...zinnen);
      await verder(l);
      k.pas({ digitaalLicht: false });
    };

    /* ---------- Deel 1: tellen met vijven ---------- */
    const start = await begin(l, ["We gaan uitzoeken hoe laat het over een paar minuten is.", "We tellen verder in vijven."], {
      uitleg: ["Elk getal op de klok is 5 minuten."],
      proef: async () => {
        k.pas({ digitaal: true });
        await nieuweTijd(l, k, u(5, 40), false);
        await l.zeg("Het is 5:40.", "Hoe laat is het 5 minuten later?");
        if (!(await proefvraag(l, ["5:41", "5:45", "5:50"], "5:45"))) return false;
        await nieuweTijd(l, k, u(7, 5), false);
        await l.zeg("Het is 7:05.", "En 5 minuten later?");
        return proefvraag(l, ["7:06", "7:10", "7:15"], "7:10");
      },
    });

    if (start === "leer") {
      /* 1. De koekjes: de minutenwijzer 5 minuten verder; de digitale klok komt daarna in beeld (ook na de proef nog even weg). */
      k.pas({ digitaal: false });
      await nieuweTijd(l, k, u(2, 35), 5);
      await l.zeg("Het is nu 2:35, en de koekjes van Sam zijn over 5 minuten klaar.");
      tel(await minuutNaar(l, k, u(2, 40), { kop: "Zet de minutenwijzer 5 minuten verder.", hint: ["Elk getal op de klok is 5 minuten.", "Tik dus op het volgende getal: de 8."], boog: "naTik" }));
      /* Synthesis: de digitale klok komt meteen bij de tik; daarna pas de uitleg van de boog. */
      k.pas({ digitaal: true });
      await boogUitleg(l, k);
      await l.zeg("De [[m:minutenwijzer]] ging één getal verder, en dat is 5 minuten.", "Dus om 2:40 zijn de koekjes klaar.");
      await verder(l);

      /* 2 en 3. Verder tellen met vijven. */
      await l.zeg("We blijven tellen in vijven.", "Hoe laat is het 5 minuten later?");
      tel(await hoeLaatLater(l, k, u(2, 40), ["2:09", "2:41", "2:45", "2:50"], lof(l), { terug: true }));
      await l.zeg("En hoe laat is het 5 minuten daarna?");
      tel(await hoeLaatLater(l, k, u(2, 45), ["2:10", "2:46", "2:50", "2:55"], lof(l), { terug: true }));
      await l.zeg("En nog eens 5 minuten?");
      tel(await hoeLaatLater(l, k, u(2, 50), ["2:11", "2:51", "2:55", "3:00"], lof(l), { terug: true }));
      await samenvatting("De minuten gingen van 40 naar 45, naar 50 en naar 55.", "Dat is tellen in vijven: elke 5 minuten gaat de [[m:minutenwijzer]] 5 streepjes verder.");

      /* 4. Over het uur heen. */
      await l.zeg("En 5 minuten daarna?");
      tel(await hoeLaatLater(l, k, u(2, 55), ["2:00", "2:56", "2:60", "3:00"], "Daar is het.", { terug: true }));
    } else k.pas({ digitaal: true });

    /* 5. Oefenen. Bij een fout komt er een extra klok ("Probeer deze."). */
    await l.zeg("We proberen er nog een paar.");
    const extraVijf = [[u(4, 5), ["4:06", "4:10", "4:15", "4:50"]]] as const;
    let extraN = 0;
    const metExtra = async (goed: boolean) => {
      tel(goed);
      if (goed || extraN >= extraVijf.length) return;
      const [t, opties] = extraVijf[extraN++];
      /* Synthesis: de nieuwe klok staat er al bij "Probeer deze.". */
      await nieuweTijd(l, k, t, false, false);
      await l.zeg("Probeer deze.");
      await l.zeg(`Het is nu ${digitaal(t)}.`, "Hoe laat is het 5 minuten later?");
      tel(await hoeLaatLater(l, k, t, [...opties], lof(l), {}));
    };
    await nieuweTijd(l, k, u(3, 40), false, false);
    await l.zeg("Het is nu 3:40.", "Hoe laat is het 5 minuten later?");
    await metExtra(await hoeLaatLater(l, k, u(3, 40), ["3:09", "3:41", "3:45", "3:50"], lof(l), { terug: true }));
    await nieuweTijd(l, k, u(6, 3), 5);
    await l.zeg("Het is nu 6:03.", "De minutenwijzer staat tussen twee getallen.", "Hoe laat is het 5 minuten later?");
    tel(await hoeLaatLater(l, k, u(6, 3), ["6:04", "6:05", "6:08", "6:13"], lof(l), { terug: true }));
    await l.zeg("En 5 minuten daarna?");
    tel(await hoeLaatLater(l, k, u(6, 8), ["6:09", "6:10", "6:13", "6:18"], lof(l), { terug: true }));
    await samenvatting("De minuten gingen van 3 naar 8 naar 13.", "De [[m:minutenwijzer]] gaat steeds 5 streepjes verder, ook tussen twee getallen.");

    /* 6. Zonder boog. */
    await nieuweTijd(l, k, u(1, 22), false, false);
    await l.zeg("Het is nu 1:22.", "Hoe laat is het 5 minuten later?");
    await metExtra(await hoeLaatLater(l, k, u(1, 22), ["1:23", "1:25", "1:27", "1:32"], lof(l), { terug: true }));
    await nieuweTijd(l, k, u(3, 47), false, false);
    await l.zeg("Het is 3:47.", "Hoe laat is het over 5 minuten?");
    await metExtra(await hoeLaatLater(l, k, u(3, 47), ["3:48", "3:50", "3:52", "3:57"], lof(l), { terug: true }));
    await nieuweTijd(l, k, u(6, 55), false, false);
    await l.zeg("Hier is de volgende.", "Het is 6:55.", "Hoe laat is het 5 minuten later?");
    await metExtra(await hoeLaatLater(l, k, u(6, 55), ["6:00", "6:56", "6:60", "7:00"], lof(l), { terug: true }));

    /* 7. De fout van Sam (een klein poppetje erbij, plopje). */
    await nieuweTijd(l, k, u(7, 55), false, false);
    k.pas({ sam: true });
    k.plop();
    await l.wacht(500);
    await l.zeg("Hier is mijn vriend Sam.", "Sam leert dit ook.");
    await l.zeg("Het is 7:55. Sam zegt: over 5 minuten is het 7 uur 60.", "Heeft Sam gelijk?");
    const gelijk = await kies(l, ["Ja", "Nee"], "Nee", 1, { weetniet: false });
    if (gelijk === "Nee") {
      k.goed();
      await l.zeg(lof(l));
    } else {
      fouten++;
      await l.zeg("Ik snap waarom je dat kiest.", "55 en 5 is 60, dat klopt.");
      await tipDan(l, ["Maar een klok telt niet tot 60 minuten.", "Na 7:59 komt 8:00."], []);
    }
    await l.zeg("Wat zegt de klok dan over 5 minuten?");
    tel(await hoeLaatLater(l, k, u(7, 55), ["7:00", "7:56", "8:00"], lof(l), { terug: true }));
    await l.zeg("Sam gaat het verbeteren.");
    k.pas({ sam: false });
    await l.wacht(400);

    /* 8. Grotere sprongen: 15 minuten, in drie keer vijf. */
    await nieuweTijd(l, k, u(8, 20), 5);
    await l.zeg("Nu grotere sprongen in de tijd.", "Het is 8:20, en het bad van Sam is over 15 minuten vol.");
    /* Synthesis wacht hier op de pijl. */
    await verder(l);
    tel(await vijfVerder(l, k, u(8, 25)));
    tel(await vijfVerder(l, k, u(8, 30), "En nog 5."));
    tel(await vijfVerder(l, k, u(8, 35), "En nog 5."));
    await l.zeg("15 minuten is drie keer vijf.", "Dan zegt de klok 8:35.");
    await verder(l);

    /* 9. 25 minuten later. */
    await nieuweTijd(l, k, u(4, 15), 5);
    await l.zeg("De klok zegt nu 4:15.", "Hoe laat is het 25 minuten later?");
    tel(await hoeLaatLater(l, k, u(4, 15), ["4:20", "4:25", "4:35", "4:40"], lof(l), { stap: 25, terug: true }));

    /* 10. Zelf zetten: 15 minuten later, dan nog een. */
    await nieuweTijd(l, k, u(7, 10), 5);
    await l.zeg("Nu zet jij er een op de klok.");
    tel(await minutenZetten(l, k, u(7, 10), 15));
    await l.zeg(lof(l));
    await nieuweTijd(l, k, u(6, 45), false, false);
    await l.zeg("Hier is er nog een.", "Het is 6:45.", "Hoe laat is het 25 minuten later?");
    tel(await hoeLaatLater(l, k, u(6, 45), ["6:10", "6:70", "7:05", "7:10"], lof(l), { stap: 25, terug: true }));

    /* 11. Alleen als alles goed ging: een lastige om mee af te sluiten (eigen geluid). */
    if (fouten === 0) {
      speelLesgeluid("klokDraai");
      await nieuweTijd(l, k, u(12, 55), false);
      await l.zeg("Je had alles goed, dus hier is een lastige om mee af te sluiten.", "Het is 12:55.", "Hoe laat is het 5 minuten later?");
      tel(await hoeLaatLater(l, k, u(12, 55), ["12:00", "12:60", "1:00", "2:00"], lof(l), {}));
    }
    await l.zeg("Tel in stappen van 5.", "Zo zie je hoe laat het straks is, ook na het hele uur.");
    await verder(l);

    /* ---------- Deel 2: tellen met tienen ---------- */
    /* Synthesis heeft twee lessen: de bonus van deel 2 hangt alleen af van de fouten in deel 2. */
    const foutenDeel1 = fouten;
    await weetJeHet(l, "Nu gaan we uitzoeken hoe laat het over 10, 20 of 30 minuten is.", "We tellen verder in tienen.");

    /* 1. De pizza: 10 minuten, twee getallen. Het eerste getal mag (de wijzer gaat erheen), af is het bij het tweede. Synthesis: de digitale klok komt pas daarna in beeld. */
    k.pas({ digitaal: false });
    await nieuweTijd(l, k, u(1, 15), 10);
    await l.zeg("Het is 1:15, en de pizza van Sam is over 10 minuten klaar.");
    tel(
      await minuutNaar(l, k, u(1, 25), {
        kop: "Zet de minutenwijzer 10 minuten verder.",
        hint: ["Elk getal op de klok is 5 minuten, en 10 minuten is twee getallen.", "Tik dus op de 5 op de klok."],
        boog: "naTik",
      }),
    );
    k.pas({ digitaal: true });
    await l.zeg("De [[m:minutenwijzer]] ging twee getallen verder, en dat is 10 minuten.", "Dus om 1:25 is de pizza klaar.");
    await verder(l);

    /* 2 en 3. Doortellen met tienen. */
    await nieuweTijd(l, k, u(3, 28), 10);
    await l.zeg("Het is 3:28.", "De minutenwijzer staat tussen twee getallen.", "Hoe laat is het 10 minuten later?");
    tel(await hoeLaatLater(l, k, u(3, 28), ["3:29", "3:33", "3:38", "3:48"], lof(l), { stap: 10, terug: true }));
    await l.zeg("En 10 minuten daarna?");
    tel(await hoeLaatLater(l, k, u(3, 38), ["3:39", "3:43", "3:48", "3:58"], lof(l), { stap: 10, terug: true }));
    await samenvatting("De minuten gingen van 28 naar 38 en naar 48.", "Het laatste cijfer blijft hetzelfde, en het cijfer ervoor wordt steeds 1 groter.");
    await l.zeg("En nog eens 10 minuten?");
    tel(await hoeLaatLater(l, k, u(3, 48), ["3:49", "3:53", "3:58", "4:08"], lof(l), { stap: 10, terug: true }));

    /* 4. Over het uur heen (de tussenvraag bij 3:68). */
    await l.zeg("En 10 minuten daarna?");
    tel(await hoeLaatLater(l, k, u(3, 58), ["3:08", "3:59", "3:68", "4:08"], "Daar is het.", { stap: 10, terug: true }));

    /* 5. Oefenen. */
    await l.zeg("We proberen er nog een paar.");
    /* Synthesis: in het oefenblok geen vlaggetje (ook niet bij 6:14). */
    await nieuweTijd(l, k, u(6, 14), 10, false);
    await l.zeg("Het is 6:14.", "Hoe laat is het 10 minuten later?");
    tel(await hoeLaatLater(l, k, u(6, 14), ["6:15", "6:19", "6:24", "6:34"], lof(l), { stap: 10, terug: true }));

    /* 6. De fout van Sam. */
    await nieuweTijd(l, k, u(9, 23), false, false);
    k.pas({ sam: true });
    k.plop();
    await l.wacht(500);
    await l.zeg("Het is 9:23, en Sam zegt dat het over 10 minuten 9:24 is.", "Heeft Sam gelijk?");
    const gelijk10 = await kies(l, ["Ja", "Nee"], "Nee", 1, { weetniet: false });
    if (gelijk10 === "Nee") {
      k.goed();
      await l.zeg(lof(l));
    } else {
      fouten++;
      await l.zeg("Ik snap waarom je dat kiest.", "Sam maakte het laatste cijfer 1 groter.");
      await tipDan(l, ["Maar elke 10 minuten blijft het laatste cijfer hetzelfde, en wordt het cijfer ervoor 1 groter."], []);
    }
    await l.zeg("Wat zegt de klok dan over 10 minuten?");
    tel(await hoeLaatLater(l, k, u(9, 23), ["9:24", "9:33", "9:43"], lof(l), { stap: 10, terug: true }));
    await l.zeg("Sam gaat het verbeteren.");
    k.pas({ sam: false });
    await l.wacht(400);

    /* 7. Twee klokken. */
    await nieuweTijd(l, k, u(9, 32), false, false);
    await l.zeg("Het is nu 9:32.", "Hoe laat is het 10 minuten later?");
    tel(await hoeLaatLater(l, k, u(9, 32), ["9:33", "9:37", "9:42", "9:52"], lof(l), { stap: 10, terug: true }));
    await nieuweTijd(l, k, u(5, 57), false, false);
    await l.zeg("Hier is de volgende.", "Het is 5:57.", "Hoe laat is het over 10 minuten?");
    tel(await hoeLaatLater(l, k, u(5, 57), ["5:07", "5:58", "5:67", "6:07"], lof(l), { stap: 10, terug: true }));

    /* 8. Grotere sprongen: 20 minuten, in twee keer tien. */
    await nieuweTijd(l, k, u(7, 10), 10);
    await l.zeg("Nu grotere sprongen in de tijd.", "Het is 7:10, en de bus van Sam komt over 20 minuten.");
    tel(await minuutNaar(l, k, u(7, 20), { kop: "Tik op het getal twee verder.", hint: ["Elk getal op de klok is 5 minuten.", "Twee getallen verder is 10 minuten.", "Tik op de 4 op de klok."] }));
    tel(await minuutNaar(l, k, u(7, 30), { kop: "En nog 10.", hint: ["Tik op de 6 op de klok."] }));
    await l.zeg("20 minuten is twee keer tien.", "Dan zegt de klok 7:30.");
    await verder(l);

    /* 9. 30 minuten later. */
    await nieuweTijd(l, k, u(6, 12), 10);
    await l.zeg("Het is 6:12.", "Hoe laat is het 30 minuten later?");
    tel(await hoeLaatLater(l, k, u(6, 12), ["6:15", "6:27", "6:32", "6:42"], lof(l), { stap: 30, terug: true }));

    /* 10. Zelf zetten: 30 minuten later, en nog een lezen. */
    await nieuweTijd(l, k, u(5, 5), 10);
    await l.zeg("Nu zet jij er een op de klok.");
    tel(await minutenZetten(l, k, u(5, 5), 30));
    await l.zeg(lof(l));
    await nieuweTijd(l, k, u(5, 47), false, false);
    await l.zeg("Hier is er nog een.", "De klok zegt nu 5:47.", "Hoe laat is het 30 minuten later?");
    tel(await hoeLaatLater(l, k, u(5, 47), ["5:17", "5:77", "6:07", "6:17"], lof(l), { stap: 30, terug: true }));

    /* 11. Alleen als alles goed ging: een lastige om mee af te sluiten. */
    if (fouten === foutenDeel1) {
      speelLesgeluid("klokDraai");
      await nieuweTijd(l, k, u(12, 46), false);
      await l.zeg("Je had alles goed, dus hier is een lastige om mee af te sluiten.", "Het is 12:46.", "Hoe laat is het 30 minuten later?");
      tel(await hoeLaatLater(l, k, u(12, 46), ["12:16", "12:76", "1:16", "2:16"], lof(l), { stap: 30 }));
    }
    await l.zeg("Nu kun je in tienen tellen om te zien hoe laat het over een paar minuten is, ook over het hele uur heen.");
    await verder(l);
    k.pas({ boog: null, vlag: null });

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* =====================================================================
   Hoe lang samen? (How Long It Takes · Start to Finish, groep 3-deel)
   ===================================================================== */

/** Twee dingen na elkaar: de boog groeit eerst `a`, dan `b` minuten. Vraag hoeveel minuten samen. */
async function tweeNaElkaar(
  l: Lesgids,
  k: Klok,
  begin: number,
  a: number,
  b: number,
  zinnen: { eerst: string; dan: string },
  opties: string[],
): Promise<boolean> {
  k.pas({ boog: null, vlag: null });
  k.zet(begin);
  await l.wacht(600);
  k.pas({ vlag: begin, boog: { van: begin, delen: [a] } });
  await l.zeg(zinnen.eerst);
  await k.draai(begin + a);
  await l.zeg(zinnen.dan);
  await k.draai(begin + a + b);
  await l.zeg("Hoeveel minuten was dat samen?");
  const som = a + b;
  return vraag(l, opties, String(som), {
    goedZin: ["Goed.", `${a} en ${b} minuten is samen ${som} minuten.`],
    verder: true,
    fout: async (x) => {
      if (x === String(Math.abs(a - b))) {
        await l.zeg(`Dat is ${a} min ${b}.`, "Maar Bliepo deed allebei na elkaar.", "We tellen ze bij elkaar.");
      } else if (x === String(a) || x === String(b)) {
        await l.zeg("Dat is maar één van de twee.", "Bliepo deed daarna nog iets.", "We tellen ze bij elkaar.");
      } else if (x !== null) {
        await l.zeg("Kijk naar de boog.", "Die laat zien hoe lang het samen duurde.");
      } else {
        await l.zeg("Geen zorgen.", "We tellen langs de boog.");
      }
      await verder(l);
      k.pas({ boog: { van: begin, stap: 5 } });
      await l.zeg("Kijk, we tellen langs de boog in vijven.", "Hoeveel minuten samen?");
      return x === null ? opties : zonder(opties, x);
    },
    antwoord: [`${a} en ${b} minuten is samen ${som} minuten.`],
  });
}

const samenHoeLang: Lesdraaiboek = {
  id: "klok-samen-hoe-lang",
  titel: "Hoe lang samen?",
  synthesis: "How Long It Takes · Start to Finish (groep 3-deel)",
  kaarttekening: KaartSamen,

  async speel(l) {
    const k = new Klok(l, u(3), { digitaal: true, uurwijzer: "flets" });
    await weetJeHet(l, "We gaan zeggen hoe lang iets duurt, in minuten.");
    await l.zeg("Bliepo doet twee dingen na elkaar.", "Het blauwe vlaggetje laat zien waar hij begint.");
    await verder(l);

    let fouten = 0;
    if (
      !(await tweeNaElkaar(l, k, u(3), 25, 20, { eerst: "Eerst leest Bliepo 25 minuten.", dan: "Daarna tekent hij 20 minuten." }, ["5", "20", "25", "45"]))
    ) {
      fouten++;
    }
    await l.zeg("Nog eentje.");
    if (
      !(await tweeNaElkaar(l, k, u(4), 15, 10, { eerst: "Eerst speelt Bliepo 15 minuten buiten.", dan: "Daarna eet hij 10 minuten." }, ["5", "10", "15", "25"]))
    ) {
      fouten++;
    }
    await l.zeg("De laatste.");
    if (
      !(await tweeNaElkaar(l, k, u(5), 30, 20, { eerst: "Eerst fietst Bliepo 30 minuten.", dan: "Daarna zwemt hij 20 minuten." }, ["10", "20", "30", "50"]))
    ) {
      fouten++;
    }
    k.pas({ boog: null, vlag: null });
    await l.zeg("Nu kun je zeggen hoe lang twee dingen samen duren.");
    await verder(l);

    await kaartEinde(l, fouten, "Jij kunt mij nu les geven.");
  },
};

/* De volgorde van Synthesis: instaptoets, de lessen, de eindtoets, het spel; daarna "How Long It Takes". */
/*
  Het vraagteken (hulp) en het vinkje (controle) staan op de vaste plek onder
  de zin van Bliepo, niet meer onder de klok (28 oktober 2026, besluit eigenaar).
*/
function metKlokknoppen(les: Lesdraaiboek): Lesdraaiboek {
  /*
    De vijf nagebouwde lessen (T1 t/m T5, 28 oktober 2026, zoals Synthesis): de
    hulp is het handje, naast het vinkje; bij een opdracht die meteen
    nagekeken wordt staat alleen het handje (`hulpknop`).
  */
  if (SYNTHESIS_KLOK.has(les.id)) {
    return {
      ...les,
      speel: (l) =>
        les.speel(
          knoppenOpPlek(l, {
            voor: BliepoKlok,
            soorten: { hulp: "hulp", controle: "controleer" },
            aanwijs: { klokhulp: "hulp", klokcontrole: "controleer" },
            zichtbaar: (p) => (p.actief && p.controle ? (p.hulpknop ? ["hulp", "controle"] : ["controle"]) : p.actief && p.hulpknop ? ["hulp"] : []),
          }),
        ),
    };
  }
  return {
    ...les,
    speel: (l) =>
      les.speel(
        knoppenOpPlek(l, {
          voor: BliepoKlok,
          soorten: { hulp: "weetniet", controle: "controleer" },
          aanwijs: { klokhulp: "weetniet", klokcontrole: "controleer" },
          zichtbaar: (p) => (p.actief && p.controle ? ["hulp", "controle"] : []),
        }),
      ),
  };
}
const SYNTHESIS_KLOK = new Set(["klok-urenwijzer", "klok-hele-uren-zetten", "klok-halve-uren", "klok-kwart-over", "klok-minuten-later"]);

export const LESSEN_KLOKKIJKEN: Lesdraaiboek[] = [
  instaptoets,
  digitaleKlok,
  urenwijzer,
  heleUrenZetten,
  halveUren,
  kwartOver,
  tellenInVijven,
  eindtoets,
  verslaDeWekker,
  minutenLater,
  samenHoeLang,
].map(metKlokknoppen);
