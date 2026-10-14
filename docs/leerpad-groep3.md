# Jaarpad groep 3

De knop Mijn leerpad op de Zappie-startpagina opent `/zappie/leerpad`.
De jaarroute bevat 40 weken, 5 dagen per week en 3 stappen per dag. Alle 58
onderdelen uit de tabel van de opdrachtgever zijn gekoppeld aan kleinere
activiteiten. Deze algemene volgorde is geen verplichte nationale jaarindeling.

## Inhoud en bediening

Elke dag wisselt rekenen af met lezen/taal en spelling/schrijven. Donderdag
haalt eerder werk terug; vrijdag past het kind kennis toe met een ander
voorbeeld. De eerste versie bevat begeleide opdrachten, met concreet materiaal
en een observatiecriterium per stap. Het zijn nog geen 600 automatisch
nagekeken digitale lessen. Vooral spreken, handschrift en lezen vragen een
waarneming door een begeleider.

Groen betekent geoefend. Zelfstandig en met hulp blijven onderscheiden. Er wordt
geen beheersingsstatus in de centrale datalaag geschreven. Voortgang sluit aan
op de bestaande tijdelijke, per-kind browseropslag van Zappie. De bestaande
missiebeloning wordt één keer per stap toegekend; opnieuw oefenen betaalt niet
nogmaals. Er zijn geen database-, authenticatie- of hostingwijzigingen.

De rustige 2,5D-weergave gebruikt een transparante eilandillustratie met echte
HTML-knoppen, SVG-verbindingen, dialoogvensters en een weekkiezer. Alle 600
stappen zijn bereikbaar; er worden per keer 15 getoond. Alleen de huidige
stap kan voor het eerst worden afgerond. Vorige stappen kunnen opnieuw worden
geoefend. Het pad schuift naar de volgende stap, met respect voor reduced motion.

## Toetsvoorbereiding

Standaard zijn geen toetsperiodes ingesteld. De begeleider kan schoolweken en
een toetsnaam kiezen. Tijdens zo'n periode worden alleen eerder geoefende
activiteiten uit dezelfde vakbaan herhaald. Dit is een eerste herhaalmodus,
geen gevalideerde Cito-simulatie, adaptieve selectie of scorevoorspelling.
De oorspronkelijke nieuwe leerstof blijft in het begeleidersvenster staan als
inhaalwerk, zonder dubbele beloning. Na de periode keert de gewone route terug.

## Bronnen en inhoudelijke afbakening

- Gebruikerstabel met 58 onderdelen is de inhoudelijke basis.
- https://www.slo.nl/sectoren/po/kerndoelen/ — geraadpleegd 14 oktober 2026.
  Kerndoelen schrijven geen leerstof per schooljaar voor. De nieuwe doelen voor
  Nederlands en rekenen gelden sinds augustus 2026 met overgangsrecht.
- https://www.slo.nl/thema/meer/tule/rekenen-wiskunde/ en
  https://www.slo.nl/thema/meer/tule/nederlands/ — historische, voorbeeldmatige
  uitwerkingen bij kerndoelen 2006. Geen officiële certificering of exacte
  mapping van dit jaarpad naar alle nieuwe kerndoelen.

De lettervolgorde, voorbeelden en begeleiderscriteria blijven redactioneel te
beoordelen voor een brede uitrol. Schoolmethode en toetskalender zijn instelbare
afstemmingslagen, geen bron van overgenomen uitgeversvragen. Onbekende woorden
in luisterteksten worden voorgelezen; zelfstandig lezen en spellen gebruiken
alleen geïntroduceerde tekens. Handgeschreven opdrachten volgen het schoolmodel.

## Bestanden en verificatie

De bron van de jaarplanning is `scripts/maak-groep3-jaarpad.mjs`. Dit schrijft
`src/lib/leerpad/groep3.json`. De downloadbare jaartabel staat in
`public/assets/zappie/leerpad/jaartabel-groep3.csv`.

`node scripts/leerpad-controle.mjs` controleert de omvang, dagmix, dekking,
verwijzingen, slotjes, idempotente afronding, hervatten en toetsvoorbereiding.
De bestaande controles blijven van toepassing.

De eilandillustratie is met de ingebouwde imagegen gemaakt. Prompt: één vrijstaand
isometrisch blokkerig eiland, blauwgroen stenen platform, gras, twee kubische
bomen, waterval, rustige goudaccenten, transparant, geen tekst of knoppen.
Het resultaat staat geoptimaliseerd in `public/assets/zappie/leerpad/eiland.webp`.
