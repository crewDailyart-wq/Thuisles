# KEURING Minsommen, uitleg "de machine leren kennen" (squla-min-machine-1-gouden)

Onafhankelijke keurder, 12 november 2026, branch backup-squla (commit 8720111, Ronde 34). Niets veranderd, niets
online, geen helpers, hoogste id `les_uitkomsten` voor en na: **147**. Getest als Testkind.

## UITSLAG: GOEDGEKEURD

0 harde fouten. 2 vragen voor Sara.

## Wat ik gedaan heb

- Code en zinnen gelezen: `squla-minsommen-gouden-zinnen.ts` regel 140 t/m 245 (INTRO, INTRO_VRAGEN, fouten), de
  fouttabel `FOUTTABEL-squla-min-machine-1-gouden.md` (20 nieuwe regels), `squla-minsommen-gouden.tsx`.
- Draaiboek `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/minsommen.md` (alleen lezen) tegen de zinnen gehouden: eigen woorden,
  niets letterlijk overgenomen.
- `node scripts/test-minsommen-gouden.mjs` (ROUTE goed en allefout, met schermfoto's): **Alles in orde**. 0 keer op de
  pijl getikt, 0 overlap, 0 sprongen, F7 en F8 0, teller (het totaal) 0 keer in beeld bij een keuzevraag, niets bijgekomen
  in `les_uitkomsten`. In allefout 73 stukken met pijl, 19 opdrachtzinnen zonder pijl, einde zin naar volgend stuk
  gemiddeld 745 ms.
- Speelcontrole GOED 66 stappen en ALLEFOUT 173 stappen, tot het eind.
- Fouttabel-script: "Rekencontrole en verklapcontrole in orde (15 vragen, 30 foute antwoorden)".
- Schermfoto's bekeken als een kind: de paarse stippen zijn groot, los en telbaar; de teller (4) staat in dezelfde
  paarse kleur als de stippen; de plusknop is wit met zwarte plus; de 3 antwoordknoppen (Delen, Optellen, Aftrekken)
  zijn wit met zwarte tekst; Bliepo staat rechts en overlapt niets; niets staat op elkaar.
- `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: 0 verdwenen. De 15 vragen zijn ongewijzigd (git diff van de 15
  vragen leeg; alleen de intro is erbij gekomen).

## Per eis

| Eis | Uitslag |
|---|---|
| 4 stappen en 2 keuzevragen daarna 15 ongewijzigde vragen | GOED (de 15 vragen en hun volgorde onveranderd). |
| 2 pogingen: 1e fout = hint, 2e fout = uitleg en samen voordoen (kind tikt zelf op de plus) | GOED (`samen` bij elke intro-vraag). |
| Hint verklapt het antwoord niet | GOED voor "Wat doet het totaal": hint "Kijk naar het totaal bovenaan. Wat stond daar eerst, en wat staat er nu?" wijst alleen naar een plek. Zie V1 voor de 2e vraag. |
| Geen woord "fout", geen "Weet ik niet", geen cijfertoetsenbord | GOED. |
| Getallen niet dubbel (Ronde 33 punt 2: "Je koos 3. 3 gaat eraf.") | GOED: bij de 2e fout is de eerste zin leeg. |
| Cijfers voor hoeveelheden en kleur van het voorwerp (3.20, 2.2) | GOED: "Doe er nog {2:paars} stippen bij", "Eerst was het {3:paars}, nu is het {4:paars}"; geen kaal cijfer in de intro. |
| Niet-lijst woorden, grammatica groep 3 | GOED: korte zinnen ("Eerst leer je mijn stippenmachine kennen. Hij helpt je straks bij het aftrekken."), "stippen", "totaal", "optellen", "aftrekken" zijn schooltermen van de les. |
| Pijlregel | GOED: Bliepo praat door, pijl alleen bij tekst, geen pijl bij de 2 keuzevragen en bij "Tik op de plusknop". |
| Knop-uitleg alleen de eerste keer | GOED: "Tik op de plusknop onder de machine." komt 1 keer; het hulphandje zegt daarna "Tik op de plusknop." (hulp, geen uitleg). |
| Eerste keuzevraag heeft maar 2 keuzes | Niet fout, wel opmerken: na de 1e fout blijft 1 keuze over. De hint zegt dan alleen waar te kijken. Zie V2. |

## Vragen voor Sara (smaak, geen harde fout)

**V1.** Bij "Wat heet het als je steeds stippen erbij doet?" is de hint na keuze "Aftrekken" of "Delen":
"Kijk wat de plusknop met de stippen doet: komen ze erbij of gaan ze eraf?" (regel 168 `HINT_PLUS`). Dan blijven
"Optellen" en "Delen" over. "Erbij" past alleen bij Optellen. Dat verklapt niet het woord, maar wijst wel naar 1
keuze. Wil je de hint neutraler ("Kijk wat de plusknop met de stippen doet")? Advies: ja.

**V2.** "Delen" is 1 van de 3 antwoorden. Een kind van 6 kent dat woord misschien nog niet als rekenwoord. Het staat
in het draaiboek van Synthesis als afleider. Laten staan? Advies: ja, maar niet op de niet-lijst gezet.
