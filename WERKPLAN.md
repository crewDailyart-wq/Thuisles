# Werkplan

Wat er gebouwd wordt en in welke volgorde. Per onderwerp de titels zoals het
kind ze ziet, met de bolletjes en wat het kind er doet.

De kopjes volgen de bestaande Thuisles-domeinen. Nieuwe onderwerpen komen in
die domeinen; er wordt geen nieuw domein aangemaakt.

## Bij het bouwen altijd meenemen: SEO-basis

Geldt voor elk nieuw scherm en elk nieuw onderwerp, niet pas achteraf.

1. **Nette webadressen in gewone woorden**, bijvoorbeeld
   `/groep-4/tafels/tafel-van-3`. Het adres wordt gemaakt uit de namen in de
   database: kleine letters, streepjes tussen de woorden, geen id-nummers.
   Verandert een naam later, dan blijft het oude adres werken: dat stuurt
   automatisch door naar het nieuwe.
2. **Een eigen paginatitel en korte beschrijving per pagina**, uit de
   database, bijvoorbeeld "Tafel van 3 oefenen – groep 4 | Thuisles". Allebei
   aan te passen in de admin. Is het veld leeg, dan maakt het systeem zelf een
   nette standaardtitel.
3. **Ruimte voor openbare pagina's voor ouders**, bijvoorbeeld "Hoe leert mijn
   kind de tafels in groep 4?". Die staan los van de oefeningen achter een
   login, zodat Google ze kan lezen. Nu alleen de opzet; de teksten komen
   later.
4. **Openbare pagina's worden op de server opgebouwd**, zodat zoekmachines de
   volledige tekst zien zonder eerst JavaScript uit te voeren.
5. **De admin, de oefenpagina's en alles achter de login worden niet
   geïndexeerd** door zoekmachines: `noindex` op die pagina's en een regel in
   `robots.txt`.
6. **Ruimte voor meerdere talen bij de ouderpagina's**: Nederlands, Turks,
   Arabisch en Pools. Elke taal krijgt een eigen webadres, bijvoorbeeld
   `/tr/...`, met de juiste taalaanduiding voor zoekmachines. Nederlands is de
   standaard. Arabisch leest van rechts naar links.

## Groep 4 – Aftrekken – Aftrekken tot en met 15

Alle getallen 0 tot en met 15; de uitkomst komt nooit onder 0. De eerste
sommen van een oefening zijn visueel — het kind doet het zelf — en daarna
volgt gewoon oefenen. Hoeveel sommen dat zijn is een instelling per titel,
standaard 3.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Wegstrepen tot en met 15 | ● | Ziet bijvoorbeeld 13 appels en op het bordje "5 eraf". Tikt er zelf vijf weg — die krijgen een rood kruis — en typt hoeveel er overblijven. Elke som is visueel. |
| 2 | Een minsom bij een plaatje | ● | Ziet bijvoorbeeld 9 vogels; er schuiven er 3 vanzelf weg. Vult daarna de hele som in: ▢ − ▢ = ▢. Elke som is visueel. |
| 3 | Aftrekken met plaatjes tot en met 15 | ●● | Een som met alleen plaatjes, zonder getallen: groep − groep = ▢. Bij de eerste sommen streept het kind zelf weg, daarna rekent het zelf. |
| 4 | Aftrekken met plaatjes en getallen tot en met 15 | ●● | Hetzelfde, maar met het getal onder elk groepje. Bij de eerste sommen streept het kind zelf weg. |
| 5 | Aftrekken tot en met 15 | ●●● | De kale som: 13 − 5 = ▢. Bij de eerste sommen staat het rekenrek erbij en schuift het kind zelf de kralen weg. |
| 6 | Sommen en uitkomsten koppelen | ●●●● | Sleept elke uitkomst naar de som waar hij bij hoort; tikken werkt ook. |

Staat klaar in de database: het domein Aftrekken, het onderwerp "Aftrekken
tot en met 15", de zes leerdoelen met hun sjablonen en per titel vijftien
gepubliceerde vragen — evenveel als bij Optellen tot en met 20.

## Groep 4 – Aftrekken – Aftrekken met het rekenrek

Hetzelfde rekenrek als op school: twee rijen van tien, vijf rode en vijf witte
per rij. Eerst kijken, dan zelf schuiven, en aan het eind uit het hoofd.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Flitsen met het rekenrek | ● | Ziet het rek een paar tellen (standaard 2), daarna gaat er een kaart overheen. Typt hoeveel kralen het zag. Getallen 6 tot en met 20. |
| 2 | Aftrekken vanaf 10 | ● | Leest de som 10 − 3 = ▢, schuift zelf drie kralen weg en vult het antwoord in. Negen vragen: meer verschillende sommen bestaan er niet. |
| 3 | De kleine som | ●● | Sommen binnen het tiental, zoals 17 − 4. Na een goed antwoord verschijnt eronder: 7 − 4 = 3, dus 17 − 4 = 13. |
| 4 | Aftrekken via de 10 | ●●● | Sommen over de tien, zoals 15 − 7. De rondjes onder het bordje staan in twee groepjes en de bovenste rij licht op zodra er tien over zijn. Na een goed antwoord staan de twee stappen eronder: 15 − 5 = 10 en 10 − 2 = 8. |
| 5 | Denk aan het rekenrek | ●●●● | De kale som over de tien, zonder rek erbij. Gaat het mis, dan speelt het rek de som alsnog voor met de twee stappen. |

