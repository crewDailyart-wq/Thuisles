/**
 * De getaltegels (oktober 2026), een Godot-spel van het algemene soort (zie
 * `components/oefenen/GodotSpel.tsx`). Naar het idee van Synthesis "Add within
 * 10": tegels met stippen in een tienveld, elk getal een eigen kleur.
 *
 * Twee types, want de denkfouten en de uitleg verschillen:
 *
 *   tegelsom   twee tegels liggen in het veld; het kind typt hoeveel samen.
 *              Standen: tot10 (groep 3), dubbel (dubbel en bijna dubbel, zoals
 *              5 + 5 en 5 + 6), tien (10 en een getal, in allebei de
 *              volgordes) en over10 (samen meer dan 10).
 *   tegelmaak  één tegel ligt er; het kind kiest uit de bak de tegel die het
 *              veld precies vol maakt (aanvullen tot het doelgetal).
 *
 * Alle 15 opgaven met de tegels (ONTWERPREGELS.md: oefeningen met een bouwsteen).
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  bepaalVraagtekst,
  vraagtekstVelden,
  type Generator,
  type Gegenereerd,
  type Instellingen,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { plussomAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { plussomUitleg } from "@/lib/generatoren/scripts/optelopdrachten";
import { splitsopdrachtPatronen } from "@/lib/generatoren/patronen/splitsopdrachten";
import { aanvullenAanpak } from "@/lib/generatoren/aanpak/splitsopdrachten";
import { aanvullenUitleg } from "@/lib/generatoren/scripts/splitsopdrachten";
import { stuks } from "@/lib/maatje/taal";

export type TegelsomStand = "tot10" | "dubbel" | "tien" | "over10";
const SOMSTANDEN: TegelsomStand[] = ["tot10", "dubbel", "tien", "over10"];

const SOMZIN = "Hoeveel stippen zijn het samen?";
const SOMZINNEN: Record<Leeftijdsgroep, string> = { "34": SOMZIN, "56": SOMZIN, "78": SOMZIN };
const MAAKZIN = "Welke tegel maakt {som}?";
const MAAKZINNEN: Record<Leeftijdsgroep, string> = { "34": MAAKZIN, "56": MAAKZIN, "78": MAAKZIN };

function somStand(inst: Instellingen): TegelsomStand {
  const s = tekst(inst, "stand", "tot10") as TegelsomStand;
  return SOMSTANDEN.includes(s) ? s : "tot10";
}

/** Alle sommen die bij een stand horen, als [a, b]. */
function sommenVan(stand: TegelsomStand): [number, number][] {
  const uit: [number, number][] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      const ok =
        stand === "tot10" ? a + b <= 10 && a + b >= 3 :
        stand === "dubbel" ? Math.abs(a - b) <= 1 :
        stand === "tien" ? a === 10 || b === 10 :
        a + b > 10 && a < 10 && b < 10;
      if (ok) uit.push([a, b]);
    }
  }
  return uit;
}

export const tegelsomGenerator: Generator = {
  id: "tegelsom",
  naam: "De getaltegels: hoeveel samen?",
  uitleg:
    "Twee tegels met stippen liggen in een tienveld (of twee tienvelden). Elke tegel heeft een eigen kleur per getal. Het kind typt hoeveel stippen het samen zijn. Na Controleer tellen de stippen mee. Bij alle 15 opgaven.",
  suggestie: "Groep 3: tot en met 10, dubbel en bijna dubbel · groep 4: 10 en een getal, samen meer dan 10",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Soort som",
      opties: [
        { waarde: "tot10", label: "Samen tot en met 10" },
        { waarde: "dubbel", label: "Dubbel en bijna dubbel (5 + 5, 5 + 6)" },
        { waarde: "tien", label: "10 en nog een tegel (10 + 4, 4 + 10)" },
        { waarde: "over10", label: "Samen meer dan 10" },
      ],
    },
    ...vraagtekstVelden(SOMZINNEN),
  ],
  vraagteksten: { standaard: SOMZINNEN },
  standaard: { stand: "tot10" },
  foutpatronen: optelPatronen,
  aanpak: plussomAanpak,
  uitleganimatie: plussomUitleg,

  maximum: (inst) => sommenVan(somStand(inst)).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const stand = somStand(inst);
    const voorraad = sommenVan(stand);
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [a, b] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      const handtekening = `tegelsom:${a}+${b}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const c = a + b;
      const gegevens = { soort: "plussom", variant: "tegels", getallen: [a, b], goed: c };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(tegelsomGenerator, inst, groep, gegevens),
        antwoord: String(c),
        figuur: {
          soort: "godotspel",
          spel: "tegels",
          stand: stand === "dubbel" ? "dubbel" : "samen",
          invoer: "typen",
          kop: `${a} + ${b} = ?`,
          label: "Hoeveel stippen samen?",
          wacht: true,
          opgave: { a, b },
          goedZin: `${a} en ${b} is samen ${c}.`,
          foutZin: `Tel maar mee: ${a} en ${b} is samen ${c}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    /* Van makkelijk naar moeilijk: op de uitkomst. */
    uit.sort((x, y) => Number(x.antwoord) - Number(y.antwoord));
    uit.forEach((v, i) => ((v.figuur as { volgnummer: number }).volgnummer = i + 1));
    return uit;
  },
};

