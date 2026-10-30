/**
 * Les "Dagen van de week" (groep 3, 30 oktober 2026, opdracht eigenaar):
 * geïnspireerd op een oefening van Squla (Tijd · Dagen van de week), alleen
 * het leerdoel; de inhoud, de zinnen en de tekeningen zijn eigen werk.
 *
 * Leerdoel: de 7 dagen in de goede volgorde, welke dag komt na of voor een
 * dag, gisteren, vandaag en morgen, en het weekend.
 *
 * Alles gebeurt op de weektrein (`../vlakken/squla-dagen-trein.tsx`): een
 * locomotief met zeven wagons, elke dag zijn eigen kleur en een plaatje.
 * Groep 3 leest nog niet: Bliepo noemt elke dag, en de kaarten en wagons
 * hebben altijd hun kleur en plaatje. Lang drukken (of de muis erop laten
 * staan) leest de naam van de dag voor.
 *
 * Hulp precies zoals Synthesis (zie `meteenS` in verhaaltjessommen.tsx):
 * 1× fout → "… Niet helemaal." en de keuze "Nog een keer" of "Hulp". Nog een
 * keer = dezelfde vraag; Hulp of nog een fout = samen uitzoeken. Daarna het
 * antwoord: 1× fout = een tip, 2× fout = "Zullen we even pauze nemen?" en de
 * les stopt. Geen "Weet ik niet" in deze les (besluit eigenaar).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { DAGEN, KaartWeektrein, SqulaDagenTrein, type DagenTreinProps } from "../vlakken/squla-dagen-trein";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- de dagen ---------- */

const ALLE = [0, 1, 2, 3, 4, 5, 6];
const naam = (d: number) => DAGEN[d].naam;
const Naam = (d: number) => DAGEN[d].naam[0].toUpperCase() + DAGEN[d].naam.slice(1);
const na = (d: number) => (d + 1) % 7;
const voor = (d: number) => (d + 6) % 7;

/* ---------- het vlak ---------- */

const LEEG: Partial<DagenTreinProps> = {
  licht: [],
  gekozen: [],
  wagonsUit: [],
  vandaag: null,
  weekend: false,
  wagonsActief: false,
  kaarten: [],
  kaartenUit: [],
  kaartenActief: false,
  slepen: false,
  handje: false,
};

const zet = (l: Lesgids, p: Partial<DagenTreinProps>) => l.pasVlakAan<DagenTreinProps>(p);

type Invoer = "wagon" | "kaart" | "sleep";

/** Wachten tot het kind een wagon tikt, een kaart tikt of een kaart naar de lege plek sleept. */
async function antwoord(l: Lesgids, invoer: Invoer): Promise<number> {
  if (invoer === "wagon") {
    zet(l, { wagonsActief: true });
    const g = await l.wachtOpVlak<{ soort: string; dag: number }>("wagon");
    zet(l, { wagonsActief: false });
    return g.dag;
  }
  zet(l, { kaartenActief: true, slepen: invoer === "sleep" });
  const g = await l.wachtOpVlak<{ soort: string; dag: number }>(invoer === "sleep" ? "leg" : "kaart");
  zet(l, { kaartenActief: false, handje: false });
  return g.dag;
}

/* ---------- een vraag ---------- */

type Vraag = {
  /** Wat er in beeld staat bij de vraag. */
  beeld: Partial<DagenTreinProps>;
  /** De vraag (ook bij "Nog een keer" en na het samen uitzoeken). */
  vraag: string[];
  invoer: Invoer;
  /** Welke dagen goed zijn. */
  goed: number[];
  goedZin: (dag: number) => string[];
  /** Wat er in beeld komt na een goed antwoord. */
  naGoed: (dag: number) => Partial<DagenTreinProps>;
  /** Samen uitzoeken: Bliepo wijst aan en legt uit (zonder het antwoord te zeggen). */
  samen: (l: Lesgids) => Promise<void>;
  /** De tip na één fout bij het samen uitzoeken. */
  tip: string[];
};

