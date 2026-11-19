# WIJZIGINGEN-ZINNEN-REKENMIX34 — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok, Vormen, Dagen, Tijd en Rekentaal, nu voor de gouden lessen **Rekenmix 3 heel moeilijk** (`squla-rekenmix-mix3-4-gouden`, "hoeveel zitten er in de doos?") en **Rekenmix 4** (`squla-rekenmix-mix4-1-gouden`, tellen, ook in een druk plaatje en 2 rijen samen). Deze lessen hebben geen extra les.

**Niets is weggegooid.** Alle oude zinnen staan nog in de zinnenbestanden (`ZIN`, `HINT`, `telFout`, `splitsFout`, `SPLITSREACTIE`), en bijna allemaal zijn ze 1 van de varianten. De nieuwe zinnen staan in een eigen deel "18 NOVEMBER 2026" onderaan `squla-rekenmix4-gouden-zinnen.ts` en `squla-rekenmix3-gouden-zinnen.ts`. Wat de les niet meer zegt, staat hieronder en in WEGGEHAALD.md.

**Wie gebruikt deze bestanden:** alleen Rekenmix 3 en 4 zelf en hun fouttabel-scripts (Rekenmix 3 leest een deel uit het bestand van Rekenmix 4). Niet veranderd: `squla-rekenmix-gouden-zinnen.ts` (Rekenmix 1, waar Rekenmix 4 de plekken van de dingen uit leest), `nooit-dubbel.ts`, `squla-klok-gouden-zinnen.ts` (lof, eindzinnen, groet), de Tellen-bestanden, de vlakken en de oude les `squla-rekenmix.tsx`.

**Niet veranderd:** de 15 vragen per les, de dingen, de aantallen, de keuzes, de volgorde, de goede antwoorden en de denkfouten. De vraag zelf ("Hoeveel raketjes zie je?", "Er zijn 6 ballen. Hoeveel zitten er in de doos?") is hetzelfde gebleven (BOUWREGELS 3.11). Alleen de 2e zin bij de eerste vraag van een soort in Rekenmix 4 is anders (zie Deel A).

**Alle varianten op een rij:** FOUTTABEL-squla-rekenmix-mix4-1-gouden.md en FOUTTABEL-squla-rekenmix-mix3-4-gouden.md (§2 t/m §5).

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen en Rekentaal: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 7." en "Je koos 9." tellen als dezelfde zin, net als "Tik op elke bal." en "Tik op elk raketje.", en "in de doos" en "in de zak". De kiezer is de gedeelde kiezer `nooit-dubbel.ts` (niet veranderd).

Harde eisen worden vooraf uit het rijtje gehaald (niet als wens aan de kiezer): elk stuk past in het tekstvak (hooguit 110 tekens en 3 zinnen, ook groet + begin, lof + aantal, eindzin + kaart), in 1 reactie komt geen woord en geen getal 2 keer (behalve kleine woordjes en de woorden van de vraag zelf), en na de hint past altijd nog een vraag.

## Deel A — verbeterde zinnen

