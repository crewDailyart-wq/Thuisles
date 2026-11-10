# KEURING gouden les Meten — squla-meten-oppervlakte-1-gouden ("Hoe groot is het?")

Onafhankelijke keurder, 10 november 2026, branch backup-squla, basis commit 06a1a3c (de bouwer). Kind-test: zie
KINDTEST-METEN-GOUDEN.md. Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt, geen
helpers ingezet. Gedeelde code (Lesscherm.tsx, BliepoTekst.tsx, lib/stem.ts) en de oude les niet veranderd. De halve
wijzigingen van een andere sessie (Tellen, Splitsen, gouden-pijl.ts, test-splitsen/test-tellen) niet aangeraakt en niet
gecommit.

## UITSLAG: GOEDGEKEURD (na 2 kleine herstellingen in deze les)

In 1 zin: de inhoud is precies die van Squla (12 vragen + 3 die terugkomen), elke vraag heeft precies 1 goed antwoord,
de hints verklappen niets, de kaarten en plaatjes zijn goed te zien en de les stopt nooit; er waren 2 kleine taalpunten,
die zijn hersteld en opnieuw getest. De melding van de bouwer (zin even wit, dan weer gedimd) komt uit gedeelde code, niet
uit deze les.

Telling: 0 ernstig, 0 middel, 2 klein (hersteld), 1 nieuwe vraag aan Sara (KEUZES Ronde 28b).

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (alles, vooral 3.7, 4, 5, 6.5, 7.6–7.9, 14.20–14.37, 15.1–15.30), LESRECEPT.md (alle
  "Geleerd bij"-blokken), BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F9), KEUZES Ronde 27b en 28, het draaiboek Meten
  (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meten.md, vooral §0–§8), de les, de zinnen, het gouden vlak, de oude les
  `squla-meten-oppervlakte-1` (alleen gelezen) en WEGGEHAALD.md.
- `npx tsx scripts/fouttabel-meten-gouden.ts`: reken-, verklap- en waarheidscontrole in orde, vóór en na mijn herstel
  (12 vragen, 57 foute antwoorden, 341 antwoorden op waarheid nagelopen). FOUTTABEL opnieuw gemaakt.
- `npm run opgaven`: groen. `REV=6efd812` en `REV=06a1a3c npm run inhoudsvergelijk`: 0 verdwenen.
- Speelcontrole vóór en na herstel: `F7=1 GOED=1` (59 stappen) en `F7=1 ALLEFOUT=1` (233 stappen), tot het eind, 0 fouten,
  F7 = 0, F8 = 0.
- `scripts/test-meten-gouden.mjs`: allefout op 1440×900 met schermfoto's (ONTWERP), fouten en woorden in een zichtbare
  Chrome met de echte stem via het lesoverzicht, goed (2×), wachten (2×), vangnet, anderefout, tik-door, kleur, en de
  nieuwe route **dichtbij** (zie punt 1).
- Schermfoto's van elk soort vraag, elke hint en elk samen voordoen zelf bekeken (de fout van Getallenlijn, onzichtbare
  kaarten, zit hier niet: alle plaatjes en kaartjes zijn te zien).
- `les_uitkomsten`: hoogste id vóór en na alles **143**. Er is niets bijgekomen.
- Vloeiend (`ALLEEN=squla-meten-oppervlakte-1-gouden npm run vloeiend`, gestart bij belasting 2,3, geen test ernaast):
  laptop 60 beelden/s, langste beeld 28 ms; trage telefoon 60 beelden/s, langste beeld 27 ms. Openen in de
  ontwikkelversie 4,2 s / 5,0 s (alleen een waarschuwing; op de echte site moet het onder 1 s, niet gemeten: niets online).

## Inhoud (15.21, 15.22) en rekenen (14.30, 11.9)

- Zelfde 12 vragen als `squla-meten-oppervlakte-1`, zelfde volgorde, tekeningen, goede antwoorden en keuzes (het script
  vergelijkt ze); daarna 3 die terugkomen (eerst wat mis ging, aangevuld met de reserve 1, 4, 5 van de oude les). Gezien in
  de route goed: "vraag1, vraag4, vraag5 -terug". De oude les en zijn vlak/tekeningen zijn sinds 34ac9eb niet veranderd.
- **Precies 1 juist antwoord** bij alle 12 vragen, nagerekend: schilderijen zon 9 / bloem 16 / huis 20 tegels en boot 6 /
  boom 12 / planeet 20 (alleen "zon/boot het kleinst" + "huis/planeet het grootst" klopt); tafels 2 < 4 < 6 < 9 plekken;
  muurtjes 2 < 4 < 6 en 3 < 5 < 7 stenen naast elkaar; gedraaid kaartje even groot; blauw 2 × 4 = geel 1 × 8 = 8
  (alleen "even groot" + "blauw is 8 hokjes" klopt); matten 2 × 2 = 1 × 4 en 2 × 5 = 1 × 10; tafels 5 × 2 = 10,
  3 × 3 = 9, 4 × 3 = 12.
