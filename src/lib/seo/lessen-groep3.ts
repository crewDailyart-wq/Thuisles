/**
 * De openbare lespagina's van groep 3: één pagina per les, voor ouders en Google.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit in code staat en niet in de database
 * ---------------------------------------------------------------------------
 * Het zijn teksten óver de lessen (titel, beschrijving, uitleg voor ouders en
 * veelgestelde vragen), geen lesinhoud. Ze staan hier vast, zodat er niets in
 * de database bij komt (HARDE REGEL 2 in CLAUDE.md). De lessen zelf staan in
 * `components/les/lessen`; de id's hieronder zijn dezelfde als daar en in
 * `lib/lessen/catalogus.ts`.
 *
 * Bron: LESSENPLAN.md, § 2 (per les "Leert", "Doet" en "SEO") en § 1
 * ("De leerroute") voor de volgorde. De teksten zijn in eigen woorden.
 *
 * Alleen gewone gegevens en rekenwerk, geen database en geen React. Daardoor
 * kan dit bestand overal gebruikt worden: de openbare pagina, de sitemap en de
 * kop van het lesscherm.
 *
 * ---------------------------------------------------------------------------
 * Het adres
 * ---------------------------------------------------------------------------
 * `/groep-3/<domein>/<subdomein>/<les>`, één niveau onder de bestaande
 * onderwerppagina (zie LESSENPLAN.md § 6). De lessen zijn alleen in het
 * Nederlands geschreven; een adres met een taal ervoor stuurt door naar het
 * Nederlandse adres.
 */

export type Lessoort = "les" | "flits" | "instaptoets" | "eindtoets";

export type Veelgesteld = { vraag: string; antwoord: string };

export type SeoLes = {
  /** Dezelfde id als het draaiboek in `components/les/lessen`. */
  id: string;
  /** De code uit LESSENPLAN.md, zoals G1 of O13. */
  code: string;
  /** De naam van de les, zoals ouders hem op de pagina zien. */
  titel: string;
  soort: Lessoort;
  domein: keyof typeof DOMEINEN;
  subdomein: string;
  /** Het laatste stukje van het adres. */
  adresdeel: string;
  /** De SEO-titel uit LESSENPLAN.md, zonder de merknaam. */
  seoTitel: string;
  /** Eén of twee zinnen: de beschrijving bovenaan en in het zoekresultaat. */
  beschrijving: string;
  /** Wat het kind leert, in één zin. Ook `teaches` in de gestructureerde gegevens. */
  leert: string;
  /** Hoe de les gaat, stap voor stap in gewone woorden. */
  stappen: string[];
  /** De vragen die bij deze les horen; de vragen per soort komen er vanzelf bij. */
  vragen: Veelgesteld[];
};

/** De domeinen en onderwerpen zoals ze in de database heten (en dus in het adres). */
export const DOMEINEN = {
  getallen: {
    naam: "Getallen",
    subdomeinen: {
      "tellen-sprongen-tot-en-met-20": "Tellen & sprongen tot en met 20",
      "vergelijken-ordenen": "Vergelijken & ordenen",
      "tientallen-eenheden": "Tientallen & eenheden",
    },
  },
  splitsen: {
    naam: "Splitsen",
    subdomeinen: {
      "splitsen-tot-en-met-20": "Splitsen tot en met 20",
      verdubbelen: "Verdubbelen",
    },
  },
  optellen: {
    naam: "Optellen",
    subdomeinen: {
      "optellen-tot-en-met-20": "Optellen tot en met 20",
      "rekenen-met-tientallen": "Rekenen met tientallen",
    },
  },
  aftrekken: {
    naam: "Aftrekken",
    subdomeinen: { "aftrekken-tot-en-met-20": "Aftrekken tot en met 20" },
  },
  tijd: {
    naam: "Tijd",
    subdomeinen: { "de-wijzerklok": "De wijzerklok" },
  },
  verhaaltjessommen: {
    naam: "Verhaaltjessommen",
    subdomeinen: { "optellen-en-aftrekken": "Optellen en aftrekken" },
  },
} as const;

/** De groep van deze lespagina's. */
export const LESGROEP = 3;

/** Hoe de soort op de pagina heet. */
export const SOORTNAAM: Record<Lessoort, string> = {
  les: "Les",
  flits: "Flitsles",
  instaptoets: "Instaptoets",
  eindtoets: "Eindtoets",
};

// ---------------------------------------------------------------------------
// Vragen die bij elke les van dezelfde soort horen
// ---------------------------------------------------------------------------

const LEZEN: Veelgesteld = {
  vraag: "Moet mijn kind al kunnen lezen?",
  antwoord:
    "Nee. Bliepo zegt elke opdracht hardop. Je kind tikt, sleept of typt een getal; lezen is niet nodig.",
};

const VRAGEN_PER_SOORT: Record<Lessoort, Veelgesteld[]> = {
  les: [
    {
      vraag: "Wat gebeurt er als mijn kind een fout maakt?",
      antwoord:
        "Bliepo zegt nooit 'fout'. Hij vertelt wat hij ziet of geeft een tip, en je kind probeert het opnieuw. Gaat het nog een keer mis, dan doet Bliepo het voor en komt de vraag later in de les terug.",
    },
    LEZEN,
  ],
  flits: [
    {
      vraag: "Is er tijdsdruk?",
      antwoord:
        "Alleen in de race aan het eind, en dan tegen de eigen beste tijd van je kind, niet tegen een ander kind. Eerst oefent je kind rustig.",
    },
    {
      vraag: "Wat gebeurt er bij een fout antwoord?",
      antwoord:
        "De gekozen knop wordt grijs en je kind kiest opnieuw. Er komt geen lange uitleg: bij flitskaarten gaat het om snel weten. De uitleg zit in de andere lessen.",
    },
  ],
  instaptoets: [
    {
      vraag: "Waarom begint het onderwerp met een toets?",
      antwoord:
        "Zo hoeft je kind niet te oefenen wat het al kan. Wat het al weet, wordt meteen afgevinkt. Je kind mag de toets ook overslaan en meteen met de lessen beginnen.",
    },
    {
      vraag: "Wat als mijn kind de toets niet haalt?",
      antwoord:
        "Dat is helemaal niet erg. Weet je kind iets nog niet, dan stopt de toets vriendelijk en begint je kind met de les waarin het wordt uitgelegd.",
    },
  ],
  eindtoets: [
    {
      vraag: "Wanneer doet mijn kind de eindtoets?",
      antwoord:
        "Na de lessen van dit onderwerp. De toets laat zien of je kind het nu zelf kan, zonder hulp.",
    },
    {
      vraag: "Wat als mijn kind de eindtoets niet haalt?",
      antwoord:
        "Dan gaat je kind terug naar de les waar het nog moeite mee heeft. Daarna kan het de eindtoets opnieuw doen.",
    },
  ],
};

/** Alle veelgestelde vragen van een les: eerst die van de les zelf, dan die van de soort. */
export function veelgesteldeVragen(les: SeoLes): Veelgesteld[] {
  return [...les.vragen, ...VRAGEN_PER_SOORT[les.soort]];
}

// ---------------------------------------------------------------------------
// De lessen
// ---------------------------------------------------------------------------

const RACE = "Na de oefenronde volgt een race: zo snel mogelijk tien kaarten goed, tegen de eigen beste tijd.";

