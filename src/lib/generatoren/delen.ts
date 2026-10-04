/**
 * De opdrachten van het domein Delen.
 *
 * Drie types, en samen dekken ze de vijftien titels uit WERKPLAN.md:
 *
 *   deelsom        de kale deelsom: 8 : 2 = ▢. Eén type voor de tien titels
 *                  "Delen door 1" tot en met "Delen door 9" (dan staat er één
 *                  deler aangevinkt) én voor "Deelsommen tot en met 5" en
 *                  "tot en met 10" (dan staan er meer aan).
 *   deelkoppelen   vijf deelsommen met de uitkomsten ernaartoe te slepen.
 *   welkedeelsom   een uitkomst staat er; het kind typt zelf een deelsom die
 *                  klopt. Elke goede deelsom telt.
 *
 * De notatie is overal met een dubbele punt: 8 : 2, zoals op school.
 *
 * De basisversie was kaal rekenen. Sinds oktober 2026 doet het kind bij de
 * kale deelsom eerst zelf wat delen is: groepjes maken of eerlijk verdelen, en
 * pas daarna komt de som. Dat staat per sjabloon in de instelling "Werking";
 * met "Alleen typen" is het weer de kale som van vroeger, ook voor opgaven die
 * er al liggen.
 */

import {
  getal,
  tekst,
  husselen,
  kansGenerator,
  kiesUit,
  lijst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { heelGetalBovenaan } from "@/lib/generatoren/bovenaan";
import { deelPatronen } from "@/lib/generatoren/patronen/keerdelen";
import {
  deelkoppelenAanpak,
  deelsomAanpak,
  welkedeelsomAanpak,
} from "@/lib/generatoren/aanpak/keerdelen";
import {
  deelkoppelenUitleg,
  deelsomUitleg,
  welkedeelsomUitleg,
} from "@/lib/generatoren/scripts/keerdelen";
import { ALLE_DEELTHEMAS, bouwOpdracht, themaVoor } from "@/lib/deelthema";

/**
 * Waardoor er gedeeld kan worden: 1 tot en met 10.
 *
 * De deeltafels van groep 4 en 5. Hoger hoort bij een ander onderwerp; staat
 * het hier wel, dan kan een beheerder per ongeluk een oefening maken die niet
 * bij het domein past.
 */
const DELERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** De grootste uitkomst die je kunt instellen. */
const MAX_UITKOMST = 20;

function gekozenDelers(inst: Instellingen): number[] {
  const gekozen = lijst(inst, "delers", ["1", "2", "5", "10"])
    .map(Number)
    .filter((n) => DELERS.includes(n));
  return gekozen.length ? gekozen : [1, 2, 5, 10];
}

export function grenzen(inst: Instellingen) {
  const delers = gekozenDelers(inst);
  const tot = Math.max(1, Math.min(MAX_UITKOMST, getal(inst, "tot", 10)));
  return { delers, tot };
}

/** Alle deelsommen die bij deze instellingen bestaan, als [geheel, deler]. */
export function deelsommen(delers: number[], tot: number): [number, number][] {
  const uit: [number, number][] = [];
  for (const deler of delers) {
    for (let uitkomst = 1; uitkomst <= tot; uitkomst++) uit.push([deler * uitkomst, deler]);
  }
  return uit;
}

/** Het veld dat bij alle drie de types hetzelfde heet en hetzelfde doet. */
const DELERVELD = {
  soort: "vinkjes" as const,
  sleutel: "delers",
  label: "Waardoor delen",
  opties: DELERS.map((n) => ({ waarde: String(n), label: `Delen door ${n}` })),
  hulp: "Eén aanvinken geeft één deeltafel; meer aanvinken geeft ze door elkaar.",
};

const UITKOMSTVELD = {
  soort: "getal" as const,
  sleutel: "tot",
  label: "Grootste uitkomst",
  min: 1,
  max: MAX_UITKOMST,
  hulp:
    "De uitkomsten lopen van 1 tot en met dit getal. Bij één deeltafel bepaalt dit meteen hoeveel verschillende sommen er bestaan: met 15 zijn er vijftien.",
};

// ---------------------------------------------------------------------------
// De kale deelsom
// ---------------------------------------------------------------------------

const DEELZIN = "Hoeveel is {som}?";
const DEELZINNEN: Record<Leeftijdsgroep, string> = {
  "34": DEELZIN,
  "56": DEELZIN,
  "78": "Reken uit: {som}",
};

/** Hoe het kind de deelsom maakt; zie `Werking` hieronder. */
export type Deelwerking = "groepjes" | "verdelen" | "typen";

export function deelwerking(inst: Instellingen): Deelwerking {
  const w = tekst(inst, "werking", "groepjes");
  return w === "verdelen" || w === "typen" ? w : "groepjes";
}

/** Standaard vijf opgaven waarin het kind eerst zelf bouwt. */
const BOUW_STANDAARD = 5;

function bouwsommen(inst: Instellingen): number {
  return Math.max(0, Math.min(15, getal(inst, "visueel", BOUW_STANDAARD)));
}

const WERKINGVELD = {
  soort: "keuze" as const,
  sleutel: "werking",
  label: "Werking",
  opties: [
    { waarde: "groepjes", label: "Groepjes maken, daarna de som" },
    { waarde: "verdelen", label: "Eerlijk verdelen, daarna de som" },
    { waarde: "typen", label: "Alleen typen (de oude werking)" },
  ],
  hulp:
    "Bij groepjes maken of eerlijk verdelen tikt het kind eerst zelf, en verschijnt het antwoordvakje pas als alles in groepjes zit of verdeeld is. De andere opgaven zijn de kale som met een knop Hulp. Alleen typen geldt meteen, ook voor de opgaven die er al liggen.",
};

const BOUWVELD = {
  soort: "getal" as const,
  sleutel: "visueel",
  label: "Hoeveel opgaven beginnen met zelf bouwen",
  min: 0,
  max: 15,
  hulp: "De eerste opgaven van de oefening maakt het kind eerst zelf de groepjes of de verdeling. Daarna volgt de kale som met een knop Hulp. Telt niet bij Alleen typen.",
};

export const deelsomGenerator: Generator = {
  id: "deelsom",
  naam: "Delen (kale som)",
  uitleg:
    "De deelsom staat er kaal: 8 : 2 = ▢, met grote cijfers en een dubbele punt. Vink één deeltafel aan voor een oefening als \"Delen door 3\", of meer voor deelsommen door elkaar. Bij Werking kies je of het kind eerst zelf groepjes maakt of eerlijk verdeelt.",
  suggestie: "Groep 4: delen door 1, 2, 5 en 10 · groep 5: ook 3, 4, 6 · groep 6: alle tien",
  velden: [
    DELERVELD,
    UITKOMSTVELD,
    WERKINGVELD,
    BOUWVELD,
    ...vraagtekstVelden(DEELZINNEN, {
      voorbeeldzinnen: { "34": "Hoeveel is 8 : 2?", "56": "Hoeveel is 8 : 2?", "78": "Reken uit: 8 : 2" },
      extraHulp: "Op de plek van {som} komt de deelsom zelf te staan.",
    }),
  ],
  vraagteksten: {
    standaard: DEELZINNEN,
    som: (s) => `${s.getallen[0]} : ${s.getallen[1]}`,
  },
  standaard: { delers: ["1", "2", "5", "10"], tot: 10, werking: "groepjes", visueel: BOUW_STANDAARD },
  foutpatronen: deelPatronen,
  aanpak: deelsomAanpak,
  uitleganimatie: deelsomUitleg,

  maximum: (inst) => {
    const { delers, tot } = grenzen(inst);
    /* Dezelfde som kan bij twee delers horen (8 : 2 en 8 : 4 zijn er twee). */
    if (deelwerking(inst) === "typen") return delers.length * tot;
    /* Een opgave om zelf te bouwen is een andere opgave dan dezelfde kale som. */
    return delers.length * tot + Math.min(bouwsommen(inst), bouwkandidaten(delers, tot, deelwerking(inst)).length);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    if (deelwerking(inst) !== "typen") return maakMetBouwen(inst, aantal, alGebruikt, zaad, groep);

    const kans = kansGenerator(zaad);
    const { delers, tot } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    const maak = (geheel: number, deler: number): Gegenereerd | null => {
      const handtekening = `deelsom:${geheel}:${deler}`;
      if (alGebruikt.has(handtekening)) return null;
      alGebruikt.add(handtekening);

      const mee = geheel / deler;
      const gegevens = {
        soort: "deelsom",
        variant: "kaal",
        getallen: [geheel, deler],
        goed: mee,
        extra: { tafel: deler, mee, product: geheel },
      };
      return {
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(deelsomGenerator, inst, groep, gegevens),
        antwoord: String(mee),
        figuur: { soort: "deelsom", geheel, deler },
        somgegevens: gegevens,
      };
    };

    /*
      Eerst met de nadruk op de grootste uitkomsten (ONTWERPREGELS.md: de
      getallen liggen vooral in het bovenste deel van het bereik). Komt er zo
      niet genoeg uit — en bij één deeltafel is dat snel zo — dan wordt er
      daarna gewoon de hele voorraad langsgelopen, zodat er nooit minder sommen
      uitkomen dan er bestaan.
    */
    for (let poging = 0; poging < aantal * 300 && uit.length < aantal; poging++) {
      const deler = kiesUit(kans, delers);
      const uitkomst = heelGetalBovenaan(kans, 1, tot);
      const som = maak(deler * uitkomst, deler);
      if (som) uit.push(som);
    }
    for (const [geheel, deler] of husselen(kans, deelsommen(delers, tot))) {
      if (uit.length >= aantal) break;
      const som = maak(geheel, deler);
      if (som) uit.push(som);
    }

    return uit;
  },
};

/**
 * De sommen die geschikt zijn om zelf te bouwen: uitkomst 2 tot en met 6, en
 * bij verdelen minstens twee houders en hoogstens 40 voorwerpen (anders past
 * het niet meer op het scherm). Zo blijft het tikken te overzien; met meer dan
 * dertig voorwerpen helpt het scherm met één tik per groepje of met de knop
 * "Iedereen één".
 */
function bouwkandidaten(delers: number[], tot: number, werking: Deelwerking): [number, number][] {
  const verdelen = werking === "verdelen" && delers.some((d) => d >= 2);
  return deelsommen(delers, Math.min(tot, 6))
    .filter(([geheel, deler]) => geheel / deler >= 2 && (!verdelen || (deler >= 2 && geheel <= 40)))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/**
 * Delen om zelf te doen: eerst een paar opgaven waarin het kind bouwt, dan de
 * kale sommen met een knop Hulp. Alles in een vaste volgorde van makkelijk
 * naar moeilijk (`volgnummer`): bij het bouwen oplopend in aantal voorwerpen,
 * bij de kale sommen oplopend in het getal dat gedeeld wordt.
 */
function maakMetBouwen(
  inst: Instellingen,
  aantal: number,
  alGebruikt: Set<string>,
  zaad: number,
  groep: number,
): Gegenereerd[] {
  const kans = kansGenerator(zaad);
  const { delers, tot } = grenzen(inst);
  const werking = deelwerking(inst);
  const bouw: "groepjes" | "verdelen" = werking === "verdelen" ? "verdelen" : "groepjes";
  /* Altijd appels: in zakjes bij groepjes maken, in mandjes bij verdelen. */
  const thema = themaVoor(bouw);

  /* Eerst de bouwopgaven: gelijkmatig verspreid over wat geschikt is. */
  const kandidaten = bouwkandidaten(delers, tot, werking);
  const hoeveelBouw = Math.min(bouwsommen(inst), aantal, kandidaten.length);
  const bouwen: [number, number][] = [];
  for (let i = 0; i < hoeveelBouw; i++) {
    const plek =
      hoeveelBouw === 1 ? 0 : Math.round((i * (kandidaten.length - 1)) / (hoeveelBouw - 1));
    bouwen.push(kandidaten[plek]);
  }

  /* Dan de kale sommen: zoveel verschillende als er passen, met elke deler erin. */
  const rest = Math.max(0, aantal - hoeveelBouw);
  const voorraad = husselen(kans, deelsommen(delers, tot));
  const kaal: [number, number][] = [];
  for (const deler of husselen(kans, delers)) {
    const eerste = voorraad.find(([, d]) => d === deler);
    if (eerste && kaal.length < rest) kaal.push(eerste);
  }
  for (const som of voorraad) {
    if (kaal.length >= rest) break;
    if (!kaal.some(([g, d]) => g === som[0] && d === som[1])) kaal.push(som);
  }
  kaal.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const uit: Gegenereerd[] = [];
  const voegToe = (geheel: number, deler: number, stap: "bouwen" | "hulp") => {
    const handtekening = stap === "bouwen" ? `deelsom:bouw:${geheel}:${deler}` : `deelsom:${geheel}:${deler}`;
    if (alGebruikt.has(handtekening)) return;
    alGebruikt.add(handtekening);

    const mee = geheel / deler;
    const gegevens = {
      soort: "deelsom",
      variant: bouw,
      getallen: [geheel, deler],
      goed: mee,
      extra: {
        tafel: deler,
        mee,
        product: geheel,
        stap: stap === "bouwen" ? 1 : 2,
        thema: ALLE_DEELTHEMAS.indexOf(thema),
      },
    };
    const kaleVraag = bepaalVraagtekst(deelsomGenerator, inst, groep, gegevens);
    uit.push({
      handtekening,
      vorm: "open",
      vraagtekst: stap === "bouwen" ? bouwOpdracht(bouw, deler) : kaleVraag,
      antwoord: String(mee),
      figuur: {
        soort: "deelsom",
        geheel,
        deler,
        bouw,
        stap,
        thema,
        kaleVraag,
        volgnummer: uit.length + 1,
      },
      somgegevens: gegevens,
    });
  };

  bouwen.forEach(([geheel, deler]) => voegToe(geheel, deler, "bouwen"));
  kaal.forEach(([geheel, deler]) => voegToe(geheel, deler, "hulp"));
  return uit;
}


// ---------------------------------------------------------------------------
// Deelsommen koppelen
// ---------------------------------------------------------------------------

const KOPPELZIN = "Sleep de uitkomst naar de som.";
const KOPPELZINNEN: Record<Leeftijdsgroep, string> = {
  "34": KOPPELZIN,
  "56": KOPPELZIN,
  "78": KOPPELZIN,
};

export const deelkoppelenGenerator: Generator = {
  id: "deelkoppelen",
  naam: "Koppel de deelsom aan de uitkomst",
  uitleg:
    "Links een rijtje deelsommen, rechts de uitkomsten door elkaar. Het kind sleept elke uitkomst naar de goede som; tikken werkt ook. Hergebruikt het koppel-onderdeel van Optellen.",
  suggestie: "Groep 4: delen door 1, 2, 5 en 10 · groep 5: alle tien, vijf sommen",
  velden: [
    DELERVELD,
    UITKOMSTVELD,
    {
      soort: "getal",
      sleutel: "rijen",
      label: "Hoeveel sommen",
      min: 3,
      max: 6,
      hulp: "Alle uitkomsten zijn verschillend, dus er passen er nooit meer dan er uitkomsten in het bereik zitten.",
    },
    ...vraagtekstVelden(KOPPELZINNEN),
  ],
  vraagteksten: { standaard: KOPPELZINNEN },
  standaard: { delers: ["1", "2", "5", "10"], tot: 10, rijen: 5 },
  foutpatronen: deelPatronen,
  aanpak: deelkoppelenAanpak,
  uitleganimatie: deelkoppelenUitleg,

  waarschuwing: (inst) => {
    const { tot } = grenzen(inst);
    const rijen = Math.max(3, Math.min(6, getal(inst, "rijen", 5)));
    if (rijen > tot) {
      return `Er zijn ${rijen} sommen gevraagd maar er bestaan maar ${tot} verschillende uitkomsten. Zet de grootste uitkomst hoger of vraag minder sommen.`;
    }
    return null;
  },

  maximum: (inst) => {
    const { delers, tot } = grenzen(inst);
    const rijen = Math.max(3, Math.min(6, getal(inst, "rijen", 5)));
    if (rijen > tot) return 0;
    /* Ruim: elke combinatie van uitkomsten met elke keuze aan delers erbij. */
    return Math.max(0, (tot - rijen + 1) * delers.length * 20);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { delers, tot } = grenzen(inst);
    const rijen = Math.min(Math.max(3, Math.min(6, getal(inst, "rijen", 5))), tot);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      /* Verschillende uitkomsten, elk met zijn eigen deelsom erbij. */
      const uitkomsten: number[] = [];
      for (let ronde = 0; ronde < 80 && uitkomsten.length < rijen; ronde++) {
        const n = heelGetalBovenaan(kans, 1, tot);
        if (!uitkomsten.includes(n)) uitkomsten.push(n);
      }
      if (uitkomsten.length < rijen) break;

      const sommen = uitkomsten.map((n) => {
        const deler = kiesUit(kans, delers);
        return { eerste: deler * n, tweede: deler };
      });

      const handtekening = `deelkoppelen:${sommen.map((s) => `${s.eerste}:${s.tweede}`).join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const eerste = sommen[0];
      const gegevens = {
        soort: "deelkoppelen",
        variant: "slepen",
        getallen: [eerste.eerste, eerste.tweede],
        goed: uitkomsten[0],
        extra: { tafel: eerste.tweede, mee: uitkomsten[0], product: eerste.eerste, rijen },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(deelkoppelenGenerator, inst, groep, gegevens),
        /* Per rij de uitkomst, van boven naar beneden. */
        antwoord: uitkomsten.join(","),
        figuur: { soort: "deelkoppelen", sommen, keuzes: husselen(kans, uitkomsten) },
        somgegevens: gegevens,
      });
    }

    /*
      Van makkelijk naar moeilijk: oplopend in de getallen die gedeeld worden.
      De vaste plek gaat mee in de figuur, zodat het oefenscherm ze in die
      volgorde zet.
    */
    const zwaarte = (v: Gegenereerd) =>
      v.figuur?.soort === "deelkoppelen" ? v.figuur.sommen.reduce((n, x) => n + x.eerste, 0) : 0;
    uit.sort((a, b) => zwaarte(a) - zwaarte(b));
    uit.forEach((v, i) => {
      if (v.figuur?.soort === "deelkoppelen") v.figuur.volgnummer = i + 1;
    });

    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke deelsom past erbij?
// ---------------------------------------------------------------------------

const WELKEZIN = "Maak een deelsom die uitkomt op {som}.";
const WELKEZINNEN: Record<Leeftijdsgroep, string> = {
  "34": WELKEZIN,
  "56": WELKEZIN,
  "78": "Schrijf een deelsom op die uitkomt op {som}.",
};

/** Alle deelsommen die op `uitkomst` uitkomen, met een deler tot en met `max`. */
export function passendeDeelsommen(uitkomst: number, max: number): [number, number][] {
  const uit: [number, number][] = [];
  for (let deler = 1; deler <= max; deler++) uit.push([deler * uitkomst, deler]);
  return uit;
}

export const welkedeelsomGenerator: Generator = {
  id: "welkedeelsom",
  naam: "Welke deelsom past erbij?",
  uitleg:
    "De uitkomst staat er; het kind typt zelf een deelsom die klopt: ▢ : ▢ = 5. Elke goede deelsom telt, dus 10 : 2 en 45 : 9 zijn allebei goed.",
  suggestie: "Groep 4: uitkomsten tot en met 10, delen door maximaal 10",
  velden: [
    UITKOMSTVELD,
    {
      soort: "getal",
      sleutel: "max",
      label: "Grootste getal om door te delen",
      min: 2,
      max: 10,
      hulp: "Elke deelsom met een deler tot en met dit getal is goed gerekend.",
    },
    {
      soort: "getal",
      sleutel: "geheelTot",
      label: "Grootste getal in de deelsom",
      min: 0,
      max: 1000,
      hulp: "Staat hier een getal, dan telt elke goede deelsom waarin geen getal groter is dan dit, ook als je door meer dan het getal hierboven deelt (bij 100: 100 : 20 = 5 is goed). 0 = niet gebruiken.",
    },
    ...vraagtekstVelden(WELKEZINNEN, {
      voorbeeldzinnen: {
        "34": "Maak een deelsom die uitkomt op 5.",
        "56": "Maak een deelsom die uitkomt op 5.",
        "78": "Schrijf een deelsom op die uitkomt op 5.",
      },
      extraHulp: "Op de plek van {som} komt de uitkomst te staan.",
    }),
    {
      soort: "keuze",
      sleutel: "vormen",
      label: "Vorm",
      opties: [
        { waarde: "zelf", label: "Altijd twee lege vakjes (▢ : ▢ = 6)" },
        { waarde: "afwisselen", label: "Afwisselen: ▢ : ▢ = 6, ▢ : 3 = 6 en 18 : ▢ = 6" },
      ],
      hulp: "Bij afwisselen is er een derde van de opgaven met twee lege vakjes, een derde met het getal dat je deelt leeg, en een derde met het getal waardoor je deelt leeg. Zo zijn er genoeg verschillende vragen, ook met uitkomsten tot en met 10.",
    },
  ],
  vraagteksten: {
    standaard: WELKEZINNEN,
    som: (s) => String(s.extra?.mee ?? s.goed),
  },
  standaard: { tot: 10, max: 10, vormen: "zelf" },
  foutpatronen: deelPatronen,
  aanpak: welkedeelsomAanpak,
  uitleganimatie: welkedeelsomUitleg,

  maximum: (inst) => {
    const { tot } = grenzen(inst);
    if (tekst(inst, "vormen", "zelf") !== "afwisselen") return tot;
    /* Twee lege vakjes: één per uitkomst; één leeg vakje: elke deler die past, twee keer. */
    let n = tot;
    for (let u = 2; u <= tot; u++) n += 2 * welkeDelers(u, inst).length;
    return n;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    if (tekst(inst, "vormen", "zelf") === "afwisselen") return maakAfwisselend(inst, aantal, alGebruikt, zaad, groep);
    const kans = kansGenerator(zaad);
    const { tot } = grenzen(inst);
    const vasteMax = Math.max(2, Math.min(10, getal(inst, "max", 10)));
    /*
      Met een grens op het hele getal mag er door alles gedeeld worden zolang
      het getal dat je deelt er niet boven komt: bij 100 en uitkomst 5 is dat
      tot en met 100 : 20.
    */
    const geheelTot = Math.max(0, getal(inst, "geheelTot", 0));

    const uit: Gegenereerd[] = [];
    /*
      Eén vraag per uitkomst: twee keer dezelfde uitkomst zou twee keer dezelfde
      vraag zijn. Dus de uitkomsten worden gehusseld en op een rij afgewerkt —
      daarmee komen er precies zoveel vragen uit als er uitkomsten zijn.
    */
    const uitkomsten = husselen(
      kans,
      Array.from({ length: tot }, (_, i) => i + 1),
    );

    for (const uitkomst of uitkomsten) {
      if (uit.length >= aantal) break;
      const max = geheelTot > 0 ? Math.max(1, Math.floor(geheelTot / uitkomst)) : vasteMax;

      const handtekening = `welkedeelsom:${uitkomst}-${max}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const passend = passendeDeelsommen(uitkomst, max);
      /* Een voorbeeldsom voor de uitleg: niet de makkelijkste (delen door 1). */
      const voorbeeld = passend[Math.min(1, passend.length - 1)];

      const gegevens = {
        soort: "welkedeelsom",
        variant: "zelf",
        getallen: [voorbeeld[0], voorbeeld[1]],
        goed: uitkomst,
        extra: { tafel: voorbeeld[1], mee: uitkomst, product: voorbeeld[0], max },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(welkedeelsomGenerator, inst, groep, gegevens),
        /*
          Elke deelsom die klopt is goed. Ze staan er allemaal in, als "geheel,
          deler" per stuk; het nakijken vergelijkt wat er getypt is met deze
          lijst. Zo hoeft het oefenscherm niets over deelsommen te weten.
        */
        antwoord: passend.map(([geheel, deler]) => `${geheel},${deler}`).join("|"),
        figuur: { soort: "welkedeelsom", uitkomst, max },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};

// ---------------------------------------------------------------------------
// Welke deelsom past erbij? — afwisselende vorm
// ---------------------------------------------------------------------------

/** De delers 2 tot en met 10 waarbij het getal dat je deelt binnen de grens blijft. */
function welkeDelers(uitkomst: number, inst: Instellingen): number[] {
  const geheelTot = Math.max(0, getal(inst, "geheelTot", 0)) || 100;
  const uit: number[] = [];
  for (let d = 2; d <= 10; d++) if (d * uitkomst <= geheelTot) uit.push(d);
  return uit;
}

/**
 * Om de beurt drie vormen, elk een derde van de opgaven:
 *
 *   ▢ : ▢ = 6   zelf een deelsom bedenken; elke goede deelsom telt
 *   ▢ : 3 = 6   het getal dat je deelt is leeg (het antwoord is 18)
 *   18 : ▢ = 6  het getal waardoor je deelt is leeg (het antwoord is 3)
 *
 * In die volgorde, en binnen een vorm oplopend: van makkelijk naar moeilijk.
 */
function maakAfwisselend(
  inst: Instellingen,
  aantal: number,
  alGebruikt: Set<string>,
  zaad: number,
  groep: number,
): Gegenereerd[] {
  const kans = kansGenerator(zaad);
  const { tot } = grenzen(inst);
  const geheelTot = Math.max(0, getal(inst, "geheelTot", 0)) || 100;
  const derde = Math.ceil(aantal / 3);

  const zelf = husselen(kans, Array.from({ length: tot }, (_, i) => i + 1)).slice(0, derde).sort((a, b) => a - b);
  const metEen = (leeg: "geheel" | "deler") =>
    husselen(kans, Array.from({ length: Math.max(0, tot - 1) }, (_, i) => i + 2))
      .slice(0, derde)
      .map((u) => {
        const delers = welkeDelers(u, inst);
        return { u, d: delers.length ? kiesUit(kans, delers) : 1, leeg };
      })
      .sort((a, b) => a.u * a.d - b.u * b.d);

  const uit: Gegenereerd[] = [];
  const neem = (g: Gegenereerd, handtekening: string) => {
    if (uit.length >= aantal || alGebruikt.has(handtekening)) return;
    alGebruikt.add(handtekening);
    if (g.figuur?.soort === "welkedeelsom") g.figuur.volgnummer = uit.length + 1;
    uit.push(g);
  };

  /* Twee lege vakjes: zoals altijd, met een grens op het getal dat je deelt. */
  for (const uitkomst of zelf) {
    const max = Math.max(1, Math.floor(geheelTot / uitkomst));
    const passend = passendeDeelsommen(uitkomst, max);
    const voorbeeld = passend[Math.min(1, passend.length - 1)];
    const gegevens = {
      soort: "welkedeelsom",
      variant: "zelf",
      getallen: [voorbeeld[0], voorbeeld[1]],
      goed: uitkomst,
      extra: { tafel: voorbeeld[1], mee: uitkomst, product: voorbeeld[0], max },
    };
    neem(
      {
        handtekening: `welkedeelsom:${uitkomst}-${max}`,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(welkedeelsomGenerator, inst, groep, gegevens),
        antwoord: passend.map(([geheel, deler]) => `${geheel},${deler}`).join("|"),
        figuur: { soort: "welkedeelsom", uitkomst, max },
        somgegevens: gegevens,
      },
      `welkedeelsom:${uitkomst}-${max}`,
    );
  }

  /* Eén leeg vakje: het getal dat je deelt, of het getal waardoor je deelt. */
  for (const { u, d, leeg } of [...metEen("geheel"), ...metEen("deler")]) {
    const geheel = u * d;
    const handtekening = `welkedeelsom:${leeg}:${geheel}:${d}`;
    const gevraagd = leeg === "geheel" ? geheel : d;
    const gegevens = {
      soort: "welkedeelsom",
      variant: leeg === "geheel" ? "geheelvraag" : "delervraag",
      getallen: [geheel, d],
      goed: gevraagd,
      extra: { tafel: d, mee: u, product: geheel },
    };
    neem(
      {
        handtekening,
        vorm: "open",
        vraagtekst: "Vul in.",
        antwoord: String(gevraagd),
        figuur:
          leeg === "geheel"
            ? { soort: "welkedeelsom", uitkomst: u, max: d, deler: d }
            : { soort: "welkedeelsom", uitkomst: u, max: d, geheel },
        somgegevens: gegevens,
      },
      handtekening,
    );
  }

  return uit;
}