### Nog te doen

De andere onderwerpen van Aftrekken:

- Basisvaardigheden
- Eraf tot en met 20
- Eraf tot en met 50
- Eraf tot en met 100
- Meerkeuzevragen
- Vleksommen

Aftrekken staat even stil. Wat al gebouwd is (Aftrekken tot en met 15 en
Aftrekken met het rekenrek) blijft zoals het is.

## Groep 4 – Delen

Nog te bouwen. De basisversie zijn gewone sommen; beeld komt later. De notatie
is overal met een dubbele punt: 8 : 2.

### Onderwerp 1 — Deeltafels oefenen

Elke titel geeft kale deelsommen uit die ene deeltafel, bijvoorbeeld 8 : 2 =
▢. De uitkomsten lopen van 1 tot en met 10.

| # | Titel | Bolletjes |
|---|-------|-----------|
| 1 | Delen door 1 | ● |
| 2 | Delen door 2 | ● |
| 3 | Delen door 10 | ● |
| 4 | Delen door 5 | ●● |
| 5 | Delen door 3 | ●●● |
| 6 | Delen door 4 | ●●● |
| 7 | Delen door 6 | ●●●● |
| 8 | Delen door 8 | ●●●● |
| 9 | Delen door 7 | ●●●●● |
| 10 | Delen door 9 | ●●●●● |

### Onderwerp 2 — Deelsommen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Deelsommen tot en met 5 | ●● | Kale deelsommen door elkaar uit de deeltafels 1 tot en met 5. |
| 2 | Deelsommen tot en met 10 | ●●● | Hetzelfde, nu door elkaar uit de deeltafels 1 tot en met 10. |
| 3 | Deelsommen koppelen: tafels van 1, 2, 5 en 10 | ●●●● | Vijf deelsommen met een leeg vak ernaast; het kind sleept bij elke som het goede antwoord naar dat vak. Hergebruikt het koppel-onderdeel dat er al is. |
| 4 | Deelsommen koppelen: tafels van 1 tot en met 10 | ●●●● | Hetzelfde, met alle deeltafels. |
| 5 | Welke deelsommen passen? | ●●●●● | Het kind ziet een uitkomst, bijvoorbeeld 5, en typt zelf een deelsom die klopt: ▢ : ▢ = 5. Elke goede deelsom uit de deeltafels van 1 tot en met 10 telt goed, dus 10 : 2 en 45 : 9 zijn allebei goed. |

## Groep 4 – Tafels

Nog te bouwen. De basisversie zijn gewone sommen; beeld komt later. De notatie
is overal met een maalteken: 3 × 5.

### Onderwerp 1 — Keersommen begrijpen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Rijen en kolommen tellen | ● | Ziet blokjes in rijen, bijvoorbeeld 5 rijen van 3, en typt hoeveel het er zijn. |
| 2 | Een keersom bij een plaatje | ●● | Plaatjes in rijen; het kind vult de hele som in: ▢ × ▢ = ▢. |
| 3 | Handig rekenen met keersommen | ●●● | Ziet een som die het al kent, bijvoorbeeld 1 × 5 = 5, en maakt daarmee een nieuwe: 1 × 10 = ▢. |
| 4 | Rekenen met nullen | ●●●● | Een rijtje van drie: 2 × ▢ = 6, 2 × ▢ = 60, 2 × ▢ = 600. Niveau groep 5, als uitdaging. |

### Onderwerp 2 — Tafels oefenen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Tafels van 1 tot en met 5 | ● | Kale keersom, bijvoorbeeld 2 × 2 = ▢. |
| 2 | Tafels van 6 tot en met 10 | ●● | Hetzelfde, met de hogere tafels. |
| 3 | Tafels koppelen: 1, 2, 5 en 10 | ●● | Vijf keersommen met een leeg vak ernaast; het kind sleept bij elke som het goede antwoord naar dat vak. Hergebruikt het koppel-onderdeel dat er al is. |
| 4 | Tafels koppelen: 1 tot en met 10 | ●●● | Hetzelfde, met alle tafels. |
| 5 | Tafels van 1 tot en met 10 door elkaar | ●●● | Kale keersommen uit alle tafels door elkaar. |
| 6 | Welke keersommen passen? | ●●● | Ziet een uitkomst, bijvoorbeeld 24, en typt zelf een keersom die klopt: ▢ × ▢ = 24. Elke goede keersom telt goed, dus 3 × 8 en 4 × 6 zijn allebei goed. Alleen uitkomsten die minstens één keersom uit de tafels van 1 tot en met 10 hebben. |
| 7 | Tafels van 11 tot en met 15 | ●●●● | Niveau groep 5, als uitdaging. |
| 8 | Tafels van 16 tot en met 20 | ●●●●● | Niveau groep 5, als uitdaging. |