| Les | Oud | Nieuw | Waarom |
|---|---|---|---|
| 4 | Hoeveel raketjes zie je? Tel alleen die en tik op het goede getal. (eerste druk plaatje) | Hoeveel raketjes zie je? De sterren en de planeten tellen niet mee. Tik op het goede getal. | "die" was vaag (keuring V2); 1 ding per zin, en het zegt precies wat het kind ziet (15.36) |
| 4 | Hoeveel ballen zie je samen? Tel beide rijen samen en tik op het goede getal. | Hoeveel ballen zie je samen? Tel de bovenste en de onderste rij. Tik dan op het goede getal. | 2 keer "samen" in 1 vraag; 1 ding per zin |
| 4 | (1e fout) Je koos 9. Je zit er dichtbij. + Wijs elk raketje aan en zeg het getal. (en dan niets: de les wachtte) | … + Wijs elk raketje aan en zeg het getal. Hoeveel raketjes zijn het, denk je? / … Hoeveel zijn het er dan? | na de hint stond er geen vraag (F16, 15.37); nu altijd, in andere woorden dan de vraag |
| 4 | 8. (laatste getal bij samen tellen) + 8. Samen telden we 8 raketjes. | En 8! Zoveel raketjes zijn het. / En 8! Nu hebben we ze samen allemaal geteld. / En de laatste is 8. Zoveel raketjes zijn het. | het getal klonk 2 of 3 keer achter elkaar (15.29) |
| 4 | 8. (laatste getal bij natellen) + Zie je? Het zijn er 8. Je had het precies goed. | En 8! Je had het precies goed. / En de laatste is 8. Jij had het goed geteld. / En 8! Zie je? Je zat precies goed. | idem; de oude zin blijft voor als het kind op de pijl tikte (dan zei Bliepo nog geen getal) |
| 4 | Laten we ze samen natellen. | Ik tel de raketjes hardop. Tel maar mee! / Kom, we tellen de raketjes samen na. / Laten we de raketjes samen natellen. | in een druk plaatje: zeggen welke dingen (alleen de raketjes) |
| 3 | 4. In de doos zaten er 4. (einde samen tellen) | En 6! Er zaten 4 ballen in de doos. / En de laatste is 6. In de doos zaten er 4. / En 6! Dus in de doos zaten er 4. | getal 2 keer achter elkaar (keuring K3); bovendien was 4 niet het laatste getal dat geteld werd (dat was 6) |
| 3 | 6. (laatste getal bij nakijken) + Zie je? In de doos zaten er 4. Je had het precies goed. | En 6! In de doos zaten er 4. Je had het precies goed. / En 6! Er zaten 4 ballen verstopt. Jij had het goed. | het laatste getal maar 1 keer; de oude zin blijft na een tik op de pijl |
| 3 | Ja, er zaten er 4 in de doos. | Ja, er zaten 4 ballen in de doos. | "er … er" klinkt stroef |
| 3 | Dat past: er zaten er 4 in de doos. | Dat klopt: er zaten 4 ballen verstopt. | "past" is geen juf-woord hier |
| 3 | 4 ballen zaten er verstopt. | Er zaten 4 ballen in de doos. | omgekeerde zin |
| 3 | Nu komen de knikkers uit de zak. / Tik op elke knikker uit de zak. (ook als er maar 1 knikker in zat) | Nu komt de knikker uit de zak. / Tik op de knikker uit de zak. Ik tel verder. | enkelvoud bij 1 (vraag 10 en 11) |
| 3 en 4 | Kom, we tellen ze samen. / We tellen ze samen. / Kom, samen tellen we ze. (om de beurt) | Kom, we tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen samen. / Weet je wat? We kijken samen in de doos. (Rekenmix 4: zoals Tellen, 5 versies) | warmer; "Ik help je even" en "Laten we ze samen tellen en kijken" zijn van Synthesis |
| 3 en 4 | Hint en uitleg: 1 vaste versie per vraag (nr % 3) | alle versies; de les kiest er 1 die past bij wat Bliepo net zei | variatie, en geen woord 2 keer in 1 reactie |
| 3 en 4 | 1 vaste eerste zin per fout antwoord | 5 tot 7 versies per fout antwoord | variatie (zie Deel B) |

## Deel B — zinnen die bleven en varianten erbij kregen

