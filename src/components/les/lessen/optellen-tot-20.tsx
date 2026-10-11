/**
 * Lessen van het onderdeel Optellen tot 20 — naar Synthesis "Add up to 20"
 * (INSPIRATIE.md, ronde 1 en 2). Groep 3. Zie ../soort.ts en ../BOUWEN.md.
 *
 * 1. Instaptoets: de 10-tegel herkennen, 10 + een zelfgekozen tegel, 10 + 7, 10 + 5.
 * 2. Optellen bij 10: snelle reeks 10 + n, met de valkuil "de 10 vergeten" (10 + 5 wordt 5).
 * 3. Over de 10 heen: twee liggende tegels vergelijken met een liggende 10, en de 10
 *    aanvullen tot ze even lang zijn (9 + 4 is evenveel als 10 + 3).
 * 4. Bijna dubbel: dubbel 5 en één erbij is 5 + 6; voor- en natoets van drie sommen.
 * 5. Eindtoets: alles uit de unit, en het tempo telt mee (zonder klok in beeld).
 *
 * Bij een fout eerst een richting, daarna het antwoord met de reden. Een
 * tegel die niet past, verdwijnt weer zonder het woord "fout".
 */

import type { Lesdraaiboek, Lesgids, Somdeel } from "../soort";
import { Lijntegel, Tegelbord, type Strook, type TegelbordMelding, type TegelbordProps } from "../vlakken/optellen20-tegelbord";

/* ---------- hulpjes ---------- */

export function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** Unieke getallen, in een willekeurige volgorde. */
export function opties(...getallen: number[]): number[] {
  return schud([...new Set(getallen.filter((g) => g >= 0))]);
}

export async function kiesGetal(l: Lesgids, lijst: number[]): Promise<number | null> {
  const k = await l.kies(lijst.map(String));
  return k === null ? null : Number(k);
}

/** "a + b = c" voor de balk bovenaan; zonder c een leeg vakje. */
export function plusSom(a: number, b: number, c?: number): Somdeel[] {
  return [
    { t: "getal", n: a },
    { t: "teken", s: "+" },
    { t: "getal", n: b },
    { t: "teken", s: "=" },
    c === undefined ? { t: "vak" } : { t: "getal", n: c },
  ];
}

/** Twee getallen achter elkaar geschreven: de bekende valkuil (10 en 5 wordt 105). */
export function achterElkaar(a: number, b: number): number {
  return Number(`${a}${b}`);
}

const TRAAG = 12000;
const SNEL = 5000;

export type Toetsvraag = {
  opties: number[];
  goed: number;
  /** De keuzes bij de herkansing. */
  herkansing: number[];
  bijGoed: string[];
  bijFout: (x: number | null) => string[];
  /** De vraag nog eens, vlak voor de herkansing. */
  opnieuw: string[];
  /** Kort het antwoord, als ook de herkansing niet lukt. */
  antwoord: () => Promise<void>;
  /** Na een goed antwoord iets zeggen over het tempo. */
  tempo?: "alleenTraag" | "beide";
};

/**
 * Een toetsvraag: één herkansing en geen lange uitleg (zoals de checks van
 * Synthesis). Geeft terug of het in één keer goed was, en of het traag ging.
 */
export async function toetsvraag(l: Lesgids, v: Toetsvraag): Promise<{ goed: boolean; traag: boolean }> {
  const t0 = Date.now();
  const x = await kiesGetal(l, v.opties);
  const duur = Date.now() - t0;
  if (x === v.goed) {
    const traag = duur > TRAAG;
    const tempo =
      v.tempo && traag ? ["Probeer de volgende iets sneller."] : v.tempo === "beide" && duur < SNEL ? ["Dat was razendsnel!"] : [];
    await l.zeg(...v.bijGoed, ...tempo);
    return { goed: true, traag };
  }
  await l.zeg(...v.bijFout(x));
  await l.verder();
  await l.zeg(...v.opnieuw);
  const y = await kiesGetal(l, v.herkansing);
  if (y === v.goed) await l.zeg(...v.bijGoed);
  else await v.antwoord();
  return { goed: false, traag: false };
}

