# FOUTEN-VOORBEELDEN — fouten die Sara vond in de lessen

Elke fout die Sara vindt komt hier, met de regel die erbij hoort (BOUWREGELS.md 14.30 t/m 14.35). Bijgewerkt op 8 november 2026 (derde ronde) naar de nieuwe 14.30 en 14.32. We gebruiken dit lijstje bij het lesrecept en bij de logica-controle van alle lessen (plan: SQULA-VOORTGANG.md). Nog niets aan de lessen veranderd; dit zijn voorbeelden, geen reparaties.

**F1. Broeken, schoenen en shirt (opruimen).**
- Wat mis is: de hint "Op het goede plaatje ligt niets anders erbij" past op twee vakken (alleen schoenen én alleen broeken). Tijdens de hint was niet meer te zien of te horen waar de vraag over ging. De zin is te abstract voor groep 3.
- Volgens de nieuwe 14.32 (2e ronde) mag de vraag bij een keuzevraag tijdens de hint weg, maar dan moet de hint zelf zeggen waar het over gaat ("Je zoekt de plek met alleen broeken.") en komt de vraag terug als het kind opnieuw kiest. Bij een opdracht blijft de opdrachtregel staan.
- Regels: 14.31 (hint wijst naar één keuze), 14.32 (keuzevraag: vraag weg tijdens de hint, maar het kind weet waar het over gaat; opdracht: regel blijft staan), 14.33 (eenvoudige taal).

**F2. "Zoek 2 plaatjes waar allebei hetzelfde soort ding op staat".**
- Wat mis is: de zin is te moeilijk voor groep 3, en er zijn twee goede antwoorden (de boeken én de blokjes), terwijl de les er maar 1 goed rekent.
- Regels: 14.30 (kwaliteitsregel 9: één juist antwoord, óf alle juiste antwoorden worden goed gerekend; hier geen van beide), 14.33.

**F3. Weektrein "Welke dag was het gisteren?".**
- Wat mis is: alleen een pijl boven woensdag is niet duidelijk genoeg.
- Wat er moet komen: een bordje "Vandaag", de wagon van vandaag valt op, en de vraag zegt "Vandaag is het woensdag."
- Regels: 14.31 (wat het scherm laat zien klopt met de vraag), 14.33.

**F4. Vormen-opruimen: potloden.**
- Wat mis is: de potloden stonden raar rechtop op de plank.
- Regels: 1.24 en 14.23 (kijk als een kind: staat het zoals in het echt?). Bij de herbouw van 8 november liggen ze plat.

**F5. Bliepo zegt "groepen".**
- Wat mis is: Bliepo zegt "groepen" terwijl hij antwoorden of plaatjes bedoelt, en er zijn twee goede antwoorden terwijl de les er maar 1 goed rekent. "Groepen" is onduidelijk voor een kind van 6.
- Regels: 14.30 (kwaliteitsregel 9: één juist antwoord, óf alle juiste antwoorden worden goed gerekend), 14.33 (zeg "plaatje" of "vakje").

**F6. Klok-klokkijken-1: "Luister naar de tijd".** (8 november 2026)
- Wat mis was: de beginzin zei "Luister naar de tijd en controleer of die bij de klok past", maar het kind moet kijken (de tijd staat op het scherm).
- Gecontroleerd in alle Squla-lessen (alle beginzinnen en lesteksten op "luister" en "hoor"): geen andere les met dit werkwoord op de verkeerde plek. Opgelost in 1 les (zin staat nu "Kijk naar de tijd ...").
- Regel: BOUWREGELS.md 14.35.

**F7. Gouden klokles: dezelfde tekst verdwijnt en komt opnieuw terug met een pijl.** (10 november 2026)
- Wat mis was: een zin van Bliepo kwam in beeld, leek te verdwijnen (gedimd) en kwam daarna precies hetzelfde terug, nu wit en met de pijl. Bliepo sprak de zinnen bijna niet uit en de les ging door zonder klikken.
- Oorzaak: in lib/stem.ts brak `meld(true) → stopKeuzeStem() → speechSynthesis.cancel()` Bliepo's eigen zin 1–3 ms na de start af (gemeten: 0 van 109 zinnen helemaal uitgesproken). De zin telde dan als klaar, de tekst bleef gedimd ("nog niet gezegd") en werd pas na 2,5 s wit. Zonder tik van het kind weigerde Chrome het geluid ("not-allowed").
- Regel: een zin is pas klaar als hij echt is uitgesproken (of na de leestijd als de stem niets zegt); een tekst komt maar 1 keer in beeld. Zet in gouden lessen `stemHeelUitpraten: true` aan (BOUWREGELS 15.27 punt 5, 15.28). Test met de F7-meter (tekst + gedimd/wit + pijl, elke 50–100 ms) en het stem-logboek in een zichtbare Chrome met de echte stem.
- Gecontroleerd in de andere gouden lessen (alleen gemeten, niet veranderd): zie KEUZES-VOOR-SARA.md Ronde 23c.
- Nog een vorm (Ronde 28b punt 9; opgelost 11 november 2026, Ronde 30): een zin werd wit en daarna weer grijs als de site er langer dan 2,5 s over deed om te zeggen of Ruth de zin heeft. Nu blijft een witte zin wit in alle lessen met `stemHeelUitpraten` (alle 9 gouden lessen); oude lessen zijn niet veranderd. Test: `scripts/test-wit-blijft-wit.mjs`.

