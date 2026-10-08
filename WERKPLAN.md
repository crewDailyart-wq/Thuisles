# Werkplan

Wat er gebouwd wordt en in welke volgorde. Per onderwerp de titels zoals het
kind ze ziet, met de bolletjes en wat het kind er doet.

De kopjes volgen de bestaande Thuisles-domeinen. Nieuwe onderwerpen komen in
die domeinen; er wordt geen nieuw domein aangemaakt.

## Algemene regel: vijftien opgaven per ronde

Elke oefening geeft minimaal 15 opgaven per ronde, zonder dubbele opgaven
binnen een ronde. `npm run opgaven` controleert dat vóór elke commit.

## Bij het bouwen altijd meenemen: SEO-basis — KLAAR

De zes punten hieronder staan er. Geldt vanaf nu voor elk nieuw scherm en elk
nieuw onderwerp, niet pas achteraf.

Wat er staat: de openbare pagina's voor ouders onder `/groep-4/tafels/...`, in
vier talen, volledig op de server opgebouwd; een eigen paginatitel en korte
beschrijving per domein, onderwerp en oefening, aan te passen in de admin onder
"Openbare pagina"; oude adressen die blijven doorsturen als een naam verandert;
`robots.txt` plus `noindex` op de admin, de oefenpagina's en alles achter de
login; en een sitemap die uit de database volgt.

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

## Groep 4 – Delen — KLAAR

De code staat er. De basisversie zijn gewone sommen; beeld komt later. De
notatie is overal met een dubbele punt: 8 : 2.

Drie oefentypes dekken de vijftien titels: **Delen (kale som)** voor de tien
deeltafels én voor "Deelsommen tot en met 5 / 10" (alleen andere vinkjes),
**Koppel de deelsom aan de uitkomst** voor de twee koppel-titels, en **Welke
deelsom past erbij?** Alle vijftien geven vijftien opgaven per ronde zonder
dubbele; `npm run opgaven` rekent dat na, met de bolletjes erbij.

De inhoud van de database — de leerdoelen met deze titels, hun sjablonen en hun
vragen — maakt de eigenaar aan (HARDE REGEL 2). De instellingen per titel staan
in `scripts/opgaven.mjs`.

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
| 5 | Welke deelsommen passen? | ●●●●● | Het kind ziet een uitkomst, bijvoorbeeld 5, en typt zelf een deelsom die klopt: ▢ : ▢ = 5. Elke goede deelsom uit de deeltafels van 1 tot en met 10 telt goed, dus 10 : 2 en 45 : 9 zijn allebei goed. Sinds oktober 2026 wisselt de vorm af (zie hieronder). |

### Zelf doen: vrije magneetjes (5 oktober 2026) — KLAAR

- Aan bij alle tien oefeningen van **Deeltafels oefenen**, in de bestaande
  volgorde en met dezelfde titels, bolletjes en webadressen.
- De deelsom met het gewone invulvak staat boven het speelveld. Daaronder:
  "Maak groepjes van …". De bestaande Thuisles-kaart, kleuren, vakjes en
  Controleer-knop blijven gebruikt.
- Vijftien visuele opgaven per oefening, maximaal 30 glanzende bolletjes,
  uitkomsten 1 tot en met 10. Als er minder dan vijftien verschillende sommen
  mogelijk zijn, herhalen sommen met een andere beginopstelling, nooit direct
  achter elkaar. Bijvoorbeeld bij delen door 10 bestaan binnen deze grens
  alleen 10 : 10, 20 : 10 en 30 : 10.
- Zelf groepjes bouwen met slepen of tikken. Ook verkeerde groepjes mogen;
  er is geen automatische stop bij de deler en geen teller vooraf. Elk
  bolletje kan weer los, ook uit een goed groepje. Twee tikken op hetzelfde
  bolletje maken het los; de zachte rand is de sleepgreep voor het geheel.
- Het antwoordvak is vanaf het begin beschikbaar. Pas bij Controleer wordt
  de bouw gecontroleerd; een onjuiste bouw geeft een aanwijzing en kan worden
  hersteld. Pas daarna kijkt de bestaande antwoordlogica het getal na.
- Goed: de groepjes lichten op en krijgen één voor één een telcijfer;
  daarna volgt de gebruikelijke beloning. Verminderde beweging wordt gevolgd.
- **Terug naar typen:** beheer → sjabloon → Werking → Alleen typen.
  De eerdere werkingen blijven als keuze bestaan. De oude opgaven zijn als
  concept bewaard; bestaande antwoorden en voortgang blijven behouden.
- Het tweede onderwerp **Deelsommen** is voor deze wijziging niet aangepast.

- **Koppelen (13, 14):** werking hetzelfde, alleen de getallen.
- **Welke deelsommen passen? (15):** de vorm wisselt af, zodat er 15
  verschillende vragen zijn: 5 met twee lege vakjes (▢ : ▢ = 6, elke goede
  deelsom met getallen tot en met 100 telt), 5 met het eerste getal leeg
  (▢ : 3 = 6) en 5 met het tweede getal leeg (18 : ▢ = 6). Instelling
  **Vorm** in beheer.

## Groep 4 – Tafels — KLAAR

De code staat er. De basisversie zijn gewone sommen; beeld komt later. De
notatie is overal met een maalteken: 3 × 5.

Tien oefentypes dekken de zestien titels. **Keersom (kale som)** doet in één
type "Tafels van 1 tot en met 5", "6 tot en met 10", "door elkaar", "11 tot en
met 15" en "16 tot en met 20" — alleen de vinkjes verschillen. Alle zestien
geven vijftien opgaven per ronde zonder dubbele; `npm run opgaven` rekent dat
na, met de bolletjes erbij.

De inhoud van de database — de leerdoelen met deze titels, hun sjablonen en hun
vragen — maakt de eigenaar aan (HARDE REGEL 2). De instellingen per titel staan
in `scripts/opgaven.mjs`.

### Onderwerp 1 — Keersommen begrijpen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Rijen en kolommen tellen | ● | Ziet blokjes in rijen, bijvoorbeeld 5 rijen van 3, en typt hoeveel het er zijn. |
| 2 | Een keersom bij een plaatje | ●● | Plaatjes in rijen; het kind vult de hele som in: ▢ × ▢ = ▢. |
| 3 | Handig rekenen met keersommen | ●●● | Ziet een som die het al kent, bijvoorbeeld 1 × 5 = 5, en maakt daarmee een nieuwe: 1 × 10 = ▢. |
| 4 | Rekenen met nullen | ●●●● | Een rijtje van drie: 2 × ▢ = 6, 2 × ▢ = 60, 2 × ▢ = 600. Niveau groep 5, als uitdaging. |

Kopje **Met de groepjesmaker** (Godot-bouwsteen, oktober 2026; zie GODOT-RAPPORT.md):

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 5 | Groepjes maken | ●●● | Bouwt elke keersom zelf: kiest hoeveel eikels in een doosje en tikt voor elk doosje op de kast. De plussom groeit mee en krimpt tot de keersom; daarna typt het kind het antwoord. Met × 0 en × 1, wisselen (draaien) en knippen (7 × 8 = 5 × 8 + 2 × 8). Alle 15 opgaven met de groepjesmaker. |

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

## Groep 4 – Tijd — KLAAR

**De leerlijn van de klok** (sinds 2 oktober 2026; geldt voor alle klokoefeningen:
wijzerklok, digitale klok, vlekken, later en eerder — niet voor Maanden en dagen
en Kalender). Binnen elk onderwerp en groepje staan de oefeningen van makkelijk
naar moeilijk, en het kinderscherm volgt precies deze volgorde.

| Bolletjes | Niveau |
|-----------|--------|
| ●○○○○ | Hele uren; digitaal alleen 01:00 tot en met 12:00 |
| ●●○○○ | Halve uren (en hele uren); digitaal tot en met 12:59 |
| ●●●○○ | Kwartier over en kwartier voor |
| ●●●●○ | Per vijf minuten; dagdelen; 24-uurstijden alleen met het dagdeel erbij ("Het is 's avonds") |
| ●●●●● | Op de minuut; 24-uurstijden zonder hulp; tijd vooruit of terug met 24-uurstijden |

