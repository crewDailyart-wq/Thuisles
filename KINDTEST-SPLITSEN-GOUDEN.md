# KINDTEST — gouden les Splitsen (squla-splits-splitsen1-1-gouden, "Splitsen tot 10")

Gespeeld op 9 november 2026 als Testkind (groep 3), op de laptop (1440 × 900), via
`/voorbeeld/les/squla-splits-splitsen1-1-gouden?naam=Testkind`. Ik ben in gedachten een kind van 6.
Het slepen deed een script in Chrome zonder venster, met een lege profielmap en zonder koekje (1 Chrome tegelijk).
Eerst het testscript `scripts/test-splitsen-gouden.mjs` (snelle stem), daarna een eigen kopie in een tijdelijke map met
een nagebootste stem van ongeveer 0,075 s per letter, zodat ik kon zien wat Bliepo zegt en wanneer.
Ik heb niets aan de les of de database veranderd. Mijn runs schreven **0 regels** in `les_uitkomsten` (voor en na
nagekeken, alleen gelezen).

Gespeeld:
- **(a) Nee-route**: uitleg met bewuste fouten (pion in het verkeerde vak, te veel in het paarse vak, 2× fout bij
  "hoeveel samen?", bij "splits 5 anders" eerst dezelfde manier, dan alles in 1 vak, dan met hulp weer dezelfde
  manier), daarna alle 15 vragen in één keer goed (167 s, tot de kaart).
- **(b) Ja-route, alles fout**: proef met 1 fout en dan 1 pion goed schuiven; daarna bij elke vraag 2 keer fout met
  steeds andere denkfouten, 2 keer hetzelfde antwoord, 7 s stil bij een opdracht en bij samen voordoen (vraag 1–10,
  487 s). De doos (vraag 11–15) apart gespeeld met 2 fouten per vraag (153 s, tot de kaart).
- **(c) heel snel**: slepen tijdens Bliepo's zin, Ja-route, alles goed (85 s, tot de kaart).
- Het gewone testscript (3 situaties) en de sleepmeting.

De les ging in alle runs door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Alle 15 vragen staan erin,
met dezelfde getallen als Squla (5-2, 9-6, 7-3, 6-4, 10-8, zak 7-4, 6-5, 9-6, 8-3, 3 huisjes 5/1 6/4 8/5, doos 7, 9,
4, 5, 3). Het rekenwerk in alle zinnen klopt.

---

## PROBLEMEN

### 1. De stem breekt elke zin zelf af — GROOT
- **Wat zie je:** in mijn nagebootste stem werd **elke** zin na 0,4–1 s afgebroken (63 van 63 zinnen in run a).
  Oorzaak in de code: `src/lib/stem.ts`, `meld(true)` roept in `uiting.onstart` `stopKeuzeStem()` aan, en die doet
  `speechSynthesis.cancel()`. De les wacht op het einde van de zin, dus de les gaat dan meteen door: "Mooi, er ligt er
  1." en 0,4 s later al "Kun je er 2 van maken?".
- **Waarom erg voor een kind van 6:** het kind leest nog niet goed. Het hoort de opdracht, de hint en de uitleg dan
  maar half of niet. Dit is hetzelfde probleem als punt 1 van de kind-test Tellen; het is nog niet opgelost.
- **Let op:** ik kon niet echt luisteren. Sara: graag met geluid aan kijken of je "Er zijn 5 pionnen. Sleep 2 pionnen
  …" helemaal hoort.
- **Voorstel:** in `meld(true)` alleen de keuzestem stoppen, niet de hele `speechSynthesis`. Daarna deze les, Tellen
  en de klokles opnieuw testen. Mijn tempo-metingen zijn door dit probleem te kort; zie "Tempo" onderaan.

