# Echte bewegingen voor Bliepo (24 oktober 2026)

Door mensen opgenomen bewegingen van Mixamo, overgezet op Bliepo's eigen
scharnieren (hoofd, schouders, ellebogen, polsen, vingers). Zijn lijf en wielen
bewegen niet mee. Het model zelf (`zappie.glb`, `zappie-klein.glb`) is niet
veranderd.

## Waar staat wat

- Mixamo-bestanden (FBX, zonder huid, 30 beeldjes per seconde):
  `~/Documents/Bliepo-bewegingen/mixamo/bliepo-<naam>.fbx`
  (niet in de repo: dat zijn de ruwe bestanden van Mixamo).
- Uitkomst voor de site: `public/assets/zappie/3d/zappie-gebaren.glb`
  (alleen scharnieren en animatieclips, meshopt-gecomprimeerd).
- Filmpjes voor telefoon en tablet: `public/assets/zappie/bliepo/film2/`
  (de oude staan nog in `film/`).
- Afspelen: `src/lib/zappie3d/echte-gebaren.ts`; welk gebaar bij welk woord:
  `gebarenBijZin` in `src/lib/bliepo-gebaren.ts`.

## Opnieuw maken

1. Overzetten (Blender 4.2):
   `Blender -b --python overzetten.py -- ~/Documents/Bliepo-bewegingen/mixamo gebaren.json naam=bliepo-naam.fbx ...`
   `bliepo-rust.fbx` (Neutral Idle) moet erbij zijn: daaraan wordt gemeten hoe
   de armen van de mens in rust hangen.
2. Controleren: `botscheck.py` (geen arm, hand of vinger in lijf, hoofd of
   wielen), `beeldjes.py` en `piekbeeld.py` (beeldjes van voren, schuin en
   opzij, ook op het hoogste punt).
3. Klein bestand: `node maak-gebaren-glb.mjs gebaren-web.json zappie-gebaren.glb 15`
   (met `TOL=1e-3`; nodig: @gltf-transform/core, extensions, functions en
   meshoptimizer). De rust-clip hoort er niet in; praten2 is ingekort tot 24 s.
4. Filmpjes: dev-server aan, Chrome met `--remote-debugging-port=9337`, dan
   `node filmpjes-opnemen.mjs`; rust en praten worden naadloos rond gemaakt,
   dan WebM (VP9 met doorzichtigheid) en geanimeerde WebP (sharp,
   alphaQuality 50) voor iPhone/Safari.

## Wat het overzetten doet (per beeldje)

- Richting van bovenarm en onderarm ten opzichte van de borst van de mens;
  hangt de arm zoals in rust, dan Bliepo's eigen rusthouding.
- Botst iets met zijn lijf, hoofd of wielen, of verdwijnt de hand achter zijn
  lijf, dan wordt de arm zo min mogelijk naar buiten/voren geduwd; vingers die
  zouden botsen: de pols draait minder ver.
- Pols: handpalm en vingers dezelfde kant op als bij de mens. Bliepo's
  rechterhand (rechts in beeld) heeft zijn "duim" aan de buitenkant (vinger 3).
- Hoofd: de gemiddelde stand eruit (de mens kijkt naar iemand naast zich);
  alleen knikken en scheef houden blijven, bijna niet omhoog (dan weerkaatst
  zijn scherm licht).
- Wijzen: de arm draait naar de opdracht (links van hem in beeld).
- Let op: `Vector.normalize()` van Blender rekent bij 4 getallen maar met 3;
  daarom worden quaternions zelf gedeeld door hun lengte.

## Het gebarenwoordenboek (26 oktober 2026)

Gebaren die Mixamo niet goed heeft voor Bliepo's korte armen (groot/klein,
erbij/eraf, snel/langzaam, meer/minder, stop, samen, wijzen naar boven, onder,
links en rechts, eerst/dan, helemaal, nadenken met de hand bij de borst, tellen
op 1 tot 4 vingers, open hand) zijn met keyframes gemaakt in Blender:

- `Blender -b --python sleutelgebaren.py -- sleutel.json`: per gebaar
  sleutelmomenten (waar de pols is, hoe de hand staat, welke vingers krom),
  de armen uitgerekend, en weggeduwd van zijn lijf, hoofd en wielen (zelfde
  dozen als overzetten.py). Het hoogste punt ligt op 0,3 s.
- Controle: `botscheck.py` en `piekbeeld.py` zoals hierboven.
- Klein bestand: `node maak-gebaren-glb.mjs sleutel.json zappie-gebaren-extra.glb 30`
  (`TOL=1e-3`). Een eigen bestand naast `zappie-gebaren.glb`; het oude blijft
  ongewijzigd.
- Filmpjes: `node filmpjes-opnemen.mjs groot klein erbij ...` (dezelfde
  werkwijze als hierboven).

Welk gebaar bij welk woord: `REGELS` in `src/lib/bliepo-gebaren.ts` (het
woordenboek). Zinnen zonder trefwoord: één keer een goedkoop AI-model
(`src/lib/gebaren-server.ts`, bewaard in `stem/gebaren/`). Het gebaar begint
0,3 s voor het woord en is op zijn hoogste punt precies op het woord
(`Bliepo3DGedeeld`), met een tempo dat past bij het woord en hoe snel hij praat.