Ook de foute keuzes blijven binnen het niveau: bij hele uren staat er nooit
"kwart over" als keuze.

De groepjes (zoals "Aflezen" en "Klok zetten") staan op het kinderscherm als
kopje boven de oefeningen, en per kopje loopt de lijst op van makkelijk naar
moeilijk. Elke titel binnen Tijd is uniek. "De grote en de kleine wijzer" en
"Hoeveel minuten in een uur?" staan hier niet meer: die leerdoelen bestaan nog
(groep 4), maar staan in het beheer op "verborgen" en zijn dus voor geen enkel
kind zichtbaar. Hetzelfde geldt voor "Uren en minuten op de digitale klok (met
uitleg)" bij Digitale klok. Hun vragen, antwoorden en voortgang blijven bewaard.

De code staat er, voor alle zes onderwerpen: 83 titels (waarvan 3 verborgen). De basisversie zijn
gewone opdrachten; beeld komt later. Elke titel geeft vijftien opgaven per
ronde zonder dubbele; `npm run opgaven` rekent dat na, met de bolletjes erbij.
De instellingen per titel staan in `scripts/opgaven.mjs`.

Waar er maar twaalf vragen bestaan — twaalf hele uren, twaalf maanden — komt
elke vraag een tweede keer terug in een andere vorm, zodat een ronde toch op
vijftien verschillende opgaven uitkomt: met andere foute keuzes, met de vlek
op een andere plek, of met de wijzers die ergens anders beginnen.

Bij oefeningen met de vakjes "uur" en "minuten" (Tijd vooruit, Tijd terug,
Hoe lang duurt het?, Hoe lang geleden?) vult het kind beide vakjes in. Bij hele
uren typt het 0 bij de minuten; een leeg vakje telt niet als 0. Controleer gaat
pas aan als beide vakjes zijn ingevuld. Onder de vakjes staat: "Vul beide
vakjes in. Geen minuten? Typ dan een 0."

De inhoud van de database — de leerdoelen met deze titels, hun sjablonen en hun
vragen — maakt de eigenaar aan (HARDE REGEL 2).

### Onderwerp 1 — Wijzerklok en digitale klok

#### Klokken koppelen

De oefeningen bovenaan dit onderwerp staan onder het kopje "Klokken koppelen".

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Zet de wijzers goed | ●● | Ziet een tijd, bijvoorbeeld 3:30, en sleept zelf de grote en de kleine wijzer op de goede plek. Hele en halve uren. |
| 2 | Klokken koppelen | ●● | Sleept drie digitale tijden naar de goede wijzerklokken. Hele en halve uren door elkaar. |
| 3 | Van digitale tijd naar wijzerklok | ●● | Ziet een digitale tijd, bijvoorbeeld 6:30, en kiest de goede wijzerklok uit vier. |
| 4 | Dagdelen | ●●●● | Ziet een digitale tijd, bijvoorbeeld 14:00, en kiest ochtend, middag, avond of nacht. De knoppen staan altijd in die volgorde. Nooit 00:00, 06:00, 12:00 of 18:00. |

#### Hele uren in de dag

Altijd met het dagdeel erbij. Nooit 00:00, en nooit een tijd precies op de
grens van twee dagdelen (06:00, 12:00, 18:00).

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Van wijzerklok naar digitale tijd: hele uren tot 12:00 | ●●● | Ziet een wijzerklok en het dagdeel ('s nachts of 's ochtends) en kiest de goede digitale tijd uit vier. Alleen 01:00 tot en met 11:00. |
| 2 | Van wijzerklok naar digitale tijd: hele uren na 12:00 | ●●●● | Hetzelfde, alleen 13:00 tot en met 23:00, met 's middags of 's avonds erbij. |
| 3 | Van wijzerklok naar digitale tijd: hele uren, hele dag | ●●●● | Hetzelfde, alles door elkaar, in 24-uursnotatie zoals 20:00. |

#### Halve uren in de dag

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Van wijzerklok naar digitale tijd: halve uren tot 12:00 | ●●● | Hetzelfde als bij de hele uren, met halve uren van 01:30 tot en met 11:30. |
| 2 | Van wijzerklok naar digitale tijd: halve uren na 12:00 | ●●●● | Halve uren van 12:30 tot en met 23:30. |
| 3 | Van wijzerklok naar digitale tijd: halve uren, hele dag | ●●●● | Halve uren door elkaar. |

#### Tijd digitaal schrijven

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Schrijf de tijd digitaal: tot 12:00 | ●●● | Ziet een wijzerklok en het dagdeel en typt de tijd in twee vakjes: ▢ : ▢. Hele en halve uren tot 12:00. |
| 2 | Schrijf de tijd digitaal: na 12:00 | ●●●● | Hetzelfde, na 12:00. |
| 3 | Schrijf de tijd digitaal: hele dag | ●●●● | Hetzelfde, de hele dag door elkaar. |

#### Rekenen met de klok

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoe laat is het straks? Kies de klok | ● | Ziet een wijzerklok op een heel uur en een korte zin, bijvoorbeeld "Over 2 uur ga je naar huis", en kiest de goede wijzerklok uit vier. Wisselende situaties: het zwembad, school, opa en oma, de speeltuin. |

### Onderwerp 2 — De wijzerklok

Drie groepjes: eerst de klok leren aflezen, dan zelf de wijzers zetten, en
daarna uitrekenen hoe lang iets duurt.

#### Aflezen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hele uren aflezen op de wijzerklok | ● | Ziet een wijzerklok en kiest de tijd in woorden uit vier, bijvoorbeeld "zes uur". |
| 2 | Halve uren aflezen | ●● | Hetzelfde, met halve uren: bijvoorbeeld "half drie". |
| 3 | Hele en halve uren door elkaar | ●● | Hetzelfde, hele en halve uren door elkaar. |
| 4 | Klopt de klok? | ●● | Ziet een wijzerklok met een zin erbij, bijvoorbeeld "Het is half drie", en kiest Ja of Nee. Hele en halve uren. |
| 5 | Welke klok hoort erbij? Hele en halve uren | ●● | Ziet een tijd in woorden, bijvoorbeeld "Het is half één", en kiest de goede wijzerklok uit vier. |
| 6 | Kwartieren aflezen | ●●● | Kiest de tijd in woorden uit vier, bijvoorbeeld "kwart over één" of "kwart voor vier". |
| 7 | Welke klok hoort erbij? Kwartieren | ●●● | Hetzelfde, met kwartieren. |
| 8 | Vijf voor en tien over aflezen | ●●●● | Kiest de tijd in woorden uit vier, bijvoorbeeld "tien over twee" of "vijf voor elf". |
| 9 | Welke klok hoort erbij? Vijf voor en tien over | ●●●● | Hetzelfde andersom: van de woorden naar de goede klok. |

#### Klok zetten

Het kind sleept zelf de grote en de kleine wijzer. Dezelfde bouwsteen als bij
"Zet de wijzers goed" in onderwerp 1.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Zet de klok: hele uren | ● | Leest bijvoorbeeld "Zet de klok op zes uur" en sleept de wijzers op hun plek. |
| 2 | Zet de klok: halve uren | ●● | Hetzelfde, bijvoorbeeld "half negen". |
| 3 | Hoe laat is het straks? Zet de klok | ●● | Ziet een klok en een zin zoals "2 uur later" of "een half uur later", en zet de wijzers op de nieuwe tijd. Hele en halve uren. |
| 4 | Hoe laat was het eerder? | ●● | Hetzelfde, maar terug in de tijd: bijvoorbeeld "een half uur eerder". |
| 5 | Klokken op volgorde | ●● | Sleept vier wijzerklokken van vroeg naar laat. |
| 6 | Zet de klok: kwartieren | ●●● | Hetzelfde, bijvoorbeeld "kwart voor drie". |
| 7 | Hoe laat is het straks? Vijf voor en tien over | ●●●● | Bijvoorbeeld: "Het is kwart voor vijf. Zet de klok 3 uur en 30 minuten later." Als uitdaging. |

