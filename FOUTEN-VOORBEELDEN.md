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

**F8. Gouden klokles: iets wordt 2 keer uitgesproken ("Hoi, hoi").** (10 november 2026)
- Wat mis was: Sara hoorde de groet en soms andere zinnen 2 keer.
- Regel: elke uiting wordt per stuk maar 1 keer uitgesproken (BOUWREGELS 15.29). Test met de F8-teller (stem-logboek) in een zichtbare Chrome met de echte stem.
- Oorzaak en gemeten aantallen in de andere gouden lessen: zie KEUZES-VOOR-SARA.md Ronde 23b.

**F9. Gouden klokles: de tekst springt, de pijl knippert en Bliepo valt over de tekst.** (10 november 2026)
- Wat mis was: de pijl ging tussen de stukken weg en kwam terug, het tekstblok verschoof van boven naar beneden bij elke nieuwe zin, en met een langer tekstvak stond Bliepo deels over de tekst.
- Regel: vaste zones, niets verspringt, Bliepo en tekst overlappen nooit (BOUWREGELS 15.30); de pijl blijft op 1 plek staan zolang er tekst is (15.27).
- Gemeten in de andere gouden lessen (alleen gemeten, niet veranderd): zie KEUZES-VOOR-SARA.md Ronde 23b.