/** Eén vraag, met de hulp zoals Synthesis. Geeft `true` als hij meteen goed was. */
async function speelVraag(l: Lesgids, v: Vraag): Promise<boolean> {
  zet(l, { ...LEEG, ...v.beeld });
  /* Voor de automatische test (zoals bij de verhaaltjessommen): welke wagon of kaart nu goed is. */
  window.__phaser = { ...window.__phaser, antwoord: DAGEN[v.goed[0]].naam };
  await l.zeg(...v.vraag);
  const x = await antwoord(l, v.invoer);
  if (v.goed.includes(x)) {
    await goed(l, v, x);
    return true;
  }
  await l.zeg(`${Naam(x)}? Niet helemaal.`);
  await l.zeg("Wil je hulp, of nog een keer proberen?");
  const keuze = await l.kies(["Nog een keer", "Hulp"], { weetniet: false, direct: true });
  if (keuze === "Nog een keer") {
    await l.zeg(...v.vraag);
    const y = await antwoord(l, v.invoer);
    if (v.goed.includes(y)) {
      await goed(l, v, y);
      return false;
    }
    await l.zeg(`${Naam(y)}? Niet helemaal.`, "Laten we het samen uitzoeken.");
  } else await l.zeg("Goed.", "We doen het samen, stap voor stap.");

  /* Samen uitzoeken, dan het antwoord: 1× fout een tip, 2× fout even pauze. */
  await v.samen(l);
  await l.zeg(...v.vraag);
  for (let poging = 1; ; poging++) {
    const z = await antwoord(l, v.invoer);
    if (v.goed.includes(z)) {
      await goed(l, v, z);
      return false;
    }
    if (poging === 1) {
      /* De fout gekozen dag wordt vaag; het woord "fout" valt niet. */
      zet(l, v.invoer === "wagon" ? { wagonsUit: [z] } : { kaartenUit: [z] });
      await l.zeg(`${Naam(z)}? Niet helemaal.`);
      await l.verder();
      await l.zeg(...v.tip);
      continue;
    }
    await l.zeg(`${Naam(z)}? Dat is het nog niet.`, "Zullen we even pauze nemen?", "Dan doen we het straks nog eens.");
    await l.verder();
    return l.stopLes();
  }
}

async function goed(l: Lesgids, v: Vraag, dag: number) {
  speelLesgeluid("goed");
  zet(l, { ...LEEG, ...v.naGoed(dag) });
  await l.zeg(...v.goedZin(dag));
  await l.wacht(400);
}

/* ---------- de soorten vragen ---------- */

/** (a) Bliepo noemt een dag; het kind tikt op die wagon. */
function tikDag(d: number): Vraag {
  return {
    beeld: { wagons: ALLE },
    vraag: [`Tik op de wagon van ${naam(d)}.`],
    invoer: "wagon",
    goed: [d],
    goedZin: () => ["Goed zo.", `Dit is de wagon van ${naam(d)}.`],
    naGoed: () => ({ wagons: ALLE, gekozen: [d] }),
    samen: async (l) => {
      await l.zeg("We lopen samen langs de wagons.");
      for (let i = 0; i <= d; i++) {
        zet(l, { licht: [i] });
        await l.zeg(`${Naam(i)}.`);
      }
      await l.zeg(`${Naam(d)} is de ${DAGEN[d].bijvoeglijk} wagon.`);
    },
    tip: [`Zoek de ${DAGEN[d].bijvoeglijk} wagon.`, `Tik op de wagon van ${naam(d)}.`],
  };
}

