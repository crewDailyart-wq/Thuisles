# Ontwerpregels

Afspraken over hoe de oefeningen eruitzien en aanvoelen. Ze gelden voor het
hele platform; wat hier staat, geldt bij elk nieuw oefentype opnieuw.

## Uiterlijk

- Gegeven getallen staan in een geel vakje met donkere cijfers. Lege vakjes
  zijn wit met een lichte rand. Oranje is alleen voor knoppen.
- Alles staat horizontaal gecentreerd in de witte kaart. De hele opdracht, van
  vraagzin tot en met Controleer, past zonder scrollen op een laptop.
- Sommen staan op één regel, bijvoorbeeld 6 + 7 = ▢.
- Lijnen, strepen en pijlen zijn donker en goed zichtbaar. Pijlen hebben een
  volle pijlpunt. Strepen zijn niet langer dan nodig.
- De rand van een actief vakje heeft dezelfde vorm als het vakje: rond bij
  rond, blaadje bij blaadje.
- Een tabel is een echte tabel met lijnen om en tussen alle vakken, zoals een
  schooltabel. Alle vakken zijn even groot. Gegeven vakken hebben een
  zachtgele achtergrond met een groot, donker getal; in te vullen vakken
  hebben een wit invulvakje in het midden. Geen losse strepen in plaats van
  tabellijnen.
- Elke opdracht moet visueel sterk zijn: je ziet in één oogopslag waar de som
  over gaat.
- Voor aftreksommen geldt deze vaste beeldtaal:
  - plaatjes staan altijd in rijtjes van 5;
  - wat eraf gaat is grijs en half doorzichtig, wat overblijft is fel;
  - het totaal krijgt een oranje label, wat eraf gaat een grijs label, en een
    goed antwoord wordt groen;
  - grote getallen, één soort plaatje per som, geen drukte en geen extra tekst;
  - bij opdrachten met plaatjes staat de som er altijd bij, met het invulvak
    in de som;
  - de kleuren komen uit de centrale variabelen.
- Eigen Thuisles-stijl: geen titels, teksten of plaatjes letterlijk overnemen
  van andere sites.

## Uitlijnen: pijlen, lijnen, tabellen en sommen onder elkaar

Hier is het eerder misgegaan — een pijl die naast zijn vakje wees, een tabel van
losse streepjes, twee sommen die niet onder elkaar stonden. Deze regels houden
dat tegen. Ze gelden bij elke nieuwe opdracht met een pijl, een lijn, een
tabel, een klok, een kalender of geld erin.

- **Meer sommen onder elkaar staan in een raster met vaste kolommen**, niet als
  losse regels. Eén kolom per onderdeel van de som: getal, teken, getal, =,
  getal. Dan staat elk teken recht onder het teken erboven en elk vakje recht
  onder het vakje erboven, ook als het ene getal één cijfer heeft en het andere
  vier. Met losse regels verschuift alles zodra een getal breder wordt.
- **Een tabel is een echte `<table>` met `border-collapse`.** Nooit losse
  streepjes of randen per vakje: dan valt er een lijn dubbel of weg. De
  lijnkleur is `--color-tabellijn`.
- **Een pijl of lijn begint en eindigt op een echt punt**, niet ongeveer: van
  het streepje naar het midden van de bovenkant van zijn eigen vakje. Hij is
  niet langer dan nodig en heeft een volle pijlpunt.
- **Niets raakt iets anders.** Tussen een getal en een vakje zit lucht (8 px is
  genoeg); een label valt nooit over een lijn en twee vakjes overlappen nooit.
- **Een groepje vakjes staat als geheel gecentreerd**, niet per rij. Anders komt
  een laatste rij die niet vol is in het midden te staan in plaats van onder de
  rij erboven, en zijn de kolommen niet meer te volgen. Staat een groepje aan de
  rand, dan schuift het als geheel naar binnen zodat het binnen de kaart blijft.
- **Een getal dat breder is dan zijn vakje krijgt een breder vakje**, niet
  cijfers die buiten de rand uitsteken. Het vakje blijft even hoog en even
  breed als de andere zolang het getal past; zie de stand `breed` bij
  `Gegeven`.
- **Wat breder kan worden dan het scherm schuift in zijn eigen vakje**, met
  `overflow-x-auto`. De kaart eronder schuift nooit mee: de vraagzin en de knop
  Controleer blijven op hun plek.
- **Elk antwoord moet te typen zijn.** Een invulvakje neemt hoogstens drie
  cijfers, dus een opdracht mag geen antwoord boven de 999 opleveren. Laat de
  generator zulke combinaties weg in plaats van het vakje te verruimen.
- **Een pijl tussen twee dingen staat nooit in een `flex-wrap`.** Breekt de
  rij af, dan valt het tweede ding naar de volgende regel en blijft de pijl
  naast het eerste hangen, wijzend naar niets. Kies zelf: naast elkaar met →
  als alles op één regel past, anders onder elkaar met ↓. Meet dat aan het vak
  (`@container`), niet aan het scherm: het voorbeeld in de admin is smal op een
  breed scherm. Zie "Tijd vooruit en tijd terug" in `Tijdopdracht.tsx`.
- **Een rij die je in volgorde leest, breekt ook niet af.** Vier vakjes die
  over twee regels verspringen, worden een blokje van twee bij twee, en dan is
  niet meer te zien wat eerst komt. Eén rij als het past, anders onder elkaar.
- **Een wijzer loopt niet door de cijfers van de klok.** De grote wijzer houdt
  op vóór de binnenkant van de cijfers, de kleine is duidelijk korter. Een vlek
  die cijfers of een wijzer bedekt, ligt op het cijfer zelf en houdt afstand
  van de wijzers die zichtbaar moeten blijven.
