# KEURING gouden Rekenmix 2, 3 en 4 (mix2-1, mix3-4, mix4-1)

Onafhankelijke keurder, 12 november 2026, branch backup-squla (commits 6e5be1f, 2d7ee4e, a053aa4, 4c38ca4). Overzicht:
RAPPORT-REKENMIX-OVERZICHT.md. Niets veranderd aan lessen, niets online, geen helpers, hoogste id `les_uitkomsten` voor en
na: **147**. Getest als Testkind.

## UITSLAG

| Les | Uitslag |
|---|---|
| Rekenmix 4 (squla-rekenmix-mix4-1-gouden: tellen, druk plaatje, 2 rijen samen) | GOEDGEKEURD |
| Rekenmix 3 (squla-rekenmix-mix3-4-gouden: hoeveel zitten er in de doos) | GOEDGEKEURD |
| Rekenmix 2 (squla-rekenmix-mix2-1-gouden: meer, minder, evenveel, de meeste, de minste) | AFGEKEURD (2 harde fouten in de taal, snel te herstellen) |

## Hoe ik gekeurd heb

- De 3 zinnenbestanden helemaal gelezen (`squla-rekenmix2-gouden-zinnen.ts`, `squla-rekenmix3-...`, `squla-rekenmix4-...`)
  en de 3 FOUTTABEL-bestanden; de zinnen van Rekenmix 2 daarnaast echt laten uitvoeren (`npx tsx` op `GOEDREACTIE`) om te zien
  wat het kind hoort.
- Inhoud tegen de oude lessen: de 15 vragen per les zijn dezelfde als `mix2_1`, `mix3_4` en `mix4_1` in
  `squla-rekenmix.tsx` (het fouttabel-script vergelijkt dingen, aantallen, keuzes, volgorde en meldt "vergeleken").
  Oude les `squla-rekenmix.tsx` niet aangeraakt (`git diff 8a1ea6b HEAD` leeg op dat bestand).
- Fouttabel-scripts: Rekenmix 4 "15 vragen, 30 foute antwoorden, 263 beweringen, 153 reacties, 387 zinnen, geen verklapper";
  Rekenmix 3 "15 vragen, 30 foute antwoorden, 76 beweringen, 444 zinnen, 0 kaal"; Rekenmix 2 "15 vragen, 30 foute plaatjes,
  26 beweringen, 120 reacties, 401 zinnen, 0 cijfers". Alle "Alles in orde". FOUTTABEL-bestanden onveranderd.
- Testscripts met `ROUTE=allefout` en schermfoto's (alle 3: **Alles in orde**): Rekenmix 4 en Rekenmix 3 en Rekenmix 2.
  0 keer op de pijl getikt, 0 stukken die op een tik wachten, einde zin naar volgend stuk gemiddeld 724 tot 745 ms, 0
  overlap, 0 sprongen, F7 en F8 0, "zinnen bij de 2e fout met een opdracht erin: 0", niets bijgekomen in `les_uitkomsten`.
  Mix 2: 108 stukken met pijl en 15 opdrachtzinnen zonder pijl.
- Speelcontrole GOED en ALLEFOUT: Mix 4 45 en 197 stappen, Mix 3 57 en 183, Mix 2 54 en 169; allemaal tot het eind.
- Schermfoto's bekeken als een kind. Mix 4: 8 raketjes tussen 4 sterren en 2 planeten (druk plaatje), telbaar, groot,
  los van elkaar; 2 rijen ballen (4 en 3) met ruimte ertussen. Mix 3: het splitsbeen (6 boven, 2 en ? onder), de doos
  groot in het midden, de 2 ballen die buiten liggen links, na het samen tellen de ballen boven de doos met de nummers 3
  t/m 6; getal in de kleur van de bal (rood). Mix 2: 4 boterhammen/plaatjes groot en duidelijk (stapel kaas, 4 plakken,
  1 blokje), het vinkje komt na een tik op een plaatje.
