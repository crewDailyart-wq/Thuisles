# KINDTEST — gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, "Rekenmix 1")

Eigen speeltest door de bouwer (11–12 november 2026), als Testkind, in Chrome zonder venster met een leeg profiel en
zonder koekje van een kind. **Dit is geen onafhankelijke kind-test**: die en de keuring doet een aparte helper.
Hoogste id in `les_uitkomsten` vóór en na: 147 → 147.

Link: http://localhost:3000/voorbeeld/les/squla-rekenmix-mix1-1-gouden?naam=Testkind

## Wat ik deed

| Route | Wat | Uitslag |
|---|---|---|
| goed | alles in 1 keer goed, nooit op de pijl | tot de eindkaart; vraag 1 samen natellen 7 nummers, 1152 ms per nummer (draaiboek 1100–1200); einde zin → volgend stuk gemiddeld 849 ms (1 keer 1002 ms bij het natellen) |
| allefout | elke vraag 2 keer fout (eerst het ene, dan het andere foute getal), dan samen tellen | tot de eindkaart; 30 reacties, elk met de goede denkfout; 0 opdrachten in de zin bij de 2e fout; 15 keer samen tellen |
| anderefout | het andere foute getal bij de 1e poging, dan goed | elk fout antwoord van de fouttabel minstens 1 keer gekozen (met allefout samen) |
| fouten | afwisselend goed, 1 fout, 2 fouten | 10 hints, 5 keer samen tellen; goed na een fout = alleen een korte bevestiging |
| vangnet | bij samen tellen 20 s niets doen | Bliepo telt de rest zelf: "Kijk, ik tel de rest. Het zijn er 7." (geen "Ja") |
| wachten | 9 s wachten bij een vraag, 7,2 s bij samen tellen | bij vragen 0 keer iets tijdens het wachten; bij samen tellen het hulphandje na ± 7,2 s met 1 zin |
| tik-door | tik op de pijl tijdens het praten | na 39–324 ms het volgende stuk |
| kleur | kleur van de getallen in Bliepo's tekst | appel/bal/auto/bloem rood, potlood groen, ster geel, knikker blauw; "1 keer", "1 nummer", "2 keer" wit |

## Per fout antwoord (route allefout, gekozen antwoord → wat Bliepo zei)

| Vraag | Gekozen | Denkfout (tabel) | Wat Bliepo zei | Klopt? |
|---|---|---|---|---|
| 1. 7 appels (door elkaar) | 8 | te-veel | "Je koos 8. Dat is te veel. Begin opnieuw. Elke appel tel je maar 1 keer." | ja: richting klopt, 6 en 7 blijven over |
| 1. 7 appels | 6 (2e) | te-weinig | "Je koos 6. Je hebt ze nog niet allemaal geteld. Er mist nog 1 appel." + samen tellen | ja |
| 2. 10 ballen (rijen 4+4+2) | 11 | te-veel | "11 is te veel. Begin linksboven en tel rustig. Wijs elke bal 1 keer aan." | ja: ze liggen in rijen |
| 3. 6 potloden (2 aan 2) | 5 | te-weinig | "5 is dichtbij, maar je hebt ze nog niet allemaal geteld. Tel nog eens, van links naar rechts. Sla er geen potlood over." | ja |
| 3. 6 potloden | 7 (2e) | te-veel | "Je koos 7. Dat is te veel. Er is 1 potlood 2 keer geteld." | ja (zonder "dichtbij": niet 2 keer bij 1 vraag) |
| 7. 10 ballen (2 aan 2) | 7 (2e) | te-weinig | "Je koos 7. Je hebt ze nog niet allemaal geteld. Er missen nog een paar ballen." | ja: 3 verschil, dus geen "dichtbij" |
| 10. 8 potloden (rijen) | 9 | te-veel | "Je koos 9. Dat is te veel. Begin opnieuw. Elk potlood tel je maar 1 keer." | ja ("elk potlood") |
| 14. 10 ballen (rijen 5+5) | 9 | te-weinig, zonder richting | "9 is dichtbij. Tel nog eens rustig. Wijs elke bal aan en zeg het getal." | ja: "te weinig" zou alleen 10 overlaten |
| 14. 10 ballen | 7 (2e) | te-weinig | "7 is te weinig. Er missen nog een paar ballen." | ja (1e keer zonder richting, dus geen "weer") |

De volledige lijst van alle 30 foute antwoorden staat in FOUTTABEL-squla-rekenmix-mix1-1-gouden.md; alle 30 kwamen in
de test voorbij met de zin uit de tabel.

## Scherm

- Schermfoto's van elke vraag (vraag, na de 1e fout, na de 2e fout, samen tellen) bekeken: de dingen staan los, groot
  en goed telbaar, links van het tekstvak; geen kader, geen gezichtjes. De nummers staan boven elk ding in de kleur van
  het ding en raken de rij erboven niet.
- Door elkaar (7 appels) is op 1024 × 768 vrij klein maar goed te tellen.
- Overlap Bliepo met tekst, knoppen of pijl: 0; sprongen > 2 px: 0; eindkaart: 0 woorden eronder; op 1440 × 900,
  1024 × 768, 1280 × 720 en 1536 × 864. Zone: het vlak blijft 67 px links van het tekstvak.

## Stem en tekst

- F7 (tekst terug zonder actie): 0. F8 (dubbel uitgesproken): 0. Wit blijft wit (site 3,5 s traag): 12 keer wit vóór
  Bliepo, 0 keer daarna weer grijs.
- Woord voor woord met de echte Google-stem: 7/7 en 12/12 woorden apart opgelicht; per woord gemiddeld 108 ms naast het
  gesproken moment, 13 van 17 binnen ± 150 ms.

## Wat ik zelf zag als "kind"

- Fijn: elke vraag is hetzelfde spel (tellen en tikken), dus het kind weet snel wat het moet doen.
- Let op: bij "2 aan 2" met 12 bloemen lijkt het op 2 rijen van 6; "van links naar rechts" klopt daar wel.