### Onderwerp 3 — Keersom en deelsom

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Keersom en deelsom koppelen | ●●● | Sleept bij elke deelsom, bijvoorbeeld 20 : 5, de keersom die erbij hoort, bijvoorbeeld 5 × 4. |
| 2 | Keersom en deelsom samen | ●●● | Twee sommen onder elkaar: 20 : 2 = ▢ en ▢ × 2 = 20. |

### Onderwerp 4 — Keersommen in het echt

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Boodschappen op de markt | ● | Ziet een kraampje met twee of drie producten en prijzen in hele euro's — een zak appels € 3, een brood € 2 — en rekent uit wat bijvoorbeeld 4 zakken appels en 2 broden samen kosten: € ▢. |
| 2 | Wisselgeld op de markt | ●● | Hetzelfde kraampje, met erbij: "Je betaalt met € 20. Hoeveel krijg je terug?" € ▢. |

## Groep 4 – Tijd

Nog te bouwen. De basisversie zijn gewone opdrachten; beeld komt later.

### Onderwerp 1 — Wijzerklok en digitale klok

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Uren en minuten | ● | Vult in hoeveel minuten er in een tijd gaan: 1 uur = ▢ minuten, een half uur = ▢ minuten, de helft van 20 minuten = ▢. |
| 2 | Dagdelen | ● | Ziet een digitale tijd, bijvoorbeeld 14:00, en kiest ochtend, middag, avond of nacht. |
| 3 | Hoe laat is het straks? | ●● | Ziet een wijzerklok op een heel uur en een korte zin, bijvoorbeeld "Over 2 uur ga je naar huis", en kiest de goede wijzerklok uit vier. Wisselende situaties: het zwembad, school, opa en oma, de speeltuin. |
| 4 | Zet de wijzers goed | ●● | Ziet een tijd, bijvoorbeeld 3:30, en sleept zelf de grote en de kleine wijzer op de goede plek. Hele en halve uren. |
| 5 | Van wijzerklok naar digitale tijd: hele uren | ●●● | Ziet een wijzerklok en het dagdeel, bijvoorbeeld "Het is avond", en kiest de goede digitale tijd uit vier, in 24-uursnotatie zoals 20:00. |
| 6 | Van wijzerklok naar digitale tijd: halve uren | ●●● | Hetzelfde, met halve uren. |
| 7 | Klokken koppelen | ●●●● | Sleept drie digitale tijden onder de goede wijzerklokken. Hele en halve uren door elkaar. |
| 8 | Van digitale tijd naar wijzerklok | ●●●● | Ziet een digitale tijd, bijvoorbeeld 6:30, en kiest de goede wijzerklok uit vier. |
| 9 | Schrijf de tijd digitaal | ●●●●● | Ziet een wijzerklok en het dagdeel en typt de tijd in twee vakjes: ▢ : ▢. Hele en halve uren. |

### Onderwerp 2 — De wijzerklok

Drie groepjes: eerst de klok leren aflezen, dan zelf de wijzers zetten, en
daarna uitrekenen hoe lang iets duurt.

#### Aflezen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | De grote en de kleine wijzer | ● | Ziet een wijzerklok en tikt de wijzer aan die gevraagd wordt, bijvoorbeeld "Tik op de wijzer van de uren". |
| 2 | Hele uren aflezen | ● | Ziet een wijzerklok en kiest de tijd in woorden uit vier, bijvoorbeeld "zes uur". |
| 3 | Halve uren aflezen | ●● | Hetzelfde, met halve uren: bijvoorbeeld "half drie". |
| 4 | Hele en halve uren door elkaar | ●● | Hetzelfde, hele en halve uren door elkaar. |
| 5 | Klopt de klok? | ●● | Ziet een wijzerklok met een zin erbij, bijvoorbeeld "Het is half drie", en kiest Ja of Nee. Hele en halve uren. |
| 6 | Kwartieren aflezen | ●●● | Kiest de tijd in woorden uit vier, bijvoorbeeld "kwart over één" of "kwart voor vier". |
| 7 | Welke klok hoort erbij? Hele en halve uren | ●● | Ziet een tijd in woorden, bijvoorbeeld "Het is half één", en kiest de goede wijzerklok uit vier. |
| 8 | Welke klok hoort erbij? Kwartieren | ●●● | Hetzelfde, met kwartieren. |
| 9 | Vijf voor en tien over aflezen | ●●●●● | Kiest de tijd in woorden uit vier, bijvoorbeeld "tien over twee" of "vijf voor elf". Als uitdaging. |
| 10 | Welke klok hoort erbij? Vijf voor en tien over | ●●●●● | Hetzelfde andersom: van de woorden naar de goede klok. Als uitdaging. |

#### Klok zetten

