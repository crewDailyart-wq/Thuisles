# KEURING gouden les Tellen — squla-tellen-fruit-1-gouden ("Fruit tellen")

Onafhankelijke controleur, 9 november 2026, branch backup-squla, basis commit 616068e. Ik heb de les NIET veranderd.
Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt.

## UITSLAG: AFGEKEURD

In 1 zin: de les zit goed in elkaar en de inhoud is precies die van Squla, maar 2 hints verklappen toch het antwoord,
de gekleurde getallen in Bliepo's tekst zijn overal wit, en bij het testen bleek dat de voorbeeldpagina antwoorden
opslaat bij een echt kind.

## Hoe ik gekeurd heb

- Code gelezen: `squla-tellen-gouden.tsx`, `squla-tellen-gouden-zinnen.ts`, `squla-tellen-gouden-vlak.tsx`, oude les in `squla-tellen.tsx`.
- Alle 30 foute antwoorden in beide volgordes (60 routes) met een eigen script door de echte fouttabel-code gehaald.
- `scripts/speelcontrole.mjs` 2 keer (alles goed: 48 foto's; alles fout: 99 foto's), laptop 1440 x 900, voorbeeldpagina.
- Echte Chrome (Claude in Chrome, eigen tabblad, daarna gesloten): 2 fouten bij vraag 1, samen tellen, 7,5 s stil (hulphandje), daarna alles goed tot de eindkaart.
- `npm run opgaven`, `npm run inhoudsvergelijk` (ook tegen 35e54fb en c38070b), `npm run vloeiend`, `git diff 35e54fb HEAD`, database alleen gelezen.

## Per punt van de opdracht

