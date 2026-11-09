# KEURING gouden klokles — squla-klok-hoelaat-1-gouden ("Hoe laat is het?")

Onafhankelijke controleur, 9 november 2026, branch backup-squla. Ik heb niets in de code of database veranderd; ik heb de les alleen gespeeld en bekeken (alleen met het profiel Testkind, laptop 1440 x 900 en telefoon 390 x 844). Geen betaald tegoed gebruikt, niets online gezet, oude lessen (regel 8) niet aangeraakt.

## UITSLAG: AFGEKEURD

Reden in 1 zin: de les is bijna helemaal goed, maar er zijn 4 echte fouten (hints die het antwoord verklappen, een zin die niet klopt bij de 2e fout, een onzin-zin bij het samen voordoen, en de trage telefoon haperde 55 ms). Daarna kan hij opnieuw gekeurd worden.

## Hoe ik gespeeld heb

Eigen speler (niet het speelcontrole-script) in een echte Chrome met grafische kaart. Bliepo praat versneld (120 ms per zin), dus tijden van de stem zijn niet gemeten, wel de tijden tussen tik en reactie. Elke vraag en elke reactie staan in het logboek van de les (`window.__gouden`). Gespeelde routes:

| Route | Wat | Foto's |
|---|---|---|
| goed | Nee, alles goed (met bonus en de 2 klokken die terugkomen) | 56 |
| fout | Nee, bij elke vraag 2 keer fout (eerste foute keuze, daarna de tweede) | 200 |
| foutrev | Nee, bij elke vraag 2 keer fout met de foute keuzes in omgekeerde volgorde, andere zet-fouten | 197 |
| bonusfout | Alle klokken goed, bonus 2 keer fout | 60 |
| ja | Ja, proef goed | 27 |
| jafout | Ja, 2 fouten in de proef, dan alsnog de uitleg, dan overal fout | 204 |
| hulphandje | 7 seconden niets doen bij "Zet de kleine wijzer op de 2" | 1 |
| telefoon | hele fout-route op 390 x 844 | 202 |

Foute antwoorden gespeeld: 67 verschillende foute keuzes (alle 26 foute keuzes van de 13 klokken, bijna alle van de uitleg, beide van de bonus, 10 van de zetvragen, `spiegelbeeld` bij 2, 10, 5 en 7). Niet apart gespeeld: de foute keuze bij "Waar wijst de grote wijzer?" voor 2 t/m 11 uur (zelfde sjabloon, wel gespeeld bij 1 uur), en "een ander getal" (zet-ring) bij het zetten. Opmerking: in de hele route komt elke vraag 2 keer fout voor, dus "2 keer dezelfde denkfout" is ook gespeeld (stap 4, 6, 11, 12, 15, tussendoor-grote en meer).

## Per regel

### Rekenen en inhoud

