# RONDJE-TIMING-1

Alleen de code bekeken en vergeleken met de originelen in de scratchpad (`c-orig/`) en `git diff HEAD`. Geen bestand gewijzigd, geen schermfoto's gemaakt, geen tsc gedraaid (er was niets te controleren).

## 1. Klok
- `squla-klok-vlak.tsx` is gelijk aan het origineel: geen `wijs`-staat, geen `wijzerPunt()`, geen rondje.
- `squla-klok-tekenen.ts`: het rondje om de wijzerpunt staat er al niet meer. De zachte kleur (pil) staat er weer: oranje (uur) 0.42 en paars (minuten) 0.32. Het verschil met HEAD is alleen commentaar.
- `squla-klok.tsx`: de plekken waar `nadruk` gezet en weggehaald wordt (`metNadruk`, `zetN("min")`, `zetN("uur")`, `zetN(undefined)` en de keuzeklokken in de lus) zijn gelijk aan HEAD. Tekstwijzigingen in dat bestand komen van de andere assistent.
- Er licht verder niets op in de klok. Geen rondje toegevoegd.
- Gewijzigd: niets nodig.

## 2. Vlakken met een rondje-plaatje
- Dagen (`squla-dagen-trein.tsx`): het rondje hangt aan dezelfde `licht`-lijst als het oude oplichten van de wagon. Aangrenzende wagons krijgen 1 rondje samen. Het plaatje wordt vooraf geladen (`new Image()` in `useEffect`). Timing gelijk aan het oude oplichten. De wagon springt niet meer 8 px omhoog: de CSS `.licht` is leeg gemaakt (dat hoort bij het rondje).
- Rekentaal (`squla-rekentaal-keuken.tsx`): het rondje staat bij `markeer.includes(id) && !goed.includes(id)`. Dat is hetzelfde als vroeger: de gele ring werd door de groene ring overschreven zodra iets goed was. Het zetten en leegmaken van `markeer` in `squla-rekentaal.tsx` is gelijk aan het origineel. Plaatje vooraf geladen.
- Huisnummers (`squla-huisnummers-straat.tsx`): het rondje staat bij `licht` (een huis) op de plek van de oude gele gloed en het gele randje. Plaatje vooraf geladen.
- Gewijzigd: niets.

## Let op (niet in mijn bestanden, niet aangepast)
- `src/components/les/lessen/squla-huisnummers.tsx`, functie `uitleg`: `licht: 0` wordt gezet voor de eerste zin ("Ik loop langs de huizen..."). Dus het rondje staat bij huis 21 terwijl Bliepo nog niets over dat huis zegt. In HEAD was dat `licht: null`. Daarna `straat(l, { licht: 4 })` vóór `uitlegKeuze`: het rondje om het vraagteken-huis blijft staan tijdens de vraag aan het kind en wordt pas weggehaald in de laatste `straat`-aanroep. Dit komt uit de nieuwe uitleg van de andere assistent. Voorstel: `licht: null` bij de start. Het rondje om huis 4 tijdens de vraag is wel aanwijzen, maar moet Sara/de andere assistent bevestigen.

## 3. Tijd-kalender-1 en Piraat-2
- Kalender-1: ik vond in `squla-tijd.tsx` geen `l.verder()` en geen wachtende belofte zonder knop. Er zijn 2 plekken waar wachten normaal is. Bij elke kaartvraag wacht `l.wachtOpVlak("kaart")` op een tik van het kind, en dat is de bedoeling. De kaarten worden pas actief (`kaartenActief: true`) als de zin klaar is, dus een tik tijdens de zin doet niets. De les gebruikt `browserstem: true` (nieuwe zinnen met de browserstem); die heeft een vangnet van 2,5 s plus 120 ms per teken (`src/lib/stem.ts`) en blijft dus niet eindeloos hangen. De oorzaak van de 20 seconden is niet vast te stellen uit de code. Niets aangepast.
- Piraat-2: het vinkje is de `controleer`-knop van het les-scherm (`pzWachtVak` in `squla-piraat.tsx` roept `l.knoppen(["controleer"])` aan; `.vinkje` en `.rond` in `Lesscherm.module.css`). De plek van knop en herhaalknop wordt in het gedeelde `Lesscherm` bepaald (door de andere assistent aangepast). De laatste ster in het vak ligt in de vlakcode van splitsen (`squla-splitsen-vlak`). Dat is geen kleine, veilige aanpassing in mijn groep zonder het te zien. Niets aangepast.

## NIET GEZIEN
- Geen enkele schermfoto genomen: de timing is uit de code vergeleken, niet in beeld gezien.
- Niet gezien wanneer het rondje in Dagen, Rekentaal en Huisnummers echt verschijnt en verdwijnt, en niet of het rondje goed rond de wagon of het voorwerp staat.
- De 20 seconden bij Kalender-1 niet kunnen herhalen.
- Niet gezien hoe dicht het vinkje bij de herhaalknop staat bij Piraat-2.
- Geen tsc, geen speelcontrole, geen vloeiend-test (zoals afgesproken).
