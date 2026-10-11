/**
 * Les: Optellen onder de 10 — naar Synthesis "Add within 10 · Adding below 10"
 * (INSPIRATIE.md, ronde 2). Groep 3.
 *
 * Verloop zoals daar, in eigen woorden:
 * 1. Drie keer zelf een tegel kiezen en zeggen welk getal het is.
 * 2. Twee tegels samen (eerst uit 1 tot en met 4, daarna 3, 4 en 5) en het totaal.
 * 3. Eén tegel kiezen en de tegel zoeken die samen 7 maakt.
 * 4. Moeilijker: samen 10 maken, de som kiezen, de toren omdraaien.
 * 5. Nog een manier om 10 te maken.
 * Aan het eind de kaart.
 *
 * Bij een fout geeft de les een richting ("iets meer dan …") en daarna het
 * antwoord met de reden. Een foute tegel verdwijnt zonder het woord "fout".
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { pastOp } from "../tegels";

const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function schud<T>(lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/** "Welk getal is dit?" Geeft terug of het meteen goed was. */
async function welkGetal(l: Lesgids, n: number): Promise<boolean> {
  const x = await l.getal();
  if (x === n) return true;
  if (x === null) {
    await l.zeg("Geen zorgen.", "We tellen samen.");
    await l.tel();
    await l.zeg(n === 1 ? "Het is {1} hokje." : `Het zijn {${n}} hokjes.`, `Dus het is een {${n}}.`);
  } else {
    await l.tel();
    await l.zeg(n === 1 ? "Hmm, ik tel {1} hokje." : `Hmm, ik tel {${n}} hokjes.`, `Dus het is een {${n}}.`);
  }
  await l.verder();
  return false;
}

/** "Hoeveel is dat samen?" Eerst een richting, daarna samen tellen. */
async function hoeveelSamen(l: Lesgids, a: number, b: number): Promise<void> {
  const som = a + b;
  for (let poging = 1; ; poging++) {
    const x = await l.getal();
    if (x === som) {
      await l.zeg("Ja!", `{${a}} en {${b}} is samen {${som}}.`);
      return;
    }
    if (x !== null && poging === 1) {
      await l.zeg(`Hmm, {${a}} en {${b}} is samen ${Math.abs(x - som) <= 2 ? "iets " : ""}${x < som ? "meer" : "minder"} dan {${x}}.`, "Tel nog eens.");
      continue;
    }
    await l.zeg(x === null ? "Geen zorgen, we tellen samen." : "We tellen samen.");
    await l.tel();
    await l.zeg(`{${a}} en {${b}} is samen {${som}}.`);
    await l.verder();
    return;
  }
}

/** Twee tegels in het vak; de tweede komt erop als hij past, anders ernaast. */
async function tweeTegels(l: Lesgids): Promise<[number, number]> {
  const a = await l.pak();
  l.leg(a);
  const b = await l.pak();
  l.leg(b, { naast: !pastOp([a], b) });
  return [a, b];
}

/**
 * Het kind zoekt de tegel die bij `n` samen `doel` maakt. Een foute tegel
 * verschijnt even en verdwijnt weer; met `uitBak` gaat hij ook uit de bak.
 */
async function maakSamen(l: Lesgids, n: number, doel: number, uitBak: boolean): Promise<number> {
  const nodig = doel - n;
  for (let fouten = 0; ; ) {
    const k = await l.pak();
    if (k === nodig) {
      l.leg(k, { naast: !pastOp([n], k) });
      return k;
    }
    l.leg(k, { naast: true });
    await l.wacht(600);
    await l.haalWeg();
    if (uitBak) l.uitBak(k);
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
      await l.zeg(`Je hebt nog {${nodig}} nodig.`, `Pak de {${nodig}}.`);
    }
  }
}

