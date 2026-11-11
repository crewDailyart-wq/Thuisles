# KINDTEST — gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg")

Eigen speeltest van de bouwer, 11 november 2026 (geen aparte helper: ik mocht er geen inzetten). Gespeeld als Testkind,
Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id vóór en na alles **147**.
De onafhankelijke kind-test en keuring moeten nog.

## Hoe gespeeld

- `scripts/test-rekentaal-gouden.mjs`, routes: goed (met eerst een ander voorwerp kiezen en weer weg; bij op volgorde
  eerst 1 zetten en terug), alles fout, fouten (afwisselend), ander fout antwoord, weer (hetzelfde foute antwoord 2
  keer), vangnet (niets doen bij de kleine stap), volgvangnet (niets doen bij op volgorde), wachten (9 s bij kiezen, 7,2 s
  bij opdrachten), tik op de pijl, kleur. Plus schermfoto's van elk soort beeld (route goed en alles fout).
- `scripts/speelcontrole.mjs` met F7=1: GOED en ALLEFOUT.
- Schermfoto's bekeken als een kind van 6.

## Per foute keuze (14.37): wat Bliepo zei

| Vraag | Gekozen | Denkfout | Wat Bliepo zei (1e fout) | Klopt het? |
|---|---|---|---|---|
| 1 groter (pannenkoek) | de kleine | groot-klein-verwisseld | "Je koos deze pannenkoek. Hij is kleiner dan de andere. Vergelijk hoe breed ze zijn. Welke pannenkoek is groter?" + rondje om de gekozen | ja |
| 2 kleiner (beker) | de grote | groot-klein-verwisseld | "Je koos deze beker. Hij is hoger en breder dan de andere. Kijk hoe hoog en hoe breed ze zijn. Welke beker is kleiner?" | ja |
| 3 vol | het lege glas | vol-leeg-verwisseld | "Je koos dit glas. Het is leeg. Zoek sap tot aan de rand. Welk glas is vol?" | ja |
| 4 leeg | het volle glas | vol-leeg-verwisseld | "Je koos dit glas. Het is vol. Kijk waar geen sap in zit. Welk glas is leeg?" | ja |
| 5 zwaarder | de appel | zwaar-licht-verwisseld | "Je koos de appel. Die hangt hoger. Kijk welke kant van de weegschaal zakt. Wat is zwaarder?" | ja |
| 6 lichter | de zak meel | zwaar-licht-verwisseld | "Je koos de zak meel. Die hangt lager. Iets lichts gaat omhoog op de weegschaal. Wat is lichter?" | ja |
| 7 langer | de korte sliert | lang-kort-verwisseld | "Je koos deze sliert. Die stopt eerder. Kijk waar elke sliert ophoudt. Welke sliert is langer?" | ja |
| 8 korter | de lange sliert | lang-kort-verwisseld | "Je koos deze sliert. Die loopt verder door. Ze beginnen bij dezelfde streep. Welke sliert is korter?" | ja |
| 9 grootst | de kleinste / de middelste | groot-klein-verwisseld / middelste-gekozen | "Dat is de kleinste." / "Die is niet de grootste." + "Vergelijk ze allemaal met elkaar. Welke mand is het grootst?" | ja; na de eerste zin blijven er 2 manden over |
| 10 half vol | het volle / het lege | helemaal-vol / leeg-in-plaats-van-half | "Dat is helemaal vol." / "Daar zit niets in." + "Kijk tot waar het sap komt. Welk glas is half vol?" | ja |
| 11 kleinst | de grootste / de middelste | groot-klein-verwisseld / middelste-gekozen | "Dat is de grootste." / "Die is niet de kleinste." | ja |
| 12 langst | het kortste / het middelste | lang-kort-verwisseld / middelste-gekozen | "Dat is het kortste." / "Dat is niet het langste." + "Ze beginnen bij dezelfde streep. …" | ja |
| 13 zwaarder | de lege mand | grootste-gekozen | "Je koos de lege mand. Die is groot, maar hangt hoger. Kijk welke kant van de weegschaal zakt. Wat is zwaarder?" | ja |
| 14 kortst | het langste / het middelste | lang-kort-verwisseld / middelste-gekozen | "Dat is het langste." / "Dat is niet het kortste." | ja |
| 15 volgorde appels | middelste eerst | niet-bij-kleinste | "Je begon met deze appel. Er ligt nog een kleinere. Begin met de kleinste en pak dan steeds een grotere. Zet de appels van klein naar groot." | ja; daarna gaan alle appels terug naar boven |
| 15 (2e fout) | kleinste, grootste, middelste | grootste-in-het-midden | "Je zette de grootste in het midden. Na de kleinste komt eerst de middelste." | ja |
| 16 volgorde bekers | 2 keer niet bij de kleinste begonnen | niet-bij-kleinste 2 keer | "Weer stond de kleinste niet vooraan. Van klein naar groot: je begint links." | ja ("weer" klopt: de 1e keer zei hij het ook) |

