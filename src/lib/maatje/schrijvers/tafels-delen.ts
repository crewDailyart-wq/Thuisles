/**
 * Schrijvers voor Tafels en Delen (hoofdstuk 8 van MAATJE-HANDLEIDING.md).
 *
 * Keer is "zoveel groepjes van": 6 × 5 is 6 groepjes van 5. Delen is groepjes
 * maken ("hoeveel groepjes van 4 passen in 20?") of eerlijk verdelen ("20 over
 * 4 bordjes"), en het omgekeerde van keer.
 */

import { maak, zin, type Fout } from "@/lib/maatje/bouw";
import { metSom } from "@/lib/maatje/schrijvers/rekenen";
import { getalWoord, hoofd, stuks } from "@/lib/maatje/taal";
import { GEEN_PLAATJE, type Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const groepjes = (n: number) => stuks(n, "groepje", "groepjes");
const rijen = (n: number) => stuks(n, "rij", "rijen");
const keer = (a: number | string, b: number | string) => `${a} keer ${b}`;
const gedeeld = (g: number, d: number) => `${g} gedeeld door ${d}`;
/** 5, 10, 15, 20: de sprongen, als ze in een korte zin passen. */
const sprongen = (stap: number, aantal: number) => Array.from({ length: aantal }, (_, i) => (i + 1) * stap).join(", ");

function omgedraaid(c: number): Fout | null {
  if (c < 10 || c > 99) return null;
  const t = Math.floor(c / 10);
  const e = c % 10;
  if (t === e || e === 0) return null;
  return {
    code: "cijfers-omgedraaid",
    antwoorden: [`${e}${t}`],
    zinnen: [zin(`${hoofd(getalWoord(c))} schrijf je als ${c}.`), zin(`Eerst de ${t}, dan de ${e}.`)],
    getallen: [t, e],
  };
}

// ---------------------------------------------------------------------------
// Keer
// ---------------------------------------------------------------------------

type KeerKern = { goed: ReturnType<typeof zin>[]; uitleg: ReturnType<typeof zin>[]; tip: ReturnType<typeof zin>; fouten: Fout[]; tussen: number[] };

function keerKern(a: number, b: number, plaatje: string = GEEN_PLAATJE): KeerKern {
  const c = a * b;
  const st = (s: string) => (plaatje === GEEN_PLAATJE ? GEEN_PLAATJE : s);
  const fouten: Fout[] = [];
  const voeg = (f: Fout | null) => f && fouten.push(f);
  const dus = zin(`Dus ${keer(a, b)} is ${c}.`, st("alle groepjes lichten op"));
  let uitleg;
  let tussen: number[] = [];

  if (a === 0 || b === 0) {
    uitleg = [zin(a === 0 ? `Geen groepjes van ${b} is niks.` : `${hoofd(groepjes(a))} van niks is niks.`), dus];
  } else if (b === 1) {
    uitleg = [zin(`${hoofd(groepjes(a))} van 1 is gewoon ${a}.`), dus];
  } else if (a === 1) {
    uitleg = [zin(`1 groepje van ${b} is gewoon ${b}.`), dus];
  } else if (b === 10 || a === 10) {
    const n = b === 10 ? a : b;
    uitleg = [zin("Kijk, zo doe je het."), zin(`${keer(a, b)} is ${n} tientallen.`, st("de staven van 10 lichten op")), dus];
  } else if (a > 10 && b <= 10) {
    /* 17 × 3: eerst 10 keer, dan de rest. */
    const e = a - 10;
    uitleg = [
      zin(`${a} is 10 en ${e}.`),
      zin(`${keer(10, b)} is ${10 * b}.`, st("tien groepjes")),
      zin(`${keer(e, b)} is ${e * b}.`, st("de andere groepjes")),
      zin(`Samen is dat ${c}.`, st("alle groepjes lichten op")),
    ];
    tussen = [10, e, 10 * b, e * b];
  } else if (a <= 7) {
    uitleg = [
      zin(`${keer(a, b)} is ${groepjes(a)} van ${b}.`, st("de groepjes verschijnen")),
      zin(`Tel maar: ${sprongen(b, a)}.`, st("de groepjes lichten één voor één op")),
      dus,
    ];
    tussen = Array.from({ length: a }, (_, i) => (i + 1) * b);
  } else {
    /* Steunsom: 10 keer, en dan groepjes eraf. */
    const tien = 10 * b;
    const minder = 10 - a;
    uitleg = [
      zin(`Je weet ${keer(10, b)} is ${tien}.`, st("tien groepjes")),
      zin(`Dat is ${groepjes(minder)} te veel: ${tien} min ${minder * b}.`, st("de groepjes die te veel zijn gaan weg")),
      dus,
    ];
    tussen = [10, tien, minder, minder * b];
  }

  voeg({ code: "plus-gedaan", antwoorden: [`${a + b}`], zinnen: [zin("Dit is keer, niet plus."), zin(`${keer(a, b)} is ${groepjes(a)} van ${b}: ${c}.`, st("de groepjes verschijnen"))] });
  if (b > 0) voeg({ code: "groepje-ernaast", antwoorden: [`${c - b}`, `${c + b}`], zinnen: [zin("Je zit één groepje ernaast."), zin(`${hoofd(groepjes(a))} van ${b} is ${c}.`, st("de groepjes lichten één voor één op"))] });
  voeg({ code: "achter-elkaar", antwoorden: [`${a}${b}`], zinnen: [zin(`Je zette ${a} en ${b} achter elkaar.`), zin(`${hoofd(groepjes(a))} van ${b} is ${c}.`, st("de groepjes verschijnen"))] });
  if (a !== b) {
    voeg({ code: "verkeerde-tafel", antwoorden: [`${b * b}`], zinnen: [zin(`Dat is ${keer(b, b)}.`), zin(`Het zijn ${groepjes(a)} van ${b}: ${c}.`, st("de groepjes verschijnen"))] });
    voeg({ code: "verkeerde-tafel-2", antwoorden: [`${a * a}`], zinnen: [zin(`Dat is ${keer(a, a)}.`), zin(`Hier zijn het groepjes van ${b}: ${c}.`, st("de groepjes verschijnen"))] });
  }
  if (b === 0 || a === 0) voeg({ code: "keer-nul", antwoorden: [`${a + b}`, `${Math.max(a, b)}`], zinnen: [zin("Groepjes van niks is niks."), zin(`${hoofd(keer(a, b))} is 0.`)] });
  if (b === 1) voeg({ code: "keer-een", antwoorden: [`${a + 1}`], zinnen: [zin(`${keer(a, 1)} is ${groepjes(a)} van 1.`), zin(`Dat is gewoon ${a}.`)] });
  voeg(omgedraaid(c));

  return {
    goed: [zin(`${hoofd(groepjes(a))} van ${b} is ${c}.`, st("de groepjes lichten op"))],
    uitleg,
    tip: zin(b > 0 ? `Tel in sprongen van ${b}.` : "Hoeveel is een groepje van niks?"),
    fouten,
    tussen: [...tussen, c - b, c + b],
  };
}

function keerSom(o: Opgave, a: number, b: number): Geschreven {
  const k = keerKern(a, b);
  return maak({
    antwoord: o.antwoord,
    voorlezen: metSom(o.vraagtekst, keer(a, b)),
    goed: k.goed,
    fouten: k.fouten,
    uitleg: k.uitleg,
    tip: k.tip,
    opgave: [a, b],
    tussen: k.tussen,
    geheim: [a * b],
  });
}

/**
 * De groepjesmaker (Godot, oktober 2026): dezelfde keer-uitleg, maar met de
 * doosjes die het kind zelf heeft gebouwd. Bij knippen (7 × 8) legt het maatje
 * de twee makkelijke sommen uit in plaats van de steunsom met 10.
 */
function groepjesmakerSom(o: Opgave, a: number, b: number, stand: string): Geschreven | null {
  if (String(a * b) !== o.antwoord) return null;
  const c = a * b;
  const k = keerKern(a, b, "doosjes");
  const doos = (z: ReturnType<typeof zin>) => ({ ...z, tekst: z.tekst.replace(/groepje/g, "doosje") });
  const doosjes = (n: number) => stuks(n, "doosje", "doosjes");
  let uitleg = k.uitleg.map(doos);
  let tussen = k.tussen;
  let tip = doos(k.tip);
  if (stand === "knip" && a > 5) {
    const rest = a - 5;
    uitleg = [
      zin("Knip de kast na 5 doosjes.", "de kast gaat open na 5 doosjes"),
      zin(`${keer(5, b)} is ${5 * b}.`, "de bovenste plank licht op"),
      zin(`${keer(rest, b)} is ${rest * b}.`, "de onderste plank licht op"),
      zin(`Samen is dat ${c}.`, "alle doosjes lichten op"),
    ];
    tussen = [...tussen, 5, rest, 5 * b, rest * b];
    tip = zin("Knip na 5 doosjes en reken elk stuk uit.");
  }
  let goed = k.goed.map(doos);
  if (a === 0) {
    goed = [zin("Geen doosjes, dus geen bolletjes."), zin(`${keer(0, b)} is 0.`)];
    tip = zin("Kijk goed: hoeveel doosjes vraagt de som?");
  }
  const bouw =
    a === 0
      ? `Hoeveel doosjes van ${b} zet je neer?`
      : `Maak ${doosjes(a)} van ${b}.`;
  return maak({
    antwoord: o.antwoord,
    voorlezen: metSom(o.vraagtekst, keer(a, b)),
    bouw: zin(bouw, "de kast is leeg"),
    goed,
    fouten: k.fouten.map((f) => ({ ...f, zinnen: f.zinnen.map(doos) })),
    uitleg,
    tip,
    opgave: [a, b],
    tussen: [...tussen, 5],
    geheim: [c],
    nietInBeeld: ["eikel"],
  });
}

/**
 * De laser (Godot, oktober 2026): raak alle goede stenen. Bij de tafels: welke
 * getallen uit de tafel horen. Bij de minsommen: welke sommen de uitkomst
 * geven. Het antwoord zijn plekken, geen getal; dus geen "geheim" getal.
 */
function laserSom(o: Opgave, stand: string, stenen: string[], goed: number[], tafel: number, doel: number): Geschreven | null {
  if (o.antwoord !== goed.join(",")) return null;
  const goedeStenen = goed.map((i) => stenen[i]);
  const getallen = stenen.flatMap((t) => t.split(" − ").map(Number));
  if (stand === "tafel") {
    const [x, y, z] = goedeStenen;
    return maak({
      antwoord: o.antwoord,
      voorlezen: o.vraagtekst,
      bouw: zin("Tik op een steen om hem te raken.", "de stenen zweven"),
      goed: [zin(`${x}, ${y} en ${z} horen bij de tafel van ${tafel}.`, "de goede stenen ontploffen")],
      fouten: [],
      uitleg: [
        zin("Kijk, zo doe je het.", GEEN_PLAATJE),
        ...goedeStenen.map((t) => zin(`${keer(Number(t) / tafel, tafel)} is ${t}.`, "die steen licht op")),
      ],
      tip: zin(`Tel in sprongen van ${tafel}.`),
      rondewoord: "opdrachten",
      opgave: [tafel, ...getallen],
      tussen: goedeStenen.map((t) => Number(t) / tafel),
      geheim: [],
    });
  }
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    bouw: zin("Tik op een steen om hem te raken.", "de stenen zweven"),
    goed: [zin(`Die drie sommen zijn allemaal ${doel}.`, "de goede stenen ontploffen")],
    fouten: [],
    uitleg: [zin("Reken elke som uit.", GEEN_PLAATJE), ...goedeStenen.map((t) => zin(`${t} is ${doel}.`, "die steen licht op"))],
    tip: zin("Reken elke som uit."),
    rondewoord: "opdrachten",
    opgave: [doel, ...getallen],
    tussen: [],
    geheim: [],
  });
}

