/**
 * Plaatjes tellen meerkeuze: hoeveel plaatjes staan er?
 *
 * Een aantal dezelfde plaatjes op het scherm, met vier getallen eronder. Het
 * kind tikt op het getal dat het denkt dat goed is. Het mag de plaatjes
 * aantikken terwijl het telt — die gaan dan lichter staan en krijgen een
 * vinkje — maar dat aftikken is hulp en geen antwoord.
 *
 * ---------------------------------------------------------------------------
 * De opstelling is de les
 * ---------------------------------------------------------------------------
 * Hoe de plaatjes staan bepaalt wát er geoefend wordt, en dat is per sjabloon
 * in te stellen:
 *
 *   rijen van 5   de vijfstructuur: "vijf, en nog vijf, dat is tien"
 *   rijen van 10  de tienstructuur, de opstap naar het rekenen tot honderd
 *   verspreid     het moeilijkst: het kind moet zélf structuur aanbrengen
 *
 * ---------------------------------------------------------------------------
 * Waarom de foute keuzes geen willekeurige getallen zijn
 * ---------------------------------------------------------------------------
 * Een willekeurig fout getal leert niets: het kind ziet meteen dat het niet kan
 * kloppen, en een fout antwoord zegt niets over wat er misging. Daarom zijn het
 * drie echte telfouten, en herkent elk foutpatroon er precies één.
 *
 * Twee daarvan zijn de bekende missers aan het eind van de telling: er één te
 * weinig of er één te veel. De derde is de structuurfout: een heel groepje
 * overgeslagen of juist twee keer geteld. Dat is bij rijen de gewone misser —
 * je raakt kwijt welke rij je al had — en het levert bovendien een vierde
 * getal op dat écht verschilt. Zou de derde fout óók "eentje overslaan" zijn,
 * dan kwam daar hetzelfde getal uit als bij "eentje te weinig" en stonden er
 * maar drie verschillende keuzes.
 */

import {
  getal,
  heelGetal,
  husselen,
  kiesUit,
  kansGenerator,
  lijst,
  tekst,
  vinkje,
  type Generator,
  type Gegenereerd,
  type Instellingen,
  bepaalVraagtekst,
  vraagtekstVelden,
} from "@/lib/generatoren/soort";
import type { Leeftijdsgroep } from "@/lib/generatoren/foutpatroon";
import type { AntwoordOptie } from "@/lib/vraagtypes";
import { TELPLAATJE_NAMEN, TELPLAATJE_OPTIES } from "@/lib/telplaatjes";
import { plaatjestellenPatronen } from "@/lib/generatoren/patronen/plaatjestellen";
import { plaatjestellenAanpak } from "@/lib/generatoren/aanpak/plaatjestellen";
import { plaatjestellenUitleg } from "@/lib/generatoren/scripts/plaatjestellen";

/**
 * De standaardzinnen van dit type. Per sjabloon aan te passen in het beheer.
 *
 * Zo kort mogelijk gehouden: deze kinderen kunnen nog nauwelijks lezen. Twee
 * woorden en een vraagteken is genoeg — wát er te tellen valt, zien ze.
 */
const STANDAARDZINNEN: Record<Leeftijdsgroep, string> = {
  "34": "Hoeveel zie je?",
  "56": "Hoeveel plaatjes zie je?",
  "78": "Hoeveel plaatjes staan er in totaal?",
};

/** Het grootste aantal dat nog te tellen valt zonder dat het beeld volloopt. */
const MAX_AANTAL = 40;

export function grenzen(inst: Instellingen) {
  const van = Math.max(1, Math.min(MAX_AANTAL, getal(inst, "van", 5)));
  const tot = Math.max(van, Math.min(MAX_AANTAL, getal(inst, "tot", 12)));
  const verspreid = tekst(inst, "opstelling", "rijen") === "verspreid";
  const perRij = verspreid ? 0 : Math.max(2, Math.min(10, getal(inst, "perRij", 5)));
  return {
    van,
    tot,
    perRij,
    verspreid,
    groepsruimte: vinkje(inst, "groepsruimte"),
    /*
      Welke plaatjes de generator mag gebruiken. Per vraag wordt er één uit
      gekozen, zodat de ene vraag eendjes heeft en de volgende ballen — binnen
      één vraag blijft het natuurlijk hetzelfde plaatje, anders weet een kind
      niet wat het moet tellen.

      Niets aangevinkt = alle getekende plaatjes. "eigen" doet de geüploade
      afbeelding meedoen in de afwisseling, zodat uploaden mogelijk blijft.
    */
    plaatjes: lijst(inst, "plaatjes", []),
    afbeelding: tekst(inst, "afbeelding", ""),
    vosVangend: tekst(inst, "vosVangend", ""),
    vosWachtend: tekst(inst, "vosWachtend", ""),
    vosBlij: tekst(inst, "vosBlij", ""),
  };
}

/**
 * Hoe groot een "groepje" is bij deze opstelling.
 *
 * Bij rijen is dat de rij zelf: je raakt kwijt welke rij je al had. Verspreid
 * zijn er geen rijen, en dan is twee plaatjes kwijtraken of dubbel pakken de
 * gewone misser — bij één zou het getal samenvallen met "eentje te weinig".
 */
