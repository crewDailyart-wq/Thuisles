/**
 * "Zo los je het op" bij het domein Tijd.
 *
 * Eén per familie opdrachten, want de weg naar het antwoord verschilt: bij de
 * wijzerklok kijk je eerst naar de kleine wijzer, bij de digitale klok naar wat
 * er vóór de dubbele punt staat, bij "hoe lang duurt het" spring je van uur
 * naar uur, en bij de kalender tel je de vakjes.
 *
 * Dit is wat een kind te zien krijgt als er geen denkfout herkend wordt — en bij
 * de keuze-opdrachten is dat altijd, want uit "knop 3" valt niets af te leiden.
 * Deze teksten zijn dus de hoofduitleg van het domein, geen bijvangst.
 *
 * De somgegevens zijn overal gelijk opgebouwd: `getallen[0]` en `getallen[1]`
 * zijn het uur en de minuut waar de opgave over gaat, `goed` is het antwoord
 * als getal, en in `extra` staat wat er verder nodig is.
 */

import type { Aanpak, Somgegevens } from "@/lib/generatoren/foutpatroon";
import { inWoorden, type Tijd } from "@/lib/tijd";

/** De tijd waar de opgave over gaat. */
function tijdVan(som: Somgegevens): Tijd {
  return { uur: som.getallen[0] ?? 0, minuut: som.getallen[1] ?? 0 };
}

/** Het antwoord in uren en minuten, bij de opdrachten met twee vakjes. */
function duur(som: Somgegevens): { uren: number; minuten: number } {
  return { uren: som.extra?.antwoordUur ?? som.goed, minuten: som.extra?.antwoordMinuut ?? 0 };
}

/** Hoe je een duur opschrijft: "2 uur en 30 minuten", of alleen de uren. */
function duurInWoorden(d: { uren: number; minuten: number }): string {
  if (d.minuten === 0) return `${d.uren} uur`;
  if (d.uren === 0) return `${d.minuten} minuten`;
  return `${d.uren} uur en ${d.minuten} minuten`;
}

// ---------------------------------------------------------------------------
// De wijzerklok
// ---------------------------------------------------------------------------

export const wijzerklokAanpak: Aanpak = {
  zin: (som) => {
    const t = tijdVan(som);
    return {
      "34": "Kijk eerst naar de kleine wijzer. Die zegt het uur.",
      "56": `Kijk eerst naar de kleine wijzer: die wijst het uur aan. Daarna de grote wijzer voor de minuten. Hier is het ${inWoorden(t)}.`,
      "78": `De kleine wijzer geeft het uur, de grote de minuten. Let op dat de kleine wijzer meeschuift: staat hij tussen twee cijfers in, dan is het uur nog niet om. Hier is het ${inWoorden(t)}.`,
    };
  },
  stappen: (som) => {
    const t = tijdVan(som);
    return [
      { tekst: "Kijk naar de kleine wijzer.", som: "het uur" },
      { tekst: "En dan naar de grote.", som: "de minuten" },
      { tekst: "Samen is dat:", som: inWoorden(t) },
    ];
  },
  controle: (som) => `Het is ${inWoorden(tijdVan(som))}.`,
};

export const klokzettenAanpak: Aanpak = {
  zin: (som) => {
    const t = tijdVan(som);
    const doel = { uur: som.extra?.antwoordUur ?? t.uur, minuut: som.extra?.antwoordMinuut ?? 0 };
    return {
      "34": "Zet eerst de grote wijzer. Dan de kleine.",
      "56": `Zet eerst de grote wijzer op de minuten, dan de kleine op het uur. Het moet ${inWoorden(doel)} worden.`,
      "78": `Zet de grote wijzer op de minuten en de kleine op het uur. De kleine wijzer schuift vanzelf mee: bij een half uur staat hij tussen twee cijfers in. Het moet ${inWoorden(doel)} worden.`,
    };
  },
  stappen: (som) => {
    const doel = {
      uur: som.extra?.antwoordUur ?? som.getallen[0] ?? 0,
      minuut: som.extra?.antwoordMinuut ?? 0,
    };
    return [
      { tekst: "Zo laat moet het worden.", som: inWoorden(doel) },
      { tekst: "Zet de grote wijzer op de minuten.", som: `${doel.minuut} minuten` },
      { tekst: "En de kleine op het uur.", som: `${((doel.uur + 11) % 12) + 1} uur` },
    ];
  },
  controle: (som) => {
    const doel = {
      uur: som.extra?.antwoordUur ?? som.getallen[0] ?? 0,
      minuut: som.extra?.antwoordMinuut ?? 0,
    };
    return `De klok hoort op ${inWoorden(doel)} te staan.`;
  },
};

