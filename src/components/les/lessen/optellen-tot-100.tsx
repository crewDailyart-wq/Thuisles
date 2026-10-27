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
import { Stippenkaders, kleurGetal, type KadersMelding, type KadersProps, type SomStuk } from "../vlakken/optellen100-kaders";
import { HoloSplitshuis, type HoloSplitsMelding, type HoloSplitsProps, type Splitsknop } from "../vlakken/tientallen-holo-splits";
import { HoloStaven, type StavenMelding, type StavenProps } from "../vlakken/tientallen-holo-staven";
import { SterMachine, type SterMachineMelding, type SterMachineProps } from "../vlakken/tientallen-holo-machine";
import { testHaak } from "../vlakken/tientallen-holo-basis";
import { getalvraag, kiesGetalHolo, nieuwLater, speelLater, type Later } from "./tientallen";
import { kiesGetal, plusSom, schud } from "./optellen-tot-20";

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

/* ---------- de oude tienenmachine (nog voor "Tientallen tot 100", ongewijzigd) ---------- */

type OudeMachine = {
  st: MachineProps;
  zet(p: Partial<MachineProps>): void;
  /** Wacht tot het kind `keer` keer op de knop tikt; elke tik komt er een groepje (of stip) bij. */
  tik(keer: number, bijTik?: (st: MachineProps) => void): Promise<void>;
};

