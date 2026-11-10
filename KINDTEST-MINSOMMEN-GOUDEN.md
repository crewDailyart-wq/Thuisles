# KINDTEST — gouden les Minsommen (squla-min-machine-1-gouden, "Minsommen: hoeveel over?")

Gespeeld op 10 november 2026 door de onafhankelijke keurder, als Testkind (groep 3), op de laptop. Ik ben in gedachten
een kind van 6. Ik heb de les niet zelf meegebouwd.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Zichtbare Chrome met de echte stem** (Google-stem, met geluid), via het lesoverzicht `/voorbeeld/les` en echt op
  de les geklikt, zoals Sara het doet:
  - **(b) met fouten**: bij 10 vragen eerst fout, waarvan 5 keer ook een 2e fout (samen voordoen), 2 keer hetzelfde
    foute antwoord 2 keer, en steeds heel snel getikt (0,25 s nadat de knoppen er waren, midden in de vraagzin);
  - **(a) bijna alles goed** (af en toe 1 fout), 7 minuten, voor het oplichten van de woorden.
- **Chrome zonder venster** (snelle nepstem, met schermfoto's op elk moment dat een kind iets ziet):
  - **alles goed** (15 vragen in 1 keer goed, tot de kaart);
  - **alles fout**: bij elke vraag 2 verschillende foute antwoorden, dus **alle 30 foute antwoorden** uit de
    fouttabel 1 keer (14.37);
  - **lang wachten**: 9 s niets doen bij keuzevragen, 7 s niets doen bij "haal er … weg".
- Mijn eigen testscript is een kopie van `scripts/test-minsommen-gouden.mjs` in een tijdelijke map, met extra
  schermfoto's en een meting van de eindkaart.

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **143**; er kwam niets bij.

---

## PROBLEMEN

### 1. Bij de machine zegt Bliepo na de 2e fout "Er blijven … over" — KLEIN (hersteld)
- **Wat zie je:** de vraag is "Hoeveel blokjes komen eruit?", maar na de 2e fout zei Bliepo "Je koos 6. Er blijven meer
  over dan 6." Bij de machine "blijft" er niets over; er "komen blokjes uit". Een kind hoort 2 woorden voor hetzelfde
  (3.11, 3.12, 14.3).
- Bovendien was die zin bij elke 2e fout precies hetzelfde ("Er blijven meer/minder over dan …"). Bij alles fout hoort
  het kind dat 15 keer (5.10: afwisselen).
- **Hersteld:** machine: "Er komen meer blokjes uit dan 6." / "Er komen er meer dan 6 uit." (en "minder").
  Bord en midden: "Er blijven meer over dan 2." / "Er blijft meer dan 2 over." (en "minder"). Daarna opnieuw gespeeld:
  klopt (schermfoto: "Je koos 8. Er komen er meer dan 8 uit. Kom, we doen het samen.").

### 2. Het rode rondje bij de som in het midden raakt het min- en is-teken — KLEIN (hersteld)
- **Wat zie je:** bij 9 − 3 staat het rondje om de 3, maar de rand loopt over de "−" en de "=" (schermfoto vraag 7, 1e
  fout). Niet erg, wel slordig (1.15).
- **Hersteld:** het rondje is iets smaller (alleen in het gouden vlak).

### 3. De eindkaart staat over het begin van de tekst — MIDDEL (niet in deze les: gedeeld lesscherm)
- **Wat zie je:** op de eindkaart lopen 1 tot 4 woorden van Bliepo's laatste zin over de rechterrand van de kaart
  ("goed je best gedaan", "Volgende keer gaat het nog beter"). Gemeten in de echte pagina: de kaart loopt tot x = 1068,
  de tekst begint bij ± x = 1000.
- **Waarom:** de kaart en het tekstvak komen uit het gedeelde lesscherm (Lesscherm.tsx), niet uit deze les.
- **Ook in de andere gouden lessen** (alleen gemeten): Tellen 4 woorden, Splitsen 3, Plussommen 2, Minsommen 1 tot 4.
  De klokles kon ik met de speelcontrole niet tot de kaart spelen (niet gemeten).
- **Voorstel:** in KEUZES-VOOR-SARA.md (Ronde 24b, punt 1).

### 4. Tijdens het samen voordoen telt Bliepo de weggehaalde stippen, de teller de overgebleven — KLEIN (vraag aan Sara)
- **Wat zie je:** ik tik 1 stip weg. Bliepo zegt "1." en de grote teller zegt "9". Na 2 stippen: "2." en "8".
  Een kind van 6 kan denken: welk getal is het nou? Synthesis doet het ook zo (de tutor telt mee, de teller toont het
  totaal), dus het is het skelet. Wel staat de som (10 − 3 = ?) de hele tijd bovenaan, en daarna zegt Bliepo
  "Er blijven 7 stippen over. 10 − 3 = 7."
- Ook: het tellen ("1.") vervangt in het tekstvak de opdracht "Haal er 3 weg. Tik op 3 stippen.". De som bovenaan
  blijft staan (zoals de kopregel bij Synthesis), dus het kind kan zien hoeveel er weg moeten.
- In KEUZES-VOOR-SARA.md (Ronde 24b, punt 2 en 3).

### 5. Woorden lichten niet aantoonbaar op ± 150 ms op — open (bekend, niet in deze les op te lossen)
- Met de echte Google-stem: 0 woordmeldingen van de browser; het eerste woord licht gemiddeld 46 ms na de start op
  (goed), maar het laatste woord zit gemiddeld 255 ms naast het verwachte moment (grootste 614 ms); maar 2 van 9 goed
  meetbare zinnen vallen helemaal binnen ± 150 ms. Dat had de bouwer al gemeld (KEUZES Ronde 24): zonder woordmeldingen
  wordt geschat; met Ruth komen echte tijden. Geen nieuwe fout.

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

Alle 30 foute antwoorden 1 keer gekozen (run "alles fout"). Samengevat per soort; elke rij gecontroleerd in het logboek.

| Soort fout (voorbeeld) | Denkfout | Wat Bliepo zei en liet zien | Klopt? |
|---|---|---|---|
| 1 te weinig (10 − 3, koos 6) | `een-te-weinig` | "10 − 3 is meer dan 6. Tel 3 terug vanaf 10." Rood rondje om "− 3" op de machine. Knoppen weg, daarna terug. | ja: zegt de richting, er blijven 2 keuzes over, de hint zegt hoe je rekent |
| 1 te veel (8 − 5, koos 4) | `een-te-veel` | "8 − 5 is minder dan 4. Begin bij 8 en tel 5 terug." Rondje om de 5. | ja |
| begingetal (10 − 1, koos 10) | `begingetal-als-antwoord` | "Je koos 10: zoveel blokjes gaan erin. Er gaat er nog 1 af. Begin bij 10 en tel 1 terug." | ja, precies de denkfout |
| getal dat eraf gaat (7 − 3, koos 3; 10 − 6, koos 6) | `aftrekgetal-als-antwoord` | "Je koos 3: dat getal gaat eraf. Steek 7 vingers op en doe er 3 weg." | ja |
| richting zou verklappen (9 − 3 koos 7; 10 − 6 koos 5; 6 − 5 koos 2; 7 − 5 koos 3) | `een-te-veel` | alleen "Je koos 7." plus de hint, geen richting | ja: met "minder dan 7" bleef alleen 6 over (15.17) |
| 2e fout, andere denkfout (10 − 3: eerst 8, dan 6) | `een-te-weinig` | "Je koos 6. Er komen er meer dan 6 uit. Kom, we doen het samen." Dan stippen, kind tikt er 3 weg, "Er blijven 7 stippen over. 10 − 3 = 7." | ja; het antwoord komt pas nu in beeld |
| 2 keer hetzelfde antwoord (8 − 5: 2 en 2) | `een-te-weinig` 2× | "Je koos weer te weinig. Tel precies 5 terug, niet verder. Kom, we doen het samen." | ja: "weer" mag, want de 1e keer zei hij al "meer dan 2" |
| 2 keer dezelfde denkfout, ander getal (8 − 4: 3 en 3) | idem | "Je koos weer te weinig. Tel precies 4 terug, niet verder." | ja, anders uitgelegd dan de 1e keer |

Geen enkele hint noemt het antwoord. Geen "fout", geen naam bij een fout. Rood scherm 1,5 s bij fout, groen bij goed,
geen rood op de keuze, de knoppen verdwijnen meteen na een tik (schermfoto's).

## Kijken als een kind (14.23)

- Machine: 10 roze blokjes groot en telbaar, "− 3" groot op de machine, een vraagteken in het uitgangsvak. Het
  antwoord staat nergens tijdens de vraag (geen teller: 0 van 264 metingen tijdens een vraag, 15.20).
- Na goed draait de machine en komen de blokjes eruit; Bliepo zegt de uitkomst al terwijl de machine nog draait. Klein,
  past bij "naspelen" (1.22).
- Bord en midden: witte som (kale som, 14.27), goed leesbaar. De getallen in Bliepo's zin: bij de machine roze (10, en
  wat eruit komt) en geel/groen/oranje/blauw (wat eraf gaat, zoals op de machine); bij het bord wit.
- Samen voordoen: 10 grote roze stippen in 2 rijen van 5, de weggetikte stip wordt een gestippeld rondje in de kleur
  van wat eraf gaat; de som staat bovenaan. Na ± 6 s stil komt het hulphandje (schuin onder de laatste stip, in de lege
  ruimte) met "Jij kunt dit. Tik op een stip om hem weg te halen." (geen knop, niet bij keuzevragen: 9 s gewacht,
  niets). Schermfoto: `wachten-hulphandje-vraag1-machine-10-3.png`.
- Geen gezichtjes, geen mensen, geen kaders om plaatjes.
- Niets verspringt (0 sprongen), Bliepo staat nooit over de tekst, de pijl gaat niet aan en uit, F7 = 0, F8 = 0.

## Heel snel en lang wachten

- Heel snel getikt (midden in de vraagzin): de stem stopt, Bliepo zegt niets over snel (6.10, Min). Goed.
- Lang wachten bij een keuzevraag: niets. Bij "haal er … weg": hulphandje na ± 6 s met 1 zin. Goed.

## Tempo

- Einde zin → volgend stuk: gemiddeld 750–845 ms (doel ± 700). Na goed bij de machine 2,5–4,5 s (de les wacht op de
  machine; bekend, KEUZES Ronde 24 vraag 1).
