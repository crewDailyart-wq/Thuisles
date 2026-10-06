Het maatje – fase 1, bij ALLE domeinen van groep 4. Voer dit uit NA de andere bestanden in de wachtrij. Lees eerst MAATJE-HANDLEIDING.md helemaal. Dat is het brein van het maatje en de regels gelden voor alles hieronder. Staat dat bestand er niet, schrijf dat dan in NACHTRAPPORT.md en sla deze opdracht over. Volg ook CLAUDE.md en ONTWERPREGELS.md. Verwijder niets en verander geen titels. Werk op de aparte tak op GitHub, niet op de hoofdtak.
VOLGORDE EN OPSLAAN
- Bouw eerst deel 1, 2 en 5 (het maatje zelf). Doe daarna deel 3 en 4 domein voor domein, in deze volgorde: Optellen, Aftrekken, Delen, Tafels, Splitsen, Getallen, Verhaaltjessommen, Tijd, Geld, en daarna eventuele andere domeinen van groep 4.
- Commit na elk domein op de aparte tak. Is het niet af als je moet stoppen, schrijf dan in NACHTRAPPORT.md precies bij welk domein en welke oefening je gebleven bent, zodat je de volgende keer verder kunt.
DEEL 1 – HET MAATJE OP HET OEFENSCHERM
- Zet het maatje op het oefenscherm, voorlopig met de vos als poppetje. Bouw het zo dat we later alleen de plaatjes hoeven te wisselen.
- Het maatje heeft houdingen: rustig, praat (mond open en dicht), blij, denkt na, troost. Het heeft een tekstwolkje voor wat het zegt.
- Er is een knop om het geluid uit te zetten. Dat onthoudt Thuisles per kind. Zonder geluid blijft het tekstwolkje zichtbaar.
- Het maatje reageert op deze momenten: nieuwe opgave (tekst 1 en 2), tijdens het bouwen (de tekstwolkjes die er al zijn, zoals "Samen 10!"), goed antwoord (tekst 3), fout antwoord (tekst 4 of 5), 30 seconden niets gedaan (tekst 6), einde van de ronde (hoofdstuk 3 van de handleiding).
- Bij een fout antwoord lopen de zinnen van het maatje gelijk met het plaatje: terwijl het maatje een zin zegt, doet het rekenrek, de bolletjes, de pootjes, de weegschaal, de klok of het geld die stap voor. Gebruik daarvoor de plaatje-stappen die bij elke tekst horen. Bij oefeningen zonder plaatje legt het maatje alleen in woorden uit.
- Het maatje geeft nooit een knop "Hulp". Tekst 6 (de tip) komt alleen na 30 seconden niets doen.
DEEL 2 – DE STEM
- Gebruik de stem die het voorlezen nu al gebruikt. Elke zin wordt één keer omgezet in geluid en daarna bewaard, zodat het snel en goedkoop blijft.
- Terwijl het geluid speelt, beweegt de mond van het maatje.
DEEL 3 – DE TEKSTEN SCHRIJVEN (per domein)
- Schrijf voor elke opgave van elke oefening de zes teksten uit hoofdstuk 4 van de handleiding, met 3 varianten voor het eerste woord van tekst 3 en 4, en voor elke bekende fout uit het hoofdstuk van dat domein een eigen tekst 4. Zet bij elke tekst de plaatje-stappen, of "geen plaatje".
- Doe dit met een script dat de Claude API gebruikt, met de handleiding als instructie, als er een sleutel voor is. Is die er niet, schrijf de teksten dan zelf, in batches, met de handleiding ernaast.
- Bewaar de teksten in de database bij de opgave. Zet er een versie bij, zodat we later teksten opnieuw kunnen schrijven zonder de rest te raken.
- Bouw de automatische controles uit hoofdstuk 11 en laat elke tekst erdoorheen gaan. Een tekst die niet door de controle komt, wordt opnieuw geschreven.
DEEL 4 – DE FOUTENHERKENNING (per domein)
- Bouw de herkenning van bekende fouten volgens de tabellen in de handleiding (hoofdstuk 5 tot en met 10). Thuisles kijkt naar het getypte antwoord of de gemaakte keuze en kiest de passende tekst 4. Past er geen bekende fout, dan komt tekst 5.
- Wordt een fout niet herkend, dan noteert Thuisles het antwoord van het kind in een lijstje, zodat we later nieuwe fouten kunnen toevoegen.
DEEL 5 – INSTELLINGEN
- In beheer kan het maatje per oefening en in één keer voor alles aan en uit. Zet het aan bij elke oefening waarvoor de teksten klaar en gecontroleerd zijn. Bij oefeningen zonder teksten blijft het uit.
TESTEN EN AFSLUITEN
- Test per domein met het profiel Testkind, met screenshots op een laptop-, tablet- en telefoonscherm: een goed antwoord, drie verschillende fouten, 30 seconden niets doen, en het einde van een ronde. Test ook of het geluid uit kan.
- Schrijf in NACHTRAPPORT.md een korte samenvatting in simpele taal: wat er is gebouwd, per domein hoeveel teksten er zijn geschreven en hoeveel er door de controle kwamen, welke domeinen klaar zijn, en precies waar ik moet klikken om het maatje te zien en te horen.