function maakOudeMachine(l: Lesgids, begin: Partial<MachineProps>): OudeMachine {
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

/* ---------- de sterrenmachine (hologrammen) ---------- */

/** De stand van de machine zoals de draaiboeken hem gebruiken: lichtbollen en losse sterren. */
type MachineStand = {
  tienen: number;
  enen: number;
  /** Eén grote lichtbol van honderd (het beginbeeld van de toets). */
  honderd?: boolean;
  /** Welke plusknop er onderaan staat; `null` = geen knop. */
  knop?: 10 | 1 | null;
  actief?: boolean;
  slot?: boolean;
  /** Een warme ring om de knop. */
  wijs?: boolean;
};

type Machine = {
  st: MachineStand;
  zet(p: Partial<MachineStand>): void;
  /** Wacht tot het kind `keer` keer op de knop tikt; elke tik komt er een lichtbol (of ster) bij. */
  tik(keer: number, bijTik?: (st: MachineStand) => void): Promise<void>;
};

function machineProps(st: MachineStand): SterMachineProps {
  return {
    aantal: st.honderd ? 100 : st.tienen * 10 + st.enen,
    knoppen: st.knop ? [st.knop] : [],
    actief: !!st.actief,
    slot: !!st.slot,
    wijs: st.wijs && st.knop ? st.knop : null,
  };
}

function maakMachine(l: Lesgids, begin: Partial<MachineStand>): Machine {
  const st: MachineStand = { tienen: 0, enen: 0, knop: 10, actief: false, ...begin };
  l.vlak(SterMachine, machineProps(st));
  const zet = (p: Partial<MachineStand>) => {
    Object.assign(st, p);
    l.pasVlakAan<SterMachineProps>(machineProps(st));
  };
  return {
    st,
    zet,
    async tik(keer, bijTik) {
      testHaak({ doel: st.tienen * 10 + st.enen + keer * (st.knop ?? 10) });
      for (let i = 0; i < keer; i++) {
        zet({ actief: true });
        const g = await l.wachtOpVlak<SterMachineMelding>("plus");
        if (g.soort !== "plus") continue;
        if (g.waarde === 10) zet({ tienen: st.tienen + 1, wijs: false });
        else zet({ enen: st.enen + 1, wijs: false });
        bijTik?.(st);
      }
      zet({ actief: false });
      testHaak({ doel: undefined });
    },
  };
}

/**
 * Een keuzevraag terwijl de machine aan staat: het kind mag eerst lichtbollen
 * erbij tikken om te kijken, maar hoeft niet. Tijdens het kiezen zegt de les
 * niets, zodat de keuzeknoppen blijven staan.
 */
async function kiesMetMachine(l: Lesgids, m: Machine, lijst: number[], bijPlus: () => void): Promise<number | null> {
  let klaar = false;
  m.zet({ actief: true });
  void (async () => {
    while (!klaar) {
      await l.wachtOpVlak<SterMachineMelding>("plus");
      if (klaar) return;
      bijPlus();
    }
  })();
  const x = await kiesGetalHolo(l, lijst);
  klaar = true;
  m.zet({ actief: false });
  return x;
}

/**
 * Een somvraag in een les (geen toets): bij de eerste fout een hint, de tweede
 * keer (of bij "Weet ik niet") het antwoord met de reden, en met `later` komt
 * de som aan het eind terug.
 */
async function somVraag(
  l: Lesgids,
  a: number,
  b: number,
  o: {
    kies: (lijst?: number[]) => Promise<number | null>;
    lijst?: number[];
    hint?: (x: number) => string[];
    uitleg: string[];
    bijGoed?: string[];
    toonSom?: boolean;
    later?: Later;
    /** Zet het beeld klaar als de som later terugkomt. */
    klaarzetten?: () => void;
  },
): Promise<boolean> {
  const s = a + b;
  testHaak({ antwoord: s, vraagId: Math.random() });
  let lijst = o.lijst;
  for (let poging = 1; ; poging++) {
    const x = await o.kies(lijst);
    if (x === s) {
      if (o.toonSom !== false) l.som(plusSom(a, b, s));
      await l.zeg(...(o.bijGoed ?? ["Precies."]), `{${a}} plus {${b}} is {${s}}.`);
      return poging === 1;
    }
    if (x !== null && poging === 1) {
      if (lijst) lijst = lijst.filter((w) => w !== x);
      await l.zeg(...(o.hint?.(x) ?? ["Kijk nog eens goed.", `Hoeveel is {${a}} plus {${b}}?`]));
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen." : "Kijk maar.", ...o.uitleg, o.later ? "We komen hier later op terug." : "");
    if (o.toonSom !== false) l.som(plusSom(a, b, s));
    await l.verder();
    if (o.later) {
      const terug = { ...o, later: undefined };
      o.later.lijst.push(async () => {
        o.klaarzetten?.();
        l.som(plusSom(a, b));
        await l.zeg(`Hoeveel is {${a}} plus {${b}}?`);
        await somVraag(l, a, b, terug);
        await l.wacht(600);
        l.som(null);
      });
    }
    return false;
  }
}

/**
 * Een toetsvraag (LESSENPLAN.md O17/O20, ronde 3): geen uitleg. 1× fout: de
 * som als vraag terug ("30 plus 40 is 34?") en nog één kans. 2× fout: "Laten
 * we je wat helpen." Weet ik niet: "Geen probleem, we leren het samen." In
 * die twee gevallen stopt de toets en gaan we samen oefenen.
 */
async function toetsHolo(
  l: Lesgids,
  v: { opties: number[]; goed: number; bijGoed: string[]; bijFout: (x: number) => string[]; tempo: "alleenTraag" | "beide" },
): Promise<"goed" | "herkansing" | "stop"> {
  testHaak({ antwoord: v.goed, vraagId: Math.random() });
  const t0 = Date.now();
  const x = await kiesGetalHolo(l, v.opties);
  const duur = Date.now() - t0;
  if (x === v.goed) {
    const traag = duur > 12000;
    const tempo = traag ? ["Probeer de volgende iets sneller."] : v.tempo === "beide" && duur < 5000 ? ["Dat was razendsnel!"] : [];
    await l.zeg(...v.bijGoed, ...tempo);
    return "goed";
  }
  if (x === null) {
    await l.zeg("Geen probleem.", "We leren het samen.");
    return "stop";
  }
  await l.zeg(...v.bijFout(x));
  const y = await kiesGetal(l, v.opties.filter((w) => w !== x));
  if (y === v.goed) {
    await l.zeg(...v.bijGoed);
    return "herkansing";
  }
  await l.zeg(y === null ? "Geen probleem." : "Laten we je wat helpen.", "We leren het samen.");
  return "stop";
}

/** "Eén lichtbol en 8 losse sterren." / "4 lichtbollen van 10." */
function inLichtbollen(n: number): string {
  const t = Math.floor(n / 10);
  const e = n % 10;
  const bol = t === 1 ? "Eén lichtbol" : `{${t}} lichtbollen`;
  if (e === 0) return `${bol} van {10}.`;
  return `${bol} en {${e}} losse ${e === 1 ? "ster" : "sterren"}.`;
}

/** "30 plus 40 is 34?" — de som met het foute antwoord als vraag. */
const somAlsVraag = (a: number, b: number) => (x: number) => [`{${a}} plus {${b}} is {${x}}?`, "Kijk nog eens goed."];

/**
 * Na een toets: samen oefenen met de sterrenmachine (tientallen tellen, een
 * tiental erbij, een tiental en eenheden), tot er samen met de toets minstens
 * 15 opgaven zijn. Lesvragen: hint bij 1× fout, antwoord bij 2× fout of
 * "weet ik niet", en de vraag komt aan het eind terug.
 */
async function oefenNaToets(l: Lesgids, aantal: number) {
  const later = nieuwLater();
  const m = maakMachine(l, { knop: null });
  const vragen: { soort: "lees" | "som"; a: number; b?: number; lijst: number[] }[] = [
    { soort: "lees", a: 40, lijst: [4, 14, 40, 50] },
    { soort: "som", a: 20, b: 10, lijst: [3, 21, 30, 40] },
    { soort: "lees", a: 23, lijst: [5, 23, 32, 33] },
    { soort: "som", a: 30, b: 20, lijst: [5, 32, 40, 50] },
    { soort: "som", a: 30, b: 7, lijst: [10, 37, 47, 73] },
    { soort: "lees", a: 60, lijst: [6, 16, 60, 70] },
    { soort: "som", a: 13, b: 10, lijst: [14, 23, 33, 113] },
    { soort: "lees", a: 35, lijst: [8, 35, 45, 53] },
    { soort: "som", a: 20, b: 5, lijst: [7, 25, 52, 70] },
    { soort: "som", a: 10, b: 30, lijst: [4, 13, 40, 50] },
    { soort: "lees", a: 47, lijst: [11, 47, 57, 74] },
    { soort: "som", a: 24, b: 20, lijst: [26, 34, 44, 64] },
    { soort: "som", a: 40, b: 10, lijst: [5, 41, 50, 60] },
    { soort: "lees", a: 18, lijst: [9, 18, 28, 81] },
  ];
  await l.zeg("Nu gaan we samen oefenen.", "Kijk goed naar de lichtbollen en de sterren.");
  for (const v of vragen.slice(0, aantal)) {
    m.zet({ tienen: Math.floor(v.a / 10), enen: v.a % 10, knop: null });
    if (v.soort === "lees") {
      const t = Math.floor(v.a / 10);
      const e = v.a % 10;
      await getalvraag(
        l,
        {
          vraag: ["Welk getal is dit?"],
          lijst: v.lijst,
          goed: v.a,
          bijGoed: ["Ja.", `{${v.a}}.`],
          hint: (x) =>
            x === t || x === t + e
              ? ["Elke lichtbol heeft {10} sterren.", "Tel de lichtbollen met tientallen."]
              : x === omgedraaid(v.a)
                ? ["Kijk goed.", "Eerst de lichtbollen, dan de losse sterren."]
                : ["Tel eerst de lichtbollen: {10}, {20}, …", "Dan de losse sterren erbij."],
          antwoord: [inLichtbollen(v.a), `Dat is {${v.a}}.`],
          klaarzetten: () => m.zet({ tienen: t, enen: e, knop: null }),
        },
        later,
      );
    } else {
      const b = v.b ?? 0;
      l.som(plusSom(v.a, b));
      const goed = await somVraag(l, v.a, b, {
        kies: (lijst) => kiesGetalHolo(l, lijst ?? v.lijst),
        lijst: v.lijst,
        hint: (x) =>
          x === v.a + b / 10 || x === v.a + 1
            ? ["Kijk goed.", b >= 10 ? "Er komen hele lichtbollen van {10} bij." : "Er komen losse sterren bij."]
            : ["Probeer het nog eens.", b >= 10 ? "Tel de lichtbollen erbij met tientallen." : "De tientallen blijven gelijk."],
        uitleg: b >= 10 ? [`Bij {${v.a}} komen er {${b / 10}} lichtbollen van {10}.`, `Dan heb je {${v.a + b}}.`] : [`De tientallen van {${v.a}} blijven gelijk.`, `Er komen {${b}} sterren bij: {${v.a + b}}.`],
        bijGoed: ["Goed."],
        later,
        klaarzetten: () => m.zet({ tienen: Math.floor(v.a / 10), enen: v.a % 10, knop: null }),
      });
      m.zet({ tienen: Math.floor((v.a + b) / 10), enen: (v.a + b) % 10 });
      if (goed) await l.wacht(400);
      await l.wacht(700);
      l.som(null);
    }
  }
  await speelLater(l, later);
  l.som(null);
}

/* ---------- het splitshuis (hologrammen) ---------- */

type Schema = {
  st: HoloSplitsProps;
  zet(p: Partial<HoloSplitsProps>): void;
};

function maakSchema(l: Lesgids, begin: Partial<HoloSplitsProps>): Schema {
  const st: HoloSplitsProps = { links: 0, rechts: 0, geheel: null, knoppen: false, alleen: null, vraag: null, klaar: false, hulp: false, lijst: [], tegel: null, snoer: null, ...begin };
  l.vlak(HoloSplitshuis, { ...st });
  return {
    st,
    zet(p) {
      Object.assign(st, p);
      l.pasVlakAan<HoloSplitsProps>(p);
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
  testHaak({ splitsDoel: { alleen, links: null, rechts: null } });
  sch.zet({ knoppen: true, alleen });
  while (!klopt()) {
    const g = await l.wachtOpVlak<HoloSplitsMelding>("knop");
    if (g.soort === "knop") drukKnop(sch, g.knop, max);
  }
  sch.zet({ knoppen: false, alleen: null });
  testHaak({ splitsDoel: null });
}

/**
 * Het kind zoekt zelf twee delen die samen `totaal` maken en tikt op het
 * vinkje. Een splitsing die al gevonden is, telt niet nog eens. 1× fout:
 * Bliepo rekent het voor ("3 en 3 is 6, we zoeken 7") en maakt de bellen leeg.
 * 2× fout of het vraagteken: Bliepo zet een splitsing neer, en (met `later`)
 * komt de opdracht aan het eind terug.
 */
async function zoekSplitsing(l: Lesgids, sch: Schema, totaal: number, gevonden: [number, number][], legeStart = true, later?: Later): Promise<[number, number]> {
  if (legeStart) sch.zet({ links: 0, rechts: 0 });
  const al = (a: number, b: number) => gevonden.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
  const nogNiet = () => Array.from({ length: totaal - 1 }, (_, i) => [totaal - 1 - i, i + 1] as [number, number]).find(([x, y]) => !al(x, y)) ?? [totaal - 1, 1];
  testHaak({ splitsDoel: { totaal, voorbeeld: nogNiet() } });
  if (!aangewezenHulp.has(l)) {
    aangewezenHulp.add(l);
    sch.zet({ knoppen: false, klaar: true, hulp: true });
    await l.wijsAan("klaar", "Ben je klaar? Tik dan op het vinkje.");
    await l.wijsAan("hulpvlak", "Weet je het niet? Tik dan op het vraagteken.");
  }
  sch.zet({ knoppen: true, klaar: true, hulp: true });
  for (let fout = 0; ; ) {
    const g = await l.wachtOpVlak<HoloSplitsMelding>(["knop", "klaar", "hulp"]);
    if (g.soort === "knop") {
      drukKnop(sch, g.knop, totaal);
      continue;
    }
    const { links: a, rechts: b } = sch.st;
    sch.zet({ knoppen: false, klaar: false, hulp: false });
    if (g.soort === "klaar" && a + b === totaal && a > 0 && b > 0 && !al(a, b)) {
      sch.zet({ golf: Date.now() });
      testHaak({ splitsDoel: null });
      return [a, b];
    }
    if (g.soort === "klaar") {
      fout++;
      if (a === 0 || b === 0) {
        await l.zeg("Doe in allebei de bellen iets.");
      } else if (a + b !== totaal) {
        await l.zeg("Laten we kijken.", `Je hebt {${a}} en {${b}}.`, `Dat is samen {${a + b}}.`, `We zoeken {${totaal}}.`);
        sch.zet({ links: 0, rechts: 0 });
      } else {
        await l.zeg(`Je hebt {${a}} en {${b}}.`, "Die hadden we al.", "Zoek een andere manier.");
      }
    }
    if (g.soort === "hulp" || fout >= 2) {
      /* Bliepo zet een splitsing neer die nog niet gevonden is. */
      const [p, q] = nogNiet();
      sch.zet({ links: p, rechts: q });
      await l.zeg(g.soort === "hulp" ? "Geen zorgen." : "Ik help je.", `Kijk: {${p}} en {${q}} is samen {${totaal}}.`, later ? "We komen hier later op terug." : "");
      await l.verder();
      testHaak({ splitsDoel: null });
      if (later)
        later.lijst.push(async () => {
          sch.zet({ geheel: totaal, links: 0, rechts: 0, lijst: [] });
          await l.zeg(`Zoek nog eens twee delen die samen {${totaal}} maken.`);
          const [x, y] = await zoekSplitsing(l, sch, totaal, []);
          await l.zeg("Goed zo.", `{${x}} en {${y}} is samen {${totaal}}.`);
        });
      return [p, q];
    }
    sch.zet({ knoppen: true, klaar: true, hulp: true });
  }
}

/** Welke lessen het vinkje en het vraagteken in het splitshuis al hebben aangewezen. */
const aangewezenHulp = new WeakSet<Lesgids>();

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

/*
  Volgt LESSENPLAN.md O17 en Synthesis "Add up to 100 · Assessment": drie
  keer op de 10-knop (drie lichtbollen) → welk getal, 30 + 50, 30 + 40
  (bedenktijd telt mee), en de vragen die hier al stonden (40 + 7, de 7
  splitsen). Toetsregels: geen uitleg; 1× fout = de som als vraag terug;
  2× fout of "weet ik niet" = "we leren het samen" en de toets stopt. Daarna
  samen oefenen tot er minstens 15 opgaven zijn. Eigen Bliepo: we zeggen het
  eerlijk als het om de tijd ging.
*/
const instaptoets: Lesdraaiboek = {
  id: "optellen-100-instaptoets",
  titel: "Instaptoets: optellen tot 100",
  synthesis: "Add up to 100 · Assessment",
  kaarttekening: KaartKlodders,

  async speel(l) {
    let goed = 0;
    let traag = 0;
    let gedaan = 0;
    let stop = false;
    const tel = async (vraag: () => Promise<"goed" | "herkansing" | "stop">, t0 = Date.now()) => {
      if (stop) return;
      const r = await vraag();
      gedaan++;
      if (r === "goed") {
        goed++;
        if (Date.now() - t0 > 12000) traag++;
      }
      if (r === "stop") stop = true;
    };

    const m = maakMachine(l, { honderd: true, knop: null });
    await l.zeg("Nu gaan we plussommen maken tot {100}.", "Ken je dit al?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "In deze toets laat je zien wat je al kunt.", "Probeer vlot te antwoorden.");
    m.zet({ honderd: false, knop: 10, wijs: true });
    await l.zeg("Tik {3} keer op de knop.", "Dan komen er lichtbollen van {10}.");
    await m.tik(3);

    /* Drie lichtbollen van 10. */
    await l.zeg("Je hebt {3} lichtbollen van {10}.", "Welk getal is dat?");
    await tel(() => toetsHolo(l, { opties: [3, 30, 40, 300], goed: 30, bijGoed: ["Goed, {30} sterren.", "{3} lichtbollen van {10}."], bijFout: (x) => [`{${x}}?`, "Kijk nog eens goed."], tempo: "alleenTraag" }));

    /* 30 + 50. */
    if (!stop) {
      l.som(plusSom(30, 50));
      await l.zeg("Wat krijg je als je er {50} bij doet?", "Hoeveel is {30} plus {50}?");
      await tel(() => toetsHolo(l, { opties: [35, 70, 80, 90], goed: 80, bijGoed: ["Ja, samen {80}."], bijFout: somAlsVraag(30, 50), tempo: "alleenTraag" }));
      if (!stop) {
        m.zet({ tienen: 8 });
        l.som(plusSom(30, 50, 80));
        await l.wacht(900);
      }
      l.som(null);
    }

    /* 30 + 40, in woorden. */
    if (!stop) {
      m.zet({ tienen: 3 });
      await l.zeg("Probeer deze eens.", "Als je {30} en {40} optelt, hoeveel is het dan samen?");
      await tel(() => toetsHolo(l, { opties: [34, 60, 70, 80], goed: 70, bijGoed: ["Goed, {70}.", "Je doet het echt heel goed."], bijFout: somAlsVraag(30, 40), tempo: "alleenTraag" }));
      if (!stop) {
        m.zet({ tienen: 7 });
        await l.wacht(700);
      }
    }

    /* Een tiental plus eenheden. */
    if (!stop) {
      m.zet({ tienen: 4, enen: 7, knop: null });
      l.som(plusSom(40, 7));
      await l.zeg("Kijk, nu zijn er ook losse sterren.", "Hoeveel is {40} plus {7}?");
      await tel(() => toetsHolo(l, { opties: [37, 47, 57, 74], goed: 47, bijGoed: ["Precies, {47}."], bijFout: somAlsVraag(40, 7), tempo: "alleenTraag" }));
      l.som(null);
    }

    /* Splitsen. */
    if (!stop) {
      const sch = maakSchema(l, { geheel: 7, links: 5, rechts: 0, vraag: "rechts", sterren: true });
      await l.zeg("Nu splitsen we de {7}.", "Eén deel is {5}.", "Hoeveel is het andere deel?");
      await tel(() =>
        toetsHolo(l, { opties: [1, 2, 3, 12], goed: 2, bijGoed: ["Ja, {5} en {2} is samen {7}."], bijFout: (x) => [`{5} en {${x}} is samen {${5 + x}}?`, "Kijk nog eens goed."], tempo: "alleenTraag" }),
      );
      if (!stop) {
        sch.zet({ rechts: 2, vraag: null });
        await l.wacht(700);
      }
    }

    /* De uitslag, eerlijk (ook als het om de tijd ging). */
    if (!stop && goed === 5 && traag === 0) await l.zeg("Je doet het echt heel goed.", "Je kunt al plussommen tot {100} maken.");
    else if (!stop && goed >= 4 && traag > 0) await l.zeg("Je weet het allemaal.", "Alleen ging het nog niet zo vlot.", "Laten we je wat helpen.");
    else if (!stop) await l.zeg("Goed gedaan.", "In de lessen oefenen we dit nog meer.");
    await l.verder();

    /* Samen oefenen, zodat het samen minstens 15 opgaven zijn. */
    await oefenNaToets(l, Math.max(10, 15 - gedaan));

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Dank je wel.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 2. Tientallen erbij ---------- */

/*
  Volgt LESSENPLAN.md O18 en Synthesis "Add up to 100 · Add 10s": eerst raden,
  dan zelf met de sterrenmachine controleren; lichtbollen van 10 en losse
  sterren. Eigen Bliepo: het groep 3-deel tot 50 (13 + 10, 17 + 20; het
  oefenen ook tot 50). "Drie goed en we gaan verder", de laatste op slot (uit
  het hoofd). 15 opgaven of meer.
*/
const tientallenErbij: Lesdraaiboek = {
  id: "optellen-100-tientallen-erbij",
  titel: "Tientallen erbij",
  synthesis: "Add up to 100 · Add 10s",
  kaarttekening: KaartKlodders,

  async speel(l) {
    const later = nieuwLater();
    const m = maakMachine(l, { tienen: 2, enen: 0, knop: 10 });

    /* Twee lichtbollen van 10. */
    testHaak({ antwoord: 20, vraagId: Math.random() });
    await l.zeg("Kijk naar de lichtbollen.", "Welk getal maken ze samen?");
    const x = await kiesGetalHolo(l, [2, 10, 20, 30]);
    if (x === 20) {
      await l.zeg("Goed zo.", "{2} lichtbollen van {10} is {20}.");
    } else {
      if (x === 2) await l.zeg("Je hebt gelijk dat het {2} lichtbollen zijn.", "Maar elke lichtbol heeft {10} sterren.");
      else await l.zeg(x === null ? "Geen zorgen." : "Kijk nog eens goed.", "In elke lichtbol zitten {10} sterren.");
      await getalvraag(
        l,
        {
          vraag: ["{2} lichtbollen van {10}.", "Hoeveel sterren zijn het samen?"],
          lijst: [2, 10, 20, 30],
          goed: 20,
          bijGoed: ["Goed.", "{2} lichtbollen van {10} is {20}."],
          hint: () => ["{10} sterren en nog {10} sterren."],
          antwoord: ["{10} sterren en nog {10} sterren.", "Samen zijn dat {20} sterren."],
          klaarzetten: () => m.zet({ tienen: 2, enen: 0, knop: null }),
        },
        later,
      );
    }
    l.som(getal(20));

    /* Zelf een lichtbol erbij. */
    m.zet({ wijs: true, knop: 10 });
    await l.zeg("Doe er nog een lichtbol van {10} bij.", "Zie je de knop onderaan?", "Tik erop.");
    await m.tik(1);
    l.som(plusZonderUitkomst(20, 10));
    await l.zeg("Goed zo.", "{20} plus {10}.", "Hoeveel sterren zijn het nu samen?");
    await somVraag(l, 20, 10, {
      kies: (lijst) => kiesGetalHolo(l, lijst ?? [3, 20, 30, 40]),
      lijst: [3, 20, 30, 40],
      hint: (v) => (v === 3 ? ["Ja, het zijn {3} lichtbollen.", "Hoeveel sterren zijn dat?"] : ["Tel de lichtbollen met tientallen.", "{10}, {20}, …"]),
      uitleg: ["{10}, {20}, {30}.", "Het zijn {30} sterren."],
      later,
      klaarzetten: () => m.zet({ tienen: 3, enen: 0, knop: null }),
    });
    await l.wacht(800);

    /* 30 + 20 en 50 + 30; de machine mag helpen. */
    m.zet({ tienen: 3, enen: 0, knop: 10 });
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
      kies: (lijst) => kiesMetMachine(l, m, lijst ?? [5, 40, 50, 60], tikErbij(30)),
      lijst: [5, 40, 50, 60],
      hint: (v) => (v === 5 ? ["Dat zijn de lichtbollen samen.", "Maar elke lichtbol is {10}."] : ["Doe er {2} lichtbollen van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {30} komen {2} lichtbollen van {10}.", "{40}, {50}."],
      bijGoed: ["Klopt."],
      later,
      klaarzetten: () => m.zet({ tienen: 3, enen: 0, knop: null }),
    });
    m.zet({ tienen: 5 });
    await l.wacht(800);

    m.zet({ tienen: 5, enen: 0, knop: 10 });
    l.som(getal(50));
    erbij = 0;
    await l.zeg("Je doet het goed.", "Probeer deze eens: {50} plus {30}.");
    await somVraag(l, 50, 30, {
      kies: (lijst) => kiesMetMachine(l, m, lijst ?? [8, 70, 80, 90], tikErbij(50)),
      lijst: [8, 70, 80, 90],
      hint: (v) => (v === 8 ? ["Dat zijn de lichtbollen samen.", "Maar elke lichtbol is {10}."] : ["Doe er {3} lichtbollen van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {50} komen {3} lichtbollen van {10}.", "{60}, {70}, {80}."],
      bijGoed: ["Ja."],
      later,
      klaarzetten: () => m.zet({ tienen: 5, enen: 0, knop: null }),
    });
    m.zet({ tienen: 8 });
    await l.wacht(800);

    /* Nu losse sterren erbij: eerst voorspellen, dan zelf doen. */
    l.som(getal(10));
    m.zet({ tienen: 1, enen: 0, knop: 1 });
    await l.zeg("Nu heb je één lichtbol van {10}.", "We proberen iets anders.", "Je doet er {3} sterren bij.", "Hoeveel is het dan?");
    testHaak({ antwoord: 13, vraagId: Math.random() });
    const v13 = await kiesGetalHolo(l, [4, 10, 13, 23]);
    await l.zeg(v13 === 13 ? "Goed bedacht." : v13 === null ? "Geen zorgen." : "Kijk maar mee.", "Doe ze er zelf maar bij.", "Tik {3} keer op de knop.");
    m.zet({ wijs: true });
    await m.tik(3, (st) => l.som(plusZonderUitkomst(10, st.enen)));
    l.som(plusSom(10, 3, 13));
    await l.zeg("Kijk eens.", "{10} plus {3} is {13}.");
    await l.verder();

    l.som(getal(13));
    m.zet({ knop: 10 });
    await l.zeg("Je hebt er nu {13}.", "Nu komt er een lichtbol van {10} bij.", "Hoeveel is {13} plus {10}?");
    testHaak({ antwoord: 23, vraagId: Math.random() });
    const v23 = await kiesGetalHolo(l, [13, 14, 23, 33]);
    if (v23 === 23) await l.zeg("Goed bedacht.", "Doe zelf een lichtbol van {10} erbij.");
    else if (v23 === 14) await l.zeg("Kijk goed.", "Er komt een hele lichtbol van {10} bij.", "Niet één ster.", "Doe zelf een lichtbol van {10} erbij.");
    else await l.zeg(v23 === null ? "Geen zorgen." : "Kijk maar mee.", "Doe zelf een lichtbol van {10} erbij.");
    m.zet({ wijs: true });
    await m.tik(1);
    l.som(plusSom(13, 10, 23));
    await l.zeg("Kijk eens.", "{13} plus {10} is {23}.");
    await l.verder();

    /* 17 + 20. */
    l.som(null);
    m.zet({ tienen: 1, enen: 7, knop: null });
    await getalvraag(
      l,
      {
        vraag: ["Er staat nu een nieuw getal.", "Welk getal is dit?"],
        lijst: [7, 17, 27, 71],
        goed: 17,
        bijGoed: ["Ja, {17}."],
        hint: (v) => (v === 71 ? ["Kijk goed.", "Eerst de lichtbol, dan de losse sterren."] : ["Eén lichtbol is {10}.", "Tel de losse sterren erbij."]),
        antwoord: ["Eén lichtbol van {10} en {7} losse sterren.", "Dat is {17}."],
        klaarzetten: () => m.zet({ tienen: 1, enen: 7, knop: null }),
      },
      later,
    );
    m.zet({ knop: 10 });
    l.som(getal(17));
    erbij = 0;
    await l.zeg("Nu komt er {20} bij.", "Hoeveel is {17} plus {20}?");
    await somVraag(l, 17, 20, {
      kies: (lijst) => kiesMetMachine(l, m, lijst ?? [17, 19, 27, 37], tikErbij(17)),
      lijst: [17, 19, 27, 37],
      hint: (v) => (v === 19 ? ["Kijk goed.", "Er komen {2} lichtbollen van {10} bij.", "Geen losse sterren."] : ["Doe er {2} lichtbollen van {10} bij.", "Hoeveel is het dan?"]),
      uitleg: ["Bij {17} komen {2} lichtbollen van {10}.", "{27}, {37}."],
      bijGoed: ["Klopt."],
      later,
      klaarzetten: () => m.zet({ tienen: 1, enen: 7, knop: null }),
    });
    await l.wacht(800);

    /* Nog een getal lezen. */
    l.som(null);
    m.zet({ tienen: 2, enen: 5, knop: null });
    await getalvraag(
      l,
      {
        vraag: ["En welk getal is dit?"],
        lijst: [7, 25, 52, 35],
        goed: 25,
        bijGoed: ["Goed zo, {25}."],
        hint: (v) => (v === 52 ? ["Kijk goed.", "Eerst de lichtbollen, dan de losse sterren."] : ["Tel de lichtbollen: {10}, {20}.", "Dan de losse sterren erbij."]),
        antwoord: ["{2} lichtbollen van {10} en {5} losse sterren.", "Dat is {25}."],
        klaarzetten: () => m.zet({ tienen: 2, enen: 5, knop: null }),
      },
      later,
    );

    /* Oefenen: drie goed, dan klaar. De laatste zonder machine. Groep 3: tot 50. */
    await l.zeg("Ik geef je er nog een paar.", "Als je er {3} goed hebt, gaan we verder.", "De machine helpt als je hem nodig hebt.");
    await l.verder();
    const sommen: [number, number][] = [
      [24, 10],
      [18, 30],
      [27, 20],
      [31, 10],
      [15, 30],
      [22, 20],
      [36, 10],
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
      const keuzes = oplopend(enkel, s - 10, s, s + 10);
      const inEen = await somVraag(l, a, b, {
        kies: (lijst) => (zonder ? kiesGetalHolo(l, lijst ?? keuzes) : kiesMetMachine(l, m, lijst ?? keuzes, tikErbij(a))),
        lijst: keuzes,
        hint: (v) =>
          v === enkel
            ? ["Kijk goed.", "Er komen hele lichtbollen van {10} bij.", "Geen losse sterren."]
            : [`Doe er ${b === 10 ? "één lichtbol" : `{${b / 10}} lichtbollen`} van {10} bij.`, `Hoeveel is {${a}} plus {${b}}?`],
        uitleg: [`Bij {${a}} komen ${b === 10 ? "één lichtbol" : `{${b / 10}} lichtbollen`} van {10}.`, `Dan heb je {${s}}.`],
        bijGoed: [["Ja.", "Klopt.", "Precies."][goed % 3]],
      });
      if (inEen) goed++;
      m.zet({ tienen: Math.floor(s / 10), enen: s % 10, slot: false });
      await l.wacht(900);
      l.som(null);
    }
    m.zet({ knop: null, slot: false });
    await speelLater(l, later);
    l.som(null);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(goed >= 3 ? "Je doet ze allemaal goed!" : "Goed gewerkt!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 3. Splitsen ---------- */

/*
  Volgt LESSENPLAN.md S2 (wereld Oceaan) en Synthesis "Add up to 100 · Part
  Part Whole": eerst de woorden samenstellen en splitsen (met een parelsnoer
  rijgen als voorbeeld in plaats van muziek), een parelplank van 5 die
  uiteenvalt, het splitshuis stap voor stap (plus, min, het geheel bovenaan),
  een lijstje met de gevonden splitsingen, 5 en 7 op meer manieren, en zelf
  kiezen: zo een of een groter getal (12). Start (ronde 3): "weet je hoe je
  splitst?" Ja = korte proef met 8; het vraagteken in de proef = de les begint
  bij de opbouw. 20 opgaven.
*/
const splitsen: Lesdraaiboek = {
  id: "optellen-100-splitsen",
  titel: "Splitsen",
  synthesis: "Add up to 100 · Part Part Whole",
  kaarttekening: KaartSplitsen,

  async speel(l) {
    const later = nieuwLater();
    const sch = maakSchema(l, { geheel: 8, links: 0, rechts: 0 });
    await l.zeg("Weet je hoe je een getal splitst?", "Bijvoorbeeld de {8}?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const weet = await l.kies(["Ja", "Nee"]);
    if (weet === "Ja") {
      /* Korte proef (ronde 3): splits de 8 in twee delen. */
      await l.zeg("Mooi.", "Met deze knoppen verander je de delen.", "Splits de {8} in twee delen.");
      const proef = await zoekSplitsingProef(l, sch, 8);
      if (proef) {
        await l.zeg("Goed zo, dat kun je al.", "Toch kijken we samen nog even naar de woorden.");
        sch.zet({ lijst: [[proef[0], proef[1], 8]] });
        await l.verder();
        sch.zet({ lijst: [] });
      } else await l.zeg("Geen probleem.", "We leren het samen, vanaf het begin.");
    } else await l.zeg("Geen probleem.");
    await l.zeg("Eerst kijken we naar {2} lastige woorden.");

    /* De woorden samenstellen en splitsen. */
    sch.zet({ verborgen: true, links: 0, rechts: 0 });
    await l.zeg("Het eerste woord is *samenstellen*.", "Heb je dat woord al eens gehoord?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const gehoord = await l.kies(["Ja", "Nee"]);
    await l.zeg(gehoord === "Ja" ? "Mooi." : "Geen probleem.", "Samenstellen is als bouwen.", "Je maakt iets groots van kleine stukjes.");
    await l.verder();

    /* Een voorbeeld: een parelsnoer rijgen uit losse parels (Synthesis: een liedje uit noten). */
    sch.zet({ verborgen: false, snoer: 0, snoerActief: false, snoerDicht: false });
    await l.zeg("Een voorbeeld: een parelsnoer maken.", "Je rijgt losse parels aan een snoer.", "Probeer het zelf maar.", "Tik op de parels onderaan.");
    sch.zet({ snoerActief: true });
    testHaak({ snoerTik: "parel" });
    let n = 0;
    while (n < 6) {
      const g = await l.wachtOpVlak<HoloSplitsMelding>("parel");
      if (g.soort !== "parel") continue;
      n++;
      sch.zet({ snoer: n });
      if (n === 2) void l.zeg("Ga maar door.", "Zo maak je je snoer af.").catch(() => {});
    }
    sch.zet({ snoerActief: false });
    await l.wacht(500);
    await l.zeg("Je hebt een snoer gemaakt met {6} parels.", "Dat zijn {6} stukjes.", "Tik op het snoer om het dicht te maken.");
    testHaak({ snoerTik: "sluit" });
    sch.zet({ snoerActief: true });
    await l.wachtOpVlak<HoloSplitsMelding>("sluit");
    sch.zet({ snoerActief: false, snoerDicht: true });
    testHaak({ snoerTik: null });
    await l.wacht(1200);
    await l.zeg("Prachtig.", "Samenstellen is iets bouwen van kleine stukjes.", "Net als jouw parelsnoer.");
    await l.verder();
    sch.zet({ snoer: null, snoerDicht: false, verborgen: true });
    await l.zeg("Het tweede woord is *splitsen*.", "Samenstellen is stukjes bij elkaar doen.", "Wat betekent splitsen, denk je?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const woord = await l.kies(["In stukjes breken", "Groter maken"]);
    if (woord === "In stukjes breken") await l.zeg("Ja!", "Splitsen is iets in stukjes breken.");
    else {
      await l.zeg(woord === null ? "Geen zorgen." : "Niet helemaal.", "Splitsen is het omgekeerde van samenstellen.", "Je breekt iets in stukjes.");
      await l.verder();
    }

    /* Een parelplank van 5 valt uit elkaar. */
    sch.zet({ verborgen: false, tegel: "heel" });
    await l.zeg("Bij rekenen splitsen we getallen.", "Probeer het maar.", "Tik op deze plank met {5} parels.");
    testHaak({ tegelTik: true });
    await l.wachtOpVlak<HoloSplitsMelding>("tegel");
    testHaak({ tegelTik: false });
    sch.zet({ tegel: "los" });
    await l.wacht(900);
    await l.zeg("Goed zo.", "Je hebt de {5} gesplitst.");
    await getalvraag(
      l,
      {
        vraag: ["In hoeveel stukjes?"],
        lijst: [3, 4, 5],
        goed: 5,
        bijGoed: ["Ja, precies.", "In {5} stukjes van {1}."],
        hint: () => ["Tel de parels nog eens."],
        antwoord: ["Het zijn {5} stukjes van {1}."],
      },
    );

    /* Het splitshuis, stap voor stap. */
    sch.zet({ tegel: null, geheel: null, links: 0, rechts: 0 });
    await l.zeg("Dat gaan we vandaag doen: getallen splitsen.", "Dit splitshuis helpt ons.");
    await l.verder();
    await l.zeg("Begin bij deze bel onderaan.", "Tik op de plus.");
    await knoppenTot(l, sch, () => sch.st.links >= 1, "links-plus");
    await l.zeg("Mooi, er zit {1} parel in.", "Kun je er {4} van maken?");
    await knoppenTot(l, sch, () => sch.st.links === 4, "links-plus");
    await l.zeg("Goed.", "Tik nu één keer op de min.");
    await knoppenTot(l, sch, () => sch.st.links === 3, "links-min");
    await l.zeg("Je hebt van de {4} een {3} gemaakt.", "Zag je de grote bel bovenaan?", "Daar zitten ook {3} parels.", "Dat is het totaal.");
    await l.verder();
    await l.zeg("Deze bel is nog leeg.", "Doe er {2} parels in.", "Tik op deze plus.");
    await knoppenTot(l, sch, () => sch.st.rechts === 2, "rechts-plus");
    await l.zeg("Je hebt ook het totaal veranderd.");
    await getalvraag(l, {
      vraag: ["Hoeveel parels zitten er nu in de grote bel?"],
      lijst: [2, 3, 5],
      goed: 5,
      bijGoed: ["Natuurlijk, {5}."],
      hint: () => ["Kijk naar de grote bel.", "Tel de parels."],
      antwoord: ["In de grote bel zitten {5} parels."],
    });
    await l.zeg("De delen {3} en {2} maken samen {5}.", "Het totaal staat altijd bovenaan.");
    await l.verder();
    await l.zeg("Je hebt dus {2} delen en één totaal.", "Welke som heb je gemaakt?");
    testHaak({ antwoord: "3 + 2 = 5", vraagId: Math.random() });
    const somKeuze = await l.kies(schud(["3 + 2 = 5", "4 + 2 = 6"]));
    if (somKeuze === "3 + 2 = 5") await l.zeg("Precies.");
    else {
      await l.zeg(somKeuze === null ? "Geen zorgen." : "Kijk naar de delen: {3} en {2}.", "Samen is dat {5}.", "Dus {3} plus {2} is {5}.");
      await l.verder();
    }
    sch.zet({ lijst: [[3, 2, 5]] });

    /* Nog een manier om 5 te splitsen. */
    await l.zeg("{3} en {2} is één manier om {5} te splitsen.", "Kun je het ook *anders*?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const anders = await l.kies(["Ja", "Nee"]);
    await l.zeg(anders === "Ja" ? "Mooi." : "We proberen het samen.", "Verander de parels in de bellen onderaan.", "Zorg dat het samen weer {5} is.");
    const [a5, b5] = await zoekSplitsing(l, sch, 5, [[3, 2]], false, later);
    sch.zet({ lijst: [[3, 2, 5], [a5, b5, 5]] });
    await l.zeg("Eerst splitste je {5} in {3} en {2}.", "Hoe deed je het deze keer?");
    testHaak({ antwoord: `${a5} + ${b5}`, vraagId: Math.random() });
    const hoe = await l.kies(schud([`${a5} + ${b5}`, `${a5 + 1} + ${b5}`]));
    await l.zeg(hoe === `${a5} + ${b5}` ? "Goed." : "Kijk naar de bellen.", `{${a5}} en {${b5}}.`);
    await l.wacht(600);

    /* Een vast totaal van 7: drie manieren zoeken. */
    sch.zet({ geheel: 7, links: 0, rechts: 0, lijst: [] });
    await getalvraag(
      l,
      {
        vraag: ["Ik heb een nieuw totaal klaargezet.", "Hoeveel parels zijn het?"],
        lijst: [6, 7, 8],
        goed: 7,
        bijGoed: ["Ja, {7}."],
        hint: () => ["Tel de parels in de grote bel nog eens."],
        antwoord: ["Het zijn er {7}."],
        klaarzetten: () => sch.zet({ geheel: 7, links: 0, rechts: 0, lijst: [] }),
      },
      later,
    );
    await l.zeg("Zoek {2} delen die samen {7} maken.");
    const gevonden: [number, number][] = [];
    const lijst7 = () => gevonden.map(([p, q]) => [p, q, 7] as [number, number, number]);
    let [p, q] = await zoekSplitsing(l, sch, 7, gevonden, true, later);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg("Dat werkt.", `Je hebt {7} gesplitst in {${p}} en {${q}}.`);
    await l.zeg("Je krijgt het echt door.", "We breken een getal in stukjes.", "Weet je nog hoe dat heet?");
    testHaak({ antwoord: "Splitsen", vraagId: Math.random() });
    const naam = await l.kies(schud(["Splitsen", "Samenstellen"]));
    if (naam === "Splitsen") await l.zeg("Precies.", "Splitsen is een getal in stukjes breken.", `Net zoals jij {7} splitste in {${p}} en {${q}}.`);
    else await l.zeg(naam === null ? "Geen zorgen." : "Bijna.", "Het heet splitsen.", "Splitsen is een getal in stukjes breken.");
    await l.verder();

    await l.zeg("Zoek nog een manier om {7} te splitsen.");
    [p, q] = await zoekSplitsing(l, sch, 7, gevonden, true, later);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg("Heel goed.", `Je hebt {7} gesplitst in {${p}} en {${q}}.`, "Zoek nog één manier.");
    [p, q] = await zoekSplitsing(l, sch, 7, gevonden, true, later);
    gevonden.push([p, q]);
    sch.zet({ lijst: lijst7() });
    await l.zeg(`{${p}} en {${q}}, goed zo.`, "Je hebt {7} nu op {3} manieren gesplitst.", "Knap gedaan.");
    await l.verder();

    /* Zelf kiezen: zo een, of een groter getal. */
    await l.zeg("Nog één getal, dan zijn we klaar.", "Wil je er nog een zoals deze?", "Of een groter getal?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const groter = (await l.kies(["Zo een", "Groter"])) === "Groter";
    const g = groter ? 12 : 8;
    const gevondenG: [number, number][] = [];
    sch.zet({ geheel: g, links: 0, rechts: 0, lijst: [] });
    await l.zeg(groter ? "Goed, een groter getal." : "Goed, nog een zoals deze.", `Splits de {${g}} in {2} delen.`);
    [p, q] = await zoekSplitsing(l, sch, g, gevondenG, true, later);
    gevondenG.push([p, q]);
    sch.zet({ lijst: [[p, q, g]] });
    await l.zeg("Ja.", `{${p}} plus {${q}} is {${g}}.`, `Zoek een andere manier om {${g}} te splitsen.`);
    const [r1, r2] = await zoekSplitsing(l, sch, g, gevondenG, true, later);
    sch.zet({ lijst: [[p, q, g], [r1, r2, g]] });
    await l.zeg("Mooi.", `Je hebt {${g}} op {2} manieren gesplitst.`, l.naam ? `Echt knap werk, ${l.naam}.` : "Echt knap werk.");
    await l.verder();
    await speelLater(l, later);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Goed gedaan.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** De korte proef (ronde 3): één splitsing; het vraagteken = "we leren het samen". */
async function zoekSplitsingProef(l: Lesgids, sch: Schema, totaal: number): Promise<[number, number] | null> {
  sch.zet({ geheel: totaal, links: 0, rechts: 0 });
  testHaak({ splitsDoel: { totaal, voorbeeld: [totaal - 3, 3] } });
  sch.zet({ knoppen: false, klaar: true, hulp: true });
  await l.wijsAan("klaar", "Ben je klaar? Tik dan op het vinkje.");
  await l.wijsAan("hulpvlak", "Weet je het niet? Tik dan op het vraagteken.");
  sch.zet({ knoppen: true });
  for (let poging = 0; poging < 2; ) {
    const g = await l.wachtOpVlak<HoloSplitsMelding>(["knop", "klaar", "hulp"]);
    if (g.soort === "knop") {
      drukKnop(sch, g.knop, totaal);
      continue;
    }
    if (g.soort === "hulp") break;
    const { links: a, rechts: b } = sch.st;
    if (a + b === totaal && a > 0 && b > 0) {
      sch.zet({ knoppen: false, klaar: false, hulp: false, golf: Date.now() });
      testHaak({ splitsDoel: null });
      return [a, b];
    }
    poging++;
    if (poging < 2) await l.zeg(`{${a}} en {${b}} is samen {${a + b}}.`, `We zoeken {${totaal}}.`);
  }
  sch.zet({ knoppen: false, klaar: false, hulp: false, links: 0, rechts: 0 });
  testHaak({ splitsDoel: null });
  aangewezenHulp.add(l);
  return null;
}

/* ---------- 4. Tiental plus eenheden ---------- */

/*
  Volgt LESSENPLAN.md G14 en Synthesis "Add up to 100 · 10s Plus Ones": eerst
  met sterrenbeelden van tien (30, ronde getallen met het niet-voorbeeld 25),
  dan een gekleurd sterrengroepje bij een rond getal (het gekozen groepje gaat
  op slot), het trucje met pijlen in de som, de kaart met twee kristallen
  kolommen, en snelle vragen. Eigen Bliepo: sterren en kristallen; vragen met
  woorden als antwoord zijn cijfervragen of een tik op een kolom geworden.
  19 opgaven.
*/
const tientalPlusEenheden: Lesdraaiboek = {
  id: "optellen-100-tiental-plus-eenheden",
  titel: "Tiental plus eenheden",
  synthesis: "Add up to 100 · 10s Plus Ones",
  kaarttekening: KaartStaven,

  async speel(l) {
    const later = nieuwLater();
    const st: StavenProps = { modus: "staven", tienen: 3, los: 0, bij: [], lege: false };
    l.vlak(HoloStaven, { ...st });
    const zet = (p: Partial<StavenProps>) => {
      Object.assign(st, p);
      l.pasVlakAan<StavenProps>(p);
    };
    let golf = 0;
    const goedGolf = () => zet({ golf: ++golf });
    const kiesUitPalet = async (eerste: boolean) => {
      if (eerste) await l.wijsAan("groepje4", "Tik op een groepje sterren.");
      testHaak({ palet: true });
      zet({ actief: true });
      const gk = await l.wachtOpVlak<StavenMelding>("kies");
      zet({ actief: false });
      testHaak({ palet: false });
      return gk.soort === "kies" ? gk.n : 1;
    };

    /* Drie sterrenbeelden van 10. */
    await getalvraag(
      l,
      {
        vraag: ["We beginnen hiermee.", "Welk getal heb ik met de sterren gemaakt?"],
        lijst: [3, 10, 30],
        goed: 30,
        bijGoed: ["Goed, {30}."],
        hint: (x) => (x === 3 ? ["{3}?", "Ik zie wel {3} groepen.", "Maar elke groep heeft {10} sterren."] : [`{${x}}?`, "Elke groep heeft {10} sterren.", "Tel maar met tientallen."]),
        antwoord: ["{10}, {20}, {30}.", "Het is {30}."],
        klaarzetten: () => zet({ modus: "staven", tienen: 3, los: 0, bij: [], palet: false }),
      },
      later,
    );

    /* Een rond getal: alleen groepen van 10. */
    await l.zeg("{30} is een bijzonder getal.", "Het is een *rond* getal.", "Weet je wat ronde getallen zijn?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const weetRond = await l.kies(["Ja", "Nee"]);
    await l.zeg(
      weetRond === "Ja" ? "Mooi, dan frissen we het even op." : "Geen probleem, ik help je.",
      weetRond === "Ja" ? "" : "Het klinkt lastig, maar je kent er al een paar.",
      "Een rond getal bestaat alleen uit volle groepen van {10}.",
    );
    await l.verder();
    zet({ tienen: 1 });
    await l.zeg("Zoals deze: {10}.", "Ik doe er een groep bij.");
    await getalvraag(l, {
      vraag: ["Wat is het volgende ronde getal?"],
      lijst: [15, 20, 25],
      goed: 20,
      bijGoed: ["Ja, {20}.", "Want het zijn {2} groepen van {10}."],
      hint: () => ["Er komt een hele groep van {10} bij.", "{10} en nog {10}."],
      antwoord: ["Het is {20}.", "{2} groepen van {10}."],
    });
    zet({ tienen: 2 });
    await l.wacht(600);
    zet({ los: 5, lege: true });
    await l.zeg("Hm, {25}.", "Is *dit* een rond getal?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const rond25 = await l.kies(["Ja", "Nee"]);
    if (rond25 === "Nee") await l.zeg("Je hebt gelijk.", "{2} groepen van {10} en een beetje extra.", "Dus het is geen rond getal.");
    else await l.zeg(rond25 === null ? "Geen zorgen." : "Kijk goed.", "De laatste groep is niet vol.", "Dus {25} is geen rond getal.");
    await l.verder();
    zet({ tienen: 3, los: 0, lege: false });
    await l.zeg("En zo komen we bij {30}.", "Is dit een rond getal?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const rond30 = await l.kies(["Ja", "Nee"]);
    await l.zeg(rond30 === "Ja" ? "Natuurlijk." : "Kijk goed.", "{3} groepen van {10} en niets extra.", "Dus {30} is een rond getal.");
    await l.verder();

    /* Een klein getal bij een rond getal: kies een gekleurd groepje. */
    zet({ palet: true, paletSlot: [] });
    l.som(plusVak(30));
    await l.zeg("Nu doen we een klein getal bij een rond getal.", "Kies een groepje sterren om bij {30} te doen.");
    const n = await kiesUitPalet(true);
    zet({ bij: [n] });
    l.som(plusSom(30, n));
    await l.zeg("Kijk naar je sterren.", `Hoeveel is {30} plus {${n}}?`);
    await vraagTiental(l, 30, n, () => goedGolf());

    zet({ tienen: 4, bij: [], paletSlot: [n] });
    l.som(plusVak(40));
    await l.zeg("Probeer nu een groepje bij {40}.", `De {${n}} zet ik op slot.`, "Die hadden we al.");
    const k = await kiesUitPalet(false);
    zet({ bij: [k] });
    l.som(plusSom(40, k));
    await l.zeg(`Hoeveel is {40} plus {${k}}?`);
    await vraagTiental(l, 40, k, () => goedGolf());
    l.som(null);

    /* Het trucje, met pijlen. */
    zet({ modus: "pijlen", pijlen: { a: 20, b: 3, c: 23 }, palet: false, bij: [] });
    await l.zeg("Je doet het goed.", "Misschien zag je al een trucje.");
    await l.verder();
    await l.zeg("We hebben een rond getal, zoals {20}.", "We doen er een klein getal bij: {3}.");
    await getalvraag(
      l,
      {
        vraag: ["Kijk naar de pijlen.", "Hoeveel tientallen heeft {23}?"],
        lijst: [2, 3, 23],
        goed: 2,
        bijGoed: ["Ja, {2}.", "Net als {20}.", "Het aantal tientallen verandert helemaal niet."],
        hint: () => ["Kijk naar het gele cijfer.", "Bij {20} staat er een {2}."],
        antwoord: ["Er staat twee keer een {2}.", "De tientallen blijven gelijk."],
        klaarzetten: () => zet({ modus: "pijlen", pijlen: { a: 20, b: 3, c: 23 } }),
      },
      later,
    );
    await getalvraag(
      l,
      {
        vraag: ["En de eenheden?", "Hoeveel eenheden heeft {23}?"],
        lijst: [0, 2, 3],
        goed: 3,
        bijGoed: ["Natuurlijk, {3}.", "Ze werden het getal dat we erbij deden.", "Van {0} naar {3}."],
        hint: () => ["Kijk naar het laatste cijfer van {23}."],
        antwoord: ["{23} heeft {3} eenheden.", "Ze werden het getal dat we erbij deden.", "Van {0} naar {3}."],
        klaarzetten: () => zet({ modus: "pijlen", pijlen: { a: 20, b: 3, c: 23 } }),
      },
      later,
    );

    /* De kaart met twee kristallen kolommen. */
    zet({ modus: "kaart", kaartTienen: 2, kaartEnen: 0, pijlen: null });
    await l.zeg("Ik laat het nog op een andere manier zien.", "Links staan de tientallen.", "Rechts de eenheden.", "Ik heb {2} tientallen gezet.", "Samen is dat {20}.");
    await getalvraag(
      l,
      {
        vraag: ["En hoeveel eenheden zijn er?"],
        lijst: [0, 1, 2],
        goed: 0,
        bijGoed: ["Ja, er zijn geen eenheden.", "Dan is het een rond getal."],
        hint: () => ["Kijk in de rechter kolom.", "Zitten er sterren in?"],
        antwoord: ["De rechter kolom is leeg.", "Er zijn {0} eenheden."],
        klaarzetten: () => zet({ modus: "kaart", kaartTienen: 2, kaartEnen: 0 }),
      },
      later,
    );
    await l.zeg("Nu doen we er wat bij.", "Laat {20} plus {3} zien.", "Tik {3} keer in de kolom van de eenheden.");
    await eenhedenTikken(l, st, zet, 3);
    await l.zeg("Goed, je deed er {3} bij.", "Welke kolom veranderde?", "Tik erop.");
    await kolomVraag(l, zet, "Ja, klopt.", ["Kijk naar de cijfers boven de kolommen.", "Links staat nog steeds {2}.", "Alleen de eenheden veranderen."]);
    await l.zeg("Nu nog één.");
    zet({ kaartTienen: 4, kaartEnen: 0 });
    await l.zeg("Ik heb er {4} tientallen in gezet.", "Maar {0} eenheden.", "Dat is {40}.");
    await l.zeg("Laat nu {40} plus {5} zien.", "Zet {5} sterren bij de eenheden.");
    await eenhedenTikken(l, st, zet, 5);
    await l.zeg("Goed zo.", "Je deed een klein getal bij een rond getal.", "Welke kolom verandert dan?", "Tik erop.");
    await kolomVraag(l, zet, "Klopt.", ["Kijk nog eens naar de kaart.", "Alleen de eenheden veranderen."]);
    await l.zeg("Als je een klein getal bij een rond getal doet, veranderen alleen de eenheden.");
    await l.verder();

    /* Snelle vragen, zonder sterren. */
    zet({ modus: "leeg" });
    await l.zeg("Nu nog een paar snelle vragen.", "Geen sterren, alleen jij en ik.");
    const snel: [number, number, number[]][] = [
      [70, 3, [63, 72, 73, 83]],
      [70, 8, [77, 78, 87, 88]],
      [50, 3, [43, 53, 54, 63]],
      [10, 8, [17, 18, 19, 81]],
    ];
    for (const [i, [a, b, lijst]] of snel.entries()) {
      l.som(plusSom(a, b));
      const goed = await getalvraag(
        l,
        {
          vraag: [i === 0 ? "Probeer deze eerst." : i === 3 ? "Oké, nog één." : "En deze?", `Hoeveel is {${a}} plus {${b}}?`],
          lijst,
          goed: a + b,
          bijGoed: [["Ja.", "Precies.", "Goed.", "Helemaal goed."][i], `{${a + b}}.`],
          hint: (x) => (x === omgedraaid(a + b) ? ["Kijk goed.", "Eerst de tientallen, dan de eenheden."] : ["Probeer het nog eens.", "De tientallen blijven gelijk."]),
          antwoord: [a === 10 ? "Het tiental van {10} blijft gelijk." : `De tientallen van {${a}} blijven gelijk.`, `Er komen {${b}} eenheden bij: {${a + b}}.`],
          klaarzetten: () => {
            zet({ modus: "leeg" });
            l.som(plusSom(a, b));
          },
        },
        later,
      );
      l.som(plusSom(a, b, a + b));
      if (goed) goedGolf();
      await l.wacht(700);
      l.som(null);
    }
    await speelLater(l, later);
    l.som(null);
    await l.zeg(l.naam ? `${l.naam}, je snapt het helemaal.` : "Je snapt het helemaal.", "Knap gedaan.");
    await l.wacht(600);

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/** "30 + ▢": een rond getal met een leeg vakje erachter. */
function plusVak(a: number): Somdeel[] {
  return [{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "vak" }];
}

/** Het getal met de cijfers omgedraaid: 37 wordt 73. */
function omgedraaid(n: number): number {
  return Number(String(n).split("").reverse().join(""));
}

/**
 * "Hoeveel is 30 plus 7?" met de valkuil 73 (cijfers omgedraaid). Bij 33 en 44
 * kan dat niet; dan is de valkuil alleen de losse sterren (3).
 */
async function vraagTiental(l: Lesgids, a: number, b: number, bijGoed: () => void) {
  const s = a + b;
  const fout = omgedraaid(s) !== s ? omgedraaid(s) : b;
  let keuzes = oplopend(s, s + 10, fout);
  testHaak({ antwoord: s, vraagId: Math.random() });
  for (let poging = 1; ; poging++) {
    const v = poging === 1 ? await kiesGetalHolo(l, keuzes) : await kiesGetal(l, keuzes);
    if (v === s) {
      l.som(plusSom(a, b, s));
      bijGoed();
      await l.zeg(poging === 1 ? "Precies." : "Helemaal goed.", `{${a}} plus {${b}} is {${s}}.`);
      await l.verder();
      return;
    }
    if (v !== null && poging === 1) {
      /* De foute keuze verdwijnt; er komt een nieuwe bij. */
      keuzes = oplopend(...keuzes.filter((w) => w !== v), s - 1);
      await l.zeg(
        v === fout && fout !== b ? "Eerst de tientallen, dan de losse sterren." : v === fout ? "Vergeet de groepen van {10} niet." : "Tel de groepen van {10} nog eens.",
        "Probeer het nog eens.",
      );
      continue;
    }
    l.som(plusSom(a, b, s));
    await l.zeg(v === null ? "Geen zorgen." : "Kijk.", `De tientallen blijven: {${a}}.`, `Er komen {${b}} eenheden bij.`, `{${a}} plus {${b}} is {${s}}.`);
    await l.verder();
    return;
  }
}

/** Het kind tikt sterren in de kolom van de eenheden tot er `aantal` bij zijn gekomen. */
async function eenhedenTikken(l: Lesgids, st: StavenProps, zet: (p: Partial<StavenProps>) => void, aantal: number) {
  const doel = (st.kaartEnen ?? 0) + aantal;
  testHaak({ kaartDoel: doel });
  zet({ actief: true, kolomKiezen: false });
  while ((st.kaartEnen ?? 0) < doel) {
    await l.wachtOpVlak<StavenMelding>("eenheid");
    zet({ kaartEnen: (st.kaartEnen ?? 0) + 1 });
  }
  zet({ actief: false });
  testHaak({ kaartDoel: null });
}

/** "Welke kolom veranderde?": het kind tikt op een kolom (geen woorden om te lezen). */
async function kolomVraag(l: Lesgids, zet: (p: Partial<StavenProps>) => void, bijGoed: string, uitleg: string[]) {
  testHaak({ kolomAntwoord: "een" });
  zet({ actief: true, kolomKiezen: true });
  const g = await l.wachtOpVlak<StavenMelding>("kolom");
  zet({ actief: false, kolomKiezen: false });
  testHaak({ kolomAntwoord: null });
  if (g.soort === "kolom" && g.kolom === "een") await l.zeg(bijGoed, "Alleen de eenheden veranderen.");
  else {
    await l.zeg(...uitleg);
    await l.verder();
  }
}

/* ---------- 5. Eindtoets ---------- */

/*
  Volgt LESSENPLAN.md O20 en Synthesis "Add up to 100 · Mastery Check": drie
  lichtbollen tikken en lezen, 30 + 40 en 70 + 6 (het groep 3-deel; 76 + ? =
  100 en 37 + 8 zijn groep 4 en vallen weg), en de vragen die hier al stonden
  (de 8 splitsen, 27 + 20). Toetsregels zoals de instaptoets; daarna samen
  oefenen tot er minstens 15 opgaven zijn.
*/
const eindtoets: Lesdraaiboek = {
  id: "optellen-100-eindtoets",
  titel: "Eindtoets: optellen tot 100",
  synthesis: "Add up to 100 · Mastery Check",
  kaarttekening: KaartEindtoets,

  async speel(l) {
    let goed = 0;
    let gedaan = 0;
    let stop = false;
    const tel = async (vraag: () => Promise<"goed" | "herkansing" | "stop">) => {
      if (stop) return;
      const r = await vraag();
      gedaan++;
      if (r === "goed") goed++;
      if (r === "stop") stop = true;
    };

    const m = maakMachine(l, { honderd: true, knop: null });
    await l.zeg("Dit is de eindtoets van optellen tot {100}.", "Ken je dit al?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We kijken wat je al kunt.", "Probeer zo vlot mogelijk te antwoorden.");
    m.zet({ honderd: false, knop: 10, wijs: true });
    await l.zeg("Tik {3} keer op de knop.");
    await m.tik(3);
    await l.zeg("Welk getal is dat?");
    await tel(() => toetsHolo(l, { opties: [3, 30, 40, 300], goed: 30, bijGoed: ["Goed, {30} sterren.", "{3} lichtbollen van {10}."], bijFout: (x) => [`{${x}}?`, "Kijk nog eens goed."], tempo: "beide" }));

    if (!stop) {
      l.som(plusSom(30, 40));
      await l.zeg("Wat krijg je als je er {40} bij doet?", "Hoeveel is {30} plus {40}?");
      await tel(() => toetsHolo(l, { opties: [34, 60, 70, 80], goed: 70, bijGoed: ["Precies, {30} plus {40} is {70}."], bijFout: somAlsVraag(30, 40), tempo: "beide" }));
      l.som(null);
    }
    if (!stop) {
      m.zet({ tienen: 7, knop: null });
      await l.zeg("Kijk hoe ik er nu eenheden bij doe.");
      for (let i = 1; i <= 6; i++) {
        m.zet({ enen: i });
        await l.wacht(260);
      }
      l.som(plusSom(70, 6));
      await l.zeg("{70} plus {6}.", "Weet je welk getal dit is?");
      await tel(() => toetsHolo(l, { opties: [66, 76, 86, 706], goed: 76, bijGoed: ["Precies, {76}."], bijFout: somAlsVraag(70, 6), tempo: "beide" }));
      l.som(null);
    }

    if (!stop) {
      const sch = maakSchema(l, { geheel: 8, links: 5, rechts: 0, vraag: "rechts", sterren: true });
      await l.zeg("Nu splitsen we de {8}.", "Eén deel is {5}.", "Hoeveel is het andere deel?");
      await tel(() =>
        toetsHolo(l, { opties: [2, 3, 4, 13], goed: 3, bijGoed: ["Ja, {5} en {3} is samen {8}."], bijFout: (x) => [`{5} en {${x}} is samen {${5 + x}}?`, "Kijk nog eens goed."], tempo: "beide" }),
      );
      if (!stop) {
        sch.zet({ rechts: 3, vraag: null });
        await l.wacht(700);
      }
    }

    /* Een kale som. */
    if (!stop) {
      maakMachine(l, { knop: null });
      l.som(plusSom(27, 20));
      await l.zeg("Nog één vraag.", "Hoeveel is {27} plus {20}?");
      await tel(() => toetsHolo(l, { opties: [29, 37, 47, 57], goed: 47, bijGoed: ["Helemaal goed."], bijFout: somAlsVraag(27, 20), tempo: "beide" }));
      if (!stop) {
        l.som(plusSom(27, 20, 47));
        await l.wacht(900);
      }
      l.som(null);
    }

    if (!stop && goed === 5) await l.zeg(l.naam ? `Echt knap gedaan, ${l.naam}!` : "Echt knap gedaan!", "Je kunt plussommen tot {100} maken.");
    else if (!stop) await l.zeg("Goed gedaan.", "Je weet het bijna allemaal.");
    await l.verder();

    /* Samen oefenen, zodat het samen minstens 15 opgaven zijn. */
    await oefenNaToets(l, Math.max(10, 15 - gedaan));

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(stop ? "Goed geoefend." : "Goed gedaan.", stop ? "Doe de toets later nog eens." : "", "Tik op de kaart om hem af te vinken.");
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

/* ---------- aanvullen met sterrenbeelden (hologrammen) ---------- */

type Sterbeeld = { st: StavenProps; zet(p: Partial<StavenProps>): void };

function maakSterbeeld(l: Lesgids, begin: Partial<StavenProps>): Sterbeeld {
  const st: StavenProps = { modus: "staven", tienen: 0, los: 0, bij: [], lege: true, palet: false, paletSlot: [], actief: false, vinkje: false, hulp: false, ...begin };
  l.vlak(HoloStaven, { ...st });
  return {
    st,
    zet(p) {
      Object.assign(st, p);
      l.pasVlakAan<StavenProps>(p);
    },
  };
}

/** "a + ▢ = doel", of met het gekozen getal in het vakje. */
function aanvulSom(a: number, doel: number, g: number | null = null): Somdeel[] {
  return [{ t: "getal", n: a }, { t: "teken", s: "+" }, g === null ? { t: "vak" } : { t: "vak", waarde: String(g) }, { t: "teken", s: "=" }, { t: "getal", n: doel }];
}

/**
 * Aanvullen tot het volgende tiental met een gekleurd sterrengroepje uit het
 * palet (LESSENPLAN.md O19). Het kind kiest, ziet de sterren in de lege
 * plekjes vallen, en bevestigt met het vinkje. 1× fout: het kind ziet wat er
 * gebeurt (een gaatje, of sterren over de groep heen), de keuze gaat op slot.
 * 2× fout of het vraagteken: Bliepo zegt welk groepje het moet zijn (alleen dat
 * groepje blijft over) en de vraag komt later terug. Geeft terug of het in één
 * keer goed was.
 */
async function sterAanvullen(l: Lesgids, k: Sterbeeld, a: number, doel: number, o: { eerste: boolean; later?: Later }): Promise<boolean> {
  const nodig = doel - a;
  k.zet({ modus: "staven", tienen: Math.floor(a / 10), los: a % 10, bij: [], lege: true, palet: true, paletSlot: [], omlijnLos: false });
  l.som(aanvulSom(a, doel));
  await l.zeg(`Wat moet er bij {${a}} om {${doel}} te maken?`, o.eerste ? "Tik op een groepje sterren bovenaan." : "");
  if (o.eerste) await l.wijsAan("groepje3", "Dit is een groepje van {3} sterren.");
  let fouten = 0;
  let slot: number[] = [];
  let alleen = false;
  let vinkjeUitgelegd = !o.eerste;
  for (;;) {
    k.zet({ bij: [], paletSlot: alleen ? NEGEN.filter((n) => n !== nodig) : slot, vinkje: false, hulp: !alleen });
    l.som(aanvulSom(a, doel));
    testHaak({ antwoord: nodig, palet: true, vraagId: Math.random() });
    /* Kiezen (wisselen mag), dan het vinkje; het vraagteken = weet ik niet. */
    let g: number | null = null;
    k.zet({ actief: true });
    for (;;) {
      const ev = await l.wachtOpVlak<StavenMelding>(["kies", "klaar", "hulp"]);
      if (ev.soort === "hulp") {
        g = null;
        break;
      }
      if (ev.soort === "klaar") {
        if (g !== null) break;
        continue;
      }
      if (ev.soort !== "kies") continue;
      g = ev.n;
      k.zet({ bij: [g], vinkje: true });
      l.som(aanvulSom(a, doel, g));
      if (!vinkjeUitgelegd) {
        vinkjeUitgelegd = true;
        k.zet({ actief: false });
        await l.wijsAan("klaar", "Ben je tevreden met je keuze?", "Tik dan op het vinkje.");
        k.zet({ actief: true });
      }
    }
    k.zet({ actief: false, vinkje: false, hulp: false });
    testHaak({ palet: false });
    if (g === nodig) {
      k.zet({ paletSlot: [], golf: Date.now() });
      l.som([{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: nodig }, { t: "teken", s: "=" }, { t: "getal", n: doel }]);
      return fouten === 0;
    }
    fouten++;
    if (g === null || fouten >= 2) {
      if (g !== null) {
        l.som([{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: g }, { t: "teken", s: "=" }, { t: "getal", n: a + g }]);
        await l.zeg(`{${a}} plus {${g}} is {${a + g}}.`, `We zoeken {${doel}}.`);
      } else await l.zeg("Geen zorgen.");
      k.zet({ bij: [] });
      await l.zeg("Tel de lege plekjes in de groep.", legePlekjes(nodig), `Tik op de {${nodig}}.`, o.later ? "We komen hier later op terug." : "");
      if (o.later) {
        const lt = o.later;
        lt.lijst.push(async () => {
          await sterAanvullen(l, k, a, doel, { eerste: false });
          await l.zeg("Ja.", `{${a}} plus {${nodig}} is {${doel}}.`);
          await l.wacht(800);
        });
        o = { ...o, later: undefined };
      }
      alleen = true;
      continue;
    }
    /* 1× fout: laten zien wat er gebeurt, en de keuze gaat op slot. */
    l.som([{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: g }, { t: "teken", s: "=" }, { t: "getal", n: a + g }]);
    await l.zeg(`{${a}} plus {${g}} is {${a + g}}.`, `We zoeken {${doel}}.`, g < nodig ? "Kijk, er zijn nog lege plekjes." : "Kijk, er gaan sterren over de groep heen.");
    await l.verder();
    slot = [g];
    await l.zeg("Probeer het nog eens.");
  }
}

/**
 * Aanvullen zonder sterren: alleen de som; het kind typt het getal in een
 * echt invulvak. 1× fout: Bliepo rekent het voor en zet de sterren erbij als
 * hulp in beeld. 2× fout of "weet ik niet": het antwoord, en de vraag komt
 * later terug.
 */
async function sterAanvullenZonder(l: Lesgids, k: Sterbeeld, a: number, doel: number, bijGoed: string, later?: Later): Promise<boolean> {
  const nodig = doel - a;
  k.zet({ modus: "leeg", palet: false, bij: [] });
  l.som(aanvulSom(a, doel));
  await l.zeg(`Wat moet er bij {${a}} om {${doel}} te maken?`);
  for (let poging = 1; ; poging++) {
    testHaak({ antwoord: nodig, vraagId: `zonder${a}-${poging}` });
    const x = await l.getal();
    if (x === nodig) {
      l.som(aanvulSom(a, doel, nodig));
      k.zet({ golf: Date.now() });
      await l.zeg(bijGoed, `{${a}} plus {${nodig}} is {${doel}}.`);
      await l.wacht(800);
      return poging === 1;
    }
    if (x !== null && poging === 1) {
      l.som([{ t: "getal", n: a }, { t: "teken", s: "+" }, { t: "getal", n: x }, { t: "teken", s: "=" }, { t: "getal", n: a + x }]);
      await l.zeg(`{${a}} plus {${x}} is {${a + x}}.`, `We zoeken {${doel}}.`, "Kijk, ik zet de sterren erbij.");
      k.zet({ modus: "staven", tienen: Math.floor(a / 10), los: a % 10, bij: [], lege: true, palet: false, omlijnLos: true });
      l.som(aanvulSom(a, doel));
      await l.zeg("Hoeveel lege plekjes zie je?", `Wat moet er bij {${a}} om {${doel}} te maken?`);
      continue;
    }
    k.zet({ modus: "staven", tienen: Math.floor(a / 10), los: a % 10, bij: [nodig], lege: true, palet: false, omlijnLos: false });
    l.som(aanvulSom(a, doel, nodig));
    await l.zeg(x === null ? "Geen zorgen." : "Kijk maar.", `Er moeten {${nodig}} sterren bij.`, `{${a}} plus {${nodig}} is {${doel}}.`, later ? "We komen hier later op terug." : "");
    await l.verder();
    if (later) later.lijst.push(() => sterAanvullenZonder(l, k, a, doel, "Goed zo.").then(() => undefined));
    return false;
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

/*
  Volgt LESSENPLAN.md O19 en Synthesis "Add up to 100 · Bridging to 10s":
  eerst tientallen en eenheden tellen tot 38 in sterrenbeelden van tien (2 × 5),
  dan aanvullen tot het volgende tiental door een gekleurd sterrengroepje te
  kiezen (de lege plekjes lichten op) en te bevestigen met het vinkje, daarna
  zelf kiezen: zonder sterren verder (het getal typen in een echt vak).
  15 of 16 opgaven.
*/
const aanvullenTotTiental: Lesdraaiboek = {
  id: "optellen-100-aanvullen-tot-tiental",
  titel: "Aanvullen tot het tiental",
  synthesis: "Add up to 100 · Bridging to 10s",
  kaarttekening: KaartAanvullen,

  async speel(l) {
    const later = nieuwLater();
    const k = maakSterbeeld(l, { tienen: 3, los: 3 });
    l.som(aanvulSom(33, 40));
    await l.zeg("We gaan naar het volgende ronde getal.", "Wat moet er bij {33} om {40} te maken?", "Weet je dat al?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const weet = await l.kies(["Ja", "Nee"]);
    await l.zeg(weet === "Ja" ? "Mooi, dan kijken we samen of het klopt." : "Helemaal geen probleem.", "We ontdekken het samen.");
    l.som(null);

    /* 1. Tellen: groepen van tien en losse sterren, tot 38. */
    const zetTel = (tienen: number, los: number, omlijnLos = false) => () => k.zet({ modus: "staven", tienen, los, bij: [], lege: false, palet: false, omlijnLos });
    zetTel(1, 0)();
    await getalvraag(
      l,
      {
        vraag: ["Kijk naar de sterren.", "Hoeveel sterren zijn het?"],
        lijst: [7, 9, 10],
        goed: 10,
        bijGoed: ["Goed.", "We hebben een groep van {10}."],
        hint: (x) => (x === 9 ? ["{9}? Heel dichtbij, maar net niet.", "Welk getal laten de sterren zien?"] : [`{${x}}?`, "Tel de sterren nog eens.", "Welk getal laten ze zien?"]),
        antwoord: ["Het zijn {10} sterren.", "We hebben een groep van {10}."],
        klaarzetten: zetTel(1, 0),
      },
      later,
    );
    zetTel(2, 0)();
    await l.wacht(400);
    await getalvraag(
      l,
      {
        vraag: ["Hoeveel groepen van {10} hebben we *deze* keer?"],
        lijst: [2, 10, 20],
        goed: 2,
        bijGoed: ["Ja.", "De groepen zijn even groot.", "In elke groep zitten {10} sterren."],
        hint: () => ["We tellen nu de groepen, niet de sterren."],
        antwoord: ["Kijk, ik zie {2} groepen.", "In elke groep zitten {10} sterren."],
        klaarzetten: zetTel(2, 0),
      },
      later,
    );
    await getalvraag(
      l,
      {
        vraag: ["{2} groepen van {10}.", "Hoeveel sterren zijn het samen?"],
        lijst: [2, 10, 20],
        goed: 20,
        bijGoed: ["Heel goed.", "{2} groepen van {10} is {20}."],
        hint: (x) => (x === 2 ? ["Ja, het zijn {2} groepen.", "Maar elke groep heeft {10} sterren."] : ["{10} en nog {10}.", "Hoeveel is dat?"]),
        antwoord: ["{10} en nog {10} is {20}.", "Het zijn {20} sterren."],
        klaarzetten: zetTel(2, 0),
      },
      later,
    );
    zetTel(3, 0)();
    await l.wacht(400);
    await getalvraag(
      l,
      {
        vraag: ["Ik heb er nog een groep bij gedaan.", "Hoeveel sterren zijn het nu?"],
        lijst: [20, 29, 30],
        goed: 30,
        bijGoed: ["Ja, {30} sterren."],
        hint: () => ["Tel de groepen met tientallen.", "{10}, {20}, …"],
        antwoord: ["{10}, {20}, {30}.", "Het zijn {30} sterren."],
        klaarzetten: zetTel(3, 0),
      },
      later,
    );
    await l.zeg("Nu doe ik er een beetje bij.");
    zetTel(3, 8, true)();
    await l.wacht(600);
    await getalvraag(
      l,
      {
        vraag: ["Deze groep is wat kleiner dan de andere.", "Hoeveel sterren zitten erin?"],
        lijst: [5, 7, 8],
        goed: 8,
        bijGoed: ["Ja, {8}."],
        hint: () => ["Tel per rijtje van twee.", "{2}, {4}, …"],
        antwoord: ["Tel maar mee: {2}, {4}, {6}, {8}.", "Er zitten {8} sterren in."],
        klaarzetten: zetTel(3, 8, true),
      },
      later,
    );
    k.zet({ omlijnLos: false });
    await getalvraag(
      l,
      {
        vraag: ["We hebben dus {3} tientallen.", "En {8} eenheden.", "Hoeveel is dat samen?"],
        lijst: [37, 38, 48, 83],
        goed: 38,
        bijGoed: ["Ja!", "Je kunt al flink grote getallen tellen."],
        hint: (x) => (x === 83 ? ["Kijk goed.", "Eerst de tientallen: {30}.", "Dan de eenheden erbij."] : ["Tel eerst de groepen: {10}, {20}, {30}.", "Dan de {8} losse sterren erbij."]),
        antwoord: ["{3} tientallen is {30}.", "En {8} erbij is {38}."],
        klaarzetten: zetTel(3, 8),
      },
      later,
    );
    await l.zeg("Nu gaan we met deze sterren rekenen.");
    await l.verder();

    /* 2. Aanvullen tot het volgende tiental, met sterren. */
    const rondes: { a: number; doel: number; lijst: number[]; goed: string }[] = [
      { a: 17, doel: 20, lijst: [7, 16, 17], goed: "Helemaal goed." },
      { a: 24, doel: 30, lijst: [4, 23, 24], goed: "Precies." },
      { a: 32, doel: 40, lijst: [2, 31, 32], goed: "Goed." },
    ];
    const rondeMet = async (r: { a: number; doel: number; lijst: number[]; goed: string }, i: number) => {
      zetTel(Math.floor(r.a / 10), r.a % 10)();
      await l.wacht(400);
      await getalvraag(
        l,
        {
          vraag: [i === 0 ? "We beginnen met deze." : "Oké.", "Hoeveel sterren staan er nu?"],
          lijst: r.lijst,
          goed: r.a,
          bijGoed: [i === 0 ? "Goed." : i === 1 ? "Ja." : "Precies.", `{${r.a}} sterren.`],
          hint: () => ["Tel eerst de volle groepen.", "Dan de losse sterren erbij."],
          antwoord: [groepenZin(r.a), `Dat is {${r.a}}.`],
          klaarzetten: zetTel(Math.floor(r.a / 10), r.a % 10),
        },
        later,
      );
      await sterAanvullen(l, k, r.a, r.doel, { eerste: i === 0, later });
      await l.zeg(r.goed, `{${r.a}} plus {${r.doel - r.a}} is {${r.doel}}.`);
      await l.wacht(900);
      l.som(null);
    };
    for (const [i, r] of rondes.entries()) await rondeMet(r, i);

    /* 3. Zonder sterren (het kind kiest zelf). */
    k.zet({ palet: false });
    await l.zeg(l.naam ? `Je hebt hier echt aanleg voor, ${l.naam}.` : "Je hebt hier echt aanleg voor.", "Zullen we er een paar *zonder* sterren doen?");
    testHaak({ antwoord: null, vraagId: Math.random() });
    const zonder = await l.kies(["Ja", "Nee"]);
    if (zonder === "Ja") {
      await l.zeg("Mooi.", "Ik zet het voor je klaar.");
      await sterAanvullenZonder(l, k, 23, 30, "Goed.", later);
      await sterAanvullenZonder(l, k, 36, 40, "Klopt.", later);
      await l.zeg("Oké, nog één.");
      await sterAanvullenZonder(l, k, 41, 50, "Goed zo.", later);
      await l.zeg(l.naam ? `Knap gedaan, ${l.naam}.` : "Knap gedaan.", "Dit waren moeilijke vragen.");
    } else {
      await l.zeg(zonder === null ? "Geen zorgen." : "Prima.", "Dan doen we er nog twee met sterren.");
      await rondeMet({ a: 26, doel: 30, lijst: [6, 25, 26], goed: "Goed." }, 1);
      await rondeMet({ a: 18, doel: 20, lijst: [8, 17, 18], goed: "Goed zo." }, 2);
    }
    l.som(null);
    await speelLater(l, later);
    l.som(null);

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
    const m = maakOudeMachine(l, { tienen: 0, enen: 0, knop: 10, wijs: true });
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

