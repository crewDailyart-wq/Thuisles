# Eindkeuring reacties na een fout (5 november 2026)

Gekeurd op BOUWREGELS 3.20, 3.23, 5.11 en SYNTHESIS-ANALYSE/REACTIES.md.
Bron: de uitvoer van de speelcontrole `v2/{goed,fout,nee}` (123 lessen, 16 bestanden) plus de lescode.
Niets aangepast; alleen gelezen (en `check-zinnen-herhaling`, `check-getalwoorden`, `check-cijfertaal`, `check-herhaling` gedraaid).
Gelezen: de fout-uitvoer van ruim 50 lessen (alle 16 bestanden) en de reactiecode van elk bestand.

Beperking: `schermen.txt` toont van een gesproken blok alleen de laatste zin. Waar dat uitmaakte, is de volledige zin uit de code gehaald (bestand:regel erbij).

## Deel 1. De 18 punten uit REACTIES-VERBETERLIJST.md

Uitkomst: 11 opgelost, 6 deels, 1 niet.

| Punt | Status | Bewijs |
|---|---|---|
| H1 "1 blokjes" (min-machine) | OPGELOST | `squla-minsommen.tsx:601` kiest nu "komt er 1 blokje uit"; uitvoer: "Dan komen er 7 blokjes uit". |
| H2 geld-reactie zonder hint, dubbele info | OPGELOST | `squla-geld.tsx:259-273`: "Dit groepje is samen 2 euro. Je zoekt 4 euro, dus je hebt nog 2 euro nodig. Zoek een groepje met meer geld." Ook de 2-groepjes-variant klopt. Uitvoer zakgeld bevestigt dit. |
| H3 hint verklapt antwoord (plus-bakkerij) | OPGELOST | `squla-plussommen.tsx:306`: "Begin bij 4 + 4. Het ene getal is 1 groter dan het andere, dus er komt 1 bij." Geeft het antwoord niet meer. |
| H4 hint verwijst naar stippen die er niet zijn | NIET OPGELOST | Alleen het type `kaal` is gerepareerd (`squla-minsommen.tsx:322-340`, `watHint`). De types `bord` (r. 612, 627) en `disco/typen` (r. 392, 408-410) gebruiken nog `rekenTip(.., "stippen")` en `minReactie(.., "stippen")`. Schermfoto `fout/squla-min-kaal-1/006.jpg`: schoolbord met "8 − 3 = ?", geen stippen, hint "Tel de stippen die over zijn." Raakt de lessen min-kaal-1/2/3 en de disco/typen-vragen in min-ruimte en min-machine. |
| M1 klok: vaste zin "Kijk waar hij naartoe wijst" | OPGELOST | `squla-klok.tsx:113-127, 132-142`: de hint noemt nu de plek van de kleine wijzer ("rechtsonder. Welk getal staat daar?"). Plekken kloppen (k<3 rechtsboven, 3 rechts, 4-5 rechtsonder, 6 onderaan, 7-8 linksonder, 9 links, 10-11 linksboven). |
| M2 klok: weetje na tweede fout | OPGELOST | `squla-klok.tsx:96-100, 376`: tweede fout = `wijzerUitleg` ("De grote wijzer staat op de 12 ... Dus het is 6 uur."). Het weetje staat alleen in `goedZin` van de goedgekeurde les klok-hoelaat-1. |
| M3 rekenmix mix2: tautologie en hint herhaalt vraag | DEELS | `squla-rekenmix.tsx:958-975`: "allerminste" is weg. Maar bij meeste/minste (r. 974-975) staat er alleen een constatering ("Daar zit niet het minste fruit op. Er is er nog 1 met minder.") zonder hint. `woordUitleg` r. 967: "Het plaatje waar bijna niets op zit, heeft het minste fruit" is vaag (bijna niets is niet het minste). Voorstel: "Tel de stukjes op elk plaatje. Het plaatje met de minste stukjes heeft het minste fruit." |
| M4 meten: hints omschrijven de vraag; "tegenovergestelde" | DEELS | Hints zijn goed verbeterd (`squla-meten.tsx:495-581`: "Zet je vinger op de rand van elke pizza..."; r. 1151 "Een lege mand heeft niets erin. Hoe heet het als er juist heel veel in zit?"). Maar het woord "tegenovergestelde" staat nog in de vragen: `squla-meten.tsx:1148, 1232, 1353`, in uitleg r. 1086 en 1150, en in `squla-tijd.tsx:1569-1575, 1631, 1647, 1742` ("Denk aan het tegenovergestelde van kort."). Te moeilijk voor groep 3 (BOUWREGELS 5.11 punt 4). Voorstel: "Wat is het andere woord voor leeg? Er zit juist heel veel in." / "Het is niet kort maar juist heel erg ...". |
| M5 getallenlijn rangschikken/reeks: vaste hint | OPGELOST | `squla-getallenlijn.tsx:296-310` (`ordenVraag`: kiest op wat het kind legde) en `:134-141` (`lijnReactie` met "Je koos / staat al in de rij / sla je over"). Uitvoer toont per les andere zinnen. |
| M6 huisnummers/kat/dieren: hint is bijna het antwoord | DEELS | `squla-huisnummers.tsx:154-168` reageert nu op de keuze ("Het huis met 9 is groter dan 7, maar er hoort een kleiner nummer"). Maar de hint (`tipZin`, r. 105-110) blijft bijna het antwoord ("Links van de lege plek staat 7. Welk nummer past daar direct achter?") en `squla-getallenlijn.tsx:823, 860` ("Kijk naar het getal links van de bal: 12. Welk getal komt daarna?"). Zie ook nieuwe afkeuring 3.23 hieronder. |
| M7 dagen: tautologie | OPGELOST | `squla-dagen.tsx:182-183, 213-214`: "Kijk in de trein naar de wagon van dinsdag. De goede dag hangt er direct achter." |
| M8 splitsen: "past niet ... te weinig" | OPGELOST (1 rest) | `squla-splitsen.tsx:62-65`: "Het moesten er 2 zijn. Er is er 1 te veel." Klopt overal in de uitvoer. Rest: `:533` "Dat past niet in het huisje van 5: het is te weinig." (tegenstrijdig; voorstel: "Samen is dat 4. Het huisje is 5, dus het mist er 1."). |
| M9 sjablonen na tweede fout | DEELS | Opgelost bij tellen (`squla-tellen.tsx:227-249`, per keuze) en meer-minder (`:338-352`). Niet opgelost: minsommen ("Ik zet 8 stippen neer. / Er gaan er 3 weg. / 8 − 3 = 5.", ongewijzigd in alle 16 min-lessen) en rekenmix ("Tel maar mee." `squla-rekenmix.tsx:651`, "We tellen samen, rij voor rij."). Ze zijn bruikbaar als uitleg maar niet gekoppeld aan de fout. |
| L1 klok-digitaal zandloper | OPGELOST | `squla-klok.tsx:890`: "Je koos de zandloper. Die laat zien hoe lang iets duurt, maar hij heeft geen wijzers. Zoek het rondje met 2 wijzers." |
| L2 plus-dansen "blijven stippen over" | OPGELOST | `squla-plussommen.tsx:810, 819`: "De rij van 10 is vol, dus er is 1 stip te veel." / "er missen 2 stippen". Getallen kloppen in de uitvoer. |
| L3 geldmachine: aanloop + vraag herhaald | DEELS | De vraag blijft in beeld, er is geen extra gesproken vraag meer. Maar er is een nieuwe dubbele zin, zie nieuwe afkeuring N1. |
| L4 tijd: gedeelde hint | DEELS | `squla-tijd.tsx:820, 855` zeggen nu "Je koos X." + tip (`jeKoos`). Goed, maar 10 vragen hebben een eigen mis-lijst (`_MIS`) en de rest geeft alleen "Je koos X" + de vaste tip van de vraag (r. 1093, 1349 "Kijk goed welk getal erin staat."). Acceptabel; niet echt per fout geschreven. |
| L5 meer-minder: "Kijk goed." zonder inhoud | OPGELOST | `squla-meer-minder.tsx:284-290`: nu "Let op, nu gaat het niet om evenveel, maar om meer." / "Nu zie je 4 kaarten." Het zijn aanlopen bij een nieuwe vraag, geen reacties op een fout. |

