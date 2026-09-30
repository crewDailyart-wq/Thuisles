/**
 * De uitleg-animaties bij de opdrachten van het domein Optellen.
 *
 * Alle drie de groepsvormen krijgen dezelfde weg langs dezelfde som, in hun
 * eigen tempo: groep 3-4 in korte zinnen van hooguit zes woorden, groep 5-6
 * met iets meer uitleg, groep 7-8 als lijstje dat je in één keer leest. Het
 * model is overal de som op één regel; de opgave zelf staat al in beeld.
 */

import type { Somgegevens } from "@/lib/generatoren/foutpatroon";
import { MANIER_VAN_VORM } from "@/lib/generatoren/uitlegscript";
import type { Groepsvorm, Uitlegbron, Uitlegscript } from "@/lib/generatoren/uitlegscript";

/** Eén stap: de som op een regel, met een zin van Vos erbij. */
function stap(tekst: string, zin: string, feest = false): Uitlegscript["stappen"][number] {
  return {
    model: { soort: "som", tekst },
    zin,
    houding: feest ? "juichend" : "wijzend",
    ...(feest ? { feest: true, beweging: "juichen" as const } : {}),
  };
}

/** Een uitlegbron met één strategie en één script voor alle groepen. */
function bron(
  strategie: { waarde: string; label: string; uitleg: string },
  regels: (som: Somgegevens, kort: boolean) => Uitlegscript["stappen"],
): Uitlegbron {
  return {
    modellen: ["som"],
    strategieen: [strategie],
    standaardStrategie: () => strategie.waarde,
    script(som, vorm: Groepsvorm) {
      const [a, b] = som.getallen;
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      return {
        vorm,
        strategie: strategie.waarde,
        strategieNaam: strategie.label,
        stappen: regels(som, MANIER_VAN_VORM[vorm] === "34"),
      };
    },
    /* Een som van dezelfde soort met één getal anders. */
    vergelijkbaar(som) {
      const [a, b] = som.getallen;
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      const nieuw = b > 2 ? b - 1 : b + 1;
      return { soort: som.soort, variant: som.variant, getallen: [a, nieuw], goed: a + nieuw };
    },
  };
}

/** Doortellen vanaf het grootste getal: de gewone weg bij een plussom. */
function doortellen(som: Somgegevens, kort: boolean): Uitlegscript["stappen"] {
  const [a, b] = som.getallen;
  const groot = Math.max(a, b);
  const klein = Math.min(a, b);
  return [
    stap(`${a} + ${b}`, kort ? "Dit is de som." : `De som is ${a} plus ${b}.`),
    stap(String(groot), kort ? "Begin bij het grootste." : `Begin bij ${groot}.`),
    stap(`${groot} + ${klein}`, kort ? "Tel de rest erbij." : `Tel er ${klein} bij.`),
    stap(`${a} + ${b} = ${a + b}`, kort ? "Samen is het dit!" : `Samen is dat ${a + b}.`, true),
  ];
}

export const plaatjessomUitleg: Uitlegbron = bron(
  {
    waarde: "tellen-en-optellen",
    label: "Tellen en optellen",
    uitleg: "Tel eerst elk groepje, tel daarna de twee getallen bij elkaar.",
  },
  (som, kort) => {
    const [a, b] = som.getallen;
    return [
      stap(String(a), kort ? "Tel het eerste groepje." : `Het eerste groepje is ${a}.`),
      stap(String(b), kort ? "Tel het tweede groepje." : `Het tweede groepje is ${b}.`),
      stap(`${a} + ${b} = ${a + b}`, kort ? "Samen is het dit!" : `Samen zijn het er ${a + b}.`, true),
    ];
  },
);

export const plussomUitleg: Uitlegbron = bron(
  {
    waarde: "doortellen",
    label: "Doortellen vanaf het grootste getal",
    uitleg: "Begin bij het grootste getal en tel het andere erbij.",
  },
  doortellen,
);

export const somkeuzeUitleg: Uitlegbron = bron(
  {
    waarde: "alles-uitrekenen",
    label: "Alle vier uitrekenen",
    uitleg: "Reken elke som uit en vergelijk ze met elkaar.",
  },
  (som, kort) => {
    const doel = som.getallen[0];
    return [
      stap(String(doel), kort ? "Hier gaat het om." : `Het gaat om ${doel}.`),
      stap("+ ?", kort ? "Reken ze alle vier uit." : "Reken elke som uit."),
      stap("≠", kort ? "Eentje past niet!" : "Eentje komt er niet op uit.", true),
    ];
  },
);

