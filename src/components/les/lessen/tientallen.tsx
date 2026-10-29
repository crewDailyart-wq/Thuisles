/**
 * Lessen van het onderdeel Tientallen — naar Synthesis "Grouping 10s · 10s All
 * the Way Up" en "Power of Place · The Power of Place" (INSPIRATIE.md, ronde 1
 * en 2, en blok B "Bundelmachine"). Groep 3. Zie ../soort.ts en ../BOUWEN.md.
 *
 * 1. Groepjes van tien: de bundelmachine. Bij de tiende stip kruipen de stippen
 *    vanzelf samen tot een groepje van 10; bij tien groepjes wordt het één
 *    groot groepje van 100. Daarna zelf getallen bouwen (47, 60, 13 met losse stippen).
 * 2. De plek van de tientallen: de plaatsmachine. Van 0 tot 9 past alles in één
 *    vak; bij tien is er geen cijfer meer en komt er een tweede vak bij.
 *
 * Bewust anders dan Synthesis: geen leeftijd vragen (privacy), maar een getal
 * dat het kind zelf kiest; en voor groep 3 stoppen we bij 100 (geen 1000).
 *
 * Tweede bouwronde (10 oktober 2026): de groep-3-delen van de groep-4-lessen
 * uit dezelfde units, in de volgorde van Synthesis. De toetsen van Grouping 10s
 * (6 en 8 groepjes van tien), Read Splodges en Add and Subtract Splodges met de
 * kloddermachine, de toetsen van Power of Place (54 en 28 bouwen in twee
 * kolommen), Part 2 tot 99, klodders bouwen tot 100 (Expanding Splodges) en
 * plaatswaarde benoemen in een som onder elkaar (2-Digit Subtraction).
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { knoppenOpPlek } from "./antwoordknoppen";
import { KaartLichtbol, SterMachine, type SterMachineMelding, type SterMachineProps } from "../vlakken/tientallen-holo-machine";
import { testHaak } from "../vlakken/tientallen-holo-basis";
import { HoloPlaatsmachine, type HoloPlaatsMelding, type HoloPlaatsProps } from "../vlakken/tientallen-holo-plaats";
import { Plaatsmachine, type PlaatsMelding, type PlaatsProps } from "../vlakken/tientallen-plaatsmachine";
import { Kloddermachine, type KlodderMelding, type KloddermachineProps } from "../vlakken/tientallen-kloddermachine";
import { Kolommen, type KolomMelding, type KolommenProps } from "../vlakken/tientallen-kolommen";
import { Onderelkaar, type OnderelkaarProps } from "../vlakken/tientallen-onderelkaar";
import { Klodder } from "../vlakken/optellen100-machine";
import { kiesGetal } from "./optellen-tot-20";

/* ---------- kaarttekeningen (SVG van 244 × 190) ---------- */

/** De kaart van Groepjes van tien: één lichtbol van tien sterren. */
function KaartLichtbolGroot() {
  return <KaartLichtbol x={122} y={95} r={70} />;
}

function KaartPlaats() {
  return (
    <g>
      <line x1={50} y1={30} x2={50} y2={170} stroke="#aabbe0" strokeWidth={2.5} />
      <line x1={122} y1={30} x2={122} y2={170} stroke="#aabbe0" strokeWidth={2.5} />
      <line x1={194} y1={30} x2={194} y2={170} stroke="#aabbe0" strokeWidth={2.5} />
      <circle cx={86} cy={80} r={24} fill="#3fb34f" />
      <text x={86} y={160} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
        1
      </text>
      <text x={158} y={160} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
        0
      </text>
    </g>
  );
}

/* ---------- hulp volgens de vaste regels (Phaser-lessen, 27 oktober 2026) ---------- */

/*
  De hologramlessen volgen de algemene hulpregels (INSPIRATIE.md "R3 ·
  ALGEMENE HULPREGELS", LESSENPLAN.md § 1d):
  - 1× fout: een vriendelijke reactie en één hint bij de handeling; de foute
    keuze valt weg en het kind probeert opnieuw;
  - 2× fout of "weet ik niet": Bliepo zegt het antwoord met de reden, en
    "We komen hier later op terug": de vraag komt aan het eind terug;
  - de eerste keer in een les wijst Bliepo de knoppen aan (groep 3 leest nog niet).
*/

/** Vragen die later in de les terugkomen. */
export type Later = { lijst: (() => Promise<void>)[] };
export const nieuwLater = (): Later => ({ lijst: [] });

/** Welke lessen de knoppen al hebben aangewezen (per afspeelronde: per gids). */
const aangewezen = new WeakSet<Lesgids>();

/** De eerste keer: Bliepo wijst het vraagteken en het vinkje aan, terwijl de keuzes al in beeld staan. */
export async function wijsKeuzeKnoppen(l: Lesgids) {
  if (aangewezen.has(l)) return;
  aangewezen.add(l);
  await l.wijsAan("weetniet", "Weet je het niet? Tik dan op het vraagteken.");
  await l.wacht(150);
}

/** Een getal kiezen; de eerste keer wijst Bliepo de knoppen aan. */
export async function kiesGetalHolo(l: Lesgids, lijst: number[]): Promise<number | null> {
  const p = kiesGetal(l, lijst);
  await wijsKeuzeKnoppen(l);
  return p;
}

export type Getalvraag = {
  /** De vraag (ook als hij later terugkomt). */
  vraag: string[];
  lijst: number[];
  goed: number;
  bijGoed: string[];
  /** Eén hint bij de eerste fout. */
  hint: (x: number) => string[];
  /** Het antwoord met de reden (bij 2× fout of "weet ik niet"). */
  antwoord: string[];
  /** Zet het beeld weer klaar als de vraag later terugkomt. */
  klaarzetten?: () => void | Promise<void>;
};

/**
 * Een keuzevraag met getallen in een les. Geeft terug of het in één keer goed
 * was. Met `later` komt de vraag na 2× fout of "weet ik niet" aan het eind terug.
 */
export async function getalvraag(l: Lesgids, v: Getalvraag, later?: Later, zegVraag = true): Promise<boolean> {
  if (zegVraag) await l.zeg(...v.vraag);
  testHaak({ antwoord: v.goed, vraagId: Math.random() });
  const x = await kiesGetalHolo(l, v.lijst);
  if (x === v.goed) {
    await l.zeg(...v.bijGoed);
    return true;
  }
  if (x !== null) {
    await l.zeg(...v.hint(x));
    const y = await kiesGetal(l, v.lijst.filter((w) => w !== x));
    if (y === v.goed) {
      await l.zeg(...v.bijGoed);
      return false;
    }
  }
  await l.zeg(x === null ? "Geen zorgen." : "Kijk maar.", ...v.antwoord, later ? "Dat zien we later." : "");
  await l.verder();
  if (later)
    later.lijst.push(async () => {
      await v.klaarzetten?.();
      await getalvraag(l, v);
    });
  return false;
}

/** Aan het eind van de les: de vragen die nog terug moesten komen. */
export async function speelLater(l: Lesgids, later: Later) {
  if (later.lijst.length === 0) return;
  await l.zeg("We gaan nog even terug.", later.lijst.length === 1 ? "Er was nog één vraag." : "Er waren nog een paar vragen.");
  const lijst = later.lijst.splice(0);
  for (const vraag of lijst) await vraag();
}

/* ---------- 1. Groepjes van tien (hologrammen: sterren en lichtbollen) ---------- */

/** "1 ster", "3 sterren". */
function sterren(n: number): string {
  return n === 1 ? "{1} ster" : `{${n}} sterren`;
}
/** "1 lichtbol", "3 lichtbollen". */
function bollen(n: number): string {
  return n === 1 ? "één lichtbol" : `{${n}} lichtbollen`;
}

/** Een getal in lichtbollen en losse sterren: "4 lichtbollen en 7 losse sterren". */
function inBollen(n: number): string {
  const t = Math.floor(n / 10);
  const e = n % 10;
  if (t === 0) return sterren(e);
  if (e === 0) return `${bollen(t)}, en geen losse sterren`;
  return `${bollen(t)} en ${e === 1 ? "{1} losse ster" : `{${e}} losse sterren`}`;
}

