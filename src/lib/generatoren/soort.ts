/**
 * Het raamwerk voor vraaggeneratoren.
 *
 * Een generator is een recept: uit een paar instellingen maakt het sommen.
 * Elke generator beschrijft zélf welke instellingen hij heeft, zodat het
 * beheerscherm het formulier kan opbouwen zonder iets over dat type te weten.
 * Een nieuw type toevoegen is dus: één bestand schrijven en hem aanmelden in
 * `alleGeneratoren`. Aan de schermen hoeft niets te veranderen.
 *
 * Deze bestanden bevatten alleen rekenwerk, geen database. Daardoor kan het
 * beheerscherm het voorbeeld meteen in de browser laten zien, zonder wachten.
 */

import type {
  Aanpak,
  Foutpatroon,
  Leeftijdsgroep,
  Somgegevens,
} from "@/lib/generatoren/foutpatroon";
import type { Uitlegbron } from "@/lib/generatoren/uitlegscript";
import type { AntwoordOptie, Vraagvorm } from "@/lib/vraagtypes";

export type { Somgegevens };

// ---------------------------------------------------------------------------
// Tekeningen
// ---------------------------------------------------------------------------

/**
 * Een tekening bij een vraag, opgeslagen als gegevens in plaats van als
 * plaatje. De kinderkant tekent hem met code, zodat hij op elk scherm scherp
 * blijft en netjes meeschaalt.
 */
