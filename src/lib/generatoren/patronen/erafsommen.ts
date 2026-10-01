/**
 * Foutpatronen bij de opdrachten van het domein Erafsommen.
 *
 * De vijf opdrachtsoorten vragen allemaal dezelfde denkstap — er gaat iets
 * vanaf — en de fouten die een kind daarbij maakt zijn ook dezelfde. Ze staan
 * hier één keer.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` is het getal waar
 * je van begint, `getallen[1]` is wat eraf gaat, en `goed` is wat er gevraagd
 * wordt. Bij een opdracht met meer dan één invulvakje staat in `extra` ook wat
 * het kind per vakje heeft ingevuld (`gegeven0`, `gegeven1`, …).
 */

import type { Foutpatroon } from "@/lib/generatoren/foutpatroon";

export const erafPatronen: Foutpatroon[] = [
  {
    id: "opgeteld",
    naam: "Opgeteld in plaats van afgetrokken",
    herkent: (som, gegeven) =>
      som.getallen.length >= 2 && gegeven === som.getallen[0] + som.getallen[1],
    kindtekst: {
      "34": "Ik denk dat je de getallen bij elkaar hebt gedaan.",
      "56": "Je hebt opgeteld. Bij een minsom gaat er juist iets af.",
      "78": "Je hebt de twee getallen opgeteld in plaats van afgetrokken. Bij eraf wordt het antwoord kleiner dan het getal waar je mee begon.",
    },
    hint: "Bij eraf wordt het samen minder.",
    uitleg: (som) => {
      const [van, af] = som.getallen;
      return [
        { tekst: "Er gaat iets af.", som: `${van} − ${af}` },
        { tekst: "Dan blijft er over:", som: String(van - af) },
      ];
    },
    ouder: {
      uitleg:
        "Er is opgeteld in plaats van afgetrokken. Het min-teken is waarschijnlijk niet gezien.",
      zinnen: [
        "Leg het met blokjes neer en haal er samen hardop zoveel weg.",
        "Vraag eerst: wordt het meer of minder? Daarna pas het antwoord.",
      ],
      schoolwoord: "aftrekken",
    },
  },
  {
    id: "omgedraaid",
    naam: "De getallen omgedraaid",
    herkent: (som, gegeven) => {
      const [van, af] = som.getallen;
      if (som.getallen.length < 2) return false;
      /* Twee vakjes ingevuld: staat het kleine getal vooraan? */
      const eerste = som.extra?.gegeven0;
      const tweede = som.extra?.gegeven1;
      if (eerste !== undefined && tweede !== undefined) {
        return eerste === af && tweede === van && van !== af;
      }
      /* Eén vakje: het getal dat eraf ging als uitkomst opgeschreven. */
      return gegeven === af && af !== som.goed;
    },
    kindtekst: {
      "34": "Je hebt de getallen omgedraaid. Begin bij het grootste.",
      "56": "De getallen staan omgedraaid. Bij een minsom begin je bij het grootste getal en haal je het kleinste eraf.",
      "78": "De twee getallen zijn verwisseld. Bij aftrekken mag dat niet: je begint altijd bij het getal waar je vanaf gaat tellen.",
    },
    hint: "Welk getal had je eerst? Dat staat vooraan.",
    uitleg: (som) => {
      const [van, af] = som.getallen;
      return [
        { tekst: "Zoveel had je eerst.", som: String(van) },
        { tekst: "Zoveel gaat eraf.", som: String(af) },
        { tekst: "Dus de som is:", som: `${van} − ${af} = ${van - af}` },
      ];
    },
    ouder: {
      uitleg:
        "De twee getallen zijn verwisseld; het kleinste getal stond vooraan in plaats van het getal waar je mee begint.",
      zinnen: [
        "Vraag: hoeveel had je eerst, en hoeveel gingen er weg?",
        "Schrijf samen eerst het grootste getal op, dan pas het min-teken.",
      ],
      schoolwoord: "aftrekken",
    },
  },
  {
    id: "eentje-ernaast",
    naam: "Eén te veel of te weinig",
    herkent: (som, gegeven) =>
      Number.isFinite(gegeven) && gegeven !== som.goed && Math.abs(gegeven - som.goed) === 1,
    kindtekst: {
      "34": "Je zit er eentje naast. Tel nog eens rustig.",
      "56": "Je zit er één naast. Dat gebeurt makkelijk bij terugtellen; tel het getal waar je begint niet mee.",
      "78": "Je antwoord zit er één naast. Waarschijnlijk is het startgetal meegeteld; begin met terugtellen bij het getal daarvóór.",
    },
    hint: "Tel vanaf het grootste getal terug, en tel dat zelf niet mee.",
    uitleg: (som) => {
      const [van, af] = som.getallen;
      return [
        { tekst: "Begin hier.", som: String(van) },
        { tekst: "Tel zoveel terug.", som: String(af) },
        { tekst: "Dan blijft er over:", som: String(van - af) },
      ];
    },
    ouder: {
      uitleg: "Het antwoord zit er één naast — meestal doordat het startgetal wordt meegeteld.",
      zinnen: [
        "Tel samen hardop terug: dertien… twaalf, elf, tien.",
        "Laat het nog eens met blokjes doen en schuif ze echt opzij.",
      ],
      schoolwoord: "terugtellen",
    },
  },
];
