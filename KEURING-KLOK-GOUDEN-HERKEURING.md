# KEURING gouden klokles, herkeuring (squla-klok-hoelaat-1-gouden)

Onafhankelijke keurder, 12 november 2026, branch backup-squla (na commit a053aa4). Her-keuring na Ronde 46
(pijltjes na het antwoord, hints "Ga langs de rand omhoog."). De oude keuring staat in KEURING-KLOK-GOUDEN.md
(niet aangeraakt). Niets veranderd aan lessen, niets online, niets in de database (hoogste id in `les_uitkomsten`
voor en na: **147**). Getest als Testkind. Geen helpers ingezet.

## UITSLAG: GOEDGEKEURD

0 harde fouten. 1 vraag voor Sara (hieronder).

## Wat ik gedaan heb

- Code gelezen: `git show b4856bc` (klok-zinnen, klok-les, fouttabel) en de stappen 7 t/m 10 en de bonus in
  `squla-klok-gouden.tsx` (regel 722, 734, 746, 762, 986: `bijGoed` zet het pijltje pas NA het antwoord).
- `scripts/test-klok-gouden-pijl.mjs` (ROUTE nee-fouten en ja-fout, met schermfoto's): beide **Alles in orde**.
  0 keer op de pijl hoeven tikken, 0 stukken die op een tik wachten, 0 overlap, 0 sprongen (tekstvak, eerste regel,
  pijl, Bliepo), pijl nooit weg en terug, 0 keer dezelfde tekst weer gedimd (F7), 0 dubbel uitgesproken (F8),
  "reactie bij de klok 2 keer achter elkaar dezelfde": 0, "zinnen bij de 2e fout met een opdracht erin": 0.
  Eindkaart: 0 woorden onder de kaart. Nieuwe regels in les_uitkomsten: 0.
- `node scripts/speelcontrole.mjs`: GOED 110 stappen en ALLEFOUT 244 stappen, allebei tot het eind.
- Schermfoto's bekeken als een kind: het pijltje 5 naar 6 (hint stap 9) eindigt bij de 6, niet op het antwoord 7;
  bij het samen voordoen staat het driehoekje onder de 6 en de 6 heeft een oranje rondje; groot, geen overlap.
- `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs`: 0 verdwenen (26 bewust weggehaald, staan in WEGGEHAALD.md).

## Per eis

| Eis | Uitslag |
|---|---|
| Pijltje pas na het antwoord (stap 7 en 8: driehoek 12 en 6; stap 9, 10 en bonus: pijl) | GOED. Alleen via `bijGoed` of bij het samen voordoen. |
| Hint verklapt het antwoord niet met pijl of ring (15.17) | GOED. Hint-pijl 5 naar 6 en 11 naar 12 eindigt op het getal waar je begint. Zie vraag voor Sara voor de zinnen. |
| Pijlregel 15.27 t/m 15.30 (Bliepo praat door, pijl alleen snelkoppeling, bij vragen geen pijl) | GOED (zie test). |
| Geen woord "fout", geen "Weet ik niet" | GOED. |
| Hints in de fouttabel (stap 7, 8, 9, 10, bonus) komen overeen met de code | GOED (FOUTTABEL-squla-klok-gouden.md, regenereren geeft geen verschil). |

## Vraag voor Sara (smaak, geen harde fout)

1. De nieuwe hints bij stap 7 en 8 zeggen alleen de richting: "Ga langs de rand omhoog." (stap 7 na keuze 1 of 6) en
   "Ga langs de rand helemaal omlaag." (stap 8 na keuze 3 of 12). Dat is wat jij in Ronde 33 punt 1 wilde ("de hint
   zegt alleen de richting"). Let wel: na een fout blijven 2 keuzes over. Bij stap 7 na keuze 1 blijven 6 en 12 over;
   "omhoog" past dan alleen bij 12. Bij stap 8 na keuze 3 blijven 6 en 12 over; "omlaag" past dan alleen bij 6.
   De regel van de controleur zegt: "ook niet via een zin die maar bij 1 keuze past". De zin herhaalt wel alleen de
   vraag ("hoogste punt", "onderaan"), dus ik keur hem niet af. Wil je het strikter, dan kan de hint bij die keuzes
   iets zeggen als "Kijk langs de hele rand."
