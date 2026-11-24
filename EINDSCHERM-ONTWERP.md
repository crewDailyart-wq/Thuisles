# EINDSCHERM-ONTWERP — werknotitie (proef, 24 november 2026)

**Stand:** proef, alleen in **Tellen extra** (`squla-tellen-fruit-1-gouden-extra`). Wacht op de keuze van Sara (versie A of B, feestgeluid 1, 2 of 3) en haar akkoord. Pas daarna komt de regel in BOUWREGELS/LESRECEPT en het eindscherm in de andere lessen. Alle andere lessen houden de kaart en zijn niet veranderd.

## Wat er is

1. **Feestmoment (±2 s):** Bliepo juicht (zijn gebaar "correct", hetzelfde als vroeger bij "klaar"), confetti in code (canvas, 1,5 s; versie B 2 s en meer stukjes), kleuren van het blauwe holo-thema met een beetje goud, en een feestgeluid (versie A `feest-2.wav`, versie B `feest-1.wav`; `feest-3.wav` staat ook klaar).
2. **De gouden ster** (`public/beloning/ster-goud-400.png`, verkleind van `ster-goud.png`) komt na 1,5 s met een zachte pop en fonkelingen, met **"Les af!"**.
3. **De sleutels van deze les** (na 2,5 s): kleine sleuteltjes vliegen 1 voor 1 naar de grote sleutel en het getal telt mee (kleur van de sleutel, goud). Bij 0 sleutels staat dit stuk er niet (een 0 voelt als niets verdiend).
4. **De leerzin** met een plaatje uit de les: "Je kunt nu fruit tellen tot 10." met de appel.
5. **De knoppen:** groot **"Volgende les"**, kleiner **"Terug"** en **"Nog een keer"** (die laatste stond al aan het eind van elke les; hij is niet weggehaald, alleen verplaatst naar het eindscherm).
6. **Bliepo zegt 1 korte zin** die past bij hoe het ging (zie de lijst hieronder). Geen pijl, geen opdracht.
7. **De ster wordt bewaard** met `bewaarLesAfgemaakt(lesId)` (1 keer per les per kind; zonder gekozen kind gebeurt er niets; op de voorbeeldpagina alleen voor Testkind).

**Twee versies** (adresbalk): `?eind=a` (ook zonder parameter) = rustig en groot, alles in 1 kolom in het midden van het speelvlak; `?eind=b` = een breed paneel met links de ster en "Les af!", rechts de sleutels en de leerzin met plaatje, de knoppen onderaan het paneel, meer confetti.

**Sleutelteller tijdens de les:** rechtsboven naast de voortgangsbalk (die is in deze les iets smaller, 820 in plaats van 960, en 10 punten hoger, zodat hij het lijstje niet raakt). Bij elk antwoord dat **in 1 keer goed** is, verschijnt er boven in het midden van het speelvlak een sleuteltje met een zachte gloed en een paar fonkelingen. Het vliegt onder de balk door naar rechts en schuin omhoog de teller in (±0,9 s), de teller telt +1 en er klinkt zacht het sleutelgeluidje (`public/geluiden/beloning.wav`, de plek "beloning"; zachter als Bliepo praat). Geen wachttijd en geen extra tik: de les gaat gewoon door. Het aantal op het eindscherm = het aantal antwoorden dat in deze speelbeurt in 1 keer goed was.

## Waar de code staat

- `src/components/les/Eindscherm.tsx` en `Eindscherm.module.css`: het eindscherm (A en B), de confetti, de sleutelteller, het vliegende sleuteltje, de route en de maten.
- `src/components/les/Lesscherm.tsx`: zet het aan (alleen bij `les.eindscherm`): `l.sleutel()`, `l.eindscherm()`, de smallere balk, de teller, de vliegende sleutels, `bewaarLesAfgemaakt`. Zonder `eindscherm` verandert er niets.
- `src/components/les/soort.ts`: de velden `eindscherm`, `eindLeerzin`, `eindPlaatje` (draaiboek) en `sleutel`, `eindscherm`, `snelEinde` (gids).
- `src/components/les/lessen/squla-extra-basis.ts` (`noteer`): roept `l.sleutel?.()` aan bij de eerste uitkomst "goed" van een vraag.
- `src/lib/lesgeluiden.ts`: de geluiden `feest1`, `feest2`, `feest3` en `sleutel` (bestanden in `public/geluiden/`; alleen geladen in een les met het eindscherm, `laadEindgeluiden`).
- `src/components/les/lessen/squla-tellen-extra-gouden.tsx`: het einde van de les (`eindeScherm`) en de testroute `snelNaarEinde`.
- `src/app/voorbeeld/les/[les]/page.tsx`: "Volgende les" = de volgende gouden les in de volgorde van de lescatalogus (er is nog geen apart lesplan; voor Tellen extra is dat "De meeste", `squla-meer-minder-evenveel2-1-gouden`); "Terug" = het lesoverzicht `/alle-lessen.html`. Op de kinderkant (`LesOefening`) gaan beide naar de terugknop van de oefening, omdat daar nog geen lesplan is.

