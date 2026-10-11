# Layout-rapport: het nieuwe startscherm

11 oktober 2026, op de tak `nieuwe-layout` (vanaf `godot-lessen`).

Alleen het uiterlijk is veranderd. Oefeningen, voortgang, accounts en het
maatje werken zoals voorheen, en er is niets in de database veranderd.

## Wat er klaar is

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
