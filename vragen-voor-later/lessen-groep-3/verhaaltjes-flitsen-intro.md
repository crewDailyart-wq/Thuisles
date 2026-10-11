# Vragen: verhaaltjessommen, flitskaarten en "Zo werkt het"

Kort per punt: de les, de vraag, en wat er nu gekozen is.

## Getting Started

- **Customizing the Tutor (niet gebouwd).** Synthesis heeft een les waarin het
  kind de stem, het tempo, het oplichten van woorden, de naam en het
  lettertype (ook OpenDyslexic) instelt, met een gevoelsvraag aan het eind
  (vijf gezichtjes). Zulke instellingen bestaan nog niet in Thuisles en het
  lesscherm kan ze niet bewaren. Vraag: wil je zo'n les, en welke
  instellingen moeten er dan komen (stem van de mascotte, voorleestempo,
  dyslexielettertype)? Waar worden ze bewaard (bij het kindprofiel)?
- **Zo werkt het: wat ontbreekt.** Uit Synthesis niet overgenomen: "snel of
  langzaam?", "keuzes voorlezen?", "microfoon?" (die veranderen bij ons
  niets), kiezen met de pijltjestoetsen (kan het lesscherm niet) en de
  hulpknop met het handje en de hamer (er is geen hulpknop in het
  lesscherm). Vraag: wil je een hulpknop in het lesscherm? Dan kan die in deze
  les uitgelegd worden.

## Verhaaltjessommen (Word Problems)

- **Hoofdletters.** Synthesis schrijft het verhaal in krijtletters met kleine
  hoofdletters. Groep 3 leert eerst kleine letters lezen, dus nu staat het in
  een gewone handschriftletter (Patrick Hand) met kleine letters. Akkoord?
- **De naam van het kind in het verhaal.** Zoals Synthesis: "Sara doet er 9
  uit." Zonder naam staat er "Jij doet er 9 uit." Akkoord?
- **Munten → knikkers.** Synthesis gebruikt neppe gouden munten. Geld mag bij
  ons alleen met de officiële afbeeldingen, en die passen niet in een
  verhaaltje waarin je munten wegtikt. Nu zijn het knikkers (met een
  stippelrondje als lege plek). Wil je liever echte euromunten?
- **Plaatjes 5 op een rij.** Volgens de ontwerpregels hoogstens 5 op een rij
  (Synthesis: 10). Na elke 10 staat er wat extra ruimte. Bij 20 lampjes zijn
  het dus vier rijen.
- **Woorden aantikken.** Kinderen tikken in het verhaal op de getallen, de
  vraagzin en de woorden die zeggen of het erbij of eraf is. Groep 3 kan
  getallen en het vraagteken herkennen, maar woorden niet. Daarom: na twee
  keer mis (of "Weet ik niet") kleurt het bord het zelf. Vraag: wil je de
  woordenstap voor groep 3 houden, of overslaan?
- **"Weet ik niet" bij het tikken.** Tijdens het tikken in het verhaal staat
  "Weet ik niet" links op de plek van de knoppen (het lesscherm heeft daar
  geen eigen knop voor). Na het zelf maken van een verhaal (ballonnen
  knappen, bloemen planten) tikt het kind op het blauwe vinkje links om te
  laten weten dat het klaar is.
- **Antwoorden.** Waar Synthesis een 1–9-raster had: een invulvak. Waar
  Synthesis vier of zes antwoordtegels had (toetsen, Bigger Problems): ook
  hier tegels om uit te kiezen.
- **Kleine verhaaltjes, "Nee" bij "hulp nodig?".** Niet beschreven in de
  aantekeningen. Nu: het kind probeert het antwoord meteen; goed → alleen nog
  naspelen; niet goed → toch samen uitpluizen.
- **Erbij: welk getal eerst.** Bij een plussom accepteert de les het andere
  getal eerst ook ("Dat mag ook, maar we volgen het verhaal") en zet dan het
  begingetal vooraan. Bij Verstopte getallen (Mixed Problems) moet de som wel
  in de volgorde van het verhaal, zoals Synthesis.