## Deel 2. Nieuwe afkeuringen

Per categorie, met bestand:regel, de zin en een voorstel.

### N1. Dubbele zin in een fout-reactie (cat. 5 en 3.23)
- `squla-geld.tsx:267` + `waarZie` r. 589-591 (geld-geldmachine-1/2, Waar zie je een munt/briefje van ...?).
  `o.reactie(k)` geeft al `["Dit is een munt van 2 euro.", "Zoek de munt met een 1 erop."]` en daarna voegt r. 267 `hint(o.tip).slice(0, 1)` toe, en `tip` is precies dezelfde zin. Het kind hoort twee keer "Zoek de munt met een 1 erop." Uitvoer: schermfoto-tekst eindigt op "Zoek de munt met een 1 erop. Hier ligt wat geld...".
  Voorstel: in `waarZie` de tweede zin uit `reactie` halen (of `.slice(0,1)` weglaten als `o.reactie` al de hint bevat). Verder is de hint zelf de vraag in andere woorden ("Zoek de munt met een 1 erop" voor "Waar zie je een munt van 1 euro?"). Beter: "Een munt van 1 euro heeft een 1 erop en is zilver in het midden."

### N2. Grammatica (cat. 4)
- `squla-minsommen.tsx:225`: "Je koos 16: alsof er 1 bij komen." Bij b = 1 moet het "komt" zijn. Zichtbaar in uitvoer min-ruimte-2 ("alsof er 1 bij komen"). Voorstel: `${b === 1 ? "komt" : "komen"}`. Regel 219 heeft altijd "komt" ("alsof er 3 bij komt"); maak beide hetzelfde.
- `squla-rekenmix.tsx:637`: "Je koos 6: er zijn er meer appels." Dubbele "er". Voorstel: "Je koos 6: er zijn meer appels."
- `src/lib/lessen/tekstwijzigingen.json:23` (splitsen2-1): "Welk getal mist er nog." staat zonder vraagteken. Voorstel: "Welk getal mist er nog?"
- `squla-vormen.tsx` (patronen, hint "Zoek roze eerder in de ketting ..."): "Zoek roze eerder" klinkt onnatuurlijk. Voorstel: "Zoek de roze kraal eerder in de ketting en kijk welke kraal daarna kwam."
- `squla-meer-minder.tsx:338-339`: "Je telde al tot 10." terwijl Bliepo (niet het kind) tot 10 telde. Voorstel: "Ik heb al tot 10 geteld."; zo zegt `squla-tellen.tsx` het al.

