/**
 * Les "Huisnummers: wat komt erna?" (30 oktober 2026, opdracht eigenaar):
 * geïnspireerd op een oefening van Squla (groep 3, tellen, de telrij), met
 * eigen inhoud en eigen tekeningen: een straat in de avond met huisnummers.
 *
 * Leerdoel: de telrij tot 50. Welk getal komt erna, ervoor, ertussen, en
 * terugtellen. 17 vragen, eerst tot 20, dan tot 31, dan tot 50.
 *
 * Hulp zoals Synthesis (BOUWREGELS 5.1 en 5.10, 4 november 2026): goed = kort en door.
 * Eerste fout = een korte reactie op wat het kind koos (met een hint die bij de vraag
 * past) en meteen opnieuw. Tweede fout = Bliepo loopt langs de huizen, zet het goede
 * nummer op zijn plek en de les gaat door. Geen keuzevraag, geen pauze.
 *
 * Huisnummers staan allemaal wit op een donker bordje: in de zinnen {n:wit}.
 * Geen "Weet ik niet"-knop bij de keuzes (besluit eigenaar).
 */

import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";
import { bevestig, naamMag, opener, uitlegKeuze, zetSynthesisHulp } from "./squla-uitleg";
import { beginzinnen } from "@/lib/lessen/beginzinnen";
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
  if (v.soort === "tussen") return ["Kijk, op 1 bordje staat een vraagteken."];
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

/** Wat er klopt, met uitleg waarom (na de tweede fout). */
function kern(v: Vraag): string {
  if (v.soort === "na") return `Na ${w(ijk(v))} komt ${w(v.goed)}, want elk huis is 1 verder.`;
  if (v.soort === "voor" || v.soort === "terug") return `Voor ${w(ijk(v))} komt ${w(v.goed)}, want terug is het 1 minder.`;
  return `${w(v.goed)} hoort tussen ${w(v.goed - 1)} en ${w(v.goed + 1)}: het is 1 meer dan ${w(v.goed - 1)}.`;
}

function tipZin(v: Vraag): string {
  if (v.soort === "na") return `Tel vanaf het huis ervoor 1 verder.`;
  if (v.soort === "voor") return `Kijk naar het huis rechts van de lege plek. Tel vanaf dat nummer 1 terug.`;
  if (v.soort === "terug") return `Tel vanaf het laatste huis nog 1 terug.`;
  if (v.soort === "tussen") return `Kijk naar het huis links van het vraagteken. Tel vanaf dat nummer 1 verder.`;
  return `Kijk naar het huis links van de lege plek. Tel vanaf dat nummer 1 verder.`;
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
  bliepoScherm("fout"); /* Alleen Bliepo's scherm kleurt rood; geen fout-geluidje (Sara, 8 november 2026, besluit 2 en 3). */
  if (v.losse) straat(l, { fout: { n: x, keer: ++st.keer } });
}

/** Samen langs de straat lopen: elk huis licht op en Bliepo zegt het nummer. */
async function loopLangs(l: Lesgids, v: Vraag) {
  const g = gat(v);
  const plekken =
    v.soort === "voor" || v.soort === "terug"
      ? v.huizen.map((_, i) => i).filter((i) => i !== g).reverse()
      : v.huizen.map((_, i) => i).filter((i) => i < g);
  const eerder: number[] = [];
  for (const i of plekken) {
    /* Tellen hoort bij elkaar (besluit 4): wat Bliepo al noemde blijft zacht staan. */
    straat(l, { licht: i, lichtZacht: [...eerder] });
    eerder.push(i);
    await l.zeg(w(v.huizen[i] as number));
  }
  straat(l, { licht: null, lichtZacht: [] });
}

/** Het getal met omgedraaide cijfers (34 en 43). */
const omgedraaid = (n: number) => Number([...String(n)].reverse().join(""));

/** Eerste fout: wat Bliepo zegt over het gekozen nummer, en dan een hint die bij de vraag past. */
function reactie(v: Vraag, x: number | null): string[] {
  if (x === null) return [tipZin(v)];
  const bekend = nummers(v);
  const naarVoren = v.soort === "voor" || v.soort === "terug";
  const nr = v.losse ? `Het huis met ${w(x)}` : w(x);
  const koos = v.losse ? `Je sleepte het huis met ${w(x)}.` : `Je koos ${w(x)}.`;
  let zin: string;
  if (bekend.includes(x)) zin = `${nr} staat al in de straat.`;
  else if (x !== v.goed && omgedraaid(x) === v.goed && x > 9) zin = `${koos} Kijk of de cijfers in de goede volgorde staan.`;
  else if (v.soort === "tussen") zin = `${nr} past niet tussen ${w(v.goed - 1)} en ${w(v.goed + 1)}.`;
  else if (x === (naarVoren ? v.goed - 1 : v.goed + 1)) zin = `${nr} slaat een huis over.`;
  else if (naarVoren) zin = x > ijk(v) ? `${nr} is groter dan ${w(ijk(v))}, maar er hoort een kleiner nummer.` : `${nr} ligt te ver van ${w(ijk(v))} af.`;
  else zin = x < ijk(v) ? `${nr} is kleiner dan ${w(ijk(v))}, maar er hoort een groter nummer.` : `${nr} ligt te ver van ${w(ijk(v))} af.`;
  return [zin, tipZin(v)];
}

