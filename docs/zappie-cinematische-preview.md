# Zappie — cinematische homepage, werkversie

Branch: `feature/zappie-cinematische-homepage-20261013`. De wijzigingen staan los van `main`; deze versie wordt niet automatisch naar de huidige productiesite overgezet.

## Wat deze wijziging toevoegt

De bestaande Zappie-startpagina, oefeningen, wereldvoortgang en ouderomgeving blijven behouden. De slogan onder het logo is verwijderd en het logo staat recht, volgens de ontwerpwijziging van de eigenaar.

Onder de bestaande startsectie staan negen vaktegels, een voertuigwerkplaats en een accessoire-atelier. Rekenen gebruikt de bestaande route. Nog niet beschikbare vakken melden dat duidelijk. De werkplaats laat drie bouwplannen zien met de bestaande missievoortgang, niet een verzonnen bouwtimer. De voertuigen zijn nog niet speelbaar.

Het atelier kan accessoires en een kleur werkelijk op de bestaande SVG-robot passen en weer verwijderen. Dit verandert geen opgeslagen profiel en schrijft geen tokens af. Kopen/bewaren en een echte accessoire-economie zijn niet geïmplementeerd. Cadeaukaarten of echte producten worden niet toegezegd.

## De scrollreis

`ScrollReis.tsx` meet de positie van het atelier in het document. Een gedempte scrollwaarde stuurt de camera in de bestaande WebGL-bolshader. De sterren vervagen geleidelijk, wolken verschijnen en een aparte landschaplaag neemt het laatste deel over. Muisparallax, sterren en werelden worden hergebruikt. Het normale scrollen blijft bruikbaar; er is geen verplichte film of wachttijd.

De knop voor rustige weergave pauzeert de omgevingsanimaties en laat ook de sterren- en aardecanvas stil tekenen. De voorkeur voor minder beweging van het apparaat gaat voor. Tijdelijke voorkeuren staan uitsluitend in sessionStorage. ResizeObserver, animatieframes en listeners worden opgeruimd bij vertrek.

## Visuele status — nadrukkelijk geen eindgoedkeuring

De bestaande ruimte- en wereldillustraties zijn hergebruikt. De werkplaats, voertuigen, vakiconen en accessoires hebben samenhangende, eigen SVG-illustraties in plaats van de eerdere emoji-plaatsvervangers. Dit is een werkende grafische tussenversie, niet dezelfde rijke 3D-renderkwaliteit als de conceptafbeelding.

Voor de definitieve beeldkwaliteit moeten nog hoogwaardige, afzonderlijke beelden worden gemaakt voor de werkplaats, voertuigen/bouwfasen, Zappie/accessoires en het kustlandschap. De tijdelijke landing gebruikt het al aanwezige berg-/rivierlandschap `public/achtergrond-wereld.png`, niet het kustlandschap uit de conceptfoto. De architectuur houdt die beelden los van knoppen, tekst en voortgang, zodat vervanging mogelijk is zonder een nieuwe applicatie te bouwen.

## Controle

De GitHub Actions-workflow bouwt de bestaande app en voert `scripts/zappie-preview-test.mjs` uit wanneer dit bestand aanwezig is. De tests gebruiken een tijdelijke lokale preview en een aparte lege/gastomgeving, geen productiegegevens en geen nieuwe leervragen. Screenshots en een JSON-testrapport worden als tijdelijk artifact opgeslagen.

De browsercontrole omvat desktop (1440×1000), tabletformaat (1024×768), mobiel formaat (390×844), normaal scrollen, horizontale overflow, vakbeschikbaarheid, voertuigselectie, accessoires filteren/passen/resetten, routebehoud, handmatige pauze en veranderende systeemvoorkeur voor beweging.

Een geslaagde build is geen visuele goedkeuring. Screenshots moeten ook worden bekeken. De emulatie is geen prestatiemeting op echte schoolapparaten, en de bestaande databaseafhankelijke leer-/beheertests zijn hiermee niet vervangen.
