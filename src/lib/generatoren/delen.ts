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
 * De basisversie is kaal rekenen; beeld komt later (WERKPLAN.md). Daarom staat
 * er bij deze types nog geen instelling voor hoeveel sommen visueel beginnen:
 * er is nog geen beeld om te laten zien, en een knop die niets doet is erger
 * dan geen knop.
 */

import {
  getal,
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

export const deelsomGenerator: Generator = {
  id: "deelsom",
  naam: "Delen (kale som)",
  uitleg:
    "De deelsom staat er kaal: 8 : 2 = ▢, met grote cijfers en een dubbele punt. Vink één deeltafel aan voor een oefening als \"Delen door 3\", of meer voor deelsommen door elkaar.",
  suggestie: "Groep 4: delen door 1, 2, 5 en 10 · groep 5: ook 3, 4, 6 · groep 6: alle tien",
  velden: [
    DELERVELD,
    UITKOMSTVELD,
    ...vraagtekstVelden(DEELZINNEN, {
      voorbeeldzinnen: { "34": "Hoeveel is 8 : 2?", "56": "Hoeveel is 8 : 2?", "78": "Reken uit: 8 : 2" },
      extraHulp: "Op de plek van {som} komt de deelsom zelf te staan.",
    }),
  ],
  vraagteksten: {
    standaard: DEELZINNEN,
    som: (s) => `${s.getallen[0]} : ${s.getallen[1]}`,
  },
  standaard: { delers: ["1", "2", "5", "10"], tot: 10 },
  foutpatronen: deelPatronen,
  aanpak: deelsomAanpak,
  uitleganimatie: deelsomUitleg,

  maximum: (inst) => {
    const { delers, tot } = grenzen(inst);
    /* Dezelfde som kan bij twee delers horen (8 : 2 en 8 : 4 zijn er twee). */
    return delers.length * tot;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
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
    ...vraagtekstVelden(WELKEZINNEN, {
      voorbeeldzinnen: {
        "34": "Maak een deelsom die uitkomt op 5.",
        "56": "Maak een deelsom die uitkomt op 5.",
        "78": "Schrijf een deelsom op die uitkomt op 5.",
      },
      extraHulp: "Op de plek van {som} komt de uitkomst te staan.",
    }),
  ],
  vraagteksten: {
    standaard: WELKEZINNEN,
    som: (s) => String(s.goed),
  },
  standaard: { tot: 10, max: 10 },
  foutpatronen: deelPatronen,
  aanpak: welkedeelsomAanpak,
  uitleganimatie: welkedeelsomUitleg,

  maximum: (inst) => grenzen(inst).tot,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { tot } = grenzen(inst);
    const max = Math.max(2, Math.min(10, getal(inst, "max", 10)));

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
