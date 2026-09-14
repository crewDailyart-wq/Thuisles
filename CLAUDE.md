# ⛔ HARDE REGEL 1 — NIETS WAT AL BESTAAT MAG VERDWIJNEN

Geldt voor de HELE website: kinderkant, ouderomgeving, beheeromgeving, alles.

**Bij elke wijziging aan een bestaand scherm, formulier of functie blijft alles
wat er al stond gewoon werken en zichtbaar.**

Je verwijdert nooit een veld, knop, instelling of functie zonder dat de eigenaar
daar expliciet om vraagt. Twijfel je of iets nog nodig is: vraag het, verwijder
het niet.

Dit gaat niet alleen over wat je ziet. Een instelling kan ook verdwijnen doordat
een opgeslagen waarde stilletjes wordt overschreven — zie de oorzaak hieronder.
Zowel het veld als de waarde erachter moet blijven.

## De bewaking

```
npm run bewaak
```

Twee controles, die allebei stoppen met een foutmelding:

- **`npm run schermen`** loopt langs elk scherm uit `scripts/schermcontract.mjs`
  en faalt zodra een veld of knop er niet meer staat. Draait de dev-server
  ernaast, dan wordt het echte scherm opgehaald; zo niet, dan wordt er in de
  bronbestanden gekeken.
- **`npm run bewaking`** speelt na of een opgeslagen instelling overleeft wat
  er daarna gebeurt: een titel aanpassen, een groep aanpassen, een sjabloon
  erbij. Dat gebeurt op een **wegwerpkopie** van de database in een tijdelijke
  map — de echte database wordt alleen gelezen.

**Dit draait automatisch vóór elke commit** (`.githooks/pre-commit`, aangezet
door `npm install`). Een commit komt er niet door als er iets ontbreekt.

Bouw je een veld of knop bij, zet die dan meteen in het contract. Haal er nooit
een regel uit om een foutmelding weg te krijgen, en gebruik `--no-verify` niet
om er langs te komen: herstel het scherm, of vraag het eerst. Meld elk verschil
expliciet — ook als het klein lijkt, ook als het logisch voortvloeit uit de
opdracht.

**Het handmatige lijstje van hiervoor is met opzet vervallen.** Dat werkte niet,
om drie redenen: er faalde niets, het keek alleen naar het scherm dat je toch al
aan het bewerken was, en het voorgeschreven `querySelectorAll('label')` vindt
niets wat achter een knop als "Bewerken" zit — dat gaf zowel vals alarm als
valse rust.

Verplaats je iets bewust naar een ander scherm, controleer dan ook of de
serveractie van het ÓUDE scherm het veld niet meer meestuurt. Een formulier dat
een veld kwijt is maar de waarde nog wel leeg meestuurt, wist de instelling bij
elke volgende opslag. Let daarbij op het verschil tussen "leeg = zet terug op de
standaard" en "leeg = niet aanraken"; zie `bewaarSjabloon` in
`src/lib/data/sjablonen.ts`.

## Waarom deze regel er is

"Vragen per oefensessie" moest drie keer worden nagelopen. Het veld verhuisde op
verzoek van het leerdoelscherm naar het sjabloonscherm, maar `bewerkLeerdoel`
bleef `vragenPerSessie` meesturen. Dat veld stond niet meer in dat formulier,
dus kwam het als lege waarde binnen en werd het als `null` over het opgeslagen
getal geschreven. Wie daarna de titel van een leerdoel aanpaste, raakte de
instelling kwijt zonder dat er iets misging op het scherm.

De derde keer was het veld er nog wél, maar alleen achter de knop "Bewerken"
en helemaal niet op het scherm Nieuw sjabloon. Een instelling die je pas ziet na
een klik, is voor wie hem zoekt hetzelfde als een instelling die weg is. Daarom
staat hij nu ook in het leesblok en bij het aanmaken, en bewaakt het
schermcontract alle drie de plekken.

Het gevolg: je kunt er niet meer op vertrouwen dat wat je hebt ingesteld,
ingesteld blijft. Daarom geldt de regel voor het hele platform en hoort de
controle hierboven bij elke wijziging.

---

# ⛔ HARDE REGEL 2 — CLAUDE MAAKT NOOIT ZELF CONTENT AAN

**Claude maakt nooit zelf content aan in de database.**

Dat betekent: geen vragen, geen leerdoelen, geen domeinen, geen subdomeinen,
geen sjablonen. Ook niet tijdelijk. Ook niet "even om iets te testen". Ook niet
als het meteen daarna weer wordt opgeruimd.

De eigenaar van dit project is de enige die content toevoegt, via het
admin-formulier of via een upload die die zelf start.

Dit geldt voor elke manier waarop content in de database kan komen:

- geen `insert` vanaf de commandoregel of via een script;
- geen seed-, demo- of voorbeelddata in code;
- geen testfixtures;
- geen migratie of opstarthook die content aanmaakt, aanvult of terugzet;
- geen "een paar voorbeelden zodat ik het kan laten zien".

## Heb je testdata nodig?

Vraag het eerst en **wacht op antwoord**. De eigenaar bepaalt of het mag en wat
er precies in komt. Niet alvast aanmaken in afwachting van toestemming.

Kan iets zonder testdata niet gecontroleerd worden, zeg dat dan gewoon: meld
wat je niet hebt kunnen verifiëren, in plaats van er zelf data voor te maken.

## Waarom deze regel er is

Er zijn drie keer dingen in de database verschenen die niemand had ingevoerd:
7 onverwachte onderwerpen, omschrijvingen die na een herstart terugkwamen, en
meerkeuzevragen bij REK-GET-TEL-01. De eerste twee kwamen uit een
seed-mechanisme (`vulStructuur()` en `vulNieuweKolommenAan()` in
`src/lib/db/sqlite.ts`); die zijn verwijderd. De derde was testdata die Claude
zelf had aangemaakt om een schermontwerp te kunnen controleren.

Het gevolg was elke keer hetzelfde: je kunt niet meer vertrouwen op wat er in
je eigen database staat, en je weet bij het opruimen nooit zeker of iets echt
weg blijft.

De code is hierop vastgezet: een lege database blijft leeg en er is geen enkel
automatisch mechanisme meer dat content aanmaakt of aanvult. Houd dat zo — voeg
er ook geen nieuwe aan toe.

---

@AGENTS.md