export const SEO_LESSEN_GROEP3: SeoLes[] = [
  // ---- Getallen · Tellen & sprongen tot en met 20 --------------------------
  {
    id: "flitsen-tellen-tot-10",
    code: "G1",
    titel: "Stippen tot 10",
    soort: "flits",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "stippen-tot-10",
    seoTitel: "Hoeveelheden tot 10 in één keer zien – groep 3",
    beschrijving:
      "Je kind leert hoeveelheden tot 10 in één oogopslag te zien, zonder te tellen. Met flitskaarten in vaste patronen en een race tegen de eigen tijd.",
    leert: "Een hoeveelheid tot 10 in één oogopslag zien, zonder te tellen.",
    stappen: [
      "Er verschijnt kort een groepje parels in een vast patroon, zoals de stippen op een dobbelsteen.",
      "Je kind kiest het goede getal uit vier keuzes.",
      RACE,
    ],
    vragen: [
      {
        vraag: "Waarom is snel zien beter dan tellen?",
        antwoord:
          "Wie een hoeveelheid in één keer ziet, hoeft niet steeds opnieuw te tellen. Dat maakt optellen en aftrekken later veel makkelijker en sneller.",
      },
      {
        vraag: "Wat zijn vaste patronen?",
        antwoord:
          "Patronen die er steeds hetzelfde uitzien, zoals de stippen op een dobbelsteen of een rijtje van vijf. Je kind leert die vormen herkennen, net zoals je een bekend woord in één keer leest.",
      },
    ],
  },
  {
    id: "tellen-120-instaptoets",
    code: "G2",
    titel: "Instaptoets: tellen",
    soort: "instaptoets",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "instaptoets-tellen",
    seoTitel: "Instaptoets tellen – groep 3",
    beschrijving:
      "Een korte instaptoets tellen voor groep 3: een kleur tellen, een getal vinden tot 50 en doortellen. Wat je kind al kan, wordt meteen afgevinkt.",
    leert: "Laten zien wat je kind al kan met tellen: een kleur tellen, een getal vinden en doortellen.",
    stappen: [
      "Bliepo vraagt eerst: kun je dit al?",
      "Je kind telt de kwallen van één kleur in een rooster.",
      "Daarna zoekt het een getal in een getallenveld tot 50.",
      "Tot slot telt het een paar stappen verder vanaf een getal.",
    ],
    vragen: [
      {
        vraag: "Hoe lang duurt de toets?",
        antwoord: "Maar een paar minuten. De toets heeft vier tot vijf korte vragen.",
      },
    ],
  },
  {
    id: "tellen-120-kleuren-tellen",
    code: "G3",
    titel: "Kleuren tellen",
    soort: "les",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "kleuren-tellen",
    seoTitel: "Tellen tot 10 met kleuren – groep 3",
    beschrijving:
      "Je kind telt visjes van één kleur in een rooster, telt twee kleuren samen en maakt zelf een hoeveelheid. Een les tellen tot 10 voor groep 3.",
    leert: "Tellen tot 10, twee groepjes samen tellen, zelf een hoeveelheid maken en een geheel verdelen.",
    stappen: [
      "In een rooster zwemmen visjes in drie kleuren. Je kind kiest een kleur en telt.",
      "Daarna andersom: van welke kleur zijn er 9?",
      "Je kind telt twee kleuren samen en laat zelf een aantal vakjes oplichten.",
      "Tot slot verdeelt het het hele rooster in groepjes.",
    ],
    vragen: [
      {
        vraag: "Waarom tellen met kleuren?",
        antwoord:
          "Door één kleur te kiezen, moet je kind goed kijken wat het telt en wat niet. Zo leert het niets dubbel te tellen en niets over te slaan.",
      },
      {
        vraag: "Wat doet Bliepo als mijn kind verkeerd telt?",
        antwoord:
          "Bliepo telt samen met je kind na: de nummers verschijnen één voor één in de visjes. Zo ziet je kind zelf waar het misging.",
      },
    ],
  },
  {
    id: "tellen-120-na-tien",
    code: "G4",
    titel: "Tellen van 10 tot 20",
    soort: "les",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "tellen-van-10-tot-20",
    seoTitel: "Getallen van 10 tot 20 – groep 3",
    beschrijving:
      "Je kind leert de getallen van 11 tot en met 20 als 'tien en nog wat'. Met twee schelpen van tien parels en de woorden elf, twaalf en verder.",
    leert: "De getallen 11 tot en met 20 zien als tien en nog wat, en de getalwoorden kennen.",
    stappen: [
      "Je kind vult eerst een schelp met tien parels: dat is 10.",
      "Dan komt er steeds één parel bij in een tweede schelp. Je kind zegt welk getal het nu is.",
      "Het koppelt het getal aan het woord, zoals 11 en elf.",
      "In een spel noemt Bliepo een getal en bouwt je kind het zelf met parels.",
    ],
    vragen: [
      {
        vraag: "Waarom zijn de getallen na 10 lastig?",
        antwoord:
          "De woorden helpen niet mee. Bij elf en twaalf hoor je de tien niet, en bij dertien hoor je eerst de drie. Daardoor schrijven kinderen soms 31 in plaats van 13.",
      },
      {
        vraag: "Hoe helpt de les daarbij?",
        antwoord:
          "Je kind ziet steeds een volle schelp van tien en de losse parels ernaast. Zo leert het dat 13 betekent: één tien en drie losse.",
      },
    ],
  },
  {
    id: "tellen-120-getallen-schrijven",
    code: "G4b",
    titel: "Getallen tot 20 schrijven",
    soort: "les",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "getallen-tot-20-schrijven",
    seoTitel: "Getallen tot 20 schrijven – groep 3",
    beschrijving:
      "Je kind telt de parels in een strook van tien, kiest het goede cijfer en schrijft het daarna zelf, met een spoor dat steeds minder helpt.",
    leert: "Een hoeveelheid tot 20 tellen, het cijfer kiezen en het cijfer zelf schrijven.",
    stappen: [
      "Je kind telt de gevulde plekken in een strook van tien en tikt het cijfer dat erbij hoort.",
      "Daarna schrijft het dat cijfer zelf, beginnend bij een groene stip.",
      "Eerst volgt het een stippellijn, later alleen een stip en een pijltje.",
      "Bij de getallen boven de 10 schrijft het eerst het cijfer voor de volle strook en dan het cijfer voor de losse.",
    ],
    vragen: [
      {
        vraag: "Hoe schrijft mijn kind op het scherm?",
        antwoord:
          "Je kind schrijft met de vinger over het scherm, of met de muis. Het cijfer kiezen kan ook door het gewoon te typen.",
      },
      {
        vraag: "Waarom begint het schrijven bij een groene stip?",
        antwoord:
          "Zo leert je kind waar een cijfer begint en welke kant het op gaat, net als op school. Dat helpt om cijfers niet in spiegelbeeld te schrijven.",
      },
    ],
  },
  {
    id: "tellen-120-doortellen",
    code: "G5",
    titel: "Doortellen",
    soort: "les",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "doortellen",
    seoTitel: "Doortellen tot 50 – groep 3",
    beschrijving:
      "Je kind zoekt getallen in een getallenveld tot 50, zegt hoe ze heten en telt verder vanaf een getal. Een les doortellen voor groep 3.",
    leert: "Een getal vinden en benoemen in een getallenveld tot 50, en doortellen vanaf een getal.",
    stappen: [
      "Je kind zoekt een getal in een veld met de getallen 1 tot 20, later tot 50.",
      "Bliepo wijst een getal aan en je kind zegt welk getal het is.",
      "Daarna begint je kind bij een getal en telt het een paar stappen verder.",
      "Halverwege kiest je kind zelf of het moeilijker wil of nog even zo doorgaat.",
    ],
    vragen: [
      {
        vraag: "Wat is doortellen?",
        antwoord:
          "Verder tellen vanaf een getal, zonder opnieuw bij 1 te beginnen. Bij '23 en 3 verder' tel je: 24, 25, 26.",
      },
      {
        vraag: "Mijn kind telt het eerste getal mee. Is dat erg?",
        antwoord:
          "Dat is een heel gewone fout. Bliepo vraagt dan: wat was het eerste getal dat je telde? Zo ontdekt je kind zelf dat je bij het volgende getal begint.",
      },
    ],
  },
  {
    id: "tellen-120-eindtoets",
    code: "G6",
    titel: "Eindtoets: tellen",
    soort: "eindtoets",
    domein: "getallen",
    subdomein: "tellen-sprongen-tot-en-met-20",
    adresdeel: "eindtoets-tellen",
    seoTitel: "Eindtoets tellen – groep 3",
    beschrijving:
      "De eindtoets tellen voor groep 3: een kleur tellen, een getal vinden en doortellen. Zo zie je of je kind het nu zelf kan.",
    leert: "Laten zien dat je kind kan tellen, een getal kan vinden tot 50 en kan doortellen.",
    stappen: [
      "Dezelfde soort vragen als in de instaptoets, met andere getallen.",
      "Je kind telt een kleur, zoekt een getal en telt door.",
      "Aan het eind hoort je kind hoe het ging.",
    ],
    vragen: [
      {
        vraag: "Hoe lang duurt de toets?",
        antwoord: "Maar een paar minuten. De toets heeft vier tot vijf korte vragen.",
      },
    ],
  },

  // ---- Getallen · Vergelijken & ordenen ------------------------------------
  {
    id: "vergelijken-instaptoets",
    code: "G7",
    titel: "Instaptoets: vergelijken",
    soort: "instaptoets",
    domein: "getallen",
    subdomein: "vergelijken-ordenen",
    adresdeel: "instaptoets-vergelijken",
    seoTitel: "Instaptoets vergelijken tot 10 – groep 3",
    beschrijving:
      "Een korte instaptoets vergelijken voor groep 3: de grootste groep kiezen, twee groepen gelijk maken en een getal kiezen bij de tekens < en >.",
    leert: "Laten zien wat je kind al kan met vergelijken: de grootste groep, gelijk maken en de tekens < en >.",
    stappen: [
      "Je kind tikt de grootste groep vuurvliegjes aan.",
      "Het maakt twee potjes gelijk, door vuurvliegjes erbij te doen of weg te laten vliegen.",
      "Tot slot kiest het een getal dat past bij een teken, zoals 8 < ?.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Maar een paar minuten. De toets heeft vier korte vragen." }],
  },
  {
    id: "vergelijken-meer-of-minder",
    code: "G8",
    titel: "Meer of minder",
    soort: "les",
    domein: "getallen",
    subdomein: "vergelijken-ordenen",
    adresdeel: "meer-of-minder",
    seoTitel: "Meer of minder: groepen vergelijken – groep 3",
    beschrijving:
      "Je kind vergelijkt twee groepen: welke heeft er meer, hoeveel meer, en hoe maak je ze gelijk? Een les vergelijken tot 10 voor groep 3.",
    leert: "Zien welke groep meer heeft, hoeveel meer, en wat gelijk betekent.",
    stappen: [
      "Je kind ziet twee potjes met vuurvliegjes en tikt het potje met de meeste aan.",
      "Daarna zegt het hoeveel meer dat er zijn.",
      "Bij vuurvliegjes in drie kleuren kijkt het alleen naar één kleur.",
      "Tot slot maakt het de potjes gelijk, door er wat bij te doen of weg te laten vliegen.",
    ],
    vragen: [
      {
        vraag: "Waarom is vergelijken belangrijk?",
        antwoord:
          "Vergelijken is de basis voor aftrekken en voor de tekens < en >. Wie ziet hoeveel meer iets is, ziet eigenlijk al een verschil.",
      },
      {
        vraag: "Wat betekent gelijk maken?",
        antwoord:
          "Twee groepen even groot maken. Je kind kan bij de kleine groep wat bijdoen of bij de grote groep wat weghalen. Allebei is goed.",
      },
    ],
  },
  {
    id: "vergelijken-tekens",
    code: "G9",
    titel: "De tekens =, < en >",
    soort: "les",
    domein: "getallen",
    subdomein: "vergelijken-ordenen",
    adresdeel: "de-tekens-is-kleiner-groter",
    seoTitel: "De tekens =, < en > – groep 3",
    beschrijving:
      "Je kind ontdekt wat de tekens =, < en > betekenen en kiest zelf het goede teken tussen twee groepen. Met een handig hulpje voor de punt van het teken.",
    leert: "De tekens =, < en > lezen en gebruiken.",
    stappen: [
      "Je kind ontdekt de drie tekens door lantaarntjes aan te tikken.",
      "Bij = ziet het twee groepjes die even groot zijn.",
      "Bij < en > helpt een geel stipje: de punt wijst naar de kleinste kant.",
      "Daarna kiest je kind zelf het teken, en maakt het andersom groepen die bij een teken passen.",
    ],
    vragen: [
      {
        vraag: "Hoe onthoudt mijn kind welk teken welk is?",
        antwoord:
          "De punt van het teken wijst altijd naar het kleinste getal. Het gele stipje in de les laat dat zien. Zo hoeft je kind niet uit het hoofd te leren welk teken 'kleiner dan' heet.",
      },
      {
        vraag: "Wat is het verschil tussen < en >?",
        antwoord:
          "3 < 5 lees je als: 3 is kleiner dan 5. En 5 > 3 lees je als: 5 is groter dan 3. Het zegt hetzelfde, alleen andersom.",
      },
    ],
  },
  {
    id: "vergelijken-getallen",
    code: "G10",
    titel: "Getallen vergelijken",
    soort: "les",
    domein: "getallen",
    subdomein: "vergelijken-ordenen",
    adresdeel: "getallen-vergelijken",
    seoTitel: "Getallen vergelijken tot 10 – groep 3",
    beschrijving:
      "Je kind vergelijkt losse getallen tot 10 met de tekens =, < en > en maakt vergelijkingen die niet kloppen zelf goed. Een les voor groep 3.",
    leert: "Getallen tot 10 vergelijken met =, < en >.",
    stappen: [
      "Je kind verandert een getal tot het gelijk is aan een ander getal.",
      "Met het gele stipje zoekt het uit welk getal kleiner is.",
      "Een vergelijking die niet klopt, zoals 8 < 5, maakt je kind zelf goed.",
      "Daarna kiest het zelf het teken. Je kind oefent zo lang als het wil.",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil met de les over groepen vergelijken?",
        antwoord:
          "In die les vergelijkt je kind groepjes die het kan zien. Hier staan alleen de getallen. Je kind moet dus weten hoeveel een getal is, zonder te tellen.",
      },
      {
        vraag: "Wat doet Bliepo als het teken verkeerd staat?",
        antwoord:
          "Hij leest de vergelijking hardop terug, bijvoorbeeld: 5 is meer dan 8? Dan hoort je kind zelf dat het niet klopt.",
      },
    ],
  },
  {
    id: "vergelijken-eindtoets",
    code: "G11",
    titel: "Eindtoets: vergelijken",
    soort: "eindtoets",
    domein: "getallen",
    subdomein: "vergelijken-ordenen",
    adresdeel: "eindtoets-vergelijken",
    seoTitel: "Eindtoets vergelijken tot 10 – groep 3",
    beschrijving:
      "De eindtoets vergelijken voor groep 3: groepen vergelijken, gelijk maken en een getal kiezen bij < en >. Zo zie je of je kind het nu zelf kan.",
    leert: "Laten zien dat je kind groepen en getallen tot 10 kan vergelijken.",
    stappen: [
      "Dezelfde soort vragen als in de instaptoets, met andere getallen.",
      "Je kind kiest de grootste groep, maakt twee groepen gelijk en kiest een getal bij een teken.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Maar een paar minuten. De toets heeft vier korte vragen." }],
  },

  // ---- Getallen · Tientallen & eenheden ------------------------------------
  {
    id: "tientallen-groepjes-van-tien",
    code: "G12",
    titel: "Groepjes van tien",
    soort: "les",
    domein: "getallen",
    subdomein: "tientallen-eenheden",
    adresdeel: "groepjes-van-tien",
    seoTitel: "Tientallen: groepjes van tien – groep 3",
    beschrijving:
      "Je kind ontdekt dat tien losse sterren samen één tiental worden, en telt daarna met tientallen tot 100. Een les tientallen voor groep 3.",
    leert: "Tien losse zijn samen één tiental, en tellen met tientallen tot 100.",
    stappen: [
      "Met een knop zet je kind één voor één sterren aan de hemel. Bliepo telt mee.",
      "Bij de tiende ster kruipen de sterren samen tot één lichtbol: een tiental.",
      "Je kind maakt grotere getallen, eerst 20 en daarna zelfs 100.",
      "Gaat dat met losse sterren te langzaam, dan krijgt je kind een knop die meteen tien sterren geeft.",
    ],
    vragen: [
      {
        vraag: "Waarom leert mijn kind al in groep 3 over tientallen?",
        antwoord:
          "Getallen als 14 en 20 bestaan uit tientallen en losse. Wie snapt dat tien losse samen één tiental zijn, kan later veel makkelijker met grotere getallen rekenen.",
      },
      {
        vraag: "Moet mijn kind al tot 100 kunnen tellen?",
        antwoord: "Nee. Je kind telt hier met tientallen: 10, 20, 30 en zo verder. Dat zijn maar tien stappen tot 100.",
      },
    ],
  },
  {
    id: "tientallen-plek-van-de-tientallen",
    code: "G13",
    titel: "De plek van de tientallen",
    soort: "les",
    domein: "getallen",
    subdomein: "tientallen-eenheden",
    adresdeel: "de-plek-van-de-tientallen",
    seoTitel: "Tientallen en eenheden: de plek van de cijfers – groep 3",
    beschrijving:
      "Je kind leert de cijfers 0 tot en met 9 en ziet dat tien enen samen een tiental worden, met een eigen plek in het getal. Een les voor groep 3.",
    leert: "De cijfers 0 tot en met 9, de nul, en dat tien enen één tiental worden op een eigen plek.",
    stappen: [
      "Je kind laat sterren in een vak vallen. Het cijfer eronder telt mee van 0 tot 9.",
      "De tiende ster past niet meer: er komt een tweede vak bij, voor de tientallen.",
      "Je kind sleept tussen de vakken: tien enen worden één tiental, en andersom.",
      "Daarna zegt het welk cijfer onder elk vak staat.",
    ],
    vragen: [
      {
        vraag: "Waarom is de nul zo belangrijk?",
        antwoord:
          "De nul laat zien dat een plek leeg is. In 10 betekent de 0: één tiental en geen losse. Zonder nul kun je 1 en 10 niet uit elkaar houden.",
      },
      {
        vraag: "Wat zijn eenheden?",
        antwoord: "Eenheden zijn de losse, de enen. In 14 staat de 1 voor één tiental en de 4 voor vier eenheden.",
      },
    ],
  },
  {
    id: "optellen-100-tiental-plus-eenheden",
    code: "G14",
    titel: "Tiental plus eenheden",
    soort: "les",
    domein: "getallen",
    subdomein: "tientallen-eenheden",
    adresdeel: "tiental-plus-eenheden",
    seoTitel: "Tiental plus eenheden – groep 3",
    beschrijving:
      "Je kind leert ronde tientallen kennen en ziet dat 30 + 4 gewoon 34 is. Met groepjes sterren en een kaart met tientallen en eenheden.",
    leert: "Ronde tientallen herkennen en een tiental plus eenheden samen nemen, zoals 30 + 4 = 34.",
    stappen: [
      "Je kind ziet drie groepen van tien sterren en zegt welk getal dat is: 30.",
      "Bliepo laat zien wat een rond tiental is, en wat niet.",
      "Je kind doet een klein groepje sterren bij 30 en ziet het trucje: de tientallen blijven staan, de losse komen erachter.",
      "Daarna zet het de getallen in een kaart met een kolom voor de tientallen en een kolom voor de eenheden.",
    ],
    vragen: [
      {
        vraag: "Wat is een rond tiental?",
        antwoord: "Een getal met alleen hele groepen van tien, zoals 10, 20 en 30. Het eindigt altijd op een 0.",
      },
      {
        vraag: "Wat is het trucje bij 30 + 4?",
        antwoord:
          "De 3 van de tientallen blijft staan en de 4 komt op de plek van de 0. Zo wordt 30 + 4 meteen 34, zonder te tellen.",
      },
    ],
  },

  // ---- Splitsen · Splitsen tot en met 20 -----------------------------------
  {
    id: "optellen-tot-10-splitsen",
    code: "S1",
    titel: "Splitsen in delen",
    soort: "les",
    domein: "splitsen",
    subdomein: "splitsen-tot-en-met-20",
    adresdeel: "splitsen-in-delen",
    seoTitel: "Splitsen tot 10 in meer delen – groep 3",
    beschrijving:
      "Je kind splitst een getal tot 10 in twee of meer delen, bijvoorbeeld 7 = 3 + 2 + 2, en controleert met parels welke sommen kloppen.",
    leert: "Een getal tot 10 splitsen in twee of meer delen.",
    stappen: [
      "Je kind krijgt zeven parels en ontdekt hoe je ze uit elkaar haalt en weer samenvoegt.",
      "Bliepo laat een paar sommen zien. Je kind kiest welke je met 7 kunt maken.",
      "Lukt dat nog niet, dan bouwt het de som stap voor stap na met de parels.",
      "Tot slot een paar controlevragen: welke som past wel, en welke niet?",
    ],
    vragen: [
      {
        vraag: "Waarom is splitsen belangrijk?",
        antwoord:
          "Splitsen is een van de belangrijkste dingen in groep 3. Wie weet dat 7 bestaat uit 5 en 2, kan straks veel sneller optellen en aftrekken, ook over de 10 heen.",
      },
      {
        vraag: "Is 7 = 3 + 2 + 2 niet te moeilijk?",
        antwoord:
          "Nee. Je kind schuift echte parels in groepjes en ziet zelf dat het er samen nog steeds zeven zijn. De som komt pas daarna.",
      },
    ],
  },
  {
    id: "optellen-100-splitsen",
    code: "S2",
    titel: "Splitsen met de splitsmachine",
    soort: "les",
    domein: "splitsen",
    subdomein: "splitsen-tot-en-met-20",
    adresdeel: "splitsen-met-de-splitsmachine",
    seoTitel: "Getallen splitsen – groep 3",
    beschrijving:
      "Je kind leert wat samenstellen en splitsen betekent, en splitst 5, 7 en 12 op verschillende manieren met de splitsmachine. Een les voor groep 3.",
    leert: "De woorden samenstellen en splitsen, en een getal op verschillende manieren in twee delen splitsen.",
    stappen: [
      "Bliepo legt uit: samenstellen is bouwen uit kleine delen, splitsen is uit elkaar halen.",
      "Een tegel van vijf valt uiteen in vijf losse parels.",
      "Met de splitsmachine verdeelt je kind een getal: bovenaan het totaal, onderaan de twee delen.",
      "Elke manier die je kind vindt, komt in een lijstje. Aan het eind kiest het zelf: nog zo een, of een groter getal zoals 12.",
    ],
    vragen: [
      {
        vraag: "Wat is een splitsmachine?",
        antwoord:
          "Een plaatje met bovenaan het hele getal en onderaan twee vakjes voor de delen. Op school heet zoiets vaak een splitsing of splitshuisje.",
      },
      {
        vraag: "Hoeveel manieren zijn er om 7 te splitsen?",
        antwoord:
          "In twee delen: 0 en 7, 1 en 6, 2 en 5, 3 en 4, en dezelfde andersom. Je kind ontdekt ze één voor één en ziet ze in een lijstje staan.",
      },
    ],
  },
  {
    id: "flitsen-maak-10",
    code: "S3",
    titel: "Maak 10",
    soort: "flits",
    domein: "splitsen",
    subdomein: "splitsen-tot-en-met-20",
    adresdeel: "maak-10",
    seoTitel: "Aanvullen tot 10 – groep 3",
    beschrijving:
      "Snel weten hoeveel er nog bij moet om 10 te maken, zoals 7 + ? = 10. Flitskaarten voor groep 3, met een race tegen de eigen beste tijd.",
    leert: "Snel aanvullen tot 10, zoals 7 + ? = 10.",
    stappen: [
      "Je kind ziet een som met een gat, zoals 7 + ? = 10.",
      "Het kiest het getal dat in het gat past.",
      "Na het antwoord verschijnt het getal in het gat, zodat je kind de hele som ziet.",
      RACE,
    ],
    vragen: [
      {
        vraag: "Waarom is samen 10 zo belangrijk?",
        antwoord:
          "De paartjes die samen 10 maken, zoals 7 en 3, heeft je kind straks steeds nodig. Bijvoorbeeld bij 8 + 5: eerst 2 erbij om 10 te maken, en dan nog 3.",
      },
    ],
  },

  // ---- Splitsen · Verdubbelen ----------------------------------------------
  {
    id: "optellen-tot-10-dubbelen",
    code: "S4",
    titel: "Dubbelen",
    soort: "les",
    domein: "splitsen",
    subdomein: "verdubbelen",
    adresdeel: "dubbelen",
    seoTitel: "Dubbelen tot 10 – groep 3",
    beschrijving:
      "Je kind leert wat een dubbel is, rekent dubbelen tot 10 uit en denkt terug: welk getal moet je verdubbelen om 8 te maken?",
    leert: "Wat een dubbel is, dubbelen tot 10, en terugdenken: welk getal verdubbeld geeft 8?",
    stappen: [
      "Bliepo laat twee dezelfde parelplanken zien: de tweede draait om en past precies tegen de eerste.",
      "Je kind zegt wat het dubbele is van 3, en van 4.",
      "Daarna andersom: welk getal moet je verdubbelen om 8 te maken?",
      "Je kind mag planken uitproberen tot het klopt.",
    ],
    vragen: [
      { vraag: "Wat is een dubbel?", antwoord: "Twee keer hetzelfde getal, zoals 4 + 4. Het dubbele van 4 is 8." },
      {
        vraag: "Waarom zijn dubbelen handig?",
        antwoord:
          "Dubbelen zijn makkelijk te onthouden, en je kunt ze gebruiken voor andere sommen. Wie weet dat 6 + 6 = 12, weet ook snel dat 6 + 7 = 13.",
      },
    ],
  },
  {
    id: "flitsen-dubbelen",
    code: "S5",
    titel: "Dubbelen tot 20",
    soort: "flits",
    domein: "splitsen",
    subdomein: "verdubbelen",
    adresdeel: "dubbelen-tot-20",
    seoTitel: "Dubbelen tot 20 – groep 3",
    beschrijving:
      "Flitskaarten met de dubbelen van 1 + 1 tot 10 + 10. Je kind leert ze snel en zeker te weten, met een race tegen de eigen beste tijd.",
    leert: "De dubbelen van 1 + 1 tot en met 10 + 10 snel weten.",
    stappen: [
      "Je kind ziet een dubbele som, zoals 7 + 7, met twee gelijke schelpen ernaast.",
      "Het kiest het goede antwoord uit vier keuzes.",
      RACE,
    ],
    vragen: [
      {
        vraag: "Moet mijn kind de dubbelen uit het hoofd kennen?",
        antwoord:
          "Ja, dat is het doel van deze flitskaarten. Wie de dubbelen meteen weet, kan ze gebruiken voor sommen als 7 + 8.",
      },
    ],
  },

  // ---- Optellen · Optellen tot en met 20 -----------------------------------
  {
    id: "optellen-tot-10-instaptoets",
    code: "O1",
    titel: "Instaptoets: optellen tot 10",
    soort: "instaptoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "instaptoets-optellen-tot-10",
    seoTitel: "Instaptoets optellen tot 10 – groep 3",
    beschrijving:
      "Een korte instaptoets optellen tot 10 voor groep 3: getallen herkennen, twee getallen samen nemen, dubbelen en aanvullen tot 10.",
    leert: "Laten zien wat je kind al kan met optellen tot 10.",
    stappen: [
      "Je kind legt een parelplank neer en zegt welk getal het is.",
      "Daarna neemt het twee planken samen en maakt het een som zoals 4 + 2.",
      "Er komen ook een dubbel, een som om na te kijken en een som met een gat erin.",
    ],
    vragen: [
      {
        vraag: "Hoe lang duurt de toets?",
        antwoord: "Een paar minuten. De toets heeft zeven korte vragen; bij de eerste vragen mag je kind de parelplanken gebruiken.",
      },
    ],
  },
  {
    id: "optellen-onder-10",
    code: "O2",
    titel: "Optellen onder de 10",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "optellen-onder-de-10",
    seoTitel: "Optellen onder de 10 – groep 3",
    beschrijving:
      "Je kind telt twee getallen op tot 10, maakt samen 10 en leert dat 3 + 7 hetzelfde is als 7 + 3. Met parelplanken die in elkaar passen.",
    leert: "Twee getallen samen nemen tot 10, samen 10 maken, de som opschrijven en omwisselen.",
    stappen: [
      "Je kind kiest een parelplank en zegt welk getal het is.",
      "Het legt twee planken samen en zegt hoeveel het samen is.",
      "Daarna zoekt het een plank zodat het samen 10 wordt, en kiest het de som die erbij hoort.",
      "Tot slot draait de toren om: 3 + 7 wordt 7 + 3, en het is nog steeds evenveel.",
    ],
    vragen: [
      {
        vraag: "Wat zijn parelplanken?",
        antwoord:
          "Planken met parels in twee rijen. Elk getal van 1 tot 10 heeft een eigen plank en kleur. Twee planken die samen 10 zijn, passen precies in elkaar.",
      },
      {
        vraag: "Waarom omwisselen?",
        antwoord:
          "Wie weet dat 3 + 7 hetzelfde is als 7 + 3, kan altijd met het grootste getal beginnen. Dat scheelt veel tellen.",
      },
    ],
  },
  {
    id: "optellen-tot-10-klopt-de-som",
    code: "O3",
    titel: "Klopt de som?",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "klopt-de-som",
    seoTitel: "Klopt de som? Waar of niet waar – groep 3",
    beschrijving:
      "Je kind leert de woorden waar en niet waar, kijkt na of een som klopt en maakt hem zelf goed. Een les optellen voor groep 3.",
    leert: "Nagaan of een som klopt, en een som die niet klopt zelf goed maken.",
    stappen: [
      "Bliepo zegt iets over een plank. Je kind kiest: waar of niet waar.",
      "Dan staat er een som, zoals 3 + 2 = 6. Je kind legt de planken naast elkaar en ziet of ze even groot zijn.",
      "Klopt het niet, dan legt je kind er een plank bij en verandert de som mee.",
      "Daarna een paar snelle sommen, en je kind kiest: nog zo een, of moeilijker.",
    ],
    vragen: [
      {
        vraag: "Waarom zelf een som nakijken?",
        antwoord:
          "Wie een som kan nakijken, snapt wat het =-teken betekent: links en rechts zijn evenveel. Dat is belangrijker dan alleen een antwoord opschrijven.",
      },
      {
        vraag: "Wat betekent waar of niet waar?",
        antwoord:
          "Waar betekent: het klopt. Niet waar betekent: het klopt niet. Je kind leert die woorden eerst met een plank en daarna met een som.",
      },
    ],
  },
  {
    id: "optellen-tot-10-ontbrekend-getal",
    code: "O4",
    titel: "Het ontbrekende getal",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "het-ontbrekende-getal",
    seoTitel: "Het ontbrekende getal tot 10 – groep 3",
    beschrijving:
      "Je kind lost sommen met een gat op, zoals 3 + ? = 7. Eerst met parelplanken, daarna zonder. Een les optellen tot 10 voor groep 3.",
    leert: "Sommen met een gat oplossen, zoals 3 + ? = 7.",
    stappen: [
      "Je kind zegt welk getal een plank is, bijvoorbeeld 7.",
      "Het legt een kleinere plank op de 7 en kiest welke som het gemaakt heeft: 3 + ? = 7.",
      "Dan sleept het de plank die het gat precies vult.",
      "Tot slot een som zonder planken. Je kind kiest zelf of het een makkelijke of een moeilijke wil.",
    ],
    vragen: [
      {
        vraag: "Waarom zijn sommen met een gat moeilijker?",
        antwoord:
          "Bij een gewone som tel je op. Bij een gat moet je bedenken wat er nog bij moet. Dat is eigenlijk al een beetje aftrekken.",
      },
      {
        vraag: "Hoe helpen de planken?",
        antwoord: "Je kind ziet het lege stukje dat nog over is. De plank die daar precies in past, is het antwoord.",
      },
    ],
  },
  {
    id: "optellen-tot-10-drie-getallen",
    code: "O5",
    titel: "Drie getallen optellen",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "drie-getallen-optellen",
    seoTitel: "Drie getallen optellen tot 10 – groep 3",
    beschrijving:
      "Je kind telt drie getallen op tot 10. Eerst met een toren van parelplanken, dan door een vorm te vullen en tot slot met alleen de som.",
    leert: "Drie getallen optellen tot 10.",
    stappen: [
      "Je kind ziet een toren van drie planken en typt de som die erbij hoort.",
      "Daarna vult het een lege vorm met drie planken en schrijft het de som op.",
      "Tot slot maakt het snelle sommen met alleen een vorm en drie vakjes.",
    ],
    vragen: [
      {
        vraag: "Waarom drie getallen optellen?",
        antwoord:
          "Je kind leert dat je stap voor stap kunt optellen: eerst twee getallen, dan het derde erbij. Dat helpt later bij grotere sommen.",
      },
      {
        vraag: "Maakt de volgorde uit?",
        antwoord:
          "Nee, het antwoord blijft hetzelfde. Wel is het slim om eerst twee getallen te nemen die makkelijk samengaan, zoals 2 en 3.",
      },
    ],
  },
  {
    id: "optellen-tot-10-eindtoets",
    code: "O6",
    titel: "Eindtoets: optellen tot 10",
    soort: "eindtoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "eindtoets-optellen-tot-10",
    seoTitel: "Eindtoets optellen tot 10 – groep 3",
    beschrijving:
      "De eindtoets optellen tot 10 voor groep 3: getallen herkennen, twee getallen samen nemen, dubbelen en aanvullen tot 10.",
    leert: "Laten zien dat je kind kan optellen tot 10.",
    stappen: [
      "Dezelfde soort vragen als in de instaptoets, met andere getallen.",
      "Is een antwoord niet goed, dan krijgt je kind de som als vraag terug en mag het het nog een keer proberen.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Een paar minuten. De toets heeft zes tot zeven korte vragen." }],
  },
  {
    id: "flitsen-plus-tot-5",
    code: "O7",
    titel: "Plussommen tot 5",
    soort: "flits",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "plussommen-tot-5",
    seoTitel: "Plussommen tot 5 – groep 3",
    beschrijving:
      "Flitskaarten met plussommen tot 5 voor groep 3. Je kind oefent eerst rustig en doet daarna een race tegen de eigen beste tijd.",
    leert: "Plussommen tot 5 snel weten.",
    stappen: [
      "Er verschijnt een plussom in een bubbel, zoals 2 + 3.",
      "Je kind kiest het antwoord uit vier getallen die dicht bij elkaar liggen.",
      RACE,
    ],
    vragen: [
      {
        vraag: "Waarom eerst tot 5?",
        antwoord:
          "Sommen tot 5 kan je kind vaak al zien op de vingers van één hand. Wie die snel weet, heeft een goede basis voor de sommen tot 10.",
      },
    ],
  },
  {
    id: "flitsen-plus-tot-10",
    code: "O8",
    titel: "Plussommen tot 10",
    soort: "flits",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "plussommen-tot-10",
    seoTitel: "Plussommen tot 10 – groep 3",
    beschrijving:
      "Flitskaarten met plussommen tot 10 voor groep 3. Eerst een oefenronde, daarna een race tegen de eigen beste tijd.",
    leert: "Plussommen tot 10 snel weten.",
    stappen: [
      "Er verschijnt een plussom in een bubbel, zoals 4 + 5.",
      "Je kind kiest het antwoord uit vier getallen die dicht bij elkaar liggen.",
      RACE,
    ],
    vragen: [
      {
        vraag: "Hoe vaak moet mijn kind dit oefenen?",
        antwoord:
          "Kort en vaak werkt het best, bijvoorbeeld een paar keer per week een ronde. Je kind ziet zelf dat zijn tijd beter wordt.",
      },
    ],
  },
  {
    id: "flitsen-instaptoets",
    code: "O9",
    titel: "Instaptoets: flitskaarten",
    soort: "instaptoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "instaptoets-flitskaarten",
    seoTitel: "Flitstoets rekenen tot 10 – groep 3",
    beschrijving:
      "Een snelle flitstoets voor groep 3 met gemengde kaarten: stippen tellen, plus en min tot 10 en aanvullen tot 10. Zo zie je wat je kind al vlot kan.",
    leert: "Laten zien welke sommen tot 10 je kind al snel weet.",
    stappen: [
      "Je kind mag eerst oefenen, zo lang als het wil.",
      "Daarna krijgt het gemengde flitskaarten: stippen, plussommen, minsommen en aanvullen tot 10.",
      "Het kiest steeds zo snel mogelijk het goede antwoord.",
    ],
    vragen: [
      {
        vraag: "Wat wordt er getoetst?",
        antwoord: "Of je kind de sommen tot 10 snel weet, zonder te tellen. Het gaat om vlot zijn, niet alleen om goed.",
      },
    ],
  },
  {
    id: "flitsen-eindtoets",
    code: "O10",
    titel: "Eindtoets: flitskaarten",
    soort: "eindtoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "eindtoets-flitskaarten",
    seoTitel: "Flitsrace rekenen tot 10 – groep 3",
    beschrijving:
      "De flitsrace rekenen tot 10 voor groep 3: gemengde flitskaarten, met als doel de eigen beste tijd te verbeteren.",
    leert: "Laten zien dat je kind de sommen tot 10 snel en zeker weet.",
    stappen: [
      "Dezelfde race als in de instaptoets, met gemengde kaarten.",
      "Je kind probeert zijn eigen beste tijd te verbeteren.",
      "Gaat het nog niet snel genoeg, dan zegt Bliepo vriendelijk dat het genoeg is voor vandaag.",
    ],
    vragen: [
      {
        vraag: "Wat als mijn kind niet sneller wordt?",
        antwoord: "Dat geeft niets. Je kind oefent nog eens met de flitskaarten en probeert het een andere dag opnieuw.",
      },
    ],
  },
  {
    id: "optellen-20-instaptoets",
    code: "O11",
    titel: "Instaptoets: optellen tot 20",
    soort: "instaptoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "instaptoets-optellen-tot-20",
    seoTitel: "Instaptoets optellen tot 20 – groep 3",
    beschrijving:
      "Een korte instaptoets optellen tot 20 voor groep 3: een plank van tien herkennen en sommen als 10 + 6 en 10 + 7.",
    leert: "Laten zien of je kind al sommen als 10 + 6 kan.",
    stappen: [
      "Je kind herkent een plank van tien.",
      "Daarna maakt het sommen als 10 + 6 en 10 + 7, met steeds vier keuzes.",
      "Daarna gaat het verder met de les Optellen bij 10.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Maar een paar minuten. De toets heeft vier korte vragen." }],
  },
  {
    id: "optellen-20-bij-10",
    code: "O12",
    titel: "Optellen bij 10",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "optellen-bij-10",
    seoTitel: "Optellen bij 10 tot 20 – groep 3",
    beschrijving:
      "Je kind leert sommen als 10 + 5 en 10 + 7, met een plank van tien en een losse plank. Een les optellen tot 20 voor groep 3.",
    leert: "Optellen bij 10, zoals 10 + 6 = 16.",
    stappen: [
      "Je kind sleept zelf een plank van tien en een andere plank naast elkaar.",
      "Bliepo wisselt steeds de tweede plank en vraagt hoeveel het samen is.",
      "Elke keer stelt hij de vraag een beetje anders, zodat je kind goed moet luisteren.",
    ],
    vragen: [
      {
        vraag: "Waarom is 10 + 6 makkelijk?",
        antwoord:
          "Bij 10 + 6 hoef je niet te tellen: je zegt gewoon zestien. Wie dat doorheeft, ziet de getallen tot 20 als tien en nog wat.",
      },
      {
        vraag: "Wat komt hierna?",
        antwoord:
          "Daarna leert je kind optellen over de 10 heen, zoals 9 + 4. Dan helpt het om eerst tot 10 aan te vullen.",
      },
    ],
  },
  {
    id: "optellen-20-over-de-10",
    code: "O13",
    titel: "Over de 10 heen",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "over-de-10-heen",
    seoTitel: "Optellen over de 10 – groep 3",
    beschrijving:
      "Je kind leert optellen over de 10 heen, zoals 9 + 4, door te vergelijken met een plank van 10. Een les optellen tot 20 voor groep 3.",
    leert: "Optellen over het tiental, door te zien dat 9 + 4 evenveel is als 10 + 3.",
    stappen: [
      "Je kind kiest twee planken die samen meer dan 10 zijn, zoals 9 en 4.",
      "Bliepo legt er een plank van 10 onder.",
      "Je kind legt een plank bij de 10, zodat het evenveel is: 10 + 3.",
      "Daarna volgen sommen als 8 + 7 en 9 + 5, steeds met een 10 eronder.",
    ],
    vragen: [
      {
        vraag: "Waarom is over de 10 zo lastig?",
        antwoord:
          "Bij 9 + 4 heb je niet genoeg vingers meer. Je kind leert daarom een nieuwe manier: eerst tot 10, dan de rest erbij.",
      },
      {
        vraag: "Hoe kan ik thuis helpen?",
        antwoord:
          "Vraag bij een som als 8 + 5: hoeveel moet er bij 8 om 10 te maken? En hoeveel blijft er dan over? Zo oefent je kind dezelfde stap als in de les.",
      },
    ],
  },
  {
    id: "optellen-20-bijna-dubbel",
    code: "O14",
    titel: "Bijna dubbel",
    soort: "les",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "bijna-dubbel",
    seoTitel: "Bijna dubbel: slim optellen tot 20 – groep 3",
    beschrijving:
      "Je kind leert een slim trucje: 6 + 7 is het dubbele van 6 plus één. Met een korte toets vooraf en achteraf, zodat je kind ziet hoeveel sneller het gaat.",
    leert: "Bijna-dubbelen uitrekenen, zoals 6 + 7 = 6 + 6 + 1.",
    stappen: [
      "Je kind begint met drie sommen op tijd.",
      "Bliepo laat het trucje zien: een plank wordt verdubbeld, en er komt één parel bij.",
      "Je kind zoekt welk dubbel helpt bij een som als 6 + 7, en oefent daarna vrij.",
      "Tot slot dezelfde drie sommen nog eens, en je kind ziet het verschil met de eerste keer.",
    ],
    vragen: [
      {
        vraag: "Wat is een bijna-dubbel?",
        antwoord: "Een som met twee getallen die naast elkaar liggen, zoals 6 + 7. Dat is één meer dan 6 + 6.",
      },
      {
        vraag: "Waarom een toets vooraf en achteraf?",
        antwoord: "Zo ziet je kind zelf dat het trucje werkt: de tweede keer gaat het sneller. Dat geeft vertrouwen.",
      },
    ],
  },
  {
    id: "optellen-20-eindtoets",
    code: "O15",
    titel: "Eindtoets: optellen tot 20",
    soort: "eindtoets",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "eindtoets-optellen-tot-20",
    seoTitel: "Eindtoets optellen tot 20 – groep 3",
    beschrijving:
      "De eindtoets optellen tot 20 voor groep 3: optellen bij 10, aanvullen tot 20 en sommen over de 10 heen. Zo zie je of je kind het nu zelf kan.",
    leert: "Laten zien dat je kind kan optellen tot 20, ook over de 10 heen.",
    stappen: [
      "Je kind maakt sommen als 10 + 6, vult aan tot 20 en maakt een som over de 10 heen.",
      "Ook de snelheid telt een beetje mee.",
    ],
    vragen: [
      {
        vraag: "Telt de snelheid mee?",
        antwoord:
          "Een beetje. Wie alles goed heeft maar lang nadenkt, krijgt een vriendelijke tip om het iets sneller te proberen. Er is nooit straf.",
      },
    ],
  },
  {
    id: "flitsen-plus-tot-20",
    code: "O16",
    titel: "Plussommen tot 20",
    soort: "flits",
    domein: "optellen",
    subdomein: "optellen-tot-en-met-20",
    adresdeel: "plussommen-tot-20",
    seoTitel: "Plussommen tot 20 – groep 3",
    beschrijving:
      "Flitskaarten met plussommen tot 20 voor groep 3, ook over de 10 heen. Eerst een oefenronde, daarna een race tegen de eigen beste tijd.",
    leert: "Plussommen tot 20 snel weten.",
    stappen: ["Er verschijnt een plussom tot 20, zoals 8 + 6.", "Je kind kiest het antwoord uit vier keuzes.", RACE],
    vragen: [
      {
        vraag: "Wanneer is mijn kind hier klaar voor?",
        antwoord:
          "Als het de lessen over optellen bij 10, over de 10 heen en bijna dubbel heeft gedaan. Deze flitskaarten maken die sommen snel.",
      },
    ],
  },

  // ---- Optellen · Rekenen met tientallen -----------------------------------
  {
    id: "optellen-100-instaptoets",
    code: "O17",
    titel: "Instaptoets: optellen tot 100",
    soort: "instaptoets",
    domein: "optellen",
    subdomein: "rekenen-met-tientallen",
    adresdeel: "instaptoets-optellen-tot-100",
    seoTitel: "Instaptoets optellen met tientallen – groep 3",
    beschrijving:
      "Een korte instaptoets voor groep 3 over rekenen met tientallen: drie tientallen maken en sommen als 30 + 50 en 30 + 40.",
    leert: "Laten zien of je kind al met hele tientallen kan rekenen.",
    stappen: [
      "Je kind maakt drie tientallen en zegt welk getal dat is.",
      "Daarna maakt het sommen als 30 + 50 en 30 + 40.",
      "Ook hoe lang je kind erover nadenkt, telt mee.",
    ],
    vragen: [
      {
        vraag: "Is optellen tot 100 niet voor groep 4?",
        antwoord:
          "Grote sommen tot 100 wel. Hier gaat het alleen om hele tientallen, zoals 30 + 40. Dat kan al aan het eind van groep 3, omdat het lijkt op 3 + 4.",
      },
    ],
  },
  {
    id: "optellen-100-tientallen-erbij",
    code: "O18",
    titel: "Tientallen erbij",
    soort: "les",
    domein: "optellen",
    subdomein: "rekenen-met-tientallen",
    adresdeel: "tientallen-erbij",
    seoTitel: "Tientallen erbij – groep 3",
    beschrijving:
      "Je kind telt tientallen op, zoals 20 + 10 en 50 + 30, en ziet wat er gebeurt bij 10 + 3. Met lichtbollen van tien sterren. Voor groep 3.",
    leert: "Tientallen optellen, zoals 30 + 20, en een tiental plus losse, zoals 10 + 3.",
    stappen: [
      "Je kind zegt welk getal een paar lichtbollen van tien maken.",
      "Met een plusknop komt er telkens een tiental bij.",
      "Daarna maakt het sommen met de machine als hulp, zoals 10 + 3.",
      "Tot slot een paar sommen uit het hoofd.",
    ],
    vragen: [
      {
        vraag: "Waarom is 30 + 20 makkelijker dan het lijkt?",
        antwoord: "Het is eigenlijk 3 tientallen plus 2 tientallen. Wie 3 + 2 weet, weet ook 30 + 20.",
      },
      {
        vraag: "Wat gebeurt er bij 10 + 3?",
        antwoord: "Er komt geen nieuw tiental bij, maar drie losse. Je kind ziet dat 10 + 3 gewoon dertien is.",
      },
    ],
  },
  {
    id: "optellen-100-aanvullen-tot-tiental",
    code: "O19",
    titel: "Aanvullen tot het tiental",
    soort: "les",
    domein: "optellen",
    subdomein: "rekenen-met-tientallen",
    adresdeel: "aanvullen-tot-het-tiental",
    seoTitel: "Aanvullen tot het volgende tiental – groep 3",
    beschrijving:
      "Je kind leert aanvullen tot het volgende tiental, zoals 17 + 3 = 20, met rijen sterren waarin nog plekken leeg zijn. Voor het eind van groep 3.",
    leert: "Aanvullen tot het volgende tiental, zoals 17 + 3 = 20.",
    stappen: [
      "Je kind ziet rijen van tien sterren en een rij die nog niet vol is.",
      "Het kiest het groepje sterren dat precies de lege plekken vult.",
      "Daarna gaat het verder zonder sterren, zoals 23 + ? = 30, en typt het het getal.",
    ],
    vragen: [
      {
        vraag: "Waarom aanvullen tot een tiental?",
        antwoord:
          "Het is dezelfde stap als samen 10 maken, maar dan bij grotere getallen. Je kind heeft die stap straks nodig bij sommen over het tiental heen.",
      },
      {
        vraag: "Hoe hangt dit samen met samen 10?",
        antwoord: "Bij 17 + 3 kijk je alleen naar de 7: er moet 3 bij om 10 te maken. Wie de paartjes van 10 kent, kan dit snel.",
      },
    ],
  },
  {
    id: "optellen-100-eindtoets",
    code: "O20",
    titel: "Eindtoets: optellen tot 100",
    soort: "eindtoets",
    domein: "optellen",
    subdomein: "rekenen-met-tientallen",
    adresdeel: "eindtoets-optellen-tot-100",
    seoTitel: "Eindtoets optellen met tientallen – groep 3",
    beschrijving:
      "De eindtoets rekenen met tientallen voor groep 3: sommen als 30 + 40 en 70 + 6. Zo zie je of je kind het nu zelf kan.",
    leert: "Laten zien dat je kind tientallen kan optellen en een tiental plus losse kan nemen.",
    stappen: [
      "Je kind maakt sommen uit alle lessen van dit onderwerp, zoals 30 + 40 en 70 + 6.",
      "Voor groep 3 tellen alleen deze sommen mee. Moeilijkere sommen horen bij groep 4.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Maar een paar minuten. De toets heeft maar een paar vragen." }],
  },
  {
    id: "flitsen-tien-erbij-eraf",
    code: "O21",
    titel: "10 erbij, 10 eraf",
    soort: "flits",
    domein: "optellen",
    subdomein: "rekenen-met-tientallen",
    adresdeel: "10-erbij-10-eraf",
    seoTitel: "10 erbij en 10 eraf – groep 3",
    beschrijving:
      "Flitskaarten met sommen als 23 + 10 en 70 − 10. Je kind leert snel tien erbij of eraf te doen. Voor het eind van groep 3.",
    leert: "Snel 10 erbij of 10 eraf doen, zoals 23 + 10 en 70 − 10.",
    stappen: ["Er verschijnt een som met 10 erbij of 10 eraf.", "Je kind kiest het antwoord uit vier keuzes.", RACE],
    vragen: [
      {
        vraag: "Wat is het trucje bij 10 erbij?",
        antwoord: "Alleen het cijfer van de tientallen verandert. 23 + 10 wordt 33: de 3 van de losse blijft gewoon staan.",
      },
    ],
  },

  // ---- Aftrekken · Aftrekken tot en met 20 ---------------------------------
  {
    id: "aftrekken-10-instaptoets",
    code: "A1",
    titel: "Instaptoets: aftrekken tot 10",
    soort: "instaptoets",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "instaptoets-aftrekken-tot-10",
    seoTitel: "Instaptoets aftrekken tot 10 – groep 3",
    beschrijving:
      "Een korte instaptoets aftrekken tot 10 voor groep 3: weghalen met vuurvliegjes en het verschil tussen twee lantaarnpalen.",
    leert: "Laten zien wat je kind al kan met aftrekken: weghalen en verschil.",
    stappen: [
      "Je kind laat vuurvliegjes wegvliegen uit een potje en kiest de som die erbij hoort, zoals 9 − 5.",
      "Het zegt hoeveel er over zijn, en hoeveel er nog weg moeten om op 0 te komen.",
      "Daarna vergelijkt het twee lantaarnpalen en zoekt het het verschil.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Een paar minuten. De toets heeft zes korte vragen." }],
  },
  {
    id: "aftrekken-10-stippen-weghalen",
    code: "A2",
    titel: "Stippen weghalen",
    soort: "les",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "stippen-weghalen",
    seoTitel: "Aftrekken als weghalen tot 10 – groep 3",
    beschrijving:
      "Je kind leert aftrekken als weghalen: vuurvliegjes vliegen uit een potje. Het leert het minteken, en dat elk getal min zichzelf 0 is.",
    leert: "Aftrekken als weghalen, het minteken, en dat elk getal min zichzelf 0 is.",
    stappen: [
      "Met een knop komen er vuurvliegjes in een potje, en een teller laat zien hoeveel het er zijn.",
      "Met een andere knop vliegt er eentje weg. Zo ontdekt je kind het verschil tussen erbij en eraf.",
      "Bliepo laat het minteken zien, en je kind maakt sommen als 10 − 4.",
      "Je kind typt de antwoorden zelf in een vakje.",
    ],
    vragen: [
      {
        vraag: "Waarom eerst weghalen?",
        antwoord:
          "Zo begrijpen de meeste kinderen aftrekken voor het eerst: je had er 10, er gaan er 4 weg, hoeveel zijn er nog?",
      },
      {
        vraag: "Waarom is 5 − 5 = 0 belangrijk?",
        antwoord:
          "Veel kinderen vinden nul lastig. Door zelf alle vuurvliegjes weg te laten vliegen, zien ze dat er dan echt niets meer over is.",
      },
    ],
  },
  {
    id: "aftrekken-10-verschil",
    code: "A3",
    titel: "Het verschil",
    soort: "les",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "het-verschil",
    seoTitel: "Het verschil tot 10 – groep 3",
    beschrijving:
      "Je kind ontdekt aftrekken als verschil: twee lantaarnpalen schuiven tegen elkaar, en wat overblijft is het verschil. Een les voor groep 3.",
    leert: "Aftrekken als het verschil tussen twee stapels, en dat een verschil zoeken hetzelfde is als aftrekken.",
    stappen: [
      "Je kind zet lampjes aan op twee lantaarnpalen en maakt ze gelijk.",
      "Een schuif laat de palen tegen elkaar aan gaan: gelijke lampjes gaan uit, de rest blijft branden.",
      "Wat er overblijft, is het verschil. Je kind kiest de som die erbij hoort, zoals 5 − 3 = 2.",
      "Tot slot zoekt het zelf alle paren met hetzelfde verschil.",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil tussen weghalen en verschil?",
        antwoord:
          "Bij weghalen heb je één groep en gaat er iets af. Bij verschil vergelijk je twee groepen: hoeveel meer heeft de ene? In allebei de gevallen is het een minsom.",
      },
      {
        vraag: "Waarom leert mijn kind allebei?",
        antwoord:
          "Sommige sommen zijn makkelijker als weghalen, zoals 9 − 2. Andere juist als verschil, zoals 9 − 7. Wie allebei kent, kan kiezen.",
      },
    ],
  },
  {
    id: "flitsen-min-tot-5",
    code: "A4",
    titel: "Minsommen tot 5",
    soort: "flits",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "minsommen-tot-5",
    seoTitel: "Minsommen tot 5 – groep 3",
    beschrijving:
      "Flitskaarten met minsommen tot 5 voor groep 3. Je kind oefent eerst rustig en doet daarna een race tegen de eigen beste tijd.",
    leert: "Minsommen tot 5 snel weten.",
    stappen: ["Er verschijnt een minsom, zoals 4 − 1.", "Je kind kiest het antwoord uit vier keuzes.", RACE],
    vragen: [{ vraag: "Komt 0 als antwoord voor?", antwoord: "Nee, bij deze flitskaarten niet. Het antwoord is altijd minstens 1." }],
  },
  {
    id: "flitsen-min-tot-10",
    code: "A5",
    titel: "Minsommen tot 10",
    soort: "flits",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "minsommen-tot-10",
    seoTitel: "Minsommen tot 10 – groep 3",
    beschrijving:
      "Flitskaarten met minsommen tot 10 voor groep 3. Eerst een oefenronde, daarna een race tegen de eigen beste tijd.",
    leert: "Minsommen tot 10 snel weten.",
    stappen: ["Er verschijnt een minsom, zoals 9 − 4.", "Je kind kiest het antwoord uit vier keuzes.", RACE],
    vragen: [
      {
        vraag: "Hoe hangen minsommen samen met plussommen?",
        antwoord:
          "Wie weet dat 3 + 7 = 10, weet ook dat 10 − 7 = 3. Daarom helpt het als je kind de plussommen tot 10 al snel weet.",
      },
    ],
  },
  {
    id: "flitsen-min-tot-20",
    code: "A6",
    titel: "Minsommen tot 20",
    soort: "flits",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "minsommen-tot-20",
    seoTitel: "Minsommen tot 20 – groep 3",
    beschrijving:
      "Flitskaarten met minsommen tot 20 voor groep 3, ook over de 10 heen. Eerst een oefenronde, daarna een race tegen de eigen beste tijd.",
    leert: "Minsommen tot 20 snel weten.",
    stappen: ["Er verschijnt een minsom tot 20, zoals 15 − 7.", "Je kind kiest het antwoord uit vier keuzes.", RACE],
    vragen: [
      {
        vraag: "Wanneer is mijn kind hier klaar voor?",
        antwoord:
          "Als de minsommen tot 10 vlot gaan. Sommen als 14 − 4 lijken op 4 − 4; sommen als 13 − 5 gaan over de 10 heen en zijn het moeilijkst.",
      },
    ],
  },
  {
    id: "aftrekken-10-eindtoets",
    code: "A7",
    titel: "Eindtoets: aftrekken tot 10",
    soort: "eindtoets",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "eindtoets-aftrekken-tot-10",
    seoTitel: "Eindtoets aftrekken tot 10 – groep 3",
    beschrijving:
      "De eindtoets aftrekken tot 10 voor groep 3: weghalen en verschil. Zo zie je of je kind het nu zelf kan.",
    leert: "Laten zien dat je kind kan aftrekken tot 10, als weghalen en als verschil.",
    stappen: [
      "Dezelfde soort vragen als in de instaptoets, met andere getallen.",
      "Is een antwoord niet goed, dan legt Bliepo de vraag nog eens uit met de getallen erin, en krijgt je kind nog een kans.",
    ],
    vragen: [{ vraag: "Hoe lang duurt de toets?", antwoord: "Een paar minuten. De toets heeft zes korte vragen." }],
  },
  {
    id: "getallenlijn-sprongen-tellen",
    code: "A8",
    titel: "Verschil: sprongen tellen",
    soort: "les",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "verschil-sprongen-tellen",
    seoTitel: "Verschil op de getallenlijn: sprongen tellen – groep 3",
    beschrijving:
      "Je kind vindt het verschil tussen twee getallen tot 10 door de sprongen te tellen op een getallenlijn. Een les aftrekken voor groep 3.",
    leert: "Het verschil tussen twee getallen tot 10 vinden door de sprongen te tellen op een getallenlijn.",
    stappen: [
      "Je kind tikt twee getallen aan op een lijn van lantaarntjes.",
      "Een vuurvliegje springt van het kleinste naar het grootste getal. Bij elke sprong verschijnt een boogje.",
      "Je kind telt de sprongen en vult het verschil in.",
      "Daarna zoekt het zelf een ander paar met hetzelfde verschil, en speelt het een spelletje van vijf sommen.",
    ],
    vragen: [
      {
        vraag: "Wat is een getallenlijn?",
        antwoord: "Een lijn met de getallen op volgorde, zoals op een liniaal. Je kind ziet zo hoe ver twee getallen uit elkaar liggen.",
      },
      {
        vraag: "Mag mijn kind de uitleg aan het begin overslaan?",
        antwoord: "Ja. Wie de getallenlijn al kent, kan meteen met de sommen beginnen.",
      },
    ],
  },
  {
    id: "getallenlijn-doortellen",
    code: "A9",
    titel: "Verschil: doortellen vanaf het kleinste getal",
    soort: "les",
    domein: "aftrekken",
    subdomein: "aftrekken-tot-en-met-20",
    adresdeel: "verschil-doortellen",
    seoTitel: "Verschil door doortellen – groep 3",
    beschrijving:
      "Je kind vindt het verschil door door te tellen vanaf het kleinste getal: bij 8 − 5 tel je van 5 naar 8. Een les aftrekken voor groep 3.",
    leert: "Het verschil vinden door op te tellen vanaf het kleinste getal, zoals bij 8 − 5: van 5 naar 8.",
    stappen: [
      "Bliepo laat een som zien, zoals 8 − 5, en vraagt: wat kunnen we doen?",
      "Je kind kiest de slimme manier: tellen van 5 tot 8.",
      "Weet je kind het zeker, dan maakt het de stap in één sprong.",
    ],
    vragen: [
      {
        vraag: "Waarom optellen bij een minsom?",
        antwoord:
          "Bij een som als 8 − 5 liggen de getallen dicht bij elkaar. Dan is van 5 naar 8 tellen sneller dan 5 weghalen: 6, 7, 8. Dat zijn er 3.",
      },
      {
        vraag: "Gaat de les verder dan groep 3?",
        antwoord:
          "Het vervolg met grotere getallen hoort bij groep 4. In groep 3 doet je kind alleen het begin, met verschillen tot 10.",
      },
    ],
  },

  // ---- Tijd · De wijzerklok ------------------------------------------------
  {
    id: "klok-urenwijzer",
    code: "T1",
    titel: "De urenwijzer",
    soort: "les",
    domein: "tijd",
    subdomein: "de-wijzerklok",
    adresdeel: "de-urenwijzer",
    seoTitel: "Klokkijken: de urenwijzer – groep 3",
    beschrijving:
      "Je kind leert de getallen op de klok, het verschil tussen de grote en de kleine wijzer, en hele uren lezen en zetten. Klokkijken voor groep 3.",
    leert: "De getallen op de klok, de twee wijzers, en hele uren lezen en zetten.",
    stappen: [
      "Een rij getallen van 1 tot 12 rolt op tot een klok.",
      "Je kind leert dat de lange wijzer de minuten aanwijst en de korte wijzer de uren.",
      "Het zet de urenwijzer zelf en ziet dat de minutenwijzer bij een heel uur op de 12 staat.",
      "Tot slot leest het een paar klokken af.",
    ],
    vragen: [
      {
        vraag: "Waarom begint de les met alleen de urenwijzer?",
        antwoord:
          "De korte wijzer zegt welk uur het is. Wie die eerst goed leert lezen, raakt minder in de war als de lange wijzer erbij komt.",
      },
      {
        vraag: "Is half acht hetzelfde als zeven uur?",
        antwoord:
          "Nee, en dat is een veelgemaakte fout. Bij half acht staat de korte wijzer tussen de 7 en de 8. De les laat dat verschil zien.",
      },
    ],
  },
  {
    id: "klok-hele-uren-zetten",
    code: "T2",
    titel: "Hele uren zetten",
    soort: "les",
    domein: "tijd",
    subdomein: "de-wijzerklok",
    adresdeel: "hele-uren-zetten",
    seoTitel: "Hele uren op de klok zetten – groep 3",
    beschrijving:
      "Een korte les klokkijken voor groep 3: je kind zet de wijzer zelf op een heel uur, zoals 4 uur. Een pijl van licht helpt als het ernaast zit.",
    leert: "De urenwijzer op een heel uur zetten.",
    stappen: [
      "Bliepo vraagt: zet de klok op 4 uur.",
      "Je kind sleept de wijzer naar het goede getal.",
      "Zit het ernaast, dan wijst een pijl van licht de goede kant op.",
    ],
    vragen: [
      {
        vraag: "Waarom zelf de klok zetten?",
        antwoord:
          "Een klok aflezen en zelf zetten zijn twee verschillende dingen. Door zelf te draaien leert je kind ook in welke richting de wijzers gaan.",
      },
    ],
  },
  {
    id: "klok-halve-uren",
    code: "T3",
    titel: "Halve uren",
    soort: "les",
    domein: "tijd",
    subdomein: "de-wijzerklok",
    adresdeel: "halve-uren",
    seoTitel: "Klokkijken: halve uren – groep 3",
    beschrijving:
      "Je kind leert halve uren lezen en zetten: half zes is 5:30. Met een klok waarop de helft oplicht. Klokkijken voor groep 3.",
    leert: "Halve uren lezen en zetten, zoals half zes = 5:30.",
    stappen: [
      "Je kind ziet dat de urenwijzer tussen twee getallen staat, en zegt welk uur eraan komt.",
      "Het ontdekt dat één rondje van de minutenwijzer één uur is.",
      "De helft van de klok licht op: een half rondje is een half uur.",
      "Tot slot leest en zet je kind een paar halve uren.",
    ],
    vragen: [
      {
        vraag: "Waarom is half zes 5:30 en niet 6:30?",
        antwoord:
          "In het Nederlands zeg je half zes als het half op weg is naar zes uur. In andere talen zeg je het vaak andersom. De les vraagt daarom steeds: welk uur komt eraan?",
      },
      {
        vraag: "Hoe kan ik thuis helpen?",
        antwoord:
          "Zeg op vaste momenten hardop hoe laat het is, en wijs de korte wijzer aan: hij staat tussen de 5 en de 6, dus het is half zes.",
      },
    ],
  },
  {
    id: "klok-kwart-over",
    code: "T4",
    titel: "Kwart over",
    soort: "les",
    domein: "tijd",
    subdomein: "de-wijzerklok",
    adresdeel: "kwart-over",
    seoTitel: "Klokkijken: kwart over – groep 3",
    beschrijving:
      "Je kind leert kwart over lezen en zetten: een kwart rondje van de grote wijzer is een kwartier. Klokkijken voor het eind van groep 3.",
    leert: "Een kwart van de klok zien, en kwart over lezen en zetten.",
    stappen: [
      "Een kwart van de klok licht op: de helft van de helft.",
      "Je kind ziet dat een kwart rondje een kwartier is.",
      "De minutenwijzer staat op de 3, en de urenwijzer net voorbij het uur.",
      "Daarna leest en zet je kind een paar keer kwart over.",
    ],
    vragen: [
      {
        vraag: "Hoort kwart over bij groep 3?",
        antwoord: "Het hoort bij het eind van groep 3 of bij groep 4. Daarom komt deze les na de hele en de halve uren.",
      },
      {
        vraag: "Waarom staat de korte wijzer niet precies op het getal?",
        antwoord:
          "Omdat er al een kwartier voorbij is. De korte wijzer schuift langzaam mee naar het volgende uur. Bij kwart over drie staat hij dus net voorbij de 3.",
      },
    ],
  },
  {
    id: "klok-minuten-later",
    code: "T5",
    titel: "5 minuten later",
    soort: "les",
    domein: "tijd",
    subdomein: "de-wijzerklok",
    adresdeel: "5-minuten-later",
    seoTitel: "Tellen met 5 minuten op de klok – groep 3",
    beschrijving:
      "Je kind leert de grote wijzer 5 minuten verder te zetten en met vijven door te tellen op de klok. Klokkijken voor het eind van groep 3.",
    leert: "De minutenwijzer 5 minuten verder zetten en met vijven doortellen binnen het uur.",
    stappen: [
      "Bliepo noemt een tijd, bijvoorbeeld 2:35, en vraagt hoe laat het over 5 minuten is.",
      "Je kind sleept de grote wijzer één getal verder.",
      "Een boog van licht langs de rand telt mee: 0, 5, 10, 15.",
      "Daarna telt je kind verder met vijven.",
    ],
    vragen: [
      {
        vraag: "Waarom is één getal op de klok 5 minuten?",
        antwoord:
          "Tussen twee getallen staan vijf kleine streepjes. Elk streepje is één minuut, dus van getal naar getal is vijf minuten.",
      },
      {
        vraag: "Gaat de les ook over het hele uur heen?",
        antwoord: "Nee, in groep 3 blijft je kind binnen hetzelfde uur. Over het uur heen hoort bij groep 4.",
      },
    ],
  },

  // ---- Verhaaltjessommen · Optellen en aftrekken ---------------------------
  {
    id: "verhaal-instaptoets",
    code: "V1",
    titel: "Instaptoets: verhaaltjessommen",
    soort: "instaptoets",
    domein: "verhaaltjessommen",
    subdomein: "optellen-en-aftrekken",
    adresdeel: "instaptoets-verhaaltjessommen",
    seoTitel: "Instaptoets verhaaltjessommen – groep 3",
    beschrijving:
      "Een korte instaptoets verhaaltjessommen voor groep 3: twee verhaaltjes met een plus- of minsom tot 20, met de naam van je kind erin.",
    leert: "Laten zien of je kind al uit een verhaaltje de goede som kan halen.",
    stappen: [
      "Je kind krijgt een kort verhaaltje met de eigen naam erin.",
      "Bij het eerste verhaal kiest het het antwoord.",
      "Bij het tweede verhaal kiest het eerst de som die bij het verhaal past.",
    ],
    vragen: [
      {
        vraag: "Moet mijn kind goed kunnen lezen?",
        antwoord: "Nee. Bliepo zegt het verhaaltje hardop. Je kind kan meelezen, maar dat hoeft niet.",
      },
    ],
  },
  {
    id: "verhaal-kleine-verhalen",
    code: "V2",
    titel: "Kleine verhaaltjes",
    soort: "les",
    domein: "verhaaltjessommen",
    subdomein: "optellen-en-aftrekken",
    adresdeel: "kleine-verhaaltjes",
    seoTitel: "Verhaaltjessommen tot 10 – groep 3",
    beschrijving:
      "Je kind pluist een kort verhaaltje uit en maakt de som die erbij hoort, tot 10. Daarna speelt het het verhaal na met de plaatjes.",
    leert: "Een verhaaltje tot 10 uitpluizen en de som maken.",
    stappen: [
      "Je kind tikt de getallen in het verhaal aan, en daarna de vraag.",
      "Het zoekt uit: komt er iets bij, of gaat er iets af?",
      "Dan zet het de som in de goede volgorde.",
      "Tot slot speelt je kind het verhaal na, bijvoorbeeld door de vuurvliegjes echt weg te laten vliegen.",
    ],
    vragen: [
      {
        vraag: "Waarom is een verhaaltjessom moeilijker dan een kale som?",
        antwoord:
          "Je kind moet eerst zelf uitzoeken welke som er in het verhaal zit. De les doet dat in vaste stapjes, zodat je kind leert hoe je een verhaal uitpluist.",
      },
      {
        vraag: "Wat zijn signaalwoorden?",
        antwoord:
          "Woorden die laten zien of er iets bij komt of af gaat, zoals erbij, weg of over. Je kind leert ze in het verhaal aan te tikken.",
      },
    ],
  },
  {
    id: "verhaal-grote-verhalen",
    code: "V3",
    titel: "Grotere verhaaltjes",
    soort: "les",
    domein: "verhaaltjessommen",
    subdomein: "optellen-en-aftrekken",
    adresdeel: "grotere-verhaaltjes",
    seoTitel: "Verhaaltjessommen tot 20 – groep 3",
    beschrijving:
      "Verhaaltjessommen tot 20 voor groep 3, ook over de 10 heen. Bij elk verhaal krijgt je kind een beetje minder hulp, tot het het zelf kan.",
    leert: "Verhaaltjes tot 20 uitpluizen en de som maken, ook over het tiental.",
    stappen: [
      "Bij de eerste twee verhalen doorloopt je kind alle stapjes, net als bij de kleine verhaaltjes.",
      "Bij de volgende verhalen kiest het meteen welke som past.",
      "De getallen gaan tot 20, soms over de 10 heen.",
    ],
    vragen: [
      {
        vraag: "Waarom wordt de hulp steeds minder?",
        antwoord:
          "Zo leert je kind de stapjes eerst goed kennen, en daarna zelf te gebruiken. Het doel is dat je kind een verhaaltje zelf kan uitpluizen.",
      },
      {
        vraag: "Wanneer is mijn kind hier klaar voor?",
        antwoord: "Als de kleine verhaaltjes goed gaan en je kind al een beetje kan optellen en aftrekken tot 20.",
      },
    ],
  },
  {
    id: "verhaal-verstopte-getallen",
    code: "V4",
    titel: "Verstopte getallen",
    soort: "les",
    domein: "verhaaltjessommen",
    subdomein: "optellen-en-aftrekken",
    adresdeel: "verstopte-getallen",
    seoTitel: "Verhaaltjessommen met een verstopt getal – groep 3",
    beschrijving:
      "Verhaaltjes waarin het begin of de verandering onbekend is, zoals ? + 5 = 9. Je kind zet de som in de volgorde van het verhaal.",
    leert: "Verhaaltjes oplossen waarin het begin of de verandering onbekend is, zoals ? + 5 = 9.",
    stappen: [
      "Onderin staan vier lege vakjes die zich met de som vullen.",
      "Bliepo vraagt bijvoorbeeld: met hoeveel bloemen begonnen we? Je kind kan antwoorden: dat weten we nog niet.",
      "Dan komt er een vraagteken in het eerste vakje.",
      "Na het antwoord kijkt je kind het na met de plaatjes.",
    ],
    vragen: [
      {
        vraag: "Wat is een verstopt getal?",
        antwoord: "Een getal uit het verhaal dat je nog niet weet, zoals hoeveel bloemen er eerst waren. In de som staat daar een vraagteken.",
      },
      {
        vraag: "Waarom de som in de volgorde van het verhaal?",
        antwoord: "Zo blijft de som bij het verhaal passen. Je kind leert dat het vraagteken overal kan staan, ook vooraan.",
      },
    ],
  },
  {
    id: "verhaal-eindtoets",
    code: "V5",
    titel: "Eindtoets: verhaaltjessommen",
    soort: "eindtoets",
    domein: "verhaaltjessommen",
    subdomein: "optellen-en-aftrekken",
    adresdeel: "eindtoets-verhaaltjessommen",
    seoTitel: "Eindtoets verhaaltjessommen – groep 3",
    beschrijving:
      "De eindtoets verhaaltjessommen voor groep 3: twee verhaaltjes met een plus- of minsom tot 20. Zo zie je of je kind een verhaal zelf kan uitpluizen.",
    leert: "Laten zien dat je kind uit een verhaaltje de goede som kan halen en uitrekenen.",
    stappen: [
      "Dezelfde soort verhaaltjes als in de instaptoets, met andere getallen.",
      "Bij het tweede verhaal kiest je kind eerst de som die past.",
    ],
    vragen: [
      {
        vraag: "Moet mijn kind goed kunnen lezen?",
        antwoord: "Nee. Bliepo zegt het verhaaltje hardop. Je kind kan meelezen, maar dat hoeft niet.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// De leerroute: de volgorde waarin een kind de lessen speelt (LESSENPLAN.md § 1)
// ---------------------------------------------------------------------------

export const LEERROUTE_GROEP3: string[] = [
  /* Oceaan */
  "G1", "G2", "G3", "O1", "O2", "O3", "O4", "O5", "S1", "S3", "S4", "O7", "O8", "O6", "O9", "O10",
  "G4", "G4b", "G5", "G6", "S2", "S5", "O11", "O12", "O13", "O14",
  /* Aarde */
  "O15", "O16", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9",
  "G7", "G8", "G9", "G10", "G11", "V1", "V2", "V3", "V4", "V5",
  /* Universum */
  "T1", "T2", "T3", "T4", "T5", "G12", "G13", "G14", "O17", "O18", "O19", "O20", "O21",
];

/** De lessen in de volgorde van de leerroute. */
export function lessenOpRoute(): SeoLes[] {
  return LEERROUTE_GROEP3.map((code) => {
    const les = SEO_LESSEN_GROEP3.find((l) => l.code === code);
    if (!les) throw new Error(`Les ${code} staat in de leerroute maar niet in de lijst.`);
    return les;
  });
}

// ---------------------------------------------------------------------------
// Opzoeken en adressen
// ---------------------------------------------------------------------------

export function domeinnaam(les: SeoLes): string {
  return DOMEINEN[les.domein].naam;
}

export function subdomeinnaam(les: SeoLes): string {
  return (DOMEINEN[les.domein].subdomeinen as Record<string, string>)[les.subdomein] ?? les.subdomein;
}

/** Het Nederlandse adres van de lespagina. */
export function lesAdres(les: SeoLes): string {
  return `/groep-${LESGROEP}/${les.domein}/${les.subdomein}/${les.adresdeel}`;
}

/** De les bij een adres (groep, domein, subdomein, les), of null. */
export function zoekSeoLes(
  groep: number,
  domein: string,
  subdomein: string,
  adresdeel: string,
): SeoLes | null {
  if (groep !== LESGROEP) return null;
  return (
    SEO_LESSEN_GROEP3.find(
      (l) => l.domein === domein && l.subdomein === subdomein && l.adresdeel === adresdeel,
    ) ?? null
  );
}

/** De les bij een draaiboek-id, of null. Voor de kop van het lesscherm. */
export function zoekSeoLesOpId(id: string): SeoLes | null {
  return SEO_LESSEN_GROEP3.find((l) => l.id === id) ?? null;
}

/** De lessen van één onderwerp, in de volgorde van de leerroute. */
export function lessenVanSubdomein(domein: string, subdomein: string): SeoLes[] {
  return lessenOpRoute().filter((l) => l.domein === domein && l.subdomein === subdomein);
}

/** De vorige en volgende les op de leerroute. */
export function buren(les: SeoLes): { vorige: SeoLes | null; volgende: SeoLes | null } {
  const route = lessenOpRoute();
  const i = route.findIndex((l) => l.code === les.code);
  return { vorige: route[i - 1] ?? null, volgende: route[i + 1] ?? null };
}

/** Op welke plek de les staat in de leerroute (1 is de eerste). */
export function plekOpRoute(les: SeoLes): number {
  return LEERROUTE_GROEP3.indexOf(les.code) + 1;
}

/**
 * De plaatjes van de les: `public/seo/lessen/<id>-1.jpg`, `-2`, `-3`.
 * Hier alleen de namen die kunnen bestaan; of ze er echt zijn, kijkt de
 * pagina na (alleen de server kan op schijf kijken).
 */
export function mogelijkePlaatjes(les: SeoLes): string[] {
  return [1, 2, 3].map((n) => `/seo/lessen/${les.id}-${n}.jpg`);
}