- **Wat op een sleepkaartje staat, past in het vakje waar het heen moet.** Een
  getekende klok of een digitale tijd op een kaartje krijgt een kleine maat, en
  het vakje is meteen groot genoeg: het springt niet groter als het kaartje
  erin valt.
- **Twee kalenders staan in de volgorde van de tijd.** Gaat de vraag terug over
  de maandgrens, dan staat de vorige maand erbij, niet de volgende.
- **Bedragen onder elkaar hebben allemaal twee cijfers centen.** Op een
  bonnetje staat "€ 8,00" onder "€ 2,90", niet "€ 8,-": anders staan de komma's
  niet onder elkaar. Zie `bedragKassa` in `lib/geld.ts`.
- **Tussen € en het bedrag staat een vaste spatie**, zodat een zin nooit
  afbreekt met "€" aan het eind van de regel en het getal op de volgende.
- **Knoppen bij een rij zinnen staan in een eigen kolom.** Bij "Kun je het
  betalen?" mag de zin over twee regels lopen, maar Ja en Nee staan bij elke
  zin op dezelfde plek. Met `flex-wrap` sprongen ze bij de ene zin naar een
  nieuwe regel en bij de andere niet.
- **Nakijken op een smal scherm hoort erbij.** Loop een nieuwe opdracht na op
  ongeveer 375 px breed: past de hele opdracht, van vraagzin tot en met
  Controleer, zonder dat er iets over elkaar valt of buiten de kaart hangt?
## Tekst

- Zo min mogelijk tekst. De vraagzin is kort en groot, standaard "Vul in."
- Belangrijke informatie staat in de grote vraagzin, niet in een klein grijs
  tekstje. Bijvoorbeeld "Maak samen 20."
- Titels voor het kind zijn serieus en kort. Staat het bereik al in de naam van
  het onderwerp, dan niet nog eens in de titel.
- In beheer krijgt elk leerdoel een beheernaam met het bereik erin, en bij
  varianten I, II, III.

## Bediening

Alles wat je kunt slepen, toont een open handje bij de muis en een dicht
handje tijdens het slepen. Sleepkaartjes met getallen zijn even groot en even
vierkant als de vakjes waar ze in moeten.

- Het eerste lege vakje is meteen actief en de cursor springt vanzelf door naar
  het volgende lege vakje.
- Goed of fout pas na Controleer. Bij keuzes tikt of sleept het kind, kan het
  nog wijzigen, en drukt dan op Controleer; geen meerkeuze die meteen nakijkt.
- Geen cijfertoetsenbord op het scherm (regel 5): echte invoervelden.
- Slepen werkt zoals bij Verdelen in twee groepen: het kaartje hangt onder de
  vinger, het hele doelvak telt, het doelvak licht op, loslaten naast een vak
  brengt het terug, tikken werkt ook, het scherm scrollt niet mee. Bij de
  eerste vraag doet een handje één keer voor hoe je sleept.
- Als de volgorde er rekenkundig niet toe doet, zoals bij twee getallen die
  samen een doelgetal maken, kijkt het nakijken niet naar de volgorde.

## Opbouw van een opdracht

- De meeste opdrachten beginnen met een visueel stuk waarin het kind het zelf
  doet: plaatjes wegtikken, kralen wegschuiven. Zo ziet het waaróm het klopt.
  Daarna volgt gewoon oefenen. Het aantal visuele sommen aan het begin is een
  instelling in de database, standaard 3, per titel aan te passen in de admin.

## Plaatjes

- Gebruik de voorwerpen van Plaatjes tellen en de nieuwe voorwerpen (muisje,
  vogeltje, bijtje, vlinder, lieveheersbeestje, visje, peer, eikel). Per vraag
  één soort.
- Hoogstens 5 op een rij; de volgende rij staat eronder, links uitgelijnd. Geen
  gekleurde vlakken achter groepjes; groepjes gescheiden door ruimte.

## Speelse versies

- Een speelse versie is een aparte opdracht, direct onder de eenvoudige, met
  dezelfde som.
- Vos zit ín het plaatje en heeft een rol; hij staat nooit los ernaast. Tijdens
  het invullen alleen neutraal; blij of bedenkelijk pas na Controleer.
  Bewegingen kort, en geen animaties als "minder beweging" aanstaat.

## Inhoud van vragen

- 15 vragen per opdracht, geen dubbele, elke vraag precies één goed antwoord,
  alle getallen en uitkomsten binnen het bereik.
- Geen vragen met een onduidelijk antwoord, zoals een rond tiental bij "tussen
  welke tientallen", of twee paren die allebei kloppen.
- Getallen liggen vooral in het bovenste deel van het bereik; pas als die op
  zijn, lager.
- Varianten met het lege vakje: I rechts, II links, III wisselend.
- Bolletjes volgen automatisch uit de instellingen; het uiterlijk telt niet mee.
- Elk leerdoel is gekoppeld aan de juiste groep.

## Werkwijze

- Gebruik altijd de bestaande Thuisles-domeinen (Getallen, Splitsen, Optellen,
  Aftrekken, Tafels, Delen, Verhoudingen, Meten, Tijd, Geld, Meetkunde,
  Tabellen & grafieken). Maak nooit zelf een nieuw domein aan zonder
  toestemming.
- Nieuwe opdrachtsoorten worden nieuw gebouwd volgens de beschrijving, niet op
  basis van bestaande opgaven, tenzij ik dat zelf vraag.
- Altijd eerst een kopie van de database voordat er iets in de database
  verandert.
- Niets verwijderen: oude vragen worden uit de oefening gehaald, niet gewist.