export type Figuur =
  | import("./bosspellen-catalogus").Bosfiguur
  | {
      soort: "splitsboom";
      geheel: number;
      links: number | null;
      rechts: number | null;
    }
  | {
      /**
       * Splitsen in de tabel, of als splitshuis.
       *
       * `doel` staat bovenaan (op het dak bij het huis) en is bij elke rij
       * hetzelfde. Per rij staat er één gegeven getal in een geel vakje; het
       * kind vult ernaast in wat er nog bij moet. `uiterlijk` is "eenvoudig"
       * of "speels" en verandert alleen het beeld, niet de som.
       */
      soort: "splitstabel";
      doel: number;
      gegeven: number[];
      /**
       * Per rij: staat het lege vakje rechts?
       *
       * Ontbreekt dit, dan is het overal rechts — zo blijven de sommen die
       * gemaakt zijn voordat deze instelling bestond precies staan zoals ze
       * toen op het scherm kwamen.
       */
      leegRechts?: boolean[];
      uiterlijk: string;
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Aanvullen tot een vast getal: één gegeven vakje en één leeg vakje,
       * met klein erboven waar het samen op uit moet komen.
       */
      soort: "aanvullen";
      doel: number;
      gegeven: number;
    }
  | {
      /**
       * Het splitsschema, of de kersen.
       *
       * Het hele getal bovenaan met twee pijltjes naar twee vakjes. Het vakje
       * dat `null` is, is het lege. `uiterlijk` is "eenvoudig" of "speels".
       */
      soort: "splitsschema";
      geheel: number;
      links: number | null;
      rechts: number | null;
      uiterlijk: string;
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Verdelen in twee groepen: een groepje kralen en twee lege vakken.
       *
       * `verschil` is hoeveel er links meer moeten liggen dan rechts: 0, 1 of
       * 2. Dat staat ook in de opdrachtzin, zodat het kind het kan nalezen.
       */
      soort: "verdelen";
      aantal: number;
      verschil: number;
    }
  | {
      /**
       * Optellen met plaatjes: twee groepjes voorwerpjes.
       *
       * `stand` is "som" (drie lege vakjes) of "uitkomst" (de twee getallen
       * staan er al). `voorwerp` zegt wat er getekend wordt; per vraag één
       * soort, en het tweede groepje krijgt een andere kleur.
       */
      soort: "plaatjessom";
      eerste: number;
      tweede: number;
      stand: string;
      voorwerp: string;
    }
  | {
      /** De kale plussom: twee getallen en een leeg vakje. */
      soort: "plussom";
      eerste: number;
      tweede: number;
    }
  | {
      /**
       * Vier kaartjes met een som; het kind kiest er één.
       *
       * Bij de stand "nietbij" staat op elk kaartje alleen `a + b` en is er
       * één die niet op `doel` uitkomt. Bij "klopt" staat de uitkomst er ook
       * bij en klopt er precies één.
       */
      soort: "somkeuze";
      stand: string;
      doel: number;
      kaarten: { eerste: number; tweede: number; uitkomst: number }[];
    }
  | {
      /**
       * Aanvullen in de tabel: vier getallen op een rij, eronder lege vakjes.
       */
      soort: "aanvultabel";
      doel: number;
      getallen: number[];
    }
  | {
      /** Eén som bovenaan en vier kaartjes; welke is evenveel? */
      soort: "evenveelsom";
      eerste: number;
      tweede: number;
      kaarten: { eerste: number; tweede: number }[];
    }
  | {
      /**
       * Vijf sommen links, vijf losse uitkomsten rechts.
       *
       * `keuzes` staat door elkaar; het kind sleept ze naar de som waar ze bij
       * horen. Het antwoord is per rij de uitkomst, van boven naar beneden.
       */
      soort: "koppelsommen";
      sommen: { eerste: number; tweede: number }[];
      keuzes: number[];
    }
  | {
      /** Optellen via tien: 7 + 7 = 10 + ▢ = ▢. */
      soort: "viatien";
      eerste: number;
      tweede: number;
    }
  | {
      /** Zes getallen; welke twee maken samen het doelgetal? */
      soort: "tweegetallen";
      doel: number;
      getallen: number[];
    }
  | {
      /**
       * Beide kanten gelijk: 5 + ▢ = 1 + 7.
       *
       * Wat `null` is, vult het kind in. Er is er altijd precies één leeg.
       */
      soort: "balans";
      links: (number | null)[];
      rechts: (number | null)[];
    }
  | {
      /**
       * Flitsen met het rekenrek: even kijken, dan gaat er een kaart overheen.
       *
       * Het kind ziet een aantal kralen en typt daarna hoeveel het er zag. De
       * vijfstructuur van het rek maakt dat je het in één oogopslag kunt zien
       * zonder te tellen.
       */
      soort: "rekenrekflits";
      aantal: number;
      /** Na hoeveel tellen de kaart komt; komt uit de instellingen. */
      seconden: number;
    }
  | {
      /**
       * Aftrekken met het rekenrek: de som bovenaan, het rek eronder.
       *
       * Het kind schuift zelf de kralen weg en vult het antwoord in de som in.
       * De stand bepaalt wat voor som het is en wat er na een goed antwoord
       * onder verschijnt: niets, de splitsing, of de weg via de tien.
       */
      soort: "rekenrekaf";
      van: number;
      af: number;
      stand: string;
    }
  | {
      /**
       * De kale som over de tien, zonder rek erbij: 14 − 8 = ▢.
       *
       * Het kind denkt aan het rekenrek. Gaat het mis, dan speelt het rek de
       * som alsnog voor in de uitleg.
       */
      soort: "rekenrekhoofd";
      van: number;
      af: number;
    }
  | {
      /**
       * Erafsommen: een groep plaatjes waar het kind er zelf wegstreept.
       *
       * Het kind ziet `totaal` plaatjes, streept er `eraf` weg en typt hoeveel
       * er overblijven. Altijd visueel; dat is bij dit type de hele opdracht.
       */
      soort: "wegstrepen";
      totaal: number;
      eraf: number;
      voorwerp: string;
    }
  | {
      /**
       * Een minsom bij een plaatje: er schuiven er vanzelf een paar weg.
       *
       * De computer doet het voordoen, het kind kijkt en vult daarna de hele
       * som in: ▢ − ▢ = ▢.
       */
      soort: "minsomplaatje";
      totaal: number;
      eraf: number;
      voorwerp: string;
    }
  | {
      /**
       * Aftrekken met plaatjes: groep plaatjes − groep plaatjes = ▢.
       *
       * Met `metGetallen` staat het getal onder elk groepje. Bij een visuele
       * som streept het kind eerst zelf weg; daarna rekent het zelf.
       */
      soort: "plaatjesminsom";
      totaal: number;
      eraf: number;
      voorwerp: string;
      metGetallen: boolean;
      visueel: boolean;
    }
  | {
      /**
       * De kale minsom: 13 − 5 = ▢.
       *
       * Bij een visuele som staat het rekenrek erbij en schuift het kind daar
       * zelf de kralen weg.
       */
      soort: "minsom";
      van: number;
      af: number;
      visueel: boolean;
    }
  | {
      /**
       * Minsommen aan hun uitkomst koppelen; hetzelfde slepen als bij plus.
       */
      soort: "minkoppelen";
      sommen: { eerste: number; tweede: number }[];
      keuzes: number[];
    }
  | {
      /**
       * De splitsdriehoek: drie vakken binnen de driehoek, drie sommen erbuiten.
       *
       * Wat `null` is, vult het kind in. De volgorde van het antwoord is
       * linksonder, links, rechts.
       */
      soort: "splitsdriehoek";
      boven: number | null;
      linksonder: number | null;
      rechtsonder: number | null;
      links: number | null;
      rechts: number | null;
      onder: number | null;
    }
  | {
      soort: "kralenrij";
      /** Hoeveel kralen er in de rij hangen. */
      totaal: number;
      /** Om de hoeveel kralen de kleur wisselt. Vijf geeft de vijfstructuur. */
      perGroep: number;
      /** De hoeveelste kraal de pijl aanwijst, geteld vanaf links vanaf 1. */
      pijlOp: number;
      /** Welk kleurenpaar. De namen staan in `Figuurtekening`. */
      palet: string;
    }
  | {
      soort: "stapstenen";
      /**
       * Per steen het getal, of `null` als de steen leeg is.
       *
       * De lege stenen zijn tegelijk de invulvakken: het kind tikt op een steen
       * en vult hem ter plekke in. Er is daarom geen apart antwoordveld.
       */
      stenen: (number | null)[];
      /** Het verschil tussen twee stenen. Bepaalt de afstand en het boogje. */
      sprong: number;
      richting: "vooruit" | "terug";
      /**
       * Bestandsnaam van de mascotte op de eerste steen, of `null`.
       *
       * Bewust een afbeelding uit het afbeeldingenbeheer en geen tekening in
       * code: zo is de vos zelf te uploaden en later te vervangen zonder dat er
       * iets aan de code hoeft te veranderen. Staat er niets, dan staat er ook
       * geen mascotte — liever leeg dan een verkeerd poppetje.
       */
      mascotte: string | null;
      /**
       * Houdingen van de mascotte, elk een eigen afbeelding uit het beheer.
       *
       * Ontbreekt er een, dan wordt `mascotte` gebruikt. Zo werkt het meteen
       * met één plaatje, en kan er later per houding een betere bij zonder dat
       * er iets aan de code hoeft te veranderen.
       */
      mascotteSpringend?: string | null;
      mascotteJuichend?: string | null;
    }
  | {
      /**
       * Een aantal dezelfde plaatjes om te tellen.
       *
       * Het plaatje komt uit het afbeeldingenbeheer en staat niet in code: zo
       * is er een vrolijk plaatje bij te kiezen dat bij jonge kinderen past,
       * zonder dat er iets aan de code hoeft te veranderen.
       */
      soort: "plaatjesraster";
      /** Hoeveel plaatjes er staan. Dit is ook het antwoord. */
      aantal: number;
      /**
       * Welk getekend plaatje: "eend", "bal", "appel". Leeg = geen tekening.
       *
       * De namen staan in `components/oefenen/Telplaatjes.tsx`. Staat hier iets,
       * dan wint de tekening; `afbeelding` blijft daarnaast gewoon bestaan voor
       * wie liever een eigen plaatje uploadt.
       */
      plaatje: string | null;
      /** Bestandsnaam uit het afbeeldingenbeheer, of `null`. */
      afbeelding: string | null;
      /**
       * De mascotte, per houding een eigen afbeelding uit het beheer.
       *
       * Vangend als de plaatjes binnendwarrelen, wachtend zolang het kind
       * nadenkt, blij na een goed antwoord. Ontbreekt er een, dan wordt de
       * vangende genomen — liever dezelfde vos dan geen vos.
       */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
      /**
       * Hoeveel plaatjes op een rij. 0 betekent verspreid, zonder rijen.
       *
       * Dit bepaalt wat er geoefend wordt: vijf per rij geeft de vijfstructuur,
       * tien per rij de tienstructuur, en verspreid is het moeilijkst omdat het
       * kind zelf structuur moet aanbrengen.
       */
      perRij: number;
      /** Kleine extra ruimte na elk groepje van vijf binnen een rij. */
      groepsruimte: boolean;
    }
  | {
      /**
       * MAB-blokken: staven van tien en losse blokjes.
       *
       * Hetzelfde materiaal dat op school in de kast staat. De staven staan
       * links, de losse blokjes rechts, met een stippellijn ertussen, zodat een
       * kind ziet dat het twee soorten zijn.
       */
      soort: "mabblokken";
      /** Hoeveel staven van tien. */
      tientallen: number;
      /** Hoeveel losse blokjes. Samen met de staven is dat het antwoord. */
      eenheden: number;
      /**
       * Wat er met de blokken gebeurt als de vraag opent.
       *
       *   tellen    alles ligt klaar; het kind telt
       *   vosbouwt  alles ligt eerst los; Vos schuift er staven van tien van
       *   slepen    (nog niet gebouwd) het kind legt zelf het getal neer
       *
       * Een naam en geen vinkje, zodat er een stand bij kan zonder dat de
       * bestaande twee verbouwd hoeven te worden.
       */
      stand: string;
      /**
       * De mascotte, per houding een eigen afbeelding uit het beheer.
       *
       * Alleen nodig bij de stand waarin Vos de staven bouwt. Ontbreekt er een,
       * dan wordt de vangende genomen.
       */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Een rij huisjes met huisnummers: Vos' straat.
       *
       * Het huis waar Vos voor staat laat zijn nummer zien; de buren hebben een
       * leeg bordje. Bij even en oneven staan de huizen in twee rijen met de
       * straat ertussen, net als in het echt.
       */
      soort: "huizenrij";
      huizen: { nummer: number; kant: "boven" | "onder" }[];
      /** Bij welk huis Vos staat; dat nummer is zichtbaar. */
      vosBij: number;
      /** Welk huis gevraagd wordt; dat nummer komt pas bij een goed antwoord. */
      gevraagd: number;
      /**
       * Alle lege deuren, als het er meer dan één zijn.
       *
       * Bij de stand "allebei de buren" staat het middelste huis vol en zijn de
       * deuren links en rechts allebei leeg; dan staan hier hun twee plekken in.
       * Blijft dit leeg, dan is er precies één lege deur en geldt `gevraagd` —
       * zoals het altijd al was.
       */
      gevraagden?: number[];
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Vissen met getallen in een vijver: welk getal is het grootst?
       *
       * De vissen zijn tegelijk de antwoordknoppen — het kind tikt de vis aan
       * die het bedoelt. Er staan dus geen losse keuzeknoppen onder de vraag.
       */
      soort: "visvijver";
      vissen: { getal: number }[];
      /** Zoekt het kind de grootste of de kleinste? */
      zoek: string;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
      /**
       * De vissende vos, met de plek van zijn hengelpuntje.
       *
       * Een eigen afbeelding voor dit type: een vos die rechtop staat met een
       * hengel in zijn poten. Het touw wordt in code getekend en moet precies
       * aan dat hengeltje vastzitten, dus staat erbij wáár dat puntje op het
       * plaatje zit: `x` en `y` in procenten van de breedte en de hoogte van
       * de afbeelding zelf. Zo blijft het touw eraan vast, ook als het plaatje
       * op een telefoon kleiner wordt.
       *
       * `null` of zonder afbeelding = geen hengelvos; dan geldt de gewone vos
       * en de hengel die in code getekend wordt.
       */
      hengel: { afbeelding: string | null; x: number; y: number } | null;
    }
  | {
      /**
       * De getallenlijn: een rechte lijn met streepjes, zoals op school.
       *
       * `start` en `eind` zijn het stuk van de lijn dat te zien is; bij een
       * groot bereik is dat een venster, zodat de streepjes uit elkaar blijven
       * staan. `stap` is hoeveel één streepje verder is: 1, 5 of 10. Onder de
       * getallen in `zichtbaar` staat het getal, onder de rest niet.
       */
      soort: "getallenlijn";
      start: number;
      eind: number;
      stap: number;
      zichtbaar: number[];
      /**
       * Wat het kind doet.
       *
       * "schuiven": Vos draagt een vlaggetje met het gezochte getal en het kind
       * schuift hem naar de goede plek. "invullen": boven de lijn staan lege
       * vakjes met een pijltje naar een streepje en typt het kind het getal.
       * "tussen": een wijzertje boven de lijn draagt een getal en het kind typt
       * in twee vakjes óp de lijn tussen welke twee streepjes dat getal ligt.
       * "schatten": een lege lijn met alleen het begin en het eind, waarop het
       * kind Vos vrij naar de geschatte plek schuift.
       *
       * Ontbreekt het veld, dan is het schuiven: zo zijn de vragen van vóór de
       * invulstand opgeslagen, en die moeten blijven werken.
       */
      stand?: "schuiven" | "invullen" | "tussen" | "schatten";
      /**
       * Het eerste gevraagde getal.
       *
       * Bij het schuiven is dat het enige; het staat op het vlaggetje. Dit veld
       * bestond al voordat de invulstand er was en blijft daarom staan.
       */
      doel: number;
      /** Alle gevraagde streepjes, van links naar rechts. Leeg = alleen `doel`. */
      gevraagd?: number[];
      /**
       * Het getal op het wijzertje boven de lijn, bij de tussenstand.
       *
       * Dat hoeft niet op een streepje te liggen — juist niet: het ligt ertussen,
       * en daar gaat de vraag over.
       */
      wijzer?: number;
      /**
       * Alleen bij het schatten: hoeveel het antwoord ernaast mag zitten.
       *
       * In echte getallen, niet in procenten — zo kan het nakijken het van de
       * vraag zelf aflezen zonder de instellingen erbij te halen. Zie `isGoed`
       * in `src/lib/antwoord.ts`.
       */
      marge?: number;
      /**
       * Alleen bij het schatten: de getallen die een hulpstreepje krijgen.
       *
       * Leeg is een kale lijn. De generator rekent ze uit, zodat de vraag en de
       * uitleg gegarandeerd dezelfde streepjes tonen.
       */
      hulplijnen?: number[];
      /** De mascotte bij de lijn, per houding een afbeelding uit het beheer. */
      vos: { wachtend: string | null; blij: string | null };
    }
  | {
      soort: "trein";
      /** De getallen zoals ze op het rangeerspoor klaarstaan. */
      wagons: number[];
      /** Van laag naar hoog, of andersom. */
      aflopend: boolean;
      /**
       * Vos als machinist: de afbeelding die in het raampje van de locomotief
       * komt te staan. Leeg of `null` = geen machinist; dan kijkt de gewone vos
       * mee vanaf de kant, zoals het hiervoor was.
       */
      machinist: { afbeelding: string | null } | null;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Welk vak? — drie of vier vakken met spulletjes erin.
       *
       * Vos houdt een kaartje vast met het gevraagde getal; de vakken zijn
       * tegelijk de knoppen. Het materiaal komt uit het sjabloon: telplaatjes,
       * kralen of blokken.
       */
      soort: "vakken";
      /** Hoeveel er in elk vak zit. */
      vakken: number[];
      /** Welk materiaal: "telplaatjes", "kralen" of "blokken". */
      materiaal: string;
      /** Welk getekend telplaatje, als het materiaal telplaatjes zijn. */
      plaatje: string;
      /** Het getal op het kaartje van Vos. */
      kaart: number;
      /** 5 = rijen van vijf, 0 = verspreid door elkaar. */
      perRij: number;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      /**
       * Vos in de bioscoop: een plek vinden in het twintigveld.
       *
       * Twee rijen van tien stoelen, waarvan er maar een paar een nummer
       * hebben. De stoelen zijn tegelijk de knoppen; het antwoord is het
       * stoelnummer zelf.
       */
      soort: "bioscoop";
      /** Hoeveel stoelen er staan. */
      aantal: number;
      perRij: number;
      /** Bij welke stoelen het nummer zichtbaar is. */
      zichtbaar: number[];
      /** Het getal op het kaartje van Vos. */
      gezocht: number;
      /** De mascotte, per houding een eigen afbeelding uit het beheer. */
      vos: { vangend: string | null; wachtend: string | null; blij: string | null };
    }
  | {
      soort: "telrij";
      /**
       * De figuren naast elkaar, elk met zijn eigen aantal telbare onderdelen.
       * Het antwoord is die aantallen, in deze volgorde.
       */
      items: { soort: string; aantal: number }[];
      /** Welk kleurenpaar. De namen staan in `Figuurtekening`. */
      palet: string;
    }
  | {
      soort: "bus";
      animatie?: "instappen" | "wegrijden";
      plaatsen?: number;
      /** Hoeveel kinderen er in de bus zitten. Dit is ook het antwoord. */
      totaal: number;
      /**
       * Hoeveel kinderen er in één raam passen. Vijf geeft de vijfstructuur:
       * het kind telt met sprongen mee in plaats van poppetje voor poppetje.
       */
      perGroep: number;
      /**
       * Welk kleurenpaar voor de poppetjes; de kleur wisselt per raam. De
       * namen staan in `Figuurtekening`.
       */
      palet: string;
    }
  | {
      /**
       * De kale deelsom: 8 : 2 = ▢.
       *
       * Met een dubbele punt, zoals op school en zoals in WERKPLAN.md staat —
       * nooit een breukstreep of een deelteken. Gele vakjes voor wat gegeven
       * is, één wit vakje voor de uitkomst.
       */
      soort: "deelsom";
      geheel: number;
      deler: number;
    }
  | {
      /**
       * Vijf deelsommen links, vijf losse uitkomsten rechts.
       *
       * Hergebruikt het koppel-onderdeel dat er al is; alleen het teken ertussen
       * verschilt. Het antwoord is per rij de uitkomst, van boven naar beneden.
       */
      soort: "deelkoppelen";
      sommen: { eerste: number; tweede: number }[];
      keuzes: number[];
    }
  | {
      /**
       * Een uitkomst staat er; welke deelsom past daarbij? ▢ : ▢ = 5
       *
       * Elke deelsom die klopt is goed: 10 : 2 en 45 : 9 allebei. Daarom staat
       * hier niet één antwoord maar de grens waarbinnen een deelsom mag vallen:
       * `max` is het grootste getal waardoor gedeeld mag worden. Het nakijken
       * rekent zelf uit of het paar klopt.
       */
      soort: "welkedeelsom";
      uitkomst: number;
      max: number;
    }
  | {
      /** De kale keersom: 3 × 5 = ▢, met een echt maalteken. */
      soort: "keersom";
      eerste: number;
      tweede: number;
    }
  | {
      /** Vijf keersommen links, vijf losse uitkomsten rechts. */
      soort: "keerkoppelen";
      sommen: { eerste: number; tweede: number }[];
      keuzes: number[];
    }
  | {
      /**
       * Een uitkomst staat er; welke keersom past daarbij? ▢ × ▢ = 24
       *
       * Net als bij `welkedeelsom`: elke keersom die klopt is goed, dus 3 × 8 en
       * 4 × 6 allebei. `max` is het grootste getal dat een van de twee mag zijn.
       */
      soort: "welkekeersom";
      uitkomst: number;
      max: number;
    }
  | {
      /**
       * Blokjes in rijen en kolommen; hoeveel zijn het er samen?
       *
       * De eerste stap naar een keersom: je ziet dat vijf rijen van drie
       * hetzelfde is als vijftien. Een echt raster met even grote vakjes en
       * even veel ruimte ertussen, zodat de rijen en de kolommen allebei te
       * volgen zijn.
       */
      soort: "keerraster";
      rijen: number;
      kolommen: number;
    }
  | {
      /**
       * Dezelfde opstelling, maar met plaatjes, en het kind vult de hele som in:
       * ▢ × ▢ = ▢.
       *
       * Hoogstens vijf op een rij (ONTWERPREGELS.md), dus `kolommen` gaat niet
       * boven de vijf.
       */
      soort: "keerplaatjes";
      rijen: number;
      kolommen: number;
      voorwerp: string;
    }
  | {
      /**
       * Handig rekenen: een som die je al kent, en daarmee een nieuwe maken.
       *
       * Boven staat de bekende som helemaal uitgerekend (1 × 5 = 5), eronder de
       * nieuwe met een leeg vakje (1 × 10 = ▢). `stap` zegt hoe de tweede uit
       * de eerste volgt: "dubbel" of "tienkeer".
       */
      soort: "handigkeer";
      tafel: number;
      mee: number;
      stap: string;
    }
  | {
      /**
       * Rekenen met nullen: drie sommen onder elkaar.
       *
       * 2 × ▢ = 6, 2 × ▢ = 60, 2 × ▢ = 600. Hetzelfde eerste getal, en de
       * uitkomst krijgt er elke regel een nul bij; het antwoord dus ook.
       */
      soort: "keernullen";
      tafel: number;
      mee: number;
    }
  | {
      /**
       * Bij elke deelsom de keersom die erbij hoort slepen.
       *
       * Links de deelsommen (20 : 5), rechts de keersommen als kaartje
       * (5 × 4). Het antwoord is per rij het nummer van de keersom die erbij
       * hoort, van boven naar beneden.
       */
      soort: "keerdeelkoppelen";
      sommen: { geheel: number; deler: number }[];
      keuzes: { eerste: number; tweede: number }[];
    }
  | {
      /**
       * Twee sommen onder elkaar die over hetzelfde gaan: 20 : 2 = ▢ en
       * ▢ × 2 = 20.
       *
       * Zo ziet een kind dat een deelsom en een keersom twee kanten van
       * dezelfde som zijn. Beide vakjes krijgen hetzelfde antwoord.
       */
      soort: "keerdeelsamen";
      geheel: number;
      deler: number;
    }
  | {
      /**
       * Een kraampje met twee of drie producten en een prijs in hele euro's.
       *
       * Het kind rekent uit wat een aantal daarvan samen kost, en bij `betaald`
       * ook hoeveel het terugkrijgt. Prijzen en aantallen in hele euro's, zodat
       * het een keersom blijft en geen kommagetal wordt.
       */
      soort: "marktkraam";
      waren: { naam: string; prijs: number; aantal: number }[];
      /** Waarmee er betaald wordt, of null: dan is de vraag het totaal. */
      betaald: number | null;
    }
  // -------------------------------------------------------------------------
  // Het domein Tijd
  // -------------------------------------------------------------------------
  | {
      /**
       * Hoeveel minuten er in een tijd gaan: 1 uur = ▢ minuten.
       *
       * De zin staat in de figuur en niet in de vraagtekst, want hij hoort bij
       * deze ene opgave: "een half uur", "de helft van 20 minuten". `eenheid`
       * is het woord achter het invulvakje.
       */
      soort: "urenminuten";
      zin: string;
      uitkomst: number;
      eenheid: string;
    }
  | {
      /** Een digitale tijd, en het kind kiest het dagdeel uit vier. */
      soort: "dagdeel";
      uur: number;
      minuut: number;
      keuzes: string[];
      /** Het nummer van de knop die goed is; de keuzes staan door elkaar. */
      goed: number;
    }
  | {
      /**
       * Een wijzerklok aflezen; het kind kiest uit vier antwoorden.
       *
       * `antwoordsoort` is "woorden" ("half drie") of "digitaal" ("14:30"). Bij
       * de digitale stand staat het dagdeel erbij, want zonder dat valt 8 uur
       * 's ochtends niet van 8 uur 's avonds te onderscheiden.
       */
      soort: "klokaflezen";
      uur: number;
      minuut: number;
      antwoordsoort: string;
      metDagdeel: boolean;
      keuzes: string[];
      goed: number;
    }
  | {
      /**
       * Welke klok hoort erbij? Vier klokken om uit te kiezen.
       *
       * `vraag` zegt wat er boven staat: "woorden" (de tijd in woorden),
       * "digitaal" (een digitale tijd) of "verschuiving" (een klok met een zin
       * als "Over 2 uur ga je naar huis").
       */
      soort: "klokkiezen";
      vraag: string;
      /** De tijd waar het om gaat; bij "verschuiving" is dit de begintijd. */
      uur: number;
      minuut: number;
      /** Hoeveel minuten later, alleen bij "verschuiving". */
      stap: number;
      zin: string;
      keuzes: { uur: number; minuut: number }[];
    }
  | {
      /**
       * Het kind zet zelf de wijzers.
       *
       * `opdracht` is "tijd" (zet de klok op zes uur) of "verschuiving" (een
       * klok staat er al, zet hem zoveel later of eerder). `stap` zegt hoe fijn
       * de grote wijzer mag staan: 30 voor halve uren, 15 voor kwartieren.
       */
      soort: "klokzetten";
      opdracht: string;
      uur: number;
      minuut: number;
      /** Hoeveel minuten vooruit of terug; 0 bij de stand "tijd". */
      schuif: number;
      zin: string;
      stap: number;
      /** Waar de wijzers staan voordat het kind ze verzet. Ontbreekt: twaalf uur. */
      begin?: { uur: number; minuut: number };
    }
  | {
      /** Drie wijzerklokken met de digitale tijden eronder te slepen. */
      soort: "klokkoppelen";
      klokken: { uur: number; minuut: number }[];
      keuzes: { uur: number; minuut: number }[];
    }
  | {
      /** Vier klokken van vroeg naar laat slepen. */
      soort: "klokkenvolgorde";
      klokken: { uur: number; minuut: number }[];
    }
  | {
      /** Een klok en het dagdeel; het kind typt de tijd in twee vakjes. */
      soort: "kloktypen";
      uur: number;
      minuut: number;
      metDagdeel: boolean;
    }
  | {
      /** Tik op de wijzer die gevraagd wordt: die van de uren of die van de minuten. */
      soort: "wijzeraanwijzen";
      uur: number;
      minuut: number;
      gevraagd: string;
    }
  | {
      /** Een klok met een zin erbij; klopt het? Ja of nee. */
      soort: "klokklopt";
      uur: number;
      minuut: number;
      bewering: string;
      klopt: boolean;
    }
  | {
      /**
       * Hoe lang duurt het? Een klok met de begintijd en een zin met de eindtijd.
       *
       * Het kind typt het antwoord in twee vakjes: ▢ uur ▢ minuten. `richting`
       * is "duur" (vooruit) of "geleden" (terug); bij "geleden" staat de latere
       * tijd op de klok.
       */
      soort: "klokduur";
      uur: number;
      minuut: number;
      /** De andere tijd, uit de zin. */
      andereUur: number;
      andereMinuut: number;
      richting: string;
      zin: string;
      /**
       * De klok laat altijd "nu" zien: bij "duur" de tijd dat je klaar bent,
       * bij "geleden" de tijd van nu. De zin noemt alleen de andere tijd.
       * Oudere opgaven (zonder dit veld) hadden bij "duur" de begintijd op de
       * klok.
       */
      klokIsNu?: boolean;
      /**
       * Kiezen uit vier knoppen in schooltaal, van kort naar lang ("een half
       * uur", "een uur", "anderhalf uur", "twee uur"); `goed` is de goede knop.
       * Leeg = typen in de vakjes ▢ uur ▢ minuten.
       */
      keuzes?: string[] | null;
      goed?: number;
    }
  | {
      /** Een digitale klok; tik op het urendeel of het minutendeel. */
      soort: "digitaaldelen";
      uur: number;
      minuut: number;
      gevraagd: string;
      /** Staat er eerst een korte uitleg bij? */
      metUitleg: boolean;
    }
  | {
      /** Een korte situatie met een digitale klok; kies de tijd met het dagdeel. */
      soort: "digitaaldagdeel";
      uur: number;
      minuut: number;
      zin: string;
      keuzes: string[];
      goed: number;
    }
  | {
      /** Een digitale tijd aflezen; het kind kiest uit vier antwoorden in woorden. */
      soort: "digitaalaflezen";
      uur: number;
      minuut: number;
      keuzes: string[];
      goed: number;
    }
  | {
      /**
       * Twee digitale klokken; hoeveel tijd zit ertussen?
       *
       * Het kind typt ▢ uur ▢ minuten, allebei verplicht; bij hele uren een 0
       * bij de minuten.
       */
      soort: "digitaalverschil";
      eersteUur: number;
      eersteMinuut: number;
      tweedeUur: number;
      tweedeMinuut: number;
      richting: string;
    }
  | {
      /** Een wijzerklok met een vlek erop; kies de tijd uit vier antwoorden. */
      soort: "klokvlek";
      uur: number;
      minuut: number;
      keuzes: string[];
      goed: number;
      vlek: { hoek: number; afstand: number; grootte: number; kleur: string };
    }
  | {
      /** Een vraag over de dagen van de week; het kind kiest uit drie. */
      soort: "dagvraag";
      zin: string;
      keuzes: string[];
      goed: number;
    }
  | {
      /**
       * Een rij dagen met gaten; het kind typt de ontbrekende dagen.
       *
       * `rij` bevat de dagen op hun plek; `null` is een gat. Het antwoord is wat
       * er in de gaten hoort, van links naar rechts.
       */
      soort: "dagenaanvullen";
      rij: (string | null)[];
      /** Wat er in de gaten hoort, van links naar rechts. */
      ontbreekt: string[];
    }
  | {
      /** Een vraag over de maanden van het jaar; het kind kiest uit drie. */
      soort: "maandvraag";
      zin: string;
      keuzes: string[];
      goed: number;
    }
  | {
      /** Een rij maanden met één gat; met of zonder de jaarcirkel als hulp. */
      soort: "maandenaanvullen";
      rij: (string | null)[];
      ontbreekt: string[];
      jaarcirkel: boolean;
    }
  | {
      /**
       * Een maandkalender met een vraag over een weekdag.
       *
       * `dag` is de datum waar het om gaat, `schuif` hoeveel dagen vooruit of
       * terug. Het kind kiest de weekdag uit vier.
       */
      soort: "kalenderdag";
      jaar: number;
      maand: number;
      dag: number;
      schuif: number;
      zin: string;
      keuzes: string[];
      goed: number;
    }
  | {
      /** Tik de gevraagde dag aan in de kalender; het antwoord is de datum. */
      soort: "kalenderzoek";
      jaar: number;
      maand: number;
      zin: string;
      juisteDag: number;
    }
  | {
      /** Hoeveel dagen of hoeveel zondagen heeft deze maand? Het kind typt het getal. */
      soort: "kalenderaantal";
      jaar: number;
      maand: number;
      zin: string;
      uitkomst: number;
    }
  | {
      /**
       * Welke datum is het dan? Het kind kiest uit vier datums.
       *
       * Bij een verschuiving over de maandgrens staan er twee kalenders naast
       * elkaar: deze maand en de volgende.
       */
      soort: "kalenderdatum";
      jaar: number;
      maand: number;
      dag: number;
      schuif: number;
      zin: string;
      keuzes: string[];
      goed: number;
      tweedeMaand: boolean;
    }
  | {
      /** Hoeveel nachtjes nog slapen? Het kind typt het getal. */
      soort: "kalendernachtjes";
      jaar: number;
      maand: number;
      dag: number;
      doel: number;
      zin: string;
    }
  /*
    ---------------------------------------------------------------------------
    Het domein Geld
    ---------------------------------------------------------------------------
    Alle bedragen in centen, als heel getal; zie `lib/geld.ts`. Een groepje
    geld is een lijst munten en briefjes, ook in centen: [2000, 500, 50] is een
    briefje van 20, een van 5 en een munt van 50 cent.

    Bij een getypt bedrag is het antwoord altijd "euro's,centen" met twee
    cijfers centen: "26,00". Bij een keuze het nummer van de knop.
  */
  | {
      /** Tik op het geldstuk dat het meest of het minst waard is. */
      soort: "geldkiezen";
      stukken: number[];
      vraag: "meest" | "minst";
      goed: number;
    }
  | {
      /** Sleep de munten en briefjes van weinig naar veel waard. */
      soort: "geldvolgorde";
      stukken: number[];
    }
  | {
      /**
       * Tel het geld en typ het bedrag. `invoer` zegt hoe: "bedrag" is € ▢,▢,
       * "eurocent" is ▢ euro ▢ cent.
       */
      soort: "geldtellen";
      stukken: number[];
      invoer: "bedrag" | "eurocent";
    }
  | {
      /**
       * Leg zelf een bedrag door op munten en briefjes te tikken. Elke goede
       * manier telt: het antwoord is het bedrag, niet welke munten.
       */
      soort: "geldleggen";
      doel: number;
      /** De munten en briefjes waaruit het kind mag kiezen. */
      voorraad: number[];
      /** Een voorwerp met een prijskaartje erbij, of null. */
      voorwerp: string | null;
    }
  | {
      /** Zoveel munten van zoveel: hoeveel munten en hoeveel euro? */
      soort: "muntenofeuros";
      munt: number;
      aantal: number;
    }
  | {
      /**
       * Drie of vier vakjes met geld; tik op het goede vakje.
       *
       * `stand` zegt welk vakje dat is: het grootste bedrag, precies de prijs,
       * of precies het wisselgeld.
       */
      soort: "geldgroepen";
      stand: "grootste" | "precies" | "wisselgeld" | "wisselen";
      groepen: number[][];
      /**
       * Bij "wisselen": het ene briefje of de ene munt dat gewisseld wordt. De
       * vakjes zijn dan kaartjes zonder letter; het kind tikt op het kaartje.
       * Bij de andere standen leeg (en bij oudere opgaven afwezig).
       */
      wissel?: number | null;
      goed: number;
      prijs: number | null;
      betaald: number | null;
      voorwerp: string | null;
      zin: string;
    }
  | {
      /**
       * Geldnotatie: een bedrag goed opschrijven.
       *
       *   schrijfwijze  "52 euro" — kies de goede schrijfwijze uit `keuzes`
       *   tellen        getekend geld — typ het bedrag met komma
       *   woorden       "zeven euro en vijftig cent" — typ het bedrag
       *
       * Getypt wordt in één gewoon invoerveld. Bij `heel` staat ",-" er al
       * achter en typt het kind alleen de euro's.
       */
      soort: "geldnotatie";
      stand: "schrijfwijze" | "tellen" | "woorden";
      bedrag: number;
      stukken: number[] | null;
      woorden: string | null;
      keuzes: string[] | null;
      goed: number;
      heel: boolean;
    }
  | {
      /** Vier groepjes geld, precies twee kloppen met de prijs. */
      soort: "welkegroepjes";
      groepen: number[][];
      prijs: number;
      voorwerp: string;
    }
  | {
      /** 3 × 20 cent = ▢ × 10 cent. */
      soort: "evenveel";
      aantal: number;
      van: number;
      naar: number;
    }
  | {
      /**
       * Een prijs en het geld dat er al ligt. Kies de munt die ontbreekt, of
       * typ het bedrag dat nog ontbreekt (`keuzes` is dan null).
       */
      soort: "geldontbreekt";
      prijs: number;
      liggend: number[];
      voorwerp: string;
      keuzes: number[] | null;
      goed: number;
    }
  | {
      /**
       * Een som met geld: links een groepje, dan + of −, dan nog een groepje.
       * `invoer` zegt hoe het antwoord getypt wordt.
       */
      soort: "geldsom";
      links: number[];
      rechts: number[];
      teken: "+" | "-";
      invoer: "bedrag" | "eurocent" | "euro";
    }
  | {
      /**
       * Een verhaaltje over betalen: hoeveel krijg je terug, hoeveel blijft er
       * over, wat kostte het? Kiezen uit vier bedragen of zelf typen.
       */
      soort: "geldverhaal";
      stand: "wisselgeld" | "over" | "prijs";
      zin: string;
      uitkomst: number;
      keuzes: number[] | null;
      goed: number;
    }
  | {
      /** Een budget en vijf zinnen; bij elke zin Ja of Nee. */
      soort: "kunjebetalen";
      budget: number;
      naam: string;
      regels: { aantal: number; prijs: number; ding: string }[];
    }
  | {
      /** Een bonnetje met drie regels: het totaal, of één prijs die kwijt is. */
      soort: "bonnetje";
      plek: string;
      regels: { ding: string; prijs: number }[];
      /** Welke regel onleesbaar is, of null als het totaal gevraagd wordt. */
      kwijt: number | null;
    }
  | {
      /** Een prijs afronden op hele en halve euro's. */
      soort: "geldafronden";
      prijs: number;
      keuzes: number[] | null;
      goed: number;
    }
  | {
      /**
       * Schatten met afgeronde bedragen. Bij "samenstap" drie vakjes: eerst de
       * twee prijzen afgerond, dan het totaal.
       */
      soort: "geldschatten";
      stand: "samenstap" | "samen" | "over";
      zin: string;
      prijzen: number[];
      portemonnee: number | null;
      keuzes: number[] | null;
      goed: number;
    }
  | {
      /** Een aanbieding: hoeveel korting, of wat je na de korting betaalt. */
      soort: "geldkorting";
      stand: "korting" | "prijsna";
      was: number;
      korting: number;
      keuzes: number[] | null;
      goed: number;
    };

