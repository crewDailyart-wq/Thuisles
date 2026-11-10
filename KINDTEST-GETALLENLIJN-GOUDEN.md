# KINDTEST — gouden les Getallenlijn (squla-getallenlijn-kat-1-gouden, "Het raketje op de getallenlijn")

Gespeeld op 10 november 2026 door de onafhankelijke keurder, als Testkind (groep 3), op de laptop. Ik ben in gedachten
een kind van 6. Ik heb de les niet zelf meegebouwd.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Zichtbare Chrome met de echte stem** (Google-stem, met geluid), via het lesoverzicht `/voorbeeld/les`, echt op de link
  geklikt (de link wordt nu eerst in beeld geschoven; zie punt 4):
  - **(b) met fouten** (route "fouten"): 11 keer eerst fout, 5 keer ook een 2e fout (samen voordoen), 1 keer 2 keer
    hetzelfde getal (13), een sprong overslaan in de uitleg, kaarten slepen, een ding aantikken met het vinkje;
  - **(a) bijna alles goed** (route "woorden"), voor het oplichten van de woorden.
- **Chrome zonder venster** (snelle nepstem; schermfoto's bij elke vraag, elke fout en elk samen voordoen):
  **Nee-route alles goed** (ook van gedachten veranderen bij "wat staat er bij", de eerste kaart echt slepen),
  **Ja met een goede proef**, **Ja met 2 fouten in de proef**, **elk ander fout antwoord**, **alles fout** (op 1440×900,
  1280×720 en 1024×768), **vangnet**, **lang wachten**, **tik op de pijl** en **kleur**.
- Schermfoto's: in de scratchpad van de keurder (niet in Git).

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven tikken
(15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **143**; er kwam niets bij.

---

## PROBLEMEN

### 1. De kaarten bij "Zet de getallen op volgorde" waren onzichtbaar — ERNSTIG (hersteld)
- **Wat zie je:** bij vraag 6 en 7 zie ik alleen het eerste vak met 5 (of 12) en 3 lege vakken. Er liggen geen kaarten.
  Bliepo zegt "Sleep een kaart naar een vak." Als kind weet ik niet wat ik moet slepen. Na een tik op de lege plek kwam
  wel het vinkje: de kaarten waren er wel, maar doorzichtig. Bij het samen voordoen ("Sleep jij de 8 naar het laatste
  vak?") was ook niets te zien.
- **Oorzaak:** het verschijnen van een kaart (`tover`) maakt hem eerst doorzichtig. De les legt de kaarten meteen daarna
  terug op hun plek (`legKaart`), en dat stopte het verschijnen. Het testscript tikt op onzichtbare knoppen die over het
  vlak liggen, dus het merkte niets.
- **Hersteld** in `squla-getallenlijn-gouden-vlak.tsx`: na het stoppen worden kaart (en raketje) weer helemaal zichtbaar.
  Schermfoto na herstel: 4 kaarten 7, 8, 6 in de vakken, en bij het samen voordoen 6, 7 in de vakken en de 8 eronder.

### 2. Bij de 2e fout zei Bliepo een opdracht die ik niet meer kon doen — MIDDEL (hersteld)
- "Tel de streepjes vanaf een getal dat je ziet.", "Tel elk streepje mee.", "Begin met het kleinste getal.", "Tel de
  streepjes vanaf de 15.", "Tel alleen de bogen.", "Wijs elke boog aan." Meteen daarna zegt Bliepo "Kom, we springen
  samen." en doet hij het zelf. Nu: uitleg ("Recht onder het raketje hoort het getal dat we zoeken.", "Elk streepje telt
  mee.", "Het kleinste getal komt vooraan.", "De 15 helpt je tellen.", "Alleen de bogen tellen mee.", "Bij elke sprong
  hoort 1 boog.").

### 3. Taal — KLEIN (hersteld)
- "Kijk naar de 13. Het raketje staat 1 streepje verder." zegt waar het raketje staat. Nu "Kijk naar de 13. Tel vanaf daar
  de streepjes tot het raketje."
- Bij "het dichtst bij" zei Bliepo "stapjes", bij het samen voordoen "sprongen". Nu overal "sprongen".
- "Tel vanaf de 10 1 streepje verder." (op het scherm "de 10 1") → "Tel vanaf de 10 nog 1 streepje verder."

### 4. De link in het lesoverzicht lag onder de rand — KLEIN (testscript, hersteld)
- In een zichtbaar venster (1440×771 binnenin) lag de link na het schuiven nog op y = 867. Het testscript schuift hem nu
  opnieuw in beeld tot hij onder de muis ligt. De les zelf had hier niets mee te maken.

### 5. Woorden lichten niet aantoonbaar op ± 150 ms op — open (bekend)
- Zie "Tempo en stem". Zelfde bekende grens als bij Minsommen, Meer-minder en Huisnummers: de Google-stem geeft geen
  woordmeldingen.

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

Alle 37 foute antwoorden uit de fouttabel kwamen voor (routes "alles fout" en "elk ander fout antwoord", plus de uitleg).
Een greep:

| Soort fout (voorbeeld) | Denkfout | Wat Bliepo zei en liet zien | Klopt? |
|---|---|---|---|
| streepje ervoor (vraag 1: koos 5) | `streepje-ervoor` | "Bij de 5 is het raketje nog niet. Zoek de 5 op de lijn. Welk getal komt daarna?" Rood rondje om de 5, knoppen weg, dan "Welk getal hoort bij het raketje?" | ja; 6 en 7 blijven over |
| streepje erna (vraag 1: koos 7) | `streepje-erna` | "Zo ver als de 7 is het raketje nog niet. Zoek de 5 …" | ja |
| te ver (vraag 2: koos 4) | `te-ver` | "4 ligt verder dan het raketje. Kijk naar de 1. Tel vanaf daar de streepjes tot het raketje." Rondje om de 1 | ja |
| niet op de lijn (vraag 8: koos 4) | `tiental-vergeten` | "4 staat niet op deze lijn. Deze lijn begint bij de 9. Kijk naar de 13 …" (schermfoto: rondje om de 13) | ja |
| zou verklappen (vraag 9: koos 17) | `streepje-ervoor`, zonder richting | "Het raketje staat niet bij de 17. Kijk recht onder het raketje. Tel de streepjes vanaf een getal dat je ziet." | ja; 18 en 8 blijven over |
| na 10 (vraag 4: koos 12) | `streepje-overgeslagen` | "Met 12 sla je een streepje over. Het raketje is al voorbij de 10. Tel vanaf de 10 nog 1 streepje verder." | ja |
| wat is meer (vraag 5: 2 keer 13) | `kleiner-gekozen` 2× | 1e: "13 zeg je eerder als je telt. Op de getallenlijn staat het getal dat meer is, verder naar rechts." 2e: "Je koos weer 13. Hoe verder je komt als je telt, hoe meer het is." dan samen springen 13 → 14 | ja |
| op volgorde (vraag 6: 5, 7, 8, 6) | `getal-overgeslagen` | "Na 5 zette je 7. Zoek steeds het kleinste getal dat nog over is." Rondje om vak 2, kaarten glijden terug | ja |
| op volgorde andersom (vraag 7: 12, 15, 14, 13) | `volgorde-omgedraaid` | "Na 12 zette je 15, het grootste getal. …" | ja |
| ding ervoor 2× (vraag 11: 2 keer het raketje) | `ding-ervoor` 2× | 1e: "Het raketje staat vóór de 14. Zoek eerst de 15. Tel dan de streepjes terug tot de 14." 2e: "Je tikte weer op iets vóór de 14. De 15 helpt je tellen." dan samen 15 → 14, de ufo aantikken | ja |
| verder weg (vraag 12: koos 14) | `verder-weg` | "Van 14 naar de 20 zijn het 6 sprongen. Tel bij elk getal hoeveel sprongen het naar de 20 is. …" Rondje om bordje 14 | ja |
| ander stuk (vraag 14: 19, dan 16) | `ander-stuk` | 1e: "19 ligt vlak vóór de 20. Kijk welk getal op de lijn het dichtst bij het raketje staat." (geen rondje) 2e: "16 ligt vlak na de 15. Het raketje staat vlak bij de 10." dan alle streepjes erbij en samen 10 → 11 | ja; geen "weer" (ander getal) |
| uitlegvraag (koos 4) | `getallen-tellen-ipv-sprongen` | "Je telde de getallen 0, 1, 2 en 3. Dat zijn er 4. Maar we tellen de sprongen. Elke boog is 1 sprong." | ja (zoals Synthesis) |

Geen enkele eerste zin of hint noemt het antwoord of 2 buren tegelijk. Geen "fout", geen naam bij een fout. Rood scherm
bij fout, groen bij goed, geen rood op de keuze, de knoppen gaan meteen weg na een tik (schermfoto's).

## Kijken als een kind (14.23)

- De getallenlijn is groot en helder: witte streepjes, witte getallen van 30–40 punten, een rood-wit raketje boven het
  streepje. Onder het raketje staat geen getal: dat moet ik zoeken. Duidelijk.
- De bogen bij het springen zijn oranje en blijven staan; ik kan ze tellen (schermfoto uitleg: 3 bogen van 0 naar 3).
- "Wat staat er bij 17?": de ufo, het raketje en de satelliet staan op de lijn; na een tik komt een groen vinkje op het
  ding en het blauwe vinkje bij Bliepo. Nog een tik haalt het weg.
- "Het dichtst bij": bij het samen voordoen komen de getallen op een lijn 0–20 en springt Bliepo 18 → 20 met 2 bogen.
- **Op volgorde: na herstel** liggen de kaarten groot en duidelijk onder de vakken. Vóór herstel waren ze er niet (punt 1).
- "Wat is meer: 13 of 14?": het verhaaltje gaat over sterren, maar er staan geen sterren in beeld (KEUZES Ronde 27 punt 7);
  dat stoort niet, de lijn 10–20 staat erbij.
- Geen gezichtjes, geen mensen, geen kaders om plaatjes. Bliepo staat nooit over de tekst; de pijl staat rechts en gaat
  niet aan en uit. Eindkaart: 0 woorden eronder.
- **Bliepo "verspringt"** 2 keer heen en terug: bij "Wat is meer: 13 of 14?" en bij "Van klein naar groot." Dat is het
  vaste gebaar bij **meer** en **groot/klein** (lib/bliepo-gebaren.ts, regel 3.16: "groot/klein"), net als bij
  Meer-minder. Hij raakt de tekst nooit (overlap 0 op alle schermmaten). Geen fout.

## F7, F8, F9

- F7 (tekst komt terug): **0** in elke run. Gedimd en weer gedimd: **0**.
- F8 (2 keer uitgesproken): **0** in elke run, ook met de echte stem.
- F9: overlap **0**, tekstvak, eerste regel en pijl **0** sprongen op 1440×900, 1280×720 en 1024×768; het speelvlak blijft
  links van het tekstvak (34 px ruimte op 1440×900).

## Heel snel en lang wachten

- Heel snel: Bliepo zegt niets over snel (6.10: bij Getallenlijn niets). Een tik tijdens de vraag stopt de stem.
- Lang wachten bij kiezen: niets (0 keer iets tijdens 9 s wachten). Bij springen, op volgorde en de kleine stap: het
  handje na ± 6 s na de opdrachtzin (7,2–9,3 s na het begin van de opdracht), met 1 zin ("Jij kunt dit. Tik op dit
  getal."). Het handje wijst het volgende getal of een leeg vak aan, niet de goede kaart.
- Vangnet: 20 s niets bij de kleine stap → Bliepo doet het zelf en zegt "Kijk, hier is de 6." (geen "Ja").

## Tempo en stem

- Einde zin → volgend stuk: gemiddeld 725–815 ms (doel ± 700), nooit buiten 550–950 ms. Tik op de pijl: binnen 34–54 ms
  iets nieuws.
- Echte stem (route fouten, via het lesoverzicht): 109 zinnen gestart, 75 helemaal uitgesproken, 34 afgebroken omdat ik
  al tijdens de vraag of opdracht tikte (mag). Geen zin 2 keer (F8 = 0).
- Echte stem (route woorden, via het lesoverzicht): 63 zinnen gestart, 42 helemaal uitgesproken, 21 afgebroken door mijn
  tik tijdens de vraag (mag). F7 = 0, F8 = 0, 0 overlap, 0 sprongen van tekst of pijl.
- Woorden oplichten: de Google-stem gaf 0 woordmeldingen. Het eerste woord licht gemiddeld 51 ms na de start van de stem
  op (goed). Het einde kon ik maar bij 12 van de 40 zinnen meten (het meetscript herkent zinnen niet die als 1 uiting
  worden uitgesproken maar als 2 regels in beeld staan); daarvan 5 binnen ± 150 ms, gemiddeld 285 ms ernaast (grootste
  680 ms). Dit komt uit de gedeelde schatting van woordtijden (lib/stem.ts), niet uit deze les; met Ruth komen echte
  tijden. Open, zoals bij Minsommen, Meer-minder en Huisnummers (KEUZES Ronde 24).
