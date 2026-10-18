/**
 * Het schermcontract: wat er op elk scherm hoort te staan.
 *
 * ---------------------------------------------------------------------------
 * Waarom dit bestand bestaat
 * ---------------------------------------------------------------------------
 * "Vragen per oefensessie" is drie keer als verdwenen ervaren. De afspraak in
 * CLAUDE.md — vóór en ná een wijziging de labels vergelijken — heeft dat drie
 * keer niet gevangen, om drie redenen:
 *
 *   1. Er faalt niets. Het is handwerk dat degene die de wijziging maakt zelf
 *      rapporteert; wordt het overgeslagen, dan merkt niemand het.
 *   2. Het kijkt alleen naar het scherm dat je aan het bewerken bent. De keer
 *      dat `bewerkLeerdoel` de waarde overschreef, verdween er visueel niets.
 *   3. Het voorgeschreven `querySelectorAll('label')` vindt niets wat achter
 *      een knop als "Bewerken" zit. Dat geeft vals alarm én valse rust.
 *
 * Dit bestand vervangt dat handwerk door iets dat kápot gaat. `npm run
 * schermen` loopt de lijst hieronder af en stopt met een foutmelding zodra een
 * veld of knop niet meer te vinden is.
 *
 * ---------------------------------------------------------------------------
 * Een scherm of veld erbij
 * ---------------------------------------------------------------------------
 * Zet het in `SCHERMCONTRACT`. Twee soorten regels:
 *
 *   `zichtbaar`  — tekst die meteen in de pagina staat. Wordt opgehaald en in
 *                  de echte HTML gezocht. Draait de dev-server niet — en dat is
 *                  zo bij een commit — dan wordt in `bron` gekeken. Zwakker,
 *                  maar het vangt wél waar het drie keer op misging: een veld
 *                  dat bij een herschrijving uit de code valt.
 *   `naKlik`     — tekst die pas verschijnt na een handeling (een tab openen,
 *                  op "Bewerken" drukken). Die staat niet in de HTML, dus wordt
 *                  gecontroleerd in het bronbestand dat erbij staat. Minder
 *                  sterk, maar het vangt wél waar het drie keer op misging:
 *                  een veld dat bij een herschrijving uit de code valt.
 *
 * Plaatshouders tussen accolades worden gevuld met echte gegevens uit de
 * database. Is er niets om in te vullen — nog geen sjabloon bijvoorbeeld — dan
 * wordt dat scherm overgeslagen en aan het eind gemeld. Het script maakt nooit
 * zelf gegevens aan; zie HARDE REGEL 2 in CLAUDE.md.
 */

/**
 * Een regel in het contract:
 *
 *   naam       zoals jij het scherm noemt; komt terug in de foutmelding.
 *   pad        het pad in de browser, met {vak}, {sjabloon}, {domein},
 *              {subdomein} of {leerdoel} als plaatshouder.
 *   zichtbaar  teksten die meteen op het scherm staan.
 *   bron       de bestanden waarin `zichtbaar` gezocht wordt als de pagina
 *              niet op te halen is.
 *   naKlik     teksten die pas na een handeling verschijnen, elk met het
 *              bronbestand waarin ze horen te staan en wat je moet doen om ze
 *              te zien.
 */

const SJABLOONDETAIL = "src/components/beheer/SjabloonDetail.tsx";
const SJABLOONFORMULIER = "src/components/beheer/SjabloonFormulier.tsx";
const LEERDOELDETAIL = "src/components/beheer/LeerdoelDetail.tsx";
const SEOPANEEL = "src/components/beheer/SeoPaneel.tsx";
const STAPSTENEN = "src/lib/generatoren/stapstenen.ts";
const PLAATJESTELLEN = "src/lib/generatoren/plaatjestellen.ts";

