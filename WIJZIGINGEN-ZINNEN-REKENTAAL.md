# WIJZIGINGEN-ZINNEN-REKENTAAL — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok en Vormen, nu voor de gouden les Rekentaal (`squla-rekentaal-gouden`, "Groot en klein, vol en leeg"). Deze les heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-rekentaal.tsx`), het vlak (`squla-rekentaal-gouden-vlak.tsx`) en de plaatjes (`rt-*.png`) zijn niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 2a02c8b en eerder). Geen andere les gebruikt dit zinnenbestand (alleen de les zelf en het fouttabel-script). De gedeelde rijtjes (lof, "nu is het goed", eindzinnen, groet, de zin als de denkfout niet duidelijk is) komen uit `squla-klok-gouden-zinnen.ts` en zijn niet aangeraakt.

**Niet veranderd:** de 16 vragen, de voorwerpen, hun maten, de keuzes, de volgorde, de goede antwoorden en de denkfouten. De vraagzinnen zijn die van de oude les; alleen de kijk-zin ervoor wisselt ("Kijk naar de weegschaal." / "Kijk goed naar de weegschaal." / "Hier staat een weegschaal.") en de 2e keer op volgorde direct na de 1e begint met "En nu de bekers." (zie Deel A).

**Alle varianten op een rij:** FOUTTABEL-squla-rekentaal-gouden.md (§4).

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen en Vormen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos deze pannenkoek." en "Je koos deze beker." tellen als dezelfde zin (de voorwerpen en de rekenwoorden zijn wisselwoorden). Als het kan begint de volgende zin ook anders. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