Het kind sleept zelf de grote en de kleine wijzer. Dezelfde bouwsteen als bij
"Zet de wijzers goed" in onderwerp 1.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Zet de klok: hele uren | ● | Leest bijvoorbeeld "Zet de klok op zes uur" en sleept de wijzers op hun plek. |
| 2 | Zet de klok: halve uren | ●● | Hetzelfde, bijvoorbeeld "half negen". |
| 3 | Zet de klok: kwartieren | ●●● | Hetzelfde, bijvoorbeeld "kwart voor drie". |
| 4 | Hoe laat is het straks? | ●● | Ziet een klok en een zin zoals "2 uur later" of "een half uur later", en zet de wijzers op de nieuwe tijd. Hele en halve uren. |
| 5 | Hoe laat was het eerder? | ●●● | Hetzelfde, maar terug in de tijd: bijvoorbeeld "een half uur eerder". |
| 6 | Hoe laat is het straks? Vijf voor en tien over | ●●●●● | Bijvoorbeeld: "Het is kwart voor vijf. Zet de klok 3 uur en 30 minuten later." Als uitdaging. |
| 7 | Klokken op volgorde | ●●●● | Sleept vier wijzerklokken van vroeg naar laat. |

#### Hoe lang duurt het?

Eén wijzerklok met de begintijd; de eindtijd staat in woorden in een korte zin
met een situatie: het zwembad, school, de film, opa en oma. Het kind typt het
antwoord in twee vakjes: ▢ uur ▢ minuten.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoe lang duurt het? Hele uren | ● | Bijvoorbeeld: "Je gaat om 3 uur naar het zwembad. Om 5 uur ben je klaar. Hoe lang ben je weg?" |
| 2 | Hoe lang duurt het? Halve uren | ●● | Hetzelfde, met halve uren. |
| 3 | Hoe lang duurt het? Over 12 uur heen | ●●● | Bijvoorbeeld van 11 uur 's ochtends tot 2 uur 's middags. |
| 4 | Hoe lang duurt het? Kwartieren | ●●●● | Hetzelfde, met kwartieren. |
| 5 | Hoe lang geleden? Hele uren | ● | Andersom: "Het is nu 5 uur. Om 3 uur ging je zwemmen. Hoe lang geleden is dat?" |
| 6 | Hoe lang geleden? Halve uren | ●● | Hetzelfde, met halve uren. |
| 7 | Hoe lang geleden? Kwartieren | ●●●● | Hetzelfde, met kwartieren. |
| 8 | Hoe lang? Alles door elkaar | ●●●●● | Duur en geleden door elkaar: hele en halve uren en kwartieren, ook over 12 uur heen. |

Notitie voor later: visuele versie — een tijdbalk waarop het kind met sprongen
van een uur of een half uur van de begintijd naar de eindtijd gaat.

### Onderwerp 3 — Digitale klok

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Tijden staan als digitale klok, uren:minuten, altijd twee cijfers:
  bijvoorbeeld 07:00.
- Bij aflezen kiest het kind uit vier antwoorden in woorden. De foute keuzes
  zijn echte valkuilen: bij 05:30 staan er ook "half vijf" en "vijf uur"
  tussen.
- Bij Later en Eerder ziet het kind twee klokken en typt het antwoord in twee
  vakjes: ▢ uur ▢ minuten, met een knop Controleren. Gewoon typen, geen
  getallenpad op het scherm.
- Bij Later en Eerder mogen 24-uurstijden voorkomen, bijvoorbeeld 18:30.

#### Aflezen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Uren en minuten (met uitleg) | ●●○○○ | Krijgt eerst een korte uitleg: voor de dubbele punt staan de uren, erachter de minuten. Tikt daarna op het urendeel of het minutendeel van de klok. |
| 2 | Hele uren in de dag | ●●○○○ | Ziet een korte situatie met een klok, bijvoorbeeld "Sam staat op om…", en kiest bijvoorbeeld "zeven uur 's ochtends". De keuzes hebben 's ochtends en 's avonds door elkaar. |
| 3 | Hele uren aflezen | ●●○○○ | Ziet bijvoorbeeld 08:00 en kiest "acht uur". |
| 4 | Hele en halve uren aflezen | ●●●○○ | Bijvoorbeeld 05:30 = half zes. |
| 5 | Hele uren, halve uren en kwartieren aflezen | ●●●○○ | Bijvoorbeeld 03:15 = kwart over drie, 03:45 = kwart voor vier. |
| 6 | Vijf en tien over en voor | ●●●●○ | Bijvoorbeeld 07:10 = tien over zeven, 08:55 = vijf voor negen. |
| 7 | Op de minuut | ●●●●● | Bijvoorbeeld 05:43 = dertien minuten over half zes. |

#### Later

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoeveel tijd later? Hele uren | ●○○○○ | Bijvoorbeeld 18:00 en 21:00. |
| 2 | Hoeveel tijd later? Hele uren, andere minuten | ●●○○○ | Bijvoorbeeld 06:45 en 08:45. |
| 3 | Hoeveel tijd later? Halve uren | ●●●○○ | Bijvoorbeeld 05:10 en 07:40. |
| 4 | Hoeveel tijd later? Over het hele uur heen | ●●●●○ | Bijvoorbeeld 05:50 en 08:20. |
| 5 | Hoeveel tijd later? Kwartieren | ●●●●● | Bijvoorbeeld 04:20 en 07:50. |

