# Layout-rapport: het nieuwe startscherm en rekenscherm

11 oktober 2026, op de tak `nieuwe-layout` (vanaf `godot-lessen`).

Alleen het uiterlijk is veranderd. Oefeningen, voortgang, accounts en het
maatje werken zoals voorheen, en er is niets in de database veranderd.

## Ronde 3: startscherm afmaken en Rekenen koppelen (12 oktober 2026)

Eerst de laatste versie van GitHub opgehaald (pull request #1 stond al in
`main`), daarna verder op de tak `nieuwe-layout`.

**De tegel Rekenen.**
- Bij mij deed de tegel het wel: hij ging naar de oude keuzepagina
  "Hoe wil je oefenen?". Die pagina wordt per kind op de server gebouwd. Op een
  trage verbinding duurt dat even, en tot dan blijft het startscherm staan. Dan
  lijkt het alsof er niets gebeurt.
- Daarom twee dingen:
  - de tegel licht nu meteen op zodra je tikt;
  - de nieuwe schermen hebben een laadscherm met de sterrenhemel en het maatje.
- Rekenen gaat nu naar een **nieuw rekenscherm** (`/rekenen`) in de sterrenstijl.
  - Bovenaan staat "Rekenen" groot en wit, met een rond terugknopje naar het
    startscherm. Rechts staat het bolletje-maatje.
  - Daaronder staan de rekendomeinen als 3D-tegels. Elk domein heeft een eigen
    kleur en een zelf getekend wit icoon. Klein onderaan staat de voortgang:
    een balkje en "1 van 20".
  - Alleen domeinen met echte oefeningen voor de groep van het kind staan
    erop. Voor Testkind (groep 3) zijn dat er zes: Getallen, Splitsen,
    Optellen, Aftrekken, Tijd en Verhaaltjessommen.
- Tik je op een domein, dan zie je de onderwerpen als tegels
  (`/rekenen/optellen`).
- Tik je op een onderwerp, dan zie je de oefeningen als witte kaartjes. Het is
  dezelfde lijst als op de oude domeinpagina: dezelfde volgorde, de groepjes als
  kopje, de stand, "Nieuw" en de moeilijkheid.
- Een tik op een kaartje opent precies dezelfde oefening als voorheen.
  - "Terug" en "Stoppen" gaan daarna weer naar het onderwerp in de
    sterrenstijl.
  - Wie via de oude weg komt, gaat terug naar de oude pagina, zoals altijd.
  - Een halve oefening wordt nog steeds gewoon opgepakt.
- **Getest met de vinger op een tablet** (nagebootst):
  - Rekenen gaat naar het rekenscherm;
  - Taal, Spelling en Begrijpend lezen gaan naar "Binnenkort!";
  - het menuknopje gaat naar "Meer";
  - domein, onderwerp en terug naar het begin werken ook.

**"Nog meer voor jou" is verplaatst, niet weggehaald.**
- De sleutels en de groep staan nu klein in het Hoi-vakje. De groep kun je daar
  nog steeds wisselen.
- Naast het Hoi-vakje staat een rond menuknopje. Op de telefoon staat het naast
  het logo.
- Het menuknopje gaat naar een nieuwe pagina **"Meer"** (`/meer`) in de
  sterrenstijl. Daar staat alles wat eerst onder het startscherm stond:
  - het menu (Oefenen, Voortgang, Wereld, Maatje, Profiel);
  - het oude vakkenmenu;
  - vrij oefenen en oefenen volgens je methode;
  - school & methode en de tips;
  - jouw wereld en de vos.
- Het startscherm laadt nu alleen nog het kind en de sleutels.
- Op computer en tablet hoef je niet meer te scrollen: 1366, 1024 en 768 passen
  precies. Op de telefoon (390) scrol je een klein stukje.
- De kop past zich aan de breedte aan:
  - vanaf 1280 staan logo, titel en Hoi-vakje naast elkaar;
  - op een kleinere laptop of tablet staat de titel eronder, anders werd hij in
    tweeën gebroken;
  - op de telefoon staan logo en menuknopje boven, dan het Hoi-vakje, dan de
    titel.

**Kleine punten.**
- **Het lettertype van het beheer (Inter)** laadt niet meer bij de kinderen.
  Het laadt alleen nog in het beheer, en ook in het ouderdeel, bij het inloggen
  en op de openbare pagina's, want daar wordt het ook gebruikt. Gecontroleerd:
  het beheer gebruikt nog steeds Inter.
