/**
 * "Zo los je het op" bij het domein Geld.
 *
 * Eén weg per soort opdracht, en die weg is overal dezelfde als op school:
 * geld tel je vanaf het grootste (WERKPLAN.md), wisselgeld reken je door van
 * de prijs naar wat je betaalde, en schatten doe je met afgeronde bedragen.
 *
 * Bij de keuze-opdrachten is dit de hoofduitleg: uit "knop 3" valt geen
 * denkfout af te leiden, dus krijgt een kind daar altijd deze stappen.
 *
 * ---------------------------------------------------------------------------
 * De somgegevens
 * ---------------------------------------------------------------------------
 * Alle bedragen in centen. Per soort staat in `getallen`:
 *
 *   geldwaarde      de munten en briefjes in beeld
 *   geldvolgorde    de munten en briefjes in beeld
 *   geldtellen      de munten en briefjes in beeld
 *   geldleggen      [het bedrag dat gelegd moet worden]
 *   muntenofeuros   [de munt, hoeveel munten]
 *   geldgroepen     het totaal van elk vakje; prijs en betaald in `extra`
 *   welkegroepjes   het totaal van elk groepje; de prijs is `goed`
 *   evenveel        [hoeveel, van welke munt, naar welke munt]
 *   geldontbreekt   [de prijs, wat er al ligt]
 *   geldsom         [links, rechts]; `extra.teken` is 1 bij plus, -1 bij min
 *   geldverhaal     [betaald, prijs] — of bij "prijs" [betaald, terug]
 *   kunjebetalen    [het budget, en per zin wat die kost]
 *   bonnetje        de prijzen op het bonnetje; `extra.kwijt` de regel + 1
 *   geldafronden    [de prijs]
 *   geldschatten    [prijs 1, prijs 2, geld in de portemonnee]
 *   geldkorting     [de oude prijs, de korting]
 *   geldnotatie     [het bedrag]
 *
 * Bij geldgroepen is `extra.stand` 0 grootste, 1 precies, 2 wisselgeld en
 * 3 geld wisselen; bij 3 staat het gewisselde geldstuk in `extra.wissel`.
 *
 * `goed` is het antwoord als getal (in centen bij een bedrag), ook bij een
 * keuze — dan staat er `extra.keuze = 1` bij.
 */

import type { Aanpak, Somgegevens, Uitlegstap } from "@/lib/generatoren/foutpatroon";
import { afgerond, bedrag, groterEerst, naamVan } from "@/lib/geld";

/** Eén stap: de som op een regel, een gewone zin, en een korte zin voor groep 3-4. */
export type Geldstap = { som: string; zin: string; kort: string };

/** Optellen als rijtje: "€ 20,- + € 5,- = € 25,-". */
function plus(bedragen: number[]): string {
  return bedragen.map(bedrag).join(" + ");
}

/** Tel een groepje geld vanaf het grootste, met het tussentotaal na elke stap. */
function telStappen(stukken: number[]): Geldstap[] {
  const rij = groterEerst(stukken);
  const uit: Geldstap[] = [];
  let tot = 0;
  rij.forEach((stuk, i) => {
    tot += stuk;
    uit.push({
      som: i === 0 ? bedrag(tot) : `${bedrag(tot - stuk)} + ${bedrag(stuk)} = ${bedrag(tot)}`,
      zin: i === 0 ? `Begin bij het grootste: ${naamVan(stuk)}.` : `Tel er ${naamVan(stuk)} bij.`,
      kort: i === 0 ? "Begin bij het grootste." : "Tel erbij.",
    });
  });
  return uit;
}