// ---------------------------------------------------------------------------

function maakGrenzen(inst: Instellingen) {
  const van = Math.max(3, Math.min(20, getal(inst, "van", 5)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 10)));
  return { van, tot };
}

/** Alle opgaven: doelgetal en de tegel die er al ligt (de ontbrekende tegel is hoogstens 9). */
function maakVoorraad(inst: Instellingen): [number, number][] {
  const { van, tot } = maakGrenzen(inst);
  const uit: [number, number][] = [];
  for (let doel = van; doel <= tot; doel++) {
    for (let gegeven = 1; gegeven <= Math.min(10, doel - 1); gegeven++) {
      if (doel - gegeven <= 9) uit.push([doel, gegeven]);
    }
  }
  return uit;
}

export const tegelmaakGenerator: Generator = {
  id: "tegelmaak",
  naam: "De getaltegels: welke tegel maakt het vol?",
  uitleg:
    "Eén tegel ligt in het veld, het doelgetal staat ernaast. Het kind kiest uit de bak (tegels van 1 tot en met 9) de tegel die het veld precies vol maakt. Een tegel die niet past, wiebelt terug. Bij alle 15 opgaven.",
  suggestie: "Groep 3: maak 5 tot en met 10 · groep 4: maak 11 tot en met 20",
  velden: [
    { soort: "getal", sleutel: "van", label: "Kleinste doelgetal", min: 3, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste doelgetal", min: 3, max: 20 },
    ...vraagtekstVelden(MAAKZINNEN),
  ],
  vraagteksten: { standaard: MAAKZINNEN, som: (s) => String(s.getallen[0]) },
  standaard: { van: 5, tot: 10 },
  foutpatronen: splitsopdrachtPatronen,
  aanpak: aanvullenAanpak,
  uitleganimatie: aanvullenUitleg,

  maximum: (inst) => maakVoorraad(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const voorraad = maakVoorraad(inst);
    const uit: Gegenereerd[] = [];

    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const [doel, gegeven] = voorraad[heelGetal(kans, 0, voorraad.length - 1)];
      const handtekening = `tegelmaak:${doel}:${gegeven}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const juist = doel - gegeven;
      const gegevens = { soort: "aanvullen", variant: "tegels", getallen: [doel, gegeven], goed: juist };
      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(tegelmaakGenerator, inst, groep, gegevens),
        antwoord: String(juist),
        figuur: {
          soort: "godotspel",
          spel: "tegels",
          stand: "maak",
          invoer: "kiezen",
          kop: `${gegeven} + ? = ${doel}`,
          label: `Kies de tegel die samen met ${gegeven} het getal ${doel} maakt.`,
          opgave: { a: gegeven, doel },
          goedZin: `${gegeven} en ${juist} maken samen ${doel}.`,
          foutZin: `Er moesten nog ${stuks(juist, "stip", "stippen")} bij: ${gegeven} en ${juist} is ${doel}.`,
          volgnummer: 0,
        },
        somgegevens: gegevens,
      });
    }
    /* Van makkelijk naar moeilijk: op doelgetal, en dan een kleine ontbrekende tegel eerst. */
    uit.sort((x, y) => x.somgegevens.getallen[0] - y.somgegevens.getallen[0] || Number(x.antwoord) - Number(y.antwoord));
    uit.forEach((v, i) => ((v.figuur as { volgnummer: number }).volgnummer = i + 1));
    return uit;
  },
};