/** Het kind schrijft de som zelf, in de vakjes bovenaan. */
async function somSchrijven(l: Lesgids, p: number, q: number, totaal: number): Promise<void> {
  l.som([{ t: "vak" }, { t: "teken", s: "+" }, { t: "vak" }, { t: "teken", s: "=" }, { t: "vak" }]);
  await l.zeg("Ik heb vakjes klaargezet.", "Typ één van de getallen in het eerste vakje.", "Het maakt niet uit welke.");
  let eerste = await l.somVak(0);
  while (eerste !== p && eerste !== q) {
    await l.zeg(`Kijk naar de tegels.`, `Typ de {${p}} of de {${q}}.`);
    eerste = await l.somVak(0);
  }
  const ander = eerste === p ? q : p;
  await l.zeg("Typ nu het andere getal.", `Het getal dat bij de {${eerste}} kwam.`);
  while ((await l.somVak(2)) !== ander) {
    await l.zeg(`De andere tegel is de {${ander}}.`);
  }
  await l.zeg("Typ tot slot wat ze samen maken.", `Wat is {${eerste}} en {${ander}} samen?`);
  while ((await l.somVak(4)) !== totaal) {
    await l.tel();
    await l.zeg(`Het zijn {${totaal}} hokjes.`, `Typ de {${totaal}}.`);
  }
}

