/**
 * "Zo los je het op" bij de opdrachten van het domein Optellen.
 *
 * Eén per opdrachtsoort, want de weg naar het antwoord verschilt: bij een kale
 * som tel je door, bij de balans kijk je eerst wat de andere kant samen is, en
 * bij "welke is niet 18" reken je ze alle vier uit.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` en `getallen[1]`
 * zijn de twee getallen waar het om gaat en `goed` is wat gevraagd wordt.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** Het grootste en het kleinste van de twee, want doortellen gaat van groot af. */
function sorteer(som: Somgegevens): { groot: number; klein: number; totaal: number } {
  const [a, b] = som.getallen;
  return { groot: Math.max(a, b), klein: Math.min(a, b), totaal: a + b };
}

/** De gewone plussom: doortellen vanaf het grootste getal. */
function optellenAanpak(watStaatEr: string): Aanpak {
  return {
    zin: (som) => {
      const { groot, klein, totaal } = sorteer(som);
      return {
        "34": `Begin bij ${groot} en tel er ${klein} bij.`,
        "56": `Begin bij het grootste getal, ${groot}, en tel er ${klein} bij: dat is ${totaal}.`,
        "78": `Tel op vanaf het grootste getal: ${groot} + ${klein} = ${totaal}. Bij een som over de tien heen kun je eerst aanvullen tot 10 en daarna de rest erbij doen.`,
      };
    },
    stappen: (som) => {
      const { groot, klein, totaal } = sorteer(som);
      return [
        { tekst: watStaatEr, som: `${som.getallen[0]} + ${som.getallen[1]}` },
        { tekst: "Begin bij het grootste getal.", som: String(groot) },
        { tekst: "Tel de rest erbij.", som: `${groot} + ${klein}` },
        { tekst: "Samen:", som: String(totaal) },
      ];
    },
    controle: (som) => {
      const [a, b] = som.getallen;
      return `Het goede antwoord is ${som.goed}, want ${a} + ${b} = ${a + b}.`;
    },
  };
}

export const plaatjessomAanpak: Aanpak = optellenAanpak("Tel eerst elk groepje.");
export const plussomAanpak: Aanpak = optellenAanpak("Dit is de som.");

export const somkeuzeAanpak: Aanpak = {
  zin: (som) => {
    const doel = som.getallen[0];
    return {
      "34": `Reken ze alle vier uit. Welke is niet ${doel}?`,
      "56": `Reken elke som uit en vergelijk met ${doel}. Eentje komt daar niet op uit.`,
      "78": `Werk de vier sommen af en zet ze naast het doelgetal ${doel}. De som die er niet op uitkomt is het antwoord; die zit er meestal maar één of twee naast.`,
    };
  },
  stappen: (som) => [
    { tekst: "Reken ze één voor één uit.", som: "+" },
    { tekst: "Vergelijk met het getal in de vraag.", som: String(som.getallen[0]) },
    { tekst: "Welke hoort er niet bij?", som: "?" },
  ],
  controle: (som) => `Kaartje ${Number(som.goed) + 1} hoort er niet bij.`,
};

export const aanvultabelAanpak: Aanpak = {
  zin: (som) => {
    const [doel, eerste] = som.getallen;
    return {
      "34": `Elk getal moet samen ${doel} worden.`,
      "56": `Onder elk getal komt wat er nog bij moet om aan ${doel} te komen: bij ${eerste} is dat ${doel - eerste}.`,
      "78": `Je vult elke kolom aan tot ${doel}. De getallen bovenin lopen met één op, dus de antwoorden lopen met één af — dat is meteen je controle.`,
    };
  },
  stappen: (som) => {
    const [doel, eerste] = som.getallen;
    return [
      { tekst: "Alles moet samen dit worden.", som: String(doel) },
      { tekst: "Kijk naar het eerste getal.", som: String(eerste) },
      { tekst: "Wat moet er nog bij?", som: `${doel} − ${eerste} = ${doel - eerste}` },
      { tekst: "De rest loopt met één af.", som: "…" },
    ];
  },
  controle: (som) => {
    const [doel, eerste] = som.getallen;
    return `Onder ${eerste} hoort ${doel - eerste}, want samen is dat ${doel}.`;
  },
};

export const evenveelsomAanpak: Aanpak = {
  zin: (som) => {
    const { totaal } = sorteer(som);
    return {
      "34": `De som bovenaan is ${totaal}. Zoek dezelfde uitkomst.`,
      "56": `Reken eerst de som bovenaan uit: die is ${totaal}. Zoek daarna het kaartje dat ook ${totaal} is.`,
      "78": `Bepaal eerst de uitkomst bovenaan (${totaal}) en reken dan de kaartjes uit tot je dezelfde uitkomst vindt. Dezelfde som mag niet: het gaat om een andere splitsing van hetzelfde getal.`,
    };
  },
  stappen: (som) => {
    const { totaal } = sorteer(som);
    return [
      { tekst: "Reken de som bovenaan uit.", som: `${som.getallen[0]} + ${som.getallen[1]} = ${totaal}` },
      { tekst: "Reken de kaartjes uit.", som: "+" },
      { tekst: "Zoek dezelfde uitkomst.", som: String(totaal) },
    ];
  },
  controle: (som) => `Het kaartje met dezelfde uitkomst is nummer ${Number(som.goed) + 1}.`,
};

