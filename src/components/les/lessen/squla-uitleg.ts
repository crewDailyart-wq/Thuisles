import type { Lesgids } from "../soort";
import type { SqulaVraag } from "./squla-hulp";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/** Alleen de begeleide oefening na Nee; antwoorden tellen niet mee als toetsvraag. */
const begeleid = new WeakSet<Lesgids>();
const eerstVoordoen = new WeakSet<Lesgids>();
const hulpMetVervolgvraag = new WeakSet<Lesgids>();

/** De antwoordvraag volgt na deze uitleg: stel haar niet ook in de uitleg zelf. */
export function krijgtVervolgvraag(l: Lesgids) {
  return begeleid.has(l) || hulpMetVervolgvraag.has(l);
}

/** Ook gewone foutenhulp eindigt bij de echte antwoordvraag, zonder de scoremodus te wijzigen. */
export async function uitlegVoorVraag(l: Lesgids, doe: () => Promise<void>) {
  const alActief = hulpMetVervolgvraag.has(l);
  hulpMetVervolgvraag.add(l);
  try {
    await doe();
  } finally {
    if (!alActief) hulpMetVervolgvraag.delete(l);
  }
}

/**
 * Lessen met de hulp van Synthesis (BOUWREGELS 5.1 en 5.10, 4 november 2026), ook in de uitleg na "Nee":
 * een fout = korte reactie en meteen opnieuw; de tweede fout = uitleg, het goede antwoord laten zien en door.
 * Geen pauze, geen "Nog niet helemaal", de les stopt niet.
 */
const synthesisLessen = new WeakSet<Lesgids>();
let huidigeLes: Lesgids | null = null;
const naamGebruikt = new WeakMap<Lesgids, number>();

export function zetSynthesisHulp(l: Lesgids) {
  synthesisLessen.add(l);
  huidigeLes = l;
}

/**
 * Afwisseling (Sara, 4 november 2026): een tutor zegt niet na elke fout hetzelfde. `wissel` kiest uit een lijst, nooit
 * twee keer achter elkaar hetzelfde, en een lege keuze (geen opening) komt vaak voor, zodat het niet opvalt.
 */
const laatsteKeuze = new Map<string, string>();
export function wissel(naam: string, lijst: readonly string[]): string {
  const vorige = laatsteKeuze.get(naam);
  const kansen = lijst.filter((z) => z !== vorige);
  const kies = kansen[Math.floor(Math.random() * kansen.length)] ?? "";
  laatsteKeuze.set(naam, kies);
  return kies;
}

/** Korte opening bij een fout, zoals Synthesis ("hmm", "ah, ik snap wat je dacht"): wisselen en vaak weglaten. */
/* Geen vaste "ik laat het je zien"-zin meer (Sara, 4 november): na de tweede fout zegt Bliepo meteen het antwoord. */
/* Geen vast lijstje met openingen (Sara, 4 november): een opening als "Hmm" of "Kijk eens goed" staat alleen in de eigen
   `reactie` van een vraag, als hij past bij die vraag en bij wat het kind koos. Deze functie geeft daarom niets terug. */
/* Korte bevestiging na een goed antwoord, zoals Synthesis ("klopt", "precies", "goed gezien") en een echte juf: kort, daarna meteen
   door. Eén gedeelde, ruime lijst, nooit twee keer achter elkaar dezelfde, en alleen woorden die bij ELKE vraag passen (dus geen "Slim bedacht" of "Raak"); de uitleg zit in het beeld, niet in extra zinnen. */
const BEVESTIGINGEN = [
  "Klopt.", "Precies.", "Goed gezien.", "Dat is 'm.", "Heel goed.", "Mooi.", "Ja, dat is het.", "Perfect.",
  "Netjes.", "Ja, zo is het.", "Goed gedaan.", "Dat klopt.", "Prima.", "Helemaal goed.", "Goed zo.", "Ja!",
];
/** Mag de naam van het kind nog worden gezegd in deze les? Hoogstens 2 keer per les (3.17); telt ook de eindkaart mee. */
export function naamMag(l: Lesgids): boolean {
  const keer = naamGebruikt.get(l) ?? 0;
  if (keer >= 2) return false;
  naamGebruikt.set(l, keer + 1);
  return true;
}

/* Het terugkomen van gemiste vragen (Synthesis: "we komen er later op terug"): de aankondiging wisselt en past bij het aantal. */
export function terugAankondiging(n: number): string {
  return n === 1
    ? wissel("terug1", ["Nog 1 vraag van net krijg je opnieuw.", "Die ene vraag van daarnet mag je nog een keer proberen.", "Er komt nog 1 vraag terug die net lastig was."])
    : wissel("terugN", [`Nog ${n} vragen van net krijg je opnieuw.`, `Deze ${n} vragen van daarnet mag je nog een keer proberen.`, `Er komen nog ${n} vragen terug die net lastig waren.`]);
}

/* Is een teruggekomen vraag weer fout, dan gaat het niet oneindig door: Bliepo rondt kort en vriendelijk af en de les is klaar. */
export function terugAfsluiting(): string {
  return wissel("terugEind", ["Dit was nog lastig. Dat oefen je een andere keer verder.", "Niet erg. Deze vragen komen een andere keer weer langs.", "Dit gaat nog niet vanzelf. Met oefenen komt dat goed.", "Dat was best moeilijk. Je mag het later nog eens proberen."]);
}

