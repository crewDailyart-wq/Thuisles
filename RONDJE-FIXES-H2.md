# Rondje-fixes H2 (6 november 2026)

Kopieen van de oude bestanden: /private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/orig/

## Gecontroleerd van de vorige helper
- Splitsen 2-1 (squla-splitsen.tsx ~172-185): twee zinnen, licht briefje dan munten, dan leeg. Klopt. Zelfde patroon in splitsen2-2 (regel ~1308).
- `npx tsc --noEmit -p .`: geen fouten in src/. ESLint squla-splitsen.tsx: 3 waarschuwingen `tt`, `aa`, `bb` ongebruikt (regel 400, huisjes). Die stonden er al; niets anders ongebruikt.

## 1. Piraat-2
Er stond al code (squla-piraat.tsx ~426: licht op de wegvallende sterren in `samen`, en squla-splitsen-s1.ts `rondjeVak`). Op de schermfoto's: rondje om de laatste ster bij "Er gaat er 1 weg.", weg bij de volgende zin. Niets veranderd.

## 2. Rekenmix mix3-1
Er stond al code (squla-rekenmix.tsx ~823-866, `kleinVoor`): labels "kleinst, kleiner, klein", goede volgorde kleinste links, zinnen met "vooraan/eerste plekje", vraag "Zet op volgorde: kleinst, kleiner, klein.", welkom aangepast. Foto's: labels kloppen, zinnen kloppen. Andere woordenset ongemoeid.

## 3. Rondjes toevoegen
- Verdelen (delen-1): squla-splitsen.tsx (`rolOver`, samen, uitleg) en squla-splitsen-vlak.tsx (nieuwe `slOmheen`: sleutels `sl.knikkers`, `sl.bakjes`, `sl.bakje`). Rondje om knikkers, dan om bakjes, weg bij het rollen; bij "Tel wat er in 1 bakje ligt" om 1 bakje; in de uitleg om de bakjes bij "In elk bakje liggen evenveel knikkers". Gezien op foto's.
- Fout gerepareerd in squla-splitsen-vlak.tsx (`slLegHerein`): `alpha: 1` toegevoegd, want de knikkers bleven in de Nee-route onzichtbaar (het inzweven werd afgebroken).
- Meer-minder (evenveel3-1): squla-meer-minder.tsx (`stavenLaten`) en squla-meer-minder-vlak.tsx (nieuwe prop `wijs`, `wijs()`, `staafGroepen`). Rondje om 1 staaf bij "Elke staaf is 10", en om de staven en blokjes onder 26, 8, 24 bij "Bij ... zie je ...". Gezien bij 26, 8, 24. De lichtstraal onder potje 24 is het binnenkomen van de staven (geen aanwijzing); niet weggehaald (regel 3).
- Rekenmix mix1-1: niets toegevoegd. Bij het tellen staat 1 rondje om de appel die Bliepo telt; de vraag noemt alleen "de appels" (verspreid, geen enkel groepje).

## Vragen voor Sara
- Mix3-1: bij "Kleinst is de allerkleinste" ook een rondje om de kleinste bal? (nu niet)
- Meer-minder: bij "Kijk, onder elk getal staan staven." en "Kijk, 3 potjes." nu geen rondje (alles tegelijk); goed zo?

## NIET GEZIEN
- Rondje bij "Elke staaf is 10" (foto was te vroeg, de staven kwamen nog binnen).
- Ballen in de plekken bij mix3-1 en het moment na een fout (ROUTE=fout niet gedraaid).
- Splitsen 2-1 zelf niet gefotografeerd in deze ronde.
- Speelcontrole: eerst 4 lessen tegelijk gaf overal "0 stappen" (te druk); daarna delen-1 alleen: tot het eind. Zie de samenvatting voor de rest.