#### Eerder

Dezelfde vijf stappen als bij Later, maar terug in de tijd: de eerste klok is
de latere tijd.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoeveel tijd eerder? Hele uren | ●○○○○ | Bijvoorbeeld 21:00 en 19:00. |
| 2 | Hoeveel tijd eerder? Hele uren, andere minuten | ●●○○○ | Bijvoorbeeld 18:30 en 16:30. |
| 3 | Hoeveel tijd eerder? Halve uren | ●●●○○ | Bijvoorbeeld 07:40 en 05:10. |
| 4 | Hoeveel tijd eerder? Over het hele uur heen | ●●●●○ | Bijvoorbeeld 07:45 en 05:15. |
| 5 | Hoeveel tijd eerder? Kwartieren | ●●●●● | Bijvoorbeeld 07:50 en 04:20. |

### Onderwerp 4 — Wijzerklok met vlekken

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het kind ziet een wijzerklok met een vlek erop en de vraag "Hoe laat is
  het?", en kiest uit vier antwoorden in woorden, bijvoorbeeld "kwart voor
  acht", "half vijf" of "zeven uur".
- De vlek bedekt cijfers en soms een stukje van een wijzer. De tijd moet altijd
  nog te bepalen zijn: van de kleine wijzer blijft altijd minstens het puntje
  zichtbaar.
- De foute keuzes zijn echte valkuilen: kwart over 7 tegenover kwart voor 8,
  half 4 tegenover half 5, of het uur ervoor of erna.
- De vlek hoort al bij de basis: een simpele vlekvorm, op verschillende plekken
  en in verschillende kleuren. Mooie vormgeving komt later.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hele uren: cijfers onder een vlek (met uitleg) | ●○○○○ | Krijgt eerst een korte uitleg. De wijzers zijn helemaal zichtbaar, een paar cijfers zijn bedekt. |
| 2 | Hele uren: wijzer onder een vlek | ●●○○○ | Een stukje van de kleine wijzer is bedekt. |
| 3 | Halve uren: cijfers onder een vlek | ●●○○○ | Hetzelfde als 1, met halve uren. |
| 4 | Halve uren: wijzer onder een vlek | ●●●○○ | Hetzelfde als 2, met halve uren. |
| 5 | Kwart over en kwart voor: cijfers onder een vlek | ●●●○○ | Hetzelfde, met kwartieren. |
| 6 | Kwart over en kwart voor: wijzer onder een vlek | ●●●●○ | Hetzelfde, met een stukje wijzer bedekt. |
| 7 | Gemengd: cijfers onder een vlek | ●●●●○ | Hele uren, halve uren en kwartieren door elkaar. |
| 8 | Gemengd: grote vlek | ●●●●● | Het midden van de klok is bedekt; alleen de puntjes van de wijzers zijn zichtbaar. |

### Onderwerp 5 — Maanden en dagen

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- De week begint op maandag.
- Bij kiesvragen kiest het kind uit drie antwoorden.
- Bij typvragen maken hoofdletters en spaties niet uit; bij een fout ziet het
  kind de goede spelling.
- Rangtelwoorden lopen van eerste tot en met twaalfde.

#### Dagen van de week

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | De dagen op volgorde | ●○○○○ | "De tweede dag van de week is…?" Kiest uit drie. |
| 2 | Dagen aanvullen | ●○○○○ | Een rij met gaten, bijvoorbeeld dinsdag – ▢ – donderdag – ▢. Typt de ontbrekende dagen, met een knop Controleren. |
| 3 | De dag ervoor en de dag erna | ●●●○○ | "Welke dag komt 1 dag voor dinsdag?" of "2 dagen na zaterdag?" Kiest uit drie. Mag over het weekend heen: zondag → maandag. |

#### Maanden van het jaar

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | De maand erna | ●○○○○ | "Welke maand komt na mei?" Kiest uit drie. |
| 2 | De maanden op volgorde | ●●○○○ | "Wat is de achtste maand van het jaar?" Kiest uit drie. |
| 3 | Het nummer van de maand | ●●○○○ | "Maart is de hoeveelste maand van het jaar?" Kiest uit drie, bijvoorbeeld derde. |
| 4 | Maanden aanvullen met jaarcirkel | ●●●○○ | Een rij met een gat, bijvoorbeeld juni – ▢ – augustus – september. Typt de ontbrekende maand. Er staat een jaarcirkel bij als hulp: een simpele cirkel met twaalf genummerde vakjes, januari bovenaan. |
| 5 | Maanden aanvullen zonder hulp | ●●●○○ | Hetzelfde, zonder jaarcirkel. |
| 6 | Maanden ervoor en erna | ●●●●○ | "Welke maand komt 2 maanden voor maart?" Eén tot en met drie maanden, binnen hetzelfde jaar. Kiest uit drie. |
| 7 | Maanden ervoor en erna over de jaargrens | ●●●●● | Bijvoorbeeld "3 maanden na november" of "2 maanden voor januari". Kiest uit drie. |