- **De planeet op 768 breed.** Staande tablets (vanaf 600 breed) krijgen nu een
  eigen uitsnede van het plaatje (`tablet-665`, 13 tot 18 KB). Die is iets
  ingezoomd en bovenaan wat korter. De planeet valt nu vrij tussen het
  Hoi-vakje en de tegels.

**Laadtijd opnieuw gemeten.** Met dezelfde instellingen als in ronde 2: een
echte versie van de site op deze laptop, twee metingen per regel.

| Scherm en verbinding | Eerste beeld | Alles klaar | Was |
|---|---|---|---|
| Telefoon, mobiel internet 1,6 Mbit/s | ca. 1,0 s | ca. 2,0 s | 2,9 s en 4,1 s |
| Telefoon, heel traag 0,4 Mbit/s | ca. 3,0 s | ca. 7,3 s | 5,9 s en 10,8 s |
| Computer, 1,6 Mbit/s | ca. 0,9 s | ca. 2,0 s | 2,0 s en 3,3 s |
| Computer, 0,4 Mbit/s | ca. 3,0 tot 3,8 s | ca. 7,6 s | 4,7 s en 9,8 s |

- Het antwoord van de server kwam eerst na 0,7 tot 2,7 seconden. Nu duurt het
  0,01 tot 0,1 seconde, omdat het startscherm alleen nog laadt wat erop staat.
- De lettertypes zijn nu 104 KB (was 151), omdat Inter niet meer meekomt.
- JavaScript is 150 KB, de stijl 22 KB en de achtergrond 14 tot 27 KB.

**Getest als Testkind.**
- De hele route werkt: startscherm → Rekenen → Optellen → Optellen tot en met
  20 → "Oefenen: plussommen tot 10".
- Ik heb de oefening tot het einde gespeeld.
  - Er stond nog een halve sessie van eerder (7 van de 15 vragen). Die werd
    gewoon opgepakt.
  - De laatste 8 vragen heb ik beantwoord.
  - Op het eindscherm stond "Je hebt 15 vragen gemaakt, 14 goed".
- De voortgang is opgeslagen: de oefening ging van "bijna beheerst" naar
  "beheerst", en de antwoorden staan erbij. Daarna stond er op de tegel
  Optellen "1 van 44".
- Het maatje is er tijdens de oefening, net als voorheen. Het knopje "Stem van
  Vos uitzetten" staat in beeld.
- De Godot-les "Kleuren tellen" opent via de nieuwe route. "Stoppen" gaat terug
  naar het onderwerp in de sterrenstijl.
- Typecheck, lint en het schermcontract zijn in orde. De nieuwe schermen staan
  nu ook in het schermcontract.

**Screenshots** in `~/Desktop/layout-screenshots`:
- `start-1366/1024/768/390.png`;
- `rekenen-1366/1024/768/390.png`;
- `domein-optellen-1366/1024/768/390.png` en `domein-getallen-390.png`;
- `onderwerp-1366.png` en `meer-1366.png`.

**Nog om naar te kijken.**
- Optellen heeft voor groep 3 maar één onderwerp. Je tikt dus eerst op
  Optellen en dan nog eens op de enige tegel. Als je wilt, kan een domein met
  één onderwerp meteen door naar de oefeningen.
- De oude pagina's (Oefenen, Vrij oefenen, de oude domeinpagina) bestaan nog.
  Je komt er via "Meer".

## Ronde 2: achtergrond opvallender (11 oktober 2026)

**Het plaatje.** `achtergrond-breed.png` uit Downloads staat nu in
`ontwerp/achtergrond-breed.png`. Het origineel staat er nog. Het is de
achtergrond van het startscherm en van "Binnenkort!", en straks van de rest van
de kinderkant.

- **Licht:** omgezet naar AVIF, met WebP als reserve, in de maten 828, 1280 en
  1672 breed. Daarbij komt een staande uitsnede van 530 en 706 breed. De
  bestanden zijn 10 tot 39 KB, ver onder de 400 KB. Een telefoon laadt 10 tot
  14 KB.
- **Vult altijd het hele scherm**, zonder randen. Het plaatje staat stil terwijl
  de inhoud eroverheen schuift.
- **Staand:** er is nog geen staande versie. Op telefoon en staande tablet laat
  ik daarom het rechterdeel van het plaatje zien. Daar staan de planeet en de
  wolken. Op 768 breed valt de planeet half achter de tegel Taal, op 390 breed
  staat hij naast de titel. Maak je later een staande versie, dan zet ik die
  erin.
