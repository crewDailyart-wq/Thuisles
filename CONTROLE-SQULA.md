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

---

## Minsommen (2026-10-31, afgerond 2026-11-01)

Speeltest zonder GOED (fout + hulp), één tegelijk: bus1-2, ruimte-1, bus2-3, machine-2, machine-4 en kaal-3 tot het eind; ruimte-2 en ruimte-3 liepen door tot de tijdsgrens van 8 minuten (drukte). Niets liep vast. De andere 8 lessen zijn beoordeeld op de broncode (zelfde soorten vragen, zelfde code). Alle sommen, keuzes en "welke som"-vragen zijn nagerekend: overal precies één goed antwoord (bij "welke som" ook met de plus-som als lokker), en het aantal getekende dingen is gelijk aan het eerste getal.

**Pakjes in de bus (alle 6 busslessen):** FOUT. Op de schermfoto's (bus1-2/010 en 013) liggen pakje 9 en 10 van elke rij niet meer in de laadruimte: het 9e staat half op de rand, het 10e op de gele stijl naast de cabine. Oorzaak: `squla-minsommen-vlak.tsx` r. 163, `LAAD = { x: 0.11, y: 0.36, b: 0.58, h: 0.24 }`. De breedte 0.58 loopt ongeveer 70 punten voorbij het raam. Ook zijn de pakjes 40 breed bij een stap van 35,7, dus ze overlappen een beetje. Voorstel: LAAD.b afstemmen op het raam van het plaatje (zoals plussommen: x 27–116 van 200), en pakje kleiner dan de stap. **Let op:** `bezorgbus.png` is op 1 november opnieuw gemaakt; de schermfoto's zijn van vóór die tijd. Na het aanpassen opnieuw bekijken.

### squla-min-ruimte-1 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (tot 10, eraf 1–6). Plaatje: in orde (ballonnen, bellen, kometen, sterren, satellieten, ufo's, raketjes; geen dieren of mensen). Taal: in orde; enkelvoud en meervoud kloppen ("1 ufo vliegt weg", "1 raketje vliegt weg").
- Tip: het verhaal zegt "vliegen weg" of "knappen", maar in de hulp zegt Bliepo "Er gaan er 5 af." De korte uitleg gebruikt wel "weg". Overal "weg" is logischer.
- Spelen: tot het eind (38 stappen), ook met fouten en hulp.

### squla-min-ruimte-2 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (12–19, niet over het tiental; bubbels: precies 3 sommen met uitkomst 0). Taal en plaatje: in orde.
- Spelen: liep door tot de tijdsgrens; luistervraag, typen en bubbels werkten.

### squla-min-ruimte-3 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (over het tiental terug, plus "alles eraf" 16 − 16 en "niets eraf" 18 − 0). In beeld wordt eerst tot 10 grijs en dan de rest (schermfoto ruimte-3/016 klopt met de zin).
- Tip: "De ufo neemt er geen één mee." (r. 74) en "Er gaat er niet één weg." (r. 265) zijn spreektaal. Beter: "De ufo neemt er geen mee." en "Er gaat niets weg."
- Spelen: liep door tot de tijdsgrens, niets kapot.

### squla-min-bus1-1, bus1-2, bus1-3, bus2-1, bus2-2, bus2-3 — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde. Alle getallen passen bij het level: tot 10, 12–19 niet over het tiental, en over het tiental met uitkomst onder 10.
- Plaatje: FOUT, zie "Pakjes in de bus" hierboven. Elke les heeft vragen met 9 of meer pakjes in een rij.
- Taal: in orde. "In de bus liggen 8 pakjes. De bus bezorgt er 3. Hoeveel pakjes liggen er nu nog in de bus?" is logisch; "Er ligt nog 1 pakje" is enkelvoud waar dat moet.
- Spelen: bus1-2 en bus2-3 tot het eind, ook met fouten en hulp.

### squla-min-machine-1, machine-2, machine-3, machine-4 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde. Machine 10 − 1..5 en 10 − 6..10. Bakjes: de som is "alles − leeg = vol", met precies één goede knop. Geld: 6−2, 5−3, 10−5, 7−4, 4−1, 8−6, 10−1, 4−2, 9−5 kloppen allemaal.
- Tip (machine-3): bord(9, 7), bord(10, 7) en bord(8, 2) vallen buiten Squla's "eraf 3 t/m 6". Klein verschil.
- Spelen: machine-2 en machine-4 tot het eind, ook met fouten en hulp.

### squla-min-kaal-1, kaal-2, kaal-3 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (tot 10; 14–20 met één keer over het tiental; over het tiental met uitkomst onder 10). Spelen: kaal-3 tot het eind.

---

## Geld (2026-11-01)

Broncode gekeurd door een helper (alle bedragen, het wisselgeld, de munten en briefjes nagerekend), en zelf nagekeken op de punten die zijn afgekeurd. Speeltest zonder GOED: zakgeld-2 en geld-2 tot het eind, niets kapot.

Algemeen in orde:
- De munten komen uit `public/geld/los/` (doorzichtige hoeken, geen wit vierkant).
- De briefjes houden "SPECIMEN" en worden niet vergroot.
- Het prijsbordje "€ 20" past ruim binnen de rand (tekst ±60 breed in een bordje van 124).
- Er zijn geen namen meer over (Sam, Noor, hond, teddybeer).
- De vier vervangingen kloppen (twee klusjes × X euro, spaarpot + portemonnee, stoep vegen met de bezem, speelgoedraket).
- "Groepjes geld" is begrijpelijk voor een kind van 6. Tip: "Tik op de twee plekken waar … euro ligt" is nog duidelijker.

### squla-geld-geldmachine-1 — ronde 1 — GOEDGEKEURD
- Tip: r. 599 "Dit is mijn spaarpot. Er zitten munten en briefjes in." Maar `spaarpot.png` is een lege glazen pot.
- Tip: r. 562 "Oei, mijn geld zweeft door de ruimte!" Beter: "Oei, er zweeft geld door de ruimte!"

### squla-geld-geldmachine-2 — ronde 1 — AFGEKEURD
- FOUT: in het welkom kost het bootje € 8 (r. 728, `speelgoed("bootje", 8)`), in vraag 6 kost hetzelfde bootje € 6 (r. 654, 658). Voorstel: in het welkom het treintje van € 8 nemen.
- Tips: r. 702 "Je hebt precies 9 euro. Dat past precies!" (twee keer "precies"). r. 622 "een munt van 2 en een munt van 1 euro": zeg ook bij de 2 "euro".

### squla-geld-zakgeld-1 — ronde 1 — GOEDGEKEURD
- Tips: r. 781 "In je portemonnee 6 euro." is geen hele zin ("In je portemonnee zit 6 euro."). r. 883 "Een briefje van 20 euro is ook 20 euro." klinkt dubbel.

### squla-geld-zakgeld-2 — ronde 1 — AFGEKEURD
- FOUT: r. 928 "Kijk naar de kraam. Er liggen spullen op." Maar `marktkraam.png` is een lege kraam. Voorstel: de zin aanpassen ("Op een kraam liggen spullen die te koop zijn."), of een kraam met spullen.
- FOUT: r. 1024 "Nog één vraag." Daarna komen er nog drie terugvragen. Voorstel: "Nog één vraag." weghalen.
- Spelen: tot het eind (31 stappen), ook met fouten.

### squla-geld-geld-1 — ronde 1 — GOEDGEKEURD
- Tip: r. 1082 "Je trekt lijnen tussen geld dat bij elkaar hoort." De eerste vragen gaan over geld en een bedrag.

### squla-geld-geld-2 — ronde 1 — GOEDGEKEURD
- Spelen: tot het eind (106 stappen), ook met fouten.

---

## Plussommen (2026-11-01)

Broncode gekeurd door een helper, belangrijke punten zelf nagekeken. Speeltest zonder GOED: bus1-2 tot het eind (schermfoto bus1-2/004).

Alle sommen, keuzes, "welke som", verbinden en de dans-rijen (precies één kaartje of paar samen 10) zijn nagerekend: in orde. Er zijn geen borden, manden, bakplaten of kinderen meer in de zinnen.

**Pakjes in de bus:** ze liggen wel in de laadruimte; de laadruimte is goed afgestemd op het raam. Aandachtspunt (geen afkeuring): een pakje in de bus is 29 punten, het pakje naast de bus 46. Op een telefoon is het pakje in de bus maar ±11 px en raken de pakjes elkaar bijna. Het kind hoeft ze niet te tellen (het getal staat in de zin), maar groter is beter.

### squla-plus-bakkerij-1 — ronde 1 — AFGEKEURD
- FOUT (vaste regel: dezelfde vraag overal hetzelfde): r. 812 "Hoeveel donuts zijn het bij elkaar?", terwijl alle andere vragen "…zijn het samen?" zeggen. Voorstel: "Hoeveel donuts zijn het samen?"

### squla-plus-bakkerij-2, bakkerij-3 — ronde 1 — GOEDGEKEURD
- Tip: r. 455/457 "Hier staan er 13" ook bij donuts en croissants, waar de verhaaltjes "liggen" zeggen.

### squla-plus-dansen-1 en dansen-4 — ronde 1 — AFGEKEURD
- FOUT: r. 590 `` `${o(x)} oranje en ${bl(y)} blauwe stippen.` ``. Bij kaartje [6,1], [7,1] of [8,1] zegt Bliepo "6 oranje en 1 blauwe stippen." Voorstel: de bestaande helper `stippen(x, y)` (r. 156) gebruiken, die enkelvoud en meervoud regelt.

### squla-plus-dansen-2 en dansen-3 — ronde 1 — AFGEKEURD
- FOUT: r. 634 "Ik zet 1 stippen in de rij." (bij anker 1, in meerdere vragen). Voorstel: bij 1 "Ik zet 1 stip in de rij."

### squla-plus-bus1-2 en bus2-2 — ronde 1 — AFGEKEURD
- FOUT: bij 10 pakjes in de bus ([10,6], [10,7], [10,4]) zegt Bliepo "Onderin ligt een rij van 10. Daarop liggen er nog 0." (r. 681), en bij de bus staat "10 + 0" (`squla-plussommen-vlak.tsx` r. 606). Voorstel: bij precies 10 "In de bus ligt een volle rij van 10 pakjes." en alleen "10" tonen.

### squla-plus-bus1-1, bus1-3, bus2-1, bus2-3 — ronde 1 — GOEDGEKEURD
- Tip (alle busslessen): het welkom zegt "Hij brengt pakjes rond." en daarna "Bij de halte komen er pakjes bij." Dat spreekt elkaar een beetje tegen. Voorstel: "Onderweg haalt de bus nog meer pakjes op." De vraagzin met "halte" is begrijpelijk.
- Tip: de getallen bij pakjes zijn wit; bij minsommen zijn ze bruin. Kies één kleur.

### squla-plus-kaal-1, kaal-2, kaal-3 — ronde 1 — GOEDGEKEURD
- Tip: r. 737 "Er staat alleen de som, zonder plaatjes." Maar er staat wel een sierplaatje. Beter: "…zonder verhaaltje."

---

## Plaatjes (ronde 1) — 2026-11-01

