# KEURING gouden les Minsommen — squla-min-machine-1-gouden ("Minsommen: hoeveel over?")

Onafhankelijke keurder, 10 november 2026, branch backup-squla, basis commit 91b3981 (de bouwer). Kind-test: zie
KINDTEST-MINSOMMEN-GOUDEN.md. Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt,
geen helpers ingezet, gedeelde code (stem.ts, Lesscherm.tsx, BliepoTekst, minvlak) niet veranderd.

## UITSLAG: GOEDGEKEURD (na 2 kleine herstellingen in deze les)

In 1 zin: de inhoud is precies die van Squla, elke fout krijgt een reactie die bij de denkfout past zonder het
antwoord te verklappen, de les stopt nooit en de teller verraadt niets; ik vond 2 kleine dingen die ik in de les zelf
heb hersteld, en 1 middelgroot punt dat in het gedeelde lesscherm zit (eindkaart over de tekst).

Telling: 0 ernstig, 0 middel in deze les, 2 klein (hersteld), 1 middel gedeeld (open bij Sara), 2 vragen aan Sara.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (alles), LESRECEPT.md, BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F9),
  KEUZES Ronde 24, het draaiboek Minsommen, de les, de zinnen, het gouden vlak, de oude les (alleen gelezen).
- `npx tsx scripts/fouttabel-minsommen-gouden.ts`: rekencontrole en verklapcontrole in orde (15 vragen, 30 foute
  antwoorden), vóór en na mijn herstel. FOUTTABEL opnieuw gemaakt.
- `npm run opgaven`: groen. `REV=920a42a npm run inhoudsvergelijk` (stand vóór de bouw): 0 verdwenen.
- Speelcontrole (`F7=1`, GOED en ALLEFOUT): allebei tot het eind, 0 fouten, F7 = 0, F8 = 0 (vóór en na herstel).
- `scripts/test-minsommen-gouden.mjs` alle routes (kleur, goed, fouten, allefout, wachten, tik-door, woorden): alles in
  orde na herstel. Overlap- en sprongtest (`ONTWERP=1`) op 1440×900, 1280×720, 1536×864 en 1024×768: alles in orde.
- Kind-test zichtbaar met de echte stem via het lesoverzicht, en zonder venster met schermfoto's (KINDTEST).
- Eindkaart in alle gouden lessen gemeten met een kopie van de speelcontrole (alleen gemeten).
- `les_uitkomsten`: hoogste id vóór en na alles **143**. Er is niets bijgekomen.
- Vloeiend: **niet opnieuw gemeten**; de computer was niet rustig (belasting 4 tot 20). Mijn herstel is alleen tekst en
  1 CSS-maat (geen Phaser). De bouwer mat in rust: laptop 60 beelden/s (langste 29 ms), trage telefoon 60 (46 ms).

## Rekenen (14.30, 11.9)

Elke vraag nagerekend: 10−3=7, 10−5=5, 10−1=9, 10−4=6, 10−2=8, 8−5=3, 9−3=6, 7−3=4, 10−6=4, 6−4=2, 9−6=3, 8−4=4,
6−5=1, 10−5=5, 7−5=2. Bij elke vraag staat het juiste antwoord precies 1 keer tussen de 3 keuzes en geen andere keuze
is ook goed: **precies 1 juist antwoord**. Inhoud gelijk aan `squla-min-machine-1` (zelfde 15 vragen, volgorde,
getallen en keuzes).

## Hints en verklappen (15.17, 14.31, 14.36)

- Per fout antwoord nagelopen hoeveel keuzes er na eerste zin + hint overblijven: altijd 2 na de 1e fout. Waar
  "meer dan"/"minder dan" maar 1 keuze zou laten (9−3 koos 7, 10−6 koos 5, 6−5 koos 2, 7−5 koos 3) zegt Bliepo alleen
  "Je koos …" en hoe je terugtelt. Geen hint noemt of toont het antwoord; het rode rondje staat om het getal dat eraf
  gaat, nooit om het antwoord.
- Na de 2e fout mag de richting, want Bliepo doet het meteen samen voor en het antwoord komt dan pas in beeld (15.11).
- "Weer" alleen bij dezelfde denkfout én als de 1e keer de richting genoemd werd; hetzelfde antwoord 2 keer zonder
  richting = "Je koos weer 7." Gezien in de kind-test.

## Per regel: wat afwijkt