export function groepsmaat(perRij: number): number {
  return perRij >= 2 ? perRij : 2;
}

/**
 * De vier keuzes: het goede getal en drie echte telfouten.
 *
 * Gehusseld, zodat het juiste antwoord niet steeds op dezelfde plek staat. Dat
 * is geen detail: staat het goede antwoord er altijd als tweede, dan heeft een
 * kind dat door en hoeft het niet meer te tellen.
 */
export function keuzes(
  goed: number,
  perRij: number,
  kans: () => number,
): { opties: AntwoordOptie[]; antwoord: string; groepsfout: number } {
  const groep = groepsmaat(perRij);

  /*
    De structuurfout mag beide kanten op — overgeslagen of dubbel geteld — maar
    moet wel boven nul blijven en niet samenvallen met een van de andere drie.
  */
  const omlaag = goed - groep;
  const omhoog = goed + groep;
  const groepsfout = omlaag >= 1 && kans() < 0.5 ? omlaag : omhoog;

  const alles = husselen(kans, [goed, goed - 1, goed + 1, groepsfout]);
  return {
    opties: alles.map((n) => ({ tekst: String(n), afbeelding: null })),
    antwoord: String(alles.indexOf(goed)),
    groepsfout,
  };
}

/**
 * Welke plaatjes er deze ronde gebruikt mogen worden.
 *
 * Niets aangevinkt betekent: alle getekende. Dat is bewust geen lege lijst —
 * dan zou er niets te tellen zijn — en het is ook wat een beheerder verwacht
 * die het vakje gewoon niet heeft aangeraakt.
 */
export function bruikbarePlaatjes(gekozen: string[], afbeelding: string): string[] {
  const geldig = gekozen.filter((n) => n === "eigen" || TELPLAATJE_NAMEN.includes(n));
  /* "eigen" doet alleen mee als er ook echt een afbeelding gekozen is. */
  const uit = geldig.filter((n) => n !== "eigen" || afbeelding !== "");
  return uit.length > 0 ? uit : TELPLAATJE_NAMEN;
}