export const SCHERMCONTRACT = [
  {
    naam: "Bosspellen overzicht",
    pad: "/voorbeeld/tellen",
    bron: ["src/components/oefenen/BosOverzicht.tsx"],
    zichtbaar: ["Tellen tot en met 20", "22 spellen", "Spelen"],
    naKlik: [
      { tekst: "Controleer", bron: "src/components/oefenen/BosOverzicht.tsx", na: "een spel openen" },
      { tekst: "Bekijk uitleg", bron: "src/components/oefenen/BosOverzicht.tsx", na: "een fout antwoord" },
      { tekst: "Laatste terug", bron: "src/components/oefenen/VosSleepSpel.tsx", na: "een ordeningsspel openen" },
    ],
  },
  {
    naam: "Huisjespost speelvoorbeeld",
    pad: "/voorbeeld/huisjes",
    bron: ["src/components/oefenen/HuisjesVoorbeeld.tsx"],
    zichtbaar: ["Speelvoorbeeld", "DE HUISJESPOST", "Hulp", "Bezorgen"],
    naKlik: [
      { tekst: "Volgend pakketje", bron: "src/components/oefenen/HuisjesVoorbeeld.tsx", na: "Vul het juiste huisnummer in en bezorg het pakketje" },
      { tekst: "Nog een rondje", bron: "src/components/oefenen/HuisjesVoorbeeld.tsx", na: "Bezorg vijf pakketjes" },
    ],
  },
  {
    naam: "Vakken (algemene instellingen)",
    pad: "/admin/vakken",
    bron: ["src/components/beheer/VakkenBeheer.tsx", "src/components/beheer/OefensessieInstelling.tsx", "src/components/beheer/MaatjeInstelling.tsx"],
    zichtbaar: [
      "Alle vakken",
      "Nieuw vak",
      /*
        De algemene standaard voor het aantal vragen per oefensessie. Hier
        begint de keten: leerdoelen zonder eigen aantal volgen dit getal.
      */
      "Oefensessies",
      "Standaard aantal vragen",
      /* Het maatje voor alles aan of uit, en de lijst met niet-herkende antwoorden. */
      "Het maatje",
      "Maatje aan voor alle oefeningen",
      "Antwoorden die het maatje niet herkende",
    ],
  },
  {
    naam: "Nieuw sjabloon",
    pad: "/admin/{vak}/sjablonen/nieuw",
    bron: [SJABLOONFORMULIER],
    zichtbaar: ["Naam van deze oefening", "Onderwerp", "Wat voor sommen?"],
    naKlik: [
      /*
        Stap 3 tot en met 5 verschijnen pas als er een soort som gekozen is,
        dus die staan niet in de opgehaalde HTML.
      */
      {
        tekst: "Vragen per oefensessie",
        bron: SJABLOONFORMULIER,
        na: "een soort som kiezen",
      },
      { tekst: "Hint bij een fout antwoord", bron: SJABLOONFORMULIER, na: "een soort som kiezen" },
      { tekst: "Hoeveel sommen", bron: SJABLOONFORMULIER, na: "een soort som kiezen" },
      /*
        De instellingen van "Telrij stapstenen". Die komen uit de generator en
        staan dus in dat bestand; het formulier bouwt zichzelf eruit op.
      */
      { tekst: "Sprong", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Richting", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      /*
        De keuzelijst "Bereik" (t/m 20, 50, 100) is op verzoek vervangen door
        twee invulvelden. Beide staan hier, zodat ze niet stilletjes kunnen
        verdwijnen — dat is precies waar dit contract voor is.
      */
      { tekst: "Kleinste getal", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Grootste getal", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Aantal stenen in de rij", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Aantal lege stenen", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Waar de lege stenen liggen", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Eerste steen mag ook leeg zijn", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      /*
        Eén mascotteveld werd er drie, één per houding. De oude regel heette
        "Mascotte op de eerste steen"; die staat er dus niet meer, maar het veld
        is niet verdwenen — het is gesplitst.
      */
      { tekst: "Mascotte — staand", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Mascotte — springend", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      { tekst: "Mascotte — juichend", bron: STAPSTENEN, na: "Telrij stapstenen kiezen" },
      /*
        De instellingen van "Plaatjes tellen". Datzelfde verhaal: ze komen uit
        de generator. "Hoe het kind antwoordt" staat hier apart in, want dat is
        de keuze tussen vier knoppen en zelf intypen; valt die weg,
        dan staat elk sjabloon weer vast op meerkeuze zonder dat het opvalt.
      */
      { tekst: "Minste plaatjes", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
      { tekst: "Meeste plaatjes", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
      { tekst: "Hoe het kind antwoordt", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
      { tekst: "Welke plaatjes mogen voorkomen", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
      { tekst: "Opstelling", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
      { tekst: "Plaatjes per rij", bron: PLAATJESTELLEN, na: "Plaatjes tellen kiezen" },
    ],
  },
  {
    naam: "Sjabloon (oefening) bekijken en aanpassen",
    pad: "/admin/{vak}/sjablonen/{sjabloon}",
    /* "Bekijk uitleg" komt uit het ingeladen knopje. */
    bron: [SJABLOONDETAIL, "src/components/beheer/UitlegVoorbeeld.tsx"],
    zichtbaar: [
      "Gegevens",
      "Bewerken",
      /*
        Het veld waar het drie keer om ging. Staat sinds deze maatregel óók in
        het leesblok, zodat je het ziet zonder eerst op Bewerken te drukken.
      */
      "Vragen per oefensessie",
      "Meer sommen maken",
      "Hoeveel erbij",
      "Genereren",
      "Uitleg bij een fout antwoord",
      "Gemaakte sommen",
    ],
    naKlik: [
      { tekst: "Vragen per oefensessie", bron: SJABLOONDETAIL, na: "op Bewerken drukken" },
      { tekst: "Hint bij een fout antwoord", bron: SJABLOONDETAIL, na: "op Bewerken drukken" },
      { tekst: "Instellingen", bron: SJABLOONDETAIL, na: "op Bewerken drukken" },
    ],
  },
  {
    naam: "Leerdoel",
    pad: "/admin/{vak}/structuur/{domein}/{subdomein}/{leerdoel}",
    /* "Bekijk uitleg" staat in het knopje dat dit scherm inlaadt. */
    bron: [LEERDOELDETAIL, "src/components/beheer/UitlegVoorbeeld.tsx"],
    zichtbaar: [
      "Vragen per oefensessie",
      "Vorm van de uitleg",
      "Bekijk uitleg",
      "Nieuwe vraag",
      /* Het vinkje "verborgen" (wachtrij, oktober 2026): altijd in beeld. */
      "Zichtbaar voor kinderen",
      "Verborgen",
      /* Het maatje per leerdoel (wachtrij, oktober 2026): altijd in beeld. */
      "Maatje",
      "Maatje aan",
    ],
    naKlik: [{ tekst: "Titel", bron: LEERDOELDETAIL, na: "op Bewerken drukken" }],
  },
  {
    /*
      Een leerdoel kan naar een ander onderwerp verhuizen. Die keuzelijst en de
      knop zitten achter "Bewerken" op het leerdoelscherm; zonder bewaking zou
      het stilletjes kunnen verdwijnen, en dan is er geen andere plek waar je
      een leerdoel kunt verplaatsen.
    */
    naam: "Leerdoel: naam in beheer en moeilijkheid",
    pad: "/admin/rekenen/structuur",
    bron: ["src/components/beheer/LeerdoelDetail.tsx"],
    zichtbaar: [],
    naKlik: [
      { tekst: "Naam in beheer", bron: "src/components/beheer/LeerdoelDetail.tsx", na: "een leerdoel openen en op Bewerken klikken" },
      { tekst: "Titel voor het kind", bron: "src/components/beheer/LeerdoelDetail.tsx", na: "een leerdoel openen en op Bewerken klikken" },
      { tekst: "Moeilijkheid", bron: "src/components/beheer/LeerdoelDetail.tsx", na: "een leerdoel openen en op Bewerken klikken" },
    ],
  },
  {
    naam: "Leerdoel verplaatsen",
    pad: "/admin/rekenen/structuur",
    bron: ["src/components/beheer/LeerdoelDetail.tsx"],
    zichtbaar: [],
    naKlik: [
      { tekst: "Verplaatsen naar een ander onderwerp", bron: "src/components/beheer/LeerdoelDetail.tsx", na: "een leerdoel openen en op Bewerken klikken" },
      { tekst: "Verplaatsen", bron: "src/components/beheer/LeerdoelDetail.tsx", na: "een leerdoel openen en op Bewerken klikken" },
    ],
  },
  {
    /*
      De openbare pagina van een domein, onderwerp en oefening: het webadres,
      de paginatitel en de korte beschrijving. Die drie zijn de SEO-basis uit
      WERKPLAN.md; zonder bewaking zouden ze bij een herschrijving van zo'n
      scherm stilletjes kunnen verdwijnen, en dan heeft geen enkele pagina nog
      een eigen titel in Google zonder dat er iets zichtbaar misgaat.
    */
    naam: "Openbare pagina (SEO) bij domein, onderwerp en oefening",
    pad: "/admin/{vak}/structuur/{domein}",
    bron: [SEOPANEEL, "src/components/beheer/DomeinDetail.tsx"],
    zichtbaar: ["Openbare pagina", "Webadres", "Paginatitel", "Korte beschrijving"],
    naKlik: [
      { tekst: "Leeg laten mag", bron: SEOPANEEL, na: "bij Openbare pagina op Bewerken drukken" },
    ],
  },
  {
    naam: "Openbare pagina (SEO) bij een oefening",
    pad: "/admin/{vak}/structuur/{domein}/{subdomein}/{leerdoel}",
    bron: [SEOPANEEL, LEERDOELDETAIL],
    zichtbaar: ["Openbare pagina", "Paginatitel", "Korte beschrijving"],
  },
  {
    naam: "Foutpatronen",
    pad: "/admin/foutpatronen",
    bron: ["src/app/admin/foutpatronen/page.tsx"],
    zichtbaar: ["Foutpatronen", "zo los je het op"],
  },
  {
    /*
      Bij "de hoeveelste kraal is dit?" zijn de kralen met opzet niet aan te
      tikken; zie de toelichting boven `KralenAvontuur`. De knop "Opnieuw
      tellen" en de regel "Tik de kralen om mee te tellen." hoorden bij dat
      aantikken en zijn op verzoek van de eigenaar weggehaald, dus ze worden
      hier ook niet meer bewaakt. Het rekenrek zelf en de pijl blijven staan.
    */
    naam: "Kralenavontuur",
    pad: "/oefenen/rekenen/getallen/tellen-sprongen/oefening?leerdoel={leerdoel}",
    bron: ["src/components/oefenen/KralenAvontuur.tsx"],
    zichtbaar: [],
    naKlik: [{ tekst: "Kralenrij", bron: "src/components/oefenen/KralenAvontuur.tsx", na: "een kralenopdracht openen" }],
  },
  /*
    Zappie (oktober 2026): de startpagina voor groep 3 en de schermen
    erachter. Sinds 12 oktober 2026 is /zappie de startpagina van de
    kinderkant; /start stuurt hierheen door (next.config.ts).

    13 oktober 2026, tweede ontwerp van de eigenaar
    (ontwerp/zappie/voorbeeld-startpagina-2.webp): "Start oefenen" werd
    "Begin je missie", "Vandaag oefenen" met Rekenen/Taal/Denken werd
    "Vandaag op ontdekking" met Schoolpad/IEP Sprong/Vrije Missie, de
    Zappie-punten heten tokens, het menu staat bovenaan en "Wereld" heet
    "Werelden". De regels hieronder volgen dat ontwerp.
  */
  {
    naam: "Zappie start",
    pad: "/zappie",
    bron: [
      "src/components/zappie/Startscherm.tsx",
      "src/components/zappie/Schil.tsx",
      "src/lib/zappie/werelden.ts",
      "src/components/zappie/OntdekkingsReis.tsx",
      "src/components/zappie/ScrollReis.tsx",
      "src/components/zappie/VakkenPaneel.tsx",
    ],
    zichtbaar: [
      /*
        "Begin je missie" heet sinds 14 oktober 2026 "Mijn leerpad", op verzoek
        van de eigenaar (voorbeeld met de werelden in drie vakken).
      */
      "Mijn leerpad",
      /* 16 oktober 2026, op verzoek van de eigenaar: het vakkenpaneel bovenaan (VakkenPaneel.tsx). */
      "Kies jouw vak",
      "Start missie",
      "Oceaan",
      "Aarde",
      "Universum",
      "Jouw huidige wereld",
      "Vandaag op ontdekking",
      /*
        14 oktober 2026, op verzoek van de eigenaar: de tegels Schoolpad,
        Toetssprong (voorbereiding op de IEP) en Vrije Missie zijn vervangen
        door drie dagmissies Rekenen, Herhalen en Uitdaging met een
        percentage en een Start-knop. Herhalen opent de vrije missie.
      */
      "Herhalen",
      "Uitdaging",
      "Binnenkort",
      "Jouw tokens",
      "Op weg naar je volgende beloning!",
      "Jouw wereld",
      "Ga naar mijn wereld",
      /*
        "Leren vandaag, groter morgen." onder het logo is weggehaald op
        verzoek van de eigenaar (13 oktober 2026, bouwopdracht cinematische
        kinderhomepage: "Verwijder de slogan onder het logo").
      */
      "Start",
      "Oefenen",
      /*
        Heette in het tweede ontwerp "Werelden". De bouwopdracht van het derde
        ontwerp (13 oktober 2026) noemt de vier knoppen "Start, Oefenen, Wereld,
        Beloningen".
      */
      "Wereld",
      "Beloningen",
      /* Derde ontwerp (13 oktober 2026): de lange pagina onder de ruimte. */
      "Zo kan jouw wereld worden",
      "Wat wil je ontdekken?",
      "Rekenen",
      "Begrijpend lezen",
      "Aardrijkskunde",
      "Woordenschat",
      "Engels",
      "Liever meteen een vrije missie?",
      /*
        De werkplaats (Werkplaats, Bouw aan nieuwe voertuigen!, Onderzeeër,
        Vliegtuig, Raket, Op de tekentafel) is op 15 oktober 2026 op
        uitdrukkelijk verzoek van de eigenaar weggehaald.
      */
      /*
        De robot heet sinds 18 oktober 2026 Bliepo (keuze eigenaar): "Zappies
        atelier" en "Terug naar je eigen Zappie" zijn daarom hernoemd, niet
        weggehaald.
      */
      "Bliepo’s atelier",
      "Wat past bij jou?",
      "Petjes",
      "Kleuren",
      "Passen",
      "Terug naar je eigen Bliepo",
      "Tot de volgende missie!",
      "Terug naar de sterren",
      "Beweging uit",
      "Direct naar de vakken",
    ],
    naKlik: [
      { tekst: "komt binnenkort. Met Rekenen kun je nu al beginnen!", bron: "src/components/zappie/OntdekkingsReis.tsx", na: "op een vak met Binnenkort tikken" },
      { tekst: "Bliepo past nu:", bron: "src/components/zappie/OntdekkingsReis.tsx", na: "iets passen in het atelier" },
      { tekst: "Beweging aan", bron: "src/components/zappie/ScrollReis.tsx", na: "op Beweging uit tikken" },
      { tekst: "Maak meer missies om deze wereld te ontdekken!", bron: "src/components/zappie/Startscherm.tsx", na: "op een wereld met een slotje tikken" },
      { tekst: "komt er binnenkort aan", bron: "src/components/zappie/Startscherm.tsx", na: "op Uitdaging tikken (bij Vandaag op ontdekking)" },
      { tekst: "Er is een nieuwe plek vrij in jouw wereld!", bron: "src/components/zappie/Startscherm.tsx", na: "een missie waarmee een nieuwe plek vrijkomt" },
      { tekst: 'href: "/rekenen"', bron: "src/components/zappie/Schil.tsx", na: "op Oefenen tikken (het rekenscherm)" },
      { tekst: 'href="/meer"', bron: "src/components/zappie/Schil.tsx", na: "op het menuknopje naast het tandwiel tikken" },
      { tekst: 'href="/profiel"', bron: "src/components/zappie/Schil.tsx", na: "op het tandwiel tikken" },
    ],
  },
  {
    /*
      Testpagina met drie versies van Bliepo (18 oktober 2026, fase 1). Staat in
      geen menu; blijft tot de eigenaar zegt dat hij weg mag.
    */
    naam: "Voorbeeld Bliepo",
    pad: "/voorbeeld-bliepo",
    bron: ["src/app/voorbeeld-bliepo/VoorbeeldBliepo.tsx"],
    zichtbaar: ["Voorbeeld: vier versies van Bliepo", "Nu op de site", "3D, kleiner model", "Filmpje", "één gedeelde motor", "Beweging uit"],
  },
  {
    naam: "Zappie missie",
    pad: "/zappie/oefenen?wereld=oceaan&missie=1",
    bron: ["src/components/zappie/Missie.tsx"],
    zichtbaar: ["Vul in.", "Controleer", "Stoppen"],
    naKlik: [
      { tekst: "Nog niet helemaal", bron: "src/components/zappie/Missie.tsx", na: "een antwoord dat nog niet goed is" },
      { tekst: "Missie klaar!", bron: "src/components/zappie/Missie.tsx", na: "alle 15 sommen" },
      { tekst: "Terug naar start", bron: "src/components/zappie/Missie.tsx", na: "alle 15 sommen" },
    ],
  },
  {
    naam: "Zappie wereld",
    pad: "/zappie/wereld",
    bron: ["src/components/zappie/Schermen.tsx"],
    zichtbaar: ["Met elke missie kom je verder", "Start missie", "dan gaat deze wereld open"],
  },
  {
    naam: "Zappie beloningen",
    pad: "/zappie/beloningen",
    bron: ["src/components/zappie/Schermen.tsx"],
    zichtbaar: ["tokens", "missies klaar", "sterren", "vrij in jouw wereld", "tokens tot de volgende"],
  },
  {
    naam: "Zappie jouw wereld",
    pad: "/zappie/mijn-wereld",
    bron: ["src/components/zappie/Schermen.tsx"],
    zichtbaar: ["Jouw wereld", "Bouwen kan nog niet"],
    naKlik: [
      { tekst: "Vrij!", bron: "src/components/zappie/Schermen.tsx", na: "250 tokens verdiend" },
      { tekst: "vrijgespeeld", bron: "src/components/zappie/Schermen.tsx", na: "250 tokens verdiend" },
    ],
  },
  /*
    De openbare site (13 oktober 2026): de homepagina voor wie via Google
    binnenkomt, de scholenkaart, de werkbladen en hun beheer. `/` stuurt een
    apparaat waarop al een kind gekozen is door naar Zappie; zonder koekje
    (zoals hier) is het de homepagina.
  */
  {
    naam: "Homepagina",
    pad: "/",
    bron: ["src/app/(site)/page.tsx", "src/app/(site)/layout.tsx", "src/components/site/Kop.tsx"],
    zichtbaar: [
      "Oefenen met precies wat er",
      "Zoek je school",
      "Geen standaardpakket",
      "Kies de school",
      "Wij koppelen de methode",
      "Je kind oefent gericht",
      "Elke basisschool van Nederland",
      "Open de scholenkaart",
      "Toewerken naar de toets van groep 8",
      "De referentieniveaus",
      "Gratis digitale niveautest",
      "Dyslexie",
      "Slechthorend",
      "ADHD en concentratie",
      "Meertalig",
      "Moeilijke onderwerpen",
      "Begin gratis. Kies later",
      "€6,95",
      "€89",
      "Veelgestelde vragen",
      "Inloggen",
      "Scholenkaart",
      "Prijzen",
      "is onafhankelijk en niet verbonden aan",
      "DUO Open Onderwijsdata",
    ],
  },
  {
    naam: "Scholenkaart",
    pad: "/scholen",
    bron: ["src/app/(site)/scholen/page.tsx", "src/components/site/Scholenkaart.tsx"],
    zichtbaar: ["basisscholen van Nederland", "Zoek de school van je kind", "Doorstroomtoets"],
    naKlik: [
      { tekst: "Koppel deze school aan mijn kind", bron: "src/components/site/Scholenkaart.tsx", na: "een school kiezen" },
      { tekst: "Ons doel voor ons kind", bron: "src/components/site/Scholenkaart.tsx", na: "een school kiezen" },
      { tekst: "Wat leerlingen hier halen", bron: "src/components/site/Scholenkaart.tsx", na: "een school kiezen" },
      { tekst: "Andere school zoeken", bron: "src/components/site/Scholenkaart.tsx", na: "een school kiezen" },
    ],
  },
  {
    naam: "Werkbladen in beheer",
    pad: "/admin/werkbladen",
    bron: ["src/app/admin/werkbladen/page.tsx", "src/components/beheer/Werkbladformulier.tsx"],
    zichtbaar: ["Werkbladen en posters", "Nieuw werkblad of poster", "Titel", "Bestand", "Opslaan"],
    naKlik: [
      { tekst: "Weghalen", bron: "src/components/beheer/Werkbladformulier.tsx", na: "er staat een werkblad" },
      { tekst: "Op de site", bron: "src/app/admin/werkbladen/page.tsx", na: "er staat een werkblad" },
    ],
  },
  /*
    De gratis niveautest. Het beheerscherm is er altijd; de formuliervelden pas
    als er leerdoelen zijn, en de openbare pagina's (/niveautest en
    /niveautest/{groep}) pas als er een toets is samengesteld. Tot dan zijn die
    een 404, dus worden ze in de bron gecontroleerd.
  */
  {
    naam: "Niveautest in beheer",
    pad: "/admin/niveautest",
    bron: ["src/app/admin/niveautest/page.tsx"],
    zichtbaar: ["Niveautest", "Onderdeel toevoegen", "Zo wordt de uitslag bepaald"],
    naKlik: [
      /* Een paneel per groep, 3 tot en met 8; de titel wordt in de code gemaakt. */
      { tekst: "TOETSGROEPEN.map((groep)", bron: "src/app/admin/niveautest/page.tsx", na: "het scherm openen" },
      { tekst: "Groep</span>", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er is minstens één leerdoel" },
      { tekst: "Leerdoel</span>", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er is minstens één leerdoel" },
      { tekst: "Vragen</span>", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er is minstens één leerdoel" },
      { tekst: "Referentieniveau</span>", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er is minstens één leerdoel" },
      { tekst: "Toevoegen", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er is minstens één leerdoel" },
      { tekst: "Uit de toets", bron: "src/components/beheer/Niveautestformulier.tsx", na: "er staat een onderdeel in de toets" },
      { tekst: 'name="aantal"', bron: "src/app/admin/niveautest/page.tsx", na: "er staat een onderdeel in de toets" },
      { tekst: 'name="niveau"', bron: "src/app/admin/niveautest/page.tsx", na: "er staat een onderdeel in de toets" },
      { tekst: "Opslaan", bron: "src/app/admin/niveautest/page.tsx", na: "er staat een onderdeel in de toets" },
      { tekst: "Eén plek omhoog", bron: "src/app/admin/niveautest/page.tsx", na: "er staan twee onderdelen in de toets" },
      { tekst: "Eén plek omlaag", bron: "src/app/admin/niveautest/page.tsx", na: "er staan twee onderdelen in de toets" },
      { tekst: "In welke groep zit je kind?", bron: "src/app/(site)/niveautest/page.tsx", na: "er is een toets samengesteld; open /niveautest" },
      { tekst: "Begin de toets", bron: "src/components/site/Toetsspeler.tsx", na: "kies een groep op /niveautest" },
      { tekst: "Weet ik niet", bron: "src/components/site/Toetsspeler.tsx", na: "begin de toets" },
      { tekst: '"Volgende"', bron: "src/components/site/Toetsspeler.tsx", na: "begin de toets" },
      { tekst: "Stoppen", bron: "src/components/site/Toetsspeler.tsx", na: "begin de toets" },
      { tekst: "<Antwoordvelden", bron: "src/components/site/Toetsspeler.tsx", na: "begin de toets (dezelfde antwoordvelden als bij het oefenen)" },
      { tekst: "Hier valt de meeste winst te halen", bron: "src/components/site/Toetsspeler.tsx", na: "maak de toets af" },
      { tekst: "Nog een keer", bron: "src/components/site/Toetsspeler.tsx", na: "maak de toets af" },
      { tekst: "Oefen met de methode van school", bron: "src/components/site/Toetsspeler.tsx", na: "maak de toets af" },
    ],
  },
  /*
    De kinderkant in de nieuwe layout (oktober 2026). Deze schermen zitten
    achter het kindprofiel en zijn zonder koekje niet op te halen; daarom
    staat alles bij `naKlik` en wordt er in de bronbestanden gekeken.

    Het blok "Nog meer voor jou" stond onder het startscherm en is op verzoek
    van de eigenaar verplaatst, niet weggehaald: de sleutels en de groep naar
    het Hoi-vakje, de rest naar "Meer" achter het ronde menuknopje.
  */
  {
    naam: "Startscherm (nieuwe layout)",
    pad: "/start",
    bron: ["src/app/(kind)/start/page.tsx"],
    zichtbaar: [],
    naKlik: [
      { tekst: "<Sleutelteller", bron: "src/app/(kind)/start/page.tsx", na: "het startscherm openen (Hoi-vakje)" },
      { tekst: "<Groepwisselaar", bron: "src/app/(kind)/start/page.tsx", na: "het startscherm openen (Hoi-vakje)" },
      { tekst: "<Menuknop", bron: "src/app/(kind)/start/page.tsx", na: "het startscherm openen (naast het Hoi-vakje)" },
      { tekst: 'href: "/rekenen"', bron: "src/app/(kind)/start/page.tsx", na: "op de tegel Rekenen tikken" },
      { tekst: 'href="/meer"', bron: "src/components/avontuur/Menuknop.tsx", na: "op het menuknopje tikken" },
    ],
  },
  {
    naam: "Meer (wat eerst onder het startscherm stond)",
    pad: "/meer",
    bron: ["src/app/(kind)/meer/page.tsx"],
    zichtbaar: [],
    naKlik: [
      { tekst: "NAV_ITEMS", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken (het menu)" },
      { tekst: "<Vakkenmenu", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken" },
      { tekst: "<RekenPaneel", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken (vrij oefenen, volgens je methode)" },
      { tekst: "<SchoolMethodeKaart", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken" },
      { tekst: "<TipKaartjes", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken" },
      { tekst: "<Wereldpad", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken (jouw wereld)" },
      { tekst: "<Mascotte", bron: "src/app/(kind)/meer/page.tsx", na: "op het menuknopje tikken (de vos)" },
      { tekst: "Vrij oefenen", bron: "src/components/kind/RekenPaneel.tsx", na: "op het menuknopje tikken" },
      { tekst: "Oefenen volgens je methode", bron: "src/components/kind/RekenPaneel.tsx", na: "op het menuknopje tikken" },
    ],
  },
  {
    naam: "Rekenscherm, domein en onderwerp (sterrenstijl)",
    pad: "/rekenen",
    bron: ["src/app/(kind)/rekenen/page.tsx"],
    zichtbaar: [],
    naKlik: [
      { tekst: "voortgang={{", bron: "src/app/(kind)/rekenen/page.tsx", na: "op de tegel Rekenen tikken (voortgang per domein)" },
      { tekst: "<HoofdMascotte", bron: "src/app/(kind)/rekenen/page.tsx", na: "op de tegel Rekenen tikken (het maatje)" },
      { tekst: "Terug naar het startscherm", bron: "src/app/(kind)/rekenen/page.tsx", na: "op de tegel Rekenen tikken" },
      { tekst: "voortgang={{", bron: "src/app/(kind)/rekenen/[domein]/page.tsx", na: "een domein openen" },
      { tekst: "<Moeilijkheid", bron: "src/app/(kind)/rekenen/[domein]/[onderwerp]/page.tsx", na: "een onderwerp openen" },
      { tekst: "Nieuw", bron: "src/app/(kind)/rekenen/[domein]/[onderwerp]/page.tsx", na: "een onderwerp openen" },
      { tekst: "&van=ster", bron: "src/app/(kind)/rekenen/[domein]/[onderwerp]/page.tsx", na: "een oefening kiezen (terug komt weer hier uit)" },
    ],
  },
  /*
    Het adres heeft het vak nodig: elk beheerscherm hangt onder /admin/{vak}/.
    Zonder die plaatshouder kwam hier een 404 uit, en dan hield de bewaking elke
    commit tegen — terwijl er aan de instelling zelf niets mankeerde. Zie de
    regel hierboven, die naar hetzelfde scherm wijst.
  */
  { naam: "Busanimatie in beheer", pad: "/admin/{vak}/sjablonen/nieuw", bron: ["src/lib/generatoren/bus.ts"], zichtbaar: [], naKlik: [
    { tekst: "Busanimatie", bron: "src/lib/generatoren/bus.ts", na: "Bus tellen kiezen" },
    { tekst: "Vosjes stappen in vóór het tellen", bron: "src/lib/generatoren/bus.ts", na: "Bus tellen kiezen" },
    { tekst: "Vosjes zitten klaar; bus rijdt weg bij goed antwoord", bron: "src/lib/generatoren/bus.ts", na: "Bus tellen kiezen" },
  ] },
];
