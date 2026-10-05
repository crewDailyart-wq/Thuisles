---
name: verbeter-thuisles
description: Verbeter het bestaande Thuisles-leerplatform voor Nederlandse basisschoolkinderen in groep 3–8 met visueel ontwerp, kindvriendelijke interacties en implementatie in de bestaande code. Gebruik bij Thuisles-schermen, oefenflows en visuele reviews, niet voor een los nieuw platform.
---

# Magic Path voor Thuisles

Werk als productontwerper en frontendontwikkelaar aan het bestaande Thuisles. Communiceer in helder Nederlands. Maak leren aantrekkelijk met duidelijke hiërarchie, originele illustraties en rustige interacties. Dit is een instructieplugin voor de hostagent, geen verbinding met de externe dienst MagicPath en geen zelfstandig ontwerpprogramma.

## Begin bij het echte platform

Gebruik de huidige Thuisles-werkmap; zoek niet stilzwijgend een ander project. Lees AGENTS.md, package.json, thuisles-projectcontext.md en de bestanden voor het gevraagde scherm. Controleer bestaande wijzigingen voordat je schrijft. Lees voor Next.js-code de relevante lokale handleiding in node_modules/next/dist/docs/. De geïnstalleerde versie en recente gebruikerskeuzes gaan voor oudere projectnotities.

Bekijk het huidige scherm via beschikbare browsertools als er een draaiende preview is. Start anders de bestaande ontwikkelserver als dat voor de opdracht nodig is. Vraag alleen om ontbrekende projecttoegang als bestanden en preview echt niet beschikbaar zijn. Verzin geen visuele inspectie.

Lees [de projectkaart](references/projectkaart.md) voor ingangen in de code en controleer deze tegen de huidige bestanden. Gebruik echte componenten en data. Geef bij een review concrete bevindingen; voer bij een verbeteropdracht de relevante wijzigingen uit en controleer het resultaat. Een verzoek om alleen ideeën is geen opdracht om code te wijzigen.

## Visuele richting

Behoud de herkenbare Thuisles-huisstijl tenzij de gebruiker die wil veranderen. Bouw voort op bestaande tokens, typografie, pictogrammen, mascotte en wereldonderdelen. Geef het gevraagde scherm een heldere hoofdactie, een leesbare schaal en consistente afstanden. Gebruik illustraties om uitleg, oriëntatie en voortgang te ondersteunen. Vermijd een overdaad aan kaartjes, decoraties, badges en bewegende elementen rond de oefening.

Stem af op de gekozen groep en het leerdoel:
- Groep 3–4: korte concrete instructies, beeld naast tekst, duidelijke stap voor stap interactie en royale antwoordknoppen.
- Groep 5–6: overzichtelijke keuzes, visuele rekensteun waar nuttig en zichtbare voortgang binnen de oefening.
- Groep 7–8: een speelse maar niet kleuterachtige stijl, bondige uitleg en meer zelfstandigheid.

Gebruik een groep niet als harde grens voor beheersing; leerdoelen kunnen meerdere groepen bestrijken. Als leeftijd onbekend is, leid die af uit het bestaande scherm en maak de gekozen aanname zichtbaar.

## Oefenen en toegankelijkheid

Houd per oefenstap duidelijk wat het kind moet doen. Laat invoer, controle, hint en volgende stap voorspelbaar werken. Geef specifieke hulp na een fout, bijvoorbeeld ‘Nog niet helemaal. Kijk nog eens naar de tientallen.’ Behoud de bestaande registratie van direct goed, goed na hulp en meerdere pogingen. Markeer een antwoord nooit goed om alleen een animatie te tonen.

Gebruik echte buttons en links, zichtbare toetsenbordfocus en labels bij pictogrammen. Streef naar aanraakvlakken van minstens 44 bij 44 CSS-pixels. Controleer tekstcontrast; communiceer goed/fout ook met tekst of vorm. Respecteer reduced motion. Maak slepen ook met klikken of toetsenbord mogelijk wanneer je een sleepinteractie toevoegt. Geluid mag geen vereiste zijn om een opdracht te begrijpen; gebruik bestaande geluidsvoorkeuren.

Beloningen ondersteunen oefenen en afronden. Voeg geen straf voor gemiste dagen, publieke ranglijsten, willekeurige betaalbeloningen of nieuwe munteneconomie toe als onderdeel van een visuele opfrisbeurt. Behoud bestaande spelregels tenzij de opdracht ze expliciet verandert.

## Grenzen van het product

Laat schermen de bestaande datalaag gebruiken. Behoud kindprofielen, ouderkeuze, routes, voortgang en werkende oefenlogica. Verander geen authenticatie, database, hosting of betaalmodel voor een ontwerpverbetering. Gebruik originele oefeningen en afbeeldingen; neem geen uitgeversmateriaal of concurrentontwerp over. Onbekende schoolmethodes blijven expliciet onbekend. Introduceer geen extra persoonsgegevens, tracking of externe gegevensoverdracht als vormgevingsdetail.

## Afronden

Controleer gewijzigde schermen op een smalle telefoonbreedte, tablet en desktop met beschikbare browsertools. Loop de aangepaste hoofdinteractie door, inclusief fout/hulp/volgende stap als relevant. Controleer overflow, tekstafbreking, focus en verminderde beweging. Draai passende bestaande lint-, scherm- en oefencontroles; breid alleen uit als de wijziging dat rechtvaardigt. Vermeld expliciet wat niet kon worden geverifieerd. Lever werkende wijzigingen met een korte uitleg van het zichtbare voordeel en een preview of screenshot wanneer beschikbaar. Claim geen bewezen leerwinst zonder onderzoek.