Zo gekeurd:
- Alle 175 bestanden in `public/voorwerpen/` bekeken in vellen op de donkere achtergrond #0b1028: eerst in het klein, daarna de twijfelgevallen groot.
- Per plaatje uitgerekend hoeveel lichte pixels er aan de buitenrand zitten. Waar dat hoog was (zon, slingerlampje-rood, mand, spies-vol, brood, ballon, beker-vol, satelliet), groot nagekeken. Dat bleken echte lichte delen van het ding (glas, glans), geen witte randjes.
- Met glans B in de les bekeken op schermfoto's van de speelcontrole: squla-klok-hoelaat-1 (bus, zandloper, klok), squla-rekenmix-mix1-1 (appels, ballen) en squla-tellen-resultatief2-1 (sterren). Daar zitten de zachte gloed, de dunne rand en de glans er goed op, en er zijn geen witte randjes of pixels te zien.
- Beperking: door de drukte op de laptop kwamen 6 andere lessen niet op tijd in beeld (vals alarm "5 seconden", geen schermfoto's). Ook `scripts/squla-overzicht.mjs` maakte lege beginschermen, omdat de lessen niet binnen 12 seconden laadden. Die run heb ik gestopt. Een paar lege foto's van die run staan nu in `public/squla-overzicht/` (niet in Git). Opnieuw maken met `ALLES=1` als het rustig is.
- Er zijn geen mensen of gezichten gevonden. Alle bestanden zijn 512 px aan de lange kant, en er zijn geen zichtbare pixels gevonden.

### Afgekeurd

1. **boek**: een plat blauw stokje van opzij. Het is niet als boek te herkennen, en het is een andere stijl dan `boek-groen` en `boek-rood` (die zijn wel goed). In de "stapel boeken" (meten) zweven de vier stokjes los boven elkaar. **Beter:** een boek in de stijl van boek-groen/boek-rood (schuin, met dikte en bladzijden), of die gebruiken. **Lessen:** squla-geld, squla-minsommen, squla-rekenmix, squla-tijd, squla-vormen, squla-meten (hoeveelheden-2).
2. **hoepel**: er hangt een losse gele bal rechtsonder aan de ring, die er niet bij hoort. Langs de binnenkant loopt een dun donker lijntje. **Beter:** alleen de ring, zonder bal, met een schone binnenrand. **Les:** squla-tijd (dagritme, "gym").
3. **pennenbeker**: een geel blik zonder pennen of potloden. Het lijkt een verfblik (regel 1.8). **Beter:** een beker met een paar potloden en pennen erin. **Les:** squla-splitsen.
4. **tekendoos**: een leeg, open houten bakje. Je ziet niet dat het een tekendoos is. **Beter:** een doos met een paar potloden of kleurtjes erin, of met een deksel en een potloodje erop. **Les:** squla-vormen-opruimen-1 ("De potloden horen in de tekendoos").
5. **doos-rood / doos-blauw**: twee heel verschillende vormen (plat tegen bijna een kubus). In squla-meten-pizza-3 zegt Bliepo "Twee dozen. Ze zijn even groot.", maar de blauwe is duidelijk groter. **Beter:** dezelfde doos in twee kleuren. **Les:** squla-meten-pizza-3.
6. **olijf / pizza-olijven**: de losse olijf is groen, de olijven op de pizza zijn zwart. Regel 1.9 zegt: hetzelfde voorwerp ziet er overal hetzelfde uit. **Beter:** dezelfde kleur olijf in beide plaatjes. **Lessen:** squla-meten-pizza-1 (pizza met olijven) en squla-meten-pizza-3 (olijf op de weegschaal, schaal met olijven).
7. **stoelenkring**: vier stoelen op een rechte rij. Bliepo zegt "Eerst in de kring". **Beter:** stoelen in een (halve) kring. **Les:** squla-tijd (dagritme).
8. **mand-leeg**: een plat, simpel bakje in een andere stijl, dat niet op een mand lijkt. Het wordt in geen enkele les gebruikt (alleen in `status.json`). **Beter:** niets doen zolang het niet gebruikt wordt; anders `mand` gebruiken.

### Tips (geen afkeuring)
- **spaarpot**: een lege glazen pot, terwijl Bliepo in squla-geld-geldmachine-1 zegt "Er zitten munten en briefjes in."
- **oven** (wit) ziet er anders uit dan **oven-brood** en **oven-taart** (grijs).
- **spies-leeg** is erg dun en valt in kleine kaartjes bijna weg.
- **krentenbol** lijkt een bruine klodder.
- **planeet** (blauwe bol met witte stippen) lijkt eerder een bal dan een planeet.
- **kaas**: de gaten zijn wit en vallen op de donkere achtergrond erg op.
- **wekker** heeft een lege witte wijzerplaat. Dat is goed zolang de wijzers in code worden getekend.

### Goedgekeurd (165)
aardbei, appel, bakje, bakkerij, bal, ballon-blauw, ballon-geel, ballon-groen, ballon-oranje, ballon-paars, ballon-rood, ballon, banaan, basketbal, bed, beker-leeg, beker-vol, beslagkom, bezem, bezorgbus, bloem, bloembak, boek-groen, boek-rood, bolletje-deeg, bolletje-ijs, boom, bootje, bord, boterham-heel-veel-kaas, boterham-veel-kaas, boterham-weinig-kaas, boterham, broek, brood, broodje, bruin-brood, bus, citroen, croissant, cupcake, deegkom, diamant, discobal, doek, donut, doos-open, doos, draaitafel, ei, emmer, feesthoed, fiets, gieter, glas-water, goudstuk, hoorntje, huis, ijsje-twee-bollen, ijsje, jas, kaars, kaas, kampvuur, kers, kistje, kledingkast, knikker, knoop, koekje, kom-soep, komeet, kopermunt, kraal, krentenbol, lampje, laptop, luidspreker, maan, maansteen, mand-half, mand-vol, mand, mandarijn, marktkraam, oude-raket, oven-brood, oven-taart, oven, pakje, parel, peer, picknickkleed, pingpongbal, pion, pizza-kaas, pizza-salami, pizzadoos-open, pizzadoos, pizzaoven, pizzapunt, planeet-ring, planeet, plant, portemonnee, potje, potlood, pruim, raketje, rode-rots, rugtas, satelliet, schaal, schaar, schatkaart, schatkist, schelp, schoen, schommel, schoolbord, skateboard, sleutel, slingerlampje-geel, slingerlampje-rood, spaarpot, speelblok, speelgoedauto, spies-leeg, spies-twee, spies-vol, splitsmachine, springtouw, steen, ster, stokbrood, stuiterbal, suikerstrooier, t-shirt, taart-kaarsje, taart, tand, telefoon, tennisbal, tent, thermometer, tomaat, treintje, tulp, ufo, veer, vlaggenlijn, vlieger, voetbal, voetbalshirt, wandplank, watermeloen, wekker, zak-chips, zak-meel, zak, zandloper, zeepbel, zon, zonnebloem, zwembad

---

## Plaatjes (ronde 2) — 2026-11-01

Zo gekeurd:
- De 12 nieuwe bestanden bekeken op #0b1028, groot.
- De randen per pixel nagemeten.
- In de les met glans bekeken via de speelcontrole (GOED=1): squla-meten-pizza-3 en squla-meten-hoeveelheden-2. Beide lessen liepen tot het eind.
- Ook gekeurd op de nieuwe regel 1.21: het ding heeft nog dezelfde rol en past bij de les.

### Goedgekeurd
- **boek**: dicht blauw boek met kaft en bladzijden. In hoeveelheden-2 is de "stapel boeken" nu echt een stapel: de boeken liggen op elkaar.
- **pennenbeker**: beker met potloden en pennen, goed herkenbaar (squla-splitsen).
- **tekendoos**: open doos met kleurpotloden, past bij "De potloden horen in de tekendoos" (vormen-opruimen-1).
- **doos-rood / doos-blauw**: hetzelfde plaatje in twee kleuren. In pizza-3 zijn ze nu op de kaartjes en op de weegschaal echt even groot. "Ze zijn even groot" klopt nu.
- **olijf / pizza-olijven**: allebei groene olijven, dus hetzelfde voorwerp (regel 1.9).
  - In de meten-lessen wordt nergens geteld op pizza-olijven. Die pizza wordt alleen gebruikt om grootte te vergelijken (pizza-1, `PZ(…, "olijf")`). Stukken tellen gebeurt met `pizzapunt` (pizza-2). Geen afkeuring.
  - Tip: pizza-olijven heeft 8 stukken, pizza-kaas en pizza-salami hebben er 6. In pizza-1 staan ze nooit naast elkaar, maar gelijk is mooier.
- **stoelenkring**: zes stoeltjes in een kring, past bij "Eerst in de kring" (squla-tijd).
- **spaarpot**: nu met munten onderin.
  - Tip: in geldmachine-1 zegt Bliepo "Er zitten munten en briefjes in", maar er liggen alleen munten in.
- **krentenbol**: herkenbaar broodje met krenten, past in de bakkerij-lessen (plussommen).

### Afgekeurd
1. **hoepel**: langs de binnenkant van de ring loopt nog een licht grijs-wit randje van 1 pixel (gemeten: opaak pixel 194,193,193 direct binnen de rode ring, bij y = 256, x = 53). Op de donkere achtergrond is dat te zien als een dun wit lijntje (regel 1.18).
   - **Beter:** de binnenrand ook 1–2 pixels inkorten, net als de buitenrand.
   - **Les:** squla-tijd (dagritme, gym). Verder is hij goed: alleen de ring, met een doorzichtige binnenkant.
2. **planeet**: dit is nu duidelijk **de aarde** (continenten en wolken). Volgens regel 1.21 past dat niet bij de rol:
   - In squla-rekenmix telt het kind "planeten" (11 stuks, en groepjes van 9 en 10).
   - In squla-tellen staan "planeten en ufo's door elkaar".
   - In beide komt de aarde dus tien keer of vaker in beeld, terwijl er maar één aarde is.
   - Bij Bliepo's vraag "Tel de planeten" past dat niet.
   - **Beter:** een gewone planeet zonder continenten, bijvoorbeeld een gekleurde bol met strepen of kraters in glansstijl B. Of gebruik `planeet-ring`.
   - **Lessen:** squla-rekenmix, squla-tellen, squla-getallenlijn, squla-piraat, squla-vormen (patroon zon/maan/ster/planeet; daar zou de aarde wel kunnen).

### Gezien maar buiten deze ronde
- In pizza-3 liggen de olijven in "een grote schaal vol olijven" nog steeds grotendeels achter de schaal. Dat zit in de tekencode van de les (`olijfschaal`, al gemeld bij Meten), niet in het plaatje.

---

## Plaatjes (ronde 3) — 2026-11-01

### Goedgekeurd
- **hoepel**: de binnenrand is ook ingekort. Zelf nagemeten: 0 lichtgrijze randpixels. Op #0b1028 is er geen wit lijntje meer te zien. Alleen de ring, met een doorzichtige binnenkant. Goedgekeurd.
- **planeet**: een paarse fantasieplaneet met strepen en kraters, zonder landen. In squla-tellen-resultatief3-1 (speelcontrole met glans, schermfoto's 003 en 017) staan er 6 en 19 los door elkaar. Ze zijn duidelijk, even groot en goed te tellen, met een zachte gloed en een dunne rand. Er zitten geen witte randjes aan. Dat past nu bij "Hoeveel planeten zie je?" (regel 1.21). Goedgekeurd.

### Melding voor de les (niet het plaatje)
- In `squla-rekenmix.tsx` r. 49 staat `vw("planeet", "planeten", "blauw")`: het getal bij de planeten wordt blauw. De planeet is nu paars. Volgens regel 2.2 heeft het getal de kleur van het voorwerp, dus hier paars. Graag aanpassen in de rekenmix-les.

---

## Vormen en figuren — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode door een helper (Opus) gekeurd op alle regels van BOUWREGELS.md, ook hoofdstuk 14 en 7.7.
- De belangrijkste punten zelf nagekeken op schermfoto's.
- Speeltest zonder GOED (fout + hulp), één les tegelijk: **alle 7 lessen tot het eind**, niets vastgelopen.
- De kleurenpuzzels hadden 630–670 stappen nodig. Dat past bij de stukjes die er hetzelfde uitzien (zie hieronder): de speler moest veel proberen.
- Regel 4.1/4.3 (beginscherm) is niet afgekeurd, alleen genoteerd. Geen enkele les toont nu een voorbeeld van de opdracht; de welkomzinnen zijn wel eigen per les.
- Het rekenwerk en de patronen kloppen overal (één goed antwoord, geen dubbele keuzes, 15 vragen per les). Er zijn geen resten van mensen of dieren (meisje, vogel, muis, smiley).
- De vervangingen houden hun doel (1.21):
  - bal/blok/potlood/boek als rij van vier;
  - zon/maan/ster/planeet als opschuivende rij;
  - de huisjes bij "boven/onder/voren" zijn eenduidig.

### squla-vormen-patronen-1 — ronde 1 — AFGEKEURD
- Taal (3.11): `squla-vormen.tsx` r. 397, "Wat komt daar in het patroon na?" Voorstel: "Wat komt daarna in het patroon?"
- Beginscherm (genoteerd): "Kijk goed naar de rij vormen.", maar in beeld staan kralen (3.12).

### squla-vormen-patronen-2 — ronde 1 — AFGEKEURD
- **Zin en beeld (14.4/14.5), ernstig:** bij de bloembak-vraag zie je geen bloemen in de bak. Ze worden vóór de bak getekend (r. 707–711, `unshift`) en de bak dekt ze helemaal af. Schermfoto patronen-2/034 toont een lege bak, terwijl Bliepo zegt "Kijk: om en om staat er een zonnebloem." Voorstel: de bak eerst tekenen, dan de bloemen met de steel op de voorrand (meten op de echte png van 512×181).
- **Eén goed antwoord (11.2):** de puzzel p2-15 (r. 1269–1281) heeft 4 blauwe driehoeken, 3 rode vierkanten en 2 gele cirkels die er precies hetzelfde uitzien. Een gelijk stukje op een andere gelijke plek telt als fout (`legStuk`, vlak r. 516). Voorstel: gelijke stukjes op elkaars plek goed laten keuren, of een plaatje zonder gelijke stukjes.
- **Uitleg stuurt naar fout:** r. 605, bij p2-14 staat de pijl op de tweede lege plek (het blok hoort er), maar Bliepo zegt "Wat komt er in het patroon na het laatste ding?". Dat wijst naar de bal. Voorstel: een aparte zin als er een pijl staat.
- Glans (7.7): de bloembak (`rek`, vlak r. 120) en de halve ring (p2-11/12, niet in `PLATTE`) hebben geen glansstijl B.
- Het uitrekken van de bloembak (512×181 → 820×240, ±21% breder) valt nauwelijks op: in orde.
- Beginscherm (genoteerd): "gespiegeld" is een moeilijk woord (3.13).

### squla-vormen-opruimen-1 — ronde 1 — AFGEKEURD
- **Zin en beeld (14.4):** r. 863/1401 (o-15): het tweede plaatje staat netjes van groot naar klein, maar Bliepo zegt "Hier staan ze door elkaar." Voorstel: de zin laten afhangen van de volgorde.
- **Tekenen op een plaatje (14.5):** r. 775–782 gaat uit van de oude wandplank (200×200, plank op y=96). Het nieuwe `wandplank.png` is 512×107. Daardoor zweven de boeken boven de plank en zakt de bal half in de plank (schermfoto opruimen-1/013). Voorstel: de bovenkant van de plank en de onderkant van elk ding meten op de echte png.
- Tip: `tekendoos.png` zit al vol potloden. De drie losse groene potloden steken er nu bovenuit.

### squla-vormen-orienteren-1 — ronde 1 — AFGEKEURD
- Taal:
  - r. 1066 `aan de ${kant}kant` geeft "aan de rechtskant/linkskant". Moet zijn: "rechterkant/linkerkant".
  - r. 1042 "En dan naar onder." Moet zijn: "naar beneden".
  - r. 1013 "Ligt het bovenaan…" over de bal of de bus. Moet zijn: "Ligt hij…" (14.2).
- Uitleg: r. 1111 eindigt met "Waar kijk je hier vandaan?", terwijl de vraag de plek al geeft en vraagt welk huisje erbij past. Voorstel: "Welk huisje past erbij?"
- **Logica (1.21):** r. 1459–1466 (or-10): de boom. Met de camera hoog boven je hoofd zie je een boom niet "van boven", want een boom is veel hoger dan jij. Voorstel: een ding op ooghoogte, of andere keuzes ("boven in een hoge flat" / "liggend in het gras" / "voor de boom").
- Tips:
  - or-9 "Op de stoep" kun je ook van bovenaf kijken.
  - "Van waar kun je naar beneden kijken?" is stroef.
  - De bus in or-3/or-8 staat op een groen blok in plaats van op een straat.

### squla-vormen-kleuren-1 — ronde 1 — AFGEKEURD
- **Eén goed antwoord (11.2):** puzzel k1-2 (r. 1494, regenboog in 3×3): de bovenste rij stukjes is leeg, dus drie gelijke lege stukjes die elk maar op één plek mogen. Voorstel: 2×2 stukjes, of gelijke stukjes op elkaars plek goed keuren.
- Beginscherm (genoteerd): "Kijk eens naar de kleurrijke puzzel!", terwijl er nog geen puzzel in beeld is.

### squla-vormen-kleuren-2 — ronde 1 — AFGEKEURD
- **Eén goed antwoord (11.2):** r. 1536 (`STUKJES`), in alle drie de rondes:
  - het vierkant in 4×4 heeft 4 effen middenstukjes;
  - de ster in 3×3 heeft 2 lege bovenhoeken.
  
  Die stukjes zijn niet van elkaar te onderscheiden, en een gelijk stukje op de verkeerde plek telt als fout. Voorstel: zoals bij kleuren-1.
- De platte vormen hebben glansstijl B (schermfoto kleuren-2/005), mooi.

### squla-vormen-kleuren-3 — ronde 1 — AFGEKEURD
- **Eén goed antwoord (11.2):** de kegel (3×3) heeft 2 lege bovenhoeken, de piramide (4×4) 4 lege stukjes. Zelfde oplossing als hierboven.
- **Glans (7.7):** bol, cilinder, kegel, kubus en piramide hebben geen glansstijl B (niet in `PLATTE`, tekenen r. 112/216) en hebben een dikke donkerblauwe rand. Schermfoto kleuren-3/005: een vlakke blauwe kegel, naast de glimmende vormen van kleuren-2. Voorstel: dezelfde glans en een dunne rand in de eigen kleur.
- Tip (3.13): "puzzelen met ruimtelijke vormen" is moeilijk voor een kind van 6.

Algemene tip: de kralen en blokken hebben ook nog de oude donkerblauwe rand zonder glans (7.7).

---

## Meten en maten — ronde 2 — 2026-11-01

Elk punt uit ronde 1 is nagekeken in de code en op de schermfoto's. Speeltest zonder GOED (fout + hulp), één les tegelijk: pizza-1, pizza-2, pizza-3 en hoeveelheden-2 **tot het eind**, niets vastgelopen. Ook gekeurd op hoofdstuk 14. Het beginscherm (4.1/4.3) is niet afgekeurd, alleen genoteerd.

### squla-meten-pizza-1 — ronde 2 — GOEDGEKEURD
- Opgelost: "Eerst het kleinste ijsje, dan het middelste, en dan het grootste." en "Welk ijsje komt het minst hoog?" (`het: true`, r. 383–396). Beide gehoord in de speeltest.
- Beginscherm (genoteerd): "Wat een pizza's! Ze zijn niet even groot.", maar in beeld staat één pizza in een doos naast een leeg bord.

### squla-meten-pizza-2 — ronde 2 — GOEDGEKEURD
- Opgelost: "het ene stuk" (r. 567).
- Beginscherm (genoteerd): "Waar liggen meer stukken, één stuk meer of één stuk minder?" is een stroeve zin.

### squla-meten-pizza-3 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - De dozen zijn hetzelfde plaatje en even groot.
  - De olijven liggen nu als een berg ín de schaal (schermfoto pizza-3/033).
- Tip: "Één tomaat? Niet helemaal." Een hoofdletter op "één" wordt meestal "Eén" geschreven (via `Hoofd`).

### squla-meten-hoeveelheden-1 — ronde 2 — GOEDGEKEURD (niet veranderd)

### squla-meten-hoeveelheden-2 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - "Er is water met fruit." (geen mama meer).
  - "Dan gaat geen kant omlaag." en "Bij even zwaar blijft de wip recht."
  - "Wat weegt dan het meest?" en "Wat is het zwaarst?"
  - De boeken liggen echt op elkaar ("Hier liggen vier boeken op elkaar." klopt met het beeld).
  - Er is geen "wie", "mama" of "niemand" meer over (14.1).
- Beginscherm (genoteerd): "De picknickmand is weer mee naar het park." is een stroeve zin ("gaat weer mee").

### squla-meten-oppervlakte-1 — ronde 2 — GOEDGEKEURD
- Beginscherm (genoteerd, 14.4): "Kijk eens naar de tafel met tegels!", maar op die tafel liggen blaadjes papier. Zo noemt Bliepo ze ook meteen daarna.

### squla-meten-oppervlakte-2 — ronde 2 — GOEDGEKEURD

---

## Geld — ronde 2 — 2026-11-01

Speeltest zonder GOED: geldmachine-1, geldmachine-2 en zakgeld-2 **tot het eind**, niets vastgelopen.

### squla-geld-geldmachine-1 — ronde 2 — GOEDGEKEURD
- Het welkom is nu "Kijk eens naar mijn spaarpot! Er valt geld uit." De spaarpot heeft munten (schermfoto). Dit klopt.

### squla-geld-geldmachine-2 — ronde 2 — AFGEKEURD
- **Niet opgelost (14.4):** in de korte uitleg (r. 728) staat nog steeds `speelgoed("bootje", 8)`, dus het bootje kost € 8. In vraag 6 (r. 654–658) kost hetzelfde bootje € 6: "Het bootje kost 6 euro."
  - Volgens de melding is "de prijs van het treintje" aangepast, maar de botsing zit bij het bootje.
  - Voorstel: in r. 728 het treintje (€ 8, zoals in vraag 7) of een ander speelgoed nemen, of het bootje in de uitleg ook € 6 laten kosten (met ander geld).

### squla-geld-zakgeld-1 — ronde 2 — GOEDGEKEURD

### squla-geld-zakgeld-2 — ronde 2 — GOEDGEKEURD
- Opgelost: "Nog één vraag." is weg.
- De kraam: "Hier worden spullen verkocht. Die spullen zijn te koop." Dat is acceptabel. Tip: "Die spullen" verwijst naar niets in beeld (lege kraam); "Op een kraam koop je spullen." is zuiverder.

### squla-geld-geld-1, squla-geld-geld-2 — ronde 2 — GOEDGEKEURD (niet veranderd)

---

## Klokkijken — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode van alle 18 lessen door een helper (Opus) gekeurd op alle regels, nu ook 4.1/4.3.
- De belangrijkste punten zelf nagekeken op schermfoto's.
- Speeltest zonder GOED (fout + hulp), één les tegelijk: hoelaat-1, hoelaat-2, hoelaat-3, klokkijken3-4 en digitaal-1 **tot het eind**, niets vastgelopen. De overige lessen zijn beoordeeld op de broncode.

Wat klopt:
- **Overal de Synthesis-wijzerklok** (`Klokje` uit klok-wijzerklok.tsx), geen digitale klok meer. Ook "digitaal-1/2" zijn wijzerklok-lessen.
- **De wijzers kloppen** (hoeken nagerekend). Bij half staat de kleine wijzer tussen twee getallen (half 1 = 15°), bij een heel uur staat de grote op 12. Schermfoto: 6 uur klopt.
- Keuzes in woorden, alleen 12-uurs, nooit ± 12 uur. Elke vraag heeft precies één goed antwoord. "Later/eerder" (11 rekenvragen en 4 vergelijkvragen) klopt.
- Geen mensen meer in de zinnen. Elke les heeft minstens 15 vragen. Na Ja/Nee komt de eerste vraag schoon in beeld.
- **Klokje op de telefoon** past goed binnen het scherm (schermfoto digitaal-1/042).

Algemene punten (alle 18 lessen):
- **A1 (2.2):** de uur-getallen in de zinnen krijgen de standaard getalkleur (3 geel, 7 donkerblauw, 12 wit), niet de kleur van de klok (kleine wijzer oranje, grote wijzer paars). Dit staat in `spreek()` r. 54–58, `regel`/`waarKlein` r. 198–210. Voorstel: het uur als `{n:oranje}` (kleine wijzer) en de minuten-getallen 12/6 van de grote wijzer `{n:paars}`. **Afgekeurd voor alle lessen**, want regel 2.2 en 14.10 zijn expliciet.
- **A2 (4.3):** de nieuwe beginzinnen staan nog niet in STEMZINNEN.md (daar staan de oude). Voorstel: `npm run stemzinnen`.

### squla-klok-digitaal-1 — ronde 1 — AFGEKEURD
- **14.5, het klokje op de oven valt buiten het schermpje.** `squla-klok-tekenen.ts` r. 35 `oven: { x: 0.504, y: 0.15, b: 0.27 }`. Op schermfoto digitaal-1/001 steekt het klokje boven de oven uit. Het schermpje van oven.png is maar 61 px hoog (px 47–108 van 512), dus een leesbaar klokje past er niet in.
- **14.5, het klokje op de laptop is groter dan het scherm** en loopt over de rand en het toetsenbord (schermfoto digitaal-1/014). r. 34 `laptop: { … b: 0.5 }`. Voorstel: `b ≈ 0.34`.
- **11.2/14.4, twee goede antwoorden in het voorbeeld en vraag 1** (r. 730–732): "Waar zie je ook zo'n klok?" Oven (goed), zandloper, telefoon (fout). Maar in vraag 12 zegt Bliepo "Op een telefoon staat ook een klok." Voorstel: de telefoon als goed antwoord (het klokje past daar), met als afleiders de zandloper en een lampje. Dan vervalt ook het oven-probleem. Tip: "Wat zie je bovenop?" (r. 739) klopt niet; het schermpje zit aan de voorkant.

### squla-klok-digitaal-2 — ronde 1 — AFGEKEURD
- **14.7:** r. 814 en 831 gebruiken `V("bus")` (gele stadsbus) bij "De bezorgbus …". In hoelaat-1/2/3 is de bezorgbus `bezorgbus.png`. Voorstel: `V("bezorgbus")`, en in `voorwerpen` (r. 788) ook.
- **14.4:** r. 831 "Tot de volgende keer!" midden in de les; daarna komen nog vragen. Voorstel: "De bus rijdt weg met de broodjes."
- Tip: "De bakkerij is dicht." (r. 832) komt vóór de koekjes die om 1 uur de oven in gaan.

### squla-klok-hoelaat-1 — ronde 1 — AFGEKEURD
- **1.21/14.9, het dagverhaal:**
  - om 11 uur "De bus haalt nieuwe broodjes bij de bakkerij."
  - om 12 uur "De bus rijdt terug." (r. 880): waarheen?
  - om 1 uur "De bus staat weer bij de bakkerij."
  
  Voorstel r. 880: "De zon staat hoog. De bus brengt de broodjes weg." De rest van het verhaal past bij de tijden (7 uur klaarstaan, 8 uur weg, 6 uur maan).
- Beginscherm: het welkom en het voorbeeld (bus + klok op 7 uur) kloppen; Ja/Nee kloppen. Tip: "langs de haltes" past niet bij een bestelbus ("langs de winkels").

### squla-klok-hoelaat-2 — ronde 1 — AFGEKEURD (alleen A1)
- Het dagverhaal is logisch en bij elke tijd past de gebeurtenis. Het beginscherm klopt.

### squla-klok-hoelaat-3 — ronde 1 — AFGEKEURD
- **1.21, het verhaal loopt terug in de tijd.**
  - Na "Het is avond. De maan schijnt." (8 uur) komt 11 uur "De zon staat bijna op de hoogste plek." (r. 971).
  - Daarna "De bus rijdt om 4 uur voor de laatste keer weg." (r. 972), terwijl hij om 3 uur al bij de laatste halte was (r. 950).
  
  Voorstel: de vragen in de volgorde van de dag zetten, en bij 4 uur: "De bus rijdt om 4 uur terug naar de bakkerij."
- **3.11:** r. 958 "Op welk plaatje worden ze gebakken?" Voorstel: "Waar worden de broodjes gebakken?"
- Tip: "Tot de volgende keer." (r. 975) komt vóór de afsluitkaart.

### squla-klok-klokkijken-1, -2, -3, klokkijken1-1, 1-2, 1-3, klokkijken2-1, 2-2, 2-3, klokkijken3-3 — ronde 1 — AFGEKEURD (alleen A1)
- Verder in orde: tijden, wijzers, keuzes, het beginscherm en Ja/Nee.
- Tip: klokkijken-2 en klokkijken1-1 hebben hetzelfde voorbeeld en dezelfde welkomzin ("Op welke klok is het 2 uur?"). Maak er één anders.

### squla-klok-klokkijken3-1 — ronde 1 — AFGEKEURD
- **4.1/14.4:** r. 1280, het welkom zegt "Op welke klok is het half 4?", maar het voorbeeld toont half 3 en half 10. Voorstel: "half 3".
- **3.18:** de titel "Halve uren" (r. 1275) is precies de titel van een Synthesis-les. Voorstel: "Halve uren lezen".

### squla-klok-klokkijken3-2 — ronde 1 — AFGEKEURD
- **4.1/14.4:** r. 1308, het welkom zegt "Welke klok hoort bij half 10?", maar het voorbeeld is half 9. Voorstel: "half 9".

### squla-klok-klokkijken3-4 — ronde 1 — AFGEKEURD
- **3.11:** r. 1373 "De klok bij het schoolbord wijst 9 uur." Voorstel: "…staat op 9 uur."
- **14.4:** r. 1387 "De plantjes krijgen water." In beeld staan alleen een gieter en een klok, geen plantjes. Voorstel: "Over een half uur krijgen de plantjes water. Hoe laat is dat?" of een zin die bij de gieter past.
- "De voetbal ligt klaar in het gras." (r. 1384) is niet fout, maar "ligt klaar" kijkt vooruit terwijl de vraag "een uur geleden" is. Tip: "De voetbal ligt al een uur in het gras." Zo helpt de zin bij het terugrekenen.

Tips (alle lessen): 
- "Tik op het vinkje / het kruisje" in de uitleg (r. 314) is knop-uitleg (3.15).
- "Welke klok hoort erbij?" en "Kies de goede klok." staan door elkaar (14.3).
- "Klokkijken", "Klokkijken 1" en "Klokkijken 2" zijn als titels moeilijk uit elkaar te houden.
- Het commentaar in de code noemt nog het plantje en de digitale klok.
- Titels: "De klok en de tijd" (digitaal-1) en "De klok en de tijd (moeilijker)" (digitaal-2) zijn kort, serieus en passen bij de inhoud (3.18): in orde. De oude naam "digitaal" zit alleen nog in de les-id en in de beheernaam (r. 645/718, "De digitale klok"). Tip: daar ook aanpassen.

---

## Splitsen — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode door een helper (Opus) gekeurd op alle regels, ook 4.1/4.3 en 2.1.
- Zelf nagekeken op schermfoto's.
- Speeltest zonder GOED (fout + hulp): **alle 5 lessen tot het eind**, niets vastgelopen.

Alles klopt bij:
- de splitsingen en delingen, met precies één (of bij "kies er twee" precies twee) goed antwoord;
- testAntwoord;
- 15 vragen per les;
- eigen beginzinnen per les;
- het voorbeeld = de echte eerste vraag;
- geen mensen;
- lidwoord en meervoud via `aantal()`.

Geld en eerlijk verdelen zijn bewust niet gekleurd: geen fout.

### squla-splits-splitsen1-1 — ronde 1 — AFGEKEURD
- **2.1/2.2:** in de uitleg na Nee (`squla-splitsen.tsx` r. 753–757) zijn de getallen wit ("2 pionnen staan aan de ene kant", "5 kun je splitsen in 2 en 3"), maar de pionnen zijn paars en oranje. In de vraag zelf is het wel goed. Voorstel: `aantal(2,"pion",KA)`, `aantal(3,"pion",KB)`, `g(2,KA)`, `g(3,KB)`. Ook de tip r. 211 `${g(tot)} is ${g(deel)} en nog hoeveel?`: daar de deel `g(deel, KA)`.
- **14.2/14.4:** tienvak r. 138 "Een paar liggen onder de doek." en r. 154 "Tel de oranje pingpongballen die eronder liggen.", terwijl er bij `tienvakVraag(9, …)` maar één bal onder ligt. Voorstel: "Een deel ligt onder de doek." en enkelvoud bij 1 via een helper.

### squla-splits-splitsen1-2 — ronde 1 — AFGEKEURD
- **2.1 (belangrijkste):** de stippen in de huisjes zijn links oranje en rechts blauw (`squla-splitsen-vlak.tsx` r. 231), terwijl de getallen in die huisjes en de ballen in de bakjes links paars en rechts oranje zijn. Dit staat al op het beginscherm (schermfoto splitsen1-2/001). Voorstel: stippen in de kleuren van de huisjes (paars/oranje).
- **4.1:** na Nee legt Bliepo alleen de splitspaal 7 = 4 + 3 uit (r. 794–803). Over de machine, de bakjes en het huisje kiezen, waar het voorbeeld over gaat, zegt hij niets. Voorstel: de uitleg op het voorbeeldbeeld zelf laten lopen.
- **2.1:** in de staafuitleg (r. 327, `squla-splitsen-hulp.ts` r. 117–118) is het bekende deel oranje, terwijl in de paalvraag het bekende deel paars is en het ontbrekende oranje. Voorstel: bekend = paars, ontbrekend = oranje, overal.
- **2.2:** r. 800 "Onder staan 4 en 3", "7 kun je splitsen in 4 en 3" in wit, terwijl de paal 4 paars en 3 oranje toont; ook de tips r. 316 en r. 360.
- **14.4:** r. 270 "Onder staan de twee bakjes.", maar de bakjes staan boven de huisjes.
- Tip: het welkom zegt "Welk huisje hoort bij deze ballen?" en de vraag "Welke splitsing hoort erbij?" (14.3).

### squla-splits-splitsen2-1 — ronde 1 — AFGEKEURD
- **8.4/11.2, keuzes boven 20:** r. 858 `[6, 10, 26]`, r. 865 `[8, 18, 28]`, r. 868 `[1, 10, 21]`. Voorstel: tien-ernaast binnen 20, bijvoorbeeld `[6, 10, 16]`, `[8, 18, 9]`, `[1, 10, 11]`.
- Verder goed: het welkom (briefje van tien + vier munten) past bij het voorbeeld, en Nee past ook.

### squla-splits-splitsen2-2 — ronde 1 — AFGEKEURD
- **8.4/11.2:** r. 905, de keuze "21 = 14 + 7" (boven 20). Voorstel: een som tot 20.

### squla-splits-delen-1 — ronde 1 — AFGEKEURD
- **3.15, uitleg over knoppen:** `squla-splitsen-hulp.ts` r. 100 `l.wijsAan("controleer", "Typ het getal.", "Tik dan op het vinkje.")`. Dezelfde zin staat ook in squla-plussommen.tsx r. 110 en squla-minsommen.tsx r. 139. Daar is hij volgens 3.15 ook fout; bij die lessen is dit in ronde 1 gemist.
- **14.4/14.5/1.21, potloden tellen in de pennenbeker:** het nieuwe `pennenbeker.png` heeft zelf al vijf potloden en pennen. De les tekent er nog potloden bovenop. Op schermfoto delen-1/031 zie je per beker een bos potloden die niet te tellen is ("2/3/4 potloden per beker"). Voorstel: voor deze vraag een lege beker gebruiken en de potloden ín de opening tekenen. De gevulde pennenbeker alleen gebruiken waar niet geteld wordt.
- **14.5:** antwoordplaatjes r. 649–650: bij 4–6 dingen loopt het groepje ver buiten het bakje (cel 36 per 5, bakje ±101 px breed). Voorstel: hooguit 3 naast elkaar, of een groter bakje.

Tips: de kaart (vlak r. 537–539) gebruikt geel/oranje/blauw in plaats van paars/oranje; het beginbeeld flitst even en het "verschijn"-geluid klinkt twee keer; "Waar zijn 12 potloden eerlijk verdeeld?" kan duidelijker ("…over 4 bekers").

---

## Piratenschat — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode door een helper (Opus) gekeurd op alle regels, ook 4.1/4.3.
- Speeltest zonder GOED (fout + hulp): **alle 3 lessen tot het eind**, niets vastgelopen.

In orde:
- Alle sommen kloppen; precies één goed antwoord; testAntwoord klopt.
- Aantal letters = aantal vragen (15/15/16).
- **Geen piraten, mensen of papegaai** in beeld of in de zinnen; "hij" gaat over Bliepo of een robot.
- Lidwoord en meervoud via `aantal()`.
- **De letteruitleg na de eerste vraag is logisch.** Vraag 1 ("Waar liggen 14 goudstukken?") snap je zonder die uitleg. De zin erna ("Kijk, de eerste letter! Bij elke vraag krijg je een letter. Samen zeggen de letters waar de schat ligt.") klopt, ook na een fout antwoord.

Voor alle drie de lessen:
- **2.2:** de getallen in `aantal()`/`g()` zijn wit bij gekleurde voorwerpen ("Waar liggen 14 goudstukken?", "Bliepo heeft 6 sterren"). Voorstel: een kleur per voorwerp (goudstuk/ster/sleutel geel, diamant blauw, kopermunt oranje, parel wit), zoals squla-minsommen dat al doet.
- **Verhaalbegin weg (4.3/1.21):** het beginbeeld met de schatkaart wordt meteen door het voorbeeld vervangen en is nooit te zien. De zinnen "Kijk, een schatkaart! Waar ligt de schat?", "We hebben een nieuwe schatkaart." en "We hebben een sleutel gevonden. Waar past hij op?" zijn geschrapt. Daardoor komt in level 3 "De sleutel past!" (r. 516) uit het niets. Voorstel: na het beginscherm een korte verhaalstap (schatkaart of sleutel tonen met één zin).

### squla-piraat-1 — ronde 1 — AFGEKEURD
- **8.4:** r. 401 `kaalPlus(10, 20, [20, 30, 40], "maan")`: het antwoord is 30, met 40 als keuze. r. 399 heeft de keuze 30. Daarna zegt Bliepo "Je kunt plussommen maken tot twintig." (r. 410). Squla heeft hier zelf 20 + 10, maar onze regel 8.4 (groep 3 nooit boven 20) gaat voor; anders moet Sara een uitzondering geven. Voorstel: een som tot 20.
- **2.1:** in de Nee-uitleg (r. 365–373) zijn de diamantgroepjes "3" en "2" en de zin "3 + 2 = 5" niet paars/oranje gekleurd, terwijl de vragen erna dat wel zijn.
- **4.1/4.3:** het welkom (r. 361) "Bij de schattenjacht tel je goudstukken. Waar liggen 14 goudstukken?" zegt niet dat de les over plussommen gaat (13 van de 15 vragen). Nee legt 3 + 2 uit terwijl er een telvraag in beeld staat. Voorstel: "Op schattenjacht tel je goudstukken en maak je plussommen."
- **14.4:** r. 406–407 "Onder de rots ligt een kistje.", maar het kistje staat naast de rots. Voorstel: "Bij de rots ligt een kistje."

### squla-piraat-2 — ronde 1 — AFGEKEURD
- **4.1/4.3:** het welkom (r. 421) is drie zinnen, 17 woorden, en noemt de minsommen niet. Voorstel: "Nu reken je met min: er gaat iets af." plus de eerste vraag.
- **3.11:** r. 442 "Is het: dan gaat hij roesten?" en "Of: hij heeft geen zwembroek?" Voorstel: "Omdat hij dan gaat roesten?" en "Of omdat hij geen zwembroek heeft?"
- **14.4:** r. 460–461 "in de grote krater! Daar ligt een sleutel.", maar in beeld liggen een maansteen en een sleutel naast elkaar; er is geen krater. Voorstel: de zin aanpassen ("Op de maansteen ligt een sleutel.") of de sleutel op de steen tekenen.
- Tip: "Bliepo heeft … Hoeveel heeft hij nog?" terwijl Bliepo zelf praat. Beter: "Ik heb…".

### squla-piraat-3 — ronde 1 — AFGEKEURD
- **8.4:** r. 492 `kaalPlus(13, 7, [19, 20, 21], …)`: de keuze 21 is boven 20. Voorstel: `[10, 19, 20]`.
- **14.3/14.4:** "7 − 4: hoeveel sterren zie je nog?" (r. 467/475/491/502–511). De grijze sterren zie je ook nog, dus 7 kan als antwoord worden opgevat. Level 2 zegt "Hoeveel sterren zijn er nog?" Voorstel: overal die zin.
- Het beginscherm verder in orde: "Plus en min staan door elkaar." met de echte eerste vraag in beeld, en Ja/Nee kloppen.

Tips:
- "De maan-darijn!" als geschreven woord leert een verkeerde spelling.
- De komeet als versiering bij het robot-zwemraadsel past niet.
- Het schatkaartplaatje toont een eiland met palmbomen en een schip; dat past niet bij de ruimte (alleen van belang als het verhaalbegin terugkomt).
- Op de schermfoto's nakijken of het gat in de sleutel en in de kopermunt doorzichtig is.

#### Aanvulling Meten ronde 2: nieuw beginscherm (4.1/4.3), 2026-11-01
Alle 7 lessen opnieuw gestart (GOED=1). Op de schermfoto's van het beginscherm staat bij elke les **de echte eerste vraag als voorbeeld**, met een eigen zin van één of twee korte zinnen die erbij past:
- **pizza-1:** "Deze pizza's zijn niet even groot. Welke pizza is het grootst?" Uit de code; het eerste beeld viel buiten de schermfoto's.
- **pizza-2:** "De pizza is in stukken gesneden. Hoeveel stukken pizza zie je?" In beeld 3 pizzapunten.
- **pizza-3:** "Er ligt deeg op de weegschaal. Welk deeg is het zwaarst?" In beeld de weegschaal met deeg.
- **hoeveelheden-1:** "We pakken een mand voor de picknick. Welke mand is leeg?" In beeld drie manden.
- **hoeveelheden-2:** "De picknickmand zit vol. Is de mand kort, zwaar of dun?" In beeld de volle mand.
- **oppervlakte-1:** "Op de muur hangen schilderijen. Welk schilderij is groot en welk is klein?" In beeld de muur en de drie zinnen.
- **oppervlakte-2:** "De tafel ligt vol blaadjes papier. Hoe groot is de tafel?" In beeld de tafel van 6×3.

De oude opmerkingen over het beginscherm zijn daarmee opgelost: "Wat een pizza's" bij één pizza, de "tafel met tegels", "weer mee naar het park" en de stroeve zin bij pizza-2. Ja en Nee staan op de vaste plek. Na Ja komt de eerste vraag; na Nee begint de uitleg met zijn eigen beeld (`welkom`, r. 95–109). **Alle 7 Meten-lessen blijven GOEDGEKEURD**, ook op 4.1/4.3.

#### Aanvulling Geld ronde 2: nieuw beginscherm (4.1/4.3) en herkeuring, 2026-11-01
Alle 6 lessen opnieuw gestart (GOED=1). Bij elke les staat de echte eerste vraag als voorbeeld in beeld, met een eigen zin die erbij past:
- **geldmachine-1:** "Er valt geld uit de spaarpot. Waar zie je een munt van 1 euro?"
- **geldmachine-2:** "In de speelgoedwinkel kost het springtouw 3 euro. Waar ligt 3 euro?" In beeld het springtouw met het prijsbordje € 3 en het geld.
- **zakgeld-1:** "Voor elk klusje krijg je 2 euro. Hoeveel is dat bij elkaar?" In beeld de bezem, de gieter en het geld.
- **zakgeld-2:** "Je hebt 20 euro gespaard. Waar ligt 20 euro?"
- **geld-1:** "Twee groepjes geld en twee bedragen. Welk bedrag hoort bij welk geld?"
- **geld-2:** "Nu tellen we geld tot 20 euro. Waar ligt 12 euro?"

Ja en Nee staan op de vaste plek.

**geldmachine-2 is nu opgelost:** de korte uitleg na Nee gebruikt het treintje van € 8 (r. 739–743), en het bootje kost overal € 6. Er is geen tegenspraak meer.

De schermfoto's zijn gemaakt terwijl het geld nog verschijnt (hologramstraal), dus de munten en briefjes staan er nog half plat. Daar keur ik niet op af.

**Uitslag Geld ronde 2:** alle 6 lessen **GOEDGEKEURD** (geldmachine-1, geldmachine-2, zakgeld-1, zakgeld-2, geld-1, geld-2).

---

## Tellen — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode van alle 15 lessen door een helper (Opus) gekeurd op alle regels, ook 4.1/4.3 en hoofdstuk 14.
- Speeltest zonder GOED (fout + hulp): fruit-1, resultatief1-1, resultatief2-2, resultatief3-1 en telrij-1 **tot het eind**, niets vastgelopen.
- De proef-fruit-lessen zijn niet gekeurd.

In orde:
- Geen mensen, dieren of gezichtjes. Visjes, monsters en spookjes zijn weg, ook uit de zinnen.
- De woorden passen bij de plaatjes. De planeet is de paarse fantasieplaneet, dus tien keer tellen kan.
- Alle vragen nagerekend; telkens precies één goed antwoord.
- Telrij tot ±100 volgt Squla.
- Het voorbeeld op het beginscherm is de echte eerste vraag. Ja en Nee werken.

Let op: een getal zonder kleur (`{5}`) krijgt in Lesscherm.tsx r. 165 de tegelkleur van dat getal (5 groen, 10 roze), niet wit. Daar komen de kleurfouten hieronder vandaan.

### squla-tellen-fruit-1, fruit-3, resultatief1-1, resultatief2-1, resultatief2-2, resultatief2-3 — ronde 1 — GOEDGEKEURD
- Tip resultatief2-2 (r. 607): "Nu zijn het meer auto's en bussen.", terwijl er in level 1 geen auto's en bussen waren.

### squla-tellen-fruit-2 — ronde 1 — AFGEKEURD
- **2.2:** r. 372 "De citroenen liggen weer in rijen van {5}." De 5 wordt groen, de citroenen zijn geel. Voorstel: `{5:geel}`.

### squla-tellen-resultatief1-2 — ronde 1 — AFGEKEURD
- **4.1/14.13:** het welkom en het voorbeeld gaan over ballen en blokken (r. 512–513), maar na Nee toont de uitleg bootjes en treintjes. Voorstel: `uitleg: [rij5(BALLEN_BLOKKEN, 8, [])]`.

### squla-tellen-resultatief1-3 — ronde 1 — AFGEKEURD
- **2.2:** r. 546 telt huizen met een oranje getal (`huis: "oranje"`, tekenen.ts r. 68), maar `huis.png` is turquoise met een koraalrood dak. Voorstel: blauw, of een ander ding.

### squla-tellen-resultatief3-1 — ronde 1 — AFGEKEURD
- **14.4:** memory is het laatste onderdeel. Bliepo zegt "Even een spelletje tussendoor!" en daarna "We gaan weer tellen.", maar dan komt meteen de eindkaart (r. 687, r. 261/265). Voorstel: bij het laatste onderdeel andere zinnen ("Nog een spelletje!" … "Goed gedaan!").

### squla-tellen-resultatief3-2 — ronde 1 — AFGEKEURD
- **14.4:** r. 701 "Nu zijn er veel meer planeten.", maar level 2 (7–19) heeft niet meer planeten dan level 1 (5–20). Voorstel: "Weer planeten en ufo's, door elkaar."
- **4.1/14.13:** r. 702, het voorbeeld gaat over planeten, maar de uitleg na Nee over ufo's. Voorstel: `uitleg: [los(PLANETEN, 8, [])]`.

### squla-tellen-resultatief3-3 — ronde 1 — AFGEKEURD
- **2.2:** r. 734 "Raketjes en sterren staan in rijen van {10}." De 10 wordt roze. Bij twee soorten is de les verder overal wit. Voorstel: `{10:wit}`.

### squla-tellen-resultatief3-4 — ronde 1 — AFGEKEURD
- **2.2:** r. 764 "Op de zak staat {40}" is wit, maar in de hulp is hetzelfde getal blauw (knikkers). Voorstel: `{40:blauw}`.
- **Hulp stuurt naar fout:** r. 212, de tip "Begin bij {41}. Tel de losse knikkers erbij." De eerste losse knikker zit al in de 41, dus wie álle losse knikkers erbij telt, komt één te hoog uit (49 in plaats van 47). Voorstel: "Begin bij {41}. Tel de andere losse knikkers erbij."
- **14.2:** r. 772 `zak(KNIKKERS, 70, 1, …)`: "Tel de losse knikkers erbij", terwijl er maar één ligt. Voorstel: enkelvoud via de helper.
- Nakijken op een schermfoto: `squla-tellen-holo.tsx` r. 319 tekent een "voorbeeldje" bovenop de zak. Dat ding kan meegeteld worden.

### squla-tellen-telrij-1 — ronde 1 — AFGEKEURD
- **14.14 (keuzes binnen het bereik):** level 1 gaat van 18 tot 50, maar de afleiders 53 (r. 937), 83 (r. 940), 54 (r. 944) en 74 (r. 950) liggen erboven. Voorstel: tiental-ernaast-afleiders binnen 50.

### squla-tellen-telrij-2 — ronde 1 — AFGEKEURD
- **14.14:** r. 972 `na(98, [101, 90, 100])`: 101 ligt boven het einde van de les (100). Voorstel: `[99, 90, 100]`.

**Vraag aan Sara (niet afgekeurd):** resultatief1-1/1-2, 2-2, 2-3 en 3-3 zetten om en om rijen van twee verschillende dingen ("Hoeveel auto's en bussen zie je?"). Regel 1.10 zegt "één soort voorwerp per opdracht"; Squla gebruikt hier hetzelfde ding in twee kleuren. Wil Sara dat zo houden?

Tips:
- `treintje: "groen"` terwijl het plaatje petrol is.
- "In de zak zitten 50 sterren" is vreemd (knikkers passen beter).
- "Elke losse knikker is er één meer." is stroef.

---

## Getallenlijn — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode van alle 9 lessen door een helper (Opus) gekeurd.
- Speeltest zonder GOED: rangschikken-1, kat-1, dieren-1 en terugtellen-1 **tot het eind**, niets vastgelopen.

In orde:
- Alle getallen 0–20.
- Telkens precies één goed antwoord.
- Geen katten, dieren of mensen meer in beeld of zinnen.
- **De voorwerpen zijn niet doorzichtig** (`tover()` eindigt op alpha 1; alleen het rekenmateriaal is doorschijnend): 7.2 in orde.
- Het voorbeeld op het beginscherm is de echte eerste opgave.

Gemeld maar niet bevestigd: de helper zag in de code dat de typvragen (via `l.getal()` / `Getalvak`) een knop "Weet ik niet" krijgen. Op de schermfoto van rangschikken-1 (021) staat bij het typvak alleen het vak en het vinkje, geen "Weet ik niet". Niet afgekeurd. Wel nakijken of de `null`-tak in `typGetal` (r. 57–64) nog nodig is.

### squla-getallenlijn-rangschikken-1 — ronde 1 — AFGEKEURD
- **Hulp stuurt naar fout:** r. 220 "Welk getal komt na {2}?" bij rijen die per 2 springen (r. 688–690, kaarten 4/6/8/10). Het kind zoekt 3, maar die kaart is er niet. Voorstel bij `stap > 1`: "Welk getal is {2} meer dan {2}?"
- **3.12/14.4:** "Welk getal hoort op het lege lampje?" (r. 672–674, welkom r. 788), terwijl er puntjes op staan. Bliepo zegt zelf "Op één lampje staan puntjes." Voorstel: "Welk getal hoort op de puntjes?"
- **14.3:** "Bij welk getal staat het vlaggetje?" (r. 680–682) tegenover "Welk getal hoort bij het vlaggetje?" in level 2/3. Kies er één.

### squla-getallenlijn-rangschikken-2 — ronde 1 — AFGEKEURD
- **4.1/14.13:** het voorbeeld gaat over diamanten met puntjes, de uitleg na Nee (r. 811) over een getallenlijn met een vlaggetje. Die uitleg verklapt ook vraag 11 (vlaggetje bij 12). Voorstel: een uitleg met dezelfde diamantenrij.

### squla-getallenlijn-rangschikken-3 — ronde 1 — AFGEKEURD
- **4.1/14.13:** het voorbeeld is een lijn 0–20 per 1 met het vlaggetje bij 15, de uitleg (r. 832, `uitlegPerTwee`) een lijn 10–20 per 2. Voorstel: hetzelfde soort lijn, zonder een latere vraag te verklappen.

### squla-getallenlijn-kat-1, dieren-1, dieren-2, dieren-3, terugtellen-1 — ronde 1 — GOEDGEKEURD

### squla-getallenlijn-kat-2 — ronde 1 — AFGEKEURD
- **4.1/14.13:** het welkom en voorbeeld gaan over "de planeet met 15, welk getal komt voor 15?", de uitleg (r. 994–1001) over een pijl bij streepje 13. Dat is precies vraag 2 (r. 893), dus de uitleg verklapt die. Voorstel: de uitleg met de planeet en een ander getal.
- **3.12/14.3:** "De pijl" (r. 522) en "Het pijltje" (r. 531, 997) door elkaar. Voorstel: overal "de pijl".

Tips:
- "kristallen" (r. 809) bij het plaatje `diamant`; "diamanten" past beter.
- "De raket" (terugtellen) en "het raketje" (kat) voor hetzelfde plaatje.
- "zit tussen" en "ligt tussen" door elkaar.
- De ufo, satelliet en het raketje bij `dichtstBij` hebben geen rol.
- Bij watIsMeer (r. 849) praat de zin over sterren die niet in beeld staan.
- `slingerlampje-geel` lijkt eerder een kerstbal.

---

## Meer, minder, evenveel — ronde 1 — 2026-11-01

Zo gekeurd:
- Broncode `squla-meer-minder.tsx` (alle 105 vragen nagerekend), het vlak en de tekeningen, op alle regels van BOUWREGELS.md, ook 4.1/4.3, 14.20 en 14.21.
- Speeltest met GOED=1, één les tegelijk, met schermfoto's: 6 van de 7 lessen tot het eind. 3-1 bleef staan bij de eerste sleepvraag (zie hieronder).
- Nee-pad zelf nagelopen bij 3-2 (`nee.mjs`), de andere op de code.
- Plaatjes (appel, peer, ster, bloem, ballon, bal, kraal, koekje, ei, aardbei, knikker, potje, vlieger) bekeken op #0b1028 en in de les: glans B, geen witte randjes, geen gezichten, goed te zien op de donkere achtergrond. In orde.

In orde bij alle lessen:
- Elke vraag heeft precies één goed antwoord. Ook bij "meer"/"minder" met vier keuzes (3-2: 37 → alleen 38 is meer; 44 en 26 → alleen 43 en 25 zijn minder).
- testAntwoord klopt.
- Het aantal getekende dingen klopt met het antwoord. Nageteld: 16 appels, 19 ballonnen (15 + 4), 13 bloemen (10 + 3), 17 kralen, 4 doosjes = 24 eieren.
- De getallen volgen Squla (tot 20, en in level 3 tot 49 zoals Squla).
- Geen mensen, geen dieren: de vissen, lieveheersbeestjes en vlinders zijn ballonnen, aardbeien en knikkers geworden. Er blijft geen "wie", "hij" of naam over.
- Elke les heeft 15 vragen en een eigen beginzin. Het voorbeeld is de echte eerste vraag.
- Na Ja komt de eerste vraag schoon in beeld.

### squla-meer-minder-evenveel1-1 — ronde 1 — AFGEKEURD (2026-11-01 13:25)
- Rekenen: in orde.
- Plaatje: in orde.
- Taal/kleur: FOUT (14.20). r. 555 `"De appels liggen in rijtjes van {5}."`: de 5 heeft geen kleur. Voorstel: `{5:rood}`, de kleur van de appels.
- Beginscherm: in orde. Tip (14.21): na Nee telt Bliepo 12 appels (r. 557), terwijl in het voorbeeld 16 appels staan. Het is wel dezelfde soort vraag met hetzelfde ding, en zo verklapt hij de 16 niet. Daarom keur ik er niet op af.
- Spelen: tot het eind.

### squla-meer-minder-evenveel1-2 — ronde 1 — GOEDGEKEURD (2026-11-01 13:25)
- Rekenen, plaatje en taal: in orde. De kleur in de uitleg is `geel` (sterren): in orde.
- Spelen: tot het eind, ook de sleepvragen "op volgorde".
- Tip: na Nee staan er 8 sterren, met 6 en 10 op de kaarten; het voorbeeld heeft 14 met 12 en 17. Zelfde soort vraag, dus goed.

### squla-meer-minder-evenveel1-3 — ronde 1 — GOEDGEKEURD (2026-11-01 13:25)
- Rekenen, plaatje en taal: in orde. De bloemen zijn rood en de getallen in de uitleg ook.
- Spelen: tot het eind.
- Tip: Squla telt hier kralen in allemaal verschillende kleuren. Bij ons zijn alle kralen paars (één vaste kleur per ding). Dat is een bewuste keuze en geen fout.

### squla-meer-minder-evenveel2-1 — ronde 1 — AFGEKEURD (2026-11-01 13:25)
- Rekenen: in orde.
- Beginscherm: FOUT (14.21, de uitleg verklapt een latere vraag). Na Nee legt Bliepo de koekjes `[11, 13, 12]` uit en zegt "13 is de meeste." (r. 673). Dat is precies vraag 9 (r. 684). Voorstel: andere getallen die nergens in de les staan, bijvoorbeeld `[9, 11, 10]` met `"${g(11, "bruin")} is de meeste."`.
- Taal: in orde. Tip: "We tellen eerst kralen. Tel de kralen." Daarin staat twee keer "kralen".
- Spelen: tot het eind.

### squla-meer-minder-evenveel2-2 — ronde 1 — GOEDGEKEURD (2026-11-01 13:25)
- Rekenen, plaatje en taal: in orde. Spelen: tot het eind.
- Tips:
  - "Drie kaarten met appels." (r. 705) is geen hele zin. Beter: "Hier liggen drie kaarten met appels."
  - Vraag 10 en 13 hebben dezelfde kaarten `[16, 18, 17]`, één keer met "meeste" en één keer met "minste".

### squla-meer-minder-evenveel3-1 — ronde 1 — AFGEKEURD (2026-11-01 13:25)
- Rekenen: in orde. Potjes van meer naar minder en de getalvragen meer dan, minder dan en evenveel als hebben elk één goed antwoord.
- Spelen: FOUT (5.7). De speelcontrole bleef 145 stappen hangen bij de eerste vraag "Van meer naar minder." (de potjes 26, 8, 24).
  - Oorzaak: het voorbeeld (r. 526–530) zet vraag 1 al in beeld, maar zonder de goede volgorde (`test`). Na Ja tekent `toonOpgave` die vraag niet opnieuw, omdat `st.huidig` al gelijk is (r. 178). Daardoor krijgt de vraag zijn `test` nooit.
  - Bij 3-2 werken de vliegers wel, omdat die niet de eerste vraag zijn.
  - Een kind kan waarschijnlijk wel slepen, want `actief` wordt in `zetOpVolgorde` gezet. Maar de controle die vóór het online zetten draait, komt er niet door.
  - Voorstel: in `les()` direct na `await squlaBegin(...)` `st.huidig = "";` zetten, zoals de handleiding van het beginscherm voorschrijft. Dan tekent de eerste vraag zich opnieuw, met `test`. Daarna opnieuw spelen.
- Slepen (op de code beoordeeld): slepen naar het dichtstbijzijnde vakje werkt. Laat je los naast een vakje, dan gaat het ding terug. Tikken legt het ding in het eerste lege vakje, en tikken in een vakje haalt het terug. Het lichtje doet het één keer voor. In orde.
- Beginscherm: de potjes komen in beeld en na Nee gaat de uitleg over potjes (staven): in orde. Tip: "Drie potjes met een getal." is geen hele zin.
- Tip (3.13): bij getallen is "van groot naar klein" natuurlijker dan "van meer naar minder".

### squla-meer-minder-evenveel3-2 — ronde 1 — AFGEKEURD (2026-11-01 13:25)
- Rekenen: in orde.
- Beginscherm: FOUT (14.21 en 4.1).
  - Het voorbeeld en het welkom gaan over eieren in doosjes van 6 (schermfoto: 4 doosjes).
  - Na Nee telt Bliepo 23 ballonnen in rijen van 10 en daarna vliegers (r. 787–791). Over eieren en doosjes zegt hij niets (zelf nagelopen, `controle/nee32/`).
  - Ook `start` (r. 786) is een groep ballonnen, die even in beeld flitst.
  - Voorstel: de uitleg met eierdoosjes, bijvoorbeeld `dozen(3)` = 18: "In elk doosje zitten er 6", 6, 12, 18. Daarna eventueel de vliegers. Zet `start` op de doosjes.
- Kleur: FOUT (14.20). r. 785 `"Eieren liggen in doosjes van {6}."` heeft geen kleur. Voorstel: `{6:wit}`; de eieren zijn wit.
- Tip: "Tel de ballonnen. Welk getal is meer?" Duidelijker is "Welk getal is meer dan het aantal ballonnen?" Bliepo zegt wel eerst "Let op, nu vraag ik iets anders."
- Spelen: tot het eind.

### Algemeen (alle Squla-lessen, niet alleen deze)
1. **Getalkleuren zijn in beeld nooit te zien (2.2/14.20).** `src/components/les/Lesscherm.module.css` r. 595–598 bevat:
   - `[data-indeling="synthesis"] .getal { color: inherit !important; }`
   - Elke Squla-les gebruikt `indeling: "synthesis"`. Daardoor is elk getal in de zin boven Bliepo wit, ook `{12:rood}`.
   - Gezien op schermfoto's: squla-tellen-fruit-1 "Ja! Het zijn er 12." heeft een witte 12 (zou rood zijn). squla-min-bus1-1 "nog 5 pakjes" heeft een witte 5 (zou bruin zijn).
   - Al het kleurwerk van 2.2, 14.10, 14.16 en 14.20 in de lessen werkt dus niet in beeld.
   - Deze regel staat er met een reden (28 okt: geel en paars waren slecht leesbaar op blauw) en zit in een gedeeld bestand. Weghalen of aanpassen mag alleen met toestemming van Sara (regel 3). Een idee om voor te leggen: alleen getallen met een eigen kleurwoord (`{n:kleur}`) hun kleur laten houden.
2. **Kaarten om de groepjes (1.4, twijfel).** In 1-2, 1-3, 2-1, 2-2 en 3-1 staan de voorwerpen op grote hologramkaarten met een lichte rand. Regel 1.4 zegt "geen kaders of kaartjes om voorwerpen, ook al heeft Squla ze". Hier is de kaart wel het ding waarop het kind tikt. Ik keur er niet op af, maar Sara moet beslissen.
3. Tip: de getallen op de bordjes in de scène zijn geel, en bij samen tellen staat de "10" naast roze ballonnen ook in geel. De kleur van het voorwerp past beter bij 2.2.

**Uitslag Meer, minder, evenveel ronde 1:**
- GOEDGEKEURD: 1-2, 1-3, 2-2.
- AFGEKEURD: 1-1, 2-1, 3-1, 3-2.

---

## Klokkijken, Splitsen en Piratenschat — ronde 2 — 2026-11-01

Zo gekeurd:
- Elk punt uit ronde 1 is nagekeken in de code en, waar het in beeld komt, op schermfoto's.
- Speeltest met GOED=1, één les tegelijk: 25 van de 26 lessen liepen tot het eind. Klokkijken3-3 stopte bij een sleepvraag (zie die les).
- Gekeurd op alle regels, ook hoofdstuk 14 t/m 14.21.
- **Gekleurde getallen in de zin werken nu.** Op de schermfoto's hebben ze de kleur van hun voorwerp, met een donkere rand:
  - klok: het uur oranje, de 6 en de 12 van de grote wijzer paars (klokkijken3-1/002);
  - splitsen: 2 paars en 4 oranje, net als de bolletjes in de bakjes en de stippen in de huisjes (splitsen1-2/005);
  - piraat-2: 6 − 1 = 5 in het geel van de sterren, zowel in de som als in de zin (piraat-2/005).

### Klokkijken (18 lessen)

Opgelost uit ronde 1:
- A1: het uur is overal `{n:oranje}` (kleine wijzer) en de 6 en de 12 zijn `{n:paars}` (grote wijzer). Dat geldt in `spreek`, `regel`, `waarKlein`, de uitleg na Nee en de rekenzinnen.
- digitaal-1: het goede antwoord is nu de telefoon met een klokje. Het klokje past op het scherm van de telefoon en van de laptop (schermfoto's 004 en 015). "Wat zie je bovenop?" is weg.
- digitaal-2: overal `bezorgbus`; "Tot de volgende keer!" midden in de les is vervangen door "De bus rijdt weg met de broodjes."
- hoelaat-1: "De zon staat hoog. De bus brengt de broodjes weg."; "langs de winkels".
- hoelaat-3: de vragen staan in de volgorde van de dag (10 → 8 uur); "Waar worden de broodjes gebakken?"; geen "Tot de volgende keer" meer.
- klokkijken3-1: het welkom zegt half 3, en het voorbeeld is half 3. De titel is "Halve uren lezen".
- klokkijken3-2: het welkom zegt half 9, en het voorbeeld is half 9.
- klokkijken3-4: "staat op 9 uur" en "De voetbal ligt al een uur in het gras." De plantjes zijn weg: het is nu "De gieter staat klaar."
- "Tik op het vinkje / het kruisje" wordt niet meer gezegd. `WELKOM_VINK` staat nog in de code, maar wordt niet gebruikt.

#### squla-klok-digitaal-1 — ronde 2 — GOEDGEKEURD
- Tip (14.20): r. 772 `{12}`, `{1}` (getallen op de wijzerplaat) zonder kleur. Ze worden in beeld wit, dus het klopt, maar schrijf ze bewust als `{12:wit}`.
- Tip (14.21): na Nee legt Bliepo uit hoe je een heel uur leest (klok op 3 uur). Het voorbeeld vraagt "Waar zie je ook zo'n klok?" De uitleg ("Dit is een wijzerklok…") helpt daar wel bij.

#### squla-klok-digitaal-2 — ronde 2 — GOEDGEKEURD
- Tip (blijft): "De bakkerij is dicht." (r. 832) komt vóór de koekjes die om 1 uur de oven in gaan.

#### squla-klok-hoelaat-1, hoelaat-2, hoelaat-3 — ronde 2 — GOEDGEKEURD
- Tip hoelaat-3: "laatste ronde van de dag" begint al om 10 uur 's ochtends.

#### squla-klok-klokkijken-1, -2, -3, klokkijken1-1, 1-2, 1-3, klokkijken2-1, 2-2, 2-3, klokkijken3-1, 3-2, 3-4 — ronde 2 — GOEDGEKEURD
- Tip: klokkijken-2 en klokkijken1-1 hebben nog steeds hetzelfde voorbeeld (`kiesKlok(U(2), [U(7), U(2)])`). De welkomzinnen zijn nu wel verschillend.
- Tip: de titels "Halve uren (moeilijker)" en "(nog moeilijker)" passen niet bij "Halve uren lezen". Beter: "Halve uren lezen (moeilijker)".

#### squla-klok-klokkijken3-3 — ronde 2 — GOEDGEKEURD (met aandachtspunt)
- Rekenen en beeld kloppen: de reeks half 6, 6 uur, half 7, 7 uur (schermfoto 022).
- Spelen: de speelcontrole kwam door de eerste sleepvraag, maar stopte bij de tweede ("alleen in de tekening te doen"). `sleepVraag` heeft `testAntwoord: null` (r. 458), dus de automatische speler kan niet goed slepen. Het slepen zelf en de code zien er goed uit; ik keur er niet op af.
  - Advies: geef `sleepVraag` een testantwoord, zodat de controle vóór het online zetten (5.7) deze les helemaal kan spelen.

### Splitsen (5 lessen)

#### squla-splits-splitsen1-1 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - De uitleg na Nee zegt "2 pionnen paars, 3 oranje" en "5 kun je splitsen in 2 en 3", in dezelfde kleuren.
  - Bij het tienvak: "Eén ligt onder de doek." of "Een deel ligt onder de doek.", en bij één bal: "Kijk naar de oranje pingpongbal die eronder ligt."

#### squla-splits-splitsen1-2 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - De stippen in de huisjes zijn paars en oranje, net als de getallen en de ballen in de bakjes (schermfoto 005).
  - Na Nee gaat de uitleg eerst over het voorbeeld (machine, bakjes, huisje) en daarna over de splitspaal.
  - "Onder staan de twee bakjes" is weg.

#### squla-splits-splitsen2-1 — ronde 2 — GOEDGEKEURD
- Opgelost: de keuzes zijn nu `[6, 10, 16]`, `[8, 18, 9]` en `[1, 10, 11]`. Er is geen getal boven 20 meer.
- Tip: "Een briefje van tien en vier munten." is geen hele zin.

#### squla-splits-splitsen2-2 — ronde 2 — GOEDGEKEURD
- Opgelost: "21 = 14 + 7" is weg.

#### squla-splits-delen-1 — ronde 2 — AFGEKEURD
- Opgelost:
  - "Tik dan op het vinkje" is weg uit `typGetal` (squla-splitsen-hulp.ts r. 95–104). In plus- en minsommen ook.
  - In de antwoordplaatjes liggen de knikkers en stuiterballen nu in of op het bakje (schermfoto 008).
- **Nieuw, FOUT (14.4/14.5/14.17):** de potloden zweven nu in een rij bóven een leeg glas (`beker-leeg`), maar Bliepo zegt:
  - "Ze staan in 4 bekers." (r. 708);
  - "Ja! In elke beker staan 3 potloden." (r. 714).
  
  Op schermfoto delen-1/025 staat geen enkel potlood in een beker. Daarbij lijkt `beker-leeg` op een waterglas.
  - Voorstel: de potloden ín de beker tekenen, met de punten boven de rand (de plek meten op `beker-leeg.png`). Of de zin aanpassen ("Bij elke beker liggen …").

### Piratenschat (3 lessen)

Opgelost uit ronde 1:
- Het verhaalbegin is terug (`naBegin`): "Kijk, een schatkaart!" (level 1), "We hebben een nieuwe schatkaart." (level 2), "We hebben een sleutel gevonden. Waar past hij op?" (level 3). Daardoor klopt "De sleutel past!" weer.
- "Bij de rots ligt een kistje."; "Is het omdat hij dan gaat roesten? Of omdat hij geen zwembroek heeft?"; "Kijk, daar ligt een maansteen met een sleutel ernaast."
- Piraat-3: de keuzes `[10, 19, 20]`, en overal "hoeveel … zijn er nog?".
- Welkom piraat-1 noemt de plussommen, welkom piraat-2 noemt min.
- De getallen bij voorwerpen staan in `aantal()`/`gv()` in de kleur van het voorwerp (goudstuk geel enzovoort).
- Piraat-1 10 + 20: volgens afspraak niet afgekeurd.

#### squla-piraat-1 — ronde 2 — AFGEKEURD
- **FOUT (2.1/14.20), de kleuren in de som en in de zin verschillen bij de kale plussommen** (`kaalPlus`, r. 202–225):
  - De som bovenaan krijgt de tegelkleuren (`som(l, st, a, "+", b)` met `ka = "tegel"`): op schermfoto piraat-1/030 is de 3 geel, de 4 groen en de 7 wit.
  - Bliepo zegt "Ja! 3 + 4 = 7." met een paarse 3, een oranje 4 en een blauwe 7 (r. 217: `g(a,"paars")`, `g(b,"oranje")`, `g(s,"tegel")`).
  - De vraag (r. 210) gebruikt weer de tegelkleuren, en de hulp (`plusUitleg`/`plusTip`) is helemaal wit.
  - Voorstel: één vaste set kleuren per som. Bijvoorbeeld in `toon` en `goed` `som(l, st, a, "+", b, …, "paars", "oranje", "wit")`, en in de vraag, het antwoord, `plusUitleg` en `plusTip` `g(a,"paars")`, `g(b,"oranje")`, `g(s)`.
  - Dit geldt voor 7 vragen in piraat-1 en 7 in piraat-3.
- **FOUT (14.21/4.1, staat er nog uit ronde 1):** het voorbeeld is "Waar liggen 14 goudstukken?" (tellen), maar na Nee legt Bliepo 3 + 2 diamanten uit (r. 391–404). Voorstel: eerst kort de goudstukken in rijen van 5 tellen (het voorbeeld), en daarna eventueel de plussom.
- Kleine 14.20-punten:
  - r. 157 "Waar zijn het er {14}?" en de tip r. 151/159 ("{5}", "{10}") gaan over goudstukken, maar zijn wit. Gebruik `gv(…, "goudstuk")`.
  - Tip: op het beginscherm (schermfoto 002) waren de goudstukken nog aan het verschijnen (lichtstraal).

#### squla-piraat-2 — ronde 2 — AFGEKEURD
- Rekenen, verhaal, taal en de minsom-kleuren (geel = sterren) zijn in orde (schermfoto 005).
- **FOUT (14.20):**
  - In de uitleg na Nee gaan de getallen over sterren, maar ze zijn wit (r. 456 `g(2)`, r. 458 `g(3)`, `g(5)`, `g(2)`, `g(3)`). Direct ervoor staat "Kijk: 5 sterren" wel geel. Voorstel: `gv(…, "ster")`.
  - Hetzelfde bij een fout antwoord: `noem: (x) => g(x)` in `minVraag` (r. 240) zegt een wit getal, terwijl `goed` hetzelfde getal geel zegt. Voorstel: `noem: (x) => gv(x, vw)`.

#### squla-piraat-3 — ronde 2 — AFGEKEURD
- **FOUT (2.1/14.20):** dezelfde kleurfout bij `kaalPlus` als in piraat-1. Op schermfoto piraat-3/017 staat in de som een witte 13 en een blauwe 7, en in de zin een paarse 13 en een oranje 7.
- **FOUT (14.21/4.1):** het voorbeeld is de minsom "7 − 4: hoeveel sterren zijn er nog?" Na Nee legt Bliepo de plussom 8 + 5 uit, met een planeet (r. 507–516). Over het voorbeeld zegt hij niets.
  - Ook daar zijn de kleuren verschillend: de som bovenaan heeft tegelkleuren, de zin is wit.
  - Voorstel: de uitleg met de sterren-minsom van het voorbeeld (grijs wat eraf gaat, zoals in piraat-2), en daarna kort het teken (plus of min).
- Verder `minVraag` `noem` wit, zoals bij piraat-2.

**Uitslag ronde 2:**
- GOEDGEKEURD: alle 18 kloklessen, splitsen1-1, 1-2, 2-1, 2-2.
- AFGEKEURD: splits-delen-1, piraat-1, piraat-2, piraat-3.


---

## Rekenmix — ronde 1 — 2026-11-01 (controleur Opus)

Zo gekeurd:
- Broncode `src/components/les/lessen/squla-rekenmix.tsx` (alle 240 vragen en 18 voorbeelden zelf nagerekend) en het vlak `src/components/les/vlakken/squla-rekenmix-vlak.tsx`, op alle regels van BOUWREGELS.md, ook 1.21, 2.1/2.2, 4.1/4.3 en hoofdstuk 14.
- Analyses `SQULA-ANALYSE/rekenmix-*-volledig.md`: opbouw, volgorde van de vraagsoorten en getallenreeksen volgen Squla per level.
- Speeltest `GOED=1`, één les tegelijk, alle 16 lessen **tot het eind**, niets vastgelopen. Schermfoto's in `scratchpad/controle/opus-rm/`. Het Nee-pad zelf nagelopen bij mix1-1 (`scratchpad/controle/opus-nee/mix1-1`).
- Alle gebruikte plaatjes bekeken op #0b1028 (vel in `scratchpad/controle/opus-vel/`) en in de les op de schermfoto's.

Wat overal klopt:
- Elke som, elk goed antwoord en elk testAntwoord. Elke vraag heeft precies één goed antwoord; afleiders zijn echte kinderfouten (1 meer, 1 minder). Getekende aantallen = het getal in de vraag.
- Geen krokodil, kikker, ander dier of mens; geen gezichten. De vervangingen houden hun rol (1.21): pakjes/ballen/knikkers tellen, bal en doos voor in/op/voor, boterham met kaas voor meer/minder, bal in een doos en knikkers in een zak voor splitsen.
- Getalkleuren (2.2/14.20) passen bij de voorwerpen: appel/bal/auto/bloem/aardbei/raketje rood, potlood/boom/satelliet groen, knikker/knoop blauw, ster/blokje geel, kraal/planeet/ufo paars, koekje bruin. (De planeet is nu ook in de code paars.)
- Eigen welkomzin per les, alle 16 verschillend en in STEMZINNEN.md (4.3). Het voorbeeld op het beginscherm is de echte eerste vraag (4.1). Ja gaat meteen naar een schone eerste vraag.
- Geen kaders of kaarten met rand om de voorwerpen (1.4); plekjes zijn lichtvlakken op de vloer. Plaatjes in glansstijl B, scherp, geen witte randjes.
- 15 vragen per les, invoerveld met cijfers bij de typvragen (geen schermtoetsenbord).

### Algemene punten (gelden voor meer lessen)

**R1 (4.1/14.13/14.21) — de uitleg na Nee gaat over iets anders dan het voorbeeld.** In `les()` (r. 1300–1312) toont het beginscherm de eerste vraag (`opgaven[0]`), maar na Nee speelt `legUit` de aparte `voorbeeld`-vraag uit de lesdefinitie. Waar die een ander voorwerp of een andere vraag heeft, ziet het kind na Nee opeens iets anders dan op het beginscherm. Zelf nagelopen bij mix1-1: beginscherm = 7 appels door elkaar, na Nee telt Bliepo 6 blauwe knikkers in twee rijen. Per les staat hieronder of dat zo is.
- Voorstel (één plek, voor alle 16): laat het beginscherm het eerste `voorbeeld` tonen in plaats van `opgaven[0]` (`toonOpgave(l, st, aanpak(l, st, \`${d.id}-vb1\`, d.voorbeeld[0]).o, null)`, daarna `st.huidig = ""`) en pas de welkomzin daarop aan. Dan gaat de uitleg vanzelf over het voorbeeld en verklapt hij vraag 1 niet. Of andersom: maak elk `voorbeeld` van hetzelfde voorwerp en dezelfde soort vraag als vraag 1, met andere getallen die nergens in de les staan.

**R2 (5.3) — rood bij een fout in Verbinden.** `squla-rekenmix-vlak.tsx` r. 684: `g.lineStyle(7, goed[l] ? GOED : 0xff7b8b, 1)`. Een foute lijn wordt 0,9 s roze-rood. Regel 5.3: bij een fout geen rood. Voorstel: foute lijn grijs en dof (bijv. `0x8a94b8`, alpha 0,6) en dan laten verdwijnen. Raakt alleen mix2-4.

**R3 (7.7/1.9) — de vormen zijn vlak, zonder glans.** In mix1-2 (keuzes cirkel/driehoek/vierkant/rechthoek, lichtblauw) en mix2-3 (rode/gele/blauwe/groene vormen) zijn de vormen platte kleurvlakken met een donkere rand: geen verloop, geen lichtvlekje, geen schaduw. Dat wijkt af van glansstijl B en van dezelfde vormen in squla-vormen-kleuren-2 (VORMSTIJL in `squla-vormen-tekenen.ts`). Schermfoto's mix1-2/006, mix2-3/005. Voorstel: de vormen in `texVorm` tekenen met VORMSTIJL (zelfde vorm = zelfde uiterlijk).

**R4 (plaatje `kaars`) — lijkt op een stuk vuurwerk.** Een rode cilinder met een gebogen grijs lontje, zonder vlammetje of was (schermfoto mix3-1/008). Op de donkere achtergrond lijkt het een rotje of dynamiet, en Squla's vuurpijl en lucifers waren juist bewust weggehaald (regel 1.8/1.20). Gebruikt in mix3-1 (dik/dun) en mix4-2 (van dik naar dun). Beter: een kaars die je meteen herkent (licht van kleur, met een klein vlammetje of een druppel was), in glansstijl B; of in deze vragen een ander ding dat dik en dun kan zijn (potlood, boom).

Tips (geen afkeuring):
- De plekjes en lichtvlakken onder keuzes hebben een gestippelde rand. Dat staat nergens als verboden voor Squla, maar 1.11 noemt "gestippelde potjes" als iets wat een kind niet snapt. Sara laten kijken.
- De getallen die Bliepo bij het samen tellen in de tekening zet (labels) zijn altijd geel, ook bij blauwe knikkers (Nee-pad mix1-1). Tip 2.2: de kleur van het voorwerp.
- 2.1 (twijfel voor Sara): bij "samen" (mix4-1), splitsen (mix3-4) en blokjes (mix2-3) zegt Bliepo een somzin ("3 en 1 is samen 4"), maar beide groepjes hebben dezelfde kleur. Het zijn geen sommen met een plusteken; ik keur er niet op af.
- 3.5 (twijfel voor Sara): in mix2-2 leest Bliepo de drie woordkeuzes vooraf voor ("Op de doos, achter de doos of in de doos?"). Regel 3.5 zegt "keuzes niet vooraf voorlezen", maar het zijn woorden en een kind van groep 3 leest nog niet. Ik keur er niet op af.

### squla-rekenmix-mix1-1 — Rekenmix 1 — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (15 telvragen, 5 t/m 12, zoals Squla level 1).
- Plaatje: in orde (appels, ballen, potloden, auto's, bloemen, knikkers, sterren).
- Taal: in orde.
- Beginscherm: FOUT (R1). Welkom en voorbeeld gaan over appels door elkaar (r. 1336); na Nee telt Bliepo knikkers in twee rijen (r. 1337). Voorstel: `voorbeeld: [{ t: "tel", v: APPEL, gr: los([{ naam: "appel", n: 6 }], 5), keuzes: [6, 5, 7], soort: "tel" }]` (6 appels komt nergens als vraag voor).
- Spelen: tot het eind, 16 stappen.

### squla-rekenmix-mix1-2 — Rekenmix 1 (moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen/inhoud: FOUT (11.1, geen dubbele vragen). Vraag 6 en vraag 14 zijn dezelfde: `{ naam: "pizzadoos", zin: "de pizzadoos", vorm: "vierkant" }` (r. 1379 en r. 1387), alleen de keuzes staan anders. Voorstel: maak vraag 14 een ander vierkant ding, bijvoorbeeld `doos` ("de doos", vierkant).
- Plaatje: FOUT (R3, vlakke vormen). Tip: `pizzadoos` staat schuin in perspectief en lijkt eerder een ruit dan een vierkant (schermfoto 014); van boven gezien is duidelijker.
- Beginscherm: FOUT (R1). Welkom en voorbeeld: de tent; na Nee: de zon (r. 1372). Voorstel: R1 (beginscherm met de zon en "Kijk naar de zon. Welke vorm lijkt erop?"), want een uitleg met de tent verklapt vraag 1.
- Taal: in orde.
- Spelen: tot het eind.

### squla-rekenmix-mix1-3 — Rekenmix 1 (nog moeilijker) — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (elke keer precies één goed plaatje, ook als een keuze niet in de rij staat).
- Plaatje: in orde (voertuigen, ruimtedingen, speelgoed).
- Taal: in orde. Tip: "In het midden staat hij tussen de andere twee in." (r. 596): "hij" past niet bij "het skateboard"; beter "Wat in het midden staat, heeft links en rechts iets naast zich."
- Beginscherm: in orde; voorbeeld en uitleg gaan allebei over voertuigen in een rij.
- Spelen: tot het eind.

### squla-rekenmix-mix1-4 — Rekenmix 1 (heel moeilijk) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (richting en volgorde zoals Squla: 3× meer→minder, 2× minder→meer).
- Beginscherm: FOUT (R1). Welkom en voorbeeld: koekjes (r. 1437); na Nee: appels (r. 1438). Voorstel: `voorbeeld: [{ t: "ordenAantal", v: KOEKJE, aantallen: [2, 6, 4], richting: "af" }]`.
- Taal: FOUT (14.2). De namen van de groepjes (r. 675, `` `${n} ${q.v.meer}` ``, voorgelezen door een voorleesprogramma) worden "1 knikkers", "1 ballen", "1 koekjes", "1 appels" (vragen 2, 7, 9, 14; schermenlijst 008, 015, 017, 022). Voorstel: enkelvoud bij 1 (`n === 1 ? q.v.naam-woord : q.v.meer`; voor "speelgoedauto" de spreeknaam "auto").
- Tip: "De meeste komt vooraan." → "Het groepje met de meeste komt vooraan."
- Spelen: tot het eind.

### squla-rekenmix-mix2-1 — Rekenmix 2 — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (meer, meeste, minder, minste, evenveel; steeds één goed plaatje).
- Plaatje: in orde (boterham met weinig/veel/heel veel kaas, spiesjes). Tip: `spies-leeg` is een dun stokje dat bijna wegvalt.
- Taal: in orde ("Op welk spiesje zit het meeste fruit?", "Op welke boterham zit de meeste kaas?" kloppen).
- Beginscherm: in orde (boterham, uitleg ook met boterham). Tip (14.21): de uitleg (`minder`, keuzes `[1, 0, 2]`) is precies vraag 3; neem `[2, 1, 0]`.
- Spelen: tot het eind.

### squla-rekenmix-mix2-2 — Rekenmix 2 (moeilijker) — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde. Plaatje: in orde; bal in, op, voor, naast en achter de doos is op de schermfoto's goed te zien (002, 006, 012).
- Taal: in orde. Tip: zie 3.5 bij de algemene punten.
- Beginscherm: in orde (bal en doos, uitleg ook).
- Spelen: tot het eind.

### squla-rekenmix-mix2-3 — Rekenmix 2 (nog moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (blokjes 5 + rest, 6 t/m 10; kleur + vorm steeds één goed).
- Plaatje: FOUT (R3, vlakke vormen, schermfoto 005).
- Beginscherm: FOUT (14.21). De uitleg gebruikt de gele cirkel tussen geel/rood (r. 1542); vraag 10 (r. 1555) is bijna dezelfde vraag met hetzelfde antwoord. Voorstel: een kleur die nergens gevraagd wordt, bijvoorbeeld `{ kleur: "paars", vorm: "driehoek", keuzes: [["paars","driehoek"],["paars","vierkant"],["oranje","driehoek"]] }` en welkom/voorbeeld via R1.
- Taal: in orde ("een geel vierkant", "een gele driehoek" kloppen).
- Spelen: tot het eind.

### squla-rekenmix-mix2-4 — Rekenmix 2 (heel moeilijk) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (alle 15 verbindingen nagerekend, 4 t/m 10).
- Fout-weergave: FOUT (R2, foute lijn rood).
- Plaatje: in orde (schermfoto 003). Taal: in orde.
- Beginscherm: in orde (ballen met getallen, uitleg ook).
- Spelen: tot het eind (91 stappen).

### squla-rekenmix-mix3-1 — Rekenmix 3 — ronde 1 — AFGEKEURD (2026-11-01)
- Beginscherm: FOUT (14.4/14.13). r. 1618: "Zet ze op volgorde, van klein naar groot." Maar vraag 1 (het voorbeeld) is "klein, kleiner, kleinst": de grootste bal hoort vooraan, de kleinste achteraan. Wie het welkom volgt, legt hem verkeerd. Daarna legt Bliepo na Nee bomen uit met "groot, groter, grootst" (r. 1619): ander ding en andere volgorde. Voorstel: welkom "Drie ballen zijn niet even groot. Zet ze op volgorde: klein, kleiner, kleinst." en een uitleg met ballen (R1).
- Taal: FOUT. r. 724: `` `Ja! ${woorden.map(Hoofd).join(", ")}.` `` geeft "Ja! Klein, Kleiner, Kleinst." (hoofdletters midden in de zin). Voorstel: `Hoofd(woorden.join(", "))`.
- Plaatje: FOUT (R4, `kaars`). Tip: de blokken in de torens (laag, lager, laagst) staan met een kier boven elkaar (schermfoto 017); laten aansluiten (14.17).
- Rekenen: in orde (volgorde volgt de woorden, zoals Squla).
- Spelen: tot het eind.

### squla-rekenmix-mix3-2 — Rekenmix 3 (moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (5 keuzes, steeds de hele rij).
- Beginscherm: FOUT (14.21). Na Nee telt Bliepo de hele rij RIJ_A af (eerste … laatste, r. 1654, `alles`); vraag 2 t/m 5 gaan over precies die rij, en de uitleg (plek 1) is gelijk aan vraag 3. Voorstel: voor de uitleg een rij in een andere volgorde die niet in de les staat, bijvoorbeeld `["bus", "bootje", "fiets", "treintje", "speelgoedauto"]`.
- Plaatje: in orde. Tip: de voertuigen kijken verschillende kanten op (auto naar links, fiets naar rechts); "vooraan" en "achteraan" zijn dan minder duidelijk.
- Taal: in orde.
- Spelen: tot het eind.

### squla-rekenmix-mix3-3 — Rekenmix 3 (nog moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (voor/na 5 t/m 10, typvragen met invoerveld, schermfoto 012).
- Beginscherm: FOUT (14.13/14.21). Welkom en voorbeeld: "Welk getal komt net voor 7?"; na Nee: "na 5" (r. 1687). Dat is een andere richting, en het is vraag 4 (r. 1692, na 5 = 6). Voorstel: uitleg "net voor 5" (antwoord 4, komt in de les niet voor) met `keuzes: [4, 6, 3]`.
- Taal: tip (14.3): "Welk getal komt net voor 7?" naast "Welk getal komt na 9?"; overal hetzelfde ("net na").
- Spelen: tot het eind.

### squla-rekenmix-mix3-4 — Rekenmix 3 (heel moeilijk) — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (alle 15 splitsingen en het voorbeeld 5 = 4 + 1).
- Plaatje: in orde (splitsbeen, doos, zak, ballen en knikkers).
- Taal: in orde ("Er zijn 6 ballen. Hoeveel zitten er in de doos?").
- Beginscherm: in orde (ballen en doos, uitleg ook; verklapt geen vraag).
- Spelen: tot het eind.

### squla-rekenmix-mix4-1 — Rekenmix 4 — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (tellen in een druk plaatje telt alleen de eerste soort; samen 2 t/m 9).
- Beginscherm: FOUT (R1). Welkom en voorbeeld: "Tel alleen de raketjes" in een druk ruimteplaatje (r. 1758); na Nee: 2 + 3 ballen samen (r. 1759), een andere soort vraag met een ander ding. Voorstel: uitleg met een druk plaatje, bijvoorbeeld `los([{ naam: "raketje", n: 7 }, { naam: "ster", n: 3 }, { naam: "planeet", n: 2 }], 75, 820, 580, 120)`, `soort: "druk"`.
- Plaatje en taal: in orde.
- Spelen: tot het eind.

### squla-rekenmix-mix4-2 — Rekenmix 4 (moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (verder tellen 10–16, groepjes, raketjes van hoog naar laag, dik naar dun, eerst/dan).
- Plaatje: FOUT (R4, `kaars` bij "van dik naar dun", r. 1809). Tip: in `ijsje-twee-bollen` zit het nieuwe bolletje onder het eerste, niet erop ("Dan nog een bolletje erbij").
- Taal: in orde. Beginscherm: in orde (verder tellen, uitleg vanaf 5).
- Spelen: tot het eind.

### squla-rekenmix-mix4-3 — Rekenmix 4 (nog moeilijker) — ronde 1 — GOEDGEKEURD (2026-11-01)
- Rekenen: in orde (precies één groep met het gevraagde aantal, 4 t/m 10).
- Plaatje, taal en beginscherm: in orde (sterren, uitleg met 4 sterren, komt in de les niet voor).
- Spelen: tot het eind.

### squla-rekenmix-mix4-4 — Rekenmix 4 (heel moeilijk) — ronde 1 — AFGEKEURD (2026-11-01)
- Rekenen: in orde (meer dan, minder dan, evenveel, laatste/middelste ballon; steeds één goed).
- Beginscherm: FOUT (R1 en 14.21). Welkom en voorbeeld: raketjes, "meer dan 5" (r. 1864); na Nee: ballen `[3], [4], [2]` meer dan 3 (r. 1866). Dat is een ander ding en precies vraag 6 (r. 1875, ballen `[3], [2], [4]`). Voorstel: uitleg met raketjes en een getal dat niet gevraagd wordt, bijvoorbeeld `kr("raketje",[4]), kr("raketje",[3]), kr("raketje",[5])`, meer dan 4.
- Plaatje en taal: in orde.
- Spelen: tot het eind.

**Uitslag Rekenmix ronde 1:**
- GOEDGEKEURD: mix1-3, mix2-1, mix2-2, mix3-4, mix4-3.
- AFGEKEURD: mix1-1, mix1-2, mix1-4, mix2-3, mix2-4, mix3-1, mix3-2, mix3-3, mix4-1, mix4-2, mix4-4.

---

## Tijd — ronde 1 — 2026-11-01 (controleur Opus)

Zo gekeurd:
- Broncode `src/components/les/lessen/squla-tijd.tsx` (alle vragen, verhaaltjes, uitleg en hulp), de vlakken `squla-tijd-trein.tsx` en `squla-tijd-plaatjes.tsx` en `squla-tijd-tekeningen.ts`, op alle regels van BOUWREGELS.md.
- Analyses `SQULA-ANALYSE/tijd-*-volledig.md`: opbouw en volgorde volgen Squla (ook de drie vragen die aan het eind terugkomen).
- Speeltest `GOED=1`, één les tegelijk: alle 7 lessen **tot het eind**, niets vastgelopen. Schermfoto's in `scratchpad/controle/opus-tijd/`.
- Extra gezocht op resten van mensen: geen Noa, Sam, Tim, bakker, mama/papa, juf, "hij/zij" of "wie" meer in de zinnen. Alleen nog "we" (Bliepo en het kind) en "je": dat klopt.

Wat overal klopt:
- Alle antwoorden en testAntwoorden. De kalender is juni met 1 juni op dinsdag: 9 juni = woensdag, 8 en 13 in dezelfde rij, de boogjes 9→13 = 4, 10→13 = 3, 11→13 = 2, "morgen = rechts ernaast" klopt overal (nagerekend in `plekInMaand`).
- De verhaaltjes in dagen-3 kloppen allemaal: zwembad (di → do), kapperszaak (wo → vr), kamp (do + 3 nachtjes = zo), huis geschilderd (gisteren vanaf zo = za), taart in de oven (za → vr feest → do), slaapfeest (ma + 2 nachtjes = wo). Plaatjes passen erbij (zwembad, schaar, tent, huis, taart, bed).
- De bakkerij in tijden-2 werkt zonder bakker: "In de bakkerij wordt deeg gemaakt", "de deur van het slot doen", "de hele winkel vegen". De feestkalender vervangt de verjaardagskalender logisch (het woord "feest" bij een datum, een feesthoedje op 13 juni).
- Elke les 12 vragen + 3 die terugkomen = 15. Eigen welkomzin per les, in STEMZINNEN.md. Het voorbeeld op het beginscherm is de eerste vraag.
- Geen mensen of gezichten. Het handje is een lichtje.

### Algemeen punt T1 (5.3) — rood bij een fout, in alle 7 lessen
- `squla-tijd-plaatjes.tsx` r. 139 `RING = { …, rood: "#e8453c" }` en r. 313/330: een fout gekozen kaartje of een fout gelegd kaartje krijgt een rode rand.
- `squla-tijd-trein.tsx` r. 222–234 en r. 435: een foute dagkaart krijgt een rode rand (`#ff7a6e`).
- Regel 5.3: bij een fout geen rood; het verkeerde kaartje wordt grijs of verdwijnt. Voorstel: bij fout geen rand, alleen `uit` (dof, 0,35) en het schudden dat er al is; bij ordenen een fout vak gewoon leeg laten teruggaan.
- Daarom zijn alle 7 lessen afgekeurd, ook als er verder niets mis is.

Tips (alle lessen):
- 3.5 (twijfel voor Sara): bij woordkeuzes leest Bliepo de keuzes vooraf voor ("Donderdag, zaterdag of zondag?"). Dat is bewust (kop van het bestand: groep 3 leest nog niet), maar regel 3.5 zegt het anders.
- "Tikken mag ook." staat bij de eerste sleepvraag; dat is uitleg over hoe je iets doet, geen knop. Geen afkeuring.

### squla-tijd-dagen-1 — Dagen van de week — ronde 1 — AFGEKEURD (alleen T1) (2026-11-01)
- Rekenen, plaatje (weektrein), taal, beginscherm: in orde.
- Tip (14.21): de uitleg na Nee zegt al dat maandag de eerste, zondag de laatste en zaterdag/zondag het weekend is (vraag 1, 2 en 4). Dat is lesstof, daarom geen afkeuring.
- Spelen: tot het eind.

### squla-tijd-dagen-2 — Dagen van de week (moeilijker) — ronde 1 — AFGEKEURD (alleen T1) (2026-11-01)
- Rekenen, taal, beginscherm (na dinsdag, uitleg met woensdag/donderdag): in orde.
- Tip (14.21): "Na zondag begint de week weer met maandag." (r. 438) is het antwoord van vraag 4.
- Spelen: tot het eind.

### squla-tijd-dagen-3 — Dagen van de week (nog moeilijker) — ronde 1 — AFGEKEURD (alleen T1) (2026-11-01)
- Rekenen en verhaaltjes: in orde (zie boven).
- Taal: in orde. Tip: "Het bed staat klaar." (r. 611) staat er twee dagen te vroeg; beter "Over 2 nachtjes is er een slaapfeest." zonder die zin.
- Spelen: tot het eind.

### squla-tijd-kalender-1 — De kalender — ronde 1 — AFGEKEURD (2026-11-01)
- Zin en beeld: FOUT (14.4). Bij de weekkalender (vraag 4) is gym een **hoepel** (`activiteit gym = hoepel`, `squla-tijd-tekeningen.ts` r. 74), maar Bliepo zegt "Zoek de dagen met de bal." (r. 903) en de tip "Op welke kalender zie je een bal?" (r. 905). Schermfoto 012: alleen ringen. Voorstel: "Zoek de dagen met de hoepel." / "Op welke kalender zie je een hoepel?".
- Taal: FOUT (14.1, rest van een mens). r. 1036: "Is er dan koorts, is er een feest, of is het de tandarts?" (was "Eefje is ziek / jarig / naar de tandarts"). "Is er dan koorts" is geen natuurlijk Nederlands. Voorstel: "Is het dan een feest? Of moet je naar de tandarts? Of ben je ziek?" en de keuzes "ziek / feest / tandarts".
- T1 (rood bij fout).
- Rekenen: in orde (8 in het rode vak, 13 bij het hoedje, 30 dagen, 12 maanden). De ballon als afleider bij "welk getal" komt van Squla.
- Beginscherm: in orde (klok, kalender, plaatjes; uitleg over dag-, week- en maandkalender).
- Spelen: tot het eind.

### squla-tijd-kalender-2 — De kalender (moeilijker) — ronde 1 — AFGEKEURD (2026-11-01)
- Beginscherm: FOUT (14.13). Welkom en voorbeeld: "Op de kalender van juni staat een rood vak. Welk getal staat daar?" Na Nee (r. 1384–1388) gaat de uitleg over boogjes van 1 naar 3 juni; over het rode vak en het getal erin zegt Bliepo niets. Voorstel: eerst "Kijk, het rode vak. Daar staat een getal: {5:rood}. Dat is 5 juni." (met `rood=5`, komt niet in de les voor), daarna eventueel de boogjes.
- Taal: FOUT (14.1). r. 1267: "Kun je op de kalender tellen hoeveel nachtjes het nog duurt?" Tot wát? Bij Squla stond er "tot ik jarig ben". Voorstel: "…hoeveel nachtjes het nog duurt tot het feest?".
- Taal: FOUT (14.1/14.19). r. 1318: "In de droom is het rode vak 12 juni." Er droomt niemand meer: de vraag zegt "Stel je voor dat het al 12 juni is." Voorstel: "Stel je voor: het rode vak is 12 juni." Tip: de gedachtewolk zonder iemand die denkt (`droom`, schermfoto 027) mag blijven als "stel je voor"-wolk.
- Plaatje: FOUT (1.15). Bij "Volg de rode pijl naar boven" (vraag 3, `maand|pijl=9`) loopt de pijl dwars over het getal 2 (schermfoto 010). Voorstel: de pijl laten stoppen onder rij 1 en de kolomkop "wo" laten oplichten, of de pijl naast de getallen langs laten lopen (`squla-tijd-tekeningen.ts` r. 162).
- T1 (rood bij fout).
- Rekenen: in orde.
- Spelen: tot het eind.

### squla-tijd-tijden-1 — Tijden — ronde 1 — AFGEKEURD (2026-11-01)
- Beginscherm: FOUT (14.13). Welkom en voorbeeld: kampvuur op vrijdag, "Welke dag komt na vrijdag?". Na Nee (r. 1633–1645) legt Bliepo ochtend/middag/avond/nacht en gisteren/vandaag/morgen uit; over de dagen van de week en "na vrijdag" niets. Voorstel: begin de uitleg met "Gisteren was het vrijdag. Na vrijdag komt zaterdag. Dus vandaag is het zaterdag." (of kies een andere dag), daarna de rest.
- Taal: FOUT. r. 1477: "Het groene boek kwam straks." ("straks" kan niet in de verleden tijd). Voorstel: "Het groene boek kwam pas later."
- Plaatje: FOUT (1.4). De dagdelen (`dagdeel` in `squla-tijd-tekeningen.ts` r. 349–372) zijn plaatjes in een kader met een dikke donkere rand en ronde hoeken (schermfoto 013). Voorstel: de lucht zonder kader, of alleen zon/maan/sterren los in glansstijl.
- T1 (rood bij fout).
- Rekenen: in orde (zaterdag, rode boek, lang, kort, straks, nacht, middag, laat, gisteren-vandaag-morgen, zondag, vrijdag).
- Tip: de tip bij "Welk boek lazen we als eerste?" is "Het was het rode boek." (r. 1433): dat is het antwoord.
- Spelen: tot het eind.

### squla-tijd-tijden-2 — Tijden (moeilijker) — ronde 1 — AFGEKEURD (alleen T1) (2026-11-01)
- Rekenen: in orde (steeds het logische antwoord).
- Plaatje: in orde (bed, schoen, bakkerij, deegkom, strooier, taart, kers, oven, ei, bezem, sleutel, glas, jas).
- Taal: in orde. Tips: "Wat duurt het langst? De rondleiding, of een broodje krijgen?" (r. 1790): bij twee dingen "langer". "Er is een bezoek aan de bakkerij!" en "de hele dag werken" zeggen niet wie; het klopt nog, maar "Je gaat op bezoek in de bakkerij" is duidelijker.
- Beginscherm: in orde (boterham en nacht slapen; uitleg met koekje en nacht slapen).
- Spelen: tot het eind.

**Uitslag Tijd ronde 1:**
- GOEDGEKEURD: geen.
- AFGEKEURD alleen op T1 (rood bij fout): dagen-1, dagen-2, dagen-3, tijden-2.
- AFGEKEURD met meer punten: kalender-1, kalender-2, tijden-1.

---

## Plussommen en Minsommen — ronde 2 — 2026-11-01

Zo gekeurd:
- Elk punt uit ronde 1 is nagekeken in de code en op schermfoto's.
- Speeltest met GOED=1, één les tegelijk: **alle 32 lessen tot het eind**, niets vastgelopen.
- De bus is ook bekeken op telefoonformaat (390 × 844, beginscherm bus1-2).
- Gekeurd op alle regels, ook 4.1/4.3 en hoofdstuk 14 t/m 14.21.

Opgelost uit ronde 1:
- **Pakjes in de bus:** ze liggen netjes in de laadruimte, in een rij van 10 met daarop de rest (plus-bus1-2/002, min-bus1-1/005).
- Er staat geen "10 + 0" meer; bij precies 10 zegt Bliepo "Onderin ligt een rij van 10."
- "Hoeveel donuts zijn het samen?" in plaats van "bij elkaar".
- Enkel- en meervoud bij de stippen via `stippen()`: "1 blauwe stip".
- "Tik dan op het vinkje" is weg (`typGetal` zegt alleen "Typ het getal.").
- "eraf" is "weg" geworden (bij de bus "uit"). "De ufo neemt er geen één mee" is weg.
- **Gekoppelde kleuren:** in de som bovenaan, in de zin en in de gloed van de voorwerpen dezelfde kleur. Bijvoorbeeld bakkerij-1/005: 1 rood met een rode gloed om het taartje, 4 groen met een groene gloed om de vier taartjes, 5 groen in de som en in de zin. Zo ook bij de bus en bij min-ruimte.
- Elke les heeft een eigen beginzin, en het voorbeeld is de echte eerste vraag. Na Ja komt de eerste vraag schoon in beeld.

**Pakjes in de bus (gevraagd):**
- Op de laptop is een pakje ±34 px en goed te tellen.
- Op de telefoon is het ±11 px. Je ziet nog wel de rij van 10 met 2 erop, maar losse pakjes tellen is lastig.
- Het aantal staat altijd in de zin en in de som, dus het kind hoeft niet te tellen. Ik keur er niet op af.
- Tip: op de telefoon de bus en de pakjes groter.

### Plussommen

#### squla-plus-bakkerij-1 — ronde 2 — AFGEKEURD
- **FOUT (14.21, al gemeld):** het welkom en het voorbeeld gaan over taartjes (1 + 4). Na Nee begint Bliepo met "Hier liggen 3 broodjes." (r. 854, `bakkerijUitleg([hoop(3, "broodje"), hoop(2, "broodje")], 3, 2, "broodjes")`). Voorstel: dezelfde uitleg met taartjes, bijvoorbeeld `hoop(3, "taart"), hoop(2, "taart")` en "taartjes".

#### squla-plus-bakkerij-2 — ronde 2 — AFGEKEURD
- **FOUT (14.21):** het welkom en het voorbeeld gaan over stokbroden (10 + 3), maar na Nee gaat het over koekjes (r. 886). Voorstel: de uitleg met stokbroden.

#### squla-plus-bakkerij-3 — ronde 2 — AFGEKEURD
- **FOUT (14.21):** het welkom en het voorbeeld gaan over koekjes (6 + 6), maar na Nee gaat het over cupcakes (r. 918). Voorstel: de uitleg met koekjes, bijvoorbeeld 8 + 5 koekjes.

#### squla-plus-dansen-1 en dansen-4 — ronde 2 — AFGEKEURD
- **FOUT (2.1/14.20):** in beeld staan de getallen zwart op witte rondjes, op een blauw, oranje of groen kaartje. Bliepo zegt ze in tegelkleuren. Op schermfoto dansen-1/005 zegt hij "Ja! 7 en 3 is samen 10." met een blauwe 7, een gele 3 en een rode 10. Die kleuren staan nergens in beeld.
  - Voorstel: de getallen in de zin `{n:wit}`, of de cijfers op de kaartjes in dezelfde kleur als in de zin.
- In `dansUitleg` (r. 676–679) is de 7 eerst oranje ("7 oranje stippen") en een zin later blauw ("7 en 3 is samen 10"). Maak er één kleur van: oranje, de kleur van de stippen.

#### squla-plus-dansen-2 en dansen-3 — ronde 2 — AFGEKEURD
- **FOUT (2.1/14.20):** op de platen staan gekleurde getallen: 3 roze, 8 paars, 7 turkoois, 5 oranje (schermfoto dansen-2/005). Bliepo zegt "3 en 7 is samen 10" met een gele 3 en een blauwe 7.
  - Voorstel: de plaatkleur gebruiken in de zin, of de platen in de tegelkleur van hun getal kleuren.
- `dansUitleg`: zelfde punt als hierboven.

#### squla-plus-bus1-1, bus1-2, bus1-3, bus2-1, bus2-2, bus2-3 — ronde 2 — GOEDGEKEURD
- Tip: zie "Pakjes in de bus" (telefoon).
- Tip: het welkom en de uitleg na Nee hebben andere getallen (welkom 12 + 5, uitleg 12 + 3). Wel hetzelfde beeld, dus goed.

#### squla-plus-kaal-1, kaal-2, kaal-3 — ronde 2 — GOEDGEKEURD

### Minsommen

#### squla-min-ruimte-1 — ronde 2 — AFGEKEURD
- **FOUT (14.21):** het welkom en het voorbeeld gaan over ballonnen (7 − 4), maar na Nee gaat het over raketjes (r. 786, `uitlegRuimte("raketje", 6, 2)`). Voorstel: `uitlegRuimte("ballon", …)`.

#### squla-min-ruimte-2, ruimte-3 — ronde 2 — GOEDGEKEURD
- Tip (blijft uit ronde 1): r. 284 "Er gaat er niet één weg." Beter: "Er gaat niets weg." (zoals r. 196 al zegt).

#### squla-min-bus1-1, bus1-2, bus1-3, bus2-1, bus2-2, bus2-3 — ronde 2 — GOEDGEKEURD
- De pakjes liggen in de bus (min-bus1-1/005).

#### squla-min-machine-1, machine-2, machine-3 — ronde 2 — GOEDGEKEURD

#### squla-min-machine-4 — ronde 2 — AFGEKEURD
- **FOUT (14.21):** het welkom ("je koopt een ijsje") en het voorbeeld gaan over een ijsje, maar na Nee koopt Bliepo een ballon (r. 1067–1068). Voorstel: de uitleg met het ijsje, dus `uitlegGeld([2, 1, 1], [1], "ijsje")`, en `begin` ook.

#### squla-min-kaal-1, kaal-2, kaal-3 — ronde 2 — GOEDGEKEURD

### Vraag voor Sara (geen afkeuring): de kleuren bij minsommen
Bij 7 − 4 (min-ruimte-1/003) hebben maar **3** ballonnen de blauwe kleur van de 7, en 4 de groene kleur van de 4. Bij de bus (8 − 3) zijn de 5 overgebleven pakjes paars (de kleur van de 8) en de 3 bezorgde geel.
- Regel 2.1 zegt: de voorwerpen bij een getal hebben de kleur van dat getal. Bij een minsom horen bij de 7 alle 7 ballonnen.
- Nu verklapt de kleur het antwoord al vóór het kind telt: tel de blauwe, dat zijn er 3.
- Voorstel om voor te leggen: eerst alle 7 in de kleur van de 7, en pas bij "weg" de 4 in de kleur van de 4 of grijs maken.

**Uitslag Plussommen en Minsommen ronde 2:**
- GOEDGEKEURD: plus-bus1-1..bus2-3 (6), plus-kaal-1..3, min-ruimte-2/3, min-bus1-1..bus2-3 (6), min-machine-1..3, min-kaal-1..3.
- AFGEKEURD: plus-bakkerij-1/2/3, plus-dansen-1/2/3/4, min-ruimte-1, min-machine-4.

---

## Piratenschat — ronde 3 en splits-delen-1 — ronde 3 — 2026-11-01

Speeltest met GOED=1, één les tegelijk: alle 4 lessen tot het eind. Gekeurd op alle regels t/m 14.22 en op de nieuwe uitwerking van 2.1.

### squla-piraat-1 — ronde 3 — GOEDGEKEURD
- Opgelost:
  - De kale sommen hebben overal dezelfde kleuren: in de som 3 paars, 4 oranje, ? geel (schermfoto 028), en in de zin "Hoeveel is 3 + 4?" ook 3 paars en 4 oranje. Ook in `goed`, `plusUitleg` en `plusTip`.
  - Na Nee telt Bliepo eerst de 14 goudstukken in rijen van 5 (het voorbeeld) en daarna de diamanten.
  - "Waar zijn het er {14}?" en de tips zijn nu goudstuk-geel.
- Tip: de uitleg na Nee zegt "Samen zijn het er 14." Dat is het antwoord van het voorbeeld zelf. Dat mag (het voorbeeld is de eerste vraag), maar zo krijgt het kind het antwoord van vraag 1 al te horen.

### squla-piraat-2 — ronde 3 — GOEDGEKEURD
- Opgelost: de uitleg na Nee zegt alle getallen in sterren-geel, en `noem` in `minVraag` is nu `gv(x, vw)`.

### squla-piraat-3 — ronde 3 — AFGEKEURD
- Opgelost: na Nee komt eerst de sterren-minsom 7 − 4 van het voorbeeld.
- **FOUT (2.1/14.20), in het tweede deel van de uitleg na Nee** (`squla-piraat.tsx`, `level3.uitleg`):
  - `som(l, st, 8, "+", 5)` en `som(l, st, 8, "+", 5, 13)` gebruiken nog de tegelkleuren.
  - `plusUitleg` zegt 8 paars en 5 oranje.
  - De slotzin `` `${g(8)} + ${g(5)} = ${g(13)}.` `` is helemaal wit.
  - Zo staan er drie verschillende kleuren voor dezelfde som.
  - Voorstel: `som(l, st, 8, "+", 5, …, "paars", "oranje", "wit")`, en in de zin `g(8, "paars")` en `g(5, "oranje")`.
- Tip (14.22): in de uitleg zijn de 4 sterren die weggaan al grijs vóór "Kijk: 7 sterren." (`toon(..., { uit: [...] })`). Mooier is ze eerst geel te laten en pas bij "Er gaan er 4 weg" grijs te maken.

### squla-splits-delen-1 — ronde 3 — AFGEKEURD
- Deels opgelost: de potloden staan nu in de beker, met de gummetjes boven de rand.
- **Nog FOUT (14.5/14.17):** op schermfoto 028 (vergroot) zijn de bundels van 5 en 6 potloden breder dan de beker. Aan beide kanten steken de groene potloden met hun punt naast de beker uit. Bij 4 net niet.
  - `beker-leeg` is ondoorzichtig, dus de potloden lijken áchter het glas te staan in plaats van erin.
  - Voorstel:
    - `cel` zo kiezen dat het grootste aantal (6) binnen de opening van de beker past (de opening meten op `beker-leeg.png`);
    - de potloden korter maken (`maat`), zodat er onder de rand niets uitsteekt;
    - of een smallere of doorzichtige pennenbeker gebruiken.

---

## Vormen en figuren — ronde 2 — 2026-11-01

Speeltest met GOED=1, één les tegelijk: **alle 7 lessen tot het eind**. Gekeurd op alle regels, nu ook op 4.1/4.3 (beginscherm) en 14.21.

Opgelost uit ronde 1:
- **Gelijke puzzelstukjes** mogen nu van plek wisselen (`gelijk`-afdruk in `squla-vormen-vlak.tsx` r. 466–541, regel 14.18). Dat geldt voor p2-15, kleuren-1, -2 en -3.
- **Bloembak:** de bloemen staan zichtbaar ín de bak, en de bak heeft glans (patronen-2/031). Het patroon klopt: zonnebloem, tulp, zonnebloem, rode bloem → zonnebloem, rode bloem.
- **Wandplank:** de bal, het autootje, het blok en het boek staan óp de plank (opruimen-1/007).
- o-15: de zin hangt af van de volgorde ("Hier staan ze door elkaar" alleen als dat ook zo is).
- **Oriënteren:**
  - "linkerkant/rechterkant", "naar beneden" en "Welk huisje past erbij?" zijn verbeterd.
  - De boomvraag gaat nu over "recht van voren".
- "Wat komt daar in het patroon na?" is weg.
- **Glans 7.7:** de ruimtelijke vormen hebben nu glans en een dunne rand (kleuren-3/001: rode bol).
- **Beginscherm:** elke les toont de echte eerste vraag met een eigen zin. De uitleg na Nee past bij het voorbeeld (de kralenrij, het rooster, soort bij soort, het grasveld, en bij de puzzels uitleg over het voorbeeld zelf).

### squla-vormen-patronen-1 — ronde 2 — GOEDGEKEURD
- "Welke kraal komt na de rode kraal?" met de rij rood, groen, blauw, rood, groen, blauw, rood en een lege plek (schermfoto 001). Klopt.
- Tip: "Tik op je antwoord." komt bij elke vraag terug. Dat is geen knop-uitleg, maar wel overbodig (3.15).

### squla-vormen-patronen-2 — ronde 2 — AFGEKEURD
- **FOUT (3.12/14.4):** het welkom zegt "Nu staan de kralen in rijen onder elkaar." (`squla-vormen.tsx` r. 1258). In het voorbeeld en in de uitleg staan vierkante blokjes in een rooster, geen kralen (schermfoto 002). Voorstel: "Nu staan de blokjes in rijen onder elkaar."

### squla-vormen-opruimen-1 — ronde 2 — GOEDGEKEURD

### squla-vormen-orienteren-1 — ronde 2 — GOEDGEKEURD

### squla-vormen-kleuren-1, kleuren-2, kleuren-3 — ronde 2 — GOEDGEKEURD
- Tip (4.1, "niets actief"): op het beginscherm staan de onzichtbare knoppen "stukje 1 … plek 16" al in de pagina. `tikStuk` doet dan niets (`pzBezig`), dus het kind merkt het niet. Netter is ze pas te tonen als de puzzel actief is, zoals bij de kralen.
- Tip: de speelcontrole had per les ±540 tikken nodig. Dat komt door de gelijke stukjes en is geen fout.

---

## Rekenmix — ronde 2 — 2026-11-01 (controleur Opus)

Zo gekeurd:
- Elk punt uit ronde 1 nagekeken in de code (`git diff` sinds ronde 1) en op schermfoto's.
- Speeltest `GOED=1`, één les tegelijk: **alle 16 lessen tot het eind**. Schermfoto's in `scratchpad/controle/r2/`. Nee-pad zelf nagelopen bij mix3-1.
- Ook gekeurd op de nieuwe regels 14.22 (kleur verklapt niets), 2.1 (hele voorwerp in de getalkleur, fruit/eten met randje) en 14.23 (kijk als een kind).

Opgelost uit ronde 1:
- **R1:** in mix1-1, 1-2, 1-4, 2-3, 3-1, 3-2, 3-3, 4-1 en 4-4 toont het beginscherm nu het voorbeeld (`beginMetVoorbeeld`), met een welkomzin die erbij past. De uitleg na Nee gaat over precies dat beeld en verklapt geen latere vraag (6 appels, de zon, koekjes, paarse driehoek, ballen klein-kleiner-kleinst, een andere rij voertuigen, net voor 5, 7 raketjes, meer dan 4 raketjes). Na Ja komt vraag 1 schoon in beeld (mix1-1/004: 7 appels).
- **R2:** een foute lijn bij Verbinden is grijs en dof, niet rood.
- **R3:** de vormen hebben glansstijl B, net als in de vormenlessen (mix1-2/002, mix2-3/002).
- **R4:** `kaars` is een lichte kaars met een vlammetje; geen vuurwerk meer (mix3-1/008).
- mix1-2: vraag 14 is nu "de doos" (geen dubbele vraag meer).
- mix1-4: "1 knikker", "1 bal", "1 koekje", "1 appel".
- mix3-1: welkom "Zet ze op volgorde: klein, kleiner, kleinst." en "Ja! Klein, kleiner, kleinst." zonder hoofdletters midden in de zin.
- mix2-2: de woordkeuzes worden niet meer vooraf voorgelezen.
- 2.1: bij "samen", splitsen en de blokjes hebben de twee groepjes elk een eigen kleur (paars en oranje) in beeld, in de zin en in het splitsbeen; het totaal is wit. De kleur verklapt niets (14.22): bij splitsen staat de doos in oranje, de verstopte ballen zie je niet.

### Algemeen punt R5 (14.23) — groepjes te klein en onderaan geperst
Bij "op volgorde" en "welke groep" zijn de voorwerpen ±25–40 px groot en staan ze allemaal onderaan, terwijl het midden van het scherm leeg is:
- mix1-4/007 (knikkers ±38 px), mix4-2/007 (potloden, dunne streepjes van ±35 px), mix4-3/006 (bomen ±30 px), mix4-4/002 (raketjes ±40 px; het zesde raketje van het middelste groepje hangt op het plekje).
- Een kind van 6 telt dat lastig, en het ziet er niet vrolijk uit. Bij twijfel afkeuren (14.23).
- Voorstel: `kaartGroep(..., 44)` in `ordenAantal` (r. ±690) en `kr`/`bomen` (cel 60/50) en `r5` groter maken (±70–80), en de kaarten hoger in het vlak zetten zodat de ruimte gebruikt wordt.

### Nog om te zetten (2.1, besluit Sara; geen afkeuring)
- mix4-1, vragen 5 en 14: appels (fruit) houden hun rode kleur met een paars/oranje randje, en de getallen zijn paars en oranje. Volgens de uitwerking kiest de les bij fruit een getalkleur die bij het fruit past.
- Ballen, knikkers en de doos zijn al helemaal in de getalkleur.

### Uitslag per les
- **squla-rekenmix-mix1-1** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix1-2** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix1-3** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix1-4** — ronde 2 — AFGEKEURD: R5 (knikkers, sterren, aardbeien enz. te klein onderaan).
- **squla-rekenmix-mix2-1** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix2-2** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix2-3** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix2-4** — ronde 2 — GOEDGEKEURD (groepjes in rijen, het hele scherm gebruikt)
- **squla-rekenmix-mix3-1** — ronde 2 — AFGEKEURD: 14.23, bij "laag, lager, laagst" staan de blokken van de torens met een kier boven elkaar: ze zweven (schermfoto 018). Voorstel: in `maatKaart` (woord "laag") de stap zo kiezen dat de blokjes op het echte plaatje elkaar raken, en de blokken groter. Tip: in de uitleg na Nee blijven de ballen onder de plekjes liggen terwijl Bliepo zegt "De kleinste staat achteraan"; mooier is ze op hun plek te zetten.
- **squla-rekenmix-mix3-2** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix3-3** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix3-4** — ronde 2 — GOEDGEKEURD
- **squla-rekenmix-mix4-1** — ronde 2 — GOEDGEKEURD (appels: nog om te zetten, zie boven)
- **squla-rekenmix-mix4-2** — ronde 2 — AFGEKEURD: R5 (potloden, knikkers en sterren bij "van minder naar meer").
- **squla-rekenmix-mix4-3** — ronde 2 — AFGEKEURD: R5 (bomen, en de groepjes in rijen).
- **squla-rekenmix-mix4-4** — ronde 2 — AFGEKEURD: R5 (raketjes, sterren, knikkers, ballen bij meer dan / minder dan).

---

## Tijd — ronde 2 — 2026-11-01 (controleur Opus)

Zo gekeurd: elk punt uit ronde 1 in de code en op schermfoto's; speeltest `GOED=1`, **alle 7 lessen tot het eind**; ook op 14.22, 14.23.

Opgelost uit ronde 1:
- **T1:** geen rode rand meer bij een fout. Een fout kaartje wordt dof en schudt (trein en plaatjes), een fout gelegd kaartje wordt dof.
- kalender-1: "Zoek de dagen met de hoepel." en de tip met de hoepel. De zin met "koorts" wordt niet meer gezegd; de keuzes ziek/feest/tandarts staan als plaatjes met een woord.
- kalender-2: de uitleg begint met het rode vak ("Daar staat een getal: 5. Dat is 5 juni."); "…tot het feest?"; "Stel je voor: het rode vak is 12 juni."; de pijl loopt links langs de kolom en niet meer over de 2 (schermfoto 010).
- tijden-1: de uitleg begint met "Stel, gisteren was het woensdag. Na woensdag komt donderdag."; "Het groene boek kwam pas later."; de dagdelen staan los, zonder kader (schermfoto 015).
- Bliepo leest de woordkeuzes niet meer vooraf voor.

### Uitslag per les
- **squla-tijd-dagen-1, dagen-2, dagen-3** — ronde 2 — GOEDGEKEURD
- **squla-tijd-kalender-1** — ronde 2 — GOEDGEKEURD
- **squla-tijd-kalender-2** — ronde 2 — GOEDGEKEURD
- **squla-tijd-tijden-1** — ronde 2 — AFGEKEURD (14.23/7.7, twijfel = afkeuren): de dagdelen (zon laag achter een heuvel, zon, zon met roze strepen, maan met sterren) zijn platte tekeningen zonder glans, verloop of schaduw, terwijl alle andere plaatjes in de les glansstijl B hebben (kampvuur, boeken). Voorstel: zon en maan in glansstijl B (verloop, lichtvlekje, dunne rand, zachte gloed), zoals de vormen.
- **squla-tijd-tijden-2** — ronde 2 — GOEDGEKEURD

---

## Tellen — ronde 2 (de 9 afgekeurde lessen) — 2026-11-01

Speeltest met GOED=1, één les tegelijk: alle 9 lessen tot het eind. Gekeurd op alle regels t/m 14.23 ("kijk als een kind"), op de schermfoto's.

### squla-tellen-fruit-2 — ronde 2 — GOEDGEKEURD
- Opgelost: "rijen van {5:geel}".

### squla-tellen-resultatief1-2 — ronde 2 — GOEDGEKEURD
- Opgelost: de uitleg na Nee gaat over ballen en blokken, net als het voorbeeld.
- Tip (14.20): "We tellen verder, tot {20}." heeft geen kleur. Het wordt wit getoond en dat klopt, maar schrijf het bewust als `{20:wit}`.

### squla-tellen-resultatief1-3 — ronde 2 — AFGEKEURD
- Opgelost: het huis is nu `blauw` (het plaatje is turquoise). In orde.
- **FOUT (14.23, groot genoeg):** bij "Hoeveel bussen zie je?" (schermfoto 030) zijn de 18 bussen maar ±80 × 30 px.
  - Oorzaak: brede plaatjes worden in een vierkant vak van 96 geperst (`teken` in `squla-tellen-tekenen.ts`). Ze staan los, maar ze zijn smalle streepjes in een groot leeg vlak. Op een telefoon worden ze ±30 × 11 px.
  - Hetzelfde geldt voor de satellieten (schermfoto 014 in ronde 1).
  - Voorstel: brede dingen (bus, satelliet, auto) bij `verspreid` groter tekenen, zodat ze op de breedte de ruimte krijgen, of minder gestapeld en groter verspreiden.
- De huizen (schermfoto 008) zijn groot genoeg en goed te tellen.

### squla-tellen-resultatief3-1 — ronde 2 — GOEDGEKEURD
- Opgelost: als memory het laatste onderdeel is, zegt Bliepo "Nog een spelletje!" en niet meer "We gaan weer tellen."

### squla-tellen-resultatief3-2 — ronde 2 — GOEDGEKEURD
- Opgelost: het welkom is "Weer planeten en ufo's, door elkaar." en de uitleg gaat over planeten.

### squla-tellen-resultatief3-3 — ronde 2 — GOEDGEKEURD
- Niet aangepast, maar nu wel goed in beeld: r. 738 `"…in rijen van {10}."`. Getallen zonder eigen kleur worden sinds de kleuraanpassing wit getoond, en dat werd in ronde 1 gevraagd. Tip: schrijf het bewust als `{10:wit}` (14.20).

### squla-tellen-resultatief3-4 — ronde 2 — AFGEKEURD
- Opgelost:
  - het welkom zegt `{40:blauw}`;
  - de tip is nu "Begin bij 41. Tel de andere losse knikkers erbij.", of bij één knikker "Tel de losse knikker erbij".
- **FOUT (14.23, er ligt iets op de rand / kan meegeteld worden):** bovenop de dichte zak ligt een knikker op het touwtje (schermfoto 005, `squla-tellen-holo.tsx` r. 319, "een voorbeeldje"). Een kind ziet een losse knikker op de zak en telt hem mee (48 in plaats van 47). Hij ligt er ook vreemd, als een balletje op de knoop.
  - Voorstel: het voorbeeldje weghalen, of het als plaatje op het bordje van de zak zetten (naast de 40).
  - Let op regel 3: het voorbeeldje weghalen is een keuze voor Sara of main, niet voor de bouwer alleen.

### squla-tellen-telrij-1 — ronde 2 — GOEDGEKEURD
- Opgelost: alle afleiders liggen nu binnen 18–50 (bijvoorbeeld 43, 47, 34, 36).

### squla-tellen-telrij-2 — ronde 2 — GOEDGEKEURD
- Opgelost: `[99, 90, 100]`.

---

## Getallenlijn — ronde 2 (de 4 afgekeurde lessen) — 2026-11-01

Speeltest met GOED=1, één les tegelijk: alle 4 tot het eind. Gekeurd t/m 14.23.

### squla-getallenlijn-rangschikken-1 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - "Welk getal hoort op de puntjes?" (welkom en vragen);
  - bij rijen die per 2 springen is de tip "Welk getal is 2 meer dan …?";
  - de vlaggetjesvraag is overal "Bij welk getal staat het vlaggetje?".
- Het beginscherm toont nu de lichtslinger met 3, 4, 5, …, 7 (schermfoto 002). In ronde 1 van deze controleur was het beginscherm leeg.
- Tip (14.23, blijft): de lampjes lijken op kerstballen.

### squla-getallenlijn-rangschikken-2 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - "diamanten" in plaats van "kristallen";
  - na Nee een uitleg met dezelfde diamantenrij (7 … 11, op de puntjes 9). Dat getal komt in geen enkele vraag voor, dus er wordt niets verklapt.

### squla-getallenlijn-rangschikken-3 — ronde 2 — GOEDGEKEURD
- Opgelost: na Nee eerst dezelfde soort lijn als het voorbeeld (0–20 met 10–14, vlaggetje bij 18), daarna de lijn per 2 (vlaggetje bij 16). Geen latere vraag gebruikt 18 of 16 op zo'n lijn.

### squla-getallenlijn-kat-2 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - na Nee de planeet met 8: "Welk getal komt ervoor? … Dat is 7." (`uitlegVoor`). De vragen gebruiken 15, 19 en 11, dus er wordt niets verklapt;
  - overal "de pijl".

---

## Meer, minder, evenveel — ronde 2 (de 4 afgekeurde lessen) — 2026-11-01

Speeltest met GOED=1, één les tegelijk: **alle 4 tot het eind, ook 3-1** (32 stappen, de sleepvragen met de potjes lukken nu). Gekeurd t/m 14.23.

### squla-meer-minder-evenveel1-1 — ronde 2 — GOEDGEKEURD
- Opgelost: "rijtjes van {5:rood}".

### squla-meer-minder-evenveel2-1 — ronde 2 — GOEDGEKEURD
- Opgelost: de uitleg na Nee gebruikt de koekjes `[9, 11, 10]` ("11 is de meeste"). Die rij komt in geen vraag voor.
- De kaarten hebben geen rand meer. De drie groepjes koekjes staan met duidelijke ruimte ertussen (schermfoto 021), dus je ziet goed welke groep bij elkaar hoort.
- Tip (14.23): de koekjes zijn ±40 px en staan alleen in het midden van het scherm. Boven en onder is veel ruimte. Groter is vrolijker en beter te tellen op een telefoon.

### squla-meer-minder-evenveel3-1 — ronde 2 — GOEDGEKEURD
- Opgelost: na `squlaBegin` staat `st.huidig = ""`. De eerste sleepvraag krijgt zijn testvolgorde, en de speelcontrole speelt de hele les.

### squla-meer-minder-evenveel3-2 — ronde 2 — GOEDGEKEURD
- Opgelost:
  - `start` en de uitleg na Nee gaan over eierdoosjes (`uitlegDozen`: 3 doosjes, "In elk doosje zitten er 6", 6, 12, 18);
  - "doosjes van {6:wit}".
- Beeld: 27 koekjes in rijen van 10 zijn los en goed te tellen (schermfoto 010).

---

## Plussommen en Minsommen — ronde 3 — 2026-11-01 (controleur Opus)

Zo gekeurd:
- De punten uit ronde 2 nagekeken in de code (`git diff` sinds de keuring van ronde 2) en op schermfoto's.
- Speeltest `GOED=1`, één les tegelijk: de 9 afgekeurde lessen en als steekproef min-ruimte-2, min-bus1-1 en plus-bus1-1, **alle 12 tot het eind**. Schermfoto's in `scratchpad/controle/opus-r3pm/`.
- Ook gekeurd op 14.22 (kleur verklapt niets), de nieuwe uitwerking van 2.1 en 14.23 (kijk als een kind; bij twijfel afkeuren).

Opgelost uit ronde 2:
- bakkerij-1/2/3: de uitleg na Nee gaat over hetzelfde ding als het voorbeeld (taartjes, stokbroden, koekjes).
- dansen-1/4: de getallen op de kaartjes (zwart op wit) zijn in de zin wit. dansen-2/3: elke plaat heeft de kleur van zijn getal, dezelfde als in de zin (schermfoto dansen-2/003: gele 3, blauwe 7). In `dansUitleg` is de 7 overal oranje en de 3 blauw.
- min-ruimte-1: de uitleg gaat over ballonnen. min-machine-4: de uitleg gaat over het ijsje.
- 14.22 werkt: bij min-ruimte-1 staan eerst alle 7 ballonnen in de kleur van de 7 (schermfoto 003); pas bij "weg" krijgen de 4 de kleur van de 4 en worden ze dof. Bij de bus liggen de overgebleven pakjes in de kleur van het eerste getal.
- 2.1: ballonnen, raketjes en pakjes zijn helemaal in de kleur van hun getal; eten (taartjes, koekjes) houdt de echte kleur met een randje.

### Nieuwe of overgebleven fouten

- **squla-plus-bakkerij-1** — ronde 3 — AFGEKEURD
  - 14.23: de taartjes zweven los in de lucht, zonder toonbank, plank of schaal (schermfoto 004). Voorstel: de bakkerijdingen op een toonbank of bakplaat zetten.
  - Nog om te zetten (2.1): de getalkleuren (1 rood, 4 groen) passen niet bij roze taartjes.
- **squla-plus-bakkerij-2** — ronde 3 — AFGEKEURD
  - 14.21: de uitleg na Nee is 12 + 3 stokbroden (r. 890). Vraag `somBijPlaatje` met 12 + 3 cupcakes komt later in de les, dus het antwoord 15 wordt verklapt. Voorstel: 11 + 5 stokbroden (komt in de les niet voor).
  - 14.23: zelfde als bakkerij-1 (zwevende stokbroden).
- **squla-plus-bakkerij-3** — ronde 3 — AFGEKEURD
  - 14.21: de uitleg is 8 + 5 koekjes (r. 922). `discoSom(8, 5)` komt later in de les. Voorstel: 9 + 3 koekjes (komt niet voor).
  - 14.23: de koekjes zweven in twee rijen in de lucht (schermfoto 004).
  - Nog om te zetten (2.1): bruine koekjes met een blauw randje en blauwe getallen.
- **squla-plus-dansen-1, 2, 3, 4** — ronde 3 — AFGEKEURD
  - Kleuren: in orde.
  - 14.23/1.15: de kaartjes (dansen-1/003) en de platen (dansen-2/003) staan half over de paarse tafel en de draaitafel heen. De platen 8 en 7 liggen voor de draaitafel en het oranje kaartje bedekt de tafel. Het ziet eruit alsof ze voor de tafel zweven. Voorstel: de tafel met draaitafel kleiner of lager zetten, of de kaartjes/platen in een rij erboven of ernaast, zonder dat ze elkaar raken.
- **squla-min-ruimte-1** — ronde 3 — GOEDGEKEURD (ballonnen zweven hoort erbij; groot genoeg, glans zichtbaar).
- **squla-min-machine-4** — ronde 3 — AFGEKEURD (14.23, twijfel)
  - Welkom: "Er zit geld in je portemonnee". In beeld zweven de munten boven een dichte portemonnee (schermfoto 003).
  - Voorstel: de munten op of half in een open portemonnee leggen, of de zin "Je haalt het geld uit je portemonnee."
- **Steekproef al goedgekeurde lessen:**
  - **squla-min-ruimte-2** — AFGEKEURD (14.22/14.23): bij 14 − 3 zijn alle 14 raketjes grijs-wit (14 is "wit", want boven 10 is er geen tegelkleur), schermfoto 003. Grijs en dof is juist de kleur van "weg". Zo lijken alle raketjes al weg, en ze zien er niet vrolijk uit. Voorstel: bij getallen boven 10 een echte kleur kiezen (bijv. de kleur van het voorwerp, of een vaste kleur voor het eerste getal), en alleen wat weggaat grijs maken. Dit geldt waarschijnlijk ook voor ruimte-3 en de andere sommen boven 10.
  - **squla-min-bus1-1 en squla-plus-bus1-1** — AFGEKEURD (14.23, groot genoeg)
    - De pakjes in de bus zijn ±28–30 px. Ze staan in één dunne rij onderin het raam van een heel grote bus (min-bus1-1/003, plus-bus1-1/003).
    - Je kunt ze wel tellen, maar ze zijn klein en de glans is niet te zien.
    - Voorstel: grotere pakjes in het raam (bijv. 2 rijen van ±50 px), of de bus kleiner en de pakjes groter.
    - Dit geldt voor alle 12 buslessen (plus en min). Die heb ik verder niet opnieuw gespeeld.

**Uitslag ronde 3:**
- GOEDGEKEURD: min-ruimte-1.
- AFGEKEURD: plus-bakkerij-1/2/3, plus-dansen-1/2/3/4, min-machine-4; uit de steekproef ook min-ruimte-2 (grijze raketjes boven 10) en min-bus1-1/plus-bus1-1 (pakjes te klein, alle buslessen).

---

## Laatste nakijkronde — 2026-11-01

Speeltest met GOED=1, één les tegelijk: alle 5 lessen tot het eind. res3-4 faalde de eerste keer ("5 seconden niets te tikken", de laptop was druk) en liep de tweede keer goed tot het eind. Gekeurd t/m 14.23, vooral op het beeld.

### squla-piraat-3 — ronde 4 — GOEDGEKEURD
- In de uitleg na Nee staat 8 + 5 overal in dezelfde kleuren: in de som bovenaan, in `plusUitleg` en in de slotzin 8 paars, 5 oranje, 13 wit.
- De 4 sterren blijven eerst geel en worden pas bij "Er gaan er 4 weg" grijs (14.22).

### squla-splits-delen-1 — ronde 4 — GOEDGEKEURD
- Beeld (schermfoto 028): de potloden zijn rood, geel, blauw, groen, paars en roze. Ze staan uitgewaaierd ín een turquoise beker en steken er half bovenuit.
- Bij 4, 5 en 6 per beker is elk potlood apart te zien en te tellen. Niets steekt opzij uit en niets zweeft. Het is vrolijk en duidelijk, met glans op de beker. "In elke beker staan 3 potloden" klopt nu met het beeld.

### squla-vormen-patronen-2 — ronde 3 — GOEDGEKEURD
- Het welkom zegt nu "Nu staan de blokjes in rijen onder elkaar." Dat klopt met het rooster van blokjes.

### squla-tellen-resultatief1-3 — ronde 3 — GOEDGEKEURD
- De bussen zijn nu ±105 × 40 px (eerst 80 × 30) en de satellieten ±108 × 60. Ze staan los over het hele vlak verdeeld en zijn apart te tellen (schermfoto's 032 en 013).
- Tip: op een telefoon blijven de bussen smal. Nog iets groter mag.

### squla-tellen-resultatief3-4 — ronde 3 — GOEDGEKEURD
- Het voorbeeldje staat nu als klein plaatje op het bordje, naast het getal ("70 🍎", schermfoto 015). Er ligt niets meer op het touwtje van de zak dat meegeteld kan worden.
- 70 + 5 losse appels = 75: klopt.

---

## Visuele ronde 14.23 — 2026-11-01

Alleen gekeurd op het beeld: 14.23 "kijk als een kind" en 14.24. Per les gespeeld met GOED=1, één les tegelijk, en de schermfoto's bekeken (vellen per les, twijfelgevallen groot). Alle 19 lessen hieronder liepen tot het eind.

### Meten

#### squla-meten-pizza-1 — AFGEKEURD
- **Pizza in de doos (schermfoto 007, "Deze pizza vult bijna de hele doos."):**
  - De grote pizza ligt niet ín de doos. Hij staat rechtop vóór de doos en steekt over de voorrand naar buiten.
  - De kleine pizza staat als een rondje op de bodem.
  - Voorstel: de pizza als platte ovaal (van schuin boven) in de bak van de doos tekenen, binnen de randen. Of de doos van bovenaf tekenen, met de pizza erin.
- Verder in orde: de pizza's naast elkaar en de ijsjes van klein naar groot zijn groot genoeg.

#### squla-meten-pizza-2 — GOED
- De pizzapunten zijn groot en los te tellen. De ijsjes met bolletjes staan goed op elkaar.

#### squla-meten-pizza-3 — GOED
- Deeg, kaas, tomaten, zak meel en dozen liggen óp de schalen van de weegschaal. De olijven liggen in de schaal.

#### squla-meten-hoeveelheden-1 — AFGEKEURD
- **"vol, voller, volst" (schermfoto 015):**
  - In de drie schalen zie je bijna niets. De tomaten zitten achter de rand.
  - De middelste schaal lijkt leeg, en in de rechter zie je alleen een paar topjes.
  - Een kind kan zo niet zien welke schaal het volst is (half verstopt).
  - Voorstel: de inhoud bóven de rand laten uitkomen, als een berg die steeds hoger wordt. Of de schaal doorzichtig, zodat je de inhoud ziet.
- In orde: de manden, de fruitstokjes, de potjes jam en de flesjes.

#### squla-meten-hoeveelheden-2 — GOED
- De wip met bal en blok (±60 px) is duidelijk. De tas, de voetbal, de veer en de steen zijn groot en vrolijk.
- Tip: het springtouw, de vlieger en de voetbal zweven naast de tas.

#### squla-meten-oppervlakte-1, oppervlakte-2 — GOED
- De schilderijen hangen aan de muur. De blaadjes en tegels liggen netjes op de tafel. Alles is groot genoeg.

### Geld

#### squla-geld-geldmachine-1 — AFGEKEURD
- **Overlap (schermfoto 013, en ook 020):** bij "Is het een briefje van 100 euro, een munt van 1 euro, of een briefje van 10 euro?" staan drie brede woordknoppen.
  - Daardoor zakt de herhaal-knop (rond pijltje) óp het hoofd van Bliepo.
  - De bovenste regel van de vraag raakt de balk met Pauze/Testkind.
  - Voorstel: een kortere vraag ("Wat valt er uit de spaarpot?") en kortere knoppen ("100 euro", "1 euro", "10 euro"), of de knoppen op één rij.

#### squla-geld-geldmachine-2, zakgeld-1, zakgeld-2, geld-1, geld-2 — GOED
- Het geld is klein, maar dat moet volgens de regel (niet vergroten, 72 dpi). Munten en briefjes liggen los en zijn te tellen.
- De spaarpot heeft munten erin. Het bordje bij "de afwas" is logisch.

### Splitsen

#### squla-splits-splitsen1-1 — AFGEKEURD
- **Te klein (schermfoto 002):**
  - De pionnen zijn ±25 × 40 px in een huisje van ±600 px breed. Het huisje is bijna leeg.
  - De voetballen in het zak-huisje zijn ±20 px.
  - Op een telefoon worden ze heel klein.
  - Voorstel: pionnen en ballen in het huisje en eronder ±2× zo groot. Er is ruimte genoeg.
- In orde: het tienvak met de doek over de ballen.

#### squla-splits-splitsen1-2 — AFGEKEURD
- **Te klein:**
  - de ballen in de bakjes van de machine zijn ±12 px;
  - de shirts en ballen onder de splitspaal zijn ±20 px (vellen 002–010).
  - Voorstel: ±2× zo groot.

#### squla-splits-splitsen2-1, splitsen2-2 — GOED
- Huisjes, getallen en sommen zijn groot en duidelijk. Er is niets geteld in kleine plaatjes.

### Piratenschat

#### squla-piraat-1 — AFGEKEURD
- **Goudstukken (schermfoto 002):** de 12, 14 en 15 goudstukken zijn platte gele rondjes zonder glans en zonder randje. Het lijken stippen, geen munten. Hetzelfde geldt voor de kopermunten (12 paars, 6 oranje, schermfoto in vel). Voorstel: het plaatje `goudstuk` of `kopermunt` gebruiken, met glans B.

#### squla-piraat-2 — AFGEKEURD
- **14.24, grijs dat geen "weg" betekent (schermfoto 016):**
  - De maanstenen zijn van zichzelf grijs.
  - De maanstenen die weggaan zijn ook grijs, alleen iets donkerder.
  - Een kind ziet het verschil tussen "een grijze steen" en "weg" bijna niet.
  - Voorstel: de maanstenen in een echte kleur (bijvoorbeeld een lichtgevende blauwe of paarse maansteen), of wat weggaat doorstrepen of laten vervagen tot bijna niets.
- In orde: sterren, diamanten, goudstukken en kopermunten, met weg = dof.

#### squla-piraat-3 — al gekeurd in de laatste ronde (GOED).

### Klokkijken (18 lessen) — visuele ronde — GOED
- Alle 18 lessen liepen tot het eind (GOED=1, één tegelijk).
- De wijzerklokken zijn groot en duidelijk: de kleine wijzer oranje, de grote paars.
- De bezorgbus, bakkerij, oven, zon, maan, taart, kampvuur, treintje, schoolbord en het deegkommetje staan los naast de klok en zijn groot en vrolijk, met glans.
- De klokjes op de telefoon en laptop passen in het scherm. Niets overlapt.
- Tip: op één schermfoto van klokkijken3-4 staat de volgende zin ("De bus staat bij de halte.") al gedimd klaar terwijl de oven nog in beeld is. Dat is een overgang van een fractie van een seconde, geen fout in de les.

---

## Rekenmix ronde 3, Tijd ronde 3, Plus/Min ronde 4 — 2026-11-01 (controleur Opus)

Zo gekeurd:
- Speeltest `GOED=1`, één les tegelijk, laptop (1440 × 900): Rekenmix mix1-4, 3-1, 4-1, 4-2, 4-3, 4-4, Tijd tijden-1 en **alle 32 Plus/Min-lessen**, allemaal **tot het eind**.
- Tablet (820 × 1180), steekproef van elk soort beeld: mix4-3, tijden-1, plus-bakkerij-3, plus-dansen-2, plus-bus2-2, min-ruimte-2, min-bus1-1, min-machine-4, min-kaal-1, ook allemaal tot het eind.
- Schermfoto's in `scratchpad/controle/opus-r4b/` (en `opus-r4/` voor mix4-3 tablet).
- Gekeurd op 14.21–14.24 (kijk als een kind, geen grijs/wit als getalkleur), en op 2.1: de twee getallen van een som hebben altijd verschillende kleuren.
- Alle sommen in `squla-plussommen.tsx` en `squla-minsommen.tsx` zijn met een script nagelopen op hun kleur (tegelkleur 1–10, `getalNaam` voor 11–20, `etenKleuren` in de bakkerij).

### Rekenmix ronde 3
- **mix1-4** — GOEDGEKEURD: de koekjes zijn groot (±70 px) en apart telbaar (002).
- **mix3-1** — GOEDGEKEURD: de blokken van de torens sluiten op elkaar aan (015).
- **mix4-1** — GOEDGEKEURD: de appels houden hun echte kleur, met een rood en een groen randje (fruitkleuren, 2.1).
- **mix4-2** — GOEDGEKEURD: de potloden zijn groot en apart te tellen (007).
- **mix4-3** — AFGEKEURD (14.23):
  - De raketjes zijn een smal plaatje. Met `kr` (cel 57) zijn ze op de laptop maar ±25 × 50 px (schermfoto 012).
  - Op de tablet staat alles in het bovenste derde deel, met nog kleinere raketjes en een lege onderkant (`opus-r4`, tablet 015).
  - De bomen zijn nu wel goed (3 + 2, ±50 px).
  - Voorstel: raketjes groter tekenen dan ronde dingen (bijv. m × 1,5), of in groepjes van 2 rijen met meer ruimte.
- **mix4-4** — AFGEKEURD (14.23): bij "meer dan / minder dan" staan de raketjes nog ±40 px klein en onderaan geperst, het zesde raketje op het plekje (schermfoto 002). Dit is niet veranderd. Voorstel: zie mix4-3, en de groepjes hoger in beeld.

### Tijd ronde 3
- **tijden-1** — GOEDGEKEURD: zon, zon en maan met sterren hebben nu glans, zachte gloed en een dunne rand (011). Tip: de heuvel bij "ochtend" is nog plat groen.

### Plus/Min ronde 4

Opgelost:
- **Bus:** de pakjes zijn groot (±55 px) en liggen in rijen van 5, met het restje erbovenop, in het raam (plus-bus1-2/002, min-bus1-3/003). De pakjes die instappen of bezorgd worden, staan in hun eigen kleur ernaast.
- **Getallen boven 10** hebben echte kleuren, geen grijs meer: min-ruimte-2 heeft 14 blauwe raketjes (004), 14.24 in orde.
- **Bakkerij:** taartjes, cupcakes en koekjes liggen op een houten toonbank (bakkerij-1/005, bakkerij-3/004). De uitleg na Nee verklapt niets meer (11 + 5 stokbroden, 9 + 3 koekjes).
- **Disco:** de kaartjes en platen staan los in een rij, de tafel met draaitafel staat eronder en wordt niet bedekt (dansen-1/003, dansen-2/001).
- **min-machine-4:** "Je haalt geld uit je portemonnee en koopt een ijsje." De munten liggen naast de portemonnee (004).

#### FOUT 1 (2.1): twee getallen van een som in dezelfde kleur
Kleuren komen nu alleen uit het getal zelf (`ringKleur`, `getalNaam`, `etenKleuren`). Daardoor krijgen twee getallen soms dezelfde kleur. Op schermfoto plus-bus1-3/006 zijn bij 7 + 7 = 14 alle drie de getallen en alle 14 pakjes blauw. Per les, de sommen met **dezelfde kleur**:
- plus-bakkerij-1: 4 + 4, 5 + 5 (`etenKleuren` geeft bij gelijke aantallen bewust dezelfde kleur, r. 140 in `squla-getalring.ts`).
- plus-bakkerij-3: 6 + 6 (schermfoto 004: twee keer dezelfde kleur), 7 + 7, 8 + 8, 9 + 9.
- plus-dansen-2/3: twee platen met 5 (5 + 5, allebei groen; dansen-2 schermlijst 008).
- plus-bus1-1: 2 + 2.
- plus-bus1-2: 11 + 2 en 17 + 2 (allebei oranje).
- plus-bus1-3: 7 + 7, 8 + 8, 6 + 6.
- plus-bus2-1: 3 + 3, 2 + 2.
- plus-bus2-2: 17 + 2 (oranje), 15 + 5 (groen).
- plus-bus2-3: 8 + 8, 7 + 7, 9 + 9.
- plus-kaal-1: 3 + 3, 4 + 4, 5 + 5.
- plus-kaal-2: 15 + 5 (groen).
- plus-kaal-3: 7 + 7, 6 + 6, 8 + 8.
- min-ruimte-3: 16 − 16 (keuze bij "welke som", r. 854).
- min-bus1-3: 14 − 7 (blauw).
- min-machine-2: 10 − 10.
- min-kaal-2: 14 − 7 (blauw), 18 − 8 (paars).
- min-kaal-3: 13 − 8 (paars).

Sommen waar de kleuren **erg op elkaar lijken** (zelfde kleurfamilie; ter beoordeling):
- 15 + 4 / 15 − 4 (groen/lichtgroen), 14 − 6 en 20 − 6 (blauw/lichtblauw), 13 − 9 en 12 − 9 (paars of roze/magenta).
- 4 + 5, 5 − 4 (lichtgroen/groen), 7 + 6, 7 − 6 (blauw/lichtblauw), 8 + 9, 9 − 8 (paars/magenta).
- Ze staan in plus-bakkerij-1/3, bus1-2/1-3, bus2-1/2-3, kaal-1/3, min-bus1-1/1-2/1-3/2-1/2-3, min-kaal-1/2/3, min-machine-2/3 en min-ruimte-3.

Voorstel: één functie die bij een som de kleur van het tweede getal kiest als die gelijk is aan (of lijkt op) die van het eerste. Bijvoorbeeld een vaste reservekleur die niet in de som voorkomt. Die functie overal gebruiken: in de som, in de zin en op de voorwerpen. Ook `etenKleuren` bij gelijke aantallen.

#### FOUT 2 (14.4/14.23): bus 1, de nieuwe pakjes blijven buiten de bus
Bij plus-bus1-1/1-2/1-3 zegt Bliepo na het goede antwoord "Er liggen nu 12 pakjes in de bus.", maar de 7 nieuwe pakjes staan nog naast de bus en er liggen er 5 in (bus1-3/008, ook 006). Zin en beeld kloppen niet. Voorstel: bij goed de instappers de bus in laten gaan (of de zin pas zeggen als ze erin liggen). Bij bus 2 (rondje met een getal) is dit geen probleem.

#### FOUT 3 (14.23): bekers zweven
min-machine-2, "Welke som hoort bij het plaatje?": de vijf bekers (3 vol, 2 leeg) zweven midden in de lucht, zonder tafel of plank (002). Voorstel: de bekers op een tafel of plank zetten, zoals de toonbank in de bakkerij.

#### FOUT 4 (14.23): tablet
Op de tablet (820 × 1180) staat het Phaser-beeld in het bovenste ±40 % en is de onderste helft leeg.
- plus-bakkerij-3: de croissants zijn klein (±60 px) en liggen tegen elkaar aan (004).
- min-bus1-1: de 5 pakjes in de bus liggen tegen elkaar, en de 3 bezorgde pakjes zweven in de lucht naast de bus (002).
- mix4-3: zie boven.
- Disco, ruimte, machine-4 en kaal zien er op de tablet wel goed uit.
- Voorstel: op een staand scherm het vlak groter maken of naar beneden laten doorlopen, en de dingen groter, met ruimte ertussen.

### Uitslag per les (Plus/Min ronde 4)
Eindoordeel = laptop én tablet.
- **GOEDGEKEURD (8):** min-ruimte-1, min-ruimte-2, min-machine-1, min-machine-3, min-machine-4, min-kaal-1, plus-dansen-1, plus-dansen-4. (Disco, ruimte, machine en kaal zijn op de tablet in orde.)
- **AFGEKEURD alleen op fout 4 (tablet; op de laptop in orde):** plus-bakkerij-2, min-bus1-1, min-bus1-2, min-bus2-1, min-bus2-2, min-bus2-3.
- **AFGEKEURD op fout 1 (2.1, zelfde kleur):** plus-dansen-2, plus-dansen-3, plus-bus2-1, plus-bus2-2, plus-bus2-3, plus-kaal-1, plus-kaal-2, plus-kaal-3, min-ruimte-3, min-kaal-2, min-kaal-3.
- **AFGEKEURD op fout 1 en fout 4:** plus-bakkerij-1, plus-bakkerij-3, min-bus1-3.
- **AFGEKEURD op fout 1 en fout 2:** plus-bus1-1, plus-bus1-2, plus-bus1-3.
- **AFGEKEURD op fout 1 en fout 3:** min-machine-2.
(De "lijkt"-paren uit fout 1 staan erbij ter beoordeling; daarop is niets afgekeurd.)

---

## Plus/Min ronde 5, Rekenmix mix4-3/4-4, nakeuring visuele ronde, Klokkijken (14.25), kalender-1, staand scherm — 2026-11-02 (controleur Opus)

Zo gekeurd:
- Speeltest `GOED=1`, `ALLES=1`, laptop (1440 × 900): alle 32 Plus/Min-lessen, mix4-3, mix4-4, kalender-1, alle 18 kloklessen en de 7 afgekeurde lessen uit de visuele ronde. Alle 60 **tot het eind**, 0 fouten.
- Tablet (820 × 1180): plus-bakkerij-2/3, plus-bus1-1, min-bus1-1/1-3/2-2, min-machine-2, mix4-3, mix4-4, klok-hoelaat-1, kalender-1, plus-dansen-2, meten-pizza-1, piraat-2. Alle 14 tot het eind.
- Telefoon (390 × 844), alleen voor het staande scherm: plus-bakkerij-3, min-bus1-3, klok-hoelaat-1, mix4-4. Alle 4 tot het eind.
- Schermfoto's in `scratchpad/controle/r5-laptop/`, `r5-tablet/`, `r5-tel/`.

### Wat is opgelost
- **Fout 1 (2.1, zelfde kleur):** opgelost met `somKleuren`. 7 + 7 is blauw/oranje met 7 blauwe en 7 oranje pakjes in de bus (plus-bus1-3/006). 4 + 4 donuts roze/geel (bakkerij-1/026), 5 + 5 krentenbollen bruin/paars (041), twee platen met 5 groen/blauw (dansen-2/009), 8 + 8 paars/blauw, 12 + 8 roze/blauw, 14 − 7 blauw/oranje.
- **Fout 2 (bus 1):** de nieuwe pakjes liggen in de bus als Bliepo "Er liggen nu 14 pakjes in de bus." zegt (plus-bus1-3/006).
- **Fout 3 (bekers):** de bekers en bordjes staan op een houten plank (min-machine-2).
- **Fout 4 (tablet):** het speelvlak staat nu in het midden, niet meer tegen de bovenkant. Bus, disco, machine, bord en Rekenmix zien er op de tablet goed uit.
- **mix4-3:** de raketjes zijn ±45 × 75 px (laptop) en ±35 × 60 px (tablet), los en telbaar (037).
- **mix4-4:** de raketjes bij "meer dan / minder dan" zijn groot en staan midden in beeld (004).
- **pizza-1:** de pizza ligt plat ín de open doos (tablet 009).
- **hoeveelheden-1:** de tomaten liggen als een bergje bovenop de schaal; vol, voller, volst is goed te zien (017).
- **geldmachine-1:** korte knoppen ("100 euro", "1 euro", "10 euro"); niets overlapt meer (013).
- **splitsen1-1:** pionnen ±40 px, voetballen ±35 px. **splitsen1-2:** ballen in de bakjes ±45 px, shirts en ballen ±55 px.
- **piraat-1:** de goudstukken zijn echte munten met een ster en glans (004).
- **piraat-2:** de maanstenen zijn paars; wat weggaat is dof (tablet 041).
- **14.25 bij de klok:** in `kiesKlok` en `leesKlok` staan verhaal en vraag samen in beeld ("De bezorgbus vertrekt. Hoe laat is het?"). In hoelaat-1/2/3 en digitaal-1 snap je elk ding uit de zin.
- **kalender-1:** de klok is de Synthesis-wijzerklok (014).

### Nieuwe of overgebleven fouten

#### FOUT A (2.1/2.2): getal in de zin heeft een andere kleur dan in de som
- **min-machine-2**, "Welke som hoort bij het plaatje?", bij goed: in de som is de 8 van 10 − 2 = 8 roze, in de zin "Ja! 10 − 2 = 8." is de 8 paars (tablet 011). Oorzaak: `squla-minsommen.tsx` r. 556 gebruikt `g(v.vol)` in plaats van `gu(...)`, zoals de andere goedzinnen.
- **min-bus1-1 en min-bus2-1**, bij uitkomst 1 (3 − 2, 9 − 8, 5 − 4, 7 − 6): in de som en op het pakje is de 1 geel/de kleur van het eerste getal, in de zin "Er ligt nog 1 pakje in de bus." rood (tablet min-bus1-1/012). Oorzaak: r. 487 `g(1, "bruin")`; de tweede waarde doet in deze `g` niets, dus wordt het de tegelkleur. Voorstel: `gu(1)`.

#### FOUT B (14.23): croissants op tablet en telefoon
plus-bakkerij-3: de croissants zijn op de tablet ±55 px en raken elkaar (tablet 007), op de telefoon ±27 px. Daarbij lijken oranje (7) en geel (6) op oranje croissants erg op elkaar. Op de laptop in orde. Voorstel: croissants iets kleiner tekenen met ruimte ertussen, of in rijen van 4; en voor croissants een tweede kleur die duidelijk anders is dan oranje (bijv. blauw of paars, zoals bij de krentenbollen).

#### FOUT C (staand scherm): het speelvlak springt op en neer
`Lesscherm.tsx`: `vlakBoven` hangt af van de gemeten hoogte van de ballon. Die verandert bij elke zin (knoppen erbij of eraf, één of drie regels). Daardoor springt het hele speelvlak bij elke stap omhoog of omlaag: op de telefoon ±35 px (plus-bakkerij-3 005 → 006; klok-hoelaat-1 001–005), op de tablet ±8 px. Voor een kind lijkt het alsof de tekening steeds verschuift. Voorstel: de grootste ballonhoogte van de les onthouden (alleen groter laten worden), of een vaste ruimte voor ballon + knoppen nemen.

#### FOUT D (14.25): verhaal valt weg buiten `kiesKlok`/`leesKlok`
Het vraagblok laat bij de andere vraagsoorten nog alleen de laatste zin staan.
- **klok-digitaal-2**, deegkom (r. 797–811, `knopVraag`): in beeld staan een deegkom en een klok met alleen "Hoe laat is het?" (009). Waarom de kom er staat, zegt alleen de weggevallen zin "Het deeg voor de broodjes is klaar." Voorstel: dezelfde oplossing als in `kiesKlok` (zinnen samenvoegen), ook in `knopVraag`.
- **kalender-1**, r. 976: in beeld alleen "Welk getal staat in dat vakje?". Met "dat vakje" is het feesthoedje bedoeld, maar die zin is weg. Er staat ook een roze ballon als keuze die nergens wordt uitgelegd (laptop 024).

#### FOUT E (kalender-1): twee verschillende weekkalenders in één les
Bij "Op welke kalender zie je dat?" is de weekkalender een rooster ma–vr met gym (014). Bij "Trek de lijnen" is de weekkalender een kaartje met een grote **23** bovenaan en ma–zo 7–13 eronder (026). Een kind van groep 3 leest "23" als een datum: dat lijkt een dagkalender (scheurkalender). Het rijtje plaatjes heet daar juist "dagkalender". Voorstel: overal hetzelfde rooster als weekkalender gebruiken, of op het kaartje "week 23" zetten.

#### FOUT F (2.1): piraat-2, alle getallen van de minsom in één kleur
11 − 5 = 6: alle drie paars, 6 − 1 = 5: alle drie geel, 7 − 3 = 4: alle drie blauw (tablet 041). Volgens 2.1 heeft elk getal van de som een eigen kleur, met het tweede getal in de kleur van wat weggaat. Dit is niet nieuw (in de visuele ronde is alleen naar 14.23/14.24 gekeken). Vermoedelijk geldt het ook voor piraat-3. Voorstel: `somKleuren` ook in de piratenlessen gebruiken.

#### FOUT G (14.23): piraat-1, kopermunten nog plat
De goudstukken zijn goed. De kopermunten (12 paars, 6 oranje) zijn nog effen schijfjes met alleen een vaag randje, zonder glans (017). Ze lijken op fiches, niet op munten. Voorstel: hetzelfde muntplaatje als het goudstuk, gekleurd, met glans B.

### Tips (geen afkeur)
- Tablet, bussen: de pakjes in de bus zijn ±25 px met maar 2 px ruimte (min-bus2-2/009). Telbaar, maar krap.
- min-kaal-2: groene getallen (15) op het groene schoolbord hebben weinig contrast (013, 018).
- plus-bakkerij-1: bruine krentenbollen met een bruine rand op de houten toonbank vallen weg (041).
- geldmachine-1: de vraag breekt af als "100 euro, 1 / euro of 10 euro?".
- hoeveelheden-1: in beeld staat alleen "vol, voller, volst." (FOUT D, maar de opdracht is wel duidelijk door de lege vakken).
- Rekenmix en ruimte: het grijs worden gaat één voor één (260 ms per ding). Met de versnelde stem in de test was de zin al klaar voor het beeld; met de echte stem loopt het gelijk.

### Uitslag per les
- **Plus — GOEDGEKEURD (15):** bakkerij-1, bakkerij-2, dansen-1, dansen-2, dansen-3, dansen-4, bus1-1, bus1-2, bus1-3, bus2-1, bus2-2, bus2-3, kaal-1, kaal-2, kaal-3.
- **Plus — AFGEKEURD (1):** bakkerij-3 (FOUT B).
- **Min — GOEDGEKEURD (13):** ruimte-1, ruimte-2, ruimte-3, bus1-2, bus1-3, bus2-2, bus2-3, machine-1, machine-3, machine-4, kaal-1, kaal-2, kaal-3.
- **Min — AFGEKEURD (3):** bus1-1, bus2-1, machine-2 (FOUT A).
- **Rekenmix — GOEDGEKEURD:** mix4-3, mix4-4.
- **Visuele ronde — GOEDGEKEURD:** meten-pizza-1, meten-hoeveelheden-1, geld-geldmachine-1, splits-splitsen1-1, splits-splitsen1-2.
- **Visuele ronde — AFGEKEURD:** piraat-1 (FOUT G), piraat-2 (14.24 nu goed; afgekeurd op FOUT F, 2.1).
- **Klokkijken — GOEDGEKEURD (17):** alle kloklessen behalve digitaal-2. **AFGEKEURD (1):** digitaal-2 (FOUT D).
- **kalender-1 — AFGEKEURD** (FOUT D en E). De klok zelf is goed.
- **Staand scherm (Lesscherm) — AFGEKEURD** (FOUT C). Het midden zetten werkt, maar het vlak springt. Dit geldt voor alle Squla-lessen op tablet en telefoon. De lessen hierboven zijn gekeurd met dit springen als losse fout.

## Ronde 6 — 2026-11-02 (controleur Opus)

Zo gekeurd (één speelcontrole tegelijk, schermfoto's in `scratchpad/controle/r6/`):
- Tablet (820 × 1180), afwisselend goed/fout/hulp: min-machine-1 t/m 4, min-bus1-1, min-bus1-2, min-bus2-1, min-bus2-2, plus-bakkerij-3, plus-bus1-3, piraat-1/2/3, min-kaal-2, klok-hoelaat-1. Alle 15 tot het eind (`r6/tablet/`).
- Telefoon (390 × 844): kalender-1, klok-digitaal-2, tijden-2, dagen-3, min-bus1-2, min-bus2-2, plus-bakkerij-3, plus-bus1-3, klok-hoelaat-1, min-machine-1. Alle 10 tot het eind (`r6/tel/`).
- Laptop (1440 × 900), `GOED=1`: alle 18 kloklessen en alle 7 Tijd-lessen. Alle 25 tot het eind (`r6/laptop/`).
- Bewegende min-machine: losse reeks van 36 beelden om de 250 ms (`r6/burst-m1/`). Geluiden in de code nagekeken.

### Wat is opgelost
- **Fout A (kleur antwoord in zin):** min-machine-2 "Ja! 10 − 2 = 8." 8 roze in som en zin (tablet 017); min-bus2-1 "Er ligt nog 1 pakje in de bus." 1 roze in som en zin (008); min-bus1-1 5 paars in som en zin (004). Goed.
- **Croissants (plus-bakkerij-3):** blauw en roze, 4 per rij, los van elkaar. Tablet ±70 px (007), telefoon ±33 px (010). Telbaar en goed te onderscheiden.
- **piraat-1:** de kopermunten hebben nu verloop, ring, lichtvlekje en een dun randje; ze lijken op munten (tablet 019, ±34 px).
- **piraat-2 en piraat-3:** elke minsom heeft nu twee kleuren: a en uitkomst in de kleur van het voorwerp, het getal dat weggaat in een andere kleur (7 − 3 = 4 blauw/oranje/blauw, 14 − 6 = 8 geel/blauw/geel, 12 − 5 = 7 blauw/oranje/blauw). Wat weggaat wordt dof. Zin en som zelfde kleuren.
- **min-kaal-2:** de groene getallen op het groene bord hebben nu een dikke donkere rand en zijn goed leesbaar (tablet 003, 013).
- **Fout C (springen):** het speelvlak blijft tussen de zinnen op dezelfde plek: telefoon min-bus1-2 bus op y ±240 in 002–004 en 006–011, klok-hoelaat-1 ±245 in 004–012; tablet ±5 px. Eén keer een klein stapje bij de eerste vraag, daarna stil. Alleen als het typvak de aandacht krijgt, schuift alles ±55 px omhoog (telefoon 005): dat is de bedoelde schuif voor het toetsenbord (regel 5).
- **Fout D (14.25) in klok en tijd:** in alle 25 lessen staan verhaal en vraag samen in beeld. Steekproef van alle vraagsoorten (kiesKlok, leesKlok, knopVraag, verbind, memory, tijdRekenen, plaatjesVraag, ordenen): elk ding in beeld wordt in de zin genoemd (deegkom: "Het deeg voor de broodjes is klaar…", taart, oven, laptop, telefoon, schoen en bakkerij, glas/brood, jas/bezem). Op de telefoon passen ook de langste zinnen (8–9 regels, digitaal-2/024, tijden-2/006, dagen-3/067); niets valt weg en het vlak schuift niet weg.
- **kalender-1:** één weekkalender (juni, ma–zo 7–13, hoepels op di, do, vr) in alle vragen; "20" in plaats van de ballon; de witte kaartjes om de dagplaatjes zijn weg. De kalender klopt met de vragen: 1 juni is dinsdag, 8 juni (rood) is dinsdag, "Vandaag is er gym. Dat is ook op donderdag. En op vrijdag!" past bij hoepels onder 8, 10 en 11; 13 juni (feesthoedje) is zondag; kalender-2 "woensdag 9 juni" klopt ook.
- **Machinegeluiden (code):** `bandRol` (vol 0,025–0,03, 0,22 s), `machineAan` (0,03–0,05, ±1,2 s), `stukPlop` (0,04–0,07, 0,25 s, om de 300–340 ms, dus nooit over elkaar), `restKlik` (0,03–0,04, 0,5 s). Alles gaat via `speelLesgeluid` → zwijgt als de geluidjes-knop uit staat (`magKlinken`/`leesKind`) of de ouder ze uitzet, en wordt 0,2 zo zacht zolang Bliepo praat. Alleen de rolgeluidjes overlappen elkaar kort (om de 130 ms een geluid van 220 ms); dat klinkt als één doorlopend rollen. In orde.
- **Machine-animatie:** blokjes rollen de machine in, schudden, 3 gele blokjes vallen één voor één in het bakje, de rest rolt het vraagteken in (burst t00–t13). Duidelijk en rustig. Kleuren kloppen: 10 roze blokjes, −3 geel, 3 gele blokjes in het bakje.

### Nieuwe of overgebleven fouten

#### FOUT H (2.1/2.2): stippen in de hulp en uitleg zijn altijd geel
In de hulp ("Ik zet 10 stippen neer.") en in de uitleg na Nee zijn alle stippen geel, terwijl het getal in de zin en de som een eigen kleur heeft: 10 roze, 19 roze, 7 blauw (tablet machine-1/010, machine-3/011, machine-4/010, kaal-2/010). Dezelfde fout is eerder bij splitsen afgekeurd (stippen moeten de kleur van hun getal hebben). Bestand: `src/components/les/lessen/squla-minsommen.tsx` r. 218 en 758–769 (`zet(l, { stippen })`) en het tekenen van de stippen in `src/components/les/vlakken/squla-minsommen-vlak.tsx`. Voorstel: stippen in de kleur van het eerste getal (`somHex(a, b)[0]`), weg = grijs zoals nu.

#### FOUT I (14.21/14.13): de uitleg na Nee gaat over een andere som dan het voorbeeld
In alle Min-lessen laat het beginscherm de eerste vraag zien (`voorbeeld: speelVraag(m.vragen[0])`), maar de uitleg na Nee gebruikt vaste andere getallen:
- machine-1: voorbeeld en welkom 10 − 3, uitleg 10 − 2 (`uitlegStippen("machine", 10, 2)`, r. 1034);
- machine-2: voorbeeld 3 vol + 2 leeg, uitleg 4 vol + 2 leeg (r. 1065);
- machine-3: voorbeeld 7 − 4, uitleg 7 − 3;
- machine-4: voorbeeld 6 euro − 2, uitleg 4 euro − 1 (r. 1109);
- ook bus1-1 (8 − 3 / 6 − 2), bus1-2 (16 − 4 / 15 − 3), bus1-3 (15 − 7 / 13 − 5), bus2-1 (10 − 7 / 6 − 2), bus2-2 (17 − 5 / 15 − 3), bus2-3 (16 − 8 / 13 − 5).
Voorstel: de uitleg maken uit `m.vragen[0]` (zelfde getallen als welkom en voorbeeld), of de vaste getallen gelijkzetten. Ook Plus-lessen even nalopen.

#### FOUT J (14.25) in de Min-lessen: verhaal en vraag vallen weg
In `squla-minsommen.tsx` blijft alleen de laatste zin in beeld:
- bus (r. 474): bij typvragen staat alleen "Typ het getal." naast de bus met pakjes (tablet min-bus1-2/003, telefoon 003). Ook de vraag "Hoeveel pakjes liggen er nu nog in de bus?" staat dan niet in beeld.
- geld (r. 580, machine-4): alleen "Hoeveel euro houd je over?" naast portemonnee, munten en ijsje (tablet 003). Dat je het ijsje koopt, staat er niet.
Voorstel: dezelfde `alsEenBlok` als in klok/tijd, het liefst centraal in `squlaVraag` (`squla-hulp.ts`), zodat het voor alle Squla-lessen geldt.

#### FOUT K (1.15): lange zin-blokken lopen op de laptop over de pauzebalk
Door `alsEenBlok` is het zin-blok op de laptop soms zo hoog dat het over de knoppen Pauze, geluidjes en "Testkind" valt, en de knop "Nog eens horen" over Bliepo's antenne:
- tijden-2, "Er is een bezoek aan de bakkerij! … Wat duurt het langst?" met twee brede antwoordknoppen (laptop 017);
- tijden-1, "Toen was het groene boek nog niet aan de beurt. … over een poosje?" met drie knoppen (laptop 010).
Andere lange zinnen (digitaal-2, dagen-3, kalender-1/2) passen net. Op tablet en telefoon is het in orde. Bestand: `src/components/les/Lesscherm.tsx` (ballon rechts op de liggende indeling). Voorstel: de ballon nooit hoger laten beginnen dan onder de pauzebalk (±110 px) en bij meer dan 6 regels de tekstkolom breder of de letter iets kleiner maken; de knop "Nog eens horen" nooit over Bliepo.

#### FOUT L (1.4): rechthoekige groene kaders bij "goed" en bij "Trek de lijnen" (squla-tijd-plaatjes.tsx)
- Bij goed krijgt het gekozen plaatje een groene rechthoek (`zetRing` "groen", r. 210–217 en 313–340). Bij de nieuwe weekkalender is die rechthoek veel groter dan de kalender zelf (de maat is nog die van het oude rooster 360 × 190): een groen kader om lege ruimte (laptop kalender-1/010, 011; telefoon 016).
- Bij "Trek de lijnen" krijgen alle verbonden plaatjes én woorden een blijvend groen kader (laptop kalender-1/024).
Dit is een kader om plaatjes en voorwerpen, en dat mag niet (1.4, "absoluut, ook al heeft Squla ze"; ook "geen hologramkaarten met rand", 1 nov). Besluit: **afgekeurd**. Voorstel: bij goed een korte groene lichtflits of zachte gloed in de vorm van het plaatje zelf (7.6, gebakken), die weer weggaat; bij verbinden alleen de groene lijn en een kleine groene stip/vinkje aan het eind van de lijn, zonder rechthoek. De woordknoppen (wit met donkere rand) mogen blijven: dat zijn antwoordknoppen (2.3).
De ronde ring om een klok in squla-klok.tsx (digitaal-1/025) volgt de vorm van de klok en is de lichtring van 7.6: die keur ik **goed**.

#### FOUT M (14.23): weekkalender te klein, op de telefoon onleesbaar
- Laptop: de weekkalender is ±265 × 95 px, de hoepels ±20 px, de getallen ±12 px (kalender-1/009, 022). Naast de maandkalender (±230 × 190) valt hij weg. Een kind ziet de hoepels nauwelijks.
- Telefoon: ±95 × 38 px, hoepels ±10 px, de dagen zijn niet te lezen (kalender-1/011, 028). De dagplaatjes (kring, rekenen, buiten, gym) zijn op de telefoon ±18 px.
Bestand: `src/components/les/vlakken/squla-tijd-tekeningen.ts` (`weekKalender`, ontwerpvak 330 × 142) en de kaartmaat in `squla-tijd-plaatjes.tsx`. Voorstel: weekkalender in beeld minstens ±450 px breed op de laptop, hoepels minstens ±40 px; op de telefoon de drie kaarten onder elkaar zetten (er is veel lege ruimte tussen beeld en tekst), zodat elke kaart de hele breedte krijgt.

#### FOUT N (14.23/14.5): pakjes in de bus op de telefoon niet te tellen
- Tablet: pakjes ±25 px met ±5 px ruimte (min-bus2-2/010, plus-bus1-3/014). Telbaar, maar klein; de bus gebruikt maar ±60 % van de breedte.
- Telefoon: pakjes ±12 px met ±2 px ruimte, 16–19 stuks in een raampje van ±95 px (min-bus1-2/010). Dit kan een kind van 6 niet tellen, ook niet met de telringetjes.
Voorstel: op staand scherm het speelvlak niet alleen op de breedte schalen: de bus groter (hele breedte) en de pakjes in minder kolommen, of op de telefoon de pakjes groter naast/onder de bus tellen. Dit hangt samen met T7 (telefoonindeling, nog twijfel): vraag Sara of de telefoon nu al moet kloppen. Hetzelfde zie je bij dagen-3 op de telefoon: de woorden op de wagons zijn ±6 px (067).

### Tips (geen afkeur)
- min-machine-1/2 op tablet en telefoon: bij "Ja!" springen de restblokjes even uit het vraagteken en raken de rechterrand van het scherm (tablet 016, telefoon 003). Kort, maar netter als ze binnen beeld blijven.
- plus-bakkerij-3: het croissantje linksboven steekt een paar pixels over de rand van de toonbank (tablet 007).
- Antwoordknoppen met tijden staan op tablet en telefoon in een smalle kolom van 2 + 1 (hoelaat-1 tablet 003). Eén rij zou rustiger zijn.
- piraat-1: kopermunten ±34 px op de tablet terwijl er veel ruimte is; mogen groter.
- 9 regels tekst op de telefoon (tijden-2/006) is veel voor een kind; Bliepo leest het voor, dus het werkt wel.

### Uitslag per punt
1. **Fout A — GOEDGEKEURD:** min-machine-2, min-bus1-1, min-bus2-1 (de kleur zelf). min-bus1-1 en min-bus2-1 blijven wel afgekeurd op FOUT I en J.
2. **plus-bakkerij-3 — GOEDGEKEURD.** Pakjes in de bus (min-bus2-2, plus-bus1-3): tablet telbaar maar krap; telefoon **AFGEKEURD** (FOUT N).
3. **piraat-1, piraat-2, piraat-3 — GOEDGEKEURD.**
4. **min-kaal-2 — GOEDGEKEURD** op contrast (stippen in de hulp: FOUT H).
5. **Fout C — GOEDGEKEURD** (telefoon en tablet).
6. **Kloklessen — GOEDGEKEURD (18)**, ook digitaal-2. **Tijd:** dagen-1, dagen-2, dagen-3, kalender-2 **GOEDGEKEURD**; tijden-1 en tijden-2 **AFGEKEURD** (FOUT K); kalender-1 **AFGEKEURD** (FOUT L en M; de kalender zelf klopt).
7. **Groene kaders bij verbinden/goed in Tijd — AFGEKEURD** (FOUT L). Ring om de klok — goed.
8. **min-machine-1 t/m 4 — AFGEKEURD:** FOUT I (uitleg na Nee andere som), FOUT H (gele stippen), machine-4 ook FOUT J. Beweging, telbaarheid op tablet, kleuren van som en blokjes, woord "blokjes" en de geluiden zijn in orde.

## Beginzinnen — 30 lessen — 2026-11-03 (controleur Sonnet)

Werkwijze: BEGINZINNEN.md en lijst.json zijn gelijk (30 lessen, geen lege zinnen). Ik heb NIET alle 30 lessen doorgespeeld: ik keek naar de schermfoto's van de eerste vraag (admin-pagina, en los geldmachine, digitaal-1, piraat-2) en naar de beschrijving "wat het kind doet". Zin 1 is dus getoetst aan de eerste vraag en die beschrijving, niet aan elke latere opgave.

Overkoepelend: (1) Zin 2 begint te vaak met "Heb je dit al ..." (#3, 8, 15, 17, 23, 28) en met "Kun/Ken je dit al ..." (#1, 6, 16, 18, 25, 29); #3/#8/#28 en #18/#25 zijn bijna gelijk. (2) "Is dit nieuw voor je?" (#5) draait Ja/Nee om (Ja = nieuw, terwijl Ja = "ken ik al" hoort te zijn). (3) "ontdek(ken)" staat in #11, #17, #22. (4) Vier lessen beginnen met "Je ..." (#4, 7, 10, 20). (5) Tellen-lessen #1, #19, #30 (en #8) lijken inhoudelijk sterk op elkaar; de zinnen verschillen maar weinig.

1. squla-tellen-fruit-1 — GOEDGEKEURD
2. squla-tellen-resultatief2-1 — GOEDGEKEURD
3. squla-getallenlijn-rangschikken-1 — GOEDGEKEURD (tip: "rijen getallen" is stijf; beter "Nu gaan we met de getallenlijn zoeken welk getal er ontbreekt en zetten we kaartjes op volgorde.")
4. squla-getallenlijn-dieren-2 — GOEDGEKEURD
5. squla-getallenlijn-terugtellen-1 — AFGEKEURD: zin 2 "Is dit nieuw voor je?" draait Ja/Nee om. VOORSTEL zin 2: "Kun je zelf al terugtellen?"
6. squla-klok-hoelaat-1 — GOEDGEKEURD
7. squla-klok-klokkijken2-1 — GOEDGEKEURD (zin 2 "Lukt dit je al?" lijkt op #30; zie daar)
8. squla-meer-minder-evenveel1-1 — AFGEKEURD: zin 1 "welk getal evenveel is" is onduidelijk; les lijkt op fruit-1; zin 2 bijna gelijk aan #3. VOORSTEL zin 1: "We tellen eerst groepen appels en andere dingen en kiezen dan het getal dat erbij past." zin 2: "Kun je al goed tellen?"
9. squla-meer-minder-evenveel3-1 — GOEDGEKEURD (tip zin 1: "...en tik je het getal dat meer of minder is.")
10. squla-meten-pizza-1 — GOEDGEKEURD
11. squla-meten-oppervlakte-1 — AFGEKEURD: "Stap voor stap ontdek je" is abstract en "ontdek" komt 3x voor. VOORSTEL zin 1: "Je kijkt welk ding groot of klein is en telt hokjes om het te meten."
12. squla-geld-geldmachine-1 — AFGEKEURD: zin 1 "die bij de vraag horen" is vaag (foto: "Waar zie je een munt van 1 euro?"); zin 2 "Durf je dit al aan?" past niet bij geld (klinkt eng). VOORSTEL zin 1: "Dadelijk zie je munten en briefjes en tik je op het geld dat in de vraag staat." zin 2: "Ken je al alle munten en briefjes?"
13. squla-geld-zakgeld-1 — GOEDGEKEURD
14. squla-vormen-patronen-1 — AFGEKEURD: "Allereerst" is moeilijk; zin 2 te lang. VOORSTEL zin 1: "Met kralen maken we een patroon af: je kiest welke kraal er daarna komt." zin 2: "Weet je al wat een patroon is?"
15. squla-vormen-kleuren-1 — GOEDGEKEURD
16. squla-splits-splitsen1-1 — GOEDGEKEURD
17. squla-splits-delen-1 — GOEDGEKEURD
18. squla-piraat-2 — GOEDGEKEURD (klopt met foto: kind sleept sterren naar het vak)
19. squla-rekenmix-mix1-1 — GOEDGEKEURD
20. squla-rekenmix-mix3-2 — AFGEKEURD: "welk ding eerste, tweede of derde staat" is geen goed Nederlands; "ding" vaag. VOORSTEL zin 1: "Je kijkt naar een rij en kiest welk ding op de eerste, tweede of derde plek staat."
21. squla-tijd-dagen-1 — GOEDGEKEURD (let op: lijkt op #27, zelfde weektrein)
22. squla-tijd-kalender-1 — AFGEKEURD: "dag-, week- en maandkalender" is lastig voor te lezen en te lang; "ontdekken"; zin 2 "Doe je dit al vaak?" is geen "kun je dit al". VOORSTEL zin 1: "Met de kalender zoek je welke kalender bij de vraag past en welk getal in een vakje staat." zin 2: "Lees jij al weleens op een kalender?"
23. squla-plus-bakkerij-1 — GOEDGEKEURD (tip: "het antwoord" in plaats van "de uitkomst")
24. squla-plus-bus1-1 — GOEDGEKEURD (typt: klopt)
25. squla-min-machine-1 — AFGEKEURD: alleen zin 2 "Kun je dit al een beetje?" is bijna gelijk aan #18. VOORSTEL zin 2: "Heb je al eens min gerekend?"
26. squla-min-ruimte-1 — GOEDGEKEURD
27. squla-dagen-van-de-week — AFGEKEURD: lijkt te veel op #21 (zelfde weektrein, zelfde titel); "zoek je dagen" vaag. VOORSTEL zin 1: "Aan boord van de weektrein tik je de dag aan die ervoor of erna komt." zin 2: "Ken je de dagen van de week al?"
28. squla-huisnummers — AFGEKEURD: alleen zin 2 "Heb je dit al eens gezien?" (bijna #3, en vraagt niet of je het kunt). VOORSTEL zin 2: "Weet je al hoe huisnummers werken?"
29. squla-klok-digitaal-1 — AFGEKEURD: zin 2 "Kun je dit al goed?" lijkt op #6 en #16; zin 1 "met zijn wijzers" (beter "de wijzers") en de eerste vraag is juist "waar zie je ook zo'n klok?". VOORSTEL zin 1: "Nu kijk je naar de wijzers van de klok en zoek je waar nog meer een klok staat." zin 2: "Weet je al hoe een klok werkt?"
30. squla-tellen-fruit-3 — AFGEKEURD: alleen zin 2 "Lukt het je al om dit te doen?" is lang en lijkt op #7. VOORSTEL zin 2: "Kun jij fruit tellen als het door elkaar ligt?"

Pagina /admin/beginzinnen: bevat per les naam met link (/voorbeeld/les/<id>?naam=Testkind, 200), schermfoto (alle 30 jpg's aanwezig, foto klopt met de les voor de 12 die ik bekeek), uitleg, zin 1, zin 2 en de huidige zin. Op laptop duidelijk en goed leesbaar, gegroepeerd per onderwerp. Punt: in een smal venster (390 px, headless) lijkt de tekst rechts afgesneden; de vaste zijbalk en de kaarten (min. 380 px) passen niet netjes. Op een echte telefoon nog even nakijken; op tablet (breed genoeg) is dit waarschijnlijk geen probleem.


## 4 november 2026 — herhaling in uitleg en foutenhulp

- De aparte Nee-tekstfilter gold niet voor gewone Hulp. Hersteld met een eigen hulpcontext, zonder gewone vragen als begeleide oefening te beoordelen. Ook de route opnieuw fout gebruikt die context.
- Dubbele slotvragen verwijderd; inhoudelijke telstappen en gerichte deelhints behouden.
- Na een volledig beantwoord eerste voorbeeld begint de gewone lijst met de volgende opgave. Afwijkende vervolgstappen blijven: klok-hoelaat-1, min-machine-2, vormen-kleuren-1 en de rekenmixlessen met een ander voorbeeld.
- Onafhankelijke codecontrole uitgevoerd met een geërfde Codex-agent (Opus hier niet beschikbaar). Gevonden en hersteld: schatletter na het voorbeeld, somkeuze na alleen tellen, grotere puzzel na klein voorbeeld en resterende slotvragen. De 3 schatwoorden behouden 15, 15 en 16 letters.
- Pauze wacht nu op de asynchrone stop; de les kan niet per ongeluk doorlopen na stopLes.
- `node scripts/check-herhaling.cjs`: 132 volledige Ja/Nee-opgavenlijsten met invoerstubs; 1995 uitlegcallbacks geïnventariseerd; echte centrale foutafhandeling getest voor direct goed, Hulp, opnieuw goed, opnieuw fout, hint en pauze. Dit is geen volledige browsertest van elke opgave.
- `node scripts/check-uitleg.cjs`: 135 eerste Nee-routes bereiken invoer; 36 lessen doorlopen Nee volledig met direct goed én eerst fout, inclusief de 3 eigen routes en antwoordcontroles. Overzichtregels komen nog overeen met de echte uitleg.
- ESLint op de 15 gewijzigde lesbestanden: geslaagd. Broncode-typecontrole: geslaagd. Standaard tsc geeft uitsluitend 2 fouten in een oude gegenereerde .next/dev/types/app/page.ts die naar het niet meer bestaande src/app/page.js verwijst; die validator is in de aanvullende typecontrole uitgesloten.
- Stemzinnenlijst lokaal vernieuwd; geen stemdienst aangeroepen.
- Browsercontrole niet afgerond: herhaalde time-outs bij openen/herladen/bedienen van de Patronen-preview. Geen nieuwe schermfoto of volledige visuele goedkeuring geclaimd.

## Hulp na fout – controle 4 november (onafhankelijk)

Gekeurd door de onafhankelijke controleur (alleen gelezen, geen code gewijzigd, geen speelcontrole gedraaid). Gekeken naar de nieuwe velden `reactie`, `tip`, `laatZien`, `toonAntwoord`-zinnen en `samen` in de 16 bestanden in `src/components/les/lessen/`, getoetst aan BOUWREGELS 5.1, 5.4, 5.10, 3.17, 3.20, 3.23 en 11.2. Regelnummers zijn die van de bestanden op dit moment. Alle voorstellen zijn alleen tekst; antwoordwaarden en beoordeling blijven gelijk.

**Wat goed is (alle bestanden):**
- Geen vast "Niet helemaal", geen "pauze" en geen keuze "hulp / nog een keer" meer in de nieuwe route. (Alleen oude koptekst-commentaar noemt dat nog: tijd:16-17, meten:21-23, dagen:16-18, rekentaal:12-14. Commentaar bijwerken, geen kindzin.)
- De naam van het kind staat niet in `reactie`/hint. Hij staat alleen in de slotzin (dagen:433, rekentaal:559, huisnummers:267), 1 keer per les: goed (3.17).
- De rekenkunde in de reacties is bij steekproef in orde. Nagerekend: alle 6 verhaalvragen in tijd:622-715 (dag/nachtjes), KAL2_MIS (tijd:1318-1331), meer-minder (voorbeeld/twee/drie/getal), tellen (zak/rij), huisnummers (`tipZin`), klok (`reactieLees`, `reactieKlokkeuze`, uitlegHeel), plussommen/minsommen/piraat (`somReactie`, `minReactie`, `pzReactie`) en geld (te veel / te weinig). Geen enkele reactie die liegt over de gekozen fout.
- Elke vraag met `synthesis` heeft een `toonAntwoord` (of een eigen route, zoals huisnummers).

**Gevonden over alle bestanden (de drie grote punten):**
1. **Cijferafspraak 3.20 (veruit het meeste):** "één", "twee", "drie" enz. in hulpzinnen als hoeveelheid, en in dezelfde les door elkaar met "1". Zie per bestand. Binnen tellen en getallenlijn staat in dezelfde vraag zelfs "Tel 1 verder" (reactie) naast "Tel één verder" (tip/hulphandje).
2. **Hint klinkt als vraag (punt 8) en herhaalt de vraag (3.23):** de hint is soms letterlijk de vraag zelf. En ongeveer 20 zinnen in `samen` (uitleg na tweede fout) stellen een vraag zonder `krijgtVervolgvraag`-bewaking, terwijl het kind daarna niet mag antwoorden. Zie hieronder.
3. **Herhaling tussen lessen (punt 6):** zie de lijst "Top-herhalingen".

### Per bestand

**squla-klok: AFGEKEURD (6 punten)**
- klok:497 "Eén klok ligt op de goede plek." -> "1 klok ligt op de goede plek."
- klok:634, 649, 651, 655, 826 "één getal verder / terug" -> "1 getal verder / terug".
- klok:861 en 872 "Zoek een rondje met twee wijzers." -> "met 2 wijzers".
- klok:931 en 970 (tweede zin van de reactie) "Naar welk getal wijst de kleine wijzer?" -> hint die geen vraag is: "Kijk naar het getal waar de kleine wijzer naartoe wijst."
- klok:376 "Waar wijst de kleine wijzer naartoe?" en klok:1096/1100 "Waar staat de oven?" en klok:1076 tip "Wat zie je overdag aan de lucht?" zijn hints in vraagvorm -> "Kijk waar de kleine wijzer naartoe wijst." / "De oven staat in de bakkerij, niet in de bus." / "Overdag schijnt de zon."
- klok:795 "Wij kijken nu naar de kleine wijzer." -> "We kijken nu naar de kleine wijzer." (stijf; "wij" ook in 6 andere bestanden).
- klok:242 "Dit is het goede antwoord." is een vaste zin voor elke uitleg-vraag in klok -> weglaten of laten wisselen.
- klok:447 en 494: vraag in `samen` zonder bewaking (zie lijst hieronder).

**squla-tijd: AFGEKEURD (9 punten)**
- tijd:45 en 51 `AANTAL = ["Geen","Eén","Twee","Drie","Vier"]`: "Eén dag ligt op de goede plek", "Twee kaartjes liggen op de goede plek" -> cijfers: "1 dag ligt op de goede plek", "2 dagen liggen op de goede plek". Ook tijd:1256 "Eén lijn klopt. Die blijft staan." / "Twee lijnen kloppen." -> "1 lijn klopt." / "2 lijnen kloppen."
- tijd:364 "Vijf dagen ga je naar school. Wij tellen het weekend." -> "Op 5 dagen ga je naar school. We tellen het weekend." en "maar één dag" -> "maar 1 dag".
- tijd:386 en 1253 "Het weekend zijn de laatste twee dagen van de week." is geen goed Nederlands (weekend zijn) -> "Het weekend is zaterdag en zondag." (of hint: "De laatste 2 dagen van de week zijn het weekend."). tijd:1253 "Een week heeft er zeven." -> "7".
- tijd:655 "Na twee nachtjes ... Er komt nog een nachtje bij." en 667 "Na nog een nachtje ... Nu nog één nachtje." (in dezelfde uitleg door elkaar "1", "een", "één") -> "Na 2 nachtjes is het zaterdag. Er komt nog 1 nachtje bij." en "Nu nog 1 nachtje."; idem 670 "Tel drie nachtjes" -> "3", 673 "twee dagen geleden" -> "2", 702 "na één nachtje / twee nachtjes te veel" -> "1 / 2", 712 en 715 idem.
- tijd:429 "Elke wagon is één dag." (en dagen:354) -> "Elke wagon is 1 dag." tijd:637, 652, 699 "nog één dag verder / terug" -> "nog 1 dag".
- tijd:950, 1327, 1329-1331, 1430, 1446, 1480, 1496, 1528, 1549, 2052-2054 "één vakje / één boogje / één nachtje / één dag" -> "1 ...".
- tijd:2054 tip "Wat duurt meer dan één dag?" en "Wat duurt langer dan een hele middag?" zijn twee hints in vraagvorm (de eerste blijft staan na `hint()`) -> "Denk aan wat langer duurt dan 1 dag."
- tijd:255-259 en 290-293 zijn bijna gelijk aan dagen:184-187 en 215-218 (zie top-herhalingen).
- (samen) tijd:1813 vraag zonder bewaking (zie lijst).

**squla-geld: AFGEKEURD (6 punten)**
- geld:330 "één te veel / één te weinig" -> "1 te veel / 1 te weinig".
- geld:271 "Eén groepje klopt." -> "1 groepje klopt."
- geld:700 "Dit is één euro. Kijk naar de één en het woord euro." -> "Dit is 1 euro. Kijk naar de 1 en het woord euro."
- geld:930 "Tel er vijf bij." en geld:991 "Tel er twee bij." -> "Tel er 5 bij." / "Tel er 2 bij."
- geld:792 en 817 (samen) eindigen op "Is dat meer dan 9 euro, of minder?" / "Heb je genoeg met 9 euro?" zonder bewaking; ook de tips geld:794/819 "Heb ik genoeg met 9 euro?" / "Is dat meer dan 9 euro?" zijn vragen en verklappen niet, maar klinken als nieuwe vraag -> als stelling: "Kijk of 12 meer is dan 9." (let op: de reactie zelf, geld:795/820 "Kijk of dat meer is dan 9 euro", is goed).
- geld:266-267 reactie bij een foute groep: 3 zinnen achter elkaar ("Dit geld is samen X euro." + "Dat is meer dan we zoeken." + "Tel elk groepje geld.") is lang voor groep 3 -> hint weglaten (de eerste 2 zinnen zijn al de hint).
- geld:792 samen: "Tel verder vanaf 4: 5, 6, en nog één." (geld:~812) -> "en nog 1".

**squla-meten: AFGEKEURD (7 punten)**
- meten:50 en 56 `AANTAL` / "Eén ... ligt op de goede plek" -> cijfers (zoals tijd:45).
- meten:59 `teVeel`: "één te veel / één te weinig" -> "1 te veel / 1 te weinig".
- meten:404 "Eén van je twee antwoorden klopt." -> "1 van je 2 antwoorden klopt."
- meten:672, 685, 688, 714, 718, 756 "één meer / één minder / er komt er één bij / er gaat er één af" -> "1 meer", "1 minder", "er komt er 1 bij", "er gaat er 1 af". Let op: meten:688 tip eindigt op de vraag "Welk plaatje is één meer?" (hint = de vraag zelf) -> weglaten, laat "Tel verder vanaf 3." staan.
- meten:~800 (`reactie` uit `o.uitleg.find(...)`): als hint wordt de eerste uitleg-zin gebruikt. Dat is niet altijd een hint (bij meten:879 "Eén zak meel kun je nog net tillen" zegt hij niets over wat het kind koos). Nakijken per vraag; voorstel: eigen hint.
- meten:814 (samen) "Hoeveel heb je nodig om net zo zwaar te zijn als ...?" zonder bewaking.
- meten:61 en rekentaal:193 hebben dezelfde drie openingen ("Je koos X." / "Dat is X." / "Hier zie je X."); zie top-herhalingen.

**squla-dagen: GOEDGEKEURD, met 2 kleine punten**
- dagen:354 "Elke wagon is één dag." -> "Elke wagon is 1 dag."
- dagen:184-187 en 215-218 zijn nagenoeg gelijk aan tijd (zie top-herhalingen); inhoudelijk wel juist en bruikbaar.
- Controle: reactie en hint kloppen (bv. "Voor maandag was de vorige week. Kijk naar het eind." is goed).

**squla-rekentaal: AFGEKEURD (4 punten)**
- rekentaal:390 en 430 "groter dan één andere mand / appel" -> "groter dan 1 andere mand / appel" (of: "Er is nog een kleinere mand" zonder getal).
- rekentaal:316 en 471 hebben letterlijk dezelfde reactie ("De mand is groot, maar hij is leeg. / De kant van de appel gaat omhoog. / Kijk welke kant omlaag zakt.") bij twee verschillende vragen; in elke vraag is 1 van de 2 helften onbereikbaar. Voorstel: per vraag een eigen reactie.
- rekentaal:451 en 492 "Er is nog een langer broodje." / "Er is nog een korter broodje." -> "Er is nog een langer broodje" is goed, maar zonder keuze welk: "Dit is niet het langste broodje."
- rekentaal:193: "Je koos X / Dat is X / Hier zie je X" is dezelfde set als meten:61 (zie top-herhalingen).
- Rekenkundig en grammaticaal verder in orde.

**squla-tellen: AFGEKEURD (3 punten)**
- tellen:162, 281 "Elke losse ... is er één meer." -> "er 1 meer."
- tellen:969, 1066 "Elk huis is één verder." en tellen:~976 "Terug wordt het steeds één minder." -> "1 verder", "1 minder".
- tellen:981 tip "Tel één verder dan ..." / "Tel één terug vanaf ..." staat naast reactie `tip` (tellen:~921) "Tel 1 verder dan ..." in dezelfde vraag: gelijk trekken op "Tel 1 verder dan" / "Tel 1 terug vanaf".

**squla-meer-minder: AFGEKEURD (2 punten)**
- meer-minder:459-462 `tipKaart` eindigt op de vraag zelf ("Welke kaart heeft er meer?", "Welk getal is het grootst?", "Welk getal is groter dan 13?"). Hij wordt aan de reactie vastgemaakt (r.475) en staat dus als hint vlak vóór dezelfde vraag (3.23, punt 8). Voorstel: "Kijk welke kaart meer sterren heeft dan het plaatje bovenaan." / "Zoek het grootste getal op de kaarten." (stelling, geen vraag).
- meer-minder:341 "Tel de rest één voor één." is een vaste zin; mag blijven (idioom), maar komt ook voor in tellen:239 en rekenmix:637/658 (zie top-herhalingen).
- Geen "één" als hoeveelheid, rekenkundig goed.

**squla-getallenlijn: AFGEKEURD (7 punten)**
- getallenlijn:222 "Tel bij elk streepje één verder." -> "1 verder"; 476 "Het raketje staat één streepje verder." -> "1 streepje"; 479 tip "Tel één verder dan 10" naast reactie "Tel 1 verder dan 10" (zelfde vraag) -> beide "1"; 673/676 "één terug"; 837 "Tel één verder dan"; 974, 985, 1005 "Elk lampje / diamant / streepje is één verder"; 999-1000 "Dat is één terug / Tel één terug".
- getallenlijn:872 "Tel twee verder vanaf ..." -> "Tel 2 verder vanaf ...".
- getallenlijn:38 `Telwoord(1)` geeft "Eén" -> "1" (waar dit in zichtbare tekst komt).
- getallenlijn (reactie bij "Welk getal komt na ..."): 2e zin is een vraag: "Welk getal komt na {n-1}?" (zelfde vraag als de opgave) -> "Tel 1 verder dan {n-1}."
- getallenlijn (reactie bij "later"): "Welk getal komt later als je telt?" -> "Het getal dat je later zegt als je telt, is meer."
- getallenlijn (sprongen van 5): "Tel in sprongen van 5 vanaf het midden: 10, 15…" -> de puntjes worden bij het voorlezen een rare stilte; "10, 15, ..." weglaten of "Tel in sprongen van 5: 5, 10, 15."
- getallenlijn:335, 515, 597, 869, 991 (samen) vragen zonder bewaking (zie lijst).

**squla-huisnummers: GOEDGEKEURD, met 2 kleine punten**
- huisnummers:224 "Elk volgend nummer is één meer." -> "1 meer."
- huisnummers:77 "Kijk, op één bordje staat een vraagteken." -> "op 1 bordje".
- Goed: tipZin gebruikt overal "Tel 1 verder dan" / "Tel 1 terug vanaf"; de hint klopt voor na/voor/tussen/sleep/terug. Opmerking buiten de opdracht: de lijst loopt tot 50, BOUWREGELS 11.2 zegt groep 3 nooit boven 20 (niet nieuw, wel melden).

**squla-vormen: AFGEKEURD (4 punten)**
- vormen (standaard `past hier niet`): `reactie` valt terug op "{Dat/De X} past hier niet." (vormen:~248) en nog 2x "past daar niet" (vormen:~872, ~1215) en "Dat plaatje komt nu niet." Zegt niets over wat het kind koos of wat het zoeken moet. Voorstel: wel een hint die past (bv. "Kijk naar de laatste vorm.") of de reactie noemen wat er mist.
- vormen:~1190 `reactie` "Kijk eerst: boven of onder?" + "Dan: links of rechts?" zijn 2 hints in vraagvorm -> "Kijk eerst of het bovenaan of onderaan ligt. Kijk daarna of het links of rechts ligt."
- vormen:~690 "In die rij staat niet elke kleur één keer in elk rijtje." is lastig en grammaticaal stroef -> "In deze rij mist een kleur." (of: "Elke kleur staat 1 keer in elk rijtje.").
- vormen:650, 689, 823, 867, 1304, 477 vragen in `samen` zonder bewaking (zie lijst).
- vormen:680 "Eén vlak heeft nog geen kleur." -> "1 vlak" (niet nieuw).

**squla-plussommen: AFGEKEURD (6 punten)**
- plussommen:259 "is één meer dan", 309 "Het antwoord is één meer.", 289 en 937 "Eén meer dan 7: hoeveel is dat?", 731-737 ("Er komt eerst één X bij. Tel één verder." en reactie "Er komt er nog één bij", "maar één meer"), 735 en 737 `laatZien` "Eén meer dan ..." -> "1 meer dan ...", "Tel 1 verder".
- plussommen:330 (en piraat:239) "Dat is maar één van de twee getallen uit de som." -> "Dat is maar 1 van de 2 getallen."
- plussommen:804 `tip` eindigt op de vraag "Op welk kaartje zijn de twee getallen samen 10?" (nu door `hint()` gefilterd?) en plussommen:~810 "Op de kaartjes staan twee getallen." -> "2 getallen".
- plussommen:248 "Twee keer hetzelfde getal" -> "2 keer".
- plussommen:897 "Kijk, een rij van tien plekjes." -> "een rij van 10 plekjes."
- Goed: de reacties per fout (net naast / te veel / te weinig / opgeteld) en `somReactie` zijn rekenkundig juist.

**squla-minsommen: AFGEKEURD (3 punten)**
- minsommen:923 "Elke stip is één euro" -> "1 euro"; minsommen:516 "twee keer hetzelfde getal" -> "2 keer".
- minsommen:~676 (`welkeReactie`): "Vooraan moet staan hoeveel er eerst waren: 9." en "Tel alle X, ook de lege: 12. Dat getal komt vooraan." noemen het getal dat het kind moet kiezen. Dat is verklappen na 1 fout; voorstel: "Vooraan staat het getal van alles wat er eerst was."
- Goed: `minReactie` ("Je koos 7. Dat is 4 plus 3.") en de euro-reacties zijn juist.

**squla-rekenmix: AFGEKEURD (7 punten)**
- rekenmix:442-459 `TELWOORD` ("Eén staat er al op de goede plek", "Twee staan er al ...") -> cijfers: "1 staat er al op de goede plek", "2 staan er al ...". Zin "Er staat er nog geen op de goede plek." loopt stroef -> "Er staat nog niets op de goede plek."
- rekenmix:1148 "Eén lijn klopt." / "Twee lijnen kloppen." -> cijfers.
- rekenmix:882, 891, 897, 1194, 1195, 1203, 1219 "één meer / één minder / Steeds één verder" -> "1 meer / 1 minder / Steeds 1 verder". Let op: rekenmix:1195 "is niet één minder dan" -> "is niet 1 minder dan".
- rekenmix:637, 658 "Tel er steeds twee bij." -> "Tel er steeds 2 bij." en rekenmix:1345/1368 "Tel tot drie. De derde staat in het midden." -> "Tel tot 3. De 3e ballon staat in het midden." (of: "de middelste").
- rekenmix:1191 "Typ het getal dat jij denkt." is geen natuurlijke zin -> "Typ eerst een getal."
- rekenmix:713, 1192-1194, 1288 "Wij zoeken ..." -> "We zoeken ...". Een tutor zegt dit 5x in 1 bestand.
- rekenmix (volgorde-reactie): "Wat doe je als allereerste? Dat plaatje zet je vooraan." (~r.1065) heeft een vraag midden in de hint -> "Het eerste wat je doet, zet je vooraan."

**squla-piraat: AFGEKEURD (3 punten)**
- piraat:239 "maar één van de twee getallen" -> "maar 1 van de 2 getallen".
- piraat:~481 tip eindigt op de vraag "Wat blijft er over?" (door `zonderVraag` wel weggefilterd in de reactie; blijft staan bij het hulphandje) -> "Tel wat overblijft."
- piraat:503 "Je koos: {hele zin in kleine letters}." leest als hele zin voorgelezen; bij zinnen met eigennamen/hoofdletters klopt de kleine letter niet. Voorstel: "Dat klopt niet bij het plaatje."
- Rekenkunde in `pzReactie` is juist.

**squla-splitsen: AFGEKEURD (5 punten)**
- splitsen:471 en 1597 "munten van één euro" -> "munten van 1 euro"; splitsen:471 "Het briefje is al tien euro." -> "10 euro."; splitsen:158 "Eén ligt onder de doek." -> "1 ligt onder de doek."
- splitsen:471 (samen, geldversie) eindigt op de vraag "Hoeveel euro komt erbij?" gevolgd door `l.verder()`: het kind mag niet antwoorden -> weglaten of als stelling.
- splitsen:296 en 1308 (samen): "Hoeveel zijn het samen?" direct gevolgd door nog een opdracht ("Zoek het huisje ...") = twee opdrachten achter elkaar (3.23). Voorstel: laatste zin "Samen zijn dat al die ballen." weglaten; alleen de bewaakte zin laten staan.
- splitsen:343, 945, 1368 (samen) vragen zonder bewaking (zie lijst).
- splitsen:531 `reactie` 3 zinnen ("... is samen 8. Dat is meer dan 10. Een van de twee getallen is 10.") is te lang en de derde zin verklapt de helft van het antwoord -> alleen de eerste twee zinnen.

### Vragen in `samen` zonder bewaking (BOUWREGELS 3.23, punt 7)
Na de tweede fout staat de vraag opnieuw in de uitleg, terwijl het kind daarna niet mag antwoorden (de bewaking `krijgtVervolgvraag` is wel actief, maar deze zinnen gebruiken hem niet). Voorstel overal: `...(krijgtVervolgvraag(l) ? [] : ["<vraag>"])` of de vraag als stelling zeggen. Gevonden (context gecontroleerd: alle in `samen` of `uitleg`):
klok:447, 494; tijd:1813; geld:792, 817; meten:814; getallenlijn:335, 515, 597, 869, 991; vormen:477, 650, 689, 823, 867, 1304; rekenmix:1031; splitsen:296, 343, 471, 945, 1308, 1368. Dat zijn 23 plekken. (Niet in elk geval is bevestigd dat de zin ook echt wordt uitgesproken; de speelcontrole is niet gedraaid. De gebruikers-route "ALLEFOUT" moet dit bevestigen.)

### Top-herhalingen (punt 6, "uniek, niet standaard")
Aantal bestanden / voorkomens in de `reactie`/hint-zinnen:
1. **"X is te veel." / "X is te weinig."**: 5 bestanden, 20 voorkomens (minsommen 8, piraat 4, plussommen 3, rekenmix 3, geld 1). Voorstel: per les een eigen vorm ("Dat zijn er te veel", "Zoveel zijn het er nog niet") en bij minsommen over "overblijven" praten.
2. **"X zit er net naast."**: 5 bestanden, 7 voorkomens (getallenlijn 2, piraat 2, rekenmix, plussommen, minsommen). Voorstel: "Je bent er bijna." in 1 les, en in de andere een zin die past (bv. getallenlijn: "Het streepje ernaast.").
3. **"Je koos X."**: 8 bestanden, 20 voorkomens (minsommen 5, plussommen 4, piraat 3, klok 2, rekenmix 2, rekentaal, meten, splitsen). Plus `wissel(...)` met dezelfde set "Je koos X / Dat is X / Hier zie je X" in meten:61 en rekentaal:193 (letterlijk dezelfde drie zinnen).
4. **"Tel de rest één voor één."**: tellen:239, meer-minder:341, rekenmix:637/658 (4 plekken, 3 bestanden).
5. **"Kijk naar de wagon achter/voor/vlak voor X." + "X komt (niet) meteen na/voor Y, niet erna" + "Dat is X zelf."**: dagen:184-187 en 215-218 zijn bijna woord voor woord gelijk aan tijd:255-259 en 290-293 (2 bestanden x 2 vragen). Voorstel: tijd en dagen laten verschillen of 1 gedeelde functie met wisselende zinnen.
6. **"{X} past hier/daar niet."**: meten, getallenlijn, vormen (3), splitsen = 6 plekken in 4 bestanden.
7. **"{n} staat/staan/ligt/liggen op de goede plek."**: klok:497, tijd:51, meten:56, rekenmix:459, getallenlijn, meer-minder = 6 bestanden, bijna dezelfde zin. Voorstel: per les eigen zin (klok: "Die klok staat al goed"; getallenlijn: "Dit getal staat al goed").
8. **"Begin bij X." + "Tel de rest/de ... erbij."**: 8 bestanden, ongeveer 35 voorkomens (geld 12, plussommen 7, rekenmix 5, tellen 4, tijd 3, piraat 3, meer-minder 2, rekentaal 1). Voor tellen/optellen is dit een echte hint en past ze; voorstel: per les 1 andere vorm houden ("Start bij 7", "Zet je vinger op 7").
9. **"Zoek de / het ..."** als hint: 11 bestanden, ongeveer 66 voorkomens (tijd 15, splitsen 11, rekentaal 8, meten 7, klok 5, plussommen 5, rekenmix 5, ...). Voorstel: mengen met "Kijk naar ...", "Let op ...", "Pak de ...".
10. **"Tel verder vanaf / Tel jij verder vanaf X"**: 7 bestanden, 19 voorkomens (geld 5, meten 4, tellen 3, splitsen 3, getallenlijn, rekenmix, meer-minder). 
11. **"Er komt (nog) iets bij"**: plussommen 4, piraat 1 (een vaste hint voor "je koos een van de getallen").
12. **"Dat is niet X."**: klok 3, rekentaal 2, rekenmix 3, splitsen 3.
Samen zijn de hulpzinnen dus voor een groot deel dezelfde 10 patronen; de afwisseling (`wissel`) zit alleen op de opening en op "ik laat het je zien", niet op de inhoud.

### Samenvatting
- Goedgekeurd: **squla-dagen** en **squla-huisnummers** (alleen 2 kleine cijferpunten).
- Afgekeurd: klok, tijd, geld, meten, rekentaal, tellen, meer-minder, getallenlijn, vormen, plussommen, minsommen, rekenmix, piraat, splitsen = **14 van 16 bestanden**.
- Totaal ruim 70 afzonderlijke zinnen/regels gemeld, waarvan: ~50 cijferafspraak (3.20), 14 hint-als-vraag of hint die de vraag herhaalt, 23 vragen in `samen` zonder bewaking, 8 stroeve of verklappende zinnen, plus 12 herhalingspatronen.
- Geen rekenfout in een reactie gevonden; geen "Niet helemaal"/pauze/keuzevraag in de nieuwe route; geen naam van het kind in reactie of hint.
- Niet geverifieerd: spreken en afspelen (speelcontrole niet gedraaid), alle regels van alle plekken waar `reactie` meerregelig staat (bij steekproef gelezen), en of de bewaking de 23 `samen`-vragen op het scherm echt laat horen.


## Reacties passen bij vraag en keuze – controle 4 november (onafhankelijk)

Gekeurd door de onafhankelijke controleur (alleen gelezen: geen code gewijzigd, geen speelcontrole, geen Chrome, geen helpers, geen commit, geen betaald tegoed). Getoetst aan BOUWREGELS 3.20, 3.23, 5.1, 5.10 en 5.11 en aan SYNTHESIS-ANALYSE/REACTIES.md. Alle 16 lesbestanden in `src/components/les/lessen/` plus `squla-hulp.ts`, `squla-uitleg.ts` en `squla-splitsen-hulp.ts` zijn bekeken op: `reactie`, `tip`, `hint`, `laatZien`, `toonAntwoord`, `samen`/`uitleg`, goed-bevestiging en de vaste lijstjes. De bestanden zijn nieuwer dan de vorige controle (20:26 tot 20:39): wat de vorige ronde afkeurde (vooral de cijferafspraak "één/twee/drie", `Wij zoeken`, het verklappen in `welkeReactie`, het vaste "Dit is het goede antwoord") is grotendeels opgelost. Dit zijn de rest- en nieuwe punten. Regelnummers kloppen op het moment van keuren. Voorstellen zijn alleen tekst; antwoordwaarden en beoordeling blijven gelijk.

**Wat goed is (alle bestanden):** geen "Niet helemaal", geen pauze en geen keuzevraag in de actieve route; alle 16 lessen roepen `zetSynthesisHulp` aan. Geen naam van het kind in een reactie of hint (alleen in de slotzin: dagen:432, huisnummers:280, rekentaal:558 en `squlaEind` squla-hulp.ts:275, 1 keer per les: toegestaan, 3.17). `opener()` en `laatZienZin()` geven niets terug (5.1-aanvulling nageleefd). Rekenkundig juist en passend bij de gekozen waarde, nagerekend: `somReactie` (plussommen:324-347), `minReactie` (minsommen:212-223), `pzReactie` (piraat:235), `telReactie` (tellen:260-281), `lijnReactie` en rij-reactie (getallenlijn:83-147), `plekReactie` (rekenmix:455), `reactieLees`/`reactieKlokkeuze` (klok:109-131), de dagen/tijd-reacties (dagen:155-336, tijd:318-713) en `KAL1_MIS`/`KAL2_MIS` (tijd:945-957, 1319-1331: de getallen kloppen). Het merendeel van de `...krijgtVervolgvraag`-bewaking staat er nu (dagen 4, klok 8, geld 8, meten 10, getallenlijn 8, plussommen 12, tijd 16 enz.).

### Uitslag per bestand

| Bestand | Uitslag |
|---|---|
| squla-klok | AFGEKEURD (7) |
| squla-tijd | AFGEKEURD (8) |
| squla-dagen | GOEDGEKEURD met 3 opmerkingen |
| squla-geld | AFGEKEURD (5) |
| squla-meten | AFGEKEURD (8) |
| squla-rekentaal | GOEDGEKEURD met 2 opmerkingen |
| squla-tellen | AFGEKEURD (5) |
| squla-meer-minder | GOEDGEKEURD met 2 opmerkingen |
| squla-getallenlijn | AFGEKEURD (7) |
| squla-huisnummers | AFGEKEURD (3) |
| squla-vormen | AFGEKEURD (6) |
| squla-plussommen | GOEDGEKEURD met 4 opmerkingen |
| squla-minsommen | GOEDGEKEURD (1 opmerking) |
| squla-rekenmix | GOEDGEKEURD met 3 opmerkingen |
| squla-piraat | AFGEKEURD (3) |
| squla-splitsen | GOEDGEKEURD met 4 opmerkingen |

### Per bestand

**squla-klok: AFGEKEURD**
- klok:358 en klok:456 tip "Kijk naar de kleine wijzer. Naar welk getal wijst hij?" / "Zoek op de X de kleine wijzer. Naar welk getal wijst hij?" is een vraag in een hint (9) en herhaalt de leesvraag. Voorstel: "Kijk naar de kleine wijzer: waar wijst de punt naartoe?" is ook een vraag; beter als stelling: "Kijk naar het getal waar de punt van de kleine wijzer bij staat."
- klok:389 tip "Is het dan {tijd}?" (vraag in hint, bij Goed/fout-vink). Voorstel: "Vergelijk de tijd die je ziet met {tijd}."
- klok:424 (reactie, laatste zin) "Hoeveel stapjes zijn dat?" is een vraag in de reactie die dezelfde antwoordvraag opnieuw stelt (3.23). Voorstel: "Tel de stapjes van {van} uur naar {tot} uur."
- klok:112 vaste terugvalzin "Kijk nog eens naar de grote en de kleine wijzer." als de gekozen tijd niet te lezen is; zegt niets over de keuze (5.11). Voorstel: noem de keuze: "Je koos {x}. Kijk waar de kleine wijzer staat."
- klok:945 en 977: tweede zin herhaalt de eerste ("Op de klok lees je de tijd af. Broodjes tel je er niet mee." / "Op de klok staat een tijd, geen aantal."). Voorstel: een van de twee zinnen laten vallen.
- Cijferafspraak (3.20): klok:117 en klok:280 "tussen twee getallen" -> "tussen 2 getallen"; klok:806-808 antwoordknoppen "Twaalf uur / Zes uur / Drie uur" en zinnen "De kleine wijzer wijst naar drie ... op twaalf" -> "12 uur / 6 uur / 3 uur", "naar de 3 ... op de 12" (de rest van de les gebruikt al `{3:oranje}`).
- Vaste lijst (8): `BEVESTIG` klok:87, zie "Vaste lijstjes" hieronder. klok:840 `WELKOM_VINK` staat er maar wordt nergens gebruikt (dode code, niet verwijderen zonder akkoord van Sara, regel 3).

**squla-tijd: AFGEKEURD**
- tijd:681 (samen, verhaal "gisteren, zondag"): "Welke wagon hangt vlak voor zondag?" zonder `krijgtVervolgvraag`; het kind mag na de tweede fout niet antwoorden (6, 3.23). Voorstel: `...(krijgtVervolgvraag(l) ? [] : ["Welke wagon hangt vlak voor zondag?"])` of als stelling: "Kijk naar de wagon vlak voor zondag."
- tijd:1235 (goed-bevestiging) eindigt op de vraag "Ken je ook de feestkalender?"; niemand antwoordt (5.10: goed = kort). Voorstel: weglaten of "Er is ook nog een feestkalender."
- tijd:1549 (voorbeeld) "Zie je de boogjes?" is een retorische vraag; het kind kan niets doen. Voorstel: "Kijk, de boogjes."
- tijd:317 tip begint met een vraag: "Welke wagon hangt direct aan de locomotief?" (de reactie zelf, tijd:318, is goed). Voorstel: "De eerste dag hangt direct aan de locomotief."
- tijd:976, 1035, 1378, 1658, 1680, 1702, 1905, 1940, 1991, 2038, 2070: het eerste tip-element is een vraag ("Waar staat wat er gebeurt?", "Op welke kalender zie je een hoepel?", "Welke dag begint met wo?", "Wanneer slaap je?", "Wat is met een paar schudjes klaar?", "Waarbij loop je langs de hele bakkerij?", "Wat is het snelst klaar?" enz.). `hint()` (tijd:42) haalt alleen de LAATSTE vraag weg; deze blijft staan in de terugval `m[x] ?? hint(v.tip)` (tijd:60) en bij het hulphandje. Een hint in vraagvorm (9) die de antwoordvraag herhaalt (3.23). Voorstel: de eerste tip als stelling schrijven ("Kijk naar het plaatje helemaal links.", "Denk aan wat maar kort duurt.").
- Cijferafspraak: tijd:473 "zeven wagons", tijd:539 en 738 "de vier dagen", tijd:585 "Zoek de vier dagen", tijd:1605 "drie boeken" -> "7 wagons", "de 4 dagen", "3 boeken". (tijd:413 "één voor één" is een idioom en mag blijven.)
- tijd:255-259 en 290-293 zijn bijna woord voor woord gelijk aan dagen:184-187 en 215-218 ("Dat is X zelf.", "komt niet meteen na", "Na de laatste wagon begint de week opnieuw."): twee lessen met dezelfde reactie. Voorstel: in een van de twee lessen anders formuleren (bijvoorbeeld in tijd de verhaalvorm).
- Vaste lijst: `BEVESTIG` tijd:39 (7 plekken), zie hieronder.

**squla-dagen: GOEDGEKEURD, met 3 opmerkingen**
- dagen:182, 213, 274 en 297 hebben als laatste tip-element de vraag ("Welke dag komt na X?", "Welke dag was het gisteren?"). De reactie (dagen:183-190, 214-220, 275-278) is wel goed en noemt wat het kind koos; de vraag-tip komt alleen bij hulphandje/terugval. Voorstel: als stelling ("Kijk naar de wagon direct achter X").
- dagen:35 `BEVESTIG` + dagen:131: alle 8 goedZin-functies beginnen met "Goed zo." en dat wordt via `wissel` een van 6 woorden (zie Vaste lijstjes).
- dagen:184-187/215-218 bijna gelijk aan tijd (zie tijd).

**squla-geld: AFGEKEURD**
- geld:1015 (voorbeeld in welkom) "Hoeveel is dat bij elkaar?" wordt gesteld en meteen daarna uitgelegd ("Dan tel je het geld samen."): dezelfde vraag staat ook al in de welkomtekst (geld:1013). 3.23: vraag 1 keer. Voorstel: de vraag in 1015 weglaten ("Voor het vegen krijg je 1 euro. Voor de planten krijg je ook 1 euro. Dan tel je het geld samen."). geld:873 idem controleren.
- geld:1045 tip "Kun je de spullen op de kraam kopen?" is een vraag in een hint; de reactie (geld:1046) is wel goed. Voorstel: "Op een kraam kun je spullen kopen."
- geld:795 en 820: "Is de som meer dan 9 euro, dan heb je te weinig." is een stroef voorwaardelijk zinnetje; het lijkt een vraag. Voorstel: "Als de som meer is dan 9 euro, dan heb je te weinig." (een "Is ...?"-vorm zou een vraag zijn). De woorden "Je zei ja." noemen is goed.
- geld:243 `noem` "Die twee" (alleen als `noem` voor de bewaking, niet gesproken): goed.
- geld:1222 goedZin "twee briefjes van 5 euro" -> "2 briefjes".
- Vaste lijst: `BEVESTIG` geld:54 (4 plekken: 247, 315, 385, 484).

**squla-meten: AFGEKEURD**
- meten:1041 `woordVraag`-reactie is voor alle 6 woordvragen dezelfde vorm: "Het woord {x} hoort hier niet bij." + de eerste uitleg-zin die geen vraag is. Dat is niet altijd een hint: meten:1147 "Het tegenovergestelde is het omgekeerde." (geen hulp), meten:1319 "Er gaat iets uit de tas." (zegt niets over "zwaarder"), meten:1229 "De mand weegt veel." (bij de keuze "kort"/"dun" niets). Voorstel: per woord een eigen zin: bij "zwaarder" (meten:1319): "Zwaarder is meer, maar de tas weegt nu minder."; bij "kort" (meten:1229): "Kort gaat over lengte, niet over gewicht."
- meten:1148, 1239, 1252, 1277, 1339 tip met een vraag als eerste element ("Er kan niets meer bij. Hoe heet dat?", "... Weegt hij nu meer of minder?", "Wat weegt het minst?", "Wat is het grootst en weegt het meest?", "Wat weegt het meest?"): `hint()` (meten:47) haalt alleen de laatste vraag weg. Voorstel: stelling ("Het lichtste weegt het minst.").
- meten:1218, 1221, 1227, 1230, 1348: tip "Iets wat veel weegt, is ..." eindigt op "..." en klinkt voorgelezen als een zin zonder einde (de vraag verstopt). Voorstel: "Zoek het woord voor iets wat veel weegt."
- meten:927 en 929 "Eén olijf, of een grote schaal vol olijven?" / "Eén olijf is heel klein en licht." -> "1 olijf" (3.20, hoeveelheid; "op één lijn" in 435, 462, 463, 481, 513, 553 is idioom en mag blijven).
- meten:404 "Die twee kloppen niet." -> "Geen van de 2 klopt."
- meten:61 `jouwKeuze` (3 openingen die in rekentaal:192 terugkomen), zie Vaste lijstjes.
- Vaste lijst: `BEVESTIG` meten:44 (5 plekken: 174, 218, 257, 330, 393).

**squla-rekentaal: GOEDGEKEURD, met 2 opmerkingen**
- rekentaal:192 `wissel("rekentaalkeuze", ["Jij tikte op X.", "Op dat plaatje staat X.", "Je wijst naar X."])`: dezelfde soort als meten:61; goed voor deze vraag, maar wel een lijstje (3 stuks). Mag, mits Sara akkoord geeft.
- rekentaal:32 `BEVESTIG` (5 woorden) is dezelfde lijst als in de andere lessen. De reactie bij fout (rekentaal:389-491) is per keuze geschreven en rekenkundig juist ("Dit is niet het langste broodje." / "Die mand is de kleinste.").

**squla-tellen: AFGEKEURD**
- tellen:406 reactie: "Dat is 1 meer dan je zei. Welk getal zei je als laatste?" is een vraag in de reactie die dezelfde keuzevraag nog eens stelt (9 en 3.23). Voorstel: "Je koos 8. Dat is 1 meer dan het laatste getal dat je zei." (de hint staat al in `hint:`).
- tellen:269, 273, 278, 279: reacties eindigen op een vraag ("heb je een losse X niet meegeteld?", "heb je een X overgeslagen?", "heb je een X dubbel geteld?", "is er een X blijven staan?"). Retorische vragen waar het kind niet op kan antwoorden (9). Voorstel: als stelling: "Misschien heb je een losse X niet meegeteld."
- tellen:273 "Er liggen er 1 meer" is geen goed Nederlands. Voorstel: "Er ligt er 1 meer" of "Je mist er 1."
- Cijferafspraak: tellen:343 "Vijf streepjes zijn een groepje." -> "5 streepjes"; tellen:424 "Zoek steeds twee dezelfde. Tik op twee kaartjes." -> "2 dezelfde ... 2 kaartjes".
- Vaste lijst: `OPEN_GOED` tellen:194 (2 plekken: 313, 1020).

**squla-meer-minder: GOEDGEKEURD, met 2 opmerkingen**
- meer-minder:482 `tipKaart` (twee kaarten) "Welk getal is groter/kleiner?" blijft een vraag in een hint, dezelfde vraag als de opgave (9, 3.23). Voorstel: "Kijk welk van de 2 getallen groter is."
- Vaste lijst: `OPEN_GOED` meer-minder:170 (4 plekken: 386, 387, 433, 508). De reacties zelf (meer-minder:476-492) noemen de gekozen kaart en zijn juist.

**squla-getallenlijn: AFGEKEURD**
- Vragen in een reactie of hint (9, 3.23): getallenlijn:86 "Lees de cijfers nog eens: welk cijfer staat voorop?"; 141 "Staan de cijfers wel in de goede volgorde?" (zelfde idee ook huisnummers:174); 314 "Welk getal is het kleinste van wat nog over is?"; 315 "Je zette X vooraan. Is er een kleiner getal?"; 428 en 462 "Het streepje voor het raketje is X. Wat komt daarna?". Voorstel: 86: "Lees de cijfers nog eens: kijk welk cijfer voorop staat."; 141: "Kijk of de cijfers in de goede volgorde staan."; 314: "Zoek het kleinste getal van wat nog over is."; 315: "Je zette X vooraan. Er is een kleiner getal."; 428/462: "Het streepje voor het raketje is X. Tel 1 verder."
- Bijna verklappend (2): getallenlijn:133 (zie ook 857) "Kijk naar de ster met 7. Tel 1 verder." geeft bij afstand 1 het antwoord vrijwel weg; getallenlijn:773/799 "Tel in sprongen van 5 vanaf het midden: 10, 15." laat bij raketje op 20 maar 1 sprong over. Advies: bij afstand 1 alleen "Kijk naar de ster met 7." en bij 773 alleen "Tel in sprongen van 5 vanaf het midden."
- getallenlijn:37 `TELWOORD` (met "één", "twee", ...) staat er nog maar wordt niet gebruikt (`Telwoord` geeft cijfers). Dode code; niet verwijderen zonder akkoord van Sara (regel 3).
- Vaste lijst: `OPEN_GOED` getallenlijn:73 (16 plekken met `bev()`), 36 keer "Je koos X.".

**squla-huisnummers: AFGEKEURD**
- huisnummers:121 tipZin (terug) "Je liep terug tot X. Welk nummer is 1 minder?" en huisnummers:123 (slepen) "Links van de lege plek staat X. Welk huis past daarna?" zijn vragen in een hint en stellen de opgave nog eens (9, 3.23). Voorstel: "Je liep terug tot X. Tel 1 terug." en "Links van de lege plek staat X. Tel 1 verder."
- huisnummers:174 reactie "Staan de cijfers wel in de goede volgorde?" -> "Kijk of de cijfers in de goede volgorde staan."
- Opmerking: tipZin voor na/voor/tussen (huisnummers:118-124) is "Het laatste huis is 23. Tel 1 verder." en dus bijna het antwoord. Past bij de leeftijd, maar het is geen echte hint meer. Sara beslist.
- Vaste lijst: `OPEN_GOED` huisnummers:99 (1 plek: 229).

**squla-vormen: AFGEKEURD**
- vormen:189 de terugval-reactie is een vaste zin "Je koos X. Dat past hier niet." en zegt niets over waarom (5.11 punt 1). Zelfde patroon in vormen:402, 514, 542, 663, 702, 739, 773, 805, 836, 1261 ("Die komt nu niet / hoort niet bij de pijl / past niet bij de kleuren"). Dat zijn 10 zinnen met dezelfde constructie, zonder uitleg. Voorstel: per vraag zeggen wat er klopt: bv. 514: "Je koos de bloem. Na de pijl komt het ding dat steeds om en om terugkomt."; 702: "Het vlak tegenover het lege vlak is groen."
- Vraag in de hint (9, 3.23): vormen:516 "Welk ding komt in het patroon daarna?", 544 "Welke vorm kwam eerder na die vorm?", 641 "Welke kleur mist daar?", 665 "Welke kleur ligt in de hoek tegenover de lege plek?", 704 "Welke kleur heeft dat vlak?", 807 "Welke kleur van het patroon ontbreekt daar?", 1163 "Waar ligt de stip?". Ze worden achter de reactie gezet (vormen:189 plakt de hele `tip` achter de reactie) en stellen dus de opgave een tweede keer. Voorstel: de laatste tip-zin weglaten of als stelling ("Kijk welke kleur daar mist.").
- vormen:438-439 reactie bij de kralenketting heeft 2 vragen achter elkaar: "Welke kraal komt daarna?" en "Welke kraal volgde daarop?" en is daarmee 100 procent de opgave. Voorstel: "De eerste 2 kralen kloppen. Zoek in de ketting waar rood eerder lag en kijk wat daarna kwam."
- vormen:409-410 hint "welke kraal volgde daarop?" / "welk stukje komt steeds terug?" in vraagvorm.
- vormen:1261 "Je koos: {hele zin}. Die zin past niet bij het plaatje." leest een hele zin voor. Voorstel: "Die zin past niet bij het plaatje."
- Vaste lijst: `OPEN_GOED` vormen:86 (6 plekken via `zegGoed`), 22 keer "Je koos X.".

**squla-plussommen: GOEDGEKEURD, met 4 opmerkingen**
- plussommen:346 "Je telde te ver door." staat in 3 van de 4 taferelen (bakkerij, typ, bus) en is dus een vast zinnetje; plussommen:345 "Bij een plussom wordt het meer." staat 2 keer in de lijst. Voorstel: per tafereel een eigen zin (voor bus: "Zoveel pakjes liggen er niet.").
- plussommen:344 "Met X haal je Y pakjes uit de Z weg." en plussommen:347 "Je typte X: dat is nog te weinig pakjes." zijn niet vloeiend. Voorstel: "Met X haal je Y van de Z af." en "Je typte X: dat zijn er nog te weinig."
- Cijferafspraak: plussommen:307 "Zet die twee bij elkaar." -> "Zet die 2 bij elkaar."; plussommen:874 "Die twee vullen de rij ..." -> "Die 2 ...". (plussommen:1155 "tot twintig" in de eindzin: naam van een bereik, mag; Sara beslist.)
- De reacties plussommen:324-347 zijn verder per keuze geschreven en juist.

**squla-minsommen: GOEDGEKEURD (1 opmerking)**
- minsommen:670 "Slim gerekend!" staat in de goed-zin van de euro-vraag; prima, maar controleer dat de zin in geen andere les letterlijk terugkomt (script `check-zinnen-herhaling.cjs`).
- Verder goed: `minReactie` benoemt het antwoord van het kind ("alsof er 3 bij komen", "zoveel gaan er weg"), de hint verklapt niets. `welkeReactie` (minsommen:369, 651) verklapt het getal niet meer.

**squla-rekenmix: GOEDGEKEURD, met 3 opmerkingen**
- rekenmix:784 tip "Tel vanaf links: eerste, tweede, derde ..." de puntjes worden bij het voorlezen een stilte. Voorstel: "Tel vanaf links: eerste, tweede, derde."
- rekenmix:1603, 1820, 1856, 2040, 2073 welkomzinnen "Drie dingen / Vijf dingen / Drie ballen / Drie groepjes" -> cijfers (3.20), of laten vervallen als de beginzin uit `beginzinnen` ze toch vervangt.
- rekenmix:1343 en 1366 geven twee keer dezelfde hint "Tel tot 3. De 3e ballon staat in het midden." (reactie én tip); is toegestaan, maar de reactie noemt al wat het kind koos; laat de hint 1 keer vallen.

**squla-piraat: AFGEKEURD**
- piraat:507 "Je koos: {hele zin in kleine letters}." (raadselTekst) leest een hele zin hardop als reactie; bij hoofdletters en namen klopt de kleine letter niet (punt van de vorige ronde, nog open). Voorstel: "Die zin past niet bij het plaatje." + `waarom`.
- piraat:250 `tegelAntwoord` begint altijd met "Zo klopt het:" (2 plekken). Voorstel: begin meteen met de som.
- piraat:313-316 reactie is goed (noemt het aantal en "te veel"); `pzReactie` is juist.

**squla-splitsen: GOEDGEKEURD, met 4 opmerkingen**
- splitsen:893 reactie heeft 3 zinnen waarvan de middelste ("Dat is niet in elk bakje evenveel.") weinig toevoegt. Voorstel: weglaten (max. 2 zinnen).
- splitsen:1076 en 1143 derde zin "In het paarse vak horen X ballen." herhaalt de opdracht (die in de vraag staat). Voorstel: weglaten of het getal laten staan in de tip, niet in de reactie.
- Cijferafspraak (welkomzinnen): splitsen:1468 "in twee stukken / in twee vakken", 1586 "tien en vier munten", 1676 "twee bakjes" -> "2", "10 en 4". (splitsen:1618 "tot twintig" in de eindzin: naam van een bereik.)
- De overige reacties (splitsen:476-622, 699, 945, 1200, 1309, 1375) zeggen wat het kind sleepte of koos en rekenen goed.

### Vaste lijstjes en standaardzinnen (punt 8, 5.10 en 5.11)

| Lijst of constante | Bestand:regel | Gebruik |
|---|---|---|
| `BEVESTIG` ("Goed zo.", "Precies.", "Dat is 'm.", "Ja, dat klopt.", "Mooi gedaan.", "Zo is het.") | dagen:35, geld:54, meten:44, tijd:39 (identiek, 6 woorden); klok:87 (zelfde met "Mooi."); rekentaal:32 (5 woorden) | dagen via `goed()` bij alle 8 vraagsoorten (dagen:131), geld 4, meten 5, tijd 7, klok 5, rekentaal 1 = ruim 30 plekken in 6 lessen. De bijbehorende `goedZin` begint in dagen steeds met "Goed zo." (dagen:144, 167, 198, 229, 261, 289, 309, 327) |
| `OPEN_GOED` ("Heel goed!", "Mooi gezien!", "Perfect!", "Slim gedaan!", "Ja!", "Goed zo!", "Prima!", "Dat klopt!", "Netjes!"), 40 procent leeg | huisnummers:99, meer-minder:170, vormen:86, getallenlijn:73, tellen:194 (alleen 1 woord verschilt: "Mooi gezien/gekeken/geteld") | huisnummers 1, meer-minder 4, vormen 6, getallenlijn 16, tellen 2 = 29 plekken in 5 lessen |
| `jouwKeuze` ("Daar staat X." / "Dat plaatje laat X zien." / "Bij jouw plaatje zie je X.") | meten:61 | 2 plekken (meten:61 en de aanroep in `plaatjesVraag`/`wijsVraag`, ca. meten:191), alle plaatjesvragen van meten |
| `rekentaalkeuze` ("Jij tikte op X." / "Op dat plaatje staat X." / "Je wijst naar X.") | rekentaal:192 | 1 plek, wel dezelfde soort als meten:61 |
| Terugval "Je koos X. Dat past hier niet." en "Die komt nu niet / hoort niet bij" | vormen:189 en 402, 514, 542, 663, 702, 739, 773, 805, 836, 1261 | 11 plekken, dezelfde constructie |
| "Je koos X." als opening | getallenlijn 36, tellen 25, vormen 22, meer-minder 8, minsommen 7, plussommen 6, rekenmix 5, huisnummers 3, geld 2, tijd 2, piraat 1, meten 1 (+ "Je tikte/typte/sleepte": meer-minder 10, plussommen 11, piraat 7) | 120+ plekken, in 12 lessen |
| "X is te veel / te weinig" | splitsen 8, geld 10, piraat 6, rekenmix 5, plussommen 5, tellen 5, meten 4, meer-minder 2, minsommen 2 | 47 plekken in 9 lessen (vorige ronde: 20) |
| `squla-hulp.ts`: "Mooi. Laat maar eens zien." (251), de 4 openingen `start` (255, per les vast gekozen), "Nu ga je verder met oefenen." (259), "Geen probleem. Ik leg het kort uit." (262), "Nu jij!" (264), "Alles goed!"/"Goed gewerkt!" (275) | squla-hulp.ts | in elke les hetzelfde: begin Ja, begin Nee en einde. Dit is de les-opbouw, geen reactie; toch een standaardzin in alle 16 lessen. Sara beslist of dit zo blijft |
| `STANDAARDZINNEN` | squla-hulp.ts:206 | alleen een controle op het beginscherm, geen kindzin |
| Oude route "Nog niet helemaal. We bekijken deze stap samen." / "Zullen we even pauze nemen?" | squla-uitleg.ts:116, 128, 130; squla-hulp.ts:111-144 | niet bereikbaar zolang `zetSynthesisHulp` of `synthesis: true` staat (nu in alle 16 lessen). Niet verwijderen zonder toestemming (regel 3); wel melden |
| `klok:840 WELKOM_VINK` | klok:840 | 0 keer gebruikt |

Voorstel: laat `BEVESTIG` en `OPEN_GOED` per les eigen woorden krijgen (bijv. dagen: "Dat is de goede dag.", klok: "Die tijd staat op de klok.", geld: "Dat bedrag klopt.") of laat de goed-zin zonder opening beginnen, zoals bij Synthesis (REACTIES.md: "Goed: één woord of één korte zin; het waarom zit in het beeld"). `scripts/check-zinnen-herhaling.cjs` ziet deze lijsten niet, omdat de woorden uit een array worden gekozen en niet als vaste zin in de code staan.

### Aantallen afkeuringen per categorie (zinnen/plekken)

| Categorie | Aantal |
|---|---|
| (1) reactie noemt de keuze niet of klopt niet bij de vraag | 16 (vormen 11, meten 5 [woordVraag + 1 mand], klok 1 [112]) |
| (2) hint verklapt het antwoord bij de 1e fout (let op, geen harde afkeur) | 7 (getallenlijn 133/857/773/799, huisnummers 118-124, splitsen 1076/1143) |
| (3) 2e fout legt het goede antwoord niet uit | 0 (steekproef; niet alle `toonAntwoord` gelezen) |
| (4) grammatica, kindertaal, te lang | 12 (tellen 273, plussommen 344/347, geld 795/820, piraat 507, vormen 1261, rekenmix 784, splitsen 893, vormen ~690, meten 1218-1348 als "is ..." tellen onder 9) |
| (5) cijferafspraak 3.20 | 29 (klok 6, tijd 5, geld 1, meten 2, tellen 2, plussommen 2, rekenmix 5, splitsen 3, getallenlijn 1 dode constante, welkom/eind) |
| (6) vraag zonder `krijgtVervolgvraag` na 2e fout | 5 (tijd 681, 1235, 1549, geld 1015, 873) |
| (7) naam in een fout-reactie | 0 |
| (8) vaste lijst/standaardzin (lijsten) | 9 (`BEVESTIG` in 6 lessen, `OPEN_GOED` in 5, `jouwKeuze`/`rekentaalkeuze`, vormen-terugval, "Je koos X.", "te veel/te weinig", `squla-hulp.ts`-zinnen) |
| (9) zin klinkt als vraag in een hint | 58 (tijd 12, meten 10, vormen 9, getallenlijn 6, dagen 4, klok 4, tellen 5, huisnummers 3, geld 2, meer-minder 1, rekenmix 0, plussommen 0, +2) |

Niet geverifieerd: spreken en afspelen (geen speelcontrole), de volledige tekst van alle `toonAntwoord`/`goedZin`-regels (bij steekproef gelezen: dagen, klok, tellen, plus-, min-, piraat, splitsen, rekenmix, meer-minder, huisnummers, getallenlijn, vormen en de MIS-lijsten van tijd), en of `beginzinnen(...)` de `welkom`-zinnen met cijferwoorden in de praktijk vervangt (zie lijst van cijferplekken). Alleen tekstvoorstellen; er is niets in code of database aangepast.

## Gouden les Minsommen (squla-min-machine-1-gouden) — onafhankelijke keuring 10 november 2026

GOEDGEKEURD na 2 kleine herstellingen in de les (uitleg na de 2e fout: woord van de vraag en 2 versies; rondje smaller).
Open bij Sara (gedeeld lesscherm): de eindkaart staat over 1–4 woorden van de laatste zin, ook in Tellen, Splitsen en
Plussommen. Volledig verslag: KEURING-MINSOMMEN-GOUDEN.md en KINDTEST-MINSOMMEN-GOUDEN.md; vragen in KEUZES-VOOR-SARA.md
Ronde 24b. les_uitkomsten: hoogste id 143 voor en na.