/*
  Volgt LESSENPLAN.md G12 en Synthesis "Grouping 10s · 10s All the Way Up":
  één voor één sterren maken tot ze bij tien vanzelf samenkruipen tot een
  lichtbol (het wauw-moment), tot 20, dan 100 (de makkelijkere manier pas als
  het kind zelf het handje gebruikt), vrij spelen en bouwopdrachten.
  Eigen Bliepo: we vragen niet naar de leeftijd maar beginnen bij 7 sterren;
  444 en 1000 (groep 5) vallen weg. 18 opgaven.
*/
const groepjesVanTien: Lesdraaiboek = {
  id: "tientallen-groepjes-van-tien",
  titel: "Groepjes van tien",
  synthesis: "Grouping 10s · 10s All the Way Up",
  kaarttekening: KaartLichtbolGroot,

  async speel(ruw) {
    /* Het vinkje en het vraagteken (het handje) staan op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
    const l = knoppenOpPlek(ruw, {
      voor: SterMachine,
      soorten: { klaar: "controleer", hand: "weetniet" },
      aanwijs: { klaar: "controleer", hand: "weetniet" },
      zichtbaar: (p) => [p.klaar ? "klaar" : "", p.hand ? "hand" : ""].filter(Boolean),
    });
    const later = nieuwLater();
    const st: SterMachineProps = { aantal: 0, knoppen: [10, 1], actief: false, wissen: true, klaar: true, hand: true, wijs: null };
    l.vlak(SterMachine, { ...st });
    const zet = (p: Partial<SterMachineProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<SterMachineProps>(p);
    };
    let knoppenUitgelegd = false;

    /** Vrij bouwen tot het kind op het vinkje tikt. Geeft het getal, of `null` bij het handje. */
    const bouw = async (max = 100): Promise<number | null> => {
      /* Het vinkje en het vraagteken staan er pas als de les erop wacht; daarom eerst wachten, dan aanwijzen. */
      let wacht: Promise<SterMachineMelding> | null = l.wachtOpVlak<SterMachineMelding>(["plus", "wis", "klaar", "hand"]);
      wacht.catch(() => {});
      if (!knoppenUitgelegd) {
        knoppenUitgelegd = true;
        await l.wijsAan("klaar", "Ben je klaar? Tik dan op het vinkje.");
        await l.wijsAan("hand", "Wil je hulp? Tik dan op het vraagteken.");
        await l.wijsAan("wis", "Met deze knop begin je opnieuw.");
      }
      zet({ actief: true });
      for (;;) {
        const g = await (wacht ?? l.wachtOpVlak<SterMachineMelding>(["plus", "wis", "klaar", "hand"]));
        wacht = null;
        if (g.soort === "plus") {
          if (st.aantal + g.waarde <= max) zet({ aantal: st.aantal + g.waarde });
        } else if (g.soort === "wis") zet({ aantal: 0 });
        else {
          zet({ actief: false });
          return g.soort === "klaar" ? st.aantal : null;
        }
      }
    };

    /** Tikken (met één soort knop) tot het aantal er is; Bliepo telt mee. */
    const telTot = async (doel: number, waarde: 1 | 10) => {
      testHaak({ doel });
      zet({ actief: true });
      while (st.aantal < doel) {
        const g = await l.wachtOpVlak<SterMachineMelding>("plus");
        if (g.soort !== "plus" || g.waarde !== waarde) continue;
        zet({ aantal: st.aantal + waarde, wijs: null });
        void l.zeg(`{${st.aantal}}`).catch(() => {});
      }
      zet({ actief: false });
      await l.wacht(st.aantal % 10 === 0 ? 1500 : 900);
    };

    /* Korte proef: kan het kind de machine al gebruiken? (Synthesis: 444; groep 3: 34.) */
    await l.zeg("Kijk, dit is een sterrenmachine.", "Maak met de machine het getal {34}.");
    testHaak({ doel: 34 });
    const instap = await bouw();
    if (instap === 34) {
      await l.zeg("Precies goed!", "Je kent de machine al.", "Toch kijken we samen hoe hij werkt.");
    } else if (instap === null) {
      await l.zeg("Geen probleem.", "We doen het samen.", "Dan laat ik zien hoe de machine werkt.");
    } else {
      await l.zeg(
        `Hm, je hebt {${instap}} gemaakt.`,
        instap === 43 ? "De lichtbollen en de losse sterren zijn omgedraaid." : "",
        "We doen het samen.",
        "Dan laat ik zien hoe de machine werkt.",
      );
    }
    await l.verder();

    /* Zeven sterren, één voor één. */
    zet({ aantal: 0, knoppen: [1], wissen: false, klaar: false, hand: false, wijs: 1 });
    await l.zeg("We beginnen met {7} sterren.", "Tik op deze knop.");
    await telTot(7, 1);
    await l.zeg(`Kijk, ${sterren(7)}.`, "Sterren zijn handig om te tellen.", "Maar wat lees je makkelijker?", "Het getal {7}, of de sterren?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const lees = await l.kies(["7", "De sterren"]);
    if (lees === "7") await l.zeg("Dat vind ik ook.", "Daarom hebben mensen cijfers bedacht.");
    else await l.zeg("Bij een paar sterren gaat dat nog.", "Bij heel veel sterren wordt tellen lastig.", "Daarom hebben mensen cijfers bedacht.");
    await l.verder();

    /* Tot 10: het samenkruipen. */
    await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "Doe er eens {3} sterren bij.");
    await telTot(10, 1);
    await l.zeg("Wauw!", "Kijk wat er gebeurde.");
    await getalvraag(
      l,
      {
        vraag: ["Hoeveel sterren hebben we nu?"],
        lijst: [7, 9, 10, 11],
        goed: 10,
        bijGoed: ["Ja, {10} sterren.", "Goed geteld."],
        hint: (x) => [`{${x}}?`, "We hadden er {7}.", "Daarna deden we er {3} bij."],
        antwoord: ["We hadden er {7}.", "Daarna telden we tot {10}.", "Het zijn {10} sterren."],
        klaarzetten: () => zet({ aantal: 10, knoppen: [] }),
      },
      later,
    );
    await l.zeg("Bij {10} kropen de sterren samen.", "De losse sterren werden één lichtbol.");
    await l.verder();

    /* Twee lichtbollen. Bij een fout meteen uitleg, zoals Synthesis (geen "fout"). */
    await l.zeg("In één lichtbol zitten {10} sterren.", "Hoeveel sterren zitten er in {2} lichtbollen?");
    testHaak({ antwoord: 20, vraagId: Math.random() });
    const twee = await kiesGetalHolo(l, [2, 10, 20]);
    if (twee === 20) await l.zeg("Ja, {20} sterren.");
    else await l.zeg(twee === null ? "Geen zorgen." : "", "{10} sterren in de eerste lichtbol.", "En {10} sterren in de tweede.", "Samen zijn dat {20} sterren.");
    await l.zeg("Nu tellen we samen tot {20}.", "Doe de sterren erbij, één voor één.");
    await telTot(20, 1);
    await l.zeg("Wauw, het gebeurde weer!");
    await getalvraag(
      l,
      {
        vraag: ["Hoeveel sterren moeten erbij voor nóg een lichtbol?"],
        lijst: [10, 20, 30],
        goed: 10,
        bijGoed: ["Ja, je snapt het.", "Je telt nu met tientallen."],
        hint: () => ["Kijk naar een lichtbol.", "Hoeveel sterren zitten erin?"],
        antwoord: ["Elke lichtbol heeft {10} sterren.", "Dus er moeten er {10} bij."],
        klaarzetten: () => zet({ aantal: 20, knoppen: [] }),
      },
      later,
    );

    /* Naar 100: de lange weg, of het handje (de makkelijkere manier pas als het kind erom vraagt). */
    zet({ knoppen: [1], hand: true });
    await l.zeg("Nu wil ik {100} sterren.", "Je mag ze één voor één erbij doen.", "Of tik op het vraagteken.", "Dan laat ik een makkelijkere manier zien.");
    /* Het vraagteken staat er pas als de les erop wacht; daarom eerst wachten, dan aanwijzen. */
    let wachtHand: Promise<SterMachineMelding> | null = l.wachtOpVlak<SterMachineMelding>(["plus", "hand"]);
    wachtHand.catch(() => {});
    await l.wijsAan("hand", "Dit is het vraagteken.");
    testHaak({ hand: true });
    zet({ actief: true });
    let extra = 0;
    for (;;) {
      const g = await (wachtHand ?? l.wachtOpVlak<SterMachineMelding>(["plus", "hand"]));
      wachtHand = null;
      if (g.soort === "hand") break;
      if (g.soort !== "plus") continue;
      zet({ aantal: st.aantal + 1 });
      extra++;
      void l.zeg(`{${st.aantal}}`).catch(() => {});
      if (extra === 8) {
        zet({ actief: false });
        await l.wacht(900);
        await l.zeg("Dat duurt lang, hè?", "Tik op het vraagteken.");
        zet({ actief: true });
      }
      if (extra >= 20) break;
    }
    zet({ actief: false, hand: false });
    testHaak({ hand: false });
    await l.zeg("Mooi.", "We doen het slim.");
    if (st.aantal % 10 !== 0) {
      await l.zeg("Eerst haal ik de losse sterren weg.");
      zet({ aantal: Math.floor(st.aantal / 10) * 10 });
      await l.wacht(500);
    }
    zet({ knoppen: [10], wijs: 10 });
    await l.zeg("Ik zet een nieuwe knop op de machine.", "Elke tik geeft een lichtbol van {10}.", "Druk maar flink op die knop.");
    await telTot(100, 10);
    await l.wacht(600);
    await l.zeg("Het is je gelukt!", "{100} sterren.");
    await getalvraag(
      l,
      {
        vraag: ["Hoeveel lichtbollen kropen samen tot de grote bol?"],
        lijst: [5, 9, 10, 100],
        goed: 10,
        bijGoed: ["Ja, {10} lichtbollen.", "{10} sterren worden één lichtbol.", "En {10} lichtbollen worden één grote bol van {100}."],
        hint: () => ["Tel maar mee.", "{10}, {20}, {30}, tot {100}.", "Hoeveel lichtbollen waren dat?"],
        antwoord: ["Het waren {10} lichtbollen.", "{10} lichtbollen worden één grote bol van {100}."],
        klaarzetten: () => zet({ aantal: 100, knoppen: [] }),
      },
      later,
    );
    await getalvraag(
      l,
      {
        vraag: ["Stel, je wilt een nóg grotere bol.", "Hoeveel grote bollen heb je dan nodig?"],
        lijst: [2, 5, 10, 100],
        goed: 10,
        bijGoed: ["Goed zo.", "Bij {10} maak je weer iets nieuws."],
        hint: () => ["Kijk naar wat we deden.", "Hoeveel sterren voor één lichtbol?", "Hoeveel lichtbollen voor een grote bol?"],
        antwoord: ["Het is steeds hetzelfde.", "Bij {10} maak je iets nieuws.", "Ook bij de grote bollen: {10}."],
      },
      later,
    );
    await l.zeg("Zo kun je steeds grotere getallen maken.");
    await l.verder();

    /* Vrij spelen. */
    zet({ aantal: 0, knoppen: [10, 1], wissen: true, klaar: true, wijs: null });
    await l.zeg("Speel even met de machine.", "Tik op het vinkje als je klaar bent.");
    testHaak({ doel: 23 });
    const vrij = await bouw();
    await l.zeg("Knap gedaan!", vrij ? `Je maakte {${vrij}}.` : "");

    /* Lezen: welk getal maken de lichtbollen? */
    zet({ aantal: 60, knoppen: [], wissen: false, klaar: false });
    await getalvraag(
      l,
      {
        vraag: ["Kijk naar de lichtbollen.", "Hoeveel sterren zijn het samen?"],
        lijst: [6, 50, 60, 600],
        goed: 60,
        bijGoed: ["Ja, precies.", "{6} lichtbollen van {10}.", "Dat zijn {60} sterren."],
        hint: (x) => (x === 6 ? ["Ja, het zijn {6} lichtbollen.", "Maar in elke lichtbol zitten {10} sterren."] : ["Tel de lichtbollen met tientallen.", "{10}, {20}, {30}, …"]),
        antwoord: ["{10}, {20}, {30}, {40}, {50}, {60}.", "Het zijn {60} sterren."],
        klaarzetten: () => zet({ aantal: 60, knoppen: [] }),
      },
      later,
    );
    zet({ aantal: 35 });
    await getalvraag(
      l,
      {
        vraag: ["En nu?", "Welk getal is dit?"],
        lijst: [8, 35, 53, 305],
        goed: 35,
        bijGoed: ["Goed zo.", "{3} lichtbollen en {5} losse sterren.", "Dat is {35}."],
        hint: (x) =>
          x === 53 ? ["Kijk goed.", "Eerst tellen we de lichtbollen.", "Dan de losse sterren."] : x === 8 ? ["Er zijn {3} lichtbollen.", "Maar elke lichtbol is {10}."] : ["Tel eerst de lichtbollen: {10}, {20}, {30}.", "Dan de losse sterren erbij."],
        antwoord: ["{10}, {20}, {30}.", "En dan nog {5} losse sterren: {35}."],
        klaarzetten: () => zet({ aantal: 35, knoppen: [] }),
      },
      later,
    );

    /* Bouwopdrachten: met een nul, met te veel losse sterren, en nog wat oefenen. */
    const opdrachten: { doel: number; alleenEnen?: boolean }[] = [{ doel: 47 }, { doel: 60 }, { doel: 13, alleenEnen: true }, { doel: 25 }, { doel: 82 }];
    const bouwOpdracht = async (doel: number, alleenEnen: boolean, i: number, terug: boolean) => {
      zet({ aantal: 0, knoppen: alleenEnen ? [1] : [10, 1], wissen: true, klaar: true, hand: true });
      const t = Math.floor(doel / 10);
      const e = doel % 10;
      await l.zeg(
        terug ? `Weet je nog, {${doel}}?` : i === 0 ? "Nu bouw jij een getal." : alleenEnen ? "Deze keer zijn er alleen losse sterren." : i === 1 ? "Nog één om te oefenen." : "Nog een.",
        `Maak {${doel}}.`,
      );
      testHaak({ doel });
      let gelukt = false;
      for (let poging = 0; poging < 2 && !gelukt; poging++) {
        const x = await bouw();
        if (x === doel) {
          gelukt = true;
          break;
        }
        if (x === null) break;
        const omgedraaid = Number(String(doel).padStart(2, "0").split("").reverse().join(""));
        await l.zeg(`Je hebt {${x}} gemaakt.`, x === omgedraaid && x !== doel ? "De lichtbollen en de losse sterren zijn omgedraaid." : x < doel ? "Dat is te weinig." : "Dat is te veel.");
        if (poging === 0) {
          zet({ aantal: 0 });
          await l.zeg("Probeer het nog eens.", `Maak {${doel}}.`);
        }
      }
      if (!gelukt) {
        /* Samen bouwen, stap voor stap; de opdracht komt later terug. */
        zet({ aantal: 0, wissen: false, klaar: false, hand: false });
        await l.zeg("Geen zorgen.", "We doen het samen.");
        if (alleenEnen) {
          zet({ wijs: 1 });
          await l.zeg(`Tik {${doel}} keer op de ster.`);
          await telTot(doel, 1);
        } else {
          zet({ knoppen: [10], wijs: 10 });
          await l.zeg(t === 1 ? "Tik één keer op de lichtbol." : `Tik {${t}} keer op de lichtbol.`);
          await telTot(t * 10, 10);
          if (e > 0) {
            zet({ knoppen: [1], wijs: 1 });
            await l.zeg(e === 1 ? "Tik nu één keer op de ster." : `Tik nu {${e}} keer op de ster.`);
            await telTot(doel, 1);
          }
        }
        if (!terug) {
          await l.zeg("Dat zien we later.");
          later.lijst.push(() => bouwOpdracht(doel, alleenEnen, i, true));
        }
      }
      if (alleenEnen) {
        await l.zeg(gelukt ? "Precies goed." : "Kijk eens.", "Bij de tiende ster kwam er weer een lichtbol.", `{${doel}} is één lichtbol en ${sterren(e)} los.`);
      } else {
        await l.zeg(gelukt ? "Precies goed." : "Kijk eens.", `${inBollen(doel)}.`, `Dat is {${doel}}.`);
      }
      await l.verder();
    };
    for (const [i, { doel, alleenEnen }] of opdrachten.entries()) await bouwOpdracht(doel, !!alleenEnen, i, false);

    zet({ knoppen: [10, 1], wissen: false, klaar: false, hand: false, wijs: null, aantal: 0 });
    await speelLater(l, later);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Je bouwt al grote getallen, ${l.naam}.` : "Je bouwt al grote getallen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 2. De plek van de tientallen ---------- */

/*
  Volgt LESSENPLAN.md G13 en Synthesis "Power of Place · The Power of Place":
  sterren in één kristallen vak (cijfer 0 t/m 9), de nul apart en vroeg, de
  tiende ster past niet, een tweede vak, heen en weer slepen (10 sterren ↔ 1
  lichtbol), vragen over de cijfers onder de vakken. Eigen Bliepo: kristallen
  vakken; keuzes als cijfers in plaats van woorden. 16 opgaven.
*/
const plekVanDeTientallen: Lesdraaiboek = {
  id: "tientallen-plek-van-de-tientallen",
  titel: "De plek van de tientallen",
  synthesis: "Power of Place · The Power of Place",
  kaarttekening: KaartPlaats,

  async speel(l) {
    const later = nieuwLater();
    const st: HoloPlaatsProps = { kolommen: 1, enen: 0, tienen: 0 };
    l.vlak(HoloPlaatsmachine, { ...st });
    const zet = (p: Partial<HoloPlaatsProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<HoloPlaatsProps>(p);
    };
    const wachtOp = (soort: HoloPlaatsMelding["soort"]) => l.wachtOpVlak<HoloPlaatsMelding>(soort);

    /** Sterren erbij tikken tot `doel`; Bliepo telt mee. */
    const tikTot = async (doel: number, tellen = true) => {
      zet({ tik: true });
      while (st.enen < doel) {
        await wachtOp("tik");
        zet({ enen: st.enen + 1 });
        if (tellen) void l.zeg(`{${st.enen}}`).catch(() => {});
      }
      zet({ tik: false });
      await l.wacht(700);
    };

    await l.zeg("We gaan leren hoe onze getallen werken.", "Dat doen we met dit kristallen vak.");
    await l.verder();
    await l.zeg("Doe een ster in het vak.", "Tik maar in het vak.");
    await tikTot(1, false);
    await l.zeg("Mooi.", "Eén ster schrijven we met het cijfer {1}.", "Je kunt een ster ook weghalen.", "Sleep hem uit het vak.");
    zet({ sleepUit: true });
    await wachtOp("uit");
    zet({ sleepUit: false, enen: 0 });
    await l.zeg("Goed gedaan.", "Nu zijn er geen sterren.", "Dat schrijven we met het cijfer {0}.", "Nul betekent: hier zit niets in.", "Toch is de {0} heel belangrijk.");
    await l.verder();

    /* Van 0 tot 9. */
    await l.zeg("We zagen al {2} cijfers: {1} en {0}.", "Doe er nu een heleboel sterren in.", "Kijk hoe hoog het getal gaat.");
    await tikTot(9);
    await l.zeg("We stoppen hier even.", "We begonnen bij {0} en gingen tot {9}.");
    testHaak({ antwoord: 10, vraagId: Math.random() });
    await l.zeg("Hoeveel verschillende cijfers zagen we?");
    const cijfers = await kiesGetalHolo(l, [9, 10]);
    if (cijfers === 10) {
      await l.zeg("Precies.", "{0} tot en met {9}: dat zijn {10} cijfers.");
    } else {
      await l.zeg(cijfers === null ? "Geen zorgen." : "Ik zie wat je denkt.", "We telden tot {9}.", "Maar {0} is ook een cijfer.", "Daar begonnen we.");
      zet({ cijferrij: [] });
      for (let d = 1; d <= 9; d++) {
        zet({ cijferrij: Array.from({ length: d }, (_, i) => i + 1) });
        await l.wacht(260);
      }
      await l.zeg("Dat zijn {9} cijfers.");
      zet({ cijferrij: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
      await l.zeg("En dan hebben we nog de {0}.", "Een beetje een rare.", "Samen zijn dat {10} cijfers.");
    }
    await l.verder();
    zet({ cijferrij: null });

    /* De tiende ster past niet. */
    await l.zeg("Stel, er komt nog een ster bij.", "Hoeveel cijfers heb je dan nodig?");
    testHaak({ antwoord: 2, vraagId: Math.random() });
    const een = await kiesGetalHolo(l, [1, 2]);
    await l.zeg(een === 2 ? "Je hebt gelijk." : een === null ? "Geen zorgen." : "Kijk maar.", "Doe er nog één ster in.");
    await tikTot(10, false);
    await l.zeg("Kijk, het vak wordt rood.", "Voor tien is er geen eigen cijfer.", "Er gebeurde iets toen we voorbij de {9} gingen.");
    await l.verder();
    zet({ kolommen: 2 });
    await l.zeg("Ik geef de machine een tweede vak.", "Sleep een ster naar het nieuwe vak.");
    zet({ sleepNaarTien: true });
    await wachtOp("naarTien");
    zet({ sleepNaarTien: false, enen: 0, tienen: 1, totaal: true });
    await l.wacht(1000);
    await l.zeg("Mooi!", "De {10} sterren zijn samen één lichtbol.");

    /* Heen en terug. */
    await l.zeg("Sleep de lichtbol eens terug.");
    zet({ sleepNaarEen: true });
    await wachtOp("naarEen");
    zet({ sleepNaarEen: false, enen: 10, tienen: 0 });
    await l.wacht(900);
    await l.zeg("De lichtbol viel uit elkaar.", "Nu zijn het weer {10} sterren.", "Maak er weer één lichtbol van.");
    zet({ sleepNaarTien: true });
    await wachtOp("naarTien");
    zet({ sleepNaarTien: false, enen: 0, tienen: 1, slotEen: true });
    await l.wacht(1000);
    await l.zeg("Goed zo.");

    /* De cijfers onder de vakken. */
    const klaar10 = () => zet({ kolommen: 2, enen: 0, tienen: 1, totaal: true, slotEen: true });
    await getalvraag(
      l,
      {
        vraag: ["Kijk onder de lichtbol.", "Welk cijfer staat daar?"],
        lijst: [1, 2],
        goed: 1,
        bijGoed: ["Ja.", "Die {1} zegt: hier zit één lichtbol van {10}."],
        hint: () => ["Kijk goed onder het linker vak."],
        antwoord: ["Er staat een {1}.", "Eén lichtbol van {10}."],
        klaarzetten: klaar10,
      },
      later,
    );
    await getalvraag(
      l,
      {
        vraag: ["Kijk nu onder het rechter vak.", "Welk cijfer zie je daar?"],
        lijst: [0, 1],
        goed: 0,
        bijGoed: ["Dat klopt.", "Er staat {0}, want daar zitten geen sterren."],
        hint: () => ["Kijk in het vak.", "Zitten er sterren in?"],
        antwoord: ["Er staat een {0}.", "Want daar zitten geen sterren."],
        klaarzetten: klaar10,
      },
      later,
    );
    await getalvraag(
      l,
      {
        vraag: ["Kijk naar het grote getal rechts.", "Welk getal is dat?"],
        lijst: [0, 1, 2, 10],
        goed: 10,
        bijGoed: ["Precies, tien."],
        hint: () => ["Kijk naar het grote getal.", "Er staan twee cijfers naast elkaar."],
        antwoord: ["Er staat tien."],
        klaarzetten: klaar10,
      },
      later,
    );
    await l.zeg("Voor tien hebben we geen eigen cijfer.", "Dus schrijven we tien met {2} cijfers.", "Een {1} en een {0}.");
    await l.verder();

    /* De namen van de plekken. */
    await l.zeg("Het linker vak is de plek van de tientallen.", "Waar we begonnen, is de plek van de eenheden.", "Had je daar al eens van gehoord?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const gehoord = await l.kies(["Ja", "Nee"]);
    await l.zeg(gehoord === "Ja" ? "Mooi." : "Geen zorgen, daarvoor zijn we hier.", "Dit is {1} tiental en {0} eenheden.");
    await l.zeg("Zo werken onze getallen.", "Elke plek heeft een andere waarde.", "Dat noemen we *plaatswaarde*.");
    await l.verder();

    /* Nog even oefenen: een tiental en een paar eenheden. */
    zet({ slotEen: false });
    await l.zeg("Doe nu {4} sterren in het rechter vak.");
    await tikTot(4);
    await getalvraag(
      l,
      {
        vraag: ["Welk getal maken we nu?"],
        lijst: [4, 14, 41],
        goed: 14,
        bijGoed: ["Ja, {14}.", "{1} tiental en {4} eenheden."],
        hint: (x) => (x === 41 ? ["Kijk goed.", "Links staat de {1} van het tiental.", "Rechts de {4} van de eenheden."] : ["Vergeet de lichtbol niet.", "Die is {10}."]),
        antwoord: ["Eén lichtbol is {10}.", "En {4} sterren erbij: {14}."],
        klaarzetten: () => zet({ kolommen: 2, enen: 4, tienen: 1, totaal: false, slotEen: false }),
      },
      later,
    );
    await l.zeg("Haal er nu één ster uit.", "Sleep hem uit het vak.");
    zet({ sleepUit: true, totaal: false });
    await wachtOp("uit");
    zet({ sleepUit: false, enen: 3 });
    await getalvraag(
      l,
      {
        vraag: ["En welk getal is het nu?"],
        lijst: [3, 13, 31],
        goed: 13,
        bijGoed: ["Goed zo, {13}.", "Alleen de eenheden veranderden."],
        hint: (x) => (x === 31 ? ["Kijk goed.", "Eerst het cijfer van de tientallen.", "Dan het cijfer van de eenheden."] : ["Vergeet de lichtbol niet.", "Die is {10}."]),
        antwoord: ["Eén lichtbol is {10}.", "En {3} sterren erbij: {13}."],
        klaarzetten: () => zet({ kolommen: 2, enen: 3, tienen: 1, totaal: false }),
      },
      later,
    );
    zet({ totaal: true });
    await l.zeg("Zo kun je steeds grotere getallen maken.");
    await l.verder();
    await speelLater(l, later);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Dit is pas het begin.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};


/* ======================================================================
 * Tweede bouwronde: de groep-3-delen
 * ====================================================================== */

/* ---------- algemeen ---------- */

const metNaam = (l: Lesgids, zin: string) => (l.naam ? `${zin.replace(/[.!]$/, "")}, ${l.naam}${zin.endsWith("!") ? "!" : "."}` : zin);

/** "{1} tiental", "{3} tientallen". */
const tientallen = (n: number) => (n === 1 ? "{1} tiental" : `{${n}} tientallen`);
/** "{1} eenheid", "{4} eenheden". */
const eenheden = (n: number) => (n === 1 ? "{1} eenheid" : `{${n}} eenheden`);
/** "{1} klodder", "{3} klodders". */
const klodders = (n: number) => (n === 1 ? "{1} groene klodder" : `{${n}} groene klodders`);

function plusSom(a: number, b: number, c: number): Somdeel[] {
  return [
    { t: "getal", n: a },
    { t: "teken", s: "+" },
    { t: "getal", n: b },
    { t: "teken", s: "=" },
    { t: "getal", n: c },
  ];
}

/* ---------- kaarttekeningen ---------- */

function KaartKlodders() {
  return (
    <g>
      {[
        [92, 78],
        [152, 78],
        [122, 128],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(1.25) translate(${-x} ${-y})`}>
          <Klodder x={x} y={y} zaad={i * 1.7 + 0.4} />
        </g>
      ))}
    </g>
  );
}