| Les | Was | Nu erbij | Waarom |
|---|---|---|---|
| 4 | Je koos 9. Je zit er dichtbij. (zonder richting) | Bijna! 9 is het net niet. / 9? Dat is heel dichtbij. / Je tikte op 9. Het scheelt maar een klein beetje. | variatie (6); "bijna" en "dichtbij" alleen als het hooguit 2 scheelt, en nooit 2 keer bij 1 vraag |
| 4 | Je koos 5. Je hebt ze nog niet allemaal geteld. | 5? Ik zie er nog meer. / Bijna! 5 is nog iets te weinig. / 5 knopen? Je hebt ze nog niet allemaal geteld. | variatie (6) |
| 4 | Je koos 7. Dat is te veel. | 7? Dat zijn er iets te veel. / Bijna! 7 is iets te veel. / 7 knopen? Ik denk dat je er te veel hebt geteld. (Synthesis) / Je tikte op 7. Zo veel zijn er niet. | variatie (7) |
| 4 | 3 is maar een deel. (2 rijen samen) | 3? Dat zijn ze nog niet allemaal. / Je koos 3. Zoveel zie je alleen bovenaan. | variatie (3) |
| 4 | 3 hints per soort beeld | erbij: Probeer het nog eens. Tel elke knoop mee, ook de laatste. / Probeer het nog eens. Tel geen bal 2 keer. / Kijk goed: alleen de raketjes tellen mee. / Tel ook de onderste rij mee. / Probeer het nog eens. Tel hardop en wijs elke ster aan. | variatie (4 per soort) |
| 4 | Er mist nog 1 knoop. / Er is 1 bal 2 keer geteld. | Er hoort nog 1 knoop bij. / Je hebt 1 knoop overgeslagen. / Dan krijgt 1 bal 2 nummers. / Dan telt 1 bal 2 keer mee. / (druk plaatje) Alleen de raketjes tellen mee. / De andere dingen tellen niet mee. | variatie (3 tot 6) |
| 4 | Je telde er weer te weinig. | Weer iets te weinig, zie ik. / Je hebt er weer te weinig geteld. + We geven elke knoop een nummer. Zo vergeten we er geen. | variatie |
| 4 | Zin met het aantal na de lof (5) | erbij: 8 raketjes, precies! / Precies, 8 raketjes. / Dat klopt, er zijn 8 raketjes. | variatie (8), zoals Tellen; "Precies" is van Synthesis |
| 3 | 5 ballen liggen er buiten de doos. / Die 3 zie je al. | 3? Die liggen buiten de doos. / Je tikte op 3. Die zie je al buiten de doos. | variatie (5) |
| 3 | 6 is het totaal. / Je koos 6. Dat zijn ze allemaal. | 6? Dat zijn alle ballen samen. / Je tikte op 6. Zoveel zijn het er samen. | variatie (5) |
| 3 | Met 5 in de doos zijn er 7 ballen. | 5? Dan heb je er samen 7. / Je tikte op 5. Met de ballen buiten erbij is dat 7. | variatie (5); de som klopt altijd (het script rekent hem na) |
| 3 | Zoek wat er in de doos zit. / Het gaat om wat je niet ziet. | Kijk naar het vraagteken. Dat deel zoeken we. / Kijk ook naar de ballen buiten de doos. / Buiten liggen er 2. Tel door tot 6. | variatie (4 per denkfout); het vraagteken staat echt in beeld (splitsbeen) |
| 3 | Dan zijn het er meer dan 6. | Dan kom je boven de 6 uit. / Er zijn maar 6 ballen. / (te weinig) Er zijn wel 6 ballen. / Er zit nog meer verstopt. | variatie (4) |
| 3 | Hoeveel zitten er in de doos? (na de hint, logica-controle) | blijft, en erbij: Hoeveel zitten er dan in de doos? / Hoeveel ballen zijn er verstopt, denk je? | variatie; de oude vraag blijft 1 van de versies |
| 3 | Buiten de doos liggen er 2 ballen. / Nu komen de ballen uit de doos. / Tik op elke bal uit de doos. Ik tel verder. | Kijk, buiten de doos liggen 2 ballen. / De doos gaat open. Daar zijn ze! / Tik op de nieuwe ballen. Ik tel verder. | variatie; Bliepo zegt bij samen tellen geen stuk van 3 woorden 2 keer ("uit de doos") |
| 3 | Zin na de lof (5) | erbij: Precies, 2 buiten en 4 in de doos. / Precies, zoveel zaten er verstopt. / Dat klopt: zoveel ballen zaten er in de doos. | variatie (8); 2 zonder getal, voor na "Al 3 goed achter elkaar!" als er 3 in de doos zaten |
| 3 en 4 | Je koos weer 5. | Je tikte weer op 5. / Weer 5, zie ik. | variatie (3) |
| 3 en 4 | Je bent goed bezig. / Jij kunt dit. (hulphandje) | Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (5), zoals Tellen |
| 3 en 4 | begin, slot, kaart: 1 zin | 3 versies elk, bijvoorbeeld: Vandaag tellen we allerlei dingen in de ruimte. / Knap, hoor! Je hebt helemaal tot 12 geteld. / Wat goed gezocht! Niets bleef verstopt voor jou. / Kijk, een kaart voor jou! Tik erop. | variatie |

## Aantal varianten per situatie

| Situatie | Rekenmix 4 | Rekenmix 3 |
|---|---|---|
| Eerste zin na een keuze die niet goed is | 3 tot 7 per fout antwoord | 5 per fout antwoord |
| Hint | 3 of 4 | 4 |
| Na de hint: de vraag in andere woorden | 3 (niet als de hint al een vraag is) | 3 |
| Uitleg bij de 2e keer | 3 tot 6 | 3 of 4 |
| "Je koos weer …" / "weer …" + uitleg | 3 / 2 tot 3 + 2 | 3 / 2 + 2 |
| Samen tellen: begin, opdracht, hulphandje, klaar, vangnet | 5, 3, 3 + 5, 3, 2 | 4, 2 of 3, 3 + 5, 3, 2 (plus: wat buiten ligt 2, de doos gaat open 3) |
| Nakijken bij vraag 1 | 3 + 3 (+ 3 na een tik op de pijl) | 3 + 2 (+ 2) |
| Zin na de lof | 8 | 8 |
| Begin, slot, kaart | 3 elk | 3 elk |
| Lof, korte bevestiging, eindzin, overgang | het vaste rijtje uit BLIEPO-KARAKTER.md (niet aangeraakt) | idem |

## De fouttabel is strenger gemaakt (zoals bij Tellen en Rekentaal)

De scripts `scripts/fouttabel-rekenmix4-gouden.ts` en `scripts/fouttabel-rekenmix3-gouden.ts` keuren nu ALLE varianten (Rekenmix 4: 678 varianten, Rekenmix 3: 599):

