/**
 * Telrij stapstenen: vul de lege stenen van een telrij in.
 *
 * Een rij stapstenen over een beekje, met op elke steen het volgende getal van
 * de telrij. Eén of meer stenen zijn leeg; het kind tikt zo'n steen aan en vult
 * hem ter plekke in.
 *
 * Wat hier geoefend wordt is dóórtellen met een vaste sprong — vooruit of
 * terug. De sprong is te zien vóór je de getallen leest: bij een grotere sprong
 * liggen de stenen verder uit elkaar.
 *
 * De mascotte op de eerste steen is een afbeelding uit het afbeeldingenbeheer,
 * in te stellen per sjabloon. Staat er niets, dan staat er ook geen mascotte.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { stapstenenPatronen } from "@/lib/generatoren/patronen/stapstenen";
import { stapstenenAanpak } from "@/lib/generatoren/aanpak/stapstenen";
import { stapstenenUitleg } from "@/lib/generatoren/scripts/stapstenen";

/**
 * De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer.
 *
 * Met `{som}` erin, want het aantal lege stenen verschilt per sjabloon én per
 * som. Een vaste zin zou bij drie lege stenen "de lege steen" zeggen. De vorm
 * "Vul ... in" werkt bij één en bij meer, zodat de zin altijd loopt.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Vul {som} in.",
  "56": "Vul {som} van de telrij in.",
  "78": "Vul {som} van de telrij in. Let op hoe groot de sprong is.",
};

/** "de lege steen" of "de lege stenen", afhankelijk van hoeveel er leeg zijn. */
function legeStenenWoorden(som: { extra?: Record<string, number> }): string {
  return (som.extra?.aantalLeeg ?? 1) === 1 ? "de lege steen" : "de lege stenen";
}

export type Steenplek = "achteraan" | "tussenin" | "vooraan" | "willekeurig";

function grenzen(inst: Instellingen) {
  const sprong = Math.max(1, getal(inst, "sprong", 1));
  const richting: "vooruit" | "terug" =
    tekst(inst, "richting", "vooruit") === "terug" ? "terug" : "vooruit";
  const tot = Math.max(10, getal(inst, "tot", 20));
  const stenen = Math.min(8, Math.max(3, getal(inst, "stenen", 6)));
  /* Nooit meer lege stenen dan er stenen zijn, en er moet er één blijven staan. */
  const leeg = Math.min(stenen - 1, Math.max(1, getal(inst, "leeg", 1)));
  const plek = (tekst(inst, "plek", "achteraan") || "achteraan") as Steenplek;
  return {
    sprong,
    richting,
    tot,
    stenen,
    leeg,
    plek,
    mascotte: tekst(inst, "mascotte", ""),
    mascotteSpringend: tekst(inst, "mascotteSpringend", ""),
    mascotteJuichend: tekst(inst, "mascotteJuichend", ""),
  };
}

/**
 * Welke stenen leeg worden.
 *
 * De eerste steen blijft altijd staan: daar begint de telrij en daar staat de
 * mascotte. Zonder beginpunt valt er niets door te tellen.
 */
function legePlekken(
  kans: () => number,
  stenen: number,
  leeg: number,
  plek: Steenplek,
): number[] {
  const mogelijk = Array.from({ length: stenen - 1 }, (_, i) => i + 1);

  if (plek === "achteraan") return mogelijk.slice(-leeg);
  if (plek === "vooraan") return mogelijk.slice(0, leeg);
  if (plek === "tussenin") {
    /* Uit het midden, met de buitenste stenen als houvast. */
    const midden = mogelijk.slice(0, -1);
    const start = Math.max(0, Math.floor((midden.length - leeg) / 2));
    const uit = midden.slice(start, start + leeg);
    return uit.length === leeg ? uit : mogelijk.slice(0, leeg);
  }

  /* Willekeurig: trekken zonder herhaling, en daarna op volgorde zetten. */
  const pot = [...mogelijk];
  const uit: number[] = [];
  while (uit.length < leeg && pot.length > 0) {
    uit.push(pot.splice(Math.floor(kans() * pot.length), 1)[0]);
  }
  return uit.sort((a, b) => a - b);
}

