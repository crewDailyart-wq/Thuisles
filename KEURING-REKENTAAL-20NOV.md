# Keuring Rekentaal (squla-rekentaal-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-rekentaal-gouden?naam=Testkind`.

## Uitslag: GOEDGEKEURD (met opmerkingen en 1 open punt)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-rekentaal-gouden.ts` | goed: 16 vragen, 29 foute antwoorden, 858 varianten, 492 beweringen waar, kiezer 31.872 keer nagespeeld |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (48 stappen); zweven 0 (702 metingen), F16 0, 15.47 0, F11 0; 10 met zin, 6 stil |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (107 stappen); zweven 0 (1852 metingen), F16 0, F11 0. (De eerste poging startte niet: "Chrome start niet", waarschijnlijk een poort die de andere keurder gebruikte; opnieuw gedraaid en goed.) |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 36 wachtmomenten van 3 s |
| Begin zonder tik | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-rekentaal-gouden.mjs` kleur, goed, anderefout, vangnet | "Alles in orde"; 0 keer een rondje bij een fout of om het antwoord; vangnet: na 20 s doet Bliepo de stap zelf en de les gaat door |
| `test-rekentaal-gouden.mjs` fouten, allefout | niet afgemaakt binnen de tijdslimiet van 10 minuten (zie open punt) |
| Inhoud (15.8) | 16 vragen (8 keuken, 8 picknick), zelfde voorwerpen, maten, keuzes en goede antwoorden als `squla-rekentaal` volgens het fouttabel-script |
| Witte rand / zweven (15.33, 15.34, F13, F14) | op de foto's geen witte rand meer; voorwerpen staan op tafel, kleed en plank; broodjes en de gele startstreep liggen nu op het kleed (eerder afgekeurd, nu goed) |
| Einde (15.50, 15.46) | goed |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/rekentaal/`, `tfoto/rekentaal-her1/`.

## Open punt (niet zeker, wel melden)

- **Eén keer bleef de les 6 minuten hangen bij het samen voordoen van vraag 9 ("Welke mand is het grootst?").** In de route
  "fouten" van het testscript stond na de 2e fout "Tik jij erop?" met een rood rondje om de grootste mand, maar de
  verder-pijl stond erbij (15.27 punt 3: bij een opdracht geen pijl) en de mand kon niet worden aangetikt; het testscript
  meldde 21 keer "pijl bij de opdracht samenTik (vraag9-grootst)" tot de tijdslimiet. Het vangnet van 20 s (dat in de route
  "vangnet" wél werkt) kwam niet. Foto: `tfoto/rekentaal/fouten-vraag9-grootst-samen.png`.
  Daarna 2 keer opnieuw gedraaid: vraag 9 ging toen goed (geen pijl, door naar vraag 15). Tussen 05:16 en 05:41 draaide er
  per ongeluk een tweede browser van mij tegelijk (mijn browserslot werd na 40 minuten als "vergeten" weggehaald terwijl
  het nog in gebruik was), en de andere keurder testte ook; het hangen (05:49) was kort daarna. Het kan dus aan de drukte liggen. Plek om te bekijken:
  `src/components/les/lessen/squla-rekentaal-gouden.tsx:480-510` (`tikSamen`, `zegOpdracht` en het vangnet).
  Ernst als het echt gebeurt: hoog (5.7 "de les mag nooit vastlopen").

## Opmerkingen (geen afkeur)

- Bij de keuzevragen met 2 voorwerpen zegt de hint na de 1e fout de regel zo dat er maar 1 voorwerp overblijft ("Zoek de schaal die het laagst is. Wat is zwaarder, denk je?", "Zoek waar niets in zit. Kies het glas dat leeg is."). Bij 2 keuzes kan dat haast niet anders en het script keurt het goed, maar het ligt dicht tegen 15.17.
- "Ja, deze is het." na het goed op volgorde zetten van de bekers (3 bekers, geen "deze") past niet helemaal bij wat het kind deed (15.48).
- "Inderdaad, nu is hij raak." klinkt wat vreemd voor groep 3 (uit het vaste rijtje).
- Bij "Welke mand is het grootst?" liep de zin op 1 foto tot vlak tegen de rechterrand van het scherm (`foto-goed/.../005.jpg`); het testscript meldt geen tekst buiten het vak.

## Goed bevonden (kort)

- Kiezen met een vinkje op het voorwerp en de knop Controleer; na een fout een rood rondje om wat het kind koos (nooit om het antwoord), dan de vraag in andere woorden.
- Weegschaal klopt (zwaar = laag), voorwerpen in de schalen; op volgorde met vakjes op de plank.
- Taal kort en gewoon; geen getallen nodig.

## Wat ik niet kon nagaan

- Echte stem, woord-oplichten en de geluiden zelf (headless, zonder geluid).
- De routes "fouten" en "allefout" van het testscript helemaal tot het eind (te traag voor 10 minuten met schermfoto's); de speelcontrole ALLEFOUT kwam wel tot het eind.
- Vloeiendheid (bewust niet), telefoon en tablet.
