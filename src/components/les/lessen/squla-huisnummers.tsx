/**
 * Les "Huisnummers: wat komt erna?" (30 oktober 2026, opdracht eigenaar):
 * geïnspireerd op een oefening van Squla (groep 3, tellen, de telrij), met
 * eigen inhoud en eigen tekeningen: een straat in de avond met huisnummers.
 *
 * Leerdoel: de telrij tot 50. Welk getal komt erna, ervoor, ertussen, en
 * terugtellen. 17 vragen, eerst tot 20, dan tot 31, dan tot 50.
 *
 * Hulp zoals Synthesis (zie `meteenS` in verhaaltjessommen.tsx): na één fout
 * "Niet helemaal." en de keuze "Nog een keer" of "Hulp". Nog een keer = dezelfde
 * vraag. Hulp, of nog een fout: samen langs de straat lopen. Daarna 1× fout =
 * een tip, 2× fout = "Zullen we even pauze nemen?" en de les stopt.
 *
 * Huisnummers staan allemaal wit op een donker bordje: in de zinnen {n:wit}.
 * Geen "Weet ik niet"-knop bij de keuzes (besluit eigenaar).
 */

import { speelLesgeluid } from "@/lib/lesgeluiden";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartHuisnummers, SqulaStraat, type Huisplek, type StraatProps } from "../vlakken/squla-huisnummers-straat";

type Soort = "na" | "voor" | "tussen" | "sleep" | "terug";

type Vraag = {
  soort: Soort;
  huizen: Huisplek[];
  goed: number;
  /** Keuzes (2–4). Zonder keuzes en zonder slepen: typen. */
  opties?: number[];
  /** Huizen om naar de lege plek te slepen. */
  losse?: number[];
};

const VRAGEN: Vraag[] = [
  /* tot 20 */
  { soort: "na", huizen: [6, 7, "?"], goed: 8, opties: [9, 8, 6] },
  { soort: "voor", huizen: ["?", 12, 13], goed: 11, opties: [13, 11, 10] },
  { soort: "tussen", huizen: [14, 15, "?", 17, 18], goed: 16, opties: [16, 19, 13] },
  { soort: "na", huizen: [17, 18, 19, "?"], goed: 20 },
  { soort: "sleep", huizen: [8, 9, null, 11, 12], goed: 10, losse: [7, 10, 13] },
  /* van 20 tot 31 */
  { soort: "na", huizen: [24, 25, "?"], goed: 26, opties: [24, 27, 26] },
  { soort: "terug", huizen: ["?", 27, 28, 29], goed: 26, opties: [30, 26, 25] },
  { soort: "voor", huizen: ["?", 21, 22], goed: 20, opties: [22, 19, 20] },
  { soort: "tussen", huizen: [26, 27, "?", 29, 30], goed: 28, opties: [28, 26, 38] },
  { soort: "sleep", huizen: [21, 22, 23, null, 25], goed: 24, losse: [42, 24, 26] },
  { soort: "voor", huizen: ["?", 30, 31], goed: 29 },
  /* tot 50 */
  { soort: "na", huizen: [38, 39, "?"], goed: 40, opties: [30, 41, 40] },
  { soort: "terug", huizen: ["?", 41, 42, 43], goed: 40, opties: [44, 39, 40] },
  { soort: "tussen", huizen: [45, 46, "?", 48, 49], goed: 47, opties: [44, 47, 50] },
  { soort: "sleep", huizen: [32, 33, null, 35, 36], goed: 34, losse: [37, 43, 34] },
  { soort: "na", huizen: [47, 48, 49, "?"], goed: 50 },
  { soort: "terug", huizen: ["?", 35, 36, 37], goed: 34, opties: [34, 38, 33] },
];

const w = (n: number) => `{${n}:wit}`;
const straat = (l: Lesgids, p: Partial<StraatProps>) => l.pasVlakAan<StraatProps>(p);

/** De plek van het vraagteken of de lege plek in de rij. */
const gat = (v: Vraag) => v.huizen.findIndex((h) => h === "?" || h === null);
/** De nummers in de rij, zonder het gat. */
const nummers = (v: Vraag) => v.huizen.filter((h): h is number => typeof h === "number");
/** Bij "terug" lopen we van rechts naar links: het laatste nummer eerst. */
const terugReeks = (v: Vraag) => [...nummers(v)].reverse();

/** Het getal waar de vraag over gaat ("komt na 7", "komt voor 12"). */
function ijk(v: Vraag): number {
  if (v.soort === "na" || v.soort === "tussen" || v.soort === "sleep") return v.goed - 1;
  return v.goed + 1;
}