**F8. Gouden klokles: iets wordt 2 keer uitgesproken ("Hoi, hoi").** (10 november 2026)
- Wat mis was: Sara hoorde de groet en soms andere zinnen 2 keer.
- Regel: elke uiting wordt per stuk maar 1 keer uitgesproken (BOUWREGELS 15.29). Test met de F8-teller (stem-logboek) in een zichtbare Chrome met de echte stem.
- Oorzaak en gemeten aantallen in de andere gouden lessen: zie KEUZES-VOOR-SARA.md Ronde 23b.
- **Nog een vorm (17 november 2026, gouden Tellen-les, samen tellen):** het kind tikt op een appel en Bliepo zegt "1...1". Oorzaak: het bewaarde Ruth-bestand van "1." (en van "11.") bevat het woord 2 keer, met 1 s stilte ertussen; de les startte de zin maar 1 keer. De oude F8-controle zag dit niet, omdat ze alleen de browserstem telde, een tik als "het kind deed iets" zag en Ruth-opnames niet bekeek.
- Regel: ook korte uitingen (1 of 2 woorden) en opnames tellen (BOUWREGELS 15.29). Gouden lessen knippen een kort woord dat in de opname 2 keer klinkt. Controle: `node scripts/stem-dubbel-controle.mjs`, plus de F8-controle in speelcontrole, test-tellen-gouden en extra-test-hulp (korte uiting binnen 3 s 2 keer = fout, ook na een tik).

**F9. Gouden klokles: de tekst springt, de pijl knippert en Bliepo valt over de tekst.** (10 november 2026)
- Wat mis was: de pijl ging tussen de stukken weg en kwam terug, het tekstblok verschoof van boven naar beneden bij elke nieuwe zin, en met een langer tekstvak stond Bliepo deels over de tekst.
- Regel: vaste zones, niets verspringt, Bliepo en tekst overlappen nooit (BOUWREGELS 15.30); de pijl blijft op 1 plek staan zolang er tekst is (15.27).
- Gemeten in de andere gouden lessen (alleen gemeten, niet veranderd): zie KEUZES-VOOR-SARA.md Ronde 23b.

**F10. Gouden lessen: de woorden lichten op per zin, niet per woord.** (Sara, 11 november 2026)
- Wat mis was: Sara zag de hele zin in 1 keer wit worden; daarna liep er alleen nog een oranje woord overheen. Zoals bij Synthesis moet elk woord apart van grijs naar wit gaan op het moment dat Bliepo het zegt.
- Oorzaak (gemeten in een zichtbare Chrome, beeld voor beeld): BliepoTekst maakt een zin wit als de stem na 2,5 s nog niet begonnen is ("stem uit"), en met `stemHeelUitpraten` (Ronde 30, "wit blijft wit") bleef hij dan wit. Maar de stem is vaak gewoon nog onderweg: de Google-stem doet er 0,4 tot 2,7 s over voor hij begint, het ophalen bij Ruth komt daar nog bij, en de les wacht soms tot 6 s tot Bliepo in beeld staat. Dan werd de zin wit vóór Bliepo begon. Daarnaast liepen de geschatte woordtijden steeds te laat (gemiddeld ± 0,3 s, tot 1,2 s), omdat de stilte aan het eind van de zin over de woorden werd verdeeld.
- Regel (algemeen): een zin blijft gedimd zolang zijn stem onderweg is en wordt alleen woord voor woord wit; hij wordt pas in 1 keer wit als er echt geen stem komt. De woordtijden van een stem zonder woordmeldingen komen uit een gemeten spreekmodel (per woord + per klank, pauzes bij leestekens, stilte voor en na apart), niet uit "duur gedeeld door letters" (BOUWREGELS 3.7, aanvulling 11 november; LESRECEPT 3.9a).
- Gecontroleerd in alle 9 gouden lessen (dezelfde gedeelde code; alle 9 hebben `woordenMeeMetStem` en `stemHeelUitpraten`): de fout zat in alle 9. Gezien in Tellen, Splitsen en de klokles; na de reparatie in geen enkele les meer. Oude lessen en lessen zonder de optie zijn niet veranderd. Test: `node scripts/test-woord-oplichten.mjs` (meetcijfers in KEUZES-VOOR-SARA.md Ronde 31).

