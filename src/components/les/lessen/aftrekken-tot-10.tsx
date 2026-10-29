/**
 * Lessen van "Aftrekken tot 10", naar de Synthesis-unit "Subtract Within 10"
 * (INSPIRATIE.md, ronde 1, 2 en 3). Groep 3.
 *
 * 1. Instaptoets (A1): vuurvliegjes in het potje en laten wegvliegen, welke
 *    som, hoeveel blijven er over, hoeveel moeten er nog weg; daarna het
 *    verschil tussen twee lantaarnpalen; en nog negen korte toetsvragen.
 * 2. Vuurvliegjes laten wegvliegen (A2, "Dot Destruction"): aftrekken als
 *    weghalen met het potje.
 * 3. Het verschil (A3, "Difference Dimension"): twee lantaarnpalen tegen
 *    elkaar schuiven; lampjes op dezelfde hoogte gaan tegen elkaar uit, wat
 *    blijft branden is het verschil.
 * 4. Eindtoets (A7): als de instaptoets, met andere getallen.
 * 5. Hetzelfde verschil (groep 3-deel van "Subtraction Strategies · Same
 *    Difference"): de gekoppelde plus- en minknop, en 12 = 10 + 2.
 *
 * Lessen 1–4 in Phaser (27 oktober 2026, HARDE REGEL 7; LESSENPLAN.md § 2.4):
 * vlakken ../vlakken/aftrekken-holo-potje.tsx en aftrekken-holo-palen.tsx
 * (hologrammen in de wereld Aarde). Les 5 gebruikt nog de torens
 * (../vlakken/aftrekken-torens.tsx); de stippenmachine
 * (../vlakken/aftrekken-stippen.tsx) blijft ook bestaan.
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { AftrekkenTorens, ORANJE, PAARS, type TorensProps } from "../vlakken/aftrekken-torens";
import { AftrekkenHoloPotje, type PotjeProps } from "../vlakken/aftrekken-holo-potje";
import { knoppenOpPlek } from "./antwoordknoppen";
import { AftrekkenHoloPalen, ORANJE_LAMP, PAARS_LAMP, type PalenProps } from "../vlakken/aftrekken-holo-palen";

/* ---------- algemeen ---------- */

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** "9 − 4" wordt "{9} − {4}": de getallen krijgen hun kleur. */
function kleur(som: string): string {
  return som.replace(/\d+/g, "{$&}");
}

/** De som bovenaan: getallen en tekens, "?" wordt een vakje. */
function somDelen(som: string): Somdeel[] {
  return som.split(" ").map((d): Somdeel => {
    if (d === "?") return { t: "vak" };
    if (/^\d+$/.test(d)) return { t: "getal", n: Number(d) };
    return { t: "teken", s: d };
  });
}

/** Een getal typen; bij de eerste fout `hulp`, daarna het antwoord. Geeft terug of het meteen goed was. */
async function vraagGetal(
  l: Lesgids,
  goed: number,
  opties: { fout: (x: number) => string[]; weetNiet?: string[]; antwoord: string[] },
): Promise<boolean> {
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x === goed) return poging === 0;
    if (poging >= 1) {
      await l.zeg(...opties.antwoord);
      await l.verder();
      return false;
    }
    await l.zeg(...(x === null ? (opties.weetNiet ?? ["Geen zorgen.", ...opties.fout(-1).slice(-1)]) : opties.fout(x)));
  }
}

/**
 * Een keuzevraag in een toets: een foute keuze komt terug als vraag
 * ("{9} − {4}?") en verdwijnt; daarna nog één keer kiezen.
 */
async function toetsKeuze(l: Lesgids, opties: string[], goed: string, opnieuw: string[], antwoord: string[]): Promise<boolean> {
  let over = schud(opties);
  for (let poging = 0; ; poging++) {
    const k = await l.kies(over);
    if (k === goed) {
      /* Bij de tweede poging goed: eerst even bevestigen, anders gaat de les zonder reactie verder. */
      if (poging > 0) await l.zeg("Ja, goed zo.");
      return poging === 0;
    }
    if (poging >= 1) {
      await l.zeg(...antwoord);
      await l.verder();
      return false;
    }
    if (k === null) {
      await l.zeg("Geen zorgen.", ...opnieuw);
    } else {
      over = over.filter((o) => o !== k);
      await l.zeg(`${kleur(k)}?`, "Probeer die nog eens.", ...opnieuw);
    }
  }
}

/* ---------- de torens ---------- */

type Torenmelding = { soort: string; links: number; rechts: number; kant?: "links" | "rechts" };

function torens(l: Lesgids) {
  let zet = 0;
  return {
    toon(p: Omit<TorensProps, "zet">) {
      zet++;
      l.vlak<TorensProps>(AftrekkenTorens, { ...p, zet });
    },
    /** Nieuwe hoogtes neerzetten (ook na een botsing). */
    zet(links: number, rechts: number, extra: Partial<TorensProps> = {}) {
      zet++;
      l.pasVlakAan<TorensProps>({ ...extra, links, rechts, zet });
    },
    pas(p: Partial<TorensProps>) {
      l.pasVlakAan<TorensProps>(p);
    },
    /** Het kind tikt tot de toren aan `kant` `doel` hoog is (het stopt vanzelf). */
    async bouwTot(kant: "links" | "rechts", doel: number, vanaf: number) {
      if (vanaf === doel) return;
      const omhoog = doel > vanaf;
      l.pasVlakAan<TorensProps>({
        ufo: omhoog ? { [kant]: true } : {},
        straal: omhoog ? {} : { [kant]: true },
        max: { [kant]: doel },
      });
      for (;;) {
        const g = await l.wachtOpVlak<Torenmelding>(["erbij", "eraf"]);
        if (g[kant] === doel) break;
      }
      l.pasVlakAan<TorensProps>({ ufo: {}, straal: {}, max: {} });
    },
    /** Het kind tikt op de gekoppelde knop tot de oranje toren `doel` hoog is. */
    async knoopTot(doel: number, vanaf: number) {
      if (vanaf === doel) return;
      l.pasVlakAan<TorensProps>({ knoopAan: true, knoopTot: doel });
      for (;;) {
        const g = await l.wachtOpVlak<Torenmelding>("knoop");
        if (g.links === doel) break;
      }
      l.pasVlakAan<TorensProps>({ knoopAan: false, knoopTot: null });
    },
    /** De schuif aanzetten en wachten tot de torens gebotst zijn. */
    async bots() {
      l.pasVlakAan<TorensProps>({ schuif: true, ufo: {}, straal: {}, knoppen: null });
      await l.wachtOpVlak("gebotst");
    },
  };
}

/* ---------- kaarttekeningen ---------- */

function KaartBliksem() {
  const stippen = [
    [62, 52],
    [182, 52],
    [44, 112],
    [200, 112],
    [80, 160],
    [164, 160],
    [122, 30],
  ];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {stippen.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="17" stroke="#7d8cf5" strokeWidth="3.2" />
      ))}
      <path d="M130 62 104 102h18l-8 34 30-44h-18z" stroke="#f2c94c" strokeWidth="3.4" />
    </g>
  );
}

function KaartTorens() {
  const blok = (x: number, y: number, k: string, i: number) => (
    <rect key={`${k}${i}`} x={x} y={y} width="46" height="22" rx="4" stroke={k} strokeWidth="3" fill="none" transform={`rotate(${i % 2 ? 2 : -2} ${x + 23} ${y + 11})`} />
  );
  const schip = (x: number, k: string) => (
    <g stroke={k} strokeWidth="3" fill="none">
      <ellipse cx={x} cy="34" rx="12" ry="9" />
      <ellipse cx={x} cy="44" rx="32" ry="8" />
    </g>
  );
  return (
    <g strokeLinejoin="round">
      {schip(72, ORANJE)}
      {schip(172, PAARS)}
      {[0, 1, 2, 3, 4].map((i) => blok(49, 154 - i * 26, ORANJE, i))}
      {[0, 1].map((i) => blok(149, 154 - i * 26, PAARS, i))}
    </g>
  );
}

/** Twee ruimteschepen met de plus- en de minknop ertussen (Hetzelfde verschil). */
function KaartKnoop() {
  const schip = (x: number, k: string) => (
    <g stroke={k} strokeWidth="3" fill="none">
      <ellipse cx={x} cy="70" rx="13" ry="10" />
      <ellipse cx={x} cy="82" rx="36" ry="9" />
    </g>
  );
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {schip(46, ORANJE)}
      {schip(198, PAARS)}
      <circle cx="122" cy="58" r="20" stroke="#e08bd0" strokeWidth="3.2" fill="none" />
      <path d="M122 48v20M112 58h20" stroke="#ffffff" strokeWidth="3.2" />
      <circle cx="122" cy="128" r="20" stroke="#e08bd0" strokeWidth="3.2" fill="none" />
      <path d="M112 128h20" stroke="#ffffff" strokeWidth="3.2" />
      <path d="M86 82h14M144 82h14" stroke="#d6dbe8" strokeWidth="2.4" strokeDasharray="2 5" />
    </g>
  );
}

/* ---------- de eerste keer: Bliepo wijst de knoppen aan (groep 3 leest nog niet) ---------- */

/**
 * Een gids die de eerste keer in de les de knoppen van het lesscherm
 * aanwijst en zegt wat ze doen (ONTWERPREGELS.md "Groep 3: kinderen die nog
 * niet lezen"): de pijl, het vinkje en het vraagteken. `wijs` doet hetzelfde
 * voor de knoppen in het vlak (met hun `data-knop`), ook maar één keer.
 * Ook gebruikt in ./getallenlijn.tsx (A8, A9).
 */