/** Doortellen van een bedrag naar een ander, zoals je wisselgeld teruggeeft. */
function doortellen(van: number, naar: number): Geldstap[] {
  return [
    { som: bedrag(van), zin: `Begin bij ${bedrag(van)}.`, kort: `Begin bij ${bedrag(van)}.` },
    {
      som: `${bedrag(van)} + ${bedrag(naar - van)} = ${bedrag(naar)}`,
      zin: `Tel door tot ${bedrag(naar)}. Dat is ${bedrag(naar - van)} erbij.`,
      kort: `Tel door tot ${bedrag(naar)}.`,
    },
  ];
}

/** Hoe je afrondt, voor één prijs. */
function rondAf(prijs: number): Geldstap {
  return {
    som: `${bedrag(prijs)} ≈ ${bedrag(afgerond(prijs))}`,
    zin: `${bedrag(prijs)} ligt het dichtst bij ${bedrag(afgerond(prijs))}.`,
    kort: "Rond af.",
  };
}

const n = (som: Somgegevens, i: number) => som.getallen[i] ?? 0;

/**
 * De stappen bij een som, voor "Laat het me zien" én voor de uitleg-animatie.
 *
 * Eén plek, zodat de stappen in de animatie en in de lijst nooit uit elkaar
 * lopen. Er komt altijd minstens één stap uit.
 */
