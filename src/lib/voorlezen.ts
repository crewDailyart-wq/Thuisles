/**
 * Welk woord zegt Bliepo nu? (23 oktober 2026, opdracht eigenaar: woorden
 * oplichten tijdens het voorlezen, zoals karaoke.)
 *
 * De stem (lib/stem.ts) meldt hier elke zin op het moment dat het geluid echt
 * begint, met waar in het geluid de spraak begint en eindigt. Daarmee wordt
 * per woord een tijd geschat: de woorden krijgen hun deel van de spraak naar
 * hoe lang ze zijn als je ze uitspreekt (getallen voluit), met een korte
 * pauze na een komma of punt. Zo kan elke bestaande zin oplichten zonder dat
 * hij opnieuw gemaakt hoeft te worden. (Het voorbeeld op /voorbeeld-bliepo
 * gebruikt de precieze tijden van ElevenLabs.)
 *
 * Dit bestand mag zowel in de browser als op de server gebruikt worden.
 */

import { voorStem } from "@/lib/stemtekst";

export type Woordvak = { begin: number; eind: number };
export type Voorlees = { id: number; zin: string; start: number; tijden: Woordvak[] };

let huidig: Voorlees | null = null;
let teller = 0;
const luisteraars = new Set<() => void>();

export function huidigeVoorlees(): Voorlees | null {
  return huidig;
}

export function abonneerVoorlees(f: () => void): () => void {
  luisteraars.add(f);
  return () => {
    luisteraars.delete(f);
  };
}

/**
 * Een zin begint nu te klinken; `spraak` = waar in het geluid de spraak begint
 * en eindigt (seconden). `tijden` (optioneel, 24 oktober 2026): de precieze
 * tijden per woord (van ElevenLabs), als die er zijn en bij de woorden passen.
 */
export function meldVoorlezen(zin: string, spraak: { begin: number; eind: number }, tijden?: Woordvak[]): void {
  const woorden = zin.trim().split(/\s+/).filter(Boolean).length;
  const precies = tijden && tijden.length === woorden ? tijden : null;
  huidig = { id: ++teller, zin, start: performance.now(), tijden: precies ?? schatWoordtijden(zin, spraak.begin, spraak.eind) };
  for (const f of luisteraars) f();
}

/** Klaar met deze zin (of gestopt). */
export function stopVoorlezen(): void {
  if (!huidig) return;
  huidig = null;
  for (const f of luisteraars) f();
}

/** Voor het vergelijken: kleine letters, zonder leestekens en dubbele spaties. */
export function vergelijkbaar(zin: string): string {
  return zin
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** De woorden van een zin zoals ze klinken (getallen en tekens voluit), per geschreven woord. */
export function schatWoordtijden(zin: string, begin: number, eind: number): Woordvak[] {
  const woorden = zin.trim().split(/\s+/).filter(Boolean);
  if (!woorden.length) return [];
  const gewicht = woorden.map((w) => {
    const klank = voorStem(w).replace(/[^\p{L}\p{N}]/gu, "").length;
    return Math.max(1, klank) + 1.5;
  });
  const pauze: number[] = woorden.map((w) => (/[.!?…]$/.test(w) ? 6 : /[,;:]$/.test(w) ? 3 : 0));
  const totaal = gewicht.reduce((a, b) => a + b, 0) + pauze.slice(0, -1).reduce((a, b) => a + b, 0);
  const duur = Math.max(0.2, eind - begin);
  const uit: Woordvak[] = [];
  let t = begin;
  for (let i = 0; i < woorden.length; i++) {
    const lengte = (gewicht[i] / totaal) * duur;
    uit.push({ begin: t, eind: t + lengte });
    t += lengte + (i < woorden.length - 1 ? (pauze[i] / totaal) * duur : 0);
  }
  return uit;
}

/** Waar in een stuk geluid de spraak begint en eindigt (seconden), uit de samples. */
export function spraakGrenzen(kanaal: Float32Array, sr: number): { begin: number; eind: number } {
  const drempel = 0.02;
  let a = 0;
  let b = kanaal.length - 1;
  while (a < b && Math.abs(kanaal[a]) < drempel) a++;
  while (b > a && Math.abs(kanaal[b]) < drempel) b--;
  if (b <= a) return { begin: 0, eind: kanaal.length / sr };
  return { begin: a / sr, eind: b / sr };
}

/*
  Een zin die eraan komt (26 oktober 2026): zodra het geluid van een zin wordt
  opgehaald, nog voor hij klinkt. Zo kan de telefoon het filmpje van een gebaar
  op het eerste woord alvast laden (BliepoAlsFilmpje).
*/
const komendLuisteraars = new Set<(zin: string) => void>();
export function meldKomendeZin(zin: string): void {
  for (const f of komendLuisteraars) f(zin);
}
export function abonneerKomendeZin(f: (zin: string) => void): () => void {
  komendLuisteraars.add(f);
  return () => {
    komendLuisteraars.delete(f);
  };
}
