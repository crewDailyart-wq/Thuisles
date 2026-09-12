/** "Zo los je het op" bij aftrekken. */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function viaHetTiental(som: Somgegevens) {
  const [van, af] = som.getallen;
  const naar = van % 10;
  return { van, af, naar, rest: af - naar, tiental: van - naar };
}

export const aftrekkenAanpak: Aanpak = {
  zin: (som) => {
    if (som.getallen.length !== 2) {
      return {
        "34": `Haal de getallen één voor één eraf: ${som.getallen.join(" − ")}.`,
        "56": `Haal er eerst één getal af, en daarna het volgende: ${som.getallen.join(" − ")}.`,
        "78": `Bij twee aftrekkingen mag je ze ook eerst optellen en dat in één keer eraf halen.`,
      };
    }

    const { van, af, naar, rest, tiental } = viaHetTiental(som);
    if (rest <= 0 || naar === 0) {
      return {
        "34": `Tel vanaf ${van} terug: ${af} eraf is ${som.goed}.`,
        "56": `Tel vanaf ${van} in stappen terug: ${af} eraf geeft ${som.goed}.`,
        "78": `Deze som blijft binnen hetzelfde tiental, dus je kunt gewoon terugtellen vanaf ${van}.`,
      };
    }

    return {
      "34": `Ga eerst terug naar ${tiental} (dat is −${naar}), dan nog −${rest} = ${som.goed}.`,
      "56": `${van} − ${af}: ga eerst terug naar ${tiental} (dat is −${naar}), dan nog −${rest} = ${som.goed}.`,
      "78": `${van} − ${af}: split ${af} in ${naar} en ${rest}. Eerst terug naar het ronde tiental ${tiental}, en dan de rest eraf. Zo hoef je nooit over een tiental heen te rekenen.`,
    };
  },

  stappen: (som) => {
    if (som.getallen.length !== 2) {
      let tot = som.getallen[0];
      const stappen = [{ tekst: "Begin bij het grootste getal.", som: String(tot) }];
      for (const n of som.getallen.slice(1)) {
        stappen.push({ tekst: `Haal er ${n} af.`, som: `${tot} − ${n} = ${tot - n}` });
        tot -= n;
      }
      return stappen;
    }

    const { van, af, naar, rest, tiental } = viaHetTiental(som);
    if (rest <= 0 || naar === 0) {
      return [
        { tekst: "Begin bij het grootste getal.", som: String(van) },
        { tekst: `Haal er ${af} af.`, som: `${van} − ${af} = ${som.goed}` },
      ];
    }

    return [
      { tekst: "Begin bij het grootste getal.", som: String(van) },
      { tekst: `Split ${af} in ${naar} en ${rest}.`, som: `${af} = ${naar} + ${rest}` },
      { tekst: "Ga eerst terug naar het hele tiental.", som: `${van} − ${naar} = ${tiental}` },
      { tekst: "Haal daarna de rest eraf.", som: `${tiental} − ${rest} = ${som.goed}` },
    ];
  },

  controle: (som) => {
    const afgehaald = som.getallen.slice(1).reduce((a, b) => a + b, 0);
    return `Het goede antwoord is ${som.goed}, want ${som.goed} + ${afgehaald} = ${som.getallen[0]}.`;
  },
};