## Aansluiten in een andere les (pas na akkoord van Sara)

1. In het draaiboek: `eindscherm: true`, `eindLeerzin: "Je kunt nu …"`, `eindPlaatje: "/voorwerpen/<naam>.png"`.
2. Gebruikt de les `maakBasis` (`squla-extra-basis.ts`): dan komen de sleutels vanzelf (via `noteer`). Een les met eigen code roept `l.sleutel?.()` aan bij elk antwoord dat in 1 keer goed is.
3. Aan het eind, in plaats van `l.kaart()` met eindzin: het rooster leeg maken, `await l.wacht(1000)` (het laatste sleuteltje landt), `l.eindscherm?.()`, `await l.wacht(1500)`, en dan 1 eindzin met `B.zeg` (geen `zegDoor`: er hoort geen pijl bij). Zie `eindeScherm` in `squla-tellen-extra-gouden.tsx`.
4. Kijk of het sleuteltje in alle scènes van die les vrij vliegt (route in `Eindscherm.tsx`, `VLIEG_START` en `VLIEG_BOCHT`); de speelcontrole meldt "sleutel: … raakt …" als er iets geraakt wordt.

## Snel bekijken (alleen de voorbeeldpagina)

- `&snel=1`: Bliepo groet, er vliegen 3 sleutels naar de teller, dan meteen het eindscherm (gewone ronde).
- `&snel=alles`: 5 sleutels, de zin voor "alles in 1 keer goed". `&snel=moeite`: 1 sleutel, de zin voor "veel moeite".
- Bij `snel` wordt er niets bewaard (geen uitkomsten, geen ster).

## Eindzinnen (voor de controle door Fable)

Bliepo zegt er 1, gekozen met de gedeelde kiezer (nooit 2 keer dezelfde achter elkaar). In de code: `ZIN.eindAllesGoed`, `ZIN.eindGewoon`, `ZIN.eindMoeite` in `squla-tellen-extra-zinnen.ts`. De "1" staat in de code als `{1:wit}` (wit: hij verwijst niet naar een voorwerp).

**Alles in 1 keer goed** (elke vraag in 1 keer goed):
1. Wauw, jij had alles in 1 keer goed!
2. Alles in 1 keer goed, wat knap van jou!
3. Jij deed alles in 1 keer goed, super!
4. Alles in 1 keer goed: dat is echt knap!

**Gewone ronde:**
1. Hoera, jij hebt de les helemaal af!
2. Klaar, en wat heb jij het goed gedaan!
3. Jij hebt de hele les goed afgemaakt!
4. De les is af, wat ben jij goed bezig!

**Veel moeite** (de helft of meer niet in 1 keer goed; dezelfde grens als vroeger bij "Volgende keer gaat het nog beter."):
1. Wat heb jij goed geoefend, knap hoor!
2. Jij bleef proberen, en nu is de les af!
3. Jij hebt hard gewerkt, de hele les is af!
4. Goed geoefend, en jij hebt alles af!

**Op het scherm (niet gesproken):** "Les af!" en de leerzin "Je kunt nu fruit tellen tot 10."

## Open punten voor Sara

- Versie A of B, en welk feestgeluid (1, 2 of 3; `public/geluiden/FEEST-KEUZE.md`).
- Moet "Nog een keer" op het eindscherm blijven? (Hij stond er al; nu klein naast "Terug".)
- Moet Bliepo de leerzin ook hardop zeggen? (Nu zegt hij alleen zijn ene eindzin; groep 3 kan de leerzin nog niet altijd lezen.)
- Bij 0 sleutels staat er geen sleutelregel op het eindscherm. Goed zo, of toch "0"?
- Het sleutelgeluidje is nu de plek "beloning" (`beloning.wav`, een tijdelijk geluid uit code). Vervangen = dat bestand overschrijven.