### N3. Hint helpt niet / herhaalt de vraag (cat. 2)
- `squla-rekentaal.tsx:248, 264, 345, 362`: "Let op welke pannenkoek breder is." / "Kijk welke beker het smalst is." / "Kijk welke sliert verder doorloopt." zeggen hetzelfde als de vraag. Voorstel: noem hoe je het ziet: "Leg ze naast elkaar: de pannenkoek met de rand het verst weg is breder."
- `squla-dagen.tsx:178, 211` tip: "Zoek de dag die na dinsdag komt." = de vraag zelf (de eerste zin van de tip is wel goed).
- `squla-vormen.tsx` (orienteren), uitvoer: "Helemaal rechts is de andere kant." zegt niet wat het kind nu moet zien. Voorstel: "Je koos de ballon helemaal links. Kijk naar de ballon aan de andere kant: helemaal rechts."
- Rekenmix, uitvoer mix1: "Je hebt al 5 geteld." (`:635`) zegt dat het kind telde; het was Bliepo. Voorstel: "Ik heb al 5 voor je geteld."

### N4. Vraag dubbel vóór dezelfde antwoordpoging (3.23)
De hint herformuleert de vraag als nieuwe vraag, direct voor dezelfde poging:
- `squla-getallenlijn.tsx:127-128` (terugtellen/reeksen): vraag "Welk getal hoort op de puntjes?", hint-eind "Welk getal zeg je daarna als je terugtelt?" (zichtbaar in uitvoer getallenlijn-terugtellen-1, 14 keer). Idem r. 823, 860 ("... Welk getal komt daarna?").
- `squla-huisnummers.tsx:106-110` (`tipZin`): "Tel hardop tot 7. Welk nummer zeg je daarna?" na de vraag "Welk huisnummer komt na 7?".
Voorstel: de hint zonder vraag, als aanwijzing: "Het huis voor de lege plek heeft nummer 7. Tel 1 verder." (of bij 3.23: de vraag mag opnieuw, maar niet in andere woorden). Dit is een Synthesis-voorbeeldles (huisnummers); Sara moet kiezen.
Controle `scripts/check-herhaling.cjs` loopt nu ook vast (`vraag slechts 1 keer per antwoordpoging`, vormen-patronen-1): de test verwacht nog de oude flow en moet worden bijgewerkt, anders waarschuwt hij niet meer.

