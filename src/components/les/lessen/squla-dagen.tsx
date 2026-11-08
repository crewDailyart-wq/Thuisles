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
 * Sinds 4 november 2026 de hulp van Synthesis (BOUWREGELS 5.1): 1× fout = korte
 * reactie op de gekozen dag en meteen opnieuw; 2× fout = uitleg, het goede
 * antwoord in beeld en door naar de volgende opgave. Geen keuzevraag, geen
 * pauze. Geen weet-ik-niet-knop in deze les (besluit eigenaar).
 */

import { begeleideVraag, krijgtVervolgvraag, laatZienZin, naamMag, opener, uitlegVoorVraag, bevestig, zetSynthesisHulp } from "./squla-uitleg";
import { beginzinnen } from "@/lib/lessen/beginzinnen";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { DAGEN, KaartWeektrein, SqulaDagenTrein, type DagenTreinProps } from "../vlakken/squla-dagen-trein";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { bliepoScherm } from "@/lib/bliepo-scherm";

/* ---------- de dagen ---------- */

const ALLE = [0, 1, 2, 3, 4, 5, 6];
const naam = (d: number) => DAGEN[d].naam;
const Naam = (d: number) => DAGEN[d].naam[0].toUpperCase() + DAGEN[d].naam.slice(1);
const na = (d: number) => (d + 1) % 7;
/* Bij een goed antwoord alleen een korte bevestiging uit de gedeelde `bevestig()` (Sara, 4 nov); het waarom zit in het beeld. */
const voor = (d: number) => (d + 6) % 7;

/* ---------- het vlak ---------- */

const LEEG: Partial<DagenTreinProps> = {
  licht: [],
  lichtZacht: [],
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
  /** De tip (bewaard; de eerste fout gebruikt `reactie`). */
  tip: string[];
  /** Eerste fout: wat Bliepo zegt over de gekozen dag. Leeg = niets zeggen (slepen: de kaart wordt vaag). */
  reactie: (dag: number) => string[];
};

/**
 * Eén vraag, met de hulp van Synthesis (BOUWREGELS 5.1 en 5.10): goed = door; eerste fout = korte reactie op de
 * gekozen dag (+ hint) en meteen opnieuw; tweede fout = uitleg, het goede antwoord laten zien en door.
 * Geeft `true` als hij meteen goed was.
 */
/** De dagkaarten in een willekeurige volgorde, zodat het goede antwoord niet steeds op dezelfde plek staat (BOUWREGELS 1.23). */
function schudKaarten<T>(lijst: T[] | undefined): T[] | undefined {
  if (!lijst || lijst.length < 2) return lijst;
  const v = [...lijst];
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}

async function speelVraag(l: Lesgids, v: Vraag): Promise<boolean> {
  zet(l, { ...LEEG, ...v.beeld, ...(v.beeld.kaarten ? { kaarten: schudKaarten(v.beeld.kaarten) } : {}) });
  /* Voor de automatische test (zoals bij de verhaaltjessommen): welke wagon of kaart nu goed is. */
  const test = () => (window.__phaser = { ...window.__phaser, antwoord: DAGEN[v.goed[0]].naam });
  test();
  await l.zeg(...v.vraag);
  for (let poging = 1; ; poging++) {
    const x = await antwoord(l, v.invoer);
    if (v.goed.includes(x)) {
      await goed(l, v, x);
      return poging === 1;
    }
    bliepoScherm("fout"); /* Alleen Bliepo's scherm kleurt rood; geen fout-geluidje (Sara, 8 november 2026, besluit 2 en 3). */
    if (poging === 1) {
      /* De gekozen dag wordt vaag; het woord "fout" valt niet. */
      zet(l, v.invoer === "wagon" ? { wagonsUit: [x] } : { kaartenUit: [x] });
      const zinnen = v.reactie(x);
      if (zinnen.length) await l.zeg(...[opener(), ...zinnen].filter(Boolean));
      test();
      continue;
    }
    await uitlegVoorVraag(l, () => v.samen(l));
    zet(l, { ...LEEG, ...v.naGoed(v.goed[0]) });
    await l.zeg(...v.goedZin(v.goed[0]).filter((z) => z !== "Goed zo." && !z.trim().endsWith("?")));
    await l.wacht(400);
    return false;
  }
}