- **Levendig:**
  - de sterren in het plaatje twinkelen zachtjes, met een lichtje precies op
    elke ster;
  - er ligt een zachte gloed achter "Wat wil je doen?";
  - een lichte donkere rand aan de zijkanten laat het midden oplichten.
- **Minder beweging:** getest met die instelling aan. De sterren en de gloed
  staan dan stil.
- **Mijn getekende sterren en wolkjes** staan uit, maar zijn niet verwijderd. Ze
  staan nog in `Sterrenhemel.tsx`; één schakelaar zet ze terug.
- **Tegels rijker:**
  - een glanzende band bovenaan;
  - een kleurverloop van licht naar donker;
  - een dikkere 3D-onderkant met een donker randje;
  - een harde en een zachte schaduw.
- **Leesbaarheid:** het handschrift ("Jij kunt het!") en het motto kregen een
  zachte schaduw, want op de telefoon vallen ze over een lichte wolk.

**Wordt het wazig op een groot scherm? Ja, een beetje.** Het plaatje is 1672
pixels breed. Op een gewone laptop van 1366 pixels is het scherp.

| Scherm | Hoeveel vergroot | Wat je ziet |
|---|---|---|
| Groot scherm van 1920 breed | 1,15 keer | nauwelijks zachter |
| Scherm van 2560 breed | 1,5 keer | de sterren en de rand van de planeet worden zachter |
| Retinascherm (Mac, iPad) | 1,6 tot 2 keer | de sterren en de rand van de planeet worden zachter |
| Telefoon (staande uitsnede van 941 pixels hoog) | ongeveer 2,7 keer | duidelijk zachter |

Het meeste van het plaatje is een zacht kleurverloop, en dat blijft mooi. De
twinkelende lichtjes liggen eroverheen en blijven scherp.

Mijn advies: maak het plaatje opnieuw op 3840 pixels breed, en een staande versie
van ongeveer 1440 bij 3200. Ook dan blijft het bestand onder de 400 KB.

**Laadtijd op een trage verbinding.** Ik heb dit gemeten met een echte
(geoptimaliseerde) versie van de site op deze laptop. De tijden zijn het
gemiddelde van twee metingen.

| Scherm en verbinding | Eerste beeld | Achtergrond binnen | Alles klaar |
|---|---|---|---|
| Telefoon, mobiel internet 1,6 Mbit/s | ca. 2,9 s | ca. 2,8 s | ca. 4,1 s |
| Telefoon, heel traag 0,4 Mbit/s | ca. 5,9 s | ca. 5,8 s | ca. 10,8 s |
| Computer, 1,6 Mbit/s | ca. 2,0 s | ca. 2,2 s | ca. 3,3 s |
| Computer, 0,4 Mbit/s | ca. 4,7 s | ca. 6,3 s | ca. 9,8 s |

De achtergrond is maar 14 tot 27 KB van de ongeveer 380 KB in totaal. Wat het
meest weegt:

| Wat | Gewicht |
|---|---|
| Lettertypes | 151 KB, was 187 KB |
| JavaScript | 149 KB |
| Antwoord van de server | 0,7 tot 2,7 s |

De lettertypes heb ik lichter gemaakt: van Fredoka en Caveat laad ik nu alleen de
dikte die gebruikt wordt.

Het antwoord van de server is traag omdat het startscherm ook alle oude
onderdelen onder "Nog meer voor jou" ophaalt. Mag dat blok weg of naar een ander
scherm, dan wordt het startscherm sneller.

Nog een punt: het lettertype Inter wordt alleen in het beheer gebruikt, maar
laadt nu op elke pagina. Dat zou ik apart willen zetten. Dat heb ik niet gedaan
zonder jouw ja.

**Screenshots:** `~/Desktop/layout-screenshots`. Daar staan:
- `start-1366/1024/768/390.png`;
- `binnenkort-1366/390.png`;
- `naast-elkaar.png`, met het voorbeeld en alle breedtes naast elkaar.

**Wat nog afwijkt van het voorbeeld**
- Het sterrenwachtje met de vlag staat niet in het nieuwe plaatje.
- Het voorbeeld is wat paarser en voller, omdat daar 13 tegels staan.
- De mascotte is nog het bolletje.

## Wat er klaar is (ronde 1)