export const optellenOnder10: Lesdraaiboek = {
  id: "optellen-onder-10",
  titel: "Optellen onder de 10",
  synthesis: "Add within 10 · Adding below 10",
  kaarttegels: [3, 1],

  async speel(l) {
    /* 1. Tegels leren kennen. */
    l.bak(ALLES);
    await l.zeg("Kies een tegel.", "Welke je maar wilt.");
    let n = await l.pak({ hand: true, hulp: ["Tik op een tegel.", "Zet hem dan in het vak."] });
    l.leg(n);
    await l.zeg("Mooi.", "Welk getal heb je gekozen?");
    let goed = await welkGetal(l, n);
    await l.leeg();
    l.uitBak(n);

    await l.zeg(goed ? "Goed zo." : "", "Kies nog een tegel.");
    n = await l.pak({ hulp: ["Tik op een tegel.", "Zet hem dan in het vak."] });
    l.leg(n);
    await l.zeg("Welk getal is *dit*?");
    goed = await welkGetal(l, n);
    await l.leeg();
    l.uitBak(n);

    await l.zeg(goed ? "Ja." : "", "Nog eentje.");
    n = await l.pak();
    l.leg(n);
    await l.zeg("Weet je welk getal dit is?");
    await welkGetal(l, n);
    await l.leeg();

    /* 2. Twee tegels samen. */
    l.bak([1, 2, 3, 4]);
    await l.zeg("Zet nu twee tegels in het vak.", "Je mag zelf kiezen welke.");
    const [a, b] = await tweeTegels(l);
    await l.zeg(`Je hebt de {${a}} en de {${b}} gekozen.`, "Hoeveel is dat samen?");
    await hoeveelSamen(l, a, b);
    await l.leeg();
    l.slot(a);
    l.slot(b);

    await l.zeg("Kies nu twee andere tegels.", a === b ? `De {${a}} zet ik op slot.` : `De {${a}} en de {${b}} zet ik op slot.`);
    const [c, d] = await tweeTegels(l);
    await l.zeg(`Nu heb je de {${c}} en de {${d}} gekozen.`, "Hoeveel is het samen?");
    await hoeveelSamen(l, c, d);
    await l.leeg();

    l.bak([3, 4, 5]);
    await l.zeg("Kijk, drie nieuwe tegels.", "Kies er twee.");
    const [e, f] = await tweeTegels(l);
    await l.zeg(`Deze keer heb je de {${e}} en de {${f}} gekozen.`, "Hoeveel is het samen?");
    await hoeveelSamen(l, e, f);
    await l.leeg();

    /* 3. Samen 7 maken. */
    l.bak([1, 2, 3, 4, 5, 6]);
    await l.zeg("Zet een nieuwe tegel in het vak.");
    const g = await l.pak();
    l.leg(g);
    await l.zeg(`Je hebt een {${g}} gekozen.`, "Maak er samen {7} van.", "*Welke* tegel moet erbij?");
    const h = await maakSamen(l, g, 7, false);
    await l.zeg("Ja.", `{${g}} en {${h}} is samen {7}.`);
    await l.verder();
    await l.leeg();

    /* 4. Moeilijker: samen 10. */
    l.bak(ALLES);
    await l.zeg(
      l.naam ? `${l.naam}, je snapt het al.` : "Je snapt het al.",
      "We maken het wat moeilijker.",
      "Pak een nieuwe tegel.",
    );
    const p = await l.pak();
    l.leg(p);
    await l.zeg("Welk getal heb je gekozen?");
    await welkGetal(l, p);
    /* De tegels draaien om, zodat ze in de inham van een oneven tegel passen. */
    if (p % 2 === 1) {
      l.bak(ALLES, { om: true });
      await l.wacht(700);
    }
    await l.zeg("Zet er een tegel bij, zodat het samen {10} is.");
    const q = await maakSamen(l, p, 10, true);

    await l.zeg("Ja.", `{${p}} en {${q}} maken samen {10}.`, "Weet je hoe je dit als som schrijft?");
    const juist = `${p} + ${q} = 10`;
    /* Echte kinderfouten, binnen de 20: er 1 naast, en min in plaats van plus (groot getal eerst, nooit onder 0). */
    const ernaast = `${p} + ${q} = 11`;
    const min = `${Math.max(p, q)} − ${Math.min(p, q)} = 10`;
    const keuze = await l.kies(schud([juist, ernaast, min]));
    if (keuze === juist) {
      await l.zeg("Goed zo.", "Wat gebeurt er als ik de tegels omwissel?");
      await l.verder();
    } else {
      if (keuze === ernaast) {
        await l.zeg("Bijna.", `{${p}} en {${q}} maken samen {10}, niet {11}.`, "We kijken samen.");
      } else if (keuze === min) {
        await l.zeg("Kijk goed naar het teken.", "We doen de tegels bij elkaar.", "Dan hoort er een plus bij.");
      } else {
        await l.zeg("Geen zorgen.", "We schrijven de som samen.");
      }
      await l.verder();
      await somSchrijven(l, p, q, 10);
      await l.zeg("Kijk eens.", "Nu ga ik de tegels omwisselen.");
      await l.verder();
    }

    await l.draai();
    await l.zeg(`Nu ligt de {${p}} bovenop.`, "Hoeveel is het nu samen?");
    const nu = await l.kies(["9", "10", "8", "11"]);
    if (nu === "10") {
      await l.zeg("Precies.", "Het is nog steeds {10}.", "De volgorde maakt niet uit.");
    } else {
      await l.zeg("Kijk, het zijn dezelfde tegels.", "Ze liggen alleen anders.", "Het is nog steeds {10}.");
    }
    await l.verder();
    l.som(null);
    await l.leeg();

    /* 5. Nog een manier om 10 te maken. */
    l.bak(ALLES.filter((t) => t !== p && t !== q));
    await l.zeg("Er is nog een manier om {10} te maken.", "Kies deze keer een andere tegel.");
    const m = await l.pak();
    l.leg(m);
    if (m % 2 === 1) {
      l.bak(ALLES.filter((t) => t !== p && t !== q), { om: true });
    }
    await l.zeg(`Je hebt een {${m}} gekozen.`, "Zet er een tegel bij, zodat het samen {10} is.");
    const r = await maakSamen(l, m, 10, true);
    await l.zeg("Ja!", `{${m}} en {${r}} maken ook {10}.`);
    await l.wacht(800);
    await l.leeg();

    /* Einde: de kaart. */
    l.bak([]);
    const tik = l.kaart();
    await l.zeg(
      l.naam ? `Goed gedaan, ${l.naam}!` : "Goed gedaan!",
      "Je kunt al mooi plussommen maken.",
      "Tik op de kaart om hem af te vinken.",
    );
    await tik;
  },
};
