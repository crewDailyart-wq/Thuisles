/**
 * "Zo los je het op" bij de vijf opdrachten van het domein Splitsen.
 *
 * Eén per opdrachtsoort, want de weg naar het antwoord verschilt: bij de tabel
 * doe je drie keer dezelfde stap, bij de driehoek moet je eerst uitrekenen wat
 * er binnenin ontbreekt voordat je de zijkanten kunt invullen.
 *
 * Overal geldt dezelfde opbouw van de somgegevens: `getallen[0]` is het hele
 * getal, `getallen[1]` het deel dat gegeven is, `goed` het gevraagde getal.
 */

import type { Aanpak } from "@/lib/generatoren/foutpatroon";

export const splitstabelAanpak: Aanpak = {
  zin: (som) => {
    const [geheel, deel] = som.getallen;
    return {
      "34": `Samen moet het ${geheel} zijn. Er staat al ${deel}.`,
      "56": `Elke rij moet samen ${geheel} zijn. Staat er ${deel}, dan hoort er ${som.goed} bij: ${deel} + ${som.goed} = ${geheel}.`,
      "78": `Elke rij is een splitsing van ${geheel}. Het rechtervakje is dus steeds ${geheel} min het getal dat er links staat: ${geheel} − ${deel} = ${som.goed}.`,
    };
  },
  stappen: (som) => {
    const [geheel, deel] = som.getallen;
    return [
      { tekst: "Bovenaan staat het hele getal.", som: String(geheel) },
      { tekst: "In deze rij staat al:", som: String(deel) },
      { tekst: "Er moet nog bij:", som: `${geheel} − ${deel} = ${som.goed}` },
      { tekst: "Controleer de rij:", som: `${deel} + ${som.goed} = ${geheel}` },
    ];
  },
  controle: (som) => {
    const [geheel, deel] = som.getallen;
    return `Het goede antwoord is ${som.goed}, want ${deel} + ${som.goed} = ${geheel}.`;
  },
};

export const aanvullenAanpak: Aanpak = {
  zin: (som) => {
    const [geheel, deel] = som.getallen;
    return {
      "34": `Je hebt ${deel}. Samen moet het ${geheel} zijn.`,
      "56": `Je hebt ${deel} en je wilt naar ${geheel}. Tel door: er komt ${som.goed} bij.`,
      "78": `Aanvullen tot ${geheel}: je telt vanaf ${deel} door tot ${geheel}, of je rekent ${geheel} − ${deel} = ${som.goed}.`,
    };
  },
  stappen: (som) => {
    const [geheel, deel] = som.getallen;
    return [
      { tekst: "Zoveel heb je al.", som: String(deel) },
      { tekst: "Zoveel moet het samen zijn.", som: String(geheel) },
      { tekst: "Tel door tot dat getal.", som: `${deel} → ${geheel}` },
      { tekst: "Er komt bij:", som: String(som.goed) },
    ];
  },
  controle: (som) => {
    const [geheel, deel] = som.getallen;
    return `Het goede antwoord is ${som.goed}, want ${deel} + ${som.goed} = ${geheel}.`;
  },
};

export const splitsschemaAanpak: Aanpak = {
  zin: (som) => {
    const [geheel, deel] = som.getallen;
    return {
      "34": `Bovenaan staat ${geheel}. Eronder samen ook ${geheel}.`,
      "56": `De twee vakjes onder ${geheel} zijn samen ${geheel}. Eén is ${deel}, dus de andere is ${geheel} − ${deel} = ${som.goed}.`,
      "78": `Een splitsing verdeelt ${geheel} over twee vakjes. Staat er ${deel}, dan blijft er ${geheel} − ${deel} = ${som.goed} over. Controleer met ${deel} + ${som.goed} = ${geheel}.`,
    };
  },
  stappen: (som) => {
    const [geheel, deel] = som.getallen;
    return [
      { tekst: "Bovenaan staat het hele getal.", som: String(geheel) },
      { tekst: "Eén vakje is al ingevuld.", som: String(deel) },
      { tekst: "Het andere haal je eraf.", som: `${geheel} − ${deel} = ${som.goed}` },
      { tekst: "Samen weer het hele getal.", som: `${deel} + ${som.goed} = ${geheel}` },
    ];
  },
  controle: (som) => {
    const [geheel, deel] = som.getallen;
    return `Het goede antwoord is ${som.goed}, want ${deel} + ${som.goed} = ${geheel}.`;
  },
};

export const verdelenAanpak: Aanpak = {
  zin: (som) => {
    const [aantal, links] = som.getallen;
    const rechts = som.goed;
    const verschil = links - rechts;
    const eis =
      verschil === 0 ? "allebei evenveel" : `links ${verschil} meer`;
    return {
      "34": `Verdeel ${aantal}. Links ${links}, rechts ${rechts}.`,
      "56": `Er zijn ${aantal} kralen en het moet ${eis} zijn. Dan gaan er ${links} naar links en ${rechts} naar rechts.`,
      "78": `Verdeel ${aantal} met de eis "${eis}". Deel eerst eerlijk (${aantal} : 2) en schuif daarna het verschil naar links: ${links} en ${rechts}, samen weer ${aantal}.`,
    };
  },
  stappen: (som) => {
    const [aantal, links] = som.getallen;
    return [
      { tekst: "Zoveel kralen heb je.", som: String(aantal) },
      { tekst: "Verdeel ze eerst eerlijk.", som: `${aantal} : 2` },
      { tekst: "Schuif het verschil naar links.", som: `${links} en ${som.goed}` },
      { tekst: "Samen weer alles:", som: `${links} + ${som.goed} = ${aantal}` },
    ];
  },
  controle: (som) => {
    const [aantal, links] = som.getallen;
    return `Het goede antwoord is ${links} links en ${som.goed} rechts, want samen is dat ${aantal}.`;
  },
};

export const splitsdriehoekAanpak: Aanpak = {
  zin: (som) => {
    const [geheel, deel] = som.getallen;
    return {
      "34": `Elk vakje buiten is twee vakken samen.`,
      "56": `Het vakje onder de driehoek is ${geheel}. Rechtsonder staat ${deel}, dus linksonder is ${geheel} − ${deel} = ${som.goed}.`,
      "78": `Elk vakje buiten de driehoek is de som van de twee vakken ernaast. Begin bij de zijde waar er twee van de drie bekend zijn: ${geheel} − ${deel} = ${som.goed}. Daarna kun je de andere zijden optellen.`,
    };
  },
  stappen: (som) => {
    const [geheel, deel] = som.getallen;
    return [
      { tekst: "Kijk waar er twee bekend zijn.", som: `${geheel} en ${deel}` },
      { tekst: "Het derde vak haal je eraf.", som: `${geheel} − ${deel} = ${som.goed}` },
      { tekst: "Tel daarna de zijkanten op.", som: `vak + vak` },
    ];
  },
  controle: (som) => {
    const [geheel, deel] = som.getallen;
    return `Het ontbrekende vak is ${som.goed}, want ${deel} + ${som.goed} = ${geheel}.`;
  },
};