function KaartNegenNegen() {
  return (
    <g>
      {[50, 122, 194].map((x) => (
        <line key={x} x1={x} y1={30} x2={x} y2={170} stroke="#aabbe0" strokeWidth={2.5} />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={`g${i}`} cx={70 + i * 16} cy={70 + (i % 2) * 18} r={9} fill="#3fb34f" />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={`b${i}`} cx={142 + i * 16} cy={70 + (i % 2) * 18} r={9} fill="#3d8ff0" />
      ))}
      <text x={86} y={155} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
        9
      </text>
      <text x={158} y={155} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff">
        9
      </text>
    </g>
  );
}

function KaartOnderelkaar() {
  return (
    <g fontFamily="ui-monospace, Menlo, monospace" fontWeight={700} fontSize={40}>
      <text x={104} y={78} textAnchor="middle" fill="#4cc38a">
        8
      </text>
      <text x={148} y={78} textAnchor="middle" fill="#3d8ff0">
        7
      </text>
      <text x={66} y={126} textAnchor="middle" fill="#e6e8ee">
        −
      </text>
      <text x={104} y={126} textAnchor="middle" fill="#4cc38a">
        2
      </text>
      <text x={148} y={126} textAnchor="middle" fill="#3d8ff0">
        5
      </text>
      <line x1={56} y1={142} x2={176} y2={142} stroke="#e6e8ee" strokeWidth={3} />
    </g>
  );
}

