# KEURING gouden les Meer-minder — squla-meer-minder-evenveel2-1-gouden ("De meeste")

Onafhankelijke keurder, 10 november 2026, branch backup-squla, basis commit bfcb1d8 (de bouwer). Kind-test: zie
KINDTEST-MEER-MINDER-GOUDEN.md. Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt,
geen helpers ingezet. Gedeelde code (Lesscherm.tsx, BliepoTekst.tsx, het oude meer-minder-vlak) niet veranderd door mij.

## UITSLAG: GOEDGEKEURD (na 4 herstellingen in deze les)

In 1 zin: de inhoud is precies die van Squla, elke vraag heeft precies 1 goed antwoord, elke fout krijgt een reactie die
bij de denkfout past zonder iets te verklappen, en de les stopt nooit; ik vond 1 middelgroot punt (de rechterkaart liep
onder het tekstvak) en 3 kleine taalpunten, allemaal hersteld in de bestanden van deze les.

Telling: 0 ernstig, 1 middel (hersteld), 3 klein (hersteld), 2 vragen aan Sara (KEUZES Ronde 25b).

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (hoofdstuk 1–15, vooral 3.7 en 15.x), LESRECEPT.md (ook "Geleerd bij de keuring
  Minsommen"), BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F9), KEUZES Ronde 25, de les, de zinnen, het gouden vlak,
  de oude les `squla-meer-minder-evenveel2-1` (alleen gelezen) en de git-diff van de bouwer.
- `npx tsx scripts/fouttabel-meer-minder-gouden.ts`: reken- en verklapcontrole in orde (15 vragen, 30 foute antwoorden),
  vóór en na mijn herstel. FOUTTABEL opnieuw gemaakt.
- `npm run opgaven`: groen. `REV=0bbbbeb npm run inhoudsvergelijk`: 0 verdwenen.
- Speelcontrole `F7=1 npm run speel` GOED en ALLEFOUT: allebei tot het eind, 0 fouten, F7 = 0, F8 = 0 (vóór en na herstel).
- `scripts/test-meer-minder-gouden.mjs` met `ONTWERP=1` op 1440×900, 1280×720, 1536×864 en 1024×768 (route goed) en
  route allefout: in orde na herstel (0 overlap, 0 sprongen, eindkaart 0 woorden, getal boven de groep 0 keer tijdens een
  vraag). Het script controleert nu ook de kaarten tegen het tekstvak.
- Kind-test zichtbaar met de echte stem via het lesoverzicht, en zonder venster met schermfoto's (KINDTEST).
- `les_uitkomsten`: hoogste id vóór en na alles **143**. Er is niets bijgekomen.
- Vloeiend: **niet opnieuw gemeten**; de computer was niet rustig (belasting 4 tot 35). Mijn herstel is tekst en 1
  vaste CSS-schaal (geen Phaser-werk per beeld). De bouwer mat: laptop 60 beelden/s (35 ms), trage telefoon 59 (35 ms).

## Rekenen (14.30) en inhoud (15.22)

Inhoud gelijk aan `squla-meer-minder-evenveel2-1`: dezelfde 15 vragen in dezelfde volgorde, dezelfde getallen en keuzes
(kralen 9, 12, 16, 13, 10, 17, 11, 14; kaarten 11/13/12, 14/16/15, 12/10/11, 13/17/14, 15/14/13, 16/15/17, 12/14/13).
Bij elke kralenvraag staat het aantal precies 1 keer tussen de 3 keuzes; bij elke kaartvraag is er precies 1 grootste.
**Precies 1 juist antwoord** bij alle 15 vragen.

De 2 korte vragen "Hoeveel kralen zijn het?" en "Hoeveel kralen liggen er?" zijn allebei goed Nederlands en passen bij
het beeld (losse kralen op de vloer). Ze wisselen om en om, zodat dezelfde zin niet direct terugkomt (F7).

## Hints en verklappen (15.17, 14.31, 14.36)

- Per fout antwoord nagelopen hoeveel keuzes er na eerste zin + hint overblijven: altijd 2. Kiest het kind het
  middelste getal, dan noemt Bliepo geen richting (anders bleef er 1 over) en de hint ook niet.
- "Je koos 15: zoveel liggen er in de volle rijen." klopt (rijen van 5, de laatste korter) en zegt niet hoeveel er nog bij
  komen. Bij de kaarten wijst Bliepo nooit 1 kaart aan; de rijen van 10 laten het verschil zien zonder getal.
- Na de 2e fout komt het getal pas in beeld bij het samen tellen (15.11).

## Gedeelde code van de bouwer (git diff bfcb1d8)

- **Lesscherm.tsx / .module.css:** de eindkaart staat alleen links (`kaartNaastTekst`, left 430) als de les
  `stemHeelUitpraten` heeft. Dat hebben alleen de klokles, Minsommen en Meer-minder. **Tellen, Splitsen, Plussommen en
  alle oude lessen veranderen niet** (zelfde klasse, zelfde plek). De klokles verandert wel (kaart links); niet apart
  gespeeld.
- **BliepoTekst.tsx (`useWoordNu`):** het woord van nu hoort nu bij 1 uitspraak. Dat geldt voor **alle** lessen: het
  enige verschil is dat bij het begin van een nieuwe zin het oude woordnummer niet meer 1 beeldje blijft staan (de F7-flits
  van ± 16 ms). Verder geen verandering in gedrag; geen tekst, plek of kleur anders. Goed.

## Per regel: wat afwijkt

| Regel | Oordeel |
|---|---|
| 15.22 inhoud Squla / 14.30 1 juist antwoord | goed |
| 15.9 fouttabel / 14.36–14.37 | goed (30 foute antwoorden, elk met reactie; alle 30 gespeeld) |
| 15.11 2 pogingen, voortgang | goed (goed in één keer / goed na een fout / samen gedaan; niets in de database bij Testkind zonder koekje) |
| 15.17 niets verklappen | goed |
| 15.18 nooit stoppen | goed (ook vangnet: 20 s niets bij de kralen, 3 keer mis bij de kaarten) |
| 15.19 hulphandje | goed: alleen bij samen tellen, na ± 6 s, 1 zin, geen knop; niets bij keuzes (9 s gewacht) |
| 15.27 pijl | goed: nooit wachten op de pijl, geen pijl bij vraag/opdracht/kaart |
| 15.28 / F7 | goed: 0 |
| 15.29 / F8 | goed: 0 (ook met de echte stem) |
| 15.30 / F9 vaste zones, 1.15 | **middel, hersteld** (punt 1): de rechterkaart liep onder het tekstvak |
| 3.7 woorden mee met de stem | eerste woord binnen ± 50 ms; einde niet aantoonbaar binnen ± 150 ms met de Google-stem (bekend) |
| 5.10 afwisselen | **klein, hersteld** (punt 4) |
| 14.33 eenvoudige, goede taal | **klein, hersteld** (punt 2 en 3) |
| 2.1, 2.2, 14.27 kleur | goed: kralen paars, koekjes bruin, in de zin en boven de groep |
| 6.5, 7.8a vinkje | goed: alleen een vinkje op de gekozen kaart, nog een tik haalt het weg |
| 5.3 rood/groen, geen rood op keuze, geen fout-geluid | goed |
| 6.10 heel snel / tempo | goed: niets bij snel; door na ± 0,75 s |
| 3.17 naam | goed: groet + hooguit 1 lof |
| 3.20 cijfers | goed ("1 kraal", "rij van 10") |
| 1.1–1.3 geen mensen/gezichtjes | goed |
| F1–F9 | geen gevonden in deze les (na herstel) |
| Harde regel 2 | goed: 143 vóór en na |

## Gevonden punten (alle hersteld in deze les)

1. **MIDDEL — de rechterkaart liep onder het tekstvak** (15.30, 1.15). Gemeten 63–95 px op 4 schermmaten; een hint van
   5 regels viel over de kaart. Herstel in `squla-meer-minder-gouden-vlak.tsx`: bij de kaarten is het gouden vlak 88 %
   (vanaf links); nu 29–43 px ruimte. Het oude vlak is niet veranderd. Testscript controleert het nu.
2. **KLEIN — "Je koos weer een kaart met bijna de meeste."** → "Je koos weer dezelfde kaart."
3. **KLEIN — "Ja, daar liggen de meeste koekjes" na het vangnet** → "Kijk, hier liggen de meeste koekjes: …"
   (`ZIN.samenKaartZelf`).
4. **KLEIN — "Dat is dichtbij." 5 keer per les** → 3 versies om en om.

## Dezelfde fout in andere gouden lessen (alleen gemeten, niets veranderd)

- **Speelvlak in het tekstvak** (schermfoto's bij de eerste vraag, 1440×900, tekstvak vanaf x = 990): **2 van de 5**
  andere gouden lessen. Minsommen: het vak met het vraagteken tot x ± 1015 (± 25 px), nu nog geen tekst eroverheen;
  Plussommen: de plank tot x ± 1080 (± 90 px), een hint van 4 of meer regels valt erover. Klok, Splitsen en Tellen: vrij.
  Vraag aan Sara: KEUZES Ronde 25b punt 1.
- **"Ja" na het vangnet:** 0 van de 5 (alleen Splitsen heeft een vangnet en zegt "Kijk, ik doe het even voor.").
- **Dezelfde korte eerste zin zonder richting:** Tellen en Splitsen zeggen ook steeds "… is dichtbij." (2 van de 5);
  daar is het al goedgekeurd. In LESRECEPT.md gezet als les voor later.
