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

/**
 * De stem meldt dat hij nu bij een woord is (browser: onboundary, `charIndex` = waar dat woord in de zin begint;
 * 10 november 2026, alleen in lessen met de optie woordenMeeMetStem, zie lib/stem.ts). Het oplichten springt dan naar
 * precies dat woord, en de woorden erna worden opnieuw geschat in het tempo dat de stem tot nu toe echt had.
 */
export function meldWoordgrens(zin: string, charIndex: number): void {
  if (!huidig || huidig.zin !== zin || !huidig.tijden.length) return;
  const t = (performance.now() - huidig.start) / 1000;
  /* Welk geschreven woord begint op (of net na) deze plek? */
  const woorden = zin.trim().split(/\s+/).filter(Boolean);
  let plek = zin.length - zin.trimStart().length;
  let k = 0;
  for (let i = 0; i < woorden.length; i++) {
    const begin = zin.indexOf(woorden[i], plek);
    if (begin + woorden[i].length > charIndex) {
      k = i;
      break;
    }
    plek = begin + woorden[i].length;
    k = i + 1;
  }
  if (k >= huidig.tijden.length) return;
  const oud = huidig.tijden;
  const factor = k > 0 && oud[k].begin > 0.05 ? Math.min(2.5, Math.max(0.4, t / oud[k].begin)) : 1;
  const tijden = oud.map((w, j) => (j < k ? w : { begin: t + (w.begin - oud[k].begin) * factor, eind: t + (w.eind - oud[k].begin) * factor }));
  huidig = { ...huidig, tijden };
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

/*
  SPREEKMODEL VAN DE BROWSERSTEM (11 november 2026, F10; alleen in lessen met de optie woordenMeeMetStem, lib/stem.ts).
  De Google-stem in Chrome meldt geen woorden (geen onboundary). Eerst werd de duur van een zin over de woorden verdeeld
  naar het aantal letters, met de stilte aan het eind erbij; daardoor liepen de laatste woorden te laat (tot ± 1 s).
  Nu: elk woord kost een vast stukje plus een stukje per klank (getallen voluit), een punt of vraagteken geeft een pauze,
  en de stilte voor en na de zin telt niet mee. De getallen zijn gemeten met dezelfde stem (Google Nederlands, tempo 0,88,
  toon 1,2): elk begin van een zin apart uitgesproken ("Kijk", "Kijk eens", …), en daaruit per woord de duur
  (scripts/test-woord-oplichten.mjs, IJK=1). Tijdens de les wordt het tempo bijgesteld uit de zinnen die al klonken.
*/
export type Spreekmodel = {
  /** Stilte voor het eerste woord, na de start van de stem (s). */
  voor: number;
  /** Stilte (en uitloop) na het laatste woord, tot het einde van de stem (s). */
  na: number;
  /** Vast stukje per woord (s). */
  woord: number;
  /** Per klank (letter of cijfer, voluit) (s). */
  klank: number;
  /** Pauze na een punt of uitroepteken, na een vraagteken, na een komma (s). */
  punt: number;
  vraag: number;
  komma: number;
};
/*
  Gemeten op 11 november 2026 (Chrome, Mac, 24 zinnen uit de 9 gouden lessen, 263 woorden; per woord ± 126 ms naast het
  gemeten moment, 66 % binnen ± 150 ms; de oude verdeling naar letters: ± 264 ms, steeds te laat, 36 % binnen ± 150 ms).
  De stilte voor + na een uiting (0,52 s) is ook los gemeten (los + los − samen: 0,55 s).
*/
export const GOOGLE_NL: Spreekmodel = { voor: 0.05, na: 0.47, woord: 0.064, klank: 0.06, punt: 0.296, vraag: 0.143, komma: 0.108 };

function modelDelen(zin: string, m: Spreekmodel): { duur: number; pauze: number }[] {
  const woorden = zin.trim().split(/\s+/).filter(Boolean);
  return woorden.map((w, i) => {
    const klank = Math.max(1, voorStem(w).replace(/[^\p{L}\p{N}]/gu, "").length);
    const laatste = i === woorden.length - 1;
    const pauze = laatste ? 0 : /[.!…]$/.test(w) ? m.punt : /\?$/.test(w) ? m.vraag : /[,;:]$/.test(w) ? m.komma : 0;
    return { duur: m.woord + m.klank * klank, pauze };
  });
}

/** Hoe lang de woorden van de zin samen duren volgens het model (zonder de stilte ervoor en erna; s). */
export function modelSpraakduur(zin: string, m: Spreekmodel): number {
  return modelDelen(zin, m).reduce((a, d) => a + d.duur + d.pauze, 0);
}

/** De tijden per woord volgens het model, met `tempo` = geleerde verhouding (1 = zoals gemeten; 1,1 = 10 % trager). */
export function woordtijdenMetModel(zin: string, m: Spreekmodel, tempo = 1): Woordvak[] {
  let t = m.voor;
  return modelDelen(zin, m).map((d) => {
    const vak = { begin: t, eind: t + d.duur * tempo };
    t = vak.eind + d.pauze * tempo;
    return vak;
  });
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