/* ---------- de kloddermachine ---------- */

type KS = KloddermachineProps;
type Klodders = { st: KS; zet: (p: Partial<KS>) => void };

function klodderVlak(l: Lesgids, begin: KS): Klodders {
  const st: KS = { ...begin };
  l.vlak(Kloddermachine, { ...st });
  return {
    st,
    zet: (p) => {
      Object.assign(st, p);
      l.pasVlakAan<KS>(p);
    },
  };
}

const totaalVan = (k: Klodders) => k.st.tienen * 10 + k.st.enen;

/** Eén tik op een teller verwerken (tussen 0 en 9). */
function verwerkTeller(k: Klodders, waarde: 10 | 1, stap: 1 | -1) {
  if (waarde === 10) {
    const nu = k.st.tienen + stap;
    if (nu >= 0 && nu <= 9) k.zet({ tienen: nu });
  } else {
    const nu = k.st.enen + stap;
    if (nu >= 0 && nu <= 9) k.zet({ enen: nu });
  }
}

/**
 * Het kind werkt met de machine tot het vinkje of het handje. Doet het een
 * tijd niets, dan komt er vanzelf een hulpzin (hoogstens twee keer).
 * "Opnieuw" zet de machine terug op `begin`.
 */
async function klodderBediening(
  l: Lesgids,
  k: Klodders,
  begin: { tienen: number; enen: number },
  hulp: { leeg: string[]; bezig: string[] },
): Promise<"klaar" | "hand"> {
  k.zet({ actief: true });
  let gezegd = 0;
  for (;;) {
    const onaangeroerd = k.st.tienen === begin.tienen && k.st.enen === begin.enen;
    const klok =
      gezegd < 2
        ? setTimeout(() => {
            gezegd++;
            void l.zeg(...(onaangeroerd ? hulp.leeg : hulp.bezig)).catch(() => {});
          }, 12000)
        : undefined;
    const g = await l.wachtOpVlak<KlodderMelding>(["teller", "reset", "sorteer", "klaar", "hand"]);
    clearTimeout(klok);
    if (g.soort === "teller") verwerkTeller(k, g.waarde, g.stap);
    else if (g.soort === "reset") k.zet({ tienen: begin.tienen, enen: begin.enen });
    else if (g.soort === "sorteer") k.zet({ ligging: k.st.ligging === "netjes" ? "tros" : "netjes" });
    else {
      k.zet({ actief: false });
      return g.soort;
    }
  }
}

