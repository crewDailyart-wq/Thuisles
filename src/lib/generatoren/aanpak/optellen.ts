/** "Zo los je het op" bij optellen. */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function volgendTiental(n: number): number {
  return Math.ceil((n + 1) / 10) * 10;
}

/** Bij twee getallen: eerst het tiental vol maken, dan de rest erbij. */
function viaHetTiental(som: Somgegevens) {
  const [a, b] = som.getallen;
  const naar = volgendTiental(a) - a;
  return { a, b, naar, rest: b - naar, tiental: a + naar };
}

export const optellenAanpak: Aanpak = {
  zin: (som) => {
    if (som.getallen.length !== 2) {
      return {
        "34": `Tel de getallen één voor één bij elkaar op: ${som.getallen.join(" + ")}.`,
        "56": `Tel er eerst twee op, en doe daarna het derde getal erbij: ${som.getallen.join(" + ")}.`,
        "78": `Bij drie getallen mag je zelf de handigste volgorde kiezen. Zoek twee getallen die samen een rond getal maken, en tel het derde daar dan bij op.`,
      };
    }

    const { a, b, naar, rest, tiental } = viaHetTiental(som);
    if (rest <= 0) {
      return {
        "34": `${a} en dan nog ${b} erbij is ${som.goed}.`,
        "56": `Tel vanaf ${a} nog ${b} door: dat is ${som.goed}.`,
        "78": `Deze som blijft binnen hetzelfde tiental, dus je kunt gewoon doortellen vanaf ${a}.`,
      };
    }

    return {
      "34": `Maak eerst ${tiental} vol (dat is +${naar}), dan nog +${rest} = ${som.goed}.`,
      "56": `${a} + ${b}: maak eerst ${tiental} (dat is +${naar}), dan nog +${rest} = ${som.goed}.`,
      "78": `${a} + ${b}: split ${b} in ${naar} en ${rest}. Eerst naar het ronde tiental ${tiental}, en dan de rest erbij. Zo hoef je nooit over een tiental heen te rekenen.`,
    };
  },

  stappen: (som) => {
    if (som.getallen.length !== 2) {
      let tot = som.getallen[0];
      const stappen = [{ tekst: "Begin bij het eerste getal.", som: String(tot) }];
      for (const n of som.getallen.slice(1)) {
        stappen.push({ tekst: `Tel er ${n} bij.`, som: `${tot} + ${n} = ${tot + n}` });
        tot += n;
      }
      return stappen;
    }

    const { a, b, naar, rest, tiental } = viaHetTiental(som);
    if (rest <= 0) {
      return [
        { tekst: "Begin bij het eerste getal.", som: String(a) },
        { tekst: `Tel er ${b} bij.`, som: `${a} + ${b} = ${som.goed}` },
      ];
    }

    return [
      { tekst: "Begin bij het eerste getal.", som: String(a) },
      { tekst: `Split ${b} in ${naar} en ${rest}.`, som: `${b} = ${naar} + ${rest}` },
      { tekst: "Maak eerst het tiental vol.", som: `${a} + ${naar} = ${tiental}` },
      { tekst: "Tel daarna de rest erbij.", som: `${tiental} + ${rest} = ${som.goed}` },
    ];
  },

  controle: (som) =>
    `Het goede antwoord is ${som.goed}, want ${som.getallen.join(" + ")} = ${som.goed}.`,
};
