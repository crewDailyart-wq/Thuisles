# Keuring Meten (squla-meten-oppervlakte-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: GOEDGEKEURD (met opmerkingen)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-meten-gouden.ts` | goed: reken-, verklap- en waarheidscontrole in orde; inhoud gelijk aan de oude les (15.8). Bestand ongewijzigd. |
| speelcontrole GOED | goed, tot het eind; F16 0, 15.47 0, F11 0; 11 met zin, 4 stil |
| speelcontrole ALLEFOUT | F16 0, F11 0; 15 met zin na hulp, 0 zonder zin (15.49 goed); 15.47: 52 keer telwoord mét opdracht erboven, **1 melding** "In beeld alleen: "2."; te tikken: (niets)" — de speelcontrole zet de les daardoor op ✗. Zie hieronder: geen lesfout. |
| `test-meten-gouden.mjs` route allefout (foto's) | na 10 minuten gestopt bij vraag 7 van de 11 (laptop zeer druk); geen fout gemeld tot dat moment |
| begincontrole | goed (15.38) |

Foto's: scratchpad `k20d1/foto-GOED/squla-meten-…/`, `k20d1/foto-ALLEFOUT/squla-meten-…/`, `k20d1/testfoto-meten-gouden/`.

## De 15.47-melding uitgezocht: geen lesfout

De melding kwam 2 keer terug (19 november: "1.", vandaag: "2."), altijd met **niets om te tikken**. Dat is het moment waarop Bliepo **zelf** telt, zonder dat het kind iets hoeft te doen:
- bij "Zijn de matten even groot?" telt Bliepo eerst mat 1 (1, 2, 3, 4) en daarna mag het kind mat 2 tellen;
- bij de blauwe en gele vorm telt Bliepo eerst de 8 blauwe hokjes en daarna telt het kind de gele.

Code: `telZelf` in `src/components/les/lessen/squla-meten-gouden.tsx:693-704`, aangeroepen op `:724` (mat 1) en `:729` (blauw). Daar zegt Bliepo alleen het getal (`zegDoor(l, ZIN.telGetal(...))`) en wacht de les niet op een tik. 15.47 en 15.37 gaan over momenten waarop de les op het kind **wacht**. Zodra het kind zelf moet tellen (`telSamen`, `:666`), blijft de opdracht wél boven het getal staan (`zegTelwoord(l, opdrachtZin, …)`), en dat telt de speelcontrole 52 keer goed.

Waarom de controle toch afgaat: `scripts/vraag-aanwezig-controle.mjs:111` telt "er is een tekening (canvas) in beeld" ook als "de les wacht", en kijkt dan 0,8 s naar een kort telwoord (`:131-134`). Bij Bliepo's eigen tellen staat het getal soms 0,8 s alleen, dus 1 melding. **Dit is een vals alarm van de controle, geen lesfout.** Advies (voor de bouwer, niet door mij gedaan): in de 15.47-meting alleen meetellen als er echt iets te tikken is.

## Opmerkingen (geen afkeur)

- Het kaartje "Blauw is 8 hokjes groot." loopt net onder de rand van het kaartje uit (foto `foto-ALLEFOUT/…/020.jpg`).
- Tijdens het samen tellen van de gele hokjes blijven de 3 kaartjes rechts staan (niet tikbaar); dat kan afleiden.
- Pijl zonder tekst bij "stil bij goed": gedeeld lesscherm, zie Dagen.

## Goed bevonden

Kaartjes van "Wat klopt er? Kies er 2." staan nu rechts onder Bliepo (15.32, besluit 19 november) en een gekozen kaartje krijgt alleen een vinkje, geen gloed (7.8a, 15.33) — beide vorige twijfels zijn opgelost. Het goede antwoord klopt met het beeld (boot 6 tegels, boom 12, planeet 20: boot kleinst en planeet grootst). Afspeelknop, vraag altijd in beeld, typen in een echt invulvak, geen dubbele tekst, geen "nagekeken", eindzin + "Tik op de kaart." en afscheid na de tik (`:1015-1022`), eindkaart links, groen + geluid na samen doen (`:866-868`), 2 pogingen, cijfers, hints verklappen niet.

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), vraag 8 t/m 11 en de eindkaart in het testscript (tijdslimiet; de speelcontrole kwam wel tot de eindkaart).

## HERSTELD 20 november 2026: vals alarm van de 15.47-controle

- `scripts/vraag-aanwezig-controle.mjs`: de 15.47-meting telt alleen nog als er echt iets te tikken is in de DOM (het kind is aan de beurt). Telt Bliepo zelf (`telZelf`, niets te tikken), dan geen melding meer.
- Nagekeken met een klein proefje in Chrome: de oude fout (opdracht weg, kind moet tikken, alleen "2." in beeld) wordt nog steeds gevonden; het moment van Meten (Bliepo telt zelf, niets te tikken) niet meer. De oude versie van het script gaf bij dat tweede geval wél een melding.
- Speelcontrole Meten na het herstel: GOED en ALLEFOUT tot het eind, 15.47: 0 meldingen (ALLEFOUT: 52 keer telwoord met opdracht erboven).
- NIET GEDRAAID tot het eind: `test-meten-gouden.mjs` route allefout stopte na 10 minuten zonder uitslag (laptop zeer druk, net als bij de keuring); de speelcontrole kwam wel tot het eind.