/** Samen bouwen: eerst de tientallen goed zetten, dan de eenheden. */
async function samenKlodders(l: Lesgids, k: Klodders, doel: number): Promise<void> {
  const t = Math.floor(doel / 10);
  const e = doel % 10;
  await l.zeg("We doen het samen.");
  for (const w of [10, 1] as const) {
    const nodig = w === 10 ? t : e;
    const nu = () => (w === 10 ? k.st.tienen : k.st.enen);
    if (nu() === nodig) continue;
    k.zet({ wijs: w });
    await l.zeg(nu() < nodig ? `Tik op plus bij de {${w}}.` : `Tik op min bij de {${w}}.`, `Tot er {${nodig}} staat.`);
    k.zet({ actief: true });
    while (nu() !== nodig) {
      const g = await l.wachtOpVlak<KlodderMelding>("teller");
      if (g.soort === "teller" && g.waarde === w) verwerkTeller(k, g.waarde, g.stap);
    }
    k.zet({ actief: false, wijs: null });
  }
  await l.wacht(400);
}

/**
 * Bouwen tot het getal klopt. Zoals Synthesis: omgedraaide cijfers zijn "de
 * goede delen in de verkeerde volgorde" (de tellers gaan terug), te veel wordt
 * uitgesplitst ("een beetje te veel, haal er wat weg"), te weinig is "we hebben
 * iets meer nodig". Met `altijdTerug` gaat de machine na elke misser terug naar
 * `begin`. Na drie missers, of bij het handje, bouwen we samen.
 * Geeft terug of het meteen goed was.
 */
async function klodderBouw(
  l: Lesgids,
  k: Klodders,
  doel: number,
  begin: { tienen: number; enen: number },
  opties: { altijdTerug?: boolean; opdracht: string[] },
): Promise<boolean> {
  const hulp = {
    leeg: ["Tik op een knop om stippen erbij te doen."],
    bezig: ["Tik op het blauwe vinkje als je klaar bent."],
  };
  for (let fout = 0; ; ) {
    const r = await klodderBediening(l, k, begin, hulp);
    if (r === "hand") {
      await samenKlodders(l, k, doel);
      return false;
    }
    const n = totaalVan(k);
    if (n === doel) return fout === 0;
    if (k.st.tienen === begin.tienen && k.st.enen === begin.enen) {
      k.zet({ wijs: 10 });
      await l.zeg("Doe eerst wat stippen erbij.", "Tik op de knoppen hier beneden.");
      k.zet({ wijs: null });
      continue;
    }
    fout++;
    if (fout >= 3) {
      await samenKlodders(l, k, doel);
      return false;
    }
    const omgedraaid = doel % 10 !== 0 && n === Number(String(doel).split("").reverse().join(""));
    if (omgedraaid) {
      await l.zeg("Ik zie wat je deed.", "Je hebt de goede delen.", "Maar in de verkeerde volgorde.");
      k.zet({ tienen: begin.tienen, enen: begin.enen });
    } else if (n > doel) {
      await l.zeg("Kijk eens.", `${tientallen(k.st.tienen)} en ${eenheden(k.st.enen)}.`, `Dat is {${n}}.`, "Een beetje te veel.");
      if (opties.altijdTerug) {
        await l.zeg("Ik zet het terug.", "Dan proberen we het opnieuw.");
        k.zet({ tienen: begin.tienen, enen: begin.enen });
      } else await l.zeg("Haal er wat weg.");
    } else {
      await l.zeg("We hebben iets meer nodig.");
      if (opties.altijdTerug) {
        await l.zeg("Ik zet het terug.", "Dan proberen we het opnieuw.");
        k.zet({ tienen: begin.tienen, enen: begin.enen });
      }
    }
    await l.zeg(...opties.opdracht);
  }
}

/* ---------- Grouping 10s · Assessment en Mastery Check (groep 3-deel) ---------- */

