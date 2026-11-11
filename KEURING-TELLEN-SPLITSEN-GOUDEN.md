# KEURING gouden lessen Tellen en Splitsen, na de omzetting naar de nieuwste gouden stijl

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit 3ec543b (omzetting), fbce536
(wit blijft wit) en fe61dde (woord voor woord oplichten). Kind-test: KINDTEST-TELLEN-SPLITSEN-GOUDEN.md. Eerdere keuringen
van deze lessen (vóór de omzetting): KEURING-TELLEN-GOUDEN.md en KEURING-SPLITSEN-GOUDEN.md.

Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in
de database geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind.
`les_uitkomsten`: hoogste id vóór en na alles **147**.

## UITSLAG

| Les | Oordeel |
|---|---|
| **Tellen** (squla-tellen-fruit-1-gouden) | **GOEDGEKEURD** na 2 kleine herstellingen |
| **Splitsen** (squla-splits-splitsen1-1-gouden) | **GOEDGEKEURD** na 4 kleine herstellingen |

Telling: 0 ernstig, 0 middel, **6 klein** (alle 6 hersteld, opnieuw getest), 1 nieuwe vraag aan Sara (KEUZES Ronde 32).
De inhoud (vragen, getallen, keuzes, goede antwoorden) is niet veranderd.

## Hoe ik gekeurd heb (alle cijfers na de herstellingen, tenzij anders vermeld)

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 2.1–2.2, 3.7, 3.11–3.20, 4, 5, 6.10, 7.8, 14.2, 14.20, 14.30–14.37, 15.9–15.30),
  LESRECEPT.md, BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES Ronde 20–31, SQULA-VOORTGANG.md, eerdere
  keuringen (Meten, Getallenlijn), de zinnenbestanden, de lessen en de vlakken.
- **Waarheid van elke zin voor elk antwoord:** `npx tsx scripts/fouttabel-tellen-gouden.ts` (30 foute antwoorden, 90
  beweringen) en `npx tsx scripts/fouttabel-splitsen-gouden.ts` (121 foute antwoorden, 176 beweringen): in orde. Daarnaast
  zelf alle **paren** foute antwoorden per vraag nagelopen (Tellen 60 paren): zo kwamen punt 1 en 5 boven. De scripts
  controleren dat nu zelf.
- `npm run opgaven`: in orde. `npm run inhoudsvergelijk` (tegen de vorige commit en tegen 06a1a3c, vóór de omzetting):
  **0 verdwenen**.
- **Speelcontrole** (`node scripts/speelcontrole.mjs`, F7=1), na de herstellingen:
  | | GOED | ALLEFOUT |
  |---|---|---|
  | Tellen | 34 stappen, tot het eind, F7 0, F8 0 | 302 stappen, tot het eind, F7 0, F8 0 |
  | Splitsen | 36 stappen, tot het eind, F7 0, F8 0 | 74 stappen, tot het eind, F7 0, F8 0 |
- **Eigen testscripts, alle routes** (Chrome zonder venster, nepstem): Tellen kleur, goed, fouten, alles fout, ander fout
  getal, vangnet, wachten; Splitsen Nee-route, Ja-proef, proef mislukt, uitleg vastlopen (2), proef-handje, langzaam
  schuiven, goed, alles fout, vangnet. Alles in orde. **Nooit op de pijl hoeven tikken; 0 stukken die op een tik wachten.**
