/**
 * Lessen van het onderdeel Optellen tot 100 — naar Synthesis "Add up to 100"
 * (INSPIRATIE.md, ronde 1 en 2), de lessen en opdrachten van groep 3.
 * Zie ../soort.ts en ../BOUWEN.md.
 *
 * 1. Instaptoets: groepjes van 10 tellen, tientallen optellen, tiental + eenheden, splitsen.
 * 2. Tientallen erbij: de tienenmachine (eerst voorspellen, dan zelf tikken).
 * 3. Splitsen: het splitsschema met stippen in getalkleur (met een liedje als voorbeeld).
 * 4. Tiental plus eenheden: 30 + 7, de nul als leeg plekje, pijlen, de plaatswaardekaart.
 * 5. Eindtoets.
 * 6. Aanvullen tot het tiental (Bridging to 10s, groep 3 eind): tellen tot 38,
 *    aanvullen met gekleurde stippen, daarna zonder stippen.
 * 7. Tientallen tot 100 (Make 100, alleen het groep 3-deel): met de +10-knop naar 100.
 * 8. Over het tiental (Crossing 10s, alleen het groep 3-deel): 17 + 5, 19 + 4 en
 *    18 + 3 met stippen, eerst in één keer en dan in twee stappen.
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { Klodder, Tienenmachine, type MachineMelding, type MachineProps } from "../vlakken/optellen100-machine";
import { Piano, type PianoMelding, type PianoProps } from "../vlakken/optellen100-piano";
import { Stippenkaders, kleurGetal, type KadersMelding, type KadersProps, type SomStuk } from "../vlakken/optellen100-kaders";
import { Splitsschema, type SplitsMelding, type SplitsProps, type Splitsknop } from "../vlakken/optellen100-splitsen";
import { Tientallenbord, type TientallenMelding, type TientallenProps } from "../vlakken/optellen100-tientallen";
import { kiesGetal, plusSom, schud, somFout, toetsvraag } from "./optellen-tot-20";

/* ---------- hulpjes ---------- */

/** Unieke getallen van klein naar groot (zoals de keuzes bij Synthesis in deze unit). */
function oplopend(...getallen: number[]): number[] {
  return [...new Set(getallen.filter((g) => g >= 0))].sort((a, b) => a - b);
}

function getal(n: number): Somdeel[] {
  return [{ t: "getal", n }];
}
function plusZonderUitkomst(a: number, b: number): Somdeel[] {
  return [{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: b }];
}

/* ---------- de tienenmachine ---------- */

type Machine = {
  st: MachineProps;
  zet(p: Partial<MachineProps>): void;
  /** Wacht tot het kind `keer` keer op de knop tikt; elke tik komt er een groepje (of stip) bij. */
  tik(keer: number, bijTik?: (st: MachineProps) => void): Promise<void>;
};

function maakMachine(l: Lesgids, begin: Partial<MachineProps>): Machine {
  const st: MachineProps = { tienen: 0, enen: 0, knop: 10, actief: false, ...begin };
  l.vlak(Tienenmachine, { ...st });
  const zet = (p: Partial<MachineProps>) => {
    Object.assign(st, p);
    l.pasVlakAan<MachineProps>(p);
  };
  return {
    st,
    zet,
    async tik(keer, bijTik) {
      for (let i = 0; i < keer; i++) {
        zet({ actief: true });
        const g = await l.wachtOpVlak<MachineMelding>("plus");
        if (g.waarde === 10) zet({ tienen: st.tienen + 1, wijs: false });
        else zet({ enen: st.enen + 1, wijs: false });
        bijTik?.(st);
      }
      zet({ actief: false });
    },
  };
}

/**
 * Een keuzevraag terwijl de machine aan staat: het kind mag eerst groepjes
 * erbij tikken om te kijken, maar hoeft niet. Tijdens het kiezen zegt de les
 * niets, zodat de keuzeknoppen blijven staan.
 */
async function kiesMetMachine(l: Lesgids, m: Machine, lijst: number[], bijPlus: () => void): Promise<number | null> {
  let klaar = false;
  m.zet({ actief: true });
  void (async () => {
    while (!klaar) {
      await l.wachtOpVlak<MachineMelding>("plus");
      if (klaar) return;
      bijPlus();
    }
  })();
  const x = await kiesGetal(l, lijst);
  klaar = true;
  m.zet({ actief: false });
  return x;
}

/**
 * Een somvraag in een les (geen toets): bij de eerste fout een richting, de
 * tweede keer (of bij "Weet ik niet") het antwoord met de reden.
 */
async function somVraag(
  l: Lesgids,
  a: number,
  b: number,
  o: {
    kies: () => Promise<number | null>;
    hint?: (x: number) => string[];
    uitleg: string[];
    bijGoed?: string[];
    toonSom?: boolean;
  },
): Promise<boolean> {
  const s = a + b;
  for (let poging = 1; ; poging++) {
    const x = await o.kies();
    if (x === s) {
      if (o.toonSom !== false) l.som(plusSom(a, b, s));
      await l.zeg(...(o.bijGoed ?? ["Precies."]), `{${a}} plus {${b}} is {${s}}.`);
      return poging === 1;
    }
    if (x !== null && poging === 1) {
      await l.zeg(...(o.hint?.(x) ?? ["Kijk nog eens goed.", `Hoeveel is {${a}} plus {${b}}?`]));
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen." : "", ...o.uitleg);
    if (o.toonSom !== false) l.som(plusSom(a, b, s));
    await l.verder();
    return false;
  }
}

/* ---------- het splitsschema ---------- */

type Schema = {
  st: SplitsProps;
  zet(p: Partial<SplitsProps>): void;
};

function maakSchema(l: Lesgids, begin: Partial<SplitsProps>): Schema {
  const st: SplitsProps = { links: 0, rechts: 0, geheel: null, knoppen: false, alleen: null, vraag: null, klaar: false, lijst: [], tegel: null, ...begin };
  l.vlak(Splitsschema, { ...st });
  return {
    st,
    zet(p) {
      Object.assign(st, p);
      l.pasVlakAan<SplitsProps>(p);
    },
  };
}

/** Een plus- of minknop toepassen, binnen 0 en `max`. */
function drukKnop(sch: Schema, k: Splitsknop, max: number) {
  const kant = k.startsWith("links") ? "links" : "rechts";
  const nu = sch.st[kant];
  const nieuw = Math.max(0, Math.min(max, nu + (k.endsWith("plus") ? 1 : -1)));
  sch.zet(kant === "links" ? { links: nieuw } : { rechts: nieuw });
}

/** Knoppen laten gebruiken tot de stand klopt. */
async function knoppenTot(l: Lesgids, sch: Schema, klopt: () => boolean, alleen: Splitsknop | null, max = 10) {
  sch.zet({ knoppen: true, alleen });
  while (!klopt()) {
    const g = await l.wachtOpVlak<SplitsMelding>("knop");
    if (g.soort === "knop") drukKnop(sch, g.knop, max);
  }
  sch.zet({ knoppen: false, alleen: null });
}

/**
 * Het kind zoekt zelf twee delen die samen `totaal` maken en tikt op het
 * vinkje. Een splitsing die al gevonden is, telt niet nog eens.
 */
async function zoekSplitsing(l: Lesgids, sch: Schema, totaal: number, gevonden: [number, number][], legeStart = true): Promise<[number, number]> {
  if (legeStart) sch.zet({ links: 0, rechts: 0 });
  const al = (a: number, b: number) => gevonden.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
  sch.zet({ knoppen: true, klaar: true });
  for (let fout = 0; ; ) {
    const g = await l.wachtOpVlak<SplitsMelding>(["knop", "klaar"]);
    if (g.soort === "knop") {
      drukKnop(sch, g.knop, totaal);
      continue;
    }
    const { links: a, rechts: b } = sch.st;
    if (a + b === totaal && a > 0 && b > 0 && !al(a, b)) {
      sch.zet({ knoppen: false, klaar: false });
      return [a, b];
    }
    sch.zet({ knoppen: false, klaar: false });
    fout++;
    if (a === 0 || b === 0) {
      await l.zeg("Doe in allebei de rondjes stippen.");
    } else if (a + b !== totaal) {
      await l.zeg("Kijk maar.", `Je hebt {${a}} en {${b}}.`, `Dat is samen {${a + b}}.`, `We zoeken {${totaal}}.`);
      sch.zet({ links: 0, rechts: 0 });
    } else {
      await l.zeg(`Je hebt {${a}} en {${b}}.`, "Die hadden we al.", "Zoek een andere manier.");
    }
    if (fout >= 3) {
      /* Na drie keer helpt de les: een splitsing die nog niet gevonden is. */
      const [p, q] = Array.from({ length: totaal - 1 }, (_, i) => [totaal - 1 - i, i + 1] as [number, number]).find(([x, y]) => !al(x, y)) ?? [totaal - 1, 1];
      sch.zet({ links: p, rechts: q });
      await l.zeg("Ik help je.", `Kijk: {${p}} en {${q}} is samen {${totaal}}.`);
      await l.verder();
      return [p, q];
    }
    sch.zet({ knoppen: true, klaar: true });
  }
}

/* ---------- kaarttekeningen (SVG van 244 × 190) ---------- */

function KaartKlodders() {
  return (
    <g>
      <Klodder x={84} y={62} zaad={0.7} />
      <Klodder x={160} y={62} zaad={2.6} />
      <Klodder x={84} y={136} zaad={4.5} />
      <Klodder x={160} y={136} zaad={6.4} />
    </g>
  );
}
function KaartSplitsen() {
  return (
    <g fill="none" strokeWidth={3.2}>
      <line x1={108} y1={74} x2={78} y2={110} stroke="#9aa0ad" />
      <line x1={136} y1={74} x2={166} y2={110} stroke="#9aa0ad" />
      <circle cx={122} cy={48} r={30} stroke="#8a2fb0" />
      <circle cx={68} cy={140} r={28} stroke="#ef5d8a" />
      <circle cx={176} cy={140} r={28} stroke="#4561dc" />
    </g>
  );
}
function KaartStaven() {
  const staaf = (x: number, n: number, kleur: string) =>
    Array.from({ length: n }, (_, i) => <circle key={`${x}-${i}`} cx={x + (i % 2) * 18} cy={150 - Math.floor(i / 2) * 26} r={7.5} fill={kleur} />);
  return (
    <g>
      {staaf(34, 10, "#d6d8e1")}
      {staaf(88, 10, "#d6d8e1")}
      {staaf(142, 10, "#d6d8e1")}
      {staaf(196, 4, "#ef5d8a")}
    </g>
  );
}
function KaartEindtoets() {
  return (
    <g>
      <Klodder x={60} y={70} zaad={0.7} />
      <Klodder x={130} y={70} zaad={2.6} />
      <Klodder x={60} y={140} zaad={4.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={176 + (i % 2) * 24} cy={150 - Math.floor(i / 2) * 24} r={9} fill="#4b8af5" />
      ))}
    </g>
  );
}