**De basis (één plek)**
- `src/app/avontuur.css` legt de hele stijl vast voor de code: de
  sterrenhemel, tegels, knoppen, kaarten en het tekstwolkje.
- De stijl staat in gewone taal in `STIJLGIDS.md`.
- `ONTWERPREGELS.md` zegt nu bovenaan dat deze stijl de oude Thuisles-stijl
  vervangt voor de hele website.
- Nieuwe lettertypes, allemaal van Google Fonts:
  - Fredoka voor titels;
  - Caveat voor handschrift;
  - Nunito voor tekst, zoals al gebruikt.
- De naam "Thuisles", het zinnetje en het motto staan op één plek:
  `src/lib/merk.ts`.
- De mascotte staat op één plek: `src/components/avontuur/HoofdMascotte.tsx`.
  Daar staat nu het tijdelijke bolletje-maatje.

**Het startscherm "Wat wil je doen?"** (`/start`)

Op het eerste scherm staan:
- linksboven het logo "Thuisles" met een geel sterretje, en daaronder "leren is
  avontuur!" in handschrift met een streepje;
- midden boven de grote witte titel met gele en oranje streepjes, en daaronder
  "Kies een vak en ga op ontdekking!";
- rechtsboven het afgeronde vakje met het plaatje van het kind en "Hoi
  Testkind! Fijn dat je er bent!";
- vier tegels met zelf getekende iconen:
  - Rekenen, paars, met + − × =;
  - Taal, roze, met twee tekstwolkjes;
  - Spelling, oranje, met abc;
  - Begrijpend lezen, geel, met een open boek. Die naam heeft een donkerbruine
    rand om de letters, zodat hij goed leesbaar is op het geel.
- rechts "Jij kunt het! ♡", links het maatje en linksonder "ONTDEK • OEFEN •
  GROEI".

Waar de tegels heen gaan:
- Rekenen gaat naar de bestaande rekenpagina (`/oefenen/rekenen`).
- Taal, Spelling en Begrijpend lezen gaan naar een nieuwe pagina "Binnenkort!"
  in dezelfde stijl. Daarop staan het icoon, het maatje met een tekstwolkje en
  een knop "Terug naar het begin".

**Werkt op elk scherm**
- Op 1366 en 1024 breed staan de vier tegels naast elkaar, zoals in het
  voorbeeld.
- Op 768 breed (tablet staand) en 390 breed (telefoon) staan er twee naast
  elkaar. Het maatje en "Jij kunt het!" staan dan onder de tegels.
- De tegels zijn 160 tot 240 pixels groot, ruim boven de 48 pixels.
- Alle knoppen zijn minstens 48 pixels hoog.

**Getest** als Testkind op 1366, 1024, 768 en 390 pixels breed. De
screenshots staan in `~/Desktop/layout-screenshots`:
- het voorbeeld zelf: `00-voorbeeld.png`;
- de vier breedtes: `start-*.png`;
- "Binnenkort!": `binnenkort-*.png`;
- voorbeeld en resultaat naast elkaar: `naast-elkaar-1366.png`.

Na de eerste screenshots heb ik dit verbeterd:
- de planeet en de wolkjes stonden op de verkeerde hoogte;
- "Hoi Testkind!" brak af over twee regels;
- de namen op de tegels waren te klein op een tablet;
- een ster viel over de titel.

## Waar het nog afwijkt van het plaatje

1. **Maar 4 tegels in plaats van 13.** Zo had je het gevraagd. Daardoor is het
   scherm rustiger en staan de tegels groter en meer in het midden.
2. **De mascotte** is nog het groene bolletje in plaats van het ruimtefiguurtje.
   Dat komt zodra jij de mascotte stuurt.
3. **Het plaatje van het kind** in het Hoi-vakje is de avatar uit het profiel.
   Bij Testkind is dat een bergje, geen gezichtje. Er zijn nog geen
   kindergezichtjes om uit te kiezen.
4. **De achtergrond** heeft sterren, een planeet, wolkjes en een heuvel. Het
   sterrenwachtje met de vlag rechtsonder heb ik weggelaten, net als de vele
   kleine glinsteringen. Wil je die erbij, dan teken ik ze.
5. **De naam** is Thuisles in plaats van Zappie, zoals gevraagd. Het motto
   eindigt daarom zonder "MET ZAPPIE".

## Wat ik heb laten staan (HARDE REGEL 1)