// ---------------------------------------------------------------------------
// Delen
// ---------------------------------------------------------------------------

function deelKern(g: number, d: number, verdelen: boolean, plaatje: string = GEEN_PLAATJE) {
  const q = g / d;
  const st = (s: string) => (plaatje === GEEN_PLAATJE ? GEEN_PLAATJE : s);
  const fouten: Fout[] = [];
  const voeg = (f: Fout | null) => f && fouten.push(f);
  const dus = zin(`Dus ${gedeeld(g, d)} is ${q}.`, st("alles licht op"));

  const goed = verdelen
    ? [zin(`Ieder krijgt er ${q}.`, st("de groepen lichten op")), zin(`${keer(q, d)} is ${g}.`)]
    : [zin(`${hoofd(groepjes(q))} van ${d} is ${g}.`, st("de groepjes lichten één voor één op")), zin(`${hoofd(gedeeld(g, d))} is ${q}.`)];

  const uitleg = verdelen
    ? [
        zin(`Je verdeelt ${g} eerlijk over ${d}.`, st("alles staat klaar")),
        zin("Ieder krijgt er steeds één bij.", st("ze gaan één voor één naar ieder")),
        zin(`Als ze op zijn, heeft ieder er ${q}.`, st("de groepen lichten op")),
        dus,
      ]
    : q <= 5
      ? [zin("Kijk, zo doe je het."), zin(`Ik maak groepjes van ${d}: ${sprongen(1, q)}.`, st("groepjes vormen zich één voor één")), zin("Alle bolletjes zijn op."), dus]
      : [zin("Kijk, zo doe je het."), zin(`Ik maak groepjes van ${d}.`, st("groepjes vormen zich één voor één")), zin(`${keer(q, d)} is ${g}: ${groepjes(q)}.`, st("de groepjes lichten op")), dus];

  if (d !== q) {
    voeg({
      code: "grootte-getypt",
      antwoorden: [`${d}`],
      zinnen: verdelen
        ? [zin(`Je verdeelt over ${d}.`), zin(`Ieder krijgt er ${q}.`, st("de groepen lichten op"))]
        : [zin(`${d} is hoe groot elk groepje is.`), zin(`Het zijn ${groepjes(q)}.`, st("de groepjes lichten één voor één op"))],
    });
  }
  voeg({ code: "min-gedaan", antwoorden: [`${g - d}`], zinnen: [zin("Dit is gedeeld door, niet min."), zin(`${g} in groepjes van ${d} is ${groepjes(q)}.`, st("groepjes vormen zich"))] });
  voeg({ code: "keer-gedaan", antwoorden: [`${g * d}`], zinnen: [zin("Dit is gedeeld door, niet keer."), zin(`${hoofd(groepjes(q))} van ${d} passen in ${g}.`, st("groepjes vormen zich"))] });
  voeg({ code: "plus-gedaan", antwoorden: [`${g + d}`], zinnen: [zin("Dit is gedeeld door, niet plus."), zin(`Je verdeelt ${g} in groepjes van ${d}: ${q}.`, st("groepjes vormen zich"))] });
  voeg({
    code: "groepje-ernaast",
    antwoorden: [`${q - 1}`, `${q + 1}`],
    zinnen:
      q <= 5
        ? [zin(`Tel de groepjes nog eens: ${sprongen(d, q)}.`, st("de groepjes lichten op")), zin(`Dat zijn ${groepjes(q)}.`)]
        : [zin("Tel de groepjes nog eens."), zin(`${keer(q, d)} is ${g}.`, st("de groepjes lichten op"))],
  });
  voeg(omgedraaid(q));

  return {
    goed,
    uitleg,
    tip: zin(verdelen ? "Verdeel ze eerlijk, één voor één." : `Maak groepjes van ${d} en tel de groepjes.`),
    fouten,
    tussen: [...Array.from({ length: q }, (_, i) => (i + 1) * d), ...Array.from({ length: q }, (_, i) => i + 1), q - 1, q + 1],
  };
}

