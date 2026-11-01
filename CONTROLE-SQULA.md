# Controle Squla-lessen

Onafhankelijke controle. De controleur bouwt niet mee en past geen lescode aan.
Oudere blokken blijven staan; nieuwe rondes komen eronder.

Speeltest: `scripts/speelcontrole.mjs` met profiel Testkind, één les tegelijk
(`TEGELIJK=1`), `MAXMIN=8`. Eén keer met `GOED=1`, één keer zonder (afwisselend
goed, fout en "weet ik niet", met `HULP=1`). De laptop was erg druk (andere
helpers, de dev-server was steeds aan het compileren); een les die niet binnen
8 minuten klaar was, is beoordeeld op de broncode en de schermfoto's die er wel zijn.

---

## Meten en maten

### squla-meten-pizza-1 — Pizza's vergelijken — ronde 1 — AFGEKEURD (2026-10-31 11:30)
- Rekenen: in orde. Alle goede antwoorden en testAntwoorden kloppen; de volgorde klein-midden-groot klopt.
- Plaatje: in orde. Pizza's, ijsjes en open pizzadozen, geen mensen of gezichten. Tip: bij de grote pizza in de doos (DOOS(1)) steekt de pizza aan de voorkant over de rand van de doos.
- Taal: FOUT. Bij het ijsjes-ordenen zegt Bliepo "Eerst de kleinste ijsje, dan de middelste, en dan de grootste." (moet zijn: "het kleinste ijsje"). In de uitleg van dezelfde vraag: "Welke ijsje komt het minst hoog?" (moet zijn: "Welk ijsje"). Oorzaak: `ordenGrootte` in `squla-meten.tsx` r. 392 en r. 396 plakt "de kleinste ${wat}" en "Welke ${wat}" vast aan elkaar. Voorstel: geef `ordenGrootte` het lidwoord mee (de/het, welke/welk). Tip: "Dit ijsje is nog te klein. Welk ijsje is groter?" en "Deze pizza is nog te klein" zeggen niet welke van de twee bedoeld wordt.
- Spelen: met GOED=1 de eerste twee keer 0 stappen (de pagina kwam niet op tijd, drukte); de derde keer liep hij 25 stappen door tot vraag 12 en stopte op de tijdsgrens. Zonder GOED: 34 stappen, liep door tot de tijdsgrens. Niets kapot. Schermfoto's: beeld en zin kloppen, niets over elkaar.

### squla-meten-pizza-2 — Pizza's vergelijken (moeilijker) — ronde 1 — AFGEKEURD (2026-10-31 11:30)
- Rekenen: in orde. Tellen tot 5, meer, één meer en één minder kloppen allemaal; afleiders zijn echt fout.
- Plaatje: in orde (pizzapunten en ijsjes met losse bolletjes). Tip: bij "één bolletje minder" vanaf 5 staat er een ijsje met 6 bolletjes als afleider; het level gaat tot 5.
- Taal: FOUT. Tikt het kind bij "Waar liggen meer stukken pizza?" op het plaatje met één stuk (vraag 4 − 1 en 2 − 1), dan zegt Bliepo "De één stukken? Niet helemaal." `squla-meten.tsx` r. 565: `` `de ${a === 1 ? "één" : a} stukken` ``. Voorstel: bij 1 "het ene stuk" (of "het plaatje met één stuk").
- Spelen: GOED=1: liep door tot de laatste drie vragen, toen tijdsgrens (drukte). Zonder GOED: tot het eind (22 stappen), niets kapot.

### squla-meten-pizza-3 — Pizza's vergelijken (nog moeilijker) — ronde 1 — AFGEKEURD (2026-10-31 11:30)
- Rekenen: in orde. Op elke weegschaal hangt de goede kant omlaag (kant −1 = links omlaag, 1 = rechts omlaag, nagerekend in de tekencode), en de goede antwoorden kloppen.
- Plaatje: FOUT (2×).
  1. "Twee dozen. Ze zijn even groot." en in de uitleg "De dozen zijn even groot. Daar zie je het dus niet aan." Maar de blauwe doos (`doos-blauw.png`, bijna een kubus) is in beeld duidelijk hoger en groter dan de rode doos (`doos-rood.png`, plat). Zie schermfoto pizza-3/030. Voorstel: twee dozen met dezelfde vorm, alleen een andere kleur.
  2. "Eén olijf, of een grote schaal vol olijven?": in `olijfschaal` (`squla-meten-tekeningen.ts` r. 631–636) worden de olijven eerst getekend en de schaal eroverheen. Er steken maar drie olijven boven de rand uit; het lijkt een bijna lege schaal (schermfoto pizza-3/035). Voorstel: de olijven ná de schaal tekenen, als een berg bovenop.
- Taal: in orde. De personen (Marco, Omar) zijn weg; "even zwaar als de pizzaoven" en "even zwaar als een zak meel" zijn logisch. Tip: in de ovenvraag zegt Bliepo "Eén zak meel kun je nog net tillen", en twee vragen later is een schaal olijven "ongeveer net zo zwaar als een zak meel". Dat past niet goed bij elkaar. Tip: met twee dingen is "zwaarder" juister dan "het zwaarst"; de les wisselt die twee af.
- Spelen: GOED=1: tot het eind (16 stappen). Zonder GOED: zie hieronder (aanvulling).

