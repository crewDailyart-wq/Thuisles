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

Code: `src/app/(site)/` (pagina's, `site.css`), `src/components/site/`,
`src/lib/site/`, `src/lib/data/werkbladen.ts`.

De homepagina toont alles als beschikbaar (keuze eigenaar). Wat er op
13 oktober 2026 nog **niet** bestaat en vóór livegang moet kloppen:

- de vertalingen (Turks, Arabisch, Pools zijn er als adres, niet als tekst);
- ondertiteling, een focusmodus voor ADHD, een dyslexie-instelling buiten de lessen;
- het automatisch koppelen van methodes per school (de methode wordt nu per
  school door ouders doorgegeven en in beheer gecontroleerd);
- de niveautest (zie hieronder), de Zappie-box, betalen en de abonnementen;
- taal, spelling en lezen als oefenstof (nu vooral rekenen);
- werkbladen en posters (het systeem is er, de inhoud nog niet).

## De niveautest: nog te bouwen

De homepagina beschrijft hem, maar er staat nergens een knop naar
(`niveautestBeschikbaar()` in `src/lib/site/inhoud.ts`). De speler moet de
bestaande vraagweergave van de oefeningen gebruiken; dat raakt de oefenspeler
en valt onder `ONTWERPREGELS.md`. Voorstel staat in het verslag aan de eigenaar.

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
   kinder- en ouderpagina's blijven erachter (`src/proxy.ts`).
3. De punten uit `JURIDISCH.md` onder "Vóór livegang" afvinken.
