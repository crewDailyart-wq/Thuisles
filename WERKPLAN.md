# Werkplan

Wat er gebouwd wordt en in welke volgorde. Per onderwerp de titels zoals het
kind ze ziet, met de bolletjes en wat het kind er doet.

## Groep 4 – Erafsommen – Aftrekken tot en met 15

Alle getallen 0 tot en met 15; de uitkomst komt nooit onder 0. Gewone vragen,
zoals bij Optellen tot en met 20: het kind telt, rekent en typt. Er wordt niets
weggetikt en er staat geen rekenrek bij.

| # | Titel | Bolletjes | Wat het kind doet |
|---|-------|-----------|-------------------|
| 1 | Een minsom bij plaatjes | ● | Ziet twee groepjes van dezelfde voorwerpen naast elkaar: links hoeveel het er waren, rechts hoeveel er vanaf gaan. Vult daaronder de hele som in: ▢ − ▢ = ▢. |
| 2 | Wegstrepen tot en met 15 | ● | Ziet een groep voorwerpen in rijtjes van vijf waarvan er al een paar een rood kruis hebben. Telt wat er overblijft en typt dat in. Het tikt zelf niets weg. |
| 3 | Aftrekken tot en met 15 | ●● | De kale som: 13 − 5 = ▢. |
| 4 | Aftrekken met plaatjes tot en met 15 | ●● | "Hoeveel appels blijven er over?" Daaronder groep plaatjes − groep plaatjes = ▢, zonder getallen. |
| 5 | Aftrekken met plaatjes en getallen tot en met 15 | ●●● | Hetzelfde, met het getal onder elke groep plaatjes. |
| 6 | Sommen en uitkomsten koppelen | ●●●● | Sleept elke uitkomst naar de som waar hij bij hoort; tikken werkt ook. |

Staat klaar in de database: het domein Erafsommen, het onderwerp "Aftrekken
tot en met 15", de zes leerdoelen met hun sjablonen en per titel vijftien
gepubliceerde vragen — evenveel als bij Optellen tot en met 20.

### Daarna

De andere onderwerpen van Erafsommen volgen nog:

- Basisvaardigheden
- Aftrekken tot en met 20
- Aftrekken tot en met 50
- Aftrekken tot en met 100
- Meerkeuzevragen
- Vleksommen

## Bouwstenen

Onderdelen die één keer gebouwd zijn. Het zelf wegtikken en het rekenrek
worden op dit moment nergens gebruikt; ze blijven staan voor later.

- **Wegtikken** (`src/components/oefenen/Wegtikken.tsx`) — een groep plaatjes
  in rijtjes van vijf, met een rood kruis op de plaatjes die eraf zijn. Bij
  Erafsommen tekent dit alleen; het aantikken door het kind en de stand
  "vanzelf" staan uit en worden nergens gebruikt.
- **Rekenrek** (`src/components/oefenen/Rekenrek.tsx`) — twee staafjes met
  tien kralen, vijf rode en vijf witte. De kralen die meedoen staan links, de
  rest lichter aan de rechterkant. De kralen zelf komen uit dezelfde tekening
  als Kralen tellen. Wordt op dit moment nergens gebruikt.
