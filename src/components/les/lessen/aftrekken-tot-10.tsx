/**
 * Lessen van "Aftrekken tot 10", naar de Synthesis-unit "Subtract Within 10"
 * (INSPIRATIE.md, ronde 1 en 2). Groep 3.
 *
 * 1. Instaptoets: stippen maken en wegzappen, welke som, hoeveel blijft er
 *    over, hoeveel moeten er nog weg; daarna het verschil tussen twee torens.
 * 2. Stippen weghalen ("Dot Destruction"): aftrekken als weghalen met de
 *    stippenmachine.
 * 3. Het verschil ("Difference Dimension"): twee torens laten botsen; wat
 *    overblijft is het verschil.
 * 4. Eindtoets: als de instaptoets, met andere getallen.
 * 5. Hetzelfde verschil (groep 3-deel van "Subtraction Strategies · Same
 *    Difference"): de gekoppelde plus- en minknop, en 12 = 10 + 2.
 *
 * Vlakken: ../vlakken/aftrekken-stippen.tsx en ../vlakken/aftrekken-torens.tsx.
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { AftrekkenStippen, type StippenProps } from "../vlakken/aftrekken-stippen";
import { AftrekkenTorens, ORANJE, PAARS, type TorensProps } from "../vlakken/aftrekken-torens";

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

/* ---------- de stippenmachine ---------- */

type Stipmelding = { soort: string; aantal: number };

/** Bedient de stippenmachine vanuit het draaiboek. */
function stippenmachine(l: Lesgids) {
  let zet = 0;
  return {
    toon(p: Omit<StippenProps, "zet">) {
      zet++;
      l.vlak<StippenProps>(AftrekkenStippen, { ...p, zet });
    },
    /** Een nieuw aantal stippen neerzetten. */
    zet(aantal: number, extra: Partial<StippenProps> = {}) {
      zet++;
      l.pasVlakAan<StippenProps>({ ...extra, aantal, zet });
    },
    pas(p: Partial<StippenProps>) {
      l.pasVlakAan<StippenProps>(p);
    },
    /** Het kind tikt op de plusknop tot er `doel` stippen zijn. */
    async plusTot(doel: number) {
      l.pasVlakAan<StippenProps>({ plus: "aan", plusTot: doel });
      for (;;) {
        const g = await l.wachtOpVlak<Stipmelding>("plus");
        if (g.aantal >= doel) break;
      }
      l.pasVlakAan<StippenProps>({ plus: "dof", plusTot: 20 });
    },
    /** Het kind zapt tot er nog `doel` stippen zijn. */
    async zapTot(doel: number) {
      l.pasVlakAan<StippenProps>({ zapper: "aan", zapTot: doel });
      for (;;) {
        const g = await l.wachtOpVlak<Stipmelding>("zap");
        if (g.aantal <= doel) break;
      }
      l.pasVlakAan<StippenProps>({ zapper: "dof", zapTot: 0 });
    },
  };
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

/* ---------- de toets (instap en eind) ---------- */

type Toetsgetallen = {
  stippen: number;
  weg: number;
  keuzes: string[];
  oranje: number;
  paars: number;
  verschilKeuzes: string[];
  overgang: boolean;
};

async function toets(l: Lesgids, t: Toetsgetallen) {
  const over = t.stippen - t.weg;
  const m = stippenmachine(l);

  /* Begin: de som groot in beeld. */
  m.toon({ aantal: 0, plus: "weg", zapper: "weg", teller: false });
  l.som(somDelen(`${t.stippen} − ${t.weg} = ?`));
  await l.zeg("We gaan minsommen leren.", "Kun je dat al?");
  const al = await l.kies(["Ja", "Nee"]);
  await l.zeg(al === "Ja" ? "Oké." : "Geen probleem.", al === "Ja" ? "Laat maar zien wat je kunt." : "We kijken eerst wat je al weet.");
  l.som(null);

  /* Stippen maken. */
  m.pas({ plus: "dof" });
  await l.zeg("Zie je de knop rechts?", `Tik erop tot er {${t.stippen}} stippen zijn.`);
  await m.plusTot(t.stippen);
  m.pas({ zapper: "dof" });
  await l.zeg("Goed zo.", `Je hebt {${t.stippen}} stippen gemaakt.`);
  await l.verder();

  /* Stippen wegzappen. */
  await l.zeg("Nu halen we er stippen af.", "Met de bliksemknop haal je een stip weg.", `Haal er {${t.weg}} weg.`);
  await m.zapTot(over);

  /* Welke som? */
  const goedeSom = `${t.stippen} − ${t.weg}`;
  await l.zeg(`We hadden {${t.stippen}} stippen.`, `Je hebt er {${t.weg}} weggehaald.`, "Welke som past daarbij?");
  const meteen = await toetsKeuze(
    l,
    t.keuzes,
    goedeSom,
    [`Je begon met {${t.stippen}}.`, `Je haalde er {${t.weg}} weg.`, "Welke som laat dat zien?"],
    [`Het is {${t.stippen}} − {${t.weg}}.`, `Je begon met {${t.stippen}} en haalde er {${t.weg}} weg.`],
  );
  if (meteen) await l.zeg("Precies.", `${kleur(goedeSom)}.`);

  /* Hoeveel blijft er over? */
  l.som(somDelen(`${goedeSom} = ?`));
  await l.zeg("Kun je deze uitrekenen?", `Hoeveel is ${kleur(goedeSom)}?`);
  const somGoed = await vraagGetal(l, over, {
    fout: (x) => (x < 0 ? ["Tel de stippen die over zijn."] : [`${kleur(goedeSom)} = {${x}}?`, "We kijken nog eens.", "Tel de stippen die over zijn."]),
    antwoord: [`Er zijn {${over}} stippen over.`, `Dus ${kleur(goedeSom)} = {${over}}.`],
  });
  l.som(somDelen(`${goedeSom} = ${over}`));
  if (somGoed) await l.zeg("Juist.", `${kleur(goedeSom)} = {${over}}.`);
  await l.wacht(500);
  l.som(null);

  /* Hoeveel moeten er nog weg tot 0? */
  await l.zeg("Hoeveel stippen moeten er nog weg?", "Er mogen geen stippen overblijven.");
  for (let poging = 0; ; poging++) {
    const x = await l.getal();
    if (x === over) {
      l.som(somDelen(`${over} − ${over} = 0`));
      await l.zeg("Juist.", `{${over}} − {${over}} = {0}.`);
      break;
    }
    if (poging === 0 && x !== null) {
      /* Zoals Synthesis: de som met het antwoord van het kind en een vraagteken, en de bliksemknop licht op. */
      l.som([...somDelen(`${over} − ${over} = ${x}`), { t: "teken", s: "?" }]);
      m.pas({ zapper: "aan", zapTot: 0 });
      await l.zeg(`{${over}} − {${over}} = {${x}}?`, "Kijk nog eens.", `Hoeveel van deze {${over}} stippen moeten er weg?`);
      l.som(null);
      continue;
    }
    l.som(null);
    m.zet(over, { zapper: "dof" });
    await l.zeg(x === null ? "Geen zorgen." : "We doen het samen.", "Haal ze weg met de bliksemknop.");
    await m.zapTot(0);
    l.som(somDelen(`${over} − ${over} = 0`));
    await l.zeg(`Je haalde er {${over}} weg.`, `{${over}} − {${over}} = {0}.`);
    await l.verder();
    break;
  }
  m.zet(0, { zapper: "dof" });
  await l.wacht(600);
  l.som(null);

  /* Het verschil tussen twee torens. */
  const tr = torens(l);
  tr.toon({ links: t.oranje, rechts: 0, binnen: true, cijfers: true });
  if (t.overgang) {
    await l.zeg("Nu doen we min op een andere manier.");
    await l.verder();
  }
  await l.zeg(`Kun je een toren van {${t.paars}} maken?`, "Tik op het paarse ruimteschip.");
  await tr.bouwTot("rechts", t.paars, 0);
  const verschil = t.oranje - t.paars;
  await l.zeg("Wat is het verschil tussen de torens?", `Tussen {${t.oranje}} en {${t.paars}}?`);
  const vGoed = await vraagGetal(l, verschil, {
    fout: (x) =>
      x < 0
        ? ["Hoeveel blokken steekt de oranje toren boven de paarse uit?"]
        : [`{${t.oranje}} − {${t.paars}} = {${x}}?`, "We kijken nog eens.", "Hoeveel blokken steekt de oranje toren boven de paarse uit?"],
    antwoord: [`De oranje toren heeft {${verschil}} blokken meer.`, `Het verschil is {${verschil}}.`],
  });
  if (vGoed) await l.zeg("Ja.", `Een verschil van {${verschil}}.`);

  const goedeVerschilSom = `${t.oranje} − ${t.paars} = ${verschil}`;
  await l.zeg("Hoe schrijf je dat verschil als som?");
  const sGoed = await toetsKeuze(
    l,
    t.verschilKeuzes,
    goedeVerschilSom,
    ["Het verschil is een minsom.", "Welke som past bij de torens?"],
    [`Het is ${kleur(goedeVerschilSom)}.`, `De hoogste toren min de laagste toren.`],
  );
  if (sGoed) await l.zeg("Heel goed gezien.", `${kleur(goedeVerschilSom)}.`);
  await l.verder();

  /* De kaart. */
  const tik = l.kaart();
  await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "Je kunt minsommen maken onder de {10}.", "Tik op de kaart om hem af te vinken.");
  await tik;
}