**F11. Gouden lessen: dezelfde tekst staat 2 keer tegelijk op het scherm (bij Bliepo en boven de opdracht).** (Sara, 17 november 2026)
- Wat mis was: Sara zag in de gouden les Splitsen extra (`squla-splits-splitsen1-1-gouden-extra`) de zin die Bliepo zegt 2 keer: in het tekstvak bij Bliepo en als opdracht (kop) boven in het speelvlak. "Dat mag absoluut niet, bij geen enkele opdracht."
- Oorzaak: de les zette de opdracht als kop in het speelvlak en liet Bliepo dezelfde zin zeggen; het tekstvak van Bliepo toont elke gesproken zin, ook als die al elders in beeld staat. Alleen de les met `vraagBoven` (geld) liet de zin al weg; de nieuwe lessen niet. De oude controles keken alleen naar uitspraak (F8) en naar tekst die terugkomt (F7), niet naar twee blokken tegelijk.
- Regel (algemeen, voor ALLE opdrachten van alle gouden lessen): de opdracht staat op 1 plek; Bliepo's tekstvak toont die zin niet nog een keer, Bliepo spreekt hem wel (BOUWREGELS 15.31). Zijn andere zinnen (reacties, hints, uitleg) blijven in het tekstvak.
- Controle: `scripts/dubbele-tekst-controle.mjs`, ingebouwd in `node scripts/speelcontrole.mjs` (GOED en ALLEFOUT, elke gouden les) en in `scripts/extra-test-hulp.mjs`: dezelfde zin 2 keer tegelijk zichtbaar in de DOM langer dan 0,4 s is een fout (F11).

**F12. Antwoordknoppen staan op verschillende plekken in dezelfde les.** (Sara, 18 november 2026)
- Wat mis was: in de gouden les Plussommen extra stonden de antwoorden bij "Welk getal is dit?" links naast het speelvlak en bij de volgende vragen rechts onder Bliepo.
- Oorzaak: de opties `raster` (tegels links), `midden` (midden van het vlak) en `bijOpdracht` (bij de opdracht) gaven per vraag een andere plek.
- Regel (alle gouden lessen): gewone keuzes op 1 vaste plek, rechts onder Bliepo's zin (BOUWREGELS 15.32); antwoorden die voorwerpen in het beeld zijn (munten, kaartjes) mogen in het beeld blijven (Sara: niet te letterlijk). In `Lesscherm.tsx` negeren gouden lessen alleen `raster`.
- Controle: in elke gouden les moeten alle antwoordknoppen binnen de rechterkolom staan (x > 976 in het lesvlak); nog toe te voegen aan de speelcontrole.

**F13. Gouden les Rekentaal: een witte rand om alle voorwerpen en de tafel, en pannenkoeken die boven de tafel zweven.** (Sara, 18 november 2026)
- Wat mis was: rond pannenkoeken, bekers, appels enzovoort en rond de tafel, het kleed en de plank zat een duidelijke witte rand. De pannenkoeken stonden boven de tafel in plaats van erop; ook andere voorwerpen stonden aan de rand van het hout.
- Oorzaak: het speelvlak `squla-rekentaal-gouden-vlak.tsx` zette sinds 12 november een lichte omtrek (`LICHT_RAND`, in code) om elke tekening, zodat de donkerblauwe lijn op de donkere achtergrond te zien bleef. Bij de nieuwe Magnific-plaatjes werd dat een witte rand. De plaatjes zelf hebben geen witte rand (gescand: 216 plaatjes in `public/voorwerpen`, geen enkel plaatje met een lichte randlaag). De pannenkoek stond in het midden van zijn vak, de ondergrond begon precies onder de voeten.
- Regel: BOUWREGELS 15.33. Geen witte rand of halo om plaatjes; voorwerpen staan OP de ondergrond.
- Gecontroleerd in de andere gouden lessen: de lichte omtrek bestond alleen in dit ene vlak (1 les); in de andere gouden lessen staat geen witte omtrek om voorwerp-plaatjes in code.

