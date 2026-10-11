# Vragen: Optellen tot 20, Optellen tot 100, Tientallen (uitleglessen groep 3)

Per vraag: les, vraag, wat er nu gebouwd is.

## Optellen tot 20

1. **Instaptoets en Eindtoets: stoppen halverwege.** Synthesis breekt de check af na een
   fout of een trage beurt en stuurt dan door naar de eerste les, zonder uitleg. Hier loopt
   de toets altijd tot het eind, en zegt Vos aan het eind wat het kind al kan of wat we in
   de lessen gaan oefenen ("je weet het, nu nog wat vlotter"). Goed zo?
2. **Tempo in de toetsen.** Na een goed antwoord dat langer dan 12 seconden duurde zegt Vos
   "Probeer de volgende iets sneller."; in de eindtoets na een antwoord binnen 5 seconden
   "Dat was razendsnel!". Er staat nooit een klok of aantal seconden in beeld. Kloppen die
   grenzen (12 s en 5 s)?
3. **Bijna dubbel: tijd van de voor- en natoets.** Synthesis noemt het aantal seconden
   ("in 31 seconden"). Hier alleen "Je had er 3 goed" en "En je was sneller dan eerst",
   zonder getal (zoals INSPIRATIE.md voorstelt). Of wil je de seconden wel noemen?
