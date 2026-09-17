# Tellen tot 20 — 22 Thuisles-generators

Gebouwd op verzoek van de eigenaar: eigen spelvormen per oefensoort, met de
bestaande huisstijl, sleutelbeloning en uitlegspeler. De oude huisjesdemo is
behouden. Het nieuwe overzicht staat op `/voorbeeld/tellen`.

## Voorbeeld en echte oefening

- Het overzicht laat alle 22 generators spelen. De voorbeelden en oefensleutels
  blijven alleen in het geheugen. Er worden geen vragen, leerdoelen, sjablonen,
  voortgang of sleutels in de database aangemaakt door deze pagina.
- Alle generators zijn geregistreerd in `alleGeneratoren`. De eigenaar kan ze
  kiezen bij Beheer → Rekenen → Sjablonen → Nieuw en zelf aan leerdoelen koppelen.
- Een opgeslagen vraag gebruikt vorm `bosspel` en draait in `OefenSpeler`.
  Het antwoord gaat via de bestaande `kies → controleer → leg` route. Echte
  sleutels en voortgang worden dus door de bestaande serveracties afgehandeld.
- Groep 3–4 krijgt bij een fout automatisch de bestaande `Uitlegweergave`.
  Het nieuwe model `bosspel` toont hetzelfde rekenbeeld in de uitleg. Hogere
  groepen volgen de bestaande verdeling van animatie en compacte stappenlijst.

## Bestanden

- `src/lib/generatoren/bosspellen-catalogus.ts`: 22 eigen ontwerpen en leerdoelen.
- `src/lib/generatoren/bosspellen.ts`: instellingen, deterministische opgaven,
  unieke handtekeningen, antwoorden, foutpatronen en uitleg voor groep 3–8.
- `src/components/oefenen/BosSpel.tsx`: invoer en gedeelde rekenbeelden.
- `VosSleepSpel.tsx`: telrijen en ordenen gebruiken nu de bestaande `Stapstenen`
  met de eigen springende Thuisles-vos. Pointer-events ondersteunen muis en touch;
  aantikken en toetsenbord zijn alternatieven. Geplaatste getallen kunnen terug.
  Het antwoord is pas beschikbaar als alle stenen gevuld zijn. De vos springt
  na goedkeuring door naar de sleutel; het feest wacht op zijn aankomst.
- `Stapstenen.tsx`: optionele sleepbediening; bestaande getypte invoer blijft
  standaard. Stenen zijn nu ook met het toetsenbord bereikbaar.
- Appels en sterren tellen gebruiken de bestaande `Plaatjesraster` met de
  wachtende, vangende en blije vos. De overige korte animaties wachten 1,1 seconde.
- `BosDecor.tsx` en `BosAvontuur.module.css`: catalogus en overige spelvormen.
- Direct voorbeeld: `/voorbeeld/tellen?spel=bos-springpad`.
- `src/components/oefenen/BosOverzicht.tsx`: zelfstandige voorvertoning zonder databaseacties.
- `scripts/bosspellen.mjs`: controles in geheugen; onderdeel van `npm run bewaak`.

## Brononderzoek en begrenzing

Referentie: https://www.rekenen-oefenen.nl/rekenen-groep-4/getallen/tellen-tot-en-met-20

Het openbare overzicht bevat 22 links naar oefensoorten. Alle links zijn
opgevraagd, maar de meeste detailpagina's weigeren geautomatiseerde toegang.
Van drie detailpagina's was tekst via de zoekdienst beschikbaar. Dit is dus
geen volledige controle van alle achterliggende vragen of interactieve
bediening van Junior Einstein. De catalogus vertaalt de zichtbare vaardigheden
naar eigen ontwerpen; bij onduidelijke namen is de spelvorm een eigen interpretatie.
Er zijn geen afbeeldingen, opgavenbestanden of uitlegfilmpjes overgenomen.

## Controle

TypeScript en ESLint zijn gecontroleerd. De rekencontrole behandelt 1783 opgaven
over 22 generators, inclusief grenzen, voorspelbare generatie, unieke varianten,
antwoordvolgorde en scripts voor zes groepen. In een DOM-test zijn toetsenbord,
antwoordkeuze, mand vullen, pointer-slepen naar stenen, toetsenbordplaatsing en terugnemen voor alle
22 generators doorlopen. De bestaande bewaking slaagt.

Een echte browserautomatisering kon door een fout in het lokale browserhulpmiddel
niet starten. Visuele controle en beloning/voortgang met echte gepubliceerde
vragen moeten nog worden geprobeerd. Er is bewust geen databasecontent voor
die test aangemaakt. De database had al wijzigingen bij aanvang van deze taak;
die zijn niet teruggezet. Er is niet gecommit of gepusht.
