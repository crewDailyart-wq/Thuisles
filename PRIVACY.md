# PRIVACY REVIEW REQUIRED

Besluit Sara, 19 november 2026 (ALLE-VRAGEN.md, DEEL B, vraag B5 en B6: "ja").
Zie ook BOUWREGELS.md, regel 15.42.

## De afspraak

**Alles op deze pagina regelen we voordat er echte kinderen op de site komen, met een juridische controle.**
Tot dan:
- bouwen we hier niets nieuws voor;
- oefent alleen het profiel **Testkind**;
- zet niemand iets van deze punten aan bij een echt kind.

Is een punt geregeld, dan zet je erachter: datum, wat er besloten is en wie het juridisch heeft nagekeken.
Niets op deze pagina weghalen (harde regel 3); een opgelost punt krijgt "OPGELOST" met datum.

---

## A. De naam van het kind hardop met de stem van Ruth

- **Wat:** Bliepo zegt de voornaam van het kind hardop met de stem van Ruth (ElevenLabs).
- **Waarom privacy:** de voornaam gaat dan naar ElevenLabs, een bedrijf buiten Nederland.
- **Nu:** alleen een plan, niet bouwen. Zie BLIEPO-KARAKTER.md §13 (plan), BOUWREGELS.md 3.17 en KEUZES-VOOR-SARA.md Ronde 15 (A).
- **Voor echte kinderen nog regelen:** mag dit, toestemming van de ouder, wat er in de privacyverklaring staat, hoe lang ElevenLabs het bewaart.
- Code die er al met de naam werkt (alleen ter informatie, niet veranderen): `src/lib/stem.ts`, `src/lib/stem-server.ts`, `src/app/api/stem/route.ts`, `src/app/ouder/acties.ts` (naamfragment).

## B. Het bewaren van denkfouten

- **Wat:** bij elk fout antwoord bewaart de les welke denkfout het kind waarschijnlijk maakte (BOUWREGELS.md 15.9 punt 4, 15.11).
- **Waarom privacy:** dit zegt iets over hoe een kind denkt en leert; het is voor een later ouderdashboard.
- **Nu:** het ouderdashboard bouwen we niet. Er komt geen content in de database (harde regel 2).
- **Voor echte kinderen nog regelen:** hoe lang bewaren, toestemming van de ouder, wat er in de privacyverklaring staat, wie het kan zien. Zie KEUZES-VOOR-SARA.md Ronde 17.
- Code (alleen ter informatie): `src/lib/data/lesuitkomsten.ts` (tabel `les_uitkomsten` in `src/lib/db/sqlite.ts`), `src/lib/data/dashboard.ts`, `src/lib/data/voortgang.ts`.

## C. De voorbeeldpagina bewaart alleen voor Testkind (strenger maken)

- **Besluit Sara (19 november 2026, B5: ja):** de voorbeeldpagina (`/voorbeeld/les/<id>?naam=...`) mag **nooit** iets bewaren, behalve voor Testkind.
- **Nu (nog niet streng genoeg):** weet de site niet van welke pagina de tik komt (geen Referer), dan bewaart hij wél.
- **TODO (aparte code-klus, nog NIET gedaan):**
  - `src/lib/data/lesuitkomsten-voorbeeld.ts`, functie `voorbeeldMagBewaren`: bij geen (leesbare) Referer geeft hij nu `true` (regel 12, "geen (leesbare) Referer ...").
  - `src/app/lesuitkomstacties.ts` regel 20: hier wordt `voorbeeldMagBewaren` gebruikt.
  - Let op: de gewone kinderkant (buiten `/voorbeeld`) moet blijven werken zoals hij werkt (harde regel 1). Dus een manier vinden om een voorbeeldtik zeker te herkennen, ook zonder Referer.
  - Na de klus: testen als Testkind en nakijken dat er bij een ander profiel niets bijkomt in `les_uitkomsten`.
- **CODE-KLUS GEDAAN (19 november 2026; nog geen juridische controle, dus dit punt is nog niet OPGELOST):** zonder (leesbare) Referer kijkt de server nu naar de routeboom die Next.js bij elke serveractie meestuurt (kop `next-router-state-tree`). Staat de les op /voorbeeld, of weet de server het niet: alleen bewaren voor Testkind. De gewone kinderkant (een andere pagina) werkt zoals hij werkte. Code: `voorbeeldMagBewaren` en `routeIsVoorbeeld` in `src/lib/data/lesuitkomsten-voorbeeld.ts`, `src/app/lesuitkomstacties.ts`. Test zonder database: `npx tsx scripts/test-voorbeeld-bewaren.ts`.

## Waar dit nog meer staat

- BOUWREGELS.md 3.17 (naam), 15.9 punt 4 (denkfout bewaren), 15.11 (voortgang), 15.23 (privacy open tot vóór echte kinderen), 15.42 (deze pagina).
- KEUZES-VOOR-SARA.md Ronde 15 (A), Ronde 17, Ronde 46 (A13), Ronde 48 punt 4, Ronde 50.
- BLIEPO-KARAKTER.md §13.