#### Hoe lang duurt het?

Eén wijzerklok die laat zien hoe laat het nu is; de andere tijd staat in
woorden in een korte zin met een situatie: het zwembad, school, de film, opa
en oma. Dezelfde tijd staat nooit in de zin én op de klok.

- Hoe lang duurt het: "Je gaat om half twee naar het zwembad. Kijk op de klok
  hoe laat je klaar bent. Hoe lang duurde het?"
- Hoe lang geleden: "Om half twee ging je naar de speeltuin. Kijk hoe laat
  het nu is. Hoe lang geleden is dat?"

Bij ● tot en met ●●● kiest het kind uit vier knoppen in schooltaal, altijd van
kort naar lang. Hele uren: een uur, twee uur, drie uur, vier uur. Halve uren:
een half uur, een uur, anderhalf uur, twee uur. Kwartieren: een kwartier, een
half uur, drie kwartier, een uur. Bij ●●●● typt het kind het antwoord in twee
vakjes: ▢ uur ▢ minuten, die bij de start allebei leeg zijn.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hoe lang duurt het? Hele uren | ● | Bijvoorbeeld: "Je gaat om drie uur naar het zwembad. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?" De klok staat op vijf uur. |
| 2 | Hoe lang geleden? Hele uren | ● | Andersom: "Om drie uur ging je naar de speeltuin. Kijk hoe laat het nu is. Hoe lang geleden is dat?" |
| 3 | Hoe lang duurt het? Halve uren | ●● | Hetzelfde, met halve uren. |
| 4 | Hoe lang geleden? Halve uren | ●● | Hetzelfde, met halve uren. |
| 5 | Hoe lang duurt het? Kwartieren | ●●● | Hetzelfde, met kwartieren. |
| 6 | Hoe lang geleden? Kwartieren | ●●● | Hetzelfde, met kwartieren. |
| 7 | Hoe lang duurt het? Over 12 uur heen | ●●●● | Bijvoorbeeld van 11 uur 's ochtends tot 2 uur 's middags. |
| 8 | Hoe lang? Alles door elkaar | ●●●● | Duur en geleden door elkaar: hele en halve uren en kwartieren, ook over 12 uur heen. |

Notitie voor later: visuele versie — een tijdbalk waarop het kind met sprongen
van een uur of een half uur van de begintijd naar de eindtijd gaat.

### Onderwerp 3 — Digitale klok

Alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Tijden staan als digitale klok, uren:minuten, altijd twee cijfers:
  bijvoorbeeld 07:00.
- Bij aflezen kiest het kind uit vier antwoorden in woorden. De foute keuzes
  zijn echte valkuilen: bij 05:30 staan er ook "half vijf" en "vijf uur"
  tussen.
- Bij Later en Eerder ziet het kind twee klokken en typt het antwoord in twee
  vakjes: ▢ uur ▢ minuten, met een knop Controleren. Gewoon typen, geen
  getallenpad op het scherm. Het kind vult beide vakjes in; is het verschil
  hele uren, dan typt het 0 bij de minuten. Een leeg vakje telt niet als 0.
- Bij Later en Eerder komen 24-uurstijden (bijvoorbeeld 18:30) alleen voor op
  het hoogste niveau, bij "over het hele uur heen". De andere blijven tussen
  01:00 en 12:59 (de leerlijn van de klok, zie boven).

#### Aflezen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Hele uren aflezen op de digitale klok | ●○○○○ | Ziet bijvoorbeeld 08:00 en kiest "acht uur". Alleen 01:00 tot en met 12:00. |
| 2 | Hele en halve uren aflezen | ●●○○○ | Bijvoorbeeld 05:30 = half zes. Tot en met 12:59. |
| 3 | Hele uren, halve uren en kwartieren aflezen | ●●●○○ | Bijvoorbeeld 03:15 = kwart over drie, 03:45 = kwart voor vier. |
| 4 | Hele uren in de dag | ●●●●○ | Ziet een korte situatie met een klok, bijvoorbeeld "Sam staat op om…", en kiest bijvoorbeeld "zeven uur 's ochtends". De keuzes hebben 's ochtends en 's avonds door elkaar. |
| 5 | Vijf en tien over en voor | ●●●●○ | Bijvoorbeeld 07:10 = tien over zeven, 08:55 = vijf voor negen. |
| 6 | Op de minuut | ●●●●● | Bijvoorbeeld 05:43 = dertien minuten over half zes. Ook 24-uurstijden, zonder dagdeel erbij. |

#### Later

Twee digitale klokken: NU links en LATER rechts, met een pijl naar rechts. De
vraag zegt welke kant op: "Het is 06:00. Hoeveel later is het om 09:00?"

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Tijd vooruit: hele uren | ●○○○○ | Bijvoorbeeld 06:00 en 09:00. Alleen 01:00 tot en met 12:00. |
| 2 | Tijd vooruit: halve uren | ●●○○○ | Bijvoorbeeld 05:00 en 07:30. Hele en halve uren, tot en met 12:59. |
| 3 | Tijd vooruit: hele uren, andere minuten | ●●●○○ | Bijvoorbeeld 06:45 en 08:45: kwart over of kwart voor, met hele uren ertussen. |
| 4 | Tijd vooruit: kwartieren | ●●●○○ | Bijvoorbeeld 04:15 en 06:00. |
| 5 | Tijd vooruit: over het hele uur heen | ●●●●● | Bijvoorbeeld 17:50 en 20:20: per vijf minuten, met 24-uurstijden. |

#### Eerder

Dezelfde vijf stappen als bij Later, maar terug in de tijd. De eerdere klok
staat links (EERDER), NU rechts, met een pijl naar links. De vraag: "Het is
09:00. Hoeveel eerder was het om 06:00?"

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Tijd terug: hele uren | ●○○○○ | Bijvoorbeeld 09:00 en 07:00. Alleen 01:00 tot en met 12:00. |
| 2 | Tijd terug: halve uren | ●●○○○ | Bijvoorbeeld 07:30 en 05:00. Hele en halve uren, tot en met 12:59. |
| 3 | Tijd terug: hele uren, andere minuten | ●●●○○ | Bijvoorbeeld 08:45 en 06:45. |
| 4 | Tijd terug: kwartieren | ●●●○○ | Bijvoorbeeld 06:00 en 04:15. |
| 5 | Tijd terug: over het hele uur heen | ●●●●● | Bijvoorbeeld 20:15 en 17:45: per vijf minuten, met 24-uurstijden. |

### Onderwerp 4 — Wijzerklok met vlekken

Alleen de basis: gewone opdrachten, visueel werk komt later.

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
| 2 | Hele uren: wijzer onder een vlek | ●○○○○ | Een stukje van de kleine wijzer is bedekt. |
| 3 | Halve uren: cijfers onder een vlek | ●●○○○ | Hetzelfde als 1, met halve uren. |
| 4 | Halve uren: wijzer onder een vlek | ●●○○○ | Hetzelfde als 2, met halve uren. |
| 5 | Kwart over en kwart voor: cijfers onder een vlek | ●●●○○ | Hetzelfde, met kwartieren. |
| 6 | Kwart over en kwart voor: wijzer onder een vlek | ●●●○○ | Hetzelfde, met een stukje wijzer bedekt. |
| 7 | Gemengd: cijfers onder een vlek | ●●●○○ | Hele uren, halve uren en kwartieren door elkaar. |
| 8 | Gemengd: grote vlek | ●●●○○ | Het midden van de klok is bedekt; alleen de puntjes van de wijzers zijn zichtbaar. |

### Onderwerp 5 — Maanden en dagen

Alleen de basis: gewone opdrachten, visueel werk komt later.

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

Alleen de basis: gewone opdrachten, visueel werk komt later.

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

Alle onderdelen van Geld staan nu in het werkplan en zijn KLAAR: Munten en
briefjes, Geldnotatie, Betalen en Rekenen met geld, met daarin ook Geld
wisselen (oktober 2026).

