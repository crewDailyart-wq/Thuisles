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
 * in te stellen per sjabloon. Staat er niets, dan geldt de standaardvos van dit
 * soort oefening; zie het blok bij Afbeeldingen in het beheer.
 */

import {
  getal,
  heelGetal,
  kansGenerator,
  tekst,
  vinkje,
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
 * De standaardzin van dit type. Per sjabloon aan te passen in het beheer.
 *
 * Eén zin voor alle groepen, en met opzet dezelfde overal: onder één leerdoel
 * hangen meerdere oefeningen, en wisselende zinnen lopen dan door elkaar.
 *
 * De zin noemt de sprong niet. Hoe groot die is, hoort het kind zelf uit de
 * rij af te lezen — dat is juist wat hier geoefend wordt, en zo staat het ook
 * in de schoolmethodes.
 *
 * `{som}` zit er niet meer in, maar blijft wel werken: zet je hem zelf in een
 * eigen zin, dan wordt hij nog steeds vervangen door "de lege steen" of "de
 * lege stenen", afhankelijk van hoeveel er leeg zijn.
 */
const VASTE_ZIN = "Vul de ontbrekende getallen in.";

const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": VASTE_ZIN,
  "56": VASTE_ZIN,
  "78": VASTE_ZIN,
};

/** "de lege steen" of "de lege stenen", afhankelijk van hoeveel er leeg zijn. */
function legeStenenWoorden(som: { extra?: Record<string, number> }): string {
  return (som.extra?.aantalLeeg ?? 1) === 1 ? "de lege steen" : "de lege stenen";
}

export type Steenplek = "achteraan" | "tussenin" | "vooraan" | "omenom" | "willekeurig";

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
    /* Uit = zoals het altijd was: de eerste steen houdt zijn getal. */
    eersteMagLeeg: vinkje(inst, "eersteLeeg"),
    mascotte: tekst(inst, "mascotte", ""),
    mascotteSpringend: tekst(inst, "mascotteSpringend", ""),
    mascotteJuichend: tekst(inst, "mascotteJuichend", ""),
  };
}

/**
 * Het om-en-om-patroon: getal, leeg, getal, leeg, ...
 *
 * Begint normaal bij steen 1, want de eerste steen heeft dan een getal: de
 * lege stenen zijn de oneven plekken 1, 3, 5. Het aantal volgt daarmee uit de
 * lengte van de rij — bij zes stenen drie lege, bij vijf stenen twee. De
 * instelling "aantal lege stenen" doet hier dus niets; zie de hulptekst bij
 * dat veld.
 *
 * Mag de eerste steen ook leeg zijn, dan begint hetzelfde patroon bij steen 0
 * en draait het om: leeg, getal, leeg, getal.
 */
export function omEnOmPlekken(stenen: number, vanaf = 1): number[] {
  const uit: number[] = [];
  for (let i = vanaf; i < stenen; i += 2) uit.push(i);
  return uit;
}

/**
 * Hoeveel stenen er minstens een getal moeten houden.
 *
 * Twee. Uit twee ingevulde stenen is de sprong af te lezen — het verschil
 * gedeeld door het aantal stappen ertussen — en daarmee ligt de hele rij vast,
 * ook de stenen vóór de eerste die er staat. Met één getal kan dat niet: dan
 * is er geen sprong uit te halen en valt er niets te berekenen, alleen te
 * raden.
 */
const MINSTE_GETALLEN = 2;

/**
 * Welke stenen leeg worden.
 *
 * De eerste steen blijft standaard staan: daar begint de telrij en daar staat
 * de mascotte. Zonder beginpunt valt er niets door te tellen.
 *
 * Staat het vinkje "Eerste steen mag ook leeg zijn" aan, dan doet die eerste
 * steen mee — niet altijd, maar ongeveer bij de helft van de vragen. De andere
 * helft blijft precies zoals hierboven, zodat een kind allebei tegenkomt.
 */
function legePlekken(
  kans: () => number,
  stenen: number,
  leeg: number,
  plek: Steenplek,
  eersteMagLeeg: boolean,
): number[] {
  /*
    De volgorde in deze voorwaarde doet ertoe: `kans()` wordt alleen getrokken
    als het vinkje aanstaat. Zou hij altijd getrokken worden, dan verschoof de
    hele reeks toevalsgetallen en kwamen er bij elk bestaand sjabloon andere
    rijen uit dan gisteren.

    `MINSTE_GETALLEN` is de rem: bij drie stenen met twee lege zou er één getal
    overblijven, en dan valt de rij niet meer uit te rekenen. In dat geval
    blijft de eerste steen gewoon staan.
  */
  if (eersteMagLeeg && plek === "omenom") {
    /* Om en om vanaf steen 0 laat er `stenen / 2` naar beneden afgerond staan. */
    if (Math.floor(stenen / 2) >= MINSTE_GETALLEN && kans() < 0.5) {
      return omEnOmPlekken(stenen, 0);
    }
  } else if (eersteMagLeeg && stenen - leeg >= MINSTE_GETALLEN && kans() < 0.5) {
    /*
      De eerste steen erbij, en de rest volgens de gekozen plek. Dus achteraan
      wordt "leeg ... vol vol ... leeg", en vooraan wordt "leeg leeg vol ...".
      Zo blijft de keuze bij "Waar de lege stenen liggen" doen wat er staat.
    */
    return [0, ...legeUitRest(kans, stenen, leeg - 1, plek, false)];
  }

  return legeUitRest(kans, stenen, leeg, plek, true);
}

