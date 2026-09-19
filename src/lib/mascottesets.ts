/**
 * Welke mascotte-afbeeldingen elk oefeningstype gebruikt.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit bestaat
 * ---------------------------------------------------------------------------
 * Er was één centrale vos voor alle types samen. Dat werkt zolang elk type
 * dezelfde drie houdingen gebruikt, maar dat is niet zo: de stapstenen hebben
 * een springende vos, de trein een machinist met een pet, en het vissen een vos
 * met een hengel. Eén trio voor alles betekende dus dat je bij elk nieuw
 * sjabloon tóch weer ging invullen.
 *
 * Hier staat per type welke plekken er zijn. Daarmee kan het beheer per type
 * een eigen standaard bewaren, en weet het sjabloonscherm wélke afbeelding er
 * geldt als een veld leeg blijft.
 *
 * ---------------------------------------------------------------------------
 * De sleutels zijn niet toevallig
 * ---------------------------------------------------------------------------
 * `sleutel` is exact dezelfde sleutel als het veld bij het sjabloon. Daardoor
 * is de terugval één regel: staat er bij het sjabloon niets onder die sleutel,
 * dan geldt de standaard van het type onder diezelfde sleutel. Er hoeft dus
 * nergens een lijstje bijgehouden te worden dat het een met het ander verbindt.
 *
 * `vangend`, `wachtend` en `blij` zijn de drie houdingen van het figuur zelf —
 * die staan niet als veld bij elk sjabloon, maar worden bij het tonen ingevuld.
 * Zie `vosVanSjabloon` in `src/lib/data/vragen.ts`.
 *
 * Alleen de houdingen die een type écht laat zien staan erbij. De straat toont
 * Vos bijvoorbeeld pas ná een goed antwoord, dus daar heeft een wachtende vos
 * geen zin; die zou je invullen en nooit terugzien.
 */

export type Mascotteveld = {
  /** Dezelfde sleutel als het veld bij het sjabloon. */
  sleutel: string;
  label: string;
  hulp: string;
};

export type Mascotteset = {
  /** De `id` van de generator. */
  type: string;
  naam: string;
  velden: Mascotteveld[];
};

/** De drie houdingen die de meeste types delen. */
const DRIELUIK: Mascotteveld[] = [
  {
    sleutel: "vosVangend",
    label: "Vos — bezig",
    hulp: "Te zien terwijl hij iets doet: plaatjes opvangen, blokken neerleggen.",
  },
  {
    sleutel: "vosWachtend",
    label: "Vos — wachtend",
    hulp: "Te zien zolang het kind nadenkt.",
  },
  {
    sleutel: "vosBlij",
    label: "Vos — blij",
    hulp: "Te zien na een goed antwoord.",
  },
];

export const MASCOTTESETS: Mascotteset[] = [
  {
    type: "stapstenen",
    naam: "Telrij stapstenen",
    velden: [
      {
        sleutel: "mascotte",
        label: "Vos — staand",
        hulp: "Op de steen waar hij staat te wachten tot het antwoord klopt.",
      },
      {
        sleutel: "mascotteSpringend",
        label: "Vos — springend",
        hulp: "Terwijl hij van steen naar steen springt.",
      },
      {
        sleutel: "mascotteJuichend",
        label: "Vos — juichend",
        hulp: "Aan de overkant, als alles goed is.",
      },
    ],
  },
  {
    type: "plaatjestellen",
    naam: "Plaatjes tellen meerkeuze",
    velden: DRIELUIK,
  },
  {
    type: "blokken",
    naam: "Blokken tientallen en eenheden",
    velden: DRIELUIK,
  },
  {
    type: "straat",
    naam: "Vos' straat (buurgetallen)",
    velden: [
      {
        sleutel: "vosBlij",
        label: "Vos — blij",
        hulp: "In de straat staat hij pas ná een goed antwoord; dan duikt hij onder de huisjes op.",
      },
    ],
  },
  {
    type: "vissen",
    naam: "Vos gaat vissen",
    velden: [
      {
        sleutel: "vosHengel",
        label: "Vos met hengel",
        hulp: "Op de steiger, met de hengel in zijn poten. Het touw wordt in code getekend en hangt aan het puntje van die hengel; staat dat puntje op een nieuwe afbeelding ergens anders, dan hoort het bij het sjabloon bijgesteld te worden.",
      },
    ],
  },
  {
    type: "trein",
    naam: "Vos' trein",
    velden: [
      {
        sleutel: "vosMachinist",
        label: "Vos als machinist",
        hulp: "In het raampje van de locomotief: kop, pet en zwaaiende poot, afgesneden op borsthoogte.",
      },
    ],
  },
  {
    type: "vakken",
    naam: "Welk vak?",
    velden: [
      {
        sleutel: "vosBlij",
        label: "Vos — blij",
        hulp: "Hij komt er pas bij ná een antwoord; tijdens het kiezen staat hij er niet.",
      },
    ],
  },
  {
    type: "bioscoop",
    naam: "Vos in de bioscoop",
    velden: [
      {
        sleutel: "vosWachtend",
        label: "Vos — wachtend",
        hulp: "Met zijn kaartje onder het stoelenveld, terwijl het kind zoekt.",
      },
      {
        sleutel: "vosBlij",
        label: "Vos — blij",
        hulp: "Als hij op de goede stoel zit en de film begint.",
      },
    ],
  },
];

/** De set van één type, of `null` als dat type geen mascotte heeft. */
export function mascottesetVan(type: string): Mascotteset | null {
  return MASCOTTESETS.find((s) => s.type === type) ?? null;
}

/** De opslagsleutel van één plek: apart per type. */
export function mascotteSleutel(type: string, veld: string): string {
  return `mascotte_${type}_${veld}`;
}