| Regel | Oordeel | Bewijs |
|---|---|---|
| Alle tijden, wijzerstanden en antwoorden kloppen (11.9) | GOED | Alle 13 klokken, alle uitlegklokken (3, 7, 11, 6, 7:30), de zetvragen (2, 3, 6, 7) en de bonus (12 uur + 1 uur = 1 uur) klopten met wat ik op de klok zag. Foto's goed/030, 033, 053. |
| Elke vraag heeft 1 juist antwoord of alle juiste worden goed gerekend (14.30, F2) | GOED | Geen vraag met 2 goede keuzes gevonden. "Waar wijst de grote wijzer?" heeft keuzes [uur, 12], alleen 12 is goed. Klok op 12 uur komt niet in die vraag voor. |
| Inhoud gelijk aan de oude les squla-klok-hoelaat-1 (15.8, 1.26) | GOED | De 13 klokken, tijden, volgorde, 3 keuzes per klok, verhaalzinnen, weetjes en reserve [0, 2, 6] zijn regel voor regel gelijk aan `hoelaat1` in squla-klok.tsx. De 2 uitlegvragen op 3 uur (12/3/6 en 12 uur/6 uur/3 uur) zitten erin. `REV=HEAD node scripts/inhoudsvergelijk.mjs`: 0 verdwenen. Let op: dat script vergelijkt de les alleen met zichzelf; de gelijkheid met de oude les heb ik daarom met de hand nagelopen. Oude les staat in git sinds commit eace9c4 ongewijzigd. |
| Extra vragen (uitlegvragen uit het draaiboek, tussendoor, bonus) binnen het leerdoel (15.12) | GOED | Alleen hele uren, getallen 1 t/m 13 (de 13 alleen als fout antwoord bij "na de 12", op de getallenlijn). Geen eigen leerdoelen. |
| Terugkom-regel (gemiste klokken + reserve tot 15) | GOED, 1 opmerking | Bij alles goed komen klok 1 en klok 3 terug (reserve) met de zin "Er komen nog 2 klokken van net terug." Dat is zoals de oude les, maar "van net" klopt niet helemaal als het kind niets gemist heeft. Klein. |
| Eindkaart: grote wijzer niet over de 12, geen "(gouden les)" (15.13 punt 5) | GOED | foto goed/054: paarse wijzer eindigt onder de 12, titel "Hoe laat is het?". |
| Beginscherm: uitleg + persoonlijke vraag, Ja = proef van 2, 2 fouten = uitleg, Nee = uitleg (4.4, T21) | GOED | "Hoi Testkind! Fijn dat je er bent." dan "In deze les lees je op de klok hoe laat het is. Je kijkt naar de wijzers en kiest het hele uur. Weet jij al hoe dat moet?" Route ja: 2 klokken, dan door naar klok 3. Route jafout: 2 fouten in de proef -> "Dit is nog lastig. We gaan het eerst samen bekijken." -> uitleg. |

### Plaatje en beeld

| Regel | Oordeel | Bewijs |
|---|---|---|
| Plaatjes passen bij de les, geen mensen of gezichten, niets raakt elkaar op laptop (1.1, 1.2, 1.15, 14.23) | GOED | Bus, zon, maan, bakkerij zijn losse voorwerpen; klok en wijzers kloppen. Geen overlap op 1440 x 900. |
| Klok en wijzers: donkere wijzers, kleine oranje, grote paars, grote wijzer bedekt de getallen niet (8.2, 7.9) | GOED | Alle foto's. Op 12 uur (klok 2) liggen beide wijzers over elkaar; de punt van de grote steekt boven de kleine uit en is te zien. |
| Rood scherm bij fout, groen bij goed, geen rood of gloed op de keuze, knoppen verdwijnen na tik, geen fout-geluidje (5.3, 7.6, 7.8a) | GOED | foto's fout/003, 014: Bliepo's scherm rood; de knoppen zijn weg. Geen gloed om een keuze. De duur (1,5 s / 1 s) heb ik niet met een klok gemeten, alleen gezien. |
| Oranje ring alleen bij hint, doel of 2e fout, 1 tegelijk (7.8e) | GOED | Ring om het doel bij "Zet de kleine wijzer op de 2" (doel), ring bij het samen voordoen. Nooit 2 ringen. |
| Vraag verdwijnt tijdens de hint bij een keuzevraag; opdrachtregel blijft bij zetten (14.32) | GOED | fout/119 (vraag weg, hint + pijl); fout/067 (kop "Kleine wijzer op de 2" blijft). |
| Hulphandje vanzelf na 5 à 6 s bij een opdracht, met 1 korte zin, geen knop (5.10, 6.10) | GOED | 5,5 s na het einde van de opdracht kwam het handje bij de 2 met "Tik op de 2, of sleep de kleine wijzer erheen." (foto goed/022). Er is geen "Weet ik niet"-knop (1.27). |
| Schermfoto's op telefoon: niets overlapt (1.15) | FOUT (klein) | tel/fout/067: de kop "Kleine wijzer op de 2" loopt onder de knoppenbalk rechtsboven ("Testkind"); het cijfer 2 wordt half bedekt. De klok is op de telefoon klein (± 170 van 390 px) en staat rechtsboven met veel lege ruimte; 1.24 zegt dat de klok groter moet. Telefoonindeling is volgens T7 uitgesteld, maar dit overlap-geval is nieuw. |