De code staat er voor alle vier de onderwerpen: 57 titels. De basisversie zijn gewone opdrachten.

**Geld: officiële afbeeldingen (ECB-specimen 72 dpi voor briefjes, gemeenschappelijke zijde voor munten), nooit nationale zijde, nooit ware grootte.** De bestanden staan in `public/geld/`, met in `BRON.md` waar
elk vandaan komt. Alleen de briefjes van 200 en 500 euro (die in de
oefeningen niet voorkomen) zijn nog een eigen tekening. Elke titel geeft vijftien opgaven per ronde
zonder dubbele; `npm run opgaven` rekent dat na, met de bolletjes erbij. De
instellingen per titel staan in `scripts/opgaven.mjs`.

Een bedrag typt het kind in twee vakjes: € ▢ , ▢. Allebei alleen cijfers, met
het toetsenbord van het apparaat. Een komma of punt in het eerste vakje springt
door naar het tweede, dus 41,50 en 41.50 typen gewoon. Een leeg tweede vakje is
nul centen, dus 26, 26,00 en 26,- zijn alle drie goed, en 25,5 telt als 25,50.

De inhoud van de database — de leerdoelen met deze titels, hun sjablonen en hun
vragen — maakt de eigenaar aan (HARDE REGEL 2).

Typen geldt in heel Geld hetzelfde: een gewoon invoerveld met € ervoor, geen
getallenpad op het scherm. Goed gerekend worden 26, 26,00 en 26,- als hetzelfde
bedrag, en 25,5 telt net zo goed als 25,50.

### Onderwerp 1 — Munten en briefjes

Algemene regels voor dit onderwerp:

- Geld: officiële afbeeldingen (ECB-specimen 72 dpi voor briefjes, gemeenschappelijke zijde voor munten), nooit nationale zijde, nooit ware grootte.
  (Dit vervangt sinds oktober 2026 de eerdere regel "simpele eigen tekeningen,
  geen foto's".)
- Bedragen tot 100 euro. We zeggen "briefjes".
- Bij typvragen typt het kind een getal en drukt op Controleren. Gewoon typen,
  geen getallenpad op het scherm.

#### Munten en briefjes kennen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | De meeste waarde | ●○○○○ | Ziet drie munten en tikt op de munt die het meest — of het minst — waard is. Eerst alleen euromunten, daarna alleen centmunten. |
| 2 | Munten en briefjes vergelijken | ●●○○○ | Hetzelfde, nu munten en briefjes door elkaar. Met een valkuil erin: een grote munt zoals 50 cent tegenover een klein briefje van 5 euro. |
| 3 | Op volgorde van waarde | ●●●●○ | Sleept vier munten of briefjes op volgorde van weinig naar veel waard, met een knop Controleren. |

#### Geld tellen

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Euro's tellen | ●●○○○ | Ziet een groepje munten van 1 euro, tot 20, en typt hoeveel euro het is. |
| 2 | Leg het bedrag | ●●●○○ | "Leg 6 euro." Tikt op een munt van 1 euro om hem in een vakje te leggen; nog een keer tikken haalt hem weer weg. Met een knop Controleren. |
| 3 | Munten of euro's? | ●●●○○ | Ziet bijvoorbeeld twee munten van 2 euro en typt ▢ munten en ▢ euro. |
| 4 | Leg het bedrag met 1 en 2 euro | ●●●●○ | Hetzelfde als Leg het bedrag, maar het kind kiest zelf munten van 1 en 2 euro. Elk goed bedrag telt, ook als het op een andere manier is gelegd. |
| 5 | Het grootste bedrag | ●●●●○ | Ziet drie vakjes met munten en briefjes en tikt op het vakje met het hoogste bedrag. |
| 6 | Evenveel waard | ●●●●● | Bijvoorbeeld 3 × 20 cent = ▢ × 10 cent, of 3 × 1 euro = ▢ × 50 cent. Typt het getal. |

### Onderwerp 2 — Geldnotatie

KLAAR (oktober 2026). Alleen de basis: gewone opdrachten, visueel werk komt
later. Type `geldnotatie`; getypt wordt in één gewoon invoerveld waarin het
kind zelf de komma typt.

Algemene regels voor dit onderwerp:

- Typt het kind een punt in plaats van een komma (6.45), dan wordt dat niet
  fout gerekend: het kind krijgt de hint "Gebruik een komma" en mag opnieuw
  proberen.
- 7,5 en 7,50 zijn allebei goed.
- Een gewoon invoerveld, geen getallenpad op het scherm.

#### Het prijskaartje

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Bedragen goed schrijven (kiezen) | ●○○○○ | Ziet bijvoorbeeld "€ 52" en kiest de juiste schrijfwijze uit drie: € 52,-. |
| 2 | Bedragen goed schrijven | ●●○○○ | Kiest uit vier, ook met centen. De foute keuzes lijken erop: bij € 7,05 staan er ook € 7,5, € 75,0 en € 0,75. |

#### Geld tellen en opschrijven

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 3 | Bedrag opschrijven tot 10 euro | ●●○○○ | Ziet getekende munten en briefjes en typt het bedrag met komma, bijvoorbeeld 6,45. |
| 4 | Bedrag opschrijven tot 100 euro | ●●●○○ | Alleen hele euro's. Achter het vakje staat al ",-"; het kind typt alleen het getal. |

#### Bedragen in woorden

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 5 | Van woorden naar cijfers tot 10 euro | ●●●○○ | Bijvoorbeeld "zeven euro en vijftig cent" wordt 7,50. |
| 6 | Van woorden naar cijfers tot 100 euro | ●●●●○ | Bijvoorbeeld "achtenveertig euro" wordt 48. |

### Onderwerp 3 — Betalen

Alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het geld ziet eruit zoals bij "Munten en briefjes": officiële afbeeldingen.
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

### Onderwerp 4 — Rekenen met geld

Alleen de basis: gewone opdrachten, visueel werk komt later.

Algemene regels voor dit onderwerp:

- Het geld ziet eruit zoals bij "Munten en briefjes": officiële afbeeldingen.
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

#### Geld wisselen

KLAAR (oktober 2026), als stand "wisselen" van het type `geldgroepen`. Het kind kiest steeds uit drie kaartjes met
munten en briefjes en tikt op het kaartje zelf, zonder A/B/C-knoppen. De foute
kaartjes zijn net te veel of net te weinig waard.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Een briefje wisselen | ●○○○○ | Ziet één briefje van € 10 tot en met € 100 en tikt op het kaartje met kleinere briefjes dat evenveel waard is. |
| 2 | Een euromunt wisselen | ●●○○○ | Ziet een munt van € 1 of € 2 en tikt op het kaartje met centen dat evenveel waard is. |
| 3 | Centen wisselen | ●●○○○ | Ziet een munt van 10, 20 of 50 cent en tikt op het kaartje met kleinere centen dat evenveel waard is. |
| 4 | Wisselen in briefjes en munten | ●●●○○ | Ziet een briefje van € 5, € 10 of € 20; de kaartjes hebben een mix van briefjes en euromunten, soms meer dan vier stuks. |

## Groep 4 – Aftrekken — uitbreiding tot en met 100 — KLAAR

KLAAR (oktober 2026). Volgorde van de onderwerpen: Aftrekken tot en met 15
(bestond al), Aftrekken met het rekenrek (bestond al), Aftrekken tot en met
20, 30, 40 en 50, Aftrekken met tientallen, Aftrekken tot en met 100, Wat zit
er onder de vlek? De twee bestaande onderwerpen zijn niet aangepast.

Regels: geen getal of uitkomst boven 100 of onder 0; 15 vaste opgaven per
oefening van makkelijk naar moeilijk; "vragen per oefensessie" 15; foute
keuzes zitten 1 of 2 naast het goede antwoord; na een fout antwoord "Het
goede antwoord is 8, want 15 − 7 = 8." Tientaloverschrijding: de eenheid van
het tweede getal is groter dan die van het eerste (41 − 19). De plaatjes-
oefeningen gebruiken de bestaande types (wegstrepen, plaatjesminsom,
minsomplaatje) met eigen plaatjes in rijen van 5; de rest is type
`rekensom`. Elke oefening heeft een eigen naam in beheer en een eigen
webadres (`aftrekken-tot-en-met-30-sommen-met-dezelfde-uitkomst`).

### Aftrekken tot en met 20 (10 oefeningen)

| Kopje | Titel | Bolletjes |
|---|---|---|
| Met plaatjes | Wegstrepen en tellen | ● |
| Met plaatjes | Aftrekken met plaatjes ("Hoeveel … houd je over?") | ●● |
| Met plaatjes | Aftrekken met plaatjes en getallen | ●● |
| Met plaatjes | De erafsom bij het plaatje (drie vakjes) | ●●● |
| Uitrekenen | Erafsommen tot en met 20 (zonder tientaloverschrijding) | ●● |
| Uitrekenen | Aftrekken met tientaloverschrijding tot 20 | ●●●● |
| Kiezen en controleren | Sommen met dezelfde uitkomst | ●●● |
| Kiezen en controleren | De som met een andere uitkomst | ●●● |
| Kiezen en controleren | Sommen en uitkomsten koppelen | ●●●● |
| Puzzelen | Vergelijkingen kloppend maken | ●●●●● |

### Aftrekken tot en met 30, 40, 50 en 100 (elk 6 oefeningen)

| Kopje | Titel | Bolletjes |
|---|---|---|
| Uitrekenen | Erafsommen tot en met 30/40/50/100 (zonder tientaloverschrijding) | ●● |
| Uitrekenen | Aftrekken met tientaloverschrijding tot 30/40/50/100 | ●●● |
| Kiezen en controleren | Sommen met dezelfde uitkomst | ●●● |
| Kiezen en controleren | De som met een andere uitkomst | ●●● |
| Kiezen en controleren | Sommen en uitkomsten koppelen | ●●●● |
| Puzzelen | Vergelijkingen kloppend maken | ●●●●● |

### Aftrekken met tientallen (7 oefeningen)

| Kopje | Titel | Bolletjes | Voorbeeld |
|---|---|---|---|
| Zonder over het tiental | Hele tientallen aftrekken | ● | 80 − 30, 70 − 70 |
| Zonder over het tiental | Eenheden aftrekken binnen het tiental | ● | 47 − 3 |
| Zonder over het tiental | Aftrekken tot een heel tiental | ●● | 36 − 6 |
| Zonder over het tiental | Tientallen aftrekken van getallen tot 100 | ●● | 58 − 20 |
| Zonder over het tiental | Aftrekken met gelijke eenheden | ●●● | 61 − 31 |
| Over het tiental | Eenheden aftrekken van een heel tiental | ●●● | 90 − 5 |
| Over het tiental | Aftrekken over het tiental | ●●●● | 94 − 8 |

### Wat zit er onder de vlek? (7 oefeningen)

| Titel | Bolletjes | Voorbeeld |
|---|---|---|
| Vleksommen tot en met 10 | ● | 7 − ☐ = 3 |
| Vleksommen tot en met 20 | ●● | 16 − ☐ = 9 |
| Vleksommen tot en met 30 | ●● | 28 − ☐ = 13 |
| Vleksommen tot en met 40 | ●●● | 37 − ☐ = 19 |
| Vleksommen tot en met 50 | ●●● | 40 − ☐ = 26 |
| Vleksommen tot en met 100 | ●●●● | 83 − ☐ = 47 |
| Vleksommen met de vlek vooraan | ●●●●● | ☐ − 8 = 35, tot en met 100 |

## Groep 4 – Optellen tot en met 20 — visueel en interactief (oktober 2026)

Alleen dit onderwerp; de andere Optellen-onderwerpen zijn niet veranderd.
Titels en bolletjes blijven gelijk. Per oefening terug naar de oude werking:
in beheer bij het sjabloon **Werking** op "Alleen typen (de oude werking)";
dat geldt meteen, ook voor de opgaven die er al liggen.

Twee bouwstenen, met blokjes en vakjes van 48 pixels, tikken of slepen:
- **Tienstrook**: 2 rijen van 10 (1 rij tot en met 10), met een tussenruimte
  na elke 5. Eerste getal oranje, tweede getal viool; een blokje gaat altijd
  naar het volgende lege vakje.
- **Weegschaal**: hangt scheef naar de zwaarste kant en pas recht bij
  evenveel. Een stapel losse blokjes ernaast; een erbij gelegd blokje tik je
  terug.

"Om en om": opgave 1, 3, 5, 7 en 9 bouwen, 2, 4, 6, 8 en 10 zulke sommen
zonder bouwen, 11 tot en met 15 alleen de som. Geen knop Hulp; na een fout
antwoord laat de bouwsteen rustig zien hoe het wel werkt. Bij deze drie
oefeningen staat "vragen per oefensessie" op 15, anders vallen er opgaven weg.

| Kopje | Oefening | Wat er is veranderd |
|---|---|---|
| Met plaatjes | Maak de plussom bij het plaatje | niets (plaatjes stonden al in rijtjes van 5) |
| Met plaatjes | Optellen met plaatjes tot en met 10 | teruggezet (6 oktober): plaatjes tellen en typen, Werking "Alleen typen" |
| Met plaatjes | Optellen met plaatjes tot en met 20 | teruggezet (6 oktober): plaatjes tellen en typen |
| Uitrekenen | Optellen tot en met 10 | niets |
| Uitrekenen | Optellen tot en met 20 | teruggezet (6 oktober): alleen typen |
| Uitrekenen | Optellen via 10 | sinds 6 oktober de schoolvorm met pootjes: 6 + 5 = ▢, onder de 5 twee pootjes (tot 10, en wat er dan nog bij moet); "Goed zo! 6 + 4 = 10, en 10 + 1 = 11." Werking "Splitsen met pootjes" |
| Kiezen en controleren | Welke som hoort er niet bij? | niets |
| Kiezen en controleren | Welke som klopt? | foute kaartjes 1 of 2 naast de echte uitkomst, nooit boven 20, geen dubbele uitkomsten |
| Kiezen en controleren | Zoek de som die evenveel is | niets |
| Kiezen en controleren | Koppel de som aan de uitkomst | niets |
| Puzzelen | Aanvullen in de tabel | na een fout antwoord de tienstrook: "Van 2 tot 13 is 11." |
| Puzzelen | Kies twee getallen | niets |
| Puzzelen | Maak beide kanten gelijk I | om en om met de weegschaal |
| Puzzelen | Maak beide kanten gelijk II | na een fout antwoord de weegschaal recht |

De tienstrook staat nog in de code (`Tienstrook.tsx`), maar wordt sinds 6
oktober nergens meer gebruikt.

## Groep 4 – Optellen tot en met 20 · kopje "Met het rekenrek" (oktober 2026)

Sinds 6 oktober geen apart onderwerp meer: de vijf oefeningen staan in
Optellen tot en met 20, onder het kopje "Met het rekenrek", direct na "Met
plaatjes". Het oude onderwerp "Optellen met het rekenrek" staat op verborgen
(niet verwijderd); zijn oude adres en de oude adressen van de oefeningen
sturen door. Bij alle 15 opgaven werkt het kind met het rekenrek (Werking
"Bij alle 15 opgaven met het rekenrek"); geen om en om meer.

Daarvoor: een eigen onderwerp met dezelfde opbouw als Aftrekken met het
rekenrek (vijf oefeningen, geen kopjes). Hetzelfde rekenrek:
2 rijen van 10, vijf rode en vijf witte kralen, hetzelfde frame. Het rek voor
aftrekken is niet aangeraakt; erbij heeft een eigen onderdeel
(`RekenrekErbij.tsx`) met de beweging die erbij hoort.

- De kralen beginnen rechts; wat links staat telt mee. Het eerste getal staat
  er al. Een kraal naar links slepen of aantikken neemt alle kralen links ervan
  mee; terug naar rechts zet ze terug. Eerst de bovenste rij vol, nooit meer
  dan het tweede getal. De kralen van het tweede getal krijgen een gloed. Geen
  teller; het vakje werkt pas als alles geschoven is.
- Om en om: opgave 1, 3, 5, 7 en 9 met het rekenrek, 2, 4, 6, 8 en 10 zonder,
  11 tot en met 15 zonder. Na een fout antwoord schuiven de kralen zelf.
- 15 vaste opgaven, van makkelijk naar moeilijk, vragen per oefensessie 15.
- Per oefening terug naar alleen typen: Werking "Alleen typen (zonder
  rekenrek)" in beheer; dat geldt meteen.