/* ---------- les 1: instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "aftrekken-10-instaptoets",
  titel: "Instaptoets: aftrekken tot 10",
  synthesis: "Subtract Within 10 · Assessment",
  kaarttekening: KaartBliksem,
  async speel(l) {
    await toets(l, {
      stippen: 9,
      weg: 5,
      keuzes: ["9 − 5", "10 − 5", "9 − 4", "9 + 5"],
      oranje: 8,
      paars: 5,
      verschilKeuzes: ["8 − 5 = 3", "8 − 5 = 2", "8 − 5 = 4", "8 + 5 = 13"],
      overgang: false,
    });
  },
};

/* ---------- les 2: stippen weghalen ---------- */

const stippenWeghalen: Lesdraaiboek = {
  id: "aftrekken-10-stippen-weghalen",
  titel: "Stippen weghalen",
  synthesis: "Subtract Within 10 · Dot Destruction",
  kaarttekening: KaartBliksem,

  async speel(l) {
    const m = stippenmachine(l);
    m.toon({ aantal: 0, plus: "dof", zapper: "weg", teller: true });

    /* 1. Even kennismaken. */
    await l.zeg("Voor we beginnen, even een vraag.", "Heb je al eens minsommen gemaakt?");
    const al = await l.kies(["Ja, dat heb ik al gedaan", "Nee, nog niet"]);
    await l.zeg(al === "Ja, dat heb ik al gedaan" ? "Mooi." : "Geen probleem.", "De stippenmachine helpt ons.", "Ik laat zien wat hij doet.");
    await l.verder();

    /* 2. De plusknop en het getal. */
    m.pas({ cirkel: "plus" });
    await l.zeg("Druk op de knop rechts.");
    await m.plusTot(1);
    m.pas({ cirkel: "teller" });
    await l.zeg("Kijk hier.", "Dit getal zegt hoeveel stippen er zijn.");
    await l.verder();
    m.pas({ cirkel: null });

    await l.zeg("Doe er nog wat stippen bij.", "Kijk wat er met het getal gebeurt.");
    await m.plusTot(3);
    m.pas({ cirkel: "teller" });
    await l.zeg("Mooi.", "Wat gebeurt er als je er een stip bij doet?");
    const hoger = await l.kies(["Het getal wordt hoger", "Het getal wordt lager"]);
    m.pas({ cirkel: null });
    if (hoger === "Het getal wordt hoger") {
      await l.zeg("Ja!", "Elke stip erbij maakt het getal hoger.");
      await l.verder();
    } else {
      await l.zeg(hoger === null ? "Geen zorgen." : "Kijk nog eens goed.", "Ik maak de machine leeg.", "We doen het stap voor stap.");
      await l.verder();
      m.zet(0, { cirkel: "teller" });
      await l.zeg("Er zijn geen stippen.", "Het getal is nu {0}.");
      await l.verder();
      await l.zeg("Doe er één stip bij.", "Kijk naar het getal.");
      await m.plusTot(1);
      await l.zeg("We hadden {0}.", "Nu hebben we er {1}.", "Het getal is hoger geworden.");
      await l.verder();
      await l.zeg("Wordt het steeds hoger als je blijft drukken?");
      const steeds = await l.kies(["Ja", "Nee"]);
      await l.zeg(steeds === "Ja" ? "Dat gaan we zien." : "We proberen het.", "Doe er nog een stip bij.");
      await m.plusTot(2);
      await l.zeg("Kijk, nu is het {2}.", "Elke stip erbij maakt het getal hoger.");
      await l.verder();
      m.pas({ cirkel: null });
    }

    /* 3. Dat is een plussom. */
    await l.zeg("Welke som maak je met deze knop?");
    const doe = await l.kies(["Een plussom", "Een minsom"]);
    if (doe === "Een plussom") {
      await l.zeg("Ja, zo simpel is het.", "Je doet er stippen bij.");
    } else {
      await l.zeg(doe === null ? "Geen zorgen." : "Kijk goed.", "De machine doet er steeds een stip *bij*.", "Dat is een plussom.");
    }
    await l.verder();

    /* 4. Optellen met de machine. */
    m.zet(2);
    await l.zeg("Er zitten nu {2} stippen in de machine.", "Hoeveel zijn het er als er {3} bij komen?");
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
      await l.zeg(x === null ? "Geen zorgen." : "We doen het samen.", "Doe er {3} stippen bij.");
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
      await l.zeg("Doe er eerst {1} stip bij.");
      await m.plusTot(1);
      await l.zeg("Nu {2} erbij.");
      await m.plusTot(3);
      await l.zeg("Dan {3} erbij.");
      await m.plusTot(6);
      await l.zeg("En nog {4}.");
      await m.plusTot(10);
      await l.zeg("Mooi zo.", "Hoeveel stippen zijn er nu?");
      await vraagGetal(l, 10, {
        fout: () => ["Kijk naar het getal bij de knop."],
        antwoord: ["Het zijn er {10}.", "{1} + {2} + {3} + {4} = {10}."],
      });
    }
    l.som(null);

    /* 5. Aftrekken = weghalen. */
    await l.zeg("De machine helpt ook bij minsommen.", "Hoe maak je met stippen een minsom?");
    const hoe = await l.kies(["Er stippen bij doen", "Er stippen weghalen"]);
    if (hoe === "Er stippen weghalen") {
      await l.zeg("Precies.", "Dat gaan we nu doen.");
    } else {
      await l.zeg(hoe === null ? "Geen zorgen." : "Er stippen bij doen is een plussom.", "Bij een minsom haal je stippen weg.");
      await l.verder();
    }
    m.pas({ zapper: "dof", cirkel: "zapper" });
    await l.zeg("Druk op de bliksemknop.", "Dan haal je een stip weg.");
    await m.zapTot(9);
    m.pas({ cirkel: null });
    await l.zeg("Mooi.", "Je hebt een stip weggehaald.", "Het getal ging van {10} naar {9}.");
    await l.verder();

    /* 6. Het minteken. */
    await l.zeg("Bij een plussom hoort het plusteken.", "Welk teken hoort bij een minsom?");
    let tekens = ["+", "=", "−"];
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
      await l.zeg(t === "+" ? "Dat is het plusteken." : "Dat is het is-teken.", "Welke van deze twee is het dan?");
      tekens = tekens.filter((x) => x !== t);
    }
    l.som(somDelen("10 − 1"));
    await l.zeg("Zo schrijf je een minsom:", "{10} − {1}.", "We begonnen met {10}.", "We haalden er {1} weg.");
    await l.verder();
    l.som(null);

    /* 7. Een minsom in je hoofd. */
    m.zet(0, { zapper: "weg" });
    await l.zeg("We doen een minsom vanaf het begin.", "Doe er {5} stippen in.");
    await m.plusTot(5);
    l.som(somDelen("5 − 2 = ?"));
    await l.zeg("Nu reken je in je hoofd.", "Hoeveel is {5} − {2}?");
    for (let poging = 0; ; poging++) {
      const x = await l.getal();
      if (x === 3) {
        await l.zeg("Dat klopt.", "Je haalde de stippen weg in je hoofd.");
        break;
      }
      if (poging >= 1) {
        await l.zeg("Er zijn {3} stippen over.", "Dus {5} − {2} = {3}.");
        await l.verder();
        break;
      }
      await l.zeg(x === null ? "Geen zorgen." : "Kijk mee.", "We hebben {5} stippen.", "Haal er {2} weg met de bliksemknop.");
      m.pas({ zapper: "dof" });
      await m.zapTot(3);
      await l.zeg("Tel wat er over is.", "Hoeveel is {5} − {2}?");
    }
    l.som(somDelen("5 − 2 = 3"));
    await l.wacht(700);

    /* 8. 10 − 4, met de zapper als hulp. */
    m.zet(10, { zapper: "aan", plus: "dof", zapTot: 0 });
    l.som(somDelen("10 − 4 = ?"));
    await l.zeg("Gebruik de bliksemknop als dat helpt.", "Er zitten {10} stippen in de machine.", "Hoeveel blijven er over als je er {4} weghaalt?");
    const tien = await l.getal();
    if (tien === 6) {
      await l.zeg("Je hebt het!");
    } else {
      await l.zeg(tien === null ? "Geen zorgen." : "Hmm, dat klopt nog niet.", "We doen het samen.");
      m.zet(10, { zapper: "dof" });
      await l.zeg("Haal er {4} weg.");
      await m.zapTot(6);
      await l.zeg("Er zijn {6} stippen over.", "{10} − {4} = {6}.");
    }
    l.som(somDelen("10 − 4 = 6"));
    m.pas({ zapper: "weg" });
    await l.verder();
    l.som(null);

    /* 9. Alles weghalen: dan houd je 0 over. */
    await l.zeg("Ik wil je nog één belangrijk ding laten zien.", "Daarna gaan we oefenen.");
    await l.verder();
    m.zet(20, { zapper: "dof" });
    await l.zeg("Nu zijn er {20} stippen.", "Hoeveel moet je weghalen?", "Er mogen geen stippen overblijven.");
    const twintig = await vraagGetal(l, 20, {
      fout: (x) => (x < 0 ? ["Alle stippen moeten weg."] : x < 20 ? ["Dan blijven er nog stippen over.", "Alle stippen moeten weg."] : ["Zoveel stippen zijn er niet.", "Alle stippen moeten weg."]),
      antwoord: ["Je moet ze alle {20} weghalen."],
    });
    if (twintig) await l.zeg("Goed zo.");
    await l.zeg("Wil jij ze weghalen?", "Of zal ik het doen?");
    const wie = await l.kies(["Ik doe het zelf", "Doe jij het maar"]);
    if (wie === "Ik doe het zelf") {
      await l.zeg("Ga je gang.");
      await m.zapTot(0);
    } else {
      await l.zeg("Daar gaan ze!");
      m.zet(0);
      await l.wacht(700);
    }
    await l.zeg("Een getal min hetzelfde getal is altijd {0}.", "Haal je alles weg, dan blijft er niets over.");
    await l.verder();

    /* 10. Oefenen; de machine mag je zelf gebruiken. */
    await l.zeg("Je hebt het door.", "We doen er nog een paar.", "Gebruik de machine zoveel je wilt.");
    const oefen: [number, number, string][] = [
      [5, 4, "Goed zo."],
      [12, 9, "Ja, dat klopt."],
      [8, 7, "Knap gedaan."],
      [14, 11, "Precies."],
    ];
    for (const [a, b, lof] of oefen) {
      m.zet(0, { plus: "aan", zapper: "aan", plusTot: 20, zapTot: 0 });
      l.som(somDelen(`${a} − ${b} = ?`));
      await l.zeg(`Hoeveel is {${a}} − {${b}}?`);
      const x = await l.getal();
      if (x === a - b) {
        await l.zeg(lof);
      } else {
        await l.zeg(x === null ? "Geen zorgen." : "Dat klopt nog niet.", "We doen het samen.");
        m.zet(a, { plus: "dof", zapper: "dof" });
        await l.wacht(900);
        m.zet(a - b, { plus: "dof", zapper: "dof" });
        await l.wacht(600);
        await l.zeg(`Ik haalde er {${b}} weg.`, "Wat overblijft, is je antwoord.", `Hoeveel is {${a}} − {${b}}?`);
        await vraagGetal(l, a - b, {
          fout: () => ["Tel de stippen die over zijn."],
          antwoord: [a - b === 1 ? "Er is {1} stip over." : `Er zijn {${a - b}} stippen over.`, `{${a}} − {${b}} = {${a - b}}.`],
        });
      }
      l.som(somDelen(`${a} − ${b} = ${a - b}`));
      await l.wacht(800);
    }
    l.som(null);

    /* 11. Terugblik. */
    m.zet(0, { plus: "dof", zapper: "dof" });
    await l.zeg("Je hebt goed minsommen gemaakt met de machine.", "Zullen we herhalen wat je hebt geleerd?");
    const terug = await l.kies(["Ja, graag", "Nee, ik snap het"]);
    if (terug !== "Nee, ik snap het") {
      await l.zeg("Oké, daar gaan we.");
      m.zet(1);
      await l.zeg("Eerst deden we er stippen bij.", "Dan wordt het getal hoger.");
      m.zet(7);
      await l.wacht(800);
      m.zet(6);
      await l.wacht(450);
      m.zet(5);
      await l.zeg("Daarna haalden we stippen weg.", "Dan wordt het getal lager.");
      /* De stippen gaan één voor één weg, zoals bij Synthesis. */
      for (let n = 4; n >= 0; n--) {
        m.zet(n);
        await l.wacht(400);
      }
      await l.zeg("We haalden er evenveel weg als er waren.", "Dan houd je {0} over.");
      await l.verder();
    }

    /* Einde: de kaart. */
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gewerkt vandaag, ${l.naam}!` : "Goed gewerkt vandaag!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 3: het verschil ---------- */

/** "Tik op Klaar": wacht tot het kind klaar is of om hulp vraagt. */
async function klaarOfHulp(l: Lesgids): Promise<Torenmelding> {
  return l.wachtOpVlak<Torenmelding>(["klaar", "hulp"]);
}

const verschil: Lesdraaiboek = {
  id: "aftrekken-10-verschil",
  titel: "Het verschil",
  synthesis: "Subtract Within 10 · Difference Dimension",
  kaarttekening: KaartTorens,

  async speel(l) {
    const t = torens(l);
    const KNOPPEN = { klaar: "Klaar", hulp: "Hulp" };
    const vol = { links: true, rechts: true };

    /* 1. Een toren bouwen. */
    t.toon({ links: 0, rechts: 0, binnen: true });
    await l.zeg("Zie je het paarse ruimteschip?", "Tik erop en kijk wat er gebeurt.");
    t.pas({ ufo: { rechts: true }, max: { rechts: 1 } });
    await l.wachtOpVlak("erbij");
    t.zet(0, 1, { ufo: {}, max: {} });
    await l.zeg("Wauw!", "Tik er nog eens op.");
    await t.bouwTot("rechts", 2, 1);
    await l.zeg("Je bent een ruimtetoren begonnen.", "Hoeveel blokken is hij hoog?");
    const twee = await vraagGetal(l, 2, {
      fout: () => ["Hmm, kijk naar de paarse blokken.", "Hoeveel zijn het er?"],
      antwoord: ["Het zijn er {2}.", "De toren is {2} blokken hoog."],
    });
    if (twee) await l.zeg("Ja.", "De toren is {2} blokken hoog.");

    await l.zeg("We bouwen hem hoger.", "Tik tot de toren {7} blokken hoog is.");
    await t.bouwTot("rechts", 7, 2);
    await l.zeg("Heel gaaf.", "Het ruimteschip kan nog iets.");
    await l.verder();

    /* 2. De groene straal haalt een blok weg. */
    await l.zeg("Het paarse ruimteschip heeft een groene straal.", "Tik op de straal.");
    await t.bouwTot("rechts", 6, 7);
    await l.zeg("Hé, er is een blok verdwenen!");
    await l.verder();
    await l.zeg("Kun je er nog één weghalen?");
    await t.bouwTot("rechts", 5, 6);
    await l.zeg("Mooi gedaan.");

    /* 3. Even hoog maken. */
    t.zet(0, 5, { ufo: { links: true }, straal: { links: true }, knoppen: KNOPPEN });
    await l.zeg("Nu een opdracht.", "Maak de oranje toren even hoog als de paarse.", "We willen niet dat ze verschillen.", "Tik op Klaar als je klaar bent.");
    for (;;) {
      const g = await klaarOfHulp(l);
      if (g.soort === "klaar" && g.links === 5) {
        t.zet(5, 5, { ufo: {}, straal: {}, knoppen: null });
        await l.zeg("Ja!", "Ze zijn even hoog.");
        break;
      }
      if (g.soort === "hulp") {
        t.pas({ cijfers: true });
        await l.zeg("Tik op het oranje ruimteschip voor een blok erbij.", "Tik op de straal om er één weg te halen.", "Kijk naar de cijfers.");
        continue;
      }
      t.zet(g.links, 5, { cijfers: true, knoppen: null, ufo: {}, straal: {} });
      await l.zeg("Kijk goed.", "De torens zijn nog niet even hoog.", "Ze *verschillen* een beetje.");
      await l.verder();
      await l.zeg(g.links > 5 ? "Haal oranje blokken weg met de straal." : "Zet er oranje blokken bij.");
      await t.bouwTot("links", 5, g.links);
      await l.zeg("Zo is het goed.", "Nu hebben ze evenveel blokken.");
      break;
    }
    t.zet(5, 5, { cijfers: false, knoppen: null });
    await l.zeg("Hoeveel blokken zitten er in *elke* toren?");
    const vijf = await vraagGetal(l, 5, {
      fout: () => ["Tel de oranje blokken maar."],
      antwoord: ["In elke toren zitten {5} blokken."],
    });
    if (vijf) await l.zeg("Ja, dat klopt.", "{5} blokken in elke toren.", "Er is geen verschil.");

    /* 4. Er rommelt iets: nu zijn ze verschillend. */
    t.zet(3, 5);
    await l.zeg("Oei, er rommelt iets aan de torens.", "Zijn ze nog even hoog?");
    const zelfde = await l.kies(["Ze zijn even hoog", "Ze zijn verschillend"]);
    if (zelfde !== "Ze zijn verschillend") {
      await l.zeg(zelfde === null ? "Geen zorgen." : "Hmm, ze lijken niet hetzelfde.", "We kijken nog eens.");
      await l.verder();
      t.pas({ cijfers: true });
      await l.zeg("Tel de oranje blokken.", "Hoeveel zie je?");
      const drie = await vraagGetal(l, 3, {
        fout: () => ["Kijk naar de cijfers naast de oranje toren."],
        antwoord: ["Het zijn er {3}."],
      });
      if (drie) await l.zeg("Dat klopt!", "De oranje toren is {3} blokken hoog.");
      t.pas({ cijfers: false });
    } else {
      await l.zeg("Ja, ze zijn verschillend.");
    }
    await l.zeg("{3} blokken in de oranje toren.", "{5} blokken in de paarse toren.");
    await l.verder();

    await l.zeg("Heb je al eens het verschil gezocht?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We leren samen iets nieuws.");
    await l.verder();

    await l.zeg("Wat is er anders aan de torens?");
    const anders = await l.kies(["De paarse toren heeft meer blokken", "De oranje toren heeft meer blokken"]);
    if (anders === "De paarse toren heeft meer blokken") {
      await l.zeg("Dat klopt.");
    } else {
      t.pas({ cijfers: true });
      await l.zeg(anders === null ? "Geen zorgen." : "Kijk nog eens.", "De paarse toren is hoger.", "De paarse toren heeft meer blokken.");
      await l.verder();
      t.pas({ cijfers: false });
    }
    await l.zeg("Dan moeten er oranje blokken bij.", "Maak ze weer even hoog met het oranje ruimteschip.");
    await t.bouwTot("links", 5, 3);
    await l.zeg("Zo is het goed.");

    /* 5. De botsschuif. */
    await l.zeg("Oké, nu iets nieuws.", "Ik heb een apparaatje voor je.");
    await l.verder();
    t.zet(5, 5);
    t.pas({ schuif: true });
    await l.zeg("Het heet de botsschuif.", "Schuif het rondje helemaal naar de overkant.", "Laat dan los.");
    await t.bots();
    await l.zeg("Wauw!", "Wat is er met de blokken gebeurd?");
    const weg = await l.kies(["Ze vielen tegen elkaar weg"]);
    if (weg === null) {
      await l.zeg("Dat is niet erg.", "Het is een lastig idee.", "We kijken beter wat er gebeurt als ze botsen.");
    } else {
      await l.zeg("Ja!", "We kijken nog beter hoe dat gaat.");
    }
    await l.verder();

    t.zet(1, 1, { schuif: false, cijfers: true });
    await l.zeg("Kleine torens, hè?", "Is één blok eigenlijk wel een toren?", "Hmm, dat zoeken we later uit.");
    await l.verder();
    await l.zeg("Hoe hoog is elke toren nu?");
    const een = await l.kies(["1", "2"]);
    await l.zeg(een === "1" ? "Klopt." : "Kijk naar de cijfers.", "Elke toren heeft één blok onderaan.");
    await l.verder();
    await l.zeg("Beide blokken zitten op dezelfde hoogte.", "Dus botsen ze tegen elkaar.", "En dan vallen ze weg.");
    await l.verder();
    t.pas({ cijfers: false });
    await l.zeg("Laat de torens nu botsen.");
    await t.bots();
    await l.zeg("Daar gaan ze!", "Allebei een blok op dezelfde hoogte.", "Ze vielen tegen elkaar weg.");
    await l.verder();

    t.zet(3, 3, { schuif: false, cijfers: true });
    await l.zeg("Nu bouw ik hogere torens.", "Hoeveel blokken heeft elke toren?");
    const drie = await vraagGetal(l, 3, {
      fout: () => ["Kijk naar de cijfers."],
      antwoord: ["Elke toren heeft {3} blokken."],
    });
    if (drie) await l.zeg("Dat klopt.");
    await l.zeg("Wat gebeurt er als ze botsen?");
    const voorspel = await l.kies(["Ze vallen allemaal weg", "Er gebeurt niets"]);
    await l.zeg(voorspel === "Ze vallen allemaal weg" ? "Misschien heb je gelijk." : "We gaan het zien.", "Laat ze nu botsen.");
    t.pas({ cijfers: false });
    await t.bots();
    await l.zeg("Wauw!", "Beide torens hadden {3} blokken.", "Ze vielen allemaal tegen elkaar weg.");
    await l.verder();

    /* 6. De aliens: 5 tegen 4. */
    t.zet(0, 0, { schuif: false });
    await l.zeg("De aliens hebben je hulp nodig.");
    await l.verder();
    t.pas({ ufo: vol, straal: vol, knoppen: KNOPPEN });
    await l.zeg("De oranje aliens willen {5} blokken.", "De paarse aliens willen {4} blokken.", "Bouw hun torens.", "Tik op Klaar als het af is.");
    for (;;) {
      const g = await klaarOfHulp(l);
      if (g.soort === "klaar" && g.links === 5 && g.rechts === 4) break;
      t.pas({ cijfers: true });
      if (g.soort === "hulp") {
        await l.zeg("Tik op een ruimteschip voor een blok erbij.", "Tik op de straal om er één weg te halen.");
      } else {
        await l.zeg(`Je torens zijn {${g.links}} en {${g.rechts}} hoog.`, "Oranje moet {5} zijn, paars {4}.");
      }
    }
    t.zet(5, 4, { ufo: {}, straal: {}, knoppen: null, cijfers: false });
    await l.zeg("Goed gedaan.");
    await l.verder();
    await l.zeg("Eerst een voorspelling.", "Welke toren houdt blokken over na de botsing?");
    const winnaar = await l.kies(["De oranje toren", "De paarse toren"]);
    await l.zeg(
      winnaar === "De oranje toren" ? "Jij denkt de oranje toren." : winnaar === "De paarse toren" ? "Jij denkt de paarse toren." : "We gaan het zien.",
      "Laat ze botsen, dan zien we het.",
    );
    await t.bots();
    await l.zeg("Wauw!", "De oranje toren houdt één blok over.");
    await l.verder();
    await l.zeg("Van elke toren vielen {4} blokken weg.", "Maar er bleef {1} oranje blok over.", "Waarom viel dat blok niet weg?");
    const waarom = await l.kies(["Er zat geen paars blok naast", "Er waren meer paarse blokken"]);
    if (waarom === "Er zat geen paars blok naast") {
      await l.zeg("Ja.", "De oranje toren had één blok extra.");
    } else {
      await l.zeg("Kijk, naast het bovenste oranje blok zit geen paars blok.", "Daarom bleef het over.");
    }
    await l.verder();
    await l.zeg("Wat was het verschil tussen de torens?");
    const eenGoed = await vraagGetal(l, 1, {
      fout: () => ["Tel de blokken die over zijn."],
      antwoord: ["Er bleef {1} blok over.", "Het verschil is {1}."],
    });
    if (eenGoed) await l.zeg("Je hebt het.", "De oranje toren had {1} blok meer.", "Het verschil is {1}.");

    /* 7. Is het verschil plus of min? */
    t.zet(3, 5, { schuif: false });
    await l.zeg("Nu {3} oranje tegen {5} paarse.", "Laat ze maar botsen!");
    await t.bots();
    await l.zeg("Er blijven {2} paarse blokken over.");
    await l.verder();
    await l.zeg("Nu heb ik een vraag.", "Op welke soort sommen lijkt het verschil zoeken?");
    const soort = await l.kies(["Plussommen", "Minsommen"]);
    if (soort !== "Minsommen") {
      await l.zeg(soort === null ? "Geen zorgen." : "Hmm, vind je het verschil met een plussom?", "We kijken samen.");
      await l.verder();
      t.zet(1, 2, { schuif: false, cijfers: true });
      await l.zeg("Hier is een toren van {1}.", "En een toren van {2}.", "Hoeveel is dat samen?");
      const samen = await vraagGetal(l, 3, {
        fout: () => ["Tel alle blokken."],
        antwoord: ["Samen zijn het er {3}."],
      });
      if (samen) await l.zeg("Ja.", "{1} + {2} = {3}.");
      await l.zeg("Maar voor het verschil laten we ze botsen.");
      t.pas({ cijfers: false });
      await t.bots();
      await l.zeg("Kijk naar het paarse blok dat over is.", "Hoeveel blokken verschillen de torens?");
      const v1 = await vraagGetal(l, 1, {
        fout: () => ["Tel de blokken die over zijn."],
        antwoord: ["Er is {1} blok over.", "Het verschil is {1}."],
      });
      if (v1) await l.zeg("Ja!", "Het verschil is {1}.");
      t.zet(1, 2, { schuif: false });
      await l.zeg("Het verschil is {1}.", "Maar samen was het {3}.", "Een plussom helpt dus niet bij het verschil.");
      await l.verder();
      await l.zeg("Wat helpt wel om het verschil te vinden?");
      const wel = await l.kies(["Een plussom", "Een minsom"]);
      if (wel !== "Een minsom") await l.zeg("Het is een minsom.");
    } else {
      await l.zeg("Ja!");
    }
    await l.zeg("Precies, kapitein!", "Blokken laten wegvallen is een minsom.", "Je haalt ze weg.");
    await l.verder();

    /* 8. Welke som hoort erbij? 5 en 3. */
    t.zet(5, 3, { schuif: false, cijfers: true });
    await l.zeg("Welke som helpt je het verschil te vinden?");
    const hulpsom = await toetsKeuze(
      l,
      ["5 + 3", "5 − 3", "5 − 2"],
      "5 − 3",
      ["Bij het verschil haal je blokken weg.", "Welke som past bij deze torens?"],
      ["Het is {5} − {3}."],
    );
    if (hulpsom) await l.zeg("Precies, kapitein.", "Het is {5} − {3}.");
    await l.zeg("Wil je de torens laten botsen?", "Of weet je het verschil al?");
    const weet = await l.kies(["Laat ze botsen", "Ik weet het al"]);
    if (weet === "Ik weet het al") {
      await l.zeg("Wat is het verschil tussen {5} en {3}?", "Of: hoeveel is {5} − {3}?");
      const x = await l.getal();
      if (x === 2) {
        await l.zeg("Dat klopt.", "Knap dat je dat in je hoofd kon.");
        /* Ter controle: twee oranje blokken weg, dan zijn ze even hoog. */
        t.zet(3, 3, { schuif: false, cijfers: true });
        await l.wacht(900);
        t.zet(5, 3, { schuif: false, cijfers: true });
      } else {
        await l.zeg("Laat ze botsen om te kijken.");
        t.pas({ cijfers: false });
        await t.bots();
        await l.zeg("Er blijven {2} oranje blokken over.", "Het verschil is {2}.");
        await l.verder();
      }
    } else {
      t.pas({ cijfers: false });
      await t.bots();
      await l.zeg("Hoeveel blokken zijn er over?");
      await vraagGetal(l, 2, { fout: () => ["Tel de oranje blokken die over zijn."], antwoord: ["Er zijn {2} over.", "Het verschil is {2}."] });
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
        await l.zeg("Geen zorgen.", "We vergelijken de sommen met de torens.");
      } else {
        await l.zeg("{5} − {2} = {3}.", "Ik snap waarom je die koos.", "Maar we vergelijken hem met de torens.");
      }
      await l.verder();
      await l.zeg("De oranje toren heeft {5} blokken.", "Hoeveel halen we eraf?", "Hoeveel blokken heeft de kleine toren?");
      const af = await l.kies(["2", "3"]);
      await l.zeg(af === "3" ? "Ja, dat klopt." : "De kleine toren heeft {3} blokken.");
      await l.zeg("We hebben {5} blokken.", "We halen er {3} af.", "Dus schrijven we {5} − {3}.");
      await l.verder();
      t.pas({ cijfers: false });
      await l.zeg("Laat ze nu botsen.");
      await t.bots();
      l.som([{ t: "getal", n: 5 }, { t: "teken", s: "−" }, { t: "getal", n: 3 }, { t: "teken", s: "=" }, { t: "vak" }]);
      await l.zeg("Maak de som af.");
      let fout = 0;
      while ((await l.somVak(4)) !== 2) {
        fout++;
        await l.zeg(fout === 1 ? "Tel de oranje blokken die over zijn." : "Er zijn {2} over. Typ de {2}.");
      }
      l.som([{ t: "getal", n: 5 }, { t: "teken", s: "−" }, { t: "getal", n: 3 }, { t: "teken", s: "=" }, { t: "getal", n: 2 }]);
      await l.zeg("Goed zo, kapitein!", "{5} en {3} verschillen {2}.", "{5} − {3} = {2}.");
      await l.verder();
      l.som(null);
    }

    /* 9. 3 tegen 8. */
    t.zet(0, 0, { schuif: false, cijfers: false, ufo: vol, straal: vol, knoppen: KNOPPEN });
    await l.zeg("Nieuwe opdracht.", "De oranje aliens willen {3} blokken.", "De paarse aliens willen er {8}.", "Tik op Klaar als het af is.");
    for (;;) {
      const g = await klaarOfHulp(l);
      if (g.soort === "klaar" && g.links === 3 && g.rechts === 8) break;
      t.pas({ cijfers: true });
      if (g.soort === "hulp") {
        await l.zeg("Tik op een ruimteschip voor een blok erbij.", "Tik op de straal om er één weg te halen.");
      } else {
        await l.zeg(`Je torens zijn {${g.links}} en {${g.rechts}} hoog.`, "Oranje moet {3} zijn, paars {8}.");
      }
    }
    t.zet(3, 8, { ufo: {}, straal: {}, knoppen: null, cijfers: false });
    await l.zeg("Bravo.", "Wie houdt er blokken over na de botsing?");
    const wie = await l.kies(["Oranje", "Paars"]);
    let gok: number | null = null;
    if (wie === "Paars") {
      await l.zeg("Met hoeveel blokken winnen ze dan?", "Hoeveel verschillen de torens?");
      gok = await l.getal();
      await l.zeg("We zoeken het uit.", "Laat ze botsen.");
    } else {
      await l.zeg(wie === "Oranje" ? "Jij denkt oranje." : "We gaan het zien.", "Laat ze botsen.");
    }
    await t.bots();
    if (gok === 5) {
      await l.zeg("Precies zoals je zei!", "De paarse toren houdt {5} blokken over.");
    } else if (wie === "Paars" && gok !== null) {
      await l.zeg("De paarse toren houdt blokken over, zoals je zei!", `Maar ${gok > 5 ? "minder" : "meer"} blokken dan je dacht.`);
    } else {
      await l.zeg("De paarse toren houdt blokken over.");
    }
    await l.verder();
    if (gok !== 5) {
      await l.zeg("Tel de paarse blokken die over zijn.", "Hoeveel verschillen de torens?");
      await vraagGetal(l, 5, { fout: () => ["Tel alleen de paarse blokken die over zijn."], antwoord: ["Er zijn {5} over."] });
    }
    await l.zeg("Dat klopt, kapitein.", "Deze torens verschillen {5}.");
    t.zet(3, 8, { schuif: false, cijfers: true });
    await l.zeg("Ik vraag het nog op een andere manier.", "Welke som laat het verschil zien?");
    const s8 = await toetsKeuze(
      l,
      ["8 − 3 = 4", "8 + 3 = 11", "8 − 3 = 5"],
      "8 − 3 = 5",
      ["Begin bij de hoogste toren.", "Haal de kleine toren eraf."],
      ["Het is {8} − {3} = {5}."],
    );
    if (s8) await l.zeg("Je hebt helemaal gelijk.", "{8} − {3} = {5}.");
    await l.verder();

    /* 10. Zelf een verschil van 3 maken. */
    await l.zeg("Kapitein, er komen nieuwe berichten uit de ruimte.");
    await l.verder();
    t.zet(4, 0, { cijfers: true, ufo: { rechts: true }, straal: { rechts: true }, knoppen: KNOPPEN });
    await l.zeg("Bouw de paarse toren.", "Maak een *verschil* van {3}.", "Tik op Klaar als het af is.");
    const g3 = await klaarOfHulp(l);
    if (g3.soort === "klaar" && Math.abs(4 - g3.rechts) === 3) {
      t.zet(4, g3.rechts, { ufo: {}, straal: {}, knoppen: null });
      await l.zeg("Ja!", `Een toren van {${g3.rechts}} en een toren van {4}.`, "Laat ze botsen om te kijken.");
      await t.bots();
      await l.zeg("Prachtig.", "Ze verschillen {3}.");
      await l.verder();
    } else {
      if (g3.soort === "klaar") {
        t.zet(4, g3.rechts, { ufo: {}, straal: {}, knoppen: null });
        const d = Math.abs(4 - g3.rechts);
        await l.zeg(`Hmm, je torens zijn {4} en {${g3.rechts}} hoog.`, "Laat ze botsen om het verschil te zien.");
        await t.bots();
        await l.zeg(d === 0 ? "Ze vielen allemaal weg." : `Het verschil is {${d}}.`, "Maar de aliens willen een verschil van {3}.");
        await l.verder();
      } else {
        await l.zeg("Natuurlijk help ik je.");
      }
      t.zet(4, 0, { schuif: false, cijfers: true, knoppen: null });
      await l.zeg("Zet {3} paarse blokken *meer* dan oranje.", "Probeer het maar.");
      await t.bouwTot("rechts", 7, 0);
      await l.zeg("Uitstekend, kapitein.", "Een toren van {7} en een toren van {4}.");
      await l.verder();
      await l.zeg("Laat ze botsen om te kijken.");
      await t.bots();
      await l.zeg("Prachtig gedaan.", "Je maakte twee torens met een verschil van {3}.");
      await l.verder();
    }

    await l.zeg("De aliens willen nog een manier zien.");
    t.zet(2, 0, { schuif: false, cijfers: true, ufo: { rechts: true }, straal: { rechts: true }, knoppen: KNOPPEN });
    await l.zeg("Dezelfde opdracht.", "Bouw de paarse toren tot het verschil {3} is.", "Tik op Klaar als het af is.");
    const g4 = await klaarOfHulp(l);
    if (g4.soort === "klaar" && g4.rechts === 5) {
      t.zet(2, 5, { ufo: {}, straal: {}, knoppen: null });
      await l.zeg("Gelukt!", "{5} en {2} verschillen {3}.");
      await l.verder();
    } else {
      await l.zeg(g4.soort === "hulp" ? "Natuurlijk, ik help je op weg." : "Bijna, ik help je op weg.", "Eerst maken we de torens even hoog.");
      await l.verder();
      t.zet(2, 0, { ufo: {}, straal: {}, knoppen: null });
      await l.zeg("Maak de paarse toren even hoog als de oranje.");
      await t.bouwTot("rechts", 2, 0);
      await l.zeg("Goed zo.", "Nu hebben ze evenveel blokken.");
      await l.verder();
      await l.zeg("Maar ze moeten {3} verschillen.", "Zet er nog genoeg paarse blokken bij.", "Tik dan op Klaar.");
      t.pas({ ufo: { rechts: true }, straal: { rechts: true }, knoppen: { klaar: "Klaar" } });
      for (;;) {
        const g = await l.wachtOpVlak<Torenmelding>("klaar");
        if (g.rechts === 5) break;
        await l.zeg("Tel de paarse blokken boven de oranje toren.", "Dat moeten er {3} zijn.");
      }
      t.zet(2, 5, { ufo: {}, straal: {}, knoppen: null });
      await l.zeg("Gelukt!", "{5} en {2} verschillen {3}.");
      await l.verder();
    }

    /* 11. De laatste opdracht: alle torens met een verschil van 4. */
    await l.zeg("De aliens vinden je heel goed.", "Ze hebben nog één laatste opdracht.", "Doe je mee?");
    const mee = await l.kies(["Ja, ik doe mee", "Nee, ik ben klaar"]);
    if (mee !== "Nee, ik ben klaar") {
      await l.zeg(mee === null ? "We proberen het samen." : "Uitstekend.", "Voor de aliens is {4} een geluksgetal.");
      await l.verder();
      const lijst: (string | null)[] = Array(7).fill(null);
      t.zet(0, 0, { cijfers: true, ufo: vol, straal: vol, knoppen: KNOPPEN, lijst });
      await l.zeg("Bouw twee torens met een verschil van {4}.", "Je mag blokken erbij doen en weghalen.", "Tik op Klaar als het af is.");
      const reacties: string[][] = [
        [],
        ["Goed zo!", "Dat zijn er al twee."],
        ["Ja!", "Het bord raakt al vol."],
        ["Raak, kapitein!", "Dat zijn er al vier."],
        ["Mooi!", "Je bent er bijna."],
        ["Nog één te gaan!"],
        ["Gefeliciteerd, kapitein!", "Je hebt ze allemaal gevonden."],
      ];
      let gevonden = 0;
      while (gevonden < 7) {
        const g = await klaarOfHulp(l);
        const hoog = Math.max(g.links, g.rechts);
        const laag = Math.min(g.links, g.rechts);
        if (g.soort === "hulp") {
          const plek = lijst.findIndex((x) => x === null);
          const a = 10 - plek;
          await l.zeg(`Probeer eens een toren van {${a}}.`, `Maak de andere toren {${a - 4}} hoog.`);
          continue;
        }
        if (hoog - laag !== 4) {
          const ander = hoog >= 4 && lijst[10 - hoog] === null ? hoog - 4 : laag + 4;
          await l.zeg(`Torens van {${g.links}} en {${g.rechts}}?`, "Bijna, maar dat is niet het goede verschil.", `Misschien kan een toren {${Math.min(10, ander)}} hoog zijn?`);
          await l.zeg("Zal ik de torens leegmaken?");
          const leeg = await l.kies(["Ja", "Nee"]);
          if (leeg === "Ja") t.zet(0, 0);
          await l.zeg("Ga maar verder.", "Tik op Klaar als je torens af zijn.");
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
          await l.zeg("Maak nog een paar torens met een verschil van {4}.", "Tik op een ruimteschip voor een blok erbij.", "Tik op de straal om er één weg te halen.");
        } else {
          await l.zeg(...reacties[gevonden - 1]);
          if (gevonden === 3 && lijst[6] === null) await l.zeg("Vergeet niet: je kunt ook blokken weghalen.");
        }
      }
      t.pas({ ufo: {}, straal: {}, knoppen: null, cijfers: false });
      await l.verder();
      await l.zeg("Kijk eens naar de lijst.", "Beide getallen gaan steeds één omhoog.", "Het verschil blijft {4}.");
      await l.verder();
      await l.zeg(l.naam ? `Kapitein ${l.naam}, de aliens zeggen dank je wel.` : "Kapitein, de aliens zeggen dank je wel.");
      await l.verder();
      /* Zoals Synthesis: een nieuwe knop tussen de ruimteschepen kondigt de volgende les aan. */
      t.zet(0, 0, { lijst: null, knoop: "plus", knoopAan: false });
      await l.zeg("Je hebt een nieuwe knop verdiend.", "Achter de sterren wacht een nieuwe uitdaging.");
      await l.verder();
    } else {
      await l.zeg("Prima.", "Je hebt al heel veel gedaan.");
    }

    /* Einde: de kaart. */
    const tik = l.kaart();
    await l.zeg("Over en uit, kapitein!", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- les 4: eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "aftrekken-10-eindtoets",
  titel: "Eindtoets: aftrekken tot 10",
  synthesis: "Subtract Within 10 · Mastery Check",
  kaarttekening: KaartBliksem,
  async speel(l) {
    await toets(l, {
      stippen: 8,
      weg: 3,
      keuzes: ["8 − 4", "8 + 3", "9 − 3", "8 − 3"],
      oranje: 9,
      paars: 5,
      verschilKeuzes: ["9 − 5 = 4", "9 − 5 = 3", "9 − 5 = 5", "9 + 5 = 14"],
      overgang: true,
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
      fout: () => ["Hoeveel blokken steekt de oranje toren boven de paarse uit?"],
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
    await l.zeg("Let goed op het rondje.", "Er staat nu een minteken.", "Wat gebeurt er als je erop tikt?");
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
      fout: () => ["Hoeveel blokken steekt de oranje toren boven de paarse uit?"],
      antwoord: ["De oranje toren heeft {3} blokken meer.", "Het verschil is {3}."],
    });
    await l.zeg(v85 ? "Ja, het is nog steeds {3}." : "Het is nog steeds {3}.", "Net als bij het plusteken.");
    await l.verder();

    await l.zeg("We doen een voorspelling.", "Je tikt nog {4} keer op het minteken.", "Wat is het verschil dan?");
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
    await l.zeg("Ah, je bent een niveau omhoog!", "Nu kunnen we boven de {10} komen.", "Je krijgt twee volle stapels van {10}.");
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
    await l.zeg(l.naam ? `Uitstekend gedaan, kapitein ${l.naam}.` : "Uitstekend gedaan, kapitein.", "Hier meldt het grondstation zich af.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

export const LESSEN_AFTREKKEN_TOT_10: Lesdraaiboek[] = [instaptoets, stippenWeghalen, verschil, eindtoets, zelfdeVerschil];
