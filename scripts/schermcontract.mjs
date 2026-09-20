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
    bron: ["src/components/beheer/VakkenBeheer.tsx", "src/components/beheer/OefensessieInstelling.tsx"],
    zichtbaar: [
      "Alle vakken",
      "Nieuw vak",
      /*
        De algemene standaard voor het aantal vragen per oefensessie. Hier
        begint de keten: leerdoelen zonder eigen aantal volgen dit getal.
      */
      "Oefensessies",
      "Standaard aantal vragen",
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