| # | Titel | Bolletjes | Voorbeeld | Na goed |
|---|---|---|---|---|
| 1 | Optellen tot en met 10 op het rekenrek | ● | 3 + 4 | Goed zo! 3 en 4 is 7. |
| 2 | Optellen tot en met 20 zonder over de 10 | ●● | 12 + 5 | Goed zo! 12 en 5 is 17. |
| 3 | Aanvullen tot 10 | ●●● | 7 + ▢ = 10 en 10 = 7 + ▢, om en om (alleen over 10) | Goed zo! 7 en 3 is 10. |
| 4 | Optellen over de 10 | ●●●● | 8 + 5 | Goed zo! 8 + 2 = 10, en dan nog 3 erbij: 13. |
| 5 | Splitsen via 10 | ●●●●● | 6 + 5 met pootjes (lusje en hartje) en het rekenrek | Goed zo! 6 en 4 is samen 10. En nog 1 erbij: 11. |

Webadressen (sinds 6 oktober): `/groep-4/optellen/optellen-tot-en-met-20-rekenrek-tot-en-met-10`,
`…-rekenrek-zonder-over-de-10`, `…-rekenrek-aanvullen-tot-10`,
`…-rekenrek-over-de-10`, `…-rekenrek-splitsen-via-10`. De oude adressen
(`/groep-4/optellen/rekenrek-…`) sturen door. Elke pagina heeft een eigen titel en omschrijving
met "erbijsommen", "rekenrek" en "groep 4", en staat in de sitemap.

## Groep 4 – Optellen — uitbreiding tot en met 100 — KLAAR

KLAAR (oktober 2026). Volgorde van de onderwerpen: Optellen tot en met 20
(bestond al, niet aangepast), Optellen tot en met 30, Optellen tot en met 40,
Optellen tot en met 50, Rekenen met tientallen, Optellen tot en met 100, Wat
zit er onder de vlek? Optellen tot en met 30 en 40 hebben precies dezelfde
kopjes, oefeningen en bolletjes als Optellen tot en met 50, met uitkomsten van
21 tot en met 30 en van 31 tot en met 40. Gewone opgaven; de enige
plaatjes zijn simpele eigen stippen in rijen van vijf.

Type `rekensom` (`src/lib/generatoren/rekensom.ts`), scherm
`Rekenopdracht`. Voor "Aanvullen" en "Sommen en uitkomsten koppelen" maakt
het de figuren van de bestaande types, zodat het kind dezelfde schermen
krijgt als tot en met 20. Elke oefening heeft 15 vaste opgaven, van makkelijk
naar moeilijk, en "vragen per oefensessie" 15. Bij kiezen lijken de foute
keuzes erop (1 of 10 ernaast). Na een fout antwoord staat het goede antwoord
er in gewone taal ("Het goede antwoord is 25, want 15 + 10 = 25"), nooit als
code. Titels mogen in verschillende onderwerpen hetzelfde zijn; elke oefening
heeft een eigen naam in beheer en een eigen webadres
(`optellen-tot-en-met-50-welke-som-klopt`).

### Optellen tot en met 50 (uitkomst nooit hoger dan 50)

| Kopje | Titel | Bolletjes | Wat het kind doet |
|---|---|---|---|
| Uitrekenen | Som bij de plaatjes | ● | Twee groepjes stippen (rijen van 5); typt beide getallen en de uitkomst. |
| Uitrekenen | Optellen tot en met 50 | ●● | Gewone som typen, bijvoorbeeld 14 + 7. |
| Kiezen en controleren | Sommen en uitkomsten koppelen | ●●● | 5 sommen; sleept de uitkomsten erbij. |
| Kiezen en controleren | Welke som klopt? | ●●● | 4 sommen met uitkomst, 1 goed. |
| Kiezen en controleren | Welke som past er niet bij? | ●●● | "Welke som is niet 11?", 4 knoppen. |
| Puzzelen | Aanvullen | ●●● | "Hoeveel moet erbij tot 26?" bij een rij van 4 getallen. |
| Puzzelen | Twee getallen die samen … zijn | ●●●● | 6 getallen; typt de 2 die samen de uitkomst maken (beide volgordes goed). |
| Puzzelen | Beide kanten gelijk | ●●●● | Bijvoorbeeld ☐ + 17 = 11 + 26. |

### Rekenen met tientallen (uitkomst nooit hoger dan 100)

| # | Titel | Bolletjes | Voorbeeld |
|---|---|---|---|
| 1 | Tiental plus eenheden | ● | 20 + 5 |
| 2 | Eenheden erbij | ● | 93 + 4, niet over het tiental |
| 3 | Tientallen optellen | ●● | 70 + 20 |
| 4 | Precies op het tiental | ●● | 14 + 6, 37 + 3 |
| 5 | Over het tiental heen | ●●● | 66 + 5 |
| 6 | Een getal plus tientallen | ●●●● | 14 + 80 |
| 7 | Samen precies een tiental | ●●●●● | 27 + 53 = 80 |

### Optellen tot en met 100 (uitkomst nooit hoger dan 100)

| Kopje | Titel | Bolletjes | Wat het kind doet |
|---|---|---|---|
| Uitrekenen | Optellen tot en met 100 | ●● | Bijvoorbeeld 39 + 28. |
| Uitrekenen | Handig optellen | ●●●● | 6 getallen in een vak; typt het totaal. De getallen maken per twee een tiental (6 + 4, 1 + 9, 13 + 7). |
| Kiezen en controleren | Welke som klopt? | ●●● | 4 sommen met uitkomst, 1 goed. |
| Kiezen en controleren | Welke som past er niet bij? | ●●● | 4 knoppen. |
| Kiezen en controleren | Zelfde uitkomst | ●●● | "Welke som is evenveel als 42 + 20?", 4 knoppen, 1 goed. |
| Puzzelen | Aanvullen tot 100 | ●●●● | 63 + ☐ = 100. |
| Puzzelen | Twee getallen die samen … zijn | ●●●● | Zoals tot en met 50. |
| Puzzelen | Beide kanten gelijk | ●●●● | Zoals tot en met 50. |

### Wat zit er onder de vlek?

Het ontbrekende getal staat onder dezelfde oranje inktvlek als bij Tijd. Het
kind tikt op de vlek en typt het getal.

| # | Titel | Bolletjes | Voorbeeld |
|---|---|---|---|
| 1 | Onder de vlek tot en met 10 | ● | 4 + vlek = 5 |
| 2 | Onder de vlek tot en met 20 | ●● | |
| 3 | Vleksommen tot en met 30 | ●● | |
| 4 | Vleksommen tot en met 40 | ●●● | |
| 5 | Onder de vlek tot en met 50 | ●●● | |
| 6 | Onder de vlek tot en met 100 | ●●●● | |
| 7 | De vlek kan overal zitten | ●●●●● | Vlek op het eerste getal, het tweede getal of de uitkomst, tot en met 100. |

## Groep 4 – Verhaaltjessommen — KLAAR

KLAAR (oktober 2026). Een eigen domein met zeven onderwerpen, allemaal
verhaaltjessommen (redactiesommen), in deze volgorde op het kinderscherm:
Optellen, Aftrekken, Optellen en aftrekken, Tafels, Delen, Tafels en delen,
Alles door elkaar. Nu alleen gewone opgaven, zonder plaatjes; die komen later.
De domeinen Tafels en Delen zijn niet veranderd.

Type `verhaaltje` (`src/lib/generatoren/verhaaltje.ts`); de zinsjablonen staan
in `src/lib/verhaaltjes.ts`. De instellingen per oefening staan in
`scripts/opgaven.mjs`.

