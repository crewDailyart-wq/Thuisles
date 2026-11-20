# Keuring Ronde 53 en daarna (20 november 2026)

Onafhankelijke keuring van wat vandaag is veranderd (KEUZES-VOOR-SARA Ronde 53 punt 1 t/m 4, Getallenlijn, Klok,
Huisnummers, de pijl in het lesscherm en de streepjes op letters). Alleen gekeken en getest; er is niets aan lessen,
code of zinnen veranderd. Getest als Testkind, 1 browser tegelijk, niets online, database alleen gelezen
(0 nieuwe regels in les_uitkomsten). Vloeiendheid en telefoon niet gemeten (komt aan het eind).

## Kort: per les

| Les | Uitslag |
|---|---|
| Tijd (dagkaarten rechts) | **Goed.** Kaarten staan rechts onder Bliepo's zin; niets raakt de zin, Bliepo of het vinkje. Wel 1 puntje voor Sara (vinkje op de weekendkaart). |
| Minsommen (knoppen rechts) | **Goed.** Knoppen rechts onder de zin, niets overlapt, kleuren van de getallen kloppen. |
| Plussommen (knoppen rechts) | **Goed.** Idem. Kaartjes bij de toonbank blijven in het beeld (mag: voorwerpen). |
| Tellen extra | **Goed.** "×" in het lijstje, Bliepo zegt "4 keer appel, 7 keer peer en 10 keer pruim", nieuwe pruim duidelijk anders dan de appel (ovaal, paars, geen blaadje, geen witte rand), na een fout blijft al het fruit gewoon zichtbaar. De melding "zin 2 keer gestart" (F8) is **niet echt**: 2 keer gemeten (goed en alles fout), allebei 0. |
| Getallenlijn | **Goed.** Bij "het dichtst bij" zegt Bliepo nu "tellen", geen "sprongen" zonder lijn. "Sprongen" alleen nog als de lijn in beeld staat (samen springen). |
| Klok | **Niet goed.** De 2 herstelde zinnen kloppen, maar dezelfde soort fout zit nog in 6 andere zinnen (zie hieronder). |
| Huisnummers | **Goed.** De huizen om te slepen staan op een stoep, niet meer in de lucht. |
| Pijl (alle lessen) | **Goed.** Steekproef Vormen, Dagen, Meten, Splitsen, Tijd, Minsommen, Plussommen, Getallenlijn, Klok: "pijl weg en terug": 0 keer. Punten 1 t/m 4 van 15.51 kloppen nog (pijl komt mee met de zin, vanzelf door na ±0,7-0,8 s, geen pijl bij stil goed, geen pijl boven leeg vak). |
| Streepjes op letters | **Goed.** Geen "én", "vóór", "ná" meer in wat een kind ziet of hoort in de gouden lessen (ook de extra lessen). Alleen nog in uitleg voor bouwers in de code en in 2 interne woorden die het kind niet ziet (zie onder). |

## Wat nog echt fout is

1. **Klok: zinnen noemen iets wat niet in beeld staat** (zelfde fout als de bezorgbus bij de bakkerij, 15.36; volgens
   de vaste afspraak "wat Sara over 1 les zegt, geldt overal"). Per klok staat er maar 1 plaatje in beeld (`ding`):
   - `src/components/les/lessen/squla-klok-gouden-zinnen.ts:581` "De zon staat hoog. De bus rijdt weg." (alleen de zon in beeld, geen bus)
   - `:584` "De bus haalt nieuwe broodjes bij de bakkerij." (alleen de bakkerij, geen bus)
   - `:587` "De zon schijnt. De bus rijdt naar de eerste halte." (alleen de zon; geen bus, geen halte)
   - `:588` "De bus komt bij de eerste halte." (wel de bus, geen halte)
   - `:590` "De bus komt bij de tweede halte." (wel de bus, geen halte)
   - `:591` "De bus is terug bij de bakkerij." (alleen de bakkerij, geen bus)
   Het herstel noemde klok 5 en 12 juist goed "omdat de bakkerij in beeld staat", maar de bus staat daar niet.

Verder niets echt fout gevonden in de punten van vandaag.

## Kleine dingen (geen fout, wel genoteerd)

