# Vragen en keuzes — tientallen (Phaser-lessen, 27 oktober 2026)

Kort per les: wat ik koos, en wat de eigenaar nog mag beslissen.

## Algemeen
- Keuzes met woorden zijn waar het kon cijfervragen of een tik op een kolom
  geworden (groep 3 leest nog niet). Waar het een woord moest blijven (Ja/Nee,
  "In stukjes breken", "Zo een/Groter", "De sterren") leest Bliepo het woord
  voor bij tikken (dat doet het lesscherm al).
- Hulpregels R3: 1× fout = hint en de foute keuze valt weg; 2× fout of
  "weet ik niet" = antwoord + "We komen hier later op terug", en de vraag komt
  aan het eind van de les terug.
- Tekst gaat nu over sterren en lichtbollen (wat in beeld staat), niet meer
  over stippen of groepjes.

## G12 Groepjes van tien
- Begint nu bij 7 sterren (LESSENPLAN: geen leeftijd vragen). Het oude
  "noem een getal onder de 10" is daarmee weg. Terugzetten? (vraag eigenaar)
- "Zag je hoeveel groepjes er nodig waren? Ja/Nee" is een cijfervraag geworden
  ("Hoeveel lichtbollen kropen samen tot de grote bol?").
- Erbij voor 15 opgaven: twee leesvragen (60 en 35) en bouwopdrachten 25 en 82.
- De ongebruikte kaarttekening `KaartGroepje` is uit de code gehaald (de kaart
  toont nu een lichtbol).

## G13 De plek van de tientallen
- "10 cijfers / 9 cijfers" → kiezen tussen 9 en 10; "Ja, de 10 / Nee, 2
  cijfers" → "Hoeveel cijfers heb je dan nodig? 1 of 2"; "Een/Nul/Twee/Tien"
  → cijfers 0, 1, 2, 10.
- Erbij voor 15 opgaven: 14 maken en lezen, één ster eruit en 13 lezen.

## G14 Tiental plus eenheden
- "Wat gebeurt er met de tientallen?" → "Hoeveel tientallen heeft 23?";
  "Veranderden de eenheden?" → "Hoeveel eenheden heeft 23?";
  "Wat veranderde er?" → tik op de kolom die veranderde.

## S2 Splitsen
- Woord "samenvoegen" is "samenstellen" geworden (LESSENPLAN).
- De piano is vervangen door een parelsnoer rijgen (LESSENPLAN "Eigen
  Bliepo"); het snoer gaat dicht als je erop tikt (in plaats van afspelen).
- Start Ja = korte proef (splits 8); vraagteken in de proef = de les vanaf het
  begin. Ook als de proef lukt, volgt de hele les (anders te weinig opgaven).
  Goed zo? (vraag eigenaar)

## O17 / O20 toetsen
- De extra vragen die er al stonden (40 + 7 en splitsen bij O17; splitsen 8 en
  27 + 20 bij O20) zijn gebleven, al noemt LESSENPLAN ze niet. Bij O20 vallen
  76 + ? = 100 en 37 + 8 weg (groep 4).
- 2× fout of "weet ik niet" stopt de toets ("we leren het samen"); daarna samen
  oefenen tot er 15 opgaven zijn. Naar een andere les springen kan het
  draaiboek niet; de les zegt het en het oefenen volgt meteen.
- In de toetsen staat het splitshuis met sterren in plaats van parels
  (Universum).

## O18 Tientallen erbij
- Oefensommen nu tot 50 (groep 3-deel): 24+10, 18+30, 27+20, … in plaats van
  34+10, 28+30. Extra leesvraag 25.

## O19 Aanvullen tot het tiental
- Zonder sterren: bij 1× fout komen de sterren als hulp in beeld (in plaats
  van de keuze "Nog eens / Met stippen" met woorden).

## Opmerking G13 (eind 27 oktober)
- De samensmelting van 10 sterren tot één lichtbol hangt niet meer af van het aantal sterren
  dat op dat moment in het vak staat (`tientallen-holo-plaats.tsx`), zodat hij ook goed gaat
  als de tik net tijdens een animatie komt.
