/**
 * Les: Optellen onder de 10 — naar Synthesis "Add within 10 · Adding below 10"
 * (INSPIRATIE.md, ronde 2 en 3; LESSENPLAN.md O2). Groep 3.
 *
 * Sinds 27 oktober 2026 (BOUWEN-PHASER.md) in Phaser: het gedeelde
 * hologram-tegelvlak van dit onderdeel (../vlakken/optellen10-holo-tegels) in
 * plaats van het ingebouwde tegelraster van het lesscherm. Zelfde verloop.
 *
 * Verloop zoals daar, in eigen woorden:
 * 1. Drie keer zelf een tegel kiezen en zeggen welk getal het is.
 * 2. Twee tegels samen (eerst uit 1 tot en met 4, daarna 3, 4 en 5) en het totaal.
 * 3. Eén tegel kiezen en de tegel zoeken die samen 7 maakt (en daarna 8).
 * 4. Moeilijker: samen 10 maken, de som kiezen, de toren omdraaien.
 * 5. Nog drie manieren om 10 te maken.
 * Aan het eind de kaart. Samen 15 opgaven.
 *
 * Hulp (INSPIRATIE R3): bij "welk getal?" de eerste keer nog een kans, de
 * tweede keer telt Bliepo de hokjes en zegt het getal; "weet ik niet" = het
 * antwoord, en de vraag komt aan het eind terug. Een foute tegel verdwijnt
 * zonder het woord "fout".
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { pastOp } from "../tegels";
import { HoloTegelvlak } from "../vlakken/optellen10-holo-tegels";
import { Later, metUitleg, pakTegel, pas, PAK_HULP, schud, telHokjes, Werkvlak } from "./optellen-tot-10";

const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** "Welk getal is dit?" Geeft terug of het meteen goed was. */
async function welkGetal(l: Lesgids, vak: Werkvlak, n: number, later: Later): Promise<boolean> {
  let x = await l.getal();
  if (x === n) {
    vak.goed(0);
    return true;
  }
  if (x === null) {
    await l.zeg("Geen zorgen.", "We tellen samen.");
    await telHokjes(l, 0, n);
    await l.zeg(n === 1 ? "Het is {1} hokje." : `Het zijn {${n}} hokjes.`, `Dus het is een {${n}}.`, "Daar komen we later nog op terug.");
    await l.verder();
    later.bewaar(async () => {
      vak.zet([{ stukken: [n] }]);
      pas(l, { bak: [] });
      await l.zeg("Welk getal is dit?");
      const y = await l.getal();
      if (y === n) {
        vak.goed(0);
        await l.zeg("Ja!", `Het is een {${n}}.`);
      } else {
        await telHokjes(l, 0, n);
        await l.zeg(`Ik tel {${n}} hokjes.`, `Dus het is een {${n}}.`);
        await l.verder();
      }
      vak.zet([]);
    });
    return false;
  }
  /* 1× fout: nog een kans, met één hint. */
  await l.zeg("Hmm, niet helemaal.", "Tel de hokjes maar.");
  x = await l.getal();
  if (x === n) {
    vak.goed(0);
    await l.zeg("Ja, nu klopt het.");
    return false;
  }
  /* 2× fout: Bliepo telt en zegt het getal. */
  await telHokjes(l, 0, n);
  await l.zeg(n === 1 ? "Hmm, ik tel {1} hokje." : `Hmm, ik tel {${n}} hokjes.`, `Dus het is een {${n}}.`);
  await l.verder();
  return false;
}