Regels:

- Elke oefening heeft precies 15 vaste opgaven en "vragen per oefensessie" 15:
  het kind krijgt elke ronde dezelfde 15 verhaaltjes.
- Elke zin hoogstens 12 woorden, het hele verhaal in de tegenwoordige tijd, de
  vraag als laatste zin met "Hoeveel", "Hoe" of "Op welke". Er is altijd
  minstens 2 van iets, zodat enkelvoud, meervoud en werkwoord kloppen. Elk
  sjabloon heeft een grens die bij de situatie past (een klas heeft hooguit 32
  kinderen, een eierdoos 4, 6 of 10 eieren). Namen wisselen af, uit
  verschillende culturen. Dit wordt bij elk verhaaltje nagekeken.
- Kiezen: vier knoppen met de eenheid erbij ("12 stickers"), van klein naar
  groot: het goede antwoord, een getal uit het verhaal, 1 ernaast, boven de 20
  ook 10 ernaast, en waar dan nog plek is de uitkomst van de verkeerde
  bewerking. Nooit twee dezelfde knoppen.
- Typen: een gewoon invoerveld met de eenheid erachter. Geen getallenpad.
- De uitkomst is nooit hoger dan het getal van het kopje en nooit negatief.
  Bij "Tot en met 100" gaat typen ook over het tiental, kiezen niet. Datums
  alleen tot en met 31.
- Tafels: alleen de tafels van groep 4 (1 tot en met 10). Delen altijd zonder
  rest.
- Titels mogen per kopje hetzelfde zijn; elke oefening heeft een eigen naam in
  beheer ("Tot en met 20 · Samen (kiezen)") en een eigen webadres
  (`optellen-tot-en-met-20-samen-kiezen`), en een eigen SEO-titel en
  -omschrijving met "verhaaltjessommen", "redactiesommen", het onderwerp, het
  getallengebied en "groep 4".

### Onderwerpen 1 tot en met 3 — Optellen, Aftrekken, Optellen en aftrekken

Elk met drie kopjes: "Tot en met 20", "Tot en met 50" en "Tot en met 100". Per
kopje vijf situaties, eerst alle vijf als "(kiezen)", dan dezelfde vijf als
"(typen)".

| Onderwerp | De vijf situaties |
|---|---|
| Optellen | Erbij krijgen · Samen · Langer, hoger, later · Drie getallen · Alles door elkaar |
| Aftrekken | Weggeven en opmaken · Verschil · Korter, lager, eerder · Twee keer eraf · Alles door elkaar |
| Optellen en aftrekken | Erbij of eraf? · Hoeveel meer nodig? · Twee stappen · Meten en datums · Alles door elkaar |

| Kopje | Bolletjes kiezen (vijf situaties) | Bolletjes typen |
|---|---|---|
| Tot en met 20 | ● ● ●● ●● ●● | ●● ●● ●●● ●●● ●●● |
| Tot en met 50 | ●● ●● ●●● ●●● ●●● | ●●● ●●● ●●●● ●●●● ●●●● |
| Tot en met 100 | ●●● ●●● ●●●● ●●●● ●●●● | ●●●● ●●●● ●●●●● ●●●●● ●●●●● |

### Onderwerpen 4 tot en met 7 — Tafels, Delen, Tafels en delen, Alles door elkaar

Zonder kopjes, tien oefeningen per onderwerp: eerst de vijf situaties als
"(kiezen)", dan als "(typen)". Bolletjes kiezen ● ● ●● ●● ●●●, typen ●●● ●●●
●●●● ●●●● ●●●●●.

| Onderwerp | De vijf situaties |
|---|---|
| Tafels | Groepjes · Rijen · Elke dag · Geld · Alles door elkaar |
| Delen | Eerlijk verdelen · Groepjes maken · Geld verdelen · Teams en rijen · Alles door elkaar |
| Tafels en delen | Keer of delen? · Groepjes · Verdelen · Geld · Alles door elkaar |
| Alles door elkaar | Op school · In de winkel · Sport en spel · Thuis · Alles door elkaar |

Alles door elkaar: optellen en aftrekken tot en met 100, tafels en delen, per
thema.

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
- **Klok** (`src/components/oefenen/Klok.tsx`) — een wijzerklok en een
  digitale klok. De wijzerklok kan een vlek dragen en kan zetbaar zijn: dan
  sleept het kind zelf de grote en de kleine wijzer. De wijzers blijven binnen
  de cijfers. Gebruikt bij Tijd.
- **Kalender** (`src/components/oefenen/Kalender.tsx`) — een maandkalender die
  op maandag begint, met de echte weekdagen, en de jaarcirkel met de twaalf
  maanden. Gebruikt bij Tijd.
- **Geld** (`src/components/oefenen/Geld.tsx`) — munten, briefjes, een groepje
  geld en een voorwerp met prijskaartje. Munten en briefjes zijn de officiële
  afbeeldingen uit `public/geld/` (zie `BRON.md`). Het
  rekenen met bedragen staat in `src/lib/geld.ts`, altijd in centen. Gebruikt
  bij Geld.
- **Sleepkaartjes** (`src/components/oefenen/Sleepkaartjes.tsx`) — kaartjes
  naar vakjes slepen; op een kaartje mag ook een tekening staan, zoals een klok
  of een munt. Gebruikt bij Tafels, Delen, Tijd en Geld.

## Groep 4 – Optellen tot en met 20 · kopje "Met de raket" (oktober 2026)

Godot-bouwsteen 2 (zie GODOT-RAPPORT.md), naar het voorbeeld van Asteroid
Addition. Een raketje, zes zwevende stenen met een getal en een planeet met het
doelgetal. Het kind tikt twee stenen aan die samen het doelgetal maken; er
tekent zich een route. Controleer (of een tik op de planeet) laat de raket
vliegen. Er is altijd precies één goed paar. Geen klok, geen levens. Bij fout
lichten de goede stenen groen op en vliegt de raket die route. Alle 15 opgaven
met de raket, vragen per oefensessie 15.

| # | Titel | Bolletjes | Voorbeeld |
|---|---|---|---|
| 1 | Raket naar 10 | ●● | Welke twee maken samen 9? (4 en 5) |
| 2 | Raket naar 20 | ●●● | Welke twee maken samen 16? (7 en 9) |
| 3 | Raket: wat moet erbij? | ●●● | 8 staat al; welke steen moet erbij om 13 te maken? |

## Groep 4 – Tafels oefenen en Aftrekken tot en met 20 · kopje "Met de laser" (oktober 2026)

Godot-bouwsteen 3 (zie GODOT-RAPPORT.md), naar het voorbeeld van de
schietspellen van Synthesis, maar "rustig schieten" (keuze van de eigenaar):
acht zwevende stenen, niets valt weg, geen klok, geen levens. Het kind raakt met
de laser alle goede stenen (er zijn er altijd precies drie) en drukt op Vuur! of
Controleer. Goede stenen ontploffen; verkeerd geraakte stenen kaatsen de straal
terug; gemiste goede stenen lichten groen op. Alle 15 opgaven met de laser.

| Onderwerp | # | Titel | Bolletjes | Voorbeeld |
|---|---|---|---|---|
| Tafels oefenen | 1 | Laser: tafels van 2, 5 en 10 | ●● | Raak alle getallen uit de tafel van 5. |
| Tafels oefenen | 2 | Laser: tafels van 3 en 4 | ●●● | Raak alle getallen uit de tafel van 3. |
| Tafels oefenen | 3 | Laser: tafels van 6 tot en met 9 | ●●●● | Raak alle getallen uit de tafel van 7. |
| Aftrekken tot en met 20 | 1 | Laser: minsommen | ●●● | Raak alle sommen met uitkomst 8 (13 − 5, 12 − 4 …). |

## Groep 3 — oefeningen met bestaande types (9 oktober 2026)