// ---------------------------------------------------------------------------
// Instellingen: het beheerscherm bouwt hier het formulier uit op
// ---------------------------------------------------------------------------

/**
 * Begint deze som met een beeld waarin het kind het zelf doet?
 *
 * Staat in de figuur van de vraag, gezet door de generator uit de instelling
 * "hoeveel sommen beginnen met het beeld erbij". Het oefenscherm zet zulke
 * sommen vooraan in de serie, zodat een kind eerst ziet waaróm het klopt en
 * daarna pas kaal oefent. Figuren zonder dit veld — alles wat er al was —
 * leveren `false` en houden dus precies de volgorde die ze hadden.
 */
export function isVisueleSom(figuur: Figuur | null | undefined): boolean {
  return !!figuur && "visueel" in figuur && figuur.visueel === true;
}

export type Veld =
  | {
      soort: "getal";
      sleutel: string;
      label: string;
      min: number;
      max: number;
      hulp?: string;
      /**
       * Hoe fijn er versteld mag worden. Weggelaten = per heel getal.
       *
       * Nodig voor waardes die geen aantal zijn maar een plek: het puntje van
       * een hengel op een plaatje bijvoorbeeld, waar een tiende procent al
       * scheelt of het touw er wel of niet aan vastzit.
       */
      stap?: number;
    }
  | {
      soort: "tekst";
      sleutel: string;
      label: string;
      hulp?: string;
      /** Wat er grijs in het veld staat zolang het leeg is. */
      plaatshouder?: string;
    }
  | { soort: "vinkje"; sleutel: string; label: string; hulp?: string }
  | {
      soort: "keuze";
      sleutel: string;
      label: string;
      opties: { waarde: string; label: string }[];
      hulp?: string;
    }
  | {
      soort: "vinkjes";
      sleutel: string;
      label: string;
      opties: { waarde: string; label: string }[];
      hulp?: string;
    }
  | {
      /**
       * Een afbeelding uit het afbeeldingenbeheer.
       *
       * Levert de bestandsnaam op, net als bij een vraag. Zo kan een sjabloon
       * een plaatje meegeven — de mascotte op de stapstenen bijvoorbeeld —
       * zonder dat dat plaatje in de code hoeft te staan.
       */
      soort: "afbeelding";
      sleutel: string;
      label: string;
      hulp?: string;
    };

