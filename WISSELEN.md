# Plaatjes wisselen

Elk ding in de lessen (een appel, een bal, een raket) is één plaatje met een
vaste naam in `public/voorwerpen/`, bijvoorbeeld `appel.png`. Zolang jij het
nog niet gemaakt hebt, staat er een simpel tijdelijk plaatje. Vervangen
verandert niets aan de code.

## Wat jij doet

1. Open **MAGNIFIC-PROMPTS.md**. Daar staat elk plaatje met een nummer, de
   lessen waarin het voorkomt en een kant-en-klare prompt.
2. Kopieer de prompt naar Magnific, kies **vierkant (1:1)** en maak het plaatje.
3. Sla de plaatjes die je mooi vindt op in de map **`plaatjes-inbox/`**.
   De bestandsnaam maakt niet uit.
4. Zeg tegen Claude: **verwerk de inbox**.

## Wat Claude dan doet

1. Claude bekijkt elk plaatje zelf en zoekt uit welk plaatje uit de lijst het
   is. Twijfelt Claude, dan vraagt Claude het aan jou.
2. Claude maakt een **controle-overzicht** (`plaatjes-inbox/overzicht.html`).
   Daarin zie je per bestand wat Claude ziet, aan welk plaatje het gekoppeld
   wordt, en hoe het eruitziet als het is uitgeknipt.
   **Er wordt pas iets vervangen als de controleur akkoord geeft** (besluit 8 november 2026: de controleur keurt plaatjes, BOUWREGELS 1.20; Sara keurt ze zelf niet).
3. Na jouw akkoord, per plaatje:
   - de witte achtergrond eruit knippen (op de laptop zelf, gratis);
   - verkleinen en lichter maken, zodat de les snel opent en vloeiend blijft;
   - opslaan onder de juiste naam;
   - het oude plaatje bewaren in `plaatjes-backup/`.
4. Claude opent de lessen met dat plaatje en maakt schermfoto's op laptop en
   tablet. Claude controleert dat niets verschoven of afgesneden is.
5. Het origineel gaat naar `plaatjes-verwerkt/`. In **PLAATJES-STAND.md** staat
   wat al vervangen is en wat nog openstaat.

## Goed om te weten

- Maak het plaatje op een **effen witte achtergrond**. Dat staat al in de prompt.
- Er mogen geen mensen, gezichten, kaders of tekst op staan. Een dier mag
  alleen twee stipjes als ogen hebben.
- Vind je een vervangen plaatje toch niet mooi? Dan zet Claude het oude terug
  uit `plaatjes-backup/`.

---

*Voor Claude en helpers (technisch):*

- **De lijst met plaatjes:** `src/lib/voorwerpen/lijst-*.ts` (één bestand per
  onderwerp; zoek eerst of een ding al bestaat).
- **In een les:** zet `voorwerpen: [...]` in het draaiboek. Teken in een vlak
  met `tekenVoorwerp` of `voorwerpTextuur` uit `src/components/les/voorwerpen.ts`.
- **Lijst bijwerken:** `npm run voorwerpen` controleert de lijst, maakt de
  tijdelijke plaatjes en schrijft MAGNIFIC-PROMPTS.md en PLAATJES-STAND.md opnieuw.
- **"Verwerk de inbox":**
  1. `node scripts/inbox/voorbeelden.mjs`, en dan elk `.voorbeeld/*.klein.png` zelf bekijken;
  2. `plaatjes-inbox/koppeling.json` schrijven, met `akkoord: false` en `naam: null` bij twijfel;
  3. `node scripts/inbox/overzicht.mjs`, overzicht.png aan Sara laten zien en op haar akkoord wachten;
  4. `node scripts/inbox/schermfotos.mjs voor <namen>`;
  5. `akkoord: true` zetten en `node scripts/inbox/verwerk.mjs` draaien;
  6. `node scripts/inbox/schermfotos.mjs na <namen>`, `.schermfotos/vergelijk/` bekijken en `LESSEN=<ids> npm run overlap` draaien.