- Getalkleur gemeten in Chrome: geel (tegels), oranje, groen, blauw (blaadjes, hokjes), wit (borden, puzzelstukken). Stenen
  rood in de zinnen over muurtjes (schermfoto).

## Hints en verklappen (15.17, 14.31, 14.36)

- Bij kiezen en kies er 2 blijven na eerste zin + hint altijd 2 keuzes over (script), behalve bij het gedraaide kaartje
  (2 keuzes, al aan Sara gevraagd: Ronde 28 punt 8). Geen zin noemt het antwoord. Bij typen nooit "1 te veel".
- Het rode rondje staat om wat Bliepo noemt (de bovenste rij, mat 1/2, kaartje 2, het vak waar de fout zit), nooit om het
  antwoord. Het handje wijst bij op volgorde alleen een leeg vak aan.
- Op volgorde met 3 muurtjes ("Na het muurtje van 2 stenen breed legde je het muurtje van 6 stenen breed. Zoek steeds het
  smalste muurtje dat nog over is."): de hint geeft de regel van de opdracht, niet de plek van een muurtje; het kind moet
  nog zelf vergelijken. Oordeel: mag.
- Klein, geen fout: de denkfout `kleiner-erna` kan nooit voorkomen (vóór de eerste fout liggen altijd de kleinste al goed,
  dus het volgende plaatje is altijd groter). Het is dode code; laten staan.

## Beoordeeld op verzoek

- **"het muurtje van 6 stenen" → "het muurtje van 6 stenen breed":** terecht. Het muurtje heeft 18 stenen (6 naast
  elkaar, 3 hoog; schermfoto), dus "van 6 stenen" was niet waar. "Een muurtje van 6 stenen breed" is gewoon Nederlands
  (zoals "een muur van 2 meter hoog") en past bij "van smal naar breed". Mag volgens 15.26 en staat in KEUZES Ronde 28.
- **Vinkje in plaats van de gele gloed:** verdedigbaar. "Meten laten liggen" (8 nov, 3e ronde) ging over het niet
  veranderen van de bestaande Meten-lessen; de oude les houdt zijn gloed. De gouden les is een nieuwe versie naast de oude
  (15.8) en volgt laag 1 van alle gouden lessen (6.5, 7.6, 7.8a: tikken op iets in beeld = vinkje, geen gloed om de
  keuze). 15.21 en 15.25 zetten Meten na 9 nov in de rij van gouden lessen. De bouwer heeft het eerlijk aan Sara gevraagd
  (Ronde 28 punt 2). Geen reden om af te keuren.
- **15.16 (draaiboek past maar deels):** zelfde oordeel als bij Getallenlijn: netjes gemarkeerd als "eigen invulling",
  het deel dat wel van Synthesis komt (tellen met een eigen zin per fout getal, aantikken met een nummer, samen tellen,
  "10 blaadjes" na goed, niets bij snel, handje alleen bij doe-opdrachten) klopt met §0, §3 C en §3 G. Sara beslist.
- **De melding van de bouwer ("1 zin even wit, dan gedimd", F7):** 1 keer laten gebeuren en uitgezocht. Het komt uit de
  gedeelde stem: elke zin vraagt eerst aan de site of Ruth hem al heeft; bij een drukke computer duurde dat 4,1 s. Na
  2,5 s maakt de gedeelde tekst de wachtende zin wit, en als de browserstem daarna toch begint, weer gedimd. Dit kan in
  elke les gebeuren, niet alleen in Meten. Niet veranderd (gedeelde code). Vraag aan Sara: KEUZES Ronde 28b.

## Per regel: wat afwijkt

| Regel | Oordeel |
|---|---|
| 15.22 inhoud Squla / 14.30 1 juist antwoord | goed |
| 15.9 fouttabel / 14.36–14.37 | goed (57 rijen; eerste en laatste fout per vraag gespeeld, de rest met het script) |
| 15.17 niets verklappen | goed |
| 15.11 2 pogingen, voortgang | goed (goed in één keer / goed na een fout / samen gedaan; niets in de database zonder kind) |
| 15.18 nooit stoppen | goed (ook vangnet: 20 s niets → "Kijk, …", geen "Ja") |
| 15.19 hulphandje | goed: alleen bij op volgorde en de kleine stap, ± 6 s na de opdrachtzin, 1 zin, geen knop; bij kiezen en typen niets |
| 15.27 pijl | goed: nooit wachten op de pijl; geen pijl bij vraag, opdracht, handje en eindkaart; tik = binnen 82–571 ms iets nieuws |
| 15.28 / F7, 15.29 / F8 | F8 0 in elke run; F7 1 keer gezien bij een trage stem (gedeelde code, zie boven) |
| 15.30 / F9 vaste zones | goed: 0 overlap, 0 sprongen van tekst en pijl, speelvlak 93 px links van het tekstvak, eindkaart 0 woorden eronder |
| 3.7 woorden mee met de stem | eerste woord 46 ms na de start (goed); einde 10 van 12 binnen ± 150 ms (gedeelde schatting, bekend) |
| 3.12 / 3.11 woorden en zinnen | **klein, hersteld** ("de rijen eronder" bij 1 rij, punt 2) |
| 5.10 / BLIEPO §2 geen zin 2 keer | **klein, hersteld** ("Dat is dichtbij." 2 keer, punt 1) |
| 3.15 knop 1 keer uitleggen | "Tik op 2 kaartjes." en "Sleep een plaatje naar een leeg vak. Tikken mag ook." 1 keer; het vinkje zelf wordt niet uitgelegd ("mag", zoals Meer-minder en Getallenlijn) |
| 3.16 gebaren | goed: Bliepo "verspringt" alleen bij "Van klein naar groot." (gebaar groot/klein), overlap 0 |
| 3.20 cijfers | goed |
| 4 begin | goed: geen startvraag (draaiboek §1), groet + uitlegdeel in 1 stuk |
| 5.3 rood/groen, geen rood op keuze, geen fout-geluid | goed |
| 6.1 / HARDE REGEL 5 invulvak | goed: echt invoerveld, `inputMode="numeric"`, `pattern="[0-9]*"`, letters eruit, `useInBeeld` |
| 6.5 vinkje bij tikken in beeld | goed (nog een tik haalt het weg; gezien) |
| 6.10 heel snel / tempo | goed: niets bij snel; door na gemiddeld 732–797 ms |
| 3.17 naam | goed: groet + hooguit 1 lof |
| 2.1, 2.2, 14.27 kleur | goed |
| 1.1–1.4, 1.23, 14.23 beeld | goed (alles zichtbaar en telbaar; plek van het goede kaartje wisselt) |
| 10.1 vloeiend | goed: 60 beelden/s, langste beeld 28 ms (laptop) en 27 ms (trage telefoon) |
| F1–F9 | na herstel geen gevonden in deze les (F7: gedeelde oorzaak, zie boven) |
| Harde regel 2 | goed: 143 vóór en na |

## Gevonden punten (allebei hersteld in deze les)

1. **KLEIN — dezelfde eerste zin 2 keer bij 1 vraag.** Typt het kind bij "Hoe groot is de tafel?" eerst 9 en dan 11, dan
   zei Bliepo 2 keer "Dat is dichtbij." (de zin werd per vraag gekozen, niet per poging). Herstel in
   `squla-meten-gouden.tsx` en `squla-meten-gouden-zinnen.ts`: bij de 2e fout met een ander getal vlak naast het antwoord
   zegt Bliepo "Je zit er weer vlak naast." Test: nieuwe route `dichtbij` in `scripts/test-meten-gouden.mjs` (bij alle 6
   typvragen 2 verschillende eerste zinnen).
2. **KLEIN — meervoud bij 1 rij.** Bij de tafel van 2 rijen zei de "weer"-zin "De rijen eronder horen er ook bij." Nu bij 2
   rijen "De rij eronder hoort er ook bij." (ook de 2 andere zinnen met "rijen onder/eronder" volgen nu het aantal rijen).

Ook aangepast: FOUTTABEL-squla-meten-oppervlakte-1-gouden.md (opnieuw gemaakt), LESRECEPT.md ("Geleerd bij de keuring
Meten"), KEUZES-VOOR-SARA.md (Ronde 28b).

## Dezelfde fout in andere gouden lessen (alleen geteld, niets veranderd)

- **Dezelfde eerste zin bij 2 verschillende foute antwoorden in 1 vraag:** 0 van de 8. Tellen, Splitsen, Meer-minder,
  Huisnummers en Getallenlijn zetten het gekozen getal in de zin; de klok gebruikt dan een "weer"-zin.
- **"Rijen eronder" terwijl er maar 1 rij is:** 0 van de 8 (alleen Meten praat over rijen eronder).
- **De zin even wit en dan weer gedimd door een trage stem:** kan in alle 9 gouden lessen (gedeelde code); alleen gemeten
  in Meten.