### Onderwerp 6 — Kalender

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het kind ziet een maandkalender als een simpel rooster: de maandnaam
  bovenaan, de week begint op maandag, met de kolommen ma di wo do vr za zo.
- De kalenders kloppen echt: de data vallen op de juiste weekdag. Gebruik het
  huidige of het volgende jaar.
- Bij kiesvragen kiest het kind uit vier antwoorden. In de antwoorden staan
  geen jaartallen.
- Bij typvragen typt het kind een getal en drukt op Controleren. Gewoon typen,
  geen getallenpad op het scherm.

#### Kalender lezen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Op welke dag valt het? | ●○○○○ | "Op welke dag valt 1 maart?" Kiest de weekdag uit vier. |
| 2 | Zoek de datum | ●●○○○ | "Tik op de eerste zaterdag van de maand", of op de laatste woensdag of de tweede maandag. Tikt op de juiste dag in de kalender. |
| 3 | Dagen in een maand | ●●○○○ | "Hoeveel dagen heeft deze maand?" of "Hoeveel zondagen zitten in deze maand?" Typt het getal. |

#### Gisteren en morgen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Gisteren en morgen | ●●○○○ | "Vandaag is het 18 november. Welke datum is het morgen?" — of gisteren. Vandaag is gemarkeerd in de kalender. Kiest uit vier. |
| 2 | Eergisteren en overmorgen | ●●●○○ | Hetzelfde, nu twee dagen terug of verder. |
| 3 | Een week later of eerder | ●●●○○ | "Vandaag is het 5 mei. Welke datum is het over een week?" — of een week geleden. Kiest uit vier. |

#### Rekenen met de kalender

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Dagen verder en terug | ●●●●○ | "Op welke dag valt 5 dagen voor 10 oktober?" Twee tot en met zes dagen, voor of na, binnen dezelfde maand. Kiest de weekdag uit vier. |
| 2 | Hoe lang nog? | ●●●●○ | "Vandaag is het 3 mei. Op 10 mei is het feest. Hoeveel nachtjes nog slapen?" Typt het getal, van 2 tot en met 14. |
| 3 | Over de maandgrens | ●●●●● | "Vandaag is het 29 april. Welke datum is het over 3 dagen?" Twee kalenders naast elkaar: deze maand en de volgende. Kiest uit vier. |

Er volgen nog meer onderwerpen bij Tijd.

## Groep 4 – Geld

Nog te bouwen. De basisversie zijn gewone opdrachten; visueel werk komt later.

Typen geldt in heel Geld hetzelfde: een gewoon invoerveld met € ervoor, geen
getallenpad op het scherm. Goed gerekend worden 26, 26,00 en 26,- als hetzelfde
bedrag, en 25,5 telt net zo goed als 25,50.

### Onderwerp 1 — Munten en briefjes

Algemene regels voor dit onderwerp:

- Geen foto's van echt geld, maar simpele eigen tekeningen met de waarde erop.
  De kleuren lijken op echt geld: koper voor 1, 2 en 5 cent; goud voor 10, 20
  en 50 cent; zilver met goud voor 1 en 2 euro; en de briefjes van 5, 10, 20,
  50, 100, 200 en 500 euro elk in hun eigen kleur.
- Bedragen tot 100 euro. We zeggen "briefjes".
- Bij typvragen typt het kind een getal en drukt op Controleren. Gewoon typen,
  geen getallenpad op het scherm.

#### Munten en briefjes kennen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Welke munt is het meest waard? | ●○○○○ | Ziet drie munten en tikt op de munt die het meest — of het minst — waard is. Eerst alleen euromunten, daarna alleen centmunten. |
| 2 | Munten en briefjes vergelijken | ●●○○○ | Hetzelfde, nu munten en briefjes door elkaar. Met een valkuil erin: een grote munt zoals 50 cent tegenover een klein briefje van 5 euro. |
| 3 | Van laag naar hoog | ●●●●○ | Sleept vier munten of briefjes op volgorde van weinig naar veel waard, met een knop Controleren. |

#### Geld tellen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Tel de euro's | ●●○○○ | Ziet een groepje munten van 1 euro, tot 20, en typt hoeveel euro het is. |
| 2 | Leg het bedrag | ●●●○○ | "Leg 6 euro." Tikt op een munt van 1 euro om hem in een vakje te leggen; nog een keer tikken haalt hem weer weg. Met een knop Controleren. |
| 3 | Munten of euro's? | ●●●○○ | Ziet bijvoorbeeld twee munten van 2 euro en typt ▢ munten en ▢ euro. |
| 4 | Leg het bedrag met 1 en 2 euro | ●●●●○ | Hetzelfde als Leg het bedrag, maar het kind kiest zelf munten van 1 en 2 euro. Elk goed bedrag telt, ook als het op een andere manier is gelegd. |
| 5 | Waar is het meeste geld? | ●●●●○ | Ziet drie vakjes met munten en briefjes en tikt op het vakje met het hoogste bedrag. |
| 6 | Evenveel waard | ●●●●● | Bijvoorbeeld 3 × 20 cent = ▢ × 10 cent, of 3 × 1 euro = ▢ × 50 cent. Typt het getal. |

