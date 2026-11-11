# KINDTEST — gouden les Geld (squla-geld-geldmachine-1-gouden, "Munten en briefjes")

Gespeeld op 11 november 2026 door **de bouwer zelf** (niet door een onafhankelijke helper: ik mocht zelf geen helpers
inzetten, harde regel 10). De echte kind-test en de keuring doet hierna een aparte keurder. Ik heb geprobeerd te kijken
als een kind van 6, maar ik heb de les zelf gemaakt; dit verslag is dus geen keuring.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Chrome zonder venster** (nepstem), met schermfoto's van elke vraag, elke hint en elk samen voordoen:
  `scripts/test-geld-gouden.mjs`, routes **goed** (ook eerst een ander kaartje kiezen en weer weghalen), **fouten**,
  **alles fout**, **elk ander fout antwoord**, **weer** (hetzelfde foute antwoord 2 keer), **vangnet** (niets doen bij
  de kleine stap), **lang wachten**, **tik op de pijl** en **kleur**.
- **Overlap en sprongen** (route alles fout, en elk ander fout antwoord op de 2 krapste maten) op 1440 × 900,
  1280 × 720, 1536 × 864 en 1024 × 768.
- De echte stem: zie KEUZES-VOOR-SARA.md Ronde 34 ("Getest").

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **147**; er kwam niets bij.

---

## PROBLEMEN DIE IK VOND (en hersteld heb)

1. **Het begin was te lang** (groet + "… en kiest het juiste bedrag."): Bliepo werd even kleiner (15.30). Nu zonder
   "en kiest het juiste bedrag" (KEUZES Ronde 34).
2. **Kale cijfers** in eigen zinnen: "alle 3", "Er is er nog 1.", "ook de 0", "nog 3 vragen". Die kregen de standaard
   getalkleur van het lesscherm (14.20). Nu allemaal met een kleur of wit; het fouttabel-script zoekt dit nu zelf.
3. **De hint zei niet waar het over ging** ("Het getal op een munt zegt hoeveel hij waard is."): na de hint komt nu de
   vraag kort ("Waar zie je een munt van 1 euro?", "Wat is het?"). F1.