### squla-meten-hoeveelheden-1 — Vol, leeg, zwaar en licht — ronde 1 — GOEDGEKEURD (2026-10-31 11:30)
- Rekenen: in orde (volgorde minder → meer water, vol-voller-volst, evenveel: telkens precies één goed antwoord).
- Plaatje: in orde. Manden, fruitstokjes, boterhammen, bekers, potjes, flesjes, schalen; geen mensen.
- Taal: in orde. Tip: de titel "Vol, leeg, zwaar en licht" past niet bij dit level: zwaar en licht komen pas in level 2.
- Spelen: GOED=1: de eerste keer begon de les halverwege opnieuw (dev-server laadde de pagina opnieuw); de tweede keer tot het eind (26 stappen), niets kapot.

### squla-meten-hoeveelheden-2 — Vol, leeg, zwaar en licht (moeilijker) — ronde 1 — AFGEKEURD (2026-10-31 11:30)
- Rekenen: in orde (weegschaal en wip hangen goed; ½ liter vol = 1 liter half vol).
- Plaatje: FOUT. "Hier liggen vier boeken op elkaar." De vier boeken zweven met een flinke ruimte ertussen; het is geen stapel (schermfoto hoeveelheden-2/020). `boeken` in `squla-meten-tekeningen.ts` r. 640–647: de stap van 46 is te groot voor het dunne `boek.png`. Voorstel: de boeken laten aansluiten. De wip met de bal en het speelblok klopt (bal links, blok rechts, juiste kant omlaag).
- Taal: FOUT (resten van mensen).
  1. r. 1210: "Mama heeft water met fruit." Mama staat er nog in, terwijl de bouwer meldt dat mama eruit is. Voorstel: "Er is water met fruit."
  2. r. 1166–1167: "Zijn ze even zwaar? Dan gaat niemand omlaag." en "Bij even zwaar gaat niemand omlaag." Er liggen een bal en een blok op de wip, geen mensen. Voorstel: "Dan gaat geen van beide omlaag." of "Dan blijft de wip recht."
  3. r. 1179–1180 (knikker, appel, boeken): "Wie weegt dan het meest?", "Wie is het grootst en weegt het meest?", "Wie is het zwaarst?". Voorstel: "Wat weegt dan het meest?", "Wat is het grootst en weegt het meest?", "Wat is het zwaarst?".
  - Tips: "Zet de manden op volgorde: zwaar, zwaarder, zwaarst." met de lége mand als "zwaar" (beter: "van licht naar zwaar"). "De lege rugtas is licht." komt direct nadat er appels in de rugtas zijn gegaan. "Een beker groente" klinkt vreemd (bijv. "een beker met groente").
- Spelen: GOED=1: tot het eind (18 stappen), niets kapot. De wip-, weegschaal- en maatbekerschermen kloppen met de zinnen.

### squla-meten-oppervlakte-1 — Hoe groot is het? — ronde 1 — GOEDGEKEURD (2026-10-31 11:30)
- Rekenen: in orde. Schilderijen: zon 3×3 = 9, bloem 4×4 = 16, huis 4×5 = 20 tegels; boot 3×2 = 6, boom 2×6 = 12, planeet 5×4 = 20. Tafels 2, 4, 6 en 9 plekken; matten 2×2 en 1×4, 2×5 en 1×10; ruitjes 2×4 en 1×8; blaadjes 10, 9 en 12. Alles klopt; telkens precies de goede twee zinnen.
- Plaatje: in orde. De "Wie heeft gelijk?"-kinderen zijn vervangen door drie zinnen; dat werkt goed.
- Taal: in orde. Tip: "Hier liggen twee kaartjes papier." klinkt vreemd; "twee blaadjes papier" of "twee vouwblaadjes" is natuurlijker.
- Spelen: GOED=1: 25 stappen, kwam tot de laatste drie vragen en stopte op de tijdsgrens van 8 minuten (drukte; de les liep wel door). Tip: bij "Kies er twee" leest Bliepo elke keer alle drie de lange zinnen voor; daardoor duurt de les lang.

### squla-meten-oppervlakte-2 — Hoe groot is het? (moeilijker) — ronde 1 — GOEDGEKEURD (2026-10-31 11:30)
- Rekenen: in orde. Typen: 18, 6, 16, 21, 24. Invullen: 14/7, 24/12, 10/5, 16/8, 18/9, 8/4, 20/10; de grote blaadjes passen precies (d = h alleen bij 2 rijen, d = b alleen bij een even aantal kolommen). Bij elk paar staan beide goede getallen precies één keer tussen de kaartjes.
- Plaatje: in orde (schermfoto's: tafels en muren met tegels, getallen netjes onder elke tafel).
- Taal: in orde ("een rood blaadje", "een blauwe tegel": lidwoorden en buigingen kloppen).
- Spelen: GOED=1: 36 stappen, stopte op de tijdsgrens (drukte; de les liep door).

#### Aanvulling Meten: speeltest zonder GOED (fout en hulp), 2026-10-31 12:45
Alle 7 lessen gespeeld met foute antwoorden, "Nog een keer" en "Hulp". **Geen enkele les liep vast.** Er waren geen verwijzingen naar knoppen die er niet zijn. Alleen pizza-2 kwam binnen 8 minuten tot het eind; de andere zes stopten op de tijdsgrens, maar liepen tot dan gewoon door (drukte op de laptop). De foute-antwoordzinnen zijn nagelezen. Daarin zit alleen de fout "De één stukken?" die bij pizza-2 al genoemd is; de rest klopt ("Het kleine deeg? Niet helemaal.", "De blauwe doos? Niet helemaal.", "Kort? Niet helemaal."). De oordelen hierboven blijven staan.