export function metAanwijzen(l: Lesgids): Lesgids & { wijs: (knop: string, ...zinnen: string[]) => Promise<void> } {
  const gezien = new Set<string>();
  const wijs = async (knop: string, ...zinnen: string[]) => {
    if (gezien.has(knop)) return;
    gezien.add(knop);
    await l.wijsAan(knop, ...zinnen);
  };
  return {
    ...l,
    wijs,
    getal: async () => {
      const p = l.getal();
      /* Stopt de les voordat `p` wordt teruggegeven, dan is dit geen onafgehandelde fout. */
      p.catch(() => {});
      await wijs("controleer", "Typ je antwoord in het vakje.", "Tik dan op het vinkje.");
      await wijs("weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
      return p;
    },
    kies: async (opties) => {
      const p = l.kies(opties);
      /* Stopt de les voordat `p` wordt teruggegeven, dan is dit geen onafgehandelde fout. */
      p.catch(() => {});
      /*
        Alleen bij keuzes zonder woorden: een keuze met een woord leest Bliepo
        voor als het kind erop tikt, en die stem breekt het aanwijzen af,
        waarna de les blijft hangen. Het vraagteken wordt dan bij het eerste
        invulvak aangewezen.
      */
      if (!opties.some((o) => /[a-z]/i.test(o))) await wijs("weetniet", "Weet je het niet?", "Tik dan op het vraagteken.");
      return p;
    },
    verder: async () => {
      const p = l.verder();
      /* Stopt de les voordat `p` wordt teruggegeven, dan is dit geen onafgehandelde fout. */
      p.catch(() => {});
      await wijs("verder", "Tik op de pijl als je verder wilt.");
      return p;
    },
    somVak: async (index) => {
      const p = l.somVak(index);
      /* Stopt de les voordat `p` wordt teruggegeven, dan is dit geen onafgehandelde fout. */
      p.catch(() => {});
      await wijs("controleer", "Typ je antwoord in het vakje.", "Tik dan op het vinkje.");
      return p;
    },
  };
}

/* ---------- het potje met vuurvliegjes (A1, A2, A7) ---------- */

type Potjemelding = { soort: string; aantal: number };

/** Bedient het potje vanuit het draaiboek (zelfde gebruik als de oude stippenmachine). */
function potje(l: Lesgids) {
  let zet = 0;
  return {
    toon(p: Omit<PotjeProps, "zet">) {
      zet++;
      l.vlak<PotjeProps>(AftrekkenHoloPotje, { ...p, zet });
    },
    /** Een nieuw aantal vuurvliegjes neerzetten. */
    zet(aantal: number, extra: Partial<PotjeProps> = {}) {
      zet++;
      l.pasVlakAan<PotjeProps>({ ...extra, aantal, zet });
    },
    pas(p: Partial<PotjeProps>) {
      l.pasVlakAan<PotjeProps>(p);
    },
    /** Het kind tikt op de plusknop tot er `doel` vuurvliegjes zijn. */
    async plusTot(doel: number) {
      l.pasVlakAan<PotjeProps>({ plus: "aan", plusTot: doel });
      for (;;) {
        const g = await l.wachtOpVlak<Potjemelding>("plus");
        if (g.aantal >= doel) break;
      }
      l.pasVlakAan<PotjeProps>({ plus: "dof", plusTot: 20 });
    },
    /** Het kind laat vuurvliegjes wegvliegen tot er nog `doel` zijn. */
    async wegTot(doel: number) {
      l.pasVlakAan<PotjeProps>({ zapper: "aan", zapTot: doel });
      for (;;) {
        const g = await l.wachtOpVlak<Potjemelding>("zap");
        if (g.aantal <= doel) break;
      }
      l.pasVlakAan<PotjeProps>({ zapper: "dof", zapTot: 0 });
    },
  };
}

/* ---------- de twee lantaarnpalen (A1, A3, A7) ---------- */

type Paalmelding = { soort: string; links: number; rechts: number; kant?: "links" | "rechts" };

function palen(l: Lesgids) {
  let zet = 0;
  return {
    toon(p: Omit<PalenProps, "zet">) {
      zet++;
      l.vlak<PalenProps>(AftrekkenHoloPalen, { ...p, zet });
    },
    /** Nieuwe hoogtes neerzetten (ook na het tegen elkaar schuiven). */
    zet(links: number, rechts: number, extra: Partial<PalenProps> = {}) {
      zet++;
      l.pasVlakAan<PalenProps>({ ...extra, links, rechts, zet });
    },
    pas(p: Partial<PalenProps>) {
      l.pasVlakAan<PalenProps>(p);
    },
    /** Het kind tikt tot de paal aan `kant` `doel` lampjes heeft (het stopt vanzelf). */
    async bouwTot(kant: "links" | "rechts", doel: number, vanaf: number) {
      if (vanaf === doel) return;
      const omhoog = doel > vanaf;
      l.pasVlakAan<PalenProps>({
        erbij: omhoog ? { [kant]: true } : {},
        eraf: omhoog ? {} : { [kant]: true },
        max: { [kant]: doel },
      });
      for (;;) {
        const g = await l.wachtOpVlak<Paalmelding>(["erbij", "eraf"]);
        if (g[kant] === doel) break;
      }
      l.pasVlakAan<PalenProps>({ erbij: {}, eraf: {}, max: {} });
    },
    /** De schuif aanzetten en wachten tot de palen tegen elkaar geschoven zijn. */
    async bots() {
      l.pasVlakAan<PalenProps>({ schuif: true, erbij: {}, eraf: {}, knoppen: null });
      await l.wachtOpVlak("gebotst");
    },
  };
}

/* ---------- kaarttekeningen (Bliepo-stijl: vuurvliegjes, potje, lantaarnpalen) ---------- */

/** Een potje met vuurvliegjes, en eentje dat wegvliegt. */
function KaartPotje() {
  const vlieg = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <ellipse cx={x - 7} cy={y - 9} rx="7" ry="4.5" stroke="#cfe9ff" strokeWidth="2" fill="none" />
      <ellipse cx={x + 7} cy={y - 9} rx="7" ry="4.5" stroke="#cfe9ff" strokeWidth="2" fill="none" />
      <circle cx={x} cy={y} r="8" fill="#f2f79a" stroke="#c9d84a" strokeWidth="2" />
    </g>
  );
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M78 52 Q50 56 50 80 L50 164 Q50 178 64 178 L146 178 Q160 178 160 164 L160 80 Q160 56 132 52 Z" stroke="#f2c94c" strokeWidth="3.4" />
      <rect x="72" y="34" width="66" height="16" rx="5" stroke="#f2c94c" strokeWidth="3.2" />
      {[
        [82, 96],
        [126, 104],
        [96, 140],
        [134, 150],
      ].map(([x, y]) => vlieg(x, y))}
      {vlieg(204, 48)}
      <path d="M176 82 196 60" stroke="#f2c94c" strokeWidth="2.6" strokeDasharray="3 6" />
    </g>
  );
}

/** Twee lantaarnpalen met lampjes. */
function KaartPalen() {
  const paal = (x: number, kleur: string, n: number) => (
    <g key={x}>
      <path d={`M${x - 16} 34 L${x} 20 L${x + 16} 34 Z`} stroke={kleur} strokeWidth="3" />
      <line x1={x} y1="36" x2={x} y2="176" stroke="#d6dbe8" strokeWidth="2.4" />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x} cy={164 - i * 24} r="9" fill={kleur} />
      ))}
    </g>
  );
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {paal(82, ORANJE_LAMP, 5)}
      {paal(162, PAARS_LAMP, 2)}
    </g>
  );
}

/* De oude kaarttekeningen (ruimteschepen, bliksem) blijven bestaan; de Phaser-lessen gebruiken de nieuwe. */
export { KaartBliksem, KaartTorens };

/* ---------- de toets (instap en eind) ---------- */

type Toetsgetallen = {
  vliegjes: number;
  weg: number;
  keuzes: string[];
  oranje: number;
  paars: number;
  verschilKeuzes: string[];
  overgang: boolean;
  /** Nog meer toetsvragen, zodat het er minstens 15 zijn: weghalen (a − b) en het verschil tussen twee palen. */
  weghalen: [number, number][];
  verschillen: [number, number][];
};

/**
 * Een toetsvraag met een getal (LESSENPLAN.md A1 en A7): 1× fout = de som
 * met jouw antwoord en een vraagteken, "laten we nog eens kijken" en dezelfde
 * vraag anders gezegd; 2× fout = het antwoord, en "dat leren we samen in de
 * les"; weet ik niet = "geen probleem, we leren het samen" en het antwoord.
 * Geeft terug of het meteen goed was.
 */
async function toetsGetal(l: Lesgids, goed: number, foutSom: (x: number) => string, anders: string[], antwoord: string[]): Promise<boolean> {
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x === goed) {
      if (poging > 0) await l.zeg("Ja, goed zo.");
      return poging === 0;
    }
    if (x === null) {
      await l.zeg("Geen probleem, we leren het samen.", ...antwoord);
      await l.verder();
      return false;
    }
    if (poging >= 1) {
      await l.zeg(...antwoord, "Dat leren we samen in de les.");
      await l.verder();
      return false;
    }
    await l.zeg(`${foutSom(x)}?`, "Laten we nog eens kijken.", ...anders);
  }
}

