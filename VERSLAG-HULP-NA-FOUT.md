# Verslag: hulp na een fout in de Squla-lessen (5 november 2026)

## Wat er gedaan is
- Alle Squla-lessen (135) hebben nu de hulp zoals Synthesis: bij de eerste fout een korte reactie op wat het kind koos plus een hint die past; bij de tweede fout legt Bliepo uit waarom het goede antwoord klopt en het kind gaat door. Geen "Niet helemaal", geen pauze, geen keuze "hulp of nog een keer", geen naam in een fout-reactie.
- Reacties zijn per soort vraag herschreven (BOUWREGELS 5.11). Bij goed: alleen een korte bevestiging uit een gedeelde lijst van 16 woorden, af en toe met de naam (hoogstens 2 keer per les, eindkaart inbegrepen).
- Cijferafspraak 3.20 toegepast in alle hulpzinnen.
- De Synthesis-analyse staat in SYNTHESIS-ANALYSE/REACTIES.md.

## Gecontroleerd (bijgewerkt 5 november 19:30)
- **Alle drie de speelrondes zijn nu gehaald op de definitieve zinnen:** alles goed (alle lessen tot het eind), alles fout (0 fouten; 40 lessen hebben een stap die alleen in de tekening kan) en via Nee (0 fouten; 38 met een stap in de tekening). Nergens 'Niet helemaal' of 'pauze', de naam valt nergens vaker dan 2 keer per les.
- Terugkomende vragen: wisselende aankondiging en, als een teruggekomen vraag weer fout is, een korte vriendelijke afsluiting zodat het niet oneindig doorgaat.

## Eerdere stand
- Speelcontrole (alles goed, alles fout, alles fout via Nee) op alle 135 lessen: op de vorige zinnen alle lessen foutloos (sommige hebben een stap die alleen in de tekening kan). (Dit is later afgemaakt, zie hierboven.)
- Twee onafhankelijke keuringen (CONTROLE-SQULA.md, REACTIES-VERBETERLIJST.md, REACTIES-EINDKEURING.md). De laatste reparaties daarna zijn nog niet opnieuw gekeurd.
- Scripts: scripts/check-zinnen-herhaling.cjs (6 zinnen vaker dan 2 keer: vraagzinnen en één kernzin), scripts/check-getalwoorden.cjs (4: geen hoeveelheden).

## Niet bewezen
- Hoe de zinnen hardop klinken (Ruth is nog niet ingesproken).
- De sleeplessen zijn niet met de muis geprobeerd; de speelcontrole kan niet slepen.
- `npm run bewaak` faalt op 12 lessen door een bestaand probleem: de check herkent de samengestelde les-ids (piraat, plus-bus, plus-kaal) niet. De lessen zelf zijn wel gespeeld.

## Voor Sara
- Hoelaat-1 (door jou goedgekeurd) is iets veranderd: eerste-fout-hint en uitleg na de tweede fout zijn nu klok-eigen; de goed-zinnen zijn gelijk gebleven.
- "Tegenovergestelde" is in meten en tijd vervangen door "het andere van …".
- "Nu komen er nog 3 vragen van net terug." is een vaste lesopbouwzin in 19 tot 27 lessen (kern).
- Ongebruikte oude code (route met "Niet helemaal" en pauze, WELKOM_VINK, TELWOORD) staat er nog; verwijderen alleen met jouw akkoord.
- Stemzinnen: 17.028 zinnen, 597.870 tekens nog niet met Ruth opgenomen. Pas inspreken als de tekst definitief is; geef eerst akkoord (regel 9).
- Niets gecommit, niets online.