export type Instellingen = Record<string, string | number | boolean | string[]>;

// ---------------------------------------------------------------------------
// Wat een generator oplevert
// ---------------------------------------------------------------------------

export type Gegenereerd = {
  /** Korte omschrijving van de som, om dubbele te herkennen: "tafels:6x4". */
  handtekening: string;
  vorm: Vraagvorm;
  vraagtekst: string;
  opties?: AntwoordOptie[];
  antwoord: string;
  figuur?: Figuur | null;
  /**
   * De getallen achter de som. Hiermee kan bij een fout antwoord worden
   * gekeken welke denkfout er waarschijnlijk is gemaakt.
   */
  somgegevens: Somgegevens;
};

export type Generator = {
  id: string;
  naam: string;
  uitleg: string;
  /** Suggestie per groep, zodat je niet hoeft na te denken over bereiken. */
  suggestie: string;
  velden: Veld[];
  standaard: Instellingen;
  /**
   * De standaardzin bij dit type, per leeftijdsgroep.
   *
   * VERPLICHT, zodat elk type in het beheer op dezelfde manier aan te passen
   * is. De beheerder kan de zin per sjabloon overschrijven — zie
   * `vraagtekstVelden` en `bepaalVraagtekst` hieronder.
   *
   * In de zin mag `{som}` staan; dat wordt vervangen door wat `som()` van deze
   * som maakt ("7 × 8", "48 − 6"). Bij een type waar de vraag ÍS de som is de
   * standaardzin dus gewoon "Hoeveel is {som}?", en kan een beheerder er
   * bijvoorbeeld "Reken uit: {som}" van maken.
   */
  vraagteksten: {
    standaard: Record<Leeftijdsgroep, string>;
    /** Hoe `{som}` eruitziet. Weglaten als het type geen som in de zin heeft. */
    som?: (s: Somgegevens) => string;
  };
  /**
   * VERPLICHT. De denkfouten die bij dit soort som horen. Zonder patronen is
   * een type niet af; de beheeromgeving waarschuwt daarvoor.
   */
  foutpatronen: Foutpatroon[];
  /**
   * VERPLICHT. Hoe je zo'n som aanpakt, los van wat er misging. Dit is wat een
   * kind ziet als er geen denkfout wordt herkend, en het levert ook de stappen
   * voor "Laat het me zien" en de zin met het antwoord plus de controle.
   */
  aanpak: Aanpak;
  /**
   * VERPLICHT. De uitleg-animatie voor alle drie de groepsvormen. Zolang een
   * vorm nog ontbreekt geeft het script `null` terug; er wordt dan
   * teruggevallen op de stappenlijst en de beheeromgeving waarschuwt.
   */
  uitleganimatie: Uitlegbron;
  /** Hoeveel verschillende sommen er hoogstens mogelijk zijn, of null. */
  maximum: (inst: Instellingen) => number | null;
  /**
   * Wat er mis is met deze instellingen, in gewone taal — of `null` als er
   * niets aan de hand is.
   *
   * Bedoeld voor het beheervoorbeeld: komen er geen sommen uit, dan hoort er te
   * staan wáárom, en wat je eraan kunt doen. "Er komen geen sommen uit" laat
   * een beheerder zelf puzzelen; "de rij past niet in dit bereik" zegt precies
   * welke knop hij moet omzetten. Laat een type dit weg, dan blijft de
   * algemene zin staan die er altijd stond.
   */
  waarschuwing?: (inst: Instellingen) => string | null;
  /**
   * Iets om op te letten, terwijl er wél gewoon sommen uitkomen.
   *
   * `waarschuwing` hierboven verschijnt alleen als er niets uit de
   * instellingen komt. Dit is voor het geval dat er wel sommen zijn, maar er
   * iets aan te merken valt — bijvoorbeeld zoveel streepjes op een getallenlijn
   * dat de getallen niet meer te lezen zijn. Het voorbeeld laat hem boven de
   * lijst zien; hij houdt niets tegen.
   */
  letOp?: (inst: Instellingen) => string | null;
  /**
   * Maakt sommen. `alGebruikt` bevat handtekeningen die al bestaan; die worden
   * overgeslagen. Levert er hoogstens `aantal` op — soms minder, als alles op
   * is.
   */
  maak: (
    inst: Instellingen,
    aantal: number,
    alGebruikt: Set<string>,
    zaad: number,
    /** Voor welke groep wordt er gemaakt; bepaalt welke vraagzin erbij hoort. */
    groep: number,
  ) => Gegenereerd[];
};