export const plaatjestellenGenerator: Generator = {
  id: "plaatjestellen",
  naam: "Plaatjes tellen meerkeuze",
  uitleg:
    "Een aantal dezelfde plaatjes op het scherm, met vier getallen eronder om uit te kiezen. Het kind mag de plaatjes aantikken terwijl het telt; dat aftikken is hulp en telt niet mee als antwoord. De opstelling bepaalt wat er geoefend wordt.",
  suggestie:
    "Groep 3: 4 tot 10 plaatjes, rijen van 5 · groep 4: 10 tot 20, rijen van 10 · groep 5 en hoger: 15 tot 30, verspreid",
  velden: [
    {
      soort: "getal",
      sleutel: "van",
      label: "Minste plaatjes",
      min: 1,
      max: MAX_AANTAL,
    },
    {
      soort: "getal",
      sleutel: "tot",
      label: "Meeste plaatjes",
      min: 1,
      max: MAX_AANTAL,
      hulp: "Boven de veertig is er niets meer te tellen: dan worden de plaatjes te klein.",
    },
    {
      soort: "vinkjes",
      sleutel: "plaatjes",
      label: "Welke plaatjes mogen voorkomen",
      opties: [
        ...TELPLAATJE_OPTIES,
        { waarde: "eigen", label: "Eigen afbeelding (hieronder uploaden)" },
      ],
      hulp: "Vink er meerdere aan voor afwisseling: dan krijgt vraag 1 eendjes, vraag 2 ballen, enzovoort. Binnen \u00e9\u00e9n vraag is het altijd hetzelfde plaatje, anders weet een kind niet wat het moet tellen. Vink je er \u00e9\u00e9n aan, dan krijgen alle vragen dat plaatje. Niets aangevinkt = alle getekende plaatjes.",
    },
    {
      soort: "afbeelding",
      sleutel: "afbeelding",
      label: "Eigen afbeelding",
      hulp: "Alleen nodig als je hierboven \u201eEigen afbeelding\u201d hebt gekozen. Eén plaatje dat steeds wordt herhaald. Blijft beschikbaar voor wie liever een eigen plaatje gebruikt dan een getekende.",
    },
    {
      soort: "keuze",
      sleutel: "opstelling",
      label: "Opstelling",
      opties: [
        { waarde: "rijen", label: "In rijen" },
        { waarde: "verspreid", label: "Verspreid door elkaar" },
      ],
      hulp: "In rijen oefent het groepsgewijs tellen: het kind ziet de structuur al voordat het begint. Verspreid is het moeilijkst, want dan moet het kind zelf structuur aanbrengen — groepjes maken, of één voor één afgaan zonder de draad kwijt te raken.",
    },
    {
      soort: "getal",
      sleutel: "perRij",
      label: "Plaatjes per rij",
      min: 2,
      max: 10,
      hulp: "5 oefent de vijfstructuur: vijf, en nog vijf, dat is tien. 10 oefent de tienstructuur en is de opstap naar rekenen tot honderd. Andere aantallen mogen ook. Doet niets als de opstelling op verspreid staat.",
    },
    {
      soort: "vinkje",
      sleutel: "groepsruimte",
      label: "Kleine ruimte tussen groepjes van vijf",
      hulp: "Zet een klein gat na elk vijfde plaatje binnen een rij. Bij rijen van tien maakt dat de twee helften zichtbaar, zodat een kind in vijven kan meetellen zonder dat de rij uit elkaar valt.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosVangend",
      label: "Vos \u2014 vangend",
      hulp: "Te zien terwijl de plaatjes komen aandwarrelen en Vos ze opvangt. Leeg = de standaardvos van dit soort oefening; die staat bij Afbeeldingen en wordt hieronder getoond.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosWachtend",
      label: "Vos \u2014 wachtend",
      hulp: "Te zien zolang het kind nadenkt. Leeg = de standaardvos van dit soort oefening.",
    },
    {
      soort: "afbeelding",
      sleutel: "vosBlij",
      label: "Vos \u2014 blij",
      hulp: "Te zien na een goed antwoord, als de plaatjes terugvliegen. Leeg = de standaardvos van dit soort oefening.",
    },
    /* Overal dezelfde velden om de vraagzin aan te passen, per groep. */
    ...vraagtekstVelden(STANDAARDZINNEN),
  ],
  vraagteksten: { standaard: STANDAARDZINNEN },
  standaard: {
    van: 4,
    tot: 10,
    afbeelding: "",
    opstelling: "rijen",
    perRij: 5,
    groepsruimte: false,
    plaatjes: [],
    vosVangend: "",
    vosWachtend: "",
    vosBlij: "",
  },
  foutpatronen: plaatjestellenPatronen,
  aanpak: plaatjestellenAanpak,
  uitleganimatie: plaatjestellenUitleg,

  /*
    Er is er precies één per aantal: bij 4 tot en met 10 zijn dat er zeven. De
    opstelling verandert niets aan dat aantal — dezelfde tien plaatjes in een
    andere stand blijven dezelfde vraag.
  */
  maximum: (inst) => {
    const { van, tot } = grenzen(inst);
    return Math.max(0, tot - van + 1);
  },

  maak(inst, aantal, alGebruikt, zaad, groep) {
    const kans = kansGenerator(zaad);
    const {
      van,
      tot,
      perRij,
      verspreid,
      groepsruimte,
      plaatjes,
      afbeelding,
      vosVangend,
      vosWachtend,
      vosBlij,
    } = grenzen(inst);

    const mogelijk = bruikbarePlaatjes(plaatjes, afbeelding);

    /*
      Welk plaatje de vorige vraag had. Twee keer achter elkaar hetzelfde voelt
      als geen afwisseling, ook al is het toeval; met meer dan één plaatje in de
      lijst wordt de vorige daarom overgeslagen.
    */
    let vorigPlaatje = "";

    const uit: Gegenereerd[] = [];
    for (let poging = 0; poging < aantal * 200 && uit.length < aantal; poging++) {
      const hoeveel = heelGetal(kans, van, tot);

      const handtekening = `plaatjestellen:${hoeveel}`;
      if (alGebruikt.has(handtekening)) continue;
      alGebruikt.add(handtekening);

      const { opties, antwoord, groepsfout } = keuzes(hoeveel, perRij, kans);

      const anders = mogelijk.filter((n) => n !== vorigPlaatje);
      const gekozen = kiesUit(kans, anders.length > 0 ? anders : mogelijk);
      vorigPlaatje = gekozen;

      /*
        In `extra` staat wat de foutpatronen nodig hebben om te weten wélke
        telfout er is gemaakt: hoe groot een rij is, en welk getal bij de
        structuurfout hoort. Zonder die twee is "één te weinig" niet van "een
        groepje overgeslagen" te onderscheiden.
      */
      const gegevens = {
        soort: "plaatjestellen",
        variant: verspreid ? "verspreid" : "rijen",
        getallen: [hoeveel],
        goed: hoeveel,
        extra: {
          perRij,
          groep: groepsmaat(perRij),
          groepsfout,
          groepsruimte: groepsruimte ? 1 : 0,
        },
      };

      uit.push({
        handtekening,
        vorm: "meerkeuze",
        vraagtekst: bepaalVraagtekst(plaatjestellenGenerator, inst, groep, gegevens),
        opties,
        antwoord,
        figuur: {
          soort: "plaatjesraster",
          aantal: hoeveel,
          /* "eigen" betekent: niets tekenen, de geüploade afbeelding gebruiken. */
          plaatje: gekozen === "eigen" ? null : gekozen,
          afbeelding: afbeelding || null,
          vos: {
            vangend: vosVangend || null,
            wachtend: vosWachtend || null,
            blij: vosBlij || null,
          },
          perRij,
          groepsruimte,
        },
        somgegevens: gegevens,
      });
    }

    return uit;
  },
};