export function geldStappen(som: Somgegevens): Geldstap[] {
  const goed = som.goed;
  switch (som.soort) {
    case "geldwaarde": {
      const meest = som.extra?.meest === 1;
      const rij = [...som.getallen].sort((a, b) => b - a);
      return [
        {
          som: rij.map(bedrag).join(" > "),
          zin: "Kijk naar het getal en of het euro of cent is, niet naar hoe groot hij is.",
          kort: "Kijk naar het getal.",
        },
        {
          som: bedrag(goed),
          zin: `${meest ? "Het meest" : "Het minst"} waard is ${naamVan(goed)}.`,
          kort: meest ? "Dit is het meest." : "Dit is het minst.",
        },
      ];
    }

    case "geldvolgorde": {
      const rij = [...som.getallen].sort((a, b) => a - b);
      return [
        {
          som: rij.map(bedrag).join(" < "),
          zin: "Eerst de centen, dan de euromunten, dan de briefjes. Kijk steeds naar het getal.",
          kort: "Eerst centen, dan euro's.",
        },
      ];
    }

    case "geldtellen":
      return telStappen(som.getallen);

    case "geldleggen": {
      const doel = n(som, 0);
      return [
        {
          som: bedrag(doel),
          zin: `Je moet ${bedrag(doel)} leggen. Leg eerst grote munten.`,
          kort: "Leg eerst grote munten.",
        },
        {
          som: `samen ${bedrag(doel)}`,
          zin: "Tel steeds wat er ligt. Is het precies goed? Dan stop je.",
          kort: "Tel wat er ligt.",
        },
      ];
    }

    case "muntenofeuros": {
      const munt = n(som, 0);
      const aantal = n(som, 1);
      return [
        { som: `${aantal} munten`, zin: `Tel de munten: het zijn er ${aantal}.`, kort: "Tel de munten." },
        {
          som: `${aantal} × ${munt / 100} euro = ${(aantal * munt) / 100} euro`,
          zin: `Elke munt is ${naamVan(munt)} waard. Samen is dat ${(aantal * munt) / 100} euro.`,
          kort: `Elke munt is ${naamVan(munt)}.`,
        },
      ];
    }

    case "geldgroepen": {
      const stand = som.extra?.stand ?? 0;
      const totalen = som.getallen;
      if (stand === 3) {
        /* Geld wisselen: kaartjes zonder letter, dus het eerste, tweede en derde. */
        const wissel = som.extra?.wissel ?? goed;
        const rang = ["eerste", "tweede", "derde", "vierde"];
        return [
          { som: bedrag(wissel), zin: `Je wisselt ${naamVan(wissel)}. Dat is ${bedrag(wissel)}.`, kort: `Dat is ${bedrag(wissel)}.` },
          ...totalen.map((t, i) => ({
            som: bedrag(t),
            zin: `Tel het ${rang[i]} kaartje, vanaf het grootste: ${bedrag(t)}.`,
            kort: "Tel elk kaartje.",
          })),
          { som: bedrag(goed), zin: `Het kaartje van precies ${bedrag(goed)} is evenveel waard.`, kort: "Welk kaartje is evenveel?" },
        ];
      }
      const lijst: Geldstap[] = totalen.map((t, i) => ({
        som: `${String.fromCharCode(65 + i)}: ${bedrag(t)}`,
        zin: `Tel vakje ${String.fromCharCode(65 + i)}: dat is ${bedrag(t)}.`,
        kort: `Tel vakje ${String.fromCharCode(65 + i)}.`,
      }));
      if (stand === 1) {
        const prijs = som.extra?.prijs ?? goed;
        return [
          ...lijst,
          { som: bedrag(prijs), zin: `Welk vakje is precies ${bedrag(prijs)}?`, kort: "Welk vakje past precies?" },
        ];
      }
      if (stand === 2) {
        const prijs = som.extra?.prijs ?? 0;
        const betaald = som.extra?.betaald ?? 0;
        return [
          ...doortellen(prijs, betaald),
          ...lijst,
          { som: bedrag(goed), zin: `Je krijgt ${bedrag(goed)} terug.`, kort: `Je krijgt ${bedrag(goed)} terug.` },
        ];
      }
      return [
        ...lijst,
        { som: bedrag(goed), zin: `Het grootste bedrag is ${bedrag(goed)}.`, kort: "Dit is het meest." },
      ];
    }

    case "geldnotatie": {
      const euro = Math.floor(goed / 100);
      const cent = goed % 100;
      if (cent === 0) {
        return [
          { som: `${euro} euro`, zin: `Het zijn ${euro} hele euro's.`, kort: "Hele euro's." },
          { som: bedrag(goed), zin: `Hele euro's schrijf je met een komma en een streepje: ${bedrag(goed)}.`, kort: "Komma, streepje." },
        ];
      }
      return [
        { som: `${euro} euro`, zin: `Schrijf eerst de hele euro's: ${euro}.`, kort: "Eerst de euro's." },
        { som: ",", zin: "Dan een komma.", kort: "Dan een komma." },
        {
          som: bedrag(goed),
          zin:
            cent < 10
              ? `Dan de centen, altijd met twee cijfers: ${cent} cent schrijf je als 0${cent}. Samen ${bedrag(goed)}.`
              : `Dan de centen: ${cent}. Samen ${bedrag(goed)}.`,
          kort: "Dan de centen.",
        },
      ];
    }

    case "welkegroepjes":
      return [
        ...som.getallen.map((t, i) => ({
          som: `${String.fromCharCode(65 + i)}: ${bedrag(t)}`,
          zin: `Tel groepje ${String.fromCharCode(65 + i)}: dat is ${bedrag(t)}.`,
          kort: `Tel groepje ${String.fromCharCode(65 + i)}.`,
        })),
        {
          som: bedrag(goed),
          zin: `Twee groepjes zijn precies ${bedrag(goed)}.`,
          kort: "Twee passen precies.",
        },
      ];

    case "evenveel": {
      const [aantal, van, naar] = [n(som, 0), n(som, 1), n(som, 2)];
      const samen = aantal * van;
      return [
        {
          som: `${aantal} × ${naamVan(van)} = ${naamVan(samen)}`,
          zin: `Reken eerst uit hoeveel ${aantal} × ${naamVan(van)} is: ${naamVan(samen)}.`,
          kort: "Hoeveel is het samen?",
        },
        {
          som: `${naamVan(samen)} = ${goed} × ${naamVan(naar)}`,
          zin: `Hoe vaak past ${naamVan(naar)} in ${naamVan(samen)}? ${goed} keer.`,
          kort: "Hoe vaak past die erin?",
        },
      ];
    }

    case "geldontbreekt": {
      const prijs = n(som, 0);
      const ligt = n(som, 1);
      return [
        { som: bedrag(ligt), zin: `Tel wat er al ligt: ${bedrag(ligt)}.`, kort: "Tel wat er ligt." },
        ...doortellen(ligt, prijs),
      ];
    }

    case "geldsom": {
      const links = n(som, 0);
      const rechts = n(som, 1);
      const min = som.extra?.teken === -1;
      return [
        { som: bedrag(links), zin: `Links ligt ${bedrag(links)}.`, kort: `Links: ${bedrag(links)}.` },
        {
          som: `${bedrag(links)} ${min ? "−" : "+"} ${bedrag(rechts)} = ${bedrag(goed)}`,
          zin: min
            ? `Haal er ${bedrag(rechts)} af. Dan blijft er ${bedrag(goed)} over.`
            : `Tel er ${bedrag(rechts)} bij. Samen is dat ${bedrag(goed)}.`,
          kort: min ? "Haal het eraf." : "Tel het erbij.",
        },
      ];
    }

    case "geldverhaal": {
      const stand = som.extra?.stand ?? 0;
      const betaald = n(som, 0);
      const tweede = n(som, 1);
      if (stand === 2) {
        return [
          {
            som: `${bedrag(betaald)} − ${bedrag(tweede)} = ${bedrag(goed)}`,
            zin: `Je betaalde ${bedrag(betaald)} en kreeg ${bedrag(tweede)} terug. Haal dat eraf: zoveel kostte het.`,
            kort: "Haal het wisselgeld eraf.",
          },
        ];
      }
      return [
        ...doortellen(tweede, betaald),
        {
          som: `${bedrag(betaald)} − ${bedrag(tweede)} = ${bedrag(goed)}`,
          zin: stand === 1 ? `Er blijft ${bedrag(goed)} over.` : `Je krijgt ${bedrag(goed)} terug.`,
          kort: stand === 1 ? "Dat blijft over." : "Dat krijg je terug.",
        },
      ];
    }

    case "kunjebetalen": {
      const budget = n(som, 0);
      return [
        {
          som: bedrag(budget),
          zin: `Je hebt ${bedrag(budget)}. Reken bij elke zin uit wat het samen kost.`,
          kort: "Reken uit wat het kost.",
        },
        {
          som: `≤ ${bedrag(budget)}`,
          zin: `Is het ${bedrag(budget)} of minder? Dan kun je het betalen.`,
          kort: "Is het genoeg?",
        },
      ];
    }

    case "bonnetje": {
      const kwijt = (som.extra?.kwijt ?? 0) - 1;
      const prijzen = som.getallen;
      if (kwijt < 0) {
        return [
          {
            som: `${plus(prijzen)} = ${bedrag(goed)}`,
            zin: "Tel de prijzen op. Eerst de hele euro's, dan de centen.",
            kort: "Tel de prijzen op.",
          },
        ];
      }
      const andere = prijzen.filter((_, i) => i !== kwijt);
      const totaal = som.extra?.totaal ?? 0;
      return [
        { som: `${plus(andere)} = ${bedrag(totaal - goed)}`, zin: "Tel de prijzen op die je wel kunt lezen.", kort: "Tel de andere prijzen." },
        {
          som: `${bedrag(totaal)} − ${bedrag(totaal - goed)} = ${bedrag(goed)}`,
          zin: "Haal dat van het totaal af. Wat overblijft, is de prijs die kwijt is.",
          kort: "Haal het van het totaal.",
        },
      ];
    }

    case "geldafronden": {
      const prijs = n(som, 0);
      return [
        {
          som: bedrag(prijs),
          zin: "Kijk naar de centen. Ligt het dichter bij een hele of bij een halve euro?",
          kort: "Kijk naar de centen.",
        },
        rondAf(prijs),
      ];
    }

    case "geldschatten": {
      const [p1, p2, beurs] = [n(som, 0), n(som, 1), n(som, 2)];
      if (som.variant === "over") {
        return [
          rondAf(p1),
          {
            som: `${bedrag(beurs)} − ${bedrag(afgerond(p1))} = ${bedrag(goed)}`,
            zin: `Haal het afgeronde bedrag van je ${bedrag(beurs)} af.`,
            kort: "Haal het eraf.",
          },
        ];
      }
      return [
        rondAf(p1),
        rondAf(p2),
        {
          som: `${bedrag(afgerond(p1))} + ${bedrag(afgerond(p2))} = ${bedrag(afgerond(p1) + afgerond(p2))}`,
          zin: "Tel de afgeronde bedragen op. Dat is ongeveer wat het samen kost.",
          kort: "Tel ze op.",
        },
      ];
    }

    case "geldkorting": {
      const [was, korting] = [n(som, 0), n(som, 1)];
      if (som.variant === "korting") {
        return [
          ...doortellen(was - korting, was),
          { som: bedrag(korting), zin: `Het verschil is de korting: ${bedrag(korting)}.`, kort: "Dat is de korting." },
        ];
      }
      return [
        {
          som: `${bedrag(was)} − ${bedrag(korting)} = ${bedrag(was - korting)}`,
          zin: `Haal de korting van de prijs af. Je betaalt ${bedrag(was - korting)}.`,
          kort: "Haal de korting eraf.",
        },
      ];
    }
  }
  return [{ som: bedrag(goed), zin: `Het antwoord is ${bedrag(goed)}.`, kort: "Zo is het goed." }];
}

