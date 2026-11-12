# KEURING gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, "Rekenmix 1")

Onafhankelijke keurder (niet de bouwer), 12 november 2026, branch backup-squla, na commit ded5bd1. Eigen speeltest van
de bouwer: KINDTEST-REKENMIX-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 44. Mijn vragen: Ronde 45.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 2 kleine herstellingen (1 in de les, 1 in het controlescript; geen inhoud, geen antwoord, geen zin
veranderd).

Telling: 0 ernstig, 0 middel, **2 klein** (hersteld en opnieuw getest), **4 open punten voor Sara** (A t/m D).
De inhoud (15 vragen, dingen, aantallen, ligging, keuzes, goede antwoorden, volgorde) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 2.1–2.2, 3.7, 3.11–3.20, 5.1–5.11, 6.10, 7.8, 14.20–14.37, 15.9–15.30),
  LESRECEPT.md (alle "Geleerd bij"-blokken, ook Rekenmix), FOUTEN-VOORBEELDEN.md (F1–F10), WOORDEN-GROEP3.md,
  KEUZES Ronde 44, de fouttabel, KEURING-REKENTAAL-GOUDEN.md, de les, de zinnen, het nieuwe vlak, de oude les en de
  gouden les Tellen.
- **Elke vraag volgt de gouden les van zijn onderwerp:** alle 15 vragen zijn telvragen. Verloop, tempo, zinnen (vraag,
  natellen, samen tellen, vangnet, lof met het aantal) en de reactie bij een fout komen uit de gouden les Tellen
  (geïmporteerd, niet gekopieerd). Eigen: de hints per ligging, de uitleg bij de 2e fout, begin- en slotzin. In orde.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-rekenmix.tsx `mix1_1` tegen `VRAGEN`): 15 vragen in
  dezelfde volgorde, met dezelfde dingen, aantallen (7, 10, 6, 9, 12, 5, 10, 11, 8, 8, 12, 11, 9, 10, 8), ligging
  (door elkaar / rijen 4+4+2, 3+3+3, 5+5+2, 4+4+3, 4+4, 3+3+3+2, 5+5 / 2 aan 2) en keuzes. Het script vergelijkt het
  ook. Niet overgenomen (zoals Tellen): de startvraag met 6 appels; de keuzes staan in willekeurige volgorde (zoals Tellen).
