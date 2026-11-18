# WIJZIGINGEN-ZINNEN-REKENMIX2 — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok, Vormen, Dagen en Tijd, nu voor de gouden les Rekenmix 2 (`squla-rekenmix-mix2-1-gouden`, boterhammen en spiesjes). Rekenmix 2 heeft geen extra les. De oude les (`squla-rekenmix.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit cf73262 en eerder). Geen andere les gebruikt het zinnenbestand van Rekenmix 2 (nagekeken: alleen `squla-rekenmix2-gouden.tsx` en het fouttabel-script lezen `squla-rekenmix2-gouden-zinnen.ts`). De gedeelde bestanden (lof, "nu is het goed", eindzinnen, groet, overgang in `squla-klok-gouden-zinnen.ts`; `squla-rekenmix-gouden-zinnen.ts`; `squla-tellen-*`; `nooit-dubbel.ts`) zijn niet aangeraakt.

**Niet veranderd:** de 15 vragen, de plaatjes, de volgorde, de goede antwoorden en de vragen zelf ("Op welke boterham zit meer kaas?", "Op welk spiesje zit het meeste fruit?"). De fixes van de logica-controle blijven: vraag 1 is nog steeds "Kijk naar de boterham bovenaan. Op welke boterham zit meer kaas? Tik op de goede boterham." (zonder "vinkje", F16), en na elke hint komt de vraag terug (een hint als "Kijk hoeveel banaan er bovenaan zit." staat nooit alleen). Het fouttabel-script controleert allebei.