| # | Wat | Oordeel | Bewijs |
|---|---|---|---|
| 1 | Inhoud gelijk aan squla-tellen-fruit-1 (15.22) | GOED | 15 vragen, zelfde volgorde, fruit, aantallen (11 t/m 17) en 3 keuzes; vraagzin gelijk ("Hoeveel … zie je?"). Elke vraag precies 1 goed antwoord. Fruit staat in rijen van 5 en het aantal klopt (foto's). |
| 1 | Zinsaanpassingen in KEUZES (15.26) | GOED, 1 opmerking | Ronde 20b heeft oud/mis/nieuw. De oude beginzin "De appels liggen netjes in rijtjes." staat er niet als aanpassing in (wel "startvraag weggevallen"). |
| 1 | Oude les ongewijzigd | GOED | `git diff 35e54fb HEAD`: alleen nieuwe bestanden plus 2 regels erbij in `index.ts` en `catalogus.ts`. `squla-tellen.tsx` niet veranderd. Inhoudsvergelijking: 0 verdwenen. |
| 2 | Skelet volgt draaiboek Tellen | GOED | Openen + pijl, vraag + getal tikken, lof met aantal en alle nummers, bij vraag 1 natellen (1,15 s per nummer), 1e fout knoppen meteen terug zonder pijl, 2e fout samen tellen, geen opmerking bij snel. Afwijkingen staan met reden in KEUZES Ronde 20. Eigen invulling boven 10 staat gemarkeerd in tellen.md, FOUTTABEL en KEUZES. |
| 3 | Hint verklapt niets (15.17) | FOUT | Zie punt 1 hieronder. |
| 3 | Les stopt nooit / nooit menu (15.18) | GOED | Alle routes tot de eindkaart (speelcontrole 37 en 270 stappen, 0 fouten). |
| 3 | Hulphandje (15.19) | GOED | Alleen bij samen tellen; kwam na 6,0 s (gemeten in Chrome), met "Tik op een appel zonder nummer.", geen knop. Niet bij keuzevragen. |
| 3 | 2 pogingen en voortgang (15.11) | GOED | 1e fout hint, 2e fout uitleg + samen tellen + door. Uitkomsten "goed in één keer / goed na een fout / samen gedaan" met denkfouten komen in `les_uitkomsten` (gezien in de database). |
| 3 | Heel snel (6.10) | GOED | Niets gezegd, ook niet bij tikken binnen 0,4 s. |
| 3 | Naam hooguit 2x | GOED | Groet + 1 lofzin ("Jij weet het, Testkind!"). |
| 3 | Rood/groen scherm, geen rood op keuze, geen fout-geluidje | GOED | Foto fout/002: Bliepo rood, knoppen weg, fruit zonder nummers. Code: geen foutgeluid. Duur niet zelf met een klok gemeten. |
| 3 | Cijfers in tekst (3.20), geen "Weet ik niet", geen toetsenbord, geen gezichtjes, geen kaders | GOED | Overal "1 keer", "1 nummer", "rijen van 5". |
| 3 | Getal in kleur van voorwerp (2.2, 14.20) | FOUT | Zie punt 2. |
| 4 | Rekenen en logica fouttabel | GOED, met punten 1, 5, 6 | Elk fout antwoord heeft een rij; "Dat zijn er 10/15" klopt bij elk aantal (12 → 10, 16 en 17 → 15, 11 → 10); "1" of "een paar" klopt met het verschil; "weer" alleen als de 1e keer de richting genoemd werd. |
| 5 | Vloeiend laptop | GOED | `ALLEEN=squla-tellen-fruit-1-gouden npm run vloeiend`: 60 beelden/s, langste beeld 42 ms, openen 1317 ms (ontwikkelversie, alleen waarschuwing). Load ± 1,6. |
| 5 | Trage telefoon (alleen melden, DESIGN-LATER) | MELDING | 59 beelden/s, hapering 54 ms (grens 50); openen 2,8 s ontwikkelversie. |
| 5 | npm run opgaven / inhoudsvergelijk | GOED | Beide groen. |
| 6 | Beschrijving stem-probleem (src/lib/stem.ts) | GOED beschreven | Klopt met de code: `uiting.onstart` → `meld(true)` → `stopKeuzeStem()` → `speechSynthesis.cancel()` (alleen als de browserstem mag). Aanvulling: dit geldt voor elke les met browserstem, dus ook de gouden klokles. |

## Gevonden punten

### Ernstig

1. **Twee hints verklappen het antwoord toch (15.17).**
   - Waar: `HINT_WEINIG[1]` en `HINT_VEEL[1]` in `squla-tellen-gouden-zinnen.ts` (keuze via `v.nr % 3`).
   - Wat: bij vraag 1 (12 appels, keuzes 10/11/12) kiest het kind 11. Bliepo zegt bewust alleen "11 is dichtbij." (anders blijft er 1 keuze over), maar de hint is dan "Tel nog eens, rij voor rij. Sla er geen appel over." Dat zegt alsnog "je hebt er te weinig" → alleen 12 blijft over. Bij vraag 4 (14 appels, 14/15/16) kiest het kind 15: "15 is dichtbij." + "Tel opnieuw. Elke appel tel je maar 1 keer." = "je telde te veel" → alleen 14 blijft over. Gezien in de speelcontrole (fout/003 en fout/024).
   - Voorstel: als de richting niet genoemd wordt (`noot`), een hint zonder richting kiezen, bijvoorbeeld altijd "Begin linksboven en tel opnieuw. Wijs elke appel aan." Ook "Wijs elke peer 1 keer aan" (vraag 2, 8, 12) neigt licht naar "te veel"; liever neutraal.
   - Open bij Sara (al gevraagd, KEUZES Ronde 20 vraag 2): vraag 15, kiest 10 → "Kijk ook naar de laatste rij" laat alleen 11 over.

2. **Gekleurde getallen in Bliepo's tekst zijn wit (2.2, 14.20).**
   - Waar: `src/components/les/Lesscherm.tsx` regel 1254 zet `data-squla` alleen als `les.synthesis` met "Squla" begint. Deze les begint met "Gouden les · …". Daardoor maakt de CSS (`[data-indeling="synthesis"] .getal { color: inherit !important }`) elk getal wit.
   - Wat: in de code staat `{12:rood}`, `{17:paars}` enz., maar op het scherm zijn ze wit. Gemeten in Chrome: `rgb(255,255,255)`; ook op foto goed/003 en 029. De nummers bij het fruit zelf zijn wel in kleur.
   - Let op: de gouden klokles heeft dezelfde begintekst ("Gouden les · …"), dus daar speelt het waarschijnlijk ook. Gedeelde code: Sara/bouwer beslist.
   - Voorstel: `data-squla` ook zetten voor gouden lessen (bijvoorbeeld een eigen vlag op de les), of de synthesis-tekst laten beginnen met "Squla". Daarna in beide gouden lessen nakijken.

3. **De voorbeeldpagina slaat antwoorden op bij een echt kind (privacy, harde regel "alleen Testkind").**
   - Waar: `bewaarUitkomst` (`src/app/lesuitkomstacties.ts`) kiest het kind uit het koekje van de browser, niet uit `?naam=Testkind`.
   - Wat: bij mijn test in de echte Chrome van deze laptop stond het koekje op een echt kind (niet Testkind). Daardoor kwamen er 15 regels van mijn test in de voortgang van dat kind: `les_uitkomsten` id 93 t/m 107 (les squla-tellen-fruit-1-gouden, 9 nov 19:04 UTC). Dat is mijn fout; ik had eerst moeten nakijken welk kind er gekozen was. Ik heb ze NIET weggehaald (harde regel 3).
   - Voorstel: (a) Sara akkoord vragen om precies deze 15 regels (id 93 t/m 107) te verwijderen, eerst kopie in `backups/`; (b) op `/voorbeeld/…` niets bewaren, of alleen bij het kind Testkind. De kind-test schreef "de voorbeeldpagina zonder kind-koekje bewaart niets"; mét koekje dus wel.

### Klein

4. **Zelfde fout 2 keer: dezelfde eerste zin 2 keer.** Kiest het kind 2 keer 11 bij vraag 1, dan zegt Bliepo 2 keer "11 is dichtbij." (fout/002 en 004 in de route). Voorstel: bij precies hetzelfde antwoord "Je koos weer 11." of meteen de uitleg.
5. **Eindkaart: "10" en "15" raken het laatste bolletje** (`KaartTellenGouden`, x=204). Voorstel: getallen iets naar rechts of de bolletjes iets naar links.
6. **"Dan tel je er geen 2 keer."** is net geen goed Nederlands. Voorstel: "Dan tel je niets 2 keer." (dat stelde de kind-test ook voor).
7. **Tekst van de vorige vraag blijft even staan bij nieuw fruit** (foto goed/029: "… 17." terwijl er al 14 peren staan, ± 0,7 s). Voorstel: de oude zin weghalen als het nieuwe fruit komt.
8. **Afspraak 15.25 niet gedaan:** de lessen uit de kind-test staan niet in LESRECEPT.md en BLIEPO-KARAKTER.md. De 2 nieuwe telzinnen ("Het zijn er 16.", "Je telde er 16.") heten "eigen aanvulling op BLIEPO-KARAKTER.md §4", maar staan daar niet. Ook FOUTTABEL §4 noemt nog alleen de oude 3 telzinnen.
9. **DESIGN-LATER.md** noemt alleen de klok; de hapering van Tellen op de trage telefoon (54 ms, KEUZES zegt 80 ms) staat er niet.
10. **Commando in de opdracht werkt niet:** `ALLEEN=squla-tellen-gouden` vindt geen scherm (het filter kijkt naar het pad), en het script meldt dan ten onrechte "de site draait niet". Gebruik `ALLEEN=squla-tellen-fruit-1-gouden`.

## Wat goed is

Inhoud precies Squla; oude les onaangeroerd; skelet volgt het draaiboek; elke fout heeft een passende eerste zin;
de "weer"-regel is nu goed; samen tellen werkt (dubbel tikken telt niet, handje na 6 s); nooit vast, nooit het menu;
fruit groot, telbaar, zonder gezichtjes of kaders; nummers bij het fruit in de kleur van het fruit; eindkaart met
"Tik op de kaart."; laptop vloeiend.

## Wat nodig is voor een nieuwe keuring

Punt 1 en 2 herstellen; punt 3 aan Sara voorleggen (regels verwijderen + voorbeeldpagina laten stoppen met bewaren
bij echte kinderen). Daarna opnieuw keuren.

---

# TWEEDE KEURING (9 november 2026, na commit 8ef14f4)

Zelf opnieuw gecontroleerd, alleen met scripts en Chrome zonder venster met een eigen leeg profiel (geen koekje,
`?naam=Testkind`). Na alle runs nagekeken: er is geen enkele nieuwe regel in `les_uitkomsten` bijgekomen. Niets aan de
les of de database veranderd.

## UITSLAG: GOEDGEKEURD

De les zelf is in orde. Eén punt blijft open bij Sara (punt 3 van de eerste keuring); dat zit in gedeelde code en in
de database, niet in deze les.

## Punten

1. **Hints verklappen niets meer (15.17): GOED.** Alle 30 foute antwoorden in beide volgordes (60 routes) door de echte
   code gehaald. Waar Bliepo alleen "… is dichtbij." zegt (vraag 1, 2, 4, 6, 8, 9, 12), is de hint nu neutraal
   ("Begin linksboven en tel opnieuw. Wijs elke appel aan." / "Tel nog eens, rij voor rij. Wijs elke … aan." /
   "Tel nog eens rustig. Wijs elke … aan en zeg het getal."). Waar Bliepo wél de richting noemt, blijven er steeds
   2 keuzes over. `npx tsx scripts/fouttabel-tellen-gouden.ts` geeft dezelfde uitkomst en maakt een gelijke FOUTTABEL.
   Blijft open bij Sara (al gevraagd, KEUZES Ronde 20 vraag 2): vraag 15, kind kiest 10 → "Kijk ook naar de laatste rij".
2. **Getalkleur op het scherm: GOED.** De beschrijving begint nu met "Squla groep 3 …", dus het scherm zet `data-squla`.
   Foto (goed-route): "Het zijn er 15." met een paarse 15 bij pruimen. Andere gevolgen nagekeken: alleen de opmaak van
   sommen en de indeling op een staand scherm (telefoon, latere fase) kijken ook naar dit begin; dat geeft hier geen
   probleem. Let op: de gouden klokles begint nog met "Gouden les · …", daar zijn de getallen in de tekst dus nog wit.
3. **Kleine punten: GOED.**
   - Hetzelfde foute getal 2 keer: nu "Je koos weer 11." in plaats van 2 keer dezelfde zin (code nagelopen).
   - Eindkaart: nu ruimte tussen het laatste bolletje en 5, 10 en 15 (schermfoto, Chrome zonder venster). "Tik op de kaart." staat erbij.
   - "Dan tel je niets 2 keer." (goed Nederlands).
   - De zin van de vorige vraag verdwijnt nu als het nieuwe fruit komt; in 25 + 41 foto's geen oude zin bij nieuw fruit gezien.
   - LESRECEPT.md, BLIEPO-KARAKTER.md (§2 en §4 10a/10b), FOUTTABEL §4, DESIGN-LATER.md en KEUZES Ronde 20c zijn bijgewerkt.
4. **Eerdere punten kloppen nog: GOED.**
   - Inhoud: 15 vragen, getallen en keuzes gelijk aan squla-tellen-fruit-1. Oude les niet veranderd (`squla-tellen.tsx` geen verschil sinds 35e54fb).
   - `npm run opgaven` groen; `inhoudsvergelijk` tegen 35e54fb en 616068e: 0 verdwenen (3 bewust, staan in WEGGEHAALD.md).
   - Speelcontrole: alles goed en alles fout, allebei tot het eind, 0 fouten.
   - 2 pogingen, nooit stoppen, geen opmerking bij snel, naam 2 keer, hulphandje alleen bij samen tellen.
   - Vloeiend (`ALLEEN=squla-tellen-fruit-1-gouden`): laptop 60 beelden/s, langste beeld 33 ms; trage telefoon dit keer 60 beelden/s, 32 ms. De computer was niet rustig (belasting ± 5); openen 2,6–2,7 s in de ontwikkelversie (alleen waarschuwing).
5. **Nog open bij Sara (niet in deze les):** de 15 testregels uit de eerste keuring staan nog in de voortgang van een
   echt kind (`les_uitkomsten` id 93 t/m 107), en de voorbeeldpagina bewaart nog steeds bij het kind van het koekje
   (`src/app/lesuitkomstacties.ts`). Sara beslist over weghalen en over een aanpassing van de voorbeeldpagina.
6. **Stemprobleem (`src/lib/stem.ts`)** blijft een open vraag voor Sara (gedeelde code), zoals in de eerste keuring.
