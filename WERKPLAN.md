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

Er volgen nog meer onderwerpen bij Tijd.

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