- **Harde regel 1:** `git diff 8a1ea6b ded5bd1` op squla-rekenmix.tsx, squla-rekenmix-vlak.tsx, squla-rekenmix-tekenen.ts
  en de les Tellen: **leeg** (niets veranderd). `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: **0 verdwenen**; na
  mijn herstel tegen de werkmap ook 0. `npm run opgaven`: in orde.
- **Fouttabel-script** (`npx tsx scripts/fouttabel-rekenmix-gouden.ts`): 30 foute antwoorden, 263 beweringen, 151
  reacties, 386 zinnen: in orde. Daarnaast zelf elke eerste zin, hint, uitleg en "weer"-zin van de 30 rijen nagelopen
  tegen het beeld: elke zin is waar voor dat antwoord, na eerste zin + hint blijven altijd 2 keuzes over (het goede er
  bij), geen woord of getal 2 keer in 1 reactie, geen woord van de niet-lijst, geen "fout", enkelvoud bij 1 ("Er mist
  nog 1 appel", "elk potlood"), "dichtbij" alleen bij 1 of 2 verschil (vraag 7, 10 en 14: "Je koos 7. Je hebt ze nog
  niet allemaal geteld." / "7 is te weinig.").
- **Speelcontrole** (`F7=1`, na herstel): GOED 39 stappen, ALLEFOUT 229 stappen, allebei tot het eind, F7 0, F8 0.
- **Testscript** `scripts/test-rekenmix-gouden.mjs`, alle routes (na herstel): kleur, goed, fouten, allefout, anderefout,
  vangnet, wachten, tik-door, woorden: **Alles in orde**. Nooit op de pijl hoeven tikken; 0 stukken die op een tik
  wachten; einde zin → volgend stuk gemiddeld 739–842 ms (2 keer 1005 ms bij "Laten we ze samen natellen.", daar begint
  het natellen). Vangnet: "Kijk, ik tel de rest. Het zijn er 7." (geen "Ja"). Hulphandje alleen bij samen tellen, 7,2 s
  na het begin van de opdracht; bij keuzevragen 0 keer iets tijdens 9 s wachten. Tik op de pijl: 42–346 ms tot het
  volgende stuk. Goed na een fout: alleen een korte bevestiging.
- **Overlap en sprongen** (ONTWERP, route alles fout) op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768: steeds 0
  overlap, 0 tekst buiten het vak, 0 sprongen (tekstvak, eerste regel, pijl, Bliepo), pijl nooit weg en terug, eindkaart
  0 woorden eronder (kaart links van het tekstvak). Het vlak blijft 67 px links van het tekstvak.
- **Schermfoto's** (78 stuks, 1440 × 900, alle 15 vragen: vraag, na de 1e fout, na de 2e fout, samen tellen,
  eindkaart) bekeken als een kind van 6: de dingen staan los, groot en telbaar, links van het tekstvak; geen kader,
  geen gezichtjes, geen poppetjes; ook bij de opening staan de 7 appels al in beeld. Pijl rechtsonder de tekst bij
  tekst, geen pijl bij vragen en bij "Tik op elke … Ik tel mee.". Woorden grijs → wit → oranje (gezien bij "Tik op elk
  potlood."). Getal in de kleur van het ding: appel, bal, auto, bloem rood; potlood groen; knikker blauw; ster geel;
  "1 keer", "2 keer", "1 nummer" wit. Geen rondje in deze les (Bliepo wijst niets aan). Hints passen bij de ligging:
  "rij voor rij"/"linksboven" alleen bij rijen, "van links naar rechts"/"Begin links" alleen bij 2 aan 2, "van boven
  naar beneden" alleen door elkaar.
- **Onzichtbaar na killTweensOf:** alleen op losse plaatjes (opwippen, goed) en het handje, nooit op de groep die met
  `tover()` verschijnt; daarna alpha en schaal terug. Op geen enkele foto ontbrak iets: 0 keer.
- **Wit blijft wit** (`LESSEN=squla-rekenmix-mix1-1-gouden DUUR=120`, site 3,5 s traag): 10 keer een zin wit vóór
  Bliepo, **0 keer daarna weer grijs**.
- **Woord voor woord** (`IJK=1`, zichtbare Chrome, echte Google-stem): **7/7 en 12/12 woorden apart opgelicht**,
  grootste sprong 1 woord, eerste woord 69–77 ms na de start; per woord gemiddeld 115 ms naast het gesproken moment,
  12 van 17 binnen ± 150 ms (grootste 513 ms). Zelfde beeld als bij de andere gouden lessen (gedeeld spreekmodel).
- **Vloeiend** (`ALLEEN=squla-rekenmix-mix1-1-gouden npm run vloeiend`, 2 keer, geen andere test liep): laptop 59–60
  beelden/s, langste beeld 38 en 26 ms; trage telefoon 59–60 beelden/s, langste beeld 40 en 22 ms. Openen in de
  ontwikkelversie 1,3–1,4 s / 3,2–3,5 s (op de echte site meten, moet onder 1 s). **Eerlijkheid:** de energiebesparing
  stond de hele keuring aan (`lowpowermode 1`); bij het begin liep de Mac op de batterij (10 %), bij de meting zat de
  stekker erin (63 %). Toen haalde hij 59–60, niet de valse 30 van de bouwer.
- **Eerlijkheid:** mijn eerste ronde met 4 schermmaten tegelijk liep vast door een te hoge belasting (85–92). Die heb ik
  gestopt en daarna alles na elkaar gedraaid; de uitslagen hierboven zijn van die tweede ronde.

## De 2 herstellingen

1. **De zin met het aantal kon 2 keer achter elkaar dezelfde zijn** (BLIEPO-KARAKTER, nooit 2 keer achter elkaar
   dezelfde zin uit een rijtje). De bouwer bewaarde het rijtje per aantal en kleur, maar opeenvolgende vragen hebben
   een ander aantal, dus de vorige zin werd niet overgeslagen. Gemeten (route goed, met een nieuwe controle in het
   testscript): "Je telde er 8. | Je telde er 9." achter elkaar. **Hersteld** in squla-rekenmix-gouden.tsx
   (`lofZinnen`, `telVorige`: de vorige zin geldt over de hele les; alleen als er dan nog een gewone zin over is, zodat
   er nooit "Ja … Ja …" komt). Daarna 3 keer de route goed: **0 keer** 2 keer achter elkaar. Geen zin veranderd.
2. **De verklapcontrole in het fouttabel-script** las de tekst mét kleurcode ({1:wit} keer), waardoor "1 keer" en
   "maar 1" niet als richting telden. **Hersteld** (`kaal(...)`); de uitslag blijft in orde.

## Gouden les Tellen: wat de bouwer meldde (alleen geteld, niet veranderd)

- **Kale cijfers:** 6 zinsjablonen in squla-tellen-gouden-zinnen.ts: de 3 hints bij "te veel" ("Wijs elke … 1 keer
  aan." 2 keer, "Elke … tel je maar 1 keer."), "Elke … krijgt 1 nummer." (2 keer, in beide "weer"-zinnen) en "Dan tel
  je niets 2 keer.". Plus "We tellen ze 1 voor 1." (2 keer, alleen bij "onduidelijk", komt in Tellen niet voor).
  Op het scherm is zo'n kaal cijfer gewoon wit, net als {1:wit}; het is dus geen zichtbare tekstfout. Niet veranderd
  (Sara, Ronde 44 punt 8a).
- **De zin met het aantal 2 keer achter elkaar:** klopt, maar anders dan de bouwer schreef. Precies dezelfde tekst
  komt in Tellen nooit 2 keer achter elkaar (de aantallen van opeenvolgende vragen verschillen altijd), wel dezelfde zin
  met een ander getal ("Het zijn er 12." en daarna "Het zijn er 11."). Hetzelfde zit in de gouden lessen
  **Meer-minder** (TELREACTIE) en de **klok** (KLOKREACTIE): **3 van de 13** andere gouden lessen. Niet veranderd
  (Sara, Ronde 44 punt 8b en Ronde 45 punt C).

## Open punten voor Sara (Ronde 45)

- **A.** Kale cijfers in het vaste rijtje van alle gouden lessen (BLIEPO-KARAKTER): "Al 3 goed achter elkaar!",
  "3 keer op rij goed. Wauw!", "Het gaat steeds beter: al 3 goed!", "3 keer goed! Dat zet ik in mijn geheugen." en
  "Probeer het nog 1 keer, met een tip.". Op het scherm wit. Het script van de bouwer keek niet naar dit rijtje.
- **B.** Kale cijfers in de gouden les Tellen (zie hierboven, 6 zinnen).
- **C.** De zin met het aantal ook in Tellen, Meer-minder en de klok niet 2 keer achter elkaar (zelfde herstel als hier).
- **D.** Vloeiend en openen op de echte site meten, vóór online.