Alle 29 foute antwoorden staan met eerste zin, hint, uitleg en samen voordoen in FOUTTABEL-squla-rekentaal-gouden.md.

## Uitkomsten

- Elke route tot de eindkaart, **nooit op de pijl hoeven tikken**, 0 stukken die op een tik wachten.
- Rondje bij een fout 32 / 16 / 16 keer (alles fout / fouten / ander fout), **0 keer om het antwoord**.
- "Weer" bij de 2e fout met hetzelfde antwoord: 16 van 16.
- Vangnet kleine stap: 3 keer, daarna "Kijk, deze pannenkoek is groter." (geen "Ja").
- Vangnet op volgorde (45 s niets): "Ik help je met deze." en dan samen; de opdrachtregel komt terug als opdracht
  zonder pijl ("Tik jij op de grootste appel?").
- Hulphandje alleen bij opdrachten: kleine stap 7,5–8,1 s na het begin (± 6 s na de zin), op volgorde 8,6 s na het
  begin (bij de eerste lege plek). Bij kiezen 0 keer iets.
- Tik op de pijl: binnen 59–158 ms het volgende stuk.
- Einde zin → volgend stuk: gemiddeld 724–839 ms per route; 1 keer 1006 ms (alles fout, na "Ja, de meloen is
  zwaarder." → de volgende vraag; de Mac was druk, een andere helper bouwde tegelijk).
- F7 0, F8 0, 0 keer weer gedimd; overlap 0, sprongen 0, tekst nooit buiten het vak, eindkaart 0 woorden eronder, op
  1440×900, 1280×720, 1536×864 en 1024×768. Het speelvlak blijft links van het tekstvak.
- Speelcontrole F7=1: GOED 55 stappen, ALLEFOUT 181 stappen, tot het eind, F7 0, F8 0.

## Wat ik zag op de schermfoto's (als kind)

- Dezelfde tekeningen als de oude les: pannenkoeken, bekers, glazen sap, manden, appels, meloen, aardbei, zak meel,
  broodjes, slierten. Geen ogen, geen gezichtjes, geen kader om een plaatje.
- De weegschaal kantelt duidelijk naar de zware kant.
- Bij lang en kort staat de gestippelde startstreep; alles begint daar.
- Een gekozen voorwerp krijgt alleen een groen vinkje, geen rand en geen gloed.
- Het rode rondje staat om wat Bliepo noemt; bij het langste broodje is het rondje breed, maar het blijft links van het
  tekstvak.
- Op volgorde: de voorwerpen springen naar de plank; de lege plekken worden van links naar rechts groter (zoals de oude
  les).
- Op de donkere achtergrond zijn de donkerblauwe randen iets minder goed te zien dan in de oude les; de voorwerpen zelf
  zijn wel duidelijk (zie KEUZES Ronde 42).
