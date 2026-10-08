# Godot-rapport

Bijgehouden door Claude op de tak `godot-lessen`. Niets hiervan staat live.

## Waar ben ik nu (8 oktober 2026)

- **Bouwsteen 1, de groepjesmaker:** gebouwd in 2D, in Godot (eerst 3D geprobeerd; zie Stijl). Getest in Godot zelf
  (opname van een demo). **Nog niet getest als kind in Thuisles**, want de oefening
  heeft nog geen opgaven: zie "Wacht op Sara".
- **Opgaven:** met toestemming van Sara heeft Claude het sjabloon opgeslagen en de
  15 opgaven gepubliceerd (eerst een kopie van de database), en de 15
  maatje-teksten gemaakt.
- **Testen:** de oefening laadt in Thuisles als Testkind (3,1 s) en de brug werkt.
  Verder testen kan pas als het Chrome-tabblad vooraan staat: anders remt Chrome
  Godot af tot ongeveer één beeldje per seconde.
- **Daarna:** de controle uit punt 5 (Testkind, 15 opgaven met minstens 3 fouten,
  vier schermbreedtes, laadtijd op een trage verbinding, vingers).

## Godot

- Versie: Godot 4.7.2, de gewone versie (geen .NET), in `~/Downloads/Godot.app`.
  Niet opnieuw geïnstalleerd.
- Exportbestanden: alleen de twee voor web "single-threaded"
  (`web_nothreads_debug.zip` en `web_nothreads_release.zip`) in
  `~/Library/Application Support/Godot/export_templates/4.7.2.stable/`. Het grote
  bestand van 1,3 GB is weggegooid.
- Exporteren: `sh scripts/godot-export.sh groepjesmaker`. Dat maakt
  `public/godot/groepjesmaker/`.
- De exports staan **niet** in Git (`.gitignore`): elke export is ongeveer 40 MB
  en zou de repo bij elke wijziging zwaarder maken. Na een checkout eerst het
  exportscript draaien.

## Bouwsteen 1 — de groepjesmaker (Tafels)

**Waar het staat**

- Godot-project: `godot/groepjesmaker/`. Elk onderdeel is een eigen scène die je
  in de Godot-app ziet: `eikel.tscn`, `doosje.tscn`, `kast.tscn`, `maatje.tscn`,
  en `main.tscn` met de kast en de knoppen.
- Thuisles: de soort oefening `groepjesmaker`
  (`src/lib/generatoren/groepjesmaker.ts`), het scherm
  (`src/components/oefenen/Groepjesmaker.tsx`), de brug (`src/lib/godot/brug.ts`)
  en de zinnen van het maatje tijdens het bouwen (`src/lib/godot/zinnen.ts`).
- In het beheer: Tafels → Keersommen begrijpen → kopje **Met de groepjesmaker** →
  **Groepjes maken** (REK-TAF-KEE-09). Gekozen omdat "Keersommen begrijpen" over
  het snappen van keer gaat (rijen, plaatjes, handig rekenen); de groepjesmaker is
  precies dat, nog vóór "Tafels oefenen". Een kopje in een bestaand onderwerp, net
  als het rekenrek; geen nieuw onderwerp.

**Wat het kind doet**

- Kiest met − en + hoeveel eikels er in één doosje gaan (1 tot en met 10) en tikt
  op de kast: een doosje valt op de plank en de eikels ploppen erin. Hoogstens 10
  doosjes. Het ×-knopje op het laatste doosje haalt dat doosje weg (voor een
  doosje te veel); Opnieuw maakt de kast leeg. Tikken op de kast zelf voegt alleen
  toe, zodat een kind dat snel tikt niet per ongeluk iets weghaalt.
- De plussom groeit mee (3 → 3 + 3 → 3 + 3 + 3). Klopt de bouw, dan krimpt die met
  sterretjes tot 3 × 3 (de eerste keer langzaam) en gaat het invulvak in Thuisles
  open.
- 4 × 3 = 4 doosjes van 3. Andersom gebouwd mag: het maatje zegt dat het evenveel is.
- × 0 en × 1, wisselen (eerst voorspellen, dan draait de kast om) en knippen
  (7 × 8 = 5 × 8 + 2 × 8: na 5 doosjes knippen; elke plank krijgt een eigen kleur).
- Goed: de doosjes springen om de beurt en tellen mee (3, 6, 9, 12), de som wordt
  groen met "= 12". Fout: de kast bouwt zelf rustig de goede manier en telt mee.
- Alle 15 opgaven met de groepjesmaker. Geen klok, geen levens, goed of fout pas na
  Controleer. Thuisles kijkt na, niet Godot.

**Stijl**