Harde eisen zitten niet als wens in de kiezer, maar worden vooraf uit het rijtje gehaald: elk stuk past in het tekstvak (hooguit 110 tekens), en in 1 reactie komt geen woord 2 keer voor (behalve kleine woordjes en de woorden van de vraag zelf; de herhaalcontrole die bij Rekentaal is bedacht, nu ook bij het kiezen).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les leer je rekenwoorden, zoals groot en klein, vol en leeg. | Vandaag leren we rekenwoorden. Kijk: een grote en een kleine pannenkoek. / We gaan samen rekenwoorden leren, zoals groot en klein, vol en leeg. / Vandaag leren we woorden als groot en klein, vol en leeg. | warmer ("we"), zoals een juf begint; de 2 pannenkoeken staan echt in beeld |
| Kijk van rand tot rand hoe breed ze zijn. Welke pannenkoek is groter? (na de 1e fout: precies dezelfde vraagzin als net) | Kijk van rand tot rand hoe breed ze zijn. Welke pannenkoek is groter, denk je? / … Tik op de pannenkoek die groter is. / … Kies de pannenkoek die groter is. | de vraag komt terug (15.37), maar nooit precies dezelfde zin als de 1e keer; zo bij alle 14 kiesvragen ("Wat is zwaarder, denk je?", "Tik op het glas dat half vol is.", …) |
| Begin met de kleinste en pak dan steeds een grotere. Zet de appels van klein naar groot. (altijd dezelfde opdracht erachter) | … Zet de appels van klein naar groot. / … Zet ze nu van klein naar groot. / … Tik ze aan van klein naar groot. | variatie in de opdracht na de hint (F16 blijft: er staat altijd wat het kind doet) |
| Kijk naar de weegschaal. Wat is zwaarder? → Kijk naar de weegschaal. Wat is lichter? (vraag 5 en 6 direct na elkaar) | Kijk naar de weegschaal. / Kijk goed naar de weegschaal. / Hier staat een weegschaal. (dan de vraag van de oude les) | dezelfde zin 2 keer achter elkaar |
| Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. (vraag 16, direct na precies dezelfde zinnen bij de appels) | En nu de bekers. Zet ze ook op volgorde, van klein naar groot. Tik eerst op de kleinste beker. | 3 keer precies dezelfde zin achter elkaar; de schooltermen (op volgorde, van klein naar groot, de kleinste) blijven |
| Ik help je met deze. + Kom, we kijken samen. (vangnet bij op volgorde) | Ik help je met deze. / Kom, we zetten ze samen op volgorde. / Geeft niks. We doen het samen. (en dan meteen de eerste stap) | 2 keer "samen" achter elkaar (15.29) |
| De slierten beginnen bij dezelfde streep. (bij samen voordoen, ook als de hint net "Ze beginnen bij dezelfde streep." zei) | blijft, maar Bliepo zegt hem niet als de hint het bij deze vraag al zei; erbij: Kijk, de slierten beginnen op dezelfde plek. | niet 2 keer hetzelfde bij 1 vraag (keuring Rekentaal; zo ook bij de broodjes) |
| Deze kant zakt naar beneden. / De andere kant gaat omhoog. (bij vraag 5 én 6 precies dezelfde zinnen) | blijven, en erbij: Kijk, de meloen hangt laag. / De appel gaat omhoog. (vraag 6: de zak meel, de aardbei) | samen voordoen bij vraag 5 en 6 gaf 2 keer dezelfde zinnen achter elkaar |
| Kijk naar allebei de bekers. / Kijk naar alle manden. / Kijk naar alle appels. | Kijk goed naar allebei de bekers. / Kijk goed naar alle manden. / Kijk goed naar alle appels. | warmer; nu 1 vorm voor alle vragen |
| Reactie na de lof: per vraag een eigen rijtje (dezelfde zin kon bij 2 vragen achter elkaar komen: "Ja, deze beker is kleiner." → "Ja, dit glas is vol.") | 1 rijtje-volgorde voor de hele les; nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen | geleerd bij de keuring Rekenmix |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu erbij | Waarom |
|---|---|---|
| Je koos deze pannenkoek. Hij is kleiner dan de andere. (1 eerste zin per fout antwoord) | Deze pannenkoek? Die is kleiner dan de andere. / Je tikte op de kleine pannenkoek. (zo bij alle 29 foute antwoorden 3 versies; op de weegschaal: "De appel? Die gaat omhoog." / "Je tikte op de appel. Die kant staat hoog.") | variatie (3); wat het kind koos wordt maar 1 keer genoemd |
| 2 hints per vraag | 3 of 4 per vraag, bijvoorbeeld: Kijk goed naar allebei de pannenkoeken. / Kijk welke beker minder hoog komt. / Kijk goed in allebei de glazen. / Kijk welke schaal lager hangt. / Zoek de schaal die het laagst is. / Volg elke sliert met je ogen tot het eind. / Kijk welke mand het hoogst komt. | variatie; en na elke eerste zin blijven er na "geen woord 2 keer" altijd minstens 2 over |
| 1 uitleg bij de 2e fout | 2 tot 4, bijvoorbeeld: Een grotere pannenkoek is breder. / Een kleine beker is niet zo hoog en niet zo breed. / In een vol glas komt het sap tot bovenaan. / Hoe zwaarder iets is, hoe lager het hangt. / Er staat een mand die nog groter is. / Bij half vol komt het sap tot het midden. | variatie; bij de 2e fout nooit dezelfde zin als bij de 1e |
| Je koos weer deze pannenkoek. | Weer deze pannenkoek, zie ik. / Je tikte weer op deze pannenkoek. (op volgorde: Weer dezelfde volgorde, zie ik.) | variatie (3) |
| Nu koos je … (bij een ander fout antwoord de 2e keer) | ook: Nu tikte je op … / Nu begon je met … / Nu zette je … | zo past het bij elke eerste zin |
| Je begon met deze appel. Er ligt nog een kleinere. | Deze appel eerst? Er ligt nog een kleinere. / Je zette eerst deze appel. Maar er ligt nog een kleinere. (bekers: "staat") | variatie (3) |
| Je zette ze van groot naar klein. | Van groot naar klein? Dat is net andersom. / De grootste staat nu vooraan. | variatie (3) |
| Je zette de grootste in het midden. | De grootste staat nu in het midden. / In het midden staat nu de grootste. | variatie (3) |
| Tik steeds op de kleinste die nog over is. / Kijk welke het kleinst is. / Begin met de kleinste en pak dan steeds een grotere. | Pak steeds de kleinste die nog over is. / Kijk na elke tik welke nu het kleinst is. / Kijk goed welke appel het kleinst is. / De kleinste komt eerst, de grootste als laatste. / Begin bij de kleinste. Pak daarna steeds een grotere. | variatie (3 per denkfout) |
| De kleinste hoort vooraan. / Na de kleinste komt eerst de middelste. / Van klein naar groot: de kleinste staat vooraan. | Van klein naar groot begint altijd met de kleinste. / De middelste hoort direct na de kleinste. / Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere. / De kleinste hoort helemaal aan het begin. | variatie |
| Weer stond de kleinste niet vooraan. + Van klein naar groot: je begint links. | Ook nu stond de kleinste niet vooraan. + Je begint links, met de kleinste. | variatie (2) |
| Kom, we kijken samen. / We zoeken het samen. / Kom, samen lukt het. (om de beurt) | Ik help je even. We kijken samen. / Geeft niks. We zoeken het samen. (nu met de kiezer) | variatie (5); "Ik help je even" is van Synthesis |
| Samen: elke stap 1 zin ("Deze mand is klein.", "Die is groter.", "En deze is het grootst.") | elke stap 2 versies ("Kijk, deze mand is klein." / "Die is al groter." / "En deze is nog groter: het grootst.") | variatie |
| Tik jij op de grote pannenkoek? (de kleine stap) | Tik jij erop? / Nu jij! Tik in het rode rondje. (op volgorde: Nu jij! Tik op de grootste appel. / Tik jij in het rode rondje?) | variatie (3); het rondje laat zien waar |
| Ja, deze pannenkoek is groter. (samen klaar) | Precies! Hij is breder dan de andere. / Zo is het: deze pannenkoek is groter. (op volgorde: Precies, eerst de kleinste en als laatste de grootste. / Zo is het: klein, groter, het grootst.) | variatie (3); Bliepo kiest er een die niet herhaalt wat hij net bij de stappen zei |
| Kijk, deze pannenkoek is groter. (vangnet) | Kijk, hij is breder dan de andere. | variatie (2) |
| Reactie na lof: 5 zinnen per vraag | erbij: Precies, deze pannenkoek is groter. / Dat klopt: hij is breder dan de andere. (op volgorde: Precies, zo staan ze goed. / Dat klopt: de grootste staat achteraan.) | variatie (7); "Precies" is van Synthesis |
| Tik in het rode rondje. (hulphandje) | Tik maar in het rode rondje. / Hier is het. Tik in het rode rondje. | variatie (3) |
| Tik op een appel. Die komt dan hier. (hulphandje op volgorde) | Tik maar op een appel. Die komt dan hier. / Hier is een lege plek. Tik op een appel. | variatie (3) |
| Je bent goed bezig. / Jij kunt dit. (aanmoediging bij het hulphandje) | Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (5), zoals de andere lessen |
| De keuken is klaar. + Nu gaan we picknicken in het park. | Klaar in de keuken! + Kom, we gaan picknicken in het park. / Dat was de keuken. + Nu gaan we naar het park. Daar picknicken we. | variatie (3) |
| Nu ken je veel rekenwoorden. | Jij kent nu veel rekenwoorden. / Nu weet jij wat al die rekenwoorden betekenen. | variatie (3) |
| Tik op de kaart. | Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (3), zoals de andere lessen |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een keuze die niet goed is | 3 per fout antwoord |
| Hint | 3 of 4 per vraag (op volgorde 3 per denkfout) |
| Na de hint: de vraag in andere woorden / de opdracht | 2 of 3 (nooit precies de vraagzin van de 1e keer) |
| Uitleg bij de 2e keer | 2 tot 4 |
| "Je koos weer …" | 3 (op volgorde 2) |
| "Weer …" (2 keer dezelfde denkfout, alleen op volgorde) | 2 + 2 uitleg |
| Kijk-zin vóór de vraag (weegschaal, slierten) | 3 / 2 |
| Samen voordoen: begin, elke stap, de kleine stap, klaar, vangnet | 5, 2, 3, 3, 2 |
| Hulphandje: aanmoediging / wat te doen | 5 / 3 |
| Zin na lof | 7 |
| Begin, picknick, slot, kaart, vangnet op volgorde | 3 elk |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (niet aangeraakt) |

