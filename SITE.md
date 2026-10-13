# De openbare site van Zappie

13 oktober 2026. De homepagina voor wie via Google binnenkomt, los van de
kinderkant en de ouderomgeving, maar in dezelfde huisstijl.

**Er gaat niets live voordat de eigenaar het zegt** ("niks gaat live totdat
alles af is"). Alles staat daarom op de branch `claude/epic-faraday-kdkb1w`
en niet op `main`: Railway zet `main` meteen online.

## Bekijken

- **Vercel-voorbeeld van de branch** (alleen met je Vercel-login):
  <https://thuisles-git-claude-epic-faraday-kdkb1w-benzol-pro.vercel.app/>
  en `/scholen`.
- **Op de laptop**: `git fetch` en `git checkout claude/epic-faraday-kdkb1w`,
  dan `npm run dev` en <http://localhost:3000/>. Heb je op die laptop al een
  kind gekozen, dan stuurt `/` je door naar Zappie (zoals altijd). Open dan
  een privévenster.

## Wat er is

| Adres | Wat |
| --- | --- |
| `/` | De homepagina. Een apparaat met een gekozen kind gaat door naar `/zappie`. |
| `/scholen` | De scholenkaart: alle 6.087 basisscholen, zoeken, per school de doorstroomtoets, de referentieniveaus en de bekende methode. "Koppel deze school aan mijn kind" gaat naar `/ouder/school`. |
| `/werkbladen` | Gratis werkbladen en posters. **Bestaat pas als er in beheer één aan staat**; tot dan 404 en niet in het menu. |
| `/admin/werkbladen` | Uploaden (PDF, PNG, JPG, WEBP, tot 7 MB), aan- en uitzetten, weghalen. |
| `/niveautest` | De gratis niveautest: kies de groep. **Bestaat pas als er in beheer een toets is samengesteld**; tot dan 404 en nergens een knop naartoe. |
| `/niveautest/5` | De toets van groep 5: uitleg, de vragen, en aan het eind de uitslag. |
| `/admin/niveautest` | Per groep de toets samenstellen uit bestaande leerdoelen. |

Code: `src/app/(site)/` (pagina's, `site.css`), `src/components/site/`,
`src/lib/site/`, `src/lib/data/werkbladen.ts`, `src/lib/data/niveautest.ts`,
`src/lib/niveautest-uitslag.ts`.

De homepagina toont alles als beschikbaar (keuze eigenaar). Wat er op
13 oktober 2026 nog **niet** bestaat en vóór livegang moet kloppen:

- de vertalingen (Turks, Arabisch, Pools zijn er als adres, niet als tekst);
- ondertiteling, een focusmodus voor ADHD, een dyslexie-instelling buiten de lessen;
- het automatisch koppelen van methodes per school (de methode wordt nu per
  school door ouders doorgegeven en in beheer gecontroleerd);
- de inhoud van de niveautest (het systeem is er; de toets stel je zelf samen,
  zie hieronder), de Zappie-box, betalen en de abonnementen;
- taal, spelling en lezen als oefenstof (nu vooral rekenen);
- werkbladen en posters (het systeem is er, de inhoud nog niet).

## De niveautest

**Samenstellen** in Beheer → Niveautest. Per groep (3 tot en met 8) een
rijtje onderdelen: een bestaand leerdoel, hoeveel vragen (1 tot en met 10) en
eventueel het referentieniveau (1F, 2F, 1S). Er wordt niets nieuws gemaakt: de
toets kiest bij elk bezoek willekeurig uit de gepubliceerde vragen van die
leerdoelen, en vragen voor de gekozen groep gaan voor.

**Zichtbaar** zodra één groep een onderdeel heeft met vragen die in de toets
passen: dan komen de knoppen op de homepagina, de link in de voet en
`/niveautest` in de sitemap (`niveautestBeschikbaar()` in
`src/lib/site/inhoud.ts`).

**De toets** (`src/components/site/Toetsspeler.tsx`) gebruikt dezelfde
tekening, vraagzin en antwoordvelden als de oefeningen (`Antwoordvelden` uit
`OefenSpeler.tsx`; daar is alleen `export` bijgekomen). Wat anders is:
- geen goed of fout tussendoor, geen tip, uitleg of feest;
- bij elke vraag de knop Volgende, ook bij meerkeuze, plus "Weet ik niet"
  (telt als niet goed);
- er wordt niets bewaard, ook geen uitslag.

**De uitslag**: per onderdeel 80% of meer goed is beheerst, 50% of meer
bijna, minder nog oefenen. Per referentieniveau (alle onderdelen met dat
niveau samen) 75% of meer is beheerst. Daaronder de drie zwakste onderdelen.
De grenzen staan op één plek: `src/lib/niveautest-uitslag.ts`.

**Doen niet mee** in de toets (in de oefeningen blijven ze gewoon staan):
vragen waarbij Vos meebeweegt (plaatjesraster, blokken, huizenrij), de bus,
de kralenrij, Godot-spellen, het bosspel en uitleg-lessen. Hun beeld wordt door
de oefenspeler zelf bestuurd. Beheer laat per onderdeel zien hoeveel vragen er
wél in passen.

## De scholenkaart bijwerken

```
node scripts/maak-scholenkaart.mjs
```

Haalt de nieuwste open data op (DUO, PDOK, CBS) en schrijft
`public/scholenkaart/scholen.json`, `public/scholenkaart/nederland.json` en
`src/lib/site/scholenoverzicht.json`. Eén keer per jaar, als DUO de nieuwe
uitslagen publiceert (meestal in het najaar). De adressen worden bewaard in
`node_modules/.cache/scholenkaart`, dus een tweede keer gaat snel.

DUO schermt aantallen van 1 tot en met 4 af. Die rekenen we als 2,5 en dan
staat er "±" bij het percentage.

## Live zetten (als de eigenaar het zegt)

1. Branch naar `main` (Railway bouwt dan vanzelf).
2. Op Railway de variabele `THUISLES_OPENBAAR=ja` zetten. Pas dan gaan `/`,
   `/scholen`, `/werkbladen` en `/niveautest` buiten het wachtwoordslot; alle
   kinder- en ouderpagina's blijven erachter (`src/proxy.ts`). Alleen lezen
   (GET) gaat langs het slot; een serveractie (POST) vraagt altijd het
   wachtwoord, ook op een openbaar adres.
3. De punten uit `JURIDISCH.md` onder "Vóór livegang" afvinken.
