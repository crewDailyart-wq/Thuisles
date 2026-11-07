# Controle laatste reparaties Squla-lessen (5 november 2026)

Alleen gelezen: geen speelcontrole, geen npm, geen Chrome, niets aangepast.
Gekeurd op BOUWREGELS 3.20, 3.23, 5.1-5.11 en de zeven punten uit de opdracht.

## Wat gelezen is
- Alle reactie-, hint- en uitlegcode van de 16 bestanden `squla-*.tsx` plus `squla-hulp.ts`, `squla-uitleg.ts`, `squla-splitsen-hulp.ts` en `src/lib/lessen/tekstwijzigingen.json`.
- Steekproef: ongeveer 30 lessen/vraagsoorten, verspreid over alle 16 bestanden: huisnummers, dagen, rekentaal, geld (geldmachine 1/2, zakgeld, geld), klok (hoelaat, digitaal, klokkeuze), tellen (zak, verspreid, rijen), plussommen (bakkerij, kaartje, typ, bus), minsommen (kaal, bord, machine, bus, ruimte, disco), rekenmix (mix1, mix2), meer-minder, meten (pizza, stokjes, mand, flesje), tijd (tijden 1, dagen, kalender), vormen (patronen, opruimen, orienteren), getallenlijn (terugtellen, reeks, rangschikken, tegels), piraat, splitsen.
- Veel lessen delen dezelfde vraagfabriek; de zinnen zijn per fabriek gelezen, niet elke les apart op het scherm.

## Bevestigd: de reparaties uit REACTIES-EINDKEURING.md staan in de code
- H1 "1 blokje": `squla-minsommen.tsx` machine, juist enkelvoud/meervoud.
- H2 geld-reactie met hint (`squla-geld.tsx` ~262-295): klopt rekenkundig.
- H3 plus-bakkerij: hint "Begin bij 4 + 4. Het ene getal is 1 groter ... er komt 1 bij." verklapt niets.
- H4 min zonder stippen: types `bord` en `disco/typen` gebruiken nu `rekenTip(.., "")` en `minReactie(.., "")`; geen verwijzing meer naar stippen die er niet staan.
- N1 dubbele zin bij "Waar zie je een munt": `waarZie` geeft nog maar 1 zin plus 1 hint.
- N2 grammatica: "alsof er 1 bij komt" (minsommen), "er zijn meer appels" (rekenmix), "Ik heb al tot 10 geteld" (meer-minder), "Zoek de roze kraal eerder in de ketting en kijk welke kraal daarna kwam" (vormen): allemaal hersteld.
- N6: "sloeg je er 1 over", "telde je er 1 dubbel": hersteld. "tegenovergestelde" komt niet meer voor.
- N5: "Nu komen er nog 3 vragen van net terug" is vervangen door wisselzinnen (`terugAankondiging`).
- Naam hoogstens 2x: `naamMag` telt de eindkaart mee in `squla-hulp.ts`.
- Geen "Niet helemaal", geen pauze en geen keuzevraag op de actieve route: alle lessen zetten `synthesis` of `zetSynthesisHulp` aan. Geen naam in een fout-reactie of hint gevonden.
- Goed = korte bevestiging uit `bevestig()` (lijst van 16 korte woorden, nooit 2x dezelfde achter elkaar).

## FOUTEN (echt, nog open)

Aantal: 9 (3 midden, 6 laag).

### MIDDEN

1. `src/lib/lessen/tekstwijzigingen.json:23` (squla-splits-splitsen2-1)
   Zin: "Welk getal mist er nog." (3e regel van de nieuwe tekst, zonder vraagteken). Dit was punt N2 van de eindkeuring en is niet hersteld.
   Voorstel: "Welk getal mist er nog?"

2. `squla-rekenmix.tsx:635` (mix1, alle tel-vragen)
   Zin: "Ik heb al 5 voor je geteld. Tel daarna door tot het laatste." In de tel-tak (r. 631-662) staat geen `fout:`-functie, dus bij de eerste fout wordt er niets geteld of opgelicht. De zin past dan niet bij wat in beeld staat (tegen "woorden passen bij beeld"). Bij `squla-tellen.tsx:285` gebeurt dat wel.
   Voorstel: bij de eerste fout de eerste `begin` stukken laten oplichten (zoals in tellen), of de zin veranderen in "Tel verder na 5."
   Let op: alleen uit de code gehaald; niet op het scherm bekeken.

3. `squla-dagen.tsx:430`, `squla-huisnummers.tsx:268`, `squla-rekentaal.tsx:556` (eindkaart)
   Zinnen: "Alles goed, ${naam}!", "Super, ${naam}!", "Knap gedaan, ${naam}." Deze gebruiken `l.naam` zonder `naamMag(l)`. Samen met 2x in `bevestig()` kan de naam 3x in 1 les. De eindkeuring meldde dit; alleen `squla-hulp.ts` is hersteld.
   Voorstel: `const naam = l.naam && naamMag(l) ? l.naam : undefined;` zoals in `squlaEind`.

### LAAG