/** "Hoeveel is dat samen?" Eerst een richting, daarna samen tellen. */
async function hoeveelSamen(l: Lesgids, vak: Werkvlak, a: number, b: number): Promise<void> {
  const som = a + b;
  for (let poging = 1; ; poging++) {
    const x = await l.getal();
    if (x === som) {
      vak.goed(0);
      await l.zeg("Ja!", `{${a}} en {${b}} is samen {${som}}.`);
      return;
    }
    if (x !== null && poging === 1) {
      await l.zeg(`Hmm, {${a}} en {${b}} is samen ${Math.abs(x - som) <= 2 ? "iets " : ""}${x < som ? "meer" : "minder"} dan {${x}}.`, "Tel nog eens.");
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen, we zoeken het samen uit." : "We tellen samen.");
    await telHokjes(l, "alle", som);
    await l.zeg(`{${a}} en {${b}} is samen {${som}}.`);
    await l.verder();
    return;
  }
}

/** Twee tegels in het rooster; de tweede komt erop als hij past, anders ernaast. */
async function tweeTegels(l: Lesgids, vak: Werkvlak): Promise<[number, number]> {
  const a = await pakTegel(l, PAK_HULP);
  vak.legOp(0, a);
  const b = await pakTegel(l, PAK_HULP);
  if (pastOp([a], b)) vak.legOp(0, b);
  else vak.legOp(1, b);
  return [a, b];
}

/**
 * Het kind zoekt de tegel die bij `n` samen `doel` maakt. Een foute tegel
 * verschijnt even en verdwijnt weer; met `uitBak` gaat hij ook uit de bak.
 */
async function maakSamen(l: Lesgids, vak: Werkvlak, n: number, doel: number, bak: number[], uitBak: boolean): Promise<number> {
  const nodig = doel - n;
  let rij = [...bak];
  for (let fouten = 0; ; ) {
    const k = await pakTegel(l, [`Welke tegel maakt samen met de {${n}} {${doel}}?`]);
    if (k === nodig) {
      pas(l, { hint: null });
      if (pastOp([n], k)) vak.legOp(0, k);
      else vak.legOp(1, k);
      return k;
    }
    await vak.evenLaten(1, k);
    if (uitBak) {
      rij = rij.filter((t) => t !== k);
      pas(l, { bak: rij });
    }
    fouten++;
    if (fouten === 1) {
      await l.zeg(`Zet een tegel bij de {${n}}.`, `Samen moet het {${doel}} zijn.`);
    } else if (fouten === 2) {
      await l.zeg(
        `{${n}} en {${k}} is samen {${n + k}}.`,
        n + k < doel ? "Dat is te weinig." : "Dat is te veel.",
        `Zoek een tegel, zodat het samen {${doel}} is.`,
      );
    } else {
      if (pastOp([n], nodig)) pas(l, { hint: { toren: 0, n: nodig } });
      await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Pak de {${nodig}}.`);
    }
  }
}

/** Het kind schrijft de som zelf: het vakje dat aan de beurt is licht op, het kind typt in het invulvak. */
async function somSchrijven(l: Lesgids, vak: Werkvlak, p: number, q: number, totaal: number): Promise<void> {
  const vakjes = ["", "", ""];
  const toon = (aan: number | null) =>
    pas(l, {
      som: [
        { t: "vak", waarde: vakjes[0] },
        { t: "teken", s: "+" },
        { t: "vak", waarde: vakjes[1] },
        { t: "teken", s: "=" },
        { t: "vak", waarde: vakjes[2] },
      ],
      somAan: aan,
    });
  toon(0);
  await l.zeg("Ik heb vakjes klaargezet.", "Typ één van de getallen voor het eerste vakje.", "Het maakt niet uit welke.");
  let eerste = await l.getal();
  if (eerste !== p && eerste !== q) {
    await l.zeg("Kijk naar de tegels.", `Typ de {${p}} of de {${q}}.`);
    eerste = await l.getal();
    if (eerste !== p && eerste !== q) eerste = p;
  }
  vakjes[0] = String(eerste);
  const ander = eerste === p ? q : p;
  toon(2);
  await l.zeg("Typ nu het andere getal.", `Het getal dat bij de {${eerste}} kwam.`);
  if ((await l.getal()) !== ander) {
    await l.zeg(`De andere tegel is de {${ander}}.`, `Typ de {${ander}}.`);
    await l.getal();
  }
  vakjes[1] = String(ander);
  toon(4);
  await l.zeg("Typ tot slot wat ze samen maken.", `Wat is {${eerste}} en {${ander}} samen?`);
  if ((await l.getal()) !== totaal) {
    await telHokjes(l, "alle", totaal);
    await l.zeg(`Het zijn {${totaal}} hokjes.`, `Typ de {${totaal}}.`);
    await l.getal();
  }
  vakjes[2] = String(totaal);
  toon(null);
  vak.goed(0);
}

/** Een tegel kiezen en de tegel zoeken die samen `doel` maakt. */
async function samenMaken(l: Lesgids, vak: Werkvlak, doel: number, bak: number[], zinnen: string[]) {
  vak.zet([]);
  pas(l, { bak, om: false });
  await l.zeg(...zinnen);
  const g = await pakTegel(l, PAK_HULP);
  vak.legOp(0, g);
  if (g % 2 === 1) pas(l, { om: true });
  await l.zeg(`Je hebt een {${g}} gekozen.`, `Maak er samen {${doel}} van.`, "*Welke* tegel moet erbij?");
  const h = await maakSamen(l, vak, g, doel, bak, false);
  pas(l, { om: false });
  vak.goed(0);
  await l.zeg("Ja.", `{${g}} en {${h}} is samen {${doel}}.`);
  await l.verder();
  return g;
}

export const optellenOnder10: Lesdraaiboek = {
  id: "optellen-onder-10",
  titel: "Optellen onder de 10",
  synthesis: "Add within 10 · Adding below 10",
  kaarttegels: [3, 1],

  async speel(l0) {
    const l = metUitleg(l0);
    const vak = new Werkvlak(l);
    const later = new Later();

    /* 1. Tegels leren kennen. */
    l.vlak(HoloTegelvlak, { torens: [], bak: ALLES });
    let bak = [...ALLES];
    await l.zeg("Kies een tegel.", "Welke je maar wilt.");
    let n = await pakTegel(l, ["Tik op een tegel.", "Sleep hem dan naar het rooster."], { hand: true });
    vak.legOp(0, n);
    await l.zeg("Mooi.", "Welk getal heb je gekozen?");
    let goed = await welkGetal(l, vak, n, later);
    vak.zet([]);
    bak = bak.filter((t) => t !== n);
    pas(l, { bak });

    await l.zeg(goed ? "Goed zo." : "", "Kies nog een tegel.");
    n = await pakTegel(l, ["Tik op een tegel.", "Sleep hem dan naar het rooster."]);
    vak.legOp(0, n);
    await l.zeg("Welk getal is *dit*?");
    goed = await welkGetal(l, vak, n, later);
    vak.zet([]);
    bak = bak.filter((t) => t !== n);
    pas(l, { bak });

    await l.zeg(goed ? "Ja." : "", "Nog eentje.");
    n = await pakTegel(l, PAK_HULP);
    vak.legOp(0, n);
    await l.zeg("Weet je welk getal dit is?");
    await welkGetal(l, vak, n, later);
    vak.zet([]);

    /* 2. Twee tegels samen. */
    pas(l, { bak: [1, 2, 3, 4], slot: [] });
    await l.zeg("Zet nu twee tegels in het rooster.", "Je mag zelf kiezen welke.");
    const [a, b] = await tweeTegels(l, vak);
    await l.zeg(`Je hebt de {${a}} en de {${b}} gekozen.`, "Wat is het totaal?");
    await hoeveelSamen(l, vak, a, b);
    vak.zet([]);
    pas(l, { slot: [...new Set([a, b])] });

    await l.zeg("Kies nu twee andere tegels.", a === b ? `De {${a}} zet ik op slot.` : `De {${a}} en de {${b}} zet ik op slot.`);
    const [c, d] = await tweeTegels(l, vak);
    await l.zeg(`Nu heb je de {${c}} en de {${d}} gekozen.`, "Hoeveel is het samen?");
    await hoeveelSamen(l, vak, c, d);
    vak.zet([]);

    pas(l, { bak: [3, 4, 5], slot: [] });
    await l.zeg("Kijk, drie nieuwe tegels.", "Kies er twee.");
    const [e, f] = await tweeTegels(l, vak);
    await l.zeg(`Deze keer heb je de {${e}} en de {${f}} gekozen.`, "Hoeveel is het samen?");
    await hoeveelSamen(l, vak, e, f);
    vak.zet([]);

    /* 3. Samen 7 maken, en daarna samen 8. */
    const g7 = await samenMaken(l, vak, 7, [1, 2, 3, 4, 5, 6], ["Zet een nieuwe tegel in het rooster."]);
    await samenMaken(l, vak, 8, [1, 2, 3, 4, 5, 6, 7].filter((t) => t !== g7), ["Nog een keer.", "Kies een andere tegel.", "Nu maken we samen {8}."]);
    vak.zet([]);

    /* 4. Moeilijker: samen 10. */
    pas(l, { bak: ALLES, om: false });
    await l.zeg(l.naam ? `Je krijgt het door, ${l.naam}.` : "Je krijgt het door.", "We maken het wat moeilijker.", "Pak een nieuwe tegel.");
    const p = await pakTegel(l, PAK_HULP);
    vak.legOp(0, p);
    await l.zeg("Welk getal heb je gekozen?");
    await welkGetal(l, vak, p, later);
    /* De tegels draaien om, zodat ze in de inham van een oneven tegel passen. */
    if (p % 2 === 1) {
      pas(l, { om: true });
      await l.wacht(700);
    }
    await l.zeg("Zet er een tegel bij, zodat het samen {10} is.");
    const q = await maakSamen(l, vak, p, 10, ALLES, true);
    pas(l, { om: false, bak: ALLES });
    /* De 10 is een volle rechte toren: hij licht even op. */
    vak.torens[0] = { ...vak.toren(0), rand: true };
    vak.toon();
    vak.goed(0);

    await l.zeg("Ja.", `{${p}} en {${q}} maken samen {10}.`, "Weet je hoe je dit als som schrijft?");
    const juist = `${p} + ${q} = 10`;
    /* Echte kinderfouten (LESSENPLAN O2): de getallen naast elkaar (3 + 7 = 37), en min in plaats van plus (groot getal eerst). */
    const naast = `${p} + ${q} = ${p}${q}`;
    const min = `${Math.max(p, q)} − ${Math.min(p, q)} = 10`;
    const keuze = await l.kies(schud([juist, naast, min]));
    if (keuze === juist) {
      pas(l, { som: [{ t: "getal", n: p }, { t: "teken", s: "+" }, { t: "getal", n: q }, { t: "teken", s: "=" }, { t: "getal", n: 10 }] });
      await l.zeg("Goed zo.", "Wat gebeurt er als ik de tegels omdraai?");
      await l.verder();
    } else {
      if (keuze === naast) {
        await l.zeg("Ik snap wat je denkt.", "Je zette de getallen naast elkaar.", "Laten we kijken.");
      } else if (keuze === min) {
        await l.zeg("Kijk goed naar het teken.", "We doen de tegels bij elkaar.", "Dan hoort er een plus bij.");
      } else {
        await l.zeg("Geen zorgen.", "We schrijven de som samen.");
      }
      await l.verder();
      await somSchrijven(l, vak, p, q, 10);
      await l.zeg("Kijk eens.", "Nu ga ik de toren omdraaien.");
      await l.verder();
    }

    vak.torens[0] = { ...vak.toren(0), rand: false };
    vak.toon();
    await vak.draai(0);
    pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "vak", waarde: "?" }], somAan: 4 });
    await l.zeg(`Nu ligt de {${p}} bovenop.`, "Hoeveel is het nu samen?");
    const nu = await l.kies(["9", "10", "8", "11"]);
    pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "getal", n: 10 }], somAan: null });
    if (nu === "10") {
      vak.goed(0);
      await l.zeg("Precies.", "Het is nog steeds {10}.", "De volgorde maakt niet uit.");
    } else {
      await l.zeg("Kijk, het zijn dezelfde tegels.", "Ze liggen alleen anders.", "Het is nog steeds {10}.");
    }
    await l.verder();
    pas(l, { som: null });
    vak.zet([]);

    /* 5. Nog drie manieren om 10 te maken. */
    const gehad = [p, q];
    const inleiding = ["Er is nog een manier om {10} te maken.", "En nog een manier.", "Nog één manier, dan zijn we klaar."];
    for (const ronde of [0, 1, 2]) {
      const rij = ALLES.filter((t) => !gehad.includes(t));
      pas(l, { bak: rij, om: false });
      await l.zeg(inleiding[ronde], "Kies deze keer een andere tegel.");
      const m = await pakTegel(l, PAK_HULP);
      vak.legOp(0, m);
      if (m % 2 === 1) pas(l, { om: true });
      await l.zeg(`Je hebt een {${m}} gekozen.`, "Zet er een tegel bij, zodat het samen {10} is.");
      /* De tegel die erbij hoort, ligt er altijd: de rij bevat elk getal behalve wat al gebruikt is. */
      if (!rij.includes(10 - m)) pas(l, { bak: [...rij, 10 - m].sort((x, y) => x - y) });
      const r = await maakSamen(l, vak, m, 10, rij.includes(10 - m) ? rij : [...rij, 10 - m], true);
      pas(l, { om: false });
      vak.goed(0);
      await l.zeg("Ja!", `{${m}} en {${r}} maken ook {10}.`);
      gehad.push(m, r);
      await l.wacht(800);
      vak.zet([]);
    }

    /* Wat het kind niet wist, komt nog één keer terug. */
    await later.speel(l);

    /* Einde: de kaart. */
    pas(l, { bak: [] });
    const tik = l.kaart();
    await l.zeg(l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!", "Je kunt al mooi plussommen maken.", "Tik op de kaart om hem af te vinken.");
    await tik;
  },
};