4. **1 hint te lang** op 1024 × 768 en 1536 × 864 ("Kijk naar alle cijfers van het getal, niet alleen naar het
   eerste." + de vraag): Bliepo werd kleiner. Nu "Kijk naar alle cijfers van het getal."
5. **"Je koos …" 2 keer achter elkaar** bij 2 verschillende foute antwoorden (keuring Tellen en Splitsen): bij de 2e fout
   nu "Nu koos je …" / "Nu tikte je op …".
6. **"Je koos weer een ander bedrag."** klonk stroef en legde niet anders uit: nu "Je koos weer een briefje met een
   ander getal." met een andere uitleg ("Elk briefje heeft een eigen kleur en een eigen getal." / "De munt van 1 euro is
   zilver in het midden, die van 2 euro is goud.").

## OPEN (niet door mij te beslissen)

- **De briefjes hebben geen "SPECIMEN"** (de getekende briefjes van 3 november, ook in de oude geldlessen). CLAUDE.md zegt
  ECB-specimen. KEUZES Ronde 34 punt 7.
- **Woorden lichten op ± 150 ms**: met de Google-stem niet te bewijzen (zelfde grens als bij de andere gouden lessen).

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

Alle 25 rijen van de fouttabel kwamen minstens 1 keer voor (routes alles fout, elk ander fout antwoord, fouten en weer).
Het rode rondje stond bij elke fout om het geld dat ik koos (waar zie je, zwevende munten) of om het geld in beeld (wat is
dit), **nooit om het antwoord** (25 + 13 + 3 keer geteld, 0 keer om het antwoord).

| Vraag | Ik koos | Denkfout | Wat Bliepo zei (1e fout) | Klopt? |
|---|---|---|---|---|
| 1 munt van 1 euro | munt van 2 euro | `ander-getal` | "Je koos de munt van 2 euro. Daar staat een 2 op. Het getal op een munt zegt hoeveel hij waard is. Waar zie je een munt van 1 euro?" | ja |
| 1 | briefje van 5 euro | `munt-briefje-verwisseld` | "Je koos een briefje van 5 euro. Dat is geen munt." + uitleg vorm | ja |
| 2 munt van 2 euro | briefje van 20 euro | `munt-briefje-verwisseld` | "… Dat is geen munt. Kijk naar de vorm. Een munt is rond." | ja (2 munten blijven over) |
| 2 | munt van 1 euro | `ander-getal` | "Je koos de munt van 1 euro. Daar staat een 1 op. …" | ja |
| 3 briefje van 5 euro | briefje van 50 euro | `zelfde-cijfer` | "Je koos het briefje van 50 euro. Op dat briefje staan 2 cijfers. Kijk naar alle cijfers van het getal." | ja |
| 3 | munt van 50 cent | `munt-briefje-verwisseld` | "Je koos een munt van 50 cent. Dat is geen briefje. We zoeken een briefje. Een briefje is een rechthoek." | ja |
| 4 briefje van 10 (knoppen) | 1 euro | `munt-briefje-verwisseld` | "Je koos 1 euro. Dat is een munt." dan met rondje om het briefje: "Dit geld is een rechthoek van papier: een briefje. Lees het getal erop. Wat is het?" | ja |
| 4 | 100 euro | `zelfde-cijfer` | "Je koos 100 euro. Op een briefje van 100 euro staan 3 cijfers." | ja |
| 5 briefje van 20 euro | briefje van 10 euro | `ander-getal` | "Je koos het briefje van 10 euro. Daar staat 10 op. Lees het getal op de briefjes." | ja |
| 5 | munt van 2 euro | `munt-briefje-verwisseld` | "… Dat is geen briefje." | ja |
| 6 munt van 1 euro (knoppen) | knoop | `geen-geld` | "Je koos een knoop. Een knoop heeft gaatjes. Dit is geld: een munt. Lees het getal erop." | ja |
| 6 | 2 euro | `ander-getal` | "Je koos 2 euro. De munt van 2 euro is goud in het midden. Kijk naar het midden van deze munt. Lees ook het getal." | ja (de munt in beeld is zilver in het midden) |
| 7 briefje van 5 (knoppen) | 50 cent | `munt-briefje-verwisseld` | "Je koos 50 cent. Dat is een munt. Kijk naar de vorm: dit is een briefje. …" | ja |
| 7 | 50 euro | `zelfde-cijfer` | "Je koos 50 euro. Op een briefje van 50 euro staan 2 cijfers. Kijk naar alle cijfers op dit briefje." | ja |
| 8 zwevende munten | munt van 50 cent | `ander-getal` | "Je tikte op de munt van 50 cent." dan de opdracht "Tik alleen op munten met een 1 erop." (gevonden munten houden hun vinkje) | ja |
| 8 | munt van 2 euro | `ander-getal` | "Je tikte op de munt van 2 euro." | ja |
| 8 | knoop | `geen-geld` | "Je tikte op een knoop. Met een knoop kun je niet betalen." | ja |
| 9 briefje van 10 euro | briefje van 20 / 100 euro | `ander-getal` / `zelfde-cijfer` | "… Daar staat 20 op. …" / "… Op dat briefje staan 3 cijfers." | ja |
| 10 briefje van 20 (knoppen) | 10 euro / 50 euro | `ander-getal` | "Het briefje van 10 euro is rood." / "Het briefje van 50 euro is oranje." + "Kijk naar de kleur van dit briefje." | ja (dit briefje is blauw) |
| 11 munt van 2 (knoppen) | 1 euro / 50 cent | `ander-getal` | "De munt van 1 euro is zilver in het midden." / "Op de munt van 50 cent staat een 50." | ja |
| 12 briefje van 5 euro | briefje van 10 / 20 euro | `ander-getal` | "Daar staat 10 op." / "Daar staat 20 op." | ja |

**Dezelfde denkfout 2 keer** (route weer, 15 van 15 keer "weer"): "Je koos weer een briefje. Munten zijn rond, briefjes
niet." / "Je keek weer alleen naar het eerste cijfer. Ook de 0 hoort bij het getal." / "Je tikte weer op een andere
munt. Alleen een munt met een 1 is 1 euro." Daarna steeds samen voordoen. Klopt.

**Hetzelfde foute antwoord 2 keer zonder "weer"-uitleg** (de knoop 2 keer): "Je koos weer de knoop. Een knoop is geen
geld." Klopt.

**Samen voordoen** (2e fout): rood rondje om het goede geld, "Hier is de munt van 1 euro. Hij is rond, met een 1 erop.",
"Tik jij op de munt van 1 euro?", ik tik, "Ja, dat is de munt van 1 euro." Bij "Wat is dit?": "Dit geld is een rechthoek
van papier. Het is een briefje." / "Er staat 20 op. Het is het briefje van 20 euro." / "Tik jij op het briefje van 20
euro?". Bij de zwevende munten wijst Bliepo de nog niet gevonden munten van 1 euro 1 voor 1 aan (1 rondje tegelijk) en
tik ik de laatste. Vangnet (20 s niets): "Kijk, hier is de munt van 1 euro." (geen "Ja").

## Kijken als een kind (14.23), op de schermfoto's

- De munten en briefjes zijn groot genoeg en goed uit elkaar te houden (1 en 2 euro: zilver of goud in het midden). Elk
  geld staat in een eigen zacht vak (keuzevakken, 1.4). Niets overlapt, niets zweeft raar.
- Het vinkje op een gekozen kaartje is duidelijk; geen gloed of rand eromheen. Bij goed alleen een lichtgolf.
- De knoop is een gewone blauwe knoop met 4 gaatjes, zonder gezichtje.
- Het geld blijft links van het tekstvak (± 64–78 px ruimte op 1440 × 900); Bliepo staat nooit over de tekst.
- Eindkaart: munt van 2 euro, briefje van 5 en munt van 1 euro; 0 woorden van Bliepo onder de kaart.

## Tempo en hulp

- Einde zin → volgend stuk: gemiddeld 725–811 ms (doel ± 700), nooit buiten 550–950 ms.
- Tik op de pijl: binnen 66–97 ms iets nieuws.
- Lang wachten: bij "Waar zie je" en "Wat is dit" zegt Bliepo niets en komt er geen handje. Bij de zwevende munten en bij
  de kleine stap komt het handje 7,5 s na het begin van de opdracht (± 6 s na de opdrachtzin), met 1 korte zin; bij de
  zwevende munten in de lege ruimte links van de munten.
- Getalkleur gemeten in Chrome: munten geel (255,224,102), briefje van 10 rood (255,123,123), 20 blauw (143,196,255),
  5 en het gezochte getal wit (255,255,255).
