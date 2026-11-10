# KINDTEST — gouden les Meten (squla-meten-oppervlakte-1-gouden, "Hoe groot is het?")

Gespeeld op 10 november 2026 door de onafhankelijke keurder, als Testkind (groep 3), op de laptop. Ik ben in gedachten
een kind van 6. Ik heb de les niet zelf meegebouwd.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Zichtbare Chrome met de echte stem** (Google-stem, met geluid), via het lesoverzicht `/voorbeeld/les`, echt op de link
  geklikt:
  - **(b) met fouten** (route "fouten"): 10 keer eerst fout, 5 keer ook een 2e fout (samen voordoen), 2 keer hetzelfde
    antwoord 2 keer (ruitjes "even én niet", muurtjes 3, 7, 5), blaadjes aantikken bij het tellen, plaatjes slepen;
  - **(a) een kind dat (bijna) alles goed doet** (route "woorden"), ook voor het oplichten van de woorden.
- **Chrome zonder venster** (snelle nepstem; schermfoto's bij elke vraag, elke hint en elk samen voordoen): **alles fout**
  op 1440×900, **goed** (2 keer; van gedachten veranderen bij kies er 2, eerste plaatje echt slepen, blaadjes aantikken),
  **elk ander fout antwoord**, **vangnet** (niets doen bij de kleine stap), **lang wachten** (hulphandje), **tik op de
  pijl**, **kleur**, en een nieuwe route **dichtbij** (bij typen eerst 1 eronder, dan 1 erboven).
- Schermfoto's: in de scratchpad van de keurder (niet in Git). Ik heb ze zelf bekeken (zie "Kijken als een kind").

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven tikken
(15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **143**; er kwam niets bij.

---

## PROBLEMEN

### 1. Twee keer "Dat is dichtbij." bij dezelfde vraag — KLEIN (hersteld)
- **Wat hoor je:** bij "Hoe groot is de tafel?" typ ik 9, Bliepo zegt "Dat is dichtbij." Ik typ daarna 11, en Bliepo
  zegt weer precies "Dat is dichtbij." Dezelfde zin 2 keer achter elkaar (5.10, BLIEPO-KARAKTER §2).
- **Oorzaak:** de zin wordt per vraag gekozen (`v.nr % 3`), niet per poging.
- **Hersteld:** bij de 2e fout, als het weer een getal vlak naast het antwoord is maar een ander getal, zegt Bliepo
  "Je zit er weer vlak naast." Getest met de route "dichtbij": bij alle 6 typvragen (3 + 3 die terugkomen) zijn de 2
  eerste zinnen nu verschillend.

### 2. "De rijen eronder" bij een tafel met 2 rijen — KLEIN (hersteld)
- Bij de tafel van 10 (2 rijen van 5) zei Bliepo na 2 keer "5": "De rijen eronder horen er ook bij." Er ligt maar 1
  rij onder. Nu: "De rij eronder hoort er ook bij." (en zo ook in de andere zinnen die dit zeggen, alleen bij 2 rijen).

### 3. Woorden lichten niet aantoonbaar op ± 150 ms op — open (bekend)
- Zelfde bekende grens als bij de vorige gouden lessen: de Google-stem geeft geen woordmeldingen. Zie "Tempo en stem".

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

Gespeeld: bij elke vraag het eerste en het laatste foute antwoord uit de fouttabel (routes "alles fout", "elk ander fout
antwoord" en "fouten"), 2 keer hetzelfde antwoord, en bij typen 1 eronder en 1 erboven (route "dichtbij"). De overige
rijen (vooral de vele volgordes bij de tafels) heb ik niet gespeeld maar met het fouttabel-script nagelopen (57 rijen;
bij typen elk getal van 0 tot 99, bij op volgorde elke volgorde). Een greep:

| Soort fout (voorbeeld) | Denkfout | Wat Bliepo zei en liet zien | Klopt? |
|---|---|---|---|
| schilderijen: zon + bloem | `twee-keer-kleinst` | "Je koos 2 keer 'het kleinst'. Er is maar 1 kleinste schilderij. Kijk welk schilderij de minste tegels bedekt." De tegels achter de schilderijen worden zichtbaar (gestippeld) | ja |
| schilderijen: bloem + huis | `verkeerde-kleinste` | "1 van je 2 kaartjes klopt. Het kleinste schilderij bedekt de minste tegels." (zegt niet welke) | ja; 2 paren blijven over |
| tafels: a, b, d, c | `plek-over-niet-gezien` | "Op 2 tafels staan 6 borden. Kijk ook hoeveel borden er op een tafel passen." | ja |
| tafels: d, c, b, a | `volgorde-omgedraaid` | "Je legde ze van groot naar klein. De kleinste tafel hoort vooraan, de grootste achteraan." dan samen leggen | ja |
| muurtjes: 2, 6, 4 | `overgeslagen` | "Na het muurtje van 2 stenen breed legde je het muurtje van 6 stenen breed. Zoek steeds het smalste muurtje dat nog over is." Rood rondje om vak 2 | ja (het rondje staat om de plek van de fout, niet om het antwoord) |
| muurtjes 2× hetzelfde (3, 7, 5) | `overgeslagen` 2× | "Je sloeg weer een muurtje over. Na elk muurtje komt het muurtje dat net iets breder is." | ja |
| gedraaid kaartje 2× | `draaien-verandert-grootte` | 1e: "Kaartje 2 ligt op zijn kant. Daardoor lijkt het anders. Maar draaien maakt iets niet groter of kleiner." Rondje om kaartje 2. 2e: "Je koos weer dezelfde zin. …" dan tik ik kaartje 2 en het draait terug | ja (2 keuzes: vraag 8 van Ronde 28) |
| ruitjes: even + niet, 2× | `even-en-niet-samen` 2× | 1e: "… Die 2 kunnen niet allebei kloppen. Tel de blauwe en de gele hokjes." 2e: "Je koos weer allebei. Maar 1 van die 2 zinnen kan kloppen." dan telt Bliepo blauw, ik tel geel | ja |
| matten: mat 2 | `lang-lijkt-groter` | "Mat 2 is langer. Dan lijkt hij groter. Tel hoeveel stukken elke mat heeft." Rondje om mat 2 | ja |
| matten: mat 1 | `hoog-lijkt-groter` | "Mat 1 is hoger. Dan lijkt hij groter. …" | ja |
| tafel 10: 5 | `een-rij-geteld` | "5 is de bovenste rij. Onder de bovenste rij liggen nog meer blaadjes. Tel ze ook." Rondje om de bovenste rij; mijn nummers 1 en 2 blijven staan | ja |
| tafel 10: 9, dan 11 | `een-ernaast` 2× | vóór herstel 2 keer "Dat is dichtbij."; nu "Dat is dichtbij." en daarna "Je zit er weer vlak naast." dan samen tellen | ja na herstel |
| tafel 9: 6 (alleen in het script) | `onduidelijk` (rij gemist én rij + rijen) | een zin uit het rijtje §10 + een algemene telhint | ja; geen verzonnen reden |

Geen enkele eerste zin of hint noemt het antwoord. Geen "fout", geen naam bij een fout. Rood scherm bij fout, groen bij
goed, geen rood en geen gloed op de keuze; de vinkjes gaan weg na het nakijken.

## Kijken als een kind (14.23)

- **Schilderijen:** de muur met gele tegels is groot en duidelijk; zon, bloem en huis zijn mooi en los. Onder de muur 3
  grote kaartjes ("kleinst", "kleinst", "grootst"). Ik tik er 2 aan: er komt een groen vinkje op, nog een tik haalt het
  weg; daarna het blauwe vinkje bij Bliepo. Bij de hint komen de tegels achter de schilderijen tevoorschijn, bij het samen
  voordoen staan de getallen 9, 16, 20 in een donker bolletje op de schilderijen (geel, zoals de tegels).
- **Op volgorde:** 4 tafels met witte borden en 3 muurtjes met rode stenen zijn goed te zien en te tellen; de lege vakken
  zijn gestippeld. Na een fout blijven de plaatjes even liggen, met een rood rondje om het vak waar het misging, en
  glijden dan allemaal terug. **Kaarten zijn steeds zichtbaar** (de fout van Getallenlijn zit hier niet).
- **Gedraaid kaartje:** 2 grote oranje kaartjes met 1 en 2. Duidelijk. Bij samen voordoen draait kaartje 2 rechtop.
- **Ruitjes:** blauw 2 × 4 en geel 1 × 8 op ruitjespapier; de 3 kaartjes hebben een plaatje (=, ≠, 1 2 3) met de zin.
- **Speelmatten:** puzzelstukken in vrolijke kleuren, elk stuk apart te tellen (bij 10 stukken nog groot genoeg). De
  matten 1 en 2 hebben een wit nummer ervoor; de zin "mat 1 is hoger" klopt met het beeld.
- **Tafel vol blaadjes:** groene, blauwe en oranje blaadjes; een tik geeft een donker bolletje met het nummer in de kleur
  van de blaadjes. Het invulvak met "?" staat onder de tafel, is een echt invulvak (alleen cijfers, ook op een tablet;
  HARDE REGEL 5) en gaat weg tijdens de hint. Na goed staat "10 blaadjes" onder de tafel.
- Geen gezichtjes, geen mensen, geen kaders om plaatjes (vakken om keuzes mogen). Bliepo staat nooit over de tekst; de
  pijl staat rechts en gaat niet aan en uit. Eindkaart: 0 woorden eronder.
- **Bliepo "verspringt"** 2 keer heen en terug bij "Zet de tafels op volgorde. Van klein naar groot." Dat is het vaste
  gebaar bij **groot/klein** (3.16), net als bij Getallenlijn. Overlap blijft 0.
- De schermfoto "langste stuk" van de test liet het beginscherm zien terwijl de pagina nog laadde ("Compiling"); dat is
  de ontwikkelversie, geen fout van de les.

## F7, F8, F9 (ook de melding van de bouwer: "1 zin even wit en dan gedimd")

- **Gedimd en weer gedimd (de melding van de bouwer): 1 keer gezien, in de 2e run van "lang wachten"; 0 keer in de andere
  runs** (alles fout, fouten en woorden met de echte stem, goed 2×, vangnet, elk ander fout antwoord, tik op de pijl,
  kleur, dichtbij, 1e run lang wachten), bij een belasting van 2 tot 12. **Oorzaak gevonden, en die zit niet in deze les:**
  bij elke zin vraagt de gedeelde stem (lib/stem.ts) eerst aan de site of Ruth die zin al heeft. Bij een drukke computer
  duurde dat antwoord daar 4,1 s (bij de vorige zin 0,5 s). De tekst staat dan gedimd te wachten; na 2,5 s maakt de
  gedeelde tekst (BliepoTekst) hem wit, en als de browserstem daarna toch begint, wordt hij weer gedimd. Gemeten bij
  "Het schilderij met de zon is het kleinst." (Bliepo leest de kaartjes voor): wacht 19,3 s, wit 21,8 s, stem 23,4 s.
  Niet veranderd (gedeelde code; keuze voor Sara in KEUZES-VOOR-SARA.md Ronde 28b).
- **F7 (tekst komt terug zonder actie): 1 keer gezien** in de 1e run van "lang wachten" ("Je bent goed bezig. Hier komt een
  plaatje."), daarna niet meer (2e run: 0). Zonder logboek van die run kon ik de oorzaak niet vinden; waarschijnlijk
  hetzelfde trage antwoord (niet zeker). Alle andere runs: 0.
- F8 (2 keer uitgesproken): **0** in elke run, ook met de echte stem.
- F9: overlap **0**, tekstvak, eerste regel en pijl **0** sprongen; tekst past in het vak.

## Heel snel en lang wachten

- Heel snel: Bliepo zegt niets over snel (draaiboek Meten §3 A.2 en C.2: Synthesis ook niet). Een tik tijdens de vraag
  stopt de stem.
- Lang wachten bij kiezen, kies er 2 en typen: niets. Bij op volgorde en bij samen tellen/de kleine stap: het handje met 1
  zin ("Je bent goed bezig. Hier komt een plaatje.") 7,9–9,3 s na het begin van de opdracht (± 6 s na de opdrachtzin). Het handje wijst een leeg vak of het volgende blaadje aan, nooit
  het goede plaatje.
- Vangnet: 20 s niets bij de kleine stap → Bliepo doet het zelf en begint met "Kijk, …" (geen "Ja").

## Tempo en stem

- Einde zin → volgend stuk: gemiddeld 732–778 ms (doel ± 700). Een paar keer ± 955 ms, na het laatste getal bij samen
  tellen (zoals de bouwer al meldde).
- Echte stem, route fouten: 104 zinnen, 82 helemaal uitgesproken, 22 afgebroken omdat ik al tijdens de vraag tikte (mag).
- Echte stem, route woorden: 64 zinnen, 46 helemaal uitgesproken, 18 afgebroken door mijn tik tijdens de vraag (mag).
- Woorden oplichten: 0 woordmeldingen van de Google-stem. Eerste woord gemiddeld 46 ms na de start van de stem (goed);
  einde: 10 van de 12 meetbare zinnen binnen ± 150 ms (gemiddeld 112 ms ernaast, grootste 496 ms). Uit de gedeelde
  schatting (lib/stem.ts); met Ruth komen echte tijden. Open, zoals bij de vorige lessen.