### N5. Standaardzinnen in veel lessen (5.11 punt 7)
`check-zinnen-herhaling` meldt 6 zinnen met meer dan 2 keer ("Kun je dit al?" 4x, "We doen het samen, stap voor stap." 3x, "Typ het getal." 3x, "Hoe laat is het?" 3x, "Op welke klok is het # uur?" 3x, "Ze zijn even groot." 3x). Daarbij vind ik in de uitvoer, niet door het script gemeld:
- "Nu komen er nog 3 vragen van net terug." in 19 lessen (`squla-geld.tsx:135`, `squla-meten.tsx:83`, `squla-tijd.tsx:87`, `squla-klok.tsx:739`). Voorstel: noem de les of vorm, bv. "Nu komen de 3 vragen over de klok nog een keer."
- Klok-uitleg: "Kijk nu naar de kleine wijzer." (10x), "Dan is het een heel uur." (10x), "Kijk waar de kleine wijzer naartoe wijst. Dat getal vertelt welk uur het is." (9x) in `squla-klok.tsx` (samen-uitleg, o.a. r. 816).
- Hints: "Tel de stippen die over zijn." (10x), "Tel de pakjes die nog in de bus liggen." (6x), "Tel bij elk streepje 1 verder." (5x), "Tik met je vinger op de rest en tel verder." (5x), "Welk getal zeg je het eerst als je telt? Dat getal komt vooraan." (4x), "Tel daarna door tot het laatste." (rekenmix, 24x), "Tel vanaf links, tot je bij de goede plek bent." (rekenmix mix3).
Geen van deze komt bij elke fout vooraan, maar het is wel hetzelfde sjabloon in veel lessen. Voorstel: de hint laten noemen wat in die vraag staat (het getal, het voorwerp, de plek).

### N6. Hoeveelheden met cijfers (3.20)
- `squla-meer-minder.tsx:346-347`: "Misschien sloeg je er een over." / "telde je er een dubbel." Hier is "een" een hoeveelheid. Voorstel: "sloeg je er 1 over", "telde je er 1 dubbel".
- `squla-tellen.tsx:181`: "zo raak ik er niet een kwijt". Voorstel: "zo raak ik er geen 1 kwijt" of "zo raak ik er geen kwijt".
- Laag, twijfel: "één voor één" en "op één lijn" (`squla-meten.tsx:460, 461, 479, 511, 551, 634`; `squla-klok.tsx:816`; `squla-piraat.tsx` "één voor één"). Dit zijn vaste uitdrukkingen, geen hoeveelheid; ik keur ze niet af, maar Sara kan kiezen voor "1 voor 1" / "op 1 lijn".
- `check-cijfertaal` en `check-getalwoorden` gaven geen echte fouten (de 4 meldingen zijn "Die twee" en `w(...)` in code, niet zichtbaar).