export const wijzeraanwijzenAanpak: Aanpak = {
  zin: () => ({
    "34": "De kleine wijzer is kort. De grote is lang.",
    "56": "De wijzer van de uren is de korte en dikke; die van de minuten is de lange en dunne.",
    "78": "De korte, dikke wijzer geeft het uur; de lange, dunne geeft de minuten. De lange gaat het snelst rond: in een uur helemaal.",
  }),
  stappen: () => [
    { tekst: "De korte wijzer is van de uren.", som: "kort" },
    { tekst: "De lange is van de minuten.", som: "lang" },
  ],
  controle: (som) =>
    som.extra?.uurwijzer === 1
      ? "Gevraagd was de wijzer van de uren: de korte."
      : "Gevraagd was de wijzer van de minuten: de lange.",
};

// ---------------------------------------------------------------------------
// De digitale klok
// ---------------------------------------------------------------------------

export const digitaalAanpak: Aanpak = {
  zin: (som) => {
    const t = tijdVan(som);
    return {
      "34": "Voor de punt staan de uren. Erachter de minuten.",
      "56": `Vóór de dubbele punt staan de uren, erachter de minuten. ${t.minuut === 30 ? "Dertig minuten over een uur noem je een half uur." : ""}`.trim(),
      "78": `Vóór de dubbele punt staan de uren, erachter de minuten. Bij dertig minuten zeg je "half", en dan noem je het uur dat eraan komt: 05:30 is half zes.`,
    };
  },
  stappen: (som) => {
    const t = tijdVan(som);
    return [
      { tekst: "Voor de punt: de uren.", som: String(t.uur).padStart(2, "0") },
      { tekst: "Erachter: de minuten.", som: String(t.minuut).padStart(2, "0") },
      { tekst: "Samen is dat:", som: inWoorden(t) },
    ];
  },
  controle: (som) => `Het is ${inWoorden(tijdVan(som))}.`,
};

export const dagdeelAanpak: Aanpak = {
  zin: (som) => {
    const t = tijdVan(som);
    return {
      "34": "Kijk naar het uur. Is het al over twaalf?",
      "56": `Een dag heeft vier delen: nacht tot zes uur, ochtend tot twaalf, middag tot zes, en daarna avond. ${t.uur} uur valt dus in het ${som.extra?.dagdeelNaam === 1 ? "eerste" : "juiste"} deel.`,
      "78": "Nacht loopt tot zes uur, ochtend tot twaalf, middag tot zes en avond tot middernacht. Bij een digitale tijd van boven de twaalf haal je er twaalf af om te horen hoe je hem zegt.",
    };
  },
  stappen: (som) => {
    const t = tijdVan(som);
    return [
      { tekst: "Kijk naar het uur.", som: String(t.uur) },
      { tekst: "Nacht, ochtend, middag of avond?", som: "0 · 6 · 12 · 18" },
      { tekst: "Dit hoort erbij:", som: inWoorden(t) },
    ];
  },
  controle: (som) => `Het is ${inWoorden(tijdVan(som))}.`,
};

// ---------------------------------------------------------------------------
// Hoe lang duurt het?
// ---------------------------------------------------------------------------

export const duurAanpak: Aanpak = {
  zin: (som) => {
    const d = duur(som);
    return {
      "34": "Spring van uur naar uur. Tel mee.",
      "56": `Begin bij de vroegste tijd en spring naar het volgende hele uur. Tel daarna de hele uren, en als laatste de losse minuten. Samen is dat ${duurInWoorden(d)}.`,
      "78": `Reken in twee stappen: eerst naar het eerstvolgende hele uur, dan de hele uren, en tot slot de minuten die overblijven. Hier komt dat uit op ${duurInWoorden(d)}.`,
    };
  },
  stappen: (som) => {
    const d = duur(som);
    const t = tijdVan(som);
    return [
      { tekst: "Begin bij de vroegste tijd.", som: `${t.uur}:${String(t.minuut).padStart(2, "0")}` },
      { tekst: "Tel de hele uren.", som: `${d.uren} uur` },
      { tekst: "En de minuten erbij.", som: `${d.minuten} minuten` },
      { tekst: "Samen is dat:", som: duurInWoorden(d) },
    ];
  },
  controle: (som) => `Het antwoord is ${duurInWoorden(duur(som))}.`,
};

// ---------------------------------------------------------------------------
// Uren en minuten
// ---------------------------------------------------------------------------

export const urenminutenAanpak: Aanpak = {
  zin: (som) => ({
    "34": "Een uur is zestig minuten.",
    "56": `Een uur is zestig minuten. Een half uur is dus dertig, en een kwartier vijftien. Hier is het antwoord ${som.goed}.`,
    "78": `Reken alles terug naar minuten: een uur is 60, een half uur 30, een kwartier 15. Daarna is het gewoon rekenen; hier komt er ${som.goed} uit.`,
  }),
  stappen: (som) => [
    { tekst: "Een uur is zestig minuten.", som: "1 uur = 60 min" },
    { tekst: "Een half uur is de helft.", som: "30 min" },
    { tekst: "Het antwoord is:", som: String(som.goed) },
  ],
  controle: (som) => `Het goede antwoord is ${som.goed}.`,
};

// ---------------------------------------------------------------------------
// Dagen en maanden
// ---------------------------------------------------------------------------