### Taal en woorden

| Regel | Oordeel | Bewijs |
|---|---|---|
| Cijfers in teksten (3.20) | GOED | Overal "1 keer", "2 wijzers", "Nog 1 als toetje", "over 1 uur". Geen "één/twee/drie" in de zinnen (zoekopdracht in squla-klok-gouden-zinnen.ts: geen treffer). |
| Werkwoord past bij wat het kind doet (14.35, F6) | GOED | "Kijk" overal; geen "luister". |
| Geen "groep"/"soort ding" (14.33, F5) | GOED | Geen treffer. |
| Naam hooguit 2 keer per les en nooit bij een fout (3.17) | GOED | goed-route: groet + 1 lof met naam ({naam} bij stap 6) = 2. Route ja: groet + "Ja {naam}, zo is het!" = 2. In de foute routes nul extra. |
| Geen dubbele zinnen / geen zin 2 keer achter elkaar (5.10) | GOED | Per vraag komt de vraag in de 2e poging verkort terug ("Hoe laat is het?") en niet dubbel (3.23). Rijtjes geven nooit 2 keer dezelfde achter elkaar. |
| Geen vaste openingen (5.10, 5.11) | GOED, met opmerking | De eerste zin per denkfout staat vast in de fouttabel ("Je zat er vlak naast." komt bij alle `getal-ernaast` voor, "Je keek naar de grote wijzer." bij alle `verkeerde-wijzer`; dat is zo ontworpen in 15.9). Het herhalingsscript meldt alleen "Hoe laat is het?" (4 keer, dezelfde vraag als de oude les). |
| Schooltermen overal gelijk (3.11, 14.3) | FOUT (klein) | Stap 11: de vraag zegt "lange wijzer", de herhaling "Wat telt de grote wijzer?" en het samen voordoen "De grote wijzer gaat snel rond" — voordat stap 12 laat zien dat lange = grote. Een kind van 6 weet dan nog niet dat het dezelfde wijzer is. |
| Zinnen kloppen met het beeld en zijn goed Nederlands (3.12, 14.4) | GOED, met 3 opmerkingen | Zie "Problemen" 5, 6 en 7. |
| Kleur van getallen bij het voorwerp, wit alleen zonder voorwerp (2.2, 14.16, 14.20) | FOUT (klein) | In de vraag "Is het nu 7 uur?" (stap 18) en "Het is nu 12 uur. Hoe laat is het over 1 uur?" (bonus) staat het uur wit (foto goed/029, 053). Het hoort bij de kleine wijzer (oranje). In de hints en uitleg staat het wel oranje. |
| F1 (hint past op 2 keuzes, abstract) | GOED | Elke hint wijst 1 ding aan; bij de 1e fout staat er in de hint waar het over gaat. |
| F2, F3, F4, F5, F6 | GOED | Niet gevonden. |

### Pogingen en fouttabel (hoofdregel 15.9, 15.11)

