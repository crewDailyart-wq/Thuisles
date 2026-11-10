# KEURING gouden les Huisnummers — squla-huisnummers-gouden ("Huisnummers: wat komt erna?")

Onafhankelijke keurder, 10 november 2026, branch backup-squla, basis commit 49377fc (de bouwer). Kind-test: zie
KINDTEST-HUISNUMMERS-GOUDEN.md. Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt,
geen helpers ingezet. Gedeelde code (Lesscherm.tsx, BliepoTekst.tsx, lib/stem.ts) en de oude les niet veranderd.

## UITSLAG: GOEDGEKEURD (na 2 herstellingen in deze les)

In 1 zin: de inhoud is precies die van Squla (17 vragen), elke vraag heeft precies 1 goed antwoord, de hints verklappen
niets en de les stopt nooit; ik vond 1 middelgroot punt (bij typen zei Bliepo soms iets dat niet waar is) en 1 klein
taalpunt, allebei hersteld in de bestanden van deze les.

Telling: 0 ernstig, 1 middel (hersteld), 1 klein (hersteld), 0 nieuwe vragen aan Sara (de 4 vragen van Ronde 26 blijven
open; mijn advies staat in KEUZES Ronde 26b).

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (hoofdstuk 1–15, vooral 3.7 en 15.x), LESRECEPT.md (alle "Geleerd bij"-blokken),
  BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F9), KEUZES Ronde 26, het draaiboek Huisnummers, de les, de zinnen, het
  gouden vlak, de oude les `squla-huisnummers` (alleen gelezen) en de git-diff van de bouwer.
- `npx tsx scripts/fouttabel-huisnummers-gouden.ts`: reken- en verklapcontrole in orde (17 vragen, 47 foute antwoorden),
  vóór en na mijn herstel. **Nieuw: waarheidscontrole** (325 nummers; bij typen elk getal van 0 tot 99). Op de versie van de
  bouwer vond die 215 zinnen die niet waar zijn; na herstel 0. FOUTTABEL opnieuw gemaakt.
- `npm run opgaven`: groen. `REV=571f3fe npm run inhoudsvergelijk`: 0 verdwenen.
- Speelcontrole `F7=1 npm run speel` GOED (70 stappen) en ALLEFOUT (179 stappen): allebei tot het eind, 0 fouten, F7 = 0,
  F8 = 0.
- `scripts/test-huisnummers-gouden.mjs`: alles fout (1440×900 en met `ONTWERP=1` op 1024×768), fouten (zichtbaar, echte
  stem, via het lesoverzicht), typen buiten de tabel (nieuwe route `typvrij`), lang wachten, vangnet, Enter, kleur, tik op
  de pijl, woorden (zichtbaar, echte stem). Uitslagen hieronder en in de KINDTEST.
- `les_uitkomsten`: hoogste id vóór en na alles **143**. Er is niets bijgekomen.
- Vloeiend (`ALLEEN=squla-huisnummers-gouden npm run vloeiend`, gestart bij belasting ± 4, geen test ernaast): laptop
  60 beelden/s, langste beeld 30 ms; trage telefoon 60 beelden/s, langste beeld 36 ms. Openen in de ontwikkelversie
  4,7 s / 3,3 s (alleen een waarschuwing; op de echte site moet het onder 1 s, dat is nog niet gemeten: niets online).
- Na mijn herstel opnieuw: fouttabel-script, opgaven, inhoudsvergelijk en de speelcontrole GOED (63 stappen) en ALLEFOUT
  (200 stappen): alles in orde, F7 = 0.

## Inhoud (15.22) en rekenen (14.30, 11.9)

- Zelfde 17 vragen als `squla-huisnummers`, zelfde volgorde, straten, goede antwoorden en keuzes (script vergelijkt het per
  vraag met de oude les). De oude les en zijn vlak zijn sinds 34ac9eb niet veranderd (git diff leeg).
- Elke straat telt steeds 1 verder met het antwoord op het gat; het antwoord staat niet al in de straat; bij elke keuze- en
  sleepvraag staat het goede getal precies 1 keer tussen de keuzes. **Precies 1 juist antwoord** bij alle 17 vragen. Bij
  typen telt alleen het juiste getal.
- De vraagzinnen zijn die van de oude les. Bij terugtellen zegt Bliepo de reeks nu huis voor huis met het rondje (de oude
  les zei "29, 28, 27…" in 1 zin); inhoud gelijk.
- Wat weg is (startvraag "Kun je verder tellen…?" met uitleg na Nee) staat in WEGGEHAALD.md; goed volgens hoofdstuk 4
  (draaiboek heeft geen startvraag).

## Hints en verklappen (15.17, 14.31, 14.36)