- Eerst in 3D gebouwd, op verzoek van Sara. Dat werd onduidelijk (kleine doosjes
  diep in de kast, eikels als bolletjes, cijfers die wegvielen), en Synthesis zelf
  is ook gewoon 2D. Daarom terug naar 2D, netjes zoals Synthesis aanvoelt: een
  effen lichte achtergrond, alleen de kast in beeld, grote doosjes met een zacht
  randje en schaduw, dikke cijfers, vloeiende bewegingen en geluidjes (door Godot
  zelf gemaakt, geen bestanden). Niets overgenomen van Synthesis.
- De eikel komt uit de opdracht van Sara. Synthesis gebruikt effen bolletjes; de
  eikel staat op één plek (`eikel.gd`) en is dus makkelijk te wisselen.
- Tijdelijk maatje: een mint bolletje met ogen en een mond, zonder naam, bovenop de
  kast (`maatje.tscn`). Op het oefenscherm staat het tijdelijke maatje
  (`TijdelijkMaatje.tsx`) in plaats van Vos. Elders op de website staat Vos nog.

**Twee stijlen; Sara koos de donkere** (8 oktober 2026)

- Standaard nu: zoals Synthesis aanvoelt. Effen donkerblauw met een zacht raster,
  gloeiende vakjes, gele stippen in plaats van eikels, witte cijfers en
  groenblauwe knoppen. Geen plaatjes, figuurtjes, logo of teksten van Synthesis.
- De lichte Thuisles-stijl (houten kast, eikels) blijft bestaan: zet
  `&stijl=thuisles` achter het adres van de oefening.
- ONTWERPREGELS.md heeft hiervoor een nieuw stuk "Godot-bouwstenen". De regel
  "niets overnemen van Synthesis" uit de opdracht van stap B geldt nu alleen nog
  voor plaatjes, figuurtjes, logo en teksten, niet meer voor kleur en sfeer.
- Screenshots van allebei: `~/Desktop/godot-screenshots/groepjesmaker-*.png`.

**Grootte en laadtijd**

- Download: ongeveer 10 MB (gecomprimeerd; 39,5 MB zonder compressie). Bijna alles is
  de Godot-motor zelf (`index.wasm`); het spel is 60 kB.
- Laadtijd: nog niet gemeten in Thuisles.

**Nieuwe zinnen van het maatje** (tijdens het bouwen, `src/lib/godot/zinnen.ts`)

- "Steeds evenveel erbij. Dat schrijf je korter met keer."
- "Jij maakte 3 doosjes van 4. Dat is evenveel!"
- "Typ nu hoeveel eikels het samen zijn."
- "Zit in elk doosje evenveel?"
- "Kijk naar de som. Hoeveel doosjes horen erbij?"
- "Kijk nog eens: hoeveel eikels in één doosje?"
- "Kijk goed: hoeveel doosjes vraagt de som?"
- "Wat denk je? Is het na draaien evenveel?"
- "Ja, na draaien is het evenveel." / "Kijk: na draaien is het toch evenveel."
- "Knip de kast na 5 doosjes." / "Nu heb je twee makkelijke sommen."

Per opgave (voorlezen, bouwen, goed, fout, tip) via de bestaande schrijver, met
"doosjes" in plaats van "groepjes". Voorbeelden: "Maak 4 doosjes van 3.",
"4 doosjes van 3 is 12.", bij knippen "Knip de kast na 5 doosjes. 5 keer 8 is 40.
3 keer 8 is 24. Samen is dat 64." Bij 0 × 5: "Geen doosjes, dus geen eikels."
Alle teksten komen door de controles uit hoofdstuk 11.

**Controles (punt 5)**

| Controle | Stand |
| --- | --- |
| 15 opgaven als kind, minstens 3 fouten | nog niet (wacht op de opgaven) |
| 768, 1024, 390 en computerbreedte | nog niet |
| Laadtijd snel < 5 s, traag < 15 s | nog niet gemeten |
| Brug: alles komt aan in Thuisles | in Godot los getest: alle berichten in de console |
| Met de vinger te raken (knoppen ≥ 48 px) | knoppen zijn 88 bij 88 in een speelveld van 600 breed; op 390 breed ongeveer 57 px |
| Bestaande oefeningen werken nog | `npm run bewaak` geslaagd |

## Ook gedaan (open punten uit NACHTRAPPORT.md)

- Stem: alleen een Nederlandse stem; heeft het apparaat er geen, dan alleen het
  tekstwolkje.
- Knopje "Ik wil een tip": verborgen (niet verwijderd), zie `TIPKNOP_ZICHTBAAR`.
- Enkelvoud en meervoud: "Er gaat 1 munt af" (4 opgaven en hun maatje-teksten
  aangepast, eerst een kopie van de database), en in de vaste zinnen 1 staaf, 1 rij,
  1 kraal, 1 groepje, 1 stap, 1 dag, enzovoort.
- ONTWERPREGELS.md: "Oefeningen met een bouwsteen (zoals het rekenrek en de
  groepjesmaker): alle 15 opgaven met de bouwsteen."
