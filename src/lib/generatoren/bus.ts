/**
 * Bus tellen: hoeveel kinderen zitten er in de bus?
 *
 * Een schoolbus van opzij, met in elk raam een vast groepje kinderen —
 * standaard vijf — en een kleur die per raam wisselt. Daardoor hoeft een kind
 * niet kind voor kind te tellen, maar kan het met sprongen mee: 5, 10, 15, en
 * dan het restje erbij. Dezelfde vijfstructuur als bij het rekenrek, maar in
 * een plaatje waar meer bij te bedenken valt.
 *
 * Het verschil met de kralenrij zit in het restje. Bij de kralen is elk groepje
 * altijd compleet; hier mag het laatste raam er 1 tot en met 4 hebben, met de
 * overgebleven plekken zichtbaar leeg. Juist dat maakt de stap "volle groepjes
 * plus de rest" zichtbaar, en dat is wat dit leerdoel oefent.
 *
 * De tekening zit als gegevens in de vraag (`figuur`), niet als plaatje. De
 * kinderkant tekent hem met code, zodat hij op elk scherm scherp blijft.
 */

import {
  getal,
  kansGenerator,
  kiesUit,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { busPatronen } from "@/lib/generatoren/patronen/bus";
import { busAanpak } from "@/lib/generatoren/aanpak/bus";
import { busUitleg } from "@/lib/generatoren/scripts/bus";

/**
 * Welke aantallen kinderen er bij deze instellingen mogen voorkomen.
 *
 * Staat "altijd een veelvoud" aan, dan zitten alle ramen vol en is er nooit een
 * restje: 5, 10, 15, 20. Staat hij uit, dan mag elk aantal binnen het bereik —
 * en dus ook 11, 13 of 17, waarbij het laatste raam een restje van 1 tot en met
 * 4 krijgt.
 *
 * Levert het bereik niets op (bijvoorbeeld 6 tot 9 met alleen veelvouden van
 * 5), dan valt het terug op één vol raam. Zo geeft het scherm nooit een lege
 * lijst.
 */
function mogelijkeTotalen(inst: Instellingen): { totalen: number[]; perGroep: number } {
  const perGroep = Math.max(2, getal(inst, "perGroep", 5));
  const van = Math.max(1, getal(inst, "van", 5));
  const tot = Math.max(van, getal(inst, "tot", 30));
  const alleenVol = vinkje(inst, "alleenVol");

  const totalen: number[] = [];
  for (let n = van; n <= tot; n++) {
    if (alleenVol && n % perGroep !== 0) continue;
    totalen.push(n);
  }

  return { totalen: totalen.length > 0 ? totalen : [perGroep], perGroep };
}

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel vosjes zitten er in de bus?",
  "56": "Hoeveel vosjes zitten er in de bus?",
  "78": "Hoeveel vosjes zitten er in totaal in de bus?",
};

export const busGenerator: Generator = {
  id: "bus",
  naam: "Bus tellen (vijfstructuur)",
  uitleg:
    "Een bus met in elk raam een groepje kinderen, om en om van kleur. Het kind telt met sprongen van vijf mee en typt hoeveel kinderen er in de bus zitten. Het laatste raam mag een restje bevatten.",
  suggestie: "Groep 3: 5 tot 20 kinderen · groep 4: 10 tot 30 kinderen",
  velden: [
    { soort: "keuze", sleutel: "animatie", label: "Busanimatie", opties: [
      { waarde: "instappen", label: "Vosjes stappen in vóór het tellen" },
      { waarde: "wegrijden", label: "Vosjes zitten klaar; bus rijdt weg bij goed antwoord" },
    ], hulp: "Bij beide varianten rijdt de bus weg na een goed antwoord. Daarna volgt de bestaande sleutelbeloning. De bus houdt binnen dit sjabloon steeds evenveel ramen." },
    {
      soort: "getal",
      sleutel: "van",
      label: "Minste kinderen",
      min: 1,
      max: 40,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Meeste kinderen",
      min: 1,
      max: 40,
      hulp: "Meer dan ongeveer 30 wordt de bus zo lang dat de poppetjes klein worden.",
    },
    {
      soort: "getal",
      sleutel: "perGroep",
      label: "Kinderen per raam",
      min: 2,
      max: 10,
      hulp: "Vijf hoort bij de vijfstructuur: dan kan een kind meetellen met 5, 10, 15.",
    },
    {
      soort: "vinkje",
      sleutel: "alleenVol",
      label: "Alle ramen altijd helemaal vol",
      hulp: "Aan: het totaal is altijd een veelvoud (5, 10, 15) en er is nooit een restje. Uit: het laatste raam mag er 1 tot en met 4 hebben, met de lege plekken zichtbaar.",
    },
    {
      soort: "keuze",
      sleutel: "palet",
      label: "Kleuren van de kinderen",
      opties: [
        { waarde: "viool-oranje", label: "Paars en oranje" },
        { waarde: "groen-lucht", label: "Groen en blauw" },
        { waarde: "roze-geel", label: "Roze en geel" },
      ],
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
  },
  standaard: { animatie: "instappen", van: 5, tot: 30, perGroep: 5, alleenVol: false, palet: "viool-oranje" },
  foutpatronen: busPatronen,
  aanpak: busAanpak,
  uitleganimatie: busUitleg,

  /*
    Het beeld ligt helemaal vast zodra het totaal bekend is: er is precies één
    bus per aantal kinderen. Het aantal verschillende sommen is dus het aantal
    mogelijke totalen — bij 5 tot 30 zijn dat er 26. Het beheerscherm gebruikt
    dit om te waarschuwen als er meer sommen worden gevraagd dan er bestaan.
  */
  maximum: (inst) => mogelijkeTotalen(inst).totalen.length,

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { totalen, perGroep } = mogelijkeTotalen(inst);
    const alleenVol = vinkje(inst, "alleenVol");
    const palet = tekst(inst, "palet", "viool-oranje");

    const animatie = tekst(inst, "animatie", "instappen") === "wegrijden" ? "wegrijden" as const : "instappen" as const;
    const plaatsen = Math.ceil(Math.max(20, ...totalen) / perGroep) * perGroep;
    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const totaal = kiesUit(kans, totalen);

      const gegevens = {
        soort: "bus",
        variant: alleenVol ? "vol" : "rest",
        getallen: [totaal, perGroep],
        goed: totaal,
        extra: { busPlaatsen: plaatsen },
      };

      const handtekening = `bus:${perGroep}:${totaal}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      uit.push({
        handtekening,
        vorm: "open",
        vraagtekst: bepaalVraagtekst(busGenerator, inst, groep, gegevens),
        antwoord: String(totaal),
        figuur: { soort: "bus", totaal, perGroep, palet, animatie, plaatsen },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