- **Instaptoets en eindtoets.** Synthesis vraagt eerst "toets of samen de
  lessen?" en geeft vrijstelling voor de lessen. Dat kan het lesscherm niet;
  nu is het gewoon een korte toets met twee verhalen en een kaart. Bij een
  fout: één keer opnieuw, daarna het antwoord, zonder lange uitleg.
- **Titels.** Kleine verhaaltjes (Small Problems), Grotere verhaaltjes
  (Bigger Problems), Verstopte getallen (Mixed Problems). Goed zo?

## Flitskaarten (Flashcards 1)

- **Tijdgrens.** De haas doet er 60 seconden over voor 10 kaarten (ongeveer
  6 seconden per kaart). Na elke verloren race wordt hij 10 seconden
  langzamer, tot hoogstens 90 seconden. Synthesis is veel sneller (8 à 10
  seconden), maar daar tik je op een knop en hier typ je. Is 60 goed, of
  liever milder/strenger?
- **Klok alleen bij de race.** Bij het oefenen loopt er geen klok (Synthesis
  wel). Akkoord?
- **Beste tijd.** De beste tijd wordt alleen in de browser bewaard (per les en
  per naam), niet in de database. Instaptoets en eindtoets delen één beste
  tijd, zoals bij Synthesis. Wil je de tijd in de voortgang van het kind
  zien? Dan moet er iets in de database komen, en dat beslis jij.
- **Typen in plaats van kiezen.** Synthesis heeft vier antwoordknoppen; hier
  typt het kind (zoals gevraagd). Bij een fout schudt de kaart en mag het nog
  een keer; na twee keer of "Weet ik niet" staat het antwoord even op de
  kaart. Het bolletje wordt dan rood.
- **Afgerond en beheerst.** Bij Synthesis is een les "afgerond" na oefenen en
  "beheerst" na het winnen van de race. Het lesscherm kent alleen de kaart;
  nu krijgt het kind de kaart als het op Klaar tikt, ook zonder race.
- **Schildpad en haas.** Eigen tekeningen. Synthesis heeft een schildpad en
  een konijn. Wil je hier later de mascotte in?
- **Uitslagzin bij oefenen.** 8 of meer goed: "Je bent snel genoeg voor de
  race." 5–7: "Blijf oefenen." Minder: "Nog een rondje oefenen helpt."

## Flitskaarten en introductie: tweede bouwronde (10 oktober 2026)

- **Customizing the Tutor is nu gebouwd** als "Jouw instellingen"
  (`intro-instellingen`). Het punt "niet gebouwd" hierboven is daarmee
  achterhaald. Er kan ingesteld worden: woorden oplichten (aan/uit), hoe de
  naam klinkt, gewone of grote letters. Geen stemkeuze, geen tempo en geen
  OpenDyslexic. Wil je OpenDyslexic er later toch bij? Dan moet dat
  lettertype aan het project worden toegevoegd.
- **Waar de keuzes staan.** Alleen op dit apparaat (localStorage, sleutel
  `thuisles-les-voorkeuren`), niet bij het kindprofiel. Oplichten en letters
  gelden voor iedereen op het apparaat; de uitspraak van de naam staat per
  naam. Wil je het liever bij het profiel van het kind? Dan moet er iets in
  de database komen, en dat beslis jij.
- **Naam laten klinken.** Klopt de naam niet, dan krijgt het kind een paar
  schrijfwijzen om te beluisteren (Sara, Saara, Sarra, Sa-ra …) en is er een
  tekstvak "voor een grote mens". Bij korte namen (Noah, Daan) is er soms
  maar één knop en blijft alleen het tekstvak over. Goed zo?
- **Gezichtjes aan het eind.** Het antwoord wordt nergens bewaard; de mascotte
  reageert alleen. Wil je het in de ouderomgeving zien?