/** De zin met het goede antwoord, voor na het nakijken. */
function controleVan(som: Somgegevens): string {
  const goed = som.goed;
  switch (som.soort) {
    case "geldwaarde":
      return `${som.extra?.meest === 1 ? "Het meest" : "Het minst"} waard is ${naamVan(goed)}.`;
    case "geldvolgorde":
      return `Van weinig naar veel: ${[...som.getallen].sort((a, b) => a - b).map(naamVan).join(", ")}.`;
    case "muntenofeuros":
      return `Het zijn ${n(som, 1)} munten, samen ${goed} euro.`;
    case "evenveel":
      return `Het zijn er ${goed}: ${n(som, 0)} × ${naamVan(n(som, 1))} is evenveel als ${goed} × ${naamVan(n(som, 2))}.`;
    case "welkegroepjes":
      return `De twee groepjes van precies ${bedrag(goed)} kloppen.`;
    case "kunjebetalen":
      return `Bij ${goed} van de zinnen kun je het betalen met ${bedrag(n(som, 0))}.`;
    case "geldgroepen":
      if (som.extra?.stand === 1) return `Het goede vakje is precies ${bedrag(goed)}.`;
      if (som.extra?.stand === 2) return `Je krijgt ${bedrag(goed)} terug.`;
      if (som.extra?.stand === 3) return `Het goede kaartje is samen ook ${bedrag(goed)}.`;
      return `Het grootste bedrag is ${bedrag(goed)}.`;
    case "geldafronden":
      return `${bedrag(n(som, 0))} wordt afgerond ${bedrag(goed)}.`;
    case "geldschatten":
      return `Ongeveer ${bedrag(goed)}.`;
    default:
      return `Het goede antwoord is ${bedrag(goed)}.`;
  }
}

/** Eén aanpak voor heel Geld; de stappen hangen af van de soort. */
export const geldAanpak: Aanpak = {
  zin: (som) => {
    const stappen = geldStappen(som);
    return {
      "34": stappen[0].kort,
      "56": stappen.map((s) => s.zin).slice(0, 2).join(" "),
      "78": stappen.map((s) => s.zin).join(" "),
    };
  },
  stappen: (som): Uitlegstap[] => geldStappen(som).map((s) => ({ tekst: s.zin, som: s.som })),
  controle: controleVan,
};