/** De gewone fout-zin bij een toetssom: de som met het foute antwoord als vraag. */
export function somFout(a: number, b: number) {
  return (x: number | null) =>
    x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{${a}} plus {${b}} is {${x}}?`, "Kijk nog eens goed."];
}

/* ---------- het tegelbord (voor de liggende tegels en de bijna-dubbelen) ---------- */

/** Wacht tot het kind in het tegelbord een tegel kiest. */
async function kiesTegel(l: Lesgids): Promise<number> {
  l.pasVlakAan<TegelbordProps>({ actief: true });
  const g = await l.wachtOpVlak<TegelbordMelding>("tegel");
  l.pasVlakAan<TegelbordProps>({ actief: false });
  return g.n;
}

/** Bij één oneven en één even tegel komt de even tegel voorop: dan sluit de strook zonder gat. */
function orden(stukken: number[]): number[] {
  return [...stukken].sort((a, b) => (a % 2) - (b % 2));
}

const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/* ---------- kaarttekeningen (SVG van 244 × 190) ---------- */

function KaartTien() {
  return <Lijntegel n={10} x={62} y={14} c={32} liggend={false} />;
}
function KaartTienEnZes() {
  return (
    <g>
      <Lijntegel n={10} x={46} y={14} c={32} />
      <Lijntegel n={6} x={134} y={78} c={32} />
    </g>
  );
}
function KaartOverTien() {
  return (
    <g>
      <Lijntegel n={4} x={32} y={30} c={30} liggend />
      <Lijntegel n={7} x={92} y={30} c={30} liggend />
      <Lijntegel n={10} x={32} y={110} c={30} liggend />
    </g>
  );
}
function KaartBijnaDubbel() {
  return (
    <g>
      <Lijntegel n={4} x={44} y={66} c={34} />
      <Lijntegel n={3} x={132} y={66} c={34} />
      <rect x={133} y={67} width={32} height={32} rx={3} fill="none" stroke="#ffffff" strokeWidth={2.4} strokeDasharray="5 4" />
    </g>
  );
}
function KaartEindtoets() {
  return (
    <g>
      <Lijntegel n={3} x={44} y={60} c={34} />
      <Lijntegel n={1} x={140} y={94} c={34} />
      <Lijntegel n={10} x={174} y={10} c={17} kleur="#fde01a" />
    </g>
  );
}

/* ---------- 1. Instaptoets ---------- */

const instaptoets: Lesdraaiboek = {
  id: "optellen-20-instaptoets",
  titel: "Instaptoets: optellen tot 20",
  synthesis: "Add up to 20 · Assessment",
  kaarttekening: KaartTienEnZes,

  async speel(l) {
    let goed = 0;
    let traag = 0;
    const tel = (r: { goed: boolean; traag: boolean }) => {
      if (r.goed) goed++;
      if (r.traag) traag++;
    };

    l.bak([2, 4, 6, 8, 10]);
    await l.zeg("In deze lessen maak je plussommen tot {20}.", "Ben je daar al best goed in?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "In deze toets laat je zien wat je al kunt.");
    l.bak([]);
    l.leg(10);
    await l.zeg("Oké, ik heb een tegel in het vak gezet.", "Welk getal laat hij zien?");

    /* De 10-tegel herkennen. */
    tel(
      await toetsvraag(l, {
        opties: [8, 9, 10, 12],
        goed: 10,
        herkansing: [8, 10, 11, 12],
        bijGoed: ["Ja, dat is een {10}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`Een {${x}}?`, x === 9 ? "Dat is heel dichtbij." : "", "Kijk nog eens."]),
        opnieuw: ["Welk getal laat deze tegel zien?"],
        antwoord: async () => {
          await l.tel();
          await l.zeg("Het zijn {10} hokjes.", "Het is een {10}.");
          await l.verder();
        },
      }),
    );

    /* 10 + een tegel die het kind zelf kiest. */
    l.bak([5, 6, 7]);
    await l.zeg("Nu doen we er iets bij.", "Zet er nog een tegel bij.");
    const n = await l.pak({ hand: true, hulp: ["Tik op een tegel.", "Zet hem dan in het vak."] });
    l.leg(n, { naast: true });
    l.bak([]);
    await l.zeg(`Mooi, je hebt een {${n}} gekozen.`, `Hoeveel is {10} plus {${n}}?`);
    tel(
      await toetsvraag(l, {
        opties: opties(n, 9 + n, 10 + n, 11 + n),
        goed: 10 + n,
        herkansing: opties(10, 9 + n, 10 + n, 11 + n),
        bijGoed: ["Precies.", `{10} plus {${n}} is {${10 + n}}.`],
        bijFout: somFout(10, n),
        opnieuw: ["Hoeveel hokjes zijn het samen?"],
        antwoord: async () => {
          await l.zeg(`{10} plus {${n}} is {${10 + n}}.`);
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    l.som(plusSom(10, n, 10 + n));
    await l.wacht(900);
    l.som(null);
    await l.leeg();

    /* 10 + 7 (of 10 + 8 als de 7 al geweest is), met de tegels erbij. */
    const m = n === 7 ? 8 : 7;
    l.leg(10);
    l.leg(m, { naast: true });
    await l.zeg("Nu deze.", `Wat is {10} plus {${m}}?`);
    tel(
      await toetsvraag(l, {
        opties: opties(m, 9 + m, 10 + m, 11 + m),
        goed: 10 + m,
        herkansing: opties(10, 9 + m, 10 + m, 11 + m),
        bijGoed: ["Dat klopt."],
        bijFout: somFout(10, m),
        opnieuw: [`Tel de hokjes van de {10} en de {${m}}.`, "Hoeveel is het samen?"],
        antwoord: async () => {
          await l.zeg(`{10} plus {${m}} is {${10 + m}}.`);
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    await l.leeg();

    /* 10 + 5 zonder tegels. */
    const p = [5, 4, 3].find((x) => x !== n) ?? 5;
    await l.zeg("Probeer deze eens.", `Wat is {10} plus {${p}}?`);
    l.som(plusSom(10, p));
    tel(
      await toetsvraag(l, {
        opties: opties(p, p + 9, p + 10, p + 11),
        goed: 10 + p,
        herkansing: opties(10, p + 9, p + 10, p + 11),
        bijGoed: [`Juist, samen {${10 + p}}.`],
        bijFout: somFout(10, p),
        opnieuw: [`Wat is {10} plus {${p}}?`],
        antwoord: async () => {
          await l.zeg(`{10} plus {${p}} is {${10 + p}}.`);
          await l.verder();
        },
        tempo: "alleenTraag",
      }),
    );
    l.som(plusSom(10, p, 10 + p));
    await l.wacht(900);
    l.som(null);

    /* Einde: zeggen wat we gaan doen, en de kaart. */
    const tik = l.kaart();
    if (goed === 4 && traag === 0) {
      await l.zeg("Knap gedaan.", "Je kunt al goed plussommen maken tot {20}.", "Tik op de kaart om hem af te vinken.");
    } else if (goed >= 3) {
      await l.zeg("Goed gedaan.", "In de lessen leer je het nog vlotter.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg("Dank je wel.", "In de lessen gaan we dit samen oefenen.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

/* ---------- 2. Optellen bij 10 ---------- */

const BEVESTIG = ["Precies.", "Dat klopt.", "Juist.", "Ja!", "Goed zo."];

/** "Hoeveel is 10 plus m?" Geeft terug of het in één keer goed was. */
async function somBij10(l: Lesgids, m: number, beurt: number): Promise<boolean> {
  const som = 10 + m;
  /* De bekende fout: alleen de kleine tegel, de 10 vergeten. */
  const fout = m;
  const lijst = opties(som - 1, fout, som, som + 1);
  let hints = 0;
  for (;;) {
    const x = await kiesGetal(l, hints === 0 ? lijst : schud(lijst));
    if (x === som) {
      l.som(plusSom(10, m, som));
      await l.zeg(hints === 0 ? BEVESTIG[beurt % BEVESTIG.length] : "Precies.", `{10} plus {${m}} is {${som}}.`);
      await l.wacht(700);
      l.som(null);
      return hints === 0;
    }
    if (x !== null && hints === 0) {
      hints++;
      if (x === fout) {
        await l.zeg("Bijna.", "Je bent de {10} vergeten.");
        await l.verder();
        await l.zeg("Hoeveel hokjes zijn het samen?", `Hoeveel is {10} plus {${m}}?`);
      } else {
        await l.zeg("Net een beetje ernaast.", "Probeer het nog eens.", `Hoeveel is {10} plus {${m}}?`);
      }
      continue;
    }
    /* "Weet ik niet", of de tweede keer mis: samen tellen. */
    await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
    await l.tel();
    l.som(plusSom(10, m, som));
    await l.zeg(`Het zijn {${som}} hokjes.`, `{10} plus {${m}} is {${som}}.`);
    await l.verder();
    l.som(null);
    return false;
  }
}

const optellenBij10: Lesdraaiboek = {
  id: "optellen-20-bij-10",
  titel: "Optellen bij 10",
  synthesis: "Add up to 20 · Adding onto 10",
  kaarttekening: KaartTien,

  async speel(l) {
    l.bak([4, 5, 6, 10]);
    await l.zeg("We gaan even snel oefenen.", "We doen steeds een getal bij de {10}.", "Zet de {10} en nog een tegel in het vak.");
    const eerste = await l.pak({ hand: true, hulp: ["Tik op een tegel.", "Zet hem dan in het vak."] });
    let n: number;
    if (eerste === 10) {
      l.leg(10);
      l.bak([4, 5, 6]);
      await l.zeg("Mooi.", "Kies nu nog een tegel.");
      n = await l.pak({ hulp: ["Tik op een tegel.", "Zet hem dan naast de {10}."] });
      l.leg(n, { naast: true });
    } else {
      n = eerste;
      l.leg(n);
      /* De andere kleine tegels gaan weg; alleen de 10 blijft over. */
      l.bak([10]);
      await l.zeg(`Een {${n}}.`, "Zet de {10} er nu bij.");
      await l.pak({ hulp: ["Tik op de {10}.", "Zet hem dan in het vak."] });
      /* De 10 komt links te staan, de kleine tegel rechts: die wisselt straks. */
      await l.leeg();
      l.leg(10);
      l.leg(n, { naast: true });
    }
    l.bak([]);

    /* De snelle reeks: de kleine tegel wisselt steeds. Klaar na 5 keer in één
     * keer goed, of na 10 sommen. */
    const reeks = [n, ...schud(ALLES.filter((x) => x !== n))];
    let goed = 0;
    let fouten = 0;
    for (let i = 0; goed < 5 && i < 10; i++) {
      const m = reeks[i % reeks.length];
      if (i > 0) {
        await l.haalWeg();
        l.leg(m, { naast: true });
        await l.wacht(400);
      }
      await l.zeg(`Hoeveel is {10} plus {${m}}?`);
      if (await somBij10(l, m, i)) goed++;
      else fouten++;
    }

    l.som(null);
    if (goed < 5) {
      /* Synthesis neemt dan "een pauze"; hier zeggen we dat we het later nog eens oefenen. */
      await l.zeg("We stoppen hier even.", "We oefenen dit later nog eens.");
    }
    const tik = l.kaart();
    await l.zeg(
      fouten === 0 ? "Foutloos gewerkt vandaag!" : "Goed gewerkt!",
      "Je kunt al plussommen met {10} maken.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};

/* ---------- 3. Over de 10 heen ---------- */

const overDe10: Lesdraaiboek = {
  id: "optellen-20-over-de-10",
  titel: "Over de 10 heen",
  synthesis: "Add up to 20 · Add Across 10",
  kaarttekening: KaartOverTien,

  async speel(l) {
    let boven: number[] = [];
    let onder: number[] = [];
    let wegOnder = false;
    let wegBoven = false;
    const stroken = (): Strook[] => [
      ...(boven.length ? [{ id: "boven", stukken: boven, kolom: 1, rij: 2, liggend: true, wegLaatste: wegBoven }] : []),
      ...(onder.length ? [{ id: "onder", stukken: onder, kolom: 1, rij: 5, liggend: true, wegLaatste: wegOnder }] : []),
    ];
    const toon = (meer: Partial<TegelbordProps> = {}) => l.pasVlakAan<TegelbordProps>({ stroken: stroken(), ...meer });

    /** Een tegel bij de 10 leggen tot het evenveel is als a + b. Geeft de tegel terug. */
    const maakGelijk = async (a: number, b: number): Promise<number> => {
      const s = a + b;
      const nodig = s - 10;
      const slot: number[] = [];
      for (let fout = 0; ; ) {
        const k = await kiesTegel(l);
        onder = [10, k];
        toon();
        if (k === nodig) return k;
        await l.wacht(500);
        await l.zeg(
          `Je legde een {${k}} bij de {10}.`,
          k < nodig ? `Dat is nog iets kleiner dan {${a}} plus {${b}}.` : `Dat is nu een beetje groter dan {${a}} plus {${b}}.`,
        );
        await l.verder();
        wegOnder = true;
        toon();
        await l.wacht(450);
        wegOnder = false;
        onder = [10];
        slot.push(k);
        toon({ slot: [...slot] });
        fout++;
        if (fout === 1) await l.zeg("Probeer het nog eens.", `Welke tegel moet erbij om {${s}} te maken?`);
        else await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Pak de {${nodig}}.`);
      }
    };

    /**
     * Een keuzevraag terwijl het kind ook een tegel bij de 10 mag leggen, "als
     * dat helpt" (zoals Synthesis). Tijdens het kiezen zegt de les niets, zodat
     * de keuzeknoppen blijven staan; een tegel die niet past, blijft gewoon
     * liggen tot het kind een andere kiest.
     */
    const kiesMetTegels = async (lijst: number[]): Promise<{ x: number | null; gelegd: number | null }> => {
      let klaar = false;
      let gelegd: number | null = null;
      l.pasVlakAan<TegelbordProps>({ bak: [1, 2, 3, 4, 5, 6, 7, 8], slot: [], actief: true });
      void (async () => {
        while (!klaar) {
          const g = await l.wachtOpVlak<TegelbordMelding>("tegel");
          if (klaar) return;
          gelegd = g.n;
          onder = [10, g.n];
          toon();
        }
      })();
      const x = await kiesGetal(l, lijst);
      klaar = true;
      l.pasVlakAan<TegelbordProps>({ actief: false });
      return { x, gelegd };
    };

    /** "Hoeveel is het samen?" bij de strook a + b met een 10 eronder. */
    const hoeveelSamen = async (a: number, b: number, hulpGehad: boolean, metTegels = false): Promise<void> => {
      const s = a + b;
      /* De bekende fout: de 10 vergeten (8 + 7 wordt 5). */
      const fout = s - 10;
      const lijst = opties(s, s - 1, s + 1, fout);
      let geholpen = hulpGehad;
      let hint = false;
      for (;;) {
        let x: number | null;
        if (metTegels) {
          const k = await kiesMetTegels(schud(lijst));
          x = k.x;
          /* Lag de goede tegel er al bij, dan zijn de vormen al even groot: geen hulp met de tegels meer nodig. */
          if (k.gelegd === s - 10) {
            if (x === s) await l.zeg("Goed nagedacht met de tegels.", "De twee vormen waren even groot.");
            geholpen = true;
          }
        } else {
          x = await kiesGetal(l, schud(lijst));
        }
        if (x === s) {
          await l.zeg("Je hebt het!", `{${a}} plus {${b}} is {${s}}.`);
          return;
        }
        if (x === fout && !hint) {
          hint = true;
          await l.zeg("Bijna.", "Je bent de {10} vergeten.", "Tel de hokjes van allebei de tegels.");
          await l.verder();
          if (geholpen) {
            await l.zeg("Hoeveel is het samen?");
            continue;
          }
        }
        if (!geholpen) {
          /* Hulp met de tegels: de 10 aanvullen tot de vormen even groot zijn. */
          geholpen = true;
          onder = [10];
          toon({ bak: [1, 2, 3, 4, 5, 6, 7, 8], slot: [] });
          await l.zeg(x === null ? "Geen zorgen." : "", "Leg een tegel bij de {10}.", `Dan is het evenveel als {${a}} plus {${b}}.`);
          const k = await maakGelijk(a, b);
          await l.zeg("Goed nagedacht met de tegels.", "De twee vormen zijn nu even groot.", `{10} plus {${k}} is {${s}}.`);
          await l.verder();
          await l.zeg("Hoeveel is het samen?");
          continue;
        }
        if (x !== null && !hint) {
          hint = true;
          await l.zeg("Net ernaast.", "Kijk naar de {10} en de tegel erbij.", "Hoeveel is het samen?");
          continue;
        }
        await l.zeg(`{10} plus {${s - 10}} is {${s}}.`, `Dus {${a}} plus {${b}} is ook {${s}}.`);
        await l.verder();
        return;
      }
    };

    l.vlak(Tegelbord, { stroken: [], bak: [3, 4, 5, 6, 7, 8, 9], actief: false } satisfies TegelbordProps);
    await l.zeg("We proberen iets nieuws.", "Zet twee tegels in het vak.", "Samen moeten ze *meer* dan {10} zijn.");

    /* Twee tegels die samen meer dan 10 zijn; vanaf de eerste liggen ze. */
    const a = await kiesTegel(l);
    boven = [a];
    toon({ bakLiggend: true });
    await l.zeg("Ja.", "Zet er nog één bij.", "Samen moeten ze meer dan {10} zijn.");
    let b = await kiesTegel(l);
    while (a + b <= 10) {
      boven = [a, b];
      toon();
      await l.wacht(600);
      await l.zeg(`{${a}} en {${b}} is samen {${a + b}}.`, "Dat is niet meer dan {10}.");
      wegBoven = true;
      toon();
      await l.wacht(450);
      wegBoven = false;
      boven = [a];
      toon();
      await l.zeg("Kies een grotere tegel.");
      b = await kiesTegel(l);
    }
    boven = orden([a, b]);
    toon();

    await l.zeg("Ik leg er een {10} onder.", "Dan kunnen we ze vergelijken.");
    await l.verder();
    onder = [10];
    toon();
    await l.wacht(500);

    /* Welke vorm is groter? */
    await l.zeg("Welke vorm is groter?", `De {${a}} plus {${b}}?`, "Of de {10}?");
    const keuze = await l.kies([`${a} + ${b}`, "10"]);
    if (keuze === `${a} + ${b}`) {
      await l.zeg(`Ja, de {${a}} plus {${b}} is groter.`, "Hij steekt verder uit.");
    } else if (keuze === "10") {
      await l.zeg("Hmm.", `De {${a}} plus {${b}} lijkt mij groter.`, "Kijk maar, hij steekt verder uit.");
    } else {
      await l.zeg("Geen zorgen.", "Kijk waar de vormen ophouden.", `De {${a}} plus {${b}} steekt verder uit.`);
    }
    await l.verder();

    /* De uitdaging: de 10 aanvullen. */
    l.pasVlakAan<TegelbordProps>({ bak: [1, 2, 3, 4, 5, 6, 7, 8], slot: [] });
    await l.zeg("Hier is een uitdaging.", "Leg een tegel bij de {10}.", `Dan is het evenveel als {${a}} plus {${b}}.`);
    const k = await maakGelijk(a, b);
    await l.zeg("Kijk, nu zijn ze even groot.", `Dus {10} plus {${k}} en {${a}} plus {${b}} zijn evenveel.`, "Hoeveel is het?");
    await hoeveelSamen(a, b, true);
    await l.verder();

    /* Een reeks die ik zelf neerleg; de 10 eronder helpt als dat nodig is. */
    const reeks: [number, number][] = [
      [8, 7],
      [9, 5],
      [8, 9],
    ].filter(([p, q]) => !(p === a && q === b) && !(p === b && q === a)) as [number, number][];
    for (const [i, [p, q]] of reeks.entries()) {
      boven = orden([p, q]);
      onder = [10];
      toon({ bak: [1, 2, 3, 4, 5, 6, 7, 8], slot: [] });
      await l.wacht(400);
      await l.zeg(
        i === 0 ? `Nu heb ik {${p}} plus {${q}} gemaakt.` : i === 1 ? `Deze keer heb ik {${p}} plus {${q}} gemaakt.` : `En {${p}} plus {${q}}?`,
        i < 2 ? "Hoeveel is het samen?" : "",
        i === 0 ? "Leg een tegel bij de {10} als dat helpt." : "",
      );
      await hoeveelSamen(p, q, false, true);
      if (i === reeks.length - 2) await l.zeg("Nu nog één.");
      else if (i < reeks.length - 2) await l.zeg("Nu de volgende.");
      await l.wacht(500);
    }

    await l.zeg("Knap gedaan.");
    await l.wacht(600);
    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Je kunt plussommen over de {10} maken.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 4. Bijna dubbel ---------- */

