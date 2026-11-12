# KEURING de 3 Synthesis-extra lessen (Tellen, Splitsen, Plussommen)

Onafhankelijke keurder, 12 november 2026, branch backup-squla (commits 35f8b9f, 03642f3, b17ceca, 67feff5). Niets
veranderd, niets online, geen helpers, hoogste id `les_uitkomsten` voor en na: **147**. Getest als Testkind.

## UITSLAG

| Les | Uitslag |
|---|---|
| Tellen extra (squla-tellen-fruit-1-gouden-extra) | GOEDGEKEURD |
| Splitsen extra (squla-splits-splitsen1-1-gouden-extra) | AFGEKEURD (1 harde fout, snel te herstellen) |
| Plussommen extra (squla-plus-bakkerij-1-gouden-extra) | AFGEKEURD (1 harde fout, 1 klein punt) |

Niets letterlijk van Synthesis gekopieerd (zie hieronder). Stof en getallen zijn die van de draaiboeken (Tellen: 8 en 7
fruit, peren en pruimen 3 + 4, maak 4 peren, lijstje 4/7/10; Splitsen: 3 + 2, nieuw totaal 7, zoek 2 delen, kies 8 of
10; Plussommen: tegels, totaal, samen 7 en 10, de som, omwisselen).

## Hoe ik gekeurd heb

- De 3 zinnenbestanden en de 3 fouttabellen helemaal gelezen (`squla-*-extra-zinnen.ts`, `FOUTTABEL-*-extra.md`).
- Kopie-controle: een eigen script (in de scratchpad, niet in het project) vergeleek elke zin van de 3 bestanden
  met `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md`, `splitsen.md` en `plussommen.md` op reeksen van 5 woorden. Treffers
  zijn alleen korte alledaagse zinnen of stukjes uit onze eigen draaiboeken, die zelf "in eigen woorden, nooit letterlijk
  of vertaald" zijn (draaiboek regel 11). Geen enkele zin is een Synthesis-zin. Het draaiboek is Sara's eigen
  vastlegging. Zie vraag V3.