**Alle varianten op een rij:** FOUTTABEL-squla-rekenmix-mix2-1-gouden.md, §2 tot en met §5.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Daar zit minder kaas op dan bovenaan." en "Daar zit meer fruit op dan bovenaan." tellen als dezelfde zin. Bij een ander plaatje de 2e keer begint de eerste zin anders dan de 1e keer. Bij samen kijken klinken de 3 plaatjes elk in een andere zinsvorm. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd). Les en script gebruiken dezelfde functies (`foutReactie`, `opnieuwZin`, `samenZinnen`, `samenKlaarZin`, `handZin`, `goedReactie` in het zinnenbestand).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Kom, we tellen ze samen. / Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. (van Tellen) | Kom, we kijken samen. / Geeft niks. We kijken samen. / Weet je wat? We kijken samen. / Ik help je even. We kijken samen. / Kom, we gaan ze samen langs. | in deze les wordt niets geteld: Bliepo wijst de plaatjes aan |
| Je koos evenveel kaas als bovenaan. | Jouw boterham lijkt precies op die bovenaan. / Op jouw boterham zit net zoveel kaas als bovenaan. (en 2 andere) | je kiest een boterham, geen kaas |
| Je koos minder kaas dan bovenaan. | Jouw boterham heeft minder kaas dan bovenaan. / Op jouw boterham zit minder kaas dan bovenaan. (en 2 andere) | idem |
| Je koos juist de minste kaas. / Je koos niet de meeste kaas. | Jouw boterham heeft juist de minste kaas. / Jouw boterham heeft niet de meeste kaas. (en varianten) | idem |
| Het is niet de boterham die je koos. | Op jouw boterham zit veel kaas, maar niet de meeste. / Die boterham heeft niet de meeste kaas. | de oude zin was raar en zei niet wat er klopte |
| Je koos weer de boterham die niet klopt. / Je koos weer de boterham die net niet klopt. / Je koos weer het tegenovergestelde. | Je koos weer dezelfde boterham. / Weer deze boterham, zie ik. / Je tikte weer op dezelfde boterham. + een andere uitleg dan de 1e keer ("Er is een boterham met nog meer kaas.") | "die niet klopt" klonk streng, "tegenovergestelde" is te moeilijk |
| Je zoekt de boterham die voller is. (en leger, er precies zo uitziet) | Je zoekt de boterham die voller is dan bovenaan. / We zoeken een boterham met nog meer kaas dan bovenaan. / Meer kaas betekent: voller dan de boterham bovenaan. | zegt nu waarmee je vergelijkt |
| Op welke boterham zit meer kaas? (de vraag na de hint, precies dezelfde zin) | Op welke boterham zit meer kaas, denk je? / Kies nog een keer. Op welke boterham zit meer kaas? / Welke boterham heeft meer kaas dan bovenaan? | de vraag komt terug (15.37), maar nooit precies dezelfde zin; na "… en kies dan." nooit nog eens "Kies" |
| Hier zit de meeste kaas. … Tik op de boterham met de meeste kaas. … Ja, hier zit de meeste kaas. (samen kijken) | Hier zit de meeste kaas. … Tik jij op de goede boterham? … Ja, daar zit de meeste kaas op. (en varianten) | dezelfde zin klonk 2 of 3 keer vlak achter elkaar |
| Kijk, ik wijs hem aan. Hier zit de meeste kaas. (vangnet) | Kijk, ik wijs hem aan. Daar zit de meeste kaas op. / Kijk, deze is het. … / Kijk, ik laat hem zien. … (bij een spiesje: "het", "dit") | "Hier zit …" klonk net al; "hem" bij een spiesje werd "het" |
| Tik op de boterham. (hulphandje, met een willekeurige aanmoediging) | Tik op deze boterham. / Tik maar op deze boterham. / Deze is het. Tik erop. (aanmoediging uit de kiezer) | het handje wijst hem aan: "deze" |
| "Tik op de kaart." aan het eind | Tik op de kaart. / Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | zoals de andere lessen |
| Bij een spiesje kon "de goede spiesje" en "dezelfde spiesje" ontstaan | het goede spiesje / hetzelfde spiesje | lidwoord (het script keurt dit nu) |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| In deze les kijk je hoeveel er op een boterham of een spiesje zit. | blijft, en erbij: Vandaag kijken we hoeveel er op een boterham of een spiesje zit. / We gaan samen kijken waar meer op zit, en waar minder. | warmer ("we"); geen versie is langer |
| Kijk naar de boterham bovenaan. (vóór de vraag) | blijft bij vraag 1; vanaf de 2e vraag ook: Kijk eerst naar de boterham bovenaan. / Bovenaan ligt een boterham. | variatie; de vraag zelf blijft gelijk (3.11) |
| Daar zit minder kaas op dan bovenaan. / Die boterham heeft minder kaas dan bovenaan. (1 per vraag, vast) | 4 varianten, plus bij een ander plaatje de 2e keer: Nu koos je een boterham met minder kaas dan bovenaan. / Deze keer zit er minder kaas dan bovenaan. | variatie; de 2e keer een ander begin |
| Daar zit juist de minste kaas op. | blijft, en erbij: Die boterham heeft juist de minste kaas. / Op jouw boterham zit juist het minst. / Jouw boterham heeft juist de minste kaas. | variatie (4) |
| Kijk hoeveel kaas er bovenaan zit. / Kijk wat er anders is dan bovenaan. / Kijk goed naar de boterham bovenaan. | blijven (allemaal), en erbij: Kijk eerst bovenaan, en dan naar de rest. ("anders" niet bij evenveel) | variatie; geen richting, geen plek |
| Kijk hoeveel kaas er op elke boterham zit. / Kijk naar elke boterham en kies dan. / Kijk nog eens goed naar alle 3 boterhammen. | blijven, en erbij: Bekijk de boterhammen een voor een. | variatie (4) |
| Je zoekt de boterham met de meeste kaas. | blijft, en erbij: De meeste betekent: meer dan op alle andere. / We zoeken de boterham die het volst is. | variatie (3) |
| Hier zit de minste kaas. / Hier zit iets meer kaas. / Hier zit de meeste kaas. | blijven (behalve "iets meer": nu "al wat meer"), en erbij: Op deze boterham zit … / Deze boterham heeft … ; bij vragen met een boterham bovenaan nu vergeleken met bovenaan ("Hier zit minder kaas dan bovenaan.") | variatie; de 3 plaatjes klinken elk anders; de zin past bij de vraag |
| Tik op de boterham met meer kaas dan bovenaan. (nu jij) | blijft als versie (alleen als hij niet net zo klonk), en erbij: Tik jij op de goede boterham? / Nu mag jij tikken. Welke boterham is het? / Weet jij nu welke boterham het is? Tik erop. | niets 2 keer achter elkaar |
| Reactie na goed (3 versies) | 5 versies, zoals: Precies, die boterham is voller dan bovenaan. / Dat klopt, daar zit meer kaas op. Nooit een woord uit de lofzin herhaald ("Precies goed!" en dan "Precies, …"), nooit 2 keer "Ja". | variatie, zoals Plussommen en Meten |
| Je zag waar meer en minder zit. | blijft, en erbij: Mooi gewerkt! Jij ziet goed waar meer of minder op zit. / Je hebt goed gekeken vandaag! Je ziet nu waar het meeste op zit. | vrolijker |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een plaatje dat niet goed is | 4 per plaatje (2e keer, ander plaatje: 6, met een ander begin dan de 1e keer) |
| Hint | 3 of 4 per soort vraag |
| De vraag opnieuw na de hint | 3 per vraag |
| Uitleg bij de 2e keer | 3 per soort vraag |
| Hetzelfde plaatje 2 keer | 3 + 2 andere uitleggen |
| "Kom, we kijken samen." | 5 |
| Samen: wat Bliepo bij elk plaatje zegt | 3 per plaatje |
| Samen: nu het kind / hulphandje / klaar / Bliepo deed het zelf | 4 / 3 (plus 5 aanmoedigingen) / 3 / 3 |
| Reactie na lof | 5 per vraag |
| Begin, slot, "Tik op de kaart." | 3, 3, 3 |
| Lof, korte bevestiging, eindzin, overgang | het vaste rijtje uit BLIEPO-KARAKTER.md (niet veranderd) |

