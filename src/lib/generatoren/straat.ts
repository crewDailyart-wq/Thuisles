/**
 * Vos' straat: welk nummer heeft het buurhuis?
 *
 * Een rij vrolijke huisjes. Op de deur van het huis waar Vos voor staat, staat
 * het nummer; de buren hebben een leeg bordje. Het kind zegt welk nummer bij
 * het buurhuis hoort.
 *
 * ---------------------------------------------------------------------------
 * Waarom huisjes en geen getallenlijn
 * ---------------------------------------------------------------------------
 * Een getallenlijn moet een kind eerst leren lézen. Een huisnummer niet: elk
 * kind weet dat het huis naast nummer 12 er eentje verder is. De rij huizen ís
 * de getallenlijn, maar dan eentje die het al kent.
 *
 * ---------------------------------------------------------------------------
 * Even en oneven
 * ---------------------------------------------------------------------------
 * In Nederland staan even nummers aan de ene kant van de straat en oneven aan
 * de andere. In die stand staan de huisjes daarom in twee rijen en is het
 * buurhuis aan dezelfde kant er twee verder: na 12 komt 14. Dat is een
 * wezenlijk andere sprong dan gewoon doortellen, en dus een eigen stand.
 *
 * ---------------------------------------------------------------------------
 * Alles binnen het bereik
 * ---------------------------------------------------------------------------
 * De hele straat past binnen het ingestelde bereik, en de keuzes ook. Een
 * antwoord dat buiten het bereik valt, is voor een kind geen echte keuze: het
 * kent dat getal nog niet, dus het hoeft er niet eens naar te kijken.
 */