- **Waar:** "bijna"/"dichtbij" alleen bij hooguit 2 verschil, "te veel"/"te weinig" in de goede richting, "rij voor rij" alleen bij rijen, "alleen de …" alleen in een druk plaatje, "bovenaan" alleen als het de bovenste rij is; bij Rekenmix 3 klopt de som ("Met 5 in de doos zijn er 7") en "buiten"/"totaal" alleen bij dat getal.
- **Verklappen (15.17):** Rekenmix 4: bij elke combinatie eerste zin + hint (761) blijven er 2 keuzes over en het goede antwoord valt nooit weg; zonder richting geen richtingwoord. Rekenmix 3: geen variant noemt het goede getal.
- **Niets dubbel (15.29):** achter elke eerste zin passen minstens 2 hints en 2 uitleggen zonder woord of getal 2 keer; varianten in 1 rijtje zijn nooit dezelfde zin; samen tellen noemt het laatste getal maar 1 keer.
- **Altijd een vraag (15.37, F16):** na elke hint past een vraag; nooit precies de vraag van de 1e keer; geen "vinkje".
- **Alles past in het tekstvak**, ook samen met de groet, de lof en de eindzin.
- **Nooit 2 keer hetzelfde:** de kiezer wordt per les 20.000 keer nagespeeld (ruim 230.000 reacties) met dezelfde functies als de les (`foutReactie4`/`foutReactie3`, `opnieuw4`/`opnieuw3`): 0 keer dezelfde zin achter elkaar, 0 keer een woord 2 keer, 0 keer bij de 2e keer een zin van de 1e, altijd een vraag na de hint, 0 keer te lang.

## Zinnen van Synthesis, in het Nederlands (besluit Sara, 17 november 2026)

Rekenmix 4 is tellen, net als Color Count van Synthesis; dezelfde zinnen als bij de gouden les Tellen. Rekenmix 3 ("wat zit er in de doos") heeft geen Synthesis-les; daar alleen de algemene zinnen.

| Synthesis zegt | Bij ons nu | Waar |
|---|---|---|
| … I think you counted too many | 7 knopen? Ik denk dat je er te veel hebt geteld. | Rekenmix 4, eerste zin te veel |
| try again | Probeer het nog eens. … | Rekenmix 4, hints |
| let's count them together and see | Laten we ze samen tellen en kijken. | Rekenmix 4, samen tellen |
| there you go | Kijk, daar heb je het: 8. | Rekenmix 4, nakijken |
| exactly | Precies, 8 raketjes. / Precies, 2 buiten en 4 in de doos. | zin na de lof |
| let me help you | Ik help je even. We tellen ze samen. | samen tellen |

## Niet gedaan, met reden

- **De vraagzin zelf afwisselen** ("Hoeveel raketjes zie je?", "Hoeveel zitten er in de doos?"): niet gedaan (BOUWREGELS 3.11; inhoud van Squla blijft, 15.22). Na de hint komt de vraag wel in andere woorden terug.
- **"linksboven"** in de oude hints van Rekenmix 4 (bij Tellen en Rekenmix 1 vervangen door "bovenaan"): blijft, want weghalen moet Sara beslissen (vraag in KEUZES-REKENMIX34.md).
- **De vaste rijtjes** (lof, bevestiging, eindzinnen, groet, overgang): niet aangeraakt (`squla-klok-gouden-zinnen.ts`, alle gouden lessen).
- **De oude les `squla-rekenmix.tsx`, het vlak en de plaatjes:** niet aangeraakt.
- **Stem:** niets gemaakt (schatting in KEUZES-REKENMIX34.md).

## Keuring 19 november 2026

| Les | Oud | Nieuw | Waarom |
|---|---|---|---|
| 4 | Hoeveel satellieten zie je? De planeten en de sterren tellen niet mee. (en alle zinnen bij vraag 11: "satelliet", "elke satelliet") | Hoeveel ruimteschepen zie je? De planeten en de sterren tellen niet mee. ("ruimteschip", "elk ruimteschip") | "satelliet" is te moeilijk voor groep 3; "ruimteschip" past bij het plaatje (een groen ruimteding met blauwe panelen) en heet overal hetzelfde, in tekst en zin. Plaatje, kleur, aantal en vraag-id blijven. |
| 4 | Welke raketje heeft nog geen nummer? Tik erop. | Welk raketje heeft nog geen nummer? Tik erop. | bij een het-woord hoort "Welk" (gold ook voor "ruimteschip"); bij de-woorden blijft "Welke" |
| 3 | (tekening) het totaal in het splitsbeen wit, in de zin rood | het totaal ook in de tekening in de kleur van de ballen | kleurregel 2.1/2.2: zin en tekening gelijk. Geen zin veranderd. |