/**
 * De lege stenen vanaf steen 1; de eerste steen blijft hier altijd staan.
 *
 * `metOmEnOm` staat alleen aan als deze functie de hele rij verdeelt. Is steen
 * 0 hierboven al leeg gemaakt, dan mag het om-en-om-patroon er hier niet meer
 * uit komen: dat patroon bepaalt zijn eigen aantal lege stenen, en samen met
 * die eerste bleven er dan te weinig getallen over — bij vier stenen precies
 * één.
 */
function legeUitRest(
  kans: () => number,
  stenen: number,
  leeg: number,
  plek: Steenplek,
  metOmEnOm: boolean,
): number[] {
  /* Niets meer te verdelen: alle overgebleven stenen houden hun getal. */
  if (leeg <= 0) return [];

  const mogelijk = Array.from({ length: stenen - 1 }, (_, i) => i + 1);

  if (plek === "achteraan") return mogelijk.slice(-leeg);
  if (plek === "vooraan") return mogelijk.slice(0, leeg);
  if (plek === "omenom") return omEnOmPlekken(stenen);
  if (plek === "tussenin") {
    /* Uit het midden, met de buitenste stenen als houvast. */
    const midden = mogelijk.slice(0, -1);
    const start = Math.max(0, Math.floor((midden.length - leeg) / 2));
    const uit = midden.slice(start, start + leeg);
    return uit.length === leeg ? uit : mogelijk.slice(0, leeg);
  }

  /*
    Willekeurig: alle patronen mogen eruit komen, ook het om-en-om-patroon.

    Dat laatste kwam er vroeger nooit uit. Met drie lege stenen op zes plekken
    is de kans dat je toevallig precies 1, 3 en 5 trekt één op twintig, en bij
    acht stenen zijn er vier lege nodig terwijl er hoogstens drie worden
    getrokken. Daarom staat het patroon hier als eigen keuze naast de loting:
    ongeveer één op de vier rijen ligt om en om, de rest wordt geloot zoals
    altijd.
  */
  if (metOmEnOm && stenen >= 4 && kans() < 0.25) return omEnOmPlekken(stenen);

  /* Trekken zonder herhaling, en daarna op volgorde zetten. */
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
    "Een rij stapstenen over een beekje met op elke steen het volgende getal. Het kind tikt een lege steen aan en typt het getal op de steen zelf, met het toetsenbord van de laptop of van de tablet.",
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
      hulp: "Geldt bij achteraan, tussenin, vooraan en willekeurig. Bij \u2018om en om\u2019 volgt het aantal uit de rij zelf: bij 6 stenen 3 lege, bij 5 stenen 2. Je keuze hier blijft bewaard en telt weer mee zodra je een andere plek kiest.",
    },
    {
      soort: "keuze",
      sleutel: "plek",
      label: "Waar de lege stenen liggen",
      opties: [
        { waarde: "achteraan", label: "Achteraan" },
        { waarde: "tussenin", label: "Tussenin" },
        { waarde: "vooraan", label: "Vooraan" },
        { waarde: "omenom", label: "Om en om" },
        { waarde: "willekeurig", label: "Willekeurig" },
      ],
      hulp: "De eerste steen blijft altijd staan; daar begint de telrij. Om en om (getal, leeg, getal, leeg) dwingt het kind om steeds \u00e9\u00e9n stap te maken en dan te controleren, en is daardoor lastiger dan alles achteraan: doortellen in \u00e9\u00e9n adem kan niet meer. Bij willekeurig kan het om-en-om-patroon er ook uit komen. Zet je het vinkje hieronder aan, dan kan de eerste steen ook leeg zijn.",
    },
    {
      soort: "vinkje",
      sleutel: "eersteLeeg",
      label: "Eerste steen mag ook leeg zijn",
      hulp: "Uit: de eerste steen heeft altijd een getal en het kind begint verderop in de rij \u2014 zoals het tot nu toe ging. Aan: bij ongeveer de helft van de vragen is de eerste steen leeg en moet het kind daar beginnen. Dat oefent iets anders: het kind kan niet doortellen vanaf een getal dat er al staat, maar moet vanaf de eerste steen die w\u00e9l een getal heeft terugrekenen naar het begin van de rij. Werkt bij elke keuze hierboven: achteraan wordt dan \u201eleeg \u2026 vol \u2026 leeg\u201d, vooraan wordt \u201eleeg leeg vol \u2026\u201d en om en om draait om naar leeg, getal, leeg, getal. Er blijven altijd minstens twee getallen staan, anders valt de sprong niet af te lezen. Vos gaat nooit op een lege steen staan; hij begint op de eerste steen met een getal.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotte",
      label: "Mascotte — staand",
      hulp: "Kies of upload een afbeelding, bijvoorbeeld de vos. Leeg = de standaardvos van dit soort oefening; die staat bij Afbeeldingen en wordt hieronder getoond.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotteSpringend",
      label: "Mascotte — springend",
      hulp: "Alleen nodig als je hier iets anders wilt dan de standaardvos van dit soort oefening; die wordt hieronder getoond.",
    },
    {
      soort: "afbeelding",
      sleutel: "mascotteJuichend",
      label: "Mascotte — juichend",
      hulp: "Te zien als de vos aan de overkant de sleutel oppakt. Leeg = de standaardvos van dit soort oefening.",
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
    eersteLeeg: false,
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
    const {
      sprong,
      richting,
      tot,
      stenen,
      leeg,
      plek,
      eersteMagLeeg,
      mascotte,
      mascotteSpringend,
      mascotteJuichend,
    } = grenzen(inst);

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

      const lege = legePlekken(kans, stenen, leeg, plek, eersteMagLeeg);
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