export const koppelsommenAanpak: Aanpak = {
  zin: (som) => {
    const { groot, klein, totaal } = sorteer(som);
    return {
      "34": `Reken een som uit en zoek dat getal.`,
      "56": `Reken elke som uit en sleep het getal dat erbij hoort ernaartoe: ${groot} + ${klein} is ${totaal}.`,
      "78": `Werk de sommen van boven naar beneden af en zoek per som de uitkomst. Weet je er een niet, sla hem dan over: aan het eind blijft het goede getal vanzelf over.`,
    };
  },
  stappen: (som) => {
    const { totaal } = sorteer(som);
    return [
      { tekst: "Reken de eerste som uit.", som: `${som.getallen[0]} + ${som.getallen[1]} = ${totaal}` },
      { tekst: "Zoek dat getal rechts.", som: String(totaal) },
      { tekst: "Sleep het naar de som.", som: "→" },
    ];
  },
  controle: (som) => {
    const { totaal } = sorteer(som);
    return `Bij de eerste som hoort ${totaal}.`;
  },
};

export const viatienAanpak: Aanpak = {
  zin: (som) => {
    const [a, b] = som.getallen;
    const naar10 = 10 - a;
    const rest = b - naar10;
    return {
      "34": `Maak eerst tien vol. Daarna de rest erbij.`,
      "56": `Vul eerst aan tot 10: ${a} + ${naar10} is 10. Dan blijft er nog ${rest} over: 10 + ${rest} = ${a + b}.`,
      "78": `Splits het tweede getal in ${naar10} en ${rest}. Eerst aanvullen tot 10, dan de rest erbij: 10 + ${rest} = ${a + b}. Zo hoef je nooit over de tien heen te tellen.`,
    };
  },
  stappen: (som) => {
    const [a, b] = som.getallen;
    const naar10 = 10 - a;
    const rest = b - naar10;
    return [
      { tekst: "Hoeveel mist er tot tien?", som: `${a} + ${naar10} = 10` },
      { tekst: "Zoveel blijft er over.", som: `${b} − ${naar10} = ${rest}` },
      { tekst: "Die doe je bij de tien.", som: `10 + ${rest} = ${a + b}` },
    ];
  },
  controle: (som) => {
    const [a, b] = som.getallen;
    return `Via tien: ${a} + ${10 - a} = 10, en 10 + ${b - (10 - a)} = ${a + b}.`;
  },
};

export const tweegetallenAanpak: Aanpak = {
  zin: (som) => {
    const doel = som.getallen[0];
    return {
      "34": `Zoek twee kaartjes die samen ${doel} zijn.`,
      "56": `Pak een kaartje en kijk hoeveel er nog bij moet om aan ${doel} te komen. Ligt dat getal er? Dan heb je het paar.`,
      "78": `Werk systematisch: neem het grootste kaartje, reken uit wat er nog bij moet voor ${doel}, en kijk of dat getal erbij ligt. Zo niet, ga naar het volgende kaartje.`,
    };
  },
  stappen: (som) => {
    const doel = som.getallen[0];
    return [
      { tekst: "Pak een kaartje.", som: "?" },
      { tekst: "Wat moet er nog bij?", som: `${doel} − ?` },
      { tekst: "Ligt dat getal erbij?", som: "→" },
    ];
  },
  controle: (som) => `Samen ${som.getallen[0]}: dat lukt met ${String(som.goed).replace(",", " en ")}.`,
};

export const balansAanpak: Aanpak = {
  zin: (som) => {
    const [bekend, kant] = som.getallen;
    return {
      "34": `Reken eerst die kant uit. Dan zie je wat er mist.`,
      "56": `De ene kant is samen ${kant}. Aan de andere kant staat al ${bekend}, dus er moet ${kant - bekend} bij.`,
      "78": `Bereken eerst de volle kant (${kant}). Beide kanten moeten evenveel zijn, dus het lege vakje is ${kant} − ${bekend} = ${kant - bekend}.`,
    };
  },
  stappen: (som) => {
    const [bekend, kant] = som.getallen;
    return [
      { tekst: "Reken de volle kant uit.", som: String(kant) },
      { tekst: "Aan de andere kant staat al:", som: String(bekend) },
      { tekst: "Dus in het lege vakje:", som: `${kant} − ${bekend} = ${kant - bekend}` },
    ];
  },
  controle: (som) => {
    const [bekend, kant] = som.getallen;
    return `In het lege vakje hoort ${som.goed}, want ${bekend} + ${som.goed} is ook ${kant}.`;
  },
};
