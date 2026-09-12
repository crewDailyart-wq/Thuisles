# ⛔ HARDE REGEL — CLAUDE MAAKT NOOIT ZELF CONTENT AAN

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