| Regel | Oordeel |
|---|---|
| 15.22 inhoud Squla | goed |
| 15.11 2 pogingen, voortgang | goed (goed in één keer / goed na een fout / samen gedaan, denkfouten bewaard in de pagina; niets in de database bij Testkind zonder koekje) |
| 15.20 teller | goed: 0 van ± 260 metingen met teller tijdens een vraag |
| 15.19 hulphandje | goed: alleen bij "haal weg", na ± 6 s, 1 zin, geen knop |
| 15.27 pijl | goed: nooit wachten op de pijl, geen pijl bij vraag/opdracht/kaart; tik op de pijl stopt meteen (62–155 ms) |
| 15.28 / F7 | goed: 0 |
| 15.29 / F8 | goed: 0 (ook met de echte stem) |
| 15.30 / F9 vaste zones | goed in deze les (0 overlap, 0 sprongen, 4 schermmaten). **Wel: de eindkaart staat over 1–4 woorden van de laatste zin** (gedeeld lesscherm, zie punt 3) |
| 3.7 woorden mee met de stem | eerste woord binnen ± 50 ms; einde van de zin niet aantoonbaar binnen ± 150 ms met de Google-stem (bekend, KEUZES Ronde 24) |
| 3.11 / 3.12 zelfde woorden | **klein, hersteld** (punt 1) |
| 5.10 afwisselen | **klein, hersteld** (punt 1) |
| 1.15 niets raakt iets anders | **klein, hersteld** (punt 2); eindkaart open (punt 3) |
| 2.1, 2.2, 14.27 kleur | goed, gemeten in Chrome: machine 10 roze (255,159,210), 3 geel (255,224,102); bord en midden wit |
| 3.17 naam | goed: groet + hooguit 1 lof |
| 3.20 cijfers | goed ("Er gaat er nog 1 af", "Tik op 1 stip") |
| 6.10 heel snel / tempo | goed: niets bij snel (Min); reactie 0,25 s; door na ± 0,75 s (na goed bij de machine 2,5–5 s, bekend: KEUZES Ronde 24 vraag 1) |
| 1.23 plek goede antwoord | goed (geschud) |
| 1.27 geen "Weet ik niet" | goed |
| 5.3 rood/groen, geen rood op keuze | goed (schermfoto's) |
| 14.23 kijk als een kind | goed (zie KINDTEST) |
| F1–F9 | geen gevonden in deze les |
| Harde regel 2 | goed: 143 voor en na |

## Gevonden punten

### Klein (hersteld in deze les)

1. **Uitleg na de 2e fout bij de machine zei "Er blijven … over"**, terwijl de vraag "komen eruit" zegt (3.11, 3.12),
   en het was overal dezelfde zin (5.10). Nu: machine "Er komen meer blokjes uit dan 6." / "Er komen er meer dan 6
   uit."; bord en midden "Er blijven meer over dan 2." / "Er blijft meer dan 2 over." (en met "minder").
   Bestand: `squla-minsommen-gouden-zinnen.ts`; FOUTTABEL opnieuw gemaakt; reken- en verklapcontrole in orde.
2. **Het rode rondje om het getal in de som in het midden raakte het min- en is-teken** (1.15). Nu iets smaller
   (`squla-minsommen-gouden.module.css`). Schermfoto na herstel: vrij van de tekens.

### Middel, gedeeld (niet in deze les; open bij Sara)

3. **De eindkaart staat over 1–4 woorden van Bliepo's laatste zin** (1.15, 15.30). De kaart en het tekstvak komen uit
   het gedeelde Lesscherm.tsx. Gemeten: Minsommen 1–4 woorden, Tellen 4, Splitsen 3, Plussommen 2; de klokles niet
   gemeten (de speelcontrole kwam daar niet tot de kaart). KEUZES-VOOR-SARA.md Ronde 24b punt 1; LESRECEPT.md.

### Vragen aan Sara (geen fout)

4. Samen voordoen: Bliepo telt de weggehaalde stippen, de teller toont wat overblijft (zoals Synthesis). Ronde 24b
   punt 2.
5. Tijdens het wegtikken vervangt het tellen de opdrachtzin; de som blijft bovenaan. Ronde 24b punt 3.

## Algemene lessen en dezelfde fout in andere gouden lessen (alleen gemeten, niets veranderd)

- Eindkaart over de tekst: in **3 van de 3** andere gemeten gouden lessen ook (Tellen, Splitsen, Plussommen); klok
  niet gemeten.
- Rondje om een getal in een som: komt alleen in Minsommen voor (0 andere lessen).
- Uitleg na de 2e fout met het woord van de vraag en in 2 versies: in LESRECEPT.md gezet; in de andere gouden lessen
  niet nageteld.

## Overig

- Het Synthesis-tabblad "Dot Destruction" in Sara's Chrome kon ik niet sluiten (Chrome reageerde niet op het sluiten).
  Het staat er nog. Er zijn na afloop geen test-Chrome's meer actief.
