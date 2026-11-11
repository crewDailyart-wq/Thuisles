# KEURING gouden les Vormen (squla-vormen-patronen-1-gouden, "Patronen")

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit 39a72ce. Kind-test van de
bouwer: KINDTEST-VORMEN-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 36. Mijn vragen: Ronde 37.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 1 kleine herstelling (de pijl na het vangnet van de puzzel). De les werkt goed en volgt de regels.

Telling: 0 ernstig, 0 middel, **1 klein** (hersteld en opnieuw getest), **4 open punten voor Sara** (A t/m D).
De inhoud (vragen, kralen, dingen, vormen, keuzes, goede antwoorden, puzzel) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 2.1–2.2, 3.7, 3.15, 3.20, 5.3, 6.5, 7.8, 14.20–14.37, 15.8–15.30),
  LESRECEPT.md (ook "Geleerd bij Geld" en "Geleerd bij Vormen"), FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES Ronde 34–36,
  de fouttabel, KEURING-GELD-GOUDEN.md, de les, de zinnen, het gouden vlak, de diff van het oude vlak en de oude les.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-vormen.tsx `patronen1` tegen `VRAGEN` in
  squla-vormen-gouden-zinnen.ts): 15 vragen in dezelfde volgorde: **7 kraal kiezen, 3 ketting langer, 3 "Wat hoort bij
  de pijl?", 1 "Welke vorm komt nu?", 1 puzzel** (3 × 3, zelfde plaatje). Zelfde kralen, dingen, vormen (vierkant groen,
  driehoek oranje, cirkel paars), keuzes en goede antwoorden. De oude les heeft geen terugkomende vragen; de gouden ook
  niet. Oude les squla-vormen.tsx niet veranderd (`git diff 9261785 39a72ce`: leeg).
