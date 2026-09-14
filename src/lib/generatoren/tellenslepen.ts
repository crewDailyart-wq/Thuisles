/**
 * Tellen en slepen: hoeveel onderdelen zitten er aan elke afbeelding?
 *
 * Twee tot vier figuren naast elkaar — bloemen met blaadjes, bomen met appels,
 * ballonnen aan een touwtje — elk met een ander aantal. Onder elk figuur staat
 * een leeg vakje, en het kind sleept er het juiste getal naartoe.
 *
 * Wat dit type oefent is niet alleen tellen, maar ook koppelen: je moet het
 * getal bij het juiste plaatje leggen. Twee verwisselde getallen is daarom fout,
 * ook al heb je allebei de aantallen goed geteld — dat is precies de denkfout
 * die dit type zichtbaar maakt.
 *
 * De figuren zitten als gegevens in de vraag (`figuur`), niet als plaatje. Wat
 * er te tekenen valt staat in `TELSOORTEN`; een soort erbij is één regel in dat
 * register en komt daarna vanzelf in de afwisseling.
 */

import {
  getal,
  heelGetal,
  husselen,
  kansGenerator,
  kiesUit,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import { TELSOORT_NAMEN, telsoortWoorden } from "@/lib/telsoorten";
import { tellenslepenPatronen } from "@/lib/generatoren/patronen/tellenslepen";
import { tellenslepenAanpak } from "@/lib/generatoren/aanpak/tellenslepen";
import { tellenslepenUitleg } from "@/lib/generatoren/scripts/tellenslepen";

/** De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer. */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel {som}?",
  "56": "Hoeveel {som}?",
  "78": "Sleep bij elke afbeelding het juiste aantal: hoeveel {som}?",
};

/**
 * De woorden die bij de getoonde figuren horen.
 *
 * Binnen één vraag is de soort altijd hetzelfde, zodat de vraagzin kan kloppen:
 * bij bloemen "blaadjes zitten er aan elke bloem", bij bomen "appels zitten er
 * aan elke boom". Zou er in één vraag een boom naast een bloem staan, dan valt
 * er geen zin te maken die allebei dekt.
 *
 * Tussen de vragen wisselt de soort wél, dus het blijft afwisselend.
 */
function woorden(som: { variant?: string }): string {
  const s = telsoortWoorden(som.variant ?? "bloem");
  return `${s.meervoud} zitten er aan elke ${s.geheel}`;
}

function grenzen(inst: Instellingen) {
  const hoeveel = Math.min(4, Math.max(2, getal(inst, "hoeveel", 3)));
  const van = Math.max(1, getal(inst, "van", 3));
  const tot = Math.max(van, getal(inst, "tot", 10));
  return { hoeveel, van, tot, afleiders: vinkje(inst, "afleiders") };
}