## De fouttabel is strenger gemaakt (zoals bij Tellen, Meer-minder en Tijd)

`npx tsx scripts/fouttabel-rekenmix2-gouden.ts` loopt nu ALLE varianten na (534 varianten in de fouttabel, ruim 450 verschillende zinnen):

- **Verklappen (15.17):** geen hint noemt een richting (meer, minder, voller, evenveel, precies …) of een plek (links, rechts, midden, eerste, laatste, vlak naast, bijna, dichtbij, tussen). Na de eerste zin blijven er 2 plaatjes over, altijd met het goede erbij. De hint eindigt nooit met een eigen vraag.
- **Waarheid:** elke eerste zin (ook "Nu koos je …") is nagelopen tegen het gekozen plaatje; elke zin bij samen kijken tegen het plaatje dat het handje aanwijst; elke reactie na goed en elk "klaar" tegen de vraag (495 beweringen).
- **Altijd een vraag of opdracht (15.37, F16):** de vraag na de hint, "nu jij", het hulphandje en "Tik op de kaart" zijn een vraag of een opdracht; het woord "vinkje" komt nergens voor; vraag 1 is gelijk gebleven.
- **Tekstvak (harde eis):** elk stuk hooguit 110 tekens; na elke hint passen minstens 2 versies van de vraag. Die eisen gaan vooraf uit de lijst, niet als wens aan de kiezer.
- **Taal:** geen woord van de niet-lijst, geen "fout", geen cijfer zonder kleur, geen verkeerd lidwoord ("de goede spiesje", "dezelfde spiesje").
- **Nooit 2 keer hetzelfde:** de kiezer is nagespeeld in 2.000 hele lessen (30.000 vragen, bijna 35.000 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een woord 2 keer in 1 reactie, 0 keer hetzelfde begin bij de 2e keer met een ander plaatje, 0 keer dezelfde zin 2 keer bij 1 vraag (behalve de vraag zelf, die na de hint mag terugkomen), "weer" alleen bij hetzelfde plaatje.

## Zinnen van Synthesis

Synthesis heeft geen les met plaatjes zonder getal (More or Less werkt met getallen). Er is geen les-eigen zin van Synthesis overgenomen. Alleen de algemene tutorzin "geeft niks" (bij de 2e keer, zoals in Tellen, Meten en Tijd) komt van Synthesis: "Geeft niks. We kijken samen."

## Niet gedaan, met reden

- **De vragen zelf afwisselen:** niet gedaan (3.11, 15.22). Alleen de kijkzin ervoor en de vraag NA de hint wisselen.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, overgang):** niet veranderd; die zijn van alle gouden lessen samen.
- **`ZIN.samenKijk` ("Kijk, we gaan ze samen langs."):** werd al niet gezegd; laten staan (harde regel 3). Een bijna gelijke zin ("Kom, we gaan ze samen langs.") is nu 1 van de versies van "Kom, we kijken samen.".
- **De oude les `squla-rekenmix.tsx` en de gedeelde zinnenbestanden:** niet aangeraakt.