/* ---------- 1. Instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "optellen-100-instaptoets",
  titel: "Instaptoets: optellen tot 100",
  synthesis: "Add up to 100 · Assessment",
  kaarttekening: KaartKlodders,

  async speel(l) {
    let goed = 0;
    let traag = 0;
    const tel = (r: { goed: boolean; traag: boolean }) => {
      if (r.goed) goed++;
      if (r.traag) traag++;
    };

    const m = maakMachine(l, { honderd: true, knop: null });
    await l.zeg("Nu gaan we plussommen maken tot {100}.", "Ken je dit al?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "In deze toets laat je zien wat je al kunt.");
    m.zet({ honderd: false, knop: 10, wijs: true });
    await l.zeg("Tik {3} keer op de plusknop.", "Dan komen er groepjes van {10} in de machine.");
    await m.tik(3);

    /* Drie groepjes van 10. */
    await l.zeg("Je hebt {3} groepjes van {10}.", "Welk getal is dat?");
    tel(
      await toetsvraag(l, {
        opties: [3, 20, 30, 40],
        goed: 30,
        herkansing: [3, 13, 30, 40],
        bijGoed: ["Goed, {30} stippen.", "{3} groepjes van {10}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{${x}}?`, "Kijk nog eens goed."]),
        opnieuw: ["{3} groepjes van {10}.", "Hoeveel stippen zijn dat?"],
        antwoord: async () => {
          await l.zeg("{10}, {20}, {30}.", "Het zijn {30} stippen.");
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );

    /* 30 + 50. */
    await l.zeg("Wat krijg je als je er {50} bij doet?", "Hoeveel is {30} plus {50}?");
    tel(
      await toetsvraag(l, {
        opties: [35, 70, 80, 90],
        goed: 80,
        herkansing: [35, 70, 80, 90],
        bijGoed: ["Ja, samen {80}."],
        bijFout: somFout(30, 50),
        opnieuw: ["Hoeveel is {30} plus {50}?"],
        antwoord: async () => {
          await l.zeg("{3} groepjes van {10} en {5} groepjes van {10}.", "Dat zijn {8} groepjes: {80}.");
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    m.zet({ tienen: 8 });
    l.som(plusSom(30, 50, 80));
    await l.wacht(900);
    l.som(null);

    /* 30 + 40, in woorden. */
    m.zet({ tienen: 3 });
    await l.zeg("Probeer deze eens.", "Hoeveel is {30} plus {40}?");
    tel(
      await toetsvraag(l, {
        opties: [34, 60, 70, 80],
        goed: 70,
        herkansing: [34, 60, 70, 80],
        bijGoed: ["Goed, {70}.", "Je doet het echt heel goed."],
        bijFout: somFout(30, 40),
        opnieuw: ["Hoeveel is {30} plus {40}?"],
        antwoord: async () => {
          await l.zeg("{3} groepjes van {10} en {4} groepjes van {10}.", "Dat zijn {7} groepjes: {70}.");
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    m.zet({ tienen: 7 });
    await l.wacht(700);

    /* Een tiental plus eenheden. */
    m.zet({ tienen: 4, enen: 7, knop: null });
    await l.zeg("Kijk, nu zijn er ook losse stippen.", "Hoeveel is {40} plus {7}?");
    tel(
      await toetsvraag(l, {
        opties: [37, 47, 57, 74],
        goed: 47,
        herkansing: [46, 47, 57, 74],
        bijGoed: ["Precies, {47}."],
        bijFout: somFout(40, 7),
        opnieuw: ["Hoeveel is {40} plus {7}?"],
        antwoord: async () => {
          await l.zeg("{4} groepjes van {10} en {7} losse stippen.", "Dat is {47}.");
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );

    /* Splitsen. */
    const sch = maakSchema(l, { geheel: 7, links: 5, rechts: 0, vraag: "rechts" });
    await l.zeg("Nu splitsen we de {7}.", "Eén deel is {5}.", "Hoeveel is het andere deel?");
    tel(
      await toetsvraag(l, {
        opties: [1, 2, 3, 12],
        goed: 2,
        herkansing: [1, 2, 3, 4],
        bijGoed: ["Ja, {5} en {2} is samen {7}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{5} en {${x}} is samen {${5 + x}}.`, "We zoeken {7}."]),
        opnieuw: ["Welk getal hoort in het lege rondje?"],
        antwoord: async () => {
          await l.zeg("{5} en {2} is samen {7}.", "Het andere deel is {2}.");
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    sch.zet({ rechts: 2, vraag: null });
    await l.wacht(700);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    if (goed === 5 && traag === 0) {
      await l.zeg("Je doet het echt heel goed.", "Je kunt al plussommen tot {100} maken.", "Tik op de kaart om hem af te vinken.");
    } else if (goed >= 4) {
      await l.zeg("Goed gedaan.", "In de lessen oefenen we dit nog meer.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg("Dank je wel.", "In de lessen gaan we dit samen oefenen.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

/* ---------- 2. Tientallen erbij ---------- */

const tientallenErbij: Lesdraaiboek = {
  id: "optellen-100-tientallen-erbij",
  titel: "Tientallen erbij",
  synthesis: "Add up to 100 · Add 10s",
  kaarttekening: KaartKlodders,

  async speel(l) {
    const m = maakMachine(l, { tienen: 2, enen: 0, knop: 10 });

    /* Twee groepjes van 10. */
    await l.zeg("Kijk naar de groepjes stippen.", "Welk getal maken ze samen?");
    const x = await kiesGetal(l, [2, 10, 20, 30]);
    if (x === 20) {
      await l.zeg("Goed zo.", "{2} groepjes van {10} is {20}.");
    } else {
      if (x === 2) await l.zeg("Ja, het zijn {2} groepjes.", "Maar in elk groepje zitten {10} stippen.");
      else await l.zeg(x === null ? "Geen zorgen." : "Kijk nog eens goed.", "In elk groepje zitten {10} stippen.");
      await l.verder();
      await l.zeg("{2} groepjes van {10}.", "Hoeveel stippen zijn het samen?");
      const y = await kiesGetal(l, [2, 10, 20, 30]);
      if (y === 20) await l.zeg("Goed.", "{2} groepjes van {10} is {20}.");
      else {
        await l.zeg("{10} stippen en nog {10} stippen.", "Samen zijn dat {20} stippen.");
        await l.verder();
      }
    }
    l.som(getal(20));

    /* Zelf een groepje erbij. */
    m.zet({ wijs: true });
    await l.zeg("Doe er nog een groepje van {10} bij.", "Zie je de plusknop onderaan?", "Tik erop.");
    await m.tik(1);
    l.som(plusZonderUitkomst(20, 10));
    await l.zeg("Goed zo.", "{20} plus {10}.", "Hoeveel stippen zijn het nu samen?");
    await somVraag(l, 20, 10, {
      kies: () => kiesGetal(l, [3, 20, 30, 40]),
      hint: (v) => (v === 3 ? ["Ja, het zijn {3} groepjes.", "Hoeveel stippen zijn dat?"] : ["Tel de groepjes van {10}.", "{10}, {20}, …"]),
      uitleg: ["{10}, {20}, {30}.", "Het zijn {30} stippen."],
    });
    await l.wacht(800);

    /* 30 + 20 en 50 + 30; de machine mag helpen. */
    l.som(getal(30));
    await l.zeg("Probeer deze eens.", "{30} plus {20}.", "Je mag de {20} erbij doen met de machine.");
    let erbij = 0;
    const tikErbij = (a: number) => () => {
      if (m.st.tienen >= 9) return;
      erbij += 10;
      m.zet({ tienen: m.st.tienen + 1 });
      l.som(plusZonderUitkomst(a, erbij));
    };
    await somVraag(l, 30, 20, {
      kies: () => kiesMetMachine(l, m, [5, 40, 50, 60], tikErbij(30)),
      hint: (v) => (v === 5 ? ["Dat zijn de groepjes samen.", "Maar elk groepje is {10}."] : ["Tel er {2} groepjes van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {30} komen {2} groepjes van {10}.", "{40}, {50}."],
      bijGoed: ["Klopt."],
    });
    m.zet({ tienen: 5 });
    await l.wacht(800);

    l.som(getal(50));
    erbij = 0;
    await l.zeg("Je doet het goed.", "Probeer deze eens: {50} plus {30}.");
    await somVraag(l, 50, 30, {
      kies: () => kiesMetMachine(l, m, [8, 70, 80, 90], tikErbij(50)),
      hint: (v) => (v === 8 ? ["Dat zijn de groepjes samen.", "Maar elk groepje is {10}."] : ["Tel er {3} groepjes van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {50} komen {3} groepjes van {10}.", "{60}, {70}, {80}."],
      bijGoed: ["Ja."],
    });
    m.zet({ tienen: 8 });
    await l.wacht(800);

    /* Nu losse stippen erbij: eerst voorspellen, dan zelf doen. */
    l.som(getal(10));
    m.zet({ tienen: 1, enen: 0, knop: 1 });
    await l.zeg("Nu heb je één groepje van {10}.", "We proberen iets anders.", "Je doet er {3} stippen bij.", "Hoeveel is het dan?");
    const v13 = await kiesGetal(l, [4, 10, 13, 23]);
    await l.zeg(v13 === 13 ? "Goed bedacht." : v13 === null ? "Geen zorgen." : "Kijk maar mee.", "Doe ze er zelf maar bij.", "Tik {3} keer op de plusknop.");
    m.zet({ wijs: true });
    await m.tik(3, (st) => l.som(plusZonderUitkomst(10, st.enen)));
    l.som(plusSom(10, 3, 13));
    await l.zeg("Kijk eens.", "{10} plus {3} is {13}.");
    await l.verder();

    l.som(getal(13));
    m.zet({ knop: 10 });
    await l.zeg("Je hebt er nu {13}.", "Nu komt er een groepje van {10} bij.", "Hoeveel is {13} plus {10}?");
    const v23 = await kiesGetal(l, [13, 14, 23, 33]);
    if (v23 === 23) await l.zeg("Goed bedacht.", "Doe zelf een groepje van {10} erbij.");
    else if (v23 === 14) await l.zeg("Kijk goed.", "Er komt een heel groepje van {10} bij.", "Niet één stip.", "Doe zelf een groepje van {10} erbij.");
    else await l.zeg(v23 === null ? "Geen zorgen." : "Kijk maar mee.", "Doe zelf een groepje van {10} erbij.");
    m.zet({ wijs: true });
    await m.tik(1);
    l.som(plusSom(13, 10, 23));
    await l.zeg("Kijk eens.", "{13} plus {10} is {23}.");
    await l.verder();

    /* 17 + 20. */
    l.som(null);
    m.zet({ tienen: 1, enen: 7 });
    await l.zeg("Er staat nu een nieuw getal.", "Welk getal is dit?");
    const v17 = await kiesGetal(l, [7, 17, 27, 71]);
    if (v17 === 17) await l.zeg("Ja, {17}.");
    else {
      await l.zeg(v17 === null ? "Geen zorgen." : "Kijk nog eens.", "Eén groepje van {10} en {7} losse stippen.", "Dat is {17}.");
      await l.verder();
    }
    l.som(getal(17));
    erbij = 0;
    await l.zeg("Nu komt er {20} bij.", "Hoeveel is {17} plus {20}?");
    await somVraag(l, 17, 20, {
      kies: () => kiesMetMachine(l, m, [17, 19, 27, 37], tikErbij(17)),
      hint: (v) => (v === 19 ? ["Kijk goed.", "Er komen {2} groepjes van {10} bij.", "Geen losse stippen."] : ["Tel er {2} groepjes van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {17} komen {2} groepjes van {10}.", "{27}, {37}."],
      bijGoed: ["Klopt."],
    });
    await l.wacht(800);

    /* Oefenen: drie goed, dan klaar. De laatste zonder machine. */
    await l.zeg("Ik geef je er nog een paar.", "Als je er {3} goed hebt, gaan we verder.", "De machine helpt als je hem nodig hebt.");
    await l.verder();
    const sommen: [number, number][] = [
      [34, 10],
      [28, 30],
      [27, 20],
      [45, 20],
      [36, 30],
      [52, 10],
      [61, 20],
    ];
    let goed = 0;
    for (const [a, b] of sommen) {
      if (goed >= 3) break;
      const s = a + b;
      const zonder = goed === 2;
      m.zet({ tienen: Math.floor(a / 10), enen: a % 10, knop: 10, slot: zonder });
      l.som(getal(a));
      erbij = 0;
      if (zonder) await l.zeg("Nog één goed en we zijn klaar.", "Deze keer zet ik de machine op slot.");
      await l.zeg(`Hoeveel is {${a}} plus {${b}}?`);
      const enkel = a + b / 10;
      const inEen = await somVraag(l, a, b, {
        kies: () => (zonder ? kiesGetal(l, oplopend(enkel, s - 10, s, s + 10)) : kiesMetMachine(l, m, oplopend(enkel, s - 10, s, s + 10), tikErbij(a))),
        hint: (v) =>
          v === enkel
            ? ["Kijk goed.", `Er komen hele groepjes van {10} bij.`, "Geen losse stippen."]
            : [`Tel er ${b === 10 ? "één groepje" : `{${b / 10}} groepjes`} van {10} bij.`, `Hoeveel is {${a}} plus {${b}}?`],
        uitleg: [`Bij {${a}} komen ${b === 10 ? "één groepje" : `{${b / 10}} groepjes`} van {10}.`, `Dan heb je {${s}}.`],
        bijGoed: [["Ja.", "Klopt.", "Precies."][goed % 3]],
      });
      if (inEen) goed++;
      m.zet({ tienen: Math.floor(s / 10), enen: s % 10 });
      await l.wacht(900);
      l.som(null);
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(goed >= 3 ? "Je doet ze allemaal goed!" : "Goed gewerkt!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 3. Splitsen ---------- */

const splitsen: Lesdraaiboek = {
  id: "optellen-100-splitsen",
  titel: "Splitsen",
  synthesis: "Add up to 100 · Part Part Whole",
  kaarttekening: KaartSplitsen,

  async speel(l) {
    const sch = maakSchema(l, { geheel: 8, links: 0, rechts: 0 });
    await l.zeg("Weet je hoe je een getal splitst?", "Bijvoorbeeld de {8}?");
    const weet = await l.kies(["Ja", "Nee"]);
    await l.zeg(weet === "Ja" ? "Mooi, dan frissen we het even op." : "Geen probleem.", "Eerst kijken we naar {2} woorden.");

    /* De woorden samenvoegen en splitsen. */
    sch.zet({ verborgen: true });
    await l.zeg("Het eerste woord is *samenvoegen*.", "Heb je dat woord al eens gehoord?");
    const gehoord = await l.kies(["Ja", "Nee"]);
    await l.zeg(gehoord === "Ja" ? "Mooi." : "Geen probleem.", "Samenvoegen is als bouwen.", "Je maakt iets groots van kleine stukjes.");
    await l.verder();

    /* Een voorbeeld uit het leven: een liedje maken uit losse noten. */
    const noten: number[] = [];
    l.vlak(Piano, { noten: [], actief: false, speelknop: false } satisfies PianoProps);
    await l.zeg("Een voorbeeld: een liedje maken.", "Je voegt losse noten samen.", "Probeer het zelf maar.", "Tik op de toetsen.");
    l.pasVlakAan<PianoProps>({ actief: true });
    while (noten.length < 6) {
      const g = await l.wachtOpVlak<PianoMelding>("toets");
      if (g.soort !== "toets") continue;
      noten.push(g.n);
      l.pasVlakAan<PianoProps>({ noten: [...noten] });
      if (noten.length === 2) {
        /* Terwijl het kind verder tikt, zegt de les wat er moet gebeuren. */
        const volgende = l.wachtOpVlak<PianoMelding>("toets");
        await l.zeg("Blijf op de toetsen tikken.", "Zo maak je je liedje af.");
        const h = await volgende;
        if (h.soort === "toets") {
          noten.push(h.n);
          l.pasVlakAan<PianoProps>({ noten: [...noten] });
        }
      }
    }
    l.pasVlakAan<PianoProps>({ actief: false });
    await l.wacht(500);
    l.pasVlakAan<PianoProps>({ speelknop: true });
    await l.zeg("Je hebt een liedje gemaakt met {6} noten.", "Dat zijn {6} stukjes.", "Tik op de afspeelknop om het te horen.");
    l.pasVlakAan<PianoProps>({ actief: true });
    await l.wachtOpVlak<PianoMelding>("speel");
    l.pasVlakAan<PianoProps>({ actief: false });
    await l.wacht(2800);
    await l.zeg("Prachtig.", "Samenvoegen is iets bouwen van kleine stukjes.", "Net als jouw liedje.");
    await l.verder();
    l.vlak(Splitsschema, { ...sch.st });
    await l.zeg("Het tweede woord is *splitsen*.", "Samenvoegen is stukjes bij elkaar doen.", "Wat betekent splitsen, denk je?");
    const woord = await l.kies(["In stukjes breken", "Groter maken"]);
    if (woord === "In stukjes breken") await l.zeg("Ja!", "Splitsen is iets in stukjes breken.");
    else {
      await l.zeg(woord === null ? "Geen zorgen." : "Niet helemaal.", "Splitsen is het omgekeerde van samenvoegen.", "Je breekt iets in stukjes.");
      await l.verder();
    }

    /* Een tegel van 5 valt uit elkaar. */
    sch.zet({ verborgen: false, tegel: "heel" });
    await l.zeg("Bij rekenen splitsen we getallen.", "Probeer het maar.", "Tik op deze tegel van {5}.");
    await l.wachtOpVlak<SplitsMelding>("tegel");
    sch.zet({ tegel: "los" });
    await l.wacht(800);
    await l.zeg("Goed zo.", "Je hebt de {5} gesplitst.", "In hoeveel stukjes?");
    let stukjes = await kiesGetal(l, [3, 4, 5]);
    if (stukjes !== 5 && stukjes !== null) {
      await l.zeg("Tel de stukjes nog eens.");
      stukjes = await kiesGetal(l, [3, 4, 5]);
    }
    if (stukjes === 5) await l.zeg("Ja, precies.", "In {5} stukjes van {1}.");
    else {
      await l.zeg(stukjes === null ? "Geen zorgen." : "", "Het zijn {5} stukjes van {1}.");
      await l.verder();
    }

    /* De splitsmachine, stap voor stap. */
    sch.zet({ tegel: null, geheel: null, links: 0, rechts: 0 });
    await l.zeg("Dat gaan we vandaag doen: getallen splitsen.", "Deze machine helpt ons.");
    await l.verder();
    await l.zeg("Begin bij dit rondje onderaan.", "Tik op de plusknop.");
    await knoppenTot(l, sch, () => sch.st.links >= 1, "links-plus");
    await l.zeg("Mooi, er zit een {1} in.", "Kun je er een {4} van maken?");
    await knoppenTot(l, sch, () => sch.st.links === 4, "links-plus");
    await l.zeg("Goed.", "Tik nu één keer op de min.");
    await knoppenTot(l, sch, () => sch.st.links === 3, "links-min");
    await l.zeg("Je hebt van de {4} een {3} gemaakt.", "Zag je het grote rondje bovenaan?", "Daar staan ook {3} stippen.", "Dat is het totaal.");
    await l.verder();
    await l.zeg("Dit rondje is nog leeg.", "Doe er {2} stippen in.", "Tik op deze plusknop.");
    await knoppenTot(l, sch, () => sch.st.rechts === 2, "rechts-plus");
    await l.zeg("Je hebt ook het totaal veranderd.", "Hoeveel is het nu?");
    const tot = await kiesGetal(l, [2, 3, 5]);
    if (tot === 5) await l.zeg("Natuurlijk, {5}.");
    else await l.zeg(tot === null ? "Geen zorgen." : "Kijk naar het grote rondje.", "Daar staan {5} stippen.");
    await l.zeg("De delen {3} en {2} maken samen {5}.", "Het totaal staat altijd bovenaan.");
    await l.verder();
    await l.zeg("Je hebt dus {2} delen en één totaal.", "Welke som heb je gemaakt?");
    const somKeuze = await l.kies(schud(["3 + 2 = 5", "4 + 2 = 6"]));
    if (somKeuze === "3 + 2 = 5") await l.zeg("Precies.");
    else {
      await l.zeg("Kijk naar de delen: {3} en {2}.", "Samen is dat {5}.", "Dus {3} plus {2} is {5}.");
      await l.verder();
    }
    sch.zet({ lijst: [[3, 2, 5]] });

    /* Nog een manier om 5 te splitsen. */
    await l.zeg("{3} en {2} is één manier om {5} te splitsen.", "Kun je het ook *anders*?");
    const anders = await l.kies(["Ja", "Nee"]);
    await l.zeg(
      anders === "Ja" ? "Mooi." : "We proberen het samen.",
      "Verander de stippen in de rondjes onderaan.",
      "Zorg dat het samen weer {5} is.",
      "Tik op het vinkje als je klaar bent.",
    );
    const [a5, b5] = await zoekSplitsing(l, sch, 5, [[3, 2]], false);
    sch.zet({ lijst: [[3, 2, 5], [a5, b5, 5]] });
    await l.zeg("Eerst splitste je {5} in {3} en {2}.", "Hoe deed je het deze keer?");
    const hoe = await l.kies(schud([`${a5} en ${b5}`, `${a5 + 1} en ${b5}`]));
    await l.zeg(hoe === `${a5} en ${b5}` ? "Goed." : "Kijk naar de rondjes.", `{${a5}} en {${b5}}.`);
    await l.wacht(600);

    /* Een vast totaal van 7: drie manieren zoeken. */
    sch.zet({ geheel: 7, links: 0, rechts: 0, lijst: [] });
    await l.zeg("Ik heb een nieuw totaal klaargezet.", "Welk getal is het?");
    const z = await kiesGetal(l, [6, 7, 8]);
    if (z === 7) await l.zeg("Ja, {7}.");
    else await l.zeg(z === null ? "Geen zorgen." : "Tel de stippen nog eens.", "Het zijn er {7}.");
    await l.zeg("Zoek {2} delen die samen {7} maken.", "Tik dan op het vinkje.");
    const gevonden: [number, number][] = [];
    const lijst7 = () => gevonden.map(([p, q]) => [p, q, 7] as [number, number, number]);
    let [p, q] = await zoekSplitsing(l, sch, 7, gevonden);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg("Dat klopt.", `Je hebt {7} gesplitst in {${p}} en {${q}}.`);
    await l.zeg("Je snapt het al goed.", "We breken een getal in stukjes.", "Weet je nog hoe dat heet?");
    const naam = await l.kies(schud(["Splitsen", "Samenvoegen"]));
    if (naam === "Splitsen") await l.zeg("Precies.", "Splitsen is een getal in stukjes breken.", `Net zoals jij {7} splitste in {${p}} en {${q}}.`);
    else await l.zeg(naam === null ? "Geen zorgen." : "Bijna.", "Het heet splitsen.", "Splitsen is een getal in stukjes breken.");
    await l.verder();

    await l.zeg("Zoek nog een manier om {7} te splitsen.");
    [p, q] = await zoekSplitsing(l, sch, 7, gevonden);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg("Heel goed.", `Je hebt {7} gesplitst in {${p}} en {${q}}.`, "Zoek nog één manier.");
    [p, q] = await zoekSplitsing(l, sch, 7, gevonden);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg(`{${p}} en {${q}}, goed zo.`, "Je hebt {7} nu op {3} manieren gesplitst.", "Knap gedaan.");
    await l.verder();

    /* Zelf kiezen: zo een, of een groter getal. */
    await l.zeg("Nog één getal, dan zijn we klaar.", "Wil je er nog een zoals deze?", "Of een groter getal?");
    const groter = (await l.kies(["Zo een", "Groter"])) === "Groter";
    const g = groter ? 12 : 8;
    const gevondenG: [number, number][] = [];
    sch.zet({ geheel: g, links: 0, rechts: 0, lijst: [] });
    await l.zeg(groter ? "Goed, een groter getal." : "Goed, nog een zoals deze.", `Splits de {${g}} in {2} delen.`);
    [p, q] = await zoekSplitsing(l, sch, g, gevondenG);
    gevondenG.push([p, q]);
    sch.zet({ lijst: [[p, q, g]] });
    await l.zeg("Ja.", `{${p}} plus {${q}} is {${g}}.`, `Zoek een andere manier om {${g}} te splitsen.`);
    const [r1, r2] = await zoekSplitsing(l, sch, g, gevondenG);
    sch.zet({ lijst: [[p, q, g], [r1, r2, g]] });
    await l.zeg("Mooi.", `Je hebt {${g}} op {2} manieren gesplitst.`, l.naam ? `Echt knap werk, ${l.naam}.` : "Echt knap werk.");
    await l.verder();

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Goed gedaan.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 4. Tiental plus eenheden ---------- */

const tientalPlusEenheden: Lesdraaiboek = {
  id: "optellen-100-tiental-plus-eenheden",
  titel: "Tiental plus eenheden",
  synthesis: "Add up to 100 · 10s Plus Ones",
  kaarttekening: KaartStaven,

  async speel(l) {
    const st: TientallenProps = { modus: "staven", staven: 3 };
    l.vlak(Tientallenbord, { ...st });
    const zet = (p: Partial<TientallenProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<TientallenProps>(p);
    };
    const kiesUitPalet = async () => {
      zet({ actief: true });
      const gk = await l.wachtOpVlak<TientallenMelding>("kies");
      zet({ actief: false });
      return gk.soort === "kies" ? gk.n : 1;
    };

    /* Drie staven van 10. */
    await l.zeg("We beginnen hiermee.", "Welk getal heb ik met de stippen gemaakt?");
    const x = await kiesGetal(l, [3, 10, 30]);
    if (x === 30) await l.zeg("Goed, {30}.");
    else {
      await l.zeg(x === null ? "Geen zorgen." : x === 3 ? "{3}?" : `{${x}}?`, x === 3 ? "Ik zie wel {3} groepjes." : "", "Maar elk groepje heeft {10} stippen.");
      await l.verder();
      await l.zeg("Probeer het nog eens.", "Welk getal laten de witte stippen zien?");
      const y = await kiesGetal(l, [20, 29, 30]);
      if (y === 30) await l.zeg("Goed, {30}.");
      else {
        await l.zeg("{10}, {20}, {30}.", "Het is {30}.");
        await l.verder();
      }
    }

    /* Een rond getal: alleen groepjes van 10. */
    await l.zeg("{30} is een bijzonder getal.", "Het is een *rond* getal.", "Weet je wat ronde getallen zijn?");
    const weetRond = await l.kies(["Ja", "Nee"]);
    await l.zeg(
      weetRond === "Ja" ? "Mooi, dan frissen we het even op." : "Geen probleem, ik help je.",
      weetRond === "Ja" ? "" : "Het klinkt lastig, maar je kent er al een paar.",
      "Een rond getal bestaat alleen uit groepjes van {10}.",
    );
    await l.verder();
    zet({ staven: 1 });
    await l.zeg("Zoals deze: {10}.", "Ik doe er een groepje bij.", "Wat is het volgende ronde getal?");
    const v20 = await kiesGetal(l, [15, 20, 25]);
    zet({ staven: 2 });
    if (v20 === 20) await l.zeg("Ja, {20}.", "Want het zijn {2} groepjes van {10}.");
    else {
      await l.zeg(v20 === null ? "Geen zorgen." : "Kijk maar.", "Het is {20}.", "{2} groepjes van {10}.");
      await l.verder();
    }
    zet({ half: true });
    await l.zeg("Hm, {25}.", "Is *dit* een rond getal?");
    const rond25 = await l.kies(["Ja", "Nee"]);
    if (rond25 === "Nee") await l.zeg("Je hebt gelijk.", "{2} groepjes van {10} en een beetje extra.", "Dus het is geen rond getal.");
    else {
      await l.zeg(rond25 === null ? "Geen zorgen." : "Kijk goed.", "Het laatste groepje is niet vol.", "Dus {25} is geen rond getal.");
    }
    await l.verder();
    zet({ half: false, staven: 3 });
    await l.zeg("En zo komen we bij {30}.", "Is dit een rond getal?");
    const rond30 = await l.kies(["Ja", "Nee"]);
    await l.zeg(rond30 === "Ja" ? "Natuurlijk." : "Kijk goed.", "{3} groepjes van {10} en niets extra.", "Dus {30} is een rond getal.");
    await l.verder();

    /* Een klein getal bij een rond getal. */
    zet({ palet: true, som: { a: 30, b: null, c: null } });
    await l.zeg("Nu doen we een klein getal bij een rond getal.", "Kies een gekleurd getal om bij {30} te doen.", "Tik op een van de stippen bovenaan.");
    const n = await kiesUitPalet();
    zet({ extra: n, som: { a: 30, b: n, c: null } });
    await l.zeg(`Kijk naar je stippen.`, `Hoeveel is {30} plus {${n}}?`);
    await vraagTiental(l, 30, n, (c) => zet({ som: { a: 30, b: n, c } }));

    zet({ staven: 4, extra: null, paletSlot: [n], som: { a: 40, b: null, c: null } });
    await l.zeg(`Probeer nu een getal bij {40}.`, `De {${n}} zet ik op slot.`, "Die hadden we al.");
    const k = await kiesUitPalet();
    zet({ extra: k, som: { a: 40, b: k, c: null } });
    await l.zeg(`Hoeveel is {40} plus {${k}}?`);
    await vraagTiental(l, 40, k, (c) => zet({ som: { a: 40, b: k, c } }));

    /* Het trucje, met pijlen. */
    zet({ modus: "pijlen", pijlen: { a: 20, b: 3, c: 23 }, palet: false });
    await l.zeg("Je doet het goed.", "Misschien zag je al een trucje.");
    await l.verder();
    await l.zeg("We hebben een rond getal, zoals {20}.", "We doen er een klein getal bij.", "Wat gebeurt er met de tientallen?");
    const t = await l.kies(["Ze blijven gelijk", "Ze worden meer", "Ze worden minder"]);
    if (t === "Ze blijven gelijk") await l.zeg("Ja.", "Het aantal tientallen verandert helemaal niet.");
    else {
      await l.zeg(t === null ? "Geen zorgen." : "Kijk naar de pijlen.", "Er staat twee keer een {2}.", "De tientallen blijven gelijk.");
      await l.verder();
    }
    await l.zeg("En de eenheden?", "Veranderden die toen we er {3} bij deden?");
    const e = await l.kies(["Ja", "Nee"]);
    await l.zeg(e === "Ja" ? "Natuurlijk." : "Kijk nog eens.", "Ze werden het getal dat we erbij deden.", "Van {0} naar {3}.");
    await l.verder();

    /* De plaatswaardekaart. */
    zet({ modus: "kaart", tienen: 2, enen: 0 });
    await l.zeg("Ik laat het nog op een andere manier zien.", "Ik heb {2} tientallen in deze kaart gezet.", "Samen is dat {20}.", "En hoeveel eenheden zijn er?");
    const nul = await kiesGetal(l, [0, 1, 2]);
    if (nul === 0) await l.zeg("Ja, er zijn geen eenheden.", "Dan is het een rond getal.");
    else {
      await l.zeg(nul === null ? "Geen zorgen." : "Kijk in het vak van de eenheden.", "Het is leeg.", "Er zijn {0} eenheden.");
      await l.verder();
    }
    await l.zeg("Nu doen we er wat bij.", "Laat {20} plus {3} zien.", "Tik {3} keer in het vak van de eenheden.");
    await eenhedenTikken(l, st, zet, 3);
    await l.zeg("Goed, je deed er {3} bij.", "Wat veranderde er?");
    const wat = await l.kies(["De tientallen", "De eenheden"]);
    await l.zeg(wat === "De eenheden" ? "Ja, klopt." : "Kijk naar de kaart.", "Alleen de eenheden veranderen.", "Nu nog één.");
    await l.verder();
    zet({ tienen: 4, enen: 0 });
    await l.zeg("Ik heb er {4} tientallen in gezet.", "Maar {0} eenheden.", "Dat is {40}.");
    await l.zeg("Laat nu {40} plus {5} zien.", "Zet {5} eenheden in het vak.");
    await eenhedenTikken(l, st, zet, 5);
    await l.zeg("Goed zo.", "Je doet een klein getal bij een rond getal.", "Wat verandert er dan?");
    const regel = await l.kies(["De eenheden veranderen", "De tientallen veranderen"]);
    await l.zeg(regel === "De eenheden veranderen" ? "Klopt." : "Kijk nog eens naar de kaart.", "Dan veranderen alleen de eenheden.");
    await l.verder();

    /* Snelle vragen, zonder stippen. */
    zet({ modus: "leeg" });
    await l.zeg("Nu nog een paar snelle vragen.", "Geen stippen, alleen jij en ik.");
    const snel: [number, number, number[]][] = [
      [70, 3, [63, 72, 73, 83]],
      [70, 8, [77, 78, 87, 88]],
      [50, 3, [43, 53, 54, 63]],
      [10, 8, [17, 18, 19, 81]],
    ];
    for (const [i, [a, b, lijst]] of snel.entries()) {
      l.som(plusSom(a, b));
      await l.zeg(i === 0 ? "Probeer deze eerst." : i === 3 ? "Oké, nog één." : "En deze?", `Hoeveel is {${a}} plus {${b}}?`);
      let keuzes = lijst;
      for (let poging = 1; ; poging++) {
        const v = await kiesGetal(l, keuzes);
        if (v === a + b) {
          l.som(plusSom(a, b, a + b));
          await l.zeg(["Ja.", "Precies.", "Goed.", "Helemaal goed."][i], `{${a + b}}.`);
          break;
        }
        if (v !== null && poging === 1) {
          keuzes = schud(keuzes.filter((w) => w !== v));
          await l.zeg("Probeer het nog eens.");
          continue;
        }
        l.som(plusSom(a, b, a + b));
        await l.zeg(a === 10 ? "Het tiental van {10} blijft gelijk." : `De tientallen van {${a}} blijven gelijk.`, `Er komen {${b}} eenheden bij: {${a + b}}.`);
        await l.verder();
        break;
      }
      await l.wacht(600);
      l.som(null);
    }
    await l.zeg(l.naam ? `${l.naam}, je snapt het helemaal.` : "Je snapt het helemaal.", "Knap gedaan.");
    await l.wacht(600);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** Het getal met de cijfers omgedraaid: 37 wordt 73. */
function omgedraaid(n: number): number {
  return Number(String(n).split("").reverse().join(""));
}

/**
 * "Hoeveel is 30 plus 7?" met de valkuil 73 (cijfers omgedraaid). Bij 33 en 44
 * kan dat niet; dan is de valkuil alleen de losse stippen (3).
 */
async function vraagTiental(l: Lesgids, a: number, b: number, zetUitkomst: (c: number) => void) {
  const s = a + b;
  const fout = omgedraaid(s) !== s ? omgedraaid(s) : b;
  let keuzes = oplopend(s, s + 10, fout);
  for (let poging = 1; ; poging++) {
    const v = await kiesGetal(l, keuzes);
    if (v === s) {
      zetUitkomst(s);
      await l.zeg(poging === 1 ? "Precies." : "Helemaal goed.", `{${a}} plus {${b}} is {${s}}.`);
      await l.verder();
      return;
    }
    if (v !== null && poging === 1) {
      /* De foute keuze verdwijnt; er komt een nieuwe bij. */
      keuzes = oplopend(...keuzes.filter((w) => w !== v), s - 1);
      await l.zeg(
        v === fout && fout !== b ? "Eerst de tientallen, dan de losse stippen." : v === fout ? "Vergeet de groepjes van {10} niet." : "Tel de groepjes van {10} nog eens.",
        "Probeer het nog eens.",
      );
      continue;
    }
    zetUitkomst(s);
    await l.zeg(v === null ? "Geen zorgen." : "Kijk.", "Het getal valt op de plek van de nul.", `{${a}} plus {${b}} is {${s}}.`);
    await l.verder();
    return;
  }
}

/** Het kind tikt eenheden in het vak tot er `aantal` bij zijn gekomen. */
async function eenhedenTikken(l: Lesgids, st: TientallenProps, zet: (p: Partial<TientallenProps>) => void, aantal: number) {
  const doel = (st.enen ?? 0) + aantal;
  zet({ actief: true });
  while ((st.enen ?? 0) < doel) {
    await l.wachtOpVlak<TientallenMelding>("eenheid");
    zet({ enen: (st.enen ?? 0) + 1 });
  }
  zet({ actief: false });
}

/* ---------- 5. Eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "optellen-100-eindtoets",
  titel: "Eindtoets: optellen tot 100",
  synthesis: "Add up to 100 · Mastery Check",
  kaarttekening: KaartEindtoets,

  async speel(l) {
    let goed = 0;
    let traag = 0;
    const tel = (r: { goed: boolean; traag: boolean }) => {
      if (r.goed) goed++;
      if (r.traag) traag++;
    };

    const m = maakMachine(l, { honderd: true, knop: null });
    await l.zeg("Dit is de eindtoets van optellen tot {100}.", "Ken je dit al?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We kijken wat je al kunt.", "Probeer zo vlot mogelijk te antwoorden.");
    m.zet({ honderd: false, knop: 10, wijs: true });
    await l.zeg("Tik {3} keer op de plusknop.");
    await m.tik(3);
    await l.zeg("Welk getal is dat?");
    tel(
      await toetsvraag(l, {
        opties: [3, 20, 30, 40],
        goed: 30,
        herkansing: [3, 13, 30, 40],
        bijGoed: ["Goed, {30} stippen.", "{3} groepjes van {10}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{${x}}?`, "Kijk nog eens goed."]),
        opnieuw: ["{3} groepjes van {10}.", "Hoeveel stippen zijn dat?"],
        antwoord: async () => {
          await l.zeg("Het zijn {30} stippen.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );

    await l.zeg("Wat krijg je als je er {40} bij doet?", "Hoeveel is {30} plus {40}?");
    tel(
      await toetsvraag(l, {
        opties: [34, 60, 70, 80],
        goed: 70,
        herkansing: [34, 60, 70, 80],
        bijGoed: ["Precies, {30} plus {40} is {70}."],
        bijFout: somFout(30, 40),
        opnieuw: ["Hoeveel is {30} plus {40}?"],
        antwoord: async () => {
          await l.zeg("{30} plus {40} is {70}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    m.zet({ tienen: 7, knop: null });
    await l.zeg("Kijk hoe ik er nu eenheden bij doe.");
    for (let i = 1; i <= 6; i++) {
      m.zet({ enen: i });
      await l.wacht(220);
    }
    await l.zeg("{70} plus {6}.", "Weet je welk getal dit is?");
    tel(
      await toetsvraag(l, {
        opties: [66, 67, 76, 86],
        goed: 76,
        herkansing: [67, 75, 76, 86],
        bijGoed: ["Precies, {76}."],
        bijFout: somFout(70, 6),
        opnieuw: ["{7} groepjes van {10} en {6} losse stippen.", "Welk getal is dat?"],
        antwoord: async () => {
          await l.zeg("{7} groepjes van {10} en {6} losse stippen.", "Dat is {76}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );

    const sch = maakSchema(l, { geheel: 8, links: 5, rechts: 0, vraag: "rechts" });
    await l.zeg("Nu splitsen we de {8}.", "Eén deel is {5}.", "Hoeveel is het andere deel?");
    tel(
      await toetsvraag(l, {
        opties: [2, 3, 4, 13],
        goed: 3,
        herkansing: [1, 2, 3, 4],
        bijGoed: ["Ja, {5} en {3} is samen {8}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{5} en {${x}} is samen {${5 + x}}.`, "We zoeken {8}."]),
        opnieuw: ["Welk getal hoort in het lege rondje?"],
        antwoord: async () => {
          await l.zeg("{5} en {3} is samen {8}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    sch.zet({ rechts: 3, vraag: null });
    await l.wacht(700);

    /* Een kale som. */
    maakMachine(l, { knop: null });
    l.som(plusSom(27, 20));
    await l.zeg("Nog één vraag.", "Hoeveel is {27} plus {20}?");
    tel(
      await toetsvraag(l, {
        opties: [29, 37, 47, 57],
        goed: 47,
        herkansing: [29, 37, 47, 57],
        bijGoed: ["Helemaal goed."],
        bijFout: somFout(27, 20),
        opnieuw: ["Hoeveel is {27} plus {20}?"],
        antwoord: async () => {
          await l.zeg("Bij {27} komen {2} groepjes van {10}.", "{37}, {47}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    l.som(plusSom(27, 20, 47));
    await l.wacht(900);
    l.som(null);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    if (goed === 5 && traag <= 1) {
      await l.zeg(l.naam ? `Echt knap gedaan, ${l.naam}!` : "Echt knap gedaan!", "Je kunt plussommen tot {100} maken.", "Tik op de kaart om hem af te vinken.");
    } else if (goed >= 4) {
      await l.zeg("Goed gedaan.", traag > 1 ? "Je weet het, nu nog wat vlotter." : "Je weet het bijna allemaal.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg("Je weet al veel.", "Oefen nog wat met de lessen.", "Daarna doe je de toets nog eens.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

/* ---------- stippen in groepen van tien (aanvullen en over het tiental) ---------- */

type Kaders = { st: KadersProps; zet(p: Partial<KadersProps>): void };

function maakKaders(l: Lesgids, begin: Partial<KadersProps>): Kaders {
  const st: KadersProps = {
    modus: "stippen",
    tienen: 0,
    los: 0,
    bij: [],
    kaders: false,
    omlijnLos: false,
    wijsKader: false,
    pijlLos: false,
    palet: false,
    paletSlot: [],
    actief: false,
    som: null,
    vinkje: false,
    hulp: false,
    ...begin,
  };
  l.vlak(Stippenkaders, { ...st });
  return {
    st,
    zet(p) {
      Object.assign(st, p);
      l.pasVlakAan<KadersProps>(p);
    },
  };
}

const NEGEN = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PLUS: SomStuk = { t: "teken", s: "+" };
const IS: SomStuk = { t: "teken", s: "=" };
const LEEG: SomStuk = { t: "leeg" };
const wit = (n: number): SomStuk => ({ t: "getal", n });

/** "a + b + … (= uitkomst)" voor de som in het vlak: het eerste getal wit, wat erbij komt in zijn kleur, `null` = leeg plekje. */
function somBij(a: number, bij: (number | null)[], uit?: number): SomStuk[] {
  const delen: SomStuk[] = [wit(a)];
  for (const b of bij) delen.push(PLUS, b === null ? LEEG : kleurGetal(b));
  if (uit !== undefined) delen.push(IS, wit(uit));
  return delen;
}

/** "Eén groep van 10 en nog 7." */
function groepenZin(a: number): string {
  const t = Math.floor(a / 10);
  return `${t === 1 ? "Eén groep" : `{${t}} groepen`} van {10} en nog {${a % 10}}.`;
}

/** De zin over de lege plekjes in de groep die nog niet vol is. */
function legePlekjes(n: number): string {
  return n === 1 ? "Er is {1} leeg plekje." : `Er zijn {${n}} lege plekjes.`;
}

/**
 * Het kind kiest een groepje uit het palet. Met `vinkje` mag het nog wisselen
 * en bevestigt het met het blauwe vinkje; met `hulp` staat het handje erbij
 * (weet ik niet: `null`).
 */
async function kiesGroepje(
  l: Lesgids,
  k: Kaders,
  o: { vaste: number[]; vinkje: boolean; hulp: boolean; som: (g: number) => SomStuk[]; uitlegVinkje?: boolean },
): Promise<number | null> {
  const soorten = ["kies", "klaar", "hulp"];
  k.zet({ actief: true, palet: true, hulp: o.hulp, vinkje: false });
  let g: number | null = null;
  let uitgelegd = !o.uitlegVinkje;
  let wachtend: Promise<KadersMelding> | null = null;
  for (;;) {
    const ev: KadersMelding = await (wachtend ?? l.wachtOpVlak<KadersMelding>(soorten));
    wachtend = null;
    if (ev.soort === "hulp") {
      g = null;
      break;
    }
    if (ev.soort === "klaar") {
      if (g !== null) break;
      continue;
    }
    g = ev.n;
    k.zet({ bij: [...o.vaste, g], som: o.som(g), vinkje: o.vinkje });
    if (!o.vinkje) break;
    if (!uitgelegd) {
      uitgelegd = true;
      /* Al luisteren terwijl de les praat, zodat een tik niet verloren gaat. */
      wachtend = l.wachtOpVlak<KadersMelding>(soorten);
      await l.zeg("Ben je tevreden met je keuze?", "Tik dan op het blauwe vinkje.");
    }
  }
  k.zet({ actief: false, vinkje: false, hulp: false });
  return g;
}

/**
 * Aanvullen met een groepje uit het palet, tot het kind `nodig` kiest. Bij de
 * eerste fout ziet het kind wat er gebeurt (een gaatje, of stippen over de
 * groep heen) en de foute keuze gaat op slot; bij de tweede fout of bij het
 * handje zegt de les welk groepje het moet zijn. Geeft terug of het in één
 * keer goed was.
 */
async function vulAan(
  l: Lesgids,
  k: Kaders,
  o: {
    vaste: number[];
    nodig: number;
    vinkje: boolean;
    uitlegVinkje?: boolean;
    som: (g: number | null, klaar: boolean) => SomStuk[];
    fout: (g: number) => string[];
    hint: string[];
  },
): Promise<boolean> {
  let fouten = 0;
  let slot: number[] = [];
  let alleen = false;
  for (;;) {
    k.zet({ bij: o.vaste, som: o.som(null, false), paletSlot: alleen ? NEGEN.filter((n) => n !== o.nodig) : slot });
    const g = await kiesGroepje(l, k, {
      vaste: o.vaste,
      vinkje: o.vinkje && !alleen,
      hulp: !alleen,
      som: (x) => o.som(x, false),
      uitlegVinkje: o.uitlegVinkje && fouten === 0,
    });
    if (g === o.nodig) {
      k.zet({ som: o.som(g, true), paletSlot: [] });
      return fouten === 0;
    }
    fouten++;
    if (g === null) {
      await l.zeg("Geen zorgen.", ...o.hint);
      alleen = true;
      continue;
    }
    k.zet({ som: o.som(g, true) });
    await l.zeg(...o.fout(g));
    await l.verder();
    k.zet({ bij: o.vaste, som: o.som(null, false) });
    if (fouten === 1) {
      slot = [g];
      await l.zeg("Probeer het nog eens.");
    } else {
      alleen = true;
      await l.zeg(...o.hint);
    }
  }
}

/**
 * Een telvraag met keuzes. Met `opnieuw` krijgt het kind na een fout dezelfde
 * vraag anders gesteld, met andere keuzes; daarna (of bij "Weet ik niet") het
 * antwoord met de reden.
 */
async function telVraag(
  l: Lesgids,
  lijst: number[],
  goed: number,
  o: { bijGoed: string[]; uitleg: string[]; bijFout?: (x: number) => string[]; opnieuw?: { zin: string[]; lijst: number[] } },
): Promise<boolean> {
  const x = await kiesGetal(l, lijst);
  if (x === goed) {
    await l.zeg(...o.bijGoed);
    return true;
  }
  if (x !== null && o.opnieuw) {
    await l.zeg(...(o.bijFout?.(x) ?? [`{${x}}?`, "Dat is het niet helemaal."]));
    await l.verder();
    await l.zeg(...o.opnieuw.zin);
    const y = await kiesGetal(l, o.opnieuw.lijst);
    if (y === goed) {
      await l.zeg(...o.bijGoed);
      return false;
    }
  }
  await l.zeg(x === null ? "Geen zorgen." : "", ...o.uitleg);
  await l.verder();
  return false;
}

/** Aanvullen tot het volgende tiental met de stippen: "Wat moet er bij 17 om 20 te maken?" */
async function aanvullenMetStippen(l: Lesgids, k: Kaders, a: number, doel: number, eerste: boolean): Promise<boolean> {
  const nodig = doel - a;
  k.zet({ modus: "stippen", tienen: Math.floor(a / 10), los: a % 10, bij: [], palet: true, paletSlot: [], som: somBij(a, [null]), omlijnLos: false });
  await l.zeg(`Wat moet er bij {${a}} om {${doel}} te maken?`, eerste ? "Tik op een groepje stippen bovenaan." : "");
  return vulAan(l, k, {
    vaste: [],
    nodig,
    vinkje: true,
    uitlegVinkje: eerste,
    som: (g, klaar) => (g === null ? somBij(a, [null]) : klaar ? somBij(a, [g], a + g) : somBij(a, [g])),
    fout: (g) => [`{${a}} plus {${g}} is {${a + g}}.`, `We zoeken {${doel}}.`, g < nodig ? "Kijk, er zijn nog lege plekjes." : "Kijk, er gaan stippen over de groep heen."],
    hint: ["Tel de lege plekjes in de groep.", legePlekjes(nodig), `Tik op de {${nodig}}.`],
  });
}

/** Aanvullen zonder stippen: alleen de som, het kind typt het getal. Na een fout mag het de stippen erbij halen. */
async function aanvullenZonderStippen(l: Lesgids, k: Kaders, a: number, doel: number, bijGoed: string) {
  const nodig = doel - a;
  const vraag = () => k.zet({ modus: "som", palet: false, bij: [], som: [wit(a), PLUS, LEEG, IS, wit(doel)] });
  vraag();
  await l.zeg(`Wat moet er bij {${a}} om {${doel}} te maken?`);
  for (let poging = 1; ; poging++) {
    const x = await l.getal();
    if (x === nodig) {
      k.zet({ som: [wit(a), PLUS, kleurGetal(nodig), IS, wit(doel)] });
      await l.zeg(bijGoed, `{${a}} plus {${nodig}} is {${doel}}.`);
      await l.wacht(800);
      return;
    }
    if (x !== null) {
      k.zet({ som: somBij(a, [x], a + x) });
      await l.zeg(`{${a}} plus {${x}} is {${a + x}}.`, `We zoeken {${doel}}.`);
      if (poging >= 2) {
        k.zet({ som: [wit(a), PLUS, kleurGetal(nodig), IS, wit(doel)] });
        await l.zeg(`Er moet {${nodig}} bij.`, `{${a}} plus {${nodig}} is {${doel}}.`);
        await l.verder();
        return;
      }
      await l.zeg("Wil je het nog eens proberen?", "Of zullen we de stippen erbij halen?");
      const keuze = await l.kies(["Nog eens", "Met stippen"]);
      if (keuze === "Nog eens") {
        vraag();
        await l.zeg(`Wat moet er bij {${a}} om {${doel}} te maken?`);
        continue;
      }
      await l.zeg("Goed, we halen de stippen erbij.");
    } else {
      await l.zeg("Geen zorgen.", "We halen de stippen erbij.");
    }
    await aanvullenMetStippen(l, k, a, doel, false);
    await l.zeg("Ja.", `{${a}} plus {${nodig}} is {${doel}}.`);
    await l.verder();
    return;
  }
}

/* ---------- kaarttekeningen van de nieuwe lessen (SVG van 244 × 190) ---------- */

/** Een groep van tien als 2 × 5 stippen; `kleur(i)` per stip, van onder naar boven. */
function Tienstaaf({ x, onder, kleur, rand }: { x: number; onder: number; kleur: (i: number) => string | null; rand?: boolean }) {
  return (
    <g>
      {rand && <rect x={x - 22} y={onder - 102} width={44} height={116} rx={4} fill="none" stroke="#c9b27a" strokeWidth={2} />}
      {Array.from({ length: 10 }, (_, i) => {
        const k = kleur(i);
        return k ? <circle key={i} cx={x + (i % 2 === 0 ? -10 : 10)} cy={onder - Math.floor(i / 2) * 22} r={8} fill={k} /> : null;
      })}
    </g>
  );
}

function KaartAanvullen() {
  return (
    <g>
      <Tienstaaf x={84} onder={150} kleur={() => "#d6d8e1"} />
      <Tienstaaf x={160} onder={150} kleur={(i) => (i < 7 ? "#d6d8e1" : "#4b8af5")} />
    </g>
  );
}

function KaartHonderd() {
  return (
    <g>
      <Klodder x={122} y={80} soort={100} zaad={2.3} />
      <text x={122} y={178} textAnchor="middle" fontSize={30} fontStyle="italic" fontFamily="'Comic Sans MS', 'Segoe Print', cursive" fill="#ffffff">
        honderd
      </text>
    </g>
  );
}

function KaartOverTiental() {
  return (
    <g>
      <Tienstaaf x={66} onder={150} kleur={() => "#d6d8e1"} rand />
      <Tienstaaf x={136} onder={150} kleur={(i) => (i < 7 ? "#d6d8e1" : "#3fb34f")} rand />
      <circle cx={190} cy={150} r={8} fill="#3fb34f" />
      <circle cx={210} cy={150} r={8} fill="#3fb34f" />
    </g>
  );
}

/* ---------- 6. Aanvullen tot het tiental ---------- */

const aanvullenTotTiental: Lesdraaiboek = {
  id: "optellen-100-aanvullen-tot-tiental",
  titel: "Aanvullen tot het tiental",
  synthesis: "Add up to 100 · Bridging to 10s",
  kaarttekening: KaartAanvullen,

  async speel(l) {
    const k = maakKaders(l, { tienen: 3, los: 3, som: somBij(33, [null]) });
    await l.zeg("We gaan naar het volgende ronde getal.", "Wat moet er bij {33} om {40} te maken?", "Weet je dat al?");
    const weet = await l.kies(["Ja", "Nee"]);
    await l.zeg(weet === "Ja" ? "Mooi, dan kijken we samen of het klopt." : "Helemaal geen probleem.", "We ontdekken het samen.");

    /* 1. Tellen: groepen van tien en losse stippen, tot 38. */
    k.zet({ tienen: 1, los: 0, som: null });
    await l.zeg("Kijk naar de witte stippen.", "Hoeveel stippen zijn het?");
    await telVraag(l, [7, 10, 9], 10, {
      bijGoed: ["Goed.", "We hebben een groep van {10}."],
      bijFout: (x) => [`{${x}}?`, x === 9 ? "Bijna, je zit er {1} naast." : "Dat is het niet helemaal."],
      opnieuw: { zin: ["Probeer het nog eens.", "Welk getal laten de witte stippen zien?"], lijst: [9, 10, 11] },
      uitleg: ["Het zijn {10} stippen.", "We hebben een groep van {10}."],
    });

    k.zet({ tienen: 2 });
    await l.wacht(400);
    await l.zeg("Hoeveel groepen van {10} hebben we *deze* keer?");
    await telVraag(l, [10, 2, 20], 2, {
      bijGoed: ["Ja.", "De groepen zijn even groot.", "In elke groep zitten {10} stippen."],
      uitleg: ["Kijk, ik zie {2} groepen.", "Ze zijn even groot.", "In elke groep zitten {10} stippen."],
    });
    await l.zeg("{2} groepen van {10}.", "Hoeveel stippen zijn het samen?");
    await telVraag(l, [20, 10, 2], 20, {
      bijGoed: ["Heel goed.", "{2} groepen van {10} is {20}."],
      uitleg: ["{10} en nog {10} is {20}.", "Het zijn {20} stippen."],
    });

    k.zet({ tienen: 3 });
    await l.wacht(400);
    await l.zeg("Ik heb er nog een groep bij gedaan.", "Hoeveel stippen zijn het nu?");
    await telVraag(l, [20, 29, 30], 30, {
      bijGoed: ["Ja, {30} stippen."],
      uitleg: ["{10}, {20}, {30}.", "Het zijn {30} stippen."],
    });

    await l.zeg("Nu doe ik er een beetje bij.");
    k.zet({ los: 8, omlijnLos: true });
    await l.wacht(500);
    await l.zeg("Deze groep is wat kleiner dan de andere.", "Hoeveel stippen zitten erin?");
    await telVraag(l, [8, 5, 7], 8, {
      bijGoed: ["Ja, {8}."],
      uitleg: ["Tel maar mee: {2}, {4}, {6}, {8}.", "Er zitten {8} stippen in."],
    });
    k.zet({ omlijnLos: false });
    await l.zeg("We hebben dus {3} tientallen.", "En {8} eenheden.", "Hoeveel is dat samen?");
    await telVraag(l, [37, 38, 48, 83], 38, {
      bijGoed: ["Ja!", "Je kunt al flink grote getallen tellen."],
      uitleg: ["{3} tientallen is {30}.", "En {8} erbij is {38}."],
    });
    await l.zeg("Nu gaan we met deze stippen rekenen.");
    await l.verder();

    /* 2. Aanvullen tot het volgende tiental, met stippen. */
    const rondes: { a: number; doel: number; lijst: number[]; goed: string }[] = [
      { a: 17, doel: 20, lijst: [17, 7, 16], goed: "Helemaal goed." },
      { a: 24, doel: 30, lijst: [4, 24, 23], goed: "Precies." },
      { a: 32, doel: 40, lijst: [31, 32, 2], goed: "Goed." },
    ];
    for (const [i, r] of rondes.entries()) {
      k.zet({ tienen: Math.floor(r.a / 10), los: r.a % 10, bij: [], palet: false, som: null });
      await l.wacht(400);
      await l.zeg(i === 0 ? "We beginnen met deze." : "Oké.", "Hoeveel stippen staan er nu?");
      await telVraag(l, r.lijst, r.a, {
        bijGoed: [i === 0 ? "Goed." : i === 1 ? "Ja." : "Precies.", `{${r.a}} stippen.`],
        uitleg: [groepenZin(r.a), `Dat is {${r.a}}.`],
      });
      await aanvullenMetStippen(l, k, r.a, r.doel, i === 0);
      await l.zeg(r.goed, `{${r.a}} plus {${r.doel - r.a}} is {${r.doel}}.`);
      await l.wacht(900);
    }

    /* 3. Zonder stippen (het kind kiest zelf). */
    await l.zeg(l.naam ? `Dit gaat je goed af, ${l.naam}.` : "Dit gaat je goed af.", "Zullen we er een paar *zonder* stippen doen?");
    const zonder = await l.kies(["Ja", "Nee"]);
    if (zonder === "Ja") {
      await l.zeg("Mooi.", "Ik zet het voor je klaar.");
      await aanvullenZonderStippen(l, k, 23, 30, "Goed.");
      await aanvullenZonderStippen(l, k, 36, 40, "Klopt.");
      await l.zeg("Oké, nog één.");
      await aanvullenZonderStippen(l, k, 41, 50, "Goed zo.");
      await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Dit waren moeilijke vragen.", "En je hebt ze allemaal gedaan.");
    } else {
      await l.zeg(zonder === null ? "Geen zorgen." : "Prima.", "Dan doen we er nog één met stippen.");
      await aanvullenMetStippen(l, k, 26, 30, false);
      await l.zeg("Goed.", "{26} plus {4} is {30}.");
      await l.wacht(800);
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 7. Tientallen tot 100 (groep 3-deel van Make 100) ---------- */

const tientallenTot100: Lesdraaiboek = {
  id: "optellen-100-tientallen-tot-100",
  titel: "Tientallen tot 100",
  synthesis: "Add up to 100 · Make 100 (groep 3-deel)",
  kaarttekening: KaartHonderd,

  async speel(l) {
    const m = maakMachine(l, { tienen: 0, enen: 0, knop: 10, wijs: true });
    l.som(getal(0));
    await l.zeg(l.naam ? `Oké, ${l.naam}.` : "Oké.", "Tik op de plusknop met de {10}.");
    await m.tik(1);
    l.som(getal(10));
    await l.zeg("Mooi.", "Deze knop doet er een groepje van {10} stippen bij.");
    await l.verder();

    /* Eerst voorspellen; dat wordt niet nagekeken, het kind ziet het straks zelf. */
    await l.zeg("Hoe vaak moet je nog drukken voor {100} stippen?");
    const v = await kiesGetal(l, [8, 9, 10, 90]);
    if (v === 9) await l.zeg("Dat denk ik ook.", "Kijk maar mee.");
    else if (v === 10) await l.zeg("Bijna.", "{10} groepjes van {10} is samen {100}.", "Maar er zit er al één in.", "Kijk hoeveel er nog bij moeten.");
    else if (v === 90) await l.zeg("Er moeten nog {90} stippen bij, dat klopt.", "Maar elke keer komen er {10} bij.", "Kijk hoe vaak je moet drukken.");
    else if (v === 8) await l.zeg("Kijk hoeveel er nog bij moeten.");
    else await l.zeg("Geen zorgen.", "We proberen het gewoon.");

    m.zet({ wijs: true });
    await l.zeg("Doe er groepjes van {10} bij.", "Tot we bij {100} zijn.");
    await m.tik(9, (st) => l.som(plusZonderUitkomst(10, (st.tienen - 1) * 10)));
    await l.wacht(600);

    /* Bij 100 worden de groepjes samen één grote oranje klodder. */
    m.zet({ honderd: true });
    l.som(plusSom(10, 90, 100));
    await l.zeg("Kijk!", "Alle groepjes samen zijn één grote groep van {100}.", "{10} plus {90} is {100}.");
    await l.verder();
    await l.zeg("Je drukte nog {9} keer.", "{9} groepjes van {10} is {90}.", v === 9 ? "Dat had je goed gedacht!" : "");
    await l.verder();

    /* Even terugblikken. */
    await l.zeg("Weet je het nog?", "Hoeveel groepjes van {10} zitten er in {100}?");
    const t = await kiesGetal(l, [9, 10, 100]);
    if (t === 10) await l.zeg("Ja!", "{10} groepjes van {10} is {100}.");
    else {
      await l.zeg(t === null ? "Geen zorgen." : "Kijk nog eens.", "Eén groepje had je al.", "Daarna kwamen er nog {9} bij.", "Samen zijn dat {10} groepjes van {10}.");
      await l.verder();
    }

    l.som(null);
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Echt knap gedaan, ${l.naam}.` : "Echt knap gedaan.", "Je kunt met tientallen tot {100} tellen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 8. Over het tiental (groep 3-deel van Crossing 10s) ---------- */

/** Zelf in twee stappen: eerst aanvullen tot het tiental, dan de rest erbij. */
async function zelfInTweeStappen(l: Lesgids, k: Kaders, a: number, b: number, totaalKeuzes: number[], eerste: boolean) {
  const doel = Math.ceil(a / 10) * 10;
  const p = doel - a;
  const q = b - p;
  k.zet({ modus: "stippen", tienen: Math.floor(a / 10), los: a % 10, bij: [], kaders: true, palet: true, paletSlot: [], wijsKader: false, pijlLos: false, som: somBij(a, [null]) });
  await l.wacht(400);
  await l.zeg(eerste ? `Reken {${a}} plus {${b}} uit in {2} stappen.` : `Nu {${a}} plus {${b}}.`, `Ga eerst precies naar {${doel}}.`);
  await vulAan(l, k, {
    vaste: [],
    nodig: p,
    vinkje: true,
    uitlegVinkje: eerste,
    som: (g, klaar) => (g === null ? somBij(a, [null]) : klaar ? somBij(a, [g], a + g) : somBij(a, [g])),
    fout: (g) => [`{${a}} plus {${g}} is {${a + g}}.`, g < p ? "Kijk, er zijn nog lege plekjes." : "Kijk, er gaan stippen over de groep heen.", `We willen eerst precies naar {${doel}}.`],
    hint: ["Tel de lege plekjes in de groep.", legePlekjes(p), `Tik op de {${p}}.`],
  });
  await l.zeg(`Goed, je maakte {${doel}} met die {${p}}.`, `Maar de rest van de {${b}} moet er nog bij.`);
  await vulAan(l, k, {
    vaste: [p],
    nodig: q,
    vinkje: true,
    som: (g, klaar) => (g === null ? somBij(a, [p, null]) : klaar ? somBij(a, [p, g], doel + g) : somBij(a, [p, g])),
    fout: (g) => [`Dan doe je er samen {${p + g}} bij.`, `We moesten er {${b}} bij doen.`],
    hint: [`{${p}} en {${q}} is samen {${b}}.`, `Tik op de {${q}}.`],
  });
  k.zet({ som: somBij(a, [p, q]) });

  /* Welke som laat zien wat je deed? */
  await l.zeg("Ja, je hebt de stukjes goed erbij gedaan.", "Welke som laat zien wat je deed?");
  const goed = `${a} + ${p} + ${q}`;
  const lijst = schud([goed, `${a} + ${p} + ${b}`, `${a} + ${q} + ${p}`]);
  let keuze = await l.kies(lijst);
  if (keuze !== goed) {
    /* De stappen nog eens afspelen; de som bouwt zich weer op. */
    const eersteKeuze = keuze;
    k.zet({ bij: [], som: somBij(a, [null]) });
    await l.zeg(keuze === null ? "Geen zorgen." : "Kijk wat je deed.", `Eerst deed je er {${p}} bij.`);
    k.zet({ bij: [p], som: somBij(a, [p]) });
    await l.wacht(700);
    await l.zeg(`Toen was je bij {${doel}}.`, `Daarna deed je er nog {${q}} bij.`);
    k.zet({ bij: [p, q], som: somBij(a, [p, q]) });
    await l.wacht(700);
    if (eersteKeuze !== null) {
      await l.zeg("Probeer het nog eens.");
      keuze = await l.kies(lijst.filter((x) => x !== eersteKeuze));
    }
    if (keuze !== goed) {
      await l.zeg(`Het is {${a}} plus {${p}} plus {${q}}.`);
      await l.verder();
    }
  }
  await l.zeg(keuze === goed ? "Precies goed." : "", `Je splitste de {${b}} in {${p}} en {${q}}.`);

  /* En het totaal. */
  await l.zeg("Kijk naar de stippen.", `Hoeveel is {${a}} plus {${b}}?`);
  const t = await kiesGetal(l, totaalKeuzes);
  k.zet({ som: somBij(a, [b], a + b) });
  if (t === a + b) await l.zeg("Precies goed.", `{${a}} plus {${b}} is {${a + b}}.`);
  else {
    await l.zeg(t === null ? "Geen zorgen." : "", `Eerst naar {${doel}}.`, `Dan nog {${q}} erbij: {${a + b}}.`);
    await l.verder();
  }
  await l.wacht(800);
}

const overHetTiental: Lesdraaiboek = {
  id: "optellen-100-over-het-tiental",
  titel: "Over het tiental",
  synthesis: "Add up to 100 · Crossing 10s (groep 3-deel)",
  kaarttekening: KaartOverTiental,

  async speel(l) {
    const k = maakKaders(l, { modus: "som", som: [wit(17), PLUS, kleurGetal(5), IS, { t: "teken", s: "?" }] });
    await l.zeg("Dit is een best lastige plussom.", "Kun je zulke sommen snel uitrekenen?");
    const snel = await l.kies(["Ja", "Nee"]);
    if (snel === "Ja") await l.zeg("Mooi.", "Ik heb een paar trucjes.", "Daarmee gaat het nog sneller.");
    else await l.zeg("Ja, zulke sommen zijn lastig.", "Maar ik heb een paar trucjes.", "Daarmee reken je ze zo uit.");

    /* 1. Tellen: een groep van 10 en 7 losse, met de valkuil 71 (cijfers omgedraaid). */
    k.zet({ modus: "stippen", tienen: 1, los: 7, som: null });
    await l.wacht(400);
    await l.zeg("Ik heb een groep van {10} en {7} klaargezet.", "Welk getal maken ze?");
    const x = await kiesGetal(l, [7, 17, 27, 71]);
    if (x === 17) await l.zeg("Precies goed.");
    else {
      if (x === 71) await l.zeg("{71}?", "Je hebt de cijfers omgedraaid.", "Eerst de groep van {10}, dan de losse stippen.");
      else if (x === 27) await l.zeg("{27}?", "Er is maar één groep van {10}.");
      else if (x === 7) await l.zeg("Ja, er zijn {7} losse stippen.", "Maar er is ook nog een groep van {10}.");
      else await l.zeg("Geen zorgen.");
      await l.verder();
      await l.zeg("Kijk naar de stippen.", "Een groep van {10}, plus {7} extra.", "Welk getal is het?");
      const y = await kiesGetal(l, schud([7, 17, 27, 71]));
      if (y === 17) await l.zeg("Precies goed.");
      else {
        await l.zeg("{10} en nog {7} is {17}.", "Het getal is {17}.");
        await l.verder();
      }
    }
    await l.zeg("Ik zet er randen omheen.", "Dan zie je de groepen beter.");
    k.zet({ kaders: true });
    await l.wacht(600);
    await l.zeg("Ja, zo is het beter.", "Is een rand vol?", "Dan heb je een groep van {10}.");
    await l.verder();

    /* 2. 17 + 5 met de stippen: de 5 valt over twee groepen. */
    await l.zeg("Nu gaan we er iets bij doen.", "Ik geef je een som.");
    k.zet({ som: somBij(17, [null]), palet: true, paletSlot: NEGEN.filter((n) => n !== 5) });
    await l.zeg("{17} plus {5}.", "Kun je {5} stippen bij de {17} doen?", "Tik op de groene stippen bovenaan.");
    await kiesGroepje(l, k, { vaste: [], vinkje: false, hulp: false, som: (g) => somBij(17, [g]) });
    await l.wacht(600);
    await l.zeg("Oké, nu heb je {2} groepen van {10}.", "En nog een beetje extra.", "Hoeveel is het samen?");
    let tot = await kiesGetal(l, [12, 20, 22]);
    if (tot !== 22 && tot !== null) {
      await l.zeg(`Hoeveel is {17} plus {5}?`);
      tot = await kiesGetal(l, [12, 20, 22]);
    }
    k.zet({ som: somBij(17, [5], 22) });
    if (tot === 22) await l.zeg("Goed.", "{17} plus {5} is {22}.", "Met de stippen zie je het makkelijk, hè?");
    else await l.zeg(tot === null ? "Geen zorgen." : "", "{2} volle groepen is {20}.", "En nog {2} erbij is {22}.");
    await l.verder();

    await l.zeg("Er is iets bijzonders aan wat je deed.", "De {5} stippen zitten in {2} groepen.", "Zie je dat?");
    const zie = await l.kies(["Ja", "Nee"]);
    k.zet({ pijlLos: true });
    await l.zeg(zie === "Ja" ? "Mooi." : "Kijk maar.", "We begonnen in de ene groep van {10}.", "En we eindigden in een nieuwe groep.");
    await l.zeg("We gaan over het tiental.");
    await l.verder();
    await l.zeg("We kunnen ook zeggen: je hebt de {5} gesplitst.", "Weet je nog wat splitsen betekent?");
    const sp = await l.kies(schud(["In stukjes breken", "Groter maken"]));
    if (sp === "In stukjes breken") await l.zeg("Precies.", "Als we iets splitsen, breken we het in kleinere stukjes.");
    else {
      await l.zeg(sp === null ? "Geen zorgen." : "Niet helemaal.", "Splitsen is iets in stukjes breken.");
      await l.verder();
    }
    await l.zeg("Kijk naar de groene stippen.", "In welke {2} stukjes heb je de {5} gesplitst?");
    const stukjes = await l.kies(schud(["7 en 3", "3 en 2"]));
    if (stukjes === "3 en 2") await l.zeg("Precies.", "Je splitste de {5} in {3} en {2}.");
    else {
      await l.zeg(stukjes === null ? "Geen zorgen." : "Kijk nog eens.", "{3} stippen gingen in de groep.", "En {2} stippen kwamen erbuiten.", "Dus {3} en {2}.");
      await l.verder();
    }
    k.zet({ pijlLos: false });
    await l.wacht(400);

    /* 3. Nog eens 17 + 5, nu in twee stappen. */
    await l.zeg(l.naam ? `Je doet het echt heel goed, ${l.naam}.` : "Je doet het echt heel goed.", "Nu kijken we hoe splitsen helpt bij lastige sommen.");
    await l.verder();
    k.zet({ bij: [], som: somBij(17, [null]), paletSlot: [] });
    await l.zeg("We doen {17} plus {5} nog eens.", "Maar nu niet in één keer.", "We doen het in {2} makkelijke stappen.");
    await l.verder();
    k.zet({ wijsKader: true });
    await l.zeg("Eerst maken we de groep vol, tot {20}.", "Daar ben je goed in.", "Tik op het groepje waarmee deze groep vol is.");
    await vulAan(l, k, {
      vaste: [],
      nodig: 3,
      vinkje: false,
      som: (g, klaar) => (g === null ? somBij(17, [null]) : klaar ? somBij(17, [g], 17 + g) : somBij(17, [g])),
      fout: (g) => [`{17} plus {${g}} is {${17 + g}}.`, g < 3 ? "Kijk, er zijn nog lege plekjes." : "Kijk, er gaan stippen over de groep heen.", "We willen eerst precies naar {20}."],
      hint: ["Tel de lege plekjes in de groep.", legePlekjes(3), "Tik op de {3}."],
    });
    k.zet({ wijsKader: false });
    await l.zeg("Goed, de groep is vol.", "Maar er moeten {5} bij, niet {3}.", "Hoeveel moeten er nog bij?", "Tik op het goede groepje.");
    await vulAan(l, k, {
      vaste: [3],
      nodig: 2,
      vinkje: false,
      som: (g, klaar) => (g === null ? somBij(17, [3, null]) : klaar ? somBij(17, [3, g], 20 + g) : somBij(17, [3, g])),
      fout: (g) => [`Dan doe je er samen {${3 + g}} bij.`, "We moesten er {5} bij doen."],
      hint: ["{3} en {2} is samen {5}.", "Tik op de {2}."],
    });
    await l.zeg("Helemaal goed.", "Eerst maakte je de groep vol met {3}.", "Toen deed je er {2} bij.");
    await l.verder();
    k.zet({ som: somBij(17, [5]) });
    await l.zeg("En dat is hetzelfde als {5} erbij doen.", "Dus: hoeveel is {17} plus {5}?");
    const u = await kiesGetal(l, [12, 20, 22]);
    k.zet({ som: somBij(17, [5], 22) });
    if (u === 22) await l.zeg("Natuurlijk.", "{17} plus {5} is {22}.");
    else {
      await l.zeg(u === null ? "Geen zorgen." : "", "Eerst naar {20}, dan nog {2} erbij.", "{17} plus {5} is {22}.");
      await l.verder();
    }
    await l.wacht(700);

    /* 4. Zelf: 19 + 4 en 18 + 3. */
    await l.zeg("Je snapt het al.", "Nu mag je er zelf een paar doen.");
    await l.verder();
    await zelfInTweeStappen(l, k, 19, 4, [22, 13, 23], true);
    await zelfInTweeStappen(l, k, 18, 3, [20, 21, 11], false);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Je bent goed op dreef.", "Je kunt nu over het tiental heen rekenen.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_OPTELLEN_TOT_100: Lesdraaiboek[] = [
  /* Volgorde van Synthesis: Assessment, Add 10s, Make 100, Part Part Whole, Bridging, 10s Plus Ones, Crossing 10s, Mastery. */
  instaptoets,
  tientallenErbij,
  tientallenTot100,
  splitsen,
  aanvullenTotTiental,
  tientalPlusEenheden,
  overHetTiental,
  eindtoets,
];