/** Tweede fout: samen langs de huizen lopen en zeggen hoe het zit (zonder de vraag nog eens te stellen). */
async function samen(l: Lesgids, v: Vraag): Promise<void> {
  if (v.soort === "voor" || v.soort === "terug") await l.zeg("Ik loop terug langs de huizen, van rechts naar links.");
  else await l.zeg("Ik loop langs de huizen tot aan de lege plek.");
  await loopLangs(l, v);
  if (v.soort === "voor" || v.soort === "terug") await l.zeg(`Van ${w(ijk(v))} naar het huis ervoor is het 1 minder.`);
  else await l.zeg(`Het huis na ${w(v.goed - 1)} is 1 verder.`);
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

  let goedAntwoord = false;
  let meteen = true;
  for (let poging = 1; ; poging++) {
    const x = await antwoord(l, v, st);
    if (x === v.goed) {
      goedAntwoord = true;
      meteen = poging === 1;
      break;
    }
    meteen = false;
    if (x !== null) fout(l, v, x, st);
    bliepoScherm("fout"); /* Geen fout-geluidje (besluit 3). */
    if (poging === 1) {
      await l.zeg(...[opener(), ...reactie(v, x)].filter(Boolean));
      continue;
    }
    await samen(l, v);
    break;
  }

  /* Het nummer komt op zijn plek en het huis springt even op. */
  const g = gat(v);
  const huizen = v.huizen.map((h, i) => (i === g ? v.goed : h));
  if (goedAntwoord) { speelLesgeluid("goed"); bliepoScherm("goed"); }
  straat(l, { huizen, losse: [], goed: g, licht: null, fout: null, actief: false, hand: false });
  await l.zeg(goedAntwoord ? bevestig() : kern(v));
  await l.wacht(500);
  return meteen;
}

/** De korte uitleg voor wie het nog niet kan: samen langs de straat lopen. */
async function uitleg(l: Lesgids) {
  straat(l, { huizen: [21, 22, 23, 24, "?"], licht: null, goed: null });
  await l.zeg("Ik loop langs de huizen. Elk volgend nummer is 1 meer.");
  for (let i = 0; i < 4; i++) {
    straat(l, { licht: i, lichtZacht: Array.from({ length: i }, (_, k) => k) });
    await l.zeg(w(21 + i));
  }
  straat(l, { licht: 4, lichtZacht: [0, 1, 2, 3] });
  await uitlegKeuze(l, {
    vraag: "Welk huisnummer komt na {24:wit}?",
    keuzes: ["23", "25", "26"], antwoord: "25",
    hint: "Tel hardop tot {24:wit}. Welk nummer zeg je daarna?",
    goed: "Ja, na {24:wit} komt {25:wit}. Het nummer wordt 1 groter.",
    reactie: (x) => [x === "23" ? "{23:wit} staat al in de straat." : `{${x}:wit} slaat een huis over.`, "Tel hardop tot {24:wit}. Welk nummer zeg je daarna?"],
    laatZien: "Na {24:wit} komt {25:wit}.",
  });
  straat(l, { huizen: [21, 22, 23, 24, 25], goed: 4, licht: null });
  await l.zeg("Nu ga jij ontbrekende huisnummers zoeken.");
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
    zetSynthesisHulp(l);
    l.vlak<StraatProps>(SqulaStraat, { huizen: [21, 22, 23, 24, 25] });
    speelLesgeluid("verschijn");
    const opening = beginzinnen("squla-huisnummers")!;
    await l.zeg(`${opening.zin1} ${opening.zin2}`);
    const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
    if (kan === "Ja") await l.zeg("Mooi.", "Laat maar eens zien.");
    else await uitleg(l);

    let fouten = 0;
    /* Herstel 7 november (BOUWREGELS 1.23): elke les-start staan de keuzes (en de losse huizen) op een andere plek; de antwoorden blijven gelijk. */
    const meng = (lijst: number[]) => {
      const a = [...lijst];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const vragen = VRAGEN.map((v) => ({ ...v, ...(v.opties ? { opties: meng(v.opties) } : {}), ...(v.losse ? { losse: meng(v.losse) } : {}) }));
    for (const v of vragen) if (!(await speelVraag(l, v, st))) fouten++;

    const tik = l.kaart();
    await l.zeg(
      fouten === 0 ? (l.naam && naamMag(l) ? `Super, ${l.naam}!` : "Super!") : l.naam && naamMag(l) ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.",
      "Je weet welk huisnummer erna komt.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

export const LESSEN_SQULA_HUISNUMMERS: Lesdraaiboek[] = [huisnummers];