function deelSom(o: Opgave, g: number, d: number, verdelen: boolean, bouw: string | null, plaatje: string): Geschreven | null {
  if (d === 0 || g % d !== 0 || String(g / d) !== o.antwoord) return null;
  const k = deelKern(g, d, verdelen, plaatje);
  return maak({
    antwoord: o.antwoord,
    voorlezen: metSom(o.vraagtekst, gedeeld(g, d)),
    bouw: bouw ? zin(bouw, "de bolletjes liggen los") : null,
    goed: k.goed,
    fouten: k.fouten,
    uitleg: k.uitleg,
    tip: k.tip,
    opgave: [g, d],
    tussen: k.tussen,
    geheim: [g / d],
  });
}

// ---------------------------------------------------------------------------
// Koppelen
// ---------------------------------------------------------------------------

function koppelSommen(o: Opgave, sommen: { tekst: string; uitkomst: number; getallen: number[] }[], juist: string[], uitleg: string): Geschreven | null {
  if (o.antwoord !== juist.join(",")) return null;
  const fouten: Fout[] = sommen.map((s, i) => ({
    code: `koppel-${i}`,
    antwoorden: [sommen.map((_, j) => (j === i ? `!${juist[i]}` : "*")).join(",")],
    zinnen: [zin(`Reken ${s.tekst} nog eens uit.`), zin(`${hoofd(s.tekst)} is ${s.uitkomst}.`)],
  }));
  return maak({
    antwoord: o.antwoord,
    voorlezen: o.vraagtekst,
    goed: [zin("Elke som staat op de goede plek.")],
    fouten,
    uitleg: [zin("Kijk, zo doe je het."), zin("Reken eerst één som uit."), zin(`${hoofd(sommen[0].tekst)} is ${sommen[0].uitkomst}.`), zin(uitleg)],
    tip: zin("Reken eerst één som uit."),
    rondewoord: "opdrachten",
    opgave: sommen.flatMap((s) => s.getallen),
    tussen: sommen.map((s) => s.uitkomst),
    geheim: [],
  });
}

