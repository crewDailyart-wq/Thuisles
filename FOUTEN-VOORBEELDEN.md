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

**F9. Gouden klokles: de tekst springt, de pijl knippert en Bliepo valt over de tekst.** (10 november 2026)
- Wat mis was: de pijl ging tussen de stukken weg en kwam terug, het tekstblok verschoof van boven naar beneden bij elke nieuwe zin, en met een langer tekstvak stond Bliepo deels over de tekst.
- Regel: vaste zones, niets verspringt, Bliepo en tekst overlappen nooit (BOUWREGELS 15.30); de pijl blijft op 1 plek staan zolang er tekst is (15.27).
- Gemeten in de andere gouden lessen (alleen gemeten, niet veranderd): zie KEUZES-VOOR-SARA.md Ronde 23b.

**F10. Gouden lessen: de woorden lichten op per zin, niet per woord.** (Sara, 11 november 2026)
- Wat mis was: Sara zag de hele zin in 1 keer wit worden; daarna liep er alleen nog een oranje woord overheen. Zoals bij Synthesis moet elk woord apart van grijs naar wit gaan op het moment dat Bliepo het zegt.
- Oorzaak (gemeten in een zichtbare Chrome, beeld voor beeld): BliepoTekst maakt een zin wit als de stem na 2,5 s nog niet begonnen is ("stem uit"), en met `stemHeelUitpraten` (Ronde 30, "wit blijft wit") bleef hij dan wit. Maar de stem is vaak gewoon nog onderweg: de Google-stem doet er 0,4 tot 2,7 s over voor hij begint, het ophalen bij Ruth komt daar nog bij, en de les wacht soms tot 6 s tot Bliepo in beeld staat. Dan werd de zin wit vóór Bliepo begon. Daarnaast liepen de geschatte woordtijden steeds te laat (gemiddeld ± 0,3 s, tot 1,2 s), omdat de stilte aan het eind van de zin over de woorden werd verdeeld.
- Regel (algemeen): een zin blijft gedimd zolang zijn stem onderweg is en wordt alleen woord voor woord wit; hij wordt pas in 1 keer wit als er echt geen stem komt. De woordtijden van een stem zonder woordmeldingen komen uit een gemeten spreekmodel (per woord + per klank, pauzes bij leestekens, stilte voor en na apart), niet uit "duur gedeeld door letters" (BOUWREGELS 3.7, aanvulling 11 november; LESRECEPT 3.9a).
- Gecontroleerd in alle 9 gouden lessen (dezelfde gedeelde code; alle 9 hebben `woordenMeeMetStem` en `stemHeelUitpraten`): de fout zat in alle 9. Gezien in Tellen, Splitsen en de klokles; na de reparatie in geen enkele les meer. Oude lessen en lessen zonder de optie zijn niet veranderd. Test: `node scripts/test-woord-oplichten.mjs` (meetcijfers in KEUZES-VOOR-SARA.md Ronde 31).
