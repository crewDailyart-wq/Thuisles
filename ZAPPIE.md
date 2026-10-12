# Zappie: de nieuwe startpagina (fase 1)

12 oktober 2026. Opdracht van de eigenaar: een hoogwaardige, werkende
startpagina voor Zappie, groep 3, met het meegestuurde voorbeeld als
richtlijn (`ontwerp/zappie/voorbeeld-startpagina.webp`).

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
  wereldpad, het oude vakkenmenu en Vos onderaan. De oefeningen zelf blijven
  bereikbaar via de tegel **Rekenen** onder "Vandaag oefenen" (naar
  `/oefenen/rekenen`, zoals op het oude scherm) en via het menu van de
  oefenschermen. De groep wisselen kan nog in de kopbalk van de oefenschermen.
- De website heet **Zappie**: `MERKNAAM` in `src/lib/merk.ts`. Alle zichtbare
  teksten, paginatitels en de namen van downloadbestanden halen de naam daar
  vandaan. Interne namen (cookies, opslag in de browser, de map met back-ups,
  de naam van de database) heten nog `thuisles`, zodat niemand wordt uitgelogd
  en de back-ups op dezelfde plek blijven.

| Adres | Wat |
| --- | --- |
| `/zappie` | De startpagina |
| `/zappie/oefenen?wereld=oceaan&missie=1` | Een missie van 15 sommen |
| `/zappie/wereld` | De drie werelden met hun missies |
| `/zappie/beloningen` | Punten en sterren |
| `/zappie/mijn-wereld` | Jouw wereld (eerste versie, nog niet bouwen) |

## Wat er werkt

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

## Bewust nog niet

- **De voortgang staat in de browser** (`localStorage`), per kind. Er komt dus
  niets in de database en niets in de voortgang van een echt kind. Gevolg: de
  punten gelden alleen op dit apparaat. Overzetten naar de database is één
  bestand: `src/lib/zappie/opslag.ts`.
- De Zappie-punten zijn nog niet gekoppeld aan de bestaande sleutels.
- De missies gebruiken nog niet de leerdoelen uit het beheer; de sommen worden
  in het geheugen gemaakt (`src/lib/zappie/missie.ts`).
- Taal en Denken staan erop met "Binnenkort".
- Zappie praat nog niet hardop; de golf beweegt op een vaste animatie.

## Beelden

Zie `public/assets/zappie/BRON.md`: welke beelden er zijn, hoe ze gemaakt zijn
en welke nog extern gemaakt moeten worden.

## Code

- `src/app/zappie/` — de pagina's
- `src/components/zappie/` — de onderdelen en `zappie.css`
- `src/lib/zappie/` — werelden, voortgang, opslag en de sommen van een missie
- `scripts/maak-zappie.mjs` — maakt de beelden