- Per fout antwoord blijven er na eerste zin + hint altijd 2 keuzes over (script). Geen zin noemt 2 buren ("tussen 15 en
  17"); die stond in de oude les en is terecht herschreven. Waar een zin toch maar 1 keuze zou laten, zegt Bliepo alleen
  "Huis 26 past niet op deze plek."
- Het rode rondje staat om het buurhuis, nooit om het gat of het antwoord. Het hulphandje wijst bij slepen de lege plek aan,
  niet het goede huis. Het nummer komt pas op het bordje bij het samen voordoen (15.11).

## Per regel: wat afwijkt

| Regel | Oordeel |
|---|---|
| 15.22 inhoud Squla / 14.30 1 juist antwoord | goed |
| 15.9 fouttabel / 14.36–14.37 | goed na herstel (47 rijen; alle keuzes gespeeld; bij typen ook getallen buiten de tabel) |
| 5.10 / 15.9 "zeg alleen wat zeker is" | **middel, hersteld** (punt 1) |
| 15.11 2 pogingen, voortgang | goed (goed in één keer / goed na een fout / samen gedaan; niets in de database zonder kind) |
| 15.17 niets verklappen | goed |
| 15.18 nooit stoppen | goed (ook vangnet: 20 s niets of 3 keer een ander huis) |
| 15.19 hulphandje | goed: alleen bij slepen en de kleine stap, ± 6 s na de opdrachtzin, 1 zin, geen knop; niets bij kiezen en typen |
| 15.27 pijl | goed: nooit wachten op de pijl, geen pijl bij vraag/opdracht/kaart; tik op de pijl = meteen door |
| 15.28 / F7 | goed: 0 in elke run (ook gedimd-en-weer-gedimd: 0, ook bij een drukke start) |
| 15.29 / F8 | goed: 0 (ook met de echte stem) |
| 15.30 / F9 vaste zones, 1.15 | goed: 0 overlap, 0 sprongen, speelvlak links van het tekstvak, eindkaart 0 woorden eronder |
| 3.7 woorden mee met de stem | eerste woord gemiddeld 60 ms na de start (goed); einde niet aantoonbaar binnen ± 150 ms met de Google-stem (gedeelde schatting, bekend sinds Minsommen; zie KINDTEST) |
| Regel 5 / 6.1 typen | goed: echt invulvak op het bordje, `inputMode="numeric"` + `pattern`, letters gefilterd, `useInBeeld`, vinkje pas met een nummer, Enter werkt, geen "Weet ik niet" |
| 3.15 knop 1 keer uitleggen | goed: "Klaar? Tik dan op het vinkje." alleen bij de eerste typvraag |
| 14.33, 3.11 taal | **klein, hersteld** (punt 2) |
| 2.1, 2.2, 14.27 kleur | goed: huisnummers wit in de zin, zoals op het bordje |
| 5.3 rood/groen, geen rood op keuze, geen fout-geluid | goed |
| 6.10 heel snel / tempo | goed: niets bij snel (draaiboek: niets bij verder tellen); door na ± 0,72 s |
| 3.17 naam | goed: groet + hooguit 1 lof |
| 3.20 cijfers | goed ("Er mist 1 huis", "1 huis te ver") |
| 1.1–1.3, 1.4 | goed: geen mensen, gezichtjes of kaders; huizenplaatjes zoals de oude les |
| 1.23 plek goede antwoord wisselt | goed (keuzes en losse huizen elke vraag geschud) |
| 10.1 vloeiend | goed: 60 beelden/s, langste beeld 30 ms (laptop) en 36 ms (trage telefoon) |
| F1–F9 | geen gevonden in deze les (na herstel) |
| Harde regel 2 | goed: 143 vóór en na |

## Gevonden punten (beide hersteld in deze les)

1. **MIDDEL — bij typen zei Bliepo soms iets dat niet waar is** (15.9: "zeg alleen wat zeker is"; 3.12: woorden passen bij
   het beeld). Vraag 11 (?, 30, 31), getypt 92: "De nummers hier beginnen met een 2." Bij de typvragen 4, 11 en 16
   (het gat aan het begin of eind van de straat) zei Bliepo bij een getal buiten de tabel "aan het begin/eind van de
   straat" en "Het vraagteken staat midden in de straat.", of "Voor 17 komt een nummer met een 2 vooraan." (215 zinnen).
   Herstel in `squla-huisnummers-gouden-zinnen.ts`: die zinnen alleen als ze waar zijn; nieuwe denkfout `te-ver`
   ("25 ligt te ver van 30 af.") en `verkeerde-richting` ook bij erna ("13 komt voor 17. We zoeken het nummer erna.");
   de 10-ernaast-zin gaat over het buurhuis van de vraag; uitleg "Het nummer dat we zoeken, begint met een 4." in plaats van
   2 keer "Na 39 komt …". Het fouttabel-script controleert het nu (waarheidscontrole).
2. **KLEIN — "Je koos weer …" bij typen of slepen** → "Je typte weer …" / "Je sleepte weer …" (BLIEPO-KARAKTER §2).

Ook aangepast: `scripts/test-huisnummers-gouden.mjs` (route `typvrij`; duidelijker melding als de link in het
lesoverzicht niet onder de muis ligt; die kwam 2 keer bij het laden van het overzicht, de 3e keer niet).

## Dezelfde fout in andere gouden lessen (alleen gemeten, niets veranderd)

- **Zin bij een fout die niet waar is voor een antwoord buiten de tabel:** kan alleen bij typen. **0 van de 6** andere
  gouden lessen (klok, Tellen, Splitsen, Plussommen, Minsommen, Meer-minder) hebben typen; daar zijn alle antwoorden
  vaste keuzes of dingen en hun fouttabel-scripts lopen alle foute antwoorden langs. Wel in LESRECEPT.md gezet voor de
  volgende lessen met typen.
- **"Je koos weer" bij slepen:** in Splitsen al goed ("Je legde er weer …"); de andere lessen hebben geen typen; bij slepen
  in Splitsen al hersteld. 0 van de 6.
