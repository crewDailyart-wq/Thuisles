/**
 * Tafelsommen: 6 × 4 = ?, omgekeerd (48 = 6 × ?) en als deelsom (48 : 6 = ?).
 */

import {
  husselen,
  kansGenerator,
  lijst,
  meerkeuze,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { tafelsPatronen } from "@/lib/generatoren/patronen/tafels";
import { tafelsAanpak } from "@/lib/generatoren/aanpak/tafels";
import { nogGeenUitleg } from "@/lib/generatoren/scripts/nogniet";

const TAFELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function gekozenTafels(inst: Instellingen): number[] {
  const gekozen = lijst(inst, "tafels", ["1", "2", "5", "10"])
    .map(Number)
    .filter((n) => TAFELS.includes(n));
  return gekozen.length ? gekozen : [1, 2, 5, 10];
}

type Vorm = "keer" | "omgekeerd" | "delen";

function vormen(inst: Instellingen): Vorm[] {
  const uit: Vorm[] = ["keer"];
  if (vinkje(inst, "omgekeerd")) uit.push("omgekeerd");
  if (vinkje(inst, "delen")) uit.push("delen");
  return uit;
}

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel is {som}?",
  "56": "Hoeveel is {som}?",
  "78": "Reken uit: {som}",
};

export const tafelsGenerator: Generator = {
  id: "tafels",
  naam: "Tafels",
  uitleg: "Keersommen uit de tafels die je aanvinkt, eventueel ook omgekeerd of als deelsom.",
  suggestie: "Groep 4: tafels 1, 2, 5 en 10 · groep 5: 3, 4, 6 · groep 6: 7, 8, 9",
  velden: [
    {
      soort: "vinkjes",
      sleutel: "tafels",
      label: "Welke tafels",
      opties: TAFELS.map((n) => ({ waarde: String(n), label: `Tafel van ${n}` })),
    },
    {
      soort: "vinkje",
      sleutel: "omgekeerd",
      label: "Ook omgekeerd",
      hulp: "Bijvoorbeeld: 24 = 6 × ?",
    },
    {
      soort: "vinkje",
      sleutel: "delen",
      label: "Ook als deelsom",
      hulp: "Bijvoorbeeld: 24 : 6 = ?",
    },
    {
      soort: "keuze",
      sleutel: "antwoordvorm",
      label: "Antwoordvorm",
      opties: [
        { waarde: "open", label: "Zelf intypen" },
        { waarde: "meerkeuze", label: "Meerkeuze (vier antwoorden)" },
      ],
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => {
      const tafel = s.extra?.tafel ?? s.getallen[0];
      const mee = s.extra?.mee ?? s.getallen[1];
      const product = s.extra?.product ?? tafel * mee;
      if (s.variant === "omgekeerd") return `${product} = ${tafel} × ?`;
      if (s.variant === "delen") return `${product} : ${tafel}`;
      return `${tafel} × ${mee}`;
    },
  },
  standaard: { tafels: ["1", "2", "5", "10"], omgekeerd: false, delen: false, antwoordvorm: "open" },
  foutpatronen: tafelsPatronen,
  aanpak: tafelsAanpak,
  uitleganimatie: nogGeenUitleg(["tafelgroepjes", "blokjes"]),

  maximum: (inst) => gekozenTafels(inst).length * 10 * vormen(inst).length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const tafels = gekozenTafels(inst);
    const soorten = vormen(inst);
    const meerkeuzeVorm = inst.antwoordvorm === "meerkeuze";

    // Alle mogelijke sommen opsommen en husselen: zo kan er nooit een dubbele
    // uit komen en is de verdeling over de tafels netjes.
    const alles: { tafel: number; mee: number; soort: Vorm }[] = [];
    for (const tafel of tafels) {
      for (let mee = 1; mee <= 10; mee++) {
        for (const soort of soorten) alles.push({ tafel, mee, soort });
      }
    }

    const uit: Gegenereerd[] = [];
    for (const som of husselen(kans, alles)) {
      if (uit.length >= aantal) break;

      const product = som.tafel * som.mee;
      let handtekening: string;
      let antwoordGetal: number;

      if (som.soort === "keer") {
        handtekening = `tafels:${som.tafel}x${som.mee}`;
        antwoordGetal = product;
      } else if (som.soort === "omgekeerd") {
        handtekening = `tafels-om:${product}=${som.tafel}x`;
        antwoordGetal = som.mee;
      } else {
        handtekening = `tafels-deel:${product}:${som.tafel}`;
        antwoordGetal = som.mee;
      }

      const gegevens = {
        soort: "tafels",
        variant: som.soort,
        getallen: [som.tafel, som.mee],
        goed: antwoordGetal,
        extra: { tafel: som.tafel, mee: som.mee, product },
      };
      const vraagtekst = bepaalVraagtekst(tafelsGenerator, inst, groep, gegevens);

      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      uit.push({
        handtekening,
        vraagtekst,
        somgegevens: gegevens,
        ...(meerkeuzeVorm
          ? { vorm: "meerkeuze" as const, ...meerkeuze(antwoordGetal, kans) }
          : { vorm: "open" as const, antwoord: String(antwoordGetal) }),
      });
    }

    return uit;
  },
};