async function goed(l: Lesgids, v: Vraag, dag: number) {
  speelLesgeluid("goed"); bliepoScherm("goed");
  zet(l, { ...LEEG, ...v.naGoed(dag) });
  await l.zeg(bevestig());
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
    reactie: (c) => [`Dat is de wagon van ${naam(c)}.`, `Let op de ${DAGEN[d].bijvoeglijk} wagon.`],
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
      await l.zeg(`Zoek ${naam(d)} in de weektrein.`);
      if (d === 6) {
        await l.zeg("Zondag is de laatste wagon van de trein.", "Dan begint de week weer van voren af aan.");
        zet(l, { licht: [6, 0], lichtZacht: [6] });
        await l.zeg("Die begint weer bij de eerste wagon.");
      } else {
        await l.zeg(`Hier is ${naam(d)}.`);
        zet(l, { licht: [d, a], lichtZacht: [d] });
        await l.zeg(`Na ${naam(d)} komt de wagon erachter.`);
      }
    },
    tip: d === 6 ? ["Na de laatste wagon komt weer de eerste.", "Kijk naar het begin van de trein."] : [`Zet je vinger op ${naam(d)} en ga 1 wagon verder.`, "Lees de naam op die wagon."],
    reactie: (c) => [
      c === d ? `${Naam(d)} staat er al.` : c === voor(d) ? `${Naam(c)} is de wagon vóór ${naam(d)}.` : `${Naam(c)} staat niet direct achter ${naam(d)}.`,
      d === 6 ? "Na de laatste wagon begint de week opnieuw." : `Kijk in de trein naar de wagon van ${naam(d)}. De goede dag hangt er direct achter.`,
    ],
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
      await l.zeg(`Kijk waar ${naam(d)} in de trein staat.`);
      if (d === 0) {
        await l.zeg("Maandag is de eerste wagon.", "Daarvoor was de vorige week.");
        zet(l, { licht: [0, 6], lichtZacht: [0] });
        await l.zeg("Die eindigde met de laatste wagon.");
      } else {
        await l.zeg(`Hier is ${naam(d)}.`);
        zet(l, { licht: [a, d], lichtZacht: [d] });
        await l.zeg(`Voor ${naam(d)} komt de wagon ervoor.`);
      }
    },
    tip: d === 0 ? ["Voor de eerste wagon hoort de allerlaatste wagon van de week ervoor.", "Kijk naar het eind van de trein."] : [`Zet je vinger op ${naam(d)} en ga 1 wagon terug.`, "Lees de naam op die wagon."],
    reactie: (c) => [
      c === d ? `${Naam(d)} staat er al.` : c === na(d) ? `${Naam(c)} is de wagon ná ${naam(d)}.` : `${Naam(c)} staat niet direct vóór ${naam(d)}.`,
      d === 0 ? "Maandag staat vooraan. De dag ervoor staat helemaal aan het eind." : `Kijk in de trein naar de wagon van ${naam(d)}. De goede dag hangt er direct voor.`,
    ],
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
        if (!krijgtVervolgvraag(l)) await l.zeg("Welke dag komt voor dinsdag?");
      } else if (d === 6) {
        zet(l, { licht: [5] });
        await l.zeg("De lege plek is de laatste wagon.", "Ervoor staat zaterdag.");
        if (!krijgtVervolgvraag(l)) await l.zeg("Welke dag komt na zaterdag?");
      } else {
        zet(l, { licht: [voor(d), na(d)] });
        await l.zeg("Kijk naar de wagons naast de lege plek.", `Ervoor staat ${naam(voor(d))}.`, `Erachter staat ${naam(na(d))}.`);
        if (!krijgtVervolgvraag(l)) await l.zeg("Welke dag zit daartussen?");
      }
    },
    tip: [d === 0 ? "Het is de dag voor dinsdag." : `Het is de dag na ${naam(voor(d))}.`, "Sleep de goede dag naar de lege plek."],
    /* Slepen: een verkeerde kaart wordt vaag en schuift terug, zonder zin (zoals Synthesis). */
    reactie: () => [],
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
      await l.zeg(`De gele pijl staat bij ${naam(vandaag)}.`, "Daar is het nu.");
      if (wat === "gisteren") {
        zet(l, { licht: [a, vandaag], lichtZacht: [vandaag] });
        await l.zeg("Gisteren staat 1 wagon terug van de pijl.");
      } else {
        zet(l, { licht: [vandaag, a], lichtZacht: [vandaag] });
        await l.zeg("Morgen is de dag erna.");
      }
    },
    tip: [wat === "gisteren" ? `Zet je vinger op ${naam(vandaag)} en ga 1 wagon terug.` : `Zet je vinger op ${naam(vandaag)} en ga 1 wagon verder.`, wat === "gisteren" ? "Zoek de dag van gisteren." : "Zoek de dag van morgen."],
    reactie: (c) => [
      c === vandaag ? `${Naam(c)} is de dag van de gele pijl.` : wat === "gisteren" && c === na(vandaag) ? "Dat is morgen, niet gisteren." : wat === "morgen" && c === voor(vandaag) ? "Dat is gisteren, niet morgen." : `${Naam(c)} is niet de dag ${wat === "gisteren" ? "vlak voor" : "vlak na"} ${naam(vandaag)}.`,
      wat === "gisteren" ? `Gisteren is de wagon die 1 plek vóór ${naam(vandaag)} hangt.` : `Morgen is de wagon die 1 plek achter ${naam(vandaag)} hangt.`,
    ],
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
      await l.zeg("Zoek maandag in de trein.", "Vandaag is maandag.", "Gisteren is de dag voor vandaag.");
      zet(l, { licht: [0, 6], lichtZacht: [0] });
      await l.zeg("Dat is de laatste dag van de vorige week.");
    },
    tip: ["Maandag is de eerste wagon. Kijk waar de dag ervoor staat.", "Zoek de dag van gisteren."],
    reactie: (c) => [c === 1 ? "Dinsdag komt na maandag, niet ervoor." : `${Naam(c)} is niet de dag voor maandag.`, "Maandag staat vooraan. Zoek helemaal achteraan."],
  };
}