### N7. Reactie ontbreekt of past niet bij vraag (cat. 1)
- `squla-minsommen.tsx:392-410, 612-628` (zie H4): hint en reactie ("Je koos 11, maar er blijven minder stippen over") over stippen die niet in beeld zijn. Voorstel zonder beeld: "Je koos 11. Bij min wordt het minder, dus het antwoord is kleiner dan 8. Begin bij 8 en tel 3 terug." (zoals `rekenTip` al doet bij `wat === ""`).
- `squla-rekenmix.tsx:974-975` (meeste/minste): alleen constatering, geen hint (5.11 punt 2). Voorstel zie M3.
- `squla-vormen.tsx` (opruimen): "Hier liggen schoenen." zegt wat het kind koos maar geeft geen hint. Voorstel: "Hier liggen schoenen. Zoek het plaatje waar alleen broeken liggen."

### N8. Hint verklapt het antwoord (cat. 2)
Geen echte verklapper gevonden. Wel bijna: `squla-plussommen.tsx:306` (zie H3, nu goed), `squla-huisnummers.tsx:110` en `squla-getallenlijn.tsx:823` (de getallen links ervan noemen is bijna het antwoord; mag als tweede hint, niet als eerste).

### N9. Tweede fout legt niet uit waarom (cat. 3)
Geen nieuwe afkeuring. De tweede fout legt overal uit met het beeld (klok `wijzerUitleg`, geld "2 euro en 2 euro is samen 4 euro.", tellen `telRest`, getallenlijn `lijnWaarom`). Splitsen en minsommen zeggen alleen de uitkomst (zie M9). Niet te toetsen: de tweede fout bij slepen/tikken (de speelcontrole raakte daarna goed).

### N10. Naam van het kind in een fout-reactie
Geen enkele gevonden. Naam komt alleen voor in `bevestig()` en in de eindkaart.

## Deel 3. Goed-bevestigingen

- Kort en past overal: GOEDGEKEURD. Alle bevestigingen komen uit de gedeelde lijst (`squla-uitleg.ts:59-62`): "Klopt.", "Precies.", "Dat is 'm.", "Ja!" enz. Verdeling uit 123 goed-runs: 99x "Dat is 'm." tot 26x "Ja!"; nooit twee dezelfde achter elkaar (`wissel`). Eén ding om te overwegen: "Dat is 'm." is informeel (kan voor kinderen prima).
- Uitzonderingen met langere goed-zin (bewust goedgekeurd): klok-hoelaat-1 ("Goed zo." + het is ...), dagen, rekentaal, huisnummers, vormen-opruimen.
- Naam hoogstens 2x per les: AFGEKEURD (deels). In de bevestigingen blijft het bij 2 (max gemeten: 2; 90 van 123 lessen halen die 2, 26 hebben 1, 7 hebben 0). Maar de eindkaart voegt een derde toe: `squla-hulp.ts:274-275` ("Alles goed, Testkind!" / "Goed gewerkt, ...") en `squla-dagen.tsx:430`, `squla-huisnummers.tsx:268`, `squla-rekentaal.tsx:556`. De speelcontrole liet de eindkaart niet zien, dus in de uitvoer staat dit niet. Het gevolg: tot 3 keer de naam per les. Voorstel: de eindkaart zonder naam als `bevestig()` de naam al 2x gebruikte (`naamGebruikt` is al beschikbaar), of de kans van 18% naar 10% verlagen. "Af en toe" is ook niet waar als 73% van de lessen de volle 2 haalt; 10% past beter.

## Niet kunnen verifiëren
- Welke zinnen hardop klinken (STEMZINNEN.md niet vergeleken).
- De tweede fout bij slepen/tikken; en de eindkaart (niet in de uitvoer).
- Of de dubbele zin in N1 ook echt tweemaal wordt uitgesproken (alleen uit de code, niet uit de uitvoer, omdat de uitvoer de laatste zin toont).
