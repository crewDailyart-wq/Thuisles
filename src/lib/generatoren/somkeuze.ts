/**
 * Vier kaartjes met een som; welke moet je hebben?
 *
 * ---------------------------------------------------------------------------
 * Twee standen
 * ---------------------------------------------------------------------------
 * "Niet erbij": op de kaartjes staat alleen `a + b`, drie ervan komen uit op
 * het doelgetal en eentje niet. "Klopt": op de kaartjes staat de hele som met
 * uitkomst en er klopt er precies één.
 *
 * De foute sommen zitten er maar één of twee naast. Dat is met opzet: een kind
 * dat alleen naar de grootte van de getallen kijkt, komt er dan niet uit — het
 * moet echt uitrekenen.
 *
 * Het antwoord is het nummer van het kaartje. Het kind tikt een kaartje aan en
 * kan het daarna nog wisselen; nakijken gebeurt pas bij Controleer.
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
import { optelPatronen } from "@/lib/generatoren/patronen/optelopdrachten";
import { somkeuzeAanpak } from "@/lib/generatoren/aanpak/optelopdrachten";
import { somkeuzeUitleg } from "@/lib/generatoren/scripts/optelopdrachten";

const ZIN_NIET = "Welke is niet {som}?";
const ZIN_KLOPT = "Welke som klopt?";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": ZIN_NIET,
  "56": ZIN_NIET,
  "78": ZIN_NIET,
};

function zinnen(stand: string): Record<Leeftijdsgroep, string> {
  const zin = stand === "klopt" ? ZIN_KLOPT : ZIN_NIET;
  return { "34": zin, "56": zin, "78": zin };
}

const KAARTEN = 4;

export function grenzen(inst: Instellingen) {
  const van = Math.max(3, Math.min(20, getal(inst, "van", 11)));
  const tot = Math.max(van, Math.min(20, getal(inst, "tot", 20)));
  return { van, tot, stand: tekst(inst, "stand", "nietbij") };
}

/** Een willekeurige splitsing van `n`, met allebei de delen minstens 1. */
function splits(kans: () => number, n: number): { eerste: number; tweede: number } {
  const eerste = heelGetal(kans, 1, n - 1);
  return { eerste, tweede: n - eerste };
}

export const somkeuzeGenerator: Generator = {
  id: "somkeuze",
  naam: "Welke som hoort erbij?",
  uitleg:
    "Vier kaartjes met een plussom. In de stand „niet erbij” komen er drie uit op het doelgetal en eentje niet; in de stand „klopt” staat de uitkomst erbij en klopt er precies één.",
  suggestie: "Groep 4: doelgetal 11 tot en met 20",
  velden: [
    {
      soort: "keuze",
      sleutel: "stand",
      label: "Wat er gevraagd wordt",
      opties: [
        { waarde: "nietbij", label: "Welke is niet … ? — drie kloppen, één niet" },
        { waarde: "klopt", label: "Welke som klopt? — één klopt, drie niet" },
      ],
    },
    { soort: "getal", sleutel: "van", label: "Kleinste uitkomst", min: 3, max: 20 },
    { soort: "getal", sleutel: "tot", label: "Grootste uitkomst", min: 3, max: 20 },
    ...vraagtekstVelden(STANDAARDZINNEN, {
      voorbeeldzinnen: { "34": "Welke is niet 18?", "56": "Welke is niet 18?", "78": "Welke is niet 18?" },
      extraHulp: "Op de plek van {som} komt het doelgetal van die vraag. In de stand „klopt” staat er „Welke som klopt?” en is er geen doelgetal nodig.",
    }),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: (s) => String(s.getallen[0] ?? s.goed),
  },
  standaard: { stand: "nietbij", van: 11, tot: 20 },
  foutpatronen: optelPatronen,
  aanpak: somkeuzeAanpak,
  uitleganimatie: somkeuzeUitleg,

  /* Ruim voldoende verschillende vragen; de grens is het aantal doelgetallen. */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return (tot - van + 1) * 40;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { van, tot, stand } = grenzen(inst);

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 400 && uit.length < aantal; poging++) {
      const doel = heelGetal(kans, van, tot);
      /* De uitzondering ligt er één of twee naast, en blijft binnen het bereik. */
      const afwijking = heelGetal(kans, 1, 2) * (kans() < 0.5 ? -1 : 1);
      const anders = doel + afwijking;
      if (anders < 2 || anders > 20) continue;

      const gebruikt = new Set<string>();
      const kaarten: { eerste: number; tweede: number; uitkomst: number }[] = [];

      if (stand === "nietbij") {
        /* Drie verschillende splitsingen van het doelgetal, plus één die het niet is. */
        for (let ronde = 0; ronde < 60 && kaarten.length < KAARTEN - 1; ronde++) {
          const s = splits(kans, doel);
          const sleutel = `${s.eerste}+${s.tweede}`;
          if (gebruikt.has(sleutel)) continue;
          gebruikt.add(sleutel);
          kaarten.push({ ...s, uitkomst: doel });
        }
        if (kaarten.length < KAARTEN - 1) continue;
        const buiten = splits(kans, anders);
        if (gebruikt.has(`${buiten.eerste}+${buiten.tweede}`)) continue;
        kaarten.push({ ...buiten, uitkomst: anders });
      } else {
        /*
          Eén kloppende som en drie waarvan de uitkomst er 1 of 2 naast zit.
          Nooit hoger dan 20, en geen twee kaartjes met dezelfde uitkomst
          (eigenaar, oktober 2026): anders kan een kind kiezen op wat er
          dubbel staat in plaats van te rekenen.
        */
        const goed = splits(kans, doel);
        gebruikt.add(`${goed.eerste}+${goed.tweede}`);
        kaarten.push({ ...goed, uitkomst: doel });
        const uitkomsten = new Set([doel]);
        for (let ronde = 0; ronde < 120 && kaarten.length < KAARTEN; ronde++) {
          const s = splits(kans, heelGetal(kans, van, tot));
          const sleutel = `${s.eerste}+${s.tweede}`;
          if (gebruikt.has(sleutel)) continue;
          const mis = heelGetal(kans, 1, 2) * (kans() < 0.5 ? -1 : 1);
          const beweerd = s.eerste + s.tweede + mis;
          if (beweerd < 1 || beweerd > 20 || uitkomsten.has(beweerd)) continue;
          gebruikt.add(sleutel);
          uitkomsten.add(beweerd);
          kaarten.push({ ...s, uitkomst: beweerd });
        }
        if (kaarten.length < KAARTEN) continue;
      }

      const gehusseld = husselen(kans, kaarten);
      const goedeKaart =
        stand === "nietbij"
          ? gehusseld.findIndex((k) => k.uitkomst !== doel)
          : gehusseld.findIndex((k) => k.eerste + k.tweede === k.uitkomst);

      const handtekening = `somkeuze:${stand}:${doel}:${gehusseld
        .map((k) => `${k.eerste}+${k.tweede}=${k.uitkomst}`)
        .join("|")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const gegevens = {
        soort: "somkeuze",
        variant: stand,
        getallen: [doel, gehusseld[goedeKaart].eerste],
        goed: goedeKaart,
        extra: { kaarten: gehusseld.length },
      };

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(
          { vraagteksten: { standaard: zinnen(stand), som: () => String(doel) } },
          inst,
          groep,
          gegevens,
        ),
        /* Het nummer van het kaartje; het scherm laat het kind er één kiezen. */
        antwoord: String(goedeKaart),
        figuur: { soort: "somkeuze", stand, doel, kaarten: gehusseld },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