## Aanvulling 6 november (ochtend)
- `npm run opgaven` herkent nu ook de 12 lessen met samengestelde namen (groen).
- Vloeiend-test sleept nu echt (kiest Ja, wacht tot het stuk aan te raken is, blijft binnen het scherm). Laptop: alle sleeplessen 60 beelden/s, 0-1 px. Trage telefoon: Splitsen 2-1, 2-2 en Verdelen meestal goed; af en toe valt 1 meting uit.
- OPEN: Minsommen in de ruimte (3 lessen) haperen op de trage telefoon 1 keer 65-97 ms rond 2,5 s na openen (eis: hooguit 50 ms). Niet de SVG-briefjes, niet het tekenen van de plaatjes; profiel toont Chrome-zelf (tekenen van de pagina). Daardoor is `npm run bewaak` nog rood bij onderdeel vloeiend.
- Overige onderdelen van de bewaking (overlap, speel, stemlessen, stemcontrole) los gedraaid: allemaal goed.
- Controleur (CONTROLE-LAATSTE-REPARATIES.md): 9 punten. Opgelost: naam op eindkaart (dagen, huisnummers, rekentaal), "Ik heb al ... geteld" (rekenmix), vraagteken in tekstwijzigingen.json, geld-hint bij 2 groepjes. Blijft staan voor Sara: "het andere van", buurgetal 2x genoemd (getallenlijn/huisnummers), hint met nieuwe vraag in klok, "Vergelijk ... met elkaar", 2 stijve zinnen.
- Geraakte lessen (dagen, huisnummers, rekentaal, rekenmix, geld; 25 lessen) opnieuw gespeeld: goed, alle fout en via Nee, 0 echte fouten.
- Met de hand in Chrome geprobeerd (muis): Splitsen 2-1 (tegel slepen) en Verdelen (knikkers slepen): werkt.

## Aanvulling 6 november (middag): rood rondje in plaats van gloed
- Sara wilde dat wat Bliepo aanwijst of noemt een echt rondje krijgt, in plaats van op te lichten. Het rondje is een met de hand getekend rood stiftrondje (Magnific, 3 voorbeelden, 195 tegoed; Sara koos nummer 1). Achtergrond weggehaald met een eigen script (geen extra tegoed). Plaatje: `public/rondje/rondje-rood.png`.
- Eerst alleen bij `squla-splits-splitsen2-1`, daarna ook in alle geld-lessen (`squla-geld-*`, ook bij wat Bliepo telt en bij wat het kind kiest). Andere lessen onveranderd. Aan/uit per les: `rondje` (splitsen: optie in `les()`; geld: `LEEG`).
- Goed (groen) en fout (rood) houden hun gloed.
- Gezien: rondje om briefje en munten (Splitsen 2-1) en om de munt van 1 euro (geldmachine 1). Niet apart gezien: rondje om het huisje, rondje bij het tellen en bij kiezen in geld.
- Speelcontrole (goed, alles fout, Nee) Splitsen 2-1/2-2: goed; geldmachine 1 en zakgeld 1 (Nee): goed. Snelheid van het rondje is nog niet gemeten.
- Vloeiend, Minsommen: op een lokale echte bouw (poort 3101) openen de Minsommen-lessen op de laptop in 0,5-1,0 s en haperen 37-68 ms; op de trage telefoon openen ze in ~1,9-2,0 s en haperen 72-116 ms. Ook andere lessen (Tellen, plus-bakkerij) openen daar traag (1,3-2,6 s). Niet opgelost; een helper onderzoekt het (ONDERZOEK-MINSOMMEN-HAPERING.md).
- Helpers aan het werk: handtest sleeplessen (HANDTEST-SLEEPLESSEN.md), Minsommen-hapering, onafhankelijke controle van het rondje (CONTROLE-RONDJE.md).

## Aanvulling 6 november (avond/nacht): rondje, oplichten, tests, opruimen
**Voor Sara, in het kort:** alles wat je vroeg is gedaan, behalve wat op jouw akkoord of op latere momenten wacht (Ruth inspreken, online zetten, geluidje beluisteren).