export const aanvultabelUitleg: Uitlegbron = bron(
  {
    waarde: "kolom-voor-kolom",
    label: "Kolom voor kolom aanvullen",
    uitleg: "Vul elk getal aan tot het doelgetal; de antwoorden lopen met één af.",
  },
  (som, kort) => {
    const [doel, eerste] = som.getallen;
    return [
      stap(String(doel), kort ? "Alles wordt samen dit." : `Alles moet samen ${doel} zijn.`),
      stap(String(eerste), kort ? "Kijk naar het eerste." : `Het eerste getal is ${eerste}.`),
      stap(`${doel} − ${eerste} = ${doel - eerste}`, kort ? "Zoveel moet erbij!" : `Er moet ${doel - eerste} bij.`, true),
    ];
  },
);

export const evenveelsomUitleg: Uitlegbron = bron(
  {
    waarde: "eerst-de-bovenste",
    label: "Eerst de som bovenaan",
    uitleg: "Reken de som bovenaan uit en zoek daarna dezelfde uitkomst.",
  },
  (som, kort) => {
    const [a, b] = som.getallen;
    return [
      stap(`${a} + ${b} = ${a + b}`, kort ? "Reken deze eerst uit." : `De som bovenaan is ${a + b}.`),
      stap("+ ?", kort ? "Reken de kaartjes uit." : "Reken nu de kaartjes uit."),
      stap(String(a + b), kort ? "Zoek dezelfde uitkomst!" : `Zoek er een die ook ${a + b} is.`, true),
    ];
  },
);

export const koppelsommenUitleg: Uitlegbron = bron(
  {
    waarde: "som-voor-som",
    label: "Som voor som",
    uitleg: "Reken een som uit en zoek het getal dat erbij hoort.",
  },
  (som, kort) => {
    const [a, b] = som.getallen;
    return [
      stap(`${a} + ${b}`, kort ? "Neem de eerste som." : "Begin bij de eerste som."),
      stap(String(a + b), kort ? "Dit komt eruit." : `Die is ${a + b}.`),
      stap("→", kort ? "Sleep het getal erheen!" : "Sleep dat getal ernaartoe.", true),
    ];
  },
);

export const viatienUitleg: Uitlegbron = bron(
  {
    waarde: "via-tien",
    label: "Via tien",
    uitleg: "Vul eerst aan tot tien en doe daarna de rest erbij.",
  },
  (som, kort) => {
    const [a, b] = som.getallen;
    const naar10 = 10 - a;
    const rest = b - naar10;
    return [
      stap(`${a} + ${naar10} = 10`, kort ? "Maak eerst tien vol." : `Vul ${a} aan tot 10.`),
      stap(`${b} − ${naar10} = ${rest}`, kort ? "Zoveel blijft er over." : `Er blijft ${rest} over.`),
      stap(`10 + ${rest} = ${a + b}`, kort ? "Die doe je erbij!" : `En 10 plus ${rest} is ${a + b}.`, true),
    ];
  },
);

export const tweegetallenUitleg: Uitlegbron = bron(
  {
    waarde: "paren-zoeken",
    label: "Zoek het paar",
    uitleg: "Kijk per kaartje hoeveel er nog bij moet, en of dat getal er ligt.",
  },
  (som, kort) => {
    const doel = som.getallen[0];
    return [
      stap(String(doel), kort ? "Dit moet eruit komen." : `Samen moet het ${doel} zijn.`),
      stap("? + ?", kort ? "Pak een kaartje." : "Pak een kaartje en kijk wat er mist."),
      stap(`= ${doel}`, kort ? "Ligt dat getal erbij?" : "Ligt dat andere getal erbij?", true),
    ];
  },
);

export const balansUitleg: Uitlegbron = bron(
  {
    waarde: "volle-kant-eerst",
    label: "Eerst de volle kant",
    uitleg: "Reken de kant uit waar alles staat; daarna zie je wat er mist.",
  },
  (som, kort) => {
    const [bekend, kant] = som.getallen;
    return [
      stap(String(kant), kort ? "Reken die kant uit." : `Die kant is samen ${kant}.`),
      stap(String(bekend), kort ? "Hier staat dit al." : `Hier staat al ${bekend}.`),
      stap(`${kant} − ${bekend} = ${kant - bekend}`, kort ? "Zoveel moet erbij!" : `Er moet ${kant - bekend} bij.`, true),
    ];
  },
);
