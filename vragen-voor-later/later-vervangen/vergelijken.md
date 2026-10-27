# Later vervangen: Vergelijken (G7–G11)

Alle vijf lessen gebruiken één vlak: `src/components/les/vlakken/vergelijken-holo-vlak.tsx`
met de tekeningen in `vergelijken-holo-scene.ts`. De voorwerpen zijn al in de
Bliepo-stijl (Aarde: glazen potjes met vuurvliegjes, lantaarntjes met een getal,
een gloeiend teken). Wat nog van Synthesis is overgenomen:

| Les | Overgenomen van Synthesis | Vervangen door |
|---|---|---|
| G7 Instaptoets, G8 Meer of minder, G11 Eindtoets | de **vorm** van de vakjeskaarten: plekken in 2 kolommen (2 × 3 en 2 × 5), links blauw en rechts een andere kleur | blijft (de vorm is de didactiek: zelfde vorm, zelfde volgorde van vullen); alleen het uiterlijk is al potje + vuurvliegjes |
| G9 De tekens | het **gele stipje** bij de punt (kleine kant) en twee stipjes bij de open kant | eventueel een vuurvliegje dat bij de kleine kant gaat zitten, of een klein lantaarnlichtje |
| G9, G10 | de manier van wisselen: tik op het vraagteken → = → > → < | blijft (handeling van Synthesis) |
| G10 Getallen vergelijken | de **pijl onder een getal dat je mag "rollen"** | een lantaarn die zacht wiebelt, of een handje |
| alle | de **kaarttekening** aan het eind (lijntekening van blauwe en oranje vakjes, of "6 > 3") | een lijntekening van twee potjes met vuurvliegjes / twee lantaarntjes |
| alle | het **hulphandje** (zelfde vorm als het handje in het gewone lesscherm) | een lichtend Bliepo-handje |

Om te vervangen: de plaatjes worden alleen in `maak()` van de scène getekend
(`pot-3`, `pot-5`, `vlieg-<kleur>`, `teken-<s>`, `lamp`, `stip`, `pijl`); de
plekken en maten staan in `potMaat()` en `plek()`.