### Rondje (BOUWREGELS 7.8) en oplichten (7.9)
- Het dubbele rondje (Magnific, `public/rondje/rondje-rood-2.png`) staat in alle Squla-lessen waar Bliepo iets aanwijst, noemt of telt; één rondje tegelijk, op dezelfde momenten als het oude oplichten. Foto's en oordelen per les: statuspagina `/voorbeeld/lessen-bijhouden` (onderdeel "Rondje-controle"; foto's maak je met `npm run rondjecontrole`, `ROUTE=nee,fout` neemt ook late uitleg en het moment na een fout op).
- Rondjes die het antwoord verklapten (Min-ruimte, Min-bus, Plus-bakkerij) gaan nu weg vóór de vraag. Twee rondjes tegelijk (Tijd, zondag en maandag) zijn opgelost. Rondjes ontbraken en zijn toegevoegd bij Pizza, Min-machine (stippen), Piraat-2 (ster die wegvalt), Verdelen en Meer-minder.
- **Oplichten** (alleen waar een rondje onhandig is): de wijzers van de klok en de schilderijen bij Meten. Het ding zelf krijgt een sterke glow langs zijn eigen rand (klok: oranje/paars; schilderijen: warm goud), zacht pulserend, geen vlak of kader. Klok: de grote wijzer is korter zodat hij de getallen (12) nooit bedekt; geen gloed om de hele klok. De wagons van de weektrein houden een rondje. Het oplicht-geluidje staat voorlopig UIT (`OPLICHT_GELUID = false` in `squla-klok-vlak.tsx`). Welke lessen oplichten gebruiken en waarom: statuspagina, onderdeel "Oplichten in plaats van rondje".
- Open punten uit het onderzoek "waar is het rondje onhandig": `RONDJE-ONHANDIG.md` (ik koos per geval volgens 7.9: klok, wagons (rondje), schilderijen).

### Overige wijzigingen
- Oude hulp-route ("Niet helemaal", "Wil je hulp?", pauze) uit `squla-hulp.ts` en `squla-uitleg.ts` gehaald. Ook 6 oude tik-functies + 5 ongebruikte hulpjes in `squla-splitsen.tsx`, `metJa` (Piraat) en `WELKOM_VINK` (Klok). Backups in `backups/oude-code-20261106/` (niet in Git).
- Tekstpunten van de controleur (5), "het omgekeerde van" (Meten, Tijd), Rekenmix mix3-1 (kleinste bal links: kleinst, kleiner, klein), Min-bus/Plus-bus ("In de cirkel staat …" i.p.v. "het rondje"), Splitsen 2-1 (briefje en munten in twee zinnen), Piraat-2 (vinkje verder van de herhaalknop; geldt voor alle lessen met een vinkje), **Tellen-telrij-1/-2: bij "Nee" nu eerst uitleg** (Bliepo loopt langs de huizen; `voordoen: true`).
- Fout gevonden en gerepareerd: de knikkers bleven in Verdelen (Nee-route) onzichtbaar.

### Tests (na alle wijzigingen)
- **Speelcontrole:** 17 veranderde lessen in Nee, alles fout en alles goed + steekproef over alle soorten (30 alles fout, 12 Nee, 15 alles goed): geen enkele echte fout. (De ids `...-memory` zijn geen lessen: 404; het memory-spel zit in Tellen resultatief 3-1 en 3-2 en is voor 3-1 met de hand gespeeld: werkt; 3-2 niet kunnen testen, Chrome-extensie verbroken.)
- **Snelheid** (laptop + trage telefoon): 261 metingen vloeiend (60 beelden/s, hapering ≤ 50 ms), ook Minsommen in de ruimte; 3 uitschieters bij drukte waren bij hermeting goed. De opentijd (< 1 s) kan alleen op de echte site worden gemeten.
- **Handtest sleeplessen:** ongeveer 21 lessen met de hand gesleept; geen problemen.
- Computer: 8 GB; meer dan 3-4 helpers/Chrome's tegelijk geeft nepfouten. Nieuwe bewaker `scratchpad/bewaker2.sh` herstart de server als een les 404 geeft.

### Niet gedaan / wacht op jou
- **Ruth inspreken** (17.028 zinnen, ~598.000 tekens): pas als alle groepen af zijn; jij beslist.
- **Online zetten:** pas na jouw "zet online". Niets gecommit.
- **Geluidje bij oplichten:** staat uit; beluisteren als je het weer wilt.
- Wagons: rondje (geen oplichten). Tellen-telrij: uitleg toegevoegd; speelcontrole liep goed.

### Bewaking na alle wijzigingen (6 november, nacht)
- schermen, bewaking, oefentypes, bosspellen, opgaven, overlap, stemlessen, stemcontrole: allemaal goed (exit 0). Snelheid en speelcontrole apart gedaan (zie boven).
- Bliepo-controle: 24 schermen goed bij rustige computer. Bij hoge belasting faalde elke keer 1 ander scherm (tekst "nog niet getekend": hoogte 0); dat is een valse melding van de meting, geen fout in de lessen. De hele `npm run bewaak` in één keer is niet gedraaid (die zou snelheid en speelcontrole dubbel draaien).