export const dagenAanpak: Aanpak = {
  zin: () => ({
    "34": "Zeg de dagen op. Begin bij maandag.",
    "56": "Zeg de dagen op vanaf maandag: maandag, dinsdag, woensdag, donderdag, vrijdag, zaterdag, zondag. Na zondag begint de week opnieuw.",
    "78": "De week loopt van maandag tot en met zondag. Moet je verder tellen dan zondag, dan ga je gewoon door bij maandag — de week is rond.",
  }),
  stappen: () => [
    { tekst: "Zeg de week op.", som: "ma di wo do vr za zo" },
    { tekst: "Tel verder vanaf de dag in de vraag.", som: "→" },
    { tekst: "Na zondag komt weer maandag.", som: "zo → ma" },
  ],
  controle: (som) =>
    som.extra?.antwoordNummer !== undefined
      ? `De goede dag is de ${som.extra.antwoordNummer}e dag van de week.`
      : "Zeg de week op vanaf maandag; dan kom je er vanzelf uit.",
};

export const maandenAanpak: Aanpak = {
  zin: () => ({
    "34": "Zeg de maanden op. Begin bij januari.",
    "56": "Zeg de maanden op vanaf januari: januari, februari, maart, april, mei, juni, juli, augustus, september, oktober, november, december.",
    "78": "Het jaar heeft twaalf maanden, van januari tot en met december. Moet je over de jaargrens heen, dan komt na december weer januari — het jaar is rond, net als de jaarcirkel.",
  }),
  stappen: () => [
    { tekst: "Zeg het jaar op.", som: "jan feb mrt apr mei jun" },
    { tekst: "En verder.", som: "jul aug sep okt nov dec" },
    { tekst: "Na december komt januari.", som: "dec → jan" },
  ],
  controle: (som) =>
    som.extra?.antwoordNummer !== undefined
      ? `Het gaat om de ${som.extra.antwoordNummer}e maand van het jaar.`
      : "Zeg de maanden op vanaf januari; dan kom je er vanzelf uit.",
};

// ---------------------------------------------------------------------------
// De kalender
// ---------------------------------------------------------------------------

export const kalenderAanpak: Aanpak = {
  zin: () => ({
    "34": "Zoek de datum. Kijk in welke kolom hij staat.",
    "56": "Zoek de datum in de kalender en kijk boven welke kolom hij staat: dat is de weekdag. Verder tellen doe je per vakje naar rechts; aan het eind van de rij ga je naar de volgende regel.",
    "78": "Zoek de datum op en lees de weekdag boven de kolom af. Tellen gaat per vakje naar rechts, en aan het eind van een rij verder op de volgende regel. Elke rij is precies een week, dus een week later staat recht eronder.",
  }),
  stappen: () => [
    { tekst: "Zoek de datum op.", som: "📅" },
    { tekst: "Kijk boven welke kolom hij staat.", som: "ma di wo do vr za zo" },
    { tekst: "Tel per vakje verder.", som: "→" },
  ],
  controle: (som) =>
    som.extra?.antwoordDag !== undefined
      ? `Het gaat om de ${som.extra.antwoordDag}e van de maand.`
      : "Zoek de datum op in de kalender en lees de weekdag erboven af.",
};

export const kalendertellenAanpak: Aanpak = {
  zin: (som) => ({
    "34": "Tel de vakjes. Vandaag telt niet mee.",
    "56": `Tel de vakjes in de kalender, vanaf de dag ná vandaag. Vandaag telt niet mee: dat nachtje is al voorbij. Hier zijn het er ${som.goed}.`,
    "78": `Tel vanaf de dag ná vandaag tot en met de dag zelf; dat is het aantal nachtjes. Vandaag telt niet mee. Hier komt dat uit op ${som.goed}.`,
  }),
  stappen: (som) => [
    { tekst: "Begin bij de dag erna.", som: "morgen = 1" },
    { tekst: "Tel de vakjes door.", som: "→" },
    { tekst: "Zoveel zijn het er:", som: String(som.goed) },
  ],
  controle: (som) => `Het goede antwoord is ${som.goed}.`,
};

export const kalenderzoekAanpak: Aanpak = {
  zin: () => ({
    "34": "Zoek de goede kolom. Tel de rijen.",
    "56": "Zoek eerst de kolom van de weekdag die gevraagd wordt, en tel dan van boven naar beneden hoeveel keer die dag voorkomt.",
    "78": "Zoek de kolom van de gevraagde weekdag en loop hem van boven naar beneden af. Elke rij is een week, dus de tweede maandag staat precies één rij onder de eerste.",
  }),
  stappen: () => [
    { tekst: "Zoek de kolom van die dag.", som: "ma di wo do vr za zo" },
    { tekst: "Tel de rijen van boven af.", som: "1 · 2 · 3 …" },
    { tekst: "Tik die dag aan.", som: "👆" },
  ],
  controle: (som) =>
    som.extra?.antwoordDag !== undefined
      ? `Het gaat om de ${som.extra.antwoordDag}e van de maand.`
      : "Zoek de kolom van die weekdag en tel de rijen van boven af.",
};
