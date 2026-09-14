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

## Verplichte controle na elke wijziging aan een bestaand scherm

1. Maak vóór de wijziging een lijst van wat er op dat scherm staat: alle
   invoervelden met hun labels, alle knoppen, alle keuzelijsten.
2. Doe hetzelfde ná de wijziging.
3. Vergelijk die twee lijsten en **meld elk verschil expliciet** — ook als het
   klein lijkt, ook als het logisch voortvloeit uit de opdracht.

In de browser kan dat zo:

```js
[...document.querySelectorAll('label')].map(l => l.textContent.trim().split('\n')[0])
[...document.querySelectorAll('button')].map(b => b.textContent.trim())
```

Verplaats je iets bewust naar een ander scherm, controleer dan ook of de
serveractie van het ÓUDE scherm het veld niet meer meestuurt. Een formulier dat
een veld kwijt is maar de waarde nog wel leeg meestuurt, wist de instelling bij
elke volgende opslag.

## Waarom deze regel er is

"Vragen per oefensessie" moest twee keer worden gebouwd. Het veld verhuisde op
verzoek van het leerdoelscherm naar het sjabloonscherm, maar `bewerkLeerdoel`
bleef `vragenPerSessie` meesturen. Dat veld stond niet meer in dat formulier,
dus kwam het als lege waarde binnen en werd het als `null` over het opgeslagen
getal geschreven. Wie daarna de titel van een leerdoel aanpaste, raakte de
instelling kwijt zonder dat er iets misging op het scherm.

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
