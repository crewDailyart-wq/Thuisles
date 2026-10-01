/**
 * "Zo los je het op" bij de opdrachten van het domein Erafsommen.
 *
 * Eén per opdrachtsoort, want de weg naar het antwoord verschilt: bij de
 * plaatjes streep je weg en tel je wat er staat, bij een kale som tel je
 * terug, en bij het koppelen reken je som voor som uit.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` is waar je mee
 * begint, `getallen[1]` is wat eraf gaat en `goed` is wat gevraagd wordt.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";

function delen(som: Somgegevens): { van: number; af: number; over: number } {
  const [van, af] = som.getallen;
  return { van, af, over: van - af };
}

export const wegstrepenAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, over } = delen(som);
    return {
      "34": `Streep er ${af} weg. Tel dan wat er nog staat.`,
      "56": `Streep er ${af} weg van de ${van}. Tel daarna wat er overblijft: dat zijn er ${over}.`,
      "78": `Streep er ${af} weg en tel wat er staat. Je kunt ook terugtellen vanaf ${van}; dan kom je ook op ${over} uit.`,
    };
  },
  stappen: (som) => {
    const { van, af, over } = delen(som);
    return [
      { tekst: "Zoveel staan er.", som: String(van) },
      { tekst: "Streep er zoveel weg.", som: String(af) },
      { tekst: "Tel wat er nog staat.", som: String(over) },
    ];
  },
  controle: (som) => {
    const { van, af, over } = delen(som);
    return `Er blijven er ${over} over, want ${van} − ${af} = ${over}.`;
  },
};

export const minsomplaatjeAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, over } = delen(som);
    return {
      "34": `Er waren er ${van}. Er gingen er ${af} weg.`,
      "56": `Eerst waren er ${van} en er gingen er ${af} weg. De som is dus ${van} − ${af} = ${over}.`,
      "78": `Schrijf op wat je zag: eerst ${van}, daarna gingen er ${af} weg. Dat wordt de som ${van} − ${af} = ${over}.`,
    };
  },
  stappen: (som) => {
    const { van, af, over } = delen(som);
    return [
      { tekst: "Zoveel waren er eerst.", som: String(van) },
      { tekst: "Zoveel gingen er weg.", som: String(af) },
      { tekst: "Samen is dat de som:", som: `${van} − ${af} = ${over}` },
    ];
  },
  controle: (som) => {
    const { van, af, over } = delen(som);
    return `De som is ${van} − ${af} = ${over}.`;
  },
};

export const plaatjesminsomAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, over } = delen(som);
    return {
      "34": `Tel het eerste groepje. Haal er ${af} af.`,
      "56": `In het eerste groepje staan er ${van}. Daar gaan er ${af} af, dus blijven er ${over} over.`,
      "78": `Tel eerst het grote groepje (${van}) en daarna het kleine (${af}). Het antwoord is het verschil: ${over}.`,
    };
  },
  stappen: (som) => {
    const { van, af, over } = delen(som);
    return [
      { tekst: "Tel het eerste groepje.", som: String(van) },
      { tekst: "Zoveel gaan eraf.", som: String(af) },
      { tekst: "Er blijven over:", som: String(over) },
    ];
  },
  controle: (som) => {
    const { van, af, over } = delen(som);
    return `Er blijven er ${over} over, want ${van} − ${af} = ${over}.`;
  },
};

export const minsomAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, over } = delen(som);
    return {
      "34": `Begin bij ${van} en tel ${af} terug.`,
      "56": `Begin bij ${van} en tel er ${af} vanaf: dat is ${over}.`,
      "78": `Tel terug vanaf ${van}. Gaat de som over de tien heen, vul dan eerst aan tot 10 en haal daarna de rest eraf.`,
    };
  },
  stappen: (som) => {
    const { van, af, over } = delen(som);
    return [
      { tekst: "Dit is de som.", som: `${van} − ${af}` },
      { tekst: "Begin bij het grootste getal.", som: String(van) },
      { tekst: "Tel zoveel terug.", som: String(af) },
      { tekst: "Er blijft over:", som: String(over) },
    ];
  },
  controle: (som) => {
    const { van, af, over } = delen(som);
    return `Het goede antwoord is ${over}, want ${van} − ${af} = ${over}.`;
  },
};

export const minkoppelenAanpak: Aanpak = {
  zin: (som) => {
    const { van, af, over } = delen(som);
    return {
      "34": "Reken een som uit en zoek dat getal.",
      "56": `Reken elke som uit en sleep het getal dat erbij hoort ernaartoe: ${van} − ${af} is ${over}.`,
      "78": "Werk de sommen van boven naar beneden af. Weet je er een niet, sla hem dan over: aan het eind blijft het goede getal vanzelf over.",
    };
  },
  stappen: (som) => {
    const { van, af, over } = delen(som);
    return [
      { tekst: "Reken de eerste som uit.", som: `${van} − ${af} = ${over}` },
      { tekst: "Zoek dat getal.", som: String(over) },
      { tekst: "Sleep het naar de som.", som: "→" },
    ];
  },
  controle: (som) => {
    const { van, af, over } = delen(som);
    return `Bij de eerste som hoort ${over}, want ${van} − ${af} = ${over}.`;
  },
};