import {
  getal,
  heelGetal,
  husselen,
  kansGenerator,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import type { AntwoordOptie } from "@/lib/vraagtypes";
import { straatPatronen } from "@/lib/generatoren/patronen/straat";
import { straatAanpak } from "@/lib/generatoren/aanpak/straat";
import { straatUitleg } from "@/lib/generatoren/scripts/straat";

/**
 * De standaardzinnen van dit type.
 *
 * Kort gehouden: deze kinderen lezen nog nauwelijks. Wat er gevraagd wordt,
 * zien ze aan de straat — het lege bordje naast Vos.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Welk nummer hoort hier?",
  "56": "Welk huisnummer hoort bij het lege bordje?",
  "78": "Welk huisnummer hoort bij het buurhuis?",
};

const MIN_GETAL = 1;
const MAX_GETAL = 100;

/** Hoeveel huisjes er in de straat staan. Vijf past ruim, ook op een telefoon. */
const HUIZEN = 5;
/** Bij even en oneven: drie aan elke kant van de straat. */
const HUIZEN_TWEEZIJDIG = 6;

export function grenzen(inst: Instellingen) {
  const van = Math.max(MIN_GETAL, Math.min(MAX_GETAL, getal(inst, "van", 1)));
  const tot = Math.max(van, Math.min(MAX_GETAL, getal(inst, "tot", 20)));
  return {
    van,
    tot,
    richting: tekst(inst, "richting", "beide"),
    vraagvorm: tekst(inst, "vraagvorm", "meerkeuze"),
    straatsoort: tekst(inst, "straatsoort", "gewoon"),
  };
}

/**
 * De straat opbouwen rond het huis van Vos.
 *
 * Bij een gewone straat staan de nummers gewoon op een rij. Bij even en oneven
 * staat de ene helft boven en de andere onder, met de straat ertussen — en dan
 * loopt elke kant met twee tegelijk op.
 */
export function bouwStraat(
  eerste: number,
  aantal: number,
  even: boolean,
): { nummer: number; kant: "boven" | "onder" }[] {
  if (!even) {
    return Array.from({ length: aantal }, (_, i) => ({
      nummer: eerste + i,
      kant: "boven" as const,
    }));
  }

  const perKant = Math.round(aantal / 2);
  const boven = Array.from({ length: perKant }, (_, i) => ({
    nummer: eerste + i * 2,
    kant: "boven" as const,
  }));
  const onder = Array.from({ length: aantal - perKant }, (_, i) => ({
    nummer: eerste + 1 + i * 2,
    kant: "onder" as const,
  }));
  return [...boven, ...onder];
}

/**
 * De vier keuzes: het buurhuis en drie echte denkfouten.
 *
 * In volgorde van herkenbaarheid:
 *
 *   het nummer van Vos zelf     bij 12 → 12
 *   de verkeerde kant op        bij 12, één verder → 11
 *   een huis overgeslagen       bij 12, één verder → 14
 *   het huis aan de overkant    alleen bij even en oneven
 *
 * Wat buiten het ingestelde bereik valt, doet niet mee; er wordt dan aangevuld
 * met buurgetallen die er wél in passen. Alle vier de keuzes blijven zo
 * getallen die het kind kent.
 */
export function keuzes(
  goed: number,
  basis: number,
  stap: number,
  vooruit: boolean,
  even: boolean,
  van: number,
  tot: number,
  kans: () => number,
): { opties: AntwoordOptie[]; antwoord: string } {
  const kant = vooruit ? 1 : -1;

  const denkfouten = [
    basis,
    basis - kant * stap,
    basis + kant * stap * 2,
    ...(even ? [basis + kant] : []),
  ];

  const buren: number[] = [];
  for (let d = 1; d <= 10; d++) buren.push(goed - d, goed + d);

  const fout: number[] = [];
  function pak(lijst: number[], binnenBereik: boolean) {
    for (const n of lijst) {
      if (fout.length === 3) return;
      if (n === goed || n < MIN_GETAL || n > MAX_GETAL || fout.includes(n)) continue;
      if (binnenBereik && (n < van || n > tot)) continue;
      fout.push(n);
    }
  }

  pak(denkfouten, true);
  pak(buren, true);
  /* Laatste redmiddel bij een heel smal bereik; zie `keuzes` in blokken.ts. */
  pak(buren, false);

  const alles = husselen(kans, [goed, ...fout]);
  return {
    opties: alles.map((n) => ({ tekst: String(n), afbeelding: null })),
    antwoord: String(alles.indexOf(goed)),
  };
}

export const straatGenerator: Generator = {
  id: "straat",
  naam: "Vos' straat (buurgetallen)",
  uitleg:
    "Een rij vrolijke huisjes met huisnummers. Vos staat voor één huis; het kind zegt welk nummer het buurhuis heeft. Oefent doortellen en terugtellen — en met even en oneven ook de sprong van twee aan dezelfde kant van de straat.",
  suggestie:
    "Groep 3: 1 tot 20, het huis erna · groep 4: 1 tot 20, door elkaar · groep 4 gevorderd: 10 tot 40, even en oneven",
  velden: [
    {
      soort: "keuze",
      sleutel: "straatsoort",
      label: "Wat voor straat",
      opties: [
        { waarde: "gewoon", label: "Gewone rij — 11, 12, 13" },
        { waarde: "evenoneven", label: "Even en oneven — 12, 14, 16" },
      ],
      hulp: "Een gewone rij oefent doortellen: het buurhuis is er één verder. Even en oneven oefent de sprong van twee: de huizen staan dan aan twee kanten van de straat, zoals in het echt, en het volgende huis aan dezelfde kant is er twee verder. Kies dat pas als doortellen vlot gaat.",
    },
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Welk buurhuis",
      opties: [
        { waarde: "erna", label: "Het huis erna — doortellen" },
        { waarde: "ervoor", label: "Het huis ervoor — terugtellen" },
        { waarde: "beide", label: "Door elkaar" },
      ],
      hulp: "Doortellen gaat bij de meeste kinderen vanzelf; terugtellen is een aparte vaardigheid en veel lastiger. Door elkaar dwingt het kind om eerst te kijken welke kant het op moet, en dat is precies wat het vaakst misgaat.",
    },
    {
      soort: "keuze",
      sleutel: "vraagvorm",
      label: "Hoe het kind antwoordt",
      opties: [
        { waarde: "meerkeuze", label: "Meerkeuze — vier knoppen met getallen" },
        { waarde: "open", label: "Open vraag — zelf het nummer invullen" },
      ],
      hulp: "Meerkeuze is makkelijker: het juiste nummer staat ertussen. Het kind tikt erop en ziet meteen of het goed is; er is geen knop Controleer. Open vraag is moeilijker: het kind moet het nummer zelf bedenken en intikken op het cijfertoetsenbord. Daar blijft de knop Controleer wel staan.",
    },
    {
      soort: "getal",
      sleutel: "van",
      label: "Kleinste huisnummer",
      min: MIN_GETAL,
      max: MAX_GETAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Grootste huisnummer",
      min: MIN_GETAL,
      max: MAX_GETAL,
      hulp: "De hele straat past binnen dit bereik, en de antwoordkeuzes ook. Neem het niet te smal: er moeten wel vijf huizen naast elkaar in passen.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: {
    van: 1,
    tot: 20,
    richting: "erna",
    vraagvorm: "meerkeuze",
    straatsoort: "gewoon",
  },
  foutpatronen: straatPatronen,
  aanpak: straatAanpak,
  uitleganimatie: straatUitleg,

  /*
    Per huis van Vos één vraag, en bij "door elkaar" twee: eentje naar links en
    eentje naar rechts. Meer zou dezelfde vraag nog een keer zijn.
  */
  maximum: (inst) => {
    const { van, tot, richting } = grenzen(inst);
    const ruimte = Math.max(0, tot - van + 1 - 1);
    return richting === "beide" ? ruimte * 2 : ruimte;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, richting, vraagvorm, straatsoort } = grenzen(inst);

    const even = straatsoort === "evenoneven";
    const stap = even ? 2 : 1;
    const open = vraagvorm === "open";
    const huizen = even ? HUIZEN_TWEEZIJDIG : HUIZEN;

    /*
      Hoeveel getallen de straat beslaat. Bij even en oneven staan er zes
      huizen die samen zes opeenvolgende nummers gebruiken; bij een gewone rij
      zijn dat er vijf.
    */
    const beslag = huizen;

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      /* De hele straat moet binnen het bereik passen. */
      const ruimte = tot - van + 1;
      if (ruimte < 2) break;
      const breed = Math.min(beslag, ruimte);
      const eerste = heelGetal(kans, van, tot - breed + 1);

      const straat = bouwStraat(eerste, breed, even);

      /* Vos staat bij een huis dat een buur heeft aan de gevraagde kant. */
      const vooruit =
        richting === "erna" ? true : richting === "ervoor" ? false : kans() < 0.5;

      const kandidaten = straat
        .map((huis, i) => ({ huis, i }))
        .filter(({ huis }) => {
          const doel = huis.nummer + (vooruit ? stap : -stap);
          return straat.some((h) => h.nummer === doel && h.kant === huis.kant);
        });
      if (kandidaten.length === 0) continue;

      const gekozen = kandidaten[Math.floor(kans() * kandidaten.length) % kandidaten.length];
      const basis = gekozen.huis.nummer;
      const doelNummer = basis + (vooruit ? stap : -stap);
      const doelIndex = straat.findIndex(
        (h) => h.nummer === doelNummer && h.kant === gekozen.huis.kant,
      );

      const handtekening = `straat:${even ? "eo" : "gw"}:${basis}:${vooruit ? "r" : "l"}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        In `extra` staat waar de foutpatronen en de uitleg op werken: het huis
        van Vos, hoe groot de stap is, welke kant het op gaat, en genoeg om de
        straat opnieuw op te bouwen.
      */
      const gegevens = {
        soort: "straat",
        variant: even ? "evenoneven" : "gewoon",
        getallen: [basis, doelNummer],
        goed: doelNummer,
        extra: {
          basis,
          stap,
          vooruit: vooruit ? 1 : 0,
          even: even ? 1 : 0,
          aantal: breed,
          eerste,
          vosIndex: gekozen.i,
        },
      };

      const vraagtekst = bepaalVraagtekst(straatGenerator, inst, groep, gegevens);
      const figuur = {
        soort: "huizenrij" as const,
        huizen: straat,
        vosBij: gekozen.i,
        gevraagd: doelIndex,
        /* De vos komt van de standaardvos; zie `haalStandaardvos`. */
        vos: { vangend: null, wachtend: null, blij: null },
      };

      const { opties, antwoord } = keuzes(
        doelNummer,
        basis,
        stap,
        vooruit,
        even,
        van,
        tot,
        kans,
      );

      /*
        De twee vormen staan hier met zoveel woorden uit elkaar geschreven, en
        niet als één regel met een keuze erin. Zo is in de code te zien wélke
        vraagvormen dit type kan opleveren — waar de bewaking in
        `scripts/oefentypes.mjs` naar kijkt.
      */
      uit.push(
        open
          ? {
              handtekening,
              vorm: "open",
              vraagtekst,
              antwoord: String(doelNummer),
              figuur,
              somgegevens: gegevens,
            }
          : {
              handtekening,
              vorm: "meerkeuze",
              vraagtekst,
              opties,
              antwoord,
              figuur,
              somgegevens: gegevens,
            },
      );
    }

    return uit;
  },
};