/** "Hoeveel stippen zijn er samen?" bij een trosje klodders. Kort, zoals een toets. */
async function groepjesToets(l: Lesgids, groepjes: number, opties: number[], slot: string[]): Promise<void> {
  const doel = groepjes * 10;
  klodderVlak(l, { tienen: groepjes, enen: 0, ligging: "tros" });
  await l.zeg("In dit onderdeel werken we met groepjes van {10}.", "Eerst kijken we wat je al kunt.");
  await l.verder();
  await l.zeg("Kijk naar de klodders.", "Hoeveel stippen zijn er samen?");
  for (let poging = 1; ; poging++) {
    const k = await kiesGetal(l, opties);
    if (k === doel) {
      await l.zeg("Ja, precies.", `{${groepjes}} groepjes van {10}.`, `Dat zijn {${doel}} stippen.`);
      break;
    }
    if (k !== null && poging === 1) {
      await l.zeg(`{${k}}?`, "Kijk nog eens goed.", "Hoeveel stippen zijn er samen?");
      continue;
    }
    await l.zeg(k === null ? "Geen zorgen." : "Kijk eens.", "In elke klodder zitten {10} stippen.", `{${groepjes}} groepjes van {10} is {${doel}}.`);
    break;
  }
  await l.verder();
  l.vlak(null);
  l.bak([]);
  const tik = l.kaart();
  await l.zeg(...slot, "Tik op de kaart om hem af te vinken.");
  await tik;
}

const instaptoetsGroepjes: Lesdraaiboek = {
  id: "tientallen-instaptoets-groepjes",
  titel: "Instaptoets: groepjes van tien",
  synthesis: "Grouping 10s · Assessment (groep 3-deel)",
  kaarttekening: KaartKlodders,
  async speel(l) {
    await groepjesToets(l, 6, [6, 50, 60, 70], [metNaam(l, "Mooi gedaan."), "Je kent de groepjes van {10} al goed."]);
  },
};

const eindtoetsGroepjes: Lesdraaiboek = {
  id: "tientallen-eindtoets-groepjes",
  titel: "Eindtoets: groepjes van tien",
  synthesis: "Grouping 10s · Mastery Check (groep 3-deel)",
  kaarttekening: KaartKlodders,
  async speel(l) {
    await groepjesToets(l, 8, [8, 18, 70, 80], [metNaam(l, "Mooi gedaan."), "Je kunt al goed rekenen met tientallen en klodders."]);
  },
};

/* ---------- Grouping 10s · Read Splodges (groep 3-deel: getallen tot 100) ---------- */

type Leesvraag = { doel: number; vraag: "tien" | "een" };

/** Een gelijke opdracht met een ander getal: één tiental verder (of terug), nooit twee dezelfde cijfers. */
function anderGetal(n: number): number {
  let m = n + 10 <= 99 ? n + 10 : n - 10;
  if (Math.floor(m / 10) === m % 10) m = m + 10 <= 99 ? m + 10 : m - 20;
  return m;
}