## De fouttabel is strenger gemaakt (zoals bij Tellen, Vormen en Klok)

Het fouttabel-script (`scripts/fouttabel-rekentaal-gouden.ts`) loopt nu ALLE varianten na, niet alleen 1 vaste zin per rij (858 varianten, 492 beweringen, ruim 1.000 combinaties):

- **Elke zin van elke variant moet het script kennen** en moet waar zijn voor die vraag en dat antwoord (wat is groter, wat hangt hoger, waar zit sap, wat staat vooraan). Een zin die het script niet kent, telt als fout.
- **Verklappen (15.17):** geen eerste zin, geen hint en geen vraag-opnieuw noemt het goede voorwerp; het rondje staat nooit om het antwoord; bij 3 voorwerpen blijven er na de eerste zin 2 over.
- **Niets dubbel (15.29):** in elke combinatie die de les kan kiezen (eerste zin + hint + vraag; eerste zin + uitleg) komt geen woord 2 keer voor; achter elke eerste zin passen minstens 2 hints, 2 vragen en 2 uitleggen (anders hoort het kind toch 2 keer dezelfde); 2 varianten van 1 rijtje zijn nooit dezelfde zin.
- **Altijd een vraag of opdracht (15.37, F16):** na elke hint een vraag of "Tik …"/"Kies …"/"Zet …", en nooit precies dezelfde vraagzin als de 1e keer.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", nooit het woord "vinkje", geen "vergelijk", geen kaal cijfer.
- **Alles past in het tekstvak:** elk stuk hooguit 110 tekens (ook de begin-zin met de groet, hint + vraag samen, en het hulphandje met de aanmoediging).
- **Nooit 2 keer hetzelfde:** de kiezer wordt 20.000 keer nagespeeld (ruim 31.000 reacties) met dezelfde functie als de les (`foutReactie`): 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een woord 2 keer in 1 reactie, 0 keer bij de 2e keer een zin van de 1e keer, altijd een vraag of opdracht na de hint.