const bijnaDubbel: Lesdraaiboek = {
  id: "optellen-20-bijna-dubbel",
  titel: "Bijna dubbel",
  synthesis: "Add up to 20 · Close To Doubles",
  kaarttekening: KaartBijnaDubbel,

  async speel(l) {
    let links: number[] = [];
    let rechts: number[] = [];
    let plekje = false;
    let wegRechts = false;
    const stroken = (): Strook[] => [
      ...(links.length ? [{ id: "links", stukken: links, kolom: 2, rij: 6 }] : []),
      ...(rechts.length ? [{ id: "rechts", stukken: rechts, kolom: 8, rij: 6, plekje, wegLaatste: wegRechts }] : []),
    ];
    const toon = (meer: Partial<TegelbordProps> = {}) => l.pasVlakAan<TegelbordProps>({ stroken: stroken(), ...meer });

    /** Drie sommen snel achter elkaar, zonder reactie per som. Telt goed en bedenktijd. */
    const snelleRonde = async (sommen: [number, number][]) => {
      let goed = 0;
      let tijd = 0;
      for (const [i, [p, q]] of sommen.entries()) {
        links = [p];
        rechts = [q];
        plekje = false;
        toon({ bak: [] });
        await l.zeg(...(i === 0 ? ["Hier is de eerste.", `Wat is {${p}} plus {${q}}?`] : i === 1 ? [`En {${p}} plus {${q}}?`] : [`Wat is {${p}} plus {${q}}?`]));
        const s = p + q;
        const t0 = Date.now();
        const x = await kiesGetal(l, opties(s - 10, s - 1, s, s + 1));
        tijd += Date.now() - t0;
        if (x === s) goed++;
      }
      return { goed, tijd };
    };

    /** Het kind zet een tegel bij de rechter toren, zodat p een p + 1 wordt. */
    const maakEenMeer = async (p: number) => {
      const slot: number[] = [];
      for (let fout = 0; ; ) {
        const k = await kiesTegel(l);
        plekje = false;
        rechts = [p, k];
        toon();
        if (k === 1) return;
        await l.wacht(400);
        await l.zeg(`Ah, dat maakt {${p + k}}.`);
        await l.verder();
        wegRechts = true;
        toon();
        await l.wacht(450);
        wegRechts = false;
        rechts = [p];
        plekje = true;
        slot.push(k);
        toon({ slot: [...slot] });
        fout++;
        if (fout === 1) await l.zeg("Probeer het nog eens.", `Zet een tegel bij de {${p}}, zodat het {${p + 1}} wordt.`);
        else await l.zeg("Je hebt er nog maar {1} nodig.", "Pak de {1}.");
      }
    };

    /** Het dubbel van p in beeld zetten en vragen; daarna het blokje erbij en p + (p + 1). */
    const dubbelEnEenMeer = async (p: number, zelfErbij: boolean) => {
      links = [p];
      toon();
      await l.wacht(450);
      rechts = [p];
      toon();
      await l.wacht(450);
      await l.zeg(...(p === 5 ? ["Eerst een makkelijke.", "Wat is {5} plus {5}?"] : [`Oké, wat is dan {${p}} plus {${p}}?`]));
      const d = await kiesGetal(l, opties(2 * p - 2, 2 * p - 1, 2 * p, 2 * p + 1));
      l.som(plusSom(p, p, 2 * p));
      toon({ logboek: [{ a: p, b: p, c: 2 * p }] });
      if (d === 2 * p) await l.zeg(p === 5 ? "Juist." : "Ja.", `{${p}} plus {${p}} is {${2 * p}}.`);
      else {
        await l.zeg(`Twee keer {${p}} is {${2 * p}}.`, `Dus {${p}} plus {${p}} is {${2 * p}}.`);
        await l.verder();
      }

      /* Eén blokje erbij. */
      if (zelfErbij) {
        plekje = true;
        toon({ bak: [1, 2, 3, 4, 5], slot: [] });
        await l.zeg(
          ...(p === 5
            ? [`Nu {5} plus {6}.`, "Je weet het antwoord vast al.", "Maar we laten het ook zien met de tegels.", "Zet een tegel bij de {5}, zodat het {6} wordt."]
            : ["Zet er nu een tegel bij.", `Zo wordt de {${p}} een {${p + 1}}.`]),
        );
        await maakEenMeer(p);
        toon({ bak: [] });
      } else {
        await l.wacht(500);
        rechts = [p, 1];
        toon();
        await l.wacht(500);
      }
      l.som(plusSom(p, p + 1));
      toon({ logboek: [{ a: p, b: p, c: 2 * p }, { a: p, b: p + 1, c: null }] });
      await l.zeg(zelfErbij ? "Goed zo." : "Kijk, er komt er één bij.", `{${p}} plus {${p}} is {${2 * p}}.`, `Wat is dan {${p}} plus {${p + 1}}?`);
      const x = await kiesGetal(l, opties(2 * p - 1, 2 * p, 2 * p + 1, 2 * p + 2));
      l.som(plusSom(p, p + 1, 2 * p + 1));
      toon({ logboek: [{ a: p, b: p, c: 2 * p }, { a: p, b: p + 1, c: 2 * p + 1 }] });
      if (x === 2 * p + 1) {
        await l.zeg(p === 5 ? "Juist." : "Precies.", `Het is één meer dan dubbel {${p}}.`, `{${p}} plus {${p + 1}} is {${2 * p + 1}}.`);
      } else {
        await l.zeg("Kijk naar de tegels.", `Dubbel {${p}} is {${2 * p}}.`, "Er komt er één bij.", `Dus {${p}} plus {${p + 1}} is {${2 * p + 1}}.`);
      }
      await l.verder();
      l.som(null);
      links = [];
      rechts = [];
      plekje = false;
      toon({ logboek: [] });
    };

    /* De voortoets. */
    l.vlak(Tegelbord, { stroken: [], bak: [], actief: false } satisfies TegelbordProps);
    await l.zeg(l.naam ? `${l.naam}, eerst een korte toets.` : "Eerst een korte toets.", "Er komen drie vragen.", "Hoe snel kun je ze doen?");
    await l.verder();
    const voor = await snelleRonde([
      [5, 6],
      [6, 7],
      [7, 8],
    ]);
    links = [];
    rechts = [];
    toon();
    await l.zeg(
      voor.goed === 3 ? "Allemaal goed!" : voor.goed === 0 ? "Dat waren lastige." : `Je had er {${voor.goed}} goed.`,
      voor.goed >= 2 && l.naam ? `Goed geprobeerd, ${l.naam}.` : "",
      "Ik heb een paar trucjes.",
      "Die kunnen je echt helpen.",
    );
    await l.verder();

    /* Trucje: dubbel 5, en één erbij. */
    toon({ bak: [1, 2, 3, 4, 5], slot: [] });
    await l.zeg("Je bent goed in dubbelen.", "Die gaan we gebruiken.", "Zet een {5} in het vak.", "Dan maak ik hem dubbel.");
    while ((await kiesTegel(l)) !== 5) await l.zeg("Zoek de {5}.", "Dat is de groene tegel.");
    toon({ bak: [] });
    await dubbelEnEenMeer(5, true);

    /* 6 + 7: welk dubbel helpt? */
    toon({ bak: [1, 2, 3, 4, 5, 6], slot: [1, 2, 3, 4, 5] });
    await l.zeg("Nu {6} plus {7}.", "Welk dubbel helpt je?");
    const welk = await l.kies(["Dubbel 5", "Dubbel 6"]);
    if (welk === "Dubbel 6") await l.zeg("Ja, dubbel {6}.");
    else {
      await l.zeg(welk === null ? "Geen zorgen." : "Ik weet niet of dat werkt.", welk === null ? "" : "Ik zie geen {5} in {6} plus {7}.");
      await l.verder();
      await l.zeg("Ik help je.");
    }
    await l.zeg("Zet de {6} in het vak.", "Dan maken we hem dubbel.");
    await kiesTegel(l);
    toon({ bak: [] });
    await dubbelEnEenMeer(6, true);

    await l.zeg(l.naam ? `${l.naam}, je doet het goed.` : "Je doet het goed.", "Nog even oefenen met de tegels.", "Daarna zijn we klaar.");
    await l.verder();

    /* Vrij oefenen: het kind kiest zelf de tegel. */
    const gehad: number[] = [];
    for (let ronde = 0; ronde < 4; ronde++) {
      toon({ bak: [2, 3, 4, 5, 6, 7, 8, 9], slot: [...gehad] });
      await l.zeg(ronde === 0 ? "Zet een tegel in het vak." : "Kies een andere tegel.", "Dan maken we hem dubbel.");
      const n = await kiesTegel(l);
      gehad.push(n);
      toon({ bak: [] });
      links = [n];
      toon();
      await l.wacht(400);
      rechts = [n];
      toon();
      await l.zeg(`Wat is dubbel {${n}}?`);
      const d = await kiesGetal(l, opties(2 * n - 2, 2 * n - 1, 2 * n, 2 * n + 1));
      l.som(plusSom(n, n, 2 * n));
      toon({ logboek: [{ a: n, b: n, c: 2 * n }] });
      await l.zeg(d === 2 * n ? "Juist." : `Dubbel {${n}} is {${2 * n}}.`);
      await l.wacht(500);
      rechts = [n, 1];
      toon({ logboek: [{ a: n, b: n, c: 2 * n }, { a: n, b: n + 1, c: null }] });
      l.som(plusSom(n, n + 1));
      await l.zeg(`Nu {${n}} plus {${n + 1}}.`, "Hoeveel is dat?");
      const x = await kiesGetal(l, opties(2 * n - 1, 2 * n, 2 * n + 1, 2 * n + 2));
      l.som(plusSom(n, n + 1, 2 * n + 1));
      toon({ logboek: [{ a: n, b: n, c: 2 * n }, { a: n, b: n + 1, c: 2 * n + 1 }] });
      if (x === 2 * n + 1) await l.zeg("Juist.", `{${n}} plus {${n + 1}} is {${2 * n + 1}}.`);
      else await l.zeg(`Dubbel {${n}} is {${2 * n}}.`, "Er komt er één bij.", `Dus {${n}} plus {${n + 1}} is {${2 * n + 1}}.`);
      await l.verder();
      l.som(null);
      links = [];
      rechts = [];
      toon({ logboek: [] });
      if (ronde === 3) break;
      await l.zeg("Wil je er nog één doen?");
      if ((await l.kies(["Ja", "Nee"])) !== "Ja") break;
    }

    /* De natoets: alleen vergelijken met jezelf, zonder seconden. */
    await l.zeg(voor.goed === 0 ? "Eerst had je er geen van de {3} goed." : `Eerst had je er {${voor.goed}} van de {3} goed.`, "Wil je kijken of het nu beter gaat?");
    if ((await l.kies(["Ja", "Nee"])) === "Ja") {
      await l.zeg("Zo mag ik het horen.", "Daar gaan we.");
      const na = await snelleRonde([
        [6, 7],
        [8, 9],
        [7, 8],
      ]);
      links = [];
      rechts = [];
      toon();
      const sneller = na.tijd < voor.tijd;
      await l.zeg(
        na.goed === 0 ? "Je had er deze keer geen goed." : `Je had er deze keer {${na.goed}} goed.`,
        na.goed > voor.goed ? "Dat zijn er meer dan eerst!" : na.goed === 3 ? "Weer allemaal goed!" : "",
        sneller ? "En je was sneller dan eerst." : "",
      );
      await l.verder();
    } else {
      await l.zeg("Prima.", "Dan doen we dat een andere keer.");
    }

    l.vlak(null);
    l.bak([]);
    const tik = l.kaart();
    await l.zeg("Deze les is klaar.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};

/* ---------- 5. Eindtoets ---------- */

const eindtoets: Lesdraaiboek = {
  id: "optellen-20-eindtoets",
  titel: "Eindtoets: optellen tot 20",
  synthesis: "Add up to 20 · Mastery Check",
  kaarttekening: KaartEindtoets,

  async speel(l) {
    let goed = 0;
    let traag = 0;
    const tel = (r: { goed: boolean; traag: boolean }) => {
      if (r.goed) goed++;
      if (r.traag) traag++;
    };

    l.bak([2, 4, 6, 8, 10]);
    await l.zeg("Dit is de eindtoets: plussommen tot {20}.", "Ben je daar al best goed in?");
    const al = await l.kies(["Ja", "Nee"]);
    await l.zeg(al === "Ja" ? "Mooi." : "Geen probleem.", "We kijken wat je al kunt.", "Probeer zo vlot mogelijk te antwoorden.");
    l.bak([]);
    l.leg(10);
    await l.zeg("Welk getal laat deze tegel zien?");
    tel(
      await toetsvraag(l, {
        opties: [8, 9, 10, 11],
        goed: 10,
        herkansing: [8, 10, 11, 12],
        bijGoed: ["Ja, dat is een {10}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`Een {${x}}?`, "Kijk nog eens."]),
        opnieuw: ["Welk getal laat deze tegel zien?"],
        antwoord: async () => {
          await l.zeg("Het is een {10}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );

    /* 10 + een zelfgekozen tegel. */
    l.bak([5, 6, 7]);
    await l.zeg("Zet er nog een tegel bij.");
    const n = await l.pak({ hulp: ["Tik op een tegel.", "Zet hem dan in het vak."] });
    l.leg(n, { naast: true });
    await l.zeg(`Je hebt een {${n}} gekozen.`, `Hoeveel is {10} plus {${n}}?`);
    tel(
      await toetsvraag(l, {
        opties: opties(n, 9 + n, 10 + n, 11 + n),
        goed: 10 + n,
        herkansing: opties(10, 9 + n, 10 + n, 11 + n),
        bijGoed: [`Ja, {10} plus {${n}} is {${10 + n}}.`],
        bijFout: somFout(10, n),
        opnieuw: [`Hoeveel is {10} plus {${n}}?`],
        antwoord: async () => {
          await l.zeg(`{10} plus {${n}} is {${10 + n}}.`);
          await l.verder();
        },
        tempo: "beide",
      }),
    );

    /* Een nieuwe tegel bij de 10. */
    await l.haalWeg();
    l.uitBak(n);
    await l.zeg("Zet een nieuwe tegel bij de {10}.");
    const m = await l.pak();
    l.leg(m, { naast: true });
    l.bak([]);
    await l.zeg(`Wat is {10} plus {${m}}?`);
    tel(
      await toetsvraag(l, {
        opties: opties(m, 9 + m, 10 + m, 11 + m),
        goed: 10 + m,
        herkansing: opties(10, 9 + m, 10 + m, 11 + m),
        bijGoed: [`Juist, samen {${10 + m}}.`],
        bijFout: somFout(10, m),
        opnieuw: [`Wat is {10} plus {${m}}?`],
        antwoord: async () => {
          await l.zeg(`{10} plus {${m}} is {${10 + m}}.`);
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    await l.leeg();

    /* Aanvullen tot 20. */
    l.leg(10);
    l.leg(7, { naast: true });
    await l.zeg("Dit is {17}.", "Wat moet er nog bij om {20} te maken?");
    tel(
      await toetsvraag(l, {
        opties: [1, 2, 3, 4],
        goed: 3,
        herkansing: [1, 2, 3, 4],
        bijGoed: ["Precies, {17} en {3} is {20}."],
        bijFout: (x) => (x === null ? ["Geen zorgen.", "Kijk nog eens goed."] : [`{17} en {${x}} is {${17 + x}}.`, x < 3 ? "Dat is nog geen {20}." : "Dat is meer dan {20}."]),
        opnieuw: ["Wat moet er bij {17} om {20} te maken?"],
        antwoord: async () => {
          await l.zeg("De {7} heeft nog {3} nodig om {10} te worden.", "Dus {17} en {3} is {20}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    await l.leeg();

    /* Over de 10 heen: 8 + een zelfgekozen tegel. */
    l.leg(8);
    l.bak([5, 6, 7]);
    await l.zeg("Hier is een {8}.", "Kies zelf een tegel om erbij te zetten.");
    const k = await l.pak();
    l.leg(k, { naast: true });
    l.bak([]);
    await l.zeg(`Hoeveel is {8} plus {${k}}?`);
    tel(
      await toetsvraag(l, {
        opties: opties(k - 2, 7 + k, 8 + k, 9 + k),
        goed: 8 + k,
        herkansing: opties(6 + k, 7 + k, 8 + k, 9 + k),
        bijGoed: [`Goed zo, {8} plus {${k}} is {${8 + k}}.`],
        bijFout: somFout(8, k),
        opnieuw: [`Hoeveel is {8} plus {${k}}?`],
        antwoord: async () => {
          await l.zeg(`De {8} heeft nog {2} nodig om {10} te worden.`, `Dan is {8} plus {${k}} samen {${8 + k}}.`);
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    await l.leeg();

    /* Een kale som: bijna dubbel. */
    l.som(plusSom(7, 8));
    await l.zeg("Nog één, zonder tegels.", "Hoeveel is {7} plus {8}?");
    tel(
      await toetsvraag(l, {
        opties: [13, 14, 15, 16],
        goed: 15,
        herkansing: [5, 14, 15, 16],
        bijGoed: ["Helemaal goed."],
        bijFout: somFout(7, 8),
        opnieuw: ["Hoeveel is {7} plus {8}?"],
        antwoord: async () => {
          await l.zeg("Dubbel {7} is {14}.", "Eén meer is {15}.");
          await l.verder();
        },
        tempo: "beide",
      }),
    );
    l.som(plusSom(7, 8, 15));
    await l.wacht(900);
    l.som(null);

    /* Einde: zeggen wat er nog moet, ook als het "goed maar traag" was. */
    const tik = l.kaart();
    if (goed === 6 && traag <= 1) {
      await l.zeg(l.naam ? `Knap gedaan, ${l.naam}!` : "Knap gedaan!", "Je kunt plussommen maken tot {20}.", "Tik op de kaart om hem af te vinken.");
    } else if (goed >= 5) {
      await l.zeg("Goed gedaan.", traag > 1 ? "Je weet het, nu nog wat vlotter." : "Je weet het bijna allemaal.", "Tik op de kaart om hem af te vinken.");
    } else {
      await l.zeg("Je weet al veel.", "Oefen nog wat met de lessen.", "Daarna doe je de toets nog eens.", "Tik op de kaart om hem af te vinken.");
    }
    await tik;
  },
};

export const LESSEN_OPTELLEN_TOT_20: Lesdraaiboek[] = [instaptoets, optellenBij10, overDe10, bijnaDubbel, eindtoets];