- **Fouttabel-script** `npx tsx scripts/fouttabel-vormen-gouden.ts`: 15 vragen, 37 foute antwoorden, 246 beweringen, 399
  zinnen op kale cijfers: in orde. Daarnaast zelf elke eerste zin, hint, uitleg en "weer"-zin van de 37 rijen tegen het
  beeld van die vraag nagelopen: elke zin is waar voor dat antwoord ("Na rood komt nooit blauw", "Links van de pijl ligt
  al een boek", "In dit patroon komt de cirkel na 2 oranje driehoeken" klopt met de kleuren in beeld), geen hint noemt het
  goede antwoord, na elke eerste zin blijven 2 keuzes over.
- `npm run opgaven`: in orde (506 oefeningen). `npm run inhoudsvergelijk` (REV=9261785 en de werkmap): **0 verdwenen**.
- **Speelcontrole** (`node scripts/speelcontrole.mjs`, F7=1, na de herstelling): GOED 92 stappen, tot het eind, F7 0,
  F8 0 (31 uitingen); ALLEFOUT 584 stappen, tot het eind, F7 0, F8 0 (126 uitingen). Vóór de herstelling ook: 104 en 585
  stappen, F7 0, F8 0.
- **Eigen testscript** `scripts/test-vormen-gouden.mjs` (nepstem), alle routes (kleur, goed, fouten, allefout,
  anderefout, weer, vangnet, wachten, tik-door, woorden): alles in orde, elke route tot de eindkaart, **nooit op de pijl
  hoeven tikken, 0 stukken die op een tik wachten**. Rondje bij een fout 13 / 28 / 14 keer, **0 keer om het antwoord**.
  "Weer" 14 van 14. Vangnet 5 keer ("Kijk, …", geen "Ja"). Hulphandje alleen bij opdrachten (ketting, puzzel, kleine
  stap; 7,4–8,0 s na het begin van de opdracht, ± 6 s na de zin), bij keuzevragen 0 keer iets. Tik op de pijl: binnen
  44–176 ms iets nieuws.
- **Tempo:** einde zin → volgend stuk gemiddeld 740–813 ms. Na de herstelling buiten 550–950 ms alleen nog na "Kijk, ik
  maak de puzzel af." (± 3,0 s: Bliepo legt dan de 9 stukjes; dat is werk van Bliepo, geen wachten).
- **Overlap en sprongen** (ONTWERP=1, route alles fout, na de herstelling): 1440 × 900, 1280 × 720, 1536 × 864 en
  1024 × 768: steeds 0 overlap, 0 tekst buiten het vak, 0 sprongen (tekstvak, eerste regel, pijl, Bliepo), pijl nooit
  weg en terug, eindkaart 0 woorden eronder. Speelvlak 93 px links van het tekstvak (1440 × 900).
- **Wit blijft wit** (`scripts/test-wit-blijft-wit.mjs`, site 3,5 s traag, 120 s): 4 keer een zin wit vóór Bliepo, **0
  keer daarna weer grijs**.
- **Woord voor woord** (`IJK=1 scripts/test-woord-oplichten.mjs`, zichtbare Chrome, echte Google-stem): 12/12 en 13/13
  woorden apart opgelicht, grootste sprong 1 woord, eerste woord 92–98 ms na de start. Per woord gemiddeld 193 ms naast
  het gesproken moment, 10 van 23 binnen ± 150 ms (grootste 646 ms). Zelfde beeld als bij de bouwer en bij Geld: dat komt
  uit het gedeelde spreekmodel van de Google-stem, niet uit deze les.
- **Vloeiend:** zie open punt D (mijn meting was vals: de hele Mac stond op 30 beelden/s).
- **Schermfoto's** van elke vraag, elke hint, elk samen voordoen, de ketting, de puzzel en de eindkaart bekeken als een
  kind van 6: kralen rond en glanzend, geen ogen of gezichtjes, geen kader om plaatjes (alleen zachte vakken om de
  keuzes), vinkje op de gekozen keuze zonder gloed, rood rondje alleen om wat Bliepo noemt, woorden grijs → wit → oranje.

## Regel 1: het oude vormenvlak (2 nieuwe opties)

- De diff van `squla-vormen-vlak.tsx` (39a72ce): alles nieuw zit achter `gouden` (standaard `false`) of `bliepoLegt > 0`
  (standaard 0). De oude lessen geven geen van beide mee (gecontroleerd: alleen squla-vormen-gouden-vlak.tsx zet ze).
  Zonder de opties loopt de code precies het oude pad (ketting op slot als hij vol is, geen extra meldingen).
- **Gespeeld (GOED):** alle 7 oude lessen met dit vlak tot het eind: patronen-1 (75 stappen), patronen-2 (57),
  kleuren-1 (613), kleuren-2 (558), kleuren-3 (539), opruimen-1 (33), orienteren-1 (22).
- **Gespeeld (ALLEFOUT):** orienteren-1 tot het eind; de andere 6 stoppen bij "een stap die alleen in de tekening kan"
  (patronen-1 bij de eerste ketting, na 150 stappen). Dat is bekend gedrag van de speelcontrole bij oude sleepvragen in
  Phaser (VERSLAG-HULP-NA-FOUT.md: toen 40 lessen), geen fout van de les en niet door de opties (die staan uit). Ik kon
  niet met de code van vóór 39a72ce vergelijken (daarvoor moet een 2e ontwikkelserver draaien).
- Opties niet weggehaald. Besluit voor Sara: Ronde 37 punt A.

## Per regel

| Regel | Uitkomst |
|---|---|
| 15.8 / 15.22 inhoud Squla, oude les blijft | goed (15 vragen: 7 / 3 / 3 / 1 / 1) |
| 14.30 één juist antwoord | goed (3 keuzes, 1 goed; ketting: 1 goede volgorde) |
| 15.9 / 14.36 fouttabel, waarheid | goed (37 rijen; alle zinnen zelf nagelopen) |
| 15.17 hint verklapt niets | goed (rondje nooit om het antwoord; handje bij de lege plek of het bord) |
| 15.11 2 pogingen | goed (1e: zin + hint, opnieuw; 2e: uitleg + samen voordoen, door) |
| 15.18 nooit stoppen | goed (ook ketting 45 s en puzzel 20 s + 20 s vangnet) |
| 15.27 pijl, vanzelf door | goed **na herstelling 1** |
| 15.28 F7 / 15.29 F8 | 0 / 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen op 4 maten |
| 3.7 woorden per woord, F10 | goed (afwijking per woord: gedeelde stem) |
| 3.15 knop 1 keer uitleggen | "Tik erop." alleen bij de eerste keuzevraag |
| 3.17 naam | groet + hooguit 1 lof |
| 3.20 cijfers | goed (geen kaal cijfer in 399 zinnen) |
| 2.1 / 2.2 / 14.20 kleur getal | goed (2 rode kralen: rode 2; 2 oranje driehoeken: oranje 2; "2 keer" wit) |
| 3.12 / 14.25 woorden kloppen met beeld | goed (kleur en vorm van de kralen en vormen kloppen; zie C) |
| 5.3 rood/groen, geen rood op de keuze | goed |
| 6.5 / 7.8a vinkje, geen gloed | goed bij kiezen; puzzelstukje licht geel op (Ronde 36 punt 8) |
| 7.8 rondje alleen als Bliepo iets noemt | goed (1 rondje om het stukje dat terugkomt) |
| 6.10 / 15.19 hulphandje | goed (alleen opdrachten, nooit op een kraal of keuze) |
| `killTweensOf` / onzichtbare kaarten | niet van toepassing: het vormenvlak gebruikt geen `killTweensOf`; op de foto's is alles zichtbaar |
| 1.1 / 1.2 geen mensen, geen ogen | goed |
| 10.1 vloeiend | niet te meten (zie D); bouwer mat 60 / 60 |
| Harde regel 2 (database) | 147 → 147 |

## Gevonden en hersteld

1. **KLEIN — na het vangnet van de puzzel bleef de blauwe pijl staan** (15.27 punt 3: bij een opdracht geen pijl) en de
   opdrachtregel was weg (14.32). Als het kind 20 s niets deed, legde Bliepo 1 stukje ("Kijk, dit stukje leg ik voor je.")
   en daarna moest het kind verder puzzelen, met de pijl er nog bij. Gemeten: 4,4 s "einde zin → volgend stuk" zonder
   vervolg. Herstel in `squla-vormen-gouden.tsx`: na die zin komt de bestaande opdrachtzin "Maak de puzzel." terug als
   opdracht (zonder pijl), zoals al na het samen voordoen gebeurde. Geen nieuwe zin, geen inhoud veranderd. Daarna opnieuw:
   routes vangnet en fouten (12 opdrachtzinnen zonder pijl, langste wachttijd 877 ms), speelcontrole GOED en ALLEFOUT,
   overlap op 4 maten: in orde.

## Open punten voor Sara (KEUZES Ronde 37)

**A. Het oude vormenvlak heeft 2 opties erbij** (`gouden`, `bliepoLegt`). Zonder die opties werkt het zoals eerst (zie
boven). Laten zo? Advies: **ja**.

**B. De losse puzzelstukjes liggen een beetje over elkaar** en links tegen de rand van het scherm. Dat zijn dezelfde
plekken als in de oude les. Laten zo, of in de gouden les netjes los neerleggen? Advies: **los neerleggen in de gouden
les** (de oude les blijft zoals hij is).

**C. Bij een fout op de 2e kraal van de ketting** zegt Bliepo "De eerste kraal klopt. Daarna sleepte je een gele kraal.
Na blauw komt nooit geel." Dan liggen de kralen al terug beneden: de blauwe kraal waar hij over praat, staat niet meer in
de ketting. Het klopt wel, maar het kind ziet het niet meer. Laten zo? Advies: **laten zo** (komt weinig voor).

**D. Vloeiend kon ik niet eerlijk meten.** De Mac stond in de energiebesparende stand en was druk (belasting 20 tot 40).
Alles gaf precies 30 beelden/s, ook de gouden les Geld die eerder 58–60 haalde: dat is de bekende valse 30. De bouwer mat
60 / 60. Graag nog 1 keer meten met de stekker erin en de energiebesparing uit, vóór het online gaat.

**Om te weten:** bij "Wat hoort bij de pijl?" komt na de hint "Zoek eerder in de rij een banaan. Kijk wat daarna komt."
nog "Wat hoort bij de pijl?". Dat is 1 keer de vraag vóór de nieuwe poging (F1, 3.23); het past in het vak (3 regels,
Bliepo springt niet). Niet als fout geteld.

## Dezelfde fout in andere gouden lessen

Gezocht in alle 10 andere gouden lessen naar "zin na een vangnet en dan weer wachten op een opdracht zonder nieuwe
opdrachtzin": **0 gevonden** (alleen in Vormen). Niets veranderd in andere lessen.