const kloddersLezen: Lesdraaiboek = {
  id: "tientallen-klodders-lezen",
  titel: "Klodders lezen",
  synthesis: "Grouping 10s · Read Splodges (groep 3-deel)",
  kaarttekening: KaartKlodders,

  async speel(l) {
    const k = klodderVlak(l, { tienen: 0, enen: 0, tellers: [10, 1], totaal: true, ligging: "netjes", klaar: true, reset: true, hand: true });
    await l.zeg("Dit is de kloddermachine.", "Een groene klodder is een groepje van {10}.", "Een blauwe stip telt voor {1}.");
    await l.verder();

    const rij: Leesvraag[] = [
      { doel: 25, vraag: "tien" },
      { doel: 54, vraag: "een" },
    ];
    const extra: Leesvraag[] = [
      { doel: 43, vraag: "een" },
      { doel: 31, vraag: "tien" },
      { doel: 45, vraag: "een" },
      { doel: 67, vraag: "tien" },
      { doel: 82, vraag: "een" },
      { doel: 76, vraag: "tien" },
    ];
    let herhaald = 0;
    const lof = ["Goed zo.", "Mooi.", "Heel goed.", "Precies."];

    for (let i = 0; ; i++) {
      if (i >= rij.length) {
        /* Na de eerste twee: het kind kiest zelf of het doorgaat. */
        if (extra.length === 0) break;
        await l.zeg("Wil je er nog één?", "Of wil je iets anders doen?");
        const keuze = await l.kies(["Nog één", "Iets anders"]);
        if (keuze !== "Nog één") break;
        rij.push(extra.shift()!);
      }
      const { doel, vraag } = rij[i];
      const t = Math.floor(doel / 10);
      const e = doel % 10;
      k.zet({ tienen: 0, enen: 0, ligging: "netjes" });
      const opdracht = [i === 0 ? `Maak met de kloddermachine het getal {${doel}}.` : `Maak {${doel}}.`];
      await l.zeg(...opdracht, i === 0 ? "Tik op het handje als je hulp nodig hebt." : "");
      const meteen = await klodderBouw(l, k, doel, { tienen: 0, enen: 0 }, { opdracht });
      await l.zeg(meteen ? lof[i % lof.length] : "Kijk eens.", `Je hebt het getal {${doel}} gebouwd.`);

      const woord = vraag === "tien" ? "tientallen" : "eenheden";
      const goed = vraag === "tien" ? t : e;
      await l.zeg(`Hoeveel ${woord} zitten er in {${doel}}?`);
      const x = await kiesGetal(l, [t, e].sort((a, b) => a - b));
      if (x === goed) {
        await l.zeg("Dat klopt.", vraag === "tien" ? `{${doel}} heeft ${tientallen(t)}.` : `{${doel}} heeft ${eenheden(e)}.`);
        await l.wacht(500);
      } else if (herhaald < 2) {
        /* Zoals Synthesis: geen uitleg, maar nog een keer oefenen met een ander getal. */
        herhaald++;
        await l.zeg(x === null ? "Geen zorgen." : "Hm.", "We maken er nog één.");
        rij.splice(i + 1, 0, { doel: anderGetal(doel), vraag });
      } else {
        await l.zeg("Kijk eens.", `{${doel}} is ${tientallen(t)} en ${eenheden(e)}.`);
        await l.verder();
      }
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Goed gedaan."), "Je kunt getallen lezen in klodders.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- Grouping 10s · Add and Subtract Splodges (groep 3-deel: tientallen erbij) ---------- */

const tientallenErbij: Lesdraaiboek = {
  id: "tientallen-klodders-erbij",
  titel: "Tientallen erbij",
  synthesis: "Grouping 10s · Add and Subtract Splodges (groep 3-deel)",
  kaarttekening: KaartKlodders,

  async speel(l) {
    const k = klodderVlak(l, { tienen: 3, enen: 2, tellers: [10, 1], totaal: true, ligging: "netjes", klaar: true, sorteer: true, hand: true });
    await l.zeg("We gebruiken klodders om tientallen erbij te doen.", "We beginnen klein.");
    await l.verder();

    /* 32 + 10 = 42 */
    await l.zeg("Eerst een makkelijke plussom.", "Hier is {32}.", "{3} tientallen en {2} eenheden.", "Kun je er {10} bij doen, zodat het {42} wordt?");
    await l.zeg("Tik op het vinkje als je klaar bent.", "Heb je hulp nodig?", "Tik dan op het handje.");
    await klodderBouw(l, k, 42, { tienen: 3, enen: 2 }, { altijdTerug: true, opdracht: ["Doe er {10} bij, zodat het {42} wordt."] });
    l.som(plusSom(32, 10, 42));
    await l.zeg("Goed zo.", "{32} plus {10} is {42}.");
    await l.verder();
    l.som(null);

    /* 42 + 30 = 72 */
    await l.zeg("Doe er nu {30} bij.");
    await klodderBouw(l, k, 72, { tienen: 4, enen: 2 }, { altijdTerug: true, opdracht: ["Doe er {30} bij."] });
    l.som(plusSom(42, 30, 72));
    await l.zeg("Goed.", "{42} plus {30} is {72}.", "Je snapt het al.");
    await l.verder();
    l.som(null);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Mooi gedaan.", "Doe je tientallen erbij?", "Dan doe je gewoon klodders erbij.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- Power of Place · Assessment en Mastery Check (groep 3-deel) ---------- */

async function plaatswaardeToets(l: Lesgids, doel: number, slot: string[]): Promise<void> {
  const st: KolommenProps = { tienen: 0, enen: 0, actief: false, klaar: true };
  l.vlak(Kolommen, { ...st });
  const zet = (p: Partial<KolommenProps>) => {
    Object.assign(st, p);
    l.pasVlakAan<KolommenProps>(p);
  };
  const t = Math.floor(doel / 10);
  const e = doel % 10;

  await l.zeg("In dit onderdeel bouwen we getallen met plaatswaarde.", "Eerst kijken we wat je al kunt.");
  await l.verder();
  await l.zeg(`Maak {${doel}}.`, "Tik in een kolom.", "Dan komt er een staaf of een blokje.", "Tik erop om hem weg te halen.");
  for (let fout = 0; ; ) {
    zet({ actief: true });
    let gezegd = 0;
    for (;;) {
      const leeg = st.tienen === 0 && st.enen === 0;
      const klok =
        gezegd < 2
          ? setTimeout(() => {
              gezegd++;
              void l.zeg(leeg ? "Tik in een kolom." : "Tik op het blauwe vinkje als je klaar bent.").catch(() => {});
            }, 12000)
          : undefined;
      const g = await l.wachtOpVlak<KolomMelding>(["zet", "weg", "klaar"]);
      clearTimeout(klok);
      if (g.soort === "klaar") break;
      const veld = g.kolom === "tien" ? "tienen" : "enen";
      const nu = st[veld] + (g.soort === "zet" ? 1 : -1);
      if (nu >= 0 && nu <= 9) zet(veld === "tienen" ? { tienen: nu } : { enen: nu });
    }
    zet({ actief: false });
    const n = st.tienen * 10 + st.enen;
    if (n === 0) {
      await l.zeg("Zet eerst staven of blokjes in de kolommen.");
      continue;
    }
    if (n === doel) {
      await l.zeg("Mooi gedaan.", `${tientallen(t)} en ${eenheden(e)}.`);
      break;
    }
    fout++;
    if (fout === 1) {
      await l.zeg(`{${n}}?`, "Kijk nog eens goed.");
      zet({ tienen: 0, enen: 0 });
      await l.zeg(`Maak {${doel}}.`);
      continue;
    }
    zet({ tienen: t, enen: e });
    await l.zeg("Kijk eens.", `${tientallen(t)} en ${eenheden(e)}.`, `Dat is {${doel}}.`);
    break;
  }
  await l.verder();
  l.vlak(null);
  l.bak([]);
  const tik = l.kaart();
  await l.zeg(...slot, "Tik op de kaart om hem af te vinken.");
  await tik;
}

const instaptoetsPlaatswaarde: Lesdraaiboek = {
  id: "tientallen-instaptoets-plaatswaarde",
  titel: "Instaptoets: plaatswaarde",
  synthesis: "Power of Place · Assessment (groep 3-deel)",
  kaarttekening: KaartPlaats,
  async speel(l) {
    await plaatswaardeToets(l, 54, [metNaam(l, "Knap gedaan!"), "Je snapt plaatswaarde echt goed."]);
  },
};

const eindtoetsPlaatswaarde: Lesdraaiboek = {
  id: "tientallen-eindtoets-plaatswaarde",
  titel: "Eindtoets: plaatswaarde",
  synthesis: "Power of Place · Mastery Check (groep 3-deel)",
  kaarttekening: KaartPlaats,
  async speel(l) {
    await plaatswaardeToets(l, 28, [metNaam(l, "Knap gedaan!"), "Je snapt plaatswaarde echt goed."]);
  },
};

/* ---------- Power of Place · The Power of Place: Part 2 (groep 3-deel: tot 99) ---------- */

const tientallenTot99: Lesdraaiboek = {
  id: "tientallen-tot-99",
  titel: "Tientallen tot 99",
  synthesis: "Power of Place · The Power of Place: Part 2 (groep 3-deel)",
  kaarttekening: KaartNegenNegen,

  async speel(l) {
    const st: PlaatsProps = { kolommen: 2, enen: 0, tienen: 1, totaal: true, kleineTienen: true };
    l.vlak(Plaatsmachine, { ...st });
    const zet = (p: Partial<PlaatsProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<PlaatsProps>(p);
    };

    await l.zeg("Weet je al hoe deze machine werkt?");
    const weet = await l.kies(["Ja, ik probeer het zelf", "Nee, samen leren"]);
    await l.zeg(weet === "Ja, ik probeer het zelf" ? "Mooi, dan gaat het vast snel." : "Goed, we leren het samen.", "Er staat nu {10}: één groene stip.");
    await l.verder();

    /* Eén stip erbij bij de tientallen; een stip bij de eenheden haalt de mascotte weg. */
    await l.zeg("Kun je nog één stip bij de tientallen doen?");
    for (;;) {
      zet({ tik: true, tikTien: true });
      const g = await l.wachtOpVlak<PlaatsMelding>(["tik", "tikTien"]);
      zet({ tik: false, tikTien: false });
      if (g.soort === "tikTien") break;
      zet({ enen: 1 });
      await l.zeg("Oeps.", "Je deed een stip bij de eenheden.", "We doen stippen bij de tientallen.", "Ik haal die blauwe stip voor je weg.");
      zet({ enen: 0 });
      await l.zeg("Zo, alles schoon.", "Doe maar een groene stip bij de tientallen.");
    }
    zet({ tienen: 2 });
    await l.zeg("{2} stippen, elk {10} waard.", "Dat is {20}.");

    /* Tot 90, de stem telt mee. */
    await l.zeg("Doe er nog meer groene stippen bij.", "Tot er {9} zijn.");
    zet({ slotEen: true, tikTien: true });
    while (st.tienen < 9) {
      const g = await l.wachtOpVlak<PlaatsMelding>("tikTien");
      if (g.soort !== "tikTien") continue;
      zet({ tienen: st.tienen + 1 });
      void l.zeg(`{${st.tienen * 10}}`).catch(() => {});
    }
    zet({ tikTien: false });
    await l.wacht(700);
    await l.zeg("En {90}.", "{9} stippen, elk {10} waard.");
    await l.zeg("Mag ik je iets vragen?", "Is {90} het grootste getal met {2} vakken?");
    const grootst = await l.kies(["Ja", "Nee"]);
    if (grootst === "Nee") await l.zeg("Dat klopt.", "We kunnen zeker hoger.");
    else await l.zeg(grootst === null ? "Geen zorgen." : "Kijk naar het vak van de eenheden.", "Daar zit nog niets in.", "We kunnen dus nog hoger.");

    await l.zeg("Wat is het grootste getal met {2} vakken?", "{95}, {99} of {100}?");
    const raad = await kiesGetal(l, [95, 99, 100]);
    if (raad === 99) await l.zeg("Ja, dat denk ik ook.", "Maak het vak van de eenheden vol.", "Tot er {99} staat.");
    else await l.zeg(raad === null ? "Geen zorgen." : "We zoeken het uit.", "Maak het vak van de eenheden vol.", "Zo ver als het gaat.");

    /* De eenheden aanvullen tot 9; de tientallen staan op slot. */
    zet({ slotEen: false, slotTien: true, tik: true });
    while (st.enen < 9) {
      const g = await l.wachtOpVlak<PlaatsMelding>("tik");
      if (g.soort !== "tik") continue;
      zet({ enen: st.enen + 1 });
      void l.zeg(`{${90 + st.enen}}`).catch(() => {});
    }
    zet({ tik: false });
    await l.wacht(700);
    if (raad === 99) {
      await l.zeg("{99}.", "Je had gelijk.");
    } else {
      /* Zoals ronde 1: het kind leest zelf af wat er staat. */
      await l.zeg("Kijk, nu zijn allebei de vakken vol.", "Welk getal staat er nu?");
      const x = await l.getal();
      await l.zeg(x === 99 ? "Ja, {99}." : "Er staat {99}.");
    }
    await l.zeg(`${tientallen(9)} en ${eenheden(9)}.`, "Met {2} vakken is {99} het grootste getal.");
    await l.verder();

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Goed gewerkt vandaag.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- Expanding Numbers · Expanding Splodges (groep 3-deel: klodders bouwen tot 100) ---------- */

const kloddersBouwen: Lesdraaiboek = {
  id: "tientallen-klodders-bouwen",
  titel: "Klodders bouwen",
  synthesis: "Expanding Numbers · Expanding Splodges (groep 3-deel)",
  kaarttekening: KaartKlodders,

  async speel(l) {
    const k = klodderVlak(l, { tienen: 0, enen: 0, tellers: [], totaal: true, ligging: "tros" });
    await l.zeg("Een getal heeft plekken.", "De eenheden.", "En de tientallen.");
    await l.zeg("We verzinnen er een woord voor: *klodder*.", "Een klodder is een groepje stippen.");
    await l.verder();

    /* De losse stippen. */
    await l.zeg("Je kunt je eigen getal bouwen met klodders.", "Hier krijg je een knop om stippen erbij te doen.");
    k.zet({ tellers: [1], wijs: 1, actief: true });
    await l.zeg("Kijk onderaan het scherm.", "De plusknop doet er telkens één stip bij.", "Doe er maar eentje bij.");
    k.zet({ actief: true });
    while (k.st.enen < 1) {
      const g = await l.wachtOpVlak<KlodderMelding>("teller");
      if (g.soort === "teller" && g.stap === 1) verwerkTeller(k, 1, 1);
    }
    k.zet({ actief: false, wijs: null });
    await l.zeg("Hallo, stip!", "Je mag tot {9} blauwe stippen erbij doen.", "Of weer weghalen.", "Tik op het vinkje als je er genoeg hebt.");
    k.zet({ klaar: true });
    for (;;) {
      await klodderBediening(l, k, { tienen: 0, enen: k.st.enen }, { leeg: ["Tik op plus of min."], bezig: ["Tik op het vinkje als je er genoeg hebt."] });
      if (k.st.enen >= 1) break;
      await l.zeg("Doe er eerst minstens één stip bij.");
    }
    const e = k.st.enen;
    k.zet({ wijs: "totaal" });
    await l.zeg(e === 1 ? "Mooi, je hebt {1} stip." : `Mooi, je hebt {${e}} stippen.`, "Bovenaan zie je hoeveel het samen is.");
    await l.verder();
    k.zet({ wijs: null });

    /* De klodders van tien. */
    await l.zeg("Nu we losse stippen hebben, zijn we klaar voor klodders.", "De groene klodders zijn groepjes van {10}.", "We doen er een paar bij.");
    k.zet({ tellers: [10, 1], wijs: 10 });
    await l.zeg("Daar is je knop.", "Doe er klodders bij.", "Tik op het vinkje als je alle tientallen hebt.");
    k.zet({ wijs: null });
    for (;;) {
      await klodderBediening(l, k, { tienen: 0, enen: e }, { leeg: ["Tik op plus bij de {10}."], bezig: ["Tik op het vinkje als je alle tientallen hebt."] });
      if (k.st.tienen >= 1) break;
      await l.zeg("Doe er eerst minstens één klodder bij.", "Tik op plus bij de {10}.");
    }
    const t = k.st.tienen;
    const en = k.st.enen;
    const n = t * 10 + en;
    await l.zeg(`Je hebt ${klodders(t)} erbij gedaan.`, t === 1 ? "Eén groepje van {10} stippen." : `{${t}} groepjes van elk {10} stippen.`);
    await l.zeg("Je bouwt een getal stukje voor stukje.", "Klodder voor klodder.", `Samen zijn het al {${n}} stippen.`);
    await l.verder();

    /* Per plek tellen. */
    await l.zeg(`We halen {${n}} uit elkaar.`, "Tel alleen de groene klodders.", "Hoeveel stippen zijn dat?");
    const groen = await kiesGetal(l, [t * 10, t, (t + 1) * 10]);
    if (groen === t * 10) {
      k.zet({ gekozen: 10 });
      await l.zeg("Precies.", `{${t * 10}} stippen.`);
    } else {
      await l.zeg(groen === null ? "Geen zorgen." : "Bijna.", "Ik leg de klodders netjes neer.");
      k.zet({ ligging: "netjes" });
      await l.wacht(700);
      k.zet({ gekozen: 10, wijs: "gekozen" });
      await l.zeg("Kijk, ik kies de groene klodders.", "Bovenaan staat hoeveel stippen dat zijn.", "Hoeveel staat er?");
      const opnieuw = await kiesGetal(l, [...new Set([t * 10, (t + 1) * 10, 10, t])]);
      await l.zeg(opnieuw === t * 10 ? `Ja, {${t * 10}}.` : `Er staat {${t * 10}}.`, `Er zitten {${t * 10}} stippen in de groene klodders.`);
      k.zet({ wijs: null });
    }
    await l.verder();

    if (en > 0) {
      k.zet({ gekozen: 1 });
      await l.zeg("En de losse blauwe stippen?", "Hoeveel zijn dat er?");
      const blauw = await kiesGetal(l, [...new Set([en - 1, en, en + 1].filter((x) => x >= 1 && x <= 9))]);
      await l.zeg(blauw === en ? "Ja." : "Kijk goed.", en === 1 ? "Er is {1} losse stip." : `Er zijn {${en}} losse stippen.`);
      await l.verder();
    }

    k.zet({ gekozen: null, ligging: "netjes" });
    await l.zeg(
      en > 0 ? `{${t * 10}} stippen en ${en === 1 ? "{1} losse stip" : `{${en}} losse stippen`}.` : `{${t * 10}} stippen, en geen losse.`,
      `Samen is dat {${n}}.`,
      "Zo heb je het getal uit elkaar gehaald.",
      "In tientallen en eenheden.",
    );
    await l.verder();

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Goed gedaan vandaag."), "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- Subtract 2-Digit Numbers · 2-Digit Subtraction (groep 3-deel: plaatswaarde benoemen) ---------- */

/** "Welk getal staat er …?" (typen). Bij een misser: tientallen en eenheden erbij. */
async function welkGetalStaatEr(l: Lesgids, n: number, vraag: string, uitleg: () => void): Promise<void> {
  await l.zeg(vraag);
  for (let poging = 1; ; poging++) {
    const x = await l.getal();
    if (x === n) {
      await l.zeg(`Ja, {${n}}.`);
      return;
    }
    if (poging === 1) {
      uitleg();
      await l.zeg(x === null ? "Geen zorgen." : "Dat is niet wat ik daar zie.", `${tientallen(Math.floor(n / 10))} en ${eenheden(n % 10)}.`, vraag);
      continue;
    }
    await l.zeg(`Er staat {${n}}.`);
    await l.verder();
    return;
  }
}

/** "Op welke plek staan de … cijfers?" Geeft niets terug; na twee keer volgt het antwoord. */
async function welkePlek(l: Lesgids, vraag: string[], goed: "Tientallen" | "Eenheden", antwoord: string[]): Promise<boolean> {
  await l.zeg(...vraag, "Tientallen of eenheden?");
  for (let poging = 1; ; poging++) {
    const k = await l.kies(["Tientallen", "Eenheden"]);
    if (k === goed) return true;
    if (k !== null && poging === 1) {
      await l.zeg("Hm, niet helemaal.", "Probeer het nog eens.");
      continue;
    }
    await l.zeg(k === null ? "Geen zorgen." : "Kijk eens.", ...antwoord);
    await l.verder();
    return false;
  }
}

const plaatsenInEenSom: Lesdraaiboek = {
  id: "tientallen-plaatsen-in-een-som",
  titel: "Plaatsen in een som",
  synthesis: "Subtract 2-Digit Numbers · 2-Digit Subtraction (groep 3-deel)",
  kaarttekening: KaartOnderelkaar,

  async speel(l) {
    const st: OnderelkaarProps = { boven: 87, onder: 25, licht: null, uitleg: false };
    l.vlak(Onderelkaar, { ...st });
    const zet = (p: Partial<OnderelkaarProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<OnderelkaarProps>(p);
    };

    await l.zeg("Dit is een grote som.", "Maar we kunnen hem samen opdelen.");
    await l.verder();
    await welkGetalStaatEr(l, 87, "Eerst: welk getal staat er bovenaan?", () => zet({ uitleg: true }));
    zet({ uitleg: false });
    await welkGetalStaatEr(l, 25, "En welk getal staat eronder?", () => {});
    await l.zeg("Dus we hebben {87} min {25}.", "Je ziet vast dat de cijfers verschillende kleuren hebben.");
    await l.verder();

    zet({ licht: "een" });
    const blauw = await welkePlek(
      l,
      ["De kleuren laten zien op welke plek een cijfer staat.", "Op welke plek staan de *blauwe* cijfers?"],
      "Eenheden",
      ["De {7} en de {5} staan rechts.", "Dat zijn de eenheden."],
    );
    if (blauw) await l.zeg("Ja.", "Dat zijn de eenheden.");

    zet({ licht: "tien" });
    const groen = await welkePlek(l, ["En de *groene* cijfers?", "Welke plek is *dat*?"], "Tientallen", ["De {8} en de {2} zijn de tientallen."]);
    await l.zeg(groen ? "Goed zo." : "", "Tientallen en eenheden.");
    zet({ licht: null });
    await l.zeg("De plekken staan netjes onder elkaar.", "Zo kun je in stukken rekenen.", "Eerst de eenheden, dan de tientallen.", "Dat leer je later.");
    await l.verder();

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(metNaam(l, "Goed gedaan."), "Je kent de plekken in een som.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* De volgorde van Synthesis: Grouping 10s, Power of Place, Expanding Numbers, Subtract 2-Digit Numbers. */
export const LESSEN_TIENTALLEN: Lesdraaiboek[] = [
  instaptoetsGroepjes,
  groepjesVanTien,
  kloddersLezen,
  tientallenErbij,
  eindtoetsGroepjes,
  instaptoetsPlaatswaarde,
  plekVanDeTientallen,
  tientallenTot99,
  eindtoetsPlaatswaarde,
  kloddersBouwen,
  plaatsenInEenSom,
];
