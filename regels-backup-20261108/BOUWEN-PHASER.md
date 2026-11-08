# Groep 3-lessen bouwen in Phaser (vanaf 27 oktober 2026)

Antwoord en schrijf alles in het Nederlands. Lees dit bestand helemaal, en daarna:
`CLAUDE.md` (HARDE REGELS 1–7), `ONTWERPREGELS.md` (vooral "Lessen in Phaser:
hologrammen en gloed" en "Groep 3: kinderen die nog niet lezen"),
`LESSENPLAN.md` (§ 1b, 1c, 1d en jouw lessen in § 2), en per les de
aantekeningen in `INSPIRATIE.md` (zoek met grep op `### R2 · <Unit> · <Les>`,
`### <Unit> · <Les>` (ronde 1), `### R3 · …` en vooral
`### R3 · ALGEMENE HULPREGELS`). `src/components/les/BOUWEN.md` beschrijft
het oude lesscherm (de gids `l.…`); dat werkt nog steeds.

## Wat er al staat (gebruik dit, bouw het niet opnieuw)

- **Lesscherm** (`src/components/les/Lesscherm.tsx`, niet aanpassen): de
  blauwe ruimte als achtergrond (blijft altijd), Bliepo rechts met meelezen,
  gebaren en de ronde praatknop, de som bovenaan (`l.som`), invulvak
  (`l.getal`), keuzes (`l.kies`), verder (`l.verder`), en een eigen speelvlak
  (`l.vlak(Component, props)`, 980 × 720 punten, `l.pasVlakAan`,
  `l.wachtOpVlak`). Nieuw: `l.wijsAan(knop, ...zinnen)` — Bliepo wijst een
  knop aan (`data-knop`) en zegt wat hij doet. Knoppen in het lesscherm:
  `controleer`, `weetniet`, `verder`, `opnieuw`, `terug`.
- **Phaser-hologrammen** (`src/components/les/holo/`):
  - `basis.ts`: `holoBasis(Phaser, rustig)` → een scène-klasse met
    `canvasPlaatje`, `bak` (gloed één keer bakken met de CENTRALE sterkte;
    zet nooit zelf een gloedsterkte), `plaats`, `tover` (lichtstraal uit de
    vloer + zachte flits), `golf` (goed), `schud` (fout), `verdwijn`,
    `selectieRing` (zacht pulserende ring rond wat gekozen is), `demo`.
    Kleuren: `WERELDKLEUR.oceaan/aarde/universum`, `WARM`, `GOED`.
  - `motor.tsx`: `useHoloMotor(schaal, (Phaser, rustig) => Klasse, { invoer })`
    → `{ plek, scene }`; zet `<div ref={plek} style={HOLO_CANVAS} />` in je
    vlak. `invoer: true` als het kind in Phaser moet tikken of slepen
    (Phaser-pointer, `pointer.worldX/worldY` zijn punten van het vlak).
    Zet `window.__phaser.klaarOp` en `beweeg` (= `demo`) vanzelf.
  - `keuzes.tsx`: `KeuzeKnoppen` (grote cijferknoppen; fout = grijs, kies
    opnieuw) en `vierKeuzes(antwoord, min, max)`.
- **Iconenknoppen**: `src/components/les/ikonen.tsx` (`IkoonKnop`,
  `IkoonTeken`): vinkje, vraagteken, pijl, luidspreker, rondje-pijl, terug,
  start, race, klaar. Geef elke knop in je vlak een `data-knop`-naam.
- **Voorbeeld van een complete Phaser-les**:
  `src/components/les/vlakken/flitsen-hologram.tsx` + `lessen/flitsen.tsx`
  (hologramkaart met stippen in vaste patronen, 4 keuzes, race, aanwijzen).
  Bekijk hem in de browser: `http://localhost:3000/voorbeeld/les/flitsen-tellen-tot-10?naam=Testkind`.
- **Stem**: nieuwe zinnen leest de browser voor (geen tegoed); niets aan
  doen. Gebruik gewoon `l.zeg`.

## Wat je per les doet

1. Zoek de les op in `LESSENPLAN.md` (§ 2) en de bestaande draaiboek-les
   (`src/lib/lessen/catalogus.ts`: `synthesis:` noemt de Synthesis-les).
2. **Didactiek zo dicht mogelijk bij Synthesis**: dezelfde leerstappen,
   dezelfde opbouw van makkelijk naar moeilijk, dezelfde handelingen van het
   kind (slepen, groeperen, tikken, eerst zelf doen en zien, dan de som), en
   de tutor vraagt en helpt op dezelfde manier (zinnen in eigen woorden,
   zelfde betekenis, toon en moment). Wijk niet af zonder het te noteren als
   vraag (zie onder).
3. **Teken het speelvlak opnieuw in Phaser** als hologrammen vóór de
   bestaande achtergrond (geen bord of kader, geen eigen achtergrond):
   nieuwe bestanden `src/components/les/vlakken/<jouw-voorvoegsel>-holo-….tsx`
   (+ eventueel `.module.css`). De oude vlak-bestanden blijven staan
   (HARDE REGEL 1: niets verwijderen); je draaiboek gebruikt voortaan het
   nieuwe vlak. Gebruikt een les het ingebouwde tegelraster van het
   lesscherm (`l.bak/l.pak/l.leg/l.tel/...`), bouw dan een Phaser-vlak dat
   hetzelfde doet (tegels uit een rij slepen naar een vak, torens, tellen)
   en pas het draaiboek daarop aan.
4. **Voorwerpen**: zoals in LESSENPLAN.md (wereld + "Voorwerpen-check"). Eén
   soort voorwerp per opdracht, los van elkaar, groot genoeg, niet
   overlappend, logisch bij de handeling. Neem je een voorwerp van Synthesis
   voorlopig over (bijv. de getaltegels, een raket), zet het dan op het
   lijstje **LATER VERVANGEN** (zie onder).
5. **Indeling**: los en vrij over het vlak; het doel op een eigen plek met
   een warme gloed; de som groot en rustig bovenaan in het midden (`l.som`,
   met een oplichtend vraagteken-vakje); Bliepo staat rechts buiten het vlak;
   op de telefoon past alles zonder scrollen (het lesscherm schaalt het vlak).
   Getallen groot en duidelijk.
6. **Gloed**: alleen via `bak()` en de effecten van `holo/basis.ts`
   (centrale, subtiele sterkte). Wat gekozen is: `selectieRing`. Goed:
   `golf`. Nooit een live Glow-filter elk beeld.
7. **Kinderen die nog niet lezen** (vaste regel): Bliepo zegt alles wat het
   kind moet weten (opdracht, vraag, uitleg, hints, feedback); knoppen met
   een icoon (`IkoonKnop`); antwoordkeuzes zijn cijfers, stippen of plaatjes,
   nooit woorden (moet het toch een woord zijn: `KeuzeKnoppen` leest het voor
   bij tikken); de eerste keer in de les wijst Bliepo de knoppen aan
   (`l.wijsAan("weetniet", "Weet je het niet? Tik dan op het vraagteken.")`,
   bij een eigen knop in je vlak met jouw `data-knop`); zo weinig mogelijk
   tekst in beeld.
8. **Minstens 15 opgaven** per les (instap- en eindtoetsen: de toetsvragen
   zoals Synthesis; daarna mag het gewone oefenen van de les tellen).
9. **Hulp**: zoals de aantekeningen per les, en waar die niets zeggen de
   ALGEMENE HULPREGELS (R3): 1× fout = vriendelijke reactie + één hint bij de
   handeling (hulp in beeld: rand, pijl, samen tellen, minder keuzes);
   2× fout = Bliepo doet het voor of zegt het antwoord en de vraag komt later
   terug; "weet ik niet" = antwoord + "daar komen we later op terug"; toetsen:
   geen uitleg, volgende vraag. De les mag nooit vastlopen in een tak.
10. **Gebaren** gaan vanzelf uit de woorden (lib/bliepo-gebaren.ts): "kijk",
    "tik op", "sleep" = wijzen; "hoeveel" = open handen; "goed zo" = duim.
    Zwaaien alleen bij een groet ("Hoi").
11. **Rekenen klopt**: controleer elke som, elk antwoord en elke afleider.
12. **Zinnen**: kort (± 10 woorden), grammaticaal goed, natuurlijk voor een
    kind van 6. Nederlands (klok: "half 4", "kwart over 3"; geld in euro).
    Cijfers in de tekst tussen `{…}` zoals in de bestaande lessen.

## Controle per les (zelf, voordat je klaar meldt)

- `npx tsc --noEmit -p .` en `npx eslint <jouw bestanden>`: geen fouten.
- In de browser (de dev-server draait op `http://localhost:3000`; Chrome
  zonder venster op poort 9337, hulpje `cdp.mjs` in
  `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/`,
  zie `flits2.mjs` daar als voorbeeld): de les `.../voorbeeld/les/<id>?naam=Testkind`
  van begin tot eind spelen op laptop (1440 × 900) en telefoon (390 × 844,
  touch), met goed, 1× fout, 2× fout en "weet ik niet". Maak schermfoto's en
  bekijk ze zelf: achtergrond = de bestaande blauwe ruimte, Bliepo + tekst
  in beeld, voorwerpen logisch en goed te tellen, telefoon zonder scrollen.
  Open steeds een eigen tabblad en sluit het daarna.
- Vloeiend (HARDE REGEL 7): zet je lessen in
  `scripts/vloeiend-schermen/<jouw-voorvoegsel>.json` als
  `[{ "naam": "...", "pad": "/voorbeeld/les/<id>?naam=Testkind" }]` en draai
  `ALLEEN=<id> npm run vloeiend` (55–60 beelden/s, geen hapering > 50 ms;
  de opentijd telt lokaal alleen als waarschuwing). Haalt het dat niet: los
  het op (minder plaatjes, gebakken gloed) zonder dat het er anders uitziet.

## Wat je NIET doet

- Geen git commit, geen push, niet online zetten (dat doet de hoofdagent).
- Niets in de database aanmaken of wijzigen.
- Niet aanpassen: `Lesscherm.tsx`, `soort.ts`, `holo/*`, `ikonen.*`,
  `lessen/index.ts`, `src/lib/lessen/catalogus.ts`, `flitsen*`,
  `scripts/vloeiendcontrole.mjs`, of bestanden van een ander onderdeel.
  Mis je iets in het gedeelde gereedschap: los het op in je eigen vlak, of
  schrijf het als vraag op.
- Geen nieuwe les-ids zonder dat ze in LESSENPLAN.md staan; nieuwe lessen
  (zoals G4b) voeg je toe aan de `LESSEN_…`-lijst onderaan je eigen bestand en
  meld je in je verslag (de hoofdagent zet ze in de catalogus).

## Opschrijven

- **LATER VERVANGEN**: `vragen-voor-later/later-vervangen/<jouw-voorvoegsel>.md`
  — per les: welk voorwerp of figuur van Synthesis je voorlopig overnam, en
  waardoor het in de Bliepo-stijl vervangen kan worden.
- **Vragen/twijfels**: `vragen-voor-later/lessen-groep-3/<jouw-voorvoegsel>-phaser.md`.

## Eindverslag (kort, Nederlands)

Per les: id, titel, LESSENPLAN-code, nieuwe vlak-bestanden, hoeveel opgaven,
wat je getest hebt (laptop/telefoon, goed/fout/2× fout/weet ik niet,
vloeiend met de gemeten beelden/s), wat er niet lukte en waarom, en welke
lessen op LATER VERVANGEN staan.