### 2. Uitleg na Nee: het kind kan vastlopen zonder hulp — GROOT
- **Wat zie je:** bij "Sleep 1 pion naar het paarse vak." sleepte ik eerst 1 pion naar het oranje vak. Bliepo:
  "Het oranje vak komt zo. Eerst het paarse vak." Na 6 s komt het hulphandje: van het hoopje naar het **paarse** vak.
  Ik volgde het handje: nu ligt er 1 in paars en 1 in oranje. Daarna gebeurt er niets meer: geen zin, het handje wijst
  steeds weer naar het paarse vak, en Bliepo zegt opnieuw "Sleep 1 pion naar het paarse vak." terwijl daar al 1 pion
  ligt (schermfoto a04). De stap gaat pas verder als het kind zelf bedenkt dat het de pion uit het oranje vak terug moet
  tikken. Dat zegt niemand.
- Uit de code (niet gespeeld, wel zeker): hetzelfde gebeurt bij de laatste stap ("Sleep nu de andere pionnen naar het
  oranje vak.") als het kind 1 pion van paars naar oranje schuift (1 en 4): alle pionnen liggen, er komt geen zin en
  geen handje, en de stap gaat nooit verder.
- **Waarom erg:** het kind zit vast en weet niet wat het fout doet; Bliepo zegt iets wat niet klopt met het beeld.
- **Voorstel:** in elke uitlegstap bij elke tussenstand die niet het doel is een passende zin ("Er ligt nog een pion
  in het oranje vak. Sleep hem terug.") en het handje vanuit het vak met te veel naar het hoopje of het goede vak.
  Of: in de uitleg het oranje vak dicht houden tot de stap "Sleep nu de andere pionnen …".

### 3. Proef na Ja: elke schuif wordt meteen nagekeken — GROOT
- **Wat zie je:** vraag 1 (5 pionnen, 2 in paars): ik legde 4 in paars en 1 in oranje. 1e fout, de pionnen blijven
  liggen en Bliepo zegt "Schuif de pionnen goed. In het paarse vak horen 2 pionnen." Ik schuif 1 pion van paars naar
  oranje (4 → 3). Na 0,2 s is het al nagekeken: 2e fout, "Dat is nog lastig. We kijken eerst samen hoe splitsen werkt."
  Ik kreeg geen kans om de 2e pion te schuiven.
- **Waarom erg:** het kind deed precies wat Bliepo vroeg en krijgt toch een fout. Het voelt oneerlijk en de proef
  mislukt bijna altijd als er meer dan 1 pion verkeerd ligt. (Het gewone testscript zag dit niet, omdat het in minder
  dan 0,2 s de volgende pion pakt.)
- **Voorstel:** in de proef na een fout pas nakijken als het kind even niets doet (bijvoorbeeld 1,5 s), of de vakken
  ook in de proef leeg maken en opnieuw laten slepen (zoals buiten de proef).

### 4. Testantwoorden in de voortgang van een echt kind (Fenna) — GROOT (niet in deze les, wel gevonden)
- **Wat zie je:** in `les_uitkomsten` staan 15 regels voor **Fenna**, les `squla-tellen-fruit-1-gouden`, gemaakt op
  9 november om 19:04, alle 15 vragen binnen ongeveer 13 seconden. Dat tempo past bij een testscript, niet bij een kind.
- **Waarom erg:** Fenna's voortgang klopt dan niet (harde regel: testen alleen met Testkind).
- **Voorstel:** Sara vragen of Fenna die les echt gedaan heeft. Zo niet: met haar akkoord die 15 regels (id 93 t/m 107)
  weghalen. Ik heb niets veranderd.

### 5. "Splits 5 op een andere manier": eindeloos dezelfde hulp — MIDDEL
- **Wat zie je:** 2+3 (al gevonden) en 5+0 tellen niet als fout. Na 2 keer zegt Bliepo "Ik help je. Ik leg 1 pion in
  het paarse vak. Sleep de andere naar het oranje vak." Sleept het kind dan toch weer 1 pion extra naar paars (2+3),
  dan komt precies dezelfde hulpzin opnieuw. Dat kan zonder einde (15.11: na 2 keer samen doen en door).
- **Voorstel:** na de hulp de linker pion vastzetten (alleen het oranje vak open), of na de 3e keer Bliepo het zelf
  laten afmaken en door.

### 6. Hetzelfde voorbeeld 2 of 3 keer achter elkaar — MIDDEL
- **Wat zie je:** de uitleg doet 5 = 2 en 3 stap voor stap. Direct daarna is vraag 1 weer 5 pionnen, 2 in paars.
  Na een mislukte proef doet het kind 5 = 2 en 3 zelfs 3 keer (proef, uitleg, vraag 1).
- **Waarom:** saai, en BOUWREGELS 3.23 zegt: herhaal een afgerond uitlegvoorbeeld niet meteen als eerste opgave.
- **Voorstel:** vraag Sara of de uitleg een ander getal mag gebruiken (bijvoorbeeld 4 = 1 en 3, binnen tot 10), of dat
  vraag 1 na de uitleg vervalt. Zelf niets weglaten (15.22).

### 7. Het getal 5 in het dak ligt over een pion — MIDDEL
- **Wat zie je:** bij "Splits 5 nu zelf op een andere manier" staat de witte 5 in het dak precies over de roze pion
  in het hoopje (schermfoto 04-anders). De pion is bijna niet te zien.
- **Voorstel:** het getal in het dak pas tonen als het hoopje leeg is, of het hoopje lager/naast het huisje leggen.

### 8. Het vinkje bij de doos — MIDDEL
- **Wat zie je:** bij vraag 11 verschijnt voor het eerst het vinkje. Bliepo zegt niet wat het is (3.15 staat de eerste
  keer 1 korte uitleg toe). Na 6 s stil licht het vinkje op, ook als er pas **1** bal in het vak ligt (schermfoto c09).
- **Waarom erg:** het kind weet niet dat het op het vinkje moet tikken, en het oplichten lokt een tik uit terwijl het
  nog niet klaar is.
- **Voorstel:** de eerste keer 1 zin: "Klaar? Tik dan op het vinkje." En het vinkje niet laten oplichten zolang het
  kind nog sleept; liever het handje van het hoopje naar het vak.

### 9. Advies dat het kind niet meer kan gebruiken — KLEIN
- Na de 2e fout zegt Bliepo bijvoorbeeld "Leg er eerst 3 in het paarse vak en tel mee." of "Begin bij 5 en tel door tot
  10. Steek bij elk getal een vinger op." en meteen daarna doet Bliepo het zelf ("Kom, we doen het samen."). Het kind
  krijgt geen kans om het advies te volgen. Ook staat er "leg" waar het kind sleept (14.35).
- **Voorstel:** de 2e-fout-zin als uitleg schrijven ("Er horen er 3 in het paarse vak. Kijk, ik laat het zien.") en
  "sleep" gebruiken.

### 10. "Probeer een andere manier." 2 keer achter elkaar — KLEIN
- Na 2+3: "Klopt, maar zo had je hem al: 2 en 3. Probeer een andere manier." en direct daarna weer "Probeer een andere
  manier." **Voorstel:** de 2e zin weglaten als de eerste al zo eindigt.

### 11. Grammatica: "Er horen er 1 in het paarse vak." — KLEIN
- Uit de code (`uitlegTeVeelPaars(1)`), als het kind bij "Sleep 1 pion" er 2 neerlegt. **Voorstel:** "Er hoort er 1 in
  het paarse vak." Ook: "In het paarse vak ligt er 1. Dat zijn er te weinig." en "In het paarse vak liggen er 4."
  klinken stroef; beter "In het paarse vak ligt 1 pion." / "liggen 4 pionnen."

### 12. Beginscherm zonder uitlegdeel — KLEIN
- Bliepo zegt "Hoi Testkind! Fijn dat je er bent." en meteen "Kun jij een getal al in 2 delen splitsen? …". Er is geen
  zin over wat je in deze les gaat doen (zoals bij Tellen: "In deze les tel je fruit."; de oude les had "Splitsen is een
  getal in 2 stukken verdelen."). **Voorstel:** 1 korte zin ervoor, bijvoorbeeld "In deze les verdeel je pionnen over 2
  vakken."

### 13. Twee keer "ja" in 1 lof — KLEIN
- "Even nakijken… ja, goed! Ja, 7 kun je splitsen in 4 en 3." De code kijkt alleen naar het eerste woord van de lofzin.
  **Voorstel:** kijken of "ja" ergens in de lofzin staat, niet alleen vooraan.

### 14. "Klaar met kijken?" na een hint — KLEIN
- In de Ja-route komt de pijl voor het eerst na een fout: "… Kijk dan naar het getal eronder. Klaar met kijken? Tik dan
  op de blauwe pijl." Na een hint is "klaar met kijken" vreemd. **Voorstel:** daar "Tik op de blauwe pijl als je het
  nog eens wilt proberen."

### 15. De zak is bijna niet te zien — KLEIN
- Bij vraag 6–9 is de zak een heel lichte tekening in het oranje vak (schermfoto 13). Bliepo zegt "sleep je in de zak".
  **Voorstel:** de zak duidelijker tekenen, of "naar het oranje vak (de zak)".

### 16. De doek gaat niet helemaal weg bij samen voordoen — KLEIN
- Bliepo zegt "Ik til de doek op", maar de doek schuift half over de bovenste rij ballen en blijft doorzichtig staan
  (schermfoto c11). **Voorstel:** de doek helemaal laten verdwijnen.

### 17. Steeds dezelfde opdrachtzin — KLEIN (saai)
- 9 keer "Er zijn … Sleep … naar het paarse vak. De andere … sleep je …" en 5 keer "In de doos liggen 10
  pingpongballen. Je ziet er … De andere liggen onder de doek. Sleep die ballen naar het vak." Met een echte stem zijn
  dat zinnen van 6–8 s. **Voorstel:** vanaf de 3e keer een kortere vorm ("Nu 7 ballen. 4 naar het paarse vak.").

### 18. Hint bij de doos met 9 ballen bijna het antwoord — KLEIN
- Bij 2 ballen (goed is 1): "2 is dichtbij. In de doos passen er 10. Tel door vanaf 9 tot 10." Van 9 naar 10 is 1 stap;
  dat is bijna het antwoord. **Voorstel:** bij 9 de hint "Tel de lege plekken onder de doek." gebruiken.

### 19. Robotzinnen over nakijken vaak — KLEIN
- In run a: "De eerste is nagekeken: goed!", "Even nakijken… ja, goed!" en "Nagekeken: 4 en 6 maken samen 10." De
  robotreactie zelf komt maar 1 keer, maar de momenten en lofzinnen zeggen het ook. **Voorstel:** "nakijken" hooguit
  2 keer per les in totaal.

### 20. Totaal op de eindkaart geel, in de les wit — KLEIN
- Op de kaart is de 7 in het dak geel; in de les is het totaal steeds wit. **Voorstel:** dezelfde kleur.

### 21. Eerste sleep hapert — KLEIN (al bekend)
- Sleepmeting: eerste keer 41 beelden/s en een hapering van 67 ms (boven de 50 ms van harde regel 7); daarna 57–59
  beelden/s, 33 ms. De dev-server draaide en was aan het "compileren", dus de computer was niet helemaal rustig. Staat al
  in KEUZES-VOOR-SARA.md (gedeeld splitsvlak). Nog eens meten als de computer rustig is.

### 22. Huisjes: voorrekenen laat zien hoeveel er mist — KLEIN (al gevraagd)
- "Bij het huisje met 5: 1 en 3 is samen 4. We zoeken 5." Het kind weet dan dat er 1 bij moet. Dit is Synthesis-gedrag
  en staat al als vraag 6 in KEUZES-VOOR-SARA.md Ronde 21. Alleen genoemd voor de volledigheid.

---

## Per fout antwoord (gespeeld)

| Vraag (goed) | Ik deed | Denkfout | Bliepo zei | Klopt het? |
|---|---|---|---|---|
| uitleg "hoeveel samen?" (5) | 2, dan 3 | deel-voor-totaal 2× | "2 is het deel in het paarse vak. Ik bedoel alle pionnen samen. Tel de pionnen in allebei de vakken." / "Weer 1 van de delen. Tel eerst het paarse vak en tel dan door in het oranje vak." + rondjes om 2 en 3, "Samen zijn dat 5 pionnen." | Ja. "Weer" klopt, andere uitleg. |
| 1. 5, 2 in paars | 4, dan 4 | te-veel 2× | "… liggen er 4. Dat zijn er te veel." + hint / "Weer te veel in het paarse vak. Leg ze er 1 voor 1 in …" → samen | Ja (zie punt 9 over "leg"). |
| 2. 9, 6 | 3, dan 5 | omgedraaid → een-te-weinig | "In het paarse vak liggen er 3." (zegt niet "omgedraaid") / "… 5. Dat is er 1 te weinig. Het getal onder het paarse vak zegt …: 6." | Ja, verklapt het andere deel niet. |
| 3. 7, 3 | 7, dan 7 | alles-in-1-vak 2× | "Alle 7 pionnen liggen in het paarse vak. Er komen 2 delen. …" / "Weer liggen ze allemaal in het paarse vak." | Ja. |
| 4. 6, 4 | 0, dan 2 | alles-ander → omgedraaid | "Alle pionnen liggen in het oranje vak. Het paarse vak is leeg." / "… liggen er 2. Het getal onder het paarse vak hoort bij het paarse vak." | Ja. |
| 5. 10, 8 | 7, dan 6 | een-te-weinig → te-weinig | "… 7. Dat is er 1 te weinig." / "… 6. Dat zijn er te weinig. …: 8." | Ja, geen "weer" (andere denkfout). |
| 6. zak 7, 4 | 5, dan 6 | een-te-veel → te-veel | goed | Ja. |
| 7. zak 6, 5 | 1, dan 6 | omgedraaid → alles-paars | "In het paarse vak ligt er 1." / "Alle 6 ballen liggen in het paarse vak." | Ja. |
| 8. zak 9, 6 | 2, dan 3 | te-weinig → omgedraaid | goed | Ja. |
| 9. zak 8, 3 | 0, dan 0 | alles-ander 2× | "Alle ballen liggen in de zak. Het paarse vak is leeg." / "Weer is het paarse vak leeg." | Ja. |
| 10. 3 huisjes | 3-3-3 | som-klopt-niet | "Bij het huisje met 5: 1 en 3 is samen 4. We zoeken 5." + rondje om dat huisje | Ja (punt 22). |
| 11. doos 7 | 10, dan 7 | totaal-als-deel → zichtbaar-gelegd | "Je legde er 10. Zoveel passen er in de hele doos." / "Je legde er 7. Zoveel ballen zie je al in de doos." | Ja. |
| 12. doos 9 | 2, dan 9 | een-te-veel → zichtbaar-gelegd | "2 is dichtbij." + "Tel door vanaf 9 tot 10." | Ja (punt 18). |
| 13. doos 4 | 4, dan 5 | zichtbaar-gelegd → een-te-weinig | "5 is dichtbij." | Ja. |
| 14. doos 5 | 3, dan 3 | te-weinig 2× | "Weer te weinig. Begin bij 5 en tel door tot 10. Steek bij elk getal een vinger op." | Ja (punt 9). |
| 15. doos 3 | 10, dan 10 | totaal-als-deel 2× | "Weer de hele doos. 3 ballen zie je al. …" | Ja. |

**Verklapt een hint het antwoord (15.17)?** Nergens echt. Bij "omgedraaid" zegt Bliepo alleen wat er ligt; bij 1 ernaast
in de doos alleen "… is dichtbij." Grensgeval: punt 18 en punt 22.

## WAT GOED WAS

- De les loopt altijd door tot de kaart, ook als alles fout is. Nooit menu, nooit stop.
- Rood scherm bij fout, groen bij goed; geen rood op de keuze, geen foutgeluidje.
- Elke 1e zin past bij wat het kind deed; bij een andere denkfout een andere uitleg; "weer" alleen bij dezelfde fout.
- Getallen in kleur: paars (201, 162, 255) bij het paarse vak, oranje (255, 173, 92) bij het oranje vak, het totaal
  wit. Getallen overal als cijfers ("1 voor 1", "Nog 1 keer", "2 delen"). Geen "één".
- Naam precies 2 keer (groet + 1 lof).
- Keuzevraag "hoeveel samen?": 8 s stil = niets, geen handje (goed). Opdracht: handje na ± 6 s met 1 zin
  ("Jij kunt dit. Pak een pion en sleep hem naar een vak.").
- Heel snel: Bliepo zegt niets over snel (zoals het draaiboek).
- Samen voordoen: Bliepo legt het ene deel, het kind sleept de rest, met handje als het stil is. Bij de doos gaat de
  doek open en zie je de ballen eronder.
- Goed na een fout: alleen een korte bevestiging ("Die is goed.", "Ja, nu klopt het.").
- Uitkomsten per vraag (goed in één keer / goed na een fout / samen gedaan) en denkfouten worden goed bijgehouden.

## Tempo

- Door punt 1 is elke zin in mijn runs na ± 0,5 s afgebroken; de gemeten tijden (alles goed: 167 s met uitleg) zijn dus
  te kort. Geschat met een echte stem: opdrachtzin 6–8 s, slepen 5–12 s, lof 3–4 s: ongeveer 20 s per vraag, dus
  5 à 6 minuten voor de 15 vragen plus 2 minuten uitleg. Dat is lang voor een kind van 6, vooral door punt 17.
- Reactie na de laatste pion: ± 0,3 s. Goed.

## Beperkingen

- Geen echte stem gehoord; de stem is nagebootst.
- Telefoon en tablet niet getest (latere fase).
- Punt 2 (laatste stap) en punt 11 komen uit de code, niet uit een run.

---

## Voor LESRECEPT / BLIEPO-KARAKTER (algemene lessen)

1. **Elke stap in een uitleg moet uit elke tussenstand te herstellen zijn.** Ligt er iets op een verkeerde plek, dan
   zegt Bliepo wat er mis ligt en wijst het handje van die plek weg. Het handje wijst nooit naar een plek waar het
   probleem niet zit. Test elke uitlegstap ook met "eerst in het verkeerde vak".
2. **Na "schuif het goed" niet na elke beweging nakijken.** Vanzelf nakijken pas als het kind even stil is (± 1,5 s),
   anders telt een halve verbetering als 2e fout. Test met echte pauzes tussen het slepen (niet sneller dan 0,2 s).
3. **Geen eindeloze lus**: ook bij "telt niet als fout" (al gevonden, 1 vak leeg) na hooguit 2 keer hulp en dan door.
4. **De 2e-fout-zin is uitleg, geen opdracht**: geen "doe eerst X" als Bliepo het daarna zelf voordoet. Altijd
   "sleep" als het kind sleept.
5. **Twee keer "ja" ook midden in een zin controleren** ("Even nakijken… ja, goed! Ja, …").
6. **Een zin niet 2 keer achter elkaar**, ook niet als einde van de ene en begin van de volgende uiting.
7. **Het vinkje de eerste keer in 1 zin uitleggen**, en het niet laten oplichten als het kind nog bezig is.
8. **Geen getal over een ding dat het kind moet pakken.**
9. **Testen met een realistische stem** (± 0,075 s per letter) en met pauzes zoals een kind, niet alleen met de
   versnelde stem: punt 1 en 3 zag het snelle testscript niet.

## Eerdere lessen die dit ook moeten krijgen

- **Tellen (squla-tellen-fruit-1-gouden):** punt 1 (stem breekt af, nog niet opgelost), punt 13 (twee keer "ja" midden
  in de zin: dezelfde `lofZinnen`-regel), punt 9 (2e-fout-zin als opdracht vóór samen tellen), punt 6 (zelfde zin 2×).
  En punt 4: de 15 regels van Fenna bij deze les nakijken.
- **Klokles (squla-klok-gouden):** punt 1 (stem), punt 13 (twee keer "ja"), punt 14 ("Klaar met kijken?" na een
  hint), punt 6 (uitlegvoorbeeld niet meteen als eerste vraag herhalen), en les 1 hierboven (elke uitlegstap herstelbaar).