/** (b) Welke dag komt na …? Een stukje trein met een lege plek, en drie kaarten. */
function welkeNa(d: number, kaarten: number[]): Vraag {
  const a = na(d);
  return {
    beeld: { wagons: [d, null], kaarten },
    vraag: [`Welke dag komt na ${naam(d)}?`],
    invoer: "kaart",
    goed: [a],
    goedZin: () => ["Goed zo.", `Na ${naam(d)} komt ${naam(a)}.`],
    naGoed: () => ({ wagons: [d, a] }),
    samen: async (l) => {
      zet(l, { wagons: ALLE, licht: [d] });
      await l.zeg("Kijk naar de hele trein.");
      if (d === 6) {
        await l.zeg("Zondag is de laatste wagon.", "Daarna begint een nieuwe week.");
        zet(l, { licht: [6, 0] });
        await l.zeg("Die begint weer bij de eerste wagon.");
      } else {
        await l.zeg(`Hier is ${naam(d)}.`);
        zet(l, { licht: [d, a] });
        await l.zeg(`Na ${naam(d)} komt de wagon erachter.`);
      }
    },
    tip: d === 6 ? ["Kijk naar de eerste wagon.", `Welke dag komt na ${naam(d)}?`] : [`Kijk naar de wagon achter ${naam(d)}.`, `Welke dag komt na ${naam(d)}?`],
  };
}

/** (c) Welke dag komt voor …? */
function welkeVoor(d: number, kaarten: number[]): Vraag {
  const a = voor(d);
  return {
    beeld: { wagons: [null, d], kaarten },
    vraag: [`Welke dag komt voor ${naam(d)}?`],
    invoer: "kaart",
    goed: [a],
    goedZin: () => ["Goed zo.", `Voor ${naam(d)} komt ${naam(a)}.`],
    naGoed: () => ({ wagons: [a, d] }),
    samen: async (l) => {
      zet(l, { wagons: ALLE, licht: [d] });
      await l.zeg("Kijk naar de hele trein.");
      if (d === 0) {
        await l.zeg("Maandag is de eerste wagon.", "Daarvoor was de vorige week.");
        zet(l, { licht: [0, 6] });
        await l.zeg("Die eindigde met de laatste wagon.");
      } else {
        await l.zeg(`Hier is ${naam(d)}.`);
        zet(l, { licht: [a, d] });
        await l.zeg(`Voor ${naam(d)} komt de wagon ervoor.`);
      }
    },
    tip: d === 0 ? ["Kijk naar de laatste wagon.", `Welke dag komt voor ${naam(d)}?`] : [`Kijk naar de wagon voor ${naam(d)}.`, `Welke dag komt voor ${naam(d)}?`],
  };
}

/** (d) Er mist een dag in de trein: sleep hem naar de lege plek. */
function ontbreekt(d: number, kaarten: number[], handje = false): Vraag {
  const trein = ALLE.map((i) => (i === d ? null : i));
  return {
    beeld: { wagons: trein, kaarten, handje },
    vraag: ["Er mist een dag in de trein.", "Sleep de goede dag naar de lege plek."],
    invoer: "sleep",
    goed: [d],
    goedZin: () => ["Goed zo.", d === 0 ? "Maandag is de eerste dag van de week." : d === 6 ? "Zondag is de laatste dag van de week." : `Tussen ${naam(voor(d))} en ${naam(na(d))} zit ${naam(d)}.`],
    naGoed: () => ({ wagons: ALLE, gekozen: [d] }),
    samen: async (l) => {
      if (d === 0) {
        zet(l, { licht: [1] });
        await l.zeg("De lege plek is de eerste wagon.", "Erachter staat dinsdag.");
        await l.zeg("Welke dag komt voor dinsdag?");
      } else if (d === 6) {
        zet(l, { licht: [5] });
        await l.zeg("De lege plek is de laatste wagon.", "Ervoor staat zaterdag.");
        await l.zeg("Welke dag komt na zaterdag?");
      } else {
        zet(l, { licht: [voor(d), na(d)] });
        await l.zeg("Kijk naar de wagons naast de lege plek.", `Ervoor staat ${naam(voor(d))}.`, `Erachter staat ${naam(na(d))}.`);
        await l.zeg("Welke dag zit daartussen?");
      }
    },
    tip: [d === 0 ? "Het is de dag voor dinsdag." : `Het is de dag na ${naam(voor(d))}.`, "Sleep de goede dag naar de lege plek."],
  };
}

