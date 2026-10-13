# Zappie — goedgekeurde illustraties integreren

> **Bijgewerkt 13 oktober 2026.** De beelden staan er nu in
> (`public/assets/zappie/illustraties/`, gemaakt met
> `scripts/maak-zappie-illustraties.mjs`) en de startpagina is daarna opnieuw
> opgebouwd volgens het derde ontwerp. De actuele beschrijving staat in
> `ZAPPIE.md`, "Het derde ontwerp". Hieronder het verslag van PR #4 zoals het
> was.

## Scope

De eigenaar heeft op 13 oktober 2026 vier renders goedgekeurd: het eigen wereldeiland, de robotwerkplaats met onderzeeër/vliegtuig/raket, het atelier met een leeg paspodium en het kustlandschap. Deze wijziging koppelt die beelden aan de bestaande kinderstartpagina `/zappie`; de oefeningen, profielkeuze, datalaag en tokenregels worden niet gewijzigd.

De code blijft op `feature/zappie-cinematische-homepage-20261013` tot de beelden in de repository staan en de controles zijn geslaagd. Geen productiepublicatie door deze commit.

## Afbeeldingspakket

Plaats de volledige map `illustraties` uit het in de chat aangeleverde `zappie-goedgekeurde-illustraties.zip` in `public/assets/zappie/`. Vier basisnamen: `eigen-wereld`, `werkplaats`, `atelier`, `kust`. Elke afbeelding heeft 720- en 1440-pixelvarianten in AVIF en WebP. `manifest.json` bevat afmetingen, groottes en SHA-256-controlegetallen. `BRON.md` beschrijft de herkomst.

Het pakket bevat zestien beeldbestanden, circa 4,73 MiB voor alle varianten samen. De browser kiest één passend bestand per weergegeven beeld. Er zijn geen kleurfilters gebruikt om de goedgekeurde beelden te veranderen. De bronafbeeldingen zijn vlakke renders, geen losse 3D-modellen of animatierigs.

## Plaatsing en interactie

- `Illustratie.tsx`: herbruikbaar `picture` met AVIF/WebP, intrinsieke verhouding en responsive maten.
- `Startscherm.tsx`: het goedgekeurde eiland vult de grote kaart Jouw wereld. De link en voortgangseffecten blijven bestaan.
- `WerkplaatsIllustratie.tsx`: toont de goedgekeurde hal. De bestaande voertuigselectie laat een zachte focusrand naar de betreffende plek bewegen. De voertuigen worden hiermee niet speelbaar en de afbeelding is geen echte bouwsimulatie.
- `OntdekkingsReis.tsx`: integreert de werkplaatshal en het atelier. De bestaande SVG-robot, accessoirefilters, passen en herstellen blijven als interactieve laag behouden. De originele lege podiumplek wordt gebruikt voor de robot.
- `ScrollReis.tsx`: de goedgekeurde kust verschijnt als eindbestemming in de bestaande parallaxreis. Dezelfde kust verschijnt groot in de footer.
- `reis-illustraties.css`: bewaart de blauwe/gouden beeldkleuren en houdt bediening leesbaar. Kleine gloedeffecten respecteren de bewegingsvoorkeur.

De afzonderlijke accessoireproducten en de interactieve robot blijven vooralsnog de bestaande SVG-assets. Accessoireaankopen, serveropslag van outfits en complete voertuiggames zijn geen onderdeel van deze afbeeldingsintegratie.

## Publicatiecontrole

`npm run build` controleert eerst alle zestien bestanden met `scripts/check-zappie-illustraties.mjs`. Bij ontbrekende bestanden, verkeerde grootte of onjuist controlegetal stopt de build, zodat een versie met kapotte afbeeldingen niet wordt gepubliceerd. Verwijder deze controle niet om toch te kunnen deployen.

Lokaal uitgevoerd: verificatie van het beeldpakket, TSX-syntaxis/transpilatie van de aangepaste componenten, CSS-parsecontrole en JavaScript-syntaxcontrole. Een volledige Next-productiebuild en browsercontrole konden in de lokale werkcontainer niet worden uitgevoerd: npm-pakketten ontbreken en zijn daar niet via het netwerk op te halen. Dit is geen geslaagde eindtest of visuele goedkeuring.

Na upload: volledige build en de bestaande Playwright-controle op desktop, tablet en mobiel. Bekijk ook de screenshots en controleer scherpe beelden, leesbare tekst, raakbare knoppen, normale scroll, rustige weergave, ongewijzigde missies en paskamerfuncties. Publiceer pas daarna naar de bestaande Railway-service. Laat de database, `/data`-volume, accountinstellingen en Godot-opslag ongemoeid.