/** (f) Het weekend: eerst één dag, dan de andere. */
function weekendEerste(): Vraag {
  return {
    beeld: { wagons: ALLE },
    vraag: ["2 dagen samen heten het weekend.", "Tik op een dag van het weekend."],
    invoer: "wagon",
    goed: [5, 6],
    goedZin: (dag) => ["Goed zo.", `${Naam(dag)} hoort bij het weekend.`],
    naGoed: (dag) => ({ wagons: ALLE, gekozen: [dag] }),
    samen: async (l) => {
      zet(l, { licht: [5, 6] });
      await l.zeg("Kijk naar het eind van de trein.", "De laatste 2 dagen van de week zijn het weekend.", "Het zijn de paarse en de roze wagon.");
    },
    tip: ["Kijk naar de laatste 2 wagons.", "Tik op een dag van het weekend."],
    reactie: (c) => [`${Naam(c)} is een schooldag.`, "Kijk naar de laatste 2 wagons."],
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
      await l.zeg(`${Naam(eerste)} hoort al bij het weekend.`, "Het weekend heeft 2 dagen.");
      zet(l, { licht: [5, 6], lichtZacht: [eerste], gekozen: [eerste] });
      await l.zeg("Ze staan naast elkaar, aan het eind van de trein.");
    },
    tip: [`Kijk naar de wagon naast ${naam(eerste)}.`, "Tik op de andere dag van het weekend."],
    reactie: (c) => [c === eerste ? "Die dag heb je al gekozen." : `${Naam(c)} is een schooldag.`, `Kijk naar de wagon naast ${naam(eerste)}.`],
  };
}

/* ---------- het begin ---------- */

async function begin(l: Lesgids) {
  zetSynthesisHulp(l);
  l.vlak<DagenTreinProps>(SqulaDagenTrein, { ...LEEG, wagons: ALLE, rit: 1 });
  speelLesgeluid("verschijn");
  const opening = beginzinnen("squla-dagen-van-de-week")!;
  await l.zeg(`${opening.zin1} ${opening.zin2}`);
  const kan = await l.kies(["Ja", "Nee"], { weetniet: false, direct: true });
  if (kan === "Ja") {
    await l.zeg("Mooi.", "Laat maar eens zien.");
    return;
  }
  await l.zeg("We bekijken de weektrein samen. Elke wagon is 1 dag.");
  for (const d of ALLE) {
    zet(l, { licht: [d] });
    await l.zeg(`${Naam(d)}.`);
  }
  const stap = async (dag: number, vraag: string, tip: string, goedZin: string, wenk: string) => {
    await begeleideVraag(l, {
      toon: () => zet(l, { licht: [] }), vraag: [vraag],
      antwoord: () => antwoord(l, "wagon"), isGoed: (x) => x === dag,
      noem: naam, goed: async () => { zet(l, { licht: [dag] }); await l.zeg(goedZin); },
      samen: async () => { zet(l, { licht: [dag] }); await l.zeg(tip); },
      reactie: (x) => [`${Naam(x)} is het niet.`, wenk],
      toonAntwoord: async () => { zet(l, { licht: [dag] }); await l.zeg(goedZin); },
      tip: [tip], testAntwoord: `wagon-${dag}`,
    }, false);
  };
  await l.zeg("De week begint op maandag.");
  await stap(0, "Tik op de eerste dag van de week.", "De eerste wagon is maandag.", "Ja, maandag is de eerste dag van de week.", "Zoek de wagon die direct aan de locomotief hangt.");
  await l.zeg("Zaterdag en zondag vormen samen het weekend.");
  await stap(5, "Tik eerst op zaterdag.", "Zaterdag staat naast zondag, aan het einde van de trein.", "Dat is zaterdag, de eerste dag van het weekend.", "Het weekend zit helemaal aan het einde van de trein.");
  await stap(6, "Tik nu op de andere dag van het weekend.", "De dag na zaterdag is zondag.", "Precies, zondag. Zaterdag en zondag horen bij het weekend.", "Die wagon staat naast zaterdag, helemaal achteraan.");
  zet(l, { licht: [], weekend: false });
  await l.zeg("Nu mag je de gevraagde dagen op de trein zoeken.");
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
    await l.zeg(fouten === 0 ? (l.naam && naamMag(l) ? `Alles goed, ${l.naam}!` : "Alles goed!") : l.naam && naamMag(l) ? `Goed gewerkt, ${l.naam}!` : "Goed gewerkt!", "Je kent de dagen van de week.");
    await tik;
  },
};

export const LESSEN_SQULA_DAGEN: Lesdraaiboek[] = [dagenVanDeWeek];