/** (e) Vandaag is het …: welke dag was het gisteren, of welke dag is het morgen? Op de hele trein. */
function gisterenMorgen(vandaag: number, wat: "gisteren" | "morgen"): Vraag {
  const a = wat === "gisteren" ? voor(vandaag) : na(vandaag);
  const vraagZin = wat === "gisteren" ? "Welke dag was het gisteren?" : "Welke dag is het morgen?";
  return {
    beeld: { wagons: ALLE, vandaag },
    vraag: [`Vandaag is het ${naam(vandaag)}.`, vraagZin],
    invoer: "wagon",
    goed: [a],
    goedZin: () => ["Goed zo.", wat === "gisteren" ? `Gisteren was het ${naam(a)}.` : `Morgen is het ${naam(a)}.`],
    naGoed: () => ({ wagons: ALLE, vandaag, gekozen: [a] }),
    samen: async (l) => {
      zet(l, { licht: [vandaag] });
      await l.zeg(`De gele pijl staat bij ${naam(vandaag)}.`, "Dat is vandaag.");
      if (wat === "gisteren") {
        zet(l, { licht: [a, vandaag] });
        await l.zeg("Gisteren is de dag ervoor.");
      } else {
        zet(l, { licht: [vandaag, a] });
        await l.zeg("Morgen is de dag erna.");
      }
    },
    tip: [wat === "gisteren" ? `Kijk naar de wagon voor ${naam(vandaag)}.` : `Kijk naar de wagon achter ${naam(vandaag)}.`, vraagZin],
  };
}

/** (e, lastig) Vandaag is het maandag: welke dag was het gisteren? Zonder de hele trein, met kaarten. */
function gisterenVanMaandag(kaarten: number[]): Vraag {
  return {
    beeld: { wagons: [null, 0], vandaag: 0, kaarten },
    vraag: ["Vandaag is het maandag.", "Welke dag was het gisteren?"],
    invoer: "kaart",
    goed: [6],
    goedZin: () => ["Goed zo.", "Gisteren was het zondag."],
    naGoed: () => ({ wagons: [6, 0], vandaag: 0 }),
    samen: async (l) => {
      zet(l, { wagons: ALLE, vandaag: 0, licht: [0] });
      await l.zeg("Kijk naar de hele trein.", "Vandaag is maandag.", "Gisteren is de dag ervoor.");
      zet(l, { licht: [0, 6] });
      await l.zeg("Dat is de laatste dag van de vorige week.");
    },
    tip: ["Kijk naar de laatste wagon.", "Welke dag was het gisteren?"],
  };
}

/** (f) Het weekend: eerst één dag, dan de andere. */
function weekendEerste(): Vraag {
  return {
    beeld: { wagons: ALLE },
    vraag: ["Twee dagen samen heten het weekend.", "Tik op een dag van het weekend."],
    invoer: "wagon",
    goed: [5, 6],
    goedZin: (dag) => ["Goed zo.", `${Naam(dag)} hoort bij het weekend.`],
    naGoed: (dag) => ({ wagons: ALLE, gekozen: [dag] }),
    samen: async (l) => {
      zet(l, { licht: [5, 6] });
      await l.zeg("Kijk naar het eind van de trein.", "Het weekend zijn de laatste twee dagen.", "Het zijn de paarse en de roze wagon.");
    },
    tip: ["Kijk naar de laatste twee wagons.", "Tik op een dag van het weekend."],
  };
}

function weekendTweede(eerste: number): Vraag {
  const ander = eerste === 5 ? 6 : 5;
  return {
    beeld: { wagons: ALLE, gekozen: [eerste] },
    vraag: ["Tik op de andere dag van het weekend."],
    invoer: "wagon",
    goed: [ander],
    goedZin: () => ["Goed zo.", "Zaterdag en zondag zijn het weekend.", "Dan is er geen school."],
    naGoed: () => ({ wagons: ALLE, gekozen: [5, 6], weekend: true }),
    samen: async (l) => {
      zet(l, { licht: [eerste] });
      await l.zeg(`${Naam(eerste)} hoort al bij het weekend.`, "Het weekend heeft twee dagen.");
      zet(l, { licht: [5, 6], gekozen: [eerste] });
      await l.zeg("Ze staan naast elkaar, aan het eind van de trein.");
    },
    tip: [`Kijk naar de wagon naast ${naam(eerste)}.`, "Tik op de andere dag van het weekend."],
  };
}