export function bevestig(): string {
  const woord = wissel("bevestig", BEVESTIGINGEN);
  const l = huidigeLes;
  const naam = l?.naam?.trim();
  const keer = l ? naamGebruikt.get(l) ?? 0 : 0;
  /* Af en toe de naam van het kind erbij (Synthesis doet dat ook bij een complimentje): hoogstens 2 keer per les (3.17). */
  if (l && naam && keer < 2 && Math.random() < 0.18) {
    naamGebruikt.set(l, keer + 1);
    return woord.replace(/([.!])$/, `, ${naam}$1`);
  }
  return woord;
}

export const opener = (): string => "";
export const laatZienZin = (): string => "";

export function isBegeleideUitleg(l: Lesgids) {
  return begeleid.has(l);
}

export async function samenOefenen(l: Lesgids, doe: () => Promise<unknown>, voordoen = false): Promise<void> {
  begeleid.add(l);
  if (voordoen) eerstVoordoen.add(l);
  try {
    await doe();
  } finally {
    begeleid.delete(l);
    eerstVoordoen.delete(l);
  }
}

/** Dezelfde echte afbeelding en bediening als in de les, met hulp vóór het antwoord. */
export async function begeleideVraag<T>(l: Lesgids, v: SqulaVraag<T>, steunVooraf = true): Promise<boolean> {
  v.toon?.();
  // De tip noemt de kleine eerste stap. Daarna blijft de volledige opdracht in beeld.
  // Een tip mag de antwoordvraag niet nogmaals stellen, ook niet na een fout.
  const zonderOpmaak = (zin: string) => zin.replace(/\{([^}:]+):[^}]+\}/g, "$1").trim();
  const vragen = new Set([...v.vraag, v.vraag.join(" ")].map(zonderOpmaak));
  const steun = v.tip.filter((zin) => zin && !vragen.has(zonderOpmaak(zin)));
  if (steunVooraf && eerstVoordoen.has(l)) {
    await v.samen();
    v.toon?.();
  } else if (steunVooraf && steun.length) {
    // Herhaal geen vraag die direct daarna nog eens wordt gesteld.
    const aanwijzingen = steun.filter((zin) => !zin.trim().endsWith("?"));
    if (aanwijzingen.length) await l.zeg(aanwijzingen.join(" "));
  }
  const stel = async () => {
    if (typeof window !== "undefined") window.__phaser = { ...window.__phaser, antwoord: v.testAntwoord ?? null };
    await l.zeg(v.vraag.join(" "));
  };
  await stel();
  let antwoord = await v.antwoord();
  if (v.isGoed(antwoord)) {
    speelLesgeluid("goed");
    await v.goed(antwoord);
    return false;
  }
  v.fout?.(antwoord);
  /* Alleen de hulp van Synthesis; de oude route met "Nog niet helemaal" en pauze is weg (Sara, 6 november 2026). */
  // Eerste fout: reactie (+ hint) en meteen opnieuw, zonder de vraag nog eens te stellen.
  speelLesgeluid("mis");
  await l.zeg(...[opener(), ...(v.reactie ? v.reactie(antwoord) : steun.length ? steun : v.tip)].filter(Boolean));
  if (typeof window !== "undefined") window.__phaser = { ...window.__phaser, antwoord: v.testAntwoord ?? null };
  antwoord = await v.antwoord();
  if (v.isGoed(antwoord)) {
    speelLesgeluid("goed");
    await v.goed(antwoord);
    return false;
  }
  // Tweede fout: uitleg, het goede antwoord laten zien en door naar de volgende stap.
  speelLesgeluid("mis");
  v.fout?.(antwoord);
  await v.toonAntwoord?.();
  return false;
}

/** Een kleine begripsvraag bij een afbeelding; nooit verder na een fout antwoord. */
export async function uitlegKeuze(l: Lesgids, o: {
  vraag: string;
  keuzes: readonly string[];
  antwoord: string;
  hint: string;
  goed: string;
  toon?: () => void;
  hulp?: () => Promise<void>;
  /** Hulp van Synthesis: wat Bliepo na de eerste fout zegt (anders de hint). */
  reactie?: (x: string) => string[];
  /** Na de tweede fout: het goede antwoord in woorden (anders `goed`, dat soms met "Ja" begint). */
  laatZien?: string;
}): Promise<void> {
  await begeleideVraag(l, {
    toon: o.toon,
    vraag: [o.vraag],
    antwoord: () => l.kies([...o.keuzes], { weetniet: false, direct: true }),
    isGoed: (x) => x === o.antwoord,
    noem: (x) => x ?? "",
    goed: async () => { await l.zeg(o.goed); },
    samen: async () => { if (o.hulp) await o.hulp(); else await l.zeg(o.hint); },
    tip: [o.hint],
    reactie: o.reactie ? (x) => o.reactie!(x ?? "") : undefined,
    toonAntwoord: async () => { await l.zeg(o.laatZien ?? o.goed); },
    testAntwoord: o.antwoord,
  }, false);
}