async function toets(ruw: Lesgids, t: Toetsgetallen) {
  const l = metAanwijzen(ruw);
  const over = t.vliegjes - t.weg;
  const m = potje(l);
  let goed = 0;
  let vragen = 0;
  const tel = (ok: boolean) => {
    vragen++;
    if (ok) goed++;
  };

  /* Begin: de som groot in beeld. */
  m.toon({ aantal: 0, plus: "weg", zapper: "weg", teller: false });
  l.som(somDelen(`${t.vliegjes} − ${t.weg} = ?`));
  await l.zeg("We gaan minsommen leren.", "Kun je dat al?");
  const al = await l.kies(["Ja", "Nee"]);
  await l.zeg(al === "Ja" ? "Oké." : "Geen probleem.", al === "Ja" ? "Laat maar zien wat je kunt." : "We kijken eerst wat je al weet.");
  l.som(null);

  /* Vuurvliegjes in het potje. */
  /* Het wachten begint al, zodat een tik terwijl Bliepo praat ook telt. */
  m.pas({ teller: true });
  const erin = m.plusTot(t.vliegjes);
  await l.wijs("erbij", "Zie je de plusknop rechts?", "Daarmee vliegt er een vuurvliegje in het potje.");
  await l.zeg(`Tik erop tot er {${t.vliegjes}} vuurvliegjes zijn.`);
  await erin;
  m.pas({ zapper: "dof" });
  await l.zeg("Goed zo.", `Er zitten {${t.vliegjes}} vuurvliegjes in het potje.`);
  await l.verder();

  /* Laten wegvliegen. */
  const eruit = m.wegTot(over);
  await l.wijs("wegvliegen", "Nu halen we er vuurvliegjes af.", "Met deze knop vliegt er een weg.");
  await l.zeg(`Laat er {${t.weg}} wegvliegen.`);
  await eruit;

  /* Welke som? */
  const goedeSom = `${t.vliegjes} − ${t.weg}`;
  await l.zeg(`We hadden {${t.vliegjes}} vuurvliegjes.`, `Er vlogen er {${t.weg}} weg.`, "Welke som past daarbij?");
  const meteen = await toetsKeuze(
    l,
    t.keuzes,
    goedeSom,
    [`Je begon met {${t.vliegjes}}.`, `Er vlogen er {${t.weg}} weg.`, "Welke som laat dat zien?"],
    [`Het is {${t.vliegjes}} − {${t.weg}}.`, `Je begon met {${t.vliegjes}} en er vlogen er {${t.weg}} weg.`],
  );
  tel(meteen);
  if (meteen) await l.zeg("Precies.", `${kleur(goedeSom)}.`);

  /* Hoeveel blijven er over? */
  l.som(somDelen(`${goedeSom} = ?`));
  await l.zeg("Kun je deze uitrekenen?", `Hoeveel is ${kleur(goedeSom)}?`);
  const somGoed = await toetsGetal(
    l,
    over,
    (x) => `${kleur(goedeSom)} = {${x}}`,
    ["Hoeveel vuurvliegjes zitten er nog in het potje?"],
    [`Er zitten nog {${over}} vuurvliegjes in het potje.`, `Dus ${kleur(goedeSom)} = {${over}}.`],
  );
  tel(somGoed);
  l.som(somDelen(`${goedeSom} = ${over}`));
  if (somGoed) await l.zeg("Juist.", `${kleur(goedeSom)} = {${over}}.`);
  await l.wacht(500);
  l.som(null);

  /* Hoeveel moeten er nog weg tot 0? */
  await l.zeg(`Hoeveel van deze {${over}} vuurvliegjes moeten er nog weg?`, "Er mogen er geen overblijven.");
  let nulGoed = false;
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x === over) {
      l.som(somDelen(`${over} − ${over} = 0`));
      await l.zeg(poging === 0 ? "Juist." : "Ja, goed zo.", `{${over}} − {${over}} = {0}.`);
      nulGoed = poging === 0;
      break;
    }
    if (poging === 0 && x !== null) {
      /* Zoals Synthesis: de som met het antwoord van het kind en een vraagteken; de wegvliegknop licht op. */
      l.som([...somDelen(`${over} − ${over} = ${x}`), { t: "teken", s: "?" }]);
      m.pas({ cirkel: "zapper" });
      await l.zeg(`{${over}} − {${over}} = {${x}}?`, "Laten we nog eens kijken.", `Hoeveel van deze {${over}} vuurvliegjes moeten er weg?`);
      m.pas({ cirkel: null });
      l.som(null);
      continue;
    }
    l.som(null);
    m.zet(over, { zapper: "dof" });
    await l.zeg(x === null ? "Geen probleem, we leren het samen." : "We doen het samen.", "Laat ze allemaal wegvliegen.");
    await m.wegTot(0);
    l.som(somDelen(`${over} − ${over} = 0`));
    await l.zeg(`Er vlogen er {${over}} weg.`, `{${over}} − {${over}} = {0}.`);
    await l.verder();
    break;
  }
  tel(nulGoed);
  m.zet(0, { zapper: "weg", plus: "weg", teller: false });
  await l.wacht(600);
  l.som(null);

  /* Het verschil tussen twee lantaarnpalen. */
  const p = palen(l);
  p.toon({ links: t.oranje, rechts: 0, binnen: true, cijfers: true });
  if (t.overgang) {
    await l.zeg("Laten we op een andere manier over aftrekken nadenken.");
    await l.verder();
  }
  const bouw = p.bouwTot("rechts", t.paars, 0);
  await l.wijs("erbij-rechts", "Zie je de plus bij de paarse paal?", "Daarmee gaat er een lampje aan.");
  await l.zeg(`Geef de paarse paal {${t.paars}} lampjes.`);
  await bouw;
  const verschil = t.oranje - t.paars;
  await l.zeg("Wat is het verschil tussen de palen?", `Tussen {${t.oranje}} en {${t.paars}}?`);
  const vGoed = await toetsGetal(
    l,
    verschil,
    (x) => `{${t.oranje}} − {${t.paars}} = {${x}}`,
    ["Hoeveel lampjes heeft de oranje paal meer dan de paarse?"],
    [`De oranje paal heeft {${verschil}} lampjes meer.`, `Het verschil is {${verschil}}.`],
  );
  tel(vGoed);
  if (vGoed) await l.zeg("Ja.", `Een verschil van {${verschil}}.`);

  const goedeVerschilSom = `${t.oranje} − ${t.paars} = ${verschil}`;
  await l.zeg("Hoe schrijf je dat verschil als som?");
  const sGoed = await toetsKeuze(
    l,
    t.verschilKeuzes,
    goedeVerschilSom,
    ["Het verschil is een minsom.", "Welke som past bij de palen?"],
    [`Het is ${kleur(goedeVerschilSom)}.`, "De grootste paal min de kleinste paal."],
  );
  tel(sGoed);
  if (sGoed) await l.zeg("Heel goed gezien.", `${kleur(goedeVerschilSom)}.`);
  await l.verder();

  /* Nog meer toetsvragen: in je hoofd weghalen (het potje mag helpen). */
  await l.zeg("Nog een paar minsommen.", "Bij elke som zie je de vuurvliegjes.");
  m.toon({ aantal: 0, plus: "weg", zapper: "weg", teller: true });
  for (const [a, b] of t.weghalen) {
    m.zet(a, { plus: "weg", zapper: "aan", zapTot: a - b, teller: true });
    l.som(somDelen(`${a} − ${b} = ?`));
    await l.zeg(`Hoeveel is {${a}} − {${b}}?`);
    const ok = await toetsGetal(
      l,
      a - b,
      (x) => `{${a}} − {${b}} = {${x}}`,
      [`Er zijn {${a}} vuurvliegjes.`, `Er vliegen er {${b}} weg.`, "Hoeveel blijven er over?"],
      [`{${a}} − {${b}} = {${a - b}}.`],
    );
    tel(ok);
    l.som(somDelen(`${a} − ${b} = ${a - b}`));
    if (ok) await l.zeg("Klopt.");
    await l.wacht(400);
  }
  l.som(null);

  /* En het verschil tussen twee palen. */
  p.toon({ links: 0, rechts: 0, cijfers: true });
  await l.zeg("Nu nog het verschil tussen twee palen.");
  for (const [a, b] of t.verschillen) {
    p.zet(a, b, { cijfers: true });
    const groot = Math.max(a, b);
    const klein = Math.min(a, b);
    await l.zeg(`Wat is het verschil tussen {${a}} en {${b}}?`);
    const ok = await toetsGetal(
      l,
      groot - klein,
      (x) => `{${groot}} − {${klein}} = {${x}}`,
      [`Hoeveel lampjes heeft de ${a > b ? "oranje" : "paarse"} paal meer?`],
      [`Het verschil is {${groot - klein}}.`],
    );
    tel(ok);
    if (ok) await l.zeg("Precies.");
  }

  /* De kaart. */
  l.vlak(null);
  const tik = l.kaart();
  await l.zeg(
    l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!",
    goed >= vragen - 2 ? "Je kunt minsommen maken onder de {10}." : "Een paar sommen leren we nog samen in de lessen.",
    "Tik op de kaart om hem af te vinken.",
  );
  await tik;
}

/* ---------- les 1: instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "aftrekken-10-instaptoets",
  titel: "Instaptoets: aftrekken tot 10",
  synthesis: "Subtract Within 10 · Assessment",
  kaarttekening: KaartPotje,
  async speel(l) {
    await toets(l, {
      vliegjes: 9,
      weg: 5,
      keuzes: ["9 − 5", "5 − 9", "9 − 4", "9 + 5"],
      oranje: 8,
      paars: 5,
      verschilKeuzes: ["3 − 5 = 8", "8 − 5 = 3", "3 − 5 = 3", "5 − 8 = 3"],
      overgang: false,
      weghalen: [
        [7, 3],
        [10, 6],
        [6, 6],
        [9, 2],
        [8, 5],
      ],
      verschillen: [
        [7, 4],
        [3, 9],
        [10, 8],
        [6, 1],
        [2, 7],
      ],
    });
  },
};


/* ---------- les 2: vuurvliegjes laten wegvliegen (weghalen) ---------- */