- Bij een breed scherm (1280 breed) loopt 1 regel van Bliepo tot bijna tegen de rand van het scherm:
  "Nu haalt de machine er 4 af." (Minsommen) en "Welk kaartje hoort bij 5 + 3?" (Plussommen). Alles is leesbaar.
- In de klok wacht de les 2 keer ±2 s (in plaats van ±0,7 s) voordat de volgende vraag komt; in Splitsen 1 keer
  1,5 s na "Kijk, ik doe het even voor." (daar komt een animatie; mag volgens 15.51 punt 2). De test keurt dit goed.
- Niet zichtbaar voor het kind: het woord "vóór" in een interne foutomschrijving
  (`src/components/les/lessen/squla-huisnummers-gouden-zinnen.ts:547`) en "goed in één keer" als naam van een uitkomst
  bij het bewaren (in alle gouden lessen). Als dit later op een ouderscherm komt, dan daar nog aanpassen.

## Wat Sara nog moet beslissen

1. **Klok:** mogen de 6 zinnen hierboven worden aangepast aan wat er in beeld staat (bijvoorbeeld "De zon staat hoog."
   zonder bus, of het plaatje van de bus erbij)? Advies: ja, de zin aanpassen.
2. **Tijd, vinkje op de weekendkaart:** het groene vinkje staat over een deel van het naambordje (bij "vrijdag" is
   de helft van het woord weg). Het kind kan zijn eigen keuze dan niet goed meer lezen. Ook zijn de weekendkaarten
   vrij klein (kleine letters). Advies: vinkje boven de kaart zetten; kies jij of het zo mag blijven.
3. **Tellen extra, gekozen soort fruit:** de gekozen regel in het lijstje krijgt een witte rand en een lichte
   achtergrond, plus een vinkje. Volgens 7.8a krijgt een gekozen keuze alleen een vinkje. Dit zat er al sinds
   12 november (niet van vandaag). Advies: alleen het vinkje.
4. **Plussommen, de kaartjes bij de toonbank** zweven boven de kassa en de toonbank, niet erop (15.33). Ook niet van
   vandaag. Zo laten of op de toonbank zetten?

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npm run opgaven` | in orde |
| `npm run stemdubbel` | alleen de bekende "1." en "11." (Ruth-opnames met het woord 2 keer) |
| `REV=HEAD npm run inhoudsvergelijk` | niets verdwenen |
| `npx tsc --noEmit` | in de lescode alleen de bekende fout `squla-rekenmix-gouden-zinnen.ts:332`; de overige meldingen zitten in oude reservekopieën (`backups/`, `output/`), niet in de site |
| Speelcontrole GOED en ALLEFOUT: Tijd, Minsommen, Plussommen, Tellen extra, Getallenlijn, Klok, Huisnummers | alle 14 tot het eind, 0 fouten (F16 0, 15.47 0, F11 0) |
| Tellen extra met F8-teller (GOED en ALLEFOUT) | F8 0 en F7 0, beide tot het eind |
| `test-tijd-gouden.mjs` (allefout met foto's + goed, ontwerpcontrole 1280x720) | Alles in orde; kaart over zin 0, over Bliepo 0, buiten het vak 0 |
| `test-minsommen-gouden.mjs`, `test-plussommen-gouden.mjs` (allefout, foto's, 1280x720) | Alles in orde, overlap 0 |
| `test-tellen-extra-gouden.mjs` (goed, fout1, allefout, stil) | tot de eindkaart, database niets bijgekomen |
| `test-getallenlijn-gouden.mjs` (allefout, foto's) | Alles in orde |
| `test-huisnummers-gouden.mjs` (allefout, foto's) | na 10 minuten gestopt (werkwijze) bij vraag 17 van 17, geen fout tot dan; speelcontrole wel tot het eind |
| `test-klok-gouden-pijl.mjs` (nee-goed, foto's) | Alles in orde (F8 0, pijl weg en terug 0) |
| Pijl-steekproef `test-vormen/dagen/meten-gouden.mjs` (goed en allefout) | Alles in orde (knippertest 0) |
| `test-splitsen-gouden.mjs` | route goed in orde (pijl weg en terug 0); route allefout na 10 minuten gestopt (werkwijze), geen fout tot dan |

Chrome: mijn eigen testvensters zijn allemaal dicht. Het oude Chrome-proces 99416 (van een eerdere klok-test,
draait al 14 uur) staat er nog; dat is niet door deze keuring gestart en niet gestopt.