export const tellenslepenGenerator: Generator = {
  id: "tellenslepen",
  naam: "Tellen en slepen",
  uitleg:
    "Twee tot vier getekende figuren naast elkaar, elk met een ander aantal telbare onderdelen. Het kind sleept bij elk figuur het juiste getal in het vakje eronder.",
  suggestie: "Groep 3: 2 tot 3 afbeeldingen, 3 tot 8 onderdelen · groep 4: 3 tot 4, 5 tot 12",
  velden: [
    {
      soort: "getal",
      sleutel: "hoeveel",
      label: "Afbeeldingen per vraag",
      min: 2,
      max: 4,
      hulp: "Meer dan vier wordt op een telefoon te smal om te slepen.",
    },
    { soort: "getal", sleutel: "van", label: "Minste onderdelen", min: 1, max: 20 },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Meeste onderdelen",
      min: 1,
      max: 20,
      hulp: "Elke afbeelding krijgt een ander aantal, dus het bereik moet minstens zo groot zijn als het aantal afbeeldingen.",
    },
    {
      soort: "vinkje",
      sleutel: "afleiders",
      label: "Extra getallen die nergens bij horen",
      hulp: "Aan: er liggen twee getallen meer dan er afbeeldingen zijn. Het kind moet dan echt tellen en kan niet de laatste overhouden.",
    },
    {
      soort: "vinkjes",
      sleutel: "soorten",
      label: "Welke figuren mogen voorkomen",
      opties: TELSOORT_NAMEN.map((n) => ({ waarde: n, label: n })),
      hulp: "Niets aangevinkt = alle soorten. Ze worden per vraag willekeurig gekozen.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: {
    standaard: STANDAARDZINNEN,
    som: woorden,
  },
  standaard: { hoeveel: 3, van: 3, tot: 10, afleiders: false, soorten: [] },
  foutpatronen: tellenslepenPatronen,
  aanpak: tellenslepenAanpak,
  uitleganimatie: tellenslepenUitleg,

  /*
    Hoeveel verschillende vragen er bestaan: het aantal manieren om `hoeveel`
    verschillende aantallen uit het bereik te kiezen, maal de figuursoorten.
    Bij 3 uit 3-10 zijn dat er al honderden, dus dit is zelden de beperking.
  */
  maximum: (inst) => {
    const { hoeveel, van, tot } = grenzen(inst);
    const ruimte = tot - van + 1;
    if (ruimte < hoeveel) return 0;
    let combinaties = 1;
    for (let i = 0; i < hoeveel; i++) combinaties *= ruimte - i;
    return combinaties;
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const { hoeveel, van, tot, afleiders } = grenzen(inst);

    const gekozenSoorten = Array.isArray(inst.soorten) && inst.soorten.length > 0
      ? (inst.soorten as string[]).filter((n) => TELSOORT_NAMEN.includes(n))
      : TELSOORT_NAMEN;
    const soorten = gekozenSoorten.length > 0 ? gekozenSoorten : TELSOORT_NAMEN;

    /* Zonder genoeg verschillende aantallen valt er niets te maken. */
    if (tot - van + 1 < hoeveel) return [];

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      /*
        Elk figuur een ánder aantal. Twee keer hetzelfde getal zou betekenen dat
        er twee vakjes zijn waar hetzelfde in mag, en dan valt er niets meer te
        koppelen.
      */
      const mogelijk = Array.from({ length: tot - van + 1 }, (_, i) => van + i);
      const aantallen = husselen(kans, mogelijk).slice(0, hoeveel);

      /* Eén soort per vraag; zie `woorden` hierboven voor waarom. */
      const soort = kiesUit(kans, soorten);
      const items = aantallen.map((n) => ({ soort, aantal: n }));

      /* De getallen rechts: de goede, eventueel met afleiders, door elkaar. */
      const keuzes = [...aantallen];
      if (afleiders) {
        for (let i = 0; i < 2; i++) {
          for (let p = 0; p < 40; p++) {
            const extra = heelGetal(kans, Math.max(1, van - 2), tot + 2);
            if (!keuzes.includes(extra)) {
              keuzes.push(extra);
              break;
            }
          }
        }
      }

      const handtekening = `tellenslepen:${soort}:${aantallen.join("-")}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      /*
        De figuursoort staat in `variant`. Daar kan de vraagzin hem uit halen, en
        ook de uitleg weet daarmee waarover het gaat — in `getallen` passen
        alleen getallen.
      */
      const gegevens = {
        soort: "tellenslepen",
        variant: soort,
        getallen: aantallen,
        goed: aantallen[0],
      };

      uit.push({
        handtekening,
        vorm: "sleepgetallen",
        vraagtekst: bepaalVraagtekst(tellenslepenGenerator, inst, groep, gegevens),
        /* De sleepbare getallen, in willekeurige volgorde. */
        opties: husselen(kans, keuzes).map((n) => ({ tekst: String(n), afbeelding: null })),
        antwoord: aantallen.join(","),
        figuur: { soort: "telrij", items, palet: "viool-oranje" },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