const vuurvliegjesWeghalen: Lesdraaiboek = {
  id: "aftrekken-10-stippen-weghalen",
  titel: "Vuurvliegjes laten wegvliegen",
  synthesis: "Subtract Within 10 · Dot Destruction",
  kaarttekening: KaartPotje,

  async speel(ruw) {
    const l = metAanwijzen(ruw);
    const m = potje(l);
    m.toon({ aantal: 0, plus: "dof", zapper: "weg", teller: true });

    /* 1. Even kennismaken. */
    await l.zeg("Voor we beginnen, even een vraag.", "Heb je al eens minsommen gemaakt?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "Dit potje helpt ons.", "Ik laat zien wat het doet.");
    await l.verder();

    /* 2. De plusknop en het getal. */
    m.pas({ cirkel: "plus" });
    const een = m.plusTot(1);
    await l.wijs("erbij", "Tik op de plusknop rechts.");
    await een;
    m.pas({ cirkel: "teller" });
    await l.zeg("Kijk, er vloog een vuurvliegje in het potje.", "Kijk hier.", "Dit getal zegt hoeveel vuurvliegjes er zijn.");
    await l.verder();
    m.pas({ cirkel: null });

    await l.zeg("Doe er nog wat vuurvliegjes bij.", "Kijk wat er met het getal gebeurt.");
    await m.plusTot(3);
    m.pas({ cirkel: "teller" });
    await l.zeg("Mooi.", "Wat gebeurt er met het getal als er een vuurvliegje bij komt?");
    const hoger = await l.kies(["Hoger", "Lager"]);
    m.pas({ cirkel: null });
    if (hoger === "Hoger") {
      await l.zeg("Ja!", "Elk vuurvliegje erbij maakt het getal hoger.");
      await l.verder();
    } else {
      await l.zeg(hoger === null ? "Geen zorgen." : "Dat is niet wat ik zie.", "Ik maak het potje leeg.", "We doen het stap voor stap.");
      await l.verder();
      m.zet(0, { cirkel: "teller" });
      await l.zeg("Er zijn geen vuurvliegjes.", "Het getal is nu {0}.");
      await l.verder();
      await l.zeg("Doe er één vuurvliegje bij.", "Kijk naar het getal.");
      await m.plusTot(1);
      await l.zeg("We hadden {0}.", "Nu hebben we er {1}.", "Het getal is hoger geworden.");
      await l.verder();
      await l.zeg("Wordt het steeds hoger als je blijft tikken?");
      const steeds = await l.kies(["Ja", "Nee"]);
      await l.zeg(steeds === "Ja" ? "Dat gaan we zien." : "We proberen het.", "Doe er nog een vuurvliegje bij.");
      await m.plusTot(2);
      await l.zeg("Kijk, nu is het {2}.", "Elk vuurvliegje erbij maakt het getal hoger.");
      await l.verder();
      m.pas({ cirkel: null });
    }

    /* 3. Dat is een plussom. */
    await l.zeg("Welke som maak je met deze knop?");
    const doe = await l.kies(["Plussom", "Minsom"]);
    if (doe === "Plussom") {
      await l.zeg("Ja, zo simpel is het.", "Je doet er vuurvliegjes bij.");
    } else {
      await l.zeg(doe === null ? "Geen zorgen." : "Kijk goed.", "Er komt steeds een vuurvliegje *bij*.", "Dat is een plussom.");
    }
    await l.verder();

    /* 4. Optellen met het potje. */
    m.zet(2);
    await l.zeg("Er zitten nu {2} vuurvliegjes in het potje.", "Hoeveel zijn het er als er {3} bij komen?");
    for (let poging = 0; ; poging++) {
      const x = await l.getal();
      if (x === 5) {
        await l.zeg("Dat klopt.", "Doe ze er maar bij.");
        await m.plusTot(5);
        break;
      }
      if (x !== null && poging === 0) {
        await l.zeg(`Hmm, {2} en {3} is samen iets ${x < 5 ? "meer" : "minder"} dan {${x}}.`, "Probeer het nog eens.");
        continue;
      }
      await l.zeg(x === null ? "Geen zorgen." : "We doen het samen.", "Doe er {3} vuurvliegjes bij.");
      await m.plusTot(5);
      await l.zeg("Nu zijn er {5}.", "{2} + {3} = {5}.");
      await l.verder();
      break;
    }
    await l.zeg("Oké, nog eentje.", "Deze is best leuk.");
    await l.verder();

    m.zet(0);
    l.som(somDelen("1 + 2 + 3 + 4"));
    await l.zeg("Hoeveel is {1} + {2} + {3} + {4}?");
    const vier = await l.getal();
    if (vier === 10) {
      m.zet(10);
      await l.zeg("Knap!", "Het is {10}.");
      await l.verder();
    } else {
      await l.zeg(vier === null ? "Geen zorgen." : "Dit is een lastige.", "Ik laat het je zien.");
      await l.verder();
      await l.zeg("Doe er eerst {1} vuurvliegje bij.");
      await m.plusTot(1);
      await l.zeg("Nu {2} erbij.");
      await m.plusTot(3);
      await l.zeg("Dan {3} erbij.");
      await m.plusTot(6);
      await l.zeg("En nog {4}.");
      await m.plusTot(10);
      await l.zeg("Mooi zo.", "Hoeveel vuurvliegjes zijn er nu?");
      await vraagGetal(l, 10, {
        fout: () => ["Kijk naar het getal in het lantaarntje."],
        antwoord: ["Het zijn er {10}.", "{1} + {2} + {3} + {4} = {10}."],
      });
    }
    l.som(null);

    /* 5. Aftrekken = laten wegvliegen. */
    await l.zeg("Het potje helpt ook bij minsommen.", "Hoe maak je met vuurvliegjes een minsom?");
    const hoe = await l.kies(["Erbij doen", "Weg laten vliegen"]);
    if (hoe === "Weg laten vliegen") {
      await l.zeg("Precies.", "Dat gaan we nu doen.");
    } else {
      await l.zeg(hoe === null ? "Geen zorgen." : "Erbij doen is een plussom.", "Bij een minsom gaan er vuurvliegjes weg.");
      await l.verder();
    }
    m.pas({ cirkel: "zapper" });
    const weg1 = m.wegTot(9);
    await l.wijs("wegvliegen", "Zie je deze knop?", "Daarmee vliegt er een vuurvliegje weg.");
    await l.zeg("Laat er één wegvliegen.");
    await weg1;
    m.pas({ cirkel: null });
    await l.zeg("Mooi.", "Zie je dat het minder wordt?", "Het getal ging van {10} naar {9}.");
    await l.verder();

    /* 6. Het minteken. */
    await l.zeg("Bij een plussom hoort het plusteken.", "Welk teken hoort bij een minsom?");
    let tekens = ["+", "÷", "−"];
    for (let poging = 0; ; poging++) {
      const t = await l.kies(tekens);
      if (t === "−") {
        await l.zeg("Ja!", "Dat teken heet het minteken.");
        break;
      }
      if (t === null || poging >= 1) {
        await l.zeg(t === null ? "Geen zorgen." : "Kijk, dit is het.", "Het streepje is het minteken.");
        break;
      }
      await l.zeg(t === "+" ? "Dat is het plusteken." : "Dat teken is voor delen.", "Welke van deze twee is het dan?");
      tekens = tekens.filter((x) => x !== t);
    }
    l.som(somDelen("10 − 1"));
    await l.zeg("Zo schrijf je een minsom:", "{10} − {1}.", "We begonnen met {10}.", "Er vloog er {1} weg.");
    await l.verder();
    l.som(null);

    /* 7. Een minsom in je hoofd. */
    m.zet(0, { zapper: "weg" });
    await l.zeg("We doen een minsom vanaf het begin.", "Doe er {5} vuurvliegjes in.");
    await m.plusTot(5);
    l.som(somDelen("5 − 2 = ?"));
    await l.zeg("Nu reken je in je hoofd.", "Hoeveel is {5} − {2}?");
    for (let poging = 0; ; poging++) {
      const x = await l.getal();
      if (x === 3) {
        await l.zeg("Dat klopt.", "Je liet ze in je hoofd wegvliegen.");
        break;
      }
      if (poging >= 1) {
        await l.zeg("Er zijn {3} vuurvliegjes over.", "Dus {5} − {2} = {3}.");
        await l.verder();
        break;
      }
      await l.zeg(x === null ? "Geen zorgen." : "Dat klopt niet. Laten we het samen doen.", "We hebben {5} vuurvliegjes.", "Laat er {2} wegvliegen.");
      m.pas({ zapper: "dof" });
      await m.wegTot(3);
      await l.zeg("Tel wat er over is.", "Hoeveel is {5} − {2}?");
    }
    l.som(somDelen("5 − 2 = 3"));
    await l.wacht(700);

    /* 8. 10 − 4, met de wegvliegknop als hulp. */
    m.zet(10, { zapper: "aan", plus: "dof", zapTot: 0 });
    l.som(somDelen("10 − 4 = ?"));
    await l.zeg("Gebruik de wegvliegknop als dat helpt.", "Er zitten {10} vuurvliegjes in het potje.", "Hoeveel blijven er over als er {4} wegvliegen?");
    const tien = await l.getal();
    if (tien === 6) {
      await l.zeg("Je hebt het!");
    } else {
      await l.zeg(tien === null ? "Geen zorgen." : "Dat klopt niet. Laten we het samen doen.");
      m.zet(10, { zapper: "dof" });
      await l.zeg("Laat er {4} wegvliegen.");
      await m.wegTot(6);
      await l.zeg("Er zijn {6} vuurvliegjes over.", "{10} − {4} = {6}.");
    }
    l.som(somDelen("10 − 4 = 6"));
    m.pas({ zapper: "weg" });
    await l.verder();
    l.som(null);

    /* 9. Alles weg: dan houd je 0 over. */
    await l.zeg("Ik wil je nog één belangrijk ding laten zien.", "Daarna gaan we oefenen.");
    await l.verder();
    m.zet(20, { zapper: "dof" });
    await l.zeg("Nu zijn er {20} vuurvliegjes.", "Hoeveel moeten er wegvliegen?", "Er mogen er geen overblijven.");
    const twintig = await vraagGetal(l, 20, {
      fout: (x) => (x < 0 ? ["Ze moeten allemaal weg."] : x < 20 ? ["Dan blijven er nog vuurvliegjes over.", "Ze moeten allemaal weg."] : ["Zoveel zijn er niet.", "Ze moeten allemaal weg."]),
      antwoord: ["Ze moeten alle {20} wegvliegen."],
    });
    if (twintig) await l.zeg("Goed zo.");
    await l.zeg("Wil jij ze laten wegvliegen?", "Of zal ik het doen?");
    const wie = await l.kies(["Ik", "Jij"]);
    if (wie === "Ik") {
      await l.zeg("Ga je gang.");
      await m.wegTot(0);
    } else {
      await l.zeg("Daar gaan ze!");
      m.zet(0);
      await l.wacht(900);
    }
    await l.zeg("Elk getal min zichzelf is nul.", "Gaan ze allemaal weg, dan blijft er niets over.");
    await l.verder();

    /* 10. Oefenen; het potje mag je zelf gebruiken. Wat niet lukt, komt aan het eind nog één keer terug. */
    await l.zeg("Je snapt het.", "We doen er nog een paar.", "Gebruik het potje zoveel je wilt.");
    const oefen: [number, number][] = [
      [5, 4],
      [12, 9],
      [8, 7],
      [14, 11],
      [9, 3],
      [7, 7],
      [6, 2],
    ];
    const lof = ["Goed zo.", "Ja, dat klopt.", "Knap gedaan.", "Precies.", "Mooi.", "Heel goed.", "Klopt."];
    const later: [number, number][] = [];
    const oefenSom = async (a: number, b: number, nogEens: boolean, k: number) => {
      m.zet(0, { plus: "aan", zapper: "aan", plusTot: 20, zapTot: 0 });
      l.som(somDelen(`${a} − ${b} = ?`));
      await l.zeg(nogEens ? "Deze kwam net al." : "", `Hoeveel is {${a}} − {${b}}?`);
      const x = await l.getal();
      if (x === a - b) {
        await l.zeg(lof[k % lof.length]);
      } else {
        /* 1× fout of weet ik niet: Bliepo doet het voor in het potje, dan dezelfde vraag. */
        await l.zeg(x === null ? "Geen zorgen." : "Dat klopt niet. Laten we het samen doen.");
        m.zet(a, { plus: "dof", zapper: "dof" });
        await l.wacht(1100);
        m.zet(a - b, { plus: "dof", zapper: "dof" });
        await l.wacht(900);
        await l.zeg(`Ik liet er {${b}} wegvliegen.`, "Wat overblijft, is je antwoord.", `Hoeveel is {${a}} − {${b}}?`);
        const y = await l.getal();
        if (y === a - b) {
          await l.zeg("Ja, goed zo.");
        } else {
          /* 2× fout: het antwoord, en de som komt later terug. */
          await l.zeg(a - b === 1 ? "Er is {1} vuurvliegje over." : `Er zijn {${a - b}} vuurvliegjes over.`, `{${a}} − {${b}} = {${a - b}}.`, nogEens ? "" : "Dat zien we later.");
          if (!nogEens) later.push([a, b]);
          await l.verder();
        }
      }
      l.som(somDelen(`${a} − ${b} = ${a - b}`));
      await l.wacht(800);
    };
    for (let k = 0; k < oefen.length; k++) await oefenSom(oefen[k][0], oefen[k][1], false, k);
    for (let k = 0; k < later.length; k++) await oefenSom(later[k][0], later[k][1], true, k);
    l.som(null);

    /* 11. Terugblik. */
    m.zet(0, { plus: "dof", zapper: "dof" });
    await l.zeg("Je hebt goed minsommen gemaakt met het potje.", "Zullen we herhalen wat je hebt geleerd?");
    const terug = await l.kies(["Ja", "Nee"]);
    if (terug !== "Nee") {
      await l.zeg("Oké, daar gaan we.");
      m.zet(1);
      await l.zeg("Eerst deden we er vuurvliegjes bij.", "Dan wordt het getal hoger.");
      m.zet(7);
      await l.wacht(1200);
      m.zet(6);
      await l.wacht(600);
      m.zet(5);
      await l.zeg("Daarna lieten we er wegvliegen.", "Dan wordt het getal lager.");
      /* Ze vliegen één voor één weg. */
      for (let n = 4; n >= 0; n--) {
        m.zet(n);
        await l.wacht(500);
      }
      await l.zeg("Vliegen ze allemaal weg?", "Dan houd je {0} over.");
      await l.verder();
    }

    /* Einde: de kaart. */
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gewerkt vandaag, ${l.naam}!` : "Goed gewerkt vandaag!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};


/* ---------- les 3: het verschil ---------- */

/** Wacht tot het kind op Klaar (vinkje) of Hulp (vraagteken) tikt. */
async function klaarOfHulpPalen(l: Lesgids): Promise<Paalmelding> {
  return l.wachtOpVlak<Paalmelding>(["klaar", "hulp"]);
}

const verschil: Lesdraaiboek = {
  id: "aftrekken-10-verschil",
  titel: "Het verschil",
  synthesis: "Subtract Within 10 · Difference Dimension",
  kaarttekening: KaartPalen,

  async speel(ruw) {
    /* Klaar en Hulp staan op de vaste plek onder de zin van Bliepo (28 oktober 2026). */
    const l = metAanwijzen(
      knoppenOpPlek(ruw, {
        voor: AftrekkenHoloPalen,
        soorten: { klaar: "controleer", hulp: "weetniet" },
        aanwijs: { klaar: "controleer", hulp: "weetniet" },
        zichtbaar: (p) => {
          const k = p.knoppen as { klaar?: boolean; hulp?: boolean } | null | undefined;
          return k ? [k.klaar ? "klaar" : "", k.hulp ? "hulp" : ""].filter(Boolean) : [];
        },
      }),
    );
    const t = palen(l);
    const KNOPPEN = { klaar: true, hulp: true };
    const vol = { links: true, rechts: true };
    /*
      Op Klaar of Hulp wachten begint al vóór Bliepo uitgepraat is (`wacht`),
      zodat een tik terwijl hij praat niet verloren gaat. Alleen doen als er
      daarna niets anders van het vlak verwacht wordt.
    */
    let vroeg: Promise<Paalmelding> | null = null;
    const wacht = () => {
      vroeg = klaarOfHulpPalen(l);
    };
    const knop = () => {
      const p = vroeg ?? klaarOfHulpPalen(l);
      vroeg = null;
      return p;
    };
    /* De eerste keer met Klaar en Hulp: Bliepo wijst ze aan. */
    const wijsKnoppen = async () => {
      await l.wijs("klaar", "Ben je klaar? Tik dan op het vinkje.");
      await l.wijs("hulp", "Wil je hulp? Tik dan op het vraagteken.");
    };

    /* 1. Een paal met lampjes. */
    t.toon({ links: 0, rechts: 0, binnen: true });
    await l.zeg("Kijk, twee lantaarnpalen.", "Ze hebben nog geen lampjes.");
    t.pas({ erbij: { rechts: true }, max: { rechts: 1 } });
    const eerste = l.wachtOpVlak("erbij");
    await l.wijs("erbij-rechts", "Zie je de plus bij de paarse paal?", "Tik erop en kijk wat er gebeurt.");
    await eerste;
    t.zet(0, 1, { erbij: {}, max: {} });
    await l.zeg("Wauw!", "Er ging een lampje aan.", "Tik er nog eens op.");
    await t.bouwTot("rechts", 2, 1);
    await l.zeg("Hoeveel lampjes branden er nu?");
    const twee = await vraagGetal(l, 2, {
      fout: () => ["Hmm, kijk naar de paarse lampjes.", "Hoeveel zijn het er?"],
      antwoord: ["Het zijn er {2}.", "Er branden {2} lampjes."],
    });
    if (twee) await l.zeg("Ja.", "Er branden {2} lampjes.");

    await l.zeg("We doen er meer bij.", "Tik tot er {7} lampjes branden.");
    await t.bouwTot("rechts", 7, 2);
    await l.zeg("Heel mooi.", "Een lampje kan ook weer uit.");
    await l.verder();

    /* 2. De minknop doet het bovenste lampje uit. */
    const uit1 = t.bouwTot("rechts", 6, 7);
    await l.wijs("eraf-rechts", "Zie je de min bij de paarse paal?", "Tik erop.");
    await uit1;
    await l.zeg("Hé, er ging een lampje uit!");
    await l.verder();
    await l.zeg("Kun je er nog één uitdoen?");
    await t.bouwTot("rechts", 5, 6);
    await l.zeg("Mooi gedaan.");

    /* 3. Even veel maken. */
    t.zet(0, 5, { erbij: { links: true }, eraf: { links: true }, knoppen: KNOPPEN });
    wacht();
    await l.zeg("Nu een opdracht.", "Geef de oranje paal evenveel lampjes als de paarse.", "Ze mogen niet verschillen.");
    await wijsKnoppen();
    for (;;) {
      const g = await knop();
      if (g.soort === "klaar" && g.links === 5) {
        t.zet(5, 5, { erbij: {}, eraf: {}, knoppen: null });
        await l.zeg("Ja!", "Ze hebben evenveel lampjes.");
        break;
      }
      if (g.soort === "hulp") {
        t.pas({ cijfers: true });
        wacht();
        await l.zeg("Met de plus gaat er een lampje aan.", "Met de min gaat er een uit.", "Kijk naar de getallen.");
        continue;
      }
      t.zet(g.links, 5, { cijfers: true, knoppen: null, erbij: {}, eraf: {} });
      await l.zeg("Kijk goed.", "De palen hebben nog niet evenveel lampjes.", "Ze *verschillen* een beetje.");
      await l.verder();
      await l.zeg(g.links > 5 ? "Doe oranje lampjes uit met de min." : "Doe er oranje lampjes bij met de plus.");
      await t.bouwTot("links", 5, g.links);
      await l.zeg("Zo is het goed.", "Nu hebben ze evenveel lampjes.");
      break;
    }
    t.zet(5, 5, { cijfers: false, knoppen: null });
    await l.zeg("Hoeveel lampjes heeft *elke* paal?");
    const vijf = await vraagGetal(l, 5, {
      fout: () => ["Tel de oranje lampjes maar."],
      antwoord: ["Elke paal heeft {5} lampjes."],
    });
    if (vijf) await l.zeg("Ja, dat klopt.", "{5} lampjes aan elke paal.", "Er is geen verschil.");

    /* 4. Er gebeurt iets: nu zijn ze verschillend. */
    t.zet(3, 5);
    await l.zeg("Oei, er gingen lampjes uit.", "Hebben ze nog evenveel?");
    const zelfde = await l.kies(["Evenveel", "Verschillend"]);
    if (zelfde !== "Verschillend") {
      await l.zeg(zelfde === null ? "Geen zorgen." : "Hmm, dat lijkt niet hetzelfde.", "We kijken nog eens.");
      await l.verder();
      t.pas({ cijfers: true });
      await l.zeg("Tel de oranje lampjes.", "Hoeveel zie je?");
      const drie = await vraagGetal(l, 3, {
        fout: () => ["Kijk naar de getallen naast de oranje lampjes."],
        antwoord: ["Het zijn er {3}."],
      });
      if (drie) await l.zeg("Dat klopt!", "De oranje paal heeft {3} lampjes.");
      t.pas({ cijfers: false });
    } else {
      await l.zeg("Ja, ze zijn verschillend.");
    }
    await l.zeg("{3} lampjes aan de oranje paal.", "{5} lampjes aan de paarse paal.");
    await l.verder();

    await l.zeg("Heb je al eens het verschil gezocht?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We leren samen iets nieuws.");
    await l.verder();

    await l.zeg("Welke paal heeft er meer?");
    const meer = await l.kies(["Oranje", "Paars"]);
    if (meer === "Paars") {
      await l.zeg("Dat klopt.", "De paarse paal heeft meer lampjes.");
    } else {
      t.pas({ cijfers: true });
      await l.zeg(meer === null ? "Geen zorgen." : "Kijk nog eens.", "De paarse paal heeft meer lampjes.");
      await l.verder();
      t.pas({ cijfers: false });
    }
    await l.zeg("Dan moeten er oranje lampjes bij.", "Maak ze weer even veel met de plus.");
    await t.bouwTot("links", 5, 3);
    await l.zeg("Zo is het goed.");

    /* 5. De schuif: de palen tegen elkaar. */
    await l.zeg("Oké, nu iets nieuws.", "Ik heb een schuif voor je.");
    await l.verder();
    t.zet(5, 5);
    const bots1 = t.bots();
    await l.wijs("schuif", "Schuif het lichtje helemaal naar de overkant.", "Dan schuiven de palen tegen elkaar.");
    await bots1;
    await l.zeg("Wauw!", "Wat gebeurde er met de lampjes?");
    const weg = await l.kies(["Ze gingen uit"]);
    if (weg === null) {
      await l.zeg("Dat is niet erg.", "Dat is lastig.", "We kijken beter wat er gebeurt als ze tegen elkaar komen.");
    } else {
      await l.zeg("Ja!", "Ze gingen tegen elkaar uit.", "We kijken nog beter hoe dat gaat.");
    }
    await l.verder();

    t.zet(1, 1, { schuif: false, cijfers: true });
    await l.zeg("Maar één lampje per paal, hè?", "Dat is niet veel licht.");
    await l.verder();
    await l.zeg("Hoeveel lampjes heeft elke paal nu?");
    const een = await l.kies(["1", "2"]);
    await l.zeg(een === "1" ? "Klopt." : "Kijk naar de getallen.", "Elke paal heeft één lampje onderaan.");
    await l.verder();
    await l.zeg("Ze zitten op dezelfde hoogte.", "Dus komen ze tegen elkaar.", "En dan gaan ze allebei uit.");
    await l.verder();
    t.pas({ cijfers: false });
    await l.zeg("Schuif de palen nu tegen elkaar.");
    await t.bots();
    await l.zeg("Daar gaan ze!", "Allebei een lampje op dezelfde hoogte.", "Ze gingen tegen elkaar uit.");
    await l.verder();

    t.zet(3, 3, { schuif: false, cijfers: true });
    await l.zeg("Nu doe ik er meer aan.", "Hoeveel lampjes heeft elke paal?");
    const drie = await vraagGetal(l, 3, {
      fout: () => ["Kijk naar de getallen."],
      antwoord: ["Elke paal heeft {3} lampjes."],
    });
    if (drie) await l.zeg("Dat klopt.");
    await l.zeg("Wat gebeurt er als ze tegen elkaar schuiven?");
    const voorspel = await l.kies(["Allemaal uit", "Er gebeurt niets"]);
    await l.zeg(voorspel === "Allemaal uit" ? "Misschien heb je gelijk." : "We gaan het zien.", "Schuif ze nu tegen elkaar.");
    t.pas({ cijfers: false });
    await t.bots();
    await l.zeg("Wauw!", "Beide palen hadden {3} lampjes.", "Ze gingen allemaal tegen elkaar uit.");
    await l.verder();

    /* 6. 5 tegen 4. */
    t.zet(0, 0, { schuif: false });
    await l.zeg("Nu mag jij de palen maken.");
    await l.verder();
    t.pas({ erbij: vol, eraf: vol, knoppen: KNOPPEN });
    wacht();
    await l.zeg("De oranje paal krijgt {5} lampjes.", "De paarse paal krijgt er {4}.", "Tik op het vinkje als het af is.");
    for (;;) {
      const g = await knop();
      if (g.soort === "klaar" && g.links === 5 && g.rechts === 4) break;
      t.pas({ cijfers: true });
      wacht();
      if (g.soort === "hulp") {
        await l.zeg("Met de plus gaat er een lampje aan.", "Met de min gaat er een uit.");
      } else {
        await l.zeg(`Je palen hebben {${g.links}} en {${g.rechts}} lampjes.`, "Oranje moet {5} zijn, paars {4}.");
      }
    }
    t.zet(5, 4, { erbij: {}, eraf: {}, knoppen: null, cijfers: false });
    await l.zeg("Goed gedaan.");
    await l.verder();
    await l.zeg("Eerst raden.", "Welke paal houdt lampjes over?");
    const winnaar = await l.kies(["Oranje", "Paars"]);
    await l.zeg(winnaar === "Oranje" ? "Jij denkt oranje." : winnaar === "Paars" ? "Jij denkt paars." : "We gaan het zien.", "Schuif ze tegen elkaar, dan zien we het.");
    await t.bots();
    await l.zeg("Wauw!", "De oranje paal houdt één lampje over.");
    await l.verder();
    await l.zeg("Bij elke paal gingen er {4} uit.", "Maar er bleef {1} oranje lampje branden.", "Waarom ging dat lampje niet uit?");
    const waarom = await l.kies(["Geen paars lampje ernaast", "Meer paarse lampjes"]);
    if (waarom === "Geen paars lampje ernaast") {
      await l.zeg("Ja.", "De oranje paal had één lampje extra.");
    } else {
      await l.zeg("Kijk, naast het bovenste oranje lampje zat geen paars lampje.", "Daarom bleef het branden.");
    }
    await l.verder();
    await l.zeg("Wat was het verschil tussen de palen?");
    const eenGoed = await vraagGetal(l, 1, {
      fout: () => ["Tel de lampjes die nog branden."],
      antwoord: ["Er bleef {1} lampje branden.", "Het verschil is {1}."],
    });
    if (eenGoed) await l.zeg("Je hebt het.", "De oranje paal had {1} lampje meer.", "Het verschil is {1}.");

    /* 7. Is het verschil plus of min? */
    t.zet(3, 5, { schuif: false });
    await l.zeg("Nu {3} oranje tegen {5} paarse.", "Schuif ze maar tegen elkaar!");
    await t.bots();
    await l.zeg("Er blijven {2} paarse lampjes branden.");
    await l.verder();
    await l.zeg("Nu heb ik een vraag.", "Op welke som lijkt het verschil zoeken?");
    const soort = await l.kies(["Plussom", "Minsom"]);
    if (soort !== "Minsom") {
      await l.zeg(soort === null ? "Geen zorgen." : "Hmm, vind je het verschil met een plussom?", "We kijken samen.");
      await l.verder();
      t.zet(1, 2, { schuif: false, cijfers: true });
      await l.zeg("Hier is een paal met {1} lampje.", "En een paal met {2}.", "Hoeveel is dat samen?");
      const samen = await vraagGetal(l, 3, {
        fout: () => ["Tel alle lampjes."],
        antwoord: ["Samen zijn het er {3}."],
      });
      if (samen) await l.zeg("Ja.", "{1} + {2} = {3}.");
      await l.zeg("Maar voor het verschil schuiven we ze tegen elkaar.");
      t.pas({ cijfers: false });
      await t.bots();
      await l.zeg("Kijk naar het paarse lampje dat nog brandt.", "Hoeveel lampjes verschillen de palen?");
      const v1 = await vraagGetal(l, 1, {
        fout: () => ["Tel de lampjes die nog branden."],
        antwoord: ["Er brandt nog {1} lampje.", "Het verschil is {1}."],
      });
      if (v1) await l.zeg("Ja!", "Het verschil is {1}.");
      t.zet(1, 2, { schuif: false });
      await l.zeg("Het verschil is {1}.", "Maar samen was het {3}.", "Een plussom helpt dus niet bij het verschil.");
      await l.verder();
      await l.zeg("Wat helpt wel om het verschil te vinden?");
      const wel = await l.kies(["Plussom", "Minsom"]);
      if (wel !== "Minsom") await l.zeg("Het is een minsom.");
    } else {
      await l.zeg("Ja!");
    }
    await l.zeg("Precies.", "Verschil is aftrekken.", "De lampjes gaan tegen elkaar uit: je haalt ze weg.");
    await l.verder();

    /* 8. Welke som hoort erbij? 5 en 3. */
    t.zet(5, 3, { schuif: false, cijfers: true });
    await l.zeg("Welke som helpt je het verschil te vinden?");
    const hulpsom = await toetsKeuze(
      l,
      ["5 + 3", "5 − 3", "5 − 2"],
      "5 − 3",
      ["Bij het verschil haal je lampjes weg.", "Welke som past bij deze palen?"],
      ["Het is {5} − {3}."],
    );
    if (hulpsom) await l.zeg("Precies.", "Het is {5} − {3}.");
    await l.zeg("Wil je de palen tegen elkaar schuiven?", "Of weet je het verschil al?");
    const weet = await l.kies(["Schuiven", "Ik weet het"]);
    if (weet === "Ik weet het") {
      await l.zeg("Wat is het verschil tussen {5} en {3}?", "Of: hoeveel is {5} − {3}?");
      const x = await l.getal();
      if (x === 2) {
        await l.zeg("Dat klopt.", "Knap dat je dat in je hoofd kon.");
        /* Ter controle: twee oranje lampjes uit, dan hebben ze evenveel. */
        t.zet(3, 3, { schuif: false, cijfers: true });
        await l.wacht(900);
        t.zet(5, 3, { schuif: false, cijfers: true });
      } else {
        await l.zeg("Schuif ze tegen elkaar om te kijken.");
        t.pas({ cijfers: false });
        await t.bots();
        await l.zeg("Er blijven {2} oranje lampjes branden.", "Het verschil is {2}.");
        await l.verder();
      }
    } else {
      t.pas({ cijfers: false });
      await t.bots();
      await l.zeg("Hoeveel lampjes branden er nog?");
      await vraagGetal(l, 2, { fout: () => ["Tel de oranje lampjes die nog branden."], antwoord: ["Er branden er nog {2}.", "Het verschil is {2}."] });
      await l.zeg("Het verschil is {2}.");
    }
    t.zet(5, 3, { schuif: false, cijfers: true });
    await l.zeg("Hoe schrijf je dit als som?", "Kijk goed.");
    const somKeuze = await l.kies(["5 − 2 = 3", "5 − 3 = 2"]);
    if (somKeuze === "5 − 3 = 2") {
      await l.zeg("Ja!", "{5} − {3} = {2}.");
      await l.verder();
    } else {
      if (somKeuze === null) {
        await l.zeg("Geen zorgen.", "We vergelijken de sommen met de palen.");
      } else {
        await l.zeg("{5} − {2} = {3}.", "Ik snap waarom je die koos.", "Maar laten we het met de palen bekijken.");
      }
      await l.verder();
      await l.zeg("De oranje paal heeft {5} lampjes.", "We halen er de lampjes van de kleine paal af.", "Hoeveel lampjes heeft de kleine paal?");
      const af = await l.kies(["2", "3"]);
      await l.zeg(af === "3" ? "Ja, dat klopt." : "De kleine paal heeft {3} lampjes.");
      await l.zeg("We hebben {5} lampjes.", "We halen er {3} af.", "Dus schrijven we {5} − {3}.");
      await l.verder();
      t.pas({ cijfers: false });
      await l.zeg("Schuif ze nu tegen elkaar.");
      await t.bots();
      l.som([{ t: "getal", n: 5 }, { t: "teken", s: "−" }, { t: "getal", n: 3 }, { t: "teken", s: "=" }, { t: "vak" }]);
      await l.zeg("Maak de som af.");
      let fout = 0;
      while ((await l.somVak(4)) !== 2) {
        fout++;
        await l.zeg(fout === 1 ? "Tel de oranje lampjes die nog branden." : "Er branden er nog {2}. Typ de {2}.");
      }
      l.som([{ t: "getal", n: 5 }, { t: "teken", s: "−" }, { t: "getal", n: 3 }, { t: "teken", s: "=" }, { t: "getal", n: 2 }]);
      await l.zeg("Goed zo!", "{5} en {3} verschillen {2}.", "{5} − {3} = {2}.");
      await l.verder();
      l.som(null);
    }

    /* 9. 3 tegen 8. */
    t.zet(0, 0, { schuif: false, cijfers: false, erbij: vol, eraf: vol, knoppen: KNOPPEN });
    wacht();
    await l.zeg("Nieuwe opdracht.", "De oranje paal krijgt {3} lampjes.", "De paarse paal krijgt er {8}.", "Tik op het vinkje als het af is.");
    for (;;) {
      const g = await knop();
      if (g.soort === "klaar" && g.links === 3 && g.rechts === 8) break;
      t.pas({ cijfers: true });
      wacht();
      if (g.soort === "hulp") {
        await l.zeg("Met de plus gaat er een lampje aan.", "Met de min gaat er een uit.");
      } else {
        await l.zeg(`Je palen hebben {${g.links}} en {${g.rechts}} lampjes.`, "Oranje moet {3} zijn, paars {8}.");
      }
    }
    t.zet(3, 8, { erbij: {}, eraf: {}, knoppen: null, cijfers: false });
    await l.zeg("Bravo.", "Welke paal houdt lampjes over?");
    const wie = await l.kies(["Oranje", "Paars"]);
    let gok: number | null = null;
    if (wie === "Paars") {
      await l.zeg("Hoeveel lampjes houdt paars dan over?", "Hoeveel verschillen de palen?");
      gok = await l.getal();
      await l.zeg("We zoeken het uit.", "Schuif ze tegen elkaar.");
    } else {
      await l.zeg(wie === "Oranje" ? "Jij denkt oranje." : "We gaan het zien.", "Schuif ze tegen elkaar.");
    }
    await t.bots();
    if (gok === 5) {
      await l.zeg("Precies zoals je zei!", "De paarse paal houdt {5} lampjes over.");
    } else if (wie === "Paars" && gok !== null) {
      await l.zeg("De paarse paal houdt lampjes over, zoals je zei!", `Maar ${gok > 5 ? "minder" : "meer"} lampjes dan je dacht.`);
    } else {
      await l.zeg("De paarse paal houdt lampjes over.");
    }
    await l.verder();
    if (gok !== 5) {
      await l.zeg("Tel de paarse lampjes die nog branden.", "Hoeveel verschillen de palen?");
      await vraagGetal(l, 5, { fout: () => ["Tel alleen de paarse lampjes die nog branden."], antwoord: ["Er branden er nog {5}."] });
    }
    await l.zeg("Dat klopt.", "Deze palen verschillen {5}.");
    t.zet(3, 8, { schuif: false, cijfers: true });
    await l.zeg("Ik vraag het nog op een andere manier.", "Welke som laat het verschil zien?");
    const s8 = await toetsKeuze(
      l,
      ["8 − 3 = 4", "8 + 3 = 11", "8 − 3 = 5"],
      "8 − 3 = 5",
      ["Begin bij de paal met de meeste lampjes.", "Haal de kleine paal eraf."],
      ["Het is {8} − {3} = {5}."],
    );
    if (s8) await l.zeg("Je hebt helemaal gelijk.", "{8} − {3} = {5}.");
    await l.verder();

    /* 10. Zelf een verschil van 3 maken. */
    await l.zeg("Nu iets moeilijkers.");
    await l.verder();
    t.zet(4, 0, { cijfers: true, erbij: { rechts: true }, eraf: { rechts: true }, knoppen: KNOPPEN });
    wacht();
    await l.zeg("Geef de paarse paal lampjes.", "Maak een *verschil* van {3}.", "Tik op het vinkje als het af is.");
    const g3 = await knop();
    if (g3.soort === "klaar" && Math.abs(4 - g3.rechts) === 3) {
      t.zet(4, g3.rechts, { erbij: {}, eraf: {}, knoppen: null });
      await l.zeg("Ja!", `Een paal met {${g3.rechts}} en een paal met {4}.`, "Schuif ze tegen elkaar om te kijken.");
      await t.bots();
      await l.zeg("Prachtig.", "Ze verschillen {3}.");
      await l.verder();
    } else {
      if (g3.soort === "klaar") {
        t.zet(4, g3.rechts, { erbij: {}, eraf: {}, knoppen: null });
        const d = Math.abs(4 - g3.rechts);
        await l.zeg(`Hmm, je palen hebben {4} en {${g3.rechts}} lampjes.`, "Schuif ze tegen elkaar om het verschil te zien.");
        await t.bots();
        await l.zeg(d === 0 ? "Ze gingen allemaal uit." : `Het verschil is {${d}}.`, "Maar we zoeken een verschil van {3}.");
        await l.verder();
      } else {
        await l.zeg("Natuurlijk help ik je.");
      }
      t.zet(4, 0, { schuif: false, cijfers: true, knoppen: null });
      await l.zeg("Geef de paarse paal {3} lampjes *meer* dan de oranje.", "Probeer het maar.");
      await t.bouwTot("rechts", 7, 0);
      await l.zeg("Uitstekend.", "Een paal met {7} en een paal met {4}.");
      await l.verder();
      await l.zeg("Schuif ze tegen elkaar om te kijken.");
      await t.bots();
      await l.zeg("Prachtig gedaan.", "Je maakte twee palen met een verschil van {3}.");
      await l.verder();
    }

    await l.zeg("Kan het ook op een andere manier?");
    t.zet(2, 0, { schuif: false, cijfers: true, erbij: { rechts: true }, eraf: { rechts: true }, knoppen: KNOPPEN });
    wacht();
    await l.zeg("Dezelfde opdracht.", "Geef de paarse paal lampjes tot het verschil {3} is.", "Tik op het vinkje als het af is.");
    const g4 = await knop();
    if (g4.soort === "klaar" && g4.rechts === 5) {
      t.zet(2, 5, { erbij: {}, eraf: {}, knoppen: null });
      await l.zeg("Gelukt!", "{5} en {2} verschillen {3}.");
      await l.verder();
    } else {
      await l.zeg(g4.soort === "hulp" ? "Natuurlijk, ik help je." : "Bijna, ik help je.", "Eerst maken we de palen gelijk.");
      await l.verder();
      t.zet(2, 0, { erbij: {}, eraf: {}, knoppen: null });
      await l.zeg("Geef de paarse paal evenveel lampjes als de oranje.");
      await t.bouwTot("rechts", 2, 0);
      await l.zeg("Goed zo.", "Nu hebben ze evenveel lampjes.");
      await l.verder();
      await l.zeg("Maar ze moeten {3} verschillen.", "Doe er nog genoeg paarse lampjes bij.", "Tik dan op het vinkje.");
      t.pas({ erbij: { rechts: true }, eraf: { rechts: true }, knoppen: { klaar: true } });
      for (;;) {
        const g = await l.wachtOpVlak<Paalmelding>("klaar");
        if (g.rechts === 5) break;
        await l.zeg("Tel de paarse lampjes boven de oranje.", "Dat moeten er {3} zijn.");
      }
      t.zet(2, 5, { erbij: {}, eraf: {}, knoppen: null });
      await l.zeg("Gelukt!", "{5} en {2} verschillen {3}.");
      await l.verder();
    }

    /* 11. De laatste opdracht: alle palen met een verschil van 4 (het scorebord). */
    await l.zeg("Je bent er heel goed in.", "Ik heb nog één laatste opdracht.", "Doe je mee?");
    const mee = await l.kies(["Ja", "Nee"]);
    if (mee !== "Nee") {
      await l.zeg(mee === null ? "We proberen het samen." : "Uitstekend.", "Nu zoeken we alle palen met een verschil van {4}.");
      await l.verder();
      const lijst: (string | null)[] = Array(7).fill(null);
      t.zet(0, 0, { cijfers: true, erbij: vol, eraf: vol, knoppen: KNOPPEN, lijst });
      wacht();
      await l.zeg("Maak twee palen met een verschil van {4}.", "Je mag lampjes aandoen en uitdoen.", "Tik op het vinkje als het af is.");
      const reacties: string[][] = [
        [],
        ["Goed zo!", "Dat zijn er al twee."],
        ["Ja!", "Het scorebord raakt al vol."],
        ["Raak!", "Dat zijn er al vier."],
        ["Mooi!", "Je bent er bijna."],
        ["Nog één te gaan!"],
        ["Gefeliciteerd!", "Je hebt ze allemaal gevonden."],
      ];
      let gevonden = 0;
      while (gevonden < 7) {
        const g = await knop();
        /* Hierna wacht de les alleen nog op Klaar of Hulp (of is hij klaar). */
        wacht();
        const hoog = Math.max(g.links, g.rechts);
        const laag = Math.min(g.links, g.rechts);
        if (g.soort === "hulp") {
          const plek = lijst.findIndex((x) => x === null);
          const a = 10 - plek;
          await l.zeg(`Probeer eens een paal met {${a}}.`, `Geef de andere paal {${a - 4}}.`);
          continue;
        }
        if (hoog - laag !== 4) {
          const ander = hoog >= 4 && lijst[10 - hoog] === null ? hoog - 4 : laag + 4;
          await l.zeg(`Palen met {${g.links}} en {${g.rechts}}?`, "Bijna, maar dat is niet het goede verschil.", `Misschien kan een paal {${Math.min(10, ander)}} lampjes hebben?`);
          await l.zeg("Zal ik de palen leegmaken?");
          const leeg = await l.kies(["Ja", "Nee"]);
          if (leeg === "Ja") t.zet(0, 0);
          await l.zeg("Ga maar verder.", "Tik op het vinkje als je palen af zijn.");
          continue;
        }
        const plek = 10 - hoog;
        if (lijst[plek] !== null) {
          await l.zeg("Die heb je al gevonden.", "Zoek een andere.");
          continue;
        }
        lijst[plek] = `${hoog} − ${laag} = 4`;
        gevonden++;
        t.pas({ lijst: [...lijst] });
        if (gevonden === 1) {
          await l.zeg(`{${g.links}} en {${g.rechts}}.`, "Een verschil van {4}.", "Goed zo!");
          await l.zeg("Maak nog een paar palen met een verschil van {4}.");
        } else {
          await l.zeg(...reacties[gevonden - 1]);
          if (gevonden === 3 && lijst[6] === null) await l.zeg("Vergeet niet: je kunt ook lampjes uitdoen.");
        }
      }
      t.pas({ erbij: {}, eraf: {}, knoppen: null, cijfers: false });
      await l.verder();
      await l.zeg("Kijk eens naar het scorebord.", "Beide getallen gaan steeds één omhoog.", "Het verschil blijft {4}.");
      await l.verder();
    } else {
      await l.zeg("Prima.", "Je hebt al heel veel gedaan.");
    }

    /* Einde: de kaart. */
    l.vlak(null);
    const tik = l.kaart();
    await l.zeg(l.naam ? `Heel goed gedaan, ${l.naam}!` : "Heel goed gedaan!", "Je weet nu wat het verschil is.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 4: eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "aftrekken-10-eindtoets",
  titel: "Eindtoets: aftrekken tot 10",
  synthesis: "Subtract Within 10 · Mastery Check",
  kaarttekening: KaartPotje,
  async speel(l) {
    await toets(l, {
      vliegjes: 8,
      weg: 3,
      keuzes: ["8 − 4", "8 + 3", "3 − 8", "8 − 3"],
      oranje: 9,
      paars: 5,
      verschilKeuzes: ["5 − 9 = 4", "9 − 5 = 4", "5 + 4 = 9", "4 − 5 = 9"],
      overgang: true,
      weghalen: [
        [6, 2],
        [9, 7],
        [5, 5],
        [10, 4],
        [7, 1],
      ],
      verschillen: [
        [8, 6],
        [2, 9],
        [10, 7],
        [5, 1],
        [3, 6],
      ],
    });
  },
};


/* ---------- les 5: hetzelfde verschil (groep 3-deel van Same Difference) ---------- */

/**
 * Naar Synthesis "Subtraction Strategies · Same Difference", alleen de
 * opdrachten met label groep 3 (en "3 en 4"): het verschil tot 10 met de
 * gekoppelde plus- en minknop (blok N), en 12 = 10 + 2. Wat daarna komt
 * (17 − 9 laten botsen, afronden, de slotmissie) is groep 4.
 */
const zelfdeVerschil: Lesdraaiboek = {
  id: "aftrekken-zelfde-verschil",
  titel: "Hetzelfde verschil",
  synthesis: "Subtraction Strategies · Same Difference (groep 3-deel)",
  kaarttekening: KaartKnoop,

  async speel(l) {
    const t = torens(l);

    /* 1. Twee torens: wat is het verschil? */
    t.toon({ links: 0, rechts: 0, binnen: true });
    await l.zeg("Kijk, de aliens sturen blokken.");
    await l.wacht(500);
    t.zet(6, 3);
    await l.zeg("Een toren van {6}.", "Een toren van {3}.", "Wat is het verschil?");
    let eerste = await l.getal();
    if (eerste !== 3) {
      await l.zeg(
        eerste !== null && Math.abs(eerste - 3) === 1 ? "Ah, heel dichtbij." : eerste === null ? "Geen zorgen." : "Hmm, dat is het nog niet.",
        eerste !== null && Math.abs(eerste - 3) === 1 ? "Je zit er maar één naast." : "We zoeken het samen uit.",
        "Hoe wil je het verschil vinden?",
      );
      const hoe = await l.kies(["De torens laten botsen", "Paarse blokken erbij doen", "Ik probeer het nog een keer"]);
      if (hoe === "Ik probeer het nog een keer") {
        await l.zeg("Wat is het verschil tussen {6} en {3}?");
        eerste = await l.getal();
      }
      if (eerste !== 3) {
        if (hoe === "Paarse blokken erbij doen") {
          await l.zeg("Goed idee.", "Maak de paarse toren even hoog als de oranje.", "Tik op het paarse ruimteschip.");
          await t.bouwTot("rechts", 6, 3);
          await l.zeg("Nu zijn ze even hoog.", "Hoeveel paarse blokken deed je erbij?");
        } else {
          await l.zeg(hoe === "De torens laten botsen" ? "Dat vind ik een goed idee." : "We laten de torens botsen.", "Ik zet de botsschuif voor je aan.");
          await l.verder();
          await l.zeg("Laat de torens botsen.", "Dan vind je het verschil.");
          await t.bots();
          await l.zeg("Zo moet het.", "Wat is het verschil tussen de torens?");
        }
        await vraagGetal(l, 3, {
          fout: () => [hoe === "Paarse blokken erbij doen" ? "Tel de paarse blokken boven de {3}." : "Tel de blokken die over zijn."],
          antwoord: ["Het zijn er {3}.", "Het verschil is {3}."],
        });
      }
    }
    t.zet(6, 3, { schuif: false, cijfers: true, ufo: {}, straal: {}, max: {} });
    await l.zeg("Dat klopt, kapitein.", "{6} en {3} hebben een verschil van {3}.");
    await l.verder();

    /* 2. De plusknop: bij allebei een blok erbij. */
    t.pas({ knoop: "plus" });
    await l.zeg("Zie je het plusteken tussen de ruimteschepen?", "Tik erop.");
    await t.knoopTot(7, 6);
    await l.zeg("Kijk eens.", "Wat heb je net gedaan?");
    const gedaan = await l.kies(["Bij allebei een blok erbij", "Alleen een paars blok erbij", "Alleen een oranje blok erbij"]);
    if (gedaan === "Bij allebei een blok erbij") {
      await l.zeg("Dat klopt.", "Deze knop doet bij allebei de torens een blok erbij.");
    } else {
      /* Zoals ronde 1: terug naar 6 en 3, nog een keer tikken en goed kijken. */
      t.zet(6, 3);
      await l.zeg(gedaan === null ? "Geen zorgen." : "Hmm, kijk nog eens.", "Let goed op wat er met elke toren gebeurt.", "Tik nog een keer op het plusteken.");
      await t.knoopTot(7, 6);
      await l.zeg("De oranje toren ging van {6} naar {7}.", "De paarse toren ging van {3} naar {4}.", "Met hoeveel ging elke toren omhoog?");
      const een = await vraagGetal(l, 1, {
        fout: () => ["Kijk naar de cijfers naast de torens.", "Hoeveel blokken kwamen erbij?"],
        antwoord: ["Elke toren kreeg {1} blok erbij."],
      });
      if (een) await l.zeg("Ja, met {1}.");
      await l.zeg("Deze knop doet bij allebei de torens een blok erbij.");
    }
    await l.verder();
    await l.zeg("Nu heb je torens van {7} en {4}.", "Wat is het verschil?");
    const v74 = await vraagGetal(l, 3, {
      fout: () => ["Hoeveel blokken heeft de oranje toren meer dan de paarse?"],
      antwoord: ["De oranje toren heeft {3} blokken meer.", "Het verschil is {3}."],
    });
    if (v74) await l.zeg("Ja, het verschil is weer {3}.");

    await l.zeg("Tik nog {3} keer op het plusteken.", "Zo bouwen we de torens hoger.");
    await t.knoopTot(10, 7);
    await l.zeg("{10} en {7}.", "Is het verschil nog steeds {3}?");
    const nogSteeds = await l.kies(["Ja", "Nee"]);
    await l.zeg(
      nogSteeds === "Ja" ? "Dat denk ik ook." : nogSteeds === null ? "Geen zorgen." : "Hmm, daar ben ik niet zo zeker van.",
      "We controleren het met de botsschuif.",
      "Laat de torens maar botsen.",
    );
    await t.bots();
    await l.zeg("Mooi.", "Tel de blokken die over zijn.", "Hoeveel zijn het er?");
    const v107 = await vraagGetal(l, 3, {
      fout: () => ["Tel alleen de oranje blokken die over zijn."],
      antwoord: ["Er zijn {3} blokken over."],
    });
    await l.zeg(v107 ? "Goed zo." : "Kijk eens.", "{10} en {7} hebben ook een verschil van {3}.");
    await l.verder();

    /* 3. De minknop. */
    t.zet(10, 7, { schuif: false, cijfers: true, knoop: "min", knoopAan: false });
    await l.zeg("Let goed op de ronde knop.", "Er staat nu een minteken op.", "Wat gebeurt er als je erop tikt?");
    const minDenk = await l.kies(["Alle blokken gaan weg", "Bij allebei één blok weg"]);
    await l.zeg("Zullen we het uitzoeken?", "Tik op het minteken.");
    await t.knoopTot(9, 10);
    if (minDenk === "Bij allebei één blok weg") {
      await l.zeg("Je had gelijk, kapitein.", "Bij allebei ging er één blok weg.");
    } else {
      await l.zeg("Kijk, er gingen niet alle blokken weg.", "Bij allebei ging er één blok weg.");
    }
    await l.zeg("Tik nog een keer en kijk wat er gebeurt.");
    await t.knoopTot(8, 9);
    await l.zeg("Nu heb je een toren van {8}.", "En een toren van {5}.", "Wat is het verschil nu?");
    const v85 = await vraagGetal(l, 3, {
      fout: () => ["Hoeveel blokken heeft de oranje toren meer dan de paarse?"],
      antwoord: ["De oranje toren heeft {3} blokken meer.", "Het verschil is {3}."],
    });
    await l.zeg(v85 ? "Ja, het is nog steeds {3}." : "Het is nog steeds {3}.", "Net als bij het plusteken.");
    await l.verder();

    await l.zeg("We gaan raden.", "Je tikt nog {4} keer op het minteken.", "Wat is het verschil dan?");
    const gok = await l.getal();
    if (gok === 3) {
      await l.zeg("Nog steeds {3}?", "Ik denk dat je gelijk hebt.", "We zoeken het uit.", "Tik {4} keer.");
    } else {
      await l.zeg(gok === null ? "Geen zorgen." : `{${gok}}?`, "We zoeken het uit.", "Tik {4} keer.");
    }
    await t.knoopTot(4, 8);
    if (gok === 3) {
      await l.zeg("Ja, je wist het.", "Het is {3}.");
    } else {
      await l.zeg("Kijk: {4} en {1}.", "Het verschil is nog steeds {3}.");
    }
    await l.verder();

    await l.zeg("Wat gebeurt hier nou?", "Doe je bij allebei evenveel erbij of eraf?", "Blijft het verschil dan altijd hetzelfde?");
    const regel = await l.kies(["Ja", "Nee"]);
    if (regel !== "Ja") {
      await l.zeg(regel === null ? "Geen zorgen." : "Kijk nog eens naar wat we deden.", "{6} en {3}, {7} en {4}, {10} en {7}, {4} en {1}.", "Steeds een verschil van {3}.");
      await l.verder();
    }
    await l.zeg(
      regel === "Ja" ? "Ja!" : "Dus:",
      "Doe je bij allebei evenveel erbij of eraf?",
      "Dan blijft het verschil hetzelfde.",
      "Dat heb je goed ontdekt.",
    );
    await l.verder();

    /* 4. Een niveau omhoog: boven de 10. */
    t.zet(10, 10, { cijfers: false, knoop: "plus", knoopAan: false, kolommen: 2 });
    await l.zeg("Ah, nu wordt het groter!", "Nu kunnen we boven de {10} komen.", "Je krijgt twee volle stapels van {10}.");
    await l.verder();
    await l.zeg("Kijk wat er gebeurt met het plusteken.", "Tik er {2} keer op.");
    await t.knoopTot(12, 10);
    await l.zeg("Mooi.", "Elke toren heeft nu {12} blokken.", "Hoe is elke toren gebouwd?");
    const bouw = await toetsKeuze(
      l,
      ["10 + 2", "9 + 2", "10 + 3", "1 + 2"],
      "10 + 2",
      ["Kijk naar de volle stapel en de losse blokken.", "Hoe is elke toren gebouwd?"],
      ["Het is {10} + {2}.", "Een volle stapel van {10}, plus {2} losse blokken."],
    );
    if (bouw) await l.zeg("Raak.", "Een volle stapel van {10}.", "Plus {2} losse blokken.");
    await l.verder();

    /* Einde: de kaart. */
    t.zet(0, 0, { knoop: null, kolommen: 1 });
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "Tot de volgende keer.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_AFTREKKEN_TOT_10: Lesdraaiboek[] = [instaptoets, vuurvliegjesWeghalen, verschil, eindtoets, zelfdeVerschil];