- Oude lessen onveranderd: `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: 0 verdwenen.

## HARDE FOUTEN (Rekenmix 2)

**H1. Grammatica (regel 7): "Die boterham is de volst." / "Die boterham is de leegst."**
- `squla-rekenmix2-gouden-zinnen.ts` regel 149 (`GOEDREACTIE`, zin B). Uitvoer van de code: bij een vraag met een boterham
  ("de meeste", "de minste", vraag 7 en 14) hoort het kind: "Die boterham is de volst." en "...is de leegst." Dat is geen
  Nederlands; het moet "het volst" of "de volste" zijn. Bij een spiesje staat het wel goed ("Dat spiesje is het volst.").
  Oorzaak: `h.het === "de" ? "de" : "het"` zet "de" voor een bijvoeglijk-naamwoordsvorm zonder "-e". Het gebeurt in 1 van
  de 3 goed-zinnen, dus bij elke boterham-vraag met meest of minst kans 1 op 3 (vraag 7 en 14).
  De fouttabel-controle ziet het niet (alleen woorden en getallen).
- Ook in de uitleg bij de 2e fout staat "Je zoekt de boterham die het volst is." (regel 203): dat klopt wel.

**H2. Losgeplakte zin: "Kijk nog eens goed naar alle 3."** (regel 204, hint bij een plaatje zonder voorbeeld)
- Uitvoer in de test: vraag 2 (spiesje) en 14 (boterham) "Je koos juist het minste fruit. Kijk nog eens goed naar alle 3."
  Er staat geen zelfstandig naamwoord achter "alle 3" ("alle 3 spiesjes" / "alle 3 boterhammen"). Het kind heeft het
  alleen gehoord. Regel 7 (geen losgeplakte stukken) en regel 3.12/14.25 (de zin past bij wat in beeld staat).

## KLEINE PUNTEN

**K1. Rekenmix 2: "leger" en "voller" voor groep 3.** "Je zoekt de boterham die voller is" en "...die leger is" (regel 202-204). Het
zijn gewone woorden, maar op WOORDEN-GROEP3 staan ze niet. Klein, geen blokkade.

**K2. Rekenmix 3: hint "Begin bij 7 en tel door tot 8." bij verschil 1** (vraag 10: totaal 8 buiten 7; vraag 11: totaal 6 buiten 5). De hint
zegt niet het antwoord (1) maar het kind hoeft maar 1 stap te tellen. Is toegestaan, wel erg dichtbij. Klein.

**K3. Rekenmix 3: samen tellen eindigt op "4. In de doos zaten er 4."** (getal 2 keer). Dit is het vaste patroon van de gouden
Tellen-les (laatste teltal en dan de uitkomst) en is eerder goedgekeurd (KEURING-REKENMIX-GOUDEN.md). Geen actie.

## Per eis (alle 3 lessen)

| Eis | Uitslag |
|---|---|
| 2 pogingen (hint 1e fout, uitleg en samen voordoen 2e fout), les gaat altijd door | GOED (allefout tot de eindkaart). |
| Hint verklapt het antwoord niet (15.17), ook niet via een zin die bij 1 keuze past | GOED in alle 3 (script en eigen nalopen; Mix 4 zonder richting waar maar 1 keuze overbleef). |
| Geen woord "fout", geen "Weet ik niet", geen cijfertoetsenbord | GOED. |
| Getallen niet dubbel in 1 reactie | GOED (script "herhaalcontrole"). |
| Kleur van het getal volgt het voorwerp (rood bal en raket, blauw knikker, geel ster, paars planeet en ufo, groen satelliet) | GOED op de foto's. |
| Cijfers voor hoeveelheden, kale cijfers wit | GOED (0 kaal in Mix 3 en 4; Mix 2 heeft geen cijfers behalve "{3:wit}"). |
| Pijlregel (Bliepo praat door, geen pijl bij vragen) | GOED. |
| Niet-lijst woorden ("groepje", "vergelijk") | GOED (script en nalopen). |
| Eén juist antwoord | GOED (elke vraag 1 goed plaatje of getal). |

## Vragen voor Sara

**V1.** Rekenmix 2: wil je "de volste/de leegste" ("Die boterham is de volste") of "met het meeste kaas"? Een kind van 6 zegt
liever "Daar zit het meeste kaas op." Advies: zin B weglaten of herschrijven.

**V2.** Rekenmix 4: "Tel alleen die en tik op het goede getal." (de eerste keer bij een druk plaatje). "Die" slaat terug
op "raketjes" uit de zin ervoor. Zo laten of "Tel alleen de raketjes"? Advies: de laatste.
