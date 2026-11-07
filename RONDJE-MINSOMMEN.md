# Rood rondje bij Minsommen (6 november 2026)

## Wat ik veranderde
Alleen `src/components/les/vlakken/squla-minsommen-vlak.tsx` (de les zelf en `squla-minsommen-tekenen.ts` niet).
- Gedeelde hulp `holo/rondje.ts` gebruikt (`maakRondjes`, `vakOm`); die zelf niet gewijzigd.
- `zetLicht` (voorheen ringen die pulseren) zet nu 1 rood dubbel rondje om het hele groepje:
  - ruimte: alle dingen / wat overblijft / wat eraf gaat (de grijze);
  - bus: de pakjes in de bus; bij "eraf" het getal-cirkeltje (rondje-variant) of de pakjes buiten;
  - bakjes: alle bakjes of de lege.
- `goed()`: het "even oplichten" (`flits`) van wat overblijft is vervangen door 1 rood rondje om wat overblijft
  (bij ruimte, bus, bakjes). Het kleine opspringen en de groene golf blijven.
- Rondje komt per tafereel nieuw (`maakRondjes` in `zetToneel`, `vergeet()` bij het volgende tafereel), staat
  in de groep, dus verdwijnt mee. Sleutel bevat het aantal grijze, zodat het rondje meegaat als dat verandert.
- Het gloed bakken (`texGloed`) wordt in de les niet meer aangeroepen: dat scheelt werk bij het eerste goede
  antwoord (minder haperen). De methoden `flits`/`texGloed` en het klaarzetten in `maak()` heb ik laten staan.

## Bewust niet veranderd
- `kaartRing` (verbinden): dat is de keuze van het kind, geen aanwijzing van Bliepo.
- Kleurringen om voorwerpen (`tekenMetRing`, BOUWREGELS 2.1), grijs/dof maken, groene golf bij goed, rode schud bij fout.
- `this.ringen` en `selectieRing` blijven in de klasse staan (niet meer gebruikt in zetLicht).
- Het getal-cirkeltje van de bus ("rood rondje met het getal") heeft de kleur van het getal; dat is iets anders
  dan het aanwijsrondje. Let op: de lestekst zegt "het rode rondje" voor dat getal-cirkeltje, terwijl het
  aanwijsrondje ook rood is. Aan Sara of dat verwarrend is; lestekst niet aangeraakt.
- Rondje.ts nodig? Nee, niets nodig.

## Controles
- Schermfoto's (Testkind): ruimte-1 (rondje om de 3 overgebleven ballonnen, blijft staan, 1 rondje) en bus1-1
  (rondje om de 5 pakjes in de bus) gezien. Foto's in scratchpad/rondje-min/.
- `npx tsc --noEmit`: geen fouten in `src/`.
- Speelcontrole GOED (alle 16 lessen, machine zwaar overbelast, load 175-340): 12 lessen "0 stappen" (de speler kreeg binnen 5 s niets te tikken, waarschijnlijk opstart-flake door drukte, niet bewezen) en 4 (ruimte-1/2/3, machine-4) met 46-48 stappen en dan "komt niet verder". Geen eind gehaald. Niet opnieuw per les gedraaid door tijd.

## NIET GEZIEN
- Rondje bij bakjes, bus met getal-cirkeltje (bus2), pakjes buiten, bij goed(), kaal/machine/verbinden/bellen.
- Vloeiend-meting (laptop en trage telefoon).
- Speelcontrole ALLEFOUT en NEE: ALLEFOUT begonnen maar na ruim 40 min nog niet klaar en gestopt; NEE niet gedraaid. Niet vergeleken met de oude versie (dus niet bekend of de GOED-uitslag zonder mijn wijziging gelijk is).
- `npm run vloeiend` niet gedraaid (tijd en overbelasting).