- **Overlap en sprongen** (route alles fout, ONTWERP=1):
  | Schermmaat | Tellen | Splitsen |
  |---|---|---|
  | 1440 × 900 | 0 overlap, 0 sprongen, eindkaart 0 woorden eronder | idem (2e keer; zie hieronder) |
  | 1280 × 720 | idem (2e keer; zie hieronder) | idem |
  | 1536 × 864 | idem | idem |
  | 1024 × 768 | idem | idem |
  Twee keer faalde een meting door iets buiten de les, en is daarna opnieuw gedaan en in orde: Tellen 1280 × 720 ("pijl
  bij de opdracht samen tellen") liep terwijl ik een zinnenbestand bewaarde (de ontwikkelversie bouwt dan opnieuw);
  Splitsen 1440 × 900 ("het splitsvlak loopt onder het tekstvak", 1 meting bij de start) liep terwijl een andere sessie
  de ontwikkelserver herstartte en een eigen test draaide (belasting 74). Het Phaser-doek had toen langer dan 1,5 s zijn
  beginmaat.
- **Tempo:** einde zin → volgend stuk: Tellen gemiddeld 739 ms (700–886 ms, 0 buiten 550–950 ms). Splitsen gemiddeld
  945–952 ms: de uitschieters (16–18 van 125, tot 4,1 s) zijn de momenten waarop Bliepo zelf pionnen legt (bekend, Ronde
  29 punt 5); bij alles goed 825 ms. Reactie na de laatste neerleg ± 0,28 s.
- **Hulphandje:** alleen bij opdrachten (samen tellen, slepen); bij keuzevragen 0 keer iets. Tellen: 7,2 s na het begin
  van de opdracht (± 6 s stilte na de zin). Splitsen: 3 keer gezien (uitleg, proef). Het script van Splitsen meldt 2 keer
  "hulphandje NEE" bij 7 s, maar meet dan te vroeg (vanaf het begin van de zin, niet vanaf het einde); in de code komt het
  6 s nadat Bliepo uitgesproken is. Niet als fout geteld; staat in LESRECEPT.
- **Vangnet:** Tellen 20 s niets → "Kijk, ik tel de rest. Het zijn er 12."; Splitsen → "Kijk, ik leg de rest erbij. 5 is
  2 en 3." Geen "Ja".
- **F7 / F8 / wit blijft wit:** 0 / 0 in alle runs; `scripts/test-wit-blijft-wit.mjs` (site 3,5 s traag, 120 s per les):
  elk 4 keer een zin wit vóór Bliepo, **0 keer daarna weer grijs**.
- **Woord voor woord** (`scripts/test-woord-oplichten.mjs`, zichtbare Chrome, echte Google-stem, via het lesoverzicht):
  Tellen 2 zinnen, 14/14 en 12/12 woorden apart, grootste sprong 1 woord, eerste woord 66–72 ms na de start. Splitsen
  4 zinnen; in de 1e meting lichtte in de eerste zin 1 woord niet apart op (17/18, eerste woord niet gemeten, computer
  druk); herhaald: 18/18, 9/9, 14/14, eerste woord 80–100 ms na de start. Gedeelde code; geen fout van de les.
- **Kleur:** appels rood, peren groen, pruimen paars; Splitsen paars 201,162,255, oranje 255,173,92, totaal wit. Na het
  herstel ook de losse 1.
- **Killtweens / onzichtbare dingen:** nagelopen in beide vlakken. Tellen zet na `killTweensOf` de maat terug en het
  handje op zichtbaar; Splitsen zet bij terugleggen altijd `alpha: 1` en de maat. Alles op de schermfoto's te zien.
- **Vloeiend (regel 7): NIET gemeten.** De computer was niet rustig (een test van een andere sessie draaide, belasting 26
  tot 74) en de Mac stond in de **energiebesparende stand** (Low Power Mode aan; die houdt het scherm op 30 beelden/s).
  Zo'n meting zegt niets. Laatste meting (Ronde 29, vóór deze kleine herstellingen, die alleen tekst raken): Tellen 60 /
  59 beelden/s, Splitsen 60 / 59–60. Opnieuw meten als de stand uit staat en er niets anders draait.
- `les_uitkomsten`: **147** vóór en na alles.

## Per regel

| Regel | Tellen | Splitsen |
|---|---|---|
| 15.22 inhoud Squla, 14.30 juiste antwoorden | goed (15 vragen, 3 keuzes, 1 goed) | goed (15 vragen; splitsen vanzelf nagekeken, doos met vinkje) |
| 15.9 / 14.36 fouttabel, waarheid | goed na herstel 1 | goed na herstel 3–5 |
| 15.17 hint verklapt niets | goed (richting niet genoemd als er dan 1 keuze over is) | goed ("1 te veel" niet bij de doos; geen "omgedraaid"; "de rest" bij vraag 7) |
| 15.11 2 pogingen | goed (1e: hint, 2e: uitleg + samen tellen, door) | goed (1e: hint, opnieuw; 2e: uitleg + samen voordoen, door) |
| geen opdracht bij 2e fout | goed (script: 0) | goed (script: 0) |
| 15.27 pijl | goed: vanzelf door ± 0,7 s; geen pijl bij vraag, opdracht, handje, eindkaart | goed (idem; langer alleen als Bliepo zelf legt) |
| 15.28 F7, 15.29 F8 | 0, 0 | 0, 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen, 4 schermmaten | idem |
| 3.7 woorden per woord | goed | goed (1 meetfout, herhaald) |
| 3.11/3.12/14.2 taal, enkelvoud | goed na herstel 1 | goed na herstel 3–5 |
| 3.20 cijfers | goed | goed |
| 2.1/2.2/14.20 kleur getal | goed na herstel 2 | goed na herstel 6 |
| 4 begin | geen startvraag (draaiboek heeft er geen) | startvraag (draaiboek heeft er een), Ja = proef van 2 |
| 5.3 rood/groen, geen rood op keuze | goed | goed |
| 6.10 / 15.19 hulphandje | goed | goed |
| 3.15 knop 1 keer uitleggen | "Tel ze en tik op het goede getal." 1 keer | slepen 1 keer, vinkje 1 keer (door het lesscherm) |
| 3.17 naam | groet + hooguit 1 lof | idem |
| 15.13 punt 3 "volgende keer beter" | alleen bij veel fouten (gezien) | idem |
| 10.1 vloeiend | niet gemeten (computer niet rustig) | idem |
| Harde regel 2 (database) | 147 → 147 | 147 → 147 |

## Gevonden en hersteld

1. **KLEIN (Tellen) — 2 keer "dichtbij" bij 1 vraag.** Koos het kind bij 1 vraag 2 verschillende foute getallen, dan kon
   Bliepo 2 keer "dichtbij" zeggen, bijvoorbeeld bij 13 pruimen: "12 is dichtbij, maar je hebt ze nog niet allemaal
   geteld." en daarna "14 is dichtbij, maar dat zijn er te veel." Het kon bij 4 van de 60 mogelijke combinaties (vraag 3,
   6 en 12). Herstel: zei Bliepo bij de 1e fout al "dichtbij", dan bij de 2e fout een versie zonder dat woord, met
   dezelfde betekenis ("Je koos 14. Dat zijn er te veel.", "Je koos 13. Je hebt ze nog niet allemaal geteld.", "Je koos
   18. Dat scheelt niet veel."). In `squla-tellen-gouden-zinnen.ts` (`zonderDichtbij`, `dichtbijAnders`) en
   `squla-tellen-gouden.tsx`. Daarna live gezien in de les: vraag 3, eerst 12 en dan 14 → "Je koos 14. Dat zijn er te
   veel."
2. **KLEIN (Tellen) — de 1 was wit in "Je telde 1 pruim te veel." en "Je hebt 1 appel niet geteld."** (2.2, 14.20: een
   getal dat naar een voorwerp verwijst krijgt de kleur van dat voorwerp). Op de schermfoto stond de 14 paars en de 1 wit
   in dezelfde reactie. Nu in de kleur van het fruit.
3. **KLEIN (Splitsen) — meervoud bij 1 bal over (vraag 7: 6 ballen, 5 in het paarse vak).** "De andere ballen gaan naar
   de zak." (hint als alles in het paarse vak lag), "De andere gaan in de zak." (opdracht na de 1e fout), "Sleep jij de
   andere ballen naar de zak." en "Sleep de andere ballen naar de zak." (samen voordoen en het handje daarbij). Herstel:
   bij 1 over "De rest gaat naar de zak." / "De rest gaat in de zak." (niet "de andere bal": dat zou verklappen dat het
   antwoord 1 is, 15.17), en bij het samen voordoen, waar het antwoord in beeld mag, "Sleep jij de laatste bal naar de
   zak." Bij 2 of meer over blijven de zinnen precies zoals ze waren.
4. **KLEIN (Splitsen) — "Je legde er 1. Dat zijn er te weinig."** (doos, vraag 11, 13, 14 en 15). Nu "Je legde er 1. Dat
   is te weinig." (zoals het huisje al deed: "In het paarse vak ligt 1 pion. Dat is te weinig.").
5. **KLEIN (Splitsen) — 2 keer "dichtbij" bij 1 doos.** Vraag 15 (7 onder de doek): eerst 6 en dan 8 → "6 is dichtbij."
   en "Je legde er 8. Je zit er dichtbij." Nu de 2e keer "Je legde er 8. Dat scheelt niet veel." (`dichtbijAnders`).
6. **KLEIN (Splitsen) — de 1 was wit in "Sleep 1 pion naar het paarse vak."** (uitleg na Nee en de zin bij het handje) en
   in "Dat is er 1 te veel/weinig." bij het paarse vak. Nu paars, zoals "Sleep 4 pionnen naar het paarse vak" al was.

Ook aangepast: de fouttabel-scripts controleren dit nu zelf (2 keer "dichtbij" bij 1 vraag, "1. Dat zijn er", "de andere
ballen" bij 1 over), FOUTTABEL-squla-splits-splitsen1-1-gouden.md opnieuw gemaakt, WEGGEHAALD.md (3 regels: de oude
zinnen staan er nog, alleen anders geschreven), KEUZES-VOOR-SARA.md Ronde 32, LESRECEPT.md ("Geleerd bij de keuring van
Tellen en Splitsen"), FOUTEN-VOORBEELDEN.md niet (dit zijn geen fouten die Sara aanwees).

## Dezelfde fout in andere gouden lessen (alleen geteld, niets veranderd)

- **2 keer "dichtbij" bij 1 vraag:** Meer-minder 0 (nagerekend: bij geen enkele vraag zeggen allebei de foute keuzes
  "dichtbij"); Meten 0 (al hersteld in Ronde 28b). Andere gouden lessen gebruiken het woord niet in hun fouttabel.
- **"1. Dat zijn er …" / "1 ballen":** 0 in de fouttabellen van de andere 7 gouden lessen.
