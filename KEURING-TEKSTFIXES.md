# KEURING tekstwijzigingen Ronde 46 in Tellen, Minsommen, Plussommen, Splitsen en Meer-minder

Onafhankelijke keurder, 12 november 2026, branch backup-squla (na commit a053aa4; wijzigingen uit b4856bc). Niets
veranderd aan lessen, niets online, geen helpers, hoogste id `les_uitkomsten` voor en na: **147**. Getest als Testkind.

## UITSLAG

| Les | Uitslag |
|---|---|
| Tellen (squla-tellen-fruit-1-gouden) | GOEDGEKEURD |
| Minsommen (squla-min-machine-1-gouden) | GOEDGEKEURD |
| Plussommen (squla-plus-bakkerij-1-gouden) | GOEDGEKEURD |
| Splitsen (squla-splits-splitsen1-1-gouden) | GOEDGEKEURD |
| Meer-minder (squla-meer-minder-evenveel2-1-gouden) | GOEDGEKEURD |

De 3 gevraagde wijzigingen kloppen in alle lessen. 0 harde fouten in de gevraagde wijzigingen.
Wel 1 **kleine** harde fout van dezelfde soort die niet in Ronde 46 zat (kale cijfers elders), en 1 vraag voor Sara.

## Hoe ik gekeurd heb

- `git show b4856bc` gelezen (zinnen en code van Tellen, Minsommen, Plussommen, Splitsen; Meer-minder had al de vaste
  sleutel in `kies()`, regel 204 van `squla-meer-minder-gouden.tsx`, alleen het testscript is erbij gekomen).
- Fouttabel-scripts voor alle 5 gedraaid: allemaal "in orde" (Tellen 90 beweringen, Min 30 foute antwoorden, Plus 51,
  Splitsen 176 beweringen en 121 foute antwoorden, Meer-minder 30). De FOUTTABEL-bestanden bleven na regenereren
  gelijk aan wat er stond.
- Testscripts: Tellen `kleur,goed,allefout`, Minsommen `goed,allefout`, Plussommen `goed` en `allefout`, Meer-minder
  `goed` en `allefout`, Splitsen (alle routes). Alles **Alles in orde**, 0 keer op de pijl getikt, 0 overlap,
  0 sprongen, F7 en F8 0, en niets bijgekomen in `les_uitkomsten`.
- Speelcontrole GOED en ALLEFOUT: Tellen 73 en 302 stappen, Min 66 en 173, Meer-minder 59 en 161, Splitsen 41 en 74
  stappen, allemaal tot het eind. Plussommen: "komt niet verder" bij "Welk antwoord hoort bij welke som? Tik op een som
  en dan op het antwoord" (verbindopdracht, kan de speler niet; dat is geen fout, wel handmatig nakijken; de
  per-les test haalt de eindkaart wel).
- `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: 0 verdwenen.

## Per wijziging

1. **"Je koos X." niet meer bij de 2e fout (Minsommen en Plussommen).** GOED.
   Minsommen: de eerste zin is leeg gemaakt bij de 3 uitlegzinnen waar het getal 2 keer stond
   (`squla-minsommen-gouden-zinnen.ts`, de 3 `""`-regels na de opmerking "Ronde 33 punt 2"). Plussommen: `kort: ""`
   bij te-veel en te-weinig. In de test van allefout staat geen "Je koos 3. 3 gaat eraf" meer. Tellen, Splitsen en
   Meer-minder kenden dit probleem niet; "Je koos 18. Dat zijn er te veel. Je telde een paar pruimen te veel." bij Tellen
   is 2 verschillende getallen en blijft staan.
2. **Kale cijfers wit (`{n:wit}`).** GOED voor wat gevraagd was: in het vaste rijtje "Al {3:wit} goed achter elkaar!",
   "{3:wit} keer op rij goed. Wauw!", "Probeer het nog {1:wit} keer"; in Tellen de 6 zinnen "Wijs elke appel {1:wit}
   keer aan", "Elke appel krijgt {1:wit} nummer", "niets {2:wit} keer", "We tellen ze {1:wit} voor {1:wit}". In de
   test-uitvoer van Tellen en Rekenmix 4 staan die als `{1:wit}` en `{2:wit}`. Zie punt K1 voor wat er nog kaal is.
3. **Aantal-zin onthoudt de hele les (geen 2 keer dezelfde aantalzin).** GOED. De test "zin met het aantal 2 keer
   achter elkaar dezelfde" geeft overal 0 (Tellen goed, Min goed, Plussommen goed, Meer-minder goed).
   Tellen: `telVorige` in de staat; Plussommen en Splitsen: vaste sleutel "reactie" in `kies()`; Minsommen en klok idem.

## Bevindingen

**K1. KLEIN, harde fout (regel 14.20, 2.2): er staan nog kale cijfers in zinnen van dezelfde soort.** Niet zichtbaar
(op het scherm ook wit), geen blokkade. Voorbeelden:
- Tellen `squla-tellen-gouden-zinnen.ts` regel 98: "Je telde fruit tot wel 17." (slotzin).
- Splitsen `squla-splitsen-gouden-zinnen.ts` regel 227: "Ja, alle 3 huisjes kloppen."; regel 281: "Er komen 2 delen."; in de
  test: "Hier zijn 6 ballen. 5 gaan naar het paarse vak, de rest in de zak." (hulphandje).
- Meer-minder `squla-meer-minder-gouden-zinnen.ts` regel 95: "Nu iets anders: 3 kaarten met koekjes."; regel 100:
  "rijen van 10"; regel 175-182 en 214-223: "Raak elke kraal maar 1 keer aan", "Er is 1 kraal 2 keer geteld",
  "In een volle rij liggen 5 kralen".
Alleen de zinnen die Sara noemde (Ronde 45 A en B) zijn gedaan. De fouttabel-scripts van deze 5 lessen controleren
niet op kale cijfers (die van Rekenmix, Geld, Dagen, Tijd, Vormen en Rekentaal wel). Advies: dezelfde controle in
deze 5 scripts zetten en de kale cijfers omzetten.

**V1. Vraag voor Sara.** In Plussommen komt na "{n} en {n} zijn samen {n}." soms meteen "Ja, {n} en {n} zijn samen
{n}." (alleen "Ja," erbij). De test telt dat als verschillend (0 dubbel), maar een kind hoort bijna dezelfde zin 2 keer
achter elkaar met andere getallen. Wil je dat de controle ook "Ja," negeert? Advies: ja.
