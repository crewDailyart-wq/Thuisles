# KINDTEST — gouden les Meer-minder (squla-meer-minder-evenveel2-1-gouden, "De meeste")

Gespeeld op 10 november 2026 door de onafhankelijke keurder, als Testkind (groep 3), op de laptop. Ik ben in gedachten
een kind van 6. Ik heb de les niet zelf meegebouwd.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Zichtbare Chrome met de echte stem** (Google-stem, met geluid), via het lesoverzicht `/voorbeeld/les` en echt op
  de link geklikt, zoals Sara het doet:
  - **(a) alles goed** (1 keer helemaal tot de kaart);
  - **(b) met fouten**: 10 keer eerst fout, waarvan 5 keer ook een 2e fout (samen tellen), 1 keer 2 keer dezelfde kaart;
  - nog 6 minuten bijna alles goed, voor het oplichten van de woorden.
- **Chrome zonder venster** (snelle nepstem, schermfoto's bij elke fout, elke vraag en elk samen tellen):
  - **fouten** (zoals b), **alles fout** (bij elke vraag 2 verschillende foute antwoorden: alle 30 foute antwoorden uit de
    fouttabel, 14.37), **heel snel** (0,25 s nadat de knoppen er waren, midden in de vraagzin), **lang wachten**
    (9 s bij een keuze, 7 s bij het samen tellen), **vangnet** (bij de kralen 20 s niets doen, bij de kaarten 3 keer
    de verkeerde kaart).
- Mijn testscript is een kopie van `scripts/test-meer-minder-gouden.mjs` in een tijdelijke map, met extra
  schermfoto's, een route "snel", een route "vangnet" en een meting van de kaarten tegen het tekstvak.

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **143**; er kwam niets bij.

---

## PROBLEMEN

### 1. Bij de koekjes valt een lange hint over de rechterkaart — MIDDEL (hersteld)
- **Wat zie je:** na een fout bij de koekjes zegt Bliepo 5 regels ("Je tikte op de kaart met de minste koekjes. Ik leg
  de koekjes in rijen van 10. Wat ligt er op elke kaart onder de rij van 10?"). De regels 4 en 5 liepen over de
  rechterbovenhoek van de 3e kaart (schermfoto: "van 10. Wat ligt er op elke" staat half op de kaart).
- **Gemeten:** de rechterkaart liep 89 px (1440×900), 79 px (1280×720), 95 px (1536×864) en 63 px (1024×768) onder het
  vaste tekstvak. Het overlap-script van de bouwer keek alleen naar Bliepo, niet naar het speelvlak (15.30, 1.15).
- **Hersteld:** bij de kaarten is het gouden vlak iets kleiner (88 %, vanaf links); het oude vlak is niet veranderd.
  Nu 29 tot 43 px ruimte tussen kaart en tekstvak op alle 4 de maten; schermfoto na herstel: de hint staat vrij.
  Het testscript van de les meldt dit nu als fout.

### 2. "Je koos weer een kaart met bijna de meeste." — KLEIN (hersteld)
- Stroeve zin; er is maar 1 kaart die "veel, maar niet de meeste" heeft, dus het kind koos gewoon dezelfde kaart.
- **Nu:** "Je koos weer dezelfde kaart. Als we tellen, zie je het verschil." Gehoord met de echte stem.

### 3. "Ja, daar liggen de meeste koekjes" na het vangnet — KLEIN (hersteld)
- Na 3 keer de verkeerde kaart wijst Bliepo de kaart zelf aan en zei dan "Ja, daar liggen de meeste koekjes: 14." alsof
  het kind het goed deed.
- **Nu:** "Kijk, hier liggen de meeste koekjes: 14." (alleen na het vangnet; tikt het kind zelf goed, dan blijft "Ja, …").

### 4. "Dat is dichtbij." 5 keer per les — KLEIN (hersteld)
- Kiest het kind het middelste getal (vraag 1, 4, 5, 6 en 8), dan zei Bliepo steeds "Je koos 10. Dat is dichtbij."
  (5.10: afwisselen). **Nu** 3 versies: "Dat is dichtbij." / "Je zit er dichtbij." / "Dat scheelt niet veel." Geen
  ervan geeft een richting; de verklapcontrole van het fouttabel-script is in orde.

### 5. De koekjes in rijen van 10 zijn klein — open (al vraag 1 van Ronde 25)
- Na de 1e fout gaan de koekjes in rijen van 10 liggen; ze zijn dan ± 22 px (op de laptop). Nog te tellen en goed te
  vergelijken (de rij van 10 is overal even lang, je ziet meteen het restje), maar klein voor een kind van 6. Door
  herstel 1 zijn ze nog iets kleiner (88 %). Dit is al een vraag aan Sara (Ronde 25, punt 1).

### 6. Woorden lichten niet aantoonbaar op ± 150 ms op — open (bekend)
- Echte Google-stem: 0 woordmeldingen van de browser. Eerste woord licht gemiddeld 51 ms na de start op (goed); het
  laatste woord gemiddeld 148 ms naast het geschatte moment (grootste 474 ms); 6 van 9 goed meetbare zinnen helemaal
  binnen ± 150 ms. Zelfde bekende grens als bij Minsommen (KEUZES Ronde 24); met Ruth komen echte tijden.

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

| Soort fout (voorbeeld) | Denkfout | Wat Bliepo zei en liet zien | Klopt? |
|---|---|---|---|
| alleen de volle rijen (16 kralen, koos 15) | `alleen-volle-rijen` | "Je koos 15: zoveel liggen er in de volle rijen. De rij die niet vol is, telt ook mee. Tel die erbij." Knoppen weg, daarna terug. | ja: precies de denkfout; 16 en 17 blijven mogelijk |
| te veel, richting mag (9 kralen, koos 11) | `te-veel-geteld` | "Je koos 11, maar zoveel kralen liggen er niet. Tel rij voor rij. Elke kraal tel je 1 keer." | ja: 9 en 10 blijven over |
| te weinig, richting mag (14 kralen, koos 12) | `te-weinig-geteld` | "Je koos 12, maar er liggen meer kralen. Begin bij de bovenste rij en tel elke kraal mee." | ja |
| middelste getal (13 kralen, koos 14) | `te-veel-geteld`, zonder richting | "Je koos 14. Je zit er dichtbij. Begin bij de bovenste rij en tel rustig opnieuw." | ja: met "te veel" bleef alleen 13 over (15.17) |
| 2e fout, andere denkfout (16: eerst 15, dan 17) | `te-veel-geteld` | "Je koos 17, maar zoveel kralen liggen er niet. Er is 1 kraal 2 keer geteld. Kom, we tellen samen." Bliepo telt "5. 10. 15.", het kind tikt de laatste kraal, het getal boven de kralen telt mee, "Het zijn 16 kralen. 16 is evenveel." | ja; het getal komt pas nu in beeld |
| 2 keer dezelfde denkfout (17: 2 keer 15) | `alleen-volle-rijen` 2× | "Je telde weer alleen de volle rijen. Kijk ook naar de korte rij onderaan." | ja, anders gezegd dan de 1e keer |
| kaart met de minste | `kleinste-groep-gekozen` | "Je tikte op de kaart met de minste koekjes. Ik leg de koekjes in rijen van 10. Wat ligt er op elke kaart onder de rij van 10?" Vinkje weg, rijen van 10. | ja: 2 kaarten blijven over |
| kaart in het midden | `niet-de-meeste` | "Daar liggen veel koekjes, maar niet de meeste. Ik leg de koekjes in rijen van 10. Kijk wat er onder de rij van 10 nog ligt." | ja |
| 2e fout bij de koekjes | `niet-de-meeste` | "… Er is een kaart met nog meer koekjes. Kom, we tellen samen." Bliepo telt elke kaart (getal erboven, bruin), "13 is het meest. Tik op die kaart.", het kind tikt. | ja |
| 2 keer dezelfde kaart | `niet-de-meeste` 2× | "Je koos weer dezelfde kaart. Als we tellen, zie je het verschil." (na herstel 2) | ja |

Geen enkele hint noemt het antwoord. Geen "fout", geen naam bij een fout. Rood scherm bij fout, groen bij goed, geen
rood op de keuze, de knoppen gaan meteen weg na een tik; de gekozen kaart krijgt alleen een vinkje (schermfoto's).

## Kijken als een kind (14.23)

- Kralen: grote paarse kralen in rijen van 5, goed te tellen; de laatste rij is korter. "Hoeveel kralen liggen er?" en
  "Hoeveel kralen zijn het?" passen bij het beeld (de kralen liggen los op de vloer) en zijn goed Nederlands.
- Koekjes: 3 kaarten met koekjes in rijen van 5; groot genoeg. Na een fout in rijen van 10 (zie punt 5).
- Getal boven de groep alleen bij samen tellen: 0 van 259 metingen tijdens een vraag. Bij de kralen paars, bij de
  koekjes bruin, groot (58 punten).
- Samen tellen bij de kralen: de nog niet getelde kralen zijn gedimd; het hulphandje wijst schuin onder de volgende
  kraal (na ± 6 s, met "Jij kunt dit. Tik op de volgende kraal."). Na 20 s niets telt Bliepo zelf verder.
- Wisselen van vraag: het nieuwe beeld verschijnt met de hologram-straal van het oude vlak; even zie je oud en nieuw
  door elkaar (± 0,5 s). Klein, bestaand effect van het vlak, geen fout.
- Geen gezichtjes, geen mensen, geen kaders om plaatjes. Bliepo staat nooit over de tekst; niets verspringt; de pijl gaat
  niet aan en uit; F7 = 0, F8 = 0 (ook met de echte stem). Eindkaart: 0 woorden eronder.

## Heel snel en lang wachten

- Heel snel getikt (0,25 s): de stem stopt, Bliepo zegt niets over snel (draaiboek: niets). Goed.
- Lang wachten bij een keuze: niets (geen zin, geen handje). Bij samen tellen: handje na ± 6 s met 1 zin. Goed.

## Tempo en stem

- Einde zin → volgend stuk: gemiddeld 726–799 ms (doel ± 700), nooit buiten 550–950 ms.
- Echte stem: 159 zinnen gestart, 150 helemaal uitgesproken, 9 afgebroken omdat ik al tijdens de vraag tikte (mag).