/** Wat Bliepo de eerste keer zegt, vóór de vraag. */
function aanloop(v: Vraag): string[] {
  if (v.soort === "tussen") return ["Kijk, op één bordje staat een vraagteken."];
  if (v.soort === "sleep") return ["Er mist een huis in de straat."];
  if (v.soort === "terug") return ["Nu lopen we terug."];
  return [];
}

/** De vraag zelf; overal dezelfde zin voor dezelfde soort vraag. */
function vraagZin(v: Vraag): string[] {
  const typ = !v.opties && !v.losse ? ["Typ het nummer."] : [];
  if (v.soort === "na") return [`Welk huisnummer komt na ${w(ijk(v))}?`, ...typ];
  if (v.soort === "voor") return [`Welk huisnummer komt voor ${w(ijk(v))}?`, ...typ];
  if (v.soort === "tussen") return ["Welk huisnummer hoort bij het vraagteken?", ...typ];
  if (v.soort === "sleep") return ["Sleep het goede huis naar de lege plek."];
  return [`${terugReeks(v).map(w).join(", ")}…`, "Welk huisnummer komt dan?", ...typ];
}

/** Na het samen teruglopen hoeft de reeks niet nog eens: alleen de vraag. */
function vraagNaLopen(v: Vraag): string[] {
  return v.soort === "terug" ? vraagZin(v).slice(1) : vraagZin(v);
}

function goedZin(v: Vraag): string {
  if (v.soort === "na") return `Ja! Na ${w(ijk(v))} komt ${w(v.goed)}.`;
  if (v.soort === "voor" || v.soort === "terug") return `Ja! Voor ${w(ijk(v))} komt ${w(v.goed)}.`;
  return `Ja! ${w(v.goed)} hoort tussen ${w(v.goed - 1)} en ${w(v.goed + 1)}.`;
}

function tipZin(v: Vraag): string {
  if (v.soort === "voor" || v.soort === "terug") return `Tel één terug vanaf ${w(ijk(v))}.`;
  return `Tel één verder dan ${w(ijk(v))}.`;
}

/** Eén keer laten antwoorden: kiezen, typen of slepen. `null` = "Weet ik niet" bij het typen. */
async function antwoord(l: Lesgids, v: Vraag, st: { keer: number; handGezien: boolean }): Promise<number | null> {
  /* Voor de automatische test (zoals bij de verhaaltjessommen): welk antwoord nu goed is. */
  window.__phaser = { ...window.__phaser, antwoord: v.goed };
  if (v.losse) {
    straat(l, { actief: true, hand: !st.handGezien });
    const g = await l.wachtOpVlak<{ soort: string; n: number }>("gelegd");
    st.handGezien = true;
    straat(l, { actief: false, hand: false });
    return g.n;
  }
  if (v.opties) {
    const k = await l.kies(v.opties.map(String), { weetniet: false, direct: true });
    return k === null ? null : Number(k);
  }
  return l.getal();
}

function fout(l: Lesgids, v: Vraag, x: number, st: { keer: number }) {
  speelLesgeluid("mis");
  if (v.losse) straat(l, { fout: { n: x, keer: ++st.keer } });
}

/** Samen langs de straat lopen: elk huis licht op en Bliepo zegt het nummer. */
async function loopLangs(l: Lesgids, v: Vraag) {
  const g = gat(v);
  const plekken =
    v.soort === "voor" || v.soort === "terug"
      ? v.huizen.map((_, i) => i).filter((i) => i !== g).reverse()
      : v.huizen.map((_, i) => i).filter((i) => i < g);
  for (const i of plekken) {
    straat(l, { licht: i });
    await l.zeg(w(v.huizen[i] as number));
  }
  straat(l, { licht: null });
}