// ---------------------------------------------------------------------------

export function schrijfTafelsDelen(o: Opgave): Geschreven | null {
  const f = o.figuur;
  if (!f || typeof f !== "object") return null;
  const sg = o.somgegevens;

  switch (f.soort) {
    case "keersom":
      return String(f.eerste * f.tweede) === o.antwoord ? keerSom(o, f.eerste, f.tweede) : null;

    case "groepjesmaker":
      return groepjesmakerSom(o, f.a, f.b, f.stand);

    case "laser":
      return laserSom(o, f.stand, f.stenen as string[], f.goed as number[], f.tafel ?? 0, f.doel ?? 0);

    case "deelsom": {
      const verdelen = f.bouw === "verdelen";
      const bouwt = f.stap === "bouwen" || f.magneetjes === true;
      const bouw = bouwt ? (verdelen ? "Verdeel ze eerlijk." : `Klik steeds ${stuks(f.deler, "bolletje", "bolletjes")} tegen elkaar.`) : null;
      const s = deelSom(o, f.geheel, f.deler, verdelen, bouw, bouwt || f.stap === "hulp" ? "bolletjes" : GEEN_PLAATJE);
      if (s && f.kaleVraag && !/\d/.test(o.vraagtekst)) s.teksten.voorlezen = zin(metSom(o.vraagtekst, gedeeld(f.geheel, f.deler)));
      return s;
    }

    case "keerkoppelen":
      return koppelSommen(
        o,
        (f.sommen as { eerste: number; tweede: number }[]).map((s) => ({ tekst: keer(s.eerste, s.tweede), uitkomst: s.eerste * s.tweede, getallen: [s.eerste, s.tweede] })),
        (f.sommen as { eerste: number; tweede: number }[]).map((s) => String(s.eerste * s.tweede)),
        "Zoek dan die uitkomst en sleep hem erbij.",
      );

    case "deelkoppelen":
      return koppelSommen(
        o,
        (f.sommen as { eerste: number; tweede: number }[]).map((s) => ({ tekst: gedeeld(s.eerste, s.tweede), uitkomst: s.eerste / s.tweede, getallen: [s.eerste, s.tweede] })),
        (f.sommen as { eerste: number; tweede: number }[]).map((s) => String(s.eerste / s.tweede)),
        "Zoek dan die uitkomst en sleep hem erbij.",
      );

    case "keerdeelkoppelen": {
      const sommen = f.sommen as { geheel: number; deler: number }[];
      const keuzes = f.keuzes as { eerste: number; tweede: number }[];
      const juist = o.antwoord.split(",");
      if (juist.length !== sommen.length) return null;
      const fouten: Fout[] = sommen.map((s, i) => {
        const k = keuzes[Number(juist[i])];
        return {
          code: `koppel-${i}`,
          antwoorden: [sommen.map((_, j) => (j === i ? `!${juist[i]}` : "*")).join(",")],
          zinnen: [zin(`${hoofd(gedeeld(s.geheel, s.deler))} is ${s.geheel / s.deler}.`), zin(`Dat hoort bij ${keer(k.eerste, k.tweede)} is ${s.geheel}.`)],
        };
      });
      const s0 = sommen[0];
      const k0 = keuzes[Number(juist[0])];
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin("Elke keersom hoort bij zijn deelsom.")],
        fouten,
        uitleg: [zin("Delen is het omgekeerde van keer."), zin(`${hoofd(keer(k0.eerste, k0.tweede))} is ${s0.geheel}.`), zin(`Dus ${gedeeld(s0.geheel, s0.deler)} is ${s0.geheel / s0.deler}.`)],
        tip: zin("Welke keersom geeft hetzelfde grote getal?"),
        rondewoord: "opdrachten",
        opgave: [...sommen.flatMap((s) => [s.geheel, s.deler]), ...keuzes.flatMap((k) => [k.eerste, k.tweede])],
        tussen: sommen.map((s) => s.geheel / s.deler),
        geheim: [],
      });
    }

    case "keerdeelsamen": {
      const g = f.geheel as number;
      const d = f.deler as number;
      const q = g / d;
      if (o.antwoord !== `${q},${q}`) return null;
      return maak({
        antwoord: o.antwoord,
        voorlezen: metSom(o.vraagtekst, `hoeveel keer ${d} is ${g}?`),
        goed: [zin(`${keer(q, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${q}.`)],
        fouten: [
          { code: "keersom", antwoorden: [`!${q},*`], zinnen: [zin(`Hoeveel groepjes van ${d} passen in ${g}?`), zin(`${keer(q, d)} is ${g}.`)] },
          { code: "deelsom", antwoorden: [`${q},!${q}`], zinnen: [zin("De keersom klopt al."), zin(`Dus ${gedeeld(g, d)} is ook ${q}.`)] },
        ],
        uitleg: [zin("Delen is het omgekeerde van keer."), zin(`${keer(q, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${q}.`)],
        tip: zin(`Hoeveel keer ${d} is ${g}?`),
        opgave: [g, d],
        geheim: [q],
      });
    }

    case "handigkeer": {
      if (f.stap !== "dubbel" || !sg?.extra) return null;
      const tafel = f.tafel as number;
      const mee = f.mee as number;
      const nieuw = sg.extra.nieuweMee;
      const c = nieuw * tafel;
      if (String(c) !== o.antwoord || nieuw !== mee * 2) return null;
      const bekend = mee * tafel;
      return maak({
        antwoord: o.antwoord,
        voorlezen: `${o.vraagtekst} Hoeveel is ${keer(nieuw, tafel)}?`,
        goed: [zin(`${keer(mee, tafel)} is ${bekend}.`), zin(`${nieuw} keer is het dubbele: ${c}.`)],
        fouten: [
          { code: "bekende-som", antwoorden: [`${bekend}`], zinnen: [zin(`${bekend} is ${keer(mee, tafel)}.`), zin(`${nieuw} keer is het dubbele: ${c}.`)] },
          { code: "groepje-ernaast", antwoorden: [`${c - tafel}`, `${c + tafel}`], zinnen: [zin("Je zit één groepje ernaast."), zin(`${bekend} en nog eens ${bekend} is ${c}.`)] },
          { code: "plus-gedaan", antwoorden: [`${bekend + mee}`, `${bekend + 2}`], zinnen: [zin("Het dubbele is twee keer zoveel."), zin(`${bekend} en ${bekend} is ${c}.`)] },
        ],
        uitleg: [zin(`Je weet ${keer(mee, tafel)} is ${bekend}.`), zin(`${nieuw} is het dubbele van ${mee}.`), zin(`Dus ${bekend} en ${bekend}: ${keer(nieuw, tafel)} is ${c}.`)],
        tip: zin(`${nieuw} is het dubbele van ${mee}.`),
        opgave: [mee, tafel, nieuw, bekend],
        tussen: [2],
        geheim: [c],
      });
    }

    case "keernullen": {
      const t = f.tafel as number;
      const m = f.mee as number;
      const p = t * m;
      if (o.antwoord !== `${m},${m * 10},${m * 100}`) return null;
      const juist = [m, m * 10, m * 100];
      return maak({
        antwoord: o.antwoord,
        voorlezen: metSom(o.vraagtekst, `${t} keer hoeveel is ${p}?`),
        goed: [zin(`${keer(t, m)} is ${p}.`), zin("Komt er een 0 bij, dan ook hier.")],
        fouten: juist.map((x, i) => ({
          code: `regel-${i}`,
          antwoorden: [juist.map((_, j) => (j === i ? `!${x}` : "*")).join(",")],
          zinnen: [zin(`${hoofd(keer(t, x))} is ${p * 10 ** i}.`), zin(i === 0 ? `Dus het getal is ${x}.` : `Er komt een 0 bij: ${x}.`)],
        })),
        uitleg: [zin(`${keer(t, m)} is ${p}.`), zin(`${keer(t, m * 10)} is ${p * 10}.`), zin(`${keer(t, m * 100)} is ${p * 100}.`), zin("Telkens komt er een 0 bij.")],
        tip: zin(`Welk getal keer ${t} is ${p}?`),
        opgave: [t, p, p * 10, p * 100],
        tussen: [0],
        geheim: juist,
      });
    }

    case "keerplaatjes": {
      const r = f.rijen as number;
      const k = f.kolommen as number;
      const c = r * k;
      if (o.antwoord !== `${r},${k},${c}`) return null;
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`${hoofd(rijen(r))} van ${k} is ${c}.`, "de rijen lichten één voor één op")],
        fouten: [
          { code: "omgedraaid", antwoorden: [`${k},${r},*`], zinnen: [zin("Eerst het aantal rijen, dan hoeveel in een rij."), zin(`${hoofd(rijen(r))} van ${k}: ${keer(r, k)}.`, "de rijen lichten op")] },
          { code: "rijen-geteld", antwoorden: [`!${r},*,*`], zinnen: [zin("Tel de rijen nog eens."), zin(`Het zijn ${rijen(r)}.`, "de rijen lichten één voor één op")] },
          { code: "per-rij-geteld", antwoorden: [`${r},!${k},*`], zinnen: [zin("Tel hoeveel er in één rij zitten."), zin(`Het zijn er ${k}.`, "één rij licht op")] },
          { code: "uitkomst", antwoorden: [`${r},${k},!${c}`], zinnen: [zin("De keersom klopt al."), zin(`${hoofd(keer(r, k))} is ${c}.`, "alles licht op")] },
        ],
        uitleg: keerKern(r, k, "rijen").uitleg,
        tip: zin("Tel eerst de rijen, dan hoeveel in een rij."),
        opgave: [],
        tussen: [r, k, c, ...keerKern(r, k).tussen],
        geheim: [r, k, c],
      });
    }

    case "keerraster": {
      const r = f.rijen as number;
      const k = f.kolommen as number;
      const c = r * k;
      if (String(c) !== o.antwoord) return null;
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`${hoofd(rijen(r))} van ${k} is ${c}.`, "de rijen lichten één voor één op")],
        fouten: [
          { code: "plus-gedaan", antwoorden: [`${r + k}`], zinnen: [zin(`${r} en ${k} is ${r + k}.`), zin(`Maar het zijn ${rijen(r)} van ${k}: ${c}.`, "de rijen lichten op")] },
          { code: "rij-ernaast", antwoorden: [`${c - k}`, `${c + k}`], zinnen: [zin("Je zit één rij ernaast."), zin(`${hoofd(rijen(r))} van ${k} is ${c}.`, "de rijen lichten één voor één op")] },
          { code: "een-ernaast", antwoorden: [`${c - 1}`, `${c + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`${hoofd(rijen(r))} van ${k} is ${c}.`, "de rijen lichten één voor één op")] },
        ],
        uitleg:
          r <= 7
            ? [zin(`Er zijn ${rijen(r)} van ${k}.`, "de rijen lichten op"), zin(`Tel maar: ${sprongen(k, r)}.`, "de rijen lichten één voor één op"), zin(`Dus ${keer(r, k)} is ${c}.`, "alles licht op")]
            : keerKern(r, k, "rijen").uitleg,
        tip: zin("Tel de rijen, en hoeveel er in een rij zitten."),
        opgave: [],
        tussen: [r, k, r + k, c - k, c + k, ...Array.from({ length: r }, (_, i) => (i + 1) * k), ...keerKern(r, k).tussen],
        geheim: [c],
      });
    }

    case "marktkraam": {
      const w = f.waren as { naam: string; prijs: number; aantal: number }[];
      if (w.length !== 2) return null;
      const [x, y] = w;
      const tx = x.aantal * x.prijs;
      const ty = y.aantal * y.prijs;
      const tot = tx + ty;
      const getallen = [x.aantal, x.prijs, y.aantal, y.prijs];
      if (f.betaald === null || f.betaald === undefined) {
        if (String(tot) !== o.antwoord) return null;
        return maak({
          antwoord: o.antwoord,
          voorlezen: o.vraagtekst,
          goed: [zin(`${keer(x.aantal, `€ ${x.prijs}`)} is € ${tx}.`), zin(`Met ${keer(y.aantal, `€ ${y.prijs}`)} erbij: € ${tot}.`)],
          fouten: [
            { code: "alleen-prijzen", antwoorden: [`${x.prijs + y.prijs}`], zinnen: [zin("Let op hoeveel je van elk koopt."), zin(`Samen is dat € ${tot}.`)] },
            { code: "tweede-vergeten", antwoorden: [`${tx}`], zinnen: [zin(`Je rekende alleen de ${x.naam} uit.`), zin(`Met de ${y.naam} erbij is het € ${tot}.`)] },
            { code: "eerste-vergeten", antwoorden: [`${ty}`], zinnen: [zin(`Je rekende alleen de ${y.naam} uit.`), zin(`Met de ${x.naam} erbij is het € ${tot}.`)] },
            { code: "een-ernaast", antwoorden: [`${tot - 1}`, `${tot + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`€ ${tx} en € ${ty} is samen € ${tot}.`)] },
          ],
          uitleg: [zin("Kijk, zo doe je het."), zin(`${hoofd(keer(x.aantal, `€ ${x.prijs}`))} is € ${tx}.`), zin(`${hoofd(keer(y.aantal, `€ ${y.prijs}`))} is € ${ty}.`), zin(`Samen is dat € ${tot}.`)],
          tip: zin("Reken eerst uit wat elk ding samen kost."),
          opgave: getallen,
          tussen: [tx, ty],
          geheim: [tot],
        });
      }
      const bet = f.betaald as number;
      const terug = bet - tot;
      if (String(terug) !== o.antwoord) return null;
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`Samen kost het € ${tot}.`), zin(`Van € ${tot} naar € ${bet} is € ${terug}.`)],
        fouten: [
          { code: "totaal-gegeven", antwoorden: [`${tot}`], zinnen: [zin(`€ ${tot} is wat het kost.`), zin(`Je betaalt € ${bet}, dus je krijgt € ${terug} terug.`)] },
          { code: "een-ernaast", antwoorden: [`${terug - 1}`, `${terug + 1}`], zinnen: [zin("Je zit er 1 naast."), zin(`Van € ${tot} naar € ${bet} is € ${terug}.`)] },
          { code: "een-ding-vergeten", antwoorden: [`${bet - tx}`, `${bet - ty}`], zinnen: [zin("Reken alles mee wat je koopt."), zin(`Samen kost het € ${tot}, dus € ${terug} terug.`)] },
        ],
        uitleg: [zin(`${hoofd(keer(x.aantal, `€ ${x.prijs}`))} is € ${tx}.`), zin(`${hoofd(keer(y.aantal, `€ ${y.prijs}`))} is € ${ty}.`), zin(`Samen € ${tot}, dat is van € ${bet}: € ${terug} terug.`)],
        tip: zin("Reken eerst uit wat alles samen kost."),
        opgave: [...getallen, bet],
        tussen: [tx, ty, tot, bet - tx, bet - ty],
        geheim: [terug],
      });
    }

    case "welkedeelsom": {
      const v = sg?.variant;
      const u = f.uitkomst as number;
      if (v === "delervraag") {
        const g = f.geheel as number;
        const d = g / u;
        if (String(d) !== o.antwoord) return null;
        return maak({
          antwoord: o.antwoord,
          voorlezen: metSom(o.vraagtekst, `${g} gedeeld door hoeveel is ${u}?`),
          goed: [zin(`${keer(u, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${u}.`)],
          fouten: [
            { code: "uitkomst-overgeschreven", antwoorden: [`${u}`], zinnen: [zin(`${u} is de uitkomst al.`), zin(`${hoofd(gedeeld(g, d))} is ${u}.`)] },
            { code: "keer-gedaan", antwoorden: [`${g * u}`], zinnen: [zin("Dit is gedeeld door, niet keer."), zin(`${keer(u, d)} is ${g}, dus ${d}.`)] },
            { code: "min-gedaan", antwoorden: [`${g - u}`], zinnen: [zin("Dit is gedeeld door, niet min."), zin(`${keer(u, d)} is ${g}, dus ${d}.`)] },
          ],
          uitleg: [zin("Delen is het omgekeerde van keer."), zin(`Welk getal keer ${u} is ${g}?`), zin(`${keer(u, d)} is ${g}, dus ${d}.`)],
          tip: zin(`Welk getal keer ${u} is ${g}?`),
          opgave: [g, u],
          geheim: [d],
        });
      }
      if (v === "geheelvraag") {
        const d = f.deler as number;
        const g = u * d;
        if (String(g) !== o.antwoord) return null;
        return maak({
          antwoord: o.antwoord,
          voorlezen: metSom(o.vraagtekst, `hoeveel gedeeld door ${d} is ${u}?`),
          goed: [zin(`${keer(u, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${u}.`)],
          fouten: [
            { code: "uitkomst-overgeschreven", antwoorden: [`${u}`], zinnen: [zin(`${u} is de uitkomst al.`), zin(`${hoofd(keer(u, d))} is ${g}.`)] },
            { code: "plus-gedaan", antwoorden: [`${u + d}`], zinnen: [zin("Hier hoort keer bij, niet plus."), zin(`${hoofd(keer(u, d))} is ${g}.`)] },
            { code: "groepje-ernaast", antwoorden: [`${g - d}`, `${g + d}`], zinnen: [zin("Je zit één groepje ernaast."), zin(`${hoofd(groepjes(u))} van ${d} is ${g}.`)] },
          ],
          uitleg: [zin("Delen is het omgekeerde van keer."), zin(`${hoofd(groepjes(u))} van ${d}: ${keer(u, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${u}.`)],
          tip: zin("Delen is het omgekeerde van keer."),
          opgave: [d, u],
          tussen: [g - d, g + d],
          geheim: [g],
        });
      }
      if (v === "zelf" && sg) {
        const [g, d] = sg.getallen;
        return maak({
          antwoord: o.antwoord,
          voorlezen: o.vraagtekst,
          goed: [zin(`Die deelsom komt uit op ${u}.`)],
          fouten: [],
          uitleg: [zin("Kijk, zo doe je het."), zin(`Kies een getal, bijvoorbeeld ${d}.`), zin(`${keer(u, d)} is ${g}.`), zin(`Dus ${gedeeld(g, d)} is ${u}.`)],
          tip: zin("Denk aan een keersom die je kent."),
          rondewoord: "opdrachten",
          opgave: [u],
          tussen: [g, d],
          geheim: [],
        });
      }
      return null;
    }

    case "welkekeersom": {
      if (!sg) return null;
      const u = f.uitkomst as number;
      const [a, b] = sg.getallen;
      return maak({
        antwoord: o.antwoord,
        voorlezen: o.vraagtekst,
        goed: [zin(`Die keersom komt uit op ${u}.`)],
        fouten: [],
        uitleg: [zin("Kijk, zo doe je het."), zin(`${hoofd(groepjes(a))} van ${b} is ${u}.`), zin(`Dus ${keer(a, b)} is ${u}.`)],
        tip: zin("Denk aan een tafel die je kent."),
        rondewoord: "opdrachten",
        opgave: [u],
        tussen: [a, b],
        geheim: [],
      });
    }

    default:
      return null;
  }
}