Op verzoek van de eigenaar ("groep 3 heeft nog niks, maak extra veel"). Elk
leerdoel staat alleen op groep 3 en heeft in beheer "(groep 3)" achter de naam;
het kopje staat ervoor. Alle oefeningen: vragen per oefensessie 15, vijftien
verschillende opgaven per ronde, 30 sommen gepubliceerd, maatje aan. Wat er
precies is aangemaakt, staat ook in `vragen-voor-later/AANGEMAAKT.md`.

### Getallen · Tellen & sprongen tot en met 20

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Plaatjes tellen | Plaatjes tellen | ●● | plaatjestellen |
| Plaatjes tellen | Plaatjes tellen en typen | ●●● | plaatjestellen |
| Plaatjes tellen | Plaatjes door elkaar tellen | ●●● | plaatjestellen |
| Plaatjes tellen | Welk vak hoort bij het getal? | ● | vakken |
| Plaatjes tellen | Tellen en slepen | ● | tellenslepen |
| Plaatjes tellen | Veel plaatjes tellen | ●● | plaatjestellen |
| Tellen tot en met 20 | Kinderen in de bus | ● | bus |
| Tellen tot en met 20 | De hoeveelste kraal? | ● | kralen |
| Tellen tot en met 20 | Welk vak met kralen? | ● | vakken |
| Tellen tot en met 20 | Een plek in de bioscoop | ● | bioscoop |
| Verder en terug tellen | Tel verder | ● | stapstenen |
| Verder en terug tellen | Tel verder: het gat zit ertussen | ●● | stapstenen |
| Verder en terug tellen | Tel terug | ●● | stapstenen |
| Verder en terug tellen | Het huis erna | ● | straat |
| Verder en terug tellen | Het huis ervoor | ●● | straat |
| Verder en terug tellen | Buurgetallen | ●●● | straat |

### Getallen · Vergelijken & ordenen

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Meer of minder | Zoek eentje meer | ●● | vakken |
| Meer of minder | Zoek eentje minder | ●● | vakken |
| Groot en klein | De grootste vis | ● | vissen |
| Groot en klein | De kleinste vis | ● | vissen |
| Groot en klein | Grootste en kleinste tot en met 20 | ●● | vissen |
| Op volgorde | Van klein naar groot | ● | trein |
| Op volgorde | Van groot naar klein | ● | trein |
| Op volgorde | Op volgorde tot en met 20 | ●● | trein |

### Getallen · Getallenlijn tot en met 100

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Tot en met 20 | Zet het getal op de lijn | ● | getallenlijn |
| Tot en met 20 | Welk getal hoort hier? | ●● | getallenlijn |
| Tot en met 20 | De lijn met vijftallen | ●● | getallenlijn |

### Splitsen · Splitsen tot en met 20

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Splitsen tot en met 10 | Splitsen tot en met 10 | ●● | splitsen |
| Splitsen tot en met 10 | Het splitsschema | ●● | splitsschema |
| Splitsen tot en met 10 | Het splitsschema door elkaar | ●● | splitsschema |
| Splitsen tot en met 10 | Splitsen in de tabel | ● | splitstabel |
| Splitsen tot en met 10 | De splitsbloem | ● | splitstabel |
| Splitsen tot en met 10 | Verdelen in twee groepen | ●●● | verdelen |
| Splitsen tot en met 20 | Splitsen tot en met 20 | ●● | splitsen |

### Optellen · Optellen tot en met 20

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Tot en met 10 | Optellen met plaatjes | ● | plaatjessom |
| Tot en met 10 | Maak de plussom bij het plaatje | ● | plaatjessom |
| Tot en met 10 | Optellen tot en met 10 | ●● | plussom |
| Tot en met 10 | Welke som klopt? | ●● | somkeuze |
| Tot en met 10 | Koppel de som aan de uitkomst | ●● | koppelsommen |
| Tot en met 10 | Zoek de som die evenveel is | ●● | evenveelsom |
| Tot en met 10 | Kies twee getallen | ●●● | tweegetallen |
| Tot en met 10 | Maak beide kanten gelijk | ●●●● | balans |
| Tot en met 10 | Aanvullen in de tabel | ●● | aanvultabel |
| Tot en met 10 | Raket naar 10 | ●● | raketsom |
| Tot en met 20 | Optellen zonder over de 10 | ● | rekensom |
| Tot en met 20 | Optellen met plaatjes tot en met 20 | ● | plaatjessom |

### Optellen · Optellen met het rekenrek

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Met het rekenrek | Optellen tot en met 10 | ● | rekenrekerbij |
| Met het rekenrek | Optellen zonder over de 10 | ●● | rekenrekerbij |
| Flitsen | Hoeveel kralen tot en met 20? | ● | rekenrekflits |

### Aftrekken · Aftrekken tot en met 20

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Tot en met 10 | Wegstrepen | ● | wegstrepen |
| Tot en met 10 | Een minsom bij een plaatje | ● | minsomplaatje |
| Tot en met 10 | Aftrekken met plaatjes | ● | plaatjesminsom |
| Tot en met 10 | Aftrekken tot en met 10 | ●● | minsom |
| Tot en met 10 | Koppel de minsom aan de uitkomst | ●●● | minkoppelen |
| Tot en met 20 | Aftrekken zonder over de 10 | ● | rekensom |

### Aftrekken · Aftrekken met het rekenrek

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Met het rekenrek | Aftrekken binnen het tiental | ●● | rekenrekaf |

### Tijd · De wijzerklok

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Hele uren | Hoe laat is het? | ● | klokaflezen |
| Hele uren | Zet de klok | ● | klokzetten |
| Hele uren | De grote en de kleine wijzer | ● | wijzeraanwijzen |
| Hele uren | Klokken koppelen | ● | klokkoppelen |
| Halve uren | Halve uren aflezen | ●● | klokaflezen |

### Tijd · Maanden en dagen

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Dagen van de week | De dagen op volgorde | ● | dagvraag |
| Dagen van de week | Welke dag ontbreekt? | ● | dagenaanvullen |

### Geld · Munten en briefjes

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Munten | Geld tellen | ●● | geldtellen |
| Munten | Welke munt is het meest waard? | ● | geldwaarde |
| Munten | Leg het bedrag | ●●●● | geldleggen |

### Verhaaltjessommen · Optellen

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Tot en met 20 | Erbij krijgen | ● | verhaaltje |
| Tot en met 20 | Samen | ● | verhaaltje |

### Verhaaltjessommen · Aftrekken

| Kopje | Titel | Bolletjes | Soort |
|---|---|---|---|
| Tot en met 20 | Eraf | ● | verhaaltje |

## Godot-bouwsteen 4: de getaltegels (9 oktober 2026)

Naar het idee van Synthesis "Add within 10". Tegels met stippen in een
tienveld (twee tienvelden tot 20); elk getal heeft een eigen kleur. Eén
algemeen Godot-onderdeel (`GodotSpel.tsx`, figuur `godotspel`) zodat nieuwe
spellen geen eigen schermcode meer nodig hebben. Bij alle 15 opgaven het spel,
vragen per oefensessie 15, maatje aan.

| Groep | Waar | Titel | Bolletjes | Wat het kind doet |
|---|---|---|---|---|
| 3 | Optellen tot en met 20 · Met de tegels | Tegels: samen tot en met 10 | ● | 3 + 4: typen hoeveel samen |
| 3 | Optellen tot en met 20 · Met de tegels | Tegels: dubbel en bijna dubbel | ●● | 5 + 5, 5 + 6 |
| 3 | Splitsen tot en met 20 · Met de tegels | Tegels: maak het veld vol | ●● | 3 + ? = 7: de tegel kiezen |
| 4 | Optellen tot en met 20 · Met de tegels | Tegels: 10 en nog wat | ●● | 10 + 4, 4 + 10 |
| 4 | Optellen tot en met 20 · Met de tegels | Tegels: dubbel en bijna dubbel | ●● | 7 + 7, 7 + 8 |
| 4 | Optellen tot en met 20 · Met de tegels | Tegels: samen meer dan 10 | ●●● | 7 + 6 over twee tienvelden |
| 4 | Splitsen tot en met 20 · Met de tegels | Tegels: maak 11 tot en met 20 | ●●● | 8 + ? = 11 |