/**
 * Hoeveel sommen er hoogstens in één keer gemaakt worden.
 *
 * Eén grens voor het hele generator-systeem, niet per type: een nieuw type
 * krijgt hem dus vanzelf mee, zonder er iets voor te hoeven opgeven.
 *
 * De grens staat bewust hoog. Hij is er niet om te bepalen hoeveel sommen
 * zinnig zijn — dat bepaal jij — maar alleen om een vertypt getal (50000 in
 * plaats van 500) niet te laten uitlopen op een browser die minutenlang staat
 * te rekenen. Wat je in de praktijk tegenhoudt is het NATUURLIJKE maximum: het
 * aantal verschillende sommen dat bij de gekozen instellingen bestaat. Dat
 * getal staat in het beheer onder het voorbeeld.
 */
export const MAX_SOMMEN_PER_KEER = 5000;

// ---------------------------------------------------------------------------
// Hulpjes die de generatoren delen
// ---------------------------------------------------------------------------

/** Voorspelbare toevalsgenerator: hetzelfde zaad geeft dezelfde sommen. */
export function kansGenerator(zaad: number): () => number {
  let a = (zaad || 1) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function heelGetal(kans: () => number, van: number, tot: number): number {
  return van + Math.floor(kans() * (tot - van + 1));
}

export function kiesUit<T>(kans: () => number, lijst: T[]): T {
  return lijst[Math.floor(kans() * lijst.length)];
}

export function husselen<T>(kans: () => number, lijst: T[]): T[] {
  const uit = [...lijst];
  for (let i = uit.length - 1; i > 0; i--) {
    const j = Math.floor(kans() * (i + 1));
    [uit[i], uit[j]] = [uit[j], uit[i]];
  }
  return uit;
}

/**
 * Elke opgave één keer, en daarna nog eens in een tweede variant.
 *
 * Voor oefeningen waar maar twaalf vragen bestaan — de hele uren, de maanden —
 * terwijl een ronde er vijftien telt, zonder dubbele. Eerst komt elke vraag in
 * variant 0, in willekeurige volgorde; pas als die op zijn, volgen dezelfde
 * vragen in variant 1: andere foute keuzes, een andere plek voor de vlek, een
 * andere beginstand van de wijzers. Wat een variant precies is, bepaalt de
 * generator zelf.
 */
export function metTweedeVariant<T>(
  kans: () => number,
  lijst: T[],
): { item: T; variant: 0 | 1 }[] {
  return [
    ...husselen(kans, lijst).map((item) => ({ item, variant: 0 as const })),
    ...husselen(kans, lijst).map((item) => ({ item, variant: 1 as const })),
  ];
}

/** Een lijst een plek doorgeschoven: [a, b, c] wordt [b, c, a]. */
export function doorgeschoven<T>(lijst: T[], stappen: number): T[] {
  if (lijst.length === 0) return lijst;
  const n = stappen % lijst.length;
  return [...lijst.slice(n), ...lijst.slice(0, n)];
}

export function getal(inst: Instellingen, sleutel: string, terugval: number): number {
  const w = Number(inst[sleutel]);
  return Number.isFinite(w) ? w : terugval;
}

/**
 * De vingerafdruk van een stel instellingen.
 *
 * Eén tekst die verandert zodra er iets aan de instellingen verandert, met de
 * sleutels op alfabet zodat de volgorde niet meetelt. Elke som krijgt hem mee
 * bij het maken; het beheerscherm vergelijkt hem later met de instellingen die
 * er dan staan, en kan zo zeggen dat de sommen die er liggen niet meer bij de
 * instellingen passen.
 *
 * Werkt voor elk generator-type: er wordt niet gekeken wát er is ingesteld,
 * alleen of het nog hetzelfde is.
 */
export function vingerafdrukVan(inst: Instellingen): string {
  const sleutels = Object.keys(inst).sort();
  return JSON.stringify(sleutels.map((s) => [s, inst[s]]));
}

export function vinkje(inst: Instellingen, sleutel: string, terugval = false): boolean {
  const w = inst[sleutel];
  return typeof w === "boolean" ? w : terugval;
}

export function tekst(inst: Instellingen, sleutel: string, terugval: string): string {
  const w = inst[sleutel];
  return typeof w === "string" && w !== "" ? w : terugval;
}

export function lijst(inst: Instellingen, sleutel: string, terugval: string[]): string[] {
  const w = inst[sleutel];
  return Array.isArray(w) && w.length > 0 ? w.map(String) : terugval;
}

/**
 * Maakt geloofwaardige foute antwoorden rond het goede antwoord.
 *
 * Eerst typische denkfouten (één te veel, één te weinig, tien ernaast), dan
 * getallen dichtbij. Nooit het goede antwoord, nooit twee dezelfde, en nooit
 * negatief tenzij dat mag.
 */
export function afleiders(
  goed: number,
  kans: () => number,
  aantal = 3,
  magNegatief = false,
): number[] {
  const kandidaten = [
    goed + 1, goed - 1, goed + 2, goed - 2,
    goed + 10, goed - 10, goed + 5, goed - 5,
    goed * 2, Math.round(goed / 2),
  ].filter((n) => Number.isInteger(n) && n !== goed && (magNegatief || n >= 0));

  const uniek = [...new Set(kandidaten)];
  const gekozen = husselen(kans, uniek).slice(0, aantal);

  // Aanvullen als er te weinig geloofwaardige kandidaten waren.
  let extra = 3;
  while (gekozen.length < aantal) {
    const n = goed + extra;
    if (n !== goed && !gekozen.includes(n) && (magNegatief || n >= 0)) gekozen.push(n);
    extra++;
    if (extra > 60) break;
  }

  return gekozen;
}

/** Bouwt een meerkeuzevraag met het goede antwoord op een willekeurige plek. */
export function meerkeuze(
  goed: number,
  kans: () => number,
  aantalOpties = 4,
  magNegatief = false,
): { opties: AntwoordOptie[]; antwoord: string } {
  const fout = afleiders(goed, kans, aantalOpties - 1, magNegatief);
  const alles = husselen(kans, [goed, ...fout]);
  return {
    opties: alles.map((n) => ({ tekst: String(n), afbeelding: null })),
    antwoord: String(alles.indexOf(goed)),
  };
}


// ---------------------------------------------------------------------------
// De vraagtekst: standaard van het type, of wat de beheerder ervan maakte
// ---------------------------------------------------------------------------

/** De sleutel van de gezamenlijke vraagtekst. */
export const VRAAGTEKST_SLEUTEL = "vraagtekst";

/** De groepen waarvoor een eigen vraagtekst ingesteld kan worden. */
export const VRAAGTEKST_GROEPEN = [3, 4, 5, 6, 7, 8] as const;

/** De sleutel van de vraagtekst voor één losse groep: 3 wordt "vraagtekst3". */
export function vraagtekstSleutel(groep: number): string {
  return `vraagtekst${groep}`;
}

/**
 * De oude sleutels, per groepsblok.
 *
 * Hier stonden ooit maar drie velden in: 3-4, 5-6 en 7-8. Sjablonen die sinds
 * die tijd niet opnieuw zijn opgeslagen, dragen die sleutels nog. Ze worden
 * daarom nog steeds GELEZEN — als terugval, onder de losse groep — zodat een
 * zin die je ooit hebt ingevuld niet stilletjes verdwijnt. Geschreven worden
 * ze niet meer.
 */
export const VRAAGTEKST_BLOK_SLEUTELS: Record<Leeftijdsgroep, string> = {
  "34": "vraagtekst34",
  "56": "vraagtekst56",
  "78": "vraagtekst78",
};

/**
 * De velden waarmee een beheerder de vraagtekst aanpast.
 *
 * Elk type krijgt precies dezelfde zeven velden, zodat het overal hetzelfde
 * werkt: één gezamenlijke zin, en daaronder een optionele zin per losse groep.
 * Leeg laten betekent: neem de zin van het niveau erboven.
 *
 * Per losse groep en niet per blok, omdat het verschil tussen groep 3 en groep
 * 4 in taal groter is dan het verschil tussen groep 5 en 6 — een zin die voor
 * groep 4 goed werkt, is voor een net begonnen groep 3 vaak al te lang.
 */
export function vraagtekstVelden(
  standaard: Record<Leeftijdsgroep, string>,
  opties: {
    /**
     * Uitleg die alleen bij dit type hoort.
     *
     * Sommige types kennen een eigen plaatshouder naast `{som}`. Die uitleg komt
     * achter de gezamenlijke tekst te staan, zodat elk type verder precies
     * dezelfde velden en dezelfde uitleg houdt.
     */
    extraHulp?: string;
    /**
     * De zin zoals het kind hem krijgt, om als grijs voorbeeld te tonen.
     *
     * Zonder dit staat de standaardzin uit de code in het grijs, en die kan een
     * plaatshouder bevatten: "Sleep de wagons {som}." Wie dat leest, ziet niet
     * wat er straks op het scherm van het kind staat. Geeft een type deze zin
     * mee, dan staat daar een echte zin — met een voorbeeldwoord op de plek van
     * de plaatshouder.
     */
    voorbeeldzinnen?: Record<Leeftijdsgroep, string>;
  } = {},
): Veld[] {
  const grijs = (blok: Leeftijdsgroep) =>
    opties.voorbeeldzinnen?.[blok] ?? standaard[blok];

  return [
    {
      soort: "tekst",
      sleutel: VRAAGTEKST_SLEUTEL,
      label: "Vraagtekst",
      plaatshouder: grijs("56"),
      hulp:
        "Leeg laten = de standaardzin van dit type. {som} wordt vervangen door de som zelf." +
        (opties.voorbeeldzinnen
          ? " Het grijze voorbeeld hiernaast laat zien hoe de zin er bij een vraag uitkomt te zien."
          : "") +
        (opties.extraHulp ? ` ${opties.extraHulp}` : ""),
    },
    ...VRAAGTEKST_GROEPEN.map((groep, i): Veld => ({
      soort: "tekst",
      sleutel: vraagtekstSleutel(groep),
      label: `Vraagtekst groep ${groep}`,
      plaatshouder: grijs(leeftijdsgroepVanGroep(groep)),
      /* De uitleg hoort maar één keer boven de rij te staan. */
      hulp: i === 0 ? "Alleen invullen als deze groep een andere zin moet krijgen." : undefined,
    })),
  ];
}

/**
 * Vult de losse groepsvelden aan vanuit de oude blokvelden.
 *
 * Bedoeld voor het beheerscherm: open je een sjabloon dat nog met 3-4/5-6/7-8
 * is opgeslagen, dan staan de zinnen meteen op de juiste losse groepen (wat bij
 * 3-4 stond, komt bij groep 3 én groep 4). Sla je daarna op, dan zijn ze
 * overgezet.
 *
 * Bewust hier en niet als migratie op de database: er wordt niets aan opgeslagen
 * gegevens veranderd zonder dat jij zelf op opslaan drukt.
 */
export function neemVraagtekstenOver(inst: Instellingen): Instellingen {
  const uit: Instellingen = { ...inst };

  for (const groep of VRAAGTEKST_GROEPEN) {
    const sleutel = vraagtekstSleutel(groep);
    if (tekst(uit, sleutel, "").trim() !== "") continue;

    const oud = tekst(uit, VRAAGTEKST_BLOK_SLEUTELS[leeftijdsgroepVanGroep(groep)], "").trim();
    if (oud !== "") uit[sleutel] = oud;
  }

  return uit;
}

/**
 * Welke zin hoort bij deze som, voor een kind uit déze groep?
 *
 * Volgorde, van meest naar minst specifiek:
 *   1. de zin voor deze losse groep ("vraagtekst4");
 *   2. de oude zin voor het groepsblok ("vraagtekst34"), voor sjablonen die
 *      nog niet opnieuw zijn opgeslagen;
 *   3. de gezamenlijke zin ("vraagtekst");
 *   4. de standaardzin van het type.
 *
 * Daarna wordt `{som}` ingevuld.
 */
/**
 * Een reeks aanvullen met dubbele sommen tot het gevraagde aantal.
 *
 * Er komen er altijd zoveel als er gevraagd zijn. Zijn er minder verschillende
 * mogelijk, dan worden eerst alle verschillende gebruikt en daarna wordt er
 * aangevuld — om de beurt, zodat de ene som er niet drie keer in zit terwijl
 * een andere er maar één keer in staat.
 *
 * Staat hier en niet bij de opslag, omdat het beheervoorbeeld in de browser
 * dezelfde reeks moet laten zien als er straks wordt weggeschreven. Twee keer
 * dezelfde rekenregel zou vroeg of laat uit elkaar lopen.
 */
export function vulAanMetDubbele<T>(nieuwe: T[], voorraad: T[], gevraagd: number): T[] {
  const reeks = [...nieuwe];
  if (reeks.length >= gevraagd || voorraad.length === 0) return reeks;

  for (let i = 0; reeks.length < gevraagd; i++) {
    reeks.push(voorraad[i % voorraad.length]);
  }
  return reeks;
}

export function bepaalVraagtekst(
  generator: Pick<Generator, "vraagteksten">,
  inst: Instellingen,
  groep: number,
  som: Somgegevens,
  /**
   * Extra woorden die in de zin mogen worden ingevuld, per plaatshouder.
   *
   * `{som}` kent elk type; dit is voor woorden die alleen bij één type bestaan
   * en niet in de somgegevens passen, want daar staan alleen getallen in. Zo
   * vult "Plaatjes tellen" hier `{plaatjes}` mee met het meervoud van het
   * plaatje dat in die vraag staat.
   *
   * Is een woord leeg, dan verdwijnt de plaatshouder én de spatie ervoor, zodat
   * er geen dubbele spatie of een zin met een gat overblijft.
   */
  woorden: Record<string, string> = {},
): string {
  const blok = leeftijdsgroepVanGroep(groep);

  const eigen = tekst(inst, vraagtekstSleutel(groep), "").trim();
  const oudBlok = tekst(inst, VRAAGTEKST_BLOK_SLEUTELS[blok], "").trim();
  const gedeeld = tekst(inst, VRAAGTEKST_SLEUTEL, "").trim();
  const zin = eigen || oudBlok || gedeeld || generator.vraagteksten.standaard[blok];

  const somtekst = generator.vraagteksten.som?.(som) ?? "";
  let uit = zin.replaceAll("{som}", somtekst);
  for (const [naam, woord] of Object.entries(woorden)) {
    uit = woord === ""
      ? uit.replaceAll(` {${naam}}`, "").replaceAll(`{${naam}}`, "")
      : uit.replaceAll(`{${naam}}`, woord);
  }
  return uit.trim();
}

/** Groep 3 t/m 8 naar de drie groepsvormen. Zelfde indeling als de uitleg. */
export function leeftijdsgroepVanGroep(groep: number): Leeftijdsgroep {
  if (groep <= 4) return "34";
  if (groep <= 6) return "56";
  return "78";
}
