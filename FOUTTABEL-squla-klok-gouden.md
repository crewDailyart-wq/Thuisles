# FOUTTABEL — gouden klokles (squla-klok-hoelaat-1-gouden, "Hoe laat is het?")

Opnieuw gemaakt op 9 november 2026 (zesde ronde), bijgewerkt op 11 november 2026 (Ronde 30: 2 hints volgens 15.17, uitleg bij de 2e fout zonder opdracht) en op 18 november 2026 (Sara: Bliepo klinkt als een warme juf; elke zin nagelopen, varianten met de gedeelde kiezer "nooit 2 keer hetzelfde"; zie WIJZIGINGEN-ZINNEN-KLOK.md), **uit de code** met `npx tsx scripts/fouttabel-klok-gouden.ts`; pas zinnen dus aan in `src/components/les/lessen/squla-klok-gouden-zinnen.ts` en draai het script opnieuw. De inhoud (vragen, keuzes, tijden) is die van de les squla-klok-hoelaat-1 en blijft gelijk (15.8). Sinds 9 november staan ook de vragen tussendoor en de bonus erin (alleen hele uren; besluit Sara, ronde 14).

**In §2, §3 en §4 staat steeds de eerste variant van een zin. Alle varianten staan in §7.** Het script keurt ELKE variant (verklappen, ook "vlak naast" en "bijna"; geen getal 2 keer vlak achter elkaar; altijd een vraag of opdracht; past in het tekstvak) en speelt de kiezer 20.000 lessen na (485.731 reacties).

Sara mag elke zin aanpassen. In de les krijgt het uur de kleur van de kleine wijzer (oranje) en de 12 bij de grote wijzer de kleur van de grote wijzer (paars) (14.16); hier staan de getallen zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11; de 3e poging is vervangen):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood, vraag en knoppen even weg, Bliepo zegt de eerste zin en de hint uit de tabel, met het beeld uit de tabel; dat gaat vanzelf door (BOUWREGELS 15.27, pijl rechts als snelkoppeling), dan komt de vraag terug (in een variant, nooit precies dezelfde zin). Het kind mag nog 1 keer.
- **2e fout:** Bliepo legt het uit (§4, bij de denkfout van deze keuze) **en doet het samen met het kind voor**: nu pas de oranje ring om het goede antwoord en het antwoord in woorden; alleen de goede knop blijft, het kind tikt hem zelf ("Tik nu zelf op het antwoord."); de les gaat verder. (Oude regel met een 3e poging: vervangen.)
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt dat vriendelijk ("weer") en legt het op een andere manier uit (§4, laatste kolom).
- **Niet duidelijk (`onduidelijk`):** eerste zin uit BLIEPO-KARAKTER.md §10 (wisselt, nooit 2 keer dezelfde achter elkaar); "Probeer het nog 1 keer, met een tip." alleen na de 1e fout (na de 2e is er geen poging meer) en "Ik bedoelde een andere." alleen bij een keuzevraag, niet bij tikken of zetten en een algemene hint. Geen reden verzonnen.
- **"Vlak naast" en "bijna"** zegt Bliepo alleen als er dan nog 2 keuzes vlak naast liggen. Anders zou het woord het antwoord verklappen (15.17); dan zegt hij alleen wat het kind koos ("Je koos 6 uur. Ik lees een andere tijd.").
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst (voorlopig alleen op het apparaat; zie §5).

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk dacht | Voor een ouder later (dashboard, nu niet bouwen) |
|---|---|---|
| `verkeerde-wijzer` | keek naar de grote (lange) wijzer in plaats van de kleine | kijkt vaak naar de verkeerde wijzer |
| `andere-kant` | nam het getal aan de andere kant (tegenover) van de klok, bijvoorbeeld 8 bij 2 | leest de wijzer van de verkeerde kant |
| `spiegelbeeld` | **nieuw (ronde 15):** koos het getal links in plaats van rechts van de klok, of andersom, bijvoorbeeld 10 bij 2 of 2 bij 10. Bij 3 en 9 is dat hetzelfde als `andere-kant`; daar blijft het `andere-kant` | draait links en rechts om bij het lezen van de klok |
| `getal-ernaast` | nam het getal vlak naast het goede | kijkt niet precies waar de wijzer staat |
| `een-te-veel` / `een-te-weinig` | telde 1 te veel of 1 te weinig | telt nog niet precies |
| `plus-min-verwisseld` | deed plus waar min moest, of andersom (bijvoorbeeld 1 uur terug in plaats van vooruit) | haalt plus en min door elkaar |
| `groter-kleiner-verwisseld` | koos het kleinste waar het grootste moest, of andersom | haalt meer en minder door elkaar |
| `verkeerde-richting` | ging tegen de klok in, of nam "ervoor" in plaats van "erna" | weet nog niet welke kant "met de klok mee" is |
| `doortellen-na-12` | telde door zoals op een getallenlijn (13 na 12) | weet nog niet dat de klok na 12 opnieuw begint |
| `boven-onder-verwisseld` | haalde bovenaan en onderaan door elkaar | |
| `wijzers-verwisseld` | haalde de namen of de taak van de wijzers door elkaar | haalt de wijzers door elkaar |
| `uur-minuten-verwisseld` | zag het goede getal, maar zei minuten in plaats van uur | |
| `geen-heel-uur` | lette niet op de grote wijzer bij "is het een heel uur?" | |
| `beeld-van-net` | noemde wat er net nog op het scherm stond | |
| `onduidelijk` | niet duidelijk: **geen reden verzonnen** | |

Bij `onduidelijk` zegt Bliepo een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.

---

## 2. Het oefenblok: de 13 klokken ("Hoe laat is het?")

Bij elke klok staat de grote wijzer op de 12 en de kleine wijzer op het uur. Een kind dat de wijzer op de 2 ziet en 10 kiest (of andersom), krijgt nu `spiegelbeeld` en niet meer `onduidelijk`.

| Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|
| klok 1 (1 uur) | 9 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 1 (1 uur) | 8 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 2 (12 uur) | 10 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Hier staat de kleine wijzer op hetzelfde getal als de grote. | de kleine wijzer licht op, de grote wordt vaag |
| klok 2 (12 uur) | 11 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je zat er vlak naast. | Hier staat de kleine wijzer op hetzelfde getal als de grote. | de kleine wijzer licht op, de grote wordt vaag |
| klok 3 (1 uur) | 2 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 2 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 3 (1 uur) | 12 uur | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| klok 4 (4 uur) | 6 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 4 (4 uur) | 5 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je zat er vlak naast. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 5 (11 uur) | 7 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 5 (11 uur) | 8 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 6 (7 uur) | 11 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 6 (7 uur) | 6 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 6 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 7 (8 uur) | 9 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 9 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 7 (8 uur) | 1 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| klok 8 (9 uur) | 3 uur | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| klok 8 (9 uur) | 10 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 10 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 9 (10 uur) | 2 uur | `spiegelbeeld` — koos het spiegelbeeld: het getal links in plaats van rechts van de klok, of andersom | Je koos het getal rechts, maar de wijzer wijst naar links. | Kijk of de punt van de kleine wijzer links of rechts staat, en neem het getal precies daar. | de kleine wijzer licht op, de grote wordt vaag |
| klok 9 (10 uur) | 11 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 11 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 10 (2 uur) | 10 uur | `spiegelbeeld` — koos het spiegelbeeld: het getal links in plaats van rechts van de klok, of andersom | Je koos het getal links, maar de wijzer wijst naar rechts. | Kijk of de punt van de kleine wijzer links of rechts staat, en neem het getal precies daar. | de kleine wijzer licht op, de grote wordt vaag |
| klok 10 (2 uur) | 1 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 1 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 11 (3 uur) | 9 uur | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| klok 11 (3 uur) | 4 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 4 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 12 (5 uur) | 4 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 4 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 12 (5 uur) | 11 uur | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| klok 13 (6 uur) | 5 uur | `getal-ernaast` — nam het getal vlak naast het goede | Je koos 5 uur. Ik lees een andere tijd. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. | de kleine wijzer licht op, de grote wordt vaag |
| klok 13 (6 uur) | 12 uur | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |

**Samen voordoen na de 2e fout bij een klok:** "Kijk, de kleine wijzer wijst naar de {uur}, in het oranje rondje. De grote wijzer staat op de 12. Dus het is {uur} uur." (of een andere variant, §7). Oranje ring om het uur. Dan: "Tik nu zelf op het antwoord." (het uur wordt niet nog een keer genoemd).
Bij klok 2 (12 uur) staan beide wijzers op de 12; daar is de hint: "Hier staat de kleine wijzer op hetzelfde getal als de grote. / De kleine en de grote wijzer wijzen hier naar hetzelfde getal."

## 2b. Vragen tussendoor en de bonus (draaiboek stap 19 en 20; aan sinds 9 november 2026, alleen hele uren)

| Stap en vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
| oefenblok, tussendoor (stap 19): na de eerste klok: "Welke wijzer liet het uur zien?" (de kleine wijzer) | de grote wijzer | `wijzers-verwisseld` — dacht dat de grote wijzer het uur laat zien | De grote wijzer staat bij de {12:paars}. | Het uur lees je bij de andere wijzer, die nu oplicht. | de kleine wijzer licht op, de grote wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 1 uur): "Waar wijst de grote wijzer?" (12) | 1 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {1:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 2 uur): "Waar wijst de grote wijzer?" (12) | 2 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {2:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 3 uur): "Waar wijst de grote wijzer?" (12) | 3 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {3:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 4 uur): "Waar wijst de grote wijzer?" (12) | 4 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {4:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 5 uur): "Waar wijst de grote wijzer?" (12) | 5 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {5:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 6 uur): "Waar wijst de grote wijzer?" (12) | 6 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {6:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 7 uur): "Waar wijst de grote wijzer?" (12) | 7 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {7:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 8 uur): "Waar wijst de grote wijzer?" (12) | 8 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {8:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 9 uur): "Waar wijst de grote wijzer?" (12) | 9 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {9:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 10 uur): "Waar wijst de grote wijzer?" (12) | 10 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {10:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van 11 uur): "Waar wijst de grote wijzer?" (12) | 11 | `verkeerde-wijzer` — keek naar de kleine wijzer, die bij het uur staat | Bij de {11:oranje} staat de kleine wijzer. | Kijk naar de grote wijzer die oplicht. | de grote wijzer licht op, de kleine wordt vaag |
| oefenblok, bonus (stap 20): alleen als alles in 1 keer goed ging: "Je had ze allemaal meteen goed! Hier is nog een toetje. Het is nu {12:oranje} uur. Hoe laat is het over 1 uur?" (1 uur) | 11 uur | `plus-min-verwisseld` — ging 1 uur terug in plaats van 1 uur vooruit | Je ging terug in de tijd. | We zoeken een tijd die later is. Ga verder, de kant op van de blauwe pijl. | blauwe pijl die eindigt op de 12 (van de 11 naar de 12, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint |
| oefenblok, bonus (stap 20): alleen als alles in 1 keer goed ging: "Je had ze allemaal meteen goed! Hier is nog een toetje. Het is nu {12:oranje} uur. Hoe laat is het over 1 uur?" (1 uur) | 12 uur | `een-te-weinig` — bleef bij de tijd van nu, 1 uur te weinig verder | Dat is de tijd van nu. | Straks is het later dan nu. Begin bij de 12 en ga met de klok mee. | niets extra |

## 3. De uitleg (route na "Nee" of na een mislukte proef)

| Stap en vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
| uitleg, stap 4 (de klok is een getallenlijn geworden): "Weet jij hoe dit heet?" (een getallenlijn) | een klok | `beeld-van-net` — noemde wat er net nog op het scherm stond (de klok) | Net was het nog een klok, ja. | Nu staan de getallen op een rij. | de getallenlijn blijft recht in beeld |
| uitleg, stap 6 (de lijn is weer rond): "Kijk, de getallenlijn is weer rond. Hoe heet dit nu?" (een klok) | een getallenlijn | `beeld-van-net` — noemde wat er net nog op het scherm stond (de getallenlijn) | Net was het een getallenlijn, ja. | Kijk: nu staan de getallen in een rondje. | de klok blijft in beeld, getallen in een rondje |
| uitleg, stap 7 (het hoogste punt): "Kijk naar het hoogste punt van de klok. Welk getal staat daar?" (12) | 1 | `getal-ernaast` — nam een getal dat hoog staat, maar net naast de top | De 1 staat hoog, maar nog niet op het hoogste punt. | Ga langs de rand omhoog. | niets extra |
| uitleg, stap 7 (het hoogste punt): "Kijk naar het hoogste punt van de klok. Welk getal staat daar?" (12) | 6 | `boven-onder-verwisseld` — haalde bovenaan en onderaan door elkaar | De 6 staat juist helemaal onderaan. | Ga langs de rand helemaal omhoog. | niets extra |
| uitleg, stap 8 (het laagste punt): "Volg de klok helemaal rond. Welk getal staat onderaan?" (6) | 3 | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Ga langs de rand helemaal omlaag. | niets extra |
| uitleg, stap 8 (het laagste punt): "Volg de klok helemaal rond. Welk getal staat onderaan?" (6) | 12 | `boven-onder-verwisseld` — haalde bovenaan en onderaan door elkaar | De 12 staat juist bovenaan. | Ga langs de rand helemaal omlaag. | niets extra |
| uitleg, stap 9 (wat komt na de 6?): "Kijk naar de 6. Welk getal komt erna?" (7) | 5 | `verkeerde-richting` — nam het getal ervoor in plaats van erna | De 5 komt vóór de 6. | Erna betekent: deze kant op. Ga verder, de kant op van de blauwe pijl. | blauwe pijl die eindigt op de 6 (van de 5 naar de 6, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint |
| uitleg, stap 9 (wat komt na de 6?): "Kijk naar de 6. Welk getal komt erna?" (7) | 8 | `een-te-veel` — telde 1 te veel (2 getallen verder) | Je ging 2 getallen verder. | Erna is het getal dat er meteen achter staat. | niets extra |
| uitleg, stap 10 (wat komt na de 12?): "Nu een lastige. Welk getal komt na de 12?" (1) | 11 | `verkeerde-richting` — nam het getal ervoor in plaats van erna | De 11 komt vóór de 12. | We zoeken het getal erna. Ga verder, de kant op van de blauwe pijl. | blauwe pijl die eindigt op de 12 (van de 11 naar de 12, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint |
| uitleg, stap 10 (wat komt na de 12?): "Nu een lastige. Welk getal komt na de 12?" (1) | 13 | `doortellen-na-12` — telde door zoals op een getallenlijn (13 na 12) | Op een getallenlijn komt de 13 na de 12, dat snap ik. | Maar zo'n groot getal staat niet op de klok. Ga verder, de kant op van de blauwe pijl. | blauwe pijl die eindigt op de 12 (van de 11 naar de 12, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint |
| uitleg, stap 11 (wat telt de grote wijzer?): "De ene wijzer telt de minuten. De andere wijst het uur aan. Wat telt de grote wijzer?" (de minuten) | de uren | `wijzers-verwisseld` — dacht: een uur duurt lang, dus de grote wijzer telt de uren | Dat klinkt logisch: een uur duurt lang. | Kijk hoe snel de grote wijzer straks draait. | de grote wijzer licht op, de kleine wordt vaag |
| uitleg, stap 12 (hoe heet de wijzer die de minuten telt?): "Deze paarse wijzer telt de minuten. Hoe heet hij?" (de grote wijzer) | de kleine wijzer | `wijzers-verwisseld` — haalde de namen van de wijzers door elkaar | De kleine wijzer is de korte. | Deze wijzer is lang. | de grote wijzer licht op, de kleine wordt vaag |
| uitleg, stap 12 (hoe heet de korte wijzer?): "En deze korte oranje wijzer? Hoe heet die?" (de kleine wijzer) | de grote wijzer | `wijzers-verwisseld` — haalde de namen van de wijzers door elkaar | De grote wijzer is de lange. | Deze wijzer is kort. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 3): "Naar welk getal wijst de kleine wijzer?" (3) | 9 | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 3): "Naar welk getal wijst de kleine wijzer?" (3) | 12 | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 7): "Hij draait weer. Waar wijst hij nu naar?" (7) | 1 | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 7): "Hij draait weer. Waar wijst hij nu naar?" (7) | 12 | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 11): "Nog 1 keer. Naar welk getal wijst hij nu?" (11) | 5 | `andere-kant` — nam het getal aan de andere kant van de klok | Je keek naar de andere kant van de klok. | Kijk waar de punt van de kleine wijzer is. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 13 (de kleine wijzer draait naar de 11): "Nog 1 keer. Naar welk getal wijst hij nu?" (11) | 12 | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 15 (waar stond de grote wijzer steeds?): "Waar stond de grote wijzer elke keer?" (12) | 6 | `verkeerde-wijzer` — keek naar de kleine wijzer, die nu bij de 6 staat | Bij de {6:oranje} staat nu de kleine wijzer. | Let goed op de grote wijzer. | de grote wijzer licht op, de kleine wordt vaag |
| uitleg, stap 16 (klok op 3 uur; vraag uit de oude les): "Naar welk getal wijst de kleine wijzer?" (3) | 6 | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Volg de kleine wijzer vanaf het midden tot aan de punt. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 16 (klok op 3 uur; vraag uit de oude les): "Naar welk getal wijst de kleine wijzer?" (3) | 12 | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 16 (klok op 3 uur; vraag uit de oude les): "Hoe laat is het dus?" (3 uur) | 12 uur | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 16 (klok op 3 uur; vraag uit de oude les): "Hoe laat is het dus?" (3 uur) | 6 uur | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 17 (klok op 6 uur): "Hoe laat is het nu?" (6 uur) | 12 uur | `verkeerde-wijzer` — keek naar de grote (lange) wijzer in plaats van de kleine | Je keek naar de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 17 (klok op 6 uur): "Hoe laat is het nu?" (6 uur) | 6 minuten | `uur-minuten-verwisseld` — zag de 6 goed, maar zei minuten in plaats van uur | Je vond het juiste getal, dat zag je goed. | Welke wijzer wijst ernaar? Die vertelt het uur. | de kleine wijzer licht op, de grote wordt vaag |
| uitleg, stap 18 (half 8: is het 7 uur?): "Let op, deze is lastig. Is het nu {7:oranje} uur?" (Nee) | Ja | `geen-heel-uur` — keek alleen naar de kleine wijzer bij de 7, niet naar de grote | Je keek naar de kleine wijzer bij de {7:oranje}. | Kijk ook naar de grote wijzer. Bij een heel uur wijst die recht omhoog. | de grote wijzer licht op, de kleine wordt vaag |
| stap 14: "Zet de kleine wijzer op de 2." | 3 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {2:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 2." | 1 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {2:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 2." | 8 (andere kant) | `andere-kant` — zette de punt aan de andere kant van de klok | De punt staat nu aan de andere kant. | Draai de punt naar de {2:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 2." | 10 (spiegelbeeld) | `spiegelbeeld` — zette de punt op het spiegelbeeld: links in plaats van rechts van de klok, of andersom | Je zette de punt links, maar de {2:oranje} staat rechts. | Draai de punt naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 2." | 12 (de 12) | `verkeerde-wijzer` — zette de kleine wijzer waar de grote hoort (bij de 12) | Bij de {12:paars} hoort de grote wijzer. | Zet de kleine wijzer bij de {2:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 2." | 5 (een ander getal) | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar het oranje rondje. Draai de punt daarheen. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 3." | 4 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {3:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 3." | 2 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {3:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 3." | 9 (andere kant) | `andere-kant` — zette de punt aan de andere kant van de klok | De punt staat nu aan de andere kant. | Draai de punt naar de {3:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 3." | 12 (de 12) | `verkeerde-wijzer` — zette de kleine wijzer waar de grote hoort (bij de 12) | Bij de {12:paars} hoort de grote wijzer. | Zet de kleine wijzer bij de {3:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 3." | 5 (een ander getal) | `onduidelijk` — niet duidelijk (geen reden verzonnen) | (zin uit BLIEPO-KARAKTER.md §10, bijvoorbeeld "Ik geef je een tip.") | Kijk naar het oranje rondje. Draai de punt daarheen. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 6." | 7 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {6:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 6." | 5 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {6:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 14: "Zet de kleine wijzer op de 6." | 12 (andere kant) | `verkeerde-wijzer` — zette de kleine wijzer waar de grote hoort (bij de 12) | Bij de {12:paars} hoort de grote wijzer. | Zet de kleine wijzer bij de {6:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 15 (extra keer zetten): "Zet de kleine wijzer op de 7." | 8 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {7:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 15 (extra keer zetten): "Zet de kleine wijzer op de 7." | 6 (getal ernaast) | `getal-ernaast` — zette de wijzer vlak naast het doel | Je zette hem vlak naast de {7:oranje}. | Draai een klein stukje verder of terug, naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 15 (extra keer zetten): "Zet de kleine wijzer op de 7." | 1 (andere kant) | `andere-kant` — zette de punt aan de andere kant van de klok | De punt staat nu aan de andere kant. | Draai de punt naar de {7:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 15 (extra keer zetten): "Zet de kleine wijzer op de 7." | 5 (spiegelbeeld) | `spiegelbeeld` — zette de punt op het spiegelbeeld: links in plaats van rechts van de klok, of andersom | Je zette de punt rechts, maar de {7:oranje} staat links. | Draai de punt naar het oranje rondje. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |
| stap 15 (extra keer zetten): "Zet de kleine wijzer op de 7." | 12 (de 12) | `verkeerde-wijzer` — zette de kleine wijzer waar de grote hoort (bij de 12) | Bij de {12:paars} hoort de grote wijzer. | Zet de kleine wijzer bij de {7:oranje}. | oranje rondje om het doel blijft, het hulphandje wijst naar het doel |

**2e fout in de uitleg:** uitleg (§4), dan oranje ring om het goede getal, Bliepo zegt het antwoord, het kind tikt zelf (zie `samen` per vraag in de code). Bij zetten: "Hier is de {doel}, in het oranje rondje. Tik er maar op." (of een andere variant, §7) en alleen het doel werkt nog.

## 4. Uitleg bij de 2e fout (daarna samen voordoen)

| Soort denkfout | Uitleg bij de 2e fout | Andere uitleg als dezelfde denkfout nog eens komt |
|---|---|---|
| lange-wijzer | Het uur lees je bij de kleine wijzer. | Je keek weer naar de grote wijzer. Het uur staat bij de punt van de kleine, dikke wijzer. |
| andere-kant | Het uur staat bij de punt van de kleine wijzer. | Weer de andere kant. Vanuit het midden wijst de punt naar het uur. |
| ernaast | Het uur is het getal precies bij de punt van de kleine wijzer. | Weer net ernaast. Je bent er bijna! Het goede getal raakt de punt precies. |
| spiegel | Op de klok maakt het uit of de punt links of rechts staat. | Weer het getal aan de andere kant. Links en rechts zijn omgedraaid. Het getal bij de punt van de kleine wijzer is het uur. |
| zet-spiegel | Kijk of het oranje rondje links of rechts staat. Draai de punt daarheen. | Weer links en rechts omgedraaid. Kijk naar het oranje rondje en draai de punt daarheen. |
| tussendoor-uur | De kleine wijzer vertelt het uur. | Je koos weer de grote wijzer. Het uur lees je bij de kleine wijzer. |
| bonus-min | Straks is het later. De kleine wijzer gaat dan een stukje verder, met de klok mee. | Je ging weer terug. Later is met de klok mee. |
| bonus-nul | Straks is het later dan nu. | Weer de tijd van nu. Straks staat de kleine wijzer bij het volgende getal. |
| onduidelijk | Het uur staat bij de punt van de kleine wijzer. | Bij de punt van de kleine wijzer staat het uur. |
| uur-minuten | Bij een heel uur zeg je het getal en dan het woord uur. | Weer minuten. De grote wijzer staat bovenaan, dus het is een heel uur. |
| korte-wijzer | Het gaat nu alleen om de grote paarse wijzer. | Je keek weer naar de kleine wijzer. Nu telt alleen de paarse wijzer die licht geeft. |
| geen-heel-uur | De grote wijzer telt ook mee. | De kleine wijzer staat vlak bij de {7:oranje}, dat klopt. Maar bij een heel uur staat de grote wijzer bovenaan. |
| klok-van-net | Een klok is rond. Deze getallen staan op een rechte lijn. | Je denkt weer aan de klok van net. Deze getallen staan niet in een rondje. |
| lijn-van-net | De getallen staan nu in een rondje, net als aan de muur. | Je denkt nog aan de lijn van net. Een rondje met getallen hangt aan de muur. |
| boven-onder | Het hoogste getal staat bovenaan de rand, het laagste onderaan. | Weer boven en onder door elkaar. Het hoogste punt is helemaal boven. Het laagste punt is helemaal onder. |
| net-niet-hoogst | Het hoogste getal staat waar de rand niet hoger gaat. | Weer net naast de top. Het hoogste getal staat recht boven het midden van de klok. |
| laagste | Het laagste getal staat waar de rand niet lager gaat. | Het laagste getal staat recht onder het midden van de klok. |
| voor-na | Erna is de kant op van de blauwe pijl. | Weer de andere kant. Erna is 1 stap de kant op van de blauwe pijl. |
| te-ver | Erna is maar 1 stap verder, de kant op van de pijl. | Weer een stap te ver. Erna is precies 1 stap. |
| door-na-12 | Op de klok begin je daarna weer opnieuw. | Je telde weer verder. De blauwe pijl laat zien waar het verder gaat. |
| lang-is-uur | De grote wijzer draait snel rond. Hij telt iets dat kort duurt. | Je koos weer de uren. De grote wijzer gaat in 1 uur een heel rondje. |
| namen | De grote wijzer is lang, de kleine wijzer is kort. | Je koos weer de andere naam. De naam hoort bij hoe lang de wijzer is. |
| zet-12 | Draai de punt naar het getal in het oranje rondje. | Weer bij de {12:paars}. Daar staat de grote wijzer. Zet de kleine wijzer in het oranje rondje. |
| zet-andere-kant | Draai de punt helemaal naar het oranje rondje. | Weer de andere kant. Kijk waar het oranje rondje is. Daar hoort de punt. |
| zet-ernaast | De punt moet precies in het oranje rondje staan. | Weer net ernaast. Je bent er bijna! Draai nog een heel klein stukje, tot in het oranje rondje. |
| zet-ring | Zet de punt van de kleine wijzer in het oranje rondje. | Weer een ander getal. Kijk waar het handje wijst. Daar moet de punt heen. |

Bij een nieuwe denkfout bij de 2e fout zegt Bliepo eerst een eerste zin van die denkfout (een andere dan de 1e keer) en dan de uitleg.

## 5. Bewaren voor de voortgang

- **Denkfout:** elke fout wordt vastgelegd met: les, vraag, gekozen antwoord, naam van de denkfout (§1), poging en tijd (functie `legDenkfoutVast`).
- **Uitkomst (nieuw, 9 november 2026, BOUWREGELS 15.11):** elke vraag krijgt 1 van drie uitkomsten: **goed in één keer**, **goed na een fout** of **samen gedaan** (functie `legUitkomstVast`). Alleen **goed in één keer** telt mee voor beheersing.
- Het bestaande voortgangsmechanisme heeft daar nog geen plek voor zonder nieuwe databasekolom. Daarom bewaart de les het nu alleen op het apparaat zelf (`window.__denkfouten` en `window.__uitkomsten`; op /voorbeeld ook in de browser onder "thuisles-denkfouten-test" en "thuisles-uitkomsten-test"). Niets gaat naar de server of de database (harde regel 2). Voor echte opslag is een nieuwe tabel of kolom nodig en Sara's akkoord.

## 6. Wat de code nu doet

1. 1e fout: reactie en hint uit deze tabel, wachten op de pijl, dan komt de vraag terug. — gebouwd.
2. 2e fout: uitleg (bij de nieuwe denkfout, of de andere uitleg bij dezelfde denkfout) en samen voordoen. — gebouwd (9 november 2026).
3. Eerste zin per denkfout gelijk aan deze tabel; `onduidelijk`: een zin uit BLIEPO-KARAKTER.md §10 plus de algemene hint. — gebouwd.
4. Spiegelbeeld is een eigen denkfout. — gebouwd (9 november 2026).
5. Aanmoediging samen met het hulphandje bij opdrachten, niets bij keuzevragen. — gebouwd (9 november 2026).
6. Varianten met de gedeelde kiezer (`nooit-dubbel.ts`): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen; bij 1 vraag komt geen zin 2 keer. — gebouwd (18 november 2026).

## 7. Alle varianten (18 november 2026: Bliepo als warme juf; nooit 2 keer achter elkaar dezelfde zin)

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer (`nooit-dubbel.ts`). Het script loopt ELKE variant na.

### 7a. Eerste zin en hint, per denkfout

| Vraag en denkfout | Bliepo's eerste zin (varianten) | Hint (varianten) |
|---|---|---|
| klok lezen: onduidelijk | (vast rijtje, BLIEPO-KARAKTER.md §10) | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. / Zoek de punt van de kleine wijzer. Daar staat het uur. / De kleine wijzer licht op. Kijk waar zijn punt naartoe wijst. |
| klok lezen: onduidelijk (klok op 12 uur) (kale getallen) | (vast rijtje, BLIEPO-KARAKTER.md §10) | Hier staat de kleine wijzer op hetzelfde getal als de grote. / De kleine en de grote wijzer wijzen hier naar hetzelfde getal. |
| klok lezen: ernaast (er liggen 2 keuzes vlak naast) (klok op 12 uur) | Je zat er vlak naast. / Bijna! Je zit er vlak naast. / Dat getal staat er net naast. | Hier staat de kleine wijzer op hetzelfde getal als de grote. / De kleine en de grote wijzer wijzen hier naar hetzelfde getal. |
| klok lezen: ernaast (anders zou "vlak naast" het antwoord verklappen) | Je koos 2 uur. Ik lees een andere tijd. / 2 uur? Ik zie een ander uur op de klok. / Je tikte op 2 uur. De kleine wijzer zegt iets anders. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. / Kijk heel precies waar de punt van de kleine wijzer staat. / Volg de kleine wijzer vanaf het midden, helemaal tot zijn punt. |
| klok lezen: lange-wijzer | Je keek naar de grote wijzer. / Je koos het getal bij de grote wijzer. / Dat is het getal van de grote wijzer. | Bij een heel uur kijken we naar de kleine wijzer. / We zoeken de kleine wijzer. Die licht nu op. / Zoek de kleine wijzer. Die vertelt het uur. |
| klok lezen: ernaast (er liggen 2 keuzes vlak naast) | Je zat er vlak naast. / Bijna! Je zit er vlak naast. / Dat getal staat er net naast. | Volg de kleine wijzer tot het getal waar hij precies naar wijst. / Kijk heel precies waar de punt van de kleine wijzer staat. / Volg de kleine wijzer vanaf het midden, helemaal tot zijn punt. |
| klok lezen: andere-kant | Je keek naar de andere kant van de klok. / Dat getal staat aan de andere kant van de klok. / Je koos het getal aan de overkant. | Kijk waar de punt van de kleine wijzer is. / De wijzer begint in het midden. Kijk waar zijn punt is. / Volg de kleine wijzer van het midden naar de punt. |
| klok lezen: spiegel | Je koos het getal rechts, maar de wijzer wijst naar links. / Dat getal staat rechts. De kleine wijzer wijst naar links. / Je keek rechts, maar de punt van de wijzer staat links. | Kijk of de punt van de kleine wijzer links of rechts staat, en neem het getal precies daar. / Kijk goed naar welke kant de punt wijst. Daar zoek je het getal. / Volg de kleine wijzer tot aan zijn punt. Aan die kant staat het getal. |
| klok lezen: onduidelijk (kale getallen) | (vast rijtje, BLIEPO-KARAKTER.md §10) | Volg de kleine wijzer vanaf het midden tot aan de punt. / Zoek de punt van de kleine wijzer. Daar staat het getal. / De kleine wijzer licht op. Kijk waar zijn punt naartoe wijst. |
| stap4-hoe-heet, keuze een klok | Net was het nog een klok, ja. / Dat was het net nog, ja. | Nu staan de getallen op een rij. / Kijk hoe de getallen nu staan: naast elkaar, op een rij. |
| stap6-hoe-heet-nu, keuze een getallenlijn | Net was het een getallenlijn, ja. / Dat was het net nog, ja. | Kijk: nu staan de getallen in een rondje. / De lijn is nu gebogen tot een rondje. |
| stap7-hoogste, keuze 1 | De 1 staat hoog, maar nog niet op het hoogste punt. / De 1 staat hoog. Maar er staat een getal nog hoger. | Ga langs de rand omhoog. / Volg de rand tot je niet hoger kunt. |
| stap7-hoogste, keuze 6 | De 6 staat juist helemaal onderaan. / Dat is het laagste punt. De 6 staat onderaan. | Ga langs de rand helemaal omhoog. / We zoeken de top. Volg de rand helemaal naar boven. |
| stap8-laagste, keuze 3 | (vast rijtje, BLIEPO-KARAKTER.md §10) | Ga langs de rand helemaal omlaag. / Volg de rand tot je niet lager kunt. |
| stap8-laagste, keuze 12 | De 12 staat juist bovenaan. / Dat is het hoogste punt. De 12 staat bovenaan. | Ga langs de rand helemaal omlaag. / We zoeken het laagste punt. Volg de rand helemaal naar beneden. |
| stap9-na-6, keuze 5 | De 5 komt vóór de 6. / De 5 staat ervoor, niet erna. | Erna betekent: deze kant op. Ga verder, de kant op van de blauwe pijl. / Erna is de andere kant op. Kijk maar naar de blauwe pijl. |
| stap9-na-6, keuze 8 | Je ging 2 getallen verder. / Je sprong over een getal heen. | Erna is het getal dat er meteen achter staat. / We zoeken het getal dat er meteen achter komt. |
| stap10-na-12, keuze 11 | De 11 komt vóór de 12. / De 11 staat ervoor, niet erna. | We zoeken het getal erna. Ga verder, de kant op van de blauwe pijl. / Erna is de andere kant op. Kijk maar naar de blauwe pijl. |
| stap10-na-12, keuze 13 | Op een getallenlijn komt de 13 na de 12, dat snap ik. / Bij tellen komt daarna de 13, dat klopt. / Je telde door, zoals op de getallenlijn. | Maar zo'n groot getal staat niet op de klok. Ga verder, de kant op van de blauwe pijl. / Maar de klok heeft geen hogere getallen. Kijk maar naar de blauwe pijl. |
| stap11-lange-telt, keuze de uren | Dat klinkt logisch: een uur duurt lang. / Dat snap ik: een uur duurt lang. | Kijk hoe snel de grote wijzer straks draait. / Maar de grote wijzer draait juist heel snel rond. |
| stap12-lange-naam, keuze de kleine wijzer | De kleine wijzer is de korte. / De kleine wijzer is korter dan deze. | Deze wijzer is lang. / Kijk hoe lang deze paarse wijzer is. |
| stap12-korte-naam, keuze de grote wijzer | De grote wijzer is de lange. / De grote wijzer is langer dan deze. | Deze wijzer is kort. / Kijk hoe kort deze oranje wijzer is. |
| stap15-grote-steeds, keuze 6 | Bij de 6 staat nu de kleine wijzer. / De 6? Daar wijst de kleine wijzer naar. / Je koos de plek van de kleine wijzer. | Let goed op de grote wijzer. / We kijken nog een keer. Let op de grote wijzer. |
| stap17-6-uur, keuze 6 minuten | Je vond het juiste getal, dat zag je goed. / Het getal klopt. Dat zag je goed. | Welke wijzer wijst ernaar? Die vertelt het uur. / Daar wijst de kleine wijzer naar. Die telt geen minuten. |
| stap18-strik, keuze Ja | Je keek naar de kleine wijzer bij de 7. / Je zag de kleine wijzer bij de 7. | Kijk ook naar de grote wijzer. Bij een heel uur wijst die recht omhoog. / Let ook op de grote wijzer. Die licht nu op. |
| tussendoor-welke-wijzer, keuze de grote wijzer | De grote wijzer staat bij de 12. / De grote wijzer wees naar de 12. | Het uur lees je bij de andere wijzer, die nu oplicht. / Het uur stond bij de andere wijzer. Die licht nu op. |
| tussendoor-grote-3uur, keuze 3 | Bij de 3 staat de kleine wijzer. / De 3? Daar wijst de kleine wijzer naar. / Je koos de plek van de kleine wijzer. | Kijk naar de grote wijzer die oplicht. / De grote wijzer licht nu op. Kijk waar die naar wijst. |
| bonus-over-1-uur, keuze 11 uur | Je ging terug in de tijd. / Dat is eerder, niet later. | We zoeken een tijd die later is. Ga verder, de kant op van de blauwe pijl. / Straks is het later dan nu. Kijk maar naar de blauwe pijl. |
| bonus-over-1-uur, keuze 12 uur | Dat is de tijd van nu. / Zo laat is het nu. | Straks is het later dan nu. Begin bij de 12 en ga met de klok mee. / De kleine wijzer blijft niet staan. Hij gaat verder, met de klok mee. |
| zetten (voorbeeld: op de 2): zet-ernaast | Je zette hem vlak naast de 2. / Bijna! De punt staat naast de 2. / De punt staat er vlak naast. | Draai een klein stukje verder of terug, naar het oranje rondje. / Draai de punt nog een klein stukje, naar het oranje rondje. / Schuif de punt nog een beetje op, naar het oranje rondje. |
| zetten (voorbeeld: op de 2): zet-ring | (vast rijtje, BLIEPO-KARAKTER.md §10) | Kijk naar het oranje rondje. Draai de punt daarheen. / Zoek het oranje rondje. Zet de punt erin. / Tik op het getal in het oranje rondje. |
| zetten (voorbeeld: op de 2): zet-andere-kant | De punt staat nu aan de andere kant. / Je draaide naar de andere kant van de klok. / Nu wijst de punt naar de overkant. | Draai de punt naar de 2. / Draai de wijzer verder, tot bij de 2. / Zet de punt bij de 2, in het oranje rondje. |
| zetten (voorbeeld: op de 2): zet-spiegel | Je zette de punt links, maar de 2 staat rechts. / De punt staat nu links. De 2 staat rechts. / Je draaide naar links, maar de 2 staat rechts. | Draai de punt naar het oranje rondje. / Draai de punt naar de andere kant. / Tik op het getal in het oranje rondje. |
| zetten (voorbeeld: op de 2): zet-12 | Bij de 12 hoort de grote wijzer. / De 12 is de plek van de grote wijzer. / Daar staat de grote wijzer al, bij de 12. | Zet de kleine wijzer bij de 2. / Draai de kleine wijzer naar de 2. / Tik op de 2, in het oranje rondje. |

### 7b. Uitleg bij de 2e fout

| Soort denkfout | Uitleg (varianten) | "Weer" (varianten) | Andere uitleg (varianten) |
|---|---|---|---|
| lange-wijzer | Het uur lees je bij de kleine wijzer. / De kleine wijzer vertelt hoe laat het is. / Voor het uur hebben we de kleine wijzer nodig. | Je keek weer naar de grote wijzer. / Weer de grote wijzer, zie ik. / Dat is weer het getal van de grote wijzer. | Het uur staat bij de punt van de kleine, dikke wijzer. / De kleine wijzer is kort en dik. Die wijst het uur aan. |
| andere-kant | Het uur staat bij de punt van de kleine wijzer. / De punt van de kleine wijzer wijst het uur aan. / Het uur staat waar de punt naartoe wijst. | Weer de andere kant. / Weer de andere kant van de klok, zie ik. / Je koos weer het getal aan de overkant. | Vanuit het midden wijst de punt naar het uur. / De wijzer begint in het midden. Zijn punt wijst naar het uur. |
| ernaast | Het uur is het getal precies bij de punt van de kleine wijzer. / De punt van de kleine wijzer raakt maar 1 getal. Dat is het uur. / Het uur staat precies waar de punt naar wijst. | Weer net ernaast. Je bent er bijna! / Weer vlak ernaast, zie ik. / Ook dit getal staat er net naast. | Het goede getal raakt de punt precies. / De punt wijst maar naar 1 getal. Dat getal is het uur. |
| spiegel | Op de klok maakt het uit of de punt links of rechts staat. / Links en rechts zijn op de klok niet hetzelfde. / Het uur staat aan de kant waar de punt naartoe wijst. | Weer het getal aan de andere kant. Links en rechts zijn omgedraaid. / Je draaide links en rechts weer om. / Weer links en rechts door elkaar, zie ik. | Het getal bij de punt van de kleine wijzer is het uur. / Het uur staat aan de kant van de punt, niet aan de overkant. |
| zet-spiegel | Kijk of het oranje rondje links of rechts staat. Draai de punt daarheen. / Het oranje rondje staat aan de andere kant. Draai de punt erheen. | Weer links en rechts omgedraaid. / Links en rechts zijn weer omgedraaid, zie ik. | Kijk naar het oranje rondje en draai de punt daarheen. / Zoek het oranje rondje. Daar moet de punt naartoe. |
| tussendoor-uur | De kleine wijzer vertelt het uur. / Het uur hoort bij de kleine wijzer. | Je koos weer de grote wijzer. / Weer de grote wijzer, zie ik. | Het uur lees je bij de kleine wijzer. / De grote wijzer telt de minuten. Het uur lees je bij de kleine. |
| bonus-min | Straks is het later. De kleine wijzer gaat dan een stukje verder, met de klok mee. / Later is met de klok mee. De kleine wijzer schuift dan naar het volgende getal. | Je ging weer terug. / Weer terug in de tijd, zie ik. | Later is met de klok mee. / Straks is het later. Dan gaat de wijzer met de klok mee. |
| bonus-nul | Straks is het later dan nu. / Straks staat de kleine wijzer niet meer op dezelfde plek. | Weer de tijd van nu. / Je koos weer de tijd van nu. | Straks staat de kleine wijzer bij het volgende getal. / De tijd staat niet stil. Straks wijst de kleine wijzer naar het volgende getal. |
| onduidelijk | Het uur staat bij de punt van de kleine wijzer. / De kleine wijzer wijst met zijn punt naar het uur. / Het uur lees je bij de punt van de kleine wijzer. | (niets) | Bij de punt van de kleine wijzer staat het uur. / Het getal bij de punt van de kleine wijzer is het uur. |
| uur-minuten | Bij een heel uur zeg je het getal en dan het woord uur. / Bij de kleine wijzer hoort het woord uur. | Weer minuten. / Je koos weer minuten. | De grote wijzer staat bovenaan, dus het is een heel uur. / De grote wijzer wijst recht omhoog. Dan zeg je uur, geen minuten. |
| korte-wijzer | Het gaat nu alleen om de grote paarse wijzer. / We letten nu alleen op de grote wijzer. | Je keek weer naar de kleine wijzer. / Weer de kleine wijzer, zie ik. | Nu telt alleen de paarse wijzer die licht geeft. / De grote wijzer is de lange, paarse wijzer. Die licht nu op. |
| geen-heel-uur | De grote wijzer telt ook mee. / Voor een heel uur is ook de grote wijzer nodig. | De kleine wijzer staat vlak bij de 7, dat klopt. / Je ziet de kleine wijzer bij de 7. Dat klopt. | Maar bij een heel uur staat de grote wijzer bovenaan. / Maar bij een heel uur wijst de grote wijzer naar boven. |
| klok-van-net | Een klok is rond. Deze getallen staan op een rechte lijn. / Bij een klok staan de getallen in een rondje. Hier staan ze op een lijn. | Je denkt weer aan de klok van net. / Weer de klok, zie ik. | Deze getallen staan niet in een rondje. / De getallen staan nu naast elkaar, op een rij. |
| lijn-van-net | De getallen staan nu in een rondje, net als aan de muur. / Een getallenlijn is recht. Dit is rond. | Je denkt nog aan de lijn van net. / Weer de getallenlijn, zie ik. | Een rondje met getallen hangt aan de muur. / Dit is rond en er staan getallen op. Zoiets hangt aan de muur. |
| boven-onder | Het hoogste getal staat bovenaan de rand, het laagste onderaan. / Bovenaan is het hoogste punt van de klok. Onderaan het laagste. | Weer boven en onder door elkaar. / Boven en onder zijn weer omgedraaid, zie ik. | Het hoogste punt is helemaal boven. Het laagste punt is helemaal onder. / Bovenaan is de top van de klok. Onderaan is het laagste punt. |
| net-niet-hoogst | Het hoogste getal staat waar de rand niet hoger gaat. / Het hoogste punt is de top van de klok. | Weer net naast de top. / Weer vlak naast de top, zie ik. | Het hoogste getal staat recht boven het midden van de klok. / De top is precies in het midden, helemaal bovenaan. |
| laagste | Het laagste getal staat waar de rand niet lager gaat. / Het laagste punt is helemaal onderaan de klok. | (niets) | Het laagste getal staat recht onder het midden van de klok. / Onderaan is waar de klok het laagst is. |
| voor-na | Erna is de kant op van de blauwe pijl. / Erna betekent: verder, met de pijl mee. | Weer de andere kant. / Weer het getal ervoor, zie ik. | Erna is 1 stap de kant op van de blauwe pijl. / Ervoor is terug. Erna is 1 stap verder. |
| te-ver | Erna is maar 1 stap verder, de kant op van de pijl. / Erna is het getal dat er meteen achter komt. | Weer een stap te ver. / Weer te ver gesprongen, zie ik. | Erna is precies 1 stap. / Erna is het volgende getal. Je slaat er geen over. |
| door-na-12 | Op de klok begin je daarna weer opnieuw. / De klok heeft geen hogere getallen. Hij begint weer opnieuw. | Je telde weer verder. / Weer doorgeteld, zie ik. | De blauwe pijl laat zien waar het verder gaat. / De klok telt niet steeds verder. Hij begint opnieuw bij het begin. |
| lang-is-uur | De grote wijzer draait snel rond. Hij telt iets dat kort duurt. / De grote wijzer heeft haast. Hij telt iets dat snel voorbij is. | Je koos weer de uren. / Weer de uren, zie ik. | De grote wijzer gaat in 1 uur een heel rondje. / De grote wijzer draait veel sneller dan de kleine. |
| namen | De grote wijzer is lang, de kleine wijzer is kort. / De naam zegt het al: groot is lang, klein is kort. | Je koos weer de andere naam. / Weer de andere naam, zie ik. | De naam hoort bij hoe lang de wijzer is. / Een lange wijzer heet groot. Een korte wijzer heet klein. |
| zet-12 | Draai de punt naar het getal in het oranje rondje. / De kleine wijzer hoort nu in het oranje rondje. Draai hem daarheen. | Weer bij de 12. Daar staat de grote wijzer. / De punt staat weer bij de 12, bij de grote wijzer. | Zet de kleine wijzer in het oranje rondje. / Draai de kleine wijzer naar het oranje rondje. |
| zet-andere-kant | Draai de punt helemaal naar het oranje rondje. / Het oranje rondje staat aan de overkant. Draai de punt erheen. | Weer de andere kant. / De punt staat weer aan de overkant. | Kijk waar het oranje rondje is. Daar hoort de punt. / Zoek het oranje rondje. Daar hoort de punt. |
| zet-ernaast | De punt moet precies in het oranje rondje staan. / De punt hoort midden in het oranje rondje. | Weer net ernaast. Je bent er bijna! / Weer vlak naast het rondje, zie ik. | Draai nog een heel klein stukje, tot in het oranje rondje. / Nog een klein stukje, dan staat de punt in het oranje rondje. |
| zet-ring | Zet de punt van de kleine wijzer in het oranje rondje. / De punt van de kleine wijzer hoort in het oranje rondje. | Weer een ander getal. / Ook dit getal is het nog niet. | Kijk waar het handje wijst. Daar moet de punt heen. / Het handje wijst de goede plek aan. |

### 7c. Het verloop van de les

| Situatie | Varianten |
|---|---|
| begin (met de vraag voor Ja of Nee) | Vandaag lezen we op de klok hoe laat het is. We kijken naar de wijzers. Kun jij al klokkijken? / We gaan samen klokkijken. De wijzers laten zien hoe laat het is. Kun jij de klok al lezen? / Vandaag leren we klokkijken. We kijken naar de wijzers en lezen het uur. Lukt jou dat al? |
| na Ja: de proef begint | Fijn! Dan kijken we eerst of het lukt. / Mooi! Dan proberen we er eerst 2. / Wat goed! We beginnen met 2 klokken. |
| de proef lukt nog niet | Dit is nog lastig. We gaan het eerst samen bekijken. / Dat geeft niks. We kijken er eerst samen naar. / Weet je wat? We leren het eerst samen, stap voor stap. |
| de proef lukt | Mooi, dat kun je al! / Kijk eens aan, je kunt het al! / Zie je wel, dat lukt jou al! |
| na Nee: samen beginnen | Dat geeft niks. We gaan het samen bekijken. / Geen probleem. We leren het samen, stap voor stap. / Dan doen we het samen. Ik help je. |
| het oefenblok begint | Nu mag jij de klokken lezen. / Nu ga jij zelf klokkijken. |
| het oefenblok begint (na de proef) | Nu nog meer klokken. / We gaan door met nog meer klokken. |
| klokken van net komen terug (1) | Er komt nog 1 klok van net terug. / We doen nog 1 klok van net. / Nog 1 klok van net. Die oefenen we nog even. |
| klokken van net komen terug (voorbeeld: 3) | Er komen nog 3 klokken van net terug. / We doen nog 3 klokken van net. / Nog 3 klokken van net. Die oefenen we nog even. |
| extra klokken, niets gemist (1) | Nog 1 klok om te oefenen. / We oefenen nog 1 klok. |
| extra klokken, niets gemist (voorbeeld: 2) | Nog 2 klokken om te oefenen. / We oefenen nog 2 klokken. |
| de klokken die terugkwamen gingen weer mis | Deze klokken oefenen we een andere keer nog eens. / Dit oefenen we een andere keer nog eens. Dat komt goed. |
| slot | Nu kun je het uur lezen met de kleine wijzer. / Je hebt goed gewerkt vandaag! Je kunt nu zien welk uur het is. / Mooi gewerkt! Jij kunt nu de hele uren lezen op de klok. |
| hulphandje bij zetten (voorbeeld: de 2; na een aanmoediging uit het vaste rijtje) | Tik op de 2, of sleep de kleine wijzer erheen. / Tik maar op de 2. Slepen met de wijzer mag ook. |
| zetten, samen doen: waar het getal staat (voorbeeld: de 2) | Hier is de 2, in het oranje rondje. / Kijk, het handje wijst naar de 2. / Het handje wijst het getal aan. / Kijk, het staat in het oranje rondje. |
| zetten, samen doen: het kind tikt zelf | Tik er maar op. / Tik jij erop? / Tik het maar aan. |
| samen voordoen bij een klok (voorbeeld: 3 uur) | Kijk, de kleine wijzer wijst naar de 3, in het oranje rondje. De grote wijzer staat op de 12. Dus het is 3 uur. / De punt van de kleine wijzer staat bij de 3. De grote wijzer wijst recht omhoog. Dus het is 3 uur. / Kijk, in het oranje rondje staat de 3. Daar wijst de kleine wijzer naar. Het is dus 3 uur. |
| samen voordoen bij de klok op 12 uur | Kijk, de 2 wijzers wijzen allebei naar de 12. Dat zie je in het oranje rondje. Dus het is 12 uur. / De kleine wijzer en de grote wijzer staan allebei op de 12. Kijk maar in het oranje rondje. Dus het is 12 uur. |
| samen voordoen: naar welk getal wijst de kleine wijzer (voorbeeld: de 3) | De punt van de kleine wijzer staat bij de 3, in het oranje rondje. / Kijk, de kleine wijzer wijst naar de 3, in het oranje rondje. / In het oranje rondje staat de 3. Daar wijst de kleine wijzer naar. |
| de kleine stap: het kind tikt zelf op het antwoord | Tik nu zelf op het antwoord. / Nu jij! Tik op het antwoord. / Tik jij het antwoord nu aan? |
| reactie bij de klok na lof (voorbeeld: 3 uur) | Ja, de kleine wijzer staat op de 3. / Ja, de grote wijzer staat bovenaan, dus het is een heel uur. / Ja, het is precies 3 uur. / Nagekeken: de kleine wijzer wijst naar de 3. Klopt! / Precies, het is 3 uur. / Dat klopt, de kleine wijzer wijst naar de 3. |
| de vraag opnieuw na de hint (stap4-hoe-heet) | Hoe heet dit, denk je? / Wat denk je nu? Hoe heet dit? |
| de vraag opnieuw na de hint (stap6-hoe-heet-nu) | Hoe heet dit nu? / Hoe heet dit nu, denk je? |
| de vraag opnieuw na de hint (stap7-hoogste) | Welk getal staat helemaal bovenaan? / Welk getal staat op het hoogste punt, denk je? |
| de vraag opnieuw na de hint (stap8-laagste) | Welk getal staat helemaal onderaan? / Welk getal staat op het laagste punt, denk je? |
| de vraag opnieuw na de hint (stap9-na-6) | Welk getal komt na de 6? / Wat denk je nu? Welk getal komt na de 6? |
| de vraag opnieuw na de hint (stap10-na-12) | Welk getal komt na de 12? / Wat denk je nu? Welk getal komt na de 12? |
| de vraag opnieuw na de hint (stap11-lange-telt) | Wat telt de grote wijzer? / Wat telt de grote wijzer, denk je? |
| de vraag opnieuw na de hint (stap12-lange-naam) | Hoe heet deze paarse wijzer? / Hoe heet de wijzer die de minuten telt? |
| de vraag opnieuw na de hint (stap12-korte-naam) | Hoe heet deze korte oranje wijzer? / Hoe heet deze oranje wijzer, denk je? |
| de vraag opnieuw na de hint (stap16-wijst-3) | Naar welk getal wijst de kleine wijzer? / Naar welk getal wijst de kleine wijzer, denk je? / Wat denk je nu? Waar wijst de kleine wijzer naar? |
| de vraag opnieuw na de hint (stap15-grote-steeds) | Waar stopte de grote wijzer? / Waar stopte de grote wijzer, denk je? |
| de vraag opnieuw na de hint (elke klok) | Hoe laat is het? / Hoe laat is het, denk je? / Wat denk je nu? Hoe laat is het? / Kijk nog eens goed. Hoe laat is het? |
| de vraag opnieuw na de hint (stap18-strik) | Is het nu 7 uur? / Wat denk je nu? Is het 7 uur? |
| de vraag opnieuw na de hint (tussendoor-welke-wijzer) | Welke wijzer liet het uur zien, denk je? / Wat denk je nu? Welke wijzer liet het uur zien? |
| de vraag opnieuw na de hint (tussendoor-grote-3uur) | Waar wijst de grote wijzer naar, denk je? / Wat denk je nu? Waar wijst de grote wijzer? |
| de vraag opnieuw na de hint (bonus-over-1-uur) | Hoe laat is het over 1 uur? / Wat denk je nu? Hoe laat is het over 1 uur? |

De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, aanmoediging bij het hulphandje, de zin als de denkfout niet duidelijk is) staan in BLIEPO-KARAKTER.md; die wisselen al zonder herhaling en zijn niet veranderd.