| Regel | Oordeel | Bewijs |
|---|---|---|
| 2 pogingen overal: 1e fout hint, 2e fout uitleg + samen voordoen, daarna door (15.11) | GOED | Alle vragen in alle routes. Na de 2e fout: uitleg, antwoord in oranje ring, alleen de goede knop blijft, kind tikt zelf, les gaat door. Geen derde poging, nooit stoppen of naar het menu. Zetvragen: 1e fout hint + handje, 2e fout uitleg + alleen het doel werkt. |
| Goed na een fout: alleen korte bevestiging (5.1) | GOED | Zie log: bij poging 2 een zin uit het rijtje "Ja, nu klopt het" enz. |
| Voortgang: goed in 1 keer / goed na een fout / samen gedaan, alleen "goed in 1 keer" telt (15.11) | GOED | `window.__uitkomsten`: goed-route: elke vraag goed-in-een-keer; fout-route: elke vraag samen-gedaan. 76 tot 78 denkfouten per fout-route vastgelegd, geen gegevens naar de server. |
| Elke vraag heeft een fouttabel; elke fout een reactie (14.36 a-c) | GOED | 67 van de ± 86 foute keuzes gespeeld; elke keer een reactie die past bij de denkfout (zie tabel hieronder). Niet gespeeld: 10 tussendoor-vragen (zelfde sjabloon) en "ander getal" bij zetten. |
| Twee keer dezelfde denkfout: "weer" + andere uitleg (15.9) | GOED, 1 opmerking | Gespeeld bij o.a. stap 4, 6, 12, 13 (12 + 12), tussendoor-welke-wijzer, tussendoor-grote, stap 15, stap 18. Overal "weer" + andere uitleg. Uitzondering: stap 11 ("Ik snap dat het raar is. De lange wijzer gaat in 1 uur een heel rondje.") zegt niet dat het weer hetzelfde was. |
| De 1e zin zegt wat het kind dacht, zonder "fout" en zonder naam (15.9) | GOED | Geen "fout" gehoord of gezien, geen naam in een fout-reactie. |
| Hint verklapt het antwoord niet, ook niet via ring, kleur of handje (14.36 e) | FOUT | Zie "Problemen" 1. |
| Zin bij "niet duidelijk": uit het rijtje §10 + algemene hint, geen verzonnen reden | FOUT (1 plek) | Zie "Problemen" 2: "Probeer het nog 1 keer, met een tip." bij de 2e fout. |
| Spiegelbeeld is een eigen denkfout (15.13 punt 4) | GOED | klok 9 (10 uur, koos 2): "Je koos het getal rechts, maar de wijzer wijst naar links."; klok 10 (2 uur, koos 10): links/rechts omgekeerd; zet 2 (koos 10) en zet 7 (koos 5) idem. Links en rechts kloppen in alle 4 gevallen. 3 en 9 blijven `andere-kant`. |
| Tempo: reactie 0,2 - 0,4 s na de tik (6.10a) | GOED | Gemeten in het logboek: tik -> reactie 200 - 223 ms in alle tikken (de stem begint daarna). |
| Heel snel antwoord: alleen in het oefenblok, hooguit 1 keer per 4 klokken (6.10c) | GOED | "Dat ging snel!" enz. kwam alleen in het oefenblok, nooit vaker dan 1 per 4 vragen. Met de versnelde stem is dit niet goed te meten; de regel in de code is de 2 seconden uit het draaiboek. |
| Verder-pijl: staat er vanaf het begin, een tik breekt de zin af, uitleg alleen de eerste keer (6.9, 3.15) | GOED | Pijl-uitleg "Klaar met kijken? Tik dan op de blauwe pijl." kwam 1 keer per route. |
| Niet vastlopen (5.7) | GOED | Alle 8 routes liepen tot de eindkaart zonder te blijven hangen. |

### Meten (vloeiend, harde regel 7)