export const stapstenenGenerator: Generator = {
  id: "stapstenen",
  naam: "Telrij stapstenen",
  uitleg:
    "Een rij stapstenen over een beekje met op elke steen het volgende getal. Het kind tikt een lege steen aan en vult hem ter plekke in, met een cijfertoetsenbord op het scherm.",
  suggestie:
    "Groep 3: sprong 1, t/m 20, 5 stenen, 1 leeg · groep 4: sprong 2 of 10, t/m 50, 6 stenen",
  velden: [
    {
      soort: "keuze",
      sleutel: "sprong",
      label: "Sprong",
      opties: [
        { waarde: "1", label: "1 (dit getal erbij)" },
        { waarde: "2", label: "2" },
        { waarde: "5", label: "5" },
        { waarde: "10", label: "10" },
      ],
      hulp: "Hoe groter de sprong, hoe verder de stenen uit elkaar liggen.",
    },
    {
      soort: "keuze",
      sleutel: "richting",
      label: "Richting",
      opties: [
        { waarde: "vooruit", label: "Vooruit tellen" },
        { waarde: "terug", label: "Terugtellen" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "tot",
      label: "Bereik",
      opties: [
        { waarde: "20", label: "Tot en met 20" },
        { waarde: "50", label: "Tot en met 50" },
        { waarde: "100", label: "Tot en met 100" },
      ],
    },
    {
      soort: "getal",
      sleutel: "stenen",
      label: "Aantal stenen in de rij",
      min: 3,
      max: 8,
      hulp: "Vijf of zes past op elk scherm; meer wordt op een telefoon smal.",
    },
    {
      soort: "keuze",
      sleutel: "leeg",
      label: "Aantal lege stenen",
      opties: [
        { waarde: "1", label: "1" },
        { waarde: "2", label: "2" },
        { waarde: "3", label: "3" },
      ],
    },
    {
      soort: "keuze",
      sleutel: "plek",
      label: "Waar de lege stenen liggen",
      opties: [
        { waarde: "achteraan", label: "Achteraan" },
        { waarde: "tussenin", label: "Tussenin" },
        { waarde: "vooraan", label: "Vooraan" },
        { waarde: "willekeurig", label: "Willekeurig" },
      ],
      hulp: "De eerste steen blijft altijd staan; daar begint de telrij.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotte",
      label: "Mascotte — staand",
      hulp: "Kies of upload een afbeelding, bijvoorbeeld de vos. Niets gekozen = geen mascotte.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotteSpringend",
      label: "Mascotte — springend",
      hulp: "Alleen nodig als je een aparte spronghouding wilt. Leeg = dezelfde als staand.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotteJuichend",
      label: "Mascotte — juichend",
      hulp: "Te zien als de vos aan de overkant de sleutel oppakt. Leeg = dezelfde als staand.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN, som: legeStenenWoorden },
  standaard: {
    sprong: "1",
    richting: "vooruit",
    tot: "20",
    stenen: 6,
    leeg: "1",
    plek: "achteraan",
    mascotte: "",
    mascotteSpringend: "",
    mascotteJuichend: "",
  },
  foutpatronen: stapstenenPatronen,
  aanpak: stapstenenAanpak,
  uitleganimatie: stapstenenUitleg,

  /*
    Hoeveel verschillende rijen er bestaan: het aantal startgetallen waarbij de
    hele rij nog binnen het bereik past, maal de manieren om de lege stenen te
    kiezen. Bij "willekeurig" zijn dat er meer; hier wordt de ondergrens
    genomen, zodat er nooit meer beloofd wordt dan er te maken valt.
  */
  maximum: (inst) => {
    const { sprong, stenen, tot } = grenzen(inst);
    const spanne = sprong * (stenen - 1);
    return Math.max(0, tot - spanne + 1);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { sprong, richting, tot, stenen, leeg, plek, mascotte, mascotteSpringend, mascotteJuichend } =
      grenzen(inst);

    const spanne = sprong * (stenen - 1);
    /* Past de hele rij niet binnen het bereik, dan valt er niets te maken. */
    if (spanne > tot) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      /*
        Het laagste getal van de rij. Bij terugtellen is dat het eindpunt en bij
        vooruittellen het beginpunt; de rij zelf wordt daarna omgedraaid.
      */
      const laagste = heelGetal(kans, 0, tot - spanne);
      const oplopend = Array.from({ length: stenen }, (_, i) => laagste + i * sprong);
      const rij = richting === "terug" ? [...oplopend].reverse() : oplopend;

      const lege = legePlekken(kans, stenen, leeg, plek);
      const zichtbaar = rij.map((n, i) => (lege.includes(i) ? null : n));
      const antwoorden = lege.map((i) => rij[i]);

      const handtekening = `stapstenen:${richting}:${sprong}:${rij[0]}:${lege.join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        In `getallen` staat de hele rij zoals hij op de stenen ligt, met een 0
        op de lege plekken — daar passen alleen getallen in. De lege plekken en
        de sprong staan in `extra`, zodat de foutpatronen weten waar het om gaat.
      */
      const gegevens = {
        soort: "stapstenen",
        variant: richting,
        getallen: rij,
        goed: antwoorden[0],
        extra: {
          sprong,
          aantalLeeg: lege.length,
          ...Object.fromEntries(lege.map((p, k) => [`leeg${k}`, p])),
        },
      };

      uit.push({
        handtekening,
        vorm: "stapstenen",
        vraagtekst: bepaalVraagtekst(stapstenenGenerator, inst, groep, gegevens),
        antwoord: antwoorden.join(","),
        figuur: {
          soort: "stapstenen",
          stenen: zichtbaar,
          sprong,
          richting,
          mascotte: mascotte || null,
          mascotteSpringend: mascotteSpringend || null,
          mascotteJuichend: mascotteJuichend || null,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
