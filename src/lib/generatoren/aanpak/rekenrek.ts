/**
 * "Zo los je het op" bij de opdrachten met het rekenrek.
 *
 * Vier wegen, want de sommen vragen om iets anders. Bij het flitsen gaat het
 * om kijken met de vijfstructuur. Bij een som vanaf tien gaat er gewoon een
 * stukje af. Blijft de som binnen het tiental, dan reken je met de eenheden en
 * plak je het tiental er weer voor. En gaat de som over de tien, dan is de weg
 * altijd dezelfde: eerst naar de tien, dan de rest.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` is waar je mee
 * begint, `getallen[1]` is wat eraf gaat en `goed` is wat gevraagd wordt.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

/** De weg via de tien, in losse stukjes. */
export function viaDeTien(som: Somgegevens) {
  const [van, af] = som.getallen;
  const naarTien = van % 10;
  return { van, af, naarTien, rest: af - naarTien, over: van - af };
}

export const rekenrekflitsAanpak: Aanpak = {
  zin: (som) => {
    const aantal = som.getallen[0];
    const rijen = Math.min(10, aantal);
    return {
      "34": "Kijk naar de vijftallen. Tel niet één voor één.",
      "56": `Kijk met de groepjes van vijf: vijf rood, vijf wit. Zo zie je in één keer dat het er ${aantal} zijn.`,
      "78": `Tel met de structuur van het rek: de bovenste rij is vol bij tien, dus ${aantal} is ${rijen} boven en de rest eronder. Kraal voor kraal tellen kost tijd en gaat makkelijk mis.`,
    };
  },
  stappen: (som) => {
    const aantal = som.getallen[0];
    return [
      { tekst: "Kijk naar de rode kralen.", som: "5" },
      { tekst: "En naar de witte erbij.", som: "10" },
      { tekst: "Zoveel zag je:", som: String(aantal) },
    ];
  },
  controle: (som) => `${som.goed === 1 ? "Er stond 1 kraal" : `Er stonden ${som.goed} kralen`}.`,
};

export const vanafTienAanpak: Aanpak = {
  zin: (som) => {
    const [van, af] = som.getallen;
    return {
      "34": `Schuif er ${af} weg. Tel wat er blijft.`,
      "56": `Je begint met ${van} ${van === 1 ? "kraal" : "kralen"} en schuift er ${af} weg; er blijven er ${van - af} over.`,
      "78": `Tien min een getal onder tien hoef je niet te tellen: dat is een van de splitsingen van tien die je uit je hoofd kunt kennen.`,
    };
  },
  stappen: (som) => {
    const [van, af] = som.getallen;
    return [
      { tekst: "Zoveel kralen staan er.", som: String(van) },
      { tekst: "Schuif er zoveel weg.", som: String(af) },
      { tekst: "Er blijven over:", som: String(van - af) },
    ];
  },
  controle: (som) => {
    const [van, af] = som.getallen;
    return `Er blijven er ${van - af} over, want ${van} − ${af} = ${van - af}.`;
  },
};

export const kleineSomAanpak: Aanpak = {
  zin: (som) => {
    const [van, af] = som.getallen;
    const eenheden = van % 10;
    return {
      "34": `Kijk naar ${eenheden} − ${af}. Het tiental blijft staan.`,
      "56": `De onderste rij is genoeg: ${eenheden} − ${af} = ${eenheden - af}, en de tien blijft staan. Dus ${van} − ${af} = ${van - af}.`,
      "78": `Deze som blijft binnen het tiental. Reken met de eenheden (${eenheden} − ${af} = ${eenheden - af}) en zet het tiental er weer voor: ${van - af}.`,
    };
  },
  stappen: (som) => {
    const [van, af] = som.getallen;
    const eenheden = van % 10;
    return [
      { tekst: "Kijk alleen naar de losse kralen.", som: `${eenheden} − ${af} = ${eenheden - af}` },
      { tekst: "De tien blijft staan.", som: "10" },
      { tekst: "Samen:", som: `${van} − ${af} = ${van - af}` },
    ];
  },
  controle: (som) => {
    const [van, af] = som.getallen;
    const eenheden = van % 10;
    return `${eenheden} − ${af} = ${eenheden - af}, dus ${van} − ${af} = ${van - af}.`;
  },
};

export const viaTienAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, naarTien, rest, over } = viaDeTien(som);
    return {
      "34": `Ga eerst naar de 10. Dan nog ${rest} eraf.`,
      "56": `Haal er eerst ${naarTien} af; dan sta je op 10. Daarna nog ${rest} eraf: dat is ${over}.`,
      "78": `Splits het aftrekgetal: ${af} is ${naarTien} en ${rest}. Eerst naar de tien (${van} − ${naarTien} = 10) en dan de rest eraf (10 − ${rest} = ${over}). Zo hoef je nooit over de tien heen te tellen.`,
    };
  },
  stappen: (som) => {
    const { van, af, naarTien, rest, over } = viaDeTien(som);
    return [
      { tekst: "Hoeveel moet eraf tot 10?", som: `${van} − ${naarTien} = 10` },
      { tekst: "Zoveel blijft er nog over.", som: `${af} − ${naarTien} = ${rest}` },
      { tekst: "Die gaan er ook nog af.", som: `10 − ${rest} = ${over}` },
    ];
  },
  controle: (som) => {
    const { van, af, naarTien, rest, over } = viaDeTien(som);
    return `Via de tien: ${van} − ${naarTien} = 10, en 10 − ${rest} = ${over}. Dus ${van} − ${af} = ${over}.`;
  },
};