## Zinnen van Synthesis, in het Nederlands (besluit Sara, 17 november 2026)

Synthesis heeft geen les over groot en klein, vol en leeg (KOPPELING.md §12). Alleen algemene zinnen zijn overgenomen:

| Synthesis zegt | Bij ons nu | Waar |
|---|---|---|
| ik help je met deze | Ik help je met deze. / Ik help je even. We kijken samen. | vangnet op volgorde, 2e keer mis |
| precies | Precies! Hij is breder dan de andere. / Precies, deze pannenkoek is groter. | samen klaar, zin na lof |

## Niet gedaan, met reden

- **De vraagzinnen zelf afwisselen** ("Welke pannenkoek is groter?"): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud van de Squla-les blijft gelijk (15.22). Alleen de kijk-zin ervoor wisselt, en de 2e keer op volgorde begint met "En nu de bekers.".
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt (`squla-klok-gouden-zinnen.ts`, niet aangeraakt).
- **De plaatjes en het vlak** (`rt-*.png`, `squla-rekentaal-gouden-vlak.tsx`): niet aangeraakt (zojuist opnieuw met Magnific gemaakt).
- **De oude les `squla-rekentaal.tsx`:** niet aangeraakt (harde regel 8 en de afspraak: alleen deze les).

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-rekentaal-gouden | nagekeken weg | Nagekeken: ze staan echt van klein naar groot. | Zie je, de kleinste staat vooraan. |
| squla-rekentaal-gouden | nagekeken weg | Nagekeken: ${wie} is echt ${v.woord}. | Zie je, ${v.woord}: dat is ${wie}. |