4. `squla-getallenlijn.tsx:131-132, 142-146` (reeks, terugtellen) en `:823, :860` (tegels); `squla-huisnummers.tsx:107-109`
   Zinnen: "Vlak voor deze plek hoort 5. 8 volgt daar niet op." + "Kijk naar het lampje met 5. Tel vanaf dat getal 1 verder." Het getal staat 2x, en de hint is in feite de som (5 + 1). Bij huisnummers: "Het huis ervoor heeft nummer 7. Tel vanaf dat nummer 1 verder." bij de vraag "Welk huisnummer komt na 7?". Dat is zo goed als het antwoord (punt M6/N8 van de eindkeuring, nog open).
   Voorstel: reactie en hint niet allebei het buurgetal laten noemen. Kort: "Kijk naar het getal links van de lege plek. Hoeveel verder moet je tellen?" (of alleen de zin over wat het kind koos, en de tip pas bij de tweede fout; Sara beslist).

5. `squla-klok.tsx:130, 131, 135` (reactieLees)
   Zinnen: "...Welk getal staat daar?", "...Naar welk getal wijst hij?", "Tussen welke 2 getallen staat hij?" De hint eindigt met een nieuwe vraag vlak voor dezelfde antwoordpoging (het kind moet daarna "7 uur" kiezen). Dit raakt 3.23 en de eigen `hint()`-regel ("geen vraag aan het eind"), die minsommen/plussommen wel toepassen via `zonderVraag`.
   Voorstel: als aanwijzing: "Kijk naar het getal waar de kleine wijzer staat, rechtsonder."

6. `squla-geld.tsx:280-286` (Tik op 2 groepjes geld)
   Zin: "Je koos 2 groepjes. Samen is dat 15 euro. Je zoekt 20 euro, dus je hebt nog 5 euro nodig. Zoek erbij een groepje met meer geld." Het kind koos al precies 2; "zoek erbij een groepje" klopt niet met de opdracht (altijd 2). De tak `ids.length === 1` komt nooit voor.
   Voorstel: "...je hebt nog 5 euro nodig. Probeer 2 andere groepjes." (en bij te veel: "Probeer 2 groepjes met minder geld.").

7. `squla-rekentaal.tsx:387, 407, 427` (grootst/half vol/kleinst)
   Zinnen: "Vergelijk de manden met elkaar." / "Vergelijk de appels met elkaar." De hint zegt dit al in de vraag en helpt niet verder (eerste fout moet een hint hebben die echt helpt).
   Voorstel: "Zoek de mand die het hoogst en het breedst is." / "Zoek de appel met de kleinste rondte." (zoals bij de pizza's in meten: "Zet je vinger op de rand...").

8. `squla-meten.tsx:1155, 1360` (en de tips daarbij)
   Zinnen: "Welk woord is het andere van leeg?", "Wat is het andere van licht?" "Het andere van ..." is geen normaal Nederlands; het woord "tegenovergestelde" is vervangen door iets onnatuurlijkers. Zelfde in `squla-tijd.tsx:1576-1582` ("Denk aan het andere van kort.").
   Voorstel: "Welk woord past juist bij een mand waar alles in zit?" / "Wat is juist niet licht, maar ...?" of "Denk aan een woord dat juist het omgekeerde zegt van kort." (Sara kiest; liefst zonder abstract woord).

9. Stijve zinnen: `squla-tellen.tsx:242, 248` en `squla-meer-minder.tsx:349`: "Zo veel als 12 bloemen staan er niet." en `squla-plussommen.tsx:307`: "Zet die 2 bij elkaar." (bedoeld: 2 getallen).
   Voorstel: "Er staan niet zo veel bloemen als 12." / "Tel 10 en 3 bij elkaar."

## RISICO (geen actieve fout, wel melden)
- `squla-hulp.ts:111-144` en `squla-uitleg.ts:~160-173` bevatten nog de oude route met "Niet helemaal", "Wil je hulp, of nog een keer proberen?" en "Zullen we even pauze nemen?". Die route is nu onbereikbaar omdat elke les `synthesis: true` of `zetSynthesisHulp(l)` zet. Eén nieuwe vraag zonder die vlag haalt de pauze meteen terug. Voorstel (Sara beslist): oude route verwijderen of een fout laten gooien.
- `squla-splitsen.tsx:45`: vragen zonder `toonAntwoord` nemen de oude route. De zes functies `huisVraag`, `tienvakVraag`, `parenVraag`, `machineVraag`, `shirtVraag` en `paalVraag` (r. 106-400) hebben dat niet maar worden nergens aangeroepen (dode code, getelde aanroepen: 1 per functie = alleen de definitie).

## NIET GECONTROLEERD
- Wat in beeld gebeurt bij de eerste fout (oplichten, tellen): alleen uit de code gelezen, geen schermfoto's.
- Welke zinnen hardop klinken (STEMZINNEN.md niet vergeleken).
- `tekstwijzigingen.json:3`: de nieuwe tekst "Ja, na vierentwintig komt vijfentwintig..." bevat getalwoorden. In de lesbron staat `{24:wit}`/`{25:wit}` (cijfers); het is niet vast te stellen of de vervanging als gesproken tekst of als zichtbare tekst wordt getoond. Als zichtbaar: strijdig met 3.20. Graag nakijken.
- De tweede fout bij slepen en tikken (alleen de code van `toonAntwoord` gelezen), en `squla-piraat.tsx` / `squla-splitsen.tsx` slepen-vragen niet allemaal tot in detail.
- De bestanden werden tijdens het lezen nog aangepast (regelnummers kunnen 1-10 regels verschuiven).