### Onderwerp 2 — Betalen

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het geld ziet eruit zoals bij "Munten en briefjes": simpele eigen
  tekeningen, geen foto's.
- Bedragen tot 100 euro; centen alleen in tientallen, bijvoorbeeld € 4,90.
- Prijzen staan op een prijskaartje bij een simpel getekend voorwerp:
  speelgoed, een boek, fruit.
- Bij leggen tikt het kind op een munt of briefje om het in een vakje te
  leggen; nog een keer tikken haalt het weer weg, met een knop Controleren.
  Elke goede manier telt.
- Bij typvragen gewoon typen, geen getallenpad op het scherm.

#### Precies betalen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Precies betalen: briefjes | ●●○○○ | Ziet een voorwerp met een prijskaartje, bijvoorbeeld € 60,-, en drie groepjes briefjes: A, B en C. Tikt op het groepje dat precies goed is. |
| 2 | Precies betalen: munten | ●●○○○ | Hetzelfde, met munten, bijvoorbeeld € 4,90. |
| 3 | Precies betalen: alles door elkaar | ●●●○○ | Hetzelfde, met briefjes en munten door elkaar, bijvoorbeeld € 21,-. |
| 4 | Welke groepjes kloppen? | ●●●○○ | Ziet vier groepjes munten; er zijn er precies twee goed. Tikt ze allebei aan en drukt op Controleren. |

#### Zelf leggen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Bedrag leggen: 2 euro | ●○○○○ | "Leg 16 euro." Legt alleen munten van 2 euro in de vakjes; de bedragen zijn altijd even. |
| 2 | Bedrag leggen: centen | ●●○○○ | "Leg 2 euro." Kiest zelf uit munten van 10, 20 en 50 cent; elke goede manier telt. |
| 3 | Zelf precies betalen | ●●●●○ | Ziet een voorwerp met een prijskaartje en legt zelf briefjes en munten tot het precies klopt. |

#### Wat ontbreekt er?

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Welke munt ontbreekt? | ●●●○○ | Ziet een prijskaartje, bijvoorbeeld € 26,-, en het geld dat er al ligt, bijvoorbeeld € 20 + € 5. Tikt op de munt die erbij moet; keuze uit drie. |
| 2 | Hoeveel ontbreekt er? | ●●●●○ | Hetzelfde, maar nu typt het kind het bedrag dat nog ontbreekt. |

### Onderwerp 3 — Rekenen met geld

Nog te bouwen, alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het geld ziet eruit zoals bij "Munten en briefjes": simpele eigen
  tekeningen, geen foto's.
- Bedragen tot 100 euro; centen in tientallen of vijftallen.
- Korte verhaaltjes met eigen situaties: de markt, de kermis, het
  schoolreisje, de speelgoedwinkel, ijsjes.
- Gewoon typen, geen getallenpad op het scherm. Bedragen met een komma typt
  het kind als 41,50; 41.50 wordt ook goed gerekend.
- De foute keuzes zijn echte valkuilen: een euro te veel of te weinig, of tien
  cent ernaast.
- Gaat de uitleg over veel geld tellen, dan begint die bij het grootste.

#### Rekenen met munten en briefjes

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Twee munten optellen | ●○○○○ | Bijvoorbeeld 2 × 50 cent. Typt ▢ euro ▢ cent. |
| 2 | Munten eraf: 1 euro | ●○○○○ | Vijf munten van 1 euro min twee munten = ▢. Typt het getal. |
| 3 | Briefje plus munt | ●○○○○ | Bijvoorbeeld € 20 + 5 cent. Typt ▢ euro ▢ cent. |
| 4 | Twee briefjes optellen | ●○○○○ | Bijvoorbeeld € 10 + € 20. Typt ▢ euro. |
| 5 | Munten eraf: 2 euro | ●○○○○ | Hetzelfde als Munten eraf: 1 euro, met munten van 2 euro. |
| 6 | Twee groepjes bij elkaar | ●●○○○ | Een groepje munten plus een groepje munten = ▢. |
| 7 | Geld tellen: 4 stuks | ●●○○○ | Vier munten en briefjes door elkaar. Typt ▢ euro ▢ cent. |
| 8 | Geld tellen: 6 tot 8 stuks | ●●○○○ | Hetzelfde, met zes tot acht stuks. |
| 9 | Bedragen met komma optellen | ●●●●○ | Twee groepjes briefjes en munten met een plus ertussen. Typt het totaal met komma, bijvoorbeeld 41,50. |