| Regel | Oordeel | Bewijs |
|---|---|---|
| Laptop: 55-60 beelden/s, geen hapering boven 50 ms, openen < 1 s | GOED | `ALLEEN=squla-klok-hoelaat-1-gouden node scripts/vloeiendcontrole.mjs`: laptop openen 408 ms, 60 beelden/s, langste beeld 25 ms. |
| Trage telefoon: geen hapering boven 50 ms | FOUT (bevestigd) | Ik meet hetzelfde als jullie: 59 beelden/s, langste beeld 55 ms (2 metingen, grens 50). Openen 2858 / 3217 ms in de ontwikkelversie (alleen een waarschuwing; de echte site moet < 1000 ms). Let op: de laptop was niet helemaal stil (load ± 2,8 door andere programma's), dus de echte waarde kan iets lager zijn; toch niet onder de grens bewezen. |

## Problemen (in simpel Nederlands)

1. **Hints verklappen het antwoord (fout, 14.36 e en 15.9).** Bij de eerste fout laat de les in beeld zien wat het kind moet kiezen:
   - Stap 7 en 8: het blauwe pijltje staat precies boven de 12 en onder de 6 (foto fout/015). Dat is het antwoord.
   - Stap 9: de blauwe pijl loopt van de 6 naar de 7 (het antwoord). Stap 10 en de bonus: de pijl loopt van de 12 naar de 1 (het antwoord).
   - Stap 11: de hint zegt "Maar op de klok is het andersom." en dat is het antwoord.
   - Bonus: "Over 1 uur schuift de kleine wijzer 1 getal verder. Volg de blauwe pijl." (verklapt 1 uur).
   Dit komt uit het draaiboek (Synthesis doet het ook), maar BOUWREGELS 15.9 en 14.36 zeggen dat een hint het antwoord nooit verklapt, "ook niet via een ring". BOUWREGELS gaat voor. Sara moet kiezen: de hint minder laten verklappen (bijvoorbeeld de pijl alleen vanaf het getal laten wijzen zonder de punt, of pas bij de 2e fout), of een uitzondering in de regel opnemen.

2. **De zin "Probeer het nog 1 keer, met een tip." klopt niet bij de 2e fout (fout).** Bliepo kiest de eerste zin bij een onduidelijke fout uit een rijtje (BLIEPO-KARAKTER §10). Zin 10 uit dat rijtje belooft nog een poging, maar na de 2e fout is er geen poging meer (samen voordoen). Gezien in: stap 8 (fout 2), klok 2 (fout 2), stap 16 "Hoe laat is het dus?" (fout 2). Oplossing: bij de 2e fout deze zin overslaan, of uit het rijtje halen.

3. **Onzin-zin bij het samen voordoen in stap 12 (fout, 14.33).** Na 2 fouten zegt Bliepo "De grote wijzer heet de grote wijzer." en "De kleine wijzer heet de kleine wijzer." Dat legt niets uit voor een kind van 6. Beter: "Deze lange wijzer is de grote wijzer. Hij telt de minuten." en "Deze korte wijzer is de kleine wijzer. Hij laat het uur zien."

4. **Vloeiend op de trage telefoon: 55 ms (fout, harde regel 7).** Ik meet het ook (zie hierboven). Bekend en al gemeld; nog niet opgelost.

5. **Kleine taalpunten (opmerking, niet afkeurend).**
   - Klok 9: "Ja, die is het! Ja, de grote wijzer staat bovenaan, dus het is een heel uur." Twee keer "Ja," achter elkaar (lofzin + reactie bij de klok beginnen allebei met "Ja,"). Kies bij de combinatie een reactie zonder "Ja".
   - Stap 11 (herhaling en samen voordoen): "lange wijzer" wordt "grote wijzer" voordat stap 12 dat uitlegt (zie schooltermen). Ook de 2e-fout-uitleg bij dezelfde denkfout zegt daar niet "weer".
   - "Ik bedoelde een andere." (stap 16, klok 5) en "Als je kiest, kijk ik het meteen na." (aanmoediging bij een opdracht waar het kind niets kiest maar tikt of zet): de zinnen staan in het rijtje van BLIEPO-KARAKTER, maar passen niet goed bij een tik- of zetopdracht (14.35). Sara beslist of het rijtje aangepast wordt.
   - "Er komen nog 2 klokken van net terug." terwijl er niets gemist is (zie boven).

6. **Kleur van het uur in 2 vragen (klein).** "Is het nu 7 uur?" (stap 18) en "Het is nu 12 uur. Hoe laat is het over 1 uur?" (bonus): het uur staat wit, hoort oranje (kleine wijzer).

7. **Telefoon (klein).** De kop "Kleine wijzer op de 2" loopt onder de knoppenbalk; de klok is klein. Zie tabel hierboven.

## Fouttabel per vraag: de foute keuzes die ik gespeeld heb

Alles hieronder klopte (reactie past bij de denkfout, hint past bij het beeld, hint verklapt niets) behalve waar het bij Problemen staat. "J" = klopt.

| Vraag | Foute keuze gespeeld | Denkfout in de voortgang | Reactie klopt |
|---|---|---|---|
| stap 4 | een klok (2 keer) | beeld-van-net | J |
| stap 6 | een getallenlijn (2 keer) | beeld-van-net | J |
| stap 7 | 1 / 6 | getal-ernaast / boven-onder-verwisseld | J, maar pijltje verklapt (Probleem 1) |
| stap 8 | 12 / 3 | boven-onder-verwisseld / onduidelijk | J, maar pijltje verklapt; "Probeer het nog 1 keer" bij fout 2 (Probleem 2) |
| stap 9 | 8 / 5 (beide volgorden) | een-te-veel / verkeerde-richting | J, maar pijl verklapt |
| stap 10 | 11 / 13 (beide volgorden) | verkeerde-richting / doortellen-na-12 | J, maar pijl verklapt |
| stap 11 | de uren (2 keer) | wijzers-verwisseld | NIET: hint verklapt; fout 2 zegt niet "weer" |
| stap 12 (lange en korte) | de andere naam (2 keer) | wijzers-verwisseld | J, maar samen-zin is onzin (Probleem 3) |
| stap 13 (3, 7, 11) | 12 / 9 / 1 / 5 | verkeerde-wijzer / andere-kant | J |
| stap 14 zet 2, 3, 6, 7 | 3, 4, 7, 8 (ernaast); 8, 9, 1 (andere kant); 10, 5 (spiegel); 12 | getal-ernaast / andere-kant / spiegelbeeld / verkeerde-wijzer | J (links/rechts kloppen) |
| stap 15 | 6 (2 keer) | verkeerde-wijzer | J, extra zetopdracht 7 na de 1e fout zoals draaiboek |
| stap 16 (wijst 3) | 6 / 12 | onduidelijk / verkeerde-wijzer | J |
| stap 16 (hoe laat) | 6 uur / 12 uur | onduidelijk / verkeerde-wijzer | J |
| stap 17 | 6 minuten / 12 uur | uur-minuten-verwisseld / verkeerde-wijzer | J |
| stap 18 | Ja (2 keer) | geen-heel-uur | J (hint zegt bijna "Nee", maar met Ja/Nee kan niet anders) |
| klok 1 t/m 13 (alle 26 foute keuzes) | alle | getal-ernaast, andere-kant, spiegelbeeld, verkeerde-wijzer, onduidelijk | J. Bij klok 2 (12 uur) past de hint "Hier staat de kleine wijzer op hetzelfde getal als de grote. Welk getal is dat?" |
| tussendoor welke wijzer | de grote wijzer (2 keer) | wijzers-verwisseld | J |
| tussendoor waar wijst de grote wijzer (1 uur) | 1 (2 keer) | verkeerde-wijzer | J |
| bonus | 12 uur en 11 uur | een-te-weinig / plus-min-verwisseld | J, maar pijl 12 -> 1 verklapt |
| Ja-route, 2 fouten in de proef | 9 uur, 8 uur bij klok 1 | onduidelijk | J: 2e fout geeft meteen "Dit is nog lastig. We gaan het eerst samen bekijken." (geen aparte reactie op de 2e fout, zoals T21 zegt) |

## Wat wél goed is (kort)

De route zit goed in elkaar: rood en groen scherm, de pijl, de ring en het handje doen wat de regels zeggen; het samen voordoen werkt overal (alleen de goede knop blijft); de les stopt nooit; en de 13 klokken zijn gelijk aan de oude les. De fouten die ik vond zijn dus klein en goed te herstellen.

## Wat moet er gebeuren voor een nieuwe keuring

1. Beslissing van Sara over de verklappende hints (Probleem 1) en aanpassing (alleen waar zij dat kiest).
2. Zin 10 ("Probeer het nog 1 keer") niet gebruiken bij de 2e fout (Probleem 2).
3. Zinnen van stap 12 samen voordoen herschrijven (Probleem 3).
4. Telefoon: hapering onder de 50 ms krijgen (Probleem 4).
5. Daarna opnieuw `npm run vloeiend` (laptop rustig) en een nieuwe speelronde van alleen de aangepaste vragen. De kleine punten (5, 6, 7) kunnen mee in dezelfde ronde.
