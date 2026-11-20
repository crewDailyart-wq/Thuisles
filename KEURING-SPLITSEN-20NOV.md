# Keuring Splitsen (squla-splits-splitsen1-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/splitsen-poging1`, `foto-goed/squla-splits-splitsen1-1-gouden`, `foto-allefout/squla-splits-splitsen1-1-gouden`, `test-splitsen-*`, `begin`, `begin2`).

## Oordeel: AFGEKEURD (voorlopig) — de verplichte speelcontrole faalt; oorzaak niet gevonden

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-splitsen-gouden.ts` | goed (552 beweringen, 121 foute antwoorden, geen verklapper). Fouttabel-bestand bleef gelijk. |
| speelcontrole **GOED** | **faalt, 2 van de 2 keer**: "langer dan 5 seconden niets te tikken ("Sleep nu de andere pionnen naar het oranje vak.")" |
| speelcontrole ALLEFOUT | tot het eind (62 stappen), 0 fouten; F11 0, F16 0; `goed-na-hulp` 5 keer |
| `test-splitsen-gouden.mjs` goed, allefout, ja-proef, nee-alles-goed | alle 4 "Alles in orde", tot de eindkaart, database niets bijgekomen |
| Inhoud t.o.v. de oude les (15.8) | zelf vergeleken: de 15 vragen (`squla-splitsen-gouden-zinnen.ts:92-108`) zijn gelijk aan `squla-splitsen.tsx:1262-1277` |

## Fouten

1. **Speelcontrole GOED loopt vast in de Nee-route, met een leeg scherm** — ernst: **middel tot hoog (als een kind het kan krijgen), anders testprobleem** — regel 15.18 (nooit vastlopen), 15.37, 12 (speelcontrole moet groen zijn).
   - In de GOED-run tikt de speler bij de startvraag "Nee" (dat is het "goede" antwoord voor de speler). Daarna staat er "Sleep 1 pion naar het paarse vak. Pak een pion met je vinger of de muis en sleep hem naar een vak." maar **het huisje met de pionnen én Bliepo zelf zijn weg** (alleen de achtergrond en de tekst; schermfoto `foto-goed/splitsen-poging1/001.jpg` en `foto-goed/squla-splits-splitsen1-1-gouden/001.jpg`). Bij "Sleep nu de andere pionnen naar het oranje vak." is er niets om te slepen en loopt de speler vast.
   - In het eigen testscript (`SCENARIO=nee-alles-goed`, echte muisklikken) gaat dezelfde Nee-route wél goed: huisje en Bliepo staan er (`test-splitsen-nee-alles-goed/02-uitleg.png`). Het verschil is dat de speelcontrole met JavaScript op "Nee" tikt. Ik heb de oorzaak niet gevonden. Gisteren (keuring 19 nov) ging de speelcontrole GOED voor deze les wel goed.
   - Advies: uitzoeken of dit alleen aan de speler ligt; tot dan geldt de verplichte controle als niet gehaald.

## Kleine opmerkingen

2. Eén keer (schermfoto `begin/…-14s.png`) bleef bij het openen 14 s alleen de gedimde lesachtergrond staan, zonder afspeelknop en zonder Bliepo ("de afspeelknop-laag lag er na 9 s nog"). Een tweede keer ging het meteen goed (`begin2/…-0s.png`). Waarschijnlijk de drukke ontwikkelserver; op de echte site nog eens kijken (15.38).
3. In de foto's van de speelcontrole stond bij de eerste opdracht een paar keer nog geen huisje (de verschijn-animatie, hologramstraal) terwijl de opdracht al in beeld was. Op een rustige computer zag ik het huisje wel meteen opbouwen (`begin2/…-0s.png`).

## Nagekeken en in orde

- Startvraag (hoofdstuk 4, mag bij Splitsen): groet en vraag in 1 alinea ("Hoi Testkind! Fijn dat je er bent. We gaan pionnen en ballen verdelen over 2 vakken. Kun jij deze 5 pionnen al splitsen?"), met het huisje als voorbeeld; Ja = proef, Nee = uitleg (scenario's ja-proef en nee-alles-goed in orde).
- Kijk als een kind (14.23): huisje, pionnen, ballen, de zak, het tienvak met doek: groot, telbaar; pionnen zitten in de vakken, niets steekt meer door het dak (F18 opgelost), geen witte rand.
- Getallen in de kleur van het vak (paars/oranje), totaal wit.
- Hints verklappen niet (fouttabel-script, en bijvoorbeeld "Hoeveel liggen er onder de doek? Sleep zoveel ballen naar het vak.").
- Keuzevraag "Hoeveel pionnen zijn er samen?" met keuzes rechts onder Bliepo (15.32).
- Na samen doen groen + `goed-na-hulp` (15.49); eind: eindzin + "Tik op de kaart."; kaart links (15.46, 15.50).
- Geen "nagekeken", disco of "vinkje" in een zin; cijfers.

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken, de duur van het rode scherm, tablet/telefoon, vloeiendheid (bewust later), de oorzaak van fout 1.


## Herstel (20 november 2026)

Niets aan de les of de test veranderd. Opnieuw gedraaid op een rustigere server: speelcontrole GOED liep tot het eind (18 stappen, 0 fouten) en ALLEFOUT ook (72 stappen, 0 fouten). Het lege scherm van de keuring kwam niet terug; waarschijnlijk de drukke ontwikkelserver (de site werd toen opnieuw gebouwd), net als bij Rekentaal. Let op: 18 stappen is weinig; nog niet nagekeken of de speler deze keer de Nee-route nam.