#### In de winkel

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Het juiste wisselgeld | ●●○○○ | "Je betaalt € 7, de knuffel kost € 2." Vier vakjes met geld; tikt op het vakje met precies het goede geld terug. |
| 2 | Wisselgeld kiezen | ●●○○○ | Een kort verhaaltje, bijvoorbeeld een ijsje van € 1,50 betaald met € 5. Kiest uit vier bedragen. |
| 3 | Wisselgeld uitrekenen | ●●○○○ | Een kort verhaaltje, bijvoorbeeld een bal van € 17 betaald met € 50. Typt het bedrag, in hele euro's. |
| 4 | Wat blijft er over? (kiezen) | ●●●○○ | Bijvoorbeeld: je hebt € 10, de kaartjes kosten € 6,40. Kiest uit vier bedragen. |
| 5 | Wat blijft er over? (typen) | ●●●○○ | Bijvoorbeeld: je hebt € 100, de skeelers kosten € 64. Typt het bedrag. |
| 6 | De prijs terugrekenen | ●●●●○ | Bijvoorbeeld: je betaalde € 50 en kreeg € 8 terug. Typt de prijs, in hele euro's. |
| 7 | De prijs terugrekenen met centen | ●●●●○ | Bijvoorbeeld: je betaalde € 10 en kreeg € 3,50 terug. Typt de prijs met komma. |
| 8 | Kun je het betalen? | ●●●●● | "Sam heeft € 20 voor het schoolreisje." Daaronder vijf korte zinnen, bijvoorbeeld "3 ijsjes van € 4". Tikt per zin Ja of Nee en drukt op Controleren. |

#### Het bonnetje

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Het bonnetje | ●●●○○ | Een simpel getekend bonnetje met drie regels, bijvoorbeeld van de markt of de kermis. Rekent het totaal uit en typt het met komma. |
| 2 | Prijs kwijt op het bonnetje | ●●●○○ | Het totaal staat erop, maar één prijs is onleesbaar. Typt die prijs. |

#### Afronden en schatten

Afronden gaat naar de dichtstbijzijnde hele of halve euro: 25,20 wordt 25,-,
25,40 wordt 25,50 en 25,80 wordt 26,-. Er komen geen bedragen voor die eindigen
op ,25 of ,75. Het geld in de portemonnee is in hele euro's of briefjes. Alles
tot 100 euro.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Afronden op hele en halve euro's (kiezen) | ●○○○○ | Ziet één prijs en kiest het afgeronde bedrag uit drie knoppen. |
| 2 | Afronden op hele en halve euro's (typen) | ●●○○○ | Ziet één prijs en typt het afgeronde bedrag. |
| 3 | Schatten: samen ongeveer (stap voor stap) | ●●●●○ | Een verhaaltje met twee prijzen, bijvoorbeeld bij de bakker of op de markt. Rondt eerst beide prijzen af en typt daarna het totaal. |
| 4 | Schatten: wat houd je over? (kiezen) | ●●●●○ | Ziet een prijs en het geld in de portemonnee, en kiest uit vier knoppen ongeveer hoeveel er overblijft. |
| 5 | Schatten: samen ongeveer | ●●●●○ | Een verhaaltje met twee prijzen; typt meteen het geschatte totaal. |
| 6 | Schatten: wat houd je over? | ●●●●● | Ziet een prijs en het geld in de portemonnee, en typt ongeveer hoeveel er overblijft. |

#### Aanbiedingen

Alleen hele euro's, tot 100 euro.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoeveel korting? (kiezen) | ●●○○○ | Ziet "Was € 46,- / Nu € 36,-" en kiest het kortingsbedrag uit vier knoppen. |
| 2 | Hoeveel korting? | ●●○○○ | Dezelfde situatie; typt het kortingsbedrag. |
| 3 | Prijs na korting (kiezen) | ●●●○○ | Ziet een prijs met een sticker "€ 25,- korting" erbij en kiest uit vier knoppen wat je betaalt. |
| 4 | Prijs na korting | ●●●○○ | Dezelfde situatie; typt wat je betaalt. |

Nog open bij Geld: Inwisselen — dat hoort bij Rekenen met geld — en
Geldnotatie.

## Bouwstenen

Onderdelen die één keer gebouwd zijn en die elk volgend domein kan gebruiken:

- **Wegtikken** (`src/components/oefenen/Wegtikken.tsx`) — een groep plaatjes
  in rijtjes van vijf. Het kind tikt plaatjes aan en die krijgen een rood
  kruis; nog een keer tikken haalt het kruis eraf. In de stand "vanzelf"
  schuiven de plaatjes één voor één weg en kijkt het kind alleen.
- **Rekenrek** (`src/components/oefenen/Rekenrek.tsx`) — twee staafjes met
  tien kralen, vijf rode en vijf witte. De bovenste rij wordt eerst gevuld tot
  tien, de rest komt op de onderste rij. Drie standen: *wegschuiven* (het kind
  tikt of sleept; er gaat altijd de laatste kraal weg), *flitsen* (na een paar
  tellen gaat er een kaart overheen) en *kijken* (het rek speelt de som zelf
  af). Met het bordje van Wegstrepen erbij, en het moment bij de tien: blijven
  er precies tien over, dan licht de bovenste rij even op. Uit te proberen in
  het beheer onder "Rekenrek". De kralen komen uit dezelfde tekening als
  Kralen tellen; daar is niets aan veranderd. Er hangt nog geen oefening aan.