/* ---------- het begin ---------- */

async function begin(l: Lesgids) {
  l.vlak<DagenTreinProps>(SqulaDagenTrein, { ...LEEG, wagons: ALLE, rit: 1 });
  speelLesgeluid("verschijn");
  await l.zeg("Hoi!", "Kijk, daar komt de weektrein.");
  await l.wacht(800);
  await l.zeg("Elke wagon is een dag van de week.");
  for (const d of ALLE) {
    zet(l, { licht: [d] });
    await l.zeg(`${Naam(d)} is de ${DAGEN[d].bijvoeglijk} wagon.`);
  }
  zet(l, { licht: [] });
  await l.zeg("Samen zijn dat de {7} dagen van de week.", "Ze staan altijd in deze volgorde.", "Kun je dit al?");
  const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
  if (kan === "Ja") {
    await l.zeg("Mooi.", "Laat maar eens zien.");
    return;
  }
  /* De korte uitleg. */
  await l.zeg("Geen probleem.", "Ik leg het kort uit.");
  zet(l, { licht: [0] });
  await l.zeg("De week begint met maandag.");
  zet(l, { licht: [6] });
  await l.zeg("De week eindigt met zondag.", "Daarna begint de week weer opnieuw.");
  zet(l, { licht: [5, 6], weekend: true });
  await l.zeg("Zaterdag en zondag zijn het weekend.", "Dan is er geen school.");
  await l.verder();
  zet(l, { licht: [], weekend: false });
  await l.zeg("Nu jij!");
}

/* ---------- de les ---------- */

const dagenVanDeWeek: Lesdraaiboek = {
  nacht: true,
  id: "squla-dagen-van-de-week",
  titel: "Dagen van de week",
  synthesis: "Squla groep 3 · Tijd · Dagen van de week (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartWeektrein,

  async speel(l) {
    await begin(l);

    /* 17 vragen, van makkelijk naar moeilijk. */
    const vragen: (Vraag | "weekend")[] = [
      tikDag(3), // donderdag
      tikDag(5), // zaterdag
      tikDag(1), // dinsdag
      welkeNa(1, [4, 2, 0]), // na dinsdag: woensdag
      welkeNa(4, [5, 3, 6]), // na vrijdag: zaterdag
      welkeVoor(4, [3, 5, 2]), // voor vrijdag: donderdag
      welkeVoor(2, [3, 0, 1]), // voor woensdag: dinsdag
      ontbreekt(2, [4, 2, 0], true), // woensdag mist (het handje doet het voor)
      ontbreekt(5, [5, 3, 6]), // zaterdag mist
      ontbreekt(0, [1, 6, 0]), // maandag mist
      gisterenMorgen(2, "gisteren"), // dinsdag
      gisterenMorgen(4, "morgen"), // zaterdag
      "weekend", // twee vragen: eerst één dag, dan de andere
      welkeNa(6, [5, 0, 1]), // na zondag: maandag
      welkeVoor(0, [6, 1, 5]), // voor maandag: zondag
      gisterenVanMaandag([1, 6, 5]), // zondag
    ];

    let fouten = 0;
    for (const v of vragen) {
      if (v === "weekend") {
        const eerste = weekendEerste();
        let gekozen = 5;
        const oorspronkelijk = eerste.naGoed;
        eerste.naGoed = (dag) => {
          gekozen = dag;
          return oorspronkelijk(dag);
        };
        if (!(await speelVraag(l, eerste))) fouten++;
        if (!(await speelVraag(l, weekendTweede(gekozen)))) fouten++;
        continue;
      }
      if (!(await speelVraag(l, v))) fouten++;
    }

    /* De kaart. */
    const tik = l.kaart();
    speelLesgeluid("kaart");
    await l.zeg(fouten === 0 ? (l.naam ? `Alles goed, ${l.naam}!` : "Alles goed!") : l.naam ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "Je kent de dagen van de week.");
    await tik;
  },
};

export const LESSEN_SQULA_DAGEN: Lesdraaiboek[] = [dagenVanDeWeek];