- Fouttabel-scripts: alle 3 "in orde" (Tellen 23 rijen, Splitsen 20 rijen, Plussommen 38 rijen; "geen hint verklapt het
  antwoord", "geen opdracht in de zinnen bij de 2e fout"). FOUTTABEL-bestanden onveranderd na regenereren.
- Testscripts `goed,fout1,allefout` voor alle 3 (met schermfoto's): tot de eindkaart, geen hulphandje bij een keuzevraag,
  elke fout vastgelegd, niets in de database, 0 uitingen 2 keer. Tellen allefout: 10 denkfouten vastgelegd, 5 uitkomsten
  "samen-gedaan".
- Speelcontrole: GOED en ALLEFOUT. Tellen extra: 31 en 109 stappen, tot het eind. Splitsen extra: komt niet verder bij
  "3 en 2 is 1 manier om 5 te splitsen. Kun jij het ook op een andere manier" (plus en min tikken in de tekening, kan de
  speler niet). Plussommen extra: "alleen in de tekening te doen" bij het eerste tegel zetten. Dat zijn geen fouten (de
  per-les testen halen de eindkaart wel), wel handmatig nakijken.
- Schermfoto's bekeken als een kind: Tellen (het fruit staat netjes in een rooster, groot, getal in kleur van het fruit,
  het lijstje staat links boven, 10 pruimen in lila); Plussommen (tegels met hokjes, groot, elk getal een eigen kleur, het
  rooster is leeg en groot genoeg). Niets overlapt, geen kader, geen gezichtjes.
- Oude lessen onveranderd: `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: 0 verdwenen.

## HARDE FOUTEN

**H1. Splitsen extra: "Tik (weer) op het vinkje" in hints en in elke opdracht.** (BOUWREGELS 3.15, 14.15; REGELS-VOOR-
CONTROLEUR: "nooit 'Tik op het vinkje' in hints of uitleg", knop-uitleg alleen de eerste keer.)
- `squla-splitsen-extra-zinnen.ts` regel 168 (hint bij "de 2 delen samen te weinig/te veel"): "Verander een deel en tik weer
  op het vinkje." / "Maak een deel groter of kleiner en tik dan weer op het vinkje." / "Probeer een ander deel. Tik daarna
  weer op het vinkje." Dat is knop-uitleg in een hint, bij elke 1e fout.
- Dezelfde knop-uitleg staat in 4 opdrachten: regel 80 "Tik dan op het vinkje.", regel 83 en 97 en 99 "Tik op het vinkje als
  je klaar bent." Bliepo legt het vinkje dus 4 keer uit in 1 les. Per kind en per soort knop is 1 keer genoeg.
- Gevolg: het kind hoort dezelfde knopzin steeds opnieuw. Advies: alleen de eerste keer uitleggen, later "Klaar?" of
  niets; hints zonder het vinkje ("Verander een deel.").

**H2. Plussommen extra: de hint bij omwisselen verklapt het antwoord.** (BOUWREGELS 15.17; REGELS-VOOR-CONTROLEUR 5.)
- `squla-plussommen-extra-zinnen.ts` regel 147: "Het zijn dezelfde tegels. Ze liggen alleen anders. Tel de hokjes nog eens."
  Keuzes zijn 10, 9 en 11. Na keuze 9 blijven 10 en 11 over. "Dezelfde tegels" betekent "hetzelfde totaal als net", en Bliepo
  zei net "3 en 7 maken samen 10". De hint past dus bij 10 alleen. Dat is precies het voorbeeld uit de regel ("een zin die
  maar bij 1 keuze past"). De uitleg bij de 2e fout ("Ze liggen alleen anders. Het zijn nog steeds dezelfde hokjes.")
  mag dit wel zeggen, de hint niet. Advies: hint "Kijk naar de 2 tegels. Tel alle hokjes nog eens." en het
  "dezelfde tegels" alleen in de uitleg.
- Het fouttabel-script ziet dit niet, want het controleert alleen of de hint een richting noemt ("te veel", "meer"). Het script
  zou ook woorden als "dezelfde", "hetzelfde" kunnen controleren.

## KLEINE PUNTEN

**K1. Plussommen extra: het woord "hokjes" (11 keer in `squla-plussommen-extra-zinnen.ts`).** WOORDEN-GROEP3 noemt
"vakje" (en BOUWREGELS 14.33: dezelfde schoolterm overal). Op de tegels zijn het kleine vierkantjes; de gouden lessen
zeggen elders "vakje" voor een vak om in te zetten, en "stippen" voor de punten. "Hokjes" voor de vierkantjes op een tegel
is begrijpelijk maar niet op de lijst. Klein, geen blokkade.

**K2. Plussommen extra: een tekstfout in de fouttabel, niet in de les.** `FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md`
regel 66: bij "welke som hoort bij 4 en 6" staat bij de denkfout "(3 en 7 werd 37)". De les zegt dat niet tegen het
kind, het is alleen de uitleg voor Sara. Klein.

**K3. Tellen extra en Splitsen extra: "rooster".** De les zegt "rooster" voor het vak met vakjes. Dat is de term van het
draaiboek, overal hetzelfde, dus geen fout.

## Vragen voor Sara

**V1.** Stap 6 in Tellen extra (peren en pruimen samen) zegt bij keuze 6: "6 is dichtbij." en laat de richting weg, omdat
anders maar 1 keuze over zou blijven. Dat klopt met regel 15.17. Geen actie, alleen om te weten.

**V2.** In Tellen extra (stap 5) zegt Bliepo na een fout: "Je koos de appels. Dat zijn er 8." en de nummers komen op dat
fruit. Dat is het gedrag van Synthesis (draaiboek §3 B.2), maar het maakt het voor het kind makkelijk om het goede
fruit af te leiden (7 gevraagd, 8 gezien). Zo laten? Advies: ja.

**V3.** Negen korte zinnen in de extra lessen komen woord voor woord uit onze eigen draaiboeken (bijvoorbeeld "Weet je
welk getal dit is?", "Welke som heb je gemaakt?", "Zoek nog een manier om 7 te splitsen." "Tot nu toe telde je het fruit
dat er lag."). Die draaiboeken zijn al in eigen woorden. Het zijn gewone Nederlandse kinderzinnen, geen Synthesis-tekst.
Zo laten? Advies: ja.