**F14. Voorwerpen zweven boven hun ondergrond.** (Sara, 18 november 2026)
- Wat mis was: in Rekentaal zweefden de voorwerpen boven de schaal van de weegschaal; Sara ziet dit steeds weer in nieuwe lessen en kan niet alles zelf nakijken.
- Oorzaak: voorwerp en ondergrond zijn los van elkaar geplaatst; niemand meet of ze elkaar raken, vooral niet bij een kantelende ondergrond.
- Regel: BOUWREGELS 15.34: elk voorwerp raakt zijn ondergrond; automatische zweef-controle plus schermfoto-keuring.
- Controle: `scripts/zweef-controle.mjs` (nog uitbreiden naar de andere gouden lessen), en de keurder let op zweven op elke foto.

**F15. Disco-scène in de gouden les Plussommen.** (Sara, 18 november 2026)
- Wat mis was: de vragen 6, 7 en 13 speelden in een disco (discobal, luidsprekers, draaitafel, spots die aangaan). Sara wil geen disco en ook niets in die richting (feest, dansen, muziek).
- Oorzaak: de gouden les nam het beeld van de oude Squla-les "Dansende sommen" over zonder te vragen of dat bij het thema van de les (de bakkerij) en bij Sara's wensen past.
- Regel: BOUWREGELS 15.35. Een scène past bij het thema van de les en nooit bij disco, feest, dansen of muziek.
- Gecontroleerd in de andere gouden lessen: zie het rapport; geen disco, discobal, luidsprekers, dansen of muziek gevonden; wel ballonnen, feesthoedjes, vlaggetjes en slingerlampjes in Tijd, Vormen, Meer-minder, Meten, Minsommen, Getallenlijn en Rekenmix (voorgelegd aan Sara, niet vervangen).

**F16. De les wacht op het kind, maar er staat geen vraag of opdracht bij.** (Sara, 18 november 2026)
- Wat mis was: in de gouden les Rekenmix 2 stond aan het begin "In deze les kijk je hoeveel er op een boterham of een spiesje zit." en daarna gebeurde er niets. Sara moest ergens op tikken (op een boterham), maar nergens stond wat of waar. Ze zag het bij meer lessen, ook bij "groot en klein" (Rekentaal) en bij het schilderij (Meten).
- Oorzaak 1 (het begin, alle gouden lessen): Sara opent de lessen via `public/alle-lessen.html`. Dat laadt de pagina opnieuw, en dan laat Chrome nog geen geluid toe. Bliepo's eerste zin wacht dan op de eerste tik van het kind (`stemHeelUitpraten`, lib/stem.ts), maar dat stond nergens in beeld. De testscripts tikten zelf eerst 1 keer en zagen het dus niet.
- Oorzaak 2 (Rekenmix 2, de eerste vraag): de vraag eindigde met "Tik op de goede boterham en dan op het vinkje." Het lesscherm laat elke zin met het woord "vinkje" weg (opdracht eigenaar 30 oktober). Omdat de vraag als 1 stuk werd gezegd, viel de HELE vraag weg: er stond alleen nog de beginzin en de les wachtte op een tik op een boterham.
- Oorzaak 3 (Meten, de schilderijen): Bliepo leest de 3 kaartjes voor en elke kaartzin kwam in zijn tekstvak. De laatste ("Het schilderij met de zon is het kleinst.") bleef staan: de vraag "Wat klopt er? Kies er 2." was weg.
- Oorzaak 4 (na een niet-goede keuze): de hint werd de nieuwe vraagzin, maar een hint als "Kijk hoeveel kaas er bovenaan zit." of "Het gaat om wat je niet ziet." zegt niet wat het kind moet doen. De vraag kwam niet terug.
- Regel: BOUWREGELS 15.37. Elke stap waarin het kind iets moet doen heeft een duidelijke vraag of opdracht, ook na een kijk-stap; het kind weet altijd wát en wáár.
- Opgelost: (1) wacht de les op de eerste tik, dan staat er "Tik op het scherm. Dan begint Bliepo." (alle 21 gouden lessen); (2) Rekenmix 2: de eerste vraag zonder het woord "vinkje" ("Tik op de goede boterham."); (3) Meten: de vraag blijft staan terwijl Bliepo de kaartjes voorleest; (4) na de hint komt de vraag terug waar de hint zelf geen vraag of opdracht is (Rekenmix 2 en 3).
- Controle: `scripts/vraag-aanwezig-controle.mjs` (in `node scripts/speelcontrole.mjs`, melding F16; los: het begin van elke gouden les zonder tik).