/** De hulproute: samen uitzoeken, dan de vraag nog eens. 2× fout = pauze. */
async function samen(l: Lesgids, v: Vraag, st: { keer: number; handGezien: boolean }): Promise<void> {
  if (v.soort === "voor" || v.soort === "terug") await l.zeg("We lopen samen terug.");
  else await l.zeg("We lopen samen langs de huizen.");
  await loopLangs(l, v);
  if (v.soort === "voor" || v.soort === "terug") await l.zeg("Terug wordt het nummer steeds één minder.");
  else await l.zeg("Elk huis is één verder.");
  await l.zeg(...vraagNaLopen(v));
  for (let poging = 1; ; poging++) {
    const x = await antwoord(l, v, st);
    if (x === v.goed) return;
    if (poging === 1) {
      if (x === null) await l.zeg("Geen probleem.", tipZin(v));
      else {
        fout(l, v, x, st);
        await l.zeg(`${w(x)}? Niet helemaal.`, tipZin(v));
      }
      await l.zeg(...vraagZin(v).filter((z) => z !== "Typ het nummer."));
      continue;
    }
    if (x !== null) fout(l, v, x, st);
    await l.zeg(x === null ? "Dat is niet erg." : `${w(x)}? Dat is nog niet het goede nummer.`, "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await l.verder();
    return l.stopLes();
  }
}

/**
 * Eén vraag, met de hulp zoals Synthesis. Geeft `true` als hij meteen goed was.
 */
async function speelVraag(l: Lesgids, v: Vraag, st: { keer: number; handGezien: boolean }): Promise<boolean> {
  straat(l, { huizen: v.huizen, losse: v.losse ?? [], licht: null, goed: null, fout: null, actief: false, hand: false });
  speelLesgeluid("verschijn");
  if (aanloop(v).length) await l.zeg(...aanloop(v));
  if (v.soort === "terug") {
    /* Bliepo loopt eerst één keer terug langs de huizen. */
    await loopLangs(l, v);
  }
  await l.zeg(...vraagNaLopen(v));

  let meteen = true;
  const x = await antwoord(l, v, st);
  if (x !== v.goed) {
    meteen = false;
    if (x === null) {
      await l.zeg("Geen probleem.", "We doen het samen, stap voor stap.");
      await samen(l, v, st);
    } else {
      fout(l, v, x, st);
      await l.zeg(`${w(x)}? Niet helemaal.`);
      await l.zeg("Wil je hulp, of nog een keer proberen?");
      const keuze = await l.kies(["Nog een keer", "Hulp"], { weetniet: false, direct: true });
      if (keuze === "Nog een keer") {
        await l.zeg(...vraagZin(v).filter((z) => z !== "Typ het nummer."));
        const y = await antwoord(l, v, st);
        if (y !== v.goed) {
          if (y !== null) fout(l, v, y, st);
          await l.zeg(y === null ? "Geen probleem." : `${w(y)}? Niet helemaal.`, "Laten we het samen uitzoeken.");
          await samen(l, v, st);
        }
      } else {
        await l.zeg("Goed.", "We doen het samen, stap voor stap.");
        await samen(l, v, st);
      }
    }
  }

  /* Goed: het nummer komt op zijn plek en het huis springt even op. */
  const g = gat(v);
  const huizen = v.huizen.map((h, i) => (i === g ? v.goed : h));
  speelLesgeluid("goed");
  straat(l, { huizen, losse: [], goed: g, licht: null, fout: null, actief: false, hand: false });
  await l.zeg(goedZin(v));
  await l.wacht(500);
  return meteen;
}

/** De korte uitleg voor wie het nog niet kan: samen langs de straat lopen. */
async function uitleg(l: Lesgids) {
  const rij: Huisplek[] = [1, 2, 3, 4, 5, "?"];
  straat(l, { huizen: rij, licht: null, goed: null });
  await l.zeg("We lopen samen langs de huizen.");
  for (let i = 0; i < 5; i++) {
    straat(l, { licht: i });
    await l.zeg(w(i + 1));
  }
  straat(l, { licht: null });
  await l.zeg("Elk huis is één verder.", `Dus na ${w(5)} komt ${w(6)}.`);
  speelLesgeluid("goed");
  straat(l, { huizen: [1, 2, 3, 4, 5, 6], goed: 5 });
  await l.wacht(500);
  await l.zeg("We kunnen ook teruglopen.");
  for (const i of [5, 4, 3]) {
    straat(l, { licht: i, goed: null });
    await l.zeg(w(i + 1));
  }
  straat(l, { licht: null });
  await l.zeg("Terug wordt het nummer steeds één minder.", "Nu jij!");
}

const huisnummers: Lesdraaiboek = {
  nacht: true,
  id: "squla-huisnummers",
  titel: "Huisnummers: wat komt erna?",
  synthesis: "Squla groep 3 · Tellen · Telrij (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartHuisnummers,

  async speel(l) {
    const st = { keer: 0, handGezien: false };
    l.vlak<StraatProps>(SqulaStraat, { huizen: [21, 22, 23, 24, 25] });
    speelLesgeluid("verschijn");
    await l.zeg("Hoi!", "Kijk, een straat met huizen.", "Elk huis heeft een nummer.", "Welk nummer komt erna?", "Kun je dit al?");
    const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
    if (kan === "Ja") await l.zeg("Mooi.", "Laat maar eens zien.");
    else await uitleg(l);

    let fouten = 0;
    for (const v of VRAGEN) if (!(await speelVraag(l, v, st))) fouten++;

    const tik = l.kaart();
    await l.zeg(
      fouten === 0 ? (l.naam ? `Super, ${l.naam}!` : "Super!") : l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.",
      "Je weet welk huisnummer erna komt.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

export const LESSEN_SQULA_HUISNUMMERS: Lesdraaiboek[] = [huisnummers];