Het oude startscherm had meer dan het plaatje. Ik heb daar niets van
weggehaald. Alles staat nu ónder het eerste scherm, bij het kopje **"Nog meer
voor jou"**:
- het menu (Oefenen, Voortgang, Wereld, Maatje, Profiel), als knoppen in de
  nieuwe stijl;
- de sleutelteller, de naam en de groepwisselaar;
- het oude vakkenmenu, met ook Engels;
- Vrij oefenen, Oefenen volgens je methode, School & methode en de tipkaartjes;
- Jouw wereld en de vos met zijn tekstwolkje.

Verder:
- Op het startscherm en "Binnenkort!" staan geen zijbalk en geen balk onderaan,
  want die passen niet in het plaatje. Het menu staat daarom onder het eerste
  scherm.
- De begroeting met het dagdeel ("Goedemiddag") is op het startscherm
  vervangen door "Hoi …! Fijn dat je er bent!".

**Graag jouw besluit:** mag dit blok "Nog meer voor jou" zo blijven, of wil je
iets verplaatsen of weghalen? Ik haal niets weg zonder jouw ja.

De onderdelen zelf staan nog in de oude, lichte stijl, als witte kaarten op de
blauwe hemel. Die zet ik pas om na jouw goedkeuring.

## Voorstel voor de rest van de website

Na jouw goedkeuring, in deze volgorde, telkens met screenshots op de vier
breedtes:

1. **Onderwerpen.** Dat zijn de rekenpagina, de domeinen en de subdomeinen.
   - Sterrenhemel als achtergrond.
   - Elk onderwerp een tegel in de nieuwe stijl, met dezelfde vaste kleur per
     onderwerp.
   - De voortgangsbalk wordt een dikke, ronde balk.
   - Het menu wordt een rij ronde knoppen bovenaan, in plaats van de donkere
     zijbalk. Op de telefoon blijft het een balk onderaan, maar dan in de
     nieuwe stijl.
2. **Oefeningen.** Het oefenscherm heeft nu twee stijlen:
   - "nacht" voor de Godot-spellen;
   - licht voor de rest.

   Mijn voorstel is één stijl:
   - sterrenhemel als achtergrond;
   - de som op een wit vlak met een 3D-rand;
   - Controleer als groene 3D-knop.

   De regels voor de opdracht zelf blijven gelden: gele vakjes, tabellen,
   pijlen en geen cijfertoetsenbord.
3. **Maatje.** Het tekstwolkje wordt overal `av-wolkje`, en het maatje komt
   overal uit `HoofdMascotte`. Zodra de nieuwe mascotte er is, verschijnt hij
   dan in één keer overal.
4. **Ouderdeel.** Daarvoor stel ik een rustigere versie voor:
   - dezelfde letters en kleuren;
   - een lichte achtergrond met alleen een blauwe kopbalk met sterretjes;
   - geen scheve tegels;
   - kaarten met de zachte 3D-rand.

   Ouders lezen daar lange teksten, en dat leest beter op licht.
5. **Beheer** laat ik zoals het is, tenzij je dat anders wilt.

## Bestanden

- Nieuw:
  - `src/app/avontuur.css`
  - `src/lib/merk.ts`
  - `src/components/avontuur/` (Sterrenhemel, Glitter, VakIconen, VakTegel,
    Logo, HoofdMascotte)
  - `src/components/kind/navigatie.ts`
  - `src/app/(kind)/binnenkort/[vak]/page.tsx`
  - `STIJLGIDS.md`
  - dit rapport
  - `ontwerp/startscherm.png`
- Aangepast:
  - `src/app/(kind)/start/page.tsx`
  - `src/components/kind/Kindschil.tsx`: geen zijbalk op het startscherm en op
    "Binnenkort!".
  - `src/components/kind/Zijbalk.tsx`: het menu komt nu uit `navigatie.ts`.
  - `src/app/layout.tsx`: de lettertypes.
  - `ONTWERPREGELS.md`
- Ronde 2:
  - nieuw: `src/components/avontuur/Hemel.tsx`, `public/hemel/` (10 bestanden),
    `scripts/maak-hemel.mjs` en `ontwerp/achtergrond-breed.png`;
  - aangepast: `avontuur.css` (tegels, twinkelen, rand, gloed, schaduw op
    handschrift), `Sterrenhemel.tsx` (staat uit), het startscherm,
    "Binnenkort!" en `layout.tsx` (minder letterdiktes).