- **Zo werkt het: snel of langzaam, keuzes voorlezen.** Die twee vragen
  staan er nu wel in, zoals bij Synthesis, en de keuze wordt bewaard. Het
  lesscherm moet er nog iets mee doen (voorleestempo, keuzes voorlezen); dat
  regelt de hoofdagent. Doet het lesscherm dat niet, dan heeft de vraag
  geen effect. Microfoon: nog steeds niet, er is geen microfoon.
- **Zo werkt het: hulpknop.** De hand met de hamer zit nu ín het vlak van de
  oefening (niet in het lesscherm). De mascotte zegt erbij dat je in de
  lessen hulp vraagt met "Weet ik niet". Wil je een echte hulpknop in het
  lesscherm, dan kan deze uitleg daarop aangepast worden.
- **Flashcards 2 voor groep 3.** De lessen hebben label groep 3/4. Plus en
  min tot 20: zeven kaarten zonder over het tiental (zoals 14 + 4, 19 − 14)
  en drie eroverheen (zoals 4 + 7, 12 − 8), zoals de verdeling in de
  aantekeningen. 10 erbij/eraf: uitkomsten tot en met 99 (past in het vak).
  Wil je voor groep 3 alleen sommen zonder tientalpassering?
- **Toetsen van Flashcards 2.** Synthesis zet de Assessment op groep 4 (10
  erbij/eraf bij grotere getallen = groep 4). Volgens de opdracht nu wel
  gebouwd met alles door elkaar (3 plus, 3 min, 2 dubbelen, 2 keer 10
  erbij/eraf). Titels: "Instaptoets: Flitskaarten tot 20" en "Eindtoets:
  Flitskaarten tot 20". Ze delen één beste tijd.
- **Race begint met Start.** Zoals Play bij Synthesis: eerst op Start tikken,
  dan 3-2-1. Na drie keer oefenen zegt de mascotte "Dat is genoeg geoefend
  voor vandaag" (zoals bij de Mastery Check). Goed zo?

## Verhaaltjessommen, tweede ronde (10 oktober 2026)

- **Toetsen: "Toets of eerste les?" nu wél.** Na "Weet je hoe je zulke sommen oplost? → Ja" mag het kind kiezen. "Eerste les" noemt "Kleine verhaaltjes" en stopt zonder kaart (het lesscherm telt dat wel als gespeeld). Ook de eindtoets begint nu met die vraag. Goed zo?
- **Nieuwe les "Meer verhaaltjes"** (More Word Problems · More Word Problems, groep 3-deel). Synthesis rekent tot 100 met een teller voor tientallen en eenheden; dat is groep 4. Ik heb dezelfde vier verhalen in dezelfde volgorde gebouwd (erbij → eraf met "wil je hulp?" → eraf met "weet je het antwoord?" → koekjes als extra), met getallen tot 20: 12 + 5, 18 − 6, 15 − 7, 20 − 9. In plaats van de teller tikt het kind de plaatjes zelf aan, en de som loopt mee ("18 − 0 = 18" wordt "18 − 6 = 12"). Een vinkje met te weinig ("je hebt er 0 bij gedaan") krijgt een eigen zin, zoals bij Synthesis. Munten zijn knikkers (zie hierboven). Vraag: zijn dit de goede getallen voor groep 3?
- **Koekjes.** Nieuw plaatje op het verhaalbord: een koekje dat kruimels achterlaat als het is opgegeten (zoals Synthesis).
- **Vogels op een draad.** De vogels zitten nu op een getekende draad, zoals op de screenshot.
- **Tip bij de woordenstap.** Doet het kind een tijdje niets bij "tik op de woorden die …", dan komt de tip vanzelf (zoals Synthesis). Bij een verkeerde vraagzin komt nu eerst de pijl en daarna de tip "zoek de zin die eindigt met een vraagteken".
- **Verstopte getallen, verkeerde som.** De gekozen som wordt nu als vraag teruggelezen ("{7} + ? = {12}? Niet helemaal. Zullen we hem samen uit elkaar halen?").
