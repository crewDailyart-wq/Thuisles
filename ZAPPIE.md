# Zappie: de nieuwe startpagina

12 oktober 2026. Opdracht van de eigenaar: een hoogwaardige, werkende
startpagina voor Zappie, groep 3, met het meegestuurde voorbeeld als
richtlijn (`ontwerp/zappie/voorbeeld-startpagina.webp`).

13 oktober 2026. Tweede opdracht: "Maak de startpagina levend en
interactief", met een nieuw voorbeeld
(`ontwerp/zappie/voorbeeld-startpagina-2.webp`). Gebouwd in vijf fasen, elk
een eigen commit: (1) de opbouw volgens het nieuwe voorbeeld, (2) een levende
ruimte, (3) de draaiende aarde, (4) Zappie leeft, (5) beloningen aan de echte
voortgang. Zie "Het tweede ontwerp" hieronder.

## Waar het staat

Alles staat onder **`/zappie`**.

**Sinds 12 oktober 2026 is dit de startpagina** (keuze eigenaar: "vervang /start
door /zappie en noem alles Zappie"):

- De voordeur `/`, het kiezen van een kind en elke knop "Start" in de
  kinderkant gaan naar `/zappie`.
- `/start` stuurt door naar `/zappie` (`redirects` in `next.config.ts`), zodat
  oude links en bladwijzers blijven werken. Het oude startscherm "Wat wil je
  doen?" wordt dus niet meer getoond. Het bestand staat er nog
  (`src/app/(kind)/start/page.tsx`); of het weg mag, beslist de eigenaar.
- Wat alleen op het oude startscherm stond, is daarmee niet meer te zien: het
  rekenpaneel (vrij oefenen en de volgorde van de methode), de tipkaartjes, het
  wereldpad, het oude vakkenmenu en Vos onderaan. Sinds de samenvoeging met
  nieuwe-layout (13 oktober 2026) staat dat allemaal op **Meer** (`/meer`), te
  bereiken via het menuknopje naast het tandwiel rechtsboven. De oefeningen
  zelf zitten achter **Oefenen** in het menu (het rekenscherm in sterrenstijl,
  `/rekenen`), de kaart **Schoolpad** (naar `/oefenen/rekenen/methode`) en het
  menu van de oefenschermen.
- De website heet **Zappie**: `MERKNAAM` in `src/lib/merk.ts`. Alle zichtbare
  teksten, paginatitels en de namen van downloadbestanden halen de naam daar
  vandaan. Interne namen (cookies, opslag in de browser, de map met back-ups,
  de naam van de database) heten nog `thuisles`, zodat niemand wordt uitgelogd
  en de back-ups op dezelfde plek blijven.

| Adres | Wat |
| --- | --- |
| `/zappie` | De startpagina |
| `/zappie/oefenen?wereld=oceaan&missie=1` | Een missie van 15 sommen |
| `/zappie/oefenen?vrij=1` | Een vrije missie (telt niet mee voor het pad) |
| `/zappie/wereld` | De drie werelden met hun missies |
| `/zappie/beloningen` | Tokens, vrije plekken en sterren |
| `/zappie/mijn-wereld` | Jouw wereld (eerste versie, nog niet bouwen) |

## Wat er werkte na het eerste ontwerp

Een deel hiervan is in het tweede ontwerp anders geworden; zie de tabel
"Wat er veranderde" verderop.

- Menu links (Start, Oefenen, Wereld, Beloningen); op telefoon onderaan.
- Logo, Zappie-punten en profiel bovenaan. Is er op dit apparaat een kind
  gekozen, dan staan zijn naam en plaatje er; anders "Hoi!".
- Zappie als losse SVG met bewegende onderdelen: dobberen, wielen, zwaaiende
  hand, knipperende ogen, gloeiende antennes en een geluidsgolf als hij praat.
  Tik op Zappie, een dichte wereld of Taal/Denken en hij reageert.
- De drie werelden als losse, zwevende bollen met een gestippeld ontdekpad.
  Oceaan is open en toont de voortgang (0 / 12); Aarde en Universum hebben een
  slotje. Een wereld gaat open zodra alle missies van de vorige klaar zijn.
- "Start oefenen" gaat meteen naar de volgende missie.
- Een missie: 15 plus- of minsommen tot en met 10 (om en om), getallen vooral
  in het bovenste deel van het bereik, geen dubbele. Echt invoerveld met alleen
  cijfers (HARDE REGEL 5), bolletjes in rijtjes van 5, "Nog niet helemaal" in
  plaats van fout, goed of fout pas na Controleer.
- Punten: 10 per som die meteen goed is, 5 bij de tweede keer, 50 voor de hele
  missie. De teller telt geanimeerd op.
- Groot liggend scherm: alles in een 16:9-vlak dat meeschaalt, zoals het
  voorbeeld. Telefoon en staande tablet: onder elkaar, zonder zijwaarts schuiven.
- "Minder beweging" zet alle animaties uit.

## Het tweede ontwerp (13 oktober 2026)

### Wat er veranderde ten opzichte van het eerste ontwerp

Op aanwijzing van het nieuwe voorbeeld. Niets hiervan is stilletjes
verdwenen; het schermcontract (`scripts/schermcontract.mjs`) bewaakt de
nieuwe teksten.

| Was | Is nu |
| --- | --- |
| Menu links (telefoon: onderaan) | Vier losse knoppen bovenaan (telefoon: nog steeds onderaan) |
| "Wereld" in het menu | "Werelden" |
| "Start oefenen" | "Begin je missie", met een lichtstreep en een korte glans bij het klikken |
| "Vandaag oefenen" met Rekenen, Taal (Binnenkort), Denken (Binnenkort) | "Vandaag op ontdekking" met Schoolpad, IEP Sprong (Binnenkort) en Vrije Missie |
| Tegel Rekenen naar `/oefenen/rekenen` | Menuknop Oefenen naar `/rekenen` (het rekenscherm van nieuwe-layout); Schoolpad naar `/oefenen/rekenen/methode` |
| — | Menuknopje naast het tandwiel naar Meer (`/meer`), zoals het ronde knopje van nieuwe-layout |
| Zappie-punten | Tokens, met een strook "Op weg naar je volgende beloning!" |
| Klein paneel "Jouw wereld" | Groot paneel rechtsonder met eiland, water, wolken en lichtjes |
| Twee antennes, ogen als boogjes | Eén antenne, open ogen die knipperen (zoals het nieuwe voorbeeld) |

### Wat er nu werkt

- **Fase 1 — opbouw.** Logo linksboven, vier menuknoppen, Oceaan groot links,
  Aarde kleiner en verder weg, Universum rechts, "Begin je missie" in het
  midden, Zappie links vooraan, "Vandaag op ontdekking" linksonder, de
  tokenstrook en het grote paneel "Jouw wereld" rechtsonder. Alle maten in
  eenheden van het 1672 × 941-voorbeeld, dus alles schaalt mee.
- **Fase 2 — levende ruimte** (`Heelal.tsx`, `Sterrenveld.tsx`). Sterren in
  drie dieptes die langzaam drijven en fonkelen, acht gouden sterren met gloed
  en af en toe een twinkeling, gouden stofjes, om de 9 à 17 seconden een
  vallende ster, nevels die heel langzaam verschuiven, gloed om de verre
  planeten en lichtstralen boven de horizon. Met een muis bewegen de lagen een
  paar pixels mee (parallax); niet op een aanraakscherm.
- **Fase 3 — de draaiende aarde** (`DraaiendeAarde.tsx`). Een echte bol met
  perspectief, eilanden, ondiep water, stranden, bos, een losse wolkenlaag die
  iets sneller draait en schaduw werpt, een dampkring en zonlicht van links.
  Geen WebGL of te traag apparaat: dan blijft de vaste achtergrond staan.
- **Fase 4 — Zappie leeft** (`Zappie.tsx`). Knipperen, af en toe een
  glimlach, hoofd en ogen volgen de muis, zwaaien bij binnenkomst en daarna
  wijzen naar "Begin je missie", rollen met draaiende wielen, de geluidsgolf
  als hij praat, blije ogen bij goed nieuws.
- **Fase 5 — beloningen aan de echte voortgang.** Na een missie: gouden
  vonkjes op "Missie klaar!", de tokens tellen op. Terug op de startpagina
  vliegt een gouden lichtje van de tokenmunt naar de Oceaan, de Oceaan licht
  op, het volgende lichtje op het pad gaat aan en Zappie zegt wat er verdiend
  is. Om de 250 tokens komt er een plek vrij in Jouw wereld: een gouden straal
  boven het paneel, en op `/zappie/mijn-wereld` krijgt die plek een gouden ster
  met "Vrij!". Beloningen toont hoeveel plekken er vrij zijn en hoeveel tokens
  er nog nodig zijn.
- **Vrije Missie**: 15 sommen, tokens tellen mee, het pad niet.
- **Zuinig en rustig.** Alleen `transform` en `opacity` bewegen (de canvas- en
  WebGL-lagen tekenen zelf). Alles stopt als het tabblad niet zichtbaar is.
  Bij "minder beweging" staat alles stil en verschijnen beloningen meteen.
  Tijdens een missie staat de ruimte stil, zodat niets afleidt van de sommen.

### Afwijkingen van de opdracht

- **Three.js / React Three Fiber** werd voorgesteld voor de aarde. Gebouwd als
  één eigen WebGL-shader zonder extra pakket: dat is veel kleiner (geen
  honderden kB extra) en doet hetzelfde voor één bol met wolken en dampkring.
- **Rive** werd voorgesteld voor Zappie. Zappie is een SVG met losse delen en
  CSS-animaties: er is geen Rive-bestand, en een nieuw bestand maken kan alleen
  in de Rive-editor. Komt er een, dan kan het erin.
- **Snelheid van de aarde**: gevraagd was één rondje per 3 à 5 minuten. Omdat
  we zo dicht bij de bol kijken, schoof het land dan zichtbaar snel voorbij.
  Nu één rondje per 30 minuten (`OMLOOP_SECONDEN` in `DraaiendeAarde.tsx`); dat
  is één getal om aan te passen.
- **IEP Sprong** staat erop met "Binnenkort": er is nog geen inhoud voor. Een
  tik geeft een uitleg van Zappie. *Let op: "IEP" is de naam van een toets van
  een ander bedrijf; laat juridisch nakijken of die naam zo gebruikt mag
  worden.*
- **Oefenen** in het menu gaat naar het rekenscherm van nieuwe-layout
  (`/rekenen`), niet naar een nieuw Zappie-scherm (keuze eigenaar).
- **Op telefoon** zit de tokenstrook onder de vouw. Het lichtje vliegt dan van
  buiten beeld naar de Oceaan, en de gouden straal boven Jouw wereld valt
  buiten beeld; Zappie zegt het wel.

## Bewust nog niet

- **De voortgang staat in de browser** (`localStorage`), per kind. Er komt dus
  niets in de database en niets in de voortgang van een echt kind. Gevolg: de
  punten gelden alleen op dit apparaat. Overzetten naar de database is één
  bestand: `src/lib/zappie/opslag.ts`.
- De tokens zijn nog niet gekoppeld aan de bestaande sleutels.
- Bouwen in Jouw wereld kan nog niet: de plekken komen vrij, maar er valt nog
  niets te kiezen.
- De missies gebruiken nog niet de leerdoelen uit het beheer; de sommen worden
  in het geheugen gemaakt (`src/lib/zappie/missie.ts`).
- IEP Sprong staat erop met "Binnenkort".
- Zappie praat nog niet hardop; de golf beweegt op een vaste animatie.

## Beelden

Zie `public/assets/zappie/BRON.md`: welke beelden er zijn, hoe ze gemaakt zijn
en welke nog extern gemaakt moeten worden.

## Code

- `src/app/zappie/` — de pagina's
- `src/components/zappie/` — de onderdelen en `zappie.css`
- `src/lib/zappie/` — werelden, voortgang, opslag en de sommen van een missie
- `scripts/maak-zappie.mjs` — maakt de beelden