4. **Optellen bij 10: steeds dezelfde vraagzin.** Synthesis wisselt de vraag af ("tel 10 en
   5 op", "wat is het totaal van…", "hoe zit het met…"). Volgens de huisregel ("dezelfde
   soort vraag overal op dezelfde manier") staat er nu steeds "Hoeveel is 10 plus 4?".
   Meer afwisseling gewenst?
5. **Optellen bij 10: einde van de reeks.** Synthesis stopt na 5 foutloze sommen met een
   kaart, en breekt de les bij fouten af ("we nemen een pauze") zonder kaart. Hier: klaar
   na 5 keer in één keer goed of na 10 sommen, en altijd een kaart.
6. **Kleur van uitkomsten boven 10.** Synthesis geeft 12, 13, 14 de kleur van het
   eenhedencijfer (12 oranje zoals de 2). Het lesscherm maakt alles boven 10 wit
   (`getalkleur`), dus nu zijn ze wit. Dat aanpassen kan alleen in `tegels.ts` of
   `Lesscherm.tsx`, en die mocht ik niet aanraken.
7. **Over de 10 heen en Bijna dubbel: een eigen tegelbord.** Liggende tegels en het
   oplichtende lege plekje kan het gewone raster niet, dus deze twee lessen gebruiken een
   eigen vlak (`vlakken/optellen20-tegelbord.tsx`) met een eigen bak. Daar kies je een tegel
   door erop te tikken (meteen gekozen) of door hem naar het bord te slepen. In het gewone
   lesscherm is tikken: eerst de tegel, dan het raster. Moet dat gelijk worden?
8. **Over de 10 heen: "leg een tegel bij de 10 als dat helpt".** Bij Synthesis mag het kind
   tijdens de vraag een tegel leggen. Hier kan dat niet tegelijk (de gids kan niet praten
   terwijl de keuzeknoppen openstaan). De tegels komen nu als hulp na een fout of na
   "Weet ik niet".
9. **Eindtoets: de vragen.** Ronde 2 haalde het einde niet (tijdgrens). Gebouwd naar ronde 1:
   10-tegel, 10 + zelfgekozen tegel, 10 + nieuwe tegel, wat moet er bij 17 om 20 te maken,
   8 + zelfgekozen tegel (over de 10), en als laatste 7 + 8 zonder tegels (die laatste heb
   ik zelf toegevoegd, als bijna-dubbel).

## Optellen tot 100

10. **Groep 4 eruit gelaten in de toetsen.** De instaptoets van Synthesis stopte na 30 + 40;
    de eindtoets vraagt ook 76 + ? = 100 en 37 + 8 (groep 4). Omdat Make 100, Bridging en
    Crossing niet gebouwd zijn, toetsen beide toetsen hier de groep 3-lessen: groepjes van
    10, tientallen erbij, tiental + eenheden (40 + 7, 70 + 6), splitsen (7 = 5 + ?,
    8 = 5 + ?) en 27 + 20. Akkoord?
11. **Tiental plus eenheden: het woord "veelvoud".** Synthesis legt "veelvoud van 10" uit.
    INSPIRATIE.md zegt: niet voor groep 3/4, wij zeggen "een rond getal". Dat staat er nu
    ("30 is een rond getal; het bestaat alleen uit groepjes van 10").
12. **Splitsen: geen piano en geen Engelse woorden.** De woorduitleg "compose/decompose" met
    de piano is vervangen door "samenvoegen" (als bouwen, iets groots van kleine stukjes)
    en "splitsen" (in stukjes breken), met de tegel van 5 die uit elkaar valt. Goed zo?
13. **Splitsen: geldt 2 + 3 als "een andere manier" na 3 + 2?** Nu niet: omgedraaid telt als
    dezelfde splitsing ("Die hadden we al").
14. **Invulvak tot 99.** Het invulvak van het lesscherm neemt maar twee cijfers. Alle
    antwoorden in deze lessen zijn keuzes of blijven onder de 100, dus het speelt nu niet;
    voor Make 100 (groep 4) moet dat later wel.
15. **Tienenmachine: geen knop Wissen.** Synthesis heeft soms "Clear"; in deze lessen zet de
    les zelf het nieuwe getal neer, dus die knop is weggelaten.

## Tientallen

16. **Groepjes van tien: leeftijd.** Synthesis vraagt de leeftijd van het kind; dat doen we
    niet (privacy, staat ook in INSPIRATIE.md). Vos vraagt "Noem eens een getal onder de
    10", het kind typt het in.
17. **Groepjes van tien: tot 100, niet tot 1000.** De 100-knop en tien honderden = 1000 is
    groep 5. De les stopt bij 100; de vraag "hoeveel grote groepjes voor een nóg groter
    groepje?" (10) staat er nog wel in, zonder het te bouwen. De instapopdracht "maak 444"
    is "maak 34" geworden.
18. **Groepjes van tien: bouwopdrachten.** Aan het eind 47, 60 (met een nul) en 13 met
    alleen losse stippen (dan zie je het samenkruipen), zoals INSPIRATIE.md voorstelt.
19. **Losse stippen: wit of blauw?** In de bundelmachine zijn de losse stippen wit (zoals
    Synthesis in deze les), in de tienenmachine van Optellen tot 100 blauw (zoals Synthesis
    daar). Gelijk trekken?
20. **De plek van de tientallen: kleuren.** INSPIRATIE.md stelt voor de woorden
    "tientallen" groen en "eenheden" blauw te kleuren, zoals de stippen. De tekst van het
    lesscherm kan alleen getallen kleuren, dus de woorden zijn nu wit.
21. **De plek van de tientallen: heen en weer slepen.** Synthesis laat het kind vrij heen en
    weer slepen. Hier één keer heen, één keer terug en weer heen; daarna gaat het vak van
    de enen op slot.

## Tweede bouwronde (10 oktober 2026)

### Optellen tot 20 (nalopen)

22. **Instaptoets en eindtoets: "toets of lessen?".** Synthesis vraagt eerst "Ben je hier al
    goed in?" en daarna "Wil je een toets doen of de lessen?". De eerste vraag staat er nu in
    (Ja/Nee, met bak 2, 4, 6, 8, 10 zoals Synthesis). De tweede niet: kiest een kind
    "lessen", dan zou de toets afgevinkt worden zonder dat hij gedaan is. Wil je die keuze
    toch?
23. **Over de 10 heen: tegels tijdens de vraag (vraag 8).** Bij 8 + 7, 9 + 5 en 8 + 9 mag het
    kind nu, net als bij Synthesis, tijdens het kiezen een tegel bij de 10 leggen ("Leg een
    tegel bij de 10 als dat helpt."). De les kan tijdens het kiezen niet praten, dus
    "Goed nagedacht met de tegels" komt pas na het antwoord. De hulp na een fout blijft.
24. **Optellen bij 10: met fouten.** Synthesis zegt dan "laten we een pauze nemen" en geeft
    geen kaart. Nu zegt Vos na 10 sommen zonder 5 keer goed: "Laten we hier even stoppen. We
    oefenen dit later nog eens." en daarna komt toch de kaart. Goed zo?
25. **Bijna dubbel: logboekje.** Linksboven in het tegelbord staan nu de sommen van het
    trucje onder elkaar ("5 + 5 = 10", "5 + 6 = ?"), zoals bij Synthesis.
26. **Instaptoets: tegel die in de 10 schuift.** Ronde 1 noemt een animatie waarbij de kleine
    tegel in de tientegel schuift, op het moment dat Synthesis de toets afbreekt. Omdat de
    toets hier niet afbreekt, is die animatie niet gebouwd.

### Optellen tot 100 (nalopen)

27. **Splitsen: nu wél een liedje (vraag 12).** Na "Heb je dat woord al eens gehoord?" bouwt
    het kind op een kleine piano een liedje van 6 noten en speelt het af, zoals bij
    Synthesis. Toetsen do, re, mi, fa, sol, la, si (Synthesis: C tot en met B); de toon is
    een eenvoudige eigen klank. Mag er in de lessen geluid zijn (ook als de stem uit staat)?
    Het woord blijft "samenvoegen", niet "samenstellen".
28. **Tiental plus eenheden.** Toegevoegd: "Weet je wat ronde getallen zijn?" (Ja/Nee), met
    de geruststelling uit Synthesis.
29. **Instaptoets en eindtoets tot 100.** Toegevoegd: "Ken je dit al?" (Ja/Nee) aan het begin,
    en na 30 + 40 "Je doet het echt heel goed." De keuze "toets of lessen" niet (zie 22).
30. **Toetsen en de nieuwe lessen (vraag 10).** Nu Aanvullen en Over het tiental er als
    groep 3-les zijn, zou de eindtoets een vraag als 17 + ? = 20 of 37 + 8 (Synthesis) kunnen
    krijgen. Dat heb ik niet gedaan; de toetsen zijn ongewijzigd op het begin na.
31. **Vraag 14 is achterhaald**: het invulvak neemt nu drie cijfers.

### Optellen tot 100 (nieuwe lessen)

32. **Aanvullen tot het tiental: geen 1–9-knoppen.** Zonder stippen typt het kind het getal
    in het invulvak (HARDE REGEL 5). Na een fout: de som met de echte uitkomst
    ("23 + 6 = 29, we zoeken 30") en de keuze "Nog eens" of "Met stippen" (uit ronde 1);
    "Weet ik niet" haalt meteen de stippen erbij. Kiest het kind "Nee" bij "zullen we er een
    paar zonder stippen doen?", dan volgt nog één met stippen (26 + 4); dat staat niet bij
    Synthesis.
33. **Aanvullen en Over het tiental: vinkje en handje in het speelvlak.** Bij Synthesis staan
    het blauwe vinkje en het handje links bij de tekst. Het lesscherm heeft daar geen plek
    voor een eigen knop, dus ze staan rechtsonder in het speelvlak. De vraag is steeds
    "Wat moet er bij 17 om 20 te maken?" (dezelfde zin als in de eindtoets tot 20).
34. **Tientallen tot 100 (groep 3-deel van Make 100).** Alleen het groep 3-stuk: +10 tikken,
    voorspellen hoe vaak nog, doortikken tot 100 (de klodders worden één oranje klodder),
    10 + 90 = 100. Zelf toegevoegd: "Je drukte nog 9 keer, 9 groepjes van 10 is 90" en een
    terugblikvraag "Hoeveel groepjes van 10 zitten er in 100?". De rest (85 + 15, 78 + 22,
    64 + ? … = 100) is groep 4 en niet gebouwd. Titel "Tientallen tot 100" goed?
35. **Over het tiental (groep 3-deel van Crossing 10s).** De openingssom is 17 + 5 in plaats
    van 67 + 8 (groep 4-getallen); bij "Ja, ik kan dat snel" komen niet de vier snelle
    sommen van Synthesis (84 + 7 enz., groep 4), maar gaat de les gewoon door. De les stopt na
    18 + 3; 26 + 6, de getallenlijn en de losse sommen zijn groep 4. Tijdens de twee stappen
    staat er 17 + 3 + 2 (ronde 2), daarna 17 + 5.
36. **Volgorde in de lijst.** De drie nieuwe lessen staan achteraan (na de eindtoets), zoals
    BOUWEN.md vraagt. De volgorde van Synthesis is: instaptoets, Tientallen erbij,
    Tientallen tot 100, Splitsen, Aanvullen tot het tiental, Tiental plus eenheden, Over het
    tiental, eindtoets. Zal de hoofdagent ze zo in de catalogus zetten?
